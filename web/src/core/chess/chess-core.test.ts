import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { attacksFrom, hasHangingPiece, isPinned } from "./attacks";
import { classifyMove } from "./classify";
import { categorizeDeck } from "./decks";
import { gamePhase, phaseMaterial } from "./phase";
import { isBrilliantSacrifice, isSacrifice } from "./sacrifice";

describe("attacksFrom", () => {
  it("donne les diagonales d'un pion, jamais sa poussée", () => {
    const board = new Chess("4k3/8/8/8/8/8/4P3/4K3 w - - 0 1");
    expect(attacksFrom(board, "e2").sort()).toEqual(["d3", "f3"]);
  });

  it("arrête le rayon d'une tour sur la première pièce, incluse", () => {
    // Tour a1, pion blanc a4 : la tour contrôle a2, a3 et a4 (défense), pas au-delà.
    const board = new Chess("4k3/8/8/8/P7/8/8/R3K3 w - - 0 1");
    const attacked = attacksFrom(board, "a1");
    expect(attacked).toContain("a4");
    expect(attacked).not.toContain("a5");
  });

  it("donne les huit sauts d'un cavalier au centre", () => {
    const board = new Chess("4k3/8/8/8/3N4/8/8/4K3 w - - 0 1");
    expect(attacksFrom(board, "d4")).toHaveLength(8);
  });
});

describe("isPinned", () => {
  it("détecte un cavalier cloué contre son roi", () => {
    // Cavalier noir d7 entre son roi d8 et la tour blanche d1.
    const board = new Chess("3k4/3n4/8/8/8/8/8/3RK3 b - - 0 1");
    expect(isPinned(board, "b", "d7")).toBe(true);
  });

  it("ne cloue pas si une pièce s'interpose", () => {
    const board = new Chess("3k4/3n4/8/3p4/8/8/8/3RK3 b - - 0 1");
    expect(isPinned(board, "b", "d7")).toBe(false);
  });

  it("ne cloue pas contre une pièce qui n'attaque pas dans cette direction", () => {
    // Un fou blanc en d1 n'attaque pas la colonne d.
    const board = new Chess("3k4/3n4/8/8/8/8/8/3BK3 b - - 0 1");
    expect(isPinned(board, "b", "d7")).toBe(false);
  });

  it("ne considère jamais le roi comme cloué", () => {
    const board = new Chess("3k4/8/8/8/8/8/8/3RK3 b - - 0 1");
    expect(isPinned(board, "b", "d8")).toBe(false);
  });
});

describe("hasHangingPiece", () => {
  it("détecte une pièce attaquée sans aucun défenseur", () => {
    // Dame d5, attaquée par la tour a5 (rang dégagé), aucun défenseur blanc.
    const board = new Chess("4k3/8/8/r2Q4/8/8/8/4K3 b - - 1 1");
    expect(hasHangingPiece(board, "w")).toBe(true);
  });

  it("ne compte pas une pièce attaquée mais réellement défendue", () => {
    // Même position, mais le pion c4 défend d5 (reprise immédiate possible).
    const board = new Chess("4k3/8/8/r2Q4/2P5/8/8/4K3 b - - 1 1");
    expect(hasHangingPiece(board, "w")).toBe(false);
  });

  it("compte une pièce en prise même si son seul défenseur est cloué", () => {
    // Cavalier e5 attaqué par le pion d6 ; le fou c3 « défend » e5 sur une
    // autre diagonale que celle où il est cloué (dame a5 → roi e1) — reprise
    // en réalité illégale. Même angle mort que `isSacrifice`, voir attacks.ts.
    const board = new Chess("6k1/8/3p4/q3N3/8/2B5/8/4K3 b - - 1 1");
    expect(hasHangingPiece(board, "w")).toBe(true);
  });

  it("ne signale rien quand aucune pièce n'est attaquée", () => {
    const board = new Chess("4k3/8/8/8/8/8/8/3K4 b - - 1 1");
    expect(hasHangingPiece(board, "w")).toBe(false);
  });

  it("ignore le roi lui-même", () => {
    // Roi e1 en échec (tour e2), mais cavalier g1 hors d'atteinte : le roi
    // attaqué ne doit pas, à lui seul, déclencher un faux positif.
    const board = new Chess("4k3/8/8/8/8/8/4r3/4K1N1 w - - 0 1");
    expect(hasHangingPiece(board, "w")).toBe(false);
  });
});

