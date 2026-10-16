import type { AnalysisLimit } from "../analysis/types";

/**
 * Les 4 profils de bots du Sparring Humain Local (onglet « Jouer contre des
 * Bots », `client/features/play`).
 *
 * Purement des données + une petite règle de tirage du temps de réflexion —
 * aucune dépendance framework, importable aussi bien du hook client
 * (`use-play-game.ts`) que du schéma serveur (`server/db/schema/bot-game-results.ts`,
 * en import de TYPE seulement) et des actions serveur (`server/actions/play.ts`).
 */
export type BotProfileId = "poussin" | "club" | "champion" | "stockfish";

export interface BotProfile {
  id: BotProfileId;
  /** Étiquette affichée telle quelle dans le sélecteur de profil. */
  label: string;
  /**
   * ELO cible envoyé tel quel à `UCI_Elo` (voir `EngineOptions.elo`,
   * `stockfish-engine.ts#configure`). `null` = pas de bride
   * (`UCI_LimitStrength = false`) : le profil 💀 Stockfish joue à pleine force.
   */
  elo: number | null;
  /**
   * ELO de référence pour l'estimation de performance en fin de partie (voir
   * `analysis/performance-rating.ts`) — distinct de `elo` sur deux points :
   * - Le plancher réel de l'option UCI_Elo de Stockfish est 1320
   *   (`client/engine/types.ts#MIN_ENGINE_ELO`) : le profil Poussin demande
   *   1000 mais joue en pratique à 1320, `clampElo` s'en charge côté moteur.
   *   `nominalElo` reflète cette force RÉELLE, pas la valeur demandée.
   * - Le profil Stockfish n'a pas d'ELO UCI (`elo: null`) : il lui faut malgré
   *   tout un repère chiffré pour situer une performance humaine face à lui.
   */
  nominalElo: number;
  /**
   * Fenêtre de temps de réflexion simulé (ms), tirée au hasard à chaque coup
   * — `pickMoveLimit` — pour donner l'impression d'un adversaire qui réfléchit
   * plutôt qu'un métronome. `null` pour le profil Stockfish, qui cherche à
   * profondeur fixe (`searchDepth`) sans borne de temps artificielle.
   */
  thinkTimeRangeMs: readonly [number, number] | null;
  /**
   * Profondeur de recherche fixe — seul le profil 💀 Stockfish en a une :
   * « puissance maximale brute », profondeur 16, pas de bride de temps.
   */
  searchDepth: number | null;
}

export const BOT_PROFILES: readonly BotProfile[] = [
  {
    id: "poussin",
    label: "🟢 Poussin (Débutant)",
    elo: 1000,
    nominalElo: 1320,
    thinkTimeRangeMs: [1000, 2000],
    searchDepth: null,
  },
  {
    id: "club",
    label: "🟡 Club (Intermédiaire)",
    elo: 1500,
    nominalElo: 1500,
    thinkTimeRangeMs: [700, 1400],
    searchDepth: null,
  },
  {
    id: "champion",
    label: "🔴 Champion (Avancé)",
    elo: 2000,
    nominalElo: 2000,
    thinkTimeRangeMs: [500, 1000],
    searchDepth: null,
  },
  {
    id: "stockfish",
    label: "💀 Stockfish (Maître)",
    elo: null,
    // Pas d'ELO UCI au-delà duquel se situer : repère conventionnel pour
    // l'estimation de performance, pas une force mesurée.
    nominalElo: 3200,
    thinkTimeRangeMs: null,
    searchDepth: 16,
  },
];

export function getBotProfile(id: BotProfileId): BotProfile {
  const profile = BOT_PROFILES.find((candidate) => candidate.id === id);
  if (!profile) throw new Error(`Profil de bot inconnu : ${id}`);
  return profile;
}

/**
 * Limite de recherche à envoyer au moteur pour le PROCHAIN coup du bot.
 *
 * Un temps de réflexion simulé (Poussin/Club/Champion) est retiré à chaque
 * appel dans sa fenêtre — jamais le même coup après coup, voir
 * `thinkTimeRangeMs`. Le profil Stockfish ignore cette fenêtre : profondeur
 * fixe, aucune borne de temps.
 */
export function pickMoveLimit(profile: BotProfile): AnalysisLimit {
  if (profile.searchDepth !== null) return { depth: profile.searchDepth };
  const [min, max] = profile.thinkTimeRangeMs!;
  return { movetimeMs: Math.round(min + Math.random() * (max - min)) };
}
