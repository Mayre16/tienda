import { BookOpen } from "lucide-react";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { resolveCoverUrl } from "@/lib/bookstore";
import { PRINTED_BOOKS_SEED } from "@/lib/editorial-printed-books-seed";
import { preferWebpAssetUrl } from "@/lib/media-assets";
import type {
  CmsDocument,
  CmsEditorialDigitalBook,
  CmsEditorialDigitalBookGroup,
  CmsEditorialPrintedBook,
  CmsEditorialRegalo,
  CmsEditorialRevista,
  CmsEditorialSede,
} from "@/lib/cms/types";
import { AUTHOR_FILTERS, STORE_THEMES } from "@/lib/bookstore";
import {
  DIGITAL_BOOK_GROUPS,
  type DigitalBook,
  type DigitalBookGroup,
} from "@/lib/digital-books";
import {
  EDITORIAL_HEADER_NAV,
  EDITORIAL_WELCOME,
  type EditorialNavItem,
} from "@/lib/editorial-content";
import {
  REGALO_CATEGORIES,
  REGALOS,
  REVISTAS,
  type RegaloItem,
  type RevistaItem,
} from "@/lib/editorial-extras";
import {
  EDITORIAL_HOME_CARDS,
  type EditorialHomeCard,
} from "@/lib/editorial-home-cards";
import {
  EDITORIAL_DONDE,
  EDITORIAL_DONDE_CONTACT,
  EDITORIAL_SEDES,
  EDITORIAL_STORE_HOURS,
  EDITORIAL_STORE_PHOTO,
  EDITORIAL_VISIT,
  mergeEditorialDondeContactFields,
  type EditorialSede,
} from "@/lib/editorial-locations";
import {
  EDITORIAL_LIBRERIA,
  EDITORIAL_QUIENES_SOMOS,
} from "@/lib/editorial-quienes-somos";
import { EDITORIAL_HERO_IMAGES, type HeroImage } from "@/lib/hero-images";

const EDITORIAL_FOOTER_TAGLINE_FALLBACK =
  "Libros, revistas y regalos filosóficos de Nueva Acrópolis.";

const SHOP_CATEGORIES_FALLBACK = [
  { id: "libros", label: "Libros", hash: "catalogo-impresos" },
  { id: "revistas", label: "Revistas", hash: "catalogo-revistas" },
  { id: "regalos", label: "Jornadas", hash: "catalogo-regalos" },
];

export function mergeEditorialHeaderNav(
  fallback: EditorialNavItem[],
  cms: CmsDocument | null | undefined,
): EditorialNavItem[] {
  const items = cms?.sections.editorialHeaderNav;
  if (!items?.length) return fallback;
  const fbMap = new Map(fallback.map((item) => [item.id, item]));
  return items.map((item) => {
    const fb = fbMap.get(item.id);
    const labelRaw = item.label ?? fb?.label ?? item.id;
    // Tab público: Regalos → Jornadas (id interno se mantiene).
    const label =
      item.id === "regalos" && (labelRaw === "Regalos" || !item.label)
        ? "Jornadas"
        : labelRaw;
    return {
      id: item.id,
      label,
      href: item.href ?? fb?.href ?? "/",
      external: item.external ?? fb?.external,
    };
  });
}

export function mergeEditorialWelcome(
  fallback: typeof EDITORIAL_WELCOME,
  cms: CmsDocument | null | undefined,
) {
  const w = cms?.sections.editorialWelcome;
  if (!w) return { ...fallback };
  return {
    title: w.title ?? fallback.title,
    lede: w.lede ?? fallback.lede,
    tagline: w.tagline ?? fallback.tagline,
  };
}

