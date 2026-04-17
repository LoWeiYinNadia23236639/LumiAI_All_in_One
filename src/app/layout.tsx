import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LumiAI - Creator Operating System",
  description: "All-in-one platform for content creators and brands",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
