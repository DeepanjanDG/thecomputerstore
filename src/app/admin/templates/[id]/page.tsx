import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/shell";
import { ActionForm } from "@/components/admin/ui";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { StatusIcon } from "@/components/ui/status";
import { db } from "@/server/db";
import { saveTemplateAction } from "@/server/actions/admin";
import { getTemplateItems } from "@/server/builds";
import { getEngineConfig } from "@/server/config";
import { priceBuild, validateBuild } from "@/lib/compat/service";
import { SLOT_META, STEP_ORDER } from "@/lib/compat/slots";
import { formatINR } from "@/lib/format";

export const metadata = { title: "Edit template" };

export default async function EditTemplate({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const tplRow = isNew ? null : await db.buildTemplate.findUnique({ where: { id } });
  if (!isNew && !tplRow) notFound();
  const [loaded, products, cfg] = await Promise.all([
    tplRow ? getTemplateItems(tplRow.slug) : null,
    db.product.findMany({ where: { status: "ACTIVE", category: { builderSlot: { not: null } } }, include: { category: true, inventory: true }, orderBy: { price: "asc" } }),
    getEngineConfig(),
  ]);
  const items = loaded?.items ?? {};
  const report = validateBuild(items, cfg);
  const total = priceBuild(items).total;
  const t = tplRow;

  return (
    <>
      <PageHeader title={t?.name ?? "New template"} description={t ? `Current total ${formatINR(total)} · validated by the compatibility engine on every save` : undefined} />
      <ActionForm action={saveTemplateAction} className="space-y-6">
        {t && <input type="hidden" name="id" value={t.id} />}
        <section className="card grid gap-4 p-6 sm:grid-cols-2">
          <Field label="Name" htmlFor="name"><Input id="name" name="name" defaultValue={t?.name} required /></Field>
          <Field label="Slug" htmlFor="slug"><Input id="slug" name="slug" defaultValue={t?.slug} className="font-mono" /></Field>
          <Field label="Tagline" htmlFor="tagline" className="sm:col-span-2"><Input id="tagline" name="tagline" defaultValue={t?.tagline ?? ""} /></Field>
          <Field label="Description" htmlFor="description" className="sm:col-span-2"><Textarea id="description" name="description" defaultValue={t?.description ?? ""} rows={3} /></Field>
          <Field label="Use case" htmlFor="useCase"><Select id="useCase" name="useCase" defaultValue={t?.useCase ?? "gaming"}>{["gaming", "creator", "productivity", "workstation", "home"].map((u) => <option key={u}>{u}</option>)}</Select></Field>
          <Field label="Resolution" htmlFor="resolution" optional><Select id="resolution" name="resolution" defaultValue={t?.resolution ?? ""}><option value="">—</option><option>1080p</option><option>1440p</option><option>4K</option></Select></Field>
          <Field label="Price label" htmlFor="priceLabel" optional hint="e.g. ₹70K – ₹80K"><Input id="priceLabel" name="priceLabel" defaultValue={t?.priceLabel ?? ""} /></Field>
          <Field label="Accent colour (showcase)" htmlFor="accent" optional><Input id="accent" name="accent" defaultValue={t?.accent ?? ""} placeholder="#3D8BFF" /></Field>
          <Field label="Sort order" htmlFor="sortOrder"><Input id="sortOrder" name="sortOrder" type="number" defaultValue={t?.sortOrder ?? 0} /></Field>
          <div className="flex items-end gap-6 pb-3 text-sm font-semibold">
            <label className="flex items-center gap-2"><input type="checkbox" name="isShowcase" defaultChecked={t?.isShowcase} /> Showcase build</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="isActive" defaultChecked={t?.isActive ?? true} /> Visible</label>
          </div>
        </section>
        <section className="card p-6">
          <h2 className="text-lg font-bold">Components</h2>
          <div className="mt-4 grid gap-3">
            {STEP_ORDER.map((slot) => {
              const options = products.filter((p) => p.category.builderSlot === slot);
              if (!options.length) return null;
              const issues = [...report.errors, ...report.warnings].filter((r) => r.slots.includes(slot));
              return (
                <div key={slot} className="grid items-center gap-3 sm:grid-cols-[180px_1fr_80px]">
                  <label htmlFor={`item-${slot}`} className="text-sm font-semibold">{SLOT_META[slot].label}{SLOT_META[slot].core && " *"}</label>
                  <div>
                    <Select id={`item-${slot}`} name={`item.${slot}`} defaultValue={items[slot]?.product.id ?? ""}>
                      <option value="">— none —</option>
                      {options.map((p) => {
                        const stock = p.inventory.reduce((s, i) => s + i.quantity, 0);
                        return <option key={p.id} value={p.id}>{p.name} · {formatINR(p.price)}{stock <= 0 ? " · OUT OF STOCK" : ""}</option>;
                      })}
                    </Select>
                    {issues.map((r, i) => <p key={i} className="mt-1 flex items-start gap-1.5 text-xs"><StatusIcon status={r.status} className="h-3.5 w-3.5" /> {r.message}</p>)}
                  </div>
                  <Input name={`qty.${slot}`} type="number" min={1} max={SLOT_META[slot].maxQty} defaultValue={items[slot]?.qty ?? 1} aria-label={`${SLOT_META[slot].label} quantity`} />
                </div>
              );
            })}
          </div>
        </section>
      </ActionForm>
    </>
  );
}
