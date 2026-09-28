import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "../db";
import { productInclude, searchWhere, specValueMatch, toBuilderProduct } from "../catalog";
import { evaluateCandidate } from "@/lib/compat/service";
import { SLOT_META } from "@/lib/compat/slots";
import { SLOT_FILTER_KEYS, formatSpecValue, specLabel } from "@/lib/spec-format";
import type { BuildItems, BuilderProduct, CandidateVerdict, EngineConfig, Slot } from "@/lib/compat/types";

export interface OptionQuery {
  slot: Slot;
  q?: string;
  brands?: string[];
  min?: number;
  max?: number;
  inStock?: boolean;
  specs?: Record<string, string[]>;
  sort?: "popular" | "price-asc" | "price-desc" | "performance" | "newest" | "rating" | "power";
  showIncompatible?: boolean;
}

export interface BuilderOption {
  product: BuilderProduct;
  verdict: CandidateVerdict;
}

/**
 * Returns products for a builder step, each annotated with a compatibility verdict against the
 * current build. Incompatible products are removed unless explicitly requested, so customers
 * can't pick impossible combinations — but we report how many were hidden and why.
 */
export async function getBuilderOptions(query: OptionQuery, items: BuildItems, cfg: EngineConfig) {
  const meta = SLOT_META[query.slot];
  const and: Prisma.ProductWhereInput[] = [
    { status: "ACTIVE" },
    { category: { slug: { in: meta.categories } } },
  ];
  if (query.q) and.push(searchWhere(query.q));
  if (query.brands?.length) and.push({ brand: { name: { in: query.brands } } });
  if (query.min != null) and.push({ price: { gte: query.min } });
  if (query.max != null) and.push({ price: { lte: query.max } });
  if (query.inStock) and.push({ inventory: { some: { quantity: { gt: 0 } } } });
  // The Wi-Fi slot only accepts adapters, not routers/switches from the Networking category.
  if (query.slot === "wifi")
    and.push({ specs: { some: { spec: { key: "deviceType" }, valueText: { in: ["PCIe Wi-Fi card", "USB adapter"] } } } });
  for (const [key, values] of Object.entries(query.specs ?? {})) {
    if (values.length) and.push({ specs: { some: specValueMatch(key, values) } });
  }

  const rows = await db.product.findMany({ where: { AND: and }, include: productInclude });
  const all = rows.map((r) => ({ ...toBuilderProduct(r), slot: query.slot }));

  const qty = items[query.slot]?.qty ?? 1;
  const evaluated: BuilderOption[] = all.map((product) => ({
    product,
    verdict: evaluateCandidate(items, query.slot, product, cfg, qty),
  }));

  const hidden = evaluated.filter((o) => o.verdict.status === "incompatible");
  const visible = query.showIncompatible ? evaluated : evaluated.filter((o) => o.verdict.status !== "incompatible");

  const rank = { compatible: 0, warning: 1, info: 0, incompatible: 2 } as const;
  const tier = (p: BuilderProduct) => Number(p.specs.performanceTier ?? 0);
  const power = (p: BuilderProduct) => Number(p.specs.tgp ?? p.specs.maxPower ?? p.specs.tdp ?? p.specs.wattage ?? 0);
  const sort = query.sort ?? "popular";
  visible.sort((a, b) => {
    const r = rank[a.verdict.status] - rank[b.verdict.status];
    if (r) return r;
    const outA = a.product.stock <= 0 ? 1 : 0, outB = b.product.stock <= 0 ? 1 : 0;
    if (outA !== outB) return outA - outB;
    switch (sort) {
      case "price-asc": return a.product.price - b.product.price;
      case "price-desc": return b.product.price - a.product.price;
      case "performance": return tier(b.product) - tier(a.product) || a.product.price - b.product.price;
      case "rating": return (b.product.rating ?? 0) - (a.product.rating ?? 0);
      case "newest": return (b.product.released ?? "").localeCompare(a.product.released ?? "");
      case "power": return power(a.product) - power(b.product);
      default: return (b.product.popularity ?? 0) - (a.product.popularity ?? 0);
    }
  });

  // Facets from the unfiltered-by-compatibility set
  const brandCounts = new Map<string, number>();
  for (const p of all) brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
  const specFacets = (SLOT_FILTER_KEYS[query.slot] ?? []).map((key) => {
    const values = new Map<string, string>();
    for (const p of all) {
      const v = p.specs[key];
      for (const x of Array.isArray(v) ? v : [v]) if (x != null && x !== "") values.set(String(x), formatSpecValue(key, x));
    }
    return {
      key,
      label: specLabel(key),
      values: [...values.entries()]
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => (Number.isNaN(Number(a.value)) ? a.value.localeCompare(b.value) : Number(a.value) - Number(b.value))),
    };
  }).filter((f) => f.values.length > 1);

  return {
    slot: query.slot,
    options: visible,
    total: all.length,
    hiddenCount: query.showIncompatible ? 0 : hidden.length,
    hiddenReasons: summariseReasons(hidden),
    specFacets,
    brands: [...brandCounts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name)),
    priceRange: all.length ? { min: Math.min(...all.map((p) => p.price)), max: Math.max(...all.map((p) => p.price)) } : null,
  };
}

/** Top distinct reasons incompatible options were hidden (e.g. "requires AM5"). */
function summariseReasons(hidden: BuilderOption[]) {
  const counts = new Map<string, number>();
  for (const o of hidden) {
    const first = o.verdict.issues.find((i) => i.severity === "error");
    if (first) counts.set(first.ruleId, (counts.get(first.ruleId) ?? 0) + 1);
  }
  return [...counts.entries()].map(([ruleId, count]) => ({ ruleId, count }));
}
