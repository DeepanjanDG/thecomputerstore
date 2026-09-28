"use client";

import type { ReactNode } from "react";
import type { EngineConfig } from "@/lib/compat/types";
import { BuilderProvider } from "./builder";
import { CartProvider } from "./cart";
import { ToastProvider } from "./toast";
import { SessionProvider } from "./session";

export function Providers({ children, config }: { children: ReactNode; config: EngineConfig }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <CartProvider>
          <BuilderProvider config={config}>{children}</BuilderProvider>
        </CartProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
