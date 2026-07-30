/**
 * Compone las camisetas: base (IA) + cita/título incrustado con tipografía nítida.
 * Recorta a cuadrado para la tarjeta de producto.
 *
 * Uso: npm run camisetas:build
 */
import path from "node:path";
import fs from "node:fs";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "scripts/regalos-src");
const OUT = path.join(ROOT, "public/img/regalos");

// Recorte cuadrado centrado en la camiseta (base 1536x1024).
const CROP = { left: 256, top: 0, width: 1024, height: 1024 };

const FONTS = {
  serif: "Georgia, 'Times New Roman', serif",
  script: "'Segoe Script', 'Brush Script MT', 'Comic Sans MS', cursive",
  impact: "Impact, 'Arial Narrow', 'Arial Black', sans-serif",
  sans: "Arial, sans-serif",
};

const FUERZAS = path.join(SRC, "fuerzas-vivas");

/** Pecho izquierdo (vista frontal plana) — tamaño bolsillo. */
const EMBLEM_POCKET = { left: 395, top: 305, width: 128 };

const ITEMS = [
  {
    key: "socrates",
    out: "camiseta-socrates",
    texts: [
      { t: "«Solo sé que", x: 660, y: 652, s: 42, font: "serif", style: "italic", weight: 700, fill: "#2f2b26" },
      { t: "no sé nada.»", x: 660, y: 698, s: 42, font: "serif", style: "italic", weight: 700, fill: "#2f2b26" },
      { t: "— Sócrates", x: 660, y: 748, s: 30, font: "sans", style: "italic", weight: 400, fill: "#4a443c" },
    ],
  },
  {
    key: "negra",
    out: "camiseta-platon",
    texts: [
      { t: "La medida de un hombre", x: 768, y: 372, s: 38, font: "script", weight: 400, fill: "#f5f3ec" },
      { t: "es aquello que lo hace feliz.", x: 768, y: 430, s: 38, font: "script", weight: 400, fill: "#f5f3ec" },
      { t: "— Platón", x: 905, y: 502, s: 40, font: "script", weight: 400, fill: "#f5f3ec" },
    ],
  },
  {
    key: "metaphysica",
    out: "camiseta-metaphysica",
    metaphysicaTitle: true,
  },
  {
    key: "fuerza-cisne",
    out: "camiseta-fuerza-cisne",
    base: "socrates",
    emblem: path.join(FUERZAS, "cisne.svg"),
    ...EMBLEM_POCKET,
  },
  {
    key: "fuerza-leon",
    out: "camiseta-fuerza-leon",
    base: "negra",
    emblem: path.join(FUERZAS, "leon.svg"),
    ...EMBLEM_POCKET,
  },
  {
    key: "fuerza-hacha",
    out: "camiseta-fuerza-hacha",
    base: "negra",
    emblem: path.join(FUERZAS, "hacha.svg"),
    left: 400,
    top: 298,
    width: 118,
  },
];

function svgFor(item) {
  const parts = item.texts.map((tx) => {
    const style = tx.style ? `font-style="${tx.style}" ` : "";
    const spacing = tx.spacing ? `letter-spacing="${tx.spacing}" ` : "";
    return `<text x="${tx.x}" y="${tx.y}" fill="${tx.fill}" font-family="${FONTS[tx.font]}" font-size="${tx.s}" font-weight="${tx.weight}" ${style}${spacing}text-anchor="middle">${tx.t}</text>`;
  });
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024">${parts.join("")}</svg>`,
  );
}

async function writeWebp(pngPath) {
  const webpPath = pngPath.replace(/\.png$/i, ".webp");
  await sharp(pngPath).webp({ quality: 86, effort: 4 }).toFile(webpPath);
}

/** Quita el fondo oscuro del arte de catálogo (PNG con negro ~#111). */
async function darkBgToAlpha(buffer, { threshold = 38 } = {}) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const lum = Math.max(data[i], data[i + 1], data[i + 2]);
    if (lum <= threshold) data[i + 3] = 0;
  }
  return sharp(data, { raw: info }).png().toBuffer();
}

