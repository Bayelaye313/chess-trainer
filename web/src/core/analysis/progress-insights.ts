/**
 * Service d'agrégation pour l'onglet « Progrès » : à partir des coups déjà
 * analysés d'un joueur (table `moves`, croisée avec `games` pour l'ECO et le
 * résultat), calcule son profil de faiblesses sur 4 axes.
 *
 * Fonctions pures, sans accès base de données ni moteur — l'appelant (une
 * requête serveur, à écrire à l'étape suivante) traduit les lignes SQL vers
 * `PlayerGameRecord`/`PlayerMoveRecord` (voir `analysis/types.ts`), exactement
 * comme `server/queries/games.ts` le fait déjà pour `AnalysedPly`.
 */
import { Chess } from "chess.js";
import { hasHangingPiece } from "../chess/attacks";
import type { GamePhase } from "../chess/types";
import { computeAccuracy } from "./timeline";
import type {
  HangingPieceStats,
  OpeningPerformance,
  PhaseAccuracy,
  PlayerGameRecord,
  PlayerMoveRecord,
  PlayerProgressInsights,
  TacticalMotifStats,
  TrackedTacticalMotif,
} from "./types";

const GAME_PHASES: readonly GamePhase[] = ["opening", "middlegame", "endgame"];
const TRACKED_TACTICAL_MOTIFS: readonly TrackedTacticalMotif[] = ["fork", "pin"];

/**
 * Axe 1 — Précision par phase de jeu.
 *
 * Ne recalcule jamais la phase elle-même (`gamePhase`, `chess/phase.ts`) :
 * elle est déjà posée sur chaque coup à l'analyse (`evaluate-move.ts`), on se
 * contente de regrouper par cette étiquette déjà connue.
 */
export function computePhaseAccuracy(moves: readonly PlayerMoveRecord[]): Record<GamePhase, PhaseAccuracy> {
  const byPhase = new Map<GamePhase, PlayerMoveRecord[]>(GAME_PHASES.map((phase) => [phase, []]));
  for (const move of moves) byPhase.get(move.phase)!.push(move);

  const result = {} as Record<GamePhase, PhaseAccuracy>;
  for (const phase of GAME_PHASES) {
    const inPhase = byPhase.get(phase)!;
    result[phase] = { phase, movesAnalysed: inPhase.length, accuracy: computeAccuracy(inPhase) };
  }
  return result;
}

/**
 * Axe 2 — Fourchettes et clouages : trouvés vs manqués.
 *
 * S'appuie sur `motifs`/`motifFound`, déjà posés à l'analyse par
 * `detectMotifs` (lui-même bâti sur `chess/attacks.ts` — `isPinned`,
 * `isUndefended`) : un coup « trouvé » est un coup joué qui EST le meilleur
 * coup quand celui-ci exploitait le motif ; « manqué » sinon. Ne recalcule pas
 * la géométrie du motif ici — ce serait dupliquer `detectMotifs` pour rien,
 * l'information est déjà sur chaque coup analysé.
 *
 * Limite assumée : `motifFound` est un seul booléen par coup, pas un par
 * motif — un coup dont le meilleur choix cumulait fourchette ET clouage
 * compte les deux comme trouvés ou les deux comme manqués ensemble (cas rare,
 * `detectCaptureMotifs` n'en produit qu'un des deux à la fois, mais fourchette
 * et clouage restent détectés indépendamment et peuvent en théorie coexister).
 */
export function computeTacticalMotifStats(
  moves: readonly PlayerMoveRecord[],
): Record<TrackedTacticalMotif, TacticalMotifStats> {
  const result = {} as Record<TrackedTacticalMotif, TacticalMotifStats>;

  for (const motif of TRACKED_TACTICAL_MOTIFS) {
    let found = 0;
    let missed = 0;
    for (const move of moves) {
      if (!move.motifs.includes(motif)) continue;
      if (move.motifFound) found += 1;
      else missed += 1;
    }
    const total = found + missed;
    result[motif] = { motif, found, missed, successRate: total > 0 ? Math.round((found / total) * 100) : null };
  }

  return result;
}

/** Le joueur a-t-il gagné cette partie ? Nulle et partie sans résultat comptent comme non-victoire. */
function didPlayerWin(game: Pick<PlayerGameRecord, "result" | "playerColor">): boolean {
  if (!game.result) return false;
  return (
    (game.result === "1-0" && game.playerColor === "w") ||
    (game.result === "0-1" && game.playerColor === "b")
  );
}

/**
 * Axe 3 — Performance par ouverture (code ECO).
 *
 * Parties sans ECO (pas encore catégorisées, voir `games.eco`) exclues plutôt
 * que regroupées sous une clé « inconnue » qui fausserait la lecture — mieux
 * vaut une ouverture absente du tableau qu'une entrée qui ne veut rien dire.
 */
export function computeOpeningPerformance(games: readonly PlayerGameRecord[]): OpeningPerformance[] {
  const byEco = new Map<string, PlayerGameRecord[]>();
  for (const game of games) {
    if (!game.eco) continue;
    const list = byEco.get(game.eco) ?? [];
    list.push(game);
    byEco.set(game.eco, list);
  }

  const performance: OpeningPerformance[] = [];
  for (const [eco, gamesForEco] of byEco) {
    const wins = gamesForEco.filter(didPlayerWin).length;
    const playerMoves = gamesForEco.flatMap((game) => game.moves.filter((move) => move.byPlayer));
    performance.push({
      eco,
      gamesPlayed: gamesForEco.length,
      wins,
      winRate: Math.round((wins / gamesForEco.length) * 100),
      accuracy: computeAccuracy(playerMoves),
    });
  }

  return performance.sort((a, b) => b.gamesPlayed - a.gamesPlayed);
}

/** Rejoue `uci` depuis `fenBefore` ; `null` si le coup stocké s'avère illégal (ne devrait pas arriver). */
function tryApplyUci(fenBefore: string, uci: string): Chess | null {
  const board = new Chess(fenBefore);
  try {
    board.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.slice(4, 5) || undefined });
    return board;
  } catch {
    return null;
  }
}

/**
 * Axe 4 — Pièces laissées en prise.
 *
 * Ne rejoue le coup que pour les gaffes du joueur (`quality === "blunder"`) :
 * c'est le seul cas que demande cet axe, et rejouer chaque coup de chaque
 * partie juste pour ce chiffre serait un coût inutile.
 */
export function computeHangingPieceStats(games: readonly PlayerGameRecord[]): HangingPieceStats {
  let blunderCount = 0;
  let totalBlunders = 0;

  for (const game of games) {
    for (const move of game.moves) {
      if (!move.byPlayer || move.quality !== "blunder") continue;
      totalBlunders += 1;

      const after = tryApplyUci(move.fenBefore, move.uci);
      if (after && hasHangingPiece(after, game.playerColor)) blunderCount += 1;
    }
  }

  return { blunderCount, totalBlunders };
}

/**
 * Profil de faiblesses complet d'un joueur, sur toutes ses parties analysées.
 *
 * Pure : aucun accès base de données ni moteur — voir l'en-tête du fichier.
 */
export function aggregatePlayerProgress(gamesData: readonly PlayerGameRecord[]): PlayerProgressInsights {
  const playerMoves = gamesData.flatMap((game) => game.moves.filter((move) => move.byPlayer));

  return {
    phaseAccuracy: computePhaseAccuracy(playerMoves),
    tacticalMotifs: computeTacticalMotifStats(playerMoves),
    openingPerformance: computeOpeningPerformance(gamesData),
    hangingPieces: computeHangingPieceStats(gamesData),
  };
}
