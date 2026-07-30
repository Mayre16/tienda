/**
 * Convierte portadas JPG/PNG a WebP y genera manifest.json para la tienda.
 * Uso: npm run covers:webp
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const coversDir = path.join(root, "public", "uploads", "bookstore_covers");
const bibliotecaDir = path.resolve(
  root,
  "../../Biblioteca-OINA/uploads/bookstore_covers",
);

async function convertFile(srcPath, destPath) {
  await sharp(srcPath)
    .webp({ quality: 82, effort: 4 })
    .toFile(destPath);
  const srcKb = Math.round(fs.statSync(srcPath).size / 1024);
  const destKb = Math.round(fs.statSync(destPath).size / 1024);
  return { srcKb, destKb };
}

async function processDir(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png)$/i.test(f));
  const slugs = [];

  for (const file of entries) {
    if (file.startsWith("_")) continue;
    const slug = file.replace(/\.(jpe?g|png)$/i, "");
    const srcPath = path.join(dir, file);
    const destPath = path.join(dir, `${slug}.webp`);
    if (fs.existsSync(destPath)) {
      const srcMtime = fs.statSync(srcPath).mtimeMs;
      const destMtime = fs.statSync(destPath).mtimeMs;
      if (destMtime >= srcMtime) {
        slugs.push(slug);
        continue;
      }
    }
    const { srcKb, destKb } = await convertFile(srcPath, destPath);
    slugs.push(slug);
    console.log(`  ${slug}.webp  ${srcKb}KB → ${destKb}KB`);
  }

  return slugs.sort();
}

async function main() {
  console.log("Tienda editorial — portadas WebP\n");

  const slugs = new Set();
  for (const dir of [coversDir, bibliotecaDir]) {
    if (!fs.existsSync(dir)) {
      console.log(`(omitido) ${dir}`);
      continue;
    }
    console.log(dir);
    for (const slug of await processDir(dir)) slugs.add(slug);
    console.log("");
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    slugs: [...slugs].sort(),
  };

  const manifestPath = path.join(coversDir, "manifest.json");
  fs.mkdirSync(coversDir, { recursive: true });
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`Manifest: ${manifestPath} (${manifest.slugs.length} portadas)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
