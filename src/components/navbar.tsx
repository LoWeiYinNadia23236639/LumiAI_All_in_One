"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";

const navLinks = [
  { 
    label: "AI Hub", 
    href: "/ai-hub",
    description: "AI-powered creator tools"
  },
  { 
    label: "Marketplace", 
    href: "/marketplace",
    description: "Find brand deals & creators",
    dropdown: [
      { label: "Find Campaigns", href: "/marketplace/campaigns", description: "Browse brand opportunities" },
      { label: "Find Creators", href: "/marketplace/talent", description: "Discover influencers" },
    ]
  },
  { 
    label: "Rent Gear", 
    href: "/equipment",
    description: "Equipment rental marketplace"
  },
  { 
    label: "Analytics", 
    href: "/analytics",
    description: "Track your growth"
  },
  { 
    label: "Help", 
    href: "/help",
    description: "Tutorials and support"
  },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center transition-transform group-hover:scale-110">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
              LumiAI
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <div 
                key={link.label}
                className="relative"
                onMouseEnter={() => link.dropdown && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link 
                  href={link.href}
                  className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-violet-600 font-medium rounded-lg hover:bg-violet-50 transition-colors"
                >
                  {link.label}
                  {link.dropdown && <ChevronDown className="w-4 h-4" />}
                </Link>
                
                {/* Dropdown */}
                <AnimatePresence>
                  {link.dropdown && activeDropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border p-2"
                    >
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/help">
              <Button variant="ghost" size="sm">Help</Button>
            </Link>
            <Link href="/auth">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link href="/auth">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <Link 
                    href={link.href}
                    className="block px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                  {link.dropdown && (
                    <div className="ml-4 mt-1 space-y-1">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 border-t mt-4 space-y-2">
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Log In</Button>
                </Link>
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
