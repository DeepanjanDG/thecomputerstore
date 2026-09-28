import type { BuildItems, CheckResult, PowerReport, Slot } from "./types";
import {
  bool, formFactor, includesId, list, norm, num, part, qty, sameId, str,
} from "./spec";

/**
 * Compatibility rules. Each rule is pure: it receives the current build and returns
 * explained results. Rules return nothing when the parts they need are not selected yet.
 *
 * To add a rule: append it to RULES. Its id becomes a row in the compatibility_rules
 * table (created by the seed / admin "Sync rules" action) so it can be tuned without code.
 */

export interface RuleContext {
  items: BuildItems;
  params: Record<string, unknown>;
  power: PowerReport;
}

export interface Rule {
  id: string;
  title: string;
  description: string;
  slots: Slot[];
  defaultParams?: Record<string, unknown>;
  check(ctx: RuleContext): CheckResult[];
}

const ok = (ruleId: string, slots: Slot[], message: string): CheckResult => ({
  ruleId, slots, message, status: "compatible", severity: "success",
});
const bad = (ruleId: string, slots: Slot[], message: string, suggestion?: string): CheckResult => ({
  ruleId, slots, message, suggestion, status: "incompatible", severity: "error",
});
const warn = (ruleId: string, slots: Slot[], message: string, suggestion?: string): CheckResult => ({
  ruleId, slots, message, suggestion, status: "warning", severity: "warning",
});
const note = (ruleId: string, slots: Slot[], message: string, suggestion?: string): CheckResult => ({
  ruleId, slots, message, suggestion, status: "info", severity: "info",
});

const p = (ctx: RuleContext, key: string, fallback: number) => {
  const v = ctx.params[key];
  return typeof v === "number" ? v : fallback;
};

const dispName = (name: string) => name.replace(/\s*\(.*?\)\s*$/, "");

