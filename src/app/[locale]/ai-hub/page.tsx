"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Camera,
  MessageSquare,
  Star,
  Briefcase,
  Mail,
  ClipboardList,
  BarChart3,
  Shield,
  Layout,
  Lightbulb,
  Film,
  Hash,
  Megaphone,
  Palette,
  ArrowRight,
  Zap,
  Clock,
  Target,
  Wand2,
  Image,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth-guard";
import { MarqueeBanner } from "@/components/marquee-banner";
import { useTranslations } from "next-intl";

const toolNav = [
  {
    id: "storyboard",
    name: "Storyboard AI",
    icon: Image,
    href: "/ai-hub/storyboard",
  },
  {
    id: "caption",
    name: "Caption AI",
    icon: MessageSquare,
    href: "/ai-hub/caption",
  },
  {
    id: "advisor",
    name: "Market Advisor",
    icon: TrendingUp,
    href: "/ai-hub/advisor",
    featured: true,
  },
];

const advisorFeatures = [
  { icon: Briefcase },
  { icon: Mail },
  { icon: ClipboardList },
  { icon: BarChart3 },
  { icon: Shield },
];

const storyboardFeatures = [
  { icon: Layout },
  { icon: Camera },
  { icon: Lightbulb },
  { icon: Film },
];

const captionFeatures = [
  { icon: Wand2 },
  { icon: Hash },
  { icon: Megaphone },
  { icon: Palette },
];

