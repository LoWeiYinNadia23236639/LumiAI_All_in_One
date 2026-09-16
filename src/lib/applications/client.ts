import { getSupabaseClient } from "@/lib/supabase/client";

export class ApplyAuthError extends Error {}

export class DuplicateApplicationError extends Error {}

/**
 * Calls POST /api/applications with the current Supabase session token.
 * Throws ApplyAuthError on 401, DuplicateApplicationError on 409.
 */
export async function callApply(
  campaignId: string,
  message: string
): Promise<{ id: string; status: string }> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new ApplyAuthError("Not signed in");

  const res = await fetch("/api/applications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ campaign_id: campaignId, message }),
  });

  if (res.status === 401) throw new ApplyAuthError("Session expired");
  if (res.status === 409) throw new DuplicateApplicationError("Already applied");
  if (!res.ok) {
    let detail = "";
    try {
      const errBody = await res.json();
      detail = errBody.detail ? ` (${errBody.detail})` : "";
    } catch {}
    throw new Error(`Apply failed${detail}`);
  }

  const body = await res.json();
  return body.result as { id: string; status: string };
}
