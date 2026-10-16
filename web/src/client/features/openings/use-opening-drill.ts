"use client";

/**
 * Mode Entraînement / Drill : révision active d'une ouverture — méthode
 * STRICTE façon Listudy (voir `opening-drill.tsx` pour l'habillage) :
 *  - un coup qui correspond exactement au script choisi (ligne principale /
 *    variante / manche en cours / correction ciblée) est accepté, joué, et
 *    l'IA répond aussitôt ;
 *  - N'IMPORTE QUEL AUTRE coup est refusé — `onPieceDrop` renvoie `false` et
 *    react-chessboard fait revenir la pièce à sa case de départ, avec un
 *    retour visuel/sonore (`errorPulse`, voir `OpeningDrill`) — JAMAIS de
 *    message textuel. Le bouton d'indice explicite (texte pédagogique de
 *    `core/curriculum/opening-commentary.ts`) reste disponible EN PLUS de la
 *    flèche de guidage automatique décrite ci-dessous ;
 *  - le mode Aléatoire/Surprise (`kind: "random"`) n'a par nature aucun script
 *    fixe : n'importe quel coup théorique connu (base ECO) y est recevable.
 *
 * FLÈCHE D'INDICE DYNAMIQUE (`hintArrow`, clone exact du système Listudy) :
 * tant qu'un coup précis (POSITION + coup, voir `move-success-counter.ts`)
 * n'a pas été RÉUSSI au moins `HINT_ARROW_SUCCESS_THRESHOLD` fois par le
 * joueur (persistant en `localStorage`, à travers TOUTES ses sessions, pas
 * seulement la manche en cours), une flèche pointant de la case de départ à
 * la case d'arrivée du coup théorique attendu s'affiche AUTOMATIQUEMENT dès
 * que c'est son tour — sans qu'il ait besoin de cliquer sur le bouton
 * d'indice. Piloté par `hintBehavior` (voir son type ci-dessous) :
 * `"until_played_twice"` (réglage par défaut, celui de Listudy) l'éteint dès
 * que le seuil est atteint, `"always"` l'affiche sans condition, `"never"` la
 * coupe entièrement. Dans TOUS les cas, la flèche reste STRICTEMENT
 * indisponible en Manche 2 du protocole en 2 manches (`hintsAllowed`, voir
 * plus bas) : le principe même du test à l'aveugle est de retrouver la ligne
 * SANS aucune aide visuelle, qu'un coup ait déjà été maîtrisé ou non.
 *
 * FILET DE SÉCURITÉ (cahier des charges du 2026-09-03, lignes sans contenu
 * rédigé dédié — ex. Zukertort, Défense Benima) : dès que la manche `diverged`
 * (embranchement théorique réel choisi par le joueur, `script` ne décrit plus
 * la suite) ET que les continuations théoriques de la position affichée sont
 * connues, `hintArrow` bascule automatiquement sur le coup le plus joué par
 * de vrais joueurs (`mostPopularContinuation`) plutôt que de s'éteindre —
 * jamais laisser le joueur sans AUCUN repère visuel juste parce qu'aucun
 * texte d'indice n'a été rédigé pour cette branche. Symétriquement, si la
 * requête théorique échoue carrément pour la position affichée
 * (`continuationsFailed`), la manche se termine proprement (théorie réputée
 * épuisée) plutôt que de laisser le plateau attendre indéfiniment une
 * réponse de l'IA qui ne viendra jamais — voir `decideOpponentStep`.
 *
 * Trois familles de sélection, en plus d'« Aléatoire » :
 *  - ligne principale / une variante nommée (`listOpeningVariations`) ;
 *  - un "Test Final" (`kind: "final-test"`) qui enchaîne plusieurs manches à
 *    des positions clés tirées au sort parmi les variantes déjà pratiquées
 *    (voir `build-final-test.ts`) ;
 *  - un exercice ciblé de correction (`kind: "mistake"`), typiquement un écart
 *    de répertoire récurrent détecté dans les parties importées du joueur
 *    (voir `server/queries/opening-mistakes.ts` et `opening-mistakes-hub.tsx`)
 *    — optionnellement précédé d'un AUTOPLAY qui rejoue la vraie partie du
 *    joueur depuis le tout premier coup jusqu'à la position fautive
 *    (`leadInUci`, statut `"autoplaying"`), avant de rendre la main.
 *
 * Aucune dépendance au moteur Stockfish pour juger un coup : la validation
 * repose UNIQUEMENT sur la base ECO (`useBookContinuations`, le même hook que
 * l'arbre des variantes) — CLAUDE.md, « Book Moves » : la théorie se juge par
 * la position atteinte, jamais par un score moteur.
 *
 * TRAP EXPLORATION RÉACTIVE (sprint « Scotch Traps Pipeline » du 2026-09-13) :
 * un coup qui correspond, à cette position EXACTE, à un piège DOCUMENTÉ
 * (`core/curriculum/traps.ts`, voir `findMatchingTrap`) n'est PLUS un coup
 * "refusé" comme les autres — voir `triggerTrapPunishment` : le plateau
 * l'accepte, l'IA enchaîne aussitôt la ligne punitive forcée du piège
 * (`trap.punishmentLine`) en autoplay, puis la position revient EXACTEMENT à
 * l'état d'avant l'erreur une fois la démonstration lue. `trapPunishment`
 * (état exposé) porte tout ce qu'il faut à l'UI (`OpeningCoachingPanel`) pour
 * afficher l'alerte + l'explication pendant ce court intermède ; le plateau
 * reste verrouillé (`canDragPiece`) et l'IA de la manche normale est mise en
 * pause (`trapPunishment !== null`) tout le temps que la punition se joue.
 *
 * Un chapitre (ligne principale ou variante nommée) se joue en 2 MANCHES
 * obligatoires — décision pure dans `learning-round.ts` (`nextLearningRoundOutcome`,
 * testable indépendamment) : la Manche 1 (indice autorisé) débouche TOUJOURS,
 * automatiquement, sur une Manche 2 qui rejoue le même chapitre depuis le
 * début, indice désactivé (`hintsAllowed`) ; la progression n'est enregistrée
 * en base (répétition espacée) que si cette Manche 2 est réussie à 100% sans
 * AUCUNE faute — sinon elle recommence en boucle jusqu'à ce sans-faute.
 * Aléatoire, Test Final et Correction ciblée restent à manche unique, comme
 * avant.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess, type Move } from "chess.js";
import type { PieceDropHandlerArgs, PieceHandlerArgs } from "react-chessboard";
import type { DrillRound } from "./build-final-test";
import {
  computeHintArrow,
  decideOpponentStep,
  mostPopularContinuation,
  type DrillFinishReason,
  type HintArrowBehavior,
} from "./drill-engine";
import { nextLearningRoundOutcome, type LearningRound } from "./learning-round";
import { moveInputFromUci, uciOf } from "@/core/analysis/evaluate-move";
import type { OpeningLine } from "@/core/curriculum/openings";
import { findMatchingTrap } from "@/core/curriculum/opening-trap-alert";
import { type TrackedDrillSelection, variationLabelFor } from "@/core/curriculum/opening-variation-key";
import type { OpeningTrap } from "@/core/curriculum/traps";
import { recordEnduranceSession } from "@/server/actions/opening-endurance";
import { type OpeningDrillProgressSummary, recordOpeningDrillResult } from "@/server/actions/opening-progress";
import type { AnnotatedPly, OpeningVariation } from "@/server/queries/openings";
import { getMoveSuccessCount, moveSuccessKey, recordMoveSuccess } from "./move-success-counter";
import { useBookContinuations } from "./use-book-continuations";
import { useMovePopularity } from "./use-move-popularity";

export type { HintArrowBehavior, DrillFinishReason } from "./drill-engine";
export { HINT_ARROW_SUCCESS_THRESHOLD } from "./drill-engine";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/** Pause avant le coup de l'IA — purement cosmétique, pour que l'échange ne semble jamais instantané. */
const OPPONENT_MOVE_DELAY_MS = 450;

/** Pause entre deux coups de l'autoplay (`leadInUci`) — assez lente pour rester lisible, jamais un simple flash. */
const LEAD_IN_STEP_MS = 550;

/** Tentatives de sauvegarde de la progression avant d'abandonner — voir `saveOpeningDrillResultWithRetry`. */
const SAVE_PROGRESS_MAX_ATTEMPTS = 3;
/** Délai de base entre deux tentatives, multiplié par le numéro de la tentative (backoff linéaire simple). */
const SAVE_PROGRESS_RETRY_DELAY_MS = 400;

