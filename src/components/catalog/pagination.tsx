import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({ page, pages, base, params }: { page: number; pages: number; base: string; params: Record<string, string> }) {
  if (pages <= 1) return null;
  const href = (p: number) => `${base}?${new URLSearchParams({ ...params, page: String(p) })}`;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1">
      {page > 1 && <Link href={href(page - 1)} className="grid h-10 w-10 place-items-center rounded-xl border border-line hover:bg-surface-2" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Link>}
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-1">
          {i > 0 && nums[i - 1] !== n - 1 && <span className="px-1 text-muted">…</span>}
          <Link href={href(n)} aria-current={n === page ? "page" : undefined} className={cn("grid h-10 min-w-10 place-items-center rounded-xl border px-3 text-sm font-semibold", n === page ? "border-ink bg-ink text-bg" : "border-line hover:bg-surface-2")}>
            {n}
          </Link>
        </span>
      ))}
      {page < pages && <Link href={href(page + 1)} className="grid h-10 w-10 place-items-center rounded-xl border border-line hover:bg-surface-2" aria-label="Next page"><ChevronRight className="h-4 w-4" /></Link>}
    </nav>
  );
}
