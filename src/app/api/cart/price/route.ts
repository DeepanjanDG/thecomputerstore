import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { stockOf } from "@/server/catalog";
import { evaluateCoupon } from "@/server/orders";
import { errorResponse } from "@/server/http";

const body = z.object({ ids: z.array(z.string()).max(100), coupon: z.string().max(30).optional(), subtotal: z.number().optional() });

/** Current prices/stock for cart items (the cart lives in the browser), plus coupon evaluation. */
export async function POST(req: Request) {
  try {
    const { ids, coupon, subtotal } = body.parse(await req.json());
    const rows = await db.product.findMany({ where: { id: { in: ids }, status: "ACTIVE" }, include: { inventory: true } });
    const prices = Object.fromEntries(rows.map((p) => [p.id, { price: p.price, mrp: p.mrp, stock: stockOf(p) }]));
    let couponResult: { discount: number; code: string; description: string | null } | { error: string } | null = null;
    if (coupon) {
      try {
        const total = subtotal ?? rows.reduce((s, p) => s + p.price, 0);
        const r = await evaluateCoupon(coupon, total);
        couponResult = { discount: r.discount, code: r.coupon!.code, description: r.coupon!.description };
      } catch (e) {
        couponResult = { error: (e as Error).message };
      }
    }
    return NextResponse.json({ prices, coupon: couponResult });
  } catch (e) {
    return errorResponse(e);
  }
}
