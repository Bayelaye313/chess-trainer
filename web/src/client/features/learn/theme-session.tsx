"use client";

/**
 * Séance linéaire sur un thème — pendant équivalent de `PuzzleSession`
 * (`client/features/reviews/`) pour l'onglet « Apprendre » : charge le
 * puzzle courant du thème, l'affiche via le `PuzzleBoard` partagé
 * (`client/features/board/`, même échiquier, même hover, même jauge, même
 * réfutation active que « Entraîner »), incrémente la progression puis
 * enchaîne sur le suivant. Pas de FSRS, pas de deck : juste un curseur
 * linéaire (`completedCount`, voir `server/queries/curriculum.ts`) — d'où
 * `onComplete` plutôt que `onGraded` (voir le docstring de `PuzzleBoard`).
 *
 * `PuzzleBoard` oriente déjà l'échiquier sur le camp qui a le trait dans
 * `puzzle.fenBefore` (voir `use-puzzle-solver.ts#playerColor`) — jamais un
 * choix fait ici. Ce qui rendait autrefois « Apprendre » injouable pour les
 * exercices d'origine Lichess n'était donc PAS ce composant mais la donnée
 * elle-même : `fenBefore` valait la position AVANT la gaffe adverse, avec le
 * premier coup de la solution étant cette gaffe — l'utilisateur jouait alors
 * le camp qui vient de se tromper. Corrigé à la source
 * (`scripts/convert-lichess-puzzles-csv.ts#toAcademyEntry`) : chaque
 * `fenBefore` servi ici est déjà la position CRITIQUE, où c'est au tour du
 * solveur.
 *
 * Un exercice de mat (« Mat en 2 », un thème `checkmate_patterns`…) n'est
 * JAMAIS raccourci à son seul coup final ici : `puzzle.solution` (passé tel
 * quel à `PuzzleBoard`) porte l'intégralité de la séquence — voir le
 * docstring de `buildAcademyPuzzleFromGame`/`buildAcademyPuzzleFromJsonEntry`
 * (`core/curriculum/academy-parser.ts`) et de `usePuzzleSolver`
 * (`client/features/board/use-puzzle-solver.ts`, phases `solving` ↔
 * `opponent-reply` en boucle jusqu'au dernier pli) : l'utilisateur doit
 * calculer et jouer CHAQUE coup du solveur, la réponse adverse scriptée
 * s'intercalant automatiquement entre deux, jusqu'au mat final.
 *
 * `CoachBubble` (voir son docstring) accompagne la séance sans jamais
 * remplacer la barre de progression : la description du thème sert de bulle
 * « brief » pendant la recherche, puis de bulle « debrief » reliée à la
 * suite trouvée une fois un puzzle validé — capturée AVANT le rechargement
 * du suivant (`lastSolved`, voir `handleSolved`), affichée jusqu'à la
 * prochaine résolution.
 *
 * Depuis le 2026-09-10, l'échiquier + la progression ne sont plus rendus nus
 * ici : `AcademyPuzzleArena` (`academy-puzzle-arena.tsx`) enveloppe
 * `PuzzleBoard` d'un HUD « e-sport » (barre segmentée, une case par puzzle
 * de la vague, fondu enchaîné entre deux puzzles, son de validation) — ce
 * composant-ci reste seul responsable du chargement réseau
 * (`getThemePuzzleSession`/`submitThemePuzzleSolved`) et de la bulle Coach,
 * l'Arena n'étant que la couche de présentation.
 */
import { useEffect, useState } from "react";
import { getThemePuzzleSession, submitThemePuzzleSolved } from "@/server/actions/curriculum";
import type { ThemeSession as ThemeSessionData } from "@/server/queries/curriculum";
import { AcademyPuzzleArena } from "./academy-puzzle-arena";
import { CoachBubble } from "./coach-bubble";

type SessionState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "session"; session: ThemeSessionData };

/** La suite d'un puzzle qui vient d'être validé — matière première de la bulle « debrief », voir `handleSolved`. */
interface LastSolved {
  solutionSan: readonly string[];
  sourceRef: string | null;
}

