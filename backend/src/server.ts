// Use CommonJS imports to match `backend/package.json` (`type: "commonjs"`).
const Fastify = require("fastify") as typeof import("fastify");
const cors = require("@fastify/cors");
require("dotenv/config");
const { PrismaClient } = require("@prisma/client") as {
  PrismaClient: typeof import("@prisma/client").PrismaClient;
};

const { PrismaPg } = require("@prisma/adapter-pg") as {
  PrismaPg: typeof import("@prisma/adapter-pg").PrismaPg;
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Check backend/.env");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const { generateSlug } = require("./utils/slug") as {
  generateSlug: (title: string) => string;
};

// 🚨 Helpers for strict formatting
function normalizeInt(val: any, fallback = 0) {
  const n = typeof val === "number" ? val : Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeFloat(val: any, fallback = 0) {
  const n = typeof val === "number" ? val : Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeImages(val: any) {
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === "string") return val ? [val] : [];
  return [];
}

function normalizeStringArray(val: any) {
  if (Array.isArray(val)) return val.filter(Boolean).map(String);
  if (typeof val === "string") return val ? [val] : [];
  return [];
}

function normalizeProduct(p: any) {
  return {
    ...p,
    id: typeof p.id === "number" ? p.id : Number(p.id),
    name: p.name ?? p.title ?? "",
    sku: p.sku ?? "",
    slug: p.slug ?? undefined,
    stockQuantity: normalizeInt(p.stockQuantity, 0),
    price: normalizeFloat(p.price, 0),
    images: normalizeImages(p.images),
    videoUrl: p.videoUrl ?? undefined,
    category: p.category ?? "",
    status: p.status ?? "active",
    processingTime: p.processingTime ?? "",
    shippingType: p.shippingType ?? "",
    shippingCost: normalizeFloat(p.shippingCost, 0),
    tags: normalizeStringArray(p.tags),
    materials: normalizeStringArray(p.materials),
    excludedCountries: normalizeStringArray(p.excludedCountries),
    visits: normalizeInt(p.visits, 0),
    favorites: normalizeInt(p.favorites, 0),
    inCart: normalizeInt(p.inCart, 0),
    revenue: normalizeFloat(p.revenue, 0),
    sales: normalizeInt(p.sales, 0),
  };
}

// 🚨 50MB सम्मको डाटा (ठूला फोटोहरू) सपोर्ट गर्ने
const fastify = Fastify({
  logger: true,
  bodyLimit: 50 * 1024 * 1024, // 50MB
});

// 🚨 CORS सेटअप: सबै खाले रिक्वेस्टलाई अनुमति दिने
fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

// ==========================================
// 1. GENERAL ROUTES
// ==========================================
fastify.get("/", async () => {
  return { message: "YEEJUNCRAFTS Backend is running smoothly!" };
});

fastify.get("/dashboard-stats", async () => {
  return {
    ordersOverdue: 2,
    ordersToShip: 5,
    messagesHelp: 1,
    messagesPotential: 3,
    listingsSoldOut: 0,
    listingsExpired: 1,
    totalViews: 2450,
    visits: 1120,
    ordersStat: 15,
    revenue: 5600,
    totalSales: 150,
    activeListings: 45,
  };
});

fastify.post("/settings", async (request, reply) => {
  const { shopAvatar, bgType, bgValue } = request.body as {
    shopAvatar?: string;
    bgType?: string;
    bgValue?: string;
  };

  try {
    const saved = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {
        shopAvatar: shopAvatar ?? null,
        bgType: bgType ?? null,
        bgValue: bgValue ?? null,
      },
      create: {
        id: 1,
        shopAvatar: shopAvatar ?? null,
        bgType: bgType ?? null,
        bgValue: bgValue ?? null,
      },
    });
    return saved;
  } catch (err) {
    fastify.log.error(err);
    return reply.code(500).send({ error: "Database settings update failed" });
  }
});

