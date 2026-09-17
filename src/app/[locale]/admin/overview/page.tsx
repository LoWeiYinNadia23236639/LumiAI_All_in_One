"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Shield, Users, Megaphone, FileText, Loader2 } from "lucide-react";
import { AdminGuard } from "@/components/admin-guard";
import { getSupabaseClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  role: string;
  name: string;
  follower_count: number;
  niche: string;
  is_admin: boolean;
  created_at: string;
};

type Campaign = {
  id: string;
  title: string;
  budget: number;
  status: string;
  created_at: string;
  profiles?: { name: string } | null;
};

type Application = {
  id: string;
  status: string;
  created_at: string;
  campaigns?: { title: string } | null;
  profiles?: { name: string } | null;
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-neutral-500 border-b">
            {head.map((h) => (
              <th key={h} className="py-2 pr-4 font-medium whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i} className="border-b last:border-0">
              {cells.map((c, j) => (
                <td key={j} className="py-2.5 pr-4 whitespace-nowrap">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Overview() {
  const t = useTranslations("adminOverview");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = getSupabaseClient();
    Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("campaigns").select("*, profiles(name)").order("created_at", { ascending: false }),
      supabase.from("applications").select("*, campaigns(title), profiles(name)").order("created_at", { ascending: false }),
    ]).then(([p, c, a]) => {
      if (p.error || c.error || a.error) {
        setError(p.error?.message || c.error?.message || a.error?.message || "error");
      } else {
        setProfiles(p.data ?? []);
        setCampaigns(c.data ?? []);
        setApplications(a.data ?? []);
      }
      setLoading(false);
    }).catch((e) => {
      // 網絡層錯誤（被拒絕）也要結束 loading，否則頁面會永遠轉圈
      setError(e?.message ?? String(e));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <p className="p-4 bg-red-50 text-red-700 rounded-xl text-sm">
          {error} — did you run scripts/supabase-schema.sql in the Supabase SQL Editor?
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-cream pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-6 h-6 text-cream" />
          </div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
        </div>

        {/* Users */}
        <section className="bg-paper rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">{t("users")} ({profiles.length})</h2>
          </div>
          {profiles.length === 0 ? (
            <p className="text-neutral-500 text-sm">{t("empty")}</p>
          ) : (
            <Table
              head={["ID", t("colName"), t("colRole"), t("colFollowers"), t("colNiche"), t("colAdmin"), t("colApplied")]}
              rows={profiles.map((p) => [
                p.id.slice(0, 8) + "…",
                p.name || "—",
                p.is_admin ? "admin" : p.role === "brand" ? t("roleBrand") : t("roleCreator"),
                p.follower_count.toLocaleString(),
                p.niche || "—",
                p.is_admin ? "✓" : "",
                fmtDate(p.created_at),
              ])}
            />
          )}
        </section>

        {/* Campaigns */}
        <section className="bg-paper rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">{t("campaigns")} ({campaigns.length})</h2>
          </div>
          {campaigns.length === 0 ? (
            <p className="text-neutral-500 text-sm">{t("empty")}</p>
          ) : (
            <Table
              head={[t("colCampaign"), t("colBrand"), t("colBudget"), t("colStatus"), t("colApplied")]}
              rows={campaigns.map((c) => [
                c.title,
                c.profiles?.name ?? "—",
                `$${Number(c.budget).toLocaleString()}`,
                c.status,
                fmtDate(c.created_at),
              ])}
            />
          )}
        </section>

        {/* Applications */}
        <section className="bg-paper rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">{t("applications")} ({applications.length})</h2>
          </div>
          {applications.length === 0 ? (
            <p className="text-neutral-500 text-sm">{t("empty")}</p>
          ) : (
            <Table
              head={[t("colCampaign"), t("colCreator"), t("colStatus"), t("colApplied")]}
              rows={applications.map((a) => [
                a.campaigns?.title ?? "—",
                a.profiles?.name ?? "—",
                a.status,
                fmtDate(a.created_at),
              ])}
            />
          )}
        </section>
      </div>
    </main>
  );
}

export default function AdminOverviewPage() {
  return (
    <AdminGuard>
      <Overview />
    </AdminGuard>
  );
}
