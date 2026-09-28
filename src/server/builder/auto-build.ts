import "server-only";
import { db } from "../db";
import { productInclude, toBuilderProduct } from "../catalog";
import { getEngineConfig, getSetting } from "../config";
import { autoBuild, type AutoBuildInput } from "@/lib/autobuild";
import { SLOT_META } from "@/lib/compat/slots";
import type { BuilderProduct, Slot } from "@/lib/compat/types";

const CORE: Slot[] = ["cpu", "motherboard", "cooler", "ram", "gpu", "ssd", "psu", "case"];

/** Loads the in-stock core-component pool and runs the auto-build strategy. */
export async function runAutoBuild(input: AutoBuildInput) {
  const cats = CORE.flatMap((s) => SLOT_META[s].categories);
  const rows = await db.product.findMany({
    where: { status: "ACTIVE", category: { slug: { in: cats } }, inventory: { some: { quantity: { gt: 0 } } } },
    include: productInclude,
  });
  const pool: Partial<Record<Slot, BuilderProduct[]>> = {};
  for (const r of rows) {
    const p = toBuilderProduct(r);
    (pool[p.slot] ??= []).push(p);
  }
  const [cfg, ab] = await Promise.all([getEngineConfig(), getSetting("autobuild")]);
  return autoBuild(input, pool, cfg, ab);
}
