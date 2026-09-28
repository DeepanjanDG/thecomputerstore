import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/shell";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/server/db";
import { getTemplates } from "@/server/builds";
import { getEngineConfig } from "@/server/config";
import { validateBuild } from "@/lib/compat/service";
import { formatINR } from "@/lib/format";

export const metadata = { title: "Build templates" };

export default async function AdminTemplates() {
  const [active, inactive, cfg] = await Promise.all([getTemplates(), db.buildTemplate.findMany({ where: { isActive: false } }), getEngineConfig()]);
  return (
    <>
      <PageHeader title="Build templates & showcase" description="Templates appear on /builds and in the builder's start panel; showcase builds appear on the homepage." action={<LinkButton href="/admin/templates/new"><Plus className="h-4 w-4" /> New template</LinkButton>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {active.map((t) => {
          const r = validateBuild(t.built, cfg);
          const oos = Object.values(t.built).filter((l) => l!.product.stock <= 0).length;
          return (
            <Link key={t.id} href={`/admin/templates/${t.id}`} className="card card-hover p-5">
              <div className="flex flex-wrap gap-2">
                <Badge tone="accent">{t.useCase}</Badge>
                {t.isShowcase && <Badge tone="dark">showcase</Badge>}
                <Badge tone={r.errors.length ? "bad" : r.warnings.length ? "warn" : "ok"}>{r.errors.length ? "✕ incompatible" : r.warnings.length ? "⚠ warnings" : "✓ compatible"}</Badge>
                {oos > 0 && <Badge tone="bad">{oos} out of stock</Badge>}
              </div>
              <p className="mt-3 text-lg font-bold">{t.name}</p>
              <p className="text-sm text-muted">{t.tagline}</p>
              <p className="mt-3 font-mono font-bold">{formatINR(t.total)}</p>
            </Link>
          );
        })}
        {inactive.map((t) => (
          <Link key={t.id} href={`/admin/templates/${t.id}`} className="card p-5 opacity-60"><Badge>hidden</Badge><p className="mt-3 font-bold">{t.name}</p></Link>
        ))}
      </div>
    </>
  );
}
