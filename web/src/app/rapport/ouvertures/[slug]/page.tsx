import Link from "next/link";
import { notFound } from "next/navigation";
import { EsportCanvas, EsportHeader } from "@/components/ui/esport-page";
import { CourseGameReportView } from "@/client/features/reports/course-game-report";
import { getCourseGameReport } from "@/server/queries/course-games";

// Même raison qu'`/rapport` : de nouvelles parties s'analysent en continu.
export const dynamic = "force-dynamic";

/** « Rapport › ouverture » : tes parties dans un cours d'ouverture, une par une, confrontées au cours. */
export default async function RapportOpeningPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = await getCourseGameReport(slug);
  if (!report) notFound();

  return (
    <EsportCanvas detail>
      <div className="space-y-6">
        <Link href="/rapport" className="text-sm text-accent hover:underline">
          ← Retour au Rapport
        </Link>
        <EsportHeader
          eyebrow="Rapport › ouverture"
          title={report.openingName}
          aside={
            <Link
              href={`/ouvertures/${slug}/cours`}
              className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:opacity-90"
            >
              Ouvrir le cours
            </Link>
          }
        >
          Chaque partie est rejouée dans le cours commenté (cours écrit pour les {report.side === "white" ? "Blancs" : "Noirs"}) : le
          rapport signale le coup exact où tu l&apos;as quitté, et ce que tu y joues le plus souvent.
        </EsportHeader>
        <CourseGameReportView report={report} />
      </div>
    </EsportCanvas>
  );
}
