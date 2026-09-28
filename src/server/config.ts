import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "./db";
import { DEFAULT_POWER, DEFAULT_SCORING, defaultRuleConfig } from "@/lib/compat/defaults";
import type { EngineConfig, PowerConfig, ScoringConfig } from "@/lib/compat/types";
import { DEFAULT_AUTOBUILD, DEFAULT_HOME, DEFAULT_SOCIAL, type AutoBuildConfig, type HomeContent, type SocialLinks } from "./settings-defaults";

export const CONFIG_TAG = "engine-config";

const DEFAULTS = {
  power: DEFAULT_POWER,
  scoring: DEFAULT_SCORING,
  autobuild: DEFAULT_AUTOBUILD,
  home: DEFAULT_HOME,
  social: DEFAULT_SOCIAL,
};
type SettingKey = keyof typeof DEFAULTS;
type SettingValue<K extends SettingKey> = (typeof DEFAULTS)[K];

async function readSetting<K extends SettingKey>(key: K): Promise<SettingValue<K>> {
  const row = await db.setting.findUnique({ where: { key } });
  const base = DEFAULTS[key];
  if (!row || typeof row.value !== "object" || row.value === null) return base;
  return { ...base, ...(row.value as object) } as SettingValue<K>;
}

export const getSetting = <K extends SettingKey>(key: K) =>
  unstable_cache(() => readSetting(key), ["setting", key], { tags: [CONFIG_TAG] })();

/** Engine configuration = code defaults overlaid with admin overrides from the database. */
export const getEngineConfig = unstable_cache(
  async (): Promise<EngineConfig> => {
    const rules = defaultRuleConfig();
    const rows = await db.compatibilityRule.findMany();
    for (const r of rows) {
      if (!rules[r.id]) continue;
      rules[r.id] = {
        enabled: r.enabled,
        severity: (r.severity as "error" | "warning" | "info" | null) ?? null,
        params: { ...rules[r.id].params, ...((r.params as Record<string, unknown>) ?? {}) },
      };
    }
    const [power, scoring] = await Promise.all([readSetting("power"), readSetting("scoring")]);
    return { rules, power: power as PowerConfig, scoring: scoring as ScoringConfig };
  },
  ["engine-config"],
  { tags: [CONFIG_TAG] },
);

export type { AutoBuildConfig, HomeContent, SocialLinks };
