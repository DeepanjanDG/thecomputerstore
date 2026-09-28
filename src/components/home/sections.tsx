import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BadgeCheck, CheckCircle2, ChevronRight, Cpu, FileText, Gauge, HeartHandshake, MapPin, MessageCircle,
  Monitor, PackageCheck, Phone, Share2, ShieldCheck, Sparkles, Store, Wrench, Zap,
} from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/layout/brand-icons";
import { ProductArt } from "@/components/product/product-art";
import { BrandLogo } from "@/components/brand-logo";
import { USE_CASES } from "@/content/use-cases";
import { SITE, fullAddress } from "@/lib/site";
import { formatINR } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";
import { SLOT_META, STEP_ORDER } from "@/lib/compat/slots";
import type { BuildItems } from "@/lib/compat/types";
import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, body, action, className, center }: { eyebrow?: string; title: React.ReactNode; body?: string; action?: React.ReactNode; className?: string; center?: boolean }) {
  return (
    <div className={cn("mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between", center && "items-center text-center md:flex-col md:items-center", className)} data-reveal>
      <div className={cn("max-w-2xl", center && "mx-auto")}>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-[26px] font-extrabold leading-tight tracking-tight sm:text-[30px]">{title}</h2>
        {body && <p className="mt-2 text-[15.5px] text-muted">{body}</p>}
      </div>
      {action}
    </div>
  );
}

