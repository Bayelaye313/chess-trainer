/**
 * Habillage e-sport COMMUN à tous les échiquiers de l'application — à étaler
 * en tête des `options` de chaque `<Chessboard>` (`{ ...ESPORT_BOARD_OPTIONS,
 * id, position, … }`) : une option posée après l'écrase (ex. la durée
 * d'animation du coup adverse, `OPPONENT_MOVE_ANIMATION_MS`).
 *
 * Remplace les cases brun/ambre par défaut de `react-chessboard`
 * (#B58863/#F0D9B5) par une ardoise froide assortie au canevas e-sport
 * (`components/ui/esport-page.module.css`), cadre à halo cyan. Les couleurs de
 * surbrillance de qualité (`qualitySquareColor`) restent lisibles dessus.
 */
import type { CSSProperties } from "react";

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
