import type { ReactNode } from "react";
import type { TrainingPreferences } from "@/core/training/preferences";
import type { DailySessionState } from "@/server/queries/daily-plan";
import { EngineCheck } from "@/client/features/engine-check/engine-check";
import { LinkedAccounts } from "@/client/features/home/linked-accounts";
import { TrainingPlanSettings } from "@/client/features/reviews/training-plan-settings";
import { PageHeader } from "@/components/ui/page-header";

function SettingsSection({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-titre`} className="scroll-mt-20 border-t border-border py-6 md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-8">
      <div className="mb-4 md:mb-0">
        <h2 id={`${id}-titre`} className="font-display text-lg font-semibold">
          {title}
        </h2>
        <p className="mt-1 text-sm text-foreground-muted">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

/**
 * Réglages (`/plus`, ancien onglet « Plus ») : comptes liés, moteur, plan du
 * jour, version. Délier = « déconnexion » : l'app est mono-utilisateur locale.
 */
export function SettingsScreen({
  appVersion,
  preferences,
  sessionState,
}: {
  appVersion: string;
  preferences: TrainingPreferences;
  sessionState: DailySessionState | null;
}) {
  return (
    <div className="mx-auto max-w-[960px]">
      <PageHeader title="Réglages" description="Comptes liés, moteur d'analyse et plan du jour." />

      <SettingsSection id="comptes" title="Comptes liés" description="Tes nouvelles parties sont importées et analysées toutes seules.">
        <LinkedAccounts />
      </SettingsSection>

      <SettingsSection id="moteur" title="Moteur" description="Stockfish tourne dans ton navigateur.">
        <EngineCheck />
      </SettingsSection>

      <SettingsSection id="plan" title="Plan du jour" description="Les objectifs qui composent ta séance quotidienne.">
        <TrainingPlanSettings preferences={preferences} sessionState={sessionState} />
      </SettingsSection>

      <SettingsSection id="version" title="Version" description="Application locale, sans compte en ligne.">
        <p className="font-mono text-sm text-foreground-muted">Chess Trainer v{appVersion}</p>
      </SettingsSection>
    </div>
  );
}
