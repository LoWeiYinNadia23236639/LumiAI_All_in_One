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
      duration: "5 min"
    },
    {
      title: t("brandQuickStart"),
      icon: Play,
      description: t("brandQuickStartDesc"),
      duration: "6 min"
    },
    {
      title: t("rentersGuide"),
      icon: Play,
      description: t("rentersGuideDesc"),
      duration: "8 min"
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
    <main className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="oval-label inline-block mb-6">{t("kicker")}</span>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            {t("howCanWeHelp")}
          </h1>
          <p className="font-quote text-xl md:text-2xl text-ink-soft max-w-2xl mx-auto">
            {t("introQuote")}
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input 
              type="text"
              placeholder={t("searchPlaceholder")}
              className="w-full pl-12 pr-4 py-4 rounded-lg border border-line focus:outline-none focus:ring-2 focus:ring-primary text-lg"
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
                className="group bg-paper rounded-lg p-6 border border-line hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="w-14 h-14 rounded-lg bg-primary-soft text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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
                <div key={category.id} className="bg-paper rounded-lg border border-line overflow-hidden">
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
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
                            <FileText className="w-4 h-4 text-neutral-400 group-hover:text-primary transition-colors" />
                            <span className="font-medium group-hover:text-primary transition-colors">{article.title}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-neutral-500">{article.readTime} {t("readTimeSuffix")}</span>
                            <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
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
            <div className="bg-paper rounded-lg border border-line p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                {t("frequentlyAsked")}
              </h3>
              <div>
                {faqs.map((faq, i) => (
                  <div key={i} className="border-t border-line first:border-t-0">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full text-left flex items-start gap-3 py-4"
                    >
                      <span className="font-quote text-2xl text-ink/30 w-10 shrink-0 hidden sm:block">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-medium text-sm flex-1 min-w-0">{faq.question}</span>
                      <span
                        className={`font-quote text-2xl leading-none text-primary transition-transform duration-300 ${
                          expandedFaq === i ? "-rotate-45" : ""
                        }`}
                      >
                        +
                      </span>
                    </button>
                    {expandedFaq === i && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-l-2 border-primary/20 pl-4 pb-5 ml-5 sm:ml-[3.25rem] text-sm text-neutral-600 leading-relaxed"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-primary rounded-lg p-6 text-cream">
              <h3 className="font-bold text-lg mb-2">{t("needMoreHelp")}</h3>
              <p className="text-cream/90 text-sm mb-4">
                {t("needMoreHelpDesc")}
              </p>
              <div className="space-y-2">
                <Button className="w-full bg-cream text-primary hover:bg-cream/80">
                  <Mail className="w-4 h-4 mr-2" />
                  {t("contactSupport")}
                </Button>
                <Button variant="outline" className="w-full border-cream text-cream hover:bg-cream/10">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t("liveChat")}
                </Button>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-paper rounded-lg border border-line p-6">
              <h3 className="font-bold text-lg mb-4">{t("resources")}</h3>
              <ul className="space-y-3">
                {[
                  { label: t("creatorHandbook"), icon: BookOpen },
                  { label: t("brandGuidelines"), icon: FileText },
                  { label: t("apiDocumentation"), icon: ExternalLink },
                  { label: t("communityForum"), icon: MessageSquare },
                ].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="flex items-center gap-2 text-neutral-600 hover:text-primary transition-colors">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mt-16 bg-primary text-cream rounded-lg p-8 md:p-10 text-center"
        >
          <span className="inline-block border border-cream/40 text-cream rounded-full px-4 py-1 uppercase tracking-widest text-xs mb-5">
            {t("ctaQuestion")}
          </span>
          <p className="font-quote text-2xl md:text-3xl max-w-2xl mx-auto mb-8">
            {t("faqQuote")}
          </p>
          <a href="mailto:support@lumiai.app" className="inline-block">
            <Button variant="outline" className="border-cream text-cream hover:bg-cream/10 hover:text-cream">
              <Mail className="w-4 h-4 mr-2" />
              {t("contactSupport")}
            </Button>
          </a>
        </motion.div>
      </div>
    </main>
  );
}
