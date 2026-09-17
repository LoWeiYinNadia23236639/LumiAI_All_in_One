"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Camera,
  Mic,
  Lightbulb,
  Plane,
  Package,
  MapPin,
  ArrowRight,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth-guard";
import { MarqueeBanner } from "@/components/marquee-banner";
import { EquipmentCardSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

const CATEGORY_IDS = ["all", "camera", "lighting", "audio", "drone", "accessory"] as const;

const CATEGORY_ICONS: Record<string, typeof Camera> = {
  camera: Camera,
  lighting: Lightbulb,
  audio: Mic,
  drone: Plane,
  accessory: Package,
};

interface GearRow {
  id: string;
  title: string;
  category: string;
  price_per_day: number | null;
  deposit: number | null;
  description: string | null;
  location: string | null;
  includes: string[] | null;
  condition: string | null;
  status: string;
  created_at: string;
  profiles: { name: string } | null;
}

function isNewListing(createdAt: string | null | undefined): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created < 7 * 24 * 60 * 60 * 1000;
}

function conditionBadgeClass(condition: string | null) {
  switch (condition) {
    case "Like New":
      return "bg-blue-100 text-blue-700";
    case "Excellent":
      return "bg-green-100 text-green-700";
    case "Good":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-neutral-100 text-neutral-600";
  }
}

function EquipmentPage() {
  const t = useTranslations("equipment");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [gears, setGears] = useState<GearRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const fetchGears = useCallback(async () => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("gears")
      .select("*, profiles(name)")
      .eq("status", "available")
      .order("created_at", { ascending: false });
    if (error) {
      setLoadError(true);
    } else {
      setGears((data ?? []) as unknown as GearRow[]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const supabase = getSupabaseClient();
    (async () => {
      const { data, error } = await supabase
        .from("gears")
        .select("*, profiles(name)")
        .eq("status", "available")
        .order("created_at", { ascending: false });
      if (error) {
        setLoadError(true);
      } else {
        setGears((data ?? []) as unknown as GearRow[]);
      }
      setIsLoading(false);
    })();
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    setLoadError(false);
    fetchGears();
  };

  const filtered = gears.filter((item) => {
    if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const haystack = [item.title, item.description, item.location]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <main className="min-h-screen bg-cream pt-24 pb-16 overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="relative overflow-hidden text-center mb-10">
          <div className="bg-outline-word top-[-0.22em]">GEAR</div>
          <div className="oval-label mb-4">{t("kicker")}</div>
          <h1 className="text-4xl md:text-5xl font-bold text-ink mb-4">
            {t("bookLikeHotel")} <span className="text-ink">Hotel</span>
          </h1>
          <p className="font-quote text-xl md:text-2xl text-ink-soft max-w-2xl mx-auto">
            {t("searchSubtitle")}
          </p>
        </div>
      </div>

      {/* Marquee band */}
      <MarqueeBanner
        items={t.raw("marqueeItems") as string[]}
        className="relative left-1/2 -translate-x-1/2 w-screen mb-10"
      />

      <div className="max-w-7xl mx-auto px-4">

        {/* Search + list CTA */}
        <div className="bg-paper rounded-lg border p-4 md:p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder={t("listing.searchPlaceholder")}
                className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link href="/equipment/new" className="shrink-0">
              <Button className="w-full md:w-auto py-3 h-auto">
                <PlusCircle className="w-5 h-5 mr-2" />
                {t("listYourGear")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-8">
          {CATEGORY_IDS.map((cat) => {
            const Icon = cat === "all" ? Camera : CATEGORY_ICONS[cat];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-cream"
                    : "bg-paper text-neutral-700 border hover:border-primary/40"
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {t(`category.${cat}`)}
              </button>
            );
          })}
        </div>

        {/* Equipment Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EquipmentCardSkeleton />
            <EquipmentCardSkeleton />
            <EquipmentCardSkeleton />
          </div>
        ) : loadError ? (
          <ErrorState onRetry={handleRetry} />
        ) : filtered.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-lg bg-primary-soft flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold text-lg text-neutral-900 mb-1">
              {t("listing.emptyTitle")}
            </h3>
            <p className="text-sm text-neutral-500 mb-6 max-w-md mx-auto">
              {t("listing.emptyDesc")}
            </p>
            <Link href="/equipment/new">
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                {t("listYourGear")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, index) => {
              const Icon = CATEGORY_ICONS[item.category] ?? Package;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/equipment/${item.id}`}
                    className="block bg-paper rounded-lg overflow-hidden border hover:border-primary/40 transition-all group"
                  >
                    {/* Image Area */}
                    <div className="h-48 bg-primary-soft/50 flex items-center justify-center relative">
                      <div className="w-20 h-20 rounded-lg bg-paper/80 backdrop-blur flex items-center justify-center">
                        <Icon className="w-10 h-10 text-primary" />
                      </div>
                      <span className="absolute top-4 left-4 font-quote text-sm text-ink-soft">
                        {t("listing.noPrefix")}{String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        {isNewListing(item.created_at) && (
                          <span className="tag-dashed bg-paper/90 backdrop-blur">{t("listing.newListingTag")}</span>
                        )}
                        <div className="bg-paper/90 backdrop-blur rounded-full border border-primary px-3 py-0.5 text-xs uppercase tracking-wider text-primary">
                          <span>{t(`category.${item.category}`)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="title-underline font-bold text-lg group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>

                      {item.location && (
                        <div className="flex items-center gap-1 text-sm text-neutral-600 mt-1">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-3 mb-4">
                        {item.condition && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${conditionBadgeClass(item.condition)}`}>
                            <span className="text-accent">✦</span> {t(`conditionValue.${item.condition}`)}
                          </span>
                        )}
                        <span className="text-xs text-neutral-500">•</span>
                        <span className="text-xs text-neutral-600 truncate">
                          {t("listing.by", { name: item.profiles?.name ?? "—" })}
                        </span>
                      </div>

                      {item.includes && item.includes.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-neutral-500 mb-2">{t("includes")}:</p>
                          <div className="flex flex-wrap gap-1">
                            {item.includes.slice(0, 3).map((inc, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                {inc}
                              </span>
                            ))}
                            {item.includes.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                {t("listing.moreItems", { count: item.includes.length - 3 })}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <p className="leading-none">
                          <span className="font-quote text-3xl text-neutral-900">
                            ${item.price_per_day != null ? item.price_per_day : "—"}
                          </span>{" "}
                          <span className="text-ink-soft text-sm">{t("perDay")}</span>
                        </p>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                          {t("requestToBook")}
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default function EquipmentPageWrapper() {
  return (
    <AuthGuard>
      <EquipmentPage />
    </AuthGuard>
  );
}
