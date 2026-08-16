import "server-only";
import { Chess, DEFAULT_POSITION } from "chess.js";
import { applyBookOverride, evaluateMove, uciOf, type EvaluatedMove } from "@/core/analysis/evaluate-move";
import type { PositionAnalyser } from "@/core/analysis/types";
import { gameOutcome } from "@/core/chess/termination";
import type { GameResult } from "@/core/chess/types";
import { findBookMove, type OpeningMatch } from "./openings";

export interface ImportedMoveResult {
  ply: number;
  side: "w" | "b";
  byPlayer: boolean;
  evaluated: EvaluatedMove;
}

export interface ImportedGameResult {
  externalId: string;
  pgn: string;
  playerColor: "w" | "b";
  opponentName: string | null;
  opponentRating: number | null;
  playerRating: number | null;
  initialFen: string;
  finalFen: string;
  result: GameResult | null;
  termination: string | null;
  /** Tag PGN `TimeControl` brut ("600+5"), `null` s'il est absent — voir `lib/time-control.ts` pour l'affichage. */
  timeControl: string | null;
  playedAt: Date;
  moves: ImportedMoveResult[];
  /** Code ECO de la dernière position théorique atteinte, `null` si aucun coup n'était répertorié. */
  eco: string | null;
  /** Nom de l'ouverture assorti à `eco`. */
  openingName: string | null;
}

function parseResultHeader(raw: string | undefined): GameResult | null {
  if (raw === "1-0" || raw === "0-1" || raw === "1/2-1/2") return raw;
  return null;
}

/**
 * Reconstruit la date de la partie depuis les en-têtes PGN, plus précis
 * d'abord : Lichess fournit UTCDate/UTCTime, Chess.com Date/StartTime. Sans
 * rien d'exploitable, on retombe sur l'instant de l'import — imprécis mais
 * jamais bloquant.
 */
function parsePlayedAt(headers: Record<string, string>): Date {
  const date = headers.UTCDate ?? headers.Date;
  const time = headers.UTCTime ?? headers.StartTime ?? "00:00:00";
  if (date && /^\d{4}\.\d{2}\.\d{2}$/.test(date)) {
    const parsed = new Date(`${date.replaceAll(".", "-")}T${time}Z`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

function parseRating(raw: string | undefined): number | null {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * Analyse une partie importée : qualifie TOUS les coups, joueur comme
 * adversaire — contrairement à la partie live (voir usePlayGame), qui n'évalue
 * que le joueur au fil de l'eau. `byPlayer` distingue les deux à la lecture :
 * les statistiques (précision, decks de révision, moments clés) restent
 * scopées au joueur, mais l'adversaire est désormais visible sur l'échiquier
 * et dans le journal de la revue de partie.
 *
 * Coûte environ deux fois plus de temps moteur qu'avant (tous les coups au
 * lieu d'un camp sur deux) — acceptable pour un import qui tourne déjà en
 * tâche de fond.
 *
 * Renvoie `null` quand la partie doit être ignorée : PGN illisible, variante
 * non standard, ou pseudo ne correspondant à aucun des deux camps (sécurité —
 * le prototype Python avait la même garde).
 */
export async function analyseImportedGame(
  analyser: PositionAnalyser,
  pgn: string,
  externalId: string,
  username: string,
  depth: number,
): Promise<ImportedGameResult | null> {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch {
    return null;
  }

  const headers = chess.getHeaders();
  if (headers.Variant && headers.Variant !== "Standard" && headers.Variant !== "From Position") {
    return null;
  }

  const white = headers.White ?? "";
  const black = headers.Black ?? "";
  let playerColor: "w" | "b";
  if (white.toLowerCase() === username.toLowerCase()) playerColor = "w";
  else if (black.toLowerCase() === username.toLowerCase()) playerColor = "b";
  else return null;

  const verboseHistory = chess.history({ verbose: true });
  const outcome = gameOutcome(chess);

  const moves: ImportedMoveResult[] = [];
  // Une fois sorti de la théorie répertoriée, on n'y revient jamais dans cette
  // fonction — même si une position plus tard transpose par coïncidence vers
  // une entrée cataloguée. « Théorique » doit rester un préfixe continu depuis
  // le premier coup, pas un statut qui clignote au hasard des transpositions.
  let stillInBook = true;
  // Dernière position théorique atteinte : la base ECO catalogue des
  // positions de plus en plus profondes coup après coup, donc le dernier
  // coup encore répertorié porte l'ECO le plus précis pour cette partie.
  let lastBookMatch: OpeningMatch | null = null;
  for (let i = 0; i < verboseHistory.length; i += 1) {
    const move = verboseHistory[i];
    try {
      const evaluated = await evaluateMove(analyser, move.before, uciOf(move), { depth });

      // Le graphe d'évaluation garde cpBefore/cpAfter du moteur — seule la
      // qualité change : ce coup n'est plus noté, il est théorique. Voir
      // applyBookOverride pour la règle (CLAUDE.md « Book Moves »).
      const book = stillInBook ? findBookMove(move.after) : null;
      if (stillInBook && !book) stillInBook = false;
      if (book) lastBookMatch = book;
      const finalEvaluated = applyBookOverride(evaluated, book !== null);

      moves.push({
        ply: i + 1,
        side: move.color,
        byPlayer: move.color === playerColor,
        evaluated: finalEvaluated,
      });
    } catch {
      // Un coup isolé qui échoue à s'analyser ne doit pas faire perdre toute la partie.
    }
  }

  return {
    externalId,
    pgn,
    playerColor,
    opponentName: (playerColor === "w" ? black : white) || null,
    opponentRating: parseRating(playerColor === "w" ? headers.BlackElo : headers.WhiteElo),
    playerRating: parseRating(playerColor === "w" ? headers.WhiteElo : headers.BlackElo),
    initialFen: verboseHistory[0]?.before ?? DEFAULT_POSITION,
    finalFen: chess.fen(),
    result: outcome?.result ?? parseResultHeader(headers.Result),
    termination: outcome?.termination ?? headers.Termination ?? null,
    timeControl: headers.TimeControl ?? null,
    playedAt: parsePlayedAt(headers),
    moves,
    eco: lastBookMatch?.eco ?? null,
    openingName: lastBookMatch?.name ?? null,
  };
}
