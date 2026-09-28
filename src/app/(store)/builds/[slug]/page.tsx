import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { BuildTable, BuildTotals } from "@/components/build/build-view";
import { BuildActions } from "@/components/build/build-cta";
import { ProductArt } from "@/components/product/product-art";
import { templateHighlights } from "@/components/build/template-card";
import { getTemplateItems } from "@/server/builds";
import { getEngineConfig } from "@/server/config";
import { priceBuild, validateBuild } from "@/lib/compat/service";
import { scoreBuild } from "@/lib/compat/score";
import { formatINR } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTemplateItems(slug);
  if (!t) return {};
  const total = priceBuild(t.items).total;
  return {
    title: `${t.template.name} — ${formatINR(total)} Custom PC`,
    description: `${t.template.tagline}. ${templateHighlights(t.items).join(", ")}. Assembled and tested in Shillong.`,
    alternates: { canonical: `/builds/${slug}` },
  };
}

export default async function TemplatePage({ params }: Props) {
  const { slug } = await params;
  const t = await getTemplateItems(slug);
  if (!t) notFound();
  const cfg = await getEngineConfig();
  const report = validateBuild(t.items, cfg);
  const pricing = priceBuild(t.items);
  const score = scoreBuild(t.items, report, cfg.scoring);
  const tpl = t.template;

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ name: "Builds", href: "/builds" }, { name: tpl.name, href: `/builds/${tpl.slug}` }]} />
      <div className="stage relative mt-6 grid overflow-hidden rounded-[32px] lg:grid-cols-[1.2fr_1fr]">
        <div className="relative z-10 p-8 sm:p-12">
          <p className="eyebrow capitalize">{tpl.useCase}{tpl.resolution ? ` · ${tpl.resolution}` : ""}</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-6xl">{tpl.name}</h1>
          <p className="mt-3 text-xl text-ink-2">{tpl.tagline}</p>
          <p className="mt-4 max-w-xl text-muted">{tpl.description}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {templateHighlights(t.items).map((h) => <li key={h} className="rounded-full border border-line px-3 py-1 font-mono text-sm">{h}</li>)}
          </ul>
          <p className="mt-8 font-mono text-4xl font-bold">{formatINR(pricing.total)}</p>
        </div>
        <div className="relative min-h-72">
          <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 55%, ${tpl.accent ?? "#3d8bff"}55, transparent 65%)` }} aria-hidden />
          <div className="absolute inset-8"><ProductArt category="cabinets" brand="Lian Li" label={`${tpl.name} PC`} /></div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] [&>*]:min-w-0">
        <div className="space-y-8">
          <BuildTable items={t.items} report={report} />
          {score.ready && (
            <section aria-labelledby="analysis-h">
              <h2 id="analysis-h" className="text-xl font-bold">Build analysis</h2>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {score.lines.map((l) => (
                  <div key={l.key} className="card p-4">
                    <dt className="text-sm text-muted">{l.label}</dt>
                    <dd className="mt-1 text-lg font-bold">✓ {l.value}</dd>
                    <dd className="mt-1 text-xs text-muted">{l.detail}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <BuildTotals pricing={pricing} report={report} />
          <BuildActions name={tpl.name} code={null} items={t.items} report={report} total={pricing.total} />
        </div>
      </div>
    </div>
  );
}
