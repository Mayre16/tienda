/**
 * Frente del separador (cara del mensaje): lockup NA apilado blanco, sin país.
 * El reverso con país (OINADOM) se compone en build-separadores-art.mjs.
 *
 * Uso: npm run separadores:rebrand
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMG = path.join(ROOT, "public/img/regalos");
/** NA apilado blanco — sin descriptor de país (solo frente con cita). */
const LOCKUP = path.join(ROOT, "public/brand/logo-nueva-acropolis-stacked-white.webp");

const FRONTS = [
  "sep-suntzu-resultados-msg.svg",
  "sep-nervo-msg.svg",
  "sep-suntzu-conocete-msg.svg",
  "sep-platon-msg.svg",
  "sep-davinci-msg.svg",
  "sep-seneca-msg.svg",
];

const CARD_W = 220;
/** Ancho del lockup en el frente (= proporción del OINADOM en reverso: 220/440 del lienzo). */
const LOCKUP_W = 110;

if (!fs.existsSync(LOCKUP)) {
  console.error("Falta lockup:", LOCKUP);
  process.exit(1);
}

const lockupMeta = await sharp(LOCKUP).metadata();
const aspect = (lockupMeta.width ?? 2429) / (lockupMeta.height ?? 1574);
const lockupW = LOCKUP_W;
const lockupH = Math.round(lockupW / aspect);
const lockupLeft = Math.round((CARD_W - lockupW) / 2);
const LOCKUP_TOP = 38;

const lockupBuf = await sharp(LOCKUP)
  .resize({ height: lockupH, kernel: sharp.kernel.lanczos3 })
  .png()
  .toBuffer();
const lockupDataUri = `data:image/png;base64,${lockupBuf.toString("base64")}`;

const BRAND = `<image x="${lockupLeft}" y="${LOCKUP_TOP}" width="${lockupW}" height="${lockupH}" href="${lockupDataUri}" preserveAspectRatio="xMidYMid meet"/>`;

const ANY_BRAND_IMAGE =
  /<image x="\d+" y="\d+" width="\d+" height="\d+" href="[^"]+" preserveAspectRatio="[^"]*"\/>/;

for (const name of FRONTS) {
  const file = path.join(IMG, name);
  if (!fs.existsSync(file)) {
    console.warn("Falta:", name);
    continue;
  }

  let svg = fs.readFileSync(file, "utf8");
  if (ANY_BRAND_IMAGE.test(svg)) {
    svg = svg.replace(ANY_BRAND_IMAGE, BRAND);
  } else {
    console.warn("Sin bloque de marca:", name);
    continue;
  }

  fs.writeFileSync(file, svg, "utf8");
  console.log("Marca NA (frente, sin país):", name, `${lockupW}x${lockupH}`);
}
