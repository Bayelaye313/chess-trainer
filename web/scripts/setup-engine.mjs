/**
 * Copie les binaires Stockfish WASM du package npm vers public/engine/.
 *
 * Le glue JS de Stockfish se charge directement comme Worker classique
 * (`new Worker('/engine/stockfish-18-lite.js')`) et résout son .wasm par
 * convention de nom, à côté de lui. Le passer par le bundler casserait cette
 * résolution — d'où la copie en statique.
 *
 * Idempotent : relance à volonté (hook postinstall).
 */
import { copyFile, mkdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "stockfish", "bin");
const dest = join(root, "public", "engine");

// Builds "lite" uniquement : ~7 Mo contre ~113 Mo pour les complètes, et déjà
// très au-dessus du niveau humain. multi-thread + repli single-thread.
const FILES = [
  "stockfish-18-lite.js",
  "stockfish-18-lite.wasm",
  "stockfish-18-lite-single.js",
  "stockfish-18-lite-single.wasm",
];

const exists = (p) =>
  stat(p).then(
    () => true,
    () => false,
  );

if (!(await exists(src))) {
  console.error(
    "[setup-engine] package 'stockfish' introuvable — lance `npm install` d'abord.",
  );
  process.exit(1);
}

await mkdir(dest, { recursive: true });

for (const file of FILES) {
  await copyFile(join(src, file), join(dest, file));
}

console.log(`[setup-engine] ${FILES.length} fichiers copiés vers public/engine/`);
