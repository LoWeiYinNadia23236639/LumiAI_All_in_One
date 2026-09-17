import type { Metadata } from "next";
import "./globals.css";
import { AnimationProvider } from "@/components/animation-provider";
import { Navbar } from "@/components/navbar";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/contexts/auth-context";
import { NotificationsProvider } from "@/contexts/notifications-context";
import { SavedListsProvider } from "@/contexts/saved-lists-context";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

// Type system (fonts self-hosted in /public/fonts, declared via @font-face in globals.css):
//   Headings (h1-h3) = Playfair Display Black Italic 900
//   Slogans / quotes / card titles = Instrument Serif Regular 400
//   Body / nav / buttons / tables = Montserrat Medium 500
//   Chinese glyphs fall through to FZY3K in every stack.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

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
      <body className="font-sans">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <NotificationsProvider>
              <SavedListsProvider>
                <AnimationProvider>
                  <ToastProvider>
                    <div className="min-h-screen bg-cream">
                      <Navbar />
                      {children}
                    </div>
                  </ToastProvider>
                </AnimationProvider>
              </SavedListsProvider>
            </NotificationsProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
