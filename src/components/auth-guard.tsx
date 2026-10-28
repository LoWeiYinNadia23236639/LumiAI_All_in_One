"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Lock } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { AI_GUEST_ACCESS_ENABLED } from "@/lib/ai/access";

export function AuthGuard({ children, allowGuests = false }: { children: React.ReactNode; allowGuests?: boolean }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth");
  const { user, isLoading } = useAuth();
  const guestAllowed = allowGuests && AI_GUEST_ACCESS_ENABLED;

  useEffect(() => {
    if (!guestAllowed && !isLoading && !user) {
      const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "";
      router.push(`/${locale}/login${currentPath ? `?redirect=${encodeURIComponent(currentPath)}` : ""}`);
    }
  }, [guestAllowed, user, isLoading, router, locale]);

  if (guestAllowed) return <>{children}</>;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Lock className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t("authRequired")}</h2>
          <p className="text-neutral-600 mb-6">{t("pleaseSignIn")}</p>
          <Link href="/login">
            <Button>{t("signIn")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
