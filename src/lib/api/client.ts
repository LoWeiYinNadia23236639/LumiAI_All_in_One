import { getSupabaseClient } from "@/lib/supabase/client";

export class ApiAuthError extends Error {}

export class ApiRequestError extends Error {
  status: number;
  detail?: string;

  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

/**
 * POST helper for the marketplace server routes. Attaches the current
 * Supabase session token; throws ApiAuthError on 401 and ApiRequestError
 * otherwise with the server's error message.
 */
export async function callApi<T = unknown>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new ApiAuthError("Not signed in");

  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) throw new ApiAuthError("Session expired");

  let payload: { error?: string; detail?: string } & Record<string, unknown> | null =
    null;
  try {
    payload = await res.json();
  } catch {
    // non-JSON error body
  }
  if (!res.ok) {
    throw new ApiRequestError(
      payload?.error ?? "Request failed",
      res.status,
      payload?.detail
    );
  }
  return payload as T;
}
