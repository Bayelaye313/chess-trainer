import Link from "next/link";
import { MAIN_LINE_VARIATION_KEY } from "@/core/curriculum/opening-variation-key";
import type { OpeningEnduranceComparison, OpeningSessionHistory } from "./opening-endurance-history";
import { buildPerformanceProfile, type Pillar, type PillarLevel } from "./opening-performance-radar";
import { DRILL_ANCHOR_ID, SANS_GUIDE_MODE } from "./opening-stats";

/**
 * Radar de performance, en tête de l'onglet Ouvertures : diagnostic rédigé,
 * trois piliers en barres graduées, puis le hit-parade du répertoire
 * (forteresses / zones de danger). AUCUNE donnée tabulaire : cartes et
 * barres uniquement. Empilé sur mobile, multi-colonnes à partir de `sm`/`lg`.
 *
 * Composant autonome, sans état ni hook : toute la logique vit dans
 * `opening-performance-radar.ts`. Couleurs : `best` (fort), `best` atténué
 * (moyen), `blunder` (faible), sur `surface`/`border`.
 */
export function OpeningPerformanceRadar({ sessions }: { sessions: readonly OpeningSessionHistory[] }) {
  const profile = buildPerformanceProfile(sessions);
  if (!profile) {
    return (
      <section className="rounded-lg border border-border bg-surface p-4 text-sm text-foreground-muted">
        <span className="font-medium text-foreground">Radar de performance</span> — termine une Manche 2 « Sans Guide »
        dans n&apos;importe quelle ouverture pour obtenir ton premier diagnostic.
      </section>
    );
  }

  return (
    <section aria-labelledby="performance-radar-title" className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-4 md:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="performance-radar-title" className="text-sm font-medium uppercase tracking-wide text-foreground-muted">
          Radar de performance
        </h2>
        <span className="text-xs text-foreground-muted">
          {profile.sessionCount} session{profile.sessionCount > 1 ? "s" : ""} Sans Guide analysée
          {profile.sessionCount > 1 ? "s" : ""}
        </span>
      </div>

      {/* Diagnostic pédagogique */}
      <div className="flex flex-col gap-1.5">
        <p className="text-base font-semibold leading-snug text-foreground">{profile.headline}</p>
        <p className="text-sm leading-relaxed text-foreground-muted">{profile.details.join(" ")}</p>
      </div>

      {/* Les 3 piliers */}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {profile.pillars.map((pillar) => (
          <PillarCard key={pillar.id} pillar={pillar} />
        ))}
      </ul>

      {/* Hit-parade du répertoire */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HitParadeBlock
          title="Vos Forteresses"
          subtitle="Les lignes que tu tiens le plus loin sans faute."
          empty="Aucune ouverture au-dessus de 75 % de ligne tenue pour l'instant."
          rows={profile.fortresses}
          tone="best"
        />
        <HitParadeBlock
          title="Vos Zones de Danger"
          subtitle="À driller en priorité, de la plus critique à la moins critique."
          empty="Aucune zone de danger : toutes tes ouvertures tiennent au moins 75 % de leur ligne."
          rows={profile.dangerZones}
          tone="blunder"
        />
      </div>
    </section>
  );
}

const LEVEL_TONE: Record<PillarLevel, { fill: string; text: string; label: string }> = {
  fort: { fill: "bg-best", text: "text-best", label: "Point fort" },
  moyen: { fill: "bg-best/50", text: "text-foreground", label: "En progrès" },
  faible: { fill: "bg-blunder", text: "text-blunder", label: "Point faible" },
};

function PillarCard({ pillar }: { pillar: Pillar }) {
  const tone = pillar.level ? LEVEL_TONE[pillar.level] : null;
  return (
    <li className="flex flex-col gap-2 rounded-md border border-border bg-surface-muted/40 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{pillar.label}</span>
        <span className={`font-mono text-2xl font-bold ${tone?.text ?? "text-foreground-muted"}`}>
          {pillar.score ?? "—"}
          {pillar.score !== null && <span className="text-xs font-normal text-foreground-muted">/100</span>}
        </span>
      </div>

      {/* Barre graduée : repères aux seuils 50 et 75, plus le repère propre au pilier (ex. coup 12). */}
      <div
        className="relative h-2.5 w-full rounded-full bg-surface-muted"
        role="meter"
        aria-label={pillar.label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pillar.score ?? undefined}
        aria-valuetext={pillar.score === null ? "Pas encore mesuré" : `${pillar.score} sur 100, ${tone!.label}`}
      >
        {pillar.score !== null && (
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${tone!.fill}`}
            style={{ width: `${Math.max(pillar.score, 2)}%` }}
          />
        )}
        {[50, 75].map((at) => (
          <span key={at} className="absolute inset-y-0 w-px bg-surface" style={{ left: `${at}%` }} aria-hidden />
        ))}
        {pillar.marker && (
          <span
            className="absolute -inset-y-1 w-0.5 rounded-full bg-foreground/70"
            style={{ left: `${pillar.marker.at}%` }}
            aria-hidden
          />
        )}
      </div>
      {pillar.marker && (
        <div className="relative h-3 text-[10px] text-foreground-muted" aria-hidden>
          <span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${pillar.marker.at}%` }}>
            {pillar.marker.label}
          </span>
        </div>
      )}

      <p className="text-xs leading-relaxed text-foreground-muted">{pillar.detail}</p>
      {tone && <span className={`text-[11px] font-semibold uppercase tracking-wide ${tone.text}`}>{tone.label}</span>}
    </li>
  );
}

