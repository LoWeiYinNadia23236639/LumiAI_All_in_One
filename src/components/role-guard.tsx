"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Lock, User, Building2, Globe, Camera, Package } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

type UserRole = "influencer" | "company" | "public" | "admin" | "gear_owner" | "renter";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackUrl?: string;
}

export function RoleGuard({ children, allowedRoles, fallbackUrl = "/auth" }: RoleGuardProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(fallbackUrl);
    }
  }, [user, isLoading, router, fallbackUrl]);

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
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-neutral-600 mb-6">Please sign in to access this page.</p>
          <Link href="/auth">
            <Button>Sign In</Button>
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
    let roleName = "User";
    let description = "You don't have access to this page.";

    switch (user.role) {
      case "influencer":
        redirectUrl = "/analytics";
        icon = User;
        roleName = "Creator";
        description = "This page is for other user types. View your creator dashboard instead.";
        break;
      case "company":
        redirectUrl = "/analytics/company";
        icon = Building2;
        roleName = "Company";
        description = "This page is for other user types. View your company dashboard instead.";
        break;
      case "gear_owner":
        redirectUrl = "/analytics/gear-owner";
        icon = Camera;
        roleName = "Gear Owner";
        description = "This page is for other user types. View your gear management dashboard instead.";
        break;
      case "renter":
        redirectUrl = "/analytics/renter";
        icon = Package;
        roleName = "Renter";
        description = "This page is for other user types. View your rental dashboard instead.";
        break;
      case "admin":
        redirectUrl = "/admin";
        icon = User;
        roleName = "Admin";
        description = "This page is not for admin users.";
        break;
    }

    const IconComponent = icon;

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <IconComponent className="w-16 h-16 text-violet-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-neutral-600 mb-2">
            You are signed in as <strong>{user.name}</strong> ({roleName})
          </p>
          <p className="text-neutral-600 mb-6">{description}</p>
          <div className="flex gap-3 justify-center">
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
            <Link href={redirectUrl}>
              <Button>Go to Your Dashboard</Button>
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

export function GearOwnerGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["gear_owner", "admin"]}>{children}</RoleGuard>;
}

export function RenterGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["renter", "admin"]}>{children}</RoleGuard>;
}

export function PublicView({ children }: { children: React.ReactNode }) {
  // Public view is accessible to all authenticated users
  return <RoleGuard allowedRoles={["influencer", "company", "gear_owner", "renter", "admin"]}>{children}</RoleGuard>;
}
