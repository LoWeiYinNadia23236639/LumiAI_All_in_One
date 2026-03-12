"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Wand2, 
  FileText,
  TrendingUp,
  Sparkles,
  Image,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Zap,
  Clock,
  Briefcase,
  ClipboardList,
  Mail,
  Shield,
  DollarSign,
  PenTool,
  Target,
  CheckCircle,
  Star,
  Layout,
  Camera,
  Film,
  Hash,
  Lightbulb,
  Video,
  WandIcon,
  Megaphone,
  Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";

const aiTools = [
  {
    id: "storyboard",
    name: "Storyboard AI",
    icon: Image,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50",
    href: "/ai-hub/storyboard",
    description: "Generate visual storyboards and shot lists from your script",
    features: ["Scene breakdown", "Shot suggestions", "Lighting notes", "Equipment list"],
    demoExample: "Summer skincare routine - 5 scenes showing morning routine progression"
  },
  {
    id: "caption",
    name: "Caption AI",
    icon: MessageSquare,
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-50",
    href: "/ai-hub/caption",
    description: "Write viral captions that match your voice and boost engagement",
    features: ["Hook variations", "Hashtag suggestions", "Call-to-action", "Tone matching"],
    demoExample: "Fitness transformation post showing 3-month progress"
  },
  {
    id: "advisor",
    name: "Market Advisor",
    icon: TrendingUp,
    color: "from-orange-500 to-amber-600",
    bgColor: "bg-orange-50",
    href: "/ai-hub/advisor",
    description: "Your complete deal assistant - quotes, contracts, messages & project planning",
    features: [
      "Rate Calculator",
      "Job Quote Assistant", 
      "Message Assistant",
      "Project Planner",
      "Contract Scanner"
    ],
    demoExample: "Generate complete project quotes with timelines and draft professional emails",
    featured: true
  },
];

const advisorFeatures = [
  {
    icon: Briefcase,
    title: "Job Quote Assistant",
    description: "Describe your project and get instant time estimates, pricing recommendations, and deliverable breakdowns. Know exactly what to charge and how long it will take.",
    color: "text-orange-500",
    bgColor: "bg-orange-50"
  },
  {
    icon: Mail,
    title: "Message Assistant",
    description: "Draft professional emails and messages for any scenario - initial pitches, follow-ups, negotiations, counter offers, or polite declines. Choose your tone and get perfect copy.",
    color: "text-blue-500",
    bgColor: "bg-blue-50"
  },
  {
    icon: ClipboardList,
    title: "Project Planner",
    description: "Create detailed project plans with phase breakdowns, task timelines, critical milestones, and resource requirements. Stay organized from kickoff to delivery.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50"
  },
  {
    icon: BarChart3,
    title: "Rate Calculator",
    description: "Get personalized rate recommendations based on your niche, follower count, engagement rate, and current market trends. Know your worth.",
    color: "text-purple-500",
    bgColor: "bg-purple-50"
  },
  {
    icon: Shield,
    title: "Contract Scanner",
    description: "Upload brand contracts and get instant analysis of red flags, unfair terms, and potential risks. Understand what you're signing before you commit.",
    color: "text-red-500",
    bgColor: "bg-red-50"
  }
];

const storyboardFeatures = [
  {
    icon: Layout,
    title: "Visual Storyboarding",
    description: "Transform your script into detailed visual storyboards with scene-by-scene breakdowns. Plan every shot before you pick up your camera.",
    color: "text-violet-500",
    bgColor: "bg-violet-50"
  },
  {
    icon: Camera,
    title: "Shot Suggestions",
    description: "Get AI-powered shot recommendations including angles, framing, and camera movements that best tell your story.",
    color: "text-purple-500",
    bgColor: "bg-purple-50"
  },
  {
    icon: Lightbulb,
    title: "Lighting Notes",
    description: "Receive professional lighting suggestions for each scene to create the perfect mood and atmosphere for your content.",
    color: "text-amber-500",
    bgColor: "bg-amber-50"
  },
  {
    icon: Film,
    title: "Equipment List",
    description: "Generate a complete equipment checklist for your shoot including cameras, lenses, lighting, and audio gear.",
    color: "text-pink-500",
    bgColor: "bg-pink-50"
  }
];

const captionFeatures = [
  {
    icon: WandIcon,
    title: "Hook Variations",
    description: "Get multiple attention-grabbing opening lines designed to stop the scroll and boost your content's performance in the first 3 seconds.",
    color: "text-pink-500",
    bgColor: "bg-pink-50"
  },
  {
    icon: Hash,
    title: "Smart Hashtags",
    description: "Receive AI-generated hashtag suggestions based on your content, niche, and trending topics to maximize discoverability.",
    color: "text-rose-500",
    bgColor: "bg-rose-50"
  },
  {
    icon: Megaphone,
    title: "Call-to-Action",
    description: "Generate compelling CTAs that drive engagement, comments, saves, and conversions tailored to your specific goals.",
    color: "text-orange-500",
    bgColor: "bg-orange-50"
  },
  {
    icon: Palette,
    title: "Tone Matching",
    description: "Match your caption's voice to your brand personality - whether it's casual, professional, playful, or inspirational.",
    color: "text-fuchsia-500",
    bgColor: "bg-fuchsia-50"
  }
];

