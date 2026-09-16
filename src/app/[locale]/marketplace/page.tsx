"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Users, 
  ArrowRight,
  Search,
  Star,
  TrendingUp,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth-guard";
import { useTranslations } from "next-intl";

function MarketplacePage() {
  const t = useTranslations("marketplace");
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-pink-50/30 to-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-violet-100 text-pink-700 text-sm font-semibold mb-4">
            <Star className="w-4 h-4" />
            {t("twoWayMarketplace")}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-4">
            {t.rich("findPerfectMatch", {
              match: (chunks) => <span className="gradient-text">{chunks}</span>,
            })}
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {t("matchSubtitle")}
          </p>
        </div>

        {/* Two Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* For Creators */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group bg-white rounded-3xl p-8 border-2 border-pink-100 hover:border-pink-300 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white mb-6">
              <Briefcase className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-3">{t("forCreators")}</h2>
            <p className="text-neutral-600 mb-6">
              {t("creatorsDesc")}
            </p>
            <ul className="space-y-3 mb-8">
              {[
                t("creatorFeatureMatching"),
                t("creatorFeatureBudget"),
                t("creatorFeatureFast"),
                t("creatorFeatureSecure")
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-neutral-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/marketplace/campaigns">
              <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white group-hover:scale-[1.02] transition-transform">
                {t("findCampaigns")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>

          {/* For Companies */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="group bg-white rounded-3xl p-8 border-2 border-violet-100 hover:border-violet-300 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white mb-6">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-3">{t("forBrands")}</h2>
            <p className="text-neutral-600 mb-6">
              {t("brandsDesc")}
            </p>
            <ul className="space-y-3 mb-8">
              {[
                t("brandFeatureCreators"),
                t("brandFeatureSearch"),
                t("brandFeatureManagement"),
                t("brandFeatureRoi")
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-neutral-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/marketplace/talent">
              <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white group-hover:scale-[1.02] transition-transform">
                {t("findCreators")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "10,000+", label: t("activeCreators"), icon: Users },
            { value: "500+", label: t("brandPartners"), icon: Briefcase },
            { value: "$2.5M+", label: t("paidToCreators"), icon: TrendingUp },
            { value: "98%", label: t("trustScore"), icon: Shield },
          ].map((stat, i) => (
            <div key={i} className="text-center p-6 bg-white rounded-2xl border">
              <stat.icon className="w-6 h-6 text-violet-500 mx-auto mb-3" />
              <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
              <p className="text-sm text-neutral-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function MarketplacePageWrapper() {
  return (
    <AuthGuard>
      <MarketplacePage />
    </AuthGuard>
  );
}
