"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";
import { useLocale } from "next-intl";

export default function AnalyticsRouterPage() {
  const router = useRouter();
  const locale = useLocale();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect based on user role
      switch (user.role) {
        case "influencer":
          router.push("/analytics/dashboard");
          break;
        case "company":
          router.push("/analytics/company");
          break;

        case "admin":
          router.push("/admin/overview");
          break;
        default:
          router.push("/");
      }
    } else if (!isLoading && !user) {
      router.push(`/${locale}/login`);
    }
  }, [user, isLoading, router, locale]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-4" />
        <p className="text-neutral-600">Loading your dashboard...</p>
      </div>
    </div>
  );
}
