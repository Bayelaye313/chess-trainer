import { describe, expect, it } from "vitest";
import { mainLine } from "@/core/chess/pgn-tree";
import { findOpening, OPENINGS } from "@/core/curriculum/openings";
import { getEnrichedTreeForCuratedOpening, getImportedFamilyDetail, listOpeningFamilies } from "./imported-openings-index";
import { getOpeningTree } from "./opening-tree-index";

/**
 * Ces tests interrogent la VRAIE base (`data/chess-trainer.db`, voir
 * `server/db/index.ts`) au travers des ~3810 lignes lichess-org importées
 * hors-ligne (`data/import/openings/lichess-{a..e}.pgn`, voir
 * `scripts/seed-from-pgn.ts`) — comme le reste de `server/queries/openings.ts`
 * (`getOpeningDetail`, `listOpenings`), ce module n'a pas de sens à tester
 * contre une base vide : sans import préalable (`npm run db:seed-pgn`), ces
 * assertions échoueraient légitimement, exactement comme un test contre la
 * base ECO embarquée échouerait sans le paquet `chess-openings`.
 */

describe("listOpeningFamilies", () => {
  const families = listOpeningFamilies();

  it("expose largement plus de familles que l'ancien plafond statique (~20 entrées)", () => {
    expect(families.length).toBeGreaterThan(100);
  });

  it("n'expose jamais une famille déjà représentée par un chapitre curaté (voir CURATED_FAMILY_HUB)", () => {
    // "Ruy Lopez" (famille) ne doit jamais apparaître comme carte séparée : le
    // chapitre curaté "ruy-lopez" en est le hub désigné.
    expect(families.some((f) => f.name === "Ruy Lopez")).toBe(false);
  });

  it("chaque famille a une ligne de référence non vide et un id stable préfixé `lichess-`", () => {
    for (const family of families) {
      expect(family.id.startsWith("lichess-")).toBe(true);
      expect(family.rootMoves.length).toBeGreaterThan(0);
      expect(family.variantCount).toBeGreaterThan(0);
    }
  });

  it("un id ne se répète jamais", () => {
    const ids = families.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("attribue le côté NOIR à une famille « Defense » dont le préfixe commun s'arrête par coïncidence sur un coup Blanc", () => {
    // Bug utilisateur direct (« pas de flèches de guide ni de hints sur
    // Zukertort ») : "Zukertort Defense" ne partage entre ses variantes
    // ("Kingside Variation", "Sicilian Knight Variation") que le tout premier
    // coup 1.Nf3 — un coup BLANC qui n'a rien à voir avec l'idée du chapitre.
    // Avant la correction (`sideForFamily`), `side` valait "white" à tort :
    // l'utilisateur jouait les Blancs dans un chapitre pensé pour s'entraîner
    // à défendre en Noir, l'IA enchaînant seule les coups noirs distinctifs
    // (la vraie matière du chapitre) — la manche se terminait en 1-2 coups.
    const zukertortDefense = families.find((f) => f.name === "Zukertort Defense");
    expect(zukertortDefense).toBeDefined();
    expect(zukertortDefense!.side).toBe("black");
  });

  it("garde le côté BLANC d'une famille « Opening » qui EST elle-même une ligne cataloguée à la longueur du préfixe commun", () => {
    // Contre-exemple qui borne la correction ci-dessus : "Zukertort Opening"
    // partage aussi le préfixe ["Nf3"] entre ses variantes, MAIS une ligne
    // "Zukertort Opening" existe aussi telle quelle (sans suffixe), longue
    // d'exactement 1 coup — un vrai choix éditorial Blanc, pas un simple
    // préfixe incident. `side` doit rester "white", jamais basculer à "black".
    const zukertortOpening = families.find((f) => f.name === "Zukertort Opening");
    expect(zukertortOpening).toBeDefined();
    expect(zukertortOpening!.side).toBe("white");
  });
});

describe("getImportedFamilyDetail", () => {
  it("renvoie `null` pour un id inconnu", () => {
    expect(getImportedFamilyDetail("lichess-does-not-exist")).toBeNull();
  });

  it("construit un arbre couvrant TOUTES les variantes de la famille (une profondeur bien supérieure à 4-5 coups)", () => {
    const family = listOpeningFamilies()[0]; // triée par richesse décroissante, voir le docstring de `listOpeningFamilies`.
    const detail = getImportedFamilyDetail(family.id)!;
    expect(detail).not.toBeNull();
    // Au moins une variante nommée quelque part au-delà de la racine.
    const hasNamedNode = (node: ReturnType<typeof mainLine>[number] | typeof detail.tree): boolean =>
      node.comment !== null || node.children.some(hasNamedNode);
    expect(hasNamedNode(detail.tree)).toBe(true);
  });
});

describe("getEnrichedTreeForCuratedOpening", () => {
  it("prolonge un chapitre curaté avec les branches de la base Lichess, sans jamais recouvrir ses noms existants", () => {
    const ruyLopez = findOpening("ruy-lopez")!;
    const curatedTree = getOpeningTree(ruyLopez);
    const enrichedTree = getEnrichedTreeForCuratedOpening(ruyLopez);

    // La ligne principale AUTHORÉE (premier embranchement, choix éditorial)
    // reste identique — voir le docstring de `getOpeningDetail` (dynamic
    // branch) : seule une famille dynamique sans chapitre curaté perd cette
    // garantie.
    expect(mainLine(enrichedTree).map((n) => n.san).slice(0, ruyLopez.moves.length)).toEqual(
      mainLine(curatedTree)
        .map((n) => n.san)
        .slice(0, ruyLopez.moves.length),
    );

    // La Défense Berlinoise (nommée à la main dans `core/curriculum/openings.ts`)
    // garde son nom français, jamais recouvert par un nom lichess-org.
    const bb5 = mainLine(enrichedTree).find((n) => n.san === "Bb5")!;
    const berlin = bb5.children.find((n) => n.san === "Nf6")!;
    expect(berlin.comment).toMatch(/Berlinoise/);
  });

  it("ne mute jamais l'arbre partagé de `getOpeningTree` (utilisé par la détection d'écarts de répertoire)", () => {
    const ruyLopez = findOpening("ruy-lopez")!;
    const before = JSON.stringify(getOpeningTree(ruyLopez));
    getEnrichedTreeForCuratedOpening(ruyLopez);
    const after = JSON.stringify(getOpeningTree(ruyLopez));
    expect(after).toBe(before);
  });

  it(
    "n'échoue jamais, pour chaque chapitre curaté du catalogue",
    () => {
      // Construit ~19 arbres de famille réels (jusqu'à 391 lignes pour la
      // Sicilienne) — plus lent que le reste de la suite, d'où le timeout
      // explicite, mais un aller simple : chaque arbre est ensuite mémoïsé
      // (`enrichedCuratedTreeCache`/`familyTreeCache`), comme en usage réel où
      // un chapitre donné n'est construit qu'une fois par process serveur.
      for (const opening of OPENINGS) {
        expect(() => getEnrichedTreeForCuratedOpening(opening)).not.toThrow();
      }
    },
    20_000,
  );
});
