"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { HeroProductSlide } from "@/lib/editorial-hero-products";
import { navigateEditorialHash } from "@/lib/editorial-navigation";

type Props = {
  slides: HeroProductSlide[];
  intervalMs?: number;
  theme?: "dark" | "light";
};

/** Carrusel compacto de productos por categoría (hero editorial). */
export function EditorialHeroProductCarousel({
  slides,
  intervalMs = 4200,
  theme = "dark",
}: Props) {
  const isLight = theme === "light";
  const [index, setIndex] = useState(0);
  const n = slides.length;
  const slide = slides[index];

  useEffect(() => {
    if (n <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % n), intervalMs);
    return () => clearInterval(t);
  }, [n, intervalMs]);

  const goTo = useCallback(
    (i: number) => setIndex(((i % n) + n) % n),
    [n],
  );

  if (n === 0 || !slide) return null;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => navigateEditorialHash(slide.catalogHash)}
        className="group relative mx-auto block w-full max-w-[17rem] text-left sm:max-w-[18.5rem]"
        aria-label={`Ver ${slide.category}: ${slide.title}`}
      >
        <div
          className={`relative aspect-[4/5] overflow-hidden rounded-2xl border-2 bg-white ${
            isLight
              ? "border-na-editorial/15 shadow-[0_16px_48px_rgba(234,118,4,0.1)]"
              : "border-white/30 shadow-[0_16px_48px_rgba(0,0,0,0.22)]"
          }`}
        >
          {slides.map((item, i) => {
            const visible =
              i === index || (n > 1 && i === (index + 1) % n);
            return (
            <div
              key={item.id}
              className="absolute inset-0 transition-opacity duration-700 ease-in-out"
              style={{ opacity: i === index ? 1 : 0 }}
              aria-hidden={i !== index}
            >
              {visible ? (
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className={
                    item.contain
                      ? "object-contain p-4"
                      : "object-cover object-center"
                  }
                  sizes="(max-width: 640px) 272px, 296px"
                  unoptimized
                  priority={i === index}
                  loading={i === index ? "eager" : "lazy"}
                />
              ) : null}
            </div>
          )})}

          <span className="absolute left-3 top-3 rounded-full bg-na-editorial px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
            {slide.category}
          </span>
        </div>

        <p
          className={`mt-3 line-clamp-2 text-center text-sm font-bold leading-snug transition ${
            isLight
              ? "text-na-ink group-hover:text-na-editorial"
              : "text-white group-hover:text-na-helios"
          }`}
        >
          {slide.title}
        </p>
        <p
          className={`mt-1 text-center text-[11px] font-semibold opacity-0 transition group-hover:opacity-100 ${
            isLight ? "text-na-muted" : "text-white/70"
          }`}
        >
          Ver en catálogo →
        </p>
      </button>

      {n > 1 ? (
        <div
          className="mt-4 flex items-center justify-center gap-2"
          role="tablist"
          aria-label="Productos destacados"
        >
          {slides.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`${item.category}: ${item.title}`}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === index
                  ? isLight
                    ? "w-6 bg-na-editorial"
                    : "w-6 bg-na-helios"
                  : isLight
                    ? "w-2 bg-na-editorial/25 hover:bg-na-editorial/45"
                    : "w-2 bg-white/40 hover:bg-white/65"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
