import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export interface RequestAuth {
  userId: string;
  /** Service-role client — all writes go through this. */
  admin: SupabaseClient;
}

export function jsonError(status: number, error: string, detail?: string) {
  return NextResponse.json(
    { error, ...(detail ? { detail } : {}) },
    { status }
  );
}

/**
 * Bearer-token auth identical to /api/applications: the caller's Supabase
 * access token is verified, and a service-role client is returned for
 * privileged reads/writes (RLS is bypassed, so routes must check
 * ownership/role explicitly).
 */
export async function authenticateRequest(
  req: NextRequest
): Promise<RequestAuth | NextResponse> {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return jsonError(401, "Unauthorized");
  }
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return jsonError(500, "Server misconfigured", "SUPABASE_SERVICE_ROLE_KEY missing");
  }

  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  if (userError || !userData.user) {
    return jsonError(401, "Unauthorized");
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return { userId: userData.user.id, admin };
}

export async function getProfile(
  admin: SupabaseClient,
  userId: string
): Promise<{ role: string; name: string; is_admin: boolean } | null> {
  const { data } = await admin
    .from("profiles")
    .select("role, name, is_admin")
    .eq("id", userId)
    .single();
  return data ?? null;
}

export function isBrandProfile(profile: { role: string; is_admin: boolean } | null): boolean {
  return !!profile && (profile.is_admin || profile.role === "brand");
}
