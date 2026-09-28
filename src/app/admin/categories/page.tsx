import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/shell";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/server/db";

export const metadata = { title: "Categories" };

export default async function AdminCategories() {
  const cats = await db.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true, specDefs: true } } } });
  return (
    <>
      <PageHeader title="Categories & Specifications" description="Each category defines the structured specifications its products carry. Categories linked to a builder slot appear in the PC Builder." action={<LinkButton href="/admin/categories/new"><Plus className="h-4 w-4" /> New category</LinkButton>} />
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-[0.08em] text-muted"><tr><th className="p-3">Category</th><th className="p-3">Group</th><th className="p-3">Builder slot</th><th className="p-3">Specs</th><th className="p-3">Products</th><th className="p-3">Status</th></tr></thead>
          <tbody className="divide-y divide-line">
            {cats.map((c) => (
              <tr key={c.id}>
                <td className="p-3"><Link href={`/admin/categories/${c.id}`} className="font-semibold hover:text-accent">{c.name}</Link><p className="font-mono text-xs text-muted">/{c.slug}</p></td>
                <td className="p-3 text-muted">{c.group}</td>
                <td className="p-3">{c.builderSlot ? <Badge tone="accent">{c.builderSlot}</Badge> : <span className="text-muted">—</span>}</td>
                <td className="p-3 font-mono">{c._count.specDefs}</td>
                <td className="p-3 font-mono">{c._count.products}</td>
                <td className="p-3"><Badge tone={c.isActive ? "ok" : "neutral"}>{c.isActive ? "active" : "hidden"}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
