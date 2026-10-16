import { EngineCheck } from "@/client/features/engine-check/engine-check";
import { LinkedAccounts } from "@/client/features/home/linked-accounts";

/**
 * Onglet "Plus" : diagnostic moteur, gestion des comptes liés (délier =
 * "déconnexion" — l'app est mono-utilisateur locale, il n'existe pas de
 * session à proprement déconnecter, voir `server/db/schema/platform-links.ts`)
 * et informations de version.
 */
export function SettingsScreen({ appVersion }: { appVersion: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Plus</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Configuration du moteur, comptes liés, informations de version.
        </p>
      </div>

      <EngineCheck />

      <LinkedAccounts />

      <div className="rounded-lg border border-border bg-surface p-5 text-sm text-foreground-muted">
        Chess Trainer — v{appVersion}
      </div>
    </div>
  );
}
