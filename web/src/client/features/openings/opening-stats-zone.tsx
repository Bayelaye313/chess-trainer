import Link from "next/link";
import { OPENING_COURSE_IDS } from "@/core/curriculum/opening-course-ids";
import {
  buildDiagnostic,
  readEndurance,
  resolveTrigger,
  type EnduranceTier,
  type UserOpeningStats,
} from "./opening-stats";

/**
 * Zone Stats d'une ouverture (vue détaillée de l'onglet Ouvertures) : un
 * diagnostic en prose, le compteur d'endurance (coup moyen de la première
 * gaffe) et un bouton qui s'adapte à ce coup. Aucune donnée tabulaire : des
 * cartes en flexbox et des phrases.
 *
 * Composant autonome, sans état ni hook : il reçoit `stats` (voir
 * `UserOpeningStats`) et `null` quand le joueur n'a aucune partie dans cette
 * ouverture — il ne rend alors rien. Il ne lit que `OPENING_COURSE_IDS`
 * (liste légère), JAMAIS `opening-course-trees.ts`, pour ne pas embarquer
 * tous les cours dans le bundle de la page.
 */
export function OpeningStatsZone({ stats }: { stats: UserOpeningStats | null }) {
  if (!stats) return null;
  const endurance = readEndurance(stats.avgMistakePly);
  const trigger = resolveTrigger(stats, OPENING_COURSE_IDS.has(stats.openingId));
  const tone = TIER_TONE[endurance.tier];

  return (
    <section className="animate-fade-up-in flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-foreground-muted">Ton diagnostic</p>
        <p className="mt-2 text-base leading-relaxed text-foreground">{buildDiagnostic(stats)}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className={`flex items-center gap-3 rounded-md border px-4 py-3 ${tone.card}`}>
          <span className={`h-3 w-3 shrink-0 rounded-full ${tone.dot}`} aria-hidden />
          <div>
            <p className="text-xs uppercase tracking-wide text-foreground-muted">Endurance</p>
            <p className={`font-mono text-lg font-semibold ${tone.text}`}>{endurance.label}</p>
          </div>
        </div>
        <div className="flex-1">
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
            role="meter"
            aria-label="Coup moyen de la première gaffe"
            aria-valuemin={0}
            aria-valuemax={1}
            aria-valuenow={endurance.ratio}
          >
            <div className={`h-full rounded-full ${tone.dot}`} style={{ width: `${Math.round(endurance.ratio * 100)}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-foreground-muted">{TIER_CAPTION[endurance.tier]}</p>
        </div>
      </div>

      <Link
        href={trigger.href}
        className="self-start rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
      >
        {trigger.label} →
      </Link>
    </section>
  );
}

const TIER_TONE: Record<EnduranceTier, { card: string; dot: string; text: string }> = {
  fragile: { card: "border-blunder/40 bg-blunder/10", dot: "bg-blunder", text: "text-blunder" },
  moyen: { card: "border-inaccuracy/40 bg-inaccuracy/10", dot: "bg-inaccuracy", text: "text-inaccuracy" },
  solide: { card: "border-best/40 bg-best/10", dot: "bg-best", text: "text-best" },
  intact: { card: "border-best/40 bg-best/10", dot: "bg-best", text: "text-best" },
};

const TIER_CAPTION: Record<EnduranceTier, string> = {
  fragile: "Première gaffe avant le coup 6 : la ligne n'est pas encore mémorisée.",
  moyen: "Première gaffe entre les coups 6 et 12 : la théorie tient, la suite flanche.",
  solide: "Première gaffe après le coup 12 : tu sors de l'ouverture en bon état.",
  intact: "Aucune gaffe recensée en phase d'ouverture.",
};
