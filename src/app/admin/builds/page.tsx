import Link from "next/link";
import { PageHeader } from "@/components/admin/shell";
import { Badge } from "@/components/ui/badge";
import { db } from "@/server/db";
import { formatDate, formatINR } from "@/lib/format";

export const metadata = { title: "Saved builds" };

export default async function AdminBuilds() {
  const builds = await db.build.findMany({ orderBy: { createdAt: "desc" }, include: { user: true, _count: { select: { items: true, quotes: true } } }, take: 300 });
  return (
    <>
      <PageHeader title="Saved builds" description="Every build saved or shared from the PC Builder — useful for spotting popular configurations." />
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-[0.08em] text-muted"><tr><th className="p-3">Build</th><th className="p-3">Owner</th><th className="p-3">Parts</th><th className="p-3">Power</th><th className="p-3">Total</th><th className="p-3">Quotes</th><th className="p-3">Saved</th></tr></thead>
          <tbody className="divide-y divide-line">
            {builds.map((b) => (
              <tr key={b.id}>
                <td className="p-3"><Link href={`/build/${b.code}`} className="font-semibold hover:text-accent">{b.name}</Link><p className="font-mono text-xs text-muted">{b.code} {b.useCase && `· ${b.useCase}`}</p></td>
                <td className="p-3 text-muted">{b.user?.name ?? "Guest"}</td>
                <td className="p-3 font-mono">{b._count.items} <Badge tone={b.compatible ? "ok" : "bad"}>{b.compatible ? "✓" : "✕"}</Badge></td>
                <td className="p-3 font-mono">{b.estimatedW}W</td>
                <td className="p-3 font-mono font-semibold">{formatINR(b.totalPrice)}</td>
                <td className="p-3 font-mono">{b._count.quotes}</td>
                <td className="p-3 text-muted">{formatDate(b.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {builds.length === 0 && <p className="p-8 text-center text-muted">No saved builds yet.</p>}
      </div>
    </>
  );
}
