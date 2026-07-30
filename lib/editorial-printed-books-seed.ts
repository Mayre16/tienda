import type { CmsEditorialPrintedBook } from "@/lib/cms/types";

const LOCAL = "/uploads/bookstore_covers";

/** Títulos legibles para el catálogo local (sin Biblioteca). */
const TITLES: Record<string, string> = {
  "ankor-ultimo-principe": "Ankor, el último príncipe de la Atlántida",
  "dhammapada-senda-de-la-ley": "Dhammapada — Senda de la Ley",
  "el-alquimista": "El alquimista",
  "el-arte-de-vivir": "El arte de vivir",
  "el-poder-de-los-simbolos": "El poder de los símbolos",
  "el-regalo-de-la-musica": "El regalo de la música",
  "filosofia-para-vivir": "Filosofía para vivir",
  "guia-para-entender-platon": "Guía para entender a Platón",
  "invitation-to-think": "An Invitation to Think",
  "la-alquimia-de-la-pareja": "La alquimia de la pareja",
  "las-7-leyes-de-la-naturaleza": "Las 7 leyes de la naturaleza",
  "las-esferas-de-la-conciencia": "Las esferas de la conciencia",
  "las-parabolas-del-buda": "Las parábolas del Buda",
  "los-espiritus-elementales": "Los espíritus elementales",
  "los-secretos-del-olimpo": "Los secretos del Olimpo",
  "manual-esfera": "Manual Esfera",
  memorion: "Memorión",
  "misterios-de-los-incas": "Misterios de los Incas",
  "moassy-el-perro": "Moassy, el perro",
  "nacidos-para-triunfar": "Nacidos para triunfar",
  "para-conocerse-mejor": "Para conocerse mejor",
  "pitagoras-musica-esferas": "Pitágoras — La música de las esferas",
  "poemas-epicos": "Poemas épicos",
  "poemas-filosoficos": "Poemas filosóficos",
  "que-hacemos-corazon-mente": "¿Qué hacemos con el corazón y la mente?",
  "reflexiones-de-un-filosofo": "Reflexiones de un filósofo",
};

const SLUGS = Object.keys(TITLES);

function titleFromSlug(slug: string): string {
  return (
    TITLES[slug] ??
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

/**
 * Catálogo impreso local (portadas en tienda).
 * Precio/stock se editan en el CMS; por defecto stock 1 y precio a consultar.
 */
const AUTHORS: Record<string, string> = {
  "ankor-ultimo-principe": "Jorge Ángel Livraga",
  "filosofia-para-vivir": "Delia Steinberg Guzmán",
  "que-hacemos-corazon-mente": "Delia Steinberg Guzmán",
  "el-alquimista": "Jorge Ángel Livraga",
  "moassy-el-perro": "Jorge Ángel Livraga",
  "para-conocerse-mejor": "Delia Steinberg Guzmán",
};

export const PRINTED_BOOKS_SEED: CmsEditorialPrintedBook[] = SLUGS.map(
  (slug) => ({
    id: slug,
    title: titleFromSlug(slug),
    author: AUTHORS[slug] ?? "",
    coverUrl: `${LOCAL}/${slug}.webp`,
    summary: "",
    price: null,
    currency: "DOP",
    stock: 1,
    publisher: "Editorial Nueva Acrópolis",
    area_tema: "",
    priceNote: "",
  }),
);

export const PRINTED_BOOK_SEED_IDS = new Set(PRINTED_BOOKS_SEED.map((b) => b.id));
