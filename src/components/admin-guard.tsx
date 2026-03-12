"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Shield, Lock } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth");
    }
  }, [user, isLoading, router]);

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

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Admin Access Only</h2>
          <p className="text-neutral-600 mb-2">
            You are signed in as <strong>{user.name}</strong> ({user.role})
          </p>
          <p className="text-neutral-600 mb-6">
            This page is restricted to administrators only. If you need admin access, please contact support.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
            <Link href={user.role === "company" ? "/analytics/company" : "/analytics"}>
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
