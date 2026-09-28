import Link from "next/link";
import { Plus } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { PageHeader } from "@/components/admin/shell";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/server/db";
import { quickUpdateProductAction } from "@/server/actions/admin";
import { searchWhere } from "@/server/catalog";
import { formatINR } from "@/lib/format";

export const metadata = { title: "Products" };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; status?: string; low?: string }> }) {
  const sp = await searchParams;
  const where: Prisma.ProductWhereInput = {
    AND: [
      sp.q ? searchWhere(sp.q) : {},
      sp.cat ? { category: { slug: sp.cat } } : {},
      sp.status ? { status: sp.status as "ACTIVE" } : {},
      sp.low ? { inventory: { some: { quantity: { lte: 2 } } } } : {},
    ],
  };
  const [products, categories] = await Promise.all([
    db.product.findMany({ where, include: { category: true, brand: true, inventory: true }, orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }], take: 200 }),
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <>
      <PageHeader title="Products & Inventory" description="Edit prices and stock inline, or open a product for full structured specifications." action={<LinkButton href="/admin/products/new"><Plus className="h-4 w-4" /> New product</LinkButton>} />
      <form className="mb-5 flex flex-wrap gap-2">
        <input name="q" defaultValue={sp.q} placeholder="Search name, SKU, spec…" className="h-10 min-w-60 flex-1 rounded-xl border border-line bg-surface px-3 text-sm" />
        <select name="cat" defaultValue={sp.cat ?? ""} className="h-10 rounded-xl border border-line bg-surface px-3 text-sm">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select name="status" defaultValue={sp.status ?? ""} className="h-10 rounded-xl border border-line bg-surface px-3 text-sm">
          <option value="">Any status</option><option>ACTIVE</option><option>DRAFT</option><option>ARCHIVED</option>
        </select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="low" value="1" defaultChecked={!!sp.low} /> Low stock</label>
        <button className="h-10 rounded-xl bg-ink px-4 text-sm font-semibold text-bg">Filter</button>
      </form>
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-[0.08em] text-muted">
            <tr><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Status</th><th className="p-3">MRP</th><th className="p-3">Price · Stock</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => {
              const stock = p.inventory.reduce((s, i) => s + i.quantity, 0);
              const reserved = p.inventory.reduce((s, i) => s + i.reserved, 0);
              return (
                <tr key={p.id} className="align-middle">
                  <td className="p-3">
                    <Link href={`/admin/products/${p.id}`} className="font-semibold hover:text-accent">{p.name}</Link>
                    <p className="font-mono text-xs text-muted">{p.sku} · {p.brand.name}</p>
                  </td>
                  <td className="p-3 text-muted">{p.category.name}</td>
                  <td className="p-3"><Badge tone={p.status === "ACTIVE" ? "ok" : p.status === "DRAFT" ? "warn" : "neutral"}>{p.status.toLowerCase()}</Badge></td>
                  <td className="p-3 font-mono text-muted">{formatINR(p.mrp)}</td>
                  <td className="p-3">
                    <form action={quickUpdateProductAction} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={p.id} />
                      <label className="sr-only" htmlFor={`price-${p.id}`}>Price</label>
                      <input id={`price-${p.id}`} name="price" type="number" defaultValue={p.price} className="h-9 w-28 rounded-lg border border-line bg-bg px-2 font-mono" />
                      <label className="sr-only" htmlFor={`stock-${p.id}`}>Stock</label>
                      <input id={`stock-${p.id}`} name="stock" type="number" defaultValue={stock} className={`h-9 w-20 rounded-lg border border-line bg-bg px-2 font-mono ${stock <= 2 ? "text-bad" : ""}`} />
                      <button className="h-9 rounded-lg border border-line px-3 text-xs font-semibold hover:bg-surface-2">Update</button>
                      {reserved > 0 && <span className="text-xs text-muted">{reserved} reserved</span>}
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-8 text-center text-muted">No products match.</p>}
      </div>
    </>
  );
}
