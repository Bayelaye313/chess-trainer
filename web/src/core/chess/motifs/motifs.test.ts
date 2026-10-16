import { Chess, type Move } from "chess.js";
import { describe, expect, it } from "vitest";
import { detectMotifs, isBackRankMate, isDiscoveredAttack, isFork, isSkewer } from ".";
import { detectCaptureMotifs } from "./capture";

/** Joue un coup SAN et renvoie la position avant, le coup, la position après. */
function play(fen: string, san: string): { before: Chess; move: Move; after: Chess } {
  const before = new Chess(fen);
  const after = new Chess(fen);
  const move = after.move(san);
  return { before, move, after };
}

describe("isFork", () => {
  it("détecte une fourchette de cavalier sur roi et dame", () => {
    // Cavalier blanc e5 → f7 : d'où il attaque le roi h8 et la dame d8.
    const { move, after } = play("3q3k/8/8/4N3/8/8/8/4K3 w - - 0 20", "Nf7+");
    expect(isFork(after, move.to, "w")).toBe(true);
  });

  it("ignore une seule cible", () => {
    const { move, after } = play("7k/8/8/4N3/8/8/8/4K3 w - - 0 20", "Nf7+");
    expect(isFork(after, move.to, "w")).toBe(false);
  });

  it("ne compte pas deux pions comme une fourchette", () => {
    // Cavalier en c3 saute en b5 : il n'attaque que des pions, sans valeur.
    const { move, after } = play("4k3/8/8/8/1p1p4/2N5/8/4K3 w - - 0 20", "Nb5");
    expect(isFork(after, move.to, "w")).toBe(false);
  });
});

describe("isSkewer", () => {
  it("détecte une enfilade roi devant, tour derrière", () => {
    // Fou blanc cloue en b5 : roi e8 devant, tour h5... on prend une ligne simple.
    // Tour blanche en a1 va en e1 : roi e8 devant, rien derrière -> pas d'enfilade.
    // Ici : dame noire e6 devant le roi ? On teste tour blanche alignée sur d8/d1.
    const { move, after } = play("3q4/3k4/8/8/8/8/8/3RK3 w - - 0 20", "Rd5");
    // Depuis d5 la tour voit d7 (roi) puis d8 (dame) : le roi vaut plus, il devra
    // bouger et abandonner la dame.
    expect(isSkewer(after, move.to, "r", "w")).toBe(true);
  });

  it("renvoie faux pour une pièce non glissante", () => {
    const { move, after } = play("3qk3/8/8/4N3/8/8/8/4K3 w - - 0 20", "Nf7+");
    expect(isSkewer(after, move.to, "n", "w")).toBe(false);
  });
});

describe("isBackRankMate", () => {
  it("détecte le mat du couloir", () => {
    // Roi noir en g8 muré par ses pions f7/g7/h7, tour blanche mate en e8.
    const { after } = play("6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 30", "Re8#");
    expect(after.isCheckmate()).toBe(true);
    expect(isBackRankMate(after)).toBe(true);
  });

  it("ne se déclenche pas si le roi a une case de fuite", () => {
    // Même mat, mais le pion g7 est avancé en g6 : la case g7 est libre.
    const board = new Chess("6k1/5p1p/6p1/8/8/8/8/4R1K1 w - - 0 30");
    board.move("Re8+");
    expect(isBackRankMate(board)).toBe(false);
  });
});

describe("detectCaptureMotifs", () => {
  it("signale une pièce non défendue", () => {
    // Cavalier noir en d5 sans défenseur, capturé par la tour blanche d1.
    const { before, move } = play("4k3/8/8/3n4/8/8/8/3RK3 w - - 0 20", "Rxd5");
    expect(detectCaptureMotifs(before, move, "w")).toEqual(["hanging_piece"]);
  });

  it("ne signale rien quand la pièce prise est défendue", () => {
    // Le pion e6 défend le cavalier d5.
    const { before, move } = play("4k3/8/4p3/3n4/8/8/8/3RK3 w - - 0 20", "Rxd5");
    expect(detectCaptureMotifs(before, move, "w")).toEqual([]);
  });

  it("signale un clouage quand la pièce prise ne pouvait pas fuir", () => {
    // Cavalier noir d7 cloué contre le roi d8 par la tour blanche d1,
    // et défendu par le roi : ce n'est donc pas une pièce en prise.
    const { before, move } = play("3k4/3n4/8/8/8/8/8/3RK3 w - - 0 20", "Rxd7+");
    expect(detectCaptureMotifs(before, move, "w")).toEqual(["pin"]);
  });
});

describe("isDiscoveredAttack", () => {
  it("détecte une ligne démasquée par le coup", () => {
    // Tour blanche d1, cavalier blanc d4 devant elle, dame noire d8.
    // Le cavalier part en f5 : la tour attaque désormais la dame.
    const { before, move, after } = play("3qk3/8/8/8/3N4/8/8/3RK3 w - - 0 20", "Nf5");
    expect(isDiscoveredAttack(before, move, after, "w")).toBe(true);
  });

  it("ne se déclenche pas si aucune ligne ne s'ouvre", () => {
    const { before, move, after } = play("4k3/8/8/8/3N4/8/8/3RK3 w - - 0 20", "Nf5");
    expect(isDiscoveredAttack(before, move, after, "w")).toBe(false);
  });
});

describe("detectMotifs", () => {
  it("remonte la fourchette du coup joué", () => {
    const { before, move, after } = play("3q3k/8/8/4N3/8/8/8/4K3 w - - 0 20", "Nf7+");
    expect(detectMotifs(before, move, after)).toEqual(["fork"]);
  });

  it("ne renvoie rien sur un coup tranquille", () => {
    const { before, move, after } = play(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "e4",
    );
    expect(detectMotifs(before, move, after)).toEqual([]);
  });
});
