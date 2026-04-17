"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Instagram, 
  Youtube, 
  Twitter, 
  Globe,
  MapPin,
  Link as LinkIcon,
  Mail,
  Heart,
  Eye,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Grid3X3,
  Video,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicView } from "@/components/role-guard";

const publicProfile = {
  name: "Sarah Chen",
  handle: "@sarahstyles",
  verified: true,
  avatar: "SC",
  avatarColor: "from-pink-400 to-rose-500",
  bio: "Fashion enthusiast sharing affordable style tips. Helping you look expensive on a budget! 💕 Based in Los Angeles.",
  location: "Los Angeles, CA",
  website: "sarahstyles.com",
  niche: "Fashion & Style",
  platforms: [
    { name: "Instagram", handle: "@sarahstyles", followers: "125K", icon: Instagram },
    { name: "TikTok", handle: "@sarahstyles", followers: "85K", icon: Users },
    { name: "YouTube", handle: "Sarah Chen", followers: "45K", icon: Youtube },
  ],
  stats: {
    followers: "125K",
    engagement: "4.8%",
    avgViews: "45K",
    collaborations: 48,
    rating: 4.9,
  },
  portfolio: [
    { type: "video", title: "Summer Lookbook 2026", views: "145K", thumbnail: "👗", duration: "3:24" },
    { type: "video", title: "Thrift Flip Challenge", views: "98K", thumbnail: "🛍️", duration: "5:12" },
    { type: "video", title: "Office Outfit Ideas", views: "76K", thumbnail: "👔", duration: "4:45" },
    { type: "image", title: "Weekend Casual", views: "52K", thumbnail: "👟" },
    { type: "video", title: "Budget Fashion Haul", views: "89K", thumbnail: "💰", duration: "8:30" },
    { type: "image", title: "Date Night Look", views: "67K", thumbnail: "💄" },
  ],
  recentWork: [
    { brand: "Zara", type: "Fashion", engagement: "6.2%" },
    { brand: "Sephora", type: "Beauty", engagement: "5.8%" },
    { brand: "H&M", type: "Fashion", engagement: "5.1%" },
    { brand: "Nordstrom", type: "Fashion", engagement: "4.9%" },
  ],
  contentTypes: ["Outfit styling", "Thrift flips", "Lookbooks", "Shopping hauls"],
  tags: ["Fashion", "Affordable", "Styling", "OOTD", "Thrifted"],
  rateRange: "$800 - $2,500",
};

function PublicProfileContent() {
  const [activeTab, setActiveTab] = useState("portfolio");
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-violet-50/30 to-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Link */}
        <Link href="/analytics">
          <Button variant="ghost" className="mb-6">
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden mb-8">
          {/* Cover */}
          <div className="h-48 bg-gradient-to-r from-pink-400 via-violet-500 to-purple-600" />
          
          <div className="px-8 pb-8">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col md:flex-row gap-6 -mt-16 mb-6">
              <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${publicProfile.avatarColor} flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg`}>
                {publicProfile.avatar}
              </div>
              <div className="flex-1 pt-4 md:pt-16">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-neutral-900">{publicProfile.name}</h1>
                  {publicProfile.verified && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-neutral-500">{publicProfile.handle}</p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-neutral-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {publicProfile.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <LinkIcon className="w-4 h-4" />
                    {publicProfile.website}
                  </span>
                  <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                    {publicProfile.niche}
                  </span>
                </div>
              </div>
              <div className="pt-4 md:pt-16 flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setShowContactModal(true)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact
                </Button>
                <Button className="bg-gradient-to-r from-violet-500 to-pink-500">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Work With Me
                </Button>
              </div>
            </div>

            {/* Bio */}
            <p className="text-neutral-700 mb-6">{publicProfile.bio}</p>

            {/* Rate Range */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6">
              <div>
                <p className="text-sm text-neutral-500">Rate Range</p>
                <p className="text-xl font-bold text-neutral-900">{publicProfile.rateRange}</p>
              </div>
              <div className="ml-auto">
                <p className="text-sm text-neutral-500">Creator Rating</p>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold">{publicProfile.stats.rating}</span>
                  <span className="text-sm text-neutral-500">({publicProfile.stats.collaborations} reviews)</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: "Followers", value: publicProfile.stats.followers },
                { label: "Engagement", value: publicProfile.stats.engagement },
                { label: "Avg Views", value: publicProfile.stats.avgViews },
                { label: "Collabs", value: publicProfile.stats.collaborations },
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 bg-gray-50 rounded-2xl">
                  <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                  <p className="text-sm text-neutral-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Platforms */}
            <div className="mb-8">
              <h3 className="font-bold text-lg mb-4">Platforms</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {publicProfile.platforms.map((platform, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white">
                      <platform.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{platform.name}</p>
                      <p className="text-sm text-neutral-500">{platform.followers} followers</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b mb-6">
              {[
                { id: "portfolio", label: "Portfolio", icon: Grid3X3 },
                { id: "work", label: "Brand Work", icon: Star },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-violet-500 text-violet-600"
                      : "border-transparent text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Portfolio Tab */}
            {activeTab === "portfolio" && (
              <div className="grid md:grid-cols-3 gap-4">
                {publicProfile.portfolio.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl aspect-square flex items-center justify-center cursor-pointer overflow-hidden"
                  >
                    <span className="text-6xl group-hover:scale-110 transition-transform">{item.thumbnail}</span>
                    {item.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                          <Play className="w-6 h-6 text-neutral-900 ml-1" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      <p className="text-xs opacity-80">{item.views} views</p>
                    </div>
                    {item.duration && (
                      <span className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                        {item.duration}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Brand Work Tab */}
            {activeTab === "work" && (
              <div className="space-y-4">
                {publicProfile.recentWork.map((work, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium">{work.brand}</p>
                      <p className="text-sm text-neutral-500">{work.type}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {work.engagement} engagement
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Content Types */}
            <div className="mt-8 pt-8 border-t">
              <h3 className="font-bold text-lg mb-4">Content Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {publicProfile.contentTypes.map((type, i) => (
                  <span key={i} className="px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-2xl p-6 border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Brand Reviews</h3>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="font-bold">{publicProfile.stats.rating}</span>
              <span className="text-neutral-500">({publicProfile.stats.collaborations} reviews)</span>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { brand: "Glow Skincare", rating: 5, text: "Sarah was professional, delivered on time, and the content exceeded our expectations. Highly recommend!" },
              { brand: "Fashion Nova", rating: 5, text: "Great engagement and beautiful content. Would work with again!" },
              { brand: "Sephora", rating: 4, text: "Professional and easy to work with. Content quality was excellent." },
            ].map((review, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{review.brand}</p>
                  <div className="flex">
                    {Array(5).fill(0).map((_, j) => (
                      <Star 
                        key={j} 
                        className={`w-4 h-4 ${j < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-neutral-600">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Contact {publicProfile.name}</h3>
              <button 
                onClick={() => setShowContactModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-neutral-600">Rate Range: {publicProfile.rateRange}</p>
              <p className="text-xs text-neutral-500">Typical response time: Within 24 hours</p>
            </div>

            <input
              type="text"
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-xl border mb-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-4 py-3 rounded-xl border mb-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <textarea
              placeholder="Tell me about your campaign..."
              className="w-full h-32 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none mb-4"
            />

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowContactModal(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500"
                onClick={() => {
                  setShowContactModal(false);
                  alert("Message sent! Sarah will respond within 24 hours.");
                }}
              >
                Send Message
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}

export default function PublicProfilePage() {
  return (
    <PublicView>
      <PublicProfileContent />
    </PublicView>
  );
}
