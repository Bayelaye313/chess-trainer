import type { ChessMoveNode } from "@/core/chess/move-tree";

/**
 * État de navigation de `CourseTreeViewer` — module PUR (aucun React), testé
 * à part (`course-tree-nav.test.ts`). Tout changement de curseur passe par
 * `courseTreeNavReducer` : jamais un `setState` dérivé dans un `useEffect`
 * (règle `react-hooks/set-state-in-effect` du dépôt).
 *
 * Deux modes, comme une étude Lichess :
 *  - `read` : navigation libre dans l'arbre (clic, ←/→), tout est visible ;
 *  - `play` : le mode « gamebook » de Lichess — le lecteur doit jouer lui-même
 *    les coups du camp qui a le trait à la racine du chapitre, les réponses
 *    adverses sont jouées pour lui. Un coup qui n'est pas dans l'arbre est refusé
 *    (`feedback: "wrong"`), un indice montre la flèche du coup attendu.
 *
 * Indices progressifs (`ChessMoveNode.hints`) : chaque « Indice » monte
 * `hintLevel` d'un cran. Sur un nœud qui porte N indices, les niveaux 1..N
 * dévoilent les textes un par un, et seul le niveau N+1 montre la flèche du
 * coup attendu ; sans indice, le niveau 1 montre directement la flèche.
 */
export type CourseTreeMode = "read" | "play";
export type CourseTreeFeedback = "idle" | "wrong" | "hint";

export interface CourseTreeNavState {
  chapterIndex: number;
  currentId: string;
  mode: CourseTreeMode;
  feedback: CourseTreeFeedback;
  /** Nombre de clics « Indice » sur le nœud courant (remis à 0 à chaque changement de nœud). */
  hintLevel: number;
}

export type CourseTreeNavAction =
  | { type: "select"; id: string }
  | { type: "chapter"; index: number; rootId: string }
  | { type: "mode"; mode: CourseTreeMode; rootId: string }
  | { type: "wrong" }
  | { type: "hint" };

export function initialCourseTreeNav(rootId: string): CourseTreeNavState {
  return { chapterIndex: 0, currentId: rootId, mode: "read", feedback: "idle", hintLevel: 0 };
}

export function courseTreeNavReducer(state: CourseTreeNavState, action: CourseTreeNavAction): CourseTreeNavState {
  switch (action.type) {
    case "select":
      return { ...state, currentId: action.id, feedback: "idle", hintLevel: 0 };
    case "chapter":
      return { ...state, chapterIndex: action.index, currentId: action.rootId, feedback: "idle", hintLevel: 0 };
    case "mode":
      // Entrer en mode jeu repart de la racine du chapitre : on rejoue la ligne
      // depuis le début, jamais depuis un nœud où les coups sont déjà visibles.
      return { ...state, mode: action.mode, currentId: action.mode === "play" ? action.rootId : state.currentId, feedback: "idle", hintLevel: 0 };
    case "wrong":
      return { ...state, feedback: "wrong" };
    case "hint":
      return { ...state, feedback: "hint", hintLevel: state.hintLevel + 1 };
    default:
      return state;
  }
}

/** Camp au trait d'une FEN (`"w"`/`"b"`), sans instancier chess.js. */
export function turnOfFen(fen: string): "w" | "b" {
  return fen.split(" ")[1] === "b" ? "b" : "w";
}

/**
 * L'enfant de `node` joué par le glisser-déposer `from`→`to`, ou `null` si ce
 * coup n'est pas dans l'arbre. Comparaison UCI : une promotion sans pièce
 * précisée vaut dame (l'échiquier ne propose pas de sélecteur, voir
 * `docs/02-ARCHITECTURE.md`, « Promotion toujours dame »). La ligne principale
 * est testée en premier, puis les variantes — un coup de variante réel est
 * accepté et ouvre sa branche, comme dans une étude Lichess.
 */
export function childForDrop(node: ChessMoveNode, from: string, to: string): ChessMoveNode | null {
  const base = from + to;
  return node.children.find((child) => child.uci === base || child.uci === `${base}q`) ?? null;
}

/** `true` si c'est au lecteur de jouer sur `node` en mode `play` : il reste un coup ET le trait est au camp du lecteur. */
export function isPlayerTurn(node: ChessMoveNode, playerColor: "w" | "b"): boolean {
  return node.children.length > 0 && turnOfFen(node.fen) === playerColor;
}

/** `true` quand la flèche du coup attendu est dévoilée : tous les indices textuels de `node` ont été lus, puis un clic de plus. */
export function moveArrowRevealed(node: ChessMoveNode, hintLevel: number): boolean {
  return hintLevel > node.hints.length;
}
