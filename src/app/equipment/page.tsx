"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Search, 
  Camera, 
  Mic, 
  Lightbulb, 
  Laptop,
  Drone,
  Video,
  Calendar,
  Users,
  Star,
  Shield,
  MapPin,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { id: "all", name: "All Gear", icon: Camera },
  { id: "cameras", name: "Cameras", icon: Camera, count: 234 },
  { id: "audio", name: "Audio", icon: Mic, count: 156 },
  { id: "lighting", name: "Lighting", icon: Lightbulb, count: 89 },
  { id: "computers", name: "Computers", icon: Laptop, count: 67 },
  { id: "drones", name: "Drones", icon: Drone, count: 45 },
  { id: "accessories", name: "Accessories", icon: Video, count: 312 },
];

const equipment = [
  {
    id: "1",
    name: "Sony A7IV Full-Frame",
    category: "Cameras",
    image: "📷",
    brand: "Sony",
    location: "Los Angeles, CA",
    dailyRate: 75,
    weeklyRate: 375,
    monthlyRate: 1125,
    rating: 4.9,
    reviews: 47,
    availability: ["Apr 5", "Apr 6", "Apr 7", "Apr 10", "Apr 11", "Apr 12"],
    condition: "Excellent",
    includes: ["Body only", "Battery x2", "Charger", "SD Card 64GB", "Case"],
    owner: "Alex's Camera Rentals",
    ownerVerified: true,
    responseTime: "< 1 hour",
    description: "Latest Sony A7IV with 33MP sensor. Perfect for professional shoots. Just serviced.",
  },
  {
    id: "2",
    name: "Rode VideoMic Pro+",
    category: "Audio",
    image: "🎤",
    brand: "Rode",
    location: "New York, NY",
    dailyRate: 25,
    weeklyRate: 125,
    monthlyRate: 375,
    rating: 4.8,
    reviews: 32,
    availability: ["Apr 5", "Apr 6", "Apr 7", "Apr 8", "Apr 9", "Apr 10", "Apr 11", "Apr 12"],
    condition: "Like New",
    includes: ["Mic", "Windshield", "Cable", "Case"],
    owner: "Audio Rentals NYC",
    ownerVerified: true,
    responseTime: "< 2 hours",
    description: "Professional shotgun microphone for DSLR/video cameras. Broadcast quality sound.",
  },
  {
    id: "3",
    name: "DJI RS 3 Pro Gimbal",
    category: "Accessories",
    image: "🎯",
    brand: "DJI",
    location: "Miami, FL",
    dailyRate: 55,
    weeklyRate: 275,
    monthlyRate: 825,
    rating: 4.9,
    reviews: 28,
    availability: ["Apr 8", "Apr 9", "Apr 10", "Apr 11", "Apr 12", "Apr 13", "Apr 14"],
    condition: "Excellent",
    includes: ["Gimbal", "Quick release", "Focus motor", "Case"],
    owner: "Miami Film Gear",
    ownerVerified: true,
    responseTime: "< 3 hours",
    description: "Professional 3-axis stabilizer for cinema cameras up to 10lbs.",
  },
  {
    id: "4",
    name: "Aputure 120D II LED",
    category: "Lighting",
    image: "💡",
    brand: "Aputure",
    location: "Los Angeles, CA",
    dailyRate: 45,
    weeklyRate: 225,
    monthlyRate: 675,
    rating: 4.7,
    reviews: 56,
    availability: ["Apr 5", "Apr 6", "Apr 9", "Apr 10", "Apr 13", "Apr 14"],
    condition: "Good",
    includes: ["Light head", "Control box", "C-stand", "Power cable", "Carrying bag"],
    owner: "LA Studio Rentals",
    ownerVerified: true,
    responseTime: "< 4 hours",
    description: "Powerful 120W daylight LED light. Perfect for interviews and product shots.",
  },
  {
    id: "5",
    name: "DJI Mavic 3 Pro",
    category: "Drones",
    image: "🚁",
    brand: "DJI",
    location: "Denver, CO",
    dailyRate: 95,
    weeklyRate: 475,
    monthlyRate: 1425,
    rating: 5.0,
    reviews: 19,
    availability: ["Apr 7", "Apr 8", "Apr 9", "Apr 10", "Apr 11", "Apr 12"],
    condition: "Excellent",
    includes: ["Drone", "Controller", "3 batteries", "ND filters", "Case"],
    owner: "Denver Drone Co",
    ownerVerified: true,
    responseTime: "< 2 hours",
    description: "Cinematic drone with 4/3 CMOS Hasselblad camera. 43min flight time.",
  },
  {
    id: "6",
    name: "MacBook Pro M3 Max",
    category: "Computers",
    image: "💻",
    brand: "Apple",
    location: "Seattle, WA",
    dailyRate: 65,
    weeklyRate: 325,
    monthlyRate: 975,
    rating: 4.9,
    reviews: 41,
    availability: ["Apr 5", "Apr 6", "Apr 7", "Apr 8", "Apr 9", "Apr 10", "Apr 11", "Apr 12"],
    condition: "Like New",
    includes: ["MacBook Pro 16\"", "Charger", "USB-C hub", "Mouse"],
    owner: "Tech Rentals Seattle",
    ownerVerified: true,
    responseTime: "< 1 hour",
    description: "M3 Max 16-inch, 36GB RAM. Perfect for 4K/8K editing on the go.",
  },
];

