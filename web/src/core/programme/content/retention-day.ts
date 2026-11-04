import { PHASE_PASS, RETENTION_PASS } from "../adaptive";
import type { DaySpec } from "./spec-types";

/**
 * Jour 7 des phases 2 à 5 : même contenu que le `RET` de la phase 1 (visite du
 * quartier, test de rétention J+7, révision entrelacée), plus, pour la
 * dernière semaine d'une phase, le bilan de fin de phase et ses critères
 * mesurables (`phaseReview` dans `adaptive.ts`).
 */
export function retentionDay(
  semaine: number,
  metaphores: string[],
  titre: string,
  focus: string,
  extra: string[],
  bilan?: { phase: number; suivante: string | null },
): DaySpec {
  const pct = (v: number) => `${Math.round(v * 100)} %`;
  const bilanTexte = bilan
    ? ` C'est aussi le bilan de la phase ${bilan.phase}. Deux critères, mesurés par l'application : le test de rétention (au moins ${pct(RETENTION_PASS)}) et la réussite complète, squelette ET solution, sur les six jours de concept de cette semaine (au moins ${pct(PHASE_PASS)}). ${bilan.suivante ? `Les deux réussis, ${bilan.suivante} se débloque.` : "Les deux réussis, le programme est terminé."} Sinon, la semaine est rejouée avec des puzzles neufs.`
    : "";
  return {
    semaine,
    jour: 7,
    metaphore_id: metaphores[0],
    theme_metaphore: `${titre} — ${bilan ? "bilan de phase" : "jour de rétention"}`,
    concept: bilan ? "bilan de fin de phase : rétention J+7 et réussite de la semaine" : "révision entrelacée et test de rétention J+7",
    cours:
      `Aucun lieu nouveau aujourd'hui. Tu refais la visite complète du quartier, de mémoire, dans l'ordre où tu l'as parcouru, puis à l'envers. Pour chaque lieu : l'image (ce que tu vois), la règle (ce qu'elle dit de l'échiquier), le lieu plus ancien auquel il s'accroche, et une position de la semaine qui l'illustre. Le test de rétention rejoue des puzzles d'il y a sept jours. Un échec n'est pas une sanction : la semaine est rejouée avec des puzzles neufs sur les mêmes concepts, parce qu'un lieu mal bâti ne supporte pas les étages suivants.${bilanTexte}`,
    ancrage_sensoriel:
      "Ferme les yeux et marche physiquement : un pas par lieu du quartier, à voix haute. À chaque pas, pose la main sur un objet réel de la pièce et associe-le au lieu : le geste devient une ancre de rappel.",
    rappels: metaphores,
    focus_partie: focus,
    reconsolidation: {
      type: "test_retention_j7",
      consigne: `Rejoue sans aucune aide les puzzles tirés de la semaine précédente : squelette d'abord, solution ensuite. Seuil de validation : ${pct(RETENTION_PASS)} de réussites complètes. En dessous, la semaine est rejouée avec de nouveaux puzzles.`,
    },
    checklist: [
      "Test de rétention terminé sans indice",
      "Quartier récité dans l'ordre puis à l'envers",
      "Puzzles entrelacés résolus (thèmes mélangés)",
      "Partie longue jouée et annotée avec les lieux du palais",
      ...extra,
    ],
  };
}
