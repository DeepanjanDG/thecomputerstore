import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { notify } from "@/server/notify";
import { errorResponse, rateLimit, tooMany } from "@/server/http";

const body = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z.string().trim().max(20).optional(),
  email: z.string().trim().email("Please enter a valid email").optional().or(z.literal("")),
  topic: z.string().trim().max(60).optional(),
  message: z.string().trim().min(5, "Please tell us a little more").max(3000),
}).refine((d) => d.phone || d.email, { message: "Please give us a phone number or email", path: ["phone"] });

export async function POST(req: Request) {
  if (!rateLimit(req, "contact", 6)) return tooMany();
  try {
    const input = body.parse(await req.json());
    await db.contactMessage.create({ data: { ...input, email: input.email || null, phone: input.phone || null } });
    await notify("contact.message", { name: input.name, topic: input.topic });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
