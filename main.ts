// Leonida Trophy Atlas: the program that hands the guide in.
//
// It copies app/ and screenshots/ into the output directory and writes
// dossier.json there with buildDossier, the make.fun dossier library.
// Run it from the repository root:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// With no MAKEFUN_OUTPUT_DIR set, it writes to /output.
//
// The guide lives beside this file, not in whatever folder you happen to
// run node from. The grader runs `node /bot/main.ts` from its own folder,
// so the root comes from this file's own path, never the working folder.

import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.min.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

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
