import "server-only";
import { Chess } from "chess.js";
import { uciOf } from "@/core/analysis/evaluate-move";
import { mainLine, type VariationNode } from "@/core/chess/pgn-tree";
import { findOpening, OPENINGS, type OpeningLine } from "@/core/curriculum/openings";
import { fetchLichessPopularity, type PopularMove } from "@/server/import/lichess-explorer";
import { findBookMove, type OpeningMatch } from "@/server/import/openings";
import { getCuratedChildren, getOpeningTree } from "@/server/curriculum/opening-tree-index";

/**
 * Lectures pour l'onglet « Ouvertures » — la bibliothèque d'exploration
 * d'ouvertures (voir `core/curriculum/openings.ts` pour le catalogue statique
 * et `client/features/openings/` pour l'écran).
 *
 * Pas de DB ici, contrairement à `curriculum.ts`/`spaced-repetition.ts` : rien
 * à seeder ni à faire progresser, `OPENINGS` EST la source de vérité — cette
 * fonction ne fait que la ré-annoter à la demande via la base ECO.
 *
 * `annotateOpeningLine` rejoue une `OpeningLine` avec chess.js et interroge la
 * base ECO (`findBookMove`) après chaque coup, exactement comme la détection
 * de théorie de la revue de partie. Le nom affiché peut légitimement diverger
 * du libellé de famille du catalogue une fois sorti des variantes les plus
 * jouées — voir le docstring de `core/curriculum/openings.ts`.
 */
export interface AnnotatedPly {
  ply: number;
  san: string;
  uci: string;
  fen: string;
  /** `null` dès que la position n'est plus cataloguée par la base ECO (~3600 positions). */
  book: OpeningMatch | null;
}

export interface OpeningDetail {
  opening: OpeningLine;
  plies: readonly AnnotatedPly[];
  /** Variantes nommées disponibles pour le Mode Drill, voir `listOpeningVariations`. */
  variations: readonly OpeningVariation[];
}

/**
 * Rejoue une séquence de coups SAN depuis la position de départ et l'annote
 * coup par coup via la base ECO — factorisé hors d'`annotateOpeningLine` pour
 * pouvoir annoter n'importe quel « chapitre » (ligne principale OU une
 * variante nommée de `listOpeningVariations`), pas seulement la ligne de
 * référence statique du catalogue. Voir `client/features/openings/` (Études &
 * Chapitres) : le contenu pédagogique (`core/curriculum/opening-commentary.ts`)
 * et l'indicateur "théorique" se calculent de la même façon quel que soit le
 * chapitre affiché.
 */
export function annotateMoveList(sanMoves: readonly string[]): AnnotatedPly[] {
  const chess = new Chess();
  return sanMoves.map((san, index) => {
    const move = chess.move(san);
    return {
      ply: index + 1,
      san: move.san,
      uci: uciOf(move),
      fen: chess.fen(),
      book: findBookMove(chess.fen()),
    };
  });
}

/**
 * BUG CORRIGÉ (audit UI du 2026-08-29) : cette fonction rejouait
 * `opening.moves` — la ligne courte du catalogue (souvent 4 à 10 plies,
 * juste de quoi nommer la famille d'ouverture) — même pour un chapitre qui
 * porte un arbre `pgn` bien plus profond (voir `core/curriculum/openings.ts`).
 * Résultat en Mode Entraînement : le script de la « Ligne principale »
 * s'arrêtait quasi immédiatement (`completeRound("line-complete")` dans
 * `use-opening-drill.ts`) alors que l'arbre authored contenait encore 10+
 * plies de vraie théorie, jamais exploités — la profondeur n'existait que
 * pour les VARIANTES nommées (`deriveVariationsFromTree`) et l'acceptation de
 * coups (`getCuratedChildren`), jamais pour la ligne principale elle-même.
 * `mainLine()` (le premier enfant à chaque embranchement, voir
 * `core/chess/pgn-tree.ts`) est l'équivalent arbre exact de l'ancien
 * `OpeningLine.moves` — l'utiliser ici fait immédiatement gagner tous les
 * chapitres enrichis (Ruy Lopez, Caro-Kann, Najdorf, etc.) toute la
 * profondeur de leur `pgn`, sans toucher aux chapitres pas encore enrichis
 * (repli inchangé sur `opening.moves`).
 */
