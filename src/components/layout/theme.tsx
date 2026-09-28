"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Runs before paint to avoid a flash of the wrong theme.
 * Light is the default for everyone; dark is used only when the visitor has picked it with the toggle.
 */
export const THEME_SCRIPT = `(function(){var d=document.documentElement;d.dataset.theme='light';d.classList.add('js');try{if(localStorage.getItem('tcs-theme')==='dark')d.dataset.theme='dark'}catch(e){}})();`;

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  useEffect(() => setTheme((document.documentElement.dataset.theme as "light" | "dark") ?? "light"), []);
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => {
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem("tcs-theme", next);
        } catch {}
        setTheme(next);
      }}
      className={cn("grid h-10 w-10 place-items-center rounded-xl text-ink transition-colors hover:bg-surface-2", className)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}
