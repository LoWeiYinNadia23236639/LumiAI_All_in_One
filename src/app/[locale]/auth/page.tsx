"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  User, 
  Building2, 
  Shield,
  Eye, 
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { demoAccounts, type UserRole } from "@/lib/demo-data";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "next-intl";

export default function AuthPage() {
  const t = useTranslations("auth");
  const router = useRouter();

  const roleConfig = {
    influencer: { 
      label: t("creators"), 
      icon: User, 
      color: "from-pink-400 to-rose-500",
      bgColor: "bg-pink-50",
      redirect: "/analytics"
    },
    company: { 
      label: t("brands"), 
      icon: Building2, 
      color: "from-blue-400 to-blue-600",
      bgColor: "bg-blue-50",
      redirect: "/analytics/company"
    },
    admin: { 
      label: t("admin"), 
      icon: Shield, 
      color: "from-red-400 to-red-600",
      bgColor: "bg-red-50",
      redirect: "/admin"
    },
  };
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const redirectTo = searchParams.get("redirect");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [selectedRole, setSelectedRole] = useState<UserRole>("influencer");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  // Filter demo accounts by role
  const filteredAccounts = demoAccounts.filter(acc => acc.role === selectedRole);

  const handleDemoLogin = (email: string, password: string) => {
    const success = login(email, password);
    if (success) {
      router.push(redirectTo || "/analytics");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = login(formData.email, formData.password);
    if (success) {
      router.push(redirectTo || "/analytics");
    } else {
      setError(t("invalidCredentials"));
    }
  };

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
          
          <h2 className="text-4xl font-bold mb-6">
            {mode === "signup" ? t("startJourney") : t("welcomeBack")}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {mode === "signup" 
              ? t("signupSubtitle")
              : t("loginSubtitle")
            }
          </p>

          <div className="space-y-4">
            {[
              "AI Storyboard & Caption Generation",
              t("findBrandDeals"),
              t("rentGear"),
              t("analytics")
            ].map((feature, i) => (
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

          {/* Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === "login" 
                  ? "bg-white text-violet-600 shadow-sm" 
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === "signup" 
                  ? "bg-white text-violet-600 shadow-sm" 
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Create Account
            </button>
          </div>

          {mode === "login" && (
            <>
              {/* Demo Accounts Section */}
              <div className="mb-6">
                <p className="text-sm font-medium text-neutral-700 mb-3">Quick Login with Demo Accounts</p>
                
                {/* Role Selection */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {(Object.keys(roleConfig) as UserRole[]).map((role) => {
                    const config = roleConfig[role];
                    return (
                      <button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-all ${
                          selectedRole === role
                            ? `${config.bgColor} ring-2 ring-offset-2 ring-${role === "admin" ? "red" : role === "company" ? "blue" : "pink"}-500`
                            : "bg-gray-100 text-neutral-600 hover:bg-gray-200"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center text-white`}>
                          <config.icon className="w-4 h-4" />
                        </div>
                        {config.label}
                      </button>
                    );
                  })}
                </div>

                {/* Demo Account Cards */}
                <div className="space-y-2">
                  {filteredAccounts.map((account) => {
                    const config = roleConfig[account.role];
                    return (
                      <button
                        key={account.id}
                        onClick={() => handleDemoLogin(account.email, account.password)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border hover:border-violet-300 hover:bg-violet-50 transition-all text-left"
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${account.avatarColor} flex items-center justify-center text-white font-bold text-sm`}>
                          {account.avatar}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{account.name}</p>
                          <p className="text-xs text-neutral-500">{account.email}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs text-white bg-gradient-to-br ${config.color}`}>
                          {config.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-neutral-500">Or sign in manually</span>
                </div>
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type={showPassword ? "text" : "password"}
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

            {mode === "login" && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-neutral-600">Remember me</span>
                </label>
                <Link href="#" className="text-violet-600 hover:underline">
                  {t("forgotPassword")}
                </Link>
              </div>
            )}

            <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 via-pink-500 to-orange-400 text-white py-3 h-auto text-lg">
              {mode === "signup" ? t("createAccount") : t("signIn")}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-500">
            By continuing, you agree to our{" "}
            <Link href="#" className="text-violet-600 hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="#" className="text-violet-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
