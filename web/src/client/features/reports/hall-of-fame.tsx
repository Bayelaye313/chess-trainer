"use client";

/**
 * « Mes Chefs-d'œuvre » — l'onglet Rapport (`app/rapport/page.tsx`) : les
 * coups classés `!! Brillant`/`! Critique` (`classify.ts`) rejoués par le
 * joueur dans ses parties importées (`listMasterpieces`,
 * `server/queries/games.ts`). Un clic développe un mini échiquier figé sur la
 * position juste après le coup, avec les mêmes codes couleur que la Revue de
 * partie (`qualitySquareColor`) — un seul développé à la fois.
 */
import { useState } from "react";
import Link from "next/link";
import { Chessboard } from "react-chessboard";
import type { MoveQuality } from "@/core/chess/types";
import { QUALITY_BADGE_INK_CLASS, QUALITY_BG_CLASS, QUALITY_SYMBOL, qualitySquareColor } from "@/lib/labels";
import type { MasterpieceEntry } from "@/server/queries/games";

const MASTERPIECE_BLURB: Record<"brilliant" | "critical", string> = {
  brilliant: "a sacrifié la matière pour une attaque gagnante",
  critical: "a trouvé le seul coup qui sauvait la position",
};

function neverDraggable(): boolean {
  return false;
}

function MasterpieceRow({
  entry,
  expanded,
  onToggle,
}: {
  entry: MasterpieceEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  const from = entry.uci.slice(0, 2);
  const to = entry.uci.slice(2, 4);
  const highlight = { backgroundColor: qualitySquareColor(entry.quality as MoveQuality) };

  return (
    <div className="rounded-lg border border-border bg-surface">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left hover:bg-surface-muted/30"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${QUALITY_BG_CLASS[entry.quality]} ${QUALITY_BADGE_INK_CLASS[entry.quality]}`}
          >
            {QUALITY_SYMBOL[entry.quality]}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-foreground">
              {entry.san} — contre {entry.opponentName ?? "adversaire inconnu"}
            </span>
            <span className="block text-xs text-foreground-muted">
              {entry.playedAt.toLocaleDateString("fr-FR")} · coup {entry.ply} · {MASTERPIECE_BLURB[entry.quality]}
            </span>
          </span>
        </span>
        <span className="shrink-0 text-xs text-accent">{expanded ? "▲ Réduire" : "▼ Revoir"}</span>
      </button>

      {expanded && (
        <div className="border-t border-border p-4">
          <div className="mx-auto max-w-[280px]">
            <Chessboard
              options={{
                id: `masterpiece-${entry.gameId}-${entry.ply}`,
                position: entry.fenAfter,
                boardOrientation: entry.playerColor === "w" ? "white" : "black",
                canDragPiece: neverDraggable,
                squareStyles: { [from]: highlight, [to]: highlight },
              }}
            />
          </div>
          <div className="mt-3 text-center">
            <Link href={`/analyse/${entry.gameId}`} className="text-xs text-accent hover:underline">
              Voir la partie complète →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export function HallOfFame({ masterpieces }: { masterpieces: readonly MasterpieceEntry[] }) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">🏆 Mes Chefs-d&apos;œuvre</h2>
        <p className="mt-1 text-sm text-foreground-muted">
          Les coups classés Brillant dans tes parties importées — clique pour revoir le moment exact.
        </p>
      </div>

      {masterpieces.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-foreground-muted">
          Aucun coup Brillant repéré pour l&apos;instant — continue à importer tes parties.
        </p>
      ) : (
        <div className="space-y-2">
          {masterpieces.map((entry) => {
            const key = `${entry.gameId}-${entry.ply}`;
            return (
              <MasterpieceRow
                key={key}
                entry={entry}
                expanded={expandedKey === key}
                onToggle={() => setExpandedKey((current) => (current === key ? null : key))}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
