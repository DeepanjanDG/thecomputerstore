import Link from "next/link";
import type { QuoteStatus } from "@prisma/client";
import { PageHeader } from "@/components/admin/shell";
import { Badge } from "@/components/ui/badge";
import { db } from "@/server/db";
import { formatDate, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Quotation requests" };

const STATUSES: QuoteStatus[] = ["NEW", "CONTACTED", "QUOTED", "CONFIRMED", "COMPLETED", "CANCELLED"];
const QUOTE_TONE = { NEW: "accent", CONTACTED: "warn", QUOTED: "warn", CONFIRMED: "ok", COMPLETED: "ok", CANCELLED: "bad" } as const;

export default async function AdminQuotes({ searchParams }: { searchParams: Promise<{ status?: string; source?: string }> }) {
  const sp = await searchParams;
  const source = sp.source === "DOWNLOAD" ? "DOWNLOAD" : "REQUEST";
  const status = STATUSES.includes(sp.status as QuoteStatus) ? (sp.status as QuoteStatus) : undefined;
  const [quotes, counts] = await Promise.all([
    db.quote.findMany({ where: { source, ...(status ? { status } : {}) }, orderBy: { createdAt: "desc" }, include: { _count: { select: { items: true } }, build: { select: { code: true } } }, take: 200 }),
    db.quote.groupBy({ by: ["status"], where: { source }, _count: true }),
  ]);
  const chip = (active: boolean) => cn("rounded-full border px-3 py-1.5 text-sm font-semibold", active ? "border-ink bg-ink text-bg" : "border-line bg-surface");
  return (
    <>
      <PageHeader title="Quotations" description="Quote requests submitted by customers, plus self-service PDF quotations downloaded from the builder." />
      <div className="mb-3 flex gap-2">
        <Link href="/admin/quotes" className={chip(source === "REQUEST")}>Requests</Link>
        <Link href="/admin/quotes?source=DOWNLOAD" className={chip(source === "DOWNLOAD")}>PDF downloads</Link>
      </div>
      {source === "REQUEST" && (
        <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto">
          <Link href="/admin/quotes" className={chip(!status)}>All</Link>
          {STATUSES.map((s) => <Link key={s} href={`/admin/quotes?status=${s}`} className={chip(status === s)}>{s.toLowerCase()} · {counts.find((c) => c.status === s)?._count ?? 0}</Link>)}
        </div>
      )}
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-[0.08em] text-muted"><tr><th className="p-3">Customer</th><th className="p-3">Build</th><th className="p-3">Budget</th><th className="p-3">Components</th><th className="p-3">Total</th><th className="p-3">Date</th><th className="p-3">Status</th></tr></thead>
          <tbody className="divide-y divide-line">
            {quotes.map((q) => (
              <tr key={q.id}>
                <td className="p-3"><Link href={`/admin/quotes/${q.id}`} className="font-semibold hover:text-accent">{q.name}</Link><p className="text-xs text-muted">{[q.phone, q.city].filter(Boolean).join(" · ")}</p></td>
                <td className="p-3">{q.buildName ?? "—"}<p className="font-mono text-xs text-muted">{q.number}{q.build ? ` · ${q.build.code}` : ""}</p></td>
                <td className="p-3 font-mono">{q.budget ? formatINR(q.budget) : "—"}</td>
                <td className="p-3 font-mono">{q._count.items}</td>
                <td className="p-3 font-mono font-semibold">{formatINR(q.subtotal)}{!q.compatible && <span className="ml-1 text-bad" title="Has compatibility issues">✕</span>}</td>
                <td className="p-3 text-muted">{formatDate(q.createdAt)}</td>
                <td className="p-3"><Badge tone={QUOTE_TONE[q.status]}>{q.status.toLowerCase()}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
        {quotes.length === 0 && <p className="p-8 text-center text-muted">Nothing here yet.</p>}
      </div>
    </>
  );
}