/** Durée d'affichage de `roundTransitionNotice` avant disparition automatique — assez long pour être lu, jamais bloquant. */
const ROUND_TRANSITION_NOTICE_MS = 2600;

/** Pause entre deux coups de la ligne punitive d'un piège (`triggerTrapPunishment`) — même rythme que l'autoplay `leadInUci`, jamais un flash. */
const TRAP_PUNISHMENT_STEP_MS = LEAD_IN_STEP_MS;
/** Une fois la ligne punitive entièrement jouée, temps laissé au joueur pour lire l'alerte avant le reset automatique (voir `triggerTrapPunishment`) — plus long que `ROUND_TRANSITION_NOTICE_MS` : l'alerte porte un texte pédagogique plus dense (`trapExplanation`) qu'une simple notice de transition. */
const TRAP_PUNISHMENT_RESET_DELAY_MS = 3200;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sécurise l'appel serveur qui enregistre la progression d'un drill terminé
 * (`recordOpeningDrillResult`, répétition espacée — voir son docstring) :
 * jusqu'à `SAVE_PROGRESS_MAX_ATTEMPTS` tentatives avant d'abandonner, plutôt
 * qu'un unique essai qu'une simple coupure réseau transitoire suffisait à
 * faire échouer — CHAQUE chapitre terminé sans faute doit voir sa
 * progression atteindre la base de données de façon fiable, pas au premier
 * hoquet. Reste `null` (jamais une exception) après épuisement des
 * tentatives : l'appelant (`useOpeningDrill`) garde son affichage best-effort
 * existant, l'écran de fin ne doit jamais rester bloqué sur une sauvegarde en
 * échec.
 */
async function saveOpeningDrillResultWithRetry(
  input: Parameters<typeof recordOpeningDrillResult>[0],
): Promise<OpeningDrillProgressSummary | null> {
  return callWithRetry(() => recordOpeningDrillResult(input));
}

/** Même politique de retry que `saveOpeningDrillResultWithRetry`, pour l'historique d'endurance « Sans Guide » (`recordEnduranceSession`). */
async function saveEnduranceSessionWithRetry(input: Parameters<typeof recordEnduranceSession>[0]): Promise<void> {
  await callWithRetry(() => recordEnduranceSession(input));
}

/** `SAVE_PROGRESS_MAX_ATTEMPTS` tentatives à backoff linéaire, puis `null` — jamais d'exception vers l'appelant. */
async function callWithRetry<T>(call: () => Promise<T>): Promise<T | null> {
  for (let attempt = 1; attempt <= SAVE_PROGRESS_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await call();
    } catch {
      if (attempt === SAVE_PROGRESS_MAX_ATTEMPTS) return null;
      await sleep(SAVE_PROGRESS_RETRY_DELAY_MS * attempt);
    }
  }
  return null;
}

export type DrillSelection =
  | { kind: "main-line" }
  | { kind: "variation"; variation: OpeningVariation }
  | { kind: "random" }
  /** Étape 3, "Test Final" — voir `build-final-test.ts`. Jamais suivi en répétition espacée (composite, pas une variante). */
  | { kind: "final-test"; rounds: readonly DrillRound[] }
  /**
   * Exercice ciblé de correction — typiquement un écart de répertoire
   * récurrent (voir `server/queries/opening-mistakes.ts`). `leadInUci` : les
   * coups réels (UCI, depuis le tout premier coup) qui mènent à
   * `round.startFen` — rejoués en autoplay (statut `"autoplaying"`) avant de
   * rendre la main au joueur ; `[]` pour sauter directement à la position
   * (voir `opening-explorer.tsx`, qui ne connaît que la position fautive, pas
   * la partie entière). `actualSan` : le coup fautif réellement joué par le
   * joueur — affiché comme repère (jamais un message d'erreur) tant que la
   * correction n'a pas été trouvée.
   */
  | { kind: "mistake"; round: DrillRound; leadInUci: readonly string[]; actualSan: string }
  /**
   * Piège d'ouverture (`OpeningTrapDrill`) — structurellement identique à
   * `"mistake"` (même `DrillRound`/`leadInUci`) mais routé sous son propre
   * variant pour ne JAMAIS affecter `opening-mistake-exercise.tsx` (corrections
   * de vraies parties importées, restent à manche unique) : `"trap"` seul
   * entre dans `usesLearningRounds` ci-dessous, avec sa propre porte manuelle
   * entre manches (voir `manualRoundGate`/`"round-gate"`).
   */
  | { kind: "trap"; round: DrillRound; leadInUci: readonly string[]; actualSan: string }
  /**
   * Option « Pion Poison » (incarner la victime, `OpeningTrapDrill`) : AUCUNE
   * phase interactive — `leadInUci` couvre la mise en place ET le coup piège
   * ET la ligne de punition (`buildPoisonPawnRound`, voir `trap-round.ts`),
   * rejouée entièrement en autoplay jusqu'au bout ("l'IA répond
   * instantanément... comment la position s'effondre"). Termine directement
   * en `"finished"` une fois l'autoplay épuisé, jamais en `"playing"` — manche
   * unique, jamais soumis au protocole 2-manches/`markTrapSolved`.
   */
  | { kind: "trap-poison"; startFen: string; leadInUci: readonly string[] };

export interface DrillHistoryEntry {
  ply: number;
  san: string;
  byPlayer: boolean;
  /** `"correct"` pour un coup du joueur (un coup faux ne rejoint JAMAIS l'historique — la pièce revient, voir le docstring du fichier). `"trap"` pour le coup fautif ET la ligne punitive d'une démonstration de piège documenté (voir `TrapPunishmentState`) — accepté temporairement, retiré de `history` par le reset automatique. `null` pour un coup de l'IA ou de l'autoplay normal. */
  result: "correct" | "trap" | null;
  /** Le coup, en UCI — sert le repli heuristique du commentaire post-coup (`heuristic-commentary.ts`), qui a besoin du coup exact plutôt que du seul SAN. */
  uci: string;
  /** Position juste AVANT ce coup (FEN) — même usage : `computeHeuristicCommentary` analyse un coup par rapport à la position qui le précède, pas la position déjà mutée. */
  fenBefore: string;
}

/**
 * État d'une démonstration de piège documenté en cours (voir le docstring du
 * fichier, « TRAP EXPLORATION RÉACTIVE ») — `trap.punishmentLine` (SAN) se
 * rejoue un coup à la fois sur `boardRef.current` (voir l'effet dédié) ;
 * `playedCount` compte ceux déjà joués sur le plateau. `restoreFen`/
 * `restoreHistoryLength` sont la position et la longueur d'historique
 * D'AVANT le coup fautif — le point EXACT où le reset automatique ramène le
 * joueur une fois la démonstration lue en entier.
 */
interface TrapPunishmentState {
  trap: OpeningTrap;
  restoreFen: string;
  restoreHistoryLength: number;
  playedCount: number;
  nonce: number;
}

/**
 * `"round-gate"` : entre deux manches d'un chapitre à porte manuelle
 * (`manualRoundGate`, exclusivement `kind: "trap"` — voir son docstring) —
 * position figée sur le résultat de la Manche qui vient de se terminer, en
 * attente de `beginNextRound()`. Jamais atteint par `main-line`/`variation`
 * (leur enchaînement Manche 1 → 2 reste automatique, comme avant).
 */
type DrillStatus = "select" | "autoplaying" | "playing" | "round-gate" | "finished";

