import { NextResponse } from "next/server";
import { checkoutSchema, placeOrder } from "@/server/orders";
import { getSession } from "@/server/auth";
import { errorResponse, rateLimit, tooMany } from "@/server/http";

export async function POST(req: Request) {
  if (!rateLimit(req, "order", 8)) return tooMany();
  try {
    const input = checkoutSchema.parse(await req.json());
    const user = await getSession();
    const { order, payment } = await placeOrder(input, user?.id);
    return NextResponse.json({ id: order.id, number: order.number, payment });
  } catch (e) {
    return errorResponse(e, "We couldn't place your order. Please try again or call us.");
  }
}
