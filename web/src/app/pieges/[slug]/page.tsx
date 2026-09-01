import { notFound } from "next/navigation";
import { PiegeDrillScreen } from "@/client/features/openings/piege-drill-screen";
import { DIFFICULTY_ORDER } from "@/core/curriculum/traps";
import { listAllTraps } from "@/server/queries/traps";

export default async function PiegeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const traps = await listAllTraps();
  const trap = traps.find((candidate) => candidate.id === slug);
  if (!trap) notFound();

  // Le reste de la série (même `family` + `gambit`), triée par difficulté croissante — même ordre que la
  // grille de pastilles NIVEAU 3 de `PiegesScreen` — pour enchaîner les puzzles sans jamais repasser par le serveur
  // (voir `OpeningTrapDrill`, flux « Suivant → »).
  const seriesTraps = traps
    .filter((candidate) => candidate.family === trap.family && candidate.gambit === trap.gambit)
    .sort((a, b) => DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty));

  return <PiegeDrillScreen trap={trap} seriesTraps={seriesTraps} />;
}
