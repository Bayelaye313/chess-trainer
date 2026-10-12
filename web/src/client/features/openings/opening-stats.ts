/**
 * Logique pure de la « Zone Stats » d'une ouverture (`opening-stats-zone.tsx`) :
 * diagnostic narratif, compteur d'endurance et déclencheur intelligent, à
 * partir de la performance du joueur sur CETTE ouverture.
 *
 * Isolé du rendu pour être testé sans DOM (`opening-stats.test.ts`) et pour ne
 * dépendre d'aucun écran existant (`openings-screen.tsx`, `opening-explorer.tsx`).
 *
 * ## Ply contre coup
 *
 * `OpeningPerformance.avgMistakePly` est un DEMI-coup (ply 1 = 1.e4, ply 2 =
 * 1...e5). Les seuils produit (« gaffe avant le coup 6 », « après le coup 12 »)
 * sont des numéros de COUP : on convertit avec `plyToMoveNumber`
 * (ply 11 et 12 = coup 6). Sans cette conversion, un joueur qui gaffe au
 * coup 6 serait classé comme s'il tenait jusqu'au coup 12.
 */
import { MAIN_LINE_VARIATION_KEY } from "@/core/curriculum/opening-variation-key";
import type { OpeningPerformance } from "@/core/analysis/types";

/**
 * Données attendues par `OpeningStatsZone`, pour UNE ouverture du catalogue.
 * Construite côté serveur à partir de `OpeningPerformance` (voir
 * `toUserOpeningStats`) : le composant ne lit jamais la base lui-même.
 */
export interface UserOpeningStats {
  /** Id du catalogue `OPENINGS` (`openings.ts`), ex. « slav-defense » — sert aussi de slug de route. */
  openingId: string;
  /** Nom affiché, ex. « Défense Slave ». */
  openingName: string;
  /** Camp avec lequel le joueur a joué cette ouverture (`OpeningPerformance.playerSide`) — oriente le drill. */
  playerSide: "w" | "b";
  /** Parties importées classées dans cette ouverture. */
  gamesPlayed: number;
  /** Taux de victoire en % (0-100). */
  winRate: number;
  /** Précision moyenne en % (0-100), `null` si aucun coup analysé. */
  accuracy: number | null;
  /**
   * Ply moyen de la première gaffe/imprécision en phase d'ouverture, sur les
   * seules parties qui en comptent une — `null` si aucune. Limite connue : les
   * parties jouées proprement ne tirent PAS la moyenne vers le haut.
   */
  avgMistakePly: number | null;
}

/** Sous ce nombre de parties, aucun diagnostic n'est affirmé (même seuil que le bandeau « Ouverture en difficulté »). */
export const MIN_GAMES_FOR_DIAGNOSTIC = 3;
/** Gaffe moyenne AVANT ce coup : endurance fragile (rouge). */
export const FRAGILE_BEFORE_MOVE = 6;
/** Gaffe moyenne APRÈS ce coup : endurance solide (vert). */
export const SOLID_AFTER_MOVE = 12;

export type EnduranceTier = "fragile" | "moyen" | "solide" | "intact";

export interface EnduranceReading {
  tier: EnduranceTier;
  /** Numéro de coup moyen de la 1re gaffe, `null` pour « intact ». */
  moveNumber: number | null;
  /** Libellé court de la puce, ex. « Coup 5 ». */
  label: string;
  /** Remplissage de la jauge, 0-1 (coup 20 et plus = jauge pleine). */
  ratio: number;
}

export interface SmartTrigger {
  kind: "memorisation" | "survie";
  label: string;
  href: string;
}

/** Ply (demi-coup, 1 = premier coup blanc) vers numéro de coup. */
export function plyToMoveNumber(ply: number): number {
  return Math.ceil(ply / 2);
}

const GAUGE_FULL_AT_MOVE = 20;

