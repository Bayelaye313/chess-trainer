import { BookOpenCheck, Clock, Layers, type LucideIcon } from "lucide-react";
import { OPENING_COURSE_IDS, OFF_REPERTOIRE_COURSE_IDS } from "@/core/curriculum/opening-course-ids";

/**
 * Noms français des familles d'ouvertures venues de la base Lichess et des
 * noms ECO anglais (couche d'affichage uniquement : ids, catalogue et
 * `imported-openings-index.ts` gardent leurs noms d'origine).
 * Ordre : du préfixe le plus long au plus court.
 */
const FAMILY_FR: readonly [string, string][] = [
  ["Queen's Gambit Declined", "Gambit Dame refusé"],
  ["Queen's Gambit Accepted", "Gambit Dame accepté"],
  ["Queen's Gambit", "Gambit Dame"],
  ["Queen's Pawn Game", "Début du pion Dame"],
  ["Queen's Indian Defense", "Défense ouest-indienne"],
  ["King's Indian Defense", "Défense est-indienne"],
  ["King's Indian Attack", "Attaque est-indienne"],
  ["King's Gambit Declined", "Gambit du roi refusé"],
  ["King's Gambit Accepted", "Gambit du roi accepté"],
  ["King's Gambit", "Gambit du roi"],
  ["King's Pawn Game", "Début du pion Roi"],
  ["Sicilian Defense", "Défense sicilienne"],
  ["French Defense", "Défense française"],
  ["Caro-Kann Defense", "Défense Caro-Kann"],
  ["Scandinavian Defense", "Défense scandinave"],
  ["Pirc Defense", "Défense Pirc"],
  ["Modern Defense", "Défense moderne"],
  ["Alekhine Defense", "Défense Alekhine"],
  ["Petrov's Defense", "Défense Petrov"],
  ["Philidor Defense", "Défense Philidor"],
  ["Tarrasch Defense", "Défense Tarrasch"],
  ["Semi-Slav Defense", "Défense semi-slave"],
  ["Slav Defense", "Défense slave"],
  ["Nimzo-Indian Defense", "Défense nimzo-indienne"],
  ["Bogo-Indian Defense", "Défense bogo-indienne"],
  ["Grünfeld Defense", "Défense Grünfeld"],
  ["Benoni Defense", "Défense Benoni"],
  ["Benko Gambit", "Gambit Benko"],
  ["Dutch Defense", "Défense hollandaise"],
  ["Catalan Opening", "Partie catalane"],
  ["English Opening", "Partie anglaise"],
  ["Trompowsky Attack", "Attaque Trompowsky"],
  ["London System", "Système de Londres"],
  ["Ruy Lopez", "Partie espagnole"],
  ["Italian Game", "Partie italienne"],
  ["Scotch Game", "Partie écossaise"],
  ["Scotch Gambit", "Gambit écossais"],
  ["Vienna Game", "Partie viennoise"],
  ["Four Knights Game", "Partie des quatre cavaliers"],
  ["Three Knights Opening", "Partie des trois cavaliers"],
  ["Two Knights Defense", "Défense des deux cavaliers"],
  ["Bishop's Opening", "Partie du fou"],
  ["Center Game", "Partie du centre"],
  ["Ponziani Opening", "Partie Ponziani"],
  ["Blackmar-Diemer Gambit", "Gambit Blackmar-Diemer"],
  ["Zukertort Opening", "Début Zukertort"],
  ["Réti Opening", "Début Réti"],
  ["Indian Defense", "Défense indienne"],
  ["Englund Gambit", "Gambit Englund"],
  ["Owen Defense", "Défense Owen"],
  ["Nimzowitsch Defense", "Défense Nimzowitsch"],
  ["Elephant Gambit", "Gambit de l'éléphant"],
  ["Latvian Gambit", "Gambit letton"],
  ["Danish Gambit", "Gambit danois"],
  ["Smith-Morra Gambit", "Gambit Smith-Morra"],
];

/**
 * Traduit le préfixe de famille d'un nom d'ouverture anglais (« Sicilian
 * Defense: Najdorf Variation » → « Défense sicilienne : Najdorf Variation »).
 * Un nom déjà français ou inconnu passe tel quel.
 */
export function displayOpeningName(name: string): string {
  for (const [en, fr] of FAMILY_FR) {
    if (name === en) return fr;
    if (name.startsWith(`${en}:`)) return `${fr} :${name.slice(en.length + 1)}`;
    if (name.startsWith(`${en},`)) return `${fr},${name.slice(en.length + 1)}`;
  }
  return name;
}

export type CourseState = "complete" | "upcoming" | "card-only";

/**
 * État d'une carte d'ouverture : cours complet ; cours à venir (ouverture
 * curatée sans cours) ; carte seule (famille Lichess : drill uniquement).
 */
export function courseState(openingId: string): CourseState {
  if (OPENING_COURSE_IDS.has(openingId)) return "complete";
  return openingId.startsWith("lichess-") ? "card-only" : "upcoming";
}

export const COURSE_STATE_DISPLAY: Record<CourseState, { label: string; icon: LucideIcon; tone: "success" | "neutral" | "info" }> = {
  complete: { label: "Cours complet", icon: BookOpenCheck, tone: "success" },
  upcoming: { label: "Cours à venir", icon: Clock, tone: "neutral" },
  "card-only": { label: "Carte seule", icon: Layers, tone: "info" },
};

/** Hors répertoire : cours existant mais exclu du plan du jour (`OFF_REPERTOIRE_COURSE_IDS`). */
export function isOffRepertoire(openingId: string): boolean {
  return OFF_REPERTOIRE_COURSE_IDS.has(openingId);
}
