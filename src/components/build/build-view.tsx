import Link from "next/link";
import { ProductArt } from "@/components/product/product-art";
import { StatusIcon, StatusPill } from "@/components/ui/status";
import { SLOT_META, STEP_ORDER } from "@/lib/compat/slots";
import type { BuildItems, BuildReport, Pricing } from "@/lib/compat/types";
import { formatINR } from "@/lib/format";
import { cardSpecs } from "@/lib/spec-format";

/** Read-only build breakdown shared by the share page, template pages and cart. */
export function BuildTable({ items, report }: { items: BuildItems; report?: BuildReport }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-[24px] border border-line bg-surface">
      {STEP_ORDER.filter((s) => items[s]).map((s) => {
        const { product: p, qty } = items[s]!;
        const bad = report?.errors.some((r) => r.slots.includes(s));
        const warn = report?.warnings.some((r) => r.slots.includes(s));
        return (
          <li key={s} className="flex items-center gap-4 p-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-surface-2 p-1.5"><ProductArt category={p.categorySlug} brand={p.brand} specs={p.specs} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">{SLOT_META[s].label}</p>
              <Link href={`/product/${p.slug}`} className="font-semibold hover:text-accent">{p.name}{qty > 1 ? ` × ${qty}` : ""}</Link>
              <p className="mt-1 hidden flex-wrap gap-1.5 sm:flex">
                {cardSpecs(p).slice(0, 4).map((x) => <span key={x.key} className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-ink-2">{x.value}</span>)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-right">
              <span className="font-mono font-semibold">{formatINR(p.price * qty)}</span>
              {report && <StatusIcon status={bad ? "incompatible" : warn ? "warning" : "compatible"} />}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function BuildTotals({ pricing, report }: { pricing: Pricing; report: BuildReport }) {
  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-line bg-surface p-5">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted">MRP</dt><dd className="font-mono text-muted line-through">{formatINR(pricing.mrpTotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Discount</dt><dd className="font-mono text-ok">−{formatINR(pricing.discount)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">GST included</dt><dd className="font-mono text-muted">{formatINR(pricing.gstIncluded)}</dd></div>
          <div className="flex items-baseline justify-between border-t border-line pt-3"><dt className="font-semibold">Total</dt><dd className="font-mono text-3xl font-bold">{formatINR(pricing.total)}</dd></div>
        </dl>
      </div>
      <div className="rounded-[24px] border border-line bg-surface p-5">
        <div className="flex items-center justify-between">
          <p className="font-bold">Compatibility</p>
          <StatusPill status={report.status} />
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          {[...report.errors, ...report.warnings].map((r, i) => (
            <li key={i} className="flex items-start gap-2"><StatusIcon status={r.status} className="mt-0.5" /> {r.message}</li>
          ))}
          {report.errors.length + report.warnings.length === 0 && <li className="flex items-start gap-2 text-muted"><StatusIcon status="compatible" className="mt-0.5" /> All {report.passes.length} checks passed.</li>}
        </ul>
        {report.power.estimatedW > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2 text-center text-sm">
            <div className="rounded-xl bg-surface-2 p-2"><p className="text-xs text-muted">Power requirement</p><p className="font-mono font-semibold">{report.power.estimatedW}W</p></div>
            <div className="rounded-xl bg-surface-2 p-2"><p className="text-xs text-muted">Recommended PSU</p><p className="font-mono font-semibold">{report.power.recommendedW}W+</p></div>
          </div>
        )}
      </div>
    </div>
  );
}
