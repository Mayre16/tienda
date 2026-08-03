import type { StoreBook } from "@/lib/bookstore";
import type { RegaloItem } from "@/lib/editorial-extras";

export type HomeShelfItem =
  | { kind: "book"; book: StoreBook }
  | { kind: "regalo"; item: RegaloItem };

const SHELF_LIMIT = 8;

/**
 * Títulos habitualmente más pedidos en Editorial Logos / NA RD.
 * Se muestran si existen en el catálogo CMS (aunque estén agotados).
 */
export const BESTSELLER_BOOK_IDS = [
  "filosofia-para-vivir",
  "que-hacemos-corazon-mente",
  "ankor-ultimo-principe",
  "el-alquimista",
  "para-conocerse-mejor",
  "moassy-el-perro",
  "pitagoras-musica-esferas",
  "nacidos-para-triunfar",
  "el-arte-de-vivir",
  "dhammapada-senda-de-la-ley",
  "las-7-leyes-de-la-naturaleza",
  "guia-para-entender-platon",
] as const;

function bookKey(book: StoreBook): string {
  return String(book.id);
}

function hasCover(book: StoreBook): boolean {
  return Boolean(book.cover_url?.trim());
}

function pricedRegalo(item: RegaloItem): boolean {
  return item.price != null && item.price > 0;
}

/** Novedades: Jornadas 2026 + últimos libros del catálogo. */
export function buildNovedadesShelf(
  regalos: RegaloItem[],
  books: StoreBook[],
  limit = SHELF_LIMIT,
): HomeShelfItem[] {
  const out: HomeShelfItem[] = [];
  const seenBooks = new Set<string>();

  for (const item of regalos) {
    if (item.category !== "jornadas-2026") continue;
    if (!pricedRegalo(item)) continue;
    out.push({ kind: "regalo", item });
    if (out.length >= limit) return out;
  }

  // Orden CMS: los añadidos al final aparecen primero como novedad.
  const recentBooks = [...books].reverse().filter((b) => b.title?.trim());
  for (const book of recentBooks) {
    const key = bookKey(book);
    if (seenBooks.has(key)) continue;
    seenBooks.add(key);
    out.push({ kind: "book", book });
    if (out.length >= limit) return out;
  }

  for (const item of regalos) {
    if (item.category === "jornadas-2026") continue;
    if (!pricedRegalo(item)) continue;
    out.push({ kind: "regalo", item });
    if (out.length >= limit) break;
  }

  return out;
}

/** Más vendidos: lista curada + libros con stock/precio. */
export function buildBestsellersShelf(
  books: StoreBook[],
  cmsIdByBookId: Map<number, string>,
  limit = SHELF_LIMIT,
): HomeShelfItem[] {
  const byCmsId = new Map<string, StoreBook>();
  for (const book of books) {
    const cmsId = cmsIdByBookId.get(book.id);
    if (cmsId) byCmsId.set(cmsId, book);
  }

  const out: HomeShelfItem[] = [];
  const used = new Set<number>();

  for (const id of BESTSELLER_BOOK_IDS) {
    const book = byCmsId.get(id);
    if (!book || used.has(book.id)) continue;
    used.add(book.id);
    out.push({ kind: "book", book });
    if (out.length >= limit) return out;
  }

  const rest = [...books]
    .filter((b) => !used.has(b.id) && hasCover(b))
    .sort((a, b) => {
      const score = (book: StoreBook) =>
        (book.stock > 0 ? 2 : 0) + (book.price != null && book.price > 0 ? 1 : 0);
      return score(b) - score(a);
    });

  for (const book of rest) {
    used.add(book.id);
    out.push({ kind: "book", book });
    if (out.length >= limit) break;
  }

  return out;
}