/** "Shop by Category" tiles: product photo when we have one, category render otherwise. */
export function CategoryGrid({ categories, covers }: { categories: { slug: string; name: string; count: number }[]; covers: Record<string, string> }) {
  return (
    <section className="container-x pt-14" aria-labelledby="cats-title">
      <SectionHeading
        title={<span id="cats-title">Shop by Category</span>}
        action={<Link href="/shop" className="link-more">View All <ArrowRight className="h-4 w-4" /></Link>}
      />
      <ul className="no-scrollbar -mx-[18px] flex snap-x gap-3 overflow-x-auto px-[18px] pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
        {categories.slice(0, 16).map((c, i) => (
          <li key={c.slug} data-reveal data-reveal-delay={(i % 8) * 40} className="w-[112px] shrink-0 snap-start sm:w-auto">
            <Link href={`/${c.slug}`} className="card card-hover group flex h-full flex-col items-center px-2 pb-3 pt-2 text-center">
              <span className="relative block aspect-square w-full max-w-[112px]">
                {covers[c.slug] ? (
                  <Image src={covers[c.slug]} alt="" fill sizes="112px" className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.06]" />
                ) : (
                  <span className="absolute inset-0 p-2 transition-transform duration-500 group-hover:scale-[1.06]">
                    <ProductArt category={c.slug} label="" />
                  </span>
                )}
              </span>
              <span className="mt-1 text-[13px] font-semibold leading-tight text-ink group-hover:text-accent">{c.name}</span>
              <span className="mt-0.5 text-[11px] text-muted">{c.count} items</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Promo card for the deals page, in the style of a retail offer banner. */
export function DealsBanner({ maxOff }: { maxOff: number }) {
  return (
    <div className="card flex flex-col overflow-hidden p-5 sm:p-6" data-reveal>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-extrabold tracking-tight">Deals &amp; Offers</h2>
        <Link href="/deals" className="link-more">View All <ArrowRight className="h-4 w-4" /></Link>
      </div>
      <Link href="/deals" className="group relative flex min-h-[220px] flex-1 overflow-hidden rounded-[14px] bg-[linear-gradient(120deg,#0b1a36_0%,#1a3fae_55%,#5b3fd6_100%)] p-6 text-white">
        <div className="relative z-10 max-w-[60%]">
          <p className="text-lg font-bold leading-tight">Upgrade Your Setup</p>
          <p className="mt-1 text-3xl font-extrabold leading-tight tracking-tight text-[#7cc4ff]">{maxOff > 0 ? `Up to ${maxOff}% Off` : "Today's deals"}</p>
          <p className="mt-2 text-sm text-white/75">on components, monitors, accessories &amp; more</p>
          <span className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold transition-transform group-hover:translate-x-0.5">
            Shop Deals <ArrowRight className="h-4 w-4" />
          </span>
        </div>
        <div className="absolute -bottom-4 -right-6 h-[88%] w-[55%] transition-transform duration-700 group-hover:scale-105" aria-hidden>
          <ProductArt category="headsets" brand="Razer" label="" />
        </div>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#22d3ee]/25 blur-3xl" aria-hidden />
      </Link>
    </div>
  );
}

export function UseCaseGrid() {
  return (
    <section className="container-x py-14" aria-labelledby="usecase-title">
      <SectionHeading eyebrow="Quick start" title={<span id="usecase-title">How do you want to build?</span>} body="Pick what you'll use it for. We'll start you with a balanced, compatible configuration you can change freely." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {USE_CASES.map((u, i) => (
          <Link
            key={u.id}
            href={`/pc-builder?use=${u.id}`}
            data-reveal
            data-reveal-delay={i * 60}
            className="card card-hover group relative flex flex-col overflow-hidden p-6"
          >
            <span className="grid h-14 w-14 place-items-center rounded-xl bg-accent-soft text-3xl transition-transform duration-300 group-hover:scale-110" aria-hidden>
              {u.emoji}
            </span>
            <h3 className="mt-5 text-lg font-bold">{u.title}</h3>
            <p className="mt-1.5 text-sm text-muted">{u.description}</p>
            <p className="mt-5 font-mono text-sm font-semibold">{u.range}</p>
            <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-accent">
              {u.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function BuilderPreview({ demo }: { demo: { name: string; items: BuildItems; total: number; estimatedW: number; psuW: number | null; compatible: number } | null }) {
  const features = [
    { icon: ShieldCheck, title: "Real-time Compatibility", body: "25 checks, no wrong parts" },
    { icon: Zap, title: "Live Pricing", body: "In-stock prices, updated live" },
    { icon: Gauge, title: "Estimated Wattage", body: "Know your power needs" },
    { icon: Share2, title: "Save & Share Build", body: "Link, PDF quote or WhatsApp" },
  ];
  return (
    <section className="container-x pt-14" aria-labelledby="builder-preview-title">
      <div className="stage relative overflow-hidden rounded-[20px] border border-accent/10">
        <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-accent/15 blur-[110px]" aria-hidden />
        <div className="relative grid gap-10 px-6 pb-8 pt-10 sm:px-10 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:pt-12">
          <div data-reveal>
            <p className="eyebrow">The signature feature</p>
            <h2 id="builder-preview-title" className="mt-3 text-4xl font-extrabold tracking-tight text-accent sm:text-[46px]">
              Custom PC Builder
            </h2>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-ink-2">
              Choose, compare and build a PC that fits your needs, with real-time compatibility checks on every part.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/pc-builder" size="lg">Start Building <ArrowRight className="h-5 w-5" /></LinkButton>
              <LinkButton href="/pc-builder?start=budget" size="lg" variant="secondary"><Sparkles className="h-5 w-5" /> Build it for me</LinkButton>
            </div>
          </div>

          {/* Mock "Your Build" panel populated with a real template */}
          <div data-reveal data-reveal-delay="120" className="rounded-[16px] border border-line bg-surface p-5 shadow-lift sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Your build</p>
                <p className="mt-1 text-xl font-bold">{demo?.name ?? "BLACKOUT"}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ok-soft px-3 py-1.5 text-sm font-semibold text-ok">
                <CheckCircle2 className="h-4 w-4" /> {demo?.compatible ?? 8}/8 compatible
              </span>
            </div>
            <ul className="mt-4 grid gap-x-5 divide-y divide-line sm:grid-cols-2 sm:divide-y-0">
              {demo && STEP_ORDER.filter((s) => demo.items[s]).map((s) => {
                const l = demo.items[s]!;
                return (
                  <li key={s} className="flex min-w-0 items-center gap-3 py-2 sm:border-b sm:border-line">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface-2 p-1">
                      <ProductArt category={l.product.categorySlug} brand={l.product.brand} specs={l.product.specs} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted">{SLOT_META[s].short}</span>
                      <span className="block truncate text-[13px] font-semibold">{l.product.name}</span>
                    </span>
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-ok" aria-label="Compatible" />
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-surface-2 p-4 text-center">
              <div><p className="text-xs text-muted">Est. power</p><p className="font-mono font-semibold">~{demo?.estimatedW ?? 0}W</p></div>
              <div><p className="text-xs text-muted">PSU</p><p className="font-mono font-semibold">{demo?.psuW ?? "—"}W ✓</p></div>
              <div><p className="text-xs text-muted">Total</p><p className="font-mono font-semibold text-accent">{demo ? formatINR(demo.total) : "—"}</p></div>
            </div>
          </div>
        </div>
        <ul className="relative grid grid-cols-2 gap-4 border-t border-accent/10 bg-surface/60 px-6 py-5 sm:px-10 lg:grid-cols-4">
          {features.map((f) => (
            <li key={f.title} className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface text-accent shadow-sm ring-1 ring-line"><f.icon className="h-[18px] w-[18px]" /></span>
              <span className="min-w-0">
                <span className="block text-[13.5px] font-semibold leading-tight">{f.title}</span>
                <span className="block text-xs text-muted">{f.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

type ShowcaseBuild = { slug: string; name: string; tagline: string | null; accent: string | null; total: number; items: BuildItems };

function buildLines(b: ShowcaseBuild) {
  const spec = (slot: "cpu" | "gpu" | "ram" | "ssd") => b.items[slot]?.product;
  const ram = spec("ram"), ssd = spec("ssd");
  return [
    spec("cpu")?.name.replace(/^(AMD|Intel)\s+/, ""),
    spec("gpu")?.specs.chipset ? `${spec("gpu")?.specs.gpuBrand === "AMD" ? "Radeon" : "GeForce"} ${spec("gpu")?.specs.chipset}` : undefined,
    ram ? `${Number(ram.specs.capacity) * (b.items.ram?.qty ?? 1)}GB ${ram.specs.ramType}` : undefined,
    ssd ? `${Number(ssd.specs.capacity) >= 1000 ? `${Number(ssd.specs.capacity) / 1000}TB` : `${ssd.specs.capacity}GB`} ${ssd.specs.interface}` : undefined,
  ].filter(Boolean) as string[];
}

function BuildVisual({ b, className }: { b: ShowcaseBuild; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[12px] bg-[linear-gradient(160deg,var(--surface-2),var(--surface-3))]", className)}>
      <div className="absolute inset-0 opacity-80 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(circle at 50% 60%, ${b.accent ?? "#1a56e8"}40, transparent 65%)` }} />
      <div className="absolute inset-0 p-4 transition-transform duration-700 group-hover:scale-105">
        <ProductArt category="cabinets" brand="Lian Li" label={`${b.name} custom PC`} />
      </div>
    </div>
  );
}

export function ShowcaseGrid({ builds, compact }: { builds: ShowcaseBuild[]; compact?: boolean }) {
  if (compact) {
    return (
      <div className="card p-5 sm:p-6" data-reveal>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight">Pre-built PCs</h2>
          <Link href="/builds" className="link-more">View All <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {builds.map((b) => (
            <Link key={b.slug} href={`/builds/${b.slug}`} className="group flex flex-col rounded-[14px] border border-line p-3 transition-[border-color,box-shadow] hover:border-accent/40 hover:shadow-soft">
              <BuildVisual b={b} className="aspect-[4/3]" />
              <p className="mt-3 font-bold tracking-[0.02em]">{b.name}</p>
              <p className="line-clamp-1 text-xs text-muted">{b.tagline}</p>
              <p className="mt-2 text-lg font-extrabold">{formatINR(b.total)}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }
  return (
    <section className="container-x py-16" aria-labelledby="showcase-title">
      <SectionHeading
        eyebrow="Built in Shillong"
        title={<span id="showcase-title">Featured custom builds</span>}
        body="Finished configurations our technicians love. Order as-is, or open one in the builder and make it yours."
        action={<Link href="/builds" className="link-more">All builds <ArrowRight className="h-4 w-4" /></Link>}
      />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {builds.map((b, i) => (
          <article key={b.slug} data-reveal data-reveal-delay={i * 70} className="card card-hover group relative flex flex-col overflow-hidden p-3">
            <BuildVisual b={b} className="h-52" />
            <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
              <h3 className="text-xl font-extrabold tracking-[0.04em]">{b.name}</h3>
              <p className="mt-1 text-sm text-muted">{b.tagline}</p>
              <ul className="mt-4 space-y-1.5 font-mono text-[13px] text-ink-2">
                {buildLines(b).map((l) => <li key={l} className="flex items-center gap-2"><ChevronRight className="h-3.5 w-3.5 text-accent" />{l}</li>)}
              </ul>
              <p className="mt-5 text-2xl font-extrabold">{formatINR(b.total)}</p>
              <div className="mt-4 flex gap-2">
                <LinkButton href={`/builds/${b.slug}`} variant="secondary" size="sm" className="flex-1">View Build</LinkButton>
                <LinkButton href={`/pc-builder?template=${b.slug}`} size="sm" className="flex-1">Customize</LinkButton>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function GamingBand() {
  const res = [
    { id: "1080p", title: "1080p", sub: "High refresh esports & AAA", gpu: "RTX 5060 · RX 7600 class", from: "₹55K" },
    { id: "1440p", title: "1440p", sub: "The sweet spot for sharp, fast gaming", gpu: "RTX 5070 · RX 9070 XT class", from: "₹1.1L" },
    { id: "4K", title: "4K", sub: "Maximum detail, no compromises", gpu: "RTX 5080 and above", from: "₹2.5L" },
  ];
  const budgets = [
    { label: "Under ₹60K", q: "max=60000" },
    { label: "₹60K – ₹1L", q: "min=60000&max=100000" },
    { label: "₹1L – ₹1.5L", q: "min=100000&max=150000" },
    { label: "₹1.5L+", q: "min=150000" },
  ];
  return (
    <section className="container-x py-12" aria-labelledby="gaming-title">
      <SectionHeading eyebrow="Gaming" title={<span id="gaming-title">Build for the games you play</span>} action={<LinkButton href="/gaming" variant="secondary">Explore Gaming <ArrowRight className="h-4 w-4" /></LinkButton>} />
      <div className="grid gap-4 md:grid-cols-3">
        {res.map((r, i) => (
          <Link key={r.id} href={`/gaming-pcs?res=${r.id}`} data-reveal data-reveal-delay={i * 70} className="card card-hover group relative overflow-hidden p-7">
            <Monitor className="absolute -right-6 -top-6 h-36 w-36 text-surface-2 transition-transform duration-500 group-hover:scale-110" aria-hidden />
            <p className="relative text-5xl font-extrabold tracking-tight">{r.title}</p>
            <p className="relative mt-2 font-semibold">{r.sub}</p>
            <p className="relative mt-1 text-sm text-muted">{r.gpu}</p>
            <p className="relative mt-6 flex items-center justify-between text-sm">
              <span className="text-muted">From <span className="font-mono font-semibold text-ink">{r.from}</span></span>
              <span className="flex items-center gap-1 font-semibold text-accent">See builds <ArrowRight className="h-4 w-4" /></span>
            </p>
          </Link>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2" data-reveal>
        <span className="mr-2 text-sm font-semibold text-muted">Build by budget:</span>
        {budgets.map((b) => (
          <Link key={b.label} href={`/gaming-pcs?${b.q}`} className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold transition-colors hover:border-accent hover:text-accent">
            {b.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function WhyUs() {
  const items = [
    { icon: ShieldCheck, title: "Compatibility guaranteed", body: "Every custom PC is checked by our engine and by a technician before assembly. If we assemble it, it works." },
    { icon: Wrench, title: "Free assembly & testing", body: "Professional cable management, BIOS updates, driver setup and a stress test before handover." },
    { icon: PackageCheck, title: "Genuine products, real warranty", body: "Authorised-channel components with manufacturer warranty — and we handle the claim for you." },
    { icon: HeartHandshake, title: "After-sales that picks up the phone", body: "A real store in Police Bazar. Walk in, call, or WhatsApp us — we know your build." },
    { icon: Gauge, title: "Honest recommendations", body: "Performance tiers, not inflated FPS claims. We'll tell you when a cheaper part is just as good." },
    { icon: Zap, title: "Business & bulk IT", body: "Office PCs, printers, networking and CCTV for schools, offices and shops across the North East." },
  ];
  return (
    <section className="container-x py-16" aria-labelledby="why-title">
      <SectionHeading center eyebrow="Why The Computer Store" title={<span id="why-title">A PC shop that actually knows PCs</span>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <div key={it.title} data-reveal data-reveal-delay={i * 50} className="card p-7">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-accent-soft text-accent"><it.icon className="h-6 w-6" /></span>
            <h3 className="mt-5 text-lg font-bold">{it.title}</h3>
            <p className="mt-2 text-muted">{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LocalStore() {
  return (
    <section className="container-x py-6" aria-labelledby="visit-title">
      <div className="grid overflow-hidden rounded-[20px] border border-line bg-surface lg:grid-cols-2">
        <div className="p-8 sm:p-12" data-reveal>
          <p className="eyebrow">Visit our store</p>
          <h2 id="visit-title" className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Shillong&apos;s PC experts, on G.S. Road.</h2>
          <p className="mt-4 text-lg text-muted">
            Bring your parts list, your budget or just a question. See components in person, talk to a technician, and pick up your finished build from Police Bazar.
          </p>
          <ul className="mt-8 space-y-4">
            <li className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" /><span>{fullAddress}</span></li>
            <li className="flex gap-3"><Phone className="mt-0.5 h-5 w-5 shrink-0 text-accent" /><a href={SITE.phoneHref} className="hover:text-accent">{SITE.phone}</a></li>
            <li className="flex gap-3"><Store className="mt-0.5 h-5 w-5 shrink-0 text-accent" /><span>Serving Shillong, Meghalaya and customers across North East India — with delivery across India.</span></li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/contact#visit" variant="dark">Get directions</LinkButton>
            <a href={waLink("Hi! I'd like to talk to a PC expert.")} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#25D366] px-5 text-[15px] font-semibold text-[#062e16] hover:brightness-105">
              <WhatsAppIcon className="h-5 w-5" /> Talk to an expert
            </a>
            <LinkButton href="/quote" variant="secondary">Request a quote</LinkButton>
          </div>
        </div>
        <div className="relative min-h-[320px] bg-surface-2">
          <iframe
            title="Map showing The Computer Store, Police Bazar, Shillong"
            src={`https://www.google.com/maps?q=${encodeURIComponent(SITE.mapsQuery)}&output=embed`}
            className="absolute inset-0 h-full w-full border-0 grayscale-[30%] dark:invert-[0.9] dark:hue-rotate-180"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

export function Reviews({ reviews }: { reviews: { name: string; city: string; text: string; build?: string }[] }) {
  if (!reviews.length) return null;
  return (
    <section className="container-x py-16" aria-labelledby="reviews-title">
      <SectionHeading eyebrow="Customers" title={<span id="reviews-title">Built for people across the North East</span>} />
      <div className="grid gap-4 md:grid-cols-3">
        {reviews.map((r, i) => (
          <figure key={r.name} data-reveal data-reveal-delay={i * 70} className="card flex flex-col p-7">
            <MessageCircle className="h-6 w-6 text-accent" aria-hidden />
            <blockquote className="mt-4 flex-1 text-[17px] leading-relaxed">“{r.text}”</blockquote>
            <figcaption className="mt-6 border-t border-line pt-4">
              <p className="font-semibold">{r.name}</p>
              <p className="text-sm text-muted">{r.city}{r.build ? ` · ${r.build}` : ""}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export const FAQS = [
  { q: "Do I need to know about PC hardware to use the builder?", a: "No. The builder only shows parts that fit what you've already chosen, explains any issue in plain English, and tells you what to pick next. You can also let it build a balanced PC for your budget and tweak from there." },
  { q: "Do you assemble the PC for me?", a: "Yes — every custom PC ordered from us is assembled, cable-managed, BIOS-updated and stress-tested at our Shillong store at no extra charge." },
  { q: "Can I get a formal quotation for my office or institution?", a: "Yes. Download a PDF quotation straight from the builder, or submit a quote request and our team will get back to you with a formal quote." },
  { q: "Do you deliver outside Shillong?", a: "We serve customers across Meghalaya and the North East, and ship across India. Assembled PCs are packed with internal foam supports. Ask us for delivery timelines to your PIN code." },
  { q: "What about warranty?", a: "All components carry the manufacturer's warranty. Because you bought from us, you can bring the PC to our store and we'll diagnose it and handle the claim." },
  { q: "Do I need an account?", a: "No. You can build, save a share link, download quotations and request quotes as a guest. An account lets you keep multiple builds, orders and quotations in one place." },
];

export function Faq() {
  return (
    <section className="container-x py-12" aria-labelledby="faq-title">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div data-reveal>
          <p className="eyebrow">FAQ</p>
          <h2 id="faq-title" className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Questions, answered.</h2>
          <p className="mt-4 text-muted">Can&apos;t find what you&apos;re looking for? <Link href="/contact" className="font-semibold text-accent hover:underline">Contact our team</Link>.</p>
        </div>
        <div className="divide-y divide-line rounded-[16px] border border-line bg-surface" data-reveal>
          {FAQS.map((f) => (
            <details key={f.q} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {f.q}
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-2 transition-transform group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="mt-3 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="container-x pt-12" aria-labelledby="final-cta-title">
      <div className="stage relative overflow-hidden rounded-[20px] px-6 py-16 text-center sm:px-12 sm:py-24">
        <div className="grid-bg absolute inset-0 opacity-50" aria-hidden />
        <div className="absolute left-1/2 top-full h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-[120px]" aria-hidden />
        <div className="relative" data-reveal>
          <h2 id="final-cta-title" className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
            Your next PC starts with one part.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted">Pick a processor, a graphics card, or just a budget. We&apos;ll handle the rest.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <LinkButton href="/pc-builder" size="lg">Build Your PC <ArrowRight className="h-5 w-5" /></LinkButton>
            <LinkButton href="/pc-builder?start=gpu" size="lg" variant="secondary">Start with your GPU</LinkButton>
            <a href={waLink("Hi! I'd like help planning a PC build.")} target="_blank" rel="noopener noreferrer" className="inline-flex h-13 items-center gap-2 rounded-2xl bg-[#25D366] px-7 font-semibold text-[#062e16] hover:brightness-105">
              <WhatsAppIcon className="h-5 w-5" /> Talk to an expert
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BrandStrip({ brands, title = "Brands we carry", stage = false }: { brands: { name: string; count: number }[]; title?: string; stage?: boolean }) {
  return (
    <section className="container-x py-12" aria-labelledby="brands-title">
      <div className={cn("rounded-[20px] border border-line p-6 sm:p-10", stage ? "stage" : "bg-surface")} data-reveal>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <h2 id="brands-title" className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
          <p className="text-sm text-muted">Genuine products through authorised channels.</p>
        </div>
        <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-4 lg:grid-cols-6">
          {brands.map((b) => (
            <li key={b.name} className={stage ? "bg-surface" : "bg-surface"}>
              <Link
                href={`/search?q=${encodeURIComponent(b.name)}`}
                className="group flex h-24 flex-col items-center justify-center gap-2 px-4 text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                aria-label={`${b.name} — ${b.count} products`}
              >
                <BrandLogo name={b.name} height={24} />
                <span className="text-[11px] font-medium opacity-0 transition-opacity group-hover:opacity-100">{b.count} products</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
