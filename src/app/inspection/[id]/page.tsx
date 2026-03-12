"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  Camera,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Phone,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Shield,
  FileText,
  Eye,
  ChevronRight,
  ChevronLeft,
  Upload,
  CheckCheck,
  Wrench,
  Info,
  Download,
  Star,
  User,
  Package,
  CheckSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock inspection data - in real app, fetch by ID
const inspectionData = {
  id: "INSP-2847",
  rental: {
    id: "RNT-2847",
    gear: {
      name: "Canon R5",
      category: "Camera",
      image: "📸",
      description: "Professional full-frame mirrorless camera",
      serialNumber: "CR5-88234-XF",
      condition: "Excellent",
      purchaseDate: "2023-06-15",
      dailyRate: 95,
    },
    renter: {
      name: "Taylor Wilson",
      avatar: "TW",
      email: "taylor@email.com",
      phone: "+1 (555) 123-4567",
      rating: 4.8,
      rentals: 12,
    },
    owner: {
      name: "Alex Thompson",
      avatar: "AT",
      email: "alex@email.com",
      phone: "+1 (555) 987-6543",
    },
    dates: {
      pickup: "2026-04-10",
      pickupTime: "10:00 AM",
      return: "2026-04-15",
      returnTime: "6:00 PM",
    },
    location: "Downtown Studio, 123 Main St, New York, NY 10001",
    total: "$475",
    deposit: "$800",
  },
  photos: {
    pickup: [
      { id: 1, label: "Front View", note: "No visible scratches" },
      { id: 2, label: "Back/LCD Screen", note: "Screen protector applied" },
      { id: 3, label: "Top Controls", note: "All buttons functional" },
      { id: 4, label: "Lens Mount", note: "Clean, no dust" },
      { id: 5, label: "Accessories", note: "Battery, charger, strap included" },
      { id: 6, label: "Serial Number", note: "CR5-88234-XF verified" },
    ],
    return: [
      { id: 1, label: "Front View", note: "Small scratch on top plate - see photo 7" },
      { id: 2, label: "Back/LCD Screen", note: "Screen protector still on, minor smudge" },
      { id: 3, label: "Top Controls", note: "All buttons functional" },
      { id: 4, label: "Lens Mount", note: "Clean, no dust" },
      { id: 5, label: "Accessories", note: "All items returned" },
      { id: 6, label: "Serial Number", note: "Matches pickup - CR5-88234-XF" },
      { id: 7, label: "Damage Detail", note: "New 2cm scratch on top plate near hot shoe" },
    ],
  },
  checklist: {
    body: { status: "damaged", note: "New scratch on top plate" },
    lcd: { status: "good", note: "Screen protector intact" },
    buttons: { status: "good", note: "All functional" },
    lensMount: { status: "good", note: "Clean" },
    sensor: { status: "good", note: "No visible dust" },
    battery: { status: "good", note: "Charged, works" },
    charger: { status: "good", note: "Original included" },
    strap: { status: "good", note: "Present" },
  },
  timeline: [
    { time: "Apr 10, 10:00 AM", event: "Pickup completed", by: "Alex Thompson", icon: Package },
    { time: "Apr 10, 10:15 AM", event: "Pickup photos uploaded", by: "Taylor Wilson", icon: Camera },
    { time: "Apr 15, 5:45 PM", event: "Return initiated", by: "Taylor Wilson", icon: ArrowLeft },
    { time: "Apr 15, 6:00 PM", event: "Return photos uploaded", by: "Taylor Wilson", icon: Camera },
    { time: "Apr 15, 6:05 PM", event: "Inspection requested", by: "System", icon: CheckCheck },
  ],
  notes: {
    pickup: "Renter was professional. Gear handed over in original case. All accessories accounted for.",
    return: "Renter mentioned minor scratch appeared during shoot. Photos provided for review.",
    renter: "The scratch happened when the camera brushed against a metal railing during outdoor shoot. I apologize for this.",
  },
  comparisonIssues: [
    { item: "Top plate", pickup: "No scratches", return: "2cm scratch near hot shoe", severity: "minor" },
  ],
};

