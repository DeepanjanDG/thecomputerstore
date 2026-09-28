"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { BuilderSlot, CouponType, OrderStatus, PaymentStatus, Prisma, ProductStatus, QuoteStatus, SpecType } from "@prisma/client";
import { db } from "../db";
import { requireAdmin } from "../auth";
import { CONFIG_TAG } from "../config";
import { storage } from "../storage";
import { buildSearchText, slugify } from "@/lib/search-text";
import { SLOTS } from "@/lib/compat/types";
import { HOME_MAX_REVIEWS, HOME_MAX_STATS, readRow, reviewRowSchema, statRowSchema } from "../home-content-form";

export interface ActionState { error?: string; ok?: string }

const fail = (e: unknown): ActionState => {
  if (e instanceof z.ZodError) return { error: e.issues[0]?.message ?? "Invalid input" };
  if ((e as { code?: string }).code === "P2002") return { error: "That value must be unique — something with the same slug/SKU/code already exists." };
  if (e && typeof e === "object" && "digest" in e && String((e as { digest: string }).digest).startsWith("NEXT_REDIRECT")) throw e;
  return { error: e instanceof Error ? e.message : "Something went wrong" };
};

// ───────────────────────── Products ─────────────────────────

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(3, "Name is required"),
  sku: z.string().trim().min(2, "SKU is required").max(40),
  slug: z.string().trim().optional(),
  model: z.string().trim().optional(),
  categoryId: z.string().min(1, "Choose a category"),
  brandId: z.string().min(1, "Choose a brand"),
  price: z.coerce.number().int().min(0),
  mrp: z.coerce.number().int().min(0),
  gstRate: z.coerce.number().int().min(0).max(28),
  stock: z.coerce.number().int().min(0),
  warranty: z.string().trim().optional(),
  shortDesc: z.string().trim().max(300).optional(),
  description: z.string().trim().max(5000).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  isFeatured: z.coerce.boolean().optional(),
  isDeal: z.coerce.boolean().optional(),
  popularity: z.coerce.number().int().min(0).max(1000).default(10),
  releasedAt: z.string().optional(),
});

export async function saveProductAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const raw = Object.fromEntries(form);
    const d = productSchema.parse({ ...raw, isFeatured: raw.isFeatured === "on", isDeal: raw.isDeal === "on" });
    if (d.mrp < d.price) return { error: "MRP can't be lower than the selling price." };
    const [cat, brand, defs] = await Promise.all([
      db.category.findUniqueOrThrow({ where: { id: d.categoryId } }),
      db.brand.findUniqueOrThrow({ where: { id: d.brandId } }),
      db.specDefinition.findMany({ where: { categoryId: d.categoryId } }),
    ]);

    // Structured specs: fields named spec.<key>
    const specValues: { specId: string; valueNum: number | null; valueText: string | null; valueBool: boolean | null }[] = [];
    const searchSpecs: Record<string, unknown> = {};
    for (const def of defs) {
      const v = form.get(`spec.${def.key}`);
      const s = typeof v === "string" ? v.trim() : "";
      if (def.type === "BOOLEAN") {
        if (s === "") continue;
        specValues.push({ specId: def.id, valueBool: s === "true", valueNum: null, valueText: null });
        continue;
      }
      if (!s) {
        if (def.required) return { error: `${def.label} is required for ${cat.name} — the compatibility engine needs it.` };
        continue;
      }
      if (def.type === "NUMBER") {
        const n = Number(s);
        if (Number.isNaN(n)) return { error: `${def.label} must be a number.` };
        specValues.push({ specId: def.id, valueNum: n, valueText: null, valueBool: null });
      } else {
        const text = def.type === "LIST" ? s.split(",").map((x) => x.trim()).filter(Boolean).join(",") : s;
        specValues.push({ specId: def.id, valueText: text, valueNum: null, valueBool: null });
      }
      searchSpecs[def.key] = s;
    }

    const data: Prisma.ProductUncheckedCreateInput = {
      name: d.name, sku: d.sku.toUpperCase(), slug: d.slug ? slugify(d.slug) : slugify(d.name), model: d.model || null,
      categoryId: d.categoryId, brandId: d.brandId, price: d.price, mrp: d.mrp, gstRate: d.gstRate, warranty: d.warranty || null,
      shortDesc: d.shortDesc || null, description: d.description || null, status: d.status as ProductStatus,
      isFeatured: !!d.isFeatured, isDeal: !!d.isDeal, popularity: d.popularity,
      releasedAt: d.releasedAt ? new Date(d.releasedAt) : null,
      searchText: buildSearchText({ name: d.name, model: d.model, sku: d.sku, brand: brand.name, category: cat.name, specs: searchSpecs }),
    };

    const id = await db.$transaction(async (tx) => {
      let productId = d.id;
      if (productId) {
        const before = await tx.product.findUniqueOrThrow({ where: { id: productId } });
        await tx.product.update({ where: { id: productId }, data });
        if (before.price !== d.price || before.mrp !== d.mrp) await tx.priceHistory.create({ data: { productId, price: d.price, mrp: d.mrp } });
      } else {
        productId = (await tx.product.create({ data })).id;
        await tx.priceHistory.create({ data: { productId, price: d.price, mrp: d.mrp } });
      }
      await tx.productSpec.deleteMany({ where: { productId } });
      if (specValues.length) await tx.productSpec.createMany({ data: specValues.map((v) => ({ ...v, productId: productId! })) });
      await tx.inventory.upsert({
        where: { productId_location: { productId, location: "SHILLONG-MAIN" } },
        create: { productId, quantity: d.stock },
        update: { quantity: d.stock },
      });
      return productId;
    });

    // Images (optional uploads)
    const files = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length) {
      const count = await db.productImage.count({ where: { productId: id } });
      for (const [i, f] of files.entries()) {
        const { url } = await storage().put({ name: f.name, type: f.type, data: Buffer.from(await f.arrayBuffer()) });
        await db.productImage.create({ data: { productId: id, url, alt: d.name, sortOrder: count + i } });
      }
    }
    revalidatePath("/", "layout");
    if (!d.id) redirect(`/admin/products/${id}?saved=1`);
    return { ok: "Product saved." };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteProductImageAction(form: FormData) {
  await requireAdmin();
  const id = String(form.get("imageId"));
  const img = await db.productImage.delete({ where: { id } });
  revalidatePath(`/admin/products/${img.productId}`);
}

