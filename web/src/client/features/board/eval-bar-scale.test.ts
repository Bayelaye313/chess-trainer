import { describe, expect, it } from "vitest";
import { evalBarFill, formatEvalBarLabel } from "./eval-bar-scale";

describe("evalBarFill", () => {
  it("place l'égalité au milieu et une absence de score au neutre", () => {
    expect(evalBarFill(0, null)).toBe(50);
    expect(evalBarFill(null, null)).toBe(50);
    expect(evalBarFill(Number.NaN, null)).toBe(50);
  });

  it("passe par les ancres +1 → 55 %, +3 → 75 %, +5 → 95 %", () => {
    expect(evalBarFill(100, null)).toBeCloseTo(55);
    expect(evalBarFill(300, null)).toBeCloseTo(75);
    expect(evalBarFill(500, null)).toBeCloseTo(95);
  });

  it("interpole entre les ancres", () => {
    expect(evalBarFill(50, null)).toBeCloseTo(52.5);
    expect(evalBarFill(200, null)).toBeCloseTo(65);
    expect(evalBarFill(650, null)).toBeCloseTo(97.5);
  });

  it("plafonne à 100 % au-delà de +8", () => {
    expect(evalBarFill(800, null)).toBe(100);
    expect(evalBarFill(2500, null)).toBe(100);
  });

  it("est symétrique pour les Noirs", () => {
    for (const cp of [30, 100, 250, 300, 500, 1200]) {
      expect(evalBarFill(-cp, null)).toBeCloseTo(100 - evalBarFill(cp, null));
    }
  });

  it("est monotone croissante", () => {
    let previous = -1;
    for (let cp = -1000; cp <= 1000; cp += 10) {
      const fill = evalBarFill(cp, null);
      expect(fill).toBeGreaterThanOrEqual(previous);
      previous = fill;
    }
  });

  it("remplit la barre pour le camp qui mate", () => {
    expect(evalBarFill(null, 3)).toBe(100);
    expect(evalBarFill(null, -2)).toBe(0);
    // Le mat l'emporte sur un cp résiduel éventuel.
    expect(evalBarFill(-400, 1)).toBe(100);
  });
});

describe("formatEvalBarLabel", () => {
  it("affiche une décimale avec le signe", () => {
    expect(formatEvalBarLabel(120, null)).toBe("+1.2");
    expect(formatEvalBarLabel(-40, null)).toBe("-0.4");
    expect(formatEvalBarLabel(34, null)).toBe("+0.3");
    expect(formatEvalBarLabel(1250, null)).toBe("+12.5");
  });

  it("n'affiche jamais de zéro signé", () => {
    expect(formatEvalBarLabel(0, null)).toBe("0.0");
    expect(formatEvalBarLabel(4, null)).toBe("0.0");
    expect(formatEvalBarLabel(-4, null)).toBe("0.0");
  });

  it("remplace le score par M suivi du nombre de coups en cas de mat", () => {
    expect(formatEvalBarLabel(null, 3)).toBe("M3");
    expect(formatEvalBarLabel(null, -5)).toBe("-M5");
    expect(formatEvalBarLabel(250, 1)).toBe("M1");
  });

  it("montre un tiret sans score", () => {
    expect(formatEvalBarLabel(null, null)).toBe("—");
  });
});
