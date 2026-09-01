import { Chess, type Move } from "chess.js";
import { classifyMove } from "../chess/classify";
import { categorizeDeck, type MistakeDeckId } from "../chess/decks";
import { detectMotifs } from "../chess/motifs";
import { gamePhase } from "../chess/phase";
import { isBrilliantSacrifice } from "../chess/sacrifice";
import { isReviewable, type GamePhase, type Motif, type MoveQuality } from "../chess/types";
import { computeSecondBestGap, secondBestWinPercent } from "./critical-gap";
import {
  moverPovMate,
  toMoverPov,
  toWhitePovScore,
  type AnalysisLimit,
  type EngineLine,
  type PositionAnalyser,
} from "./types";
import { winPercentFromWhitePov } from "./win-percent";

export interface EvaluatedMove {
  fenBefore: string;
  fenAfter: string;
  /** Le coup joué. */
  uci: string;
  san: string;
  /** Le coup que le moteur recommandait. */
  bestUci: string | null;
  bestSan: string | null;
  /**
   * Lignes candidates depuis `fenBefore`, meilleure d'abord — `evalBefore.lines`
   * telles quelles, aucun appel moteur supplémentaire. `[]` si l'appelant n'a
   * pas demandé de MultiPV étendu (`AnalysisLimit.lines`, voir son commentaire).
   * Sert aux flèches directionnelles du Mode Exploration, jamais persisté.
   */
  bestLines: EngineLine[];
  quality: MoveQuality;
  /** Centipions perdus par rapport au meilleur coup. `null` si non évaluable. */
  cpLoss: number | null;
  /** Évaluations brutes, POV Blancs — persistées telles quelles pour le graphe de partie. */
  cpBefore: number | null;
  mateBefore: number | null;
  /** `null` si le coup a terminé la partie : pas de position « après » à analyser. */
  cpAfter: number | null;
  mateAfter: number | null;
  phase: GamePhase;
  /** Un mat forcé était disponible et n'est plus là après le coup. */
  mateMissed: boolean;
  /** Le meilleur coup exploitait un motif tactique. */
  tactical: boolean;
  motifs: Motif[];
  /** Deck de révision, renseigné seulement si le coup mérite d'être revu. */
  deck: MistakeDeckId | null;
}

/** Notation UCI ("e2e4", "e7e8q") d'un coup chess.js. */
export function uciOf(move: Move): string {
  return move.from + move.to + (move.promotion ?? "");
}

/**
 * Décode un UCI ("e2e4", "e7e8q") vers l'entrée attendue par `Chess#move()` —
 * factorisé ici pour n'avoir qu'une seule règle de décodage (`tryMove`
 * ci-dessous, `use-puzzle-solver.ts`).
 */
export function moveInputFromUci(uci: string): { from: string; to: string; promotion?: string } {
  return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.slice(4, 5) || undefined };
}

/** Joue un coup UCI sur une copie de la position, sans toucher à l'original. */
function tryMove(fen: string, uci: string): { move: Move; board: Chess } | null {
  const board = new Chess(fen);
  try {
    const move = board.move(moveInputFromUci(uci));
    return { move, board };
  } catch {
    return null;
  }
}

/**
 * Analyse un coup joué dans la position `fenBefore`.
 *
 * Coûte deux appels moteur : la position avant (pour le meilleur coup et la
 * référence) et la position après (pour ce que le coup a réellement coûté).
 *
 * Ne modifie aucun état : l'appelant reste maître de sa partie.
 */
