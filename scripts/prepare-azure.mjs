import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { execFileSync } from "node:child_process";

// Package from an explicit allowlist: never include .env, database files or credentials.
const root = resolve(import.meta.dirname, "..");
const output = join(root, ".deploy");
const stage = await mkdtemp(join(tmpdir(), "entrenarme-azure-"));
try {
  await mkdir(output, { recursive: true });
  await cp(join(root, "server"), join(stage, "server"), {
    recursive: true,
    filter: (path) =>
      ![join(root, "server/data"), join(root, "server/test")].some(
        (excluded) => path === excluded || path.startsWith(`${excluded}/`),
      ),
  });
  await mkdir(join(stage, "src"));
  await cp(join(root, "src/catalog.js"), join(stage, "src/catalog.js"));
  await cp(join(root, "package-lock.json"), join(stage, "package-lock.json"));
  const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  // Oryx installs dependencies, but this API-only archive needs no Vite build.
  pkg.scripts = {
    start: "node server/index.js",
    "db:check": "node server/cli.js check",
    "db:migrate": "node server/cli.js migrate",
    "db:seed": "node server/cli.js seed",
    "bank:import": "node server/cli.js import",
  };
  await writeFile(
    join(stage, "package.json"),
    `${JSON.stringify(pkg, null, 2)}\n`,
  );
  const archive = join(output, "entrenarme-api.zip");
  await rm(archive, { force: true });
  execFileSync(
    "zip",
    ["-qr", archive, "package.json", "package-lock.json", "server", "src"],
    { cwd: stage },
  );
  console.log(`Backend preparado: ${archive}`);
  console.log(
    "No contiene secretos ni la base local. Azure instalará las dependencias con Oryx.",
  );
} finally {
  await rm(stage, { recursive: true, force: true });
}
