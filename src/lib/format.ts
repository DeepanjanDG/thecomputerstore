const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("en-IN");

/** ₹1,06,893 */
export const formatINR = (n: number) => inr.format(Math.round(n));
/** 1,06,893 */
export const formatNumber = (n: number) => num.format(n);
/** Rs. 1,06,893 — for PDFs whose standard fonts lack the ₹ glyph */
export const formatRs = (n: number) => `Rs. ${num.format(Math.round(n))}`;

/** ₹1.2L / ₹60K */
export function compactINR(n: number) {
  if (n >= 1_00_000) return `₹${+(n / 1_00_000).toFixed(n % 1_00_000 === 0 ? 0 : 1)}L`;
  if (n >= 1000) return `₹${Math.round(n / 1000)}K`;
  return `₹${n}`;
}

export const discountPct = (price: number, mrp: number) => (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);

export function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function stockLabel(stock: number): { label: string; tone: "ok" | "warn" | "bad" } {
  if (stock <= 0) return { label: "Out of stock", tone: "bad" };
  if (stock <= 3) return { label: `Only ${stock} left`, tone: "warn" };
  return { label: "In stock", tone: "ok" };
}
