import { getQuoteForPdf } from "@/server/quotes";
import { renderQuotationPdf } from "@/server/pdf/quotation";

/** Quote ids are unguessable cuids, so possession of the link grants access to the PDF. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const q = await getQuoteForPdf(id);
  if (!q) return new Response("Quotation not found", { status: 404 });
  const pdf = await renderQuotationPdf({
    number: q.number,
    date: q.createdAt,
    validDays: 7,
    customer: { name: q.name, phone: q.phone, email: q.email, city: q.city },
    buildName: q.buildName,
    buildCode: q.build?.code,
    compatible: q.compatible,
    compatibilityNote: q.compatible
      ? "All selected components were checked by our compatibility engine and work together. A technician re-verifies every build before assembly."
      : "Some selected components need attention. Our team will review the configuration and suggest compatible alternatives before confirming.",
    estimatedW: q.estimatedW,
    recommendedW: q.recommendedW,
    items: q.items.map((i) => ({ slot: i.slot, name: i.name, model: i.model, qty: i.quantity, unitPrice: i.unitPrice, unitMrp: i.unitMrp, gstRate: i.gstRate })),
    requirements: q.requirements,
  });
  const inline = new URL(req.url).searchParams.get("view") === "1";
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${q.number}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
