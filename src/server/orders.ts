import "server-only";
import { z } from "zod";
import { db } from "./db";
import { stockOf } from "./catalog";
import { getPaymentProvider } from "./payments";
import { notify } from "./notify";

export const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    qty: z.number().int().min(1).max(20),
    buildGroup: z.string().max(80).nullish(),
  })).min(1, "Your cart is empty"),
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{7,15}$/, "Please enter a valid phone number"),
  email: z.string().trim().email("Please enter a valid email"),
  fulfilment: z.enum(["pickup", "delivery"]),
  addressLine: z.string().trim().max(200).optional(),
  city: z.string().trim().max(60).optional(),
  state: z.string().trim().max(60).optional(),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit PIN code").optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional(),
  coupon: z.string().trim().max(30).optional(),
  payment: z.string().default("pay_at_store"),
}).refine((d) => d.fulfilment === "pickup" || (d.addressLine && d.city && d.pincode), {
  message: "Please enter your delivery address", path: ["addressLine"],
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export async function evaluateCoupon(code: string | undefined, subtotal: number) {
  if (!code) return { discount: 0, coupon: null as null | { code: string; description: string | null } };
  const c = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });
  const now = new Date();
  if (!c || !c.isActive || (c.startsAt && c.startsAt > now) || (c.endsAt && c.endsAt < now) || (c.usageLimit != null && c.usedCount >= c.usageLimit))
    throw new Error("This coupon code isn't valid.");
  if (subtotal < c.minOrder) throw new Error(`This coupon needs a minimum order of ₹${c.minOrder.toLocaleString("en-IN")}.`);
  let discount = c.type === "PERCENT" ? Math.round((subtotal * c.value) / 100) : c.value;
  if (c.maxDiscount != null) discount = Math.min(discount, c.maxDiscount);
  return { discount: Math.min(discount, subtotal), coupon: { code: c.code, description: c.description } };
}

async function nextOrderNumber() {
  const now = new Date();
  const prefix = `TCS-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}-`;
  const last = await db.order.findFirst({ where: { number: { startsWith: prefix } }, orderBy: { number: "desc" }, select: { number: true } });
  const seq = last ? Number(last.number.slice(prefix.length)) + 1 : 1;
  return `${prefix}${String(seq).padStart(5, "0")}`;
}

/** Prices and stock always come from the database, never from the client. */
export async function placeOrder(input: CheckoutInput, userId?: string | null) {
  const ids = [...new Set(input.items.map((i) => i.productId))];
  const products = await db.product.findMany({ where: { id: { in: ids }, status: "ACTIVE" }, include: { inventory: true } });
  const lines = input.items.map((i) => {
    const p = products.find((x) => x.id === i.productId);
    if (!p) throw new Error("One of the products in your cart is no longer available.");
    if (stockOf(p) < i.qty) throw new Error(`${p.name} has only ${stockOf(p)} in stock.`);
    return { p, qty: i.qty, buildGroup: i.buildGroup ?? null };
  });
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const { discount, coupon } = await evaluateCoupon(input.coupon, subtotal);
  const total = subtotal - discount;
  const gstTotal = Math.round(lines.reduce((s, l) => s + (l.p.price * l.qty * l.p.gstRate) / (100 + l.p.gstRate), 0) * (total / subtotal));
  const assembly = lines.some((l) => l.buildGroup);
  const provider = getPaymentProvider(input.payment);

  for (let attempt = 0; attempt < 5; attempt++) {
    const number = await nextOrderNumber();
    try {
      const order = await db.$transaction(async (tx) => {
        const o = await tx.order.create({
          data: {
            number, userId: userId ?? null, name: input.name, phone: input.phone, email: input.email,
            fulfilment: input.fulfilment, addressLine: input.addressLine || null, city: input.city || null,
            state: input.state || null, pincode: input.pincode || null, notes: input.notes || null,
            couponCode: coupon?.code ?? null, subtotal, discount, gstTotal, total, assembly, paymentProvider: provider.id,
            items: {
              create: lines.map((l) => ({ productId: l.p.id, name: l.p.name, quantity: l.qty, unitPrice: l.p.price, gstRate: l.p.gstRate, buildGroup: l.buildGroup })),
            },
          },
        });
        for (const l of lines)
          await tx.inventory.updateMany({ where: { productId: l.p.id, location: "SHILLONG-MAIN" }, data: { reserved: { increment: l.qty } } });
        if (coupon) await tx.coupon.update({ where: { code: coupon.code }, data: { usedCount: { increment: 1 } } });
        return o;
      });
      const payment = await provider.createPayment({ id: order.id, number: order.number, total, email: input.email, phone: input.phone });
      await notify("order.placed", { number, total, name: input.name });
      return { order, payment };
    } catch (e) {
      if ((e as { code?: string }).code !== "P2002") throw e;
    }
  }
  throw new Error("Could not allocate an order number");
}
