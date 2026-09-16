"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useLocale } from "next-intl";

/**
 * Landing page for Supabase auth emails (email confirmation, password recovery).
 * Supabase-js picks up the tokens from the URL hash automatically; we then
 * forward the user to the right place.
 */
function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();

  useEffect(() => {
    const next = searchParams.get("next");
    getSupabaseClient()
      .auth.getSession()
      .then(({ data }) => {
        if (next === "update-password") {
          router.replace(`/${locale}/forgot-password?mode=update`);
        } else {
          router.replace(`/${locale}/login`);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Suspense fallback={null}>
        <CallbackHandler />
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </Suspense>
    </div>
  );
}
