"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/admin/Sidebar";
import {
  Save,
  ImageIcon,
  PaintBucket,
  UploadCloud,
  CheckCircle2,
} from "lucide-react";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [settings, setSettings] = useState({
    shopAvatar:
      "https://images.unsplash.com/photo-1509211929311-66df989a31a5?w=200&q=80",
    bgType: "image",
    bgValue: "https://www.transparenttextures.com/patterns/rice-paper-2.png",
    accentColor: "#1e3a8a", // नयाँ: बटन र आइकनको लागि थिम कलर
  });

  useEffect(() => {
    const saved = localStorage.getItem("adminSettings");
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    localStorage.setItem("adminSettings", JSON.stringify(settings));
    // थिमलाई ग्लोबल बनाउन एउटा कस्टम इभेन्ट ट्रिगर गर्ने
    window.dispatchEvent(new Event("storage"));

    setTimeout(() => {
      setIsLoading(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  const handleFileUpload = (file: File, target: "shopAvatar" | "bgValue") => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setSettings((prev) => ({ ...prev, [target]: url }));
    }
  };

  const getPreviewStyle = () => {
    return settings.bgType === "image"
      ? {
          backgroundImage: `url('${settings.bgValue}')`,
          backgroundColor: "#f5f5f5",
        }
      : { backgroundColor: settings.bgValue };
  };

  return (
    <div
      className="flex min-h-screen font-sans text-stone-900 overflow-x-hidden"
      style={getPreviewStyle()}
    >
      <Sidebar activePage="Settings" />

      <div className="flex-1 ml-64 p-10 min-h-screen transition-all duration-500">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-4xl font-serif text-stone-900 font-bold">
                Admin Theme Settings
              </h1>
              <p className="text-stone-600 mt-2">
                Manage global appearance across all dashboard components.
              </p>
            </div>
            {saveSuccess && (
              <div className="flex items-center gap-2 text-green-600 font-bold animate-bounce bg-white px-4 py-2 rounded-full shadow-sm border border-green-100">
                <CheckCircle2 size={20} /> Changes Applied Globally!
              </div>
            )}
          </div>

          <form
            onSubmit={handleSave}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* --- Shop Avatar Drag & Drop --- */}
            <div className="bg-white/80 backdrop-blur-md border border-stone-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ImageIcon size={18} /> Shop Logo
              </h2>
              <div
                className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:bg-stone-50 transition-colors cursor-pointer group"
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileUpload(e.dataTransfer.files[0], "shopAvatar");
                }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById("avatarInput")?.click()}
              >
                <img
                  src={settings.shopAvatar}
                  className="w-24 h-24 mx-auto mb-4 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform"
                />
                <UploadCloud className="mx-auto text-stone-400 mb-2" />
                <p className="text-xs font-bold text-stone-500 uppercase">
                  Drop logo here
                </p>
                <input
                  id="avatarInput"
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files &&
                    handleFileUpload(e.target.files[0], "shopAvatar")
                  }
                />
              </div>
            </div>

            {/* --- Background Drag & Drop --- */}
            <div className="bg-white/80 backdrop-blur-md border border-stone-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <PaintBucket size={18} /> Background Texture
              </h2>
              <div
                className={`border-2 border-dashed border-stone-300 rounded-xl p-6 text-center transition-all cursor-pointer h-44 flex flex-col justify-center ${settings.bgType === "color" ? "opacity-40 pointer-events-none" : "hover:bg-stone-50"}`}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileUpload(e.dataTransfer.files[0], "bgValue");
                }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById("bgInput")?.click()}
                style={
                  settings.bgType === "image"
                    ? {
                        backgroundImage: `url('${settings.bgValue}')`,
                        backgroundSize: "cover",
                      }
                    : {}
                }
              >
                {!settings.bgValue && (
                  <UploadCloud className="mx-auto text-stone-400 mb-2" />
                )}
                <p className="text-xs font-bold text-stone-800 bg-white/60 backdrop-blur-sm inline-block px-2 py-1 rounded mx-auto">
                  {settings.bgType === "image"
                    ? "DROP BACKGROUND TEXTURE"
                    : "SWITCH TO IMAGE MODE"}
                </p>
                <input
                  id="bgInput"
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files &&
                    handleFileUpload(e.target.files[0], "bgValue")
                  }
                />
              </div>
            </div>

            {/* --- Color & Global Controls --- */}
            <div className="md:col-span-2 bg-white/90 backdrop-blur-md border border-stone-200 rounded-2xl p-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-3">
                    Background Type
                  </label>
                  <select
                    value={settings.bgType}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bgType: e.target.value as any,
                      })
                    }
                    className="w-full border-stone-200 rounded-lg p-3 font-bold text-stone-700 focus:ring-2 focus:ring-stone-900 outline-none shadow-inner"
                  >
                    <option value="image">Texture Image</option>
                    <option value="color">Solid Background Color</option>
                  </select>
                </div>

                {settings.bgType === "color" && (
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-3">
                      Pick Background Color
                    </label>
                    <div className="flex gap-4 items-center">
                      <input
                        type="color"
                        value={settings.bgValue}
                        onChange={(e) =>
                          setSettings({ ...settings, bgValue: e.target.value })
                        }
                        className="w-14 h-14 rounded-xl cursor-pointer border-none p-0 shadow-md"
                      />
                      <span className="font-mono font-bold text-stone-500 uppercase">
                        {settings.bgValue}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-stone-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-stone-800 transition-all hover:shadow-lg active:scale-95"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Save size={20} /> APPLY THEME GLOBALLY
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
