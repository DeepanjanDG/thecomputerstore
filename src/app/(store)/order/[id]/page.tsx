import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/layout/brand-icons";
import { db } from "@/server/db";
import { formatDate, formatINR } from "@/lib/format";
import { fullAddress } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Order placed", robots: { index: false } };

/** Order ids are unguessable cuids; the link is shown only to the customer who placed the order. */
export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();
  const groups = [...new Set(order.items.map((i) => i.buildGroup ?? ""))];
  return (
    <div className="container-x max-w-3xl py-12">
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 animate-pop text-ok" />
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight">Thank you, {order.name.split(" ")[0]}!</h1>
        <p className="mt-3 text-lg text-muted">Order <span className="font-mono font-semibold text-ink">{order.number}</span> is placed. We&apos;ll contact you on {order.phone} to confirm stock and {order.fulfilment === "pickup" ? "pickup time" : "delivery"}.</p>
      </div>
      <div className="mt-10 rounded-[24px] border border-line bg-surface p-6">
        <div className="flex flex-wrap justify-between gap-2 text-sm text-muted">
          <span>Placed {formatDate(order.createdAt)}</span>
          <span>{order.fulfilment === "pickup" ? `Pickup: ${fullAddress}` : `Delivery: ${order.addressLine}, ${order.city} ${order.pincode}`}</span>
        </div>
        {groups.map((g) => (
          <div key={g} className="mt-5">
            {g && <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-accent">Custom PC · {g}</p>}
            <ul className="divide-y divide-line text-sm">
              {order.items.filter((i) => (i.buildGroup ?? "") === g).map((i) => (
                <li key={i.id} className="flex justify-between gap-4 py-2"><span>{i.quantity > 1 && `${i.quantity} × `}{i.name}</span><span className="font-mono">{formatINR(i.unitPrice * i.quantity)}</span></li>
              ))}
            </ul>
          </div>
        ))}
        <dl className="mt-5 space-y-1.5 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-mono">{formatINR(order.subtotal)}</dd></div>
          {order.discount > 0 && <div className="flex justify-between"><dt className="text-muted">Discount ({order.couponCode})</dt><dd className="font-mono text-ok">−{formatINR(order.discount)}</dd></div>}
          <div className="flex justify-between"><dt className="text-muted">GST included</dt><dd className="font-mono">{formatINR(order.gstTotal)}</dd></div>
          <div className="flex justify-between text-lg font-bold"><dt>Total</dt><dd className="font-mono">{formatINR(order.total)}</dd></div>
        </dl>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href={waLink(`Hi! I just placed order ${order.number}.`)} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#25D366] px-5 font-semibold text-[#062e16]"><WhatsAppIcon className="h-5 w-5" /> Message us about this order</a>
        <LinkButton href="/" variant="secondary">Back to home</LinkButton>
      </div>
    </div>
  );
}
