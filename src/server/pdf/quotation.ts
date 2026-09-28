import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { SITE, fullAddress } from "@/lib/site";
import { formatRs } from "@/lib/format";

export interface QuotationData {
  number: string;
  date: Date;
  validDays: number;
  customer: { name: string; phone?: string | null; email?: string | null; city?: string | null };
  buildName?: string | null;
  buildCode?: string | null;
  compatible: boolean;
  compatibilityNote: string;
  estimatedW?: number | null;
  recommendedW?: number | null;
  items: { slot?: string | null; name: string; model?: string | null; qty: number; unitPrice: number; unitMrp: number; gstRate: number }[];
  requirements?: string | null;
}

const INK = rgb(0.043, 0.051, 0.063);
const MUTED = rgb(0.36, 0.39, 0.45);
const LINE = rgb(0.89, 0.9, 0.93);
const ACCENT = rgb(0.12, 0.37, 1);
const SOFT = rgb(0.965, 0.97, 0.98);
const OK = rgb(0.05, 0.62, 0.43);
const BAD = rgb(0.85, 0.18, 0.13);

const REPLACE: Record<string, string> = { "₹": "Rs. ", "✓": "", "⚠": "!", "✕": "x", "″": "\"", "’": "'", "‘": "'", "“": "\"", "”": "\"", "→": "->", "·": "-" };

