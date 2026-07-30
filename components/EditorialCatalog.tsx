"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import {
  type StoreBook,
  buildStoreWhatsAppUrl,
  formatPrice,
  resolveStoreBookCover,
} from "@/lib/bookstore";
import { mergeCatalogBooks, findCmsPrintedBook } from "@/lib/bookstore-merge";
import { bookToCartItem } from "@/lib/cart";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import {
  useCmsHydrated,
  useEditorialBookFilters,
  useEditorialPrintedBooks,
} from "@/lib/cms/hooks";
import { EditorialEditPencil } from "@/components/cms/CmsEditFields";
import { useEditorialCmsEdit } from "@/components/cms/EditorialCmsEditContext";
import { STORE_WHATSAPP_NUMBER } from "@/lib/site-config";

function BookDetail({
  book,
  onClose,
}: {
  book: StoreBook;
  onClose: () => void;
}) {
  const cover = resolveStoreBookCover(book);
  const whatsapp = buildStoreWhatsAppUrl(book, STORE_WHATSAPP_NUMBER);

  return (
    <div className="relative rounded-2xl border border-na-editorial/15 bg-white p-6 shadow-na-card sm:p-8">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-na-muted transition hover:bg-na-editorial/10 hover:text-na-ink"
        aria-label="Cerrar detalle"
      >
        <X className="h-5 w-5" />
      </button>
      <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
        {cover ? (
          <div className="relative mx-auto aspect-[3/4] w-56 shrink-0 overflow-hidden rounded-xl bg-white shadow-lg sm:mx-0 sm:w-64 md:w-72 lg:w-80">
            <Image
              src={cover}
              alt={`Portada: ${book.title}`}
              fill
              className="object-contain p-2"
              sizes="(max-width: 640px) 208px, 256px"
              unoptimized
              loading="eager"
            />
          </div>
        ) : null}
        <div className="min-w-0 flex-1 sm:py-1">
          <h3 className="text-xl font-bold text-na-ink sm:text-2xl">{book.title}</h3>
          {book.author ? (
            <p className="mt-1 text-sm text-na-muted">{book.author}</p>
          ) : null}
          <p className="mt-3 text-lg font-bold text-na-editorialDark">
            {formatPrice(book.price, book.currency)}
          </p>
          <p className="mt-1 text-sm text-na-muted">
            {book.stock > 0
              ? `${book.stock} en stock`
              : "Agotado — consultar disponibilidad"}
          </p>
          {book.publisher ? (
            <p className="mt-3 text-sm text-na-muted">
              <span className="font-semibold text-na-ink">Editorial:</span>{" "}
              {book.publisher}
            </p>
          ) : null}
          {book.area_tema ? (
            <p className="mt-1 text-sm text-na-muted">
              <span className="font-semibold text-na-ink">Tema:</span>{" "}
              {book.area_tema}
            </p>
          ) : null}
          {book.isbn ? (
            <p className="mt-1 text-sm text-na-muted">
              <span className="font-semibold text-na-ink">ISBN:</span>{" "}
              {book.isbn}
            </p>
          ) : null}
          {book.summary ? (
            <p className="mt-4 text-sm leading-relaxed text-na-muted line-clamp-6">
              {book.summary}
            </p>
          ) : null}
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-full border border-na-heket/30 bg-white px-5 py-2.5 text-sm font-bold text-na-heket transition hover:bg-na-heket hover:text-white"
          >
            Consultar por WhatsApp
          </a>
          <div className="mt-3">
            <AddToCartButton item={bookToCartItem(book)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function EditorialCatalog({
  embedded = false,
  initialArea = "",
}: {
  embedded?: boolean;
  initialArea?: string;
}) {
  const { themes, authorFilters, publishers } = useEditorialBookFilters();
  const printedBooksCms = useEditorialPrintedBooks();
  const edit = useEditorialCmsEdit();
  const [q, setQ] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [authorGroup, setAuthorGroup] = useState("");
  const [publisher, setPublisher] = useState("");
  const [area, setArea] = useState(initialArea);
  const [detail, setDetail] = useState<StoreBook | null>(null);

  const filters = useMemo(
    () => ({ q, authorGroup, publisher, area }),
    [q, authorGroup, publisher, area],
  );
  const hydrated = useCmsHydrated();
  const loading = !hydrated && printedBooksCms.length === 0;
  const items = useMemo(
    () => mergeCatalogBooks([], printedBooksCms, filters),
    [printedBooksCms, filters],
  );
  useEffect(() => {
    if (initialArea) setArea(initialArea);
  }, [initialArea]);

  useEffect(() => {
    if (!detail) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetail(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detail]);

  return (
    <section
      id={embedded ? undefined : "catalogo"}
      className={
        embedded
          ? "scroll-mt-24"
          : "scroll-mt-24 mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16"
      }
    >
      {!embedded ? (
        <>
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-editorialDark">
            Catálogo
          </p>
          <h2 className="mt-3 text-balance text-3xl font-black text-na-ink sm:text-4xl">
            Libros en venta
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-na-muted sm:text-base">
            Publicaciones de Editorial Nueva Acrópolis y autores de la escuela.
            Precio y disponibilidad se gestionan en el editor. Para pedidos, use
            WhatsApp en cada título.
          </p>
        </>
      ) : null}

      <form
        className={`flex gap-2 ${embedded ? "mt-0" : "mt-8"}`}
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setQ(searchDraft);
        }}
      >
        <input
          type="search"
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          placeholder="Buscar por título, autor o ISBN…"
          aria-label="Buscar en catálogo editorial"
          className="min-w-0 flex-1 rounded-full border border-na-editorial/20 bg-white px-4 py-2.5 text-sm outline-none ring-na-editorial/30 transition focus:ring-2"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-na-editorial px-5 py-2.5 text-sm font-bold text-white transition hover:bg-na-editorialDark disabled:opacity-60"
        >
          <Search className="h-4 w-4" aria-hidden />
          Buscar
        </button>
      </form>

      <div className="relative mt-8 flex flex-wrap gap-2">
        {edit?.ready ? (
          <EditorialEditPencil
            label="Editar filtros de autores"
            onClick={() => edit.setSelectedId("libros:filters")}
            className="right-0 -top-8"
          />
        ) : null}
        {authorFilters.map((f) => (
          <button
            key={f.id || "all"}
            type="button"
            onClick={() => setAuthorGroup(f.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              authorGroup === f.id
                ? "bg-na-editorial text-white"
                : "bg-white text-na-muted ring-1 ring-na-editorial/15 hover:ring-na-editorial/35"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="relative mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setPublisher("")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            publisher === ""
              ? "bg-na-heket text-white"
              : "bg-white text-na-muted ring-1 ring-na-heket/15"
          }`}
        >
          Todas las editoriales
        </button>
        {publishers.map((pub) => (
          <button
            key={pub}
            type="button"
            onClick={() => setPublisher(pub)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              publisher === pub
                ? "bg-na-heket text-white"
                : "bg-white text-na-muted ring-1 ring-na-heket/15"
            }`}
          >
            {pub}
          </button>
        ))}
      </div>

      <div className="relative mt-3 flex flex-wrap gap-2">
        {edit?.ready ? (
          <EditorialEditPencil
            label="Editar filtros de temas"
            onClick={() => edit.setSelectedId("libros:filters")}
            className="right-0 -top-8"
          />
        ) : null}
        <button
          type="button"
          onClick={() => setArea("")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            area === ""
              ? "bg-na-kefer text-white"
              : "bg-white text-na-muted ring-1 ring-na-kefer/15"
          }`}
        >
          Todos los temas
        </button>
        {themes.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setArea(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              area === t
                ? "bg-na-kefer text-white"
                : "bg-white text-na-muted ring-1 ring-na-kefer/15"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {edit?.ready ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => edit.setSelectedId("libros:printed")}
            className="rounded-full border border-dashed border-na-editorial/40 px-4 py-2 text-xs font-bold text-na-editorial"
          >
            + Gestionar catálogo
          </button>
          <button
            type="button"
            onClick={() => edit.setSelectedId("libros:filters")}
            className="rounded-full border border-na-editorial/20 px-4 py-2 text-xs font-bold text-na-muted"
          >
            Editar filtros del catálogo
          </button>
        </div>
      ) : null}

      {loading ? (
        <p className="mt-10 text-center text-sm text-na-muted">
          Cargando catálogo…
        </p>
      ) : null}

      {!loading && items.length === 0 ? (
        <p className="mt-10 text-center text-sm text-na-muted">
          No hay libros que coincidan con los filtros.
        </p>
      ) : null}

      <div
        className={
          embedded
            ? "mt-8 grid gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            : "mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {items.map((book, index) => {
          const cover = resolveStoreBookCover(book);
          const cmsBook = findCmsPrintedBook(printedBooksCms, book);
          const isManual = cmsBook != null;
          const manualId = cmsBook?.id ?? null;
          return (
            <article
              key={book.id}
              className={`relative cursor-pointer overflow-hidden border bg-white shadow-na-soft transition hover:-translate-y-0.5 hover:shadow-na-card [content-visibility:auto] [contain-intrinsic-size:auto_420px] ${
                embedded ? "rounded-xl shadow-sm" : "rounded-2xl"
              } ${
                detail?.id === book.id
                  ? "border-na-editorial ring-2 ring-na-editorial/30"
                  : "border-na-editorial/10"
              }`}
              onClick={() => setDetail(book)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setDetail(book);
                }
              }}
              role="button"
              tabIndex={0}
            >
              {edit?.ready ? (
                <button
                  type="button"
                  className="absolute right-2 top-2 z-20 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-amber-950 shadow-md hover:bg-amber-500"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    edit.setSelectedId(
                      isManual && manualId
                        ? `printedBook:${manualId}`
                        : `libro-api:${book.id}`,
                    );
                  }}
                >
                  ✎ Editar
                </button>
              ) : null}
              <div className="relative aspect-[3/4] bg-white">
                {cover ? (
                  <Image
                    src={cover}
                    alt=""
                    fill
                    className="object-contain p-2"
                    sizes={
                      embedded
                        ? "(max-width: 768px) 50vw, 25vw"
                        : "(max-width: 768px) 100vw, 33vw"
                    }
                    unoptimized
                    loading={index < 6 ? "eager" : "lazy"}
                  />                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-na-muted">
                    Sin portada
                  </div>
                )}
                {book.stock <= 0 ? (
                  <span className="absolute left-2 top-2 rounded-full bg-neutral-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    Agotado
                  </span>
                ) : null}
              </div>
              <div className={embedded ? "p-3" : "p-4"}>
                <h3
                  className={`line-clamp-2 font-bold text-na-ink ${
                    embedded ? "text-xs" : "text-sm"
                  }`}
                >
                  {book.title}
                </h3>
                {book.author ? (
                  <p
                    className={`mt-1 line-clamp-1 text-na-muted ${
                      embedded ? "text-[11px]" : "text-xs"
                    }`}
                  >
                    {book.author}
                  </p>
                ) : null}
                <p
                  className={`mt-2 font-bold text-na-editorialDark ${
                    embedded ? "text-xs" : "text-sm"
                  }`}
                >
                  {formatPrice(book.price, book.currency)}
                </p>
                <div
                  className="mt-3"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <AddToCartButton
                    item={bookToCartItem(book)}
                    compact
                    className={`inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-na-editorial font-bold text-white transition hover:bg-na-editorialDark ${
                      embedded
                        ? "mt-2 px-2.5 py-1.5 text-[10px]"
                        : "mt-3 px-3 py-2 text-xs"
                    }`}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {detail ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={() => setDetail(null)}
          role="presentation"
        >
          <div
            className="max-h-[92vh] w-full max-w-4xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <BookDetail book={detail} onClose={() => setDetail(null)} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