// ==========================================
// 2. PRODUCT ROUTES
// ==========================================
fastify.get("/products", async (request, reply) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return products.map(normalizeProduct);
  } catch (err) {
    fastify.log.error(err);
    return reply.code(500).send({ error: "Database fetch failed" });
  }
});

fastify.get("/products/:id", async (request, reply) => {
  const idNum = Number((request.params as any).id);
  if (!Number.isFinite(idNum))
    return reply.code(400).send({ error: "Invalid id" });

  try {
    const product = await prisma.product.findUnique({ where: { id: idNum } });
    if (!product) return reply.code(404).send({ error: "Product not found" });
    return normalizeProduct(product);
  } catch (err) {
    fastify.log.error(err);
    return reply.code(500).send({ error: "Database fetch failed" });
  }
});

fastify.delete("/products/:id", async (request, reply) => {
  const idNum = Number((request.params as any).id);
  if (!Number.isFinite(idNum))
    return reply.code(400).send({ error: "Invalid id" });

  try {
    await prisma.product.delete({ where: { id: idNum } });
    return { ok: true };
  } catch (err) {
    fastify.log.error(err);
    return reply.code(400).send({ error: "Failed to delete from database" });
  }
});

fastify.patch("/products/:id", async (request, reply) => {
  const idNum = Number((request.params as any).id);
  if (!Number.isFinite(idNum))
    return reply.code(400).send({ error: "Invalid id" });

  const body = request.body as any;
  const updateData: any = {};

  if (body.name !== undefined) updateData.name = body.name;
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.sku !== undefined) updateData.sku = body.sku;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.price !== undefined) updateData.price = normalizeFloat(body.price);
  if (body.stockQuantity !== undefined)
    updateData.stockQuantity = normalizeInt(body.stockQuantity);
  if (body.category !== undefined) updateData.category = body.category;
  if (body.processingTime !== undefined)
    updateData.processingTime = body.processingTime;
  if (body.shippingType !== undefined)
    updateData.shippingType = body.shippingType;
  if (body.shippingCost !== undefined)
    updateData.shippingCost = normalizeFloat(body.shippingCost);

  if (body.tags !== undefined)
    updateData.tags = normalizeStringArray(body.tags);
  if (body.materials !== undefined)
    updateData.materials = normalizeStringArray(body.materials);
  if (body.excludedCountries !== undefined)
    updateData.excludedCountries = normalizeStringArray(body.excludedCountries);
  if (body.images !== undefined)
    updateData.images = normalizeImages(body.images);
  if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl;

  try {
    const updated = await prisma.product.update({
      where: { id: idNum },
      data: updateData,
    });
    return normalizeProduct(updated);
  } catch (err: any) {
    fastify.log.error(err);
    if (err.code === "P2002") {
      return reply
        .code(400)
        .send({ error: "SKU must be unique! This SKU is already in use." });
    }
    return reply.code(400).send({ error: "Database update failed." });
  }
});

fastify.post("/products", async (request, reply) => {
  const body = request.body as any;

  const name = body.name ?? body.title ?? "";
  const sku = body.sku ?? `SKU-${Date.now()}`;
  const slug = body.slug ?? `${generateSlug(name)}-${Date.now()}`;

  const data: any = {
    slug,
    sku,
    name,
    title: body.title ?? name ?? "",
    description: body.description ?? "",
    metaTitle: body.metaTitle ?? "",
    metaDesc: body.metaDesc ?? "",
    altText: body.altText ?? "",
    tags: normalizeStringArray(body.tags),
    materials: normalizeStringArray(body.materials),
    excludedCountries: normalizeStringArray(body.excludedCountries),
    stockQuantity: normalizeInt(body.stockQuantity, 0),
    price: normalizeFloat(body.price, 0),
    images: normalizeImages(body.images),
    videoUrl: body.videoUrl ?? null,
    category: body.category ?? "",
    status: body.status ?? "active",
    processingTime: body.processingTime ?? "",
    shippingType: body.shippingType ?? "",
    shippingCost: normalizeFloat(body.shippingCost, 0),
    visits: normalizeInt(body.visits, 0),
    favorites: normalizeInt(body.favorites, 0),
    inCart: normalizeInt(body.inCart, 0),
    revenue: normalizeFloat(body.revenue, 0),
    sales: normalizeInt(body.sales, 0),
  };

  try {
    const created = await prisma.product.create({ data });
    return normalizeProduct(created);
  } catch (err: any) {
    fastify.log.error(err);
    if (err.code === "P2002") {
      return reply.code(400).send({ error: "SKU or Slug already exists!" });
    }
    return reply.code(400).send({ error: "Failed to save to database." });
  }
});

