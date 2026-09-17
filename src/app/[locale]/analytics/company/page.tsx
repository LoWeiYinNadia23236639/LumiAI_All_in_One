"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Eye,
  MousePointer,
  Target,
  Zap,
  ArrowRight,
  Star,
  Building2,
  CheckCircle,
  Briefcase,
  LogOut,
  Settings,
  Bookmark,
  Shield,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { CompanyGuard } from "@/components/role-guard";
import { useAuth } from "@/contexts/auth-context";
import { useSavedLists } from "@/contexts/saved-lists-context";
import { getSupabaseClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/format";
import { formatRelativeTime } from "@/lib/relative-time";
import { useTranslations, useLocale } from "next-intl";

interface ReceivedApplication {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  campaignId: string;
  campaignTitle: string;
  creatorName: string;
  creatorNiche: string | null;
  creatorFollowers: number | null;
}

function CompanyAnalytics() {
  const t = useTranslations("analytics");
  const tc = useTranslations("common");
  const locale = useLocale();
  const toast = useToast();
  const [timeRange, setTimeRange] = useState("30d");
  const { user, logout } = useAuth();
  const { savedCreators } = useSavedLists();
  const [receivedApps, setReceivedApps] = useState<ReceivedApplication[]>([]);
  const [appsLoaded, setAppsLoaded] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectAppId, setRejectAppId] = useState<string | null>(null);

  const statusTooltip: Record<string, string> = {
    pending: t("statusTooltip.pending"),
    accepted: t("statusTooltip.accepted"),
    rejected: t("statusTooltip.rejected"),
  };

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabaseClient();
    (async () => {
      const { data } = await supabase
        .from("campaigns")
        .select("id, title, applications(id, status, message, created_at, profiles(name, niche, follower_count))")
        .eq("brand_id", user.id);
      const flat: ReceivedApplication[] = [];
      ((data ?? []) as unknown as { id: string; title: string; applications: {
        id: string; status: string; message: string | null; created_at: string;
        profiles: { name: string; niche: string | null; follower_count: number | null } | null;
      }[] | null }[]).forEach((c) => {
        (c.applications ?? []).forEach((a) => {
          flat.push({
            id: a.id,
            status: a.status,
            message: a.message,
            created_at: a.created_at,
            campaignId: c.id,
            campaignTitle: c.title,
            creatorName: a.profiles?.name ?? "—",
            creatorNiche: a.profiles?.niche ?? null,
            creatorFollowers: a.profiles?.follower_count ?? null,
          });
        });
      });
      flat.sort((a, b) => b.created_at.localeCompare(a.created_at));
      setReceivedApps(flat);
      setAppsLoaded(true);
    })();
  }, [user]);

  const handleStatusUpdate = async (appId: string, status: "accepted" | "rejected") => {
    setActionLoading(appId);
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", appId);
    if (!error) {
      setReceivedApps((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status } : a))
      );
      toast.success(tc("savedToast"));
    }
    setActionLoading(null);
  };

  const verificationSteps = [
    { label: t("email"), done: true },
    { label: t("businessRegistration"), done: true },
    { label: t("paymentMethod"), done: false },
    { label: t("verified"), done: false },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{t("companyDashboard")}</h1>
            <p className="text-neutral-600">{t("trackCampaigns")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="bg-gradient-to-r from-blue-500 to-violet-600 rounded-2xl p-6 text-white mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold`}>
                {user.avatar}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{t("welcomeBackName", { name: user.name })}</h2>
                <p className="text-white/80">{user.email} • {t("companyAccount")}</p>
              </div>
              <div className="ml-auto text-right">
                <Link href="/marketplace/campaigns">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100">
                    <Briefcase className="w-4 h-4 mr-2" />
                    {t("postCampaign")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: t("activeCampaigns"), key: "campaigns", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-50", href: "/marketplace/campaigns/new" },
            { label: t("totalSpent"), key: "spent", icon: DollarSign, color: "text-green-500", bg: "bg-green-50", href: "/marketplace/campaigns/new" },
            { label: t("roi"), key: "roi", icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-50", href: "/marketplace/talent" },
            { label: t("totalReach"), key: "reach", icon: Users, color: "text-orange-500", bg: "bg-orange-50", href: "/marketplace/talent" },
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
                  {t(`statHintsBrand.${stat.key}.title`)}
                </p>
                <Link href={stat.href}>
                  <Button variant="outline" size="sm">
                    {t(`statHintsBrand.${stat.key}.cta`)}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Campaigns */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">{t("activeCampaigns")}</h3>
              <Button variant="ghost" size="sm">
                {t("viewAll")}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="py-12 text-center">
              <Briefcase className="w-14 h-14 text-neutral-300 mx-auto mb-4" />
              <p className="font-medium text-neutral-700 mb-1">{t("noDataYet")}</p>
              <p className="text-sm text-neutral-500 mb-6">{t("brandEmptyDesc")}</p>
              <Link href="/marketplace/campaigns/new">
                <Button className="bg-gradient-to-r from-blue-500 to-violet-600 text-white">
                  {t("brandEmptyCta")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Verification Progress */}
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg">{t("verificationProgress")}</h3>
              </div>
              <div className="space-y-3">
                {verificationSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step.done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                      {step.done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-sm ${step.done ? "text-neutral-900 font-medium" : "text-neutral-500"}`}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Creators */}
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-pink-500" />
                  <h3 className="font-bold text-lg">{t("savedCreators")}</h3>
                </div>
                <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full">{savedCreators.length}</span>
              </div>
              {savedCreators.length === 0 ? (
                <p className="text-sm text-neutral-500">{t("noSavedCreators")}</p>
              ) : (
                <div className="space-y-2">
                  {savedCreators.map((id) => (
                    <div key={id} className="p-3 bg-gray-50 rounded-xl text-sm font-medium">
                      {t("savedCreatorItem", { id })}
                    </div>
                  ))}
                </div>
              )}
              <Link href="/marketplace/talent">
                <Button variant="outline" size="sm" className="w-full mt-3">
                  {t("browseCreators")}
                </Button>
              </Link>
            </div>

            {/* New Applications */}
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{t("receivedAppsTitle")}</h3>
              </div>
              {!appsLoaded ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <ListRowSkeleton key={i} />
                  ))}
                </div>
              ) : receivedApps.length === 0 ? (
                <p className="text-sm text-neutral-500">{t("noDataYet")}</p>
              ) : (
                <div className="space-y-3">
                  {receivedApps.map((app) => (
                    <div key={app.id} className="p-3 rounded-xl border border-gray-100">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-medium text-sm">{app.creatorName}</span>
                        {app.creatorNiche && (
                          <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full">
                            {app.creatorNiche}
                          </span>
                        )}
                        {app.creatorFollowers != null && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {t("followersBadge", { count: app.creatorFollowers.toLocaleString() })}
                          </span>
                        )}
                        <span
                          className={`relative group px-2 py-0.5 rounded-full text-xs font-medium ${
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
                      <Link
                        href={`/marketplace/campaigns/${app.campaignId}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {app.campaignTitle}
                      </Link>
                      {app.message && (
                        <p className="text-xs text-neutral-600 mt-1.5 line-clamp-3 whitespace-pre-line">
                          {app.message}
                        </p>
                      )}
                      <p className="text-xs text-neutral-400 mt-1">
                        {formatDate(app.created_at, locale)} · {formatRelativeTime(app.created_at, locale)}
                      </p>
                      {app.status === "pending" && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            isLoading={actionLoading === app.id}
                            disabled={actionLoading !== null}
                            onClick={() => handleStatusUpdate(app.id, "accepted")}
                            className="bg-green-500 text-white hover:bg-green-600 h-7 px-3 text-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            {t("accept")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionLoading !== null}
                            onClick={() => setRejectAppId(app.id)}
                            className="text-neutral-600 h-7 px-3 text-xs"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            {t("reject")}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Performing Creators */}
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <h3 className="font-bold text-lg mb-4">{t("topPerformers")}</h3>
              <p className="text-sm text-neutral-500">{t("noDataYet")}</p>
            </div>

            {/* AI Recommendations */}
            <div className="bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5" />
                <h3 className="font-bold">{t("aiSuggestions")}</h3>
              </div>
              <p className="text-sm text-white/80">{t("noDataYet")}</p>
            </div>
          </div>
        </div>

        {/* Reject Application Confirm */}
        <ConfirmDialog
          open={rejectAppId !== null}
          danger
          title={t("rejectConfirmTitle")}
          description={t("rejectConfirmDesc")}
          onConfirm={() => {
            if (rejectAppId) handleStatusUpdate(rejectAppId, "rejected");
            setRejectAppId(null);
          }}
          onCancel={() => setRejectAppId(null)}
        />
      </div>
    </main>
  );
}

export default function CompanyAnalyticsPage() {
  return (
    <CompanyGuard>
      <CompanyAnalytics />
    </CompanyGuard>
  );
}
