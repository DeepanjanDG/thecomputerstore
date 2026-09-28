import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusKind = "compatible" | "warning" | "incompatible" | "info" | "empty";

const MAP = {
  compatible: { Icon: CheckCircle2, label: "Compatible", cls: "text-ok bg-ok-soft" },
  warning: { Icon: AlertTriangle, label: "Warning", cls: "text-warn bg-warn-soft" },
  incompatible: { Icon: XCircle, label: "Incompatible", cls: "text-bad bg-bad-soft" },
  info: { Icon: Info, label: "Note", cls: "text-accent bg-accent-soft" },
  empty: { Icon: Info, label: "Not started", cls: "text-muted bg-surface-2" },
} as const;

/** Status is always icon + word + colour — never colour alone (WCAG 1.4.1). */
export function StatusPill({
  status, label, className, size = "sm",
}: { status: StatusKind; label?: string; className?: string; size?: "sm" | "md" }) {
  const { Icon, label: def, cls } = MAP[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full font-semibold", size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm", cls, className)}>
      <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />
      {label ?? def}
    </span>
  );
}

export function StatusIcon({ status, className }: { status: StatusKind; className?: string }) {
  const { Icon, label, cls } = MAP[status];
  return <Icon className={cn("h-4 w-4 shrink-0", cls.split(" ")[0], className)} aria-label={label} role="img" />;
}
