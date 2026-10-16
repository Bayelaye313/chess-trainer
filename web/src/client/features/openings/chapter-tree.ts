/**
 * Regroupe la liste PLATE des variantes d'un chapitre (`OpeningVariation[]`,
 * `server/queries/openings.ts#listOpeningVariations`) en un ARBRE de
 * navigation par embranchements — voir `chapter-selector.tsx`, qui l'affiche.
 *
 * Depuis la connexion du catalogue dynamique
 * (`server/curriculum/imported-openings-index.ts`), un chapitre riche peut
 * porter des centaines de variantes (391 pour la Sicilienne) : une liste
 * plate y devient illisible — cette fonction reconstruit la hiérarchie
 * implicite en re-scindant le NOM de chaque variante sur les virgules, la
 * convention lichess-org (`"Famille: Najdorf Variation, English Attack"` →
 * une fois le préfixe de famille retiré par `imported-openings-index.ts`,
 * `"Najdorf Variation, English Attack"`) — exactement la même convention que
 * `splitOpeningFamilyAndGambit` utilise pour le premier niveau, poussée ici à
 * une profondeur arbitraire. Un chapitre curaté à la main
 * (`core/curriculum/openings.ts`) a des noms sans virgule ("Défense
 * Berlinoise") : l'arbre y dégénère naturellement en la liste plate
 * d'origine, aucune régression visuelle pour ces ~20 chapitres.
 *
 * Module pur, testable indépendamment de React (voir `chapter-tree.test.ts`).
 */
import type { OpeningVariation } from "@/server/queries/openings";

export interface ChapterTreeNode {
  /** Chemin complet depuis la racine (segments joints par « ␟ », un séparateur qui n'apparaît jamais dans un nom d'ouverture) — clé React stable ET clé d'état "replié/déplié". */
  key: string;
  /** Le segment affiché à CE niveau (ex. "Najdorf Variation"), pas le nom complet. */
  label: string;
  /** La variante jouable à ce nœud exact — `null` pour un simple en-tête de groupe (aucune ligne DB ne s'arrête pile ici, voir le docstring du fichier). */
  variation: OpeningVariation | null;
  children: ChapterTreeNode[];
}

const PATH_SEPARATOR = "␟";

/**
 * Reconstruit l'arbre — un nœud existe une seule fois par chemin de segments
 * (deux variantes qui partagent un préfixe, ex. "Najdorf Variation, English
 * Attack" et "Najdorf Variation, Adams Attack", partagent le même nœud
 * "Najdorf Variation"). `variation` est posée sur le nœud du DERNIER segment
 * de chaque entrée — un nœud intermédiaire jamais lui-même une variante
 * complète (ex. "Najdorf Variation" seul, si aucune ligne DB ne s'arrête
 * exactement là) reste un en-tête de groupe non jouable, voir `ChapterTreeNode.variation`.
 */
export function buildChapterTree(variations: readonly OpeningVariation[]): ChapterTreeNode[] {
  const roots: ChapterTreeNode[] = [];
  const byPath = new Map<string, ChapterTreeNode>();

  for (const variation of variations) {
    const segments = variation.name
      .split(",")
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0);
    if (segments.length === 0) continue;

    let siblings = roots;
    let path = "";
    let node: ChapterTreeNode | undefined;
    for (const segment of segments) {
      path = path.length > 0 ? `${path}${PATH_SEPARATOR}${segment}` : segment;
      node = byPath.get(path);
      if (!node) {
        node = { key: path, label: segment, variation: null, children: [] };
        byPath.set(path, node);
        siblings.push(node);
      }
      siblings = node.children;
    }
    node!.variation = variation;
  }

  return roots;
}

/** Nombre de variantes JOUABLES sous ce nœud (lui-même compris) — affiché à côté d'un en-tête de groupe replié, voir `chapter-selector.tsx`. */
export function countChapters(node: ChapterTreeNode): number {
  return (node.variation ? 1 : 0) + node.children.reduce((sum, child) => sum + countChapters(child), 0);
}

/** Toutes les clés (`ChapterTreeNode.key`) de l'arbre, racine et sous-arbres compris — sert à tout déplier d'un coup pendant une recherche active, voir `chapter-selector.tsx`. */
export function allNodeKeys(nodes: readonly ChapterTreeNode[]): string[] {
  const keys: string[] = [];
  for (const node of nodes) {
    keys.push(node.key);
    keys.push(...allNodeKeys(node.children));
  }
  return keys;
}

/** Chemins (clés `ChapterTreeNode.key`) de tous les ANCÊTRES du nœud dont `variation` a `activeKey` — sert à déplier automatiquement la branche qui mène au chapitre déjà en cours, voir `chapter-selector.tsx`. `[]` si `activeKey` est `null` ou introuvable. */
export function ancestorPathsToActive(
  nodes: readonly ChapterTreeNode[],
  activeKey: string | null,
  variationKeyOf: (variation: OpeningVariation) => string,
): string[] {
  if (!activeKey) return [];

  function search(list: readonly ChapterTreeNode[], trail: string[]): string[] | null {
    for (const node of list) {
      const nextTrail = [...trail, node.key];
      if (node.variation && variationKeyOf(node.variation) === activeKey) return trail;
      const found = search(node.children, nextTrail);
      if (found) return found;
    }
    return null;
  }

  return search(nodes, []) ?? [];
}
