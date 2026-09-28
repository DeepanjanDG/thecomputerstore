"use client";

import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "./brand-icons";
import { waLink } from "@/lib/whatsapp";

export function WhatsAppFab() {
  const pathname = usePathname();
  if (pathname.startsWith("/pc-builder") || pathname.startsWith("/admin")) return null;
  return (
    <a
      href={waLink("Hi The Computer Store! I need help choosing components.")}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-[#25D366] pl-4 pr-4 text-[#062e16] shadow-lift transition-all hover:pr-5"
      aria-label="Need help choosing components? Chat on WhatsApp"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold transition-all duration-300 group-hover:max-w-60 sm:inline">
        Need help choosing parts?
      </span>
    </a>
  );
}
