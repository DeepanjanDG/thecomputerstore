"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useSessionUser } from "@/components/providers/session";
import { useToast } from "@/components/providers/toast";
import { cn } from "@/lib/utils";

export function WishlistButton({ productId, initial = false, boxed = false }: { productId: string; initial?: boolean; boxed?: boolean }) {
  const user = useSessionUser();
  const router = useRouter();
  const toast = useToast();
  const [saved, setSaved] = useState(initial);
  useEffect(() => {
    if (!user) return;
    fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`).then((r) => r.json()).then((d) => setSaved(!!d.saved)).catch(() => {});
  }, [user, productId]);
  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={async () => {
        if (!user) return router.push(`/login?next=${encodeURIComponent(location.pathname)}`);
        const r = await fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) });
        if (r.ok) {
          const { saved: s } = await r.json();
          setSaved(s);
          toast({ tone: "ok", title: s ? "Saved to wishlist" : "Removed from wishlist", action: s ? { label: "View", href: "/account?tab=wishlist" } : undefined });
        }
      }}
      className={cn(
        "flex items-center justify-center gap-2 text-sm font-semibold transition-colors",
        boxed && "h-12 rounded-[10px] border border-line-strong/70 bg-surface px-4 shadow-sm",
        saved ? "text-bad" : "text-ink-2 hover:text-bad",
      )}
    >
      <Heart className={cn("h-4 w-4", saved && "fill-current")} /> {saved ? "Saved" : boxed ? "Add to Wishlist" : "Save to wishlist"}
    </button>
  );
}
