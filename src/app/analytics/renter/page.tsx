"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Package, 
  Camera, 
  Star, 
  Clock, 
  MapPin, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Bell,
  AlertCircle,
  CheckCircle,
  Upload,
  X,
  Eye,
  FileText,
  Phone,
  Info,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RenterGuard } from "@/components/role-guard";
import { useAuth } from "@/contexts/auth-context";

const activeRentals = [
  { 
    id: "RNT-2847", 
    gear: "Canon R5", 
    gearImage: "📸",
    category: "Camera",
    owner: "Alex's Rentals", 
    ownerAvatar: "AR",
    pickupDate: "Apr 10", 
    returnDate: "Apr 15",
    pickupTime: "10:00 AM",
    returnTime: "6:00 PM",
    total: "$475", 
    status: "active",
    location: "Downtown Studio, 123 Main St",
    deposit: "$800",
    nextAction: "Return by Apr 15, 6:00 PM"
  },
  { 
    id: "RNT-2841", 
    gear: "Sony A7IV", 
    gearImage: "📷",
    category: "Camera",
    owner: "Sarah's Cameras", 
    ownerAvatar: "SC",
    pickupDate: "Apr 20", 
    returnDate: "Apr 22",
    pickupTime: "2:00 PM",
    returnTime: "12:00 PM",
    total: "$225", 
    status: "upcoming",
    location: "Westside Photo Hub, 456 Oak Ave",
    deposit: "$800",
    nextAction: "Pickup on Apr 20, 2:00 PM"
  },
];

// Enhanced calendar data with gear names
const calendarEvents = [
  { date: "Apr 5", gear: "Sony A7IV", type: "return", location: "Westside Photo Hub" },
  { date: "Apr 8", gear: "DJI RS 3 Pro", type: "pickup", location: "Downtown Studio" },
  { date: "Apr 10", gear: "Canon R5", type: "pickup", location: "Downtown Studio" },
  { date: "Apr 12", gear: "DJI RS 3 Pro", type: "return", location: "Downtown Studio" },
  { date: "Apr 15", gear: "Canon R5", type: "return", location: "Downtown Studio" },
  { date: "Apr 20", gear: "Sony A7IV", type: "pickup", location: "Westside Photo Hub" },
  { date: "Apr 22", gear: "Sony A7IV", type: "return", location: "Westside Photo Hub" },
];

const rentalHistory = [
  { id: "RNT-2835", gear: "Aputure 120D", gearImage: "💡", owner: "Pro Lighting Co", dates: "Mar 15-17", total: "$135", status: "completed", rating: 5 },
  { id: "RNT-2829", gear: "Rode VideoMic", gearImage: "🎤", owner: "Audio Masters", dates: "Mar 8-10", total: "$75", status: "completed", rating: 4 },
];