export function annotateOpeningLine(opening: OpeningLine): AnnotatedPly[] {
  const sanMoves = opening.pgn
    ? mainLine(getOpeningTree(opening))
        .map((node) => node.san)
        .filter((san): san is string => san !== null)
    : opening.moves;
  return annotateMoveList(sanMoves);
}

export function getOpeningDetail(id: string): OpeningDetail | null {
  const opening = findOpening(id);
  if (!opening) return null;
  return { opening, plies: annotateOpeningLine(opening), variations: listOpeningVariations(opening) };
}

/** Un coup légal depuis la position interrogée dont la position d'arrivée est cataloguée en base ECO. */
export interface BookContinuation {
  san: string;
  uci: string;
  eco: string;
  name: string;
}

/**
 * L'arbre des variantes (onglet « Ouvertures ») : tous les coups légaux
 * depuis `fen` dont la position d'arrivée a un nom ECO — pas seulement le
 * coup de la ligne de référence en cours. Sert à afficher les alternatives
 * théoriques à chaque position, pas seulement la suite déjà choisie par le
 * catalogue statique.
 *
 * `chess-openings` ne porte aucun poids de popularité réel (pas de compteur
 * de parties, voir le docstring de `server/import/openings.ts`) : contrairement
 * à un explorateur Lichess, l'ordre ne peut refléter que l'alphabet, pas la
 * fréquence — trié par SAN pour rester stable et prévisible.
 *
 * PRIORITÉ à l'arbre curaté (`server/curriculum/opening-tree-index.ts`) quand
 * il couvre `fen` : nos propres chapitres (avec leurs embranchements réels et
 * leurs noms de sous-variante) sont plus précis que la base ECO générique —
 * c'est ce qui permet au Mode Entraînement d'accepter n'importe quel coup
 * théorique d'UNE AUTRE branche du même chapitre (voire d'un autre chapitre
 * par transposition) sans jamais le rejeter à tort. Repli sur la base ECO
 * UNIQUEMENT pour les positions qu'aucun arbre curaté n'atteint — jamais de
 * régression pour les chapitres encore sans `pgn` authored.
 */
export function listBookContinuations(fen: string): BookContinuation[] {
  const curated = getCuratedChildren(fen);
  if (curated.length > 0) {
    return curated
      .map(({ san, uci, eco, name, variationName }) => ({ san, uci, eco, name: variationName ?? name }))
      .sort((a, b) => a.san.localeCompare(b.san));
  }

  const chess = new Chess(fen);
  const continuations: BookContinuation[] = [];
  for (const candidate of chess.moves({ verbose: true })) {
    const after = new Chess(fen);
    const played = after.move(candidate.san);
    const book = findBookMove(after.fen());
    if (book) continuations.push({ san: played.san, uci: uciOf(played), eco: book.eco, name: book.name });
  }
  return continuations.sort((a, b) => a.san.localeCompare(b.san));
}

/**
 * Coups joués par de vrais humains depuis `fen`, triés par volume de parties
 * décroissant (Lichess Opening Explorer, voir `server/import/lichess-explorer.ts`)
 * — fonction PURE mais pas offline, volontairement séparée de
 * `listBookContinuations` : celle-ci reste 100% ECO embarquée, jamais en
 * échec réseau, pour tout ce qui doit rester fiable (validation d'un coup du
 * joueur). `listPopularContinuations` sert uniquement à PRIORISER le choix de
 * l'IA du Mode Entraînement parmi des coups déjà validés par ailleurs — un
 * appelant qui reçoit `[]` doit toujours retomber sur son comportement
 * précédent (tirage uniforme), jamais bloquer dessus.
 */
export async function listPopularContinuations(fen: string): Promise<PopularMove[]> {
  return fetchLichessPopularity(fen);
}

