import { describe, expect, it, vi } from "vitest";
import { Chess } from "chess.js";
import {
  buildBulkTrapFromGame,
  buildOpeningLineFromGame,
  buildTrapFromGame,
  defaultDifficultyFromSetupPlies,
  defaultHintForTrapMove,
  estimateDifficultyFromRefutationLength,
  parsePgnGames,
  splitOpeningFamilyAndGambit,
  type LinearFallbackRefutationResolver,
} from "./traps-parser";

/** Résolveur de test : simule un moteur qui trouve toujours un coup légal DIFFÉRENT de `trapMove` depuis la position fournie — jamais le même que celui codé en dur dans le PGN, pour ne pas dépendre de l'ordre interne de chess.js#moves(). */
function stubEngineResolver(): LinearFallbackRefutationResolver {
  return async (fen, trapMoveSan) => {
    const chess = new Chess(fen);
    return chess.moves().find((san) => san !== trapMoveSan) ?? null;
  };
}

/** Résolveur de test qui ne trouve jamais rien de mieux que la gaffe elle-même — simule un moteur qui confirme que `trapMove` était en fait le meilleur coup. */
function noBetterMoveResolver(): LinearFallbackRefutationResolver {
  return async (_fen, trapMoveSan) => trapMoveSan;
}

/** Résolveur de test qui confirme (comme `noBetterMoveResolver`) les `agreeCount` premiers candidats testés, puis diverge enfin — simule un moteur qui ne trouve la vraie gaffe qu'en remontant de quelques demi-coups (voir `MAX_LINEAR_FALLBACK_LOOKBACK_PLIES`). */
function resolverThatAgreesFirstNTimes(agreeCount: number): LinearFallbackRefutationResolver {
  let calls = 0;
  return async (fen, trapMoveSan) => {
    calls += 1;
    if (calls <= agreeCount) return trapMoveSan;
    const chess = new Chess(fen);
    return chess.moves().find((san) => san !== trapMoveSan) ?? null;
  };
}

const TRAP_PGN = `[Event "Le Piège Test"]
[Site "Ouverture Test"]
[ECO "C50"]
[Gambit "Série Test"]
[Difficulty "beginner"]
[Hint "Un indice de test."]
[Commentary "Un commentaire de test."]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4 (6... Bb4+ {ce coup intercale un échec avant de reprendre}) 6... Bb6 7. Nc3 *`;

const NO_VARIATION_PGN = `[Event "Partie Simple"]
[Site "Ouverture Simple"]
[ECO "B00"]

1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 *`;

const ILLEGAL_MOVE_PGN = `[Event "Partie Cassée"]
[Site "Ouverture Cassée"]
[ECO "A00"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4 (6... Zz9 {coup illisible}) 6... Bb6 7. Nc3 *`;

const MULTI_GAME_PGN = `${TRAP_PGN}

${NO_VARIATION_PGN}`;

const DOUBLE_VARIATION_PGN = `[Event "Deux Variations"]
[Site "Ouverture Double"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4 (6... Bb4+) 6... Bb6 7. Nc3 Nxe4 (7... d6) 7... O-O *`;

/** Un vrai piège du dump « 700 Opening Traps - Bill Wall » (voir data/import/traps/bulk-raw) — s'arrête net sur le coup gagnant, sans jamais noter Bb5 en variation RAV. */
const LINEAR_FALLBACK_PGN = `[Event "Internet"]
[Site "King's Pawn Game: Alapin Opening"]

1. e4 e5 2. Ne2 d5 3. exd5 Qxd5 4. Nbc3 Qc6 5. Ng3 g6 6. Bb5 { 1-0 Black resigns. } 1-0`;

/** Ligne linéaire dont le tout dernier token est un résidu illisible par chess.js — doit être tronqué, pas jeté. */
const TRUNCATE_TAIL_PGN = `[Event "Repli Troncature"]
[Site "Ouverture Repli"]

1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 Zz9`;

/** Une seule case jouable après troncature (juste "e4") : pas assez pour une gaffe + sa punition. */
const TOO_SHORT_AFTER_TRUNCATION_PGN = `[Event "Trop Courte"]
[Site "Ouverture Trop Courte"]

1. e4 Zz9`;

