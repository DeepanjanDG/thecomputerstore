import type { UseCase } from "@/server/settings-defaults";

export interface UseCaseInfo {
  id: UseCase;
  emoji: string;
  title: string;
  description: string;
  range: string;
  defaultBudget: number;
  cta: string;
}

export const USE_CASES: UseCaseInfo[] = [
  { id: "gaming", emoji: "🎮", title: "Gaming", description: "For competitive gaming and AAA titles", range: "₹60K – ₹1.5L+", defaultBudget: 100000, cta: "Start Gaming Build" },
  { id: "creator", emoji: "🎨", title: "Content Creation", description: "For video editing, 3D and creative workflows", range: "₹1L – ₹2.5L+", defaultBudget: 150000, cta: "Start Creator Build" },
  { id: "productivity", emoji: "💻", title: "Productivity", description: "For office, development and everyday work", range: "₹45K – ₹1L", defaultBudget: 80000, cta: "Start Productivity Build" },
  { id: "workstation", emoji: "🧠", title: "Workstation", description: "For engineering, rendering, AI and professional workloads", range: "₹2L – ₹5L+", defaultBudget: 250000, cta: "Start Workstation Build" },
  { id: "home", emoji: "🏠", title: "Home / Student", description: "For study, browsing and everyday computing", range: "₹35K – ₹60K", defaultBudget: 45000, cta: "Start Home Build" },
];
