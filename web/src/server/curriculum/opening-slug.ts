import "server-only";

/**
 * Résout l'ECO/nom d'ouverture d'un groupe `games` (voir `games.eco`/
 * `games.openingName`) vers l'`id` d'un chapitre de l'onglet Ouvertures — sert
 * le lien « Lancer le Drill Listudy » du bandeau « ⚠️ Ouverture en
 * difficulté » (`progress-overview.tsx`), qui doit pointer vers
 * `/ouvertures/[slug]?drill=...`.
 *
 * Même priorité que `buildDeviationGameSummaries`
 * (`server/queries/opening-mistakes.ts`) : le catalogue curaté (`OPENINGS`,
 * ~20 chapitres à noms français) d'abord, par code ECO ; sinon une famille
 * dynamique lichess-org (`listOpeningFamilies`,
 * `server/curriculum/imported-openings-index.ts`) par nom de famille — le
 * texte avant le premier « : » de `games.openingName`, même convention que
 * `imported-openings-index.ts#familyNameOf` (non exporté, répliquée ici en
 * une ligne plutôt que de toucher à ce module stable).
 */
import { OPENINGS } from "@/core/curriculum/openings";
import { listOpeningFamilies } from "./imported-openings-index";

function familyNameOf(openingName: string): string {
  const idx = openingName.indexOf(":");
  return idx === -1 ? openingName.trim() : openingName.slice(0, idx).trim();
}

/** `null` si ni le catalogue curaté ni les familles dynamiques ne couvrent cette ouverture. */
export function resolveOpeningSlug(eco: string | null, openingName: string | null): string | null {
  if (eco) {
    const curated = OPENINGS.find((opening) => opening.eco === eco);
    if (curated) return curated.id;
  }
  if (openingName) {
    const family = listOpeningFamilies().find((f) => f.name === familyNameOf(openingName));
    if (family) return family.id;
  }
  return null;
}
