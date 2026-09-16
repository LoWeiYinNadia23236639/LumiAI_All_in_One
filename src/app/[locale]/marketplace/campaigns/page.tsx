"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useSavedLists } from "@/contexts/saved-lists-context";
import { useAuth } from "@/contexts/auth-context";
import { getSupabaseClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/format";
import { useTranslations, useLocale } from "next-intl";

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

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase
      .from("campaigns")
      .select("*, profiles(name), applications(count)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setLoadError(true);
        } else {
          setCampaigns((data ?? []) as unknown as CampaignRow[]);
        }
        setIsLoading(false);
      });
  }, []);

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
    <main className="min-h-screen bg-gradient-to-b from-white via-pink-50/30 to-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-violet-100 text-pink-700 text-sm font-semibold mb-4">
            <Briefcase className="w-4 h-4" />
            {t("badge")}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            {t("heading")}
          </h1>
          <p className="text-lg text-neutral-600">{t("subheading")}</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                className="w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                    ? "bg-pink-500 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-pink-100"
                }`}
              >
                {cat === "All" ? t("categoryAll") : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-24 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-neutral-500">{t("loading")}</p>
          </div>
        )}

        {/* Error */}
        {!isLoading && loadError && (
          <div className="py-24 text-center">
            <p className="text-neutral-700 font-medium mb-1">{t("loadError")}</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !loadError && campaigns.length === 0 && (
          <div className="bg-white rounded-2xl p-12 border shadow-sm text-center">
            <Megaphone className="w-14 h-14 text-neutral-300 mx-auto mb-4" />
            <p className="font-medium text-neutral-700 mb-1">{t("emptyTitle")}</p>
            <p className="text-sm text-neutral-500 mb-6">{t("emptyDesc")}</p>
            {(user?.role === "company" || user?.role === "admin") && (
              <Link href="/marketplace/campaigns/new">
                <Button className="bg-gradient-to-r from-pink-500 to-violet-500 text-white">
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
          {filteredCampaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Applications count */}
                <div className="lg:w-24 flex lg:flex-col items-center gap-2 lg:gap-1">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center text-white">
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
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">{campaign.profiles?.name ?? "—"}</h3>
                    {campaign.niche && (
                      <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full">
                        {campaign.niche}
                      </span>
                    )}
                    <button
                      onClick={() => toggleCampaign(campaign.id)}
                      className={`ml-auto p-2 rounded-full transition-colors ${
                        isCampaignSaved(campaign.id)
                          ? "bg-pink-100 text-pink-600"
                          : "hover:bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isCampaignSaved(campaign.id) ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  <Link href={`/marketplace/campaigns/${campaign.id}`}>
                    <h4 className="text-xl font-bold text-neutral-900 mb-2 hover:text-pink-600 transition-colors">
                      {campaign.title}
                    </h4>
                  </Link>
                  <p className="text-neutral-600 mb-4 line-clamp-2">
                    {campaign.description}
                  </p>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="font-medium">
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
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Briefcase className="w-4 h-4 text-violet-500" />
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
                  </div>
                  <Link href={`/marketplace/campaigns/${campaign.id}`}>
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white">
                      {t("viewDetails")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
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