export async function evaluateMove(
  analyser: PositionAnalyser,
  fenBefore: string,
  playedUci: string,
  limit: AnalysisLimit,
): Promise<EvaluatedMove> {
  const played = tryMove(fenBefore, playedUci);
  if (!played) {
    throw new Error(`Coup illégal ${playedUci} dans la position ${fenBefore}`);
  }

  const before = new Chess(fenBefore);
  const moverIsWhite = before.turn() === "w";
  const phase = gamePhase(before);

  const evalBefore = await analyser.analyse(fenBefore, limit);
  const scoreBefore = toWhitePovScore(evalBefore);
  const mateBefore = moverPovMate(evalBefore, moverIsWhite);
  const hadForcedMate = mateBefore !== null && mateBefore > 0;

  // Les motifs qualifient l'occasion à saisir, donc le MEILLEUR coup — pas le
  // coup joué. C'est ce qui permet d'étiqueter « tactique manquée ».
  const best = evalBefore.bestMoveUci ? tryMove(fenBefore, evalBefore.bestMoveUci) : null;
  const motifs = best ? detectMotifs(before, best.move, best.board) : [];

  const foundBest = evalBefore.bestMoveUci !== null && evalBefore.bestMoveUci === playedUci;
  const onlyLegalMove = before.moves().length === 1;

  // Écart (%) entre le meilleur coup et le second, POV du joueur — ne sert
  // qu'à distinguer « Critique » de « Meilleur coup » quand `foundBest`, voir
  // classify.ts et critical-gap.ts.
  const secondBestGap = computeSecondBestGap(evalBefore, evalBefore.secondBest, moverIsWhite);
  // Probabilité de gain (%) du second choix DANS L'ABSOLU — le garde-fou qui
  // manquait pour que « Critique » ne phagocyte plus « Brillant », voir
  // classify.ts#CRITICAL_SECOND_BEST_MAX_WIN.
  const secondBestWinPct = secondBestWinPercent(evalBefore.secondBest, moverIsWhite);

  const after = played.board;
  const fenAfter = after.fen();

  let quality: MoveQuality;
  let cpLoss: number | null = null;
  let mateMissed = false;
  let cpAfter: number | null = null;
  let mateAfter: number | null = null;
  // Perte de gain (%) par rapport au meilleur coup — `null` quand elle n'a pas
  // pu être mesurée (fin de partie, ou raté d'analyse). Remontée hors du bloc
  // ci-dessous pour servir de marge de tolérance à isBrilliantSacrifice.
  let winPercentLoss: number | null = null;
  // Probabilité de gain (%) sur la position qui suit IMMÉDIATEMENT le coup,
  // POV du joueur qui vient de jouer — c'est la confirmation moteur que
  // « la position qui suit reste gagnante », l'autre moitié de la définition
  // du Brillant (voir isBrilliantSacrifice). 100 sur mat délivré : un mat
  // reste le résultat le plus gagnant possible, par définition.
  let winAfterMover: number | null = null;

  if (after.isGameOver()) {
    // Terminer la partie n'a pas de « coup d'après » à comparer. Mater est
    // toujours objectivement le meilleur résultat possible, qu'il corresponde
    // ou non à la première variante retenue par le moteur.
    quality = after.isCheckmate() ? "best" : "okay";
    mateMissed = hadForcedMate && !after.isCheckmate();
    if (after.isCheckmate()) winAfterMover = 100;
  } else {
    const evalAfter = await analyser.analyse(fenAfter, limit);
    const scoreAfter = toWhitePovScore(evalAfter);
    cpAfter = evalAfter.cp;
    mateAfter = evalAfter.mate;

    if (scoreBefore !== null && scoreAfter !== null) {
      const loss =
        toMoverPov(scoreBefore, moverIsWhite) - toMoverPov(scoreAfter, moverIsWhite);
      cpLoss = Math.max(0, loss);

      const winBeforeMover = winPercentFromWhitePov(evalBefore.cp, evalBefore.mate, moverIsWhite);
      winAfterMover = winPercentFromWhitePov(evalAfter.cp, evalAfter.mate, moverIsWhite);
      winPercentLoss = Math.max(0, winBeforeMover - winAfterMover);

      quality = classifyMove({
        foundBest,
        onlyLegalMove,
        winPercentLoss,
        secondBestGap,
        secondBestWinPercent: secondBestWinPct,
      });
    } else {
      // Le moteur n'a renvoyé ni centipions ni mat pour l'une des deux
      // positions — un raté d'analyse, pas de la théorie. `book` ne doit
      // JAMAIS sortir d'ici : c'est un statut qui ne peut venir que d'une
      // vraie vérification en base ECO (voir `server/import/openings.ts` et
      // `applyBookOverride` ci-dessous), sans quoi le badge 📖 mentirait sur
      // une partie qui n'a jamais quitté la théorie. `okay` reste le même
      // choix neutre que la branche fin de partie ci-dessus quand il n'y a
      // rien à reprocher au coup faute de mesure. `winAfterMover` reste
      // `null` : sans donnée fiable, aucun coup de cette branche ne doit
      // pouvoir passer le garde-fou « reste gagnante » de isBrilliantSacrifice.
      quality = "okay";
    }

    // Le mat n'est manqué que s'il a réellement disparu. Jouer le premier coup
    // correct d'un mat en 3 conserve le mat : ce n'est pas un mat manqué.
    // (Le prototype Python le comptait comme manqué — faux positif corrigé.)
    const mateAfterMoverPov = moverPovMate(evalAfter, moverIsWhite);
    mateMissed = hadForcedMate && !(mateAfterMoverPov !== null && mateAfterMoverPov > 0);
  }

  // Voir isBrilliantSacrifice : un sacrifice ne devient « Brillant » que s'il
  // y avait une alternative raisonnable (jamais "critical"), que le coup
  // reste proche du sommet (le meilleur coup exact, ou à une marge de
  // tolérance près), ET que la position qui suit reste confirmée gagnante —
  // sinon le joueur n'a pas fait preuve d'inventivité, ou le sacrifice n'a
  // fait qu'aggraver une position déjà perdue.
  if (isBrilliantSacrifice(quality, foundBest, winPercentLoss, winAfterMover, before, played.move)) {
    quality = "brilliant";
  }

  return {
    fenBefore,
    fenAfter,
    uci: uciOf(played.move),
    san: played.move.san,
    bestUci: evalBefore.bestMoveUci,
    bestSan: best?.move.san ?? null,
    bestLines: evalBefore.lines,
    quality,
    cpLoss,
    cpBefore: evalBefore.cp,
    mateBefore: evalBefore.mate,
    cpAfter,
    mateAfter,
    phase,
    mateMissed,
    tactical: motifs.length > 0,
    motifs,
    deck: isReviewable(quality)
      ? categorizeDeck({ quality, phase, mateMissed, tactical: motifs.length > 0 })
      : null,
  };
}

