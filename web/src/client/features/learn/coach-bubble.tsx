import { GraduationCap } from "lucide-react";
import { COACH_BUBBLE_CLASS, COACH_ICON_CLASS, COACH_TONE_CLASS } from "@/components/ui/coach";

/**
 * Bulle de commentaire du coach — l'onglet « Apprendre » n'a pas de FSRS ni
 * de notation (voir le docstring de `userThemeProgress`), mais un cours sans
 * AUCUNE explication du « pourquoi » resterait une suite de squares à
 * deviner. Deux bulles, jamais les deux en même temps :
 *
 *  - AVANT résolution (`variant: "brief"`) : la description du thème
 *    (`CurriculumThemeOverview.description`, déjà écrite et vérifiée par
 *    `catalog.ts` — jamais un texte généré) reformulée en voix de coach —
 *    ce que ce thème entraîne à repérer, jamais LE coup exact (ça resterait
 *    un spoiler). Reste affichée tout le temps de la recherche.
 *  - APRÈS résolution (`variant: "debrief"`) : relie la suite trouvée
 *    (`solutionSan`) à ce même thème — "Bien vu : Nd5, Qd8, Nxc7+. Reconnaître
 *    et exploiter : la fourchette." — plus la provenance (`sourceRef`,
 *    ex. Elo Lichess de la partie source) quand elle existe, en petit.
 *    Remplace la bulle "brief" une fois le puzzle courant résolu, jusqu'au
 *    suivant (voir `theme-session.tsx`, qui capture `solutionSan`/`sourceRef`
 *    du puzzle qui vient d'être validé AVANT de charger le suivant).
 */

function formatSolutionLine(solutionSan: readonly string[]): string {
  // Coups du joueur aux rangs pairs (0-based), réponses adverses aux rangs
  // impairs — même convention que `curriculum_puzzles.solution` — mais la
  // bulle du coach ne cite QUE les coups joués par l'utilisateur : les
  // réponses adverses n'illustrent pas le thème, elles ne feraient
  // qu'allonger la phrase sans rien expliquer.
  const playerMoves = solutionSan.filter((_, index) => index % 2 === 0);
  return playerMoves.join(", ");
}

export function CoachBubble({
  variant,
  description,
  solutionSan,
  sourceRef,
}: {
  variant: "brief" | "debrief";
  description: string;
  /** Uniquement pour `variant: "debrief"` — la suite du puzzle qui vient d'être validé. */
  solutionSan?: readonly string[];
  sourceRef?: string | null;
}) {
  const debrief = variant === "debrief" && solutionSan && solutionSan.length > 0;

  return (
    <div className={`${COACH_BUBBLE_CLASS} ${COACH_TONE_CLASS[debrief ? "success" : "neutral"]}`}>
      <GraduationCap aria-hidden="true" className={COACH_ICON_CLASS} />
      <div className="min-w-0">
        {debrief ? (
          <p className="text-foreground">
            <span className="font-semibold">Bien vu : {formatSolutionLine(solutionSan!)}.</span> {description}
          </p>
        ) : (
          <p className="text-foreground-muted">
            <span className="font-medium text-foreground">Le coach —</span> ce thème entraîne à repérer : {description.toLowerCase().replace(/\.$/, "")}.
          </p>
        )}
        {debrief && sourceRef && <p className="mt-1 text-xs text-foreground-muted">{sourceRef}</p>}
      </div>
    </div>
  );
}
