"use client";

import { useEffect, useRef } from "react";
import { useBuilder } from "@/components/providers/builder";
import type { BuilderProduct } from "@/lib/compat/types";

export function AddOnMount({ product }: { product: BuilderProduct }) {
  const b = useBuilder();
  const done = useRef(false);
  useEffect(() => {
    if (!b.ready || done.current) return;
    done.current = true;
    b.set(product.slot, product);
  }, [b, product]);
  return null;
}
