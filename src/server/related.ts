import "server-only";
import { db } from "./db";
import { getEngineConfig } from "./config";
import { productInclude, toBuilderProduct, type ProductWithRelations } from "./catalog";
import { evaluateCandidate } from "@/lib/compat/service";
import { SLOT_META } from "@/lib/compat/slots";
import type { BuilderProduct, Slot } from "@/lib/compat/types";

/** Which slots pair naturally with a component (for "frequently bought together"). */
const PAIRS: Partial<Record<Slot, Slot[]>> = {
  cpu: ["motherboard", "ram", "cooler"],
  motherboard: ["cpu", "ram", "ssd"],
  gpu: ["psu", "case", "monitor"],
  ram: ["motherboard", "cpu"],
  cooler: ["cpu", "case"],
  case: ["psu", "fans", "cooler"],
  psu: ["gpu", "case"],
  ssd: ["motherboard", "hdd"],
  monitor: ["gpu", "keyboard", "mouse"],
  keyboard: ["mouse", "headset"],
  mouse: ["keyboard", "headset"],
};

export async function getRelated(p: ProductWithRelations) {
  const alternatives = await db.product.findMany({
    where: {
      status: "ACTIVE",
      categoryId: p.categoryId,
      id: { not: p.id },
      price: { gte: Math.round(p.price * 0.6), lte: Math.round(p.price * 1.5) },
    },
    include: productInclude,
    orderBy: { popularity: "desc" },
    take: 4,
  });

  const slot = p.category.builderSlot as Slot | null;
  const pairs = slot ? PAIRS[slot] ?? [] : [];
  if (!slot || !pairs.length) return { alternatives, together: [] as BuilderProduct[] };

  const cfg = await getEngineConfig();
  const self = toBuilderProduct(p);
  const rows = await db.product.findMany({
    where: { status: "ACTIVE", category: { slug: { in: pairs.flatMap((s) => SLOT_META[s].categories) } }, inventory: { some: { quantity: { gt: 0 } } } },
    include: productInclude,
    orderBy: { popularity: "desc" },
  });
  const together: BuilderProduct[] = [];
  for (const s of pairs) {
    const candidates = rows.map(toBuilderProduct).filter((c) => c.slot === s);
    const best = candidates.find((c) => evaluateCandidate({ [slot]: { product: self, qty: 1 } }, s, c, cfg).status === "compatible");
    if (best) together.push(best);
  }
  return { alternatives, together };
}
