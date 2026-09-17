"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, MailCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthLayout, AuthErrorMessage } from "@/components/auth-layout";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "next-intl";

function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sendPasswordReset, updatePassword } = useAuth();
  const isUpdateMode = searchParams.get("mode") === "update";

  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState({ password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [updated, setUpdated] = useState(false);

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: errorKey } = await sendPasswordReset(email);
    setSubmitting(false);
    if (errorKey) {
      setError(errorKey);
      return;
    }
    setSentTo(email);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (passwords.password.length < 6) {
      setError("passwordTooShort");
      return;
    }
    if (passwords.password !== passwords.confirm) {
      setError("passwordsDoNotMatch");
      return;
    }
    setSubmitting(true);
    const { error: errorKey } = await updatePassword(passwords.password);
    setSubmitting(false);
    if (errorKey) {
      setError(errorKey);
      return;
    }
    setUpdated(true);
  };

  if (updated) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
        <div className="w-16 h-16 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-6">
          <MailCheck className="w-8 h-8 text-green-600" />
        </div>
        <p className="text-neutral-600 mb-8">{t("resetSent", { email: sentTo || email })}</p>
        <Link href="/login">
          <Button className="w-full">
            {t("backToSignIn")}
          </Button>
        </Link>
      </motion.div>
    );
  }

  if (isUpdateMode) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">{t("forgotTitle")}</h1>
        <p className="text-neutral-600 mb-8">{t("forgotSubtitle")}</p>
        <form onSubmit={handleUpdate} className="space-y-4">
          {error && <AuthErrorMessage errorKey={error} />}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">{t("password")}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
                value={passwords.password}
                onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
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
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t("confirmPassword")}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full py-3 h-auto text-lg"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t("sendResetLink")}
            {!submitting && <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>
        </form>
      </motion.div>
    );
  }

  if (sentTo) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
        <div className="w-16 h-16 rounded-lg bg-primary-soft flex items-center justify-center mx-auto mb-6">
          <MailCheck className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-4">{t("resetSentTitle")}</h1>
        <p className="text-neutral-600 mb-8">{t("resetSent", { email: sentTo })}</p>
        <Link href="/login">
          <Button variant="outline" className="w-full">
            {t("backToSignIn")}
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-3xl font-bold mb-2">{t("forgotTitle")}</h1>
      <p className="text-neutral-600 mb-8">{t("forgotSubtitle")}</p>
      <form onSubmit={handleSendReset} className="space-y-4">
        {error && <AuthErrorMessage errorKey={error} />}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">{t("email")}</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="email"
              required
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              className="w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={submitting}
          className="w-full py-3 h-auto text-lg"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t("sendResetLink")}
          {!submitting && <ArrowRight className="w-5 h-5 ml-2" />}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-neutral-600">
        <Link href="/login" className="text-primary hover:underline font-medium">
          {t("backToSignIn")}
        </Link>
      </p>
    </motion.div>
  );
}

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  return (
    <AuthLayout title={t("forgotTitle")} subtitle={t("forgotSubtitle")}>
      <Suspense
        fallback={
          <div className="min-h-[300px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <ForgotPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
