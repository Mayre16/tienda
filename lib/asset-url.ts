/** Prefija rutas estáticas con NEXT_PUBLIC_BASE_PATH (GitHub Pages preview). */
export function assetUrl(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path) || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }
  const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
  if (!base) return path;
  if (path === base || path.startsWith(`${base}/`)) return path;
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}
