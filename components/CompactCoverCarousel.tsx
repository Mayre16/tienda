"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type CoverSlide = {
  src: string;
  alt: string;
};

type Props = {
  images: CoverSlide[];
  intervalMs?: number;
};

/** Carrusel pequeño de portadas (3:4), para usar junto al título del hero. */
export function CompactCoverCarousel({
  images,
  intervalMs = 4500,
}: Props) {
  const [index, setIndex] = useState(0);
  const n = images.length;

  useEffect(() => {
    if (n <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % n), intervalMs);
    return () => clearInterval(t);
  }, [n, intervalMs]);

  if (n === 0) return null;

  return (
    <div
      className="relative mx-auto aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-xl border-2 border-white/35 bg-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.25)] sm:w-32 lg:mx-0 lg:w-36"
      aria-label="Portadas destacadas"
    >
      {images.map((img, i) => (
        <div
          key={img.src}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
          aria-hidden={i !== index}
        >
          {i === index ? (
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-contain p-1"
              sizes="144px"
              unoptimized
            />
          ) : null}
        </div>
      ))}
      {n > 1 ? (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
          {images.map((img, i) => (
            <span
              key={img.src}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-3 bg-white" : "w-1.5 bg-white/45"
              }`}
              aria-hidden
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
