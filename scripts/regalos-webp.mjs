/**
 * Convierte PNG/JPG estáticos a WebP (misma carpeta, mismo nombre).
 * Uso: npm run regalos:webp
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dirs = [
  path.join(root, "public", "img", "regalos"),
  path.join(root, "public", "img", "revistas"),
];

async function convertDir(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`(omitido) ${dir}`);
    return;
  }

  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(png|jpe?g)$/i.test(f) && !f.startsWith("_"));

  for (const file of files) {
    const src = path.join(dir, file);
    const dest = path.join(dir, file.replace(/\.(png|jpe?g)$/i, ".webp"));
    await sharp(src).webp({ quality: 82, effort: 4 }).toFile(dest);
    const srcKb = Math.round(fs.statSync(src).size / 1024);
    const destKb = Math.round(fs.statSync(dest).size / 1024);
    console.log(`${path.relative(root, src)} → ${srcKb}KB → ${destKb}KB`);
  }
}

async function main() {
  for (const dir of dirs) {
    console.log(`\n${path.relative(root, dir)}`);
    await convertDir(dir);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
