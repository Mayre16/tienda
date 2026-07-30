export const CMS_EDIT_STORAGE_KEY = "editorial-cms-edit";

export type CmsEditMode = "1";

export function readStoredCmsEditMode(): CmsEditMode | null {
  if (typeof window === "undefined") return null;
  const v = sessionStorage.getItem(CMS_EDIT_STORAGE_KEY);
  return v === "1" ? v : null;
}

export function persistCmsEditMode(mode: CmsEditMode | null) {
  if (typeof window === "undefined") return;
  if (mode) sessionStorage.setItem(CMS_EDIT_STORAGE_KEY, mode);
  else sessionStorage.removeItem(CMS_EDIT_STORAGE_KEY);
}

export function parseCmsEditParam(
  value: string | null | undefined,
): CmsEditMode | null {
  return value === "1" ? value : null;
}

export function isInEditorIframe() {
  if (typeof window === "undefined") return false;
  return window.parent !== window.self;
}

/** Normaliza rutas con o sin barra final (Next `trailingSlash: true`). */
export function normalizeAppPath(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/$/, "");
}

export function matchesAppPath(pathname: string, route: string): boolean {
  return normalizeAppPath(pathname) === normalizeAppPath(route);
}
