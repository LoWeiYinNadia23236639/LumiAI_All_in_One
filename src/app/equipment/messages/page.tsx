"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  MessageSquare,
  Search,
  Send,
  Camera,
  Phone,
  MoreVertical,
  CheckCheck,
  Clock,
  Star,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";

const conversations = [
  {
    id: "1",
    owner: {
      name: "Alex's Camera Rentals",
      avatar: "AC",
      verified: true,
      lastActive: "Active now"
    },
    equipment: {
      name: "Sony A7IV Full-Frame",
      image: "📷",
      price: "$75/day"
    },
    lastMessage: {
      text: "Yes, the camera is available next weekend! It comes with a 24-70mm kit lens. Would you like to add any additional lenses?",
      time: "10 min ago",
      unread: true,
      sender: "owner"
    },
    status: "inquiry"
  },
  {
    id: "2",
    owner: {
      name: "Miami Film Gear",
      avatar: "MF",
      verified: true,
      lastActive: "2 hours ago"
    },
    equipment: {
      name: "DJI RS 3 Pro Gimbal",
      image: "🎯",
      price: "$55/day"
    },
    lastMessage: {
      text: "Thanks for booking! Pickup is at our studio downtown. Here's the address...",
      time: "2 hours ago",
      unread: false,
      sender: "owner"
    },
    status: "confirmed"
  },
  {
    id: "3",
    owner: {
      name: "LA Studio Rentals",
      avatar: "LA",
      verified: true,
      lastActive: "1 day ago"
    },
    equipment: {
      name: "Aputure 120D II LED",
      image: "💡",
      price: "$45/day"
    },
    lastMessage: {
      text: "The light is currently out for maintenance. It will be available again on Friday.",
      time: "1 day ago",
      unread: false,
      sender: "owner"
    },
    status: "unavailable"
  }
];

const mockMessages = [
  { id: "1", text: "Hi! I'm interested in renting the Sony A7IV for next weekend.", sender: "me", time: "11:30 AM" },
  { id: "2", text: "Do you have any availability for Saturday to Sunday?", sender: "me", time: "11:31 AM" },
  { id: "3", text: "Also, does it come with any lenses or is it body only?", sender: "me", time: "11:31 AM" },
  { id: "4", text: "Yes, the camera is available next weekend! It comes with a 24-70mm kit lens. Would you like to add any additional lenses?", sender: "owner", time: "11:41 AM" },
];

export default function EquipmentMessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState(mockMessages);

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      text: messageInput,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
    setMessageInput("");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/equipment">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Equipment
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Messages</h1>
          <p className="text-neutral-600">Communicate with equipment owners</p>
        </div>

        <div className="bg-white rounded-2xl border shadow-lg overflow-hidden h-[600px]">
          <div className="grid grid-cols-3 h-full">
            {/* Conversations List */}
            <div className="border-r">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input 
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="overflow-y-auto h-[calc(600px-73px)]">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 flex gap-3 hover:bg-gray-50 transition-colors text-left ${
                      selectedConversation.id === conv.id ? "bg-orange-50 border-l-4 border-orange-500" : ""
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {conv.owner.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{conv.owner.name}</h4>
                        {conv.owner.verified && (
                          <span className="text-blue-500 text-xs">✓</span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500 truncate">{conv.equipment.name}</p>
                      <p className={`text-sm truncate ${conv.lastMessage.unread ? "font-medium text-neutral-900" : "text-neutral-500"}`}>
                        {conv.lastMessage.text}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-neutral-400">{conv.lastMessage.time}</span>
                        {conv.lastMessage.unread && (
                          <span className="w-2 h-2 bg-orange-500 rounded-full" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="col-span-2 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold">
                    {selectedConversation.owner.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{selectedConversation.owner.name}</h3>
                      {selectedConversation.owner.verified && (
                        <span className="text-blue-500 text-xs">✓</span>
                      )}
                    </div>
                    <p className="text-xs text-green-600">{selectedConversation.owner.lastActive}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Equipment Info Banner */}
              <div className="p-3 bg-orange-50 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedConversation.equipment.image}</span>
                  <div>
                    <p className="font-medium text-sm">{selectedConversation.equipment.name}</p>
                    <p className="text-xs text-neutral-500">{selectedConversation.equipment.price}</p>
                  </div>
                </div>
                <Link href="/equipment/book">
                  <Button size="sm" variant="outline">View Item</Button>
                </Link>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[70%] ${msg.sender === "me" ? "bg-orange-500 text-white" : "bg-gray-100 text-neutral-900"} rounded-2xl px-4 py-3`}>
                      <p>{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === "me" ? "text-orange-100" : "text-neutral-500"}`}>
                        {msg.time}
                        {msg.sender === "me" && <CheckCheck className="w-3 h-3 inline ml-1" />}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button 
                    className="bg-gradient-to-r from-orange-500 to-amber-500"
                    onClick={sendMessage}
                    disabled={!messageInput.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button variant="ghost" size="sm" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    Propose Dates
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Request to Book
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
