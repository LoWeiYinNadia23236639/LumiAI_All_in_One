"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Camera,
  User,
  Package,
  DollarSign,
  Clock,
  Calendar,
  MapPin,
  FileText,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Download,
  Printer,
  MoreHorizontal,
  Lock,
  Unlock,
  Scale,
  Gavel,
  History,
  Eye,
  CheckCheck,
  AlertOctagon,
  BadgeCheck,
  X,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock admin inspection data
const adminInspectionData = {
  id: "ADM-INSP-2847",
  status: "pending_admin_review",
  priority: "high",
  submittedAt: "Apr 15, 2024 at 6:05 PM",
  
  // The return being inspected
  returnData: {
    rentalId: "RNT-2847",
    returnDate: "Apr 15, 2024",
    returnTime: "6:00 PM",
  },

  // Gear Info
  gear: {
    name: "Canon R5",
    category: "Camera",
    image: "📸",
    serialNumber: "CR5-88234-XF",
    owner: "Alex Thompson",
    condition: "excellent",
    dailyRate: 95,
    value: "$3,899",
  },

  // Owner Info
  owner: {
    name: "Alex Thompson",
    avatar: "AT",
    avatarColor: "from-orange-400 to-amber-500",
    email: "alex@lumiai.com",
    phone: "+1 (555) 987-6543",
    memberSince: "2023",
    totalRentals: 47,
    rating: 4.9,
    verified: true,
    decision: "pending", // pending, approve, deduct, repair
    notes: "Minor scratch on top plate near hot shoe. Renter admitted to it. Suggest $50 deduction for cosmetic damage.",
  },

  // Renter Info
  renter: {
    name: "Taylor Wilson",
    avatar: "TW",
    avatarColor: "from-violet-400 to-purple-500",
    email: "taylor@email.com",
    phone: "+1 (555) 123-4567",
    memberSince: "2024",
    totalRentals: 12,
    rating: 4.8,
    verified: true,
    dispute: false,
    notes: "The scratch happened when the camera brushed against a metal railing during an outdoor shoot. I immediately informed the owner and offered to pay for repairs.",
  },

  // Rental Details
  rental: {
    pickupDate: "Apr 10, 2024",
    returnDate: "Apr 15, 2024",
    duration: "5 days",
    totalPaid: "$475",
    depositHeld: "$800",
  },

  // AI Analysis
  aiAnalysis: {
    confidence: 94,
    issuesFound: 1,
    comparison: [
      {
        area: "Top Plate",
        pickup: "No visible scratches",
        return: "2cm scratch near hot shoe mount",
        severity: "minor",
        estimatedRepair: "$40-60",
        affectsFunctionality: false,
      }
    ],
    summary: "Minor cosmetic damage detected. Does not affect camera functionality. Repair cost estimated at $40-60.",
  },

  // Photos
  photos: {
    pickup: [
      { id: 1, label: "Front View", note: "Pristine condition", aiMatch: true },
      { id: 2, label: "Top Plate", note: "No scratches", aiMatch: true },
      { id: 3, label: "LCD Screen", note: "Screen protector on", aiMatch: true },
      { id: 4, label: "Bottom", note: "Clean", aiMatch: true },
      { id: 5, label: "Accessories", note: "All items present", aiMatch: true },
      { id: 6, label: "Serial Number", note: "Verified", aiMatch: true },
    ],
    return: [
      { id: 1, label: "Front View", note: "Good condition", aiMatch: true },
      { id: 2, label: "Top Plate", note: "SCRATCH DETECTED - see photo 7", aiMatch: false, flagged: true },
      { id: 3, label: "LCD Screen", note: "Good", aiMatch: true },
      { id: 4, label: "Bottom", note: "Good", aiMatch: true },
      { id: 5, label: "Accessories", note: "All items returned", aiMatch: true },
      { id: 6, label: "Serial Number", note: "Matches", aiMatch: true },
      { id: 7, label: "Damage Detail", note: "2cm scratch on top plate", aiMatch: false, flagged: true },
    ],
  },

  // Condition Checklist
  checklist: {
    body: { owner: "damaged", renter: "damaged", admin: "pending", note: "Scratch on top plate" },
    lcd: { owner: "good", renter: "good", admin: "pending", note: "Screen protector intact" },
    buttons: { owner: "good", renter: "good", admin: "pending", note: "All functional" },
    lensMount: { owner: "good", renter: "good", admin: "pending", note: "Clean" },
    sensor: { owner: "good", renter: "good", admin: "pending", note: "No dust visible" },
    battery: { owner: "good", renter: "good", admin: "pending", note: "Charged" },
    charger: { owner: "good", renter: "good", admin: "pending", note: "Original included" },
    strap: { owner: "good", renter: "good", admin: "pending", note: "Present" },
  },

  // Timeline
  timeline: [
    { time: "Apr 10, 10:00 AM", event: "Rental Pickup", actor: "Alex Thompson", type: "pickup" },
    { time: "Apr 10, 10:15 AM", event: "Pickup Photos Uploaded", actor: "Taylor Wilson", type: "photo" },
    { time: "Apr 15, 5:45 PM", event: "Return Initiated", actor: "Taylor Wilson", type: "return" },
    { time: "Apr 15, 6:00 PM", event: "Return Photos Uploaded", actor: "Taylor Wilson", type: "photo" },
    { time: "Apr 15, 6:05 PM", event: "Owner Notified for Inspection", actor: "System", type: "system" },
    { time: "Apr 15, 8:30 PM", event: "Owner Submitted Inspection", actor: "Alex Thompson", type: "inspection" },
    { time: "Apr 15, 8:35 PM", event: "Flagged for Admin Review", actor: "System", type: "system" },
  ],

  // Previous Disputes (if any)
  history: {
    ownerDisputes: 0,
    renterDisputes: 0,
    previousRentals: 1,
    previousBetween: "None",
  },

  // Suggested Actions
  suggestions: [
    { action: "partial_refund", label: "Partial Refund", amount: 750, reason: "Deduct $50 for cosmetic damage" },
    { action: "full_refund", label: "Full Refund", amount: 800, reason: "Damage is normal wear and tear" },
    { action: "hold_deposit", label: "Hold Deposit", amount: 0, reason: "Requires professional repair estimate" },
  ],
};

