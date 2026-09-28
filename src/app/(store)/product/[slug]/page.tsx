import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CheckCircle2, CircleDot, MapPin, RotateCcw, ShieldCheck, Star, Truck, Wrench } from "lucide-react";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { ProductCard, ProductVisual } from "@/components/product/product-card";
import { Price } from "@/components/product/price";
import { AddToBuilderButton, PurchaseBox } from "@/components/product/product-actions";
import { BuildFit } from "@/components/product/build-fit";
import { ProductArt } from "@/components/product/product-art";
import { WhatsAppIcon } from "@/components/layout/brand-icons";
import { JsonLd } from "@/components/seo";
import { formatSpec, getProduct, toBuilderProduct, toCard } from "@/server/catalog";
import { getRelated } from "@/server/related";
import { WishlistButton } from "@/components/product/wishlist-button";
import { BrandLogo } from "@/components/brand-logo";
import { SLOT_META } from "@/lib/compat/slots";
import type { Slot } from "@/lib/compat/types";
import { formatINR, stockLabel } from "@/lib/format";
import { SITE } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;
/** Rendered on first request, then cached and refreshed every 5 minutes (ISR). */
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  const desc = `${p.name} — ${formatINR(p.price)} at The Computer Store, Shillong. ${p.shortDesc ?? ""} ${p.warranty ?? ""}`.trim();
  return {
    title: `${p.name} Price in India`,
    description: desc.slice(0, 160),
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { title: p.name, description: desc, type: "website", images: p.images[0] ? [p.images[0].url] : undefined },
  };
}

