"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  DollarSign,
  Users,
  ArrowRight,
  Briefcase,
  Heart,
  Clock,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth-guard";
import { MarqueeBanner } from "@/components/marquee-banner";
import { CampaignCardSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useSavedLists } from "@/contexts/saved-lists-context";
import { useAuth } from "@/contexts/auth-context";
import { getSupabaseClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/format";
import { daysUntil } from "@/lib/relative-time";
import { useTranslations, useLocale } from "next-intl";

function isNewCampaign(createdAt: string | null | undefined): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created < 7 * 24 * 60 * 60 * 1000;
}

function DeadlineChip({ deadline }: { deadline: string | null }) {
  const tc = useTranslations("common");
  const d = daysUntil(deadline);
  if (d === null || d > 7) return null;
  if (d === 0) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        {tc("deadlineToday")}
      </span>
    );
  }
  const urgent = d <= 3;
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
        urgent ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {urgent ? tc("deadlineUrgent", { days: d }) : tc("deadlineSoon", { days: d })}
    </span>
  );
}

const CATEGORIES = [
  "All",
  "Beauty",
  "Fashion",
  "Fitness",
  "Gaming",
  "Tech",
  "Food",
  "Travel",
  "Lifestyle",
];

interface CampaignRow {
  id: string;
  title: string;
  description: string | null;
  budget: number | null;
  niche: string | null;
  deadline: string | null;
  created_at: string;
  profiles: { name: string } | null;
  applications: { count: number }[];
}

