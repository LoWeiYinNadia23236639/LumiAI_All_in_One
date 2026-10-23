"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Image,
  ArrowLeft,
  Wand2,
  Loader2,
  Camera,
  Sun,
  Download,
  Copy,
  CheckCircle,
  Lightbulb,
  Play,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Film,
  Square
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
  {
    title: "Morning Skincare Routine",
    prompt: "A relaxing morning skincare routine showing a person waking up refreshed, washing their face, applying serum and moisturizer, ending with a glowing skin close-up. 30 seconds total.",
    description: "Perfect for beauty influencers showcasing products"
  },
  {
    title: "Unboxing Video",
    prompt: "An exciting unboxing of a new tech gadget. Show the package arriving, opening the box layer by layer, revealing the product, and first impressions. 45 seconds.",
    description: "Great for tech reviewers and product showcases"
  },
  {
    title: "Recipe Tutorial",
    prompt: "Quick 15-minute pasta recipe. Show ingredients laid out, cooking process with close-ups of each step, plating the final dish. Include top-down shots of chopping. 60 seconds.",
    description: "Ideal for food creators and cooking channels"
  },
  {
    title: "Workout Routine",
    prompt: "5-minute morning stretch and workout routine. Start in bed stretching, transition to yoga mat, show 3-4 exercises with modifications, end with energized feeling. 45 seconds.",
    description: "Perfect for fitness and wellness creators"
  }
];

type Aspect = "16:9" | "9:16" | "3:4" | "4:3";

const ASPECTS: Aspect[] = ["16:9", "9:16", "3:4", "4:3"];

const PLATFORMS = [
  "general",
  "youtube",
  "tiktok",
  "instagram_reels",
  "instagram_feed",
  "xiaohongshu",
] as const;

type Platform = (typeof PLATFORMS)[number];

const PLATFORM_ASPECT: Record<Platform, Aspect> = {
  general: "16:9",
  youtube: "16:9",
  tiktok: "9:16",
  instagram_reels: "9:16",
  instagram_feed: "4:3",
  xiaohongshu: "3:4",
};

const SCENE_SECONDS_OPTIONS = [1, 1.5, 2, 2.5, 3, 4, 5];

type VideoMode = "animatic" | "ai";

// Gemini omni video: each scene becomes one ~10s clip at ~$0.10/s (720p, audio included).
const OMNI_CLIP_SECONDS = 10;
const OMNI_RATE_PER_SECOND = 0.1;

const aspectStyle = (a: Aspect) => ({ aspectRatio: a.replace(":", "/") });

