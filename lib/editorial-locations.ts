import {
  INFO_EMAIL,
  PRINCIPAL_SITE_URL,
  STORE_WHATSAPP_NUMBER,
} from "@/lib/site-config";
import type { CmsEditorialDondeContact } from "@/lib/cms/types";
import { PRINCIPAL_SEDES } from "@/lib/editorial-sedes.generated";

export type EditorialSedeId = string;

export type EditorialSede = {
  id: EditorialSedeId;
  name: string;
  zone: string;
  city: string;
  address: string;
  reference?: string;
  mapsQuery: string;
  /** Texto/coords solo para el iframe (si mapsQuery es un enlace corto). */
  mapsEmbedQuery?: string;
  hours: string;
  note: string;
  /** Sala o espacio donde está la librería en la sede. */
  sala?: string;
};

export const EDITORIAL_STORE_HOURS = "Lunes a Jueves · 6:45 p.m. – 8:45 p.m.";

export const EDITORIAL_STORE_PHOTO = {
  src: "/img/editorial/libreria-bazar.webp",
  fallbackSrc: "/img/editorial/libreria-bazar.webp",
  alt: "Librería Editorial Logos — libros, separadores, camisetas, bolsas pintadas y recuerdos",
} as const;

/** Búsqueda estable para el iframe (los goo.gl no se pueden embeber ni geocodifican bien). */
const NACO_MAP_EMBED_QUERY =
  "Calle Cub Scouts No. 6, Ensanche Naco, Santo Domingo, República Dominicana";

/**
 * Copia específica de la librería por sede (sobrescribe la nota genérica del
 * sitio principal). La clave es el id de la sede en el sitio principal.
 */
const SEDE_OVERRIDES: Record<
  string,
  { sala?: string; note?: string; hours?: string; mapsEmbedQuery?: string }
> = {
  "sede-naco": {
    sala: "Librería Editorial Logos",
    note: "Nuestra librería principal: libros impresos, regalos filosóficos y publicaciones de la editorial.",
    mapsEmbedQuery: NACO_MAP_EMBED_QUERY,
  },
  "sede-los-prados": {
    sala: "Punto de consulta editorial",
    note: "Consulta disponibilidad y retiro de pedidos en nuestra sede de Los Prados.",
    mapsEmbedQuery:
      "Eugenio Deschamps No. 61, Los Prados, Santo Domingo, República Dominicana",
  },
  "sede-santiago": {
    mapsEmbedQuery:
      "Calle Penetración 10, Jardines del Este, Santiago de los Caballeros, República Dominicana",
  },
};

const DEFAULT_SEDE_NOTE =
  "Consulta disponibilidad y retiro de pedidos de la Editorial Logos en esta sede.";

/** Sedes sincronizadas desde el sitio principal (build-time, ver scripts/sync-sedes.mjs). */
const SYNCED_SEDES: EditorialSede[] = PRINCIPAL_SEDES.map((s) => {
  const override = SEDE_OVERRIDES[s.id] ?? {};
  return {
    id: s.id,
    name: s.name,
    zone: s.zone,
    city: s.city,
    address: s.address,
    reference: s.reference,
    mapsQuery: s.mapsQuery,
    mapsEmbedQuery: override.mapsEmbedQuery,
    hours: override.hours ?? EDITORIAL_STORE_HOURS,
    sala: override.sala,
    note: override.note ?? DEFAULT_SEDE_NOTE,
  };
});

/** Sedes propias de Editorial Logos (no provienen del sitio principal). */
export const EDITORIAL_EXTRA_SEDES: EditorialSede[] = [];

export const EDITORIAL_SEDES: EditorialSede[] = [...SYNCED_SEDES];

export const EDITORIAL_VISIT = {
  eyebrow: "Visítanos",
  title: "Te esperamos en la Sede Naco",
  lede:
    "Pasa por nuestra librería en la Sede Naco: estanterías con obras de filosofía, psicología, historia y regalos filosóficos. Un espacio pensado para descubrir, regalar y llevar a casa el pensamiento de Nueva Acrópolis.",
  ctaLabel: "Ver ubicaciones y horarios",
  ctaHash: "donde-estamos",
} as const;

export const EDITORIAL_DONDE = {
  eyebrow: "Dónde estamos",
  title: "Nuestras sedes",
  lede:
    "La librería principal está en Naco; también puedes acercarte a nuestras otras sedes para consultas y retiro de pedidos.",
} as const;

export type EditorialDondeContact = {
  phone: string;
  email: string;
  whatsappNumber: string;
  whatsappCtaLabel: string;
  whatsappMessage: string;
  floatWhatsappMessage: string;
  floatWhatsappLabel: string;
};

