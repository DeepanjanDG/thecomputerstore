import Image from "next/image";
import { cn } from "@/lib/utils";

/** The store's round red logo (public/brand/tcs-logo.png). */
export function LogoMark({ className }: { className?: string }) {
  return <Image src="/brand/tcs-logo-160.png" alt="" width={44} height={44} className={cn("h-11 w-11 shrink-0", className)} aria-hidden priority />;
}

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className={cn("leading-none text-ink", compact && "hidden sm:block")}>
        <span className="block text-[11px] font-extrabold tracking-[0.02em]">THE</span>
        <span className="block text-[16px] font-extrabold tracking-[-0.01em]">COMPUTER STORE</span>
      </span>
    </span>
  );
}
