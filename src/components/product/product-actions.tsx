"use client";

import { useRouter } from "next/navigation";
import { Check, Cpu, Minus, Plus, ShoppingBag, ShoppingCart, Zap } from "lucide-react";
import { useState } from "react";
import { Button, type ButtonSize } from "@/components/ui/button";
import { useCart, type CartItem } from "@/components/providers/cart";
import { useBuilder } from "@/components/providers/builder";
import { useToast } from "@/components/providers/toast";
import type { BuilderProduct } from "@/lib/compat/types";
import { SLOT_META } from "@/lib/compat/slots";
import { cn } from "@/lib/utils";

export type CartSeed = Omit<CartItem, "qty">;

export function AddToCartButton({ item, size = "sm", className, full, label = "Add to Cart" }: { item: CartSeed; size?: ButtonSize; className?: string; full?: boolean; label?: string }) {
  const { add } = useCart();
  const toast = useToast();
  const [done, setDone] = useState(false);
  const out = item.stock <= 0;
  return (
    <Button
      size={size}
      variant="secondary"
      disabled={out}
      className={cn(full && "w-full", className)}
      onClick={() => {
        add(item);
        setDone(true);
        setTimeout(() => setDone(false), 1400);
        toast({ tone: "ok", title: "Added to cart", body: item.name, action: { label: "View cart", href: "/cart" } });
      }}
    >
      {done ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
      {out ? "Out of stock" : done ? "Added" : label}
    </Button>
  );
}

export function AddToBuilderButton({ product, size = "sm", className, full, go = false }: { product: BuilderProduct; size?: ButtonSize; className?: string; full?: boolean; go?: boolean }) {
  const builder = useBuilder();
  const router = useRouter();
  const toast = useToast();
  const inBuild = builder.items[product.slot]?.product.id === product.id;
  return (
    <Button
      size={size}
      variant={inBuild ? "soft" : "primary"}
      className={cn(full && "w-full", className)}
      onClick={() => {
        const replacing = builder.items[product.slot] && !inBuild;
        builder.set(product.slot, product);
        if (go) router.push(`/pc-builder?step=${product.slot}`);
        else
          toast({
            tone: "ok",
            title: replacing ? `${SLOT_META[product.slot].label} replaced in your build` : `Added to your build`,
            body: product.name,
            action: { label: "Open builder", href: `/pc-builder?step=${product.slot}` },
          });
      }}
      aria-label={`Add ${product.name} to your PC build`}
    >
      {inBuild ? <Check className="h-4 w-4" /> : <Cpu className="h-4 w-4" />}
      {inBuild ? "In your build" : "Add to Builder"}
    </Button>
  );
}

export function BuyNowButton({ item, className }: { item: CartSeed; className?: string }) {
  const { add, items } = useCart();
  const router = useRouter();
  return (
    <Button
      variant="dark"
      size="lg"
      disabled={item.stock <= 0}
      className={className}
      onClick={() => {
        if (!items.some((i) => i.productId === item.productId && !i.buildGroup)) add(item);
        router.push("/checkout");
      }}
    >
      <Zap className="h-4 w-4" /> Buy Now
    </Button>
  );
}

/** Product-page buy box: quantity stepper, Add to Cart and Buy Now, as in a standard retail layout. */
export function PurchaseBox({ item, children }: { item: CartSeed; children?: React.ReactNode }) {
  const { add, items } = useCart();
  const toast = useToast();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const out = item.stock <= 0;
  const max = Math.max(1, Math.min(item.stock, 20));
  return (
    <div className="space-y-2.5">
      <div className="flex gap-2.5">
        <div className="flex h-12 shrink-0 items-center rounded-[10px] border border-line-strong/70 bg-surface" role="group" aria-label="Quantity">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1 || out} className="grid h-full w-10 place-items-center text-ink-2 disabled:opacity-40" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
          <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">{qty}</span>
          <button type="button" onClick={() => setQty((q) => Math.min(max, q + 1))} disabled={qty >= max || out} className="grid h-full w-10 place-items-center text-ink-2 disabled:opacity-40" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
        </div>
        <Button
          size="lg"
          disabled={out}
          className="flex-1"
          onClick={() => {
            add(item, qty);
            toast({ tone: "ok", title: `Added to cart${qty > 1 ? ` (×${qty})` : ""}`, body: item.name, action: { label: "View cart", href: "/cart" } });
          }}
        >
          <ShoppingCart className="h-[18px] w-[18px]" /> {out ? "Out of stock" : "Add to Cart"}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Button
          size="lg"
          variant="soft"
          disabled={out}
          onClick={() => {
            if (!items.some((i) => i.productId === item.productId && !i.buildGroup)) add(item, qty);
            router.push("/checkout");
          }}
        >
          <Zap className="h-4 w-4" /> Buy Now
        </Button>
        {children}
      </div>
    </div>
  );
}
