import type { BuilderProduct, Slot, SpecValue } from "./compat/types";

// Client-safe spec labels/units for builder cards and comparison tables.
const META: Record<string, { label: string; unit?: string; fmt?: (v: SpecValue) => string }> = {
  socket: { label: "Socket" }, generation: { label: "Generation" }, cores: { label: "Cores" }, threads: { label: "Threads" },
  baseClock: { label: "Base clock", unit: "GHz" }, boostClock: { label: "Boost clock", unit: "GHz" }, l3Cache: { label: "L3 cache", unit: "MB" },
  tdp: { label: "TDP", unit: "W" }, maxPower: { label: "Max power", unit: "W" },
  integratedGpu: { label: "Integrated graphics" }, includesCooler: { label: "Cooler in box" }, memoryTypes: { label: "Memory" },
  chipset: { label: "Chipset" }, formFactor: { label: "Form factor" }, ramType: { label: "Memory type" }, ramSlots: { label: "RAM slots" },
  maxRam: { label: "Max memory", unit: "GB" }, maxRamSpeed: { label: "Max RAM speed", unit: "MT/s" }, m2Slots: { label: "M.2 slots" },
  m2Gen5Slots: { label: "Gen5 M.2" }, sataPorts: { label: "SATA ports" }, pcieSlots: { label: "PCIe x16" }, wifi: { label: "Wi-Fi" },
  coolerType: { label: "Type" }, sockets: { label: "Sockets" }, tdpRating: { label: "Rated for", unit: "W" }, height: { label: "Height", unit: "mm" },
  radiatorSize: { label: "Radiator", unit: "mm" }, fanSize: { label: "Fan size", unit: "mm" }, rgb: { label: "RGB" },
  capacity: { label: "Capacity", fmt: (v) => (typeof v === "number" && v >= 1000 ? `${v / 1000} TB` : `${v} GB`) },
  modules: { label: "Sticks" }, speed: { label: "Speed", unit: "MT/s" }, casLatency: { label: "CAS latency", fmt: (v) => `CL${v}` },
  gpuBrand: { label: "GPU brand" }, vram: { label: "VRAM", unit: "GB" }, length: { label: "Length", unit: "mm" }, slots: { label: "Thickness", unit: "slots" },
  tgp: { label: "Board power", unit: "W" }, recommendedPsu: { label: "Rec. PSU", unit: "W" }, pcie8pin: { label: "8-pin PCIe" }, uses12vhpwr: { label: "16-pin" },
  interface: { label: "Interface" }, pcieGen: { label: "PCIe", fmt: (v) => `Gen ${v}` }, readSpeed: { label: "Read", unit: "MB/s" }, writeSpeed: { label: "Write", unit: "MB/s" },
  rpm: { label: "Speed", unit: "RPM" }, wattage: { label: "Wattage", unit: "W" }, efficiency: { label: "80 PLUS" }, psuFormFactor: { label: "Form factor" },
  modular: { label: "Modular" }, has12vhpwr: { label: "16-pin cable" }, atx3: { label: "ATX 3.x" }, caseSize: { label: "Size" },
  formFactors: { label: "Boards" }, maxGpuLength: { label: "Max GPU", unit: "mm" }, maxGpuSlots: { label: "GPU thickness", unit: "slots" },
  maxCoolerHeight: { label: "Max cooler", unit: "mm" }, radiatorSupport: { label: "Radiators", fmt: (v) => (Array.isArray(v) ? v.map((x) => `${x}mm`).join(", ") || "—" : String(v)) },
  fanSlots: { label: "Fan mounts" }, includedFans: { label: "Fans included" }, glass: { label: "Glass" }, colour: { label: "Colour" }, pack: { label: "Pack" },
  maxRpm: { label: "Max speed", unit: "RPM" }, size: { label: "Size", unit: "\"" }, resolution: { label: "Resolution" }, refreshRate: { label: "Refresh", unit: "Hz" },
  panel: { label: "Panel" }, responseTime: { label: "Response", unit: "ms" }, adaptiveSync: { label: "Sync" }, switchType: { label: "Switches" },
  layout: { label: "Layout" }, connectivity: { label: "Connectivity" }, dpi: { label: "DPI" }, weight: { label: "Weight", unit: "g" },
  driver: { label: "Driver", unit: "mm" }, surround: { label: "Surround" }, channels: { label: "Channels" }, power: { label: "Power", unit: "W" },
  deviceType: { label: "Device" }, standard: { label: "Standard" }, bluetooth: { label: "Bluetooth" }, ports: { label: "Ports" },
  licence: { label: "Licence" }, users: { label: "Devices" }, validity: { label: "Validity" }, va: { label: "Capacity", unit: "VA" }, watts: { label: "Output", unit: "W" },
  upsType: { label: "Type" }, outlets: { label: "Outlets" }, type: { label: "Type" }, detail: { label: "Detail" }, performanceTier: { label: "Performance tier", fmt: (v) => `${v}/10` },
};

