// Sample catalogue. Prices are indicative INR street prices (GST inclusive) and are
// meant to be edited in Admin → Products. Every product carries structured specs.

export interface ProductSeed {
  sku: string;
  category: string;
  brand: string;
  name: string;
  model?: string;
  price: number;
  mrp: number;
  stock: number;
  warranty: string;
  specs: Record<string, number | string | boolean | string[]>;
  shortDesc?: string;
  featured?: boolean;
  deal?: boolean;
  popularity?: number;
  rating?: number;
  released?: string; // yyyy-mm
}

type Row = [sku: string, brand: string, name: string, price: number, mrp: number, stock: number, specs: ProductSeed["specs"], extra?: Partial<ProductSeed>];

const make = (category: string, warranty: string, rows: Row[]): ProductSeed[] =>
  rows.map(([sku, brand, name, price, mrp, stock, specs, extra]) => ({
    sku, category, brand, name, price, mrp, stock, specs, warranty, ...extra,
  }));

const AMD_AM5 = ["Ryzen 7000", "Ryzen 8000", "Ryzen 9000"];
const INTEL_LGA1700 = ["Intel 12th Gen", "Intel 13th Gen", "Intel 14th Gen"];
const ALL_SOCKETS = ["AM4", "AM5", "LGA1700", "LGA1851"];

