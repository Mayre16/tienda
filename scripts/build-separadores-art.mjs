/**
 * Compone el reverso (cara de arte) de cada separador como PNG:
 *   imagen temática (arriba) + lockup OINADOM verde con país (República Dominicana)
 *   + epígrafe (tema · autor).
 *
 * Fuente de imágenes: scripts/separadores-src/<key>.png
 * Salida: public/img/regalos/<out>.png
 *
 * Uso: npm run separadores:build
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "scripts/separadores-src");
const OUT = path.join(ROOT, "public/img/regalos");
const LOCKUP = path.join(ROOT, "public/brand/logo-oinadom.webp");

const W = 440;
const H = 1200;
const IMG_H = 760; // alto del área de imagen
const RADIUS = 24;
/** Ancho del lockup OINADOM en reverso (= proporción del frente: 160/220 del lienzo × 2). */
const LOCKUP_W = 320;

const TEAL = "#1f5a4e";
const MUTED = "#6a5c45";

const ITEMS = [
  { key: "suntzu-resultados", out: "sep-suntzu-resultados-art", caption: "El esfuerzo · Sun Tzu" },
  { key: "nervo", out: "sep-nervo-art", caption: "El destino · Amado Nervo" },
  { key: "suntzu-conocete", out: "sep-suntzu-conocete-art", caption: "Conócete a ti mismo · Sun Tzu" },
  { key: "platon", out: "sep-platon-art", caption: "La sabiduría · Platón" },
  { key: "davinci", out: "sep-davinci-art", caption: "Genio y trabajo · Leonardo Da Vinci" },
  { key: "seneca", out: "sep-seneca-art", caption: "La fortaleza · Séneca" },
];

const roundedMask = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" rx="${RADIUS}" ry="${RADIUS}" fill="#fff"/></svg>`,
);

function baseSvg(caption) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="p" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f4ecd8"/>
      <stop offset="1" stop-color="#e6d6b6"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#p)"/>
  <text x="${W / 2}" y="1120" fill="${MUTED}" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="22" text-anchor="middle">${caption}</text>
  <rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="${RADIUS - 6}" fill="none" stroke="${TEAL}" stroke-width="2" opacity="0.25"/>
</svg>`);
}

async function build() {
  if (!fs.existsSync(LOCKUP)) {
    console.error("Falta lockup:", LOCKUP);
    process.exit(1);
  }

  const lockupResized = await sharp(LOCKUP)
    .resize({ width: LOCKUP_W, kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();
  const lockupMeta = await sharp(lockupResized).metadata();
  const lockupLeft = Math.round((W - (lockupMeta.width ?? 200)) / 2);
  const lockupTop = 880;

  for (const item of ITEMS) {
    const srcPath = path.join(SRC, `${item.key}.png`);
    if (!fs.existsSync(srcPath)) {
      console.warn("Falta fuente:", srcPath);
      continue;
    }

    const trimmed = await sharp(srcPath).trim({ threshold: 6 }).png().toBuffer();
    const art = await sharp(trimmed)
      .resize(W, IMG_H, { fit: "cover", position: "centre" })
      .png()
      .toBuffer();

    const composed = await sharp(baseSvg(item.caption))
      .composite([
        { input: art, top: 0, left: 0 },
        { input: lockupResized, top: lockupTop, left: lockupLeft },
      ])
      .png()
      .toBuffer();

    const final = await sharp(composed)
      .composite([{ input: roundedMask, blend: "dest-in" }])
      .png()
      .toFile(path.join(OUT, `${item.out}.png`));

    console.log("Reverso:", `${item.out}.png`, `${final.width}x${final.height}`);
  }
}

build();
