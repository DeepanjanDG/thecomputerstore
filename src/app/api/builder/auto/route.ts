import { NextResponse } from "next/server";
import { z } from "zod";
import { buildRefSchema, resolveBuild } from "@/server/builder/load";
import { runAutoBuild } from "@/server/builder/auto-build";
import { errorResponse, rateLimit, tooMany } from "@/server/http";
import { priceBuild } from "@/lib/compat/service";

const body = z.object({
  budget: z.number().int().min(15000, "Please enter a budget of at least ₹15,000").max(2_000_000).optional(),
  useCase: z.enum(["gaming", "creator", "productivity", "workstation", "home"]),
  resolution: z.enum(["1080p", "1440p", "4K"]).optional(),
  cpuBrand: z.enum(["AMD", "Intel", "any"]).optional(),
  gpuBrand: z.enum(["NVIDIA", "AMD", "any"]).optional(),
  storageGb: z.number().int().optional(),
  locked: buildRefSchema.optional(),
});

/** "Build it for me" and "Start with your GPU/CPU" completion. */
export async function POST(req: Request) {
  if (!rateLimit(req, "autobuild", 30)) return tooMany();
  try {
    const input = body.parse(await req.json());
    const locked = input.locked ? await resolveBuild(input.locked) : undefined;
    // Without a budget (e.g. "I already have an RTX 4070"), size the build around the locked part.
    let budget = input.budget;
    if (!budget) {
      const lockedTotal = locked ? priceBuild(locked).total : 0;
      const gpu = locked?.gpu?.product.price, cpu = locked?.cpu?.product.price;
      budget = Math.round(gpu ? gpu / 0.4 : cpu ? cpu / 0.2 : Math.max(lockedTotal * 3, 80000));
    }
    const result = await runAutoBuild({ ...input, budget, locked });
    return NextResponse.json({ ...result, budget });
  } catch (e) {
    return errorResponse(e);
  }
}
