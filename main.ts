// Leonida Trophy Atlas: the program that hands the guide in.
//
// It copies app/ and screenshots/ into the output directory and writes
// dossier.json there with buildDossier, the make.fun dossier library.
// Run it from the repository root:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// With no MAKEFUN_OUTPUT_DIR set, it writes to /output.

import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { buildDossier } from "./vendor/makefun-frontend.min.js";

const root = resolve(process.argv[2] ?? ".");
const out = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");

mkdirSync(out, { recursive: true });
cpSync(join(root, "app"), join(out, "app"), { recursive: true });
cpSync(join(root, "screenshots"), join(out, "screenshots"), { recursive: true });

const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 3, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});

writeFileSync(join(out, "dossier.json"), dossier);
console.log("wrote " + join(out, "dossier.json") + " (" + dossier.length + " bytes)");
