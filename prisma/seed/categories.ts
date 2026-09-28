// Category tree and structured specification schemas.
// Spec keys are what the compatibility engine reads (see docs/ARCHITECTURE.md §3).

export type SpecTypeName = "NUMBER" | "TEXT" | "BOOLEAN" | "LIST";

export interface SpecDef {
  key: string;
  label: string;
  type: SpecTypeName;
  unit?: string;
  isKey?: boolean;
  filterable?: boolean;
  required?: boolean;
  group?: string;
  options?: string;
}

export interface CategorySeed {
  slug: string;
  name: string;
  shortName?: string;
  group: string;
  builderSlot?: string;
  description: string;
  specs: SpecDef[];
}

const S = (key: string, label: string, type: SpecTypeName, o: Partial<SpecDef> = {}): SpecDef => ({ key, label, type, ...o });

const tier = S("performanceTier", "Performance tier (1–10)", "NUMBER", {
  group: "Store data",
  filterable: true,
});

export const CATEGORIES: CategorySeed[] = [
  // ── Components ──
  {
    slug: "processors", name: "Processors", shortName: "CPUs", group: "Components", builderSlot: "cpu",
    description: "AMD Ryzen and Intel Core desktop processors for gaming, creation and workstations.",
    specs: [
      S("socket", "Socket", "TEXT", { isKey: true, filterable: true, required: true, options: "AM4,AM5,LGA1700,LGA1851" }),
      S("generation", "Generation", "TEXT", { filterable: true, required: true, options: "Ryzen 5000,Ryzen 7000,Ryzen 8000,Ryzen 9000,Intel 12th Gen,Intel 13th Gen,Intel 14th Gen,Core Ultra 200S" }),
      S("cores", "Cores", "NUMBER", { isKey: true, filterable: true }),
      S("threads", "Threads", "NUMBER", { isKey: true }),
      S("baseClock", "Base clock", "NUMBER", { unit: "GHz" }),
      S("boostClock", "Boost clock", "NUMBER", { unit: "GHz", isKey: true }),
      S("l3Cache", "L3 cache", "NUMBER", { unit: "MB" }),
      S("tdp", "TDP", "NUMBER", { unit: "W", filterable: true, group: "Power" }),
      S("maxPower", "Max turbo power", "NUMBER", { unit: "W", group: "Power" }),
      S("integratedGpu", "Integrated graphics", "BOOLEAN", { filterable: true }),
      S("includesCooler", "Cooler in box", "BOOLEAN"),
      S("memoryTypes", "Memory support", "LIST", { options: "DDR4,DDR5" }),
      tier,
    ],
  },
  {
    slug: "motherboards", name: "Motherboards", group: "Components", builderSlot: "motherboard",
    description: "AM4, AM5 and Intel LGA1700/1851 motherboards in ATX, Micro-ATX and Mini-ITX.",
    specs: [
      S("socket", "Socket", "TEXT", { isKey: true, filterable: true, required: true, options: "AM4,AM5,LGA1700,LGA1851" }),
      S("chipset", "Chipset", "TEXT", { isKey: true, filterable: true }),
      S("formFactor", "Form factor", "TEXT", { isKey: true, filterable: true, required: true, options: "ATX,Micro-ATX,Mini-ITX,E-ATX" }),
      S("ramType", "Memory type", "TEXT", { isKey: true, filterable: true, required: true, options: "DDR4,DDR5" }),
      S("ramSlots", "Memory slots", "NUMBER"),
      S("maxRam", "Max memory", "NUMBER", { unit: "GB" }),
      S("maxRamSpeed", "Max memory speed", "NUMBER", { unit: "MT/s" }),
      S("m2Slots", "M.2 slots", "NUMBER", { group: "Storage & expansion" }),
      S("m2Gen5Slots", "PCIe 5.0 M.2 slots", "NUMBER", { group: "Storage & expansion" }),
      S("sataPorts", "SATA ports", "NUMBER", { group: "Storage & expansion" }),
      S("pcieSlots", "PCIe x16 slots", "NUMBER", { group: "Storage & expansion" }),
      S("wifi", "Wi-Fi built in", "BOOLEAN", { filterable: true, group: "Connectivity" }),
      S("supportedGenerations", "Supported CPU generations", "LIST", { group: "Compatibility" }),
      S("biosUpdateGenerations", "Supported after BIOS update", "LIST", { group: "Compatibility" }),
    ],
  },
  {
    slug: "cpu-coolers", name: "CPU Coolers", group: "Components", builderSlot: "cooler",
    description: "Tower air coolers and all-in-one liquid coolers.",
    specs: [
      S("coolerType", "Type", "TEXT", { isKey: true, filterable: true, required: true, options: "Air,AIO" }),
      S("sockets", "Socket support", "LIST", { required: true }),
      S("tdpRating", "Rated TDP", "NUMBER", { unit: "W", isKey: true }),
      S("height", "Height", "NUMBER", { unit: "mm", isKey: true }),
      S("radiatorSize", "Radiator size", "NUMBER", { unit: "mm", isKey: true, filterable: true }),
      S("fanSize", "Fan size", "NUMBER", { unit: "mm" }),
      S("rgb", "ARGB lighting", "BOOLEAN", { filterable: true }),
    ],
  },
  {
    slug: "ram", name: "RAM", shortName: "Memory", group: "Components", builderSlot: "ram",
    description: "DDR4 and DDR5 desktop memory kits.",
    specs: [
      S("ramType", "Type", "TEXT", { isKey: true, filterable: true, required: true, options: "DDR4,DDR5" }),
      S("capacity", "Kit capacity", "NUMBER", { unit: "GB", isKey: true, filterable: true, required: true }),
      S("modules", "Modules", "NUMBER", { required: true }),
      S("speed", "Speed", "NUMBER", { unit: "MT/s", isKey: true, filterable: true }),
      S("casLatency", "CAS latency", "NUMBER"),
      S("rgb", "RGB", "BOOLEAN", { filterable: true }),
    ],
  },
  {
    slug: "graphics-cards", name: "Graphics Cards", shortName: "GPUs", group: "Components", builderSlot: "gpu",
    description: "NVIDIA GeForce RTX and AMD Radeon graphics cards.",
    specs: [
      S("chipset", "GPU", "TEXT", { isKey: true, filterable: true }),
      S("gpuBrand", "GPU brand", "TEXT", { filterable: true, options: "NVIDIA,AMD,Intel" }),
      S("vram", "Video memory", "NUMBER", { unit: "GB", isKey: true, filterable: true }),
      S("length", "Card length", "NUMBER", { unit: "mm", isKey: true, required: true, group: "Dimensions" }),
      S("slots", "Thickness", "NUMBER", { unit: "slots", group: "Dimensions" }),
      S("tgp", "Board power", "NUMBER", { unit: "W", filterable: true, group: "Power" }),
      S("recommendedPsu", "Recommended PSU", "NUMBER", { unit: "W", group: "Power" }),
      S("pcie8pin", "8-pin PCIe connectors", "NUMBER", { group: "Power" }),
      S("uses12vhpwr", "16-pin 12VHPWR", "BOOLEAN", { group: "Power" }),
      tier,
    ],
  },
  {
    slug: "ssd", name: "SSD", shortName: "SSDs", group: "Components", builderSlot: "ssd",
    description: "NVMe M.2 and SATA solid state drives.",
    specs: [
      S("capacity", "Capacity", "NUMBER", { unit: "GB", isKey: true, filterable: true, required: true }),
      S("interface", "Interface", "TEXT", { isKey: true, filterable: true, required: true, options: "NVMe,SATA" }),
      S("pcieGen", "PCIe generation", "NUMBER", { filterable: true }),
      S("formFactor", "Form factor", "TEXT", { options: "M.2 2280,2.5-inch" }),
      S("readSpeed", "Sequential read", "NUMBER", { unit: "MB/s", isKey: true }),
      S("writeSpeed", "Sequential write", "NUMBER", { unit: "MB/s" }),
    ],
  },
  {
    slug: "hdd", name: "HDD", shortName: "Hard Drives", group: "Components", builderSlot: "hdd",
    description: "3.5-inch internal hard drives for bulk storage.",
    specs: [
      S("capacity", "Capacity", "NUMBER", { unit: "GB", isKey: true, filterable: true }),
      S("interface", "Interface", "TEXT", { options: "SATA" }),
      S("rpm", "Spindle speed", "NUMBER", { unit: "RPM", isKey: true }),
      S("cache", "Cache", "NUMBER", { unit: "MB" }),
    ],
  },
  {
    slug: "power-supplies", name: "Power Supplies", shortName: "PSUs", group: "Components", builderSlot: "psu",
    description: "80 PLUS certified ATX and SFX power supplies.",
    specs: [
      S("wattage", "Wattage", "NUMBER", { unit: "W", isKey: true, filterable: true, required: true }),
      S("efficiency", "80 PLUS rating", "TEXT", { isKey: true, filterable: true, options: "Bronze,Gold,Platinum,Titanium" }),
      S("psuFormFactor", "Form factor", "TEXT", { filterable: true, options: "ATX,SFX" }),
      S("modular", "Modular", "TEXT", { isKey: true, options: "Non-modular,Semi-modular,Fully modular" }),
      S("pcie8pin", "8-pin PCIe connectors", "NUMBER", { group: "Connectors" }),
      S("has12vhpwr", "Native 16-pin 12VHPWR", "BOOLEAN", { group: "Connectors" }),
      S("atx3", "ATX 3.x", "BOOLEAN", { filterable: true }),
    ],
  },
  {
    slug: "cabinets", name: "Cabinets", shortName: "Cases", group: "Components", builderSlot: "case",
    description: "Mid-tower, full-tower and compact PC cabinets.",
    specs: [
      S("caseSize", "Size", "TEXT", { isKey: true, filterable: true, options: "Mini tower,Mid tower,Full tower" }),
      S("formFactors", "Motherboard support", "LIST", { isKey: true, required: true }),
      S("maxGpuLength", "Max GPU length", "NUMBER", { unit: "mm", isKey: true, required: true, group: "Clearance" }),
      S("maxGpuSlots", "Max GPU thickness", "NUMBER", { unit: "slots", group: "Clearance" }),
      S("maxCoolerHeight", "Max CPU cooler height", "NUMBER", { unit: "mm", group: "Clearance" }),
      S("radiatorSupport", "Radiator support", "LIST", { unit: "mm", group: "Clearance" }),
      S("psuFormFactor", "PSU support", "LIST", { group: "Clearance" }),
      S("fanSlots", "Fan positions", "NUMBER", { group: "Cooling" }),
      S("includedFans", "Fans included", "NUMBER", { group: "Cooling" }),
      S("glass", "Tempered glass", "BOOLEAN", { filterable: true }),
      S("colour", "Colour", "TEXT", { filterable: true, options: "Black,White" }),
    ],
  },
  {
    slug: "case-fans", name: "Case Fans", group: "Components", builderSlot: "fans",
    description: "120mm and 140mm case fans, single and multi-packs.",
    specs: [
      S("fanSize", "Size", "NUMBER", { unit: "mm", isKey: true, filterable: true }),
      S("pack", "Fans in pack", "NUMBER", { isKey: true }),
      S("rgb", "ARGB", "BOOLEAN", { filterable: true }),
      S("maxRpm", "Max speed", "NUMBER", { unit: "RPM" }),
    ],
  },
  // ── Computers ──
  {
    slug: "laptops", name: "Laptops", group: "Computers",
    description: "Everyday, business and creator laptops from Asus, Dell, HP, Lenovo and Acer.",
    specs: laptopSpecs(),
  },
  {
    slug: "gaming-laptops", name: "Gaming Laptops", group: "Computers",
    description: "RTX-powered gaming laptops with high-refresh displays.",
    specs: laptopSpecs(),
  },
  {
    slug: "desktop-pcs", name: "Desktop PCs", group: "Computers",
    description: "Branded towers and all-in-one PCs for home and office.",
    specs: [
      S("processor", "Processor", "TEXT", { isKey: true }),
      S("memory", "Memory", "NUMBER", { unit: "GB", isKey: true, filterable: true }),
      S("storage", "Storage", "TEXT", { isKey: true }),
      S("graphics", "Graphics", "TEXT"),
      S("formType", "Type", "TEXT", { filterable: true, options: "Tower,All-in-One,Mini PC" }),
      S("os", "Operating system", "TEXT"),
    ],
  },
  {
    slug: "custom-pcs", name: "Custom PCs", group: "Computers",
    description: "Ready-to-ship custom PCs assembled and tested in Shillong.",
    specs: [
      S("processor", "Processor", "TEXT", { isKey: true }),
      S("graphics", "Graphics", "TEXT", { isKey: true }),
      S("memory", "Memory", "NUMBER", { unit: "GB", isKey: true }),
      S("storage", "Storage", "TEXT", { isKey: true }),
    ],
  },
  {
    slug: "tablets", name: "Tablets", group: "Computers",
    description: "Android tablets and iPads for study and entertainment.",
    specs: [
      S("display", "Display", "NUMBER", { unit: "in", isKey: true }),
      S("memory", "Memory", "NUMBER", { unit: "GB", isKey: true }),
      S("storage", "Storage", "NUMBER", { unit: "GB", isKey: true }),
      S("connectivity", "Connectivity", "TEXT", { options: "Wi-Fi,Wi-Fi + 5G" }),
    ],
  },
  // ── Peripherals ──
  {
    slug: "monitors", name: "Monitors", group: "Peripherals", builderSlot: "monitor",
    description: "Gaming, office and colour-accurate monitors.",
    specs: [
      S("size", "Screen size", "NUMBER", { unit: "in", isKey: true, filterable: true }),
      S("resolution", "Resolution", "TEXT", { isKey: true, filterable: true, options: "1920x1080,2560x1440,3440x1440,3840x2160" }),
      S("refreshRate", "Refresh rate", "NUMBER", { unit: "Hz", isKey: true, filterable: true }),
      S("panel", "Panel", "TEXT", { filterable: true, options: "IPS,VA,OLED,TN" }),
      S("responseTime", "Response time", "NUMBER", { unit: "ms" }),
      S("adaptiveSync", "Adaptive sync", "TEXT"),
    ],
  },
  {
    slug: "keyboards", name: "Keyboards", group: "Peripherals", builderSlot: "keyboard",
    description: "Mechanical, membrane, wired and wireless keyboards.",
    specs: [
      S("switchType", "Switches", "TEXT", { isKey: true, filterable: true }),
      S("layout", "Layout", "TEXT", { isKey: true, options: "Full size,TKL,75%,65%" }),
      S("connectivity", "Connectivity", "TEXT", { isKey: true, filterable: true, options: "Wired,Wireless,Tri-mode" }),
      S("rgb", "RGB", "BOOLEAN"),
    ],
  },
  {
    slug: "mouse", name: "Mouse", shortName: "Mice", group: "Peripherals", builderSlot: "mouse",
    description: "Gaming and productivity mice.",
    specs: [
      S("dpi", "Max DPI", "NUMBER", { isKey: true }),
      S("weight", "Weight", "NUMBER", { unit: "g", isKey: true }),
      S("connectivity", "Connectivity", "TEXT", { isKey: true, filterable: true, options: "Wired,Wireless" }),
    ],
  },
  {
    slug: "headsets", name: "Headsets", group: "Peripherals", builderSlot: "headset",
    description: "Gaming and office headsets.",
    specs: [
      S("connectivity", "Connectivity", "TEXT", { isKey: true, filterable: true }),
      S("driver", "Driver size", "NUMBER", { unit: "mm", isKey: true }),
      S("surround", "Virtual surround", "BOOLEAN"),
    ],
  },
  {
    slug: "speakers", name: "Speakers", group: "Peripherals", builderSlot: "speakers",
    description: "Desktop speakers and soundbars.",
    specs: [
      S("channels", "Channels", "TEXT", { isKey: true }),
      S("power", "Output power", "NUMBER", { unit: "W", isKey: true }),
      S("connectivity", "Connectivity", "TEXT", { isKey: true }),
    ],
  },
  {
    slug: "printers", name: "Printers", group: "Office",
    description: "Ink tank, laser, inkjet and receipt printers from Brother, Canon, Epson and HP.",
    specs: [
      S("printType", "Type", "TEXT", { isKey: true, filterable: true, options: "Ink Tank,Laser,Inkjet,Receipt,LED" }),
      S("functions", "Functions", "TEXT", { isKey: true, options: "Print,Print/Scan/Copy" }),
      S("colour", "Colour printing", "BOOLEAN", { filterable: true }),
      S("connectivity", "Connectivity", "TEXT", { isKey: true }),
      S("ppm", "Print speed", "NUMBER", { unit: "ppm" }),
    ],
  },
  {
    slug: "networking", name: "Networking", group: "Networking & Security", builderSlot: "wifi",
    description: "Wi-Fi routers, switches, adapters and PCIe Wi-Fi cards.",
    specs: [
      S("deviceType", "Device", "TEXT", { isKey: true, filterable: true, options: "Router,Switch,PCIe Wi-Fi card,USB adapter,Access point" }),
      S("standard", "Standard", "TEXT", { isKey: true, filterable: true }),
      S("ports", "Ports", "TEXT"),
      S("bluetooth", "Bluetooth", "TEXT"),
    ],
  },
  {
    slug: "cctv", name: "CCTV", shortName: "Security", group: "Networking & Security",
    description: "IP and HD cameras, DVRs and NVRs for homes and businesses.",
    specs: [
      S("deviceType", "Device", "TEXT", { isKey: true, filterable: true, options: "Dome camera,Bullet camera,DVR,NVR,Wi-Fi camera" }),
      S("resolution", "Resolution", "TEXT", { isKey: true }),
      S("channels", "Channels", "NUMBER"),
      S("nightVision", "Night vision", "TEXT"),
    ],
  },
  {
    slug: "accessories", name: "Accessories", group: "Peripherals", builderSlot: "accessories",
    description: "Cables, thermal paste, mouse pads, storage and power accessories.",
    specs: [S("type", "Type", "TEXT", { isKey: true, filterable: true }), S("detail", "Detail", "TEXT", { isKey: true })],
  },
  {
    slug: "ups", name: "UPS", group: "Power & Software", builderSlot: "ups",
    description: "Line-interactive and online UPS for PCs and offices.",
    specs: [
      S("va", "Capacity", "NUMBER", { unit: "VA", isKey: true, filterable: true }),
      S("watts", "Output", "NUMBER", { unit: "W", isKey: true }),
      S("upsType", "Type", "TEXT", { options: "Line interactive,Online" }),
      S("outlets", "Outlets", "NUMBER"),
    ],
  },
  {
    slug: "software", name: "Software", group: "Power & Software", builderSlot: "os",
    description: "Genuine Windows, Office and antivirus licences.",
    specs: [
      S("licence", "Licence", "TEXT", { isKey: true }),
      S("users", "Users / devices", "NUMBER", { isKey: true }),
      S("validity", "Validity", "TEXT"),
    ],
  },
];

function laptopSpecs(): SpecDef[] {
  return [
    S("processor", "Processor", "TEXT", { isKey: true, filterable: true }),
    S("memory", "Memory", "NUMBER", { unit: "GB", isKey: true, filterable: true }),
    S("storage", "Storage", "NUMBER", { unit: "GB", isKey: true, filterable: true }),
    S("graphics", "Graphics", "TEXT", { isKey: true, filterable: true }),
    S("display", "Display", "TEXT", { isKey: true }),
    S("refreshRate", "Refresh rate", "NUMBER", { unit: "Hz" }),
    S("weight", "Weight", "NUMBER", { unit: "kg" }),
    S("os", "Operating system", "TEXT"),
  ];
}
