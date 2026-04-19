"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer"; // 🚨 FIXED: फुटर इम्पोर्ट गरियो!

export default function ClientLayout({
  children,
  headerSettings,
  footerSettings, // 🚨 FIXED: फुटरको डाटा पनि रिसिभ गर्ने
}: {
  children: React.ReactNode;
  headerSettings: any;
  footerSettings: any; // 🚨 FIXED: टाइप थपियो
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  // एडमिन पेजमा हेडर र फुटर नदेखाउने
  if (isAdminPage) {
    return <main className="flex-1 bg-[#Fdfcf9]">{children}</main>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 🚨 हेडर */}
      <Header initialSettings={headerSettings} />

      {/* 🚨 मुख्य कन्टेन्ट */}
      <main className="flex-1">{children}</main>

      {/* 🚨 फुटर (बल्ल यहाँ आएर बस्यो!) */}
      <Footer initialSettings={footerSettings} />
    </div>
  );
}
