import { PageHeader } from "@/components/admin/shell";
import { Badge } from "@/components/ui/badge";
import { db } from "@/server/db";
import { markMessageHandledAction } from "@/server/actions/admin";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Messages" };

export default async function AdminMessages() {
  const msgs = await db.contactMessage.findMany({ orderBy: [{ handled: "asc" }, { createdAt: "desc" }], take: 200 });
  return (
    <>
      <PageHeader title="Messages" description="Contact form and general quote enquiries." />
      <ul className="space-y-3">
        {msgs.map((m) => (
          <li key={m.id} className={`card p-5 ${m.handled ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{m.name} {m.topic && <Badge tone="accent" className="ml-2">{m.topic}</Badge>}</p>
                <p className="text-sm text-muted">{[m.phone, m.email].filter(Boolean).join(" · ")} · {formatDate(m.createdAt)}</p>
              </div>
              <form action={markMessageHandledAction}>
                <input type="hidden" name="id" value={m.id} />
                <button className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold hover:bg-surface-2">{m.handled ? "Mark as open" : "Mark handled"}</button>
              </form>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm">{m.message}</p>
          </li>
        ))}
        {msgs.length === 0 && <p className="text-muted">No messages yet.</p>}
      </ul>
    </>
  );
}