export default function AIHubPage() {
  const t = useTranslations("aiTools");
  const toolDescs = t.raw("hub.toolDescs") as string[];
  const hubStoryboardFeatures = t.raw("hub.storyboard.features") as { title: string; description: string }[];
  const hubCaptionFeatures = t.raw("hub.caption.features") as { title: string; description: string }[];
  const hubAdvisorFeatures = t.raw("hub.advisor.features") as { title: string; description: string }[];
  const storyboardSteps = t.raw("hub.howItWorks.storyboardSteps") as string[];
  const captionSteps = t.raw("hub.howItWorks.captionSteps") as string[];
  const advisorSteps = t.raw("hub.howItWorks.advisorSteps") as string[];
  const highlightStats = t.raw("hub.highlights.stats") as string[];
  const highlightItems = t.raw("hub.highlights.items") as string[];
  const marqueeItems = t.raw("marqueeItems") as string[];

  const toolSections = [
    {
      num: "01",
      kicker: t("storyboardKicker"),
      title: t("hub.storyboard.title"),
      desc: t("hub.storyboard.desc"),
      cta: t("hub.storyboard.cta"),
      href: "/ai-hub/storyboard",
      icons: storyboardFeatures,
      features: hubStoryboardFeatures,
      wrap: "bg-cream",
      dark: false,
    },
    {
      num: "02",
      kicker: t("captionKicker"),
      title: t("hub.caption.title"),
      desc: t("hub.caption.desc"),
      cta: t("hub.caption.cta"),
      href: "/ai-hub/caption",
      icons: captionFeatures,
      features: hubCaptionFeatures,
      wrap: "bg-primary",
      dark: true,
    },
    {
      num: "03",
      kicker: t("advisorKicker"),
      title: t("hub.advisor.title"),
      desc: t("hub.advisor.desc"),
      cta: t("hub.advisor.cta"),
      href: "/ai-hub/advisor",
      icons: advisorFeatures,
      features: hubAdvisorFeatures,
      wrap: "bg-paper border-y border-line",
      dark: false,
    },
  ];

  return (
    <AuthGuard>
    <main className="min-h-screen bg-cream pt-24 pb-16 overflow-x-clip">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="oval-label mb-4">{t("kicker")}</div>
          <h1 className="text-4xl md:text-5xl text-ink mb-4">
            {t("hub.titleBefore")} <span className="text-ink">{t("hub.titleHighlight")}</span>
          </h1>
          <p className="font-quote text-xl md:text-2xl text-ink-soft max-w-2xl mx-auto">
            {t("hub.subtitle")}
          </p>
        </div>
      </div>

      <MarqueeBanner items={marqueeItems} />

      {/* Tool Directory */}
      <div className="max-w-6xl mx-auto px-4 mt-10 mb-4">
        {toolNav.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={tool.href} className="group block border-t border-line hover:bg-primary-soft transition-colors">
              <div className="relative flex items-center gap-6 px-2 md:px-6 py-6">
                {tool.featured && (
                  <div className="absolute -top-3 right-4 px-3 py-1 bg-primary text-cream text-xs font-bold rounded-full">
                    {t("hub.fiveInOne")}
                  </div>
                )}
                <span className="font-quote text-4xl md:text-5xl text-primary flex-shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold mb-1">{tool.name}</h3>
                  <p className="text-neutral-600 text-sm">{toolDescs[index]}</p>
                </div>
                <span className="text-2xl text-primary flex-shrink-0 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Three tool sections — magazine departments */}
      {toolSections.map((tool, ti) => (
        <div key={tool.num}>
          <section className={`relative overflow-hidden ${tool.wrap}`}>
            {/* Watermark number — deliberately cropped */}
            <span
              aria-hidden
              className={`pointer-events-none select-none absolute -top-8 font-quote text-[10rem] leading-none ${
                tool.dark ? "text-cream/10" : "text-ink/8"
              } ${ti % 2 === 0 ? "-right-6" : "-left-6"}`}
            >
              {tool.num}
            </span>
            <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 md:py-20">
              <div className="text-center mb-10">
                <div
                  className={`inline-flex items-center rounded-full border px-4 py-1 text-xs uppercase tracking-widest mb-5 ${
                    tool.dark ? "border-cream/40 text-cream" : "border-primary/40 text-primary"
                  }`}
                >
                  {tool.kicker}
                </div>
                <h2 className={`text-3xl md:text-4xl mb-4 ${tool.dark ? "text-cream" : "text-ink"}`}>
                  {tool.title}
                </h2>
                <p className={`font-quote text-xl max-w-2xl mx-auto ${tool.dark ? "text-cream/80" : "text-ink-soft"}`}>
                  {tool.desc}
                </p>
              </div>

              <div className={`grid gap-6 mb-10 ${tool.features.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4"}`}>
                {tool.features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index }}
                    className={`p-6 rounded-lg border transition-colors ${
                      tool.dark
                        ? "bg-cream/5 border-cream/20 hover:border-cream/40"
                        : "bg-paper border-line hover:border-primary/40"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                        tool.dark ? "bg-cream/15 text-cream" : "bg-primary-soft text-primary"
                      }`}
                    >
                      {(() => {
                        const Icon = tool.icons[index % tool.icons.length].icon;
                        return <Icon className="w-6 h-6" />;
                      })()}
                    </div>
                    <h3 className={`font-bold text-lg mb-2 ${tool.dark ? "text-cream" : "text-ink"}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm ${tool.dark ? "text-cream/70" : "text-ink-soft"}`}>
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <Link href={tool.href} className="group inline-block">
                  <Button
                    size="lg"
                    className={
                      tool.dark
                        ? "px-8 py-6 text-lg bg-cream text-primary hover:bg-white"
                        : "px-8 py-6 text-lg"
                    }
                  >
                    {tool.cta}
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Marquee divider between departments */}
          {ti < toolSections.length - 1 && <MarqueeBanner items={marqueeItems} />}
        </div>
      ))}

      <div className="max-w-6xl mx-auto px-4 mt-16">
        {/* How It Works - For all tools */}
        <div className="mb-16">
          <h2 className="text-2xl text-center mb-4">{t("hub.howItWorks.title")}</h2>
          <p className="text-center text-ink-soft mb-8 max-w-2xl mx-auto">
            {t("hub.howItWorks.subtitle")}
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Storyboard Workflow */}
            <div className="bg-paper border border-line rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">Storyboard AI</h3>
              </div>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-soft text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span>{storyboardSteps[0]}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-soft text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span>{storyboardSteps[1]}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-soft text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span>{storyboardSteps[2]}</span>
                </li>
              </ol>
            </div>

            {/* Caption Workflow */}
            <div className="bg-paper border border-line rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">Caption AI</h3>
              </div>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-soft text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span>{captionSteps[0]}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-soft text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span>{captionSteps[1]}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-soft text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span>{captionSteps[2]}</span>
                </li>
              </ol>
            </div>

            {/* Market Advisor Workflow */}
            <div className="bg-paper border border-line rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">Market Advisor</h3>
              </div>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-soft text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span>{advisorSteps[0]}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-soft text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span>{advisorSteps[1]}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-soft text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span>{advisorSteps[2]}</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-primary rounded-lg p-8 md:p-12 text-cream">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl mb-4">{t("hub.highlights.title")}</h2>
              <p className="text-cream/90 mb-6">
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
                  <div className="w-6 h-6 rounded-full bg-cream/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">✓</span>
                  </div>
                  <span className="text-cream/90">{item}</span>
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
