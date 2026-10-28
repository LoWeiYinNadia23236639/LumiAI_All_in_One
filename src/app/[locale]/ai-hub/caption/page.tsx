"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, Copy, Download,
  Eye, FileText, Hash, Languages, Loader2, LockKeyhole, MessageSquare,
  Pencil, Plus, RotateCcw, Save, ShieldCheck, Sparkles, Target, Undo2,
  Wand2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth-guard";
import { AiGenerationHistory } from "@/components/ai-generation-history";
import { AiLoadingText } from "@/components/ai-loading-text";
import { useToast } from "@/components/ui/toast";
import { AiAuthError, callGenerate } from "@/lib/ai/client";
import { useLocale, useTranslations } from "next-intl";

interface CaptionResult {
  text: string;
  hashtags: string[];
  emoji: string;
  direction?: string;
  cta?: string;
  disclosure?: string;
}

type WorkflowStep = "brief" | "voice" | "generate" | "edit" | "export";
type Length = "short" | "medium" | "long";
type EmojiLevel = "none" | "light" | "expressive";

interface DraftState {
  content: string;
  experience: string;
  facts: string;
  forbiddenClaims: string;
  audience: string;
  cta: string;
  platform: string;
  outputLanguage: string;
  tone: string;
  length: Length;
  disclosureRequired: boolean;
  disclosure: string;
  hashtagCount: number;
  emojiLevel: EmojiLevel;
  voiceMatching: boolean;
  voiceSamples: string[];
  lockedPhrase: string;
  results: CaptionResult[];
  selected: number;
  edited: CaptionResult | null;
}

const PLATFORMS = [
  { id: "instagram", label: "Instagram", maxLength: 2200 },
  { id: "tiktok", label: "TikTok", maxLength: 2200 },
  { id: "twitter", label: "Twitter / X", maxLength: 280 },
  { id: "linkedin", label: "LinkedIn", maxLength: 3000 },
];
const TONES = ["confident", "playful", "inspiring", "casual", "professional"];
const STEPS: { id: WorkflowStep; icon: typeof FileText }[] = [
  { id: "brief", icon: FileText }, { id: "voice", icon: MessageSquare },
  { id: "generate", icon: Wand2 }, { id: "edit", icon: Pencil },
  { id: "export", icon: Download },
];
const DRAFT_KEY = "lumiai-caption-draft-v2";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-sm font-semibold text-ink mb-2">{label}</span>{hint && <span className="block text-xs text-ink-soft mb-2 leading-relaxed">{hint}</span>}{children}</label>;
}

const inputClass = "w-full px-4 py-3 rounded-xl border border-line bg-paper focus:outline-none focus:ring-2 focus:ring-primary";
const captionText = (caption: CaptionResult) => `${caption.text}${caption.hashtags.length ? `\n\n${caption.hashtags.map((tag) => `#${tag.replace(/^#/, "")}`).join(" ")}` : ""}`;

