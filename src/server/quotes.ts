import "server-only";
import { z } from "zod";
import { db } from "./db";
import { resolveRefWithReport } from "./builds";
import { buildRefSchema } from "./builder/load";
import { SLOT_META, STEP_ORDER } from "@/lib/compat/slots";
import type { Slot } from "@/lib/compat/types";
import { notify } from "./notify";

export const quoteInputSchema = z.object({
  build: buildRefSchema,
  source: z.enum(["REQUEST", "DOWNLOAD"]).default("REQUEST"),
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{7,15}$/, "Please enter a valid phone number").optional().or(z.literal("")),
  email: z.string().trim().email("Please enter a valid email").optional().or(z.literal("")),
  city: z.string().trim().max(60).optional(),
  contactMethod: z.enum(["whatsapp", "phone", "email"]).optional(),
  buildName: z.string().trim().max(80).optional(),
  budget: z.coerce.number().int().min(0).max(10_000_000).optional(),
  requirements: z.string().trim().max(2000).optional(),
  buildCode: z.string().optional(),
});

export type QuoteInput = z.infer<typeof quoteInputSchema>;

async function nextQuoteNumber() {
  const now = new Date();
  const prefix = `TCS-Q-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}-`;
  const last = await db.quote.findFirst({ where: { number: { startsWith: prefix } }, orderBy: { number: "desc" }, select: { number: true } });
  const seq = last ? Number(last.number.slice(prefix.length)) + 1 : 1;
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

export async function createQuote(input: QuoteInput, userId?: string | null) {
  if (input.source === "REQUEST" && !input.phone && !input.email)
    throw new Error("Please give us a phone number or email so we can reach you.");
  const { items, report, pricing } = await resolveRefWithReport(input.build);
  if (Object.keys(items).length === 0) throw new Error("Your build is empty.");
  const build = input.buildCode ? await db.build.findUnique({ where: { code: input.buildCode } }) : null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const number = await nextQuoteNumber();
    try {
      const quote = await db.quote.create({
        data: {
          number,
          source: input.source,
          name: input.name,
          phone: input.phone || null,
          email: input.email || null,
          city: input.city || null,
          contactMethod: input.contactMethod ?? null,
          buildName: input.buildName || null,
          budget: input.budget ?? null,
          requirements: input.requirements || null,
          subtotal: pricing.total,
          mrpTotal: pricing.mrpTotal,
          gstTotal: pricing.gstIncluded,
          compatible: report.errors.length === 0,
          estimatedW: report.power.estimatedW || null,
          recommendedW: report.power.recommendedW || null,
          userId: userId ?? null,
          buildId: build?.id ?? null,
          items: {
            create: STEP_ORDER.filter((s) => items[s]).map((slot: Slot) => {
              const l = items[slot]!;
              return {
                productId: l.product.id, slot: SLOT_META[slot].label, name: l.product.name, model: l.product.model ?? null,
                quantity: l.qty, unitPrice: l.product.price, unitMrp: Math.max(l.product.mrp, l.product.price), gstRate: l.product.gstRate,
              };
            }),
          },
        },
      });
      if (input.source === "REQUEST")
        await notify("quote.requested", { number, name: input.name, phone: input.phone, total: pricing.total });
      return quote;
    } catch (e) {
      if ((e as { code?: string }).code !== "P2002") throw e;
    }
  }
  throw new Error("Could not allocate a quotation number");
}

export function getQuoteForPdf(id: string) {
  return db.quote.findUnique({ where: { id }, include: { items: true, build: { select: { code: true } } } });
}