export function ThemeSession({
  themeId,
  description,
  onExit,
  onReview,
}: {
  themeId: string;
  /** Description du thème (`CurriculumThemeOverview.description`) — déjà connue de `LearnScreen` avant navigation, jamais rechargée ici. `null` seulement si `LearnScreen` n'a pas trouvé le thème (garde défensive, voir son docstring). */
  description: string | null;
  onExit: () => void;
  /** Bascule vers `ThemeReviewSession` (`theme-review-session.tsx`) — proposé une fois le thème maîtrisé, voir plus bas. */
  onReview: () => void;
}) {
  const [state, setState] = useState<SessionState>({ status: "loading" });
  const [lastSolved, setLastSolved] = useState<LastSolved | null>(null);

  // `themeId` ne change jamais pour une instance montée : `LearnScreen`
  // démonte/remonte `ThemeSession` en entier à chaque sélection de thème
  // (bascule catalogue ↔ session, même schéma que `ReviewsScreen`/
  // `PuzzleSession`) — l'effet n'a que le chargement asynchrone à faire.
  useEffect(() => {
    let cancelled = false;
    getThemePuzzleSession(themeId).then((session) => {
      if (!cancelled) setState(session ? { status: "session", session } : { status: "not-found" });
    });
    return () => {
      cancelled = true;
    };
  }, [themeId]);

  async function handleSolved() {
    // Capturé AVANT le rechargement : une fois `submitThemePuzzleSolved` posé, `state.session.puzzle` pointera déjà
    // vers le puzzle SUIVANT — la bulle « debrief » doit citer celui qu'on vient de résoudre, pas le prochain.
    if (state.status === "session" && state.session.puzzle) {
      setLastSolved({ solutionSan: state.session.puzzle.solutionSan, sourceRef: state.session.puzzle.sourceRef });
    }
    await submitThemePuzzleSolved(themeId);
    const next = await getThemePuzzleSession(themeId);
    setState(next ? { status: "session", session: next } : { status: "not-found" });
  }

  const title = state.status === "session" ? state.session.title : "Chargement…";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold">{title}</h1>
        </div>
        <button type="button" onClick={onExit} className="shrink-0 text-sm text-accent hover:underline">
          ← Retour aux thèmes
        </button>
      </div>

      {description &&
        state.status === "session" &&
        state.session.puzzle &&
        (lastSolved ? (
          <CoachBubble variant="debrief" description={description} solutionSan={lastSolved.solutionSan} sourceRef={lastSolved.sourceRef} />
        ) : (
          <CoachBubble variant="brief" description={description} />
        ))}

      {state.status === "loading" && (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-foreground-muted">
          Chargement de l&apos;exercice…
        </p>
      )}

      {state.status === "not-found" && (
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          <p className="text-lg font-semibold">Thème introuvable</p>
          <button
            type="button"
            onClick={onExit}
            className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Retour aux thèmes
          </button>
        </div>
      )}

      {state.status === "session" && state.session.puzzle && (
        <AcademyPuzzleArena
          puzzle={{
            id: state.session.puzzle.id,
            fenBefore: state.session.puzzle.fen,
            solution: state.session.puzzle.solution,
            solutionSan: state.session.puzzle.solutionSan,
          }}
          completedCount={state.session.completedCount}
          totalPuzzles={state.session.totalPuzzles}
          onSolved={handleSolved}
        />
      )}

      {state.status === "session" && !state.session.puzzle && (
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          {state.session.totalPuzzles === 0 ? (
            // Ne devrait plus survenir : `master-puzzles-dataset.ts` garantit
            // une entrée par thème du catalogue (voir son test). Gardé comme
            // filet défensif — jamais un puzzle « Thème maîtrisé » n'a de sens
            // ici, 0 exercice résolu sur 0 n'est pas une victoire.
            <>
              <p className="text-lg font-semibold">Aucun exercice disponible pour l&apos;instant</p>
              <p className="mt-1 text-sm text-foreground-muted">
                Le corpus actuel ne contient encore aucune position qui illustre vraiment ce thème —
                plutôt qu&apos;un exercice hors sujet, ce module attend d&apos;en recevoir un qui convienne.
              </p>
            </>
          ) : state.session.completedCount >= state.session.totalPuzzles ? (
            <div className="animate-fade-up-in">
              <span aria-hidden="true" className="text-4xl">
                🏆
              </span>
              <p className="mt-2 text-lg font-semibold text-best">Thème maîtrisé !</p>
              <p className="mt-1 text-sm text-foreground-muted">
                {state.session.totalPuzzles} exercice{state.session.totalPuzzles > 1 ? "s" : ""} résolu
                {state.session.totalPuzzles > 1 ? "s" : ""} sur ce thème.
              </p>
            </div>
          ) : (
            <>
              <p className="text-lg font-semibold">Suite du cours à venir</p>
              <p className="mt-1 text-sm text-foreground-muted">
                Les {state.session.totalPuzzles - state.session.completedCount} exercice
                {state.session.totalPuzzles - state.session.completedCount > 1 ? "s" : ""} restant
                {state.session.totalPuzzles - state.session.completedCount > 1 ? "s" : ""} de ce thème n&apos;ont
                pas encore été importés.
              </p>
            </>
          )}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onExit}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              Retour aux thèmes
            </button>
            {state.session.totalPuzzles > 0 && state.session.completedCount >= state.session.totalPuzzles && (
              <button
                type="button"
                onClick={onReview}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted"
              >
                🔁 Revoir les puzzles
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
