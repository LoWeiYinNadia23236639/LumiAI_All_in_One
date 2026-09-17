"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback, useRef } from "react";
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
  Camera,
  Bell,
  Mail,
  Timer,
  ScanLine,
  ChevronDown,
  Eye,
  Plus,
  Dice5,
  FileText,
  User,
  DollarSign,
  Info

} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/components/admin-guard";
import { useAuth } from "@/contexts/auth-context";

type RiskLevel = "low" | "medium" | "high";

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
  detail?: string;
  category?: "verification" | "dispute" | "inspection" | "system";
  result?: "approved" | "rejected" | "resolved" | "released" | "filed" | "dismissed" | "generated";
  aiReason?: string;
  riskLevel?: RiskLevel;
  deposit?: string;
  parties?: string;
  documents?: number;
  missingDocs?: string[];
  flag?: string;
  renter?: string;
  lister?: string;
  condition?: string;
};

type NotificationItem = {
  id: string;
  type: "email" | "alert";
  subject: string;
  recipient: string;
  body: string;
  sentAt: string;
  auto: boolean;
  read: boolean;
};

type AutomationSettings = {
  autoVerification: boolean;
  autoDispute: boolean;
  autoInspection: boolean;
  autoRejectMissing: boolean;
};

const creatorNames = [
  "Emily Chen", "David Park", "Sophia Liu", "James Wilson", "Olivia Brown",
  "Daniel Kim", "Ava Martinez", "Michael Taylor", "Isabella Anderson", "Ethan Thomas"
];
const companyNames = [
  "Luxe Beauty", "FitPro Gear", "TechNova", "GreenLeaf Co", "UrbanStyle",
  "Glow Skincare", "Peak Performance", "Digital First", "Pure Living", "NextGen Brands"
];
const gears = ["Sony A7IV", "Canon R5", "DJI Mavic 3", "Aputure 120D", "Rode Wireless GO II", "Sigma 24-70mm", "MacBook Pro 16", "iPad Pro 12.9"];
const disputeTitles = [
  "Campaign deliverables dispute",
  "Payment delay complaint",
  "Content usage rights conflict",
  "Exclusivity clause violation",
  "Revision rounds exceeded",
  "Cancellation fee dispute"
];

let globalIdCounter = 100;

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
    { id: 2, gear: "Canon R5", renter: "Alex Rivera", lister: "David Park", condition: "damaged", returnDate: "2 days ago", deposit: "$1,200", status: "dispute" as const, aiSuggestion: "Visible scratches on LCD screen. Approve $200 deduction from deposit." },
    { id: 3, gear: "DJI Mavic 3", renter: "Emily Chen", lister: "Mike Ross", condition: "damaged", returnDate: "3 days ago", deposit: "$1,500", status: "dispute" as const, aiSuggestion: "Gimbal axis cracked. Recommend $450 repair deduction." },
    { id: 4, gear: "Aputure 120D", renter: "Sophia Liu", lister: "James Wilson", condition: "scratched", returnDate: "1 day ago", deposit: "$400", status: "dispute" as const, aiSuggestion: "Minor cosmetic wear on housing. Approve $50 cleaning fee." },
    { id: 5, gear: "Sigma 24-70mm", renter: "Daniel Kim", lister: "Olivia Brown", condition: "worn", returnDate: "4 days ago", deposit: "$600", status: "dispute" as const, aiSuggestion: "Dust particles inside lens. Suggest $80 professional cleaning charge." },
    { id: 6, gear: "MacBook Pro 16", renter: "Ava Martinez", lister: "Michael Taylor", condition: "good", returnDate: "Today", deposit: "$2,000", status: "dispute" as const, aiSuggestion: "Release full deposit — renter provided return receipt with no issues." },
  ] as Inspection[],
  recentActivity: [
    { action: "Auto-verified creator", target: "David Park", time: "10 min ago", auto: true, detail: "Documents: 3. Account approved automatically with complete submission." },
    { action: "Resolved dispute", target: "Payment delay complaint", time: "25 min ago", auto: true, detail: "Approve full payment release. Brand exceeded agreed timeline by 12 days." },
    { action: "Approved company", target: "TechMaster Pro", time: "2 hours ago", detail: "Documents: 4" },
    { action: "Auto-verified brand", target: "Fashion Nova", time: "3 hours ago", auto: true, detail: "Documents: 5. Account approved automatically with complete submission." },
  ] as Activity[],
};

function getVerificationRisk(v: Verification): RiskLevel {
  if (v.flag) return "high";
  if (v.missing && v.missing.length > 0) return "medium";
  return "low";
}

function getDisputeRisk(d: Dispute): RiskLevel {
  const suggestion = d.aiSuggestion.toLowerCase();
  const highConfidence = 
    suggestion.includes("exceeded") && suggestion.includes("days") && (suggestion.match(/\d+\s*days/)?.[0] && parseInt(suggestion.match(/\d+/)![0]) >= 7) ||
    suggestion.includes("approve full payment") ||
    suggestion.includes("release full") ||
    suggestion.includes("no evidence");
  if (highConfidence) return "low";
  if (suggestion.includes("70%") || suggestion.includes("50%") || suggestion.includes("partial")) return "medium";
  return "medium";
}

