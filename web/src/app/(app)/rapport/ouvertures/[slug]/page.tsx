import type { Metadata } from "next";
import { requireUser } from "@/server/auth/session";
import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { BackLink } from "@/components/ui/back-link";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { CourseGameReportView } from "@/client/features/reports/course-game-report";
import { displayOpeningName } from "@/client/features/openings/opening-display";
import { getCourseGameReport } from "@/server/queries/course-games";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mes parties dans le cours" };

/** « Rapport › ouverture » : tes parties dans un cours d'ouverture, une par une, confrontées au cours. */
export default async function RapportOpeningPage({ params }: { params: Promise<{ slug: string }> }) {
  const { id: userId } = await requireUser();
  const { slug } = await params;
  const report = await getCourseGameReport(userId, slug);
  if (!report) notFound();

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <PageHeader
        back={<BackLink href="/rapport">Progrès</BackLink>}
        title={displayOpeningName(report.openingName)}
        description={`Tes parties rejouées dans le cours (écrit pour les ${report.side === "white" ? "Blancs" : "Noirs"}) : où tu le quittes, et ce que tu y joues.`}
        action={
          <ButtonLink href={`/ouvertures/${slug}/cours`}>
            <BookOpen aria-hidden="true" />
            Ouvrir le cours
          </ButtonLink>
        }
      />
      <CourseGameReportView report={report} />
    </div>
  );
}
