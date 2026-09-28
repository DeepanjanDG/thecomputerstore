import { PageHeader } from "@/components/admin/shell";
import { ActionForm } from "@/components/admin/ui";
import { Field, Select, Textarea } from "@/components/ui/field";
import { db } from "@/server/db";
import { getSetting } from "@/server/config";
import { saveRuleAction, saveSettingAction } from "@/server/actions/admin";
import { RULES } from "@/lib/compat/rules";

export const metadata = { title: "Compatibility & scoring" };

export default async function AdminCompatibility() {
  const [rows, power, scoring, autobuild] = await Promise.all([
    db.compatibilityRule.findMany(),
    getSetting("power"), getSetting("scoring"), getSetting("autobuild"),
  ]);
  return (
    <>
      <PageHeader
        title="Compatibility & scoring"
        description="Rule logic lives in code (src/lib/compat/rules.ts). Here you can switch rules on or off, change how strict they are, and tune thresholds — changes apply to the builder immediately."
      />
      <section aria-labelledby="rules-h">
        <h2 id="rules-h" className="mb-3 text-xl font-bold">Rules ({RULES.length})</h2>
        <div className="grid gap-3 xl:grid-cols-2">
          {RULES.map((r) => {
            const row = rows.find((x) => x.id === r.id);
            return (
              <div key={r.id} className="card p-5">
                <p className="font-semibold">{r.title}</p>
                <p className="font-mono text-xs text-muted">{r.id} · slots: {r.slots.join(", ")}</p>
                <p className="mt-1 text-sm text-muted">{r.description}</p>
                {row ? (
                  <ActionForm action={saveRuleAction} submit="Save rule" className="mt-3 grid gap-3 sm:grid-cols-[auto_1fr_1fr] sm:items-end">
                    <input type="hidden" name="id" value={r.id} />
                    <label className="flex items-center gap-2 pb-3 text-sm font-semibold"><input type="checkbox" name="enabled" defaultChecked={row.enabled} /> Enabled</label>
                    <Field label="Severity override" htmlFor={`sev-${r.id}`}>
                      <Select id={`sev-${r.id}`} name="severity" defaultValue={row.severity ?? ""}>
                        <option value="">Default</option><option value="error">Error (blocks)</option><option value="warning">Warning</option><option value="info">Info only</option>
                      </Select>
                    </Field>
                    <Field label="Parameters (JSON)" htmlFor={`p-${r.id}`}>
                      <Textarea id={`p-${r.id}`} name="params" defaultValue={JSON.stringify(row.params)} rows={1} className="min-h-11 font-mono text-xs" />
                    </Field>
                  </ActionForm>
                ) : (
                  <p className="mt-3 text-sm text-warn">Not in the database yet — run the seed script to register new rules.</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
      {[
        { key: "power", title: "Power model", body: "Wattage estimates per component, PSU headroom (%) and rounding.", value: power },
        { key: "scoring", title: "Build score", body: "Thresholds for power headroom, CPU/GPU balance, long-lived sockets and gaming-tier labels (based on performance tiers, not benchmarks).", value: scoring },
        { key: "autobuild", title: "“Build it for me”", body: "Budget share per component for each use case, minimum RAM and GPU tier per resolution.", value: autobuild },
      ].map((s) => (
        <section key={s.key} className="mt-10" aria-labelledby={`s-${s.key}`}>
          <h2 id={`s-${s.key}`} className="text-xl font-bold">{s.title}</h2>
          <p className="mb-3 text-sm text-muted">{s.body}</p>
          <ActionForm action={saveSettingAction} submit={`Save ${s.title.toLowerCase()}`} className="card p-5">
            <input type="hidden" name="key" value={s.key} />
            <Textarea name="value" defaultValue={JSON.stringify(s.value, null, 2)} rows={14} className="font-mono text-xs" aria-label={`${s.title} JSON`} />
          </ActionForm>
        </section>
      ))}
    </>
  );
}
