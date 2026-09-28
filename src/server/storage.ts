import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";

/**
 * Object storage abstraction for product images. The local driver writes to /public/uploads,
 * which is fine for a single server. For production, implement the same interface with S3 /
 * Cloudflare R2 / GCS and select it with STORAGE_DRIVER.
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

const localDriver: StorageProvider = {
  async put(file) {
    if (!ALLOWED.has(file.type)) throw new Error("Only JPEG, PNG, WebP or AVIF images are allowed.");
    if (file.data.length > 5 * 1024 * 1024) throw new Error("Images must be under 5 MB.");
    const { data, ext } = await normalise(file.data);
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const name = `${randomUUID()}.${ext}`;
    await writeFile(path.join(dir, name), data);
    return { url: `/uploads/${name}` };
  },
};

export function storage(): StorageProvider {
  switch (process.env.STORAGE_DRIVER ?? "local") {
    default:
      return localDriver;
  }
}