export default function AdminInspectionPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPhoto, setSelectedPhoto] = useState<{ type: 'pickup' | 'return', index: number } | null>(null);
  const [adminDecision, setAdminDecision] = useState<"approve" | "deduct" | "dispute" | null>(null);
  const [deductAmount, setDeductAmount] = useState("50");
  const [adminNotes, setAdminNotes] = useState("");
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  const handleReleaseDecision = () => {
    if (adminDecision === "approve") {
      alert("Decision: Release full deposit of $800 to renter. Both parties will be notified.");
    } else if (adminDecision === "deduct") {
      alert(`Decision: Deduct $${deductAmount} from deposit. Release $${800 - parseInt(deductAmount || "0")} to renter.`);
    } else if (adminDecision === "dispute") {
      alert("Decision: Escalate to dispute resolution. Both parties will be contacted for additional evidence.");
    }
    router.push("/admin");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-violet-50/30 to-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/admin")}
              className="p-2 hover:bg-gray-100 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-violet-600" />
                <span className="font-medium text-violet-600">Admin Inspection</span>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                  Action Required
                </span>
              </div>
              <h1 className="text-2xl font-bold text-neutral-900">{adminInspectionData.id}</h1>
              <p className="text-neutral-600">Rental #{adminInspectionData.returnData.rentalId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Print Report
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Alert Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Admin Review Required</p>
              <p className="text-sm text-amber-800 mt-1">
                Owner has flagged damage and requested a $50 deduction. Renter acknowledged the damage. 
                AI analysis confirms minor cosmetic damage. Please review and make a final decision.
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Parties Info */}
          <div className="space-y-4">
            {/* Gear Info */}
            <div className="bg-white rounded-2xl border shadow-sm p-4">
              <h3 className="font-semibold mb-3 text-sm">Gear Information</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-2xl">
                  {adminInspectionData.gear.image}
                </div>
                <div>
                  <p className="font-medium text-sm">{adminInspectionData.gear.name}</p>
                  <p className="text-xs text-neutral-500">S/N: {adminInspectionData.gear.serialNumber}</p>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Daily Rate</span>
                  <span>${adminInspectionData.gear.dailyRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Value</span>
                  <span>{adminInspectionData.gear.value}</span>
                </div>
              </div>
            </div>

            {/* Owner Info */}
            <div className="bg-white rounded-2xl border shadow-sm p-4">
              <h3 className="font-semibold mb-3 text-sm">Owner</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${adminInspectionData.owner.avatarColor} flex items-center justify-center text-white font-bold text-sm`}>
                  {adminInspectionData.owner.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="font-medium text-sm">{adminInspectionData.owner.name}</p>
                    {adminInspectionData.owner.verified && (
                      <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-neutral-500">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span>{adminInspectionData.owner.rating}</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-xs text-orange-800">
                  <span className="font-medium">Decision:</span> Request $50 deduction
                </p>
              </div>
            </div>

            {/* Renter Info */}
            <div className="bg-white rounded-2xl border shadow-sm p-4">
              <h3 className="font-semibold mb-3 text-sm">Renter</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${adminInspectionData.renter.avatarColor} flex items-center justify-center text-white font-bold text-sm`}>
                  {adminInspectionData.renter.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="font-medium text-sm">{adminInspectionData.renter.name}</p>
                    {adminInspectionData.renter.verified && (
                      <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-neutral-500">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span>{adminInspectionData.renter.rating}</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <span className="font-medium">Response:</span> Acknowledged damage
                </p>
              </div>
            </div>

            {/* Rental Summary */}
            <div className="bg-white rounded-2xl border shadow-sm p-4">
              <h3 className="font-semibold mb-3 text-sm">Rental Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Duration</span>
                  <span>{adminInspectionData.rental.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Total Paid</span>
                  <span>{adminInspectionData.rental.totalPaid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Deposit Held</span>
                  <span className="font-medium text-amber-600">{adminInspectionData.rental.depositHeld}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
              {[
                { id: "overview", label: "Overview", icon: Eye },
                { id: "ai", label: "AI Analysis", icon: BadgeCheck },
                { id: "photos", label: "Photos", icon: Camera },
                { id: "checklist", label: "Checklist", icon: CheckCircle },
                { id: "timeline", label: "Timeline", icon: History },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-white text-violet-600 shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* AI Analysis Summary Card */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* AI Verdict */}
                <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="w-6 h-6" />
                      <h3 className="font-bold">AI Analysis Complete</h3>
                    </div>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      {adminInspectionData.aiAnalysis.confidence}% Confidence
                    </span>
                  </div>
                  <p className="text-white/90 mb-4">
                    {adminInspectionData.aiAnalysis.summary}
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-2xl font-bold">{adminInspectionData.aiAnalysis.issuesFound}</p>
                      <p className="text-xs text-white/70">Issue Found</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-2xl font-bold">$40-60</p>
                      <p className="text-xs text-white/70">Est. Repair</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-2xl font-bold">✓</p>
                      <p className="text-xs text-white/70">Functional</p>
                    </div>
                  </div>
                </div>

                {/* Comparison Detail */}
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <h3 className="font-semibold mb-4">Damage Comparison</h3>
                  {adminInspectionData.aiAnalysis.comparison.map((item, i) => (
                    <div key={i} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-neutral-500 mb-2">At Pickup</p>
                          <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                            <Camera className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-sm mt-2 text-green-600">✓ {item.pickup}</p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500 mb-2">At Return</p>
                          <div className="aspect-video bg-red-50 rounded-xl flex items-center justify-center border-2 border-red-200">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                          </div>
                          <p className="text-sm mt-2 text-red-600">✗ {item.return}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <p className="text-xs text-neutral-500">Severity</p>
                          <p className="font-medium capitalize">{item.severity}</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-neutral-500">Est. Repair Cost</p>
                          <p className="font-medium">{item.estimatedRepair}</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-neutral-500">Affects Function</p>
                          <p className="font-medium">{item.affectsFunctionality ? "Yes" : "No"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Party Statements */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-orange-50 rounded-2xl border border-orange-100 p-6">
                    <h4 className="font-semibold text-orange-900 mb-2">Owner Statement</h4>
                    <p className="text-sm text-orange-800">{adminInspectionData.owner.notes}</p>
                    <p className="text-xs text-orange-600 mt-2">
                      Submitted Apr 15, 8:30 PM
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
                    <h4 className="font-semibold text-blue-900 mb-2">Renter Statement</h4>
                    <p className="text-sm text-blue-800">{adminInspectionData.renter.notes}</p>
                    <p className="text-xs text-blue-600 mt-2">
                      Acknowledged during return
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Analysis Tab */}
            {activeTab === "ai" && (
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="font-semibold mb-4">Detailed AI Analysis</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-violet-50 rounded-xl">
                    <h4 className="font-medium text-violet-900 mb-2">Image Comparison Algorithm</h4>
                    <ul className="text-sm text-violet-800 space-y-1">
                      <li>• Compared 12 feature points across 7 photos</li>
                      <li>• Detected surface texture change on top plate</li>
                      <li>• Scratch depth estimated at 0.3mm (cosmetic only)</li>
                      <li>• No internal component damage detected</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-medium mb-2">Market Value Impact</h4>
                    <p className="text-sm text-neutral-600">
                      Cosmetic scratches on top plate typically reduce resale value by 1-2%. 
                      For this camera model, estimated depreciation is $40-80.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl">
                    <h4 className="font-medium text-green-900 mb-2">Recommendation</h4>
                    <p className="text-sm text-green-800">
                      This appears to be minor cosmetic damage that does not affect functionality. 
                      A deduction of $50 is reasonable and within market standards for similar damage.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Photos Tab */}
            {activeTab === "photos" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <h3 className="font-semibold mb-4">Pickup Photos</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {adminInspectionData.photos.pickup.map((photo, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedPhoto({ type: 'pickup', index: i })}
                        className="aspect-square bg-gray-100 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-gray-200 transition-colors p-2"
                      >
                        <Camera className="w-6 h-6 text-gray-400" />
                        <span className="text-xs text-center">{photo.label}</span>
                        {photo.aiMatch && (
                          <span className="text-[10px] text-green-600">✓ Verified</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <h3 className="font-semibold mb-4">Return Photos</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {adminInspectionData.photos.return.map((photo, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedPhoto({ type: 'return', index: i })}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-colors p-2 ${
                          photo.flagged 
                            ? 'bg-red-50 hover:bg-red-100 border-2 border-red-200' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <Camera className={`w-6 h-6 ${photo.flagged ? 'text-red-400' : 'text-gray-400'}`} />
                        <span className={`text-xs text-center ${photo.flagged ? 'text-red-700' : ''}`}>{photo.label}</span>
                        {photo.flagged && (
                          <span className="text-[10px] text-red-600">⚠ Flagged</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Checklist Tab */}
            {activeTab === "checklist" && (
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="font-semibold mb-4">Condition Checklist</h3>
                <div className="space-y-2">
                  {Object.entries(adminInspectionData.checklist).map(([key, value]) => (
                    <div key={key} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            value.owner === 'good' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            Owner: {value.owner}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            value.renter === 'good' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            Renter: {value.renter}
                          </span>
                        </div>
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
                <h3 className="font-semibold mb-4">Inspection Timeline</h3>
                <div className="space-y-0">
                  {adminInspectionData.timeline.map((event, i) => (
                    <div key={i} className="flex gap-4 pb-6 relative">
                      {i < adminInspectionData.timeline.length - 1 && (
                        <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200" />
                      )}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        event.type === 'system' ? 'bg-gray-100' : 
                        event.type === 'inspection' ? 'bg-violet-100' : 'bg-gray-100'
                      }`}>
                        <Clock className={`w-5 h-5 ${
                          event.type === 'system' ? 'text-gray-600' : 
                          event.type === 'inspection' ? 'text-violet-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="font-medium">{event.event}</p>
                        <p className="text-sm text-neutral-500">{event.time} • {event.actor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Admin Actions */}
          <div className="space-y-4">
            {/* Decision Card */}
            <div className="bg-white rounded-2xl border shadow-sm p-6 sticky top-24">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Gavel className="w-5 h-5" />
                Admin Decision
              </h3>

              {/* AI Recommendation */}
              <div className="p-3 bg-violet-50 rounded-xl mb-4">
                <p className="text-xs text-violet-600 font-medium mb-1">AI Recommendation</p>
                <p className="text-sm text-violet-900">Approve with $50 deduction from deposit</p>
              </div>

              {/* Suggested Actions */}
              <div className="space-y-2 mb-4">
                {adminInspectionData.suggestions.map((suggestion) => (
                  <button
                    key={suggestion.action}
                    onClick={() => {
                      if (suggestion.action === "partial_refund") {
                        setAdminDecision("deduct");
                        setDeductAmount("50");
                      } else if (suggestion.action === "full_refund") {
                        setAdminDecision("approve");
                      } else if (suggestion.action === "hold_deposit") {
                        setAdminDecision("dispute");
                      }
                    }}
                    className={`w-full p-3 rounded-xl text-left border-2 transition-all ${
                      (suggestion.action === "partial_refund" && adminDecision === "deduct") ||
                      (suggestion.action === "full_refund" && adminDecision === "approve") ||
                      (suggestion.action === "hold_deposit" && adminDecision === "dispute")
                        ? 'border-violet-500 bg-violet-50' 
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm">{suggestion.label}</span>
                      <span className="text-sm font-bold">${suggestion.amount}</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">{suggestion.reason}</p>
                  </button>
                ))}
              </div>

              {/* Custom Deduction */}
              {adminDecision === "deduct" && (
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">Deduct Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={deductAmount}
                      onChange={(e) => setDeductAmount(e.target.value)}
                      max="800"
                      className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Release ${800 - (parseInt(deductAmount) || 0)} to renter
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add your reasoning for this decision..."
                  className="w-full h-24 px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Release Decision Button */}
              <Button 
                className="w-full bg-violet-500 hover:bg-violet-600 mb-2"
                disabled={!adminDecision}
                onClick={handleReleaseDecision}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Release Decision
              </Button>

              {/* Override Options */}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowOverrideModal(true)}
              >
                <Scale className="w-4 h-4 mr-2" />
                Override Options
              </Button>

              {/* Warning */}
              <div className="mt-4 p-3 bg-amber-50 rounded-xl">
                <p className="text-xs text-amber-800">
                  <span className="font-medium">Important:</span> This decision is final and will be binding for both parties.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Lightbox */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg"
            >
              <X className="w-6 h-6" />
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
                      ? adminInspectionData.photos.pickup[selectedPhoto.index]?.label
                      : adminInspectionData.photos.return[selectedPhoto.index]?.label}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Override Modal */}
        {showOverrideModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl w-full max-w-md p-6"
            >
              <h3 className="font-bold text-lg mb-4">Admin Override Options</h3>
              <div className="space-y-3 mb-6">
                <button className="w-full p-4 bg-gray-50 rounded-xl text-left hover:bg-gray-100">
                  <p className="font-medium">Request More Evidence</p>
                  <p className="text-sm text-neutral-500">Ask both parties to submit additional photos</p>
                </button>
                <button className="w-full p-4 bg-gray-50 rounded-xl text-left hover:bg-gray-100">
                  <p className="font-medium">Schedule Video Call</p>
                  <p className="text-sm text-neutral-500">Mediate live inspection with both parties</p>
                </button>
                <button className="w-full p-4 bg-gray-50 rounded-xl text-left hover:bg-gray-100">
                  <p className="font-medium">Professional Assessment</p>
                  <p className="text-sm text-neutral-500">Request repair shop evaluation</p>
                </button>
                <button className="w-full p-4 bg-red-50 rounded-xl text-left hover:bg-red-100 text-red-600">
                  <p className="font-medium">Flag for Investigation</p>
                  <p className="text-sm text-red-500">Potential fraud or policy violation</p>
                </button>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowOverrideModal(false)}
              >
                Cancel
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}
