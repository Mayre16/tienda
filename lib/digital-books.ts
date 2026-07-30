export type DigitalBookGroup = {
  id: string;
  label: string;
  description?: string;
  books: DigitalBook[];
};

export type DigitalBook = {
  title: string;
  author: string;
  downloadUrl: string;
  fileSize?: string;
  area?: string;
  /** Portada conocida (Open Library, editorial NA, etc.). */
  coverUrl?: string;
  /** false = no descargable (mostrar «No disponible»). */
  available?: boolean;
};

const OL = (isbn: string) =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

/** Catálogo de libros digitales (PDF) — fuente: Nueva Acrópolis / acropolis.org.do. */
export const DIGITAL_BOOK_GROUPS: DigitalBookGroup[] = [
  {
    id: "clasicos",
    label: "Clásicos de Oriente y Occidente",
    description:
      "Textos filosóficos y espirituales que han inspirado a la humanidad.",
    books: [
      { title: "Bhagavad Gita", author: "Anónimo", downloadUrl: "https://nueva-acropolis.es/libros/Bhagavad_Gita.pdf", fileSize: "144 Kb", area: "Filosofía", coverUrl: OL("0140449184") },
      { title: "Dhammapada", author: "Anónimo", downloadUrl: "https://nueva-acropolis.es/libros/Dhammapada.pdf", fileSize: "75 Kb", area: "Espiritualidad y Religión", coverUrl: "https://tienda.acropolisperu.org/wp-content/uploads/2020/11/Dhammpada-ebook-tienda.jpg" },
      { title: "Popol Vuh", author: "Anónimo", downloadUrl: "https://nueva-acropolis.es/libros/Popol_Vuh.pdf", fileSize: "173 Kb", area: "Historia", coverUrl: OL("0140446349") },
      { title: "Ética", author: "Aristóteles", downloadUrl: "https://nueva-acropolis.es/libros/Aristoteles-Etica.pdf", fileSize: "519 Kb", area: "Filosofía", coverUrl: OL("014044619X") },
      { title: "Vida de los filósofos más ilustres", author: "Diógenes Laercio", downloadUrl: "https://nueva-acropolis.es/libros/Diogenes_Laercio-Vida_de_los_filosofos_mas_ilustres.pdf", fileSize: "679 Kb", area: "Filosofía", coverUrl: OL("0192828691") },
      { title: "Máximas", author: "Epícteto", downloadUrl: "https://nueva-acropolis.es/libros/Epicteto-Maximas.pdf", fileSize: "49 Kb", area: "Filosofía", coverUrl: "https://tienda.acropolisperu.org/wp-content/uploads/2020/07/arte-de-vivir-tienda.jpg" },
      { title: "La Voz del Silencio", author: "Helena P. Blavatsky", downloadUrl: "https://nueva-acropolis.es/libros/HPB-La_Voz_del_Silencio.pdf", fileSize: "76 Kb", area: "Espiritualidad y Religión", coverUrl: OL("0835604019") },
      { title: "Tao Te King", author: "Lao Tse", downloadUrl: "https://nueva-acropolis.es/libros/Lao_Tse-Tao_Te_King.pdf", fileSize: "42 Kb", area: "Filosofía", coverUrl: OL("014044348X") },
      { title: "Tratados Morales", author: "Lucio Anneo Séneca", downloadUrl: "https://nueva-acropolis.es/libros/Seneca-Tratados_Morales.pdf", fileSize: "296 Kb", area: "Filosofía", coverUrl: OL("0140445834") },
      { title: "Meditaciones", author: "Marco Aurelio", downloadUrl: "https://nueva-acropolis.es/libros/Marco_Aurelio-Meditaciones.pdf", fileSize: "217 Kb", area: "Filosofía", coverUrl: OL("0140449334") },
      { title: "Versos Áureos", author: "Pitágoras", downloadUrl: "https://nueva-acropolis.es/libros/Pitagoras-Versos_Aureos.pdf", fileSize: "13 Kb", area: "Filosofía", coverUrl: "https://tienda.acropolisperu.org/wp-content/uploads/2021/09/pitagoras.jpg" },
      { title: "Apología de Sócrates", author: "Platón", downloadUrl: "https://nueva-acropolis.es/libros/Platon-Apologia_de_Socrates.pdf", fileSize: "63 Kb", area: "Filosofía", coverUrl: OL("0140449273") },
      { title: "La República", author: "Platón", downloadUrl: "https://nueva-acropolis.es/libros/Platon-La_Republica.pdf", fileSize: "702 Kb", area: "Filosofía", coverUrl: OL("0140449144") },
      { title: "Enéada VI — Sobre el Bien o el Uno", author: "Plotino", downloadUrl: "https://nueva-acropolis.es/libros/Plotino-Eneada_VI_Sobre_el_Bien_o_el_Uno.pdf", fileSize: "38 Kb", area: "Filosofía", coverUrl: OL("0140445202") },
      { title: "Instrucciones al rey Merikara", author: "Ptahotep", downloadUrl: "https://nueva-acropolis.es/libros/Ptahotep-Instrucciones_al_rey_Merikara.pdf", fileSize: "23 Kb", area: "Historia" },
    ],
  },
  {
    id: "delia",
    label: "Delia Steinberg Guzmán",
    description: "Obras de la presidenta internacional de Nueva Acrópolis.",
    books: [
      { title: "El Alma de la Mujer", author: "Delia Steinberg Guzmán", downloadUrl: "https://nueva-acropolis.es/libros/DSG-El_Alma_de_la_Mujer.pdf", fileSize: "58 Kb", area: "Psicología y Desarrollo Personal", coverUrl: OL("8486473014") },
      { title: "El Carácter según los Astros", author: "Delia Steinberg Guzmán", downloadUrl: "https://nueva-acropolis.es/libros/DSG-El_Caracter_segun_los_Astros.pdf", fileSize: "87 Kb", area: "Filosofía", coverUrl: OL("8486473022") },
      { title: "Esoterismo Práctico", author: "Delia Steinberg Guzmán", downloadUrl: "https://nueva-acropolis.es/libros/DSG-Esoterismo_Practico.pdf", fileSize: "71 Kb", area: "Filosofía", coverUrl: OL("8486473030") },
      { title: "Libertad e Inexorabilidad", author: "Delia Steinberg Guzmán", downloadUrl: "https://nueva-acropolis.es/libros/DSG-Libertad_Inexorabilidad.pdf", fileSize: "65 Kb", area: "Filosofía", coverUrl: OL("8486473049") },
      { title: "Los juegos de Maya", author: "Delia Steinberg Guzmán", downloadUrl: "https://nueva-acropolis.es/libros/DSG-Juegos_de_Maya.pdf", fileSize: "399 Kb", area: "Filosofía", coverUrl: OL("8496369106") },
      { title: "Hoy vi…", author: "Delia Steinberg Guzmán", downloadUrl: "https://nueva-acropolis.es/libros/DSG-Hoy_vi.pdf", area: "Literatura", coverUrl: OL("8496369114") },
      { title: "Para conocerse mejor", author: "Delia Steinberg Guzmán", downloadUrl: "https://nueva-acropolis.es/libros/DSG-Para_Conocerse_Mejor.pdf", area: "Psicología y Desarrollo Personal", coverUrl: "/uploads/bookstore_covers/para-conocerse-mejor.jpg" },
      { title: "¿Qué hacemos con el corazón y la mente?", author: "Delia Steinberg Guzmán", downloadUrl: "https://nueva-acropolis.es/libros/DSG-Que_hacemos_con_el_Corazon_y_la_Mente.pdf", area: "Psicología y Desarrollo Personal", coverUrl: "https://tienda.acropolisperu.org/wp-content/uploads/2024/08/quehacemosconelcorazonylamente.jpg" },
    ],
  },
  {
    id: "livraga",
    label: "Jorge Ángel Livraga",
    books: [
      { title: "La Vida después de la Muerte", author: "Jorge Ángel Livraga Rizzi", downloadUrl: "https://nueva-acropolis.es/libros/JAL-La_Vida_despues_de_la_Muerte.pdf", fileSize: "77 Kb", area: "Filosofía", coverUrl: OL("8486473057") },
      { title: "Los siete Caminos para la Realización Espiritual", author: "Jorge Ángel Livraga Rizzi", downloadUrl: "https://nueva-acropolis.es/libros/JAL-Los_siete_Caminos_para_la_Realizacion_Espiritual.pdf", fileSize: "81 Kb", area: "Espiritualidad y Religión", coverUrl: OL("8486473065") },
      { title: "Moassy el perro", author: "Jorge Ángel Livraga Rizzi", downloadUrl: "https://nueva-acropolis.es/libros/JAL-Moassy_el_perro.pdf", area: "Literatura", coverUrl: "/uploads/bookstore_covers/moassy-el-perro.jpg" },
      { title: "El teatro místico en Grecia — La tragedia", author: "Jorge Ángel Livraga Rizzi", downloadUrl: "https://nueva-acropolis.es/libros/JAL-Teatro_Misterico_La_Tragedia.pdf", area: "Cultura", coverUrl: OL("8486473073") },
      { title: "Los Espíritus Elementales de la Naturaleza", author: "Jorge Ángel Livraga Rizzi", downloadUrl: "https://nueva-acropolis.es/libros/JAL-Espiritus_Elementales_de_la_Naturaleza.pdf", area: "Espiritualidad y Religión", coverUrl: "https://tienda.acropolisperu.org/wp-content/uploads/2020/06/Arte-final-Libro-A5.jpg" },
      { title: "Tebas", author: "Jorge Ángel Livraga Rizzi", downloadUrl: "https://nueva-acropolis.es/libros/JAL-Tebas.pdf", area: "Historia", coverUrl: OL("8486473081") },
    ],
  },
  {
    id: "otros",
    label: "Otros autores",
    books: [
      { title: "El arte y la belleza", author: "Miguel Ángel Padilla Moreno", downloadUrl: "https://nueva-acropolis.es/libros/MAP-Arte_y_belleza.pdf", fileSize: "5,17 Mb", area: "Cultura", coverUrl: OL("848647309X") },
      { title: "Los motores ocultos del Renacimiento", author: "Varios autores", downloadUrl: "https://nueva-acropolis.es/libros/Varios-Los_motores_ocultos_del_Renacimiento.pdf", fileSize: "1,3 Mb", area: "Historia" },
      { title: "Todo sobre la reencarnación", author: "Varios autores", downloadUrl: "https://nueva-acropolis.es/libros/Varios-Todo_sobre_reencarnacion.pdf", fileSize: "1,2 Mb", area: "Filosofía" },
    ],
  },
];

export const DIGITAL_BOOK_COUNT = DIGITAL_BOOK_GROUPS.reduce(
  (n, g) => n + g.books.length,
  0,
);

export function normalizeBookTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Busca portada en mapa del catálogo impreso por título parecido. */
export function matchCoverFromCatalog(
  digitalTitle: string,
  catalog: Map<string, string>,
): string | undefined {
  const key = normalizeBookTitle(digitalTitle);
  if (catalog.has(key)) return catalog.get(key);
  // Evita mezclar «La República» (Platón) con «Guía para entender Platón».
  if (key === "larepublica") return undefined;
  for (const [k, url] of catalog) {
    if (k.includes("guiaparaentenderplaton")) continue;
    if (key.includes(k) || k.includes(key)) return url;
  }
  return undefined;
}
