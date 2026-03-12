"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  DollarSign,
  Target,
  Users,
  ArrowRight,
  Zap,
  Sparkles,
  CheckCircle,
  Clock,
  Briefcase,
  Heart,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";

const campaigns = [
  {
    id: "1",
    brand: "Glow Skincare",
    brandLogo: "✨",
    brandVerified: true,
    title: "Summer Sunscreen Launch",
    description: "Looking for beauty creators to showcase our new sustainable sunscreen line. Authentic daily routine content preferred. Must include before/after skin results.",
    budget: "$800 - $2,500",
    platform: "TikTok",
    contentType: "Product Review",
    duration: "30-60s",
    category: "Beauty",
    matchScore: 95,
    postedAt: "2 days ago",
    applications: 24,
    deadline: "Apr 15, 2026",
    location: "US, Canada",
    requirements: ["10K+ followers", "Beauty niche", "High engagement"],
  },
  {
    id: "2",
    brand: "TechMaster Pro",
    brandLogo: "🎧",
    brandVerified: true,
    title: "Gaming Headset Review Campaign",
    description: "Launch our new wireless gaming headset with honest, in-depth reviews. Looking for gaming creators who can demonstrate audio quality and comfort during long sessions.",
    budget: "$1,500 - $5,000",
    platform: "YouTube",
    contentType: "Product Review",
    duration: "8-12 min",
    category: "Gaming",
    matchScore: 88,
    postedAt: "1 day ago",
    applications: 18,
    deadline: "Mar 30, 2026",
    location: "Global",
    requirements: ["50K+ followers", "Gaming content", "Review experience"],
  },
  {
    id: "3",
    brand: "FitLife App",
    brandLogo: "💪",
    brandVerified: false,
    title: "30-Day Fitness Transformation",
    description: "Create engaging workout content showcasing our app features. Document your 30-day transformation journey using our guided workouts and meal plans.",
    budget: "$2,000 - $6,000",
    platform: "Instagram + TikTok",
    contentType: "Series",
    duration: "30 days",
    category: "Fitness",
    matchScore: 82,
    postedAt: "3 days ago",
    applications: 45,
    deadline: "Apr 1, 2026",
    location: "US only",
    requirements: ["25K+ followers", "Fitness niche", "Commit to 30 days"],
  },
  {
    id: "4",
    brand: "Wanderlust Travel",
    brandLogo: "✈️",
    brandVerified: true,
    title: "Hidden Gems Travel Series",
    description: "Showcase hidden travel destinations and local experiences. Perfect for travel vloggers with engaged audiences who love authentic destination content.",
    budget: "$3,000 - $8,000",
    platform: "YouTube + Instagram",
    contentType: "Vlog Series",
    duration: "5-10 min",
    category: "Travel",
    matchScore: 75,
    postedAt: "5 days ago",
    applications: 32,
    deadline: "Flexible",
    location: "Asia Pacific",
    requirements: ["100K+ followers", "Travel content", "Photography skills"],
  },
  {
    id: "5",
    brand: "KitchenPro",
    brandLogo: "🍳",
    brandVerified: true,
    title: "5-Minute Recipe Series",
    description: "Create 5 quick, healthy lunch recipes featuring our organic ingredients. Recipe cards and high-quality food photography required.",
    budget: "$1,200 - $3,500",
    platform: "Instagram Reels",
    contentType: "Recipe Series",
    duration: "30-60s each",
    category: "Food",
    matchScore: 70,
    postedAt: "1 week ago",
    applications: 56,
    deadline: "Apr 20, 2026",
    location: "US, UK, Canada",
    requirements: ["20K+ followers", "Food content", "Recipe development"],
  },
  {
    id: "6",
    brand: "EcoFashion Co",
    brandLogo: "🌿",
    brandVerified: true,
    title: "Sustainable Fashion Campaign",
    description: "Showcase our new sustainable clothing line. Focus on eco-friendly materials, ethical manufacturing, and styling versatility.",
    budget: "$1,000 - $3,000",
    platform: "TikTok + Instagram",
    contentType: "Styling Video",
    duration: "30-90s",
    category: "Fashion",
    matchScore: 78,
    postedAt: "2 days ago",
    applications: 31,
    deadline: "Apr 10, 2026",
    location: "US, EU",
    requirements: ["15K+ followers", "Fashion niche", "Values sustainability"],
  },
];

