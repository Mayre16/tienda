"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import {
  bookToCartItem,
  formatCartMoney,
  regaloToCartItem,
} from "@/lib/cart";
import {
  cmsPrintedBookToStoreBook,
  resolveStoreBookCover,
} from "@/lib/bookstore";
import { findCmsPrintedBook } from "@/lib/bookstore-merge";
import {
  useEditorialPrintedBooks,
  useEditorialRegalos,
} from "@/lib/cms/hooks";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { preferWebpAssetUrl } from "@/lib/media-assets";
import { assetUrl } from "@/lib/asset-url";
import {
  buildBestsellersShelf,
  buildNovedadesShelf,
  type HomeShelfItem,
} from "@/lib/editorial-home-shelves";
import { shareStoreBook } from "@/lib/book-share";
import { shareRegaloItem } from "@/lib/regalo-share";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { RegaloDetailDialog } from "@/components/RegaloDetailDialog";
import { EDITORIAL_PATHS } from "@/lib/editorial-navigation";
import type { RegaloItem } from "@/lib/editorial-extras";
import type { StoreBook } from "@/lib/bookstore";

function resolveRegaloImage(url: string): string {
  if (!url) return url;
  const resolved = resolveCmsMediaUrl(url) ?? url;
  if (resolved.startsWith("http") || resolved.startsWith("data:")) {
    return preferWebpAssetUrl(resolved);
  }
  return preferWebpAssetUrl(assetUrl(resolved));
}

function ShelfCard({
  entry,
  onOpenRegalo,
  onOpenBook,
}: {
  entry: HomeShelfItem;
  onOpenRegalo: (item: RegaloItem) => void;
  onOpenBook: (book: StoreBook) => void;
}) {
  if (entry.kind === "regalo") {
    const item = entry.item;
    const img = resolveRegaloImage(item.imageUrl);
    const title = item.title.replace(/^Separador · /, "");
    return (
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-na-editorial/10 bg-white shadow-na-soft transition hover:-translate-y-0.5 hover:shadow-na-card">
        <button
          type="button"
          onClick={() => onOpenRegalo(item)}
          className="relative aspect-[4/5] w-full bg-neutral-50 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-na-editorial"
        >
          {img ? (
            <Image
              src={img}
              alt=""
              fill
              className="object-contain p-2"
              sizes="(max-width: 640px) 45vw, 180px"
              unoptimized
            />
          ) : null}
          {item.sample ? (
            <span className="absolute left-2 top-2 rounded-full bg-na-editorial/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Ejemplo
            </span>
          ) : null}
        </button>
        <div className="flex flex-1 flex-col p-3">
          <button
            type="button"
            onClick={() => onOpenRegalo(item)}
            className="text-left"
          >
            <p className="line-clamp-2 text-xs font-bold leading-snug text-na-ink">
              {title}
            </p>
            {item.price != null && item.price > 0 ? (
              <p className="mt-1 text-[11px] font-semibold text-na-editorialDark">
                {formatCartMoney(item.price, item.currency ?? "DOP")}
              </p>
            ) : null}
          </button>
          <div className="mt-auto flex items-center justify-end gap-1.5 pt-2">
            <AddToCartButton
              item={regaloToCartItem(item)}
              iconOnly
              hideWhenUnavailable
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-na-editorial text-white transition hover:bg-na-editorialDark"
            />
            <button
              type="button"
              onClick={() => void shareRegaloItem(item)}
              aria-label={`Compartir ${item.title}`}
              title="Compartir"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-na-editorial/25 bg-white text-na-editorial transition hover:bg-na-editorial/5"
            >
              <Share2 className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        </div>
      </article>
    );
  }

  const book = entry.book;
  const cover = resolveStoreBookCover(book);
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-na-editorial/10 bg-white shadow-na-soft transition hover:-translate-y-0.5 hover:shadow-na-card">
      <button
        type="button"
        onClick={() => onOpenBook(book)}
        className="relative aspect-[3/4] w-full bg-white text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-na-editorial"
      >
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            className="object-contain p-2"
            sizes="(max-width: 640px) 45vw, 180px"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] text-na-muted">
            Sin portada
          </div>
        )}
        {book.stock <= 0 ? (
          <span className="absolute left-2 top-2 rounded-full bg-na-editorial px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow-md">
            Agotado
          </span>
        ) : null}
      </button>
      <div className="flex flex-1 flex-col p-3">
        <button type="button" onClick={() => onOpenBook(book)} className="text-left">
          <p className="line-clamp-2 text-xs font-bold leading-snug text-na-ink">
            {book.title}
          </p>
          {book.author ? (
            <p className="mt-0.5 line-clamp-1 text-[11px] text-na-muted">
              {book.author}
            </p>
          ) : null}
          {book.price != null && book.price > 0 ? (
            <p className="mt-1 text-[11px] font-semibold text-na-editorialDark">
              {formatCartMoney(book.price, book.currency || "DOP")}
            </p>
          ) : null}
        </button>
        <div className="mt-auto flex items-center justify-end gap-1.5 pt-2">
          <AddToCartButton
            item={bookToCartItem(book)}
            iconOnly
            hideWhenUnavailable
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-na-editorial text-white transition hover:bg-na-editorialDark"
          />
          <button
            type="button"
            onClick={() => void shareStoreBook(book)}
            aria-label={`Compartir ${book.title}`}
            title="Compartir"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-na-editorial/25 bg-white text-na-editorial transition hover:bg-na-editorial/5"
          >
            <Share2 className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}

