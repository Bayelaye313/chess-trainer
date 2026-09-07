import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { OPENINGS } from "@/core/curriculum/openings";
import {
  annotateOpeningLine,
  formatMovePreview,
  getOpeningDetail,
  listBookContinuations,
  listOpenings,
  listOpeningVariations,
} from "./openings";

describe("annotateOpeningLine", () => {
  it("annote chaque coup avec son FEN et son UCI, dans l'ordre — sur toute la profondeur de l'arbre `pgn`, pas seulement `moves`", () => {
    // Régression (audit UI du 2026-08-29) : `annotateOpeningLine` rejouait
    // `opening.moves` — la ligne courte du catalogue — même pour un chapitre
    // dont l'arbre `pgn` va bien plus loin, ce qui faisait terminer le script
    // de "Ligne principale" du Mode Entraînement après seulement quelques
    // coups (`use-opening-drill.ts`). Elle DOIT désormais suivre `mainLine()`
    // de l'arbre authored en entier.
    const opening = OPENINGS.find((o) => o.id === "ruy-lopez")!;
    const plies = annotateOpeningLine(opening);

    // `moves` (5 plies) n'est plus le total, seulement un PRÉFIXE de la vraie ligne.
    expect(plies.length).toBeGreaterThan(opening.moves.length);
    expect(plies.length).toBeGreaterThanOrEqual(15); // au moins 15 plies de théorie, voir le cahier des charges.
    expect(plies.slice(0, opening.moves.length).map((p) => p.san)).toEqual(["e4", "e5", "Nf3", "Nc6", "Bb5"]);
    expect(plies.slice(0, opening.moves.length).map((p) => p.uci)).toEqual([
      "e2e4",
      "e7e5",
      "g1f3",
      "b8c6",
      "f1b5",
    ]);
    expect(plies[plies.length - 1].fen).toContain(" w "); // ligne principale : Blancs au trait après Qc7.
  });

  it("reconnaît la position finale de la ligne courte (`moves`) de la Ruy Lopez dans la base ECO", () => {
    const opening = OPENINGS.find((o) => o.id === "ruy-lopez")!;
    const plies = annotateOpeningLine(opening);
    expect(plies[opening.moves.length - 1].book?.name).toMatch(/Ruy Lopez/);
  });

  it("peut sortir de la théorie cataloguée avant la fin d'une ligne longue", () => {
    const opening = OPENINGS.find((o) => o.id === "sicilian-najdorf")!;
    const plies = annotateOpeningLine(opening);
    // Pas d'exigence que CHAQUE ply soit cataloguée : seule la présence d'au
    // moins une annotation de théorie tôt dans la ligne est garantie.
    expect(plies.some((p) => p.book !== null)).toBe(true);
  });
});

describe("formatMovePreview", () => {
  it("formate une ligne paire façon PGN", () => {
    expect(formatMovePreview(["e4", "e5", "Nf3", "Nc6"])).toBe("1. e4 e5 2. Nf3 Nc6");
  });

  it("gère un dernier coup blanc sans réponse noire", () => {
    expect(formatMovePreview(["e4", "e5", "f4"])).toBe("1. e4 e5 2. f4");
  });
});

