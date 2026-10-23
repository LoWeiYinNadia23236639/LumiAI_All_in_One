"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, UserRound, AlertCircle } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { InfluencerGuard } from "@/components/role-guard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/contexts/auth-context";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { CreatorProfile, PlatformLink } from "@/types/marketplace";

const PLATFORM_OPTIONS = ["Instagram", "YouTube", "TikTok", "小紅書", "Other"];

const inputClass =
  "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary";

interface PlatformDraft {
  name: string;
  url: string;
  followers: string;
}

function CreatorEditForm() {
  const t = useTranslations("marketplace.creatorEdit");
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [rateMin, setRateMin] = useState("");
  const [rateMax, setRateMax] = useState("");
  const [platforms, setPlatforms] = useState<PlatformDraft[]>([]);
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabaseClient();
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data, error: loadErr }) => {
        if (loadErr || !data) {
          setLoadError(true);
          setIsLoading(false);
          return;
        }
        const profile = data as unknown as CreatorProfile;
        setBio(profile.bio ?? "");
        setLocation(profile.location ?? "");
        setAvatarUrl(profile.avatar_url ?? "");
        setRateMin(profile.rate_min != null ? String(profile.rate_min) : "");
        setRateMax(profile.rate_max != null ? String(profile.rate_max) : "");
        setPlatforms(
          (profile.platforms ?? []).map((p) => ({
            name: p.name || "Instagram",
            url: p.url ?? "",
            followers: p.followers != null ? String(p.followers) : "",
          }))
        );
        setPortfolioUrls(profile.portfolio_urls ?? []);
        setIsLoading(false);
      });
  }, [user]);

  const updatePlatform = (
    index: number,
    field: keyof PlatformDraft,
    value: string
  ) =>
    setPlatforms((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );

  const rateInvalid =
    rateMin.trim() !== "" &&
    rateMax.trim() !== "" &&
    !Number.isNaN(Number(rateMin)) &&
    !Number.isNaN(Number(rateMax)) &&
    Number(rateMin) > Number(rateMax);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rateInvalid) return;
    setIsSaving(true);
    setError(null);

    const platformsPayload: PlatformLink[] = platforms
      .filter((p) => p.url.trim() !== "")
      .map((p) => ({
        name: p.name,
        url: p.url.trim(),
        followers: p.followers.trim() !== "" ? Number(p.followers) || 0 : 0,
      }));
    const portfolioPayload = portfolioUrls.map((u) => u.trim()).filter(Boolean);

    const supabase = getSupabaseClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        bio: bio.trim() || null,
        location: location.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        rate_min: rateMin.trim() !== "" ? Number(rateMin) : null,
        rate_max: rateMax.trim() !== "" ? Number(rateMax) : null,
        platforms: platformsPayload,
        portfolio_urls: portfolioPayload,
      })
      .eq("id", user.id);

    setIsSaving(false);
    if (updateError) {
      toast.error(t("saveError"));
      setError(t("saveError"));
      return;
    }
    toast.success(t("saveSuccess"));
    router.push(`/${locale}/creators/${user.id}`);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-cream pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-paper rounded-lg p-6 md:p-8 border border-line animate-pulse h-96" />
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-cream pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{t("loadError")}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <Link href={user ? `/creators/${user.id}` : "/marketplace/talent"}>
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
              <UserRound className="w-6 h-6 text-cream" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t("title")}</h1>
              <p className="text-sm text-neutral-500">{t("subtitle")}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("fieldBio")}
              </label>
              <textarea
                rows={4}
                maxLength={500}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t("placeholderBio")}
                className={inputClass}
              />
              <p className="text-xs mt-1 text-right text-neutral-400">
                {bio.length}/500
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
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
                  {t("fieldAvatarUrl")}
                </label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder={t("placeholderAvatarUrl")}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {t("fieldRateMin")}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={rateMin}
                  onChange={(e) => setRateMin(e.target.value)}
                  placeholder={t("placeholderRateMin")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {t("fieldRateMax")}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={rateMax}
                  onChange={(e) => setRateMax(e.target.value)}
                  placeholder={t("placeholderRateMax")}
                  className={inputClass}
                />
              </div>
            </div>
            {rateInvalid && (
              <p className="text-xs text-red-600 -mt-3">
                {t("rateRangeInvalid")}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("fieldPlatforms")}
              </label>
              <div className="space-y-3">
                {platforms.map((platform, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap md:flex-nowrap gap-2 items-center"
                  >
                    <select
                      value={platform.name}
                      onChange={(e) =>
                        updatePlatform(index, "name", e.target.value)
                      }
                      className={`${inputClass} md:w-40`}
                    >
                      {PLATFORM_OPTIONS.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={platform.url}
                      onChange={(e) =>
                        updatePlatform(index, "url", e.target.value)
                      }
                      placeholder={t("placeholderPlatformUrl")}
                      className={`${inputClass} flex-1`}
                    />
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={platform.followers}
                      onChange={(e) =>
                        updatePlatform(index, "followers", e.target.value)
                      }
                      placeholder={t("placeholderPlatformFollowers")}
                      className={`${inputClass} md:w-36`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPlatforms((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="p-2 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() =>
                  setPlatforms((prev) => [
                    ...prev,
                    { name: "Instagram", url: "", followers: "" },
                  ])
                }
              >
                <Plus className="w-4 h-4 mr-1" />
                {t("addPlatform")}
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("fieldPortfolio")}
              </label>
              <div className="space-y-2">
                {portfolioUrls.map((url, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) =>
                        setPortfolioUrls((prev) =>
                          prev.map((u, i) =>
                            i === index ? e.target.value : u
                          )
                        )
                      }
                      placeholder={t("placeholderPortfolioUrl")}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPortfolioUrls((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="p-2 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setPortfolioUrls((prev) => [...prev, ""])}
              >
                <Plus className="w-4 h-4 mr-1" />
                {t("addPortfolioUrl")}
              </Button>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              isLoading={isSaving}
              disabled={rateInvalid}
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

export default function CreatorEditPage() {
  return (
    <InfluencerGuard>
      <CreatorEditForm />
    </InfluencerGuard>
  );
}
