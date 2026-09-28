// "Build it for me": generates a compatible build from the store's own in-stock products.
// Pure function over a product pool so it can be unit-tested and swapped for an AI strategy later.

import type { BuildItems, BuildReport, BuilderProduct, EngineConfig, Slot } from "./compat/types";
import { evaluateCandidate, validateBuild } from "./compat/service";
import { estimatePower } from "./compat/power";
import type { AutoBuildConfig, UseCase } from "@/server/settings-defaults";

export interface AutoBuildInput {
  budget: number;
  useCase: UseCase;
  resolution?: "1080p" | "1440p" | "4K";
  cpuBrand?: "AMD" | "Intel" | "any";
  gpuBrand?: "NVIDIA" | "AMD" | "any";
  storageGb?: number;
  /** Slots the customer already chose (e.g. "start with your GPU"). */
  locked?: BuildItems;
}

export interface AutoBuildResult {
  items: BuildItems;
  total: number;
  report: BuildReport;
  notes: string[];
  withinBudget: boolean;
}

type Pool = Partial<Record<Slot, BuilderProduct[]>>;

const n = (p: BuilderProduct | undefined, k: string) => {
  const v = p?.specs[k];
  return typeof v === "number" ? v : v != null && !Number.isNaN(Number(v)) ? Number(v) : 0;
};
const s = (p: BuilderProduct | undefined, k: string) => String(p?.specs[k] ?? "");
const tier = (p?: BuilderProduct) => n(p, "performanceTier");
const cheapest = (list: BuilderProduct[]) => [...list].sort((a, b) => a.price - b.price)[0];

const CORE_ORDER: Slot[] = ["gpu", "cpu", "motherboard", "ram", "ssd", "case", "cooler", "psu"];

function fits(items: BuildItems, slot: Slot, p: BuilderProduct, cfg: EngineConfig, qty = 1, strict = true) {
  const v = evaluateCandidate(items, slot, p, cfg, qty);
  return strict ? v.status === "compatible" : v.status !== "incompatible";
}

interface Scales { gpu: number; cpu: number; rest: number }

