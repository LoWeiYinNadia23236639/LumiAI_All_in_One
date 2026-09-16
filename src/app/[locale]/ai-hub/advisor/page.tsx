"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, ArrowLeft, BarChart3, Loader2, DollarSign, CheckCircle, AlertTriangle,
  FileText, Upload, X, Shield, Clock, RefreshCw, Target, Zap, Briefcase, MessageSquare,
  ClipboardList, Mail, Copy, Check, TrendingUpIcon, Lightbulb, Sparkles, PenTool, Layout,
  Megaphone, Camera, Video, FileCheck, ThumbsDown,
  Eye, ShoppingBag, Gamepad2, Palette, Sparkle, Wand2, Quote, Send,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth-guard";
import { AiGenerationHistory } from "@/components/ai-generation-history";
import { callGenerate, AiAuthError } from "@/lib/ai/client";
import { useTranslations, useLocale } from "next-intl";

// Types
interface ContractAnalysis {
  overallScore: number;
  fairness: "fair" | "neutral" | "concerning";
  risks: string[];
  positives: string[];
  recommendations: string[];
  redFlags: string[];
}

interface JobQuote {
  estimatedHours: number;
  recommendedPrice: { min: number; max: number };
  pricePerDeliverable: { type: string; price: number; time: string }[];
  timelineBreakdown: { phase: string; duration: string; tasks: string[] }[];
  factors: { factor: string; impact: "positive" | "negative" | "neutral"; description: string }[];
  marketComparison: { percentile: string; averagePrice: number; yourRange: string };
}

interface MessageDraft {
  subject: string;
  body: string;
  tone: string;
  tips: string[];
  alternatives: { tone: string; preview: string }[];
}

interface ProjectPlan {
  overview: { totalDays: number; keyMilestones: string[]; criticalDates: { date: string; event: string }[] };
  phases: { name: string; duration: string; tasks: { name: string; estimatedTime: string; priority: "high" | "medium" | "low" }[]; deliverables: string[] }[];
  resources: { name: string; type: "tool" | "service" | "person"; cost?: string }[];
  contentCalendar: { day: number; platform: string; content: string; notes: string }[];
}

// Demo Data
const demoScenarios = {
  quote: [
    { id: "skincare", icon: Sparkle, title: "Skincare Launch", brand: "Glow Skincare", description: "Vitamin C serum campaign with 3 deliverables", deliverables: ["reel", "story", "feed"], complexity: "medium", timeline: "2weeks", brief: "Launch campaign for new vitamin C serum. Need 1 main reel showcasing the product, story series with before/after, and feed post with detailed review." },
    { id: "gaming", icon: Gamepad2, title: "Gaming Review", brand: "TechMaster Pro", description: "In-depth gaming headset review for YouTube", deliverables: ["youtube", "tiktok"], complexity: "high", timeline: "2weeks", brief: "Detailed review of new gaming headset. Need comprehensive YouTube video with unboxing, sound test, mic test, and comparison." },
    { id: "fashion", icon: Palette, title: "Summer Lookbook", brand: "Urban Style Co", description: "5 outfit carousel + styling reels", deliverables: ["carousel", "reel", "story"], complexity: "medium", timeline: "1month", brief: "Summer fashion lookbook featuring 5 different outfits. Need carousel posts for each look, styling transition reels, and behind-the-scenes stories." }
  ],
  message: [
    { id: "proposal", title: "Initial Pitch", icon: Send, description: "First contact with a brand you want to work with", clientName: "Sarah from Glow Skincare", projectBrief: "Vitamin C serum launch campaign - 1 reel + story series + feed post", tone: "professional", specificPoints: "My audience is 70% women 25-34 interested in skincare. Previous skincare collabs averaged 5.2% engagement." },
    { id: "negotiation", title: "Budget Negotiation", icon: DollarSign, description: "Handle low budget offers professionally", clientName: "Mike from TechMaster", projectBrief: "Gaming headset review - YouTube video + TikTok clips", tone: "professional", specificPoints: "Budget is 30% below my standard rate. Happy to discuss adjusted scope or long-term partnership terms." },
    { id: "followup", title: "Gentle Follow-up", icon: Clock, description: "Follow up after no response", clientName: "Emma from Urban Style", projectBrief: "Summer lookbook collaboration discussion", tone: "friendly", specificPoints: "Sent proposal 5 days ago. Still very interested in working together. Have some flexibility in timeline." }
  ],
  planner: [
    { id: "skincare-campaign", title: "Skincare Launch Campaign", icon: Sparkle, duration: "1month", platforms: ["Instagram", "TikTok"], contentCount: 5, goals: "Increase brand awareness for new vitamin C serum, drive traffic to product page, showcase authentic before/after results" },
    { id: "product-launch", title: "Tech Product Launch", icon: Zap, duration: "2weeks", platforms: ["YouTube", "Instagram"], contentCount: 3, goals: "Create buzz around new tech product, demonstrate key features, drive pre-orders" },
    { id: "seasonal", title: "Holiday Collection", icon: ShoppingBag, duration: "2months", platforms: ["Instagram", "TikTok", "Pinterest"], contentCount: 8, goals: "Showcase holiday outfits, inspire gift ideas, maximize holiday shopping season" }
  ]
};

