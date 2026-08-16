/**
 * Rattrape le code ECO / nom d'ouverture des parties importées AVANT que
 * `analyse-game.ts` ne les calcule à l'import (voir `server/import/openings.ts`
 * pour la même logique de détection). Relit uniquement le PGN déjà en base,
 * aucune ré-analyse moteur — un script ponctuel, pas une tâche récurrente.
 *
 *   npm run backfill:eco
 */
import { createRequire } from "node:module";
import { resolve } from "node:path";
import Database from "better-sqlite3";
import { Chess } from "chess.js";

const require = createRequire(import.meta.url);
const { eco } = require("chess-openings/dist/chess/openings/eco");

/** EPD : le FEN sans les compteurs de coups — même définition que `openings.ts`. */
function epdOf(fen) {
  return fen.split(" ").slice(0, 4).join(" ");
}

function findBookMove(fenAfter) {
  const entry = eco[epdOf(fenAfter)];
  return entry ? { eco: entry.eco, name: entry.name } : null;
}

const dbPath = resolve(process.cwd(), process.env.DATABASE_PATH ?? "data/chess-trainer.db");
const sqlite = new Database(dbPath);

const rows = sqlite.prepare("SELECT id, pgn FROM games WHERE pgn IS NOT NULL AND eco IS NULL").all();
console.log(`${rows.length} partie(s) sans ECO à rattraper.`);

const update = sqlite.prepare("UPDATE games SET eco = ?, opening_name = ? WHERE id = ?");

let updated = 0;
let skipped = 0;
for (const row of rows) {
  const chess = new Chess();
  try {
    chess.loadPgn(row.pgn);
  } catch {
    skipped += 1;
    continue;
  }

  // Même règle que `analyseImportedGame` : « théorique » est un préfixe
  // continu depuis le premier coup, on s'arrête au premier coup non répertorié.
  let lastMatch = null;
  for (const move of chess.history({ verbose: true })) {
    const match = findBookMove(move.after);
    if (!match) break;
    lastMatch = match;
  }

  if (lastMatch) {
    update.run(lastMatch.eco, lastMatch.name, row.id);
    updated += 1;
  } else {
    skipped += 1;
  }
}

console.log(`${updated} partie(s) mises à jour, ${skipped} sans ouverture répertoriée.`);
sqlite.close();
