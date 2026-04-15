"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Package, Tag } from "lucide-react";
import Sidebar from "@/components/admin/Sidebar"; // नयाँ साइडबार तानियो

const API_BASE = "http://localhost:8080";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Home");
  const [greeting, setGreeting] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [dashboardData, setDashboardData] = useState({
    ordersOverdue: 0,
    ordersToShip: 0,
    messagesHelp: 0,
    messagesPotential: 0,
    listingsSoldOut: 0,
    listingsExpired: 0,
    totalViews: 0,
    visits: 0,
    ordersStat: 0,
    revenue: 0,
    totalSales: 0,
    activeListings: 0,
    shopAvatar:
      "https://images.unsplash.com/photo-1509211929311-66df989a31a5?w=200&q=80",
    bgType: "image",
    bgValue: "https://www.transparenttextures.com/patterns/rice-paper-2.png",
  });

  useEffect(() => {
    // लोकल स्टोरेजबाट सेटिङ्स तान्ने
    const savedSettings = localStorage.getItem("adminSettings");
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setDashboardData((prev) => ({
        ...prev,
        shopAvatar: parsedSettings.shopAvatar,
        bgType: parsedSettings.bgType,
        bgValue: parsedSettings.bgValue,
      }));
    }

    // एरर आएको ठाउँ: यसलाई useEffect भित्रै राख्नुपर्छ
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 0 && hour < 5) setGreeting("What happened night owl?");
      else if (hour >= 5 && hour < 12) setGreeting("Good morning");
      else if (hour >= 12 && hour < 17) setGreeting("Good afternoon");
      else if (hour >= 17 && hour < 21) setGreeting("Good evening");
      else setGreeting("Good night");
    };

    updateGreeting();

    const fetchDashboardStats = async () => {
      try {
        const ts = new Date().getTime();
        const res = await fetch(`${API_BASE}/dashboard-stats?t=${ts}`, {
          headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setDashboardData((prev) => ({ ...prev, ...data }));
        }
      } catch (error) {
        // Error handling
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
    const interval = setInterval(() => {
      fetchDashboardStats();
      updateGreeting();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getDynamicBackground = () => {
    if (dashboardData.bgType === "image") {
      return {
        backgroundImage: `url('${dashboardData.bgValue}')`,
        backgroundColor: "#FDFBF7",
      };
    } else if (dashboardData.bgType === "color") {
      return { backgroundColor: dashboardData.bgValue };
    }
    return { backgroundColor: "#FDFBF7" };
  };

  return (
    <div className="flex min-h-screen font-sans text-stone-900">
      {/* नयाँ साझा साइडबार कल गरियो */}
      <Sidebar activePage="Dashboard" />

      {/* Main Content */}
      <div
        className="flex-1 ml-64 p-10 min-h-screen transition-all duration-500"
        style={getDynamicBackground()}
      >
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 bg-white/60 p-4 rounded-2xl border border-stone-200/50 backdrop-blur-sm shadow-sm">
            <div className="w-16 h-16 bg-stone-200 rounded-xl overflow-hidden border-2 border-white shadow-md shrink-0">
              <img
                src={dashboardData.shopAvatar}
                alt="Shop Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-serif text-stone-900 mb-1">
                {greeting}
              </h1>
              <div className="flex items-center gap-3 text-sm text-stone-600 font-medium mt-2">
                <span>{dashboardData.totalSales} sales</span>
                <span className="text-stone-300">|</span>
                <span>{dashboardData.activeListings} active listings</span>
              </div>
            </div>
          </div>

          <div className="flex gap-6 border-b border-stone-300/60 mb-8">
            <button
              onClick={() => setActiveTab("Home")}
              className={`pb-3 font-bold text-sm transition-colors relative ${activeTab === "Home" ? "text-stone-900" : "text-stone-500 hover:text-stone-700"}`}
            >
              Home
              {activeTab === "Home" && (
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-stone-900 rounded-t-md"></span>
              )}
            </button>
          </div>

          {activeTab === "Home" && (
            <div className="animate-fadeIn space-y-12">
              <div>
                <h2 className="text-lg font-bold text-stone-950 mb-4">
                  Top tasks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TaskCard
                    icon={<Package size={20} />}
                    title="Orders"
                    detail1={`${dashboardData.ordersOverdue} overdue orders`}
                    detail2={`${dashboardData.ordersToShip} orders to ship today`}
                  />
                  <TaskCard
                    icon={<MessageSquare size={20} />}
                    title="Messages"
                    detail1={`${dashboardData.messagesHelp} help requests`}
                    detail2={`${dashboardData.messagesPotential} potential buyers reaching out`}
                  />
                  <TaskCard
                    icon={<Tag size={20} />}
                    title="Listings"
                    detail1={`${dashboardData.listingsSoldOut} items sold out`}
                    detail2={`${dashboardData.listingsExpired} listings expired`}
                  />
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-stone-950 mb-4">Stats</h2>
                <div className="bg-white/80 border border-stone-200 p-6 rounded-xl shadow-sm backdrop-blur-sm">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-stone-100">
                    <StatItem
                      title="Total Views"
                      value={dashboardData.totalViews}
                      time="5 hours ago"
                    />
                    <StatItem
                      title="Visits"
                      value={dashboardData.visits}
                      time="5 hours ago"
                    />
                    <StatItem
                      title="Orders"
                      value={dashboardData.ordersStat}
                      time="Just now"
                    />
                    <StatItem
                      title="Revenue"
                      value={`$${dashboardData.revenue}`}
                      time="Just now"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskCard({
  icon,
  title,
  detail1,
  detail2,
}: {
  icon: any;
  title: string;
  detail1: string;
  detail2: string;
}) {
  return (
    <div className="bg-white/80 border border-stone-200 p-5 rounded-xl hover:shadow-md transition-shadow cursor-pointer backdrop-blur-sm">
      <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2 text-base">
        <span className="text-stone-500">{icon}</span> {title}
      </h3>
      <p className="text-sm text-stone-600 mb-2">{detail1}</p>
      <p className="text-sm text-stone-600">{detail2}</p>
    </div>
  );
}

function StatItem({
  title,
  value,
  time,
}: {
  title: string;
  value: string | number;
  time: string;
}) {
  return (
    <div className="pl-6 first:pl-0 border-l-0 first:border-l-0">
      <p className="text-sm text-stone-600 mb-2">{title}</p>
      <p className="text-3xl font-bold text-stone-900 mb-2">{value}</p>
      <p className="text-[11px] text-stone-400 mt-1">🕒 {time}</p>
    </div>
  );
}
