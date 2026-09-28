"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Filter, Loader2, X } from "lucide-react";
import { Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { formatINR } from "@/lib/format";
import { formatSpecValue } from "@/lib/spec-format";
import { cn } from "@/lib/utils";

export interface Facets {
  brands: { slug: string; name: string; count: number }[];
  price: { min: number; max: number };
  specs: { key: string; label: string; unit: string | null; values: { value: string; count: number }[] }[];
}

const SORTS = [
  ["popular", "Popularity"], ["price-asc", "Price: Low → High"], ["price-desc", "Price: High → Low"],
  ["performance", "Performance"], ["newest", "Newest"], ["rating", "Rating"],
];

/** URL-driven filters so every filtered view is linkable and server-rendered. */
export function useCatalogParams() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const update = (mut: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(sp.toString());
    mut(p);
    p.delete("page");
    start(() => router.push(`${pathname}?${p.toString()}`, { scroll: false }));
  };
  const list = (k: string) => (sp.get(k) ?? "").split(",").filter(Boolean);
  const toggle = (k: string, v: string) =>
    update((p) => {
      const cur = new Set(list(k));
      if (cur.has(v)) cur.delete(v); else cur.add(v);
      if (cur.size) p.set(k, [...cur].join(",")); else p.delete(k);
    });
  return { sp, update, list, toggle, pending };
}

export function SortSelect() {
  const { sp, update, pending } = useCatalogParams();
  return (
    <div className="flex items-center gap-2">
      {pending && <Loader2 className="h-4 w-4 animate-spin text-muted" aria-label="Updating" />}
      <label htmlFor="sort" className="sr-only">Sort by</label>
      <Select id="sort" value={sp.get("sort") ?? "popular"} onChange={(e) => update((p) => p.set("sort", e.target.value))} className="h-10 w-auto text-sm">
        {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </Select>
    </div>
  );
}

function FilterBody({ facets }: { facets: Facets }) {
  const { sp, update, list, toggle } = useCatalogParams();
  const [max, setMax] = useState(Number(sp.get("max") ?? facets.price.max));
  const active = [...sp.keys()].filter((k) => k !== "sort" && k !== "page" && k !== "q").length;
  return (
    <div className="space-y-6">
      {active > 0 && (
        <button onClick={() => update((p) => { for (const k of [...p.keys()]) if (k !== "sort" && k !== "q") p.delete(k); })} className="flex items-center gap-1 text-sm font-semibold text-accent">
          <X className="h-4 w-4" /> Clear all filters
        </button>
      )}
      <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={sp.get("stock") === "1"} onChange={(e) => update((p) => (e.target.checked ? p.set("stock", "1") : p.delete("stock")))} className="h-4 w-4 accent-[var(--accent)]" />
        In stock only
      </label>
      {facets.price.max > facets.price.min && (
        <fieldset>
          <legend className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">Price</legend>
          <input
            type="range" min={facets.price.min} max={facets.price.max} step={500} value={max}
            onChange={(e) => setMax(Number(e.target.value))}
            onPointerUp={() => update((p) => (max >= facets.price.max ? p.delete("max") : p.set("max", String(max))))}
            onKeyUp={() => update((p) => (max >= facets.price.max ? p.delete("max") : p.set("max", String(max))))}
            className="w-full accent-[var(--accent)]" aria-label="Maximum price"
          />
          <p className="mt-1 flex justify-between font-mono text-xs text-muted"><span>{formatINR(facets.price.min)}</span><span>up to {formatINR(max)}</span></p>
        </fieldset>
      )}
      {facets.brands.length > 1 && (
        <fieldset>
          <legend className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">Brand</legend>
          <div className="space-y-1.5">
            {facets.brands.map((b) => (
              <label key={b.slug} className="flex cursor-pointer items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2">
                  <input type="checkbox" checked={list("brand").includes(b.slug)} onChange={() => toggle("brand", b.slug)} className="h-4 w-4 accent-[var(--accent)]" />
                  {b.name}
                </span>
                <span className="text-xs text-muted">{b.count}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {facets.specs.map((f) => (
        <fieldset key={f.key}>
          <legend className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">{f.label}</legend>
          <div className="flex flex-wrap gap-1.5">
            {f.values.map((v) => {
              const on = list(`f_${f.key}`).includes(v.value);
              const label = v.value === "true" ? "Yes" : v.value === "false" ? "No" : formatSpecValue(f.key, Number.isNaN(Number(v.value)) ? v.value : Number(v.value));
              return (
                <button
                  key={v.value}
                  onClick={() => toggle(`f_${f.key}`, v.value)}
                  aria-pressed={on}
                  className={cn("rounded-full border px-2.5 py-1 text-[13px] transition-colors", on ? "border-accent bg-accent-soft font-semibold text-accent" : "border-line bg-surface hover:border-line-strong")}
                >
                  {label} <span className="text-muted">{v.count}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

export function CatalogFilters({ facets }: { facets: Facets }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <aside className="hidden lg:block" aria-label="Filters">
        <FilterBody facets={facets} />
      </aside>
      <Button variant="secondary" size="sm" className="h-10 lg:hidden" onClick={() => setOpen(true)}>
        <Filter className="h-4 w-4" /> Filters
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Filters" side="right">
        <FilterBody facets={facets} />
      </Dialog>
    </>
  );
}
