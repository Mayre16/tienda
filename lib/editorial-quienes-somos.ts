import { PRINCIPAL_SITE_URL } from "@/lib/site-config";

export const EDITORIAL_LIBRERIA = {
  eyebrow: "Quiénes somos",
  title: "Editorial Logos, la librería de Nueva Acrópolis",
  paragraphs: [
    "Editorial Logos es la línea de publicaciones y la librería de Nueva Acrópolis en República Dominicana. Editamos, distribuimos y acercamos libros, revistas y artículos que invitan a pensar, crecer y vivir la filosofía en la vida cotidiana.",
    "Nuestro catálogo reúne obras de filosofía, psicología, historia, arte y desarrollo personal, junto a revistas, separadores y artículos con sentido, pensados para acompañar el estudio y la reflexión.",
    "Más que vender libros, buscamos despertar inquietudes: que cada lectura sea una invitación a conocerse, mejorar y construir una vida con sentido.",
  ],
  highlights: [
    {
      title: "Filosofía",
      text: "Obras clásicas y contemporáneas para pensar y vivir mejor.",
    },
    {
      title: "Cultura",
      text: "Revistas y publicaciones que difunden arte, historia y ciencia.",
    },
    {
      title: "Voluntariado",
      text: "Una editorial al servicio de un ideal de transformación.",
    },
  ],
  naIntro: "Editorial Logos forma parte de un ideal más amplio.",
  naButton: "Qué es Nueva Acrópolis",
} as const;

export const EDITORIAL_QUIENES_SOMOS = {
  title: "Qué es Nueva Acrópolis",
  heroImage: {
    src: "/img/home/grecia.webp",
    alt: "Visitante contemplando el Partenón en la Acrópolis de Atenas",
  },
  paragraphs: [
    "Nueva Acrópolis es una Escuela de Filosofía que promueve la cultura y practica el voluntariado. Propone un ideal de valores permanentes para contribuir a la evolución individual y colectiva.",
    "Desde hace más de 65 años, en más de 50 países, los programas de la Escuela de Filosofía han transformado la vida de miles de personas en todo el mundo.",
    "Editorial Logos forma parte de este ideal en República Dominicana: editamos y acercamos libros, revistas y artículos que invitan a pensar, crecer y vivir la filosofía.",
  ],
  ctaIntro:
    "Conoce nuestra historia, actividades y sedes en República Dominicana.",
  ctaLabel: "Visitar acropolis.org.do",
  ctaHref: `${PRINCIPAL_SITE_URL}/quienes-somos`,
} as const;