export async function quickUpdateProductAction(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id"));
  const price = Number(form.get("price"));
  const stock = Number(form.get("stock"));
  const p = await db.product.findUniqueOrThrow({ where: { id } });
  if (Number.isFinite(price) && price !== p.price) {
    await db.product.update({ where: { id }, data: { price, mrp: Math.max(p.mrp, price) } });
    await db.priceHistory.create({ data: { productId: id, price, mrp: Math.max(p.mrp, price) } });
  }
  if (Number.isFinite(stock))
    await db.inventory.upsert({ where: { productId_location: { productId: id, location: "SHILLONG-MAIN" } }, create: { productId: id, quantity: stock }, update: { quantity: stock } });
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}

// ───────────────────────── Categories, specs & brands ─────────────────────────

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2),
  slug: z.string().trim().optional(),
  shortName: z.string().trim().optional(),
  group: z.string().trim().min(2),
  description: z.string().trim().optional(),
  builderSlot: z.union([z.enum(SLOTS), z.literal("")]).optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().optional(),
  seoTitle: z.string().trim().optional(),
  seoDesc: z.string().trim().optional(),
});

export async function saveCategoryAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const raw = Object.fromEntries(form);
    const d = categorySchema.parse({ ...raw, isActive: raw.isActive === "on" });
    const data = {
      name: d.name, slug: slugify(d.slug || d.name), shortName: d.shortName || null, group: d.group, description: d.description || null,
      builderSlot: (d.builderSlot || null) as BuilderSlot | null, sortOrder: d.sortOrder, isActive: !!d.isActive,
      seoTitle: d.seoTitle || null, seoDesc: d.seoDesc || null,
    };
    if (d.id) await db.category.update({ where: { id: d.id }, data });
    else {
      const c = await db.category.create({ data });
      revalidatePath("/", "layout");
      redirect(`/admin/categories/${c.id}`);
    }
    revalidatePath("/", "layout");
    return { ok: "Category saved." };
  } catch (e) {
    return fail(e);
  }
}

const specDefSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string(),
  key: z.string().trim().regex(/^[a-zA-Z][a-zA-Z0-9]*$/, "Key must be camelCase letters/numbers, e.g. maxGpuLength"),
  label: z.string().trim().min(1),
  type: z.enum(["NUMBER", "TEXT", "BOOLEAN", "LIST"]),
  unit: z.string().trim().optional(),
  options: z.string().trim().optional(),
  group: z.string().trim().default("Specifications"),
  sortOrder: z.coerce.number().int().default(0),
});

