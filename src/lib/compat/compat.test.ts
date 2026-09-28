import { describe, expect, it } from "vitest";
import type { BuildItems, BuilderProduct, Slot, SpecMap } from "./types";
import { CompatibilityService, evaluateCandidate, priceBuild, validateBuild } from "./service";
import { defaultEngineConfig } from "./defaults";

const mk = (slot: Slot, name: string, specs: SpecMap, price = 10000): BuilderProduct => ({
  id: name, slug: name, name, brand: "X", slot, categorySlug: slot, price, mrp: price + 1000, gstRate: 18, stock: 5, specs,
});

const cpu7800 = mk("cpu", "AMD Ryzen 7 7800X3D", {
  socket: "AM5", generation: "Ryzen 7000", tdp: 120, maxPower: 162, integratedGpu: true, includesCooler: false,
  memoryTypes: ["DDR5"], performanceTier: 9,
}, 34999);
const i5_12400f = mk("cpu", "Intel Core i5-12400F", {
  socket: "LGA1700", generation: "Intel 12th Gen", tdp: 65, maxPower: 117, integratedGpu: false, includesCooler: true,
  memoryTypes: ["DDR4", "DDR5"], performanceTier: 5,
});
const b650 = mk("motherboard", "ASUS TUF B650-PLUS", {
  socket: "AM5", chipset: "B650", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, maxRam: 192, maxRamSpeed: 6400,
  m2Slots: 2, m2Gen5Slots: 0, sataPorts: 4, supportedGenerations: ["Ryzen 7000", "Ryzen 8000"],
  biosUpdateGenerations: ["Ryzen 9000"], wifi: false,
});
const b550 = mk("motherboard", "MSI B550M PRO", {
  socket: "AM4", chipset: "B550", formFactor: "Micro-ATX", ramType: "DDR4", ramSlots: 4, maxRam: 128, m2Slots: 2, sataPorts: 4,
});
const ddr4 = mk("ram", "Corsair Vengeance 16GB DDR4", { ramType: "DDR4", capacity: 16, modules: 2, speed: 3200 });
const ddr5 = mk("ram", "G.Skill 32GB DDR5-6000", { ramType: "DDR5", capacity: 32, modules: 2, speed: 6000 });
const rtx4090 = mk("gpu", "RTX 4090", { length: 340, slots: 3.5, tgp: 450, recommendedPsu: 850, uses12vhpwr: true, pcie8pin: 0, performanceTier: 10 });
const rtx4060 = mk("gpu", "RTX 4060", { length: 240, slots: 2, tgp: 115, recommendedPsu: 550, pcie8pin: 1, performanceTier: 4 });
const smallCase = mk("case", "Compact Case", {
  formFactors: ["Micro-ATX", "Mini-ITX"], maxGpuLength: 320, maxGpuSlots: 3, maxCoolerHeight: 155,
  radiatorSupport: ["240"], psuFormFactor: ["ATX"], fanSlots: 6, includedFans: 1,
});
const bigCase = mk("case", "Big Case", {
  formFactors: ["ATX", "Micro-ATX", "Mini-ITX"], maxGpuLength: 400, maxGpuSlots: 4, maxCoolerHeight: 170,
  radiatorSupport: ["240", "280", "360"], psuFormFactor: ["ATX"], fanSlots: 9, includedFans: 3,
});
const psu550 = mk("psu", "550W Bronze", { wattage: 550, psuFormFactor: "ATX", pcie8pin: 2, has12vhpwr: false });
const psu1000 = mk("psu", "1000W Gold", { wattage: 1000, psuFormFactor: "ATX", pcie8pin: 4, has12vhpwr: true });
const tallCooler = mk("cooler", "Tall Air", { coolerType: "Air", sockets: ["AM5", "LGA1700"], tdpRating: 250, height: 165 });
const aio360 = mk("cooler", "AIO 360", { coolerType: "AIO", sockets: ["AM5", "LGA1700"], tdpRating: 300, radiatorSize: 360 });

const b = (...parts: BuilderProduct[]): BuildItems =>
  Object.fromEntries(parts.map((p) => [p.slot, { product: p, qty: 1 }]));

