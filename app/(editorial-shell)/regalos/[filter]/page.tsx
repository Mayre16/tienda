/** Rutas estáticas para filtros (/regalos/separadores, /regalos/jornadas-2026, etc.). */
export function generateStaticParams() {
  return [
    { filter: "separadores" },
    { filter: "papeleria" },
    { filter: "libretas" },
    { filter: "camisetas" },
    { filter: "editio" },
    { filter: "memorion" },
    { filter: "accesorios" },
    { filter: "articulos" },
    { filter: "jornadas-2026" },
    { filter: "jornadas" },
  ];
}

export default function RegalosFilterPage() {
  return null;
}
