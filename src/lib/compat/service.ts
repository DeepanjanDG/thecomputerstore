import type {
  BuildItems, BuildReport, BuilderProduct, CandidateVerdict, CheckResult, EngineConfig, Pricing, Slot,
} from "./types";
import { RULES, RULES_BY_ID, type Rule } from "./rules";
import { estimatePower } from "./power";
import { scoreBuild } from "./score";
import { CORE_SLOTS, STEP_ORDER } from "./slots";
import { bool } from "./spec";
import { defaultEngineConfig } from "./defaults";

const STATUS_FOR: Record<"error" | "warning" | "info", CheckResult["status"]> = {
  error: "incompatible",
  warning: "warning",
  info: "info",
};

function runRule(rule: Rule, items: BuildItems, cfg: EngineConfig, power = estimatePower(items, cfg.power)) {
  const rc = cfg.rules[rule.id];
  if (rc && !rc.enabled) return [];
  const params = { ...(rule.defaultParams ?? {}), ...(rc?.params ?? {}) };
  const results = rule.check({ items, params, power });
  const override = rc?.severity;
  if (!override) return results;
  return results.map((r) =>
    r.severity === "success" ? r : { ...r, severity: override, status: STATUS_FOR[override] },
  );
}

function runRules(items: BuildItems, cfg: EngineConfig, only?: (r: Rule) => boolean): CheckResult[] {
  const power = estimatePower(items, cfg.power);
  return RULES.filter((r) => (only ? only(r) : true)).flatMap((r) => runRule(r, items, cfg, power));
}

function byRule(id: string) {
  return (items: BuildItems, cfg: EngineConfig = defaultEngineConfig()) => runRule(RULES_BY_ID[id], items, cfg);
}

/** Core slots that are satisfied without a part, e.g. GPU when the CPU has integrated graphics. */
function notNeededSlots(items: BuildItems): Slot[] {
  const cpu = items.cpu?.product;
  const out: Slot[] = [];
  if (!items.gpu && bool(cpu, "integratedGpu")) out.push("gpu");
  if (!items.cooler && bool(cpu, "includesCooler")) out.push("cooler");
  return out;
}

export function validateBuild(items: BuildItems, cfg: EngineConfig = defaultEngineConfig()): BuildReport {
  const results = runRules(items, cfg);
  const errors = results.filter((r) => r.severity === "error");
  const warnings = results.filter((r) => r.severity === "warning");
  const infos = results.filter((r) => r.severity === "info");
  const passes = results.filter((r) => r.severity === "success");
  const notNeeded = notNeededSlots(items);
  const selected = CORE_SLOTS.filter((s) => items[s]).length;
  const missing = CORE_SLOTS.filter((s) => !items[s] && !notNeeded.includes(s));
  const nextSlot = missing[0] ?? STEP_ORDER.find((s) => !items[s]) ?? null;
  const empty = Object.keys(items).length === 0;
  return {
    status: empty ? "empty" : errors.length ? "incompatible" : warnings.length ? "warning" : "compatible",
    results, errors, warnings, infos, passes,
    power: estimatePower(items, cfg.power),
    core: { total: CORE_SLOTS.length, selected, notNeeded, missing },
    nextSlot,
  };
}

/**
 * Dry-run a candidate product in a slot and report only the results that involve that slot.
 * Used to filter/annotate option lists so impossible combinations are prevented up front.
 */
export function evaluateCandidate(
  items: BuildItems,
  slot: Slot,
  product: BuilderProduct,
  cfg: EngineConfig = defaultEngineConfig(),
  qty = items[slot]?.qty ?? 1,
): CandidateVerdict {
  const next: BuildItems = { ...items, [slot]: { product, qty } };
  const results = runRules(next, cfg, (r) => r.slots.includes(slot)).filter((r) => r.slots.includes(slot));
  const issues = results.filter((r) => r.severity === "error" || r.severity === "warning");
  const passes = results.filter((r) => r.severity === "success");
  const status = issues.some((r) => r.severity === "error")
    ? "incompatible"
    : issues.length ? "warning" : "compatible";
  return { status, issues, passes };
}

export function priceBuild(items: BuildItems): Pricing {
  let mrpTotal = 0, subtotal = 0, gstIncluded = 0, itemCount = 0;
  for (const line of Object.values(items)) {
    if (!line) continue;
    const { product, qty } = line;
    mrpTotal += Math.max(product.mrp, product.price) * qty;
    subtotal += product.price * qty;
    gstIncluded += (product.price * qty * product.gstRate) / (100 + product.gstRate);
    itemCount += qty;
  }
  return {
    mrpTotal, subtotal, itemCount,
    discount: mrpTotal - subtotal,
    gstIncluded: Math.round(gstIncluded),
    total: subtotal,
  };
}

/** Public facade. Named checks mirror the spec; new rules only need registering in rules.ts. */
export const CompatibilityService = {
  checkCPUWithMotherboard: (items: BuildItems, cfg?: EngineConfig) => [
    ...byRule("cpu-motherboard-socket")(items, cfg),
    ...byRule("cpu-motherboard-generation")(items, cfg),
  ],
  checkRAMWithMotherboard: (items: BuildItems, cfg?: EngineConfig) => [
    ...byRule("ram-motherboard-type")(items, cfg),
    ...byRule("ram-motherboard-capacity")(items, cfg),
    ...byRule("ram-motherboard-speed")(items, cfg),
  ],
  checkGPUWithCase: (items: BuildItems, cfg?: EngineConfig) => [
    ...byRule("gpu-case-length")(items, cfg),
    ...byRule("gpu-case-slots")(items, cfg),
  ],
  checkCoolerWithCPU: (items: BuildItems, cfg?: EngineConfig) => [
    ...byRule("cooler-cpu-socket")(items, cfg),
    ...byRule("cooler-cpu-tdp")(items, cfg),
  ],
  checkCoolerWithCase: (items: BuildItems, cfg?: EngineConfig) => [
    ...byRule("cooler-case-height")(items, cfg),
    ...byRule("cooler-case-radiator")(items, cfg),
  ],
  checkMotherboardWithCase: byRule("motherboard-case-formfactor"),
  checkPSUWithBuild: (items: BuildItems, cfg?: EngineConfig) => [
    ...byRule("psu-wattage")(items, cfg),
    ...byRule("psu-gpu-connectors")(items, cfg),
    ...byRule("psu-case-formfactor")(items, cfg),
  ],
  checkStorageWithMotherboard: (items: BuildItems, cfg?: EngineConfig) => [
    ...byRule("storage-m2-slots")(items, cfg),
    ...byRule("storage-pcie-gen")(items, cfg),
    ...byRule("storage-sata-ports")(items, cfg),
  ],
  validateBuild,
  evaluateCandidate,
  estimatePower: (items: BuildItems, cfg: EngineConfig = defaultEngineConfig()) => estimatePower(items, cfg.power),
  scoreBuild: (items: BuildItems, cfg: EngineConfig = defaultEngineConfig()) =>
    scoreBuild(items, validateBuild(items, cfg), cfg.scoring),
  priceBuild,
};
