import { normalizePathname, EDITORIAL_PATHS } from "@/lib/editorial-navigation";
import type { CmsPageMediaTarget } from "@/lib/cms/types";

export function pathnameToEditorialPageMedia(
  pathname: string,
): CmsPageMediaTarget | null {
  const p = normalizePathname(pathname);
  if (p === "/") return "home";
  if (p === normalizePathname(EDITORIAL_PATHS.conoce)) return "quienes-somos";
  if (p === normalizePathname(EDITORIAL_PATHS.dondeEstamos)) return "donde-estamos";
  if (p === normalizePathname(EDITORIAL_PATHS.libros)) return "libros";
  if (p === normalizePathname(EDITORIAL_PATHS.librosDigitales)) {
    return "libros-digitales";
  }
  if (p === normalizePathname(EDITORIAL_PATHS.revistas)) return "revistas";
  if (p === normalizePathname(EDITORIAL_PATHS.regalos)) return "regalos";
  if (p.startsWith(`${normalizePathname(EDITORIAL_PATHS.regalos)}/`)) {
    return "regalos";
  }
  if (p.startsWith(`${normalizePathname(EDITORIAL_PATHS.libros)}/`)) {
    return "libros";
  }
  return null;
}
