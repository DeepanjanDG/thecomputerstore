import { existsSync, readFileSync } from "node:fs";
/* eslint-disable no-console */
import { PrismaClient, type BuilderSlot, type SpecType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATEGORIES } from "./seed/categories";
import { PRODUCTS } from "./seed/products";
import { TEMPLATES } from "./seed/templates";
import { RULES } from "../src/lib/compat/rules";
import { DEFAULT_POWER, DEFAULT_SCORING } from "../src/lib/compat/defaults";
import { validateBuild } from "../src/lib/compat/service";
import type { BuildItems, BuilderProduct, Slot } from "../src/lib/compat/types";
import { buildSearchText, slugify } from "../src/lib/search-text";
import { brandLogo } from "../src/lib/brand-logos";
import { DEFAULT_AUTOBUILD, DEFAULT_HOME } from "../src/server/settings-defaults";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding The Computer Store…");

  // Categories + spec schemas
  const catIds = new Map<string, string>();
  const specIds = new Map<string, { id: string; type: SpecType }>();
  for (const [i, c] of CATEGORIES.entries()) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      create: { slug: c.slug, name: c.name, shortName: c.shortName, group: c.group, description: c.description, builderSlot: (c.builderSlot as BuilderSlot) ?? null, sortOrder: i },
      update: { name: c.name, shortName: c.shortName, group: c.group, description: c.description, builderSlot: (c.builderSlot as BuilderSlot) ?? null, sortOrder: i },
    });
    catIds.set(c.slug, cat.id);
    for (const [j, s] of c.specs.entries()) {
      const data = {
        label: s.label, type: s.type as SpecType, unit: s.unit ?? null, options: s.options ?? null,
        group: s.group ?? "Specifications", isKey: !!s.isKey, filterable: !!s.filterable, required: !!s.required, sortOrder: j,
      };
      const def = await prisma.specDefinition.upsert({
        where: { categoryId_key: { categoryId: cat.id, key: s.key } },
        create: { categoryId: cat.id, key: s.key, ...data },
        update: data,
      });
      specIds.set(`${c.slug}:${s.key}`, { id: def.id, type: def.type });
    }
  }
  console.log(`  ${CATEGORIES.length} categories`);

  // Brands
  const brandIds = new Map<string, string>();
  for (const name of [...new Set(PRODUCTS.map((p) => p.brand))].sort()) {
    const logoUrl = brandLogo(name)?.file ?? null;
    const b = await prisma.brand.upsert({ where: { slug: slugify(name) }, create: { slug: slugify(name), name, logoUrl }, update: { name, logoUrl } });
    brandIds.set(name, b.id);
  }
  console.log(`  ${brandIds.size} brands`);

  // Products
  const productIdBySku = new Map<string, string>();
  for (const p of PRODUCTS) {
    const catName = CATEGORIES.find((c) => c.slug === p.category)!.name;
    const base = {
      name: p.name, model: p.model ?? null, shortDesc: p.shortDesc ?? null,
      categoryId: catIds.get(p.category)!, brandId: brandIds.get(p.brand)!,
      price: p.price, mrp: p.mrp, warranty: p.warranty, isFeatured: !!p.featured, isDeal: !!p.deal,
      popularity: p.popularity ?? 10, rating: p.rating ?? null, ratingCount: p.rating ? Math.round((p.popularity ?? 10) * 3.7) : 0,
      releasedAt: p.released ? new Date(`${p.released}-01`) : null,
      searchText: buildSearchText({ name: p.name, model: p.model, sku: p.sku, brand: p.brand, category: catName, specs: p.specs }),
      description: p.shortDesc ?? null,
    };
    const prod = await prisma.product.upsert({
      where: { sku: p.sku },
      create: { sku: p.sku, slug: slugify(p.name), ...base },
      update: base,
    });
    productIdBySku.set(p.sku, prod.id);
    await prisma.inventory.upsert({
      where: { productId_location: { productId: prod.id, location: "SHILLONG-MAIN" } },
      create: { productId: prod.id, quantity: p.stock },
      update: { quantity: p.stock },
    });
    if ((await prisma.priceHistory.count({ where: { productId: prod.id } })) === 0)
      await prisma.priceHistory.create({ data: { productId: prod.id, price: p.price, mrp: p.mrp } });
    for (const [key, value] of Object.entries(p.specs)) {
      const def = specIds.get(`${p.category}:${key}`);
      if (!def) throw new Error(`Unknown spec ${p.category}:${key} on ${p.sku}`);
      const v = {
        valueNum: def.type === "NUMBER" ? Number(value) : null,
        valueBool: def.type === "BOOLEAN" ? Boolean(value) : null,
        valueText: def.type === "TEXT" ? String(value) : def.type === "LIST" ? (Array.isArray(value) ? value.join(",") : String(value)) : null,
      };
      await prisma.productSpec.upsert({
        where: { productId_specId: { productId: prod.id, specId: def.id } },
        create: { productId: prod.id, specId: def.id, ...v },
        update: v,
      });
    }
  }
  console.log(`  ${PRODUCTS.length} products`);

  // Official product images downloaded by scripts/fetch-product-images.mjs
  const imgManifestPath = "public/products/manifest.json";
  if (existsSync(imgManifestPath)) {
    const imgs = JSON.parse(readFileSync(imgManifestPath, "utf8")) as Record<string, { file: string }>;
    for (const [sku, v] of Object.entries(imgs)) {
      const productId = productIdBySku.get(sku);
      if (!productId) continue;
      await prisma.productImage.deleteMany({ where: { productId, url: v.file } });
      await prisma.productImage.create({ data: { productId, url: v.file, alt: sku, sortOrder: -1 } });
    }
    console.log(`  ${Object.keys(imgs).length} product images`);
  }

  // Templates — validated by the compatibility engine
  const bySku = new Map(PRODUCTS.map((p) => [p.sku, p]));
  for (const [i, t] of TEMPLATES.entries()) {
    const items: BuildItems = {};
    for (const [slot, ref] of Object.entries(t.items)) {
      const [sku, qty] = Array.isArray(ref) ? ref : [ref, 1];
      const p = bySku.get(sku);
      if (!p) throw new Error(`Template ${t.slug} references unknown SKU ${sku}`);
      items[slot as Slot] = { qty, product: toBuilderProduct(p, slot as Slot) };
    }
    const report = validateBuild(items);
    const total = Object.values(items).reduce((s, l) => s + l!.product.price * l!.qty, 0);
    const issues = [...report.errors, ...report.warnings].map((r) => r.message);
    console.log(`  template ${t.name.padEnd(26)} ₹${total.toLocaleString("en-IN").padStart(9)}  ${report.status}${issues.length ? "\n      " + issues.join("\n      ") : ""}`);
    if (report.errors.length) throw new Error(`Template ${t.slug} is incompatible`);

    const data = {
      name: t.name, tagline: t.tagline, description: t.description, useCase: t.useCase, resolution: t.resolution ?? null,
      priceLabel: t.priceLabel || null, isShowcase: !!t.isShowcase, accent: t.accent ?? null, sortOrder: i,
    };
    const tpl = await prisma.buildTemplate.upsert({ where: { slug: t.slug }, create: { slug: t.slug, ...data }, update: data });
    await prisma.buildTemplateItem.deleteMany({ where: { templateId: tpl.id } });
    await prisma.buildTemplateItem.createMany({
      data: Object.entries(t.items).map(([slot, ref]) => {
        const [sku, qty] = Array.isArray(ref) ? ref : [ref, 1];
        return { templateId: tpl.id, slot: slot as BuilderSlot, productId: productIdBySku.get(sku)!, quantity: qty };
      }),
    });
  }

  // Compatibility rule configuration rows
  for (const r of RULES) {
    await prisma.compatibilityRule.upsert({
      where: { id: r.id },
      create: { id: r.id, title: r.title, description: r.description, params: (r.defaultParams ?? {}) as object },
      update: { title: r.title, description: r.description },
    });
  }
  console.log(`  ${RULES.length} compatibility rules`);

  // Settings
  const settings: Record<string, unknown> = { power: DEFAULT_POWER, scoring: DEFAULT_SCORING, autobuild: DEFAULT_AUTOBUILD, home: DEFAULT_HOME };
  for (const [key, value] of Object.entries(settings))
    await prisma.setting.upsert({ where: { key }, create: { key, value: value as object }, update: {} });

  // Coupons
  await prisma.coupon.upsert({
    where: { code: "WELCOME5" }, update: {},
    create: { code: "WELCOME5", description: "5% off your first order (up to ₹2,000)", type: "PERCENT", value: 5, minOrder: 10000, maxDiscount: 2000 },
  });
  await prisma.coupon.upsert({
    where: { code: "BUILD1000" }, update: {},
    create: { code: "BUILD1000", description: "₹1,000 off custom PC builds above ₹50,000", type: "FLAT", value: 1000, minOrder: 50000 },
  });

  // Admin
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@thecomputerstore.local";
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (password) {
    await prisma.user.upsert({
      where: { email },
      create: { email, name: "Store Admin", role: "ADMIN", passwordHash: await bcrypt.hash(password, 10) },
      update: { role: "ADMIN" },
    });
    console.log(`  admin user ${email}`);
  } else {
    console.log("  SEED_ADMIN_PASSWORD not set — skipped admin user");
  }
  console.log("Done.");
}

function toBuilderProduct(p: (typeof PRODUCTS)[number], slot: Slot): BuilderProduct {
  return {
    id: p.sku, slug: slugify(p.name), name: p.name, brand: p.brand, slot, categorySlug: p.category,
    price: p.price, mrp: p.mrp, gstRate: 18, stock: p.stock, specs: p.specs,
  };
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
