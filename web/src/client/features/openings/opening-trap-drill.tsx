"use client";

/**
 * Écran de l'onglet « ⚔️ Pièges » (`app/pieges/[slug]/page.tsx`) — réutilise
 * à 100% le hook réactif `useOpeningDrill` (voir son docstring pour la
 * mécanique de jugement des coups) et l'habillage épuré façon Listudy de
 * `OpeningMistakeExercise`, dont ce composant est le clone direct : un piège
 * (`core/curriculum/traps.ts`) est structurellement une correction ciblée
 * (`DrillSelection.kind === "mistake"`) — position de mise en place rejouée
 * en autoplay, puis UN SEUL coup exact accepté (la réfutation), tout autre
 * coup — y compris `trap.trapMove`, le coup naturel mais tentant — refusé
 * (pièce qui revient, tremblement + bip, jamais de message texte).
 *
 * FLUX ENCHAÎNÉ (NIVEAU 3 de `PiegesScreen`) : `seriesTraps` est la série
 * complète (même `family` + `gambit`, triée par difficulté, voir
 * `app/pieges/[slug]/page.tsx`) — l'état `activeTrap` est interne, initialisé
 * depuis la prop `trap` mais MIS À JOUR EN PLACE par `goToNextInSeries` au lieu
 * de renvoyer à l'accueil : aucune navigation, aucun aller-retour serveur, le
 * hook `useOpeningDrill` est simplement redémarré (`start`) sur le puzzle
 * suivant de la même série (voir l'effet ci-dessous, qui réagit à
 * `activeTrap.id`). Un puzzle résolu marque `trap-progress.ts` (pastilles ✅
 * du NIVEAU 3) — volontairement PAS `markOpeningMistakeReviewed`/
 * `opening_mistake_review` : cette table couvre les vraies erreurs de parties
 * importées avec planification SRS, pas ce catalogue curaté rejoué librement
 * (voir le docstring de `trap-progress.ts`).
 *
 * Différences avec `OpeningMistakeExercise` : la mise en place vient d'un
 * piège curaté (SAN statique, voir `trap-round.ts`) plutôt que de la vraie
 * partie importée du joueur ; le texte affiché (alerte, indice, conclusion,
 * puis l'explication conceptuelle approfondie une fois la réfutation
 * trouvée) vient directement de `trap.trapExplanation`/`hint`/`outcome`/
 * `comments`, jamais de `core/curriculum/opening-commentary.ts` (qui ne
 * couvre que les chapitres du catalogue `openings.ts`, pas les pièges).
 */
import { useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import type { OpeningTrap } from "@/core/curriculum/traps";
import { useErrorShake } from "./error-feedback";
import { familyIcon } from "./trap-family-icon";
import { markTrapSolved } from "./trap-progress";
import { buildTrapRound } from "./trap-round";
import { useOpeningDrill } from "./use-opening-drill";

/** Repli minimal pour `useOpeningDrill` (n'exploite `opening` que pour `side`/`name`/`id`, jamais `moves` — voir `syntheticOpening` dans `opening-mistake-exercise.tsx`, même schéma). */
function syntheticOpening(trap: OpeningTrap) {
  return {
    id: trap.id,
    name: trap.name,
    eco: trap.eco,
    side: trap.victimSide,
    description: trap.summary,
    moves: [],
  };
}

export function OpeningTrapDrill({
  trap,
  seriesTraps,
  onExit,
}: {
  trap: OpeningTrap;
  /** Série complète (même `family` + `gambit`, triée par difficulté) contenant `trap` — sert au flux enchaîné, voir le docstring du fichier. */
  seriesTraps: readonly OpeningTrap[];
  onExit: () => void;
}) {
  // État interne : le puzzle affiché « maintenant », initialisé depuis `trap` mais avancé sans jamais quitter cet
  // écran via `goToNextInSeries`. Resynchronisé si `trap` change (navigation directe vers un AUTRE slug depuis le
  // NIVEAU 3, pas le flux enchaîné — voir l'effet plus bas).
  const [activeTrap, setActiveTrap] = useState(trap);
  useEffect(() => {
    // `setState` déféré au prochain tick (jamais synchrone dans le corps de l'effet, react-hooks/set-state-in-effect)
    // — même convention que `use-opening-drill.ts`/`error-feedback.ts`.
    const timer = setTimeout(() => setActiveTrap(trap), 0);
    return () => clearTimeout(timer);
  }, [trap]);

  const seriesIndex = seriesTraps.findIndex((candidate) => candidate.id === activeTrap.id);
  const nextInSeries = seriesIndex >= 0 ? (seriesTraps[seriesIndex + 1] ?? null) : null;

  const opening = syntheticOpening(activeTrap);
  // `plies` n'est utilisé par `useOpeningDrill` que pour `kind: "main-line"`, jamais démarré ici.
  const drill = useOpeningDrill({ opening, plies: [] });
  const shaking = useErrorShake(drill.errorPulse);

  // Bouton « Show hints for this move! » — même invariant que `OpeningMistakeExercise`/`OpeningDrill`.
  const [hintRevealed, setHintRevealed] = useState(false);

  const startedRef = useRef<string | null>(null);
  useEffect(() => {
    // Redémarre si `activeTrap.id` change (puzzle suivant de la série, ou navigation directe d'un piège à l'autre)
    // — sinon une seule fois au montage.
    if (startedRef.current === activeTrap.id) return;
    startedRef.current = activeTrap.id;
    const { round, leadInUci } = buildTrapRound(activeTrap);
    drill.start({ kind: "mistake", round, leadInUci, actualSan: activeTrap.trapMove });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrap.id]);

  // Coche la pastille NIVEAU 3 dès la réfutation trouvée (voir `trap-progress.ts`) — idempotent, aucune écriture
  // répétée tant que `drill.status` reste "finished" sur le même puzzle.
  useEffect(() => {
    if (drill.status === "finished") markTrapSolved(activeTrap.id);
  }, [drill.status, activeTrap.id]);

  function retry() {
    const { round, leadInUci } = buildTrapRound(activeTrap);
    setHintRevealed(false);
    drill.start({ kind: "mistake", round, leadInUci, actualSan: activeTrap.trapMove });
  }

  function goToNextInSeries() {
    if (!nextInSeries) return;
    setHintRevealed(false);
    setActiveTrap(nextInSeries);
  }

  // Repère "le piège tente X ici" — uniquement tant que la réfutation n'a pas encore été jouée (`plyIndex === 0`), jamais un message d'erreur.
  const trapAlert = drill.status === "playing" && drill.plyIndex === 0 ? activeTrap.trapMove : null;

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {familyIcon(activeTrap.family)} {activeTrap.family} <span className="font-normal text-foreground-muted">· {activeTrap.gambit}</span>
            {seriesIndex >= 0 && (
              <span className="font-normal text-foreground-muted"> — Puzzle {seriesIndex + 1} / {seriesTraps.length}</span>
            )}
          </h2>
          <p className="mt-1 text-xs text-foreground-muted">
            {activeTrap.name} — tu joues {activeTrap.victimSide === "white" ? "les Blancs" : "les Noirs"}.
          </p>
        </div>
        <button type="button" onClick={onExit} className="shrink-0 text-sm text-accent hover:underline">
          ← Retour aux pièges
        </button>
      </div>

      <div className="mt-5 flex flex-col items-center">
        <div className={`w-full max-w-[420px] ${shaking ? "animate-shake-error" : ""}`}>
          <Chessboard
            options={{
              id: "opening-trap-board",
              position: drill.fen,
              boardOrientation: activeTrap.victimSide === "white" ? "white" : "black",
              onPieceDrop: drill.onPieceDrop,
              canDragPiece: drill.canDragPiece,
              arrows: drill.hintArrow
                ? [{ startSquare: drill.hintArrow.from, endSquare: drill.hintArrow.to, color: "var(--quality-best)" }]
                : [],
            }}
          />
        </div>

        <div className="mt-3 min-h-6 w-full max-w-[420px] text-center text-sm">
          {drill.status === "autoplaying" ? (
            <p className="text-foreground-muted">🔁 Mise en place du piège…</p>
          ) : drill.status === "finished" ? (
            <p className="font-medium text-foreground">✅ Piège déjoué !</p>
          ) : null}
        </div>

        {trapAlert && (
          <div className="mt-3 w-full max-w-[420px] rounded-md border border-border bg-surface-muted/40 p-3 text-center text-sm text-foreground">
            Le piège classique tente <span className="font-mono font-semibold">{trapAlert}</span> ici.{" "}
            {activeTrap.trapExplanation}
          </div>
        )}

        {!hintRevealed && drill.status === "playing" && (
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => setHintRevealed(true)}
              className="rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent/20"
            >
              💡 Show hints for this move!
            </button>
          </div>
        )}
        {hintRevealed && drill.status === "playing" && (
          <p className="mt-3 text-center text-xs text-foreground-muted">💡 {activeTrap.hint}</p>
        )}

        {drill.status === "finished" && (
          <>
            <p className="mt-3 max-w-[420px] text-center text-sm text-foreground-muted">{activeTrap.outcome}</p>
            <p className="mt-3 max-w-[420px] rounded-md border border-border bg-surface-muted/30 p-3 text-center text-xs text-foreground-muted">
              💬 {activeTrap.comments}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={retry}
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-surface-muted"
              >
                Rejouer
              </button>
              {nextInSeries ? (
                <button
                  type="button"
                  onClick={goToNextInSeries}
                  className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
                >
                  Suivant →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onExit}
                  className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
                >
                  🏆 Série terminée — Retour aux pièges
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
