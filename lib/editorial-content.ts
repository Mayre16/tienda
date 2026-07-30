import { BIBLIOTECA_URL } from "@/lib/site-config";

export type EditorialNavItem = {
  id: string;
  label: string;
  href: string;
  external?: boolean;
};

export const EDITORIAL_HEADER_NAV: EditorialNavItem[] = [
  { id: "inicio", label: "Inicio", href: "/" },
  { id: "conoce", label: "Quiénes somos", href: "/conoce-nueva-acropolis" },
  { id: "libros", label: "Libros", href: "/libros" },
  { id: "revistas", label: "Revistas", href: "/revistas" },
  { id: "regalos", label: "Regalos", href: "/regalos" },
  { id: "donde-estamos", label: "Visítanos", href: "/donde-estamos" },
  {
    id: "sesion",
    label: "Iniciar sesión",
    href: `${BIBLIOTECA_URL}/reader`,
    external: true,
  },
];

export const EDITORIAL_HASH_TO_CATEGORY: Record<
  string,
  "impresos" | "digitales" | "revistas" | "regalos"
> = {
  "catalogo-impresos": "impresos",
  "catalogo-digitales": "digitales",
  "catalogo-revistas": "revistas",
  "catalogo-regalos": "regalos",
};

export const EDITORIAL_WELCOME = {
  title: "Una editorial y librería al servicio de la filosofía",
  lede:
    "Editorial Logos es la línea de publicaciones de Nueva Acrópolis en República Dominicana: editamos, distribuimos y acercamos libros, revistas y artículos que invitan a pensar, crecer y vivir la filosofía en la vida cotidiana.",
  tagline: "Filosofía · Cultura · Voluntariado",
} as const;

export const EDITORIAL_CATEGORY_HASH: Record<
  "impresos" | "digitales" | "revistas" | "regalos",
  string
> = {
  impresos: "catalogo-impresos",
  digitales: "catalogo-digitales",
  revistas: "catalogo-revistas",
  regalos: "catalogo-regalos",
};

export type ShopCategory = keyof typeof EDITORIAL_CATEGORY_HASH;
