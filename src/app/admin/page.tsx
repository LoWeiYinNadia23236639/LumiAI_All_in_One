"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Shield, 
  Users, 
  Camera,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  ArrowRight,
  Star,
  MoreHorizontal,
  Settings,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/components/admin-guard";
import { useAuth } from "@/contexts/auth-context";

const mockData = {
  stats: {
    pendingVerifications: 23,
    activeRentals: 156,
    totalUsers: 12450,
    depositsHeld: "$45,200",
  },
  verifications: [
    { id: 1, type: "creator", name: "Jessica Kim", handle: "@jessicakitchen", submittedAt: "2 hours ago", documents: 3, status: "pending" },
    { id: 2, type: "company", name: "Glow Skincare", handle: "@glowskincare", submittedAt: "5 hours ago", documents: 4, status: "pending" },
    { id: 3, type: "creator", name: "Alex Rivera", handle: "@alextech", submittedAt: "1 day ago", documents: 3, status: "under_review" },
    { id: 4, type: "creator", name: "Maria Santos", handle: "@mariafit", submittedAt: "2 days ago", documents: 2, status: "pending" },
  ],
  equipmentReturns: [
    { id: 1, item: "Sony A7IV", renter: "Sarah Chen", condition: "excellent", returnDate: "Today", deposit: "$800", status: "pending_check" },
    { id: 2, item: "DJI RS 3 Pro", renter: "Mike Chen", condition: "good", returnDate: "Today", deposit: "$600", status: "pending_check" },
    { id: 3, item: "Rode VideoMic", renter: "Emma Davis", condition: "damaged", returnDate: "Yesterday", deposit: "$200", status: "dispute" },
  ],
  recentActivity: [
    { action: "Verified creator", target: "David Park", time: "10 min ago" },
    { action: "Released deposit", target: "Sony A7IV rental", time: "25 min ago" },
    { action: "Flagged content", target: "Report #2847", time: "1 hour ago" },
    { action: "Approved company", target: "TechMaster Pro", time: "2 hours ago" },
  ],
};

function AdminPanel() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("verifications");

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-violet-50/30 to-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-violet-600 mb-1">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Admin Panel</span>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                Restricted Access
              </span>
            </div>
            <h1 className="text-3xl font-bold text-neutral-900">Platform Management</h1>
            <p className="text-neutral-600">Verify users, manage rentals, and oversee platform operations</p>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${user.avatarColor} flex items-center justify-center text-white text-sm font-bold`}>
                  {user.avatar}
                </div>
                <div className="text-sm">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-neutral-500 text-xs">{user.email}</p>
                </div>
              </div>
            )}
            <Button variant="outline" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Pending Verifications", value: mockData.stats.pendingVerifications, icon: Users, color: "text-orange-500", bg: "bg-orange-50", alert: true },
            { label: "Active Rentals", value: mockData.stats.activeRentals, icon: Camera, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Total Users", value: mockData.stats.totalUsers.toLocaleString(), icon: Users, color: "text-violet-500", bg: "bg-violet-50" },
            { label: "Deposits Held", value: mockData.stats.depositsHeld, icon: DollarSign, color: "text-green-500", bg: "bg-green-50" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-5 border shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                {stat.alert && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                    Action needed
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
              <p className="text-sm text-neutral-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 p-1 bg-gray-100 rounded-xl w-fit">
          {[
            { id: "verifications", label: "Verifications", count: mockData.stats.pendingVerifications },
            { id: "rentals", label: "Equipment Returns", count: 3 },
            { id: "disputes", label: "Disputes", count: 1 },
            { id: "activity", label: "Activity Log" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-violet-600 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {tab.label}
              {tab.count && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${
                  activeTab === tab.id ? "bg-violet-100" : "bg-gray-200"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "verifications" && (
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold">Pending Verifications</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input 
                    type="text"
                    placeholder="Search..."
                    className="pl-9 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-1" />
                  Filter
                </Button>
              </div>
            </div>
            <div className="divide-y">
              {mockData.verifications.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                        item.type === "creator" ? "bg-gradient-to-br from-pink-400 to-rose-500" : "bg-gradient-to-br from-blue-400 to-blue-600"
                      }`}>
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{item.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            item.type === "creator" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"
                          }`}>
                            {item.type === "creator" ? "Creator" : "Company"}
                          </span>
                          {item.status === "under_review" && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                              Under Review
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-500">{item.handle} • Submitted {item.submittedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-neutral-500">{item.documents} documents</span>
                      <Button size="sm" variant="outline">Review</Button>
                      <div className="flex gap-1">
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "rentals" && (
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-bold">Equipment Return Inspections</h3>
            </div>
            <div className="divide-y">
              {mockData.equipmentReturns.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xl">
                        📷
                      </div>
                      <div>
                        <h4 className="font-medium">{item.item}</h4>
                        <p className="text-sm text-neutral-500">Rented by {item.renter} • Returned {item.returnDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.condition === "excellent" ? "bg-green-100 text-green-700" :
                          item.condition === "good" ? "bg-blue-100 text-blue-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                        </span>
                        <p className="text-sm text-neutral-500 mt-1">Deposit: {item.deposit}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/admin/inspections/adm-insp-${item.id}`}>
                          <Button size="sm" variant="outline">Inspect</Button>
                        </Link>
                        {item.condition !== "damaged" ? (
                          <Button size="sm" className="bg-green-500">Release Deposit</Button>
                        ) : (
                          <Button size="sm" className="bg-red-500 hover:bg-red-600">File Claim</Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h3 className="font-bold mb-4">Recent Admin Activity</h3>
            <div className="space-y-4">
              {mockData.recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-violet-500" />
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-neutral-500">{activity.target}</p>
                  </div>
                  <span className="text-sm text-neutral-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminPanel />
    </AdminGuard>
  );
}
