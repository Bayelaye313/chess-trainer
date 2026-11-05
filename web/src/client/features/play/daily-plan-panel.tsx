import { CalendarCheck } from "lucide-react";
import type { TrainingPreferences } from "@/core/training/preferences";
import type { DailySessionState } from "@/server/queries/daily-plan";
import { TrainingPlanSettings } from "@/client/features/reviews/training-plan-settings";

/**
 * Plan du jour dans l'arène des bots (`/jouer`) : le même formulaire que
 * l'accueil et les Réglages. « Appliquer » fige la session puis rafraîchit la
 * page, qui relit aussitôt les lignes imposées (`listBotStartLines`) : la
 * partie suivante démarre sur le répertoire si « Ouvertures » ou « Pièges »
 * est coché. Ouvert tant qu'aucun plan n'est appliqué, replié ensuite.
 */
export function DailyPlanPanel({
  preferences,
  sessionState,
}: {
  preferences: TrainingPreferences;
  sessionState: DailySessionState | null;
}) {
  return (
    <details open={sessionState === null} className="group rounded-lg border border-border bg-surface">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
        <CalendarCheck aria-hidden="true" className="size-4 text-foreground-muted" />
        <span className="flex-1">Plan du jour</span>
        <span className="text-xs font-normal text-foreground-muted group-open:hidden">
          {sessionState === null ? "Non appliqué" : "Appliqué"}
        </span>
      </summary>
      <div className="border-t border-border px-4 pb-4 pt-3">
        <TrainingPlanSettings preferences={preferences} sessionState={sessionState} />
      </div>
    </details>
  );
}
