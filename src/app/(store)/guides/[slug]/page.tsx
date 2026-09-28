import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { GUIDES } from "@/content/guides";
import { JsonLd } from "@/components/seo";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return GUIDES.map((g) => ({ slug: g.slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const g = GUIDES.find((x) => x.slug === slug);
  return g ? { title: g.title, description: g.excerpt, alternates: { canonical: `/guides/${g.slug}` } } : {};
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const g = GUIDES.find((x) => x.slug === slug);
  if (!g) notFound();
  return (
    <article className="container-x max-w-3xl py-10">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: g.title, description: g.excerpt, publisher: { "@type": "Organization", name: SITE.name } }} />
      <Breadcrumbs items={[{ name: "Guides", href: "/guides" }, { name: g.title, href: `/guides/${g.slug}` }]} />
      <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">{g.title}</h1>
      <p className="mt-3 text-lg text-muted">{g.excerpt}</p>
      <div className="mt-10 space-y-8">
        {g.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-2xl font-bold">{s.heading}</h2>
            {s.body.map((b, i) => <p key={i} className="mt-3 text-lg leading-relaxed text-ink-2">{b}</p>)}
          </section>
        ))}
      </div>
      {g.related && (
        <div className="mt-12 flex flex-wrap gap-3">
          {g.related.map((r) => <Link key={r.href} href={r.href} className="rounded-xl bg-accent px-5 py-3 font-semibold text-white">{r.label} →</Link>)}
        </div>
      )}
    </article>
  );
}
