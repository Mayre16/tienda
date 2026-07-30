"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
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

export function EditorialWelcomeHero() {
  const welcome = useEditorialWelcome();
  const heroImages = useEditorialHeroImages();
  const printedBooks = useEditorialPrintedBooks();
  const edit = useEditorialCmsEdit();
  const taglineItems = welcome.tagline
    .split("·")
    .map((item) => item.trim())
    .filter(Boolean);

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
      className="editorial-welcome relative overflow-hidden border-b border-na-editorial/10 bg-white"
      aria-labelledby="editorial-welcome-title"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(234,118,4,0.07),transparent_45%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_100%,rgba(255,201,13,0.1),transparent_40%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-6 right-[10%] hidden text-[7rem] font-black leading-none text-na-editorial/[0.05] sm:block"
        aria-hidden
      >
        Φ
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-12">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10">
          <div className="relative">
            {edit?.ready ? (
              <EditorialEditPencil
                label="Editar textos de bienvenida"
                onClick={() => edit.setSelectedId("welcome")}
                className="right-0 top-0"
              />
            ) : null}
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.32em] text-na-editorial">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Editorial · Librería
            </p>
            <h1
              id="editorial-welcome-title"
              className="mt-4 text-balance text-3xl font-black leading-tight text-na-ink sm:text-4xl lg:text-[2.65rem]"
            >
              {welcome.title}
            </h1>
            <h2 className="mt-5 max-w-xl text-base leading-relaxed text-na-muted sm:text-lg">
              {welcome.lede}
            </h2>

            <ul className="mt-6 flex flex-wrap gap-2">
              {taglineItems.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-na-editorial/20 bg-na-editorial/[0.06] px-3.5 py-1.5 text-xs font-bold tracking-wide text-na-editorialDark"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
            {edit?.ready ? (
              <EditorialEditPencil
                label="Editar fotos del carrusel"
                onClick={() => edit.setSelectedId("heroImages")}
              />
            ) : null}
            <div className="rounded-[1.75rem] border border-na-editorial/12 bg-white p-5 shadow-[0_20px_50px_rgba(234,118,4,0.08)] sm:p-6">
              <EditorialHeroProductCarousel slides={productSlides} theme="light" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
