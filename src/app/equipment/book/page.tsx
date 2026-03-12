"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  Camera,
  Calendar,
  Clock,
  MapPin,
  Star,
  CheckCircle,
  Shield,
  MessageSquare,
  Heart,
  Share2,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

const equipmentData = {
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
  year: "2023",
  shutterCount: "5,200",
  includes: [
    "Sony A7IV Body",
    "Original Battery (2x)",
    "Battery Charger",
    "SanDisk Extreme Pro 64GB SD Card",
    "Sony Neck Strap",
    "Protective Carrying Case",
    "Sensor Cleaning Kit"
  ],
  owner: {
    name: "Alex's Camera Rentals",
    verified: true,
    responseTime: "< 1 hour",
    memberSince: "2021",
    totalRentals: 234,
    rating: 4.9,
    avatar: "AC",
    bio: "Professional camera rental service with 5+ years experience. All equipment maintained and cleaned after each rental."
  },
  description: "Latest Sony A7IV with 33MP full-frame sensor. Perfect for professional photo and video work. Just serviced with latest firmware. This camera delivers stunning image quality with fast autofocus and excellent low-light performance. Ideal for portraits, events, and content creation.",
  policies: {
    cancellation: "Free cancellation up to 24 hours before pickup",
    deposit: "$800 hold on credit card",
    insurance: "Basic insurance included, full coverage available",
    lateFee: "$25/hour after agreed return time"
  }
};

function BookingContent() {
  const searchParams = useSearchParams();
  const [selectedDates, setSelectedDates] = useState({ start: "", end: "" });
  const [activeImage, setActiveImage] = useState(0);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState("");

  const calculateTotal = () => {
    if (!selectedDates.start || !selectedDates.end) return 0;
    const start = new Date(selectedDates.start);
    const end = new Date(selectedDates.end);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days * equipmentData.dailyRate;
  };

  const sendMessage = () => {
    // Simulate sending message
    setShowMessageModal(false);
    setMessage("");
    alert("Message sent to owner! They typically respond within 1 hour.");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Link */}
        <Link href="/equipment">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-96 flex items-center justify-center mb-6">
              <span className="text-9xl">{equipmentData.image}</span>
            </div>

            {/* Header Info */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  {equipmentData.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  equipmentData.condition === "Excellent" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {equipmentData.condition}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2">{equipmentData.name}</h1>
              <div className="flex items-center gap-4 text-sm text-neutral-600">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {equipmentData.rating} ({equipmentData.reviews} reviews)
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {equipmentData.location}
                </span>
                <span>Year: {equipmentData.year}</span>
              </div>
            </div>

            {/* Owner Card */}
            <div className="bg-white rounded-xl border p-4 mb-6">
              <div className="flex items-center justify-between">
                <Link href="/owners/1" className="flex items-center gap-3 flex-1 hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold">
                    {equipmentData.owner.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{equipmentData.owner.name}</h3>
                      {equipmentData.owner.verified && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-neutral-500">
                      Responds {equipmentData.owner.responseTime} • {equipmentData.owner.totalRentals} rentals
                    </p>
                    <p className="text-xs text-orange-600 mt-0.5">Click to view profile →</p>
                  </div>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => setShowMessageModal(true)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3">About this item</h2>
              <p className="text-neutral-600 leading-relaxed">{equipmentData.description}</p>
            </div>

            {/* What's Included */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3">What's Included</h2>
              <ul className="grid md:grid-cols-2 gap-2">
                {equipmentData.includes.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-neutral-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Policies */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3">Rental Policies</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(equipmentData.policies).map(([key, value]) => (
                  <div key={key} className="p-4 bg-gray-50 rounded-xl">
                    <p className="font-medium capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-sm text-neutral-600">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Summary */}
            <div>
              <h2 className="text-xl font-bold mb-4">Reviews</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-4xl font-bold">{equipmentData.rating}</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${star <= Math.floor(equipmentData.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
                      />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-500">{equipmentData.reviews} reviews</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div>
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl border shadow-lg p-6">
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold">${equipmentData.dailyRate}</span>
                  <span className="text-neutral-500">/day</span>
                </div>

                {/* Date Selection */}
                <div className="space-y-3 mb-4">
                  <label className="block text-sm font-medium text-neutral-700">Pickup Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={selectedDates.start}
                    onChange={(e) => setSelectedDates({ ...selectedDates, start: e.target.value })}
                  />
                  <label className="block text-sm font-medium text-neutral-700">Return Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={selectedDates.end}
                    onChange={(e) => setSelectedDates({ ...selectedDates, end: e.target.value })}
                  />
                </div>

                {/* Pricing Breakdown */}
                {selectedDates.start && selectedDates.end && (
                  <div className="border-t pt-4 mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>${equipmentData.dailyRate} x {Math.ceil((new Date(selectedDates.end).getTime() - new Date(selectedDates.start).getTime()) / (1000 * 60 * 60 * 24))} days</span>
                      <span>${calculateTotal()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Service fee</span>
                      <span>${Math.round(calculateTotal() * 0.1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Insurance</span>
                      <span>$15</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>${calculateTotal() + Math.round(calculateTotal() * 0.1) + 15}</span>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 mb-3"
                  disabled={!selectedDates.start || !selectedDates.end}
                >
                  Request to Book
                </Button>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowMessageModal(true)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Ask Question
                  </Button>
                  <Button variant="outline" className="px-3">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500">
                  <Shield className="w-4 h-4" />
                  <span>Protected by LumiAI Guarantee</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-4 bg-orange-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-orange-800 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">High Demand Item</span>
                </div>
                <p className="text-sm text-orange-700">
                  This item is booked 85% of the time. Reserve now to secure your dates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Message {equipmentData.owner.name}</h3>
              <button 
                onClick={() => setShowMessageModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-neutral-600 mb-2">About: {equipmentData.name}</p>
              <p className="text-xs text-neutral-500">
                Typical response time: {equipmentData.owner.responseTime}
              </p>
            </div>

            <textarea
              placeholder="Hi! I'm interested in renting this camera. Is it available for next weekend? Also, does it come with any lenses?"
              className="w-full h-32 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none mb-4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowMessageModal(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500"
                onClick={sendMessage}
                disabled={!message.trim()}
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

export default function EquipmentBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
