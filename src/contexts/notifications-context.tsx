"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useLocale } from "next-intl";
import { getSupabaseClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/relative-time";

export interface AppNotification {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  read: boolean;
  createdAt: string;
  /** Locale-aware relative time, e.g. "2 hours ago" / "2 小時前". */
  timeAgo: string;
}

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const POLL_INTERVAL_MS = 30_000;
const FETCH_LIMIT = 30;

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const userIdRef = useRef<string | null>(null);
  userIdRef.current = userId;

  useEffect(() => {
    const supabase = getSupabaseClient();
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setUserId(data.session?.user.id ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const next = session?.user.id ?? null;
      setUserId(next);
      if (!next) setNotifications([]);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const fetchNotifications = useCallback(async () => {
    const uid = userIdRef.current;
    if (!uid) return;
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from("notifications")
      .select("id, type, payload, read, created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(FETCH_LIMIT);
    const rows = (data ?? []) as {
      id: string;
      type: string;
      payload: Record<string, unknown> | null;
      read: boolean;
      created_at: string;
    }[];
    setNotifications(
      rows.map((r) => ({
        id: r.id,
        type: r.type,
        payload: r.payload ?? {},
        read: r.read,
        createdAt: r.created_at,
        timeAgo: formatRelativeTime(r.created_at, locale),
      }))
    );
  }, [locale]);

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
    const timer = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [userId, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    void (async () => {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      }).catch(() => {});
    })();
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    void (async () => {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ all: true }),
      }).catch(() => {});
    })();
  }, []);

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
}
