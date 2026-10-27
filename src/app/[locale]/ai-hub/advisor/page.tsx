"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, ClipboardList, Mail, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth-guard";
import { AiGenerationHistory } from "@/components/ai-generation-history";
import { PricingQuoteTool, type MessageSeed } from "@/components/advisor/pricing-quote-tool";
import { MessageTool } from "@/components/advisor/message-tool";
import { PlannerTool } from "@/components/advisor/planner-tool";
import { ContractTool } from "@/components/advisor/contract-tool";

type ToolId = "quote" | "messages" | "planner" | "contract";
const tabs = [{ id: "quote", icon: Briefcase }, { id: "messages", icon: Mail }, { id: "planner", icon: ClipboardList }, { id: "contract", icon: Shield }] as const;

export default function MarketAdvisorPage() {
  const t = useTranslations("aiTools"); const a = useTranslations("advisorNext");
  const [activeTab, setActiveTab] = useState<ToolId>("quote"); const [historyKey, setHistoryKey] = useState(0); const [messageSeed, setMessageSeed] = useState<MessageSeed | null>(null);
  const generated = () => setHistoryKey((key) => key + 1);
  const draftMessage = (seed: MessageSeed) => { setMessageSeed({ ...seed }); setActiveTab("messages"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return <AuthGuard><main className="min-h-screen overflow-x-clip bg-cream pb-16 pt-24"><div className="mx-auto max-w-6xl px-4">
    <div className="mb-8"><Link href="/ai-hub"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" />{t("backToAiHub")}</Button></Link></div>
    <header className="relative mb-10 overflow-hidden text-center"><span className="pointer-events-none absolute -right-8 -top-10 select-none font-quote text-[10rem] leading-none text-ink/5 sm:text-[12rem]">ADVISOR</span><div className="relative z-10"><div className="mb-4 inline-flex rounded-full border border-primary/40 px-4 py-1 text-xs uppercase tracking-widest text-primary">{t("advisorKicker")}</div><h1 className="mb-4 text-4xl text-ink md:text-5xl">{a("page.title")}</h1><p className="mx-auto max-w-3xl font-quote text-xl leading-relaxed text-ink-soft">{a("page.subtitle")}</p><div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-2 text-xs text-ink-soft">{["price", "communicate", "deliver", "protect"].map((item, index) => <span key={item} className="flex items-center gap-2"><span className="rounded-full bg-paper px-3 py-1.5 ring-1 ring-line">{index + 1}. {a(`page.flow.${item}`)}</span></span>)}</div></div></header>
    <div className="mb-8 grid grid-cols-2 gap-2 lg:grid-cols-4" role="tablist" aria-label="Market Advisor tools">{tabs.map((tab, index) => <button type="button" role="tab" aria-selected={activeTab === tab.id} key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left transition ${activeTab === tab.id ? "border-primary bg-primary text-cream shadow-sm" : "border-line bg-paper text-ink-soft hover:border-primary/40 hover:text-ink"}`}><span className={`font-quote text-xs ${activeTab === tab.id ? "text-cream/70" : "text-ink/35"}`}>{String(index + 1).padStart(2, "0")}</span><tab.icon className="h-4 w-4 shrink-0" /><span className="text-xs font-semibold sm:text-sm">{t(`advisor.tabs.${tab.id}`)}</span></button>)}</div>
    <div key={activeTab}>
      {activeTab === "quote" && <PricingQuoteTool onGenerated={generated} onDraftMessage={draftMessage} />}
      {activeTab === "messages" && <MessageTool seed={messageSeed} onGenerated={generated} />}
      {activeTab === "planner" && <PlannerTool onGenerated={generated} />}
      {activeTab === "contract" && <ContractTool onGenerated={generated} onDraftMessage={draftMessage} />}
    </div>
    <div className="mt-10"><div className="mb-3 flex items-baseline gap-2"><span className="text-xs uppercase tracking-widest text-ink-soft">{t("archiveLabel")} —</span><h3 className="font-quote text-lg text-ink">{t("historyTitle")}</h3></div><div className="[&_div:has(>h3)]:hidden"><AiGenerationHistory types={["rate", "quote", "message", "planner", "contract"]} refreshKey={historyKey} /></div></div>
  </div></main></AuthGuard>;
}
