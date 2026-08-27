import { describe, expect, it } from "vitest";
import {
  applyPuzzleEvent,
  initialSolveState,
  isHoverArrowsEnabled,
  MAX_PUZZLE_ATTEMPTS,
  type PlyMark,
  type PuzzleSolveState,
  type SolvePhase,
} from "./solve-state";

function move(partial: Partial<PlyMark> = {}): PlyMark {
  return { from: "e2", to: "e4", uci: "e2e4", san: "e4", quality: null, ...partial };
}

describe("initialSolveState", () => {
  it("démarre en phase 'solving', aucun pli consommé, 3 essais", () => {
    const state = initialSolveState(3);
    expect(state.phase).toBe("solving");
    expect(state.moveIndex).toBe(0);
    expect(state.totalPlies).toBe(3);
    expect(state.lastMove).toBeNull();
    expect(state.firstPlayedUci).toBeNull();
    expect(state.attemptsLeft).toBe(MAX_PUZZLE_ATTEMPTS);
    expect(state.lastWrongUci).toBeNull();
    expect(state.lastWrongHint).toBeNull();
    expect(state.revealed).toBe(false);
  });
});

describe("applyPuzzleEvent — solving", () => {
  it("coup solution non-terminal → opponent-reply, moveIndex avance, badge 'best'", () => {
    const state = initialSolveState(3); // 3 plis : joueur, adversaire, joueur
    const next = applyPuzzleEvent(state, {
      type: "PLAYER_MOVED",
      move: move({ uci: "e2e4" }),
      matchesSolution: true,
      fenBefore: "start",
      hint: "generic",
    });
    expect(next.phase).toBe("opponent-reply");
    expect(next.moveIndex).toBe(1);
    expect(next.lastMove?.quality).toBe("best");
    expect(next.firstPlayedUci).toBe("e2e4");
  });

  it("coup solution qui est le DERNIER pli → solved directement, pas d'étape opponent-reply", () => {
    const state = initialSolveState(1); // solution d'un seul pli
    const next = applyPuzzleEvent(state, {
      type: "PLAYER_MOVED",
      move: move(),
      matchesSolution: true,
      fenBefore: "start",
      hint: "generic",
    });
    expect(next.phase).toBe("solved");
  });

  it("firstPlayedUci se fige au premier coup et n'est jamais réécrit", () => {
    const afterFirst = applyPuzzleEvent(initialSolveState(3), {
      type: "PLAYER_MOVED",
      move: move({ uci: "e2e4" }),
      matchesSolution: true,
      fenBefore: "start",
      hint: "generic",
    });
    const afterReply = applyPuzzleEvent(afterFirst, {
      type: "OPPONENT_REPLY_PLAYED",
      move: move({ uci: "e7e5" }),
    });
    const afterSecond = applyPuzzleEvent(afterReply, {
      type: "PLAYER_MOVED",
      move: move({ uci: "g1f3" }),
      matchesSolution: true,
      fenBefore: "mid",
      hint: "generic",
    });
    expect(afterSecond.firstPlayedUci).toBe("e2e4");
  });

  it("déviation avec essais restants → reste en solving, décrémente attemptsLeft, garde lastWrongUci/lastWrongHint, ne touche pas lastMove", () => {
    const state = initialSolveState(3);
    const next = applyPuzzleEvent(state, {
      type: "PLAYER_MOVED",
      move: move({ uci: "a2a3" }),
      matchesSolution: false,
      fenBefore: "start",
      hint: "hangs_piece",
    });
    expect(next.phase).toBe("solving");
    expect(next.attemptsLeft).toBe(MAX_PUZZLE_ATTEMPTS - 1);
    expect(next.lastWrongUci).toBe("a2a3");
    expect(next.lastWrongHint).toBe("hangs_piece");
    expect(next.lastMove).toBeNull();
    expect(next.firstPlayedUci).toBe("a2a3");
    expect(next.moveIndex).toBe(0);
  });

  it("3e déviation (dernier essai) → failed, attemptsLeft à 0", () => {
    let state = initialSolveState(3);
    for (let i = 0; i < MAX_PUZZLE_ATTEMPTS - 1; i++) {
      state = applyPuzzleEvent(state, {
        type: "PLAYER_MOVED",
        move: move({ uci: "a2a3" }),
        matchesSolution: false,
        fenBefore: "start",
        hint: "generic",
      });
      expect(state.phase).toBe("solving");
    }
    const last = applyPuzzleEvent(state, {
      type: "PLAYER_MOVED",
      move: move({ uci: "a2a3" }),
      matchesSolution: false,
      fenBefore: "start",
      hint: "exposes_king",
    });
    expect(last.phase).toBe("failed");
    expect(last.attemptsLeft).toBe(0);
    expect(last.lastWrongUci).toBe("a2a3");
    expect(last.lastWrongHint).toBe("exposes_king");
  });

  it("coup correct après une déviation efface lastWrongUci et lastWrongHint", () => {
    const afterWrong = applyPuzzleEvent(initialSolveState(3), {
      type: "PLAYER_MOVED",
      move: move({ uci: "a2a3" }),
      matchesSolution: false,
      fenBefore: "start",
      hint: "hangs_piece",
    });
    const afterCorrect = applyPuzzleEvent(afterWrong, {
      type: "PLAYER_MOVED",
      move: move({ uci: "e2e4" }),
      matchesSolution: true,
      fenBefore: "start",
      hint: "generic",
    });
    expect(afterCorrect.lastWrongUci).toBeNull();
    expect(afterCorrect.lastWrongHint).toBeNull();
  });

  it("ignore un événement qui n'est pas PLAYER_MOVED", () => {
    const state = initialSolveState(3);
    const next = applyPuzzleEvent(state, { type: "REVEAL_PLY_PLAYED", ply: move() });
    expect(next).toBe(state);
  });
});