export async function saveSpecDefAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const raw = Object.fromEntries(form);
    const d = specDefSchema.parse(raw);
    const flags = { isKey: raw.isKey === "on", filterable: raw.filterable === "on", required: raw.required === "on" };
    const data = { key: d.key, label: d.label, type: d.type as SpecType, unit: d.unit || null, options: d.options || null, group: d.group, sortOrder: d.sortOrder, ...flags };
    if (d.id) await db.specDefinition.update({ where: { id: d.id }, data });
    else await db.specDefinition.create({ data: { ...data, categoryId: d.categoryId } });
    revalidatePath(`/admin/categories/${d.categoryId}`);
    return { ok: "Specification saved." };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteSpecDefAction(form: FormData) {
  await requireAdmin();
  const def = await db.specDefinition.delete({ where: { id: String(form.get("id")) } });
  revalidatePath(`/admin/categories/${def.categoryId}`);
}

export async function saveBrandAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const d = z.object({ id: z.string().optional(), name: z.string().trim().min(1), logoUrl: z.string().trim().optional() }).parse(Object.fromEntries(form));
    const data = { name: d.name, slug: slugify(d.name), logoUrl: d.logoUrl || null };
    if (d.id) await db.brand.update({ where: { id: d.id }, data });
    else await db.brand.create({ data });
    revalidatePath("/admin/brands");
    return { ok: "Brand saved." };
  } catch (e) {
    return fail(e);
  }
}

// ───────────────────────── Quotes & orders ─────────────────────────

export async function updateQuoteAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const d = z.object({ id: z.string(), status: z.enum(["NEW", "CONTACTED", "QUOTED", "CONFIRMED", "COMPLETED", "CANCELLED"]), adminNotes: z.string().max(5000).optional() }).parse(Object.fromEntries(form));
    await db.quote.update({ where: { id: d.id }, data: { status: d.status as QuoteStatus, adminNotes: d.adminNotes || null } });
    revalidatePath("/admin/quotes");
    return { ok: "Quote updated." };
  } catch (e) {
    return fail(e);
  }
}

export async function updateOrderAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const d = z.object({
      id: z.string(),
      status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "READY", "SHIPPED", "DELIVERED", "CANCELLED"]),
      paymentStatus: z.enum(["UNPAID", "PAID", "REFUNDED", "FAILED"]),
      paymentRef: z.string().trim().max(100).optional(),
    }).parse(Object.fromEntries(form));
    const order = await db.order.findUniqueOrThrow({ where: { id: d.id }, include: { items: true } });
    await db.$transaction(async (tx) => {
      await tx.order.update({ where: { id: d.id }, data: { status: d.status as OrderStatus, paymentStatus: d.paymentStatus as PaymentStatus, paymentRef: d.paymentRef || null } });
      // Stock: reserved on order; deducted when delivered/handed over; released on cancel.
      const release = order.status !== "CANCELLED" && d.status === "CANCELLED";
      const fulfil = order.status !== "DELIVERED" && d.status === "DELIVERED";
      if (release || fulfil)
        for (const i of order.items) {
          if (!i.productId) continue;
          await tx.inventory.updateMany({
            where: { productId: i.productId, location: "SHILLONG-MAIN" },
            data: fulfil ? { reserved: { decrement: i.quantity }, quantity: { decrement: i.quantity } } : { reserved: { decrement: i.quantity } },
          });
        }
    });
    revalidatePath("/admin/orders");
    return { ok: "Order updated." };
  } catch (e) {
    return fail(e);
  }
}

// ───────────────────────── Templates ─────────────────────────

