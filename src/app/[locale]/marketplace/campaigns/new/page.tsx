"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Megaphone,
  AlertCircle,
  DollarSign,
  Gift,
  Percent,
  Award,
  type LucideIcon,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { CompanyGuard } from "@/components/role-guard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/contexts/auth-context";
import { getSupabaseClient } from "@/lib/supabase/client";
import { CAMPAIGN_TYPES, type CampaignType } from "@/types/marketplace";

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

const TYPE_ICONS: Record<CampaignType, LucideIcon> = {
  paid: DollarSign,
  barter: Gift,
  affiliate: Percent,
  ambassador: Award,
};

const USAGE_RIGHTS_OPTIONS = [1, 3, 6, 12];
const REVIEW_ROUNDS_OPTIONS = [1, 2, 3];
const CONTRACT_MONTHS_OPTIONS = [6, 12];

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

  const [campaignType, setCampaignType] = useState<CampaignType | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [requirements, setRequirements] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [niche, setNiche] = useState("");
  const [deadline, setDeadline] = useState("");
  const [terms, setTerms] = useState("");
  const [usageRightsMonths, setUsageRightsMonths] = useState("3");
  const [reviewRounds, setReviewRounds] = useState("2");
  const [productName, setProductName] = useState("");
  const [productValue, setProductValue] = useState("");
  const [commissionRate, setCommissionRate] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [shopUrl, setShopUrl] = useState("");
  const [contractMonths, setContractMonths] = useState("6");
  const [retainerFee, setRetainerFee] = useState("");
  const [exclusivity, setExclusivity] = useState(false);
  const [startsOn, setStartsOn] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const budgetRequired = campaignType === "paid";
  const budgetVisible = campaignType === "paid" || campaignType === "affiliate";
  const deliverablesOptional =
    campaignType === "barter" || campaignType === "affiliate";

  const titleError =
    (touched.title || title.length > 0) && title.trim().length < 5
      ? t("validation.titleTooShort")
      : null;
  const budgetError =
    budgetVisible &&
    (budgetRequired || budget.length > 0) &&
    (touched.budget || budget.length > 0 || budgetRequired) &&
    (budget.trim() === "" ||
      Number.isNaN(Number(budget)) ||
      Number(budget) < (budgetRequired ? 0.01 : 0))
      ? budgetRequired
        ? t("validation.budgetInvalid")
        : t("validation.budgetOptionalInvalid")
      : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineError =
    (touched.deadline || deadline.length > 0) &&
    deadline !== "" &&
    new Date(`${deadline}T00:00:00`) < today
      ? t("validation.deadlinePast")
      : null;
  const productNameError =
    campaignType === "barter" &&
    (touched.productName || productName.length > 0) &&
    productName.trim().length === 0
      ? t("validation.productNameRequired")
      : null;
  const productValueError =
    campaignType === "barter" &&
    (touched.productValue || productValue.length > 0) &&
    (productValue.trim() === "" ||
      Number.isNaN(Number(productValue)) ||
      Number(productValue) < 0)
      ? t("validation.productValueInvalid")
      : null;
  const commissionError =
    campaignType === "affiliate" &&
    (touched.commissionRate || commissionRate.length > 0) &&
    (commissionRate.trim() === "" ||
      Number.isNaN(Number(commissionRate)) ||
      Number(commissionRate) < 1 ||
      Number(commissionRate) > 90)
      ? t("validation.commissionInvalid")
      : null;
  const discountCodeError =
    campaignType === "affiliate" &&
    (touched.discountCode || discountCode.length > 0) &&
    discountCode.trim().length === 0
      ? t("validation.discountCodeRequired")
      : null;
  const retainerError =
    campaignType === "ambassador" &&
    (touched.retainerFee || retainerFee.length > 0) &&
    (retainerFee.trim() === "" ||
      Number.isNaN(Number(retainerFee)) ||
      Number(retainerFee) < 0)
      ? t("validation.retainerInvalid")
      : null;
  const termsError =
    campaignType === "ambassador" &&
    (touched.terms || terms.length > 0) &&
    terms.trim().length === 0
      ? t("validation.termsRequired")
      : null;

  const hasErrors =
    titleError !== null ||
    budgetError !== null ||
    deadlineError !== null ||
    productNameError !== null ||
    productValueError !== null ||
    commissionError !== null ||
    discountCodeError !== null ||
    retainerError !== null ||
    termsError !== null;

  const blur = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !campaignType || hasErrors) return;
    setIsSubmitting(true);
    setError(null);

    const supabase = getSupabaseClient();
    const { data, error: insertError } = await supabase
      .from("campaigns")
      .insert({
        brand_id: user.id,
        title: title.trim(),
        description: description.trim(),
        campaign_type: campaignType,
        budget: budgetVisible && budget.trim() !== "" ? Number(budget) : 0,
        requirements: requirements.trim() || null,
        deliverables: deliverables.trim() || null,
        niche: niche || null,
        deadline: deadline || null,
        terms: terms.trim() || null,
        usage_rights_months: Number(usageRightsMonths),
        review_rounds: Number(reviewRounds),
        product_name:
          campaignType === "barter" ? productName.trim() || null : null,
        product_value:
          campaignType === "barter" && productValue.trim() !== ""
            ? Number(productValue)
            : 0,
        commission_rate:
          campaignType === "affiliate" && commissionRate.trim() !== ""
            ? Number(commissionRate)
            : null,
        discount_code:
          campaignType === "affiliate" ? discountCode.trim() || null : null,
        shop_url: campaignType === "affiliate" ? shopUrl.trim() || null : null,
        contract_months:
          campaignType === "ambassador" ? Number(contractMonths) : null,
        retainer_fee:
          campaignType === "ambassador" && retainerFee.trim() !== ""
            ? Number(retainerFee)
            : null,
        exclusivity: campaignType === "ambassador" ? exclusivity : false,
        starts_on: campaignType === "ambassador" ? startsOn || null : null,
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
        msg.includes("campaign_type") ||
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
            {/* Step 0: collaboration model */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("fieldCampaignType")}
                <RequiredMark />
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CAMPAIGN_TYPES.map((type) => {
                  const Icon = TYPE_ICONS[type];
                  const selected = campaignType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCampaignType(type)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        selected
                          ? "border-primary bg-primary-soft"
                          : "border-gray-200 hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            selected
                              ? "bg-primary text-cream"
                              : "bg-gray-100 text-neutral-500"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm">
                          {t(`typeCards.${type}.name`)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        {t(`typeCards.${type}.desc`)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {campaignType && (
              <>
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

                {campaignType === "barter" && (
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        {t("fieldProductName")}
                        <RequiredMark />
                      </label>
                      <input
                        type="text"
                        required
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        onBlur={() => blur("productName")}
                        placeholder={t("placeholderProductName")}
                        className={`${inputClass} ${productNameError ? "border-red-400" : ""}`}
                      />
                      {productNameError && <FieldError message={productNameError} />}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        {t("fieldProductValue")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={productValue}
                        onChange={(e) => setProductValue(e.target.value)}
                        onBlur={() => blur("productValue")}
                        placeholder={t("placeholderProductValue")}
                        className={`${inputClass} ${productValueError ? "border-red-400" : ""}`}
                      />
                      {productValueError && <FieldError message={productValueError} />}
                    </div>
                  </div>
                )}

                {campaignType === "affiliate" && (
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        {t("fieldCommissionRate")}
                        <RequiredMark />
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="90"
                        step="1"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(e.target.value)}
                        onBlur={() => blur("commissionRate")}
                        placeholder={t("placeholderCommissionRate")}
                        className={`${inputClass} ${commissionError ? "border-red-400" : ""}`}
                      />
                      {commissionError && <FieldError message={commissionError} />}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        {t("fieldDiscountCode")}
                        <RequiredMark />
                      </label>
                      <input
                        type="text"
                        required
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        onBlur={() => blur("discountCode")}
                        placeholder={t("placeholderDiscountCode")}
                        className={`${inputClass} ${discountCodeError ? "border-red-400" : ""}`}
                      />
                      {discountCodeError && <FieldError message={discountCodeError} />}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1.5">
                        {t("fieldShopUrl")}
                      </label>
                      <input
                        type="url"
                        value={shopUrl}
                        onChange={(e) => setShopUrl(e.target.value)}
                        placeholder={t("placeholderShopUrl")}
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}

                {campaignType === "ambassador" && (
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        {t("fieldContractMonths")}
                        <RequiredMark />
                      </label>
                      <select
                        value={contractMonths}
                        onChange={(e) => setContractMonths(e.target.value)}
                        className={inputClass}
                      >
                        {CONTRACT_MONTHS_OPTIONS.map((m) => (
                          <option key={m} value={m}>
                            {t("contractMonthsOption", { months: m })}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        {t("fieldRetainerFee")}
                        <RequiredMark />
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="1"
                        value={retainerFee}
                        onChange={(e) => setRetainerFee(e.target.value)}
                        onBlur={() => blur("retainerFee")}
                        placeholder={t("placeholderRetainerFee")}
                        className={`${inputClass} ${retainerError ? "border-red-400" : ""}`}
                      />
                      {retainerError && <FieldError message={retainerError} />}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        {t("fieldStartsOn")}
                      </label>
                      <input
                        type="date"
                        value={startsOn}
                        onChange={(e) => setStartsOn(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="flex items-end pb-3">
                      <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exclusivity}
                          onChange={(e) => setExclusivity(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 accent-[color:var(--color-primary)]"
                        />
                        {t("fieldExclusivity")}
                      </label>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-5">
                  {budgetVisible && (
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        {campaignType === "paid"
                          ? t("fieldBudget")
                          : t("fieldBudgetOptional")}
                        {budgetRequired && <RequiredMark />}
                      </label>
                      <input
                        type="number"
                        required={budgetRequired}
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
                  )}
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
                    placeholder={
                      deliverablesOptional
                        ? t("placeholderDeliverablesOptional")
                        : t("placeholderDeliverables")
                    }
                    className={inputClass}
                  />
                  <CharCount count={deliverables.length} max={1000} />
                </div>

                {(campaignType === "paid" || campaignType === "ambassador") && (
                  <>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">
                          {t("fieldUsageRights")}
                        </label>
                        <select
                          value={usageRightsMonths}
                          onChange={(e) => setUsageRightsMonths(e.target.value)}
                          className={inputClass}
                        >
                          {USAGE_RIGHTS_OPTIONS.map((m) => (
                            <option key={m} value={m}>
                              {t("usageRightsOption", { months: m })}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">
                          {t("fieldReviewRounds")}
                        </label>
                        <select
                          value={reviewRounds}
                          onChange={(e) => setReviewRounds(e.target.value)}
                          className={inputClass}
                        >
                          {REVIEW_ROUNDS_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {t("reviewRoundsOption", { rounds: r })}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        {t("fieldTerms")}
                        {campaignType === "ambassador" && <RequiredMark />}
                      </label>
                      <textarea
                        rows={3}
                        maxLength={2000}
                        required={campaignType === "ambassador"}
                        value={terms}
                        onChange={(e) => setTerms(e.target.value)}
                        onBlur={() => blur("terms")}
                        placeholder={t("placeholderTerms")}
                        className={`${inputClass} ${termsError ? "border-red-400" : ""}`}
                      />
                      {termsError && <FieldError message={termsError} />}
                    </div>
                  </>
                )}
              </>
            )}

            {error && (
              <div className="flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={!campaignType || hasErrors}
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
