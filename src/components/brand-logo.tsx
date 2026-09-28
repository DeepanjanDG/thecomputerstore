import { slugify } from "@/lib/search-text";
import { brandLogo } from "@/lib/brand-logos";
import { LogoMark } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

export { hasBrandLogo } from "@/lib/brand-logos";

/**
 * Brand logo rendered as a single-colour mask (inherits `currentColor`), so every logo sits
 * consistently in light, dark and "stage" sections. Symbol-only logos get the name beside them;
 * brands without a logo fall back to a typeset wordmark.
 */
export function BrandLogo({ name, className, height = 16, showName }: { name: string; className?: string; height?: number; showName?: boolean }) {
  const slug = slugify(name);
  if (slug === "the-computer-store")
    return (
      <span className={cn("inline-flex items-center gap-1.5 font-bold", className)} style={{ fontSize: height * 0.75 }}>
        <LogoMark className="h-[1.4em] w-[1.4em]" /> TCS
      </span>
    );
  const logo = brandLogo(name);
  if (!logo)
    return (
      <span className={cn("inline-block font-extrabold uppercase leading-none tracking-[0.06em]", className)} style={{ fontSize: height * 0.72 }}>
        {name}
      </span>
    );
  const mask = `url(${logo.file}) left center / contain no-repeat`;
  // Very wide wordmarks are scaled down so they occupy a similar visual area to compact ones.
  const aspect = logo.aspect || 1;
  const h = aspect > 6 ? height * Math.sqrt(6 / aspect) : height;
  return (
    <span className={cn("inline-flex max-w-full items-center gap-1.5 align-middle", className)} role="img" aria-label={name} title={name}>
      <span
        aria-hidden
        className="block shrink-0 bg-current"
        style={{
          height: h,
          width: h * aspect,
          maxWidth: "100%",
          WebkitMask: mask,
          mask,
        }}
      />
      {(showName ?? logo.kind === "symbol") && (
        <span aria-hidden className="truncate font-bold leading-none" style={{ fontSize: height * 0.72 }}>
          {name}
        </span>
      )}
    </span>
  );
}