export async function saveTemplateAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const raw = Object.fromEntries(form);
    const d = z.object({
      id: z.string().optional(),
      name: z.string().trim().min(2),
      slug: z.string().trim().optional(),
      tagline: z.string().trim().optional(),
      description: z.string().trim().optional(),
      useCase: z.enum(["gaming", "creator", "productivity", "workstation", "home"]),
      resolution: z.string().trim().optional(),
      priceLabel: z.string().trim().optional(),
      accent: z.string().trim().optional(),
      sortOrder: z.coerce.number().int().default(0),
    }).parse(raw);
    const data = {
      name: d.name, slug: slugify(d.slug || d.name), tagline: d.tagline || null, description: d.description || null, useCase: d.useCase,
      resolution: d.resolution || null, priceLabel: d.priceLabel || null, accent: d.accent || null, sortOrder: d.sortOrder,
      isShowcase: raw.isShowcase === "on", isActive: raw.isActive === "on",
    };
    const items = SLOTS.flatMap((slot) => {
      const pid = form.get(`item.${slot}`);
      const qty = Number(form.get(`qty.${slot}`) ?? 1) || 1;
      return typeof pid === "string" && pid ? [{ slot: slot as BuilderSlot, productId: pid, quantity: qty }] : [];
    });
    const id = await db.$transaction(async (tx) => {
      const t = d.id ? await tx.buildTemplate.update({ where: { id: d.id }, data }) : await tx.buildTemplate.create({ data });
      await tx.buildTemplateItem.deleteMany({ where: { templateId: t.id } });
      if (items.length) await tx.buildTemplateItem.createMany({ data: items.map((i) => ({ ...i, templateId: t.id })) });
      return t.id;
    });
    revalidatePath("/", "layout");
    if (!d.id) redirect(`/admin/templates/${id}`);
    return { ok: "Template saved." };
  } catch (e) {
    return fail(e);
  }
}

// ───────────────────────── Coupons ─────────────────────────

export async function saveCouponAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const raw = Object.fromEntries(form);
    const d = z.object({
      code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,30}$/, "Codes use letters, numbers, - or _"),
      description: z.string().trim().optional(),
      type: z.enum(["PERCENT", "FLAT"]),
      value: z.coerce.number().int().min(1),
      minOrder: z.coerce.number().int().min(0).default(0),
      maxDiscount: z.coerce.number().int().min(0).optional().or(z.literal("")),
      usageLimit: z.coerce.number().int().min(1).optional().or(z.literal("")),
      endsAt: z.string().optional(),
    }).parse(raw);
    if (d.type === "PERCENT" && d.value > 90) return { error: "Percentage discounts must be 90% or less." };
    const data = {
      description: d.description || null, type: d.type as CouponType, value: d.value, minOrder: d.minOrder,
      maxDiscount: d.maxDiscount === "" || d.maxDiscount == null ? null : Number(d.maxDiscount),
      usageLimit: d.usageLimit === "" || d.usageLimit == null ? null : Number(d.usageLimit),
      endsAt: d.endsAt ? new Date(d.endsAt) : null,
      isActive: raw.isActive === "on",
    };
    await db.coupon.upsert({ where: { code: d.code }, create: { code: d.code, ...data }, update: data });
    revalidatePath("/admin/coupons");
    return { ok: `Coupon ${d.code} saved.` };
  } catch (e) {
    return fail(e);
  }
}

export async function toggleCouponAction(form: FormData) {
  await requireAdmin();
  const c = await db.coupon.findUniqueOrThrow({ where: { id: String(form.get("id")) } });
  await db.coupon.update({ where: { id: c.id }, data: { isActive: !c.isActive } });
  revalidatePath("/admin/coupons");
}

// ───────────────────────── Compatibility, scoring & content ─────────────────────────

export async function saveRuleAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const raw = Object.fromEntries(form);
    const d = z.object({ id: z.string(), severity: z.enum(["", "error", "warning", "info"]), params: z.string() }).parse(raw);
    let params: object;
    try {
      params = JSON.parse(d.params || "{}");
    } catch {
      return { error: "Parameters must be valid JSON, e.g. {\"tightMm\": 10}" };
    }
    await db.compatibilityRule.update({ where: { id: d.id }, data: { enabled: raw.enabled === "on", severity: d.severity || null, params } });
    revalidateTag(CONFIG_TAG);
    return { ok: "Rule updated." };
  } catch (e) {
    return fail(e);
  }
}

export async function saveSettingAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const key = z.enum(["power", "scoring", "autobuild", "home"]).parse(form.get("key"));
    let value: object;
    try {
      value = JSON.parse(String(form.get("value")));
    } catch {
      return { error: "That isn't valid JSON — check commas and quotes." };
    }
    await db.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
    revalidateTag(CONFIG_TAG);
    revalidatePath("/", "layout");
    return { ok: "Settings saved." };
  } catch (e) {
    return fail(e);
  }
}

