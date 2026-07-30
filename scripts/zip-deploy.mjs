/**
 * Crea ZIPs compatibles con cPanel.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");
const DEPLOY = join(ROOT, "deploy");

export function zipDeploy(baseName) {
  mkdirSync(DEPLOY, { recursive: true });
  const fullZip = join(DEPLOY, `${baseName}.zip`);
  const assetsZip = join(DEPLOY, `${baseName}-assets.zip`);
  const assetsDir = join(OUT, "na-assets");

  if (!existsSync(assetsDir)) {
    console.error("Falta out/na-assets — ejecuta prepare-cpanel-export.mjs primero.");
    process.exit(1);
  }

  function zipWithTar(zipPath, ...paths) {
    const args = ["-a", "-cf", zipPath, "-C", OUT, ...paths];
    const tar = spawnSync("tar", args, { stdio: "inherit" });
    return tar.status === 0;
  }

  if (!zipWithTar(fullZip, ".")) {
    if (process.platform !== "win32") process.exit(1);
    const ps = spawnSync(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `Compress-Archive -Path '${OUT}\\*' -DestinationPath '${fullZip}' -Force`,
      ],
      { stdio: "inherit" },
    );
    if (ps.status !== 0) process.exit(ps.status ?? 1);
  }

  if (!zipWithTar(assetsZip, "na-assets")) {
    if (process.platform !== "win32") process.exit(1);
    const ps = spawnSync(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `Compress-Archive -Path '${assetsDir}' -DestinationPath '${assetsZip}' -Force`,
      ],
      { stdio: "inherit" },
    );
    if (ps.status !== 0) process.exit(ps.status ?? 1);
  }

  return { fullZip, assetsZip };
}

if (process.argv[1]?.endsWith("zip-deploy.mjs")) {
  const name = process.argv[2] ?? "site";
  const { fullZip, assetsZip } = zipDeploy(name);
  console.log("ZIP completo:", fullZip);
  console.log("ZIP assets:  ", assetsZip);
}
