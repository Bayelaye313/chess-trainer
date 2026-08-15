import { Chess, type Move } from "chess.js";
import { MINOR_PIECE_VALUE, recaptureValueOf, valueOf } from "./pieces";
import type { MoveQuality } from "./types";

/**
 * Vrai sacrifice : la pièce jouée (cavalier ou plus) atterrit sur une case où
 * l'adversaire peut la reprendre avec une pièce de valeur égale ou inférieure
 * — ET où la pièce jouée n'est pas elle-même défendue.
 *
 * Ce deuxième critère a manqué à la première version : une pièce qui atterrit
 * en prise mais reste défendue par une autre des nôtres n'est qu'un échange
 * normal (si l'adversaire la prend, on reprend aussitôt) — pas un don de
 * matériel. Sans lui, un simple coup de développement soutenu se faisait
 * étiqueter « Brillant » à tort (retour utilisateur direct sur une partie
 * réelle). Un vrai sacrifice laisse la pièce réellement hors de portée d'une
 * reprise immédiate de notre côté.
 *
 * La condition sur le repreneur le moins cher évite de compter comme sacrifice
 * un simple échange favorable (donner un cavalier repris seulement par la dame).
 * C'est le critère qui distingue un coup « Brillant » d'un coup « Meilleur coup ».
 */
export function isSacrifice(before: Chess, move: Move): boolean {
  const piece = before.get(move.from);
  if (!piece || piece.type === "k") return false;

  const movingValue = valueOf(piece);
  if (movingValue < MINOR_PIECE_VALUE) return false;

  // --- 1. CRITÈRE FINANCIER GLOBAL (PREMIER FILTRE CHIRURGICAL) ---
  // Ce que nous capturons immédiatement
  const capturedValue = move.captured ? valueOf({ type: move.captured }) : 0;
  // Ce que nous laissons en prise (la valeur de la pièce qui s'est déplacée)
  const lostValue = movingValue;
  
  // Le bilan de l'échange immédiat. Si l'échange est égal (3 - 3 = 0 comme pour Bxd3)
  // ou à notre avantage (5 - 3 = +2), ce n'est techniquement JAMAIS un sacrifice.
  const netMaterialBalance = capturedValue - lostValue;
  if (netMaterialBalance >= 0) return false;

  // --- 2. ANALYSE GÉOMÉTRIQUE ET SIMULATION (UNIQUEMENT SI VRAI DÉFICIT) ---
  const after = new Chess(move.after);
  const opponent = piece.color === "w" ? "b" : "w";
  const recapturers = after.attackers(move.to, opponent);
  
  // S'il n'y a pas de repreneur, la pièce n'est pas en prise directe
  if (recapturers.length === 0) return false;

  const cheapest = Math.min(...recapturers.map((square) => recaptureValueOf(after.get(square))));
  if (cheapest > movingValue) return false;

  const cheapestRecapturer = recapturers.find(
    (square) => recaptureValueOf(after.get(square)) === cheapest,
  );
  if (!cheapestRecapturer) return false;

  // Simulation de la reprise adverse la moins chère, puis vérification —
  // coups légaux à l'appui (donc en tenant compte des clouages) — si le camp
  // qui vient de sacrifier a une reprise immédiate derrière. `attackers()`
  // ignore les clouages : une pièce qui « voit » la case mais ne peut
  // légalement pas y aller y serait comptée à tort comme défenseur.
  const afterRecapture = new Chess(after.fen());
  afterRecapture.move({ from: cheapestRecapturer, to: move.to, promotion: "q" });
  const canRecapture = afterRecapture.moves({ verbose: true }).some((reply) => reply.to === move.to);

  return !canRecapture;
}


