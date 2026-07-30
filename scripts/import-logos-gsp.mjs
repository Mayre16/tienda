/**
 * Importa logos.gsp → intenta SVG, luego regenera identificador Editorial.
 *
 * Graphtec guarda vectores en .gsp/.gsd. Para máxima calidad, exporta también
 * logos.svg desde Graphtec Pro Studio (Archivo → Guardar como → SVG) junto al .gsp.
 *
 * Uso: npm run logos:import
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const MONO = path.join(ROOT, "..");
const GSP = path.join(MONO, "logos.gsp");
const SVG_OUT = path.join(MONO, "logos-from-gsp.svg");

if (!fs.existsSync(GSP)) {
  console.error("No se encontró logos.gsp en la raíz del monorepo.");
  process.exit(1);
}

const preferred = [
  path.join(MONO, "logos.svg"),
  path.join(MONO, "logos.png"),
];

const existing = preferred.find((p) => fs.existsSync(p));
if (existing) {
  console.log("Usando fuente vectorial/raster de alta resolución:", existing);
} else {
  const py = spawnSync(
    "python",
    [path.join(ROOT, "scripts/gsd-to-svg.py"), GSP, SVG_OUT],
    { encoding: "utf8" },
  );
  if (py.status === 0 && fs.existsSync(SVG_OUT)) {
    console.log("SVG generado desde GSP:", SVG_OUT);
  } else {
    console.warn(
      "No se pudo convertir logos.gsp automáticamente.",
    );
    console.warn(
      "Exporta logos.svg desde Graphtec Pro Studio y colócalo en la raíz del monorepo.",
    );
    if (py.stderr) console.warn(py.stderr.trim());
  }
}

spawnSync("npm", ["run", "identificador:export"], {
  cwd: ROOT,
  stdio: "inherit",
  shell: true,
});

spawnSync("npm", ["run", "identificador:header"], {
  cwd: ROOT,
  stdio: "inherit",
  shell: true,
});
