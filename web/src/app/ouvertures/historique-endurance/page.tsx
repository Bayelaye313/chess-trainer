import Link from "next/link";
import { EsportCanvas } from "@/components/ui/esport-page";
import { OpeningEnduranceHistory } from "@/client/features/openings/opening-endurance-history-view";
import { listEnduranceSessions } from "@/server/queries/opening-endurance";

// Même raison qu'`/rapport` : chaque Manche 2 terminée ajoute une session,
// un prérendu au build figerait l'historique.
export const dynamic = "force-dynamic";

/**
 * Historique d'endurance « Sans Guide », toutes ouvertures confondues —
 * ouvert depuis la bannière de `OpeningsScreen`. Segment statique : Next.js
 * le préfère à `ouvertures/[slug]`, aucun id d'ouverture ne peut le masquer.
 */
export default async function HistoriqueEndurancePage() {
  // Déjà triées plus récentes d'abord par SQLite (voir `listEnduranceSessions`).
  const sessions = await listEnduranceSessions();
  // Un seul `now` par requête : les « il y a 2 jours » de la chronologie
  // restent cohérents entre eux et avec l'hydratation.
  const now = new Date();

  return (
    <EsportCanvas detail>
    <div className="space-y-6">
      <div>
        <Link href="/ouvertures" className="text-sm text-accent hover:underline">
          ← Toutes les ouvertures
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Historique d&apos;endurance positionnelle</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Jusqu&apos;où tiens-tu sans guide avant ta première gaffe ? Chaque Manche 2 terminée s&apos;ajoute ici.
        </p>
      </div>

      <OpeningEnduranceHistory sessions={sessions} now={now} />
    </div>
    </EsportCanvas>
  );
}
