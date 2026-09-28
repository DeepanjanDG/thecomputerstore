import { NextResponse } from "next/server";
import { createQuote, quoteInputSchema } from "@/server/quotes";
import { getSession } from "@/server/auth";
import { errorResponse, rateLimit, tooMany } from "@/server/http";

/** Creates a quotation: either a customer quote request (REQUEST) or a self-service PDF (DOWNLOAD). */
export async function POST(req: Request) {
  if (!rateLimit(req, "quote", 12)) return tooMany();
  try {
    const input = quoteInputSchema.parse(await req.json());
    const user = await getSession();
    const quote = await createQuote(input, user?.id);
    return NextResponse.json({ id: quote.id, number: quote.number, pdfUrl: `/api/quotes/${quote.id}/pdf` });
  } catch (e) {
    return errorResponse(e);
  }
}
