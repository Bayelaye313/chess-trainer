import { EsportCanvas, EsportHeader } from "@/components/ui/esport-page";
import { ProgressOverview } from "@/client/features/games/progress-overview";
import { CourseGamesCard } from "@/client/features/reports/course-games-card";
import { QualitySummaryTable } from "@/client/features/reports/quality-summary-table";
import { getCourseGamesOverview } from "@/server/queries/course-games";
import { getMoveQualityTally, getPlayerProgress } from "@/server/queries/progress";

// Sans searchParams ni autre API dynamique, Next.js prérendrait cette page une
// fois au build et servirait ensuite des statistiques figées — alors que de
// nouvelles parties s'analysent en continu. Il faut la lire à chaque requête.
export const dynamic = "force-dynamic";

export default async function RapportPage() {
  const [overview, qualityTally, courseGames] = await Promise.all([
    getPlayerProgress(),
    getMoveQualityTally(),
    getCourseGamesOverview(),
  ]);

  return (
    <EsportCanvas>
    <div className="space-y-6">
      <EsportHeader eyebrow="Rapport de performance / 02" title="Lis ton propre jeu.">
        Précision par phase de jeu, fourchettes et clouages trouvés contre manqués, performance par ouverture,
        pièces laissées en prise. Tout s&apos;agrège depuis la table des coups analysés.
      </EsportHeader>

      <ProgressOverview overview={overview} />

      <CourseGamesCard rows={courseGames} />

      <QualitySummaryTable tally={qualityTally} />
    </div>
    </EsportCanvas>
  );
}
