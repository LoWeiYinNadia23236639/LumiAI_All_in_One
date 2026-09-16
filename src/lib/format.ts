/**
 * Locale-aware date formatting helper.
 * `locale` should come from next-intl's useLocale() ("en" | "zh-hk" | "zh-cn").
 */
export function formatDate(
  iso: string | null | undefined,
  locale: string,
  opts?: Intl.DateTimeFormatOptions
): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, opts ?? { dateStyle: "medium" }).format(date);
}
