import Image from "next/image";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/shell";
import { ActionForm } from "@/components/admin/ui";
import { Field, Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { db } from "@/server/db";
import { deleteHomeSlideAction, moveHomeSlideAction, saveHomeSlideAction, toggleHomeSlideAction } from "@/server/actions/admin";

export const metadata = { title: "Homepage slider" };

export default async function AdminSlides() {
  const slides = await db.homeSlide.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <>
      <PageHeader title="Homepage slider" description="Photos shown in the rotating banner at the top of the homepage — store front, events, offers." />
      <ActionForm action={saveHomeSlideAction} submit="Add slide" className="card mb-8 grid gap-4 p-6 sm:grid-cols-2">
        <Field label="Image" htmlFor="image" hint="JPEG, PNG, WebP or AVIF under 5 MB." className="sm:col-span-2">
          <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required className="text-sm" />
        </Field>
        <Field label="Title" htmlFor="title" optional><Input id="title" name="title" /></Field>
        <Field label="Subtitle" htmlFor="subtitle" optional><Input id="subtitle" name="subtitle" /></Field>
        <Field label="Link URL" htmlFor="linkUrl" optional hint="Where the slide goes when clicked, e.g. /shop" className="sm:col-span-2">
          <Input id="linkUrl" name="linkUrl" />
        </Field>
      </ActionForm>

      {slides.length === 0 && <p className="text-sm text-muted">No slides yet — add one above.</p>}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {slides.map((s, i) => (
          <li key={s.id} className="card overflow-hidden">
            <div className="relative aspect-[16/9] w-full bg-surface-2">
              <Image src={s.imageUrl} alt={s.title ?? ""} fill sizes="400px" className="object-cover" />
            </div>
            <div className="space-y-2 p-4">
              {s.title && <p className="font-bold">{s.title}</p>}
              {s.subtitle && <p className="text-sm text-muted">{s.subtitle}</p>}
              {s.linkUrl && <p className="truncate text-xs text-muted">→ {s.linkUrl}</p>}
              <div className="flex items-center justify-between pt-2">
                <form action={toggleHomeSlideAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <button className="flex items-center gap-1.5">
                    <Badge tone={s.isActive ? "ok" : "neutral"}>{s.isActive ? "active" : "off"}</Badge>
                    <span className="text-xs font-semibold text-accent">{s.isActive ? "Disable" : "Enable"}</span>
                  </button>
                </form>
                <div className="flex items-center gap-1">
                  <form action={moveHomeSlideAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="dir" value="up" />
                    <button type="submit" disabled={i === 0} className="grid h-7 w-7 place-items-center rounded-lg border border-line disabled:opacity-30" aria-label="Move up"><ArrowUp className="h-3.5 w-3.5" /></button>
                  </form>
                  <form action={moveHomeSlideAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="dir" value="down" />
                    <button type="submit" disabled={i === slides.length - 1} className="grid h-7 w-7 place-items-center rounded-lg border border-line disabled:opacity-30" aria-label="Move down"><ArrowDown className="h-3.5 w-3.5" /></button>
                  </form>
                  <form action={deleteHomeSlideAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="grid h-7 w-7 place-items-center rounded-lg bg-bad text-white" aria-label="Delete slide"><Trash2 className="h-3.5 w-3.5" /></button>
                  </form>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
