import "server-only";
import { randomInt } from "node:crypto";
import type { BuilderSlot } from "@prisma/client";
import { db } from "./db";
import { getEngineConfig } from "./config";
import { productInclude, toBuilderProduct } from "./catalog";
import { resolveBuild, type BuildRef } from "./builder/load";
import { priceBuild, validateBuild } from "@/lib/compat/service";
import type { BuildItems, Slot } from "@/lib/compat/types";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function newBuildCode() {
  let s = "";
  for (let i = 0; i < 6; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `TC-${s}`;
}

export async function saveBuild(input: { ref: BuildRef; name: string; useCase?: string | null; userId?: string | null }) {
  const items = await resolveBuild(input.ref);
  if (Object.keys(items).length === 0) throw new Error("Add at least one component before saving.");
  const cfg = await getEngineConfig();
  const report = validateBuild(items, cfg);
  const pricing = priceBuild(items);
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = newBuildCode();
    try {
      await db.build.create({
        data: {
          code,
          name: input.name.slice(0, 80) || "My Custom PC",
          useCase: input.useCase ?? null,
          userId: input.userId ?? null,
          totalPrice: pricing.total,
          estimatedW: report.power.estimatedW,
          compatible: report.errors.length === 0,
          items: {
            create: Object.entries(items).map(([slot, l]) => ({
              slot: slot as BuilderSlot, productId: l!.product.id, quantity: l!.qty, unitPrice: l!.product.price,
            })),
          },
        },
      });
      return code;
    } catch (e) {
      if ((e as { code?: string }).code !== "P2002") throw e;
    }
  }
  throw new Error("Could not generate a build code");
}

/** Loads a saved build with *current* prices and specs (saved unit prices are kept for reference). */
export async function getBuild(code: string) {
  const build = await db.build.findUnique({
    where: { code: code.toUpperCase() },
    include: { items: { include: { product: { include: productInclude } } }, user: { select: { name: true } } },
  });
  if (!build) return null;
  const items: BuildItems = {};
  for (const it of build.items) items[it.slot as Slot] = { product: { ...toBuilderProduct(it.product), slot: it.slot as Slot }, qty: it.quantity };
  const cfg = await getEngineConfig();
  return { build, items, report: validateBuild(items, cfg), pricing: priceBuild(items), cfg };
}

export async function getTemplateItems(slug: string) {
  const tpl = await db.buildTemplate.findUnique({
    where: { slug },
    include: { items: { include: { product: { include: productInclude } } } },
  });
  if (!tpl) return null;
  const items: BuildItems = {};
  for (const it of tpl.items) items[it.slot as Slot] = { product: { ...toBuilderProduct(it.product), slot: it.slot as Slot }, qty: it.quantity };
  return { template: tpl, items };
}

export async function getTemplates(opts: { showcase?: boolean } = {}) {
  const rows = await db.buildTemplate.findMany({
    where: { isActive: true, ...(opts.showcase != null ? { isShowcase: opts.showcase } : {}) },
    orderBy: { sortOrder: "asc" },
    include: { items: { include: { product: { include: productInclude } } } },
  });
  return rows.map((t) => {
    const items: BuildItems = {};
    for (const it of t.items) items[it.slot as Slot] = { product: { ...toBuilderProduct(it.product), slot: it.slot as Slot }, qty: it.quantity };
    return { ...t, built: items, total: priceBuild(items).total };
  });
}

export async function resolveRefWithReport(ref: BuildRef) {
  const items = await resolveBuild(ref);
  const cfg = await getEngineConfig();
  return { items, report: validateBuild(items, cfg), pricing: priceBuild(items) };
}

export { resolveBuild };
