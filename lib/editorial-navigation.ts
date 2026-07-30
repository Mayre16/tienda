"use client";

import { useEffect, type ReactNode } from "react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePathname, useRouter } from "next/navigation";
import {
  EDITORIAL_HASH_TO_CATEGORY,
  type EditorialNavItem,
  type ShopCategory,
} from "@/lib/editorial-content";

export const EDITORIAL_NAV_EVENT = "editorial-nav";

let editorialRouter: AppRouterInstance | null = null;

export function registerEditorialRouter(router: AppRouterInstance) {
  editorialRouter = router;
}

/** Rutas públicas sin fragmentos (#). */
export const EDITORIAL_PATHS = {
  inicio: "/",
  conoce: "/conoce-nueva-acropolis",
  libros: "/libros",
  librosDigitales: "/libros/digitales",
  revistas: "/revistas",
  regalos: "/regalos",
  dondeEstamos: "/donde-estamos",
} as const;

/** Slug interno de sección (lógica de catálogo) → ruta limpia. */
const SECTION_TO_PATH: Record<string, string> = {
  "": EDITORIAL_PATHS.inicio,
  "explorar-catalogos": EDITORIAL_PATHS.inicio,
  "donde-estamos": EDITORIAL_PATHS.dondeEstamos,
  "conoce-nueva-acropolis": EDITORIAL_PATHS.conoce,
  "quienes-somos": EDITORIAL_PATHS.conoce,
  conoce: EDITORIAL_PATHS.conoce,
  "catalogo-impresos": EDITORIAL_PATHS.libros,
  "catalogo-digitales": EDITORIAL_PATHS.librosDigitales,
  "catalogo-revistas": EDITORIAL_PATHS.revistas,
  "catalogo-regalos": EDITORIAL_PATHS.regalos,
  "catalogo-impresos-filosofia": `${EDITORIAL_PATHS.libros}/filosofia`,
};

/** Slug de hash → id de filtro en tab Regalos. */
const REGALO_HASH_TO_FILTER: Record<string, string> = {
  separadores: "separadores",
  papeleria: "papeleria",
  libretas: "libretas",
  camisetas: "camisetas",
  editio: "editio",
  memorion: "memorion",
  accesorios: "papeleria",
  articulos: "papeleria",
};

export function normalizePathname(pathname: string): string {
  const p = pathname.replace(/\/$/, "");
  return p || "/";
}

/** Convierte ruta limpia al slug interno de sección (p. ej. catalogo-impresos). */
export function pathnameToSection(pathname: string): string {
  const p = normalizePathname(pathname);
  if (p === "/") return "";
  if (p === normalizePathname(EDITORIAL_PATHS.conoce)) return "conoce-nueva-acropolis";
  if (p === normalizePathname(EDITORIAL_PATHS.dondeEstamos)) return "donde-estamos";
  if (p === normalizePathname(EDITORIAL_PATHS.libros)) return "catalogo-impresos";
  if (p === normalizePathname(EDITORIAL_PATHS.librosDigitales)) {
    return "catalogo-digitales";
  }
  if (p === normalizePathname(EDITORIAL_PATHS.revistas)) return "catalogo-revistas";
  if (p === normalizePathname(EDITORIAL_PATHS.regalos)) return "catalogo-regalos";
  const regalosBase = normalizePathname(EDITORIAL_PATHS.regalos);
  if (p.startsWith(`${regalosBase}/`)) {
    const filter = p.slice(`${regalosBase}/`.length);
    return filter ? `catalogo-regalos-${filter}` : "catalogo-regalos";
  }
  const librosBase = normalizePathname(EDITORIAL_PATHS.libros);
  if (p === `${librosBase}/filosofia`) {
    return "catalogo-impresos-filosofia";
  }
  return "";
}

