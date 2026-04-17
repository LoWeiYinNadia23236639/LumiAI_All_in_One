"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { 
  Sparkles, 
  Wand2, 
  ShoppingBag, 
  Camera, 
  ArrowRight, 
  TrendingUp, 
  Shield, 
  Zap, 
  Heart, 
  Users, 
  Star,
  Brain,
  Handshake,
  CheckCircle,
  MessageSquare,
  Calendar,
  DollarSign
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
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-100"
  },
  { 
    icon: Handshake, 
    labelKey: "brandDeals", 
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-100"
  },
  { 
    icon: Camera, 
    labelKey: "rentGear", 
    color: "from-orange-500 to-amber-600",
    bgColor: "bg-orange-100"
  },
];

export default function HomePage() {
  const t = useTranslations("home");

  const mainFeatures = [
    {
      icon: Wand2,
      title: t("aiHubTitle"),
      subtitle: t("aiHubSubtitle"),
      desc: t("aiHubDesc"),
      color: "violet",
      gradient: "from-violet-600 via-purple-600 to-indigo-600",
      bgGradient: "from-violet-50 via-purple-50 to-indigo-50",
      iconBg: "bg-violet-500",
      href: "/ai-hub",
      stats: "10K+ creators using daily",
      features: ["Storyboard AI", "Caption Generator", "Contract Scanner"]
    },
    {
      icon: ShoppingBag,
      title: t("marketplaceTitle"),
      subtitle: t("marketplaceSubtitle"),
      desc: t("marketplaceDesc"),
      color: "pink",
      gradient: "from-pink-500 via-rose-500 to-red-500",
      bgGradient: "from-pink-50 via-rose-50 to-red-50",
      iconBg: "bg-pink-500",
      href: "/marketplace",
      stats: "$2.5M+ paid to creators",
      features: ["Find Campaigns", "Discover Creators", "Secure Payments"]
    },
    {
      icon: Camera,
      title: t("rentalTitle"),
      subtitle: t("rentalSubtitle"),
      desc: t("rentalDesc"),
      color: "orange",
      gradient: "from-orange-500 via-amber-500 to-yellow-500",
      bgGradient: "from-orange-50 via-amber-50 to-yellow-50",
      iconBg: "bg-orange-500",
      href: "/equipment",
      stats: "2,500+ gear items available",
      features: ["Book by Date", "Message Owners", "Insured Rentals"]
    },
  ];
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-orange-50" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-300/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white shadow-lg border border-violet-100 mb-8">
              <Sparkles className="w-5 h-5 text-violet-600" />
              <span className="text-sm font-bold text-violet-900">{t("badge")}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs font-bold">{t("new")}</span>
            </motion.div>
            
            {/* Main Headline */}
            <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-violet-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                {t("headlineCreate")}
              </span>{" "}
              <span className="bg-gradient-to-r from-pink-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                {t("headlineConnect")}
              </span>{" "}
              <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                {t("headlineEarn")}
              </span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t("subheadline")}
            </motion.p>

            {/* Quick Feature Icons */}
            <motion.div variants={itemVariants} className="flex justify-center gap-4 mb-10">
              {heroFeatures.map((feature, i) => (
                <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-full ${feature.bgColor}`}>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                    <feature.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{t(feature.labelKey as any)}</span>
                </div>
              ))}
            </motion.div>
            
            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
              <Link href="/ai-hub">
                <Button size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-6 text-lg shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all hover:-translate-y-1">
                  <Wand2 className="w-5 h-5 mr-2" />
                  {t("tryAiTools")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/marketplace/campaigns">
                <Button size="lg" className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-6 text-lg shadow-xl shadow-pink-500/30 hover:shadow-pink-500/50 transition-all hover:-translate-y-1">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {t("findBrandDeals")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/equipment">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-6 text-lg shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:-translate-y-1">
                  <Camera className="w-5 h-5 mr-2" />
                  {t("rentGear")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Three Main Features - Color Coded */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Three Ways to <span className="gradient-text">Supercharge</span> Your Career
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Each tool is designed with a unique purpose, united by one goal: your success
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
              >
                <Link href={feature.href}>
                  <div className={`group relative h-full bg-gradient-to-br ${feature.bgGradient} rounded-3xl p-1 overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2`}>
                    <div className="bg-white/80 backdrop-blur-sm rounded-[22px] h-full p-8">
                      {/* Icon */}
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg`}>
                        <feature.icon className="w-10 h-10" />
                      </div>
                      
                      {/* Color Badge */}
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-${feature.color}-100 text-${feature.color}-700 text-xs font-bold mb-4`}>
                        <Zap className="w-3 h-3" />
                        {feature.subtitle}
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">{feature.desc}</p>
                      
                      {/* Features List */}
                      <div className="space-y-2 mb-6">
                        {feature.features.map((f, j) => (
                          <div key={j} className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle className={`w-4 h-4 text-${feature.color}-500`} />
                            {f}
                          </div>
                        ))}
                      </div>
                      
                      {/* Stats */}
                      <div className={`p-3 rounded-xl bg-${feature.color}-50 mb-6`}>
                        <p className={`text-sm font-semibold text-${feature.color}-700`}>{feature.stats}</p>
                      </div>
                      
                      {/* CTA */}
                      <div className={`flex items-center font-bold text-${feature.color}-600 group-hover:gap-3 transition-all`}>
                        Explore {feature.title}
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                    
                    {/* Decorative Elements */}
                    <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${feature.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">{t("howItWorks")}</h2>
            <p className="text-xl text-gray-600">{t("howItWorksSubtitle")}</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: t("step1Title"), desc: t("step1Desc"), color: "violet", icon: Users },
              { step: "02", title: t("step2Title"), desc: t("step2Desc"), color: "pink", icon: ArrowRight },
              { step: "03", title: t("step3Title"), desc: t("step3Desc"), color: "orange", icon: Handshake },
              { step: "04", title: t("step4Title"), desc: t("step4Desc"), color: "green", icon: TrendingUp },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-${item.color}-100 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-8 h-8 text-${item.color}-600`} />
                </div>
                <span className={`text-5xl font-black text-${item.color}-200 mb-2 block`}>{item.step}</span>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { value: "10,000+", label: t("statsCreators"), icon: Users, color: "violet" },
              { value: "$2.5M+", label: t("statsPaid"), icon: DollarSign, color: "pink" },
              { value: "500+", label: t("statsBrands"), icon: Star, color: "orange" },
              { value: "98%", label: t("statsSatisfaction"), icon: Heart, color: "red" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`text-center p-8 bg-${stat.color}-50 rounded-3xl border border-${stat.color}-100`}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-${stat.color}-100 text-${stat.color}-600 mb-4`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <p className="text-4xl font-black text-gray-900 mb-1">{stat.value}</p>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Accounts Banner */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("demoTitle")}</h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                {t("demoSubtitle")}
              </p>
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { role: t("creator"), email: "sarah@demo.com", color: "violet" },
                  { role: t("company"), email: "glow@demo.com", color: "pink" },
                ].map((account, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-4 text-left">
                    <p className={`text-${account.color}-400 text-sm font-bold mb-1`}>{account.role}</p>
                    <p className="text-white text-sm">{account.email}</p>
                    <p className="text-gray-400 text-xs mt-1">Pass: demo123</p>
                  </div>
                ))}
              </div>
              <Link href="/auth">
                <Button size="lg" className="mt-8 bg-white text-gray-900 hover:bg-gray-100">
                  {t("signIn")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-r from-violet-600 via-pink-500 to-orange-500 rounded-3xl p-12 text-center text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Ready to Level Up?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of creators and brands building the future of content creation.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/auth">
                  <Button size="lg" className="bg-white text-violet-600 hover:bg-gray-100 shadow-xl">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/marketplace/talent">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20">
                    Browse Creators
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-pink-500 to-orange-500 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold gradient-text">LumiAI</span>
              </div>
              <p className="text-gray-600 text-sm">
                The all-in-one creator operating system. AI tools, brand deals, and equipment rental.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gray-900">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/ai-hub" className="hover:text-violet-600 transition-colors">AI Hub</Link></li>
                <li><Link href="/marketplace" className="hover:text-pink-600 transition-colors">Marketplace</Link></li>
                <li><Link href="/equipment" className="hover:text-orange-600 transition-colors">Rent Gear</Link></li>
                <li><Link href="/help" className="hover:text-violet-600 transition-colors">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gray-900">For Users</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/auth" className="hover:text-violet-600 transition-colors">Creator Login</Link></li>
                <li><Link href="/auth" className="hover:text-pink-600 transition-colors">Brand Login</Link></li>

              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gray-900">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/help" className="hover:text-violet-600 transition-colors">Documentation</Link></li>
                <li><Link href="/help" className="hover:text-violet-600 transition-colors">Tutorials</Link></li>
                <li><Link href="/help" className="hover:text-violet-600 transition-colors">Contact Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-sm text-gray-500">
            © 2026 LumiAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
