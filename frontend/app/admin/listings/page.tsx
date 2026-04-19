"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";

type Product = {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  price: number;
  images: string[];
  videoUrl?: string;
  category: string;
  status: string;
  slug?: string;
  visits?: number;
  favorites?: number;
  inCart?: number;
  revenue?: number;
  sales?: number;
  // Database required fields that might come from backend
  description?: string;
  processingTime?: string;
  shippingType?: string;
  shippingCost?: number;
  tags?: string[];
  materials?: string[];
  excludedCountries?: string[];
};

const DEMO_VIDEO_URL =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4";

export default function ListingsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [expandedCategoryMenuId, setExpandedCategoryMenuId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("active");
  const [showStats, setShowStats] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const [modal, setModal] = useState<{ type: "bulkDelete" | "bulkDeactivate" | "bulkPrice" | "singleDelete"; targetId?: string; } | null>(null);
  const [priceInput, setPriceInput] = useState("");

  const showToast = (msg: string, type: "success" | "error" | "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest(".dropdown-menu-container") &&
        !target.closest(".gear-button")
      ) {
        setOpenMenuId(null);
        setExpandedCategoryMenuId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:8080/products");
      if (res.ok) {
        const data = await res.json();
        const dataWithStatus = data.map((p: any) => ({
          ...p,
          status: p.status || "active",
          visits: p.visits || 0,
          favorites: p.favorites || 0,
          inCart: p.inCart || 0,
          revenue: p.revenue || 0,
          sales: p.sales || 0,
        }));
        setProducts(dataWithStatus);
      }
    } catch (error) {
      showToast("Failed to fetch products from server.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (filterStatus === "active")
        return p.status === "active" && p.stockQuantity > 0;
      if (filterStatus === "deactive") return p.status === "deactive";
      if (filterStatus === "out_of_stock") return p.stockQuantity <= 0;
      if (filterStatus === "draft") return p.status === "draft";
      return true;
    });
  }, [products, filterStatus]);

  useEffect(() => {
    setSelectedIds([]);
  }, [filterStatus]);

  const handleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const executeBulkDelete = async () => {
    const idsToDelete = [...selectedIds];
    setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
    setSelectedIds([]);
    setModal(null);
    try {
      await Promise.all(
        idsToDelete.map((id) =>
          fetch(`http://localhost:8080/products/${id}`, { method: "DELETE" }),
        ),
      );
      showToast(`Successfully deleted ${idsToDelete.length} listings.`, "success");
    } catch (error) {
      showToast("Error deleting some products.", "error");
      fetchProducts();
    }
  };

  const executeBulkDeactivate = async () => {
    const idsToUpdate = [...selectedIds];
    setProducts((prev) =>
      prev.map((p) =>
        selectedIds.includes(p.id) ? { ...p, status: "deactive" } : p,
      ),
    );
    setSelectedIds([]);
    setModal(null);
    try {
      await Promise.all(
        idsToUpdate.map((id) =>
          fetch(`http://localhost:8080/products/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "deactive" }),
          }),
        ),
      );
      showToast(`Successfully deactivated ${idsToUpdate.length} listings.`, "success");
    } catch (error) {
      showToast("Error deactivating products.", "error");
      fetchProducts();
    }
  };

  const executeBulkPriceIncrease = async () => {
    const percent = parseFloat(priceInput);
    if (isNaN(percent) || percent <= 0)
      return showToast("Please enter a valid percentage number.", "error");
    const idsToUpdate = [...selectedIds];

    // Compute new prices from the current state
    const priceUpdates = new Map<string, number>();
    for (const id of idsToUpdate) {
      const product = products.find((p) => p.id === id);
      if (!product) continue;
      const newPrice = parseFloat(
        (product.price + product.price * (percent / 100)).toFixed(2),
      );
      priceUpdates.set(id, newPrice);
    }

    try {
      const results = await Promise.all(
        idsToUpdate.map(async (id) => {
          const newPrice = priceUpdates.get(id);
          if (newPrice === undefined) return { ok: true };

          const res = await fetch(`http://localhost:8080/products/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ price: newPrice }),
          });
          if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(text || `Failed to update product ${id}`);
          }
          return { ok: true };
        }),
      );

      // Only update UI after backend succeeded
      setProducts((prev) =>
        prev.map((p) =>
          priceUpdates.has(p.id)
            ? { ...p, price: priceUpdates.get(p.id)! }
            : p,
        ),
      );
      setModal(null);
      setPriceInput("");
      setSelectedIds([]);
      showToast(`Prices increased by ${percent}% successfully!`, "success");
    } catch (error) {
      showToast("Database error while updating prices.", "error");
      fetchProducts();
    }
  };

  const executeSingleDelete = async () => {
    if (!modal?.targetId) return;
    const id = modal.targetId;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setModal(null);
    try {
      await fetch(`http://localhost:8080/products/${id}`, { method: "DELETE" });
      showToast("Listing deleted.", "success");
    } catch (error) {
      fetchProducts();
      showToast("Delete failed.", "error");
    }
  };

  const handleSingleDeactivate = async (e: React.MouseEvent, id: string, currentStatus: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = currentStatus === "deactive" ? "active" : "deactive";
    
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)),
    );
    setOpenMenuId(null);
    setExpandedCategoryMenuId(null);
    showToast(`Listing ${newStatus === "active" ? "Activated" : "Deactivated"}`, "success");
    
    try {
      const res = await fetch(`http://localhost:8080/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if(!res.ok) throw new Error("API not ready");
    } catch (error) {
      showToast("API not ready, but status updated in UI.", "info");
    }
  };

  const handleCategoryChange = async (e: React.MouseEvent, id: string, newCat: string) => {
    e.preventDefault();
    e.stopPropagation();
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, category: newCat } : p)),
    );
    setOpenMenuId(null);
    setExpandedCategoryMenuId(null);
    showToast(`Category changed to ${newCat}`, "success");
    try {
      await fetch(`http://localhost:8080/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCat }),
      });
    } catch (error) {
      showToast("API not ready, category updated in UI.", "info");
    }
  };

  // 🚨 Copy Function Completely Fixed: Supplying all explicit values so Prisma doesn't reject it
  const handleCopy = async (e: React.MouseEvent, product: Product | any) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenMenuId(null);
    setExpandedCategoryMenuId(null);
    
    const randomSuffix = Date.now().toString().slice(-4);
    
    const payload = {
      name: `Copy of ${product.name}`,
      slug: `copy-${randomSuffix}`,
      description: product.description || "Duplicated listing description.",
      price: product.price || 0,
      stockQuantity: product.stockQuantity || 0,
      sku: product.sku ? `${product.sku}-C${randomSuffix}` : `COPY-${randomSuffix}`,
      category: product.category || "khukuri",
      processingTime: product.processingTime || "1-3 business days",
      shippingType: product.shippingType || "Free Shipping",
      shippingCost: product.shippingCost || 0,
      tags: product.tags || [],
      materials: product.materials || [],
      excludedCountries: product.excludedCountries || [],
      images: product.images || [],
      status: "draft"
    };
    
    try {
      const res = await fetch("http://localhost:8080/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast("Listing duplicated! Check Drafts.", "success");
        fetchProducts(); // Refresh list to show the new item
      } else {
         const errData = await res.json().catch(() => ({}));
         console.error("Backend validation error:", errData);
         showToast(`Copy Failed: ${errData.error || 'Validation error'}`, "error");
      }
    } catch (err) {
      showToast("Error duplicating. Check console for details.", "error");
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/listings/edit/${id}`);
  };

  const handleShare = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/products/${id}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        showToast("🔗 Link Copied to Clipboard!", "success");
      } else {
        throw new Error();
      }
    } catch (err) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        showToast("🔗 Link Copied to Clipboard!", "success");
      } catch (fallbackErr) {
        window.prompt("Press Ctrl+C (or Cmd+C) to copy the link:", url);
      }
    }
    setOpenMenuId(null);
    setExpandedCategoryMenuId(null);
  };

  const handleViewOnShop = (slugOrId: string) => {
    window.open(`/products/${slugOrId}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#Fdfcf9]">
      {/* Sidebar Component */}
      <Sidebar activePage="Listings" />
      
      {/* Main Content pushed right to avoid fixed Sidebar overlap */}
      <main className="md:pl-[240px] transition-all duration-300 w-full min-h-screen relative">
        <div className="animate-fadeIn pb-32">
          
          {toast && (
            <div className={`fixed bottom-10 right-10 z-[999999] px-6 py-4 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 ${toast.type === "success" ? "bg-green-600 text-white" : toast.type === "error" ? "bg-red-600 text-white" : "bg-stone-900 text-white"}`}>
              <span className="text-xl">{toast.type === "success" ? "✅" : toast.type === "error" ? "⚠️" : "ℹ️"}</span>
              {toast.msg}
            </div>
          )}

          {modal && (
            <div className="fixed inset-0 z-[9999] bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fadeIn">
                {modal.type === "bulkPrice" && (
                  <>
                    <h3 className="text-lg font-bold text-stone-900 mb-2">Increase Prices</h3>
                    <p className="text-sm text-stone-500 mb-4">Enter the percentage (%) to increase the price of {selectedIds.length} selected listings.</p>
                    <div className="relative mb-6">
                      <input type="number" autoFocus value={priceInput} onChange={(e) => setPriceInput(e.target.value)} placeholder="e.g. 10" className="w-full bg-stone-50 border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl p-3 pr-8 outline-none text-stone-900" />
                      <span className="absolute right-4 top-3.5 text-stone-400 font-bold">%</span>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => setModal(null)} className="px-5 py-2 rounded-lg font-bold text-stone-600 hover:bg-stone-100 transition-colors">Cancel</button>
                      <button onClick={executeBulkPriceIncrease} className="px-5 py-2 rounded-lg font-bold bg-orange-600 hover:bg-orange-700 text-white transition-colors">Update Prices</button>
                    </div>
                  </>
                )}

                {(modal.type === "bulkDelete" || modal.type === "singleDelete") && (
                  <>
                    <h3 className="text-lg font-bold text-red-600 mb-2">Delete Listing(s)?</h3>
                    <p className="text-sm text-stone-600 mb-6">This action cannot be undone. Are you sure you want to permanently delete {modal.type === "bulkDelete" ? `${selectedIds.length} selected listings` : "this listing"}?</p>
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => setModal(null)} className="px-5 py-2 rounded-lg font-bold text-stone-600 hover:bg-stone-100 transition-colors">Cancel</button>
                      <button onClick={modal.type === "bulkDelete" ? executeBulkDelete : executeSingleDelete} className="px-5 py-2 rounded-lg font-bold bg-red-600 hover:bg-red-700 text-white transition-colors">Yes, Delete</button>
                    </div>
                  </>
                )}

                {modal.type === "bulkDeactivate" && (
                  <>
                    <h3 className="text-lg font-bold text-stone-900 mb-2">Deactivate Listings?</h3>
                    <p className="text-sm text-stone-600 mb-6">You are about to hide {selectedIds.length} listings from your public store. You can activate them later.</p>
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => setModal(null)} className="px-5 py-2 rounded-lg font-bold text-stone-600 hover:bg-stone-100 transition-colors">Cancel</button>
                      <button onClick={executeBulkDeactivate} className="px-5 py-2 rounded-lg font-bold bg-stone-900 hover:bg-black text-white transition-colors">Deactivate</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="sticky top-0 z-40 bg-white border-b border-stone-200 py-3 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6 w-full md:w-auto">
              <h2 className="text-2xl font-serif font-bold text-stone-900">Listings</h2>
              <div className="relative flex-1 md:w-80">
                <input type="text" placeholder="Search by title, tag, or SKU" className="w-full pl-4 pr-10 py-2 border border-stone-300 rounded-full text-sm outline-none focus:ring-2 focus:ring-stone-200" />
                <span className="absolute right-3 top-2 opacity-40">🔍</span>
              </div>
            </div>
            <Link href="/admin/listings/add" className="bg-stone-900 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md flex items-center gap-2 hover:bg-black transition-all">
              <span>+</span> Add a listing
            </Link>
          </div>

          <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-6 flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-6 items-center">
                <div onClick={handleSelectAll} className="border border-stone-300 rounded-md bg-white p-1.5 px-3 mr-2 shadow-sm flex items-center gap-2 cursor-pointer hover:bg-stone-50">
                  <input type="checkbox" checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0} onChange={() => {}} className="accent-stone-900 w-4 h-4 rounded cursor-pointer pointer-events-none" />
                  <span className="text-stone-400 text-xs">▼</span>
                </div>
                <button onClick={() => selectedIds.length > 0 ? setModal({ type: "bulkDeactivate" }) : showToast("Select at least one listing", "info")} className="px-4 py-1.5 border border-stone-300 bg-white text-stone-600 rounded-md text-sm font-bold shadow-sm hover:bg-stone-50 transition-colors">Deactivate</button>
                <button onClick={() => selectedIds.length > 0 ? setModal({ type: "bulkPrice" }) : showToast("Select at least one listing", "info")} className="px-4 py-1.5 border border-stone-300 bg-white text-stone-600 rounded-md text-sm font-bold shadow-sm hover:bg-stone-50 transition-colors">Update Price</button>
                <button onClick={() => selectedIds.length > 0 ? setModal({ type: "bulkDelete" }) : showToast("Select at least one listing", "info")} className="px-4 py-1.5 border border-red-200 bg-red-50 text-red-600 rounded-md text-sm font-bold shadow-sm hover:bg-red-100 transition-colors">Delete</button>
                {selectedIds.length > 0 && <span className="text-sm font-bold text-orange-600 ml-2">{selectedIds.length} selected</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {isLoading ? (
                  <p className="text-stone-500 col-span-full">Loading your masterpieces...</p>
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-full text-center py-20 bg-white border border-stone-200 rounded-xl">
                    <p className="text-stone-500 mb-2">No listings found in this view.</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div key={product.id} className={`bg-white border rounded-xl flex flex-col shadow-sm hover:shadow-lg transition-all duration-300 relative ${selectedIds.includes(product.id) ? "border-stone-900 ring-1 ring-stone-900 z-20" : "border-stone-200 z-10"}`}>
                      
                      <div className="h-48 shrink-0 bg-stone-100 relative rounded-t-xl group cursor-pointer overflow-hidden" onClick={() => handleViewOnShop(product.slug || product.id)}>
                        <video src={product.videoUrl || DEMO_VIDEO_URL} muted loop playsInline className="absolute inset-0 w-full h-full object-cover z-0" />
                        <img src={product.images[0] || "https://images.unsplash.com/photo-1509211929311-66df989a31a5?w=300&q=80"} className="absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-500 group-hover:opacity-0" alt={product.name} />
                        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                          <span className="bg-black/40 backdrop-blur-sm text-white text-[11px] font-bold px-4 py-2 rounded-full shadow-md transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 tracking-wider">👁️ View Listing</span>
                        </div>
                        {product.stockQuantity <= 0 && <div className="absolute top-2 left-2 z-30 bg-white/95 text-red-600 text-[10px] font-bold px-2 py-1 rounded shadow-sm">SOLD OUT</div>}
                        {product.status === "deactive" && <div className="absolute inset-0 z-30 bg-white/50 backdrop-blur-[2px] flex items-center justify-center"><span className="bg-stone-900 text-white text-xs font-bold px-3 py-1 rounded-full">INACTIVE</span></div>}
                        <div className={`absolute top-2 left-2 z-40 p-1 bg-white rounded shadow-sm transition-opacity ${selectedIds.includes(product.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} onClick={(e) => { e.stopPropagation(); handleSelectOne(product.id); }}>
                          <input type="checkbox" checked={selectedIds.includes(product.id)} readOnly className="w-4 h-4 rounded border-stone-300 accent-stone-900 cursor-pointer pointer-events-none block" />
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-[14px] text-stone-900 truncate mb-1" title={product.name}>{product.name}</h3>
                        <p className="text-[12px] text-stone-500 capitalize">{product.category}</p>
                        <p className="text-[12px] text-stone-500">{product.stockQuantity} in stock</p>
                        <p className="text-[16px] font-extrabold text-stone-900 mt-2">${product.price.toFixed(2)}</p>

                        {showStats && (
                          <div className="mt-4 pt-4 border-t border-stone-100 flex-1 animate-fadeIn">
                            <p className="text-[10px] font-bold text-stone-800 uppercase tracking-widest mb-1.5">Last 30 Days</p>
                            <p className="text-[12px] text-stone-600 mb-3 flex items-center gap-2"><span>👀 {product.visits} visits</span> <span>❤️ {product.favorites} favorites</span></p>
                            <p className="text-[10px] font-bold text-stone-800 uppercase tracking-widest mb-1.5">All Time</p>
                            <p className="text-[12px] text-stone-600 flex items-center gap-2"><span>🛒 {product.inCart} in cart</span> <span>💰 ${product.revenue?.toFixed(2)} rev</span></p>
                          </div>
                        )}
                      </div>

                      <div className="px-4 py-3 border-t border-stone-200 flex justify-between items-center bg-stone-50/80 rounded-b-xl">
                        <div onClick={() => handleSelectOne(product.id)} className="cursor-pointer flex items-center p-1 -ml-1 rounded hover:bg-stone-200 transition-colors">
                          <input type="checkbox" checked={selectedIds.includes(product.id)} readOnly className="w-4 h-4 rounded border-stone-300 accent-stone-900 cursor-pointer pointer-events-none" />
                        </div>

                        <div className="flex gap-3 items-center relative dropdown-menu-container">
                          <button className="text-stone-400 hover:text-orange-500 transition-colors" title="Feature Listing">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          </button>

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (openMenuId === product.id) {
                                setOpenMenuId(null);
                                setExpandedCategoryMenuId(null);
                              } else {
                                setOpenMenuId(product.id);
                                setExpandedCategoryMenuId(null);
                              }
                            }}
                            className={`gear-button text-stone-500 flex items-center p-1 rounded transition-colors ${openMenuId === product.id ? "bg-stone-200 text-stone-900" : "hover:bg-stone-200 hover:text-stone-900"}`}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span className="text-[10px] ml-0.5">▼</span>
                          </button>

                          {/* 🚨 Dropdown Fix: bottom-full mb-2 makes it open UPWARDS */}
                          {openMenuId === product.id && (
                            <div onClick={(e) => e.stopPropagation()} className="absolute right-0 bottom-full mb-2 w-52 bg-white border border-stone-200 shadow-[0_-5px_30px_rgba(0,0,0,0.15)] rounded-xl py-2 z-[999] text-[13px] text-stone-700">
                              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleViewOnShop(product.slug || product.id); }} className="w-full text-left px-4 py-2 hover:bg-stone-100 flex justify-between items-center transition-colors">View on Shop <span>↗</span></button>
                              <div className="border-t border-stone-100 my-1"></div>
                              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(product.id); }} className="w-full text-left px-4 py-2 hover:bg-stone-100 transition-colors">Edit</button>
                              <button onClick={(e) => handleCopy(e, product)} className="w-full text-left px-4 py-2 hover:bg-stone-100 transition-colors">Copy</button>
                              <button onClick={(e) => handleSingleDeactivate(e, product.id, product.status)} className="w-full text-left px-4 py-2 hover:bg-stone-100 transition-colors font-medium text-stone-900">
                                {product.status === "deactive" ? "🟢 Activate Listing" : "⏸ Deactivate Listing"}
                              </button>
                              <div className="border-t border-stone-100 my-1"></div>
                              <button onClick={(e) => handleShare(e, product.id)} className="w-full text-left px-4 py-2 hover:bg-stone-100 flex justify-between items-center transition-colors">
                                Share <span className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded font-bold">Share & Save</span>
                              </button>
                              <div className="border-t border-stone-100 my-1"></div>
                              <button onClick={(e) => { e.stopPropagation(); setExpandedCategoryMenuId(expandedCategoryMenuId === product.id ? null : product.id); }} className="w-full text-left px-4 py-2 hover:bg-stone-100 flex justify-between items-center text-[10px] font-bold text-stone-500 uppercase tracking-widest transition-colors">
                                Change Category <span>{expandedCategoryMenuId === product.id ? "▲" : "▼"}</span>
                              </button>
                              {expandedCategoryMenuId === product.id && (
                                <div className="bg-stone-50 py-1 border-y border-stone-100 max-h-40 overflow-y-auto no-scrollbar">
                                  {["khukuri", "backpack", "felt", "singing-bowl"].map((cat) => (
                                    <button key={cat} onClick={(e) => handleCategoryChange(e, product.id, cat)} className={`w-full text-left px-6 py-1.5 hover:bg-stone-100 capitalize transition-colors ${product.category === cat ? "text-stone-900 font-bold" : "text-stone-600"}`}>
                                      {product.category === cat && "✓ "} {cat}
                                    </button>
                                  ))}
                                </div>
                              )}
                              <div className="border-t border-stone-100 my-2"></div>
                              <button onClick={() => setModal({ type: "singleDelete", targetId: product.id })} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-bold transition-colors">Delete</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
              <button className="w-full bg-white border border-stone-300 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-stone-50 transition-colors">Quick edit</button>
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-stone-100">
                  <span className="font-bold text-stone-900 text-sm">View Stats</span>
                  <button onClick={() => setShowStats(!showStats)} className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${showStats ? "bg-orange-600" : "bg-stone-300"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${showStats ? "translate-x-5" : "translate-x-0.5"}`}></div>
                  </button>
                </div>
                <h4 className="font-bold text-stone-900 text-sm mb-4 uppercase tracking-wider">Listing status</h4>
                <div className="space-y-3">
                  {[
                    { id: "active", label: "Active", count: products.filter((p) => p.status === "active" && p.stockQuantity > 0).length },
                    { id: "draft", label: "Draft", count: products.filter((p) => p.status === "draft").length },
                    { id: "deactive", label: "Deactivated", count: products.filter((p) => p.status === "deactive").length },
                    { id: "out_of_stock", label: "Sold Out", count: products.filter((p) => p.stockQuantity <= 0).length },
                  ].map((item) => (
                    <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                      <input type="radio" name="status" checked={filterStatus === item.id} onChange={() => setFilterStatus(item.id)} className="accent-orange-600 w-4 h-4 cursor-pointer" />
                      <span className={`text-[14px] ${filterStatus === item.id ? "font-bold text-stone-900" : "text-stone-500 group-hover:text-stone-800"}`}>{item.label}</span>
                      <span className="ml-auto text-[12px] text-stone-400 font-mono">{item.count}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}