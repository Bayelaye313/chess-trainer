import type { Metadata } from "next";
import { SectionSwitcher, TRAINING_SECTIONS } from "@/components/ui/section-switcher";
import { PiegesScreen } from "@/client/features/openings/pieges-screen";
import { displayOpeningName } from "@/client/features/openings/opening-display";
import { OFF_REPERTOIRE_COURSE_IDS } from "@/core/curriculum/opening-course-ids";
import { OPENINGS } from "@/core/curriculum/openings";
import { listAllTraps } from "@/server/queries/traps";

export const metadata: Metadata = { title: "Pièges" };
export const dynamic = "force-dynamic";

const STOP_WORDS = new Set(["partie", "defense", "gambit", "debut", "debuts", "de", "la", "le", "du", "des", "game", "opening", "attaque", "systeme"]);

function keywords(name: string): string[] {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .split(/[^a-z0-9-]+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

/**
 * Familles de pièges « de ton répertoire » : tous les mots significatifs du
 * nom de famille (traduit en français) se retrouvent dans le nom d'une
 * ouverture curatée de ton répertoire (hors `OFF_REPERTOIRE_COURSE_IDS`).
 */
function repertoireFamilies(families: readonly string[]): string[] {
  const openingWords = OPENINGS.filter((opening) => !OFF_REPERTOIRE_COURSE_IDS.has(opening.id)).map((opening) => new Set(keywords(opening.name)));
  return families.filter((family) => {
    const words = keywords(displayOpeningName(family));
    return words.length > 0 && openingWords.some((set) => words.every((word) => set.has(word)));
  });
}

export default async function PiegesPage() {
  const traps = await listAllTraps();
  const families = [...new Set(traps.map((trap) => trap.family))];
  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <SectionSwitcher links={TRAINING_SECTIONS} label="Sections de S'entraîner" />
      <PiegesScreen traps={traps} repertoireFamilies={repertoireFamilies(families)} />
    </div>
  );
}
