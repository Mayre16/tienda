/**
 * Completa la "S" truncada del identificador Editorial Logos.
 * Usa Montserrat Black embebida (base64) para que librsvg la renderice.
 *
 * Uso: node scripts/fix-editorial-logos-s.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ID = path.join(ROOT, "public/brand/identificadores");
const SRC = path.join(ID, "editorial-identificador.png");
const FONT_DIR = path.join(ROOT, "scripts/_fonts");
const FONT = path.join(FONT_DIR, "Montserrat-Black.ttf");

function download(url, dest) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          file.close();
          try {
            fs.unlinkSync(dest);
          } catch {
            /* ignore */
          }
          download(res.headers.location, dest).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve()));
      })
      .on("error", reject);
  });
}

if (!fs.existsSync(FONT) || fs.statSync(FONT).size < 1000) {
  console.log("Downloading Montserrat-Black…");
  await download(
    "https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf/Montserrat-Black.ttf",
    FONT,
  );
}

const fontB64 = fs.readFileSync(FONT).toString("base64");
const meta = await sharp(SRC).metadata();
const width = meta.width ?? 2404;
const height = meta.height ?? 414;

// Zona S truncada → cubrir y redibujar completa (~ancho de las O = ~118px)
const sStart = 2212;
const baseline = 321;
const fontSize = 126;

const svg = Buffer.from(
  `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style type="text/css"><![CDATA[
      @font-face {
        font-family: "MontserratBlack";
        src: url("data:font/ttf;base64,${fontB64}");
      }
    ]]></style>
  </defs>
  <rect x="${sStart}" y="184" width="${width - sStart}" height="160" fill="#ed7e2a"/>
  <text x="${sStart + 2}" y="${baseline}"
    font-family="MontserratBlack"
    font-size="${fontSize}"
    fill="#ffffff">S</text>
</svg>`,
);

const overlay = await sharp(svg).png().toBuffer();
// Sanity: overlay must have white pixels
{
  const { data, info } = await sharp(overlay)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let white = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i] > 220 && data[i + 1] > 220 && data[i + 2] > 220) white++;
  }
  console.log("overlay white pixels:", white);
  if (white < 500) {
    throw new Error("Font overlay failed — S not rendered");
  }
}

const pngBuf = await sharp(SRC)
  .composite([{ input: overlay, blend: "over" }])
  .png({ compressionLevel: 9 })
  .toBuffer();

const targets = [
  ["editorial-identificador.png", { png: true }],
  ["editorial-identificador.webp", { webp: true }],
  ["editorial-identificador-header.png", { png: true }],
  ["editorial-identificador-header.webp", { webp: true }],
];

for (const [name, how] of targets) {
  const out = path.join(ID, name);
  if (how.png) await sharp(pngBuf).png({ compressionLevel: 9 }).toFile(out);
  else
    await sharp(pngBuf)
      .webp({ quality: 100, effort: 6, nearLossless: true })
      .toFile(out);
}

const preview = path.join(ROOT, "scripts/_fix-s-preview.png");
await sharp(pngBuf)
  .extract({ left: 1980, top: 140, width: width - 1980, height: 240 })
  .png()
  .toFile(preview);

const { data, info } = await sharp(pngBuf)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
let rightmost = -1;
for (let x = info.width - 1; x >= 0; x--) {
  for (let y = 190; y < 330; y++) {
    const o = (y * info.width + x) * info.channels;
    if (data[o] > 210 && data[o + 1] > 210 && data[o + 2] > 210) {
      rightmost = x;
      break;
    }
  }
  if (rightmost >= 0) break;
}
console.log("rightmost ink", rightmost, "pad", info.width - 1 - rightmost);
console.log("preview", preview);
