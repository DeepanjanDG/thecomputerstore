import { SITE } from "./site";
import { formatINR } from "./format";
import { SLOT_META, STEP_ORDER } from "./compat/slots";
import type { BuildItems, BuildReport } from "./compat/types";

export function waLink(message: string) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** WhatsApp message describing a build: name, components, total and compatibility. */
export function buildWhatsAppMessage(opts: {
  name: string;
  items: BuildItems;
  total: number;
  report: Pick<BuildReport, "status" | "errors" | "warnings" | "power">;
  url?: string | null;
  intro?: string;
}) {
  const lines = STEP_ORDER.filter((s) => opts.items[s]).map((s) => {
    const l = opts.items[s]!;
    return `• ${SLOT_META[s].short}: ${l.product.name}${l.qty > 1 ? ` ×${l.qty}` : ""} — ${formatINR(l.product.price * l.qty)}`;
  });
  const status =
    opts.report.status === "compatible" ? "✅ All parts compatible"
    : opts.report.status === "warning" ? `⚠️ ${opts.report.warnings.length} compatibility warning(s)`
    : opts.report.status === "incompatible" ? `❌ ${opts.report.errors.length} compatibility issue(s)`
    : "";
  return [
    opts.intro ?? "Hi The Computer Store! I'd like to discuss this build:",
    "",
    `*${opts.name}*`,
    ...lines,
    "",
    `*Total: ${formatINR(opts.total)}*`,
    status,
    opts.report.power.estimatedW ? `Est. power: ${opts.report.power.estimatedW}W (PSU ${opts.report.power.recommendedW}W+ recommended)` : "",
    opts.url ? `\nBuild link: ${opts.url}` : "",
  ].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");
}