export default function RenterDashboardPage() {
  const [activeTab, setActiveTab] = useState("rentals");
  const [selectedRental, setSelectedRental] = useState<typeof activeRentals[0] | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPickupGuide, setShowPickupGuide] = useState(false);
  const [photoType, setPhotoType] = useState<'pickup' | 'return'>('pickup');
  const [selectedMonth, setSelectedMonth] = useState("April 2026");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { user, logout } = useAuth();

  // Get events for a specific date
  const getEventsForDate = (day: number) => {
    const dateStr = `Apr ${day}`;
    return calendarEvents.filter(e => e.date === dateStr);
  };

  return (
    <RenterGuard>
      <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/30 to-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <Package className="w-5 h-5" />
                <span className="font-medium">Renter Dashboard</span>
              </div>
              <h1 className="text-3xl font-bold text-neutral-900">My Rentals</h1>
              <p className="text-neutral-600">Manage your equipment rentals and returns</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* User Info Card */}
          {user && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {user.avatar}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Welcome back, {user.name}!</h2>
                  <p className="text-white/80">{user.email} • Renter Account</p>
                </div>
                <div className="ml-auto flex gap-3">
                  <div className="text-center px-4 py-2 bg-white/20 rounded-xl">
                    <p className="text-2xl font-bold">{activeRentals.length}</p>
                    <p className="text-sm text-white/80">Active</p>
                  </div>
                  <div className="text-center px-4 py-2 bg-white/20 rounded-xl">
                    <p className="text-2xl font-bold">{rentalHistory.length}</p>
                    <p className="text-sm text-white/80">Completed</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 p-1 bg-gray-100 rounded-xl">
            {[
              { id: "rentals", label: "My Rentals", icon: Package },
              { id: "calendar", label: "Pickup/Return Calendar", icon: Calendar },
              { id: "history", label: "Rental History", icon: Star },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* My Rentals Tab */}
          {activeTab === "rentals" && (
            <div className="space-y-6">
              {/* Active Rentals */}
              <div className="grid md:grid-cols-2 gap-6">
                {activeRentals.map((rental) => (
                  <motion.div
                    key={rental.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border shadow-sm overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-3xl">
                          {rental.gearImage}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg">{rental.gear}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              rental.status === 'active' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {rental.status === 'active' ? 'Active' : 'Upcoming'}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-500">{rental.id}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                              {rental.ownerAvatar}
                            </div>
                            <span className="text-sm text-neutral-600">{rental.owner}</span>
                          </div>
                          <p className="text-sm font-medium text-neutral-900 mt-2">{rental.total}</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Calendar className="w-4 h-4" />
                          <span>Pickup: {rental.pickupDate} at {rental.pickupTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Clock className="w-4 h-4" />
                          <span>Return: {rental.returnDate} at {rental.returnTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <MapPin className="w-4 h-4" />
                          <span>{rental.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Shield className="w-4 h-4" />
                          <span>Deposit: {rental.deposit}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setSelectedRental(rental)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Message Owner
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* How It Works */}
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">How Rental Works</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowPickupGuide(true)}
                  >
                    <Info className="w-4 h-4 mr-1" />
                    View Full Guide
                  </Button>
                </div>
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { step: 1, title: "Book & Pay", desc: "Secure your gear online", icon: Package },
                    { step: 2, title: "Pickup", desc: "Meet owner, inspect gear, upload photos", icon: Camera, highlight: true },
                    { step: 3, title: "Use", desc: "Create amazing content", icon: Star },
                    { step: 4, title: "Return", desc: "Upload return photos, get deposit back", icon: CheckCircle },
                  ].map((s) => (
                    <div 
                      key={s.step} 
                      className={`p-4 rounded-xl text-center ${s.highlight ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                        s.highlight ? 'bg-emerald-500 text-white' : 'bg-white text-neutral-600'
                      }`}>
                        <s.icon className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-neutral-400 mb-1">Step {s.step}</p>
                      <p className="font-medium text-sm">{s.title}</p>
                      <p className="text-xs text-neutral-500 mt-1">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Calendar Tab - ENHANCED WITH GEAR NAMES */}
          {activeTab === "calendar" && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">Rental Calendar</h3>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-medium">{selectedMonth}</span>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-neutral-500 py-2">{day}</div>
                  ))}
                  {Array(30).fill(0).map((_, i) => {
                    const day = i + 1;
                    const dayEvents = getEventsForDate(day);
                    const hasEvent = dayEvents.length > 0;
                    
                    return (
                      <div 
                        key={i} 
                        onClick={() => setSelectedDate(hasEvent ? `Apr ${day}` : null)}
                        className={`min-h-[100px] rounded-xl border p-2 cursor-pointer transition-colors ${
                          hasEvent ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300' : 'bg-white hover:border-emerald-200'
                        } ${selectedDate === `Apr ${day}` ? 'ring-2 ring-emerald-500' : ''}`}
                      >
                        <span className="text-sm font-medium">{day}</span>
                        {hasEvent && (
                          <div className="mt-1 space-y-1">
                            {dayEvents.slice(0, 2).map((event, idx) => (
                              <div key={idx} className="text-[10px] px-1.5 py-0.5 bg-white rounded border border-emerald-100 truncate">
                                <span className={event.type === 'return' ? 'text-amber-600' : 'text-emerald-600'}>
                                  {event.type === 'return' ? '↩ ' : '→ '}
                                </span>
                                {event.gear}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-[10px] text-emerald-600 text-center">
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-emerald-500" />
                    <span>Pickup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-amber-500" />
                    <span>Return</span>
                  </div>
                </div>
              </div>

              {/* Selected Date Details */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <h3 className="font-bold mb-4">
                    {selectedDate ? `Schedule for ${selectedDate}` : "Select a date"}
                  </h3>
                  {selectedDate ? (
                    <div className="space-y-3">
                      {getEventsForDate(parseInt(selectedDate.split(' ')[1])).map((event, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">
                              {event.type === 'pickup' ? '📦' : '↩️'}
                            </span>
                            <span className="font-medium">{event.gear}</span>
                          </div>
                          <p className="text-sm text-neutral-500">{event.location}</p>
                          <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs ${
                            event.type === 'return' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {event.type === 'return' ? 'Return' : 'Pickup'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-500 text-sm">Click on a date to see your rentals</p>
                  )}
                </div>

                {/* Upcoming Reminders */}
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <h3 className="font-bold mb-4">Upcoming</h3>
                  <div className="space-y-3">
                    {activeRentals.map((rental) => (
                      <div key={rental.id} className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{rental.gearImage}</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{rental.gear}</p>
                            <p className="text-xs text-neutral-500">{rental.nextAction}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="space-y-4">
              {rentalHistory.map((rental) => (
                <motion.div
                  key={rental.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border shadow-sm p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-2xl">
                      {rental.gearImage}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold">{rental.gear}</h4>
                      <p className="text-sm text-neutral-500">{rental.id} • Rented from {rental.owner}</p>
                      <p className="text-sm text-neutral-500">{rental.dates}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{rental.total}</p>
                      <div className="flex items-center gap-0.5 justify-end mt-1">
                        {Array(5).fill(0).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < rental.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Rental Detail Modal */}
        <AnimatePresence>
          {selectedRental && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                  <h3 className="font-bold text-lg">Rental Details</h3>
                  <button 
                    onClick={() => setSelectedRental(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Gear Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-3xl">
                      {selectedRental.gearImage}
                    </div>
                    <div>
                      <h4 className="font-bold text-xl">{selectedRental.gear}</h4>
                      <p className="text-neutral-500">{selectedRental.category}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${
                        selectedRental.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {selectedRental.status === 'active' ? 'Active Rental' : 'Upcoming'}
                      </span>
                    </div>
                  </div>

                  {/* Rental Info Grid */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-neutral-500 mb-1">Rental ID</p>
                      <p className="font-medium">{selectedRental.id}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-neutral-500 mb-1">Total Cost</p>
                      <p className="font-medium">{selectedRental.total}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-neutral-500 mb-1">Security Deposit</p>
                      <p className="font-medium">{selectedRental.deposit}</p>
                      <p className="text-xs text-neutral-400 mt-1">Refunded upon return</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-neutral-500 mb-1">Owner</p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {selectedRental.ownerAvatar}
                        </div>
                        <p className="font-medium">{selectedRental.owner}</p>
                      </div>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">Schedule</h4>
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Pickup</p>
                        <p className="text-sm text-neutral-500">{selectedRental.pickupDate} at {selectedRental.pickupTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Return</p>
                        <p className="text-sm text-neutral-500">{selectedRental.returnDate} at {selectedRental.returnTime}</p>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-neutral-400" />
                      <span className="font-medium">Pickup Location</span>
                    </div>
                    <p className="text-sm text-neutral-600">{selectedRental.location}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedRental(null);
                        setPhotoType('pickup');
                        setShowPhotoModal(true);
                      }}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Upload Photos
                    </Button>
                    <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message Owner
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Pickup Guide Modal */}
        <AnimatePresence>
          {showPickupGuide && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                  <h3 className="font-bold text-lg">Pickup & Return Guide</h3>
                  <button 
                    onClick={() => setShowPickupGuide(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-8">
                  {/* Pickup Section */}
                  <div>
                    <h4 className="font-bold text-emerald-600 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      At Pickup
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="font-medium mb-2">1. Inspect with Owner</p>
                        <p className="text-sm text-neutral-600">Check all equipment together with the owner. Look for any existing damage or wear.</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="font-medium mb-2">2. Test Functionality</p>
                        <p className="text-sm text-neutral-600">Turn on cameras, test buttons, check lenses, and verify all accessories are present.</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="font-medium mb-2">3. Take Photos (4-6 minimum)</p>
                        <ul className="text-sm text-neutral-600 space-y-1">
                          <li>• Front, back, and sides</li>
                          <li>• Close-up of any existing marks</li>
                          <li>• All accessories included</li>
                          <li>• Serial numbers if visible</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="font-medium mb-2">4. Confirm Together</p>
                        <p className="text-sm text-neutral-600">Both you and owner should be satisfied with the condition before leaving.</p>
                      </div>
                    </div>
                  </div>

                  {/* Return Section */}
                  <div>
                    <h4 className="font-bold text-amber-600 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      At Return
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="font-medium mb-2">1. Clean & Prepare</p>
                        <p className="text-sm text-neutral-600">Return gear in the same condition you received it. Clean lenses and wipe down equipment.</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="font-medium mb-2">2. Include All Accessories</p>
                        <p className="text-sm text-neutral-600">Make sure all batteries, chargers, cables, cases, and other items are returned.</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="font-medium mb-2">3. Take Return Photos (4-6)</p>
                        <ul className="text-sm text-neutral-600 space-y-1">
                          <li>• Same angles as pickup photos</li>
                          <li>• Show current condition</li>
                          <li>• Document all items being returned</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="font-medium mb-2">4. Wait for Confirmation</p>
                        <p className="text-sm text-neutral-600">Owner will confirm condition within 24 hours. Deposit released after confirmation.</p>
                      </div>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Pro Tips
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Use good lighting when taking condition photos</li>
                      <li>• Photos are time-stamped and stored for protection</li>
                      <li>• Any new damage should be discussed with owner immediately</li>
                      <li>• Keep gear in provided case when not in use</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Photo Upload Modal */}
        <AnimatePresence>
          {showPhotoModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl w-full max-w-xl"
              >
                <div className="p-6 border-b">
                  <h3 className="font-bold text-lg">
                    Upload {photoType === 'pickup' ? 'Pickup' : 'Return'} Photos
                  </h3>
                  <p className="text-sm text-neutral-500">
                    Take clear photos of the gear condition for your protection
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <button
                        key={i}
                        className="aspect-square bg-gray-100 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                      >
                        <Camera className="w-6 h-6 text-neutral-400" />
                        <span className="text-xs text-neutral-500">Photo {i}</span>
                      </button>
                    ))}
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">Photo Guidelines</p>
                      <ul className="text-xs text-amber-800 mt-1 space-y-1">
                        <li>• Take photos of all sides of the gear</li>
                        <li>• Include close-ups of any existing damage</li>
                        <li>• Show all accessories included</li>
                        <li>• Ensure good lighting for clarity</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowPhotoModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                    onClick={() => {
                      setShowPhotoModal(false);
                      alert(`${photoType === 'pickup' ? 'Pickup' : 'Return'} photos uploaded successfully!`);
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photos
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </RenterGuard>
  );
}
