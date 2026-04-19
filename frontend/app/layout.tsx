import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YEEJUNCRAFTS",
  description: "Handcrafted goods from YEEJUNCRAFTS.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let headerSettings = null;
  let footerSettings = null;

  try {
    // 🚨 MAGIC FIX: 127.0.0.1 प्रयोग गरेर दुवै डाटा एकैचोटि तान्ने
    const [headerRes, footerRes] = await Promise.all([
      fetch("http://127.0.0.1:8080/header-settings", { cache: "no-store" }),
      fetch("http://127.0.0.1:8080/footer-settings", { cache: "no-store" }),
    ]);

    if (headerRes.ok) {
      const hData = await headerRes.json();
      if (!hData.error) headerSettings = hData;
    }
    if (footerRes.ok) {
      const fData = await footerRes.json();
      if (!fData.error) footerSettings = fData;
    }
  } catch (err) {
    console.error("Failed to fetch settings at layout:", err);
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* 🚨 दुवै सेटिङहरू ClientLayout लाई पठाउने */}
        <ClientLayout
          headerSettings={headerSettings}
          footerSettings={footerSettings}
        >
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
