import { AUTHOR_FILTERS, STORE_THEMES, extractCmsSlugFromTags, type StoreBook } from "@/lib/bookstore";
import type { DigitalBookGroup } from "@/lib/digital-books";
import type { EditorialNavItem } from "@/lib/editorial-content";
import type { RegaloItem, RevistaItem } from "@/lib/editorial-extras";
import type { EditorialHomeCard } from "@/lib/editorial-home-cards";
import type { EditorialSede } from "@/lib/editorial-locations";
import type { HeroImage } from "@/lib/hero-images";
import {
  DIGITAL_BOOK_GROUPS,
  EDITORIAL_DONDE,
  EDITORIAL_DONDE_CONTACT,
  EDITORIAL_HEADER_NAV,
  EDITORIAL_HOME_CARDS,
  EDITORIAL_LIBRERIA,
  EDITORIAL_QUIENES_SOMOS,
  EDITORIAL_SEDES,
  EDITORIAL_STORE_PHOTO,
  EDITORIAL_VISIT,
  EDITORIAL_WELCOME,
  EDITORIAL_HERO_IMAGES,
  REGALO_CATEGORIES,
  REGALOS,
  REVISTAS,
  mergeEditorialPrintedBooks,
} from "@/lib/cms/merge-content";
import type {
  CmsDocument,
  CmsEditorialBookFilters,
  CmsEditorialDigitalBook,
  CmsEditorialDigitalBookGroup,
  CmsEditorialDonde,
  CmsEditorialFooter,
  CmsEditorialHeroImage,
  CmsEditorialHomeCard,
  CmsEditorialNavItem,
  CmsEditorialQuienesSomos,
  CmsEditorialPrintedBook,
  CmsEditorialRegalo,
  CmsEditorialRegaloCategory,
  CmsEditorialRevista,
  CmsEditorialSede,
  CmsEditorialShopCategory,
  CmsEditorialWelcome,
} from "@/lib/cms/types";

const FOOTER_TAGLINE =
  "Libros, revistas y regalos filosóficos de Nueva Acrópolis.";

const SHOP_CATEGORIES: CmsEditorialShopCategory[] = [
  { id: "libros", label: "Libros", hash: "catalogo-impresos" },
  { id: "revistas", label: "Revistas", hash: "catalogo-revistas" },
  { id: "regalos", label: "Regalos", hash: "catalogo-regalos" },
];

export function codeToCmsNav(items: EditorialNavItem[]): CmsEditorialNavItem[] {
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    href: item.href,
    external: item.external,
  }));
}

export function codeToCmsHomeCards(
  cards: EditorialHomeCard[],
): CmsEditorialHomeCard[] {
  return cards.map((card) => ({
    id: card.id,
    title: card.title,
    description: card.description,
    hash: card.hash,
  }));
}

export function codeToCmsHeroImages(
  images: HeroImage[],
): CmsEditorialHeroImage[] {
  return images.map((img, index) => ({
    id: `hero-${index}`,
    src: img.src,
    alt: img.alt,
    objectPosition: img.objectPosition,
  }));
}

export function codeToCmsRevistas(items: RevistaItem[]): CmsEditorialRevista[] {
  return items.map((item) => ({ ...item }));
}

export function codeToCmsRegalos(items: RegaloItem[]): CmsEditorialRegalo[] {
  return items.map((item) => ({
    id: item.id,
    category: item.category,
    title: item.title,
    description: item.description,
    quote: item.quote,
    author: item.author,
    imageUrl: item.imageUrl,
    detailImageUrl: item.detailImageUrl,
    backImageUrl: item.backImageUrl,
    price: item.price,
    currency: item.currency,
    priceNote: item.priceNote,
    sample: item.sample,
  }));
}

export function codeToCmsRegaloCategories(): CmsEditorialRegaloCategory[] {
  return REGALO_CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    description: c.description,
  }));
}

export function codeToCmsDigitalBooks(
  groups: DigitalBookGroup[],
): CmsEditorialDigitalBookGroup[] {
  return groups.map((group) => ({
    id: group.id,
    label: group.label,
    description: group.description,
    books: group.books.map(
      (book): CmsEditorialDigitalBook => ({
        title: book.title,
        author: book.author,
        downloadUrl: book.downloadUrl,
        fileSize: book.fileSize,
        area: book.area,
        coverUrl: book.coverUrl,
        available: book.available !== false,
      }),
    ),
  }));
}

export function codeToCmsSedes(sedes: EditorialSede[]): CmsEditorialSede[] {
  return sedes.map((sede) => ({ ...sede }));
}

export function defaultBookFilters(): CmsEditorialBookFilters {
  return {
    themes: [...STORE_THEMES],
    authorFilters: AUTHOR_FILTERS.map((f) => ({ id: f.id, label: f.label })),
    publishers: ["Editorial Nueva Acrópolis"],
  };
}

