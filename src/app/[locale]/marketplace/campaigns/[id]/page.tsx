"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  DollarSign,
  Clock,
  Briefcase,
  Users,
  Megaphone,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/contexts/auth-context";
import { getSupabaseClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/format";
import { callApply, ApplyAuthError, DuplicateApplicationError } from "@/lib/applications/client";
import { useTranslations, useLocale } from "next-intl";

interface CampaignDetail {
  id: string;
  title: string;
  description: string | null;
  budget: number | null;
  niche: string | null;
  requirements: string | null;
  deliverables: string | null;
  deadline: string | null;
  status: string;
  created_at: string;
  brand_id: string;
  profiles: { name: string } | null;
}

interface ApplicationRow {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  creator_id: string;
  profiles: { name: string; niche: string | null; follower_count: number | null } | null;
}

function statusBadgeClass(status: string) {
  if (status === "accepted") return "bg-green-100 text-green-700";
  if (status === "rejected") return "bg-neutral-200 text-neutral-500";
  return "bg-yellow-100 text-yellow-700";
}

function CampaignDetailPage() {
  const t = useTranslations("marketplace.campaignDetail");
  const locale = useLocale();
  const params = useParams();
  const campaignId = params.id as string;
  const { user } = useAuth();

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [applicants, setApplicants] = useState<ApplicationRow[]>([]);
  const [myApplication, setMyApplication] = useState<ApplicationRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [pitch, setPitch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isOwnerOrAdmin =
    !!user && (user.role === "admin" || user.id === campaign?.brand_id);

  useEffect(() => {
    if (!campaignId) return;
    const supabase = getSupabaseClient();
    (async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*, profiles(name)")
        .eq("id", campaignId)
        .single();
      if (error || !data) {
        setLoadError(true);
        setIsLoading(false);
        return;
      }
      setCampaign(data as unknown as CampaignDetail);

      const { data: appRows } = await supabase
        .from("applications")
        .select("*, profiles(name, niche, follower_count)")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false });
      setApplicants((appRows ?? []) as unknown as ApplicationRow[]);
      setIsLoading(false);
    })();
  }, [campaignId]);

  // Creator: check whether I already applied
  useEffect(() => {
    if (!user || !campaign || isOwnerOrAdmin) return;
    const supabase = getSupabaseClient();
    supabase
      .from("applications")
      .select("*, profiles(name, niche, follower_count)")
      .eq("campaign_id", campaign.id)
      .eq("creator_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setMyApplication(data as unknown as ApplicationRow);
      });
  }, [user, campaign, isOwnerOrAdmin]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await callApply(campaign.id, pitch.trim());
      window.location.reload();
    } catch (err) {
      if (err instanceof DuplicateApplicationError) {
        setSubmitError(t("alreadyApplied"));
      } else if (err instanceof ApplyAuthError) {
        setSubmitError(t("authError"));
      } else {
        setSubmitError(t("applyError"));
      }
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (appId: string, status: "accepted" | "rejected") => {
    setActionLoading(appId);
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", appId);
    if (!error) {
      setApplicants((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status } : a))
      );
    }
    setActionLoading(null);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-pink-50/30 to-white pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-neutral-500">{t("loading")}</p>
        </div>
      </main>
    );
  }

  if (loadError || !campaign) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-pink-50/30 to-white pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <p className="text-neutral-700 font-medium">{t("notFound")}</p>
          <Link href="/marketplace/campaigns" className="inline-block mt-4">
            <Button variant="outline">{t("backToList")}</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-pink-50/30 to-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/marketplace/campaigns">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t("backToList")}
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 md:p-8 border shadow-sm mb-6"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center shrink-0">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
                {campaign.title}
              </h1>
              <p className="text-neutral-500">
                {campaign.profiles?.name ?? "—"}
                {campaign.niche && (
                  <span className="ml-2 px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full">
                    {campaign.niche}
                  </span>
                )}
              </p>
            </div>
          </div>

          <p className="text-neutral-700 mb-6 whitespace-pre-line">
            {campaign.description}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="font-medium">
                {campaign.budget != null ? `$${campaign.budget.toLocaleString()}` : "—"}
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
                {formatDate(campaign.created_at, locale)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Users className="w-4 h-4 text-blue-500" />
              <span>{t("applicantsCount", { count: applicants.length })}</span>
            </div>
          </div>

          {campaign.requirements && (
            <div className="mb-4">
              <h3 className="font-bold mb-1.5">{t("requirements")}</h3>
              <p className="text-sm text-neutral-600 whitespace-pre-line">
                {campaign.requirements}
              </p>
            </div>
          )}
          {campaign.deliverables && (
            <div>
              <h3 className="font-bold mb-1.5">{t("deliverables")}</h3>
              <p className="text-sm text-neutral-600 whitespace-pre-line">
                {campaign.deliverables}
              </p>
            </div>
          )}
        </motion.div>

        {/* Creator view: apply form or own application status */}
        {!isOwnerOrAdmin && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 md:p-8 border shadow-sm"
          >
            {myApplication ? (
              <div>
                <h3 className="font-bold text-lg mb-3">{t("yourApplication")}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadgeClass(myApplication.status)}`}
                >
                  {t(`status.${myApplication.status}`)}
                </span>
                {myApplication.message && (
                  <p className="text-sm text-neutral-600 mt-3 whitespace-pre-line">
                    {myApplication.message}
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleApply}>
                <h3 className="font-bold text-lg mb-3">{t("applyTitle")}</h3>
                <label className="block text-sm font-medium mb-1.5">
                  {t("pitchLabel")}
                </label>
                <textarea
                  required
                  rows={5}
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  placeholder={t("pitchPlaceholder")}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-pink-500 mb-4"
                />
                {submitError && (
                  <div className="flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-200 mb-4">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{submitError}</p>
                  </div>
                )}
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="bg-gradient-to-r from-pink-500 to-violet-500 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {t("applySubmit")}
                </Button>
              </form>
            )}
          </motion.div>
        )}

        {/* Brand/admin view: applicants list */}
        {isOwnerOrAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 md:p-8 border shadow-sm"
          >
            <h3 className="font-bold text-lg mb-4">
              {t("applicantsTitle")}
            </h3>
            {applicants.length === 0 ? (
              <p className="text-sm text-neutral-500">{t("noApplicants")}</p>
            ) : (
              <div className="space-y-4">
                {applicants.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl border border-gray-100"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold">
                        {app.profiles?.name ?? "—"}
                      </span>
                      {app.profiles?.niche && (
                        <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full">
                          {app.profiles.niche}
                        </span>
                      )}
                      {app.profiles?.follower_count != null && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {t("followersBadge", {
                            count: app.profiles.follower_count.toLocaleString(),
                          })}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(app.status)}`}
                      >
                        {t(`status.${app.status}`)}
                      </span>
                      <span className="ml-auto text-xs text-neutral-400">
                        {formatDate(app.created_at, locale)}
                      </span>
                    </div>
                    {app.message && (
                      <p className="text-sm text-neutral-600 mb-3 whitespace-pre-line">
                        {app.message}
                      </p>
                    )}
                    {app.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          isLoading={actionLoading === app.id}
                          disabled={actionLoading !== null}
                          onClick={() => handleStatusUpdate(app.id, "accepted")}
                          className="bg-green-500 text-white hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {t("accept")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoading !== null}
                          onClick={() => handleStatusUpdate(app.id, "rejected")}
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
          </motion.div>
        )}
      </div>
    </main>
  );
}

export default function CampaignDetailWrapper() {
  return (
    <AuthGuard>
      <CampaignDetailPage />
    </AuthGuard>
  );
}
