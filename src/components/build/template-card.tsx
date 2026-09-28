import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import type { BuildItems } from "@/lib/compat/types";
import { formatINR } from "@/lib/format";

export function templateHighlights(items: BuildItems) {
  const cpu = items.cpu?.product, gpu = items.gpu?.product, ram = items.ram?.product, ssd = items.ssd?.product;
  return [
    cpu?.name.replace(/^(AMD|Intel)\s+/, ""),
    gpu ? `${gpu.specs.gpuBrand === "AMD" ? "Radeon" : "GeForce"} ${gpu.specs.chipset}` : cpu?.specs.integratedGpu ? "Integrated graphics" : undefined,
    ram ? `${Number(ram.specs.capacity) * (items.ram?.qty ?? 1)}GB ${ram.specs.ramType}` : undefined,
    ssd ? `${Number(ssd.specs.capacity) >= 1000 ? `${Number(ssd.specs.capacity) / 1000}TB` : `${ssd.specs.capacity}GB`} ${ssd.specs.interface}` : undefined,
  ].filter(Boolean) as string[];
}

export function TemplateCard({ t }: { t: { slug: string; name: string; tagline: string | null; priceLabel: string | null; useCase: string; resolution: string | null; total: number; built: BuildItems } }) {
  return (
    <article className="card card-hover group flex flex-col p-6" data-reveal>
      <div className="flex items-center justify-between gap-2 text-xs font-semibold">
        <span className="rounded-full bg-accent-soft px-2.5 py-1 capitalize text-accent">{t.useCase}{t.resolution ? ` · ${t.resolution}` : ""}</span>
        {t.priceLabel && <span className="font-mono text-muted">{t.priceLabel}</span>}
      </div>
      <h3 className="mt-4 text-xl font-bold"><Link href={`/builds/${t.slug}`} className="hover:text-accent">{t.name}</Link></h3>
      <p className="mt-1 text-sm text-muted">{t.tagline}</p>
      <ul className="mt-4 space-y-1.5 font-mono text-[13px] text-ink-2">
        {templateHighlights(t.built).map((l) => <li key={l} className="flex items-center gap-2"><ChevronRight className="h-3.5 w-3.5 text-accent" />{l}</li>)}
      </ul>
      <p className="mt-5 text-2xl font-bold">{formatINR(t.total)}</p>
      <div className="mt-4 flex gap-2">
        <LinkButton href={`/builds/${t.slug}`} variant="secondary" size="sm" className="flex-1">View Build</LinkButton>
        <LinkButton href={`/pc-builder?template=${t.slug}`} size="sm" className="flex-1">Customize <ArrowRight className="h-4 w-4" /></LinkButton>
      </div>
    </article>
  );
}
