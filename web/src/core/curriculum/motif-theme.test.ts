import { describe, expect, it } from "vitest";
import { MOTIFS, type Motif } from "../chess/types";
import { themeForMotif } from "./motif-theme";

describe("themeForMotif", () => {
  it("résout les 6 motifs connus vers un thème d'Académie réel", () => {
    for (const motif of MOTIFS) {
      expect(themeForMotif(motif)).not.toBeNull();
    }
  });

  it("préfère le module curaté à son équivalent lichess_* quand les deux existent", () => {
    const expected: Record<Motif, string> = {
      fork: "tm-la-fourchette",
      pin: "tm-le-clouage-absolu",
      skewer: "tm-l-enfilade",
      discovered_attack: "tm-l-attaque-a-la-decouverte",
      back_rank_mate: "cm-mat-du-couloir",
      // Pas d'équivalent curaté pour ce motif (voir le docstring de fichier) — retombe sur `lichess_motifs`.
      hanging_piece: "lm-piece-en-prise",
    };

    for (const motif of MOTIFS) {
      expect(themeForMotif(motif)?.themeId).toBe(expected[motif]);
    }
  });
});
