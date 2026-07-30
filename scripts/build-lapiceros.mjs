/**
 * Publica lapiceros-virtudes desde la imagen maestra (virtudes cardinales grabadas).
 * negro Prudencia · rojo Fortaleza · azul Templanza · verde Justicia
 * Uso: npm run lapiceros:build
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "scripts/regalos-src/lapiceros-base.png");
const OUT = path.join(ROOT, "public/img/regalos/lapiceros-virtudes.png");

if (!fs.existsSync(SRC)) {
  console.error(`Falta imagen maestra: ${SRC}`);
  process.exit(1);
}

fs.copyFileSync(SRC, OUT);
const meta = await sharp(OUT).metadata();
const webpOut = OUT.replace(/\.png$/i, ".webp");
await sharp(OUT).webp({ quality: 82, effort: 4 }).toFile(webpOut);

const kb = (p) => Math.round(fs.statSync(p).size / 1024);
console.log(`Lapiceros OK → ${OUT} (${meta.width}x${meta.height})`);
console.log(`  PNG ${kb(OUT)}KB · WebP ${kb(webpOut)}KB`);
