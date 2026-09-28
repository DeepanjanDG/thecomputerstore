"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { updateProfileAction, type AuthState } from "@/server/actions/auth";

export function ProfileForm({ user }: { user: { name: string; email: string; phone: string; city: string } }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(updateProfileAction, {});
  return (
    <form action={action} className="max-w-lg space-y-4 rounded-[24px] border border-line bg-surface p-6">
      <Field label="Email" htmlFor="p-email" hint="Contact us to change your email."><Input id="p-email" value={user.email} disabled /></Field>
      <Field label="Full name" htmlFor="p-name"><Input id="p-name" name="name" defaultValue={user.name} required /></Field>
      <Field label="Phone" htmlFor="p-phone" optional><Input id="p-phone" name="phone" type="tel" defaultValue={user.phone} /></Field>
      <Field label="City" htmlFor="p-city" optional><Input id="p-city" name="city" defaultValue={user.city} /></Field>
      {state.error && <p role="alert" className="text-sm text-bad">{state.error}</p>}
      {state.ok && <p role="status" className="text-sm text-ok">Profile updated.</p>}
      <Button type="submit" disabled={pending}>{pending && <Loader2 className="h-4 w-4 animate-spin" />} Save changes</Button>
    </form>
  );
}
