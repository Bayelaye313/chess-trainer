import "server-only";
import { Chess } from "chess.js";
import { moveInputFromUci, uciOf } from "@/core/analysis/evaluate-move";
import { mainLine, type VariationNode } from "@/core/chess/pgn-tree";
import { findOpening, OPENINGS, type OpeningLine } from "@/core/curriculum/openings";
import { fetchLichessPopularity, type PopularMove } from "@/server/import/lichess-explorer";
import { findBookMove, type OpeningMatch } from "@/server/import/openings";
import { getCuratedChildren } from "@/server/curriculum/opening-tree-index";
import {
  getEnrichedTreeForCuratedOpening,
  getImportedChildren,
  getImportedFamilyDetail,
  listOpeningFamilies,
} from "@/server/curriculum/imported-openings-index";

/**
 * Lectures pour l'onglet « Ouvertures » — la bibliothèque d'exploration
 * d'ouvertures : le catalogue curaté à la main (`core/curriculum/openings.ts`)
 * FUSIONNÉ avec le catalogue dynamique tiré des ~3810 lignes
 * `imported_opening_lines` (`server/curriculum/imported-openings-index.ts`),
 * voir `client/features/openings/` pour l'écran.
 *
 * `OPENINGS` n'est donc plus la SEULE source de vérité (elle l'est restée
 * longtemps, d'où encore son rôle de repli partout ici) : chaque chapitre
 * curaté est enrichi de toute la profondeur que la base Lichess lui connaît
 * (`getEnrichedTreeForCuratedOpening`), et les familles lichess-org qui n'ont
 * pas encore de chapitre curaté dédié apparaissent comme des entrées à part
 * entière (`listOpeningFamilies`) — plus de plafond artificiel à ~20 entrées.
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
 *
 * Depuis la connexion du catalogue dynamique
 * (`server/curriculum/imported-openings-index.ts`), la ligne principale
 * rejouée ici est celle de l'arbre ENRICHI (chapitre curaté fusionné avec
 * toute la profondeur que la base Lichess lui connaît), pas seulement
 * l'arbre `pgn` écrit à la main — un chapitre curaté sans `pgn` (repli
 * `opening.moves`, toujours géré par `getEnrichedTreeForCuratedOpening` en
 * amont) en profite exactement pareil.
 */
export function annotateOpeningLine(opening: OpeningLine): AnnotatedPly[] {
  const sanMoves = mainLine(getEnrichedTreeForCuratedOpening(opening))
    .map((node) => node.san)
    .filter((san): san is string => san !== null);
  return annotateMoveList(sanMoves);
}

/**
 * `id` désigne soit un chapitre CURATÉ (`core/curriculum/openings.ts`, testé
 * en premier pour ne jamais changer de comportement pour ces ~20 entrées),
 * soit une FAMILLE DYNAMIQUE (`lichess-*`, voir `listOpeningFamilies`) — les
 * ~130 familles lichess-org qui n'ont pas encore de chapitre curaté dédié.
 * `null` si `id` ne désigne ni l'un ni l'autre.
 */
export function getOpeningDetail(id: string): OpeningDetail | null {
  const opening = findOpening(id);
  if (opening) return { opening, plies: annotateOpeningLine(opening), variations: listOpeningVariations(opening) };

  const family = getImportedFamilyDetail(id);
  if (!family) return null;
  const dynamicOpening: OpeningLine = {
    id: family.summary.id,
    name: family.summary.name,
    eco: family.summary.eco,
    side: family.summary.side,
    description: family.summary.description,
    moves: family.summary.rootMoves,
  };
  // `plies` (script de « Ligne principale ») rejoue `rootMoves` — la position
  // de référence courte de la famille (voir `familyRootMoves`) — PAS
  // `mainLine(family.tree)` : contrairement à un chapitre curaté (dont le
  // premier enfant à chaque embranchement est un choix éditorial délibéré, un
  // vrai « fil rouge »), l'arbre d'une famille dynamique fusionne des
  // centaines de lignes SANS ordre de priorité entre elles — son premier
  // enfant à un embranchement donné n'est que le hasard de l'ordre
  // d'insertion, jamais « LA » ligne principale. Toute la profondeur réelle
  // reste pleinement accessible via `variations` (`ChapterSelector`).
  // Mémoïsé comme `listOpeningVariations` ci-dessous (même cache, `id` sert
  // de clé dans les deux cas) : `deriveVariationsFromNode` a gagné un vrai
  // coût depuis `extendWithGlobalTheory` (plusieurs `getImportedChildren` par
  // variante courte) — sans ce cache, chaque appel à `getOpeningDetail` pour
  // une même famille dynamique (chaque rendu de `/ouvertures/[slug]`, chaque
  // test qui la visite) le repayait intégralement.
  const cachedVariations = variationsCache.get(id);
  const variations = cachedVariations ?? deriveVariationsFromNode(family.tree, family.summary.eco);
  if (!cachedVariations) variationsCache.set(id, variations);

  return {
    opening: dynamicOpening,
    plies: annotateMoveList(family.summary.rootMoves),
    variations,
  };
}

