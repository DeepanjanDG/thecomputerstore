"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Accessible modal built on the native <dialog> element (focus trap + Esc handled by the browser). */
export function Dialog({
  open, onClose, title, description, children, className, side, footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** "right" renders as a slide-over sheet, "bottom" as a mobile sheet */
  side?: "right" | "bottom";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby={`${id}-title`}
      className={cn(
        "m-auto max-h-[92dvh] w-[min(560px,calc(100vw-24px))] rounded-[24px] border border-line bg-surface p-0 text-ink shadow-lift backdrop:bg-black/55 backdrop:backdrop-blur-sm open:animate-pop",
        side === "right" && "my-0 mr-0 ml-auto h-dvh max-h-dvh w-[min(480px,100vw)] rounded-none sm:rounded-l-[24px]",
        side === "bottom" && "mx-0 mb-0 mt-auto max-h-[88dvh] w-full max-w-none rounded-b-none",
        className,
      )}
    >
      {open && (
        <div className="flex max-h-[inherit] h-full flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 pb-4 pt-5 sm:px-6">
            <div>
              <h2 id={`${id}-title`} className="text-lg font-bold">{title}</h2>
              {description && <p className="mt-1 text-sm text-muted">{description}</p>}
            </div>
            <button onClick={onClose} className="-mr-2 rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink" aria-label="Close dialog">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
          {footer && <div className="border-t border-line px-5 py-4 sm:px-6">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
