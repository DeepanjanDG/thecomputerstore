import "server-only";
import { cache } from "react";
import { Prisma } from "@prisma/client";
import { db } from "./db";
import type { BuilderProduct, Slot, SpecMap, SpecValue } from "@/lib/compat/types";
import { hasBrandLogo } from "@/lib/brand-logos";

export const productInclude = {
  brand: true,
  category: true,
  specs: { include: { spec: true } },
  images: { orderBy: { sortOrder: "asc" } },
  inventory: true,
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

// ───────────────────────── Mapping ─────────────────────────

export function specValue(row: ProductWithRelations["specs"][number]): SpecValue {
  switch (row.spec.type) {
    case "NUMBER": return row.valueNum;
    case "BOOLEAN": return row.valueBool;
    case "LIST": return (row.valueText ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    default: return row.valueText;
  }
}

export function specMap(p: ProductWithRelations): SpecMap {
  return Object.fromEntries(p.specs.map((s) => [s.spec.key, specValue(s)]));
}

export const stockOf = (p: { inventory: { quantity: number; reserved: number }[] }) =>
  p.inventory.reduce((s, i) => s + Math.max(0, i.quantity - i.reserved), 0);

export function toBuilderProduct(p: ProductWithRelations): BuilderProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    model: p.model,
    brand: p.brand.name,
    slot: (p.category.builderSlot ?? "accessories") as Slot,
    categorySlug: p.category.slug,
    price: p.price,
    mrp: p.mrp,
    gstRate: p.gstRate,
    stock: stockOf(p),
    warranty: p.warranty,
    image: p.images[0]?.url ?? null,
    rating: p.rating,
    popularity: p.popularity,
    released: (p.releasedAt ?? p.createdAt).toISOString(),
    specs: specMap(p),
  };
}

/** Card-friendly product view used across the storefront. */
export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: { slug: string; name: string };
  slot: Slot | null;
  price: number;
  mrp: number;
  gstRate: number;
  stock: number;
  warranty: string | null;
  image: string | null;
  rating: number | null;
  ratingCount: number;
  isDeal: boolean;
  keySpecs: { label: string; value: string }[];
}

export function formatSpec(row: ProductWithRelations["specs"][number]): string {
  const v = specValue(row);
  if (v == null) return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.join(", ") || "—";
  const unit = row.spec.unit;
  if (typeof v === "number") {
    if (unit === "GB" && v >= 1000 && v % 1000 === 0) return `${v / 1000} TB`;
    return unit ? `${v} ${unit}` : String(v);
  }
  return unit && /^\d/.test(v) ? `${v} ${unit}` : v;
}

export function toCard(p: ProductWithRelations): ProductCardData {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand.name,
    category: { slug: p.category.slug, name: p.category.name },
    slot: (p.category.builderSlot as Slot | null) ?? null,
    price: p.price,
    mrp: p.mrp,
    gstRate: p.gstRate,
    stock: stockOf(p),
    warranty: p.warranty,
    image: p.images[0]?.url ?? null,
    rating: p.rating,
    ratingCount: p.ratingCount,
    isDeal: p.isDeal,
    keySpecs: p.specs
      .filter((s) => s.spec.isKey && s.spec.key !== "performanceTier")
      .sort((a, b) => a.spec.sortOrder - b.spec.sortOrder)
      .slice(0, 4)
      .map((s) => ({ label: s.spec.label, value: formatSpec(s) })),
  };
}

// ───────────────────────── Queries ─────────────────────────

export const getCategories = cache(() =>
  db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { status: "ACTIVE" } } } } },
  }),
);

/** Brands with a logo, ordered by how many active products they have. */
export const getFeaturedBrands = cache(async (limit = 24) => {
  const rows = await db.brand.findMany({ include: { _count: { select: { products: { where: { status: "ACTIVE" } } } } } });
  return rows
    .filter((b) => b._count.products > 0 && hasBrandLogo(b.name))
    .sort((a, b) => b._count.products - a._count.products || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map((b) => ({ name: b.name, count: b._count.products }));
});

/** One product photo per category (most popular first), used for the "Shop by Category" tiles. */
export const getCategoryCovers = cache(async (): Promise<Record<string, string>> => {
  const rows = await db.productImage.findMany({
    where: { product: { status: "ACTIVE" } },
    orderBy: [{ product: { popularity: "desc" } }, { sortOrder: "asc" }],
    select: { url: true, product: { select: { category: { select: { slug: true } } } } },
    take: 300,
  });
  const covers: Record<string, string> = {};
  for (const r of rows) covers[r.product.category.slug] ??= r.url;
  return covers;
});

/** Active homepage hero slides, admin-managed, in display order. */
export const getHomeSlides = cache(() =>
  db.homeSlide.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }));

export const getCategory = cache((slug: string) =>
  db.category.findUnique({ where: { slug }, include: { specDefs: { orderBy: { sortOrder: "asc" } } } }),
);

export const getProduct = cache((slug: string) =>
  db.product.findFirst({ where: { slug, status: "ACTIVE" }, include: productInclude }),
);

export type SortKey = "popular" | "price-asc" | "price-desc" | "newest" | "rating" | "performance";

export interface ListParams {
  category?: string;
  q?: string;
  brands?: string[];
  min?: number;
  max?: number;
  inStock?: boolean;
  deals?: boolean;
  featured?: boolean;
  specs?: Record<string, string[]>;
  sort?: SortKey;
  page?: number;
  perPage?: number;
}

export function searchWhere(q: string): Prisma.ProductWhereInput {
  const tokens = q.toLowerCase().replace(/(\d)\s+(gb|tb|w|mm|hz)\b/g, "$1$2").split(/\s+/).filter(Boolean).slice(0, 8);
  return { AND: tokens.map((t) => ({ searchText: { contains: t } })) };
}

