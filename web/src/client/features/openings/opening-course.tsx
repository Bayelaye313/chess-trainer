"use client";

/**
 * Page « Cours » d'une ouverture : le cours commenté coup par coup
 * (`core/curriculum/opening-course-trees.ts`) dans le lecteur de l'Académie,
 * `CourseTreeViewer` — mêmes chapitres, flèches et mode « Jouer les coups ».
 */
import Link from "next/link";
import { findOpeningCourseTree } from "@/core/curriculum/opening-course-trees";
import { CourseTreeViewer } from "@/client/features/learn/course-tree-viewer";

export function OpeningCourse({ openingId, openingName }: { openingId: string; openingName: string }) {
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
      </div>
      {tree ? (
        <CourseTreeViewer tree={tree} />
      ) : (
        <p className="text-sm text-foreground-muted">Aucun cours n&apos;est encore disponible pour cette ouverture.</p>
      )}
    </div>
  );
}