/** Slug interno → ruta limpia. */
export function sectionToPath(section: string): string {
  const s = section.replace(/^#/, "");
  if (!s) return EDITORIAL_PATHS.inicio;
  if (SECTION_TO_PATH[s]) return SECTION_TO_PATH[s];
  const regaloMatch = s.match(/^catalogo-regalos-(.+)$/);
  if (regaloMatch) {
    return `${EDITORIAL_PATHS.regalos}/${regaloMatch[1]}`;
  }
  return EDITORIAL_PATHS.inicio;
}

/** @deprecated Solo para redirección de URLs antiguas con # */
export function parseEditorialHash(raw: string | undefined | null): string {
  return (raw ?? "").replace(/^#/, "");
}

export function isEditorialCatalogSection(section: string): boolean {
  const s = section.replace(/^#/, "");
  if (!s) return false;
  return s.startsWith("catalogo-");
}

/** @deprecated alias */
export function isEditorialCatalogHash(hash: string): boolean {
  return isEditorialCatalogSection(hash);
}

export function isEditorialHomeView(section: string): boolean {
  return !isEditorialCatalogSection(section);
}

export function categoryFromEditorialHash(raw: string): ShopCategory | null {
  const section = raw.replace(/^#/, "");
  if (section.startsWith("catalogo-regalos")) return "regalos";
  if (section.startsWith("catalogo-impresos")) return "impresos";
  return EDITORIAL_HASH_TO_CATEGORY[section] ?? null;
}

export function catalogViewOptions(section: string): {
  regaloFilter?: string;
  bookArea?: string;
} {
  const h = section.replace(/^#/, "");
  if (h === "catalogo-regalos") return { regaloFilter: "all" };
  const regaloMatch = h.match(/^catalogo-regalos-(.+)$/);
  if (regaloMatch) {
    const slug = regaloMatch[1];
    return { regaloFilter: REGALO_HASH_TO_FILTER[slug] ?? slug };
  }
  if (h === "catalogo-impresos-filosofia") return { bookArea: "Filosofía" };
  return {};
}

export function regaloFilterToPath(filter: string): string {
  if (!filter || filter === "all") return EDITORIAL_PATHS.regalos;
  return `${EDITORIAL_PATHS.regalos}/${filter}`;
}

/** @deprecated usar regaloFilterToPath */
export function regaloFilterToHash(filter: string): string {
  if (!filter || filter === "all") return "catalogo-regalos";
  return `catalogo-regalos-${filter}`;
}

export function navItemIsActive(
  pathname: string,
  _legacyHash: string,
  item: EditorialNavItem,
): boolean {
  if (item.external) return false;
  const p = normalizePathname(pathname);
  const href = normalizePathname(item.href);
  if (href === "/") return p === "/";
  if (item.id === "libros") {
    const libros = normalizePathname(EDITORIAL_PATHS.libros);
    const digitales = normalizePathname(EDITORIAL_PATHS.librosDigitales);
    return (
      p === libros ||
      p === digitales ||
      p.startsWith(`${libros}/`)
    );
  }
  return p === href || p.startsWith(`${href}/`);
}

export function getEditorialHeaderOffset(): number {
  if (typeof window === "undefined") return 120;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--editorial-header-offset")
    .trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : 120;
}

export function scrollToEditorialTarget(
  rawSection: string,
  behavior: ScrollBehavior = "smooth",
): boolean {
  const section = rawSection.replace(/^#/, "");
  if (!section) {
    window.scrollTo({ top: 0, behavior });
    return true;
  }
  const targetId = isEditorialCatalogSection(section) ? "catalogo" : section;
  const el = document.getElementById(targetId);
  if (!el) return false;
  const scrollBehavior = isEditorialCatalogSection(section) ? "auto" : behavior;
  const top =
    el.getBoundingClientRect().top +
    window.scrollY -
    getEditorialHeaderOffset();
  window.scrollTo({ top: Math.max(0, top), behavior: scrollBehavior });
  return true;
}

/** Un reintento corto: suficiente para catálogo montado, sin saturar el hilo principal. */
function scheduleEditorialScroll(section: string) {
  requestAnimationFrame(() => {
    if (scrollToEditorialTarget(section)) return;
    if (isEditorialCatalogSection(section)) {
      window.setTimeout(() => scrollToEditorialTarget(section), 120);
    }
  });
}

/** Navega a una sección usando rutas limpias (sin #). */
export function navigateEditorialSection(
  rawSection: string,
  options?: { scroll?: boolean },
) {
  if (typeof window === "undefined") return;
  const section = rawSection.replace(/^#/, "");
  const path = sectionToPath(section);
  const shouldScroll = options?.scroll ?? true;
  const current = normalizePathname(window.location.pathname);
  const target = normalizePathname(path);

  window.dispatchEvent(
    new CustomEvent(EDITORIAL_NAV_EVENT, {
      detail: { section, scroll: shouldScroll },
    }),
  );

  if (current !== target) {
    editorialRouter?.push(path);
    return;
  }

  if (shouldScroll) {
    scheduleEditorialScroll(section);
  }
}

/** @deprecated alias */
export function navigateEditorialHash(
  rawHash: string,
  options?: { scroll?: boolean },
) {
  navigateEditorialSection(rawHash, options);
}

export function useEditorialSectionListener(onSection: (section: string) => void) {
  const pathname = usePathname();

  useEffect(() => {
    onSection(pathnameToSection(pathname));
  }, [pathname, onSection]);

  useEffect(() => {
    const onNav = (event: Event) => {
      const detail = (event as CustomEvent<{ section: string }>).detail;
      onSection(detail?.section ?? "");
    };
    window.addEventListener(EDITORIAL_NAV_EVENT, onNav);
    return () => window.removeEventListener(EDITORIAL_NAV_EVENT, onNav);
  }, [onSection]);
}

/** @deprecated alias */
export function useEditorialHashListener(onHash: (hash: string) => void) {
  useEditorialSectionListener(onHash);
}

/** Un solo listener de scroll para tabs/botones internos (no re-registrar en cada ruta). */
export function useEditorialNavScroll() {
  useEffect(() => {
    const onNav = (event: Event) => {
      const detail = (
        event as CustomEvent<{ section: string; scroll?: boolean }>
      ).detail;
      if (detail?.scroll === false) return;
      scheduleEditorialScroll(detail?.section ?? "");
    };

    window.addEventListener(EDITORIAL_NAV_EVENT, onNav);
    return () => window.removeEventListener(EDITORIAL_NAV_EVENT, onNav);
  }, []);
}

/** Scroll al cargar o cambiar ruta limpia del menú (Link de Next.js). */
export function useEditorialRouteScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const section = pathnameToSection(pathname);
    if (!section) return;
    if (isEditorialCatalogSection(section) || section === "donde-estamos") {
      window.setTimeout(() => scheduleEditorialScroll(section), 80);
    }
  }, [pathname]);
}

/** Redirige URLs antiguas `/#seccion` → `/seccion` limpia. */
export function useEditorialLegacyHashRedirect() {
  const router = useRouter();

  useEffect(() => {
    const raw = window.location.hash;
    if (!raw || raw === "#") return;
    const section = parseEditorialHash(raw);
    router.replace(sectionToPath(section));
  }, [router]);
}

/** Registra router Next.js + redirección de hashes legacy. Montar en layout. */
export function EditorialNavigationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  useEffect(() => {
    registerEditorialRouter(router);
  }, [router]);
  useEditorialLegacyHashRedirect();
  return children;
}
