"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  BookOpen,
  Search,
  Wand2,
  ShoppingBag,
  Camera,
  BarChart3,
  ChevronRight,
  ChevronDown,
  Play,
  FileText,
  MessageSquare,
  HelpCircle,
  Mail,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function HelpPage() {
  const t = useTranslations("help");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>("getting-started");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const tutorialCategories = [
    {
      id: "getting-started",
      title: t("gettingStarted"),
      icon: BookOpen,
      description: t("gettingStartedDesc"),
      articles: [
        { id: "creating-account", title: t("creatingAccount"), readTime: "3 min" },
        { id: "setting-up-profile", title: t("settingUpProfile"), readTime: "5 min" },
        { id: "understanding-dashboard", title: t("understandingDashboard"), readTime: "4 min" },
        { id: "connecting-social", title: t("connectingSocial"), readTime: "3 min" },
      ]
    },
    {
      id: "ai-tools",
      title: t("aiTools"),
      icon: Wand2,
      description: t("aiToolsDesc"),
      articles: [
        { id: "storyboard-guide", title: t("storyboardGuide"), readTime: "5 min" },
        { id: "caption-guide", title: t("captionGuide"), readTime: "4 min" },
        { id: "market-advisor", title: t("marketAdvisor"), readTime: "6 min" },
        { id: "contract-scanner", title: t("contractScanner"), readTime: "7 min" },
      ]
    },
    {
      id: "marketplace",
      title: t("brandMarketplace"),
      icon: ShoppingBag,
      description: t("brandMarketplaceDesc"),
      articles: [
        { id: "applying-campaigns", title: t("applyingCampaigns"), readTime: "4 min" },
        { id: "media-kit", title: t("mediaKit"), readTime: "6 min" },
        { id: "negotiating-deals", title: t("negotiatingDeals"), readTime: "5 min" },
        { id: "posting-campaigns", title: t("postingCampaigns"), readTime: "5 min" },
      ]
    },
    {
      id: "equipment",
      title: t("equipmentRental"),
      icon: Camera,
      description: t("equipmentRentalDesc"),
      articles: [
        { id: "booking-equipment", title: t("bookingEquipment"), readTime: "4 min" },
        { id: "messaging-owners", title: t("messagingOwners"), readTime: "3 min" },
        { id: "rental-insurance", title: t("rentalInsurance"), readTime: "5 min" },
        { id: "listing-gear", title: t("listingGear"), readTime: "6 min" },
      ]
    },
    {
      id: "analytics",
      title: t("analyticsHelp"),
      icon: BarChart3,
      description: t("analyticsDesc"),
      articles: [
        { id: "reading-analytics", title: t("readingAnalytics"), readTime: "4 min" },
        { id: "audience-insights", title: t("audienceInsightsHelp"), readTime: "5 min" },
        { id: "company-analytics", title: t("companyAnalytics"), readTime: "5 min" },
      ]
    },
  ];

  const quickGuides = [
    {
      title: t("creatorQuickStart"),
      icon: Play,
      description: t("creatorQuickStartDesc"),
      duration: "5 min",
      color: "from-violet-500 to-purple-600"
    },
    {
      title: t("brandQuickStart"),
      icon: Play,
      description: t("brandQuickStartDesc"),
      duration: "6 min",
      color: "from-pink-500 to-rose-600"
    },
    {
      title: t("rentersGuide"),
      icon: Play,
      description: t("rentersGuideDesc"),
      duration: "8 min",
      color: "from-orange-500 to-amber-600"
    },
  ];

  const faqs = [
    {
      question: t("faqFree"),
      answer: t("faqFreeAnswer")
    },
    {
      question: t("faqDemo"),
      answer: t("faqDemoAnswer")
    },
    {
      question: t("faqInsurance"),
      answer: t("faqInsuranceAnswer")
    },
    {
      question: t("faqNegotiate"),
      answer: t("faqNegotiateAnswer")
    },
    {
      question: t("faqSecure"),
      answer: t("faqSecureAnswer")
    },
  ];

  const filteredCategories = tutorialCategories.map(category => ({
    ...category,
    articles: category.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => 
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.articles.length > 0
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-violet-50/30 to-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-pink-100 text-violet-700 text-sm font-semibold mb-4">
            <BookOpen className="w-4 h-4" />
            {t("helpCenter")}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            {t("howCanWeHelp")}
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input 
              type="text"
              placeholder={t("searchPlaceholder")}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Video Guides */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">{t("quickStartVideos")}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {quickGuides.map((guide, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-2xl p-6 border shadow-sm hover:shadow-lg transition-all cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${guide.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  <guide.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg mb-2">{guide.title}</h3>
                <p className="text-neutral-600 text-sm mb-3">{guide.description}</p>
                <span className="text-xs text-neutral-500 flex items-center gap-1">
                  <Play className="w-3 h-3" />
                  {guide.duration} {t("videoSuffix")}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Detailed Guides */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">{t("browseByTopic")}</h2>
            <div className="space-y-4">
              {filteredCategories.map((category) => (
                <div key={category.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white">
                        <category.icon className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-lg">{category.title}</h3>
                        <p className="text-sm text-neutral-500">{category.description}</p>
                      </div>
                    </div>
                    {expandedCategory === category.id ? (
                      <ChevronDown className="w-5 h-5 text-neutral-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-neutral-400" />
                    )}
                  </button>
                  
                  {expandedCategory === category.id && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      className="border-t"
                    >
                      {category.articles.map((article) => (
                        <Link
                          key={article.id}
                          href={`/help/article/${category.id}/${article.id}`}
                          className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b last:border-b-0 group"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-neutral-400 group-hover:text-violet-500 transition-colors" />
                            <span className="font-medium group-hover:text-violet-600 transition-colors">{article.title}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-neutral-500">{article.readTime} {t("readTimeSuffix")}</span>
                            <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-violet-500 opacity-0 group-hover:opacity-100 transition-all" />
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* FAQ Section */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-violet-500" />
                {t("frequentlyAsked")}
              </h3>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div key={i} className="border-b last:border-b-0 pb-3 last:pb-0">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full text-left flex items-start justify-between gap-2"
                    >
                      <span className="font-medium text-sm">{faq.question}</span>
                      {expandedFaq === i ? (
                        <ChevronDown className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                      )}
                    </button>
                    {expandedFaq === i && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-neutral-600 mt-2"
                      >
                        {faq.answer}
                      </motion.p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">{t("needMoreHelp")}</h3>
              <p className="text-white/90 text-sm mb-4">
                {t("needMoreHelpDesc")}
              </p>
              <div className="space-y-2">
                <Button className="w-full bg-white text-violet-600 hover:bg-gray-100">
                  <Mail className="w-4 h-4 mr-2" />
                  {t("contactSupport")}
                </Button>
                <Button variant="outline" className="w-full border-white text-white hover:bg-white/10">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t("liveChat")}
                </Button>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4">{t("resources")}</h3>
              <ul className="space-y-3">
                {[
                  { label: t("creatorHandbook"), icon: BookOpen },
                  { label: t("brandGuidelines"), icon: FileText },
                  { label: t("apiDocumentation"), icon: ExternalLink },
                  { label: t("communityForum"), icon: MessageSquare },
                ].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="flex items-center gap-2 text-neutral-600 hover:text-violet-600 transition-colors">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
