import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let adminClient: SupabaseClient | undefined;

function getAdminClient(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return adminClient;
}

/**
 * Best-effort notification insert. Never throws — a failed notification
 * must not break the business flow that triggered it.
 */
export async function notify(
  userId: string,
  type: string,
  payload: Record<string, unknown>
): Promise<void> {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.log(`[notifications] SERVICE_ROLE key not set — skipping ${type} for ${userId}`);
    return;
  }
  try {
    const { error } = await getAdminClient()
      .from("notifications")
      .insert({ user_id: userId, type, payload });
    if (error) {
      console.error(`[notifications] insert failed (${type}):`, error.message);
    }
  } catch (err) {
    console.error(`[notifications] insert failed (${type}):`, err);
  }
}
