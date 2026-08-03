/**
 * Sincroniza las sedes del sitio principal hacia Editorial Logos (build-time).
 *
 * Prioridad de fuente:
 * 1. CMS publicado (NEXT_PUBLIC_CMS_URL / CMS_URL) — CI y producción
 * 2. Archivos locales del monorepo (editor/ o principal/)
 *
 * Genera lib/editorial-sedes.generated.ts. Regenerar: npm run sedes:sync
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "lib/editorial-sedes.generated.ts");

const PUBLISHED_CANDIDATES = [
  path.join(ROOT, "../editor/data/acropolis/published.json"),
  path.join(ROOT, "../principal/data/acropolis/published.json"),
];

function cmsPublishedUrl() {
  const explicit = process.env.CMS_ACROPOLIS_PUBLISHED_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const base = (
    process.env.NEXT_PUBLIC_CMS_URL ||
    process.env.CMS_URL ||
    "https://editor.acropolis.adesa.com.do/api"
  ).replace(/\/$/, "");
  return `${base}/content/acropolis/published`;
}

async function loadPublished() {
  const url = cmsPublishedUrl();
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "tienda-sedes-sync/1.0 (+github-actions)",
      },
    });
    const text = await res.text();
    const trimmed = text.trim();
    if (res.ok && trimmed && !trimmed.startsWith("<")) {
      try {
        const doc = JSON.parse(trimmed);
        if (doc?.version === 1 && Array.isArray(doc?.sections?.venues)) {
          console.log("Fuente sedes: CMS", url, "updatedAt", doc.updatedAt ?? "?");
          return doc;
        }
      } catch {
        /* HTML/JSON inválido */
      }
    }
    console.warn("CMS sedes no usable (HTTP", res.status, ") — probando archivos locales…");
  } catch (err) {
    console.warn("CMS sedes no alcanzable:", err?.message ?? err, "— archivos locales…");
  }

  const local = PUBLISHED_CANDIDATES.find((p) => fs.existsSync(p));
  if (local) {
    console.log("Fuente sedes: archivo", local);
    return JSON.parse(fs.readFileSync(local, "utf8"));
  }

  // CI: sin monorepo ni CMS usable — conservar el generated ya committed.
  if (fs.existsSync(OUT)) {
    console.warn(
      "Sin CMS ni published.json local; se conserva",
      path.relative(ROOT, OUT),
    );
    return null;
  }

  console.error(
    "No se encontró published.json del sitio principal. Rutas:\n",
    PUBLISHED_CANDIDATES.map((p) => `  - ${p}`).join("\n"),
    "\nURL CMS:",
    url,
  );
  process.exit(1);
}

function sedesFromDoc(doc) {
  const venues = doc?.sections?.venues ?? [];
  const hidden = new Set(doc?.sections?.venuesHidden ?? []);
  return venues
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
}

function writeGenerated(sedes) {
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
// Fuente: sedes publicadas del sitio principal (CMS acropolis / published.json).
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
}

const doc = await loadPublished();
if (!doc) {
  console.log("OK (sin regenerar):", OUT);
  process.exit(0);
}

const sedes = sedesFromDoc(doc);

if (sedes.length === 0) {
  if (fs.existsSync(OUT)) {
    console.warn("CMS/local sin sedes; se conserva", path.relative(ROOT, OUT));
    process.exit(0);
  }
  console.error("No se encontraron sedes (kind: 'sede') en el sitio principal.");
  process.exit(1);
}

writeGenerated(sedes);
console.log(
  `Sedes sincronizadas (${sedes.length}):`,
  sedes.map((s) => `${s.name} → ${s.address}`).join(" | "),
);
console.log("Generado:", OUT);