export const RULES: Rule[] = [
  // ── CPU ↔ Motherboard ──────────────────────────────────────────────
  {
    id: "cpu-motherboard-socket",
    title: "CPU socket matches motherboard",
    description: "The processor socket (AM5, LGA1700…) must be identical on both parts.",
    slots: ["cpu", "motherboard"],
    check({ items }) {
      const cpu = part(items, "cpu"), mb = part(items, "motherboard");
      const cs = str(cpu, "socket"), ms = str(mb, "socket");
      if (!cpu || !mb || !cs || !ms) return [];
      if (sameId(cs, ms))
        return [ok(this.id, this.slots, `${dispName(cpu.name)} fits the ${ms} socket on ${dispName(mb.name)}.`)];
      return [bad(this.id, this.slots,
        `This motherboard uses an ${ms} socket while your ${dispName(cpu.name)} requires ${cs}.`,
        `Choose an ${cs} motherboard.`)];
    },
  },
  {
    id: "cpu-motherboard-generation",
    title: "Chipset supports the CPU generation",
    description: "Some chipsets only support certain CPU generations, or need a BIOS update first.",
    slots: ["cpu", "motherboard"],
    check({ items }) {
      const cpu = part(items, "cpu"), mb = part(items, "motherboard");
      const gen = str(cpu, "generation");
      const supported = list(mb, "supportedGenerations");
      if (!cpu || !mb || !gen || supported.length === 0) return [];
      if (!sameId(str(cpu, "socket"), str(mb, "socket"))) return [];
      if (includesId(supported, gen))
        return [ok(this.id, this.slots, `The ${str(mb, "chipset") ?? "chipset"} chipset supports ${gen} processors.`)];
      if (includesId(list(mb, "biosUpdateGenerations"), gen))
        return [warn(this.id, this.slots,
          `${dispName(mb.name)} supports ${gen} processors only after a BIOS update.`,
          "We update the BIOS free of charge when we assemble your PC. If you're assembling it yourself, choose a board that supports it out of the box.")];
      return [bad(this.id, this.slots,
        `The ${str(mb, "chipset") ?? ""} chipset on ${dispName(mb.name)} doesn't support ${gen} processors like your ${dispName(cpu.name)}.`,
        `Choose a motherboard that lists ${gen} support.`)];
    },
  },

  // ── RAM ────────────────────────────────────────────────────────────
  {
    id: "ram-motherboard-type",
    title: "Memory type matches motherboard",
    description: "DDR4 and DDR5 are physically different and not interchangeable.",
    slots: ["ram", "motherboard"],
    check({ items }) {
      const ram = part(items, "ram"), mb = part(items, "motherboard");
      const rt = str(ram, "ramType"), mt = str(mb, "ramType");
      if (!ram || !mb || !rt || !mt) return [];
      if (sameId(rt, mt)) return [ok(this.id, this.slots, `${rt} memory matches the motherboard.`)];
      return [bad(this.id, this.slots,
        `Your selected RAM uses ${rt}, but this motherboard supports ${mt}.`,
        `Choose ${mt} memory.`)];
    },
  },
  {
    id: "ram-cpu-type",
    title: "Memory type supported by CPU",
    description: "Checked before a motherboard is chosen, e.g. AM5 processors only support DDR5.",
    slots: ["ram", "cpu"],
    check({ items }) {
      const ram = part(items, "ram"), cpu = part(items, "cpu");
      if (!ram || !cpu || part(items, "motherboard")) return [];
      const types = list(cpu, "memoryTypes"), rt = str(ram, "ramType");
      if (types.length === 0 || !rt) return [];
      if (includesId(types, rt)) return [ok(this.id, this.slots, `${dispName(cpu.name)} supports ${rt} memory.`)];
      return [bad(this.id, this.slots,
        `Your ${dispName(cpu.name)} only supports ${types.join(" / ")} memory, but this kit is ${rt}.`,
        `Choose ${types.join(" or ")} memory.`)];
    },
  },
  {
    id: "ram-motherboard-capacity",
    title: "Memory slots and maximum capacity",
    description: "Total sticks must fit the board's slots and total GB must not exceed its maximum.",
    slots: ["ram", "motherboard"],
    check({ items }) {
      const ram = part(items, "ram"), mb = part(items, "motherboard");
      if (!ram || !mb) return [];
      const kits = qty(items, "ram");
      const sticks = (num(ram, "modules") ?? 1) * kits;
      const total = (num(ram, "capacity") ?? 0) * kits;
      const slots = num(mb, "ramSlots"), max = num(mb, "maxRam");
      if (slots != null && sticks > slots)
        return [bad(this.id, this.slots,
          `This setup uses ${sticks} memory sticks but ${dispName(mb.name)} has only ${slots} slots.`,
          kits > 1 ? "Reduce the number of kits or choose a higher-capacity kit." : "Choose a kit with fewer sticks.")];
      if (max != null && total > max)
        return [bad(this.id, this.slots,
          `${total}GB of memory exceeds the ${max}GB maximum supported by ${dispName(mb.name)}.`,
          `Choose ${max}GB or less.`)];
      return [ok(this.id, this.slots, `${total}GB in ${sticks} of ${slots ?? "?"} memory slots.`)];
    },
  },
  {
    id: "ram-motherboard-speed",
    title: "Memory speed supported",
    description: "Faster memory than the board supports still works, but runs at the board's limit.",
    slots: ["ram", "motherboard"],
    check({ items }) {
      const ram = part(items, "ram"), mb = part(items, "motherboard");
      const speed = num(ram, "speed"), max = num(mb, "maxRamSpeed");
      if (!ram || !mb || speed == null || max == null) return [];
      if (speed <= max) return [ok(this.id, this.slots, `${speed} MT/s is supported by the motherboard.`)];
      return [warn(this.id, this.slots,
        `Your ${speed} MT/s memory will run at up to ${max} MT/s on this motherboard.`,
        `It will work fine — or choose a ${max} MT/s kit to save money.`)];
    },
  },

  // ── GPU ────────────────────────────────────────────────────────────
  {
    id: "gpu-case-length",
    title: "Graphics card length fits cabinet",
    description: "GPU length must be within the cabinet's maximum GPU clearance.",
    slots: ["gpu", "case"],
    defaultParams: { tightMm: 10 },
    check(ctx) {
      const { items } = ctx;
      const gpu = part(items, "gpu"), cs = part(items, "case");
      const len = num(gpu, "length"), max = num(cs, "maxGpuLength");
      if (!gpu || !cs || len == null || max == null) return [];
      if (len > max)
        return [bad(this.id, this.slots,
          `Your selected GPU is ${len}mm long. This cabinet supports GPUs up to ${max}mm.`,
          "Choose a larger cabinet or a shorter graphics card.")];
      if (max - len < p(ctx, "tightMm", 10))
        return [warn(this.id, this.slots,
          `Your ${len}mm GPU fits with only ${max - len}mm to spare. Front fans or radiators may not fit.`,
          "A cabinet with more GPU clearance will make assembly and airflow easier.")];
      return [ok(this.id, this.slots, `${len}mm GPU fits (cabinet allows ${max}mm).`)];
    },
  },
  {
    id: "gpu-case-slots",
    title: "Graphics card thickness fits cabinet",
    description: "Thick GPUs occupy 2.5–3.5 expansion slots; small cabinets may not fit them.",
    slots: ["gpu", "case"],
    check({ items }) {
      const gpu = part(items, "gpu"), cs = part(items, "case");
      const s = num(gpu, "slots"), max = num(cs, "maxGpuSlots");
      if (!gpu || !cs || s == null || max == null) return [];
      if (s <= max) return [ok(this.id, this.slots, `${s}-slot GPU fits the cabinet.`)];
      return [bad(this.id, this.slots,
        `Your GPU is ${s} slots thick, but this cabinet only fits ${max}-slot cards.`,
        "Choose a slimmer graphics card or a larger cabinet.")];
    },
  },
  {
    id: "display-output",
    title: "Display output available",
    description: "A build needs a graphics card unless the CPU has integrated graphics.",
    slots: ["gpu", "cpu"],
    check({ items }) {
      const cpu = part(items, "cpu");
      if (!cpu || part(items, "gpu")) return [];
      if (bool(cpu, "integratedGpu"))
        return [note(this.id, ["gpu"],
          `Your ${dispName(cpu.name)} has integrated graphics, so a graphics card is optional.`,
          "Integrated graphics are fine for study, office and media. Add a GPU for gaming or 3D.")];
      return [warn(this.id, ["gpu"],
        `Your ${dispName(cpu.name)} has no integrated graphics, so you'll need a graphics card for display output.`,
        "Choose a graphics card.")];
    },
  },

  // ── Cooler ─────────────────────────────────────────────────────────
  {
    id: "cooler-cpu-socket",
    title: "Cooler supports CPU socket",
    description: "The cooler must include mounting hardware for the CPU socket.",
    slots: ["cooler", "cpu"],
    check({ items }) {
      const cooler = part(items, "cooler"), cpu = part(items, "cpu");
      const sockets = list(cooler, "sockets"), cs = str(cpu, "socket");
      if (!cooler || !cpu || !cs || sockets.length === 0) return [];
      if (includesId(sockets, cs)) return [ok(this.id, this.slots, `Cooler mounts on ${cs}.`)];
      return [bad(this.id, this.slots,
        `${dispName(cooler.name)} doesn't support the ${cs} socket used by your ${dispName(cpu.name)}.`,
        `Choose a cooler with ${cs} mounting.`)];
    },
  },
  {
    id: "cooler-cpu-tdp",
    title: "Cooler handles CPU heat output",
    description: "Cooler TDP rating should meet the CPU's sustained power draw.",
    slots: ["cooler", "cpu"],
    check({ items }) {
      const cooler = part(items, "cooler"), cpu = part(items, "cpu");
      const rating = num(cooler, "tdpRating");
      const draw = num(cpu, "maxPower") ?? num(cpu, "tdp");
      if (!cooler || !cpu || rating == null || draw == null) return [];
      if (rating >= draw) return [ok(this.id, this.slots, `Rated for ${rating}W — enough for this CPU (${draw}W).`)];
      return [warn(this.id, this.slots,
        `${dispName(cooler.name)} is rated for ${rating}W, but your ${dispName(cpu.name)} can draw up to ${draw}W. Expect higher temperatures and fan noise under heavy load.`,
        `Choose a cooler rated for ${draw}W or more.`)];
    },
  },
  {
    id: "cooler-case-height",
    title: "Air cooler height fits cabinet",
    description: "Tower air coolers must be shorter than the cabinet's cooler clearance.",
    slots: ["cooler", "case"],
    check({ items }) {
      const cooler = part(items, "cooler"), cs = part(items, "case");
      if (!cooler || !cs || norm(str(cooler, "coolerType")) !== "air") return [];
      const h = num(cooler, "height"), max = num(cs, "maxCoolerHeight");
      if (h == null || max == null) return [];
      if (h <= max) return [ok(this.id, this.slots, `${h}mm cooler fits (cabinet allows ${max}mm).`)];
      return [bad(this.id, this.slots,
        `Your ${dispName(cooler.name)} is ${h}mm tall, but this cabinet fits CPU coolers up to ${max}mm.`,
        "Choose a shorter cooler, a liquid cooler, or a wider cabinet.")];
    },
  },
  {
    id: "cooler-case-radiator",
    title: "Liquid cooler radiator fits cabinet",
    description: "AIO radiator size must be one the cabinet supports.",
    slots: ["cooler", "case"],
    check({ items }) {
      const cooler = part(items, "cooler"), cs = part(items, "case");
      if (!cooler || !cs || norm(str(cooler, "coolerType")) !== "aio") return [];
      const size = num(cooler, "radiatorSize");
      const supported = list(cs, "radiatorSupport");
      if (size == null || supported.length === 0) return [];
      if (supported.some((s) => Number(s) === size))
        return [ok(this.id, this.slots, `${size}mm radiator fits the cabinet.`)];
      return [bad(this.id, this.slots,
        `This ${size}mm liquid cooler needs a ${size}mm radiator mount, but this cabinet supports ${supported.map((s) => s + "mm").join(", ")}.`,
        "Choose a cabinet with a matching radiator mount or a different cooler.")];
    },
  },
  {
    id: "cooler-stock",
    title: "Stock cooler detection",
    description: "Explains when a CPU includes a cooler in the box.",
    slots: ["cooler", "cpu"],
    check({ items }) {
      const cpu = part(items, "cpu");
      if (!cpu || part(items, "cooler")) return [];
      if (bool(cpu, "includesCooler"))
        return [note(this.id, ["cooler"],
          `Your ${dispName(cpu.name)} includes a stock cooler, so a separate cooler is optional.`,
          "An aftermarket cooler will run quieter and cooler.")];
      return [];
    },
  },

  // ── Motherboard ↔ Cabinet ──────────────────────────────────────────
  {
    id: "motherboard-case-formfactor",
    title: "Motherboard size fits cabinet",
    description: "ATX, Micro-ATX, Mini-ITX and E-ATX boards need a cabinet that supports them.",
    slots: ["motherboard", "case"],
    check({ items }) {
      const mb = part(items, "motherboard"), cs = part(items, "case");
      const ff = str(mb, "formFactor"), supported = list(cs, "formFactors");
      if (!mb || !cs || !ff || supported.length === 0) return [];
      if (supported.some((s) => formFactor(s) === formFactor(ff)))
        return [ok(this.id, this.slots, `${ff} motherboard fits the cabinet.`)];
      return [bad(this.id, this.slots,
        `${dispName(mb.name)} is ${ff}, but this cabinet supports ${supported.join(", ")} boards.`,
        `Choose a cabinet that supports ${ff} motherboards.`)];
    },
  },

  // ── PSU ────────────────────────────────────────────────────────────
  {
    id: "psu-wattage",
    title: "Power supply wattage",
    description: "PSU wattage must exceed the estimated load, ideally with headroom.",
    slots: ["psu"],
    check({ items, power }) {
      const psu = part(items, "psu");
      const w = num(psu, "wattage");
      if (!psu || w == null || power.estimatedW === 0) return [];
      if (w < power.estimatedW)
        return [bad(this.id, this.slots,
          `Your ${w}W power supply can't run this build — it needs about ${power.estimatedW}W under load.`,
          `Choose a ${power.recommendedW}W or higher PSU.`)];
      if (w < power.recommendedW)
        return [warn(this.id, this.slots,
          `Your ${w}W PSU will run this build, but with little headroom. We recommend ${power.recommendedW}W+.`,
          `Choose a ${power.recommendedW}W PSU for quieter, more reliable operation and future upgrades.`)];
      const pct = Math.round(((w - power.estimatedW) / w) * 100);
      return [ok(this.id, this.slots, `${w}W leaves ${pct}% headroom over the estimated ${power.estimatedW}W load.`)];
    },
  },
  {
    id: "psu-gpu-connectors",
    title: "PSU has the GPU power connectors",
    description: "GPUs need a number of 8-pin PCIe or a 16-pin 12VHPWR connector.",
    slots: ["psu", "gpu"],
    check({ items }) {
      const psu = part(items, "psu"), gpu = part(items, "gpu");
      if (!psu || !gpu) return [];
      const need8 = num(gpu, "pcie8pin") ?? 0;
      const has8 = num(psu, "pcie8pin") ?? 0;
      if (bool(gpu, "uses12vhpwr")) {
        if (bool(psu, "has12vhpwr"))
          return [ok(this.id, this.slots, "Native 16-pin (12VHPWR) cable for your graphics card.")];
        if (has8 >= 3)
          return [warn(this.id, this.slots,
            `${dispName(gpu.name)} uses a 16-pin (12VHPWR) connector. This PSU will need the adapter included with the card.`,
            "An ATX 3.0 PSU with a native 16-pin cable is tidier and recommended.")];
        return [bad(this.id, this.slots,
          `${dispName(gpu.name)} needs a 16-pin connector (or 3× 8-pin via adapter), but this PSU has ${has8}× 8-pin PCIe.`,
          "Choose an ATX 3.0 PSU with a 16-pin cable.")];
      }
      if (need8 > has8)
        return [bad(this.id, this.slots,
          `${dispName(gpu.name)} needs ${need8}× 8-pin PCIe power connectors, but this PSU has ${has8}.`,
          "Choose a PSU with more PCIe connectors.")];
      return [ok(this.id, this.slots, `${need8}× 8-pin PCIe power available.`)];
    },
  },
  {
    id: "psu-case-formfactor",
    title: "PSU size fits cabinet",
    description: "ATX power supplies do not fit SFX-only cabinets.",
    slots: ["psu", "case"],
    check({ items }) {
      const psu = part(items, "psu"), cs = part(items, "case");
      const pf = str(psu, "psuFormFactor"), supported = list(cs, "psuFormFactor");
      if (!psu || !cs || !pf || supported.length === 0) return [];
      if (includesId(supported, pf)) return [ok(this.id, this.slots, `${pf} power supply fits.`)];
      if (norm(pf) === "sfx" && includesId(supported, "ATX"))
        return [warn(this.id, this.slots,
          "This SFX power supply needs an SFX-to-ATX bracket to mount in this cabinet.",
          "We include the bracket when we assemble — or choose an ATX PSU.")];
      return [bad(this.id, this.slots,
        `This cabinet only fits ${supported.join("/")} power supplies, but you've chosen an ${pf} unit.`,
        `Choose an ${supported[0]} PSU.`)];
    },
  },

  // ── Storage ────────────────────────────────────────────────────────
  {
    id: "storage-m2-slots",
    title: "Enough M.2 slots",
    description: "Each NVMe drive needs its own M.2 slot.",
    slots: ["ssd", "motherboard"],
    check({ items }) {
      const ssd = part(items, "ssd"), mb = part(items, "motherboard");
      if (!ssd || !mb || norm(str(ssd, "interface")) !== "nvme") return [];
      const n = qty(items, "ssd"), slots = num(mb, "m2Slots");
      if (slots == null) return [];
      if (n <= slots) return [ok(this.id, this.slots, `${n} of ${slots} M.2 slots used.`)];
      return [bad(this.id, this.slots,
        `You've chosen ${n} NVMe drives, but ${dispName(mb.name)} has ${slots} M.2 slot${slots === 1 ? "" : "s"}.`,
        "Reduce the quantity or choose a larger-capacity drive.")];
    },
  },
  {
    id: "storage-pcie-gen",
    title: "SSD PCIe generation",
    description: "PCIe Gen5 SSDs run at Gen4 speed on boards without a Gen5 M.2 slot.",
    slots: ["ssd", "motherboard"],
    check({ items }) {
      const ssd = part(items, "ssd"), mb = part(items, "motherboard");
      const gen = num(ssd, "pcieGen");
      if (!ssd || !mb || gen == null || gen < 5) return [];
      if ((num(mb, "m2Gen5Slots") ?? 0) > 0) return [ok(this.id, this.slots, "Gen5 M.2 slot available for full SSD speed.")];
      return [note(this.id, this.slots,
        "Your PCIe Gen5 SSD will work, but at Gen4 speeds on this motherboard.",
        "A Gen4 SSD would give the same real-world speed for less money.")];
    },
  },
  {
    id: "storage-sata-ports",
    title: "Enough SATA ports",
    description: "SATA SSDs and hard drives each need a SATA port.",
    slots: ["hdd", "motherboard"],
    check({ items }) {
      const mb = part(items, "motherboard");
      if (!mb) return [];
      const ports = num(mb, "sataPorts");
      const ssd = part(items, "ssd");
      const sata = qty(items, "hdd") + (ssd && norm(str(ssd, "interface")) === "sata" ? qty(items, "ssd") : 0);
      if (ports == null || sata === 0) return [];
      if (sata <= ports) return [ok(this.id, this.slots, `${sata} of ${ports} SATA ports used.`)];
      return [bad(this.id, this.slots,
        `You've chosen ${sata} SATA drives, but the motherboard has ${ports} SATA ports.`,
        "Reduce the number of drives.")];
    },
  },

  // ── Extras ─────────────────────────────────────────────────────────
  {
    id: "case-fan-slots",
    title: "Fan mounting positions",
    description: "Extra fans need free mounting positions in the cabinet.",
    slots: ["fans", "case"],
    check({ items }) {
      const fans = part(items, "fans"), cs = part(items, "case");
      if (!fans || !cs) return [];
      const count = (num(fans, "pack") ?? 1) * qty(items, "fans") + (num(cs, "includedFans") ?? 0);
      const slots = num(cs, "fanSlots");
      if (slots == null) return [];
      if (count <= slots) return [ok(this.id, this.slots, `${count} of ${slots} fan positions used.`)];
      return [warn(this.id, this.slots,
        `That's ${count} fans in total (including the cabinet's own), but it has ${slots} fan positions.`,
        "Reduce the number of fan packs.")];
    },
  },
  {
    id: "wifi-onboard",
    title: "Wireless connectivity",
    description: "Explains whether a Wi-Fi card is needed.",
    slots: ["wifi", "motherboard"],
    check({ items }) {
      const mb = part(items, "motherboard");
      if (!mb) return [];
      const onboard = bool(mb, "wifi");
      if (onboard && part(items, "wifi"))
        return [note(this.id, ["wifi"], "Your motherboard already has Wi-Fi and Bluetooth built in, so the adapter is optional.")];
      if (onboard === false && !part(items, "wifi"))
        return [note(this.id, ["wifi"], "This motherboard has no built-in Wi-Fi. Use Ethernet or add a Wi-Fi card.")];
      return [];
    },
  },
  {
    id: "ups-capacity",
    title: "UPS capacity",
    description: "A UPS should cover the PC's estimated load plus a monitor.",
    slots: ["ups"],
    defaultParams: { monitorW: 35 },
    check(ctx) {
      const ups = part(ctx.items, "ups");
      const w = num(ups, "watts");
      if (!ups || w == null || ctx.power.estimatedW === 0) return [];
      const need = ctx.power.estimatedW + (part(ctx.items, "monitor") ? p(ctx, "monitorW", 35) : 0);
      if (w >= need) return [ok(this.id, this.slots, `${w}W UPS covers the estimated ${need}W load.`)];
      return [warn(this.id, this.slots,
        `This UPS is rated for ${w}W, but your PC and monitor can draw about ${need}W under load. It may shut down during heavy gaming or rendering.`,
        "Choose a higher-capacity UPS.")];
    },
  },
  {
    id: "monitor-gpu-resolution",
    title: "Monitor resolution vs graphics card",
    description: "Advises when a high-resolution monitor is paired with an entry-level GPU.",
    slots: ["monitor", "gpu"],
    defaultParams: { tierFor1440: 5, tierFor4k: 7 },
    check(ctx) {
      const mon = part(ctx.items, "monitor"), gpu = part(ctx.items, "gpu");
      const res = str(mon, "resolution"), tier = num(gpu, "performanceTier");
      if (!mon || !gpu || !res || tier == null) return [];
      const width = Number(res.split("x")[0]);
      const needed = width >= 3840 ? p(ctx, "tierFor4k", 7) : width >= 2560 ? p(ctx, "tierFor1440", 5) : 0;
      if (tier >= needed) return [ok(this.id, this.slots, "Graphics card is well matched to the monitor resolution.")];
      return [note(this.id, this.slots,
        `A ${res} monitor with ${dispName(gpu.name)} works well for desktop use, but you'll likely lower game settings or resolution in demanding titles.`,
        "Consider a stronger graphics card for high-resolution gaming.")];
    },
  },
];

