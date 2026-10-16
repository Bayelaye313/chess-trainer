import type { ChessMoveNode } from "@/core/chess/move-tree";
import type { CoachContext } from "@/core/curriculum/coach-feedbacks";

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
 *
 * Coach Virtuel (`core/curriculum/coach-feedbacks.ts`) : en mode jeu, chaque
 * tentative du lecteur (`wrong`, `played`) met à jour le bilan de la manche
 * (`session`) et range dans `coach` le `CoachContext` du coup à commenter.
 * Tout changement de nœud par `select` (réponse adverse, ←/→, « Suivant »)
 * referme la bulle ; changer de chapitre ou entrer en jeu remet la manche à zéro.
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
  /** Coups refusés sur le nœud courant (remis à 0 à chaque changement de nœud). */
  wrongOnNode: number;
  session: CourseTreeSession;
  /** Dernière tentative à commenter par le Coach Virtuel, `null` quand la bulle est fermée. */
  coach: CourseTreeCoachEvent | null;
}

/** Bilan de la manche en cours (mode jeu) — base de la précision cumulée. */
export interface CourseTreeSession {
  /** Coups du lecteur joués depuis le début de la manche. */
  played: number;
  /** Coups trouvés du premier essai, sans indice ni « Voir le coup ». */
  clean: number;
  /** Coups refusés depuis le début de la manche. */
  errors: number;
}

export interface CourseTreeCoachEvent {
  ctx: CoachContext;
  /** SAN du coup tenté (`null` : coup illégal, rien à citer). */
  san: string | null;
}

/** Coup du lecteur en mode jeu, tel que le viewer le décrit au reducer. */
export interface PlayedMove {
  id: string;
  /** Ply absolu du coup (décalage de chapitre inclus). */
  ply: number;
  san: string | null;
  /** La position quittée portait des indices `[%hint]` : un coup mou adverse à punir. */
  punishesBlunder: boolean;
  /** Coup joué par « Voir le coup » : compté, jamais commenté ni « propre ». */
  revealed: boolean;
}

export type CourseTreeNavAction =
  | { type: "select"; id: string }
  | { type: "chapter"; index: number; rootId: string }
  | { type: "mode"; mode: CourseTreeMode; rootId: string }
  | { type: "wrong"; ply: number; san: string | null }
  | { type: "played"; move: PlayedMove }
  | { type: "hint" };

const EMPTY_SESSION: CourseTreeSession = { played: 0, clean: 0, errors: 0 };

export function initialCourseTreeNav(rootId: string): CourseTreeNavState {
  return { chapterIndex: 0, currentId: rootId, mode: "read", feedback: "idle", hintLevel: 0, wrongOnNode: 0, session: EMPTY_SESSION, coach: null };
}

/** Précision cumulée de la manche en %, `null` tant qu'aucun coup n'est joué. */
export function sessionAccuracy(session: CourseTreeSession): number | null {
  return session.played === 0 ? null : (session.clean / session.played) * 100;
}

/** Bilan de la manche après le coup juste `move`. */
function sessionAfterPlay(state: CourseTreeNavState, move: PlayedMove): CourseTreeSession {
  const clean = state.wrongOnNode === 0 && state.hintLevel === 0 && !move.revealed;
  return { ...state.session, played: state.session.played + 1, clean: state.session.clean + (clean ? 1 : 0) };
}

/**
 * `CoachContext` d'un coup juste du lecteur, avant son application — partagé
 * par le reducer et par le viewer (qui doit savoir, AVANT de programmer la
 * réponse adverse, si le coach va parler et donc geler le jeu).
 */
export function playedCoachContext(state: CourseTreeNavState, move: PlayedMove): CoachContext {
  const session = sessionAfterPlay(state, move);
  return {
    ply: move.ply,
    outcome: "succes",
    afterFailure: state.wrongOnNode > 0,
    isFirstError: false,
    // « Du premier coup », donc sans indice : sinon la félicitation sonnerait faux.
    isSurprise: move.punishesBlunder && state.hintLevel === 0,
    userMovesPlayed: session.played,
    accuracy: sessionAccuracy(session),
  };
}

export function courseTreeNavReducer(state: CourseTreeNavState, action: CourseTreeNavAction): CourseTreeNavState {
  switch (action.type) {
    case "select":
      return { ...state, currentId: action.id, feedback: "idle", hintLevel: 0, wrongOnNode: 0, coach: null };
    case "chapter":
      return { ...state, chapterIndex: action.index, currentId: action.rootId, feedback: "idle", hintLevel: 0, wrongOnNode: 0, session: EMPTY_SESSION, coach: null };
    case "mode":
      // Entrer en mode jeu repart de la racine du chapitre : on rejoue la ligne
      // depuis le début, jamais depuis un nœud où les coups sont déjà visibles.
      return {
        ...state,
        mode: action.mode,
        currentId: action.mode === "play" ? action.rootId : state.currentId,
        feedback: "idle",
        hintLevel: 0,
        wrongOnNode: 0,
        session: action.mode === "play" ? EMPTY_SESSION : state.session,
        coach: null,
      };
    case "wrong": {
      const ctx: CoachContext = {
        ply: action.ply,
        outcome: "echec",
        afterFailure: false,
        isFirstError: state.session.errors === 0,
        isSurprise: false,
        userMovesPlayed: state.session.played,
        accuracy: sessionAccuracy(state.session),
      };
      return {
        ...state,
        feedback: "wrong",
        wrongOnNode: state.wrongOnNode + 1,
        session: { ...state.session, errors: state.session.errors + 1 },
        coach: { ctx, san: action.san },
      };
    }
    case "played": {
      const { move } = action;
      return {
        ...state,
        currentId: move.id,
        feedback: "idle",
        hintLevel: 0,
        wrongOnNode: 0,
        session: sessionAfterPlay(state, move),
        coach: move.revealed ? null : { ctx: playedCoachContext(state, move), san: move.san },
      };
    }
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
