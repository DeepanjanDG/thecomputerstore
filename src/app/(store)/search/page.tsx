import type { Metadata } from "next";
import Link from "next/link";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Pagination } from "@/components/catalog/pagination";
import { SortSelect } from "@/components/catalog/catalog-filters";
import { listProducts } from "@/server/catalog";
import { parseListParams } from "@/server/catalog-params";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const lp = parseListParams(await searchParams);
  const q = lp.q ?? "";
  const { products, total, page, pages } = q ? await listProducts(lp) : { products: [], total: 0, page: 1, pages: 1 };
  return (
    <div className="container-x py-10">
      <form action="/search" className="max-w-2xl" role="search">
        <label htmlFor="sq" className="text-sm font-semibold text-muted">Search</label>
        <input id="sq" name="q" defaultValue={q} placeholder="RTX 5070, 32GB DDR5, Ryzen 7…" className="mt-2 h-14 w-full rounded-2xl border border-line bg-surface px-5 text-lg outline-none focus:border-accent focus:ring-4 focus:ring-accent/15" />
      </form>
      {q && (
        <>
          <div className="mb-5 mt-8 flex items-center justify-between">
            <h1 className="text-xl font-bold">{total} result{total === 1 ? "" : "s"} for “{q}”</h1>
            <SortSelect />
          </div>
          <ProductGrid
            products={products}
            empty={
              <>
                <p className="mt-3 font-semibold">Nothing found for “{q}”.</p>
                <p className="mt-1 text-sm text-muted">Check the spelling, try a shorter search, or <a className="font-semibold text-accent" href={waLink(`Hi! Do you have ${q}?`)} target="_blank" rel="noopener noreferrer">ask us on WhatsApp</a> — we can source most parts. <Link href="/shop" className="font-semibold text-accent">Browse categories</Link>.</p>
              </>
            }
          />
          <Pagination page={page} pages={pages} base="/search" params={lp.flat} />
        </>
      )}
    </div>
  );
}
