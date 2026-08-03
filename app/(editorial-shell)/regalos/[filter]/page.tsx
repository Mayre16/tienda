/** Rutas estáticas para filtros de regalos (/regalos/separadores, etc.). */
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
  ];
}

export default function RegalosFilterPage() {
  return null;
}
