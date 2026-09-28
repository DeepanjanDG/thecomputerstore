"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { WhatsAppIcon } from "./brand-icons";
import { waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/** Hides the FAB while the user is actively scrolling down on small screens, so it
 * doesn't sit on top of card CTAs (Add to Cart, etc); reappears when scrolling stops. */
function useHideWhileScrolling() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!matchMedia("(max-width: 639px)").matches) return;
    let lastY = window.scrollY;
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastY && y > 80);
      lastY = y;
      clearTimeout(timer);
      timer = setTimeout(() => setHidden(false), 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  return hidden;
}

export function WhatsAppFab() {
  const pathname = usePathname();
  const hidden = useHideWhileScrolling();
  if (pathname.startsWith("/pc-builder") || pathname.startsWith("/admin")) return null;
  return (
    <a
      href={waLink("Hi The Computer Store! I need help choosing components.")}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group fixed bottom-4 right-4 z-40 flex h-12 items-center gap-2 rounded-full bg-[#25D366] pl-3 pr-3 text-[#062e16] shadow-lift transition-all hover:pr-5 sm:bottom-5 sm:right-5 sm:h-14 sm:pl-4 sm:pr-4",
        hidden && "translate-y-24 opacity-0",
      )}
      aria-label="Need help choosing components? Chat on WhatsApp"
    >
      <WhatsAppIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold transition-all duration-300 group-hover:max-w-60 sm:inline">
        Need help choosing parts?
      </span>
    </a>
  );
}
