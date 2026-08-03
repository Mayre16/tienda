"use client";

import { useMemo } from "react";
import Image from "next/image";
import { EditorialHeroProductCarousel } from "@/components/EditorialHeroProductCarousel";
import {
  cmsPrintedBookToStoreBook,
  resolveStoreBookCover,
} from "@/lib/bookstore";
import { useEditorialWelcome } from "@/lib/cms/hooks";
import {
  useEditorialHeroImages,
  useEditorialPrintedBooks,
} from "@/lib/cms/hooks";
import { EditorialEditPencil } from "@/components/cms/CmsEditFields";
import { useEditorialCmsEdit } from "@/components/cms/EditorialCmsEditContext";
import {
  buildBookHeroSlide,
  mergeHeroProductSlides,
  type HeroProductSlide,
} from "@/lib/editorial-hero-products";
import { preferWebpAssetUrl } from "@/lib/media-assets";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";

const FALLBACK_HERO_BG = {
  src: "/img/hero/libreria-bazar.webp",
  alt: "Librería Editorial Logos — libros, separadores, camisetas y artículos de regalo",
  objectPosition: "50% 45%",
};

function resolveHeroSrc(src: string): string {
  if (!src) return FALLBACK_HERO_BG.src;
  const resolved = resolveCmsMediaUrl(src) ?? src;
  return preferWebpAssetUrl(resolved);
}

export function EditorialWelcomeHero() {
  const welcome = useEditorialWelcome();
  const heroImages = useEditorialHeroImages();
  const printedBooks = useEditorialPrintedBooks();
  const edit = useEditorialCmsEdit();
  const taglineItems = welcome.tagline
    .split("·")
    .map((item) => item.trim())
    .filter(Boolean);

  const bgImage = useMemo(() => {
    const libreria = heroImages.find((h) =>
      h.src.includes("libreria-bazar"),
    );
    const pick = libreria ?? heroImages[0];
    if (!pick?.src) return FALLBACK_HERO_BG;
    return {
      src: resolveHeroSrc(pick.src),
      alt: pick.alt || FALLBACK_HERO_BG.alt,
      objectPosition: pick.objectPosition || FALLBACK_HERO_BG.objectPosition,
    };
  }, [heroImages]);

  const heroFallbackSrc = heroImages[0]?.src ?? "";

  const bookSlide = useMemo((): HeroProductSlide | null => {
    for (const cms of printedBooks) {
      const book = cmsPrintedBookToStoreBook(cms);
      const src = resolveStoreBookCover(book);
      if (!src) continue;
      return buildBookHeroSlide({
        src,
        alt: `Portada: ${book.title}`,
        title: book.title,
      });
    }
    if (!heroFallbackSrc) return null;
    return buildBookHeroSlide({
      src: heroFallbackSrc,
      alt: heroImages[0]?.alt ?? "Libros de filosofía y cultura",
      title: "Libros de filosofía y cultura",
    });
  }, [printedBooks, heroFallbackSrc, heroImages]);

  const productSlides = useMemo(
    () => mergeHeroProductSlides(bookSlide),
    [bookSlide],
  );

  return (
    <section
      className="editorial-welcome relative overflow-hidden border-b border-na-editorial/10"
      aria-labelledby="editorial-welcome-title"
    >
      <div className="absolute inset-0" aria-hidden>
        <Image
          src={bgImage.src}
          alt=""
          fill
          priority
          fetchPriority="high"
          className="object-cover"
          style={{ objectPosition: bgImage.objectPosition }}
          sizes="100vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-6 sm:pb-16 sm:pt-14">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10">
          <div className="relative">
            {edit?.ready ? (
              <EditorialEditPencil
                label="Editar textos de bienvenida"
                onClick={() => edit.setSelectedId("welcome")}
                className="right-0 top-0"
              />
            ) : null}
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-white/85">
              Editorial · Librería
            </p>
            <h1
              id="editorial-welcome-title"
              className="mt-4 text-balance text-3xl font-black leading-tight text-white sm:text-4xl lg:text-[2.65rem]"
            >
              {welcome.title}
            </h1>
            <h2 className="mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
              {welcome.lede}
            </h2>

            <ul className="mt-6 flex flex-wrap gap-2">
              {taglineItems.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-bold tracking-wide text-white backdrop-blur-sm"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
            {edit?.ready ? (
              <EditorialEditPencil
                label="Editar fotos del carrusel / fondo"
                onClick={() => edit.setSelectedId("heroImages")}
              />
            ) : null}
            <div className="rounded-[1.75rem] border border-white/25 bg-white/95 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:p-6">
              <EditorialHeroProductCarousel
                slides={productSlides}
                theme="light"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
