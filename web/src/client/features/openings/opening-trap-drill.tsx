"use client";

/**
 * Écran de l'onglet « ⚔️ Pièges » (`app/pieges/[slug]/page.tsx`) — réutilise
 * à 100% le hook réactif `useOpeningDrill` (voir son docstring pour la
 * mécanique de jugement des coups) et l'habillage épuré façon Listudy de
 * `OpeningMistakeExercise`, dont ce composant était historiquement le clone
 * direct — un piège (`core/curriculum/traps.ts`) est structurellement une
 * correction ciblée (position de mise en place rejouée en autoplay, puis UN
 * SEUL coup exact accepté, la réfutation).
 *
 * PROTOCOLE LISTUDY EN 2 MANCHES (audit UX du 2026-09-02, `DrillSelection.kind
 * === "trap"` — voir son docstring dans `use-opening-drill.ts`) : Manche 1
 * guidée (flèche d'indice + bouton indice autorisés, `drill.hintsAllowed`) ;
 * en fin de Manche 1, le hook fige la position (`status === "round-gate"`)
 * plutôt que d'enchaîner automatiquement comme pour les Ouvertures — cet
 * écran affiche alors le bouton **« 🔒 Retenter sans guide »**
 * (`drill.beginNextRound()`) qui lance la Manche 2, indices désactivés. Le
 * piège n'est marqué maîtrisé (`markTrapSolved`, pastilles ✅ du NIVEAU 3) que
 * si cette Manche 2 est parcourue sans AUCUNE faute — sinon elle se relance,
 * en boucle, via la même porte manuelle.
 *
 * OPTION « PION POISON » (incarner la victime) : bascule qui, une fois
 * activée, rejoue `trap.trapMove` PUIS `trap.punishmentLine` entièrement en
 * autoplay (`kind: "trap-poison"`, aucune phase interactive) — l'IA « punit »
 * la victime à l'écran au lieu d'attendre la réfutation du joueur. Manche
 * unique, jamais suivie par `markTrapSolved`. Désactivée si `trap` n'a pas
 * encore de `punishmentLine` (pièges importés en base, voir son docstring).
 *
 * FLUX ENCHAÎNÉ (NIVEAU 3 de `PiegesScreen`) : `seriesTraps` est la série
 * complète (même `family` + `gambit`, triée par difficulté, voir
 * `app/pieges/[slug]/page.tsx`) — l'état `activeTrap` est interne, initialisé
 * depuis la prop `trap` mais MIS À JOUR EN PLACE par `goToNextInSeries` au lieu
 * de renvoyer à l'accueil : aucune navigation, aucun aller-retour serveur, le
 * hook `useOpeningDrill` est simplement redémarré (`start`) sur le puzzle
 * suivant de la même série.
 */
import { useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import type { OpeningTrap } from "@/core/curriculum/traps";
import { useErrorShake } from "./error-feedback";
import { familyIcon } from "./trap-family-icon";
import { markTrapSolved } from "./trap-progress";
import { buildPoisonPawnRound, buildTrapRound } from "./trap-round";
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

  // Bascule « Incarner la victime » — voir le docstring du fichier. Remise à
  // `false` en changeant de puzzle (`goToNextInSeries`) : chaque nouveau piège
  // démarre en mode normal, jamais en Pion Poison par surprise.
  const [poisonMode, setPoisonMode] = useState(false);
  const canPoisonPawn = activeTrap.punishmentLine !== undefined;

  const opening = syntheticOpening(activeTrap);
  // `plies` n'est utilisé par `useOpeningDrill` que pour `kind: "main-line"`, jamais démarré ici.
  const drill = useOpeningDrill({ opening, plies: [] });
  const shaking = useErrorShake(drill.errorPulse);

  // Bouton « Show hints for this move! » — même invariant que `OpeningMistakeExercise`/`OpeningDrill`.
  const [hintRevealed, setHintRevealed] = useState(false);

  /** Démarre `trap` dans le mode demandé — normal (`kind: "trap"`, protocole 2 manches) ou Pion Poison (`kind: "trap-poison"`, autoplay pur). Repli silencieux sur le mode normal si `poison` est demandé sans `punishmentLine` (le bouton reste de toute façon désactivé dans ce cas, voir `canPoisonPawn`). */
  function startDrill(nextTrap: OpeningTrap, poison: boolean) {
    if (poison) {
      const poisonRound = buildPoisonPawnRound(nextTrap);
      if (poisonRound) {
        drill.start({ kind: "trap-poison", startFen: poisonRound.startFen, leadInUci: poisonRound.leadInUci });
        return;
      }
    }
    const { round, leadInUci } = buildTrapRound(nextTrap);
    drill.start({ kind: "trap", round, leadInUci, actualSan: nextTrap.trapMove });
  }

  // Redémarre si `activeTrap.id`/`poisonMode` changent (puzzle suivant de la série, navigation directe, ou bascule
  // Pion Poison) — sinon une seule fois au montage.
  const startedKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const key = `${activeTrap.id}:${poisonMode}`;
    if (startedKeyRef.current === key) return;
    startedKeyRef.current = key;
    startDrill(activeTrap, poisonMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrap.id, poisonMode]);

  // Coche la pastille NIVEAU 3 (« maîtrisé ») dès que la Manche 2, à l'aveugle, est parcourue sans faute — voir
  // `use-opening-drill.ts` (`nextLearningRoundOutcome`) : `status === "finished"` sur `kind: "trap"` ne peut, par
  // construction du protocole, signifier autre chose (toute manche imparfaite repasse par `"round-gate"`, jamais
  // `"finished"`). JAMAIS pour `kind: "trap-poison"` — manche unique, non suivie (voir le docstring du fichier).
  useEffect(() => {
    if (drill.status === "finished" && drill.selection?.kind === "trap") markTrapSolved(activeTrap.id);
  }, [drill.status, drill.selection, activeTrap.id]);

  function retry() {
    setHintRevealed(false);
    startDrill(activeTrap, poisonMode);
  }

  function goToNextInSeries() {
    if (!nextInSeries) return;
    setHintRevealed(false);
    setPoisonMode(false);
    setActiveTrap(nextInSeries);
  }

  // Repère "le piège tente X ici" — uniquement tant que la réfutation n'a pas encore été jouée (`plyIndex === 0`),
  // jamais un message d'erreur. `null` en Pion Poison (`status` n'est jamais "playing" dans ce mode).
  const trapAlert = drill.status === "playing" && drill.plyIndex === 0 ? activeTrap.trapMove : null;
  const isPoisonRun = drill.selection?.kind === "trap-poison";

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
            {!isPoisonRun && drill.selection?.kind === "trap" && (
              <span> Manche {drill.learningRound} / 2{drill.learningRound === 1 ? " — guidée" : " — sans guide 🔒"}.</span>
            )}
          </p>
        </div>
        <button type="button" onClick={onExit} className="shrink-0 text-sm text-accent hover:underline">
          ← Retour aux pièges
        </button>
      </div>

      <div className="mt-3 flex justify-center">
        <button
          type="button"
          disabled={!canPoisonPawn}
          onClick={() => setPoisonMode((current) => !current)}
          title={canPoisonPawn ? undefined : "Pas encore disponible pour ce piège"}
          className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
            poisonMode
              ? "border-blunder/40 bg-blunder/10 text-blunder"
              : "border-border text-foreground-muted hover:bg-surface-muted"
          } ${canPoisonPawn ? "" : "cursor-not-allowed opacity-50"}`}
        >
          ☠️ Incarner la victime (Tomber dans le piège)
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
            <p className="text-foreground-muted">🔁 {isPoisonRun ? "L'IA amène le piège…" : "Mise en place du piège…"}</p>
          ) : drill.status === "finished" ? (
            <p className="font-medium text-foreground">
              {isPoisonRun ? "😵 Tu es tombé dans le piège !" : "🔒 Piège maîtrisé !"}
            </p>
          ) : null}
        </div>

        {drill.status === "round-gate" && (
          <div className="mt-3 w-full max-w-[420px] rounded-md border border-accent/30 bg-accent/5 p-4 text-center">
            <p className="text-sm font-medium text-foreground">
              {drill.learningRound === 1
                ? "✅ Manche 1 réussie ! Manche 2 : retrouve la réfutation sans indice."
                : "Presque — la Manche 2 doit être parcourue sans AUCUNE faute pour maîtriser ce piège."}
            </p>
            <button
              type="button"
              onClick={drill.beginNextRound}
              className="mt-3 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              🔒 Retenter sans guide
            </button>
          </div>
        )}

        {trapAlert && (
          <div className="mt-3 w-full max-w-[420px] rounded-md border border-border bg-surface-muted/40 p-3 text-center text-sm text-foreground">
            Le piège classique tente <span className="font-mono font-semibold">{trapAlert}</span> ici.{" "}
            {activeTrap.trapExplanation}
          </div>
        )}

        {!hintRevealed && drill.status === "playing" && drill.hintsAllowed && (
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
        {hintRevealed && drill.status === "playing" && drill.hintsAllowed && (
          <p className="mt-3 text-center text-xs text-foreground-muted">💡 {activeTrap.hint}</p>
        )}

        {drill.status === "finished" && (
          <>
            <p className="mt-3 max-w-[420px] text-center text-sm text-foreground-muted">
              {isPoisonRun ? activeTrap.trapExplanation : activeTrap.outcome}
            </p>
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
