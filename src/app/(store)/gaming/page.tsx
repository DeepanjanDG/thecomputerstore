import type { Metadata } from "next";
import Link from "next/link";
import { ProductArt } from "@/components/product/product-art";
import { ArrowRight, Gamepad2, Headphones, Keyboard, Laptop, Monitor, Mouse } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { GamingBand, SectionHeading } from "@/components/home/sections";
import { TemplateCard } from "@/components/build/template-card";
import { ProductCard } from "@/components/product/product-card";
import { getTemplates } from "@/server/builds";
import { listProducts, toBuilderProduct, toCard } from "@/server/catalog";

export const metadata: Metadata = {
  title: "Gaming PCs, Laptops, GPUs & Gear",
  description: "Gaming PCs built in Shillong, RTX and Radeon graphics cards, gaming laptops, high-refresh monitors and peripherals. Build by resolution or budget.",
  alternates: { canonical: "/gaming" },
};

export const revalidate = 300;

const SHELVES = [
  { title: "Graphics Cards", slug: "graphics-cards" },
  { title: "Gaming Laptops", slug: "gaming-laptops" },
  { title: "Gaming Monitors", slug: "monitors" },
];

export default async function GamingPage() {
  const [templates, ...shelves] = await Promise.all([
    getTemplates({ showcase: false }),
    ...SHELVES.map((s) => listProducts({ category: s.slug, perPage: 4, sort: "popular" })),
  ]);
  const gaming = templates.filter((t) => t.useCase === "gaming");
  const cats = [
    { href: "/gaming-pcs", label: "Gaming PCs", icon: Gamepad2 },
    { href: "/gaming-laptops", label: "Gaming Laptops", icon: Laptop },
    { href: "/graphics-cards", label: "GPUs", icon: Gamepad2 },
    { href: "/monitors", label: "Monitors", icon: Monitor },
    { href: "/keyboards", label: "Keyboards", icon: Keyboard },
    { href: "/mouse", label: "Mouse", icon: Mouse },
    { href: "/headsets", label: "Headsets", icon: Headphones },
    { href: "/accessories", label: "Accessories", icon: Gamepad2 },
  ];

  return (
    <>
      <section className="stage relative overflow-hidden">
        <div className="grid-bg absolute inset-0 opacity-40" aria-hidden />
        <div className="absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-accent/30 blur-[120px]" aria-hidden />
        <div className="absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-[#8b5cf6]/25 blur-[120px]" aria-hidden />
        <div className="container-x relative grid items-center gap-8 py-16 sm:py-20 lg:grid-cols-[1.25fr_1fr]">
          <div>
          <p className="eyebrow animate-reveal">Gaming</p>
          <h1 className="mt-4 max-w-3xl animate-reveal text-5xl font-extrabold tracking-tight [animation-delay:80ms] sm:text-7xl">Your next gaming machine starts here.</h1>
          <p className="mt-5 max-w-xl animate-reveal text-lg text-muted [animation-delay:160ms]">Built around the games you play and the monitor you own — checked for compatibility, assembled and stress-tested in Shillong.</p>
          <div className="mt-9 flex animate-reveal flex-wrap gap-3 [animation-delay:240ms]">
            <LinkButton href="/pc-builder?use=gaming" size="lg">Build a Gaming PC <ArrowRight className="h-5 w-5" /></LinkButton>
            <LinkButton href="/gaming-pcs" size="lg" variant="secondary">Browse Gaming PCs</LinkButton>
          </div>
          </div>
          <div className="relative mx-auto hidden aspect-square w-full max-w-[440px] animate-reveal [animation-delay:200ms] lg:block" aria-hidden>
            <div className="animate-float absolute inset-0">
              <ProductArt category="graphics-cards" brand="NVIDIA" specs={{ gpuBrand: "NVIDIA" }} label="" />
            </div>
          </div>
        </div>
      </section>

      <div className="container-x mt-10">
        <nav aria-label="Gaming categories" className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {cats.map((c) => (
            <Link key={c.label} href={c.href} className="card card-hover flex flex-col items-center gap-2 p-4 text-center text-sm font-semibold">
              <c.icon className="h-6 w-6 text-accent" /> {c.label}
            </Link>
          ))}
        </nav>
      </div>

      <GamingBand />

      <section className="container-x py-12" aria-labelledby="gpcs-h">
        <SectionHeading eyebrow="Gaming PCs" title={<span id="gpcs-h">Ready-to-customise gaming builds</span>} action={<LinkButton href="/gaming-pcs" variant="secondary">All gaming PCs <ArrowRight className="h-4 w-4" /></LinkButton>} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{gaming.slice(0, 4).map((t) => <TemplateCard key={t.slug} t={t} />)}</div>
      </section>

      {SHELVES.map((s, i) => (
        <section key={s.slug} className="container-x py-10" aria-labelledby={`shelf-${s.slug}`}>
          <SectionHeading title={<span id={`shelf-${s.slug}`}>{s.title}</span>} action={<LinkButton href={`/${s.slug}`} variant="secondary">View all <ArrowRight className="h-4 w-4" /></LinkButton>} className="mb-6" />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {shelves[i].products.map((p) => <ProductCard key={p.id} p={toCard(p)} bp={p.category.builderSlot ? toBuilderProduct(p) : null} />)}
          </div>
        </section>
      ))}
    </>
  );
}
