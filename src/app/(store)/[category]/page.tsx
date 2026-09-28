import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Cpu } from "lucide-react";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { CatalogFilters, SortSelect } from "@/components/catalog/catalog-filters";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Pagination } from "@/components/catalog/pagination";
import { getCategory, getFacets, listProducts } from "@/server/catalog";
import { parseListParams } from "@/server/catalog-params";
import { SLOT_META } from "@/lib/compat/slots";
import { INFO_PAGES } from "@/content/pages";
import { InfoPageView } from "@/components/info/info-page";
import type { Slot } from "@/lib/compat/types";

type Props = { params: Promise<{ category: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const info = INFO_PAGES[category];
  if (info) return { title: info.title, description: info.description, alternates: { canonical: `/${category}` } };
  const c = await getCategory(category);
  if (!c) return {};
  return {
    title: c.seoTitle ?? `${c.name} — Buy Online in Shillong & India`,
    description: c.seoDesc ?? `${c.description ?? ""} Genuine products, GST invoice, warranty support and free PC assembly at The Computer Store, Shillong.`,
    alternates: { canonical: `/${c.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  // Top-level info pages (/warranty, /faqs…) share this dynamic segment with categories.
  if (INFO_PAGES[category]) return <InfoPageView page={category} />;
  const [facets, sp] = await Promise.all([getFacets(category), searchParams]);
  if (!facets) notFound();
  const c = facets.category;
  const lp = parseListParams(sp);
  const { products, total, page, pages } = await listProducts({ ...lp, category });
  const slot = c.builderSlot as Slot | null;

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ name: "Shop", href: "/shop" }, { name: c.name, href: `/${c.slug}` }]} />
      <header className="mt-5 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{c.name}</h1>
          {c.description && <p className="mt-3 text-lg text-muted">{c.description}</p>}
        </div>
        {slot && (
          <Link href={`/pc-builder?step=${slot}`} className="stage group flex items-center gap-4 rounded-2xl px-5 py-4">
            <Cpu className="h-6 w-6 text-accent" />
            <span>
              <span className="block text-sm font-bold">Building a PC?</span>
              <span className="block text-sm text-muted">Choose {SLOT_META[slot].label.toLowerCase()} with live compatibility checks</span>
            </span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[250px_1fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between gap-3 lg:hidden">
            <p className="text-sm text-muted">{total} products</p>
            <div className="flex gap-2">
              <CatalogFilters facets={facets} />
              <SortSelect />
            </div>
          </div>
          <div className="hidden lg:block"><CatalogFilters facets={facets} /></div>
        </div>
        <div>
          <div className="mb-5 hidden items-center justify-between lg:flex">
            <p className="text-sm text-muted"><span className="font-semibold text-ink">{total}</span> products</p>
            <SortSelect />
          </div>
          <ProductGrid products={products} />
          <Pagination page={page} pages={pages} base={`/${c.slug}`} params={lp.flat} />
        </div>
      </div>
    </div>
  );
}
