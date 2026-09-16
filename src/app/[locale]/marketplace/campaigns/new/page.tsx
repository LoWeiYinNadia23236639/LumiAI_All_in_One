"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Megaphone, AlertCircle } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { CompanyGuard } from "@/components/role-guard";
import { Button } from "@/components/ui/button";
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
  "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-pink-500";

function NewCampaignForm() {
  const t = useTranslations("marketplace.newCampaign");
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [requirements, setRequirements] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [niche, setNiche] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
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

    router.push(`/${locale}/marketplace/campaigns/${data.id}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-pink-50/30 to-white pt-24 pb-16">
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
          className="bg-white rounded-2xl p-6 md:p-8 border shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-white" />
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
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("placeholderTitle")}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("fieldDescription")}
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("placeholderDescription")}
                className={inputClass}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {t("fieldBudget")}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder={t("placeholderBudget")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {t("fieldDeadline")}
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={inputClass}
                />
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
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder={t("placeholderRequirements")}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("fieldDeliverables")}
              </label>
              <textarea
                rows={3}
                value={deliverables}
                onChange={(e) => setDeliverables(e.target.value)}
                placeholder={t("placeholderDeliverables")}
                className={inputClass}
              />
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
              className="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white"
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
