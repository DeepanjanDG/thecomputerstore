// Builds the denormalised, lower-case search string stored on each product.
// Kept pure so the seed script and admin save path produce identical results.

export function buildSearchText(input: {
  name: string;
  model?: string | null;
  sku: string;
  brand: string;
  category: string;
  specs: Record<string, unknown>;
}) {
  const specBits = Object.values(input.specs)
    .flatMap((v) => (Array.isArray(v) ? v : [v]))
    .filter((v) => typeof v === "string" || typeof v === "number")
    .map(String);
  const parts = [input.name, input.model ?? "", input.sku, input.brand, input.category, ...specBits];
  const text = parts.join(" ").toLowerCase();
  // add joined variants so "32gb ddr5" and "32 gb" both match
  return `${text} ${text.replace(/(\d)\s+(gb|tb|w|mm|hz)/g, "$1$2")}`.replace(/\s+/g, " ").trim();
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
