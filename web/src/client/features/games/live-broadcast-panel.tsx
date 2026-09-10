"use client";

/**
 * "Live Broadcast" du Coach Grand Maître (§12a) — flux défilant de
 * commentaires coup par coup, LES DEUX camps, jusqu'au coup courant
 * (`buildLiveCommentaryFeed`, `core/analysis/live-commentary.ts`).
 *
 * Distinct de `CoachBubble` (qui garde son rôle de correction ACTIONNABLE
 * pour LE coup affiché, avec son bouton « 🔧 Corriger ce coup ») : ce panneau
 * ne propose rien à corriger, il raconte la partie comme un commentateur qui
 * découvre chaque coup au fil de l'eau.
 */
import { useEffect, useRef } from "react";
import type { LiveCommentaryLine } from "@/core/analysis/live-commentary";

export function LiveBroadcastPanel({ lines }: { lines: readonly LiveCommentaryLine[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Toujours calé sur le dernier commentaire ajouté — un simple flux qui
  // avance avec la partie, jamais au joueur de le faire défiler lui-même.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines.length]);

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h2 className="text-sm font-medium uppercase tracking-wide text-foreground-muted">📡 Live Broadcast</h2>
      <div ref={scrollRef} className="mt-3 max-h-48 space-y-2 overflow-y-auto scroll-smooth text-sm">
        {lines.length === 0 ? (
          <p className="text-xs text-foreground-muted">La partie commence — le commentaire suit chaque coup.</p>
        ) : (
          lines.map((line) => (
            <p key={line.ply} className="text-foreground-muted">
              <span className="mr-1.5 font-mono text-xs text-foreground-muted/70">{line.ply}.</span>
              {line.text}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
