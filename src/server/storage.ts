import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { put } from "@vercel/blob";

/**
 * Object storage abstraction for product images. The local driver writes to /public/uploads,
 * which is fine for a single server; the blob driver uploads to Vercel Blob. The driver is
 * picked with STORAGE_DRIVER ("local" | "blob"), defaulting to blob when a Blob token is set.
 */
export interface StorageProvider {
  put(file: { name: string; type: string; data: Buffer }): Promise<{ url: string }>;
}

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

// Admin uploads arrive straight off someone's phone or camera roll — often several MB and far
// larger than they'll ever render on the page. Re-encoding to a capped, compressed WebP here
// (instead of serving the original) is what keeps product pages fast: next/image can only pick
// the right size from what's already on disk, so the disk copy has to be reasonable to start with.
async function normalise(data: Buffer): Promise<{ data: Buffer; ext: string }> {
  const out = await sharp(data, { animated: false })
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  return { data: out, ext: "webp" };
}

function validate(file: { type: string; data: Buffer }) {
  if (!ALLOWED.has(file.type)) throw new Error("Only JPEG, PNG, WebP or AVIF images are allowed.");
  if (file.data.length > 5 * 1024 * 1024) throw new Error("Images must be under 5 MB.");
}

const localDriver: StorageProvider = {
  async put(file) {
    validate(file);
    const { data, ext } = await normalise(file.data);
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const name = `${randomUUID()}.${ext}`;
    await writeFile(path.join(dir, name), data);
    return { url: `/uploads/${name}` };
  },
};

// Vercel's filesystem is read-only at runtime, so deployed uploads go to Vercel Blob instead.
// The SDK reads BLOB_READ_WRITE_TOKEN, which Vercel sets when a Blob store is connected.
const blobDriver: StorageProvider = {
  async put(file) {
    validate(file);
    const { data, ext } = await normalise(file.data);
    const blob = await put(`uploads/${randomUUID()}.${ext}`, data, {
      access: "public",
      contentType: `image/${ext}`,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    return { url: blob.url };
  },
};

export function storage(): StorageProvider {
  const driver = process.env.STORAGE_DRIVER ?? (process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local");
  switch (driver) {
    case "blob":
      return blobDriver;
    default:
      return localDriver;
  }
}
