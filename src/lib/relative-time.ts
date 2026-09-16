/**
 * Locale-aware relative time, e.g. "2 days ago" / "2 天前" / "剛才".
 * `locale` should come from next-intl's useLocale() ("en" | "zh-hk" | "zh-cn").
 */
export function formatRelativeTime(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (abs < 60) return rtf.format(diffSec, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 2592000) return rtf.format(Math.round(diffSec / 86400), "day");
  if (abs < 31536000) return rtf.format(Math.round(diffSec / 2592000), "month");
  return rtf.format(Math.round(diffSec / 31536000), "year");
}

/**
 * Returns days until the given ISO date, or null if in the past/unparseable.
 * Used for the campaign deadline countdown.
 */
export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const diff = date.getTime() - Date.now();
  if (diff < 0) return null;
  return Math.ceil(diff / 86400000);
}
