import type { Metadata } from "next";
import Link from "next/link";
import { Wand2 } from "lucide-react";
import { TemplateCard } from "@/components/build/template-card";
import { ProductGrid } from "@/components/catalog/product-grid";
import { getTemplates } from "@/server/builds";
import { listProducts } from "@/server/catalog";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Gaming PCs — 1080p, 1440p & 4K Builds",
  description: "Custom gaming PCs for every budget, assembled in Shillong. Filter by resolution and price, then customise every part.",
  alternates: { canonical: "/gaming-pcs" },
};

const RES = ["1080p", "1440p", "4K"];
const BUDGETS: [string, number | undefined, number | undefined][] = [
  ["Under ₹60K", undefined, 60000], ["₹60K – ₹1L", 60000, 100000], ["₹1L – ₹1.5L", 100000, 150000], ["₹1.5L+", 150000, undefined],
];

export default async function GamingPcsPage({ searchParams }: { searchParams: Promise<{ res?: string; min?: string; max?: string }> }) {
  const sp = await searchParams;
  const min = sp.min ? Number(sp.min) : undefined, max = sp.max ? Number(sp.max) : undefined;
  const [templates, showcase, prebuilt] = await Promise.all([
    getTemplates({ showcase: false }), getTemplates({ showcase: true }), listProducts({ category: "custom-pcs", perPage: 8 }),
  ]);
  const all = [...showcase, ...templates].filter((t) => t.useCase === "gaming");
  const list = all.filter((t) => (!sp.res || t.resolution === sp.res) && (min == null || t.total >= min) && (max == null || t.total <= max));
  const q = (o: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ res: sp.res, min: sp.min, max: sp.max, ...o })) if (v != null && v !== "") p.set(k, String(v));
    return `/gaming-pcs${p.size ? `?${p}` : ""}`;
  };
  const chip = (active: boolean) => cn("shrink-0 rounded-full border px-4 py-2 text-sm font-semibold", active ? "border-ink bg-ink text-bg" : "border-line bg-surface hover:border-line-strong");

  return (
    <div className="container-x py-10">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Gaming PCs</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">Compatibility-checked gaming builds. Pick your resolution and budget, then customise every part.</p>
      <div className="mt-8 space-y-3">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
          <span className="mr-1 shrink-0 text-sm font-semibold text-muted">Resolution</span>
          <Link href={q({ res: undefined })} className={chip(!sp.res)}>Any</Link>
          {RES.map((r) => <Link key={r} href={q({ res: r })} className={chip(sp.res === r)}>{r}</Link>)}
        </div>
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
          <span className="mr-1 shrink-0 text-sm font-semibold text-muted">Budget</span>
          <Link href={q({ min: undefined, max: undefined })} className={chip(min == null && max == null)}>Any</Link>
          {BUDGETS.map(([l, lo, hi]) => <Link key={l} href={q({ min: lo, max: hi })} className={chip(min === lo && max === hi)}>{l}</Link>)}
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => <TemplateCard key={t.slug} t={{ ...t, priceLabel: t.priceLabel }} />)}
      </div>
      {list.length === 0 && (
        <div className="mt-8 rounded-[24px] border border-line bg-surface p-10 text-center">
          <p className="font-semibold">No ready-made build in this range yet.</p>
          <Link href={`/pc-builder?start=budget&use=gaming`} className="mt-3 inline-flex items-center gap-2 font-semibold text-accent"><Wand2 className="h-4 w-4" /> Let us build one for your budget</Link>
        </div>
      )}
      {prebuilt.products.length > 0 && (
        <section className="mt-16" aria-labelledby="ready-h">
          <h2 id="ready-h" className="text-2xl font-extrabold tracking-tight">Ready to take home today</h2>
          <p className="mb-6 mt-1 text-muted">Assembled and tested in store.</p>
          <ProductGrid products={prebuilt.products} />
        </section>
      )}
    </div>
  );
}
