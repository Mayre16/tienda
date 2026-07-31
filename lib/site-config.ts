export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3300"
    : "https://tienda.acropolis.org.do")
).replace(/\/$/, "");

export const PRINCIPAL_SITE_URL = (
  process.env.NEXT_PUBLIC_PRINCIPAL_URL?.trim() ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3100"
    : "https://acropolis.org.do")
).replace(/\/$/, "");

export const BIBLIOTECA_URL = (
  process.env.NEXT_PUBLIC_BIBLIOTECA_URL?.trim() ||
  "https://biblioteca-oina.adesa.com.do"
).replace(/\/$/, "");

export const CIVIS_URL = (
  process.env.NEXT_PUBLIC_CIVIS_URL?.trim() ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3200"
    : "https://civis.acropolis.org.do")
).replace(/\/$/, "");

export const DIPLOMADO_URL = `${PRINCIPAL_SITE_URL}/diplomado`;

/**
 * API de catálogo, stock y checkout.
 * Hoy: Biblioteca (PHP/MySQL). Futuro: Harmonía (PostgreSQL + contabilidad).
 * En build de producción: NEXT_PUBLIC_STORE_API_URL=https://…railway.app
 */
export const STORE_API_URL = (
  process.env.NEXT_PUBLIC_STORE_API_URL?.trim() ||
  process.env.NEXT_PUBLIC_BIBLIOTECA_API_URL?.trim() ||
  "https://biblioteca-oina.adesa.com.do"
).replace(/\/$/, "");

/** @deprecated Usar STORE_API_URL */
export const BIBLIOTECA_API_URL = STORE_API_URL;

/** Rutas API — cambiar cuando Harmonía exponga REST propio. */
export const STORE_CATALOG_PATH =
  process.env.NEXT_PUBLIC_STORE_CATALOG_PATH?.trim() ||
  "/api/bookstore_public_list.php";

export const STORE_CHECKOUT_PATH =
  process.env.NEXT_PUBLIC_STORE_CHECKOUT_PATH?.trim() ||
  "/api/checkout_create.php";

/** Alta/actualización de listings — solo CMS API (servidor). Harmonía: `/api/store/listings/upsert`. */
export const STORE_UPSERT_PATH =
  process.env.NEXT_PUBLIC_STORE_UPSERT_PATH?.trim() ||
  "/api/bookstore_upsert.php";

/** WhatsApp para pedidos de libros (NA RD). */
export const STORE_WHATSAPP_NUMBER = "18493527054";

export const WHATSAPP_NUMBER = "18495174144";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

/** URL pública de esta editorial (para enlaces desde Biblioteca admin). */
export const EDITORIAL_SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://tienda.acropolis.adesa.com.do"
).replace(/\/$/, "");

export const SUBMARCA_LOGO = {
  src: "/brand/identificadores/editorial-identificador.webp",
  alt: "Librería Editorial Logos — Nueva Acrópolis",
  width: 1277,
  height: 220,
};

export const LEGAL_DOMICILE =
  "Calle Cub Scouts No. 6, Ens. Naco, Santo Domingo";

/** Contacto general e información (legal, sedes, consultas). */
export const INFO_EMAIL =
  process.env.NEXT_PUBLIC_INFO_EMAIL?.trim() || "info.oinadom@acropolis.org";

export const DIPLOMADO_WHATSAPP_NUMBER = "18493527054";
export const DIPLOMADO_WHATSAPP_URL = `https://wa.me/${DIPLOMADO_WHATSAPP_NUMBER}`;

export const INSTAGRAM_HANDLE = "nuevaacropolisdominicana";

export const SOCIAL_LINKS = {
  instagram: `https://www.instagram.com/${INSTAGRAM_HANDLE}/`,
  youtube: "https://www.youtube.com/@NuevaAcr%C3%B3polisEspa%C3%B1a",
  facebook: "https://www.facebook.com/nuevaacropolisrd",
} as const;

export const LEGAL_LINKS = [
  { href: `${PRINCIPAL_SITE_URL}/legal/privacidad`, label: "Política de privacidad" },
  { href: `${PRINCIPAL_SITE_URL}/legal/aviso-legal`, label: "Aviso legal" },
  { href: `${PRINCIPAL_SITE_URL}/legal/cookies`, label: "Política de cookies" },
] as const;
