import "server-only";

/**
 * Le pont entre le répertoire théorique (onglet « Ouvertures ») et la base de
 * parties importées (onglet « Parties », voir `server/queries/games.ts`) :
 * à chaque position couverte par un arbre de variantes, quels coups le joueur
 * a-t-il RÉELLEMENT joués dans ses parties, quand ils s'écartent de TOUTE
 * branche théorique connue ?
 *
 * Rendu possible sans nouvelle colonne : chaque demi-coup importé porte déjà
 * son `fenBefore` (voir `server/db/schema/moves.ts`, alimenté par
 * `analyse-game.ts`) — il suffit de le comparer aux positions couvertes par
 * `server/curriculum/opening-tree-index.ts`.
 *
 * FILTRAGE INTELLIGENT (cahier des charges « arbre dynamique ») — un coup qui
 * diffère de TOUS les enfants théoriques connus à cette position n'est
 * considéré comme une VRAIE erreur de répertoire que s'il franchit DEUX portes,
 * dans cet ordre (la première, locale et gratuite, réduit le volume avant la
 * seconde, qui touche le réseau) :
 *  1. **Porte éval** (`isReviewable`, `core/chess/types.ts`) — le coup doit
 *     être classé `"blunder"` ou `"inaccuracy"` (déjà calculé et stocké par
 *     `evaluate-move.ts` lors de l'analyse, colonne `moves.quality`). Un coup
 *     hors-script mais sain (`"best"/"okay"/"critical"/"brilliant"`) n'est
 *     JAMAIS une erreur de répertoire, seulement un choix hors script.
 *  2. **Porte transposition Maîtres** (`fetchLichessMasters`) — si le coup
 *     joué figure dans la base "masters" de Lichess à cette position, c'est
 *     une transposition vers une ligne de haut niveau reconnue, pas une
 *     gaffe : le chapitre s'adapte plutôt que de signaler une fausse erreur.
 * Voir `filterRealDeviations`, appliqué après le calcul par chapitre
 * (`getRepertoireDeviations`) et après le repérage par gaffe réelle en phase
 * d'ouverture (`listRepertoireDeviationGames`) ci-dessous.
 */
import { and, eq, inArray } from "drizzle-orm";
import { Chess } from "chess.js";
import { uciOf } from "@/core/analysis/evaluate-move";
import type { GameResult, MoveQuality } from "@/core/chess/types";
import { isReviewable } from "@/core/chess/types";
import { OPENINGS } from "@/core/curriculum/openings";
import { db } from "@/server/db";
import { games, moves } from "@/server/db/schema";
import { fetchLichessMasters, type PopularMove } from "@/server/import/lichess-explorer";
import { findBookMove } from "@/server/import/openings";
import { getCuratedChildren } from "@/server/curriculum/opening-tree-index";
import type { AnnotatedPly } from "./openings";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/**
 * Position AVANT chaque ply d'une ligne annotée — le ply `i` (1-based) est
 * joué depuis `result[i - 1]`. Factorisé hors de `getRepertoireDeviations`
 * pour être réutilisé par `listRepertoireDeviationGames` (même besoin :
 * comparer un `fenBefore` réel de partie importée à la position AVANT un coup
 * de référence, voir le docstring du fichier).
 */
function buildFenBeforeByPly(plies: readonly AnnotatedPly[]): string[] {
  return plies.map((ply, index) => (index === 0 ? START_FEN : plies[index - 1].fen));
}

/**
 * Interroge `fetchLichessMasters` pour un lot de positions distinctes, en
 * parallèle (best-effort, jamais bloquant — voir son docstring), et renvoie
 * le résultat indexé par `fen` — factorisé ici pour servir identiquement
 * `getRepertoireDeviations` ET `listRepertoireDeviationGames`.
 */
async function fetchMastersByFen(fens: readonly string[]): Promise<Map<string, readonly PopularMove[]>> {
  const entries = await Promise.all(fens.map(async (fen) => [fen, await fetchLichessMasters(fen)] as const));
  return new Map(entries);
}

/** Le minimum commun aux deux formes de déviation (par partie / agrégée par chapitre) pour appliquer `filterRealDeviations`. */
interface DeviationLike {
  fenBefore: string;
  actualUci: string;
  actualQuality: MoveQuality;
}

