"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  MessageSquare,
  ArrowLeft,
  Sparkles,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Quote,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth-guard";
import { AiGenerationHistory } from "@/components/ai-generation-history";
import { AiLoadingText } from "@/components/ai-loading-text";
import { useToast } from "@/components/ui/toast";
import { callGenerate, AiAuthError } from "@/lib/ai/client";
import { useTranslations, useLocale } from "next-intl";

interface CaptionResult {
  text: string;
  hashtags: string[];
  emoji: string;
}

const tones = [
  { id: "confident", example: "I didn't come this far to only come this far. 🔥" },
  { id: "playful", example: "POV: You finally figured out the lighting ✨" },
  { id: "inspiring", example: "Your future self is watching – make them proud 💪" },
  { id: "casual", example: "Just a casual Tuesday look, nothing special 😌" },
  { id: "professional", example: "3 strategies that transformed my content game 📈" },
];

const platforms = [
  { id: "instagram", label: "Instagram", maxLength: 2200 },
  { id: "tiktok", label: "TikTok", maxLength: 2200 },
  { id: "twitter", label: "Twitter/X", maxLength: 280 },
  { id: "linkedin", label: "LinkedIn", maxLength: 3000 },
];

const contentExamples = [
  {
    title: "Fitness Transformation",
    prompt: "3-month fitness journey, showing before/after progress, focused on consistency not perfection",
    platform: "instagram",
    tone: "inspiring"
  },
  {
    title: "Product Review",
    prompt: "Honest review of a new skincare product, sharing real results after 2 weeks of use",
    platform: "tiktok",
    tone: "casual"
  },
  {
    title: "Work Achievement",
    prompt: "Just landed a major brand partnership after 6 months of hard work creating content",
    platform: "linkedin",
    tone: "professional"
  },
  {
    title: "Behind the Scenes",
    prompt: "Funny bloopers and outtakes from today's shoot, showing the reality of content creation",
    platform: "tiktok",
    tone: "playful"
  }
];

