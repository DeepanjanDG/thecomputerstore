import { describe, expect, it } from "vitest";
import { PRODUCTS } from "../../prisma/seed/products";
import { CATEGORIES } from "../../prisma/seed/categories";
import { autoBuild } from "./autobuild";
import { defaultEngineConfig } from "./compat/defaults";
import { DEFAULT_AUTOBUILD } from "@/server/settings-defaults";
import type { BuilderProduct, Slot } from "./compat/types";

const pool: Partial<Record<Slot, BuilderProduct[]>> = {};
for (const p of PRODUCTS) {
  const slot = CATEGORIES.find((c) => c.slug === p.category)?.builderSlot as Slot | undefined;
  if (!slot) continue;
  (pool[slot] ??= []).push({
    id: p.sku, slug: p.sku, name: p.name, brand: p.brand, slot, categorySlug: p.category,
    price: p.price, mrp: p.mrp, gstRate: 18, stock: p.stock, specs: p.specs,
  });
}
const cfg = defaultEngineConfig();

describe("autoBuild", () => {
  const cases = [
    { budget: 60000, useCase: "gaming" as const, resolution: "1080p" as const },
    { budget: 80000, useCase: "gaming" as const, resolution: "1080p" as const },
    { budget: 150000, useCase: "gaming" as const, resolution: "1440p" as const },
    { budget: 300000, useCase: "gaming" as const, resolution: "4K" as const },
    { budget: 50000, useCase: "home" as const },
    { budget: 90000, useCase: "productivity" as const },
    { budget: 160000, useCase: "creator" as const },
    { budget: 250000, useCase: "workstation" as const },
  ];
  for (const c of cases) {
    it(`builds a compatible ${c.useCase} PC for ₹${c.budget}`, () => {
      const r = autoBuild(c, pool, cfg, DEFAULT_AUTOBUILD);
      expect(r.report.errors).toEqual([]);
      expect(r.withinBudget).toBe(true);
      expect(r.total).toBeLessThanOrEqual(c.budget);
      expect(r.report.core.missing).toEqual([]);
      if (c.useCase === "gaming") expect(r.items.gpu).toBeDefined();
    });
  }

  it("honours brand preferences", () => {
    const r = autoBuild({ budget: 120000, useCase: "gaming", resolution: "1440p", cpuBrand: "Intel", gpuBrand: "AMD" }, pool, cfg, DEFAULT_AUTOBUILD);
    expect(r.items.cpu?.product.brand).toBe("Intel");
    expect(r.items.gpu?.product.specs.gpuBrand).toBe("AMD");
  });

  it("builds around a locked GPU", () => {
    const gpu = pool.gpu!.find((p) => p.name.includes("RTX 4070"))!;
    const r = autoBuild({ budget: 140000, useCase: "gaming", resolution: "1440p", locked: { gpu: { product: gpu, qty: 1 } } }, pool, cfg, DEFAULT_AUTOBUILD);
    expect(r.items.gpu?.product.id).toBe(gpu.id);
    expect(r.report.errors).toEqual([]);
  });

  it("only uses in-stock products", () => {
    const r = autoBuild({ budget: 500000, useCase: "gaming", resolution: "4K" }, pool, cfg, DEFAULT_AUTOBUILD);
    for (const l of Object.values(r.items)) expect(l!.product.stock).toBeGreaterThan(0);
  });
});