/**
 * Les deux portes du docstring du fichier, appliquées ensemble : ne garde que
 * les déviations dont le coup joué est une vraie gaffe/imprécision ET ne
 * transpose vers aucune ligne de maîtres connue à cette position. Fonction
 * PURE (le réseau a déjà été interrogé en amont, voir `fetchMastersByFen`) —
 * testable sans DB ni appel réseau.
 */
export function filterRealDeviations<T extends DeviationLike>(
  deviations: readonly T[],
  mastersByFen: ReadonlyMap<string, readonly PopularMove[]>,
): T[] {
  return deviations.filter((deviation) => {
    if (!isReviewable(deviation.actualQuality)) return false; // porte éval
    const masters = mastersByFen.get(deviation.fenBefore) ?? [];
    return !masters.some((m) => m.uci === deviation.actualUci); // porte transposition Maîtres
  });
}

/** Un coup fautif récurrent : à la position `fenBefore`, le joueur joue `actualUci` au lieu de la théorie connue, et ce coup est une vraie gaffe/imprécision (voir le docstring du fichier). */
export interface RepertoireDeviation {
  /** Numéro de demi-coup dans la ligne de référence (1 = premier coup). */
  ply: number;
  fenBefore: string;
  expectedSan: string;
  expectedUci: string;
  actualSan: string;
  actualUci: string;
  actualQuality: MoveQuality;
  /** Nombre de parties importées où CE coup précis a été joué à la place. */
  count: number;
  /** Partie la plus récente où l'écart a été observé — pour un futur lien "voir la partie". */
  mostRecentGameId: string;
}

/**
 * Croise `plies` (déjà annotée par `annotateOpeningLine`) avec les demi-coups
 * importés du joueur : une entrée par (position, coup fautif distinct)
 * réellement rencontré, triée par fréquence décroissante — les écarts les
 * plus systématiques d'abord, les plus utiles à corriger.
 *
 * Un coup joué qui correspond à `ply.uci` (le script de CETTE ligne) OU à
 * n'importe quel enfant connu de l'arbre curaté global à cette position
 * (`getCuratedChildren` — TOUTE branche/chapitre confondus, transpositions
 * comprises) n'est même pas un candidat : c'est une vraie branche théorique,
 * pas une déviation. Les candidats restants passent ensuite les deux portes
 * de `filterRealDeviations`.
 */
export async function getRepertoireDeviations(plies: readonly AnnotatedPly[]): Promise<RepertoireDeviation[]> {
  if (plies.length === 0) return [];

  const fenBeforeByPly = buildFenBeforeByPly(plies);

  const rows = await db
    .select({
      fenBefore: moves.fenBefore,
      uci: moves.uci,
      san: moves.san,
      gameId: moves.gameId,
      playedAt: games.playedAt,
      quality: moves.quality,
    })
    .from(moves)
    .innerJoin(games, eq(games.id, moves.gameId))
    .where(and(eq(moves.byPlayer, true), inArray(moves.fenBefore, fenBeforeByPly)));

  // Regroupe par (position, coup joué) — un même écart répété dans plusieurs
  // parties ne doit apparaître qu'une fois, avec son nombre d'occurrences.
  interface Tally {
    fenBefore: string;
    uci: string;
    san: string;
    quality: MoveQuality;
    count: number;
    mostRecentGameId: string;
    mostRecentPlayedAt: Date;
  }
  const tally = new Map<string, Tally>();
  for (const row of rows) {
    const key = `${row.fenBefore}|${row.uci}`;
    const existing = tally.get(key);
    if (existing) {
      existing.count += 1;
      if (row.playedAt > existing.mostRecentPlayedAt) {
        existing.mostRecentPlayedAt = row.playedAt;
        existing.mostRecentGameId = row.gameId;
      }
    } else {
      tally.set(key, {
        fenBefore: row.fenBefore,
        uci: row.uci,
        san: row.san,
        quality: row.quality,
        count: 1,
        mostRecentGameId: row.gameId,
        mostRecentPlayedAt: row.playedAt,
      });
    }
  }

  const candidates: RepertoireDeviation[] = [];
  plies.forEach((ply, index) => {
    const fenBefore = fenBeforeByPly[index];
    const knownBranches = new Set([ply.uci, ...getCuratedChildren(fenBefore).map((c) => c.uci)]);
    for (const entry of tally.values()) {
      if (entry.fenBefore !== fenBefore || knownBranches.has(entry.uci)) continue; // branche théorique connue, pas une déviation
      candidates.push({
        ply: ply.ply,
        fenBefore,
        expectedSan: ply.san,
        expectedUci: ply.uci,
        actualSan: entry.san,
        actualUci: entry.uci,
        actualQuality: entry.quality,
        count: entry.count,
        mostRecentGameId: entry.mostRecentGameId,
      });
    }
  });

  const reviewable = candidates.filter((c) => isReviewable(c.actualQuality));
  if (reviewable.length === 0) return [];

  const mastersByFen = await fetchMastersByFen(Array.from(new Set(reviewable.map((d) => d.fenBefore))));
  return filterRealDeviations(reviewable, mastersByFen).sort((a, b) => b.count - a.count);
}