export default function StoryboardAIPage() {
  const t = useTranslations("aiTools");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { success, error: toastError, info: toastInfo } = useToast();
  const [prompt, setPrompt] = useState("");
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<StoryboardResult | null>(null);
  const [historyKey, setHistoryKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copiedScene, setCopiedScene] = useState<number | null>(null);
  const [copiedLists, setCopiedLists] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [showExamples, setShowExamples] = useState(true);
  // Visual preview state: scene images + animatic video
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
  const abortAiVideo = useRef(false);
  const example = t.raw("examples.storyboard") as { idea: string; mood: string };
  const storyboardTips = t.raw("storyboardPage.tips") as { title: string; content: string }[];

  const generate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(false);
    try {
      const data = await callGenerate<StoryboardResult>("storyboard", {
        prompt,
        mood,
        locale,
      });
      setResult(data);
      setSceneImages({});
      setVideoUrl(null);
      setHistoryKey((k) => k + 1);
      window.scrollTo({ top: 400, behavior: "smooth" });
    } catch (err) {
      if (err instanceof AiAuthError) {
        window.location.href = `/${locale}/login`;
        return;
      }
      setError(true);
      toastError(t("generateFailed"));
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fillExample = () => {
    setPrompt(example.idea);
    setMood(example.mood);
  };

  // --- Visual preview helpers (scene images + animatic video) ---
  const postVisual = async <T,>(api: string, payload: unknown): Promise<T> => {
    const supabase = (await import("@/lib/supabase/client")).getSupabaseClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new AiAuthError("Not signed in");
    const res = await fetch(api, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (res.status === 401) throw new AiAuthError("Session expired");
    const body = await res.json();
    if (!res.ok) throw new Error(body.detail || body.error || "Request failed");
    return body as T;
  };

  const changeAspect = (next: Aspect) => {
    if (next === aspect) return;
    setAspect(next);
    // Previously generated visuals no longer match the chosen format.
    if (Object.keys(sceneImages).length > 0 || videoUrl) {
      setSceneImages({});
      setVideoUrl(null);
      toastInfo(t("storyboardPage.formatChanged"));
    }
  };

  const changePlatform = (next: Platform) => {
    setPlatform(next);
    changeAspect(PLATFORM_ASPECT[next]);
  };

  const generateSceneImage = async (scene: Scene): Promise<boolean> => {
    if (imageLoading[scene.scene_number] || !result) return false;
    setImageLoading((s) => ({ ...s, [scene.scene_number]: true }));
    try {
      const { url } = await postVisual<{ url: string }>("/api/ai/scene-image", {
        scene_number: scene.scene_number,
        description: scene.description,
        shot_angle: scene.shot_angle,
        lighting: scene.lighting,
        mood,
        aspect,
      });
      setSceneImages((s) => ({ ...s, [scene.scene_number]: url }));
      setVideoUrl(null); // previous animatic no longer matches
      return true;
    } catch (err) {
      if (err instanceof AiAuthError) {
        window.location.href = `/${locale}/login`;
        return false;
      }
      const detail = err instanceof Error ? err.message : String(err);
      toastError(t("storyboardPage.imageFailedDetail", { detail: detail.slice(0, 160) }));
      return false;
    } finally {
      setImageLoading((s) => ({ ...s, [scene.scene_number]: false }));
    }
  };

  const generateAllImages = async () => {
    if (!result || generatingAll) return;
    setGeneratingAll(true);
    try {
      for (const scene of result.scenes) {
        if (sceneImages[scene.scene_number]) continue;
        // Sequential: respects the shared Gemini quota better than parallel.
        await generateSceneImage(scene);
      }
    } finally {
      setGeneratingAll(false);
    }
  };

  const generateVideo = async () => {
    if (!result || videoLoading) return;
    const missing = result.scenes.some((s) => !sceneImages[s.scene_number]);
    if (missing) {
      toastError(t("storyboardPage.needAllImages"));
      return;
    }
    setVideoLoading(true);
    try {
      const { url } = await postVisual<{ url: string }>("/api/ai/storyboard-video", {
        images: result.scenes.map((s) => ({
          url: sceneImages[s.scene_number],
          scene_number: s.scene_number,
        })),
        aspect,
        seconds_per_scene: sceneSeconds,
      });
      setVideoUrl(url);
      success(t("storyboardPage.videoReady"));
    } catch (err) {
      if (err instanceof AiAuthError) {
        window.location.href = `/${locale}/login`;
        return;
      }
      const detail = err instanceof Error ? err.message : String(err);
      toastError(t("storyboardPage.videoFailedDetail", { detail: detail.slice(0, 160) }));
    } finally {
      setVideoLoading(false);
    }
  };

  const printBrief = () => window.print();

  const generateAiVideo = async () => {
    if (!result || videoLoading) return;
    const missing = result.scenes.some((s) => !sceneImages[s.scene_number]);
    if (missing) {
      toastError(t("storyboardPage.needAllImages"));
      return;
    }
    setVideoLoading(true);
    abortAiVideo.current = false;
    const scenes = result.scenes;
    try {
      const clipUrls: string[] = [];
      for (let i = 0; i < scenes.length; i++) {
        if (abortAiVideo.current) {
          toastInfo(t("storyboardPage.aiVideoCancelled"));
          return;
        }
        const scene = scenes[i];
        setClipProgress({ current: i + 1, total: scenes.length });
        // Synchronous generation: one request per clip (~30–60s), no polling.
        const { url } = await postVisual<{ url: string }>("/api/ai/scene-video", {
          scene_number: scene.scene_number,
          description: scene.description,
          shot_angle: scene.shot_angle,
          mood,
          image_url: sceneImages[scene.scene_number],
        });
        if (abortAiVideo.current) {
          toastInfo(t("storyboardPage.aiVideoCancelled"));
          return;
        }
        clipUrls.push(url);
      }
      setClipProgress(null);
      const { url } = await postVisual<{ url: string }>("/api/ai/storyboard-video", {
        mode: "clips",
        clips: clipUrls,
        aspect,
        transitions: true,
      });
      setVideoUrl(url);
      success(t("storyboardPage.videoReady"));
    } catch (err) {
      if (err instanceof AiAuthError) {
        window.location.href = `/${locale}/login`;
        return;
      }
      const detail = err instanceof Error ? err.message : String(err);
      toastError(t("storyboardPage.clipFailedDetail", { detail: detail.slice(0, 160) }));
    } finally {
      setVideoLoading(false);
      setClipProgress(null);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const text = `
${prompt.slice(0, 80)}

${result.scenes.map(s => `
${t("storyboardPage.copyScenePrefix")} ${s.scene_number}: ${s.shot_angle}
${t("storyboardPage.actionLabel")} ${s.description}
${t("storyboardPage.lightingLabel")} ${s.lighting}
`).join('')}

${t("storyboardPage.equipmentLabel")} ${result.equipment_checklist.join(", ")}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    success(tc("copied"));
    setTimeout(() => setCopied(false), 2000);
  };

  const copyScene = (scene: Scene) => {
    navigator.clipboard.writeText(
      `${t("storyboardPage.copyScenePrefix")} ${scene.scene_number}: ${scene.shot_angle}\n${scene.description}\n${t("storyboardPage.lightingLabel")} ${scene.lighting}`
    );
    setCopiedScene(scene.scene_number);
    success(tc("copied"));
    setTimeout(() => setCopiedScene(null), 1500);
  };

  const copyLists = () => {
    if (!result) return;
    const text = [
      `${t("storyboardPage.equipmentLabel")} ${result.equipment_checklist.join(", ")}`,
      result.pro_tips.length > 0
        ? `${t("storyboardPage.tipsLabel")}\n${result.pro_tips.map((tip) => `- ${tip}`).join("\n")}`
        : "",
    ].filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopiedLists(true);
    success(tc("copied"));
    setTimeout(() => setCopiedLists(false), 1500);
  };

  return (
    <AuthGuard>
    <main className="min-h-screen bg-cream pt-24 pb-16 overflow-x-clip">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/ai-hub">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("backToAiHub")}
            </Button>
          </Link>
        </div>

        <div className="text-center mb-10 relative overflow-hidden">
          <span className="absolute pointer-events-none select-none font-quote text-[12rem] leading-none text-ink/5 -right-8 -top-10">STORYBOARD</span>
          <div className="relative z-10">
            <div className="inline-flex items-center rounded-full border border-primary/40 text-primary px-4 py-1 text-xs uppercase tracking-widest mb-4">{t("storyboardKicker")}</div>
            <h1 className="text-4xl md:text-5xl text-ink mb-4">
              {t("storyboardPage.titleBefore")} <span className="text-ink">{t("storyboardPage.titleHighlight")}</span>
            </h1>
            <p className="font-quote text-xl text-ink-soft max-w-2xl mx-auto">
              {t("storyboardPage.subtitle")}
            </p>
          </div>
        </div>

        {/* Examples Section */}
        <div className="bg-paper rounded-lg border overflow-hidden mb-8">
          <button 
            onClick={() => setShowExamples(!showExamples)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <span className="font-semibold">{t("storyboardPage.examplesTitle")}</span>
            </div>
            {showExamples ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {showExamples && (
            <div className="p-4 border-t grid md:grid-cols-2 gap-4">
              {examples.map((example, i) => (
                <button
                  key={i}
                  onClick={() => loadExample(example.prompt)}
                  className="text-left p-4 bg-gray-50 rounded-xl hover:bg-primary-soft transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="w-4 h-4 text-primary" />
                    <span className="font-medium group-hover:text-primary">{example.title}</span>
                  </div>
                  <p className="text-sm text-neutral-500 mb-2 line-clamp-2">{example.prompt}</p>
                  <p className="text-xs text-primary">{example.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="bg-paper rounded-lg border p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="block mb-3">
              <span className="font-quote text-sm text-ink/40">{t("stepLabel", { num: "01" })}</span>
              <span className="uppercase tracking-widest text-xs text-ink-soft"> {t("storyboardPage.ideaLabel")}</span>
            </label>
            <Button variant="ghost" size="sm" onClick={fillExample} className="rounded-full border border-dashed border-primary/40 text-primary text-xs hover:border-solid">
              <Sparkles className="w-4 h-4 mr-2" />
              {tc("exampleButton")}
            </Button>
          </div>
          <textarea
            placeholder={t("storyboardPage.ideaPlaceholder")}
            className="w-full h-32 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-4"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <label className="block mb-3">
            <span className="font-quote text-sm text-ink/40">{t("stepLabel", { num: "02" })}</span>
            <span className="uppercase tracking-widest text-xs text-ink-soft"> {t("storyboardPage.moodLabel")}</span>
          </label>
          <input
            type="text"
            placeholder={t("storyboardPage.moodPlaceholder")}
            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary mb-4"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
          />
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block mb-2">
                <span className="font-quote text-sm text-ink/40">{t("stepLabel", { num: "03" })}</span>
                <span className="uppercase tracking-widest text-xs text-ink-soft"> {t("storyboardPage.formatLabel")}</span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {ASPECTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => changeAspect(a)}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                      aspect === a
                        ? "bg-primary text-cream border-primary"
                        : "border-line text-ink-soft hover:border-primary hover:text-primary"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block mb-2">
                <span className="font-quote text-sm text-ink/40">{t("stepLabel", { num: "04" })}</span>
                <span className="uppercase tracking-widest text-xs text-ink-soft"> {t("storyboardPage.platformLabel")}</span>
              </label>
              <select
                value={platform}
                onChange={(e) => changePlatform(e.target.value as Platform)}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary bg-paper"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {t(`storyboardPage.platforms.${p}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2">
                <span className="font-quote text-sm text-ink/40">{t("stepLabel", { num: "05" })}</span>
                <span className="uppercase tracking-widest text-xs text-ink-soft"> {t("storyboardPage.durationLabel")}</span>
              </label>
              <select
                value={sceneSeconds}
                onChange={(e) => setSceneSeconds(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary bg-paper"
              >
                {SCENE_SECONDS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {t("storyboardPage.secondsPerScene", { count: s })}
                  </option>
                ))}
              </select>
              {result && (
                <p className="text-xs text-neutral-500 mt-2">
                  {t("storyboardPage.totalDuration", { duration: Math.round(result.scenes.length * sceneSeconds) })}
                </p>
              )}
            </div>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {t("generateFailed")}
              </span>
              <Button size="sm" variant="outline" onClick={generate} disabled={loading}>
                {t("retry")}
              </Button>
            </div>
          )}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-neutral-500">
              {t("storyboardPage.tip")}
            </p>
            <Button 
              onClick={generate}
              disabled={loading || !prompt.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t("generating")}
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  {t("storyboardPage.generate")}
                </>
              )}
            </Button>
          </div>
          {loading && <div className="mt-3 bg-primary-soft rounded-lg"><AiLoadingText toolKey="storyboard" /></div>}
        </div>

        {/* Result Section */}
        {result && (
          <div className="relative">
            <div className="absolute -top-3 right-4 pointer-events-none rotate-[8deg] rounded border-2 border-primary/50 text-primary/70 px-3 py-1 font-quote uppercase tracking-widest text-xs z-10">
              {t("stampGenerated")}
            </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-paper rounded-lg border-t-2 border-ink/40 overflow-hidden"
          >
            {/* Result Header */}
            <div className="bg-primary p-6 text-cream flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">{t("storyboardPage.resultBadge")}</span>
                </div>
                <h2 className="text-2xl font-bold">{prompt.slice(0, 60)}</h2>
                <p className="text-cream/80 flex items-center gap-4 mt-1 flex-wrap">
                  <span>{t("storyboardPage.scenesCount", { count: result.scenes.length })}</span>
                  <span>{aspect}</span>
                  <span>{t(`storyboardPage.platforms.${platform}`)}</span>
                  <span>{t("storyboardPage.totalDuration", { duration: Math.round(result.scenes.length * sceneSeconds) })}</span>
                  {videoMode === "ai" && (
                    <span>
                      {t("storyboardPage.priceEstimate", {
                        price: (result.scenes.length * OMNI_CLIP_SECONDS * OMNI_RATE_PER_SECOND).toFixed(2),
                      })}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  className="border-cream text-cream hover:bg-cream/20"
                  onClick={generateAllImages}
                  disabled={generatingAll}
                >
                  {generatingAll ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                  {t("storyboardPage.generateAllImages")}
                </Button>
                <select
                  value={videoMode}
                  onChange={(e) => setVideoMode(e.target.value as VideoMode)}
                  disabled={videoLoading}
                  className="px-3 py-2 rounded-lg border border-cream/60 bg-transparent text-cream text-sm focus:outline-none disabled:opacity-60 [&>option]:text-ink"
                >
                  <option value="animatic">{t("storyboardPage.modeAnimatic")}</option>
                  <option value="ai">{t("storyboardPage.modeAi")}</option>
                </select>
                {videoMode === "animatic" ? (
                  <Button
                    className="bg-cream text-primary hover:bg-paper"
                    onClick={generateVideo}
                    disabled={videoLoading}
                  >
                    {videoLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                    {t("storyboardPage.previewVideo")}
                  </Button>
                ) : (
                  <>
                    <Button
                      className="bg-cream text-primary hover:bg-paper"
                      onClick={generateAiVideo}
                      disabled={videoLoading}
                    >
                      {videoLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Film className="w-4 h-4 mr-2" />}
                      {t("storyboardPage.generateAiVideo")}
                    </Button>
                    {videoLoading && (
                      <Button
                        variant="outline"
                        className="border-cream text-cream hover:bg-cream/20"
                        onClick={() => (abortAiVideo.current = true)}
                      >
                        <Square className="w-4 h-4 mr-2" />
                        {tc("cancel")}
                      </Button>
                    )}
                  </>
                )}
                {videoMode === "ai" && (
                  <p className="w-full text-xs text-cream/70">{t("storyboardPage.aiVideoNote")}</p>
                )}
                <Button
                  variant="outline"
                  className="border-cream text-cream hover:bg-cream/20"
                  onClick={copyToClipboard}
                >
                  {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? t("storyboardPage.copiedExcl") : tc("copy")}
                </Button>
                <Button
                  variant="outline"
                  className="border-cream text-cream hover:bg-cream/20"
                  onClick={printBrief}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t("storyboardPage.exportLabel")}
                </Button>
              </div>
            </div>

            {/* Animatic video player */}
            {(videoUrl || videoLoading) && (
              <div className="bg-ink p-4 md:p-6">
                {videoLoading ? (
                  <div
                    className="bg-ink-soft/20 rounded-lg flex flex-col items-center justify-center text-cream gap-3 w-full max-w-3xl mx-auto"
                    style={aspectStyle(aspect)}
                  >
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-sm opacity-80">
                      {clipProgress
                        ? t("storyboardPage.generatingClip", clipProgress)
                        : t("storyboardPage.videoLoading")}
                    </span>
                  </div>
                ) : (
                  <video
                    src={videoUrl!}
                    controls
                    autoPlay
                    loop
                    className="w-full max-w-3xl mx-auto bg-black rounded-lg"
                    style={aspectStyle(aspect)}
                  />
                )}
              </div>
            )}

            <div className="p-6">
              {/* Scenes */}
              <div className="space-y-4 mb-8">
                {result.scenes.map((scene, index) => (
                  <motion.div
                    key={scene.scene_number}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col md:flex-row gap-4 p-4 bg-paper rounded-lg border-t-2 border-ink/40"
                  >
                    <div className="font-quote text-3xl text-ink/30 leading-none pt-1 flex-shrink-0">
                      {String(scene.scene_number).padStart(2, "0")}
                    </div>
                    {/* Scene visual */}
                    <div className="w-full md:w-60 flex-shrink-0">
                      {sceneImages[scene.scene_number] ? (
                        <div className="relative group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={sceneImages[scene.scene_number]}
                            alt={scene.shot_angle}
                            className="w-full object-cover rounded-lg border border-line"
                            style={aspectStyle(aspect)}
                          />
                          <button
                            onClick={() => generateSceneImage(scene)}
                            disabled={imageLoading[scene.scene_number]}
                            className="absolute inset-0 flex items-center justify-center bg-ink/60 text-cream text-xs opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                          >
                            {imageLoading[scene.scene_number] ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            ) : (
                              <Image className="w-4 h-4 mr-1" />
                            )}
                            {t("storyboardPage.regenerateImage")}
                          </button>
                        </div>
                      ) : imageLoading[scene.scene_number] ? (
                        <div
                          className="w-full rounded-lg border border-dashed border-line bg-primary-soft/40 flex flex-col items-center justify-center text-ink-soft gap-2"
                          style={aspectStyle(aspect)}
                        >
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-xs">{t("storyboardPage.generatingImage")}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => generateSceneImage(scene)}
                          className="w-full rounded-lg border border-dashed border-ink/30 hover:border-primary hover:text-primary transition-colors flex flex-col items-center justify-center text-ink-soft gap-2"
                          style={aspectStyle(aspect)}
                        >
                          <Image className="w-6 h-6" />
                          <span className="text-xs">{t("storyboardPage.generateImage")}</span>
                        </button>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-ink mb-1">{scene.shot_angle}</h3>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0" onClick={() => copyScene(scene)} aria-label={tc("copy")}>
                          {copiedScene === scene.scene_number ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-neutral-700 mb-2">{scene.description}</p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-1 text-neutral-600 bg-paper px-2 py-1 rounded-lg">
                          <Sun className="w-4 h-4 text-amber-500" />
                          {scene.lighting}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Equipment */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary" />
                    {t("storyboardPage.equipment")}
                  </h4>
                  <Button variant="ghost" size="sm" onClick={copyLists}>
                    {copiedLists ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copiedLists ? tc("copied") : tc("copy")}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.equipment_checklist.map((item, i) => (
                    <span key={i} className="px-3 py-1.5 bg-paper border rounded-lg text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pro Tips */}
              {result.pro_tips.length > 0 && (
                <div className="bg-primary-soft rounded-xl p-4 mt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    {t("storyboardPage.directorsTips")}
                  </h4>
                  <ul className="space-y-2">
                    {result.pro_tips.map((tip, i) => (
                      <li key={i} className="text-sm text-neutral-700 flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
          </div>
        )}

        {/* Print-only client brief (Save as PDF via browser print dialog) */}
        {result && (
          <>
            <style>{`
              @media print {
                body * { visibility: hidden; }
                .storyboard-print-area, .storyboard-print-area * { visibility: visible; }
                .storyboard-print-area { position: absolute; inset: 0; padding: 24px; background: white; }
                .storyboard-print-scene { break-inside: avoid; }
              }
            `}</style>
            <div className="storyboard-print-area hidden">
              <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>LumiAI — {t("storyboardPage.resultBadge")}</h1>
              <p style={{ marginBottom: 2 }}><strong>{t("storyboardPage.ideaLabel")}</strong> {prompt}</p>
              {mood && <p style={{ marginBottom: 2 }}><strong>{t("storyboardPage.moodLabel")}</strong> {mood}</p>}
              <p style={{ marginBottom: 12 }}>
                <strong>{t("storyboardPage.formatLabel")}</strong> {aspect} · {t("storyboardPage.platformLabel")} {t(`storyboardPage.platforms.${platform}`)} · {t("storyboardPage.totalDuration", { duration: Math.round(result.scenes.length * sceneSeconds) })}
              </p>
              {result.scenes.map((s) => (
                <div key={s.scene_number} className="storyboard-print-scene" style={{ display: "flex", gap: 12, marginBottom: 14, borderTop: "1px solid #ddd", paddingTop: 10 }}>
                  {sceneImages[s.scene_number] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sceneImages[s.scene_number]} alt="" style={{ maxWidth: 200, maxHeight: 220, borderRadius: 6 }} />
                  )}
                  <div>
                    <p style={{ fontWeight: 700 }}>{t("storyboardPage.copyScenePrefix")} {s.scene_number} — {s.shot_angle}</p>
                    <p style={{ margin: "2px 0" }}>{s.description}</p>
                    <p style={{ color: "#555", fontSize: 12 }}>{t("storyboardPage.lightingLabel")} {s.lighting}</p>
                  </div>
                </div>
              ))}
              <p style={{ marginTop: 8 }}><strong>{t("storyboardPage.equipmentLabel")}</strong> {result.equipment_checklist.join(", ")}</p>
              {result.pro_tips.length > 0 && (
                <p><strong>{t("storyboardPage.tipsLabel")}</strong> {result.pro_tips.join(" · ")}</p>
              )}
            </div>
          </>
        )}

        {/* History */}
        <div className="mt-8">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="uppercase tracking-widest text-xs text-ink-soft">{t("archiveLabel")} —</span>
            <h3 className="font-quote text-lg text-ink">{t("historyTitle")}</h3>
          </div>
          <div className="[&_div:has(>h3)]:hidden">
            <AiGenerationHistory types={["storyboard"]} refreshKey={historyKey} />
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-paper rounded-lg border overflow-hidden">
          <button 
            onClick={() => setShowTips(!showTips)}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <h4 className="font-bold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {t("storyboardPage.tipsTitle")}
            </h4>
            {showTips ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {showTips && (
            <div className="px-6 pb-6 grid md:grid-cols-2 gap-4">
              {storyboardTips.map((tip, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-semibold mb-2 text-primary">{tip.title}</h4>
                  <p className="text-sm text-neutral-600">{tip.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </main>
    </AuthGuard>
  );
}
