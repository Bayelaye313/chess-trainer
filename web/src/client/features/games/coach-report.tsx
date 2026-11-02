/**
 * Panneau « Rapport du Coach » de fin de Revue de partie — le diagnostic des
 * lacunes (motifs tactiques et mats manqués, voir
 * `core/analysis/coach-narrative.ts#buildGameCoachFindings`), chacune avec un
 * lien direct vers l'exercice d'Académie qui la corrige
 * (`core/curriculum/motif-theme.ts`), résolu vers `/apprendre?themeId=`
 * (voir `app/apprendre/page.tsx` pour la résolution du deep-link).
 */
import { GraduationCap, Target } from "lucide-react";
import Link from "next/link";
import type { CoachFinding } from "@/core/analysis/coach-narrative";
import { themeForMotif } from "@/core/curriculum/motif-theme";
import type { Motif } from "@/core/chess/types";

/** Pluriel d'affichage du bouton — « les Fourchettes », « les Mats du couloir »… distinct de `MOTIF_LABEL` (singulier, `lib/labels.ts`) qui ne convient pas à ce gabarit de bouton. */
const MOTIF_PLURAL_LABEL: Record<Motif, string> = {
  fork: "les Fourchettes",
  pin: "les Clouages",
  skewer: "les Enfilades",
  discovered_attack: "les Attaques à la découverte",
  back_rank_mate: "les Mats du couloir",
  hanging_piece: "les Pièces en prise",
};

function findingKey(finding: CoachFinding): string {
  return `${finding.ply}-${finding.message.tag}-${finding.message.motif ?? ""}`;
}

export function CoachReportPanel({ findings }: { findings: readonly CoachFinding[] }) {
  if (findings.length === 0) return null;

  return (
    <section>
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground"><GraduationCap aria-hidden="true" className="size-5 text-foreground-muted" />Rapport du coach</h2>
      <p className="mt-0.5 text-sm text-foreground-muted">
        Les lacunes détectées dans cette partie, avec l&apos;exercice de l&apos;Académie qui les corrige.
      </p>
      <ul className="mt-3 space-y-2">
        {findings.map((finding) => {
          const theme = finding.message.motif ? themeForMotif(finding.message.motif) : null;
          // Un mat manqué sans motif nommé (`mateMissed` sans figure reconnue
          // parmi les 6 `Motif`) ne peut pas pointer vers UN thème précis —
          // repli sur la catégorie "Checkmate Patterns" tout entière, plutôt
          // que de ne rien proposer.
          const isMissedMate = finding.message.tag === "missed_mate";

          return (
            <li
              key={findingKey(finding)}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-l-4 border-border border-l-inaccuracy bg-surface px-3 py-2"
            >
              <span className="text-sm text-foreground"><span className="font-medium">Lacune détectée :</span> {finding.message.text}</span>
              {theme && (
                <Link
                  href={`/apprendre?themeId=${theme.themeId}`}
                  className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-md border border-border-strong bg-surface-muted px-3 text-sm font-medium text-foreground hover:bg-surface-raised"
                >
                  <Target aria-hidden="true" className="size-4" />
                  S&apos;exercer sur {MOTIF_PLURAL_LABEL[finding.message.motif!]} (Académie)
                </Link>
              )}
              {!theme && isMissedMate && (
                <Link
                  href="/apprendre?categoryId=checkmate_patterns"
                  className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-md border border-border-strong bg-surface-muted px-3 text-sm font-medium text-foreground hover:bg-surface-raised"
                >
                  <Target aria-hidden="true" className="size-4" />
                  Réviser les mats (Académie)
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
