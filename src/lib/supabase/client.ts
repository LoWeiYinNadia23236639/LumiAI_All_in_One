import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 整個瀏覽器共用一個 client 實例。
// 之前每次呼叫都 createClient 會產生多個實例，它們的 autoRefreshToken
// 會互相干擾，觸發大量重複的 auth 事件和 API 請求。
let browserClient: SupabaseClient | undefined;

export function getSupabaseClient() {
  if (!browserClient) {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return browserClient;
}
