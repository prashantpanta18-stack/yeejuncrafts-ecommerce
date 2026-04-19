"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Home,
  Tag,
  MessageSquare,
  Package,
  BarChart2,
  PieChart,
  HeadphonesIcon,
  Megaphone,
  CreditCard,
  Settings,
  Palette,
  ChevronDown,
  ChevronRight,
  PanelTop,
  PanelBottom,
  LayoutTemplate,
} from "lucide-react";

export default function Sidebar({ activePage }: { activePage: string }) {
  const pathname = usePathname();

  // 🚨 FIXED: सुरुमा सधैँ बन्द हुने, क्लिक गरेपछि मात्र खुल्ने
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);

  return (
    <div className="w-64 bg-white border-r border-stone-200 flex flex-col fixed h-full z-10 top-0 left-0">
      <div className="p-4 flex items-center gap-2 border-b border-stone-100">
        <span className="font-bold text-xl text-stone-800">Shop Manager</span>
      </div>

      <div className="overflow-y-auto flex-1 py-4 px-3 space-y-1 hide-scrollbar">
        <div className="relative mb-4 px-2">
          <Search className="absolute left-4 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-stone-100 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-200"
          />
        </div>

        <Link href="/admin">
          <SidebarItem
            icon={<Home size={18} />}
            label="Dashboard"
            active={activePage === "Dashboard"}
          />
        </Link>
        <Link href="/admin/listings">
          <SidebarItem
            icon={<Tag size={18} />}
            label="Listings"
            active={activePage === "Listings"}
          />
        </Link>
        <SidebarItem
          icon={<MessageSquare size={18} />}
          label="Messages"
          active={activePage === "Messages"}
        />
        <SidebarItem
          icon={<Package size={18} />}
          label="Orders"
          active={activePage === "Orders"}
        />
        <SidebarItem
          icon={<BarChart2 size={18} />}
          label="Search visibility"
          active={activePage === "Search visibility"}
        />

        <div className="pt-4 pb-2 px-3">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Stats & Marketing
          </span>
        </div>
        <SidebarItem
          icon={<PieChart size={18} />}
          label="Stats"
          active={activePage === "Stats"}
        />
        <SidebarItem
          icon={<HeadphonesIcon size={18} />}
          label="Customer service stats"
          active={activePage === "Customer service stats"}
        />
        <SidebarItem
          icon={<Megaphone size={18} />}
          label="Marketing"
          active={activePage === "Marketing"}
        />
        <SidebarItem
          icon={<CreditCard size={18} />}
          label="Finances"
          badge="3"
          active={activePage === "Finances"}
        />

        <div className="pt-4 pb-2 px-3">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Storefront
          </span>
        </div>

        {/* 🚨 APPEARANCE DROPDOWN (Manual Toggle Only) */}
        <div className="px-1">
          <div
            onClick={() => setIsAppearanceOpen(!isAppearanceOpen)}
            className={`flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer transition-colors ${isAppearanceOpen || pathname?.includes("/admin/header-settings") || pathname?.includes("/admin/footer-settings") || pathname?.includes("/admin/home-settings") ? "bg-stone-100 text-stone-900 font-bold" : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"}`}
          >
            <div className="flex items-center gap-3 text-sm">
              <Palette
                size={18}
                className={
                  isAppearanceOpen ? "text-stone-900" : "text-stone-500"
                }
              />
              Appearance
            </div>
            {isAppearanceOpen ? (
              <ChevronDown size={16} className="text-stone-500" />
            ) : (
              <ChevronRight size={16} className="text-stone-400" />
            )}
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${isAppearanceOpen ? "max-h-64 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
          >
            <div className="pl-8 pr-2 py-1 space-y-1 border-l-2 border-stone-100 ml-4">
              <Link href="/admin/header-settings">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${pathname === "/admin/header-settings" ? "text-orange-600 font-bold bg-orange-50" : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"}`}
                >
                  <PanelTop size={14} /> Header
                </div>
              </Link>
              <Link href="/admin/footer-settings">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${pathname === "/admin/footer-settings" ? "text-orange-600 font-bold bg-orange-50" : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"}`}
                >
                  <PanelBottom size={14} /> Footer
                </div>
              </Link>
              <Link href="/admin/home-settings">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${pathname === "/admin/home-settings" ? "text-orange-600 font-bold bg-orange-50" : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"}`}
                >
                  <LayoutTemplate size={14} /> Home Page
                </div>
              </Link>
            </div>
          </div>
        </div>
        {/* 🚨 END APPEARANCE */}

        <Link href="/admin/settings">
          <SidebarItem
            icon={<Settings size={18} />}
            label="Settings"
            active={activePage === "Settings"}
          />
        </Link>
      </div>
    </div>
  );
}

// साइडबारको भित्री डिजाइन (तपाईंकै पुरानो Reusable Component)
function SidebarItem({
  icon,
  label,
  active = false,
  badge,
}: {
  icon: any;
  label: string;
  active?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${active ? "bg-stone-100 text-stone-900 font-bold" : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"}`}
    >
      <div className="flex items-center gap-3 text-sm">
        <span className={`${active ? "text-stone-900" : "text-stone-500"}`}>
          {icon}
        </span>
        {label}
      </div>
      {badge && (
        <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </div>
  );
}
