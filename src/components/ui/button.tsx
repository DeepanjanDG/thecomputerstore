import Link from "next/link";
import { forwardRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-[background,color,box-shadow,transform,border-color,filter] duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none";

const variants = {
  primary:
    "bg-accent text-accent-ink shadow-[0_4px_14px_-6px_color-mix(in_srgb,var(--accent)_70%,transparent)] hover:brightness-110 hover:shadow-[0_8px_20px_-8px_color-mix(in_srgb,var(--accent)_80%,transparent)]",
  dark: "bg-ink text-bg hover:opacity-90",
  secondary: "bg-surface text-ink border border-line-strong/70 shadow-sm hover:border-accent/50 hover:text-accent",
  soft: "bg-accent-soft text-accent hover:brightness-95",
  ghost: "text-ink hover:bg-surface-2",
  outline: "border border-line-strong text-ink hover:bg-surface-2",
  danger: "bg-bad text-white hover:brightness-110",
  whatsapp: "bg-[#25D366] text-[#062e16] hover:brightness-105",
} as const;

const sizes = {
  xs: "h-7 px-2.5 text-xs rounded-lg",
  sm: "h-9 px-3.5 text-sm rounded-lg",
  md: "h-11 px-5 text-[15px] rounded-[10px]",
  lg: "h-12 px-6 text-[15px] rounded-[10px]",
  icon: "h-10 w-10 rounded-[10px]",
  "icon-sm": "h-8 w-8 rounded-lg",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, type = "button", ...props },
  ref,
) {
  return <button ref={ref} type={type} className={buttonClass(variant, size, className)} {...props} />;
});

type LinkButtonProps = ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize };

export function LinkButton({ variant = "primary", size = "md", className, ...props }: LinkButtonProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