describe("CompatibilityService", () => {
  it("explains socket mismatch with both part names and a suggestion", () => {
    const [r] = CompatibilityService.checkCPUWithMotherboard(b(cpu7800, b550));
    expect(r.status).toBe("incompatible");
    expect(r.message).toBe("This motherboard uses an AM4 socket while your AMD Ryzen 7 7800X3D requires AM5.");
    expect(r.suggestion).toBe("Choose an AM5 motherboard.");
  });

  it("accepts matching sockets and supported generation", () => {
    const res = CompatibilityService.checkCPUWithMotherboard(b(cpu7800, b650));
    expect(res.every((r) => r.status === "compatible")).toBe(true);
  });

  it("warns when a BIOS update is required", () => {
    const zen5 = mk("cpu", "Ryzen 7 9700X", { socket: "AM5", generation: "Ryzen 9000" });
    const res = CompatibilityService.checkCPUWithMotherboard(b(zen5, b650));
    expect(res.find((r) => r.ruleId === "cpu-motherboard-generation")?.status).toBe("warning");
  });

  it("rejects DDR4 on a DDR5 board", () => {
    const [r] = CompatibilityService.checkRAMWithMotherboard(b(ddr4, b650));
    expect(r.message).toBe("Your selected RAM uses DDR4, but this motherboard supports DDR5.");
  });

  it("rejects too many RAM sticks", () => {
    const items: BuildItems = { motherboard: { product: b650, qty: 1 }, ram: { product: ddr5, qty: 3 } };
    const r = CompatibilityService.checkRAMWithMotherboard(items).find((x) => x.ruleId === "ram-motherboard-capacity");
    expect(r?.status).toBe("incompatible");
  });

  it("explains GPU length problems in mm", () => {
    const [r] = CompatibilityService.checkGPUWithCase(b(rtx4090, smallCase));
    expect(r.message).toBe("Your selected GPU is 340mm long. This cabinet supports GPUs up to 320mm.");
  });

  it("checks cooler height and radiator support", () => {
    expect(CompatibilityService.checkCoolerWithCase(b(tallCooler, smallCase))[0].status).toBe("incompatible");
    expect(CompatibilityService.checkCoolerWithCase(b(aio360, smallCase))[0].status).toBe("incompatible");
    expect(CompatibilityService.checkCoolerWithCase(b(aio360, bigCase))[0].status).toBe("compatible");
  });

  it("checks motherboard form factor against cabinet", () => {
    expect(CompatibilityService.checkMotherboardWithCase(b(b650, smallCase))[0].status).toBe("incompatible");
    expect(CompatibilityService.checkMotherboardWithCase(b(b650, bigCase))[0].status).toBe("compatible");
  });

  it("calculates power and flags an undersized PSU", () => {
    const items = b(cpu7800, b650, ddr5, rtx4090, psu550, bigCase);
    const power = CompatibilityService.estimatePower(items);
    expect(power.estimatedW).toBeGreaterThan(550);
    expect(power.recommendedW % 50).toBe(0);
    const psu = CompatibilityService.checkPSUWithBuild(items);
    expect(psu.find((r) => r.ruleId === "psu-wattage")?.status).toBe("incompatible");
    expect(psu.find((r) => r.ruleId === "psu-gpu-connectors")?.status).toBe("incompatible");
    const good = CompatibilityService.checkPSUWithBuild(b(cpu7800, b650, ddr5, rtx4090, psu1000, bigCase));
    expect(good.every((r) => r.status === "compatible")).toBe(true);
  });

  it("validates a complete compatible build", () => {
    const report = validateBuild(b(cpu7800, b650, aio360, ddr5, rtx4060, psu1000, bigCase,
      mk("ssd", "990 Pro", { interface: "NVMe", pcieGen: 4, capacity: 1000 })));
    expect(report.status).toBe("compatible");
    expect(report.core.selected).toBe(8);
    expect(report.core.missing).toEqual([]);
  });

  it("treats GPU/cooler as not needed when CPU provides them", () => {
    const report = validateBuild(b(i5_12400f));
    expect(report.core.notNeeded).toContain("cooler");
    expect(report.warnings.some((w) => w.ruleId === "display-output")).toBe(true);
  });

  it("evaluates candidates so incompatible options can be hidden", () => {
    const items = b(cpu7800);
    expect(evaluateCandidate(items, "motherboard", b550).status).toBe("incompatible");
    expect(evaluateCandidate(items, "motherboard", b650).status).toBe("compatible");
  });

  it("respects admin rule configuration", () => {
    const cfg = defaultEngineConfig();
    cfg.rules["cpu-motherboard-socket"].enabled = false;
    expect(CompatibilityService.checkCPUWithMotherboard(b(cpu7800, b550), cfg)).toHaveLength(0);
    const cfg2 = defaultEngineConfig();
    cfg2.rules["gpu-case-length"].severity = "warning";
    expect(CompatibilityService.checkGPUWithCase(b(rtx4090, smallCase), cfg2)[0].status).toBe("warning");
  });

  it("prices builds with MRP, discount and included GST", () => {
    const p = priceBuild(b(cpu7800));
    expect(p.total).toBe(34999);
    expect(p.discount).toBe(1000);
    expect(p.gstIncluded).toBe(Math.round((34999 * 18) / 118));
  });
});