/** Une variante nommée qui prolonge la ligne de référence d'une ouverture — voir `listOpeningVariations`. */
export interface OpeningVariation {
  eco: string;
  name: string;
  /** Coups SAN depuis le DÉBUT de la partie, ligne de référence comprise. */
  sanMoves: readonly string[];
  /** Même séquence, en UCI — sert de script au Mode Drill (`use-opening-drill.ts`). */
  uciMoves: readonly string[];
}

/**
 * Au-delà, la théorie est de toute façon trop rare pour rester lisible dans
 * un sélecteur de variantes — évite aussi une récursion sans fin sur une
 * position hors théorie qui resterait improbablement « book » très longtemps.
 */
const VARIATION_MAX_EXTRA_PLY = 6;

/**
 * Cap défensif sur le nombre de positions explorées par `listOpeningVariations`.
 * L'arbre des continuations théoriques reste sparse par construction (voir
 * `listBookContinuations` : la plupart des positions n'ont que 0 à quelques
 * suites cataloguées), donc ce plafond n'est en pratique jamais approché sur
 * une ouverture réelle — un simple garde-fou contre un cas pathologique.
 */
const VARIATION_MAX_NODES = 60;

/**
 * Variantes nommées qui prolongent la ligne de référence d'une ouverture,
 * découvertes en explorant l'arbre des continuations théoriques
 * (`listBookContinuations`) au-delà du dernier coup du catalogue statique —
 * pas un répertoire curé à la main : chaque branche vient réellement de la
 * base ECO. Sert le sélecteur « Variante spécifique » du Mode Drill
 * (`use-opening-drill.ts`, `OpeningExplorer`) : « Ruy Lopez » → « Ruy Lopez:
 * Berlin Defense », etc.
 *
 * Ne garde qu'une entrée par nom distinct (`eco`+`name`) — la branche la plus
 * longue rencontrée sous ce nom, la plus représentative de « cette variante
 * précise » avant que la théorie ne bifurque encore une fois.
 *
 * Pour un chapitre avec un `pgn` authored (voir `core/curriculum/openings.ts`),
 * les variantes viennent DIRECTEMENT de son arbre (`deriveVariationsFromTree`)
 * — plus précis et plus profond qu'une marche heuristique sur la base ECO
 * (`VARIATION_MAX_EXTRA_PLY`/`VARIATION_MAX_NODES` sont calibrés pour cette
 * dernière, pas pour la profondeur d'un vrai répertoire). Les chapitres sans
 * `pgn` gardent le BFS existant, sans changement.
 */
export function listOpeningVariations(opening: OpeningLine): OpeningVariation[] {
  const cached = variationsCache.get(opening.id);
  if (cached) return cached;
  const result = opening.pgn ? deriveVariationsFromTree(opening) : computeOpeningVariations(opening);
  variationsCache.set(opening.id, result);
  return result;
}

/**
 * Parcourt l'arbre authored d'un chapitre (DFS) : chaque nœud dont
 * `comment` définit un nom (voir `core/chess/pgn-tree.ts`) devient une
 * variante, étendue jusqu'au bout de sa PROPRE ligne principale (premier
 * enfant à chaque étape suivante) — la variante affichée porte donc toute sa
 * suite déjà connue, pas seulement le coup qui l'ouvre.
 */
function deriveVariationsFromTree(opening: OpeningLine): OpeningVariation[] {
  const found = new Map<string, OpeningVariation>();

  function walk(node: VariationNode, sanPath: readonly string[], uciPath: readonly string[]): void {
    for (const child of node.children) {
      const nextSan = [...sanPath, child.san!];
      const nextUci = [...uciPath, child.uci!];
      if (child.comment) {
        let deepSan = nextSan;
        let deepUci = nextUci;
        let cursor = child;
        while (cursor.children.length > 0) {
          cursor = cursor.children[0];
          deepSan = [...deepSan, cursor.san!];
          deepUci = [...deepUci, cursor.uci!];
        }
        found.set(`${opening.eco}|${child.comment}`, {
          eco: opening.eco,
          name: child.comment,
          sanMoves: deepSan,
          uciMoves: deepUci,
        });
      }
      walk(child, nextSan, nextUci);
    }
  }

  walk(getOpeningTree(opening), [], []);
  return Array.from(found.values()).sort(
    (a, b) => a.sanMoves.length - b.sanMoves.length || a.name.localeCompare(b.name),
  );
}

