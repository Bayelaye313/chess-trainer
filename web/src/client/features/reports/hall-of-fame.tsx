"use client";

/**
 * « Mes Chefs-d'œuvre » — l'onglet Rapport (`app/rapport/page.tsx`) : les
 * coups classés `!! Brillant`/`! Critique` (`classify.ts`) rejoués par le
 * joueur dans ses parties importées (`listMasterpieces`,
 * `server/queries/games.ts`). Un clic développe un mini échiquier figé sur la
 * position juste après le coup, avec le même marquage que la Revue de
 * partie (`lastMoveSquareStyles`) — un seul développé à la fois.
 */
import { ChevronDown, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { displayOpponentName } from "@/client/features/play/bot-display";
import { useState } from "react";
import Link from "next/link";
import { Chessboard } from "react-chessboard";
import { ESPORT_BOARD_OPTIONS, lastMoveSquareStyles, qualityRingColor } from "@/client/features/board/board-theme";
import type { MoveQuality } from "@/core/chess/types";
import { QUALITY_BADGE_INK_CLASS, QUALITY_BG_CLASS, QUALITY_SYMBOL } from "@/lib/labels";
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
  const squareStyles = lastMoveSquareStyles(from, to, qualityRingColor(entry.quality as MoveQuality));

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex min-h-14 w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left hover:bg-surface-muted"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${QUALITY_BG_CLASS[entry.quality]} ${QUALITY_BADGE_INK_CLASS[entry.quality]}`}
          >
            {QUALITY_SYMBOL[entry.quality]}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-foreground">
              <span className="font-mono">{entry.san}</span> contre {displayOpponentName(entry.opponentName)}
            </span>
            <span className="block text-xs text-foreground-muted">
              {entry.playedAt.toLocaleDateString("fr-FR")} · coup {entry.ply} · {MASTERPIECE_BLURB[entry.quality]}
            </span>
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm text-foreground-muted">{expanded ? "Réduire" : "Revoir"}<ChevronDown aria-hidden="true" className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} /></span>
      </button>

      {expanded && (
        <div className="border-t border-border p-4">
          <div className="mx-auto max-w-[280px]">
            <Chessboard
              options={{ ...ESPORT_BOARD_OPTIONS,
                id: `masterpiece-${entry.gameId}-${entry.ply}`,
                position: entry.fenAfter,
                boardOrientation: entry.playerColor === "w" ? "white" : "black",
                canDragPiece: neverDraggable,
                squareStyles,
              }}
            />
          </div>
          <div className="mt-3 text-center">
            <Link href={`/analyse/${entry.gameId}`} className="inline-flex min-h-11 items-center text-sm text-foreground underline underline-offset-4">
              Voir la partie complète
            </Link>
          </div>
        </div>
      )}
    </li>
  );
}

export function HallOfFame({ masterpieces }: { masterpieces: readonly MasterpieceEntry[] }) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  return (
    <div className="space-y-4">

      {masterpieces.length === 0 ? (
        <EmptyState icon={Sparkles} title="Aucun coup Brillant repéré pour l'instant">
          Ils apparaîtront ici à mesure que tes parties sont analysées.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
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
        </ul>
      )}
    </div>
  );
}