export default function EquipmentPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredEquipment = equipment.filter(item => {
    if (selectedCategory !== "all" && item.category.toLowerCase() !== selectedCategory) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 text-sm font-semibold mb-4">
            <Camera className="w-4 h-4" />
            Rent Professional Gear
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Book Equipment Like a <span className="gradient-text">Hotel</span>
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Search by gear type and dates. Pick up or have it delivered. Fully insured, verified owners.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { value: "2,500+", label: "Gear Items", icon: Camera },
            { value: "150+", label: "Verified Owners", icon: CheckCircle },
            { value: "$2M+", label: "Insurance Coverage", icon: Shield },
            { value: "4.8/5", label: "User Rating", icon: Star },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-xs text-neutral-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Hotel-style Search */}
        <div className="bg-white rounded-2xl shadow-lg border p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="text-sm font-medium text-neutral-700 mb-2 block">What gear do you need?</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input 
                  type="text"
                  placeholder="Search cameras, mics, lights..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">Pick up</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input 
                  type="date"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">Return</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input 
                  type="date"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 h-auto">
                <Search className="w-5 h-5 mr-2" />
                Check Availability
              </Button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                selectedCategory === cat.id
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg"
                  : "bg-white text-neutral-700 border hover:border-orange-300"
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.name}
              {cat.count && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  selectedCategory === cat.id ? "bg-white/20" : "bg-gray-100"
                }`}>
                  {cat.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Equipment Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition-all group"
            >
              {/* Image Area */}
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                <span className="text-6xl">{item.image}</span>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full px-3 py-1 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-sm">{item.rating}</span>
                  <span className="text-xs text-neutral-500">({item.reviews})</span>
                </div>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-full px-3 py-1">
                  <span className="text-xs font-medium">{item.category}</span>
                </div>
              </div>

              <div className="p-5">
                {/* Title & Brand */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-sm text-neutral-500">{item.brand}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 text-sm text-neutral-600 mb-3">
                  <MapPin className="w-4 h-4" />
                  {item.location}
                </div>

                {/* Condition & Owner */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.condition === "Excellent" ? "bg-green-100 text-green-700" :
                    item.condition === "Like New" ? "bg-blue-100 text-blue-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {item.condition}
                  </span>
                  <span className="text-xs text-neutral-500">•</span>
                  <span className="text-xs text-neutral-600 flex items-center gap-1">
                    By {item.owner}
                    {item.ownerVerified && <CheckCircle className="w-3 h-3 text-blue-500" />}
                  </span>
                </div>

                {/* What's Included */}
                <div className="mb-4">
                  <p className="text-xs text-neutral-500 mb-2">Includes:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.includes.slice(0, 3).map((inc, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {inc}
                      </span>
                    ))}
                    {item.includes.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{item.includes.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Availability Calendar Strip */}
                <div className="mb-4">
                  <p className="text-xs text-neutral-500 mb-2">Available dates:</p>
                  <div className="flex gap-1 flex-wrap">
                    {item.availability.map((date, i) => (
                      <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        {date}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">${item.dailyRate}</p>
                    <p className="text-xs text-neutral-500">per day</p>
                  </div>
                  <Link href={`/equipment/book?id=${item.id}`}>
                    <Button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                      Book Now
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
