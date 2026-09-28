"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, Eye, EyeOff, Filter, Loader2, PackageSearch, Search, ShieldCheck, SkipForward, Trash2, X,
} from "lucide-react";
import { useBuilder } from "@/components/providers/builder";
import { useToast } from "@/components/providers/toast";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/field";
import { StatusIcon } from "@/components/ui/status";
import { ProductArt } from "@/components/product/product-art";
import { OptionCard } from "./option-card";
import { RULES, RULE_REASON } from "@/lib/compat/rules";
import { SLOT_META, STEP_ORDER } from "@/lib/compat/slots";
import type { BuilderProduct, CandidateVerdict, Slot } from "@/lib/compat/types";
import { SLOT_COMPARE_SPECS, formatSpecValue, specLabel } from "@/lib/spec-format";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

interface OptionsResponse {
  options: { product: BuilderProduct; verdict: CandidateVerdict }[];
  total: number;
  hiddenCount: number;
  hiddenReasons: { ruleId: string; count: number }[];
  brands: { name: string; count: number }[];
  priceRange: { min: number; max: number } | null;
  specFacets: { key: string; label: string; values: { value: string; label: string }[] }[];
  error?: string;
}

const SORTS = [
  { v: "popular", l: "Popularity" },
  { v: "price-asc", l: "Price: Low → High" },
  { v: "price-desc", l: "Price: High → Low" },
  { v: "performance", l: "Performance" },
  { v: "newest", l: "Newest" },
  { v: "rating", l: "Rating" },
  { v: "power", l: "Power consumption" },
];

const RULE_TITLE = Object.fromEntries(RULES.map((r) => [r.id, r.title]));

