import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "../login/auth-forms";
import { getSession } from "@/server/auth";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/account" } = await searchParams;
  if (await getSession()) redirect("/account");
  return (
    <AuthShell title="Create your account" subtitle="Optional — but handy for keeping builds and orders together.">
      <RegisterForm next={next} />
    </AuthShell>
  );
}
