"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Heart,
  Eye,
  MessageSquare,
  Calendar,
  Target,
  Zap,
  ArrowRight,
  Star,
  Award,
  LogOut,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfluencerGuard } from "@/components/role-guard";
import { useAuth } from "@/contexts/auth-context";

const mockData = {
  overview: {
    followers: { value: "125.4K", change: "+2.3%", trend: "up" },
    engagement: { value: "4.8%", change: "+0.5%", trend: "up" },
    views: { value: "2.1M", change: "+12%", trend: "up" },
    revenue: { value: "$8,450", change: "+23%", trend: "up" },
  },
  contentPerformance: [
    { title: "Morning Routine 2026", views: "145K", engagement: "6.2%", date: "2 days ago", type: "Video" },
    { title: "Get Ready With Me", views: "98K", engagement: "5.8%", date: "5 days ago", type: "Video" },
    { title: "Product Review", views: "76K", engagement: "4.1%", date: "1 week ago", type: "Carousel" },
    { title: "Outfit of the Day", views: "62K", engagement: "5.5%", date: "1 week ago", type: "Photo" },
  ],
  brandDeals: [
    { brand: "Glow Skincare", amount: "$2,500", status: "Completed", date: "Mar 1" },
    { brand: "Fashion Nova", amount: "$1,800", status: "In Progress", date: "Mar 15" },
    { brand: "TechMaster", amount: "$3,200", status: "Pending", date: "Apr 1" },
  ],
  audienceInsights: {
    demographics: [
      { label: "Female", value: 68 },
      { label: "Male", value: 30 },
      { label: "Other", value: 2 },
    ],
    ageGroups: [
      { label: "18-24", value: 35 },
      { label: "25-34", value: 42 },
      { label: "35-44", value: 18 },
      { label: "45+", value: 5 },
    ],
    topLocations: ["United States (45%)", "Canada (12%)", "UK (10%)", "Australia (8%)"],
  },
};

const aiSuggestions = [
  "Post Reels between 7-9 PM EST for 23% more engagement",
  "Your audience loves GRWM content - create more!",
  "Beauty brand 'Rare Beauty' is actively looking for creators like you",
  "Your engagement rate is in top 10% for your follower range",
];

function InfluencerAnalytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-violet-50/30 to-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Creator Analytics</h1>
            <p className="text-neutral-600">Track your growth, earnings, and content performance</p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* User Info Card */}
        {user && (
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold`}>
                {user.avatar}
              </div>
              <div>
                <h2 className="text-2xl font-bold">Welcome back, {user.name}!</h2>
                <p className="text-white/80">{user.email} • Creator Account</p>
              </div>
              <div className="ml-auto text-right">
                <Link href="/analytics/public">
                  <Button className="bg-white text-violet-600 hover:bg-gray-100">
                    View Public Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Followers", key: "followers", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Engagement Rate", key: "engagement", icon: Heart, color: "text-pink-500", bg: "bg-pink-50" },
            { label: "Total Views", key: "views", icon: Eye, color: "text-violet-500", bg: "bg-violet-50" },
            { label: "Revenue", key: "revenue", icon: DollarSign, color: "text-green-500", bg: "bg-green-50" },
          ].map((stat) => {
            const data = mockData.overview[stat.key as keyof typeof mockData.overview];
            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 border shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-neutral-500">{stat.label}</p>
                </div>
                <p className="text-2xl font-bold text-neutral-900">{data.value}</p>
                <p className={`text-sm font-medium ${data.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {data.change} this period
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* AI Insights Banner */}
        <div className="bg-gradient-to-r from-violet-600 via-pink-500 to-orange-400 rounded-2xl p-6 text-white mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5" />
            <h3 className="font-bold">AI Insights for Sarah</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {aiSuggestions.map((suggestion, i) => (
              <div key={i} className="flex items-start gap-2 bg-white/10 rounded-xl p-3">
                <Star className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Content Performance */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Top Performing Content</h3>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-4">
              {mockData.contentPerformance.map((content, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-200 to-pink-200 rounded-lg flex items-center justify-center text-2xl">
                    {content.type === "Video" ? "🎥" : content.type === "Carousel" ? "🖼" : "📸"}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{content.title}</h4>
                    <p className="text-sm text-neutral-500">{content.type} • {content.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{content.views}</p>
                    <p className="text-sm text-green-600">{content.engagement} engagement</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Brand Deals */}
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <h3 className="font-bold text-lg mb-4">Recent Brand Deals</h3>
              <div className="space-y-3">
                {mockData.brandDeals.map((deal, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium">{deal.brand}</p>
                      <p className="text-xs text-neutral-500">{deal.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{deal.amount}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        deal.status === "Completed" ? "bg-green-100 text-green-700" :
                        deal.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {deal.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audience Insights */}
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <h3 className="font-bold text-lg mb-4">Audience Insights</h3>
              
              <div className="mb-4">
                <p className="text-sm text-neutral-500 mb-2">Gender Split</p>
                <div className="flex h-4 rounded-full overflow-hidden">
                  <div className="w-[68%] bg-pink-400" />
                  <div className="w-[30%] bg-blue-400" />
                  <div className="w-[2%] bg-purple-400" />
                </div>
                <div className="flex gap-3 mt-2 text-xs">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-pink-400" /> Female 68%</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400" /> Male 30%</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-neutral-500 mb-2">Top Locations</p>
                <div className="space-y-1">
                  {mockData.audienceInsights.topLocations.map((loc, i) => (
                    <p key={i} className="text-sm">{loc}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Creator Score */}
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5" />
                <h3 className="font-bold">Creator Score</h3>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-5xl font-bold">87</p>
                <p className="text-white/80 mb-2">/100</p>
              </div>
              <p className="text-sm text-white/90 mt-2">
                Top 15% of creators in your niche. Keep it up!
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <InfluencerGuard>
      <InfluencerAnalytics />
    </InfluencerGuard>
  );
}
