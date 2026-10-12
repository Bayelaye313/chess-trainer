import type { EnduranceTier } from "./opening-stats";
import {
  ROLLING_WINDOW,
  buildEnduranceStatus,
  buildTimeline,
  compareOpenings,
  type OpeningSessionHistory,
  type TimelineMood,
} from "./opening-endurance-history";

/**
 * Historique d'endurance « Sans Guide » : le joueur repousse-t-il sa première
 * gaffe de plus en plus tard ? Trois blocs, AUCUNE donnée tabulaire : une
 * carte de statut, une chronologie narrative en liste, une grille de cartes
 * par ouverture. Empilé sur mobile, multi-colonnes à partir de `md`.
 *
 * Composant autonome, sans état ni hook ni accès base : il reçoit
 * `sessions` (dans n'importe quel ordre) et `now`, injecté pour que les
 * « il y a 2 jours » soient identiques au rendu serveur et client.
 */
export function OpeningEnduranceHistory({
  sessions,
  now,
}: {
  sessions: readonly OpeningSessionHistory[];
  now: Date;
}) {
  const status = buildEnduranceStatus(sessions);
  if (!status) {
    return (
      <section className="rounded-lg border border-border bg-surface p-6 text-center">
        <p className="text-base text-foreground">Aucune session Sans Guide pour l&apos;instant.</p>
        <p className="mt-1 text-sm text-foreground-muted">
          Termine une Manche 2 dans n&apos;importe quelle ouverture : ton premier record d&apos;endurance apparaîtra ici.
        </p>
      </section>
    );
  }
  const timeline = buildTimeline(sessions, now);
  const comparisons = compareOpenings(sessions);
  const tone = TIER_TONE[status.tier];

  return (
    <div className="flex flex-col gap-6">
      {/* Statut d'endurance global */}
      <section
        aria-labelledby="endurance-status-title"
        className={`animate-fade-up-in flex flex-col gap-5 rounded-lg border p-5 md:p-6 ${tone.card}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="endurance-status-title" className="text-sm font-medium uppercase tracking-wide text-foreground-muted">
            Statut d&apos;endurance
          </h2>
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${tone.badge}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} aria-hidden />
            {TIER_BADGE[status.tier]}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-border bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-foreground-muted">Ply Record</p>
            <p className={`mt-1 font-mono text-4xl font-bold ${tone.text}`}>Coup {status.recordMove}</p>
            <p className="mt-2 text-sm text-foreground-muted">
              Le plus loin que tu sois allé sans erreur, dans {status.recordSession.openingName}.
            </p>
          </div>
          <div className="rounded-md border border-border bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-foreground-muted">
              Moyenne sur {status.rollingCount < ROLLING_WINDOW ? `${status.rollingCount} session${status.rollingCount > 1 ? "s" : ""}` : `${ROLLING_WINDOW} sessions`}
            </p>
            <p className="mt-1 font-mono text-4xl font-bold text-foreground">
              Coup {status.rollingMove.toLocaleString("fr-FR")}
            </p>
            <p className="mt-2 text-sm text-foreground-muted">{trendSentence(status.trend)}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Chronologie des progrès */}
        <section aria-labelledby="endurance-timeline-title" className="rounded-lg border border-border bg-surface p-5 lg:col-span-3">
          <h2 id="endurance-timeline-title" className="text-sm font-medium uppercase tracking-wide text-foreground-muted">
            Chronologie des progrès
          </h2>
          <ol className="mt-4 flex flex-col">
            {timeline.map((entry, index) => (
              <li key={entry.session.sessionId} className="relative flex gap-4 pb-5 last:pb-0">
                {index < timeline.length - 1 && (
                  <span className="absolute left-[11px] top-7 h-[calc(100%-1.25rem)] w-px bg-border" aria-hidden />
                )}
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${MOOD_TONE[entry.mood].marker}`}
                  aria-label={MOOD_TONE[entry.mood].label}
                >
                  {MOOD_TONE[entry.mood].icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{entry.headline}</p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground-muted">{entry.story}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Comparateur d'ouvertures */}
        <section aria-labelledby="endurance-compare-title" className="flex flex-col gap-3 lg:col-span-2">
          <h2 id="endurance-compare-title" className="text-sm font-medium uppercase tracking-wide text-foreground-muted">
            Comparateur d&apos;ouvertures
          </h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {comparisons.map((row) => {
              const rowTone = TIER_TONE[row.tier];
              return (
                <li key={row.openingId} className={`flex flex-col gap-2 rounded-lg border p-4 ${rowTone.card}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-foreground">{row.openingName}</p>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${rowTone.badge}`}>
                      {row.verdict}
                    </span>
                  </div>
                  <p className="text-sm text-foreground-muted">
                    {row.avgMistakeMove === null
                      ? "Aucune gaffe sur toutes tes sessions."
                      : `Gaffe moyenne au coup ${row.avgMistakeMove}.`}{" "}
                    Record sans faute : coup {row.bestCleanMove}.
                  </p>
                  <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground-muted">
                    <li>
                      {row.sessions} session{row.sessions > 1 ? "s" : ""}
                    </li>
                    <li>{row.avgAccuracy} % de précision</li>
                  </ul>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

function trendSentence(trend: number | null): string {
  if (trend === null) return "Encore quelques sessions et on mesurera ta tendance.";
  if (trend > 0) return `+${trend.toLocaleString("fr-FR")} coup par rapport aux 10 sessions précédentes : tu repousses la gaffe.`;
  if (trend < 0) return `${trend.toLocaleString("fr-FR")} coup par rapport aux 10 sessions précédentes : la fatigue revient plus tôt.`;
  return "Aucun changement par rapport aux 10 sessions précédentes.";
}

/** Rouge / orange / vert, sur les couleurs de qualité de coup du thème. */
const TIER_TONE: Record<EnduranceTier, { card: string; badge: string; dot: string; text: string }> = {
  fragile: {
    card: "border-blunder/40 bg-blunder/10",
    badge: "border-blunder/50 bg-blunder/15 text-blunder",
    dot: "bg-blunder",
    text: "text-blunder",
  },
  moyen: {
    card: "border-inaccuracy/40 bg-inaccuracy/10",
    badge: "border-inaccuracy/50 bg-inaccuracy/15 text-inaccuracy",
    dot: "bg-inaccuracy",
    text: "text-inaccuracy",
  },
  solide: { card: "border-best/40 bg-best/10", badge: "border-best/50 bg-best/15 text-best", dot: "bg-best", text: "text-best" },
  intact: { card: "border-best/40 bg-best/10", badge: "border-best/50 bg-best/15 text-best", dot: "bg-best", text: "text-best" },
};

const TIER_BADGE: Record<EnduranceTier, string> = {
  fragile: "Amnésie précoce",
  moyen: "En transition",
  solide: "Endurant",
  intact: "Endurant",
};

const MOOD_TONE: Record<TimelineMood, { icon: string; label: string; marker: string }> = {
  record: { icon: "★", label: "Nouveau record", marker: "border-best/60 bg-best/20 text-best" },
  progres: { icon: "↑", label: "Progrès", marker: "border-best/40 bg-best/10 text-best" },
  recul: { icon: "↓", label: "Recul", marker: "border-blunder/40 bg-blunder/10 text-blunder" },
  stable: { icon: "•", label: "Session", marker: "border-border bg-surface-muted text-foreground-muted" },
};
