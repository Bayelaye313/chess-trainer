"use client";

import { scopedGet, scopedSet } from "@/client/storage/user-storage";
import type { CourseTreeFocus } from "@/client/features/learn/course-tree-viewer";

/**
 * Dernière position lue dans chaque cours d'ouverture (`localStorage`), et
 * dernier cours ouvert (raccourci « Reprendre le cours » d'Aujourd'hui).
 */
const POSITION_KEY = (openingId: string) => `chess-trainer:course-position:${openingId}`;
export const LAST_COURSE_KEY = "chess-trainer:last-course";

export interface LastCourse extends CourseTreeFocus {
  openingId: string;
  openingName: string;
}

export function readCoursePosition(openingId: string): CourseTreeFocus | null {
  try {
    const raw = scopedGet("local", POSITION_KEY(openingId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CourseTreeFocus;
    return Number.isInteger(parsed.chapterIndex) && typeof parsed.nodeId === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function saveCoursePosition(openingId: string, openingName: string, focus: CourseTreeFocus): void {
  try {
    scopedSet("local", POSITION_KEY(openingId), JSON.stringify(focus));
    scopedSet("local", LAST_COURSE_KEY, JSON.stringify({ openingId, openingName, ...focus } satisfies LastCourse));
  } catch {
    // Stockage indisponible : le cours repartira simplement du début.
  }
}

export function readLastCourse(): LastCourse | null {
  try {
    const raw = scopedGet("local", LAST_COURSE_KEY);
    return raw ? (JSON.parse(raw) as LastCourse) : null;
  } catch {
    return null;
  }
}

/** Lien du lecteur positionné : `?chapitre=&noeud=` (route existante). */
export function courseHref(openingId: string, focus: CourseTreeFocus | null): string {
  return focus ? `/ouvertures/${openingId}/cours?chapitre=${focus.chapterIndex}&noeud=${encodeURIComponent(focus.nodeId)}` : `/ouvertures/${openingId}/cours`;
}
