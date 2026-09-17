"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Globe, Bell, LogOut, Shield, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";
import { useTranslations, useLocale } from "next-intl";
import { useNotifications } from "@/contexts/notifications-context";
import { useAuth } from "@/contexts/auth-context";

export function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const dashboardPath = user?.role === "company" ? "/analytics/company" : "/analytics";

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    router.push(`/${locale}`);
  };

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
            <Image
              src="/lumi-leaf.png"
              alt="LumiAI"
              width={36}
              height={36}
              className="transition-transform group-hover:scale-110"
            />
            <span className="text-2xl font-bold text-ink">
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
                  className="flex items-center gap-1 px-4 py-2 text-ink-soft hover:text-primary font-medium rounded-lg hover:bg-primary-soft transition-colors"
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
                      className="absolute top-full left-0 mt-2 w-64 bg-paper rounded-xl border border-line p-2"
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
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-ink-soft hover:text-primary rounded-lg hover:bg-primary-soft transition-colors"
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
                    className="absolute top-full right-0 mt-2 w-40 bg-paper rounded-xl border border-line p-1"
                  >
                    {languages.map((lang) => (
                      <Link
                        key={lang.code}
                        href={`/${lang.code}`}
                        className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                          lang.code === locale ? "bg-primary-soft text-primary font-medium" : "hover:bg-gray-50 text-ink-soft"
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
                className="relative p-2 text-ink-soft hover:text-primary rounded-lg hover:bg-primary-soft transition-colors"
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
                    className="absolute top-full right-0 mt-2 w-80 bg-paper rounded-xl border border-line p-3"
                  >
                    <div className="flex items-center justify-between px-2 py-1 mb-2">
                      <span className="font-semibold text-sm">{t("notifications")}</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
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
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${n.read ? "bg-paper" : "bg-primary-soft"}`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? "bg-gray-300" : "bg-primary"}`} />
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

            {!isLoading &&
              (user ? (
                <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-primary-soft transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs`}>
                {user.avatar}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-56 bg-paper rounded-xl border border-line p-2"
                >
                  <div className="px-3 py-2 border-b mb-1">
                    <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    href={dashboardPath}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ink-soft hover:bg-primary-soft hover:text-primary transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    {t("dashboard")}
                  </Link>
                  {user.isAdmin && (
                    <Link
                      href="/admin/overview"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ink-soft hover:bg-primary-soft hover:text-primary transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      {t("admin")}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ink-soft hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t("logout")}
                  </button>
                </motion.div>
              )}
                </AnimatePresence>
              </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">{t("login")}</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">{t("getStarted")}</Button>
                  </Link>
                </>
              ))}
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
            className="md:hidden bg-paper border-t border-line"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <Link 
                    href={link.href}
                    className="block px-4 py-3 text-ink-soft font-medium rounded-lg hover:bg-gray-50"
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
                          className="block px-4 py-2 text-sm text-neutral-600 rounded-lg hover:bg-gray-50"
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
                        lang.code === locale ? "bg-primary-soft text-primary font-medium" : "bg-gray-100 text-ink-soft"
                      }`}
                    >
                      {lang.label}
                    </Link>
                  ))}
                </div>
                {!isLoading &&
                  (user ? (
                    <div className="px-4 pt-2 space-y-2">
                      <div className="flex items-center gap-3 px-1 pb-2">
                        <div className={`w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm`}>
                          {user.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <Link href={dashboardPath} onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full">{t("dashboard")}</Button>
                      </Link>
                      {user.isAdmin && (
                        <Link href="/admin/overview" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full">{t("admin")}</Button>
                        </Link>
                      )}
                      <Button variant="outline" className="w-full" onClick={handleLogout}>
                        {t("logout")}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full">{t("login")}</Button>
                      </Link>
                      <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full">{t("getStarted")}</Button>
                      </Link>
                    </>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
