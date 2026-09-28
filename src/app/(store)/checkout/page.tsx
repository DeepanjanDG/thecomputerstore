import type { Metadata } from "next";
import { CheckoutForm } from "./checkout-form";
import { PAYMENT_PROVIDERS } from "@/server/payments";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="container-x py-10">
      <h1 className="mb-8 text-4xl font-extrabold tracking-tight">Checkout</h1>
      <CheckoutForm payments={PAYMENT_PROVIDERS.map(({ id, label, description }) => ({ id, label, description }))} />
    </div>
  );
}
