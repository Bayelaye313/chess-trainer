"use client";

/**
 * Bloc « pourquoi ce coup ? » sous l'échiquier (approche Jeremy Silman) —
 * lit `core/curriculum/opening-commentary.ts`, avec repli générique hors
 * ligne principale (voir son docstring). `ply <= 0` (position de départ,
 * rien encore joué) n'affiche rien.
 */
import { GENERIC_BOOK_COMMENT, getMoveCommentary } from "@/core/curriculum/opening-commentary";

export function MoveCommentary({ openingId, ply }: { openingId: string; ply: number }) {
  if (ply <= 0) return null;
  const commentary = getMoveCommentary(openingId, ply) ?? GENERIC_BOOK_COMMENT;
  return (
    <div className="mt-4 rounded-md border border-border bg-surface-muted/40 p-3 text-sm text-foreground-muted">
      {commentary.comment}
    </div>
  );
}
