import { notFound } from "next/navigation";
import { INFO_PAGES } from "@/content/pages";
import { FAQS } from "@/components/home/sections";
import { JsonLd } from "@/components/seo";

export function InfoPageView({ page }: { page: string }) {
  const p = INFO_PAGES[page];
  if (!p) notFound();
  return (
    <article className="container-x max-w-3xl py-14">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{p.title}</h1>
      <p className="mt-3 text-lg text-muted">{p.description}</p>
      <div className="mt-10 space-y-8">
        {p.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xl font-bold">{s.heading}</h2>
            {s.body.map((b, i) => <p key={i} className="mt-2 leading-relaxed text-ink-2">{b}</p>)}
          </section>
        ))}
        {page === "faqs" && (
          <>
            <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
            <div className="divide-y divide-line rounded-[24px] border border-line bg-surface">
              {FAQS.map((f) => (
                <details key={f.q} className="group px-6 py-5" open>
                  <summary className="cursor-pointer list-none font-semibold">{f.q}</summary>
                  <p className="mt-2 text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </>
        )}
      </div>
    </article>
  );
}