function getInspectionRisk(i: Inspection): RiskLevel {
  const suggestion = i.aiSuggestion.toLowerCase();
  const shouldRelease = suggestion.includes("no evidence") && suggestion.includes("48h") || suggestion.includes("release full deposit");
  if (shouldRelease) return "low";
  if (i.condition === "damaged") return "high";
  return "medium";
}

function generateMockVerification(): Verification {
  const type = Math.random() > 0.5 ? "creator" : "company";
  const namePool = type === "creator" ? creatorNames : companyNames;
  const name = namePool[Math.floor(Math.random() * namePool.length)];
  const handle = "@" + name.toLowerCase().replace(/\s+/g, "");
  const documents = Math.floor(Math.random() * 5) + 1;
  const missingPool = ["ID verification", "Business registration", "Portfolio sample", "Social media link", "Tax document"];
  const flagPool = ["Name mismatch on document", "Low resolution ID photo", "Expired document", "Suspicious account activity"];
  
  const roll = Math.random();
  let missing: string[] | undefined;
  let flag: string | undefined;
  
  if (roll < 0.5) {
    missing = [missingPool[Math.floor(Math.random() * missingPool.length)]];
  } else if (roll < 0.7) {
    flag = flagPool[Math.floor(Math.random() * flagPool.length)];
  }
  
  return {
    id: ++globalIdCounter,
    type,
    name,
    handle,
    submittedAt: "Just now",
    documents,
    status: "pending",
    missing,
    flag,
  };
}

function generateMockDispute(): Dispute {
  const title = disputeTitles[Math.floor(Math.random() * disputeTitles.length)];
  const brand = companyNames[Math.floor(Math.random() * companyNames.length)];
  const creator = creatorNames[Math.floor(Math.random() * creatorNames.length)];
  const autoResolvable = Math.random() > 0.5;
  const suggestions = autoResolvable
    ? [
        "Approve full payment release. Brand exceeded agreed timeline by 14 days.",
        "Release full deposit — no evidence of damage submitted by renter within 48h window.",
        "Approve payment. Creator delivered all required content on time.",
      ]
    : [
        "Release 70% payment to creator. Brand keeps 30% due to missing story post.",
        "Split payment 50/50. Both parties partially at fault for communication breakdown.",
        "Request additional evidence before making a decision.",
      ];
  
  return {
    id: ++globalIdCounter,
    title,
    parties: `${brand} vs ${creator}`,
    openedAt: "Just now",
    status: "open",
    aiSuggestion: suggestions[Math.floor(Math.random() * suggestions.length)],
  };
}

function generateMockInspection(): Inspection {
  const gear = gears[Math.floor(Math.random() * gears.length)];
  const renter = creatorNames[Math.floor(Math.random() * creatorNames.length)];
  const lister = creatorNames[Math.floor(Math.random() * creatorNames.length)];
  const deposit = "$" + (Math.floor(Math.random() * 15) + 3) * 100;
  const autoResolvable = Math.random() > 0.5;
  
  return {
    id: ++globalIdCounter,
    gear,
    renter,
    lister,
    condition: autoResolvable ? "good" : "damaged",
    returnDate: "Just now",
    deposit,
    status: "dispute",
    aiSuggestion: autoResolvable
      ? "Release full deposit — no evidence of damage submitted by renter within 48h window."
      : "Approve $150 deduction for minor scratches on lens body. Release remainder.",
  };
}

function generateMockCase(): { type: "verification" | "dispute" | "inspection"; data: Verification | Dispute | Inspection } {
  const r = Math.random();
  if (r < 0.4) {
    return { type: "verification", data: generateMockVerification() };
  } else if (r < 0.7) {
    return { type: "dispute", data: generateMockDispute() };
  } else {
    return { type: "inspection", data: generateMockInspection() };
  }
}

