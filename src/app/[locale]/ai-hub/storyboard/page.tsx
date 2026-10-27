"use client";

/* Scene previews are user-generated Supabase URLs with dynamic dimensions. */
/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Image as ImageIcon, ArrowLeft, ArrowRight, Wand2, Loader2, Camera, Sun, Download,
  Copy, CheckCircle, Lightbulb, Play, Sparkles, Check, ChevronDown,
  ChevronUp, AlertCircle, Film, Square, FileText, Layers3, Pencil,
  RefreshCw, Upload, Settings, ShieldCheck, Info, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth-guard";
import { AiGenerationHistory } from "@/components/ai-generation-history";
import { AiLoadingText } from "@/components/ai-loading-text";
import { useToast } from "@/components/ui/toast";
import { callGenerate, AiAuthError } from "@/lib/ai/client";
import { useTranslations, useLocale } from "next-intl";

interface Scene {
  scene_number: number;
  description: string;
  shot_angle: string;
  lighting: string;
}

interface StoryboardResult {
  scenes: Scene[];
  equipment_checklist: string[];
  pro_tips: string[];
}

const examples = [
  { title: "Morning Skincare Routine", prompt: "A relaxing morning skincare routine showing a person waking up refreshed, washing their face, applying serum and moisturizer, ending with a glowing skin close-up. 30 seconds total.", description: "Perfect for beauty influencers showcasing products" },
  { title: "Unboxing Video", prompt: "An exciting unboxing of a new tech gadget. Show the package arriving, opening the box layer by layer, revealing the product, and first impressions. 45 seconds.", description: "Great for tech reviewers and product showcases" },
  { title: "Recipe Tutorial", prompt: "Quick 15-minute pasta recipe. Show ingredients laid out, cooking process with close-ups of each step, plating the final dish. Include top-down shots of chopping. 60 seconds.", description: "Ideal for food creators and cooking channels" },
  { title: "Workout Routine", prompt: "5-minute morning stretch and workout routine. Start in bed stretching, transition to yoga mat, show 3-4 exercises with modifications, end with energized feeling. 45 seconds.", description: "Perfect for fitness and wellness creators" },
];

type Aspect = "16:9" | "9:16" | "3:4" | "4:3";
type Platform = (typeof PLATFORMS)[number];
type VideoMode = "animatic" | "ai";
type WorkflowStep = "brief" | "generate" | "board" | "text" | "refine" | "export";
type RefineScope = "image" | "action" | "full";
type OverlayPosition = "top" | "center" | "bottom";
interface TextSpace { text: string; position: OverlayPosition; visible: boolean }

const ASPECTS: Aspect[] = ["16:9", "9:16", "3:4", "4:3"];
const PLATFORMS = ["general", "youtube", "tiktok", "instagram_reels", "instagram_feed", "xiaohongshu"] as const;
const PLATFORM_ASPECT: Record<Platform, Aspect> = { general: "16:9", youtube: "16:9", tiktok: "9:16", instagram_reels: "9:16", instagram_feed: "4:3", xiaohongshu: "3:4" };
const SCENE_SECONDS_OPTIONS = [1, 1.5, 2, 2.5, 3, 4, 5];
const MINUTE_OPTIONS = Array.from({ length: 16 }, (_, minutes) => minutes);
const SECOND_OPTIONS = Array.from({ length: 60 }, (_, seconds) => seconds);
const OMNI_CLIP_SECONDS = 10;
const OMNI_RATE_PER_SECOND = 0.1;
const WORKFLOW_STEPS: { id: WorkflowStep; icon: typeof FileText }[] = [
  { id: "brief", icon: FileText }, { id: "generate", icon: Wand2 },
  { id: "board", icon: Layers3 }, { id: "text", icon: Pencil },
  { id: "refine", icon: RefreshCw }, { id: "export", icon: Upload },
];
const aspectStyle = (a: Aspect) => ({ aspectRatio: a.replace(":", "/") });

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-sm font-semibold text-ink mb-2">{label}</span>{hint && <span className="block text-xs text-ink-soft mb-2 leading-relaxed">{hint}</span>}{children}</label>;
}

