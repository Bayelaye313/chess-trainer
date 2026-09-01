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
  type DrillFinishReason,
  type HintArrowBehavior,
} from "./drill-engine";
import { nextLearningRoundOutcome, type LearningRound } from "./learning-round";
import { moveInputFromUci, uciOf } from "@/core/analysis/evaluate-move";
import type { OpeningLine } from "@/core/curriculum/openings";
import { type TrackedDrillSelection, variationLabelFor } from "@/core/curriculum/opening-variation-key";
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
  for (let attempt = 1; attempt <= SAVE_PROGRESS_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await recordOpeningDrillResult(input);
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
  | { kind: "mistake"; round: DrillRound; leadInUci: readonly string[]; actualSan: string };

export interface DrillHistoryEntry {
  ply: number;
  san: string;
  byPlayer: boolean;
  /** `"correct"` pour un coup du joueur (un coup faux ne rejoint JAMAIS l'historique — la pièce revient, voir le docstring du fichier). `null` pour un coup de l'IA ou de l'autoplay. */
  result: "correct" | null;
}

type DrillStatus = "select" | "autoplaying" | "playing" | "finished";

export function useOpeningDrill({
  opening,
  plies,
  hintBehavior = "until_played_twice",
}: {
  opening: OpeningLine;
  /** Ligne de référence annotée — sert de script au mode « Ligne principale ». */
  plies: readonly AnnotatedPly[];
  /** Pilotage de la flèche d'indice automatique — voir `HintArrowBehavior`. Défaut : méthode Listudy exacte. */
  hintBehavior?: HintArrowBehavior;
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

  // Position « vivante », mutée directement — même schéma que `sandboxRef`
  // dans `use-opening-explorer.ts` : `fen` (state) ne sert qu'à déclencher les
  // rendus, cette instance reste la seule source de vérité pour chess.js.
  const boardRef = useRef(new Chess());
  // Garde-fou contre la double sauvegarde du résultat (l'effet ci-dessous se
  // redéclenche à chaque rendu tant que `status === "finished"`) — remis à
  // `false` à chaque nouveau `start()`, jamais pendant un même drill.
  const progressSavedRef = useRef(false);

  // Le camp du joueur — normalement `opening.side`, MAIS pour une correction
  // ciblée (`kind: "mistake"`) on le déduit plutôt du trait à `round.startFen` :
  // par construction (`buildMistakeRound`), le script d'une correction
  // commence TOUJOURS juste avant le coup fautif du joueur, donc le trait à
  // `startFen` EST son camp dans cette partie précise — fiable même si
  // `opening` est un repli générique (voir `OpeningMistakeExercise`, ouverture
  // retirée du catalogue), contrairement à `opening.side` qui décrirait alors
  // le mauvais camp et retournerait l'échiquier dans le mauvais sens.
  const userColor: "w" | "b" =
    selection?.kind === "mistake" ? new Chess(selection.round.startFen).turn() : opening.side === "white" ? "w" : "b";

  /** Coups d'autoplay (`leadInUci`) pour la sélection courante — `0` hors `kind: "mistake"`. */
  const leadInLength = selection?.kind === "mistake" ? selection.leadInUci.length : 0;

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
    if (selection.kind === "final-test") return selection.rounds[roundIndex] ?? null;
    return selection.round; // "mistake"
  }, [selection, plies, opening.name, roundIndex]);

  const script = activeRound?.script ?? null;
  const roundStartPly = activeRound?.startPly ?? 0;

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

  // Ligne principale / variante — les seules sélections soumises au
  // protocole en 2 manches (voir `LearningRound`) : Aléatoire, Test Final et
  // Correction ciblée gardent une manche unique, comme avant.
  const usesLearningRounds = selection !== null && (selection.kind === "main-line" || selection.kind === "variation");
  /** Le bouton d'indice n'est recevable qu'en Manche 1 — DÉSACTIVÉ en Manche 2 (voir `LearningRound`). */
  const hintsAllowed = !usesLearningRounds || learningRound === 1;

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
  const hintArrow = computeHintArrow({
    status,
    hintsAllowed,
    hintBehavior,
    isPlayerTurn,
    useScript,
    diverged,
    expectedUci,
    hintMoveSuccessCount,
  });

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
   */
  const completeRound = useCallback(
    (reason: DrillFinishReason) => {
      if (selection?.kind === "final-test" && roundIndex + 1 < selection.rounds.length) {
        const next = selection.rounds[roundIndex + 1];
        boardRef.current = new Chess(next.startFen);
        setHistory([]);
        setRoundIndex((index) => index + 1);
        setFen(boardRef.current.fen());
        setDiverged(false);
        return;
      }

      if (reason === "line-complete" && activeRound && usesLearningRounds) {
        const outcome = nextLearningRoundOutcome(learningRound, score);
        if (outcome.shouldRestart) {
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
    [selection, roundIndex, finish, activeRound, usesLearningRounds, learningRound, score],
  );

  const playOpponentUci = useCallback(
    (uci: string) => {
      const board = boardRef.current;
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
      setHistory((prev) => [...prev, { ply: prev.length + 1, san: move.san, byPlayer: false, result: null }]);
    },
    [finish],
  );

  // Autoplay du "leadInUci" (rejoue la vraie partie du joueur depuis le tout
  // premier coup) — UNIQUEMENT `kind: "mistake"` avec un lead-in non vide, voir
  // le docstring du fichier. Un pas par tick, à un rythme volontairement lent
  // et régulier (`LEAD_IN_STEP_MS`) pour rester lisible, jamais un flash.
  useEffect(() => {
    if (status !== "autoplaying" || selection?.kind !== "mistake") return;
    const board = boardRef.current;
    const stepIndex = history.length;
    const nextUci = selection.leadInUci[stepIndex];
    if (nextUci === undefined) {
      // Lead-in terminé : la position affichée est déjà `round.startFen` (les
      // deux DOIVENT coïncider par construction, voir `opening-mistakes-hub.tsx`)
      // — bascule en interactif, plateau déverrouillé pour la correction.
      // Déféré au prochain tick, comme `completeRound` ci-dessus
      // (react-hooks/set-state-in-effect).
      const timer = setTimeout(() => setStatus("playing"), 0);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      const moverColor = board.turn();
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
        { ply: prev.length + 1, san: move.san, byPlayer: moverColor === userColor, result: null },
      ]);
    }, LEAD_IN_STEP_MS);
    return () => clearTimeout(timer);
  }, [status, selection, history.length, userColor, finish]);

  // Fait jouer l'IA dès que c'est son tour — au lancement du drill (ou juste
  // après l'autoplay pour "mistake"), et après chaque coup accepté du joueur
  // (`fen` change alors, ce qui redéclenche cet effet). En mode aléatoire,
  // attend que `freshContinuations` soit au rendez-vous pour la position
  // courante avant de piocher.
  useEffect(() => {
    if (status !== "playing" || !selection) return;
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
    playOpponentUci,
    completeRound,
  ]);

  // Sauvegarde le résultat en répétition espacée dès que le drill se termine
  // — jamais en mode Aléatoire, Test Final ou Erreur ciblée
  // (`TrackedDrillSelection` ne couvre que « ligne principale »/« variante »,
  // voir `core/curriculum/opening-variation-key.ts`) : ni script fixe à
  // "maîtriser" (Aléatoire), ni UNE variation précise (Test Final compose
  // plusieurs manches ; Erreur ciblée n'est pas un exercice de progression
  // planifiée). `progressSavedRef` garantit un seul envoi par drill, quel que
  // soit le nombre de rendus une fois "finished".
  useEffect(() => {
    if (status !== "finished" || !selection) return;
    if (selection.kind === "random" || selection.kind === "final-test" || selection.kind === "mistake") return;
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
    const hasLeadIn = sel.kind === "mistake" && sel.leadInUci.length > 0;
    const initialFen = hasLeadIn
      ? START_FEN
      : sel.kind === "final-test"
        ? (sel.rounds[0]?.startFen ?? START_FEN)
        : sel.kind === "mistake"
          ? sel.round.startFen
          : START_FEN;
    boardRef.current = new Chess(initialFen);
    progressSavedRef.current = false;
    setRoundIndex(0);
    setSelection(sel);
    setHistory([]);
    setScore({ correct: 0, attempted: 0 });
    setFinishReason(null);
    setProgressResult(null);
    setErrorPulse(0);
    // Chaque nouveau départ (y compris "Recommencer") repart de la Manche 1 —
    // indices ré-autorisés, voir `LearningRound`/`completeRound`.
    setLearningRound(1);
    setDiverged(false);
    setFen(boardRef.current.fen());
    setStatus(hasLeadIn ? "autoplaying" : "playing");
  }, []);

  const stop = useCallback(() => {
    setStatus("select");
    setSelection(null);
    setRoundIndex(0);
    setLearningRound(1);
  }, []);

  const commitPlayerMove = useCallback((uci: string) => {
    const board = boardRef.current;
    const move = board.move(moveInputFromUci(uci));
    setFen(board.fen());
    setHistory((prev) => [...prev, { ply: prev.length + 1, san: move.san, byPlayer: true, result: "correct" }]);
    setScore((s) => ({ correct: s.correct + 1, attempted: s.attempted + 1 }));
  }, []);

  /** Coup refusé — jamais rejoint l'historique (react-chessboard fait revenir la pièce), jamais de message : voir le docstring du fichier. */
  const rejectMove = useCallback(() => {
    setScore((s) => ({ ...s, attempted: s.attempted + 1 }));
    setErrorPulse((n) => n + 1);
  }, []);

  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (!targetSquare || status !== "playing" || !selection) return false;
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
        rejectMove();
        return false;
      }
      const uci = uciOf(move);

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
            completeRound("line-complete");
          }
          return true;
        }
        rejectMove();
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
      rejectMove();
      return false;
    },
    [
      status,
      selection,
      userColor,
      useScript,
      diverged,
      expectedUci,
      freshContinuations,
      script,
      plyIndex,
      commitPlayerMove,
      completeRound,
      rejectMove,
    ],
  );

  const canDragPiece = useCallback(
    ({ piece }: PieceHandlerArgs): boolean => {
      if (status !== "playing") return false;
      return piece.pieceType.startsWith(userColor);
    },
    [status, userColor],
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
    /** Nombre de fois où le coup MAINTENANT attendu a déjà été réussi par le joueur, toutes sessions confondues — sert à un éventuel indicateur UI ("déjà réussi X/2 fois"), la logique d'extinction elle-même vit dans `hintArrow`. `0` hors sélection scriptée. */
    hintMoveSuccessCount,
    /** La manche a-t-elle bifurqué vers un embranchement théorique réel, différent du script initial ? Voir le docstring de l'état `diverged` — sert un éventuel badge UI ("Vous explorez une autre variante"). Toujours `false` hors sélection scriptée. */
    diverged,
    fen,
    history,
    score,
    finishReason,
    progressResult,
    userColor,
    errorPulse,
    start,
    stop,
    onPieceDrop,
    canDragPiece,
  };
}
