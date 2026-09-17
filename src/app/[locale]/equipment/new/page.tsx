"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, AlertCircle } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { InfluencerGuard } from "@/components/role-guard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/contexts/auth-context";
import { getSupabaseClient } from "@/lib/supabase/client";

const CATEGORIES = ["camera", "lighting", "audio", "drone", "accessory"] as const;
const CONDITIONS = ["Like New", "Excellent", "Good", "Fair"] as const;

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

function NewGearForm() {
  const t = useTranslations("equipment.newGear");
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [includes, setIncludes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const titleError =
    (touched.title || title.length > 0) && title.trim().length < 3
      ? t("validation.titleTooShort")
      : null;
  const priceError =
    (touched.price || price.length > 0) &&
    (price === "" || Number.isNaN(Number(price)) || Number(price) <= 0)
      ? t("validation.priceInvalid")
      : null;
  const depositError =
    (touched.deposit || deposit.length > 0) &&
    deposit !== "" &&
    (Number.isNaN(Number(deposit)) || Number(deposit) < 0)
      ? t("validation.depositInvalid")
      : null;
  const hasErrors =
    titleError !== null ||
    priceError !== null ||
    depositError !== null ||
    title.trim().length < 3 ||
    category === "" ||
    price === "" ||
    Number.isNaN(Number(price)) ||
    Number(price) <= 0;

  const blur = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || hasErrors) return;
    setIsSubmitting(true);
    setError(null);

    const supabase = getSupabaseClient();
    const { data, error: insertError } = await supabase
      .from("gears")
      .insert({
        owner_id: user.id,
        title: title.trim(),
        category,
        price_per_day: Number(price),
        deposit: deposit !== "" ? Number(deposit) : null,
        location: location.trim() || null,
        condition: condition || null,
        description: description.trim() || null,
        includes: includes
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        status: "available",
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
        msg.includes("column") ||
        msg.includes("relation")
      ) {
        setError(t("errorMissingColumns"));
      } else {
        setError(t("errorGeneric"));
      }
      return;
    }

    toast.success(t("publishSuccess"));
    router.push(`/${locale}/equipment/${data.id}`);
  };

  return (
    <main className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/equipment">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t("back")}
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-paper rounded-lg p-6 md:p-8 border"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <Camera className="w-6 h-6 text-cream" />
            </div>
            <div>
              <span className="oval-label mb-2">{t("kicker")}</span>
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

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {t("fieldCategory")}
                  <RequiredMark />
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClass}
                >
                  <option value="">{t("categoryPlaceholder")}</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {t(`category.${c}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {t("fieldCondition")}
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className={inputClass}
                >
                  <option value="">{t("conditionPlaceholder")}</option>
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {t(`conditionValue.${c}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {t("fieldPrice")}
                  <RequiredMark />
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  onBlur={() => blur("price")}
                  placeholder={t("placeholderPrice")}
                  className={`${inputClass} ${priceError ? "border-red-400" : ""}`}
                />
                {priceError && <FieldError message={priceError} />}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {t("fieldDeposit")}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  onBlur={() => blur("deposit")}
                  placeholder={t("placeholderDeposit")}
                  className={`${inputClass} ${depositError ? "border-red-400" : ""}`}
                />
                {depositError && <FieldError message={depositError} />}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("fieldLocation")}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t("placeholderLocation")}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("fieldDescription")}
              </label>
              <textarea
                rows={4}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("placeholderDescription")}
                className={inputClass}
              />
              <CharCount count={description.length} max={1000} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("fieldIncludes")}
              </label>
              <textarea
                rows={4}
                value={includes}
                onChange={(e) => setIncludes(e.target.value)}
                placeholder={t("placeholderIncludes")}
                className={inputClass}
              />
              <p className="text-xs text-neutral-400 mt-1">{t("includesHelp")}</p>
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

export default function NewGearPage() {
  return (
    <InfluencerGuard>
      <NewGearForm />
    </InfluencerGuard>
  );
}
