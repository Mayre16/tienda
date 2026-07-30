/**
 * Tras `next build` (output: export):
 * - Renombra out/_next → out/na-assets
 * - Actualiza referencias /_next/ → /na-assets/
 * - Parchea .htaccess
 *
 * Uso: node scripts/prepare-cpanel-export.mjs
 */
import {
  existsSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");
const FROM = join(OUT, "_next");
const TO = join(OUT, "na-assets");

const TEXT_EXT = new Set([
  ".html",
  ".js",
  ".css",
  ".txt",
  ".json",
  ".xml",
  ".webmanifest",
  ".htaccess",
]);

function walk(dir, cb) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, cb);
    else cb(full);
  }
}

function countFiles(dir) {
  if (!existsSync(dir)) return 0;
  let n = 0;
  walk(dir, () => {
    n += 1;
  });
  return n;
}

if (!existsSync(FROM)) {
  console.error("No existe out/_next — ejecuta next build antes.");
  process.exit(1);
}

if (existsSync(TO)) {
  console.error("Ya existe out/na-assets — limpia out/ y vuelve a construir.");
  process.exit(1);
}

renameSync(FROM, TO);
console.log("Renombrado: _next/ → na-assets/");

let patched = 0;
walk(OUT, (file) => {
  const ext = file.slice(file.lastIndexOf(".")).toLowerCase();
  const base = file.slice(file.lastIndexOf("\\") + 1);
  if (!TEXT_EXT.has(ext) && base !== ".htaccess") return;

  const raw = readFileSync(file, "utf8");
  if (!raw.includes("/_next/") && !raw.includes("_next/")) return;

  writeFileSync(file, raw.replaceAll("/_next/", "/na-assets/"), "utf8");
  patched += 1;
});
console.log(`Referencias actualizadas en ${patched} archivo(s).`);

const htaccess = join(OUT, ".htaccess");
if (existsSync(htaccess)) {
  let rules = readFileSync(htaccess, "utf8");
  rules = rules.replace(/^\s*RewriteRule \^_next\/ - \[L\]\s*\n/m, "");
  if (!rules.includes("RewriteRule ^na-assets/")) {
    rules = rules.replace(
      /^\s*RewriteRule \^\(vendor\|node_modules[^\n]+\n/m,
      (line) =>
        `${line}  RewriteRule ^na-assets/ - [L]\n  RewriteRule ^_next/(.*)$ na-assets/$1 [L]\n`,
    );
  }
  writeFileSync(htaccess, rules, "utf8");
  console.log("Actualizado: out/.htaccess");
}

const assetCount = countFiles(TO);
const cssCount = countFiles(join(TO, "static", "css"));
const chunkCount = countFiles(join(TO, "static", "chunks"));

console.log("");
console.log(`na-assets/: ${assetCount} archivo(s)`);
console.log(`  css/: ${cssCount}  chunks/: ${chunkCount}`);

if (assetCount < 10 || cssCount < 1 || chunkCount < 5) {
  console.error("Export incompleto — revisa el build.");
  process.exit(1);
}

console.log("Listo para ZIP/cPanel.");
