"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { loginAction, registerAction, type AuthState } from "@/server/actions/auth";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginAction, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <Field label="Email" htmlFor="l-email"><Input id="l-email" name="email" type="email" required autoComplete="email" /></Field>
      <Field label="Password" htmlFor="l-pass"><Input id="l-pass" name="password" type="password" required autoComplete="current-password" /></Field>
      {state.error && <p role="alert" className="rounded-xl bg-bad-soft p-3 text-sm text-bad">{state.error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>{pending && <Loader2 className="h-4 w-4 animate-spin" />} Sign in</Button>
      <p className="text-center text-sm text-muted">New here? <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-semibold text-accent">Create an account</Link></p>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(registerAction, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <Field label="Full name" htmlFor="r-name"><Input id="r-name" name="name" required autoComplete="name" /></Field>
      <Field label="Email" htmlFor="r-email"><Input id="r-email" name="email" type="email" required autoComplete="email" /></Field>
      <Field label="Phone" htmlFor="r-phone" optional><Input id="r-phone" name="phone" type="tel" autoComplete="tel" /></Field>
      <Field label="Password" htmlFor="r-pass" hint="At least 8 characters."><Input id="r-pass" name="password" type="password" required minLength={8} autoComplete="new-password" /></Field>
      {state.error && <p role="alert" className="rounded-xl bg-bad-soft p-3 text-sm text-bad">{state.error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>{pending && <Loader2 className="h-4 w-4 animate-spin" />} Create account</Button>
      <p className="text-center text-sm text-muted">Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-accent">Sign in</Link></p>
    </form>
  );
}