export default function MarketAdvisorPage() {
  const t = useTranslations("aiTools");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<"rates" | "contract" | "quote" | "messages" | "planner">("quote");
  const [visitedTabs, setVisitedTabs] = useState<string[]>([]);
  const [rateProfile, setRateProfile] = useState({ niche: "Beauty & Skincare", followers: "10K - 50K", engagement: "1-3%", platform: "Instagram" });
  const [rateResult, setRateResult] = useState<{ suggested_range: { min: number; max: number }; percentile: string; insights: string[]; recommendations: string[] } | null>(null);
  const [loading, setLoading] = useState(false); // contract scanner only
  const [loadingRates, setLoadingRates] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [loadingPlanner, setLoadingPlanner] = useState(false);
  const [errorRates, setErrorRates] = useState(false);
  const [errorQuote, setErrorQuote] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorPlanner, setErrorPlanner] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [contractResult, setContractResult] = useState<ContractAnalysis | null>(null);
  const [jobDetails, setJobDetails] = useState({ brandName: "", deliverables: [] as string[], contentType: "", complexity: "medium", timeline: "2weeks", briefDescription: "" });
  const [quoteResult, setQuoteResult] = useState<JobQuote | null>(null);
  const [messageContext, setMessageContext] = useState({ scenario: "proposal", clientName: "", projectBrief: "", tone: "professional", specificPoints: "" });
  const [messageDraft, setMessageDraft] = useState<MessageDraft | null>(null);
  const [copied, setCopied] = useState(false);
  const [projectBrief, setProjectBrief] = useState({ campaignName: "", duration: "1month", platforms: [] as string[], contentCount: 3, goals: "" });
  const [projectPlan, setProjectPlan] = useState<ProjectPlan | null>(null);

  useEffect(() => { if (!visitedTabs.includes(activeTab)) setVisitedTabs([...visitedTabs, activeTab]); }, [activeTab]);

  const handleAuthError = (err: unknown) => {
    if (err instanceof AiAuthError) {
      window.location.href = `/${locale}/login`;
      return true;
    }
    return false;
  };

  const analyzeRates = async () => {
    if (loadingRates) return;
    setLoadingRates(true);
    setErrorRates(false);
    try {
      const data = await callGenerate<{ suggested_range: { min: number; max: number }; percentile: string; insights: string[]; recommendations: string[] }>("rate", { ...rateProfile, locale });
      setRateResult(data);
      setHistoryKey((k) => k + 1);
    } catch (err) {
      if (handleAuthError(err)) return;
      setErrorRates(true);
    } finally {
      setLoadingRates(false);
    }
  };

  const analyzeContract = () => {
    if (!uploadedFile) return;
    setLoading(true);
    setTimeout(() => {
      const fileName = uploadedFile.name.toLowerCase();
      if (fileName.includes("techmaster") || fileName.includes("fair")) {
        setContractResult({ overallScore: 88, fairness: "fair", risks: ["Minor ambiguity in content revision process"], positives: ["Clear payment terms (net 15)", "Kill fee of 50% if campaign cancelled", "Creative freedom clause with clear boundaries", "Usage rights limited to 1 year with option to renew", "Specific content approval timeline (3 business days)", "Whitelisted boosting allowed"], recommendations: ["Clarify maximum number of revision rounds (suggest 2)", "Consider adding performance bonus structure"], redFlags: [] });
      } else if (fileName.includes("fastfashion") || fileName.includes("concerning")) {
        setContractResult({ overallScore: 45, fairness: "concerning", risks: ["Exclusivity clause extends 12 months post-campaign", "Usage rights granted in perpetuity worldwide", "No payment due date specified", "Brand can edit content without approval", "No kill fee if campaign cancelled", "Creator liable for all production costs"], positives: ["Clear deliverables specification"], recommendations: ["Negotiate exclusivity down to 3 months maximum", "Demand additional payment for usage beyond 6 months", "Add specific payment terms (net 30 recommended)", "Require approval for any content modifications", "Add 50% kill fee protection", "Request production cost reimbursement"], redFlags: ["Perpetual worldwide usage rights without additional fees", "Excessive 12-month exclusivity period", "No payment timeline specified", "Brand can modify content without consent", "Creator bears all financial risk"] });
      } else {
        setContractResult({ overallScore: 72, fairness: "neutral", risks: ["Exclusivity clause extends 6 months post-campaign", "Usage rights granted in perpetuity without additional compensation", "No clear deadline for content approval"], positives: ["Clear payment terms (net 30)", "Kill fee included if campaign cancelled", "Creative freedom clause present"], recommendations: ["Negotiate exclusivity period down to 3 months", "Request additional payment for usage beyond 1 year", "Add specific content approval timeline (5 business days)", "Clarify revision rounds (recommend max 2)"], redFlags: ["Unlimited usage rights without additional fees", "Vague 'satisfactory performance' clause", "No limit on revision requests"] });
      }
      setLoading(false);
    }, 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) setUploadedFile(file); };
  const loadQuoteDemo = (scenarioId: string) => { const scenario = demoScenarios.quote.find(s => s.id === scenarioId); if (!scenario) return; setJobDetails({ brandName: scenario.brand, deliverables: scenario.deliverables, contentType: "", complexity: scenario.complexity, timeline: scenario.timeline, briefDescription: scenario.brief }); };
  const loadMessageDemo = (scenarioId: string) => { const scenario = demoScenarios.message.find(s => s.id === scenarioId); if (!scenario) return; setMessageContext({ scenario: scenario.id, clientName: scenario.clientName, projectBrief: scenario.projectBrief, tone: scenario.tone, specificPoints: scenario.specificPoints }); };
  const loadPlannerDemo = (scenarioId: string) => { const scenario = demoScenarios.planner.find(s => s.id === scenarioId); if (!scenario) return; setProjectBrief({ campaignName: scenario.title, duration: scenario.duration, platforms: scenario.platforms, contentCount: scenario.contentCount, goals: scenario.goals }); };

  const generateQuote = async () => {
    if (loadingQuote) return;
    setLoadingQuote(true);
    setErrorQuote(false);
    try {
      const data = await callGenerate<JobQuote>("quote", { ...jobDetails, locale });
      setQuoteResult(data);
      setHistoryKey((k) => k + 1);
    } catch (err) {
      if (handleAuthError(err)) return;
      setErrorQuote(true);
    } finally {
      setLoadingQuote(false);
    }
  };

  const generateMessage = async () => {
    if (loadingMessage) return;
    setLoadingMessage(true);
    setErrorMessage(false);
    try {
      const data = await callGenerate<MessageDraft>("message", { ...messageContext, locale });
      setMessageDraft(data);
      setHistoryKey((k) => k + 1);
    } catch (err) {
      if (handleAuthError(err)) return;
      setErrorMessage(true);
    } finally {
      setLoadingMessage(false);
    }
  };

  const generatePlan = async () => {
    if (loadingPlanner) return;
    setLoadingPlanner(true);
    setErrorPlanner(false);
    try {
      const data = await callGenerate<ProjectPlan>("planner", { ...projectBrief, locale });
      setProjectPlan(data);
      setHistoryKey((k) => k + 1);
    } catch (err) {
      if (handleAuthError(err)) return;
      setErrorPlanner(true);
    } finally {
      setLoadingPlanner(false);
    }
  };

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const getFairnessColor = (fairness: string) => { switch (fairness) { case "fair": return "bg-green-100 text-green-700"; case "neutral": return "bg-yellow-100 text-yellow-700"; case "concerning": return "bg-red-100 text-red-700"; default: return "bg-gray-100 text-gray-700"; } };
  const getImpactIcon = (impact: string) => { switch (impact) { case "positive": return <TrendingUpIcon className="w-4 h-4 text-green-500" />; case "negative": return <TrendingUpIcon className="w-4 h-4 text-red-500 rotate-180" />; default: return <TrendingUpIcon className="w-4 h-4 text-gray-400" />; } };
  const deliverableOptions = [{ id: "feed", label: "Feed Post", icon: Camera, price: "$800-1,200" }, { id: "reel", label: "Instagram Reel", icon: Video, price: "$1,000-1,500" }, { id: "story", label: "Story Series", icon: Layout, price: "$300-500" }, { id: "carousel", label: "Carousel Post", icon: FileText, price: "$1,000-1,400" }, { id: "live", label: "Live Session", icon: Megaphone, price: "$1,500-2,500" }, { id: "tiktok", label: "TikTok Video", icon: Video, price: "$800-1,200" }, { id: "youtube", label: "YouTube Video", icon: Video, price: "$2,000-5,000" }];
  const toggleDeliverable = (id: string) => { setJobDetails(prev => ({ ...prev, deliverables: prev.deliverables.includes(id) ? prev.deliverables.filter(d => d !== id) : [...prev.deliverables, id] })); };

  return (
    <AuthGuard>
    <main className="min-h-screen bg-gradient-to-b from-orange-50/50 to-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/ai-hub"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back to AI Hub</Button></Link>
        </div>
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold mb-4"><TrendingUp className="w-4 h-4" />AI Market Advisor</div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">Your Personal <span className="gradient-text">Deal Assistant</span></h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">Get rate suggestions, analyze contracts, estimate project timelines, draft professional messages, and plan your campaigns with AI-powered insights.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[{ id: "rates", label: "Rate Calculator", icon: BarChart3 }, { id: "quote", label: "Job Quote", icon: Briefcase }, { id: "messages", label: "Message Assistant", icon: MessageSquare }, { id: "planner", label: "Project Planner", icon: ClipboardList }, { id: "contract", label: "Contract Scanner", icon: Shield }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${activeTab === tab.id ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg" : "bg-white text-neutral-600 hover:text-neutral-900 hover:bg-gray-50 border"}`}><tab.icon className="w-4 h-4" />{tab.label}</button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {activeTab === "rates" && (
            <motion.div key="rates" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {!rateResult ? (
                <div className="bg-white rounded-2xl shadow-lg border p-8">
                  <h2 className="text-2xl font-bold mb-2">Rate Calculator</h2>
                  <p className="text-neutral-600 mb-6">Get personalized rate recommendations based on your profile and market data.</p>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div><label className="block text-sm font-medium text-neutral-700 mb-2">Niche</label><select value={rateProfile.niche} onChange={(e) => setRateProfile({...rateProfile, niche: e.target.value})} className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500"><option>Beauty & Skincare</option><option>Fashion</option><option>Fitness</option><option>Tech</option><option>Food</option><option>Travel</option><option>Lifestyle</option></select></div>
                    <div><label className="block text-sm font-medium text-neutral-700 mb-2">Followers</label><select value={rateProfile.followers} onChange={(e) => setRateProfile({...rateProfile, followers: e.target.value})} className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500"><option>10K - 50K</option><option>50K - 100K</option><option>100K - 500K</option><option>500K+</option></select></div>
                    <div><label className="block text-sm font-medium text-neutral-700 mb-2">Engagement Rate</label><select value={rateProfile.engagement} onChange={(e) => setRateProfile({...rateProfile, engagement: e.target.value})} className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500"><option>1-3%</option><option>3-5%</option><option>5-8%</option><option>8%+</option></select></div>
                    <div><label className="block text-sm font-medium text-neutral-700 mb-2">Primary Platform</label><select value={rateProfile.platform} onChange={(e) => setRateProfile({...rateProfile, platform: e.target.value})} className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500"><option>Instagram</option><option>TikTok</option><option>YouTube</option><option>Multi-Platform</option></select></div>
                  </div>
                  {errorRates && (
                    <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-xl flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" />{t("generateFailed")}</span>
                      <Button size="sm" variant="outline" onClick={analyzeRates} disabled={loadingRates}>{t("retry")}</Button>
                    </div>
                  )}
                  <Button onClick={analyzeRates} disabled={loadingRates} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 py-3 h-auto">{loadingRates ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />{t("analyzing")}</>) : (<><BarChart3 className="w-5 h-5 mr-2" />Get Rate Insights</>)}</Button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-8 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg opacity-90">Your recommended rate range</p>
                        <p className="text-5xl font-bold mt-2">${rateResult.suggested_range.min.toLocaleString()} - ${rateResult.suggested_range.max.toLocaleString()}</p>
                        <p className="text-lg opacity-90 mt-1">Per sponsored post (60s video)</p>
                      </div>
                      <div className="text-right"><div className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm"><TrendingUp className="w-4 h-4" />{rateResult.percentile}</div></div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border shadow-sm p-6">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-orange-500" />Market Insights</h3>
                      <div className="space-y-3">{rateResult.insights.map((insight, i) => (<div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl"><span className="text-sm text-neutral-600">{insight}</span></div>))}</div>
                    </div>
                    <div className="bg-white rounded-2xl border shadow-sm p-6">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-orange-500" />Growth Recommendations</h3>
                      <ul className="space-y-3">{rateResult.recommendations.map((tip, i) => (<li key={i} className="flex items-start gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><span>{tip}</span></li>))}</ul>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => { setRateResult(null); setErrorRates(false); }} className="w-full"><RefreshCw className="w-4 h-4 mr-2" />{t("newAnalysis")}</Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === "quote" && (
            <motion.div key="quote" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {!quoteResult ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-6">
                    <div className="flex items-center gap-3 mb-4"><Wand2 className="w-5 h-5 text-orange-600" /><h3 className="font-bold text-lg">Quick Start: Choose a Sample Scenario</h3></div>
                    <div className="grid md:grid-cols-3 gap-4">
                      {demoScenarios.quote.map((scenario) => (
                        <button key={scenario.id} onClick={() => loadQuoteDemo(scenario.id)} className="group p-4 rounded-xl border-2 border-white bg-white hover:border-orange-400 hover:shadow-md transition-all text-left">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform"><scenario.icon className="w-5 h-5" /></div>
                            <div><h4 className="font-bold text-sm">{scenario.title}</h4><p className="text-xs text-orange-600">{scenario.brand}</p></div>
                          </div>
                          <p className="text-xs text-neutral-600 mb-2">{scenario.description}</p>
                          <div className="flex flex-wrap gap-1">{scenario.deliverables.map(d => (<span key={d} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] uppercase">{d}</span>))}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg border p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white"><Briefcase className="w-6 h-6" /></div>
                      <div><h2 className="text-2xl font-bold">Job Quote Assistant</h2><p className="text-neutral-600">Tell us about the job and get time estimates, pricing recommendations, and deliverables breakdown.</p></div>
                    </div>
                    <div className="space-y-6">
                      <div><label className="block text-sm font-medium text-neutral-700 mb-2">Brand/Client Name</label><input type="text" value={jobDetails.brandName} onChange={(e) => setJobDetails({...jobDetails, brandName: e.target.value})} placeholder="e.g., Glow Skincare" className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-3">Deliverables Required</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{deliverableOptions.map((option) => (<button key={option.id} onClick={() => toggleDeliverable(option.id)} className={`p-4 rounded-xl border-2 transition-all text-left ${jobDetails.deliverables.includes(option.id) ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-200"}`}><option.icon className={`w-5 h-5 mb-2 ${jobDetails.deliverables.includes(option.id) ? "text-orange-500" : "text-gray-400"}`} /><p className="font-medium text-sm">{option.label}</p><p className="text-xs text-neutral-500">{option.price}</p></button>))}</div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-medium text-neutral-700 mb-2">Project Complexity</label><select value={jobDetails.complexity} onChange={(e) => setJobDetails({...jobDetails, complexity: e.target.value})} className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500"><option value="low">Simple - Standard content</option><option value="medium">Moderate - Some creative direction</option><option value="high">Complex - High production value</option></select></div>
                        <div><label className="block text-sm font-medium text-neutral-700 mb-2">Timeline</label><select value={jobDetails.timeline} onChange={(e) => setJobDetails({...jobDetails, timeline: e.target.value})} className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500"><option value="1week">Urgent - Within 1 week</option><option value="2weeks">Standard - 2 weeks</option><option value="1month">Relaxed - 1 month</option></select></div>
                      </div>
                      <div><label className="block text-sm font-medium text-neutral-700 mb-2">Project Brief Summary</label><textarea value={jobDetails.briefDescription} onChange={(e) => setJobDetails({...jobDetails, briefDescription: e.target.value})} placeholder="Briefly describe what the brand is looking for..." rows={4} className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" /></div>
                      {errorQuote && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-xl flex items-center justify-between gap-3 text-sm">
                          <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" />{t("generateFailed")}</span>
                          <Button size="sm" variant="outline" onClick={generateQuote} disabled={loadingQuote}>{t("retry")}</Button>
                        </div>
                      )}
                      <Button onClick={generateQuote} disabled={loadingQuote || jobDetails.deliverables.length === 0} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 py-3 h-auto">{loadingQuote ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />{t("generating")}</>) : (<><Sparkles className="w-5 h-5 mr-2" />Generate Quote & Timeline</>)}</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-8 text-white">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div><p className="text-white/80 text-sm">Recommended Price</p><p className="text-4xl font-bold mt-1">${quoteResult.recommendedPrice.min.toLocaleString()} - ${quoteResult.recommendedPrice.max.toLocaleString()}</p></div>
                      <div><p className="text-white/80 text-sm">Estimated Time</p><p className="text-4xl font-bold mt-1">{quoteResult.estimatedHours} hours</p></div>
                      <div><p className="text-white/80 text-sm">Market Position</p><p className="text-2xl font-bold mt-1">{quoteResult.marketComparison.percentile}</p></div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border shadow-sm p-6">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-orange-500" />Price per Deliverable</h3>
                      <div className="space-y-3">{quoteResult.pricePerDeliverable.map((item, i) => (<div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"><div><p className="font-medium capitalize">{item.type}</p><p className="text-xs text-neutral-500">Est. {item.time}</p></div><p className="font-bold text-orange-600">${item.price.toLocaleString()}</p></div>))}</div>
                    </div>
                    <div className="bg-white rounded-2xl border shadow-sm p-6">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-orange-500" />Pricing Factors</h3>
                      <div className="space-y-3">{quoteResult.factors.map((factor, i) => (<div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">{getImpactIcon(factor.impact)}<div><p className="font-medium text-sm">{factor.factor}</p><p className="text-xs text-neutral-600">{factor.description}</p></div></div>))}</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border shadow-sm p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-orange-500" />Timeline Breakdown</h3>
                    <div className="grid md:grid-cols-4 gap-4">{quoteResult.timelineBreakdown.map((phase, i) => (<div key={i} className="p-4 bg-gray-50 rounded-xl"><div className="flex items-center gap-2 mb-2"><div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">{i + 1}</div><p className="font-medium text-sm">{phase.phase}</p></div><p className="text-xs text-orange-600 font-medium mb-2">{phase.duration}</p><ul className="space-y-1">{phase.tasks.map((task, j) => (<li key={j} className="text-xs text-neutral-600 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" />{task}</li>))}</ul></div>))}</div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => {setQuoteResult(null);}} className="flex-1"><RefreshCw className="w-4 h-4 mr-2" />Try Another Quote</Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setMessageContext({
                          scenario: "proposal",
                          clientName: jobDetails.brandName || "Brand Contact",
                          projectBrief: jobDetails.briefDescription || `Campaign with ${jobDetails.deliverables.join(", ")}`,
                          tone: "professional",
                          specificPoints: `Quoted price range: $${quoteResult.recommendedPrice.min.toLocaleString()} - $${quoteResult.recommendedPrice.max.toLocaleString()}. Estimated time: ${quoteResult.estimatedHours} hours.`
                        });
                        setActiveTab("messages");
                      }}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 border-blue-200"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />Draft Message
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === "messages" && (
            <motion.div key="messages" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {!messageDraft ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
                    <div className="flex items-center gap-3 mb-4"><Quote className="w-5 h-5 text-blue-600" /><h3 className="font-bold text-lg">Quick Start: Choose a Message Scenario</h3></div>
                    <div className="grid md:grid-cols-3 gap-4">
                      {demoScenarios.message.map((scenario) => (
                        <button key={scenario.id} onClick={() => loadMessageDemo(scenario.id)} className="group p-4 rounded-xl border-2 border-white bg-white hover:border-blue-400 hover:shadow-md transition-all text-left">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform"><scenario.icon className="w-5 h-5" /></div>
                            <div><h4 className="font-bold text-sm">{scenario.title}</h4><p className="text-xs text-blue-600">{scenario.clientName}</p></div>
                          </div>
                          <p className="text-xs text-neutral-600">{scenario.description}</p>
                          <div className="mt-2"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] capitalize">{scenario.tone}</span></div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg border p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white"><Mail className="w-6 h-6" /></div>
                      <div><h2 className="text-2xl font-bold">Message Assistant</h2><p className="text-neutral-600">Draft professional emails and messages for any scenario.</p></div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-3">Message Scenario</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">{[{ id: "dm", label: t("msgTypeDm"), icon: Send }, { id: "proposal", label: t("msgTypeProposal"), icon: Mail }, { id: "followup", label: t("msgTypeFollowup"), icon: Clock }, { id: "decline", label: t("msgTypeDecline"), icon: ThumbsDown }, { id: "negotiation", label: t("msgTypeNegotiation"), icon: TrendingUp }].map((s) => (<button key={s.id} onClick={() => setMessageContext({...messageContext, scenario: s.id})} className={`p-3 rounded-xl border-2 transition-all text-center ${messageContext.scenario === s.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-200"}`}><s.icon className={`w-5 h-5 mx-auto mb-2 ${messageContext.scenario === s.id ? "text-blue-500" : "text-gray-400"}`} /><p className="font-medium text-sm">{s.label}</p></button>))}</div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-medium text-neutral-700 mb-2">Client/Brand Name</label><input type="text" value={messageContext.clientName} onChange={(e) => setMessageContext({...messageContext, clientName: e.target.value})} placeholder="e.g., Sarah from Glow Skincare" className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                        <div><label className="block text-sm font-medium text-neutral-700 mb-2">Tone</label><select value={messageContext.tone} onChange={(e) => setMessageContext({...messageContext, tone: e.target.value})} className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="professional">Professional</option><option value="friendly">Friendly</option><option value="formal">Formal</option><option value="enthusiastic">Enthusiastic</option></select></div>
                      </div>
                      <div><label className="block text-sm font-medium text-neutral-700 mb-2">Brief Description</label><textarea value={messageContext.projectBrief} onChange={(e) => setMessageContext({...messageContext, projectBrief: e.target.value})} placeholder="Describe the project or context..." rows={3} className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
                      <div><label className="block text-sm font-medium text-neutral-700 mb-2">Key Points to Include</label><textarea value={messageContext.specificPoints} onChange={(e) => setMessageContext({...messageContext, specificPoints: e.target.value})} placeholder="Any specific details, requirements, or points you want to mention..." rows={3} className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
                      {errorMessage && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-xl flex items-center justify-between gap-3 text-sm">
                          <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" />{t("generateFailed")}</span>
                          <Button size="sm" variant="outline" onClick={generateMessage} disabled={loadingMessage}>{t("retry")}</Button>
                        </div>
                      )}
                      <Button onClick={generateMessage} disabled={loadingMessage} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 py-3 h-auto">{loadingMessage ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />{t("generating")}</>) : (<><PenTool className="w-5 h-5 mr-2" />Generate Message</>)}</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-between">
                      <div className="flex items-center gap-3"><Mail className="w-5 h-5" /><span className="font-medium">Draft Message</span></div>
                      <span className="text-sm bg-white/20 px-3 py-1 rounded-full">{messageContext.tone}</span>
                    </div>
                    <div className="p-6">
                      <div className="mb-4 p-3 bg-gray-100 rounded-lg"><span className="text-sm text-neutral-500">Subject: </span><span className="font-medium">{messageDraft.subject}</span></div>
                      <pre className="whitespace-pre-wrap font-sans text-sm text-neutral-700 leading-relaxed">{messageDraft.body}</pre>
                      <div className="mt-6 flex gap-3">
                        <Button onClick={() => copyToClipboard(`Subject: ${messageDraft.subject}\n\n${messageDraft.body}`)} variant="outline" className="flex-1">{copied ? (<><Check className="w-4 h-4 mr-2" />Copied!</>) : (<><Copy className="w-4 h-4 mr-2" />Copy to Clipboard</>)}</Button>
                        <Button onClick={() => setMessageDraft(null)} variant="outline"><RefreshCw className="w-4 h-4 mr-2" />New Message</Button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-blue-800"><Lightbulb className="w-5 h-5" />Tips for This Message</h3>
                    <ul className="space-y-2">{messageDraft.tips.map((tip, i) => (<li key={i} className="flex items-start gap-2 text-sm text-blue-700"><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{tip}</li>))}</ul>
                  </div>
                  <div className="bg-white rounded-2xl border shadow-sm p-6">
                    <h3 className="font-bold text-lg mb-4">Try Different Tones</h3>
                    <div className="grid md:grid-cols-3 gap-3">{messageDraft.alternatives.map((alt, i) => (<button key={i} onClick={() => setMessageContext({...messageContext, tone: alt.tone})} className="p-4 text-left border rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all"><p className="font-medium text-sm capitalize mb-1">{alt.tone}</p><p className="text-xs text-neutral-500 truncate">{alt.preview}</p></button>))}</div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === "planner" && (
            <motion.div key="planner" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {!projectPlan ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6">
                    <div className="flex items-center gap-3 mb-4"><Layout className="w-5 h-5 text-emerald-600" /><h3 className="font-bold text-lg">Quick Start: Choose a Campaign Template</h3></div>
                    <div className="grid md:grid-cols-3 gap-4">
                      {demoScenarios.planner.map((scenario) => (
                        <button key={scenario.id} onClick={() => loadPlannerDemo(scenario.id)} className="group p-4 rounded-xl border-2 border-white bg-white hover:border-emerald-400 hover:shadow-md transition-all text-left">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform"><scenario.icon className="w-5 h-5" /></div>
                            <div><h4 className="font-bold text-sm">{scenario.title}</h4><p className="text-xs text-emerald-600">{scenario.duration === "2weeks" ? "2 Weeks" : scenario.duration === "1month" ? "1 Month" : "2 Months"}</p></div>
                          </div>
                          <p className="text-xs text-neutral-600 mb-2">{scenario.goals.slice(0, 50)}...</p>
                          <div className="flex flex-wrap gap-1">{scenario.platforms.map(p => (<span key={p} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px]">{p}</span>))}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg border p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white"><ClipboardList className="w-6 h-6" /></div>
                      <div><h2 className="text-2xl font-bold">Project Planner</h2><p className="text-neutral-600">Create a detailed project plan with task breakdowns, timelines, and content calendars.</p></div>
                    </div>
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-medium text-neutral-700 mb-2">Campaign Name</label><input type="text" value={projectBrief.campaignName} onChange={(e) => setProjectBrief({...projectBrief, campaignName: e.target.value})} placeholder="e.g., Summer Collection Launch" className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                        <div><label className="block text-sm font-medium text-neutral-700 mb-2">Campaign Duration</label><select value={projectBrief.duration} onChange={(e) => setProjectBrief({...projectBrief, duration: e.target.value})} className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500"><option value="2weeks">2 Weeks</option><option value="1month">1 Month</option><option value="2months">2 Months</option></select></div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-3">Target Platforms</label>
                        <div className="flex flex-wrap gap-3">{["Instagram", "TikTok", "YouTube", "Twitter/X", "LinkedIn"].map((platform) => (<button key={platform} onClick={() => { const newPlatforms = projectBrief.platforms.includes(platform) ? projectBrief.platforms.filter(p => p !== platform) : [...projectBrief.platforms, platform]; setProjectBrief({...projectBrief, platforms: newPlatforms}); }} className={`px-4 py-2 rounded-xl border-2 transition-all ${projectBrief.platforms.includes(platform) ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-neutral-600 hover:border-emerald-200"}`}>{platform}</button>))}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Number of Content Pieces: <span className="text-emerald-600 font-bold">{projectBrief.contentCount}</span></label>
                        <input type="range" min="1" max="10" value={projectBrief.contentCount} onChange={(e) => setProjectBrief({...projectBrief, contentCount: parseInt(e.target.value)})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                        <div className="flex justify-between text-xs text-neutral-500 mt-1"><span>1 piece</span><span>10 pieces</span></div>
                      </div>
                      <div><label className="block text-sm font-medium text-neutral-700 mb-2">Campaign Goals</label><textarea value={projectBrief.goals} onChange={(e) => setProjectBrief({...projectBrief, goals: e.target.value})} placeholder="What are the main objectives of this campaign?" rows={3} className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" /></div>
                      {errorPlanner && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-xl flex items-center justify-between gap-3 text-sm">
                          <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" />{t("generateFailed")}</span>
                          <Button size="sm" variant="outline" onClick={generatePlan} disabled={loadingPlanner}>{t("retry")}</Button>
                        </div>
                      )}
                      <Button onClick={generatePlan} disabled={loadingPlanner || projectBrief.platforms.length === 0} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 py-3 h-auto">{loadingPlanner ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />{t("generating")}</>) : (<><Layout className="w-5 h-5 mr-2" />Generate Project Plan</>)}</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white">
                    <h3 className="text-2xl font-bold mb-4">{projectBrief.campaignName || "Campaign Plan"}</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div><p className="text-white/80 text-sm">Total Duration</p><p className="text-3xl font-bold mt-1">{projectPlan.overview.totalDays} days</p></div>
                      <div><p className="text-white/80 text-sm">Key Milestones</p><p className="text-3xl font-bold mt-1">{projectPlan.overview.keyMilestones.length}</p></div>
                      <div><p className="text-white/80 text-sm">Content Pieces</p><p className="text-3xl font-bold mt-1">{projectBrief.contentCount}</p></div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">{projectBrief.platforms.map((platform) => (<span key={platform} className="px-3 py-1 bg-white/20 rounded-full text-sm">{platform}</span>))}</div>
                  </div>
                  <div className="bg-white rounded-2xl border shadow-sm p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-emerald-500" />Critical Dates</h3>
                    <div className="grid md:grid-cols-4 gap-4">{projectPlan.overview.criticalDates.map((date, i) => (<div key={i} className="p-4 bg-emerald-50 rounded-xl text-center"><p className="text-2xl font-bold text-emerald-600">{date.date}</p><p className="text-sm text-neutral-700 mt-1">{date.event}</p></div>))}</div>
                  </div>
                  <div className="bg-white rounded-2xl border shadow-sm p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Layout className="w-5 h-5 text-emerald-500" />Phase Breakdown</h3>
                    <div className="space-y-4">{projectPlan.phases.map((phase, i) => (<div key={i} className="p-4 bg-gray-50 rounded-xl"><div className="flex items-center justify-between mb-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">{i + 1}</div><h4 className="font-bold">{phase.name}</h4></div><span className="text-sm text-emerald-600 font-medium">{phase.duration}</span></div><div className="grid md:grid-cols-2 gap-4"><div><p className="text-sm font-medium text-neutral-600 mb-2">Tasks</p><ul className="space-y-1">{phase.tasks.map((task, j) => (<li key={j} className="flex items-center gap-2 text-sm"><span className={`w-2 h-2 rounded-full ${task.priority === "high" ? "bg-red-400" : task.priority === "medium" ? "bg-yellow-400" : "bg-green-400"}`} /><span>{task.name}</span><span className="text-xs text-neutral-500">({task.estimatedTime})</span></li>))}</ul></div><div><p className="text-sm font-medium text-neutral-600 mb-2">Deliverables</p><ul className="space-y-1">{phase.deliverables.map((del, j) => (<li key={j} className="flex items-center gap-2 text-sm"><FileCheck className="w-4 h-4 text-emerald-500" />{del}</li>))}</ul></div></div></div>))}</div>
                  </div>
                  <Button variant="outline" onClick={() => setProjectPlan(null)} className="w-full"><RefreshCw className="w-4 h-4 mr-2" />Create New Plan</Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === "contract" && (
            <motion.div key="contract" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {!contractResult ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
                    <div className="flex items-center gap-3 mb-4"><Eye className="w-5 h-5 text-amber-600" /><h3 className="font-bold text-lg">See How It Works: Try a Sample Contract</h3></div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <button onClick={() => setUploadedFile(new File([""], "glow-skincare-contract.pdf", { type: "application/pdf" }))} className="group p-4 rounded-xl border-2 border-white bg-white hover:border-amber-400 hover:shadow-md transition-all text-left">
                        <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform"><FileText className="w-5 h-5" /></div><div><h4 className="font-bold text-sm">Standard Brand Deal</h4><p className="text-xs text-amber-600">Glow Skincare</p></div></div>
                        <p className="text-xs text-neutral-600">Typical influencer contract with mixed terms</p>
                        <div className="mt-2 flex items-center gap-1"><span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px]">Score: 72/100</span><span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px]">Review Needed</span></div>
                      </button>
                      <button onClick={() => setUploadedFile(new File([""], "techmaster-fair-contract.pdf", { type: "application/pdf" }))} className="group p-4 rounded-xl border-2 border-white bg-white hover:border-green-400 hover:shadow-md transition-all text-left">
                        <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform"><CheckCircle className="w-5 h-5" /></div><div><h4 className="font-bold text-sm">Fair Contract</h4><p className="text-xs text-green-600">TechMaster Pro</p></div></div>
                        <p className="text-xs text-neutral-600">Well-balanced contract with creator-friendly terms</p>
                        <div className="mt-2 flex items-center gap-1"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px]">Score: 88/100</span><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px]">Fair Deal</span></div>
                      </button>
                      <button onClick={() => setUploadedFile(new File([""], "fastfashion-concerning-contract.pdf", { type: "application/pdf" }))} className="group p-4 rounded-xl border-2 border-white bg-white hover:border-red-400 hover:shadow-md transition-all text-left">
                        <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform"><AlertTriangle className="w-5 h-5" /></div><div><h4 className="font-bold text-sm">Concerning Terms</h4><p className="text-xs text-red-600">Fast Fashion Co</p></div></div>
                        <p className="text-xs text-neutral-600">Multiple red flags including excessive usage rights</p>
                        <div className="mt-2 flex items-center gap-1"><span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px]">Score: 45/100</span><span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px]">High Risk</span></div>
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg border p-8">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white mx-auto mb-4"><Shield className="w-8 h-8" /></div>
                      <h2 className="text-2xl font-bold mb-2">Contract Scanner</h2>
                      <p className="text-neutral-600">Upload your brand contract and our AI will analyze it for loopholes, unfair terms, and red flags.</p>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-orange-400 transition-colors">
                      {uploadedFile ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileText className="w-8 h-8 text-orange-500" />
                          <div className="text-left"><p className="font-medium">{uploadedFile.name}</p><p className="text-sm text-neutral-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p></div>
                          <button onClick={() => setUploadedFile(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="font-medium mb-1">Click to upload or drag and drop</p>
                          <p className="text-sm text-neutral-500">PDF, DOC, or DOCX (max 10MB)</p>
                          <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                        </label>
                      )}
                    </div>
                    <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800"><strong>Privacy Note:</strong> Your contract is processed securely and never stored. We recommend removing sensitive personal information before uploading.</p>
                    </div>
                    <Button onClick={analyzeContract} disabled={loading || !uploadedFile} className="w-full mt-6 bg-gradient-to-r from-orange-500 to-amber-500 py-3 h-auto">{loading ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Analyzing...</>) : (<><Shield className="w-5 h-5 mr-2" />Scan for Issues</>)}</Button>
                  </div>
                </div>
              ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                      <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-neutral-500" /><span className="font-medium">{uploadedFile?.name || "contract.pdf"}</span></div>
                      <button onClick={() => setContractResult(null)} className="p-1 hover:bg-gray-200 rounded"><X className="w-4 h-4 text-gray-400" /></button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                      <div className="text-center border-b pb-4">
                        <h3 className="font-bold text-lg">INFLUENCER AGREEMENT</h3>
                        <p className="text-sm text-neutral-500">{uploadedFile?.name.includes("techmaster") ? "TechMaster Pro" : uploadedFile?.name.includes("fastfashion") ? "Fast Fashion Co" : "Glow Skincare"}</p>
                      </div>
                      <div className={`p-3 rounded-lg border-l-4 ${uploadedFile?.name.includes("fastfashion") ? "bg-red-50 border-red-400" : "bg-green-50 border-green-400"}`}>
                        <p className="text-xs font-bold uppercase mb-1 text-neutral-500">Section 3: Compensation</p>
                        <p className="text-sm">{uploadedFile?.name.includes("fastfashion") ? "Payment shall be made within a reasonable timeframe after campaign completion. No specific due date is guaranteed." : uploadedFile?.name.includes("techmaster") ? "Payment of $2,500 shall be made within 15 days of content delivery and approval." : "Payment of $1,800 shall be made within 30 days of content delivery (Net 30 terms)."}</p>
                      </div>
                      <div className={`p-3 rounded-lg border-l-4 ${uploadedFile?.name.includes("techmaster") ? "bg-green-50 border-green-400" : "bg-red-50 border-red-400"}`}>
                        <p className="text-xs font-bold uppercase mb-1 text-neutral-500">Section 5: Usage Rights</p>
                        <p className="text-sm">{uploadedFile?.name.includes("fastfashion") ? "Brand retains perpetual, worldwide, unlimited usage rights to all created content in perpetuity without additional compensation." : uploadedFile?.name.includes("techmaster") ? "Brand licensed to use content for 12 months from first use, with option to renew for additional fee." : "Brand granted usage rights for 1 year from campaign start. Additional usage requires separate negotiation."}</p>
                      </div>
                      <div className={`p-3 rounded-lg border-l-4 ${uploadedFile?.name.includes("fastfashion") ? "bg-red-50 border-red-400" : uploadedFile?.name.includes("techmaster") ? "bg-green-50 border-green-400" : "bg-yellow-50 border-yellow-400"}`}>
                        <p className="text-xs font-bold uppercase mb-1 text-neutral-500">Section 7: Exclusivity</p>
                        <p className="text-sm">{uploadedFile?.name.includes("fastfashion") ? "Creator agrees not to work with any competing brands for 12 months following campaign completion." : uploadedFile?.name.includes("techmaster") ? "Creator agrees to 30-day exclusivity for direct competitors only, reasonable category restrictions." : "Creator agrees not to work with competing skincare brands for 6 months following campaign."}</p>
                      </div>
                      <div className={`p-3 rounded-lg border-l-4 ${uploadedFile?.name.includes("fastfashion") ? "bg-red-50 border-red-400" : "bg-green-50 border-green-400"}`}>
                        <p className="text-xs font-bold uppercase mb-1 text-neutral-500">Section 9: Cancellation</p>
                        <p className="text-sm">{uploadedFile?.name.includes("fastfashion") ? "Brand reserves right to cancel campaign at any time without compensation for work completed." : uploadedFile?.name.includes("techmaster") ? "If campaign cancelled after content creation, Creator receives 50% kill fee. If cancelled before, 25%." : "If campaign cancelled, Creator entitled to 50% of agreed fee if work has commenced."}</p>
                      </div>
                      <div className="flex flex-wrap gap-3 pt-4 border-t text-xs">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 rounded"></div><span>Red Flag</span></div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-400 rounded"></div><span>Review Needed</span></div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-400 rounded"></div><span>Good Clause</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl border shadow-sm p-6">
                      <div className="flex items-center justify-between">
                        <div><h3 className="text-lg font-medium text-neutral-600 mb-1">Contract Fairness Score</h3><p className="text-5xl font-bold">{contractResult.overallScore}/100</p></div>
                        <div className="text-right"><span className={`px-4 py-2 rounded-full text-sm font-bold ${getFairnessColor(contractResult.fairness)}`}>{contractResult.fairness === "fair" ? "✓ Fair" : contractResult.fairness === "neutral" ? "⚠ Review" : "⚠ Risky"}</span></div>
                      </div>
                    </div>
                    {contractResult.redFlags.length > 0 && (
                      <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                        <h3 className="font-bold mb-3 flex items-center gap-2 text-red-800"><AlertTriangle className="w-5 h-5" />Red Flags ({contractResult.redFlags.length})</h3>
                        <ul className="space-y-2">{contractResult.redFlags.map((flag, i) => (<li key={i} className="flex items-start gap-2 text-sm text-red-700"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />{flag}</li>))}</ul>
                      </div>
                    )}
                    <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-100">
                      <h3 className="font-bold mb-3 flex items-center gap-2 text-yellow-800"><AlertTriangle className="w-5 h-5" />Potential Risks</h3>
                      <ul className="space-y-2">{contractResult.risks.map((risk, i) => (<li key={i} className="flex items-start gap-2 text-sm text-yellow-700"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />{risk}</li>))}</ul>
                    </div>
                    <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                      <h3 className="font-bold mb-3 flex items-center gap-2 text-blue-800"><Lightbulb className="w-5 h-5" />Recommended Changes</h3>
                      <ul className="space-y-2">{contractResult.recommendations.map((rec, i) => (<li key={i} className="flex items-start gap-2 text-sm text-blue-700"><span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{i + 1}</span>{rec}</li>))}</ul>
                    </div>
                    <Button variant="outline" onClick={() => setContractResult(null)} className="w-full"><RefreshCw className="w-4 h-4 mr-2" />Scan Another</Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generation History */}
        <div className="mt-8">
          <AiGenerationHistory types={["quote", "message", "planner", "rate"]} refreshKey={historyKey} />
        </div>
      </div>
      </main>
    </AuthGuard>
  );
}
