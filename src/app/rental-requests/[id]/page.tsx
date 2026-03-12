"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Shield,
  CheckCircle,
  XCircle,
  MessageSquare,
  Package,
  Star,
  User,
  Camera,
  CreditCard,
  FileText,
  AlertTriangle,
  ChevronRight,
  Phone,
  Mail,
  History,
  Download,
  Printer,
  MoreHorizontal,
  Clock3,
  CheckCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock rental request data
const rentalRequestData = {
  id: "RNT-2847",
  status: "pending",
  submittedAt: "Apr 5, 2024 at 6:25 PM",
  
  // Renter Info
  renter: {
    name: "Jordan Smith",
    avatar: "JS",
    avatarColor: "from-violet-400 to-purple-500",
    email: "jordan.smith@email.com",
    phone: "+1 (555) 123-4567",
    verified: true,
    rating: 4.8,
    totalRentals: 12,
    memberSince: "August 2024",
    bio: "Professional photographer specializing in portraits and events. Based in NYC.",
    recentRentals: [
      { gear: "Canon R5", owner: "Mike's Gear", date: "Mar 2024", rating: 5 },
      { gear: "Sony A7III", owner: "PhotoPro", date: "Feb 2024", rating: 5 },
      { gear: "DJI RS3", owner: "Gimbal King", date: "Jan 2024", rating: 4 },
    ],
  },

  // Gear Info
  gear: {
    name: "Sony A7IV",
    category: "Camera",
    image: "📷",
    description: "Professional full-frame mirrorless camera with 33MP sensor",
    serialNumber: "A7IV-78432",
    condition: "Excellent",
    purchaseYear: 2023,
    includedItems: [
      "Sony A7IV Body",
      "24-70mm f/2.8 GM Lens",
      "2x NP-FZ100 Batteries",
      "Battery Charger",
      "128GB SD Card (V60)",
      "Camera Strap",
      "Protective Case",
    ],
    dailyRate: 75,
    deposit: 800,
  },

  // Rental Details
  dates: {
    pickup: "Apr 10, 2026",
    pickupTime: "6:00 PM",
    return: "Apr 15, 2026",
    returnTime: "6:00 PM",
    duration: "5 days",
  },

  // Location
  location: {
    address: "123 Main Street, Suite 200",
    city: "New York, NY 10001",
    instructions: "Buzz 202. I'll meet you in the lobby. Free parking available behind the building.",
    lat: 40.7128,
    lng: -74.0060,
  },

  // Pricing
  pricing: {
    dailyRate: 75,
    days: 5,
    subtotal: 375,
    insurance: 50,
    serviceFee: 37.50,
    discount: -25,
    total: 437.50,
    deposit: 800,
  },

  // Messages
  messages: [
    {
      id: 1,
      sender: "renter",
      content: "Hi! I'm interested in renting this for a client shoot. Can I pick up Friday evening?",
      time: "Apr 5, 2:30 PM",
    },
    {
      id: 2,
      sender: "owner",
      content: "Hi Jordan! Yes, Friday at 6pm works. I'll include a spare battery and SD card.",
      time: "Apr 5, 3:16 PM",
    },
    {
      id: 3,
      sender: "renter",
      content: "Perfect, thank you! Looking forward to it.",
      time: "Apr 5, 6:22 PM",
    },
  ],

  // Owner Notes
  ownerNotes: "",
};

