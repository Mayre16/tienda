/**
 * Exporta identificador Biblioteca Sophia desde captura recortada (Silhouette).
 *
 * Fuente (prioridad):
 *  1. biblioteca-sophia.png — PNG ya recortado en Silhouette (usar tal cual)
 *  2. BIBLIOTECA-identificador.png — respaldo en raíz del monorepo
 *
 * Genera banner + header (mismo archivo) en WebP/PNG para tienda, principal y Biblioteca-OINA.
 *
 * Uso: npm run biblioteca:identificador
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const MONO = path.join(ROOT, "..");
const BIBLIOTECA_ROOT = path.join(MONO, "..", "Biblioteca-OINA");

const sources = [
  { path: path.join(MONO, "biblioteca-sophia.png"), asIs: true },
  { path: path.join(MONO, "BIBLIOTECA-identificador.png"), asIs: false },
];

const source = sources.find((item) => fs.existsSync(item.path));
if (!source) {
  console.error(
    "No se encontró biblioteca-sophia.png ni BIBLIOTECA-identificador.png en la raíz.",
  );
  process.exit(1);
}

const outDirs = [
  path.join(ROOT, "public/brand/identificadores"),
  path.join(MONO, "principal/public/brand/identificadores"),
  path.join(BIBLIOTECA_ROOT, "public/brand/identificadores"),
];

for (const dir of outDirs) {
  fs.mkdirSync(dir, { recursive: true });
}

async function exportAsIs(inputPath) {
  return sharp(inputPath);
}

async function exportLegacy(inputPath) {
  return sharp(inputPath)
    .trim({ threshold: 10 })
    .sharpen({ sigma: 0.35, m1: 0.35, m2: 0.15 });
}

const base = source.asIs
  ? await exportAsIs(source.path)
  : await exportLegacy(source.path);

async function writePair(baseName, dir) {
  const pngPath = path.join(dir, `${baseName}.png`);
  const webpPath = path.join(dir, `${baseName}.webp`);
  await base.clone().png({ compressionLevel: 9 }).toFile(pngPath);
  await base
    .clone()
    .webp({ quality: 100, effort: 6, nearLossless: true })
    .toFile(webpPath);
  const meta = await sharp(webpPath).metadata();
  return { pngPath, webpPath, width: meta.width, height: meta.height };
}

const tiendaDir = outDirs[0];
const principalDir = outDirs[1];
const bibliotecaDir = outDirs[2];

const bannerTienda = await writePair("biblioteca-identificador", tiendaDir);
const bannerBiblioteca = await writePair("biblioteca-amarillo", bibliotecaDir);
const headerBiblioteca = await writePair(
  "biblioteca-amarillo-header",
  bibliotecaDir,
);

await base
  .clone()
  .webp({ quality: 100, effort: 6, nearLossless: true })
  .toFile(path.join(principalDir, "biblioteca-identificador.webp"));
await base
  .clone()
  .webp({ quality: 100, effort: 6, nearLossless: true })
  .toFile(path.join(principalDir, "submarca-biblioteca-sophia.webp"));

console.log("Identificador Biblioteca exportado desde:", source.path);
console.log(
  "  Banner:",
  `${bannerTienda.width}x${bannerTienda.height}`,
  bannerTienda.webpPath,
);
console.log(
  "  Header:",
  `${headerBiblioteca.width}x${headerBiblioteca.height}`,
  headerBiblioteca.webpPath,
);
console.log("  Biblioteca amarillo:", bannerBiblioteca.webpPath);
