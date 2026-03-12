import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AnimationProvider } from "@/components/animation-provider";
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/contexts/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LumiAI - Creator Operating System",
  description: "All-in-one platform for content creators",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AnimationProvider>
            <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-orange-50">
              <Navbar />
              {children}
            </div>
          </AnimationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
