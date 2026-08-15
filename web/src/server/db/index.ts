import "server-only";

/**
 * Connexion SQLite unique, côté serveur.
 *
 * SQLite plutôt que Postgres : l'application tourne en local, sans serveur à
 * administrer, et un fichier unique se sauvegarde en le copiant. Le schéma
 * Drizzle reste portable si un déploiement en ligne devient nécessaire.
 */
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as schema from "./schema";

const DEFAULT_DB_PATH = "data/chess-trainer.db";

function createClient() {
  // Le chemin dépend d'une variable d'env : sans cet indice, Turbopack ne peut
  // pas savoir quel dossier tracer et embarque tout le projet dans le build
  // serveur. DATABASE_PATH pointe toujours vers un fichier local, jamais vers
  // une ressource à empaqueter — l'ignorer ici est sûr.
  const path = resolve(
    /* turbopackIgnore: true */ process.cwd(),
    process.env.DATABASE_PATH ?? DEFAULT_DB_PATH,
  );
  mkdirSync(dirname(path), { recursive: true });

  const sqlite = new Database(path);
  // WAL : les lectures du tableau de bord ne bloquent pas l'écriture d'un import.
  sqlite.pragma("journal_mode = WAL");
  // SQLite ne vérifie pas les clés étrangères par défaut — nos ON DELETE en dépendent.
  sqlite.pragma("foreign_keys = ON");

  return drizzle(sqlite, { schema });
}

/**
 * Le rechargement à chaud de Next réévalue les modules : sans ce cache, chaque
 * édition ouvrirait une connexion de plus jusqu'à saturation.
 */
const globalForDb = globalThis as unknown as {
  __chessTrainerDb?: ReturnType<typeof createClient>;
};

export const db = globalForDb.__chessTrainerDb ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__chessTrainerDb = db;
}

export { schema };
