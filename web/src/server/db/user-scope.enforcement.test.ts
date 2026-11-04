import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Contrôle statique du cloisonnement : dans tout `src/`, une table personnelle
 *
 *  1. ne s'importe jamais de `@/server/db/schema` (seulement de `user-scope`) ;
 *  2. n'est lue, jointe, modifiée ou supprimée que dans une chaîne Drizzle qui
 *     la filtre par `s.where(table, …)` ou `s.owns(…, table, …)` ;
 *  3. n'est insérée qu'avec `s.own(…)` / `s.ownAll(…)`.
 *
 * Exceptions : `user-scope.ts` lui-même (suppression de compte, reprise) et les
 * fonctions marquées `user-scope: maintenance` (scripts d'exploitation sans
 * chemin HTTP). Le test comportemental `user-isolation.test.ts` complète ce
 * contrôle.
 */
const ROOT = join(import.meta.dirname, "../..");

const PERSONAL = [
  "platformLinks",
  "settings",
  "games",
  "moves",
  "botGameResults",
  "puzzles",
  "reviews",
  "reviewLogs",
  "dailySets",
  "puzzlePurges",
  "openingMistakeReview",
  "openingProgress",
  "openingEnduranceSessions",
  "sparringSessions",
  "sparringMoves",
  "trainingEvents",
  "trainingRecommendations",
  "userThemeProgress",
  "programmeState",
  "programmeSessions",
  "programmePuzzleResults",
];

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...sourceFiles(path));
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(path);
  }
  return out;
}

const EXCLUDED = new Set(["server/db/user-scope.ts"]);

function maintenanceRanges(text: string): [number, number][] {
  const ranges: [number, number][] = [];
  let at = text.indexOf("user-scope: maintenance");
  while (at !== -1) {
    const start = text.lastIndexOf("export async function", at);
    const next = text.indexOf("\nexport ", at);
    ranges.push([start, next === -1 ? text.length : next]);
    at = text.indexOf("user-scope: maintenance", at + 1);
  }
  return ranges;
}

function violations(file: string, text: string): string[] {
  const problems: string[] = [];
  for (const match of text.matchAll(/import\s+\{([^}]*)\}\s+from\s+"@\/server\/db\/schema"/g)) {
    const names = match[1].split(",").map((part) => part.trim()).filter((part) => part && !part.startsWith("type "));
    for (const name of names) if (PERSONAL.includes(name)) problems.push(`${file} : ${name} importée de @/server/db/schema`);
  }

  const skip = maintenanceRanges(text);
  const call = new RegExp(`\\.(from|innerJoin|leftJoin|rightJoin|update|delete|insert)\\(\\s*(${PERSONAL.join("|")})\\b`, "g");
  for (const match of text.matchAll(call)) {
    const index = match.index ?? 0;
    if (skip.some(([start, end]) => index >= start && index < end)) continue;
    const [, verb, table] = match;
    // Chaîne Drizzle : du dernier `db`/`tx` jusqu'au prochain `;` ou au prochain `db.`/`tx.`.
    const before = text.slice(0, index);
    const chainStart = Math.max(before.lastIndexOf("db"), before.lastIndexOf("tx"));
    const rest = text.slice(index + match[0].length);
    const endMatch = /;|\b(db|tx)\s*\.\s*(select|insert|update|delete|selectDistinct)\b/.exec(rest);
    const chain = text.slice(chainStart, index + match[0].length + (endMatch ? endMatch.index : rest.length));
    const line = before.split("\n").length;
    if (verb === "insert") {
      if (!/\b(own|ownAll)\(/.test(chain)) problems.push(`${file}:${line} insert(${table}) sans s.own()`);
    } else {
      const filtered = new RegExp(`\\.where\\(\\s*${table}\\b|\\.owns\\([\\w\\s,]*\\b${table}\\b`).test(chain);
      if (!filtered) problems.push(`${file}:${line} ${verb}(${table}) sans filtre user_id`);
    }
  }
  return problems;
}

describe("cloisonnement des données personnelles (contrôle statique)", () => {
  it("chaque accès à une table personnelle passe par userScope", () => {
    const problems: string[] = [];
    for (const path of sourceFiles(ROOT)) {
      const file = relative(ROOT, path);
      if (EXCLUDED.has(file) || file.startsWith("server/db/schema/") || file.startsWith("test/")) continue;
      problems.push(...violations(file, readFileSync(path, "utf8")));
    }
    expect(problems).toEqual([]);
  });

  it("détecte bien une requête non filtrée (témoin)", () => {
    const sample = `const rows = await db.select().from(games).where(eq(games.id, id));\nawait db.insert(moves).values(row);`;
    expect(violations("témoin.ts", sample)).toHaveLength(2);
    const ok = `const rows = await db.select().from(games).where(s.where(games, eq(games.id, id)));\nawait db.insert(moves).values(s.own(row));`;
    expect(violations("témoin.ts", ok)).toEqual([]);
  });
});
