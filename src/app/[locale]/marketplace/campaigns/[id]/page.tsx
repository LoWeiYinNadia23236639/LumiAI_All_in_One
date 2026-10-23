"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Gift,
  Percent,
  Award,
  Copy,
  ExternalLink,
  ShieldCheck,
  FileSignature,
  Truck,
  Flag,
  MessageSquare,
  DollarSign,
  CalendarClock,
  Star,
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
import {
  CAMPAIGN_TYPES,
  type CampaignRow,
  type CampaignType,
  type ApplicationRow,
  type PaymentKind,
  type PaymentRow,
} from "@/types/marketplace";
import { callApi, ApiAuthError } from "@/lib/api/client";

interface ApplicantRow extends ApplicationRow {
  profiles: { name: string; niche: string | null; follower_count: number | null } | null;
}

interface ContractRow {
  id: string;
  campaign_id: string;
  creator_id: string;
  brand_id: string;
  terms: string;
  status: string;
  brand_agreed_at: string | null;
  creator_agreed_at: string | null;
  created_at: string;
}

interface SubmissionRow {
  id: string;
  campaign_id: string;
  creator_id: string;
  post_url: string;
  note: string;
  status: string;
  brand_feedback: string | null;
  created_at: string;
}

interface AffiliateSaleRow {
  id: string;
  period: string;
  units: number;
  revenue: number;
}

interface ReviewRow {
  id: string;
  reviewer_id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer?: { name: string } | null;
}
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

interface ApplicantRow extends ApplicationRow {
  profiles: { name: string; niche: string | null; follower_count: number | null } | null;
}