function HitParadeBlock({
  title,
  subtitle,
  empty,
  rows,
  tone,
}: {
  title: string;
  subtitle: string;
  empty: string;
  rows: readonly OpeningEnduranceComparison[];
  tone: "best" | "blunder";
}) {
  const accent =
    tone === "best"
      ? { card: "border-best/30 bg-best/5", text: "text-best", fill: "bg-best" }
      : { card: "border-blunder/30 bg-blunder/5", text: "text-blunder", fill: "bg-blunder" };
  return (
    <div className="flex flex-col gap-2">
      <div>
        <h3 className={`text-sm font-semibold ${accent.text}`}>{title}</h3>
        <p className="text-xs text-foreground-muted">{subtitle}</p>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-3 text-sm text-foreground-muted">{empty}</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {rows.map((row, index) => (
            <li key={row.openingId} className={`flex flex-col gap-2 rounded-md border p-3 ${accent.card}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-baseline gap-2">
                  <span className="font-mono text-xs font-bold text-foreground-muted">{index + 1}</span>
                  <Link href={`/ouvertures/${row.openingId}`} className="truncate font-medium text-foreground hover:underline">
                    {row.openingName}
                  </Link>
                </div>
                <span className={`shrink-0 font-mono text-sm font-semibold ${accent.text}`}>{row.robustness} %</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted" aria-hidden>
                <div className={`h-full rounded-full ${accent.fill}`} style={{ width: `${row.robustness}%` }} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-foreground-muted">
                <span>
                  {row.avgMistakeMove === null ? "Aucune gaffe" : `Gaffe moyenne au coup ${row.avgMistakeMove}`} ·{" "}
                  {row.sessions} session{row.sessions > 1 ? "s" : ""}
                  {row.provisional && " · provisoire"}
                </span>
                {tone === "blunder" && (
                  <Link
                    href={`/ouvertures/${row.openingId}?drill=${MAIN_LINE_VARIATION_KEY}${
                      row.tier === "fragile" ? `&mode=${SANS_GUIDE_MODE}` : ""
                    }#${DRILL_ANCHOR_ID}`}
                    className="rounded border border-blunder/40 px-2 py-0.5 font-medium text-blunder hover:bg-blunder/10"
                  >
                    Drill immédiat →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
