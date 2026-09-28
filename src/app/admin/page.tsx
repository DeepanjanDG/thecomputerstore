import Link from "next/link";
import { AlertTriangle, Boxes, Cpu, FileText, Package } from "lucide-react";
import { PageHeader } from "@/components/admin/shell";
import { Badge } from "@/components/ui/badge";
import { db } from "@/server/db";
import { formatDate, formatINR } from "@/lib/format";

export default async function AdminDashboard() {
  const since = new Date(Date.now() - 30 * 86400000);
  const [products, lowStock, newQuotes, pendingOrders, builds30, revenue, quotes, orders] = await Promise.all([
    db.product.count({ where: { status: "ACTIVE" } }),
    db.inventory.findMany({ where: { quantity: { lte: 2 }, product: { status: "ACTIVE" } }, include: { product: true }, take: 8, orderBy: { quantity: "asc" } }),
    db.quote.count({ where: { status: "NEW", source: "REQUEST" } }),
    db.order.count({ where: { status: { in: ["PENDING", "CONFIRMED", "PROCESSING"] } } }),
    db.build.count({ where: { createdAt: { gte: since } } }),
    db.order.aggregate({ where: { createdAt: { gte: since }, status: { not: "CANCELLED" } }, _sum: { total: true } }),
    db.quote.findMany({ where: { source: "REQUEST" }, orderBy: { createdAt: "desc" }, take: 6 }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);
  const stats = [
    { label: "New quote requests", value: newQuotes, href: "/admin/quotes?status=NEW", icon: FileText },
    { label: "Open orders", value: pendingOrders, href: "/admin/orders", icon: Package },
    { label: "Builds saved (30 days)", value: builds30, href: "/admin/builds", icon: Cpu },
    { label: "Active products", value: products, href: "/admin/products", icon: Boxes },
  ];
  return (
    <>
      <PageHeader title="Dashboard" description={`Orders in the last 30 days: ${formatINR(revenue._sum.total ?? 0)}`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card card-hover p-5">
            <s.icon className="h-5 w-5 text-accent" />
            <p className="mt-4 text-3xl font-extrabold">{s.value}</p>
            <p className="text-sm text-muted">{s.label}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-center justify-between"><h2 className="font-bold">Latest quote requests</h2><Link href="/admin/quotes" className="text-sm font-semibold text-accent">All</Link></div>
          <ul className="mt-3 divide-y divide-line text-sm">
            {quotes.map((q) => (
              <li key={q.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link href={`/admin/quotes/${q.id}`} className="min-w-0"><span className="block truncate font-semibold hover:text-accent">{q.name} · {q.buildName ?? "Configuration"}</span><span className="text-xs text-muted">{q.number} · {formatDate(q.createdAt)}</span></Link>
                <span className="flex items-center gap-2"><Badge tone={q.status === "NEW" ? "accent" : "neutral"}>{q.status.toLowerCase()}</Badge><span className="font-mono">{formatINR(q.subtotal)}</span></span>
              </li>
            ))}
            {!quotes.length && <li className="py-4 text-muted">No quote requests yet.</li>}
          </ul>
        </section>
        <section className="card p-5">
          <div className="flex items-center justify-between"><h2 className="font-bold">Latest orders</h2><Link href="/admin/orders" className="text-sm font-semibold text-accent">All</Link></div>
          <ul className="mt-3 divide-y divide-line text-sm">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link href={`/admin/orders/${o.id}`} className="min-w-0"><span className="block truncate font-semibold hover:text-accent">{o.name}</span><span className="text-xs text-muted">{o.number} · {formatDate(o.createdAt)}</span></Link>
                <span className="flex items-center gap-2"><Badge tone={o.status === "PENDING" ? "accent" : "neutral"}>{o.status.toLowerCase()}</Badge><span className="font-mono">{formatINR(o.total)}</span></span>
              </li>
            ))}
            {!orders.length && <li className="py-4 text-muted">No orders yet.</li>}
          </ul>
        </section>
        <section className="card p-5 xl:col-span-2">
          <h2 className="flex items-center gap-2 font-bold"><AlertTriangle className="h-4 w-4 text-warn" /> Low stock</h2>
          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {lowStock.map((i) => (
              <li key={i.id} className="flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2">
                <Link href={`/admin/products/${i.productId}`} className="truncate hover:text-accent">{i.product.name}</Link>
                <span className={i.quantity === 0 ? "font-bold text-bad" : "font-bold text-warn"}>{i.quantity}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
