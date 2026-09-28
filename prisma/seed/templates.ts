// Build templates ("Customize this build") and showcase builds. Items reference product SKUs.
// Every template is validated by the compatibility engine when seeding.

export interface TemplateSeed {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  useCase: "gaming" | "creator" | "productivity" | "workstation" | "home";
  resolution?: string;
  priceLabel: string;
  isShowcase?: boolean;
  accent?: string;
  items: Record<string, string | [string, number]>;
}

export const TEMPLATES: TemplateSeed[] = [
  {
    slug: "budget-gaming-pc", name: "Budget Gaming PC", tagline: "Esports and popular titles at 1080p",
    description: "A proven Intel + Radeon combination that runs Valorant, CS2, Fortnite and GTA V smoothly at 1080p. The boxed cooler keeps costs down, and there's room to upgrade the GPU later.",
    useCase: "gaming", resolution: "1080p", priceLabel: "₹50K – ₹60K",
    items: { cpu: "CPU-I5-12400F", motherboard: "MB-GB-H610M-S2H", ram: "RAM-COR-LPX-16-D4", gpu: "GPU-SAP-7600-8G", ssd: "SSD-CR-P3P-500", psu: "PSU-DC-PK550D", case: "CASE-ANT-ICE112" },
  },
  {
    slug: "1080p-gaming-pc", name: "1080p Gaming PC", tagline: "High settings, high refresh at 1080p",
    description: "RTX 5060 with DLSS 4 and 32GB of memory — plays every current AAA game at 1080p high settings, with headroom for streaming and Discord in the background.",
    useCase: "gaming", resolution: "1080p", priceLabel: "₹70K – ₹80K",
    items: { cpu: "CPU-I5-12400F", motherboard: "MB-MSI-B760M-E-D4", ram: "RAM-GS-RV-32-D4", gpu: "GPU-ASUS-5060-8G", ssd: "SSD-WD-SN580-1T", psu: "PSU-MSI-A650BN", case: "CASE-ANT-ICE112" },
  },
  {
    slug: "1440p-gaming-pc", name: "1440p Gaming PC", tagline: "The sweet spot for sharp, fast gaming",
    description: "RTX 5070 paired with a 10-core Intel CPU and 32GB RAM. Built for 1440p at high refresh rates, with an ATX 3.0 Gold power supply.",
    useCase: "gaming", resolution: "1440p", priceLabel: "₹1L – ₹1.2L",
    items: { cpu: "CPU-I5-14400F", motherboard: "MB-MSI-B760M-E-D4", ram: "RAM-GS-RV-32-D4", gpu: "GPU-MSI-5070-12G", ssd: "SSD-WD-SN580-1T", psu: "PSU-CM-MWE750G", case: "CASE-ANT-ICE112" },
  },
  {
    slug: "streaming-pc", name: "Streaming PC", tagline: "Game and stream from one machine",
    description: "8 Zen 5 cores handle the game while NVIDIA's NVENC encoder handles the stream. 16GB of VRAM keeps OBS scenes and overlays smooth.",
    useCase: "gaming", resolution: "1440p", priceLabel: "₹1.3L+",
    items: { cpu: "CPU-R7-9700X", motherboard: "MB-ASUS-TUF-B650-PLUS", cooler: "CL-TR-PA120SE", ram: "RAM-COR-VRGB-32-D5", gpu: "GPU-GB-5060TI-16G", ssd: "SSD-SS-990EP-1T", psu: "PSU-CM-MWE750G", case: "CASE-DC-CH560" },
  },
  {
    slug: "content-creator-pc", name: "Content Creator PC", tagline: "Premiere, DaVinci Resolve and Blender",
    description: "64GB of DDR5 for long timelines, a 16GB RTX card for GPU effects and a fast 2TB NVMe scratch drive.",
    useCase: "creator", priceLabel: "₹1.5L+",
    items: { cpu: "CPU-R7-9700X", motherboard: "MB-ASUS-TUF-B650-PLUS", cooler: "CL-TR-PA120SE", ram: "RAM-KF-BEAST-64-D5", gpu: "GPU-GB-5060TI-16G", ssd: "SSD-SS-990P-2T", psu: "PSU-CM-MWE750G", case: "CASE-COR-4000D" },
  },
  {
    slug: "developer-workstation", name: "Developer Workstation", tagline: "Compile fast, run Docker, keep 40 tabs open",
    description: "8 cores, 64GB RAM and integrated Radeon 780M graphics — no graphics card needed. Quiet, efficient and ready for WSL, containers and VMs.",
    useCase: "productivity", priceLabel: "₹80K+",
    items: { cpu: "CPU-R7-8700G", motherboard: "MB-MSI-B650M-A", ram: "RAM-KF-BEAST-64-D5", ssd: "SSD-SS-990EP-1T", psu: "PSU-DC-PK550D", case: "CASE-CM-Q300L", os: "SW-WIN11-PRO" },
  },
  {
    slug: "professional-workstation", name: "Professional Workstation", tagline: "Rendering, simulation and CAD",
    description: "16-core Ryzen 9, 128GB DDR5 and an RTX 5070 Ti on a flagship X870E platform with 360mm liquid cooling.",
    useCase: "workstation", priceLabel: "₹3L+",
    items: { cpu: "CPU-R9-9950X", motherboard: "MB-ASUS-X870E-E", cooler: "CL-LL-GAL2-360", ram: ["RAM-GS-TZ5-64-D5", 2], gpu: "GPU-ASUS-5070TI-16G", ssd: "SSD-SS-990P-2T", psu: "PSU-COR-RM850E", case: "CASE-LL-O11EVO" },
  },
  {
    slug: "ai-ml-workstation", name: "AI / ML Workstation", tagline: "Local LLMs, training and data science",
    description: "RTX 5080 with 16GB VRAM, 192GB system memory for large datasets and 4TB of fast NVMe storage. Ask us about RTX 5090 32GB configurations.",
    useCase: "workstation", priceLabel: "₹3.3L+",
    items: { cpu: "CPU-R9-9950X", motherboard: "MB-MSI-B850-TOMAHAWK", cooler: "CL-ARC-LF3-240", ram: ["RAM-COR-V-96-D5", 2], gpu: "GPU-GB-5080-16G", ssd: "SSD-WD-SN850X-4T", psu: "PSU-DC-PX1000G", case: "CASE-MT-AIR903" },
  },
  {
    slug: "office-pc", name: "Office PC", tagline: "Everything for work, including the monitor",
    description: "Reliable, quiet and complete — Ryzen with built-in graphics, 16GB RAM, a fast SSD, a 22\" monitor and keyboard/mouse. Add a UPS for peace of mind.",
    useCase: "home", priceLabel: "₹40K+",
    items: { cpu: "CPU-R5-5600GT", motherboard: "MB-MSI-B550M-PRO-VDH", ram: "RAM-COR-LPX-16-D4", ssd: "SSD-CR-P3P-500", psu: "PSU-DC-PK550D", case: "CASE-CM-Q300L", monitor: "MON-DELL-E2225H", keyboard: "KB-ZEB-COMBO" },
  },
  // ── Showcase ──
  {
    slug: "blackout", name: "BLACKOUT", tagline: "All-black 1440p gaming rig",
    description: "The Ryzen 7 7800X3D is still one of the best gaming CPUs ever made. Paired with an RTX 4070 and 32GB DDR5 in a stealthy Corsair 4000D Airflow.",
    useCase: "gaming", resolution: "1440p", priceLabel: "", isShowcase: true, accent: "#3D8BFF",
    items: { cpu: "CPU-R7-7800X3D", motherboard: "MB-ASUS-TUF-B650-PLUS", cooler: "CL-DC-AK400", ram: "RAM-COR-VRGB-32-D5", gpu: "GPU-ZT-4070-12G", ssd: "SSD-SS-990EP-1T", psu: "PSU-CM-MWE750G", case: "CASE-COR-4000D" },
  },
  {
    slug: "whiteout", name: "WHITEOUT", tagline: "Clean white build with Radeon power",
    description: "RX 9070 XT, Ryzen 7 9700X and a 360mm Lian Li AIO in an NZXT H5 Flow. Quiet, bright and very fast at 1440p.",
    useCase: "gaming", resolution: "1440p", priceLabel: "", isShowcase: true, accent: "#E6ECF5",
    items: { cpu: "CPU-R7-9700X", motherboard: "MB-MSI-B850-TOMAHAWK", cooler: "CL-LL-GAL2-360", ram: "RAM-XPG-LANCER-32-D5", gpu: "GPU-PC-9070XT-16G", ssd: "SSD-KS-NV3-2T", psu: "PSU-CM-MWE750G", case: "CASE-NZXT-H5F-W" },
  },
  {
    slug: "titan", name: "TITAN", tagline: "No-compromise 4K gaming",
    description: "Ryzen 7 9800X3D and RTX 5080 on X870E with a Gen5 SSD and 64GB DDR5 — our fastest gaming configuration.",
    useCase: "gaming", resolution: "4K", priceLabel: "", isShowcase: true, accent: "#22D3EE",
    items: { cpu: "CPU-R7-9800X3D", motherboard: "MB-ASUS-X870E-E", cooler: "CL-NZXT-K360", ram: "RAM-GS-TZ5-64-D5", gpu: "GPU-GB-5080-16G", ssd: "SSD-CR-T705-2T", psu: "PSU-DC-PX1000G", case: "CASE-LL-O11EVO" },
  },
  {
    slug: "nano", name: "NANO", tagline: "Small form factor, full-size performance",
    description: "A shoebox-sized Mini-ITX build in the Fractal Terra with an RTX 5060 Ti 16GB and SFX power. Perfect for a desk or living room.",
    useCase: "gaming", resolution: "1440p", priceLabel: "", isShowcase: true, accent: "#A78BFA",
    items: { cpu: "CPU-R7-9700X", motherboard: "MB-GB-B650I-ULTRA", cooler: "CL-NOC-L12S", ram: "RAM-XPG-LANCER-32-D5", gpu: "GPU-GB-5060TI-16G", ssd: "SSD-SS-990EP-1T", psu: "PSU-CM-V850SFX", case: "CASE-FD-TERRA" },
  },
];
