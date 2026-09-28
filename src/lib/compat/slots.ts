import type { Slot } from "./types";

export interface SlotMeta {
  slot: Slot;
  label: string;
  short: string;
  /** Category slug(s) whose products fill this slot. */
  categories: string[];
  core: boolean;
  /** Customer may buy more than one (RAM kits, fans, drives…). */
  multiQty: boolean;
  maxQty: number;
  hint: string;
  emptyTitle: string;
  emptyBody: string;
  group: "Core components" | "Storage & cooling" | "Peripherals" | "Extras";
}

export const SLOT_META: Record<Slot, SlotMeta> = {
  cpu: {
    slot: "cpu", label: "Processor", short: "CPU", categories: ["processors"], core: true,
    multiQty: false, maxQty: 1, group: "Core components",
    hint: "The brain of your PC. It decides which motherboards and memory you can use.",
    emptyTitle: "No processor selected yet.",
    emptyBody: "Start with a CPU — every other part is matched to it.",
  },
  motherboard: {
    slot: "motherboard", label: "Motherboard", short: "Motherboard", categories: ["motherboards"], core: true,
    multiQty: false, maxQty: 1, group: "Core components",
    hint: "Connects everything. Must match your CPU socket and memory type.",
    emptyTitle: "No motherboard selected yet.",
    emptyBody: "We only show boards that fit your processor.",
  },
  cooler: {
    slot: "cooler", label: "CPU Cooler", short: "Cooler", categories: ["cpu-coolers"], core: true,
    multiQty: false, maxQty: 1, group: "Core components",
    hint: "Keeps the processor cool and quiet. Some CPUs ship with a cooler in the box.",
    emptyTitle: "No CPU cooler selected yet.",
    emptyBody: "Pick an air cooler or liquid AIO rated for your CPU.",
  },
  ram: {
    slot: "ram", label: "Memory (RAM)", short: "RAM", categories: ["ram"], core: true,
    multiQty: true, maxQty: 2, group: "Core components",
    hint: "16GB is fine for everyday use, 32GB is the sweet spot for gaming and creation.",
    emptyTitle: "No memory selected yet.",
    emptyBody: "Choose a kit that matches your motherboard's DDR type.",
  },
  gpu: {
    slot: "gpu", label: "Graphics Card", short: "GPU", categories: ["graphics-cards"], core: true,
    multiQty: false, maxQty: 1, group: "Core components",
    hint: "The biggest factor for gaming and 3D performance.",
    emptyTitle: "No graphics card selected yet.",
    emptyBody: "Choose a GPU to continue building your PC.",
  },
  ssd: {
    slot: "ssd", label: "SSD / NVMe", short: "SSD", categories: ["ssd"], core: true,
    multiQty: true, maxQty: 4, group: "Core components",
    hint: "Your system drive. NVMe makes Windows and games load fast.",
    emptyTitle: "No SSD selected yet.",
    emptyBody: "Every build needs a fast drive for the operating system.",
  },
  psu: {
    slot: "psu", label: "Power Supply", short: "PSU", categories: ["power-supplies"], core: true,
    multiQty: false, maxQty: 1, group: "Core components",
    hint: "Powers every part. We calculate the wattage you need automatically.",
    emptyTitle: "No power supply selected yet.",
    emptyBody: "We'll recommend a wattage once you've picked your CPU and GPU.",
  },
  case: {
    slot: "case", label: "Cabinet", short: "Cabinet", categories: ["cabinets"], core: true,
    multiQty: false, maxQty: 1, group: "Core components",
    hint: "Must fit your motherboard size, graphics card length and cooler height.",
    emptyTitle: "No cabinet selected yet.",
    emptyBody: "We check GPU length, cooler height and board size for you.",
  },
  hdd: {
    slot: "hdd", label: "Hard Drive", short: "HDD", categories: ["hdd"], core: false,
    multiQty: true, maxQty: 4, group: "Storage & cooling",
    hint: "Cheap bulk storage for media, backups and archives.",
    emptyTitle: "No hard drive added.", emptyBody: "Optional — add one for bulk storage.",
  },
  fans: {
    slot: "fans", label: "Case Fans", short: "Fans", categories: ["case-fans"], core: false,
    multiQty: true, maxQty: 4, group: "Storage & cooling",
    hint: "Extra airflow for hot GPUs and quieter operation.",
    emptyTitle: "No extra fans added.", emptyBody: "Optional — most cabinets include some fans.",
  },
  monitor: {
    slot: "monitor", label: "Monitor", short: "Monitor", categories: ["monitors"], core: false,
    multiQty: true, maxQty: 3, group: "Peripherals",
    hint: "Match refresh rate and resolution to your graphics card.",
    emptyTitle: "No monitor added.", emptyBody: "Optional — skip if you already own one.",
  },
  keyboard: {
    slot: "keyboard", label: "Keyboard", short: "Keyboard", categories: ["keyboards"], core: false,
    multiQty: false, maxQty: 1, group: "Peripherals",
    hint: "Mechanical, membrane, wired or wireless.",
    emptyTitle: "No keyboard added.", emptyBody: "Optional.",
  },
  mouse: {
    slot: "mouse", label: "Mouse", short: "Mouse", categories: ["mouse"], core: false,
    multiQty: false, maxQty: 1, group: "Peripherals",
    hint: "Lightweight for gaming, ergonomic for work.",
    emptyTitle: "No mouse added.", emptyBody: "Optional.",
  },
  headset: {
    slot: "headset", label: "Headset", short: "Headset", categories: ["headsets"], core: false,
    multiQty: false, maxQty: 1, group: "Peripherals",
    hint: "For gaming, calls and late-night sessions.",
    emptyTitle: "No headset added.", emptyBody: "Optional.",
  },
  speakers: {
    slot: "speakers", label: "Speakers", short: "Speakers", categories: ["speakers"], core: false,
    multiQty: false, maxQty: 1, group: "Peripherals",
    hint: "Desktop speakers and soundbars.",
    emptyTitle: "No speakers added.", emptyBody: "Optional.",
  },
  wifi: {
    slot: "wifi", label: "Wi-Fi / Bluetooth", short: "Wi-Fi", categories: ["networking"], core: false,
    multiQty: false, maxQty: 1, group: "Extras",
    hint: "Only needed if your motherboard has no built-in Wi-Fi.",
    emptyTitle: "No Wi-Fi adapter added.", emptyBody: "Optional — skip if you'll use Ethernet.",
  },
  os: {
    slot: "os", label: "Operating System", short: "OS", categories: ["software"], core: false,
    multiQty: false, maxQty: 1, group: "Extras",
    hint: "Genuine Windows installed and activated by our technicians.",
    emptyTitle: "No operating system added.", emptyBody: "Optional — skip if you have a licence.",
  },
  ups: {
    slot: "ups", label: "UPS / Power Backup", short: "UPS", categories: ["ups"], core: false,
    multiQty: false, maxQty: 1, group: "Extras",
    hint: "Protects your PC from power cuts and voltage fluctuations.",
    emptyTitle: "No UPS added.", emptyBody: "Strongly recommended for areas with frequent power cuts.",
  },
  accessories: {
    slot: "accessories", label: "Other Accessories", short: "Accessories", categories: ["accessories"], core: false,
    multiQty: true, maxQty: 5, group: "Extras",
    hint: "Cables, thermal paste, mouse pads and more.",
    emptyTitle: "No accessories added.", emptyBody: "Optional.",
  },
};

/** Builder step order. */
export const STEP_ORDER: Slot[] = [
  "cpu", "motherboard", "cooler", "ram", "gpu", "ssd", "hdd", "psu", "case", "fans",
  "monitor", "keyboard", "mouse", "headset", "speakers", "wifi", "os", "ups", "accessories",
];

export const CORE_SLOTS: Slot[] = STEP_ORDER.filter((s) => SLOT_META[s].core);

export function slotForCategory(categorySlug: string): Slot | null {
  for (const s of STEP_ORDER) if (SLOT_META[s].categories.includes(categorySlug)) return s;
  return null;
}
