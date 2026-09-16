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
  LogOut,
  Settings,
  Bookmark,
  Shield,
  CheckCircle,
  Camera,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Package,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { InfluencerGuard } from "@/components/role-guard";
import { useAuth } from "@/contexts/auth-context";
import { useSavedLists } from "@/contexts/saved-lists-context";
import { getSupabaseClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/format";
import { useTranslations, useLocale } from "next-intl";

interface MyApplication {
  id: string;
  status: string;
  created_at: string;
  campaigns: { id: string; title: string; niche: string | null; profiles: { name: string } | null } | null;
}

interface UserGearItem {
  id: string;
  name: string;
  category: string;
  image: string;
  brand: string;
  location: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  rating: number;
  reviews: number;
  availability: string[];
  condition: string;
  includes: string[];
  owner: string;
  ownerVerified: boolean;
  responseTime: string;
  description: string;
  ownerId: string;
  available: boolean;
}

function InfluencerAnalytics() {
  const t = useTranslations("analytics");
  const tc = useTranslations("common");
  const locale = useLocale();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("analytics");
  const [timeRange, setTimeRange] = useState("7d");
  const { user, logout } = useAuth();
  const { savedCampaigns } = useSavedLists();
  const [userGear, setUserGear] = useState<UserGearItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGear, setNewGear] = useState({ name: "", dailyRate: "", condition: "Excellent", description: "" });
  const [myApplications, setMyApplications] = useState<MyApplication[]>([]);
  const [myAppsLoaded, setMyAppsLoaded] = useState(false);
  const [gearToDelete, setGearToDelete] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("lumiai_user_gear");
    if (stored) {
      try { setUserGear(JSON.parse(stored)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("lumiai_user_gear", JSON.stringify(userGear));
  }, [userGear]);

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
  }, [user]);

  const handleAddGear = () => {
    if (!newGear.name || !newGear.dailyRate || !(parseFloat(newGear.dailyRate) > 0) || !user) return;
    const daily = parseFloat(newGear.dailyRate);
    const item: UserGearItem = {
      id: `user-gear-${Date.now()}`,
      name: newGear.name,
      category: "Accessories",
      image: "📷",
      brand: "User",
      location: "User Location",
      dailyRate: daily,
      weeklyRate: Math.round(daily * 5),
      monthlyRate: Math.round(daily * 20),
      rating: 5,
      reviews: 0,
      availability: ["Apr 15", "Apr 16", "Apr 17", "Apr 18", "Apr 19"],
      condition: newGear.condition,
      includes: ["Item"],
      owner: user.name,
      ownerVerified: true,
      responseTime: "< 1 hour",
      description: newGear.description || newGear.name,
      ownerId: user.id,
      available: true,
    };
    setUserGear((prev) => [item, ...prev]);
    setNewGear({ name: "", dailyRate: "", condition: "Excellent", description: "" });
    setShowAddModal(false);
    toast.success(tc("savedToast"));
  };

  const toggleAvailability = (id: string) => {
    setUserGear((prev) => prev.map((g) => g.id === id ? { ...g, available: !g.available } : g));
  };

  const deleteGear = (id: string) => {
    setUserGear((prev) => prev.filter((g) => g.id !== id));
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
    <main className="min-h-screen bg-gradient-to-b from-white via-violet-50/30 to-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{t("creatorAnalytics")}</h1>
            <p className="text-neutral-600">{t("trackGrowth")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500"
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
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold`}>
                {user.avatar}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{t("welcomeBack", { name: user.name })}</h2>
                <p className="text-white/80">{user.email} • {t("creatorAccount")}</p>
              </div>
              <div className="ml-auto text-right">
                <Link href="/analytics/public">
                  <Button className="bg-white text-violet-600 hover:bg-gray-100">
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
            { id: "gear", label: t("myGear"), count: userGear.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-violet-600 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${activeTab === tab.id ? "bg-violet-100" : "bg-gray-200"}`}>
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
            { label: t("totalFollowers"), key: "followers", icon: Users, color: "text-blue-500", bg: "bg-blue-50", href: "/ai-hub" },
            { label: t("engagementRate"), key: "engagement", icon: Heart, color: "text-pink-500", bg: "bg-pink-50", href: "/marketplace/campaigns" },
            { label: t("totalViews"), key: "views", icon: Eye, color: "text-violet-500", bg: "bg-violet-50", href: "/marketplace/campaigns" },
            { label: t("revenue"), key: "revenue", icon: DollarSign, color: "text-green-500", bg: "bg-green-50", href: "/marketplace/campaigns" },
          ].map((stat) => {
            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 border shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-neutral-500">{stat.label}</p>
                </div>
                <p className="text-sm font-medium text-neutral-500 mb-3">
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
        <div className="bg-gradient-to-r from-violet-600 via-pink-500 to-orange-400 rounded-2xl p-6 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Zap className="w-5 h-5 flex-shrink-0" />
              <div>
                <h3 className="font-bold">{t("creatorEmptyTitle")}</h3>
                <p className="text-sm text-white/80">{t("creatorEmptyDesc")}</p>
              </div>
            </div>
            <Link href="/ai-hub" className="flex-shrink-0">
              <Button className="bg-white text-violet-600 hover:bg-gray-100">
                {t("creatorEmptyCta")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* My Applications */}
        {activeTab === "analytics" && (
          <div className="bg-white rounded-2xl p-6 border shadow-sm mb-8">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-violet-600" />
              <h3 className="font-bold text-lg">{t("myAppsTitle")}</h3>
            </div>
            {!myAppsLoaded ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <ListRowSkeleton key={i} />
                ))}
              </div>
            ) : myApplications.length === 0 ? (
              <p className="text-sm text-neutral-500">{t("myAppsEmpty")}</p>
            ) : (
              <div className="space-y-3">
                {myApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-gray-100"
                  >
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/marketplace/campaigns/${app.campaigns?.id}`}
                          className="font-medium text-neutral-900 hover:text-violet-600 transition-colors"
                        >
                          {app.campaigns?.title ?? "—"}
                        </Link>
                        {app.campaigns?.niche && (
                          <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full">
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
                      className={`relative group px-3 py-1 rounded-full text-xs font-medium ${
                        app.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : app.status === "rejected"
                            ? "bg-neutral-200 text-neutral-500"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {t(`appStatus.${app.status}`)}
                      {statusTooltip[app.status] && (
                        <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden group-hover:block bg-neutral-900 text-white text-xs font-normal rounded-lg px-2.5 py-1.5 w-48 text-center z-20 pointer-events-none">
                          {statusTooltip[app.status]}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Content Performance */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border shadow-sm">
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
                <Button className="bg-gradient-to-r from-violet-600 via-pink-500 to-orange-400 text-white">
                  {t("creatorEmptyCta")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* {t("verificationProgress")} */}
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-violet-600" />
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
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-500" />
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
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-pink-500" />
                  <h3 className="font-bold text-lg">{t("savedCampaigns")}</h3>
                </div>
                <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full">{savedCampaigns.length}</span>
              </div>
              {savedCampaigns.length === 0 ? (
                <p className="text-sm text-neutral-500">No saved campaigns yet.</p>
              ) : (
                <div className="space-y-2">
                  {savedCampaigns.map((id) => (
                    <div key={id} className="p-3 bg-gray-50 rounded-xl text-sm font-medium">
                      Campaign #{id}
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
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <h3 className="font-bold text-lg mb-4">{t("recentBrandDeals")}</h3>
              <p className="text-sm text-neutral-500">{t("noDataYet")}</p>
            </div>

            {/* Audience Insights */}
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <h3 className="font-bold text-lg mb-4">{t("audienceInsights")}</h3>
              <p className="text-sm text-neutral-500">{t("noDataYet")}</p>
            </div>

            {/* {t("creatorScore")} */}
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5" />
                <h3 className="font-bold">{t("creatorScore")}</h3>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-5xl font-bold">—</p>
                <p className="text-white/80 mb-2">/100</p>
              </div>
              <p className="text-sm text-white/90 mt-2">
                {t("noDataYet")}
              </p>
            </div>
          </div>
        </div>
          </>
        )}

        {activeTab === "gear" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{t("myGear")}</h2>
              <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-orange-500 to-amber-500">
                <Plus className="w-4 h-4 mr-2" />
                {t("addGear")}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 border shadow-sm text-center">
                <p className="text-3xl font-bold text-neutral-900">{userGear.length}</p>
                <p className="text-sm text-neutral-500">{t("totalListings")}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border shadow-sm text-center">
                <p className="text-3xl font-bold text-green-600">{userGear.filter(g => g.available).length}</p>
                <p className="text-sm text-neutral-500">{t("available")}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border shadow-sm text-center">
                <p className="text-3xl font-bold text-neutral-400">—</p>
                <p className="text-sm text-neutral-500">{t("lifetimeEarnings")}</p>
              </div>
            </div>
            {userGear.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border shadow-sm text-center">
                <Camera className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">{t("noGearListed")}</h3>
                <p className="text-neutral-600 mb-6">{t("listSubtitle")}</p>
                <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-orange-500 to-amber-500">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("listFirstItem")}
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userGear.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-5 border shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{item.image}</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleAvailability(item.id)}
                          className="p-1 hover:bg-gray-100 rounded-lg"
                          title={item.available ? "Mark unavailable" : "Mark available"}
                        >
                          {item.available ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                        </button>
                        <button
                          onClick={() => setGearToDelete(item.id)}
                          className="p-1 hover:bg-red-50 rounded-lg text-red-500"
                          title={tc("delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-sm text-neutral-500 mb-2">{item.condition}</p>
                    <p className="text-sm text-neutral-600 line-clamp-2 mb-3">{item.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <p className="text-xl font-bold text-neutral-900">${item.dailyRate}<span className="text-xs font-normal text-neutral-500">/day</span></p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {item.available ? t("available") : t("unavailable")}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* {t("myRentals")} in Gear Tab */}
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-500" />
                  <h3 className="font-bold text-lg">{t("gearIRented")}</h3>
                </div>
                <Link href="/equipment">
                  <Button variant="outline" size="sm">Browse Gear</Button>
                </Link>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-3 p-4 bg-gray-50 rounded-xl text-sm text-neutral-500 text-center">
                  {t("noDataYet")}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Gear Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold mb-4">{t("listNewGear")}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    {t("itemName")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newGear.name}
                    onChange={(e) => setNewGear({ ...newGear, name: e.target.value })}
                    placeholder="e.g. Sony A7IV"
                    className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    {t("dailyRate")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={newGear.dailyRate}
                    onChange={(e) => setNewGear({ ...newGear, dailyRate: e.target.value })}
                    placeholder="75"
                    className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {newGear.dailyRate && !(parseFloat(newGear.dailyRate) > 0) && (
                    <p className="text-xs text-red-500 mt-1">{t("rateInvalid")}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Condition</label>
                  <select
                    value={newGear.condition}
                    onChange={(e) => setNewGear({ ...newGear, condition: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option>Excellent</option>
                    <option>Good</option>
                    <option>Fair</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">{t("description")}</label>
                  <textarea
                    value={newGear.description}
                    onChange={(e) => setNewGear({ ...newGear, description: e.target.value })}
                    placeholder="Brief description of the item..."
                    className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>{tc("cancel")}</Button>
                  <Button className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500" onClick={handleAddGear} disabled={!newGear.name || !newGear.dailyRate || !(parseFloat(newGear.dailyRate) > 0)}>
                    {t("listGear")}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Gear Confirm */}
        <ConfirmDialog
          open={gearToDelete !== null}
          danger
          title={t("deleteGearTitle")}
          description={t("deleteGearDesc")}
          onConfirm={() => {
            if (gearToDelete) {
              deleteGear(gearToDelete);
              toast.success(tc("deletedToast"));
            }
            setGearToDelete(null);
          }}
          onCancel={() => setGearToDelete(null)}
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
