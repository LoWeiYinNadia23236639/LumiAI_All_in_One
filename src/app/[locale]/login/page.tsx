"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthLayout, AuthErrorMessage } from "@/components/auth-layout";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "next-intl";

export function roleHomePath(role: string | undefined): string {
  if (role === "admin") return "/admin/overview";
  if (role === "company") return "/analytics/company";
  return "/analytics";
}

function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const redirectTo = searchParams.get("redirect");
  const safeRedirect =
    redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : null;

  // Already signed in → go to dashboard (or the original destination)
  useEffect(() => {
    if (!isLoading && user) {
      router.replace(safeRedirect || roleHomePath(user.role));
    }
  }, [user, isLoading, router, safeRedirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: errorKey } = await signIn(formData.email, formData.password);
    setSubmitting(false);
    if (errorKey) {
      setError(errorKey);
      return;
    }
    // 不要在這裡跳轉——上面的 useEffect 會等 user 載入後，
    // 直接用正確的角色首頁 router.replace，避免 /analytics → /admin 來回彈跳。
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-3xl font-bold mb-2">{t("welcomeBack")}</h1>
      <p className="text-neutral-600 mb-8">{t("loginSubtitle")}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <AuthErrorMessage errorKey={error} />}

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">{t("email")}</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">{t("password")}</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full pl-12 pr-12 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end text-sm">
          <Link href="/forgot-password" className="text-violet-600 hover:underline">
            {t("forgotPassword")}
          </Link>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-violet-600 via-pink-500 to-orange-400 text-white py-3 h-auto text-lg"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t("signIn")}
          {!submitting && <ArrowRight className="w-5 h-5 ml-2" />}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        {t("noAccount")}{" "}
        <Link href="/signup" className="text-violet-600 hover:underline font-medium">
          {t("createAccount")}
        </Link>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  const t = useTranslations("auth");
  return (
    <AuthLayout title={t("welcomeBack")} subtitle={t("loginSubtitle")}>
      <Suspense
        fallback={
          <div className="min-h-[300px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
