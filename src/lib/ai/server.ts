import { NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export type AuthResult =
  | { ok: true; userId: string; token: string; userClient: SupabaseClient }
  | { ok: false };

/** Validates the caller's Supabase access token (client-side session). */
export function authenticateRequest(req: NextRequest): AuthResult {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return { ok: false };

  const userClient: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  return { ok: true, userId: "", token, userClient };
}

/** Verify the token against Supabase Auth (await this after authenticateRequest). */
export async function verifyToken(
  auth: Extract<AuthResult, { ok: true }>
): Promise<{ id: string; email?: string } | null> {
  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await authClient.auth.getUser(auth.token);
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email };
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
