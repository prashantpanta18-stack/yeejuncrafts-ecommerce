import Link from "next/link";
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
} from "lucide-react";

// यसले कुन पेज active छ भनेर थाहा पाउँछ
export default function Sidebar({ activePage }: { activePage: string }) {
  return (
    <div className="w-64 bg-white border-r border-stone-200 flex flex-col fixed h-full z-10 top-0 left-0">
      <div className="p-4 flex items-center gap-2 border-b border-stone-100">
        <span className="font-bold text-xl text-stone-800">Shop Manager</span>
      </div>

      <div className="overflow-y-auto flex-1 py-4 px-3 space-y-1">
        <div className="relative mb-4 px-2">
          <Search className="absolute left-4 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-stone-100 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <Link href="/admin">
          <SidebarItem
            icon={<Home size={18} />}
            label="Dashboard"
            active={activePage === "Dashboard"}
          />
        </Link>
        <SidebarItem
          icon={<Tag size={18} />}
          label="Listings"
          active={activePage === "Listings"}
        />
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

// साइडबारको भित्री डिजाइन (Reusable)
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
