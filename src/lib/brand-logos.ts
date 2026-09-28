import manifest from "../../public/brands/manifest.json";
import { slugify } from "./search-text";

/** Brand logos downloaded by scripts/fetch-brand-logos.mjs (see public/brands/manifest.json). */
export type BrandLogoEntry = { file: string; kind: "symbol" | "wordmark"; aspect: number; source: string; license: string };

const LOGOS = manifest as Record<string, BrandLogoEntry>;

export const brandLogo = (name: string): BrandLogoEntry | undefined => LOGOS[slugify(name)];
export const hasBrandLogo = (name: string) => !!brandLogo(name);
