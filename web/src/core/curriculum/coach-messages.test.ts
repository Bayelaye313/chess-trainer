import { describe, expect, it } from "vitest";
import { COACH_FEEDBACKS, pickCoachFeedback, resolveCoachProfile } from "./coach-messages";

const allMessages = Object.values(COACH_FEEDBACKS).flatMap((profile) =>
  Object.values(profile.situations as Record<string, readonly string[]>).flat(),
);

describe("coach-messages", () => {
  it("a au moins 4 variantes par situation", () => {
    for (const profile of Object.values(COACH_FEEDBACKS)) {
      for (const variants of Object.values(profile.situations as Record<string, readonly string[]>)) {
        expect(variants.length).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it("reste injectable dans [%txt] : ni guillemet droit, ni figurine, ni gabarit inconnu", () => {
    for (const message of allMessages) {
      expect(message).not.toContain('"');
      expect(message).not.toMatch(/[♔-♟]/);
      for (const token of message.match(/\{[^}]*\}/g) ?? []) expect(["{coup}", "{san}"]).toContain(token);
    }
  });

  it("tire une variante déterministe et remplit les gabarits", () => {
    const a = pickCoachFeedback("crackPrecoce", "coupPassifOuHorsRepertoire", 7, { coup: 4, san: "h3" });
    expect(a).toBe(pickCoachFeedback("crackPrecoce", "coupPassifOuHorsRepertoire", 7, { coup: 4, san: "h3" }));
    expect(a).not.toMatch(/\{coup\}|\{san\}/);
  });

  it("choisit le profil selon le coup, la précision et le mode surprise", () => {
    expect(resolveCoachProfile({ moveNumber: 4, accuracy: 95, isSurprise: false })).toBe("crackPrecoce");
    expect(resolveCoachProfile({ moveNumber: 10, accuracy: 95, isSurprise: false })).toBe("crapaudDuCoup12");
    expect(resolveCoachProfile({ moveNumber: 14, accuracy: 95, isSurprise: false })).toBe("endurant");
    expect(resolveCoachProfile({ moveNumber: 14, accuracy: 70, isSurprise: false })).toBeNull();
    expect(resolveCoachProfile({ moveNumber: 3, accuracy: null, isSurprise: true })).toBe("modeSurprise");
  });
});
