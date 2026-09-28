import { discountPct, formatINR, stockLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Price({ price, mrp, size = "md", className, hidePct }: { price: number; mrp: number; size?: "sm" | "md" | "lg" | "xl"; className?: string; hidePct?: boolean }) {
  const off = discountPct(price, mrp);
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className={cn("font-extrabold tracking-tight tabular-nums text-ink", { sm: "text-base", md: "text-lg", lg: "text-2xl", xl: "text-[34px]" }[size])}>
        {formatINR(price)}
      </span>
      {off > 0 && (
        <>
          <span className={cn("text-muted line-through tabular-nums", size === "xl" ? "text-lg" : "text-sm")}>
            <span className="sr-only">MRP </span>{formatINR(mrp)}
          </span>
          {!hidePct && (
            size === "xl"
              ? <span className="self-center rounded-md bg-bad px-2 py-0.5 text-sm font-bold text-white">{off}% Off</span>
              : <span className="text-sm font-semibold text-ok">{off}% off</span>
          )}
        </>
      )}
    </div>
  );
}

export function StockBadge({ stock, className }: { stock: number; className?: string }) {
  const s = stockLabel(stock);
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", s.tone === "ok" ? "text-ok" : s.tone === "warn" ? "text-warn" : "text-bad", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.tone === "ok" ? "bg-ok" : s.tone === "warn" ? "bg-warn" : "bg-bad")} aria-hidden />
      {s.label}
    </span>
  );
}
