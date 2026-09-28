// Downloads official product images into public/products/<sku>.webp and writes
// public/products/manifest.json ({ sku: { file, width, height, bg, source, page } }).
//
//   node scripts/fetch-product-images.mjs            # fetch missing images
//   node scripts/fetch-product-images.mjs --force    # re-fetch everything
//   node scripts/fetch-product-images.mjs CPU-R7-7800X3D GPU-MSI-5070-12G   # only these SKUs
//
// Sources live in prisma/seed/image-sources.json:
//   { "SKU": { "page": "<manufacturer product page>" } }                 → uses the page's og:image / JSON-LD image
//   { "SKU": { "image": "<direct image URL>", "page": "<source page>" } } → for sites that block page requests
// Images are the manufacturers' own product photos, used by the store as a reseller — confirm usage
// rights with your distributors before launch.
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = path.resolve("public/products");
const SOURCES = JSON.parse(await readFile(path.resolve("prisma/seed/image-sources.json"), "utf8"));
const MANIFEST_PATH = path.join(OUT, "manifest.json");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const HEADERS = { "User-Agent": UA, "Accept-Language": "en-IN,en;q=0.9" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.filter((a) => !a.startsWith("--"));

await mkdir(OUT, { recursive: true });
let manifest = {};
try {
  manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
} catch {}

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#x2F;/g, "/").replace(/&quot;/g, '"');

/** Finds the main product image on a page: og:image, twitter:image, or JSON-LD Product.image. */
function findImage(html, base) {
  const metas = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
  ];
  for (const re of metas) {
    const m = html.match(re);
    if (m) return new URL(decode(m[1]), base).href;
  }
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(m[1]);
      for (const node of [data, ...(data["@graph"] ?? [])].flat()) {
        if (node?.["@type"] === "Product" && node.image) {
          const img = Array.isArray(node.image) ? node.image[0] : node.image;
          return new URL(typeof img === "string" ? img : img.url, base).href;
        }
      }
    } catch {}
  }
  return null;
}

/** Normalises to WebP (max 1200px) and samples the corner colour so the UI can extend the image's background. */
async function normalise(buf) {
  const base = sharp(buf, { animated: false }).rotate().flatten({ background: "#ffffff" });
  const { width = 0, height = 0 } = await base.metadata();
  if (width < 200 || height < 150) throw new Error(`image too small (${width}×${height})`);
  const out = await base.resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  const corner = await sharp(out.data).extract({ left: 2, top: 2, width: 8, height: 8 }).removeAlpha().raw().toBuffer();
  const avg = [0, 1, 2].map((c) => Math.round(Array.from({ length: 64 }, (_, i) => corner[i * 3 + c]).reduce((a, b) => a + b, 0) / 64));
  return { data: out.data, width: out.info.width, height: out.info.height, bg: "#" + avg.map((v) => v.toString(16).padStart(2, "0")).join("") };
}

let ok = 0, skipped = 0;
const failed = [];
for (const [sku, src] of Object.entries(SOURCES)) {
  if (only.length && !only.includes(sku)) continue;
  if (!force && manifest[sku]) {
    try {
      await stat(path.join(OUT, path.basename(manifest[sku].file)));
      skipped++;
      continue;
    } catch {}
  }
  try {
    let imageUrl = src.image ?? null;
    if (!imageUrl) {
      const res = await fetch(src.page, { headers: { ...HEADERS, Accept: "text/html" }, redirect: "follow" });
      if (!res.ok) throw new Error(`page HTTP ${res.status}`);
      imageUrl = findImage(await res.text(), res.url);
      if (!imageUrl) throw new Error("no product image found on page");
    }
    const img = await fetch(imageUrl, {
      headers: { ...HEADERS, Accept: "image/jpeg,image/png;q=0.9,image/webp;q=0.5,*/*;q=0.3", Referer: src.page ?? imageUrl },
    });
    if (!img.ok) throw new Error(`image HTTP ${img.status}`);
    const type = (img.headers.get("content-type") ?? "").split(";")[0].trim();
    if (type && !type.startsWith("image/") && type !== "application/octet-stream" && type !== "binary/octet-stream")
      throw new Error(`not an image (${type})`);
    const n = await normalise(Buffer.from(await img.arrayBuffer()));
    const file = `${sku.toLowerCase()}.webp`;
    await writeFile(path.join(OUT, file), n.data);
    manifest[sku] = { file: `/products/${file}`, width: n.width, height: n.height, bg: n.bg, source: imageUrl, page: src.page ?? null };
    ok++;
    console.log(`✓ ${sku}  ${n.width}×${n.height}  bg ${n.bg}  ${(n.data.length / 1024).toFixed(0)} KB`);
  } catch (e) {
    failed.push(sku);
    console.log(`✕ ${sku}  ${e.message}`);
  }
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  await sleep(800);
}
console.log(`\n${ok} downloaded, ${skipped} already present, ${failed.length} failed${failed.length ? ": " + failed.join(" ") : ""}`);