export default function CaptionAIPage() {
  const t = useTranslations("aiTools");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { success, error: toastError } = useToast();
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("confident");
  const [platform, setPlatform] = useState("instagram");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [results, setResults] = useState<CaptionResult[]>([]);
  const [historyKey, setHistoryKey] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showExamples, setShowExamples] = useState(true);
  const [showTips, setShowTips] = useState(true);
  const example = t.raw("examples.caption") as { topic: string };
  const toneMeta = t.raw("captionPage.tones") as { label: string; desc: string }[];
  const platformTips = t.raw("captionPage.platformTips") as string[];
  const captionTips = t.raw("captionPage.tips") as string[];
  const tonesLocalized = tones.map((tone, i) => ({ ...tone, label: toneMeta[i].label, desc: toneMeta[i].desc }));

  const generate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(false);
    try {
      const data = await callGenerate<{ captions: CaptionResult[] }>("caption", {
        prompt,
        tone,
        platform,
        locale,
      });
      setResults(data.captions ?? []);
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

  const copy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    success(tc("copied"));
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const loadExample = (example: typeof contentExamples[0]) => {
    setPrompt(example.prompt);
    setPlatform(example.platform);
    setTone(example.tone);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthGuard>
    <main className="min-h-screen bg-gradient-to-b from-pink-50/50 to-white pt-24 pb-16">
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

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-700 text-sm font-semibold mb-4">
            <MessageSquare className="w-4 h-4" />
            {t("captionPage.badge")}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            {t("captionPage.titleBefore")} <span className="gradient-text">{t("captionPage.titleHighlight")}</span>
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {t("captionPage.subtitle")}
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
              <span className="font-semibold">{t("captionPage.examplesTitle")}</span>
            </div>
            {showExamples ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {showExamples && (
            <div className="p-4 border-t grid md:grid-cols-2 gap-4">
              {contentExamples.map((example, i) => (
                <button
                  key={i}
                  onClick={() => loadExample(example)}
                  className="text-left p-4 bg-gray-50 rounded-xl hover:bg-pink-50 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium group-hover:text-pink-600">{example.title}</span>
                    <span className="text-xs px-2 py-1 bg-white rounded-full text-neutral-500">
                      {platforms.find(p => p.id === example.platform)?.label}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 mb-2 line-clamp-2">{example.prompt}</p>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded-full">
                      {tonesLocalized.find(t => t.id === example.tone)?.label} {t("captionPage.toneSuffix")}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-lg border p-6 mb-8">
          {/* Platform Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-3">{t("captionPage.platformLabel")}</label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    platform === p.id
                      ? "bg-pink-500 text-white"
                      : "bg-gray-100 text-neutral-700 hover:bg-pink-100"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              💡 {platformTips[platforms.findIndex(p => p.id === platform)]}
            </p>
          </div>

          {/* Content Input */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-neutral-700">
                {t("captionPage.topicLabel")}
              </label>
              <Button variant="ghost" size="sm" onClick={() => setPrompt(example.topic)}>
                <Sparkles className="w-4 h-4 mr-2" />
                {tc("exampleButton")}
              </Button>
            </div>
            <textarea
              placeholder={t("captionPage.promptPlaceholder")}
              className="w-full h-32 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {/* Tone Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-3">{t("captionPage.toneLabel")}</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {tonesLocalized.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`p-3 rounded-xl text-left transition-all border ${
                    tone === t.id
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-pink-200"
                  }`}
                >
                  <p className="font-medium text-sm">{t.label}</p>
                  <p className="text-xs text-neutral-500">{t.desc}</p>
                </button>
              ))}
            </div>
            {tone && (
              <div className="mt-3 p-3 bg-pink-50 rounded-xl flex items-start gap-2">
                <Quote className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-pink-700 italic">
                  {t("captionPage.examplePrefix")} {tonesLocalized.find(t => t.id === tone)?.example}
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-xl flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {t("generateFailed")}
              </span>
              <Button size="sm" variant="outline" onClick={generate} disabled={loading}>
                {t("retry")}
              </Button>
            </div>
          )}

          <Button 
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 py-3 h-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t("generating")}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                {t("captionPage.generate")}
              </>
            )}
          </Button>
          {loading && <AiLoadingText toolKey="caption" className="mt-3 text-center" />}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{t("captionPage.resultsTitle")}</h3>
              <Button variant="outline" size="sm" onClick={() => setResults([])}>
                <RefreshCw className="w-4 h-4 mr-2" />
                {t("captionPage.regenerate")}
              </Button>
            </div>

            {results.map((caption, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  {/* Emoji + Top Pick */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl leading-none">{caption.emoji}</span>
                    {i === 0 && (
                      <span className="px-3 py-1 bg-pink-100 text-pink-700 text-xs rounded-full flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {t("captionPage.topPick")}
                      </span>
                    )}
                  </div>

                  {/* Caption Text */}
                  <p className="text-lg mb-4 leading-relaxed">{caption.text}</p>

                  {/* Hashtags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {caption.hashtags.map((tag, j) => (
                      <span key={j} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                        #{tag.replace(/^#/, "")}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copy(caption.text + "\n\n" + caption.hashtags.map(tag => "#" + tag.replace(/^#/, "")).join(" "), i)}
                    >
                      {copiedIndex === i ? (
                        <>
                          <Check className="w-4 h-4 mr-2 text-green-500" />
                          {tc("copied")}
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          {tc("copy")}
                        </>
                      )}
                    </Button>
                    <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                      {t("captionPage.useThis")}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* History */}
        <div className="mt-8">
          <AiGenerationHistory types={["caption"]} refreshKey={historyKey} />
        </div>

        {/* Tips */}
        <div className="mt-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white">
          <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            {t("captionPage.tipsTitle")}
          </h4>
          <ul className="space-y-2 text-white/90">
            <li className="flex items-start gap-2">
              <span className="text-white/60">•</span>
              {captionTips[0]}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white/60">•</span>
              {captionTips[1]}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white/60">•</span>
              {captionTips[2]}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white/60">•</span>
              {captionTips[3]}
            </li>
          </ul>
        </div>
      </div>
      </main>
    </AuthGuard>
  );
}