export const EDITORIAL_DONDE_CONTACT: EditorialDondeContact = {
  phone: "(849) 352-7054",
  email: INFO_EMAIL,
  whatsappNumber: STORE_WHATSAPP_NUMBER,
  whatsappCtaLabel: "Escribir por WhatsApp",
  whatsappMessage:
    "Hola, me interesa visitar la Librería Editorial Logos en {sede}.",
  floatWhatsappMessage:
    "Hola, me interesa consultar disponibilidad de libros y productos de Editorial Logos.",
  floatWhatsappLabel: "Consultar por WhatsApp",
};

function isGoogleMapsUrl(input: string): boolean {
  const s = input.trim();
  if (!/^https?:\/\//i.test(s)) return false;
  return (
    /(?:^|\.)google\.[^/]+\/maps/i.test(s) ||
    /maps\.google\./i.test(s) ||
    /maps\.app\.goo\.gl/i.test(s) ||
    /goo\.gl\/maps/i.test(s)
  );
}

function parseLatLon(input: string): { lat: number; lon: number } | null {
  const s = input.trim();
  let m = s.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (m) return { lat: Number(m[1]), lon: Number(m[2]) };
  m = s.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (m) return { lat: Number(m[1]), lon: Number(m[2]) };
  m = s.match(/[?&](?:q|query|ll|center)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (m) return { lat: Number(m[1]), lon: Number(m[2]) };
  return null;
}

/** Abre el enlace pegado tal cual, o busca por texto. */
export function editorialMapsUrl(query: string): string {
  const t = query.trim();
  if (!t) return "https://www.google.com/maps";
  if (isGoogleMapsUrl(t) || /^https?:\/\//i.test(t)) return t;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t)}`;
}

/** Dirección estable para el iframe cuando mapsQuery es goo.gl / share.google. */
export function editorialMapsEmbedFallback(sede: {
  address?: string;
  zone?: string;
  city?: string;
}): string {
  const address = (sede.address ?? "")
    .trim()
    .replace(/^C\.\s+/i, "Calle ")
    .replace(/^Av\.\s+/i, "Avenida ");
  // Evitar duplicar ciudad si ya viene en la dirección.
  const parts = [address, sede.zone, sede.city, "República Dominicana"]
    .map((p) => p?.trim())
    .filter(Boolean) as string[];
  return [...new Set(parts)].join(", ");
}

export function editorialMapsEmbedUrl(
  query: string,
  fallbackSearch?: string,
): string {
  const t = query.trim();
  const gps = parseLatLon(t);
  if (gps) {
    return `https://maps.google.com/maps?q=${gps.lat},${gps.lon}&hl=es&z=17&output=embed`;
  }
  const place = t.match(/\/maps\/place\/([^/@]+)/);
  if (place) {
    const name = decodeURIComponent(place[1].replace(/\+/g, " "));
    return `https://maps.google.com/maps?q=${encodeURIComponent(name)}&hl=es&z=17&output=embed`;
  }
  // Enlaces cortos no se pueden embeber ni geocodifican bien.
  if (/maps\.app\.goo\.gl|goo\.gl\/maps|share\.google\//i.test(t)) {
    const q = (fallbackSearch ?? t).trim();
    return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&hl=es&z=17&output=embed`;
  }
  return `https://maps.google.com/maps?q=${encodeURIComponent(t)}&hl=es&z=17&output=embed`;
}

export function mergeEditorialDondeContactFields(
  cms?: CmsEditorialDondeContact | null,
): EditorialDondeContact {
  return {
    phone: cms?.phone ?? EDITORIAL_DONDE_CONTACT.phone,
    email: cms?.email ?? EDITORIAL_DONDE_CONTACT.email,
    whatsappNumber: cms?.whatsappNumber ?? EDITORIAL_DONDE_CONTACT.whatsappNumber,
    whatsappCtaLabel:
      cms?.whatsappCtaLabel ?? EDITORIAL_DONDE_CONTACT.whatsappCtaLabel,
    whatsappMessage:
      cms?.whatsappMessage ?? EDITORIAL_DONDE_CONTACT.whatsappMessage,
    floatWhatsappMessage:
      cms?.floatWhatsappMessage?.trim() ||
      EDITORIAL_DONDE_CONTACT.floatWhatsappMessage,
    floatWhatsappLabel:
      cms?.floatWhatsappLabel?.trim() ||
      EDITORIAL_DONDE_CONTACT.floatWhatsappLabel,
  };
}

export function editorialWhatsAppUrl(
  message: string,
  whatsappNumber: string = STORE_WHATSAPP_NUMBER,
): string {
  const digits = whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function editorialSedeWhatsAppUrl(
  sedeName: string,
  contact: EditorialDondeContact,
): string {
  const text = contact.whatsappMessage.replace(/\{sede\}/g, sedeName);
  return editorialWhatsAppUrl(text, contact.whatsappNumber);
}

export function editorialTelHref(phone: string): string {
  return `tel:${phone.replace(/\D/g, "")}`;
}

export function editorialPrincipalDondeUrl(): string {
  return `${PRINCIPAL_SITE_URL}/donde-estamos`;
}
