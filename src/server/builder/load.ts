import "server-only";
import { z } from "zod";
import { db } from "../db";
import { productInclude, toBuilderProduct } from "../catalog";
import { SLOTS, type BuildItems, type BuilderProduct, type Slot } from "@/lib/compat/types";

/** Compact wire format for a build: { cpu: ["productId", 1], ram: ["id", 2] } */
export const buildRefSchema = z.partialRecord(z.enum(SLOTS), z.tuple([z.string().min(1), z.number().int().min(1).max(8)]));
export type BuildRef = z.infer<typeof buildRefSchema>;

export async function loadBuilderProducts(ids: string[]): Promise<BuilderProduct[]> {
  if (!ids.length) return [];
  const rows = await db.product.findMany({ where: { id: { in: ids } }, include: productInclude });
  return rows.map(toBuilderProduct);
}

/** Resolve a BuildRef into full engine items, using current prices and specs from the database. */
export async function resolveBuild(ref: BuildRef): Promise<BuildItems> {
  const entries = Object.entries(ref) as [Slot, [string, number]][];
  const products = await loadBuilderProducts(entries.map(([, [id]]) => id));
  const items: BuildItems = {};
  for (const [slot, [id, qty]] of entries) {
    const product = products.find((p) => p.id === id);
    if (product) items[slot] = { product: { ...product, slot }, qty };
  }
  return items;
}

export function toRef(items: BuildItems): BuildRef {
  return Object.fromEntries(
    Object.entries(items).filter(([, l]) => l).map(([slot, l]) => [slot, [l!.product.id, l!.qty]]),
  ) as BuildRef;
}
