"use client";

/**
 * Page « Cours » d'une ouverture : le cours commenté coup par coup
 * (`core/curriculum/opening-course-trees.ts`) dans le lecteur de l'Académie,
 * `CourseTreeViewer` — mêmes chapitres, flèches et mode « Jouer les coups ».
 */
import Link from "next/link";
import type { CoursePositionNote } from "@/core/curriculum/course-game-match";
import { findOpeningCourseTree } from "@/core/curriculum/opening-course-trees";
import { CourseTreeViewer, type CourseTreeFocus } from "@/client/features/learn/course-tree-viewer";

export function OpeningCourse({
  openingId,
  openingName,
  initialFocus,
  positionNotes,
}: {
  openingId: string;
  openingName: string;
  initialFocus?: CourseTreeFocus;
  positionNotes?: readonly CoursePositionNote[];
}) {
  const tree = findOpeningCourseTree(openingId);
  return (
    <div className="space-y-6">
      <div>
        <Link href={`/ouvertures/${openingId}`} className="text-sm text-foreground-muted hover:text-foreground">
          ← {openingName}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Cours : {openingName}</h1>
        <p className="mt-2 max-w-prose text-sm text-foreground-muted">
          Fiche d&apos;identité, arbre théorique commenté coup par coup, déviations à punir et plans du milieu de jeu.
        </p>
        <Link href={`/rapport/ouvertures/${openingId}`} className="mt-2 inline-block text-sm text-accent hover:underline">
          Mes parties dans cette ouverture →
        </Link>
      </div>
      {tree ? (
        <CourseTreeViewer tree={tree} initialFocus={initialFocus} positionNotes={positionNotes} />
      ) : (
        <p className="text-sm text-foreground-muted">Aucun cours n&apos;est encore disponible pour cette ouverture.</p>
      )}
    </div>
  );
}