export function mergeEditorialHomeCards(
  fallback: EditorialHomeCard[],
  cms: CmsDocument | null | undefined,
): EditorialHomeCard[] {
  const cards = cms?.sections.editorialHomeExplore?.cards;
  if (!cards?.length) return fallback;
  const fbMap = new Map(fallback.map((card) => [card.id, card]));
  return cards.map((card) => {
    const fb = fbMap.get(card.id);
    return {
      id: card.id,
      title: card.title ?? fb?.title ?? card.id,
      description: card.description ?? fb?.description ?? "",
      hash: card.hash ?? fb?.hash ?? card.id,
      icon: fb?.icon ?? BookOpen,
      accent:
        fb?.accent ??
        "border-na-editorial/25 bg-gradient-to-br from-na-editorial/[0.12] via-white to-na-helios/[0.08]",
    };
  });
}

export function mergeEditorialFooterTagline(
  cms: CmsDocument | null | undefined,
): string {
  return (
    cms?.sections.editorialFooter?.tagline ?? EDITORIAL_FOOTER_TAGLINE_FALLBACK
  );
}

export function mergeEditorialQuienesSomosLibreria(
  cms: CmsDocument | null | undefined,
) {
  const cmsLib = cms?.sections.editorialQuienesSomos?.libreria;
  if (!cmsLib) return EDITORIAL_LIBRERIA;
  return {
    eyebrow: cmsLib.eyebrow ?? EDITORIAL_LIBRERIA.eyebrow,
    title: cmsLib.title ?? EDITORIAL_LIBRERIA.title,
    paragraphs: cmsLib.paragraphs ?? [...EDITORIAL_LIBRERIA.paragraphs],
    highlights: cmsLib.highlights ?? [...EDITORIAL_LIBRERIA.highlights],
    naIntro: cmsLib.naIntro ?? EDITORIAL_LIBRERIA.naIntro,
    naButton: cmsLib.naButton ?? EDITORIAL_LIBRERIA.naButton,
  };
}

export function mergeEditorialQuienesSomosNa(
  cms: CmsDocument | null | undefined,
) {
  const cmsNa = cms?.sections.editorialQuienesSomos?.nuevaAcropolis;
  if (!cmsNa) return EDITORIAL_QUIENES_SOMOS;
  const heroSrc =
    resolveCmsMediaUrl(cmsNa.heroImage?.src) ??
    cmsNa.heroImage?.src ??
    EDITORIAL_QUIENES_SOMOS.heroImage.src;
  return {
    title: cmsNa.title ?? EDITORIAL_QUIENES_SOMOS.title,
    heroImage: {
      src: heroSrc,
      alt: cmsNa.heroImage?.alt ?? EDITORIAL_QUIENES_SOMOS.heroImage.alt,
    },
    paragraphs: cmsNa.paragraphs ?? [...EDITORIAL_QUIENES_SOMOS.paragraphs],
    ctaIntro: cmsNa.ctaIntro ?? EDITORIAL_QUIENES_SOMOS.ctaIntro,
    ctaLabel: cmsNa.ctaLabel ?? EDITORIAL_QUIENES_SOMOS.ctaLabel,
    ctaHref: cmsNa.ctaHref ?? EDITORIAL_QUIENES_SOMOS.ctaHref,
  };
}

export function mergeEditorialVisit(cms: CmsDocument | null | undefined) {
  const visit = cms?.sections.editorialDonde?.visit;
  if (!visit) return EDITORIAL_VISIT;
  return {
    eyebrow: visit.eyebrow ?? EDITORIAL_VISIT.eyebrow,
    title: visit.title ?? EDITORIAL_VISIT.title,
    lede: visit.lede ?? EDITORIAL_VISIT.lede,
    ctaLabel: visit.ctaLabel ?? EDITORIAL_VISIT.ctaLabel,
    ctaHash: visit.ctaHash ?? EDITORIAL_VISIT.ctaHash,
  };
}

export function mergeEditorialDondePage(cms: CmsDocument | null | undefined) {
  const page = cms?.sections.editorialDonde?.page;
  if (!page) return EDITORIAL_DONDE;
  return {
    eyebrow: page.eyebrow ?? EDITORIAL_DONDE.eyebrow,
    title: page.title ?? EDITORIAL_DONDE.title,
    lede: page.lede ?? EDITORIAL_DONDE.lede,
  };
}

