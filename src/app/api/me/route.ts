import { NextResponse } from "next/server";
import { getSession } from "@/server/auth";

/** Current user for client components. Kept out of the root layout so public pages stay static. */
export async function GET() {
  const user = await getSession();
  return NextResponse.json({ user }, { headers: { "Cache-Control": "private, no-store" } });
}