export function OptionsPanel({ slot, onNavigate, banner }: { slot: Slot; onNavigate: (slot: Slot) => void; banner?: React.ReactNode }) {
  const b = useBuilder();
  const toast = useToast();
  const meta = SLOT_META[slot];
  const stepIndex = STEP_ORDER.indexOf(slot);
  const selected = b.items[slot];

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState("popular");
  const [specs, setSpecs] = useState<Record<string, string[]>>({});
  const [showIncompatible, setShowIncompatible] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [compare, setCompare] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [data, setData] = useState<OptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const topRef = useRef<HTMLDivElement>(null);

  // Reset filters when the step changes
  useEffect(() => {
    setQ(""); setDebouncedQ(""); setBrands([]); setMaxPrice(null); setSpecs({}); setShowIncompatible(false); setCompare([]); setData(null);
  }, [slot]);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 220);
    return () => clearTimeout(t);
  }, [q]);

  // Only the *other* parts affect which options fit, so the build key excludes this slot.
  const buildKey = useMemo(() => {
    const ref = b.ref();
    delete ref[slot];
    return JSON.stringify(ref);
  }, [b, slot]);

  useEffect(() => {
    if (!b.ready) return;
    const ctrl = new AbortController();
    const params = new URLSearchParams({ slot, build: buildKey, sort });
    if (debouncedQ) params.set("q", debouncedQ);
    if (brands.length) params.set("brands", brands.join(","));
    if (maxPrice != null) params.set("max", String(maxPrice));
    if (inStock) params.set("inStock", "1");
    if (Object.values(specs).some((v) => v.length)) params.set("specs", JSON.stringify(specs));
    if (showIncompatible) params.set("showIncompatible", "1");
    setLoading(true);
    fetch(`/api/builder/options?${params}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: OptionsResponse) => setData(d))
      .catch((e) => { if (e.name !== "AbortError") setData({ error: "Couldn't load options. Check your connection and try again." } as OptionsResponse); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [b.ready, slot, buildKey, sort, debouncedQ, brands, maxPrice, inStock, specs, showIncompatible]);

  const nextSlot = STEP_ORDER[stepIndex + 1] as Slot | undefined;
  const prevSlot = STEP_ORDER[stepIndex - 1] as Slot | undefined;
  const nextMissingCore = b.report.core.missing.find((s) => s !== slot);

  const conflictsOf = (v: CandidateVerdict) =>
    [...new Set(v.issues.filter((i) => i.severity === "error").flatMap((i) => i.slots).filter((x) => x !== slot))];

  /** Switch to an incompatible option by removing the parts it conflicts with. */
  const force = (p: BuilderProduct, v: CandidateVerdict) => {
    const removed = conflictsOf(v);
    for (const s of removed) b.remove(s);
    b.set(slot, p);
    toast({
      tone: "info",
      title: `Removed ${removed.map((s) => SLOT_META[s].label.toLowerCase()).join(" and ")}`,
      body: `It didn't fit ${p.name}. Choose a new one to continue.`,
      action: removed[0] ? { label: `Choose ${SLOT_META[removed[0]].short}`, href: `/pc-builder?step=${removed[0]}` } : undefined,
    });
  };

  const choose = (p: BuilderProduct) => {
    b.set(slot, p);
    if (!meta.multiQty) {
      const target = nextMissingCore ?? nextSlot;
      if (target) setTimeout(() => onNavigate(target), 650);
    }
  };

  const activeFilters = brands.length + (maxPrice != null ? 1 : 0) + (inStock ? 1 : 0) + Object.values(specs).flat().length;
  const compareItems = (data?.options ?? []).filter((o) => compare.includes(o.product.id));
  const popularId = useMemo(() => {
    const opts = data?.options.filter((o) => o.verdict.status === "compatible" && o.product.stock > 0) ?? [];
    return opts.sort((a, c) => (c.product.popularity ?? 0) - (a.product.popularity ?? 0))[0]?.product.id;
  }, [data]);

  return (
    <div ref={topRef} className="min-w-0 rounded-[16px] border border-line bg-surface p-4 shadow-sm sm:p-6">
      {/* Step header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Step {stepIndex + 1} / {STEP_ORDER.length} · {meta.group}
          </p>
          <h2 className="mt-1 flex items-center gap-3 text-2xl font-extrabold tracking-tight sm:text-[26px]">
            {stepIndex + 1}. Choose your {meta.label}
            {!meta.core && <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-muted">Optional</span>}
          </h2>
          <p className="mt-1.5 max-w-2xl text-muted">{meta.hint}</p>
        </div>
        <div className="flex gap-2">
          {prevSlot && <Button variant="secondary" size="sm" onClick={() => onNavigate(prevSlot)} aria-label={`Back to ${SLOT_META[prevSlot].label}`}><ArrowLeft className="h-4 w-4" /> Back</Button>}
          {!meta.core && !selected && nextSlot && (
            <Button variant="ghost" size="sm" onClick={() => { b.skip(slot); onNavigate(nextSlot); }}><SkipForward className="h-4 w-4" /> Skip</Button>
          )}
          {nextSlot && (selected || !meta.core || b.report.core.notNeeded.includes(slot)) && (
            <Button size="sm" onClick={() => onNavigate(nextSlot)}>Continue <ArrowRight className="h-4 w-4" /></Button>
          )}
        </div>
      </div>

      {banner}

      {/* Selected / empty state */}
      <div className="mt-5">
        {selected ? (
          <div className="flex animate-pop items-center gap-4 rounded-2xl border border-accent/40 bg-accent-soft p-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-surface p-1.5">
              <ProductArt category={selected.product.categorySlug} brand={selected.product.brand} specs={selected.product.specs} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-accent">Selected{selected.qty > 1 ? ` · ×${selected.qty}` : ""}</p>
              <p className="truncate font-semibold">{selected.product.name}</p>
              <p className="font-mono text-sm text-muted">{formatINR(selected.product.price * selected.qty)}</p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => b.remove(slot)} aria-label={`Remove ${selected.product.name}`}><Trash2 className="h-4 w-4" /></Button>
            {nextSlot && <Button size="sm" onClick={() => onNavigate(nextMissingCore ?? nextSlot)} className="hidden sm:inline-flex">Next <ArrowRight className="h-4 w-4" /></Button>}
          </div>
        ) : b.report.core.notNeeded.includes(slot) ? (
          <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-ok" />
            <div>
              <p className="font-semibold">{slot === "gpu" ? "Your processor has integrated graphics." : "Your processor includes a cooler in the box."}</p>
              <p className="text-sm text-muted">This part is optional — {slot === "gpu" ? "add a graphics card for gaming, 3D or AI work." : "an aftermarket cooler runs quieter and cooler."}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line-strong p-4">
            <p className="font-semibold">{meta.emptyTitle}</p>
            <p className="text-sm text-muted">{meta.emptyBody}</p>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="sticky top-[68px] z-20 -mx-1 mt-5 bg-surface/95 px-1 py-3 backdrop-blur lg:top-[118px]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1 basis-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${meta.label.toLowerCase()}…`}
              className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/15"
              aria-label={`Search ${meta.label}`}
            />
          </div>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 w-auto text-sm" aria-label="Sort by">
            {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
          </Select>
          <Button variant={filtersOpen || activeFilters ? "soft" : "secondary"} size="sm" className="h-10" onClick={() => setFiltersOpen((v) => !v)} aria-expanded={filtersOpen}>
            <Filter className="h-4 w-4" /> Filters{activeFilters ? ` · ${activeFilters}` : ""}
          </Button>
        </div>

        {filtersOpen && data && (
          <div className="mt-3 animate-reveal space-y-4 rounded-2xl border border-line bg-surface p-4 [animation-duration:0.25s]">
            {data.brands.length > 1 && (
              <FilterGroup label="Brand">
                {data.brands.map((br) => (
                  <Chip key={br.name} active={brands.includes(br.name)} onClick={() => setBrands((all) => (all.includes(br.name) ? all.filter((x) => x !== br.name) : [...all, br.name]))}>
                    {br.name} <span className="text-muted">{br.count}</span>
                  </Chip>
                ))}
              </FilterGroup>
            )}
            {data.specFacets.map((f) => (
              <FilterGroup key={f.key} label={f.label}>
                {f.values.map((v) => {
                  const on = specs[f.key]?.includes(v.value);
                  return (
                    <Chip key={v.value} active={!!on} onClick={() => setSpecs((s) => ({ ...s, [f.key]: on ? s[f.key].filter((x) => x !== v.value) : [...(s[f.key] ?? []), v.value] }))}>
                      {v.label}
                    </Chip>
                  );
                })}
              </FilterGroup>
            ))}
            {data.priceRange && data.priceRange.max > data.priceRange.min && (
              <FilterGroup label={`Max price · ${formatINR(maxPrice ?? data.priceRange.max)}`}>
                <input
                  type="range"
                  min={data.priceRange.min}
                  max={data.priceRange.max}
                  step={500}
                  value={maxPrice ?? data.priceRange.max}
                  onChange={(e) => setMaxPrice(Number(e.target.value) >= data.priceRange!.max ? null : Number(e.target.value))}
                  className="w-full max-w-md accent-[var(--accent)]"
                  aria-label="Maximum price"
                />
              </FilterGroup>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" /> In stock only
              </label>
              {activeFilters > 0 && (
                <button onClick={() => { setBrands([]); setSpecs({}); setMaxPrice(null); setInStock(false); }} className="flex items-center gap-1 text-sm font-semibold text-accent">
                  <X className="h-4 w-4" /> Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Prevention notice */}
      {data && (data.hiddenCount > 0 || showIncompatible) && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-2 px-4 py-3 text-sm">
          <p className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
            {showIncompatible ? (
              <span>Showing all options, including ones that won&apos;t work with your build.</span>
            ) : (
              <span>
                <strong>{data.hiddenCount} option{data.hiddenCount > 1 ? "s" : ""} hidden</strong> because {data.hiddenCount > 1 ? "they" : "it"} won&apos;t work with your build
                {data.hiddenReasons.length > 0 && <> — {data.hiddenReasons.map((r) => `${RULE_REASON[r.ruleId] ?? RULE_TITLE[r.ruleId]?.toLowerCase() ?? r.ruleId} (${r.count})`).join(", ")}</>}.
              </span>
            )}
          </p>
          <button onClick={() => setShowIncompatible((v) => !v)} className="flex items-center gap-1.5 font-semibold text-accent">
            {showIncompatible ? <><EyeOff className="h-4 w-4" /> Hide them</> : <><Eye className="h-4 w-4" /> Show why</>}
          </button>
        </div>
      )}

      {/* Options */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]" aria-busy={loading} aria-live="polite">
        {loading && !data && Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-80" />)}
        {data?.error && <p className="col-span-full rounded-2xl bg-bad-soft p-4 text-bad">{data.error}</p>}
        {data && !data.error && data.options.length === 0 && (
          <div className="col-span-full rounded-2xl border border-line bg-surface p-10 text-center">
            <PackageSearch className="mx-auto h-10 w-10 text-muted" />
            <p className="mt-3 font-semibold">No {meta.label.toLowerCase()} matches these filters.</p>
            <p className="mt-1 text-sm text-muted">
              {data.hiddenCount > 0 ? "Some options were hidden because they don't fit your build. Try changing an earlier part, or show them to see why." : "Try clearing filters. We can also source parts we don't list — just ask on WhatsApp."}
            </p>
          </div>
        )}
        {data?.options.map((o) => (
          <OptionCard
            key={o.product.id}
            product={o.product}
            verdict={o.verdict}
            selected={selected?.product.id === o.product.id}
            qty={selected?.product.id === o.product.id ? selected.qty : 1}
            onSelect={() => choose(o.product)}
            onQty={(qty) => b.setQty(slot, qty)}
            comparing={compare.includes(o.product.id)}
            onCompare={() => setCompare((c) => (c.includes(o.product.id) ? c.filter((x) => x !== o.product.id) : c.length >= 4 ? c : [...c, o.product.id]))}
            recommended={o.product.id === popularId}
            onForce={() => force(o.product, o.verdict)}
            conflicts={conflictsOf(o.verdict)}
          />
        ))}
        {loading && data && <div className="col-span-full flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted" /></div>}
      </div>

      {/* Compare tray */}
      {compare.length > 0 && (
        <div className="sticky bottom-24 z-30 mt-6 flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-3 shadow-lift lg:bottom-4">
          <p className="text-sm font-semibold">{compare.length} selected to compare <span className="font-normal text-muted">(up to 4)</span></p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCompare([])}>Clear</Button>
            <Button size="sm" disabled={compare.length < 2} onClick={() => setCompareOpen(true)}>Compare {compare.length}</Button>
          </div>
        </div>
      )}

      <Dialog open={compareOpen} onClose={() => setCompareOpen(false)} title={`Compare ${meta.label.toLowerCase()}`} className="w-[min(1000px,calc(100vw-24px))]">
        <CompareTable slot={slot} items={compareItems} selectedId={selected?.product.id} onSelect={(p) => { setCompareOpen(false); choose(p); }} />
      </Dialog>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-muted">{label}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors", active ? "border-accent bg-accent-soft font-semibold text-accent" : "border-line bg-surface hover:border-line-strong")}
    >
      {children}
    </button>
  );
}

export function CompareTable({ slot, items, onSelect, selectedId }: { slot: Slot; items: { product: BuilderProduct; verdict: CandidateVerdict }[]; onSelect: (p: BuilderProduct) => void; selectedId?: string }) {
  const keys = SLOT_COMPARE_SPECS[slot] ?? [...new Set(items.flatMap((i) => Object.keys(i.product.specs)))];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr>
            <th className="w-40" />
            {items.map(({ product }) => (
              <th key={product.id} className="p-3 text-left align-top font-normal">
                <div className="h-20 w-20 rounded-xl bg-surface-2 p-1.5"><ProductArt category={product.categorySlug} brand={product.brand} specs={product.specs} /></div>
                <p className="mt-2 text-xs font-bold uppercase text-muted">{product.brand}</p>
                <p className="font-semibold leading-snug">{product.name}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          <tr>
            <th scope="row" className="p-3 text-left font-semibold text-muted">Price</th>
            {items.map(({ product }) => <td key={product.id} className="p-3 font-mono font-bold">{formatINR(product.price)}</td>)}
          </tr>
          <tr>
            <th scope="row" className="p-3 text-left font-semibold text-muted">Compatibility</th>
            {items.map(({ product, verdict }) => (
              <td key={product.id} className="p-3">
                <span className="flex items-start gap-1.5"><StatusIcon status={verdict.status} className="mt-0.5" />{verdict.issues[0]?.message ?? "Compatible"}</span>
              </td>
            ))}
          </tr>
          {keys.map((k) => (
            <tr key={k}>
              <th scope="row" className="p-3 text-left font-semibold text-muted">{specLabel(k)}</th>
              {items.map(({ product }) => <td key={product.id} className="p-3 font-mono text-[13px]">{formatSpecValue(k, product.specs[k])}</td>)}
            </tr>
          ))}
          <tr>
            <td />
            {items.map(({ product, verdict }) => (
              <td key={product.id} className="p-3">
                <Button size="sm" disabled={verdict.status === "incompatible" || product.stock <= 0 || product.id === selectedId} onClick={() => onSelect(product)}>
                  {product.id === selectedId ? "Selected" : "Select for build"}
                </Button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
