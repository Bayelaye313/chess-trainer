import { ProgressOverview } from "@/client/features/games/progress-overview";
import { QualitySummaryTable } from "@/client/features/reports/quality-summary-table";
import { getMoveQualityTally, getPlayerProgress } from "@/server/queries/progress";

// Sans searchParams ni autre API dynamique, Next.js prérendrait cette page une
// fois au build et servirait ensuite des statistiques figées — alors que de
// nouvelles parties s'analysent en continu. Il faut la lire à chaque requête.
export const dynamic = "force-dynamic";

export default async function RapportPage() {
  const [overview, qualityTally] = await Promise.all([getPlayerProgress(), getMoveQualityTally()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Rapport</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Précision par phase de jeu, fourchettes et clouages trouvés contre manqués, performance par ouverture,
          pièces laissées en prise. Tout s&apos;agrège depuis la table des coups analysés.
        </p>
      </div>

      <ProgressOverview overview={overview} />

      <QualitySummaryTable tally={qualityTally} />
    </div>
  );
}
