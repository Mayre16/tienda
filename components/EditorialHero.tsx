"use client";

import { useMemo } from "react";
import { CompactCoverCarousel } from "@/components/CompactCoverCarousel";
import {
  useEditorialHeroImages,
  useEditorialPrintedBooks,
} from "@/lib/cms/hooks";
import {
  cmsPrintedBookToStoreBook,
  resolveStoreBookCover,
} from "@/lib/bookstore";

type EditorialHeroProps = {
  title?: string;
  lede?: string;
};

export function EditorialHero({
  title = "Librería Editorial Logos",
  lede = "Tienda de libros, publicaciones y artículos de Nueva Acrópolis. Filosofía, cultura y desarrollo humano para llevar a casa.",
}: EditorialHeroProps) {
  const heroImages = useEditorialHeroImages();
  const printedBooks = useEditorialPrintedBooks();

  const carouselImages = useMemo(() => {
    const bookCovers = printedBooks
      .map((cms) => {
        const b = cmsPrintedBookToStoreBook(cms);
        return { b, src: resolveStoreBookCover(b) };
      })
      .filter((x) => x.src)
      .slice(0, 6)
      .map(({ b, src }) => ({
        src,
        alt: `Portada: ${b.title}`,
      }));
    if (bookCovers.length >= 2) return bookCovers;
    return heroImages.map((img) => ({
      src: img.src,
      alt: img.alt,
    }));
  }, [printedBooks, heroImages]);

  return (
    <section className="relative overflow-hidden rounded-b-[1.75rem] bg-gradient-to-br from-na-editorialDark via-na-editorial to-na-heket">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(255,201,13,0.22),transparent_48%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_92%,rgba(8,99,87,0.35),transparent_42%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        aria-hidden
        style={{
          backgroundImage:
            "repeating-linear-gradient(-12deg, #fff 0 1px, transparent 1px 48px)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mt-0 flex flex-col items-center gap-8 lg:mt-0 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="min-w-0 text-center lg:text-left">
            <h1 className="max-w-3xl text-balance text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <h2 className="mt-4 max-w-2xl text-balance text-lg text-white/92 sm:text-xl">
              {lede}
            </h2>
          </div>

          <CompactCoverCarousel images={carouselImages} />
        </div>
      </div>
    </section>
  );
}
