"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpenCheck } from "lucide-react";
import { courseHref, readLastCourse, type LastCourse } from "@/client/features/openings/course-position";
import { displayOpeningName } from "@/client/features/openings/opening-display";

/** « Reprendre le cours » : dernier cours d'ouverture lu, à sa dernière position (1 clic). */
export function ResumeCourse() {
  const [last, setLast] = useState<LastCourse | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture d'une position locale après montage
  useEffect(() => setLast(readLastCourse()), []);
  if (!last) return null;
  return (
    <Link
      href={courseHref(last.openingId, last)}
      className="flex min-h-12 items-center gap-3 rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-surface-muted"
    >
      <BookOpenCheck aria-hidden="true" className="size-5 shrink-0 text-accent" />
      <span className="min-w-0 flex-1 truncate">
        Reprendre le cours : <span className="font-medium">{displayOpeningName(last.openingName)}</span>
        <span className="text-foreground-muted"> · chapitre {last.chapterIndex + 1}</span>
      </span>
    </Link>
  );
}
