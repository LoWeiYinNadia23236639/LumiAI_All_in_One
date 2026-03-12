"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  Play,
  Heart,
  MessageSquare,
  Mail,
  Star,
  MapPin,
  Users,
  CheckCircle,
  Instagram,
  Youtube,
  Twitter,
  Bookmark,
  Share2,
  Grid3X3,
  Video,
  FileText,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";

// This would normally come from an API based on the ID
const creatorData = {
  id: "1",
  name: "Sarah Chen",
  handle: "@sarahstyles",
  verified: true,
  avatar: "SC",
  avatarColor: "from-pink-400 to-rose-500",
  bio: "Fashion enthusiast sharing affordable style tips. Helping you look expensive on a budget! 💕 Based in Los Angeles.",
  location: "Los Angeles, CA",
  niche: "Fashion & Style",
  email: "sarah@sarahstyles.com",
  website: "sarahstyles.com",
  
  stats: {
    followers: "125K",
    engagement: "4.8%",
    avgViews: "45K",
    totalPosts: 342,
    collaborations: 48,
    rating: 4.9,
  },
  
  platforms: [
    { name: "Instagram", followers: "125K", url: "instagram.com/sarahstyles" },
    { name: "TikTok", followers: "85K", url: "tiktok.com/@sarahstyles" },
    { name: "YouTube", followers: "45K", url: "youtube.com/sarahchen" },
  ],
  
  rateRange: "$800 - $2,500",
  
  portfolio: [
    { 
      id: 1,
      type: "video", 
      title: "Summer Lookbook 2026", 
      views: "145K", 
      likes: "12.3K",
      thumbnail: "👗", 
      duration: "3:24",
      description: "10 summer outfits under $50 each! Perfect for hot days and beach trips.",
      brand: "H&M"
    },
    { 
      id: 2,
      type: "video", 
      title: "Thrift Flip Challenge", 
      views: "98K", 
      likes: "8.7K",
      thumbnail: "🛍️", 
      duration: "5:12",
      description: "Transforming thrift store finds into trendy pieces. From $5 to fabulous!",
      brand: "Thrifted"
    },
    { 
      id: 3,
      type: "video", 
      title: "Office Outfit Ideas", 
      views: "76K", 
      likes: "6.2K",
      thumbnail: "👔", 
      duration: "4:45",
      description: "Professional yet stylish outfits for the modern working woman.",
      brand: "Zara"
    },
    { 
      id: 4,
      type: "image", 
      title: "Weekend Casual", 
      views: "52K", 
      likes: "4.1K",
      thumbnail: "👟",
      description: "Comfy weekend vibes with my favorite sneakers.",
      brand: "Nike"
    },
    { 
      id: 5,
      type: "video", 
      title: "Budget Fashion Haul", 
      views: "89K", 
      likes: "7.8K",
      thumbnail: "💰", 
      duration: "8:30",
      description: "$200 challenge - can I build a full wardrobe? Let's find out!",
      brand: "SHEIN"
    },
    { 
      id: 6,
      type: "image", 
      title: "Date Night Look", 
      views: "67K", 
      likes: "5.4K",
      thumbnail: "💄",
      description: "Feeling confident in this red dress for date night.",
      brand: "Revolve"
    },
  ],
  
  previousWork: [
    { brand: "Zara", campaign: "Spring Collection", results: "2.1M views, 6.2% engagement", date: "Feb 2026" },
    { brand: "Sephora", campaign: "Makeup Tutorial Series", results: "1.8M views, 5.8% engagement", date: "Jan 2026" },
    { brand: "H&M", campaign: "Sustainable Fashion", results: "1.5M views, 5.1% engagement", date: "Dec 2025" },
    { brand: "Nordstrom", campaign: "Holiday Gift Guide", results: "1.2M views, 4.9% engagement", date: "Nov 2025" },
  ],
  
  audience: {
    demographics: { female: 68, male: 30, other: 2 },
    topLocations: ["United States (45%)", "Canada (12%)", "UK (10%)"],
    ageGroups: ["18-24 (35%)", "25-34 (42%)", "35-44 (18%)"],
    interests: ["Fashion", "Beauty", "Lifestyle", "Shopping"]
  },
  
  contentTypes: ["Outfit styling", "Thrift flips", "Lookbooks", "Shopping hauls", "GRWM"],
  tags: ["Fashion", "Affordable", "Styling", "OOTD", "Thrifted", "Sustainable"],
  
  reviews: [
    { brand: "Glow Skincare", rating: 5, text: "Sarah was professional, delivered on time, and the content exceeded our expectations. Highly recommend!", date: "2 weeks ago" },
    { brand: "Fashion Nova", rating: 5, text: "Great engagement and beautiful content. Would work with again!", date: "1 month ago" },
    { brand: "Sephora", rating: 4, text: "Professional and easy to work with. Content quality was excellent.", date: "2 months ago" },
  ]
};