/** Un coup légal depuis la position interrogée dont la position d'arrivée est cataloguée en base ECO. */
export interface BookContinuation {
  san: string;
  uci: string;
  eco: string;
  name: string;
  /** Frequence locale relative : branches qui proposent ce coup, sans API externe. */
  weight: number;
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
 * par transposition) sans jamais le rejeter à tort. FUSIONNÉ, pas juste
 * essayé en premier, avec la base importée GLOBALE (`getImportedChildren`,
 * palier 2 ci-dessous) : deux coups DIFFÉRENTS depuis la même position
 * peuvent chacun n'être connus que d'UN SEUL des deux paliers (transposition
 * partielle — ex. après 1.d4 Nf6 2.c4, les chapitres curatés Nimzo-Indienne/
 * Est-Indienne connaissent 2...e6/2...g6, mais SEULE la base importée connaît
 * 2...c5, la Défense Benoni, qui n'a pas de chapitre curaté dédié) — s'arrêter
 * au premier palier non vide, comme avant, rejetait alors à tort tout coup
 * que ce palier gagnant ne couvrait pas.
 *
 * PALIER 2 : la base importée GLOBALE (`getImportedChildren`, les ~3810
 * lignes lichess-org de TOUTES les familles, curatées ou non — voir son
 * docstring). BUG CORRIGÉ (retour utilisateur, « Défense Benoni : la manche
 * s'arrête bien avant la fin réelle de la variante ») : avant ce palier,
 * toute position connue UNIQUEMENT d'une famille dynamique (les 125 familles
 * lichess-org sans chapitre curaté, ex. "Benoni Defense") retombait
 * directement sur la base ECO générique ci-dessous (~3600 positions, TOUTES
 * ouvertures confondues, bien plus pauvre) — vérifié concrètement : la
 * Défense Benoni tombait à 0 coup connu dès le 7ᵉ demi-coup d'une ligne
 * pourtant longue de 19, alors que CETTE MÊME théorie sert par ailleurs à
 * construire le script de la variante (`listOpeningVariations`). Une manche
 * `diverged` (ou en mode Aléatoire) qui traversait une telle position
 * terminait alors prématurément — pas une vraie fin de théorie, un simple
 * angle mort de lookup entre la donnée qui définit le script et celle qui
 * valide ses coups en cours de partie.
 *
 * En cas de collision (même UCI connu des deux paliers), le nom curaté
 * l'emporte (plus soigné, souvent en français) — jamais l'inverse. Repli sur
 * la base ECO générique UNIQUEMENT si NI l'un NI l'autre palier ne connaît
 * la position — jamais de régression pour les chapitres encore sans `pgn`
 * authored ni ligne lichess-org connue.
 */
export function listBookContinuations(fen: string): BookContinuation[] {
  const byUci = new Map<string, BookContinuation>();
  for (const { san, uci, eco, name, variationName, weight } of getCuratedChildren(fen)) {
    byUci.set(uci, { san, uci, eco, name: variationName ?? name, weight });
  }
  for (const { san, uci, eco, variationName, weight } of getImportedChildren(fen)) {
    const existing = byUci.get(uci);
    if (existing) {
      existing.weight += weight;
      continue;
    }
    byUci.set(uci, { san, uci, eco, name: variationName ?? eco, weight });
  }
  if (byUci.size > 0) return Array.from(byUci.values()).sort((a, b) => a.san.localeCompare(b.san));

  const chess = new Chess(fen);
  const continuations: BookContinuation[] = [];
  for (const candidate of chess.moves({ verbose: true })) {
    const after = new Chess(fen);
    const played = after.move(candidate.san);
    const book = findBookMove(after.fen());
    if (book) continuations.push({ san: played.san, uci: uciOf(played), eco: book.eco, name: book.name, weight: 1 });
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
 * Depuis la connexion du catalogue dynamique
 * (`server/curriculum/imported-openings-index.ts`), les variantes viennent en
 * PRIORITÉ de l'arbre ENRICHI (chapitre curaté fusionné avec toute la
 * profondeur que la base Lichess lui connaît, voir
 * `getEnrichedTreeForCuratedOpening`) — plus précis et infiniment plus
 * profond qu'une marche heuristique sur la base ECO générique
 * (`VARIATION_MAX_EXTRA_PLY`/`VARIATION_MAX_NODES`, calibrés pour CELLE-CI,
 * pas pour la profondeur d'un vrai répertoire). Le BFS d'origine
 * (`computeOpeningVariations`) reste un repli défensif pour le cas — non
 * rencontré aujourd'hui, chaque chapitre curaté ayant une famille Lichess
 * correspondante — où l'enrichissement ne trouverait rien : jamais de
 * régression pour un futur chapitre sans contrepartie en base.
 */
export function listOpeningVariations(opening: OpeningLine): OpeningVariation[] {
  const cached = variationsCache.get(opening.id);
  if (cached) return cached;
  const enriched = deriveVariationsFromNode(getEnrichedTreeForCuratedOpening(opening), opening.eco);
  const result = enriched.length > 0 ? enriched : computeOpeningVariations(opening);
  variationsCache.set(opening.id, result);
  return result;
}

/**
 * Longueur minimale (en demi-coups) qu'une variante nommée doit atteindre
 * avant d'être proposée telle quelle au Mode Drill — voir
 * `extendWithGlobalTheory`, qui rallonge tout ce qui tombe en dessous. Choisi
 * pour donner une manche substantielle des deux côtés (~4 coups chacun) sans
 * jamais s'éloigner exagérément de l'idée nommée par la variante elle-même.
 */
const MIN_VARIATION_PLIES = 8;

/**
 * Longueur MINIMALE (en demi-coups), APRÈS tentative d'extension
 * (`extendWithGlobalTheory`), en dessous de laquelle une variante nommée est
 * purement et simplement écartée du sélecteur — voir `deriveVariationsFromNode`.
 * Certaines lignes (ex. "Basman Defense" 1.Nf3 h6, ou les 2 variantes de
 * "Zukertort Defense") n'ont RÉELLEMENT aucune suite dans toute la base
 * importée (vérifié : aucune des ~3810 lignes ne les prolonge) — l'extension
 * ne peut alors rien faire, et les laisser telles quelles (souvent 2 demi-
 * coups, parfois 0-1 coup pour le joueur) donnerait une manche insatisfaisante
 * dans un sélecteur qui prétend proposer un chapitre à part entière. Un
 * chapitre écarté ici reste pleinement JOUABLE en divergeant librement depuis
 * `OpeningExplorer`/le mode Aléatoire — seule sa promotion en "manche dédiée"
 * du sélecteur disparaît. Plus bas que `MIN_VARIATION_PLIES` (la cible
 * d'extension) : une ligne qui n'a pu être étendue qu'à 4-7 plies reste tout
 * à fait montrable, seul un DEUX ou TROIS coups pile ne l'est pas.
 */
const MIN_VARIATION_PLIES_TO_DISPLAY = 4;

/**
 * Prolonge une ligne trop courte (`sanMoves`/`uciMoves`, arrêtée au bout de
 * sa PROPRE famille — voir `deriveVariationsFromNode`) avec de VRAIS coups
 * théoriques puisés dans la base importée GLOBALE (`getImportedChildren`,
 * TOUTES familles confondues, transpositions comprises) — jamais un coup
 * inventé : chaque ply ajouté vient d'une ligne réellement cataloguée qui
 * traverse cette même position. S'arrête à `MIN_VARIATION_PLIES`, ou avant si
 * la théorie connue s'épuise réellement à un embranchement donné (`length ===
 * 0`) — une ligne déjà longue, ou qu'aucune autre ligne ne prolonge, ressort
 * inchangée.
 *
 * BUG CORRIGÉ (retour utilisateur direct, « des lignes faibles, peu de
 * variation, des manches courtes » sur Zukertort Opening/Defense) : de
 * nombreuses variantes lichess-org (Herrstrom Gambit, Ware Defense, Basman
 * Defense...) ne sont QUE le nom du premier coup de réponse distinctif — 2
 * demi-coups pile, sans la moindre suite officiellement rattachée à CE nom
 * précis. Avant ce correctif, le Mode Drill s'arrêtait donc après un seul
 * coup joué par l'utilisateur (`decideOpponentStep`, script épuisé) — alors
 * que la théorie réelle ne s'arrête pas là : d'autres lignes de la base
 * globale traversent cette même position et continuent bien plus loin. Choix
 * déterministe par ordre alphabétique de SAN à chaque embranchement (même
 * convention que `listBookContinuations`) — stable d'un appel à l'autre,
 * jamais un tirage aléatoire ni un biais vers une branche plutôt qu'une autre.
 */
function extendWithGlobalTheory(
  startFen: string,
  sanMoves: readonly string[],
  uciMoves: readonly string[],
): { sanMoves: string[]; uciMoves: string[] } {
  const extendedSan = [...sanMoves];
  const extendedUci = [...uciMoves];
  if (extendedSan.length >= MIN_VARIATION_PLIES) return { sanMoves: extendedSan, uciMoves: extendedUci };

  const chess = new Chess(startFen);
  while (extendedSan.length < MIN_VARIATION_PLIES) {
    const continuations = getImportedChildren(chess.fen());
    if (continuations.length === 0) break;
    const next = [...continuations].sort((a, b) => a.san.localeCompare(b.san))[0];
    let move;
    try {
      move = chess.move(moveInputFromUci(next.uci));
    } catch {
      // Garde-fou défensif : ne devrait jamais arriver, `next.uci` vient d'un
      // coup déjà rejoué avec succès à l'import (voir `getImportedChildren`) —
      // s'arrêter proprement plutôt que planter sur une donnée corrompue.
      break;
    }
    extendedSan.push(move.san);
    extendedUci.push(next.uci);
  }
  return { sanMoves: extendedSan, uciMoves: extendedUci };
}

/**
 * Parcourt un arbre de variantes (DFS) : chaque nœud dont `comment` définit
 * un nom (voir `core/chess/pgn-tree.ts`) devient une variante, étendue
 * jusqu'au bout de sa PROPRE ligne principale (premier enfant à chaque étape
 * suivante) — la variante affichée porte donc toute sa suite déjà connue, pas
 * seulement le coup qui l'ouvre — PUIS au-delà avec la théorie globale si
 * elle reste trop courte (voir `extendWithGlobalTheory`). `fallbackEco`
 * s'applique aux nœuds sans `eco` propre (tout arbre `pgn` authored à la
 * main, voir `core/curriculum/openings.ts`) — les nœuds issus de la base
 * Lichess portent le leur (voir `VariationNode.eco`, posé par
 * `buildTreeFromLines`).
 */
function deriveVariationsFromNode(tree: VariationNode, fallbackEco: string): OpeningVariation[] {
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
        const extended = extendWithGlobalTheory(cursor.fen, deepSan, deepUci);
        // Sous le plancher même après tentative d'extension (voir son
        // docstring) : aucune vraie suite ne prolonge cette ligne nulle part
        // dans la base — écartée du sélecteur plutôt que promue en "manche"
        // insatisfaisante.
        if (extended.sanMoves.length >= MIN_VARIATION_PLIES_TO_DISPLAY) {
          const eco = child.eco ?? fallbackEco;
          found.set(`${eco}|${child.comment}`, {
            eco,
            name: child.comment,
            sanMoves: extended.sanMoves,
            uciMoves: extended.uciMoves,
          });
        }
      }
      walk(child, nextSan, nextUci);
    }
  }

  walk(tree, [], []);
  return Array.from(found.values()).sort(
    (a, b) => a.sanMoves.length - b.sanMoves.length || a.name.localeCompare(b.name),
  );
}