function ShelfSection({
  id,
  eyebrow,
  title,
  lede,
  href,
  linkLabel,
  items,
  onOpenRegalo,
  onOpenBook,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lede: string;
  href: string;
  linkLabel: string;
  items: HomeShelfItem[];
  onOpenRegalo: (item: RegaloItem) => void;
  onOpenBook: (book: StoreBook) => void;
}) {
  const scrollerRef = useRef<HTMLUListElement>(null);

  if (items.length === 0) return null;

  function scrollByCards(direction: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card
      ? card.getBoundingClientRect().width + 12
      : Math.min(el.clientWidth * 0.8, 220);
    el.scrollBy({ left: direction * step * 2, behavior: "smooth" });
  }

  return (
    <section
      id={id}
      className="scroll-mt-[var(--editorial-header-offset,7rem)]"
      aria-labelledby={`${id}-title`}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-editorialDark">
            {eyebrow}
          </p>
          <h2
            id={`${id}-title`}
            className="mt-2 text-balance text-2xl font-black text-na-ink sm:text-3xl"
          >
            {title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-na-muted">{lede}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              aria-label="Anterior"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-na-editorial/25 bg-white text-na-editorial transition hover:bg-na-editorial/5"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              aria-label="Siguiente"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-na-editorial/25 bg-white text-na-editorial transition hover:bg-na-editorial/5"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-sm font-bold text-na-editorialDark transition hover:gap-2"
          >
            {linkLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>

      <ul
        ref={scrollerRef}
        className="-mx-4 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scroll-smooth sm:-mx-6 sm:gap-4 sm:px-6 [scrollbar-width:thin]"
      >
        {items.map((entry) => (
          <li
            key={
              entry.kind === "book"
                ? `book-${entry.book.id}`
                : `regalo-${entry.item.id}`
            }
            className="w-[42%] max-w-[11.5rem] shrink-0 snap-start sm:w-[30%] sm:max-w-[13rem] md:w-[22%] md:max-w-[14rem]"
          >
            <ShelfCard
              entry={entry}
              onOpenRegalo={onOpenRegalo}
              onOpenBook={onOpenBook}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function EditorialHomeProductShelves() {
  const router = useRouter();
  const printedCms = useEditorialPrintedBooks();
  const regalos = useEditorialRegalos();
  const [regaloDetail, setRegaloDetail] = useState<RegaloItem | null>(null);

  const books = useMemo(
    () =>
      printedCms
        .filter((b) => !b.hidden && b.title?.trim())
        .map((b) => cmsPrintedBookToStoreBook(b)),
    [printedCms],
  );

  const cmsIdByBookId = useMemo(() => {
    const map = new Map<number, string>();
    for (const book of books) {
      const cms = findCmsPrintedBook(printedCms, book);
      if (cms?.id) map.set(book.id, cms.id);
    }
    return map;
  }, [books, printedCms]);

  const novedades = useMemo(
    () => buildNovedadesShelf(regalos, books),
    [regalos, books],
  );
  const bestsellers = useMemo(
    () => buildBestsellersShelf(books, cmsIdByBookId),
    [books, cmsIdByBookId],
  );

  return (
    <div className="border-b border-na-editorial/10 bg-[#fbf8f4] py-14 sm:py-16">
      <div className="mx-auto max-w-6xl space-y-14 px-4 sm:px-6 sm:space-y-16">
        <ShelfSection
          id="novedades"
          eyebrow="Recién llegados"
          title="Novedades"
          lede="Lo último agregado al catálogo: souvenirs de Jornadas y títulos recientes."
          href={`${EDITORIAL_PATHS.regalos}/jornadas-2026`}
          linkLabel="Ver Jornadas"
          items={novedades}
          onOpenRegalo={setRegaloDetail}
          onOpenBook={() => router.push(EDITORIAL_PATHS.libros)}
        />
        <ShelfSection
          id="mas-vendidos"
          eyebrow="Destacados"
          title="Más vendidos"
          lede="Los títulos que más se llevan de la librería Editorial Logos."
          href={EDITORIAL_PATHS.libros}
          linkLabel="Ver todos los libros"
          items={bestsellers}
          onOpenRegalo={setRegaloDetail}
          onOpenBook={() => router.push(EDITORIAL_PATHS.libros)}
        />
      </div>

      {regaloDetail ? (
        <RegaloDetailDialog
          item={regaloDetail}
          open
          onClose={() => setRegaloDetail(null)}
          resolveImage={resolveRegaloImage}
        />
      ) : null}
    </div>
  );
}