export const DEFAULT_MEMORION: CmsEditorialRegalo = {
  id: "memorion",
  category: "papeleria",
  title: "Memorion — juego de cartas",
  description:
    "Juego educativo de Editorial Nueva Acrópolis para entrenar la memoria. Consulte disponibilidad y precio con nosotros.",
  imageUrl: "/img/regalos/memorion.webp",
  priceNote: "Consultar disponibilidad",
};

export function defaultMemorion(): CmsEditorialRegalo {
  return { ...DEFAULT_MEMORION };
}

export function newPrintedBookId() {
  return `libro-${Date.now().toString(36)}`;
}

/** Vincula un listing de Biblioteca al CMS editorial (sentido inverso). */
export function cmsPrintedBookFromStore(
  book: StoreBook,
  existingSlug?: string,
): CmsEditorialPrintedBook {
  const cmsSlug = existingSlug ?? extractCmsSlugFromTags(book.tags);
  return {
    id: cmsSlug ?? newPrintedBookId(),
    bibliotecaId: book.id,
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    coverUrl: book.cover_url,
    summary: book.summary,
    price: book.price,
    currency: book.currency ?? "DOP",
    stock: book.stock,
    publisher: book.publisher,
    area_tema: book.area_tema,
    priceNote: book.edition_note,
    syncStatus: "synced",
    lastSyncedAt: new Date().toISOString(),
  };
}

export function defaultQuienesSomos(): CmsEditorialQuienesSomos {
  return {
    libreria: {
      eyebrow: EDITORIAL_LIBRERIA.eyebrow,
      title: EDITORIAL_LIBRERIA.title,
      paragraphs: [...EDITORIAL_LIBRERIA.paragraphs],
      highlights: EDITORIAL_LIBRERIA.highlights.map((h) => ({ ...h })),
      naIntro: EDITORIAL_LIBRERIA.naIntro,
      naButton: EDITORIAL_LIBRERIA.naButton,
    },
    nuevaAcropolis: {
      title: EDITORIAL_QUIENES_SOMOS.title,
      heroImage: { ...EDITORIAL_QUIENES_SOMOS.heroImage },
      paragraphs: [...EDITORIAL_QUIENES_SOMOS.paragraphs],
      ctaIntro: EDITORIAL_QUIENES_SOMOS.ctaIntro,
      ctaLabel: EDITORIAL_QUIENES_SOMOS.ctaLabel,
      ctaHref: EDITORIAL_QUIENES_SOMOS.ctaHref,
    },
  };
}

export function defaultDonde(): CmsEditorialDonde {
  return {
    visit: { ...EDITORIAL_VISIT },
    page: { ...EDITORIAL_DONDE },
    contact: { ...EDITORIAL_DONDE_CONTACT },
    storePhoto: { ...EDITORIAL_STORE_PHOTO },
    sedes: codeToCmsSedes(EDITORIAL_SEDES),
  };
}

export type EditorialEditableState = {
  headerNav: CmsEditorialNavItem[];
  welcome: CmsEditorialWelcome;
  homeCards: CmsEditorialHomeCard[];
  footer: CmsEditorialFooter;
  heroImages: CmsEditorialHeroImage[];
  revistas: CmsEditorialRevista[];
  regalos: CmsEditorialRegalo[];
  memorion: CmsEditorialRegalo;
  regaloCategories: CmsEditorialRegaloCategory[];
  digitalBooks: CmsEditorialDigitalBookGroup[];
  quienesSomos: CmsEditorialQuienesSomos;
  donde: CmsEditorialDonde;
  shopCategories: CmsEditorialShopCategory[];
  bookFilters: CmsEditorialBookFilters;
  printedBooks: CmsEditorialPrintedBook[];
};

