"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  DollarSign,
  Clock,
  Wallet,
  CheckCircle,
  CalendarClock,
  Percent,
  Gift,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth-guard";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/contexts/auth-context";
import { getSupabaseClient } from "@/lib/supabase/client";
import { callApi, ApiAuthError } from "@/lib/api/client";
import { useTranslations, useLocale } from "next-intl";
import { formatRelativeTime } from "@/lib/relative-time";
import type { PaymentKind } from "@/types/marketplace";

type PaymentKindType = PaymentKind;

interface EarningsPayment {
  id: string;
  amount: number;
  kind: PaymentKindType;
  status: string;
  note: string | null;
  paid_at: string | null;
  confirmed_at: string | null;
  created_at: string;
  campaigns: { id: string; title: string } | null;
  creator?: { name: string } | null;
}

const KIND_ICONS: Record<PaymentKindType, LucideIcon> = {
  campaign_fee: DollarSign,
  retainer: CalendarClock,
  commission: Percent,
  barter_value: Gift,
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700",
  paid: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
};

function sumOf(rows: EarningsPayment[], statuses: string[]): number {
  return rows
    .filter((p) => statuses.includes(p.status))
    .reduce((s, p) => s + p.amount, 0);
}

function EarningsPage() {
  const t = useTranslations("earnings");
  const tc = useTranslations("common");
  const locale = useLocale();
  const toast = useToast();
  const { user } = useAuth();

  const [payments, setPayments] = useState<EarningsPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isBrand = !!user && (user.role === "company" || user.role === "admin");

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabaseClient();
    (async () => {
      if (user.role === "company" || user.role === "admin") {
        const { data: campaignRows } = await supabase
          .from("campaigns")
          .select("id")
          .eq("brand_id", user.id);
        const ids = ((campaignRows ?? []) as { id: string }[]).map((c) => c.id);
        if (ids.length === 0) {
          setIsLoading(false);
          return;
        }
        const { data } = await supabase
          .from("payments")
          .select("*, campaigns(id, title), creator:profiles!payments_creator_id_fkey(name)")
          .in("campaign_id", ids)
          .order("created_at", { ascending: false });
        setPayments((data ?? []) as unknown as EarningsPayment[]);
      } else {
        const { data } = await supabase
          .from("payments")
          .select("*, campaigns(id, title)")
          .eq("creator_id", user.id)
          .order("created_at", { ascending: false });
        setPayments((data ?? []) as unknown as EarningsPayment[]);
      }
      setIsLoading(false);
    })();
  }, [user]);

  const handleConfirm = async (paymentId: string) => {
    setActionLoading(paymentId);
    try {
      const result = await callApi<EarningsPayment>("/api/payments/transition", {
        payment_id: paymentId,
        action: "confirm",
      });
      setPayments((prev) => prev.map((p) => (p.id === paymentId ? { ...p, ...result } : p)));
      toast.success(tc("savedToast"));
    } catch (err) {
      toast.error(err instanceof ApiAuthError ? tc("errorTitle") : t("actionError"));
    }
    setActionLoading(null);
  };

  const pendingTotal = sumOf(payments, ["pending"]);
  const paidTotal = sumOf(payments, ["paid"]);
  const confirmedTotal = sumOf(payments, ["confirmed"]);

  const kindTotals = (["campaign_fee", "retainer", "commission", "barter_value"] as PaymentKindType[]).map(
    (kind) => ({
      kind,
      total: payments.filter((p) => p.kind === kind).reduce((s, p) => s + p.amount, 0),
      count: payments.filter((p) => p.kind === kind).length,
    })
  );

  return (
    <main className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={isBrand ? "/analytics/company" : "/analytics"}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              {tc("back")}
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Landmark className="w-5 h-5" />
              <span className="font-medium">{t("kicker")}</span>
            </div>
            <h1 className="text-3xl font-bold text-neutral-900">{t("title")}</h1>
            <p className="text-neutral-600">{t("subtitle")}</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-paper rounded-lg border border-line p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-sm text-neutral-500">
                {isBrand ? t("outstanding") : t("pendingReceipt")}
              </p>
            </div>
            <p className="text-3xl font-bold text-neutral-900">
              ${pendingTotal.toLocaleString()}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-paper rounded-lg border border-line p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-neutral-500">
                {isBrand ? t("awaitingConfirm") : t("awaitingMyConfirm")}
              </p>
            </div>
            <p className="text-3xl font-bold text-neutral-900">
              ${paidTotal.toLocaleString()}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-primary rounded-lg p-6 text-cream"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-cream/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <p className="text-sm text-cream/80">{t("confirmed")}</p>
            </div>
            <p className="text-3xl font-bold">
              ${confirmedTotal.toLocaleString()}
            </p>
          </motion.div>
        </div>

        {/* By-kind breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {kindTotals.map(({ kind, total, count }) => {
            const Icon = KIND_ICONS[kind];
            return (
              <div
                key={kind}
                className="bg-paper rounded-lg border border-line p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-soft flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-neutral-900 truncate">
                    ${total.toLocaleString()}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">
                    {t(`kind.${kind}`)} · {t("countLabel", { count })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment list */}
        <div className="bg-paper rounded-lg p-6 border border-line">
          <h3 className="font-bold text-lg mb-4">{t("historyTitle")}</h3>
          {isLoading ? (
            <div className="space-y-3">
              <ListRowSkeleton />
              <ListRowSkeleton />
              <ListRowSkeleton />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-10">
              <DollarSign className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm text-neutral-500">{t("empty")}</p>
              <Link href="/marketplace/campaigns" className="inline-block mt-4">
                <Button size="sm" variant="outline">
                  {t("emptyCta")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => {
                const Icon = KIND_ICONS[payment.kind];
                return (
                  <div
                    key={payment.id}
                    className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-gray-100"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary-soft flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-[180px]">
                      <p className="text-sm font-medium text-neutral-900">
                        {t(`kind.${payment.kind}`)}
                        {payment.note && (
                          <span className="text-neutral-400 font-normal">
                            {" "}
                            · {payment.note}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {payment.campaigns?.title ?? "—"}
                        {isBrand && payment.creator?.name
                          ? ` · ${payment.creator.name}`
                          : ""}
                        {" · "}
                        {formatRelativeTime(payment.created_at, locale)}
                      </p>
                    </div>
                    <p className="font-quote text-lg">
                      ${payment.amount.toLocaleString()}
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[payment.status]}`}
                    >
                      {t(`status.${payment.status}`)}
                    </span>
                    {!isBrand && payment.status === "paid" && (
                      <Button
                        size="sm"
                        className="bg-green-500 text-white hover:bg-green-600"
                        isLoading={actionLoading === payment.id}
                        disabled={actionLoading !== null}
                        onClick={() => void handleConfirm(payment.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {t("confirmButton")}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function EarningsPageWrapper() {
  return (
    <AuthGuard>
      <EarningsPage />
    </AuthGuard>
  );
}
