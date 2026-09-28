import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "./auth-forms";
import { getSession } from "@/server/auth";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/account" } = await searchParams;
  if (await getSession()) redirect(next.startsWith("/") ? next : "/account");
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to see your saved builds, orders and quotations.">
      <LoginForm next={next} />
    </AuthShell>
  );
}
