"use client";

import Link from "next/link";
import { Cpu } from "lucide-react";
import { useBuilder } from "@/components/providers/builder";
import { StatusIcon, StatusPill } from "@/components/ui/status";
import { evaluateCandidate } from "@/lib/compat/service";
import { SLOT_META } from "@/lib/compat/slots";
import type { BuilderProduct } from "@/lib/compat/types";

/** "Compatible with your current build" — runs the compatibility engine locally against the saved build. */
export function BuildFit({ product }: { product: BuilderProduct }) {
  const b = useBuilder();
  if (!b.ready) return null;
  const others = { ...b.items };
  delete others[product.slot];
  if (Object.keys(others).length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong p-4 text-sm">
        <p className="flex items-center gap-2 font-semibold"><Cpu className="h-4 w-4 text-accent" /> Building a PC?</p>
        <p className="mt-1 text-muted">Add this to the builder and we&apos;ll check it against every other part you choose.</p>
      </div>
    );
  }
  const v = evaluateCandidate(others, product.slot, product, b.config);
  const current = b.items[product.slot];
  return (
    <section aria-labelledby="fit-h" className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id="fit-h" className="text-sm font-bold">Your current build: <span className="font-normal text-muted">{b.name}</span></h2>
        <StatusPill status={v.status} label={v.status === "compatible" ? "Compatible with your build" : undefined} />
      </div>
      <ul className="mt-3 space-y-2 text-sm">
        {v.issues.map((r, i) => (
          <li key={i} className="flex items-start gap-2">
            <StatusIcon status={r.status} className="mt-0.5" />
            <span>{r.message}{r.suggestion && <span className="block text-muted">{r.suggestion}</span>}</span>
          </li>
        ))}
        {v.issues.length === 0 && v.passes.slice(0, 3).map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-muted"><StatusIcon status="compatible" className="mt-0.5" /> {r.message}</li>
        ))}
      </ul>
      {current && current.product.id !== product.id && (
        <p className="mt-3 text-xs text-muted">Adding this replaces <strong className="text-ink">{current.product.name}</strong> as your {SLOT_META[product.slot].label.toLowerCase()}.</p>
      )}
      <Link href={`/pc-builder?step=${product.slot}`} className="mt-3 inline-block text-sm font-semibold text-accent hover:underline">Open your build →</Link>
    </section>
  );
}
