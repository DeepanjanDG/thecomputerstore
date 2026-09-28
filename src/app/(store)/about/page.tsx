import type { Metadata } from "next";
import { ArrowRight, Building2, Cpu, Gamepad2, HeartHandshake, ShieldCheck, Wrench } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { BrandStrip, LocalStore } from "@/components/home/sections";
import { getFeaturedBrands } from "@/server/catalog";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About The Computer Store, Shillong",
  description: "The Computer Store in Police Bazar, Shillong: laptops, desktops, custom PCs, components, printers, networking and CCTV — with local after-sales support.",
  alternates: { canonical: "/about" },
};

const PILLARS = [
  { icon: Cpu, title: "Computer hardware, properly explained", body: "From a single stick of RAM to a complete workstation, we help you choose parts that fit your work and your budget — and tell you when you don't need to spend more." },
  { icon: Wrench, title: "Custom builds, assembled in-house", body: "Every custom PC is assembled, cable-managed, updated and stress-tested by our technicians before it leaves the store." },
  { icon: Gamepad2, title: "Gaming, taken seriously", body: "Graphics cards, high-refresh monitors and peripherals — plus honest advice on what actually improves your frame rate." },
  { icon: Building2, title: "Business IT solutions", body: "Office PCs, printers, networking, CCTV, UPS and software licences for shops, schools, offices and institutions across Meghalaya." },
  { icon: HeartHandshake, title: "After-sales that stays local", body: "When something needs attention, you walk into a store on G.S. Road — not a courier queue. We handle warranty claims for what you buy from us." },
  { icon: ShieldCheck, title: "Trust, built over time", body: "Genuine products, GST invoices, and straightforward quotations. The kind of store you recommend to family." },
];

export const revalidate = 3600;

export default async function AboutPage() {
  const brands = await getFeaturedBrands(30);
  return (
    <>
      <section className="container-x py-14">
        <p className="eyebrow">About us</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-extrabold leading-[1.04] tracking-tight sm:text-7xl">
          Shillong&apos;s computer store, rebuilt around <span className="text-gradient">the way you buy tech today.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-xl text-muted">
          {SITE.name} has long been the one-stop store in Police Bazar for laptops, desktops, printers, peripherals and accessories. Today we&apos;re also a place to design your own PC — part by part, checked for compatibility, and built by people who do this every day.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <LinkButton href="/pc-builder" size="lg">Build Your PC <ArrowRight className="h-5 w-5" /></LinkButton>
          <LinkButton href="/contact" size="lg" variant="secondary">Visit the store</LinkButton>
        </div>
      </section>
      <section className="container-x py-10" aria-labelledby="pillars-h">
        <h2 id="pillars-h" className="sr-only">What we do</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p, i) => (
            <div key={p.title} className="card p-7" data-reveal data-reveal-delay={i * 50}>
              <p.icon className="h-7 w-7 text-accent" />
              <h3 className="mt-5 text-lg font-bold">{p.title}</h3>
              <p className="mt-2 text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>
      <BrandStrip brands={brands} title="Brands we work with" stage />
      <LocalStore />
    </>
  );
}
