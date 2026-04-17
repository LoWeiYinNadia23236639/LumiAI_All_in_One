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
  CheckCircle,
  RefreshCw,
  Heart,
  TrendingUp,
  Zap,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Quote
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CaptionResult {
  text: string;
  engagement: "high" | "medium" | "low";
  hashtags: string[];
  cta: string;
}

const tones = [
  { id: "confident", label: "Confident", desc: "Bold and self-assured", example: "I didn't come this far to only come this far. 🔥" },
  { id: "playful", label: "Playful", desc: "Fun and lighthearted", example: "POV: You finally figured out the lighting ✨" },
  { id: "inspiring", label: "Inspiring", desc: "Motivational and uplifting", example: "Your future self is watching – make them proud 💪" },
  { id: "casual", label: "Casual", desc: "Relaxed and conversational", example: "Just a casual Tuesday look, nothing special 😌" },
  { id: "professional", label: "Professional", desc: "Polished and business-like", example: "3 strategies that transformed my content game 📈" },
];

const platforms = [
  { id: "instagram", label: "Instagram", maxLength: 2200, bestPractice: "Use line breaks for readability" },
  { id: "tiktok", label: "TikTok", maxLength: 2200, bestPractice: "Keep it short and punchy" },
  { id: "twitter", label: "Twitter/X", maxLength: 280, bestPractice: "Hook in first 100 characters" },
  { id: "linkedin", label: "LinkedIn", maxLength: 3000, bestPractice: "Tell a story with value" },
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
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("confident");
  const [platform, setPlatform] = useState("instagram");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CaptionResult[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showExamples, setShowExamples] = useState(true);
  const [showTips, setShowTips] = useState(true);

  const generate = () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setResults([
        {
          text: "3 months ago, I couldn't run a mile without stopping. Today I finished my first half marathon. The only secret? Showing up, even when you don't feel like it. 💪✨",
          engagement: "high",
          hashtags: ["#fitnessjourney", "#transformation", "#running", "#motivation", "#nevergiveup"],
          cta: "What's your fitness goal? Drop it below! 👇"
        },
        {
          text: "This transformation isn't just physical. It's about proving to myself that I'm capable of more than I thought. 3 months of early mornings and zero regrets. 🏃‍♀️",
          engagement: "high",
          hashtags: ["#selfimprovement", "#mindset", "#growth", "#fitness"],
          cta: "Double tap if you're on your own journey! ❤️"
        },
        {
          text: "POV: You decided to stop making excuses and start making progress. The glow up is real, inside and out. 90 days, infinite growth. 💫",
          engagement: "medium",
          hashtags: ["#glowup", "#progress", "#fitnessmotivation", "#transformationtuesday"],
          cta: "Save this for when you need motivation! 📌"
        },
      ]);
      setLoading(false);
    }, 1800);
  };

  const copy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const loadExample = (example: typeof contentExamples[0]) => {
    setPrompt(example.prompt);
    setPlatform(example.platform);
    setTone(example.tone);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case "high": return "bg-green-100 text-green-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50/50 to-white pt-24 pb-16">
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-700 text-sm font-semibold mb-4">
            <MessageSquare className="w-4 h-4" />
            AI Caption Generator
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Write Viral <span className="gradient-text">Captions</span>
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Generate engaging captions that match your voice and boost engagement across all platforms.
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
              <span className="font-semibold">Try These Content Examples</span>
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
                      {tones.find(t => t.id === example.tone)?.label} tone
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
            <label className="block text-sm font-medium text-neutral-700 mb-3">Platform</label>
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
              💡 {platforms.find(p => p.id === platform)?.bestPractice}
            </p>
          </div>

          {/* Content Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              What are you posting about?
            </label>
            <textarea
              placeholder="Example: Just completed my 3-month fitness transformation journey, want to inspire others..."
              className="w-full h-32 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {/* Tone Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-3">Tone</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {tones.map((t) => (
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
                  Example: {tones.find(t => t.id === tone)?.example}
                </p>
              </div>
            )}
          </div>

          <Button 
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 py-3 h-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating captions...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Captions
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Generated Captions</h3>
              <Button variant="outline" size="sm" onClick={() => setResults([])}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
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
                  {/* Engagement Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getEngagementColor(caption.engagement)}`}>
                      <TrendingUp className="w-3 h-3" />
                      {caption.engagement === "high" ? "High Engagement Predicted" : 
                       caption.engagement === "medium" ? "Good Engagement" : "Standard Engagement"}
                    </span>
                    {i === 0 && (
                      <span className="px-3 py-1 bg-pink-100 text-pink-700 text-xs rounded-full flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Top Pick
                      </span>
                    )}
                  </div>

                  {/* Caption Text */}
                  <p className="text-lg mb-4 leading-relaxed">{caption.text}</p>

                  {/* CTA */}
                  <p className="text-neutral-600 mb-4 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500" />
                    {caption.cta}
                  </p>

                  {/* Hashtags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {caption.hashtags.map((tag, j) => (
                      <span key={j} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copy(caption.text + "\n\n" + caption.hashtags.join(" ") + "\n\n" + caption.cta, i)}
                    >
                      {copiedIndex === i ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                      Use This
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Tips */}
        <div className="mt-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white">
          <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Pro Tips for Better Captions
          </h4>
          <ul className="space-y-2 text-white/90">
            <li className="flex items-start gap-2">
              <span className="text-white/60">•</span>
              Start with a hook in the first line to stop the scroll
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white/60">•</span>
              Use line breaks to make your caption skimmable
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white/60">•</span>
              Include a clear call-to-action to boost engagement
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white/60">•</span>
              Match your caption length to the platform (shorter for TikTok, longer for LinkedIn)
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