export default function CreatorDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("portfolio");
  const [showContactModal, setShowContactModal] = useState(false);
  const [showWorkModal, setShowWorkModal] = useState<typeof creatorData.portfolio[0] | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-violet-50/30 to-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Link */}
        <Link href="/marketplace/talent">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Creators
          </Button>
        </Link>

        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden mb-8">
          <div className="h-48 bg-gradient-to-r from-pink-400 via-violet-500 to-purple-600" />
          
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 -mt-16 mb-6">
              <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${creatorData.avatarColor} flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg`}>
                {creatorData.avatar}
              </div>
              <div className="flex-1 pt-4 md:pt-16">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-neutral-900">{creatorData.name}</h1>
                  {creatorData.verified && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified Creator
                    </span>
                  )}
                </div>
                <p className="text-neutral-500">{creatorData.handle}</p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-neutral-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {creatorData.location}
                  </span>
                  <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                    {creatorData.niche}
                  </span>
                </div>
              </div>
              <div className="pt-4 md:pt-16 flex flex-col gap-2">
                <div className="text-right mb-2">
                  <p className="text-sm text-neutral-500">Rate Range</p>
                  <p className="text-xl font-bold text-neutral-900">{creatorData.rateRange}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => setShowContactModal(true)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                  <Button className="bg-gradient-to-r from-violet-500 to-pink-500">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Offer
                  </Button>
                </div>
              </div>
            </div>

            {/* Bio */}
            <p className="text-neutral-700 mb-6">{creatorData.bio}</p>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
              {[
                { label: "Followers", value: creatorData.stats.followers },
                { label: "Engagement", value: creatorData.stats.engagement },
                { label: "Avg Views", value: creatorData.stats.avgViews },
                { label: "Posts", value: creatorData.stats.totalPosts },
                { label: "Collabs", value: creatorData.stats.collaborations },
                { label: "Rating", value: creatorData.stats.rating, icon: Star },
              ].map((stat, i) => (
                <div key={i} className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-lg font-bold text-neutral-900 flex items-center justify-center gap-1">
                    {stat.value}
                    {stat.icon && <stat.icon className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  </p>
                  <p className="text-xs text-neutral-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-2 mb-6">
              {creatorData.platforms.map((platform, i) => (
                <a
                  key={i}
                  href={`https://${platform.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  {platform.name}: {platform.followers}
                </a>
              ))}
              <a
                href={`https://${creatorData.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm hover:bg-violet-200 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Website
              </a>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {creatorData.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-4 border-b mb-6">
              {[
                { id: "portfolio", label: "Portfolio", icon: Grid3X3 },
                { id: "work", label: "Previous Work", icon: FileText },
                { id: "audience", label: "Audience", icon: Users },
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
                {creatorData.portfolio.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setShowWorkModal(item)}
                    className="group relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl aspect-square flex items-center justify-center cursor-pointer overflow-hidden hover:shadow-lg transition-all"
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
                      <p className="text-xs opacity-80">{item.views} views • {item.brand}</p>
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

            {/* Previous Work Tab */}
            {activeTab === "work" && (
              <div className="space-y-4">
                {creatorData.previousWork.map((work, i) => (
                  <div key={i} className="p-4 bg-white rounded-xl border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-bold">{work.brand}</h4>
                        <p className="text-sm text-neutral-500">{work.campaign}</p>
                      </div>
                      <span className="text-sm text-neutral-400">{work.date}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                        {work.results}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Audience Tab */}
            {activeTab === "audience" && (
              <div className="space-y-6">
                {/* Demographics */}
                <div className="bg-white rounded-xl border p-6">
                  <h4 className="font-bold mb-4">Demographics</h4>
                  <div className="mb-4">
                    <p className="text-sm text-neutral-500 mb-2">Gender</p>
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
                </div>

                {/* Top Locations */}
                <div className="bg-white rounded-xl border p-6">
                  <h4 className="font-bold mb-4">Top Locations</h4>
                  <div className="space-y-2">
                    {creatorData.audience.topLocations.map((loc, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="bg-violet-500 h-2 rounded-full"
                            style={{ width: `${100 - i * 20}%` }}
                          />
                        </div>
                        <span className="text-sm whitespace-nowrap">{loc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div className="bg-white rounded-xl border p-6">
                  <h4 className="font-bold mb-4">Audience Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {creatorData.audience.interests.map((interest, i) => (
                      <span key={i} className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">Interested in working together?</h3>
              <p className="text-white/90 text-sm mb-4">
                {creatorData.name} typically responds within 24 hours.
              </p>
              <Button 
                className="w-full bg-white text-violet-600 hover:bg-gray-100 mb-2"
                onClick={() => setShowContactModal(true)}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Button variant="outline" className="w-full border-white text-white hover:bg-white/10">
                <Bookmark className="w-4 h-4 mr-2" />
                Save to List
              </Button>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="font-bold mb-4">Brand Reviews</h3>
              <div className="space-y-4">
                {creatorData.reviews.map((review, i) => (
                  <div key={i} className="border-b last:border-b-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{review.brand}</p>
                      <div className="flex">
                        {Array(5).fill(0).map((_, j) => (
                          <Star 
                            key={j} 
                            className={`w-3 h-3 ${j < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-neutral-600 mb-1">{review.text}</p>
                    <p className="text-xs text-neutral-400">{review.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Types */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="font-bold mb-4">Content Types</h3>
              <div className="flex flex-wrap gap-2">
                {creatorData.contentTypes.map((type, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Work Detail Modal */}
      {showWorkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{showWorkModal.title}</h3>
              <button 
                onClick={() => setShowWorkModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-64 flex items-center justify-center mb-4">
              <span className="text-8xl">{showWorkModal.thumbnail}</span>
            </div>

            <div className="flex items-center gap-4 mb-4 text-sm">
              <span className="flex items-center gap-1">
                <Play className="w-4 h-4" />
                {showWorkModal.views} views
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {showWorkModal.likes} likes
              </span>
              <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs">
                {showWorkModal.brand}
              </span>
            </div>

            <p className="text-neutral-600 mb-4">{showWorkModal.description}</p>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowWorkModal(null)}
              >
                Close
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500"
                onClick={() => {
                  setShowWorkModal(null);
                  setShowContactModal(true);
                }}
              >
                Discuss This Style
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Contact {creatorData.name}</h3>
              <button 
                onClick={() => setShowContactModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-neutral-600">Rate Range: {creatorData.rateRange}</p>
              <p className="text-xs text-neutral-500">Typical response: Within 24 hours</p>
            </div>

            <input
              type="text"
              placeholder="Your company name"
              className="w-full px-4 py-3 rounded-xl border mb-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-4 py-3 rounded-xl border mb-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <select className="w-full px-4 py-3 rounded-xl border mb-3 focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option>Select campaign type</option>
              <option>Product Review</option>
              <option>Sponsored Post</option>
              <option>Brand Ambassador</option>
              <option>Event Coverage</option>
            </select>
            <textarea
              placeholder="Tell me about your campaign and goals..."
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
                  alert(`Message sent to ${creatorData.name}! They will respond within 24 hours.`);
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
