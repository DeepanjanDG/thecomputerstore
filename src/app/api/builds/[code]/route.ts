import { NextResponse } from "next/server";
import { getBuild } from "@/server/builds";

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getBuild(code);
  if (!data) return NextResponse.json({ error: "Build not found" }, { status: 404 });
  return NextResponse.json({ code: data.build.code, name: data.build.name, useCase: data.build.useCase, items: data.items });
}
