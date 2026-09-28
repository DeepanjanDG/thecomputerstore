import type { ListParams, SortKey } from "./catalog";

type SP = Record<string, string | string[] | undefined>;

const SORTS: SortKey[] = ["popular", "price-asc", "price-desc", "newest", "rating", "performance"];

/** Translates catalogue URL params (?brand=asus,msi&max=20000&f_socket=AM5) into query params. */
export function parseListParams(sp: SP): ListParams & { flat: Record<string, string> } {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : sp[k]) as string | undefined;
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) if (typeof v === "string" && k !== "page") flat[k] = v;
  const specs: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(flat)) if (k.startsWith("f_")) specs[k.slice(2)] = v.split(",").filter(Boolean);
  const num = (k: string) => (one(k) && !Number.isNaN(Number(one(k))) ? Number(one(k)) : undefined);
  const sort = one("sort") as SortKey | undefined;
  return {
    flat,
    q: one("q") || undefined,
    brands: one("brand")?.split(",").filter(Boolean),
    min: num("min"),
    max: num("max"),
    inStock: one("stock") === "1",
    sort: sort && SORTS.includes(sort) ? sort : undefined,
    page: num("page") ?? 1,
    specs,
  };
}
