"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Clock,
  Calendar,
  Download,
  Search,
  Wallet,
  ArrowUpRight,
  BarChart3,
  FileText,
  Banknote,
  Shield,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Plus,
  Edit2,
  BadgeCheck,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock earnings data
const earningsData = {
  summary: {
    totalEarned: "$24,580",
    thisMonth: "$2,450",
    pendingPayout: "$1,280",
    availableBalance: "$3,750",
    onHold: "$800",
  },
  
  stats: {
    totalBookings: 156,
    avgBookingValue: "$157.50",
    repeatCustomerRate: "42%",
    avgRating: 4.9,
  },

  monthlyData: [
    { month: "Jan", earnings: 1850, bookings: 12 },
    { month: "Feb", earnings: 2120, bookings: 14 },
    { month: "Mar", earnings: 2890, bookings: 19 },
    { month: "Apr", earnings: 2450, bookings: 16 },
    { month: "May", earnings: 1980, bookings: 13 },
    { month: "Jun", earnings: 2340, bookings: 15 },
  ],

  transactions: [
    {
      id: "TXN-2847",
      date: "Apr 15, 2026",
      description: "Canon R5 rental - Taylor Wilson",
      gear: "Canon R5",
      amount: 427.50,
      status: "completed",
    },
    {
      id: "TXN-2841",
      date: "Apr 12, 2026",
      description: "Sony A7IV rental - Jordan Smith",
      gear: "Sony A7IV",
      amount: 202.50,
      status: "completed",
    },
    {
      id: "TXN-2839",
      date: "Apr 10, 2026",
      description: "DJI RS 3 Pro rental - Casey Brown",
      gear: "DJI RS 3 Pro",
      amount: 148.50,
      status: "pending",
    },
  ],

  gearPerformance: [
    { gear: "Canon R5", rentals: 38, earnings: 3610, utilization: 72 },
    { gear: "Sony A7IV", rentals: 45, earnings: 3375, utilization: 78 },
    { gear: "DJI RS 3 Pro", rentals: 28, earnings: 1540, utilization: 65 },
  ],

  payouts: [
    { id: "PO-2026-04", date: "Apr 16, 2026", amount: 850, status: "completed", method: "Bank Transfer" },
    { id: "PO-2026-04-2", date: "Apr 9, 2026", amount: 1200, status: "completed", method: "Bank Transfer" },
  ],
};

const paymentMethods = [
  { id: 1, type: "bank", name: "Chase Bank", account: "****4521", default: true, verified: true },
  { id: 2, type: "paypal", name: "PayPal", account: "alex@email.com", default: false, verified: true },
];

