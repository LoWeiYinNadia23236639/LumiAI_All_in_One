"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";
import { useTranslations } from "next-intl";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

/** Unified error block: icon + message + retry / back-home actions. */
export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  const t = useTranslations("common");
  return (
    <div className="py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="font-bold text-lg text-neutral-900 mb-1">
        {title ?? t("errorTitle")}
      </h3>
      <p className="text-sm text-neutral-500 mb-6 max-w-md mx-auto">
        {description ?? t("errorDesc")}
      </p>
      <div className="flex gap-3 justify-center">
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            {t("tryAgain")}
          </Button>
        )}
        <Link href="/">
          <Button>{t("backHome")}</Button>
        </Link>
      </div>
    </div>
  );
}
