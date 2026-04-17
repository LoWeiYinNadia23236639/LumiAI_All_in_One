"use client";

import { useState, useEffect } from "react";
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
  Settings,
  Bookmark,
  Shield,
  CheckCircle,
  Camera,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfluencerGuard } from "@/components/role-guard";
import { useAuth } from "@/contexts/auth-context";
import { useSavedLists } from "@/contexts/saved-lists-context";
import { useTranslations } from "next-intl";

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
  "Your engagement rate is in top 10% of creators in your niche",
];

const demoGear: UserGearItem[] = [
  {
    id: "demo-gear-1",
    name: "Canon EOS R5",
    category: "Cameras",
    image: "📷",
    brand: "Canon",
    location: "Los Angeles, CA",
    dailyRate: 95,
    weeklyRate: 475,
    monthlyRate: 1900,
    rating: 4.9,
    reviews: 12,
    availability: ["Apr 16", "Apr 17", "Apr 18", "Apr 19", "Apr 20"],
    condition: "Excellent",
    includes: ["Body", "RF 24-105mm Lens", "Battery x2", "Charger", "128GB CFexpress"],
    owner: "Sarah Chen",
    ownerVerified: true,
    responseTime: "< 1 hour",
    description: "My go-to camera for portrait shoots. Shoots stunning 8K video and 45MP stills.",
    ownerId: "inf-1",
    available: true,
  },
  {
    id: "demo-gear-2",
    name: "DJI Ronin-S Gimbal",
    category: "Accessories",
    image: "🎯",
    brand: "DJI",
    location: "Los Angeles, CA",
    dailyRate: 35,
    weeklyRate: 175,
    monthlyRate: 700,
    rating: 4.8,
    reviews: 8,
    availability: ["Apr 16", "Apr 17", "Apr 18", "Apr 19", "Apr 20"],
    condition: "Like New",
    includes: ["Gimbal", "Focus Wheel", "Tripod", "Carrying Case"],
    owner: "Sarah Chen",
    ownerVerified: true,
    responseTime: "< 1 hour",
    description: "Perfect for smooth cinematic shots. Supports most mirrorless setups.",
    ownerId: "inf-1",
    available: true,
  },
  {
    id: "demo-gear-3",
    name: "Rode Wireless GO II",
    category: "Audio",
    image: "🎤",
    brand: "Rode",
    location: "Los Angeles, CA",
    dailyRate: 18,
    weeklyRate: 90,
    monthlyRate: 360,
    rating: 5.0,
    reviews: 5,
    availability: ["Apr 16", "Apr 17", "Apr 18", "Apr 19", "Apr 20"],
    condition: "Excellent",
    includes: ["2x Transmitters", "Receiver", "Lav Mics", "USB-C Cables"],
    owner: "Sarah Chen",
    ownerVerified: true,
    responseTime: "< 1 hour",
    description: "Compact wireless audio kit. Great for interviews and vlogging.",
    ownerId: "inf-1",
    available: false,
  },
];

const myRentals = [
  { id: "rnt-101", gear: "Sony A7IV", owner: "Alex's Camera Rentals", dates: "Apr 10 - Apr 15", status: "Active", total: "$475" },
  { id: "rnt-102", gear: "Aputure 120D II", owner: "LA Studio Rentals", dates: "Mar 22 - Mar 24", status: "Completed", total: "$135" },
  { id: "rnt-103", gear: "DJI Mavic 3 Pro", owner: "Denver Drone Co", dates: "Mar 5 - Mar 7", status: "Completed", total: "$285" },
];

interface UserGearItem {
  id: string;
  name: string;
  category: string;
  image: string;
  brand: string;
  location: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  rating: number;
  reviews: number;
  availability: string[];
  condition: string;
  includes: string[];
  owner: string;
  ownerVerified: boolean;
  responseTime: string;
  description: string;
  ownerId: string;
  available: boolean;
}

