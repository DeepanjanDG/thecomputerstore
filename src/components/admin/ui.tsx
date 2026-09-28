"use client";

import { useActionState, type ReactNode } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/server/actions/admin";

/** Form bound to a server action, with inline success/error feedback. */
export function ActionForm({
  action, children, submit = "Save", className,
}: {
  action: (s: ActionState, f: FormData) => Promise<ActionState>;
  children: ReactNode;
  submit?: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className={className}>
      {children}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>{pending && <Loader2 className="h-4 w-4 animate-spin" />} {submit}</Button>
        {state.error && <p role="alert" className="text-sm text-bad">{state.error}</p>}
        {state.ok && <p role="status" className="flex items-center gap-1.5 text-sm text-ok"><CheckCircle2 className="h-4 w-4" /> {state.ok}</p>}
      </div>
    </form>
  );
}