/** Quita marcas de registro (X, cruces) del arte Metaphysica. */
function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function eraseDiagonalGuideStrips(data, width, height) {
  const lines = [
    [
      [0.25, 0.43],
      [0.75, 0.92],
    ],
    [
      [0.75, 0.43],
      [0.25, 0.92],
    ],
  ];
  const strip = 6;
  const out = Buffer.from(data);
  for (const [[x1n, y1n], [x2n, y2n]] of lines) {
    const x1 = x1n * width;
    const y1 = y1n * height;
    const x2 = x2n * width;
    const y2 = y2n * height;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (inMetaphysicaBustArea(x, y, width, height)) continue;
        if (distToSegment(x, y, x1, y1, x2, y2) > strip) continue;
        const i = (y * width + x) * 4;
        const lum = Math.max(data[i], data[i + 1], data[i + 2]);
        if (lum > 55) continue;
        out[i] = 0;
        out[i + 1] = 0;
        out[i + 2] = 0;
      }
    }
  }
  return out;
}

function inMetaphysicaBustArea(x, y, width, height) {
  const nx = x / width;
  const ny = y / height;
  const boxes = [
    [0.1, 0.4, 0.48, 0.68],
    [0.52, 0.4, 0.9, 0.68],
    [0.1, 0.68, 0.48, 0.95],
    [0.52, 0.68, 0.9, 0.95],
  ];
  return boxes.some(
    ([x0, y0, x1, y1]) => nx >= x0 && nx <= x1 && ny >= y0 && ny <= y1,
  );
}

function removeTitleGuideMarks(data, width, height) {
  const out = Buffer.from(data);
  const y1 = Math.round(height * 0.3);
  const R = 3;
  for (let y = 0; y < y1; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const lum = Math.max(data[i], data[i + 1], data[i + 2]);
      const sat =
        Math.max(data[i], data[i + 1], data[i + 2]) -
        Math.min(data[i], data[i + 1], data[i + 2]);
      if (lum < 90 || lum > 245 || sat > 18) continue;
      const neighbors = [];
      for (let dy = -R; dy <= R; dy++) {
        for (let dx = -R; dx <= R; dx++) {
          if (!dx && !dy) continue;
          const ni = ((y + dy) * width + (x + dx)) * 4;
          neighbors.push(Math.max(data[ni], data[ni + 1], data[ni + 2]));
        }
      }
      const mean = neighbors.reduce((a, b) => a + b, 0) / neighbors.length;
      if (mean < 170) continue;
      neighbors.sort((a, b) => a - b);
      const med = neighbors[Math.floor(neighbors.length / 2)];
      if (lum < med + 8) continue;
      const v = Math.round(med);
      out[i] = v;
      out[i + 1] = v;
      out[i + 2] = v;
    }
  }
  return out;
}

