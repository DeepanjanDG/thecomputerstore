import { NextResponse } from "next/server";

/** Turns the compare form's checkbox list (?pick=a&pick=b) into /compare?ids=a,b (max 4). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const ids = url.searchParams.getAll("pick").slice(0, 4);
  return NextResponse.redirect(new URL(`/compare${ids.length ? `?ids=${ids.join(",")}` : ""}`, url));
}
