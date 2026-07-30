export type RevistaItem = {
  title: string;
  description: string;
  /** Ruta en sitio principal o URL absoluta externa. */
  href: string;
  note?: string;
  linkLabel?: string;
  /** Logo en el enlace CTA (p. ej. Revista Esfinge). */
  linkLogoUrl?: string;
  linkLogoAlt?: string;
  /** Portada opcional (p. ej. Anuario). */
  imageUrl?: string;
  imageAlt?: string;
  /** Muestra aviso antes de abrir enlace externo. */
  confirmLeave?: boolean;
  /** Etiqueta del destino en el aviso (p. ej. revistaesfinge.do). */
  leaveLabel?: string;
};

export type RegaloCategory = string;

export type RegaloItem = {
  id: string;
  category: RegaloCategory;
  title: string;
  description: string;
  /** Cita filosófica impresa en el artículo, si aplica. */
  quote?: string;
  author?: string;
  imageUrl: string;
  /** Foto ampliada en el modal de detalle (p. ej. lapiceros). */
  detailImageUrl?: string;
  /** Reverso del artículo (p. ej. la obra de arte del separador); se muestra al pasar el cursor. */
  backImageUrl?: string;
  priceNote?: string;
  /** Precio en DOP para compra en línea; omitir si solo consulta. */
  price?: number | null;
  currency?: string;
  /** true = diseño de ejemplo; consultar disponibilidad. */
  sample?: boolean;
};

export const REGALO_CATEGORIES: {
  id: RegaloCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "separadores",
    label: "Separadores de libros",
    description:
      "Separadores con citas filosóficas, arte clásico y la identidad de Nueva Acrópolis — Editorial Logos.",
  },
  {
    id: "papeleria",
    label: "Regalos filosóficos",
    description:
      "Lapiceros, resaltadores y artículos de uso diario con mensajes que inspiran.",
  },
  {
    id: "libretas",
    label: "Libretas",
    description:
      "Cuadernos tipo libreta con frases filosóficas para apuntes, reflexión o regalo.",
  },
  {
    id: "camisetas",
    label: "Camisetas",
    description:
      "Prendas con frases filosóficas y diseños como Metaphysica.",
  },
  {
    id: "editio",
    label: "Editio",
    description:
      "Artículos y ediciones de la línea Editio — Editorial Logos.",
  },
];

export const REVISTAS: RevistaItem[] = [
  {
    title: "Revista Esfinge",
    description:
      "Publicación cultural y filosófica de Nueva Acrópolis, con más de cinco décadas promoviendo el pensamiento y el desarrollo humano.",
    href: "https://www.revistaesfinge.do/",
    note: "Ediciones y novedades en revistaesfinge.do",
    linkLabel: "Ver revista Esfinge",
    linkLogoUrl: "/img/revistas/esfinge-logo.webp",
    linkLogoAlt: "Revista Esfinge — conocimiento, reflexión y diálogo",
    imageUrl: "/img/revistas/esfinge-portada.webp",
    imageAlt: "Revista Esfinge — publicación cultural y filosófica de Nueva Acrópolis",
    confirmLeave: true,
    leaveLabel: "revistaesfinge.do",
  },
  {
    title: "Anuario — Memoria de Actividades",
    description:
      "Memoria anual de la acción de Nueva Acrópolis en cultura, ecología, voluntariado y formación filosófica en el mundo.",
    href: "https://www.acropolis.org/es/anuarios-internacionales/",
    imageUrl: "/img/revistas/anuario-portada.webp",
    imageAlt: "Portada del Anuario — Memoria de Actividades de Nueva Acrópolis",
    note: "Ediciones internacionales en acropolis.org",
    linkLabel: "Ver anuarios en acropolis.org",
    confirmLeave: true,
    leaveLabel: "acropolis.org",
  },
];

