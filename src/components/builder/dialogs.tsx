"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, CheckCircle2, Copy, Download, Loader2, Mail, Sparkles } from "lucide-react";
import { useBuilder } from "@/components/providers/builder";
import { useSessionUser } from "@/components/providers/session";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { WhatsAppIcon } from "@/components/layout/brand-icons";
import { USE_CASES } from "@/content/use-cases";
import { buildWhatsAppMessage, waLink } from "@/lib/whatsapp";
import { formatINR } from "@/lib/format";
import type { BuildItems } from "@/lib/compat/types";
import { cn } from "@/lib/utils";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
  return data as T;
}

/** Saves the current build (if not already saved) and returns its share code. */
export function useSaveBuild() {
  const b = useBuilder();
  return async () => {
    if (b.code) return { code: b.code, url: `${location.origin}/build/${b.code}` };
    const res = await postJson<{ code: string; url: string }>("/api/builds", { build: b.ref(), name: b.name, useCase: b.useCase });
    b.setCode(res.code);
    return { code: res.code, url: `${location.origin}/build/${res.code}` };
  };
}

export function ShareDialog({ open, onClose, mode }: { open: boolean; onClose: () => void; mode: "save" | "share" }) {
  const b = useBuilder();
  const user = useSessionUser();
  const [state, setState] = useState<{ url?: string; code?: string; error?: string; loading?: boolean }>({});
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState(b.name);

  useEffect(() => {
    if (!open) return;
    setName(b.name);
    setCopied(false);
    if (b.code) setState({ code: b.code, url: `${location.origin}/build/${b.code}` });
    else setState({});
  }, [open, b.code, b.name]);

  const run = async () => {
    setState({ loading: true });
    try {
      if (name !== b.name) b.rename(name);
      const res = b.code ? { code: b.code, url: `${location.origin}/build/${b.code}` } : await postJson<{ code: string }>("/api/builds", { build: b.ref(), name, useCase: b.useCase }).then((r) => {
        b.setCode(r.code);
        return { code: r.code, url: `${location.origin}/build/${r.code}` };
      });
      setState(res);
    } catch (e) {
      setState({ error: (e as Error).message });
    }
  };

  const msg = state.url ? buildWhatsAppMessage({ name: b.name, items: b.items, total: b.pricing.total, report: b.report, url: state.url, intro: "Check out my custom PC build from The Computer Store:" }) : "";

  return (
    <Dialog open={open} onClose={onClose} title={mode === "save" ? "Save your build" : "Share your build"} description={user ? "Saved builds appear in your account under My Builds." : "Anyone with the link can view and edit a copy. Sign in to keep builds in your account."}>
      {!state.url ? (
        <form onSubmit={(e) => { e.preventDefault(); run(); }} className="space-y-4">
          <Field label="Build name" htmlFor="build-name">
            <Input id="build-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
          </Field>
          {state.error && <p role="alert" className="text-sm text-bad">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={state.loading}>
            {state.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {mode === "save" ? "Save build" : "Create share link"}
          </Button>
          {!user && <p className="text-center text-sm text-muted"><Link href="/login?next=/pc-builder" className="font-semibold text-accent">Sign in</Link> to save builds permanently to your account.</p>}
        </form>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-2xl bg-ok-soft p-4 text-ok">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <p className="text-sm font-semibold">Saved as <span className="font-mono">{state.code}</span>{user ? " · added to My Builds" : ""}</p>
          </div>
          <div className="flex gap-2">
            <Input value={state.url} readOnly aria-label="Share link" onFocus={(e) => e.currentTarget.select()} className="font-mono text-sm" />
            <Button variant="secondary" onClick={async () => { await navigator.clipboard.writeText(state.url!); setCopied(true); }} aria-label="Copy link">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] font-semibold text-[#062e16]">
              <WhatsAppIcon className="h-5 w-5" /> WhatsApp
            </a>
            <a href={`mailto:?subject=${encodeURIComponent(`My custom PC build: ${b.name}`)}&body=${encodeURIComponent(msg)}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line font-semibold hover:bg-surface-2">
              <Mail className="h-5 w-5" /> Email
            </a>
          </div>
          <Link href={`/build/${state.code}`} className="block text-center text-sm font-semibold text-accent hover:underline">Open the shared build page →</Link>
        </div>
      )}
    </Dialog>
  );
}

export function QuoteDialog({ open, onClose, mode }: { open: boolean; onClose: () => void; mode: "request" | "pdf" }) {
  const b = useBuilder();
  const user = useSessionUser();
  const [form, setForm] = useState({ name: user?.name ?? "", phone: "", email: user?.email ?? "", city: "Shillong", contactMethod: "whatsapp", buildName: b.name, requirements: "", budget: "" });
  const [state, setState] = useState<{ loading?: boolean; error?: string; done?: { number: string; pdfUrl: string } }>({});
  useEffect(() => { if (open) setState({}); }, [open]);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ loading: true });
    try {
      let code = b.code;
      if (!code) {
        const saved = await postJson<{ code: string }>("/api/builds", { build: b.ref(), name: form.buildName || b.name, useCase: b.useCase });
        b.setCode(saved.code);
        code = saved.code;
      }
      const res = await postJson<{ number: string; pdfUrl: string }>("/api/quotes", {
        build: b.ref(),
        source: mode === "pdf" ? "DOWNLOAD" : "REQUEST",
        name: form.name,
        phone: form.phone,
        email: form.email,
        city: form.city,
        contactMethod: form.contactMethod,
        buildName: form.buildName,
        requirements: form.requirements,
        budget: form.budget ? Number(form.budget) : undefined,
        buildCode: code,
      });
      setState({ done: res });
      if (mode === "pdf") window.location.href = res.pdfUrl;
    } catch (err) {
      setState({ error: (err as Error).message });
    }
  };

  const items = Object.keys(b.items).length;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={mode === "pdf" ? "Download quotation" : "Request a quote"}
      description={mode === "pdf" ? "We'll put your name on a professional PDF quotation for this build." : "Our team will confirm stock and pricing, and get back to you — usually within a few working hours."}
    >
      {state.done ? (
        <div className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-ok" />
          <p className="text-lg font-bold">{mode === "pdf" ? "Your quotation is ready" : "Quote request received"}</p>
          <p className="text-muted">Reference <span className="font-mono font-semibold text-ink">{state.done.number}</span>. {mode === "request" && "We'll contact you shortly."}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <a href={state.done.pdfUrl} className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 font-semibold text-white"><Download className="h-4 w-4" /> Download PDF</a>
            <a href={waLink(`Hi! I've just requested quote ${state.done.number} for "${form.buildName}" (${formatINR(b.pricing.total)}).`)} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#25D366] px-5 font-semibold text-[#062e16]"><WhatsAppIcon className="h-4 w-4" /> Follow up on WhatsApp</a>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl bg-surface-2 p-3 text-sm">
            <span><strong>{items}</strong> components attached</span>
            <span className="font-mono font-semibold">{formatINR(b.pricing.total)}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="q-name"><Input id="q-name" required value={form.name} onChange={set("name")} autoComplete="name" /></Field>
            <Field label="Phone" htmlFor="q-phone" optional={mode === "pdf"}><Input id="q-phone" type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" placeholder="+91" required={mode === "request" && !form.email} /></Field>
            <Field label="Email" htmlFor="q-email" optional><Input id="q-email" type="email" value={form.email} onChange={set("email")} autoComplete="email" /></Field>
            <Field label="City" htmlFor="q-city" optional><Input id="q-city" value={form.city} onChange={set("city")} autoComplete="address-level2" /></Field>
          </div>
          {mode === "request" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Preferred contact" htmlFor="q-contact">
                  <Select id="q-contact" value={form.contactMethod} onChange={set("contactMethod")}>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Phone call</option>
                    <option value="email">Email</option>
                  </Select>
                </Field>
                <Field label="Budget (₹)" htmlFor="q-budget" optional><Input id="q-budget" inputMode="numeric" value={form.budget} onChange={set("budget")} placeholder="e.g. 100000" /></Field>
              </div>
              <Field label="Build name" htmlFor="q-build"><Input id="q-build" value={form.buildName} onChange={set("buildName")} /></Field>
              <Field label="Additional requirements" htmlFor="q-req" optional>
                <Textarea id="q-req" value={form.requirements} onChange={set("requirements")} placeholder="e.g. need it by the 15th, white theme, Windows installed, delivery to Tura…" />
              </Field>
            </>
          )}
          {state.error && <p role="alert" className="text-sm text-bad">{state.error}</p>}
          <Button type="submit" size="lg" className="w-full uppercase tracking-wide" disabled={state.loading}>
            {state.loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "pdf" ? "Generate PDF quotation" : "Request quote"}
          </Button>
        </form>
      )}
    </Dialog>
  );
}

export function AutoBuildDialog({ open, onClose, preset, locked, onDone }: {
  open: boolean;
  onClose: () => void;
  preset?: { useCase?: string; budget?: number };
  locked?: Record<string, [string, number]>;
  onDone: (items: BuildItems, meta: { name: string; useCase: string; notes: string[] }) => void;
}) {
  const [useCase, setUseCase] = useState(preset?.useCase ?? "gaming");
  const [budget, setBudget] = useState(String(preset?.budget ?? USE_CASES.find((u) => u.id === (preset?.useCase ?? "gaming"))?.defaultBudget ?? 80000));
  const [resolution, setResolution] = useState("1440p");
  const [cpuBrand, setCpu] = useState("any");
  const [gpuBrand, setGpu] = useState("any");
  const [storage, setStorage] = useState("1000");
  const [state, setState] = useState<{ loading?: boolean; error?: string }>({});
  useEffect(() => {
    if (!open) return;
    setState({});
    if (preset?.useCase) setUseCase(preset.useCase);
    if (preset?.budget) setBudget(String(preset.budget));
  }, [open, preset?.useCase, preset?.budget]);

  const lockedNames = locked ? Object.keys(locked) : [];
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ loading: true });
    try {
      const res = await postJson<{ items: BuildItems; notes: string[]; total: number }>("/api/builder/auto", {
        budget: budget ? Number(budget.replace(/[^\d]/g, "")) : undefined,
        useCase,
        resolution: useCase === "gaming" ? resolution : undefined,
        cpuBrand, gpuBrand,
        storageGb: Number(storage),
        locked,
      });
      const uc = USE_CASES.find((u) => u.id === useCase)!;
      onDone(res.items, { name: `${uc.title} PC · ${formatINR(res.total)}`, useCase, notes: res.notes });
      onClose();
    } catch (err) {
      setState({ error: (err as Error).message });
    }
  };

  const Opt = ({ value, cur, set, children }: { value: string; cur: string; set: (v: string) => void; children: React.ReactNode }) => (
    <button type="button" onClick={() => set(value)} aria-pressed={cur === value} className={cn("rounded-xl border px-3 py-2 text-sm font-semibold transition-colors", cur === value ? "border-accent bg-accent-soft text-accent" : "border-line hover:border-line-strong")}>
      {children}
    </button>
  );

  return (
    <Dialog open={open} onClose={onClose} title={lockedNames.length ? "Complete my build" : "Build it for me"} description={lockedNames.length ? `We'll pick compatible parts around your ${lockedNames.join(" & ").toUpperCase()} using products in stock.` : "Tell us your budget and what you'll do. We'll pick compatible, in-stock parts — you can change anything after."}>
      <form onSubmit={submit} className="space-y-5">
        <Field label={lockedNames.length ? "Total budget (₹) — optional" : "Budget (₹)"} htmlFor="ab-budget">
          <Input id="ab-budget" inputMode="numeric" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="80000" required={!lockedNames.length} className="font-mono text-lg" />
        </Field>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Use case</legend>
          <div className="flex flex-wrap gap-2">{USE_CASES.map((u) => <Opt key={u.id} value={u.id} cur={useCase} set={setUseCase}>{u.emoji} {u.title}</Opt>)}</div>
        </fieldset>
        {useCase === "gaming" && (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Resolution</legend>
            <div className="flex flex-wrap gap-2">{["1080p", "1440p", "4K"].map((r) => <Opt key={r} value={r} cur={resolution} set={setResolution}>{r}</Opt>)}</div>
          </fieldset>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          {!locked?.cpu && (
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Processor</legend>
              <div className="flex flex-wrap gap-2">{[["any", "No preference"], ["AMD", "AMD"], ["Intel", "Intel"]].map(([v, l]) => <Opt key={v} value={v} cur={cpuBrand} set={setCpu}>{l}</Opt>)}</div>
            </fieldset>
          )}
          {!locked?.gpu && useCase !== "home" && useCase !== "productivity" && (
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Graphics</legend>
              <div className="flex flex-wrap gap-2">{[["any", "No preference"], ["NVIDIA", "NVIDIA"], ["AMD", "AMD"]].map(([v, l]) => <Opt key={v} value={v} cur={gpuBrand} set={setGpu}>{l}</Opt>)}</div>
            </fieldset>
          )}
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Storage</legend>
          <div className="flex flex-wrap gap-2">{[["500", "500GB"], ["1000", "1TB"], ["2000", "2TB"]].map(([v, l]) => <Opt key={v} value={v} cur={storage} set={setStorage}>{l}</Opt>)}</div>
        </fieldset>
        {state.error && <p role="alert" className="text-sm text-bad">{state.error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={state.loading}>
          {state.loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />} {state.loading ? "Finding the best combination…" : "Generate my build"}
        </Button>
        <p className="text-center text-xs text-muted">Only uses products that are in stock at our store. Replaces your current build{lockedNames.length ? " (keeping your chosen parts)" : ""}.</p>
      </form>
    </Dialog>
  );
}

export function ResetDialog({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="Reset this build?" description="All selected parts will be removed. Saved share links keep working.">
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Keep building</Button>
        <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>Reset build</Button>
      </div>
    </Dialog>
  );
}
