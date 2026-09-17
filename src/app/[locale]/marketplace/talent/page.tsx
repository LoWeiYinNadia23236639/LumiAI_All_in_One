"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  Users,
  ArrowRight,
  Instagram,
  Youtube,
  Twitter,
  Star,
  MapPin,
  Heart,
  MessageSquare,
  CheckCircle,
  BarChart3,
  Zap,
  Play,
  Eye,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth-guard";
import { useSavedLists } from "@/contexts/saved-lists-context";
import { useTranslations } from "next-intl";

const influencers = [
  {
    id: "1",
    name: "Sarah Chen",
    handle: "@sarahstyles",
    avatar: "SC",
    avatarColor: "from-pink-400 to-rose-500",
    niche: "Fashion & Style",
    location: "Los Angeles, CA",
    followers: "125K",
    engagement: "4.8%",
    avgViews: "45K",
    platforms: ["instagram", "tiktok"],
    bio: "Fashion enthusiast sharing affordable style tips. Helping you look expensive on a budget! 💕",
    recentWork: [
      { type: "video", title: "Summer Lookbook", views: "145K", thumbnail: "👗" },
      { type: "video", title: "Thrift Flip", views: "98K", thumbnail: "🛍️" },
      { type: "image", title: "Office Style", views: "76K", thumbnail: "👔" },
    ],
    verified: true,
    rating: 4.9,
    reviewCount: 28,
    rateRange: "$800-2K",
    tags: ["Fashion", "Affordable", "Styling"],
  },
  {
    id: "2",
    name: "Mike Chen",
    handle: "@techwithmike",
    avatar: "MC",
    avatarColor: "from-blue-400 to-cyan-500",
    niche: "Tech Reviews",
    location: "Seattle, WA",
    followers: "450K",
    engagement: "5.2%",
    avgViews: "120K",
    platforms: ["youtube", "instagram"],
    bio: "Making tech simple for everyone. Honest reviews, no BS. PC enthusiast & gaming addict 🎮",
    recentWork: [
      { type: "video", title: "iPhone 16 Review", views: "1.2M", thumbnail: "📱" },
      { type: "video", title: "Gaming Setup", views: "890K", thumbnail: "🎮" },
      { type: "video", title: "Budget Laptops", views: "650K", thumbnail: "💻" },
    ],
    verified: true,
    rating: 4.8,
    reviewCount: 45,
    rateRange: "$2K-5K",
    tags: ["Tech", "Gaming", "Reviews"],
  },
  {
    id: "3",
    name: "Emma Davis",
    handle: "@emmacooks",
    avatar: "ED",
    avatarColor: "from-orange-400 to-amber-500",
    niche: "Food & Cooking",
    location: "Miami, FL",
    followers: "210K",
    engagement: "6.1%",
    avgViews: "65K",
    platforms: ["instagram", "tiktok", "youtube"],
    bio: "Quick, healthy recipes for busy people. 15-min meals that actually taste good! 🍝✨",
    recentWork: [
      { type: "video", title: "Meal Prep Sunday", views: "220K", thumbnail: "🥗" },
      { type: "video", title: "Healthy Snacks", views: "180K", thumbnail: "🍎" },
      { type: "video", title: "One-Pot Pasta", views: "165K", thumbnail: "🍝" },
    ],
    verified: true,
    rating: 5.0,
    reviewCount: 62,
    rateRange: "$1.5K-4K",
    tags: ["Food", "Healthy", "Quick Recipes"],
  },
  {
    id: "4",
    name: "Alex Rivera",
    handle: "@alextech",
    avatar: "AR",
    avatarColor: "from-violet-400 to-purple-500",
    niche: "Tech & Gadgets",
    location: "Austin, TX",
    followers: "680K",
    engagement: "3.9%",
    avgViews: "200K",
    platforms: ["youtube", "twitter"],
    bio: "In-depth tech reviews and buying guides. Helping you make smart purchasing decisions 💻",
    recentWork: [
      { type: "video", title: "MacBook Pro M3", views: "2.1M", thumbnail: "💻" },
      { type: "video", title: "Smart Home Setup", views: "1.5M", thumbnail: "🏠" },
      { type: "video", title: "Camera Review", views: "980K", thumbnail: "📷" },
    ],
    verified: true,
    rating: 4.7,
    reviewCount: 89,
    rateRange: "$3K-8K",
    tags: ["Tech", "Reviews", "Education"],
  },
  {
    id: "5",
    name: "Jessica Kim",
    handle: "@jessicakitchen",
    avatar: "JK",
    avatarColor: "from-green-400 to-emerald-500",
    niche: "Food & Baking",
    location: "New York, NY",
    followers: "175K",
    engagement: "5.8%",
    avgViews: "55K",
    platforms: ["instagram", "tiktok"],
    bio: "Baker sharing easy, delicious recipes. Food is my love language! 🍰🍜",
    recentWork: [
      { type: "video", title: "No-Bake Cheesecake", views: "145K", thumbnail: "🍰" },
      { type: "video", title: "Korean BBQ at Home", views: "120K", thumbnail: "🥩" },
      { type: "image", title: "Weeknight Dinners", views: "95K", thumbnail: "🍽️" },
    ],
    verified: false,
    rating: 4.8,
    reviewCount: 34,
    rateRange: "$1K-3K",
    tags: ["Baking", "Asian Cuisine", "Desserts"],
  },
  {
    id: "6",
    name: "David Park",
    handle: "@davidtravels",
    avatar: "DP",
    avatarColor: "from-cyan-400 to-blue-500",
    niche: "Travel & Adventure",
    location: "Denver, CO",
    followers: "320K",
    engagement: "4.5%",
    avgViews: "90K",
    platforms: ["youtube", "instagram"],
    bio: "Capturing the world one destination at a time. Budget travel tips & hidden gems 🌍✈️",
    recentWork: [
      { type: "video", title: "Japan Travel Vlog", views: "1.8M", thumbnail: "🇯🇵" },
      { type: "video", title: "Europe on $50/day", views: "1.2M", thumbnail: "🇪🇺" },
      { type: "video", title: "Solo Travel Tips", views: "890K", thumbnail: "🎒" },
    ],
    verified: true,
    rating: 4.9,
    reviewCount: 56,
    rateRange: "$2.5K-6K",
    tags: ["Travel", "Budget", "Vlogs"],
  },
];