/** Diseños de ejemplo — branding Editorial Logos / NA RD, sin referencia a Perú. */
export const REGALOS: RegaloItem[] = [
  {
    id: "sep-suntzu-resultados",
    category: "separadores",
    title: "Separador · Grandes resultados",
    description:
      "Cita de Sun Tzu. Al reverso: una gota que genera grandes ondas. Pasa el cursor para ver la otra cara.",
    quote: "Grandes resultados pueden ser conseguidos con pequeños esfuerzos.",
    author: "Sun Tzu",
    imageUrl: "/img/regalos/sep-suntzu-resultados-msg.svg",
    backImageUrl: "/img/regalos/sep-suntzu-resultados-art.webp",
    price: 150,
    currency: "DOP",
    priceNote: "RD$ 150 · consultar stock",
    sample: true,
  },
  {
    id: "sep-nervo",
    category: "separadores",
    title: "Separador · Arquitecto del destino",
    description:
      "Cita de Amado Nervo. Al reverso: el compás del arquitecto y el camino al horizonte. Pasa el cursor para ver la otra cara.",
    quote:
      "Veo al final de mi rudo camino, que yo fui el arquitecto de mi propio destino.",
    author: "Amado Nervo",
    imageUrl: "/img/regalos/sep-nervo-msg.svg",
    backImageUrl: "/img/regalos/sep-nervo-art.webp",
    price: 150,
    currency: "DOP",
    priceNote: "RD$ 150 · consultar stock",
    sample: true,
  },
  {
    id: "sep-suntzu-conocete",
    category: "separadores",
    title: "Separador · Conócete a ti mismo",
    description:
      "Cita de Sun Tzu. Al reverso: un lago en calma que refleja el cielo. Pasa el cursor para ver la otra cara.",
    quote:
      "Conoce al adversario y sobre todo conócete a ti mismo y serás invencible.",
    author: "Sun Tzu",
    imageUrl: "/img/regalos/sep-suntzu-conocete-msg.svg",
    backImageUrl: "/img/regalos/sep-suntzu-conocete-art.webp",
    price: 150,
    currency: "DOP",
    priceNote: "RD$ 150 · consultar stock",
    sample: true,
  },
  {
    id: "sep-platon",
    category: "separadores",
    title: "Separador · El sabio",
    description:
      "Cita de Platón. Al reverso: el búho de Atenea sobre los libros. Pasa el cursor para ver la otra cara.",
    quote: "El sabio es aquel que busca aprender de todo y de todos.",
    author: "Platón",
    imageUrl: "/img/regalos/sep-platon-msg.svg",
    backImageUrl: "/img/regalos/sep-platon-art.webp",
    price: 150,
    currency: "DOP",
    priceNote: "RD$ 150 · consultar stock",
    sample: true,
  },
  {
    id: "sep-davinci",
    category: "separadores",
    title: "Separador · Genio y trabajo",
    description:
      "Cita de Leonardo Da Vinci. Al reverso: el taller renacentista, engranajes y bocetos. Pasa el cursor para ver la otra cara.",
    quote:
      "Los hombres geniales empiezan grandes obras, los hombres trabajadores las terminan.",
    author: "Leonardo Da Vinci",
    imageUrl: "/img/regalos/sep-davinci-msg.svg",
    backImageUrl: "/img/regalos/sep-davinci-art.webp",
    price: 150,
    currency: "DOP",
    priceNote: "RD$ 150 · consultar stock",
    sample: true,
  },
  {
    id: "sep-seneca",
    category: "separadores",
    title: "Separador · La fortaleza",
    description:
      "Cita de Séneca. Al reverso: un roble que resiste la tormenta. Pasa el cursor para ver la otra cara.",
    quote:
      "Las dificultades fortalecen la mente, como el trabajo fortalece el cuerpo.",
    author: "Séneca",
    imageUrl: "/img/regalos/sep-seneca-msg.svg",
    backImageUrl: "/img/regalos/sep-seneca-art.webp",
    price: 150,
    currency: "DOP",
    priceNote: "RD$ 150 · consultar stock",
    sample: true,
  },
  {
    id: "lapiceros-virtudes",
    category: "papeleria",
    title: "Pack lapiceros · Prudencia, Fortaleza, Templanza y Justicia",
    description:
      "Set de cuatro lapiceros metálicos grabados con virtudes cardinales: negro Prudencia, rojo Fortaleza, azul Templanza y verde Justicia, con monograma NA y República Dominicana.",
    imageUrl: "/img/regalos/lapiceros-virtudes.webp",
    detailImageUrl: "/img/regalos/lapiceros-virtudes.png",
    price: 450,
    currency: "DOP",
    priceNote: "Pack de 4 · RD$ 450",
    sample: true,
  },
  {
    id: "resaltador-ideas",
    category: "papeleria",
    title: "Resaltador triple · Ilumina las ideas",
    description:
      "Resaltador 3 en 1 (rosa, amarillo y verde) con identificador Nueva Acrópolis · República Dominicana y el lema «Ilumina las ideas».",
    imageUrl: "/img/regalos/resaltador-ideas.webp",
    priceNote: "Consultar disponibilidad",
    sample: true,
  },
  {
    id: "libreta-conocete",
    category: "libretas",
    title: "Libreta · Conócete a ti mismo",
    description:
      "Libreta espiral con portada del cosmos y la máxima «Conócete a ti mismo y conocerás el universo y los dioses».",
    quote: "Conócete a ti mismo y conocerás el universo y los dioses.",
    author: "Inscripción del Templo de Delfos",
    imageUrl: "/img/regalos/libreta-conocete.webp",
    price: 350,
    currency: "DOP",
    priceNote: "RD$ 350 · consultar modelos",
    sample: true,
  },
  {
    id: "libreta-escribir",
    category: "libretas",
    title: "Libreta · El arte de escribir",
    description:
      "Libreta espiral con portada alegórica de la pluma y el lema «El arte de escribir nuestros pensamientos» — ideal como diario.",
    quote: "El arte de escribir nuestros pensamientos.",
    imageUrl: "/img/regalos/libreta-escribir.webp",
    price: 350,
    currency: "DOP",
    priceNote: "RD$ 350 · consultar modelos",
    sample: true,
  },
  {
    id: "libreta-lectura",
    category: "libretas",
    title: "Libreta · Amor por la lectura",
    description:
      "Libreta espiral con el árbol del saber y la frase «Donde hay amor por la lectura, hay esperanza para el futuro».",
    quote: "Donde hay amor por la lectura, hay esperanza para el futuro.",
    author: "Delia Steinberg Guzmán",
    imageUrl: "/img/regalos/libreta-lectura.webp",
    price: 350,
    currency: "DOP",
    priceNote: "RD$ 350 · consultar modelos",
    sample: true,
  },
  {
    id: "camiseta-socrates",
    category: "camisetas",
    title: "Camiseta · Sócrates",
    description:
      "Camiseta crema con retrato grabado de Sócrates y su célebre máxima.",
    quote: "Solo sé que no sé nada.",
    author: "Sócrates",
    imageUrl: "/img/regalos/camiseta-socrates.webp",
    price: 650,
    currency: "DOP",
    priceNote: "RD$ 650 · consultar tallas",
    sample: true,
  },
  {
    id: "camiseta-platon",
    category: "camisetas",
    title: "Camiseta · Platón",
    description: "Camiseta negra con cita de Platón en tipografía manuscrita.",
    quote: "La medida de un hombre es aquello que lo hace feliz.",
    author: "Platón",
    imageUrl: "/img/regalos/camiseta-platon.webp",
    price: 650,
    currency: "DOP",
    priceNote: "RD$ 650 · consultar tallas",
    sample: true,
  },
  {
    id: "camiseta-metaphysica",
    category: "camisetas",
    title: "Camiseta · Metaphysica",
    description:
      "Camiseta negra con póster «Metaphysica»: el título en tipografía al estilo Metallica y los bustos de Platón, Aristóteles, Pitágoras y Sócrates — un guiño entre metal y metafísica.",
    imageUrl: "/img/regalos/camiseta-metaphysica.webp",
    price: 650,
    currency: "DOP",
    priceNote: "RD$ 650 · consultar tallas",
    sample: true,
  },
];

export function regalosByCategory(category: RegaloCategory): RegaloItem[] {
  return REGALOS.filter((item) => item.category === category);
}