export default function RentalRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [ownerNotes, setOwnerNotes] = useState(rentalRequestData.ownerNotes);

  const handleApprove = () => {
    alert("Rental request approved! Confirmation sent to renter.");
    router.push("/analytics/gear-owner");
  };

  const handleDecline = () => {
    if (declineReason) {
      alert(`Rental request declined. Reason: ${declineReason}`);
      setShowDeclineModal(false);
      router.push("/analytics/gear-owner");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/analytics/gear-owner")}
              className="p-2 hover:bg-gray-100 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-orange-600 font-medium">Rental Request</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                  Pending Approval
                </span>
              </div>
              <h1 className="text-2xl font-bold text-neutral-900">{rentalRequestData.id}</h1>
              <p className="text-neutral-600">Submitted {rentalRequestData.submittedAt}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
              {[
                { id: "overview", label: "Overview", icon: Package },
                { id: "renter", label: "Renter Profile", icon: User },
                { id: "gear", label: "Gear Details", icon: Camera },
                { id: "messages", label: "Messages", icon: MessageSquare },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Rental Summary Card */}
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-4xl">
                      {rentalRequestData.gear.image}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl">{rentalRequestData.gear.name}</h3>
                      <p className="text-neutral-500">{rentalRequestData.gear.category}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-2xl font-bold text-orange-600">${rentalRequestData.pricing.total}</span>
                        <span className="text-neutral-500">for {rentalRequestData.dates.duration}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                        Pending
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Details Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Dates */}
                  <div className="bg-white rounded-2xl border shadow-sm p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Rental Period
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium">Pickup</p>
                          <p className="text-sm text-neutral-500">{rentalRequestData.dates.pickup} at {rentalRequestData.dates.pickupTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium">Return</p>
                          <p className="text-sm text-neutral-500">{rentalRequestData.dates.return} at {rentalRequestData.dates.returnTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Duration</p>
                          <p className="text-sm text-neutral-500">{rentalRequestData.dates.duration}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="bg-white rounded-2xl border shadow-sm p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Pickup Location
                    </h4>
                    <div className="space-y-3">
                      <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium">{rentalRequestData.location.address}</p>
                        <p className="text-sm text-neutral-500">{rentalRequestData.location.city}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Instructions:</span> {rentalRequestData.location.instructions}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Pricing Breakdown
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">${rentalRequestData.pricing.dailyRate} × {rentalRequestData.pricing.days} days</span>
                      <span>${rentalRequestData.pricing.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Insurance</span>
                      <span>${rentalRequestData.pricing.insurance}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Service Fee</span>
                      <span>${rentalRequestData.pricing.serviceFee}</span>
                    </div>
                    {rentalRequestData.pricing.discount !== 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Discount</span>
                        <span className="text-green-600">${rentalRequestData.pricing.discount}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-lg">${rentalRequestData.pricing.total}</span>
                    </div>
                    <div className="flex justify-between text-sm text-neutral-500">
                      <span>Security Deposit (held)</span>
                      <span>${rentalRequestData.pricing.deposit}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Message Preview */}
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Recent Messages
                    </h4>
                    <Link href={`/messages/${rentalRequestData.id}`}>
                      <Button variant="ghost" size="sm">
                        View All
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {rentalRequestData.messages.slice(-2).map((msg) => (
                      <div key={msg.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                          msg.sender === "owner" 
                            ? "bg-gradient-to-br from-orange-400 to-amber-500" 
                            : "bg-gradient-to-br from-violet-400 to-purple-500"
                        }`}>
                          {msg.sender === "owner" ? "AT" : "JS"}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs text-neutral-400 mt-1">{msg.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Renter Profile Tab */}
            {activeTab === "renter" && (
              <div className="space-y-6">
                {/* Renter Card */}
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${rentalRequestData.renter.avatarColor} flex items-center justify-center text-white text-2xl font-bold`}>
                      {rentalRequestData.renter.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-xl">{rentalRequestData.renter.name}</h3>
                        {rentalRequestData.renter.verified && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-500">{rentalRequestData.renter.bio}</p>
                      <div className="flex gap-4 mt-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="font-medium">{rentalRequestData.renter.rating}</span>
                          <span className="text-neutral-500 text-sm">rating</span>
                        </div>
                        <span className="text-neutral-300">|</span>
                        <span className="text-sm"><span className="font-medium">{rentalRequestData.renter.totalRentals}</span> rentals</span>
                        <span className="text-neutral-300">|</span>
                        <span className="text-sm">Member since {rentalRequestData.renter.memberSince}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <a href={`mailto:${rentalRequestData.renter.email}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                    </a>
                    <a href={`tel:${rentalRequestData.renter.phone}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Rental History */}
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Recent Rental History
                  </h4>
                  <div className="space-y-3">
                    {rentalRequestData.renter.recentRentals.map((rental, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-lg">
                          📷
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{rental.gear}</p>
                          <p className="text-sm text-neutral-500">from {rental.owner} • {rental.date}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array(5).fill(0).map((_, j) => (
                            <Star 
                              key={j} 
                              className={`w-4 h-4 ${j < rental.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Gear Details Tab */}
            {activeTab === "gear" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-5xl">
                      {rentalRequestData.gear.image}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">{rentalRequestData.gear.name}</h3>
                      <p className="text-neutral-500">{rentalRequestData.gear.category}</p>
                      <p className="text-sm text-neutral-400 mt-1">S/N: {rentalRequestData.gear.serialNumber}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">{rentalRequestData.gear.condition}</span>
                        <span className="text-sm text-neutral-500">Purchased {rentalRequestData.gear.purchaseYear}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-neutral-600 mb-6">{rentalRequestData.gear.description}</p>

                  <h4 className="font-semibold mb-3">What's Included</h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {rentalRequestData.gear.includedItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === "messages" && (
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-semibold">Conversation History</h4>
                  <Link href={`/messages/${rentalRequestData.id}`}>
                    <Button>Open Full Chat</Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {rentalRequestData.messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.sender === "owner" ? "flex-row-reverse" : ""}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                        msg.sender === "owner" 
                          ? "bg-gradient-to-br from-orange-400 to-amber-500" 
                          : "bg-gradient-to-br from-violet-400 to-purple-500"
                      }`}>
                        {msg.sender === "owner" ? "AT" : "JS"}
                      </div>
                      <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                        msg.sender === "owner"
                          ? "bg-orange-500 text-white rounded-br-md"
                          : "bg-gray-100 rounded-bl-md"
                      }`}>
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.sender === "owner" ? "text-orange-100" : "text-neutral-400"}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Action Card */}
            <div className="bg-white rounded-2xl border shadow-sm p-6 sticky top-24">
              <h3 className="font-bold mb-4">Review Request</h3>
              
              {/* Renter Quick Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rentalRequestData.renter.avatarColor} flex items-center justify-center text-white font-bold`}>
                  {rentalRequestData.renter.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{rentalRequestData.renter.name}</p>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span>{rentalRequestData.renter.rating}</span>
                    <span>• {rentalRequestData.renter.totalRentals} rentals</span>
                  </div>
                </div>
              </div>

              {/* Calendar Conflict Check */}
              <div className="p-3 bg-green-50 rounded-xl mb-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">No Calendar Conflicts</span>
                </div>
                <p className="text-xs text-green-600 mt-1">These dates are available</p>
              </div>

              {/* Deposit Info */}
              <div className="p-3 bg-blue-50 rounded-xl mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700">Security Deposit</span>
                  <span className="font-bold text-blue-700">${rentalRequestData.pricing.deposit}</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">Will be held until return</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  className="w-full bg-green-500 hover:bg-green-600"
                  onClick={handleApprove}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Request
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowDeclineModal(true)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Decline
                </Button>
              </div>

              {/* Owner Notes */}
              <div className="mt-4 pt-4 border-t">
                <label className="text-sm font-medium mb-2 block">Private Notes</label>
                <textarea
                  value={ownerNotes}
                  onChange={(e) => setOwnerNotes(e.target.value)}
                  placeholder="Add notes about this rental..."
                  className="w-full h-20 px-3 py-2 bg-gray-50 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Help */}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-neutral-500">
                  <span className="font-medium">Tip:</span> Check renter's profile and previous rentals before approving.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-md p-6"
          >
            <h3 className="font-bold text-lg mb-2">Decline Rental Request</h3>
            <p className="text-neutral-500 text-sm mb-4">
              Please provide a reason. This will be shared with the renter.
            </p>
            <div className="space-y-2 mb-4">
              {[
                "Gear not available on those dates",
                "Renter has insufficient verification",
                "Previous rental issues",
                "Other (please specify)",
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setDeclineReason(reason)}
                  className={`w-full p-3 rounded-xl text-left text-sm transition-colors ${
                    declineReason === reason 
                      ? "bg-orange-100 text-orange-700 border border-orange-200" 
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowDeclineModal(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-red-500 hover:bg-red-600"
                disabled={!declineReason}
                onClick={handleDecline}
              >
                Decline Request
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
