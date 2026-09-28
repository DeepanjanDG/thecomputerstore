"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Cpu, FileText, Minus, Plus, ShieldCheck, ShoppingBag, Tag, Trash2, Wrench } from "lucide-react";
import { useCart, type CartItem } from "@/components/providers/cart";
import { useBuilder } from "@/components/providers/builder";
import { Button, LinkButton } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status";
import { ProductArt } from "@/components/product/product-art";
import { validateBuild } from "@/lib/compat/service";
import type { BuildItems, BuildReport } from "@/lib/compat/types";
import { formatINR } from "@/lib/format";

export function CartView() {
  const cart = useCart();
  const builder = useBuilder();
  const router = useRouter();
  const [reports, setReports] = useState<Record<string, { report: BuildReport; items: BuildItems }>>({});

  // Refresh prices/stock from the server — the cart lives in the browser.
  useEffect(() => {
    if (!cart.ready || !cart.items.length) return;
    fetch("/api/cart/price", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [...new Set(cart.items.map((i) => i.productId))] }) })
      .then((r) => r.json())
      .then((d) => d.prices && cart.refresh(d.prices))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.ready]);

  const groups = useMemo(() => {
    const m = new Map<string, CartItem[]>();
    for (const i of cart.items) if (i.buildGroup) m.set(i.buildGroup, [...(m.get(i.buildGroup) ?? []), i]);
    return [...m.entries()];
  }, [cart.items]);
  const singles = cart.items.filter((i) => !i.buildGroup);

  // Compatibility for custom PC builds in the cart
  useEffect(() => {
    for (const [g, list] of groups) {
      const code = list[0].buildCode;
      if (!code || reports[g]) continue;
      fetch(`/api/builds/${code}`).then((r) => (r.ok ? r.json() : null)).then((d) => {
        if (d?.items) setReports((all) => ({ ...all, [g]: { items: d.items, report: validateBuild(d.items, builder.config) } }));
      }).catch(() => {});
    }
  }, [groups, reports, builder.config]);

  if (!cart.ready) return <div className="skeleton h-64" />;
  if (!cart.items.length)
    return (
      <>
      <h1 className="mb-6 text-[30px] font-extrabold tracking-tight">Your Cart</h1>
      <div className="rounded-[20px] border border-line bg-surface p-12 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted" />
        <h2 className="mt-4 text-2xl font-bold">Your cart is empty.</h2>
        <p className="mt-2 text-muted">Start a custom PC or browse components, laptops and accessories.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <LinkButton href="/pc-builder"><Cpu className="h-4 w-4" /> Build Your PC</LinkButton>
          <LinkButton href="/shop" variant="secondary">Shop all products</LinkButton>
        </div>
      </div>
      </>
    );

  const mrp = cart.items.reduce((s, i) => s + Math.max(i.mrp, i.price) * i.qty, 0);
  const gst = cart.items.reduce((s, i) => s + (i.price * i.qty * i.gstRate) / (100 + i.gstRate), 0);
  const outOfStock = cart.items.filter((i) => i.stock < i.qty);

  return (
    <>
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-5">
        <div className="flex items-end justify-between gap-3">
          <h1 className="text-[30px] font-extrabold tracking-tight">
            Your Cart <span className="text-lg font-semibold text-muted">({cart.count} {cart.count === 1 ? "item" : "items"})</span>
          </h1>
          <button
            onClick={() => { if (confirm("Remove everything from your cart?")) cart.clear(); }}
            className="text-sm font-semibold text-bad hover:underline"
          >
            Clear Cart
          </button>
        </div>
        {groups.map(([g, list]) => {
          const total = list.reduce((s, i) => s + i.price * i.qty, 0);
          const r = reports[g];
          return (
            <section key={g} className="overflow-hidden rounded-[16px] border border-line bg-surface shadow-sm" aria-label={`Custom PC build ${g}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-accent-soft px-5 py-4">
                <div className="flex items-center gap-3">
                  <Cpu className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Custom PC Build</p>
                    <p className="font-bold">{g}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {r && <StatusPill status={r.report.status} />}
                  <span className="font-mono text-lg font-bold">{formatINR(total)}</span>
                </div>
              </div>
              <ul className="divide-y divide-line">
                {list.map((i) => (
                  <li key={i.productId} className="flex items-center gap-3 px-5 py-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-surface-2 p-1"><ProductArt category={i.category} brand={i.brand} /></span>
                    <div className="min-w-0 flex-1">
                      {i.slotLabel && <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">{i.slotLabel}</p>}
                      <Link href={`/product/${i.slug}`} className="block truncate text-sm font-semibold hover:text-accent">{i.name}{i.qty > 1 ? ` × ${i.qty}` : ""}</Link>
                      {i.stock < i.qty && <p className="text-xs font-semibold text-bad">Only {i.stock} in stock</p>}
                    </div>
                    <span className="font-mono text-sm">{formatINR(i.price * i.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-sm">
                <span className="flex items-center gap-2 text-muted"><Wrench className="h-4 w-4" /> Free assembly, cable management & stress test</span>
                <div className="flex gap-2">
                  {r && (
                    <Button size="sm" variant="ghost" onClick={() => { builder.replace(r.items, { name: g.replace(/\s*\(TC-[A-Z0-9]+\)$/, ""), code: list[0].buildCode ?? null }); router.push("/pc-builder?step=cpu"); }}>
                      Edit in builder
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="text-bad" onClick={() => cart.removeGroup(g)}><Trash2 className="h-4 w-4" /> Remove build</Button>
                </div>
              </div>
            </section>
          );
        })}

        {singles.length > 0 && (
          <section className="overflow-hidden rounded-[16px] border border-line bg-surface shadow-sm" aria-label="Products">
            <ul className="divide-y divide-line">
              {singles.map((i) => (
                <li key={i.productId} className="grid grid-cols-[72px_1fr] items-center gap-x-4 gap-y-3 p-4 sm:grid-cols-[80px_1fr_auto_auto_auto] sm:p-5">
                  <Link href={`/product/${i.slug}`} className="relative grid h-[72px] w-[72px] place-items-center overflow-hidden rounded-[10px] bg-surface-2 p-1.5 sm:h-20 sm:w-20">
                    {i.image ? <Image src={i.image} alt="" fill sizes="80px" className="object-contain p-1.5" /> : <ProductArt category={i.category} brand={i.brand} />}
                  </Link>
                  <div className="min-w-0">
                    <Link href={`/product/${i.slug}`} className="line-clamp-2 font-semibold leading-snug hover:text-accent">{i.name}</Link>
                    <p className="mt-0.5 text-[13px] capitalize text-muted">{i.category.replace(/-/g, " ")}</p>
                    {i.stock < i.qty && <p className="text-xs font-semibold text-bad">Only {i.stock} in stock</p>}
                  </div>
                  <div className="col-start-2 text-left sm:col-start-auto sm:w-28 sm:text-right">
                    <p className="font-bold">{formatINR(i.price * i.qty)}</p>
                    {i.mrp > i.price && <p className="text-xs text-muted line-through">{formatINR(i.mrp * i.qty)}</p>}
                  </div>
                  <div className="col-start-2 flex items-center gap-3 sm:col-start-auto">
                    <div className="flex items-center rounded-[10px] border border-line-strong/70" role="group" aria-label={`Quantity for ${i.name}`}>
                      <button className="grid h-9 w-9 place-items-center disabled:opacity-40" onClick={() => cart.setQty(i.productId, null, i.qty - 1)} disabled={i.qty <= 1} aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
                      <span className="w-8 text-center text-sm font-semibold tabular-nums">{i.qty}</span>
                      <button className="grid h-9 w-9 place-items-center" onClick={() => cart.setQty(i.productId, null, i.qty + 1)} aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <button onClick={() => cart.remove(i.productId, null)} className="col-start-2 grid h-9 w-9 place-items-center justify-self-start rounded-lg text-muted hover:bg-bad-soft hover:text-bad sm:col-start-auto sm:justify-self-auto" aria-label={`Remove ${i.name}`}><Trash2 className="h-[18px] w-[18px]" /></button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <aside className="lg:sticky lg:top-32 lg:self-start lg:pt-[52px]" aria-label="Order summary">
        <div className="rounded-[16px] border border-line bg-surface p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold">Order Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">MRP ({cart.count} items)</dt><dd className="font-mono text-muted line-through">{formatINR(mrp)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Discount</dt><dd className="font-mono text-ok">−{formatINR(mrp - cart.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">GST included</dt><dd className="font-mono text-muted">{formatINR(gst)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Assembly</dt><dd className="font-semibold text-ok">{groups.length ? "Free" : "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-semibold">{formatINR(cart.subtotal)}</dd></div>
            <div className="flex items-baseline justify-between border-t border-line pt-3"><dt className="text-lg font-bold">Total</dt><dd className="text-2xl font-extrabold">{formatINR(cart.subtotal)}</dd></div>
          </dl>
          {outOfStock.length > 0 && <p className="mt-3 rounded-xl bg-warn-soft p-3 text-sm text-warn">Some items have limited stock — we&apos;ll confirm availability before billing.</p>}
          <p className="mt-3 flex items-center gap-2 text-xs text-muted"><Tag className="h-3.5 w-3.5 text-ok" /> Have a promo code? Apply it at checkout.</p>
          <LinkButton href="/checkout" size="lg" className="mt-4 w-full">Proceed to Checkout <ArrowRight className="h-4 w-4" /></LinkButton>
          <LinkButton href="/quote?from=cart" size="md" variant="secondary" className="mt-2 w-full"><FileText className="h-4 w-4" /> Request a quote instead</LinkButton>
          <p className="mt-4 flex items-start gap-2 text-xs text-muted"><ShieldCheck className="h-4 w-4 shrink-0" /> Prices are confirmed from our system at checkout. No payment is taken online yet — pay at the store or by UPI after we confirm stock.</p>
        </div>
      </aside>
    </div>
    </>
  );
}
