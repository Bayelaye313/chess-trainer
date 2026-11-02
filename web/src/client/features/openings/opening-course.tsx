"use client";

/**
 * Page « Cours » d'une ouverture : le cours commenté coup par coup
 * (`core/curriculum/opening-course-trees.ts`) dans le lecteur de l'Académie.
 * La position lue est mémorisée ; sans `?chapitre=&noeud=`, le lecteur
 * reprend là où tu t'étais arrêté.
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { CoursePositionNote } from "@/core/curriculum/course-game-match";
import { findOpeningCourseTree } from "@/core/curriculum/opening-course-trees";
import { CourseTreeViewer, type CourseTreeFocus } from "@/client/features/learn/course-tree-viewer";
import { BackLink } from "@/components/ui/back-link";
import { EmptyState } from "@/components/ui/empty-state";
import { readCoursePosition, saveCoursePosition } from "./course-position";
import { displayOpeningName } from "./opening-display";

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
  const name = displayOpeningName(openingName);
  const [focus, setFocus] = useState<CourseTreeFocus | undefined>(initialFocus);
  const [restoredKey, setRestoredKey] = useState("url");

  // Reprise : lue après montage (localStorage absent au rendu serveur), puis
  // le lecteur est remonté une fois sur la position mémorisée.
  useEffect(() => {
    if (initialFocus) return;
    const saved = readCoursePosition(openingId);
    /* eslint-disable react-hooks/set-state-in-effect -- restauration unique d'une position locale */
    if (saved) {
      setFocus(saved);
      setRestoredKey("reprise");
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [initialFocus, openingId]);

  const remember = useCallback((position: CourseTreeFocus) => saveCoursePosition(openingId, openingName, position), [openingId, openingName]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <div>
          <BackLink href={`/ouvertures/${openingId}`}>{name}</BackLink>
          <h1 className="font-display text-[26px] leading-tight font-semibold sm:text-[32px]">Cours : {name}</h1>
        </div>
        <Link href={`/rapport/ouvertures/${openingId}`} className="inline-flex min-h-11 items-center text-sm text-foreground-muted underline-offset-4 hover:text-foreground hover:underline">
          Mes parties dans cette ouverture
        </Link>
      </div>
      {tree ? (
        <CourseTreeViewer key={restoredKey} tree={tree} initialFocus={focus} positionNotes={positionNotes} onPositionChange={remember} />
      ) : (
        <EmptyState title="Aucun cours n'est encore disponible pour cette ouverture." />
      )}
    </div>
  );
}