describe("gamePhase", () => {
  it("appelle ouverture les dix premiers coups", () => {
    expect(gamePhase(new Chess())).toBe("opening");
  });

  it("bascule en finale quand le matériel fond", () => {
    // Coup 30, deux tours seulement : 10 points, sous le seuil de 14.
    const board = new Chess("4k3/8/8/8/8/8/r7/R3K3 w - - 0 30");
    expect(phaseMaterial(board)).toBe(10);
    expect(gamePhase(board)).toBe("endgame");
  });

  it("reste en milieu de partie tant que le matériel est là", () => {
    const board = new Chess("r2qk2r/pppppppp/8/8/8/8/PPPPPPPP/R2QK2R w KQkq - 0 20");
    expect(gamePhase(board)).toBe("middlegame");
  });
});

describe("isSacrifice", () => {
  it("reconnaît un cavalier donné pour un pion", () => {
    // Nxh7 : le cavalier est repris par le roi, moins cher que lui.
    const board = new Chess("4k2r/5ppp/8/4N3/8/8/8/4K3 w k - 0 20");
    const move = new Chess(board.fen()).move("Nxf7");
    expect(isSacrifice(board, move)).toBe(true);
  });

  it("ne compte pas un simple échange favorable", () => {
    // Le cavalier arrive en d7 où seule la dame c8 peut le reprendre :
    // donner 3 pour 9, c'est une bonne affaire, pas un sacrifice.
    const board = new Chess("2q4k/8/8/4N3/8/8/8/4K3 w - - 0 20");
    const move = new Chess(board.fen()).move("Nd7");
    expect(isSacrifice(board, move)).toBe(false);
  });

  it("ne compte pas un coup sans repreneur", () => {
    // d3 n'est atteint par aucune pièce noire.
    const board = new Chess("4k3/8/8/4N3/8/8/8/4K3 w - - 0 20");
    const move = new Chess(board.fen()).move("Nd3");
    expect(isSacrifice(board, move)).toBe(false);
  });

  it("ignore les coups de pion", () => {
    const board = new Chess("4k3/3p4/8/4P3/8/8/8/4K3 w - - 0 20");
    const move = new Chess(board.fen()).move("e6");
    expect(isSacrifice(board, move)).toBe(false);
  });

  it("ne compte pas une pièce en prise mais défendue", () => {
    // Nd5 : attaqué par le pion noir c6, mais défendu par le pion blanc e4 —
    // reprise immédiate possible, donc simple échange, pas un don de matériel.
    const board = new Chess("4k3/8/2p5/8/4P3/2N5/8/4K3 w - - 0 20");
    const move = new Chess(board.fen()).move("Nd5");
    expect(isSacrifice(board, move)).toBe(false);
  });

  it("reconnaît un sacrifice quand le seul « défenseur » est cloué sur une autre ligne", () => {
    // Fou blanc c3 cloué par la dame noire a5 sur la diagonale a5-e1 (devant
    // son propre roi e1) ; il « voit » e5 sur l'AUTRE diagonale (c3-d4-e5),
    // mais y aller après une prise en e5 exposerait le roi — reprise
    // impossible en réalité. `attackers()` ne voit que la géométrie, pas la
    // légalité : bug réel qui faisait manquer ce Brillant.
    const board = new Chess("6k1/8/3p4/q7/6N1/2B5/8/4K3 w - - 0 1");
    const move = new Chess(board.fen()).move("Ne5");
    expect(isSacrifice(board, move)).toBe(true);
  });

  it("ne compte pas un défenseur qui reste légalement libre de reprendre", () => {
    // Même position, mais sans la dame qui cloue le fou : Bxe5 redevient une
    // reprise légale, donc plus de sacrifice.
    const board = new Chess("6k1/8/3p4/8/6N1/2B5/8/4K3 w - - 0 1");
    const move = new Chess(board.fen()).move("Ne5");
    expect(isSacrifice(board, move)).toBe(false);
  });
});

