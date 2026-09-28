import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Phone } from "lucide-react";
import { PageHeader } from "@/components/admin/shell";
import { ActionForm } from "@/components/admin/ui";
import { Field, Select, Textarea } from "@/components/ui/field";
import { WhatsAppIcon } from "@/components/layout/brand-icons";
import { db } from "@/server/db";
import { updateQuoteAction } from "@/server/actions/admin";
import { formatDate, formatINR } from "@/lib/format";

export const metadata = { title: "Quotation" };

export default async function AdminQuote({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const q = await db.quote.findUnique({ where: { id }, include: { items: true, build: true, user: true } });
  if (!q) notFound();
  const phoneDigits = q.phone?.replace(/[^\d]/g, "");
  const wa = phoneDigits ? `https://wa.me/${phoneDigits.length === 10 ? `91${phoneDigits}` : phoneDigits}?text=${encodeURIComponent(`Hi ${q.name}, this is The Computer Store regarding your quote ${q.number}.`)}` : null;
  return (
    <>
      <PageHeader
        title={`${q.name} · ${q.buildName ?? "Configuration"}`}
        description={`${q.number} · ${formatDate(q.createdAt)} · ${q.source === "DOWNLOAD" ? "Self-service PDF" : "Quote request"}`}
        action={<a href={`/api/quotes/${q.id}/pdf`} className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white"><Download className="h-4 w-4" /> PDF</a>}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-line text-left text-xs uppercase tracking-[0.08em] text-muted"><tr><th className="p-3">Component</th><th className="p-3">Item</th><th className="p-3">Qty</th><th className="p-3 text-right">Price</th></tr></thead>
              <tbody className="divide-y divide-line">
                {q.items.map((i) => (
                  <tr key={i.id}><td className="p-3 text-muted">{i.slot}</td><td className="p-3 font-semibold">{i.productId ? <Link href={`/admin/products/${i.productId}`} className="hover:text-accent">{i.name}</Link> : i.name}</td><td className="p-3 font-mono">{i.quantity}</td><td className="p-3 text-right font-mono">{formatINR(i.unitPrice * i.quantity)}</td></tr>
                ))}
              </tbody>
              <tfoot className="border-t border-line">
                <tr><td colSpan={3} className="p-3 text-right text-muted">MRP {formatINR(q.mrpTotal)} · GST incl. {formatINR(q.gstTotal)}</td><td className="p-3 text-right font-mono text-lg font-bold">{formatINR(q.subtotal)}</td></tr>
              </tfoot>
            </table>
          </section>
          <section className="card grid gap-3 p-5 text-sm sm:grid-cols-2">
            <p><span className="text-muted">Compatibility:</span> <strong className={q.compatible ? "text-ok" : "text-bad"}>{q.compatible ? "✓ All compatible" : "✕ Needs review"}</strong></p>
            <p><span className="text-muted">Estimated power:</span> <strong>{q.estimatedW ? `${q.estimatedW}W (PSU ${q.recommendedW}W+)` : "—"}</strong></p>
            <p><span className="text-muted">Budget:</span> <strong>{q.budget ? formatINR(q.budget) : "—"}</strong></p>
            <p><span className="text-muted">Saved build:</span> {q.build ? <Link href={`/build/${q.build.code}`} className="font-semibold text-accent">{q.build.code}</Link> : "—"}</p>
            {q.requirements && <p className="sm:col-span-2"><span className="text-muted">Requirements:</span><br />{q.requirements}</p>}
          </section>
        </div>
        <aside className="space-y-6">
          <section className="card space-y-2 p-5 text-sm">
            <h2 className="font-bold">Customer</h2>
            <p className="font-semibold">{q.name}{q.user && <span className="ml-2 text-xs text-muted">(account)</span>}</p>
            {q.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted" /><a href={`tel:${q.phone}`} className="hover:text-accent">{q.phone}</a></p>}
            {q.email && <p><a href={`mailto:${q.email}?subject=${encodeURIComponent(`Your quotation ${q.number}`)}`} className="hover:text-accent">{q.email}</a></p>}
            {q.city && <p className="text-muted">{q.city}</p>}
            {q.contactMethod && <p className="text-muted">Prefers: <strong className="text-ink">{q.contactMethod}</strong></p>}
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-3 py-2 font-semibold text-[#062e16]"><WhatsAppIcon className="h-4 w-4" /> WhatsApp customer</a>}
          </section>
          <ActionForm action={updateQuoteAction} submit="Update status" className="card space-y-4 p-5">
            <input type="hidden" name="id" value={q.id} />
            <Field label="Status" htmlFor="status">
              <Select id="status" name="status" defaultValue={q.status}>
                {["NEW", "CONTACTED", "QUOTED", "CONFIRMED", "COMPLETED", "CANCELLED"].map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
              </Select>
            </Field>
            <Field label="Internal notes" htmlFor="adminNotes"><Textarea id="adminNotes" name="adminNotes" defaultValue={q.adminNotes ?? ""} rows={5} /></Field>
          </ActionForm>
        </aside>
      </div>
    </>
  );
}
