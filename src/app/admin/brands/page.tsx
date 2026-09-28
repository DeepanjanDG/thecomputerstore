import { PageHeader } from "@/components/admin/shell";
import { ActionForm } from "@/components/admin/ui";
import { Field, Input } from "@/components/ui/field";
import { db } from "@/server/db";
import { saveBrandAction } from "@/server/actions/admin";

export const metadata = { title: "Brands" };

export default async function AdminBrands() {
  const brands = await db.brand.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } });
  return (
    <>
      <PageHeader title="Brands" />
      <ActionForm action={saveBrandAction} submit="Add brand" className="card mb-6 flex flex-wrap items-end gap-3 p-5">
        <Field label="New brand name" htmlFor="bn" className="min-w-60 flex-1"><Input id="bn" name="name" required /></Field>
        <Field label="Logo URL" htmlFor="bl" optional className="min-w-60 flex-1"><Input id="bl" name="logoUrl" /></Field>
      </ActionForm>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {brands.map((b) => (
          <li key={b.id} className="card p-4">
            <ActionForm action={saveBrandAction} submit="Rename" className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="id" value={b.id} />
              <Field label={`${b._count.products} products`} htmlFor={`b-${b.id}`} className="flex-1"><Input id={`b-${b.id}`} name="name" defaultValue={b.name} /></Field>
              <input type="hidden" name="logoUrl" value={b.logoUrl ?? ""} />
            </ActionForm>
          </li>
        ))}
      </ul>
    </>
  );
}
