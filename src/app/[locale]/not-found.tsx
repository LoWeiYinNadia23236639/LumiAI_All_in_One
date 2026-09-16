import Link from "next/link";
import { Compass } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { GoBackButton } from "@/components/ui/go-back-button";

export default async function NotFoundPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "common.notFound" });

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-pink-50 to-orange-50 px-4">
      <div className="text-center max-w-md mx-auto py-20">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 via-pink-500 to-orange-400 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-pink-500/30">
          <Compass className="w-12 h-12 text-white" />
        </div>
        <p className="text-7xl font-black bg-gradient-to-r from-violet-600 via-pink-500 to-orange-500 bg-clip-text text-transparent mb-4">
          404
        </p>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">{t("title")}</h1>
        <p className="text-neutral-600 mb-8">{t("description")}</p>
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
