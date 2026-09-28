import type { EngineConfig, PowerConfig, RuleConfigMap, ScoringConfig } from "./types";
import { RULES } from "./rules";

// Defaults used when the database has no override. Admins edit these in
// Admin → Compatibility (stored in compatibility_rules + settings).

export const DEFAULT_POWER: PowerConfig = {
  motherboardW: 50,
  ramModuleW: 5,
  nvmeW: 7,
  sataSsdW: 4,
  hddW: 9,
  fanW: 3,
  airCoolerW: 4,
  aioCoolerW: 12,
  wifiCardW: 5,
  peripheralsW: 25,
  cpuTdpMultiplier: 1.35,
  headroomPct: 30,
  roundTo: 50,
  minRecommendedW: 450,
};

export const DEFAULT_SCORING: ScoringConfig = {
  powerHeadroom: { excellent: 0.35, good: 0.2, tight: 0.08 },
  balance: { balancedWithin: 2 },
  longLivedSockets: ["AM5", "LGA1851"],
  gamingTiers: [
    { minTier: 9, label: "4K Gaming" },
    { minTier: 7, label: "1440p High-Refresh Gaming" },
    { minTier: 5, label: "1440p Gaming" },
    { minTier: 3, label: "1080p Gaming" },
    { minTier: 1, label: "1080p Esports" },
  ],
  minComponentsForScore: 4,
};

export function defaultRuleConfig(): RuleConfigMap {
  return Object.fromEntries(
    RULES.map((r) => [r.id, { enabled: true, severity: null, params: { ...(r.defaultParams ?? {}) } }]),
  );
}

export function defaultEngineConfig(): EngineConfig {
  return { rules: defaultRuleConfig(), power: DEFAULT_POWER, scoring: DEFAULT_SCORING };
}
