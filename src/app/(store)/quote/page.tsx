import type { Metadata } from "next";
import { QuoteView } from "./quote-view";

export const metadata: Metadata = {
  title: "Request a Quote — Custom PCs, Office & Bulk Orders",
  description: "Get a formal quotation for a custom PC, office computers, printers, networking or CCTV from The Computer Store, Shillong.",
  alternates: { canonical: "/quote" },
};

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  return (
    <div className="container-x py-10">
      <p className="eyebrow">Quotations</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">Get it quoted.</h1>
      <p className="mb-10 mt-3 max-w-2xl text-lg text-muted">Formal GST quotations for individuals, offices, schools and institutions — usually within a few working hours.</p>
      <QuoteView fromCart={from === "cart"} />
    </div>
  );
}
