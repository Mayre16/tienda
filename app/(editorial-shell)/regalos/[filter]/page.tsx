import { REGALO_FILTER_STATIC_SLUGS } from "@/lib/editorial-navigation";

/** Rutas estáticas para filtros (/regalos/separadores, /regalos/jornadas-2026, etc.). */
export function generateStaticParams() {
  return REGALO_FILTER_STATIC_SLUGS.map((filter) => ({ filter }));
}

export default function RegalosFilterPage() {
  return null;
}
