"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TRAINING_GOALS, type TrainingGoal, type TrainingPreferences } from "@/core/training/preferences";
import {
  GOAL_EFFORT_POINTS,
  MAX_EFFORT_POINTS,
  OPTIMAL_EFFORT_THRESHOLD,
  computeDailyEffort,
  type EffortLevel,
} from "@/core/training/daily-plan";
import { applyDailyPlan, resetDailyPlan } from "@/server/actions/training";
import type { DailySessionState } from "@/server/queries/daily-plan";
import { TRAINING_GOAL_LABEL } from "@/lib/labels";

const EFFORT_BAR_COLOR: Record<EffortLevel, string> = {
  light: "bg-inaccuracy",
  optimal: "bg-best",
};

const EFFORT_LEVEL_LABEL: Record<EffortLevel, string> = {
  light: "Trop léger",
  optimal: "Optimal",
};

/** Barre de charge — la largeur ET la couleur suivent la sélection en direct (`transition-all duration-500`). */
function EffortBar({ points, percent, level }: { points: number; percent: number; level: EffortLevel }) {
  return (
    <div className="mt-3">
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="text-foreground-muted">Charge quotidienne</span>
        <span className={`font-medium ${level === "optimal" ? "text-best" : "text-inaccuracy"}`}>
          {points}/{MAX_EFFORT_POINTS} pts · {EFFORT_LEVEL_LABEL[level]}
        </span>
      </div>
      <div
        role="meter"
        aria-label="Charge quotidienne"
        aria-valuemin={0}
        aria-valuemax={MAX_EFFORT_POINTS}
        aria-valuenow={points}
        aria-valuetext={`${points} points sur ${MAX_EFFORT_POINTS}, ${EFFORT_LEVEL_LABEL[level].toLowerCase()}`}
        className="relative mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${EFFORT_BAR_COLOR[level]}`}
          style={{ width: `${percent}%` }}
        />
        {/* Repère du seuil optimal — même échelle que la barre. */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 w-px bg-border"
          style={{ left: `${Math.round((OPTIMAL_EFFORT_THRESHOLD / MAX_EFFORT_POINTS) * 100)}%` }}
        />
      </div>
    </div>
  );
}

export function TrainingPlanSettings({
  preferences,
  sessionState,
}: {
  preferences: TrainingPreferences;
  sessionState: DailySessionState | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [goals, setGoals] = useState<TrainingGoal[]>(preferences.goals);
  const [dailyLimit, setDailyLimit] = useState(preferences.dailyLimit);
  const [error, setError] = useState<string | null>(null);

  const active = sessionState !== null;
  const shownGoals = active ? sessionState.session.goals : goals;
  const effort = computeDailyEffort(shownGoals);

  function toggleGoal(goal: TrainingGoal, checked: boolean) {
    setGoals((current) => {
      if (!checked) return current.length === 1 ? current : current.filter((item) => item !== goal);
      return current.includes(goal) ? current : [...current, goal];
    });
  }

  /**
   * Enregistre objectifs + nombre d'actions, fige la session du jour en base
   * (`settings` → `training.daily-session`), puis rafraîchit la page : l'arène
   * des bots relit la session et embarque ses lignes de départ pour la
   * prochaine partie.
   */
  function handleApplyDailyPlan() {
    setError(null);
    startTransition(async () => {
      try {
        const { preferences: saved } = await applyDailyPlan({ goals, dailyLimit });
        setGoals(saved.goals);
        setDailyLimit(saved.dailyLimit);
        router.refresh();
      } catch {
        setError("Impossible d'appliquer le plan. Réessaie.");
      }
    });
  }

  function handleEditPlan() {
    setError(null);
    startTransition(async () => {
      try {
        await resetDailyPlan();
        router.refresh();
      } catch {
        setError("Impossible de déverrouiller le plan. Réessaie.");
      }
    });
  }

  const completed = new Set(sessionState?.completion.completedGoals ?? []);

  return (
    <form
      className="mt-4 border-t border-border pt-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!active) handleApplyDailyPlan();
      }}
    >
      <fieldset disabled={active || pending}>
        <legend className="flex w-full items-center justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-foreground-muted">Plan du jour</span>
          {active && (
            <span className="rounded-full border border-best/40 bg-best/10 px-2 py-0.5 text-[11px] font-medium text-best">
              Session active
            </span>
          )}
        </legend>

        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TRAINING_GOALS.map((goal) => {
            const checked = shownGoals.includes(goal);
            const done = completed.has(goal);
            return (
              <label
                key={goal}
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors has-[:disabled]:cursor-default ${
                  checked ? "border-accent bg-accent/10 text-foreground" : "border-border text-foreground-muted hover:bg-surface-muted"
                }`}
              >
                <input
                  type="checkbox"
                  name="goals"
                  value={goal}
                  checked={checked}
                  onChange={(event) => toggleGoal(goal, event.target.checked)}
                  className="accent-current"
                />
                <span className="flex-1 font-medium">{TRAINING_GOAL_LABEL[goal]}</span>
                {done ? (
                  <span className="text-best" title="Au moins un exercice de ce type fait depuis l'application du plan.">
                    ✓
                  </span>
                ) : (
                  <span className="font-mono text-[11px] text-foreground-muted">{GOAL_EFFORT_POINTS[goal]}</span>
                )}
              </label>
            );
          })}
        </div>

        <EffortBar points={effort.points} percent={effort.percent} level={effort.level} />

        {!active && (
          <label className="mt-3 flex items-center gap-3 text-xs text-foreground-muted">
            Actions par séance
            <input
              type="range"
              name="dailyLimit"
              min={1}
              max={8}
              value={dailyLimit}
              onChange={(event) => setDailyLimit(Number(event.target.value))}
              className="flex-1 accent-current"
            />
            <span className="w-4 text-right font-medium text-foreground">{dailyLimit}</span>
          </label>
        )}
      </fieldset>

      {active && (
        <div className="mt-3">
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="text-foreground-muted">Réalisé aujourd&apos;hui</span>
            <span className="font-medium text-foreground">
              {sessionState.completion.completedPoints}/{sessionState.session.effortPoints} pts
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-best transition-all duration-500 ease-out"
              style={{ width: `${sessionState.completion.percent}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-3">
        {active ? (
          <button
            type="button"
            onClick={handleEditPlan}
            disabled={pending}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-muted disabled:opacity-60"
          >
            {pending ? "Déverrouillage…" : "Modifier le plan"}
          </button>
        ) : (
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Application…" : "Appliquer"}
          </button>
        )}
        {error && <p className="text-xs text-blunder">{error}</p>}
      </div>
    </form>
  );
}