function attempt(input: AutoBuildInput, pool: Pool, cfg: EngineConfig, ab: AutoBuildConfig, sc: Scales): BuildItems | null {
  const scale = sc.rest;
  const creative = input.useCase !== "gaming" && input.useCase !== "home";
  const alloc = ab.allocations[input.useCase] ?? ab.allocations.gaming;
  const items: BuildItems = { ...(input.locked ?? {}) };
  const target = (slot: keyof typeof alloc) => (alloc[slot] ?? 0) * input.budget;
  const needsGpu = (alloc.gpu ?? 0) > 0;
  const minGpuTier = input.useCase === "gaming" ? ab.gpuTierByResolution[input.resolution ?? "1080p"] ?? 0 : 0;
  const ramNeed = Math.max(
    ab.ramGb[input.useCase] ?? 16,
    input.useCase === "gaming" ? ab.ramGbByResolution[input.resolution ?? "1080p"] ?? 16 : 0,
  );

  const pick = (slot: Slot, choose: (candidates: BuilderProduct[]) => BuilderProduct | undefined, qty = 1) => {
    if (items[slot]) return true;
    const list = (pool[slot] ?? []).filter((p) => p.stock > 0);
    let candidates = list.filter((p) => fits(items, slot, p, cfg, qty, true));
    if (!candidates.length) candidates = list.filter((p) => fits(items, slot, p, cfg, qty, false));
    const chosen = choose(candidates);
    if (!chosen) return false;
    items[slot] = { product: chosen, qty };
    return true;
  };

  /** Highest performance tier within the scaled target price, cheapest among equals. */
  const bestWithin = (limit: number, minTier = 0, byCores = false) => (c: BuilderProduct[]) => {
    const affordable = c.filter((p) => p.price <= limit && tier(p) >= minTier);
    const set = affordable.length ? affordable : c.filter((p) => p.price <= limit);
    if (!set.length) return cheapest(c);
    return set.sort((a, b) => tier(b) - tier(a) || (byCores ? n(b, "cores") - n(a, "cores") : 0) || a.price - b.price)[0];
  };

  for (const slot of CORE_ORDER) {
    let ok = true;
    switch (slot) {
      case "gpu": {
        if (!needsGpu) break;
        const pref = input.gpuBrand && input.gpuBrand !== "any" ? input.gpuBrand : null;
        ok = pick("gpu", (c) => bestWithin(target("gpu") * sc.gpu, minGpuTier)(pref ? c.filter((p) => s(p, "gpuBrand") === pref) : c) ?? bestWithin(target("gpu") * sc.gpu)(c));
        break;
      }
      case "cpu": {
        const pref = input.cpuBrand && input.cpuBrand !== "any" ? input.cpuBrand : null;
        ok = pick("cpu", (c) => {
          let list = pref ? c.filter((p) => p.brand === pref) : c;
          if (!list.length) list = c;
          // Without a graphics card we need integrated graphics.
          if (!needsGpu && !items.gpu) {
            const igpu = list.filter((p) => p.specs.integratedGpu === true);
            if (igpu.length) list = igpu;
          }
          // Keep CPU roughly balanced with the GPU (no 10-tier CPU for a 4-tier GPU in gaming builds).
          const gpuT = tier(items.gpu?.product);
          const cap = input.useCase === "gaming" && gpuT ? gpuT + 1 : 99;
          const balanced = list.filter((p) => tier(p) <= cap);
          return bestWithin(target("cpu") * sc.cpu, 0, creative)(balanced.length ? balanced : list);
        });
        break;
      }
      case "motherboard":
        ok = pick("motherboard", (c) => {
          // Prefer boards with Wi-Fi when price difference is small; otherwise the cheapest that fits.
          const sorted = [...c].sort((a, b) => a.price - b.price);
          const base = sorted[0];
          if (!base) return undefined;
          const withWifi = sorted.find((p) => p.specs.wifi === true && p.price <= base.price * 1.25);
          const budgetOk = sorted.filter((p) => p.price <= target("motherboard") * scale);
          return withWifi ?? budgetOk[budgetOk.length - 1] ?? base;
        });
        break;
      case "ram":
        ok = pick("ram", (c) => {
          const enough = c.filter((p) => n(p, "capacity") >= ramNeed);
          const set = enough.length ? enough : c;
          // cheapest kit that meets capacity, prefer faster when within 10%
          const sorted = [...set].sort((a, b) => a.price - b.price);
          const base = sorted[0];
          return sorted.filter((p) => p.price <= (base?.price ?? 0) * 1.1).sort((a, b) => n(b, "speed") - n(a, "speed"))[0] ?? base;
        });
        break;
      case "ssd":
        ok = pick("ssd", (c) => {
          const want = input.storageGb ?? 1000;
          const nvme = c.filter((p) => s(p, "interface") === "NVMe");
          const set = (nvme.length ? nvme : c).filter((p) => n(p, "capacity") >= want);
          const pool2 = set.length ? set : nvme.length ? nvme : c;
          const sorted = [...pool2].sort((a, b) => a.price - b.price);
          const base = sorted[0];
          // Faster drives only when the budget comfortably allows it.
          const premium = input.budget >= 100000 ? 1.3 : 1.0;
          return sorted.filter((p) => p.price <= (base?.price ?? 0) * premium).sort((a, b) => n(b, "readSpeed") - n(a, "readSpeed"))[0] ?? base;
        });
        break;
      case "case":
        ok = pick("case", (c) => {
          const sorted = [...c].sort((a, b) => a.price - b.price);
          if (input.useCase === "home" || input.useCase === "productivity") return sorted[0];
          const within = sorted.filter((p) => p.price <= target("case") * Math.max(1, scale));
          // bigger budgets get better airflow cabinets
          return within[within.length - 1] ?? sorted[0];
        });
        break;
      case "cooler": {
        const cpu = items.cpu?.product;
        const draw = n(cpu, "maxPower") || n(cpu, "tdp");
        if (cpu?.specs.includesCooler === true && draw <= 90 && input.budget < 90000) break;
        ok = pick("cooler", (c) => {
          const capable = c.filter((p) => n(p, "tdpRating") >= draw);
          return cheapest(capable.length ? capable : c);
        });
        break;
      }
      case "psu": {
        const power = estimatePower(items, cfg.power);
        ok = pick("psu", (c) => {
          const enough = c.filter((p) => n(p, "wattage") >= power.recommendedW);
          const set = enough.length ? enough : c;
          const sorted = [...set].sort((a, b) => a.price - b.price);
          // prefer Gold+ if within 20% of cheapest
          const gold = sorted.find((p) => /gold|platinum|titanium/i.test(s(p, "efficiency")) && p.price <= sorted[0].price * 1.2);
          return gold ?? sorted[0];
        });
        break;
      }
    }
    if (!ok) return null;
  }
  return items;
}

