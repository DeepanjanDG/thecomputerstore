import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { searchWhere } from "@/server/catalog";
import { GUIDES } from "@/content/guides";

/** Autocomplete across products, categories, build templates and guides. */
export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 80);
  if (q.length < 2) return NextResponse.json({ products: [], categories: [], builds: [], guides: [] });
  const lc = q.toLowerCase();
  const [products, categories, builds] = await Promise.all([
    db.product.findMany({
      where: { status: "ACTIVE", ...searchWhere(q) },
      include: { brand: true, category: true, images: { take: 1, orderBy: { sortOrder: "asc" } } },
      orderBy: { popularity: "desc" },
      take: 6,
    }),
    db.category.findMany({
      where: { isActive: true, OR: [{ name: { contains: q, mode: "insensitive" } }, { shortName: { contains: q, mode: "insensitive" } }] },
      include: { _count: { select: { products: { where: { status: "ACTIVE" } } } } },
      take: 4,
    }),
    db.buildTemplate.findMany({
      where: { isActive: true, OR: [{ name: { contains: q, mode: "insensitive" } }, { tagline: { contains: q, mode: "insensitive" } }, { useCase: { contains: q, mode: "insensitive" } }] },
      take: 3,
    }),
  ]);
  return NextResponse.json({
    products: products.map((p) => ({ slug: p.slug, name: p.name, brand: p.brand.name, category: p.category.slug, price: p.price, image: p.images[0]?.url ?? null })),
    categories: categories.map((c) => ({ slug: c.slug, name: c.name, count: c._count.products })),
    builds: builds.map((b) => ({ slug: b.slug, name: b.name, tagline: b.tagline })),
    guides: GUIDES.filter((g) => `${g.title} ${g.excerpt}`.toLowerCase().includes(lc)).slice(0, 3).map((g) => ({ slug: g.slug, title: g.title })),
  });
}