/**
 * `OPENINGS` est un catalogue statique figé (~20 entrées) : le résultat pour
 * un `opening.id` donné ne peut jamais changer d'un appel à l'autre. Sans ce
 * cache, chaque chargement de `/ouvertures/[slug]` repayait l'intégralité de
 * la marche récursive (des centaines de clones `chess.js`) — perceptible côté
 * utilisateur. `Map` module-level : survit tant que le process serveur tourne,
 * se repeuple tout seul après un redémarrage.
 */
const variationsCache = new Map<string, OpeningVariation[]>();

function computeOpeningVariations(opening: OpeningLine): OpeningVariation[] {
  const chess = new Chess();
  const prefixUci: string[] = [];
  for (const san of opening.moves) {
    prefixUci.push(uciOf(chess.move(san)));
  }

  const found = new Map<string, OpeningVariation>();

  // Parcours en LARGEUR, jamais en profondeur : `VARIATION_MAX_NODES` est un
  // budget global, et une marche en profondeur l'épuiserait sur la toute
  // première branche explorée avant même d'avoir vu les autres coups
  // possibles au premier ply suivant la ligne de référence (bug constaté :
  // la Défense Berlinoise, à un seul coup de la Ruy Lopez, n'apparaissait
  // jamais). La largeur garantit que tous les embranchements proches de la
  // ligne de référence — les plus utiles pour un sélecteur — sont vus avant
  // de creuser plus loin dans l'un d'eux.
  const queue: { fen: string; sanMoves: readonly string[]; uciMoves: readonly string[] }[] = [
    { fen: chess.fen(), sanMoves: opening.moves, uciMoves: prefixUci },
  ];
  let visited = 0;

  while (queue.length > 0 && visited < VARIATION_MAX_NODES) {
    const node = queue.shift()!;
    if (node.sanMoves.length - opening.moves.length >= VARIATION_MAX_EXTRA_PLY) continue;

    for (const continuation of listBookContinuations(node.fen)) {
      if (visited >= VARIATION_MAX_NODES) break;
      visited += 1;

      const key = `${continuation.eco}|${continuation.name}`;
      const nextSan = [...node.sanMoves, continuation.san];
      const nextUci = [...node.uciMoves, continuation.uci];
      const existing = found.get(key);
      if (!existing || nextSan.length > existing.sanMoves.length) {
        found.set(key, { eco: continuation.eco, name: continuation.name, sanMoves: nextSan, uciMoves: nextUci });
      }

      const next = new Chess(node.fen);
      next.move(continuation.san);
      queue.push({ fen: next.fen(), sanMoves: nextSan, uciMoves: nextUci });
    }
  }

  return Array.from(found.values()).sort(
    (a, b) => a.sanMoves.length - b.sanMoves.length || a.name.localeCompare(b.name),
  );
}

/** Aperçu textuel façon PGN pour les cartes de la bibliothèque (ex. « 1. e4 e5 2. Nf3 Nc6 3. Bb5 »). */
export function formatMovePreview(moves: readonly string[]): string {
  const parts: string[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    const moveNumber = i / 2 + 1;
    const white = moves[i];
    const black = moves[i + 1];
    parts.push(black ? `${moveNumber}. ${white} ${black}` : `${moveNumber}. ${white}`);
  }
  return parts.join(" ");
}

export interface OpeningSummary {
  id: string;
  name: string;
  eco: string;
  side: OpeningLine["side"];
  description: string;
  preview: string;
}

export function listOpenings(): OpeningSummary[] {
  return OPENINGS.map((opening) => ({
    id: opening.id,
    name: opening.name,
    eco: opening.eco,
    side: opening.side,
    description: opening.description,
    preview: formatMovePreview(opening.moves),
  }));
}
