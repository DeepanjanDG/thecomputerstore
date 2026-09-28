import type { MetadataRoute } from "next";
import { db } from "@/server/db";
import { SITE } from "@/lib/site";
import { GUIDES } from "@/content/guides";
import { INFO_PAGES } from "@/content/pages";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, templates] = await Promise.all([
    db.category.findMany({ where: { isActive: true }, select: { slug: true } }),
    db.product.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } }),
    db.buildTemplate.findMany({ where: { isActive: true }, select: { slug: true } }),
  ]);
  const u = (path: string, priority = 0.6, lastModified?: Date) => ({ url: `${SITE.url}${path}`, priority, lastModified });
  return [
    u("/", 1), u("/pc-builder", 0.95), u("/shop", 0.8), u("/gaming", 0.8), u("/gaming-pcs", 0.8), u("/builds", 0.8), u("/deals", 0.7),
    u("/compare", 0.5), u("/about", 0.5), u("/contact", 0.6), u("/quote", 0.6), u("/guides", 0.5),
    ...Object.keys(INFO_PAGES).map((p) => u(`/${p}`, 0.3)),
    ...GUIDES.map((g) => u(`/guides/${g.slug}`, 0.5)),
    ...categories.map((c) => u(`/${c.slug}`, 0.8)),
    ...templates.map((t) => u(`/builds/${t.slug}`, 0.6)),
    ...products.map((p) => u(`/product/${p.slug}`, 0.7, p.updatedAt)),
  ];
}
