import { describe, expect, it } from "vitest";
import { displayOpeningName } from "@/client/features/openings/opening-display";
import { openingsFacedInRepertoire, repertoireTrapFamilies } from "./trap-repertoire";

const FAMILIES = ["Partie Italienne", "Défense Sicilienne", "Défense Caro-Kann", "Ruy Lopez", "Partie Écossaise", "Gambit Dame", "Gambit Contre Albin", "Débuts Ouverts"];

describe("repertoireTrapFamilies", () => {
  it("range la Partie Italienne et la Ruy Lopez dans le répertoire : je les affronte avec les Noirs", () => {
    const mine = repertoireTrapFamilies(FAMILIES, displayOpeningName);
    expect(mine).toContain("Partie Italienne");
    expect(mine).toContain("Ruy Lopez");
  });

  it("garde le classement des autres familles et ne perd aucune famille", () => {
    const mine = repertoireTrapFamilies(FAMILIES, displayOpeningName);
    expect(mine).toEqual(["Partie Italienne", "Défense Sicilienne", "Défense Caro-Kann", "Ruy Lopez", "Partie Écossaise", "Gambit Dame"]);
    const others = FAMILIES.filter((family) => !mine.includes(family));
    expect(others).toEqual(["Gambit Contre Albin", "Débuts Ouverts"]);
  });
});

describe("openingsFacedInRepertoire", () => {
  it("reprend ruy-lopez et italian-game (prolongés par berlin-black et italian-game-black), pas les Siciliennes noires", () => {
    const ids = openingsFacedInRepertoire().map((opening) => opening.id);
    expect(ids).toEqual(expect.arrayContaining(["ruy-lopez", "italian-game", "berlin-black", "italian-game-black"]));
    expect(ids).not.toContain("sicilian-najdorf");
    expect(ids).not.toContain("slav-defense");
  });
});