function campaignTypeOf(campaign: CampaignRow): CampaignType {
  return CAMPAIGN_TYPES.includes(campaign.campaign_type as CampaignType)
    ? campaign.campaign_type
    : "paid";
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
  const router = useRouter();
  const campaignId = params.id as string;
  const { user } = useAuth();
  const toast = useToast();

  const [campaign, setCampaign] = useState<(CampaignRow & { profiles: { name: string } | null }) | null>(null);
  const [applicants, setApplicants] = useState<ApplicantRow[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(true);
  const [myApplication, setMyApplication] = useState<ApplicantRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [pitch, setPitch] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const [contract, setContract] = useState<ContractRow | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [postUrl, setPostUrl] = useState("");
  const [workNote, setWorkNote] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [feedbackById, setFeedbackById] = useState<Record<string, string>>({});
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false);
  const [agreeLoading, setAgreeLoading] = useState(false);
  const [dmLoadingId, setDmLoadingId] = useState<string | null>(null);

  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [recordFormOpen, setRecordFormOpen] = useState(false);
  const [recordAmount, setRecordAmount] = useState("");
  const [recordKind, setRecordKind] = useState<PaymentKind>("retainer");
  const [recordNote, setRecordNote] = useState("");

  const [sales, setSales] = useState<AffiliateSaleRow[]>([]);
  const [salePeriod, setSalePeriod] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [saleUnits, setSaleUnits] = useState("");
  const [saleRevenue, setSaleRevenue] = useState("");

  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [brandRating, setBrandRating] = useState<{ avg: number; count: number } | null>(null);
  const [myRating, setMyRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

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
      setCampaign(data as unknown as CampaignRow & { profiles: { name: string } | null });
      setIsLoading(false);

      const { data: appRows } = await supabase
        .from("applications")
        .select("*, profiles(name, niche, follower_count)")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false });
      setApplicants((appRows ?? []) as unknown as ApplicantRow[]);
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
        if (data) setMyApplication(data as unknown as ApplicantRow);
      });
  }, [user, campaign, isOwnerOrAdmin]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign || pitchLength < 20) return;
    const isBarter = campaignTypeOf(campaign) === "barter";
    if (isBarter && shippingAddress.trim().length < 10) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await callApply(
        campaign.id,
        pitch.trim(),
        isBarter ? shippingAddress.trim() : undefined
      );
      setMyApplication({
        id: result.id,
        campaign_id: campaign.id,
        status: result.status,
        message: pitch.trim(),
        created_at: new Date().toISOString(),
        creator_id: user?.id ?? "",
        offer: false,
        offered_price: null,
        shipping_address: isBarter ? shippingAddress.trim() : null,
        tracking_number: null,
        shipping_status: "pending",
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
    try {
      const result = await callApi<{ id: string; status: string }>(
        "/api/applications/status",
        { application_id: appId, action: status }
      );
      setApplicants((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: result.status } : a))
      );
      toast.success(tc("savedToast"));
    } catch (err) {
      toast.error(err instanceof ApiAuthError ? t("authError") : t("actionError"));
    }
    setActionLoading(null);
  };

  const acceptedApplicant = applicants.find((a) => a.status === "accepted") ?? null;

  // Load contract + submissions once there is an accepted application
  useEffect(() => {
    if (!campaign || !user) return;
    const acceptedApp = isOwnerOrAdmin
      ? acceptedApplicant
      : myApplication?.status === "accepted"
        ? myApplication
        : null;
    if (!acceptedApp) {
      setContract(null);
      setSubmissions([]);
      setPayments([]);
      setSales([]);
      return;
    }
    const supabase = getSupabaseClient();
    supabase
      .from("contracts")
      .select("*")
      .eq("campaign_id", campaign.id)
      .eq("creator_id", acceptedApp.creator_id)
      .maybeSingle()
      .then(({ data }) => {
        setContract((data ?? null) as ContractRow | null);
      });
    supabase
      .from("submissions")
      .select("*")
      .eq("campaign_id", campaign.id)
      .eq("creator_id", acceptedApp.creator_id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSubmissions((data ?? []) as unknown as SubmissionRow[]);
      });
    supabase
      .from("payments")
      .select("*")
      .eq("campaign_id", campaign.id)
      .eq("creator_id", acceptedApp.creator_id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPayments((data ?? []) as unknown as PaymentRow[]);
      });
    if (campaignTypeOf(campaign) === "affiliate") {
      supabase
        .from("affiliate_sales")
        .select("id, period, units, revenue")
        .eq("campaign_id", campaign.id)
        .eq("creator_id", acceptedApp.creator_id)
        .order("period", { ascending: false })
        .then(({ data }) => {
          setSales((data ?? []) as unknown as AffiliateSaleRow[]);
        });
    }
  }, [campaign, user, isOwnerOrAdmin, acceptedApplicant, myApplication]);

  // Reviews (visible once the campaign is completed) + brand reputation
  useEffect(() => {
    if (!campaign || campaign.status !== "completed") return;
    const supabase = getSupabaseClient();
    supabase
      .from("reviews")
      .select("id, reviewer_id, rating, comment, created_at, reviewer:profiles!reviews_reviewer_id_fkey(name)")
      .eq("campaign_id", campaign.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setReviews((data ?? []) as unknown as ReviewRow[]);
      });
    supabase
      .from("reviews")
      .select("rating")
      .eq("reviewee_id", campaign.brand_id)
      .then(({ data }) => {
        const rows = (data ?? []) as { rating: number }[];
        if (rows.length > 0) {
          setBrandRating({
            avg: rows.reduce((s, r) => s + r.rating, 0) / rows.length,
            count: rows.length,
          });
        }
      });
  }, [campaign]);

  const handleAgreeContract = async () => {
    if (!campaign || agreeLoading) return;
    setAgreeLoading(true);
    try {
      const result = await callApi<ContractRow>("/api/contracts/agree", {
        campaign_id: campaign.id,
      });
      setContract(result);
      toast.success(tc("savedToast"));
    } catch (err) {
      toast.error(err instanceof ApiAuthError ? t("authError") : t("actionError"));
    }
    setAgreeLoading(false);
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign || !postUrl.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await callApi<SubmissionRow>("/api/submissions", {
        campaign_id: campaign.id,
        post_url: postUrl.trim(),
        note: workNote.trim(),
      });
      setSubmissions((prev) => [result, ...prev]);
      setPostUrl("");
      setWorkNote("");
      toast.success(t("submitWorkSuccess"));
    } catch (err) {
      toast.error(err instanceof ApiAuthError ? t("authError") : t("actionError"));
    }
    setIsSubmitting(false);
  };

  const handleReviewSubmission = async (
    submissionId: string,
    action: "approved" | "revision"
  ) => {
    setActionLoading(submissionId);
    try {
      const result = await callApi<SubmissionRow>("/api/submissions/review", {
        submission_id: submissionId,
        action,
        feedback: feedbackById[submissionId]?.trim() || undefined,
      });
      setSubmissions((prev) =>
        prev.map((s) => (s.id === submissionId ? result : s))
      );
      toast.success(tc("savedToast"));
    } catch (err) {
      toast.error(err instanceof ApiAuthError ? t("authError") : t("actionError"));
    }
    setActionLoading(null);
  };

  const handleShip = async (applicationId: string) => {
    setActionLoading(applicationId);
    try {
      const result = await callApi<{ shipping_status: string; tracking_number: string | null }>(
        "/api/applications/shipping",
        { application_id: applicationId, action: "ship", tracking_number: trackingNumber.trim() }
      );
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === applicationId
            ? { ...a, shipping_status: result.shipping_status, tracking_number: result.tracking_number }
            : a
        )
      );
      toast.success(tc("savedToast"));
    } catch (err) {
      toast.error(err instanceof ApiAuthError ? t("authError") : t("actionError"));
    }
    setActionLoading(null);
  };

  const handleReceive = async (applicationId: string) => {
    setActionLoading(applicationId);
    try {
      await callApi("/api/applications/shipping", {
        application_id: applicationId,
        action: "receive",
      });
      setMyApplication((prev) =>
        prev ? { ...prev, shipping_status: "received" } : prev
      );
      toast.success(tc("savedToast"));
    } catch (err) {
      toast.error(err instanceof ApiAuthError ? t("authError") : t("actionError"));
    }
    setActionLoading(null);
  };

  const handleComplete = async () => {
    if (!campaign) return;
    setActionLoading("complete");
    try {
      await callApi("/api/campaigns/complete", { campaign_id: campaign.id });
      setCampaign((prev) => (prev ? { ...prev, status: "completed" } : prev));
      toast.success(t("completeSuccess"));
    } catch (err) {
      toast.error(err instanceof ApiAuthError ? t("authError") : t("actionError"));
    }
    setActionLoading(null);
    setCompleteConfirmOpen(false);
  };

  const openConversation = async (creatorId?: string) => {
    if (!campaign || dmLoadingId) return;
    setDmLoadingId(creatorId ?? "brand");
    try {
      const result = await callApi<{ conversation_id: string }>(
        "/api/conversations/ensure",
        {
          campaign_id: campaign.id,
          ...(creatorId ? { creator_id: creatorId } : {}),
        }
      );
      router.push(`/${locale}/messages?conversation=${result.conversation_id}`);
    } catch (err) {
      toast.error(err instanceof ApiAuthError ? t("authError") : t("actionError"));
      setDmLoadingId(null);
    }
  };

  const patchPayment = (updated: PaymentRow) =>
    setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

  const handleMarkPaid = async (paymentId: string) => {
    setActionLoading(paymentId);
    try {
      const result = await callApi<PaymentRow>("/api/payments/transition", {
        payment_id: paymentId,
        action: "mark_paid",
      });
      patchPayment(result);
      toast.success(tc("savedToast"));
    } catch (err) {
      toast.error(err instanceof ApiAuthError ? t("authError") : t("actionError"));
    }
    setActionLoading(null);
  };

  const handleConfirmPayment = async (paymentId: string) => {
    setActionLoading(paymentId);
    try {
      const result = await callApi<PaymentRow>("/api/payments/transition", {
        payment_id: paymentId,
        action: "confirm",
      });
      patchPayment(result);
      toast.success(tc("savedToast"));
    } catch (err) {
      toast.error(err instanceof ApiAuthError ? t("authError") : t("actionError"));
    }
    setActionLoading(null);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign || !acceptedAppForView || !recordAmount.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await callApi<PaymentRow>("/api/payments", {
        campaign_id: campaign.id,
        creator_id: acceptedAppForView.creator_id,
        amount: Number(recordAmount),
        kind: recordKind,
        note: recordNote.trim() || undefined,
      });
      setPayments((prev) => [result, ...prev]);
      setRecordFormOpen(false);
      setRecordAmount("");
      setRecordNote("");
      toast.success(tc("savedToast"));
    } catch (err) {
      toast.error(err instanceof ApiAuthError ? t("authError") : t("actionError"));
    }
    setIsSubmitting(false);
  };

  const handleReportSales = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !campaign ||
      !acceptedAppForView ||
      !salePeriod ||
      !saleUnits.trim() ||
      !saleRevenue.trim() ||
      isSubmitting
    )
      return;
    setIsSubmitting(true);
    try {
      await callApi("/api/affiliate-sales", {
        campaign_id: campaign.id,
        creator_id: acceptedAppForView.creator_id,
        period: salePeriod,
        units: Number(saleUnits),
        revenue: Number(saleRevenue),
      });
      const supabase = getSupabaseClient();
      const { data: saleRows } = await supabase
        .from("affiliate_sales")
        .select("id, period, units, revenue")
        .eq("campaign_id", campaign.id)
        .eq("creator_id", acceptedAppForView.creator_id)
        .order("period", { ascending: false });
      setSales((saleRows ?? []) as unknown as AffiliateSaleRow[]);
      const { data: payRows } = await supabase
        .from("payments")
        .select("*")
        .eq("campaign_id", campaign.id)
        .eq("creator_id", acceptedAppForView.creator_id)
        .order("created_at", { ascending: false });
      setPayments((payRows ?? []) as unknown as PaymentRow[]);
      toast.success(tc("savedToast"));
    } catch (err) {
      toast.error(err instanceof ApiAuthError ? t("authError") : t("actionError"));
    }
    setIsSubmitting(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign || myRating < 1 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await callApi("/api/reviews", {
        campaign_id: campaign.id,
        rating: myRating,
        comment: reviewComment.trim(),
      });
      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from("reviews")
        .select("id, reviewer_id, rating, comment, created_at, reviewer:profiles!reviews_reviewer_id_fkey(name)")
        .eq("campaign_id", campaign.id)
        .order("created_at", { ascending: false });
      setReviews((data ?? []) as unknown as ReviewRow[]);
      setMyRating(0);
      setReviewComment("");
      toast.success(tc("savedToast"));
    } catch (err) {
      toast.error(err instanceof ApiAuthError ? t("authError") : t("actionError"));
    }
    setIsSubmitting(false);
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

  const campaignType = campaignTypeOf(campaign);
  const typeBadgeClass: Record<CampaignType, string> = {
    paid: "bg-green-100 text-green-700",
    barter: "bg-orange-100 text-orange-700",
    affiliate: "bg-violet-100 text-violet-700",
    ambassador: "bg-blue-100 text-blue-700",
  };
  const TypeIcon = {
    paid: Megaphone,
    barter: Gift,
    affiliate: Percent,
    ambassador: Award,
  }[campaignType];

  const acceptedAppForView = isOwnerOrAdmin
    ? acceptedApplicant
    : myApplication?.status === "accepted"
      ? myApplication
      : null;
  const contractSignedByMe = isOwnerOrAdmin
    ? contract?.brand_agreed_at != null
    : contract?.creator_agreed_at != null;
  const canSubmitWork =
    !isOwnerOrAdmin &&
    !!user &&
    myApplication?.status === "accepted" &&
    contract?.status === "agreed" &&
    campaign.status === "active";
  const hasUnreviewedSubmission = submissions.some((s) => s.status === "submitted");
  const canComplete =
    isOwnerOrAdmin &&
    !!acceptedAppForView &&
    campaign.status === "active" &&
    !hasUnreviewedSubmission;
  const submissionBadgeClass: Record<string, string> = {
    submitted: "bg-orange-100 text-orange-700",
    approved: "bg-green-100 text-green-700",
    revision: "bg-red-100 text-red-700",
  };
  const paymentBadgeClass: Record<string, string> = {
    pending: "bg-orange-100 text-orange-700",
    paid: "bg-blue-100 text-blue-700",
    confirmed: "bg-green-100 text-green-700",
  };
  const paymentKindIcon: Record<PaymentKind, typeof DollarSign> = {
    campaign_fee: DollarSign,
    retainer: CalendarClock,
    commission: Percent,
    barter_value: Gift,
  };
  const commissionRate = campaign.commission_rate ?? 0;
  const totalUnits = sales.reduce((s, r) => s + r.units, 0);
  const totalRevenue = sales.reduce((s, r) => s + r.revenue, 0);
  const commissionPayments = payments.filter((p) => p.kind === "commission");
  const commissionPending = commissionPayments
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + p.amount, 0);
  const commissionConfirmed = commissionPayments
    .filter((p) => p.status === "confirmed")
    .reduce((s, p) => s + p.amount, 0);
  const myReview = user ? reviews.find((r) => r.reviewer_id === user.id) : undefined;
  const canReview =
    campaign.status === "completed" &&
    !!user &&
    !myReview &&
    (isOwnerOrAdmin || myApplication?.status === "accepted");

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
            <div className="mb-4 flex items-center gap-2">
              <span className="oval-label">{campaign.niche.toUpperCase()}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeBadgeClass[campaignType]}`}
              >
                {t(`typeBadge.${campaignType}`)}
              </span>
              {campaignType === "ambassador" && campaign.exclusivity && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {t("specExclusivityBadge")}
                </span>
              )}
            </div>
          )}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <TypeIcon className="w-6 h-6 text-cream" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 break-words">
                {campaign.title}
              </h1>
              <p className="text-neutral-500">
                {campaign.profiles?.name ?? "—"}
                {brandRating && (
                  <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                    <Star className="w-3 h-3 fill-current" />
                    {brandRating.avg.toFixed(1)} ({brandRating.count})
                  </span>
                )}
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
                  {campaignType === "paid" && t("specBudget")}
                  {campaignType === "barter" && t("specProductValue")}
                  {campaignType === "affiliate" && t("specCommission")}
                  {campaignType === "ambassador" && t("specRetainer")}
                </p>
                <p className="font-quote text-xl mt-1">
                  {campaignType === "paid" &&
                    (campaign.budget != null
                      ? `$${campaign.budget.toLocaleString()}`
                      : "—")}
                  {campaignType === "barter" &&
                    t("productValueDisplay", {
                      value: (campaign.product_value ?? 0).toLocaleString(),
                    })}
                  {campaignType === "affiliate" &&
                    (campaign.commission_rate != null
                      ? `${campaign.commission_rate}%`
                      : "—")}
                  {campaignType === "ambassador" &&
                    (campaign.retainer_fee != null
                      ? t("retainerDisplay", {
                          fee: campaign.retainer_fee.toLocaleString(),
                        })
                      : "—")}
                </p>
              </div>
              {campaignType === "barter" && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-ink-soft">
                    {t("specProductName")}
                  </p>
                  <p className="mt-1 font-medium text-neutral-900">
                    {campaign.product_name ?? "—"}
                  </p>
                </div>
              )}
              {campaignType === "affiliate" && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-ink-soft">
                    {t("specDiscountCode")}
                  </p>
                  <p className="mt-1 font-medium text-neutral-900">
                    {campaign.discount_code ?? "—"}
                  </p>
                </div>
              )}
              {campaignType === "ambassador" && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-ink-soft">
                    {t("specContractMonths")}
                  </p>
                  <p className="mt-1 font-medium text-neutral-900">
                    {campaign.contract_months != null
                      ? t("contractMonthsDisplay", {
                          months: campaign.contract_months,
                        })
                      : "—"}
                  </p>
                </div>
              )}
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
            {campaignType === "affiliate" && campaign.shop_url && (
              <div className="py-4 border-b border-line">
                <p className="text-xs uppercase tracking-widest text-ink-soft flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-primary" />
                  {t("specShopUrl")}
                </p>
                <a
                  href={campaign.shop_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline mt-2 inline-block break-all"
                >
                  {campaign.shop_url}
                </a>
              </div>
            )}
            {(campaignType === "paid" || campaignType === "ambassador") && (
              <div className="py-4 border-b border-line">
                <p className="text-xs uppercase tracking-widest text-ink-soft">
                  {t("specReviewRounds")}
                </p>
                <p className="text-sm text-neutral-700 mt-2">
                  {t("reviewRoundsDisplay", { rounds: campaign.review_rounds })}
                  {" · "}
                  {t("usageRightsDisplay", {
                    months: campaign.usage_rights_months,
                  })}
                </p>
              </div>
            )}
            {campaign.terms && (
              <div className="py-4 border-b border-line">
                <p className="text-xs uppercase tracking-widest text-ink-soft">
                  {t("specTerms")}
                </p>
                <p className="text-sm text-neutral-700 mt-2 whitespace-pre-line">
                  {campaign.terms}
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
                {campaign.profiles && (
                  <div className="mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      isLoading={dmLoadingId === "brand"}
                      disabled={dmLoadingId !== null}
                      onClick={() => void openConversation()}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {t("messageBrand")}
                    </Button>
                  </div>
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
                {campaignType === "barter" && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1.5">
                      {t("shippingAddressLabel")}
                      <span className="text-red-500"> *</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      maxLength={500}
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder={t("shippingAddressPlaceholder")}
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}
                {submitError && (
                  <div className="flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-200 mb-4">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{submitError}</p>
                  </div>
                )}
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={
                    pitchLength < 20 ||
                    (campaignType === "barter" && shippingAddress.trim().length < 10)
                  }
                >
                  <Send className="w-4 h-4 mr-2" />
                  {t("applySubmit")}
                </Button>
              </form>
            )}
          </motion.div>
        )}

        {/* Creator view: affiliate commission info after acceptance */}
        {!isOwnerOrAdmin && user && campaignType === "affiliate" &&
          myApplication?.status === "accepted" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-paper rounded-lg p-6 md:p-8 border border-line mb-6"
            >
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                <Percent className="w-5 h-5 text-primary" />
                {t("affiliateInfoTitle")}
              </h3>
              <p className="text-sm text-neutral-500 mb-4">
                {t("affiliateInfoDesc")}
              </p>
              {campaign.discount_code && (
                <div className="flex items-center gap-2 mb-3">
                  <code className="flex-1 px-4 py-3 rounded-xl bg-primary-soft text-primary font-bold tracking-wider text-center">
                    {campaign.discount_code}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(campaign.discount_code!);
                      toast.success(tc("copied"));
                    }}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {tc("copy")}
                  </Button>
                </div>
              )}
              {campaign.shop_url && (
                <a href={campaign.shop_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {t("affiliateShopLink")}
                  </Button>
                </a>
              )}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="font-bold text-neutral-900">{totalUnits}</p>
                  <p className="text-xs text-neutral-500">{t("affiliateTotalUnits")}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="font-bold text-neutral-900">
                    ${totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-neutral-500">{t("affiliateTotalRevenue")}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="font-bold text-neutral-900">
                    ${commissionConfirmed.toLocaleString()}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {t("affiliateCommissionConfirmed")}
                  </p>
                </div>
              </div>
              {commissionPending > 0 && (
                <p className="text-xs text-orange-600 mt-2">
                  {t("affiliateCommissionPending", {
                    amount: commissionPending.toLocaleString(),
                  })}
                </p>
              )}
            </motion.div>
          )}

        {/* Contract card — visible to both parties once an application is accepted */}
        {acceptedAppForView && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-paper rounded-lg p-6 md:p-8 border border-line mb-6"
          >
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-primary" />
              {t("contractTitle")}
              {contract?.status === "agreed" && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  {t("contractAgreedBadge")}
                </span>
              )}
            </h3>
            {!contract ? (
              <p className="text-sm text-neutral-500">{t("contractPendingCreate")}</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      contract.brand_agreed_at
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {contract.brand_agreed_at
                      ? t("contractBrandSigned")
                      : t("contractBrandPending")}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      contract.creator_agreed_at
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {contract.creator_agreed_at
                      ? t("contractCreatorSigned")
                      : t("contractCreatorPending")}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 mb-4">
                  <p className="text-xs uppercase tracking-widest text-ink-soft mb-2">
                    {t("contractTermsLabel")}
                  </p>
                  <p className="text-sm text-neutral-700 whitespace-pre-line">
                    {contract.terms || t("contractNoTerms")}
                  </p>
                </div>
                {!contractSignedByMe && contract.status === "draft" && (
                  <Button onClick={handleAgreeContract} isLoading={agreeLoading}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t("contractAgreeButton")}
                  </Button>
                )}
                {contract.status === "agreed" && (
                  <p className="text-sm text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {t("contractAgreedLine")}
                  </p>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* Submissions — creator submits, both parties see the list */}
        {acceptedAppForView && (canSubmitWork || submissions.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-paper rounded-lg p-6 md:p-8 border border-line mb-6"
          >
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              {t("submissionsTitle")}
            </h3>
            {canSubmitWork && (
              <form onSubmit={handleSubmitWork} className="mb-6 p-4 rounded-xl border border-line">
                <label className="block text-sm font-medium mb-1.5">
                  {t("postUrlLabel")}
                  <span className="text-red-500"> *</span>
                </label>
                <input
                  type="url"
                  required
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                  placeholder={t("postUrlPlaceholder")}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary mb-3"
                />
                <label className="block text-sm font-medium mb-1.5">
                  {t("noteLabel")}
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={workNote}
                  onChange={(e) => setWorkNote(e.target.value)}
                  placeholder={t("notePlaceholder")}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary mb-3"
                />
                <Button type="submit" isLoading={isSubmitting} disabled={!postUrl.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  {t("submitWorkButton")}
                </Button>
              </form>
            )}
            <div className="space-y-4">
              {submissions.map((sub) => (
                <div key={sub.id} className="p-4 rounded-xl border border-gray-100">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <a
                      href={sub.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline break-all"
                    >
                      {sub.post_url}
                    </a>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${submissionBadgeClass[sub.status]}`}
                    >
                      {t(`submissionStatus.${sub.status}`)}
                    </span>
                    <span className="ml-auto text-xs text-neutral-400">
                      {formatDate(sub.created_at, locale)}
                    </span>
                  </div>
                  {sub.note && (
                    <p className="text-sm text-neutral-600 mb-2 whitespace-pre-line">
                      {sub.note}
                    </p>
                  )}
                  {sub.brand_feedback && (
                    <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 whitespace-pre-line">
                      {sub.brand_feedback}
                    </p>
                  )}
                  {isOwnerOrAdmin && sub.status === "submitted" && (
                    <div className="mt-3">
                      <textarea
                        rows={2}
                        maxLength={500}
                        value={feedbackById[sub.id] ?? ""}
                        onChange={(e) =>
                          setFeedbackById((prev) => ({ ...prev, [sub.id]: e.target.value }))
                        }
                        placeholder={t("feedbackPlaceholder")}
                        className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary mb-2"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          isLoading={actionLoading === sub.id}
                          disabled={actionLoading !== null}
                          onClick={() => handleReviewSubmission(sub.id, "approved")}
                          className="bg-green-500 text-white hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {t("approveSubmission")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={
                            actionLoading !== null ||
                            !(feedbackById[sub.id] ?? "").trim()
                          }
                          onClick={() => handleReviewSubmission(sub.id, "revision")}
                          className="text-neutral-600"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          {t("requestRevision")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Barter shipping — product logistics between brand and creator */}
        {campaignType === "barter" && acceptedAppForView && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-paper rounded-lg p-6 md:p-8 border border-line mb-6"
          >
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              {t("shippingTitle")}
            </h3>
            <p className="text-sm text-neutral-600 whitespace-pre-line mb-4">
              {acceptedAppForView.shipping_address ?? t("shippingNoAddress")}
            </p>
            {acceptedAppForView.shipping_status === "shipped" &&
              acceptedAppForView.tracking_number && (
                <p className="text-sm text-neutral-600 mb-4">
                  {t("trackingLabel")}:{" "}
                  <span className="font-medium">{acceptedAppForView.tracking_number}</span>
                </p>
              )}
            {isOwnerOrAdmin ? (
              acceptedAppForView.shipping_status === "pending" ? (
                <div>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder={t("trackingPlaceholder")}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary mb-3"
                  />
                  <Button
                    size="sm"
                    isLoading={actionLoading === acceptedAppForView.id}
                    disabled={actionLoading !== null}
                    onClick={() => handleShip(acceptedAppForView.id)}
                  >
                    <Truck className="w-4 h-4 mr-1" />
                    {t("shipButton")}
                  </Button>
                </div>
              ) : (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    acceptedAppForView.shipping_status === "received"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {acceptedAppForView.shipping_status === "received"
                    ? t("shippingReceived")
                    : t("shippingShipped")}
                </span>
              )
            ) : (
              acceptedAppForView.shipping_status === "shipped" && (
                <Button
                  size="sm"
                  isLoading={actionLoading === acceptedAppForView.id}
                  disabled={actionLoading !== null}
                  onClick={() => handleReceive(acceptedAppForView.id)}
                  className="bg-green-500 text-white hover:bg-green-600"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {t("receiveButton")}
                </Button>
              )
            )}
          </motion.div>
        )}

        {/* Payments — record-style payment tracking, both parties see the list */}
        {acceptedAppForView && (payments.length > 0 || isOwnerOrAdmin) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-paper rounded-lg p-6 md:p-8 border border-line mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                {t("paymentsTitle")}
              </h3>
              {isOwnerOrAdmin && (
                <Button size="sm" variant="outline" onClick={() => setRecordFormOpen((v) => !v)}>
                  {t("recordPaymentButton")}
                </Button>
              )}
            </div>

            {isOwnerOrAdmin && recordFormOpen && (
              <form
                onSubmit={handleRecordPayment}
                className="mb-4 p-4 rounded-xl border border-line space-y-3"
              >
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {t("recordAmountLabel")}
                      <span className="text-red-500"> *</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={recordAmount}
                      onChange={(e) => setRecordAmount(e.target.value)}
                      placeholder={t("recordAmountPlaceholder")}
                      className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {t("recordKindLabel")}
                    </label>
                    <select
                      value={recordKind}
                      onChange={(e) => setRecordKind(e.target.value as PaymentKind)}
                      className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {(["retainer", "campaign_fee", "commission", "barter_value"] as PaymentKind[]).map(
                        (k) => (
                          <option key={k} value={k}>
                            {t(`paymentKind.${k}`)}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {t("recordNoteLabel")}
                    </label>
                    <input
                      type="text"
                      value={recordNote}
                      onChange={(e) => setRecordNote(e.target.value)}
                      placeholder={t("recordNotePlaceholder")}
                      className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <Button type="submit" size="sm" isLoading={isSubmitting} disabled={!recordAmount.trim()}>
                  {t("recordPaymentSubmit")}
                </Button>
              </form>
            )}

            {payments.length === 0 ? (
              <p className="text-sm text-neutral-500">{t("paymentsEmpty")}</p>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => {
                  const KindIcon = paymentKindIcon[payment.kind];
                  return (
                    <div
                      key={payment.id}
                      className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-gray-100"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary-soft flex items-center justify-center shrink-0">
                        <KindIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-[160px]">
                        <p className="text-sm font-medium text-neutral-900">
                          {t(`paymentKind.${payment.kind}`)}
                          {payment.note && (
                            <span className="text-neutral-400 font-normal"> · {payment.note}</span>
                          )}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {payment.status === "confirmed" && payment.confirmed_at
                            ? t("paymentConfirmedAt", {
                                time: formatRelativeTime(payment.confirmed_at, locale),
                              })
                            : payment.status === "paid" && payment.paid_at
                              ? t("paymentPaidAt", {
                                  time: formatRelativeTime(payment.paid_at, locale),
                                })
                              : formatRelativeTime(payment.created_at, locale)}
                        </p>
                      </div>
                      <p className="font-quote text-lg">${payment.amount.toLocaleString()}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentBadgeClass[payment.status]}`}
                      >
                        {t(`paymentStatus.${payment.status}`)}
                      </span>
                      {isOwnerOrAdmin && payment.status === "pending" && (
                        <Button
                          size="sm"
                          isLoading={actionLoading === payment.id}
                          disabled={actionLoading !== null}
                          onClick={() => void handleMarkPaid(payment.id)}
                        >
                          {t("markPaidButton")}
                        </Button>
                      )}
                      {!isOwnerOrAdmin && payment.status === "paid" && (
                        <Button
                          size="sm"
                          className="bg-green-500 text-white hover:bg-green-600"
                          isLoading={actionLoading === payment.id}
                          disabled={actionLoading !== null}
                          onClick={() => void handleConfirmPayment(payment.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {t("confirmPaymentButton")}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Affiliate monthly sales reporting — brand view */}
        {isOwnerOrAdmin && campaignType === "affiliate" && acceptedAppForView && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-paper rounded-lg p-6 md:p-8 border border-line mb-6"
          >
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              <Percent className="w-5 h-5 text-primary" />
              {t("salesTitle")}
            </h3>
            <p className="text-sm text-neutral-500 mb-4">
              {t("salesDesc", { rate: commissionRate })}
            </p>
            <form onSubmit={handleReportSales} className="mb-5">
              <div className="grid md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {t("salesPeriodLabel")}
                    <span className="text-red-500"> *</span>
                  </label>
                  <input
                    type="month"
                    required
                    value={salePeriod}
                    onChange={(e) => setSalePeriod(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {t("salesUnitsLabel")}
                    <span className="text-red-500"> *</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={saleUnits}
                    onChange={(e) => setSaleUnits(e.target.value)}
                    placeholder="100"
                    className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {t("salesRevenueLabel")}
                    <span className="text-red-500"> *</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={saleRevenue}
                    onChange={(e) => setSaleRevenue(e.target.value)}
                    placeholder="20000"
                    className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button type="submit" isLoading={isSubmitting} disabled={!saleUnits.trim() || !saleRevenue.trim()}>
                  {t("salesReportButton")}
                </Button>
              </div>
            </form>
            {sales.length === 0 ? (
              <p className="text-sm text-neutral-500">{t("salesEmpty")}</p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 text-xs uppercase tracking-widest text-ink-soft px-2">
                  <span>{t("salesColPeriod")}</span>
                  <span>{t("salesColUnits")}</span>
                  <span>{t("salesColRevenue")}</span>
                  <span className="text-right">{t("salesColCommission")}</span>
                </div>
                {sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="grid grid-cols-4 gap-2 text-sm px-2 py-2 rounded-lg bg-gray-50"
                  >
                    <span className="font-medium">{sale.period}</span>
                    <span>{sale.units}</span>
                    <span>${sale.revenue.toLocaleString()}</span>
                    <span className="text-right font-medium text-primary">
                      ${Math.round((sale.revenue * commissionRate) / 100).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Reviews — open after campaign completion, one per participant */}
        {campaign.status === "completed" && user && (isOwnerOrAdmin || myApplication?.status === "accepted") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-paper rounded-lg p-6 md:p-8 border border-line mb-6"
          >
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              {t("reviewTitle")}
            </h3>
            {myReview ? (
              <div className="p-4 rounded-xl bg-gray-50">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < myReview.rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                {myReview.comment && (
                  <p className="text-sm text-neutral-700 whitespace-pre-line">
                    {myReview.comment}
                  </p>
                )}
                <p className="text-xs text-neutral-400 mt-1">
                  {t("myReviewNote")}
                </p>
              </div>
            ) : canReview ? (
              <form onSubmit={handleSubmitReview}>
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMyRating(value)}
                      className="p-1"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          value <= myRating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300 hover:text-yellow-400"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm text-neutral-500 ml-2">
                    {myRating > 0 ? t("reviewRatingCount", { rating: myRating }) : t("reviewPickRating")}
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={t("reviewPlaceholder")}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary mb-3"
                />
                <Button type="submit" isLoading={isSubmitting} disabled={myRating < 1}>
                  {t("reviewSubmit")}
                </Button>
              </form>
            ) : null}
            {reviews.length > 0 && (
              <div className="space-y-3 mt-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {review.reviewer?.name ?? "—"}
                      </span>
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
                      <span className="ml-auto text-xs text-neutral-400">
                        {formatRelativeTime(review.created_at, locale)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-neutral-600 whitespace-pre-line">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
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
            {canComplete && (
              <div className="mb-4">
                <Button
                  size="sm"
                  variant="outline"
                  isLoading={actionLoading === "complete"}
                  disabled={actionLoading !== null}
                  onClick={() => setCompleteConfirmOpen(true)}
                >
                  <Flag className="w-4 h-4 mr-2" />
                  {t("completeButton")}
                </Button>
              </div>
            )}
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
                        <Button
                          size="sm"
                          variant="ghost"
                          isLoading={dmLoadingId === app.creator_id}
                          disabled={dmLoadingId !== null}
                          onClick={() => void openConversation(app.creator_id)}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {t("messageCreator")}
                        </Button>
                      </div>
                    )}
                    {app.status !== "pending" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        isLoading={dmLoadingId === app.creator_id}
                        disabled={dmLoadingId !== null}
                        onClick={() => void openConversation(app.creator_id)}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {t("messageCreator")}
                      </Button>
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

        <ConfirmDialog
          open={completeConfirmOpen}
          title={t("confirmComplete.title")}
          description={t("confirmComplete.description")}
          confirmLabel={t("confirmComplete.confirm")}
          onConfirm={handleComplete}
          onCancel={() => setCompleteConfirmOpen(false)}
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
