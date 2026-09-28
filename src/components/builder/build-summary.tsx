"use client";

import {
  ArrowRight, Download, FileText, Gauge, Link2, RotateCcw, Save, ShoppingCart, Sparkles, Zap,
} from "lucide-react";
import { useBuilder } from "@/components/providers/builder";
import { Button } from "@/components/ui/button";
import { StatusIcon, StatusPill } from "@/components/ui/status";
import { WhatsAppIcon } from "@/components/layout/brand-icons";
import { ProductArt } from "@/components/product/product-art";
import { CountUp } from "./count-up";
import { CORE_SLOTS, SLOT_META, STEP_ORDER } from "@/lib/compat/slots";
import type { CheckResult, Slot } from "@/lib/compat/types";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export type BuildAction = "save" | "share" | "pdf" | "cart" | "quote" | "whatsapp" | "reset";

function slotStatus(slot: Slot, issues: CheckResult[]) {
  const mine = issues.filter((r) => r.slots.includes(slot));
  if (mine.some((r) => r.severity === "error")) return "incompatible" as const;
  if (mine.some((r) => r.severity === "warning")) return "warning" as const;
  return "compatible" as const;
}

export function BuildSummary({ onGo, onAction, compact }: { onGo: (slot: Slot) => void; onAction: (a: BuildAction) => void; compact?: boolean }) {
  const b = useBuilder();
  const { report, pricing, score } = b;
  const issues = [...report.errors, ...report.warnings];
  const optional = STEP_ORDER.filter((s) => !SLOT_META[s].core && b.items[s]);
  const coreDone = report.core.selected + report.core.notNeeded.length;
  const pct = Math.round((coreDone / report.core.total) * 100);
  const empty = Object.keys(b.items).length === 0;
  const compatibleCore = CORE_SLOTS.filter((s) => b.items[s] && slotStatus(s, report.errors) !== "incompatible").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Your build</p>
          <p className="mt-0.5 truncate text-lg font-bold">{b.name}</p>
        </div>
        <StatusPill status={report.status} label={report.status === "empty" ? "Not started" : undefined} />
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{coreDone} / {report.core.total} core components</span>
          <span className="font-mono text-muted">{pct}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Build progress">
          <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2 transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
        {report.nextSlot && !empty && (
          <button onClick={() => onGo(report.nextSlot!)} className="mt-2 flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
            Next: choose {SLOT_META[report.nextSlot].label.toLowerCase()} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Parts */}
      <ul className="divide-y divide-line rounded-2xl border border-line">
        {CORE_SLOTS.map((slot) => {
          const line = b.items[slot];
          const notNeeded = report.core.notNeeded.includes(slot);
          const st = line ? slotStatus(slot, issues) : null;
          return (
            <li key={slot}>
              <button onClick={() => onGo(slot)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-2">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-2 p-0.5">
                  {line ? <ProductArt category={line.product.categorySlug} brand={line.product.brand} specs={line.product.specs} /> : <span className="text-[10px] font-bold text-muted">{SLOT_META[slot].short.slice(0, 3).toUpperCase()}</span>}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-muted">{SLOT_META[slot].short}</span>
                  <span className={cn("block truncate text-sm", line ? "font-semibold" : "text-muted")}>
                    {line ? `${line.product.name}${line.qty > 1 ? ` ×${line.qty}` : ""}` : notNeeded ? (slot === "gpu" ? "Not needed · integrated graphics" : "Not needed · stock cooler") : "Not selected"}
                  </span>
                </span>
                {line ? (
                  <span className="flex shrink-0 items-center gap-1.5">
                    <span className="font-mono text-[13px]">{formatINR(line.product.price * line.qty)}</span>
                    <StatusIcon status={st!} />
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-accent">{notNeeded ? "Optional" : "Choose"}</span>
                )}
              </button>
            </li>
          );
        })}
        {optional.map((slot) => {
          const line = b.items[slot]!;
          return (
            <li key={slot}>
              <button onClick={() => onGo(slot)} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface-2">
                <span className="w-9 shrink-0 text-center text-[10px] font-bold uppercase text-muted">+</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-muted">{SLOT_META[slot].short}</span>
                  <span className="block truncate text-sm font-semibold">{line.product.name}{line.qty > 1 ? ` ×${line.qty}` : ""}</span>
                </span>
                <span className="font-mono text-[13px]">{formatINR(line.product.price * line.qty)}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Compatibility */}
      {!empty && (
        <section aria-labelledby="compat-h" className="rounded-2xl border border-line p-4">
          <h3 id="compat-h" className="flex items-center justify-between text-sm font-bold">
            Compatibility
            <span className={cn("text-xs font-semibold", report.errors.length ? "text-bad" : report.warnings.length ? "text-warn" : "text-ok")}>
              {report.errors.length ? `✕ ${report.errors.length} issue${report.errors.length > 1 ? "s" : ""}` : report.warnings.length ? `⚠ ${report.warnings.length} warning${report.warnings.length > 1 ? "s" : ""}` : `✓ ${compatibleCore}/${CORE_SLOTS.filter((s) => b.items[s]).length} compatible`}
            </span>
          </h3>
          {issues.length === 0 ? (
            <p className="mt-2 flex items-start gap-2 text-sm text-muted">
              <StatusIcon status="compatible" className="mt-0.5" /> Every selected part works together. {report.passes.length} checks passed.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {issues.map((r, i) => (
                <li key={`${r.ruleId}-${i}`} className={cn("animate-pop rounded-xl p-3 text-sm", r.severity === "error" ? "bg-bad-soft" : "bg-warn-soft")}>
                  <p className="flex items-start gap-2">
                    <StatusIcon status={r.status} className="mt-0.5" />
                    <span className="text-ink">{r.message}</span>
                  </p>
                  {r.suggestion && <p className="mt-1.5 pl-6 text-muted">{r.suggestion}</p>}
                  <button onClick={() => onGo(r.slots[0])} className="mt-2 pl-6 text-sm font-semibold text-accent hover:underline">
                    Change {SLOT_META[r.slots[0]].label.toLowerCase()} →
                  </button>
                </li>
              ))}
            </ul>
          )}
          {report.infos.length > 0 && !compact && (
            <ul className="mt-3 space-y-2 border-t border-line pt-3">
              {report.infos.map((r, i) => (
                <li key={`${r.ruleId}-i${i}`} className="flex items-start gap-2 text-[13px] text-muted">
                  <StatusIcon status="info" className="mt-0.5" /> {r.message}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Power */}
      {report.power.estimatedW > 0 && (
        <section aria-labelledby="power-h" className="rounded-2xl border border-line p-4">
          <h3 id="power-h" className="flex items-center gap-2 text-sm font-bold"><Zap className="h-4 w-4 text-accent" /> Power</h3>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-surface-2 p-2"><dt className="text-[11px] text-muted">Estimated</dt><dd className="font-mono font-semibold">{report.power.estimatedW}W</dd></div>
            <div className="rounded-xl bg-surface-2 p-2"><dt className="text-[11px] text-muted">Recommended</dt><dd className="font-mono font-semibold">{report.power.recommendedW}W+</dd></div>
            <div className="rounded-xl bg-surface-2 p-2">
              <dt className="text-[11px] text-muted">Selected</dt>
              <dd className={cn("font-mono font-semibold", report.power.status === "insufficient" ? "text-bad" : report.power.status === "low" ? "text-warn" : report.power.status === "ok" ? "text-ok" : "")}>
                {report.power.selectedW ? `${report.power.selectedW}W ${report.power.status === "ok" ? "✓" : report.power.status === "low" ? "⚠" : "✕"}` : "—"}
              </dd>
            </div>
          </dl>
          {report.power.selectedW && (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden>
              <div
                className={cn("h-full rounded-full transition-[width] duration-500", report.power.status === "insufficient" ? "bg-bad" : report.power.status === "low" ? "bg-warn" : "bg-ok")}
                style={{ width: `${Math.min(100, (report.power.estimatedW / report.power.selectedW) * 100)}%` }}
              />
            </div>
          )}
          {!compact && (
            <details className="mt-2 text-[13px] text-muted">
              <summary className="cursor-pointer select-none">How we estimate this</summary>
              <ul className="mt-2 space-y-1">
                {report.power.lines.map((l) => <li key={l.label} className="flex justify-between"><span>{l.label}</span><span className="font-mono">{l.watts}W</span></li>)}
              </ul>
            </details>
          )}
        </section>
      )}

      {/* Build score */}
      {score.ready && (
        <section aria-labelledby="score-h" className="rounded-2xl border border-line p-4">
          <h3 id="score-h" className="flex items-center gap-2 text-sm font-bold"><Gauge className="h-4 w-4 text-accent" /> Build analysis</h3>
          <dl className="mt-3 space-y-2.5">
            {score.lines.map((l) => (
              <div key={l.key} className="flex items-start justify-between gap-3 text-sm" title={l.detail}>
                <dt className="text-muted">{l.label}</dt>
                <dd className={cn("text-right font-semibold", l.rating === "excellent" || l.rating === "good" ? "text-ok" : l.rating === "fair" ? "text-warn" : "text-bad")}>
                  {l.rating === "poor" ? "✕" : l.rating === "fair" ? "⚠" : "✓"} {l.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[11px] text-muted">Tiers are our technicians&apos; ratings, not benchmark results.</p>
        </section>
      )}

      {/* Price */}
      <section aria-labelledby="price-h" className="rounded-2xl bg-surface-2 p-4">
        <h3 id="price-h" className="sr-only">Price</h3>
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between"><dt className="text-muted">MRP</dt><dd className="font-mono text-muted line-through">{formatINR(pricing.mrpTotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Discount</dt><dd className="font-mono text-ok">−{formatINR(pricing.discount)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Estimated GST (incl.)</dt><dd className="font-mono text-muted">{formatINR(pricing.gstIncluded)}</dd></div>
          <div className="flex items-baseline justify-between border-t border-line pt-2">
            <dt className="font-semibold">Final estimated price</dt>
            <dd><CountUp value={pricing.total} className="font-mono text-2xl font-bold tracking-tight" /></dd>
          </div>
        </dl>
        <p className="mt-1 text-[11px] text-muted">Includes free assembly & testing. Prices include GST.</p>
      </section>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => onAction("cart")} disabled={empty} className="col-span-2" size="md">
          <ShoppingCart className="h-4 w-4" /> Add Build to Cart
        </Button>
        <Button onClick={() => onAction("quote")} disabled={empty} variant="dark" className="col-span-2">
          <FileText className="h-4 w-4" /> Request a Quote
        </Button>
        <Button onClick={() => onAction("save")} disabled={empty} variant="secondary" size="sm"><Save className="h-4 w-4" /> Save</Button>
        <Button onClick={() => onAction("share")} disabled={empty} variant="secondary" size="sm"><Link2 className="h-4 w-4" /> Share</Button>
        <Button onClick={() => onAction("pdf")} disabled={empty} variant="secondary" size="sm"><Download className="h-4 w-4" /> Quotation PDF</Button>
        <Button onClick={() => onAction("whatsapp")} disabled={empty} variant="whatsapp" size="sm"><WhatsAppIcon className="h-4 w-4" /> WhatsApp</Button>
        <Button onClick={() => onAction("reset")} disabled={empty} variant="ghost" size="sm" className="col-span-2 text-muted"><RotateCcw className="h-4 w-4" /> Reset build</Button>
      </div>
      {empty && (
        <p className="flex items-start gap-2 rounded-xl bg-accent-soft p-3 text-sm text-accent">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" /> Pick your first part, or let us build a balanced PC for your budget.
        </p>
      )}
    </div>
  );
}
