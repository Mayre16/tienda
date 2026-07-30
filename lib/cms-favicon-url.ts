/** URL del favicon servido por la API del editor CMS. */
export function cmsFaviconUrl(
  site: "acropolis" | "civis" | "editorial" | "circulodeamigos",
): string {
  const base = (
    process.env.NEXT_PUBLIC_CMS_URL?.trim() ||
    "https://editor.acropolis.adesa.com.do/api"
  ).replace(/\/$/, "");
  return `${base}/favicon/${site}`;
}