const totalOf = (items: BuildItems) => Object.values(items).reduce((t, l) => t + (l ? l.product.price * l.qty : 0), 0);

export function autoBuild(input: AutoBuildInput, pool: Pool, cfg: EngineConfig, ab: AutoBuildConfig): AutoBuildResult {
  const notes: string[] = [];
  let best: { items: BuildItems; score: number; total: number } | null = null;
  let cheapestBuild: { items: BuildItems; total: number } | null = null;

  // Search GPU and CPU spend independently so the budget can be rebalanced between them.
  const steps = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.45, 1.6, 1.8, 2.1];
  const combos: Scales[] = [];
  for (const gpu of steps) for (const cpu of steps) combos.push({ gpu, cpu, rest: Math.min(gpu, cpu) });
  const seen = new Set<string>();
  for (const sc of combos) {
    const items = attempt(input, pool, cfg, ab, sc);
    if (!items) continue;
    const report = validateBuild(items, cfg);
    if (report.errors.length) continue;
    const key = Object.values(items).map((l) => l!.product.id).join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    const total = totalOf(items);
    if (!cheapestBuild || total < cheapestBuild.total) cheapestBuild = { items, total };
    if (total > input.budget) continue;
    const g = tier(items.gpu?.product), c = tier(items.cpu?.product);
    const cores = n(items.cpu?.product, "cores"), ram = n(items.ram?.product, "capacity") * (items.ram?.qty ?? 1);
    const perf =
      input.useCase === "gaming" ? g * 2.5 + c
      : input.useCase === "home" || input.useCase === "productivity" ? c * 2 + ram / 32 + cores / 16
      : g * 1.5 + c * 1.5 + cores / 8 + ram / 64;
    const score = perf + total / input.budget - report.warnings.length * 0.5;
    if (!best || score > best.score) best = { items, score, total };
  }

  const chosen = best ?? cheapestBuild;
  if (!chosen) {
    return { items: input.locked ?? {}, total: 0, report: validateBuild(input.locked ?? {}, cfg), withinBudget: false,
      notes: ["We couldn't find a compatible combination with the parts currently in stock. Talk to our team and we'll source it for you."] };
  }
  const report = validateBuild(chosen.items, cfg);
  if (!best) notes.push(`The lowest-priced compatible build we can make right now is ${Math.round(chosen.total).toLocaleString("en-IN")} — a little above your budget.`);
  if (input.useCase === "gaming" && input.resolution) {
    const want = ab.gpuTierByResolution[input.resolution] ?? 0;
    if (chosen.items.gpu && tier(chosen.items.gpu.product) < want)
      notes.push(`For smooth ${input.resolution} gaming we'd suggest a bigger budget — this build is tuned for the best experience your budget allows.`);
  }
  const left = input.budget - chosen.total;
  if (best && left > input.budget * 0.08)
    notes.push(`You have about ₹${Math.round(left).toLocaleString("en-IN")} left — consider a monitor, UPS or more storage.`);
  return { items: chosen.items, total: chosen.total, report, notes, withinBudget: !!best };
}
