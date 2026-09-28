"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Lock, MapPin, Store, Tag, Truck } from "lucide-react";
import { useCart } from "@/components/providers/cart";
import { useSessionUser } from "@/components/providers/session";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { formatINR } from "@/lib/format";
import { fullAddress } from "@/lib/site";
import { cn } from "@/lib/utils";

export function CheckoutForm({ payments }: { payments: { id: string; label: string; description: string }[] }) {
  const cart = useCart();
  const user = useSessionUser();
  const router = useRouter();
  const [f, setF] = useState({ name: user?.name ?? "", phone: "", email: user?.email ?? "", fulfilment: "pickup", addressLine: "", city: "", state: "Meghalaya", pincode: "", notes: "", payment: payments[0]?.id ?? "pay_at_store" });
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number; description: string | null } | null>(null);
  const [couponErr, setCouponErr] = useState("");
  const [state, setState] = useState<{ loading?: boolean; error?: string; field?: string }>({});
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  if (!cart.ready) return <div className="skeleton h-96" />;
  if (!cart.items.length)
    return (
      <div className="rounded-[24px] border border-line bg-surface p-10 text-center">
        <p className="font-semibold">Your cart is empty.</p>
        <LinkButton href="/shop" className="mt-4">Continue shopping</LinkButton>
      </div>
    );

  const applyCoupon = async () => {
    setCouponErr("");
    const r = await fetch("/api/cart/price", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: cart.items.map((i) => i.productId), coupon, subtotal: cart.subtotal }) }).then((x) => x.json());
    if (r.coupon?.error) { setApplied(null); setCouponErr(r.coupon.error); }
    else if (r.coupon) setApplied(r.coupon);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ loading: true });
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, coupon: applied?.code, items: cart.items.map((i) => ({ productId: i.productId, qty: i.qty, buildGroup: i.buildGroup ?? null })) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setState({ error: data.error ?? "Couldn't place the order.", field: data.field });
    cart.clear();
    router.push(`/order/${data.id}`);
  };

  const discount = applied?.discount ?? 0;
  const total = cart.subtotal - discount;
  const err = (k: string) => (state.field === k ? state.error : undefined);

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_400px]" noValidate>
      <div className="space-y-6">
        <fieldset className="rounded-[24px] border border-line bg-surface p-6">
          <legend className="px-1 text-lg font-bold">Contact</legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="c-name" error={err("name")}><Input id="c-name" required value={f.name} onChange={set("name")} autoComplete="name" /></Field>
            <Field label="Phone" htmlFor="c-phone" error={err("phone")}><Input id="c-phone" required type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" placeholder="+91" /></Field>
            <Field label="Email" htmlFor="c-email" error={err("email")} className="sm:col-span-2"><Input id="c-email" required type="email" value={f.email} onChange={set("email")} autoComplete="email" /></Field>
          </div>
        </fieldset>

        <fieldset className="rounded-[24px] border border-line bg-surface p-6">
          <legend className="px-1 text-lg font-bold">Delivery</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {[
              { v: "pickup", icon: Store, t: "Pick up in store", d: fullAddress },
              { v: "delivery", icon: Truck, t: "Deliver to me", d: "Shipping charges confirmed with your order" },
            ].map((o) => (
              <label key={o.v} className={cn("flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors", f.fulfilment === o.v ? "border-accent bg-accent-soft" : "border-line hover:border-line-strong")}>
                <input type="radio" name="fulfilment" value={o.v} checked={f.fulfilment === o.v} onChange={set("fulfilment")} className="sr-only" />
                <o.icon className="h-5 w-5 shrink-0 text-accent" />
                <span><span className="block font-semibold">{o.t}</span><span className="text-sm text-muted">{o.d}</span></span>
              </label>
            ))}
          </div>
          {f.fulfilment === "delivery" && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Address" htmlFor="c-addr" error={err("addressLine")} className="sm:col-span-2"><Input id="c-addr" value={f.addressLine} onChange={set("addressLine")} autoComplete="street-address" /></Field>
              <Field label="City" htmlFor="c-city"><Input id="c-city" value={f.city} onChange={set("city")} autoComplete="address-level2" /></Field>
              <Field label="State" htmlFor="c-state"><Input id="c-state" value={f.state} onChange={set("state")} autoComplete="address-level1" /></Field>
              <Field label="PIN code" htmlFor="c-pin" error={err("pincode")}><Input id="c-pin" inputMode="numeric" maxLength={6} value={f.pincode} onChange={set("pincode")} autoComplete="postal-code" /></Field>
            </div>
          )}
          <Field label="Order notes" htmlFor="c-notes" optional className="mt-4"><Textarea id="c-notes" value={f.notes} onChange={set("notes")} placeholder="Preferred pickup time, Windows edition, anything else…" /></Field>
        </fieldset>

        <fieldset className="rounded-[24px] border border-line bg-surface p-6">
          <legend className="px-1 text-lg font-bold">Payment</legend>
          <div className="mt-2 space-y-3">
            {payments.map((p) => (
              <label key={p.id} className={cn("flex cursor-pointer gap-3 rounded-2xl border p-4", f.payment === p.id ? "border-accent bg-accent-soft" : "border-line")}>
                <input type="radio" name="payment" value={p.id} checked={f.payment === p.id} onChange={() => setF((x) => ({ ...x, payment: p.id }))} className="mt-1 accent-[var(--accent)]" />
                <span><span className="block font-semibold">{p.label}</span><span className="text-sm text-muted">{p.description}</span></span>
              </label>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-muted"><Lock className="h-3.5 w-3.5" /> Online card/UPI payments are coming soon.</p>
        </fieldset>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[24px] border border-line bg-surface p-5">
          <h2 className="text-lg font-bold">Your order</h2>
          <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto text-sm">
            {cart.items.map((i) => (
              <li key={`${i.productId}-${i.buildGroup}`} className="flex justify-between gap-3">
                <span className="min-w-0 truncate text-muted">{i.qty > 1 && `${i.qty} × `}{i.name}</span>
                <span className="shrink-0 font-mono">{formatINR(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2 border-t border-line pt-4">
            <Input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Coupon code" aria-label="Coupon code" className="h-10" />
            <Button type="button" variant="secondary" size="sm" className="h-10" onClick={applyCoupon} disabled={!coupon}><Tag className="h-4 w-4" /> Apply</Button>
          </div>
          {couponErr && <p role="alert" className="mt-2 text-sm text-bad">{couponErr}</p>}
          {applied && <p className="mt-2 text-sm text-ok">{applied.code} applied — {applied.description}</p>}
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-mono">{formatINR(cart.subtotal)}</dd></div>
            {discount > 0 && <div className="flex justify-between"><dt className="text-muted">Coupon</dt><dd className="font-mono text-ok">−{formatINR(discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted">{f.fulfilment === "pickup" ? "Pickup" : "Shipping"}</dt><dd>{f.fulfilment === "pickup" ? "Free" : "Confirmed with order"}</dd></div>
            <div className="flex items-baseline justify-between border-t border-line pt-3"><dt className="font-semibold">Total (incl. GST)</dt><dd className="font-mono text-2xl font-bold">{formatINR(total)}</dd></div>
          </dl>
          {state.error && !state.field && <p role="alert" className="mt-3 rounded-xl bg-bad-soft p-3 text-sm text-bad">{state.error}</p>}
          {state.error && state.field && <p role="alert" className="mt-3 text-sm text-bad">Please check the highlighted field.</p>}
          <Button type="submit" size="lg" className="mt-5 w-full uppercase tracking-wide" disabled={state.loading}>
            {state.loading && <Loader2 className="h-4 w-4 animate-spin" />} Place order
          </Button>
          <p className="mt-3 flex items-start gap-2 text-xs text-muted"><MapPin className="h-4 w-4 shrink-0" /> We&apos;ll call or WhatsApp you to confirm stock and timing before billing.</p>
        </div>
      </aside>
    </form>
  );
}
