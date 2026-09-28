"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  mrp: number;
  gstRate: number;
  qty: number;
  stock: number;
  image?: string | null;
  /** Items that belong to one custom PC share a build group label, e.g. "BLACKOUT (TC-8F29A4)". */
  buildGroup?: string | null;
  buildCode?: string | null;
  slotLabel?: string | null;
}

interface CartState {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  addBuild: (group: string, code: string | null, items: Omit<CartItem, "buildGroup" | "buildCode">[]) => void;
  setQty: (productId: string, group: string | null | undefined, qty: number) => void;
  remove: (productId: string, group: string | null | undefined) => void;
  removeGroup: (group: string) => void;
  clear: () => void;
  refresh: (prices: Record<string, { price: number; mrp: number; stock: number }>) => void;
}

const KEY = "tcs-cart-v1";
const CartCtx = createContext<CartState | null>(null);
const same = (a: CartItem, id: string, g: string | null | undefined) => a.productId === id && (a.buildGroup ?? null) === (g ?? null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const add = useCallback<CartState["add"]>((item, qty = 1) => {
    setItems((all) => {
      const i = all.findIndex((x) => same(x, item.productId, item.buildGroup));
      if (i >= 0) return all.map((x, j) => (j === i ? { ...x, qty: Math.min(x.qty + qty, 20) } : x));
      return [...all, { ...item, qty }];
    });
  }, []);

  const addBuild = useCallback<CartState["addBuild"]>((group, code, lines) => {
    setItems((all) => [...all.filter((x) => x.buildGroup !== group), ...lines.map((l) => ({ ...l, buildGroup: group, buildCode: code }))]);
  }, []);

  const value = useMemo<CartState>(() => ({
    items,
    ready,
    count: items.reduce((s, i) => s + i.qty, 0),
    subtotal: items.reduce((s, i) => s + i.qty * i.price, 0),
    add,
    addBuild,
    setQty: (id, g, qty) => setItems((all) => all.map((x) => (same(x, id, g) ? { ...x, qty: Math.max(1, Math.min(qty, 20)) } : x))),
    remove: (id, g) => setItems((all) => all.filter((x) => !same(x, id, g))),
    removeGroup: (g) => setItems((all) => all.filter((x) => x.buildGroup !== g)),
    clear: () => setItems([]),
    refresh: (prices) =>
      setItems((all) => all.flatMap((x) => (prices[x.productId] ? [{ ...x, ...prices[x.productId] }] : []))),
  }), [items, ready, add, addBuild]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