export default function StoryboardAIPage() {
  const t = useTranslations("aiTools");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { success, error: toastError, info: toastInfo } = useToast();
  const [activeStep, setActiveStep] = useState<WorkflowStep>("brief");
  const [purpose, setPurpose] = useState<"shoot" | "pitch">("shoot");
  const [prompt, setPrompt] = useState("");
  const [mood, setMood] = useState("");
  const [creatorProfile, setCreatorProfile] = useState("");
  const [creatorMode, setCreatorMode] = useState<"describe" | "photo">("describe");
  const [creatorReferenceUrl, setCreatorReferenceUrl] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [setup, setSetup] = useState("");
  const [guardrails, setGuardrails] = useState("");
  const [disclosure, setDisclosure] = useState("#ad");
  const [totalSeconds, setTotalSeconds] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<StoryboardResult | null>(null);
  const [historyKey, setHistoryKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copiedScene, setCopiedScene] = useState<number | null>(null);
  const [copiedLists, setCopiedLists] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [showExamples, setShowExamples] = useState(false);
  const [sceneImages, setSceneImages] = useState<Record<number, string>>({});
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});
  const [generatingAll, setGeneratingAll] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [aspect, setAspect] = useState<Aspect>("16:9");
  const [platform, setPlatform] = useState<Platform>("general");
  const [sceneSeconds, setSceneSeconds] = useState(2.5);
  const [videoMode, setVideoMode] = useState<VideoMode>("animatic");
  const [clipProgress, setClipProgress] = useState<{ current: number; total: number } | null>(null);
  const [selectedScene, setSelectedScene] = useState(1);
  const [textSpaces, setTextSpaces] = useState<Record<number, TextSpace>>({});
  const [refineScope, setRefineScope] = useState<RefineScope>("action");
  const [refineNote, setRefineNote] = useState("");
  const [refineOriginals, setRefineOriginals] = useState<Record<number, string>>({});
  const abortAiVideo = useRef(false);
  const example = t.raw("examples.storyboard") as { idea: string; mood: string };
  const storyboardTips = t.raw("storyboardPage.tips") as { title: string; content: string }[];
  const currentStep = WORKFLOW_STEPS.findIndex((step) => step.id === activeStep);
  const activeScene = result?.scenes.find((scene) => scene.scene_number === selectedScene) || result?.scenes[0];
  const activeTextSpace = textSpaces[selectedScene] || { text: "", position: "bottom" as OverlayPosition, visible: true };

  const goToStep = (step: WorkflowStep) => {
    const index = WORKFLOW_STEPS.findIndex((item) => item.id === step);
    if (index >= 2 && !result) return;
    if (step === "generate" && !prompt.trim()) return;
    setActiveStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const generate = async () => {
    if (!prompt.trim() || loading) return;
    setActiveStep("generate");
    setLoading(true);
    setError(false);
    const structuredPrompt = [
      prompt,
      `Purpose: ${purpose === "shoot" ? "practical solo shoot plan" : "visual brand pitch"}.`,
      `Target total duration: ${totalSeconds} seconds. Publishing platform: ${platform}.`,
      creatorMode === "describe" && creatorProfile.trim() && `Recurring creator identity (must stay identical in every scene): ${creatorProfile.trim()}.`,
      creatorMode === "photo" && creatorReferenceUrl && "Use the single creator from the uploaded identity photo in every scene; never substitute another person.",
      setup.trim() && `Real-world filming setup: ${setup.trim()}.`,
      guardrails.trim() && `Creative guardrails: ${guardrails.trim()}.`,
      disclosure.trim() && `Sponsorship disclosure to include: ${disclosure.trim()}.`,
      "Use clearly differentiated shot angles and compositions. Keep the creator, product, location and visual language consistent across scenes.",
    ].filter(Boolean).join("\n");
    try {
      const data = await callGenerate<StoryboardResult>("storyboard", { prompt: structuredPrompt, mood, locale });
      setResult(data);
      setSelectedScene(data.scenes[0]?.scene_number || 1);
      setSceneImages({});
      setTextSpaces({});
      setRefineOriginals({});
      setVideoUrl(null);
      setHistoryKey((key) => key + 1);
      setActiveStep("board");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err instanceof AiAuthError) { window.location.href = `/${locale}/login`; return; }
      setError(true);
      toastError(t("generateFailed"));
    } finally { setLoading(false); }
  };

  const loadExample = (examplePrompt: string) => { setPrompt(examplePrompt); setShowExamples(false); };
  const fillExample = () => { setPrompt(example.idea); setMood(example.mood); };

  const postVisual = async <T,>(api: string, payload: unknown): Promise<T> => {
    const supabase = (await import("@/lib/supabase/client")).getSupabaseClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new AiAuthError("Not signed in");
    const res = await fetch(api, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
    if (res.status === 401) throw new AiAuthError("Session expired");
    const body = await res.json();
    if (!res.ok) throw new Error(body.detail || body.error || "Request failed");
    return body as T;
  };

  const resetGeneratedImages = () => { setSceneImages({}); setRefineOriginals({}); setVideoUrl(null); };
  const selectCreatorMode = (mode: "describe" | "photo") => {
    if (mode === creatorMode) return;
    setCreatorMode(mode);
    resetGeneratedImages();
  };
  const uploadCreatorPhoto = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { toastError(wf("photoTypeError")); return; }
    if (file.size > 8 * 1024 * 1024) { toastError(wf("photoTooLarge")); return; }
    setPhotoUploading(true);
    try {
      const supabase = (await import("@/lib/supabase/client")).getSupabaseClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new AiAuthError("Not signed in");
      const form = new FormData(); form.append("photo", file);
      const response = await fetch("/api/ai/identity-reference", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
      if (response.status === 401) throw new AiAuthError("Session expired");
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Upload failed");
      setCreatorReferenceUrl(body.url);
      resetGeneratedImages();
      success(wf("uploadCreator"));
    } catch (err) {
      if (err instanceof AiAuthError) { window.location.href = `/${locale}/login`; return; }
      toastError(wf("photoUploadFailed"));
    } finally { setPhotoUploading(false); }
  };

  const changeAspect = (next: Aspect) => {
    if (next === aspect) return;
    setAspect(next);
    if (Object.keys(sceneImages).length > 0 || videoUrl) {
      setSceneImages({}); setVideoUrl(null); setRefineOriginals({});
      toastInfo(t("storyboardPage.formatChanged"));
    }
  };
  const changePlatform = (next: Platform) => { setPlatform(next); changeAspect(PLATFORM_ASPECT[next]); };

  const generateSceneImage = async (scene: Scene, refinement?: { note: string; scope: RefineScope }, referenceAnchor?: string): Promise<string | null> => {
    if (imageLoading[scene.scene_number] || !result) return null;
    if (refinement && sceneImages[scene.scene_number]) setRefineOriginals((all) => ({ ...all, [scene.scene_number]: sceneImages[scene.scene_number] }));
    const firstSceneNumber = result.scenes[0]?.scene_number;
    const otherSceneImage = Object.entries(sceneImages).find(([sceneNumber]) => Number(sceneNumber) !== scene.scene_number)?.[1];
    const uploadedIdentity = creatorMode === "photo" ? creatorReferenceUrl : "";
    const referenceImage = uploadedIdentity || (refinement
      ? sceneImages[scene.scene_number]
      : referenceAnchor || sceneImages[firstSceneNumber] || otherSceneImage);
    setImageLoading((all) => ({ ...all, [scene.scene_number]: true }));
    try {
      const { url } = await postVisual<{ url: string }>("/api/ai/scene-image", {
        scene_number: scene.scene_number, description: scene.description,
        shot_angle: scene.shot_angle, lighting: scene.lighting, mood, aspect,
        creator_profile: creatorMode === "describe" ? creatorProfile : "",
        reference_image_url: referenceImage,
        refinement_note: refinement?.note, refinement_scope: refinement?.scope,
      });
      setSceneImages((all) => ({ ...all, [scene.scene_number]: url }));
      setVideoUrl(null);
      return url;
    } catch (err) {
      if (err instanceof AiAuthError) { window.location.href = `/${locale}/login`; return null; }
      const detail = err instanceof Error ? err.message : String(err);
      toastError(t("storyboardPage.imageFailedDetail", { detail: detail.slice(0, 160) }));
      return null;
    } finally { setImageLoading((all) => ({ ...all, [scene.scene_number]: false })); }
  };

  const generateAllImages = async () => {
    if (!result || generatingAll) return;
    setGeneratingAll(true);
    const uploadedIdentity = creatorMode === "photo" ? creatorReferenceUrl : "";
    let identityAnchor = uploadedIdentity || sceneImages[result.scenes[0]?.scene_number] || Object.values(sceneImages)[0] || "";
    try {
      for (const scene of result.scenes) {
        if (sceneImages[scene.scene_number]) continue;
        const url = await generateSceneImage(scene, undefined, identityAnchor);
        if (!identityAnchor && url) identityAnchor = url;
      }
    } finally { setGeneratingAll(false); }
  };

  const generateVideo = async () => {
    if (!result || videoLoading) return;
    if (result.scenes.some((scene) => !sceneImages[scene.scene_number])) { toastError(t("storyboardPage.needAllImages")); return; }
    setVideoLoading(true);
    try {
      const { url } = await postVisual<{ url: string }>("/api/ai/storyboard-video", { images: result.scenes.map((scene) => ({ url: sceneImages[scene.scene_number], scene_number: scene.scene_number })), aspect, seconds_per_scene: sceneSeconds });
      setVideoUrl(url); success(t("storyboardPage.videoReady"));
    } catch (err) {
      if (err instanceof AiAuthError) { window.location.href = `/${locale}/login`; return; }
      const detail = err instanceof Error ? err.message : String(err);
      toastError(t("storyboardPage.videoFailedDetail", { detail: detail.slice(0, 160) }));
    } finally { setVideoLoading(false); }
  };

  const generateAiVideo = async () => {
    if (!result || videoLoading) return;
    if (result.scenes.some((scene) => !sceneImages[scene.scene_number])) { toastError(t("storyboardPage.needAllImages")); return; }
    setVideoLoading(true); abortAiVideo.current = false;
    try {
      const clipUrls: string[] = [];
      for (let i = 0; i < result.scenes.length; i++) {
        if (abortAiVideo.current) { toastInfo(t("storyboardPage.aiVideoCancelled")); return; }
        const scene = result.scenes[i]; setClipProgress({ current: i + 1, total: result.scenes.length });
        const { url } = await postVisual<{ url: string }>("/api/ai/scene-video", { scene_number: scene.scene_number, description: scene.description, shot_angle: scene.shot_angle, mood, image_url: sceneImages[scene.scene_number] });
        if (abortAiVideo.current) { toastInfo(t("storyboardPage.aiVideoCancelled")); return; }
        clipUrls.push(url);
      }
      setClipProgress(null);
      const { url } = await postVisual<{ url: string }>("/api/ai/storyboard-video", { mode: "clips", clips: clipUrls, aspect, transitions: true });
      setVideoUrl(url); success(t("storyboardPage.videoReady"));
    } catch (err) {
      if (err instanceof AiAuthError) { window.location.href = `/${locale}/login`; return; }
      const detail = err instanceof Error ? err.message : String(err);
      toastError(t("storyboardPage.clipFailedDetail", { detail: detail.slice(0, 160) }));
    } finally { setVideoLoading(false); setClipProgress(null); }
  };

  const copyToClipboard = async () => {
    if (!result) return;
    const text = `${prompt}\n\n${result.scenes.map((scene) => `${t("storyboardPage.copyScenePrefix")} ${scene.scene_number}: ${scene.shot_angle}\n${t("storyboardPage.actionLabel")} ${scene.description}\n${t("storyboardPage.lightingLabel")} ${scene.lighting}\n${t("storyboardPage.workflow.overlayLabel")} ${textSpaces[scene.scene_number]?.text || "—"}`).join("\n\n")}\n\n${t("storyboardPage.equipmentLabel")} ${result.equipment_checklist.join(", ")}`;
    await navigator.clipboard.writeText(text); setCopied(true); success(tc("copied")); setTimeout(() => setCopied(false), 2000);
  };
  const copyScene = async (scene: Scene) => {
    await navigator.clipboard.writeText(`${t("storyboardPage.copyScenePrefix")} ${scene.scene_number}: ${scene.shot_angle}\n${scene.description}\n${t("storyboardPage.lightingLabel")} ${scene.lighting}`);
    setCopiedScene(scene.scene_number); success(tc("copied")); setTimeout(() => setCopiedScene(null), 1500);
  };
  const copyLists = async () => {
    if (!result) return;
    await navigator.clipboard.writeText([`${t("storyboardPage.equipmentLabel")} ${result.equipment_checklist.join(", ")}`, result.pro_tips.length ? `${t("storyboardPage.tipsLabel")}\n${result.pro_tips.map((tip) => `- ${tip}`).join("\n")}` : ""].filter(Boolean).join("\n\n"));
    setCopiedLists(true); success(tc("copied")); setTimeout(() => setCopiedLists(false), 1500);
  };
  const downloadCsv = () => {
    if (!result) return;
    const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const rows = ["Scene,Shot angle,Action,Lighting,On-screen text", ...result.scenes.map((scene) => [scene.scene_number, scene.shot_angle, scene.description, scene.lighting, textSpaces[scene.scene_number]?.text || ""].map(escape).join(","))];
    const url = URL.createObjectURL(new Blob(["\ufeff" + rows.join("\n")], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "LumiAI-shot-list.csv"; anchor.click(); URL.revokeObjectURL(url);
    success(t("storyboardPage.workflow.csv"));
  };
  const updateTextSpace = (patch: Partial<TextSpace>) => setTextSpaces((all) => ({ ...all, [selectedScene]: { ...activeTextSpace, ...patch } }));
  const restoreRefine = () => {
    const original = refineOriginals[selectedScene]; if (!original) return;
    setSceneImages((all) => ({ ...all, [selectedScene]: original }));
    setRefineOriginals((all) => { const next = { ...all }; delete next[selectedScene]; return next; });
  };
  const printBrief = () => window.print();
  const wf = (key: string) => t(`storyboardPage.workflow.${key}`);
  const stepHead = (title: string, description: string) => <div className="mb-7"><h2 className="text-2xl md:text-3xl text-ink mb-2">{title}</h2><p className="text-ink-soft max-w-2xl leading-relaxed">{description}</p></div>;
  const footer = (back: WorkflowStep, next: WorkflowStep, nextLabel: string) => <div className="flex items-center justify-between gap-3 mt-8 pt-5 border-t border-line"><Button variant="ghost" onClick={() => goToStep(back)}><ArrowLeft className="w-4 h-4" />{wf("previous")}</Button><Button onClick={() => goToStep(next)}>{nextLabel}<ArrowRight className="w-4 h-4" /></Button></div>;

  return <AuthGuard>
    <main className="min-h-screen bg-cream pt-20 pb-16 overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 py-4">
          <Link href="/ai-hub"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />{t("backToAiHub")}</Button></Link>
          <span className="text-xs uppercase tracking-widest text-ink-soft">{t("storyboardKicker")}</span>
        </div>

        <nav aria-label="Storyboard workflow" className="sticky top-16 z-30 bg-paper/95 backdrop-blur-md border border-line rounded-xl mb-9 p-2 flex overflow-x-auto shadow-sm">
          {WORKFLOW_STEPS.map((step, index) => {
            const Icon = step.icon; const disabled = index >= 2 && !result;
            return <button key={step.id} disabled={disabled || (step.id === "generate" && !prompt.trim())} onClick={() => goToStep(step.id)} aria-current={activeStep === step.id ? "step" : undefined} className={`min-w-max flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors disabled:opacity-35 disabled:cursor-not-allowed ${activeStep === step.id ? "bg-primary text-cream" : index < currentStep ? "text-primary bg-primary-soft/50" : "text-ink-soft hover:bg-cream"}`}>
              <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] ${activeStep === step.id ? "border-cream/50" : "border-line"}`}>{index < currentStep ? <Check className="w-3 h-3" /> : String(index + 1).padStart(2, "0")}</span>
              <Icon className="w-4 h-4 hidden lg:block" /><span>{wf(step.id)}</span>
            </button>;
          })}
        </nav>

        {activeStep === "brief" && <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
          <div className="mb-8"><span className="text-xs uppercase tracking-widest text-primary font-semibold">{wf("briefEyebrow")}</span><h1 className="text-3xl md:text-5xl text-ink mt-3 mb-3">{wf("briefTitle")}</h1><p className="text-ink-soft max-w-2xl leading-relaxed">{wf("briefDescription")}</p></div>
          <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
            <div className="space-y-5">
              <div className="bg-paper rounded-xl border border-line p-5 md:p-7">
                <div className="flex items-center justify-between gap-3 mb-5"><h2 className="font-bold text-lg flex items-center gap-2"><span className="text-primary font-quote">01</span>{wf("purpose")}</h2><Button variant="ghost" size="sm" onClick={fillExample}><Sparkles className="w-4 h-4" />{tc("exampleButton")}</Button></div>
                <div className="grid sm:grid-cols-2 gap-3 mb-6">{([{ id: "shoot", title: wf("planShoot"), desc: wf("planShootDesc"), icon: Film }, { id: "pitch", title: wf("pitch"), desc: wf("pitchDesc"), icon: Lightbulb }] as const).map((item) => <button key={item.id} onClick={() => setPurpose(item.id)} className={`text-left p-4 rounded-xl border transition-colors flex gap-3 ${purpose === item.id ? "border-primary bg-primary-soft/60" : "border-line hover:border-primary/50"}`}><item.icon className="w-5 h-5 text-primary mt-0.5" /><span><strong className="block text-sm mb-1">{item.title}</strong><small className="text-ink-soft">{item.desc}</small></span></button>)}</div>
                <Field label={t("storyboardPage.ideaLabel")} hint={wf("campaignHint")}><textarea placeholder={t("storyboardPage.ideaPlaceholder")} className="w-full h-32 px-4 py-3 rounded-xl border border-line bg-paper focus:outline-none focus:ring-2 focus:ring-primary resize-none" value={prompt} onChange={(event) => setPrompt(event.target.value)} /></Field>
                <div className="grid md:grid-cols-3 gap-4 mt-5">
                  <Field label={wf("totalDuration")} hint={totalSeconds < 15 ? wf("durationMinimum") : undefined}><div className="grid grid-cols-2 gap-2"><select aria-label={wf("minutesLabel")} value={Math.floor(totalSeconds / 60)} onChange={(event) => setTotalSeconds(Number(event.target.value) * 60 + totalSeconds % 60)} className="w-full px-3 py-3 rounded-xl border border-line bg-paper">{MINUTE_OPTIONS.map((minutes) => <option key={minutes} value={minutes}>{t("storyboardPage.workflow.minutes", { count: minutes })}</option>)}</select><select aria-label={wf("secondsLabel")} value={totalSeconds % 60} onChange={(event) => setTotalSeconds(Math.floor(totalSeconds / 60) * 60 + Number(event.target.value))} className="w-full px-3 py-3 rounded-xl border border-line bg-paper">{SECOND_OPTIONS.map((seconds) => <option key={seconds} value={seconds}>{t("storyboardPage.workflow.seconds", { count: seconds })}</option>)}</select></div></Field>
                  <Field label={t("storyboardPage.formatLabel")}><select value={aspect} onChange={(event) => changeAspect(event.target.value as Aspect)} className="w-full px-3 py-3 rounded-xl border border-line bg-paper">{ASPECTS.map((item) => <option key={item}>{item}</option>)}</select></Field>
                  <Field label={t("storyboardPage.platformLabel")}><select value={platform} onChange={(event) => changePlatform(event.target.value as Platform)} className="w-full px-3 py-3 rounded-xl border border-line bg-paper">{PLATFORMS.map((item) => <option key={item} value={item}>{t(`storyboardPage.platforms.${item}`)}</option>)}</select></Field>
                </div>
              </div>
              <div className="bg-paper rounded-xl border border-line p-5 md:p-7 space-y-5">
                <h2 className="font-bold text-lg"><span className="text-primary font-quote mr-2">02</span>{wf("constraints")}</h2>
                <Field label={t("storyboardPage.moodLabel")}><input type="text" placeholder={t("storyboardPage.moodPlaceholder")} className="w-full px-4 py-3 rounded-xl border border-line bg-paper focus:outline-none focus:ring-2 focus:ring-primary" value={mood} onChange={(event) => setMood(event.target.value)} /></Field>
                <div><span className="block text-sm font-semibold text-ink mb-2">{wf("creatorProfile")}</span><p className="text-xs text-ink-soft mb-3 leading-relaxed">{wf("creatorProfileHint")}</p><div className="grid grid-cols-2 gap-2 mb-3" role="group" aria-label={wf("creatorProfile")}><button type="button" aria-pressed={creatorMode === "describe"} onClick={() => selectCreatorMode("describe")} className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm ${creatorMode === "describe" ? "bg-primary text-cream border-primary" : "border-line text-ink-soft"}`}><Pencil className="w-4 h-4" />{wf("describeCreator")}</button><button type="button" aria-pressed={creatorMode === "photo"} onClick={() => selectCreatorMode("photo")} className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm ${creatorMode === "photo" ? "bg-primary text-cream border-primary" : "border-line text-ink-soft"}`}><Upload className="w-4 h-4" />{wf("uploadCreator")}</button></div>{creatorMode === "describe" ? <textarea rows={2} className="w-full px-4 py-3 rounded-xl border border-line bg-paper resize-none" value={creatorProfile} onChange={(event) => setCreatorProfile(event.target.value)} placeholder={wf("creatorProfilePlaceholder")} /> : <div><input id="creator-identity-photo" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={photoUploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadCreatorPhoto(file); event.currentTarget.value = ""; }} />{creatorReferenceUrl ? <div className="flex items-center gap-4 p-3 rounded-xl border border-line bg-cream"><img src={creatorReferenceUrl} alt={wf("creatorPhotoAlt")} className="w-20 h-24 rounded-lg object-cover border border-line" /><div className="flex-1"><p className="text-sm font-semibold text-primary mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4" />{wf("uploadCreator")}</p><div className="flex gap-2 flex-wrap"><label htmlFor="creator-identity-photo" className="px-3 py-2 rounded-lg border border-line bg-paper text-xs font-semibold cursor-pointer">{wf("changePhoto")}</label><button type="button" onClick={() => { setCreatorReferenceUrl(""); resetGeneratedImages(); }} className="px-3 py-2 rounded-lg text-xs text-ink-soft hover:text-red-700">{wf("removePhoto")}</button></div></div></div> : <label htmlFor="creator-identity-photo" className={`flex flex-col items-center justify-center gap-2 min-h-36 rounded-xl border border-dashed border-primary/50 bg-primary-soft/30 text-primary text-sm font-semibold ${photoUploading ? "opacity-60 cursor-wait" : "cursor-pointer hover:bg-primary-soft/60"}`}>{photoUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}<span>{photoUploading ? wf("uploadingPhoto") : wf("choosePhoto")}</span></label>}<p className="text-xs text-ink-soft mt-2">{wf("creatorPhotoHint")}</p></div>}</div>
                <Field label={wf("setup")} hint={wf("setupPlaceholder")}><div className="relative"><Settings className="w-4 h-4 absolute left-4 top-4 text-ink-soft" /><input className="w-full pl-11 pr-4 py-3 rounded-xl border border-line bg-paper" value={setup} onChange={(event) => setSetup(event.target.value)} placeholder={wf("setupPlaceholder")} /></div></Field>
                <Field label={wf("guardrails")}><textarea rows={3} className="w-full px-4 py-3 rounded-xl border border-line bg-paper resize-none" value={guardrails} onChange={(event) => setGuardrails(event.target.value)} placeholder={wf("guardrailsPlaceholder")} /></Field>
                <Field label={wf("disclosure")} hint={wf("disclosureHint")}><div className="relative"><ShieldCheck className="w-4 h-4 absolute left-4 top-4 text-primary" /><input className="w-full pl-11 pr-4 py-3 rounded-xl border border-line bg-paper" value={disclosure} onChange={(event) => setDisclosure(event.target.value)} /></div></Field>
              </div>
              <div className="bg-paper rounded-xl border border-line overflow-hidden"><button onClick={() => setShowExamples(!showExamples)} className="w-full flex items-center justify-between p-4"><span className="flex items-center gap-2 font-semibold"><Lightbulb className="w-5 h-5 text-amber-500" />{t("storyboardPage.examplesTitle")}</span>{showExamples ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}</button>{showExamples && <div className="p-4 border-t border-line grid md:grid-cols-2 gap-3">{examples.map((item) => <button key={item.title} onClick={() => loadExample(item.prompt)} className="text-left p-4 bg-cream rounded-xl hover:bg-primary-soft"><Play className="w-4 h-4 text-primary inline mr-2" /><span className="font-medium">{item.title}</span><p className="text-xs text-ink-soft mt-2 line-clamp-2">{item.prompt}</p></button>)}</div>}</div>
            </div>
            <aside className="bg-paper rounded-xl border border-line p-6 lg:sticky lg:top-44">
              <Sparkles className="w-6 h-6 text-primary mb-3" /><h2 className="text-xl font-bold mb-2">{wf("plan")}</h2><p className="text-sm text-ink-soft mb-5">{wf("planDesc")}</p>
              <dl className="space-y-4 text-sm border-t border-line pt-5"><div><dt className="text-[10px] tracking-widest text-ink-soft mb-1">{wf("output")}</dt><dd>{totalSeconds}s · {aspect} · {t(`storyboardPage.platforms.${platform}`)}</dd></div><div><dt className="text-[10px] tracking-widest text-ink-soft mb-1">{wf("visualSystem")}</dt><dd>{wf("visualSystemValue")}</dd></div><div><dt className="text-[10px] tracking-widest text-ink-soft mb-1">{wf("character")}</dt><dd>{wf("characterValue")}</dd></div><div><dt className="text-[10px] tracking-widest text-ink-soft mb-1">{wf("textPlan")}</dt><dd>{wf("textPlanValue")}</dd></div></dl>
              <div className="bg-primary-soft/60 rounded-lg p-4 my-5"><h3 className="text-sm font-semibold flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4 text-primary" />{wf("specCheck")}</h3><p className="text-xs flex items-center gap-2 mb-1"><Check className="w-3 h-3 text-primary" />{wf("setupFeasible")}</p><p className="text-xs flex items-center gap-2"><Check className="w-3 h-3 text-primary" />{wf("disclosureIncluded")}</p></div>
              <Button className="w-full" onClick={generate} disabled={!prompt.trim() || loading || photoUploading || totalSeconds < 15}><Wand2 className="w-4 h-4" />{t("storyboardPage.generate")}<ArrowRight className="w-4 h-4" /></Button><p className="text-[11px] text-ink-soft text-center mt-3">{wf("nothingPublished")}</p>
            </aside>
          </div>
          <div className="mt-10"><div className="flex items-baseline gap-2 mb-3"><span className="uppercase tracking-widest text-xs text-ink-soft">{t("archiveLabel")} —</span><h3 className="font-quote text-lg text-ink">{t("historyTitle")}</h3></div><div className="[&_div:has(>h3)]:hidden"><AiGenerationHistory types={["storyboard"]} refreshKey={historyKey} /></div></div>
          <div className="mt-8 bg-paper rounded-xl border border-line overflow-hidden"><button onClick={() => setShowTips(!showTips)} className="w-full flex items-center justify-between p-5"><h3 className="font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />{t("storyboardPage.tipsTitle")}</h3>{showTips ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}</button>{showTips && <div className="px-5 pb-5 grid md:grid-cols-2 gap-3">{storyboardTips.map((tip) => <div key={tip.title} className="p-4 bg-cream rounded-xl"><h4 className="font-semibold mb-2 text-primary">{tip.title}</h4><p className="text-sm text-ink-soft">{tip.content}</p></div>)}</div>}</div>
        </motion.section>}

        {activeStep === "generate" && <section className="max-w-3xl mx-auto py-8">{stepHead(wf("generateTitle"), wf("generateDescription"))}<div className="bg-paper border border-line rounded-xl p-8 text-center"><div className="w-16 h-16 rounded-full bg-primary-soft text-primary flex items-center justify-center mx-auto mb-5">{loading ? <Loader2 className="w-8 h-8 animate-spin" /> : result ? <CheckCircle className="w-8 h-8" /> : <Wand2 className="w-8 h-8" />}</div><h2 className="text-2xl font-bold mb-3">{loading ? wf("generatingTitle") : result ? wf("resultReady") : wf("generateTitle")}</h2><p className="text-ink-soft mb-6">{loading ? wf("generatingDescription") : prompt}</p>{loading && <div className="bg-primary-soft rounded-lg text-left"><AiLoadingText toolKey="storyboard" /></div>}{error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl flex items-center justify-between gap-3 text-sm"><AlertCircle className="w-4 h-4" />{t("generateFailed")}<Button size="sm" variant="outline" onClick={generate}>{t("retry")}</Button></div>}<div className="flex justify-center gap-3 flex-wrap"><Button variant="ghost" onClick={() => goToStep("brief")} disabled={loading}>{wf("backToBrief")}</Button>{result && <Button onClick={() => goToStep("board")}>{wf("viewBoard")}<ArrowRight className="w-4 h-4" /></Button>}</div></div></section>}

        {activeStep === "board" && result && <section>{stepHead(wf("boardTitle"), wf("boardDescription"))}<div className="bg-primary text-cream rounded-t-xl p-5 md:p-6 flex items-center justify-between gap-4 flex-wrap"><div><span className="text-xs uppercase tracking-widest opacity-75">{t("storyboardPage.resultBadge")}</span><h2 className="text-xl md:text-2xl font-bold mt-1">{prompt.slice(0, 90)}</h2><p className="text-sm text-cream/75 mt-2">{t("storyboardPage.scenesCount", { count: result.scenes.length })} · {aspect} · {totalSeconds}s</p></div><Button variant="white" onClick={generateAllImages} disabled={generatingAll}>{generatingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}{t("storyboardPage.generateAllImages")}</Button></div>
          <div className="grid md:grid-cols-2 gap-5 bg-paper border-x border-line p-5">{result.scenes.map((scene, index) => <motion.article key={scene.scene_number} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }} className="border border-line rounded-xl overflow-hidden bg-paper"><div className="relative bg-cream">{sceneImages[scene.scene_number] ? <img src={sceneImages[scene.scene_number]} alt={scene.shot_angle} className="w-full object-cover" style={aspectStyle(aspect)} /> : <button onClick={() => generateSceneImage(scene)} disabled={imageLoading[scene.scene_number]} className="w-full flex flex-col gap-2 items-center justify-center text-ink-soft hover:text-primary" style={aspectStyle(aspect)}>{imageLoading[scene.scene_number] ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-7 h-7" />}<span className="text-xs">{imageLoading[scene.scene_number] ? t("storyboardPage.generatingImage") : t("storyboardPage.generateImage")}</span></button>}<span className="absolute top-3 left-3 bg-ink/75 text-cream rounded-full px-3 py-1 text-xs">{String(scene.scene_number).padStart(2, "0")}</span></div><div className="p-4"><div className="flex justify-between gap-2"><h3 className="font-semibold">{scene.shot_angle}</h3><button onClick={() => copyScene(scene)} className="text-ink-soft hover:text-primary" aria-label={tc("copy")}>{copiedScene === scene.scene_number ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}</button></div><p className="text-sm text-ink-soft mt-2 leading-relaxed">{scene.description}</p><p className="text-xs flex items-center gap-2 mt-3"><Sun className="w-4 h-4 text-amber-500" />{scene.lighting}</p></div></motion.article>)}</div>
          <div className="bg-paper border border-line rounded-b-xl p-5 grid md:grid-cols-2 gap-4"><div><h3 className="font-semibold flex items-center gap-2 mb-3"><Camera className="w-5 h-5 text-primary" />{t("storyboardPage.equipment")}</h3><div className="flex flex-wrap gap-2">{result.equipment_checklist.map((item) => <span key={item} className="px-3 py-1.5 bg-cream rounded-lg text-sm">{item}</span>)}</div></div><div><h3 className="font-semibold flex items-center gap-2 mb-3"><Sparkles className="w-5 h-5 text-primary" />{t("storyboardPage.directorsTips")}</h3><ul className="text-sm text-ink-soft space-y-1">{result.pro_tips.map((tip) => <li key={tip}>• {tip}</li>)}</ul></div></div>{footer("generate", "text", wf("continueText"))}</section>}

        {activeStep === "text" && result && activeScene && <section>{stepHead(wf("textTitle"), wf("textDescription"))}<div className="grid lg:grid-cols-[190px_minmax(0,1fr)_290px] gap-5 items-start"><div className="bg-paper border border-line rounded-xl p-3 flex lg:flex-col gap-2 overflow-x-auto">{result.scenes.map((scene) => <button key={scene.scene_number} onClick={() => setSelectedScene(scene.scene_number)} className={`min-w-24 text-left p-3 rounded-lg border ${selectedScene === scene.scene_number ? "border-primary bg-primary-soft" : "border-line"}`}><span className="text-xs text-primary font-bold">{String(scene.scene_number).padStart(2, "0")}</span><span className="block text-xs mt-1 line-clamp-2">{scene.shot_angle}</span></button>)}</div><div className="bg-paper border border-line rounded-xl p-4"><div className="relative max-w-2xl mx-auto bg-cream overflow-hidden rounded-lg">{sceneImages[activeScene.scene_number] ? <img src={sceneImages[activeScene.scene_number]} alt={activeScene.shot_angle} className="w-full object-cover" style={aspectStyle(aspect)} /> : <div className="flex items-center justify-center text-ink-soft" style={aspectStyle(aspect)}><ImageIcon className="w-8 h-8" /></div>}{activeTextSpace.visible && <div className="absolute left-[8%] w-[84%] min-h-[15%] px-4 py-3 border border-white/90 bg-white/45 backdrop-blur-[1px] rounded-sm flex items-center justify-center text-center text-ink shadow-sm" style={activeTextSpace.position === "top" ? { top: "7%" } : activeTextSpace.position === "center" ? { top: "42%" } : { bottom: "8%" }}><span className="text-sm md:text-base whitespace-pre-wrap">{activeTextSpace.text}</span></div>}</div><p className="text-xs text-ink-soft flex items-start gap-2 mt-4"><Info className="w-4 h-4 shrink-0" />{wf("emptyHint")}</p></div><aside className="bg-paper border border-line rounded-xl p-5 space-y-5"><div><span className="text-xs text-ink-soft">{wf("selectScene")} {String(activeScene.scene_number).padStart(2, "0")}</span><h3 className="font-semibold mt-1">{activeScene.shot_angle}</h3></div><Field label={wf("overlayLabel")}><textarea rows={4} value={activeTextSpace.text} onChange={(event) => updateTextSpace({ text: event.target.value })} placeholder={wf("overlayPlaceholder")} className="w-full px-3 py-3 rounded-lg border border-line bg-paper resize-none" /></Field><Field label={wf("position")}><div className="grid grid-cols-3 gap-2">{(["top", "center", "bottom"] as OverlayPosition[]).map((position) => <button key={position} onClick={() => updateTextSpace({ position })} className={`px-2 py-2 rounded-lg border text-xs ${activeTextSpace.position === position ? "bg-primary text-cream border-primary" : "border-line"}`}>{wf(position)}</button>)}</div></Field><button onClick={() => updateTextSpace({ visible: !activeTextSpace.visible })} className="flex items-center gap-2 text-sm text-primary">{activeTextSpace.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}{wf("showSpace")}</button></aside></div>{footer("board", "refine", wf("continueRefine"))}</section>}

        {activeStep === "refine" && result && activeScene && <section>{stepHead(wf("refineTitle"), wf("refineDescription"))}<div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6"><div className="grid md:grid-cols-2 gap-4">{[{ label: wf("before"), image: refineOriginals[selectedScene] || sceneImages[selectedScene] }, { label: wf("after"), image: refineOriginals[selectedScene] ? sceneImages[selectedScene] : null }].map((preview, index) => <div key={preview.label} className="bg-paper border border-line rounded-xl p-4"><div className="flex items-center justify-between mb-3"><h3 className="font-semibold">{preview.label}</h3>{index === 1 && imageLoading[selectedScene] && <Loader2 className="w-4 h-4 animate-spin text-primary" />}</div>{preview.image ? <img src={preview.image} alt={preview.label} className="w-full object-cover rounded-lg" style={aspectStyle(aspect)} /> : <div className="rounded-lg border border-dashed border-line bg-cream flex items-center justify-center text-center text-sm text-ink-soft p-4" style={aspectStyle(aspect)}>{index === 0 ? wf("noImage") : wf("refinePlaceholder")}</div>}</div>)}</div><aside className="bg-paper border border-line rounded-xl p-5 space-y-5"><Field label={wf("selectScene")}><select value={selectedScene} onChange={(event) => setSelectedScene(Number(event.target.value))} className="w-full px-3 py-3 rounded-lg border border-line bg-paper">{result.scenes.map((scene) => <option key={scene.scene_number} value={scene.scene_number}>{scene.scene_number} — {scene.shot_angle}</option>)}</select></Field><Field label={wf("scope")}><div className="grid grid-cols-3 gap-2">{([{ id: "image", label: wf("imageOnly") }, { id: "action", label: wf("actionOnly") }, { id: "full", label: wf("fullPanel") }] as const).map((scope) => <button key={scope.id} onClick={() => setRefineScope(scope.id)} className={`px-2 py-3 rounded-lg border text-xs ${refineScope === scope.id ? "bg-primary text-cream border-primary" : "border-line"}`}>{scope.label}</button>)}</div></Field><Field label={wf("refineNote")}><textarea rows={5} value={refineNote} onChange={(event) => setRefineNote(event.target.value)} placeholder={wf("refinePlaceholder")} className="w-full px-3 py-3 rounded-lg border border-line bg-paper resize-none" /></Field><Button className="w-full" disabled={!sceneImages[selectedScene] || !refineNote.trim() || imageLoading[selectedScene]} onClick={() => generateSceneImage(activeScene, { note: refineNote, scope: refineScope })}>{imageLoading[selectedScene] ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}{wf("regenerateSelected")}</Button>{refineOriginals[selectedScene] && <Button variant="outline" className="w-full" onClick={restoreRefine}>{wf("restoreBefore")}</Button>}</aside></div>{footer("text", "export", wf("continueExport"))}</section>}

        {activeStep === "export" && result && <section>{stepHead(wf("exportTitle"), wf("exportDescription"))}<div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start"><div className="space-y-5"><div className="bg-primary text-cream rounded-xl p-6"><CheckCircle className="w-8 h-8 mb-4" /><h2 className="text-2xl font-bold">{wf("ready")}</h2><p className="text-cream/80 mt-2">{result.scenes.length} {wf("board")} · {Object.keys(sceneImages).length} {t("storyboardPage.generateImage")} · {aspect}</p></div>{(videoUrl || videoLoading) && <div className="bg-ink rounded-xl p-5">{videoLoading ? <div className="flex flex-col items-center justify-center text-cream gap-3" style={aspectStyle(aspect)}><Loader2 className="w-8 h-8 animate-spin" /><span>{clipProgress ? t("storyboardPage.generatingClip", clipProgress) : t("storyboardPage.videoLoading")}</span></div> : <video src={videoUrl!} controls loop className="w-full bg-black rounded-lg" style={aspectStyle(aspect)} />}</div>}<div className="bg-paper border border-line rounded-xl p-5"><div className="flex items-center justify-between mb-3"><h3 className="font-semibold flex items-center gap-2"><Camera className="w-5 h-5 text-primary" />{t("storyboardPage.equipment")}</h3><Button variant="ghost" size="sm" onClick={copyLists}>{copiedLists ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copiedLists ? tc("copied") : tc("copy")}</Button></div><div className="flex flex-wrap gap-2">{result.equipment_checklist.map((item) => <span key={item} className="px-3 py-1.5 bg-cream rounded-lg text-sm">{item}</span>)}</div><Link href="/equipment" className="inline-flex items-center gap-2 text-primary text-sm font-semibold mt-4">{wf("gearLink")}<ArrowRight className="w-4 h-4" /></Link></div></div><aside className="bg-paper border border-line rounded-xl p-5 space-y-4"><h3 className="font-bold text-lg">{wf("export")}</h3><Button className="w-full" onClick={printBrief}><Download className="w-4 h-4" />{t("storyboardPage.exportLabel")} PDF</Button><Button variant="outline" className="w-full" onClick={downloadCsv}><FileText className="w-4 h-4" />{wf("csv")}</Button><Button variant="outline" className="w-full" onClick={copyToClipboard}>{copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? t("storyboardPage.copiedExcl") : tc("copy")}</Button><hr className="border-line" /><Field label={t("storyboardPage.durationLabel")}><select value={sceneSeconds} onChange={(event) => setSceneSeconds(Number(event.target.value))} className="w-full px-3 py-3 rounded-lg border border-line bg-paper">{SCENE_SECONDS_OPTIONS.map((seconds) => <option key={seconds} value={seconds}>{t("storyboardPage.secondsPerScene", { count: seconds })}</option>)}</select></Field><Field label="Video"><select value={videoMode} onChange={(event) => setVideoMode(event.target.value as VideoMode)} className="w-full px-3 py-3 rounded-lg border border-line bg-paper"><option value="animatic">{t("storyboardPage.modeAnimatic")}</option><option value="ai">{t("storyboardPage.modeAi")}</option></select></Field>{videoMode === "ai" && <p className="text-xs text-ink-soft">{t("storyboardPage.priceEstimate", { price: (result.scenes.length * OMNI_CLIP_SECONDS * OMNI_RATE_PER_SECOND).toFixed(2) })} · {t("storyboardPage.aiVideoNote")}</p>}{videoMode === "animatic" ? <Button className="w-full" onClick={generateVideo} disabled={videoLoading}>{videoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}{t("storyboardPage.previewVideo")}</Button> : <Button className="w-full" onClick={generateAiVideo} disabled={videoLoading}>{videoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}{t("storyboardPage.generateAiVideo")}</Button>}{videoLoading && videoMode === "ai" && <Button variant="outline" className="w-full" onClick={() => (abortAiVideo.current = true)}><Square className="w-4 h-4" />{tc("cancel")}</Button>}</aside></div>{footer("refine", "brief", wf("backToBrief"))}</section>}

        {result && <><style>{`@media print{body *{visibility:hidden}.storyboard-print-area,.storyboard-print-area *{visibility:visible}.storyboard-print-area{display:block!important;position:absolute;inset:0;padding:24px;background:white}.storyboard-print-scene{break-inside:avoid}}`}</style><div className="storyboard-print-area hidden"><h1 style={{ fontSize: 22, fontWeight: 700 }}>LumiAI — {t("storyboardPage.resultBadge")}</h1><p><strong>{t("storyboardPage.ideaLabel")}</strong> {prompt}</p><p>{totalSeconds}s · {aspect} · {t(`storyboardPage.platforms.${platform}`)}</p>{result.scenes.map((scene) => <div key={scene.scene_number} className="storyboard-print-scene" style={{ display: "flex", gap: 12, marginBottom: 14, borderTop: "1px solid #ddd", paddingTop: 10 }}>{sceneImages[scene.scene_number] && <img src={sceneImages[scene.scene_number]} alt="" style={{ maxWidth: 200, maxHeight: 220 }} />}<div><p style={{ fontWeight: 700 }}>{t("storyboardPage.copyScenePrefix")} {scene.scene_number} — {scene.shot_angle}</p><p>{scene.description}</p><p style={{ fontSize: 12 }}>{scene.lighting}</p><p style={{ fontSize: 12 }}>{wf("overlayLabel")} {textSpaces[scene.scene_number]?.text || "—"}</p></div></div>)}<p><strong>{t("storyboardPage.equipmentLabel")}</strong> {result.equipment_checklist.join(", ")}</p></div></>}
      </div>
    </main>
  </AuthGuard>;
}