describe("parsePgnGames", () => {
  it("découpe un texte en plusieurs parties, une par tag [Event", () => {
    const games = parsePgnGames(MULTI_GAME_PGN);
    expect(games).toHaveLength(2);
    expect(games[0].tags.Event).toBe("Le Piège Test");
    expect(games[1].tags.Event).toBe("Partie Simple");
  });

  it("extrait la ligne principale, le point de bascule et le coup de la variation", () => {
    const [game] = parsePgnGames(TRAP_PGN);
    expect(game.mainline).toEqual(["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d4", "exd4", "cxd4", "Bb6", "Nc3"]);
    expect(game.variationAtPly).toBe(11);
    expect(game.variationMove).toBe("Bb4+");
    expect(game.variationComment).toBe("ce coup intercale un échec avant de reprendre");
  });

  it("renvoie variationAtPly=null quand la partie n'a aucune variation", () => {
    const [game] = parsePgnGames(NO_VARIATION_PGN);
    expect(game.variationAtPly).toBeNull();
    expect(game.variationMove).toBeNull();
    expect(game.mainline).toEqual(["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6"]);
  });

  it("retire les glyphes d'annotation (!?) sans toucher aux suffixes +/# légaux", () => {
    const pgn = `[Event "Glyphes"]\n[Site "Test"]\n\n1. e4?! e5 2. Qh5!! Nc6 3. Bc4 g6?? 4. Qxf7# *`;
    const [game] = parsePgnGames(pgn);
    expect(game.mainline).toEqual(["e4", "e5", "Qh5", "Nc6", "Bc4", "g6", "Qxf7#"]);
  });

  it("retire TOUTES les variations top-level de la ligne principale, pas seulement la première", () => {
    const [game] = parsePgnGames(DOUBLE_VARIATION_PGN);
    // Un fragment de la 2e variation ("(7... d6)") oublié dans mainline produirait des tokens
    // "(7..." / "d6)" que chess.js rejetterait comme coups illégaux — voir le docstring du fichier.
    expect(game.mainline).toEqual(["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d4", "exd4", "cxd4", "Bb6", "Nc3", "Nxe4", "O-O"]);
    expect(game.mainline.join(" ")).not.toContain("(");
    // Seule la PREMIÈRE variation alimente variationMove (limite assumée, voir le docstring du fichier).
    expect(game.variationMove).toBe("Bb4+");
  });
});

describe("buildTrapFromGame", () => {
  it("construit un OpeningTrap complet et légal depuis une partie avec variation", () => {
    const [game] = parsePgnGames(TRAP_PGN);
    const trap = buildTrapFromGame(game, { idPrefix: "starter-traps.pgn" });
    expect(trap).not.toBeNull();
    if (!trap) return;
    expect(trap.name).toBe("Le Piège Test");
    expect(trap.family).toBe("Ouverture Test");
    expect(trap.gambit).toBe("Série Test");
    expect(trap.difficulty).toBe("beginner");
    expect(trap.trapMove).toBe("Bb4+");
    expect(trap.setupMoves).toEqual(["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d4", "exd4", "cxd4"]);
    expect(trap.refutationMoves).toEqual(["Bb6", "Nc3"]);
    expect(trap.victimSide).toBe("black");

    // Filet de sécurité final : exactement la même validation que traps.test.ts pour le catalogue statique.
    const chess = new Chess();
    for (const san of trap.setupMoves) expect(() => chess.move(san)).not.toThrow();
    const trapCheck = new Chess(chess.fen());
    expect(() => trapCheck.move(trap.trapMove)).not.toThrow();
    for (const san of trap.refutationMoves) expect(() => chess.move(san)).not.toThrow();
  });

  it("renvoie null quand la partie n'a pas de variation exploitable", () => {
    const [game] = parsePgnGames(NO_VARIATION_PGN);
    expect(buildTrapFromGame(game, { idPrefix: "x" })).toBeNull();
  });

  it("renvoie null quand un coup — même dans la variation — est illégal", () => {
    const [game] = parsePgnGames(ILLEGAL_MOVE_PGN);
    expect(buildTrapFromGame(game, { idPrefix: "x" })).toBeNull();
  });

  it("applique les valeurs par défaut quand les tags personnalisés manquent", () => {
    const pgn = `[Event "Sans Tags Perso"]\n[Site "Ouverture X"]\n\n1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 (4... Nbd7 {sans commentaire explicite}) 4... Be7 5. e3 *`;
    const [game] = parsePgnGames(pgn);
    const trap = buildTrapFromGame(game, { idPrefix: "sans-tags.pgn" });
    expect(trap).not.toBeNull();
    if (!trap) return;
    expect(trap.difficulty).toBe(defaultDifficultyFromSetupPlies(trap.setupMoves.length));
    expect(trap.hint.length).toBeGreaterThan(0);
    expect(trap.comments.length).toBeGreaterThan(0);
  });

  it("génère des ids stables et uniques pour deux parties distinctes", () => {
    const games = parsePgnGames(MULTI_GAME_PGN);
    const trap = buildTrapFromGame(games[0], { idPrefix: "starter-traps.pgn" });
    expect(trap?.id.startsWith("starter-traps-pgn-")).toBe(true);
  });
});