export function mergeEditorialDondeContact(
  cms: CmsDocument | null | undefined,
) {
  return mergeEditorialDondeContactFields(cms?.sections.editorialDonde?.contact);
}

export function mergeEditorialStorePhoto(cms: CmsDocument | null | undefined) {
  const photo = cms?.sections.editorialDonde?.storePhoto;
  if (!photo) return EDITORIAL_STORE_PHOTO;
  const src =
    resolveCmsMediaUrl(photo.src) ?? photo.src ?? EDITORIAL_STORE_PHOTO.src;
  const fallbackSrc =
    resolveCmsMediaUrl(photo.fallbackSrc) ??
    photo.fallbackSrc ??
    EDITORIAL_STORE_PHOTO.fallbackSrc;
  return {
    src,
    fallbackSrc,
    alt: photo.alt ?? EDITORIAL_STORE_PHOTO.alt,
  };
}

function mergeEditorialSedeItem(
  fb: EditorialSede | undefined,
  cms: CmsEditorialSede | undefined,
): EditorialSede {
  const id = fb?.id ?? cms?.id ?? "";
  return {
    id,
    // Dirección / mapa: siempre del sitio principal (fallback sync).
    name: fb?.name ?? cms?.name ?? id,
    zone: fb?.zone ?? cms?.zone ?? "",
    city: fb?.city ?? cms?.city ?? "",
    address: fb?.address ?? cms?.address ?? "",
    reference: fb?.reference ?? cms?.reference,
    mapsQuery: fb?.mapsQuery ?? cms?.mapsQuery ?? "",
    mapsEmbedQuery: fb?.mapsEmbedQuery,
    // Horario / sala / nota: CMS Editorial.
    hours: cms?.hours ?? fb?.hours ?? EDITORIAL_STORE_HOURS,
    sala: cms?.sala ?? fb?.sala,
    note: cms?.note ?? fb?.note ?? "",
  };
}

export function mergeEditorialSedes(
  fallback: EditorialSede[],
  cms: CmsDocument | null | undefined,
): EditorialSede[] {
  const cmsList = cms?.sections.editorialDonde?.sedes ?? [];
  const cmsMap = new Map(cmsList.map((sede) => [sede.id, sede]));
  // Lista canónica = sedes del principal; el CMS solo aporta presentación.
  if (fallback.length) {
    return fallback.map((fb) => mergeEditorialSedeItem(fb, cmsMap.get(fb.id)));
  }
  if (!cmsList.length) return fallback;
  return cmsList.map((sede) => mergeEditorialSedeItem(undefined, sede));
}

function mergeRevistaItem(
  fb: RevistaItem | undefined,
  cms: CmsEditorialRevista,
): RevistaItem {
  return {
    title: cms.title,
    description: cms.description ?? fb?.description ?? "",
    href: cms.href ?? fb?.href ?? "#",
    note: cms.note ?? fb?.note,
    linkLabel: cms.linkLabel ?? fb?.linkLabel,
    linkLogoUrl: preferWebpAssetUrl(
      resolveCmsMediaUrl(cms.linkLogoUrl) ?? cms.linkLogoUrl ?? fb?.linkLogoUrl ?? "",
    ) || undefined,
    linkLogoAlt: cms.linkLogoAlt ?? fb?.linkLogoAlt,
    imageUrl: preferWebpAssetUrl(
      resolveCmsMediaUrl(cms.imageUrl) ?? cms.imageUrl ?? fb?.imageUrl ?? "",
    ),
    imageAlt: cms.imageAlt ?? fb?.imageAlt,
    confirmLeave: cms.confirmLeave ?? fb?.confirmLeave,
    leaveLabel: cms.leaveLabel ?? fb?.leaveLabel,
  };
}

