import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Cpu } from "lucide-react";
import { BuildTable, BuildTotals } from "@/components/build/build-view";
import { BuildActions } from "@/components/build/build-cta";
import { getBuild } from "@/server/builds";
import { formatDate, formatINR } from "@/lib/format";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const data = await getBuild(code);
  if (!data) return {};
  const title = `${data.build.name} — Custom PC Build ${data.build.code}`;
  const description = `${Object.keys(data.items).length} components · ${formatINR(data.pricing.total)} · ${data.report.status === "compatible" ? "All parts compatible" : "Compatibility checked"} — built on The Computer Store PC Builder.`;
  return { title, description, openGraph: { title, description }, robots: { index: false } };
}

export default async function SharedBuildPage({ params }: Props) {
  const { code } = await params;
  const data = await getBuild(code);
  if (!data) notFound();
  const { build, items, report, pricing } = data;
  const url = `${SITE.url}/build/${build.code}`;

  return (
    <div className="container-x py-10">
      <div className="stage relative overflow-hidden rounded-[32px] px-6 py-10 sm:px-10">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent/25 blur-[110px]" aria-hidden />
        <p className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-muted"><Cpu className="h-4 w-4 text-accent" /> The Computer Store · Custom PC Build</p>
        <h1 className="relative mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{build.name}</h1>
        <p className="relative mt-3 font-mono text-sm text-muted">{build.code} · {Object.keys(items).length} components · saved {formatDate(build.createdAt)}{build.user ? ` by ${build.user.name.split(" ")[0]}` : ""}</p>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] [&>*]:min-w-0">
        <div>
          <BuildTable items={items} report={report} />
          <p className="mt-3 text-sm text-muted">Prices are current store prices and may differ from when this build was saved.</p>
        </div>
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <BuildTotals pricing={pricing} report={report} />
          <BuildActions name={build.name} code={build.code} items={items} report={report} total={pricing.total} shareUrl={url} />
        </div>
      </div>
    </div>
  );
}
