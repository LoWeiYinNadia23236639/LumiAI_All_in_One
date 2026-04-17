import { Inter } from "next/font/google";
import "./globals.css";
import { AnimationProvider } from "@/components/animation-provider";
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/contexts/auth-context";
import { NotificationsProvider } from "@/contexts/notifications-context";
import { SavedListsProvider } from "@/contexts/saved-lists-context";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <NotificationsProvider>
              <SavedListsProvider>
                <AnimationProvider>
                  <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-orange-50">
                    <Navbar />
                    {children}
                  </div>
                </AnimationProvider>
              </SavedListsProvider>
            </NotificationsProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
