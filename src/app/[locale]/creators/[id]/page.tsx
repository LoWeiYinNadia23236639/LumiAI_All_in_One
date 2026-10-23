"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Star,
  Instagram,
  Youtube,
  Music2,
  BookOpen,
  Link2,
  ExternalLink,
  FileText,
  MessageSquare,
  Pencil,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth-guard";
import { ShareButton } from "@/components/share-button";
import { Skeleton, ListRowSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useAuth } from "@/contexts/auth-context";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { callApi } from "@/lib/api/client";
import { useTranslations, useLocale } from "next-intl";
import { formatRelativeTime } from "@/lib/relative-time";
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

interface CollaborationRow {
  id: string;
  status: string;
  campaigns: { id: string; title: string; status: string } | null;
}

interface ProfileReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer: { name: string } | null;
  campaigns: { title: string } | null;
}

function CreatorDetailPage() {
  const t = useTranslations("marketplace");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const params = useParams();
  const creatorId = params.id as string;
  const { user } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [reviews, setReviews] = useState<ProfileReview[]>([]);
  const [collaborations, setCollaborations] = useState<CollaborationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [offerOpen, setOfferOpen] = useState(false);
  const [offerCampaigns, setOfferCampaigns] = useState<{ id: string; title: string }[]>([]);
  const [offerCampaignId, setOfferCampaignId] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [offerSending, setOfferSending] = useState(false);

  const isBrandViewer = !!user && (user.role === "company" || user.role === "admin");
  const canOffer = isBrandViewer && !!profile && profile.id !== user?.id;

  const openOfferModal = async () => {
    setOfferOpen(true);
    if (offerCampaigns.length > 0) return;
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from("campaigns")
      .select("id, title")
      .eq("brand_id", user?.id ?? "")
      .eq("status", "active")
      .order("created_at", { ascending: false });
    const rows = (data ?? []) as { id: string; title: string }[];
    setOfferCampaigns(rows);
    setOfferCampaignId((prev) => prev || rows[0]?.id || "");
  };

  const sendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canOffer || !offerCampaignId || offerSending) return;
    setOfferSending(true);
    try {
      await callApi("/api/offers", {
        creator_id: profile!.id,
        campaign_id: offerCampaignId,
        offered_price: offerPrice.trim() !== "" ? Number(offerPrice) : null,
        message: offerMessage.trim() || undefined,
      });
      toast.success(t("offerSent"));
      setOfferOpen(false);
      setOfferMessage("");
      setOfferPrice("");
    } catch {
      toast.error(t("offerError"));
    }
    setOfferSending(false);
  };

  useEffect(() => {
    if (!creatorId) return;
    const supabase = getSupabaseClient();
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", creatorId)
        .single();
      if (error || !data) {
        setLoadError(true);
        setIsLoading(false);
        return;
      }
      setProfile(data as unknown as CreatorProfile);
      setIsLoading(false);

      const { data: collabRows } = await supabase
        .from("applications")
        .select("id, status, campaigns(id, title, status)")
        .eq("creator_id", creatorId)
        .in("status", ["accepted"])
        .order("created_at", { ascending: false });
      setCollaborations((collabRows ?? []) as unknown as CollaborationRow[]);

      const { data: reviewRows } = await supabase
        .from("reviews")
        .select(
          "id, rating, comment, created_at, reviewer:profiles!reviews_reviewer_id_fkey(name), campaigns(title)"
        )
        .eq("reviewee_id", creatorId)
        .order("created_at", { ascending: false });
      setReviews((reviewRows ?? []) as unknown as ProfileReview[]);
    })();
  }, [creatorId]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-cream pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <Skeleton className="w-40 h-9 mb-6" />
          <div className="bg-paper rounded-xl border border-line p-8 mb-8 space-y-4">
            <div className="flex gap-6">
              <Skeleton className="w-32 h-32 rounded-xl" />
              <div className="flex-1 space-y-3 pt-4">
                <Skeleton className="w-64 h-8" />
                <Skeleton className="w-40 h-4" />
                <Skeleton className="w-72 h-4" />
              </div>
            </div>
          </div>
          <Skeleton className="w-56 h-6 mb-4" />
          <ListRowSkeleton />
        </div>
      </main>
    );
  }

  if (loadError || !profile) {
    return (
      <main className="min-h-screen bg-cream pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <ErrorState />
        </div>
      </main>
    );
  }

  const isOwnProfile = !!user && user.id === profile.id;
  const portfolioUrls = (profile.portfolio_urls ?? []).filter(Boolean);
  const platforms = profile.platforms ?? [];

  return (
    <main className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Link */}
        <Link href="/marketplace/talent">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("backToCreators")}
          </Button>
        </Link>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-paper rounded-xl border border-line overflow-hidden mb-8"
        >
          <div className="h-48 bg-primary" />

          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 -mt-16 mb-6">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-32 h-32 rounded-xl object-cover border-4 border-paper"
                />
              ) : (
                <div className="w-32 h-32 rounded-xl bg-primary flex items-center justify-center text-cream text-4xl font-bold border-4 border-paper">
                  {profile.name
                    .split(" ")
                    .map((w) => w[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "?"}
                </div>
              )}
              <div className="flex-1 pt-4 md:pt-16">
                <h1 className="text-3xl font-bold text-neutral-900">
                  {profile.name || "—"}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-neutral-600">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </span>
                  )}
                  {profile.niche && (
                    <span className="px-3 py-1 bg-primary-soft text-primary rounded-full text-xs font-medium">
                      {profile.niche}
                    </span>
                  )}
                </div>
              </div>
              <div className="pt-4 md:pt-16 flex flex-col gap-2">
                <div className="text-right mb-2">
                  <p className="text-sm text-neutral-500">{t("rateRange")}</p>
                  <p className="text-xl font-bold text-neutral-900">
                    {formatRateRange(profile.rate_min, profile.rate_max)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <ShareButton />
                  {isOwnProfile ? (
                    <Link href="/creators/edit">
                      <Button variant="outline">
                        <Pencil className="w-4 h-4 mr-2" />
                        {t("editProfile")}
                      </Button>
                    </Link>
                  ) : canOffer ? (
                    <Button onClick={openOfferModal}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {t("sendOffer")}
                    </Button>
                  ) : (
                    <Button disabled title={t("sendOfferSoon")}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {t("sendOffer")}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-neutral-700 mb-6 whitespace-pre-line">
                {profile.bio}
              </p>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: t("followers"), value: formatFollowers(profile.follower_count ?? 0) },
                { label: t("platforms"), value: String(platforms.length) },
                { label: t("collaborations"), value: String(collaborations.length) },
              ].map((stat, i) => (
                <div key={i} className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-lg font-bold text-neutral-900">{stat.value}</p>
                  <p className="text-xs text-neutral-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Social Links */}
            {platforms.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {platforms.map((platform, i) => {
                  const Icon = platformIcon(platform.name);
                  return (
                    <a
                      key={i}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {platform.name}
                      {platform.followers > 0 && (
                        <span className="text-neutral-500">
                          · {formatFollowers(platform.followers)}
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Portfolio */}
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-primary" />
                {t("portfolio")}
              </h3>
              {portfolioUrls.length === 0 ? (
                <div className="bg-paper rounded-lg border border-line p-6">
                  <p className="text-sm text-neutral-500">{t("noPortfolio")}</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {portfolioUrls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-paper rounded-lg border border-line hover:border-primary transition-colors"
                    >
                      <FileText className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-sm text-neutral-700 truncate flex-1">
                        {url.replace(/^https?:\/\//, "")}
                      </span>
                      <ExternalLink className="w-4 h-4 text-neutral-400 shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Previous Collaborations */}
            <div>
              <h3 className="font-bold text-lg mb-4">{t("previousWork")}</h3>
              {collaborations.length === 0 ? (
                <div className="bg-paper rounded-lg border border-line p-6">
                  <p className="text-sm text-neutral-500">
                    {t("noCollaborations")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {collaborations.map((collab) => (
                    <Link
                      key={collab.id}
                      href={`/marketplace/campaigns/${collab.campaigns?.id ?? ""}`}
                      className="block p-4 bg-paper rounded-lg border border-line hover:border-primary transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold truncate">
                          {collab.campaigns?.title ?? "—"}
                        </h4>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${
                            collab.campaigns?.status === "completed"
                              ? "bg-neutral-200 text-neutral-500"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {collab.campaigns?.status === "completed"
                            ? t("collabStatus.completed")
                            : t("collabStatus.ongoing")}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reviews */}
            <div className="bg-paper rounded-lg border border-line p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                {t("brandReviews")}
                {reviews.length > 0 && (
                  <span className="ml-auto flex items-center gap-1 text-sm font-medium text-neutral-700">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
                    <span className="text-neutral-400 font-normal">
                      ({reviews.length})
                    </span>
                  </span>
                )}
              </h3>
              {reviews.length === 0 ? (
                <div className="text-center py-6">
                  <Star className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">{t("reviewsEmpty")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">
                          {review.reviewer?.name ?? "—"}
                        </p>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.campaigns?.title && (
                        <p className="text-xs text-primary mb-1">
                          {review.campaigns.title}
                        </p>
                      )}
                      {review.comment && (
                        <p className="text-sm text-neutral-600 mb-1 whitespace-pre-line">
                          {review.comment}
                        </p>
                      )}
                      <p className="text-xs text-neutral-400">
                        {formatRelativeTime(review.created_at, locale)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Send Offer modal */}
      {offerOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-paper rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="font-bold text-lg mb-1">
              {t("offerModalTitle", { name: profile?.name ?? "" })}
            </h3>
            <p className="text-sm text-neutral-500 mb-4">{t("offerModalDesc")}</p>
            <form onSubmit={sendOffer} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {t("offerCampaignLabel")}
                  <span className="text-red-500"> *</span>
                </label>
                <select
                  required
                  value={offerCampaignId}
                  onChange={(e) => setOfferCampaignId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {offerCampaigns.length === 0 && (
                    <option value="">{t("offerNoCampaigns")}</option>
                  )}
                  {offerCampaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {t("offerPriceLabel")}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder={t("offerPricePlaceholder")}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {t("offerMessageLabel")}
                </label>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  placeholder={t("offerMessagePlaceholder")}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOfferOpen(false)}
                >
                  {tCommon("cancel")}
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={offerSending}
                  disabled={!offerCampaignId}
                >
                  {t("offerSendButton")}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </main>
  );
}

export default function CreatorDetailPageWrapper() {
  return (
    <AuthGuard>
      <CreatorDetailPage />
    </AuthGuard>
  );
}
