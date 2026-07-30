import {
  EDITORIAL_SITE_URL,
  STORE_API_URL,
  STORE_CATALOG_PATH,
} from "@/lib/site-config";

const LOCAL_COVERS_PATH = "/uploads/bookstore_covers/";

/** Portadas propias (fotos recortadas) servidas desde la web de Editorial. */
export const LOCAL_BOOK_COVERS: Record<string, string> = {
  moassy: `${LOCAL_COVERS_PATH}moassy-el-perro.webp`,
  nacidosparatriunfar: `${LOCAL_COVERS_PATH}nacidos-para-triunfar.webp`,
  paraconocersemejor: `${LOCAL_COVERS_PATH}para-conocerse-mejor.webp`,
  pitagoraslamusicadelasesferas: `${LOCAL_COVERS_PATH}pitagoras-musica-esferas.webp`,
  aninvitationtothink: `${LOCAL_COVERS_PATH}invitation-to-think.webp`,
};

export function normalizeBookTitleKey(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]/g, "");
}

export type StoreBook = {
  id: number;
  title: string;
  author: string;
  isbn: string;
  cover_url: string;
  summary: string;
  price: number | null;
  currency: string;
  stock: number;
  publisher: string;
  area_tema: string;
  edition_note: string;
  contact_email: string;
  tags?: string;
  author_group?: string;
};

export const STORE_THEMES = [
  "Filosofía",
  "Psicología y Desarrollo Personal",
  "Desarrollo Personal y Autoayuda",
  "Historia",
  "Literatura",
  "Espiritualidad y Religión",
  "Educación y Pedagogía",
] as const;

export const AUTHOR_FILTERS = [
  { id: "", label: "Todos los autores" },
  { id: "livraga", label: "Jorge Ángel Livraga" },
  { id: "steinberg", label: "Delia Steinberg Guzmán" },
  { id: "adelantado", label: "Carlos Adelantado" },
  { id: "otros", label: "Otros autores" },
] as const;

export type AuthorFilterId = (typeof AUTHOR_FILTERS)[number]["id"];

export function extractCmsSlugFromTags(tags?: string): string | undefined {
  if (!tags) return undefined;
  const m = tags.match(/(?:^|,)cms:([^,\s]+)/);
  return m?.[1];
}

export function cmsPrintedBookId(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (Math.imul(31, h) + slug.charCodeAt(i)) | 0;
  }
  return -Math.abs(h || 1);
}

export function cmsPrintedBookToStoreBook(
  book: import("@/lib/cms/types").CmsEditorialPrintedBook,
): StoreBook {
  return {
    id: cmsPrintedBookId(book.id),
    title: book.title,
    author: book.author ?? "",
    isbn: book.isbn ?? "",
    cover_url: book.coverUrl ?? "",
    summary: book.summary ?? "",
    price: book.price ?? null,
    currency: book.currency ?? "DOP",
    stock: book.stock ?? 0,
    publisher: book.publisher ?? "",
    area_tema: book.area_tema ?? "",
    edition_note: book.priceNote ?? "",
    contact_email: "",
    tags: "cms-manual",
  };
}

export function coverImageSrc(raw: string | null | undefined): string {
  const u = (raw == null ? "" : String(raw)).trim();
  if (u === "") return "";
  let out: string;
  if (u.startsWith("http://")) {
    out = `https://${u.slice("http://".length)}`;
  } else if (
    u.startsWith("https://") ||
    u.startsWith("data:") ||
    u.startsWith("blob:")
  ) {
    out = u;
  } else {
    out = u.startsWith("/") ? u : `/${u}`;
  }
  if (out.includes("://ooks.google.com")) {
    out = out.replace("://ooks.google.com", "://books.google.com");
  }
  return out;
}

