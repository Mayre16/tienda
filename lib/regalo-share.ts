import { SITE_URL } from "@/lib/site-config";
import type { RegaloItem } from "@/lib/editorial-extras";

function categoryPath(category: string): string {
  if (!category || category === "all") return "/regalos/";
  return `/regalos/${category}/`;
}

export function regaloShareUrl(item: RegaloItem): string {
  const base =
    (typeof window !== "undefined" ? window.location.origin : SITE_URL).replace(
      /\/$/,
      "",
    ) || SITE_URL;
  return `${base}${categoryPath(item.category || "all")}`;
}

export async function shareRegaloItem(item: RegaloItem): Promise<void> {
  const url = regaloShareUrl(item);
  const title = `${item.title} — Editorial Logos`;
  const text = `Mira este recuerdo de Editorial Logos: ${item.title}`;

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