export default function AIHubPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-violet-50/30 to-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-pink-100 text-violet-700 text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered Creator Tools
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Supercharge Your Content with <span className="gradient-text">AI</span>
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Generate storyboards, write viral captions, get market insights, and analyze contracts — all powered by AI.
          </p>
        </div>

        {/* Tool Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {aiTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={tool.href}>
                <div className={`group bg-white rounded-2xl p-6 border-2 shadow-lg hover:shadow-xl transition-all h-full flex flex-col ${tool.featured ? 'border-orange-200 relative' : 'border-transparent hover:border-violet-200'}`}>
                  {tool.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full">
                      5 TOOLS IN 1
                    </div>
                  )}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
                  <p className="text-neutral-600 text-sm mb-4 flex-1">{tool.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tool.features.slice(0, 4).map((feature, i) => (
                      <span key={i} className={`px-2 py-1 ${tool.bgColor} text-neutral-700 rounded text-xs`}>
                        {feature}
                      </span>
                    ))}
                    {tool.features.length > 4 && (
                      <span className={`px-2 py-1 ${tool.bgColor} text-neutral-700 rounded text-xs`}>
                        +{tool.features.length - 4} more
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-violet-600 font-medium text-sm">
                    Try it now
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Storyboard AI Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl p-1">
            <div className="bg-white rounded-[22px] p-8 md:p-12">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold mb-4">
                  <Camera className="w-4 h-4" />
                  Visual Content Planning
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                  Plan Like a Pro with Storyboard AI
                </h2>
                <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                  Transform your creative vision into detailed production plans. Get shot lists, lighting notes, and equipment recommendations — all from a simple script.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {storyboardFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100 transition-all"
                  >
                    <div className={`w-12 h-12 rounded-xl ${feature.bgColor} ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-neutral-600">{feature.description}</p>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <Link href="/ai-hub/storyboard">
                  <Button className="bg-gradient-to-r from-violet-500 to-purple-500 px-8 py-3 h-auto text-lg">
                    <Camera className="w-5 h-5 mr-2" />
                    Create Your Storyboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Caption AI Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 rounded-3xl p-1">
            <div className="bg-white rounded-[22px] p-8 md:p-12">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-700 text-sm font-semibold mb-4">
                  <MessageSquare className="w-4 h-4" />
                  Viral Content Writing
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                  Write Captions That Convert
                </h2>
                <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                  Craft engaging, scroll-stopping captions that match your voice and drive real engagement. From hooks to hashtags, we've got you covered.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {captionFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100 transition-all"
                  >
                    <div className={`w-12 h-12 rounded-xl ${feature.bgColor} ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-neutral-600">{feature.description}</p>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <Link href="/ai-hub/caption">
                  <Button className="bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-3 h-auto text-lg">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Write Viral Captions
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Market Advisor Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-3xl p-1">
            <div className="bg-white rounded-[22px] p-8 md:p-12">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold mb-4">
                  <Star className="w-4 h-4" />
                  Featured: Market Advisor
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                  Your Complete Deal Assistant
                </h2>
                <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                  From quote to contract, the Market Advisor guides you through every step of your brand partnerships with AI-powered insights.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {advisorFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100 transition-all"
                  >
                    <div className={`w-12 h-12 rounded-xl ${feature.bgColor} ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-neutral-600">{feature.description}</p>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <Link href="/ai-hub/advisor">
                  <Button className="bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-3 h-auto text-lg">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Open Market Advisor
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works - For all tools */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-neutral-600 mb-8 max-w-2xl mx-auto">
            Each AI tool is designed to save you time and elevate your content. Choose the tool that fits your current need.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Storyboard Workflow */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="font-bold text-lg">Storyboard AI</h3>
              </div>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-violet-200 text-violet-700 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span>Describe your video concept or paste your script</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-violet-200 text-violet-700 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span>AI breaks it down into scenes with shot suggestions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-violet-200 text-violet-700 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span>Get lighting notes and equipment checklist</span>
                </li>
              </ol>
            </div>

            {/* Caption Workflow */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-pink-600" />
                </div>
                <h3 className="font-bold text-lg">Caption AI</h3>
              </div>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-pink-200 text-pink-700 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span>Upload your photo or describe your content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-pink-200 text-pink-700 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span>Select your tone and content goal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-pink-200 text-pink-700 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span>Get viral caption options with hashtags</span>
                </li>
              </ol>
            </div>

            {/* Market Advisor Workflow */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-bold text-lg">Market Advisor</h3>
              </div>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span>Describe your brand collaboration opportunity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span>Get quotes, draft messages, plan projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span>Scan contracts and finalize your deal</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-gradient-to-r from-violet-600 via-pink-500 to-orange-400 rounded-3xl p-8 md:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Save Hours on Content Creation</h2>
              <p className="text-white/90 mb-6">
                Our AI tools help you plan, write, and strategize your content in minutes instead of hours. 
                Join 10,000+ creators who use LumiAI to create better content faster.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span>10x Faster</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Save 5+ hrs/week</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  <span>Better Results</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {[
                "Storyboard AI plans your visual content before you shoot",
                "Caption AI writes engaging copy that matches your voice",
                "Market Advisor handles your business negotiations",
                "All tools work together for seamless content creation"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">✓</span>
                  </div>
                  <span className="text-white/90">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
