/**
 * Les 4 boutons FSRS officiels, affichés une fois le puzzle résolu.
 *
 * Réutilise les jetons de qualité (`lib/labels.ts`) plutôt que d'inventer une
 * palette : Encore/Difficile/Bon/Facile suivent le même dégradé rouge → ambre
 * → vert → turquoise que les gaffes/imprécisions/meilleurs coups/brillances
 * ailleurs dans l'app.
 */
import type { MoveQuality } from "@/core/chess/types";
import { QUALITY_BADGE_INK_CLASS, QUALITY_BG_CLASS } from "@/lib/labels";
import type { ReviewGrade } from "@/server/srs/fsrs";

const GRADE_TO_QUALITY: Record<ReviewGrade, MoveQuality> = {
  again: "blunder",
  hard: "inaccuracy",
  good: "best",
  easy: "brilliant",
};

const GRADE_LABEL: Record<ReviewGrade, string> = {
  again: "Encore",
  hard: "Difficile",
  good: "Bon",
  easy: "Facile",
};

const GRADE_ORDER: readonly ReviewGrade[] = ["again", "hard", "good", "easy"];

export function GradePanel({ onGrade }: { onGrade: (grade: ReviewGrade) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {GRADE_ORDER.map((grade) => {
        const quality = GRADE_TO_QUALITY[grade];
        return (
          <button
            key={grade}
            type="button"
            onClick={() => onGrade(grade)}
            className={`rounded-md px-3 py-2 text-sm font-semibold shadow-sm hover:opacity-90 ${QUALITY_BG_CLASS[quality]} ${QUALITY_BADGE_INK_CLASS[quality]}`}
          >
            {GRADE_LABEL[grade]}
          </button>
        );
      })}
    </div>
  );
}
