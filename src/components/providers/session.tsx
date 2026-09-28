"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/server/session";

const Ctx = createContext<SessionUser | null>(null);

/** Loads the signed-in user on the client so server-rendered pages can be cached. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const pathname = usePathname();
  useEffect(() => {
    let alive = true;
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => alive && setUser(d.user ?? null))
      .catch(() => {});
    return () => {
      alive = false;
    };
    // Re-check after navigation (e.g. after signing in or out).
  }, [pathname]);
  return <Ctx.Provider value={user}>{children}</Ctx.Provider>;
}

export const useSessionUser = () => useContext(Ctx);
