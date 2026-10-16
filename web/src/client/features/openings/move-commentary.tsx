"use client";

/**
 * Bloc « pourquoi ce coup ? » sous l'échiquier (approche Jeremy Silman) —
 * lit `core/curriculum/opening-commentary.ts` en priorité (les ~20 chapitres
 * curatés à la main), puis retombe sur `computeHeuristicCommentary` (analyse
 * chess.js du coup RÉELLEMENT joué — voir son docstring) dès que ce contenu
 * dédié manque, ce qui couvre désormais tout le catalogue, variantes et
 * familles importées de Lichess (Zukertort, Défense Benima...) comprises.
 * `lastMove` porte le nécessaire pour ce repli (`fenBefore`+`uci`, voir
 * `DrillHistoryEntry` dans `use-opening-drill.ts`) — `undefined` si l'appelant
 * ne le fournit pas (repli direct sur `GENERIC_BOOK_COMMENT`, ex. si un jour
 * un appelant n'a par nature aucun historique de coup à donner). `ply <= 0`
 * (position de départ, rien encore joué) n'affiche rien.
 */
import { GENERIC_BOOK_COMMENT, getMoveCommentary } from "@/core/curriculum/opening-commentary";
import { computeHeuristicCommentary } from "@/core/curriculum/heuristic-commentary";

export function MoveCommentary({
  openingId,
  ply,
  lastMove,
}: {
  openingId: string;
  ply: number;
  /** Le coup affiché (position avant + UCI) — sert le repli heuristique. Voir le docstring du fichier. */
  lastMove?: { fenBefore: string; uci: string };
}) {
  if (ply <= 0) return null;
  const commentary =
    getMoveCommentary(openingId, ply) ??
    (lastMove ? computeHeuristicCommentary(lastMove.fenBefore, lastMove.uci) : GENERIC_BOOK_COMMENT);
  return (
    <div className="mt-4 rounded-md border border-border bg-surface-muted/40 p-3 text-sm text-foreground-muted">
      {commentary.comment}
    </div>
  );
}