export function loadEditableDoc(draft: CmsDocument): EditorialEditableState {
  const s = draft.sections;
  return {
    headerNav: s.editorialHeaderNav?.length
      ? s.editorialHeaderNav
      : codeToCmsNav(EDITORIAL_HEADER_NAV),
    welcome: { ...EDITORIAL_WELCOME, ...s.editorialWelcome },
    homeCards: s.editorialHomeExplore?.cards?.length
      ? s.editorialHomeExplore.cards
      : codeToCmsHomeCards(EDITORIAL_HOME_CARDS),
    footer: {
      tagline: s.editorialFooter?.tagline ?? FOOTER_TAGLINE,
    },
    heroImages: s.editorialHeroImages?.length
      ? s.editorialHeroImages
      : codeToCmsHeroImages(EDITORIAL_HERO_IMAGES),
    revistas: s.editorialRevistas?.length
      ? s.editorialRevistas
      : codeToCmsRevistas(REVISTAS),
    regalos: s.editorialRegalos?.length
      ? s.editorialRegalos
      : codeToCmsRegalos(REGALOS),
    memorion: { ...defaultMemorion(), ...s.editorialMemorion },
    // Si el borrador solo tiene categorías placeholder (papelería/juegos/otros)
    // sin productos reales, usar el catálogo de código (separadores, camisetas…).
    regaloCategories: (() => {
      const cats = s.editorialRegaloCategories ?? [];
      const items = s.editorialRegalos ?? [];
      const placeholderOnly =
        cats.length > 0 &&
        cats.length <= 3 &&
        cats.every((c) =>
          ["papeleria", "juegos", "otros"].includes(c.id),
        ) &&
        !items.some(
          (r) =>
            r.category === "separadores" || r.category === "camisetas",
        );
      if (!cats.length || placeholderOnly) {
        return codeToCmsRegaloCategories();
      }
      return cats;
    })(),
    digitalBooks: s.editorialDigitalBooks?.length
      ? s.editorialDigitalBooks
      : codeToCmsDigitalBooks(DIGITAL_BOOK_GROUPS),
    quienesSomos: {
      ...defaultQuienesSomos(),
      ...s.editorialQuienesSomos,
      libreria: {
        ...defaultQuienesSomos().libreria,
        ...s.editorialQuienesSomos?.libreria,
      },
      nuevaAcropolis: {
        ...defaultQuienesSomos().nuevaAcropolis,
        ...s.editorialQuienesSomos?.nuevaAcropolis,
        heroImage: {
          src:
            s.editorialQuienesSomos?.nuevaAcropolis?.heroImage?.src ??
            defaultQuienesSomos().nuevaAcropolis?.heroImage?.src ??
            "",
          alt:
            s.editorialQuienesSomos?.nuevaAcropolis?.heroImage?.alt ??
            defaultQuienesSomos().nuevaAcropolis?.heroImage?.alt ??
            "",
          objectPosition:
            s.editorialQuienesSomos?.nuevaAcropolis?.heroImage?.objectPosition ??
            defaultQuienesSomos().nuevaAcropolis?.heroImage?.objectPosition,
        },
      },
    },
    donde: {
      ...defaultDonde(),
      ...s.editorialDonde,
      visit: { ...defaultDonde().visit, ...s.editorialDonde?.visit },
      page: { ...defaultDonde().page, ...s.editorialDonde?.page },
      contact: { ...defaultDonde().contact, ...s.editorialDonde?.contact },
      storePhoto: {
        ...defaultDonde().storePhoto,
        ...s.editorialDonde?.storePhoto,
      },
      sedes: s.editorialDonde?.sedes?.length
        ? s.editorialDonde.sedes
        : codeToCmsSedes(EDITORIAL_SEDES),
    },
    shopCategories: s.editorialShopCategories?.length
      ? s.editorialShopCategories
      : SHOP_CATEGORIES,
    bookFilters: {
      ...defaultBookFilters(),
      ...s.editorialBookFilters,
      themes: s.editorialBookFilters?.themes?.length
        ? s.editorialBookFilters.themes
        : defaultBookFilters().themes,
      authorFilters: s.editorialBookFilters?.authorFilters?.length
        ? s.editorialBookFilters.authorFilters
        : defaultBookFilters().authorFilters,
      publishers: s.editorialBookFilters?.publishers?.length
        ? s.editorialBookFilters.publishers
        : defaultBookFilters().publishers,
    },
    printedBooks: mergeEditorialPrintedBooks({
      version: 1,
      site: "editorial",
      updatedAt: "",
      sections: { editorialPrintedBooks: s.editorialPrintedBooks },
    }),
  };
}

export function buildEditorialDoc(
  base: CmsDocument,
  state: EditorialEditableState,
): CmsDocument {
  return {
    ...base,
    site: "editorial",
    sections: {
      ...base.sections,
      editorialHeaderNav: state.headerNav,
      editorialWelcome: state.welcome,
      editorialHomeExplore: { cards: state.homeCards },
      editorialFooter: state.footer,
      editorialHeroImages: state.heroImages,
      editorialRevistas: state.revistas,
      editorialRegalos: state.regalos,
      editorialMemorion: state.memorion,
      editorialRegaloCategories: state.regaloCategories,
      editorialDigitalBooks: state.digitalBooks,
      editorialQuienesSomos: state.quienesSomos,
      editorialDonde: state.donde,
      editorialShopCategories: state.shopCategories,
      editorialBookFilters: state.bookFilters,
      editorialPrintedBooks: state.printedBooks,
    },
  };
}

export function editorialStateAsDoc(state: EditorialEditableState): CmsDocument {
  return buildEditorialDoc(
    { version: 1, site: "editorial", updatedAt: "", sections: {} },
    state,
  );
}

export function newRegaloId() {
  return `regalo-${Date.now().toString(36)}`;
}

export function newRegaloCategoryId(label = "nueva-categoria") {
  const slug = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `cat-${Date.now().toString(36)}`;
}

export function newHeroImageId() {
  return `hero-${Date.now().toString(36)}`;
}
