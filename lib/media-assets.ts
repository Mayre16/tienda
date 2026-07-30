/** Rutas locales estáticas: preferir WebP generado (.png/.jpg → .webp). */
export function preferWebpAssetUrl(url: string): string {
  if (!url) return url;
  if (
    url.startsWith("http") ||
    url.startsWith("data:") ||
    url.startsWith("blob:") ||
    /\.webp$/i.test(url) ||
    /\.svg$/i.test(url)
  ) {
    return url;
  }
  if (/\.(jpe?g|png)$/i.test(url)) {
    return url.replace(/\.(jpe?g|png)$/i, ".webp");
  }
  return url;
}
