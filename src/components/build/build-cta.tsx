"use client";

import { useRouter } from "next/navigation";
import { Check, Copy, FileText, Pencil, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/providers/cart";
import { useBuilder } from "@/components/providers/builder";
import { useToast } from "@/components/providers/toast";
import { WhatsAppIcon } from "@/components/layout/brand-icons";
import { SLOT_META, STEP_ORDER } from "@/lib/compat/slots";
import type { BuildItems, BuildReport } from "@/lib/compat/types";
import { buildWhatsAppMessage, waLink } from "@/lib/whatsapp";

/** Actions on a read-only build: edit in builder, add to cart, request quote, share. */
export function BuildActions({ name, code, items, report, total, shareUrl }: { name: string; code: string | null; items: BuildItems; report: BuildReport; total: number; shareUrl?: string | null }) {
  const cart = useCart();
  const builder = useBuilder();
  const toast = useToast();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const edit = (then?: string) => {
    builder.replace(items, { name, code });
    router.push(then ?? "/pc-builder?step=cpu");
  };
  const addToCart = () => {
    const group = `${name}${code ? ` (${code})` : ""}`;
    cart.addBuild(group, code, STEP_ORDER.filter((s) => items[s]).map((s) => {
      const { product: p, qty } = items[s]!;
      return { productId: p.id, slug: p.slug, name: p.name, brand: p.brand, category: p.categorySlug, price: p.price, mrp: p.mrp, gstRate: p.gstRate, stock: p.stock, qty, image: p.image, slotLabel: SLOT_META[s].label };
    }));
    toast({ tone: "ok", title: "Build added to cart", body: name, action: { label: "View cart", href: "/cart" } });
  };
  const msg = buildWhatsAppMessage({ name, items, total, report, url: shareUrl, intro: shareUrl ? "Hi The Computer Store! I'd like to order this build:" : undefined });

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Button size="lg" onClick={addToCart} className="uppercase tracking-wide"><ShoppingCart className="h-4 w-4" /> Add to Cart</Button>
      <Button size="lg" variant="dark" onClick={() => edit()} className="uppercase tracking-wide"><Pencil className="h-4 w-4" /> Edit Build</Button>
      <Button size="lg" variant="secondary" onClick={() => edit("/pc-builder?step=cpu&action=quote")} className="uppercase tracking-wide"><FileText className="h-4 w-4" /> Request Quote</Button>
      <a href={waLink(msg)} target="_blank" rel="noopener noreferrer" className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#25D366] font-semibold uppercase tracking-wide text-[#062e16]">
        <WhatsAppIcon className="h-5 w-5" /> WhatsApp
      </a>
      {shareUrl && (
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <input readOnly value={shareUrl} aria-label="Share link" className="h-11 min-w-0 flex-1 basis-full rounded-xl sm:basis-0 border border-line bg-surface px-3 font-mono text-sm" onFocus={(e) => e.currentTarget.select()} />
          <Button variant="secondary" onClick={async () => { await navigator.clipboard.writeText(shareUrl); setCopied(true); }}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy link"}</Button>
          <a href={`mailto:?subject=${encodeURIComponent(`Custom PC: ${name}`)}&body=${encodeURIComponent(msg)}`} className="inline-flex h-11 items-center rounded-xl border border-line px-4 text-sm font-semibold hover:bg-surface-2">Email</a>
        </div>
      )}
    </div>
  );
}
