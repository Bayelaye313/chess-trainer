import { describe, expect, it } from "vitest";
import { COACH_FEEDBACKS, pickCoachMessage, resolveCoachSlot, type CoachContext } from "./coach-feedbacks";

const situations = Object.values(COACH_FEEDBACKS).flatMap((profile) => Object.values(profile.situations));

const base: CoachContext = {
  ply: 25,
  outcome: "succes",
  afterFailure: false,
  isFirstError: true,
  isSurprise: false,
  userMovesPlayed: 13,
  accuracy: 95,
};

describe("coach-feedbacks", () => {
  it("a au moins 4 variantes distinctes par situation", () => {
    for (const { variants } of situations) {
      expect(variants.length).toBeGreaterThanOrEqual(4);
      expect(new Set(variants).size).toBe(variants.length);
    }
  });

  it("reste injectable dans [%txt] : ni guillemet droit, ni figurine, ni gabarit inconnu", () => {
    for (const message of situations.flatMap((s) => s.variants)) {
      expect(message).not.toContain('"');
      expect(message).not.toMatch(/[♔-♟]/);
      for (const token of message.match(/\{[^}]*\}/g) ?? []) expect(["{coup}", "{san}", "{precision}"]).toContain(token);
    }
  });

  it("tire une variante déterministe et remplit tous les gabarits", () => {
    const slot = { profile: "murDeBriques", situation: "succesEndurance" } as const;
    for (let seed = 0; seed < 6; seed++) {
      const a = pickCoachMessage(slot, seed, { coup: 14, san: "Nf5", precision: 93.4 });
      expect(a).toEqual(pickCoachMessage(slot, seed, { coup: 14, san: "Nf5", precision: 93.4 }));
      expect(a.outcome).toBe("succes");
      expect(a.text).not.toMatch(/[{}]/);
      expect(pickCoachMessage(slot, seed).text).not.toMatch(/[{}]/);
    }
  });

  it("choisit la situation selon le ply, l'issue, la précision et le mode surprise", () => {
    expect(resolveCoachSlot({ ...base, ply: 7, outcome: "echec" })).toEqual({ profile: "amnesiePrecoce", situation: "echecHorsRepertoire" });
    expect(resolveCoachSlot({ ...base, ply: 12, afterFailure: true })).toEqual({ profile: "amnesiePrecoce", situation: "succesCorrection" });
    expect(resolveCoachSlot({ ...base, ply: 12 })).toBeNull();
    expect(resolveCoachSlot({ ...base, ply: 13, outcome: "echec" })).toBeNull();
    expect(resolveCoachSlot({ ...base, ply: 23, outcome: "echec" })).toEqual({ profile: "essoufflementPositionnel", situation: "echecFatigueStrategique" });
    expect(resolveCoachSlot({ ...base, ply: 30, outcome: "echec" })).toEqual({ profile: "essoufflementPositionnel", situation: "echecFatigueStrategique" });
    expect(resolveCoachSlot({ ...base, ply: 31, outcome: "echec" })).toBeNull();
    expect(resolveCoachSlot({ ...base, ply: 23, outcome: "echec", isFirstError: false })).toBeNull();
    expect(resolveCoachSlot(base)).toEqual({ profile: "murDeBriques", situation: "succesEndurance" });
    expect(resolveCoachSlot({ ...base, userMovesPlayed: 12 })).toBeNull();
    expect(resolveCoachSlot({ ...base, accuracy: 90 })).toBeNull();
    expect(resolveCoachSlot({ ...base, ply: 5, isSurprise: true })).toEqual({ profile: "modeSurprise", situation: "succesRefutation" });
    expect(resolveCoachSlot({ ...base, ply: 5, isSurprise: true, afterFailure: true })).toEqual({ profile: "amnesiePrecoce", situation: "succesCorrection" });
  });
});
