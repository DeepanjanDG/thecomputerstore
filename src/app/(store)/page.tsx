import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { HeroSlider } from "@/components/home/hero-slider";
import {
  BrandStrip, BuilderPreview, CategoryGrid, DealsBanner, Faq, FAQS, FinalCta, GamingBand, LocalStore, Reviews, SectionHeading, ShowcaseGrid, UseCaseGrid, WhyUs,
} from "@/components/home/sections";
import { ProductCard } from "@/components/product/product-card";
import { getTemplates } from "@/server/builds";
import { getCategories, getCategoryCovers, getFeaturedBrands, getHomeSlides, listProducts, toBuilderProduct, toCard } from "@/server/catalog";
import { TrustStrip } from "@/components/layout/trust-strip";
import { getEngineConfig, getSetting } from "@/server/config";
import { validateBuild } from "@/lib/compat/service";
import { discountPct } from "@/lib/format";
import { SITE } from "@/lib/site";
import { JsonLd } from "@/components/seo";

export const revalidate = 300;

export default async function HomePage() {
  const [home, showcase, featured, cfg, brands, categories, covers, deals, slides] = await Promise.all([
    getSetting("home"),
    getTemplates({ showcase: true }),
    listProducts({ featured: true, perPage: 8, sort: "popular" }),
    getEngineConfig(),
    getFeaturedBrands(18),
    getCategories(),
    getCategoryCovers(),
    listProducts({ deals: true, perPage: 48 }),
    getHomeSlides(),
  ]);
  const maxOff = deals.products.reduce((m, p) => Math.max(m, discountPct(p.price, p.mrp)), 0);
  const demoTpl = showcase.find((t) => t.slug === "blackout") ?? showcase[0];
  const demoReport = demoTpl ? validateBuild(demoTpl.built, cfg) : null;
  const [l1, l2] = home.heroTitle.split("\n");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ComputerStore",
          name: SITE.name,
          url: SITE.url,
          telephone: SITE.phone,
          email: SITE.email,
          address: {
            "@type": "PostalAddress",
            streetAddress: `${SITE.address.line1}, ${SITE.address.line2}`,
            addressLocality: SITE.address.city,
            addressRegion: SITE.address.state,
            postalCode: SITE.address.pincode,
            addressCountry: "IN",
          },
          areaServed: ["Shillong", "Meghalaya", "North East India", "India"],
        }}
      />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />

      {/* ── Hero ── */}
      <section className="hero-wash relative overflow-hidden border-b border-line/60">
        <div className="container-x relative grid items-center gap-10 pb-24 pt-10 lg:grid-cols-[1fr_1fr] lg:pb-28 lg:pt-14">
          <div>
            <p className="animate-reveal text-[12px] font-bold uppercase tracking-[0.28em] text-ink-2">
              {home.heroEyebrow.split(/\s*[·|]\s*/).map((w, i, all) => (
                <span key={w} className={i % 2 ? "text-accent" : undefined}>
                  {w}{i < all.length - 1 && <span className="mx-2 text-muted">·</span>}
                </span>
              ))}
            </p>
            <h1 className="mt-5 text-[44px] font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-[68px]">
              <span className="block animate-reveal [animation-delay:80ms]">{l1}</span>
              <span className="block animate-reveal text-accent [animation-delay:160ms]">{l2}</span>
            </h1>
            <p className="mt-6 max-w-xl animate-reveal text-[17px] leading-8 text-ink-2 [animation-delay:240ms]">{home.heroSubtitle}</p>
            <div className="mt-8 flex animate-reveal flex-wrap gap-3 [animation-delay:320ms]">
              <LinkButton href="/pc-builder" size="lg">
                Build Your PC <ArrowRight className="h-5 w-5" />
              </LinkButton>
              <LinkButton href="/shop" size="lg" variant="secondary">
                Explore Products
              </LinkButton>
            </div>
            <dl className="mt-10 grid max-w-lg animate-reveal grid-cols-3 divide-x divide-line [animation-delay:400ms]">
              {home.stats.map((s) => (
                <div key={s.label} className="min-w-0 px-4 first:pl-0">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="text-2xl font-extrabold tracking-tight">{s.value}</dd>
                  <dd className="mt-0.5 max-w-[11rem] text-xs leading-snug text-muted">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="animate-reveal [animation-delay:200ms]">
            <HeroSlider slides={slides} />
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section className="container-x relative z-10 -mt-12" aria-label="Why shop with us">
        <div className="rounded-[16px] border border-line bg-surface px-5 py-5 shadow-soft sm:px-8">
          <TrustStrip />
        </div>
      </section>

      <CategoryGrid categories={categories.filter((c) => c._count.products > 0).map((c) => ({ slug: c.slug, name: c.name, count: c._count.products }))} covers={covers} />

      <BuilderPreview
        demo={demoTpl && demoReport ? {
          name: demoTpl.name, items: demoTpl.built, total: demoTpl.total,
          estimatedW: demoReport.power.estimatedW, psuW: demoReport.power.selectedW, compatible: demoReport.core.selected,
        } : null}
      />

      {/* ── Featured products ── */}
      <section className="container-x py-14" aria-labelledby="popular-title">
        <SectionHeading
          title={<span id="popular-title">Featured Products</span>}
          action={<Link href="/shop#components" className="link-more">View All <ArrowRight className="h-4 w-4" /></Link>}
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {featured.products.map((p, i) => (
            <div key={p.id} data-reveal data-reveal-delay={(i % 4) * 60}>
              <ProductCard p={toCard(p)} bp={p.category.builderSlot ? toBuilderProduct(p) : null} />
            </div>
          ))}
        </div>
      </section>

      <section className="container-x grid gap-5 pb-6 lg:grid-cols-[1.55fr_1fr]" aria-label="Pre-built PCs and deals">
        <ShowcaseGrid compact builds={showcase.slice(0, 3).map((t) => ({ slug: t.slug, name: t.name, tagline: t.tagline, accent: t.accent, total: t.total, items: t.built }))} />
        <DealsBanner maxOff={maxOff} />
      </section>

      <UseCaseGrid />

      <BrandStrip brands={brands} />

      <GamingBand />
      <WhyUs />
      <LocalStore />
      <Reviews reviews={home.reviews} />
      <Faq />
      <FinalCta />
    </>
  );
}
