import type { BuildItems, PowerConfig, PowerLine, PowerReport } from "./types";
import { norm, num, part, qty, str } from "./spec";

/** Estimate sustained system power from structured specs. */
export function estimatePower(items: BuildItems, cfg: PowerConfig): PowerReport {
  const lines: PowerLine[] = [];
  const add = (label: string, watts: number) => {
    if (watts > 0) lines.push({ label, watts: Math.round(watts) });
  };

  const cpu = part(items, "cpu");
  if (cpu) add("Processor", num(cpu, "maxPower") ?? (num(cpu, "tdp") ?? 65) * cfg.cpuTdpMultiplier);

  const gpu = part(items, "gpu");
  if (gpu) add("Graphics card", num(gpu, "tgp") ?? 150);

  if (part(items, "motherboard") || cpu) add("Motherboard & chipset", cfg.motherboardW);

  const ram = part(items, "ram");
  if (ram) add("Memory", (num(ram, "modules") ?? 2) * qty(items, "ram") * cfg.ramModuleW);

  const ssd = part(items, "ssd");
  if (ssd) add("SSD", qty(items, "ssd") * (norm(str(ssd, "interface")) === "nvme" ? cfg.nvmeW : cfg.sataSsdW));

  if (part(items, "hdd")) add("Hard drives", qty(items, "hdd") * cfg.hddW);

  const cooler = part(items, "cooler");
  if (cooler) add("CPU cooler", norm(str(cooler, "coolerType")) === "aio" ? cfg.aioCoolerW : cfg.airCoolerW);

  const cs = part(items, "case");
  const fans = (num(cs, "includedFans") ?? 0) + (num(part(items, "fans"), "pack") ?? 1) * qty(items, "fans");
  if (fans > 0) add("Fans", fans * cfg.fanW);

  if (part(items, "wifi")) add("Wi-Fi adapter", cfg.wifiCardW);
  if (lines.length > 0) add("USB devices & peripherals", cfg.peripheralsW);

  const estimatedW = lines.reduce((s, l) => s + l.watts, 0);
  const gpuRecommended = num(gpu, "recommendedPsu") ?? 0;
  const withHeadroom = estimatedW * (1 + cfg.headroomPct / 100);
  const recommendedW = estimatedW === 0
    ? 0
    : Math.max(cfg.minRecommendedW, gpuRecommended, Math.ceil(withHeadroom / cfg.roundTo) * cfg.roundTo);

  const selectedW = num(part(items, "psu"), "wattage");
  let status: PowerReport["status"] = "unknown";
  let headroom: number | null = null;
  if (selectedW != null && estimatedW > 0) {
    headroom = (selectedW - estimatedW) / selectedW;
    status = selectedW < estimatedW ? "insufficient" : selectedW < recommendedW ? "low" : "ok";
  }
  return { lines, estimatedW, recommendedW, selectedW, headroom, status };
}
