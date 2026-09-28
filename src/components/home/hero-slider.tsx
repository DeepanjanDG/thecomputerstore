"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeroSlideData {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  linkUrl: string | null;
}

const AUTOPLAY_MS = 6000;

/** Rotating banner: store photos / events / offers, fully admin-managed. */
export function HeroSlider({ slides }: { slides: HeroSlideData[] }) {
  const [index, setIndex] = useState(0);
  const paused = useRef(false);

  const go = useCallback((next: number) => setIndex(((next % slides.length) + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (slides.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (!paused.current) go(index + 1);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [index, go, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className="group relative isolate aspect-[5/4.6] w-full overflow-hidden rounded-[20px] border border-line shadow-lift sm:aspect-[5/4.2] lg:aspect-[5/4.6]"
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
    >
      {slides.map((s, i) => (
        <Slide key={s.id} slide={s} active={i === index} priority={i === 0} />
      ))}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-surface/90 text-ink opacity-0 shadow-lift backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-surface/90 text-ink opacity-0 shadow-lift backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={cn("h-2 rounded-full transition-all", i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/75")}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Slide({ slide, active, priority }: { slide: HeroSlideData; active: boolean; priority: boolean }) {
  const img = (
    <Image
      src={slide.imageUrl}
      alt={slide.title ?? ""}
      fill
      priority={priority}
      sizes="(min-width: 1024px) 50vw, 100vw"
      className="object-cover"
    />
  );
  return (
    <div
      className={cn("absolute inset-0 transition-opacity duration-700 ease-out", active ? "opacity-100" : "pointer-events-none opacity-0")}
      aria-hidden={!active}
    >
      {slide.linkUrl ? <Link href={slide.linkUrl} className="absolute inset-0">{img}</Link> : img}
      {(slide.title || slide.subtitle) && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-6 pb-14 pt-16 text-white">
          {slide.title && <p className="text-xl font-extrabold tracking-tight sm:text-2xl">{slide.title}</p>}
          {slide.subtitle && <p className="mt-1 text-sm text-white/85 sm:text-[15px]">{slide.subtitle}</p>}
        </div>
      )}
    </div>
  );
}
