import type { BuildItems, BuilderProduct, Slot, SpecValue } from "./types";

// Small typed accessors so rules read like prose and tolerate missing data.

export function num(p: BuilderProduct | undefined, key: string): number | null {
  const v: SpecValue | undefined = p?.specs[key];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  return null;
}

export function str(p: BuilderProduct | undefined, key: string): string | null {
  const v = p?.specs[key];
  if (v == null) return null;
  if (Array.isArray(v)) return v.join(", ");
  return String(v).trim() || null;
}

export function bool(p: BuilderProduct | undefined, key: string): boolean | null {
  const v = p?.specs[key];
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return ["true", "yes", "1"].includes(v.toLowerCase());
  return null;
}

export function list(p: BuilderProduct | undefined, key: string): string[] {
  const v = p?.specs[key];
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === "string") return v.split(",").map((x) => x.trim()).filter(Boolean);
  if (typeof v === "number") return [String(v)];
  return [];
}

/** Case-insensitive, whitespace-insensitive comparison for identifiers like "AM5", "Micro-ATX". */
export function norm(s: string | null | undefined): string {
  return (s ?? "").toLowerCase().replace(/[\s\-_]/g, "");
}

export function sameId(a: string | null | undefined, b: string | null | undefined) {
  return !!a && !!b && norm(a) === norm(b);
}

export function includesId(values: string[], v: string | null | undefined) {
  return !!v && values.some((x) => norm(x) === norm(v));
}

/** Aliases so "mATX", "Micro ATX" and "Micro-ATX" all match. */
const FORM_ALIASES: Record<string, string> = {
  matx: "microatx", microatx: "microatx", uatx: "microatx",
  itx: "miniitx", miniitx: "miniitx",
  eatx: "eatx", extendedatx: "eatx",
  atx: "atx",
};
export function formFactor(v: string | null | undefined) {
  const n = norm(v);
  return FORM_ALIASES[n] ?? n;
}

export function part(items: BuildItems, slot: Slot) {
  return items[slot]?.product;
}

export function qty(items: BuildItems, slot: Slot) {
  return items[slot]?.qty ?? 0;
}
