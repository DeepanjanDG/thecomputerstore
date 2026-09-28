import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/shell";
import { requireAdmin } from "@/server/auth";
import { db } from "@/server/db";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const [quotes, orders, messages] = await Promise.all([
    db.quote.count({ where: { status: "NEW", source: "REQUEST" } }),
    db.order.count({ where: { status: "PENDING" } }),
    db.contactMessage.count({ where: { handled: false } }),
  ]);
  return (
    <AdminShell name={user.name} badges={{ "/admin/quotes": quotes, "/admin/orders": orders, "/admin/messages": messages }}>
      {children}
    </AdminShell>
  );
}
