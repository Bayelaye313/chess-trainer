import "server-only";
import { Chess } from "chess.js";
import { uciOf } from "@/core/analysis/evaluate-move";
import { findOpening, OPENINGS, type OpeningLine } from "@/core/curriculum/openings";
import { findBookMove, type OpeningMatch } from "@/server/import/openings";

/**
 * Lectures pour l'onglet « Ouvertures » — la bibliothèque d'exploration
 * d'ouvertures (voir `core/curriculum/openings.ts` pour le catalogue statique
 * et `client/features/openings/` pour l'écran).
 *
 * Pas de DB ici, contrairement à `curriculum.ts`/`spaced-repetition.ts` : rien
 * à seeder ni à faire progresser, `OPENINGS` EST la source de vérité — cette
 * fonction ne fait que la ré-annoter à la demande via la base ECO.
 *
 * `annotateOpeningLine` rejoue une `OpeningLine` avec chess.js et interroge la
 * base ECO (`findBookMove`) après chaque coup, exactement comme la détection
 * de théorie de la revue de partie. Le nom affiché peut légitimement diverger
 * du libellé de famille du catalogue une fois sorti des variantes les plus
 * jouées — voir le docstring de `core/curriculum/openings.ts`.
 */
export interface AnnotatedPly {
  ply: number;
  san: string;
  uci: string;
  fen: string;
  /** `null` dès que la position n'est plus cataloguée par la base ECO (~3600 positions). */
  book: OpeningMatch | null;
}

export interface OpeningDetail {
  opening: OpeningLine;
  plies: readonly AnnotatedPly[];
}

export function annotateOpeningLine(opening: OpeningLine): AnnotatedPly[] {
  const chess = new Chess();
  return opening.moves.map((san, index) => {
    const move = chess.move(san);
    return {
      ply: index + 1,
      san: move.san,
      uci: uciOf(move),
      fen: chess.fen(),
      book: findBookMove(chess.fen()),
    };
  });
}

export function getOpeningDetail(id: string): OpeningDetail | null {
  const opening = findOpening(id);
  if (!opening) return null;
  return { opening, plies: annotateOpeningLine(opening) };
}

/** Un coup légal depuis la position interrogée dont la position d'arrivée est cataloguée en base ECO. */
export interface BookContinuation {
  san: string;
  uci: string;
  eco: string;
  name: string;
}

/**
 * L'arbre des variantes (onglet « Ouvertures ») : tous les coups légaux
 * depuis `fen` dont la position d'arrivée a un nom ECO — pas seulement le
 * coup de la ligne de référence en cours. Sert à afficher les alternatives
 * théoriques à chaque position, pas seulement la suite déjà choisie par le
 * catalogue statique.
 *
 * `chess-openings` ne porte aucun poids de popularité réel (pas de compteur
 * de parties, voir le docstring de `server/import/openings.ts`) : contrairement
 * à un explorateur Lichess, l'ordre ne peut refléter que l'alphabet, pas la
 * fréquence — trié par SAN pour rester stable et prévisible.
 */
export function listBookContinuations(fen: string): BookContinuation[] {
  const chess = new Chess(fen);
  const continuations: BookContinuation[] = [];
  for (const candidate of chess.moves({ verbose: true })) {
    const after = new Chess(fen);
    const played = after.move(candidate.san);
    const book = findBookMove(after.fen());
    if (book) continuations.push({ san: played.san, uci: uciOf(played), eco: book.eco, name: book.name });
  }
  return continuations.sort((a, b) => a.san.localeCompare(b.san));
}

/** Aperçu textuel façon PGN pour les cartes de la bibliothèque (ex. « 1. e4 e5 2. Nf3 Nc6 3. Bb5 »). */
export function formatMovePreview(moves: readonly string[]): string {
  const parts: string[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    const moveNumber = i / 2 + 1;
    const white = moves[i];
    const black = moves[i + 1];
    parts.push(black ? `${moveNumber}. ${white} ${black}` : `${moveNumber}. ${white}`);
  }
  return parts.join(" ");
}

export interface OpeningSummary {
  id: string;
  name: string;
  eco: string;
  side: OpeningLine["side"];
  description: string;
  preview: string;
}

export function listOpenings(): OpeningSummary[] {
  return OPENINGS.map((opening) => ({
    id: opening.id,
    name: opening.name,
    eco: opening.eco,
    side: opening.side,
    description: opening.description,
    preview: formatMovePreview(opening.moves),
  }));
}
