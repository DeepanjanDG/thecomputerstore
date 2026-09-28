import type { Metadata } from "next";
import Link from "next/link";
import { ProductArt } from "@/components/product/product-art";
import { AddToBuilderButton, AddToCartButton } from "@/components/product/product-actions";
import { getProductsByIds, listProducts, toBuilderProduct } from "@/server/catalog";
import { SLOT_COMPARE_SPECS, formatSpecValue, specLabel } from "@/lib/spec-format";
import type { Slot } from "@/lib/compat/types";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Compare Components", description: "Compare processors, graphics cards, motherboards and more side by side.", alternates: { canonical: "/compare" } };

const QUICK = [
  ["processors", "CPUs"], ["graphics-cards", "GPUs"], ["motherboards", "Motherboards"], ["ram", "RAM"], ["ssd", "SSDs"], ["monitors", "Monitors"],
];

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ ids?: string; cat?: string }> }) {
  const sp = await searchParams;
  const cat = sp.cat ?? "processors";
  let rows = sp.ids ? await getProductsByIds(sp.ids.split(",").slice(0, 4)) : [];
  if (!rows.length) rows = (await listProducts({ category: cat, perPage: 3, sort: "popular" })).products;
  const products = rows.map(toBuilderProduct);
  const slot = products[0]?.slot as Slot | undefined;
  const keys = (slot && SLOT_COMPARE_SPECS[slot]) || [...new Set(products.flatMap((p) => Object.keys(p.specs)))];
  const pickFrom = await listProducts({ category: rows[0]?.category.slug ?? cat, perPage: 30, sort: "popular" });

  return (
    <div className="container-x py-10">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Compare components</h1>
      <p className="mt-3 text-lg text-muted">Side-by-side specs for up to four products. Select any for your build.</p>
      <nav className="no-scrollbar mt-6 flex gap-2 overflow-x-auto" aria-label="Compare category">
        {QUICK.map(([c, l]) => (
          <Link key={c} href={`/compare?cat=${c}`} className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-semibold", (rows[0]?.category.slug ?? cat) === c ? "border-ink bg-ink text-bg" : "border-line bg-surface")}>{l}</Link>
        ))}
      </nav>

      <div className="mt-8 overflow-x-auto rounded-[24px] border border-line bg-surface">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="w-44 p-4 text-left align-bottom text-xs font-bold uppercase tracking-[0.1em] text-muted">Specification</th>
              {products.map((p) => (
                <th key={p.id} className="p-4 text-left align-top font-normal">
                  <div className="h-24 w-24 rounded-xl bg-surface-2 p-2"><ProductArt category={p.categorySlug} brand={p.brand} specs={p.specs} /></div>
                  <p className="mt-2 text-xs font-bold uppercase text-muted">{p.brand}</p>
                  <Link href={`/product/${p.slug}`} className="font-semibold leading-snug hover:text-accent">{p.name}</Link>
                  <p className="mt-1 font-mono font-bold">{formatINR(p.price)}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {keys.map((k) => {
              const vals = products.map((p) => formatSpecValue(k, p.specs[k]));
              const differs = new Set(vals).size > 1;
              return (
                <tr key={k} className={differs ? "" : "text-muted"}>
                  <th scope="row" className="p-4 text-left font-semibold">{specLabel(k)}</th>
                  {vals.map((v, i) => <td key={i} className="p-4 font-mono text-[13px]">{v}</td>)}
                </tr>
              );
            })}
            <tr>
              <td />
              {products.map((p) => (
                <td key={p.id} className="space-y-2 p-4">
                  {p.slot && rows[0]?.category.builderSlot && <AddToBuilderButton product={p} full go />}
                  <AddToCartButton full item={{ productId: p.id, slug: p.slug, name: p.name, brand: p.brand, category: p.categorySlug, price: p.price, mrp: p.mrp, gstRate: p.gstRate, stock: p.stock }} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <section className="mt-10" aria-labelledby="pick-h">
        <h2 id="pick-h" className="font-bold">Choose products to compare</h2>
        <form action="/compare/go" className="mt-3 flex flex-wrap gap-2">
          {pickFrom.products.map((p) => (
            <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent-soft">
              <input type="checkbox" name="pick" value={p.id} defaultChecked={products.some((x) => x.id === p.id)} className="accent-[var(--accent)]" />
              {p.name}
            </label>
          ))}
          <button type="submit" className="h-9 rounded-full bg-ink px-4 text-sm font-semibold text-bg">Compare selected</button>
        </form>
      </section>
    </div>
  );
}
