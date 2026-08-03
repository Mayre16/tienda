import { SITE_URL } from "@/lib/site-config";
import type { StoreBook } from "@/lib/bookstore";

export function bookShareUrl(book: StoreBook): string {
  const base =
    (typeof window !== "undefined" ? window.location.origin : SITE_URL).replace(
      /\/$/,
      "",
    ) || SITE_URL;
  return `${base}/libros/`;
}

export async function shareStoreBook(book: StoreBook): Promise<void> {
  const url = bookShareUrl(book);
  const title = `${book.title} — Editorial Logos`;
  const text = book.author
    ? `Mira este libro de Editorial Logos: ${book.title} (${book.author})`
    : `Mira este libro de Editorial Logos: ${book.title}`;

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return;
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return;
    }
  }

  const clipboard = `${text}\n${url}`;
  try {
    await navigator.clipboard.writeText(clipboard);
    window.alert("Enlace copiado. Ya puedes pegarlo donde quieras.");
  } catch {
    window.prompt("Copia este enlace:", clipboard);
  }
}