/**
 * Une correction théorique résolue à `fenBefore`, en réponse au coup fautif
 * `actualUci` — voir `resolveTheoreticalCorrection`.
 */
export interface TheoreticalCorrection {
  san: string;
  uci: string;
}

/**
 * Le coup « théorique » à opposer à un coup fautif (`actualUci`) à une
 * position donnée — dans cet ordre de préférence, la première source qui
 * répond suffit :
 *  1. un embranchement du catalogue curaté (`getCuratedChildren`, arbres
 *     `pgn` authored + lignes du catalogue `OPENINGS`) — commenté, nommé,
 *     la source la plus pédagogique quand elle couvre cette position ;
 *  2. sinon, un coup légal qui atteint une position reconnue par la base ECO
 *     GLOBALE (`chess-openings`, ~3600 positions, voir
 *     `server/import/openings.ts`) — même principe que « Book Moves »
 *     (CLAUDE.md) : la théorie se juge par la position atteinte, jamais par
 *     un catalogue restreint à 20 chapitres ;
 *  3. sinon `null` — l'appelant retombe alors sur le meilleur coup moteur
 *     déjà stocké lors de l'analyse (`moves.bestUci`/`bestSan`, voir
 *     `evaluate-move.ts`), qui existe pour la quasi-totalité des coups
 *     analysés : à défaut de théorie, corriger vers le coup objectivement
 *     le plus solide reste un exercice utile.
 * `actualUci` est toujours exclu des deux premières sources : ce n'est
 * justement PAS la correction recherchée.
 */
export function resolveTheoreticalCorrection(fenBefore: string, actualUci: string): TheoreticalCorrection | null {
  const curated = getCuratedChildren(fenBefore).find((child) => child.uci !== actualUci);
  if (curated) return { san: curated.san, uci: curated.uci };

  const board = new Chess(fenBefore);
  for (const move of board.moves({ verbose: true })) {
    const uci = uciOf(move);
    if (uci === actualUci) continue;
    if (findBookMove(move.after)) return { san: move.san, uci };
  }
  return null;
}

/**
 * Un demi-coup du joueur en phase d'ouverture, joint à sa partie — la matière
 * première de `listRepertoireDeviationGames`, avant filtrage. `bestUci`/
 * `bestSan` : le repli moteur de `resolveTheoreticalCorrection` (étape 3).
 * Nomme déjà ses champs `actualUci`/`actualSan`/`actualQuality` (voir
 * `DeviationLike`) : satisfait directement `filterRealDeviations` sans
 * mapping intermédiaire.
 */
export interface OpeningMistakeMoveRow {
  gameId: string;
  ply: number;
  actualUci: string;
  actualSan: string;
  fenBefore: string;
  actualQuality: MoveQuality;
  bestUci: string | null;
  bestSan: string | null;
  opponentName: string | null;
  playedAt: Date;
  playerColor: "w" | "b";
  result: GameResult | null;
  /** Dernière position théorique de la partie ENTIÈRE reconnue par la base ECO globale à l'import (`analyseImportedGame`) — `null` si aucun coup, même le premier, n'était répertorié (rarissime). */
  eco: string | null;
  openingName: string | null;
}

/**
 * Ne garde, par partie, que le PREMIER (le plus petit `ply`) demi-coup du
 * joueur en phase d'ouverture qui soit une vraie gaffe/imprécision — le tout
 * premier moment où sa partie quitte la théorie avec un coup mauvais, jamais
 * un mauvais coup plus tardif si un premier existe déjà (cahier des charges :
 * « le premier moment où l'utilisateur fait un coup qui s'écarte de la
 * théorie »). Factorisé hors de la requête DB pour rester testable sans base
 * de données.
 */