export default function CaptionAIPage() {
  const t = useTranslations("aiTools");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { success, error: toastError } = useToast();
  const [activeStep, setActiveStep] = useState<WorkflowStep>("brief");
  const [content, setContent] = useState("");
  const [experience, setExperience] = useState("");
  const [facts, setFacts] = useState("");
  const [forbiddenClaims, setForbiddenClaims] = useState("");
  const [audience, setAudience] = useState("");
  const [cta, setCta] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [outputLanguage, setOutputLanguage] = useState(locale);
  const [tone, setTone] = useState("casual");
  const [length, setLength] = useState<Length>("medium");
  const [disclosureRequired, setDisclosureRequired] = useState(false);
  const [disclosure, setDisclosure] = useState("#ad");
  const [hashtagCount, setHashtagCount] = useState(5);
  const [emojiLevel, setEmojiLevel] = useState<EmojiLevel>("light");
  const [voiceMatching, setVoiceMatching] = useState(true);
  const [voiceSamples, setVoiceSamples] = useState(["", ""]);
  const [lockedPhrase, setLockedPhrase] = useState("");
  const [results, setResults] = useState<CaptionResult[]>([]);
  const [selected, setSelected] = useState(0);
  const [edited, setEdited] = useState<CaptionResult | null>(null);
  const [versions, setVersions] = useState<CaptionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const [hasDraft, setHasDraft] = useState(false);

  const wf = (key: string) => t(`captionPage.workflow.${key}`);
  const toneMeta = t.raw("captionPage.tones") as { label: string; desc: string }[];
  const current = edited ?? results[selected] ?? null;
  const currentStep = STEPS.findIndex((step) => step.id === activeStep);
  const platformMeta = PLATFORMS.find((item) => item.id === platform) ?? PLATFORMS[0];
  const directionLabel = (direction?: string) => direction === "story-led" ? wf("storyLed") : direction === "conversation-led" ? wf("conversationLed") : direction === "refined" ? wf("refined") : wf("direct");
  const hasDisclosure = !disclosureRequired || Boolean(current && disclosure.trim() && `${current.text} ${current.hashtags.join(" ")}`.toLowerCase().includes(disclosure.trim().toLowerCase()));
  const overLimit = Boolean(current && current.text.length > platformMeta.maxLength);

  useEffect(() => { setHasDraft(Boolean(localStorage.getItem(DRAFT_KEY))); }, []);

  const goToStep = (step: WorkflowStep) => {
    const index = STEPS.findIndex((item) => item.id === step);
    if (index >= 2 && !results.length) return;
    if (step === "generate" && !content.trim()) return;
    setActiveStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const generationInput = () => ({
    prompt: content, experience, facts, forbiddenClaims, audience, cta,
    platform, tone, outputLanguage, length, disclosureRequired, disclosure,
    hashtagCount, emojiLevel, voiceMatching,
    voiceSamples: voiceMatching ? voiceSamples.filter((sample) => sample.trim()) : [],
    locale,
  });

  const selectCaption = (index: number) => {
    setSelected(index);
    setEdited(null);
    setVersions([]);
    setLockedPhrase("");
  };

  const generate = async () => {
    if (!content.trim() || loading) return;
    setActiveStep("generate");
    setLoading(true);
    setError(false);
    try {
      const data = await callGenerate<{ captions: CaptionResult[] }>("caption", generationInput());
      if (!data.captions?.length) throw new Error("No captions returned");
      setResults(data.captions);
      setSelected(0);
      setEdited(null);
      setVersions([]);
      setLockedPhrase("");
      setHistoryKey((key) => key + 1);
      setActiveStep("edit");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err instanceof AiAuthError) { window.location.href = `/${locale}/login`; return; }
      setError(true);
      toastError(t("generateFailed"));
    } finally { setLoading(false); }
  };

  const refine = async (instruction: string) => {
    if (!current || refining) return;
    setVersions((all) => [...all, current]);
    setRefining(true);
    try {
      const data = await callGenerate<{ captions: CaptionResult[] }>("caption", {
        ...generationInput(), mode: "refine", originalCaption: current.text,
        originalHashtags: current.hashtags, refineInstruction: instruction,
        lockedPhrase: lockedPhrase.trim(),
      });
      const next = data.captions?.[0];
      if (!next) throw new Error("No refined caption returned");
      setEdited({ ...next, direction: "refined" });
      setHistoryKey((key) => key + 1);
    } catch (err) {
      if (err instanceof AiAuthError) { window.location.href = `/${locale}/login`; return; }
      setVersions((all) => all.slice(0, -1));
      toastError(t("generateFailed"));
    } finally { setRefining(false); }
  };

  const updateCurrent = (patch: Partial<CaptionResult>) => {
    if (!current) return;
    setEdited({ ...current, ...patch, direction: current.direction ?? "direct" });
  };

  const undoEdit = () => {
    const previous = versions.at(-1);
    if (!previous) return;
    setEdited(previous);
    setVersions((all) => all.slice(0, -1));
  };

  const fillExample = () => {
    const example = t.raw("examples.caption") as { topic: string };
    setContent(example.topic);
    setExperience("I completed this journey myself and want to share what I learned without promising the same results to others.");
    setAudience("People who want to start a realistic fitness habit");
    setCta("Save this post for when you need a gentle reminder to start");
  };

  const copyCaption = async () => {
    if (!current) return;
    await navigator.clipboard.writeText(captionText(current));
    setCopied(true);
    success(tc("copied"));
    setTimeout(() => setCopied(false), 1600);
  };

  const saveDraft = () => {
    const draft: DraftState = {
      content, experience, facts, forbiddenClaims, audience, cta, platform,
      outputLanguage, tone, length, disclosureRequired, disclosure, hashtagCount,
      emojiLevel, voiceMatching, voiceSamples, lockedPhrase, results, selected, edited,
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setHasDraft(true);
      success(wf("draftSaved"));
    } catch { toastError(wf("saveFailed")); }
  };

  const restoreDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as DraftState;
      setContent(draft.content ?? ""); setExperience(draft.experience ?? "");
      setFacts(draft.facts ?? ""); setForbiddenClaims(draft.forbiddenClaims ?? "");
      setAudience(draft.audience ?? ""); setCta(draft.cta ?? "");
      setPlatform(draft.platform ?? "instagram"); setOutputLanguage(draft.outputLanguage ?? locale);
      setTone(draft.tone ?? "casual"); setLength(draft.length ?? "medium");
      setDisclosureRequired(Boolean(draft.disclosureRequired)); setDisclosure(draft.disclosure ?? "#ad");
      setHashtagCount(draft.hashtagCount ?? 5); setEmojiLevel(draft.emojiLevel ?? "light");
      setVoiceMatching(draft.voiceMatching ?? true); setVoiceSamples(draft.voiceSamples?.length ? draft.voiceSamples : ["", ""]);
      setLockedPhrase(draft.lockedPhrase ?? ""); setResults(draft.results ?? []);
      setSelected(Math.min(draft.selected ?? 0, Math.max((draft.results?.length ?? 1) - 1, 0)));
      setEdited(draft.edited ?? null); setVersions([]);
      setActiveStep(draft.results?.length ? "edit" : "brief");
      success(wf("draftRestored"));
    } catch { toastError(wf("saveFailed")); }
  };

  const downloadCaption = () => {
    if (!current) return;
    const metadata = `${platformMeta.label} · ${directionLabel(current.direction)}\n\n`;
    const url = URL.createObjectURL(new Blob([metadata + captionText(current)], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "LumiAI-caption.txt"; anchor.click();
    URL.revokeObjectURL(url);
  };

  const stepHead = (title: string, description: string) => <div className="mb-7"><h1 className="text-2xl md:text-4xl text-ink mb-3">{title}</h1><p className="text-ink-soft max-w-3xl leading-relaxed">{description}</p></div>;

  return <AuthGuard allowGuests>
    <main className="min-h-screen bg-cream pt-20 pb-16 overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 py-4">
          <Link href="/ai-hub"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />{t("backToAiHub")}</Button></Link>
          <div className="flex items-center gap-3">{hasDraft && <Button variant="ghost" size="sm" onClick={restoreDraft}><RotateCcw className="w-4 h-4" />{wf("restoreDraft")}</Button>}<span className="text-xs uppercase tracking-widest text-ink-soft hidden sm:block">{t("captionKicker")}</span></div>
        </div>

        <nav aria-label="Caption workflow" className="sticky top-16 z-30 bg-paper/95 backdrop-blur-md border border-line rounded-xl mb-9 p-2 flex overflow-x-auto shadow-sm">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const disabled = index >= 2 && !results.length;
            return <button key={step.id} disabled={disabled || (step.id === "generate" && !content.trim())} onClick={() => goToStep(step.id)} aria-current={activeStep === step.id ? "step" : undefined} className={`min-w-max flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors disabled:opacity-35 disabled:cursor-not-allowed ${activeStep === step.id ? "bg-primary text-cream" : index < currentStep ? "text-primary bg-primary-soft/50" : "text-ink-soft hover:bg-cream"}`}><span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] ${activeStep === step.id ? "border-cream/50" : "border-line"}`}>{index < currentStep ? <Check className="w-3 h-3" /> : String(index + 1).padStart(2, "0")}</span><Icon className="w-4 h-4 hidden lg:block" /><span>{wf(step.id)}</span></button>;
          })}
        </nav>

        {activeStep === "brief" && <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {stepHead(wf("briefTitle"), wf("briefDescription"))}
          <div className="grid lg:grid-cols-[minmax(0,1fr)_310px] gap-6 items-start">
            <div className="space-y-5">
              <div className="bg-paper border border-line rounded-xl p-5 md:p-7">
                <div className="flex items-center justify-between gap-3 mb-5"><h2 className="font-bold text-lg"><span className="text-primary font-quote mr-2">01</span>{wf("contentFacts")}</h2><Button variant="ghost" size="sm" onClick={fillExample}><Sparkles className="w-4 h-4" />{tc("exampleButton")}</Button></div>
                <Field label={wf("contentLabel")} hint={wf("contentHint")}><textarea rows={5} className={`${inputClass} resize-none`} value={content} onChange={(event) => setContent(event.target.value)} placeholder={wf("contentPlaceholder")} /></Field>
                <div className="mt-5"><Field label={wf("experienceLabel")} hint={wf("experienceHint")}><textarea rows={3} className={`${inputClass} resize-none`} value={experience} onChange={(event) => setExperience(event.target.value)} placeholder={wf("experiencePlaceholder")} /></Field></div>
                <div className="grid md:grid-cols-2 gap-4 mt-5"><Field label={wf("factsLabel")}><textarea rows={3} className={`${inputClass} resize-none`} value={facts} onChange={(event) => setFacts(event.target.value)} placeholder={wf("factsPlaceholder")} /></Field><Field label={wf("claimsLabel")}><textarea rows={3} className={`${inputClass} resize-none`} value={forbiddenClaims} onChange={(event) => setForbiddenClaims(event.target.value)} placeholder={wf("claimsPlaceholder")} /></Field></div>
              </div>
              <div className="bg-paper border border-line rounded-xl p-5 md:p-7 space-y-5">
                <h2 className="font-bold text-lg"><span className="text-primary font-quote mr-2">02</span>{wf("publishingNeeds")}</h2>
                <div className="grid md:grid-cols-2 gap-4"><Field label={wf("audienceLabel")}><div className="relative"><Target className="w-4 h-4 absolute left-4 top-4 text-primary" /><input className={`${inputClass} pl-11`} value={audience} onChange={(event) => setAudience(event.target.value)} placeholder={wf("audiencePlaceholder")} /></div></Field><Field label={wf("ctaLabel")}><input className={inputClass} value={cta} onChange={(event) => setCta(event.target.value)} placeholder={wf("ctaPlaceholder")} /></Field></div>
                <Field label={wf("platformLabel")}><div className="grid grid-cols-2 md:grid-cols-4 gap-2">{PLATFORMS.map((item) => <button type="button" key={item.id} aria-pressed={platform === item.id} onClick={() => setPlatform(item.id)} className={`px-3 py-3 rounded-xl border text-sm font-medium ${platform === item.id ? "bg-primary text-cream border-primary" : "border-line hover:border-primary/50"}`}>{item.label}</button>)}</div></Field>
                <div className="grid md:grid-cols-3 gap-4"><Field label={wf("languageLabel")}><div className="relative"><Languages className="w-4 h-4 absolute left-4 top-4 text-primary" /><select className={`${inputClass} pl-11`} value={outputLanguage} onChange={(event) => setOutputLanguage(event.target.value)}><option value="en">{wf("english")}</option><option value="zh-hk">{wf("traditionalChinese")}</option><option value="zh-cn">{wf("simplifiedChinese")}</option></select></div></Field><Field label={wf("lengthLabel")}><select className={inputClass} value={length} onChange={(event) => setLength(event.target.value as Length)}><option value="short">{wf("short")}</option><option value="medium">{wf("medium")}</option><option value="long">{wf("long")}</option></select></Field><Field label={wf("emojiLabel")}><select className={inputClass} value={emojiLevel} onChange={(event) => setEmojiLevel(event.target.value as EmojiLevel)}><option value="none">{wf("emojiNone")}</option><option value="light">{wf("emojiLight")}</option><option value="expressive">{wf("emojiExpressive")}</option></select></Field></div>
                <div className="grid md:grid-cols-2 gap-4 items-end"><Field label={wf("hashtagLabel")} hint={wf("hashtagHint")}><div className="flex items-center gap-4"><input aria-label={wf("hashtagLabel")} type="range" min="0" max="10" value={hashtagCount} onChange={(event) => setHashtagCount(Number(event.target.value))} className="flex-1 accent-[#173F35]" /><span className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center font-bold">{hashtagCount}</span></div></Field><Field label={wf("disclosureLabel")} hint={wf("disclosureHint")}><div className="flex gap-2"><button type="button" aria-pressed={disclosureRequired} onClick={() => setDisclosureRequired(!disclosureRequired)} className={`shrink-0 px-3 py-3 rounded-xl border text-sm ${disclosureRequired ? "bg-primary text-cream border-primary" : "border-line"}`}>{disclosureRequired ? wf("required") : wf("optional")}</button><input aria-label={wf("disclosureLabel")} className={inputClass} value={disclosure} onChange={(event) => setDisclosure(event.target.value)} disabled={!disclosureRequired} /></div></Field></div>
              </div>
            </div>
            <aside className="bg-paper border border-line rounded-xl p-6 lg:sticky lg:top-44">
              <FileText className="w-6 h-6 text-primary mb-3" /><h2 className="text-xl font-bold mb-2">{wf("planTitle")}</h2><p className="text-sm text-ink-soft mb-5">{wf("planDescription")}</p>
              <dl className="space-y-4 text-sm border-t border-line pt-5"><div><dt className="text-[10px] uppercase tracking-widest text-ink-soft mb-1">{wf("output")}</dt><dd>3 {wf("directions")} · {platformMeta.label}</dd></div><div><dt className="text-[10px] uppercase tracking-widest text-ink-soft mb-1">{wf("factGuardrail")}</dt><dd>{wf("factGuardrailValue")}</dd></div><div><dt className="text-[10px] uppercase tracking-widest text-ink-soft mb-1">{wf("creatorControl")}</dt><dd>{wf("creatorControlValue")}</dd></div></dl>
              <Button className="w-full mt-6" onClick={() => goToStep("voice")} disabled={!content.trim()}>{wf("continueVoice")}<ArrowRight className="w-4 h-4" /></Button>{!content.trim() && <p className="text-[11px] text-ink-soft text-center mt-3">{wf("needContent")}</p>}
            </aside>
          </div>
        </motion.section>}

        {activeStep === "voice" && <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {stepHead(wf("voiceTitle"), wf("voiceDescription"))}
          <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
            <div className="space-y-5">
              <div className="bg-paper border border-line rounded-xl p-5 md:p-7"><Field label={wf("toneLabel")} hint={wf("toneHint")}><div className="grid grid-cols-2 md:grid-cols-5 gap-3">{TONES.map((id, index) => <button type="button" key={id} aria-pressed={tone === id} onClick={() => setTone(id)} className={`p-4 rounded-xl border text-left ${tone === id ? "border-primary bg-primary-soft" : "border-line hover:border-primary/50"}`}><strong className="block text-sm mb-1">{toneMeta[index].label}</strong><span className="text-xs text-ink-soft">{toneMeta[index].desc}</span></button>)}</div></Field></div>
              <div className="bg-paper border border-line rounded-xl p-5 md:p-7">
                <div className="flex items-start justify-between gap-4 mb-5"><div><h2 className="font-bold text-lg mb-2">{wf("samplesTitle")}</h2><p className="text-sm text-ink-soft">{wf("samplesDescription")}</p></div><button type="button" aria-pressed={voiceMatching} onClick={() => setVoiceMatching(!voiceMatching)} className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${voiceMatching ? "bg-primary" : "bg-gray-300"}`} aria-label={wf("voiceMatchLabel")}><span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${voiceMatching ? "left-6" : "left-1"}`} /></button></div>
                {voiceMatching ? <><div className="space-y-4">{voiceSamples.map((sample, index) => <div key={index} className="relative"><Field label={`${wf("sampleLabel")} ${index + 1}`}><textarea rows={3} className={`${inputClass} resize-none pr-11`} value={sample} onChange={(event) => setVoiceSamples((all) => all.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} placeholder={wf("samplePlaceholder")} /></Field>{voiceSamples.length > 1 && <button type="button" onClick={() => setVoiceSamples((all) => all.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-3 top-9 text-ink-soft hover:text-red-600" aria-label={wf("removeSample")}><X className="w-4 h-4" /></button>}</div>)}</div>{voiceSamples.length < 3 && <Button variant="ghost" size="sm" className="mt-3" onClick={() => setVoiceSamples((all) => [...all, ""])}><Plus className="w-4 h-4" />{wf("addSample")}</Button>}<p className="text-xs text-ink-soft mt-4 flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-primary shrink-0" />{wf("voicePrivacy")}</p></> : <div className="p-5 rounded-xl bg-cream text-sm text-ink-soft">{wf("voiceOff")}</div>}
              </div>
            </div>
            <aside className="bg-paper border border-line rounded-xl p-6 lg:sticky lg:top-44"><Sparkles className="w-6 h-6 text-primary mb-3" /><h2 className="text-xl font-bold mb-2">{wf("readyToGenerate")}</h2><p className="text-sm text-ink-soft mb-5">{wf("readyToGenerateDesc")}</p><div className="bg-primary-soft/60 rounded-lg p-4 text-sm space-y-2 mb-5"><p className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" />{wf("threeDirections")}</p><p className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" />{wf("editableResults")}</p><p className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" />{wf("noAutoPublish")}</p></div><Button className="w-full" onClick={generate} disabled={!content.trim() || loading}><Wand2 className="w-4 h-4" />{t("captionPage.generate")}<ArrowRight className="w-4 h-4" /></Button></aside>
          </div>
          <div className="flex items-center justify-between gap-3 mt-8 pt-5 border-t border-line"><Button variant="ghost" onClick={() => goToStep("brief")}><ArrowLeft className="w-4 h-4" />{wf("previous")}</Button><Button onClick={generate} disabled={!content.trim() || loading}><Wand2 className="w-4 h-4" />{t("captionPage.generate")}<ArrowRight className="w-4 h-4" /></Button></div>
        </motion.section>}

        {activeStep === "generate" && <section className="max-w-3xl mx-auto py-8">{stepHead(wf("generateTitle"), wf("generateDescription"))}<div className="bg-paper border border-line rounded-xl p-8 text-center"><div className="w-16 h-16 rounded-full bg-primary-soft text-primary flex items-center justify-center mx-auto mb-5">{loading ? <Loader2 className="w-8 h-8 animate-spin" /> : results.length ? <CheckCircle2 className="w-8 h-8" /> : <Wand2 className="w-8 h-8" />}</div><h2 className="text-2xl font-bold mb-3">{loading ? wf("generatingTitle") : results.length ? wf("resultReady") : wf("generateTitle")}</h2><p className="text-ink-soft mb-6">{loading ? wf("generatingDescription") : content}</p>{loading && <div className="bg-primary-soft rounded-lg text-left"><AiLoadingText toolKey="caption" /></div>}{error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm"><AlertCircle className="w-5 h-5 inline mr-2" />{wf("errorPreserved")}<Button className="ml-3" size="sm" variant="outline" onClick={generate}>{t("retry")}</Button></div>}<div className="flex justify-center gap-3 flex-wrap"><Button variant="ghost" onClick={() => goToStep("voice")} disabled={loading}>{wf("backToVoice")}</Button>{results.length > 0 && <Button onClick={() => goToStep("edit")}>{wf("viewResults")}<ArrowRight className="w-4 h-4" /></Button>}</div></div></section>}

        {activeStep === "edit" && current && <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {stepHead(wf("editTitle"), wf("editDescription"))}
          <div className="grid md:grid-cols-3 gap-3 mb-6">{results.map((caption, index) => <button type="button" key={`${caption.direction}-${index}`} onClick={() => selectCaption(index)} className={`text-left p-4 rounded-xl border bg-paper ${selected === index ? "border-primary ring-2 ring-primary/15" : "border-line hover:border-primary/50"}`}><div className="flex items-center justify-between gap-2 mb-2"><span className="font-semibold text-primary">{directionLabel(caption.direction)}</span>{selected === index && <CheckCircle2 className="w-5 h-5 text-primary" />}</div><p className="text-sm text-ink-soft line-clamp-3">{caption.text}</p><span className="text-xs text-ink-soft block mt-3">{caption.text.length} {wf("characters")}</span></button>)}</div>
          <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-6 items-start">
            <div className="space-y-5">
              <div className="bg-paper border border-line rounded-xl p-5 md:p-7"><div className="flex items-center justify-between gap-3 mb-4"><h2 className="font-bold text-lg">{wf("editorLabel")}</h2><span className={`text-xs font-semibold ${overLimit ? "text-red-600" : "text-ink-soft"}`}>{current.text.length} / {platformMeta.maxLength} {wf("characters")}</span></div><textarea rows={9} className={`${inputClass} resize-y leading-relaxed`} value={current.text} onChange={(event) => updateCurrent({ text: event.target.value })} /><div className="mt-5"><div className="flex items-center gap-2 mb-3"><Hash className="w-4 h-4 text-primary" /><h3 className="text-sm font-semibold">{wf("hashtagsLabel")}</h3></div><div className="flex flex-wrap gap-2">{current.hashtags.map((tag, index) => <button type="button" key={`${tag}-${index}`} onClick={() => updateCurrent({ hashtags: current.hashtags.filter((_, itemIndex) => itemIndex !== index) })} className="group px-3 py-1.5 bg-cream rounded-lg text-sm flex items-center gap-2" title={wf("removeHashtag")}>#{tag.replace(/^#/, "")}<X className="w-3 h-3 text-ink-soft group-hover:text-red-600" /></button>)}{!current.hashtags.length && <span className="text-sm text-ink-soft">{wf("noHashtags")}</span>}</div></div></div>
              <div className="bg-paper border border-line rounded-xl p-5 md:p-7"><h2 className="font-bold text-lg mb-2">{wf("refineTitle")}</h2><p className="text-sm text-ink-soft mb-4">{wf("refineDescription")}</p><Field label={wf("lockLabel")} hint={wf("lockHint")}><div className="relative"><LockKeyhole className="w-4 h-4 absolute left-4 top-4 text-primary" /><input className={`${inputClass} pl-11`} value={lockedPhrase} onChange={(event) => setLockedPhrase(event.target.value)} placeholder={wf("lockPlaceholder")} /></div></Field><div className="flex flex-wrap gap-2 mt-4"><Button variant="outline" size="sm" disabled={refining} onClick={() => refine("Make the caption meaningfully shorter while preserving the key facts, voice and call to action.")}><Pencil className="w-4 h-4" />{wf("makeShorter")}</Button><Button variant="outline" size="sm" disabled={refining} onClick={() => refine("Reduce formality and make the caption sound more natural and conversational without adding slang the creator did not use.")}><MessageSquare className="w-4 h-4" />{wf("lessFormal")}</Button><Button variant="outline" size="sm" disabled={refining} onClick={() => refine(`Rewrite only the call to action around this goal: ${cta || "encourage a natural audience response"}. Keep the rest as close as possible.`)}><Target className="w-4 h-4" />{wf("changeCta")}</Button>{refining && <span className="text-sm text-primary flex items-center gap-2 px-2"><Loader2 className="w-4 h-4 animate-spin" />{wf("refining")}</span>}</div><div className="flex gap-2 mt-4"><Button variant="ghost" size="sm" disabled={!versions.length || refining} onClick={undoEdit}><Undo2 className="w-4 h-4" />{wf("undo")}</Button><Button variant="ghost" size="sm" disabled={!edited || refining} onClick={() => { setEdited(null); setVersions([]); }}><RotateCcw className="w-4 h-4" />{wf("restoreOriginal")}</Button></div></div>
            </div>
            <aside className="space-y-5 lg:sticky lg:top-44">
              <div className="bg-paper border border-line rounded-xl p-5"><div className="flex items-center gap-2 mb-4"><Eye className="w-5 h-5 text-primary" /><h2 className="font-semibold">{wf("previewLabel")}</h2></div><div className="border border-line rounded-xl p-4 bg-cream"><div className="flex items-center gap-3 mb-4"><div className="w-9 h-9 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold">Y</div><div><p className="text-sm font-semibold">your_handle</p><p className="text-xs text-ink-soft">{platformMeta.label}</p></div></div><div className="bg-paper h-36 rounded-lg mb-4 flex items-center justify-center text-ink-soft"><Eye className="w-7 h-7" /></div><p className="text-sm whitespace-pre-wrap max-h-56 overflow-y-auto">{captionText(current)}</p></div></div>
              <div className="bg-paper border border-line rounded-xl p-5"><h2 className="font-semibold mb-4">{wf("checksTitle")}</h2><div className="space-y-3 text-sm"><p className={`flex items-start gap-2 ${hasDisclosure ? "text-primary" : "text-red-600"}`}>{hasDisclosure ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}{!disclosureRequired ? wf("disclosureNotRequired") : hasDisclosure ? wf("disclosureOk") : wf("disclosureMissing")}</p><p className="flex items-start gap-2 text-primary"><CheckCircle2 className="w-4 h-4 shrink-0" />{current.cta || !cta ? wf("ctaOk") : wf("ctaReview")}</p><p className={`flex items-start gap-2 ${overLimit ? "text-red-600" : "text-primary"}`}>{overLimit ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}{overLimit ? wf("lengthOver") : wf("lengthOk")}</p><p className="text-xs text-ink-soft border-t border-line pt-3">{wf("verifyFacts")}</p></div></div>
              <Button className="w-full" onClick={() => goToStep("export")} disabled={!hasDisclosure}>{wf("continueExport")}<ArrowRight className="w-4 h-4" /></Button>{!hasDisclosure && <p className="text-xs text-red-600 text-center">{wf("addDisclosure")}</p>}
            </aside>
          </div>
        </motion.section>}

        {activeStep === "export" && current && <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {stepHead(wf("exportTitle"), wf("exportDescription"))}
          <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-6 items-start"><div className="space-y-5"><div className="bg-primary text-cream rounded-xl p-6"><CheckCircle2 className="w-8 h-8 mb-4" /><h2 className="text-2xl font-bold">{wf("readyTitle")}</h2><p className="text-cream/80 mt-2">{wf("readyDescription")}</p></div><div className="bg-paper border border-line rounded-xl p-6"><div className="flex items-center justify-between gap-3 mb-4"><h2 className="font-semibold">{wf("finalCaption")}</h2><span className="text-xs px-3 py-1 bg-primary-soft text-primary rounded-full">{directionLabel(current.direction)}</span></div><p className="whitespace-pre-wrap leading-relaxed">{captionText(current)}</p></div></div><aside className="bg-paper border border-line rounded-xl p-5 space-y-3 lg:sticky lg:top-44"><h2 className="font-bold text-lg mb-3">{wf("exportActions")}</h2><Button className="w-full" onClick={copyCaption}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? tc("copied") : tc("copy")}</Button><Button variant="outline" className="w-full" onClick={downloadCaption}><Download className="w-4 h-4" />{wf("downloadTxt")}</Button><Button variant="outline" className="w-full" onClick={saveDraft}><Save className="w-4 h-4" />{wf("saveDraft")}</Button><Button variant="ghost" className="w-full" onClick={() => goToStep("edit")}><Pencil className="w-4 h-4" />{wf("backToEdit")}</Button><p className="text-xs text-ink-soft text-center border-t border-line pt-4">{wf("nothingPublished")}</p></aside></div>
          <div className="mt-8"><Button variant="ghost" onClick={generate} disabled={loading}><RotateCcw className="w-4 h-4" />{wf("generateNewSet")}</Button></div>
        </motion.section>}

        {activeStep === "brief" && <div className="mt-10"><div className="flex items-baseline gap-2 mb-3"><span className="uppercase tracking-widest text-xs text-ink-soft">{t("archiveLabel")} —</span><h3 className="font-quote text-lg text-ink">{t("historyTitle")}</h3></div><div className="[&_div:has(>h3)]:hidden"><AiGenerationHistory types={["caption"]} refreshKey={historyKey} /></div></div>}
      </div>
    </main>
  </AuthGuard>;
}
