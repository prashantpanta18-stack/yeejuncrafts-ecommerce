"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Truck,
  Globe,
  ShieldCheck,
  HeartHandshake,
  Star,
  PlayCircle,
  Mail,
} from "lucide-react";

// Custom Instagram Icon
const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
  </svg>
);

// 🚨 1. FIXED: छुट्टाछुट्टै प्रोडक्ट फोटो र नामहरू (रिपिट नहुनको लागि)
const dummyProductImages = [
  "https://images.unsplash.com/photo-1515083818318-62024cc5da83?q=80&w=800&auto=format&fit=crop", // Singing Bowl
  "https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?q=80&w=800&auto=format&fit=crop", // Khukuri
  "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=800&auto=format&fit=crop", // Decor
  "https://images.unsplash.com/photo-1620023473177-3e198642751f?q=80&w=800&auto=format&fit=crop", // Thangka
  "https://images.unsplash.com/photo-1515562141207-7a8efd3e33f0?q=80&w=800&auto=format&fit=crop", // Jewelry
  "https://images.unsplash.com/photo-1610041321360-192e22c06180?q=80&w=800&auto=format&fit=crop", // Brass Craft
];

const dummyProductTitles = [
  "Hand-Hammered Singing Bowl",
  "Custom Panawal Khukuri",
  "Artisan Brass Decor",
  "Vintage Mandala Thangka",
  "Tibetan Healing Bracelet",
  "Traditional Copper Pot",
];

