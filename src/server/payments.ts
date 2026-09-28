import "server-only";

/**
 * Payment gateway abstraction. Orders are created first (status PENDING / UNPAID), then the
 * selected provider decides what happens next. Add Razorpay by implementing this interface:
 *   createPayment → create a Razorpay order and return { kind: "checkout", payload } for the
 *   client-side Checkout.js; a webhook route then verifies the signature and marks the order PAID.
 */
export interface PaymentProvider {
  id: string;
  label: string;
  description: string;
  createPayment(order: { id: string; number: string; total: number; email: string; phone: string }): Promise<
    | { kind: "none" }
    | { kind: "redirect"; url: string }
    | { kind: "checkout"; payload: Record<string, unknown> }
  >;
}

const payAtStore: PaymentProvider = {
  id: "pay_at_store",
  label: "Pay at store / on pickup",
  description: "Reserve now and pay by UPI, card or cash when you collect from our Shillong store.",
  async createPayment() {
    return { kind: "none" };
  },
};

const bankTransfer: PaymentProvider = {
  id: "bank_transfer",
  label: "UPI / bank transfer",
  description: "We'll send UPI and bank details on WhatsApp after confirming stock.",
  async createPayment() {
    return { kind: "none" };
  },
};

export const PAYMENT_PROVIDERS: PaymentProvider[] = [payAtStore, bankTransfer];

export function getPaymentProvider(id: string) {
  return PAYMENT_PROVIDERS.find((p) => p.id === id) ?? payAtStore;
}
