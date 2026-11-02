import type { Metadata } from "next";
import { BackLink } from "@/components/ui/back-link";
import { PageHeader } from "@/components/ui/page-header";
import { HallOfFame } from "@/client/features/reports/hall-of-fame";
import { listMasterpieces } from "@/server/queries/games";

// Même raison qu'`/rapport` : l'historique des coups Brillant/Critique
// s'allonge en continu à mesure que de nouvelles parties sont analysées.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Coups brillants" };

/**
 * Historique complet des coups Brillant/Critique — sorti de `/rapport`
 * (audit UX du 2026-09-02, remplacé là-bas par le Tableau Statistique
 * Consolidé, voir `quality-summary-table.tsx`) sur sa propre page, ouverte
 * depuis le lien « Voir l'historique de mes coups brillants ». Réutilise
 * `HallOfFame` tel quel — seule sa place dans l'app a changé.
 */
export default async function BrillantsPage() {
  // Filtre STRICT sur "brillant" — cette page n'affiche que les
  // chefs-d'œuvre annoncés par son propre lien d'entrée (« Voir l'historique
  // de mes coups brillants → »), jamais les coups Critiques (voir le
  // docstring de `listMasterpieces`).
  const masterpieces = await listMasterpieces(30, ["brilliant"]);

  return (
    <div className="mx-auto w-full max-w-[960px]">
      <PageHeader back={<BackLink href="/rapport">Progrès</BackLink>} title="Coups brillants" description="Les 30 derniers coups classés Brillant dans tes parties." />
      <HallOfFame masterpieces={masterpieces} />
    </div>
  );
}
