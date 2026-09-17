"use client";

import { useState } from "react";
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
  AlertCircle
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

export default function StoryboardAIPage() {
  const t = useTranslations("aiTools");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { success, error: toastError } = useToast();
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
                <p className="text-cream/80 flex items-center gap-4 mt-1">
                  <span>{t("storyboardPage.scenesCount", { count: result.scenes.length })}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="border-cream text-cream hover:bg-cream/20"
                  onClick={copyToClipboard}
                >
                  {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? t("storyboardPage.copiedExcl") : tc("copy")}
                </Button>
                <Button className="bg-cream text-primary hover:bg-paper">
                  <Download className="w-4 h-4 mr-2" />
                  {t("storyboardPage.exportLabel")}
                </Button>
              </div>
            </div>

            <div className="p-6">
              {/* Scenes */}
              <div className="space-y-4 mb-8">
                {result.scenes.map((scene, index) => (
                  <motion.div
                    key={scene.scene_number}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 p-4 bg-paper rounded-lg border-t-2 border-ink/40"
                  >
                    <div className="font-quote text-3xl text-ink/30 leading-none pt-1 flex-shrink-0">
                      {String(scene.scene_number).padStart(2, "0")}
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
