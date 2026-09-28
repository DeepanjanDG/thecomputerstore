import { NextResponse } from "next/server";
import { z } from "zod";
import { buildRefSchema } from "@/server/builder/load";
import { saveBuild } from "@/server/builds";
import { getSession } from "@/server/auth";
import { errorResponse, rateLimit, tooMany } from "@/server/http";
import { SITE } from "@/lib/site";

const body = z.object({
  build: buildRefSchema,
  name: z.string().trim().max(80).default("My Custom PC"),
  useCase: z.string().max(30).nullish(),
});

/** Saves a snapshot of a build and returns its share code. Guests can save; users also own it. */
export async function POST(req: Request) {
  if (!rateLimit(req, "save-build", 20)) return tooMany();
  try {
    const input = body.parse(await req.json());
    const user = await getSession();
    const code = await saveBuild({ ref: input.build, name: input.name, useCase: input.useCase, userId: user?.id });
    return NextResponse.json({ code, url: `${SITE.url}/build/${code}`, owned: !!user });
  } catch (e) {
    return errorResponse(e);
  }
}
