"use client";

import { useState } from "react";
import { Cpu, FileText } from "lucide-react";
import { useBuilder } from "@/components/providers/builder";
import { useCart } from "@/components/providers/cart";
import { Button, LinkButton } from "@/components/ui/button";
import { QuoteDialog } from "@/components/builder/dialogs";
import { BuildTable } from "@/components/build/build-view";
import { ContactForm } from "@/components/contact-form";
import { formatINR } from "@/lib/format";

export function QuoteView({ fromCart }: { fromCart: boolean }) {
  const b = useBuilder();
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const hasBuild = b.ready && Object.keys(b.items).length > 0;
  const cartText = fromCart && cart.items.length
    ? `Please quote for the items in my cart:\n${cart.items.map((i) => `• ${i.qty} × ${i.name} (${formatINR(i.price)})`).join("\n")}\n\nTotal: ${formatINR(cart.subtotal)}`
    : "";

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section aria-labelledby="qb-h" className="space-y-4">
        <h2 id="qb-h" className="flex items-center gap-2 text-xl font-bold"><Cpu className="h-5 w-5 text-accent" /> Quote a custom PC</h2>
        {hasBuild ? (
          <>
            <p className="text-muted">We&apos;ll attach your current build, <strong className="text-ink">{b.name}</strong> ({formatINR(b.pricing.total)}).</p>
            <BuildTable items={b.items} report={b.report} />
            <div className="flex flex-wrap gap-2">
              <Button size="lg" onClick={() => setOpen(true)}><FileText className="h-4 w-4" /> Request quote for this build</Button>
              <LinkButton href="/pc-builder" size="lg" variant="secondary">Edit build</LinkButton>
            </div>
          </>
        ) : (
          <div className="rounded-[24px] border border-dashed border-line-strong p-6">
            <p className="font-semibold">No build yet.</p>
            <p className="mt-1 text-muted">Pick parts in the PC Builder (or let it build one for your budget), then request a quote with every component attached.</p>
            <LinkButton href="/pc-builder" className="mt-4">Open PC Builder</LinkButton>
          </div>
        )}
      </section>
      <section aria-labelledby="qg-h">
        <h2 id="qg-h" className="mb-4 text-xl font-bold">Or tell us what you need</h2>
        <ContactForm
          topics={["Quote request", "Bulk / office order", "Institution / tender", "Other"]}
          defaultTopic={fromCart ? "Quote request" : undefined}
          prefill={cartText}
          cta="Request quote"
        />
      </section>
      <QuoteDialog open={open} onClose={() => setOpen(false)} mode="request" />
    </div>
  );
}