const filters = {
  categories: ["All", "Beauty", "Fashion", "Fitness", "Gaming", "Tech", "Food", "Travel", "Lifestyle"],
  platforms: ["All", "Instagram", "TikTok", "YouTube", "Multi-Platform"],
  budgetRanges: ["All", "Under $1K", "$1K-$3K", "$3K-$5K", "$5K+"],
};

export default function CampaignsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedCampaigns, setSavedCampaigns] = useState<string[]>([]);

  const toggleSave = (id: string) => {
    setSavedCampaigns(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const filteredCampaigns = campaigns.filter(c => {
    if (selectedCategory !== "All" && c.category !== selectedCategory) return false;
    if (selectedPlatform !== "All" && !c.platform.includes(selectedPlatform)) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !c.brand.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getMatchColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-blue-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-neutral-400";
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-pink-50/30 to-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-violet-100 text-pink-700 text-sm font-semibold mb-4">
            <Briefcase className="w-4 h-4" />
            Find Your Next Brand Deal
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Brand Campaigns
          </h1>
          <p className="text-lg text-neutral-600">
            Discover opportunities matched to your content style and audience
          </p>
        </div>

        {/* AI Match Banner */}
        <div className="bg-gradient-to-r from-violet-600 via-pink-600 to-orange-500 rounded-2xl p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <Zap className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold">AI Smart Matching</h3>
                <p className="text-white/80">12 campaigns match your profile and content style</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold">95%</p>
                <p className="text-sm text-white/80">Best Match</p>
              </div>
              <Button className="bg-white text-violet-600 hover:bg-gray-100">
                View Top Picks
              </Button>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input 
                type="text"
                placeholder="Search campaigns by brand or keyword..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-pink-500 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-pink-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Campaigns List */}
        <div className="space-y-4">
          {filteredCampaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Match Score */}
                <div className="lg:w-24 flex lg:flex-col items-center gap-2 lg:gap-1">
                  <div className={`w-16 h-16 rounded-2xl ${getMatchColor(campaign.matchScore)} flex items-center justify-center text-white text-xl font-bold`}>
                    {campaign.matchScore}
                  </div>
                  <span className="text-xs text-neutral-500 font-medium">Match</span>
                  {campaign.matchScore >= 90 && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      Perfect
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{campaign.brandLogo}</span>
                    <h3 className="font-bold text-lg">{campaign.brand}</h3>
                    {campaign.brandVerified && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full">
                      {campaign.category}
                    </span>
                    <button 
                      onClick={() => toggleSave(campaign.id)}
                      className={`ml-auto p-2 rounded-full transition-colors ${
                        savedCampaigns.includes(campaign.id) 
                          ? "bg-pink-100 text-pink-600" 
                          : "hover:bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${savedCampaigns.includes(campaign.id) ? "fill-current" : ""}`} />
                    </button>
                  </div>
                  
                  <h4 className="text-xl font-bold text-neutral-900 mb-2">{campaign.title}</h4>
                  <p className="text-neutral-600 mb-4 line-clamp-2">{campaign.description}</p>

                  {/* Requirements */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {campaign.requirements.map((req, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {req}
                      </span>
                    ))}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="font-medium">{campaign.budget}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Target className="w-4 h-4 text-violet-500" />
                      <span>{campaign.platform}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      <span>{campaign.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>{campaign.applications} applied</span>
                    </div>
                  </div>

                  {/* AI Insight */}
                  {campaign.matchScore >= 90 && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl text-sm text-green-800">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-medium">Perfect match:</span>
                      <span>Your content style aligns perfectly with this brand's aesthetic</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="lg:w-48 flex flex-col justify-between">
                  <div className="text-right mb-4">
                    <p className="text-sm text-neutral-500">Deadline</p>
                    <p className="font-medium text-neutral-900">{campaign.deadline}</p>
                    <p className="text-xs text-neutral-400 mt-1">Posted {campaign.postedAt}</p>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white">
                    Apply Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
