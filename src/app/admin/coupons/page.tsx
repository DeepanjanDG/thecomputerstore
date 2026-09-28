import { PageHeader } from "@/components/admin/shell";
import { ActionForm } from "@/components/admin/ui";
import { Field, Input, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { db } from "@/server/db";
import { saveCouponAction, toggleCouponAction } from "@/server/actions/admin";
import { formatDate, formatINR } from "@/lib/format";

export const metadata = { title: "Coupons" };

export default async function AdminCoupons() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageHeader title="Coupons" description="Codes customers can apply at checkout. Saving an existing code updates it." />
      <ActionForm action={saveCouponAction} submit="Save coupon" className="card mb-8 grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Code" htmlFor="code"><Input id="code" name="code" required className="font-mono uppercase" /></Field>
        <Field label="Type" htmlFor="type"><Select id="type" name="type"><option value="PERCENT">Percent off</option><option value="FLAT">Flat ₹ off</option></Select></Field>
        <Field label="Value" htmlFor="value"><Input id="value" name="value" type="number" min={1} required /></Field>
        <Field label="Minimum order (₹)" htmlFor="minOrder"><Input id="minOrder" name="minOrder" type="number" min={0} defaultValue={0} /></Field>
        <Field label="Max discount (₹)" htmlFor="maxDiscount" optional><Input id="maxDiscount" name="maxDiscount" type="number" min={0} /></Field>
        <Field label="Usage limit" htmlFor="usageLimit" optional><Input id="usageLimit" name="usageLimit" type="number" min={1} /></Field>
        <Field label="Ends on" htmlFor="endsAt" optional><Input id="endsAt" name="endsAt" type="date" /></Field>
        <Field label="Description" htmlFor="description" optional><Input id="description" name="description" /></Field>
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="isActive" defaultChecked /> Active</label>
      </ActionForm>
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-[0.08em] text-muted"><tr><th className="p-3">Code</th><th className="p-3">Discount</th><th className="p-3">Min order</th><th className="p-3">Used</th><th className="p-3">Ends</th><th className="p-3">Status</th></tr></thead>
          <tbody className="divide-y divide-line">
            {coupons.map((c) => (
              <tr key={c.id}>
                <td className="p-3"><span className="font-mono font-bold">{c.code}</span><p className="text-xs text-muted">{c.description}</p></td>
                <td className="p-3">{c.type === "PERCENT" ? `${c.value}%` : formatINR(c.value)}{c.maxDiscount ? ` (max ${formatINR(c.maxDiscount)})` : ""}</td>
                <td className="p-3 font-mono">{formatINR(c.minOrder)}</td>
                <td className="p-3 font-mono">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                <td className="p-3 text-muted">{c.endsAt ? formatDate(c.endsAt) : "—"}</td>
                <td className="p-3">
                  <form action={toggleCouponAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={c.id} />
                    <Badge tone={c.isActive ? "ok" : "neutral"}>{c.isActive ? "active" : "off"}</Badge>
                    <button className="text-xs font-semibold text-accent">{c.isActive ? "Disable" : "Enable"}</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
