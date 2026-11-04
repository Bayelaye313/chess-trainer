import type { Metadata } from "next";
import { BackLink } from "@/components/ui/back-link";
import { PageHeader } from "@/components/ui/page-header";
import { OpeningEnduranceHistory } from "@/client/features/openings/opening-endurance-history-view";
import { listEnduranceSessions } from "@/server/queries/opening-endurance";

// Même raison qu'`/rapport` : chaque Manche 2 terminée ajoute une session,
// un prérendu au build figerait l'historique.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Historique d'endurance" };

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
    <div className="mx-auto w-full max-w-[1100px]">
      <PageHeader
        back={<BackLink href="/ouvertures">Ouvertures</BackLink>}
        title="Historique d'endurance"
        description="Jusqu'où tiens-tu sans aide avant ta première gaffe ? Chaque Manche 2 terminée s'ajoute ici."
      />
      <OpeningEnduranceHistory sessions={sessions} now={now} />
    </div>
  );
}