export function useOpeningDrill({
  opening,
  plies,
  hintBehavior = "until_played_twice",
  playerSide,
  startInSansGuide = false,
}: {
  opening: OpeningLine;
  /** Ligne de référence annotée — sert de script au mode « Ligne principale ». */
  plies: readonly AnnotatedPly[];
  /** Pilotage de la flèche d'indice automatique — voir `HintArrowBehavior`. Défaut : méthode Listudy exacte. */
  hintBehavior?: HintArrowBehavior;
  /**
   * Camp forcé par `?side=white|black` (feuille de route Zone 4) — transmis
   * depuis le bandeau « Ouverture en difficulté » du Rapport : le plateau
   * s'ORIENTE et le joueur joue CE camp, même s'il diffère de la perspective
   * camp du catalogue (`opening.side`). `undefined` : comportement historique
   * inchangé. Les sélections ciblées (`mistake`/`trap`/`trap-poison`) gardent
   * la priorité : leur camp se déduit du trait à `startFen`, plus fiable qu'un
   * camp déclaré (voir plus bas).
   */
  playerSide?: "white" | "black";
  /**
   * `?mode=sans-guide` (bouton « Verrouiller les réflexes » de la Zone Stats) :
   * la ligne principale/variante démarre directement en Manche 2, indice
   * désactivé dès le premier coup. Sans effet sur les autres sélections.
   */
  startInSansGuide?: boolean;
}) {
  const [status, setStatus] = useState<DrillStatus>("select");
  const [selection, setSelection] = useState<DrillSelection | null>(null);
  /** Manche en cours pour `kind: "final-test"` — toujours 0 pour les autres sélections. */
  const [roundIndex, setRoundIndex] = useState(0);
  /** Manche du protocole en 2 temps (ligne principale/variante uniquement) — voir `LearningRound`. */
  const [learningRound, setLearningRound] = useState<LearningRound>(1);
  const [fen, setFen] = useState(START_FEN);
  const [history, setHistory] = useState<DrillHistoryEntry[]>([]);
  const [score, setScore] = useState({ correct: 0, attempted: 0 });
  const [finishReason, setFinishReason] = useState<DrillFinishReason | null>(null);
  // Résultat de la Server Action de répétition espacée pour CE drill — `null`
  // tant qu'il n'a pas fini de sauvegarder (ou en mode Aléatoire/Test
  // Final/Erreur ciblée, jamais suivis).
  const [progressResult, setProgressResult] = useState<OpeningDrillProgressSummary | null>(null);
  // Compteur incrémenté à CHAQUE coup refusé — jamais lu pour sa valeur, juste
  // pour son CHANGEMENT (`OpeningDrill` s'y abonne en effet pour déclencher le
  // tremblement + bip d'erreur à chaque incrément, y compris deux erreurs
  // identiques de suite). Remplace l'ancien texte "X n'est pas le coup
  // attendu ici" : plus aucun message n'accompagne un coup refusé (méthode
  // Listudy stricte, voir le docstring du fichier).
  const [errorPulse, setErrorPulse] = useState(0);
  // Démonstration de piège documenté EN COURS (voir le docstring du fichier,
  // « TRAP EXPLORATION RÉACTIVE ») — `null` la plupart du temps. Portée par un
  // seul objet (jamais plusieurs `useState` épars pour un même intermède) :
  // `triggerTrapPunishment` l'initialise EN UNE FOIS, deux `useEffect` dédiés
  // (autoplay de la punition, puis reset automatique) le faisant progresser
  // jusqu'à sa disparition — jamais de `setState` isolé ailleurs dans le
  // fichier. `nonce` change à CHAQUE déclenchement (y compris le même piège
  // rejoué deux fois de suite) : sert de `key` React à `OpeningCoachingPanel`
  // pour rejouer `.animate-trap-alert` à coup sûr.
  const [trapPunishment, setTrapPunishment] = useState<TrapPunishmentState | null>(null);
  const trapNonceRef = useRef(0);
  // A-t-on, à un moment de la manche en cours, joué une branche théorique
  // RÉELLE mais différente du script (`freshContinuations`, désormais
  // curated-aware — voir `listBookContinuations`) plutôt que le coup EXACT
  // attendu ? Une fois vrai, `script` ne décrit plus la suite : la manche
  // bascule sur le même moteur que le mode Aléatoire (continuations
  // théoriques + tirage pondéré par popularité) pour le reste de son
  // déroulé — voir le docstring du fichier, point 3 du cahier des charges
  // (« dérouler la suite de l'arbre en fonction du choix de l'utilisateur »).
  // Remis à `false` à chaque nouveau `start()`.
  const [diverged, setDiverged] = useState(false);
  // Notification transitoire affichée PRÉCISÉMENT au moment où la Manche 1
  // (indice autorisé) débouche automatiquement sur la Manche 2 (test à
  // l'aveugle) — voir `completeRound`. AVANT ce garde-fou (cahier des charges
  // du 2026-09-03, lignes sans contenu rédigé dédié — Zukertort, Défense
  // Benima, etc.), ce basculement se produisait en silence total : le plateau
  // se réinitialisait sans jamais passer par `finish()`, donc sans aucun
  // retour visuel — le joueur pouvait légitimement croire le drill figé pile
  // au moment où la théorie scriptée s'arrêtait (`"no-more-theory"` comme
  // `"line-complete"`). `null` hors de cette fenêtre transitoire — remis à
  // `null` automatiquement après `ROUND_TRANSITION_NOTICE_MS` (voir l'effet
  // dédié) ou immédiatement à chaque nouveau `start()`.
  const [roundTransitionNotice, setRoundTransitionNotice] = useState<string | null>(null);

  // Position « vivante », mutée directement — même schéma que `sandboxRef`
  // dans `use-opening-explorer.ts` : `fen` (state) ne sert qu'à déclencher les
  // rendus, cette instance reste la seule source de vérité pour chess.js.
  const boardRef = useRef(new Chess());
  // Garde-fou contre la double sauvegarde du résultat (l'effet ci-dessous se
  // redéclenche à chaque rendu tant que `status === "finished"`) — remis à
  // `false` à chaque nouveau `start()`, jamais pendant un même drill.
  const progressSavedRef = useRef(false);
  /** Manche/position en attente pendant `status === "round-gate"` (`manualRoundGate`) — consommée par `beginNextRound()`. `null` en dehors de cet état. */
  const pendingRoundRef = useRef<{ round: DrillRound; nextRound: LearningRound } | null>(null);
  /**
   * Ply ABSOLU du premier coup fautif (refusé, ou piège documenté joué) de la
   * manche EN COURS — `null` tant qu'il n'y en a pas. Lu une seule fois, à la
   * fin d'une Manche 2, pour l'historique d'endurance « Sans Guide » (voir
   * `completeRound`), puis remis à `null` à chaque changement de manche : une
   * faute de Manche 1 (guidée) ne doit jamais entacher la Manche 2. Une ref,
   * pas un state : rien à l'écran n'en dépend.
   */
  const firstMistakePlyRef = useRef<number | null>(null);

  // Le camp du joueur — normalement `opening.side`, MAIS pour une correction
  // ciblée ou un piège (`kind: "mistake"`/`"trap"`) on le déduit plutôt du
  // trait à `round.startFen` (`kind: "trap-poison"` : `startFen` directement) :
  // par construction (`buildMistakeRound`/`buildTrapRound`/`buildPoisonPawnRound`),
  // le script commence TOUJOURS juste avant le coup du joueur, donc le trait
  // à cette position EST son camp dans cette partie précise — fiable même si
  // `opening` est un repli générique (voir `OpeningMistakeExercise`, ouverture
  // retirée du catalogue), contrairement à `opening.side` qui décrirait alors
  // le mauvais camp et retournerait l'échiquier dans le mauvais sens.
  const userColor: "w" | "b" =
    selection?.kind === "mistake" || selection?.kind === "trap"
      ? new Chess(selection.round.startFen).turn()
      : selection?.kind === "trap-poison"
        ? new Chess(selection.startFen).turn()
        : // `playerSide` (`?side=` du Rapport, Zone 4) prime sur la perspective
          // camp du catalogue : c'est le camp que LE JOUEUR a réellement joué —
          // le plateau s'oriente en conséquence (`boardOrientation` suit
          // `userColor` dans `opening-drill.tsx`).
          playerSide
          ? playerSide === "white"
            ? "w"
            : "b"
          : opening.side === "white"
            ? "w"
            : "b";

  /** Coups d'autoplay (`leadInUci`) pour la sélection courante — `0` hors `kind: "mistake"/"trap"/"trap-poison"`. */
  const leadInLength =
    selection?.kind === "mistake" || selection?.kind === "trap" || selection?.kind === "trap-poison"
      ? selection.leadInUci.length
      : 0;

  /**
   * La manche active : position de départ + suite attendue DEPUIS cette
   * position (jamais depuis le tout début de la partie — voir `DrillRound`),
   * plus le ply ABSOLU (1-based, aligné sur `opening.moves`) auquel son script
   * démarre — sert à retrouver le bon commentaire pédagogique même en plein
   * milieu d'une manche de Test Final ou d'une correction ciblée (voir
   * `roundStartPly` ci-dessous). `null` en mode Aléatoire, qui n'a par nature
   * aucune séquence fixe à comparer.
   */
  const activeRound = useMemo<DrillRound | null>(() => {
    if (!selection) return null;
    if (selection.kind === "main-line")
      return { startFen: START_FEN, script: plies.map((p) => p.uci), label: opening.name, startPly: 0 };
    if (selection.kind === "variation")
      return {
        startFen: START_FEN,
        script: selection.variation.uciMoves,
        label: selection.variation.name,
        startPly: 0,
      };
    if (selection.kind === "random") return null;
    // "trap-poison" n'a aucune phase interactive à comparer à un script — tout
    // son déroulé (mise en place + coup piège + punition) n'est QUE de
    // l'autoplay (`leadInUci`), voir le docstring du variant.
    if (selection.kind === "trap-poison") return null;
    if (selection.kind === "final-test") return selection.rounds[roundIndex] ?? null;
    return selection.round; // "mistake" | "trap"
  }, [selection, plies, opening.name, roundIndex]);

  const script = activeRound?.script ?? null;
  const roundStartPly = activeRound?.startPly ?? 0;
  const playerMovesExpected = activeRound
    ? activeRound.script.some((_, index) => {
        const sideToMove = new Chess(activeRound.startFen).turn();
        const moveSide = index % 2 === 0 ? sideToMove : sideToMove === "w" ? "b" : "w";
        return moveSide === userColor;
      })
    : false;

  // Continuations théoriques connues depuis la position AFFICHÉE — préchargées
  // en continu (même hook que l'arbre des variantes) : sert UNIQUEMENT au mode
  // Aléatoire (valider un coup hors script, piocher le coup de l'IA), jamais
  // aux sélections scriptées où seul le coup EXACT du script est recevable
  // (voir le docstring du fichier).
  const bookContinuations = useBookContinuations(fen);
  // La liste précédente reste volontairement affichée pendant qu'une nouvelle
  // arrive (voir le docstring de `use-book-continuations.ts`) — mais valider
  // un coup ou piocher pour l'IA exige la fraîcheur STRICTE : `fen` porté par
  // l'état « ready » doit correspondre à la position courante, sinon on
  // attend plutôt que de trancher sur une liste déjà périmée.
  const freshContinuations =
    bookContinuations.status === "ready" && bookContinuations.fen === fen ? bookContinuations.continuations : null;
  // La requête théorique a-t-elle ÉCHOUÉ pour la position AFFICHÉE (pas une
  // position déjà quittée) ? Filet de sécurité contre le plateau figé sur les
  // lignes rares (Zukertort, Défense Benima...) — voir
  // `decideOpponentStep#continuationsFailed`.
  const continuationsFailed = bookContinuations.status === "error" && bookContinuations.fen === fen;

  // Fréquence humaine (Lichess Opening Explorer, voir `use-move-popularity.ts`)
  // — sert UNIQUEMENT à pondérer le tirage ci-dessous parmi `freshContinuations`
  // (approche Chessreps : l'IA préfère les coups que de vrais joueurs essaient
  // le plus, pas juste "toute suite théorique connue" au hasard). Ne bloque
  // jamais rien : si la position n'est pas encore prête côté Lichess (ou en
  // échec réseau), `pickOpponentContinuation` retombe sur le tirage uniforme
  // déjà en place, exactement comme avant l'intégration.
  const movePopularity = useMovePopularity(fen);
  const freshPopularity =
    movePopularity.status === "ready" && movePopularity.fen === fen ? movePopularity.moves : null;

  const useScript = selection !== null && selection.kind !== "random" && script !== null;
  // Ply COMPTÉ DEPUIS LE DÉBUT DE LA PARTIE INTERACTIVE — exclut les coups
  // d'autoplay déjà joués avant de rendre la main (voir `leadInLength`) : sert
  // d'index dans `script`, qui ne couvre lui aussi que la partie interactive.
  const plyIndex = history.length - leadInLength;
  const expectedUci = useScript && script && plyIndex >= 0 && plyIndex < script.length ? script[plyIndex] : null;

  // Ligne principale / variante / piège — les sélections soumises au
  // protocole en 2 manches (voir `LearningRound`) : Aléatoire, Test Final,
  // Correction ciblée ET Pion Poison gardent une manche unique, comme avant.
  // Un piège (`"trap"`) s'y ajoute (audit UX du 2026-09-02, alignement strict
  // sur le protocole Listudy pour l'onglet Pièges) SANS jamais toucher
  // `"mistake"` (`opening-mistake-exercise.tsx`, resté à manche unique).
  const usesLearningRounds =
    selection !== null &&
    (selection.kind === "main-line" || selection.kind === "variation" || selection.kind === "trap");
  /** Le bouton d'indice n'est recevable qu'en Manche 1 — DÉSACTIVÉ en Manche 2 (voir `LearningRound`). */
  const hintsAllowed = !usesLearningRounds || learningRound === 1;
  /**
   * Un chapitre à protocole 2-manches enchaîne normalement Manche 1 → Manche 2
   * INSTANTANÉMENT (`main-line`/`variation`, comportement historique inchangé
   * — voir `completeRound`). Un piège (`"trap"`) exige au contraire un choix
   * EXPLICITE du joueur (bouton « 🔒 Retenter sans guide », cahier des charges
   * Pièges) : dérivé du seul `selection.kind`, jamais un paramètre exposé du
   * hook — impossible à activer par erreur pour `main-line`/`variation`.
   */
  const manualRoundGate = selection?.kind === "trap";

  // Second champ (côté après l'espace) d'un FEN : le camp au trait — évite de
  // repasser par `chess.js` uniquement pour ça, `fen` (state) le porte déjà.
  const isPlayerTurn = fen.split(" ")[1] === userColor;

  /** Clé POSITION + coup du coup scripté attendu MAINTENANT (voir `move-success-counter.ts`) — `null` hors sélection scriptée. */
  const hintMoveKey = useScript && expectedUci ? moveSuccessKey(fen, expectedUci) : null;
  // Recalculé à chaque rendu à partir de `localStorage` plutôt que mis en
  // cache dans un state React : cette donnée ne peut PAS changer tant qu'on
  // regarde une position donnée (elle n'est mise à jour qu'APRÈS un coup
  // réussi, qui fait de toute façon changer `fen`, donc `hintMoveKey`) — un
  // state dédié n'apporterait qu'un risque de désynchronisation pour un coût
  // de lecture négligeable (petit objet JSON).
  const hintMoveSuccessCount = hintMoveKey ? getMoveSuccessCount(hintMoveKey) : 0;

  /**
   * Flèche d'indice automatique façon Listudy (voir le docstring du fichier
   * et `HintArrowBehavior`) — `null` tant qu'elle ne doit PAS s'afficher :
   * hors sélection scriptée (mode Aléatoire, aucun coup fixe à indiquer),
   * hors tour du joueur (l'IA/l'autoplay joue, rien à indiquer), en Manche 2
   * (`hintsAllowed`, test à l'aveugle STRICT — voir le docstring), avec
   * `hintBehavior: "never"`, une fois le coup déjà réussi
   * `HINT_ARROW_SUCCESS_THRESHOLD` fois par le joueur (réglage par défaut),
   * OU dès que la manche a `diverged` (voir le docstring de cet état) : plus
   * aucun « LE » coup attendu unique une fois qu'un embranchement théorique a
   * été choisi, la flèche redeviendrait trompeuse. Calcul délégué à
   * `computeHintArrow` (pure, testable hors React — voir son docstring).
   */
  // Coup de secours pour la flèche d'indice une fois qu'il n'y a plus de
  // script fiable à pointer (`diverged`, voir le docstring du fichier) : le
  // plus joué par de vrais joueurs à cette position, DÉTERMINISTE (voir
  // `mostPopularContinuation` — ne pas confondre avec le tirage pondéré de
  // `pickOpponentContinuation` utilisé pour le coup RÉEL de l'IA). `null`
  // tant qu'aucune continuation théorique n'est encore connue pour cette
  // position précise.
  const fallbackHintUci = freshContinuations
    ? (mostPopularContinuation(freshContinuations, freshPopularity)?.uci ?? null)
    : null;

  const hintArrow = computeHintArrow({
    status,
    hintsAllowed,
    hintBehavior,
    // `&& trapPunishment === null` : jamais de flèche d'indice pendant une
    // démonstration de piège (voir son docstring) — la position affichée n'a
    // provisoirement plus rien à voir avec le script normal.
    isPlayerTurn: isPlayerTurn && trapPunishment === null,
    useScript,
    diverged,
    expectedUci,
    hintMoveSuccessCount,
    fallbackUci: fallbackHintUci,
  });

  /**
   * Le coup à trouver MAINTENANT, en UCI — même source que `hintArrow`
   * (script tant que la manche n'a pas `diverged`, sinon le coup le plus
   * populaire) mais SANS ses conditions d'affichage (`hintsAllowed`, seuil de
   * réussite...) : sert le texte du bouton d'indice (`heuristic-commentary.ts`,
   * repli une fois `getMoveCommentary` vide), qui reste lisible même une fois
   * la flèche automatique éteinte — exactement le même contrat que
   * `hintCommentary` avant ce correctif (gating sur `hintsAllowed` seul, voir
   * les appelants). `null` hors sélection scriptée (mode Aléatoire).
   */
  const hintUci = !useScript ? null : !diverged && expectedUci ? expectedUci : fallbackHintUci;

  const finish = useCallback((reason: DrillFinishReason) => {
    setStatus("finished");
    setFinishReason(reason);
  }, []);

  /**
   * Termine la manche en cours.
   *  - Test Final : enchaîne sur la manche suivante s'il en reste, sinon
   *    termine vraiment le drill (Étape 3 du protocole, inchangé) ;
   *  - Ligne principale / variante : la fin de la Manche 1 (indices
   *    autorisés) réinitialise TOUJOURS automatiquement le chapitre en
   *    Manche 2 (indices désactivés, voir `hintsAllowed`) ; la fin de la
   *    Manche 2 ne termine VRAIMENT le drill (et donc ne déclenche la
   *    sauvegarde de la progression, voir l'effet plus bas) que si elle a été
   *    parcourue sans AUCUNE faute — sinon elle se relance depuis le début,
   *    en boucle, jusqu'à ce sans-faute (méthode Listudy stricte) ;
   *  - Aléatoire / Correction ciblée : inchangé, une seule manche.
   *
   * BUG CORRIGÉ (audit UX du 2026-09-02, « bugs de fin de variante qui
   * bloquent la validation de certaines lignes ») : une manche `main-line`/
   * `variation` qui a DIVERGÉ (`diverged`, voir `onPieceDrop`) vers un
   * embranchement théorique réel peut atteindre une position sans AUCUNE
   * continuation connue — `decideOpponentStep` termine alors avec
   * `reason: "no-more-theory"`, jamais `"line-complete"` (réservé à
   * l'épuisement du `script` original). Restreindre le déclenchement du
   * protocole 2-manches au seul `"line-complete"` faisait sauter directement
   * la Manche 2 (et la sauvegarde de la progression) pour toute ligne
   * divergée touchant sa fin théorique naturelle — une fin de ligne pourtant
   * tout aussi légitime pour un chapitre à 2 manches. Les DEUX raisons de fin
   * comptent donc désormais comme une fin de manche pour
   * `usesLearningRounds`.
   *
   * `manualRoundGate` (piège uniquement, voir son docstring) : au lieu de
   * réinitialiser IMMÉDIATEMENT le chapitre en Manche 2, fige la position
   * actuelle et bascule sur `"round-gate"` — c'est `beginNextRound()`, appelé
   * depuis un clic explicite du joueur (« 🔒 Retenter sans guide »), qui
   * effectue le reset réellement écrit ici.
   */
  const completeRound = useCallback(
    (reason: DrillFinishReason, completedScore?: { correct: number; attempted: number }) => {
      if (selection?.kind === "final-test" && roundIndex + 1 < selection.rounds.length) {
        const next = selection.rounds[roundIndex + 1];
        boardRef.current = new Chess(next.startFen);
        setHistory([]);
        setRoundIndex((index) => index + 1);
        setFen(boardRef.current.fen());
        setDiverged(false);
        return;
      }

      if (activeRound && usesLearningRounds) {
        const roundScore = completedScore ?? score;
        // Fin d'une Manche 2 « Sans Guide » (ligne principale/variante) :
        // UNE session d'endurance, fautive ou non — c'est justement la manche
        // fautive qui dit à quel coup la mémoire a lâché. Envoi en arrière-plan
        // (best-effort, comme la répétition espacée) : l'enchaînement de la
        // manche ne l'attend jamais. Un piège (`"trap"`) n'est pas une ligne
        // d'ouverture à tenir : jamais enregistré.
        if (learningRound === 2 && (selection?.kind === "main-line" || selection?.kind === "variation")) {
          const trackedSelection: TrackedDrillSelection =
            selection.kind === "main-line"
              ? { kind: "main-line" }
              : { kind: "variation", eco: selection.variation.eco, name: selection.variation.name };
          void saveEnduranceSessionWithRetry({
            openingId: opening.id,
            openingName: opening.name,
            selection: trackedSelection,
            variationLabel: variationLabelFor(trackedSelection),
            firstMistakePly: firstMistakePlyRef.current,
            // `boardRef` est déjà à jour, y compris quand la manche se termine
            // sur le dernier coup du joueur (`onPieceDrop` appelle
            // `completeRound` avant que `history` (state) n'ait suivi).
            lastPly: roundStartPly + boardRef.current.history().length - leadInLength,
            correct: roundScore.correct,
            attempted: roundScore.attempted,
          });
        }
        firstMistakePlyRef.current = null;
        const outcome = nextLearningRoundOutcome(learningRound, roundScore, playerMovesExpected);
        if (outcome.shouldRestart) {
          if (manualRoundGate) {
            pendingRoundRef.current = { round: activeRound, nextRound: outcome.nextRound };
            setStatus("round-gate");
            return;
          }
          // Enchaînement AUTOMATIQUE Manche 1 → Manche 2 (ou Manche 2 fautive
          // → nouvelle Manche 2, voir `nextLearningRoundOutcome`) : le joueur
          // DOIT voir que la ligne scriptée vient bien de se terminer — voir
          // le docstring de `roundTransitionNotice`. Un mot différent selon
          // qu'on ENTRE dans le test à l'aveugle pour la première fois
          // (`learningRound === 1`) ou qu'on relance une Manche 2 déjà en
          // cours après une faute — ce dernier cas ne doit jamais prétendre
          // que "la théorie vient de se terminer", juste qu'on recommence.
          setRoundTransitionNotice(
            learningRound === 1
              ? "Variante théorique terminée ! 🔒 Passage au test à l'aveugle..."
              : "Faute détectée — 🔁 Nouvelle tentative en Manche 2, sans guide.",
          );
          boardRef.current = new Chess(activeRound.startFen);
          setHistory([]);
          setScore({ correct: 0, attempted: 0 });
          setLearningRound(outcome.nextRound);
          setDiverged(false);
          setFen(boardRef.current.fen());
          return;
        }
      }

      finish(reason);
    },
    [
      selection,
      roundIndex,
      finish,
      activeRound,
      usesLearningRounds,
      manualRoundGate,
      learningRound,
      score,
      playerMovesExpected,
      opening.id,
      opening.name,
      roundStartPly,
      leadInLength,
    ],
  );

  // Efface `roundTransitionNotice` d'elle-même après `ROUND_TRANSITION_NOTICE_MS`
  // — une notification transitoire ne doit jamais rester collée à l'écran
  // indéfiniment. Redéclenché à chaque nouvelle notice (le timer précédent est
  // annulé par le cleanup), jamais interrompu par le reste du drill.
  useEffect(() => {
    if (!roundTransitionNotice) return;
    const timer = setTimeout(() => setRoundTransitionNotice(null), ROUND_TRANSITION_NOTICE_MS);
    return () => clearTimeout(timer);
  }, [roundTransitionNotice]);

  /**
   * Démarre explicitement la manche mise en attente par `completeRound`
   * (`status === "round-gate"`, `manualRoundGate` — voir son docstring) —
   * sans effet si aucune manche n'est en attente (double-clic, appel hors
   * contexte). Effectue exactement le même reset que l'enchaînement
   * automatique `main-line`/`variation` dans `completeRound`, juste retardé
   * jusqu'à ce choix explicite du joueur.
   */
  const beginNextRound = useCallback(() => {
    const pending = pendingRoundRef.current;
    if (!pending) return;
    pendingRoundRef.current = null;
    firstMistakePlyRef.current = null;
    boardRef.current = new Chess(pending.round.startFen);
    setHistory([]);
    setScore({ correct: 0, attempted: 0 });
    setLearningRound(pending.nextRound);
    setDiverged(false);
    setFen(boardRef.current.fen());
    setStatus("playing");
  }, []);

  const playOpponentUci = useCallback(
    (uci: string) => {
      const board = boardRef.current;
      const fenBefore = board.fen();
      let move: Move;
      try {
        move = board.move(moveInputFromUci(uci));
      } catch {
        // Un coup scripté illégal ne devrait jamais arriver (la ligne a déjà
        // été rejouée côté serveur/client, voir `annotateOpeningLine`/
        // `listOpeningVariations`/`build-final-test.ts`) — s'arrêter
        // proprement plutôt que planter. Volontairement un arrêt DUR
        // (`finish`, jamais `completeRound`) : un script invalide signale un
        // problème de données, pas la fin normale d'une manche.
        finish("no-more-theory");
        return;
      }
      setFen(board.fen());
      setHistory((prev) => [...prev, { ply: prev.length + 1, san: move.san, byPlayer: false, result: null, uci, fenBefore }]);
    },
    [finish],
  );

  // Autoplay du "leadInUci" (rejoue la vraie partie du joueur depuis le tout
  // premier coup) — `kind: "mistake"`/`"trap"` avec un lead-in non vide, voir
  // le docstring du fichier. Un pas par tick, à un rythme volontairement lent
  // et régulier (`LEAD_IN_STEP_MS`) pour rester lisible, jamais un flash.
  // `kind: "trap-poison"` : MÊME mécanique, mais `leadInUci` couvre la
  // DÉMONSTRATION ENTIÈRE (mise en place + coup piège + punition, voir son
  // docstring) — une fois épuisé, termine directement le drill plutôt que de
  // rendre la main au joueur (aucune phase interactive en Pion Poison).
  useEffect(() => {
    if (status !== "autoplaying") return;
    if (selection?.kind !== "mistake" && selection?.kind !== "trap" && selection?.kind !== "trap-poison") return;
    const board = boardRef.current;
    const stepIndex = history.length;
    const nextUci = selection.leadInUci[stepIndex];
    if (nextUci === undefined) {
      // Lead-in terminé : la position affichée est déjà `round.startFen`
      // (`"mistake"`/`"trap"`, les deux DOIVENT coïncider par construction,
      // voir `opening-mistakes-hub.tsx`/`buildTrapRound`) — bascule en
      // interactif, plateau déverrouillé. `"trap-poison"` n'a au contraire
      // AUCUNE phase interactive à débloquer : la démonstration vient de se
      // terminer, direction `"finished"`. Déféré au prochain tick, comme
      // `completeRound` ci-dessus (react-hooks/set-state-in-effect).
      const timer = setTimeout(() => {
        if (selection.kind === "trap-poison") finish("line-complete");
        else setStatus("playing");
      }, 0);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      const moverColor = board.turn();
      const fenBefore = board.fen();
      let move: Move;
      try {
        move = board.move(moveInputFromUci(nextUci));
      } catch {
        // Lead-in invalide (données incohérentes) — s'arrêter proprement.
        finish("no-more-theory");
        return;
      }
      setFen(board.fen());
      setHistory((prev) => [
        ...prev,
        { ply: prev.length + 1, san: move.san, byPlayer: moverColor === userColor, result: null, uci: nextUci, fenBefore },
      ]);
    }, LEAD_IN_STEP_MS);
    return () => clearTimeout(timer);
  }, [status, selection, history.length, userColor, finish]);

  // Autoplay de la ligne punitive d'un piège documenté (`trapPunishment`, voir
  // son docstring et `triggerTrapPunishment`) — un coup SAN à la fois, même
  // rythme que le lead-in ci-dessus. `trap.punishmentLine` est déjà validé
  // légal par `traps.test.ts` : un échec ici signalerait des données
  // corrompues, jamais un cas normal — repli défensif (`setTrapPunishment(null)`,
  // sans passer par le reset normal) plutôt qu'une exception non gérée.
  useEffect(() => {
    if (!trapPunishment) return;
    const line = trapPunishment.trap.punishmentLine ?? [];
    if (trapPunishment.playedCount >= line.length) return; // Ligne épuisée : l'effet de reset ci-dessous prend le relais.
    const san = line[trapPunishment.playedCount];
    const timer = setTimeout(() => {
      const board = boardRef.current;
      const fenBefore = board.fen();
      let move: Move;
      try {
        move = board.move(san);
      } catch {
        setTrapPunishment(null);
        return;
      }
      setFen(board.fen());
      setHistory((prev) => [
        ...prev,
        { ply: prev.length + 1, san: move.san, byPlayer: false, result: "trap", uci: uciOf(move), fenBefore },
      ]);
      setTrapPunishment((prev) => (prev ? { ...prev, playedCount: prev.playedCount + 1 } : prev));
    }, TRAP_PUNISHMENT_STEP_MS);
    return () => clearTimeout(timer);
  }, [trapPunishment]);

  // Reset automatique une fois la ligne punitive lue en entier (voir
  // `TRAP_PUNISHMENT_RESET_DELAY_MS`) — ramène la position EXACTEMENT à
  // l'état d'avant le coup fautif (`restoreFen`/`restoreHistoryLength`), pour
  // que le joueur reprenne la bonne ligne théorique. Un seul reset, propre :
  // `boardRef.current` est réassigné une fois, `history` retaillée à sa
  // longueur d'avant l'erreur, `fen` resynchronisé — jamais de mutation
  // partielle laissant `history`/`fen`/`boardRef` en désaccord entre eux.
  useEffect(() => {
    if (!trapPunishment) return;
    const line = trapPunishment.trap.punishmentLine ?? [];
    if (trapPunishment.playedCount < line.length) return; // Encore en cours d'autoplay, voir l'effet ci-dessus.
    const { restoreFen, restoreHistoryLength } = trapPunishment;
    const timer = setTimeout(() => {
      boardRef.current = new Chess(restoreFen);
      setHistory((prev) => prev.slice(0, restoreHistoryLength));
      setFen(restoreFen);
      setTrapPunishment(null);
    }, TRAP_PUNISHMENT_RESET_DELAY_MS);
    return () => clearTimeout(timer);
  }, [trapPunishment]);

  // Fait jouer l'IA dès que c'est son tour — au lancement du drill (ou juste
  // après l'autoplay pour "mistake"), et après chaque coup accepté du joueur
  // (`fen` change alors, ce qui redéclenche cet effet). En mode aléatoire,
  // attend que `freshContinuations` soit au rendez-vous pour la position
  // courante avant de piocher. En pause tant qu'une démonstration de piège
  // joue (`trapPunishment`, voir ses deux effets dédiés ci-dessus) : les deux
  // ne doivent JAMAIS muter `boardRef.current`/`fen` en même temps.
  useEffect(() => {
    if (status !== "playing" || !selection || trapPunishment !== null) return;
    const board = boardRef.current;

    // Décision déférée à `decideOpponentStep` (pure, testable hors React —
    // voir son docstring) ; seul l'EFFET de bord (timer + mutation du plateau)
    // reste ici.
    const step = decideOpponentStep({
      isGameOver: board.isGameOver(),
      isOpponentTurn: board.turn() !== userColor,
      useScript,
      script,
      diverged,
      relativePlyIndex: board.history().length - leadInLength,
      freshContinuations,
      freshPopularity,
      continuationsFailed,
    });

    if (step.type === "wait") return; // tour du joueur, ou continuations pas encore prêtes : rien à faire pour l'instant.
    if (step.type === "complete") {
      // `completeRound` (setState) déféré au prochain tick — l'appeler
      // directement dans le corps de l'effet déclenche cascading renders
      // (react-hooks/set-state-in-effect).
      const timer = setTimeout(() => completeRound(step.reason), 0);
      return () => clearTimeout(timer);
    }
    // `step.type === "play"` : coup scripté OU pioché parmi les continuations
    // théoriques (voir `decideOpponentStep`) — même délai cosmétique dans les
    // deux cas.
    const timer = setTimeout(() => playOpponentUci(step.uci), OPPONENT_MOVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [
    status,
    selection,
    useScript,
    script,
    diverged,
    userColor,
    leadInLength,
    fen,
    freshContinuations,
    freshPopularity,
    continuationsFailed,
    playOpponentUci,
    completeRound,
    trapPunishment,
  ]);

  // Sauvegarde le résultat en répétition espacée dès que le drill se termine
  // — jamais en mode Aléatoire, Test Final, Erreur ciblée ou Piège
  // (`TrackedDrillSelection` ne couvre que « ligne principale »/« variante »,
  // voir `core/curriculum/opening-variation-key.ts`) : ni script fixe à
  // "maîtriser" (Aléatoire), ni UNE variation précise (Test Final compose
  // plusieurs manches ; Erreur ciblée n'est pas un exercice de progression
  // planifiée ; un piège se maîtrise via `trap-progress.ts`, localStorage,
  // jamais cette répétition espacée serveur — voir `OpeningTrapDrill`).
  // `progressSavedRef` garantit un seul envoi par drill, quel que soit le
  // nombre de rendus une fois "finished".
  useEffect(() => {
    if (status !== "finished" || !selection) return;
    if (
      selection.kind === "random" ||
      selection.kind === "final-test" ||
      selection.kind === "mistake" ||
      selection.kind === "trap" ||
      selection.kind === "trap-poison"
    )
      return;
    if (progressSavedRef.current) return;
    progressSavedRef.current = true;

    const trackedSelection: TrackedDrillSelection =
      selection.kind === "main-line"
        ? { kind: "main-line" }
        : { kind: "variation", eco: selection.variation.eco, name: selection.variation.name };

    saveOpeningDrillResultWithRetry({
      openingId: opening.id,
      selection: trackedSelection,
      variationLabel: variationLabelFor(trackedSelection),
      correct: score.correct,
      attempted: score.attempted,
    }).then((result) => {
      // Best-effort MÊME après retries : une panne réseau/DB persistante ne
      // doit jamais bloquer l'écran de fin déjà affiché au joueur (voir
      // `OpeningDrill`) — `progressResult` reste alors `null`, l'écran de fin
      // affiche simplement le score sans le détail de série/prochaine
      // révision. `progressSavedRef` n'est PAS remis à `false` sur un échec
      // définitif : le rendre à `true` dans tous les cas évite une boucle de
      // nouvelles tentatives à chaque rendu tant que le drill reste
      // "finished" (l'effet ne se redéclenche de toute façon jamais tout
      // seul sur cet écran — `start()` est le seul point qui repart à zéro).
      if (result) setProgressResult(result);
    });
  }, [status, selection, score, opening.id]);

  const start = useCallback((sel: DrillSelection) => {
    const hasLeadIn =
      (sel.kind === "mistake" || sel.kind === "trap" || sel.kind === "trap-poison") && sel.leadInUci.length > 0;
    const initialFen = hasLeadIn
      ? START_FEN
      : sel.kind === "final-test"
        ? (sel.rounds[0]?.startFen ?? START_FEN)
        : sel.kind === "mistake" || sel.kind === "trap"
          ? sel.round.startFen
          : sel.kind === "trap-poison"
            ? sel.startFen
            : START_FEN;
    boardRef.current = new Chess(initialFen);
    progressSavedRef.current = false;
    pendingRoundRef.current = null;
    firstMistakePlyRef.current = null;
    setRoundIndex(0);
    setSelection(sel);
    setHistory([]);
    setScore({ correct: 0, attempted: 0 });
    setFinishReason(null);
    setProgressResult(null);
    setErrorPulse(0);
    setTrapPunishment(null);
    setRoundTransitionNotice(null);
    // Chaque nouveau départ (y compris "Recommencer") repart de la Manche 1 —
    // indices ré-autorisés, voir `LearningRound`/`completeRound` — sauf en
    // mode Sans Guide, qui saute la Manche 1 des lignes à apprendre.
    setLearningRound(startInSansGuide && (sel.kind === "main-line" || sel.kind === "variation") ? 2 : 1);
    setDiverged(false);
    setFen(boardRef.current.fen());
    // "trap-poison" sans lead-in (cas défensif, ne devrait jamais survenir en
    // pratique — voir `buildPoisonPawnRound`) : rien à démontrer, le drill
    // termine directement plutôt que de rendre la main à un joueur qui n'a
    // structurellement aucun coup interactif à jouer dans ce mode.
    setStatus(hasLeadIn ? "autoplaying" : sel.kind === "trap-poison" ? "finished" : "playing");
  }, [startInSansGuide]);

  const stop = useCallback(() => {
    setStatus("select");
    setSelection(null);
    setRoundIndex(0);
    setLearningRound(1);
    pendingRoundRef.current = null;
  }, []);

  const commitPlayerMove = useCallback((uci: string) => {
    const board = boardRef.current;
    const fenBefore = board.fen();
    const move = board.move(moveInputFromUci(uci));
    setFen(board.fen());
    setHistory((prev) => [
      ...prev,
      { ply: prev.length + 1, san: move.san, byPlayer: true, result: "correct", uci, fenBefore },
    ]);
    setScore((s) => ({ correct: s.correct + 1, attempted: s.attempted + 1 }));
  }, []);

  /** Coup refusé — jamais rejoint l'historique (react-chessboard fait revenir la pièce), jamais de message : voir le docstring du fichier. Un coup qui correspond à un piège DOCUMENTÉ ne passe jamais par ici, voir `triggerTrapPunishment`. `ply` : ply ABSOLU du coup refusé, retenu dans `firstMistakePlyRef` si c'est la première faute de la manche. */
  const rejectMove = useCallback((ply: number) => {
    firstMistakePlyRef.current ??= ply;
    setScore((s) => ({ ...s, attempted: s.attempted + 1 }));
    setErrorPulse((n) => n + 1);
  }, []);

  /**
   * Un coup légal qui correspond, à cette position EXACTE, à un piège
   * DOCUMENTÉ (`core/curriculum/traps.ts`) — voir le docstring du fichier et
   * de `TrapPunishmentState`. Joue le coup fautif lui-même sur le plateau
   * (accepté, jamais renvoyé à sa case de départ), l'ajoute à `history`
   * (`result: "trap"`, voir son docstring), puis initialise la démonstration :
   * les deux `useEffect` dédiés ci-dessous prennent le relais (autoplay de
   * `trap.punishmentLine`, puis reset automatique) — aucun autre `setState`
   * n'intervient plus une fois cette fonction retournée. `historyLengthBefore`
   * est fourni par l'appelant (`onPieceDrop`, qui lit `history.length` au
   * même rendu) plutôt que relu ici : jamais de `setState` niché dans le
   * callback de mise à jour d'un AUTRE `setState` (anti-pattern, voir React).
   */
  const triggerTrapPunishment = useCallback((trap: OpeningTrap, trapMoveUci: string, historyLengthBefore: number) => {
    const board = boardRef.current;
    const restoreFen = board.fen();
    const trapPly = board.move(moveInputFromUci(trapMoveUci));
    setFen(board.fen());
    setHistory((prev) => [
      ...prev,
      { ply: prev.length + 1, san: trapPly.san, byPlayer: true, result: "trap", uci: trapMoveUci, fenBefore: restoreFen },
    ]);
    setScore((s) => ({ ...s, attempted: s.attempted + 1 }));
    trapNonceRef.current += 1;
    setTrapPunishment({ trap, restoreFen, restoreHistoryLength: historyLengthBefore, playedCount: 0, nonce: trapNonceRef.current });
  }, []);

  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (!targetSquare || status !== "playing" || !selection || trapPunishment !== null) return false;
      const board = boardRef.current;
      if (board.turn() !== userColor) return false;

      // Promotion attendue par le script (ex. "e7e8n" pour un coup de trap
      // qui promeut en cavalier) plutôt que "q" en dur — sinon un coup de
      // script sous-promu était structurellement IMPOSSIBLE à retrouver via
      // glisser-déposer (`attempt.move` échouait toujours à comparer à
      // `expectedUci`), bloquant net certaines variantes avancées sur leur
      // dernier coup. Hors sélection scriptée (ou une fois `diverged`), "q"
      // reste le repli standard du jeu libre.
      const scriptedPromotion =
        useScript && !diverged && expectedUci && expectedUci.length === 5 ? expectedUci.slice(4, 5) : "q";
      const attempt = new Chess(board.fen());
      let move: Move;
      try {
        move = attempt.move({ from: sourceSquare, to: targetSquare, promotion: scriptedPromotion });
      } catch {
        rejectMove(roundStartPly + plyIndex + 1);
        return false;
      }
      const uci = uciOf(move);

      // Piège documenté à CETTE position exacte (`core/curriculum/traps.ts`,
      // voir le docstring du fichier) — prioritaire sur tout le reste, y
      // compris `isKnownBranch` ci-dessous : une gaffe répertoriée déclenche
      // TOUJOURS la démonstration réactive, même si elle se trouve aussi être
      // une branche théorique par ailleurs connue de la base ECO générique.
      // `board.history()` (pas `history`, le state React) : la vraie notation
      // SAN depuis le tout premier coup, fiable quel que soit `leadInLength`.
      const matchedTrap = findMatchingTrap(board.history(), move.san);
      if (matchedTrap) {
        // Un piège joué est une faute au même titre qu'un coup refusé.
        firstMistakePlyRef.current ??= roundStartPly + plyIndex + 1;
        triggerTrapPunishment(matchedTrap, uci, history.length);
        return true;
      }

      if (useScript && !diverged) {
        // Sélection scriptée (ligne principale / variante / manche / correction
        // ciblée) : le coup exact attendu est TOUJOURS recevable — EN PLUS,
        // tout autre embranchement réellement théorique à cette position
        // (`freshContinuations`, désormais curated-aware — voir
        // `listBookContinuations`) l'est aussi : un coup ne doit plus être
        // rejeté au seul motif qu'il appartient à une autre sous-variante
        // valide du même chapitre (cahier des charges, point 3). Dévier vers
        // cet embranchement fait basculer la manche en mode « diverged » :
        // la suite n'est plus dictée par `script` (qui décrivait l'ANCIENNE
        // branche) mais par l'arbre théorique lui-même, comme en mode
        // Aléatoire — voir l'état `diverged` et l'effet qui fait jouer l'IA.
        const isExpected = expectedUci && uci === expectedUci;
        const isKnownBranch = !isExpected && (freshContinuations?.some((c) => c.uci === uci) ?? false);
        if (isExpected || isKnownBranch) {
          // Réussite du coup ATTENDU précisément — jamais pour un coup de
          // l'IA (`playOpponentUci`) ni de l'autoplay (`leadInUci`), qui ne
          // passent jamais par `onPieceDrop` : seule une réussite du JOUEUR
          // fait progresser le compteur qui pilote l'extinction de la flèche
          // d'indice (voir `hintArrow`/`move-success-counter.ts`). Un coup
          // via `isKnownBranch` n'a par nature encore jamais été "réussi" au
          // sens du script attendu — mais il reste un vrai succès théorique,
          // donc compté de la même façon.
          // `board.fen()` ici est encore la position AVANT ce coup —
          // `commitPlayerMove` ci-dessous ne mute `board` qu'ensuite.
          recordMoveSuccess(moveSuccessKey(board.fen(), uci));
          if (isKnownBranch) {
            // Bifurcation vers un embranchement théorique réel : `script` ne
            // décrit plus la suite (voir le docstring de `diverged`) — la fin
            // de manche reste au seul soin de l'effet IA ci-dessous
            // (`freshContinuations.length === 0`), jamais de ce court-circuit.
            setDiverged(true);
            commitPlayerMove(uci);
            return true;
          }
          commitPlayerMove(uci);
          // Le JOUEUR vient de jouer le DERNIER coup du script : la manche se
          // termine ICI, immédiatement et sans attendre une éventuelle
          // réponse de l'IA (qui n'aura jamais lieu, le script est épuisé) —
          // voir le docstring du fichier. Un court-circuit synchrone plutôt
          // que de compter sur l'effet ci-dessous (qui ne réévalue la
          // position qu'au tour de l'IA) : c'est précisément ce délai qui
          // laissait certaines variantes avancées bloquées sur leur dernier
          // coup, sans jamais déclencher `completeRound`/la sauvegarde de
          // progression.
          if (script && plyIndex + 1 >= script.length) {
            completeRound("line-complete", {
              correct: score.correct + 1,
              attempted: score.attempted + 1,
            });
          }
          return true;
        }
        rejectMove(roundStartPly + plyIndex + 1);
        return false;
      }

      // Mode Aléatoire/Surprise, OU manche scriptée déjà `diverged` (voir
      // ci-dessus) : aucun script fixe à respecter, tout coup théorique connu
      // (arbre curaté en priorité, base ECO en repli — `listBookContinuations`)
      // est recevable.
      const isBook = freshContinuations?.some((c) => c.uci === uci) ?? false;
      if (isBook) {
        commitPlayerMove(uci);
        return true;
      }
      rejectMove(roundStartPly + plyIndex + 1);
      return false;
    },
    [
      status,
      selection,
      userColor,
      trapPunishment,
      history.length,
      useScript,
      diverged,
      expectedUci,
      freshContinuations,
      script,
      roundStartPly,
      plyIndex,
      score.correct,
      score.attempted,
      commitPlayerMove,
      completeRound,
      rejectMove,
      triggerTrapPunishment,
    ],
  );

  const canDragPiece = useCallback(
    ({ piece }: PieceHandlerArgs): boolean => {
      // Plateau verrouillé pendant qu'une démonstration de piège se joue
      // (`trapPunishment`, voir son docstring) — l'IA "réplique" seule, aucune
      // pièce du joueur ne doit bouger tant que la punition n'est pas lue.
      if (status !== "playing" || trapPunishment !== null) return false;
      return piece.pieceType.startsWith(userColor);
    },
    [status, userColor, trapPunishment],
  );

  return {
    status,
    selection,
    roundIndex,
    totalRounds: selection?.kind === "final-test" ? selection.rounds.length : 1,
    roundLabel: activeRound?.label ?? null,
    /** Ply ABSOLU (1-based, aligné sur `opening.moves`) du prochain coup à trouver — sert le commentaire pédagogique ET le bouton d'indice (voir `OpeningDrill`). `0` hors sélection scriptée. */
    nextPly: roundStartPly + plyIndex + 1,
    /** Ply ABSOLU du dernier coup joué dans la partie interactive (hors autoplay) — sert le commentaire affiché sous l'échiquier une fois ce coup joué. */
    lastPly: roundStartPly + plyIndex,
    /** Nombre total de demi-coups du script actif (manche en cours) — `null` en mode Aléatoire, qui n'en a aucun. Sert le compteur "Coup X / Y". */
    scriptLength: script?.length ?? null,
    /** Coups déjà trouvés dans la partie INTERACTIVE de la manche en cours (hors autoplay) — voir `scriptLength`. */
    plyIndex,
    /** Manche du protocole en 2 temps (ligne principale/variante) — voir `LearningRound`. Toujours `1` pour les autres sélections. */
    learningRound,
    /** `false` en Manche 2 (ligne principale/variante) : le bouton d'indice ET la flèche d'indice doivent rester masqués/désactivés côté UI. `true` partout ailleurs. */
    hintsAllowed,
    /** Flèche d'indice automatique (case départ/arrivée du coup théorique attendu) — voir le docstring du fichier. `null` tant qu'elle ne doit pas s'afficher. */
    hintArrow,
    /** Le coup à trouver maintenant, en UCI — voir son docstring. Sert de repli au texte de l'indice une fois `fen` connu (`heuristic-commentary.ts`). `null` hors sélection scriptée. */
    hintUci,
    /** Nombre de fois où le coup MAINTENANT attendu a déjà été réussi par le joueur, toutes sessions confondues — sert à un éventuel indicateur UI ("déjà réussi X/2 fois"), la logique d'extinction elle-même vit dans `hintArrow`. `0` hors sélection scriptée. */
    hintMoveSuccessCount,
    /** La manche a-t-elle bifurqué vers un embranchement théorique réel, différent du script initial ? Voir le docstring de l'état `diverged` — sert un éventuel badge UI ("Vous explorez une autre variante"). Toujours `false` hors sélection scriptée. */
    diverged,
    /** Notification transitoire ("Variante théorique terminée ! 🔒...") au moment précis où la Manche 1 débouche sur la Manche 2 — voir son docstring. `null` en dehors de cette fenêtre. */
    roundTransitionNotice,
    fen,
    history,
    score,
    finishReason,
    progressResult,
    userColor,
    errorPulse,
    /** Démonstration de piège documenté en cours (voir le docstring du fichier, « TRAP EXPLORATION RÉACTIVE ») — sert `OpeningCoachingPanel` (alerte + explication) et verrouille le plateau (`canDragPiece`). `null` la plupart du temps. */
    trapPunishment,
    start,
    stop,
    /** À appeler depuis un clic explicite (« 🔒 Retenter sans guide ») pendant `status === "round-gate"` — démarre la manche mise en attente. Sans effet en dehors de cet état. Voir le docstring de `DrillStatus`/`manualRoundGate`. */
    beginNextRound,
    onPieceDrop,
    canDragPiece,
  };
}
