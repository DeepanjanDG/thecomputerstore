import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/shell";
import { ProductEditor, type EditorCategory, type EditorProduct } from "@/components/admin/product-editor";
import { db } from "@/server/db";
import { deleteProductImageAction } from "@/server/actions/admin";
import { formatDate, formatINR } from "@/lib/format";

export const metadata = { title: "Edit product" };

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const [product, categories, brands] = await Promise.all([
    isNew ? null : db.product.findUnique({ where: { id }, include: { specs: { include: { spec: true } }, inventory: true, images: { orderBy: { sortOrder: "asc" } }, priceHistory: { orderBy: { changedAt: "desc" }, take: 8 } } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, include: { specDefs: { orderBy: { sortOrder: "asc" } } } }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!isNew && !product) notFound();

  const cats: EditorCategory[] = categories.map((c) => ({
    id: c.id, name: c.name, builderSlot: c.builderSlot,
    specs: c.specDefs.map((s) => ({ key: s.key, label: s.label, type: s.type, unit: s.unit, options: s.options, required: s.required, group: s.group })),
  }));
  const ed: EditorProduct = product
    ? {
        id: product.id, name: product.name, sku: product.sku, slug: product.slug, model: product.model ?? "", categoryId: product.categoryId, brandId: product.brandId,
        price: product.price, mrp: product.mrp, gstRate: product.gstRate, stock: product.inventory.reduce((s, i) => s + i.quantity, 0), warranty: product.warranty ?? "",
        shortDesc: product.shortDesc ?? "", description: product.description ?? "", status: product.status, isFeatured: product.isFeatured, isDeal: product.isDeal,
        popularity: product.popularity, releasedAt: product.releasedAt?.toISOString().slice(0, 10) ?? "",
        specs: Object.fromEntries(product.specs.map((s) => [s.spec.key, s.spec.type === "NUMBER" ? String(s.valueNum ?? "") : s.spec.type === "BOOLEAN" ? (s.valueBool == null ? "" : String(s.valueBool)) : s.valueText ?? ""])),
      }
    : { name: "", sku: "", slug: "", model: "", categoryId: cats[0]?.id ?? "", brandId: brands[0]?.id ?? "", price: 0, mrp: 0, gstRate: 18, stock: 0, warranty: "", shortDesc: "", description: "", status: "DRAFT", isFeatured: false, isDeal: false, popularity: 10, releasedAt: "", specs: {} };

  return (
    <>
      <PageHeader
        title={isNew ? "New product" : product!.name}
        description={isNew ? "Choose a category first — its specification fields appear below." : `SKU ${product!.sku}`}
        action={!isNew && <Link href={`/product/${product!.slug}`} className="flex items-center gap-1.5 text-sm font-semibold text-accent">View on store <ExternalLink className="h-4 w-4" /></Link>}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <ProductEditor product={ed} categories={cats} brands={brands} />
        {product && (
          <aside className="space-y-6">
            <section className="card p-5">
              <h2 className="font-bold">Images</h2>
              {product.images.length === 0 && <p className="mt-2 text-sm text-muted">No images — the store shows a category render.</p>}
              <ul className="mt-3 grid grid-cols-2 gap-2">
                {product.images.map((img) => (
                  <li key={img.id} className="relative overflow-hidden rounded-xl border border-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt ?? ""} className="aspect-square w-full object-contain" />
                    <form action={deleteProductImageAction} className="absolute right-1 top-1">
                      <input type="hidden" name="imageId" value={img.id} />
                      <button className="grid h-7 w-7 place-items-center rounded-lg bg-bad text-white" aria-label="Delete image"><Trash2 className="h-3.5 w-3.5" /></button>
                    </form>
                  </li>
                ))}
              </ul>
            </section>
            <section className="card p-5">
              <h2 className="font-bold">Price history</h2>
              <ul className="mt-3 space-y-1.5 text-sm">
                {product.priceHistory.map((h) => (
                  <li key={h.id} className="flex justify-between"><span className="text-muted">{formatDate(h.changedAt)}</span><span className="font-mono">{formatINR(h.price)}</span></li>
                ))}
              </ul>
            </section>
          </aside>
        )}
      </div>
    </>
  );
}
