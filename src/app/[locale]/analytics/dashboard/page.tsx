"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Heart,
  Eye,
  MessageSquare,
  Calendar,
  Target,
  Zap,
  ArrowRight,
  Star,
  Award,
  Gift,
  LogOut,
  Settings,
  Bookmark,
  Shield,
  CheckCircle,
  Camera,
  Plus,
  Package,
  ClipboardList,
  Pencil,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { InfluencerGuard } from "@/components/role-guard";
import { useAuth } from "@/contexts/auth-context";
import { useSavedLists } from "@/contexts/saved-lists-context";
import { getSupabaseClient } from "@/lib/supabase/client";
import { callApi } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import { useTranslations, useLocale } from "next-intl";

interface MyApplication {
  id: string;
  status: string;
  created_at: string;
  campaigns: { id: string; title: string; niche: string | null; profiles: { name: string } | null } | null;
}

interface PendingOffer {
  id: string;
  status: string;
  offered_price: number | null;
  message: string | null;
  created_at: string;
  campaigns: { id: string; title: string; profiles: { name: string } | null } | null;
}

interface MyGear {
  id: string;
  title: string;
  category: string;
  price_per_day: number | null;
  description: string | null;
  status: string;
  created_at: string;
}

interface RentalRecord {
  id: string;
  status: string;
  message: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
  gears: { id: string; title: string } | null;
  profiles?: { name: string } | null;
}

function gearStatusBadgeClass(status: string) {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-700";
    case "rented":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-neutral-200 text-neutral-500";
  }
}

