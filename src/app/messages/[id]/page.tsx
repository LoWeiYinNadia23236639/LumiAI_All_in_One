"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft,
  Send,
  Paperclip,
  Image as ImageIcon,
  Calendar,
  Camera,
  Package,
  MoreVertical,
  Phone,
  Video,
  Info,
  Clock,
  CheckCheck,
  Star,
  Shield,
  Flag,
  Archive,
  Trash2,
  Smile,
  Mic
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock conversation data
const conversationData = {
  id: "conv-001",
  contact: {
    name: "Jordan Smith",
    avatar: "JS",
    avatarColor: "from-violet-400 to-purple-500",
    status: "online",
    lastActive: "Active now",
    rating: 4.8,
    rentals: 12,
    memberSince: "2024-08",
    verified: true,
  },
  rental: {
    id: "RNT-2847",
    gear: "Sony A7IV",
    gearImage: "📷",
    status: "upcoming",
    pickupDate: "Apr 10, 2026",
    returnDate: "Apr 15, 2026",
    total: "$475",
    deposit: "$800",
  },
  messages: [
    {
      id: 1,
      sender: "them",
      type: "text",
      content: "Hi Alex! I'm interested in renting your Sony A7IV for a weekend shoot.",
      time: "Apr 5, 2:30 PM",
      read: true,
    },
    {
      id: 2,
      sender: "them",
      type: "text",
      content: "I have a client shoot on April 12th and need a reliable camera. Can I pick it up on Friday evening around 6pm?",
      time: "Apr 5, 2:31 PM",
      read: true,
    },
    {
      id: 3,
      sender: "me",
      type: "text",
      content: "Hi Jordan! Thanks for reaching out. The Sony A7IV is available for those dates.",
      time: "Apr 5, 3:15 PM",
      read: true,
    },
    {
      id: 4,
      sender: "me",
      type: "text",
      content: "Friday at 6pm works for me. I'll make sure the battery is fully charged and include a spare. The camera comes with a 24-70mm lens - is that okay for your shoot?",
      time: "Apr 5, 3:16 PM",
      read: true,
    },
    {
      id: 5,
      sender: "them",
      type: "text",
      content: "That's perfect! The 24-70mm is exactly what I need. Do you have any SD cards available too, or should I bring my own?",
      time: "Apr 5, 4:02 PM",
      read: true,
    },
    {
      id: 6,
      sender: "me",
      type: "text",
      content: "I can include a 128GB SD card at no extra charge. It's a fast card (V60) so it can handle 4K recording without any issues.",
      time: "Apr 5, 4:30 PM",
      read: true,
    },
    {
      id: 7,
      sender: "them",
      type: "text",
      content: "Amazing, thank you so much! This is my first time renting on LumiAI. How does the pickup process work exactly?",
      time: "Apr 5, 5:45 PM",
      read: true,
    },
    {
      id: 8,
      sender: "me",
      type: "text",
      content: "Welcome to LumiAI! The process is straightforward:\n\n1. We'll meet at my studio (123 Main St, Downtown)\n2. I'll show you the camera and we'll test it together\n3. We'll take photos of the gear condition (for both our protection)\n4. You confirm everything looks good\n5. That's it! The deposit will be held and released when you return the gear in the same condition.",
      time: "Apr 5, 6:00 PM",
      read: true,
    },
    {
      id: 9,
      sender: "them",
      type: "text",
      content: "Got it! That sounds very professional. I'll see you Friday at 6pm then. Should I bring ID?",
      time: "Apr 5, 6:15 PM",
      read: true,
    },
    {
      id: 10,
      sender: "me",
      type: "text",
      content: "Yes, please bring a government-issued ID that matches your LumiAI profile. Also, don't forget to upload the pickup photos through the app after we inspect the gear together. See you Friday!",
      time: "Apr 5, 6:20 PM",
      read: true,
    },
    {
      id: 11,
      sender: "them",
      type: "text",
      content: "Perfect! Looking forward to it. Thanks for being so helpful! 🙏",
      time: "Apr 5, 6:22 PM",
      read: true,
    },
    {
      id: 12,
      sender: "system",
      type: "system",
      content: "Jordan Smith has submitted a rental request for Sony A7IV",
      time: "Apr 5, 6:25 PM",
    },
    {
      id: 13,
      sender: "me",
      type: "text",
      content: "Hi Jordan! Just confirming - I've approved your rental request. Everything is set for Friday 6pm pickup. Let me know if anything changes on your end!",
      time: "Apr 6, 9:00 AM",
      read: false,
    },
  ],
};

// Quick reply templates
const quickReplies = [
  "Yes, it's available!",
  "What dates do you need it?",
  "I can include extra batteries.",
  "Pickup is at my studio downtown.",
  "Let me check my calendar.",
];

