import { PageHeader } from "@/components/admin/shell";
import { ActionForm } from "@/components/admin/ui";
import { Field, Input } from "@/components/ui/field";
import { getSetting } from "@/server/config";
import { saveSocialAction } from "@/server/actions/admin";

export const metadata = { title: "Social links" };

export default async function AdminSocial() {
  const social = await getSetting("social");
  return (
    <>
      <PageHeader title="Social links" description="Shown as icons in the site footer. Untick “Show” to hide an icon without losing its URL." />
      <ActionForm action={saveSocialAction} submit="Save social links" className="card grid gap-6 p-6">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field label="Instagram URL" htmlFor="instagramUrl"><Input id="instagramUrl" name="instagramUrl" type="url" placeholder="https://instagram.com/yourpage" defaultValue={social.instagram.url} /></Field>
          <label className="flex items-center gap-2 pb-3 text-sm font-semibold"><input type="checkbox" name="instagramEnabled" defaultChecked={social.instagram.enabled} /> Show</label>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field label="Facebook URL" htmlFor="facebookUrl"><Input id="facebookUrl" name="facebookUrl" type="url" placeholder="https://facebook.com/yourpage" defaultValue={social.facebook.url} /></Field>
          <label className="flex items-center gap-2 pb-3 text-sm font-semibold"><input type="checkbox" name="facebookEnabled" defaultChecked={social.facebook.enabled} /> Show</label>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field label="YouTube URL" htmlFor="youtubeUrl"><Input id="youtubeUrl" name="youtubeUrl" type="url" placeholder="https://youtube.com/@yourchannel" defaultValue={social.youtube.url} /></Field>
          <label className="flex items-center gap-2 pb-3 text-sm font-semibold"><input type="checkbox" name="youtubeEnabled" defaultChecked={social.youtube.enabled} /> Show</label>
        </div>
      </ActionForm>
    </>
  );
}
