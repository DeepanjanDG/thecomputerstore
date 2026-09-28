import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductArt } from "@/components/product/product-art";
import { getCategories } from "@/server/catalog";

export const metadata: Metadata = {
  title: "Shop All Categories",
  description: "PC components, laptops, desktops, monitors, peripherals, networking, CCTV, printers, UPS and software from The Computer Store, Shillong.",
  alternates: { canonical: "/shop" },
};

export const revalidate = 300;

export default async function ShopPage() {
  const cats = await getCategories();
  const groups = [...new Set(cats.map((c) => c.group))];
  return (
    <div className="container-x py-10">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Shop</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">Everything from a single SSD to a complete office setup — genuine products with local warranty support.</p>
      {groups.map((g) => (
        <section key={g} id={g.toLowerCase().replace(/[^a-z]+/g, "-")} className="mt-12 scroll-mt-24" aria-labelledby={`g-${g}`}>
          <div className="flex items-end justify-between">
            <h2 id={`g-${g}`} className="text-2xl font-extrabold tracking-tight">{g}</h2>
            {g === "Components" && <Link href="/pc-builder" className="flex items-center gap-1 text-sm font-semibold text-accent">Not sure? Use the PC Builder <ArrowRight className="h-4 w-4" /></Link>}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {cats.filter((c) => c.group === g).map((c) => (
              <Link key={c.slug} href={`/${c.slug}`} className="card card-hover group flex flex-col items-center p-5 text-center">
                <span className="h-24 w-24 transition-transform duration-500 group-hover:scale-110"><ProductArt category={c.slug} label={c.name} /></span>
                <span className="mt-3 font-semibold">{c.name}</span>
                <span className="text-xs text-muted">{c._count.products} products</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
