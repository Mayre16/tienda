/**
 * Exporta el identificador oficial Editorial Logos a PNG y WebP (banner naranja completo).
 *
 * Fuentes (prioridad):
 *  1. editorial-logos.png — captura Silhouette / Snipping Tool (alta resolución)
 *  2. logos.svg / logos.png — exportados desde Graphtec Pro Studio
 *  3. EDITORIAL-IDENTIFICADOR.* en la raíz del monorepo
 *
 * Uso: npm run identificador:export
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const MONO = path.join(ROOT, "..");
const OUT = path.join(ROOT, "public/brand/identificadores");
const PRINCIPAL_OUT = path.join(MONO, "principal/public/brand/identificadores");
const ORANGE = { r: 237, g: 126, b: 42 }; // #ed7e2a

const sources = [
  { path: path.join(MONO, "editorial-logos.png"), kind: "raster", asIs: true },
  { path: path.join(MONO, "logos.svg"), kind: "svg" },
  { path: path.join(MONO, "logos.png"), kind: "raster" },
  { path: path.join(MONO, "logos-from-gsp.svg"), kind: "svg" },
  { path: path.join(MONO, "EDITORIAL-IDENTIFICADOR.webp"), kind: "raster" },
  { path: path.join(MONO, "EDITORIAL-IDENTIFICADOR.jpg"), kind: "raster" },
  { path: path.join(MONO, "EDITORIAL-IDENTIFICADOR.png"), kind: "raster" },
  { path: path.join(OUT, "editorial-identificador-source.png"), kind: "raster" },
];

const source = sources.find((item) => fs.existsSync(item.path));
if (!source) {
  console.error("No se encontró el identificador oficial Editorial.");
  console.error(
    "Coloca editorial-logos.png (Silhouette) o EDITORIAL-IDENTIFICADOR.jpg en la raíz.",
  );
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PRINCIPAL_OUT, { recursive: true });

function detectInset(data, width, height, channels) {
  const isLight = (o) => data[o + 2] > 90;
  const offset = (x, y) => (y * width + x) * channels;
  const limit = Math.floor(Math.min(width, height) / 2);
  let insetTop = 0;
  let insetBottom = 0;
  let insetLeft = 0;
  let insetRight = 0;

  for (let y = 0; y < limit; y++) {
    let light = false;
    for (let x = 0; x < width && !light; x++) if (isLight(offset(x, y))) light = true;
    if (!light) {
      insetTop = y;
      break;
    }
  }
  for (let y = 0; y < limit; y++) {
    let light = false;
    for (let x = 0; x < width && !light; x++)
      if (isLight(offset(x, height - 1 - y))) light = true;
    if (!light) {
      insetBottom = y;
      break;
    }
  }
  for (let x = 0; x < limit; x++) {
    let light = false;
    for (let y = 0; y < height && !light; y++) if (isLight(offset(x, y))) light = true;
    if (!light) {
      insetLeft = x;
      break;
    }
  }
  for (let x = 0; x < limit; x++) {
    let light = false;
    for (let y = 0; y < height && !light; y++)
      if (isLight(offset(width - 1 - x, y))) light = true;
    if (!light) {
      insetRight = x;
      break;
    }
  }

  return Math.max(insetTop, insetBottom, insetLeft, insetRight, 2);
}

/** PNG ya recortado en Silhouette — exportar sin reprocesar fondo ni bordes. */
async function exportEditorialLogosAsIs(inputPath) {
  return sharp(inputPath);
}

async function cropBannerSnip(input) {
  const trimmed = await sharp(input).trim({ threshold: 10 }).png().toBuffer();
  return knockOutEditorialBackground(trimmed).then((img) =>
    img.flatten({ background: ORANGE }),
  );
}

/** Captura Silhouette sin recorte previo: quita bordes y fondo blanco/gris → transparente. */
async function knockOutEditorialBackground(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const out = Buffer.from(data);

  const isOrange = (r, g, b) => r > 165 && g > 70 && g < 175 && b < 95 && r > g + 20;
  const isContent = (r, g, b, a) => {
    if (a < 16) return false;
    if (isOrange(r, g, b)) return true;
    const lum = (r + g + b) / 3;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    if (sat > 28) return true;
    if (lum < 195) return true;
    return false;
  };

  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const a = channels > 3 ? data[o + 3] : 255;
    if (!isContent(r, g, b, a)) {
      if (channels > 3) out[o + 3] = 0;
    }
  }

  return sharp(out, { raw: { width, height, channels } })
    .trim({ threshold: 1 })
    .sharpen({ sigma: 0.35, m1: 0.35, m2: 0.15 });
}

async function cropBannerRaster(input) {
  const meta = await sharp(input).metadata();
  const srcWidth = meta.width ?? 0;
  const preScale = srcWidth >= 1200 ? 1 : 2;
  const pre = await sharp(input)
    .resize({
      height: Math.round((meta.height ?? 414) * preScale),
      kernel: sharp.kernel.lanczos3,
    })
    .toBuffer();

  const trimmed = await sharp(pre).trim({ threshold: 12 }).toBuffer();
  const { data, info } = await sharp(trimmed)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const inset = detectInset(data, width, height, channels);

  return sharp(trimmed)
    .extract({
      left: inset,
      top: inset,
      width: width - inset * 2,
      height: height - inset * 2,
    })
    .flatten({ background: ORANGE })
    .sharpen({ sigma: 0.6, m1: 0.5, m2: 0.25 });
}

async function cropBannerSvg(inputPath) {
  const density = 300;
  const trimmed = await sharp(inputPath, { density })
    .trim({ threshold: 12 })
    .toBuffer();
  const { data, info } = await sharp(trimmed)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const inset = detectInset(data, width, height, channels);

  return sharp(trimmed)
    .extract({
      left: inset,
      top: inset,
      width: width - inset * 2,
      height: height - inset * 2,
    })
    .flatten({ background: ORANGE })
    .sharpen({ sigma: 0.4, m1: 0.4, m2: 0.2 });
}

const base =
  source.asIs
    ? await exportEditorialLogosAsIs(source.path)
    : source.kind === "svg"
      ? await cropBannerSvg(source.path)
      : source.snip
        ? await cropBannerSnip(source.path)
        : await cropBannerRaster(source.path);

const bannerPng = path.join(OUT, "editorial-identificador.png");
const bannerWebp = path.join(OUT, "editorial-identificador.webp");
const headerWebp = path.join(OUT, "editorial-identificador-header.webp");
const headerPng = path.join(OUT, "editorial-identificador-header.png");
const principalWebp = path.join(PRINCIPAL_OUT, "editorial-identificador.webp");
const principalSubmarcaWebp = path.join(PRINCIPAL_OUT, "submarca-editorial-logos.webp");

await base.clone().png({ compressionLevel: 9 }).toFile(bannerPng);
const webpOpts = { quality: 100, effort: 6, nearLossless: true };
await base.clone().webp(webpOpts).toFile(bannerWebp);
await base.clone().webp(webpOpts).toFile(headerWebp);
await base.clone().png({ compressionLevel: 9 }).toFile(headerPng);
await base.clone().webp(webpOpts).toFile(principalWebp);
await base.clone().webp(webpOpts).toFile(principalSubmarcaWebp);

const meta = await sharp(bannerWebp).metadata();
console.log("Identificador Editorial exportado desde:", source.path);
console.log("  WebP:", bannerWebp, `${meta.width}x${meta.height}`);
console.log("  Header:", headerWebp, `${meta.width}x${meta.height}`);
console.log("  PNG :", bannerPng);
