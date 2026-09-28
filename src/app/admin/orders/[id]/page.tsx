import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/shell";
import { ActionForm } from "@/components/admin/ui";
import { Field, Input, Select } from "@/components/ui/field";
import { db } from "@/server/db";
import { updateOrderAction } from "@/server/actions/admin";
import { formatDate, formatINR } from "@/lib/format";

export const metadata = { title: "Order" };

export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!o) notFound();
  const groups = [...new Set(o.items.map((i) => i.buildGroup ?? ""))];
  return (
    <>
      <PageHeader title={o.number} description={`${o.name} · ${formatDate(o.createdAt)} · ${o.paymentProvider.replace(/_/g, " ")}`} />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="card p-5">
          {groups.map((g) => (
            <div key={g} className="mb-5">
              {g && <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-accent">Custom PC · {g} — assemble & test</p>}
              <ul className="divide-y divide-line text-sm">
                {o.items.filter((i) => (i.buildGroup ?? "") === g).map((i) => (
                  <li key={i.id} className="flex justify-between gap-4 py-2"><span>{i.quantity} × {i.name}</span><span className="font-mono">{formatINR(i.unitPrice * i.quantity)}</span></li>
                ))}
              </ul>
            </div>
          ))}
          <dl className="space-y-1 border-t border-line pt-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-mono">{formatINR(o.subtotal)}</dd></div>
            {o.discount > 0 && <div className="flex justify-between"><dt className="text-muted">Coupon {o.couponCode}</dt><dd className="font-mono">−{formatINR(o.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted">GST included</dt><dd className="font-mono">{formatINR(o.gstTotal)}</dd></div>
            <div className="flex justify-between text-lg font-bold"><dt>Total</dt><dd className="font-mono">{formatINR(o.total)}</dd></div>
          </dl>
        </section>
        <aside className="space-y-6">
          <section className="card space-y-1.5 p-5 text-sm">
            <h2 className="font-bold">Customer</h2>
            <p>{o.name}</p>
            <p><a href={`tel:${o.phone}`} className="hover:text-accent">{o.phone}</a></p>
            <p><a href={`mailto:${o.email}`} className="hover:text-accent">{o.email}</a></p>
            <p className="pt-2 text-muted">{o.fulfilment === "pickup" ? "Store pickup" : `${o.addressLine}, ${o.city}, ${o.state} ${o.pincode}`}</p>
            {o.notes && <p className="pt-2"><span className="text-muted">Notes:</span> {o.notes}</p>}
          </section>
          <ActionForm action={updateOrderAction} submit="Update order" className="card space-y-4 p-5">
            <input type="hidden" name="id" value={o.id} />
            <Field label="Order status" htmlFor="status">
              <Select id="status" name="status" defaultValue={o.status}>{["PENDING", "CONFIRMED", "PROCESSING", "READY", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => <option key={s} value={s}>{s.toLowerCase()}</option>)}</Select>
            </Field>
            <Field label="Payment" htmlFor="paymentStatus">
              <Select id="paymentStatus" name="paymentStatus" defaultValue={o.paymentStatus}>{["UNPAID", "PAID", "REFUNDED", "FAILED"].map((s) => <option key={s} value={s}>{s.toLowerCase()}</option>)}</Select>
            </Field>
            <Field label="Payment reference" htmlFor="paymentRef" optional><Input id="paymentRef" name="paymentRef" defaultValue={o.paymentRef ?? ""} placeholder="UPI ref / receipt no." /></Field>
          </ActionForm>
        </aside>
      </div>
    </>
  );
}
