"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MarqueeBanner } from "@/components/marquee-banner";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getSupabaseClient } from "@/lib/supabase/client";
import { 
  Sparkles, 
  Wand2, 
  ShoppingBag, 
  Camera, 
  ArrowRight, 
  TrendingUp, 
  Shield, 
  Zap,
  Users,
  Brain,
  Handshake,
  CheckCircle,
  MessageSquare,
  Calendar
} from "lucide-react";

// Animation variants
const containerVariants = { 
  hidden: { opacity: 0 }, 
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.15 } 
  } 
};
const itemVariants = { 
  hidden: { opacity: 0, y: 30 }, 
  visible: { opacity: 1, y: 0 } 
};

const heroFeatures = [
  { 
    icon: Brain, 
    labelKey: "aiPowered", 
  },
  { 
    icon: Handshake, 
    labelKey: "brandDeals", 
  },
  { 
    icon: Camera, 
    labelKey: "rentGear", 
  },
];

function SectionDivider() {
  return (
    <div aria-hidden className="flex items-center justify-center gap-4 py-1">
      <span className="h-px w-16 bg-line" />
      <span className="text-sm text-accent">✦</span>
      <span className="h-px w-16 bg-line" />
    </div>
  );
}

export default function HomePage() {
  const t = useTranslations("home");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistState, setWaitlistState] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaitlistState("loading");
    const { error } = await getSupabaseClient().from("waitlist").insert({ email: waitlistEmail.trim() });
    if (!error) {
      setWaitlistState("success");
    } else if (error.code === "23505") {
      setWaitlistState("duplicate");
    } else {
      setWaitlistState("error");
    }
  };

  const mainFeatures = [
    {
      icon: Wand2,
      title: t("aiHubTitle"),
      subtitle: t("aiHubSubtitle"),
      desc: t("aiHubDesc"),
      href: "/ai-hub",
      stats: t("supercharge.aiHubStats"),
      features: t.raw("supercharge.aiHubFeatures") as string[]
    },
    {
      icon: ShoppingBag,
      title: t("marketplaceTitle"),
      subtitle: t("marketplaceSubtitle"),
      desc: t("marketplaceDesc"),
      href: "/marketplace",
      stats: t("supercharge.marketplaceStats"),
      features: t.raw("supercharge.marketplaceFeatures") as string[]
    },
    {
      icon: Camera,
      title: t("rentalTitle"),
      subtitle: t("rentalSubtitle"),
      desc: t("rentalDesc"),
      href: "/equipment",
      stats: t("supercharge.rentalStats"),
      features: t.raw("supercharge.rentalFeatures") as string[]
    },
  ];
  return (
    <div className="min-h-screen overflow-hidden bg-cream">
      {/* Hero Section */}
      <section
        className="relative pt-32 pb-20 px-4 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url(/images/hero-bg.jpg)" }}
      >
        {/* Scrim — brand-green gradient so text stays readable over the dark image */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(27,67,50,0.55) 0%, rgba(27,67,50,0.35) 45%, rgba(27,67,50,0.75) 100%)",
          }}
        />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Kicker */}
            <motion.div variants={itemVariants} className="mb-8 flex items-center justify-center gap-3 flex-wrap">
              <span className="oval-label oval-label-cream">
                <Sparkles className="w-3.5 h-3.5" />
                {t("badge")}
              </span>
              <span className="tag-dashed tag-dashed-cream uppercase">{t("new")}</span>
            </motion.div>
            
            {/* Main Headline */}
            <motion.h1 variants={itemVariants} className="font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight text-cream mb-6">
              {t("headlineCreate")}{" "}
              {t("headlineConnect")}{" "}
              {t("headlineEarn")}
            </motion.h1>
            
            <motion.p variants={itemVariants} className="font-quote text-2xl md:text-3xl text-cream/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t("subheadline")}
            </motion.p>

            {/* Quick Feature Icons */}
            <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4 mb-10">
              {heroFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full border border-cream/30 text-cream/80 bg-cream/5 backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-lg bg-cream/15 flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-cream" />
                  </div>
                  <span className="text-sm font-semibold">{t(feature.labelKey as any)}</span>
                </div>
              ))}
            </motion.div>
            
            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
              <Link href="/ai-hub">
                <Button size="lg" className="px-8 py-6 text-lg bg-cream text-primary hover:bg-white">
                  <Wand2 className="w-5 h-5 mr-2" />
                  {t("tryAiTools")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/marketplace/campaigns">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-cream text-cream hover:bg-cream/10 hover:text-cream">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {t("findBrandDeals")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/equipment">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-cream text-cream hover:bg-cream/10 hover:text-cream">
                  <Camera className="w-5 h-5 mr-2" />
                  {t("rentGear")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Marquee band */}
      <MarqueeBanner items={t.raw("marqueeItems") as string[]} />

      {/* Three Main Features - Editorial Columns */}
      <section className="relative py-20 px-4 bg-paper overflow-hidden">
        <span aria-hidden className="bg-outline-word top-[-0.22em]">CREATE</span>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <p className="uppercase tracking-widest text-xs font-semibold text-accent mb-4">LumiAI</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t("supercharge.titleBefore")} <span className="gradient-text">{t("supercharge.titleHighlight")}</span> {t("supercharge.titleAfter")}
            </h2>
            <p className="text-xl text-ink-soft max-w-2xl">
              {t("featuresSubtitle")}
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {mainFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="border-t border-ink pt-6"
              >
                <p className="oval-number mb-4">{String(i + 1).padStart(2, "0")}</p>
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-cream mb-5">
                  <feature.icon className="w-6 h-6" />
                </div>
                
                {/* Label */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-bold mb-4">
                  <Zap className="w-3 h-3" />
                  {feature.subtitle}
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-ink">{feature.title}</h3>
                <p className="text-ink-soft mb-6 leading-relaxed">{feature.desc}</p>
                
                {/* Features List */}
                <div className="space-y-2 mb-6">
                  {feature.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm text-ink-soft">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      {f}
                    </div>
                  ))}
                </div>
                
                {/* Stats */}
                <div className="p-3 rounded-lg bg-primary-soft mb-6">
                  <p className="text-sm font-semibold text-primary">{feature.stats}</p>
                </div>
                
                {/* Link */}
                <Link href={feature.href} className="group inline-flex items-center font-bold text-primary">
                  {t("supercharge.explore", { title: feature.title })}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* How It Works */}
      <section className="relative py-20 px-4 bg-primary overflow-hidden">
        <span aria-hidden className="bg-outline-word bg-outline-word-dark top-10">CONNECT</span>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-cream">{t("howItWorks")}</h2>
            <p className="text-xl text-cream/70">{t("howItWorksSubtitle")}</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: t("step1Title"), desc: t("step1Desc"), icon: Users },
              { step: "02", title: t("step2Title"), desc: t("step2Desc"), icon: ArrowRight },
              { step: "03", title: t("step3Title"), desc: t("step3Desc"), icon: Handshake },
              { step: "04", title: t("step4Title"), desc: t("step4Desc"), icon: TrendingUp },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-lg bg-cream/10 border border-cream/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <item.icon className="w-8 h-8 text-cream" />
                </div>
                <span className="text-5xl font-black text-cream/40 mb-2 block">{item.step}</span>
                <h3 className="text-xl font-bold mb-2 text-cream">{item.title}</h3>
                <p className="text-cream/70">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Closed Beta / Waitlist Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-primary rounded-xl p-8 md:p-12 text-center text-cream relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("closedBeta")}</h2>
              <p className="text-cream/80 mb-8 max-w-2xl mx-auto">
                {t("closedBetaDesc")}
              </p>
              {waitlistState === "success" ? (
                <p className="text-green-400 font-medium">{t("waitlistSuccess")}</p>
              ) : (
                <form
                  onSubmit={handleWaitlistSubmit}
                  className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                >
                  <input
                    type="email"
                    required
                    disabled={waitlistState === "loading"}
                    placeholder={t("waitlistPlaceholder")}
                    className="flex-1 px-4 py-3 rounded-lg bg-cream/10 border border-cream/20 text-cream placeholder:text-cream/50 focus:outline-none focus:ring-2 focus:ring-cream disabled:opacity-50"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                  />
                  <Button
                    type="submit"
                    disabled={waitlistState === "loading"}
                    className="bg-cream text-primary hover:bg-cream/90 px-6"
                  >
                    {waitlistState === "loading" ? "…" : t("waitlistButton")}
                  </Button>
                </form>
              )}
              {(waitlistState === "duplicate" || waitlistState === "error") && (
                <p className={`mt-4 text-sm font-medium ${waitlistState === "duplicate" ? "text-amber-400" : "text-red-400"}`}>
                  {t(waitlistState === "duplicate" ? "waitlistDuplicate" : "waitlistError")}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 bg-primary overflow-hidden">
        <span aria-hidden className="bg-outline-word bg-outline-word-dark bottom-[-0.28em]">EARN</span>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center text-cream relative z-10"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {t("ctaTitle")}
          </h2>
          <p className="text-xl text-cream/80 mb-8 max-w-2xl mx-auto">
            {t("ctaSubtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-cream text-primary hover:bg-cream/90">
                {t("getStartedFree")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/marketplace/talent">
              <Button size="lg" variant="outline" className="border-cream text-cream hover:bg-cream/10">
                {t("browseCreators")}
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-line bg-cream">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-cream" />
                </div>
                <span className="text-2xl font-bold gradient-text">LumiAI</span>
              </div>
              <p className="text-ink-soft text-sm">
                {t("footerTagline")}
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-ink">{t("footerPlatform")}</h4>
              <ul className="space-y-2 text-sm text-ink-soft">
                <li><Link href="/ai-hub" className="hover:text-primary transition-colors">{t("footer.aiHub")}</Link></li>
                <li><Link href="/marketplace" className="hover:text-primary transition-colors">{t("footer.marketplace")}</Link></li>
                <li><Link href="/equipment" className="hover:text-primary transition-colors">{t("footer.rentGear")}</Link></li>
                <li><Link href="/help" className="hover:text-primary transition-colors">{t("footer.helpCenter")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-ink">{t("footerForUsers")}</h4>
              <ul className="space-y-2 text-sm text-ink-soft">
                <li><Link href="/login" className="hover:text-primary transition-colors">{t("footer.creatorLogin")}</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">{t("footer.brandLogin")}</Link></li>

              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-ink">{t("footerResources")}</h4>
              <ul className="space-y-2 text-sm text-ink-soft">
                <li><Link href="/help" className="hover:text-primary transition-colors">{t("footer.documentation")}</Link></li>
                <li><Link href="/help" className="hover:text-primary transition-colors">{t("footer.tutorials")}</Link></li>
                <li><Link href="/help" className="hover:text-primary transition-colors">{t("footer.contactSupport")}</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-line text-center text-sm text-ink-soft">
            {t("copyright")}
          </div>
        </div>
      </footer>
    </div>
  );
}
