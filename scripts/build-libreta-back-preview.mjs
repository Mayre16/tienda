/**
 * Vista previa contraportada libreta: foto IA + lockup OINA real (~10% más pequeño).
 * Uso: node scripts/build-libreta-back-preview.mjs [ruta-base.png]
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { buildStackedLockupBuffer } from "./lib/na-lockup.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_BASE = path.join(
  ROOT,
  "scripts/regalos-src/libreta-back-base.png",
);
const OUT = path.join(ROOT, "public/img/regalos/libreta-back-preview.png");

/** 280 en build-libretas.mjs → ~10% menos */
const LOCKUP_WIDTH = 252;

async function main() {
  const basePath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_BASE;
  if (!fs.existsSync(basePath)) {
    console.error(`Falta imagen base: ${basePath}`);
    process.exit(1);
  }

  const meta = await sharp(basePath).metadata();
  const width = meta.width ?? 1024;
  const height = meta.height ?? 1024;

  const lockupBuf = await buildStackedLockupBuffer({ width: LOCKUP_WIDTH });
  const lockupMeta = await sharp(lockupBuf).metadata();
  const lw = lockupMeta.width ?? LOCKUP_WIDTH;
  const lh = lockupMeta.height ?? 0;

  // Espiral a la derecha: centro de la tapa crema (libreta ~centrada en encuadre)
  const coverCenterX = Math.round(width * 0.46);
  const lockupLeft = coverCenterX - Math.round(lw / 2);
  const bottomPad = Math.max(48, Math.round(height * 0.095));
  const lockupTop = height - lh - bottomPad;

  await sharp(basePath)
    .composite([{ input: lockupBuf, top: lockupTop, left: lockupLeft }])
    .png()
    .toFile(OUT);

  const webpOut = OUT.replace(/\.png$/i, ".webp");
  await sharp(OUT).webp({ quality: 84, effort: 4 }).toFile(webpOut);

  console.log(`Contraportada preview → ${OUT}`);
  console.log(`  WebP → ${webpOut}`);
  console.log(`  Lockup ${LOCKUP_WIDTH}px · espiral derecha`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
