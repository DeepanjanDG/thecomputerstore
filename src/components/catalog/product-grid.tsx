import { PackageSearch } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { toBuilderProduct, toCard, type ProductWithRelations } from "@/server/catalog";

export function ProductGrid({ products, empty }: { products: ProductWithRelations[]; empty?: React.ReactNode }) {
  if (!products.length)
    return (
      <div className="rounded-[24px] border border-line bg-surface p-12 text-center">
        <PackageSearch className="mx-auto h-10 w-10 text-muted" />
        {empty ?? (
          <>
            <p className="mt-3 font-semibold">No products match these filters.</p>
            <p className="mt-1 text-sm text-muted">Try removing a filter — or ask us on WhatsApp, we can source most parts.</p>
          </>
        )}
      </div>
    );
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} p={toCard(p)} bp={p.category.builderSlot ? toBuilderProduct(p) : null} priority={i < 4} />
      ))}
    </div>
  );
}
