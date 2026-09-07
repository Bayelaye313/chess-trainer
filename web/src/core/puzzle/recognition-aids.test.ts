import { describe, expect, it } from "vitest";
import { buildRecognitionAids } from "./recognition-aids";

describe("buildRecognitionAids", () => {
  it("signale un roi en échec avant la recherche", () => {
    const result = buildRecognitionAids("4k3/8/8/8/8/8/4R3/4K3 b - - 0 1", "b", []);
    expect(result.inCheck).toBe(true);
    expect(result.text).toContain("échec");
  });

  it("met en évidence les cibles adverses attaquées sans donner le coup", () => {
    const result = buildRecognitionAids("4k3/5p2/3N4/8/8/8/8/4K3 w - - 0 1", "w", ["fork"]);
    expect(result.targetSquares).toContain("f7");
    expect(result.text).toContain("deux cibles");
  });
});