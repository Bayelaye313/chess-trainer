import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { mainLine } from "@/core/chess/pgn-tree";
import { findOpening, OPENINGS } from "@/core/curriculum/openings";
import {
  getEnrichedTreeForCuratedOpening,
  getImportedChildren,
  getImportedFamilyDetail,
  listOpeningFamilies,
} from "./imported-openings-index";
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

  /**
   * BUG RÉEL RESTANT après le correctif ci-dessus (retour utilisateur direct,
   * « il y a un réel bug sur Zukertort ») : `side` avait beau devenir correct
   * pour "Zukertort Defense", `rootMoves` restait bloqué à `["Nf3"]` — un
   * SEUL demi-coup, intégralement joué par les BLANCS. `getOpeningDetail`
   * promeut directement `rootMoves` en script interactif de la Ligne
   * principale (`opening.moves`) : ce script ne contenait donc STRUCTURELLEMENT
   * aucun coup à jouer pour l'utilisateur (censé s'entraîner à jouer les
   * Noirs) — l'IA jouait Nf3 seule, puis la manche se terminait aussitôt.
   * `familyReferenceMoves` doit désormais étendre `rootMoves` d'un coup pour
   * que sa longueur reste cohérente avec `side`.
   */
  it("étend `rootMoves` d'un coup quand le préfixe commun s'arrête sur un coup de l'adversaire (BUG CORRIGÉ, Zukertort Defense)", () => {
    const zukertortDefense = families.find((f) => f.name === "Zukertort Defense");
    expect(zukertortDefense).toBeDefined();
    // Avant le correctif : `["Nf3"]`, un seul demi-coup Blanc — aucune place
    // pour le moindre coup Noir dans ce qui devient le script interactif.
    expect(zukertortDefense!.rootMoves.length).toBeGreaterThanOrEqual(2);
  });

  /**
   * Invariant général dont la violation, pour N'IMPORTE QUELLE famille
   * dynamique (pas seulement Zukertort), produirait exactement le même bug :
   * `rootMoves` devient tel quel le script interactif de la Ligne principale
   * (`getOpeningDetail`) — son dernier demi-coup doit donc TOUJOURS appartenir
   * au camp `side`, sans quoi ce script se termine entièrement sur un coup de
   * l'adversaire et le joueur ne joue jamais rien.
   */
  it("deep test : pour CHAQUE famille dynamique, le dernier demi-coup de `rootMoves` appartient bien au camp `side`", () => {
    for (const family of families) {
      const lastPlyIsWhite = family.rootMoves.length % 2 === 1;
      const expectedSide = lastPlyIsWhite ? "white" : "black";
      expect(family.side, `${family.name}: rootMoves=${JSON.stringify(family.rootMoves)}`).toBe(expectedSide);
    }
  });
});

/**
 * Filet anti-régression pour le bug corrigé le 2026-09-04 (voir
 * `familyBelongsToHub`) — pas seulement le Gambit du Roi (repli sur `moves`
 * SEUL, 3 demi-coups, aucune variante nommée) mais TOUT hub dont la famille
 * lichess-org se scinde en plusieurs noms de haut niveau (« X Accepted »/« X
 * Declined », « X, with ... ») : la fusion doit absorber CES DEUX à la fois,
 * jamais seulement la ligne nue.
 */