/** Extrae slug local si la URL apunta a bookstore_covers (cualquier dominio). */
function extractLocalCoverPath(raw: string): string | null {
  const m = raw.match(/\/uploads\/bookstore_covers\/([^/?#]+)\.(jpe?g|png|webp)/i);
  if (!m) return null;
  return `${LOCAL_COVERS_PATH}${m[1]}.webp`;
}

function preferWebpLocalCover(u: string): string {
  const local = extractLocalCoverPath(u);
  if (local) return local;
  if (
    u.startsWith(LOCAL_COVERS_PATH) &&
    /\.(jpe?g|png)$/i.test(u)
  ) {
    return u.replace(/\.(jpe?g|png)$/i, ".webp");
  }
  return u;
}

function coverAssetBase(raw: string): string {
  if (raw.startsWith("/uploads/bookstore_covers/")) {
    return EDITORIAL_SITE_URL.replace(/\/$/, "");
  }
  return STORE_API_URL.replace(/\/$/, "");
}

export function resolveCoverUrl(raw: string | null | undefined): string {
  const u = coverImageSrc(raw);
  if (!u) return "";
  if (u.startsWith("http") || u.startsWith("data:") || u.startsWith("blob:")) {
    const local = extractLocalCoverPath(u);
    if (local) return local;
    return u;
  }
  if (u.startsWith(LOCAL_COVERS_PATH)) {
    return preferWebpLocalCover(u);
  }
  const base = coverAssetBase(u);
  const absolute = `${base}${u.startsWith("/") ? u : `/${u}`}`;
  const local = extractLocalCoverPath(absolute);
  if (local) return local;
  return absolute;
}

/** Busca portada local por título (fotos que pasaste, recortadas). */
export function findLocalBookCover(title: string): string | undefined {
  const key = normalizeBookTitleKey(title);
  if (LOCAL_BOOK_COVERS[key]) return LOCAL_BOOK_COVERS[key];
  if (key.includes("moassy")) return LOCAL_BOOK_COVERS.moassy;
  if (key.includes("nacidos") && key.includes("triunfar")) {
    return LOCAL_BOOK_COVERS.nacidosparatriunfar;
  }
  if (
    (key.includes("conocerse") || key.includes("conocerte")) &&
    key.includes("mejor")
  ) {
    return LOCAL_BOOK_COVERS.paraconocersemejor;
  }
  if (
    key.includes("pitagoras") &&
    (key.includes("esferas") || key.includes("musica"))
  ) {
    return LOCAL_BOOK_COVERS.pitagoraslamusicadelasesferas;
  }
  if (key.includes("invitation") && key.includes("think")) {
    return LOCAL_BOOK_COVERS.aninvitationtothink;
  }
  return undefined;
}

/** Portada de un libro del catálogo impreso (prioriza fotos locales propias). */
export function resolveStoreBookCover(book: {
  title: string;
  cover_url?: string | null;
}): string {
  const local = findLocalBookCover(book.title);
  if (local) return resolveCoverUrl(local);
  return resolveCoverUrl(book.cover_url);
}

export function formatPrice(price: number | null, currency: string): string {
  if (price === null || Number.isNaN(price)) return "Consultar precio";
  const cur = currency || "DOP";
  try {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: cur,
    }).format(price);
  } catch {
    return `${price.toFixed(2)} ${cur}`;
  }
}

export function buildStoreWhatsAppUrl(
  book: StoreBook,
  whatsappNumber: string,
): string {
  const price = formatPrice(book.price, book.currency);
  const lines = [
    "Hola, me interesa solicitar la compra de este libro:",
    "",
    book.title,
    book.author ? `Autor: ${book.author}` : "",
    book.isbn ? `ISBN: ${book.isbn}` : "",
    `Precio: ${price}`,
    book.stock > 0
      ? `Disponibilidad: ${book.stock} en stock`
      : "Disponibilidad: agotado",
  ].filter(Boolean);
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export async function fetchStoreBooks(params: {
  q?: string;
  authorGroup?: string;
  publisher?: string;
  area?: string;
  productType?: string;
}): Promise<StoreBook[]> {
  const search = new URLSearchParams();
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.authorGroup) search.set("author_group", params.authorGroup);
  if (params.publisher) search.set("publisher", params.publisher);
  if (params.area) search.set("area", params.area);
  if (params.productType) search.set("product_type", params.productType);

  const url = `${STORE_API_URL.replace(/\/$/, "")}${STORE_CATALOG_PATH}?${search.toString()}`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.error || `Error al cargar el catálogo (${res.status})`);
  }
  const items: StoreBook[] = Array.isArray(data.items) ? data.items : [];
  // Memorion no es un libro: se ofrece como juego de cartas en Regalos.
  return items.filter(
    (item) => !normalizeBookTitleKey(item.title).includes("memorion"),
  );
}

type CatalogCacheEntry = {
  key: string;
  promise: Promise<StoreBook[]>;
};

let catalogCache: CatalogCacheEntry | null = null;

function authorMatchesGroup(book: StoreBook, group: string): boolean {
  const ag = (book.author_group || "").toLowerCase();
  const author = book.author || "";
  if (group === "livraga") {
    return ag === "livraga" || (!ag && author.includes("Livraga"));
  }
  if (group === "steinberg") {
    return ag === "steinberg" || (!ag && author.includes("Steinberg"));
  }
  if (group === "adelantado") {
    return ag === "adelantado" || (!ag && author.includes("Adelantado"));
  }
  if (group === "otros") {
    return (
      ag === "otros" ||
      (!ag &&
        !author.includes("Livraga") &&
        !author.includes("Steinberg") &&
        !author.includes("Adelantado"))
    );
  }
  return true;
}

/** Filtra en el cliente (misma lógica que bookstore_public_list.php). */
export function filterStoreBooks(
  items: StoreBook[],
  params: {
    q?: string;
    authorGroup?: string;
    publisher?: string;
    area?: string;
  },
): StoreBook[] {
  let out = items;
  const q = params.q?.trim().toLowerCase();
  if (q) {
    out = out.filter((book) => {
      const haystack = [
        book.title,
        book.author,
        book.isbn,
        book.publisher,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }
  const area = params.area?.trim();
  if (area) {
    const needle = area.toLowerCase();
    out = out.filter((book) => {
      const tema = (book.area_tema || "").toLowerCase();
      const tags = (book.tags || "").toLowerCase();
      return tema.includes(needle) || tags.includes(needle);
    });
  }
  const publisher = params.publisher?.trim();
  if (publisher) {
    const needle = publisher.toLowerCase();
    out = out.filter((book) =>
      (book.publisher || "").toLowerCase().includes(needle),
    );
  }
  const authorGroup = params.authorGroup?.trim();
  if (authorGroup) {
    out = out.filter((book) => authorMatchesGroup(book, authorGroup));
  }
  return out;
}

/** Una sola petición al API; reutilizada por catálogo, hero y libros digitales. */
export function loadStoreBooksCatalog(
  productType = "impreso",
  opts?: { force?: boolean },
): Promise<StoreBook[]> {
  const key = productType || "impreso";
  if (!opts?.force && catalogCache?.key === key) {
    return catalogCache.promise;
  }
  const promise = fetchStoreBooks({ productType: key });
  catalogCache = { key, promise };
  return promise;
}
