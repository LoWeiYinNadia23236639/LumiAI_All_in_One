"use client";

import { createContext, useContext, useState, useEffect, useMemo, useRef, ReactNode } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

export type UserRole = "influencer" | "company" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar: string;
  avatarColor: string;
  isAdmin: boolean;
}

export type SignUpRole = "creator" | "brand";

const AVATAR_COLORS = [
  "from-pink-400 to-rose-500",
  "from-blue-400 to-cyan-500",
  "from-orange-400 to-amber-500",
  "from-green-400 to-emerald-500",
  "from-violet-400 to-purple-500",
  "from-red-400 to-red-600",
];

interface AuthResult {
  error: string | null; // i18n key under "auth"
}

interface SignUpResult extends AuthResult {
  needsVerification: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (input: { name: string; email: string; password: string; role: SignUpRole }) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  /** Alias of signOut kept for existing pages. */
  logout: () => void;
  sendPasswordReset: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAuthUser(profile: {
  id: string;
  email?: string;
  role: string;
  name: string;
  is_admin: boolean;
}): AuthUser {
  const name = profile.name || profile.email || "User";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  let hash = 0;
  for (const ch of profile.id) hash = (hash + ch.charCodeAt(0)) % 997;
  return {
    id: profile.id,
    email: profile.email || "",
    role: profile.is_admin ? "admin" : profile.role === "brand" ? "company" : "influencer",
    name,
    avatar: initials,
    avatarColor: AVATAR_COLORS[hash % AVATAR_COLORS.length],
    isAdmin: profile.is_admin,
  };
}

async function fetchProfile(userId: string, email: string): Promise<AuthUser | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, name, is_admin")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  return toAuthUser({ ...data, email });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // 記住目前已載入的用戶 id，避免重複抓取同一個用戶的 profile
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      const sessionUser = data.session?.user;
      if (sessionUser) {
        const profile = await fetchProfile(sessionUser.id, sessionUser.email ?? "");
        if (mounted) {
          setUser(profile);
          userIdRef.current = profile?.id ?? null;
        }
      }
      if (mounted) setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // INITIAL_SESSION 已由上面 getSession() 處理，跳過避免重複抓取 profile 造成畫面閃爍
      if (event === "INITIAL_SESSION") return;
      if (event === "SIGNED_OUT" || !session) {
        userIdRef.current = null;
        setUser(null);
        setIsLoading(false);
        return;
      }
      // TOKEN_REFRESHED 等事件：同一個用戶不需要重複抓 profile，
      // 否則會造成請求風暴（頁面卡住、hydration 停擺）
      if (session.user.id === userIdRef.current) return;
      userIdRef.current = session.user.id;
      setIsLoading(true);
      const profile = await fetchProfile(session.user.id, session.user.email ?? "");
      setUser(profile);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn: AuthContextType["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        return { error: "emailNotConfirmed" };
      }
      return { error: "invalidCredentials" };
    }
    return { error: null };
  };

  const signUp: AuthContextType["signUp"] = async ({ name, email, password, role }) => {
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role }, emailRedirectTo: redirectTo },
    });
    if (error) return { error: "authError", needsVerification: false };
    // identities is empty when the email is already registered
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return { error: "authError", needsVerification: false };
    }
    return { error: null, needsVerification: !data.session };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const logout = () => {
    void signOut();
  };

  const sendPasswordReset: AuthContextType["sendPasswordReset"] = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=update-password`,
    });
    if (error) return { error: "authError" };
    return { error: null };
  };

  const updatePassword: AuthContextType["updatePassword"] = async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: "authError" };
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signIn, signUp, signOut, logout, sendPasswordReset, updatePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
