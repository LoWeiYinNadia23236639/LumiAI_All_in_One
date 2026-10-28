import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { AI_GUEST_ACCESS_ENABLED, GUEST_RATE_LIMITS, type GuestRateScope } from "@/lib/ai/access";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export type AuthResult =
  | { ok: true; userId: string; token: string; userClient: SupabaseClient; isGuest: boolean }
  | { ok: false };

/** Validates a session token, or creates an isolated anonymous demo request. */
export function authenticateRequest(req: NextRequest): AuthResult {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const isGuest = !token && AI_GUEST_ACCESS_ENABLED;
  if (!token && !isGuest) return { ok: false };

  const userClient: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  });

  return { ok: true, userId: "", token: token ?? "", userClient, isGuest };
}

/** Verify the token against Supabase Auth (await this after authenticateRequest). */
export async function verifyToken(
  auth: Extract<AuthResult, { ok: true }>
): Promise<{ id: string; email?: string; isGuest: boolean } | null> {
  if (auth.isGuest) return { id: `guest-${randomUUID()}`, isGuest: true };
  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await authClient.auth.getUser(auth.token);
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email, isGuest: false };
}

const GUEST_WINDOW_MS = 24 * 60 * 60 * 1000;
type GuestRateEntry = { count: number; resetAt: number };
const guestRateGlobal = globalThis as typeof globalThis & { __lumiGuestRates?: Map<string, GuestRateEntry> };
const guestRates = guestRateGlobal.__lumiGuestRates ?? new Map<string, GuestRateEntry>();
guestRateGlobal.__lumiGuestRates = guestRates;

/**
 * Best-effort abuse protection for the temporary public demo. The counters
 * live in the server instance and do not affect signed-in users.
 */
export function enforceGuestRateLimit(req: NextRequest, scope: GuestRateScope): NextResponse | null {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const limit = GUEST_RATE_LIMITS[scope];
  let entry = guestRates.get(key);

  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + GUEST_WINDOW_MS };
    guestRates.set(key, entry);
  }
  if (entry.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return NextResponse.json(
      {
        error: "Guest trial limit reached",
        detail: "You have reached this tool's 24-hour guest trial limit. Sign in to continue or try again after the limit resets.",
      },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }
  entry.count += 1;

  // Prevent expired client entries from accumulating during long-lived instances.
  if (guestRates.size > 1000) {
    for (const [storedKey, storedEntry] of guestRates) {
      if (storedEntry.resetAt <= now) guestRates.delete(storedKey);
    }
  }
  return null;
}

export const STORYBOARD_BUCKET = "storyboard-media";

/** Creates the public storyboard storage bucket if it doesn't exist yet. */
export async function ensureStoryboardBucket(admin: SupabaseClient): Promise<void> {
  const { data: existing } = await admin.storage.getBucket(STORYBOARD_BUCKET);
  if (existing) return;
  const { error } = await admin.storage.createBucket(STORYBOARD_BUCKET, { public: true });
  // Race with another invocation is fine — bucket exists either way.
  if (error && !/already exists/i.test(error.message)) throw error;
}

// "quota" (429) must NOT be retried in a tight loop — it burns the same-account
// quota faster and makes congestion worse.
export function geminiErrorKind(err: unknown): "retryable" | "quota" | "fatal" {
  const msg = err instanceof Error ? err.message : String(err);
  if (/429|quota exceeded|RESOURCE_EXHAUSTED/i.test(msg)) return "quota";
  if (/503|UNAVAILABLE|high demand|overloaded|deadline exceeded|timeout/i.test(msg)) {
    return "retryable";
  }
  return "fatal";
}
