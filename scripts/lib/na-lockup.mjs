/**
 * Lockup OINA — anagrama + «NUEVA ACRÓPOLIS» + banda país (guía v01/2025).
 * Usa logo-oinadom completo; fondo blanco → transparente (crema / color).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

export const REF_W = 307;
export const REF_SUB = 41;
export const STACKED_H_RATIO = 1113 / 2429;
export const SUB_BAND_H_RATIO = 461 / 2429;
export const GREEN = "#086357";
export const GREY = "#707070";
export const GREY_ON_DARK = "#d8d8d8";

export const DESCRIPTORS = {
  oinadom: "REPÚBLICA DOMINICANA",
  oina: "ORGANIZACIÓN INTERNACIONAL",
  escuela: "ESCUELA DE FILOSOFÍA",
  trilogo: "FILOSOFÍA • CULTURA • VOLUNTARIADO",
};

export function descriptorColor(_background = "light") {
  return GREY;
}

/** Solo blanco puro del PNG; no tocar antialiasing verde/gris del logo. */
async function knockOutWhite(pngBuf) {
  const { data, info } = await sharp(pngBuf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < info.width * info.height; i++) {
    const o = i * 4;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const isGreen = g > r + 12 && g > b + 8 && g > 70;
    const isGrey = Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && r > 55 && r < 200;
    if (isGreen || isGrey) continue;
    if (r >= 252 && g >= 252 && b >= 250) {
      data[o + 3] = 0;
    }
  }

  return sharp(Buffer.from(data), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 1 })
    .png()
    .toBuffer();
}

const DEFAULT_OINADOM = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../public/brand/logo-oinadom.webp",
);

/**
 * Lockup vertical completo (anagrama + wordmark + cuadro país).
 * @param {object} opts
 * @param {string} [opts.oinadomPath]
 * @param {number} [opts.width=300]
 */
export async function buildStackedLockupBuffer(opts = {}) {
  const { oinadomPath = DEFAULT_OINADOM, width = 300 } = opts;
  const resized = await sharp(oinadomPath).resize({ width }).png().toBuffer();
  // WebP importado (kit OINADOM) ya trae α; knockOutWhite daña el wordmark gris.
  if (/\.webp$/i.test(oinadomPath)) {
    return resized;
  }
  return knockOutWhite(resized);
}

/** Lockup solo stacked (sin banda país). */
export async function buildTopMarkBuffer(stackedPath, width = 300) {
  const resized = await sharp(stackedPath).resize({ width }).png().toBuffer();
  return knockOutWhite(resized);
}

/** @deprecated */
export async function measureWordmarkBounds(_a, targetWidth) {
  return { minX: 0, maxX: targetWidth, width: targetWidth, centerX: targetWidth / 2 };
}

/** @deprecated */
export async function measureWordmarkTextWidth(_a, targetWidth) {
  return Math.round(targetWidth * 0.88);
}

/** @deprecated */
export function lockupLayout(width, stackedHeight = 0) {
  const scale = width / REF_W;
  return {
    width,
    subH: Math.round(stackedHeight * (461 / 1113)) || Math.round(REF_SUB * scale),
    fontSize: Math.round(11.5 * scale),
    textY: 0,
  };
}
