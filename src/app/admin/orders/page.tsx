import Link from "next/link";
import { PageHeader } from "@/components/admin/shell";
import { Badge } from "@/components/ui/badge";
import { db } from "@/server/db";
import { formatDate, formatINR } from "@/lib/format";

export const metadata = { title: "Orders" };

export default async function AdminOrders() {
  const orders = await db.order.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { items: true } } }, take: 200 });
  return (
    <>
      <PageHeader title="Orders" description="Stock is reserved when an order is placed, deducted when delivered, and released if cancelled." />
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-[0.08em] text-muted"><tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Items</th><th className="p-3">Fulfilment</th><th className="p-3">Payment</th><th className="p-3">Total</th><th className="p-3">Status</th></tr></thead>
          <tbody className="divide-y divide-line">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="p-3"><Link href={`/admin/orders/${o.id}`} className="font-mono font-semibold hover:text-accent">{o.number}</Link><p className="text-xs text-muted">{formatDate(o.createdAt)}</p></td>
                <td className="p-3">{o.name}<p className="text-xs text-muted">{o.phone}</p></td>
                <td className="p-3 font-mono">{o._count.items}{o.assembly && <Badge tone="accent" className="ml-2">custom PC</Badge>}</td>
                <td className="p-3 text-muted">{o.fulfilment}</td>
                <td className="p-3"><Badge tone={o.paymentStatus === "PAID" ? "ok" : "neutral"}>{o.paymentStatus.toLowerCase()}</Badge></td>
                <td className="p-3 font-mono font-semibold">{formatINR(o.total)}</td>
                <td className="p-3"><Badge tone={o.status === "PENDING" ? "accent" : o.status === "CANCELLED" ? "bad" : o.status === "DELIVERED" ? "ok" : "warn"}>{o.status.toLowerCase()}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-8 text-center text-muted">No orders yet.</p>}
      </div>
    </>
  );
}