function CampaignsPage() {
  const t = useTranslations("marketplace.campaignList");
  const locale = useLocale();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const { isCampaignSaved, toggleCampaign } = useSavedLists();
  const tc = useTranslations("common");

  const loadCampaigns = useCallback(async () => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("campaigns")
      .select("*, profiles(name), applications(count)")
      .eq("status", "active")
      .order("created_at", { ascending: false });
    if (error) {
      setLoadError(true);
    } else {
      setCampaigns((data ?? []) as unknown as CampaignRow[]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      await loadCampaigns();
    })();
  }, [loadCampaigns]);

  const retryLoad = () => {
    setIsLoading(true);
    setLoadError(false);
    loadCampaigns();
  };

  const filteredCampaigns = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (selectedCategory !== "All" && c.niche !== selectedCategory) return false;
      if (q) {
        const brandName = c.profiles?.name?.toLowerCase() ?? "";
        if (
          !c.title.toLowerCase().includes(q) &&
          !brandName.includes(q) &&
          !(c.description ?? "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [campaigns, selectedCategory, searchQuery]);

  const appliedCount = (c: CampaignRow) => c.applications?.[0]?.count ?? 0;

  return (
    <main className="min-h-screen bg-cream pt-24 pb-16 overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="relative overflow-hidden text-center mb-10">
          <span aria-hidden className="bg-outline-word top-[-0.22em]">
            DEALS
          </span>
          <div className="relative">
            <span className="oval-label">{t("kicker")}</span>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 my-4">
              {t("heading")}
            </h1>
            <p className="font-quote text-xl text-ink-soft">{t("subheading")}</p>
          </div>
        </div>
      </div>

      {/* Marquee band */}
      <MarqueeBanner
        items={t.raw("marqueeItems") as string[]}
        className="relative left-1/2 -translate-x-1/2 w-screen mb-10"
      />

      <div className="max-w-7xl mx-auto px-4">

        {/* Search & Filters */}
        <div className="bg-paper rounded-lg border border-line p-6 mb-8">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                className="w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-cream"
                    : "bg-neutral-100 text-neutral-700 hover:bg-primary-soft"
                }`}
              >
                {cat === "All" ? t("categoryAll") : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            <CampaignCardSkeleton />
            <CampaignCardSkeleton />
            <CampaignCardSkeleton />
          </div>
        )}

        {/* Error */}
        {!isLoading && loadError && (
          <ErrorState onRetry={retryLoad} />
        )}

        {/* Empty state */}
        {!isLoading && !loadError && campaigns.length === 0 && (
          <div className="bg-paper rounded-lg p-12 border border-line text-center">
            <Megaphone className="w-14 h-14 text-neutral-300 mx-auto mb-4" />
            <p className="font-medium text-neutral-700 mb-1">{t("emptyTitle")}</p>
            <p className="text-sm text-neutral-500 mb-6">{t("emptyDesc")}</p>
            {(user?.role === "company" || user?.role === "admin") && (
              <Link href="/marketplace/campaigns/new">
                <Button>
                  {t("emptyCtaBrand")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* No search results */}
        {!isLoading && !loadError && campaigns.length > 0 && filteredCampaigns.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-neutral-500">{t("noResults")}</p>
          </div>
        )}

        {/* Campaigns List */}
        <div className="space-y-4">
          {filteredCampaigns.map((campaign, index) => {
            const daysLeft = daysUntil(campaign.deadline);
            const closingSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;
            return (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative bg-paper rounded-lg p-6 border border-line transition-all"
            >
              {closingSoon && (
                <span className="tag-dashed absolute top-3 right-3">
                  {t("closingSoon")}
                </span>
              )}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Applications count */}
                <div className="lg:w-24 flex lg:flex-col items-center gap-2 lg:gap-1">
                  <span className="font-quote text-sm text-ink-soft">
                    {tc("noPrefix")}{String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center text-cream">
                    <Users className="w-7 h-7" />
                  </div>
                  <span className="text-lg font-bold text-neutral-900">
                    {appliedCount(campaign)}
                  </span>
                  <span className="text-xs text-neutral-500 font-medium">
                    {t("applied")}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className={`flex items-center gap-3 mb-2 ${closingSoon ? "mt-3" : ""}`}>
                    <h3 className="font-bold text-lg">{campaign.profiles?.name ?? "—"}</h3>
                    {campaign.niche && (
                      <span className="rounded-full border border-primary px-3 py-0.5 text-xs uppercase tracking-wider text-primary">
                        {campaign.niche}
                      </span>
                    )}
                    {isNewCampaign(campaign.created_at) && (
                      <span className="tag-dashed">{t("newTag")}</span>
                    )}
                    <button
                      onClick={() => toggleCampaign(campaign.id)}
                      className={`ml-auto p-2 rounded-full transition-colors ${
                        isCampaignSaved(campaign.id)
                          ? "bg-primary-soft text-primary"
                          : "hover:bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isCampaignSaved(campaign.id) ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  <Link href={`/marketplace/campaigns/${campaign.id}`} className="group">
                    <h4 className="title-underline text-xl font-bold text-neutral-900 mb-2 hover:text-primary transition-colors">
                      {campaign.title}
                    </h4>
                  </Link>
                  <p className="text-neutral-600 mb-4 line-clamp-2">
                    {campaign.description}
                  </p>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-baseline gap-1 text-sm">
                      <DollarSign className="w-4 h-4 self-center text-green-500" />
                      <span className="font-quote text-lg">
                        {campaign.budget != null
                          ? `$${campaign.budget.toLocaleString()}`
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>
                        {campaign.deadline
                          ? formatDate(campaign.deadline, locale)
                          : t("noDeadline")}
                      </span>
                      <DeadlineChip deadline={campaign.deadline} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Briefcase className="w-4 h-4 text-primary" />
                      <span>
                        {t("posted")}{" "}
                        {formatDate(campaign.created_at, locale, { dateStyle: "medium" })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:w-48 flex flex-col justify-between">
                  <div className="text-right mb-4">
                    <p className="text-sm text-neutral-500">{t("deadline")}</p>
                    <p className="font-medium text-neutral-900">
                      {campaign.deadline
                        ? formatDate(campaign.deadline, locale)
                        : t("noDeadline")}
                    </p>
                    <div className="mt-1 flex lg:justify-end">
                      <DeadlineChip deadline={campaign.deadline} />
                    </div>
                  </div>
                  <Link href={`/marketplace/campaigns/${campaign.id}`}>
                    <Button className="w-full">
                      {t("viewDetails")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default function CampaignsPageWrapper() {
  return (
    <AuthGuard>
      <CampaignsPage />
    </AuthGuard>
  );
}
