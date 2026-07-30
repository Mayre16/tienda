/**
 * Recorta bordes del identificador para header integrado (patrón Civis).
 * Conserva la curva blanca NA; elimina orillas del PNG.
 *
 * Uso: npm run identificador:header
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "public/brand/identificadores/editorial-identificador.webp");
const OUT_WEBP = path.join(
  ROOT,
  "public/brand/identificadores/editorial-identificador-header.webp",
);
const OUT_PNG = path.join(
  ROOT,
  "public/brand/identificadores/editorial-identificador-header.png",
);

/** px a recortar (borde superior/inferior/derecho del banner) */
const CROP_TOP = 2;
const CROP_RIGHT = 2;
const CROP_BOTTOM = 1;
const CROP_LEFT = 0;

if (!fs.existsSync(SRC)) {
  console.error("No se encontró el banner base. Ejecuta primero: npm run identificador:export");
  process.exit(1);
}

const meta = await sharp(SRC).metadata();
const width = meta.width - CROP_LEFT - CROP_RIGHT;
const height = meta.height - CROP_TOP - CROP_BOTTOM;

const cropped = sharp(SRC).extract({
  left: CROP_LEFT,
  top: CROP_TOP,
  width,
  height,
});

await cropped.clone().webp({ quality: 92 }).toFile(OUT_WEBP);
await cropped.clone().png({ compressionLevel: 9 }).toFile(OUT_PNG);

const outMeta = await sharp(OUT_WEBP).metadata();
console.log("Header identificador Editorial:", OUT_WEBP, `${outMeta.width}x${outMeta.height}`);
