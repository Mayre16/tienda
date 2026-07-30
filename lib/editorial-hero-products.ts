import { REGALO_CATEGORIES, REGALOS } from "@/lib/editorial-extras";

import { preferWebpAssetUrl } from "@/lib/media-assets";

function regaloAssetUrl(url: string): string {
  return preferWebpAssetUrl(url);
}

export type HeroProductSlide = {
  id: string;
  src: string;
  alt: string;
  title: string;
  category: string;
  catalogHash: string;
  /** SVG / producto plano — usar contain en lugar de cover. */
  contain?: boolean;
};

const REGALO_HERO_IDS = [
  "sep-platon",
  "lapiceros-virtudes",
  "resaltador-ideas",
  "camiseta-metaphysica",
] as const;

const REGALO_CATEGORY_SHORT: Record<string, string> = {
  separadores: "Separadores",
  papeleria: "Regalos filosóficos",
  libretas: "Libretas",
  camisetas: "Camisetas",
};

const REGALO_CATALOG_HASH: Record<string, string> = {
  separadores: "catalogo-regalos-separadores",
  papeleria: "catalogo-regalos-papeleria",
  libretas: "catalogo-regalos-libretas",
  camisetas: "catalogo-regalos-camisetas",
};

export function buildRegaloHeroSlides(): HeroProductSlide[] {
  return REGALO_HERO_IDS.flatMap((id) => {
    const item = REGALOS.find((r) => r.id === id);
    if (!item) return [];
    const cat = REGALO_CATEGORIES.find((c) => c.id === item.category);
    return [
      {
        id: item.id,
        src: regaloAssetUrl(item.imageUrl),
        alt: item.title,
        title: item.title,
        category:
          item.id === "lapiceros-virtudes"
            ? "Lapiceros"
            : item.id === "resaltador-ideas"
              ? "Resaltador"
              : (REGALO_CATEGORY_SHORT[item.category] ??
                cat?.label ??
                item.category),
        catalogHash: REGALO_CATALOG_HASH[item.category] ?? "catalogo-regalos",
        contain: true,
      },
    ];
  });
}

export function buildBookHeroSlide(input: {
  src: string;
  alt: string;
  title: string;
}): HeroProductSlide {
  return {
    id: "hero-book",
    src: input.src,
    alt: input.alt,
    title: input.title,
    category: "Libros impresos",
    catalogHash: "catalogo-impresos",
    contain: false,
  };
}

/** Orden fijo: libro → separador → lapiceros → camiseta → resaltador. */
export function mergeHeroProductSlides(
  bookSlide: HeroProductSlide | null,
): HeroProductSlide[] {
  const regalos = buildRegaloHeroSlides();
  if (bookSlide) return [bookSlide, ...regalos];
  return regalos;
}
