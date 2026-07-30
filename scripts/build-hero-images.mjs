/**
 * Genera imágenes hero en /public/img/hero/ desde portadas del catálogo.
 * Uso: npm run hero:build
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const covers = path.join(root, "public", "uploads", "bookstore_covers");
const outDir = path.join(root, "public", "img", "hero");

const HEROES = [
  {
    slug: "libros-1",
    from: "filosofia-para-vivir.webp",
    w: 960,
    h: 640,
  },
  {
    slug: "libros-2",
    from: "el-alquimista.webp",
    w: 960,
    h: 640,
  },
  {
    slug: "taller-libros",
    from: "que-hacemos-corazon-mente.webp",
    w: 960,
    h: 640,
  },
];

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  for (const item of HEROES) {
    const src = path.join(covers, item.from);
    if (!fs.existsSync(src)) {
      console.warn("SKIP (no cover):", item.from);
      continue;
    }
    const webp = path.join(outDir, `${item.slug}.webp`);
    const jpg = path.join(outDir, `${item.slug}.jpg`);
    await sharp(src)
      .resize(item.w, item.h, {
        fit: "cover",
        position: "centre",
        background: { r: 255, g: 255, b: 255 },
      })
      .webp({ quality: 85 })
      .toFile(webp);
    await sharp(webp).jpeg({ quality: 88, mozjpeg: true }).toFile(jpg);
    console.log(`OK ${item.slug}.webp`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
