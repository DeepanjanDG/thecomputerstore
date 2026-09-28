import type { Metadata } from "next";
import { BuilderApp, type BuilderInitial } from "@/components/builder/builder-app";
import { AddOnMount } from "@/components/builder/add-on-mount";
import { getBuild, getTemplateItems, getTemplates } from "@/server/builds";
import { getProduct, toBuilderProduct } from "@/server/catalog";
import { SLOTS, type Slot } from "@/lib/compat/types";

export const metadata: Metadata = {
  title: "Custom PC Builder — Check Compatibility in Real Time",
  description:
    "Build a custom PC part by part. Real-time compatibility checks for socket, memory, GPU clearance, cooler height and PSU wattage. Save, share, get a PDF quotation or order from The Computer Store, Shillong.",
  alternates: { canonical: "/pc-builder" },
};

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function PcBuilderPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : sp[k]) as string | undefined;

  let initial: BuilderInitial | null = null;
  const template = one("template");
  const code = one("build");
  const add = one("add");
  if (template) {
    const t = await getTemplateItems(template);
    if (t) initial = { items: t.items, name: t.template.name, useCase: t.template.useCase, label: `Loaded the ${t.template.name} template`, key: `tpl:${template}` };
  } else if (code) {
    const bld = await getBuild(code);
    if (bld) initial = { items: bld.items, name: bld.build.name, useCase: bld.build.useCase, label: `Loaded build ${bld.build.code}`, key: `build:${code}` };
  }

  const templates = (await getTemplates({ showcase: false })).map((t) => ({ slug: t.slug, name: t.name, tagline: t.tagline, total: t.total }));
  const step = one("step");
  const start = one("start");

  return (
    <>
      {add && <AddFromCatalog slug={add} />}
      <BuilderApp
        initial={initial}
        templates={templates}
        step={SLOTS.includes(step as Slot) ? (step as Slot) : null}
        start={start === "cpu" || start === "gpu" || start === "budget" ? start : null}
        use={one("use") ?? null}
      />
    </>
  );
}

/** ?add=<product-slug> — adds a catalogue product to the local build (handled client-side). */
async function AddFromCatalog({ slug }: { slug: string }) {
  const p = await getProduct(slug);
  if (!p || !p.category.builderSlot) return null;
  return <AddOnMount product={toBuilderProduct(p)} />;
}
