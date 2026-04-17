"use client";

import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Send, MoreVertical, Phone, Video, Info, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth-guard";

const conversations = [
  {
    id: "conv-1",
    contact: { name: "Glow Skincare", avatar: "GS", avatarColor: "from-green-400 to-emerald-500", status: "online", lastActive: "Active now" },
    lastMessage: { text: "We love your portfolio! Are you available for a campaign next month?", time: "10 min ago", unread: true, sender: "them" },
    context: "Summer Sunscreen Launch",
  },
  {
    id: "conv-2",
    contact: { name: "Sarah Chen", avatar: "SC", avatarColor: "from-pink-400 to-rose-500", status: "offline", lastActive: "2 hours ago" },
    lastMessage: { text: "Thanks for the offer! Could we discuss the deliverables in more detail?", time: "2 hours ago", unread: false, sender: "them" },
    context: "Product Review Campaign",
  },
  {
    id: "conv-3",
    contact: { name: "TechMaster Pro", avatar: "TM", avatarColor: "from-violet-400 to-purple-500", status: "online", lastActive: "Active now" },
    lastMessage: { text: "Contract sent. Please review and sign when ready.", time: "1 day ago", unread: false, sender: "me" },
    context: "Gaming Headset Review",
  },
];

const mockMessages: Record<string, { id: string; text: string; sender: "me" | "them"; time: string }[]> = {
  "conv-1": [
    { id: "1", text: "Hi! I'm interested in your Summer Sunscreen campaign.", sender: "me", time: "11:30 AM" },
    { id: "2", text: "We love your portfolio! Are you available for a campaign next month?", sender: "them", time: "11:41 AM" },
  ],
  "conv-2": [
    { id: "1", text: "Hi Sarah, we'd love to work with you on our new launch.", sender: "me", time: "9:00 AM" },
    { id: "2", text: "Thanks for the offer! Could we discuss the deliverables in more detail?", sender: "them", time: "9:15 AM" },
  ],
  "conv-3": [
    { id: "1", text: "Contract sent. Please review and sign when ready.", sender: "me", time: "Yesterday" },
  ],
};

function MessagesPage() {
  const t = useTranslations("messages");
  const tc = useTranslations("common");
  const [selectedId, setSelectedId] = useState<string>(conversations[0].id);
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selected = conversations.find((c) => c.id === selectedId)!;
  const currentMessages = messages[selectedId] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now().toString(), text: input, sender: "me" as const, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages((prev) => ({ ...prev, [selectedId]: [...(prev[selectedId] || []), newMsg] }));
    setInput("");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white pt-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Sidebar */}
          <div className="w-80 border-r bg-white flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">{t("messages")}</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full p-4 flex gap-3 text-left transition-colors border-b ${
                    selectedId === conv.id ? "bg-violet-50 border-l-4 border-l-violet-500" : "hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${conv.contact.avatarColor} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                    {conv.contact.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium truncate">{conv.contact.name}</h4>
                      <span className="text-xs text-neutral-400">{conv.lastMessage.time}</span>
                    </div>
                    <p className="text-xs text-neutral-500 truncate">{conv.context}</p>
                    <p className={`text-sm truncate ${conv.lastMessage.unread ? "font-medium text-neutral-900" : "text-neutral-500"}`}>
                      {conv.lastMessage.text}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col bg-white">
            {/* Header */}
            <div className="border-b px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/analytics" className="lg:hidden">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selected.contact.avatarColor} flex items-center justify-center text-white font-bold`}>
                  {selected.contact.avatar}
                </div>
                <div>
                  <h3 className="font-semibold">{selected.contact.name}</h3>
                  <p className="text-xs text-green-600">{selected.contact.lastActive}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Info className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Context Banner */}
            <div className="bg-violet-50 border-b px-4 py-2">
              <p className="text-sm text-violet-800 font-medium">{t("context")}: {selected.context}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
              {currentMessages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[70%] ${msg.sender === "me" ? "bg-violet-500 text-white" : "bg-gray-100 text-neutral-900"} rounded-2xl px-4 py-3`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === "me" ? "text-violet-100" : "text-neutral-500"}`}>
                      {msg.time}
                      {msg.sender === "me" && <CheckCheck className="w-3 h-3 inline ml-1" />}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t("typeMessage")}
                  className="flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button onClick={sendMessage} disabled={!input.trim()} className="bg-violet-500 hover:bg-violet-600">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function MessagesPageWrapper() {
  return (
    <AuthGuard>
      <MessagesPage />
    </AuthGuard>
  );
}