function rentalStatusBadgeClass(status: string) {
  switch (status) {
    case "accepted":
      return "bg-green-100 text-green-700";
    case "rejected":
    case "returned":
      return "bg-neutral-200 text-neutral-500";
    case "completed":
      return "bg-neutral-200 text-neutral-500";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

function InfluencerAnalytics() {
  const t = useTranslations("analytics");
  const tc = useTranslations("common");
  const te = useTranslations("equipment");
  const locale = useLocale();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("analytics");
  const [timeRange, setTimeRange] = useState("7d");
  const { user, logout } = useAuth();
  const { savedCampaigns } = useSavedLists();
  const [myGears, setMyGears] = useState<MyGear[]>([]);
  const [myGearsLoading, setMyGearsLoading] = useState(true);
  const [rentingIn, setRentingIn] = useState<RentalRecord[]>([]);
  const [rentingOut, setRentingOut] = useState<RentalRecord[]>([]);
  const [rentalsLoading, setRentalsLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<MyGear | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [myApplications, setMyApplications] = useState<MyApplication[]>([]);
  const [myAppsLoaded, setMyAppsLoaded] = useState(false);
  const [pendingOffers, setPendingOffers] = useState<PendingOffer[]>([]);
  const [offersLoaded, setOffersLoaded] = useState(false);
  const [offerActionLoading, setOfferActionLoading] = useState<string | null>(null);
  const [offerDeclineTarget, setOfferDeclineTarget] = useState<string | null>(null);

  const loadOffers = async (userId: string) => {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from("applications")
      .select("id, status, offered_price, message, created_at, campaigns(id, title, profiles(name))")
      .eq("creator_id", userId)
      .eq("offer", true)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    setPendingOffers((data ?? []) as unknown as PendingOffer[]);
    setOffersLoaded(true);
  };

  const respondToOffer = async (offerId: string, action: "accepted" | "rejected") => {
    setOfferActionLoading(offerId);
    try {
      await callApi("/api/offers/respond", { application_id: offerId, action });
      setPendingOffers((prev) => prev.filter((o) => o.id !== offerId));
      toast.success(tc("savedToast"));
    } catch {
      toast.error(t("offerActionError"));
    }
    setOfferActionLoading(null);
    setOfferDeclineTarget(null);
  };

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabaseClient();
    supabase
      .from("gears")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setMyGears((data ?? []) as unknown as MyGear[]);
        setMyGearsLoading(false);
      });
    supabase
      .from("rental_requests")
      .select("*, gears(id, title)")
      .eq("renter_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRentingIn((data ?? []) as unknown as RentalRecord[]);
        setRentalsLoading(false);
      });
    supabase
      .from("rental_requests")
      .select("*, gears(id, title), profiles(name)")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRentingOut((data ?? []) as unknown as RentalRecord[]);
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabaseClient();
    supabase
      .from("applications")
      .select("id, status, created_at, campaigns(id, title, niche, profiles(name)))")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setMyApplications((data ?? []) as unknown as MyApplication[]);
        setMyAppsLoaded(true);
      });
    void loadOffers(user.id);
  }, [user]);

  const toggleGearStatus = async (gear: MyGear) => {
    const next = gear.status === "available" ? "unlisted" : "available";
    const { error } = await getSupabaseClient()
      .from("gears")
      .update({ status: next })
      .eq("id", gear.id);
    if (!error) {
      setMyGears((prev) =>
        prev.map((g) => (g.id === gear.id ? { ...g, status: next } : g))
      );
      toast.success(tc("savedToast"));
    }
  };

  const openEditModal = (gear: MyGear) => {
    setEditTarget(gear);
    setEditTitle(gear.title);
    setEditPrice(gear.price_per_day != null ? String(gear.price_per_day) : "");
    setEditDesc(gear.description ?? "");
  };

  const titleError =
    editTitle.trim().length > 0 && editTitle.trim().length < 3
      ? te("newGear.validation.titleTooShort")
      : null;
  const priceError =
    editPrice !== "" && !(parseFloat(editPrice) > 0)
      ? te("newGear.validation.priceInvalid")
      : null;
  const editValid =
    editTitle.trim().length >= 3 &&
    editPrice !== "" &&
    parseFloat(editPrice) > 0;

  const saveGearEdit = async () => {
    if (!editTarget || !editValid) return;
    setEditSaving(true);
    const { error } = await getSupabaseClient()
      .from("gears")
      .update({
        title: editTitle.trim(),
        price_per_day: parseFloat(editPrice),
        description: editDesc.trim() || null,
      })
      .eq("id", editTarget.id);
    setEditSaving(false);
    if (!error) {
      setMyGears((prev) =>
        prev.map((g) =>
          g.id === editTarget.id
            ? {
                ...g,
                title: editTitle.trim(),
                price_per_day: parseFloat(editPrice),
                description: editDesc.trim() || null,
              }
            : g
        )
      );
      setEditTarget(null);
      toast.success(tc("savedToast"));
    }
  };

  const handleRequestStatus = async (
    reqId: string,
    status: "accepted" | "rejected"
  ) => {
    setActionLoading(reqId);
    const { error } = await getSupabaseClient()
      .from("rental_requests")
      .update({ status })
      .eq("id", reqId);
    if (!error) {
      setRentingOut((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, status } : r))
      );
      toast.success(tc("savedToast"));
    }
    setActionLoading(null);
  };

  const statusTooltip: Record<string, string> = {
    pending: t("statusTooltip.pending"),
    accepted: t("statusTooltip.accepted"),
    rejected: t("statusTooltip.rejected"),
  };

  const verificationSteps = [
    { label: t("email"), done: true },
    { label: t("idDocument"), done: true },
    { label: t("portfolioSample"), done: false },
    { label: t("verified"), done: false },
  ];

  return (
    <main className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="oval-label inline-block mb-3">{t("creatorKicker")}</span>
            <h1 className="text-3xl font-bold text-neutral-900">{t("creatorAnalytics")}</h1>
            <p className="text-neutral-600">{t("trackGrowth")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="7d">{t("last7Days")}</option>
              <option value="30d">{t("last30Days")}</option>
              <option value="90d">{t("last90Days")}</option>
              <option value="1y">{t("lastYear")}</option>
            </select>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              {t("settings")}
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              {tc("logout")}
            </Button>
          </div>
        </div>

        {/* User Info Card */}
        {user && (
          <div className="bg-primary text-cream rounded-lg p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-lg bg-white/20 flex items-center justify-center text-2xl font-bold`}>
                {user.avatar}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{t("welcomeBack", { name: user.name })}</h2>
                <p className="text-cream/80">{user.email} • {t("creatorAccount")}</p>
              </div>
              <div className="ml-auto text-right">
                <Link href="/analytics/public">
                  <Button className="bg-cream text-primary hover:bg-white">
                    {t("viewPublicProfile")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 p-1 bg-gray-100 rounded-xl w-fit">
          {[
            { id: "analytics", label: t("analytics") },
            { id: "gear", label: t("myGear"), count: myGears.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-paper text-primary shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${activeTab === tab.id ? "bg-primary-soft" : "bg-gray-200"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "analytics" && (
          <>
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: t("totalFollowers"), key: "followers", icon: Users, color: "text-primary", bg: "bg-primary-soft", href: "/ai-hub" },
            { label: t("engagementRate"), key: "engagement", icon: Heart, color: "text-primary", bg: "bg-primary-soft", href: "/marketplace/campaigns" },
            { label: t("totalViews"), key: "views", icon: Eye, color: "text-primary", bg: "bg-primary-soft", href: "/marketplace/campaigns" },
            { label: t("revenue"), key: "revenue", icon: DollarSign, color: "text-primary", bg: "bg-primary-soft", href: "/marketplace/campaigns" },
          ].map((stat) => {
            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-paper rounded-lg p-5 border border-t border-ink/60 transition hover:-translate-y-0.5 hover:border-t-primary"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="uppercase tracking-widest text-xs text-ink-soft">{stat.label}</p>
                </div>
                <p className="font-quote text-xl text-neutral-700 mb-3">
                  {t(`statHints.${stat.key}.title`)}
                </p>
                <Link href={stat.href}>
                  <Button variant="outline" size="sm">
                    {t(`statHints.${stat.key}.cta`)}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* AI Insights Banner — empty state CTA */}
        <div className="bg-primary text-cream rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Zap className="w-5 h-5 flex-shrink-0" />
              <div>
                <h3 className="font-bold">{t("creatorEmptyTitle")}</h3>
                <p className="text-sm text-cream/80">{t("creatorEmptyDesc")}</p>
              </div>
            </div>
            <Link href="/ai-hub" className="flex-shrink-0">
              <Button className="bg-cream text-primary hover:bg-white">
                {t("creatorEmptyCta")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Offers from brands */}
        {offersLoaded && pendingOffers.length > 0 && (
          <div className="bg-paper rounded-lg p-6 border border-line mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">{t("offersTitle")}</h3>
              <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary text-xs font-semibold">
                {pendingOffers.length}
              </span>
            </div>
            <div className="space-y-3">
              {pendingOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-gray-100"
                >
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/marketplace/campaigns/${offer.campaigns?.id}`}
                        className="font-medium text-neutral-900 hover:text-primary transition-colors underline-offset-4 decoration-primary/40 hover:underline"
                      >
                        {offer.campaigns?.title ?? "—"}
                      </Link>
                    </div>
                    <p className="text-xs text-neutral-500">
                      {offer.campaigns?.profiles?.name ?? "—"} •{" "}
                      {offer.offered_price != null
                        ? t("offeredPrice", { price: offer.offered_price.toLocaleString() })
                        : t("offeredPriceOpen")}
                      {" • "}
                      {formatDate(offer.created_at, locale)}
                    </p>
                    {offer.message && (
                      <p className="text-sm text-neutral-600 mt-1 whitespace-pre-line">
                        {offer.message}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      isLoading={offerActionLoading === offer.id}
                      disabled={offerActionLoading !== null}
                      onClick={() => void respondToOffer(offer.id, "accepted")}
                      className="bg-green-500 text-white hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {t("offerAccept")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={offerActionLoading !== null}
                      onClick={() => setOfferDeclineTarget(offer.id)}
                      className="text-neutral-600"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      {t("offerDecline")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Applications */}
        {activeTab === "analytics" && (
          <div className="bg-paper rounded-lg p-6 border mb-8">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">{t("myAppsTitle")}</h3>
            </div>
            {!myAppsLoaded ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <ListRowSkeleton key={i} />
                ))}
              </div>
            ) : myApplications.length === 0 ? (
              <div className="relative">
                <span aria-hidden className="absolute -top-2 right-0 font-quote text-6xl text-ink/10 leading-none select-none">
                  &ldquo;
                </span>
                <p className="text-sm text-neutral-500">{t("myAppsEmpty")}</p>
              </div>
            ) : (
              <div>
                {myApplications.map((app, i) => (
                  <div
                    key={app.id}
                    className={`flex flex-wrap items-center gap-3 py-3 ${i > 0 ? "border-t border-line" : ""}`}
                  >
                    <span className="font-quote w-10 shrink-0 text-ink/30">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/marketplace/campaigns/${app.campaigns?.id}`}
                          className="font-medium text-neutral-900 hover:text-primary transition-colors underline-offset-4 decoration-primary/40 hover:underline"
                        >
                          {app.campaigns?.title ?? "—"}
                        </Link>
                        {app.campaigns?.niche && (
                          <span className="px-2 py-0.5 bg-primary-soft text-primary text-xs rounded-full">
                            {app.campaigns.niche}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500">
                        {app.campaigns?.profiles?.name ?? "—"} •{" "}
                        {formatDate(app.created_at, locale)}
                      </p>
                    </div>
                    <span
                      className={`relative group rounded-full px-3 py-0.5 text-xs uppercase tracking-wider font-medium ${
                        app.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : app.status === "rejected"
                            ? "bg-neutral-200 text-neutral-500"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {t(`appStatus.${app.status}`)}
                      {statusTooltip[app.status] && (
                        <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden group-hover:block bg-neutral-900 text-white text-xs font-normal normal-case tracking-normal rounded-lg px-2.5 py-1.5 w-48 text-center z-20 pointer-events-none">
                          {statusTooltip[app.status]}
                        </span>
                      )}
                    </span>
                    {app.status === "accepted" && (
                      <span className="text-[9px] px-1.5 py-0 rounded-full border border-dashed border-green-600 text-green-600 uppercase tracking-widest">
                        {tc("stampAccepted")}
                      </span>
                    )}
                    {app.status === "rejected" && (
                      <span className="text-[9px] px-1.5 py-0 rounded-full border border-dashed border-stone-400 text-stone-400 uppercase tracking-widest">
                        {tc("stampDeclined")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Content Performance */}
          <div className="lg:col-span-2 bg-paper rounded-lg p-6 border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">{t("topPerformingContent")}</h3>
              <Button variant="ghost" size="sm">
                {t("viewAll")}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="py-12 text-center">
              <BarChart3 className="w-14 h-14 text-neutral-300 mx-auto mb-4" />
              <p className="font-medium text-neutral-700 mb-1">{t("noDataYet")}</p>
              <p className="text-sm text-neutral-500 mb-6">{t("creatorEmptyDesc")}</p>
              <Link href="/ai-hub">
                <Button>
                  {t("creatorEmptyCta")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* {t("verificationProgress")} */}
            <div className="bg-paper rounded-lg p-6 border">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">{t("verificationProgress")}</h3>
              </div>
              <div className="space-y-3">
                {verificationSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step.done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                      {step.done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-sm ${step.done ? "text-neutral-900 font-medium" : "text-neutral-500"}`}>{t(step.label.toLowerCase().replace(/\s/g, ""))}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* {t("myRentals")} */}
            <div className="bg-paper rounded-lg p-6 border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg">{t("myRentals")}</h3>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-neutral-500">{t("noDataYet")}</p>
              </div>
              <Link href="/equipment">
                <Button variant="outline" size="sm" className="w-full mt-3">
                  {t("rentGear")}
                </Button>
              </Link>
            </div>

            {/* {t("savedCampaigns")} */}
            <div className="bg-paper rounded-lg p-6 border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg">{t("savedCampaigns")}</h3>
                </div>
                <span className="px-2 py-0.5 bg-primary-soft text-primary text-xs rounded-full">{savedCampaigns.length}</span>
              </div>
              {savedCampaigns.length === 0 ? (
                <p className="text-sm text-neutral-500">{t("noSavedCampaigns")}</p>
              ) : (
                <div className="space-y-2">
                  {savedCampaigns.map((id) => (
                    <div key={id} className="p-3 bg-gray-50 rounded-xl text-sm font-medium">
                      {t("savedCampaignItem", { id })}
                    </div>
                  ))}
                </div>
              )}
              <Link href="/marketplace/campaigns">
                <Button variant="outline" size="sm" className="w-full mt-3">
                  {t("browseCampaigns")}
                </Button>
              </Link>
            </div>

            {/* Brand Deals */}
            <div className="bg-paper rounded-lg p-6 border">
              <h3 className="font-bold text-lg mb-4">{t("recentBrandDeals")}</h3>
              <p className="text-sm text-neutral-500">{t("noDataYet")}</p>
            </div>

            {/* Audience Insights */}
            <div className="bg-paper rounded-lg p-6 border">
              <h3 className="font-bold text-lg mb-4">{t("audienceInsights")}</h3>
              <p className="text-sm text-neutral-500">{t("noDataYet")}</p>
            </div>

            {/* {t("creatorScore")} */}
            <div className="bg-primary text-cream rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5" />
                <h3 className="font-bold">{t("creatorScore")}</h3>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-5xl font-bold">—</p>
                <p className="text-cream/80 mb-2">/100</p>
              </div>
              <p className="text-sm text-cream/90 mt-2">
                {t("noDataYet")}
              </p>
            </div>
          </div>
        </div>
          </>
        )}

        {activeTab === "gear" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold">{t("gearTab.myGearTitle")}</h2>
              <Link href="/equipment/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("addGear")}
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-paper rounded-lg p-5 border text-center">
                <p className="text-3xl font-bold text-neutral-900">{myGears.length}</p>
                <p className="text-sm text-neutral-500">{t("totalListings")}</p>
              </div>
              <div className="bg-paper rounded-lg p-5 border text-center">
                <p className="text-3xl font-bold text-green-600">{myGears.filter(g => g.status === "available").length}</p>
                <p className="text-sm text-neutral-500">{t("available")}</p>
              </div>
              <div className="bg-paper rounded-lg p-5 border text-center">
                <p className="text-3xl font-bold text-neutral-400">—</p>
                <p className="text-sm text-neutral-500">{t("lifetimeEarnings")}</p>
              </div>
            </div>

            <div className="bg-paper rounded-lg p-6 border">
              {myGearsLoading ? (
                <div className="space-y-3">
                  <ListRowSkeleton />
                  <ListRowSkeleton />
                </div>
              ) : myGears.length === 0 ? (
                <div className="py-12 text-center relative">
                  <span aria-hidden className="absolute top-0 right-0 font-quote text-6xl text-ink/10 leading-none select-none">
                    &ldquo;
                  </span>
                  <Camera className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-600 mb-6">{t("gearTab.emptyGear")}</p>
                  <Link href="/equipment/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      {t("listFirstItem")}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myGears.map((gear) => (
                    <div
                      key={gear.id}
                      className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-line relative"
                    >
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/equipment/${gear.id}`}
                            className="font-medium text-neutral-900 hover:text-primary transition-colors truncate"
                          >
                            {gear.title}
                          </Link>
                          <span className="px-2 py-0.5 bg-primary-soft text-primary text-xs rounded-full">
                            {te(`category.${gear.category}`)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${gearStatusBadgeClass(gear.status)}`}
                          >
                            {te(`status.${gear.status}`)}
                          </span>
                          {gear.status === "rented" && (
                            <span className="text-[9px] px-1.5 py-0 rounded-full border border-dashed border-green-600 text-green-600 uppercase tracking-widest">
                              {te("stampRentedOut")}
                            </span>
                          )}
                          {gear.status === "unlisted" && (
                            <span className="text-[9px] px-1.5 py-0 rounded-full border border-dashed border-stone-400 text-stone-400 uppercase tracking-widest">
                              {te("stampOffShelf")}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 truncate">
                          ${gear.price_per_day != null ? gear.price_per_day : "—"}{" "}
                          {te("perDay")} • {formatDate(gear.created_at, locale)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {gear.status !== "rented" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleGearStatus(gear)}
                          >
                            {gear.status === "available"
                              ? t("gearTab.unlistAction")
                              : t("gearTab.listAction")}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(gear)}
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          {t("gearTab.editAction")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rental Records */}
            <div className="bg-paper rounded-lg p-6 border">
              <h3 className="font-bold text-lg mb-4">{t("gearTab.rentalRecordsTitle")}</h3>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                  {t("gearTab.rentingIn")}
                </h4>
                {rentalsLoading ? (
                  <div className="space-y-3">
                    <ListRowSkeleton />
                    <ListRowSkeleton />
                  </div>
                ) : rentingIn.length === 0 ? (
                  <p className="text-sm text-neutral-500">{t("gearTab.emptyRentingIn")}</p>
                ) : (
                  <div className="space-y-3">
                    {rentingIn.map((req) => (
                      <div
                        key={req.id}
                        className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-line"
                      >
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={req.gears ? `/equipment/${req.gears.id}` : "/equipment"}
                              className="font-medium text-neutral-900 hover:text-primary transition-colors truncate"
                            >
                              {req.gears?.title ?? "—"}
                            </Link>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${rentalStatusBadgeClass(req.status)}`}
                            >
                              {te(`status.${req.status}`)}
                            </span>
                            {req.status === "pending" && (
                              <span className="text-[9px] px-1.5 py-0 rounded-full border border-dashed border-accent text-accent uppercase tracking-widest">
                                {te("stampAwaitingOwner")}
                              </span>
                            )}
                            {req.status === "accepted" && (
                              <span className="text-[9px] px-1.5 py-0 rounded-full border border-dashed border-green-600 text-green-600 uppercase tracking-widest">
                                {te("stampApproved")}
                              </span>
                            )}
                            {(req.status === "rejected" || req.status === "returned") && (
                              <span className="text-[9px] px-1.5 py-0 rounded-full border border-dashed border-stone-400 text-stone-400 uppercase tracking-widest">
                                {te("stampDeclined")}
                              </span>
                            )}
                            {(req.status === "completed") && (
                              <span className="text-[9px] px-1.5 py-0 rounded-full border border-dashed border-primary text-primary uppercase tracking-widest">
                                {te("stampCompleted")}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500">
                            {t("gearTab.dateRange", {
                              start: formatDate(req.start_date, locale),
                              end: formatDate(req.end_date, locale),
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                  {t("gearTab.rentingOut")}
                </h4>
                {rentalsLoading ? (
                  <div className="space-y-3">
                    <ListRowSkeleton />
                    <ListRowSkeleton />
                  </div>
                ) : rentingOut.length === 0 ? (
                  <p className="text-sm text-neutral-500">{t("gearTab.emptyRentingOut")}</p>
                ) : (
                  <div className="space-y-3">
                    {rentingOut.map((req) => (
                      <div
                        key={req.id}
                        className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-line"
                      >
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={req.gears ? `/equipment/${req.gears.id}` : "/equipment"}
                              className="font-medium text-neutral-900 hover:text-primary transition-colors truncate"
                            >
                              {req.gears?.title ?? "—"}
                            </Link>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${rentalStatusBadgeClass(req.status)}`}
                            >
                              {te(`status.${req.status}`)}
                            </span>
                            {req.status === "pending" && (
                              <span className="text-[9px] px-1.5 py-0 rounded-full border border-dashed border-accent text-accent uppercase tracking-widest">
                                {te("stampAwaitingOwner")}
                              </span>
                            )}
                            {req.status === "accepted" && (
                              <span className="text-[9px] px-1.5 py-0 rounded-full border border-dashed border-green-600 text-green-600 uppercase tracking-widest">
                                {te("stampApproved")}
                              </span>
                            )}
                            {(req.status === "rejected" || req.status === "returned") && (
                              <span className="text-[9px] px-1.5 py-0 rounded-full border border-dashed border-stone-400 text-stone-400 uppercase tracking-widest">
                                {te("stampDeclined")}
                              </span>
                            )}
                            {(req.status === "completed") && (
                              <span className="text-[9px] px-1.5 py-0 rounded-full border border-dashed border-primary text-primary uppercase tracking-widest">
                                {te("stampCompleted")}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500 truncate">
                            {req.profiles?.name ?? "—"} •{" "}
                            {t("gearTab.dateRange", {
                              start: formatDate(req.start_date, locale),
                              end: formatDate(req.end_date, locale),
                            })}
                          </p>
                          {req.message && (
                            <p className="text-xs text-neutral-500 truncate mt-0.5">
                              {req.message}
                            </p>
                          )}
                        </div>
                        {req.status === "pending" && (
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              size="sm"
                              isLoading={actionLoading === req.id}
                              disabled={actionLoading !== null}
                              onClick={() => handleRequestStatus(req.id, "accepted")}
                              className="bg-green-500 text-white hover:bg-green-600"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {t("accept")}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actionLoading !== null}
                              onClick={() => setRejectTarget(req.id)}
                              className="text-neutral-600"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              {t("reject")}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Gear Modal */}
        {editTarget && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-paper rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold mb-4">{t("gearTab.editModalTitle")}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    {t("gearTab.fieldTitle")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary ${
                      titleError ? "border-red-400" : ""
                    }`}
                  />
                  {titleError && (
                    <p className="text-xs text-red-500 mt-1">{titleError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    {t("gearTab.fieldPrice")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary ${
                      priceError ? "border-red-400" : ""
                    }`}
                  />
                  {priceError && (
                    <p className="text-xs text-red-500 mt-1">{priceError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    {t("gearTab.fieldDescription")}
                  </label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditTarget(null)}
                    disabled={editSaving}
                  >
                    {tc("cancel")}
                  </Button>
                  <Button
                    className="flex-1"
                    isLoading={editSaving}
                    disabled={!editValid}
                    onClick={saveGearEdit}
                  >
                    {t("gearTab.save")}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Reject Rental Request Confirm */}
        <ConfirmDialog
          open={rejectTarget !== null}
          danger
          title={t("gearTab.confirmRejectTitle")}
          description={t("gearTab.confirmRejectDesc")}
          onConfirm={() => {
            if (rejectTarget) handleRequestStatus(rejectTarget, "rejected");
            setRejectTarget(null);
          }}
          onCancel={() => setRejectTarget(null)}
        />

        {/* Decline Offer Confirm */}
        <ConfirmDialog
          open={offerDeclineTarget !== null}
          danger
          title={t("confirmDeclineOffer.title")}
          description={t("confirmDeclineOffer.description")}
          confirmLabel={t("confirmDeclineOffer.confirm")}
          onConfirm={() => {
            if (offerDeclineTarget) void respondToOffer(offerDeclineTarget, "rejected");
            setOfferDeclineTarget(null);
          }}
          onCancel={() => setOfferDeclineTarget(null)}
        />
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <InfluencerGuard>
      <InfluencerAnalytics />
    </InfluencerGuard>
  );
}
