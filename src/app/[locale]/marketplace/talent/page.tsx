"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Users,
  ArrowUpRight,
  Instagram,
  Youtube,
  Music2,
  BookOpen,
  Link2,
  MapPin,
  Heart,
  CheckCircle,
  BarChart3,
  Star,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth-guard";
import { ErrorState } from "@/components/ui/error-state";
import { useSavedLists } from "@/contexts/saved-lists-context";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import type { CreatorProfile } from "@/types/marketplace";

const PLATFORM_ICONS: Record<string, LucideIcon> = {
  Instagram,
  YouTube: Youtube,
  TikTok: Music2,
  小紅書: BookOpen,
  Other: Link2,
};

function platformIcon(name: string): LucideIcon {
  return PLATFORM_ICONS[name] ?? Link2;
}

function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

function formatRateRange(min: number | null, max: number | null): string {
  if (min == null && max == null) return "—";
  if (min != null && max != null) return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
  if (min != null) return `$${min.toLocaleString()}+`;
  return `≤ $${max!.toLocaleString()}`;
}

type RateFilter = "all" | "u500" | "r500_2000" | "r2000_5000" | "o5000";

function rateFilterMatch(filter: RateFilter, profile: CreatorProfile): boolean {
  if (filter === "all") return true;
  const min = profile.rate_min ?? 0;
  const max = profile.rate_max ?? Number.MAX_SAFE_INTEGER;
  switch (filter) {
    case "u500":
      return min < 500;
    case "r500_2000":
      return min <= 2000 && max >= 500;
    case "r2000_5000":
      return min <= 5000 && max >= 2000;
    case "o5000":
      return max >= 5000;
    default:
      return true;
  }
}