export const RULES_BY_ID = Object.fromEntries(RULES.map((r) => [r.id, r]));

/** Short phrases explaining why options were hidden, e.g. "8 hidden: different CPU socket". */
export const RULE_REASON: Record<string, string> = {
  "cpu-motherboard-socket": "different CPU socket",
  "cpu-motherboard-generation": "chipset doesn't support your CPU",
  "ram-motherboard-type": "different memory type (DDR4/DDR5)",
  "ram-cpu-type": "memory type not supported by your CPU",
  "ram-motherboard-capacity": "too many sticks or too much memory for the board",
  "gpu-case-length": "graphics card too long for the cabinet",
  "gpu-case-slots": "graphics card too thick for the cabinet",
  "cooler-cpu-socket": "no mounting for your CPU socket",
  "cooler-case-height": "cooler too tall for the cabinet",
  "cooler-case-radiator": "radiator size not supported by the cabinet",
  "motherboard-case-formfactor": "board size doesn't fit the cabinet",
  "psu-wattage": "not enough wattage",
  "psu-gpu-connectors": "missing GPU power connectors",
  "psu-case-formfactor": "PSU size doesn't fit the cabinet",
  "storage-m2-slots": "not enough M.2 slots",
  "storage-sata-ports": "not enough SATA ports",
};