// ==========================================
// 3. HEADER SETTINGS ROUTES
// ==========================================
fastify.get("/header-settings", async () => {
  const settings = await prisma.headerSettings.findUnique({ where: { id: 1 } });
  if (settings) return settings;

  // यदि छैन भने नयाँ बनाउने
  return await prisma.headerSettings.create({ data: { id: 1, navLinks: [] } });
});

// 🚨 SUPER SAFE POST ROUTE (यसले कहिल्यै एरर फाल्दैन)
fastify.post("/header-settings", async (request: any, reply) => {
  try {
    const body = request.body || {};

    // 🚨 ब्याकइन्डमा आउने हरेक डाटालाई Prisma Schema अनुसार ठ्याक्कै मिलाउने (Sanitize)
    const safeData = {
      topBarAlignment:
        body.topBarAlignment !== undefined
          ? String(body.topBarAlignment)
          : undefined,
      navBgColor:
        body.navBgColor !== undefined ? String(body.navBgColor) : undefined,

      topBarText:
        body.topBarText !== undefined ? String(body.topBarText) : undefined,
      topBarFontSize:
        body.topBarFontSize !== undefined
          ? String(body.topBarFontSize)
          : undefined,
      topBarBgColor:
        body.topBarBgColor !== undefined
          ? String(body.topBarBgColor)
          : undefined,
      topBarTextColor:
        body.topBarTextColor !== undefined
          ? String(body.topBarTextColor)
          : undefined,
      topBarSpeed:
        body.topBarSpeed !== undefined
          ? Number(body.topBarSpeed) || 15
          : undefined,

      logoUrl: body.logoUrl !== undefined ? String(body.logoUrl) : undefined,
      logoWidth:
        body.logoWidth !== undefined
          ? Number(body.logoWidth) || 150
          : undefined,
      logoHeight:
        body.logoHeight !== undefined
          ? Number(body.logoHeight) || 50
          : undefined,

      headerBgColor:
        body.headerBgColor !== undefined
          ? String(body.headerBgColor)
          : undefined,
      searchBarBgColor:
        body.searchBarBgColor !== undefined
          ? String(body.searchBarBgColor)
          : undefined,

      navAlignment:
        body.navAlignment !== undefined ? String(body.navAlignment) : undefined,
      primaryFontFamily:
        body.primaryFontFamily !== undefined
          ? String(body.primaryFontFamily)
          : undefined,
      navTextColor:
        body.navTextColor !== undefined ? String(body.navTextColor) : undefined,
      navHoverColor:
        body.navHoverColor !== undefined
          ? String(body.navHoverColor)
          : undefined,

      navLinks: body.navLinks ? body.navLinks : undefined, // JSON format
    };

    // undefined भएका भ्यालुहरूलाई हटाउने (Prisma ले undefined मन पराउँदैन)
    Object.keys(safeData).forEach((key) => {
      if (safeData[key as keyof typeof safeData] === undefined) {
        delete safeData[key as keyof typeof safeData];
      }
    });

    const saved = await prisma.headerSettings.upsert({
      where: { id: 1 },
      update: safeData,
      create: { id: 1, ...safeData, navLinks: safeData.navLinks || [] },
    });

    return saved;
  } catch (err: any) {
    fastify.log.error(err);
    // 🚨 कुन फिल्डले गर्दा एरर आयो ठ्याक्कै देखाउन
    return reply.code(500).send({ error: `Database error: ${err.message}` });
  }
});

