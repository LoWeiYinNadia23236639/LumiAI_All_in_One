"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X, ChevronDown, Globe, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { useTranslations, useLocale } from "next-intl";
import { useNotifications } from "@/contexts/notifications-context";

export function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const navLinks = [
    { 
      label: t("aiHub"), 
      href: "/ai-hub",
      description: t("aiHubDescription")
    },
    { 
      label: t("marketplace"), 
      href: "/marketplace",
      description: t("marketplaceDescription"),
      dropdown: [
        { label: t("findCampaigns"), href: "/marketplace/campaigns", description: t("findCampaignsDescription") },
        { label: t("findCreators"), href: "/marketplace/talent", description: t("findCreatorsDescription") },
      ]
    },
    { 
      label: t("rentGear"), 
      href: "/equipment",
      description: t("rentGearDescription")
    },
    { 
      label: t("analytics"), 
      href: "/analytics",
      description: t("analyticsDescription")
    },
    { 
      label: t("help"), 
      href: "/help",
      description: t("helpDescription")
    },
  ];

  const languages = [
    { code: "en", label: "English" },
    { code: "zh-hk", label: "繁體中文" },
    { code: "zh-cn", label: "简体中文" },
  ];

  const currentLang = languages.find(l => l.code === locale) || languages[0];

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

          {/* CTA Buttons + Language */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-violet-600 rounded-lg hover:bg-violet-50 transition-colors"
              >
                <Globe className="w-4 h-4" />
                {currentLang.label}
                <ChevronDown className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border p-1"
                  >
                    {languages.map((lang) => (
                      <Link
                        key={lang.code}
                        href={`/${lang.code}`}
                        className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                          lang.code === locale ? "bg-violet-50 text-violet-700 font-medium" : "hover:bg-gray-50 text-gray-700"
                        }`}
                        onClick={() => setLangOpen(false)}
                      >
                        {lang.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-gray-700 hover:text-violet-600 rounded-lg hover:bg-violet-50 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border p-3"
                  >
                    <div className="flex items-center justify-between px-2 py-1 mb-2">
                      <span className="font-semibold text-sm">{t("notifications")}</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-violet-600 hover:underline">
                          {t("markAllRead")}
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto space-y-1">
                      {notifications.length === 0 && (
                        <p className="text-sm text-neutral-500 px-2 py-4 text-center">{t("noNotifications")}</p>
                      )}
                      {notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => { markAsRead(n.id); setNotifOpen(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${n.read ? "bg-white" : "bg-violet-50"}`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? "bg-gray-300" : "bg-violet-500"}`} />
                            <div className="flex-1">
                              <p className={`text-sm ${n.read ? "font-medium text-neutral-700" : "font-semibold text-neutral-900"}`}>{n.title}</p>
                              <p className="text-xs text-neutral-500">{n.message}</p>
                              <p className="text-[10px] text-neutral-400 mt-0.5">{n.createdAt}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/auth">
              <Button variant="ghost" size="sm">{t("login")}</Button>
            </Link>
            <Link href="/auth">
              <Button size="sm">{t("getStarted")}</Button>
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
                <div className="flex gap-2 px-4">
                  {languages.map((lang) => (
                    <Link
                      key={lang.code}
                      href={`/${lang.code}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        lang.code === locale ? "bg-violet-100 text-violet-700 font-medium" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {lang.label}
                    </Link>
                  ))}
                </div>
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">{t("login")}</Button>
                </Link>
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">{t("getStarted")}</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