describe("applyPuzzleEvent — opponent-reply", () => {
  function opponentReplyState(totalPlies: number): PuzzleSolveState {
    return { ...initialSolveState(totalPlies), phase: "opponent-reply", moveIndex: 1 };
  }

  it("pli intermédiaire → repasse en solving", () => {
    const next = applyPuzzleEvent(opponentReplyState(3), {
      type: "OPPONENT_REPLY_PLAYED",
      move: move({ uci: "e7e5" }),
    });
    expect(next.phase).toBe("solving");
    expect(next.moveIndex).toBe(2);
    expect(next.lastMove?.quality).toBeNull();
  });

  it("dernier pli de la solution → solved", () => {
    const next = applyPuzzleEvent(opponentReplyState(2), {
      type: "OPPONENT_REPLY_PLAYED",
      move: move({ uci: "e7e5" }),
    });
    expect(next.phase).toBe("solved");
  });
});

describe("applyPuzzleEvent — failed (révélation)", () => {
  function failedState(): PuzzleSolveState {
    return { ...initialSolveState(3), phase: "failed", attemptsLeft: 0, moveIndex: 0 };
  }

  it("REVEAL_REQUESTED amorce la révélation", () => {
    const next = applyPuzzleEvent(failedState(), { type: "REVEAL_REQUESTED", totalPlies: 3 });
    expect(next.phase).toBe("failed");
    expect(next.revealTotalPlies).toBe(3);
    expect(next.revealPlyIndex).toBe(0);
    expect(next.revealed).toBe(false);
  });

  it("REVEAL_REQUESTED avec 0 pli restant marque directement 'revealed'", () => {
    const next = applyPuzzleEvent(failedState(), { type: "REVEAL_REQUESTED", totalPlies: 0 });
    expect(next.revealed).toBe(true);
    expect(next.revealTotalPlies).toBe(0);
  });

  it("une seconde demande une fois lancée est ignorée", () => {
    const started = applyPuzzleEvent(failedState(), { type: "REVEAL_REQUESTED", totalPlies: 3 });
    const again = applyPuzzleEvent(started, { type: "REVEAL_REQUESTED", totalPlies: 3 });
    expect(again).toBe(started);
  });

  it("REVEAL_PLY_PLAYED avance l'index, badge 'best'", () => {
    const started = applyPuzzleEvent(failedState(), { type: "REVEAL_REQUESTED", totalPlies: 2 });
    const afterFirst = applyPuzzleEvent(started, {
      type: "REVEAL_PLY_PLAYED",
      ply: move({ uci: "d1h5" }),
    });
    expect(afterFirst.phase).toBe("failed");
    expect(afterFirst.revealPlyIndex).toBe(1);
    expect(afterFirst.revealed).toBe(false);
    expect(afterFirst.lastMove?.quality).toBe("best");
  });

  it("dernier pli de la révélation → revealed", () => {
    const started = applyPuzzleEvent(failedState(), { type: "REVEAL_REQUESTED", totalPlies: 1 });
    const done = applyPuzzleEvent(started, {
      type: "REVEAL_PLY_PLAYED",
      ply: move({ uci: "d1h5" }),
    });
    expect(done.revealed).toBe(true);
  });

  it("PLAYER_MOVED résiduel une fois 'failed' est ignoré", () => {
    const state = failedState();
    const next = applyPuzzleEvent(state, {
      type: "PLAYER_MOVED",
      move: move(),
      matchesSolution: true,
      fenBefore: "start",
      hint: "generic",
    });
    expect(next).toBe(state);
  });
});

describe("applyPuzzleEvent — solved (terminal)", () => {
  it("ignore tout événement une fois 'solved'", () => {
    const state: PuzzleSolveState = { ...initialSolveState(3), phase: "solved" };
    const next = applyPuzzleEvent(state, {
      type: "PLAYER_MOVED",
      move: move(),
      matchesSolution: true,
      fenBefore: "start",
      hint: "generic",
    });
    expect(next).toBe(state);
  });
});

describe("isHoverArrowsEnabled", () => {
  const expected: Record<SolvePhase, boolean> = {
    solving: false,
    "opponent-reply": false,
    solved: true,
    failed: true,
  };

  it.each(Object.keys(expected) as SolvePhase[])("phase '%s'", (phase) => {
    expect(isHoverArrowsEnabled(phase)).toBe(expected[phase]);
  });
});
