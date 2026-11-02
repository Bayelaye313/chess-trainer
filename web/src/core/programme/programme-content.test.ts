import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import phase1 from "./content/phase-1.json";
import { PHASE_1_DAYS } from "./content/phase-1.spec";
import { hasMetaphor } from "./metaphors";
import { MINUTES_PER_DAY } from "./phases";
import type { ProgrammePhaseContent, ProgrammePuzzle } from "./types";
import { VISUAL_HACKS } from "./visual-hacks";

/**
 * Contrôles du contenu GÉNÉRÉ (phase-1.json) et de la spec rédigée : ce que le
 * cahier des charges impose, vérifié à chaque `npm test`. Une régénération qui
 * violerait une règle casse ici, pas en production.
 */
const content = phase1 as unknown as ProgrammePhaseContent;
const order = (s: number, j: number) => s * 10 + j;

function replay(fen: string, uci: readonly string[]) {
  const c = new Chess(fen);
  for (const u of uci) c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u.slice(4, 5) || undefined });
  return c;
}

describe("Phase 1 — contenu généré", () => {
  it("couvre 7 semaines × 7 jours", () => {
    expect(content.jours).toHaveLength(49);
  });

  it("chaque jour dure 240 min, et chaque bloc de calcul ≥ 25 min est suivi d'une pause SMR de 5 à 10 min", () => {
    for (const day of content.jours) {
      expect(day.planning_4h.reduce((s, b) => s + b.duree_min, 0)).toBe(MINUTES_PER_DAY);
      day.planning_4h.forEach((b, i) => {
        if (b.type === "pause") expect(b.duree_min).toBeGreaterThanOrEqual(5);
        if (b.type === "pause") expect(b.duree_min).toBeLessThanOrEqual(10);
        if (["puzzles", "partie"].includes(b.type) && b.duree_min >= 25) expect(day.planning_4h[i + 1]?.type).toBe("pause");
      });
      expect(day.planning_4h.some((b) => b.type === "blindfold")).toBe(true);
    }
  });

  it("jours 1–6 : 6 puzzles vérifiés et un blindfold ; jour 7 : test de rétention J+7", () => {
    for (const day of content.jours) {
      if (day.jour === 7) {
        expect(day.reconsolidation.type).toBe("test_retention_j7");
        expect(day.reconsolidation.jours_source).toHaveLength(6);
      } else {
        expect(day.puzzles).toHaveLength(6);
        expect(day.exercice_blindfold).not.toBeNull();
        expect(day.reconsolidation.type).not.toBe("test_retention_j7");
      }
    }
  });

  it("chaque puzzle est traçable, légal et vérifié", () => {
    const all: ProgrammePuzzle[] = content.jours.flatMap((d) => [...d.puzzles, ...(d.reserve ?? [])]);
    expect(new Set(all.map((p) => p.puzzle_id)).size).toBe(all.length);
    for (const p of all) {
      expect(p.verification.verifie_le).toBeTruthy();
      expect(p.url).toBeTruthy();
      if (p.source === "position_pedagogique") expect(p.verification.tablebase).toBeDefined();
      else expect(p.puzzle_id).toMatch(/^[A-Za-z0-9]{5}$/);
      expect(() => replay(p.fen, p.solution_uci)).not.toThrow();
      expect(p.squelette_coeur.length).toBeGreaterThan(0);
      if (p.coup_installation) expect(replay(p.coup_installation.fen_avant, [p.coup_installation.uci]).fen()).toBe(p.fen);
    }
  });

  it("les puzzles par défaut restent dans la fenêtre ±200 de l'Elo cible", () => {
    for (const day of content.jours)
      for (const p of day.puzzles.filter((x) => x.source !== "position_pedagogique")) expect(Math.abs(p.rating_lichess - day.elo_cible)).toBeLessThanOrEqual(200);
  });

  it("le hack visuel change chaque jour", () => {
    content.jours.forEach((d, i) => {
      expect(VISUAL_HACKS.some((h) => h.id === d.hack_visuel.id)).toBe(true);
      if (i > 0) expect(d.hack_visuel.id).not.toBe(content.jours[i - 1].hack_visuel.id);
    });
  });
});

describe("Phase 1 — bibliothèque de métaphores", () => {
  it("toute métaphore référencée existe", () => {
    for (const d of PHASE_1_DAYS) for (const id of [d.metaphore_id, ...d.rappels]) expect(hasMetaphor(id), id).toBe(true);
  });

  it("un rappel ne vise qu'un lieu déjà visité", () => {
    const introducedAt = new Map<string, number>();
    for (const d of PHASE_1_DAYS) if (!introducedAt.has(d.metaphore_id)) introducedAt.set(d.metaphore_id, order(d.semaine, d.jour));
    for (const d of PHASE_1_DAYS)
      for (const id of d.rappels) expect(introducedAt.get(id)!, `${id} rappelé en S${d.semaine}J${d.jour}`).toBeLessThanOrEqual(order(d.semaine, d.jour));
  });

  it("aucune métaphore isolée : chaque lieu introduit est réactivé plus tard", () => {
    const introduced = new Map<string, number>();
    for (const d of PHASE_1_DAYS) if (!introduced.has(d.metaphore_id)) introduced.set(d.metaphore_id, order(d.semaine, d.jour));
    for (const [id, at] of introduced) {
      const reused = PHASE_1_DAYS.some((d) => order(d.semaine, d.jour) > at && (d.rappels.includes(id) || d.metaphore_id === id));
      expect(reused, id).toBe(true);
    }
  });
});
