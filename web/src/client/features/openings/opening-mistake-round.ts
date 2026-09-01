/**
 * Construit l'exercice de correction (`DrillSelection.kind === "mistake"`)
 * d'une gaffe/imprécision détectée dans une vraie partie importée
 * (`server/queries/opening-mistakes.ts`) — sert `opening-mistakes-hub.tsx`
 * pour rejouer la partie du joueur depuis le tout premier coup (autoplay)
 * jusqu'à la position fautive, avant de le laisser corriger.
 *
 * Module pur, sans dépendance React : testable indépendamment du hook (voir
 * `build-final-test.ts`, même parti pris).
 *
 * Contrairement à l'ancienne version, `deviation` porte déjà TOUT ce qu'il
 * faut (`fenBefore`, `leadInUci`, `expectedUci`/`expectedSan`) — calculé
 * côté serveur depuis la VRAIE partie importée, jamais depuis la ligne
 * statique `opening.moves` du catalogue restreint (`core/curriculum/openings.ts`) :
 * une gaffe réelle se produit typiquement bien plus loin que les quelques
 * coups couverts par ce catalogue, et une bonne moitié des parties importées
 * ne correspondent même à AUCUN de ses chapitres (voir `openingId: string | null`
 * dans `DeviationGameSummary`) — `buildMistakeRound` n'a donc plus besoin de
 * rejouer quoi que ce soit avec chess.js, juste d'emballer les champs déjà
 * prêts dans un `DrillRound`.
 *
 * La manche est volontairement réduite à UN SEUL coup à trouver (`script`,
 * un seul élément) : "Trouve LA correction théorique", pas une continuation
 * entière — le cahier des charges de la correction ciblée s'arrête là (voir
 * `use-opening-drill.ts`, `kind: "mistake"`).
 */
import type { DrillRound } from "./build-final-test";

/** Le strict nécessaire d'une `DeviationGameSummary`/`DeviationGameSummaryDto` pour construire l'exercice. */
export interface MistakeRoundSource {
  ply: number;
  fenBefore: string;
  expectedSan: string;
  expectedUci: string;
  actualSan: string;
  /** Coup fautif réellement joué, en UCI — avec `fenBefore`, identifie la déviation de façon stable pour `markOpeningMistakeReviewed` (voir `server/db/schema/opening-mistake-review.ts`). Jamais utilisé par `buildMistakeRound` lui-même, seulement transporté jusqu'à `OpeningMistakeExercise`. */
  actualUci: string;
  /** Coups réels (UCI, les deux camps), depuis le tout premier coup jusqu'à `fenBefore` — voir `server/queries/opening-mistakes.ts`. */
  leadInUci: readonly string[];
  /** Nom de l'ouverture réellement jouée dans cette partie (base ECO globale) — sert de libellé de manche, jamais celui, générique, d'un chapitre du catalogue. */
  openingName: string;
}

/**
 * Ce qu'il faut EN PLUS de `MistakeRoundSource` pour l'écran de l'exercice
 * (`OpeningMistakeExercise`) : `playerColor`/`opponentName` alimentent son
 * message ("Dans ta partie avec les Noirs/Blancs contre [Adversaire], tu as
 * joué…") et son sens de plateau. Interface séparée plutôt qu'un simple
 * élargissement de `MistakeRoundSource` pour que `buildMistakeRound` (et ses
 * tests) restent indifférents à ces deux champs.
 */
export interface MistakeExerciseSource extends MistakeRoundSource {
  playerColor: "w" | "b";
  opponentName: string | null;
}

export interface MistakeRoundResult {
  round: DrillRound;
  /** Coups réels (UCI), depuis le tout premier coup, menant à `round.startFen` — rejoués en autoplay par `use-opening-drill.ts`. */
  leadInUci: readonly string[];
}

/**
 * `deviation.fenBefore` EST déjà la position de départ de la manche —
 * `deviation.leadInUci` EST déjà le lead-in complet (voir le docstring du
 * fichier) : ne reste qu'à emballer `expectedUci` en script d'un seul coup.
 */
export function buildMistakeRound(deviation: MistakeRoundSource): MistakeRoundResult {
  return {
    round: {
      startFen: deviation.fenBefore,
      script: [deviation.expectedUci],
      label: deviation.openingName,
      startPly: deviation.ply - 1,
    },
    leadInUci: deviation.leadInUci,
  };
}
