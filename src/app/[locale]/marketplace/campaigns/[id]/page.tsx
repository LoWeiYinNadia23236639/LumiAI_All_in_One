"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Megaphone,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  ClipboardList,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth-guard";
import { Skeleton, ListRowSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/contexts/auth-context";
import { getSupabaseClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/format";
import { formatRelativeTime, daysUntil } from "@/lib/relative-time";
import { callApply, ApplyAuthError, DuplicateApplicationError } from "@/lib/applications/client";
import { useTranslations, useLocale } from "next-intl";

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
  const tc = useTranslations("common");
  const locale = useLocale();
  const params = useParams();
  const campaignId = params.id as string;
  const { user } = useAuth();
  const toast = useToast();

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [applicants, setApplicants] = useState<ApplicationRow[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(true);
  const [myApplication, setMyApplication] = useState<ApplicationRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [pitch, setPitch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const isOwnerOrAdmin =
    !!user && (user.role === "admin" || user.id === campaign?.brand_id);

  const pitchLength = pitch.trim().length;
  const pitchInvalid = pitchLength > 0 && pitchLength < 20;

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
        setApplicantsLoading(false);
        return;
      }
      setCampaign(data as unknown as CampaignDetail);
      setIsLoading(false);

      const { data: appRows } = await supabase
        .from("applications")
        .select("*, profiles(name, niche, follower_count)")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false });
      setApplicants((appRows ?? []) as unknown as ApplicationRow[]);
      setApplicantsLoading(false);
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
    if (!campaign || pitchLength < 20) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await callApply(campaign.id, pitch.trim());
      setMyApplication({
        id: result.id,
        status: result.status,
        message: pitch.trim(),
        created_at: new Date().toISOString(),
        creator_id: user?.id ?? "",
        profiles: null,
      });
      toast.success(t("applySuccess"));
      setIsSubmitting(false);
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
      toast.success(tc("savedToast"));
    }
    setActionLoading(null);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-cream pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <Skeleton className="w-32 h-9 mb-4" />
          <div className="bg-paper rounded-lg p-6 md:p-8 border border-line mb-6 space-y-4">
            <div className="flex items-start gap-3">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2 pt-1">
                <Skeleton className="w-2/3 h-7" />
                <Skeleton className="w-40 h-4" />
              </div>
            </div>
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-5/6 h-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
            </div>
          </div>
          <div className="bg-paper rounded-lg p-6 md:p-8 border border-line space-y-4">
            <Skeleton className="w-48 h-6" />
            <ListRowSkeleton />
            <ListRowSkeleton />
          </div>
        </div>
      </main>
    );
  }

  if (loadError || !campaign) {
    return (
      <main className="min-h-screen bg-cream pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <ErrorState />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream pt-24 pb-16">
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
          className="bg-paper rounded-lg p-6 md:p-8 border border-line mb-6"
        >
          {campaign.niche && (
            <div className="mb-4">
              <span className="oval-label">{campaign.niche.toUpperCase()}</span>
            </div>
          )}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Megaphone className="w-6 h-6 text-cream" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 break-words">
                {campaign.title}
              </h1>
              <p className="text-neutral-500">
                {campaign.profiles?.name ?? "—"}
                {campaign.niche && (
                  <span className="ml-2 px-2 py-0.5 bg-primary-soft text-primary text-xs rounded-full">
                    {campaign.niche}
                  </span>
                )}
              </p>
            </div>
          </div>

          <p className="text-neutral-700 mb-6 whitespace-pre-line">
            {campaign.description}
          </p>

          {/* Spec sheet */}
          <div className="border-t border-line">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b border-line">
              <div>
                <p className="text-xs uppercase tracking-widest text-ink-soft">
                  {t("specBudget")}
                </p>
                <p className="font-quote text-xl mt-1">
                  {campaign.budget != null
                    ? `$${campaign.budget.toLocaleString()}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-ink-soft">
                  {t("specDeadline")}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="font-medium text-neutral-900">
                    {campaign.deadline
                      ? formatDate(campaign.deadline, locale)
                      : t("noDeadline")}
                  </span>
                  <DeadlineChip deadline={campaign.deadline} />
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-ink-soft">
                  {t("specPosted")}
                </p>
                <p className="mt-1 font-medium text-neutral-900">
                  {formatDate(campaign.created_at, locale)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-ink-soft">
                  {t("applicantsTitle")}
                </p>
                <p className="font-quote text-xl mt-1">{applicants.length}</p>
              </div>
            </div>
            {campaign.requirements && (
              <div className="py-4 border-b border-line">
                <p className="text-xs uppercase tracking-widest text-ink-soft flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5 text-primary" />
                  {t("specRequirements")}
                </p>
                <p className="text-sm text-neutral-700 mt-2 whitespace-pre-line">
                  {campaign.requirements}
                </p>
              </div>
            )}
            {campaign.deliverables && (
              <div className="py-4 border-b border-line">
                <p className="text-xs uppercase tracking-widest text-ink-soft flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-primary" />
                  {t("specDeliverables")}
                </p>
                <p className="text-sm text-neutral-700 mt-2 whitespace-pre-line">
                  {campaign.deliverables}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Creator view: apply form or own application status */}
        {!isOwnerOrAdmin && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-paper rounded-lg p-6 md:p-8 border border-line"
          >
            {myApplication ? (
              <div>
                <h3 className="font-bold text-lg mb-3">{t("yourApplication")}</h3>
                {(myApplication.status === "accepted" ||
                  myApplication.status === "rejected" ||
                  myApplication.status === "pending") && (
                  <span
                    className={`absolute top-3 right-3 -rotate-[8deg] rounded-full border border-dashed px-2 py-0.5 text-[10px] uppercase tracking-widest ${
                      myApplication.status === "accepted"
                        ? "border-green-600 text-green-600"
                        : myApplication.status === "rejected"
                          ? "border-stone-400 text-stone-400"
                          : "border-accent text-accent"
                    }`}
                  >
                    {myApplication.status === "accepted"
                      ? t("stampAccepted")
                      : myApplication.status === "rejected"
                        ? t("stampDeclined")
                        : t("stampUnderReview")}
                  </span>
                )}
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
                  maxLength={500}
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  placeholder={t("pitchPlaceholder")}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary ${
                    pitchInvalid ? "border-red-400" : ""
                  }`}
                />
                <div className="flex items-center justify-between mt-1 mb-4">
                  {pitchInvalid ? (
                    <p className="text-xs text-red-600">{t("pitchTooShort")}</p>
                  ) : (
                    <span />
                  )}
                  <p
                    className={`text-xs ml-auto ${
                      pitch.length > 450 ? "text-yellow-600" : "text-neutral-400"
                    }`}
                  >
                    {tc("charCount", { count: pitch.length, max: 500 })}
                  </p>
                </div>
                {submitError && (
                  <div className="flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-200 mb-4">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{submitError}</p>
                  </div>
                )}
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={pitchLength < 20}
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
            className="bg-paper rounded-lg p-6 md:p-8 border border-line"
          >
            <h3 className="font-bold text-lg mb-4">
              {t("applicantsTitle")}
            </h3>
            {applicantsLoading ? (
              <div className="space-y-4">
                <ListRowSkeleton />
                <ListRowSkeleton />
              </div>
            ) : applicants.length === 0 ? (
              <p className="text-sm text-neutral-500">{t("noApplicants")}</p>
            ) : (
              <div className="space-y-4">
                {applicants.map((app) => (
                  <div
                    key={app.id}
                    className="relative p-4 rounded-xl border border-gray-100"
                  >
                    {(app.status === "accepted" || app.status === "rejected") && (
                      <span
                        className={`absolute top-3 right-3 -rotate-[8deg] rounded-full border border-dashed px-2 py-0.5 text-[10px] uppercase tracking-widest ${
                          app.status === "accepted"
                            ? "border-green-600 text-green-600"
                            : "border-stone-400 text-stone-400"
                        }`}
                      >
                        {app.status === "accepted"
                          ? t("stampAccepted")
                          : t("stampDeclined")}
                      </span>
                    )}
                    <div
                      className={`flex flex-wrap items-center gap-2 mb-2 ${
                        app.status === "accepted" || app.status === "rejected"
                          ? "mt-5"
                          : ""
                      }`}
                    >
                      <span className="font-bold">
                        {app.profiles?.name ?? "—"}
                      </span>
                      {app.profiles?.niche && (
                        <span className="px-2 py-0.5 bg-primary-soft text-primary text-xs rounded-full">
                          {app.profiles.niche}
                        </span>
                      )}
                      {app.profiles?.follower_count != null && (
                        <span className="px-2 py-0.5 bg-primary-soft text-primary text-xs rounded-full">
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
                        {formatDate(app.created_at, locale)} ·{" "}
                        {formatRelativeTime(app.created_at, locale)}
                      </span>
                    </div>
                    {app.message && (
                      <p className="text-sm text-neutral-600 mb-3 whitespace-pre-line break-words min-w-0">
                        {app.message}
                      </p>
                    )}
                    {app.status === "pending" && (
                      <div className="flex flex-wrap gap-2">
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
                          onClick={() => setRejectTarget(app.id)}
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

        <ConfirmDialog
          open={rejectTarget !== null}
          danger
          title={t("confirmReject.title")}
          description={t("confirmReject.description")}
          confirmLabel={t("confirmReject.confirm")}
          onConfirm={() => {
            if (rejectTarget) handleStatusUpdate(rejectTarget, "rejected");
            setRejectTarget(null);
          }}
          onCancel={() => setRejectTarget(null)}
        />
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