function TalentPage() {
  const t = useTranslations("marketplace");
  const tCommon = useTranslations("common");
  const [selectedNiche, setSelectedNiche] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [rateFilter, setRateFilter] = useState<RateFilter>("all");
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const { isCreatorSaved, toggleCreator } = useSavedLists();

  const nicheOptions = t.raw("nicheOptions") as { value: string; label: string }[];
  const rateOptions: { value: RateFilter; labelKey: string }[] = [
    { value: "all", labelKey: "rateFilterAll" },
    { value: "u500", labelKey: "rateFilterU500" },
    { value: "r500_2000", labelKey: "rateFilter500to2000" },
    { value: "r2000_5000", labelKey: "rateFilter2000to5000" },
    { value: "o5000", labelKey: "rateFilterO5000" },
  ];

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "creator")
      .order("follower_count", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setLoadError(true);
        } else {
          setCreators((data ?? []) as unknown as CreatorProfile[]);
        }
        setIsLoading(false);
      });
  }, []);

  const filteredCreators = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const loc = locationQuery.trim().toLowerCase();
    return creators.filter((c) => {
      if (selectedNiche !== "All" && c.niche !== selectedNiche) return false;
      if (!rateFilterMatch(rateFilter, c)) return false;
      if (loc && !(c.location ?? "").toLowerCase().includes(loc)) return false;
      if (q && !c.name.toLowerCase().includes(q) && !(c.bio ?? "").toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [creators, selectedNiche, rateFilter, locationQuery, searchQuery]);

  const avgFollowers = creators.length
    ? Math.round(creators.reduce((sum, c) => sum + (c.follower_count ?? 0), 0) / creators.length)
    : 0;
  const locationsCount = new Set(
    creators.map((c) => (c.location ?? "").trim()).filter(Boolean)
  ).size;

  return (
    <main className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-soft text-primary text-sm font-semibold mb-4">
            <Users className="w-4 h-4" />
            {t("discoverCreators")}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            {t.rich("findPerfectCreator", {
              creator: (chunks) => <span className="gradient-text">{chunks}</span>,
            })}
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {t("talentSubtitle")}
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { value: creators.length.toLocaleString(), label: t("activeCreators"), icon: Users },
            { value: locationsCount.toLocaleString(), label: t("statLocations"), icon: MapPin },
            { value: formatFollowers(avgFollowers), label: t("statAvgFollowers"), icon: BarChart3 },
            { value: "4.8", label: t("statCreatorRating"), icon: Star },
          ].map((stat, i) => (
            <div key={i} className="bg-paper rounded-lg p-4 border border-line flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-soft flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-xs text-neutral-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-paper rounded-lg border border-line p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder={t("searchCreatorsPlaceholder")}
                className="w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="md:w-64 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder={t("searchLocationPlaceholder")}
                className="w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
            </div>
            <div className="md:w-56 relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <select
                value={rateFilter}
                onChange={(e) => setRateFilter(e.target.value as RateFilter)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
              >
                {rateOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {nicheOptions.map((niche) => (
              <button
                key={niche.value}
                onClick={() => setSelectedNiche(niche.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedNiche === niche.value
                    ? "bg-primary text-cream"
                    : "bg-neutral-100 text-neutral-700 hover:bg-primary-soft"
                }`}
              >
                {niche.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Error */}
        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-paper rounded-lg p-6 border border-line animate-pulse h-72"
              />
            ))}
          </div>
        )}
        {!isLoading && loadError && (
          <ErrorState onRetry={() => window.location.reload()} />
        )}

        {/* Empty state */}
        {!isLoading && !loadError && creators.length === 0 && (
          <div className="bg-paper rounded-lg p-12 border border-line text-center">
            <UserRound className="w-14 h-14 text-neutral-300 mx-auto mb-4" />
            <p className="font-medium text-neutral-700 mb-1">{t("talentEmptyTitle")}</p>
            <p className="text-sm text-neutral-500">{t("talentEmptyDesc")}</p>
          </div>
        )}
        {!isLoading && !loadError && creators.length > 0 && filteredCreators.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-neutral-500">{t("talentNoResults")}</p>
          </div>
        )}

        {/* Creators Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map((creator, index) => (
            <motion.div
              key={creator.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-paper rounded-lg p-6 border border-line hover:-translate-y-1 transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {creator.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={creator.avatar_url}
                      alt={creator.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-cream text-lg font-bold">
                      {creator.name
                        .split(" ")
                        .map((w) => w[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join("")
                        .toUpperCase() || "?"}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{creator.name || "—"}</h3>
                      {creator.is_admin && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {(creator.platforms ?? []).slice(0, 3).map((p, i) => {
                        const Icon = platformIcon(p.name);
                        return <Icon key={i} className="w-3.5 h-3.5 text-neutral-400" />;
                      })}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleCreator(creator.id)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Heart className={`w-5 h-5 ${isCreatorSaved(creator.id) ? "text-pink-500 fill-pink-500" : "text-gray-400"}`} />
                </button>
              </div>

              {/* Niche & Location */}
              <div className="flex flex-wrap gap-2 mb-3">
                {creator.niche && (
                  <span className="px-3 py-1 bg-primary-soft text-primary rounded-full text-xs font-medium">
                    {creator.niche}
                  </span>
                )}
                {creator.location && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {creator.location}
                  </span>
                )}
              </div>

              {/* Bio */}
              <p className="text-sm text-neutral-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                {creator.bio ?? ""}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="font-bold text-neutral-900">
                    {formatFollowers(creator.follower_count ?? 0)}
                  </p>
                  <p className="text-xs text-neutral-500">{t("followers")}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="font-bold text-primary">
                    {(creator.platforms ?? []).length}
                  </p>
                  <p className="text-xs text-neutral-500">{t("platforms")}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-xs text-neutral-500">{t("rateRange")}</p>
                  <p className="font-bold text-neutral-900">
                    {formatRateRange(creator.rate_min, creator.rate_max)}
                  </p>
                </div>
                <Link href={`/creators/${creator.id}`}>
                  <Button size="sm">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    {tCommon("moreInfo")}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function TalentPageWrapper() {
  return (
    <AuthGuard>
      <TalentPage />
    </AuthGuard>
  );
}
