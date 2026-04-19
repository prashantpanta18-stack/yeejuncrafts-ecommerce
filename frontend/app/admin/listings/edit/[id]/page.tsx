"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/admin/Sidebar";

const ALL_COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Australia",
  "Austria",
  "Bangladesh",
  "Belgium",
  "Bhutan",
  "Brazil",
  "Canada",
  "China",
  "Denmark",
  "Finland",
  "France",
  "Germany",
  "India",
  "Italy",
  "Japan",
  "Nepal",
  "Norway",
  "USA",
  "UK",
  "Vietnam",
];

const IMAGE_RULES = {
  maxSizeMB: 10,
  minWidth: 500,
  minHeight: 500,
  allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
};
const VIDEO_RULES = {
  maxSizeMB: 100,
  allowedTypes: ["video/mp4", "video/quicktime", "video/webm"],
};

type ImageItem = { file?: File; preview: string };
type VideoItem = { file?: File; name: string; url: string };

export default function EditListingPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [activeSection, setActiveSection] = useState("basics");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    sku: "",
    category: "khukuri",
    processingTime: "1-3 business days",
    shippingType: "Free Shipping",
    shippingCost: "0",
    status: "active",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [mediaError, setMediaError] = useState<string>("");
  const [mediaSuccess, setMediaSuccess] = useState<string>("");

  const [images, setImages] = useState<ImageItem[]>([]);
  const [video, setVideo] = useState<VideoItem | null>(null);
  const [draggedImageIdx, setDraggedImageIdx] = useState<number | null>(null);

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [materials, setMaterials] = useState<string[]>([]);
  const [materialInput, setMaterialInput] = useState("");
  const [excludedCountries, setExcludedCountries] = useState<string[]>([]);
  const [countrySearch, setCountrySearch] = useState("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  const filteredCountries = ALL_COUNTRIES.filter((c) =>
    c.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  const tabs = [
    { id: "basics", label: "Listing Basics" },
    { id: "media", label: "Images & Video" },
    { id: "inventory", label: "Inventory & Shipping" },
    { id: "attributes", label: "Attributes & SEO" },
  ];

  const showToast = (msg: string, type: "success" | "error" | "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 🚨 SMART DATA FETCHING (तपाईंको ब्याकएन्ड नबने पनि काम गर्ने लजिक)
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        let productData;

        // पहिलो प्रयास: एउटा मात्र डाटा तान्ने API
        let res = await fetch(`http://localhost:8080/products/${id}`);

        if (res.ok) {
          productData = await res.json();
        } else {
          // दोस्रो प्रयास: यदि माथिको API छैन भने, सबै तानेर ID मिलाएर खोज्ने
          const allRes = await fetch("http://localhost:8080/products");
          const allData = await allRes.json();
          productData = allData.find(
            (p: any) => p.id === id || p.id === Number(id),
          );
        }

        if (!productData) throw new Error("Product not found");

        // डाटा भेटिएपछि फर्ममा भर्ने
        setFormData({
          name: productData.name || "",
          description: productData.description || "",
          price: productData.price?.toString() || "",
          stockQuantity: productData.stockQuantity?.toString() || "",
          sku: productData.sku || "",
          category: productData.category || "khukuri",
          processingTime: productData.processingTime || "1-3 business days",
          shippingType: productData.shippingType || "Free Shipping",
          shippingCost: productData.shippingCost?.toString() || "0",
          status: productData.status || "active",
        });

        if (productData.tags) setTags(productData.tags);
        if (productData.materials) setMaterials(productData.materials);
        if (productData.excludedCountries)
          setExcludedCountries(productData.excludedCountries);
        if (productData.images && Array.isArray(productData.images)) {
          setImages(
            productData.images.map((img: string) => ({ preview: img })),
          );
        }
      } catch (err) {
        console.error(err);
        showToast("Error loading data. Is the backend running?", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-150px 0px -60% 0px" },
    );
    tabs.forEach((tab) => {
      const el = document.getElementById(tab.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    let errorMsg = "";
    if (value.trim() === "") {
      errorMsg = "This field is required ❌";
    } else if (field === "name" && value.length > 140) {
      errorMsg = `Title too long!`;
    } else if (field === "price" && parseFloat(value) <= 0) {
      errorMsg = "Price must be greater than 0";
    } else if (field === "stockQuantity" && parseInt(value) < 0) {
      errorMsg = "Quantity cannot be negative";
    }
    setErrors({ ...errors, [field]: errorMsg });
  };

  const validateImage = (
    file: File,
  ): Promise<{ ok: boolean; reason?: string }> => {
    return new Promise((resolve) => {
      if (!IMAGE_RULES.allowedTypes.includes(file.type))
        return resolve({
          ok: false,
          reason: `"${file.name}" — Invalid format!`,
        });
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > IMAGE_RULES.maxSizeMB)
        return resolve({
          ok: false,
          reason: `"${file.name}" — File too large!`,
        });
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        if (
          img.width < IMAGE_RULES.minWidth ||
          img.height < IMAGE_RULES.minHeight
        )
          resolve({ ok: false, reason: `"${file.name}" — Image too small!` });
        else resolve({ ok: true });
      };
      img.onerror = () => resolve({ ok: false, reason: `Corrupted image` });
      img.src = objectUrl;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setMediaError("");
    setMediaSuccess("");
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    const validImages: ImageItem[] = [];
    const errorList: string[] = [];
    for (const file of files) {
      const result = await validateImage(file);
      if (result.ok)
        validImages.push({ file, preview: URL.createObjectURL(file) });
      else errorList.push(result.reason!);
    }
    if (images.length + validImages.length > 10) {
      errorList.push(`Max 10 images allowed.`);
      validImages.splice(10 - images.length);
    }
    if (validImages.length > 0) {
      setImages((prev) => [...prev, ...validImages]);
      setMediaSuccess(`✅ ${validImages.length} image(s) added successfully!`);
      setTimeout(() => setMediaSuccess(""), 3000);
    }
    if (errorList.length > 0) setMediaError(errorList.join("\n"));
    e.target.value = "";
  };

  const handleDragStart = (index: number) => setDraggedImageIdx(index);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedImageIdx === null) return;
    const newImages = [...images];
    const [draggedItem] = newImages.splice(draggedImageIdx, 1);
    newImages.splice(targetIndex, 0, draggedItem);
    setImages(newImages);
    setDraggedImageIdx(null);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMediaError("");
    setMediaSuccess("");
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (!VIDEO_RULES.allowedTypes.includes(file.type)) {
      setMediaError(`❌ Invalid video format!`);
      return;
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > VIDEO_RULES.maxSizeMB) {
      setMediaError(`❌ Video too large!`);
      return;
    }
    setVideo({ file, name: file.name, url: URL.createObjectURL(file) });
    setMediaSuccess(`✅ Video uploaded: ${file.name}`);
    setTimeout(() => setMediaSuccess(""), 3000);
    e.target.value = "";
  };

  const handleAddChip = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: "tag" | "material",
  ) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = type === "tag" ? tagInput : materialInput;
      const newItems = val
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      if (type === "tag") {
        setTags([...new Set([...tags, ...newItems])].slice(0, 20));
        setTagInput("");
      } else {
        setMaterials([...new Set([...materials, ...newItems])].slice(0, 10));
        setMaterialInput("");
      }
    }
  };

  const removeChip = (
    itemToRemove: string,
    type: "tag" | "material" | "country",
  ) => {
    if (type === "tag") setTags(tags.filter((t) => t !== itemToRemove));
    if (type === "material")
      setMaterials(materials.filter((m) => m !== itemToRemove));
    if (type === "country")
      setExcludedCountries(excludedCountries.filter((c) => c !== itemToRemove));
  };

  const toggleCountry = (country: string) => {
    if (excludedCountries.includes(country))
      setExcludedCountries(excludedCountries.filter((c) => c !== country));
    else setExcludedCountries([...excludedCountries, country]);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stockQuantity) {
      return showToast("⚠️ Please fill all mandatory fields!", "error");
    }

    setIsSubmitting(true);

    try {
      const finalImages = await Promise.all(
        images.map(async (img) =>
          img.file ? await fileToBase64(img.file) : img.preview,
        ),
      );

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity, 10),
        shippingCost:
          formData.shippingType === "Paid Shipping"
            ? parseFloat(formData.shippingCost)
            : 0,
        tags,
        materials,
        excludedCountries,
        images: finalImages.length > 0 ? finalImages : undefined,
      };

      const res = await fetch(`http://localhost:8080/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("✅ Listing Updated Successfully!", "success");
        setTimeout(() => router.push("/admin/listings"), 1000);
      } else {
        const errData = await res.json();
        showToast(`❌ Error: ${errData.error}`, "error");
      }
    } catch (err) {
      showToast("❌ Server connection failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#Fdfcf9]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-stone-300 border-t-orange-600 rounded-full animate-spin"></div>
          <p className="text-stone-500 font-bold tracking-widest uppercase text-xs">
            Loading Masterpiece...
          </p>
        </div>
      </div>
    );

  const isFormValid =
    formData.name &&
    formData.name.length <= 140 &&
    formData.description &&
    formData.price &&
    formData.stockQuantity &&
    formData.sku &&
    !errors.name &&
    !errors.price &&
    !errors.stockQuantity &&
    !errors.sku;

  return (
    <div className="min-h-screen bg-[#Fdfcf9]">
      <Sidebar activePage="Listings" />

      <main className="md:pl-[240px] transition-all duration-300 w-full min-h-screen relative pb-32">
        <div className="animate-fadeIn font-sans text-stone-800">
          {toast && (
            <div
              className={`fixed bottom-24 left-1/2 -translate-x-1/2 md:bottom-10 md:right-10 md:left-auto md:translate-x-0 z-[999999] px-6 py-4 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-3 transition-all duration-300 ${toast.type === "success" ? "bg-green-600 text-white" : toast.type === "error" ? "bg-red-600 text-white" : "bg-stone-900 text-white"}`}
            >
              <span className="text-xl">
                {toast.type === "success"
                  ? "✅"
                  : toast.type === "error"
                    ? "⚠️"
                    : "ℹ️"}
              </span>
              {toast.msg}
            </div>
          )}

          {/* Header */}
          <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8 pb-6">
            <div className="text-[13px] text-stone-500 mb-3 flex items-center gap-2 font-medium tracking-wide">
              <Link
                href="/admin/listings"
                className="hover:text-orange-600 transition-colors"
              >
                Listings
              </Link>
              <span>/</span>{" "}
              <span className="text-stone-900 font-bold">Edit listing</span>
            </div>
            <h2 className="text-4xl font-serif font-extrabold text-stone-950 tracking-tight flex flex-col md:flex-row items-start md:items-center gap-4">
              Update Masterpiece
              {formData.status === "deactive" && (
                <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full font-bold uppercase tracking-widest mt-2 md:mt-0">
                  Inactive Listing
                </span>
              )}
            </h2>
          </div>

          {/* 🚨 EYE-CATCHY FLOATING PILL MENU (Add Listing सँग ठ्याक्कै मिल्ने) */}
          <div className="sticky top-4 z-50 max-w-5xl mx-auto px-4 md:px-8 mb-8 transition-all">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-stone-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-1.5 flex gap-2 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => scrollToSection(tab.id)}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-[11px] md:text-xs tracking-widest transition-all whitespace-nowrap uppercase ${
                    activeSection === tab.id
                      ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
                      : "bg-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100/80"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-4 md:px-8">
            <form onSubmit={handleSave} className="space-y-12">
              {/* --- BASICS SECTION --- */}
              <section
                id="basics"
                className="bg-white rounded-3xl border border-stone-200 shadow-sm scroll-mt-32"
              >
                <div className="bg-stone-50/50 border-b border-stone-100 px-8 py-5 rounded-t-3xl">
                  <h3 className="text-lg font-bold text-stone-900">
                    Listing Basics
                  </h3>
                </div>
                <div className="p-8 space-y-6">
                  <div className="group">
                    <label className="flex justify-between items-center text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 group-focus-within:text-orange-600 transition-colors">
                      <span>
                        Title <span className="text-red-500">*</span>
                      </span>
                      <span
                        className={`font-mono text-[10px] ${formData.name.length > 140 ? "text-red-500" : "text-stone-400"}`}
                      >
                        {formData.name.length} / 140
                      </span>
                    </label>
                    <input
                      type="text"
                      required
                      className={`w-full bg-stone-50/50 border ${errors.name ? "border-red-500" : "border-stone-200 focus:border-orange-500"} focus:bg-white focus:ring-4 focus:ring-orange-500/10 p-3.5 rounded-xl outline-none text-stone-900 transition-all`}
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-[10px] font-bold mt-1.5">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 group-focus-within:text-orange-600 transition-colors">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full bg-stone-50/50 border border-stone-200 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 p-3.5 rounded-xl outline-none text-stone-900 transition-all cursor-pointer"
                      value={formData.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                    >
                      <option value="khukuri">Khukuri</option>
                      <option value="backpack">Hemp Backpack</option>
                      <option value="felt">Felt Items</option>
                      <option value="singing-bowl">Singing Bowl</option>
                    </select>
                  </div>

                  <div className="group">
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 group-focus-within:text-orange-600 transition-colors">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={6}
                      required
                      className={`w-full bg-stone-50/50 border ${errors.description ? "border-red-500" : "border-stone-200 focus:border-orange-500"} focus:bg-white focus:ring-4 focus:ring-orange-500/10 p-3.5 rounded-xl outline-none text-stone-900 transition-all resize-none`}
                      value={formData.description}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                    ></textarea>
                  </div>
                </div>
              </section>

              {/* --- MEDIA SECTION --- */}
              <section
                id="media"
                className="bg-white rounded-3xl border border-stone-200 shadow-sm scroll-mt-32"
              >
                <div className="bg-stone-50/50 border-b border-stone-100 px-8 py-5 rounded-t-3xl">
                  <h3 className="text-lg font-bold text-stone-900">
                    Images & Video
                  </h3>
                </div>
                <div className="p-8 space-y-6">
                  <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl mb-6">
                    <p className="text-orange-800 text-sm font-bold mb-1 flex items-center gap-2">
                      <span>📸</span> Upload Rules
                    </p>
                    <p className="text-orange-700/80 text-xs">
                      Images: JPG/PNG/WEBP, min 500×500px, max 10MB each. Video:
                      MP4/MOV/WEBM, max 100MB. Drag-drop to reorder.
                    </p>
                  </div>

                  {mediaError && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-600 text-xs font-bold">
                      <p className="mb-2">⚠️ UPLOAD FAILED — REASON:</p>
                      {mediaError.split("\n").map((l, i) => (
                        <p key={i}>• {l}</p>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
                    {images.map((img, index) => (
                      <div
                        key={img.preview}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className={`aspect-square relative rounded-2xl overflow-hidden border-2 cursor-grab active:cursor-grabbing group transition-all ${draggedImageIdx === index ? "border-dashed border-orange-500 opacity-50 scale-95" : "border-stone-200 hover:border-orange-400 hover:shadow-md"}`}
                      >
                        <img
                          src={img.preview}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (img.file) URL.revokeObjectURL(img.preview);
                            setImages(images.filter((_, i) => i !== index));
                          }}
                          className="absolute top-2 right-2 bg-white/90 text-red-600 hover:bg-red-600 hover:text-white rounded-full w-7 h-7 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 shadow-sm transition-all duration-200"
                        >
                          ✕
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-orange-900/90 to-transparent text-center text-[10px] text-white pt-6 pb-2 font-bold tracking-widest uppercase">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                    {images.length < 10 && (
                      <label className="aspect-square border-2 border-dashed border-stone-300 hover:border-orange-500 hover:bg-orange-50/30 rounded-2xl flex flex-col items-center justify-center text-stone-500 cursor-pointer bg-stone-50 transition-all duration-200 group">
                        <span className="text-3xl mb-2 text-stone-400 group-hover:text-orange-500 transition-colors">
                          +
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wide group-hover:text-orange-600 transition-colors">
                          Add Photo
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>

                  <div className="mt-8 border-t border-stone-100 pt-8">
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-3">
                      Product Video
                    </label>
                    {!video ? (
                      <label className="block p-10 border-2 border-dashed border-stone-300 hover:border-orange-500 hover:bg-orange-50/30 rounded-2xl text-center cursor-pointer bg-stone-50 transition-all duration-200 group">
                        <span className="text-4xl mb-3 block opacity-60 group-hover:opacity-100 transition-opacity">
                          🎥
                        </span>
                        <span className="text-xs text-stone-600 font-bold uppercase tracking-wide group-hover:text-orange-600">
                          Click to Upload Video
                        </span>
                        <input
                          type="file"
                          accept="video/mp4,video/quicktime,video/webm"
                          className="hidden"
                          onChange={handleVideoUpload}
                        />
                      </label>
                    ) : (
                      <div className="relative w-full max-w-sm rounded-2xl border border-stone-200 overflow-hidden bg-black group shadow-md">
                        <video src={video.url} controls className="w-full" />
                        <button
                          type="button"
                          onClick={() => {
                            if (video.file) URL.revokeObjectURL(video.url);
                            setVideo(null);
                          }}
                          className="absolute top-3 right-3 bg-white/90 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 shadow-sm transition-all duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* --- INVENTORY SECTION --- */}
              <section
                id="inventory"
                className="bg-white rounded-3xl border border-stone-200 shadow-sm scroll-mt-32"
              >
                <div className="bg-stone-50/50 border-b border-stone-100 px-8 py-5 rounded-t-3xl">
                  <h3 className="text-lg font-bold text-stone-900">
                    Inventory & Shipping
                  </h3>
                </div>
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group">
                      <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 group-focus-within:text-orange-600 transition-colors">
                        Price ($) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-stone-400 font-medium">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          className={`w-full bg-stone-50/50 border ${errors.price ? "border-red-500" : "border-stone-200 focus:border-orange-500"} focus:bg-white focus:ring-4 focus:ring-orange-500/10 p-3.5 pl-9 rounded-xl outline-none text-stone-900 transition-all`}
                          value={formData.price}
                          onChange={(e) =>
                            handleChange("price", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 group-focus-within:text-orange-600 transition-colors">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        className={`w-full bg-stone-50/50 border ${errors.stockQuantity ? "border-red-500" : "border-stone-200 focus:border-orange-500"} focus:bg-white focus:ring-4 focus:ring-orange-500/10 p-3.5 rounded-xl outline-none text-stone-900 transition-all`}
                        value={formData.stockQuantity}
                        onChange={(e) =>
                          handleChange("stockQuantity", e.target.value)
                        }
                      />
                    </div>
                    <div className="group">
                      <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 group-focus-within:text-orange-600 transition-colors">
                        SKU <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className={`w-full bg-stone-50/50 border ${errors.sku ? "border-red-500" : "border-stone-200 focus:border-orange-500"} focus:bg-white focus:ring-4 focus:ring-orange-500/10 p-3.5 rounded-xl outline-none text-stone-900 transition-all`}
                        value={formData.sku}
                        onChange={(e) => handleChange("sku", e.target.value)}
                        placeholder="e.g. KHU-001"
                      />
                      {errors.sku && (
                        <p className="text-red-500 text-[10px] font-bold mt-1.5">
                          {errors.sku}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-stone-100">
                    <div className="group">
                      <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 group-focus-within:text-orange-600 transition-colors">
                        Shipping Type
                      </label>
                      <select
                        className="w-full bg-stone-50/50 border border-stone-200 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 p-3.5 rounded-xl outline-none text-stone-900 transition-all cursor-pointer"
                        value={formData.shippingType}
                        onChange={(e) =>
                          handleChange("shippingType", e.target.value)
                        }
                      >
                        <option value="Free Shipping">
                          Free Shipping Globally
                        </option>
                        <option value="Paid Shipping">
                          Fixed Cost (Paid Shipping)
                        </option>
                      </select>
                      {formData.shippingType === "Paid Shipping" && (
                        <input
                          type="number"
                          placeholder="Cost ($)"
                          className="w-full bg-white border border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 p-3.5 rounded-xl outline-none text-stone-900 mt-3 transition-all shadow-sm"
                          value={formData.shippingCost}
                          onChange={(e) =>
                            handleChange("shippingCost", e.target.value)
                          }
                        />
                      )}
                    </div>
                    <div className="group">
                      <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 group-focus-within:text-orange-600 transition-colors">
                        Processing Time
                      </label>
                      <select
                        className="w-full bg-stone-50/50 border border-stone-200 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 p-3.5 rounded-xl outline-none text-stone-900 transition-all cursor-pointer"
                        value={formData.processingTime}
                        onChange={(e) =>
                          handleChange("processingTime", e.target.value)
                        }
                      >
                        <option>1-3 business days</option>
                        <option>3-5 business days</option>
                        <option>1-2 weeks</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-stone-100">
                    <label className="block text-[11px] font-bold text-red-500 uppercase tracking-wider mb-3">
                      Excluded Countries
                    </label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {excludedCountries.map((c, i) => (
                        <span
                          key={i}
                          className="bg-red-50 text-red-700 border border-red-100 text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-2 shadow-sm"
                        >
                          {c}{" "}
                          <button
                            type="button"
                            onClick={() => removeChip(c, "country")}
                            className="hover:bg-red-200 hover:text-red-900 rounded-full w-4 h-4 flex items-center justify-center font-bold transition-colors"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="relative group z-50">
                      <input
                        type="text"
                        placeholder="Search country to exclude..."
                        className="w-full bg-stone-50/50 border border-stone-200 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 p-3.5 rounded-xl outline-none text-stone-900 transition-all"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        onFocus={() => setIsCountryDropdownOpen(true)}
                        onBlur={() =>
                          setTimeout(() => setIsCountryDropdownOpen(false), 200)
                        }
                      />
                      {isCountryDropdownOpen && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-stone-200 rounded-xl shadow-lg max-h-60 overflow-y-auto p-2">
                          {filteredCountries.length > 0 ? (
                            filteredCountries.map((country) => (
                              <label
                                key={country}
                                className="flex items-center gap-3 p-3 hover:bg-stone-50 rounded-lg cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={excludedCountries.includes(country)}
                                  onChange={() => toggleCountry(country)}
                                  className="w-4 h-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                                />
                                <span className="text-stone-700 text-sm font-medium">
                                  {country}
                                </span>
                              </label>
                            ))
                          ) : (
                            <div className="p-4 text-stone-500 text-sm text-center">
                              No countries found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* --- ATTRIBUTES SECTION --- */}
              <section
                id="attributes"
                className="bg-white rounded-3xl border border-stone-200 shadow-sm scroll-mt-32"
              >
                <div className="bg-stone-50/50 border-b border-stone-100 px-8 py-5 rounded-t-3xl">
                  <h3 className="text-lg font-bold text-stone-900">
                    Attributes & SEO
                  </h3>
                </div>
                <div className="p-8 space-y-8">
                  <div className="group">
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 group-focus-within:text-orange-600 transition-colors">
                      Tags (Max 20)
                    </label>
                    <div className="w-full bg-stone-50/50 focus-within:bg-white border border-stone-200 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 p-2 rounded-xl flex flex-wrap gap-2 min-h-[56px] transition-all">
                      {tags.map((tag, i) => (
                        <span
                          key={i}
                          className="bg-white text-stone-700 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 border border-stone-200 shadow-sm"
                        >
                          {tag}{" "}
                          <button
                            type="button"
                            onClick={() => removeChip(tag, "tag")}
                            className="text-stone-400 hover:text-red-500 font-bold transition-colors"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder="e.g. hand forged, kukri..."
                        className="flex-1 bg-transparent outline-none text-stone-900 text-sm min-w-[200px] px-2"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => handleAddChip(e, "tag")}
                        disabled={tags.length >= 20}
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 group-focus-within:text-orange-600 transition-colors">
                      Materials (Max 10)
                    </label>
                    <div className="w-full bg-stone-50/50 focus-within:bg-white border border-stone-200 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 p-2 rounded-xl flex flex-wrap gap-2 min-h-[56px] transition-all">
                      {materials.map((mat, i) => (
                        <span
                          key={i}
                          className="bg-orange-50 border border-orange-100 text-orange-800 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm"
                        >
                          {mat}{" "}
                          <button
                            type="button"
                            onClick={() => removeChip(mat, "material")}
                            className="hover:text-red-600 font-bold transition-colors"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder="e.g. Carbon Steel, Rosewood..."
                        className="flex-1 bg-transparent outline-none text-stone-900 text-sm min-w-[200px] px-2"
                        value={materialInput}
                        onChange={(e) => setMaterialInput(e.target.value)}
                        onKeyDown={(e) => handleAddChip(e, "material")}
                        disabled={materials.length >= 10}
                      />
                    </div>
                  </div>
                </div>
              </section>
            </form>
          </div>
        </div>
      </main>

      {/* Premium Bottom Nav */}
      <div className="fixed bottom-0 left-0 md:left-[240px] right-0 bg-white/90 backdrop-blur-lg border-t border-stone-200 p-5 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
        <div className="max-w-5xl mx-auto flex justify-end gap-4 items-center">
          <Link
            href="/admin/listings"
            className="text-stone-500 hover:text-stone-900 font-bold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={!isFormValid || isSubmitting}
            className={`px-10 py-3.5 font-bold rounded-xl text-sm uppercase tracking-wider transition-all shadow-md ${isFormValid ? "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-900/20 hover:shadow-lg hover:-translate-y-0.5" : "bg-stone-200 text-stone-400 cursor-not-allowed"}`}
          >
            {isSubmitting ? "Updating Artifact..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