function InfluencerAnalytics() {
  const t = useTranslations("analytics");
  const tc = useTranslations("common");
  const [activeTab, setActiveTab] = useState("analytics");
  const [timeRange, setTimeRange] = useState("7d");
  const { user, logout } = useAuth();
  const { savedCampaigns } = useSavedLists();
  const [userGear, setUserGear] = useState<UserGearItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGear, setNewGear] = useState({ name: "", dailyRate: "", condition: "Excellent", description: "" });

  useEffect(() => {
    const stored = localStorage.getItem("lumiai_user_gear");
    if (stored) {
      try { setUserGear(JSON.parse(stored)); } catch {}
    } else {
      // Pre-fill demo gear for creators
      setUserGear(demoGear);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("lumiai_user_gear", JSON.stringify(userGear));
  }, [userGear]);

  const handleAddGear = () => {
    if (!newGear.name || !newGear.dailyRate || !user) return;
    const daily = parseFloat(newGear.dailyRate);
    const item: UserGearItem = {
      id: `user-gear-${Date.now()}`,
      name: newGear.name,
      category: "Accessories",
      image: "📷",
      brand: "User",
      location: "User Location",
      dailyRate: daily,
      weeklyRate: Math.round(daily * 5),
      monthlyRate: Math.round(daily * 20),
      rating: 5,
      reviews: 0,
      availability: ["Apr 15", "Apr 16", "Apr 17", "Apr 18", "Apr 19"],
      condition: newGear.condition,
      includes: ["Item"],
      owner: user.name,
      ownerVerified: true,
      responseTime: "< 1 hour",
      description: newGear.description || newGear.name,
      ownerId: user.id,
      available: true,
    };
    setUserGear((prev) => [item, ...prev]);
    setNewGear({ name: "", dailyRate: "", condition: "Excellent", description: "" });
    setShowAddModal(false);
  };

  const toggleAvailability = (id: string) => {
    setUserGear((prev) => prev.map((g) => g.id === id ? { ...g, available: !g.available } : g));
  };

  const deleteGear = (id: string) => {
    setUserGear((prev) => prev.filter((g) => g.id !== id));
  };

  const verificationSteps = [
    { label: t("email"), done: true },
    { label: t("idDocument"), done: true },
    { label: t("portfolioSample"), done: false },
    { label: t("verified"), done: false },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-violet-50/30 to-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{t("creatorAnalytics")}</h1>
            <p className="text-neutral-600">{t("trackGrowth")}</p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="7d">{t("last7Days")}</option>
              <option value="30d">{t("last30Days")}</option>
              <option value="90d">{t("last90Days")}</option>
              <option value="1y">{t("lastYear")}</option>
            </select>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              {t("settings")}
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              {tc("logout")}
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
                <h2 className="text-2xl font-bold">{t("welcomeBack", { name: user.name })}</h2>
                <p className="text-white/80">{user.email} • {t("creatorAccount")}</p>
              </div>
              <div className="ml-auto text-right">
                <Link href="/analytics/public">
                  <Button className="bg-white text-violet-600 hover:bg-gray-100">
                    {t("viewPublicProfile")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 p-1 bg-gray-100 rounded-xl w-fit">
          {[
            { id: "analytics", label: t("analytics") },
            { id: "gear", label: t("myGear"), count: userGear.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-violet-600 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${activeTab === tab.id ? "bg-violet-100" : "bg-gray-200"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "analytics" && (
          <>
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: t("totalFollowers"), key: "followers", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
            { label: t("engagementRate"), key: "engagement", icon: Heart, color: "text-pink-500", bg: "bg-pink-50" },
            { label: t("totalViews"), key: "views", icon: Eye, color: "text-violet-500", bg: "bg-violet-50" },
            { label: t("revenue"), key: "revenue", icon: DollarSign, color: "text-green-500", bg: "bg-green-50" },
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
            <h3 className="font-bold">{t("aiInsights")}</h3>
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
              <h3 className="font-bold text-lg">{t("topPerformingContent")}</h3>
              <Button variant="ghost" size="sm">
                {t("viewAll")}
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
            {/* {t("verificationProgress")} */}
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-violet-600" />
                <h3 className="font-bold text-lg">{t("verificationProgress")}</h3>
              </div>
              <div className="space-y-3">
                {verificationSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step.done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                      {step.done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-sm ${step.done ? "text-neutral-900 font-medium" : "text-neutral-500"}`}>{t(step.label.toLowerCase().replace(/\s/g, ""))}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* {t("myRentals")} */}
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-500" />
                  <h3 className="font-bold text-lg">{t("myRentals")}</h3>
                </div>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">{myRentals.filter(r => r.status === "Active").length} {t("active")}</span>
              </div>
              <div className="space-y-3">
                {myRentals.map((rental) => (
                  <div key={rental.id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{rental.gear}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        rental.status === "Active" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                      }`}>{rental.status}</span>
                    </div>
                    <p className="text-xs text-neutral-500">{rental.owner} • {rental.dates}</p>
                    <p className="text-xs font-medium text-neutral-700 mt-1">{rental.total}</p>
                  </div>
                ))}
              </div>
              <Link href="/equipment">
                <Button variant="outline" size="sm" className="w-full mt-3">
                  {t("rentGear")}
                </Button>
              </Link>
            </div>

            {/* {t("savedCampaigns")} */}
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-pink-500" />
                  <h3 className="font-bold text-lg">{t("savedCampaigns")}</h3>
                </div>
                <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full">{savedCampaigns.length}</span>
              </div>
              {savedCampaigns.length === 0 ? (
                <p className="text-sm text-neutral-500">No saved campaigns yet.</p>
              ) : (
                <div className="space-y-2">
                  {savedCampaigns.map((id) => (
                    <div key={id} className="p-3 bg-gray-50 rounded-xl text-sm font-medium">
                      Campaign #{id}
                    </div>
                  ))}
                </div>
              )}
              <Link href="/marketplace/campaigns">
                <Button variant="outline" size="sm" className="w-full mt-3">
                  {t("browseCampaigns")}
                </Button>
              </Link>
            </div>

            {/* Brand Deals */}
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <h3 className="font-bold text-lg mb-4">{t("recentBrandDeals")}</h3>
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
              <h3 className="font-bold text-lg mb-4">{t("audienceInsights")}</h3>
              
              <div className="mb-4">
                <p className="text-sm text-neutral-500 mb-2">{t("genderSplit")}</p>
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
                <p className="text-sm text-neutral-500 mb-2">{t("topLocations")}</p>
                <div className="space-y-1">
                  {mockData.audienceInsights.topLocations.map((loc, i) => (
                    <p key={i} className="text-sm">{loc}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* {t("creatorScore")} */}
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5" />
                <h3 className="font-bold">{t("creatorScore")}</h3>
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
          </>
        )}

        {activeTab === "gear" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{t("myGear")}</h2>
              <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-orange-500 to-amber-500">
                <Plus className="w-4 h-4 mr-2" />
                {t("addGear")}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 border shadow-sm text-center">
                <p className="text-3xl font-bold text-neutral-900">{userGear.length}</p>
                <p className="text-sm text-neutral-500">{t("totalListings")}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border shadow-sm text-center">
                <p className="text-3xl font-bold text-green-600">{userGear.filter(g => g.available).length}</p>
                <p className="text-sm text-neutral-500">{t("available")}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border shadow-sm text-center">
                <p className="text-3xl font-bold text-orange-600">$1,247</p>
                <p className="text-sm text-neutral-500">{t("lifetimeEarnings")}</p>
              </div>
            </div>
            {userGear.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border shadow-sm text-center">
                <Camera className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">{t("noGearListed")}</h3>
                <p className="text-neutral-600 mb-6">{t("listSubtitle")}</p>
                <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-orange-500 to-amber-500">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("listFirstItem")}
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userGear.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-5 border shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{item.image}</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleAvailability(item.id)}
                          className="p-1 hover:bg-gray-100 rounded-lg"
                          title={item.available ? "Mark unavailable" : "Mark available"}
                        >
                          {item.available ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                        </button>
                        <button
                          onClick={() => deleteGear(item.id)}
                          className="p-1 hover:bg-red-50 rounded-lg text-red-500"
                          title={tc("delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-sm text-neutral-500 mb-2">{item.condition}</p>
                    <p className="text-sm text-neutral-600 line-clamp-2 mb-3">{item.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <p className="text-xl font-bold text-neutral-900">${item.dailyRate}<span className="text-xs font-normal text-neutral-500">/day</span></p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {item.available ? t("available") : t("unavailable")}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* {t("myRentals")} in Gear Tab */}
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-500" />
                  <h3 className="font-bold text-lg">{t("gearIRented")}</h3>
                </div>
                <Link href="/equipment">
                  <Button variant="outline" size="sm">Browse Gear</Button>
                </Link>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {myRentals.map((rental) => (
                  <div key={rental.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-neutral-900">{rental.gear}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        rental.status === "Active" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                      }`}>{rental.status}</span>
                    </div>
                    <p className="text-sm text-neutral-500">{rental.owner}</p>
                    <p className="text-xs text-neutral-400">{rental.dates}</p>
                    <p className="text-sm font-semibold text-orange-600 mt-2">{rental.total}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Gear Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold mb-4">{t("listNewGear")}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">{t("itemName")}</label>
                  <input
                    type="text"
                    value={newGear.name}
                    onChange={(e) => setNewGear({ ...newGear, name: e.target.value })}
                    placeholder="e.g. Sony A7IV"
                    className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">{t("dailyRate")}</label>
                  <input
                    type="number"
                    value={newGear.dailyRate}
                    onChange={(e) => setNewGear({ ...newGear, dailyRate: e.target.value })}
                    placeholder="75"
                    className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Condition</label>
                  <select
                    value={newGear.condition}
                    onChange={(e) => setNewGear({ ...newGear, condition: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option>Excellent</option>
                    <option>Good</option>
                    <option>Fair</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">{t("description")}</label>
                  <textarea
                    value={newGear.description}
                    onChange={(e) => setNewGear({ ...newGear, description: e.target.value })}
                    placeholder="Brief description of the item..."
                    className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>{tc("cancel")}</Button>
                  <Button className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500" onClick={handleAddGear} disabled={!newGear.name || !newGear.dailyRate}>
                    {t("listGear")}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
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
