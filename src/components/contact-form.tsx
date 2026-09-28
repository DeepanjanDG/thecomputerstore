"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

export function ContactForm({ topics, defaultTopic, cta = "Send message", prefill = "" }: { topics: string[]; defaultTopic?: string; cta?: string; prefill?: string }) {
  const [f, setF] = useState({ name: "", phone: "", email: "", topic: defaultTopic ?? topics[0], message: prefill });
  const [state, setState] = useState<{ loading?: boolean; error?: string; done?: boolean }>({});
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }));
  if (state.done)
    return (
      <div className="rounded-[24px] border border-line bg-surface p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-ok" />
        <p className="mt-3 text-lg font-bold">Thanks — we&apos;ve got your message.</p>
        <p className="mt-1 text-muted">Our team will reply by phone, WhatsApp or email soon.</p>
      </div>
    );
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setState({ loading: true });
        const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
        const d = await r.json().catch(() => ({}));
        setState(r.ok ? { done: true } : { error: d.error ?? "Couldn't send. Please call us instead." });
      }}
      className="space-y-4 rounded-[24px] border border-line bg-surface p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="cf-name"><Input id="cf-name" required value={f.name} onChange={set("name")} autoComplete="name" /></Field>
        <Field label="Phone" htmlFor="cf-phone"><Input id="cf-phone" type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" /></Field>
        <Field label="Email" htmlFor="cf-email" optional><Input id="cf-email" type="email" value={f.email} onChange={set("email")} autoComplete="email" /></Field>
        <Field label="Topic" htmlFor="cf-topic"><Select id="cf-topic" value={f.topic} onChange={set("topic")}>{topics.map((t) => <option key={t}>{t}</option>)}</Select></Field>
      </div>
      <Field label="Message" htmlFor="cf-msg"><Textarea id="cf-msg" required value={f.message} onChange={set("message")} rows={5} /></Field>
      {state.error && <p role="alert" className="text-sm text-bad">{state.error}</p>}
      <Button type="submit" size="lg" className="w-full uppercase tracking-wide" disabled={state.loading}>
        {state.loading && <Loader2 className="h-4 w-4 animate-spin" />} {cta}
      </Button>
    </form>
  );
}
