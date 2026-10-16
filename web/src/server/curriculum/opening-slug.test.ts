import { describe, expect, it } from "vitest";
import { isCatalogOpeningId } from "./opening-slug";

describe("isCatalogOpeningId", () => {
  it("reconnaît un chapitre curaté et une carte lichess-org gardée", () => {
    expect(isCatalogOpeningId("ruy-lopez")).toBe(true);
    expect(isCatalogOpeningId("lichess-petrov-s-defense")).toBe(true);
  });

  it("écarte les ouvertures retirées du catalogue (purge du 2026-10-16), dont la progression reste en base", () => {
    for (const id of ["vienna-gambit", "kings-gambit", "lichess-zukertort-defense", "lichess-zaire-defense", "lichess-zukertort-opening"]) {
      expect(isCatalogOpeningId(id), id).toBe(false);
    }
  });
});
