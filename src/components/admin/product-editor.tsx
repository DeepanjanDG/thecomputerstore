"use client";

import { useState } from "react";
import { ActionForm } from "./ui";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { saveProductAction } from "@/server/actions/admin";

export interface EditorCategory {
  id: string;
  name: string;
  builderSlot: string | null;
  specs: { key: string; label: string; type: "NUMBER" | "TEXT" | "BOOLEAN" | "LIST"; unit: string | null; options: string | null; required: boolean; group: string }[];
}

export interface EditorProduct {
  id?: string; name: string; sku: string; slug: string; model: string; categoryId: string; brandId: string; price: number; mrp: number; gstRate: number;
  stock: number; warranty: string; shortDesc: string; description: string; status: string; isFeatured: boolean; isDeal: boolean; popularity: number; releasedAt: string;
  specs: Record<string, string>;
}

/** Product form whose specification fields are generated from the category's spec schema. */
export function ProductEditor({ product, categories, brands }: { product: EditorProduct; categories: EditorCategory[]; brands: { id: string; name: string }[] }) {
  const [categoryId, setCategoryId] = useState(product.categoryId || categories[0]?.id);
  const cat = categories.find((c) => c.id === categoryId);
  const groups = [...new Set(cat?.specs.map((s) => s.group) ?? [])];

  return (
    <ActionForm action={saveProductAction} submit={product.id ? "Save product" : "Create product"} className="space-y-6">
      {product.id && <input type="hidden" name="id" value={product.id} />}
      <section className="card grid gap-4 p-6 sm:grid-cols-2">
        <h2 className="text-lg font-bold sm:col-span-2">Basics</h2>
        <Field label="Product name" htmlFor="name" className="sm:col-span-2"><Input id="name" name="name" defaultValue={product.name} required /></Field>
        <Field label="SKU" htmlFor="sku"><Input id="sku" name="sku" defaultValue={product.sku} required className="font-mono" /></Field>
        <Field label="URL slug" htmlFor="slug" hint="Leave blank to generate from the name."><Input id="slug" name="slug" defaultValue={product.slug} className="font-mono" /></Field>
        <Field label="Category" htmlFor="categoryId">
          <Select id="categoryId" name="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}{c.builderSlot ? " · PC Builder" : ""}</option>)}
          </Select>
        </Field>
        <Field label="Brand" htmlFor="brandId">
          <Select id="brandId" name="brandId" defaultValue={product.brandId}>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Select>
        </Field>
        <Field label="Model number" htmlFor="model" optional><Input id="model" name="model" defaultValue={product.model} /></Field>
        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={product.status}><option value="ACTIVE">Active</option><option value="DRAFT">Draft</option><option value="ARCHIVED">Archived</option></Select>
        </Field>
      </section>

      <section className="card grid gap-4 p-6 sm:grid-cols-3">
        <h2 className="text-lg font-bold sm:col-span-3">Price & inventory</h2>
        <Field label="Selling price (₹, incl. GST)" htmlFor="price"><Input id="price" name="price" type="number" min={0} defaultValue={product.price} required className="font-mono" /></Field>
        <Field label="MRP (₹)" htmlFor="mrp"><Input id="mrp" name="mrp" type="number" min={0} defaultValue={product.mrp} required className="font-mono" /></Field>
        <Field label="GST rate (%)" htmlFor="gstRate"><Input id="gstRate" name="gstRate" type="number" min={0} max={28} defaultValue={product.gstRate} className="font-mono" /></Field>
        <Field label="Stock (Shillong store)" htmlFor="stock"><Input id="stock" name="stock" type="number" min={0} defaultValue={product.stock} className="font-mono" /></Field>
        <Field label="Warranty" htmlFor="warranty"><Input id="warranty" name="warranty" defaultValue={product.warranty} placeholder="3 years manufacturer warranty" /></Field>
        <Field label="Popularity (sort weight)" htmlFor="popularity"><Input id="popularity" name="popularity" type="number" min={0} max={1000} defaultValue={product.popularity} /></Field>
        <Field label="Release date" htmlFor="releasedAt" optional><Input id="releasedAt" name="releasedAt" type="date" defaultValue={product.releasedAt} /></Field>
        <label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold"><input type="checkbox" name="isFeatured" defaultChecked={product.isFeatured} /> Featured on homepage</label>
        <label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold"><input type="checkbox" name="isDeal" defaultChecked={product.isDeal} /> Show in Deals</label>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-bold">Specifications</h2>
        <p className="mt-1 text-sm text-muted">
          {cat?.builderSlot ? "These values feed the compatibility engine directly — required fields are marked." : "Shown on product pages and used for filters."}{" "}
          Manage fields in <a href={`/admin/categories/${categoryId}`} className="font-semibold text-accent">Categories & Specs</a>.
        </p>
        {groups.map((g) => (
          <fieldset key={g} className="mt-5">
            <legend className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-muted">{g}</legend>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cat!.specs.filter((s) => s.group === g).map((s) => {
                const id = `spec-${s.key}`;
                const v = product.categoryId === categoryId ? product.specs[s.key] ?? "" : "";
                const label = `${s.label}${s.unit ? ` (${s.unit})` : ""}${s.required ? " *" : ""}`;
                const listId = s.options ? `opts-${s.key}` : undefined;
                return (
                  <Field key={`${categoryId}-${s.key}`} label={label} htmlFor={id} hint={s.type === "LIST" ? "Comma separated" : undefined}>
                    {s.type === "BOOLEAN" ? (
                      <Select id={id} name={`spec.${s.key}`} defaultValue={v}><option value="">—</option><option value="true">Yes</option><option value="false">No</option></Select>
                    ) : (
                      <>
                        <Input id={id} name={`spec.${s.key}`} defaultValue={v} type={s.type === "NUMBER" ? "number" : "text"} step="any" list={listId} required={s.required} className={s.type === "NUMBER" ? "font-mono" : undefined} />
                        {listId && <datalist id={listId}>{s.options!.split(",").map((o) => <option key={o} value={o.trim()} />)}</datalist>}
                      </>
                    )}
                  </Field>
                );
              })}
            </div>
          </fieldset>
        ))}
      </section>

      <section className="card grid gap-4 p-6">
        <h2 className="text-lg font-bold">Content & images</h2>
        <Field label="Short description" htmlFor="shortDesc" optional><Textarea id="shortDesc" name="shortDesc" defaultValue={product.shortDesc} rows={2} maxLength={300} /></Field>
        <Field label="Full description" htmlFor="description" optional><Textarea id="description" name="description" defaultValue={product.description} rows={5} /></Field>
        <Field label="Upload images" htmlFor="images" hint="JPEG, PNG, WebP or AVIF under 5 MB. Next.js serves optimised WebP/AVIF automatically.">
          <input id="images" name="images" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="text-sm" />
        </Field>
      </section>
    </ActionForm>
  );
}
