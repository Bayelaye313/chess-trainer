import "server-only";

/**
 * Lectures pour l'onglet « ⚔️ Pièges » — fusionne le petit socle statique et
 * vérifié à la main (`core/curriculum/traps.ts`, la référence en cas de
 * collision d'id) avec tout ce que `npm run db:seed-pgn` a importé dans
 * `imported_traps` (voir `scripts/seed-from-pgn.ts`, `data/import/README.md`)
 * — jamais l'un SANS l'autre : le socle statique garantit qu'`/pieges` n'est
 * jamais vide, même base de données toute neuve ou vidée par erreur.
 *
 * Même esprit que `server/queries/openings.ts` (« Pas de DB ici » pour le
 * catalogue d'ouvertures) MAIS différent sur un point : contrairement aux
 * ouvertures, les pièges sont conçus dès `traps.ts` pour être « industrialisés »
 * en masse (voir son docstring) — cette table n'est donc pas juste prête pour
 * plus tard, elle EST déjà la voie d'ajout de contenu à grande échelle.
 */
import { eq } from "drizzle-orm";
import { findTrap, listTrapFamilies as listStaticFamilies, OPENING_TRAPS, type OpeningTrap } from "@/core/curriculum/traps";
import { db } from "@/server/db";
import { importedTraps, type ImportedTrap } from "@/server/db/schema";

function fromImportedRow(row: ImportedTrap): OpeningTrap {
  return {
    id: row.id,
    name: row.name,
    family: row.family,
    gambit: row.gambit,
    eco: row.eco,
    victimSide: row.victimSide,
    difficulty: row.difficulty,
    summary: row.summary,
    setupMoves: row.setupMoves,
    trapMove: row.trapMove,
    trapExplanation: row.trapExplanation,
    hint: row.hint,
    refutationMoves: row.refutationMoves,
    outcome: row.outcome,
    comments: row.commentary,
  };
}

/**
 * Le socle statique EN PREMIER, puis les pièges importés qui n'entrent pas en
 * collision d'id — en pratique jamais le cas (`buildTrapFromGame` préfixe
 * l'id par le nom de fichier source), mais en cas de collision malgré tout,
 * la version écrite et vérifiée à la main l'emporte toujours.
 */
export async function listAllTraps(): Promise<OpeningTrap[]> {
  const rows = await db.select().from(importedTraps);
  const staticIds = new Set(OPENING_TRAPS.map((trap) => trap.id));
  const imported = rows.map(fromImportedRow).filter((trap) => !staticIds.has(trap.id));
  return [...OPENING_TRAPS, ...imported];
}

/** Familles distinctes toutes sources confondues (statique + importé), dans l'ordre : statique d'abord, puis toute famille apparue uniquement via l'import. */
export async function listAllTrapFamilies(): Promise<string[]> {
  const traps = await listAllTraps();
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const family of listStaticFamilies()) {
    if (!seen.has(family)) {
      seen.add(family);
      ordered.push(family);
    }
  }
  for (const trap of traps) {
    if (!seen.has(trap.family)) {
      seen.add(trap.family);
      ordered.push(trap.family);
    }
  }
  return ordered;
}

/** Cherche un piège par id — le socle statique d'abord (synchrone, `findTrap`), la table importée ensuite. */
export async function findTrapById(id: string): Promise<OpeningTrap | null> {
  const staticTrap = findTrap(id);
  if (staticTrap) return staticTrap;
  const [row] = await db.select().from(importedTraps).where(eq(importedTraps.id, id)).limit(1);
  return row ? fromImportedRow(row) : null;
}
