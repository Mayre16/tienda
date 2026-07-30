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

/**
 * Copia específica de la librería por sede (sobrescribe la nota genérica del
 * sitio principal). La clave es el id de la sede en el sitio principal.
 */
const SEDE_OVERRIDES: Record<
  string,
  { sala?: string; note?: string; hours?: string }
> = {
  "sede-naco": {
    sala: "Librería Editorial Logos",
    note: "Nuestra librería principal: libros impresos, regalos filosóficos y publicaciones de la editorial.",
  },
  "sede-los-prados": {
    sala: "Punto de consulta editorial",
    note: "Consulta disponibilidad y retiro de pedidos en nuestra sede de Los Prados.",
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
};

export const EDITORIAL_DONDE_CONTACT: EditorialDondeContact = {
  phone: "(849) 352-7054",
  email: INFO_EMAIL,
  whatsappNumber: STORE_WHATSAPP_NUMBER,
  whatsappCtaLabel: "Escribir por WhatsApp",
  whatsappMessage:
    "Hola, me interesa visitar la Librería Editorial Logos en {sede}.",
};

export function editorialMapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function editorialMapsEmbedUrl(query: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=es&z=16&output=embed`;
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
