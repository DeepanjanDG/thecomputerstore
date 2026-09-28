import { NextResponse } from "next/server";
import { z } from "zod";
import { SLOTS } from "@/lib/compat/types";
import { buildRefSchema, resolveBuild } from "@/server/builder/load";
import { getBuilderOptions } from "@/server/builder/options";
import { getEngineConfig } from "@/server/config";
import { errorResponse } from "@/server/http";

const query = z.object({
  slot: z.enum(SLOTS),
  build: z.string().optional(),
  q: z.string().max(80).optional(),
  brands: z.string().optional(),
  min: z.coerce.number().int().min(0).optional(),
  max: z.coerce.number().int().min(0).optional(),
  inStock: z.enum(["1", "0"]).optional(),
  sort: z.enum(["popular", "price-asc", "price-desc", "performance", "newest", "rating", "power"]).optional(),
  specs: z.string().optional(),
  showIncompatible: z.enum(["1", "0"]).optional(),
});

export async function GET(req: Request) {
  try {
    const params = query.parse(Object.fromEntries(new URL(req.url).searchParams));
    const ref = params.build ? buildRefSchema.parse(JSON.parse(params.build)) : {};
    const specs = params.specs ? z.record(z.string(), z.array(z.string())).parse(JSON.parse(params.specs)) : undefined;
    const [items, cfg] = await Promise.all([resolveBuild(ref), getEngineConfig()]);
    const result = await getBuilderOptions(
      {
        slot: params.slot,
        q: params.q,
        brands: params.brands ? params.brands.split(",").filter(Boolean) : undefined,
        min: params.min,
        max: params.max,
        inStock: params.inStock === "1",
        sort: params.sort,
        specs,
        showIncompatible: params.showIncompatible === "1",
      },
      items,
      cfg,
    );
    return NextResponse.json(result);
  } catch (e) {
    return errorResponse(e);
  }
}
