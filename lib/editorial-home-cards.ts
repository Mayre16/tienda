import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Gift,
  Newspaper,
  Tablet,
} from "lucide-react";

export type EditorialSecondaryLink = {
  label: string;
  hash: string;
  note: string;
  icon: LucideIcon;
};

export type EditorialHomeCard = {
  id: string;
  title: string;
  description: string;
  hash: string;
  icon: LucideIcon;
  accent: string;
};

/** Tarjetas de la portada — cada una lleva a una sección del catálogo. */
export const EDITORIAL_HOME_CARDS: EditorialHomeCard[] = [
  {
    id: "impresos",
    title: "Libros impresos",
    description:
      "Catálogo en venta: filosofía, psicología, historia y más. Compra en línea o consulta disponibilidad.",
    hash: "catalogo-impresos",
    icon: BookOpen,
    accent:
      "border-na-editorial/25 bg-gradient-to-br from-na-editorial/[0.12] via-white to-na-helios/[0.08]",
  },
  {
    id: "digitales",
    title: "Libros digitales",
    description:
      "PDFs para leer y descargar. Inicia sesión en Biblioteca para acceder a tu perfil de lectura.",
    hash: "catalogo-digitales",
    icon: Tablet,
    accent:
      "border-na-heket/25 bg-gradient-to-br from-na-heket/[0.1] via-white to-na-kefer/[0.06]",
  },
  {
    id: "revistas",
    title: "Revistas",
    description:
      "Revista Esfinge, Anuario y publicaciones periódicas de Nueva Acrópolis.",
    hash: "catalogo-revistas",
    icon: Newspaper,
    accent:
      "border-na-amon/25 bg-gradient-to-br from-na-amon/[0.1] via-white to-na-helios/[0.1]",
  },
  {
    id: "regalos",
    title: "Regalos y separadores",
    description:
      "Separadores, regalos filosóficos, libretas, camisetas y Memorion — con filtros por categoría.",
    hash: "catalogo-regalos",
    icon: Gift,
    accent:
      "border-na-kefer/25 bg-gradient-to-br from-na-kefer/[0.12] via-white to-na-helios/[0.08]",
  },
];

/** Enlaces secundarios bajo las tarjetas (Memorion vive solo en el tab Regalos). */
export const EDITORIAL_HOME_SECONDARY_LINKS: EditorialSecondaryLink[] = [];
