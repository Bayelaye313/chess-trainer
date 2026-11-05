/**
 * Aligne une base SQLite antérieure à 2026-11-04 sur le journal drizzle, AVANT
 * `npm run db:migrate` (voir docs/auth/audit.md §6, « Retard préexistant »).
 *
 * Contexte : la base locale n'a jamais reçu la migration 0015 (`puzzle_purges`,
 * `puzzles.coach_comment`, `alternatives`, `audited_at`), mais contient déjà les
 * tables de 0016 enregistrées sous un ancien horodatage. Le migrateur drizzle
 * ne compare que le `created_at` le plus récent : il rejouerait 0016 (tables
 * déjà présentes, échec) et ignorerait 0015.
 *
 * Ce script :
 *   1. exécute le SQL de 0015 si `puzzle_purges` est absente (colonnes déjà
 *      présentes ignorées) ;
 *   2. vérifie que les tables de 0016 existent ;
 *   3. inscrit 0015 et 0016 dans `__drizzle_migrations` (hash sha256 du fichier,
 *      `created_at` = `when` du journal), si elles n'y sont pas déjà.
 * Le tout dans une transaction. Idempotent : relancé, il ne fait rien.
 *
 * Usage (depuis web/, TOUJOURS après sauvegarde ou sur une copie) :
 *   DATABASE_PATH=/chemin/copie.db node scripts/db-align.mjs
 *   DATABASE_PATH=/chemin/copie.db npm run db:migrate
 */
import Database from "better-sqlite3";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const MIGRATIONS = resolve(import.meta.dirname, "../drizzle");
const TAGS = ["0015_faulty_celestials", "0016_curvy_red_skull"];
const TABLES_0016 = ["programme_sessions", "programme_puzzle_results", "programme_state"];

const path = resolve(process.cwd(), process.env.DATABASE_PATH ?? "data/chess-trainer.db");
const journal = JSON.parse(readFileSync(resolve(MIGRATIONS, "meta/_journal.json"), "utf8"));
const sqlite = new Database(path, { fileMustExist: true });

const hasTable = (name) =>
  sqlite.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(name) != null;
const hasColumn = (table, column) =>
  sqlite.prepare(`PRAGMA table_info("${table}")`).all().some((c) => c.name === column);

if (!hasTable("__drizzle_migrations")) {
  console.error("Pas de table __drizzle_migrations : base neuve, lancer directement `npm run db:migrate`.");
  process.exit(1);
}
const missing0016 = TABLES_0016.filter((t) => !hasTable(t));
if (missing0016.length > 0) {
  console.error(`Tables de 0016 absentes (${missing0016.join(", ")}) : cas non prévu, rien n'est modifié.`);
  process.exit(1);
}

const done = [];
sqlite.transaction(() => {
  if (!hasTable("puzzle_purges")) {
    const sql = readFileSync(resolve(MIGRATIONS, `${TAGS[0]}.sql`), "utf8");
    for (const statement of sql.split("--> statement-breakpoint").map((s) => s.trim()).filter(Boolean)) {
      const added = statement.match(/^ALTER TABLE `(\w+)` ADD `(\w+)`/);
      if (added && hasColumn(added[1], added[2])) continue;
      sqlite.exec(statement);
    }
    done.push("SQL de 0015 exécuté");
  }
  for (const tag of TAGS) {
    const entry = journal.entries.find((e) => e.tag === tag);
    if (!entry) throw new Error(`${tag} absent du journal`);
    const exists = sqlite.prepare("SELECT 1 FROM __drizzle_migrations WHERE created_at = ?").get(entry.when);
    if (exists) continue;
    const hash = createHash("sha256").update(readFileSync(resolve(MIGRATIONS, `${tag}.sql`), "utf8")).digest("hex");
    sqlite.prepare("INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)").run(hash, entry.when);
    done.push(`${tag} inscrite`);
  }
})();
sqlite.close();

console.log(`Base : ${path}`);
console.log(done.length > 0 ? done.map((d) => `  ${d}`).join("\n") : "  déjà alignée, rien à faire");
console.log("Étape suivante : npm run db:migrate (même DATABASE_PATH).");
