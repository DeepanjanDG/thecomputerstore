"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ChevronUp, Cpu, IndianRupee, MonitorPlay, Pencil, Share2, ShieldCheck, Sparkles, Wand2, X, Zap } from "lucide-react";
import { useBuilder } from "@/components/providers/builder";
import { useCart } from "@/components/providers/cart";
import { useToast } from "@/components/providers/toast";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { StatusIcon, StatusPill } from "@/components/ui/status";
import { BuildSummary, type BuildAction } from "./build-summary";
import { OptionsPanel } from "./options-panel";
import { AutoBuildDialog, QuoteDialog, ResetDialog, ShareDialog } from "./dialogs";
import { CountUp } from "./count-up";
import { SLOT_META, STEP_ORDER } from "@/lib/compat/slots";
import type { BuildItems, Slot } from "@/lib/compat/types";
import { buildWhatsAppMessage, waLink } from "@/lib/whatsapp";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface BuilderInitial {
  items: BuildItems;
  name: string;
  useCase?: string | null;
  label: string;
  key: string;
}

type StartMode = "cpu" | "gpu" | null;

export function BuilderApp({
  initial, start, use, step, templates,
}: {
  initial?: BuilderInitial | null;
  start?: "cpu" | "gpu" | "budget" | null;
  use?: string | null;
  step?: Slot | null;
  templates: { slug: string; name: string; tagline: string | null; total: number }[];
}) {
  const b = useBuilder();
  const cart = useCart();
  const toast = useToast();
  const router = useRouter();
  const [active, setActive] = useState<Slot>(step ?? "cpu");
  const [startMode, setStartMode] = useState<StartMode>(start === "cpu" || start === "gpu" ? start : null);
  const [dialog, setDialog] = useState<null | "save" | "share" | "pdf" | "quote" | "auto" | "complete" | "reset" | "sheet">(null);
  const [autoPreset, setAutoPreset] = useState<{ useCase?: string; budget?: number }>({});
  const [editingName, setEditingName] = useState(false);
  const applied = useRef(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const go = useCallback((slot: Slot) => {
    setActive(slot);
    setDialog((d) => (d === "sheet" ? null : d));
    const url = new URL(location.href);
    url.searchParams.set("step", slot);
    history.replaceState(null, "", url);
    const top = mainRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0 || top > 200) window.scrollTo({ top: window.scrollY + top - 90, behavior: "smooth" });
  }, []);

  // Apply URL-driven entry points once the local build has loaded.
  useEffect(() => {
    if (!b.ready || applied.current) return;
    applied.current = true;
    const action = new URLSearchParams(location.search).get("action");
    if (action === "quote" || action === "pdf" || action === "share") setDialog(action);
    if (initial) {
      b.replace(initial.items, { name: initial.name, useCase: initial.useCase ?? null });
      toast({ tone: "ok", title: initial.label, body: "Change any part — compatibility updates instantly." });
      const first = step ?? "cpu";
      setActive(first);
      router.replace(`/pc-builder?step=${first}`, { scroll: false });
      return;
    }
    if (start === "budget" || use) {
      setAutoPreset({ useCase: use ?? undefined });
      setDialog("auto");
      if (use) b.setUseCase(use);
    }
    if (start === "gpu" || start === "cpu") setActive(start);
    else if (!step && b.report.nextSlot) setActive(b.report.nextSlot);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b.ready]);

  const act = async (a: BuildAction) => {
    if (a === "save" || a === "share" || a === "pdf" || a === "quote" || a === "reset") return setDialog(a);
    if (a === "cart") {
      let code = b.code;
      try {
        if (!code) {
          const r = await fetch("/api/builds", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ build: b.ref(), name: b.name, useCase: b.useCase }) });
          if (r.ok) { code = (await r.json()).code; b.setCode(code); }
        }
      } catch {}
      const group = `${b.name}${code ? ` (${code})` : ""}`;
      cart.addBuild(group, code, STEP_ORDER.filter((s) => b.items[s]).map((s) => {
        const { product: p, qty } = b.items[s]!;
        return { productId: p.id, slug: p.slug, name: p.name, brand: p.brand, category: p.categorySlug, price: p.price, mrp: p.mrp, gstRate: p.gstRate, stock: p.stock, qty, image: p.image, slotLabel: SLOT_META[s].label };
      }));
      toast({ tone: "ok", title: "Build added to cart", body: `${Object.keys(b.items).length} components · ${formatINR(b.pricing.total)}`, action: { label: "View cart", href: "/cart" } });
      return;
    }
    if (a === "whatsapp") {
      const w = window.open("", "_blank");
      let url: string | null = null;
      try {
        let code = b.code;
        if (!code) {
          const r = await fetch("/api/builds", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ build: b.ref(), name: b.name, useCase: b.useCase }) });
          if (r.ok) { code = (await r.json()).code; b.setCode(code); }
        }
        if (code) url = `${location.origin}/build/${code}`;
      } catch {}
      const link = waLink(buildWhatsAppMessage({ name: b.name, items: b.items, total: b.pricing.total, report: b.report, url }));
      if (w) w.location.href = link;
      else location.href = link;
    }
  };

  const onAutoDone = (items: BuildItems, meta: { name: string; useCase: string; notes: string[] }) => {
    b.replace(items, { name: meta.name, useCase: meta.useCase });
    setStartMode(null);
    toast({ tone: "ok", title: "Your build is ready", body: meta.notes[0] ?? "Every part is compatible and in stock. Change anything you like." });
    go("cpu");
  };

  const empty = Object.keys(b.items).length === 0;
  const coreDone = b.report.core.selected + b.report.core.notNeeded.length;
  const lockedForComplete = startMode && b.items[startMode] ? { [startMode]: [b.items[startMode]!.product.id, 1] as [string, number] } : undefined;

  const banner = startMode ? (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent-soft p-4">
      <p className="flex items-start gap-3 text-sm">
        {startMode === "gpu" ? <MonitorPlay className="mt-0.5 h-5 w-5 shrink-0 text-accent" /> : <Cpu className="mt-0.5 h-5 w-5 shrink-0 text-accent" />}
        <span>
          <strong className="block text-ink">{b.items[startMode] ? `Great — let's build around your ${SLOT_META[startMode].short}.` : `Start with your ${startMode === "gpu" ? "graphics card" : "processor"}.`}</strong>
          <span className="text-muted">{b.items[startMode] ? "We'll recommend a compatible CPU, motherboard, RAM, PSU, cabinet and cooler." : `Pick the ${SLOT_META[startMode].short} you have or want — everything else will be matched to it.`}</span>
        </span>
      </p>
      <div className="flex gap-2">
        {b.items[startMode] && <Button size="sm" onClick={() => setDialog("complete")}><Wand2 className="h-4 w-4" /> Complete my build</Button>}
        <Button size="icon-sm" variant="ghost" onClick={() => setStartMode(null)} aria-label="Dismiss"><X className="h-4 w-4" /></Button>
      </div>
    </div>
  ) : empty && b.ready ? (
    <StartPanel templates={templates} onAuto={() => { setAutoPreset({}); setDialog("auto"); }} onStart={(m) => { setStartMode(m); go(m); }} />
  ) : null;

  return (
    <>
    {/* Page banner */}
    <section className="hero-wash border-b border-line/60">
      <div className="container-x grid items-center gap-6 py-8 lg:grid-cols-[1fr_auto] lg:py-10">
        <div className="min-w-0">
          <h1 className="text-[34px] font-extrabold leading-tight tracking-tight sm:text-[42px]">Custom PC Builder</h1>
          <p className="mt-2 max-w-xl text-ink-2">Choose each component and create a PC that fits your needs. We&apos;ll check compatibility, show live pricing and estimate power usage.</p>
          <div className="mt-4 flex min-w-0 flex-wrap items-center gap-2">
            {editingName ? (
              <form onSubmit={(e) => { e.preventDefault(); setEditingName(false); }} className="flex items-center gap-2">
                <input autoFocus value={b.name} onChange={(e) => b.rename(e.target.value)} onBlur={() => setEditingName(false)} className="rounded-lg border border-accent bg-surface px-2 py-1 font-bold outline-none" aria-label="Build name" maxLength={80} />
                <button type="submit" aria-label="Save name"><Check className="h-5 w-5 text-accent" /></button>
              </form>
            ) : (
              <button onClick={() => setEditingName(true)} className="group flex max-w-full items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-bold shadow-sm" aria-label="Rename build">
                <Cpu className="h-4 w-4 text-accent" /><span className="truncate">{b.name}</span> <Pencil className="h-3.5 w-3.5 text-muted group-hover:text-accent" />
              </button>
            )}
            <Button variant="secondary" size="sm" onClick={() => { setAutoPreset({ useCase: b.useCase ?? undefined }); setDialog("auto"); }}>
              <Sparkles className="h-4 w-4" /> Build it for me
            </Button>
            <Link href="/builds" className="rounded-lg px-3 py-2 text-sm font-semibold text-accent hover:underline">Templates</Link>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-2 lg:w-[440px]">
          {[
            { icon: ShieldCheck, t: "Compatibility Check", d: "No wrong parts" },
            { icon: IndianRupee, t: "Live Pricing", d: "Real-time updates" },
            { icon: Zap, t: "Estimated Wattage", d: "Know your power needs" },
            { icon: Share2, t: "Save & Share", d: "Share your build" },
          ].map((f) => (
            <li key={f.t} className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3 py-2.5 shadow-sm">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><f.icon className="h-4 w-4" /></span>
              <span className="min-w-0">
                <span className="block text-[12.5px] font-semibold leading-tight">{f.t}</span>
                <span className="block text-[11px] text-muted">{f.d}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>

    <div className="container-x pb-32 pt-6 lg:pb-16">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[220px_minmax(0,1fr)_340px] xl:gap-6">
        {/* Step rail */}
        <nav aria-label="Build steps" className="sticky top-[134px] hidden max-h-[calc(100dvh-150px)] self-start overflow-y-auto rounded-[16px] border border-line bg-surface p-2.5 shadow-sm xl:block">
          <StepList active={active} onGo={go} />
        </nav>

        <div ref={mainRef} className="min-w-0">
          {/* Horizontal steps for smaller screens */}
          <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 xl:hidden" role="tablist" aria-label="Build steps">
            {STEP_ORDER.map((s, i) => {
              const line = b.items[s];
              const bad = b.report.errors.some((r) => r.slots.includes(s));
              return (
                <button
                  key={s}
                  role="tab"
                  aria-selected={active === s}
                  onClick={() => go(s)}
                  className={cn("flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors", active === s ? "border-accent bg-accent text-white" : "border-line bg-surface text-ink-2")}
                >
                  {line ? <StatusIcon status={bad ? "incompatible" : "compatible"} className={active === s ? "text-white" : ""} /> : <span className="font-mono text-xs opacity-60">{i + 1}</span>}
                  {SLOT_META[s].short}
                </button>
              );
            })}
          </div>
          <OptionsPanel slot={active} onNavigate={go} banner={banner} />
        </div>

        <aside aria-label="Your build" className="sticky top-[134px] hidden max-h-[calc(100dvh-150px)] self-start overflow-y-auto rounded-[16px] border border-line bg-surface p-5 shadow-soft lg:block">
          <BuildSummary onGo={go} onAction={act} />
        </aside>
      </div>

      {/* Mobile sticky bar */}
      <div className="glass fixed inset-x-0 bottom-0 z-40 border-t border-line px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <CountUp value={b.pricing.total} className="block font-mono text-lg font-bold leading-tight" />
            <p className="flex items-center gap-2 whitespace-nowrap text-xs text-muted">
              <span>{coreDone}/{b.report.core.total} selected</span>
              <StatusPill status={b.report.status} className="px-2 py-0.5 text-[11px]" label={b.report.status === "empty" ? "Not started" : undefined} />
            </p>
          </div>
          <Button onClick={() => setDialog("sheet")} size="md">
            View Build <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={dialog === "sheet"} onClose={() => setDialog(null)} title="Your build" side="bottom">
        <BuildSummary onGo={go} onAction={(a) => { setDialog(null); setTimeout(() => act(a), 50); }} compact />
      </Dialog>
      <ShareDialog open={dialog === "save" || dialog === "share"} mode={dialog === "save" ? "save" : "share"} onClose={() => setDialog(null)} />
      <QuoteDialog open={dialog === "quote" || dialog === "pdf"} mode={dialog === "pdf" ? "pdf" : "request"} onClose={() => setDialog(null)} />
      <AutoBuildDialog open={dialog === "auto"} onClose={() => setDialog(null)} preset={autoPreset} onDone={onAutoDone} />
      <AutoBuildDialog open={dialog === "complete"} onClose={() => setDialog(null)} preset={{ useCase: b.useCase ?? "gaming" }} locked={lockedForComplete} onDone={onAutoDone} />
      <ResetDialog open={dialog === "reset"} onClose={() => setDialog(null)} onConfirm={() => { b.reset(); go("cpu"); }} />
    </div>
    </>
  );
}

function StepList({ active, onGo }: { active: Slot; onGo: (s: Slot) => void }) {
  const b = useBuilder();
  const groups = [...new Set(STEP_ORDER.map((s) => SLOT_META[s].group))];
  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g}>
          <p className="mb-1.5 px-2.5 pt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{g}</p>
          <ol className="grid grid-cols-2 gap-1.5">
            {STEP_ORDER.filter((s) => SLOT_META[s].group === g).map((s) => {
              const line = b.items[s];
              const err = b.report.errors.some((r) => r.slots.includes(s));
              const warn = b.report.warnings.some((r) => r.slots.includes(s));
              const notNeeded = b.report.core.notNeeded.includes(s);
              const skipped = b.skipped.includes(s);
              return (
                <li key={s}>
                  <button
                    onClick={() => onGo(s)}
                    aria-current={active === s ? "step" : undefined}
                    title={SLOT_META[s].label}
                    className={cn("group flex w-full flex-col items-start gap-1.5 rounded-xl border px-2 py-2 text-left transition-colors", active === s ? "border-accent/60 bg-accent-soft" : "border-transparent hover:bg-surface-2")}
                  >
                    <span className={cn(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11px] font-bold",
                      line ? (err ? "border-bad bg-bad text-white" : warn ? "border-warn bg-warn text-white" : "border-ok bg-ok text-white") : active === s ? "border-accent bg-accent text-white" : "border-line bg-surface-2 text-ink-2",
                    )} aria-hidden>
                      {line ? (err ? "✕" : warn ? "!" : "✓") : STEP_ORDER.indexOf(s) + 1}
                    </span>
                    <span className="min-w-0 w-full">
                      <span className={cn("block truncate text-[13px] leading-tight", active === s ? "font-bold text-accent" : "font-semibold")}>{SLOT_META[s].label}</span>
                      <span className="block truncate text-[11px] leading-tight text-muted">
                        {line ? line.product.name : notNeeded ? "Not needed" : skipped ? "Skipped" : SLOT_META[s].core ? "Required" : "Optional"}
                      </span>
                    </span>
                    <span className="sr-only">{line ? (err ? "Incompatible" : warn ? "Warning" : "Compatible") : "Not selected"}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}

function StartPanel({ templates, onAuto, onStart }: { templates: { slug: string; name: string; tagline: string | null; total: number }[]; onAuto: () => void; onStart: (m: "cpu" | "gpu") => void }) {
  return (
    <div className="stage mt-5 overflow-hidden rounded-[14px] border border-accent/10 p-5 sm:p-6">
      <p className="font-bold">How would you like to start?</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <button onClick={() => onStart("cpu")} className="rounded-2xl border border-line bg-surface p-4 text-left transition-colors hover:border-accent">
          <Cpu className="h-5 w-5 text-accent" />
          <p className="mt-2 font-semibold">Start with a CPU</p>
          <p className="text-sm text-muted">Everything else is matched to it.</p>
        </button>
        <button onClick={() => onStart("gpu")} className="rounded-2xl border border-line bg-surface p-4 text-left transition-colors hover:border-accent">
          <MonitorPlay className="h-5 w-5 text-accent" />
          <p className="mt-2 font-semibold">Start with a GPU</p>
          <p className="text-sm text-muted">Already have one? Build around it.</p>
        </button>
        <button onClick={onAuto} className="rounded-2xl border border-accent/40 bg-accent-soft p-4 text-left transition-colors hover:border-accent">
          <Wand2 className="h-5 w-5 text-accent" />
          <p className="mt-2 font-semibold">Start with a budget</p>
          <p className="text-sm text-muted">We&apos;ll build it for you.</p>
        </button>
      </div>
      {templates.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Or customise a template</p>
          <div className="no-scrollbar -mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
            {templates.map((t) => (
              <Link key={t.slug} href={`/pc-builder?template=${t.slug}`} className="shrink-0 rounded-xl border border-line bg-surface px-3 py-2 text-sm transition-colors hover:border-accent">
                <span className="font-semibold">{t.name}</span> <span className="font-mono text-muted">{formatINR(t.total)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
      <p className="mt-4 flex items-center gap-1 text-sm text-muted">Or just pick a processor below <ArrowRight className="h-3.5 w-3.5" /></p>
    </div>
  );
}
