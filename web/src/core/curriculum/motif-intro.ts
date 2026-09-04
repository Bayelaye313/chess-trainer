/**
 * Mini-tutoriel d'introduction — l'échiquier de démonstration affiché en tête
 * de `ThemeLesson` (`client/features/learn/theme-lesson.tsx`), style Lichess :
 * une flèche ROUGE pour la menace créée par le coup-clé, une flèche VERTE pour
 * le coup lui-même, cahier des charges du 2026-09-03 (« La fiche de cours
 * ThemeLesson textuelle est trop austère... exactement comme les tutoriels
 * interactifs de Lichess »).
 *
 * ENTIÈREMENT DYNAMIQUE, jamais de FEN codée en dur par thème : dériver du
 * VRAI premier puzzle du thème (`getThemePuzzleSession`, déjà chargé par
 * `ThemeLesson` pour le diagramme statique) plutôt que de rédiger à la main
 * une position par motif — ~200 thèmes au catalogue (`tactical_motifs`,
 * `lichess_motifs`, `checkmate_patterns`...), une rédaction manuelle par
 * thème serait ingérable et vite désynchronisée du contenu réellement importé.
 *
 * Géométrie réutilisée telle quelle depuis `core/chess/motifs/fork.ts` (même
 * définition de « cible qui compte » : le Roi, ou une pièce ≥ cavalier) plutôt
 * que dupliquée — la case d'arrivée du coup-clé attaque-t-elle, une fois joué,
 * une ou plusieurs cibles adverses de valeur ? C'est très exactement ce
 * qu'une fourchette, une enfilade, une attaque à la découverte ou un simple
 * coup qui met en prise ont en commun une fois le coup joué : une ou
 * plusieurs pièces adverses nouvellement visées. Mat immédiat : repli dédié
 * (flèche vers le Roi, jamais une case vide).
 */
import { Chess, type Move, type Square } from "chess.js";
import { moveInputFromUci } from "../analysis/evaluate-move";
import { attacksFrom } from "../chess/attacks";
import { MINOR_PIECE_VALUE, valueOf } from "../chess/pieces";

export interface MotifIntroArrow {
  from: string;
  to: string;
  kind: "threat" | "solution";
}

export interface MotifIntroStep {
  caption: string;
  arrows: readonly MotifIntroArrow[];
}

export interface MotifIntro {
  /** Position de départ affichée sur tout le mini-tutoriel — jamais rejouée à l'écran, seules les flèches changent. */
  fen: string;
  /** Toujours au moins 1 étape (le coup-clé) ; 2 quand une menace distincte a pu être dérivée. */
  steps: readonly [MotifIntroStep, ...MotifIntroStep[]];
}

/** Au plus 2 cibles pointées par la flèche de menace — au-delà, la flèche devient illisible sans rien ajouter à la démonstration. */
const MAX_THREAT_TARGETS = 2;

/**
 * Cases attaquées par la pièce qui vient de se poser sur `landingSquare` et
 * qui « comptent » (Roi, ou pièce ≥ cavalier) — même filtre que
 * `isFork`/`isSkewer`, factorisé ici plutôt que ré-importé : ce module ne
 * cherche pas à PROUVER un motif précis (fourchette vs enfilade vs
 * découverte), juste à trouver quoi montrer en flèche rouge.
 */
function valuableTargetsFrom(after: Chess, landingSquare: Square, mover: "w" | "b"): Square[] {
  const targets: Square[] = [];
  for (const target of attacksFrom(after, landingSquare)) {
    const piece = after.get(target);
    if (!piece || piece.color === mover) continue;
    if (piece.type !== "k" && valueOf(piece) < MINOR_PIECE_VALUE) continue;
    targets.push(target);
    if (targets.length >= MAX_THREAT_TARGETS) break;
  }
  return targets;
}

/**
 * Construit le mini-tutoriel du premier coup de la solution — `null` si
 * `solutionUci` n'est structurellement pas jouable depuis `fen` (donnée
 * corrompue ; ne devrait jamais arriver en pratique pour un puzzle importé).
 */
export function buildMotifIntro(fen: string, solutionUci: string, solutionSan: string): MotifIntro | null {
  const board = new Chess(fen);
  let move: Move;
  try {
    move = board.move(moveInputFromUci(solutionUci));
  } catch {
    return null;
  }

  const mover = move.color;
  const opponent = mover === "w" ? "b" : "w";
  const isMate = board.isCheckmate();
  const [opponentKing] = board.findPiece({ type: "k", color: opponent });

  const threats = isMate && opponentKing ? [opponentKing] : valuableTargetsFrom(board, move.to as Square, mover);

  const solutionStep: MotifIntroStep = {
    caption: `✅ Le coup clé : ${solutionSan}.`,
    arrows: [{ from: move.from, to: move.to, kind: "solution" }],
  };

  if (threats.length === 0) return { fen, steps: [solutionStep] };

  const threatStep: MotifIntroStep = {
    caption: isMate
      ? "⚠️ Le Roi adverse n'a plus aucune case : ce coup fait mat."
      : threats.length > 1
        ? "⚠️ Ce coup attaque déjà deux pièces à la fois — impossible de sauver les deux."
        : "⚠️ Ce coup crée une menace directe que l'adversaire ne peut plus ignorer.",
    arrows: threats.map((to) => ({ from: move.to, to, kind: "threat" }) as MotifIntroArrow),
  };

  return { fen, steps: [threatStep, solutionStep] };
}
