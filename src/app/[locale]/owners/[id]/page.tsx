"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  Camera,
  Star,
  MapPin,
  Calendar,
  MessageSquare,
  CheckCircle,
  Package,
  Mail,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth-guard";
import { ShareButton } from "@/components/share-button";

const ownerData = {
  id: "1",
  name: "Alex's Camera Rentals",
  handle: "@alexscameras",
  verified: true,
  avatar: "AC",
  avatarColor: "",
  bio: "Professional camera rental service with 5+ years experience. All equipment maintained and cleaned after each rental.",
  location: "Los Angeles, CA",
  website: "alexscameras.com",
  memberSince: "2021",
  
  stats: {
    totalRentals: 234,
    responseTime: "< 1 hour",
    rating: 4.9,
    reviewCount: 47,
    responseRate: "98%",
    gearItems: 12
  },
  
  gear: [
    { id: "1", name: "Sony A7IV Full-Frame", category: "Camera", dailyRate: 75, image: "📷", rating: 4.9, reviews: 23, status: "available" },
    { id: "2", name: "Canon R5", category: "Camera", dailyRate: 95, image: "📸", rating: 4.8, reviews: 18, status: "available" },
    { id: "3", name: "DJI RS 3 Pro Gimbal", category: "Gimbal", dailyRate: 55, image: "🎯", rating: 4.9, reviews: 15, status: "rented" },
    { id: "4", name: "Aputure 120D II LED", category: "Lighting", dailyRate: 45, image: "💡", rating: 4.7, reviews: 12, status: "available" },
  ],
  
  reviews: [
    { renter: "Jordan Smith", rating: 5, text: "Alex was incredibly helpful! The camera was in perfect condition.", date: "2 weeks ago", gear: "Sony A7IV" },
    { renter: "Taylor Wilson", rating: 5, text: "Super fast response time and flexible pickup.", date: "1 month ago", gear: "Canon R5" },
  ],
  
  policies: {
    cancellation: "Free cancellation up to 24 hours before pickup",
    lateFee: "$25/hour after agreed return time",
    cleaning: "All gear sanitized between rentals",
    support: "24/7 emergency support during rental period"
  }
};

function OwnerProfilePage({ params }: { params: { id: string } }) {
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(ownerData.gear.map(g => g.category)))];
  const filteredGear = selectedCategory === "All" 
    ? ownerData.gear 
    : ownerData.gear.filter(g => g.category === selectedCategory);

  return (
    <main className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <Link href="/equipment">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Button>
        </Link>

        {/* Profile Header */}
        <div className="bg-paper rounded-xl border border-line overflow-hidden mb-8">
          <div className="h-48 bg-primary" />
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 -mt-16 mb-6">
              <div className="w-32 h-32 rounded-xl bg-primary flex items-center justify-center text-cream text-4xl font-bold border-4 border-paper">
                {ownerData.avatar}
              </div>
              <div className="flex-1 pt-4 md:pt-16">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-neutral-900">{ownerData.name}</h1>
                  {ownerData.verified && (
                    <span className="px-2 py-1 bg-primary-soft text-primary text-xs font-bold rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified Owner
                    </span>
                  )}
                </div>
                <p className="text-neutral-500">{ownerData.handle}</p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-neutral-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {ownerData.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Member since {ownerData.memberSince}
                  </span>
                </div>
              </div>
              <div className="pt-4 md:pt-16 flex gap-2">
                <ShareButton />
                <Button variant="outline" onClick={() => setShowContactModal(true)}>
                  <Mail className="w-4 h-4 mr-2" />
                  Contact
                </Button>
                <Button>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>

            <p className="text-neutral-700 mb-6 max-w-3xl">{ownerData.bio}</p>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
              {[
                { label: "Total Rentals", value: ownerData.stats.totalRentals },
                { label: "Response Time", value: ownerData.stats.responseTime },
                { label: "Rating", value: ownerData.stats.rating, icon: Star },
                { label: "Reviews", value: ownerData.stats.reviewCount },
                { label: "Response Rate", value: ownerData.stats.responseRate },
                { label: "Gear Items", value: ownerData.stats.gearItems },
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-neutral-900 flex items-center justify-center gap-1">
                    {stat.value}
                    {stat.icon && <stat.icon className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  </p>
                  <p className="text-xs text-neutral-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gear Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold">Available Gear ({ownerData.gear.length} items)</h2>
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-primary text-cream"
                      : "bg-gray-100 text-neutral-700 hover:bg-primary-soft"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGear.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-paper rounded-lg border border-line overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="h-48 bg-primary-soft flex items-center justify-center">
                  <span className="text-6xl">{item.image}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 bg-primary-soft text-primary rounded-full text-xs font-medium">
                      {item.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'available' ? 'bg-green-100 text-green-700' :
                      item.status === 'rented' ? 'bg-primary-soft text-primary' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-neutral-500 mb-3">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{item.rating}</span>
                    <span>({item.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-neutral-900">${item.dailyRate}</p>
                      <p className="text-xs text-neutral-500">per day</p>
                    </div>
                    <Link href="/equipment">
                      <Button>
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OwnerDetailPageWrapper({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      <OwnerProfilePage params={params} />
    </AuthGuard>
  );
}