function AdminPanel() {
  const { user, logout } = useAuth();
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const [activeTab, setActiveTab] = useState("verifications");
  
  // Core state
  const [verifications, setVerifications] = useState<Verification[]>(initialMockData.verifications);
  const [disputes, setDisputes] = useState<Dispute[]>(initialMockData.disputes);
  const [inspections, setInspections] = useState<Inspection[]>(initialMockData.inspections);
  const [activities, setActivities] = useState<Activity[]>(initialMockData.recentActivity);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [autoVerifiedToday, setAutoVerifiedToday] = useState(initialMockData.stats.autoVerifiedToday);
  const [automation, setAutomation] = useState<AutomationSettings>({
    autoVerification: true,
    autoDispute: true,
    autoInspection: true,
    autoRejectMissing: false,
  });
  const [processing, setProcessing] = useState(false);
  const [lastRunResult, setLastRunResult] = useState<{processed: number; details: string[]} | null>(null);
  
  // Simulation state
  const [simulationEnabled, setSimulationEnabled] = useState(false);
  const [simInterval, setSimInterval] = useState(15);
  const [generating, setGenerating] = useState(false);
  
  // Risk filters
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all");
  
  // Scheduled scan state
  const [nextScanIn, setNextScanIn] = useState(30);
  const [lastScanAt, setLastScanAt] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  
  const processingRef = useRef(processing);
  processingRef.current = processing;

  // Derived stats
  const pendingVerifications = verifications.filter(v => v.status === "pending" || v.status === "under_review").length;
  const openDisputes = disputes.filter(d => d.status === "open").length;
  const pendingInspections = inspections.filter(i => i.status === "dispute").length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Auto-run automation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      runAutomationEngine(false);
      setLastScanAt(new Date().toLocaleTimeString());
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scheduled scan interval (every 30s for demo visibility)
  useEffect(() => {
    const scanInterval = setInterval(() => {
      if (!processingRef.current) {
        runAutomationEngine(false);
        setLastScanAt(new Date().toLocaleTimeString());
        setNextScanIn(30);
      }
    }, 30000);
    
    const countdownInterval = setInterval(() => {
      setNextScanIn(prev => (prev > 0 ? prev - 1 : 30));
    }, 1000);
    
    return () => {
      clearInterval(scanInterval);
      clearInterval(countdownInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [automation]);

  // Simulation interval
  useEffect(() => {
    if (!simulationEnabled) return;
    const simTimer = setInterval(() => {
      injectMockCase();
    }, simInterval * 1000);
    return () => clearInterval(simTimer);
  }, [simulationEnabled, simInterval]);

  function addActivity(action: string, target: string, auto = true, opts?: string | Partial<Omit<Activity, 'action' | 'target' | 'time' | 'auto'>>) {
    const options = typeof opts === 'string' ? { detail: opts } : (opts || {});
    setActivities(prev => [
      { action, target, time: "Just now", auto, ...options },
      ...prev,
    ]);
  }

  function addNotification(notification: Omit<NotificationItem, "id" | "sentAt" | "read">) {
    const item: NotificationItem = {
      ...notification,
      id: Math.random().toString(36).slice(2),
      sentAt: new Date().toLocaleTimeString(),
      read: false,
    };
    setNotifications(prev => [item, ...prev].slice(0, 50));
  }

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  function injectMockCase(showToast = false) {
    const c = generateMockCase();
    if (c.type === "verification") {
      setVerifications(prev => [c.data as Verification, ...prev]);
      addActivity(t("newVerification"), (c.data as Verification).name, true, { category: "verification", documents: (c.data as Verification).documents });
    } else if (c.type === "dispute") {
      setDisputes(prev => [c.data as Dispute, ...prev]);
      addActivity(t("newDispute"), (c.data as Dispute).title, true, { category: "dispute", aiReason: (c.data as Dispute).aiSuggestion, parties: (c.data as Dispute).parties });
    } else {
      setInspections(prev => [c.data as Inspection, ...prev]);
      addActivity(t("newInspection"), (c.data as Inspection).gear, true, { category: "inspection", condition: (c.data as Inspection).condition, deposit: (c.data as Inspection).deposit, renter: (c.data as Inspection).renter, lister: (c.data as Inspection).lister });
    }
    if (showToast) {
      setGenerating(true);
      setTimeout(() => setGenerating(false), 600);
    }
    // Trigger automation immediately after injection
    setTimeout(() => {
      runAutomationEngine(showToast);
      setLastScanAt(new Date().toLocaleTimeString());
    }, 300);
  }

  const runAutomationEngine = useCallback((showFeedback = true) => {
    if (processingRef.current) return;
    setProcessing(true);
    
    const details: string[] = [];
    let processed = 0;

    // --- Verification automation ---
    if (automation.autoVerification) {
      setVerifications(prev => {
        const next = prev.map(v => {
          if (v.status !== "pending" && v.status !== "under_review") return v;
          
          if (v.missing && v.missing.length > 0) {
            if (automation.autoRejectMissing) {
              processed++;
              details.push(`${t("autoRejected")}: ${v.name} — ${t("missing")}: ${v.missing.join(", ")}`);
              addActivity(t("autoRejected"), v.name, true, { category: "verification", result: "rejected", detail: `${t("missing")}: ${v.missing.join(", ")}`, missingDocs: v.missing, documents: v.documents, riskLevel: getVerificationRisk(v) });
              addNotification({
                type: "email",
                subject: t("subjectAccountRejected"),
                recipient: v.handle,
                body: `${t("subjectAccountRejected")}. ${t("missing")}: ${v.missing.join(", ")}`,
                auto: true,
              });
              return { ...v, status: "rejected" as const, autoProcessed: true };
            }
            return v;
          }

          if (v.flag) return v;

          if (v.documents >= 3) {
            processed++;
            setAutoVerifiedToday(x => x + 1);
            details.push(`${t("autoApproved")}: ${v.name}`);
            addActivity(`${t("autoApproved")} ${v.type}`, v.name, true, { category: "verification", result: "approved", detail: `${t("documents")}: ${v.documents}. ${t("subjectAccountApproved")}`, documents: v.documents, riskLevel: getVerificationRisk(v) });
            addNotification({
              type: "email",
              subject: t("subjectAccountApproved"),
              recipient: v.handle,
              body: `${t("subjectAccountApproved")}. Welcome to LumiAI!`,
              auto: true,
            });
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
          const highConfidence = 
            suggestion.includes("exceeded") && suggestion.includes("days") && (suggestion.match(/\d+\s*days/)?.[0] && parseInt(suggestion.match(/\d+/)![0]) >= 7) ||
            suggestion.includes("approve full payment") ||
            suggestion.includes("release full") ||
            suggestion.includes("no evidence");
          
          if (highConfidence) {
            processed++;
            details.push(`${t("autoResolved")}: ${d.title}`);
            addActivity(t("autoResolved"), d.title, true, { category: "dispute", result: "resolved", aiReason: d.aiSuggestion, parties: d.parties, riskLevel: getDisputeRisk(d) });
            addNotification({
              type: "email",
              subject: t("subjectDisputeResolved"),
              recipient: d.parties,
              body: `${t("subjectDisputeResolved")}. ${d.aiSuggestion}`,
              auto: true,
            });
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
            addActivity(t("autoReleased"), `${i.gear} — ${i.deposit}`, true, { category: "inspection", result: "released", aiReason: i.aiSuggestion, deposit: i.deposit, renter: i.renter, lister: i.lister, condition: i.condition, riskLevel: getInspectionRisk(i) });
            addNotification({
              type: "email",
              subject: t("subjectDepositReleased"),
              recipient: i.renter,
              body: `${t("subjectDepositReleased")}: ${i.gear} — ${i.deposit}`,
              auto: true,
            });
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
  }, [automation, t]);

  const automationCards = [
    { key: "autoVerification" as const, icon: FileCheck, title: t("autoVerification"), desc: t("autoVerificationDesc") },
    { key: "autoDispute" as const, icon: Scale, title: t("autoDispute"), desc: t("autoDisputeDesc") },
    { key: "autoInspection" as const, icon: Camera, title: t("autoInspection"), desc: t("autoInspectionDesc") },
    { key: "autoRejectMissing" as const, icon: XCircle, title: t("autoRejectMissing"), desc: t("autoRejectMissingDesc") },
  ];

  const riskBadge = (level: RiskLevel) => {
    const styles = {
      high: "bg-red-100 text-red-700",
      medium: "bg-amber-100 text-amber-700",
      low: "bg-green-100 text-green-700",
    };
    const labels = { high: t("riskHigh"), medium: t("riskMedium"), low: t("riskLow") };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[level]}`}>{labels[level]}</span>;
  };

  return (
    <main className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary mb-1">
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
            {/* Scheduled scan indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl text-sm text-neutral-600">
              <Timer className="w-4 h-4" />
              <span>{t("nextScan")}: {nextScanIn}s</span>
            </div>

            {/* Notifications bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(s => !s)}
                className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5 text-neutral-600" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-paper rounded-lg border shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b flex items-center justify-between">
                      <h4 className="font-bold">{t("notifications")}</h4>
                      {unreadNotifications > 0 && (
                        <button onClick={markAllNotificationsRead} className="text-xs text-primary hover:underline">
                          {t("markAllAsRead")}
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-neutral-500">
                          <Mail className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                          {t("noNotifications")}
                        </div>
                      ) : (
                        notifications.slice(0, 20).map(n => (
                          <div key={n.id} className={`p-4 border-b last:border-b-0 hover:bg-gray-50 ${!n.read ? "bg-primary-soft/40" : ""}`}>
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.auto ? "bg-green-100 text-green-600" : "bg-primary-soft text-primary"}`}>
                                <Mail className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-900 truncate">{n.subject}</p>
                                <p className="text-xs text-neutral-500 truncate">{t("emailTo")} {n.recipient}</p>
                                <p className="text-xs text-neutral-400 mt-1">{n.sentAt}</p>
                              </div>
                              {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-1" />}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {user && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-cream text-sm font-bold">
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
            { label: t("totalUsers"), value: initialMockData.stats.totalUsers.toLocaleString(), icon: Users, color: "text-primary", bg: "bg-primary-soft" },
            { label: t("openDisputes"), value: openDisputes, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50", alert: openDisputes > 0 },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-paper rounded-lg p-5 border"
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
                  ? "bg-paper text-primary shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${
                  activeTab === tab.id ? "bg-primary-soft" : "bg-gray-200"
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
              <div className={`rounded-lg p-5 border ${lastRunResult.processed > 0 ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
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
            <div className="bg-primary rounded-lg p-6 text-cream">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-cream/20 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">{t("autoVerificationActive")}</h3>
                  <p className="text-cream/90 text-sm max-w-2xl">{t("autoVerificationDesc")}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-2xl font-bold">{autoVerifiedToday}</p>
                  <p className="text-xs text-cream/80">{t("autoApprovedToday")}</p>
                </div>
              </div>
            </div>

            {/* Risk filter bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-sm text-neutral-500 font-medium">{t("filterByRisk")}:</span>
              {(["all", "high", "medium", "low"] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setRiskFilter(level)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    riskFilter === level
                      ? "bg-primary-soft text-primary"
                      : "bg-paper border text-neutral-600 hover:bg-gray-50"
                  }`}
                >
                  {level === "all" ? t("allRisks") : level === "high" ? t("riskHigh") : level === "medium" ? t("riskMedium") : t("riskLow")}
                </button>
              ))}
            </div>

            <div className="bg-paper rounded-lg border overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-bold">{t("exceptionsTitle")}</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input 
                      type="text"
                      placeholder={tc("search")}
                      className="pl-9 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-1" />
                    {tc("filter")}
                  </Button>
                </div>
              </div>
              <div className="divide-y">
                {(() => {
                  const items = verifications
                    .filter(v => v.status === "pending" || v.status === "under_review")
                    .filter(v => riskFilter === "all" || getVerificationRisk(v) === riskFilter);
                  if (items.length === 0) {
                    return (
                      <div className="p-8 text-center text-neutral-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                        <p className="font-medium">{t("noItemsToProcess")}</p>
                        <p className="text-sm text-neutral-400 mt-1">{t("escalatedItemsDesc")}</p>
                      </div>
                    );
                  }
                  return items.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-cream font-bold ${
                            item.type === "creator" ? "bg-primary" : "bg-neutral-500"
                          }`}>
                            {item.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium">{item.name}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                item.type === "creator" ? "bg-primary-soft text-primary" : "bg-gray-100 text-neutral-600"
                              }`}>
                                {item.type === "creator" ? t("creator") : t("company")}
                              </span>
                              {item.status === "under_review" && (
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                  {t("underReview")}
                                </span>
                              )}
                              {riskBadge(getVerificationRisk(item))}
                            </div>
                            <p className="text-sm text-neutral-500">{item.handle} • {t("submittedAt", { time: item.submittedAt })}</p>
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
                                setVerifications(prev => prev.map(v => v.id === item.id ? { ...v, status: "approved" as const } : v));
                                addActivity(t("approved"), item.name, false, { category: "verification", result: "approved", documents: item.documents, riskLevel: getVerificationRisk(item) });
                                addNotification({ type: "email", subject: t("subjectAccountApproved"), recipient: item.handle, body: `${t("subjectAccountApproved")}. Welcome to LumiAI!`, auto: false });
                              }}
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button 
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              onClick={() => {
                                setVerifications(prev => prev.map(v => v.id === item.id ? { ...v, status: "rejected" as const } : v));
                                addActivity(t("rejected"), item.name, false, { category: "verification", result: "rejected", detail: item.flag ? `${t("flag")}: ${item.flag}` : `${t("missing")}: ${item.missing?.join(", ")}`, flag: item.flag, missingDocs: item.missing, documents: item.documents, riskLevel: getVerificationRisk(item) });
                                addNotification({ type: "email", subject: t("subjectAccountRejected"), recipient: item.handle, body: `${t("subjectAccountRejected")}.`, auto: false });
                              }}
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}

        {activeTab === "disputes" && (
          <div className="space-y-4">
            {/* Risk filter bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-sm text-neutral-500 font-medium">{t("filterByRisk")}:</span>
              {(["all", "high", "medium", "low"] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setRiskFilter(level)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    riskFilter === level
                      ? "bg-primary-soft text-primary"
                      : "bg-paper border text-neutral-600 hover:bg-gray-50"
                  }`}
                >
                  {level === "all" ? t("allRisks") : level === "high" ? t("riskHigh") : level === "medium" ? t("riskMedium") : t("riskLow")}
                </button>
              ))}
            </div>

            {(() => {
              const items = disputes
                .filter(d => d.status === "open")
                .filter(d => riskFilter === "all" || getDisputeRisk(d) === riskFilter);
              if (items.length === 0) {
                return (
                  <div className="bg-paper rounded-lg border p-8 text-center text-neutral-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p className="font-medium">{t("noItemsToProcess")}</p>
                    <p className="text-sm text-neutral-400 mt-1">{t("escalatedItemsDesc")}</p>
                  </div>
                );
              }
              return items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-paper rounded-lg p-6 border"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-bold text-lg">{item.title}</h3>
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">{t("open")}</span>
                        {riskBadge(getDisputeRisk(item))}
                      </div>
                      <p className="text-sm text-neutral-500 mb-3">{item.parties} • {t("openedAt", { time: item.openedAt })}</p>
                      
                      <div className="bg-primary-soft/50 rounded-xl p-4 border border-primary/20">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-cream" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-primary mb-1">{t("aiSuggestion")}</p>
                            <p className="text-sm text-ink-soft">{item.aiSuggestion}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="lg:w-48 flex flex-col justify-center gap-2">
                      <Button 
                        size="sm" 
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => {
                          setDisputes(prev => prev.map(d => d.id === item.id ? { ...d, status: "resolved" as const } : d));
                          addActivity(t("resolvedDispute"), item.title, false, { category: "dispute", result: "resolved", aiReason: item.aiSuggestion, parties: item.parties, riskLevel: getDisputeRisk(item) });
                          addNotification({ type: "email", subject: t("subjectDisputeResolved"), recipient: item.parties, body: `${t("subjectDisputeResolved")}. ${item.aiSuggestion}`, auto: false });
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
                          setDisputes(prev => prev.map(d => d.id === item.id ? { ...d, status: "resolved" as const } : d));
                          addActivity(t("dismissedDispute"), item.title, false, { category: "dispute", result: "dismissed", aiReason: item.aiSuggestion, parties: item.parties, riskLevel: getDisputeRisk(item) });
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {t("dismiss")}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ));
            })()}
          </div>
        )}

        {activeTab === "inspections" && (
          <div className="space-y-4">
            {/* Risk filter bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-sm text-neutral-500 font-medium">{t("filterByRisk")}:</span>
              {(["all", "high", "medium", "low"] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setRiskFilter(level)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    riskFilter === level
                      ? "bg-primary-soft text-primary"
                      : "bg-paper border text-neutral-600 hover:bg-gray-50"
                  }`}
                >
                  {level === "all" ? t("allRisks") : level === "high" ? t("riskHigh") : level === "medium" ? t("riskMedium") : t("riskLow")}
                </button>
              ))}
            </div>

            {(() => {
              const items = inspections
                .filter(i => i.status === "dispute")
                .filter(i => riskFilter === "all" || getInspectionRisk(i) === riskFilter);
              if (items.length === 0) {
                return (
                  <div className="bg-paper rounded-lg border p-8 text-center text-neutral-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p className="font-medium">{t("noItemsToProcess")}</p>
                    <p className="text-sm text-neutral-400 mt-1">{t("escalatedItemsDesc")}</p>
                  </div>
                );
              }
              return items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-paper rounded-lg p-6 border"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-bold text-lg">{item.gear}</h3>
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">{t("dispute")}</span>
                        {riskBadge(getInspectionRisk(item))}
                      </div>
                      <p className="text-sm text-neutral-500 mb-3">{t("rentedBy", { renter: item.renter, lister: item.lister, date: item.returnDate })}</p>
                      
                      <div className="bg-primary-soft/50 rounded-xl p-4 border border-primary/20">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-cream" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-primary mb-1">{t("aiInspectionSuggestion")}</p>
                            <p className="text-sm text-ink-soft">{item.aiSuggestion}</p>
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
                          setInspections(prev => prev.map(i => i.id === item.id ? { ...i, status: "resolved" as const } : i));
                          addActivity(t("releaseDeposit"), item.gear, false, { category: "inspection", result: "released", deposit: item.deposit, aiReason: item.aiSuggestion, renter: item.renter, lister: item.lister, condition: item.condition, riskLevel: getInspectionRisk(item) });
                          addNotification({ type: "email", subject: t("subjectDepositReleased"), recipient: item.renter, body: `${t("subjectDepositReleased")}: ${item.gear} — ${item.deposit}`, auto: false });
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
                          setInspections(prev => prev.map(i => i.id === item.id ? { ...i, status: "resolved" as const } : i));
                          addActivity(t("fileClaim"), item.gear, false, { category: "inspection", result: "filed", deposit: item.deposit, aiReason: item.aiSuggestion, renter: item.renter, lister: item.lister, condition: item.condition, riskLevel: getInspectionRisk(item) });
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {t("fileClaim")}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ));
            })()}
          </div>
        )}

        {activeTab === "automation" && (
          <div className="space-y-6">
            {/* Scan control card */}
            <div className="bg-paper rounded-lg border p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                    <ScanLine className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">{t("autoScanEnabled")}</h3>
                    <p className="text-neutral-600 text-sm mt-1">
                      {t("nextScan")}: <span className="font-medium text-neutral-900">{nextScanIn}s</span>
                      {lastScanAt && (
                        <span className="ml-3 text-neutral-400">• {t("lastScan")}: {lastScanAt}</span>
                      )}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    runAutomationEngine(true);
                    setLastScanAt(new Date().toLocaleTimeString());
                    setNextScanIn(30);
                  }} 
                  disabled={processing}
                >
                  {processing ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {processing ? t("scanning") : t("scanNow")}
                </Button>
              </div>
            </div>

            <div className="bg-paper rounded-lg border p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">{t("automationSettings")}</h3>
                  <p className="text-neutral-600 mt-1">{t("automationDesc")}</p>
                </div>
                <Button 
                  onClick={() => {
                    runAutomationEngine(true);
                    setLastScanAt(new Date().toLocaleTimeString());
                  }} 
                  disabled={processing}
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
                      className={`p-5 rounded-lg border transition-all cursor-pointer ${
                        enabled ? "bg-primary-soft/50 border-primary/30" : "bg-paper border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        setAutomation(prev => ({ ...prev, [card.key]: !prev[card.key] }));
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            enabled ? "bg-primary text-cream" : "bg-gray-100 text-gray-500"
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
                        <div className="text-primary">
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

            {/* Simulation control card */}
            <div className="bg-primary rounded-lg p-6 text-cream">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-cream/20 flex items-center justify-center">
                      <Dice5 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{t("simulationMode")}</h3>
                      <p className={`text-sm font-medium ${simulationEnabled ? "text-green-300" : "text-cream/70"}`}>
                        {simulationEnabled ? t("enabled") : t("disabled")}
                      </p>
                    </div>
                  </div>
                  <p className="text-cream/90 text-sm max-w-2xl">{t("simulationDesc")}</p>

                  <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2 bg-cream/10 rounded-lg px-3 py-2">
                      <span className="text-sm text-cream/80">{t("interval")}</span>
                      <input
                        type="number"
                        min={5}
                        max={300}
                        value={simInterval}
                        onChange={(e) => setSimInterval(Math.max(5, Math.min(300, parseInt(e.target.value) || 15)))}
                        className="w-16 bg-cream/20 rounded px-2 py-1 text-sm text-cream placeholder-cream/50 focus:outline-none focus:ring-2 focus:ring-cream/40"
                      />
                      <span className="text-sm text-cream/80">{t("seconds")}</span>
                    </div>
                    <Button
                      onClick={() => setSimulationEnabled(s => !s)}
                      className={`${simulationEnabled ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} text-white border-0`}
                    >
                      {simulationEnabled ? <ToggleRight className="w-4 h-4 mr-2" /> : <ToggleLeft className="w-4 h-4 mr-2" />}
                      {simulationEnabled ? t("enabled") : t("disabled")}
                    </Button>
                    <Button
                      onClick={() => injectMockCase(true)}
                      disabled={generating}
                      className="bg-cream/20 hover:bg-cream/30 text-cream border-0"
                    >
                      {generating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                      {generating ? t("generating") : t("generateCaseNow")}
                    </Button>
                  </div>
                </div>
                <div className="md:text-right">
                  <p className="text-3xl font-bold">{verifications.length + disputes.length + inspections.length}</p>
                  <p className="text-xs text-cream/80">{t("totalSimulatedCases")}</p>
                </div>
              </div>
            </div>

            {/* Impact Summary */}
            <div className="bg-primary rounded-lg p-6 text-cream">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-cream/20 flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold">{t("aiImpactTitle")}</h4>
                  <p className="text-cream/90 text-sm">
                    {t("aiImpactDesc", {
                      verified: autoVerifiedToday,
                      resolved: disputes.filter(d => d.autoResolved).length,
                      deposits: inspections.filter(i => i.autoProcessed).length,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="bg-paper rounded-lg border p-6">
            <h3 className="font-bold mb-4">{t("activityLog")}</h3>
            <div className="space-y-3">
              {activities.map((activity, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedActivity(activity)}
                  className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${activity.auto ? "bg-green-500" : "bg-primary"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{activity.action}</p>
                    <p className="text-sm text-neutral-500 truncate">{activity.target}</p>
                  </div>
                  {activity.auto && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium flex-shrink-0">
                      {t("auto")}
                    </span>
                  )}
                  <span className="text-sm text-neutral-400 flex-shrink-0">{activity.time}</span>
                  <ChevronDown className="w-4 h-4 text-neutral-400 rotate-[-90deg] flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Activity Detail Modal */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setSelectedActivity(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-paper rounded-lg p-6 max-w-lg w-full shadow-2xl max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selectedActivity.category === "verification" ? "bg-primary-soft text-primary" :
                    selectedActivity.category === "dispute" ? "bg-primary-soft text-primary" :
                    selectedActivity.category === "inspection" ? "bg-primary-soft text-primary" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {selectedActivity.category === "verification" ? <FileCheck className="w-5 h-5" /> :
                     selectedActivity.category === "dispute" ? <Scale className="w-5 h-5" /> :
                     selectedActivity.category === "inspection" ? <Camera className="w-5 h-5" /> :
                     <Info className="w-5 h-5" />}
                  </div>
                  <h4 className="font-bold text-lg">{t("activityDetail")}</h4>
                </div>
                <button onClick={() => setSelectedActivity(null)} className="text-neutral-400 hover:text-neutral-600">✕</button>
              </div>

              <div className="space-y-5">
                {/* Header row: action + target */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wide font-semibold mb-0.5">{t("action")}</p>
                    <p className="font-medium text-neutral-900">{selectedActivity.action}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wide font-semibold mb-0.5">{t("target")}</p>
                    <p className="font-medium text-neutral-900">{selectedActivity.target}</p>
                  </div>
                </div>

                {/* Category-specific rich details */}
                {selectedActivity.category === "verification" && (
                  <div className="bg-gray-50 rounded-xl p-4 border space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                      <FileCheck className="w-4 h-4 text-primary" />
                      {t("verificationDetails")}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {typeof selectedActivity.documents === "number" && (
                        <div className="bg-paper rounded-lg p-3 border">
                          <p className="text-xs text-neutral-500">{t("documents")}</p>
                          <p className="font-semibold text-neutral-900">{selectedActivity.documents}</p>
                        </div>
                      )}
                      {selectedActivity.riskLevel && (
                        <div className="bg-paper rounded-lg p-3 border">
                          <p className="text-xs text-neutral-500">{t("riskScore")}</p>
                          <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                            selectedActivity.riskLevel === "high" ? "bg-red-100 text-red-700" :
                            selectedActivity.riskLevel === "medium" ? "bg-amber-100 text-amber-700" :
                            "bg-green-100 text-green-700"
                          }`}>
                            {selectedActivity.riskLevel === "high" ? t("riskHigh") : selectedActivity.riskLevel === "medium" ? t("riskMedium") : t("riskLow")}
                          </span>
                        </div>
                      )}
                    </div>
                    {selectedActivity.missingDocs && selectedActivity.missingDocs.length > 0 && (
                      <div className="bg-paper rounded-lg p-3 border">
                        <p className="text-xs text-neutral-500 mb-1">{t("missing")}</p>
                        <ul className="list-disc list-inside text-sm text-neutral-800">
                          {selectedActivity.missingDocs.map((m, idx) => <li key={idx}>{m}</li>)}
                        </ul>
                      </div>
                    )}
                    {selectedActivity.flag && (
                      <div className="bg-paper rounded-lg p-3 border">
                        <p className="text-xs text-neutral-500 mb-1">{t("flag")}</p>
                        <p className="text-sm text-red-700">{selectedActivity.flag}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedActivity.category === "dispute" && (
                  <div className="bg-gray-50 rounded-xl p-4 border space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                      <Scale className="w-4 h-4 text-primary" />
                      {t("disputeDetails")}
                    </div>
                    {selectedActivity.parties && (
                      <div className="bg-paper rounded-lg p-3 border">
                        <p className="text-xs text-neutral-500 mb-1">{t("parties")}</p>
                        <p className="text-sm text-neutral-800">{selectedActivity.parties}</p>
                      </div>
                    )}
                    {selectedActivity.aiReason && (
                      <div className="bg-primary-soft/50 rounded-lg p-3 border border-primary/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Bot className="w-4 h-4 text-primary" />
                          <p className="text-xs text-primary font-semibold">{t("aiSuggestion")}</p>
                        </div>
                        <p className="text-sm text-ink-soft">{selectedActivity.aiReason}</p>
                      </div>
                    )}
                    {selectedActivity.riskLevel && (
                      <div className="bg-paper rounded-lg p-3 border">
                        <p className="text-xs text-neutral-500">{t("riskScore")}</p>
                        <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                          selectedActivity.riskLevel === "high" ? "bg-red-100 text-red-700" :
                          selectedActivity.riskLevel === "medium" ? "bg-amber-100 text-amber-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {selectedActivity.riskLevel === "high" ? t("riskHigh") : selectedActivity.riskLevel === "medium" ? t("riskMedium") : t("riskLow")}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {selectedActivity.category === "inspection" && (
                  <div className="bg-gray-50 rounded-xl p-4 border space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                      <Camera className="w-4 h-4 text-primary" />
                      {t("inspectionDetails")}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {selectedActivity.renter && (
                        <div className="bg-paper rounded-lg p-3 border">
                          <p className="text-xs text-neutral-500">{t("renter")}</p>
                          <p className="font-medium text-neutral-900">{selectedActivity.renter}</p>
                        </div>
                      )}
                      {selectedActivity.lister && (
                        <div className="bg-paper rounded-lg p-3 border">
                          <p className="text-xs text-neutral-500">{t("lister")}</p>
                          <p className="font-medium text-neutral-900">{selectedActivity.lister}</p>
                        </div>
                      )}
                      {selectedActivity.deposit && (
                        <div className="bg-paper rounded-lg p-3 border">
                          <p className="text-xs text-neutral-500">{t("deposit")}</p>
                          <p className="font-medium text-neutral-900">{selectedActivity.deposit}</p>
                        </div>
                      )}
                      {selectedActivity.condition && (
                        <div className="bg-paper rounded-lg p-3 border">
                          <p className="text-xs text-neutral-500">{t("condition")}</p>
                          <p className="font-medium text-neutral-900 capitalize">{selectedActivity.condition}</p>
                        </div>
                      )}
                    </div>
                    {selectedActivity.aiReason && (
                      <div className="bg-primary-soft/50 rounded-lg p-3 border border-primary/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Bot className="w-4 h-4 text-primary" />
                          <p className="text-xs text-primary font-semibold">{t("aiSuggestion")}</p>
                        </div>
                        <p className="text-sm text-ink-soft">{selectedActivity.aiReason}</p>
                      </div>
                    )}
                    {selectedActivity.riskLevel && (
                      <div className="bg-paper rounded-lg p-3 border">
                        <p className="text-xs text-neutral-500">{t("riskScore")}</p>
                        <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                          selectedActivity.riskLevel === "high" ? "bg-red-100 text-red-700" :
                          selectedActivity.riskLevel === "medium" ? "bg-amber-100 text-amber-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {selectedActivity.riskLevel === "high" ? t("riskHigh") : selectedActivity.riskLevel === "medium" ? t("riskMedium") : t("riskLow")}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Fallback detail block for non-category or extra detail */}
                {selectedActivity.detail && !selectedActivity.category && (
                  <div className="bg-gray-50 rounded-xl p-4 border">
                    <p className="text-xs text-neutral-500 uppercase tracking-wide font-semibold mb-1">{t("detail")}</p>
                    <p className="text-sm text-neutral-800 leading-relaxed">{selectedActivity.detail}</p>
                  </div>
                )}

                {/* Result + badges row */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {selectedActivity.result && (
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      selectedActivity.result === "approved" || selectedActivity.result === "resolved" || selectedActivity.result === "released"
                        ? "bg-green-100 text-green-700"
                        : selectedActivity.result === "rejected" || selectedActivity.result === "filed" || selectedActivity.result === "dismissed"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {selectedActivity.result === "approved" ? t("approved") :
                       selectedActivity.result === "rejected" ? t("rejected") :
                       selectedActivity.result === "resolved" ? t("resolved") :
                       selectedActivity.result === "released" ? t("released") :
                       selectedActivity.result === "filed" ? t("filed") :
                       selectedActivity.result === "dismissed" ? t("dismissed") :
                       selectedActivity.result}
                    </span>
                  )}
                  {selectedActivity.auto ? (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">{t("auto")}</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-primary-soft text-primary text-xs rounded-full font-medium">{t("manual")}</span>
                  )}
                  <span className="text-sm text-neutral-400">{selectedActivity.time}</span>
                </div>
              </div>

              <div className="mt-7 flex justify-end">
                <Button onClick={() => setSelectedActivity(null)}>{tc("close")}</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
