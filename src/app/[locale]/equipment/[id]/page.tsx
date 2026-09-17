"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  Mic,
  Lightbulb,
  Plane,
  Package,
  MapPin,
  CheckCircle,
  Check,
  Send,
  AlertCircle,
  XCircle,
  ClipboardList,
  User,
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
import { formatRelativeTime } from "@/lib/relative-time";
import { callRent, RentAuthError } from "@/lib/rentals/client";
import { useTranslations, useLocale } from "next-intl";

const CATEGORY_ICONS: Record<string, typeof Camera> = {
  camera: Camera,
  lighting: Lightbulb,
  audio: Mic,
  drone: Plane,
  accessory: Package,
};

interface GearDetail {
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
  owner_id: string;
  profiles: {
    name: string;
    niche: string | null;
    follower_count: number | null;
  } | null;
}

interface RentalRow {
  id: string;
  status: string;
  message: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
  renter_id: string;
  profiles: { name: string } | null;
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "accepted":
      return "bg-green-100 text-green-700";
    case "rejected":
      return "bg-neutral-200 text-neutral-500";
    case "completed":
      return "bg-blue-100 text-blue-700";
    case "returned":
      return "bg-violet-100 text-violet-700";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
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

function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function GearDetailPage() {
  const t = useTranslations("equipment");
  const tc = useTranslations("common");
  const locale = useLocale();
  const params = useParams();
  const gearId = params.id as string;
  const { user } = useAuth();
  const toast = useToast();

  const [gear, setGear] = useState<GearDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [requests, setRequests] = useState<RentalRow[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  const [myRequest, setMyRequest] = useState<RentalRow | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const isOwnerOrAdmin =
    !!user && (user.role === "admin" || user.id === gear?.owner_id);

  const today = todayStr();
  const startError =
    startDate && startDate < today ? t("rentalForm.validation.startPast") : null;
  const endError =
    endDate && startDate && endDate < startDate
      ? t("rentalForm.validation.endBeforeStart")
      : null;
  const formValid =
    startDate !== "" && endDate !== "" && !startError && !endError;

  useEffect(() => {
    if (!gearId) return;
    const supabase = getSupabaseClient();
    (async () => {
      const { data, error } = await supabase
        .from("gears")
        .select("*, profiles(name, niche, follower_count)")
        .eq("id", gearId)
        .single();
      if (error || !data) {
        setLoadError(true);
        setIsLoading(false);
        setRequestsLoading(false);
        return;
      }
      setGear(data as unknown as GearDetail);
      setIsLoading(false);

      const { data: reqRows } = await supabase
        .from("rental_requests")
        .select("*, profiles(name)")
        .eq("gear_id", gearId)
        .order("created_at", { ascending: false });
      setRequests((reqRows ?? []) as unknown as RentalRow[]);
      setRequestsLoading(false);
    })();
  }, [gearId]);

  // Renter: check whether I already requested this gear
  useEffect(() => {
    if (!user || !gear || isOwnerOrAdmin) return;
    const supabase = getSupabaseClient();
    supabase
      .from("rental_requests")
      .select("*, profiles(name)")
      .eq("gear_id", gear.id)
      .eq("renter_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setMyRequest(data as unknown as RentalRow);
      });
  }, [user, gear, isOwnerOrAdmin]);

  const handleRent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gear || !formValid) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await callRent(gear.id, startDate, endDate, message.trim());
      setMyRequest({
        id: "just-sent",
        status: "pending",
        message: message.trim() || null,
        start_date: startDate,
        end_date: endDate,
        created_at: new Date().toISOString(),
        renter_id: user?.id ?? "",
        profiles: null,
      });
      toast.success(t("rentalForm.successTitle"));
      setIsSubmitting(false);
    } catch (err) {
      if (err instanceof RentAuthError) {
        setSubmitError(t("rentalForm.errorAuth"));
      } else {
        setSubmitError(t("rentalForm.errorGeneric"));
      }
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (
    reqId: string,
    status: "accepted" | "rejected"
  ) => {
    setActionLoading(reqId);
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("rental_requests")
      .update({ status })
      .eq("id", reqId);
    if (!error) {
      setRequests((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, status } : r))
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
          <div className="bg-paper rounded-lg p-6 md:p-8 border mb-6 space-y-4">
            <div className="flex items-start gap-3">
              <Skeleton className="w-20 h-20 rounded-lg" />
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
          <div className="bg-paper rounded-lg p-6 md:p-8 border space-y-4">
            <Skeleton className="w-48 h-6" />
            <ListRowSkeleton />
          </div>
        </div>
      </main>
    );
  }

  if (loadError || !gear) {
    return (
      <main className="min-h-screen bg-cream pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <ErrorState />
        </div>
      </main>
    );
  }

  const Icon = CATEGORY_ICONS[gear.category] ?? Package;

  return (
    <main className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/equipment">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t("backToEquipment")}
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-paper rounded-lg p-6 md:p-8 border mb-6"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-20 h-20 rounded-lg bg-primary-soft flex items-center justify-center shrink-0">
              <Icon className="w-10 h-10 text-primary" />
            </div>
            <div className="min-w-0">
              <span className="oval-label mb-2">{t(`category.${gear.category}`)}</span>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 break-words">
                {gear.title}
              </h1>
              <p className="text-neutral-500 mt-1 flex flex-wrap items-center gap-2">
                <span>{t(`category.${gear.category}`)}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(gear.status)}`}
                >
                  {t(`status.${gear.status}`)}
                </span>
                {gear.condition && (
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${conditionBadgeClass(gear.condition)}`}
                  >
                    {t(`conditionValue.${gear.condition}`)}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="pt-3 border-t">
              <p className="text-xs uppercase tracking-widest text-ink-soft mb-1">{t("perDay")}</p>
              <p className="font-quote text-xl text-neutral-900">
                ${gear.price_per_day != null ? gear.price_per_day : "—"}
              </p>
            </div>
            <div className="pt-3 border-t">
              <p className="text-xs uppercase tracking-widest text-ink-soft mb-1">{t("newGear.fieldDeposit")}</p>
              <p className="font-quote text-xl text-neutral-900">
                {gear.deposit != null
                  ? t("detail.depositValue", { amount: gear.deposit })
                  : t("detail.noDeposit")}
              </p>
            </div>
            <div className="pt-3 border-t">
              <p className="text-xs uppercase tracking-widest text-ink-soft mb-1">{t("newGear.fieldLocation")}</p>
              <p className="font-quote text-xl text-neutral-900 truncate">{gear.location ?? "—"}</p>
            </div>
            <div className="pt-3 border-t">
              <p className="text-xs uppercase tracking-widest text-ink-soft mb-1">{t("newGear.fieldCondition")}</p>
              <p className="font-quote text-xl text-neutral-900">
                {gear.condition ? t(`conditionValue.${gear.condition}`) : "—"}
              </p>
            </div>
            <div className="pt-3 border-t">
              <p className="text-xs uppercase tracking-widest text-ink-soft mb-1">{t("detail.posted")}</p>
              <p className="font-quote text-xl text-neutral-900">{formatDate(gear.created_at, locale)}</p>
            </div>
          </div>

          {/* Owner card */}
          <div className="flex items-center gap-3 bg-primary-soft rounded-xl p-4 mb-6">
            <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-cream" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-neutral-500">{t("detail.ownerLabel")}</p>
              <p className="font-bold text-neutral-900 truncate">
                {gear.profiles?.name ?? "—"}
                {gear.profiles?.niche && (
                  <span className="ml-2 px-2 py-0.5 bg-paper text-primary text-xs rounded-full font-medium">
                    {gear.profiles.niche}
                  </span>
                )}
              </p>
            </div>
          </div>

          {gear.description ? (
            <p className="text-neutral-700 mb-6 whitespace-pre-line">
              {gear.description}
            </p>
          ) : (
            <p className="text-neutral-400 italic mb-6">{t("detail.noDescription")}</p>
          )}

          {gear.includes && gear.includes.length > 0 && (
            <div className="border border-dashed border-line rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <ClipboardList className="w-4 h-4 text-primary" />
                <h3 className="text-xs uppercase tracking-widest text-ink-soft">{t("includesBoxTitle")}</h3>
              </div>
              <ul className="space-y-2">
                {gear.includes.map((inc, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-neutral-600">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    {inc}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>

        {/* Renter view: rental request form or submitted status */}
        {!isOwnerOrAdmin && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-paper rounded-lg p-6 md:p-8 border relative"
          >
            {myRequest ? (
              <div>
                {myRequest.status === "pending" && (
                  <span className="absolute top-3 right-3 -rotate-[8deg] rounded-full border border-dashed px-2 py-0.5 text-[10px] uppercase tracking-widest border-accent text-accent">
                    {t("stampAwaitingOwner")}
                  </span>
                )}
                {myRequest.status === "accepted" && (
                  <span className="absolute top-3 right-3 -rotate-[8deg] rounded-full border border-dashed px-2 py-0.5 text-[10px] uppercase tracking-widest border-green-600 text-green-600">
                    {t("stampApproved")}
                  </span>
                )}
                {myRequest.status === "rejected" && (
                  <span className="absolute top-3 right-3 -rotate-[8deg] rounded-full border border-dashed px-2 py-0.5 text-[10px] uppercase tracking-widest border-stone-400 text-stone-400">
                    {t("stampDeclined")}
                  </span>
                )}
                {(myRequest.status === "completed" || myRequest.status === "returned") && (
                  <span className="absolute top-3 right-3 -rotate-[8deg] rounded-full border border-dashed px-2 py-0.5 text-[10px] uppercase tracking-widest border-primary text-primary">
                    {t("stampCompleted")}
                  </span>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h3 className="font-bold text-lg">{t("rentalForm.successTitle")}</h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadgeClass(myRequest.status)}`}
                >
                  {t(`status.${myRequest.status}`)}
                </span>
                <p className="text-sm text-neutral-600 mt-3">
                  {formatDate(myRequest.start_date, locale)} →{" "}
                  {formatDate(myRequest.end_date, locale)}
                </p>
                {myRequest.message && (
                  <p className="text-sm text-neutral-600 mt-2 whitespace-pre-line">
                    {myRequest.message}
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleRent}>
                <h3 className="font-bold text-lg mb-3">
                  <span className="text-accent">✦</span> {t("requestToBook")}
                </h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {t("rentalForm.startDate")}
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary ${
                        startError ? "border-red-400" : ""
                      }`}
                    />
                    {startError && (
                      <p className="text-xs text-red-600 mt-1">{startError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {t("rentalForm.endDate")}
                    </label>
                    <input
                      type="date"
                      min={startDate || today}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary ${
                        endError ? "border-red-400" : ""
                      }`}
                    />
                    {endError && (
                      <p className="text-xs text-red-600 mt-1">{endError}</p>
                    )}
                  </div>
                </div>
                <label className="block text-sm font-medium mb-1.5">
                  {t("rentalForm.messageLabel")}
                </label>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("rentalForm.messagePlaceholder")}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p
                  className={`text-xs mt-1 text-right ${
                    message.length > 450 ? "text-yellow-600" : "text-neutral-400"
                  }`}
                >
                  {tc("charCount", { count: message.length, max: 500 })}
                </p>
                {submitError && (
                  <div className="flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-200 mb-4">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{submitError}</p>
                  </div>
                )}
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={!formValid}
                  className="bg-primary text-cream"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {t("rentalForm.submit")}
                </Button>
              </form>
            )}
          </motion.div>
        )}

        {/* Owner/admin view: own gear notice + rental requests */}
        {isOwnerOrAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-paper rounded-lg p-6 md:p-8 border"
          >
            <div className="flex items-center gap-2 p-4 rounded-xl bg-primary-soft border border-primary/20 mb-6">
              <AlertCircle className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm text-primary">{t("detail.yourGear")}</p>
            </div>
            <h3 className="font-bold text-lg mb-4">{t("detail.requestsTitle")}</h3>
            {requestsLoading ? (
              <div className="space-y-4">
                <ListRowSkeleton />
                <ListRowSkeleton />
              </div>
            ) : requests.length === 0 ? (
              <p className="text-sm text-neutral-500">{t("detail.noRequests")}</p>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div key={req.id} className="p-4 rounded-xl border border-line relative">
                    {req.status === "accepted" && (
                      <span className="absolute top-3 right-3 -rotate-[8deg] rounded-full border border-dashed px-2 py-0.5 text-[10px] uppercase tracking-widest border-green-600 text-green-600">
                        {t("stampApproved")}
                      </span>
                    )}
                    {req.status === "rejected" && (
                      <span className="absolute top-3 right-3 -rotate-[8deg] rounded-full border border-dashed px-2 py-0.5 text-[10px] uppercase tracking-widest border-stone-400 text-stone-400">
                        {t("stampDeclined")}
                      </span>
                    )}
                    {(req.status === "completed" || req.status === "returned") && (
                      <span className="absolute top-3 right-3 -rotate-[8deg] rounded-full border border-dashed px-2 py-0.5 text-[10px] uppercase tracking-widest border-primary text-primary">
                        {t("stampCompleted")}
                      </span>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold">{req.profiles?.name ?? "—"}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(req.status)}`}
                      >
                        {t(`status.${req.status}`)}
                      </span>
                      <span className="ml-auto text-xs text-neutral-400">
                        {formatDate(req.created_at, locale)} ·{" "}
                        {formatRelativeTime(req.created_at, locale)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-1">
                      {formatDate(req.start_date, locale)} →{" "}
                      {formatDate(req.end_date, locale)}
                    </p>
                    {req.message && (
                      <p className="text-sm text-neutral-600 mb-3 whitespace-pre-line break-words min-w-0">
                        {req.message}
                      </p>
                    )}
                    {req.status === "pending" && (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          isLoading={actionLoading === req.id}
                          disabled={actionLoading !== null}
                          onClick={() => handleStatusUpdate(req.id, "accepted")}
                          className="bg-green-500 text-white hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {t("detail.accept")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoading !== null}
                          onClick={() => setRejectTarget(req.id)}
                          className="text-neutral-600"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          {t("detail.reject")}
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
          title={t("detail.confirmReject.title")}
          description={t("detail.confirmReject.description")}
          confirmLabel={t("detail.confirmReject.confirm")}
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

export default function GearDetailWrapper() {
  return (
    <AuthGuard>
      <GearDetailPage />
    </AuthGuard>
  );
}
