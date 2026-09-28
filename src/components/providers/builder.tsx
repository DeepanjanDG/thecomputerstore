"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { BuildItems, BuildReport, BuilderProduct, EngineConfig, Pricing, Slot } from "@/lib/compat/types";
import { priceBuild, validateBuild } from "@/lib/compat/service";
import { scoreBuild, type BuildScore } from "@/lib/compat/score";
import { STEP_ORDER, SLOT_META } from "@/lib/compat/slots";

/**
 * Guest-friendly builder state. Lives in localStorage so customers can experiment without
 * an account; the compatibility engine runs locally for instant feedback.
 */
export interface BuilderState {
  items: BuildItems;
  name: string;
  useCase: string | null;
  skipped: Slot[];
  code: string | null;
}

interface BuilderCtx extends BuilderState {
  ready: boolean;
  config: EngineConfig;
  report: BuildReport;
  pricing: Pricing;
  score: BuildScore;
  set: (slot: Slot, product: BuilderProduct, qty?: number) => void;
  setQty: (slot: Slot, qty: number) => void;
  remove: (slot: Slot) => void;
  skip: (slot: Slot) => void;
  unskip: (slot: Slot) => void;
  replace: (items: BuildItems, meta?: Partial<Omit<BuilderState, "items">>) => void;
  rename: (name: string) => void;
  setUseCase: (u: string | null) => void;
  setCode: (code: string | null) => void;
  reset: () => void;
  ref: () => Record<string, [string, number]>;
}

const KEY = "tcs-build-v1";
const EMPTY: BuilderState = { items: {}, name: "My Custom PC", useCase: null, skipped: [], code: null };
const Ctx = createContext<BuilderCtx | null>(null);

export function BuilderProvider({ children, config }: { children: ReactNode; config: EngineConfig }) {
  const [state, setState] = useState<BuilderState>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...EMPTY, ...JSON.parse(raw) });
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state, ready]);

  const set = useCallback((slot: Slot, product: BuilderProduct, qty?: number) => {
    setState((s) => ({
      ...s,
      code: null,
      skipped: s.skipped.filter((x) => x !== slot),
      items: { ...s.items, [slot]: { product: { ...product, slot }, qty: Math.min(qty ?? s.items[slot]?.qty ?? 1, SLOT_META[slot].maxQty) } },
    }));
  }, []);

  const report = useMemo(() => validateBuild(state.items, config), [state.items, config]);
  const pricing = useMemo(() => priceBuild(state.items), [state.items]);
  const score = useMemo(() => scoreBuild(state.items, report, config.scoring), [state.items, report, config.scoring]);

  const value = useMemo<BuilderCtx>(() => ({
    ...state,
    ready,
    config,
    report,
    pricing,
    score,
    set,
    setQty: (slot, qty) =>
      setState((s) => {
        const line = s.items[slot];
        if (!line) return s;
        return { ...s, code: null, items: { ...s.items, [slot]: { ...line, qty: Math.max(1, Math.min(qty, SLOT_META[slot].maxQty)) } } };
      }),
    remove: (slot) =>
      setState((s) => {
        const items = { ...s.items };
        delete items[slot];
        return { ...s, code: null, items };
      }),
    skip: (slot) => setState((s) => ({ ...s, skipped: [...new Set([...s.skipped, slot])] })),
    unskip: (slot) => setState((s) => ({ ...s, skipped: s.skipped.filter((x) => x !== slot) })),
    replace: (items, meta) => setState((s) => ({ ...s, skipped: [], code: null, ...meta, items })),
    rename: (name) => setState((s) => ({ ...s, name: name.slice(0, 80) })),
    setUseCase: (useCase) => setState((s) => ({ ...s, useCase })),
    setCode: (code) => setState((s) => ({ ...s, code })),
    reset: () => setState(EMPTY),
    ref: () =>
      Object.fromEntries(
        STEP_ORDER.filter((s) => state.items[s]).map((s) => [s, [state.items[s]!.product.id, state.items[s]!.qty]]),
      ),
  }), [state, ready, config, report, pricing, score, set]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBuilder() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBuilder must be used inside BuilderProvider");
  return ctx;
}