export function earliestOpeningMistakePerGame(rows: readonly OpeningMistakeMoveRow[]): OpeningMistakeMoveRow[] {
  const bestByGame = new Map<string, OpeningMistakeMoveRow>();
  for (const row of rows) {
    const existing = bestByGame.get(row.gameId);
    if (!existing || row.ply < existing.ply) bestByGame.set(row.gameId, row);
  }
  return Array.from(bestByGame.values());
}

/**
 * Une VRAIE partie importée où le joueur a commis une vraie gaffe/imprécision
 * en phase d'ouverture — le journal de bord de la section « Erreurs
 * d'ouverture » (onglet Entraîner) : une entrée ici pointe vers UNE partie
 * précise, prête à être rejouée coup par coup jusqu'au moment exact de
 * l'erreur — voir `OpeningMistakeExercise`.
 */
export interface DeviationGameSummary {
  gameId: string;
  opponentName: string | null;
  playedAt: Date;
  playerColor: "w" | "b";
  result: GameResult | null;
  /**
   * Chapitre correspondant dans le catalogue restreint (`OPENINGS`), par code
   * ECO — `null` quand cette partie ne correspond à aucun des 20 chapitres
   * disponibles : reste malgré tout une VRAIE erreur exploitable, voir
   * `openingName`/`eco` ci-dessous (base ECO globale, jamais le catalogue) et
   * `OpeningMistakeExercise`, qui sait s'en passer.
   */
  openingId: string | null;
  /** Nom de l'ouverture réellement jouée dans CETTE partie (base ECO globale, `games.openingName`) — jamais un nom générique du catalogue restreint. */
  openingName: string;
  /** Code ECO réel de cette partie (`games.eco`) — jamais celui, potentiellement différent, du chapitre `openingId` le plus proche. */
  eco: string;
  /** Numéro de demi-coup (1 = premier coup) de la gaffe/imprécision. */
  ply: number;
  fenBefore: string;
  expectedSan: string;
  expectedUci: string;
  actualSan: string;
  actualUci: string;
  actualQuality: MoveQuality;
  /** Coups réels (UCI, les deux camps), depuis le tout premier coup jusqu'à `fenBefore` — rejoués en autoplay par `useOpeningDrill` (`kind: "mistake"`, voir son docstring). */
  leadInUci: readonly string[];
}

/**
 * Assemble les résumés finaux à partir de demi-coups déjà filtrés aux deux
 * portes de `filterRealDeviations` (voir l'appelant) — factorisé hors de la
 * requête DB pour rester testable sans base de données ni réseau : la
 * résolution de correction (`resolveTheoreticalCorrection`) ne touche, elle,
 * que des données statiques (catalogue, base ECO embarquée).
 */
export function buildDeviationGameSummaries(
  rows: readonly OpeningMistakeMoveRow[],
  leadInUciByGame: ReadonlyMap<string, readonly string[]>,
): DeviationGameSummary[] {
  const catalogByEco = new Map(OPENINGS.map((opening) => [opening.eco, opening] as const));
  const summaries: DeviationGameSummary[] = [];

  for (const row of rows) {
    const correction =
      resolveTheoreticalCorrection(row.fenBefore, row.actualUci) ??
      (row.bestUci && row.bestSan ? { uci: row.bestUci, san: row.bestSan } : null);
    if (!correction) continue; // rien à proposer comme correction (rarissime : coup analysé sans meilleur coup moteur stocké).

    const catalogOpening = row.eco ? catalogByEco.get(row.eco) : undefined;
    summaries.push({
      gameId: row.gameId,
      opponentName: row.opponentName,
      playedAt: row.playedAt,
      playerColor: row.playerColor,
      result: row.result,
      openingId: catalogOpening?.id ?? null,
      openingName: row.openingName ?? catalogOpening?.name ?? "Ouverture non identifiée",
      eco: row.eco ?? "—",
      ply: row.ply,
      fenBefore: row.fenBefore,
      expectedSan: correction.san,
      expectedUci: correction.uci,
      actualSan: row.actualSan,
      actualUci: row.actualUci,
      actualQuality: row.actualQuality,
      leadInUci: leadInUciByGame.get(row.gameId) ?? [],
    });
  }

  return summaries.sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime());
}

/**
 * Les coups réels (UCI, les deux camps, dans l'ordre) qui précèdent chaque
 * déviation retenue — un `leadInUci` par partie, tronqué à son `ply` propre
 * (des parties différentes déviant à des profondeurs différentes). Une seule
 * requête pour tout le lot plutôt qu'une par partie : `deviations` ne compte
 * jamais plus qu'une poignée d'entrées à ce stade (après les deux portes de
 * `filterRealDeviations`), mais autant limiter les allers-retours DB.
 */
