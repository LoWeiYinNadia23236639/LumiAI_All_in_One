"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { DemoUser, auth } from "@/lib/demo-data";

interface AuthContextType {
  user: DemoUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const currentUser = auth.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): boolean => {
    const loggedInUser = auth.login(email, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
