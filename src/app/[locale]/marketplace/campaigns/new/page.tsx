"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Megaphone, AlertCircle } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { CompanyGuard } from "@/components/role-guard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/contexts/auth-context";
import { getSupabaseClient } from "@/lib/supabase/client";

const NICHE_OPTIONS = [
  "Beauty",
  "Fashion",
  "Fitness",
  "Gaming",
  "Tech",
  "Food",
  "Travel",
  "Lifestyle",
];

const inputClass =
  "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary";

function FieldError({ message }: { message: string }) {
  return <p className="text-xs text-red-600 mt-1">{message}</p>;
}

function CharCount({ count, max }: { count: number; max: number }) {
  const tc = useTranslations("common");
  return (
    <p
      className={`text-xs mt-1 text-right ${
        count > max - 50 ? "text-yellow-600" : "text-neutral-400"
      }`}
    >
      {tc("charCount", { count, max })}
    </p>
  );
}

function RequiredMark() {
  const tc = useTranslations("common");
  return (
    <span className="text-red-500">
      {" "}
      *{" "}
      <span className="text-neutral-400 font-normal text-xs">
        ({tc("required")})
      </span>
    </span>
  );
}

function NewCampaignForm() {
  const t = useTranslations("marketplace.newCampaign");
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [requirements, setRequirements] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [niche, setNiche] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const titleError =
    (touched.title || title.length > 0) && title.trim().length < 5
      ? t("validation.titleTooShort")
      : null;
  const budgetError =
    (touched.budget || budget.length > 0) &&
    (Number.isNaN(Number(budget)) || Number(budget) <= 0)
      ? t("validation.budgetInvalid")
      : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineError =
    (touched.deadline || deadline.length > 0) &&
    deadline !== "" &&
    new Date(`${deadline}T00:00:00`) < today
      ? t("validation.deadlinePast")
      : null;
  const hasErrors = titleError !== null || budgetError !== null || deadlineError !== null;

  const blur = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || hasErrors) return;
    setIsSubmitting(true);
    setError(null);

    const supabase = getSupabaseClient();
    const { data, error: insertError } = await supabase
      .from("campaigns")
      .insert({
        brand_id: user.id,
        title: title.trim(),
        description: description.trim(),
        budget: Number(budget),
        requirements: requirements.trim() || null,
        deliverables: deliverables.trim() || null,
        niche: niche || null,
        deadline: deadline || null,
        status: "active",
      })
      .select("id")
      .single();

    if (insertError) {
      setIsSubmitting(false);
      toast.error(t("errorGeneric"));
      const msg = insertError.message ?? "";
      if (
        insertError.code === "PGRST204" ||
        insertError.code === "42703" ||
        msg.includes("requirements") ||
        msg.includes("deadline") ||
        msg.includes("deliverables") ||
        msg.includes("column")
      ) {
        setError(t("errorMissingColumns"));
      } else {
        setError(t("errorGeneric"));
      }
      return;
    }

    toast.success(t("publishSuccess"));
    router.push(`/${locale}/marketplace/campaigns/${data.id}`);
  };

  return (
    <main className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/marketplace/campaigns">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t("back")}
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-paper rounded-lg p-6 md:p-8 border border-line"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-cream" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t("title")}</h1>
              <p className="text-sm text-neutral-500">{t("subtitle")}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("fieldTitle")}
                <RequiredMark />
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => blur("title")}
                placeholder={t("placeholderTitle")}
                className={`${inputClass} ${titleError ? "border-red-400" : ""}`}
              />
              {titleError && <FieldError message={titleError} />}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("fieldDescription")}
                <RequiredMark />
              </label>
              <textarea
                required
                rows={4}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("placeholderDescription")}
                className={inputClass}
              />
              <CharCount count={description.length} max={1000} />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {t("fieldBudget")}
                  <RequiredMark />
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  onBlur={() => blur("budget")}
                  placeholder={t("placeholderBudget")}
                  className={`${inputClass} ${budgetError ? "border-red-400" : ""}`}
                />
                {budgetError && <FieldError message={budgetError} />}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {t("fieldDeadline")}
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  onBlur={() => blur("deadline")}
                  className={`${inputClass} ${deadlineError ? "border-red-400" : ""}`}
                />
                {deadlineError && <FieldError message={deadlineError} />}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("fieldNiche")}
              </label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className={inputClass}
              >
                <option value="">{t("nichePlaceholder")}</option>
                {NICHE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("fieldRequirements")}
              </label>
              <textarea
                rows={3}
                maxLength={1000}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder={t("placeholderRequirements")}
                className={inputClass}
              />
              <CharCount count={requirements.length} max={1000} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("fieldDeliverables")}
              </label>
              <textarea
                rows={3}
                maxLength={1000}
                value={deliverables}
                onChange={(e) => setDeliverables(e.target.value)}
                placeholder={t("placeholderDeliverables")}
                className={inputClass}
              />
              <CharCount count={deliverables.length} max={1000} />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={hasErrors}
              className="w-full"
            >
              {t("submit")}
            </Button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}

export default function NewCampaignPage() {
  return (
    <CompanyGuard>
      <NewCampaignForm />
    </CompanyGuard>
  );
}
