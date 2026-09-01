"use server";

/**
 * Pont client/serveur pour l'onglet « Ouvertures » — même rôle que
 * `server/actions/curriculum.ts` : aucune logique propre ici, juste une
 * redirection vers `server/queries/openings.ts` (l'arbre des variantes) et
 * `server/import/openings.ts` (la vérification théorique d'une position
 * unique). Les deux servent `OpeningExplorer` : la base ECO reste
 * `server-only` (~3 Mo, voir `next.config.ts`), ces actions sont son seul
 * accès depuis le bac à sable côté client.
 */
import type { PopularMove } from "@/server/import/lichess-explorer";
import { findBookMove, type OpeningMatch } from "@/server/import/openings";
import { listBookContinuations, listPopularContinuations, type BookContinuation } from "@/server/queries/openings";

export async function getBookContinuations(fen: string): Promise<BookContinuation[]> {
  return listBookContinuations(fen);
}

/** Fréquence humaine des coups depuis `fen` (Lichess Opening Explorer) — voir `use-move-popularity.ts`. */
export async function getMovePopularity(fen: string): Promise<PopularMove[]> {
  return listPopularContinuations(fen);
}

/**
 * La position atteinte après un coup d'exploration libre est-elle elle-même
 * cataloguée ? Permet à `applyBookOverride` de reconnaître une transposition
 * vers la théorie même en dehors de la ligne de référence choisie.
 */
export async function checkBookMove(fen: string): Promise<OpeningMatch | null> {
  return findBookMove(fen);
}
