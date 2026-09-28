"use client";

import Link from "next/link";
import { Check, Minus, Plus, Star } from "lucide-react";
import { ProductArt } from "@/components/product/product-art";
import { BrandLogo } from "@/components/brand-logo";
import { StockBadge } from "@/components/product/price";
import { Button } from "@/components/ui/button";
import { StatusIcon, StatusPill } from "@/components/ui/status";
import type { BuilderProduct, CandidateVerdict, Slot } from "@/lib/compat/types";
import { SLOT_META } from "@/lib/compat/slots";
import { cardSpecs } from "@/lib/spec-format";
import { discountPct, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export function OptionCard({
  product, verdict, selected, qty, onSelect, onQty, comparing, onCompare, recommended, onForce, conflicts = [],
}: {
  product: BuilderProduct;
  verdict: CandidateVerdict;
  selected: boolean;
  qty: number;
  onSelect: () => void;
  onQty: (q: number) => void;
  comparing: boolean;
  onCompare: () => void;
  recommended?: boolean;
  /** Select anyway, removing the parts that conflict (e.g. switching CPU platform). */
  onForce?: () => void;
  conflicts?: Slot[];
}) {
  const meta = SLOT_META[product.slot];
  const off = discountPct(product.price, product.mrp);
  const out = product.stock <= 0;
  const blocked = verdict.status === "incompatible";
  const firstIssue = verdict.issues[0];
  const pass = verdict.passes[0];

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-[14px] border bg-surface p-3 transition-[border-color,box-shadow,transform] duration-200",
        selected ? "border-ok shadow-[0_0_0_3px_color-mix(in_srgb,var(--ok)_18%,transparent)]" : "border-line hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-soft",
        blocked && "opacity-75",
      )}
      aria-label={product.name}
    >
      <Link href={`/product/${product.slug}`} target="_blank" className="relative block aspect-[4/3] overflow-hidden rounded-[10px] bg-surface-2 p-3" aria-label={`View ${product.name} details (opens in new tab)`}>
        <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
          <ProductArt category={product.categorySlug} brand={product.brand} specs={product.specs} label={product.name} />
        </div>
        <span className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {off >= 10 && <span className="rounded-md bg-bad px-1.5 py-0.5 text-[10px] font-bold text-white">{off}% Off</span>}
          {recommended && <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">Popular</span>}
        </span>
        {selected && (
          <span className="absolute right-2 top-2 grid h-6 w-6 animate-pop place-items-center rounded-full bg-ok text-white shadow" aria-hidden>
            <Check className="h-3.5 w-3.5" />
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col px-1 pt-3">
        <div className="flex items-center justify-between gap-2 text-xs">
          <BrandLogo name={product.brand} height={13} className="min-w-0 text-ink-2" />
          {product.rating ? <span className="flex shrink-0 items-center gap-0.5 font-semibold text-ink-2"><Star className="h-3 w-3 fill-[#f5a623] text-[#f5a623]" aria-hidden />{product.rating.toFixed(1)}</span> : null}
        </div>
        <h3 className="mt-1 line-clamp-2 text-[14px] font-semibold leading-snug">{product.name}</h3>
        <p className="mt-1 line-clamp-1 text-xs text-muted" aria-label="Key specifications">
          {cardSpecs(product).slice(0, 3).map((s) => s.value).join(" · ")}
        </p>

        {/* Verdict */}
        <div className="mt-2">
          {firstIssue ? (
            <div className={cn("rounded-lg px-2 py-1.5 text-[12px] leading-snug", blocked ? "bg-bad-soft" : "bg-warn-soft")}>
              <p className="flex items-start gap-1.5"><StatusIcon status={firstIssue.status} className="mt-0.5 shrink-0" /><span className="line-clamp-3">{firstIssue.message}</span></p>
              {verdict.issues.length > 1 && <p className="mt-0.5 pl-5 text-muted">+{verdict.issues.length - 1} more</p>}
            </div>
          ) : (
            <p className="flex items-center gap-1.5 text-[12px]" title={pass?.message}>
              <StatusPill status="compatible" className="px-2 py-0.5 text-[11px]" />
            </p>
          )}
        </div>

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <p className="text-[17px] font-extrabold tracking-tight">{formatINR(product.price)}</p>
            {off > 0 && <p className="text-xs text-muted line-through">{formatINR(product.mrp)}</p>}
          </div>
          <StockBadge stock={product.stock} className="mt-0.5" />
          <div className="mt-2.5 flex flex-col gap-2">
            {selected && meta.multiQty ? (
              <div className="flex items-center justify-between rounded-lg border border-ok/50 bg-ok-soft" role="group" aria-label="Quantity">
                <button onClick={() => onQty(qty - 1)} disabled={qty <= 1} className="grid h-9 w-9 place-items-center disabled:opacity-40" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
                <span className="font-mono text-sm font-semibold" aria-live="polite">{qty}</span>
                <button onClick={() => onQty(qty + 1)} disabled={qty >= meta.maxQty} className="grid h-9 w-9 place-items-center disabled:opacity-40" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
              </div>
            ) : blocked && onForce && !out ? (
              <Button size="sm" variant="secondary" onClick={onForce} className="w-full whitespace-normal py-1 leading-tight" aria-label={`Switch to ${product.name} and remove conflicting parts`}>
                Switch & clear {conflicts.map((c) => SLOT_META[c].short).join(" & ") || "conflicts"}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={onSelect}
                disabled={out || blocked || selected}
                className={cn("w-full", selected && "bg-ok text-white opacity-100 shadow-none disabled:opacity-100")}
                aria-label={selected ? `${product.name} selected` : `Add ${product.name} to build`}
              >
                {selected ? <>Selected <Check className="h-4 w-4" /></> : out ? "Out of stock" : blocked ? "Won't fit" : "Add to Build"}
              </Button>
            )}
            <label className="flex cursor-pointer items-center justify-center gap-1.5 text-xs text-muted hover:text-ink">
              <input type="checkbox" checked={comparing} onChange={onCompare} className="h-3.5 w-3.5 accent-[var(--accent)]" />
              Compare
            </label>
          </div>
        </div>
      </div>
    </article>
  );
}
