"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import {
  CheckCircle2,
  AlertCircle,
  Upload,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

export default function FooterSettingsPage() {
  const [settings, setSettings] = useState<any>({
    shopDescription: "",
    address: "",
    phone: "",
    email: "",
    copyrightText: "",
    columns: [],
    socialLinks: [],
    paymentLogos: [],
    footerBgColor: "#1c1917",
    textColor: "#d6d3d1",
    logoUrl: "",
    logoWidth: 150,
    headingFontSize: "12px",
    contentFontSize: "14px",
  });

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetch("http://localhost:8080/footer-settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setSettings(data);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const showNotification = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:8080/footer-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok)
        showNotification("success", "✅ Advanced Footer Settings saved!");
      else showNotification("error", "❌ Failed to save settings.");
    } catch (err) {
      showNotification("error", "❌ Server connection failed.");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setSettings({ ...settings, logoUrl: reader.result });
    reader.readAsDataURL(file);
  };

  const handlePaymentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSettings({
        ...settings,
        paymentLogos: [
          ...(settings.paymentLogos || []),
          { name: file.name, imageUrl: reader.result },
        ],
      });
    };
    reader.readAsDataURL(file);
  };

  // 🚨 सबै Array हरूलाई सुरक्षित गर्ने
  const safeColumns = Array.isArray(settings.columns) ? settings.columns : [];
  const safeSocials = Array.isArray(settings.socialLinks)
    ? settings.socialLinks
    : [];
  const safePayments = Array.isArray(settings.paymentLogos)
    ? settings.paymentLogos
    : [];

  return (
    <div className="min-h-screen bg-[#Fdfcf9] flex">
      <Sidebar activePage="Footer Settings" />

      <main className="flex-1 md:pl-[240px] p-4 md:p-8 relative pb-32">
        {notification && (
          <div
            className={`fixed bottom-10 right-10 z-[999] px-6 py-4 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-3 ${notification.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 size={24} />
            ) : (
              <AlertCircle size={24} />
            )}
            {notification.text}
          </div>
        )}

        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-serif font-extrabold text-stone-900">
              Footer Customizer
            </h1>
            <button
              onClick={handleSave}
              className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 shadow-lg transition-all"
            >
              Save Changes
            </button>
          </div>

          <div className="space-y-8">
            {/* 1. Design & Branding */}
            <section className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <h2 className="text-lg font-bold mb-6 text-stone-800 border-b pb-2">
                1. Design & Branding
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Logo Upload */}
                <div className="col-span-1 border-r pr-6">
                  <label className="block text-xs font-bold text-stone-500 mb-2 uppercase">
                    Footer Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {settings.logoUrl ? (
                      <div className="relative group">
                        <img
                          src={settings.logoUrl}
                          className="h-16 object-contain bg-stone-100 rounded-lg p-2"
                        />
                        <button
                          onClick={() =>
                            setSettings({ ...settings, logoUrl: "" })
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ) : (
                      <label className="h-16 w-full border-2 border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 text-stone-400">
                        <ImageIcon size={20} />
                        <span className="text-xs mt-1">Upload Logo</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleLogoUpload}
                        />
                      </label>
                    )}
                  </div>
                  {settings.logoUrl && (
                    <div className="mt-4">
                      {/* 🚨 FIXED: logoWidth लाई null हुन नदिने ( || 150 राखियो) */}
                      <label className="block text-xs font-bold text-stone-500 mb-1">
                        Logo Size ({settings.logoWidth || 150}px)
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="300"
                        value={settings.logoWidth || 150}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            logoWidth: Number(e.target.value),
                          })
                        }
                        className="w-full accent-orange-500"
                      />
                    </div>
                  )}
                </div>

                {/* Colors */}
                <div className="col-span-1 space-y-4 pr-6 border-r">
                  <div>
                    {/* 🚨 FIXED: Colors लाई null हुन नदिने */}
                    <label className="block text-xs font-bold text-stone-500 mb-2 uppercase">
                      Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.footerBgColor || "#1c1917"}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            footerBgColor: e.target.value,
                          })
                        }
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.footerBgColor || "#1c1917"}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            footerBgColor: e.target.value,
                          })
                        }
                        className="bg-stone-50 border p-2 rounded-lg text-sm w-full outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-2 uppercase">
                      Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.textColor || "#d6d3d1"}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            textColor: e.target.value,
                          })
                        }
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.textColor || "#d6d3d1"}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            textColor: e.target.value,
                          })
                        }
                        className="bg-stone-50 border p-2 rounded-lg text-sm w-full outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Typography */}
                <div className="col-span-1 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-2 uppercase">
                      Heading Size
                    </label>
                    <select
                      value={settings.headingFontSize || "12px"}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          headingFontSize: e.target.value,
                        })
                      }
                      className="w-full bg-stone-50 border p-2 rounded-lg text-sm outline-none"
                    >
                      <option value="10px">10px (Very Small)</option>
                      <option value="12px">12px (Small)</option>
                      <option value="14px">14px (Medium)</option>
                      <option value="16px">16px (Large)</option>
                      <option value="20px">20px (Extra Large)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-2 uppercase">
                      Content Text Size
                    </label>
                    <select
                      value={settings.contentFontSize || "14px"}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contentFontSize: e.target.value,
                        })
                      }
                      className="w-full bg-stone-50 border p-2 rounded-lg text-sm outline-none"
                    >
                      <option value="12px">12px (Small)</option>
                      <option value="14px">14px (Standard)</option>
                      <option value="16px">16px (Large)</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Shop Info */}
            <section className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <h2 className="text-lg font-bold mb-6 text-stone-800 border-b pb-2">
                2. Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 🚨 FIXED: Text fields लाई null हुन नदिने */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-stone-500 mb-2 uppercase">
                    Short Description
                  </label>
                  <textarea
                    className="w-full bg-stone-50 border p-3 rounded-xl outline-none focus:border-orange-500"
                    rows={2}
                    value={settings.shopDescription || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        shopDescription: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-2 uppercase">
                    Address
                  </label>
                  <input
                    className="w-full bg-stone-50 border p-3 rounded-xl outline-none"
                    value={settings.address || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, address: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-2 uppercase">
                    Phone Number
                  </label>
                  <input
                    className="w-full bg-stone-50 border p-3 rounded-xl outline-none"
                    value={settings.phone || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-2 uppercase">
                    Email Address
                  </label>
                  <input
                    className="w-full bg-stone-50 border p-3 rounded-xl outline-none"
                    value={settings.email || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-2 uppercase">
                    Copyright Text
                  </label>
                  <input
                    className="w-full bg-stone-50 border p-3 rounded-xl outline-none"
                    value={settings.copyrightText || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        copyrightText: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </section>

            {/* 3. Dynamic Columns */}
            <section className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h2 className="text-lg font-bold text-stone-800">
                  3. Footer Menus / Columns
                </h2>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      columns: [
                        ...safeColumns,
                        { title: "New Column", links: [] },
                      ],
                    })
                  }
                  className="text-xs bg-stone-900 text-white px-4 py-2 rounded-lg font-bold uppercase"
                >
                  + Add Column
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {safeColumns.map((col: any, colIdx: number) => (
                  <div
                    key={colIdx}
                    className="bg-stone-50 p-4 rounded-2xl border border-stone-100 relative"
                  >
                    <button
                      onClick={() =>
                        setSettings({
                          ...settings,
                          columns: safeColumns.filter(
                            (_: any, i: number) => i !== colIdx,
                          ),
                        })
                      }
                      className="absolute top-4 right-4 text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                    <input
                      className="bg-transparent text-lg font-bold text-stone-800 outline-none mb-4 w-4/5 border-b border-stone-200 focus:border-orange-500"
                      value={col.title || ""}
                      onChange={(e) => {
                        const newCols = [...safeColumns];
                        newCols[colIdx].title = e.target.value;
                        setSettings({ ...settings, columns: newCols });
                      }}
                    />
                    <div className="space-y-3">
                      {(col.links || []).map((link: any, linkIdx: number) => (
                        <div key={linkIdx} className="flex gap-2">
                          <input
                            placeholder="Label"
                            className="flex-1 bg-white border p-2 rounded-lg text-sm"
                            value={link.label || ""}
                            onChange={(e) => {
                              const newCols = [...safeColumns];
                              newCols[colIdx].links[linkIdx].label =
                                e.target.value;
                              setSettings({ ...settings, columns: newCols });
                            }}
                          />
                          <input
                            placeholder="URL"
                            className="flex-1 bg-white border p-2 rounded-lg text-sm"
                            value={link.url || ""}
                            onChange={(e) => {
                              const newCols = [...safeColumns];
                              newCols[colIdx].links[linkIdx].url =
                                e.target.value;
                              setSettings({ ...settings, columns: newCols });
                            }}
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newCols = [...safeColumns];
                          if (!newCols[colIdx].links)
                            newCols[colIdx].links = [];
                          newCols[colIdx].links.push({ label: "", url: "" });
                          setSettings({ ...settings, columns: newCols });
                        }}
                        className="text-[10px] font-bold text-orange-600 uppercase mt-2"
                      >
                        + Add Link
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Social & Payments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                <div className="flex justify-between mb-4 border-b pb-2">
                  <h2 className="text-lg font-bold text-stone-800">
                    4. Social Links
                  </h2>
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        socialLinks: [
                          ...safeSocials,
                          { platform: "Facebook", url: "" },
                        ],
                      })
                    }
                    className="text-[10px] bg-stone-100 px-3 py-1 rounded-md font-bold"
                  >
                    + ADD
                  </button>
                </div>
                <div className="space-y-3">
                  {safeSocials.map((s: any, i: number) => (
                    <div key={i} className="flex gap-2">
                      <select
                        className="bg-stone-50 border p-2 rounded-lg text-sm"
                        value={s.platform || "Facebook"}
                        onChange={(e) => {
                          const newS = [...safeSocials];
                          newS[i].platform = e.target.value;
                          setSettings({ ...settings, socialLinks: newS });
                        }}
                      >
                        <option>Facebook</option>
                        <option>Instagram</option>
                        <option>TikTok</option>
                        <option>LinkedIn</option>
                        <option>Pinterest</option>
                      </select>
                      <input
                        className="flex-1 bg-stone-50 border p-2 rounded-lg text-sm"
                        placeholder="URL"
                        value={s.url || ""}
                        onChange={(e) => {
                          const newS = [...safeSocials];
                          newS[i].url = e.target.value;
                          setSettings({ ...settings, socialLinks: newS });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                <h2 className="text-lg font-bold mb-4 border-b pb-2 text-stone-800">
                  5. Payment Logos
                </h2>
                <div className="flex flex-wrap gap-3 mb-4">
                  {safePayments.map((p: any, i: number) => (
                    <div key={i} className="relative group">
                      <img
                        src={p.imageUrl}
                        className="h-10 w-16 object-contain border rounded p-1 bg-stone-50"
                      />
                      <button
                        onClick={() =>
                          setSettings({
                            ...settings,
                            paymentLogos: safePayments.filter(
                              (_: any, idx: number) => idx !== i,
                            ),
                          })
                        }
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="h-10 w-16 border-2 border-dashed border-stone-300 rounded flex items-center justify-center cursor-pointer hover:border-orange-500 text-stone-400">
                    <Upload size={16} />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePaymentUpload}
                    />
                  </label>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
