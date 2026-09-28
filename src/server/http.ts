import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

// Tiny helpers shared by API route handlers.

const buckets = new Map<string, { count: number; reset: number }>();

/** Fixed-window in-memory rate limit. Swap for Redis/Upstash when running multiple instances. */
export function rateLimit(req: Request, key: string, limit = 20, windowMs = 60_000) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  const id = `${key}:${ip}`;
  const now = Date.now();
  const b = buckets.get(id);
  if (!b || b.reset < now) {
    buckets.set(id, { count: 1, reset: now + windowMs });
    return true;
  }
  b.count++;
  return b.count <= limit;
}

export function tooMany() {
  return NextResponse.json({ error: "Too many requests — please wait a minute and try again." }, { status: 429 });
}

export function errorResponse(e: unknown, fallback = "Something went wrong. Please try again.") {
  if (e instanceof ZodError) {
    const first = e.issues[0];
    return NextResponse.json({ error: first?.message ?? fallback, field: first?.path.join(".") }, { status: 400 });
  }
  if (e instanceof Error && !(e as { code?: string }).code) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
  console.error(e);
  return NextResponse.json({ error: fallback }, { status: 500 });
}
