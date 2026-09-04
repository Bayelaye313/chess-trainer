import Link from "next/link";
import { HallOfFame } from "@/client/features/reports/hall-of-fame";
import { listMasterpieces } from "@/server/queries/games";

// Même raison qu'`/rapport` : l'historique des coups Brillant/Critique
// s'allonge en continu à mesure que de nouvelles parties sont analysées.
export const dynamic = "force-dynamic";

/**
 * Historique complet des coups Brillant/Critique — sorti de `/rapport`
 * (audit UX du 2026-09-02, remplacé là-bas par le Tableau Statistique
 * Consolidé, voir `quality-summary-table.tsx`) sur sa propre page, ouverte
 * depuis le lien « Voir l'historique de mes coups brillants ». Réutilise
 * `HallOfFame` tel quel — seule sa place dans l'app a changé.
 */
export default async function BrillantsPage() {
  const masterpieces = await listMasterpieces();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/rapport" className="text-sm text-accent hover:underline">
          ← Retour au Rapport
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Historique des coups brillants</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Tous les coups classés Brillant ou Critique repérés dans tes parties importées.
        </p>
      </div>

      <HallOfFame masterpieces={masterpieces} />
    </div>
  );
}
