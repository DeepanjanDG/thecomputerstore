// Downloads brand logos into public/brands/<slug>.svg and writes public/brands/manifest.json
// with the source and licence of each file.
//
//   node scripts/fetch-brand-logos.mjs
//
// Sources, in order of preference:
//   1. Simple Icons (CC0 SVG data; trademarks belong to their owners)
//   2. Wikimedia Commons (only free-licensed / public-domain text logos live on Commons)
// Brands with neither are rendered as a typeset wordmark by <BrandLogo>.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("public/brands");
const UA = "TheComputerStoreSiteBuilder/1.0 (brand asset sourcing; thecomputerstore@live.in)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** brand slug (as in the database) → Simple Icons slug */
const SIMPLE_ICONS = {
  amd: "amd", intel: "intel", nvidia: "nvidia", asus: "asus", msi: "msi", corsair: "corsair", samsung: "samsung",
  seagate: "seagate", nzxt: "nzxt", deepcool: "deepcool", "cooler-master": "coolermaster", razer: "razer",
  hyperx: "hyperx", redragon: "redragon", "tp-link": "tplink", acer: "acer", hp: "hp", dell: "dell",
  lenovo: "lenovo", lg: "lg", epson: "epson",
};

/** brand slug → Wikimedia Commons file title */
const COMMONS = {
  gigabyte: "Gigabyte Technology logo 20080107.svg",
  zotac: "Logo of Zotac International.svg",
  sapphire: "Sapphire wordmark.svg",
  powercolor: "Powercolor 2024 logo.svg",
  "western-digital": "Western Digital logo (2025).svg",
  "lian-li": "Lian Li logo.svg",
  noctua: "Noctua wordmark.svg",
  thermalright: "Thermalright Logo.svg",
  "fractal-design": "Fractal Design logo 2019.svg",
  logitech: "Logitech Logo 2012.svg",
  keychron: "Keychron logo.svg",
  creative: "Creative Technology logo.svg",
  edifier: "Edifier Logo.svg",
  "d-link": "D-Link wordmark.svg",
  hikvision: "Hikvision logo.svg",
  apc: "APC-logo.svg",
  microsoft: "Microsoft logo (2012).svg",
  canon: "Canon wordmark.svg",
  sandisk: "SanDisk 2024 logo.svg",
  brother: "Brother logo.svg",
};

/** Symbol-only logos: the UI shows the brand name next to them. Everything else is a wordmark. */
const SYMBOLS = new Set(["msi", "corsair", "razer", "hyperx", "redragon", "deepcool", "seagate", "tp-link", "dell", "hp", "nvidia", "cooler-master"]);

/**
 * Tight crops (x, y, w, h) measured with getBBox() in a browser — many source files have large
 * empty canvases (Simple Icons are all 24×24) which would make wordmarks render tiny.
 */
const CROP = {
  acer: [0, 9.11, 24, 5.78], amd: [0, 9.14, 24, 5.73], asus: [0, 9.52, 24, 4.96], epson: [0, 9.11, 24, 5.78],
  intel: [0, 7.34, 24, 9.31], lenovo: [0, 8, 24, 8.01], lg: [0, 6.71, 24, 10.58], nzxt: [0, 8.94, 24, 6.13],
  samsung: [0, 10.17, 24, 3.67], hyperx: [0, 5.23, 24, 13.53], nvidia: [0, 4.06, 24, 15.87], redragon: [0, 4.08, 24, 15.85],
  "cooler-master": [0, 2.53, 24, 18.95], edifier: [478.03, 862.51, 2821.29, 596.24], thermalright: [3.9, 2.7, 450.5, 34.9],
  zotac: [3.6, 2, 171.2, 29.8], logitech: [0, 0, 787.89, 130.27], apc: [1.15, 0.3, 385.66, 163.91],
};

/** Per-file fixes so logos work as single-colour masks. */
const FIXES = {};

/** Width/height ratio from the (cropped) viewBox, so the UI can size logos exactly. */
function aspectOf(svg) {
  const m = svg.match(/viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/);
  return m ? +(Number(m[1]) / Number(m[2])).toFixed(3) : 1;
}

function postprocess(slug, svg) {
  let out = FIXES[slug] ? FIXES[slug](svg) : svg;
  const c = CROP[slug];
  if (c) {
    const pad = c[3] * 0.04;
    const vb = `${+(c[0] - pad).toFixed(3)} ${+(c[1] - pad).toFixed(3)} ${+(c[2] + 2 * pad).toFixed(3)} ${+(c[3] + 2 * pad).toFixed(3)}`;
    out = out.replace(/<svg\b[^>]*>/, (tag) => {
      let t = tag.replace(/\s(width|height|viewBox)="[^"]*"/g, "");
      return t.replace(/<svg/, `<svg viewBox="${vb}"`);
    });
  } else {
    // Keep the source viewBox but drop fixed physical sizes (e.g. width="2.65in").
    out = out.replace(/<svg\b[^>]*>/, (tag) => (/viewBox=/.test(tag) ? tag.replace(/\s(width|height)="[^"]*"/g, "") : tag));
  }
  return out;
}

await mkdir(OUT, { recursive: true });
const manifest = {};

for (const [slug, icon] of Object.entries(SIMPLE_ICONS)) {
  const svg = await readFile(path.resolve("node_modules/simple-icons/icons", `${icon}.svg`), "utf8");
  const out = postprocess(slug, svg);
  await writeFile(path.join(OUT, `${slug}.svg`), out);
  manifest[slug] = { file: `/brands/${slug}.svg`, source: `https://simpleicons.org/?q=${icon}`, license: "CC0-1.0 (Simple Icons)", kind: SYMBOLS.has(slug) ? "symbol" : "wordmark", aspect: aspectOf(out) };
}
console.log(`Simple Icons: ${Object.keys(SIMPLE_ICONS).length}`);

for (const [slug, title] of Object.entries(COMMONS)) {
  const api = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent("File:" + title)}&prop=imageinfo&iiprop=url|extmetadata&format=json`;
  try {
    const info = await (await fetch(api, { headers: { "User-Agent": UA } })).json();
    const page = Object.values(info.query.pages)[0];
    const ii = page.imageinfo?.[0];
    if (!ii) throw new Error("not found");
    await sleep(1500);
    const svg = await (await fetch(ii.url, { headers: { "User-Agent": UA } })).text();
    if (!svg.includes("<svg")) throw new Error("not an SVG");
    const out = postprocess(slug, svg);
    await writeFile(path.join(OUT, `${slug}.svg`), out);
    manifest[slug] = {
      aspect: aspectOf(out),
      file: `/brands/${slug}.svg`,
      source: ii.descriptionurl,
      license: ii.extmetadata?.LicenseShortName?.value ?? "see source",
      kind: SYMBOLS.has(slug) ? "symbol" : "wordmark",
    };
    console.log(`Commons ✓ ${slug} (${manifest[slug].license})`);
  } catch (e) {
    console.log(`Commons ✕ ${slug}: ${e.message}`);
  }
  await sleep(2000);
}

await writeFile(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`Wrote ${Object.keys(manifest).length} logos to public/brands`);
