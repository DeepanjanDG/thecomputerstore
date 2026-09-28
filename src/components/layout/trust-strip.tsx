import { Headset, ShieldCheck, Truck, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { icon: ShieldCheck, title: "100% Genuine Products", body: "Authorised channels, full warranty" },
  { icon: Wrench, title: "Free Assembly & Testing", body: "On every custom PC we build" },
  { icon: Headset, title: "Expert Support", body: "Talk to a real PC technician" },
  { icon: Truck, title: "Delivery Across India", body: "Packed safely, shipped from Shillong" },
];

/** Row of store guarantees, used under the hero, in the cart and above the footer. */
export function TrustStrip({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-x-4 gap-y-5 lg:grid-cols-4", className)}>
      {ITEMS.map((it) => (
        <li key={it.title} className="flex items-center gap-3">
          <span className={cn("grid shrink-0 place-items-center rounded-full border border-line bg-surface text-ink-2", compact ? "h-9 w-9" : "h-11 w-11")}>
            <it.icon className={compact ? "h-[18px] w-[18px]" : "h-5 w-5"} strokeWidth={1.8} />
          </span>
          <span className="min-w-0">
            <span className="block text-[13.5px] font-semibold leading-tight text-ink">{it.title}</span>
            {!compact && <span className="mt-0.5 block text-xs text-muted">{it.body}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
