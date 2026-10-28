import { getSupabaseClient } from "@/lib/supabase/client";
import { AI_GUEST_ACCESS_ENABLED } from "@/lib/ai/access";

export type AiToolType = "storyboard" | "caption" | "quote" | "message" | "planner" | "rate" | "contract";

export class AiAuthError extends Error {}

/**
 * Calls POST /api/ai/generate with the current Supabase session token.
 * Throws AiAuthError on 401, Error with a friendly message otherwise.
 */
export async function callGenerate<T = unknown>(
  type: AiToolType,
  input: Record<string, unknown>
): Promise<T> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token && !AI_GUEST_ACCESS_ENABLED) throw new AiAuthError("Not signed in");

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch("/api/ai/generate", {
    method: "POST",
    headers,
    body: JSON.stringify({ type, input }),
  });

  if (res.status === 401) throw new AiAuthError("Session expired");
  if (!res.ok) {
    let detail = "";
    try {
      const errBody = await res.json();
      detail = errBody.detail ? ` (${errBody.detail})` : "";
    } catch {}
    throw new Error(`Generation failed${detail}`);
  }

  const body = await res.json();
  return body.result as T;
}