/**
 * Tolérance (points de probabilité de gain) sous laquelle un coup qui n'est
 * PAS l'exact premier choix du moteur reste éligible à « Brillant » —
 * CLAUDE.md : « matches the Best engine choice OR is highly evaluated ».
 *
 * Volontairement bien plus serré que `OKAY_MAX_LOSS` (10 points, voir
 * `classify.ts`) : on ne veut récompenser que les coups quasi ex æquo avec le
 * sommet — un coup simplement « pas mauvais » qui donne du matériel ne
 * mérite pas le label, seulement celui dont le moteur dit qu'il ne perd
 * presque rien à jouer ainsi plutôt que la ligne « propre ».
 */
export const BRILLIANT_NEAR_BEST_MAX_LOSS = 0.5;

/**
 * Seuil (% de probabilité de gain, POV de celui qui sacrifie, mesuré sur la
 * position qui suit immédiatement le coup) sous lequel la position n'est
 * plus « gagnante ou nettement meilleure » — la moitié de la définition du
 * Brillant qui manquait : « the engine confirms the position that follows
 * is winning or clearly better ». 50 = égalité stricte : en dessous, le camp
 * qui a sacrifié reste dans le rouge, quel que soit à quel point le coup
 * était proche du choix du moteur.
 */
export const BRILLIANT_MIN_WIN_PERCENT_AFTER = 50;

/**
 * Le coup joué mérite-il de surclasser sa qualité en « Brillant » ?
 *
 * Conditions, toutes nécessaires (CLAUDE.md « The Elite Move Triad », et la
 * nuance rappelée explicitement : « abandonne du matériel » ET « reste la
 * meilleure idée » — les deux ensemble, pas l'un ou l'autre) :
 * 1. `quality` n'est jamais `critical`. Un sacrifice qui était le SEUL coup
 *    tenable n'a rien d'inventif, le joueur a juste trouvé le coup forcé ;
 *    l'accepter écraserait la distinction Critique/Brillant (bug utilisateur
 *    déjà corrigé une fois, voir le test associé dans
 *    `evaluate-move.test.ts` — ne pas régresser).
 * 2. Le coup est « proche du sommet » (`nearBest`) : soit il EST le premier
 *    choix du moteur (`foundBest`), soit il n'en est écarté que de
 *    `BRILLIANT_NEAR_BEST_MAX_LOSS` points de gain ou moins — un coup
 *    seulement « pas mauvais » (ex. dans la fourchette `okay`, jusqu'à 10
 *    points) reste hors jeu.
 * 3. `winPercentAfter` confirme que la position qui suit reste au moins à
 *    l'égalité pour celui qui sacrifie (`BRILLIANT_MIN_WIN_PERCENT_AFTER`).
 *    Sans ce garde-fou, un coup « aussi bon que le meilleur coup » dans une
 *    position déjà perdue passait à tort en Brillant — être proche du
 *    sommet du classement ne veut rien dire quand le classement entier est
 *    perdant. C'est précisément le sens de « reste gagnante », pas
 *    seulement « n'a rien perdu de plus ».
 * 4. `isSacrifice` : un don de matériel réel, sans reprise immédiate possible.
 *
 * Reste volontairement une fonction de décision séparée de `isSacrifice` (qui
 * ne connaît, elle, que l'échiquier) : ici on mélange qualité déjà classée,
 * marges d'évaluation et géométrie du coup — exactement la frontière que
 * `evaluate-move.ts` doit franchir une fois, pas à chaque site d'appel.
 */
export function isBrilliantSacrifice(
  quality: MoveQuality,
  foundBest: boolean,
  winPercentLoss: number | null,
  winPercentAfter: number | null,
  before: Chess,
  move: Move,
): boolean {
  if (quality === "critical") return false;

  const nearBest = foundBest || (winPercentLoss !== null && winPercentLoss <= BRILLIANT_NEAR_BEST_MAX_LOSS);
  if (!nearBest) return false;

  if (winPercentAfter === null || winPercentAfter < BRILLIANT_MIN_WIN_PERCENT_AFTER) return false;

  return isSacrifice(before, move);
}
