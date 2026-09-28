import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { getSession } from "@/server/auth";
import { errorResponse } from "@/server/http";

export async function GET(req: Request) {
  const user = await getSession();
  const productId = new URL(req.url).searchParams.get("productId");
  if (!user || !productId) return NextResponse.json({ saved: false });
  const item = await db.wishlistItem.findUnique({ where: { userId_productId: { userId: user.id, productId } } });
  return NextResponse.json({ saved: !!item }, { headers: { "Cache-Control": "private, no-store" } });
}

/** Toggles a product in the signed-in user's wishlist. */
export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Please sign in to use your wishlist." }, { status: 401 });
  try {
    const { productId } = z.object({ productId: z.string().min(1) }).parse(await req.json());
    const key = { userId_productId: { userId: user.id, productId } };
    const existing = await db.wishlistItem.findUnique({ where: key });
    if (existing) await db.wishlistItem.delete({ where: key });
    else await db.wishlistItem.create({ data: { userId: user.id, productId } });
    return NextResponse.json({ saved: !existing });
  } catch (e) {
    return errorResponse(e);
  }
}
