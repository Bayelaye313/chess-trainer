import type { Metadata } from "next";
import { History, ListOrdered, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressOverview } from "@/client/features/games/progress-overview";
import { CourseGamesCard } from "@/client/features/reports/course-games-card";
import { QualitySummaryTable } from "@/client/features/reports/quality-summary-table";
import { getCourseGamesOverview } from "@/server/queries/course-games";
import { getMoveQualityTally, getPlayerProgress } from "@/server/queries/progress";

export const metadata: Metadata = { title: "Progrès" };
// De nouvelles parties s'analysent en continu : lu à chaque requête.
export const dynamic = "force-dynamic";

export default async function RapportPage() {
  const [overview, qualityTally, courseGames] = await Promise.all([getPlayerProgress(), getMoveQualityTally(), getCourseGamesOverview()]);

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-8">
      <PageHeader
        title="Progrès"
        description="Ce que disent tes parties analysées."
        className="pb-0"
        action={
          <nav aria-label="Accès Progrès" className="flex flex-wrap gap-1">
            <ButtonLink href="/parties" variant="ghost">
              <ListOrdered aria-hidden="true" />
              Mes parties
            </ButtonLink>
            <ButtonLink href="/rapport/brillants" variant="ghost">
              <Sparkles aria-hidden="true" />
              Coups brillants
            </ButtonLink>
            <ButtonLink href="/ouvertures/historique-endurance" variant="ghost">
              <History aria-hidden="true" />
              Endurance
            </ButtonLink>
          </nav>
        }
      />
      <ProgressOverview overview={overview} courseGames={<CourseGamesCard rows={courseGames} />} />
      <QualitySummaryTable tally={qualityTally} />
    </div>
  );
}
