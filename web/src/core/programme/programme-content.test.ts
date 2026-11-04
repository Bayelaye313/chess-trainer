import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import phase1 from "./content/phase-1.json";
import { PHASE_1_DAYS } from "./content/phase-1.spec";
import type { DaySpec } from "./content/spec-types";
import { hasMetaphor } from "./metaphors";
import { DAYS_PER_WEEK, MINUTES_PER_DAY, PHASES } from "./phases";
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

// ── Phases 2 à 5 : mêmes règles, appliquées à chaque phase générée ───────────
const CONTENT_DIR = fileURLToPath(new URL("./content/", import.meta.url));
/** Specs présentes (`phase-<n>.spec.ts`), dans l'ordre des phases ; la phase 1 est toujours là. */
const SPECS: (readonly DaySpec[])[] = [PHASE_1_DAYS];
for (const p of PHASES.slice(1)) {
  if (!existsSync(resolve(CONTENT_DIR, `phase-${p.index}.spec.ts`))) break;
  const mod = (await import(`./content/phase-${p.index}.spec.ts`)) as Record<string, readonly DaySpec[]>;
  SPECS.push(mod[`PHASE_${p.index}_DAYS`]);
}
const ALL_SPEC_DAYS = SPECS.flat();

/** Phases dont le JSON existe (générées par `npm run programme:generate -- <n>`), dans l'ordre. */
const GENERATED: { index: number; content: ProgrammePhaseContent }[] = PHASES.flatMap((p) => {
  const file = resolve(CONTENT_DIR, `phase-${p.index}.json`);
  return existsSync(file) ? [{ index: p.index, content: JSON.parse(readFileSync(file, "utf8")) as ProgrammePhaseContent }] : [];
});
const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

describe("Programme — specs des 5 phases", () => {
  it("chaque spec couvre exactement les semaines de sa phase, 7 jours par semaine, jour 7 = rétention", () => {
    SPECS.forEach((days, i) => {
      const phase = PHASES[i];
      expect(days).toHaveLength((phase.semaineFin - phase.semaineDebut + 1) * DAYS_PER_WEEK);
      for (const d of days) {
        expect(d.semaine).toBeGreaterThanOrEqual(phase.semaineDebut);
        expect(d.semaine).toBeLessThanOrEqual(phase.semaineFin);
        if (d.jour === 7) expect(d.reconsolidation.type).toBe("test_retention_j7");
        if (d.jour !== 7) expect(d.sourcing, `S${d.semaine}J${d.jour}`).toBeDefined();
      }
    });
  });

  it("les 36 semaines des 5 phases × 7 jours × 4 h font environ 1000 h", () => {
    const weeks = PHASES.reduce((sum, p) => sum + p.semaineFin - p.semaineDebut + 1, 0);
    const hours = (weeks * DAYS_PER_WEEK * MINUTES_PER_DAY) / 60;
    expect(weeks).toBe(36);
    expect(hours).toBeGreaterThanOrEqual(950);
    expect(hours).toBeLessThanOrEqual(1050);
  });

  it("métaphores : toutes connues, rappels vers des lieux déjà visités, aucune isolée (sur tout le programme)", () => {
    const introduced = new Map<string, number>();
    for (const d of ALL_SPEC_DAYS) if (!introduced.has(d.metaphore_id)) introduced.set(d.metaphore_id, order(d.semaine, d.jour));
    for (const d of ALL_SPEC_DAYS)
      for (const id of [d.metaphore_id, ...d.rappels]) {
        expect(hasMetaphor(id), id).toBe(true);
        expect(introduced.get(id)!, `${id} rappelé en S${d.semaine}J${d.jour}`).toBeLessThanOrEqual(order(d.semaine, d.jour));
      }
    for (const [id, at] of introduced) {
      const reused = ALL_SPEC_DAYS.some((d) => order(d.semaine, d.jour) > at && (d.rappels.includes(id) || d.metaphore_id === id));
      expect(reused, id).toBe(true);
    }
  });
});

