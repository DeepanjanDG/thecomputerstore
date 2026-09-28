// Syncs public/products/manifest.json (written by fetch-product-images.mjs) into the
// ProductImage table, without touching anything else in the database — safe to re-run any
// time after fetching new images, even against a live store with real orders/users.
//
//   node scripts/sync-product-images.mjs
//
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const manifestPath = path.resolve("public/products/manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

let created = 0, skipped = 0, missing = 0;
for (const [sku, v] of Object.entries(manifest)) {
  const product = await prisma.product.findUnique({ where: { sku }, select: { id: true, name: true } });
  if (!product) {
    console.log(`? ${sku}  no matching product in DB`);
    missing++;
    continue;
  }
  const existing = await prisma.productImage.findFirst({ where: { productId: product.id, url: v.file } });
  if (existing) {
    skipped++;
    continue;
  }
  await prisma.productImage.deleteMany({ where: { productId: product.id, url: { startsWith: "/products/" } } });
  await prisma.productImage.create({ data: { productId: product.id, url: v.file, alt: product.name, sortOrder: -1 } });
  console.log(`✓ ${sku}  → ${v.file}`);
  created++;
}

console.log(`\n${created} images linked, ${skipped} already linked, ${missing} SKUs not found in DB.`);
await prisma.$disconnect();
