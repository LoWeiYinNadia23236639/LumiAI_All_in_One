"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Eye,
  MousePointer,
  Target,
  Zap,
  ArrowRight,
  Star,
  Building2,
  CheckCircle,
  Briefcase,
  LogOut,
  Settings,
  Bookmark,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyGuard } from "@/components/role-guard";
import { useAuth } from "@/contexts/auth-context";
import { useSavedLists } from "@/contexts/saved-lists-context";

const mockData = {
  overview: {
    campaigns: { value: "12", change: "+3", trend: "up" },
    spent: { value: "$45,200", change: "+18%", trend: "up" },
    roi: { value: "3.8x", change: "+0.4x", trend: "up" },
    reach: { value: "5.2M", change: "+25%", trend: "up" },
  },
  activeCampaigns: [
    { name: "Summer Launch 2026", budget: "$15,000", spent: "$8,200", reach: "1.2M", status: "Active", influencers: 8 },
    { name: "Product Review Drive", budget: "$10,000", spent: "6,500", reach: "890K", status: "Active", influencers: 12 },
    { name: "Holiday Special", budget: "$20,000", spent: "$0", reach: "0", status: "Draft", influencers: 0 },
  ],
  topInfluencers: [
    { name: "Sarah Chen", handle: "@sarahstyles", performance: "4.2x ROI", contentType: "Fashion", followers: "125K" },
    { name: "Mike Chen", handle: "@techwithmike", performance: "5.1x ROI", contentType: "Tech", followers: "450K" },
    { name: "Emma Davis", handle: "@emmacooks", performance: "3.8x ROI", contentType: "Food", followers: "210K" },
  ],
  applications: [
    { creator: "Jessica Kim", niche: "Beauty", followers: "175K", engagement: "5.8%", appliedAt: "2 hours ago" },
    { creator: "David Park", niche: "Travel", followers: "320K", engagement: "4.5%", appliedAt: "5 hours ago" },
    { creator: "Alex Rivera", niche: "Tech", followers: "680K", engagement: "3.9%", appliedAt: "1 day ago" },
  ],
};

function CompanyAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const { user, logout } = useAuth();
  const { savedCreators } = useSavedLists();

  const verificationSteps = [
    { label: "Email", done: true },
    { label: "Business Registration", done: true },
    { label: "Payment Method", done: false },
    { label: "Verified", done: false },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Company Dashboard</h1>
            <p className="text-neutral-600">Track campaign performance and manage creator partnerships</p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="bg-gradient-to-r from-blue-500 to-violet-600 rounded-2xl p-6 text-white mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold`}>
                {user.avatar}
              </div>
              <div>
                <h2 className="text-2xl font-bold">Welcome back, {user.name}!</h2>
                <p className="text-white/80">{user.email} • Company Account</p>
              </div>
              <div className="ml-auto text-right">
                <Link href="/marketplace/campaigns">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Post Campaign
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Campaigns", key: "campaigns", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Total Spent", key: "spent", icon: DollarSign, color: "text-green-500", bg: "bg-green-50" },
            { label: "ROI", key: "roi", icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-50" },
            { label: "Total Reach", key: "reach", icon: Users, color: "text-orange-500", bg: "bg-orange-50" },
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
                  {data.change} vs last period
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Campaigns */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Active Campaigns</h3>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-4">
              {mockData.activeCampaigns.map((campaign, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{campaign.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        campaign.status === "Active" ? "bg-green-100 text-green-700" :
                        "bg-gray-200 text-gray-600"
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <span className="text-sm text-neutral-500">{campaign.influencers} influencers</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-500">Budget</p>
                      <p className="font-medium">{campaign.budget}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Spent</p>
                      <p className="font-medium">${campaign.spent}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Reach</p>
                      <p className="font-medium">{campaign.reach}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                        style={{ width: `${(parseInt(campaign.spent.replace(/,/g, "")) / parseInt(campaign.budget.replace(/[$,]/g, ""))) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Verification Progress */}
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg">Verification Progress</h3>
              </div>
              <div className="space-y-3">
                {verificationSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step.done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                      {step.done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-sm ${step.done ? "text-neutral-900 font-medium" : "text-neutral-500"}`}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Creators */}
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-pink-500" />
                  <h3 className="font-bold text-lg">Saved Creators</h3>
                </div>
                <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full">{savedCreators.length}</span>
              </div>
              {savedCreators.length === 0 ? (
                <p className="text-sm text-neutral-500">No saved creators yet.</p>
              ) : (
                <div className="space-y-2">
                  {savedCreators.map((id) => (
                    <div key={id} className="p-3 bg-gray-50 rounded-xl text-sm font-medium">
                      Creator #{id}
                    </div>
                  ))}
                </div>
              )}
              <Link href="/marketplace/talent">
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Browse Creators
                </Button>
              </Link>
            </div>

            {/* New Applications */}
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">New Applications</h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{mockData.applications.length} new</span>
              </div>
              <div className="space-y-3">
                {mockData.applications.map((app, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{app.creator}</p>
                        <p className="text-xs text-neutral-500">{app.niche} • {app.followers}</p>
                      </div>
                      <span className="text-xs text-neutral-400">{app.appliedAt}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" className="flex-1 text-xs">Review</Button>
                      <Button size="sm" className="flex-1 text-xs bg-blue-500">Accept</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Creators */}
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <h3 className="font-bold text-lg mb-4">Top Performers</h3>
              <div className="space-y-3">
                {mockData.topInfluencers.map((inf, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      i === 0 ? "bg-yellow-400" : i === 1 ? "bg-gray-400" : "bg-orange-400"
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{inf.name}</p>
                      <p className="text-xs text-neutral-500">{inf.handle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">{inf.performance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5" />
                <h3 className="font-bold">AI Suggestions</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Increase budget for tech creators - 2.3x better ROI
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  5 creators matching your criteria joined this week
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CompanyAnalyticsPage() {
  return (
    <CompanyGuard>
      <CompanyAnalytics />
    </CompanyGuard>
  );
}
