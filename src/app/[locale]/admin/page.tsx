"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Users, 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Star,
  MoreHorizontal,
  Settings,
  LogOut,
  Zap,
  Bot,
  TrendingUp,
  MessageSquare,
  ToggleLeft,
  ToggleRight,
  Play,
  RefreshCw,
  Sparkles,
  FileCheck,
  Scale,
  Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/components/admin-guard";
import { useAuth } from "@/contexts/auth-context";

type Verification = {
  id: number;
  type: "creator" | "company";
  name: string;
  handle: string;
  submittedAt: string;
  documents: number;
  status: "pending" | "under_review" | "approved" | "rejected";
  missing?: string[];
  flag?: string;
  autoProcessed?: boolean;
};

type Dispute = {
  id: number;
  title: string;
  parties: string;
  openedAt: string;
  status: "open" | "resolved";
  aiSuggestion: string;
  autoResolved?: boolean;
};

type Inspection = {
  id: number;
  gear: string;
  renter: string;
  lister: string;
  condition: string;
  returnDate: string;
  deposit: string;
  status: "dispute" | "resolved";
  aiSuggestion: string;
  autoProcessed?: boolean;
};

type Activity = {
  action: string;
  target: string;
  time: string;
  auto?: boolean;
};

type AutomationSettings = {
  autoVerification: boolean;
  autoDispute: boolean;
  autoInspection: boolean;
  autoRejectMissing: boolean;
};

const initialMockData = {
  stats: {
    pendingVerifications: 4,
    autoVerifiedToday: 18,
    totalUsers: 12450,
    openDisputes: 2,
    pendingInspections: 1,
  },
  verifications: [
    { id: 1, type: "creator" as const, name: "Jessica Kim", handle: "@jessicakitchen", submittedAt: "2 hours ago", documents: 2, status: "pending" as const, missing: ["Business registration"] },
    { id: 2, type: "company" as const, name: "Glow Skincare", handle: "@glowskincare", submittedAt: "5 hours ago", documents: 4, status: "under_review" as const, flag: "Name mismatch on document" },
    { id: 3, type: "creator" as const, name: "Alex Rivera", handle: "@alextech", submittedAt: "1 day ago", documents: 3, status: "under_review" as const, flag: "Low resolution ID photo" },
    { id: 4, type: "creator" as const, name: "Maria Santos", handle: "@mariafit", submittedAt: "2 days ago", documents: 1, status: "pending" as const, missing: ["ID verification", "Portfolio sample"] },
  ] as Verification[],
  disputes: [
    { id: 1, title: "Campaign deliverables dispute", parties: "Glow Skincare vs Sarah Chen", openedAt: "1 day ago", status: "open" as const, aiSuggestion: "Release 70% payment to creator. Brand keeps 30% due to missing story post." },
    { id: 2, title: "Payment delay complaint", parties: "TechMaster Pro vs Mike Chen", openedAt: "3 days ago", status: "open" as const, aiSuggestion: "Approve full payment release. Brand exceeded agreed timeline by 12 days." },
  ] as Dispute[],
  inspections: [
    { id: 1, gear: "Sony A7IV", renter: "Jordan Smith", lister: "Sarah Chen", condition: "damaged", returnDate: "Yesterday", deposit: "$800", status: "dispute" as const, aiSuggestion: "Release full deposit — no evidence of damage submitted by renter within 48h window." },
  ] as Inspection[],
  recentActivity: [
    { action: "Auto-verified creator", target: "David Park", time: "10 min ago", auto: true },
    { action: "Resolved dispute", target: "Payment delay complaint", time: "25 min ago", auto: true },
    { action: "Approved company", target: "TechMaster Pro", time: "2 hours ago" },
    { action: "Auto-verified brand", target: "Fashion Nova", time: "3 hours ago", auto: true },
  ] as Activity[],
};

