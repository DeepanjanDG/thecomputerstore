import type { Metadata } from "next";
import Link from "next/link";
import { ShowcaseGrid } from "@/components/home/sections";
import { TemplateCard } from "@/components/build/template-card";
import { getTemplates } from "@/server/builds";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "PC Build Templates — Gaming, Creator & Workstation PCs",
  description: "Pre-configured, compatibility-checked PC builds from ₹45K to ₹3L+. Customise any template in the PC Builder.",
  alternates: { canonical: "/builds" },
};

const FILTERS = [["all", "All"], ["gaming", "Gaming"], ["creator", "Creator"], ["productivity", "Productivity"], ["workstation", "Workstation"], ["home", "Home / Office"]];

export default async function BuildsPage({ searchParams }: { searchParams: Promise<{ use?: string }> }) {
  const { use = "all" } = await searchParams;
  const [templates, showcase] = await Promise.all([getTemplates({ showcase: false }), getTemplates({ showcase: true })]);
  const list = use === "all" ? templates : templates.filter((t) => t.useCase === use);
  return (
    <>
      <div className="container-x py-10">
        <p className="eyebrow">Build templates</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">Start from a proven build.</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">Every template is compatibility-checked and uses parts in stock. Open one in the builder and change anything.</p>
        <nav aria-label="Filter templates" className="no-scrollbar mt-8 flex gap-2 overflow-x-auto">
          {FILTERS.map(([v, l]) => (
            <Link key={v} href={v === "all" ? "/builds" : `/builds?use=${v}`} aria-current={use === v ? "page" : undefined} className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-semibold", use === v ? "border-ink bg-ink text-bg" : "border-line bg-surface hover:border-line-strong")}>
              {l}
            </Link>
          ))}
        </nav>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => <TemplateCard key={t.slug} t={t} />)}
        </div>
        {list.length === 0 && <p className="mt-8 text-muted">No templates in this category yet — <Link href="/pc-builder?start=budget" className="font-semibold text-accent">let us build one for your budget</Link>.</p>}
      </div>
      <ShowcaseGrid builds={showcase.map((t) => ({ slug: t.slug, name: t.name, tagline: t.tagline, accent: t.accent, total: t.total, items: t.built }))} />
    </>
  );
}
