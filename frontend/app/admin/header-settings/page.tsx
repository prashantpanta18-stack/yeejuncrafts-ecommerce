"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import { UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";

export default function HeaderSettingsPage() {
  const [settings, setSettings] = useState<any>({
    topBarText: "",
    topBarFontSize: "12px",
    topBarBgColor: "#ea580c",
    topBarTextColor: "#ffffff",
    topBarAlignment: "center", // 🚨 नयाँ
    logoUrl: "",
    logoWidth: 150,
    topBarSpeed: 15,
    logoHeight: 50,
    headerBgColor: "#ffffff",
    searchBarBgColor: "#f5f5f4",
    navBgColor: "transparent", // 🚨 नयाँ
    navAlignment: "center",
    navTextColor: "#1c1917",
    navHoverColor: "#ea580c",
    navLinks: [],
  });

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8080/header-settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error)
          setSettings((prev: any) => ({ ...prev, ...data }));
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const showNotification = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showNotification("error", "Image is too large! Please upload under 5MB.");
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange("logoUrl", reader.result as string);
      setIsUploading(false);
      showNotification(
        "success",
        "Logo uploaded temporarily. Click Save to apply.",
      );
    };
    reader.readAsDataURL(file);
  };

  const handleLinkChange = (index: number, field: string, value: string) => {
    const newLinks = [...(settings.navLinks || [])];
    newLinks[index][field] = value;
    handleChange("navLinks", newLinks);
  };

  const addLink = () =>
    handleChange("navLinks", [
      ...(settings.navLinks || []),
      { name: "", link: "" },
    ]);

  const removeLink = (index: number) => {
    const newLinks = (settings.navLinks || []).filter(
      (_: any, i: number) => i !== index,
    );
    handleChange("navLinks", newLinks);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...settings,
        logoWidth: parseInt(settings.logoWidth) || 150,
        logoHeight: parseInt(settings.logoHeight) || 50,
        topBarSpeed: parseInt(settings.topBarSpeed) || 15,
      };

      const res = await fetch("http://localhost:8080/header-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && !data.error) {
        showNotification("success", "✅ Header settings updated perfectly!");
      } else {
        showNotification("error", `❌ Failed to save: ${data.error}`);
      }
    } catch (err) {
      showNotification("error", "❌ Server connection failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#Fdfcf9] flex">
      <Sidebar activePage="Header Settings" />

      <main className="flex-1 md:pl-[240px] p-4 md:p-8 relative pb-32">
        {notification && (
          <div
            className={`fixed bottom-10 right-10 z-[99999] px-6 py-4 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-3 transition-all animate-fadeIn ${
              notification.type === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 size={24} />
            ) : (
              <AlertCircle size={24} />
            )}
            {notification.text}
          </div>
        )}

        <div className="max-w-4xl mx-auto animate-fadeIn relative">
          <h1 className="text-3xl font-serif font-extrabold text-stone-900 mb-8">
            Customize Store Header
          </h1>

          <div className="space-y-8 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-stone-200">
            {/* 1. Top Bar Settings */}
            <section>
              <h2 className="text-lg font-bold border-b border-stone-100 pb-3 mb-5 text-stone-800">
                1. Top Bar (Marquee)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    Marquee Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Free Shipping | 100% Warranty"
                    className="w-full bg-stone-50 border border-stone-200 focus:bg-white focus:border-orange-500 p-3 rounded-xl outline-none"
                    value={settings.topBarText ?? ""}
                    onChange={(e) => handleChange("topBarText", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    Top Bar Alignment
                  </label>
                  <select
                    className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl outline-none font-bold text-stone-700"
                    value={settings.topBarAlignment || "center"}
                    onChange={(e) =>
                      handleChange("topBarAlignment", e.target.value)
                    }
                  >
                    <option value="left">Left Aligned</option>
                    <option value="center">Center Aligned</option>
                    <option value="right">Right Aligned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    Background Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      className="h-12 w-12 rounded-xl cursor-pointer border-0 p-0"
                      value={settings.topBarBgColor ?? "#ea580c"}
                      onChange={(e) =>
                        handleChange("topBarBgColor", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      className="flex-1 bg-stone-50 border border-stone-200 p-3 rounded-xl outline-none uppercase"
                      value={settings.topBarBgColor ?? ""}
                      onChange={(e) =>
                        handleChange("topBarBgColor", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    Text Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      className="h-12 w-12 rounded-xl cursor-pointer border-0 p-0"
                      value={settings.topBarTextColor ?? "#ffffff"}
                      onChange={(e) =>
                        handleChange("topBarTextColor", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      className="flex-1 bg-stone-50 border border-stone-200 p-3 rounded-xl outline-none uppercase"
                      value={settings.topBarTextColor ?? ""}
                      onChange={(e) =>
                        handleChange("topBarTextColor", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Logo & Main Header */}
            <section>
              <h2 className="text-lg font-bold border-b border-stone-100 pb-3 mb-5 text-stone-800">
                2. Logo & Main Header
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    Upload Logo (Drag & Drop or Click)
                  </label>
                  <div className="relative border-2 border-dashed border-stone-300 hover:border-orange-500 hover:bg-orange-50/50 transition-all rounded-2xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer overflow-hidden min-h-[140px] bg-stone-50/50">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {isUploading ? (
                      <span className="text-orange-600 font-bold animate-pulse">
                        Uploading...
                      </span>
                    ) : settings.logoUrl ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={settings.logoUrl}
                          alt="Logo Preview"
                          className="max-h-20 object-contain mb-3"
                        />
                        <span className="text-[10px] bg-stone-900 text-white px-3 py-1 rounded-full uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          Change Logo
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-stone-400 group-hover:text-orange-500 transition-colors">
                        <UploadCloud size={32} className="mb-2" />
                        <span className="font-bold text-sm">
                          Drag your image here
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    Logo Width Display (px)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-stone-50 border border-stone-200 focus:bg-white focus:border-orange-500 p-3 rounded-xl outline-none"
                    value={settings.logoWidth ?? 150}
                    onChange={(e) => handleChange("logoWidth", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    Header Background Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      className="h-12 w-12 rounded-xl cursor-pointer border-0 p-0"
                      value={settings.headerBgColor ?? "#ffffff"}
                      onChange={(e) =>
                        handleChange("headerBgColor", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      className="flex-1 bg-stone-50 border border-stone-200 p-3 rounded-xl outline-none uppercase"
                      value={settings.headerBgColor ?? ""}
                      onChange={(e) =>
                        handleChange("headerBgColor", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Navigation Links */}
            <section>
              <div className="flex justify-between items-center border-b border-stone-100 pb-3 mb-5">
                <h2 className="text-lg font-bold text-stone-800">
                  3. Navigation Links (SEO)
                </h2>
                <button
                  onClick={addLink}
                  className="text-xs bg-stone-900 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-bold uppercase tracking-widest shadow-sm"
                >
                  + Add Link
                </button>
              </div>

              {/* 🚨 FIXED: Nav Background र अरू कलरमा पनि Hex Text Box थपियो */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    Nav Alignment
                  </label>
                  <select
                    className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl outline-none font-bold text-stone-700"
                    value={settings.navAlignment || "center"}
                    onChange={(e) =>
                      handleChange("navAlignment", e.target.value)
                    }
                  >
                    <option value="left">Left Aligned</option>
                    <option value="center">Center Aligned</option>
                    <option value="right">Right Aligned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    Nav Background
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      className="h-12 w-12 rounded-xl cursor-pointer border-0 p-0"
                      value={settings.navBgColor ?? "#ffffff"}
                      onChange={(e) =>
                        handleChange("navBgColor", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      className="flex-1 w-full bg-stone-50 border border-stone-200 p-3 rounded-xl outline-none uppercase text-xs"
                      value={settings.navBgColor ?? ""}
                      onChange={(e) =>
                        handleChange("navBgColor", e.target.value)
                      }
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    Nav Text Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      className="h-12 w-12 rounded-xl cursor-pointer border-0 p-0"
                      value={settings.navTextColor ?? "#1c1917"}
                      onChange={(e) =>
                        handleChange("navTextColor", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      className="flex-1 w-full bg-stone-50 border border-stone-200 p-3 rounded-xl outline-none uppercase text-xs"
                      value={settings.navTextColor ?? ""}
                      onChange={(e) =>
                        handleChange("navTextColor", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    Hover Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      className="h-12 w-12 rounded-xl cursor-pointer border-0 p-0"
                      value={settings.navHoverColor ?? "#ea580c"}
                      onChange={(e) =>
                        handleChange("navHoverColor", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      className="flex-1 w-full bg-stone-50 border border-stone-200 p-3 rounded-xl outline-none uppercase text-xs"
                      value={settings.navHoverColor ?? ""}
                      onChange={(e) =>
                        handleChange("navHoverColor", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {(!settings.navLinks || settings.navLinks.length === 0) && (
                  <p className="text-sm text-stone-400 italic text-center py-4 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                    No links added. Default links will show.
                  </p>
                )}
                {(settings.navLinks || []).map((link: any, index: number) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row gap-3 items-center bg-stone-50 p-3 rounded-xl border border-stone-200 shadow-sm"
                  >
                    <input
                      type="text"
                      placeholder="Link Name"
                      className="flex-1 w-full border-none bg-white p-3 rounded-lg text-sm font-bold shadow-inner outline-none"
                      value={link.name ?? ""}
                      onChange={(e) =>
                        handleLinkChange(index, "name", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      placeholder="URL"
                      className="flex-1 w-full border-none bg-white p-3 rounded-lg text-sm shadow-inner outline-none"
                      value={link.link ?? ""}
                      onChange={(e) =>
                        handleLinkChange(index, "link", e.target.value)
                      }
                    />
                    <button
                      onClick={() => removeLink(index)}
                      className="text-red-500 font-bold p-3 hover:bg-red-100 rounded-lg w-full md:w-auto"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-10 rounded-2xl shadow-xl transition-all uppercase tracking-widest"
            >
              Save Header Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