export default function MessageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      // In real app, send message
      setMessage("");
      scrollToBottom();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white pt-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => router.push("/analytics/gear-owner")}
                  className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${conversationData.contact.avatarColor} flex items-center justify-center text-white font-bold`}>
                    {conversationData.contact.avatar}
                  </div>
                  {conversationData.contact.status === "online" && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{conversationData.contact.name}</h3>
                    {conversationData.contact.verified && (
                      <Shield className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-500">{conversationData.contact.lastActive}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <Video className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowInfo(!showInfo)}
                  className={showInfo ? "bg-gray-100" : ""}
                >
                  <Info className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Rental Context Banner */}
            <div className="bg-orange-50 border-b border-orange-100 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl">
                    {conversationData.rental.gearImage}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{conversationData.rental.gear}</p>
                    <p className="text-xs text-neutral-500">{conversationData.rental.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="hidden sm:block">
                    <p className="text-neutral-500 text-xs">Pickup</p>
                    <p className="font-medium">{conversationData.rental.pickupDate}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-neutral-500 text-xs">Return</p>
                    <p className="font-medium">{conversationData.rental.returnDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-neutral-500 text-xs">Total</p>
                    <p className="font-medium text-orange-600">{conversationData.rental.total}</p>
                  </div>
                  <Link href={`/rental-requests/${conversationData.rental.id}`}>
                    <Button size="sm" variant="outline" className="ml-2">
                      View Request
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
              {conversationData.messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`flex ${
                    msg.sender === "me" ? "justify-end" : 
                    msg.sender === "system" ? "justify-center" : "justify-start"
                  }`}>
                  {msg.sender === "system" ? (
                    <div className="px-4 py-2 bg-gray-100 rounded-full text-xs text-neutral-500">
                      {msg.content}
                    </div>
                  ) : (
                    <div className={`flex gap-2 max-w-[80%] ${msg.sender === "me" ? "flex-row-reverse" : ""}`}>
                      {msg.sender === "them" && (
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${conversationData.contact.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1`}>
                          {conversationData.contact.avatar}
                        </div>
                      )}
                      <div>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                          msg.sender === "me" 
                            ? "bg-orange-500 text-white rounded-br-md" 
                            : "bg-white border rounded-bl-md"
                        }`}>
                          {msg.content.split('\n').map((line, idx) => (
                            <span key={idx}>
                              {line}
                              {idx < msg.content.split('\n').length - 1 && <br />}
                            </span>
                          ))}
                        </div>
                        <div className={`flex items-center gap-1 mt-1 text-xs text-neutral-400 ${
                          msg.sender === "me" ? "justify-end" : ""
                        }`}>
                          <span>{msg.time}</span>
                          {msg.sender === "me" && msg.read && (
                            <CheckCheck className="w-3 h-3 text-blue-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-4 py-2 border-t bg-white">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(reply)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm whitespace-nowrap transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 pr-12 bg-gray-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[50px] max-h-[120px]"
                    rows={1}
                  />
                  <button className="absolute right-3 bottom-3 p-1 hover:bg-gray-200 rounded">
                    <Smile className="w-5 h-5 text-neutral-400" />
                  </button>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="hidden sm:flex px-2">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="hidden sm:flex px-2">
                    <ImageIcon className="w-5 h-5" />
                  </Button>
                  <Button 
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Info Panel */}
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l bg-white overflow-hidden"
              >
                <div className="w-80 h-full overflow-y-auto">
                  {/* Contact Info */}
                  <div className="p-6 border-b text-center">
                    <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${conversationData.contact.avatarColor} flex items-center justify-center text-white text-2xl font-bold mb-3`}>
                      {conversationData.contact.avatar}
                    </div>
                    <h3 className="font-bold text-lg">{conversationData.contact.name}</h3>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      {conversationData.contact.verified && (
                        <span className="flex items-center gap-1 text-xs text-blue-600">
                          <Shield className="w-3 h-3" />
                          Verified Renter
                        </span>
                      )}
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="font-bold">{conversationData.contact.rating}</span>
                        </div>
                        <p className="text-xs text-neutral-500">Rating</p>
                      </div>
                      <div className="text-center">
                        <span className="font-bold">{conversationData.contact.rentals}</span>
                        <p className="text-xs text-neutral-500">Rentals</p>
                      </div>
                      <div className="text-center">
                        <span className="font-bold">{conversationData.contact.memberSince}</span>
                        <p className="text-xs text-neutral-500">Member</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Package className="w-4 h-4 mr-1" />
                        Profile
                      </Button>
                    </div>
                  </div>

                  {/* Rental Details */}
                  <div className="p-6 border-b">
                    <h4 className="font-semibold mb-4">Rental Details</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                        <span className="text-2xl">{conversationData.rental.gearImage}</span>
                        <div className="flex-1">
                          <p className="font-medium">{conversationData.rental.gear}</p>
                          <p className="text-xs text-neutral-500">{conversationData.rental.id}</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Status</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Upcoming</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Pickup</span>
                        <span>{conversationData.rental.pickupDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Return</span>
                        <span>{conversationData.rental.returnDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Total</span>
                        <span className="font-medium">{conversationData.rental.total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Deposit</span>
                        <span className="font-medium">{conversationData.rental.deposit}</span>
                      </div>
                    </div>
                    <Link href={`/rental-requests/${conversationData.rental.id}`}>
                      <Button variant="outline" className="w-full mt-4">
                        View Full Request
                      </Button>
                    </Link>
                  </div>

                  {/* Actions */}
                  <div className="p-6">
                    <h4 className="font-semibold mb-4">Actions</h4>
                    <div className="space-y-2">
                      <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl text-left">
                        <Archive className="w-5 h-5 text-neutral-400" />
                        <span className="text-sm">Archive Conversation</span>
                      </button>
                      <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl text-left">
                        <Flag className="w-5 h-5 text-neutral-400" />
                        <span className="text-sm">Report User</span>
                      </button>
                      <button className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-xl text-left text-red-600">
                        <Trash2 className="w-5 h-5" />
                        <span className="text-sm">Delete Conversation</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
