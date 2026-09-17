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
import { AuthGuard } from "@/components/auth-guard";
import { useTranslations } from "next-intl";

const aiTools = [
  {
    id: "storyboard",
    name: "Storyboard AI",
    icon: Image,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50",
    href: "/ai-hub/storyboard",
  },
  {
    id: "caption",
    name: "Caption AI",
    icon: MessageSquare,
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-50",
    href: "/ai-hub/caption",
  },
  {
    id: "advisor",
    name: "Market Advisor",
    icon: TrendingUp,
    color: "from-orange-500 to-amber-600",
    bgColor: "bg-orange-50",
    href: "/ai-hub/advisor",
    featured: true
  },
];

const advisorFeatures = [
  { icon: Briefcase, color: "text-orange-500", bgColor: "bg-orange-50" },
  { icon: Mail, color: "text-blue-500", bgColor: "bg-blue-50" },
  { icon: ClipboardList, color: "text-emerald-500", bgColor: "bg-emerald-50" },
  { icon: BarChart3, color: "text-purple-500", bgColor: "bg-purple-50" },
  { icon: Shield, color: "text-red-500", bgColor: "bg-red-50" }
];

const storyboardFeatures = [
  { icon: Layout, color: "text-violet-500", bgColor: "bg-violet-50" },
  { icon: Camera, color: "text-purple-500", bgColor: "bg-purple-50" },
  { icon: Lightbulb, color: "text-amber-500", bgColor: "bg-amber-50" },
  { icon: Film, color: "text-pink-500", bgColor: "bg-pink-50" }
];

const captionFeatures = [
  { icon: WandIcon, color: "text-pink-500", bgColor: "bg-pink-50" },
  { icon: Hash, color: "text-rose-500", bgColor: "bg-rose-50" },
  { icon: Megaphone, color: "text-orange-500", bgColor: "bg-orange-50" },
  { icon: Palette, color: "text-fuchsia-500", bgColor: "bg-fuchsia-50" }
];

export default function AIHubPage() {
  const t = useTranslations("aiTools");
  const toolDescs = t.raw("hub.toolDescs") as string[];
  const toolFeatures = t.raw("hub.toolFeatures") as string[][];
  const hubStoryboardFeatures = t.raw("hub.storyboard.features") as { title: string; description: string }[];
  const hubCaptionFeatures = t.raw("hub.caption.features") as { title: string; description: string }[];
  const hubAdvisorFeatures = t.raw("hub.advisor.features") as { title: string; description: string }[];
  const storyboardSteps = t.raw("hub.howItWorks.storyboardSteps") as string[];
  const captionSteps = t.raw("hub.howItWorks.captionSteps") as string[];
  const advisorSteps = t.raw("hub.howItWorks.advisorSteps") as string[];
  const highlightStats = t.raw("hub.highlights.stats") as string[];
  const highlightItems = t.raw("hub.highlights.items") as string[];
  return (
    <AuthGuard>
    <main className="min-h-screen bg-gradient-to-b from-white via-violet-50/30 to-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-pink-100 text-violet-700 text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            {t("hub.badge")}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            {t("hub.titleBefore")} <span className="gradient-text">{t("hub.titleHighlight")}</span>
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {t("hub.subtitle")}
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
                      {t("hub.fiveInOne")}
                    </div>
                  )}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
                  <p className="text-neutral-600 text-sm mb-4 flex-1">{toolDescs[index]}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {toolFeatures[index].slice(0, 4).map((feature, i) => (
                      <span key={i} className={`px-2 py-1 ${tool.bgColor} text-neutral-700 rounded text-xs`}>
                        {feature}
                      </span>
                    ))}
                    {toolFeatures[index].length > 4 && (
                      <span className={`px-2 py-1 ${tool.bgColor} text-neutral-700 rounded text-xs`}>
                        {t("hub.moreTools", { count: toolFeatures[index].length - 4 })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-violet-600 font-medium text-sm">
                    {t("hub.tryNow")}
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
                  {t("hub.storyboard.badge")}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                  {t("hub.storyboard.title")}
                </h2>
                <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                  {t("hub.storyboard.desc")}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {storyboardFeatures.map((feature, index) => (
                  <motion.div
                    key={hubStoryboardFeatures[index].title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100 transition-all"
                  >
                    <div className={`w-12 h-12 rounded-xl ${feature.bgColor} ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{hubStoryboardFeatures[index].title}</h3>
                    <p className="text-sm text-neutral-600">{hubStoryboardFeatures[index].description}</p>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <Link href="/ai-hub/storyboard">
                  <Button className="bg-gradient-to-r from-violet-500 to-purple-500 px-8 py-3 h-auto text-lg">
                    <Camera className="w-5 h-5 mr-2" />
                    {t("hub.storyboard.cta")}
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
                  {t("hub.caption.badge")}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                  {t("hub.caption.title")}
                </h2>
                <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                  {t("hub.caption.desc")}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {captionFeatures.map((feature, index) => (
                  <motion.div
                    key={hubCaptionFeatures[index].title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100 transition-all"
                  >
                    <div className={`w-12 h-12 rounded-xl ${feature.bgColor} ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{hubCaptionFeatures[index].title}</h3>
                    <p className="text-sm text-neutral-600">{hubCaptionFeatures[index].description}</p>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <Link href="/ai-hub/caption">
                  <Button className="bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-3 h-auto text-lg">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    {t("hub.caption.cta")}
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
                  {t("hub.advisor.badge")}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                  {t("hub.advisor.title")}
                </h2>
                <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                  {t("hub.advisor.desc")}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {advisorFeatures.map((feature, index) => (
                  <motion.div
                    key={hubAdvisorFeatures[index].title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100 transition-all"
                  >
                    <div className={`w-12 h-12 rounded-xl ${feature.bgColor} ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{hubAdvisorFeatures[index].title}</h3>
                    <p className="text-sm text-neutral-600">{hubAdvisorFeatures[index].description}</p>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <Link href="/ai-hub/advisor">
                  <Button className="bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-3 h-auto text-lg">
                    <Briefcase className="w-5 h-5 mr-2" />
                    {t("hub.advisor.cta")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works - For all tools */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-4">{t("hub.howItWorks.title")}</h2>
          <p className="text-center text-neutral-600 mb-8 max-w-2xl mx-auto">
            {t("hub.howItWorks.subtitle")}
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
                  <span>{storyboardSteps[0]}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-violet-200 text-violet-700 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span>{storyboardSteps[1]}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-violet-200 text-violet-700 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span>{storyboardSteps[2]}</span>
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
                  <span>{captionSteps[0]}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-pink-200 text-pink-700 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span>{captionSteps[1]}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-pink-200 text-pink-700 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span>{captionSteps[2]}</span>
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
                  <span>{advisorSteps[0]}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span>{advisorSteps[1]}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span>{advisorSteps[2]}</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-gradient-to-r from-violet-600 via-pink-500 to-orange-400 rounded-3xl p-8 md:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">{t("hub.highlights.title")}</h2>
              <p className="text-white/90 mb-6">
                {t("hub.highlights.desc")}
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span>{highlightStats[0]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{highlightStats[1]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  <span>{highlightStats[2]}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {highlightItems.map((item, i) => (
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
    </AuthGuard>
  );
}
