"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Calendar, 
  MessageSquare, 
  DollarSign, 
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Camera,
  ArrowRight,
  LogOut,
  Settings,
  Bell,
  TrendingUp,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Eye,
  CheckCheck,
  Wrench,
  MapPin,
  BarChart3,
  FileText,
  Banknote,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GearOwnerGuard } from "@/components/role-guard";
import { useAuth } from "@/contexts/auth-context";

const gearItems = [
  { id: "1", name: "Sony A7IV", category: "Camera", dailyRate: 75, image: "📷", status: "available" },
  { id: "2", name: "Canon R5", category: "Camera", dailyRate: 95, image: "📸", status: "rented" },
  { id: "3", name: "DJI RS 3 Pro", category: "Gimbal", dailyRate: 55, image: "🎯", status: "available" },
  { id: "4", name: "Aputure 120D", category: "Lighting", dailyRate: 45, image: "💡", status: "maintenance" },
  { id: "5", name: "Rode VideoMic Pro+", category: "Audio", dailyRate: 25, image: "🎤", status: "available" },
];

const rentalRequests = [
  { 
    id: "req-1", 
    renter: "Jordan Smith", 
    gear: "Sony A7IV", 
    dates: "Apr 10-12", 
    total: "$225", 
    status: "pending",
    message: "Hi! I need this camera for a weekend shoot. Can I pick it up on Friday evening?"
  },
  { 
    id: "req-2", 
    renter: "Taylor Wilson", 
    gear: "Canon R5", 
    dates: "Apr 15-18", 
    total: "$380", 
    status: "approved",
    message: "Professional photographer looking for high-res camera for client work."
  },
  { 
    id: "req-3", 
    renter: "Casey Brown", 
    gear: "DJI RS 3 Pro", 
    dates: "Apr 20-22", 
    total: "$165", 
    status: "pending",
    message: "Student filmmaker working on thesis project."
  },
];

const inboxMessages = [
  { id: "msg-1", from: "Jordan Smith", subject: "Question about Sony A7IV", preview: "Does it come with any lenses?", time: "2 hours ago", unread: true },
  { id: "msg-2", from: "Taylor Wilson", subject: "Pickup time confirmation", preview: "Can I pick up at 6pm instead?", time: "5 hours ago", unread: false },
  { id: "msg-3", from: "Admin", subject: "Return condition check needed", preview: "Please confirm condition of Canon R5", time: "1 day ago", unread: true },
];

const conditionChecks = [
  { 
    id: "check-1", 
    rental: "RNT-2847", 
    gear: "Canon R5", 
    gearImage: "📸",
    renter: "Taylor Wilson", 
    renterAvatar: "TW",
    returnDate: "Today", 
    deposit: "$800",
    status: "awaiting_confirmation",
    pickupPhotos: 4,
    returnPhotos: 4,
    notes: "Renter mentioned minor scratch on LCD screen during rental period."
  },
  { 
    id: "check-2", 
    rental: "RNT-2839", 
    gear: "Sony A7IV", 
    gearImage: "📷",
    renter: "Jordan Smith", 
    renterAvatar: "JS",
    returnDate: "Yesterday", 
    deposit: "$800",
    status: "confirmed_good",
    pickupPhotos: 4,
    returnPhotos: 4,
    notes: "Gear returned in excellent condition. Deposit released."
  },
];

// Enhanced calendar data with gear names
const calendarBookings = [
  { date: "Apr 5", gear: "Sony A7IV", renter: "Alex M.", type: "booking" },
  { date: "Apr 5", gear: "Canon R5", renter: "Sam K.", type: "booking" },
  { date: "Apr 6", gear: "DJI RS 3 Pro", renter: "Chris L.", type: "booking" },
  { date: "Apr 8", gear: "Sony A7IV", renter: "Jordan S.", type: "return" },
  { date: "Apr 9", gear: "Canon R5", renter: "Taylor W.", type: "booking" },
  { date: "Apr 9", gear: "Aputure 120D", renter: "Casey B.", type: "booking" },
  { date: "Apr 10", gear: "Sony A7IV", renter: "Jordan S.", type: "booking" },
  { date: "Apr 11", gear: "DJI RS 3 Pro", renter: "Morgan R.", type: "booking" },
  { date: "Apr 12", gear: "Sony A7IV", renter: "Jordan S.", type: "return" },
  { date: "Apr 15", gear: "Canon R5", renter: "Taylor W.", type: "booking" },
];

