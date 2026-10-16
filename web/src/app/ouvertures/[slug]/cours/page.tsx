import { notFound } from "next/navigation";
import { EsportCanvas } from "@/components/ui/esport-page";
import { OpeningCourse } from "@/client/features/openings/opening-course";
import { OPENING_COURSE_IDS } from "@/core/curriculum/opening-course-ids";
import { findOpening } from "@/core/curriculum/openings";

/** Cours commenté coup par coup d'une ouverture (`opening-course-trees.ts`), lu dans le même lecteur que l'Académie. */
export default async function OpeningCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const opening = findOpening(slug);
  if (!opening || !OPENING_COURSE_IDS.has(slug)) notFound();
  return (
    <EsportCanvas detail>
      <OpeningCourse openingId={opening.id} openingName={opening.name} />
    </EsportCanvas>
  );
}