export const PRODUCTS: ProductSeed[] = [
  // ───────────────────────── Processors ─────────────────────────
  ...make("processors", "3 years manufacturer warranty", [
    ["CPU-R5-5600", "AMD", "AMD Ryzen 5 5600", 9499, 14999, 22,
      { socket: "AM4", generation: "Ryzen 5000", cores: 6, threads: 12, baseClock: 3.5, boostClock: 4.4, l3Cache: 32, tdp: 65, maxPower: 88, integratedGpu: false, includesCooler: true, memoryTypes: ["DDR4"], performanceTier: 4 },
      { popularity: 92, rating: 4.7, released: "2022-04", deal: true, shortDesc: "The value king for budget gaming builds, with a Wraith Stealth cooler in the box." }],
    ["CPU-R7-5700X", "AMD", "AMD Ryzen 7 5700X", 14499, 22999, 9,
      { socket: "AM4", generation: "Ryzen 5000", cores: 8, threads: 16, baseClock: 3.4, boostClock: 4.6, l3Cache: 32, tdp: 65, maxPower: 88, integratedGpu: false, includesCooler: false, memoryTypes: ["DDR4"], performanceTier: 5 },
      { popularity: 60, rating: 4.6, released: "2022-04" }],
    ["CPU-R5-5600GT", "AMD", "AMD Ryzen 5 5600GT", 11499, 15999, 14,
      { socket: "AM4", generation: "Ryzen 5000", cores: 6, threads: 12, baseClock: 3.6, boostClock: 4.6, l3Cache: 16, tdp: 65, maxPower: 88, integratedGpu: true, includesCooler: true, memoryTypes: ["DDR4"], performanceTier: 3 },
      { popularity: 52, rating: 4.4, released: "2024-01", shortDesc: "Integrated Radeon graphics and a cooler in the box — ideal for office and study PCs." }],
    ["CPU-R5-8600G", "AMD", "AMD Ryzen 5 8600G", 18999, 23999, 12,
      { socket: "AM5", generation: "Ryzen 8000", cores: 6, threads: 12, baseClock: 4.3, boostClock: 5.0, l3Cache: 16, tdp: 65, maxPower: 88, integratedGpu: true, includesCooler: true, memoryTypes: ["DDR5"], performanceTier: 4 },
      { popularity: 55, rating: 4.5, released: "2024-01", shortDesc: "Radeon 760M graphics built in — a capable PC without a graphics card." }],
    ["CPU-R7-8700G", "AMD", "AMD Ryzen 7 8700G", 26999, 32999, 7,
      { socket: "AM5", generation: "Ryzen 8000", cores: 8, threads: 16, baseClock: 4.2, boostClock: 5.1, l3Cache: 16, tdp: 65, maxPower: 88, integratedGpu: true, includesCooler: true, memoryTypes: ["DDR5"], performanceTier: 5 },
      { popularity: 48, rating: 4.6, released: "2024-01" }],
    ["CPU-R5-7600", "AMD", "AMD Ryzen 5 7600", 17999, 24999, 18,
      { socket: "AM5", generation: "Ryzen 7000", cores: 6, threads: 12, baseClock: 3.8, boostClock: 5.1, l3Cache: 32, tdp: 65, maxPower: 88, integratedGpu: true, includesCooler: true, memoryTypes: ["DDR5"], performanceTier: 5 },
      { popularity: 88, rating: 4.7, released: "2023-01" }],
    ["CPU-R5-9600X", "AMD", "AMD Ryzen 5 9600X", 22999, 29999, 14,
      { socket: "AM5", generation: "Ryzen 9000", cores: 6, threads: 12, baseClock: 3.9, boostClock: 5.4, l3Cache: 32, tdp: 65, maxPower: 88, integratedGpu: true, includesCooler: false, memoryTypes: ["DDR5"], performanceTier: 6 },
      { popularity: 70, rating: 4.6, released: "2024-08" }],
    ["CPU-R7-7800X3D", "AMD", "AMD Ryzen 7 7800X3D", 34999, 44999, 6,
      { socket: "AM5", generation: "Ryzen 7000", cores: 8, threads: 16, baseClock: 4.2, boostClock: 5.0, l3Cache: 96, tdp: 120, maxPower: 162, integratedGpu: true, includesCooler: false, memoryTypes: ["DDR5"], performanceTier: 9 },
      { popularity: 95, rating: 4.9, released: "2023-04", featured: true, shortDesc: "3D V-Cache makes it one of the fastest gaming CPUs you can buy." }],
    ["CPU-R7-9700X", "AMD", "AMD Ryzen 7 9700X", 29999, 37999, 8,
      { socket: "AM5", generation: "Ryzen 9000", cores: 8, threads: 16, baseClock: 3.8, boostClock: 5.5, l3Cache: 32, tdp: 65, maxPower: 88, integratedGpu: true, includesCooler: false, memoryTypes: ["DDR5"], performanceTier: 7 },
      { popularity: 58, rating: 4.6, released: "2024-08" }],
    ["CPU-R7-9800X3D", "AMD", "AMD Ryzen 7 9800X3D", 46999, 55999, 4,
      { socket: "AM5", generation: "Ryzen 9000", cores: 8, threads: 16, baseClock: 4.7, boostClock: 5.2, l3Cache: 96, tdp: 120, maxPower: 162, integratedGpu: true, includesCooler: false, memoryTypes: ["DDR5"], performanceTier: 10 },
      { popularity: 90, rating: 4.9, released: "2024-11", featured: true }],
    ["CPU-R9-9950X", "AMD", "AMD Ryzen 9 9950X", 56999, 69999, 3,
      { socket: "AM5", generation: "Ryzen 9000", cores: 16, threads: 32, baseClock: 4.3, boostClock: 5.7, l3Cache: 64, tdp: 170, maxPower: 230, integratedGpu: true, includesCooler: false, memoryTypes: ["DDR5"], performanceTier: 10 },
      { popularity: 40, rating: 4.8, released: "2024-08", shortDesc: "16 cores for rendering, compiling and AI workloads." }],
    ["CPU-I3-12100F", "Intel", "Intel Core i3-12100F", 6999, 10999, 20,
      { socket: "LGA1700", generation: "Intel 12th Gen", cores: 4, threads: 8, baseClock: 3.3, boostClock: 4.3, l3Cache: 12, tdp: 58, maxPower: 89, integratedGpu: false, includesCooler: true, memoryTypes: ["DDR4", "DDR5"], performanceTier: 2 },
      { popularity: 50, rating: 4.5, released: "2022-01" }],
    ["CPU-I5-12400F", "Intel", "Intel Core i5-12400F", 10499, 16999, 25,
      { socket: "LGA1700", generation: "Intel 12th Gen", cores: 6, threads: 12, baseClock: 2.5, boostClock: 4.4, l3Cache: 18, tdp: 65, maxPower: 117, integratedGpu: false, includesCooler: true, memoryTypes: ["DDR4", "DDR5"], performanceTier: 4 },
      { popularity: 85, rating: 4.7, released: "2022-01", deal: true }],
    ["CPU-I5-14400F", "Intel", "Intel Core i5-14400F", 17499, 24999, 15,
      { socket: "LGA1700", generation: "Intel 14th Gen", cores: 10, threads: 16, baseClock: 2.5, boostClock: 4.7, l3Cache: 20, tdp: 65, maxPower: 148, integratedGpu: false, includesCooler: true, memoryTypes: ["DDR4", "DDR5"], performanceTier: 5 },
      { popularity: 75, rating: 4.6, released: "2024-01" }],
    ["CPU-I7-14700K", "Intel", "Intel Core i7-14700K", 36999, 45999, 5,
      { socket: "LGA1700", generation: "Intel 14th Gen", cores: 20, threads: 28, baseClock: 3.4, boostClock: 5.6, l3Cache: 33, tdp: 125, maxPower: 253, integratedGpu: true, includesCooler: false, memoryTypes: ["DDR4", "DDR5"], performanceTier: 8 },
      { popularity: 62, rating: 4.6, released: "2023-10" }],
    ["CPU-U5-245K", "Intel", "Intel Core Ultra 5 245K", 26999, 33999, 8,
      { socket: "LGA1851", generation: "Core Ultra 200S", cores: 14, threads: 14, baseClock: 4.2, boostClock: 5.2, l3Cache: 24, tdp: 125, maxPower: 159, integratedGpu: true, includesCooler: false, memoryTypes: ["DDR5"], performanceTier: 6 },
      { popularity: 35, rating: 4.4, released: "2024-10" }],
    ["CPU-U7-265K", "Intel", "Intel Core Ultra 7 265K", 36499, 44999, 6,
      { socket: "LGA1851", generation: "Core Ultra 200S", cores: 20, threads: 20, baseClock: 3.9, boostClock: 5.5, l3Cache: 30, tdp: 125, maxPower: 250, integratedGpu: true, includesCooler: false, memoryTypes: ["DDR5"], performanceTier: 8 },
      { popularity: 42, rating: 4.5, released: "2024-10" }],
    ["CPU-U9-285K", "Intel", "Intel Core Ultra 9 285K", 54999, 64999, 3,
      { socket: "LGA1851", generation: "Core Ultra 200S", cores: 24, threads: 24, baseClock: 3.7, boostClock: 5.7, l3Cache: 36, tdp: 125, maxPower: 250, integratedGpu: true, includesCooler: false, memoryTypes: ["DDR5"], performanceTier: 9 },
      { popularity: 30, rating: 4.5, released: "2024-10" }],
  ]),

  // ───────────────────────── Motherboards ─────────────────────────
  ...make("motherboards", "3 years manufacturer warranty", [
    ["MB-GB-B450M-DS3H", "Gigabyte", "Gigabyte B450M DS3H V2", 6499, 8999, 10,
      { socket: "AM4", chipset: "B450", formFactor: "Micro-ATX", ramType: "DDR4", ramSlots: 4, maxRam: 128, maxRamSpeed: 3600, m2Slots: 1, m2Gen5Slots: 0, sataPorts: 4, pcieSlots: 1, wifi: false, supportedGenerations: ["Ryzen 3000"], biosUpdateGenerations: ["Ryzen 5000"] },
      { popularity: 60, rating: 4.3, released: "2021-06" }],
    ["MB-MSI-B550M-PRO-VDH", "MSI", "MSI B550M PRO-VDH WIFI", 10499, 13999, 12,
      { socket: "AM4", chipset: "B550", formFactor: "Micro-ATX", ramType: "DDR4", ramSlots: 4, maxRam: 128, maxRamSpeed: 4400, m2Slots: 2, m2Gen5Slots: 0, sataPorts: 4, pcieSlots: 1, wifi: true, supportedGenerations: ["Ryzen 3000", "Ryzen 5000"] },
      { popularity: 78, rating: 4.5, released: "2020-08" }],
    ["MB-MSI-B650M-A", "MSI", "MSI PRO B650M-A WIFI", 15999, 19999, 9,
      { socket: "AM5", chipset: "B650", formFactor: "Micro-ATX", ramType: "DDR5", ramSlots: 4, maxRam: 192, maxRamSpeed: 6000, m2Slots: 2, m2Gen5Slots: 0, sataPorts: 4, pcieSlots: 1, wifi: true, supportedGenerations: ["Ryzen 7000", "Ryzen 8000"], biosUpdateGenerations: ["Ryzen 9000"] },
      { popularity: 70, rating: 4.5, released: "2023-01" }],
    ["MB-ASUS-TUF-B650-PLUS", "ASUS", "ASUS TUF Gaming B650-PLUS WIFI", 19999, 24999, 11,
      { socket: "AM5", chipset: "B650", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, maxRam: 192, maxRamSpeed: 6400, m2Slots: 3, m2Gen5Slots: 1, sataPorts: 4, pcieSlots: 2, wifi: true, supportedGenerations: AMD_AM5 },
      { popularity: 84, rating: 4.7, released: "2023-06", featured: true }],
    ["MB-GB-B650I-ULTRA", "Gigabyte", "Gigabyte B650I AORUS ULTRA", 24999, 29999, 3,
      { socket: "AM5", chipset: "B650", formFactor: "Mini-ITX", ramType: "DDR5", ramSlots: 2, maxRam: 96, maxRamSpeed: 6400, m2Slots: 3, m2Gen5Slots: 1, sataPorts: 2, pcieSlots: 1, wifi: true, supportedGenerations: AMD_AM5 },
      { popularity: 25, rating: 4.6, released: "2023-09" }],
    ["MB-MSI-B850-TOMAHAWK", "MSI", "MSI MAG B850 TOMAHAWK MAX WIFI", 24999, 30999, 7,
      { socket: "AM5", chipset: "B850", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, maxRam: 256, maxRamSpeed: 8000, m2Slots: 4, m2Gen5Slots: 1, sataPorts: 4, pcieSlots: 2, wifi: true, supportedGenerations: AMD_AM5 },
      { popularity: 66, rating: 4.7, released: "2025-01" }],
    ["MB-ASUS-X870E-E", "ASUS", "ASUS ROG STRIX X870E-E GAMING WIFI", 49999, 57999, 2,
      { socket: "AM5", chipset: "X870E", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, maxRam: 256, maxRamSpeed: 8000, m2Slots: 5, m2Gen5Slots: 3, sataPorts: 4, pcieSlots: 2, wifi: true, supportedGenerations: AMD_AM5 },
      { popularity: 38, rating: 4.8, released: "2024-10" }],
    ["MB-GB-H610M-S2H", "Gigabyte", "Gigabyte H610M S2H DDR4", 6999, 9499, 16,
      { socket: "LGA1700", chipset: "H610", formFactor: "Micro-ATX", ramType: "DDR4", ramSlots: 2, maxRam: 64, maxRamSpeed: 3200, m2Slots: 1, m2Gen5Slots: 0, sataPorts: 4, pcieSlots: 1, wifi: false, supportedGenerations: ["Intel 12th Gen"], biosUpdateGenerations: ["Intel 13th Gen", "Intel 14th Gen"] },
      { popularity: 64, rating: 4.2, released: "2022-02" }],
    ["MB-MSI-B760M-E-D4", "MSI", "MSI PRO B760M-E DDR4", 8999, 11999, 14,
      { socket: "LGA1700", chipset: "B760", formFactor: "Micro-ATX", ramType: "DDR4", ramSlots: 2, maxRam: 64, maxRamSpeed: 4800, m2Slots: 1, m2Gen5Slots: 0, sataPorts: 4, pcieSlots: 1, wifi: false, supportedGenerations: INTEL_LGA1700 },
      { popularity: 72, rating: 4.4, released: "2023-01" }],
    ["MB-ASUS-B760M-A", "ASUS", "ASUS PRIME B760M-A WIFI", 15499, 18999, 8,
      { socket: "LGA1700", chipset: "B760", formFactor: "Micro-ATX", ramType: "DDR5", ramSlots: 4, maxRam: 192, maxRamSpeed: 7200, m2Slots: 2, m2Gen5Slots: 0, sataPorts: 4, pcieSlots: 1, wifi: true, supportedGenerations: INTEL_LGA1700 },
      { popularity: 58, rating: 4.5, released: "2023-01" }],
    ["MB-MSI-Z790-TOMAHAWK", "MSI", "MSI MAG Z790 TOMAHAWK WIFI", 27999, 34999, 4,
      { socket: "LGA1700", chipset: "Z790", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, maxRam: 192, maxRamSpeed: 7200, m2Slots: 4, m2Gen5Slots: 0, sataPorts: 7, pcieSlots: 2, wifi: true, supportedGenerations: INTEL_LGA1700 },
      { popularity: 45, rating: 4.7, released: "2022-10" }],
    ["MB-MSI-B860M-A", "MSI", "MSI PRO B860M-A WIFI", 17499, 21999, 6,
      { socket: "LGA1851", chipset: "B860", formFactor: "Micro-ATX", ramType: "DDR5", ramSlots: 4, maxRam: 256, maxRamSpeed: 6400, m2Slots: 2, m2Gen5Slots: 0, sataPorts: 4, pcieSlots: 1, wifi: true, supportedGenerations: ["Core Ultra 200S"] },
      { popularity: 30, rating: 4.4, released: "2025-01" }],
    ["MB-ASUS-Z890-P", "ASUS", "ASUS PRIME Z890-P WIFI", 27999, 32999, 4,
      { socket: "LGA1851", chipset: "Z890", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, maxRam: 256, maxRamSpeed: 8000, m2Slots: 4, m2Gen5Slots: 1, sataPorts: 4, pcieSlots: 2, wifi: true, supportedGenerations: ["Core Ultra 200S"] },
      { popularity: 28, rating: 4.5, released: "2024-10" }],
  ]),

  // ───────────────────────── CPU coolers ─────────────────────────
  ...make("cpu-coolers", "2 years manufacturer warranty", [
    ["CL-CM-212-V3", "Cooler Master", "Cooler Master Hyper 212 Spectrum V3", 2299, 2999, 20,
      { coolerType: "Air", sockets: ALL_SOCKETS, tdpRating: 180, height: 154, fanSize: 120, rgb: true }, { popularity: 60, rating: 4.4 }],
    ["CL-DC-AK400", "Deepcool", "Deepcool AK400", 2799, 3499, 25,
      { coolerType: "Air", sockets: ALL_SOCKETS, tdpRating: 220, height: 155, fanSize: 120, rgb: false }, { popularity: 85, rating: 4.7, deal: true }],
    ["CL-TR-PA120SE", "Thermalright", "Thermalright Peerless Assassin 120 SE", 3499, 4499, 15,
      { coolerType: "Air", sockets: ALL_SOCKETS, tdpRating: 245, height: 155, fanSize: 120, rgb: false }, { popularity: 80, rating: 4.8 }],
    ["CL-NOC-L12S", "Noctua", "Noctua NH-L12S Low-Profile", 6499, 7499, 4,
      { coolerType: "Air", sockets: ALL_SOCKETS, tdpRating: 120, height: 70, fanSize: 120, rgb: false }, { popularity: 18, rating: 4.7, warranty: "6 years manufacturer warranty" }],
    ["CL-DC-AK620D", "Deepcool", "Deepcool AK620 Digital", 6499, 7999, 8,
      { coolerType: "Air", sockets: ALL_SOCKETS, tdpRating: 260, height: 162, fanSize: 120, rgb: true }, { popularity: 50, rating: 4.7 }],
    ["CL-NOC-D15G2", "Noctua", "Noctua NH-D15 G2", 13999, 15999, 3,
      { coolerType: "Air", sockets: ALL_SOCKETS, tdpRating: 250, height: 168, fanSize: 140, rgb: false }, { popularity: 35, rating: 4.9, warranty: "6 years manufacturer warranty" }],
    ["CL-ARC-LF3-240", "Arctic", "Arctic Liquid Freezer III 240", 7999, 9999, 10,
      { coolerType: "AIO", sockets: ALL_SOCKETS, tdpRating: 280, radiatorSize: 240, fanSize: 120, rgb: false }, { popularity: 55, rating: 4.7, warranty: "6 years manufacturer warranty" }],
    ["CL-LL-GAL2-360", "Lian Li", "Lian Li Galahad II Trinity 360", 14499, 17999, 5,
      { coolerType: "AIO", sockets: ALL_SOCKETS, tdpRating: 300, radiatorSize: 360, fanSize: 120, rgb: true }, { popularity: 48, rating: 4.7, warranty: "5 years manufacturer warranty" }],
    ["CL-NZXT-K360", "NZXT", "NZXT Kraken 360 RGB", 17999, 21999, 3,
      { coolerType: "AIO", sockets: ALL_SOCKETS, tdpRating: 300, radiatorSize: 360, fanSize: 120, rgb: true }, { popularity: 30, rating: 4.6, warranty: "6 years manufacturer warranty" }],
  ]),

  // ───────────────────────── RAM ─────────────────────────
  ...make("ram", "Limited lifetime warranty", [
    ["RAM-COR-LPX-16-D4", "Corsair", "Corsair Vengeance LPX 16GB (2×8GB) DDR4-3200", 3299, 4499, 30,
      { ramType: "DDR4", capacity: 16, modules: 2, speed: 3200, casLatency: 16, rgb: false }, { popularity: 80, rating: 4.7 }],
    ["RAM-GS-RV-32-D4", "G.Skill", "G.Skill Ripjaws V 32GB (2×16GB) DDR4-3600", 6299, 7999, 15,
      { ramType: "DDR4", capacity: 32, modules: 2, speed: 3600, casLatency: 18, rgb: false }, { popularity: 60, rating: 4.7 }],
    ["RAM-KF-BEAST-16-D5", "Kingston", "Kingston FURY Beast 16GB (2×8GB) DDR5-5600", 4999, 6499, 20,
      { ramType: "DDR5", capacity: 16, modules: 2, speed: 5600, casLatency: 36, rgb: false }, { popularity: 65, rating: 4.6 }],
    ["RAM-XPG-LANCER-32-D5", "XPG", "XPG Lancer RGB 32GB (2×16GB) DDR5-6000 CL30", 9499, 12999, 18,
      { ramType: "DDR5", capacity: 32, modules: 2, speed: 6000, casLatency: 30, rgb: true }, { popularity: 82, rating: 4.7, deal: true }],
    ["RAM-COR-VRGB-32-D5", "Corsair", "Corsair Vengeance RGB 32GB (2×16GB) DDR5-6000 CL30", 10499, 13499, 12,
      { ramType: "DDR5", capacity: 32, modules: 2, speed: 6000, casLatency: 30, rgb: true }, { popularity: 76, rating: 4.8, featured: true }],
    ["RAM-KF-BEAST-64-D5", "Kingston", "Kingston FURY Beast 64GB (2×32GB) DDR5-5600", 16999, 21999, 8,
      { ramType: "DDR5", capacity: 64, modules: 2, speed: 5600, casLatency: 40, rgb: false }, { popularity: 40, rating: 4.6 }],
    ["RAM-GS-TZ5-64-D5", "G.Skill", "G.Skill Trident Z5 RGB 64GB (2×32GB) DDR5-6400", 21999, 26999, 5,
      { ramType: "DDR5", capacity: 64, modules: 2, speed: 6400, casLatency: 32, rgb: true }, { popularity: 32, rating: 4.8 }],
    ["RAM-COR-V-96-D5", "Corsair", "Corsair Vengeance 96GB (2×48GB) DDR5-6000", 28999, 34999, 4,
      { ramType: "DDR5", capacity: 96, modules: 2, speed: 6000, casLatency: 30, rgb: false }, { popularity: 20, rating: 4.7 }],
  ]),

  // ───────────────────────── Graphics cards ─────────────────────────
  ...make("graphics-cards", "3 years manufacturer warranty", [
    ["GPU-ZT-3050-6G", "ZOTAC", "ZOTAC GAMING GeForce RTX 3050 6GB Twin Edge", 17499, 22999, 14,
      { chipset: "RTX 3050", gpuBrand: "NVIDIA", vram: 6, length: 225, slots: 2, tgp: 70, recommendedPsu: 300, pcie8pin: 0, uses12vhpwr: false, performanceTier: 2 },
      { popularity: 55, rating: 4.3, released: "2024-02" }],
    ["GPU-SAP-7600-8G", "Sapphire", "Sapphire PULSE Radeon RX 7600 8GB", 25999, 31999, 9,
      { chipset: "RX 7600", gpuBrand: "AMD", vram: 8, length: 240, slots: 2, tgp: 165, recommendedPsu: 550, pcie8pin: 1, uses12vhpwr: false, performanceTier: 4 },
      { popularity: 50, rating: 4.5, released: "2023-05" }],
    ["GPU-MSI-4060-8G", "MSI", "MSI GeForce RTX 4060 VENTUS 2X Black 8GB", 28999, 34999, 16,
      { chipset: "RTX 4060", gpuBrand: "NVIDIA", vram: 8, length: 199, slots: 2, tgp: 115, recommendedPsu: 550, pcie8pin: 1, uses12vhpwr: false, performanceTier: 4 },
      { popularity: 88, rating: 4.6, released: "2023-06" }],
    ["GPU-ASUS-5060-8G", "ASUS", "ASUS Dual GeForce RTX 5060 OC 8GB", 31999, 36999, 12,
      { chipset: "RTX 5060", gpuBrand: "NVIDIA", vram: 8, length: 227, slots: 2.5, tgp: 145, recommendedPsu: 550, pcie8pin: 1, uses12vhpwr: false, performanceTier: 5 },
      { popularity: 80, rating: 4.6, released: "2025-05", featured: true }],
    ["GPU-SAP-9060XT-16G", "Sapphire", "Sapphire PULSE Radeon RX 9060 XT 16GB", 39999, 45999, 8,
      { chipset: "RX 9060 XT", gpuBrand: "AMD", vram: 16, length: 240, slots: 2, tgp: 160, recommendedPsu: 550, pcie8pin: 1, uses12vhpwr: false, performanceTier: 6 },
      { popularity: 62, rating: 4.6, released: "2025-06" }],
    ["GPU-GB-5060TI-16G", "Gigabyte", "Gigabyte GeForce RTX 5060 Ti WINDFORCE OC 16GB", 47999, 54999, 7,
      { chipset: "RTX 5060 Ti", gpuBrand: "NVIDIA", vram: 16, length: 281, slots: 2, tgp: 180, recommendedPsu: 650, pcie8pin: 1, uses12vhpwr: false, performanceTier: 6 },
      { popularity: 70, rating: 4.6, released: "2025-04" }],
    ["GPU-ZT-4070-12G", "ZOTAC", "ZOTAC GAMING GeForce RTX 4070 Twin Edge OC 12GB", 54999, 64999, 5,
      { chipset: "RTX 4070", gpuBrand: "NVIDIA", vram: 12, length: 234, slots: 2.2, tgp: 200, recommendedPsu: 650, pcie8pin: 0, uses12vhpwr: true, performanceTier: 7 },
      { popularity: 78, rating: 4.7, released: "2023-04" }],
    ["GPU-MSI-5070-12G", "MSI", "MSI GeForce RTX 5070 12G VENTUS 2X OC", 58999, 66999, 10,
      { chipset: "RTX 5070", gpuBrand: "NVIDIA", vram: 12, length: 242, slots: 2, tgp: 250, recommendedPsu: 650, pcie8pin: 0, uses12vhpwr: true, performanceTier: 7 },
      { popularity: 86, rating: 4.7, released: "2025-03", featured: true, deal: true }],
    ["GPU-PC-9070XT-16G", "PowerColor", "PowerColor Hellhound Radeon RX 9070 XT 16GB", 69999, 79999, 6,
      { chipset: "RX 9070 XT", gpuBrand: "AMD", vram: 16, length: 322, slots: 3, tgp: 304, recommendedPsu: 750, pcie8pin: 2, uses12vhpwr: false, performanceTier: 8 },
      { popularity: 74, rating: 4.8, released: "2025-03" }],
    ["GPU-ASUS-5070TI-16G", "ASUS", "ASUS TUF Gaming GeForce RTX 5070 Ti OC 16GB", 92999, 1_04_999, 4,
      { chipset: "RTX 5070 Ti", gpuBrand: "NVIDIA", vram: 16, length: 329, slots: 3.2, tgp: 300, recommendedPsu: 750, pcie8pin: 0, uses12vhpwr: true, performanceTier: 8 },
      { popularity: 64, rating: 4.8, released: "2025-02" }],
    ["GPU-GB-5080-16G", "Gigabyte", "Gigabyte GeForce RTX 5080 GAMING OC 16GB", 1_29_999, 1_44_999, 3,
      { chipset: "RTX 5080", gpuBrand: "NVIDIA", vram: 16, length: 340, slots: 3.3, tgp: 360, recommendedPsu: 850, pcie8pin: 0, uses12vhpwr: true, performanceTier: 9 },
      { popularity: 52, rating: 4.8, released: "2025-01" }],
    ["GPU-ASUS-5090-32G", "ASUS", "ASUS ROG Astral GeForce RTX 5090 OC 32GB", 3_39_999, 3_69_999, 1,
      { chipset: "RTX 5090", gpuBrand: "NVIDIA", vram: 32, length: 358, slots: 3.8, tgp: 575, recommendedPsu: 1000, pcie8pin: 0, uses12vhpwr: true, performanceTier: 10 },
      { popularity: 45, rating: 4.9, released: "2025-01", shortDesc: "The fastest consumer graphics card available, with 32GB for AI and 8K workflows." }],
  ]),

  // ───────────────────────── SSDs ─────────────────────────
  ...make("ssd", "5 years manufacturer warranty", [
    ["SSD-CR-P3P-500", "Crucial", "Crucial P3 Plus 500GB PCIe 4.0 NVMe", 3299, 4499, 30,
      { capacity: 500, interface: "NVMe", pcieGen: 4, formFactor: "M.2 2280", readSpeed: 4700, writeSpeed: 1900 }, { popularity: 60, rating: 4.4 }],
    ["SSD-SS-870-500", "Samsung", "Samsung 870 EVO 500GB SATA SSD", 4299, 5999, 18,
      { capacity: 500, interface: "SATA", formFactor: "2.5-inch", readSpeed: 560, writeSpeed: 530 }, { popularity: 50, rating: 4.8 }],
    ["SSD-WD-SN580-1T", "Western Digital", "WD Blue SN580 1TB PCIe 4.0 NVMe", 5999, 7999, 35,
      { capacity: 1000, interface: "NVMe", pcieGen: 4, formFactor: "M.2 2280", readSpeed: 4150, writeSpeed: 4150 }, { popularity: 90, rating: 4.7, deal: true }],
    ["SSD-SS-990EP-1T", "Samsung", "Samsung 990 EVO Plus 1TB PCIe 4.0 NVMe", 7499, 9999, 20,
      { capacity: 1000, interface: "NVMe", pcieGen: 4, formFactor: "M.2 2280", readSpeed: 7150, writeSpeed: 6300 }, { popularity: 86, rating: 4.8, featured: true }],
    ["SSD-KS-NV3-2T", "Kingston", "Kingston NV3 2TB PCIe 4.0 NVMe", 10999, 14999, 14,
      { capacity: 2000, interface: "NVMe", pcieGen: 4, formFactor: "M.2 2280", readSpeed: 6000, writeSpeed: 5000 }, { popularity: 70, rating: 4.5, warranty: "3 years manufacturer warranty" }],
    ["SSD-SS-990P-2T", "Samsung", "Samsung 990 PRO 2TB PCIe 4.0 NVMe", 15999, 19999, 9,
      { capacity: 2000, interface: "NVMe", pcieGen: 4, formFactor: "M.2 2280", readSpeed: 7450, writeSpeed: 6900 }, { popularity: 66, rating: 4.9 }],
    ["SSD-CR-T705-2T", "Crucial", "Crucial T705 2TB PCIe 5.0 NVMe", 24999, 29999, 4,
      { capacity: 2000, interface: "NVMe", pcieGen: 5, formFactor: "M.2 2280", readSpeed: 14500, writeSpeed: 12700 }, { popularity: 25, rating: 4.7 }],
    ["SSD-WD-SN850X-4T", "Western Digital", "WD Black SN850X 4TB PCIe 4.0 NVMe", 29999, 36999, 3,
      { capacity: 4000, interface: "NVMe", pcieGen: 4, formFactor: "M.2 2280", readSpeed: 7300, writeSpeed: 6600 }, { popularity: 30, rating: 4.8 }],
  ]),

  // ───────────────────────── HDD ─────────────────────────
  ...make("hdd", "2 years manufacturer warranty", [
    ["HDD-SG-BC-1T", "Seagate", "Seagate BarraCuda 1TB 7200 RPM", 3999, 4999, 20, { capacity: 1000, interface: "SATA", rpm: 7200, cache: 256 }, { popularity: 50, rating: 4.4 }],
    ["HDD-SG-BC-2T", "Seagate", "Seagate BarraCuda 2TB 7200 RPM", 5299, 6999, 16, { capacity: 2000, interface: "SATA", rpm: 7200, cache: 256 }, { popularity: 55, rating: 4.4 }],
    ["HDD-WD-BLUE-4T", "Western Digital", "WD Blue 4TB 5400 RPM", 8999, 11499, 8, { capacity: 4000, interface: "SATA", rpm: 5400, cache: 256 }, { popularity: 35, rating: 4.5 }],
    ["HDD-SG-IW-8T", "Seagate", "Seagate IronWolf 8TB NAS 7200 RPM", 19999, 24999, 3, { capacity: 8000, interface: "SATA", rpm: 7200, cache: 256 }, { popularity: 20, rating: 4.6, warranty: "3 years manufacturer warranty" }],
  ]),

  // ───────────────────────── PSUs ─────────────────────────
  ...make("power-supplies", "5 years manufacturer warranty", [
    ["PSU-DC-PK550D", "Deepcool", "Deepcool PK550D 550W 80+ Bronze", 3999, 4999, 20,
      { wattage: 550, efficiency: "Bronze", psuFormFactor: "ATX", modular: "Non-modular", pcie8pin: 2, has12vhpwr: false, atx3: false }, { popularity: 70, rating: 4.4 }],
    ["PSU-MSI-A650BN", "MSI", "MSI MAG A650BN 650W 80+ Bronze", 4799, 5999, 18,
      { wattage: 650, efficiency: "Bronze", psuFormFactor: "ATX", modular: "Non-modular", pcie8pin: 2, has12vhpwr: false, atx3: false }, { popularity: 75, rating: 4.4 }],
    ["PSU-COR-CX650", "Corsair", "Corsair CX650 650W 80+ Bronze", 5499, 6999, 14,
      { wattage: 650, efficiency: "Bronze", psuFormFactor: "ATX", modular: "Non-modular", pcie8pin: 2, has12vhpwr: false, atx3: false }, { popularity: 60, rating: 4.5 }],
    ["PSU-CM-MWE750G", "Cooler Master", "Cooler Master MWE Gold 750 V2 ATX 3.0", 8999, 11499, 12,
      { wattage: 750, efficiency: "Gold", psuFormFactor: "ATX", modular: "Fully modular", pcie8pin: 3, has12vhpwr: true, atx3: true }, { popularity: 72, rating: 4.6, deal: true }],
    ["PSU-COR-RM850E", "Corsair", "Corsair RM850e ATX 3.1 850W 80+ Gold", 12499, 14999, 9,
      { wattage: 850, efficiency: "Gold", psuFormFactor: "ATX", modular: "Fully modular", pcie8pin: 3, has12vhpwr: true, atx3: true }, { popularity: 80, rating: 4.8, featured: true, warranty: "7 years manufacturer warranty" }],
    ["PSU-CM-V850SFX", "Cooler Master", "Cooler Master V850 SFX Gold ATX 3.0", 15999, 18999, 3,
      { wattage: 850, efficiency: "Gold", psuFormFactor: "SFX", modular: "Fully modular", pcie8pin: 2, has12vhpwr: true, atx3: true }, { popularity: 20, rating: 4.7, warranty: "10 years manufacturer warranty" }],
    ["PSU-DC-PX1000G", "Deepcool", "Deepcool PX1000G 1000W 80+ Gold ATX 3.0", 17499, 20999, 5,
      { wattage: 1000, efficiency: "Gold", psuFormFactor: "ATX", modular: "Fully modular", pcie8pin: 4, has12vhpwr: true, atx3: true }, { popularity: 45, rating: 4.7, warranty: "10 years manufacturer warranty" }],
    ["PSU-COR-HX1500I", "Corsair", "Corsair HX1500i 1500W 80+ Platinum ATX 3.1", 36999, 42999, 2,
      { wattage: 1500, efficiency: "Platinum", psuFormFactor: "ATX", modular: "Fully modular", pcie8pin: 6, has12vhpwr: true, atx3: true }, { popularity: 15, rating: 4.9, warranty: "10 years manufacturer warranty" }],
  ]),

  // ───────────────────────── Cabinets ─────────────────────────
  ...make("cabinets", "1 year manufacturer warranty", [
    ["CASE-ANT-ICE112", "Ant Esports", "Ant Esports ICE-112 Mid Tower", 3499, 4999, 20,
      { caseSize: "Mid tower", formFactors: ["ATX", "Micro-ATX", "Mini-ITX"], maxGpuLength: 320, maxGpuSlots: 3, maxCoolerHeight: 160, radiatorSupport: ["240"], psuFormFactor: ["ATX"], fanSlots: 7, includedFans: 4, glass: true, colour: "Black" },
      { popularity: 78, rating: 4.3, deal: true }],
    ["CASE-CM-Q300L", "Cooler Master", "Cooler Master MasterBox Q300L", 4299, 5499, 10,
      { caseSize: "Mini tower", formFactors: ["Micro-ATX", "Mini-ITX"], maxGpuLength: 360, maxGpuSlots: 3, maxCoolerHeight: 159, radiatorSupport: ["120", "240"], psuFormFactor: ["ATX"], fanSlots: 4, includedFans: 1, glass: false, colour: "Black" },
      { popularity: 55, rating: 4.4 }],
    ["CASE-DC-CH560", "Deepcool", "Deepcool CH560 Digital", 7499, 8999, 12,
      { caseSize: "Mid tower", formFactors: ["E-ATX", "ATX", "Micro-ATX", "Mini-ITX"], maxGpuLength: 380, maxGpuSlots: 4, maxCoolerHeight: 175, radiatorSupport: ["240", "280", "360"], psuFormFactor: ["ATX"], fanSlots: 10, includedFans: 4, glass: true, colour: "Black" },
      { popularity: 70, rating: 4.7, featured: true }],
    ["CASE-COR-4000D", "Corsair", "Corsair 4000D Airflow", 8499, 9999, 9,
      { caseSize: "Mid tower", formFactors: ["ATX", "Micro-ATX", "Mini-ITX"], maxGpuLength: 360, maxGpuSlots: 3.5, maxCoolerHeight: 170, radiatorSupport: ["240", "280", "360"], psuFormFactor: ["ATX"], fanSlots: 6, includedFans: 2, glass: true, colour: "Black" },
      { popularity: 74, rating: 4.7 }],
    ["CASE-NZXT-H5F-W", "NZXT", "NZXT H5 Flow (2024) White", 8999, 10499, 7,
      { caseSize: "Mid tower", formFactors: ["ATX", "Micro-ATX", "Mini-ITX"], maxGpuLength: 365, maxGpuSlots: 3.5, maxCoolerHeight: 180, radiatorSupport: ["240", "280", "360"], psuFormFactor: ["ATX"], fanSlots: 7, includedFans: 2, glass: true, colour: "White" },
      { popularity: 60, rating: 4.6 }],
    ["CASE-MT-AIR903", "Montech", "Montech AIR 903 MAX", 8999, 10999, 6,
      { caseSize: "Mid tower", formFactors: ["E-ATX", "ATX", "Micro-ATX", "Mini-ITX"], maxGpuLength: 400, maxGpuSlots: 4, maxCoolerHeight: 180, radiatorSupport: ["240", "280", "360", "420"], psuFormFactor: ["ATX"], fanSlots: 10, includedFans: 4, glass: true, colour: "Black" },
      { popularity: 50, rating: 4.7 }],
    ["CASE-LL-O11EVO", "Lian Li", "Lian Li O11 Dynamic EVO", 15999, 18999, 4,
      { caseSize: "Mid tower", formFactors: ["E-ATX", "ATX", "Micro-ATX", "Mini-ITX"], maxGpuLength: 426, maxGpuSlots: 4, maxCoolerHeight: 167, radiatorSupport: ["240", "280", "360"], psuFormFactor: ["ATX"], fanSlots: 10, includedFans: 0, glass: true, colour: "Black" },
      { popularity: 58, rating: 4.8, featured: true }],
    ["CASE-FD-TERRA", "Fractal Design", "Fractal Design Terra Mini-ITX", 16999, 19999, 2,
      { caseSize: "Small form factor", formFactors: ["Mini-ITX"], maxGpuLength: 322, maxGpuSlots: 3, maxCoolerHeight: 77, radiatorSupport: [], psuFormFactor: ["SFX"], fanSlots: 1, includedFans: 0, glass: false, colour: "Black" },
      { popularity: 22, rating: 4.6 }],
  ]),

  // ───────────────────────── Case fans ─────────────────────────
  ...make("case-fans", "2 years manufacturer warranty", [
    ["FAN-ARC-P12-5", "Arctic", "Arctic P12 PWM PST (5-pack)", 2799, 3499, 15, { fanSize: 120, pack: 5, rgb: false, maxRpm: 1800 }, { popularity: 65, rating: 4.7 }],
    ["FAN-DC-FC120-3", "Deepcool", "Deepcool FC120 ARGB (3-pack)", 2499, 3299, 18, { fanSize: 120, pack: 3, rgb: true, maxRpm: 1800 }, { popularity: 70, rating: 4.5 }],
    ["FAN-LL-SLINF-3", "Lian Li", "Lian Li UNI FAN SL-INF 120 (3-pack)", 7999, 9499, 6, { fanSize: 120, pack: 3, rgb: true, maxRpm: 2100 }, { popularity: 40, rating: 4.7 }],
    ["FAN-NOC-A14", "Noctua", "Noctua NF-A14 PWM 140mm", 2599, 2999, 10, { fanSize: 140, pack: 1, rgb: false, maxRpm: 1500 }, { popularity: 30, rating: 4.9, warranty: "6 years manufacturer warranty" }],
  ]),

  // ───────────────────────── Monitors ─────────────────────────
  ...make("monitors", "3 years manufacturer warranty", [
    ["MON-DELL-E2225H", "Dell", "Dell E2225H 22\" Full HD Monitor", 7499, 9999, 20, { size: 21.5, resolution: "1920x1080", refreshRate: 75, panel: "VA", responseTime: 5, adaptiveSync: "—" }, { popularity: 50, rating: 4.4 }],
    ["MON-ACER-VG240YE", "Acer", "Acer Nitro VG240Y E 24\" FHD 180Hz", 8999, 13999, 22, { size: 23.8, resolution: "1920x1080", refreshRate: 180, panel: "IPS", responseTime: 1, adaptiveSync: "FreeSync" }, { popularity: 82, rating: 4.5, deal: true }],
    ["MON-LG-24GS60F", "LG", "LG UltraGear 24GS60F 24\" FHD 180Hz", 10499, 14999, 15, { size: 24, resolution: "1920x1080", refreshRate: 180, panel: "IPS", responseTime: 1, adaptiveSync: "G-SYNC Compatible" }, { popularity: 70, rating: 4.6 }],
    ["MON-MSI-275QF", "MSI", "MSI MAG 275QF 27\" QHD 180Hz", 16999, 21999, 12, { size: 27, resolution: "2560x1440", refreshRate: 180, panel: "Rapid IPS", responseTime: 0.5, adaptiveSync: "Adaptive-Sync" }, { popularity: 78, rating: 4.6, featured: true }],
    ["MON-ASUS-VG27AQ3A", "ASUS", "ASUS TUF Gaming VG27AQ3A 27\" QHD 180Hz", 18999, 24999, 9, { size: 27, resolution: "2560x1440", refreshRate: 180, panel: "IPS", responseTime: 1, adaptiveSync: "G-SYNC Compatible" }, { popularity: 72, rating: 4.7 }],
    ["MON-SS-G5-32", "Samsung", "Samsung Odyssey G5 32\" QHD 165Hz Curved", 24999, 32999, 6, { size: 32, resolution: "2560x1440", refreshRate: 165, panel: "VA", responseTime: 1, adaptiveSync: "FreeSync Premium" }, { popularity: 55, rating: 4.5 }],
    ["MON-DELL-S2722QC", "Dell", "Dell S2722QC 27\" 4K USB-C", 27999, 34999, 5, { size: 27, resolution: "3840x2160", refreshRate: 60, panel: "IPS", responseTime: 4, adaptiveSync: "FreeSync" }, { popularity: 40, rating: 4.6 }],
    ["MON-LG-27GR93U", "LG", "LG UltraGear 27GR93U 27\" 4K 144Hz", 44999, 54999, 4, { size: 27, resolution: "3840x2160", refreshRate: 144, panel: "IPS", responseTime: 1, adaptiveSync: "G-SYNC Compatible" }, { popularity: 38, rating: 4.7 }],
    ["MON-SS-OLEDG6", "Samsung", "Samsung Odyssey OLED G6 27\" QHD 360Hz", 74999, 89999, 2, { size: 27, resolution: "2560x1440", refreshRate: 360, panel: "OLED", responseTime: 0.03, adaptiveSync: "FreeSync Premium Pro" }, { popularity: 35, rating: 4.8 }],
  ]),

  // ───────────────────────── Keyboards / mice / audio ─────────────────────────
  ...make("keyboards", "1 year manufacturer warranty", [
    ["KB-LOGI-K120", "Logitech", "Logitech K120 USB Keyboard", 549, 695, 50, { switchType: "Membrane", layout: "Full size", connectivity: "Wired", rgb: false }, { popularity: 60, rating: 4.4 }],
    ["KB-ZEB-COMBO", "Zebion", "Zebion Wired Keyboard & Mouse Combo", 699, 999, 40, { switchType: "Membrane", layout: "Full size", connectivity: "Wired", rgb: false }, { popularity: 45, rating: 4.1 }],
    ["KB-RD-K552", "Redragon", "Redragon K552 Kumara Mechanical", 2299, 3499, 25, { switchType: "Outemu Red", layout: "TKL", connectivity: "Wired", rgb: true }, { popularity: 80, rating: 4.5 }],
    ["KB-KC-K2V2", "Keychron", "Keychron K2 V2 Wireless Mechanical", 7999, 9499, 8, { switchType: "Gateron Brown", layout: "75%", connectivity: "Tri-mode", rgb: true }, { popularity: 50, rating: 4.6 }],
    ["KB-RZ-BWV4X", "Razer", "Razer BlackWidow V4 X", 10999, 13999, 5, { switchType: "Razer Green", layout: "Full size", connectivity: "Wired", rgb: true }, { popularity: 35, rating: 4.6 }],
  ]),
  ...make("mouse", "2 years manufacturer warranty", [
    ["MS-LOGI-G102", "Logitech", "Logitech G102 LIGHTSYNC", 1395, 1995, 40, { dpi: 8000, weight: 85, connectivity: "Wired" }, { popularity: 90, rating: 4.6 }],
    ["MS-LOGI-G304", "Logitech", "Logitech G304 LIGHTSPEED Wireless", 2695, 3995, 22, { dpi: 12000, weight: 99, connectivity: "Wireless" }, { popularity: 75, rating: 4.6 }],
    ["MS-RZ-DAV3", "Razer", "Razer DeathAdder V3", 5999, 7499, 8, { dpi: 30000, weight: 59, connectivity: "Wired" }, { popularity: 45, rating: 4.7 }],
    ["MS-LOGI-MX3S", "Logitech", "Logitech MX Master 3S", 8995, 10995, 10, { dpi: 8000, weight: 141, connectivity: "Wireless" }, { popularity: 55, rating: 4.8 }],
  ]),
  ...make("headsets", "2 years manufacturer warranty", [
    ["HS-RZ-BSV2X", "Razer", "Razer BlackShark V2 X", 3999, 5999, 15, { connectivity: "3.5mm", driver: 50, surround: true }, { popularity: 70, rating: 4.5 }],
    ["HS-LOGI-G435", "Logitech", "Logitech G435 LIGHTSPEED Wireless", 5495, 7995, 12, { connectivity: "Wireless + Bluetooth", driver: 40, surround: false }, { popularity: 60, rating: 4.3 }],
    ["HS-HX-CLOUD3", "HyperX", "HyperX Cloud III", 7499, 9999, 8, { connectivity: "USB / 3.5mm", driver: 53, surround: true }, { popularity: 55, rating: 4.7 }],
  ]),
  ...make("speakers", "1 year manufacturer warranty", [
    ["SPK-CR-PEBV3", "Creative", "Creative Pebble V3", 2499, 3499, 18, { channels: "2.0", power: 16, connectivity: "USB-C / Bluetooth" }, { popularity: 60, rating: 4.4 }],
    ["SPK-LOGI-Z313", "Logitech", "Logitech Z313 2.1 Speaker System", 3295, 4495, 12, { channels: "2.1", power: 25, connectivity: "3.5mm" }, { popularity: 55, rating: 4.3 }],
    ["SPK-ED-R1280DB", "Edifier", "Edifier R1280DB Bookshelf Speakers", 10499, 12999, 5, { channels: "2.0", power: 42, connectivity: "Bluetooth / Optical / RCA" }, { popularity: 35, rating: 4.7 }],
  ]),

  // ───────────────────────── Networking / CCTV ─────────────────────────
  ...make("networking", "2 years manufacturer warranty", [
    ["NET-TPL-T3U", "TP-Link", "TP-Link Archer T3U Nano AC1300 USB Adapter", 999, 1499, 30, { deviceType: "USB adapter", standard: "Wi-Fi 5", ports: "USB", bluetooth: "—" }, { popularity: 50, rating: 4.2 }],
    ["NET-TPL-TX20E", "TP-Link", "TP-Link Archer TX20E AX1800 Wi-Fi 6 PCIe + Bluetooth 5.2", 3299, 4499, 15, { deviceType: "PCIe Wi-Fi card", standard: "Wi-Fi 6", ports: "PCIe x1", bluetooth: "5.2" }, { popularity: 60, rating: 4.5 }],
    ["NET-TPL-TXE72E", "TP-Link", "TP-Link Archer TXE72E AXE5400 Wi-Fi 6E PCIe + Bluetooth 5.3", 5499, 6999, 6, { deviceType: "PCIe Wi-Fi card", standard: "Wi-Fi 6E", ports: "PCIe x1", bluetooth: "5.3" }, { popularity: 30, rating: 4.5 }],
    ["NET-TPL-AX23", "TP-Link", "TP-Link Archer AX23 AX1800 Wi-Fi 6 Router", 4299, 5999, 20, { deviceType: "Router", standard: "Wi-Fi 6", ports: "4× Gigabit LAN", bluetooth: "—" }, { popularity: 75, rating: 4.4 }],
    ["NET-TPL-SG1008D", "TP-Link", "TP-Link TL-SG1008D 8-Port Gigabit Switch", 1399, 1999, 25, { deviceType: "Switch", standard: "Gigabit Ethernet", ports: "8× Gigabit", bluetooth: "—" }, { popularity: 55, rating: 4.6 }],
    ["NET-DL-DES1016C", "D-Link", "D-Link DES-1016C 16-Port Switch", 2999, 3999, 10, { deviceType: "Switch", standard: "Fast Ethernet", ports: "16× 10/100", bluetooth: "—" }, { popularity: 30, rating: 4.3 }],
  ]),
  ...make("cctv", "1 year manufacturer warranty", [
    ["CCTV-CP-DOME2", "CP PLUS", "CP PLUS 2.4MP Full HD Dome Camera", 1499, 2199, 40, { deviceType: "Dome camera", resolution: "1080p", nightVision: "20m IR" }, { popularity: 60, rating: 4.3 }],
    ["CCTV-HIK-BULLET2", "Hikvision", "Hikvision 2MP Bullet Camera", 1799, 2499, 30, { deviceType: "Bullet camera", resolution: "1080p", nightVision: "20m IR" }, { popularity: 55, rating: 4.4 }],
    ["CCTV-CP-DVR8", "CP PLUS", "CP PLUS 8-Channel HD DVR", 4999, 6999, 10, { deviceType: "DVR", resolution: "1080p", channels: 8 }, { popularity: 40, rating: 4.3 }],
    ["CCTV-HIK-NVR4", "Hikvision", "Hikvision 4-Channel PoE NVR", 5999, 7999, 8, { deviceType: "NVR", resolution: "4MP", channels: 4 }, { popularity: 35, rating: 4.4 }],
    ["CCTV-TAPO-C200", "TP-Link", "Tapo C200 Wi-Fi Pan/Tilt Home Camera", 1999, 2999, 25, { deviceType: "Wi-Fi camera", resolution: "1080p", nightVision: "9m IR" }, { popularity: 80, rating: 4.5 }],
  ]),

  // ───────────────────────── Accessories / UPS / Software ─────────────────────────
  ...make("accessories", "1 year manufacturer warranty", [
    ["ACC-ARC-MX6", "Arctic", "Arctic MX-6 Thermal Paste (4g)", 699, 899, 40, { type: "Thermal paste", detail: "4g syringe" }, { popularity: 40, rating: 4.8 }],
    ["ACC-LOGI-DESKMAT", "Logitech", "Logitech Desk Mat Studio Series", 1495, 1995, 20, { type: "Desk mat", detail: "700 × 300mm" }, { popularity: 35, rating: 4.6 }],
    ["ACC-SD-FLAIR128", "SanDisk", "SanDisk Ultra Flair 128GB USB 3.0", 999, 1599, 50, { type: "Pen drive", detail: "128GB USB 3.0" }, { popularity: 70, rating: 4.5 }],
    ["ACC-SS-T7-1T", "Samsung", "Samsung T7 1TB Portable SSD", 8999, 11999, 12, { type: "Portable SSD", detail: "1TB USB 3.2 Gen 2" }, { popularity: 55, rating: 4.8, warranty: "3 years manufacturer warranty" }],
    ["ACC-SG-OT-2T", "Seagate", "Seagate One Touch 2TB Portable HDD", 7299, 8999, 15, { type: "External HDD", detail: "2TB USB 3.0" }, { popularity: 50, rating: 4.5, warranty: "3 years manufacturer warranty" }],
  ]),
  ...make("ups", "2 years manufacturer warranty", [
    ["UPS-APC-BX600", "APC", "APC Back-UPS BX600C-IN 600VA", 3299, 4200, 25, { va: 600, watts: 360, upsType: "Line interactive", outlets: 3 }, { popularity: 80, rating: 4.4 }],
    ["UPS-APC-BX1100", "APC", "APC Back-UPS BX1100C-IN 1100VA", 6999, 8900, 14, { va: 1100, watts: 660, upsType: "Line interactive", outlets: 4 }, { popularity: 65, rating: 4.5 }],
    ["UPS-APC-BVX1600", "APC", "APC Back-UPS BVX1600H-IN 1600VA", 10999, 13500, 8, { va: 1600, watts: 900, upsType: "Line interactive", outlets: 6 }, { popularity: 40, rating: 4.5 }],
    ["UPS-APC-SRV2K", "APC", "APC Easy UPS On-Line SRV2KI 2kVA", 34999, 42000, 2, { va: 2000, watts: 1600, upsType: "Online", outlets: 4 }, { popularity: 15, rating: 4.6 }],
  ]),
  ...make("software", "Lifetime licence", [
    ["SW-WIN11-HOME", "Microsoft", "Windows 11 Home (OEM, installed & activated)", 10999, 14999, 99, { licence: "OEM", users: 1, validity: "Lifetime" }, { popularity: 70, rating: 4.6 }],
    ["SW-WIN11-PRO", "Microsoft", "Windows 11 Pro (OEM, installed & activated)", 14499, 19999, 99, { licence: "OEM", users: 1, validity: "Lifetime" }, { popularity: 45, rating: 4.6 }],
    ["SW-M365-PERS", "Microsoft", "Microsoft 365 Personal (1 year)", 4899, 6199, 99, { licence: "Subscription", users: 1, validity: "1 year" }, { popularity: 50, rating: 4.5, warranty: "1 year subscription" }],
    ["SW-QH-TS", "Quick Heal", "Quick Heal Total Security (1 PC, 1 year)", 1299, 1999, 99, { licence: "Retail", users: 1, validity: "1 year" }, { popularity: 55, rating: 4.3, warranty: "1 year subscription" }],
    ["SW-K7-TS", "K7", "K7 Total Security (1 PC, 1 year)", 999, 1500, 99, { licence: "Retail", users: 1, validity: "1 year" }, { popularity: 35, rating: 4.2, warranty: "1 year subscription" }],
  ]),

  // ───────────────────────── Laptops ─────────────────────────
  ...make("laptops", "1 year manufacturer warranty", [
    ["LAP-ACER-ALITE-R5", "Acer", "Acer Aspire Lite AL15 (Ryzen 5 5625U / 16GB / 512GB)", 36990, 52999, 10, { processor: "Ryzen 5 5625U", memory: 16, storage: 512, graphics: "Radeon Graphics", display: "15.6\" FHD IPS", refreshRate: 60, weight: 1.6, os: "Windows 11 Home" }, { popularity: 70, rating: 4.3, deal: true }],
    ["LAP-HP-15S-I3", "HP", "HP 15s (Core i3-1315U / 8GB / 512GB)", 38999, 48999, 12, { processor: "Core i3-1315U", memory: 8, storage: 512, graphics: "Intel UHD", display: "15.6\" FHD", refreshRate: 60, weight: 1.69, os: "Windows 11 Home" }, { popularity: 75, rating: 4.2 }],
    ["LAP-ASUS-VB15-I5", "ASUS", "ASUS Vivobook 15 (Core i5-12500H / 16GB / 512GB)", 49990, 66990, 9, { processor: "Core i5-12500H", memory: 16, storage: 512, graphics: "Intel Iris Xe", display: "15.6\" FHD IPS", refreshRate: 60, weight: 1.7, os: "Windows 11 Home" }, { popularity: 80, rating: 4.4, featured: true }],
    ["LAP-DELL-INS3530", "Dell", "Dell Inspiron 3530 (Core i5-1334U / 16GB / 512GB)", 55990, 72000, 8, { processor: "Core i5-1334U", memory: 16, storage: 512, graphics: "Intel Iris Xe", display: "15.6\" FHD 120Hz", refreshRate: 120, weight: 1.62, os: "Windows 11 Home + Office" }, { popularity: 72, rating: 4.3 }],
    ["LAP-LEN-SLIM5-R7", "Lenovo", "Lenovo IdeaPad Slim 5 (Ryzen 7 8845HS / 16GB / 512GB)", 67990, 89990, 6, { processor: "Ryzen 7 8845HS", memory: 16, storage: 512, graphics: "Radeon 780M", display: "14\" WUXGA OLED", refreshRate: 60, weight: 1.46, os: "Windows 11 Home" }, { popularity: 60, rating: 4.6 }],
    ["LAP-LEN-E14G6", "Lenovo", "Lenovo ThinkPad E14 Gen 6 (Core Ultra 5 125U / 16GB / 512GB)", 72990, 94000, 4, { processor: "Core Ultra 5 125U", memory: 16, storage: 512, graphics: "Intel Graphics", display: "14\" WUXGA IPS", refreshRate: 60, weight: 1.44, os: "Windows 11 Pro" }, { popularity: 45, rating: 4.5 }],
  ]),
  ...make("gaming-laptops", "1 year manufacturer warranty", [
    ["GL-HP-VICTUS15", "HP", "HP Victus 15 (Ryzen 5 7535HS / RTX 3050 / 16GB)", 58990, 71000, 8, { processor: "Ryzen 5 7535HS", memory: 16, storage: 512, graphics: "RTX 3050 6GB", display: "15.6\" FHD 144Hz", refreshRate: 144, weight: 2.29, os: "Windows 11 Home" }, { popularity: 70, rating: 4.3 }],
    ["GL-ACER-NITROV15", "Acer", "Acer Nitro V 15 (Core i5-13420H / RTX 4050 / 16GB)", 69990, 89999, 7, { processor: "Core i5-13420H", memory: 16, storage: 512, graphics: "RTX 4050 6GB", display: "15.6\" FHD 165Hz", refreshRate: 165, weight: 2.1, os: "Windows 11 Home" }, { popularity: 82, rating: 4.4, deal: true }],
    ["GL-LEN-LOQ15", "Lenovo", "Lenovo LOQ 15 (Core i5-13450HX / RTX 5050 / 16GB)", 79990, 99990, 6, { processor: "Core i5-13450HX", memory: 16, storage: 512, graphics: "RTX 5050 8GB", display: "15.6\" FHD 144Hz", refreshRate: 144, weight: 2.38, os: "Windows 11 Home" }, { popularity: 78, rating: 4.5, featured: true }],
    ["GL-ASUS-TUFA15", "ASUS", "ASUS TUF Gaming A15 (Ryzen 7 260 / RTX 5060 / 16GB)", 1_09_990, 1_34_990, 5, { processor: "Ryzen 7 260", memory: 16, storage: 1000, graphics: "RTX 5060 8GB", display: "15.6\" FHD 165Hz", refreshRate: 165, weight: 2.2, os: "Windows 11 Home" }, { popularity: 66, rating: 4.5 }],
    ["GL-LEN-LEGIONPRO5", "Lenovo", "Lenovo Legion Pro 5 (Core i9-14900HX / RTX 5070 Ti / 32GB)", 2_19_990, 2_59_990, 2, { processor: "Core i9-14900HX", memory: 32, storage: 1000, graphics: "RTX 5070 Ti 12GB", display: "16\" WQXGA 240Hz", refreshRate: 240, weight: 2.5, os: "Windows 11 Home" }, { popularity: 40, rating: 4.7 }],
  ]),
  ...make("desktop-pcs", "3 years onsite warranty", [
    ["DT-DELL-OPTI7020", "Dell", "Dell OptiPlex 7020 Tower (Core i5-14500 / 8GB / 512GB)", 58990, 72000, 6, { processor: "Core i5-14500", memory: 8, storage: "512GB SSD", graphics: "Intel UHD 770", formType: "Tower", os: "Windows 11 Pro" }, { popularity: 55, rating: 4.4 }],
    ["DT-HP-AIO24", "HP", "HP All-in-One 24 (Core i5-1335U / 16GB / 512GB)", 61990, 76000, 4, { processor: "Core i5-1335U", memory: 16, storage: "512GB SSD", graphics: "Intel Iris Xe", formType: "All-in-One", os: "Windows 11 Home" }, { popularity: 50, rating: 4.3, warranty: "1 year manufacturer warranty" }],
    ["DT-LEN-AIO3", "Lenovo", "Lenovo IdeaCentre AIO 3 (Ryzen 5 7530U / 16GB / 512GB)", 54990, 69990, 5, { processor: "Ryzen 5 7530U", memory: 16, storage: "512GB SSD", graphics: "Radeon Graphics", formType: "All-in-One", os: "Windows 11 Home" }, { popularity: 45, rating: 4.3, warranty: "1 year manufacturer warranty" }],
    ["DT-ASUS-NUC14", "ASUS", "ASUS NUC 14 Pro Mini PC (Core Ultra 5 / 16GB / 512GB)", 52990, 64990, 3, { processor: "Core Ultra 5 125H", memory: 16, storage: "512GB SSD", graphics: "Intel Arc", formType: "Mini PC", os: "Windows 11 Pro" }, { popularity: 30, rating: 4.5 }],
  ]),
  ...make("custom-pcs", "3 years warranty on parts + 1 year free service at our Shillong store", [
    ["PC-TCS-STARTER", "The Computer Store", "TCS Starter Gaming PC (i5-12400F / RX 7600 / 16GB)", 57999, 64999, 3, { processor: "Core i5-12400F", graphics: "Radeon RX 7600 8GB", memory: 16, storage: "500GB NVMe" }, { popularity: 60, rating: 4.6, shortDesc: "Assembled, cable-managed and stress-tested in Shillong. Ready to take home today." }],
    ["PC-TCS-CREATOR", "The Computer Store", "TCS Creator PC (Ryzen 7 9700X / RTX 5060 Ti 16GB / 64GB)", 1_51_999, 1_64_999, 2, { processor: "Ryzen 7 9700X", graphics: "RTX 5060 Ti 16GB", memory: 64, storage: "2TB NVMe" }, { popularity: 35, rating: 4.8 }],
  ]),
  ...make("tablets", "1 year manufacturer warranty", [
    ["TAB-LEN-M11", "Lenovo", "Lenovo Tab M11 (4GB / 128GB, Wi-Fi)", 15999, 22000, 10, { display: 11, memory: 4, storage: 128, connectivity: "Wi-Fi" }, { popularity: 50, rating: 4.3 }],
    ["TAB-SS-S9FE", "Samsung", "Samsung Galaxy Tab S9 FE (8GB / 256GB, Wi-Fi)", 32999, 44999, 6, { display: 10.9, memory: 8, storage: 256, connectivity: "Wi-Fi" }, { popularity: 55, rating: 4.5 }],
  ]),
  ...make("printers", "1 year manufacturer warranty", [
    ["PRN-EP-L3250", "Epson", "Epson EcoTank L3250 Wi-Fi All-in-One", 13999, 16999, 12, { printType: "Ink Tank", functions: "Print/Scan/Copy", colour: true, connectivity: "Wi-Fi / USB", ppm: 10 }, { popularity: 85, rating: 4.5, featured: true }],
    ["PRN-CN-G3770", "Canon", "Canon PIXMA G3770 Wi-Fi Ink Tank", 14999, 17995, 8, { printType: "Ink Tank", functions: "Print/Scan/Copy", colour: true, connectivity: "Wi-Fi / USB", ppm: 11 }, { popularity: 70, rating: 4.4 }],
    ["PRN-BR-T426W", "Brother", "Brother DCP-T426W Ink Tank", 13499, 15990, 7, { printType: "Ink Tank", functions: "Print/Scan/Copy", colour: true, connectivity: "Wi-Fi / USB", ppm: 16 }, { popularity: 55, rating: 4.4 }],
    ["PRN-BR-L2321D", "Brother", "Brother HL-L2321D Mono Laser (Duplex)", 11999, 14490, 9, { printType: "Laser", functions: "Print", colour: false, connectivity: "USB", ppm: 30 }, { popularity: 60, rating: 4.5 }],
    ["PRN-HP-M141W", "HP", "HP LaserJet MFP M141w", 15999, 19999, 5, { printType: "Laser", functions: "Print/Scan/Copy", colour: false, connectivity: "Wi-Fi / USB", ppm: 20 }, { popularity: 50, rating: 4.3 }],
    ["PRN-TVS-RP3160", "TVS Electronics", "TVS RP 3160 Gold Receipt Printer", 6999, 8990, 6, { printType: "Receipt", functions: "Print", colour: false, connectivity: "USB / Serial", ppm: 0 }, { popularity: 30, rating: 4.2 }],
  ]),
];
