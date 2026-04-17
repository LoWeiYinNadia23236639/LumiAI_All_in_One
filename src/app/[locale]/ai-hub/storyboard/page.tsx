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
  Clock,
  Download,
  Copy,
  CheckCircle,
  Lightbulb,
  Play,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Scene {
  id: number;
  shot: string;
  action: string;
  lighting: string;
  duration: string;
}

interface StoryboardResult {
  title: string;
  scenes: Scene[];
  equipment: string[];
  estimatedTime: string;
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
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StoryboardResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [showExamples, setShowExamples] = useState(true);

  const generate = () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setResult({
        title: "Morning Glow Skincare Routine",
        scenes: [
          { 
            id: 1, 
            shot: "Wide shot - Bedroom with natural light", 
            action: "Wake up, stretch, look at phone",
            lighting: "Soft morning sun, golden hour",
            duration: "3s"
          },
          { 
            id: 2, 
            shot: "Medium close-up - Bathroom mirror", 
            action: "Splash water on face, satisfied smile",
            lighting: "Bright, even bathroom lighting",
            duration: "5s"
          },
          { 
            id: 3, 
            shot: "Close-up - Product in hand", 
            action: "Unscrew cap, show texture on fingers",
            lighting: "Macro ring light for product detail",
            duration: "4s"
          },
          { 
            id: 4, 
            shot: "Medium shot - Application process", 
            action: "Apply serum, massage gently upward",
            lighting: "Natural side light for dimension",
            duration: "8s"
          },
          { 
            id: 5, 
            shot: "Close-up - Final glow", 
            action: "Turn face, show radiant skin, wink",
            lighting: "Golden backlight for glow effect",
            duration: "5s"
          },
        ],
        equipment: ["Ring light (optional)", "Tripod", "iPhone 14 Pro or better"],
        estimatedTime: "2 hours filming"
      });
      setLoading(false);
    }, 2000);
  };

  const loadExample = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyToClipboard = () => {
    if (!result) return;
    const text = `
${result.title}

${result.scenes.map(s => `
Scene ${s.id}: ${s.shot}
Action: ${s.action}
Lighting: ${s.lighting}
Duration: ${s.duration}
`).join('')}

Equipment: ${result.equipment.join(", ")}
Estimated Time: ${result.estimatedTime}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
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
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Describe your video idea
          </label>
          <textarea
            placeholder="Example: A 30-second morning skincare routine showing a person waking up refreshed, washing their face, and applying serum with a natural glow..."
            className="w-full h-32 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none mb-4"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="flex items-center justify-between">
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
                  Generating Storyboard...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate Storyboard
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Result Section */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border overflow-hidden"
          >
            {/* Result Header */}
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">AI-Generated Storyboard</span>
                </div>
                <h2 className="text-2xl font-bold">{result.title}</h2>
                <p className="text-white/80 flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {result.estimatedTime}
                  </span>
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
                    key={scene.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 p-4 bg-violet-50 rounded-xl border border-violet-100"
                  >
                    <div className="w-12 h-12 rounded-xl bg-violet-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {scene.id}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-violet-900 mb-1">{scene.shot}</h3>
                      <p className="text-neutral-700 mb-2">{scene.action}</p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-1 text-neutral-600 bg-white px-2 py-1 rounded-lg">
                          <Sun className="w-4 h-4 text-amber-500" />
                          {scene.lighting}
                        </span>
                        <span className="flex items-center gap-1 text-neutral-600 bg-white px-2 py-1 rounded-lg">
                          <Clock className="w-4 h-4 text-blue-500" />
                          {scene.duration}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Equipment */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-violet-500" />
                  Recommended Equipment
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.equipment.map((item, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white border rounded-lg text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

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
  );
}