function removeMetaphysicaWatermarks(data, width, height) {
  let cur = Buffer.from(data);
  const R = 6;

  for (let pass = 0; pass < 2; pass++) {
    const out = Buffer.from(cur);
    for (let y = R; y < height - R; y++) {
      for (let x = R; x < width - R; x++) {
        const i = (y * width + x) * 4;
        const lum = Math.max(cur[i], cur[i + 1], cur[i + 2]);
        const sat =
          Math.max(cur[i], cur[i + 1], cur[i + 2]) -
          Math.min(cur[i], cur[i + 1], cur[i + 2]);
        if (lum < 35 || lum > 248 || sat > 18) continue;
        let dark = 0;
        let total = 0;
        for (let dy = -R; dy <= R; dy++) {
          for (let dx = -R; dx <= R; dx++) {
            if (!dx && !dy) continue;
            total++;
            const ni = ((y + dy) * width + (x + dx)) * 4;
            if (Math.max(cur[ni], cur[ni + 1], cur[ni + 2]) < 32) dark++;
          }
        }
        if (dark / total > 0.5) {
          out[i] = 0;
          out[i + 1] = 0;
          out[i + 2] = 0;
        }
      }
    }
    cur = out;
  }

  const peakR = 3;
  for (let pass = 0; pass < 3; pass++) {
    const out = Buffer.from(cur);
    for (let y = peakR; y < height - peakR; y++) {
      for (let x = peakR; x < width - peakR; x++) {
        const i = (y * width + x) * 4;
        const lum = Math.max(cur[i], cur[i + 1], cur[i + 2]);
        const sat =
          Math.max(cur[i], cur[i + 1], cur[i + 2]) -
          Math.min(cur[i], cur[i + 1], cur[i + 2]);
        if (lum < 175 || lum > 252 || sat > 22) continue;
        const neighbors = [];
        let isPeak = true;
        for (let dy = -peakR; dy <= peakR; dy++) {
          for (let dx = -peakR; dx <= peakR; dx++) {
            if (!dx && !dy) continue;
            const ni = ((y + dy) * width + (x + dx)) * 4;
            const l = Math.max(cur[ni], cur[ni + 1], cur[ni + 2]);
            neighbors.push(l);
            if (l >= lum) isPeak = false;
          }
        }
        const mean = neighbors.reduce((a, b) => a + b, 0) / neighbors.length;
        if (!isPeak || lum < mean + 12) continue;
        neighbors.sort((a, b) => a - b);
        const v = Math.round(neighbors[Math.floor(neighbors.length / 2)]);
        out[i] = v;
        out[i + 1] = v;
        out[i + 2] = v;
      }
    }
    cur = out;
  }

  for (let pass = 0; pass < 2; pass++) {
    const out = Buffer.from(cur);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;
        const lum = Math.max(cur[i], cur[i + 1], cur[i + 2]);
        const sat =
          Math.max(cur[i], cur[i + 1], cur[i + 2]) -
          Math.min(cur[i], cur[i + 1], cur[i + 2]);
        if (lum < 38 || lum > 100 || sat > 20) continue;
        let darkCard = 0;
        for (const [dx, dy] of [
          [0, -1],
          [0, 1],
          [-1, 0],
          [1, 0],
        ]) {
          const ni = ((y + dy) * width + (x + dx)) * 4;
          if (Math.max(cur[ni], cur[ni + 1], cur[ni + 2]) < 32) darkCard++;
        }
        if (darkCard >= 2) {
          out[i] = 0;
          out[i + 1] = 0;
          out[i + 2] = 0;
        }
      }
    }
    cur = out;
  }

  const y0 = Math.round(height * 0.32);
  const y1 = Math.round(height * 0.92);
  const x0 = Math.round(width * 0.12);
  const x1 = Math.round(width * 0.88);
  const inpaintR = 4;
  for (let pass = 0; pass < 2; pass++) {
    const out = Buffer.from(cur);
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * width + x) * 4;
        const lum = Math.max(cur[i], cur[i + 1], cur[i + 2]);
        if (lum < 115 || lum > 252) continue;
        const neighbors = [];
        for (let dy = -inpaintR; dy <= inpaintR; dy++) {
          for (let dx = -inpaintR; dx <= inpaintR; dx++) {
            if (!dx && !dy) continue;
            const ni = ((y + dy) * width + (x + dx)) * 4;
            neighbors.push(Math.max(cur[ni], cur[ni + 1], cur[ni + 2]));
          }
        }
        neighbors.sort((a, b) => a - b);
        const med = neighbors[Math.floor(neighbors.length / 2)];
        if (lum > med + 16) {
          const v = Math.round(med);
          out[i] = v;
          out[i + 1] = v;
          out[i + 2] = v;
        }
      }
    }
    cur = out;
  }

  cur = eraseDiagonalGuideStrips(cur, width, height);
  cur = removeTitleGuideMarks(cur, width, height);

  return cur;
}

