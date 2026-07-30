/**
 * Build de producción + ZIP para subir a cPanel (tienda.acropolis.adesa.com.do).
 *
 * Uso: npm run build:cpanel
 */
import { spawnSync } from "node:child_process";
import { existsSync, rmSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");
const NEXT = join(ROOT, ".next");
const DEPLOY = join(ROOT, "deploy");

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://tienda.acropolis.adesa.com.do";

const storeApi =
  process.env.NEXT_PUBLIC_STORE_API_URL?.trim() ||
  process.env.NEXT_PUBLIC_BIBLIOTECA_API_URL?.trim() ||
  "https://biblioteca-oina.adesa.com.do";

const cmsUrl =
  process.env.NEXT_PUBLIC_CMS_URL?.trim() ||
  "https://editor.acropolis.adesa.com.do/api";

const env = {
  ...process.env,
  NODE_ENV: "production",
  NEXT_PUBLIC_SITE_URL: siteUrl.replace(/\/$/, ""),
  NEXT_PUBLIC_STORE_API_URL: storeApi.replace(/\/$/, ""),
  NEXT_PUBLIC_BIBLIOTECA_API_URL: storeApi.replace(/\/$/, ""),
  NEXT_PUBLIC_CMS_URL: cmsUrl.replace(/\/$/, ""),
};

console.log("Build cPanel Editorial — NEXT_PUBLIC_SITE_URL =", env.NEXT_PUBLIC_SITE_URL);
console.log("  Store API:", env.NEXT_PUBLIC_STORE_API_URL);
console.log("  CMS:", env.NEXT_PUBLIC_CMS_URL);

for (const dir of [OUT, NEXT]) {
  if (existsSync(dir)) {
    console.log("Limpiando", dir.replace(ROOT, "").replace(/\\/g, "/") || "/");
    rmSync(dir, { recursive: true, force: true });
  }
}

const assetSteps = [
  ["npm", ["run", "sedes:sync"]],
  ["npm", ["run", "covers:webp"]],
  ["npm", ["run", "hero:build"]],
  ["npm", ["run", "regalos:webp"]],
  ["npm", ["run", "separadores:rebrand"]],
  ["npm", ["run", "separadores:build"]],
  ["npm", ["run", "libretas:build"]],
];

for (const [cmd, args] of assetSteps) {
  const step = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit", shell: true });
  if (step.status !== 0) process.exit(step.status ?? 1);
}

const build = spawnSync("npm", ["run", "build"], {
  cwd: ROOT,
  env,
  stdio: "inherit",
  shell: true,
});

if (build.status !== 0) process.exit(build.status ?? 1);

const prepare = spawnSync("node", ["scripts/prepare-cpanel-export.mjs"], {
  cwd: ROOT,
  stdio: "inherit",
  shell: true,
});

if (prepare.status !== 0) process.exit(prepare.status ?? 1);

mkdirSync(DEPLOY, { recursive: true });
const stamp = new Date().toISOString().slice(0, 10);
const zipBase = `acropolis-tienda-${stamp}`;

const zip = spawnSync("node", ["scripts/zip-deploy.mjs", zipBase], {
  cwd: ROOT,
  stdio: "inherit",
  shell: true,
});

if (zip.status !== 0) process.exit(zip.status ?? 1);

const zipPath = join(DEPLOY, `${zipBase}.zip`);
const assetsZipPath = join(DEPLOY, `${zipBase}-assets.zip`);

console.log("");
console.log("Listo para cPanel (public_html de tienda.acropolis.adesa.com.do):");
console.log("  1. Borra o respalda el contenido anterior de public_html");
console.log("  2. Sube y extrae:", zipPath);
console.log("     Si JS/CSS fallan, sube también:", assetsZipPath);
console.log("  3. Verifica .htaccess, brand/, img/, uploads/bookstore_covers/");
console.log("  4. Prueba la tienda y el catálogo de libros");
console.log("");
console.log("  Carpeta:", OUT);
console.log("  ZIP:     ", zipPath);
console.log("  Assets:  ", assetsZipPath);