export function mergeEditorialRevistas(
  fallback: RevistaItem[],
  cms: CmsDocument | null | undefined,
): RevistaItem[] {
  const items = cms?.sections.editorialRevistas;
  if (!items?.length) return fallback;
  const fbMap = new Map(fallback.map((item) => [item.title, item]));
  return items.map((item, index) =>
    mergeRevistaItem(fallback[index] ?? fbMap.get(item.title), item),
  );
}

export function mergeEditorialRegaloCategories(
  fallback: typeof REGALO_CATEGORIES,
  cms: CmsDocument | null | undefined,
) {
  const items = cms?.sections.editorialRegaloCategories;
  const fbMap = new Map(fallback.map((item) => [item.id, item]));
  const merged = items?.length
    ? items.map((item) => {
        const fb = fbMap.get(item.id);
        return {
          id: item.id,
          label: item.label ?? fb?.label ?? item.id,
          description: item.description ?? fb?.description ?? "",
        };
      })
    : fallback.map((item) => ({ ...item }));

  // Asegurar categoría Jornadas 2026 aunque el CMS aún no la tenga.
  if (!merged.some((c) => c.id === "jornadas-2026")) {
    const j = fbMap.get("jornadas-2026");
    if (j) merged.push({ ...j });
  }
  return merged;
}

function mergeRegaloAssetUrl(
  cmsUrl: string | undefined,
  fallbackUrl: string | undefined,
): string {
  const raw = cmsUrl?.trim() || fallbackUrl?.trim() || "";
  if (!raw) return "";
  return preferWebpAssetUrl(resolveCmsMediaUrl(raw) ?? raw);
}

function mergeRegaloItem(
  fb: RegaloItem | undefined,
  cms: CmsEditorialRegalo,
): RegaloItem {
  const imageUrl = mergeRegaloAssetUrl(cms.imageUrl, fb?.imageUrl);
  const backImageUrl = cms.backImageUrl?.trim()
    ? preferWebpAssetUrl(
        resolveCmsMediaUrl(cms.backImageUrl) ?? cms.backImageUrl,
      )
    : fb?.backImageUrl
      ? preferWebpAssetUrl(fb.backImageUrl)
      : undefined;
  const detailImageUrl = cms.detailImageUrl?.trim()
    ? preferWebpAssetUrl(
        resolveCmsMediaUrl(cms.detailImageUrl) ?? cms.detailImageUrl,
      )
    : fb?.detailImageUrl
      ? preferWebpAssetUrl(fb.detailImageUrl)
      : undefined;
  return {
    id: cms.id,
    category: cms.category ?? fb?.category ?? "separadores",
    title: cms.title ?? fb?.title ?? cms.id,
    description: cms.description ?? fb?.description ?? "",
    quote: cms.quote ?? fb?.quote,
    author: cms.author ?? fb?.author,
    imageUrl,
    backImageUrl,
    detailImageUrl,
    price: cms.price ?? fb?.price,
    currency: cms.currency ?? fb?.currency,
    priceNote: cms.priceNote ?? fb?.priceNote,
    sample: cms.sample ?? fb?.sample,
  };
}

export function mergeEditorialRegalos(
  fallback: RegaloItem[],
  cms: CmsDocument | null | undefined,
): RegaloItem[] {
  const items = cms?.sections.editorialRegalos;
  if (!items?.length) return fallback;
  const fbMap = new Map(fallback.map((item) => [item.id, item]));
  const merged = items.map((item) => mergeRegaloItem(fbMap.get(item.id), item));
  const ids = new Set(merged.map((item) => item.id));
  for (const sample of fallback.filter((r) => r.category === "jornadas-2026")) {
    if (!ids.has(sample.id)) merged.push(sample);
  }
  return merged;
}

