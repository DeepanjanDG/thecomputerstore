// Shared shape for the Admin → Homepage content "Stats" and "Customer reviews" editors.
// Kept out of actions/admin.ts because a "use server" file may only export async functions.
import { z } from "zod";

export const HOME_MAX_STATS = 4;
export const HOME_MAX_REVIEWS = 9;

export const statRowSchema = z.object({ value: z.string().trim().max(20), label: z.string().trim().max(80) });
export const reviewRowSchema = z.object({
  name: z.string().trim().max(60),
  city: z.string().trim().max(60),
  build: z.string().trim().max(80).optional(),
  text: z.string().trim().max(600),
});

/** Reads one row of plain `<name><index>` form fields (e.g. statValue0/statLabel0), rather than a JSON blob. */
export function readRow<F extends string>(form: FormData, names: Record<F, string>, i: number): Record<F, string> {
  const row = {} as Record<F, string>;
  for (const key in names) row[key as F] = String(form.get(`${names[key as F]}${i}`) ?? "").trim();
  return row;
}