export default function InspectionPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPhoto, setSelectedPhoto] = useState<{ type: 'pickup' | 'return', index: number } | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [inspectionNote, setInspectionNote] = useState("");
  const [decision, setDecision] = useState<"approve" | "deduct" | "repair" | null>(null);
  const [deductAmount, setDeductAmount] = useState("");

  const data = inspectionData;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <CheckCheck className="w-5 h-5" />
                <span className="font-medium">Return Inspection</span>
              </div>
              <h1 className="text-2xl font-bold text-neutral-900">{data.id}</h1>
              <p className="text-neutral-600">Rental #{data.rental.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
              Awaiting Your Review
            </span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Gear & People */}
          <div className="space-y-6">
            {/* Gear Card */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-4xl">
                  {data.rental.gear.image}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{data.rental.gear.name}</h3>
                  <p className="text-sm text-neutral-500">{data.rental.gear.category}</p>
                  <p className="text-sm text-neutral-500">S/N: {data.rental.gear.serialNumber}</p>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Daily Rate</span>
                  <span className="font-medium">${data.rental.gear.dailyRate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Rental Total</span>
                  <span className="font-medium">{data.rental.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Deposit Held</span>
                  <span className="font-medium text-amber-600">{data.rental.deposit}</span>
                </div>
              </div>
            </div>

            {/* Renter Card */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Renter
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
                  {data.rental.renter.avatar}
                </div>
                <div>
                  <p className="font-medium">{data.rental.renter.name}</p>
                  <div className="flex items-center gap-1 text-sm text-neutral-500">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>{data.rental.renter.rating}</span>
                    <span>• {data.rental.renter.rentals} rentals</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <a href={`tel:${data.rental.renter.phone}`} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900">
                  <Phone className="w-4 h-4" />
                  {data.rental.renter.phone}
                </a>
                <a href={`mailto:${data.rental.renter.email}`} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900">
                  <MessageSquare className="w-4 h-4" />
                  {data.rental.renter.email}
                </a>
              </div>
            </div>

            {/* Rental Details */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="font-semibold mb-4">Rental Details</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Pickup</p>
                    <p className="text-sm text-neutral-500">{data.rental.dates.pickup} at {data.rental.dates.pickupTime}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Return</p>
                    <p className="text-sm text-neutral-500">{data.rental.dates.return} at {data.rental.dates.returnTime}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-neutral-500">{data.rental.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center & Right Column - Inspection Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Comparison Alert */}
            {data.comparisonIssues.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Condition Changes Detected</p>
                    <p className="text-sm text-amber-800 mt-1">
                      Our AI comparison found {data.comparisonIssues.length} difference between pickup and return photos.
                    </p>
                    <button 
                      onClick={() => setShowComparison(true)}
                      className="mt-2 text-sm font-medium text-amber-700 hover:text-amber-900 underline"
                    >
                      View Comparison
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              {[
                { id: "overview", label: "Overview", icon: Eye },
                { id: "photos", label: "Photos", icon: Camera },
                { id: "checklist", label: "Checklist", icon: CheckSquare },
                { id: "timeline", label: "Timeline", icon: Clock },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                    activeTab === tab.id
                      ? "bg-white text-amber-600 shadow-sm"
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
                {/* Photos Summary */}
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <h3 className="font-semibold mb-4">Photo Comparison</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-600 mb-2">Pickup Photos ({data.photos.pickup.length})</p>
                      <div className="grid grid-cols-3 gap-2">
                        {data.photos.pickup.slice(0, 3).map((photo, i) => (
                          <button 
                            key={i} 
                            onClick={() => setSelectedPhoto({ type: 'pickup', index: i })}
                            className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                            <Camera className="w-5 h-5 text-gray-400" />
                          </button>
                        ))}
                        {data.photos.pickup.length > 3 && (
                          <button 
                            onClick={() => setActiveTab("photos")}
                            className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-neutral-600"
                          >
                            +{data.photos.pickup.length - 3}
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-600 mb-2">Return Photos ({data.photos.return.length})</p>
                      <div className="grid grid-cols-3 gap-2">
                        {data.photos.return.slice(0, 3).map((photo, i) => (
                          <button 
                            key={i}
                            onClick={() => setSelectedPhoto({ type: 'return', index: i })}
                            className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                            <Camera className="w-5 h-5 text-gray-400" />
                          </button>
                        ))}
                        {data.photos.return.length > 3 && (
                          <button 
                            onClick={() => setActiveTab("photos")}
                            className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-neutral-600"
                          >
                            +{data.photos.return.length - 3}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checklist Summary */}
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <h3 className="font-semibold mb-4">Condition Checklist</h3>
                  <div className="space-y-2">
                    {Object.entries(data.checklist).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          value.status === 'good' ? 'bg-green-100 text-green-700' :
                          value.status === 'damaged' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {value.status === 'good' ? '✓ Good' : 
                           value.status === 'damaged' ? '✗ Issue' : '⚠ Attention'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full mt-3"
                    onClick={() => setActiveTab("checklist")}
                  >
                    View Full Checklist
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <h3 className="font-semibold mb-4">Notes</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">Renter Note</p>
                      <p className="text-sm text-blue-800 mt-1">{data.notes.renter}</p>
                    </div>
                    {data.notes.return && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium">Return Note</p>
                        <p className="text-sm text-neutral-600 mt-1">{data.notes.return}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Photos Tab */}
            {activeTab === "photos" && (
              <div className="space-y-6">
                {/* Pickup Photos */}
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <h3 className="font-semibold mb-4">Pickup Photos ({data.photos.pickup.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {data.photos.pickup.map((photo, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedPhoto({ type: 'pickup', index: i })}
                        className="aspect-square bg-gray-100 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-gray-200 transition-colors p-3"
                      >
                        <Camera className="w-8 h-8 text-gray-400" />
                        <span className="text-xs font-medium text-center">{photo.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Return Photos */}
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <h3 className="font-semibold mb-4">Return Photos ({data.photos.return.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {data.photos.return.map((photo, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedPhoto({ type: 'return', index: i })}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-2 transition-colors p-3 ${
                          photo.label === "Damage Detail" ? 'bg-red-50 hover:bg-red-100 border border-red-200' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <Camera className={`w-8 h-8 ${photo.label === "Damage Detail" ? 'text-red-400' : 'text-gray-400'}`} />
                        <span className={`text-xs font-medium text-center ${photo.label === "Damage Detail" ? 'text-red-700' : ''}`}>
                          {photo.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Checklist Tab */}
            {activeTab === "checklist" && (
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="font-semibold mb-4">Detailed Condition Checklist</h3>
                <div className="space-y-2">
                  {Object.entries(data.checklist).map(([key, value]) => (
                    <div key={key} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          value.status === 'good' ? 'bg-green-100 text-green-700' :
                          value.status === 'damaged' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {value.status === 'good' ? '✓ Good' : 
                           value.status === 'damaged' ? '✗ Issue' : '⚠ Attention'}
                        </span>
                      </div>
                      {value.note && (
                        <p className="text-sm text-neutral-600">{value.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === "timeline" && (
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="font-semibold mb-4">Rental Timeline</h3>
                <div className="space-y-0">
                  {data.timeline.map((event, i) => (
                    <div key={i} className="flex gap-4 pb-6 relative">
                      {i < data.timeline.length - 1 && (
                        <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200" />
                      )}
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <event.icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="font-medium">{event.event}</p>
                        <p className="text-sm text-neutral-500">{event.time} • by {event.by}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Decision Section */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="font-semibold mb-4">Your Decision</h3>
              
              {/* Decision Options */}
              <div className="grid md:grid-cols-3 gap-3 mb-6">
                <button
                  onClick={() => setDecision("approve")}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    decision === "approve" 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <CheckCircle className={`w-6 h-6 mb-2 ${decision === "approve" ? 'text-green-500' : 'text-gray-400'}`} />
                  <p className="font-medium">Approve & Release</p>
                  <p className="text-xs text-neutral-500 mt-1">Gear returned in expected condition. Full deposit refunded.</p>
                </button>

                <button
                  onClick={() => setDecision("deduct")}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    decision === "deduct" 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <DollarSign className={`w-6 h-6 mb-2 ${decision === "deduct" ? 'text-amber-500' : 'text-gray-400'}`} />
                  <p className="font-medium">Partial Deduct</p>
                  <p className="text-xs text-neutral-500 mt-1">Minor damage detected. Deduct repair cost from deposit.</p>
                </button>

                <button
                  onClick={() => setDecision("repair")}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    decision === "repair" 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <Wrench className={`w-6 h-6 mb-2 ${decision === "repair" ? 'text-red-500' : 'text-gray-400'}`} />
                  <p className="font-medium">Needs Repair</p>
                  <p className="text-xs text-neutral-500 mt-1">Significant damage. Full deposit held for repairs.</p>
                </button>
              </div>

              {/* Deduct Amount Input */}
              {decision === "deduct" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Deduct Amount (Max: $800)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={deductAmount}
                      onChange={(e) => setDeductAmount(e.target.value)}
                      placeholder="Enter amount to deduct"
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Notes Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Your Inspection Notes</label>
                <textarea
                  value={inspectionNote}
                  onChange={(e) => setInspectionNote(e.target.value)}
                  placeholder="Describe your findings and decision reasoning..."
                  className="w-full h-24 px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Submit Button */}
              <Button 
                className="w-full"
                disabled={!decision}
                onClick={() => {
                  if (decision === "approve") {
                    alert("Inspection approved! Deposit of $800 will be released to the renter.");
                  } else if (decision === "deduct") {
                    alert(`Deducted $${deductAmount || 0} from deposit. Remaining $${800 - (parseInt(deductAmount) || 0)} will be released to the renter.`);
                  } else if (decision === "repair") {
                    alert("Full deposit of $800 will be held for repairs. Admin will contact you shortly.");
                  }
                  router.push("/analytics/gear-owner");
                }}
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Submit Inspection Decision
              </Button>
            </div>
          </div>
        </div>

        {/* Photo Lightbox Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <div className="max-w-4xl w-full">
              <div className="bg-gray-800 rounded-2xl overflow-hidden">
                <div className="aspect-video bg-gray-700 flex items-center justify-center">
                  <Camera className="w-16 h-16 text-gray-500" />
                </div>
                <div className="p-4 bg-gray-800">
                  <p className="text-white font-medium">
                    {selectedPhoto.type === 'pickup' ? 'Pickup' : 'Return'}: {" "}
                    {selectedPhoto.type === 'pickup' 
                      ? data.photos.pickup[selectedPhoto.index]?.label 
                      : data.photos.return[selectedPhoto.index]?.label}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {selectedPhoto.type === 'pickup' 
                      ? data.photos.pickup[selectedPhoto.index]?.note 
                      : data.photos.return[selectedPhoto.index]?.note}
                  </p>
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {selectedPhoto.type === 'pickup' 
                  ? data.photos.pickup.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedPhoto({ type: 'pickup', index: i })}
                        className={`w-2 h-2 rounded-full ${i === selectedPhoto.index ? 'bg-white' : 'bg-white/30'}`}
                      />
                    ))
                  : data.photos.return.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedPhoto({ type: 'return', index: i })}
                        className={`w-2 h-2 rounded-full ${i === selectedPhoto.index ? 'bg-white' : 'bg-white/30'}`}
                      />
                    ))
                }
              </div>
            </div>
          </div>
        )}

        {/* Comparison Modal */}
        {showComparison && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <h3 className="font-bold">Photo Comparison</h3>
                <button 
                  onClick={() => setShowComparison(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                {data.comparisonIssues.map((issue, i) => (
                  <div key={i} className="mb-6">
                    <h4 className="font-semibold mb-3 capitalize">{issue.item}</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-neutral-500 mb-2">At Pickup</p>
                        <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                          <Camera className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm mt-2">{issue.pickup}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500 mb-2">At Return</p>
                        <div className="aspect-video bg-red-50 rounded-xl flex items-center justify-center border border-red-200">
                          <Camera className="w-8 h-8 text-red-400" />
                        </div>
                        <p className="text-sm mt-2 text-red-600">{issue.return}</p>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <span className="font-medium">AI Analysis:</span> {" "}
                        {issue.severity === "minor" 
                          ? "Minor cosmetic damage detected. Does not affect functionality."
                          : "Significant damage detected. May require repair or replacement."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
