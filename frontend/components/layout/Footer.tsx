"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

const socialIcons: any = {
  facebook: <span className="font-bold text-lg px-1">f</span>,
  instagram: <span className="font-bold text-lg">ig</span>,
  tiktok: <span className="font-bold text-lg">𝅘𝅥𝅮</span>,
  linkedin: <span className="font-bold text-lg">in</span>,
  pinterest: <span className="font-bold text-lg">P</span>,
};

export default function Footer({ initialSettings }: { initialSettings?: any }) {
  const defaultData = {
    shopDescription:
      "Handcrafted with love in Nepal. Explore our premium collection.",
    address: "Chitwan, Nepal",
    phone: "+977-9800000000",
    email: "info@yeejuncrafts.com",
    copyrightText: "© 2026 YEEJUNCRAFTS. All rights reserved.",
    footerBgColor: "#1c1917",
    textColor: "#d6d3d1",
    logoUrl: "",
    logoWidth: 150,
    headingFontSize: "12px",
    contentFontSize: "14px",
    columns: [],
    socialLinks: [],
    paymentLogos: [],
  };

  const data = initialSettings || defaultData;

  const parseJSON = (val: any, fallback: any[]) => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch (e) {
        return fallback;
      }
    }
    return fallback;
  };

  const safeColumns = parseJSON(data.columns, defaultData.columns);
  const safeSocials = parseJSON(data.socialLinks, []);
  const safePayments = parseJSON(data.paymentLogos, []);

  const bgColor = data.footerBgColor || defaultData.footerBgColor;
  const textColor = data.textColor || defaultData.textColor;
  const headingSize = data.headingFontSize || defaultData.headingFontSize;
  const contentSize = data.contentFontSize || defaultData.contentFontSize;

  // 🚨 FIXED: यहाँबाट त्यो 'if window === undefined' भन्ने लाइन पूर्ण रूपमा हटाइयो!

  return (
    <footer
      suppressHydrationWarning
      style={{ backgroundColor: bgColor, color: textColor }}
      className="pt-16 pb-8 font-sans mt-auto border-t-[6px] border-orange-600 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* 1. Branding & Contact */}
        <div>
          {data.logoUrl ? (
            <img
              src={data.logoUrl}
              alt="Logo"
              style={{ width: `${data.logoWidth}px`, maxWidth: "100%" }}
              className="mb-6 object-contain"
            />
          ) : (
            <h3 className="text-white text-xl font-serif font-bold mb-6 tracking-wider">
              YEEJUNCRAFTS
            </h3>
          )}

          <p
            style={{ fontSize: contentSize }}
            className="leading-relaxed mb-6 opacity-90"
          >
            {data.shopDescription || defaultData.shopDescription}
          </p>
          <div
            style={{ fontSize: contentSize }}
            className="space-y-3 opacity-90"
          >
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-orange-500 shrink-0" />{" "}
              {data.address || defaultData.address}
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-orange-500 shrink-0" />{" "}
              {data.phone || defaultData.phone}
            </div>
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-orange-500 shrink-0" />{" "}
              {data.email || defaultData.email}
            </div>
          </div>
        </div>

        {/* 2 & 3. Dynamic Columns */}
        {safeColumns.map((col: any, i: number) => (
          <div key={`col-${i}`}>
            <h4
              style={{ fontSize: headingSize, color: "#ffffff" }}
              className="font-bold uppercase tracking-widest mb-6"
            >
              {col?.title || "Links"}
            </h4>
            <ul
              style={{ fontSize: contentSize }}
              className="space-y-4 opacity-90"
            >
              {Array.isArray(col?.links) &&
                col.links.map((link: any, j: number) => (
                  <li key={`link-${j}`}>
                    <Link
                      href={link?.url || "#"}
                      className="hover:text-orange-500 transition-colors"
                    >
                      {link?.label || "Link"}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}

        {/* 4. Social & Payment */}
        <div>
          <h4
            style={{ fontSize: headingSize, color: "#ffffff" }}
            className="font-bold uppercase tracking-widest mb-6"
          >
            Connect With Us
          </h4>
          <div className="flex gap-4 mb-8 items-center">
            {safeSocials.map((social: any, i: number) => (
              <a
                key={`social-${i}`}
                href={social?.url || "#"}
                target="_blank"
                rel="noreferrer"
                className="bg-black/20 w-10 h-10 flex items-center justify-center rounded-full hover:bg-orange-600 hover:text-white transition-all border border-white/10"
              >
                {socialIcons[social?.platform?.toLowerCase() || ""] || (
                  <Mail size={16} />
                )}
              </a>
            ))}
            {safeSocials.length === 0 && (
              <span
                style={{ fontSize: contentSize }}
                className="italic opacity-50"
              >
                No social links
              </span>
            )}
          </div>

          <h4
            style={{ fontSize: headingSize, color: "#ffffff" }}
            className="font-bold uppercase tracking-widest mb-4"
          >
            We Accept
          </h4>
          <div className="flex flex-wrap gap-2">
            {safePayments.map((img: any, i: number) => (
              <img
                key={`payment-${i}`}
                src={img?.imageUrl || ""}
                alt={img?.name || "Payment"}
                className="h-8 rounded bg-white p-1 grayscale hover:grayscale-0 transition-all object-contain"
              />
            ))}
            {safePayments.length === 0 && (
              <span
                style={{ fontSize: contentSize }}
                className="italic opacity-50"
              >
                No payments added
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        style={{ fontSize: "11px" }}
        className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/10 text-center opacity-60 uppercase tracking-widest"
      >
        {data.copyrightText || defaultData.copyrightText}
      </div>
    </footer>
  );
}
