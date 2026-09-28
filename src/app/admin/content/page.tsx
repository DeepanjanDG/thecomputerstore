import { PageHeader } from "@/components/admin/shell";
import { ActionForm } from "@/components/admin/ui";
import { Field, Input, Textarea } from "@/components/ui/field";
import { getSetting } from "@/server/config";
import { saveHomeAction } from "@/server/actions/admin";
import { HOME_MAX_REVIEWS, HOME_MAX_STATS } from "@/server/home-content-form";

export const metadata = { title: "Homepage content" };

export default async function AdminContent() {
  const home = await getSetting("home");
  const stats = Array.from({ length: HOME_MAX_STATS }, (_, i) => home.stats[i] ?? { value: "", label: "" });
  const reviews = Array.from({ length: HOME_MAX_REVIEWS }, (_, i) => home.reviews[i] ?? { name: "", city: "", build: "", text: "" });

  return (
    <>
      <PageHeader title="Homepage content" description="Featured products come from the “Featured” flag on products; featured builds from showcase templates." />
      <ActionForm action={saveHomeAction} submit="Save homepage" className="space-y-6">
        <section className="card grid gap-4 p-6">
          <Field label="Announcement bar" htmlFor="announcement" hint="Leave empty to hide."><Input id="announcement" name="announcement" defaultValue={home.announcement} /></Field>
          <Field label="Hero eyebrow" htmlFor="heroEyebrow"><Input id="heroEyebrow" name="heroEyebrow" defaultValue={home.heroEyebrow} /></Field>
          <Field label="Hero headline" htmlFor="heroTitle" hint="Use a line break to split the two lines."><Textarea id="heroTitle" name="heroTitle" defaultValue={home.heroTitle} rows={2} /></Field>
          <Field label="Hero supporting text" htmlFor="heroSubtitle"><Textarea id="heroSubtitle" name="heroSubtitle" defaultValue={home.heroSubtitle} rows={2} /></Field>
        </section>

        <section className="card grid gap-4 p-6">
          <div>
            <h2 className="text-lg font-bold">Stats</h2>
            <p className="mt-1 text-sm text-muted">The numbers shown under the hero headline. Leave a card blank to drop it.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <div key={i} className="grid gap-3 rounded-xl border border-line p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Stat {i + 1}</p>
                <Field label="Value" htmlFor={`statValue${i}`}><Input id={`statValue${i}`} name={`statValue${i}`} defaultValue={s.value} placeholder="25" /></Field>
                <Field label="Label" htmlFor={`statLabel${i}`}><Input id={`statLabel${i}`} name={`statLabel${i}`} defaultValue={s.label} placeholder="compatibility checks" /></Field>
              </div>
            ))}
          </div>
        </section>

        <section className="card grid gap-4 p-6">
          <div>
            <h2 className="text-lg font-bold">Customer reviews</h2>
            <p className="mt-1 text-sm text-muted">Publish genuine reviews only. Leave a card blank to drop it — no reviews hides the section.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {reviews.map((r, i) => (
              <div key={i} className="grid gap-3 rounded-xl border border-line p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Review {i + 1}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Name" htmlFor={`reviewName${i}`}><Input id={`reviewName${i}`} name={`reviewName${i}`} defaultValue={r.name} placeholder="Bankitlang R." /></Field>
                  <Field label="City" htmlFor={`reviewCity${i}`}><Input id={`reviewCity${i}`} name={`reviewCity${i}`} defaultValue={r.city} placeholder="Shillong" /></Field>
                </div>
                <Field label="Build" htmlFor={`reviewBuild${i}`} optional><Input id={`reviewBuild${i}`} name={`reviewBuild${i}`} defaultValue={r.build} placeholder="1440p Gaming PC" /></Field>
                <Field label="Review text" htmlFor={`reviewText${i}`}><Textarea id={`reviewText${i}`} name={`reviewText${i}`} defaultValue={r.text} rows={3} /></Field>
              </div>
            ))}
          </div>
        </section>
      </ActionForm>
    </>
  );
}
