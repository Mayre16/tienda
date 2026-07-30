/** Tipos CMS (alineados con editor). */

export type SiteId = "acropolis" | "civis" | "editorial";

export type CmsMedia = {
  src: string;
  alt: string;
  credit?: string;
  objectPosition?: string;
};

export type CmsEditorialNavItem = {
  id: string;
  label?: string;
  href?: string;
  external?: boolean;
};

export type CmsEditorialWelcome = {
  title?: string;
  lede?: string;
  tagline?: string;
};

export type CmsEditorialHomeCard = {
  id: string;
  title?: string;
  description?: string;
  hash?: string;
};

export type CmsEditorialHomeExplore = {
  cards?: CmsEditorialHomeCard[];
};

export type CmsEditorialFooter = {
  tagline?: string;
};

export type CmsEditorialHighlight = {
  title: string;
  text: string;
};

export type CmsEditorialLibreria = {
  eyebrow?: string;
  title?: string;
  paragraphs?: string[];
  highlights?: CmsEditorialHighlight[];
  naIntro?: string;
  naButton?: string;
};

export type CmsEditorialQuienesNa = {
  title?: string;
  heroImage?: CmsMedia;
  paragraphs?: string[];
  ctaIntro?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type CmsEditorialQuienesSomos = {
  libreria?: CmsEditorialLibreria;
  nuevaAcropolis?: CmsEditorialQuienesNa;
};

export type CmsEditorialVisit = {
  eyebrow?: string;
  title?: string;
  lede?: string;
  ctaLabel?: string;
  ctaHash?: string;
};

export type CmsEditorialDondePage = {
  eyebrow?: string;
  title?: string;
  lede?: string;
};

export type CmsEditorialDondeContact = {
  phone?: string;
  email?: string;
  whatsappNumber?: string;
  whatsappCtaLabel?: string;
  /** Plantilla del mensaje; use `{sede}` para el nombre de la sede. */
  whatsappMessage?: string;
};

export type CmsEditorialStorePhoto = {
  src?: string;
  fallbackSrc?: string;
  alt?: string;
};

export type CmsEditorialSede = {
  id: string;
  name?: string;
  zone?: string;
  city?: string;
  address?: string;
  reference?: string;
  mapsQuery?: string;
  hours?: string;
  sala?: string;
  note?: string;
};

export type CmsEditorialDonde = {
  visit?: CmsEditorialVisit;
  page?: CmsEditorialDondePage;
  contact?: CmsEditorialDondeContact;
  storePhoto?: CmsEditorialStorePhoto;
  defaultHours?: string;
  sedes?: CmsEditorialSede[];
};

export type CmsEditorialRevista = {
  title: string;
  description?: string;
  href?: string;
  note?: string;
  linkLabel?: string;
  linkLogoUrl?: string;
  linkLogoAlt?: string;
  imageUrl?: string;
  imageAlt?: string;
  confirmLeave?: boolean;
  leaveLabel?: string;
};

export type CmsEditorialRegaloCategory = {
  id: string;
  label?: string;
  description?: string;
};

export type CmsEditorialRegalo = {
  id: string;
  category?: string;
  title?: string;
  description?: string;
  quote?: string;
  author?: string;
  imageUrl?: string;
  detailImageUrl?: string;
  backImageUrl?: string;
  price?: number | null;
  currency?: string;
  priceNote?: string;
  sample?: boolean;
};

export type CmsEditorialShopCategory = {
  id: string;
  label?: string;
  hash?: string;
};

export type CmsEditorialAuthorFilter = {
  id: string;
  label?: string;
};

export type CmsEditorialBookFilters = {
  themes?: string[];
  authorFilters?: CmsEditorialAuthorFilter[];
  publishers?: string[];
};

export type CmsEditorialPrintedBookSyncStatus =
  | "pending"
  | "synced"
  | "error"
  | "skipped";

export type CmsEditorialPrintedBook = {
  id: string;
  title: string;
  author?: string;
  isbn?: string;
  coverUrl?: string;
  summary?: string;
  price?: number | null;
  currency?: string;
  stock?: number;
  publisher?: string;
  area_tema?: string;
  priceNote?: string;
  /** Ocultar del catálogo público (p. ej. quitar un título del seed local). */
  hidden?: boolean;
  /** ID en Biblioteca/Harmonía (opcional; la tienda ya no depende de él). */
  bibliotecaId?: number;
  syncStatus?: CmsEditorialPrintedBookSyncStatus;
  syncError?: string;
  lastSyncedAt?: string;
};

export type CmsEditorialDigitalBook = {
  title: string;
  author?: string;
  downloadUrl?: string;
  fileSize?: string;
  area?: string;
  coverUrl?: string;
  /** false = visible pero no descargable. Por defecto true. */
  available?: boolean;
  /** true = oculto del catálogo digital. */
  hidden?: boolean;
};

export type CmsEditorialDigitalBookGroup = {
  id: string;
  label?: string;
  description?: string;
  books?: CmsEditorialDigitalBook[];
};

export type CmsEditorialHeroImage = {
  id: string;
  src?: string;
  alt?: string;
  objectPosition?: string;
};

export type CmsPageMediaCard = {
  id: string;
  kind: "image" | "video";
  src: string;
  poster?: string;
  alt: string;
  title?: string;
  caption?: string;
  linkHref?: string;
  linkLabel?: string;
};

export type CmsPageMediaBlockWidth = "normal" | "full";

export type CmsPageMediaTextBlock = {
  id: string;
  kind: "text";
  width?: CmsPageMediaBlockWidth;
  heading?: string;
  paragraphs: string[];
};

export type CmsPageMediaMediaLayout = "card" | "voluntariado" | "overlay";

export type CmsPageMediaMediaBlock = {
  id: string;
  kind: "media";
  width?: CmsPageMediaBlockWidth;
  layout?: CmsPageMediaMediaLayout;
  imageKind: "image" | "video";
  src: string;
  poster?: string;
  alt: string;
  area?: string;
  title?: string;
  caption?: string;
  body?: string;
  linkHref?: string;
  linkLabel?: string;
  align?: "left" | "center";
};

export type CmsPageMediaGalleryDisplay = "grid" | "carousel";

export type CmsPageMediaGalleryBlock = {
  id: string;
  kind: "gallery";
  width?: CmsPageMediaBlockWidth;
  display?: CmsPageMediaGalleryDisplay;
  columns?: 2 | 3;
  layout?: "card" | "overlay";
  carouselTitle?: string;
  carouselText?: string;
  carouselSide?: "left" | "right";
  align?: "left" | "center";
  items: CmsPageMediaCard[];
};

export type CmsPageMediaButtonVariant = "primary" | "outline" | "whatsapp";

export type CmsPageMediaButtonLinkKind = "url" | "whatsapp" | "internal";

export type CmsPageMediaButtonBlock = {
  id: string;
  kind: "button";
  width?: CmsPageMediaBlockWidth;
  align?: "left" | "center";
  label: string;
  linkKind: CmsPageMediaButtonLinkKind;
  href?: string;
  whatsappPhone?: string;
  whatsappMessage?: string;
  variant?: CmsPageMediaButtonVariant;
};

export type CmsPageMediaBlockKind = "text" | "media" | "gallery" | "button";

export type CmsPageMediaBlock =
  | CmsPageMediaTextBlock
  | CmsPageMediaMediaBlock
  | CmsPageMediaGalleryBlock
  | CmsPageMediaButtonBlock;

export type CmsPageMediaTarget =
  | "home"
  | "quienes-somos"
  | "donde-estamos"
  | "libros"
  | "libros-digitales"
  | "revistas"
  | "regalos";

export type CmsPageMediaSection = {
  id: string;
  pageId: CmsPageMediaTarget;
  eyebrow?: string;
  title?: string;
  intro?: string;
  blocks?: CmsPageMediaBlock[];
  cards?: CmsPageMediaCard[];
};

export type CmsDocument = {
  version: 1;
  site: "editorial";
  updatedAt: string;
  sections: {
    editorialHeaderNav?: CmsEditorialNavItem[];
    editorialWelcome?: CmsEditorialWelcome;
    editorialHomeExplore?: CmsEditorialHomeExplore;
    editorialFooter?: CmsEditorialFooter;
    editorialQuienesSomos?: CmsEditorialQuienesSomos;
    editorialDonde?: CmsEditorialDonde;
    editorialRevistas?: CmsEditorialRevista[];
    editorialRegaloCategories?: CmsEditorialRegaloCategory[];
    editorialRegalos?: CmsEditorialRegalo[];
    editorialMemorion?: CmsEditorialRegalo;
    editorialShopCategories?: CmsEditorialShopCategory[];
    editorialBookFilters?: CmsEditorialBookFilters;
    editorialPrintedBooks?: CmsEditorialPrintedBook[];
    editorialDigitalBooks?: CmsEditorialDigitalBookGroup[];
    editorialHeroImages?: CmsEditorialHeroImage[];
    pageMediaSections?: CmsPageMediaSection[];
  };
};
