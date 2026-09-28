import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Star } from "lucide-react";
import { ProductArt } from "./product-art";
import { BrandLogo } from "@/components/brand-logo";
import { Price, StockBadge } from "./price";
import { AddToBuilderButton, AddToCartButton } from "./product-actions";
import type { ProductCardData } from "@/server/catalog";
import type { BuilderProduct } from "@/lib/compat/types";
import { discountPct } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductVisual({ image, category, brand, name, specs, className, sizes = "(min-width: 1024px) 25vw, 50vw", priority }: {
  image: string | null; category: string; brand: string; name: string; specs?: Record<string, unknown>; className?: string; sizes?: string; priority?: boolean;
}) {
  return (
    <div className={cn("relative aspect-square overflow-hidden", className)}>
      {image ? (
        <Image src={image} alt={name} fill sizes={sizes} priority={priority} className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]" />
      ) : (
        <div className="absolute inset-0 p-5 transition-transform duration-500 group-hover:scale-[1.05]">
          <ProductArt category={category} brand={brand} specs={specs} label={name} />
        </div>
      )}
    </div>
  );
}

function compactCount(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}K` : String(n);
}

export function ProductCard({ p, bp, className, priority }: { p: ProductCardData; bp?: BuilderProduct | null; className?: string; priority?: boolean }) {
  const off = discountPct(p.price, p.mrp);
  const item = { productId: p.id, slug: p.slug, name: p.name, brand: p.brand, category: p.category.slug, price: p.price, mrp: p.mrp, gstRate: p.gstRate, stock: p.stock, image: p.image };
  return (
    <article className={cn("card card-hover group relative flex h-full flex-col overflow-hidden", className)}>
      <Link href={`/product/${p.slug}`} className="relative m-2 mb-0 block rounded-[10px] bg-surface-2/70" aria-label={p.name} tabIndex={-1}>
        <ProductVisual image={p.image} category={p.category.slug} brand={p.brand} name={p.name} specs={bp?.specs} priority={priority} />
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1.5">
          {off >= 10 && <span className="rounded-md bg-bad px-2 py-0.5 text-[11px] font-bold text-white">{off}% Off</span>}
          {p.isDeal && <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-bold text-white">Deal</span>}
        </div>
      </Link>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <div className="flex items-center justify-between gap-2 text-xs">
          <BrandLogo name={p.brand} height={13} className="min-w-0 text-ink-2" />
          {p.stock <= 0 && <StockBadge stock={p.stock} />}
        </div>
        <h3 className="mt-1.5 line-clamp-2 min-h-[2.6em] text-[14.5px] font-semibold leading-snug">
          <Link href={`/product/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {p.name}
          </Link>
        </h3>
        <p className="mt-0.5 text-xs text-muted">{p.category.name}</p>
        {p.rating ? (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted">
            <Star className="h-3.5 w-3.5 fill-[#f5a623] text-[#f5a623]" aria-hidden />
            <span className="font-semibold text-ink-2"><span className="sr-only">Rated </span>{p.rating.toFixed(1)}</span>
            {p.ratingCount > 0 && <span>({compactCount(p.ratingCount)})</span>}
          </p>
        ) : null}
        {p.keySpecs.length > 0 && (
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {p.keySpecs.slice(0, 3).map((s) => (
              <li key={s.label} className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[10.5px] text-ink-2" title={s.label}>
                {s.value}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto pt-3">
          <Price price={p.price} mrp={p.mrp} size="md" hidePct />
          {p.warranty && (
            <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-muted" title={p.warranty}>
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> {p.warranty.replace(" manufacturer warranty", "")}
            </p>
          )}
          <div className="relative z-10 mt-3 flex flex-col gap-2 sm:flex-row">
            {bp ? (
              <>
                <AddToBuilderButton product={bp} className="flex-1" />
                <AddToCartButton item={item} label="Cart" className="sm:px-3" />
              </>
            ) : (
              <AddToCartButton full item={item} />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
