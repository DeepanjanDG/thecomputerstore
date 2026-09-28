// Types shared by the compatibility engine, the builder UI and the server.
// This module must stay free of React and Prisma so it runs anywhere.

export const SLOTS = [
  "cpu",
  "motherboard",
  "cooler",
  "ram",
  "gpu",
  "ssd",
  "hdd",
  "psu",
  "case",
  "fans",
  "monitor",
  "keyboard",
  "mouse",
  "headset",
  "speakers",
  "wifi",
  "os",
  "ups",
  "accessories",
] as const;

export type Slot = (typeof SLOTS)[number];

export type SpecValue = number | string | boolean | string[] | null;
export type SpecMap = Record<string, SpecValue>;

/** The minimal product shape the engine and builder need. */
export interface BuilderProduct {
  id: string;
  slug: string;
  name: string;
  model?: string | null;
  brand: string;
  slot: Slot;
  categorySlug: string;
  price: number;
  mrp: number;
  gstRate: number;
  stock: number;
  warranty?: string | null;
  image?: string | null;
  rating?: number | null;
  popularity?: number;
  /** ISO date, used for "Newest" sorting */
  released?: string | null;
  specs: SpecMap;
}

export interface BuildLine {
  product: BuilderProduct;
  qty: number;
}

export type BuildItems = Partial<Record<Slot, BuildLine>>;

export type CheckStatus = "compatible" | "warning" | "incompatible" | "info";
export type Severity = "success" | "warning" | "error" | "info";

export interface CheckResult {
  ruleId: string;
  status: CheckStatus;
  severity: Severity;
  message: string;
  /** What the customer can do about it. */
  suggestion?: string;
  /** Slots involved; the UI uses the first one for the "Change …" action. */
  slots: Slot[];
}

export interface RuleConfig {
  enabled: boolean;
  /** Overrides the severity of non-success results ("error" | "warning" | "info"). */
  severity?: "error" | "warning" | "info" | null;
  params: Record<string, unknown>;
}

export type RuleConfigMap = Record<string, RuleConfig>;

export interface PowerConfig {
  motherboardW: number;
  ramModuleW: number;
  nvmeW: number;
  sataSsdW: number;
  hddW: number;
  fanW: number;
  airCoolerW: number;
  aioCoolerW: number;
  wifiCardW: number;
  peripheralsW: number;
  /** Multiplier applied to CPU TDP when no maxPower spec exists. */
  cpuTdpMultiplier: number;
  /** Headroom applied on top of estimated load for the recommended PSU. */
  headroomPct: number;
  roundTo: number;
  minRecommendedW: number;
}

export interface ScoringConfig {
  powerHeadroom: { excellent: number; good: number; tight: number };
  balance: { balancedWithin: number };
  longLivedSockets: string[];
  gamingTiers: { minTier: number; label: string }[];
  minComponentsForScore: number;
}

export interface EngineConfig {
  rules: RuleConfigMap;
  power: PowerConfig;
  scoring: ScoringConfig;
}

export interface PowerLine {
  label: string;
  watts: number;
}

export interface PowerReport {
  lines: PowerLine[];
  estimatedW: number;
  recommendedW: number;
  selectedW: number | null;
  /** (selected - estimated) / selected, 0..1 */
  headroom: number | null;
  status: "ok" | "low" | "insufficient" | "unknown";
}

export type BuildStatus = "compatible" | "warning" | "incompatible" | "empty";

export interface BuildReport {
  status: BuildStatus;
  results: CheckResult[];
  errors: CheckResult[];
  warnings: CheckResult[];
  infos: CheckResult[];
  passes: CheckResult[];
  power: PowerReport;
  core: {
    total: number;
    selected: number;
    /** Core slots that are satisfied without a part (e.g. iGPU, boxed cooler). */
    notNeeded: Slot[];
    missing: Slot[];
  };
  nextSlot: Slot | null;
}

export interface CandidateVerdict {
  status: CheckStatus;
  /** Only non-success results involving the candidate's slot. */
  issues: CheckResult[];
  /** Success results — used for "✓ Fits your AM5 motherboard" hints. */
  passes: CheckResult[];
}

export interface Pricing {
  mrpTotal: number;
  subtotal: number;
  discount: number;
  gstIncluded: number;
  total: number;
  itemCount: number;
}
