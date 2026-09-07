import "server-only";

/**
 * Index global des arbres de variantes du catalogue (`core/curriculum/openings.ts`)
 * — le mécanisme qui rend le Mode Entraînement et la détection d'erreurs
 * (`server/queries/opening-mistakes.ts`) capables d'accepter/reconnaître
 * N'IMPORTE QUEL coup théorique valide à une position donnée, pas seulement
 * celui d'UN chapitre précis : une même position (même FEN) peut apparaître
 * dans PLUSIEURS arbres (transposition entre chapitres, ex. Italienne ↔ Ruy
 * Lopez) — l'index fusionne alors leurs enfants respectifs.
 *
 * Chaque `OpeningLine` a une représentation en arbre UNIFORME : celles qui
 * portent un `pgn` authored (voir son docstring) sont parsées telles quelles
 * (`core/chess/pgn-tree.ts`) ; les autres sont vues comme un arbre strictement
 * linéaire synthétisé depuis `moves` — mêmes types, mêmes fonctions en aval,
 * pas de branchement conditionnel chez les appelants.
 */
import { collectNodes, parsePgnTree, type VariationNode } from "@/core/chess/pgn-tree";
import { OPENINGS, type OpeningLine } from "@/core/curriculum/openings";

/**
 * Un chapitre sans `pgn` authored garde exactement son comportement d'avant :
 * une ligne unique, ici représentée comme un arbre sans aucun embranchement.
 * Réutilise `parsePgnTree` (donc la même validation de légalité) plutôt qu'une
 * marche `chess.js` dédiée — une seule implémentation à maintenir.
 */
function synthesizeLinearTree(moves: readonly string[]): VariationNode {
  return parsePgnTree(moves.join(" "));
}

/**
 * Mémoïsé par `opening.id` — `OPENINGS` est un catalogue figé, le résultat ne
 * peut jamais changer d'un appel à l'autre (même schéma que `variationsCache`
 * dans `server/queries/openings.ts`).
 */
const treeCache = new Map<string, VariationNode>();

export function getOpeningTree(opening: OpeningLine): VariationNode {
  const cached = treeCache.get(opening.id);
  if (cached) return cached;
  const tree = opening.pgn ? parsePgnTree(opening.pgn) : synthesizeLinearTree(opening.moves);
  treeCache.set(opening.id, tree);
  return tree;
}

/** Un nœud d'arbre rencontré à une position donnée, avec le chapitre auquel il appartient. */
export interface CuratedMatch {
  opening: OpeningLine;
  node: VariationNode;
}

/**
 * `fen → tous les (chapitre, nœud) qui atteignent cette position` — construit
 * une seule fois en parcourant l'arbre de CHAQUE ouverture du catalogue
 * (`collectNodes`, racine comprise). Cache module-level : survit tant que le
 * process serveur tourne, comme `variationsCache`.
 */
let globalIndexCache: Map<string, CuratedMatch[]> | null = null;

export function getGlobalCurriculumIndex(): Map<string, CuratedMatch[]> {
  if (globalIndexCache) return globalIndexCache;

  const index = new Map<string, CuratedMatch[]>();
  for (const opening of OPENINGS) {
    const tree = getOpeningTree(opening);
    for (const node of collectNodes(tree)) {
      const match: CuratedMatch = { opening, node };
      const existing = index.get(node.fen);
      if (existing) existing.push(match);
      else index.set(node.fen, [match]);
    }
  }
  globalIndexCache = index;
  return index;
}

/** Un coup théorique connu depuis une position — voir `getCuratedChildren`. */
export interface CuratedContinuation {
  san: string;
  uci: string;
  eco: string;
  name: string;
  /** Nom de la sous-variante que ce coup ouvre, s'il en ouvre une — voir `core/chess/pgn-tree.ts`. */
  variationName: string | null;
  /** Nombre de branches curatées qui proposent ce coup depuis cette position. */
  weight: number;
}

/**
 * Union dédupliquée (par UCI) des coups enfants de TOUS les nœuds connus à
 * `fen`, toutes ouvertures confondues — `[]` si aucun arbre curaté n'atteint
 * cette position. Gère nativement les transpositions entre chapitres : une
 * position partagée par deux répertoires fusionne simplement leurs coups
 * suivants respectifs, sans qu'aucun appelant ait à le savoir.
 */
export function getCuratedChildren(fen: string): CuratedContinuation[] {
  const matches = getGlobalCurriculumIndex().get(fen);
  if (!matches) return [];

  const byUci = new Map<string, CuratedContinuation>();
  for (const { opening, node } of matches) {
    for (const child of node.children) {
      if (!child.uci || !child.san) continue;
      const existing = byUci.get(child.uci);
      if (existing) {
        existing.weight += 1;
        continue;
      }
      byUci.set(child.uci, {
        san: child.san,
        uci: child.uci,
        eco: opening.eco,
        name: opening.name,
        variationName: child.comment,
        weight: 1,
      });
    }
  }
  return Array.from(byUci.values());
}