const filters = {
  followerRanges: ["All", "10K-50K", "50K-100K", "100K-500K", "500K+"],
  engagementRanges: ["All", "1-3%", "3-5%", "5%+"],
};

function TalentPage() {
  const t = useTranslations("marketplace");
  const tCommon = useTranslations("common");
  const [selectedNiche, setSelectedNiche] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { isCreatorSaved, toggleCreator } = useSavedLists();

  const nicheOptions = t.raw("nicheOptions") as { value: string; label: string }[];

  const filteredInfluencers = influencers.filter(i => {
    if (selectedNiche !== "All" && !i.niche.toLowerCase().includes(selectedNiche.toLowerCase())) return false;
    if (searchQuery && !i.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !i.handle.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-soft text-primary text-sm font-semibold mb-4">
            <Users className="w-4 h-4" />
            {t("discoverCreators")}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            {t.rich("findPerfectCreator", {
              creator: (chunks) => <span className="gradient-text">{chunks}</span>,
            })}
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {t("talentSubtitle")}
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { value: "10,000+", label: t("activeCreators"), icon: Users },
            { value: "50+", label: t("statNicheCategories"), icon: Filter },
            { value: "95%", label: t("statAvgEngagement"), icon: BarChart3 },
            { value: "4.8", label: t("statCreatorRating"), icon: Star },
          ].map((stat, i) => (
            <div key={i} className="bg-paper rounded-lg p-4 border border-line flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-soft flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-xs text-neutral-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-paper rounded-lg border border-line p-6 mb-8">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input 
                type="text"
                placeholder={t("searchCreatorsPlaceholder")}
                className="w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              {t("filters")}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {nicheOptions.map((niche) => (
              <button
                key={niche.value}
                onClick={() => setSelectedNiche(niche.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedNiche === niche.value
                    ? "bg-primary text-cream"
                    : "bg-neutral-100 text-neutral-700 hover:bg-primary-soft"
                }`}
              >
                {niche.label}
              </button>
            ))}
          </div>
        </div>

        {/* Creators Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInfluencers.map((influencer, index) => (
            <motion.div
              key={influencer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-paper rounded-lg p-6 border border-line hover:-translate-y-1 transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-cream text-lg font-bold">
                    {influencer.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{influencer.name}</h3>
                      {influencer.verified && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-neutral-500">{influencer.handle}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleCreator(influencer.id)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Heart className={`w-5 h-5 ${isCreatorSaved(influencer.id) ? "text-pink-500 fill-pink-500" : "text-gray-400"}`} />
                </button>
              </div>

              {/* Niche & Location */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 bg-primary-soft text-primary rounded-full text-xs font-medium">
                  {influencer.niche}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {influencer.location}
                </span>
              </div>

              {/* Bio */}
              <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{influencer.bio}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="font-bold text-neutral-900">{influencer.followers}</p>
                  <p className="text-xs text-neutral-500">{t("followers")}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="font-bold text-green-600">{influencer.engagement}</p>
                  <p className="text-xs text-neutral-500">{t("engagement")}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="font-bold text-primary">{influencer.avgViews}</p>
                  <p className="text-xs text-neutral-500">{t("avgViews")}</p>
                </div>
              </div>

              {/* Recent Work / Portfolio Preview */}
              <div className="mb-4">
                <p className="text-xs text-neutral-500 mb-2">{t("recentWork")}</p>
                <div className="grid grid-cols-3 gap-2">
                  {influencer.recentWork.map((work, i) => (
                    <div key={i} className="relative aspect-square bg-gray-100 rounded-lg flex items-center justify-center group/work cursor-pointer overflow-hidden">
                      <span className="text-2xl">{work.thumbnail}</span>
                      {work.type === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover/work:opacity-100 transition-opacity">
                          <div className="w-8 h-8 rounded-full bg-paper/80 flex items-center justify-center">
                            <Play className="w-4 h-4 text-neutral-900 ml-0.5" />
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/60 to-transparent text-white text-center">
                        <p className="text-[10px] truncate">{work.views}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {influencer.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-xs text-neutral-500">{t("startingAt")}</p>
                  <p className="font-bold text-neutral-900">{influencer.rateRange}</p>
                </div>
                <Link href={`/creators/${influencer.id}`}>
                  <Button size="sm">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    {tCommon("moreInfo")}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function TalentPageWrapper() {
  return (
    <AuthGuard>
      <TalentPage />
    </AuthGuard>
  );
}