describe("isBrilliantSacrifice", () => {
  const fen = "4k2r/5ppp/8/4N3/8/8/8/4K3 w k - 0 20";
  const board = new Chess(fen);
  const nxf7 = new Chess(fen).move("Nxf7");

  it("surclasse un sacrifice qui est aussi le meilleur coup, sans alternative critique, position gagnante", () => {
    expect(isBrilliantSacrifice("best", true, 0, 55, board, nxf7)).toBe(true);
  });

  it("ne surclasse jamais un coup critique — c'était le seul coup qui tienne, pas un éclair de génie", () => {
    expect(isBrilliantSacrifice("critical", true, 0, 55, board, nxf7)).toBe(false);
  });

  it("ne surclasse pas un sacrifice qui n'est pas le coup recommandé par le moteur et perd trop de gain", () => {
    // "okay" : ni foundBest, ni proche du sommet (5 points de gain perdus, très
    // au-dessus de BRILLIANT_NEAR_BEST_MAX_LOSS) — une simple erreur mineure,
    // pas un éclair de génie.
    expect(isBrilliantSacrifice("okay", false, 5, 55, board, nxf7)).toBe(false);
  });

  it("surclasse un sacrifice qui n'est pas l'exact premier choix mais reste à quasi-égalité (tolérance)", () => {
    // CLAUDE.md : « matches the Best engine choice OR is highly evaluated » —
    // 0.3 point perdu, sous BRILLIANT_NEAR_BEST_MAX_LOSS (0.5) : quasi ex æquo
    // avec le sommet, le sacrifice mérite le label même sans matcher `foundBest`.
    expect(isBrilliantSacrifice("okay", false, 0.3, 55, board, nxf7)).toBe(true);
  });

  it("ne surclasse pas juste en dehors de la marge de tolérance", () => {
    expect(isBrilliantSacrifice("okay", false, 0.6, 55, board, nxf7)).toBe(false);
  });

  it("ne surclasse pas quand la perte est démesurée même si le résultat est nominalement 'best'", () => {
    // Ne devrait jamais arriver en pratique (foundBest implique winPercentLoss
    // nul via classify.ts), mais la fonction ne doit dépendre que de ses
    // propres garanties : winPercentLoss null (non mesuré) sans foundBest
    // reste hors marge, par sécurité.
    expect(isBrilliantSacrifice("okay", false, null, 55, board, nxf7)).toBe(false);
  });

  it("ne surclasse JAMAIS un coup qui laisse la position perdante, même proche du sommet du classement moteur", () => {
    // Le bug rapporté : « proche du meilleur coup » ne veut rien dire quand
    // le meilleur coup lui-même reste perdant — le moteur doit confirmer que
    // la position qui SUIT est gagnante ou nettement meilleure, pas juste que
    // le coup n'a pas empiré une mauvaise position de plus qu'un autre.
    // foundBest=true (c'est même le meilleur coup du moteur) + sacrifice réel,
    // mais 30% de gain seulement pour celui qui vient de jouer : toujours perdant.
    expect(isBrilliantSacrifice("best", true, 0, 30, board, nxf7)).toBe(false);
  });

  it("ne surclasse pas quand winPercentAfter n'a pas pu être mesuré", () => {
    expect(isBrilliantSacrifice("best", true, 0, null, board, nxf7)).toBe(false);
  });

  it("surclasse un vrai retournement : position perdante avant, gagnante après grâce au sacrifice", () => {
    // Le cas canonique du Brillant — le score AVANT (winPercentLoss/foundBest,
    // relatifs à ce que le moteur pensait faisable) n'entre pas ici en jeu :
    // seul compte que ce coup précis est le meilleur ET que APRÈS lui, la
    // position est gagnante.
    expect(isBrilliantSacrifice("best", true, 0, 60, board, nxf7)).toBe(true);
  });

  it("ne surclasse pas un meilleur coup qui n'est pas un sacrifice", () => {
    // Nd3 : case non atteinte par une pièce noire (voir tests isSacrifice ci-dessus).
    const quiet = "4k3/8/8/4N3/8/8/8/4K3 w - - 0 20";
    const quietBoard = new Chess(quiet);
    const nd3 = new Chess(quiet).move("Nd3");
    expect(isBrilliantSacrifice("best", true, 0, 55, quietBoard, nd3)).toBe(false);
  });
});

