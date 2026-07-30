"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import {
  useEditorialDigitalBooks,
  useEditorialPrintedBooks,
} from "@/lib/cms/hooks";
import { EditorialEditPencil } from "@/components/cms/CmsEditFields";
import { useEditorialCmsEdit } from "@/components/cms/EditorialCmsEditContext";
import {
  type DigitalBook,
  matchCoverFromCatalog,
  normalizeBookTitle,
} from "@/lib/digital-books";
import {
  cmsPrintedBookToStoreBook,
  findLocalBookCover,
  resolveCoverUrl,
  resolveStoreBookCover,
} from "@/lib/bookstore";

function DigitalBookPlaceholder({ title }: { title: string }) {
  const initial = title.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-na-heket/15 via-na-editorial/10 to-na-helios/20 p-2 text-center">
      <span className="text-2xl font-black text-na-editorial/40">{initial}</span>
      <span className="mt-1 text-[8px] font-bold uppercase tracking-widest text-na-muted">
        PDF
      </span>
    </div>
  );
}

function DigitalBookCard({
  book,
  cover,
  onEdit,
}: {
  book: DigitalBook;
  cover?: string;
  onEdit?: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const showCover = Boolean(cover) && !imgFailed;

  return (
    <article className="relative overflow-hidden rounded-xl border border-na-editorial/10 bg-white shadow-na-soft transition hover:-translate-y-0.5 hover:shadow-na-card">
      {onEdit ? (
        <EditorialEditPencil label={`Editar ${book.title}`} onClick={onEdit} />
      ) : null}
      <div className="flex justify-center bg-neutral-50 px-3 pt-3">
        <div className="relative aspect-[3/4] w-full max-w-[108px] bg-white shadow-sm">
          {showCover ? (
            <Image
              src={cover!}
              alt={`Portada: ${book.title}`}
              fill
              className="object-contain p-1"
              sizes="108px"
              unoptimized
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <DigitalBookPlaceholder title={book.title} />
          )}
          <span className="absolute left-1 top-1 rounded-full bg-na-heket px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
            PDF
          </span>
        </div>
      </div>
      <div className="p-2.5">
        <h3 className="line-clamp-2 text-xs font-bold leading-snug text-na-ink">
          {book.title}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-na-muted">
          {book.author}
        </p>
        {book.available === false ||
        !book.downloadUrl ||
        book.downloadUrl === "#" ? (
          <p className="mt-2 rounded-full bg-neutral-100 px-2.5 py-1.5 text-center text-[11px] font-bold text-na-muted">
            No disponible
          </p>
        ) : (
          <a
            href={book.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex w-full items-center justify-center gap-1 rounded-full bg-na-heket px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-na-kefer"
          >
            <Download className="h-3 w-3 shrink-0" aria-hidden />
            Descargar PDF
          </a>
        )}
      </div>
    </article>
  );
}

export function DigitalBooksSection() {
  const digitalBookGroups = useEditorialDigitalBooks();
  const printedBooks = useEditorialPrintedBooks();
  const edit = useEditorialCmsEdit();

  const catalogCovers = useMemo(() => {
    const map = new Map<string, string>();
    for (const cms of printedBooks) {
      const item = cmsPrintedBookToStoreBook(cms);
      const url = resolveStoreBookCover(item);
      if (url) map.set(normalizeBookTitle(item.title), url);
    }
    return map;
  }, [printedBooks]);

  const booksWithCovers = useMemo(() => {
    return digitalBookGroups.map((group) => ({
      ...group,
      books: group.books.map((book) => ({
        ...book,
        resolvedCover: (() => {
          const local = findLocalBookCover(book.title);
          if (local) return resolveCoverUrl(local);
          if (book.coverUrl) return resolveCoverUrl(book.coverUrl);
          return matchCoverFromCatalog(book.title, catalogCovers);
        })(),
      })),
    }));
  }, [catalogCovers, digitalBookGroups]);

  return (
    <section id="digitales" className="scroll-mt-24">
      <div className="space-y-12">
        {booksWithCovers.map((group) => (
          <div key={group.id} className="relative">
            {edit?.ready ? (
              <EditorialEditPencil
                label={`Editar grupo ${group.label}`}
                onClick={() => edit.setSelectedId(`digitalGroup:${group.id}`)}
                className="right-0 top-0"
              />
            ) : null}
            <h3 className="text-xl font-bold text-na-ink">{group.label}</h3>
            {group.description ? (
              <p className="mt-1 text-sm text-na-muted">{group.description}</p>
            ) : null}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {group.books.map((book) => (
                <DigitalBookCard
                  key={`${group.id}-${book.title}`}
                  book={book}
                  cover={book.resolvedCover}
                  onEdit={
                    edit?.ready
                      ? () =>
                          edit.setSelectedId(
                            `digitalBook:${group.id}:${book.title}`,
                          )
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
