"use client";

/**
 * Bouton « 🔍 Explorer » du journal « Mes erreurs d'ouverture »
 * (`opening-mistakes-hub.tsx`) — contrairement à `OpeningMistakeExercise`
 * (méthode Listudy stricte, un SEUL coup correct accepté), cet écran ouvre
 * l'échiquier directement sur `deviation.fenBefore` (la position exacte du
 * raté, sans rejouer la partie depuis le début — inutile ici, le but n'est
 * pas de corriger un coup précis mais de comprendre la position) en mode
 * BAC À SABLE Stockfish : n'importe quel coup légal est acceptable et évalué
 * par le moteur, exactement comme le Mode Analyse Pro d'un puzzle
 * (`use-post-solve-analysis.ts`) ou l'exploration libre d'une revue de partie
 * (`use-explore-mode.ts`, réutilisé tel quel — `realNextUci: null` fait que
 * TOUT coup déclenche immédiatement l'exploration, jamais de "coup réel" à
 * matcher ici).
 *
 * Pastille de qualité (`QualityBadge`) + surlignage des cases départ/arrivée
 * sur le DERNIER coup exploré — même mécanique que l'échiquier de revue de
 * partie (`game-review-screen.tsx#squareRenderer`), voir CLAUDE.md « UI
 * Mappings » : réutilisée à l'identique plutôt que réinventée, pour que
 * l'exploration d'une erreur d'ouverture se lise exactement comme celle d'une
 * partie entière.
 */
import { useEngine } from "@/client/engine/engine-context";
import { Chessboard, type SquareRenderer } from "react-chessboard";
import { useExploreMode } from "@/client/features/board/use-explore-mode";
import { EvaluationBar } from "@/client/features/board/evaluation-bar";
import { ExplorePanel } from "@/client/features/board/explore-panel";
import { QualityBadge } from "@/client/features/board/quality-badge";
import { arrowsFromEngineLines, qualitySquareColor } from "@/lib/labels";

export interface MistakeExplorerSource {
  fenBefore: string;
  expectedSan: string;
  actualSan: string;
  playerColor: "w" | "b";
  openingName: string;
}

export function OpeningMistakeExplorer({
  deviation,
  onExit,
  onNext,
}: {
  deviation: MistakeExplorerSource;
  onExit: () => void;
  /** Erreur suivante du journal (voir `flattenMistakes`) — `undefined` : dernière erreur de la liste, pas de bouton « Suivant ». */
  onNext?: () => void;
}) {
  const { engine, status: engineStatus } = useEngine();
  // Jamais de "coup réel" à retrouver ici (contrairement à une revue de
  // partie) : `realNextUci: null` garantit qu'`onPieceDrop` bascule TOUJOURS
  // en exploration dès le premier coup testé, voir le docstring du fichier.
  const explore = useExploreMode({
    engine,
    anchorFen: deviation.fenBefore,
    realNextUci: null,
    onPlayRealMove: () => {},
  });

  // Coup mis en avant sur l'échiquier : le DERNIER coup exploré (neutre tant
  // que son évaluation n'est pas encore revenue du moteur) — voir le
  // docstring du fichier.
  const lastExplorerMove = explore.explorerMoves[explore.explorerMoves.length - 1] ?? null;
  const exploreQuality = explore.evaluation.status === "ready" ? explore.evaluation.evaluated.quality : null;
  const boardHighlightColor = lastExplorerMove && exploreQuality ? qualitySquareColor(exploreQuality) : null;
  const boardSquareStyles: Record<string, { backgroundColor: string }> =
    boardHighlightColor && lastExplorerMove
      ? {
          [lastExplorerMove.from]: { backgroundColor: boardHighlightColor },
          [lastExplorerMove.to]: { backgroundColor: boardHighlightColor },
        }
      : {};
  const badgeSquare = lastExplorerMove?.to ?? null;

  const squareRenderer: SquareRenderer = ({ square, children }) => (
    <div style={{ width: "100%", height: "100%", ...(boardSquareStyles[square] ?? {}) }}>
      {children}
      {exploreQuality && square === badgeSquare && (
        <span className="pointer-events-none absolute right-0.5 top-0.5">
          <QualityBadge quality={exploreQuality} />
        </span>
      )}
    </div>
  );

  // Flèches dégradées (vert/bleu/ambre) des lignes candidates du moteur —
  // même mécanique que l'échiquier de revue de partie, voir le docstring du
  // fichier.
  const arrows = explore.evaluation.status === "ready" ? arrowsFromEngineLines(explore.evaluation.evaluated.bestLines) : [];

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">🔍 Exploration libre — {deviation.openingName}</h2>
          <p className="mt-1 text-xs text-foreground-muted">
            Position juste avant ta déviation — cherche librement avec Stockfish, aucun coup imposé.
          </p>
        </div>
        <button type="button" onClick={onExit} className="shrink-0 text-sm text-accent hover:underline">
          ← Retour au journal
        </button>
      </div>

      <div className="mt-3 rounded-md border border-border bg-surface-muted/40 p-3 text-center text-sm text-foreground">
        Ici, tu avais joué <span className="font-mono font-semibold">{deviation.actualSan}</span> au lieu de{" "}
        <span className="font-mono font-semibold">{deviation.expectedSan}</span>.
      </div>

      {engineStatus !== "ready" && (
        <p className="mt-3 text-center text-xs text-foreground-muted">
          {engineStatus === "loading" ? "Chargement du moteur Stockfish…" : "Moteur indisponible pour l'instant."}
        </p>
      )}

      {explore.isExploring && (
        <div className="mt-4">
          <ExplorePanel
            explorerMoves={explore.explorerMoves}
            evaluation={explore.evaluation}
            onExit={() => explore.exit()}
            exitLabel="↺ Revenir à la position de départ"
          />
        </div>
      )}

      <div className="mt-5 flex flex-col items-center">
        <div className="mx-auto flex w-full max-w-[420px] items-stretch gap-2">
          <EvaluationBar score={explore.isExploring && explore.evaluation.status === "ready" ? { cp: explore.evaluation.evaluated.cpAfter, mate: explore.evaluation.evaluated.mateAfter } : null} />
          <div className="min-w-0 flex-1">
            <Chessboard
              options={{
                id: "opening-mistake-explorer-board",
                position: explore.fen,
                boardOrientation: deviation.playerColor === "w" ? "white" : "black",
                onPieceDrop: explore.onPieceDrop,
                canDragPiece: explore.canDragPiece,
                squareRenderer,
                arrows,
              }}
            />
          </div>
        </div>

        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="mt-4 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-muted"
          >
            Suivant →
          </button>
        )}
      </div>
    </div>
  );
}
