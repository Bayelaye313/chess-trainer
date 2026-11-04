import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { OpeningCourse } from "@/client/features/openings/opening-course";
import { OPENING_COURSE_IDS } from "@/core/curriculum/opening-course-ids";
import { findOpening } from "@/core/curriculum/openings";
import { listCoursePositionNotes } from "@/server/queries/course-games";

// Les écarts « Dans tes parties » suivent les imports : lus à chaque requête.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Cours d'ouverture" };

/**
 * Cours commenté coup par coup d'une ouverture (`opening-course-trees.ts`), lu dans le même lecteur que l'Académie.
 * `?chapitre=&noeud=` (liens du Rapport › ouverture) : ouvre le lecteur sur cette position.
 */
export default async function OpeningCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ chapitre?: string; noeud?: string }>;
}) {
  const { slug } = await params;
  const { chapitre, noeud } = await searchParams;
  const opening = findOpening(slug);
  if (!opening || !OPENING_COURSE_IDS.has(slug)) notFound();
  const chapterIndex = Number(chapitre);
  const initialFocus = noeud && Number.isInteger(chapterIndex) && chapterIndex >= 0 ? { chapterIndex, nodeId: noeud } : undefined;
  const positionNotes = await listCoursePositionNotes(opening.id);
  return (
    <div className="mx-auto w-full max-w-[1240px]">
      <OpeningCourse openingId={opening.id} openingName={opening.name} initialFocus={initialFocus} positionNotes={positionNotes} />
    </div>
  );
}
