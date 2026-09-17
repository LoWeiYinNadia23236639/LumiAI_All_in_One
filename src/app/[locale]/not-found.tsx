import Link from "next/link";
import { Compass } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { GoBackButton } from "@/components/ui/go-back-button";

export default async function NotFoundPage() {
  const locale = await getLocale();

  const t = await getTranslations({ locale, namespace: "common.notFound" });

  return (
    <main className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="text-center max-w-md mx-auto py-20">
        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mx-auto mb-8">
          <Compass className="w-12 h-12 text-cream" />
        </div>
        <p className="text-7xl font-black text-primary mb-4">
          404
        </p>
        <h1 className="text-2xl font-bold text-ink mb-2">{t("title")}</h1>
        <p className="text-ink-soft mb-8">{t("description")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/">
            <Button>{t("backHome")}</Button>
          </Link>
          <GoBackButton label={t("goBack")} />
        </div>
      </div>
    </main>
  );
}
