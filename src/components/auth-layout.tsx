"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { CheckCircle, AlertCircle } from "lucide-react";
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
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="flex items-center gap-3 mb-8">
            <Image src="/lumi-leaf-cream.png" alt="LumiAI" width={44} height={44} />
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
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-cream overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <Image src="/lumi-leaf.png" alt="LumiAI" width={36} height={36} />
            <span className="text-2xl font-bold text-primary">LumiAI</span>
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
