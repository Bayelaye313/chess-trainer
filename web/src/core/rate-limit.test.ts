import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("limiteur de fréquence", () => {
  it("bloque au-delà de max passages par fenêtre, clé par clé", () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 2 });
    expect(limiter.hit("a", 0).ok).toBe(true);
    expect(limiter.hit("a", 1_000).ok).toBe(true);
    expect(limiter.hit("a", 2_000)).toEqual({ ok: false, retryAfterMs: 58_000 });
    expect(limiter.hit("b", 2_000).ok).toBe(true);
    expect(limiter.hit("a", 60_001).ok).toBe(true);
  });
});