export function specLabel(key: string) {
  return META[key]?.label ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

export function formatSpecValue(key: string, v: SpecValue | undefined): string {
  if (v == null || v === "") return "—";
  const m = META[key];
  if (m?.fmt) return m.fmt(v);
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.join(", ") || "—";
  return m?.unit ? `${v}${m.unit.startsWith("\"") ? "" : " "}${m.unit}` : String(v);
}

/** The 3–4 specs that matter most when choosing a part for each builder slot. */
export const SLOT_CARD_SPECS: Partial<Record<Slot, string[]>> = {
  cpu: ["cores", "threads", "socket", "boostClock", "tdp"],
  motherboard: ["socket", "chipset", "formFactor", "ramType", "m2Slots"],
  cooler: ["coolerType", "tdpRating", "height", "radiatorSize"],
  ram: ["capacity", "ramType", "speed", "casLatency"],
  gpu: ["vram", "length", "tgp", "recommendedPsu"],
  ssd: ["capacity", "interface", "pcieGen", "readSpeed"],
  hdd: ["capacity", "rpm"],
  psu: ["wattage", "efficiency", "modular", "psuFormFactor"],
  case: ["caseSize", "formFactors", "maxGpuLength", "maxCoolerHeight"],
  fans: ["fanSize", "pack", "rgb"],
  monitor: ["size", "resolution", "refreshRate", "panel"],
  keyboard: ["switchType", "layout", "connectivity"],
  mouse: ["dpi", "weight", "connectivity"],
  headset: ["connectivity", "driver"],
  speakers: ["channels", "power", "connectivity"],
  wifi: ["deviceType", "standard", "bluetooth"],
  os: ["licence", "validity"],
  ups: ["va", "watts", "upsType"],
  accessories: ["type", "detail"],
};

/** Spec comparison rows per slot (compare dialog / page). */
export const SLOT_COMPARE_SPECS: Partial<Record<Slot, string[]>> = {
  cpu: ["cores", "threads", "baseClock", "boostClock", "l3Cache", "socket", "generation", "tdp", "maxPower", "integratedGpu", "includesCooler", "memoryTypes", "performanceTier"],
  motherboard: ["socket", "chipset", "formFactor", "ramType", "ramSlots", "maxRam", "maxRamSpeed", "m2Slots", "m2Gen5Slots", "sataPorts", "pcieSlots", "wifi"],
  cooler: ["coolerType", "tdpRating", "height", "radiatorSize", "fanSize", "sockets", "rgb"],
  ram: ["capacity", "modules", "ramType", "speed", "casLatency", "rgb"],
  gpu: ["chipset", "vram", "length", "slots", "tgp", "recommendedPsu", "pcie8pin", "uses12vhpwr", "performanceTier"],
  ssd: ["capacity", "interface", "pcieGen", "formFactor", "readSpeed", "writeSpeed"],
  psu: ["wattage", "efficiency", "modular", "psuFormFactor", "pcie8pin", "has12vhpwr", "atx3"],
  case: ["caseSize", "formFactors", "maxGpuLength", "maxGpuSlots", "maxCoolerHeight", "radiatorSupport", "psuFormFactor", "fanSlots", "includedFans", "colour"],
  monitor: ["size", "resolution", "refreshRate", "panel", "responseTime", "adaptiveSync"],
};

/** Quick filter chips in the builder (values come from the product pool). */
export const SLOT_FILTER_KEYS: Partial<Record<Slot, string[]>> = {
  cpu: ["socket", "cores"],
  motherboard: ["socket", "formFactor", "ramType", "wifi"],
  cooler: ["coolerType"],
  ram: ["ramType", "capacity"],
  gpu: ["gpuBrand", "vram"],
  ssd: ["capacity", "interface"],
  hdd: ["capacity"],
  psu: ["wattage", "efficiency"],
  case: ["caseSize", "colour"],
  monitor: ["resolution", "refreshRate"],
};

export function cardSpecs(p: BuilderProduct) {
  const keys = SLOT_CARD_SPECS[p.slot] ?? Object.keys(p.specs).slice(0, 3);
  return keys.filter((k) => p.specs[k] != null && p.specs[k] !== "").map((k) => ({ key: k, label: specLabel(k), value: formatSpecValue(k, p.specs[k]) }));
}
