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

const tips = [
  { title: "Be Specific", content: "Include details like duration, setting, camera angles, and key actions. The more specific, the better the storyboard." },
  { title: "Add Timing", content: "Mention total video length so we can suggest appropriate pacing for each scene." },
  { title: "Include Context", content: "Tell us about your audience and the purpose - this helps tailor shot suggestions." },
  { title: "Mention Style", content: "Describe the vibe - professional, casual, energetic, calming - we match the shots to your style." },
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
Scene ${s.scene_number}: ${s.shot_angle}
Action: ${s.description}
Lighting: ${s.lighting}
`).join('')}

Equipment: ${result.equipment_checklist.join(", ")}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    success(tc("copied"));
    setTimeout(() => setCopied(false), 2000);
  };

  const copyScene = (scene: Scene) => {
    navigator.clipboard.writeText(
      `Scene ${scene.scene_number}: ${scene.shot_angle}\n${scene.description}\nLighting: ${scene.lighting}`
    );
    setCopiedScene(scene.scene_number);
    success(tc("copied"));
    setTimeout(() => setCopiedScene(null), 1500);
  };

  const copyLists = () => {
    if (!result) return;
    const text = [
      `Equipment: ${result.equipment_checklist.join(", ")}`,
      result.pro_tips.length > 0
        ? `Tips:\n${result.pro_tips.map((tip) => `- ${tip}`).join("\n")}`
        : "",
    ].filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopiedLists(true);
    success(tc("copied"));
    setTimeout(() => setCopiedLists(false), 1500);
  };

  return (
    <AuthGuard>
    <main className="min-h-screen bg-gradient-to-b from-violet-50/50 to-white pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/ai-hub">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to AI Hub
            </Button>
          </Link>
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold mb-4">
            <Image className="w-4 h-4" />
            AI Storyboard Generator
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Visualize Your <span className="gradient-text">Content</span>
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Describe your video idea and get a complete storyboard with shot suggestions, lighting notes, and equipment recommendations.
          </p>
        </div>

        {/* Examples Section */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-8">
          <button 
            onClick={() => setShowExamples(!showExamples)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <span className="font-semibold">Try These Examples</span>
            </div>
            {showExamples ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {showExamples && (
            <div className="p-4 border-t grid md:grid-cols-2 gap-4">
              {examples.map((example, i) => (
                <button
                  key={i}
                  onClick={() => loadExample(example.prompt)}
                  className="text-left p-4 bg-gray-50 rounded-xl hover:bg-violet-50 transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="w-4 h-4 text-violet-500" />
                    <span className="font-medium group-hover:text-violet-600">{example.title}</span>
                  </div>
                  <p className="text-sm text-neutral-500 mb-2 line-clamp-2">{example.prompt}</p>
                  <p className="text-xs text-violet-600">{example.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-lg border p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-neutral-700">
              Describe your video idea
            </label>
            <Button variant="ghost" size="sm" onClick={fillExample}>
              <Sparkles className="w-4 h-4 mr-2" />
              {tc("exampleButton")}
            </Button>
          </div>
          <textarea
            placeholder="Example: A 30-second morning skincare routine showing a person waking up refreshed, washing their face, and applying serum with a natural glow..."
            className="w-full h-32 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none mb-4"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Mood / Atmosphere (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. cozy morning, high-energy, cinematic, minimalist..."
            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4"
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
              Tip: Include duration, setting, and key actions for best results
            </p>
            <Button 
              onClick={generate}
              disabled={loading || !prompt.trim()}
              className="bg-gradient-to-r from-violet-500 to-purple-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t("generating")}
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate Storyboard
                </>
              )}
            </Button>
          </div>
          {loading && <AiLoadingText toolKey="storyboard" className="mt-3" />}
        </div>

        {/* Result Section */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border overflow-hidden"
          >
            {/* Result Header */}
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">AI-Generated Storyboard</span>
                </div>
                <h2 className="text-2xl font-bold">{prompt.slice(0, 60)}</h2>
                <p className="text-white/80 flex items-center gap-4 mt-1">
                  <span>{result.scenes.length} scenes</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/20"
                  onClick={copyToClipboard}
                >
                  {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button className="bg-white text-violet-600 hover:bg-gray-100">
                  <Download className="w-4 h-4 mr-2" />
                  Export
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
                    className="flex gap-4 p-4 bg-violet-50 rounded-xl border border-violet-100"
                  >
                    <div className="w-12 h-12 rounded-xl bg-violet-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {scene.scene_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-violet-900 mb-1">{scene.shot_angle}</h3>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0" onClick={() => copyScene(scene)} aria-label={tc("copy")}>
                          {copiedScene === scene.scene_number ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-neutral-700 mb-2">{scene.description}</p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-1 text-neutral-600 bg-white px-2 py-1 rounded-lg">
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
                    <Camera className="w-5 h-5 text-violet-500" />
                    Recommended Equipment
                  </h4>
                  <Button variant="ghost" size="sm" onClick={copyLists}>
                    {copiedLists ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copiedLists ? tc("copied") : tc("copy")}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.equipment_checklist.map((item, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white border rounded-lg text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pro Tips */}
              {result.pro_tips.length > 0 && (
                <div className="bg-violet-50 rounded-xl p-4 mt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-500" />
                    Director&apos;s Tips
                  </h4>
                  <ul className="space-y-2">
                    {result.pro_tips.map((tip, i) => (
                      <li key={i} className="text-sm text-neutral-700 flex items-start gap-2">
                        <span className="text-violet-400 mt-0.5">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* History */}
        <div className="mt-8">
          <AiGenerationHistory types={["storyboard"]} refreshKey={historyKey} />
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-white rounded-2xl border shadow-sm overflow-hidden">
          <button 
            onClick={() => setShowTips(!showTips)}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <h4 className="font-bold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              Pro Tips for Better Storyboards
            </h4>
            {showTips ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {showTips && (
            <div className="px-6 pb-6 grid md:grid-cols-2 gap-4">
              {tips.map((tip, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-semibold mb-2 text-violet-900">{tip.title}</h4>
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