export async function saveSocialAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const linkSchema = z.object({ url: z.string().trim().max(300), enabled: z.boolean() });
    const value = z.object({ instagram: linkSchema, facebook: linkSchema, youtube: linkSchema }).parse({
      instagram: { url: String(form.get("instagramUrl") ?? ""), enabled: form.get("instagramEnabled") === "on" },
      facebook: { url: String(form.get("facebookUrl") ?? ""), enabled: form.get("facebookEnabled") === "on" },
      youtube: { url: String(form.get("youtubeUrl") ?? ""), enabled: form.get("youtubeEnabled") === "on" },
    });
    await db.setting.upsert({ where: { key: "social" }, create: { key: "social", value }, update: { value } });
    revalidateTag(CONFIG_TAG);
    revalidatePath("/", "layout");
    return { ok: "Social links updated." };
  } catch (e) {
    return fail(e);
  }
}

// ───────────────────────── Homepage slider ─────────────────────────

export async function saveHomeSlideAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const d = z.object({
      title: z.string().trim().max(120).optional(),
      subtitle: z.string().trim().max(200).optional(),
      linkUrl: z.string().trim().max(300).optional(),
    }).parse(Object.fromEntries(form));
    const file = form.get("image");
    if (!(file instanceof File) || file.size === 0) return { error: "Choose an image to upload." };
    const { url } = await storage().put({ name: file.name, type: file.type, data: Buffer.from(await file.arrayBuffer()) });
    const count = await db.homeSlide.count();
    await db.homeSlide.create({ data: { imageUrl: url, title: d.title || null, subtitle: d.subtitle || null, linkUrl: d.linkUrl || null, sortOrder: count } });
    revalidatePath("/admin/slides");
    revalidatePath("/", "layout");
    return { ok: "Slide added." };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteHomeSlideAction(form: FormData) {
  await requireAdmin();
  await db.homeSlide.delete({ where: { id: String(form.get("id")) } });
  revalidatePath("/admin/slides");
  revalidatePath("/", "layout");
}

export async function toggleHomeSlideAction(form: FormData) {
  await requireAdmin();
  const s = await db.homeSlide.findUniqueOrThrow({ where: { id: String(form.get("id")) } });
  await db.homeSlide.update({ where: { id: s.id }, data: { isActive: !s.isActive } });
  revalidatePath("/admin/slides");
  revalidatePath("/", "layout");
}

export async function moveHomeSlideAction(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id"));
  const dir = String(form.get("dir")); // "up" | "down"
  const slides = await db.homeSlide.findMany({ orderBy: { sortOrder: "asc" } });
  const i = slides.findIndex((s) => s.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= slides.length) return;
  await db.$transaction([
    db.homeSlide.update({ where: { id: slides[i].id }, data: { sortOrder: j } }),
    db.homeSlide.update({ where: { id: slides[j].id }, data: { sortOrder: i } }),
  ]);
  revalidatePath("/admin/slides");
  revalidatePath("/", "layout");
}

export async function markMessageHandledAction(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id"));
  const m = await db.contactMessage.findUniqueOrThrow({ where: { id } });
  await db.contactMessage.update({ where: { id }, data: { handled: !m.handled } });
  revalidatePath("/admin/messages");
}

export async function saveHomeAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const d = z.object({
      announcement: z.string().trim().max(200),
      heroEyebrow: z.string().trim().max(80),
      heroTitle: z.string().trim().min(3).max(120),
      heroSubtitle: z.string().trim().max(300),
    }).parse(Object.fromEntries(form));

    const stats = Array.from({ length: HOME_MAX_STATS }, (_, i) => readRow(form, { value: "statValue", label: "statLabel" }, i))
      .filter((r) => r.value || r.label)
      .map((r) => statRowSchema.parse(r));

    const reviews = Array.from({ length: HOME_MAX_REVIEWS }, (_, i) => readRow(form, { name: "reviewName", city: "reviewCity", build: "reviewBuild", text: "reviewText" }, i))
      .filter((r) => r.name || r.city || r.text)
      .map((r) => reviewRowSchema.parse({ ...r, build: r.build || undefined }));

    const value = { announcement: d.announcement, heroEyebrow: d.heroEyebrow, heroTitle: d.heroTitle, heroSubtitle: d.heroSubtitle, stats, reviews };
    await db.setting.upsert({ where: { key: "home" }, create: { key: "home", value }, update: { value } });
    revalidateTag(CONFIG_TAG);
    revalidatePath("/", "layout");
    return { ok: "Homepage updated." };
  } catch (e) {
    return fail(e);
  }
}