describe("hubs curatés : aucune famille sœur orpheline (deep test du catalogue entier)", () => {
  it("Gambit du Roi : ligne principale ET les 3 gambits nommés demandés sont bien atteignables, profondément", () => {
    const kingsGambit = findOpening("kings-gambit")!;
    const tree = getEnrichedTreeForCuratedOpening(kingsGambit);
    const line = mainLine(tree);
    // Avant le correctif : 3 demi-coups pile (`moves`), aucun embranchement.
    expect(line.length).toBeGreaterThanOrEqual(16);

    const namedComments = new Set<string>();
    const collect = (node: { comment: string | null; children: readonly (typeof tree)[] }): void => {
      if (node.comment) namedComments.add(node.comment);
      for (const child of node.children) collect(child);
    };
    collect(tree);
    for (const expected of ["Gambit du Fou", "Gambit Kieseritzky", "Gambit Muzio"]) {
      expect(namedComments.has(expected), `variante attendue introuvable : "${expected}"`).toBe(true);
    }
  });

  it("Gambit Dame : la fusion absorbe désormais aussi « Queen's Gambit Accepted/Declined » (256 lignes, avant orphelines)", () => {
    const queensGambit = findOpening("queens-gambit")!;
    const tree = getEnrichedTreeForCuratedOpening(queensGambit);
    expect(mainLine(tree).length).toBeGreaterThanOrEqual(20);
  });

  it("aucune famille sœur d'un hub ne s'affiche plus comme carte dynamique dupliquée", () => {
    // Ex-orphelines connues et vérifiées avant le correctif (voir l'audit du
    // 2026-09-04) — chacune doit désormais être absorbée par son hub curaté,
    // jamais listée séparément.
    const familyNames = new Set(listOpeningFamilies().map((f) => f.name));
    for (const orphan of [
      "King's Gambit Accepted",
      "King's Gambit Declined",
      "Queen's Gambit Accepted",
      "London System, with Be2",
      "London System, with Bd3",
    ]) {
      expect(familyNames.has(orphan), orphan).toBe(false);
    }
  });

  it(
    "deep test : chaque chapitre curaté du catalogue reste au moins raisonnablement profond (aucune régression silencieuse vers une poignée de coups)",
    () => {
      // Seuil bas et délibérément permissif (4 demi-coups) : ce test garde
      // seulement contre une VRAIE régression (un hub qui redevient orphelin,
      // un chapitre qui perd tout son arbre) — PAS un désaccord esthétique sur
      // la profondeur pédagogique idéale de chaque chapitre. Les chapitres
      // listés ci-dessous n'ont simplement pas encore de `pgn` authored à la
      // main (contrairement à `kings-gambit`, désormais réparé) : un futur
      // chantier de contenu, pas un bug de fusion — voir le rapport de
      // livraison du 2026-09-04.
      const KNOWN_SHALLOW_PENDING_CONTENT = new Set([
        "vienna-gambit",
        "pirc-defense",
        "scandinavian",
        "london-system",
        "english-opening",
        "grunfeld",
        "dutch-defense",
      ]);
      for (const opening of OPENINGS) {
        const tree = getEnrichedTreeForCuratedOpening(opening);
        const depth = mainLine(tree).length;
        const minDepth = KNOWN_SHALLOW_PENDING_CONTENT.has(opening.id) ? 4 : 12;
        expect(depth, `${opening.id}: ligne principale trop courte (${depth} demi-coups)`).toBeGreaterThanOrEqual(
          minDepth,
        );
      }
    },
    20_000,
  );
});

describe("getImportedChildren", () => {
  it("renvoie [] pour une position hors de toute ligne importée", () => {
    const deepMiddlegame = "r2qk2r/ppp2ppp/2n1bn2/3p4/3P4/2N1BN2/PPP2PPP/R2QK2R w KQkq - 4 9";
    expect(getImportedChildren(deepMiddlegame)).toEqual([]);
  });

  it("connaît une position profonde d'une famille DYNAMIQUE (BUG CORRIGÉ, Défense Benoni) — pas seulement son tout premier coup", () => {
    // Régression directe : avant ce module, seule `getCuratedChildren` (les
    // ~20 chapitres curatés, jamais la Défense Benoni) et la base ECO
    // générique embarquée validaient un coup en cours de partie — la Défense
    // Benoni tombait à 0 coup connu dès le 7ᵉ demi-coup d'une ligne longue de
    // 19 (voir `listBookContinuations`, qui consomme cette fonction).
    const chess = new Chess();
    for (const san of ["d4", "Nf6", "c4", "c5", "d5", "e6", "Nc3"]) chess.move(san);
    const children = getImportedChildren(chess.fen());
    expect(children.some((c) => c.san === "exd5")).toBe(true);
  });

  it("fusionne les enfants de plusieurs lignes qui transposent vers la MÊME position (voir son docstring)", () => {
    // Une position partagée par deux familles différentes doit renvoyer
    // l'union de leurs coups suivants respectifs, jamais seulement ceux
    // d'une seule d'entre elles.
    const chess = new Chess();
    for (const san of ["d4", "Nf6", "c4"]) chess.move(san);
    const sans = getImportedChildren(chess.fen()).map((c) => c.san);
    expect(new Set(sans).size).toBe(sans.length); // jamais de doublon UCI.
    expect(sans.length).toBeGreaterThan(3); // plusieurs familles distinctes convergent ici.
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
