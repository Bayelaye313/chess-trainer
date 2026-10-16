/**
 * Habillage e-sport COMMUN à tous les échiquiers de l'application — à étaler
 * en tête des `options` de chaque `<Chessboard>` (`{ ...ESPORT_BOARD_OPTIONS,
 * id, position, … }`) : une option posée après l'écrase (ex. la durée
 * d'animation du coup adverse, `OPPONENT_MOVE_ANIMATION_MS`).
 *
 * Remplace les cases brun/ambre par défaut de `react-chessboard`
 * (#B58863/#F0D9B5) par une ardoise froide assortie au canevas e-sport
 * (`components/ui/esport-page.module.css`), cadre à halo cyan.
 *
 * Marquage des cases façon Lichess, commun lui aussi : voile cyan léger sur
 * le dernier coup, CERCLES (qualité du coup, indices) — jamais une case
 * pleine teintée qui masque la pièce. Voir `lastMoveSquareStyles`.
 */
import type { CSSProperties } from "react";
import type { MoveQuality } from "@/core/chess/types";

/** Durée d'animation par défaut de TOUT déplacement de pièce — fluide, jamais un saut sec. L'easing ease-in-out est forcé dans `globals.css`. */
export const BOARD_MOVE_ANIMATION_MS = 200;

const LIGHT_SQUARE = "#c7d3df";
const DARK_SQUARE = "#4e6a84";

export const ESPORT_BOARD_OPTIONS = {
  lightSquareStyle: { backgroundColor: LIGHT_SQUARE },
  darkSquareStyle: { backgroundColor: DARK_SQUARE },
  lightSquareNotationStyle: { color: DARK_SQUARE },
  darkSquareNotationStyle: { color: LIGHT_SQUARE },
  boardStyle: {
    borderRadius: "3px",
    boxShadow: "0 0 0 1px rgb(102 252 241 / .35), 0 0 22px rgb(102 252 241 / .14), 0 12px 32px rgb(0 0 0 / .45)",
  } satisfies CSSProperties,
  dropSquareStyle: { boxShadow: "inset 0 0 0 3px rgb(102 252 241 / .75)" },
  animationDurationInMs: BOARD_MOVE_ANIMATION_MS,
  showAnimations: true,
} as const;

/**
 * Pinceaux des annotations façon Lichess (`[%csl]`/`[%cal]` et clic droit) :
 * vert, rouge, bleu, jaune — mêmes teintes que lichess.org.
 */
export const LICHESS_BRUSH = {
  green: "#15781b",
  red: "#882020",
  blue: "#003088",
  yellow: "#e68f00",
} as const;

/** Voile du dernier coup joué — cyan e-sport discret, jamais un fond plein. */
export const LAST_MOVE_TINT = "rgb(102 252 241 / .22)";

/**
 * Qualités ordinaires : badge seul, PAS de cercle sur la pièce — un cercle
 * vert sur chaque bon coup attendu (puzzle, coup correct) surcharge le plateau.
 */
const UNRINGED_QUALITIES: ReadonlySet<MoveQuality> = new Set(["best", "okay", "book"]);

/**
 * Couleur du cercle de qualité d'un coup (mêmes jetons `--quality-*` que les
 * pastilles), ou `null` pour une qualité ordinaire — le cercle est réservé
 * aux coups remarquables : Brillant, Critique, Imprécision, Gaffe.
 */
export function qualityRingColor(quality: MoveQuality): string | null {
  return UNRINGED_QUALITIES.has(quality) ? null : `var(--quality-${quality})`;
}

/** Anneau dessiné en fond de case (`squareStyles`) — même rendu que `SquareCircle`, sans `squareRenderer`. */
function ringImage(color: string): string {
  return `radial-gradient(circle closest-side, transparent 84%, ${color} 86%, ${color} 97%, transparent 99%)`;
}

/**
 * `squareStyles` du dernier coup : voile sur les deux cases, et un cercle
 * `ringColor` sur la case d'arrivée pour un coup qualifié (`null` : coup
 * adverse, jamais noté).
 */
export function lastMoveSquareStyles(from: string, to: string, ringColor: string | null = null): Record<string, CSSProperties> {
  return {
    [from]: { backgroundColor: LAST_MOVE_TINT },
    [to]: { backgroundColor: LAST_MOVE_TINT, ...(ringColor ? { backgroundImage: ringImage(ringColor) } : {}) },
  };
}

/** `squareStyles` d'indice : un cercle (vert par défaut) autour de chaque case. */
export function circledSquareStyles(squares: readonly string[], color: string = LICHESS_BRUSH.green): Record<string, CSSProperties> {
  return Object.fromEntries(squares.map((square) => [square, { backgroundImage: ringImage(color) }]));
}

/**
 * Cercle d'annotation Lichess posé SUR une case (au-dessus de la pièce,
 * jamais un fond plein) — à rendre depuis un `squareRenderer`, dans une case
 * en `position: relative` (celle de `react-chessboard` l'est déjà).
 */
export function SquareCircle({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 2 }}>
      <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="7" opacity="0.85" />
    </svg>
  );
}