async function fetchLeadInUciByGame(
  deviations: readonly { gameId: string; ply: number }[],
): Promise<Map<string, string[]>> {
  if (deviations.length === 0) return new Map();
  const cutoffPlyByGame = new Map(deviations.map((d) => [d.gameId, d.ply]));

  const rows = await db
    .select({ gameId: moves.gameId, ply: moves.ply, uci: moves.uci })
    .from(moves)
    .where(inArray(moves.gameId, Array.from(cutoffPlyByGame.keys())));

  const byGame = new Map<string, { ply: number; uci: string }[]>();
  for (const row of rows) {
    const cutoff = cutoffPlyByGame.get(row.gameId);
    if (cutoff === undefined || row.ply >= cutoff) continue; // coup à ou après la déviation, ou de l'adversaire au-delà : hors lead-in.
    const list = byGame.get(row.gameId);
    if (list) list.push(row);
    else byGame.set(row.gameId, [row]);
  }

  const result = new Map<string, string[]>();
  for (const [gameId, list] of byGame) {
    result.set(
      gameId,
      list.sort((a, b) => a.ply - b.ply).map((r) => r.uci),
    );
  }
  return result;
}

/**
 * Liste chronologique (plus récentes d'abord) des parties importées où le
 * joueur a commis une vraie gaffe/imprécision en phase d'ouverture — voir le
 * docstring du fichier (section « FILTRAGE INTELLIGENT ») pour les deux
 * portes appliquées, et celui de `DeviationGameSummary`/
 * `earliestOpeningMistakePerGame` pour le principe général.
 *
 * Détection scopée à L'UTILISATEUR uniquement (`moves.byPlayer`, déjà posé à
 * l'import selon le pseudo fourni — voir `analyseImportedGame` — donc fiable
 * quel que soit le camp réellement joué dans chaque partie) et à la phase
 * d'ouverture (`moves.phase`) : les gaffes de l'adversaire, et celles du
 * milieu de partie/finale, relèvent d'autres decks de révision, pas de ce
 * journal-ci.
 *
 * Ne dépend PLUS d'une correspondance exacte avec un nœud du catalogue
 * restreint (`OPENINGS`, souvent trop peu profond pour y voir se produire une
 * vraie gaffe) : le repérage de la gaffe elle-même vient directement de
 * `moves.quality` (déjà calculé par le moteur à l'import, voir
 * `evaluate-move.ts`), la correction proposée vient de
 * `resolveTheoreticalCorrection`, et l'étiquette d'ouverture vient de
 * `games.eco`/`games.openingName` (la base ECO globale, calculée à l'import
 * pour TOUTE partie, pas seulement celles qui suivent un des 20 chapitres du
 * catalogue) — `openingId` (le chapitre du catalogue, s'il y en a un) ne sert
 * plus qu'à enrichir l'exercice de commentaires pédagogiques quand il existe.
 */
export async function listRepertoireDeviationGames(): Promise<DeviationGameSummary[]> {
  const rows = await db
    .select({
      gameId: moves.gameId,
      ply: moves.ply,
      actualUci: moves.uci,
      actualSan: moves.san,
      fenBefore: moves.fenBefore,
      actualQuality: moves.quality,
      bestUci: moves.bestUci,
      bestSan: moves.bestSan,
      opponentName: games.opponentName,
      playedAt: games.playedAt,
      playerColor: games.playerColor,
      result: games.result,
      eco: games.eco,
      openingName: games.openingName,
    })
    .from(moves)
    .innerJoin(games, eq(games.id, moves.gameId))
    .where(and(eq(moves.byPlayer, true), eq(moves.phase, "opening")));

  const reviewable = rows.filter((row) => isReviewable(row.actualQuality));
  const earliest = earliestOpeningMistakePerGame(reviewable);
  if (earliest.length === 0) return [];

  const mastersByFen = await fetchMastersByFen(Array.from(new Set(earliest.map((row) => row.fenBefore))));
  const survivors = filterRealDeviations(earliest, mastersByFen);
  if (survivors.length === 0) return [];

  const leadInUciByGame = await fetchLeadInUciByGame(survivors.map((row) => ({ gameId: row.gameId, ply: row.ply })));
  return buildDeviationGameSummaries(survivors, leadInUciByGame);
}
