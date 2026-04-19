"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, User, Search, Bell, X } from "lucide-react"; // 🚨 X आइकन थपियो

export default function Header({ initialSettings }: { initialSettings: any }) {
  // 🚨 MOBILE SEARCH को लागि नयाँ State
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const defaultSettings = {
    topBarText: "WELCOME TO YEEJUNCRAFTS",
    topBarFontSize: "12px",
    topBarBgColor: "#ea580c",
    topBarTextColor: "#ffffff",
    topBarAlignment: "center",
    topBarSpeed: 15,
    logoUrl: "",
    logoWidth: 150,
    headerBgColor: "#ffffff",
    searchBarBgColor: "#f5f5f4",
    navBgColor: "transparent",
    navAlignment: "center",
    navTextColor: "#1c1917",
    navHoverColor: "#ea580c",
    navLinks: [
      { name: "Shop", link: "/shop" },
      { name: "Our Story", link: "/our-story" },
    ],
  };

  const [settings] = useState<any>(initialSettings || defaultSettings);

  const notifications = [
    {
      id: 1,
      text: "🎉 Big Sale: 50% Off on all Khukuris!",
      time: "2m ago",
      unread: true,
    },
    {
      id: 2,
      text: "📦 Your custom order has been shipped.",
      time: "1h ago",
      unread: true,
    },
  ];

  const alignmentClasses: { [key: string]: string } = {
    left: "justify-start text-left",
    center: "justify-center text-center",
    right: "justify-end text-right",
  };

  const topBarAlign = alignmentClasses[settings.topBarAlignment || "center"];
  const navAlign = alignmentClasses[settings.navAlignment || "center"];
  const safeNavLinks =
    Array.isArray(settings.navLinks) && settings.navLinks.length > 0
      ? settings.navLinks
      : defaultSettings.navLinks;
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="w-full shadow-sm font-sans relative z-[999]">
      {/* Marquee Animation CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes bulletproof-marquee {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-100%, 0); }
        }
        .my-marquee-container {
          overflow: hidden; white-space: nowrap; width: 100%; display: flex;
        }
        .my-marquee-text {
          display: inline-block; padding-left: 100%;
          animation: bulletproof-marquee ${settings.topBarSpeed || 15}s linear infinite;
        }
      `,
        }}
      />

      {/* 1. Top Bar */}
      <div
        style={{
          backgroundColor: settings.topBarBgColor,
          color: settings.topBarTextColor,
        }}
        className={`py-2 ${topBarAlign}`}
      >
        <div className="my-marquee-container">
          <div
            className="my-marquee-text font-bold uppercase tracking-widest"
            style={{ fontSize: settings.topBarFontSize }}
          >
            {settings.topBarText}
          </div>
        </div>
      </div>

      {/* 2. Main Header */}
      <header
        style={{ backgroundColor: settings.headerBgColor }}
        className="border-b border-stone-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4 md:gap-8">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt="Logo"
                    style={{
                      width: `${settings.logoWidth}px`,
                      maxWidth: "140px",
                    }}
                    className="object-contain"
                  />
                ) : (
                  <span className="text-2xl md:text-3xl font-serif font-extrabold tracking-tighter text-stone-900 uppercase">
                    YEEJUN
                    <span style={{ color: settings.navHoverColor }}>
                      CRAFTS
                    </span>
                  </span>
                )}
              </Link>
            </div>

            {/* 🚨 Desktop Search (मोबाइलमा लुक्छ) */}
            <div className="flex-1 max-w-xl hidden md:block">
              <div className="relative group">
                <input
                  style={{ backgroundColor: settings.searchBarBgColor }}
                  type="text"
                  placeholder="Search masterpieces..."
                  className="w-full border-transparent focus:bg-white border focus:border-orange-500 rounded-full px-12 py-3 text-sm outline-none transition-all"
                />
                <Search
                  className="absolute left-4 top-3 text-stone-400 group-focus-within:text-orange-500"
                  size={20}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 md:space-x-6 h-full">
              {/* 🚨 Mobile Search Toggle Button (डेस्कटपमा लुक्छ) */}
              <button
                className="md:hidden py-4 text-stone-600 hover:text-orange-600 transition-colors focus:outline-none"
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              >
                {isMobileSearchOpen ? <X size={24} /> : <Search size={24} />}
              </button>

              {/* Notifications */}
              <div className="group relative flex items-center h-full cursor-pointer py-4 hidden sm:flex">
                <Bell
                  size={24}
                  className="text-stone-600 hover:text-orange-600 transition-colors"
                />
                {unreadCount > 0 && (
                  <span className="absolute top-4 -right-1 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white"></span>
                )}
                <div className="absolute right-0 top-full mt-[-8px] pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="w-80 bg-white border border-stone-100 shadow-2xl rounded-2xl overflow-hidden cursor-default">
                    <div className="bg-stone-50 px-4 py-3 border-b border-stone-100 flex justify-between items-center">
                      <span className="font-bold text-stone-800 text-sm">
                        Notifications
                      </span>
                      <span className="text-[10px] text-orange-600 font-bold uppercase tracking-widest cursor-pointer hover:underline">
                        Mark all read
                      </span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-4 border-b border-stone-50 hover:bg-stone-50 transition-colors ${n.unread ? "bg-orange-50/30" : ""}`}
                        >
                          <p className="text-sm text-stone-800 leading-snug">
                            {n.text}
                          </p>
                          <p className="text-xs text-stone-400 mt-1">
                            {n.time}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* User Menu */}
              <div className="group relative flex items-center h-full cursor-pointer py-4">
                <User
                  size={24}
                  className="text-stone-600 hover:text-orange-600 transition-colors"
                />
                <div className="absolute right-0 top-full mt-[-8px] pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="w-48 bg-white border border-stone-100 shadow-2xl rounded-xl p-2 cursor-default">
                    <Link
                      href="/login"
                      className="block px-4 py-2 hover:bg-stone-50 rounded-lg text-sm font-bold text-stone-700"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="block px-4 py-2 hover:bg-stone-50 rounded-lg text-sm font-bold text-stone-700"
                    >
                      Join Tribe
                    </Link>
                    <div className="border-t border-stone-100 my-1"></div>
                    <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 rounded-lg text-sm font-bold">
                      Logout
                    </button>
                  </div>
                </div>
              </div>

              {/* Cart */}
              <Link href="/cart" className="relative py-4">
                <ShoppingBag
                  size={24}
                  className="text-stone-600 hover:text-orange-600 transition-colors"
                />
                <span
                  style={{ backgroundColor: settings.navHoverColor }}
                  className="absolute top-2 -right-2 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                >
                  0
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* 🚨 Mobile Search Bar Dropdown (एनिमेसनसहित खुल्ने) */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileSearchOpen ? "max-h-24 opacity-100 pb-4" : "max-h-0 opacity-0 pb-0"}`}
        >
          <div className="px-4">
            <div className="relative w-full">
              <input
                style={{ backgroundColor: settings.searchBarBgColor }}
                type="text"
                placeholder="Search masterpieces..."
                className="w-full border-transparent focus:bg-white border focus:border-orange-500 rounded-full px-12 py-3 text-sm outline-none shadow-inner transition-all"
              />
              <Search
                className="absolute left-4 top-3 text-stone-400"
                size={20}
              />
            </div>
          </div>
        </div>

        {/* 3. Navigation Links (Menu) */}
        <div
          style={{ backgroundColor: settings.navBgColor }}
          className="overflow-x-auto hide-scrollbar"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className={`flex py-4 ${navAlign}`}>
              <ul className="flex space-x-6 md:space-x-10 whitespace-nowrap">
                {safeNavLinks.map((link: any, i: number) => (
                  <li key={i}>
                    <Link
                      href={link.link || "#"}
                      style={{ color: settings.navTextColor }}
                      className="text-[12px] md:text-[13px] font-bold uppercase tracking-widest hover:opacity-70 transition-all pb-1 border-b-2 border-transparent hover:border-orange-500"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>
    </div>
  );
}