export function readEndurance(avgMistakePly: number | null): EnduranceReading {
  if (avgMistakePly === null) return { tier: "intact", moveNumber: null, label: "Aucune gaffe", ratio: 1 };
  const moveNumber = plyToMoveNumber(avgMistakePly);
  const tier: EnduranceTier =
    moveNumber < FRAGILE_BEFORE_MOVE ? "fragile" : moveNumber > SOLID_AFTER_MOVE ? "solide" : "moyen";
  return { tier, moveNumber, label: `Coup ${moveNumber}`, ratio: Math.min(moveNumber / GAUGE_FULL_AT_MOVE, 1) };
}

/** Une phrase de profil (style) + une phrase d'endurance, ex. « Agressif et efficace, mais tu t'essouffles au coup 12. » */
export function buildDiagnostic(stats: UserOpeningStats): string {
  if (stats.gamesPlayed < MIN_GAMES_FOR_DIAGNOSTIC) {
    return `Seulement ${stats.gamesPlayed} partie${stats.gamesPlayed > 1 ? "s" : ""} avec ${stats.openingName} : joue encore un peu avant qu'on tire des conclusions.`;
  }
  const profile =
    stats.winRate >= 55
      ? "Tu gagnes souvent avec cette ouverture"
      : stats.winRate >= 40
        ? "Tes résultats sont équilibrés"
        : "Cette ouverture te coûte des points";
  const precision =
    stats.accuracy === null
      ? ""
      : stats.accuracy >= 80
        ? ", avec un jeu précis"
        : stats.accuracy >= 65
          ? ", avec une précision correcte"
          : ", mais ta précision reste basse";
  const endurance = readEndurance(stats.avgMistakePly);
  const tail =
    endurance.tier === "intact"
      ? " Aucune gaffe en phase d'ouverture : tu connais tes lignes."
      : endurance.tier === "fragile"
        ? ` Le problème arrive tôt : ta première gaffe tombe en moyenne au coup ${endurance.moveNumber}, encore en pleine théorie.`
        : endurance.tier === "moyen"
          ? ` Tu tiens la théorie, puis tu t'essouffles vers le coup ${endurance.moveNumber}.`
          : ` Tu tiens longtemps : ta première gaffe n'arrive qu'au coup ${endurance.moveNumber}, au début du milieu de jeu.`;
  return `${profile}${precision}.${tail}`;
}

/**
 * Bouton d'action : mémorisation (drill de la ligne principale) si la gaffe
 * arrive avant le coup 12, simulateur de survie sinon. Le simulateur = le
 * cours commenté (`/ouvertures/<id>/cours`, dont les chapitres « Aléatoire
 * Surprise » se jouent après la théorie) ; une ouverture sans cours retombe
 * sur le drill, avec un libellé honnête.
 */
export function resolveTrigger(stats: UserOpeningStats, hasCourse: boolean): SmartTrigger {
  const drillHref = `/ouvertures/${stats.openingId}?drill=${MAIN_LINE_VARIATION_KEY}&side=${
    stats.playerSide === "b" ? "black" : "white"
  }`;
  const tier = readEndurance(stats.avgMistakePly).tier;
  if (tier === "fragile" || tier === "moyen") {
    return { kind: "memorisation", label: "Renforcer la mémorisation de l'ouverture", href: drillHref };
  }
  if (!hasCourse) return { kind: "survie", label: "Rejouer la ligne principale jusqu'au bout", href: drillHref };
  return { kind: "survie", label: "Lancer le simulateur de survie (Coup 12+)", href: `/ouvertures/${stats.openingId}/cours` };
}

/** Adaptateur serveur : `OpeningPerformance` (groupe ECO) vers `UserOpeningStats` (ouverture du catalogue). */
export function toUserOpeningStats(
  performance: OpeningPerformance,
  opening: { id: string; name: string },
): UserOpeningStats {
  return {
    openingId: opening.id,
    openingName: opening.name,
    playerSide: performance.playerSide,
    gamesPlayed: performance.gamesPlayed,
    winRate: performance.winRate,
    accuracy: performance.accuracy,
    avgMistakePly: performance.avgMistakePly,
  };
}
