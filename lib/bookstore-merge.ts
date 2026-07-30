import {
  cmsPrintedBookId,
  cmsPrintedBookToStoreBook,
  extractCmsSlugFromTags,
  filterStoreBooks,
  type StoreBook,
} from "@/lib/bookstore";
import type { CmsEditorialPrintedBook } from "@/lib/cms/types";

/**
 * Checkout Azul/Harmonía solo si hay ID real de Biblioteca.
 * Libros solo-CMS se venden por WhatsApp (precio/stock igual se muestran).
 */
export function isBookCheckoutEligible(book: StoreBook): boolean {
  return (
    book.id > 0 &&
    book.price != null &&
    book.price > 0 &&
    book.stock > 0
  );
}

/** Presentación y precio/stock desde CMS (la tienda es independiente de Biblioteca). */
export function mergeCmsPrintedWithApi(
  cms: CmsEditorialPrintedBook,
  _api?: StoreBook,
): StoreBook {
  const fallback = cmsPrintedBookToStoreBook(cms);
  const bibliotecaId = cms.bibliotecaId;
  if (bibliotecaId && bibliotecaId > 0) {
    return {
      ...fallback,
      id: bibliotecaId,
      tags: "cms-manual",
    };
  }
  return fallback;
}

/**
 * Catálogo de la tienda = solo libros CMS/local.
 * Ya no se mezcla ni se requiere el API de Biblioteca.
 */
export function mergeCatalogBooks(
  _apiItems: StoreBook[],
  cmsBooks: CmsEditorialPrintedBook[],
  filters: {
    q?: string;
    authorGroup?: string;
    publisher?: string;
    area?: string;
  },
): StoreBook[] {
  const fromCms = cmsBooks
    .filter((cms) => !cms.hidden && cms.title?.trim())
    .map((cms) => mergeCmsPrintedWithApi(cms));
  return filterStoreBooks(fromCms, filters);
}

export function findCmsPrintedBook(
  cmsBooks: CmsEditorialPrintedBook[],
  book: StoreBook,
): CmsEditorialPrintedBook | undefined {
  return cmsBooks.find(
    (cms) =>
      (cms.bibliotecaId != null &&
        cms.bibliotecaId > 0 &&
        cms.bibliotecaId === book.id) ||
      (extractCmsSlugFromTags(book.tags) != null &&
        extractCmsSlugFromTags(book.tags) === cms.id) ||
      (!cms.bibliotecaId && cmsPrintedBookId(cms.id) === book.id) ||
      cmsPrintedBookId(cms.id) === book.id,
  );
}

export function isCmsManagedBook(
  cmsBooks: CmsEditorialPrintedBook[],
  book: StoreBook,
): boolean {
  return findCmsPrintedBook(cmsBooks, book) != null;
}
