import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GUIDES } from "@/content/guides";

export const metadata: Metadata = { title: "PC Buying Guides", description: "Plain-English guides to building and buying a PC.", alternates: { canonical: "/guides" } };

export default function GuidesPage() {
  return (
    <div className="container-x py-10">
      <p className="eyebrow">Guides</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">Know what you&apos;re buying.</h1>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {GUIDES.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="card card-hover group p-7">
            <p className="font-mono text-xs text-muted">{g.readMins} min read</p>
            <h2 className="mt-2 text-xl font-bold group-hover:text-accent">{g.title}</h2>
            <p className="mt-2 text-muted">{g.excerpt}</p>
            <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-accent">Read guide <ArrowRight className="h-4 w-4" /></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