export default function GearOwnerAnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState("April 2026");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showInspectionModal, setShowInspectionModal] = useState<typeof conditionChecks[0] | null>(null);
  const router = useRouter();
  const { user, logout } = useAuth();

  // Get bookings for a specific date
  const getBookingsForDate = (day: number) => {
    const dateStr = `Apr ${day}`;
    return calendarBookings.filter(b => b.date === dateStr);
  };

  return (
    <GearOwnerGuard>
      <main className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <Camera className="w-5 h-5" />
                <span className="font-medium">Gear Owner Dashboard</span>
              </div>
              <h1 className="text-3xl font-bold text-neutral-900">Manage Your Rentals</h1>
              <p className="text-neutral-600">Track bookings, manage calendar, and monitor earnings</p>
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
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold`}>
                  {user.avatar}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Welcome back, {user.name}!</h2>
                  <p className="text-white/80">{user.email} • Gear Owner Account</p>
                </div>
                <div className="ml-auto flex gap-3">
                  <div className="text-center px-4 py-2 bg-white/20 rounded-xl">
                    <p className="text-2xl font-bold">{gearItems.length}</p>
                    <p className="text-sm text-white/80">Gear Items</p>
                  </div>
                  <div className="text-center px-4 py-2 bg-white/20 rounded-xl">
                    <p className="text-2xl font-bold">$2,450</p>
                    <p className="text-sm text-white/80">This Month</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 p-1 bg-gray-100 rounded-xl">
            {[
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "calendar", label: "Calendar & Availability", icon: Calendar },
              { id: "inbox", label: "Inbox", icon: MessageSquare, badge: 2 },
              { id: "requests", label: "Rental Requests", icon: Package, badge: 2 },
              { id: "earnings", label: "Earnings", icon: DollarSign },
              { id: "conditions", label: "Condition Checks", icon: CheckCheck, badge: 1 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge && (
                  <span className="px-1.5 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Bookings", value: "24", change: "+12%", icon: Calendar, color: "blue" },
                  { label: "Active Rentals", value: "3", change: "2 pending", icon: Package, color: "green" },
                  { label: "Messages", value: "5", change: "2 unread", icon: MessageSquare, color: "purple" },
                  { label: "This Month", value: "$2,450", change: "+23%", icon: DollarSign, color: "orange" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl p-5 border shadow-sm"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center mb-3`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                    <p className="text-xs text-neutral-500">{stat.label}</p>
                    <p className={`text-xs mt-1 ${stat.change.includes('+') ? 'text-green-600' : 'text-neutral-500'}`}>
                      {stat.change}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Package className="w-4 h-4 mr-2" />
                    Add New Gear
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Update Availability
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <DollarSign className="w-4 h-4 mr-2" />
                    View Earnings Report
                  </Button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="lg:col-span-3 bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="font-bold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    { action: "New rental request", item: "Sony A7IV", user: "Jordan Smith", time: "2 hours ago", type: "request" },
                    { action: "Gear returned", item: "Canon R5", user: "Taylor Wilson", time: "5 hours ago", type: "return" },
                    { action: "Payment received", item: "DJI RS 3 Pro", amount: "$165", time: "1 day ago", type: "payment" },
                    { action: "New message", from: "Casey Brown", preview: "Is the A7IV available next week?", time: "1 day ago", type: "message" },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        activity.type === 'request' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'return' ? 'bg-green-100 text-green-600' :
                        activity.type === 'payment' ? 'bg-orange-100 text-orange-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {activity.type === 'request' ? <Package className="w-5 h-5" /> :
                         activity.type === 'return' ? <CheckCircle className="w-5 h-5" /> :
                         activity.type === 'payment' ? <DollarSign className="w-5 h-5" /> :
                         <MessageSquare className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-neutral-500">
                          {activity.item || activity.from} • {activity.user || activity.preview || activity.amount}
                        </p>
                      </div>
                      <span className="text-xs text-neutral-400">{activity.time}</span>
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
                  <h3 className="font-bold text-lg">Gear Availability Calendar</h3>
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
                    const dayBookings = getBookingsForDate(day);
                    const hasBooking = dayBookings.length > 0;
                    
                    return (
                      <div 
                        key={i} 
                        onClick={() => setSelectedDate(hasBooking ? `Apr ${day}` : null)}
                        className={`min-h-[100px] rounded-xl border p-2 cursor-pointer transition-colors ${
                          hasBooking ? 'bg-orange-50 border-orange-200 hover:border-orange-300' : 'bg-white hover:border-orange-200'
                        } ${selectedDate === `Apr ${day}` ? 'ring-2 ring-orange-500' : ''}`}
                      >
                        <span className="text-sm font-medium">{day}</span>
                        {hasBooking && (
                          <div className="mt-1 space-y-1">
                            {dayBookings.slice(0, 2).map((booking, idx) => (
                              <div key={idx} className="text-[10px] px-1.5 py-0.5 bg-white rounded border border-orange-100 truncate">
                                <span className={booking.type === 'return' ? 'text-amber-600' : 'text-orange-600'}>
                                  {booking.type === 'return' ? '↩ ' : '→ '}
                                </span>
                                {booking.gear}
                              </div>
                            ))}
                            {dayBookings.length > 2 && (
                              <div className="text-[10px] text-orange-600 text-center">
                                +{dayBookings.length - 2} more
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
                    <div className="w-3 h-3 rounded bg-orange-500" />
                    <span>Pickup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-amber-500" />
                    <span>Return</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    <span>Available</span>
                  </div>
                </div>
              </div>

              {/* Selected Date Details */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <h3 className="font-bold mb-4">
                    {selectedDate ? `Bookings for ${selectedDate}` : "Select a date"}
                  </h3>
                  {selectedDate ? (
                    <div className="space-y-3">
                      {getBookingsForDate(parseInt(selectedDate.split(' ')[1])).map((booking, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">
                              {gearItems.find(g => g.name === booking.gear)?.image || "📷"}
                            </span>
                            <span className="font-medium">{booking.gear}</span>
                          </div>
                          <p className="text-sm text-neutral-500">
                            {booking.type === 'return' ? 'Returning from' : 'Rented by'}: {booking.renter}
                          </p>
                          <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs ${
                            booking.type === 'return' ? 'bg-amber-100 text-amber-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {booking.type === 'return' ? 'Return' : 'Pickup'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-500 text-sm">Click on a date to see bookings</p>
                  )}
                </div>

                {/* Gear List */}
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <h3 className="font-bold mb-4">Your Gear</h3>
                  <div className="space-y-3">
                    {gearItems.map((gear) => (
                      <div key={gear.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <span className="text-2xl">{gear.image}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{gear.name}</p>
                          <p className="text-xs text-neutral-500">${gear.dailyRate}/day</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          gear.status === 'available' ? 'bg-green-100 text-green-700' :
                          gear.status === 'rented' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {gear.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inbox Tab */}
          {activeTab === "inbox" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Messages</h3>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input 
                      type="text"
                      placeholder="Search messages..."
                      className="pl-9 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-1" />
                    Filter
                  </Button>
                </div>
              </div>

              {inboxMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Link href={`/messages/${msg.id}`}>
                    <div className={`bg-white rounded-2xl border shadow-sm p-5 hover:border-orange-300 transition-colors cursor-pointer ${msg.unread ? 'border-orange-200 bg-orange-50/30' : ''}`}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {msg.from.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{msg.from}</h4>
                            {msg.unread && (
                              <span className="w-2 h-2 bg-orange-500 rounded-full" />
                            )}
                          </div>
                          <p className={`text-sm mb-1 ${msg.unread ? 'font-medium text-neutral-900' : 'text-neutral-700'}`}>
                            {msg.subject}
                          </p>
                          <p className="text-sm text-neutral-500 truncate">{msg.preview}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                            <Clock className="w-3 h-3" />
                            <span>{msg.time}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-neutral-300" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}

              {/* Quick Contact Cards */}
              <div className="mt-8">
                <h4 className="font-semibold mb-4">Recent Contacts</h4>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { name: "Jordan Smith", status: "New inquiry", avatar: "JS" },
                    { name: "Taylor Wilson", status: "Active rental", avatar: "TW" },
                    { name: "Casey Brown", status: "Return pending", avatar: "CB" },
                  ].map((contact, i) => (
                    <Link key={i} href={`/messages/conv-${i + 1}`}>
                      <div className="bg-white rounded-xl border p-4 hover:border-orange-300 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                            {contact.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{contact.name}</p>
                            <p className="text-xs text-neutral-500">{contact.status}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Rental Requests Tab */}
          {activeTab === "requests" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Rental Requests</h3>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input 
                      type="text"
                      placeholder="Search requests..."
                      className="pl-9 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-1" />
                    Filter
                  </Button>
                </div>
              </div>

              {rentalRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border shadow-sm overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl">
                          {gearItems.find(g => g.name === request.gear)?.image || "📷"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold">{request.gear}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              request.status === 'pending' 
                                ? 'bg-amber-100 text-amber-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {request.status === 'pending' ? 'Pending' : 'Approved'}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-500">Request #{request.id}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                              {request.renter.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-sm text-neutral-600">{request.renter}</span>
                          </div>
                          <p className="text-sm text-neutral-500 mt-1">{request.dates} • {request.total}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:items-end">
                        <p className="text-sm text-neutral-500 max-w-xs text-right hidden md:block">
                          "{request.message}"
                        </p>
                        <div className="flex gap-2">
                          <Link href={`/messages/${request.id}`}>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Message
                            </Button>
                          </Link>
                          <Link href={`/rental-requests/${request.id}`}>
                            <Button size="sm">
                              Review Request
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions for Pending */}
                    {request.status === 'pending' && (
                      <div className="mt-4 pt-4 border-t flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => alert(`Approved ${request.renter}'s request for ${request.gear}`)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Quick Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => alert(`Declined ${request.renter}'s request`)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                        <Link href={`/rental-requests/${request.id}`} className="ml-auto">
                          <Button variant="ghost" size="sm">
                            View Full Details
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Request Stats */}
              <div className="grid sm:grid-cols-3 gap-4 mt-8">
                <div className="bg-white rounded-xl border p-4 text-center">
                  <p className="text-2xl font-bold text-amber-600">2</p>
                  <p className="text-sm text-neutral-500">Pending Requests</p>
                </div>
                <div className="bg-white rounded-xl border p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">12</p>
                  <p className="text-sm text-neutral-500">Approved This Month</p>
                </div>
                <div className="bg-white rounded-xl border p-4 text-center">
                  <p className="text-2xl font-bold text-neutral-600">3</p>
                  <p className="text-sm text-neutral-500">Declined This Month</p>
                </div>
              </div>
            </div>
          )}

          {/* Earnings Tab */}
          {activeTab === "earnings" && (
            <div className="space-y-6">
              {/* Earnings Summary Cards */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <p className="text-3xl font-bold">$3,750</p>
                  <p className="text-sm text-white/80">Available Balance</p>
                  <Button 
                    size="sm" 
                    className="mt-3 bg-white text-orange-600 hover:bg-white/90"
                    onClick={() => router.push("/earnings")}
                  >
                    Withdraw
                  </Button>
                </div>
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold">$2,450</p>
                  <p className="text-sm text-neutral-500">This Month</p>
                  <p className="text-xs text-green-600 mt-1">+15.6% vs last month</p>
                </div>
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold">$1,280</p>
                  <p className="text-sm text-neutral-500">Pending Payout</p>
                  <p className="text-xs text-neutral-400 mt-1">Processing</p>
                </div>
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold">156</p>
                  <p className="text-sm text-neutral-500">Total Bookings</p>
                  <p className="text-xs text-neutral-400 mt-1">Lifetime</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <Link href="/earnings">
                  <Button>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Full Analytics
                  </Button>
                </Link>
                <Link href="/earnings?tab=transactions">
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Transaction History
                  </Button>
                </Link>
                <Link href="/earnings?tab=payouts">
                  <Button variant="outline">
                    <Banknote className="w-4 h-4 mr-2" />
                    Manage Payouts
                  </Button>
                </Link>
                <Link href="/earnings?tab=tax">
                  <Button variant="outline">
                    <Shield className="w-4 h-4 mr-2" />
                    Tax Center
                  </Button>
                </Link>
              </div>

              {/* Recent Earnings Preview */}
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Recent Earnings</h3>
                  <Link href="/earnings">
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
                <div className="divide-y">
                  {[
                    { id: "TXN-2847", gear: "Canon R5", renter: "Taylor Wilson", amount: 427.50, date: "Apr 15", status: "completed" },
                    { id: "TXN-2841", gear: "Sony A7IV", renter: "Jordan Smith", amount: 202.50, date: "Apr 12", status: "completed" },
                    { id: "TXN-2839", gear: "DJI RS 3 Pro", renter: "Casey Brown", amount: 148.50, date: "Apr 10", status: "pending" },
                    { id: "TXN-2835", gear: "Aputure 120D", renter: "Alex Kim", amount: 121.50, date: "Apr 8", status: "completed" },
                  ].map((txn) => (
                    <div key={txn.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{txn.gear} rental</p>
                          <p className="text-xs text-neutral-500">{txn.renter} • {txn.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+${txn.amount.toFixed(2)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          txn.status === "completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {txn.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Performance */}
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="font-bold mb-4">Monthly Performance</h3>
                <div className="h-48 flex items-end gap-4">
                  {[
                    { month: "Jan", earnings: 1850 },
                    { month: "Feb", earnings: 2120 },
                    { month: "Mar", earnings: 2890 },
                    { month: "Apr", earnings: 2450 },
                    { month: "May", earnings: 1980 },
                    { month: "Jun", earnings: 2340 },
                  ].map((m, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full relative">
                        <div 
                          className="bg-orange-500 rounded-t-lg"
                          style={{ height: `${(m.earnings / 3000) * 150}px` }}
                        />
                      </div>
                      <span className="text-xs text-neutral-500">{m.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gear Performance */}
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="font-bold mb-4">Top Performing Gear</h3>
                <div className="space-y-3">
                  {[
                    { gear: "Canon R5", earnings: 3610, rentals: 38, image: "📸" },
                    { gear: "Sony A7IV", earnings: 3375, rentals: 45, image: "📷" },
                    { gear: "DJI RS 3 Pro", earnings: 1540, rentals: 28, image: "🎯" },
                  ].map((gear, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-2xl">{gear.image}</span>
                      <div className="flex-1">
                        <p className="font-medium">{gear.gear}</p>
                        <p className="text-xs text-neutral-500">{gear.rentals} rentals</p>
                      </div>
                      <span className="font-bold">${gear.earnings}</span>
                    </div>
                  ))}
                </div>
                <Link href="/earnings?tab=analytics">
                  <Button variant="outline" className="w-full mt-4">
                    View Full Analytics
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Condition Checks Tab - ENHANCED */}
          {activeTab === "conditions" && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <p className="text-sm text-amber-800">
                  <span className="font-medium">Action Required:</span> Please confirm gear conditions for admin to release deposits.
                </p>
              </div>

              {conditionChecks.map((check) => (
                <motion.div
                  key={check.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border shadow-sm overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-3xl">
                          {check.gearImage}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-lg">{check.gear}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              check.status === 'awaiting_confirmation' 
                                ? 'bg-amber-100 text-amber-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {check.status === 'awaiting_confirmation' ? 'Awaiting Confirmation' : 'Confirmed Good'}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-500">Rental #{check.rental}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                              {check.renterAvatar}
                            </div>
                            <span className="text-sm text-neutral-600">Rented by: {check.renter}</span>
                          </div>
                          <p className="text-sm text-neutral-500 mt-1">Return date: {check.returnDate}</p>
                          <p className="text-sm font-medium text-neutral-900 mt-1">Deposit held: {check.deposit}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {check.status === 'awaiting_confirmation' && (
                          <>
                            <Link href={`/inspection/${check.id.toLowerCase().replace('check-', 'insp-')}`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Inspect & Review
                              </Button>
                            </Link>
                            <span className="text-xs text-amber-600 text-center">
                              Action needed
                            </span>
                          </>
                        )}
                        {check.status === 'confirmed_good' && (
                          <span className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium text-center">
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            Deposit Released
                          </span>
                        )}
                      </div>
                    </div>

                    {check.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                        <p className="text-sm text-neutral-600">
                          <span className="font-medium">Notes:</span> {check.notes}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex gap-4 text-sm text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Camera className="w-4 h-4" />
                        {check.pickupPhotos} pickup photos
                      </span>
                      <span className="flex items-center gap-1">
                        <Camera className="w-4 h-4" />
                        {check.returnPhotos} return photos
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Inspection Modal */}
        {showInspectionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Equipment Return Inspection</h3>
                  <p className="text-sm text-neutral-500">Rental #{showInspectionModal.rental}</p>
                </div>
                <button 
                  onClick={() => setShowInspectionModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Gear & Renter Info */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-3xl">
                    {showInspectionModal.gearImage}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold">{showInspectionModal.gear}</h4>
                    <p className="text-sm text-neutral-500">Rented by {showInspectionModal.renter}</p>
                    <p className="text-sm text-neutral-500">Returned: {showInspectionModal.returnDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-500">Deposit</p>
                    <p className="text-xl font-bold">{showInspectionModal.deposit}</p>
                  </div>
                </div>

                {/* Photo Comparison */}
                <div>
                  <h4 className="font-semibold mb-3">Condition Photos Comparison</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Pickup Photos */}
                    <div>
                      <p className="text-sm font-medium text-neutral-600 mb-2">At Pickup ({showInspectionModal.pickupPhotos} photos)</p>
                      <div className="grid grid-cols-2 gap-2">
                          {Array(showInspectionModal.pickupPhotos).fill(0).map((_, i) => (
                          <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                            <Camera className="w-6 h-6 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Return Photos */}
                    <div>
                      <p className="text-sm font-medium text-neutral-600 mb-2">At Return ({showInspectionModal.returnPhotos} photos)</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Array(showInspectionModal.returnPhotos).fill(0).map((_, i) => (
                          <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                            <Camera className="w-6 h-6 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Condition Checklist */}
                <div>
                  <h4 className="font-semibold mb-3">Condition Checklist</h4>
                  <div className="space-y-2">
                    {[
                      { item: "Body condition", status: "good" },
                      { item: "Lens/Sensor clean", status: "good" },
                      { item: "All accessories present", status: "good" },
                      { item: "LCD screen", status: "attention" },
                      { item: "Battery & charger", status: "good" },
                    ].map((check, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm">{check.item}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          check.status === 'good' ? 'bg-green-100 text-green-700' :
                          check.status === 'attention' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {check.status === 'good' ? '✓ Good' :
                           check.status === 'attention' ? '⚠ Attention' :
                           '✗ Issue'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {showInspectionModal.notes && (
                  <div className="p-4 bg-amber-50 rounded-xl">
                    <p className="text-sm text-amber-800">
                      <span className="font-medium">Renter Notes:</span> {showInspectionModal.notes}
                    </p>
                  </div>
                )}

                {/* Add Your Notes */}
                <div>
                  <h4 className="font-semibold mb-2">Your Inspection Notes</h4>
                  <textarea 
                    className="w-full h-24 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    placeholder="Add your observations about the gear condition..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowInspectionModal(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 text-amber-600 hover:bg-amber-50"
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    Needs Repair
                  </Button>
                  <Button 
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    onClick={() => {
                      setShowInspectionModal(null);
                      alert("Condition confirmed! Deposit will be released to the renter.");
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm & Release Deposit
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </GearOwnerGuard>
  );
}
