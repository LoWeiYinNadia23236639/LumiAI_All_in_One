"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building2,
  ArrowRight,
  Loader2,
  MailCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthLayout, AuthErrorMessage } from "@/components/auth-layout";
import { useAuth, type SignUpRole } from "@/contexts/auth-context";
import { useTranslations } from "next-intl";

export default function SignupPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { signUp } = useAuth();
  const [role, setRole] = useState<SignUpRole>("creator");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.password.length < 6) {
      setError("passwordTooShort");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("passwordsDoNotMatch");
      return;
    }
    setSubmitting(true);
    const { error: errorKey, needsVerification } = await signUp({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role,
    });
    setSubmitting(false);
    if (errorKey) {
      setError(errorKey);
      return;
    }
    if (needsVerification) {
      setVerificationEmail(formData.email);
      return;
    }
    router.push(role === "brand" ? "/analytics/company" : "/analytics");
    router.refresh();
  };

  if (verificationEmail) {
    return (
      <AuthLayout title={t("checkEmailTitle")} subtitle={t("signupSubtitle")}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 rounded-lg bg-primary-soft flex items-center justify-center mx-auto mb-6">
            <MailCheck className="w-8 h-8 text-primary" />
          </div>
          <p className="text-neutral-600 mb-8">{t("checkEmail", { email: verificationEmail })}</p>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              {t("backToSignIn")}
            </Button>
          </Link>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t("startJourney")} subtitle={t("signupSubtitle")}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">{t("startJourney")}</h1>
        <p className="text-neutral-600 mb-8">{t("signupSubtitle")}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <AuthErrorMessage errorKey={error} />}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">{t("selectRole")}</label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: "creator", label: t("creators"), icon: User, active: "bg-primary-soft ring-2 ring-offset-2 ring-primary", idle: "bg-gray-100 text-neutral-600 hover:bg-gray-200" },
                  { value: "brand", label: t("brands"), icon: Building2, active: "bg-primary-soft ring-2 ring-offset-2 ring-primary", idle: "bg-gray-100 text-neutral-600 hover:bg-gray-200" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRole(option.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-all ${
                    role === option.value ? option.active : option.idle
                  }`}
                >
                  <option.icon className="w-5 h-5" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">{t("name")}</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                required
                autoComplete="name"
                placeholder={t("namePlaceholder")}
                className="w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

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
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
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
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full py-3 h-auto text-lg"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t("createAccount")}
            {!submitting && <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-600">
          {t("haveAccount")}{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            {t("signIn")}
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