function AdminPanel() {
  const { user, logout } = useAuth();
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const [activeTab, setActiveTab] = useState("verifications");
  
  // State
  const [verifications, setVerifications] = useState<Verification[]>(initialMockData.verifications);
  const [disputes, setDisputes] = useState<Dispute[]>(initialMockData.disputes);
  const [inspections, setInspections] = useState<Inspection[]>(initialMockData.inspections);
  const [activities, setActivities] = useState<Activity[]>(initialMockData.recentActivity);
  const [autoVerifiedToday, setAutoVerifiedToday] = useState(initialMockData.stats.autoVerifiedToday);
  const [automation, setAutomation] = useState<AutomationSettings>({
    autoVerification: true,
    autoDispute: true,
    autoInspection: true,
    autoRejectMissing: false,
  });
  const [processing, setProcessing] = useState(false);
  const [lastRunResult, setLastRunResult] = useState<{processed: number; details: string[]} | null>(null);

  // Derived stats
  const pendingVerifications = verifications.filter(v => v.status === "pending" || v.status === "under_review").length;
  const openDisputes = disputes.filter(d => d.status === "open").length;
  const pendingInspections = inspections.filter(i => i.status === "dispute").length;

  // Auto-run automation on mount if enabled
  useEffect(() => {
    const timer = setTimeout(() => {
      runAutomationEngine(false);
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addActivity(action: string, target: string, auto = true) {
    setActivities(prev => [
      { action, target, time: "Just now", auto },
      ...prev,
    ]);
  }

  function runAutomationEngine(showFeedback = true) {
    if (processing) return;
    setProcessing(true);
    
    const details: string[] = [];
    let processed = 0;

    // --- Verification automation ---
    if (automation.autoVerification) {
      setVerifications(prev => {
        const next = prev.map(v => {
          if (v.status !== "pending" && v.status !== "under_review") return v;
          
          // Missing critical docs
          if (v.missing && v.missing.length > 0) {
            if (automation.autoRejectMissing) {
              processed++;
              details.push(`${t("autoRejected")}: ${v.name} — ${t("missing")}: ${v.missing.join(", ")}`);
              addActivity(t("autoRejected"), v.name, true);
              return { ...v, status: "rejected" as const, autoProcessed: true };
            }
            return v;
          }

          // Has flag but enough docs -> still need human review for now unless no flag
          if (v.flag) return v;

          // Complete docs, no flag, >=3 documents -> auto-approve
          if (v.documents >= 3) {
            processed++;
            setAutoVerifiedToday(x => x + 1);
            details.push(`${t("autoApproved")}: ${v.name}`);
            addActivity(`${t("autoApproved")} ${v.type}`, v.name, true);
            return { ...v, status: "approved" as const, autoProcessed: true };
          }

          return v;
        });
        return next;
      });
    }

    // --- Dispute automation ---
    if (automation.autoDispute) {
      setDisputes(prev => {
        const next = prev.map(d => {
          if (d.status !== "open") return d;
          const suggestion = d.aiSuggestion.toLowerCase();
          // High-confidence indicators
          const highConfidence = 
            suggestion.includes("exceeded") && suggestion.includes("days") && (suggestion.match(/\d+\s*days/)?.[0] && parseInt(suggestion.match(/\d+/)![0]) >= 7) ||
            suggestion.includes("approve full payment") ||
            suggestion.includes("release full") ||
            suggestion.includes("no evidence");
          
          if (highConfidence) {
            processed++;
            details.push(`${t("autoResolved")}: ${d.title}`);
            addActivity(t("autoResolved"), d.title, true);
            return { ...d, status: "resolved" as const, autoResolved: true };
          }
          return d;
        });
        return next;
      });
    }

    // --- Inspection automation ---
    if (automation.autoInspection) {
      setInspections(prev => {
        const next = prev.map(i => {
          if (i.status !== "dispute") return i;
          const suggestion = i.aiSuggestion.toLowerCase();
          const shouldRelease = 
            suggestion.includes("no evidence") && suggestion.includes("48h") ||
            suggestion.includes("release full deposit");
          
          if (shouldRelease) {
            processed++;
            details.push(`${t("autoReleased")}: ${i.gear} (${i.deposit})`);
            addActivity(t("autoReleased"), `${i.gear} — ${i.deposit}`, true);
            return { ...i, status: "resolved" as const, autoProcessed: true };
          }
          return i;
        });
        return next;
      });
    }

    setTimeout(() => {
      setProcessing(false);
      if (showFeedback) {
        setLastRunResult({ processed, details });
        setTimeout(() => setLastRunResult(null), 5000);
      }
    }, 600);
  }

  const automationCards = [
    {
      key: "autoVerification" as const,
      icon: FileCheck,
      title: t("autoVerification"),
      desc: t("autoVerificationDesc"),
    },
    {
      key: "autoDispute" as const,
      icon: Scale,
      title: t("autoDispute"),
      desc: t("autoDisputeDesc"),
    },
    {
      key: "autoInspection" as const,
      icon: Camera,
      title: t("autoInspection"),
      desc: t("autoInspectionDesc"),
    },
    {
      key: "autoRejectMissing" as const,
      icon: XCircle,
      title: t("autoRejectMissing"),
      desc: t("autoRejectMissingDesc"),
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-violet-50/30 to-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-violet-600 mb-1">
              <Shield className="w-5 h-5" />
              <span className="font-medium">{t("panelTitle")}</span>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                {t("restricted")}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-neutral-900">{t("managementTitle")}</h1>
            <p className="text-neutral-600">{t("managementSubtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${user.avatarColor} flex items-center justify-center text-white text-sm font-bold`}>
                  {user.avatar}
                </div>
                <div className="text-sm">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-neutral-500 text-xs">{user.email}</p>
                </div>
              </div>
            )}
            <Button variant="outline" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              {tc("logout")}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: t("pendingVerifications"), value: pendingVerifications, icon: Users, color: "text-orange-500", bg: "bg-orange-50", alert: pendingVerifications > 0 },
            { label: t("autoVerifiedToday"), value: autoVerifiedToday, icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
            { label: t("totalUsers"), value: initialMockData.stats.totalUsers.toLocaleString(), icon: Users, color: "text-violet-500", bg: "bg-violet-50" },
            { label: t("openDisputes"), value: openDisputes, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50", alert: openDisputes > 0 },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-5 border shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                {stat.alert && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                    {t("actionNeeded")}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
              <p className="text-sm text-neutral-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 p-1 bg-gray-100 rounded-xl w-fit flex-wrap">
          {[
            { id: "verifications", label: t("verifications"), count: pendingVerifications },
            { id: "disputes", label: t("disputes"), count: openDisputes },
            { id: "inspections", label: t("inspections"), count: pendingInspections },
            { id: "automation", label: t("automation") },
            { id: "activity", label: t("activityLog") },
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
                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${
                  activeTab === tab.id ? "bg-violet-100" : "bg-gray-200"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Automation Result Banner */}
        <AnimatePresence>
          {lastRunResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className={`rounded-2xl p-5 border ${lastRunResult.processed > 0 ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lastRunResult.processed > 0 ? "bg-green-500 text-white" : "bg-gray-400 text-white"}`}>
                    {lastRunResult.processed > 0 ? <Sparkles className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold ${lastRunResult.processed > 0 ? "text-green-800" : "text-gray-800"}`}>
                      {lastRunResult.processed > 0 ? t("automationRunComplete") : t("noItemsToProcess")}
                    </h4>
                    {lastRunResult.processed > 0 && (
                      <>
                        <p className="text-sm text-green-700 mt-1">
                          {lastRunResult.processed} {t("itemsProcessed")}
                        </p>
                        <ul className="mt-2 space-y-1">
                          {lastRunResult.details.map((d, i) => (
                            <li key={i} className="text-sm text-green-700 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              {d}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                  <button onClick={() => setLastRunResult(null)} className="text-sm text-gray-500 hover:text-gray-700">
                    ✕
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {activeTab === "verifications" && (
          <div className="space-y-6">
            {/* Auto-verification banner */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">{t("autoVerificationActive")}</h3>
                  <p className="text-white/90 text-sm max-w-2xl">
                    {t("autoVerificationDesc")}
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-2xl font-bold">{autoVerifiedToday}</p>
                  <p className="text-xs text-white/80">{t("autoApprovedToday")}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-bold">{t("exceptionsTitle")}</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input 
                      type="text"
                      placeholder={tc("search")}
                      className="pl-9 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-1" />
                    {tc("filter")}
                  </Button>
                </div>
              </div>
              <div className="divide-y">
                {verifications.filter(v => v.status === "pending" || v.status === "under_review").length === 0 ? (
                  <div className="p-8 text-center text-neutral-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p className="font-medium">{t("noItemsToProcess")}</p>
                  </div>
                ) : (
                  verifications.filter(v => v.status === "pending" || v.status === "under_review").map((item) => (
                    <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                            item.type === "creator" ? "bg-gradient-to-br from-pink-400 to-rose-500" : "bg-gradient-to-br from-blue-400 to-blue-600"
                          }`}>
                            {item.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{item.name}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                item.type === "creator" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"
                              }`}>
                                {item.type === "creator" ? "Creator" : "Company"}
                              </span>
                              {item.status === "under_review" && (
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                  {t("underReview")}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-neutral-500">{item.handle} • Submitted {item.submittedAt}</p>
                            {item.missing && (
                              <p className="text-xs text-orange-600 mt-1">{t("missing")}: {item.missing.join(", ")}</p>
                            )}
                            {item.flag && (
                              <p className="text-xs text-red-600 mt-1">{t("flag")}: {item.flag}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-neutral-500">{item.documents} {t("documents")}</span>
                          <Button size="sm" variant="outline">{tc("review")}</Button>
                          <div className="flex gap-1">
                            <button 
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              onClick={() => {
                                setVerifications(prev => prev.map(v => v.id === item.id ? { ...v, status: "approved" } : v));
                                addActivity("Approved", item.name, false);
                              }}
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button 
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              onClick={() => {
                                setVerifications(prev => prev.map(v => v.id === item.id ? { ...v, status: "rejected" } : v));
                                addActivity("Rejected", item.name, false);
                              }}
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "disputes" && (
          <div className="space-y-4">
            {disputes.filter(d => d.status === "open").length === 0 ? (
              <div className="bg-white rounded-2xl border shadow-sm p-8 text-center text-neutral-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p className="font-medium">{t("noItemsToProcess")}</p>
              </div>
            ) : (
              disputes.filter(d => d.status === "open").map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-6 border shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{item.title}</h3>
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">{t("open")}</span>
                      </div>
                      <p className="text-sm text-neutral-500 mb-3">{item.parties} • Opened {item.openedAt}</p>
                      
                      <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-violet-900 mb-1">{t("aiSuggestion")}</p>
                            <p className="text-sm text-violet-800">{item.aiSuggestion}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="lg:w-48 flex flex-col justify-center gap-2">
                      <Button 
                        size="sm" 
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => {
                          setDisputes(prev => prev.map(d => d.id === item.id ? { ...d, status: "resolved" } : d));
                          addActivity(t("resolvedDispute"), item.title, false);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t("acceptSuggestion")}
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {t("messageParties")}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setDisputes(prev => prev.map(d => d.id === item.id ? { ...d, status: "resolved" } : d));
                          addActivity(t("dismissedDispute"), item.title, false);
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {t("dismiss")}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === "inspections" && (
          <div className="space-y-4">
            {inspections.filter(i => i.status === "dispute").length === 0 ? (
              <div className="bg-white rounded-2xl border shadow-sm p-8 text-center text-neutral-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p className="font-medium">{t("noItemsToProcess")}</p>
              </div>
            ) : (
              inspections.filter(i => i.status === "dispute").map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-6 border shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{item.gear}</h3>
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Dispute</span>
                      </div>
                      <p className="text-sm text-neutral-500 mb-3">Rented by {item.renter} • Listed by {item.lister} • Returned {item.returnDate}</p>
                      
                      <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-violet-900 mb-1">{t("aiInspectionSuggestion")}</p>
                            <p className="text-sm text-violet-800">{item.aiSuggestion}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="lg:w-48 flex flex-col justify-center gap-2">
                      <Link href={`/admin/inspections/adm-insp-${item.id}`}>
                        <Button size="sm" variant="outline" className="w-full">
                          {t("viewDetails")}
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        className="bg-green-500 hover:bg-green-600 w-full"
                        onClick={() => {
                          setInspections(prev => prev.map(i => i.id === item.id ? { ...i, status: "resolved" } : i));
                          addActivity(t("releaseDeposit"), item.gear, false);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t("releaseDeposit")}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-600 hover:bg-red-50 w-full"
                        onClick={() => {
                          setInspections(prev => prev.map(i => i.id === item.id ? { ...i, status: "resolved" } : i));
                          addActivity(t("fileClaim"), item.gear, false);
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {t("fileClaim")}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === "automation" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">{t("automationSettings")}</h3>
                  <p className="text-neutral-600 mt-1">{t("automationDesc")}</p>
                </div>
                <Button 
                  onClick={() => runAutomationEngine(true)} 
                  disabled={processing}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {processing ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {t("runAutomationNow")}
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {automationCards.map((card) => {
                  const enabled = automation[card.key];
                  return (
                    <div 
                      key={card.key}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                        enabled ? "bg-violet-50/50 border-violet-200" : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        setAutomation(prev => ({ ...prev, [card.key]: !prev[card.key] }));
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            enabled ? "bg-violet-500 text-white" : "bg-gray-100 text-gray-500"
                          }`}>
                            <card.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-neutral-900">{card.title}</h4>
                            <p className={`text-sm font-medium ${enabled ? "text-green-600" : "text-gray-500"}`}>
                              {enabled ? t("enabled") : t("disabled")}
                            </p>
                          </div>
                        </div>
                        <div className="text-violet-600">
                          {enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-gray-400" />}
                        </div>
                      </div>
                      <p className="text-sm text-neutral-600 mt-3 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Impact Summary */}
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold">AI Automation Impact</h4>
                  <p className="text-white/90 text-sm">
                    Today the system auto-verified <span className="font-bold text-white">{autoVerifiedToday}</span> accounts, 
                    resolved <span className="font-bold text-white">{disputes.filter(d => d.autoResolved).length}</span> disputes, 
                    and released <span className="font-bold text-white">{inspections.filter(i => i.autoProcessed).length}</span> deposits 
                    without admin intervention.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h3 className="font-bold mb-4">{t("activityLog")}</h3>
            <div className="space-y-4">
              {activities.map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className={`w-2 h-2 rounded-full ${activity.auto ? "bg-green-500" : "bg-violet-500"}`} />
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-neutral-500">{activity.target}</p>
                  </div>
                  {activity.auto && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      Auto
                    </span>
                  )}
                  <span className="text-sm text-neutral-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminPanel />
    </AdminGuard>
  );
}