export function mergeEditorialShopCategories(
  cms: CmsDocument | null | undefined,
) {
  const items = cms?.sections.editorialShopCategories;
  if (!items?.length) return SHOP_CATEGORIES_FALLBACK;
  const fbMap = new Map(SHOP_CATEGORIES_FALLBACK.map((item) => [item.id, item]));
  return items.map((item) => {
    const fb = fbMap.get(item.id);
    const labelRaw = item.label ?? fb?.label ?? item.id;
    const label =
      item.id === "regalos" && (labelRaw === "Regalos" || !item.label)
        ? "Jornadas"
        : labelRaw;
    return {
      id: item.id,
      label,
      hash: item.hash ?? fb?.hash ?? item.id,
    };
  });
}

export function mergeEditorialBookFilters(cms: CmsDocument | null | undefined) {
  const filters = cms?.sections.editorialBookFilters;
  const themes = filters?.themes?.length
    ? filters.themes
    : [...STORE_THEMES];
  const authorFilters = filters?.authorFilters?.length
    ? filters.authorFilters.map((item) => ({
        id: item.id,
        label:
          item.label ??
          AUTHOR_FILTERS.find((f) => f.id === item.id)?.label ??
          item.id,
      }))
    : AUTHOR_FILTERS.map((f) => ({ id: f.id, label: f.label }));
  const publishers = filters?.publishers?.length
    ? filters.publishers
    : ["Editorial Nueva Acrópolis"];
  return { themes, authorFilters, publishers };
}

const MEMORION_FALLBACK: CmsEditorialRegalo = {
  id: "memorion",
  category: "papeleria",
  title: "Memorion — juego de cartas",
  description:
    "Juego educativo de Editorial Nueva Acrópolis para entrenar la memoria. Consulte disponibilidad y precio con nosotros.",
  imageUrl: "/img/regalos/memorion.webp",
  priceNote: "Consultar disponibilidad",
};

export function mergeEditorialMemorion(
  cms: CmsDocument | null | undefined,
): CmsEditorialRegalo {
  return { ...MEMORION_FALLBACK, ...cms?.sections.editorialMemorion };
}

