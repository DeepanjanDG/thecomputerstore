// Defaults for admin-editable settings that live outside the compatibility engine.

export type UseCase = "gaming" | "creator" | "productivity" | "workstation" | "home";

export interface AutoBuildConfig {
  /** Share of the budget targeted per slot, per use case. Remaining budget goes to upgrades. */
  allocations: Record<UseCase, Partial<Record<"cpu" | "motherboard" | "cooler" | "ram" | "gpu" | "ssd" | "psu" | "case", number>>>;
  /** Minimum RAM (GB) per use case and resolution. */
  ramGb: Record<UseCase, number>;
  ramGbByResolution: Record<string, number>;
  /** Minimum GPU performance tier per resolution for gaming builds. */
  gpuTierByResolution: Record<string, number>;
}

export const DEFAULT_AUTOBUILD: AutoBuildConfig = {
  allocations: {
    gaming: { gpu: 0.42, cpu: 0.17, motherboard: 0.11, ram: 0.08, ssd: 0.06, psu: 0.07, case: 0.05, cooler: 0.04 },
    creator: { gpu: 0.3, cpu: 0.24, motherboard: 0.12, ram: 0.12, ssd: 0.08, psu: 0.06, case: 0.05, cooler: 0.03 },
    productivity: { gpu: 0, cpu: 0.3, motherboard: 0.18, ram: 0.16, ssd: 0.12, psu: 0.08, case: 0.08, cooler: 0.04 },
    workstation: { gpu: 0.35, cpu: 0.22, motherboard: 0.1, ram: 0.14, ssd: 0.08, psu: 0.05, case: 0.03, cooler: 0.03 },
    home: { gpu: 0, cpu: 0.28, motherboard: 0.2, ram: 0.12, ssd: 0.12, psu: 0.1, case: 0.12, cooler: 0 },
  },
  ramGb: { gaming: 16, creator: 32, productivity: 32, workstation: 64, home: 16 },
  ramGbByResolution: { "1080p": 16, "1440p": 32, "4K": 32 },
  gpuTierByResolution: { "1080p": 4, "1440p": 6, "4K": 8 },
};

export interface SocialLinks {
  instagram: { url: string; enabled: boolean };
  facebook: { url: string; enabled: boolean };
  youtube: { url: string; enabled: boolean };
}

export const DEFAULT_SOCIAL: SocialLinks = {
  instagram: { url: "", enabled: true },
  facebook: { url: "", enabled: true },
  youtube: { url: "", enabled: true },
};

export interface HomeContent {
  announcement: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  stats: { value: string; label: string }[];
  reviews: { name: string; city: string; text: string; build?: string }[];
}

export const DEFAULT_HOME: HomeContent = {
  announcement: "Free assembly, cable management and stress testing on every custom PC built in Shillong.",
  heroEyebrow: "Custom PCs · Shillong, Meghalaya",
  heroTitle: "Build the PC\nyou actually want.",
  heroSubtitle:
    "Choose every component, check compatibility in real time, and create a custom PC built around your budget and needs.",
  stats: [
    { value: "25", label: "compatibility checks on every build" },
    { value: "19", label: "component categories" },
    { value: "Free", label: "assembly & testing in store" },
  ],
  // PLACEHOLDER reviews — replace with genuine customer reviews (Admin → Homepage) before launch.
  reviews: [
    { name: "Bankitlang R.", city: "Shillong", build: "1440p Gaming PC", text: "Picked my parts on the builder, went to the store the next day and they had it assembled and tested by evening. Cable management was spotless." },
    { name: "Priyanka D.", city: "Guwahati", build: "Content Creator PC", text: "The compatibility notes explained why a cooler wouldn't fit my case — saved me a return. The quote PDF made it easy to get approval from my studio." },
    { name: "Ferdinand L.", city: "Tura", build: "Office PCs × 6", text: "We ordered six office PCs with UPS units for our school. The team handled Windows activation and set everything up on site." },
  ],
};