export default function EarningsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30days");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(1);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
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
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <DollarSign className="w-5 h-5" />
                <span className="font-medium">Earnings Center</span>
              </div>
              <h1 className="text-3xl font-bold text-neutral-900">Financial Overview</h1>
              <p className="text-neutral-600">Track earnings, manage payouts, and view financial reports</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button 
              size="sm" 
              className="bg-green-500 hover:bg-green-600"
              onClick={() => setShowWithdrawModal(true)}
            >
              <Wallet className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Available</span>
            </div>
            <p className="text-3xl font-bold">{earningsData.summary.availableBalance}</p>
            <p className="text-sm text-white/80">Available for withdrawal</p>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Pending</span>
            </div>
            <p className="text-3xl font-bold text-neutral-900">{earningsData.summary.pendingPayout}</p>
            <p className="text-sm text-neutral-500">Processing payouts</p>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">On Hold</span>
            </div>
            <p className="text-3xl font-bold text-neutral-900">{earningsData.summary.onHold}</p>
            <p className="text-sm text-neutral-500">Security deposits held</p>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">This Month</span>
            </div>
            <p className="text-3xl font-bold text-neutral-900">{earningsData.summary.thisMonth}</p>
            <p className="text-sm text-green-600 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +15.6% vs last month
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 p-1 bg-gray-100 rounded-xl">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "transactions", label: "Transactions", icon: FileText },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "payouts", label: "Payouts", icon: Banknote },
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
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border p-5">
                <p className="text-sm text-neutral-500 mb-1">Total Bookings</p>
                <p className="text-2xl font-bold">{earningsData.stats.totalBookings}</p>
                <p className="text-xs text-green-600 mt-1">+8 this month</p>
              </div>
              <div className="bg-white rounded-2xl border p-5">
                <p className="text-sm text-neutral-500 mb-1">Avg. Booking Value</p>
                <p className="text-2xl font-bold">{earningsData.stats.avgBookingValue}</p>
                <p className="text-xs text-neutral-400 mt-1">After platform fees</p>
              </div>
              <div className="bg-white rounded-2xl border p-5">
                <p className="text-sm text-neutral-500 mb-1">Repeat Customers</p>
                <p className="text-2xl font-bold">{earningsData.stats.repeatCustomerRate}</p>
                <p className="text-xs text-green-600 mt-1">+5% vs last year</p>
              </div>
              <div className="bg-white rounded-2xl border p-5">
                <p className="text-sm text-neutral-500 mb-1">Your Rating</p>
                <p className="text-2xl font-bold">{earningsData.stats.avgRating}</p>
                <p className="text-xs text-neutral-400 mt-1">Out of 5.0</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold">Earnings Trend</h3>
                  <select 
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-3 py-1.5 border rounded-lg text-sm"
                  >
                    <option value="30days">Last 30 days</option>
                    <option value="90days">Last 90 days</option>
                  </select>
                </div>
                <div className="h-64 flex items-end gap-4">
                  {earningsData.monthlyData.map((month, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-orange-500 rounded-t-lg"
                        style={{ height: `${(month.earnings / 3000) * 200}px` }}
                      />
                      <span className="text-xs text-neutral-500">{month.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="font-bold mb-4">Top Performing Gear</h3>
                <div className="space-y-4">
                  {earningsData.gearPerformance.map((gear, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xl">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{gear.gear}</p>
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <span>{gear.rentals} rentals</span>
                          <span>•</span>
                          <span>{gear.utilization}% utilized</span>
                        </div>
                      </div>
                      <span className="font-bold text-sm">${gear.earnings}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Recent Transactions</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("transactions")}>
                  View All
                </Button>
              </div>
              <div className="divide-y">
                {earningsData.transactions.map((txn) => (
                  <div key={txn.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{txn.description}</p>
                        <p className="text-xs text-neutral-500">{txn.date} • {txn.gear}</p>
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
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input 
                  type="text"
                  placeholder="Search transactions..."
                  className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
                />
              </div>
              <select className="px-3 py-2 border rounded-lg text-sm">
                <option>All Types</option>
                <option>Rental Income</option>
              </select>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">Transaction ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">Description</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-neutral-500">Amount</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-neutral-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {earningsData.transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{txn.id}</td>
                    <td className="px-4 py-3 text-sm text-neutral-500">{txn.date}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{txn.description}</p>
                      <p className="text-xs text-neutral-500">{txn.gear}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-green-600">
                      +${txn.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        txn.status === "completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="font-bold mb-4">Gear Performance Analysis</h3>
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">Gear</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-neutral-500">Rentals</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-neutral-500">Utilization</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-neutral-500">Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {earningsData.gearPerformance.map((gear, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{gear.gear}</td>
                      <td className="px-4 py-3 text-center">{gear.rentals}</td>
                      <td className="px-4 py-3 text-center">{gear.utilization}%</td>
                      <td className="px-4 py-3 text-right font-bold">${gear.earnings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payouts Tab */}
        {activeTab === "payouts" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Payment Methods</h3>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add New
                </Button>
              </div>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div 
                    key={method.id}
                    className={`p-4 rounded-xl border-2 ${
                      method.default ? "border-orange-500 bg-orange-50" : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          method.type === "bank" ? "bg-green-100" : "bg-blue-100"
                        }`}>
                          {method.type === "bank" ? (
                            <Landmark className="w-5 h-5 text-green-600" />
                          ) : (
                            <Wallet className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-neutral-500">{method.account}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.verified && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                            <BadgeCheck className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-bold">Payout History</h3>
              </div>
              <div className="divide-y">
                {earningsData.payouts.map((payout) => (
                  <div key={payout.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                        <Banknote className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{payout.id}</p>
                        <p className="text-sm text-neutral-500">{payout.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${payout.amount}</p>
                      <p className="text-sm text-neutral-500">{payout.method}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                      {payout.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-md p-6"
          >
            <h3 className="font-bold text-lg mb-4">Withdraw Funds</h3>
            
            <div className="p-4 bg-gray-50 rounded-xl mb-4">
              <p className="text-sm text-neutral-500">Available Balance</p>
              <p className="text-3xl font-bold">$3,750</p>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Amount to Withdraw</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full pl-10 pr-4 py-3 border rounded-xl text-lg"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">To</label>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`w-full p-3 rounded-xl border-2 text-left ${
                      selectedPaymentMethod === method.id 
                        ? "border-orange-500 bg-orange-50" 
                        : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        method.type === "bank" ? "bg-green-100" : "bg-blue-100"
                      }`}>
                        {method.type === "bank" ? (
                          <Landmark className="w-5 h-5 text-green-600" />
                        ) : (
                          <Wallet className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-neutral-500">{method.account}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowWithdrawModal(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-green-500 hover:bg-green-600"
                disabled={!withdrawAmount || parseInt(withdrawAmount) < 50}
                onClick={() => {
                  alert(`Withdrawal of $${withdrawAmount} initiated!`);
                  setShowWithdrawModal(false);
                  setWithdrawAmount("");
                }}
              >
                Confirm Withdrawal
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
