/**
 * Applique les migrations de `drizzle/`, clés étrangères DÉSACTIVÉES.
 *
 * Pourquoi pas `drizzle-kit migrate` : drizzle exécute toutes les migrations
 * dans UNE transaction, et better-sqlite3 active `foreign_keys` par défaut.
 * Les `PRAGMA foreign_keys=OFF` générés (sans effet dans une transaction) ne
 * protègent alors plus les tables recréées : `DROP TABLE games` déclencherait
 * les `ON DELETE CASCADE` et viderait `moves`, `puzzles`, `reviews`… (migration
 * 0019). SQLite documente la procédure inverse : clés étrangères coupées AVANT
 * la transaction, puis `PRAGMA foreign_key_check`. C'est ce que fait ce script.
 *
 * Usage : `npm run db:migrate` (DATABASE_PATH optionnel).
 */
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { resolve } from "node:path";

/** Marqueur des lignes de l'époque mono-utilisateur dans les colonnes `user_id` déjà présentes. */
const LEGACY_USER_ID = "local";

const path = resolve(process.cwd(), process.env.DATABASE_PATH ?? "data/chess-trainer.db");
const sqlite = new Database(path);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = OFF");

migrate(drizzle(sqlite), { migrationsFolder: resolve(import.meta.dirname, "../../../../drizzle") });

// Seules les lignes `user_id = 'local'` (en attente de LEGACY_CLAIM_EMAIL) peuvent
// encore pointer vers un utilisateur absent. Toute autre violation est signalée.
const unexpected = [];
const legacy = new Map();
for (const violation of sqlite.pragma("foreign_key_check")) {
  const row = violation.rowid == null ? null : sqlite.prepare(`SELECT * FROM "${violation.table}" WHERE rowid = ?`).get(violation.rowid);
  if (violation.parent === "users" && row && row.user_id === LEGACY_USER_ID) {
    legacy.set(violation.table, (legacy.get(violation.table) ?? 0) + 1);
  } else {
    unexpected.push(violation);
  }
}
sqlite.pragma("foreign_keys = ON");
sqlite.close();

console.log(`Migrations appliquées : ${path}`);
for (const [table, count] of legacy) console.log(`  ${table} : ${count} ligne(s) mono-utilisateur en attente de reprise`);
if (unexpected.length > 0) {
  console.error("Clés étrangères invalides :", unexpected);
  process.exitCode = 1;
}
