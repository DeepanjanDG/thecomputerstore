import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/shell";
import { ActionForm } from "@/components/admin/ui";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { db } from "@/server/db";
import { deleteSpecDefAction, saveCategoryAction, saveSpecDefAction } from "@/server/actions/admin";
import { SLOTS } from "@/lib/compat/types";

export const metadata = { title: "Edit category" };

const TYPES = ["NUMBER", "TEXT", "BOOLEAN", "LIST"];

export default async function EditCategory({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const c = isNew ? null : await db.category.findUnique({ where: { id }, include: { specDefs: { orderBy: { sortOrder: "asc" } } } });
  if (!isNew && !c) notFound();

  return (
    <>
      <PageHeader title={c?.name ?? "New category"} description="Spec keys are read by the compatibility engine — keep existing keys (e.g. socket, maxGpuLength) stable." />
      <ActionForm action={saveCategoryAction} className="card grid gap-4 p-6 sm:grid-cols-2">
        {c && <input type="hidden" name="id" value={c.id} />}
        <Field label="Name" htmlFor="name"><Input id="name" name="name" defaultValue={c?.name} required /></Field>
        <Field label="URL slug" htmlFor="slug" hint="Used as the category URL, e.g. /graphics-cards"><Input id="slug" name="slug" defaultValue={c?.slug} className="font-mono" /></Field>
        <Field label="Short name" htmlFor="shortName" optional><Input id="shortName" name="shortName" defaultValue={c?.shortName ?? ""} /></Field>
        <Field label="Navigation group" htmlFor="group"><Input id="group" name="group" defaultValue={c?.group ?? "Components"} list="groups" /><datalist id="groups">{["Components", "Computers", "Peripherals", "Office", "Networking & Security", "Power & Software"].map((g) => <option key={g} value={g} />)}</datalist></Field>
        <Field label="PC Builder slot" htmlFor="builderSlot" hint="Links products in this category to a builder step.">
          <Select id="builderSlot" name="builderSlot" defaultValue={c?.builderSlot ?? ""}><option value="">Not a builder component</option>{SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}</Select>
        </Field>
        <Field label="Sort order" htmlFor="sortOrder"><Input id="sortOrder" name="sortOrder" type="number" defaultValue={c?.sortOrder ?? 0} /></Field>
        <Field label="Description" htmlFor="description" className="sm:col-span-2" optional><Textarea id="description" name="description" defaultValue={c?.description ?? ""} rows={2} /></Field>
        <Field label="SEO title" htmlFor="seoTitle" optional><Input id="seoTitle" name="seoTitle" defaultValue={c?.seoTitle ?? ""} /></Field>
        <Field label="SEO description" htmlFor="seoDesc" optional><Input id="seoDesc" name="seoDesc" defaultValue={c?.seoDesc ?? ""} /></Field>
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="isActive" defaultChecked={c?.isActive ?? true} /> Visible in store</label>
      </ActionForm>

      {c && (
        <section className="mt-8">
          <h2 className="text-xl font-bold">Specification schema</h2>
          <p className="mt-1 text-sm text-muted">Key specs show on product cards; filterable specs become catalogue filters; required specs must be filled before a product can be saved.</p>
          <div className="mt-4 space-y-3">
            {c.specDefs.map((s) => (
              <div key={s.id} className="card p-4">
                <ActionForm action={saveSpecDefAction} submit="Update" className="grid items-end gap-3 md:grid-cols-[1fr_1fr_120px_90px_1fr_80px]">
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="categoryId" value={c.id} />
                  <Field label="Key" htmlFor={`k-${s.id}`}><Input id={`k-${s.id}`} name="key" defaultValue={s.key} className="font-mono" /></Field>
                  <Field label="Label" htmlFor={`l-${s.id}`}><Input id={`l-${s.id}`} name="label" defaultValue={s.label} /></Field>
                  <Field label="Type" htmlFor={`t-${s.id}`}><Select id={`t-${s.id}`} name="type" defaultValue={s.type}>{TYPES.map((t) => <option key={t}>{t}</option>)}</Select></Field>
                  <Field label="Unit" htmlFor={`u-${s.id}`}><Input id={`u-${s.id}`} name="unit" defaultValue={s.unit ?? ""} /></Field>
                  <Field label="Group" htmlFor={`g-${s.id}`}><Input id={`g-${s.id}`} name="group" defaultValue={s.group} /></Field>
                  <Field label="Order" htmlFor={`o-${s.id}`}><Input id={`o-${s.id}`} name="sortOrder" type="number" defaultValue={s.sortOrder} /></Field>
                  <Field label="Suggested values" htmlFor={`op-${s.id}`} className="md:col-span-3"><Input id={`op-${s.id}`} name="options" defaultValue={s.options ?? ""} placeholder="Comma separated" /></Field>
                  <div className="flex flex-wrap gap-4 pb-3 text-sm md:col-span-3">
                    <label className="flex items-center gap-1.5"><input type="checkbox" name="isKey" defaultChecked={s.isKey} /> Key spec</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" name="filterable" defaultChecked={s.filterable} /> Filterable</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" name="required" defaultChecked={s.required} /> Required</label>
                    {s.required && <Badge tone="accent">used by builder</Badge>}
                  </div>
                </ActionForm>
                <form action={deleteSpecDefAction} className="mt-2">
                  <input type="hidden" name="id" value={s.id} />
                  <button className="flex items-center gap-1 text-xs font-semibold text-bad"><Trash2 className="h-3.5 w-3.5" /> Delete field (removes values from all products)</button>
                </form>
              </div>
            ))}
            <div className="card border-dashed p-4">
              <p className="mb-3 font-semibold">Add a specification</p>
              <ActionForm action={saveSpecDefAction} submit="Add field" className="grid items-end gap-3 md:grid-cols-[1fr_1fr_120px_90px_1fr]">
                <input type="hidden" name="categoryId" value={c.id} />
                <Field label="Key" htmlFor="nk"><Input id="nk" name="key" placeholder="e.g. maxGpuLength" className="font-mono" required /></Field>
                <Field label="Label" htmlFor="nl"><Input id="nl" name="label" required /></Field>
                <Field label="Type" htmlFor="nt"><Select id="nt" name="type">{TYPES.map((t) => <option key={t}>{t}</option>)}</Select></Field>
                <Field label="Unit" htmlFor="nu"><Input id="nu" name="unit" /></Field>
                <Field label="Group" htmlFor="ng"><Input id="ng" name="group" defaultValue="Specifications" /></Field>
                <div className="flex gap-4 pb-3 text-sm md:col-span-5">
                  <label className="flex items-center gap-1.5"><input type="checkbox" name="isKey" /> Key spec</label>
                  <label className="flex items-center gap-1.5"><input type="checkbox" name="filterable" /> Filterable</label>
                  <label className="flex items-center gap-1.5"><input type="checkbox" name="required" /> Required</label>
                </div>
              </ActionForm>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
