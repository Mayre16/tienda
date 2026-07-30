/**
 * Publica la foto del resaltador (sin composición): PNG fuente → WebP catálogo.
 *
 * Uso: npm run resaltador:build
 */
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = path.join(ROOT, "scripts/regalos-src/resaltador-base.png");
const OUT_PNG = path.join(ROOT, "public/img/regalos/resaltador-ideas.png");
const OUT_WEBP = path.join(ROOT, "public/img/regalos/resaltador-ideas.webp");

async function build() {
  const meta = await sharp(BASE).metadata();
  await sharp(BASE).png().toFile(OUT_PNG);
  await sharp(OUT_PNG)
    .webp({ quality: 86, effort: 4, alphaQuality: 90 })
    .toFile(OUT_WEBP);

  console.log(
    "Resaltador:",
    `${meta.width ?? "?"}x${meta.height ?? "?"}`,
    "→",
    OUT_WEBP,
  );
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
