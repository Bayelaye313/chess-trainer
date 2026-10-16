/**
 * Logique pure de la « Zone Stats » d'une ouverture (`opening-stats-zone.tsx`) :
 * compteur d'endurance et bouton d'action intelligent, à partir des sessions
 * « Sans Guide » du joueur (`firstMistakePly`, voir
 * `core/curriculum/opening-endurance.ts`). Les seuils servent aussi à
 * l'historique d'endurance (`opening-endurance-history.ts`) : un même coup
 * est classé pareil sur les deux écrans.
 *
 * Isolé du rendu pour être testé sans DOM (`opening-stats.test.ts`). N'importe
 * PAS `opening-endurance-history.ts`, qui importe déjà ce module.
 *
 * ## Ply contre coup
 *
 * `firstMistakePly` est un DEMI-coup (ply 1 = 1.e4, ply 2 = 1...e5). Les
 * seuils produit (« gaffe avant le coup 6 », « après le coup 12 ») sont des
 * numéros de COUP : on convertit avec `plyToMoveNumber` (ply 11 et 12 =
 * coup 6). Sans cette conversion, un joueur qui gaffe au coup 6 serait classé
 * comme s'il tenait jusqu'au coup 12.
 */
import { MAIN_LINE_VARIATION_KEY } from "@/core/curriculum/opening-variation-key";

/** Gaffe moyenne AVANT ce coup : endurance fragile (rouge). */
export const FRAGILE_BEFORE_MOVE = 6;
/** Gaffe moyenne APRÈS ce coup : endurance solide (vert). */
export const SOLID_AFTER_MOVE = 12;
/** Coup auquel la jauge d'endurance est pleine. */
export const GAUGE_FULL_AT_MOVE = 20;

/** `intact` : aucune gaffe sur toutes les sessions. */
export type EnduranceTier = "fragile" | "moyen" | "solide" | "intact";

export interface EnduranceReading {
  tier: EnduranceTier;
  /** Numéro de coup moyen de la 1re gaffe, `null` pour « intact ». */
  moveNumber: number | null;
  /** Libellé court de la puce, ex. « Coup 5 ». */
  label: string;
  /** Remplissage de la jauge, 0-1 (coup `GAUGE_FULL_AT_MOVE` et plus = jauge pleine). */
  ratio: number;
}

/** Ply (demi-coup, 1 = premier coup blanc) vers numéro de coup. */
export function plyToMoveNumber(ply: number): number {
  return Math.ceil(ply / 2);
}

export function readEndurance(avgMistakePly: number | null): EnduranceReading {
  if (avgMistakePly === null) return { tier: "intact", moveNumber: null, label: "Aucune gaffe", ratio: 1 };
  const moveNumber = plyToMoveNumber(avgMistakePly);
  const tier: EnduranceTier =
    moveNumber < FRAGILE_BEFORE_MOVE ? "fragile" : moveNumber > SOLID_AFTER_MOVE ? "solide" : "moyen";
  return { tier, moveNumber, label: `Coup ${moveNumber}`, ratio: Math.min(moveNumber / GAUGE_FULL_AT_MOVE, 1) };
}

/**
 * Ancre de l'échiquier du drill sur `/ouvertures/[slug]` (posée par
 * `OpeningExplorer`). Les boutons de la Zone Stats pointent vers la page où
 * l'on se trouve déjà, avec le drill de la ligne principale déjà démarré :
 * sans ancre, un clic ne changeait rien de visible.
 */
export const DRILL_ANCHOR_ID = "drill";

/** Valeur de `?mode=` qui démarre le drill directement en Manche 2 (indices désactivés). */
export const SANS_GUIDE_MODE = "sans-guide";

export interface SmartTrigger {
  /** `reflexes` : gaffe avant le coup 6 · `consolidation` : coups 6-12 · `survie` : après le coup 12 ou aucune gaffe. */
  kind: "reflexes" | "consolidation" | "survie";
  label: string;
  /** Une phrase sous le bouton : ce qu'il lance, et pourquoi. */
  hint: string;
  href: string;
}

/**
 * Bouton d'action, selon le palier d'endurance de l'ouverture :
 *  - fragile → drill de la ligne principale démarré en Manche 2 (`?mode=sans-guide`),
 *    pour forcer la mémorisation brute des premiers coups ;
 *  - moyen → drill normal (Manche 1 guidée puis Manche 2) ;
 *  - solide / intact → le cours commenté (`/ouvertures/<id>/cours`, dont les
 *    chapitres « Aléatoire Surprise » se jouent après la théorie). Une
 *    ouverture sans cours retombe sur la ligne principale en Sans Guide, avec
 *    un libellé honnête.
 */
export function resolveTrigger(input: {
  openingId: string;
  playerSide: "white" | "black";
  tier: EnduranceTier;
  hasCourse: boolean;
}): SmartTrigger {
  const query = `?drill=${MAIN_LINE_VARIATION_KEY}&side=${input.playerSide}`;
  const drillHref = `/ouvertures/${input.openingId}${query}#${DRILL_ANCHOR_ID}`;
  const sansGuideHref = `/ouvertures/${input.openingId}${query}&mode=${SANS_GUIDE_MODE}#${DRILL_ANCHOR_ID}`;
  if (input.tier === "fragile") {
    return {
      kind: "reflexes",
      label: "Verrouiller les réflexes (Mode Sans Guide - Début)",
      hint: "Ligne principale sans indice dès le premier coup, jusqu'au sans-faute.",
      href: sansGuideHref,
    };
  }
  if (input.tier === "moyen") {
    return {
      kind: "consolidation",
      label: "Consolider la transition (Ligne principale)",
      hint: "Une manche guidée pour revoir la suite, puis une manche sans indice.",
      href: drillHref,
    };
  }
  if (!input.hasCourse) {
    return {
      kind: "survie",
      label: "Rejouer la ligne principale jusqu'au bout",
      hint: "Pas encore de cours commenté pour cette ouverture : on garde la ligne principale, sans indice.",
      href: sansGuideHref,
    };
  }
  return {
    kind: "survie",
    label: "Lancer le simulateur de survie (Milieu de jeu)",
    hint: "Variantes surprises et lignes de club prolongées au-delà de la théorie.",
    href: `/ouvertures/${input.openingId}/cours`,
  };
}
