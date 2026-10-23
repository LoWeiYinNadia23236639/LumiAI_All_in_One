"use client";

import { useTranslations, useLocale } from "next-intl";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Send, MessageSquare, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/contexts/auth-context";
import { getSupabaseClient } from "@/lib/supabase/client";
import { callApi } from "@/lib/api/client";
import { formatRelativeTime } from "@/lib/relative-time";

const POLL_INTERVAL_MS = 10_000;
const THREAD_LIMIT = 100;

interface LastMessage {
  id: string;
  body: string;
  sender_id: string;
  created_at: string;
}

interface ConversationItem {
  id: string;
  campaign_id: string;
  brand_id: string;
  creator_id: string;
  campaignTitle: string;
  otherName: string;
  otherInitials: string;
  lastMessage: LastMessage | null;
  unreadCount: number;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read: boolean;
  created_at: string;
}

function initialsOf(name: string): string {
  return (
    name
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

function MessagesInner() {
  const t = useTranslations("messages");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(
    searchParams.get("conversation")
  );
  const [thread, setThread] = useState<MessageRow[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedIdRef = useRef<string | null>(selectedId);
  selectedIdRef.current = selectedId;

  const loadConversations = useCallback(async () => {
    const supabase = getSupabaseClient();
    const { data: convRows } = await supabase
      .from("conversations")
      .select(
        "id, campaign_id, brand_id, creator_id, campaigns(title), brand:profiles!conversations_brand_id_fkey(name), creator:profiles!conversations_creator_id_fkey(name)"
      )
      .order("created_at", { ascending: false });
    const base = (convRows ?? []) as unknown as {
      id: string;
      campaign_id: string;
      brand_id: string;
      creator_id: string;
      campaigns: { title: string } | null;
      brand: { name: string } | null;
      creator: { name: string } | null;
    }[];

    const items = await Promise.all(
      base.map(async (conv) => {
        const { data: lastRows } = await supabase
          .from("messages")
          .select("id, body, sender_id, created_at")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1);
        const { count: unread } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .eq("read", false)
          .neq("sender_id", user?.id ?? "");
        const other =
          conv.brand_id === user?.id
            ? (conv.creator ?? null)
            : (conv.brand ?? null);
        const otherName = other?.name ?? "—";
        return {
          id: conv.id,
          campaign_id: conv.campaign_id,
          brand_id: conv.brand_id,
          creator_id: conv.creator_id,
          campaignTitle: conv.campaigns?.title ?? "",
          otherName,
          otherInitials: initialsOf(otherName),
          lastMessage: (lastRows?.[0] ?? null) as LastMessage | null,
          unreadCount: unread ?? 0,
        } satisfies ConversationItem;
      })
    );

    items.sort((a, b) =>
      (b.lastMessage?.created_at ?? "").localeCompare(a.lastMessage?.created_at ?? "")
    );
    setConversations(items);
    return items;
  }, [user?.id]);

  const loadThread = useCallback(
    async (conversationId: string) => {
      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(THREAD_LIMIT);
      const rows = (data ?? []) as unknown as MessageRow[];
      setThread(rows);
      // Mark the other party's messages as read (optimistic + server)
      if (rows.some((m) => m.sender_id !== user?.id && !m.read)) {
        setThread((prev) =>
          prev.map((m) => (m.sender_id !== user?.id ? { ...m, read: true } : m))
        );
        void callApi("/api/messages/read", { conversation_id: conversationId }).catch(
          () => {}
        );
      }
      return rows;
    },
    [user?.id]
  );

  // Initial load
  useEffect(() => {
    if (!user) return;
    (async () => {
      const items = await loadConversations();
      setIsLoading(false);
      const paramId = selectedIdRef.current;
      if (paramId && items.some((c) => c.id === paramId)) {
        void loadThread(paramId);
      } else if (items.length > 0) {
        selectConversation(items[0].id);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Polling: conversation list + open thread
  useEffect(() => {
    if (!user) return;
    const timer = setInterval(() => {
      void loadConversations().then((items) => {
        const open = selectedIdRef.current;
        if (open && items.some((c) => c.id === open)) {
          void loadThread(open);
        }
      });
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [user, loadConversations, loadThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  const selectConversation = (id: string) => {
    setSelectedId(id);
    router.replace(`/${locale}/messages?conversation=${id}`, { scroll: false });
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
    void loadThread(id);
  };

  const sendMessage = async () => {
    const text = input.trim();
    const convId = selectedIdRef.current;
    if (!text || !convId || sending) return;
    setSending(true);
    try {
      const result = await callApi<MessageRow>("/api/messages", {
        conversation_id: convId,
        body: text,
      });
      setThread((prev) => [...prev, result]);
      setInput("");
      setConversations((prev) =>
        prev
          .map((c) =>
            c.id === convId
              ? {
                  ...c,
                  lastMessage: {
                    id: result.id,
                    body: result.body,
                    sender_id: result.sender_id,
                    created_at: result.created_at,
                  },
                }
              : c
          )
          .sort((a, b) =>
            (b.lastMessage?.created_at ?? "").localeCompare(
              a.lastMessage?.created_at ?? ""
            )
          )
      );
    } catch {
      // keep the draft so the user can retry
    }
    setSending(false);
  };

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId]
  );

  const messageTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

  return (
    <main className="min-h-screen bg-cream pt-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Sidebar */}
          <div className="w-80 border-r bg-paper flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">{t("messages")}</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {!isLoading && conversations.length === 0 && (
                <div className="p-6 text-center">
                  <MessageSquare className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm text-neutral-500 mb-4">{t("emptyConversations")}</p>
                  <Link href="/marketplace/campaigns">
                    <Button size="sm" variant="outline">
                      {t("browseCampaigns")}
                    </Button>
                  </Link>
                </div>
              )}
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`w-full p-4 flex gap-3 text-left transition-colors border-b ${
                    selectedId === conv.id
                      ? "bg-primary-soft border-l-4 border-l-primary"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-cream font-bold flex-shrink-0">
                    {conv.otherInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium truncate">{conv.otherName}</h4>
                      {conv.lastMessage && (
                        <span className="text-xs text-neutral-400 shrink-0">
                          {formatRelativeTime(conv.lastMessage.created_at, locale)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 truncate flex items-center gap-1">
                      <Megaphone className="w-3 h-3 shrink-0" />
                      {conv.campaignTitle}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-sm truncate ${
                          conv.unreadCount > 0
                            ? "font-medium text-neutral-900"
                            : "text-neutral-500"
                        }`}
                      >
                        {conv.lastMessage
                          ? conv.lastMessage.body
                          : t("noMessagesYet")}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary text-cream text-[10px] font-bold flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col bg-paper">
            {selected ? (
              <>
                {/* Header */}
                <div className="border-b px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link href="/analytics" className="lg:hidden">
                      <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                    </Link>
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-cream font-bold">
                      {selected.otherInitials}
                    </div>
                    <div>
                      <h3 className="font-semibold">{selected.otherName}</h3>
                      <Link
                        href={`/marketplace/campaigns/${selected.campaign_id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {selected.campaignTitle}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                  {thread.length === 0 && (
                    <p className="text-center text-sm text-neutral-400 py-10">
                      {t("startConversation")}
                    </p>
                  )}
                  {thread.map((msg, index) => {
                    const mine = msg.sender_id === user?.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.02, 0.2) }}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            mine
                              ? "bg-primary text-cream rounded-br-sm"
                              : "bg-gray-100 text-neutral-900 rounded-bl-sm"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-line break-words">
                            {msg.body}
                          </p>
                          <p
                            className={`text-[10px] mt-1 ${
                              mine ? "text-cream/70" : "text-neutral-400"
                            }`}
                          >
                            {messageTime(msg.created_at)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          void sendMessage();
                        }
                      }}
                      placeholder={t("typeMessage")}
                      maxLength={2000}
                      className="flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      onClick={() => void sendMessage()}
                      isLoading={sending}
                      disabled={!input.trim()}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {tc("send")}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <MessageSquare className="w-14 h-14 text-neutral-300 mb-4" />
                <p className="text-neutral-500">{t("selectConversation")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function MessagesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-cream pt-16 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </main>
      }
    >
      <MessagesInner />
    </Suspense>
  );
}

export default function MessagesPageWrapper() {
  return (
    <AuthGuard>
      <MessagesPage />
    </AuthGuard>
  );
}
