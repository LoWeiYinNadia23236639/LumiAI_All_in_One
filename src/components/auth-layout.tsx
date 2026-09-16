"use client";

import { ReactNode } from "react";
import { Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Shared two-panel layout for login / signup / forgot-password pages.
 * Matches the visual style of the original /auth page.
 */
export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  const t = useTranslations("auth");

  return (
    <main className="min-h-screen flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-pink-500 to-orange-400 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            <span className="text-3xl font-bold">LumiAI</span>
          </div>

          <h2 className="text-4xl font-bold mb-6">{title}</h2>
          <p className="text-xl text-white/90 mb-8">{subtitle}</p>

          <div className="space-y-4">
            {[t("aiFeatures"), t("findBrandDeals"), t("rentGear"), t("analytics")].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-white/80" />
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">LumiAI</span>
          </div>

          {children}

          <p className="mt-8 text-center text-sm text-neutral-500">{t("terms")}</p>
        </div>
      </div>
    </main>
  );
}

export function AuthErrorMessage({ errorKey }: { errorKey: string }) {
  const t = useTranslations("auth");
  return (
    <div className="p-3 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 text-sm">
      <AlertCircle className="w-4 h-4" />
      {t(errorKey as never)}
    </div>
  );
}