describe("listOpenings", () => {
  it("renvoie le catalogue curaté ET les familles dynamiques de la base Lichess, avec un aperçu chacune", () => {
    // Le catalogue n'est plus plafonné aux ~20 chapitres curatés à la main
    // (voir `server/curriculum/imported-openings-index.ts`) : les ~130
    // familles lichess-org sans chapitre curaté dédié s'y ajoutent.
    const summaries = listOpenings();
    expect(summaries.length).toBeGreaterThan(OPENINGS.length);
    expect(summaries.every((s) => s.preview.length > 0)).toBe(true);
    // Chaque chapitre curaté reste présent, sous son id stable (répétition
    // espacée/mastery en dépendent, voir `server/queries/opening-progress.ts`).
    for (const opening of OPENINGS) {
      expect(summaries.some((s) => s.id === opening.id)).toBe(true);
    }
    // Une entrée par id : le catalogue curaté et le catalogue dynamique ne
    // doivent jamais se dupliquer (voir `CURATED_FAMILY_HUB`).
    const ids = summaries.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("listBookContinuations", () => {
  const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  it("liste des coups théoriques distincts depuis la position de départ", () => {
    const continuations = listBookContinuations(START_FEN);
    expect(continuations.length).toBeGreaterThan(0);
    const sans = continuations.map((c) => c.san);
    expect(new Set(sans).size).toBe(sans.length);
    for (const continuation of continuations) {
      expect(continuation.eco).toMatch(/^[A-E]\d\d$/);
      expect(continuation.name.length).toBeGreaterThan(0);
    }
  });

  it("inclut 1.e4 et 1.d4 parmi les continuations depuis la position de départ", () => {
    const sans = listBookContinuations(START_FEN).map((c) => c.san);
    expect(sans).toContain("e4");
    expect(sans).toContain("d4");
  });

  it("renvoie un tableau vide sur une position hors théorie", () => {
    // Milieu de partie quelconque, très en aval — cf. `openings.test.ts` (server/import).
    const deepMiddlegame = "r2qk2r/ppp2ppp/2n1bn2/3p4/3P4/2N1BN2/PPP2PPP/R2QK2R w KQkq - 4 9";
    expect(listBookContinuations(deepMiddlegame)).toEqual([]);
  });

  it("priorise l'arbre curaté et EN PLUS de la ligne scriptée accepte ses embranchements réels", () => {
    // Position après 1.e4 e5 2.Nf3 Nc6 3.Bb5 (fin de la ligne de référence de
    // la Ruy Lopez) — l'arbre authored propose deux réponses théoriques
    // distinctes (3...a6 ET 3...Nf6, la Berlinoise) : aucune des deux ne doit
    // être rejetée comme hors-théorie.
    const ruyLopez = OPENINGS.find((o) => o.id === "ruy-lopez")!;
    // Position après `moves` (fin de la ligne COURTE, 3.Bb5) — `annotateOpeningLine`
    // va désormais bien plus loin (voir le test de régression ci-dessus), donc
    // `.at(-1)` ne pointerait plus du tout sur cette position.
    const afterBb5 = annotateOpeningLine(ruyLopez)[ruyLopez.moves.length - 1]!.fen;
    const sans = listBookContinuations(afterBb5).map((c) => c.san);
    expect(sans).toContain("a6");
    expect(sans).toContain("Nf6");
  });

  it("fusionne le palier curaté ET la base importée globale plutôt que de s'arrêter au premier non vide (BUG CORRIGÉ, retour utilisateur : Défense Benoni)", () => {
    // Après 1.d4 Nf6 2.c4, les chapitres CURATÉS Nimzo-Indienne/Est-Indienne
    // connaissent 2...e6/2...g6 (transposition) — mais SEULE la base
    // importée GLOBALE (`getImportedChildren`) connaît 2...c5, la Défense
    // Benoni, qui n'a aucun chapitre curaté dédié. Avant ce correctif,
    // `listBookContinuations` s'arrêtait au premier palier non vide (le
    // curaté) et rejetait alors 2...c5 comme hors-théorie, alors qu'il s'agit
    // d'une vraie ouverture cataloguée (`lichess-benoni-defense`).
    const chess = new Chess();
    for (const san of ["d4", "Nf6", "c4"]) chess.move(san);
    const sans = listBookContinuations(chess.fen()).map((c) => c.san);
    expect(sans).toContain("e6");
    expect(sans).toContain("g6");
    expect(sans).toContain("c5");
  });

  describe("deep test du catalogue entier (BUG CORRIGÉ, retour utilisateur : « la Défense Benoni s'arrête bien avant la fin réelle de la variante »)", () => {
    // Avant ce correctif, toute position connue UNIQUEMENT d'une famille
    // DYNAMIQUE (les ~125 familles lichess-org sans chapitre curaté, ex.
    // Benoni) retombait directement sur la base ECO générique embarquée
    // (~3600 positions, TOUTES ouvertures confondues) dès que le palier
    // curaté était vide — invisible à la théorie qui sert par ailleurs à
    // construire le script de CETTE MÊME variante (`listOpeningVariations`).
    // Concrètement : la Défense Benoni tombait à 0 coup connu dès le 7ᵉ
    // demi-coup d'une ligne pourtant longue de 19. Ce test rejoue CHAQUE
    // variante nommée du catalogue entier (curaté + dynamique, ~3400+ lignes)
    // et vérifie que `listBookContinuations` reconnaît chacun de ses coups,
    // du premier au dernier — pas seulement au tout début de la ligne.
    it(
      "reconnaît chaque coup de chaque variante nommée, curatée ou dynamique, du premier au dernier ply",
      () => {
        let checked = 0;
        for (const summary of listOpenings()) {
          const detail = getOpeningDetail(summary.id);
          if (!detail) continue;
          for (const variation of detail.variations) {
            checked += 1;
            const chess = new Chess();
            for (const san of variation.sanMoves) {
              const known = listBookContinuations(chess.fen()).some((c) => c.san === san);
              expect(known, `${summary.id} :: "${variation.name}" bloque sur le coup "${san}"`).toBe(true);
              chess.move(san);
            }
          }
        }
        // Pas une régression silencieuse vers un catalogue vide (garde-fou,
        // même esprit que `imported-openings-index.test.ts`).
        expect(checked).toBeGreaterThan(1000);
      },
      // 60s plutôt que les 30s d'origine : `extendWithGlobalTheory` rallonge
      // désormais les variantes trop courtes (voir son docstring), donc plus
      // de demi-coups au total à rejouer/valider ici qu'avant ce correctif.
      60_000,
    );
  });
});

describe("getOpeningDetail", () => {
  it("renvoie l'ouverture et ses coups annotés pour un slug connu, sur toute la profondeur de son arbre `pgn`", () => {
    const detail = getOpeningDetail("caro-kann");
    expect(detail?.opening.id).toBe("caro-kann");
    // `caro-kann` porte un arbre `pgn` bien plus profond que sa ligne courte
    // `moves` (4 plies) — voir le test de régression `annotateOpeningLine`.
    expect(detail!.plies.length).toBeGreaterThan(detail!.opening.moves.length);
    expect(detail!.plies.length).toBeGreaterThanOrEqual(15);
  });

  it("inclut les variantes nommées découvertes en base ECO", () => {
    const detail = getOpeningDetail("ruy-lopez");
    expect(detail?.variations.length).toBeGreaterThan(0);
  });

  it("inclut désormais des dizaines de variantes issues de la base Lichess pour un chapitre curaté riche", () => {
    // Avant la connexion du catalogue dynamique, la Sicilienne n'avait que
    // 4-5 variantes écrites à la main — voir le docstring de
    // `server/curriculum/imported-openings-index.ts`.
    const detail = getOpeningDetail("sicilian-najdorf");
    expect(detail?.variations.length).toBeGreaterThan(20);
  });

  it("renvoie une famille dynamique (id `lichess-*`) pour une ouverture sans chapitre curaté", () => {
    const dynamicId = listOpenings().find((s) => s.id.startsWith("lichess-"))!.id;
    const detail = getOpeningDetail(dynamicId);
    expect(detail).not.toBeNull();
    expect(detail!.opening.id).toBe(dynamicId);
    expect(detail!.plies.length).toBeGreaterThan(0);
  });

  it("renvoie null pour un slug inconnu", () => {
    expect(getOpeningDetail("does-not-exist")).toBeNull();
  });

  /**
   * BUG CORRIGÉ (retour utilisateur direct, « il y a un réel bug sur
   * Zukertort ») : pour "Zukertort Defense" (`side: "black"`), `opening.moves`
   * — promu tel quel en script interactif de la Ligne principale par
   * `use-opening-drill.ts` — se limitait à `["Nf3"]`, un seul demi-coup,
   * intégralement joué par les BLANCS (l'IA). Le joueur, censé s'entraîner à
   * jouer les NOIRS, n'avait donc STRUCTURELLEMENT aucun coup à jouer : l'IA
   * jouait Nf3 seule et la manche se terminait aussitôt (`decideOpponentStep`,
   * script épuisé), sans qu'aucun coup n'ait jamais été proposé au joueur.
   * Deep test : pour CHAQUE famille dynamique du catalogue entier, au moins
   * un demi-coup de `opening.moves` doit appartenir au camp du joueur — sinon
   * ce chapitre est fonctionnellement mort en Ligne principale.
   */
  it(
    "deep test : chaque famille dynamique laisse au joueur au moins un coup à jouer dans sa Ligne principale",
    () => {
      const dynamicIds = listOpenings()
        .map((s) => s.id)
        .filter((id) => id.startsWith("lichess-"));
      expect(dynamicIds.length).toBeGreaterThan(50);
      for (const id of dynamicIds) {
        const detail = getOpeningDetail(id)!;
        const userIsWhite = detail.opening.side === "white";
        // Ply 1-based : impair = Blanc, pair = Noir (même convention que
        // `OpeningLine.side`) — au moins UN de ces plies doit correspondre au
        // camp du joueur, sinon le script entier n'appartient qu'à l'IA.
        const hasPlayerPly = detail.plies.some((_, index) => ((index + 1) % 2 === 1) === userIsWhite);
        expect(hasPlayerPly, `${id} (side=${detail.opening.side}): moves=${JSON.stringify(detail.opening.moves)}`).toBe(
          true,
        );
      }
    },
    20_000,
  );
});

describe("listOpeningVariations", () => {
  const ruyLopez = OPENINGS.find((o) => o.id === "ruy-lopez")!;

  it("trouve des branches nommées qui prolongent réellement la ligne de référence", () => {
    const variations = listOpeningVariations(ruyLopez);
    expect(variations.length).toBeGreaterThan(0);
    for (const variation of variations) {
      // Chaque variante doit strictement prolonger la ligne de référence, pas
      // seulement la recouper par transposition.
      expect(variation.sanMoves.length).toBeGreaterThan(ruyLopez.moves.length);
      expect(variation.sanMoves.slice(0, ruyLopez.moves.length)).toEqual(ruyLopez.moves);
      expect(variation.eco).toMatch(/^[A-E]\d\d$/);
      expect(variation.uciMoves.length).toBe(variation.sanMoves.length);
    }
  });

  it("reconnaît la Défense Berlinoise parmi les variantes de la Ruy Lopez", () => {
    const variations = listOpeningVariations(ruyLopez);
    expect(variations.some((v) => /Berlin/i.test(v.name))).toBe(true);
  });

  it("ne garde qu'une entrée par nom, la plus longue rencontrée", () => {
    const variations = listOpeningVariations(ruyLopez);
    const names = variations.map((v) => `${v.eco}|${v.name}`);
    expect(new Set(names).size).toBe(names.length);
  });

  it("ne plante jamais, même sur une ligne de référence poussée hors théorie", () => {
    // Suite volontairement absurde mais entièrement légale (poussées de pions
    // de bord) — l'important est que la récursion s'arrête proprement une
    // fois sortie de la base ECO, sans exception.
    const outOfBook = { ...ruyLopez, moves: [...ruyLopez.moves, "a6", "a4", "a5", "h3", "h6"] };
    expect(() => listOpeningVariations(outOfBook)).not.toThrow();
  });

  /**
   * BUG CORRIGÉ (retour utilisateur direct, « des lignes faibles, peu de
   * variation, des manches courtes » sur Zukertort Opening/Defense) : de
   * nombreuses variantes lichess-org ne sont que le nom du premier coup de
   * réponse distinctif (2-3 demi-coups), sans suite officiellement rattachée
   * à CE nom précis — une manche d'un seul coup joué par l'utilisateur.
   * `extendWithGlobalTheory` les rallonge avec de VRAIS coups puisés dans la
   * base importée globale (transpositions comprises) ; `MIN_VARIATION_PLIES_
   * TO_DISPLAY` écarte celles qui n'ont RÉELLEMENT aucune suite nulle part
   * dans la base (l'extension ne peut alors rien faire) plutôt que de les
   * garder comme manches insatisfaisantes.
   */
  describe("rallonge/filtre les variantes trop courtes (BUG CORRIGÉ, Zukertort)", () => {
    it("rallonge une variante courte avec de vrais coups théoriques empruntés à une autre famille (Kingside Fianchetto, Zukertort Opening)", () => {
      const detail = getOpeningDetail("lichess-zukertort-opening")!;
      const kingsideFianchetto = detail.variations.find((v) => v.name === "Kingside Fianchetto");
      // Ligne d'origine (lichess-org) : seulement "Nf3 g6", 2 demi-coups —
      // rallongée ici via la théorie globale (transposition Est-Indienne/Réti).
      expect(kingsideFianchetto).toBeDefined();
      expect(kingsideFianchetto!.sanMoves.length).toBeGreaterThanOrEqual(8);
      expect(kingsideFianchetto!.sanMoves.slice(0, 2)).toEqual(["Nf3", "g6"]);
    });

    it("écarte du sélecteur une variante qui n'a réellement aucune suite dans toute la base (Basman Defense, 1.Nf3 h6)", () => {
      const detail = getOpeningDetail("lichess-zukertort-opening")!;
      // Aucune des ~3810 lignes importées ne prolonge "Nf3 h6" — l'extension
      // ne peut rien y faire, elle reste sous `MIN_VARIATION_PLIES_TO_DISPLAY`.
      expect(detail.variations.some((v) => v.name === "Basman Defense")).toBe(false);
    });

    it(
      "aucune variante affichée ne descend sous le plancher minimal, catalogue entier",
      () => {
        for (const summary of listOpenings()) {
          const detail = getOpeningDetail(summary.id)!;
          for (const variation of detail.variations) {
            expect(
              variation.sanMoves.length,
              `${summary.id} :: "${variation.name}" (${variation.sanMoves.length} demi-coups)`,
            ).toBeGreaterThanOrEqual(4);
          }
        }
      },
      30_000,
    );

    it("garde les 2 variantes de Zukertort Defense (4 demi-coups pile, au plancher mais pas en dessous)", () => {
      const detail = getOpeningDetail("lichess-zukertort-defense")!;
      expect(detail.variations.map((v) => v.name).sort()).toEqual(["Kingside Variation", "Sicilian Knight Variation"]);
    });
  });
});
