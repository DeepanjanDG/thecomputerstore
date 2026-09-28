import type { BuildItems, BuildReport, ScoringConfig } from "./types";
import { bool, num, part, qty, str, includesId } from "./spec";

export type Rating = "excellent" | "good" | "fair" | "poor";

export interface ScoreLine {
  key: "compatibility" | "power" | "balance" | "upgrade" | "gaming";
  label: string;
  value: string;
  rating: Rating;
  detail: string;
}

export interface BuildScore {
  ready: boolean;
  lines: ScoreLine[];
}

/**
 * Qualitative build analysis. Uses admin-assigned performance tiers (1–10) — not benchmark
 * numbers — so nothing is presented as measured performance.
 */
export function scoreBuild(items: BuildItems, report: BuildReport, cfg: ScoringConfig): BuildScore {
  const selected = Object.keys(items).length;
  if (selected < cfg.minComponentsForScore) return { ready: false, lines: [] };
  const lines: ScoreLine[] = [];

  // Compatibility
  if (report.errors.length)
    lines.push({ key: "compatibility", label: "Compatibility", value: "Needs attention", rating: "poor",
      detail: `${report.errors.length} incompatible part${report.errors.length > 1 ? "s" : ""} to fix.` });
  else if (report.warnings.length)
    lines.push({ key: "compatibility", label: "Compatibility", value: "Good", rating: "good",
      detail: `${report.warnings.length} minor warning${report.warnings.length > 1 ? "s" : ""}.` });
  else
    lines.push({ key: "compatibility", label: "Compatibility", value: "Excellent", rating: "excellent",
      detail: "Every selected part works together." });

  // Power headroom
  const h = report.power.headroom;
  if (h != null) {
    const t = cfg.powerHeadroom;
    const [value, rating]: [string, Rating] =
      h >= t.excellent ? ["Excellent", "excellent"] : h >= t.good ? ["Good", "good"] : h >= t.tight ? ["Tight", "fair"] : ["Insufficient", "poor"];
    lines.push({ key: "power", label: "Power Headroom", value, rating,
      detail: `${Math.round(h * 100)}% spare capacity over ~${report.power.estimatedW}W.` });
  }

  // Performance balance
  const cpuTier = num(part(items, "cpu"), "performanceTier");
  const gpuTier = num(part(items, "gpu"), "performanceTier");
  if (cpuTier != null && gpuTier != null) {
    const diff = gpuTier - cpuTier;
    if (Math.abs(diff) <= cfg.balance.balancedWithin)
      lines.push({ key: "balance", label: "Performance Balance", value: "Balanced", rating: "excellent",
        detail: "CPU and GPU are well matched." });
    else if (diff > 0)
      lines.push({ key: "balance", label: "Performance Balance", value: "CPU-limited", rating: "fair",
        detail: "A faster processor would let this graphics card stretch its legs." });
    else
      lines.push({ key: "balance", label: "Performance Balance", value: "GPU-limited", rating: "good",
        detail: "Great for productivity; a stronger GPU would help in games." });
  }

  // Upgrade potential
  const mb = part(items, "motherboard");
  if (mb) {
    let points = 0;
    const why: string[] = [];
    if (includesId(cfg.longLivedSockets, str(mb, "socket"))) { points += 2; why.push(`${str(mb, "socket")} platform has an upgrade path`); }
    const ram = part(items, "ram");
    const usedSlots = ram ? (num(ram, "modules") ?? 2) * qty(items, "ram") : 0;
    const freeSlots = (num(mb, "ramSlots") ?? 0) - usedSlots;
    if (freeSlots > 0) { points += 1; why.push(`${freeSlots} free RAM slot${freeSlots > 1 ? "s" : ""}`); }
    const freeM2 = (num(mb, "m2Slots") ?? 0) - (part(items, "ssd") ? qty(items, "ssd") : 0);
    if (freeM2 > 0) { points += 1; why.push(`${freeM2} free M.2 slot${freeM2 > 1 ? "s" : ""}`); }
    if ((report.power.headroom ?? 0) >= cfg.powerHeadroom.good) { points += 1; why.push("PSU room for a bigger GPU"); }
    const [value, rating]: [string, Rating] =
      points >= 4 ? ["Excellent", "excellent"] : points >= 2 ? ["Good", "good"] : ["Limited", "fair"];
    lines.push({ key: "upgrade", label: "Upgrade Potential", value, rating, detail: why.join(" · ") || "Few spare slots." });
  }

  // Gaming tier
  if (gpuTier != null) {
    const tier = [...cfg.gamingTiers].sort((a, b) => b.minTier - a.minTier).find((t) => gpuTier >= t.minTier);
    lines.push({ key: "gaming", label: "Estimated Gaming Tier", value: tier?.label ?? "Light gaming",
      rating: gpuTier >= 7 ? "excellent" : gpuTier >= 4 ? "good" : "fair",
      detail: "Based on our graphics-card tiering, not measured FPS." });
  } else if (part(items, "cpu")) {
    const igpu = bool(part(items, "cpu"), "integratedGpu");
    lines.push({ key: "gaming", label: "Estimated Gaming Tier", value: igpu ? "Light / casual gaming" : "Add a GPU",
      rating: "fair", detail: igpu ? "Integrated graphics handle older and esports titles at low settings." : "No graphics card selected." });
  }

  return { ready: true, lines };
}