describe("defaultDifficultyFromSetupPlies", () => {
  it("beginner sous 6 demi-coups, intermediate sous 12, expert au-delà", () => {
    expect(defaultDifficultyFromSetupPlies(0)).toBe("beginner");
    expect(defaultDifficultyFromSetupPlies(5)).toBe("beginner");
    expect(defaultDifficultyFromSetupPlies(6)).toBe("intermediate");
    expect(defaultDifficultyFromSetupPlies(11)).toBe("intermediate");
    expect(defaultDifficultyFromSetupPlies(12)).toBe("expert");
    expect(defaultDifficultyFromSetupPlies(30)).toBe("expert");
  });
});

describe("splitOpeningFamilyAndGambit", () => {
  it("scinde 'Famille, Sous-variante' en family/gambit distincts", () => {
    expect(splitOpeningFamilyAndGambit("Sicilian Defense, Smith-Morra Gambit")).toEqual({
      family: "Sicilian Defense",
      gambit: "Smith-Morra Gambit",
    });
  });

  it("retire un préfixe de code ECO avant de scinder", () => {
    expect(splitOpeningFamilyAndGambit("B21: Sicilian, Smith-Morra Gambit, Accepted")).toEqual({
      family: "Sicilian",
      gambit: "Smith-Morra Gambit, Accepted",
    });
  });

  it("retombe sur la chaîne entière des deux côtés quand il n'y a aucun séparateur", () => {
    expect(splitOpeningFamilyAndGambit("Alekhine Defense")).toEqual({ family: "Alekhine Defense", gambit: "Alekhine Defense" });
  });
});

describe("estimateDifficultyFromRefutationLength", () => {
  it("beginner sous 4 demi-coups de réfutation, intermediate sous 8, expert au-delà", () => {
    expect(estimateDifficultyFromRefutationLength([])).toBe("beginner");
    expect(estimateDifficultyFromRefutationLength(["a", "b", "c"])).toBe("beginner");
    expect(estimateDifficultyFromRefutationLength(["a", "b", "c", "d"])).toBe("intermediate");
    expect(estimateDifficultyFromRefutationLength(["a", "b", "c", "d", "e", "f", "g"])).toBe("intermediate");
    expect(estimateDifficultyFromRefutationLength(["a", "b", "c", "d", "e", "f", "g", "h"])).toBe("expert");
  });
});

describe("defaultHintForTrapMove", () => {
  it("produit un indice non vide et déterministe pour un même coup", () => {
    const first = defaultHintForTrapMove("Nxe5");
    const second = defaultHintForTrapMove("Nxe5");
    expect(first.length).toBeGreaterThan(0);
    expect(first).toBe(second);
  });

  it("ne plante jamais sur un roque", () => {
    expect(defaultHintForTrapMove("O-O").length).toBeGreaterThan(0);
    expect(defaultHintForTrapMove("O-O-O").length).toBeGreaterThan(0);
  });
});