/** Recorta guías del arte (franjas laterales, marcas de registro). */
async function prepMetaphysicaArt(catalogPath, designWidth) {
  const { data, info } = await sharp(catalogPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const cleaned = removeMetaphysicaWatermarks(
    data,
    info.width,
    info.height,
  );
  const cleanedPng = await sharp(cleaned, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  const trimmed = await sharp(cleanedPng).trim({ threshold: 20 }).toBuffer();
  const { width, height } = await sharp(trimmed).metadata();
  const topCrop = 58;
  const sideCrop = 12;
  return sharp(trimmed)
    .extract({
      left: sideCrop,
      top: topCrop,
      width: width - sideCrop * 2,
      height: height - topCrop,
    })
    .resize({ width: designWidth, kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();
}

/** Metaphysica: camiseta negra + póster completo (título + bustos). */
async function buildMetaphysicaTee(item) {
  const basePath = path.join(SRC, "tee-base-negra.png");
  const catalogPath = path.join(SRC, "tee-metaphysica-catalog.png");
  if (!fs.existsSync(basePath)) {
    console.warn("Falta base:", basePath);
    return;
  }
  if (!fs.existsSync(catalogPath)) {
    console.warn("Falta arte catálogo:", catalogPath);
    return;
  }

  const designWidth = 520;
  const resized = await prepMetaphysicaArt(catalogPath, designWidth);
  const designLayer = await darkBgToAlpha(resized, { threshold: 65 });
  const { width: dw, height: dh } = await sharp(designLayer).metadata();
  const designLeft = 768 - Math.round(dw / 2);
  const designTop = 248;

  const composed = await sharp(basePath)
    .composite([{ input: designLayer, left: designLeft, top: designTop }])
    .png()
    .toBuffer();

  const pngOut = path.join(OUT, `${item.out}.png`);
  const out = await sharp(composed).extract(CROP).png().toFile(pngOut);
  await writeWebp(pngOut);
  console.log("Camiseta (metaphysica):", `${item.out}.png`, `${out.width}x${out.height}`);
}

async function buildEmblemTee(item) {
  const base = path.join(SRC, `tee-base-${item.base}.png`);
  if (!fs.existsSync(base)) {
    console.warn("Falta base:", base);
    return;
  }
  if (!fs.existsSync(item.emblem)) {
    console.warn("Falta emblema:", item.emblem);
    return;
  }

  const emblemBuf = await sharp(item.emblem)
    .resize({ width: item.width, kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();

  const composed = await sharp(base)
    .composite([{ input: emblemBuf, left: item.left, top: item.top }])
    .png()
    .toBuffer();

  const pngOut = path.join(OUT, `${item.out}.png`);
  const out = await sharp(composed).extract(CROP).png().toFile(pngOut);
  await writeWebp(pngOut);
  console.log("Camiseta (emblema):", `${item.out}.png`, `${out.width}x${out.height}`);
}

async function build() {
  for (const item of ITEMS) {
    if (item.emblem) {
      await buildEmblemTee(item);
      continue;
    }

    if (item.metaphysicaTitle) {
      await buildMetaphysicaTee(item);
      continue;
    }

    if (item.catalogSrc) {
      const catalog = path.join(SRC, item.catalogSrc);
      if (!fs.existsSync(catalog)) {
        console.warn("Falta catálogo:", item.catalogSrc);
        continue;
      }
      const bg = item.catalogBg ?? "#ededed";
      const r = parseInt(bg.slice(1, 3), 16);
      const g = parseInt(bg.slice(3, 5), 16);
      const b = parseInt(bg.slice(5, 7), 16);
      const out = await sharp(catalog)
        .resize(1024, 1024, {
          fit: "contain",
          background: { r, g, b, alpha: 1 },
        })
        .png()
        .toFile(path.join(OUT, `${item.out}.png`));
      const pngOut = path.join(OUT, `${item.out}.png`);
      await writeWebp(pngOut);
      console.log("Camiseta (catálogo):", `${item.out}.png`, `${out.width}x${out.height}`);
      continue;
    }

    const base = path.join(SRC, `tee-base-${item.key}.png`);
    if (!fs.existsSync(base)) {
      console.warn("Falta base:", base);
      continue;
    }

    if (!item.texts?.length) {
      const pngOut = path.join(OUT, `${item.out}.png`);
      const out = await sharp(base).extract(CROP).png().toFile(pngOut);
      await writeWebp(pngOut);
      console.log("Camiseta (base):", `${item.out}.png`, `${out.width}x${out.height}`);
      continue;
    }

    const composed = await sharp(base)
      .composite([{ input: svgFor(item), top: 0, left: 0 }])
      .png()
      .toBuffer();

    const pngOut = path.join(OUT, `${item.out}.png`);
    const out = await sharp(composed)
      .extract(CROP)
      .png()
      .toFile(pngOut);

    await writeWebp(pngOut);
    console.log("Camiseta:", `${item.out}.png`, `${out.width}x${out.height}`);
  }
}

build();