describe("classifyMove", () => {
  it("joue le meilleur coup dans une position ordinaire → meilleur coup", () => {
    expect(
      classifyMove({
        foundBest: true,
        onlyLegalMove: false,
        winPercentLoss: 0,
        secondBestGap: null,
        secondBestWinPercent: null,
      }),
    ).toBe("best");
  });

  it("un seul coup légal → critique, même sans deuxième ligne moteur", () => {
    expect(
      classifyMove({
        foundBest: true,
        onlyLegalMove: true,
        winPercentLoss: 0,
        secondBestGap: null,
        secondBestWinPercent: null,
      }),
    ).toBe("critical");
  });

  it("gros écart ET alternative elle-même perdante → critique", () => {
    expect(
      classifyMove({
        foundBest: true,
        onlyLegalMove: false,
        winPercentLoss: 0,
        secondBestGap: 15,
        secondBestWinPercent: 20,
      }),
    ).toBe("critical");
  });

  it("gros écart MAIS alternative encore tenable → meilleur coup, pas critique (régression du bug « Brillant absorbé par Critique »)", () => {
    // C'est exactement la signature d'un sacrifice Brillant : le meilleur
    // coup écrase le second choix en évaluation (gros `secondBestGap`), mais
    // le second choix reste lui-même tout à fait jouable (`secondBestWinPercent`
    // au-dessus de l'égalité) — la position n'avait rien de « critique », le
    // joueur avait simplement trouvé une idée plus forte que nécessaire.
    // Avant la correction, ce cas retombait systématiquement en `critical`,
    // ce qui empêchait `isBrilliantSacrifice` de jamais se prononcer.
    expect(
      classifyMove({
        foundBest: true,
        onlyLegalMove: false,
        winPercentLoss: 0,
        secondBestGap: 25,
        secondBestWinPercent: 60,
      }),
    ).toBe("best");
  });

  it("faible écart avec le second choix → simplement meilleur coup", () => {
    expect(
      classifyMove({
        foundBest: true,
        onlyLegalMove: false,
        winPercentLoss: 0,
        secondBestGap: 5,
        secondBestWinPercent: 20,
      }),
    ).toBe("best");
  });

  it.each([
    [5, "okay"],
    [9.9, "okay"],
    [10, "inaccuracy"],
    [19.9, "inaccuracy"],
    [20, "blunder"],
    [80, "blunder"],
  ])("perte de gain de %s%% → %s", (winPercentLoss, expected) => {
    expect(
      classifyMove({
        foundBest: false,
        onlyLegalMove: false,
        winPercentLoss,
        secondBestGap: null,
        secondBestWinPercent: null,
      }),
    ).toBe(expected);
  });
});

describe("categorizeDeck", () => {
  it("fait primer le mat manqué sur la phase", () => {
    expect(
      categorizeDeck({ quality: "blunder", phase: "endgame", mateMissed: true, tactical: true }),
    ).toBe("missed_checkmates");
  });

  it("sépare tactique manquée et erreur tactique", () => {
    const base = { phase: "middlegame", mateMissed: false, tactical: true } as const;
    expect(categorizeDeck({ ...base, quality: "inaccuracy" })).toBe("missed_tactics");
    expect(categorizeDeck({ ...base, quality: "blunder" })).toBe("tactical_mistakes");
  });

  it("retombe sur le positionnel sans motif", () => {
    expect(
      categorizeDeck({
        quality: "inaccuracy",
        phase: "middlegame",
        mateMissed: false,
        tactical: false,
      }),
    ).toBe("positional_mistakes");
  });
});
