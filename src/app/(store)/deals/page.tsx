import type { Metadata } from "next";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Pagination } from "@/components/catalog/pagination";
import { SortSelect } from "@/components/catalog/catalog-filters";
import { listProducts } from "@/server/catalog";
import { parseListParams } from "@/server/catalog-params";

export const metadata: Metadata = {
  title: "Deals on PC Components, Laptops & Monitors",
  description: "Current deals at The Computer Store, Shillong — graphics cards, processors, SSDs, monitors and laptops.",
  alternates: { canonical: "/deals" },
};

export default async function DealsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const lp = parseListParams(await searchParams);
  const { products, total, page, pages } = await listProducts({ ...lp, deals: true });
  return (
    <div className="container-x py-10">
      <div className="stage relative overflow-hidden rounded-[32px] px-6 py-12 sm:px-12">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent/25 blur-[100px]" aria-hidden />
        <p className="eyebrow relative">Deals</p>
        <h1 className="relative mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">Good hardware, better prices.</h1>
        <p className="relative mt-3 max-w-xl text-lg text-muted">Hand-picked offers from our Shillong store. Stock is limited — prices update as stock changes.</p>
      </div>
      <div className="mb-5 mt-10 flex items-center justify-between">
        <p className="text-sm text-muted"><span className="font-semibold text-ink">{total}</span> deals</p>
        <SortSelect />
      </div>
      <ProductGrid products={products} />
      <Pagination page={page} pages={pages} base="/deals" params={lp.flat} />
    </div>
  );
}