/**
 * Clé = `opening.id` (chapitre curaté OU famille dynamique `lichess-*`, voir
 * `getOpeningDetail`) : le résultat pour un id donné ne peut jamais changer
 * d'un appel à l'autre tant que le process tourne (catalogue statique + import
 * PGN figé jusqu'au prochain `db:seed-pgn`). Sans ce cache, chaque chargement
 * de `/ouvertures/[slug]` repayait l'intégralité de la marche récursive (des
 * centaines de clones `chess.js`) — perceptible côté utilisateur, et depuis
 * `extendWithGlobalTheory` (plusieurs `getImportedChildren` par variante
 * courte à rallonger) franchement coûteux pour une famille dynamique riche.
 * `Map` module-level : survit tant que le process serveur tourne, se repeuple
 * tout seul après un redémarrage.
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

/**
 * La bibliothèque complète de l'onglet « Ouvertures » : les ~20 chapitres
 * curatés à la main (`core/curriculum/openings.ts`, noms français, contenu
 * pédagogique dédié) SUIVIS de toutes les familles lichess-org qui n'en ont
 * pas encore (`listOpeningFamilies` exclut déjà celles qui sont représentées
 * par un chapitre curaté — voir `CURATED_FAMILY_HUB`) — plus plate barrière à
 * 20 entrées, voir `server/curriculum/imported-openings-index.ts`.
 */
export function listOpenings(): OpeningSummary[] {
  const curated = OPENINGS.map((opening) => ({
    id: opening.id,
    name: opening.name,
    eco: opening.eco,
    side: opening.side,
    description: opening.description,
    preview: formatMovePreview(opening.moves),
  }));
  const dynamic = listOpeningFamilies().map((family) => ({
    id: family.id,
    name: family.name,
    eco: family.eco,
    side: family.side,
    description: family.description,
    preview: formatMovePreview(family.rootMoves),
  }));
  return [...curated, ...dynamic];
}
