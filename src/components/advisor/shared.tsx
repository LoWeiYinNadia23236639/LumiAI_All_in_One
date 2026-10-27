"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, Copy, Download, Loader2, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiLoadingText } from "@/components/ai-loading-text";

export const inputClass = "w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50";

export function Field({ label, hint, optional, children }: { label: string; hint?: string; optional?: string; children: ReactNode }) {
  return <label className="block"><span className="mb-2 flex items-baseline justify-between gap-3 text-sm font-semibold text-ink"><span>{label}{optional && <span className="ml-2 text-xs font-normal text-ink-soft">({optional})</span>}</span></span>{children}{hint && <span className="mt-2 block text-xs leading-relaxed text-ink-soft">{hint}</span>}</label>;
}

export function StepNav({ steps, current, maxReached, onChange }: { steps: string[]; current: number; maxReached: number; onChange: (index: number) => void }) {
  return <nav aria-label="Progress" className="mb-8 grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>{steps.map((step, index) => <button type="button" key={step} disabled={index > maxReached} onClick={() => onChange(index)} className={`flex min-w-0 items-center gap-2 rounded-xl border px-3 py-3 text-left transition ${index === current ? "border-primary bg-primary-soft text-primary" : index < current ? "border-primary/25 bg-paper text-ink" : "border-line bg-paper text-ink-soft disabled:cursor-not-allowed disabled:opacity-50"}`}><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${index < current ? "bg-primary text-cream" : "bg-cream"}`}>{index < current ? <Check className="h-3.5 w-3.5" /> : index + 1}</span><span className="truncate text-xs font-semibold sm:text-sm">{step}</span></button>)}</nav>;
}

export function ToolHeading({ icon, title, description, onExample, exampleLabel }: { icon: ReactNode; title: string; description: string; onExample?: () => void; exampleLabel?: string }) {
  return <div className="mb-7 flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-cream">{icon}</div><div className="min-w-0 flex-1"><h2 className="text-xl font-bold text-ink sm:text-2xl">{title}</h2><p className="mt-1 text-sm leading-relaxed text-ink-soft">{description}</p></div>{onExample && <Button type="button" variant="ghost" size="sm" onClick={onExample} className="shrink-0 rounded-full border border-dashed border-primary/40 text-primary"><Sparkles className="h-4 w-4" />{exampleLabel}</Button>}</div>;
}

export function FormNav({ back, next, nextLabel, nextDisabled, loading }: { back?: () => void; next: () => void; nextLabel: string; nextDisabled?: boolean; loading?: boolean }) {
  const t = useTranslations("advisorNext");
  return <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">{back ? <Button type="button" variant="ghost" onClick={back} disabled={loading}><ArrowLeft className="h-4 w-4" />{t("common.back")}</Button> : <span />}<Button type="button" onClick={next} disabled={nextDisabled || loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{nextLabel}<ArrowRight className="h-4 w-4" /></Button></div>;
}

export function ErrorBanner({ message, retryLabel, onRetry }: { message: string; retryLabel: string; onRetry: () => void }) {
  return <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700"><span className="flex items-start gap-2"><AlertCircle className="h-5 w-5 shrink-0" />{message}</span><Button type="button" size="sm" variant="outline" onClick={onRetry}>{retryLabel}</Button></div>;
}

export function LoadingPanel({ label, toolKey }: { label: string; toolKey: "rate" | "quote" | "message" | "planner" }) {
  return <div className="mt-5 rounded-xl bg-primary-soft p-4"><div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary"><Loader2 className="h-4 w-4 animate-spin" />{label}</div><AiLoadingText toolKey={toolKey} /></div>;
}

export function Notice({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "warning" | "success" }) {
  return <div className={`rounded-xl border p-4 text-sm leading-relaxed ${tone === "warning" ? "border-amber-200 bg-amber-50 text-amber-800" : tone === "success" ? "border-primary/20 bg-primary-soft text-primary" : "border-line bg-cream text-ink-soft"}`}>{children}</div>;
}

export function ResultActions({ copyLabel, downloadLabel, saveLabel, backLabel, onCopy, onDownload, onSave, onBack, copied }: { copyLabel: string; downloadLabel: string; saveLabel?: string; backLabel: string; onCopy: () => void; onDownload: () => void; onSave?: () => void; onBack: () => void; copied?: boolean }) {
  return <div className="flex flex-wrap gap-3 rounded-xl border border-line bg-paper p-4"><Button type="button" onClick={onCopy}>{copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copyLabel}</Button><Button type="button" variant="outline" onClick={onDownload}><Download className="h-4 w-4" />{downloadLabel}</Button>{onSave && <Button type="button" variant="outline" onClick={onSave}><Save className="h-4 w-4" />{saveLabel}</Button>}<Button type="button" variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4" />{backLabel}</Button></div>;
}

export function downloadText(filename: string, content: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function saveLocal(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify({ ...value as object, savedAt: new Date().toISOString() }));
}

export function money(value: number, currency: string) {
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(value); }
  catch { return `${currency} ${Math.round(value).toLocaleString()}`; }
}

export function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}
