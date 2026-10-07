import type { ChessMoveNode } from "@/core/chess/move-tree";

/**
 * Modèle du VOLET DE FEEDBACK UNIQUE du lecteur d'arbre (`course-tree-viewer.tsx`)
 * — cahier des charges du 2026-09-12 : « supprime le parasitage des deux
 * sections concurrentes (moteur et hints), fusionne-les en UN SEUL bloc de
 * feedback contextuel sous l'arbre de notation ».
 *
 * Avant ce module, l'information d'un nœud était éclatée sur trois supports
 * concurrents à l'écran : le commentaire affiché en vrac, la suggestion
 * moteur réduite à une flèche sur l'échiquier, et une pastille d'engrenage
 * dans l'arbre de notation. Un lecteur ne pouvait pas lire « ce que dit
 * l'auteur », « le conseil de GM » et « ce que dit le moteur » comme UN SEUL
 * flux de lecture. `buildCoachFeedback` assemble ces trois sources en une
 * structure unique, affichée d'un bloc à UN seul endroit — la flèche moteur
 * reste sur l'échiquier (elle est géométrique), mais sa LÉGENDE vit désormais
 * dans ce même volet, jamais dans un panneau séparé.
 *
 * Fonction PURE, sans React ni accès moteur : `core/` ne connaît que
 * `chess.js` et les types du domaine. La mise en forme de l'évaluation
 * (« +0.61 », « M3 ») reste hors de ce module : elle est centralisée par
 * `formatEvaluation` (`lib/labels.ts`), et `core/` ne peut pas importer
 * `lib/` (cycle — `labels.ts` importe déjà `core/`). Le composant client
 * appelle donc `formatEvaluation` sur `engine.cp`/`engine.mate`.
 */
export interface CoachEngineNote {
  /** SAN du coup alternatif proposé par le moteur depuis la position du nœud. */
  san: string;
  /** UCI du même coup — sert la flèche sur l'échiquier (`--engine-arrow-best`). */
  uci: string;
  /** Centipions POV Blancs après le coup suggéré, `null` si seul un mat est connu. */
  cp: number | null;
  /** Mat en N après le coup suggéré (positif = Blancs matent), `null` sinon. */
  mate: number | null;
}

export interface CoachFeedback {
  /** Numéro de coup affiché (« 12. » pour les Blancs, « 12… » pour les Noirs) — `null` pour la racine du chapitre, qui n'est pas un coup. */
  moveNumber: string | null;
  /** SAN du coup qui MÈNE à ce nœud — `null` pour la racine. */
  san: string | null;
  /** Annotation de l'auteur pour ce nœud (français), `null` si le nœud n'en porte pas. */
  comment: string | null;
  /** « PRO TIP » de Grand Maître extrait du commentaire source, `null` si absent. */
  tip: string | null;
  /** Suggestion moteur permanente sur ce nœud, `null` si la source n'en publie pas. */
  engine: CoachEngineNote | null;
  /** `true` quand il n'y a strictement rien à dire sur ce nœud (aucune des trois sources). */
  isEmpty: boolean;
}

/**
 * Étiquette de numéro de coup d'un demi-coup (`ply`, 1 = premier coup blanc).
 * Convention PGN : les Blancs ouvrent la paire, les Noirs la ferment avec
 * « … » — jamais un numéro répété pour les deux camps, ce qui rendrait l'arbre
 * de notation ambigu à la lecture.
 */
export function moveNumberLabel(ply: number): string {
  const moveNumber = Math.ceil(ply / 2);
  return ply % 2 === 1 ? `${moveNumber}.` : `${moveNumber}…`;
}

/**
 * Assemble le volet de feedback unique d'un nœud — voir le docstring du
 * module. La racine d'un chapitre (`san === null`) produit un modèle vide mais
 * valide (`moveNumber`/`san`/`engine` à `null`), jamais `null` tout court :
 * l'appelant peut toujours rendre le volet sans test de bordure.
 */
export function buildCoachFeedback(node: ChessMoveNode): CoachFeedback {
  const engine: CoachEngineNote | null = node.engineSuggestion
    ? {
        san: node.engineSuggestion.san,
        uci: node.engineSuggestion.uci,
        cp: node.engineSuggestion.cp,
        mate: node.engineSuggestion.mate,
      }
    : null;

  return {
    moveNumber: node.san === null ? null : moveNumberLabel(node.ply),
    san: node.san,
    comment: node.comment,
    tip: node.tip,
    engine,
    isEmpty: node.comment === null && node.tip === null && engine === null,
  };
}
