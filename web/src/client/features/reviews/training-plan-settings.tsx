"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TRAINING_GOALS, type TrainingGoal, type TrainingPreferences } from "@/core/training/preferences";
import { updateTrainingPreferences } from "@/server/actions/training";
import { TRAINING_GOAL_LABEL } from "@/lib/labels";

export function TrainingPlanSettings({ preferences }: { preferences: TrainingPreferences }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [goals, setGoals] = useState<TrainingGoal[]>(preferences.goals);
  const [dailyLimit, setDailyLimit] = useState(preferences.dailyLimit);
  const [error, setError] = useState<string | null>(null);

  function toggleGoal(goal: TrainingGoal) {
    setGoals((current) => {
      if (current.includes(goal)) {
        return current.length === 1 ? current : current.filter((item) => item !== goal);
      }
      return [...current, goal];
    });
  }

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        const saved = await updateTrainingPreferences({ goals, dailyLimit });
        setGoals(saved.goals);
        setDailyLimit(saved.dailyLimit);
        router.refresh();
      } catch {
        setError("Impossible d'enregistrer le plan. Réessaie.");
      }
    });
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">Plan du jour</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {TRAINING_GOALS.map((goal) => {
          const active = goals.includes(goal);
          return (
            <button
              key={goal}
              type="button"
              onClick={() => toggleGoal(goal)}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                active
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border text-foreground-muted hover:bg-surface-muted"
              }`}
            >
              {TRAINING_GOAL_LABEL[goal]}
            </button>
          );
        })}
      </div>
      <label className="mt-3 flex items-center gap-3 text-xs text-foreground-muted">
        Charge quotidienne
        <input
          type="range"
          min={1}
          max={8}
          value={dailyLimit}
          onChange={(event) => setDailyLimit(Number(event.target.value))}
          className="flex-1 accent-current"
        />
        <span className="w-4 text-right font-medium text-foreground">{dailyLimit}</span>
      </label>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Enregistrement…" : "Appliquer"}
        </button>
        {error && <p className="text-xs text-blunder">{error}</p>}
      </div>
    </div>
  );
}