// PATCH ROUTE (त्यही Safe Data लजिक प्रयोग गरेर)
fastify.patch("/header-settings", async (request: any, reply) => {
  try {
    const body = request.body || {};

    const safeData = {
      // ... (माथिको Safe Data जस्तै सबै फिल्डहरू राख्ने)
      topBarText:
        body.topBarText !== undefined ? String(body.topBarText) : undefined,
      topBarFontSize:
        body.topBarFontSize !== undefined
          ? String(body.topBarFontSize)
          : undefined,
      topBarBgColor:
        body.topBarBgColor !== undefined
          ? String(body.topBarBgColor)
          : undefined,
      topBarTextColor:
        body.topBarTextColor !== undefined
          ? String(body.topBarTextColor)
          : undefined,
      topBarSpeed:
        body.topBarSpeed !== undefined
          ? Number(body.topBarSpeed) || 15
          : undefined,
      logoUrl: body.logoUrl !== undefined ? String(body.logoUrl) : undefined,
      logoWidth:
        body.logoWidth !== undefined
          ? Number(body.logoWidth) || 150
          : undefined,
      logoHeight:
        body.logoHeight !== undefined
          ? Number(body.logoHeight) || 50
          : undefined,
      headerBgColor:
        body.headerBgColor !== undefined
          ? String(body.headerBgColor)
          : undefined,
      searchBarBgColor:
        body.searchBarBgColor !== undefined
          ? String(body.searchBarBgColor)
          : undefined,
      navAlignment:
        body.navAlignment !== undefined ? String(body.navAlignment) : undefined,
      primaryFontFamily:
        body.primaryFontFamily !== undefined
          ? String(body.primaryFontFamily)
          : undefined,
      navTextColor:
        body.navTextColor !== undefined ? String(body.navTextColor) : undefined,
      navHoverColor:
        body.navHoverColor !== undefined
          ? String(body.navHoverColor)
          : undefined,
      navLinks: body.navLinks ? body.navLinks : undefined,
    };

    Object.keys(safeData).forEach((key) => {
      if (safeData[key as keyof typeof safeData] === undefined) {
        delete safeData[key as keyof typeof safeData];
      }
    });

    const updated = await prisma.headerSettings.update({
      where: { id: 1 },
      data: safeData,
    });
    return updated;
  } catch (err: any) {
    fastify.log.error(err);
    return reply.code(400).send({ error: `Update failed: ${err.message}` });
  }
});

fastify.addHook("onClose", async () => {
  await prisma.$disconnect();
});

// Footer Settings GET
fastify.get("/footer-settings", async () => {
  const settings = await prisma.footerSettings.findUnique({ where: { id: 1 } });
  return settings || (await prisma.footerSettings.create({ data: { id: 1 } }));
});

// Footer Settings UPDATE (POST/UPSERT)
fastify.post("/footer-settings", async (request: any) => {
  const data = request.body;
  return await prisma.footerSettings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });
});

// Home Page Settings GET & POST
fastify.get("/home-settings", async () => {
  const settings = await prisma.homePageSettings.findUnique({
    where: { id: 1 },
  });
  return (
    settings || (await prisma.homePageSettings.create({ data: { id: 1 } }))
  );
});

fastify.post("/home-settings", async (request: any) => {
  const data = request.body;
  return await prisma.homePageSettings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: 8080, host: "0.0.0.0" });
    console.log(
      "🚀 Fastify Server running with STRICT PostgreSQL on http://localhost:8080",
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