describe.each(GENERATED.filter((g) => g.index > 1))("Phase $index — contenu généré", ({ index, content }) => {
  const phase = PHASES[index - 1];

  it("couvre toutes les semaines de la phase", () => {
    expect(content.phase).toBe(phase.id);
    expect(content.jours).toHaveLength((phase.semaineFin - phase.semaineDebut + 1) * DAYS_PER_WEEK);
  });

  it("240 min par jour, pauses SMR après chaque bloc de calcul de 25 min ou plus", () => {
    for (const day of content.jours) {
      expect(day.planning_4h.reduce((sum, b) => sum + b.duree_min, 0)).toBe(MINUTES_PER_DAY);
      day.planning_4h.forEach((b, i) => {
        if (b.type === "pause") expect(b.duree_min).toBeGreaterThanOrEqual(5);
        if (b.type === "pause") expect(b.duree_min).toBeLessThanOrEqual(10);
        if (["puzzles", "partie"].includes(b.type) && b.duree_min >= 25) expect(day.planning_4h[i + 1]?.type).toBe("pause");
      });
    }
  });

  it("jours 1–6 : 6 puzzles vérifiés et un blindfold ; jour 7 : test de rétention J+7", () => {
    for (const day of content.jours) {
      if (day.jour === 7) expect(day.reconsolidation.jours_source).toHaveLength(6);
      else {
        expect(day.puzzles, `S${day.semaine}J${day.jour}`).toHaveLength(6);
        expect(day.exercice_blindfold, `S${day.semaine}J${day.jour}`).not.toBeNull();
      }
    }
  });

  it("chaque puzzle est traçable, légal, vérifié, et dans la fenêtre ±200 de l'Elo cible", () => {
    for (const day of content.jours) {
      for (const p of [...day.puzzles, ...(day.reserve ?? [])]) {
        expect(p.url).toBeTruthy();
        expect(p.verification.verifie_le).toBeTruthy();
        expect(() => replay(p.fen, p.solution_uci)).not.toThrow();
        expect(p.squelette_coeur.length).toBeGreaterThan(0);
        if (p.coup_installation) expect(replay(p.coup_installation.fen_avant, [p.coup_installation.uci]).fen()).toBe(p.fen);
        // Coups du solveur bornés par la phase.
        expect(Math.ceil(p.solution_uci.length / 2)).toBeLessThanOrEqual(phase.soloMoves.max);
      }
      for (const p of day.puzzles) expect(Math.abs(p.rating_lichess - day.elo_cible)).toBeLessThanOrEqual(200);
    }
  });

  it("le hack visuel change chaque jour", () => {
    content.jours.forEach((d, i) => {
      if (i > 0) expect(d.hack_visuel.id).not.toBe(content.jours[i - 1].hack_visuel.id);
    });
  });
});

describe("Programme — cohérence entre phases générées", () => {
  it("aucun puzzle servi deux fois dans tout le programme (puzzles, réserve, blindfold)", () => {
    const seen = new Map<string, number>();
    for (const { index, content } of GENERATED)
      for (const d of content.jours) {
        const ids = new Set([...d.puzzles, ...(d.reserve ?? [])].map((p) => p.puzzle_id));
        if (d.exercice_blindfold) ids.add(d.exercice_blindfold.puzzle_id);
        for (const id of ids) {
          expect(seen.get(id), `${id} (phase ${index})`).toBeUndefined();
          seen.set(id, index);
        }
      }
  });

  it("la difficulté croît de phase en phase (rating médian des puzzles par défaut)", () => {
    const medians = GENERATED.map((g) => median(g.content.jours.flatMap((d) => d.puzzles.map((p) => p.rating_lichess))));
    for (let i = 1; i < medians.length; i += 1) expect(medians[i]).toBeGreaterThan(medians[i - 1]);
  });
});
