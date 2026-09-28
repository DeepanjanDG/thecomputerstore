import { PageHeader } from "@/components/admin/shell";
import { Badge } from "@/components/ui/badge";
import { db } from "@/server/db";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Customers" };

export default async function AdminCustomers() {
  const users = await db.user.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { orders: true, quotes: true, builds: true } } }, take: 300 });
  return (
    <>
      <PageHeader title="Customers" description="Registered accounts. Guests who order or request quotes appear on those records." />
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-[0.08em] text-muted"><tr><th className="p-3">Name</th><th className="p-3">Contact</th><th className="p-3">Builds</th><th className="p-3">Quotes</th><th className="p-3">Orders</th><th className="p-3">Joined</th></tr></thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-3 font-semibold">{u.name} {u.role === "ADMIN" && <Badge tone="dark">admin</Badge>}</td>
                <td className="p-3">{u.email}<p className="text-xs text-muted">{[u.phone, u.city].filter(Boolean).join(" · ")}</p></td>
                <td className="p-3 font-mono">{u._count.builds}</td>
                <td className="p-3 font-mono">{u._count.quotes}</td>
                <td className="p-3 font-mono">{u._count.orders}</td>
                <td className="p-3 text-muted">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
