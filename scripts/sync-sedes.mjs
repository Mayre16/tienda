/**
 * Sincroniza las sedes del sitio principal hacia Editorial Logos (build-time).
 *
 * Lee las sedes publicadas en el CMS del sitio principal
 * (editor/data/acropolis/published.json → sections.venues, kind === "sede")
 * y genera lib/editorial-sedes.generated.ts con sus datos factuales (dirección,
 * zona, ciudad, mapa). La presentación específica de la librería (sala/nota) se
 * aplica como override en lib/editorial-locations.ts.
 *
 * Ejecutar antes de compilar/desplegar Editorial:  npm run sedes:sync
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLISHED_CANDIDATES = [
  path.join(ROOT, "../editor/data/acropolis/published.json"),
  path.join(ROOT, "../principal/data/acropolis/published.json"),
];
const PUBLISHED = PUBLISHED_CANDIDATES.find((p) => fs.existsSync(p));
const OUT = path.join(ROOT, "lib/editorial-sedes.generated.ts");

if (!PUBLISHED) {
  console.error(
    "No se encontró el contenido publicado del sitio principal. Rutas probadas:\n",
    PUBLISHED_CANDIDATES.map((p) => `  - ${p}`).join("\n"),
  );
  process.exit(1);
}

const doc = JSON.parse(fs.readFileSync(PUBLISHED, "utf8"));
const venues = doc?.sections?.venues ?? [];
const hidden = new Set(doc?.sections?.venuesHidden ?? []);

const sedes = venues
  .filter((v) => v && v.kind === "sede" && !hidden.has(v.id))
  .map((v) => ({
    id: String(v.id),
    name: String(v.name ?? ""),
    zone: String(v.zone ?? ""),
    city: String(v.city ?? ""),
    address: String(v.address ?? ""),
    reference: v.reference ? String(v.reference) : undefined,
    mapsQuery: String(v.mapsQuery ?? v.address ?? v.name ?? ""),
  }));

if (sedes.length === 0) {
  console.error("No se encontraron sedes (kind: 'sede') publicadas en el sitio principal.");
  process.exit(1);
}

const entries = sedes
  .map((s) => {
    const lines = [
      `    id: ${JSON.stringify(s.id)},`,
      `    name: ${JSON.stringify(s.name)},`,
      `    zone: ${JSON.stringify(s.zone)},`,
      `    city: ${JSON.stringify(s.city)},`,
      `    address: ${JSON.stringify(s.address)},`,
    ];
    if (s.reference) lines.push(`    reference: ${JSON.stringify(s.reference)},`);
    lines.push(`    mapsQuery: ${JSON.stringify(s.mapsQuery)},`);
    return `  {\n${lines.join("\n")}\n  },`;
  })
  .join("\n");

const file = `// AUTOGENERADO por scripts/sync-sedes.mjs — NO editar a mano.
// Fuente: editor/data/acropolis/published.json (sedes publicadas del sitio principal).
// Regenerar con: npm run sedes:sync

export type SyncedSede = {
  id: string;
  name: string;
  zone: string;
  city: string;
  address: string;
  reference?: string;
  mapsQuery: string;
};

export const PRINCIPAL_SEDES: SyncedSede[] = [
${entries}
];
`;

fs.writeFileSync(OUT, file, "utf8");
console.log(`Sedes sincronizadas (${sedes.length}):`, sedes.map((s) => s.name).join(", "));
console.log("Generado:", OUT);
