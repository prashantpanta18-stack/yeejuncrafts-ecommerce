"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import {
  CheckCircle2,
  AlertCircle,
  Upload,
  Trash2,
  Plus,
  Image as ImageIcon,
} from "lucide-react";

export default function HomeSettingsPage() {
  const [activeTab, setActiveTab] = useState("hero"); // Tabs: hero, categories, sections, story
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Default Structure based on Prisma Schema
  const [settings, setSettings] = useState<any>({
    heroSlides: [],
    heroSettings: {
      textColor: "#ffffff",
      btnColor: "#ea580c",
      overlayOpacity: 0.5,
    },
    categories: [],
    categorySettings: { shape: "rounded-3xl", btnStyle: "filled" },
    newArrivalsConfig: { show: true, columns: 4, limit: 6 },
    featuredConfig: { show: true, columns: 4, limit: 6 },
    masterpieceConfig: { show: true, columns: 2, limit: 4 },
    storyConfig: { media: "", title: "", text1: "", btnText: "", btnLink: "" },
    blogConfig: { show: true, columns: 3, limit: 3 },
  });

  useEffect(() => {
    fetch("http://localhost:8080/home-settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          // Parsing JSON fields if they come as strings from backend
          const parseJSON = (val: any, fallback: any) =>
            typeof val === "string" ? JSON.parse(val) : val || fallback;
          setSettings({
            heroSlides: parseJSON(data.heroSlides, []),
            heroSettings: parseJSON(data.heroSettings, settings.heroSettings),
            categories: parseJSON(data.categories, []),
            categorySettings: parseJSON(
              data.categorySettings,
              settings.categorySettings,
            ),
            newArrivalsConfig: parseJSON(
              data.newArrivalsConfig,
              settings.newArrivalsConfig,
            ),
            featuredConfig: parseJSON(
              data.featuredConfig,
              settings.featuredConfig,
            ),
            masterpieceConfig: parseJSON(
              data.masterpieceConfig,
              settings.masterpieceConfig,
            ),
            storyConfig: parseJSON(data.storyConfig, settings.storyConfig),
            blogConfig: parseJSON(data.blogConfig, settings.blogConfig),
          });
        }
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const showNotification = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:8080/home-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok)
        showNotification(
          "success",
          "✅ Home Page Settings saved successfully!",
        );
      else showNotification("error", "❌ Failed to save settings.");
    } catch (err) {
      showNotification("error", "❌ Server connection failed.");
    }
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (url: string) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#Fdfcf9] flex">
      <Sidebar activePage="Appearance" />

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
              Home Page Settings
            </h1>
            <button
              onClick={handleSave}
              className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 shadow-lg transition-all"
            >
              Save Changes
            </button>
          </div>

          {/* Tabs Navigation */}
          <div className="flex gap-2 mb-8 border-b border-stone-200 overflow-x-auto hide-scrollbar">
            {["hero", "categories", "sections", "story"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-bold uppercase tracking-widest text-xs transition-colors border-b-2 ${activeTab === tab ? "border-orange-600 text-orange-600" : "border-transparent text-stone-500 hover:text-stone-800"}`}
              >
                {tab.replace("-", " ")}
              </button>
            ))}
          </div>

          {/* TAB 1: HERO SLIDER */}
          {activeTab === "hero" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                <div className="flex justify-between items-center mb-6 border-b pb-2">
                  <h2 className="text-lg font-bold text-stone-800">
                    Hero Slider Images
                  </h2>
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        heroSlides: [
                          ...settings.heroSlides,
                          {
                            image: "",
                            title: "New Slide",
                            subtitle: "",
                            btnText: "Shop Now",
                            btnLink: "/shop",
                          },
                        ],
                      })
                    }
                    className="text-xs bg-stone-900 text-white px-4 py-2 rounded-lg font-bold uppercase"
                  >
                    + Add Slide
                  </button>
                </div>

                <div className="space-y-6">
                  {settings.heroSlides.map((slide: any, index: number) => (
                    <div
                      key={index}
                      className="flex gap-6 bg-stone-50 p-4 rounded-2xl relative border border-stone-100"
                    >
                      <button
                        onClick={() =>
                          setSettings({
                            ...settings,
                            heroSlides: settings.heroSlides.filter(
                              (_: any, i: number) => i !== index,
                            ),
                          })
                        }
                        className="absolute top-4 right-4 text-red-400 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>

                      {/* Image Upload */}
                      <div className="w-40 h-32 flex-shrink-0 relative rounded-xl overflow-hidden bg-stone-200 flex items-center justify-center border border-stone-300">
                        {slide.image ? (
                          <img
                            src={slide.image}
                            alt="Slide"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="text-stone-400" />
                        )}
                        <label className="absolute inset-0 cursor-pointer bg-black/0 hover:bg-black/20 transition-all flex items-center justify-center">
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) =>
                              handleImageUpload(e, (url) => {
                                const newSlides = [...settings.heroSlides];
                                newSlides[index].image = url;
                                setSettings({
                                  ...settings,
                                  heroSlides: newSlides,
                                });
                              })
                            }
                          />
                        </label>
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-3">
                        <input
                          placeholder="Main Title"
                          className="w-full bg-white border p-2 rounded-lg text-sm font-bold"
                          value={slide.title}
                          onChange={(e) => {
                            const newS = [...settings.heroSlides];
                            newS[index].title = e.target.value;
                            setSettings({ ...settings, heroSlides: newS });
                          }}
                        />
                        <input
                          placeholder="Subtitle"
                          className="w-full bg-white border p-2 rounded-lg text-sm"
                          value={slide.subtitle}
                          onChange={(e) => {
                            const newS = [...settings.heroSlides];
                            newS[index].subtitle = e.target.value;
                            setSettings({ ...settings, heroSlides: newS });
                          }}
                        />
                        <div className="flex gap-3">
                          <input
                            placeholder="Button Text"
                            className="flex-1 bg-white border p-2 rounded-lg text-sm"
                            value={slide.btnText}
                            onChange={(e) => {
                              const newS = [...settings.heroSlides];
                              newS[index].btnText = e.target.value;
                              setSettings({ ...settings, heroSlides: newS });
                            }}
                          />
                          <input
                            placeholder="Button Link"
                            className="flex-1 bg-white border p-2 rounded-lg text-sm"
                            value={slide.btnLink}
                            onChange={(e) => {
                              const newS = [...settings.heroSlides];
                              newS[index].btnLink = e.target.value;
                              setSettings({ ...settings, heroSlides: newS });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {settings.heroSlides.length === 0 && (
                    <p className="text-sm text-stone-500 italic">
                      No slides added yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CATEGORIES */}
          {activeTab === "categories" && (
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h2 className="text-lg font-bold text-stone-800">
                  Shop By Category
                </h2>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      categories: [
                        ...settings.categories,
                        { name: "New Category", image: "", link: "/shop" },
                      ],
                    })
                  }
                  className="text-xs bg-stone-900 text-white px-4 py-2 rounded-lg font-bold uppercase"
                >
                  + Add Category
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {settings.categories.map((cat: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-stone-50 p-4 rounded-2xl relative border border-stone-100 flex flex-col items-center"
                  >
                    <button
                      onClick={() =>
                        setSettings({
                          ...settings,
                          categories: settings.categories.filter(
                            (_: any, i: number) => i !== idx,
                          ),
                        })
                      }
                      className="absolute top-2 right-2 text-red-400 hover:text-red-600 bg-white p-1 rounded-full"
                    >
                      <Trash2 size={14} />
                    </button>

                    <label className="w-full h-32 bg-stone-200 rounded-xl mb-3 flex items-center justify-center cursor-pointer overflow-hidden border border-stone-300 relative group">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          className="w-full h-full object-cover group-hover:opacity-80"
                        />
                      ) : (
                        <ImageIcon className="text-stone-400" />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageUpload(e, (url) => {
                            const newC = [...settings.categories];
                            newC[idx].image = url;
                            setSettings({ ...settings, categories: newC });
                          })
                        }
                      />
                    </label>

                    <input
                      placeholder="Category Name"
                      className="w-full bg-white border p-2 rounded-lg text-sm font-bold text-center mb-2"
                      value={cat.name}
                      onChange={(e) => {
                        const newC = [...settings.categories];
                        newC[idx].name = e.target.value;
                        setSettings({ ...settings, categories: newC });
                      }}
                    />
                    <input
                      placeholder="Link URL"
                      className="w-full bg-white border p-2 rounded-lg text-xs text-center text-stone-500"
                      value={cat.link}
                      onChange={(e) => {
                        const newC = [...settings.categories];
                        newC[idx].link = e.target.value;
                        setSettings({ ...settings, categories: newC });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCT SECTIONS */}
          {activeTab === "sections" && (
            <div className="space-y-6">
              {/* New Arrivals Config */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-800">
                    New Arrivals Section
                  </h3>
                  <p className="text-xs text-stone-500">
                    Show latest products on homepage
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-xs font-bold text-stone-500 uppercase">
                    Limit
                  </label>
                  <input
                    type="number"
                    className="w-16 border rounded p-1 text-center text-sm"
                    value={settings.newArrivalsConfig.limit}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        newArrivalsConfig: {
                          ...settings.newArrivalsConfig,
                          limit: Number(e.target.value),
                        },
                      })
                    }
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.newArrivalsConfig.show}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          newArrivalsConfig: {
                            ...settings.newArrivalsConfig,
                            show: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 accent-orange-600"
                    />
                    <span className="text-sm font-bold">Show</span>
                  </label>
                </div>
              </div>

              {/* Masterpiece Config */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-800">The Masterpieces</h3>
                  <p className="text-xs text-stone-500">
                    Large display grid for premium items
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-xs font-bold text-stone-500 uppercase">
                    Limit
                  </label>
                  <input
                    type="number"
                    className="w-16 border rounded p-1 text-center text-sm"
                    value={settings.masterpieceConfig.limit}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        masterpieceConfig: {
                          ...settings.masterpieceConfig,
                          limit: Number(e.target.value),
                        },
                      })
                    }
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.masterpieceConfig.show}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          masterpieceConfig: {
                            ...settings.masterpieceConfig,
                            show: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 accent-orange-600"
                    />
                    <span className="text-sm font-bold">Show</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ARTISAN STORY */}
          {activeTab === "story" && (
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <h2 className="text-lg font-bold mb-6 text-stone-800 border-b pb-2">
                Artisan Story Section
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Story Image */}
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-2 uppercase">
                    Background Media
                  </label>
                  <label className="w-full aspect-video bg-stone-100 rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-stone-300 relative group">
                    {settings.storyConfig.media ? (
                      <img
                        src={settings.storyConfig.media}
                        className="w-full h-full object-cover group-hover:opacity-50 transition-all"
                      />
                    ) : (
                      <>
                        <Upload className="text-stone-400 mb-2" />
                        <span className="text-sm text-stone-500">
                          Click to upload
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload(e, (url) => {
                          setSettings({
                            ...settings,
                            storyConfig: {
                              ...settings.storyConfig,
                              media: url,
                            },
                          });
                        })
                      }
                    />
                  </label>
                </div>

                {/* Story Content */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-2 uppercase">
                      Heading
                    </label>
                    <input
                      className="w-full bg-stone-50 border p-3 rounded-xl outline-none text-sm font-bold"
                      value={settings.storyConfig.title}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          storyConfig: {
                            ...settings.storyConfig,
                            title: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-2 uppercase">
                      Description Text
                    </label>
                    <textarea
                      className="w-full bg-stone-50 border p-3 rounded-xl outline-none text-sm"
                      rows={4}
                      value={settings.storyConfig.text1}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          storyConfig: {
                            ...settings.storyConfig,
                            text1: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-stone-500 mb-2 uppercase">
                        Button Text
                      </label>
                      <input
                        className="w-full bg-stone-50 border p-2 rounded-lg outline-none text-sm"
                        value={settings.storyConfig.btnText}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            storyConfig: {
                              ...settings.storyConfig,
                              btnText: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-stone-500 mb-2 uppercase">
                        Button Link
                      </label>
                      <input
                        className="w-full bg-stone-50 border p-2 rounded-lg outline-none text-sm"
                        value={settings.storyConfig.btnLink}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            storyConfig: {
                              ...settings.storyConfig,
                              btnLink: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