export default function HomePage() {
  const [settings, setSettings] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const defaultData = {
    heroSlides: [
      {
        image:
          "https://images.unsplash.com/photo-1610041321421-998b3f1ba50c?q=80&w=1920&auto=format&fit=crop",
        title: "Authentic Handcrafted Masterpieces",
        subtitle: "Discover the soul of the Himalayas.",
        btnText: "Explore Collection",
        btnLink: "/shop",
      },
      {
        image:
          "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?q=80&w=1920&auto=format&fit=crop",
        title: "Sacred Singing Bowls",
        subtitle: "Resonance of peace and healing.",
        btnText: "Shop Bowls",
        btnLink: "/category/singing-bowls",
      },
      {
        image:
          "https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?q=80&w=1920&auto=format&fit=crop",
        title: "Legendary Khukuris",
        subtitle: "Forged by generations of master blacksmiths.",
        btnText: "View Blades",
        btnLink: "/category/khukuri",
      },
      {
        image:
          "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=1920&auto=format&fit=crop",
        title: "Artisan Home Decor",
        subtitle: "Bring the heritage of Nepal to your living space.",
        btnText: "Shop Decor",
        btnLink: "/category/decor",
      },
    ],
    heroSettings: {
      textColor: "#ffffff",
      btnColor: "#ea580c",
      overlayOpacity: 0.5,
    },
    trustBadges: [
      { icon: "Globe", title: "Worldwide Shipping", subtitle: "Fast & Secure" },
      {
        icon: "HeartHandshake",
        title: "Fair Trade",
        subtitle: "Supporting Artisans",
      },
      {
        icon: "ShieldCheck",
        title: "Authentic Quality",
        subtitle: "100% Handcrafted",
      },
      { icon: "Truck", title: "Easy Returns", subtitle: "30-Day Guarantee" },
    ],
    trustSettings: { bgColor: "#Fdfcf9", textColor: "#1c1917" },
    categories: [
      {
        name: "Khukuris",
        image: dummyProductImages[1],
        link: "/category/khukuri",
      },
      {
        name: "Singing Bowls",
        image: dummyProductImages[0],
        link: "/category/singing-bowls",
      },
      {
        name: "Thangkas",
        image: dummyProductImages[3],
        link: "/category/thangka",
      },
      {
        name: "Jewelry",
        image: dummyProductImages[4],
        link: "/category/jewelry",
      },
      {
        name: "Pashmina",
        image:
          "https://images.unsplash.com/photo-1520625642571-0810db44510b?q=80&w=800&auto=format&fit=crop",
        link: "/category/pashmina",
      },
      { name: "Decor", image: dummyProductImages[2], link: "/category/decor" },
    ],
    categorySettings: { shape: "rounded-3xl", btnStyle: "filled" },
    newArrivalsConfig: { show: true, columns: 4, limit: 6 },
    featuredConfig: { show: true, columns: 4, limit: 6 },
    masterpieceConfig: { show: true, columns: 2, limit: 4 },
    storyConfig: {
      media:
        "https://images.unsplash.com/photo-1534073133331-c4f6fb9ea940?q=80&w=1920&auto=format&fit=crop",
      title: "Preserving Ancient Craftsmanship",
      text1:
        "Every piece at YeejunCrafts is a piece of history. We work directly with master artisans in the foothills of the Himalayas.",
      btnText: "Discover Our Heritage",
      btnLink: "/our-story",
    },
    blogConfig: { show: true, columns: 3, limit: 3 },
  };

  useEffect(() => {
    fetch("http://localhost:8080/home-settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setSettings(data);
        else setSettings(defaultData);
      })
      .catch(() => setSettings(defaultData));
  }, []);

  useEffect(() => {
    if (!settings?.heroSlides || settings.heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % settings.heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [settings]);

  if (!settings)
    return (
      <div className="h-screen bg-stone-900 flex items-center justify-center text-white">
        Loading Masterpieces...
      </div>
    );
  const data = { ...defaultData, ...settings };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "Globe":
        return <Globe size={32} strokeWidth={1.5} />;
      case "HeartHandshake":
        return <HeartHandshake size={32} strokeWidth={1.5} />;
      case "ShieldCheck":
        return <ShieldCheck size={32} strokeWidth={1.5} />;
      default:
        return <Truck size={32} strokeWidth={1.5} />;
    }
  };

  const SectionHeader = ({
    title,
    linkText,
    linkUrl,
  }: {
    title: string;
    linkText: string;
    linkUrl: string;
  }) => (
    <div className="flex justify-between items-end mb-10 border-b border-stone-200 pb-4">
      <div>
        <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-stone-900">
          {title}
        </h2>
        <div
          style={{ backgroundColor: data.heroSettings.btnColor }}
          className="w-16 h-1 mt-3"
        ></div>
      </div>
      <Link
        href={linkUrl}
        className="flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest text-orange-600 hover:text-stone-900 transition-colors whitespace-nowrap"
      >
        {linkText} <ArrowRight size={16} />
      </Link>
    </div>
  );

  const renderScrollableProducts = (count: number) => {
    return (
      <div className="flex overflow-x-auto gap-6 pb-8 snap-x hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className="w-[75vw] sm:w-[calc(50%-12px)] md:w-[calc(33.33%-16px)] lg:w-[calc(25%-18px)] flex-shrink-0 snap-start group cursor-pointer"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-stone-200 mb-4">
              {/* 🚨 FIXED: छुट्टाछुट्टै फोटो */}
              <img
                src={dummyProductImages[i % dummyProductImages.length]}
                alt="Product"
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-stone-900 text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-full shadow-sm">
                Authentic
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 w-[90%]">
                <button className="w-full bg-stone-900 text-white py-3 rounded-lg text-sm font-bold uppercase hover:bg-orange-600 transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
            {/* 🚨 FIXED: छुट्टाछुट्टै नाम */}
            <h3 className="font-bold text-stone-900 text-lg mb-1 group-hover:text-orange-600 transition-colors line-clamp-1">
              {dummyProductTitles[i % dummyProductTitles.length]}
            </h3>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  className="fill-orange-400 text-orange-400"
                />
              ))}
            </div>
            <p className="font-serif font-bold text-xl text-stone-800">
              ${(i * 15 + 85).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="font-sans w-full bg-white">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />

      {/* 1. HERO SLIDER */}
      <section className="relative w-full h-[75vh] md:h-[85vh] bg-stone-900 flex items-center justify-center overflow-hidden">
        {data.heroSlides.map((slide: any, idx: number) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-[10000ms]"
              style={{
                backgroundImage: `url('${slide.image}')`,
                transform: idx === currentSlide ? "scale(1)" : "scale(1.05)",
              }}
            ></div>
            <div
              className="absolute inset-0 bg-stone-900"
              style={{ opacity: data.heroSettings.overlayOpacity }}
            ></div>
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto h-full flex flex-col justify-center items-center">
              <h1
                style={{ color: data.heroSettings.textColor }}
                className="text-4xl md:text-6xl lg:text-7xl font-serif font-extrabold mb-6 leading-tight drop-shadow-lg"
              >
                {slide.title}
              </h1>
              <p
                style={{ color: data.heroSettings.textColor }}
                className="text-lg md:text-xl mb-10 max-w-2xl font-light opacity-90 drop-shadow-md"
              >
                {slide.subtitle}
              </p>
              <Link
                href={slide.btnLink || "#"}
                style={{ backgroundColor: data.heroSettings.btnColor }}
                className="inline-flex items-center gap-3 text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(234,88,12,0.4)]"
              >
                {slide.btnText} <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        ))}
        <div className="absolute bottom-10 left-0 w-full flex justify-center gap-3 z-20">
          {data.heroSlides.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all ${i === currentSlide ? "w-10 bg-white" : "w-3 bg-white/40 hover:bg-white/70"}`}
            ></button>
          ))}
        </div>
      </section>

      {/* 2. TRUST BADGES */}
      <section
        style={{
          backgroundColor: data.trustSettings.bgColor,
          color: data.trustSettings.textColor,
        }}
        className="border-b border-stone-200 py-10"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:divide-x divide-stone-200/50">
            {data.trustBadges.map((badge: any, i: number) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center p-4"
              >
                <div
                  style={{ color: data.heroSettings.btnColor }}
                  className="mb-4"
                >
                  {renderIcon(badge.icon)}
                </div>
                <h4 className="font-bold text-sm uppercase tracking-widest mb-1">
                  {badge.title}
                </h4>
                <p className="text-xs opacity-70">{badge.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SHOP BY CATEGORY */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader
            title="Shop By Category"
            linkText="View All Categories"
            linkUrl="/categories"
          />
          <div className="flex overflow-x-auto gap-6 pb-8 snap-x hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
            {data.categories.map((cat: any, i: number) => (
              <Link
                key={i}
                href={cat.link}
                className={`group relative h-[380px] w-[75vw] sm:w-[calc(50%-12px)] md:w-[calc(33.33%-16px)] lg:w-[calc(25%-18px)] flex-shrink-0 snap-start overflow-hidden bg-stone-900 ${data.categorySettings.shape}`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-110 group-hover:opacity-50 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 w-full text-center flex flex-col items-center justify-end h-full">
                  <h3 className="text-xl font-bold text-white mb-4 tracking-wide uppercase drop-shadow-md">
                    {cat.name}
                  </h3>
                  <span
                    className={`text-xs font-bold uppercase tracking-widest transition-all ${data.categorySettings.btnStyle === "filled" ? "bg-white text-stone-900 px-6 py-3 rounded-full group-hover:bg-orange-500 group-hover:text-white shadow-lg" : "text-white border-b-2 border-orange-500 pb-1 group-hover:text-orange-500"}`}
                  >
                    Explore
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. NEW ARRIVALS */}
      {data.newArrivalsConfig.show && (
        <section className="py-20 bg-stone-50">
          <div className="max-w-7xl mx-auto px-4">
            <SectionHeader
              title="New Arrivals"
              linkText="View All New Arrivals"
              linkUrl="/collections/new"
            />
            {renderScrollableProducts(data.newArrivalsConfig.limit)}
          </div>
        </section>
      )}

      {/* 5. FEATURED COLLECTION */}
      {data.featuredConfig.show && (
        <section className="py-20 bg-white border-t border-stone-100">
          <div className="max-w-7xl mx-auto px-4">
            <SectionHeader
              title="Featured Collection"
              linkText="View Entire Collection"
              linkUrl="/collections/featured"
            />
            {renderScrollableProducts(data.featuredConfig.limit)}
          </div>
        </section>
      )}

      {/* 6. 🚨 FIXED: ARTISAN STORY (Massive Video Frame + Text Card Layout) */}
      <section className="bg-stone-900 py-16 md:py-24 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Media Section (Left Side - Massive Video Frame, NO Card styling) */}
          <div className="w-full lg:w-3/5 h-[400px] sm:h-[500px] lg:h-[650px] relative rounded-[2rem] overflow-hidden group cursor-pointer shadow-2xl">
            <img
              src={data.storyConfig.media}
              alt="Artisan Story"
              className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-stone-900/20 flex items-center justify-center group-hover:bg-stone-900/10 transition-all">
              <div
                style={{ backgroundColor: data.heroSettings.btnColor }}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white shadow-[0_0_40px_rgba(234,88,12,0.5)] group-hover:scale-110 transition-transform"
              >
                <PlayCircle className="w-10 h-10 md:w-12 md:h-12 ml-1" />
              </div>
            </div>
          </div>

          {/* Text Section (Right Side - Card Layout) */}
          <div className="w-full lg:w-2/5">
            <div className="w-full bg-[#292524] border border-stone-700/50 p-8 md:p-12 lg:p-14 rounded-3xl shadow-2xl">
              <span
                style={{ color: data.heroSettings.btnColor }}
                className="font-bold tracking-[0.3em] uppercase text-xs mb-4 block"
              >
                Our Philosophy
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-extrabold mb-6 leading-tight text-white">
                {data.storyConfig.title}
              </h2>
              <p className="text-stone-300 text-base md:text-lg mb-10 leading-relaxed font-light">
                {data.storyConfig.text1}
              </p>
              <div>
                <Link
                  href={data.storyConfig.btnLink}
                  style={{ backgroundColor: data.heroSettings.btnColor }}
                  className="inline-flex items-center gap-3 text-white px-8 py-4 rounded-full font-bold hover:brightness-110 transition-all uppercase tracking-wider text-sm shadow-lg"
                >
                  {data.storyConfig.btnText} <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. THE MASTERPIECES */}
      {data.masterpieceConfig.show && (
        <section className="py-24 bg-stone-100">
          <div className="max-w-7xl mx-auto px-4">
            <SectionHeader
              title="The Masterpieces"
              linkText="View All Masterpieces"
              linkUrl="/collections/masterpieces"
            />
            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${data.masterpieceConfig.columns} gap-8`}
            >
              {[...Array(data.masterpieceConfig.limit)].map((_, i) => (
                <div
                  key={i}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="relative aspect-video overflow-hidden bg-stone-200">
                    <img
                      src={
                        dummyProductImages[(i + 2) % dummyProductImages.length]
                      }
                      alt="Product"
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-8 text-center">
                    <span className="text-orange-500 text-[10px] font-bold uppercase tracking-widest mb-2 block">
                      1 of 1 Edition
                    </span>
                    <h3 className="font-serif font-extrabold text-stone-900 text-2xl mb-2">
                      {dummyProductTitles[(i + 2) % dummyProductTitles.length]}
                    </h3>
                    <p className="text-stone-500 text-sm mb-4">
                      Crafted over 6 months by Master Lama.
                    </p>
                    <p className="font-serif font-bold text-2xl text-stone-800">
                      ${(i * 150 + 450).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. LATEST BLOGS */}
      {data.blogConfig.show && (
        <section className="py-20 bg-white border-t border-stone-200">
          <div className="max-w-7xl mx-auto px-4">
            <SectionHeader
              title="Journal & Heritage"
              linkText="Read All Journals"
              linkUrl="/blogs"
            />
            <div className="flex overflow-x-auto gap-8 pb-8 snap-x hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
              {[...Array(data.blogConfig.limit)].map((_, i) => (
                <Link
                  href={`/blogs/dummy-post-${i}`}
                  key={i}
                  className="w-[85vw] sm:w-[calc(50%-16px)] lg:w-[calc(33.33%-21px)] flex-shrink-0 snap-start group block"
                >
                  <div className="overflow-hidden rounded-2xl mb-6 aspect-[4/3]">
                    <img
                      src={
                        dummyProductImages[(i + 1) % dummyProductImages.length]
                      }
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="flex gap-4 text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
                    <span className="text-orange-500">Craftsmanship</span>
                    <span>•</span>
                    <span>Oct 24, 2026</span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-stone-900 mb-3 group-hover:text-orange-600 transition-colors">
                    The History of Singing Bowls in Monasteries
                  </h3>
                  <p className="text-stone-500 mb-4 line-clamp-2">
                    Discover the ancient techniques used by monks in the
                    Himalayas to create these resonating tools of healing and
                    meditation.
                  </p>
                  <span className="text-sm font-bold text-stone-900 border-b border-stone-900 pb-1 group-hover:text-orange-600 group-hover:border-orange-600 transition-all inline-flex items-center gap-1">
                    Read Article <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 🔥 PRO-ECOMMERCE ADDON 1: Instagram Feed */}
      <section className="bg-stone-50 py-16 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-stone-100 rounded-full text-stone-900 mb-4">
            <InstagramIcon size={24} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">
            Follow Our Journey
          </h2>
          <Link
            href="#"
            className="text-sm text-stone-500 hover:text-orange-600 transition-colors mb-10 inline-block font-bold"
          >
            @yeejuncrafts
          </Link>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {[...Array(6)].map((_, i) => (
              <a
                href="#"
                key={i}
                className="relative aspect-square group overflow-hidden bg-stone-200 block"
              >
                <img
                  src={dummyProductImages[(i + 3) % dummyProductImages.length]}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <InstagramIcon className="text-white" size={24} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 🔥 PRO-ECOMMERCE ADDON 2: Newsletter Signup */}
      <section className="bg-stone-900 text-white py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Mail
            className="mx-auto mb-6 text-orange-500"
            size={40}
            strokeWidth={1.5}
          />
          <h2 className="text-3xl md:text-4xl font-serif font-extrabold mb-4">
            Join The Tribe
          </h2>
          <p className="text-stone-300 mb-8 font-light text-lg">
            Subscribe to get special offers, free giveaways, and
            once-in-a-lifetime deals.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder-stone-400 px-6 py-4 rounded-full outline-none focus:border-orange-500 transition-colors"
              required
            />
            <button
              type="submit"
              className="bg-orange-600 text-white px-8 py-4 rounded-full font-bold hover:bg-orange-700 transition-colors uppercase tracking-widest text-sm"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
