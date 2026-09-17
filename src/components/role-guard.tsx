"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Lock, User, Building2, Globe, Camera, Package } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

type UserRole = "influencer" | "company" | "admin";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackUrl?: string;
}

export function RoleGuard({ children, allowedRoles, fallbackUrl }: RoleGuardProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth");
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(fallbackUrl ?? `/${locale}/login`);
    }
  }, [user, isLoading, router, fallbackUrl, locale]);

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

  // Check if user's role is allowed
  const hasAccess = allowedRoles.includes(user.role as UserRole);

  if (!hasAccess) {
    // Redirect to appropriate dashboard based on role
    let redirectUrl = "/";
    let icon = User;
    let roleName = t("accessDenied.roleUser");
    let description = t("accessDenied.descDefault");

    switch (user.role) {
      case "influencer":
        redirectUrl = "/analytics";
        icon = User;
        roleName = t("accessDenied.roleCreator");
        description = t("accessDenied.descCreator");
        break;
      case "company":
        redirectUrl = "/analytics/company";
        icon = Building2;
        roleName = t("accessDenied.roleCompany");
        description = t("accessDenied.descCompany");
        break;

      case "admin":
        redirectUrl = "/admin/overview";
        icon = User;
        roleName = t("accessDenied.roleAdmin");
        description = t("accessDenied.descAdmin");
        break;
    }

    const IconComponent = icon;

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <IconComponent className="w-16 h-16 text-violet-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t("accessDenied.title")}</h2>
          <p className="text-neutral-600 mb-2">
            {t.rich("accessDenied.signedInAs", { name: user.name, role: roleName, b: (chunks) => <strong>{chunks}</strong> })}
          </p>
          <p className="text-neutral-600 mb-6">{description}</p>
          <div className="flex gap-3 justify-center">
            <Link href="/">
              <Button variant="outline">{t("accessDenied.goHome")}</Button>
            </Link>
            <Link href={redirectUrl}>
              <Button>{t("accessDenied.goToDashboard")}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Convenience exports for specific roles
export function InfluencerGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["influencer", "admin"]}>{children}</RoleGuard>;
}

export function CompanyGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["company", "admin"]}>{children}</RoleGuard>;
}

export function PublicView({ children }: { children: React.ReactNode }) {
  // Public view is accessible to all authenticated users
  return <RoleGuard allowedRoles={["influencer", "company", "admin"]}>{children}</RoleGuard>;
}