/** Matches a spec against any of the values; substring matching only for LIST specs ("ATX" ≠ "Micro-ATX"). */
export function specValueMatch(key: string, values: string[]): Prisma.ProductSpecWhereInput {
  return {
    spec: { key },
    OR: values.flatMap((v) => {
      const out: Prisma.ProductSpecWhereInput[] = [
        { spec: { type: { in: ["TEXT"] } }, valueText: { equals: v, mode: "insensitive" } },
        { spec: { type: "LIST" }, valueText: { contains: v, mode: "insensitive" } },
      ];
      if (!Number.isNaN(Number(v))) out.push({ valueNum: Number(v) });
      if (v === "true" || v === "false") out.push({ valueBool: v === "true" });
      return out;
    }),
  };
}

export async function listProducts(params: ListParams) {
  const perPage = params.perPage ?? 24;
  const page = Math.max(1, params.page ?? 1);
  const and: Prisma.ProductWhereInput[] = [{ status: "ACTIVE" }];
  if (params.category) and.push({ category: { slug: params.category } });
  if (params.q) and.push(searchWhere(params.q));
  if (params.brands?.length) and.push({ brand: { slug: { in: params.brands } } });
  if (params.min != null) and.push({ price: { gte: params.min } });
  if (params.max != null) and.push({ price: { lte: params.max } });
  if (params.inStock) and.push({ inventory: { some: { quantity: { gt: 0 } } } });
  if (params.deals) and.push({ isDeal: true });
  if (params.featured) and.push({ isFeatured: true });
  for (const [key, values] of Object.entries(params.specs ?? {})) {
    if (!values.length) continue;
    and.push({ specs: { some: specValueMatch(key, values) } });
  }
  const where: Prisma.ProductWhereInput = { AND: and };
  const sort = params.sort ?? "popular";
  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    sort === "price-asc" ? [{ price: "asc" }]
    : sort === "price-desc" ? [{ price: "desc" }]
    : sort === "newest" ? [{ releasedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }]
    : sort === "rating" ? [{ rating: { sort: "desc", nulls: "last" } }]
    : [{ popularity: "desc" }];

  const total = await db.product.count({ where });
  let products: ProductWithRelations[];
  if (sort === "performance") {
    // Performance tier is a spec value; sort in memory within the filtered set.
    const all = await db.product.findMany({ where, include: productInclude });
    const tierOf = (p: ProductWithRelations) => p.specs.find((s) => s.spec.key === "performanceTier")?.valueNum ?? 0;
    products = all.sort((a, b) => tierOf(b) - tierOf(a) || a.price - b.price).slice((page - 1) * perPage, page * perPage);
  } else {
    products = await db.product.findMany({ where, include: productInclude, orderBy, skip: (page - 1) * perPage, take: perPage });
  }
  return { products, total, page, pages: Math.max(1, Math.ceil(total / perPage)) };
}

/** Filter facets for a category: brands, price range, and filterable spec values with counts. */
export async function getFacets(categorySlug: string) {
  const category = await getCategory(categorySlug);
  if (!category) return null;
  const where = { status: "ACTIVE" as const, categoryId: category.id };
  const [brands, price, specRows] = await Promise.all([
    db.product.groupBy({ by: ["brandId"], where, _count: true }),
    db.product.aggregate({ where, _min: { price: true }, _max: { price: true } }),
    db.productSpec.findMany({
      where: { product: where, spec: { filterable: true } },
      select: { valueNum: true, valueText: true, valueBool: true, spec: { select: { key: true, label: true, unit: true, type: true, sortOrder: true } } },
    }),
  ]);
  const brandRows = await db.brand.findMany({ where: { id: { in: brands.map((b) => b.brandId) } } });
  const specFacets = new Map<string, { key: string; label: string; unit: string | null; sortOrder: number; values: Map<string, number> }>();
  for (const r of specRows) {
    const f = specFacets.get(r.spec.key) ?? { key: r.spec.key, label: r.spec.label, unit: r.spec.unit, sortOrder: r.spec.sortOrder, values: new Map() };
    const vals =
      r.spec.type === "NUMBER" ? [r.valueNum != null ? String(r.valueNum) : null]
      : r.spec.type === "BOOLEAN" ? [r.valueBool == null ? null : String(r.valueBool)]
      : r.spec.type === "LIST" ? (r.valueText ?? "").split(",").map((s) => s.trim())
      : [r.valueText];
    for (const v of vals) if (v) f.values.set(v, (f.values.get(v) ?? 0) + 1);
    specFacets.set(r.spec.key, f);
  }
  return {
    category,
    brands: brandRows
      .map((b) => ({ slug: b.slug, name: b.name, count: brands.find((x) => x.brandId === b.id)?._count ?? 0 }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    price: { min: price._min.price ?? 0, max: price._max.price ?? 0 },
    specs: [...specFacets.values()]
      .filter((f) => f.values.size > 1 && f.key !== "performanceTier")
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((f) => ({
        key: f.key,
        label: f.label,
        unit: f.unit,
        values: [...f.values.entries()]
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => (Number.isNaN(Number(a.value)) ? a.value.localeCompare(b.value) : Number(a.value) - Number(b.value))),
      })),
  };
}

export async function getProductsByIds(ids: string[]) {
  if (!ids.length) return [];
  const rows = await db.product.findMany({ where: { id: { in: ids } }, include: productInclude });
  return ids.map((id) => rows.find((r) => r.id === id)).filter(Boolean) as ProductWithRelations[];
}