function normalizePrintedTitleKey(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[¿?¡!.,;:()«»"'`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function mergeEditorialPrintedBooks(
  cms: CmsDocument | null | undefined,
): CmsEditorialPrintedBook[] {
  // Catálogo local (portadas en tienda) + overrides del CMS. No depende de Biblioteca.
  const cmsBooks = cms?.sections.editorialPrintedBooks ?? [];
  const byId = new Map<string, CmsEditorialPrintedBook>();
  const titleToId = new Map<string, string>();

  for (const book of PRINTED_BOOKS_SEED) {
    byId.set(book.id, { ...book });
    const key = normalizePrintedTitleKey(book.title);
    if (key) titleToId.set(key, book.id);
  }

  for (const book of cmsBooks) {
    if (!book?.id?.trim()) continue;
    const titleKey = normalizePrintedTitleKey(book.title ?? "");
    const seedId = titleKey ? titleToId.get(titleKey) : undefined;
    const targetId =
      byId.has(book.id) || !seedId ? book.id : seedId;

    if (book.hidden) {
      byId.delete(book.id);
      if (seedId) byId.delete(seedId);
      continue;
    }

    const prev = byId.get(targetId);
    // Conservar portada local del seed si el CMS no trae cover usable.
    const coverUrl =
      (book.coverUrl && book.coverUrl.trim()) || prev?.coverUrl || "";
    const merged: CmsEditorialPrintedBook = prev
      ? { ...prev, ...book, id: targetId, coverUrl }
      : { ...book, coverUrl };
    byId.set(targetId, merged);
    if (targetId !== book.id) {
      byId.delete(book.id);
    }
    if (titleKey) titleToId.set(titleKey, targetId);
  }

  return [...byId.values()].filter((b) => !b.hidden);
}

function mergeDigitalBook(
  fb: DigitalBook | undefined,
  cms: CmsEditorialDigitalBook,
): DigitalBook | null {
  if (cms.hidden) return null;
  const rawCover = cms.coverUrl ?? fb?.coverUrl;
  const coverUrl = rawCover
    ? resolveCoverUrl(resolveCmsMediaUrl(rawCover) ?? rawCover)
    : undefined;
  const rawDownload =
    (cms.downloadUrl && cms.downloadUrl.trim()) ||
    fb?.downloadUrl ||
    "#";
  const downloadUrl = resolveCmsMediaUrl(rawDownload) ?? rawDownload;
  const hasFile = Boolean(downloadUrl) && downloadUrl !== "#";
  return {
    title: cms.title,
    author: cms.author ?? fb?.author ?? "",
    downloadUrl,
    fileSize: cms.fileSize ?? fb?.fileSize,
    area: cms.area ?? fb?.area,
    coverUrl,
    available: cms.available === false ? false : hasFile,
  };
}

function mergeDigitalBookGroup(
  fb: DigitalBookGroup | undefined,
  cms: CmsEditorialDigitalBookGroup,
): DigitalBookGroup {
  const fbBooks = fb?.books ?? [];
  const byTitle = new Map(fbBooks.map((book) => [book.title, book]));
  const cmsBooks = cms.books ?? [];
  const seen = new Set<string>();
  const books: DigitalBook[] = [];

  for (const book of cmsBooks) {
    if (!book?.title?.trim() || book.hidden) continue;
    const merged = mergeDigitalBook(byTitle.get(book.title), book);
    if (!merged) continue;
    seen.add(book.title);
    books.push(merged);
  }
  // Conservar títulos del seed no listados aún en el CMS.
  for (const book of fbBooks) {
    if (seen.has(book.title)) continue;
    books.push({ ...book, available: book.available !== false });
  }

  return {
    id: cms.id,
    label: cms.label ?? fb?.label ?? cms.id,
    description: cms.description ?? fb?.description,
    books,
  };
}

export function mergeEditorialDigitalBooks(
  fallback: DigitalBookGroup[],
  cms: CmsDocument | null | undefined,
): DigitalBookGroup[] {
  const groups = cms?.sections.editorialDigitalBooks;
  if (!groups?.length) {
    return fallback.map((g) => ({
      ...g,
      books: g.books.map((b) => ({ ...b, available: b.available !== false })),
    }));
  }
  const fbMap = new Map(fallback.map((group) => [group.id, group]));
  const merged = groups.map((group) =>
    mergeDigitalBookGroup(fbMap.get(group.id), group),
  );
  // Grupos del seed que aún no están en el CMS.
  for (const fb of fallback) {
    if (merged.some((g) => g.id === fb.id)) continue;
    merged.push({
      ...fb,
      books: fb.books.map((b) => ({ ...b, available: b.available !== false })),
    });
  }
  return merged;
}

export function mergeEditorialHeroImages(
  fallback: HeroImage[],
  cms: CmsDocument | null | undefined,
): HeroImage[] {
  const items = cms?.sections.editorialHeroImages;
  if (!items?.length) return fallback;
  return items.map((item, index) => {
    const fb = fallback[index];
    const src =
      resolveCmsMediaUrl(item.src) ?? item.src ?? fb?.src ?? "/img/hero/libros-1.webp";
    return {
      src,
      alt: item.alt ?? fb?.alt ?? "Imagen editorial",
      objectPosition: item.objectPosition ?? fb?.objectPosition,
    };
  });
}

export {
  EDITORIAL_HEADER_NAV,
  EDITORIAL_WELCOME,
  EDITORIAL_HOME_CARDS,
  EDITORIAL_LIBRERIA,
  EDITORIAL_QUIENES_SOMOS,
  EDITORIAL_VISIT,
  EDITORIAL_DONDE,
  EDITORIAL_DONDE_CONTACT,
  EDITORIAL_STORE_PHOTO,
  EDITORIAL_SEDES,
  REVISTAS,
  REGALO_CATEGORIES,
  REGALOS,
  DIGITAL_BOOK_GROUPS,
  EDITORIAL_HERO_IMAGES,
};
