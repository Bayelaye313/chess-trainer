// Contrôle de l'attribution des parties aux cours : une partie = un seul cours ; cours de mon camp d'abord.
// usage: DATABASE_PATH=<copie> node --conditions=react-server --import tsx scripts/_tmp-attr-check.mts <id>...
import { OPENING_COURSE_TREES } from "@/core/curriculum/opening-course-trees";
import { findOpening } from "@/core/curriculum/openings";
import { getCourseGameReport } from "@/server/queries/course-games";
import { db } from "@/server/db";
import * as schemaNs from "@/server/db/schema";
const moves = ((schemaNs as any).moves ?? (schemaNs as any).default?.moves);
import { inArray } from "drizzle-orm";
const focus = process.argv.slice(2);
const seen = new Map<string, string[]>();
const reports = new Map<string, Awaited<ReturnType<typeof getCourseGameReport>>>();
for (const id of Object.keys(OPENING_COURSE_TREES)) {
  const r = await getCourseGameReport(id);
  reports.set(id, r);
  for (const g of r?.games ?? []) seen.set(g.gameId, [...(seen.get(g.gameId) ?? []), id]);
}
const dup = [...seen].filter(([, ids]) => ids.length > 1);
console.log(`parties attribuées : ${seen.size}, attribuées à plusieurs cours : ${dup.length}`);
// mon camp d'abord : une partie attribuée côté adverse ne doit avoir aucun cours de mon camp parmi les cours candidats
let sideViolations = 0;
for (const [id, r] of reports) {
  const side = findOpening(id)!.side === "white" ? "w" : "b";
  for (const g of r?.games ?? []) if ((g.playerColor === side) !== g.withCourseSide) sideViolations++;
}
console.log(`incohérences camp/withCourseSide : ${sideViolations}`);
for (const id of focus) {
  const r = reports.get(id)!;
  const ids = r.games.map((g) => g.gameId);
  const mv = ids.length ? await db.select({ gameId: moves.gameId, ply: moves.ply, san: moves.san }).from(moves).where(inArray(moves.gameId, ids)) : [];
  const line = (gid: string) => mv.filter((m) => m.gameId === gid && m.ply <= 6).sort((a, b) => a.ply - b.ply).map((m) => m.san).join(" ");
  console.log(`\n${id} : ${r.games.length} parties (${r.games.filter((g) => g.withCourseSide).length} avec le camp du cours)`);
  for (const g of r.games.slice(0, 40)) console.log(`  ${g.playerColor} ${g.withCourseSide ? "camp" : "réf."} suit ${g.match.followedPlies} | ${line(g.gameId)}`);
}
