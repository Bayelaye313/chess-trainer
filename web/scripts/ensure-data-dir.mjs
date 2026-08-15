/**
 * Crée le dossier de la base avant que drizzle-kit n'y touche : better-sqlite3
 * refuse d'ouvrir un fichier dans un dossier inexistant.
 */
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const path = resolve(process.cwd(), process.env.DATABASE_PATH ?? "data/chess-trainer.db");
await mkdir(dirname(path), { recursive: true });
