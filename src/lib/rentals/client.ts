import { getSupabaseClient } from "@/lib/supabase/client";

export class RentAuthError extends Error {}

/**
 * Calls POST /api/rentals with the current Supabase session token.
 * Throws RentAuthError on 401.
 */
export async function callRent(
  gearId: string,
  startDate: string,
  endDate: string,
  message: string
): Promise<{ id: string; status: string }> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new RentAuthError("Not signed in");

  const res = await fetch("/api/rentals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      gear_id: gearId,
      start_date: startDate,
      end_date: endDate,
      message,
    }),
  });

  if (res.status === 401) throw new RentAuthError("Session expired");
  if (!res.ok) {
    let detail = "";
    try {
      const errBody = await res.json();
      detail = errBody.detail ? ` (${errBody.detail})` : "";
    } catch {}
    throw new Error(`Rent request failed${detail}`);
  }

  const body = await res.json();
  return body.result as { id: string; status: string };
}