const COMPAT_KEYS: Partial<Record<Slot, string[]>> = {
  cpu: ["socket", "generation", "memoryTypes", "tdp", "includesCooler", "integratedGpu"],
  motherboard: ["socket", "chipset", "formFactor", "ramType", "maxRam", "supportedGenerations", "biosUpdateGenerations"],
  cooler: ["sockets", "tdpRating", "height", "radiatorSize"],
  ram: ["ramType", "capacity", "modules", "speed"],
  gpu: ["length", "slots", "tgp", "recommendedPsu", "pcie8pin", "uses12vhpwr"],
  psu: ["wattage", "psuFormFactor", "pcie8pin", "has12vhpwr"],
  case: ["formFactors", "maxGpuLength", "maxGpuSlots", "maxCoolerHeight", "radiatorSupport", "psuFormFactor"],
  ssd: ["interface", "pcieGen", "formFactor"],
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const { alternatives, together } = await getRelated(p);
  const card = toCard(p);
  const bp = p.category.builderSlot ? toBuilderProduct(p) : null;
  const slot = p.category.builderSlot as Slot | null;
  const cartItem = { productId: p.id, slug: p.slug, name: p.name, brand: p.brand.name, category: p.category.slug, price: p.price, mrp: p.mrp, gstRate: p.gstRate, stock: card.stock, image: card.image };
  const specsByGroup = new Map<string, typeof p.specs>();
  for (const s of [...p.specs].sort((a, b) => a.spec.sortOrder - b.spec.sortOrder)) {
    if (s.spec.key === "performanceTier") continue;
    specsByGroup.set(s.spec.group, [...(specsByGroup.get(s.spec.group) ?? []), s]);
  }
  const compatRows = slot ? p.specs.filter((s) => COMPAT_KEYS[slot]?.includes(s.spec.key)) : [];
  const togetherTotal = p.price + together.reduce((s, t) => s + t.price, 0);
  const hasOverview = !!p.description && p.description.trim() !== (p.shortDesc ?? "").trim();

  return (
    <div className="container-x py-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          sku: p.sku,
          brand: { "@type": "Brand", name: p.brand.name },
          category: p.category.name,
          description: p.shortDesc ?? p.name,
          image: p.images.map((i) => `${SITE.url}${i.url}`),
          ...(p.rating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: Math.max(1, p.ratingCount) } } : {}),
          offers: {
            "@type": "Offer",
            url: `${SITE.url}/product/${p.slug}`,
            priceCurrency: "INR",
            price: p.price,
            availability: card.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            seller: { "@type": "Organization", name: SITE.name },
          },
        }}
      />
      <Breadcrumbs items={[{ name: p.category.name, href: `/${p.category.slug}` }, { name: p.name, href: `/product/${p.slug}` }]} />

      <div className="mt-5 grid gap-8 rounded-[20px] border border-line bg-surface p-4 shadow-sm sm:p-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        {/* Gallery */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="group relative overflow-hidden rounded-[14px] border border-line bg-surface-2/60">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_60%)]" aria-hidden />
            <ProductVisual image={card.image} category={p.category.slug} brand={p.brand.name} name={p.name} specs={bp?.specs} sizes="(min-width:1024px) 50vw, 100vw" priority className="relative" />
          </div>
          {p.images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {p.images.map((img, i) => (
                <div key={img.id} className={`relative aspect-square overflow-hidden rounded-[10px] border bg-surface ${i === 0 ? "border-accent" : "border-line"}`}>
                  <Image src={img.url} alt={img.alt ?? p.name} fill sizes="100px" loading="lazy" className="object-contain p-2" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buy box */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <Link href={`/search?q=${encodeURIComponent(p.brand.name)}`} className="inline-block text-ink-2 transition-colors hover:text-accent" aria-label={`More from ${p.brand.name}`}><BrandLogo name={p.brand.name} height={20} /></Link>
            <StockPill stock={card.stock} />
          </div>
          <h1 className="mt-2 text-[26px] font-extrabold leading-tight tracking-tight sm:text-[30px]">{p.name}</h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            {p.rating && (
              <span className="flex items-center gap-1.5">
                <Stars value={p.rating} />
                <span className="font-semibold text-ink">{p.rating.toFixed(1)}</span>
                <span>({p.ratingCount} {p.ratingCount === 1 ? "review" : "reviews"})</span>
              </span>
            )}
            <span className="font-mono text-xs">SKU {p.sku}</span>
          </div>

          <div className="mt-5">
            <Price price={p.price} mrp={p.mrp} size="xl" />
            <p className="mt-1 text-sm text-muted">Inclusive of {p.gstRate}% GST · GST invoice provided</p>
          </div>

          {(card.keySpecs.length > 0 || p.warranty) && (
            <ul className="mt-5 space-y-2 text-[14.5px] text-ink-2">
              {card.keySpecs.map((k) => (
                <li key={k.label} className="flex items-center gap-2.5">
                  <CircleDot className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                  <span><span className="text-muted">{k.label}:</span> {k.value}</span>
                </li>
              ))}
              {p.warranty && <li className="flex items-center gap-2.5"><ShieldCheck className="h-4 w-4 shrink-0 text-muted" aria-hidden /> {p.warranty}</li>}
            </ul>
          )}
          {p.shortDesc && <p className="mt-4 text-[15px] leading-relaxed text-muted">{p.shortDesc}</p>}

          <div className="mt-6 border-t border-line pt-6">
            <PurchaseBox item={cartItem}>
              <WishlistButton productId={p.id} boxed />
            </PurchaseBox>
            {bp && <AddToBuilderButton product={bp} size="lg" full className="mt-2.5" />}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <a href={waLink(`Hi! I'm interested in ${p.name} (${formatINR(p.price)}). Is it available?`)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold text-ink-2 hover:text-accent">
                <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> Ask on WhatsApp
              </a>
              {slot && <Link href={`/compare?ids=${p.id}`} className="text-sm font-semibold text-ink-2 hover:text-accent">Compare</Link>}
            </div>
          </div>

          {bp && <div className="mt-5"><BuildFit product={bp} /></div>}

          <ul className="mt-6 grid gap-3 rounded-[14px] bg-surface-2 p-4 text-sm sm:grid-cols-2">
            <li className="flex gap-3"><BadgeCheck className="h-5 w-5 shrink-0 text-accent" /> Genuine product via authorised channels</li>
            <li className="flex gap-3"><Wrench className="h-5 w-5 shrink-0 text-accent" /> Free installation when bought with a custom PC</li>
            <li className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-accent" /> Pick up at Police Bazar, Shillong</li>
            <li className="flex gap-3"><Truck className="h-5 w-5 shrink-0 text-accent" /> Delivery across the North East & India</li>
            <li className="flex gap-3"><RotateCcw className="h-5 w-5 shrink-0 text-accent" /> <Link href="/refund-policy" className="hover:underline">Returns & DOA policy</Link></li>
          </ul>
        </div>
      </div>

      {/* Section tabs */}
      <nav aria-label="Product sections" className="sticky top-[68px] z-20 mt-10 border-b border-line bg-bg/95 backdrop-blur lg:top-[118px]">
        <ul className="no-scrollbar flex gap-7 overflow-x-auto text-[15px] font-semibold">
          {[
            ["overview", "Overview", hasOverview],
            ["specs-h", "Specifications", specsByGroup.size > 0],
            ["compat-info-h", "Compatibility", compatRows.length > 0],
            ["fbt-h", "Bought Together", together.length > 0],
            ["alt-h", "Alternatives", alternatives.length > 0],
          ].filter(([, , show]) => show).map(([id, label], i) => (
            <li key={String(id)}>
              <a href={`#${id}`} className={`relative block whitespace-nowrap py-3 transition-colors hover:text-accent ${i === 0 ? "text-accent after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-accent" : "text-ink-2"}`}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>

      {hasOverview && (
        <section id="overview" className="scroll-mt-40 pt-8" aria-label="Overview">
          <p className="max-w-3xl whitespace-pre-line text-[15.5px] leading-relaxed text-ink-2">{p.description}</p>
        </section>
      )}

      {/* Frequently bought together */}
      {together.length > 0 && (
        <section className="mt-14 scroll-mt-40" aria-labelledby="fbt-h">
          <h2 id="fbt-h" className="text-2xl font-extrabold tracking-tight">Frequently bought together</h2>
          <p className="mt-1 text-muted">Compatible, in-stock parts that pair with this {slot ? SLOT_META[slot].label.toLowerCase() : "product"}.</p>
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-[16px] border border-line bg-surface p-5">
            {[bp!, ...together].map((t, i) => (
              <div key={t.id} className="flex items-center gap-3">
                {i > 0 && <span className="text-2xl text-muted" aria-hidden>+</span>}
                <Link href={`/product/${t.slug}`} className="flex w-56 items-center gap-3 rounded-2xl p-2 hover:bg-surface-2">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-surface-2 p-1"><ProductArt category={t.categorySlug} brand={t.brand} specs={t.specs} /></span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold uppercase text-muted">{SLOT_META[t.slot].short}</span>
                    <span className="line-clamp-2 text-sm font-semibold">{t.name}</span>
                    <span className="font-mono text-sm">{formatINR(t.price)}</span>
                  </span>
                </Link>
              </div>
            ))}
            <div className="ml-auto text-right">
              <p className="text-sm text-muted">Together</p>
              <p className="font-mono text-2xl font-bold">{formatINR(togetherTotal)}</p>
              <Link href={`/pc-builder?add=${p.slug}`} className="mt-1 inline-block text-sm font-semibold text-accent hover:underline">Continue in PC Builder →</Link>
            </div>
          </div>
        </section>
      )}

      {/* Specs */}
      <section className="mt-14 grid gap-10 lg:grid-cols-[1.4fr_1fr]" aria-labelledby="specs-h">
        <div>
          <h2 id="specs-h" className="scroll-mt-40 text-2xl font-extrabold tracking-tight">Technical specifications</h2>
          <div className="mt-5 space-y-6">
            {[...specsByGroup.entries()].map(([group, rows]) => (
              <div key={group}>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">{group}</h3>
                <dl className="divide-y divide-line overflow-hidden rounded-[12px] border border-line bg-surface">
                  {rows.map((s) => (
                    <div key={s.id} className="grid grid-cols-[1fr_1.4fr] gap-4 px-4 py-3 text-sm">
                      <dt className="text-muted">{s.spec.label}</dt>
                      <dd className="font-mono text-[13px] font-medium">{formatSpec(s)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
            {p.warranty && (
              <dl className="divide-y divide-line overflow-hidden rounded-[12px] border border-line bg-surface text-sm">
                <div className="grid grid-cols-[1fr_1.4fr] gap-4 px-4 py-3"><dt className="text-muted">Warranty</dt><dd>{p.warranty}</dd></div>
                <div className="grid grid-cols-[1fr_1.4fr] gap-4 px-4 py-3"><dt className="text-muted">Brand</dt><dd>{p.brand.name}</dd></div>
              </dl>
            )}
          </div>
        </div>
        {compatRows.length > 0 && (
          <aside aria-labelledby="compat-info-h" className="lg:sticky lg:top-40 lg:self-start">
            <div className="stage rounded-[16px] border border-accent/10 p-6">
              <h2 id="compat-info-h" className="scroll-mt-40 text-lg font-bold">Compatibility information</h2>
              <p className="mt-1 text-sm text-muted">These specs are what our builder checks against your other parts.</p>
              <dl className="mt-4 space-y-2.5 text-sm">
                {compatRows.map((s) => (
                  <div key={s.id} className="flex justify-between gap-4">
                    <dt className="text-muted">{s.spec.label}</dt>
                    <dd className="text-right font-mono text-[13px]">{formatSpec(s)}</dd>
                  </div>
                ))}
              </dl>
              <Link href={`/pc-builder?add=${p.slug}`} className="mt-5 flex h-11 items-center justify-center rounded-xl bg-accent font-semibold text-white">Build a PC with this</Link>
            </div>
          </aside>
        )}
      </section>

      {alternatives.length > 0 && (
        <section className="mt-14 scroll-mt-40" aria-labelledby="alt-h">
          <h2 id="alt-h" className="text-2xl font-extrabold tracking-tight">Alternatives to consider</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {alternatives.map((a) => <ProductCard key={a.id} p={toCard(a)} bp={a.category.builderSlot ? toBuilderProduct(a) : null} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="flex" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`h-4 w-4 ${value >= n - 0.25 ? "fill-[#f5a623] text-[#f5a623]" : value >= n - 0.75 ? "fill-[#f5a623]/50 text-[#f5a623]" : "fill-surface-3 text-line-strong"}`} />
      ))}
    </span>
  );
}

function StockPill({ stock }: { stock: number }) {
  const s = stockLabel(stock);
  const tone = s.tone === "ok" ? "bg-ok-soft text-ok" : s.tone === "warn" ? "bg-warn-soft text-warn" : "bg-bad-soft text-bad";
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold ${tone}`}>
      <CheckCircle2 className="h-3.5 w-3.5" /> {s.label}
    </span>
  );
}