describe("buildBulkTrapFromGame", () => {
  it("scinde [Site] brut en family/gambit et calcule Difficulty/Hint/Commentary faute de tags propriétaires", async () => {
    const pgn = `[Event "Piège brut trouvé en ligne"]\n[Site "Sicilian Defense, Smith-Morra Gambit"]\n\n1. e4 c5 2. d4 cxd4 3. c3 dxc3 4. Nxc3 Nc6 5. Nf3 (5... e5?? {avance centrale prématurée}) 5... d6 6. Bc4 *`;
    const [game] = parsePgnGames(pgn);
    const trap = await buildBulkTrapFromGame(game, { idPrefix: "database-traps.pgn" });
    expect(trap).not.toBeNull();
    if (!trap) return;
    expect(trap.family).toBe("Sicilian Defense");
    expect(trap.gambit).toBe("Smith-Morra Gambit");
    expect(trap.difficulty).toBe(estimateDifficultyFromRefutationLength(trap.refutationMoves));
    expect(trap.hint.length).toBeGreaterThan(0);
    expect(trap.comments).toBe("Réfutation théorique de la ligne. Utilisez le mode Explorer avec Stockfish pour approfondir les variantes.");
  });

  it("respecte un tag [Difficulty]/[Hint]/[Commentary] déjà présent plutôt que de le recalculer", async () => {
    const [game] = parsePgnGames(`[Event "Test"]\n[Site "Ouverture Test"]\n[Difficulty "expert"]\n[Hint "Indice sur mesure."]\n[Commentary "Commentaire sur mesure."]\n\n1. e4 e5 2. Nf3 (2... Qh4?? {sortie prématurée}) 2... Nc6 *`);
    const trap = await buildBulkTrapFromGame(game, { idPrefix: "x" });
    expect(trap?.difficulty).toBe("expert");
    expect(trap?.hint).toBe("Indice sur mesure.");
    expect(trap?.comments).toBe("Commentaire sur mesure.");
  });

  it("sans variation exploitable ET sans résolveur fourni, renvoie null — comme buildTrapFromGame", async () => {
    const [game] = parsePgnGames(NO_VARIATION_PGN);
    expect(await buildBulkTrapFromGame(game, { idPrefix: "x" })).toBeNull();
  });

  it("repli linéaire : interroge le résolveur fourni pour trouver refutationMoves[0], l'avant-dernier coup joué devient trapMove", async () => {
    const [game] = parsePgnGames(NO_VARIATION_PGN);
    const resolver = vi.fn(stubEngineResolver());
    const trap = await buildBulkTrapFromGame(game, { idPrefix: "x", resolveLinearFallbackRefutation: resolver });
    expect(trap).not.toBeNull();
    if (!trap) return;
    expect(trap.setupMoves).toEqual(["e4", "c5", "Nf3", "d6", "d4", "cxd4"]);
    expect(trap.trapMove).toBe("Nxd4"); // avant-dernier coup joué, PAS le dernier — voir le docstring de validateLinearFallbackTrap
    expect(trap.refutationMoves).toHaveLength(1);
    expect(trap.refutationMoves[0]).not.toBe(trap.trapMove);

    // Le résolveur a bien été appelé avec la position CRITIQUE (juste avant trapMove), jamais après.
    expect(resolver).toHaveBeenCalledTimes(1);
    const [fenArg, trapMoveArg] = resolver.mock.calls[0]!;
    expect(trapMoveArg).toBe("Nxd4");
    const criticalPosition = new Chess();
    for (const san of trap.setupMoves) criticalPosition.move(san);
    expect(fenArg).toBe(criticalPosition.fen());

    // Filet de sécurité final, comme pour buildTrapFromGame : refutationMoves doit rejouer légal
    // DIRECTEMENT depuis la position critique (trapMove n'est jamais joué sur l'échiquier — voir
    // buildTrapRound dans trap-round.ts).
    const chess = new Chess();
    for (const san of trap.setupMoves) expect(() => chess.move(san)).not.toThrow();
    const trapCheck = new Chess(chess.fen());
    expect(() => trapCheck.move(trap.trapMove)).not.toThrow();
    for (const san of trap.refutationMoves) expect(() => chess.move(san)).not.toThrow();
  });

  it("repli linéaire : remonte de plusieurs demi-coups quand le moteur confirme que les derniers coups joués étaient déjà les meilleurs", async () => {
    const [game] = parsePgnGames(NO_VARIATION_PGN); // ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6"]
    const resolver = resolverThatAgreesFirstNTimes(2); // confirme "Nxd4" (avant-dernier) puis "cxd4" avant de diverger sur "d4"
    const trap = await buildBulkTrapFromGame(game, { idPrefix: "x", resolveLinearFallbackRefutation: resolver });
    expect(trap).not.toBeNull();
    if (!trap) return;
    expect(trap.trapMove).toBe("d4");
    expect(trap.setupMoves).toEqual(["e4", "c5", "Nf3", "d6"]);
    expect(trap.refutationMoves).toHaveLength(1);
    expect(trap.refutationMoves[0]).not.toBe("d4");
  });

  it("repli linéaire : abandonne au-delà de MAX_LINEAR_FALLBACK_LOOKBACK_PLIES demi-coups en arrière", async () => {
    const [game] = parsePgnGames(NO_VARIATION_PGN); // 8 demi-coups, fenêtre de recherche de 6
    const trap = await buildBulkTrapFromGame(game, { idPrefix: "x", resolveLinearFallbackRefutation: noBetterMoveResolver() });
    expect(trap).toBeNull();
  });

  it("repli linéaire : le DERNIER coup du PGN (punition adverse) n'est jamais utilisé tel quel comme réfutation", async () => {
    const [game] = parsePgnGames(LINEAR_FALLBACK_PGN);
    const resolver = vi.fn(stubEngineResolver());
    const trap = await buildBulkTrapFromGame(game, { idPrefix: "bulk-raw/bill-wall.pgn", resolveLinearFallbackRefutation: resolver });
    expect(trap).not.toBeNull();
    if (!trap) return;
    expect(trap.setupMoves).toEqual(["e4", "e5", "Ne2", "d5", "exd5", "Qxd5", "Nbc3", "Qc6", "Ng3"]);
    expect(trap.trapMove).toBe("g6");
    expect(trap.victimSide).toBe("black");
    expect(trap.family).toBe("King's Pawn Game");
    // "Bb5" est la punition RÉELLE jouée par les Blancs APRÈS g6 — pas un coup licite pour les
    // Noirs depuis la position critique, donc jamais ce que le résolveur (stub ou vrai moteur) renvoie ici.
    expect(trap.refutationMoves).not.toEqual(["Bb5"]);
  });

  it("repli linéaire : tronque au dernier coup légal plutôt que de jeter tout le puzzle", async () => {
    const [game] = parsePgnGames(TRUNCATE_TAIL_PGN);
    const trap = await buildBulkTrapFromGame(game, { idPrefix: "x", resolveLinearFallbackRefutation: stubEngineResolver() });
    expect(trap).not.toBeNull();
    if (!trap) return;
    expect(trap.trapMove).toBe("Nc3"); // "Zz9" (résidu illisible) et "a6" (dernier coup légal) ne sont pas trapMove — voir MIN_LINEAR_FALLBACK_PLIES
    expect(trap.setupMoves).toEqual(["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6"]);
  });

  it("repli linéaire : renvoie null si moins de 2 coups restent légaux après troncature", async () => {
    const [game] = parsePgnGames(TOO_SHORT_AFTER_TRUNCATION_PGN);
    expect(await buildBulkTrapFromGame(game, { idPrefix: "x", resolveLinearFallbackRefutation: stubEngineResolver() })).toBeNull();
  });

  it("repli linéaire : renvoie null quand le résolveur ne trouve rien de mieux que la gaffe elle-même", async () => {
    const [game] = parsePgnGames(NO_VARIATION_PGN);
    const trap = await buildBulkTrapFromGame(game, { idPrefix: "x", resolveLinearFallbackRefutation: noBetterMoveResolver() });
    expect(trap).toBeNull();
  });

  it("repli linéaire : renvoie null quand le résolveur ne trouve rien du tout (moteur indisponible)", async () => {
    const [game] = parsePgnGames(NO_VARIATION_PGN);
    const alwaysNull: LinearFallbackRefutationResolver = async () => null;
    expect(await buildBulkTrapFromGame(game, { idPrefix: "x", resolveLinearFallbackRefutation: alwaysNull })).toBeNull();
  });
});

describe("buildOpeningLineFromGame", () => {
  it("construit une ligne légale depuis une partie sans variation", () => {
    const [game] = parsePgnGames(NO_VARIATION_PGN);
    const line = buildOpeningLineFromGame(game, { idPrefix: "starter-openings.pgn" });
    expect(line).not.toBeNull();
    expect(line?.moves).toEqual(["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6"]);
    expect(line?.name).toBe("Partie Simple");
  });

  it("renvoie null si la ligne principale contient un coup illégal", () => {
    const pgn = `[Event "Cassée"]\n[Site "X"]\n\n1. e4 e5 2. Zz9 Nc6 *`;
    const [game] = parsePgnGames(pgn);
    expect(buildOpeningLineFromGame(game, { idPrefix: "x" })).toBeNull();
  });
});
