"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { articlesData } from "./data";
import { notFound } from "next/navigation";

export default function ArticlePage() {
  const params = useParams();
  const category = params.category as string;
  const articleId = params.articleId as string;
  
  const article = articlesData[category]?.[articleId];
  
  if (!article) {
    notFound();
  }

  const categoryInfo = {
    "getting-started": { title: "Getting Started", color: "violet" },
    "ai-tools": { title: "AI Tools", color: "pink" },
    "marketplace": { title: "Brand Marketplace", color: "orange" },
    "equipment": { title: "Equipment Rental", color: "blue" },
    "analytics": { title: "Analytics", color: "green" },
  };

  const currentCat = categoryInfo[category as keyof typeof categoryInfo] || { title: "Help", color: "violet" };
  const colorClasses: Record<string, { bg: string; text: string; border: string; lightBg: string }> = {
    violet: { bg: "bg-violet-500", text: "text-violet-600", border: "border-violet-200", lightBg: "bg-violet-50" },
    pink: { bg: "bg-pink-500", text: "text-pink-600", border: "border-pink-200", lightBg: "bg-pink-50" },
    orange: { bg: "bg-orange-500", text: "text-orange-600", border: "border-orange-200", lightBg: "bg-orange-50" },
    blue: { bg: "bg-blue-500", text: "text-blue-600", border: "border-blue-200", lightBg: "bg-blue-50" },
    green: { bg: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-200", lightBg: "bg-emerald-50" },
  };
  const colors = colorClasses[currentCat.color];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
          <Link href="/help" className="hover:text-violet-600 transition-colors">Help Center</Link>
          <ChevronRight className="w-4 h-4" />
          <span className={`${colors.text} font-medium`}>{currentCat.title}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-neutral-900 font-medium truncate">{article.title}</span>
        </nav>

        {/* Back Button */}
        <Link href="/help">
          <Button variant="ghost" className="mb-6 -ml-2 text-neutral-600 hover:text-violet-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help
          </Button>
        </Link>

        {/* Article Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colors.lightBg} ${colors.text} text-sm font-medium mb-4`}>
            <BookOpen className="w-4 h-4" />
            {currentCat.title}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.readTime} read
            </span>
            <span>•</span>
            <span>Last updated: {article.lastUpdated}</span>
          </div>
        </motion.div>

        {/* Article Content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border shadow-sm p-8 md:p-10"
        >
          {/* Introduction */}
          <div className="text-lg text-neutral-600 mb-8 leading-relaxed">
            {article.introduction}
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {article.sections.map((section, index) => (
              <section key={index} className="border-t pt-8 first:border-t-0 first:pt-0">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">{section.title}</h2>
                <div className="text-neutral-600 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
                
                {/* Tips */}
                {section.tips && section.tips.length > 0 && (
                  <div className={`mt-4 p-4 ${colors.lightBg} rounded-xl border ${colors.border}`}>
                    <div className={`flex items-center gap-2 ${colors.text} font-semibold mb-2`}>
                      <Lightbulb className="w-4 h-4" />
                      Pro Tips
                    </div>
                    <ul className="space-y-2">
                      {section.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start gap-2 text-sm text-neutral-700">
                          <CheckCircle className={`w-4 h-4 ${colors.text} flex-shrink-0 mt-0.5`} />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings */}
                {section.warnings && section.warnings.length > 0 && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-2 text-amber-700 font-semibold mb-2">
                      <AlertCircle className="w-4 h-4" />
                      Important
                    </div>
                    <ul className="space-y-2">
                      {section.warnings.map((warning, warningIndex) => (
                        <li key={warningIndex} className="flex items-start gap-2 text-sm text-amber-800">
                          <span className="text-amber-500">•</span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Related Articles */}
          {article.relatedArticles && article.relatedArticles.length > 0 && (
            <div className="border-t mt-8 pt-8">
              <h3 className="font-bold text-lg mb-4">Related Articles</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {article.relatedArticles.map((related, index) => (
                  <Link
                    key={index}
                    href={related.link}
                    className="flex items-center gap-3 p-3 rounded-xl border hover:border-violet-300 hover:bg-violet-50/50 transition-all group"
                  >
                    <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-violet-500" />
                    <span className="text-sm font-medium text-neutral-700 group-hover:text-violet-700">
                      {related.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.article>

        {/* Was this helpful? */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <p className="text-neutral-600 mb-3">Was this article helpful?</p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" className="px-6">
              👍 Yes
            </Button>
            <Button variant="outline" className="px-6">
              👎 No
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