function clean(text: string, font: PDFFont) {
  let out = "";
  for (const ch of text) {
    const c = REPLACE[ch] ?? ch;
    try {
      font.encodeText(c);
      out += c;
    } catch {
      out += "?";
    }
  }
  return out;
}

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > width && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export async function renderQuotationPdf(q: QuotationData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Quotation ${q.number} — ${SITE.name}`);
  doc.setAuthor(SITE.name);
  doc.setCreator(SITE.name);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const W = 595.28, H = 841.89, M = 40;
  let page: PDFPage = doc.addPage([W, H]);
  let y = H;

  const text = (s: string, x: number, yy: number, o: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; align?: "left" | "right" } = {}) => {
    const font = o.font ?? regular, size = o.size ?? 9;
    const str = clean(s, font);
    const xx = o.align === "right" ? x - font.widthOfTextAtSize(str, size) : x;
    page.drawText(str, { x: xx, y: yy, size, font, color: o.color ?? INK });
  };

  // ── Header band ──
  page.drawRectangle({ x: 0, y: H - 108, width: W, height: 108, color: INK });
  page.drawRectangle({ x: 0, y: H - 111, width: W, height: 3, color: ACCENT });
  // logo (public/brand/tcs-logo.png), with a drawn mark as fallback if the file is missing
  const logo = await readFile(path.join(process.cwd(), "public", "brand", "tcs-logo.png")).then((b) => doc.embedPng(b)).catch(() => null);
  if (logo) page.drawImage(logo, { x: M, y: H - 84, width: 50, height: 50 });
  else {
    page.drawRectangle({ x: M, y: H - 72, width: 30, height: 30, color: ACCENT });
    page.drawRectangle({ x: M + 8, y: H - 64, width: 14, height: 14, color: INK });
  }
  text("THE COMPUTER STORE", M + (logo ? 62 : 42), H - 55, { size: 16, font: bold, color: rgb(1, 1, 1) });
  text("Custom PCs  |  Components  |  Computers  |  IT Solutions", M + (logo ? 62 : 42), H - 70, { size: 8.5, color: rgb(0.7, 0.75, 0.82) });
  text("QUOTATION", W - M, H - 50, { size: 18, font: bold, color: rgb(1, 1, 1), align: "right" });
  text(q.number, W - M, H - 66, { size: 10, color: rgb(0.62, 0.78, 1), align: "right" });
  const validTill = new Date(q.date.getTime() + q.validDays * 86400000);
  const d = (x: Date) => x.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  text(`Date ${d(q.date)}   |   Valid till ${d(validTill)}`, W - M, H - 82, { size: 8.5, color: rgb(0.7, 0.75, 0.82), align: "right" });

  // ── Parties ──
  y = H - 140;
  text("PREPARED FOR", M, y, { size: 7.5, font: bold, color: MUTED });
  text("FROM", W / 2 + 10, y, { size: 7.5, font: bold, color: MUTED });
  y -= 15;
  text(q.customer.name, M, y, { size: 11, font: bold });
  text(SITE.name, W / 2 + 10, y, { size: 11, font: bold });
  const left = [q.customer.phone, q.customer.email, q.customer.city].filter(Boolean) as string[];
  const right = [`${SITE.address.line1}, ${SITE.address.line2}`, `${SITE.address.city}, ${SITE.address.state} ${SITE.address.pincode}`, `${SITE.phone}  |  ${SITE.email}`];
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    y -= 13;
    if (left[i]) text(left[i], M, y, { color: MUTED });
    if (right[i]) text(right[i], W / 2 + 10, y, { color: MUTED });
  }

  // ── Build summary strip ──
  y -= 26;
  page.drawRectangle({ x: M, y: y - 34, width: W - 2 * M, height: 44, color: SOFT, borderColor: LINE, borderWidth: 0.6 });
  text(q.buildName || "Custom PC configuration", M + 12, y - 6, { size: 11, font: bold });
  text(q.buildCode ? `Build ${q.buildCode}  |  ${SITE.url.replace(/^https?:\/\//, "")}/build/${q.buildCode}` : "Configured on the PC Builder", M + 12, y - 21, { size: 8, color: MUTED });
  const pill = q.compatible ? "ALL PARTS COMPATIBLE" : "NEEDS REVIEW";
  const pw = bold.widthOfTextAtSize(pill, 7.5) + 16;
  page.drawRectangle({ x: W - M - 12 - pw, y: y - 12, width: pw, height: 16, color: q.compatible ? OK : BAD });
  text(pill, W - M - 12 - pw + 8, y - 7, { size: 7.5, font: bold, color: rgb(1, 1, 1) });
  if (q.estimatedW)
    text(`Est. power ${q.estimatedW}W${q.recommendedW ? `  |  Recommended PSU ${q.recommendedW}W+` : ""}`, W - M - 12, y - 25, { size: 8, color: MUTED, align: "right" });
  y -= 58;

  // ── Items table ──
  const cols = [
    { key: "#", w: 18, align: "left" as const },
    { key: "Item", w: 178, align: "left" as const },
    { key: "Qty", w: 26, align: "right" as const },
    { key: "Unit price", w: 66, align: "right" as const },
    { key: "Discount", w: 66, align: "right" as const },
    { key: "GST (incl.)", w: 82, align: "right" as const },
    { key: "Total", w: 70, align: "right" as const },
  ];
  const drawHeader = () => {
    page.drawRectangle({ x: M, y: y - 6, width: W - 2 * M, height: 20, color: INK });
    let x = M + 6;
    for (const c of cols) {
      text(c.key.toUpperCase(), c.align === "right" ? x + c.w - 6 : x, y, { size: 7.5, font: bold, color: rgb(1, 1, 1), align: c.align });
      x += c.w;
    }
    y -= 22;
  };
  drawHeader();

  let mrpTotal = 0, total = 0, gstTotal = 0;
  q.items.forEach((it, i) => {
    const nameLines = wrap(clean(it.name, bold), bold, 8.5, cols[1].w - 8);
    const rowH = 14 + nameLines.length * 10 + (it.slot ? 0 : -10);
    if (y - rowH < 150) {
      page = doc.addPage([W, H]);
      y = H - M;
      drawHeader();
    }
    const lineTotal = it.unitPrice * it.qty;
    const discount = Math.max(0, it.unitMrp - it.unitPrice) * it.qty;
    const gst = (lineTotal * it.gstRate) / (100 + it.gstRate);
    mrpTotal += Math.max(it.unitMrp, it.unitPrice) * it.qty;
    total += lineTotal;
    gstTotal += gst;
    if (i % 2 === 1) page.drawRectangle({ x: M, y: y - rowH + 10, width: W - 2 * M, height: rowH, color: SOFT });
    let x = M + 6;
    text(String(i + 1), x, y, { color: MUTED });
    x += cols[0].w;
    let yy = y;
    if (it.slot) { text(it.slot.toUpperCase(), x, yy, { size: 6.5, font: bold, color: ACCENT }); yy -= 10; }
    for (const l of nameLines) { text(l, x, yy, { size: 8.5, font: bold }); yy -= 10; }
    x += cols[1].w;
    const vals = [String(it.qty), formatRs(it.unitPrice), discount ? `-${formatRs(discount)}` : "-", `${formatRs(gst)} (${it.gstRate}%)`, formatRs(lineTotal)];
    vals.forEach((v, j) => {
      const c = cols[j + 2];
      text(v, x + c.w - 6, y, { size: j === 3 ? 7 : 8.5, color: j === 2 && discount ? OK : j === 4 ? INK : MUTED, font: j === 4 ? bold : regular, align: "right" });
      x += c.w;
    });
    y -= rowH;
  });
  page.drawLine({ start: { x: M, y: y + 6 }, end: { x: W - M, y: y + 6 }, thickness: 0.6, color: LINE });

  // ── Totals ──
  if (y < 260) { page = doc.addPage([W, H]); y = H - M; }
  y -= 12;
  const totalsTop = y;
  const tx = W - M - 220;
  const rowT = (label: string, value: string, o: { bold?: boolean; color?: ReturnType<typeof rgb> } = {}) => {
    text(label, tx, y, { color: MUTED, font: o.bold ? bold : regular, size: o.bold ? 10 : 9 });
    text(value, W - M - 6, y, { font: o.bold ? bold : regular, size: o.bold ? 12 : 9, color: o.color ?? INK, align: "right" });
    y -= o.bold ? 22 : 15;
  };
  rowT("MRP total", formatRs(mrpTotal));
  rowT("Discount", `-${formatRs(mrpTotal - total)}`, { color: OK });
  rowT("Taxable value", formatRs(total - gstTotal));
  rowT("GST (included)", formatRs(gstTotal));
  y -= 8;
  page.drawRectangle({ x: tx - 8, y: y - 8, width: W - M - tx + 8, height: 26, color: INK });
  text("GRAND TOTAL", tx, y, { font: bold, size: 9.5, color: rgb(1, 1, 1) });
  text(formatRs(total), W - M - 6, y, { font: bold, size: 12.5, color: rgb(1, 1, 1), align: "right" });

  // ── Notes (left of totals) ──
  let ny = totalsTop;
  const noteW = tx - M - 30;
  text("COMPATIBILITY", M, ny, { size: 7.5, font: bold, color: MUTED });
  ny -= 12;
  for (const l of wrap(clean(q.compatibilityNote, regular), regular, 8.5, noteW)) { text(l, M, ny, { size: 8.5, color: q.compatible ? OK : BAD }); ny -= 11; }
  if (q.requirements) {
    ny -= 6;
    text("CUSTOMER REQUIREMENTS", M, ny, { size: 7.5, font: bold, color: MUTED });
    ny -= 12;
    for (const l of wrap(clean(q.requirements, regular), regular, 8.5, noteW).slice(0, 5)) { text(l, M, ny, { size: 8.5, color: MUTED }); ny -= 11; }
  }
  y = Math.min(y - 30, ny - 14);

  // ── Warranty & terms ──
  const terms = [
    "Prices are inclusive of GST and valid until the date above, subject to stock availability.",
    "Custom PCs are assembled, cable-managed and stress-tested at our Shillong store at no extra charge.",
    "Components carry the manufacturer's warranty shown on the product page; we handle warranty claims for products bought from us.",
    "Software licences and opened consumables are non-returnable. Final configuration is confirmed on order.",
    "An order is confirmed on advance payment. Tax invoice is issued at the time of billing.",
  ];
  if (y < 150) { page = doc.addPage([W, H]); y = H - M; }
  text("WARRANTY & TERMS", M, y, { size: 7.5, font: bold, color: MUTED });
  y -= 13;
  for (const t of terms) {
    for (const [i, l] of wrap(t, regular, 8, W - 2 * M - 12).entries()) {
      if (i === 0) text("-", M, y, { size: 8, color: ACCENT });
      text(l, M + 10, y, { size: 8, color: MUTED });
      y -= 11;
    }
  }

  // ── Footer on every page ──
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    page = p;
    p.drawLine({ start: { x: M, y: 44 }, end: { x: W - M, y: 44 }, thickness: 0.6, color: LINE });
    text(`${SITE.name}  |  ${fullAddress}`, M, 30, { size: 7.5, color: MUTED });
    text(`${SITE.phone}  |  WhatsApp +${SITE.whatsapp}  |  ${SITE.email}`, M, 19, { size: 7.5, color: MUTED });
    text(`Page ${i + 1} of ${pages.length}`, W - M, 30, { size: 7.5, color: MUTED, align: "right" });
    text("This is a computer-generated quotation.", W - M, 19, { size: 7, color: MUTED, align: "right" });
  });

  return doc.save();
}