/**
 * Surclasse un coup analysé en « Théorique » (CLAUDE.md, règle « Book
 * Moves ») : si la position atteinte est répertoriée en base ECO, le score
 * moteur ne compte plus — le coup est étiqueté `book`, point final, même s'il
 * a l'air d'une gaffe pour le moteur (un coup jouable en théorie mais mal vu
 * quelques coups plus tard n'en reste pas moins théorique).
 *
 * Volontairement séparé de la détection elle-même (`isBookMove`, fournie par
 * l'appelant) : `evaluate-move.ts` ne connaît que le vocabulaire du domaine
 * (coup joué, qualité), jamais la source des données d'ouverture. Aujourd'hui
 * `findBookMove` (base ECO, `server/import/openings.ts`) est `server-only` —
 * ce découplage est ce qui permet à cette fonction de rester appelable aussi
 * bien à l'import (partie complète) qu'en partie live, le jour où une source
 * compatible client existe, sans faire dépendre le domaine du serveur.
 *
 * Efface aussi `deck` : un coup théorique ne mérite pas de révision, quel que
 * soit ce que le moteur en pensait.
 */
export function applyBookOverride(evaluated: EvaluatedMove, isBookMove: boolean): EvaluatedMove {
  if (!isBookMove) return evaluated;
  return { ...evaluated, quality: "book", deck: null };
}
