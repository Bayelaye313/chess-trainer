import Link from "next/link";
import { OPENING_COURSE_IDS } from "@/core/curriculum/opening-course-ids";
import { MIN_SESSIONS_FOR_RANKING, type OpeningEnduranceComparison } from "./opening-endurance-history";
import {
  FRAGILE_BEFORE_MOVE,
  GAUGE_FULL_AT_MOVE,
  SOLID_AFTER_MOVE,
  readEndurance,
  resolveTrigger,
  type EnduranceTier,
} from "./opening-stats";

/**
 * Zone Stats d'une ouverture (en tête de `/ouvertures/<id>`) : compteur
 * d'endurance (coup moyen de la première gaffe en « Sans Guide »), score de
 * robustesse et rang dans le classement global, et un bouton qui s'adapte au
 * palier. AUCUNE donnée tabulaire : cartes en grille et flexbox.
 *
 * Composant autonome, sans état ni hook : il reçoit le classement complet
 * (`compareOpenings`, calculé côté serveur à partir de
 * `listEnduranceSessions`) et y retrouve l'ouverture affichée. Sans session
 * pour cette ouverture, il invite à en jouer une. Il ne lit que
 * `OPENING_COURSE_IDS` (liste légère), JAMAIS `opening-course-trees.ts`, pour
 * ne pas embarquer tous les cours dans le bundle de la page.
 */
export function OpeningStatsZone({
  openingId,
  openingName,
  playerSide,
  ranking,
}: {
  openingId: string;
  openingName: string;
  /** Camp du drill lancé par le bouton (`?side=` ou camp du catalogue). */
  playerSide: "white" | "black";
  /** Classement global, la plus fragile d'abord — voir `compareOpenings`. */
  ranking: readonly OpeningEnduranceComparison[];
}) {
  const row = ranking.find((r) => r.openingId === openingId);
  const hasCourse = OPENING_COURSE_IDS.has(openingId);

  if (!row) {
    // Première session : Manche 1 guidée puis Manche 2 — le drill normal.
    const trigger = resolveTrigger({ openingId, playerSide, tier: "moyen", hasCourse });
    return (
      <section className="animate-fade-up-in flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-foreground-muted">Endurance Sans Guide</p>
          <p className="mt-1 text-sm text-foreground">
            Aucune session sur {openingName} pour l&apos;instant. Le drill de la ligne principale est juste en
            dessous : joue la Manche 1 guidée, puis la Manche 2 sans indice, qui mesure ta première gaffe.
          </p>
        </div>
        <CallToAction href={trigger.href} label="Aller au drill" className={NEUTRAL_BUTTON} />
      </section>
    );
  }

  // `avgMistakeMove` est déjà un numéro de coup : on le repasse en ply pour
  // réutiliser EXACTEMENT les seuils de `readEndurance`.
  const endurance = readEndurance(row.avgMistakeMove === null ? null : row.avgMistakeMove * 2);
  const trigger = resolveTrigger({ openingId, playerSide, tier: row.tier, hasCourse });
  const tone = TIER_TONE[row.tier];

  return (
    <section
      aria-labelledby="opening-stats-title"
      className="animate-fade-up-in flex flex-col gap-5 rounded-lg border border-border bg-surface p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="opening-stats-title" className="text-sm font-medium uppercase tracking-wide text-foreground-muted">
          Endurance Sans Guide
        </h2>
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${tone.badge}`}>
          <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} aria-hidden />
          {row.verdict}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Compteur d'endurance tactique */}
        <div className={`flex flex-col gap-3 rounded-md border p-4 sm:col-span-2 ${tone.card}`}>
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xs uppercase tracking-wide text-foreground-muted">Première gaffe en moyenne</p>
            <p className={`font-mono text-2xl font-bold ${tone.text}`}>{endurance.label}</p>
          </div>
          <EnduranceGauge ratio={endurance.ratio} tier={row.tier} />
          <p className="text-sm text-foreground-muted">{TIER_CAPTION[row.tier]}</p>
        </div>

        {/* Score et rang dans le classement global */}
        <div className="flex flex-col gap-2 rounded-md border border-border bg-surface-muted/40 p-4">
          <p className="text-xs uppercase tracking-wide text-foreground-muted">Robustesse</p>
          <p className="font-mono text-2xl font-bold text-foreground">
            {row.robustness}
            <span className="text-sm font-medium text-foreground-muted"> / 100</span>
          </p>
          <p className="text-sm text-foreground-muted">
            Rang {row.rank} sur {ranking.length}
            {ranking.length > 1 ? (row.rank === 1 ? " — ta plus fragile" : row.rank === ranking.length ? " — ta plus robuste" : "") : ""}
            {row.provisional ? ` (provisoire, moins de ${MIN_SESSIONS_FOR_RANKING} sessions)` : ""}.
          </p>
        </div>
      </div>

      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-foreground-muted">
        <li>
          {row.sessions} session{row.sessions > 1 ? "s" : ""}
        </li>
        <li>Record sans faute : coup {row.bestCleanMove}</li>
        <li>{row.avgAccuracy} % de précision</li>
      </ul>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <CallToAction href={trigger.href} label={trigger.label} className={tone.button} />
          <p className="text-xs text-foreground-muted">{trigger.hint}</p>
        </div>
        <Link href="/ouvertures/historique-endurance" className="text-sm text-accent hover:underline">
          Classement de mes ouvertures →
        </Link>
      </div>
    </section>
  );
}

/**
 * Jauge horizontale coups 1 → `GAUGE_FULL_AT_MOVE`, trois zones teintées
 * (rouge / orange / vert) et un repère au coup moyen de la première gaffe.
 * Les frontières tombent ENTRE deux coups (5|6 et 12|13), comme les seuils.
 */
function EnduranceGauge({ ratio, tier }: { ratio: number; tier: EnduranceTier }) {
  const fragileEnd = ((FRAGILE_BEFORE_MOVE - 0.5) / GAUGE_FULL_AT_MOVE) * 100;
  const solidStart = ((SOLID_AFTER_MOVE + 0.5) / GAUGE_FULL_AT_MOVE) * 100;
  const position = Math.round(ratio * 1000) / 10;

  return (
    <div>
      <div
        className="relative h-2.5 w-full rounded-full"
        role="meter"
        aria-label="Coup moyen de la première gaffe"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={position}
      >
        <div className="absolute inset-0 flex overflow-hidden rounded-full">
          <div className="h-full bg-blunder/30" style={{ width: `${fragileEnd}%` }} />
          <div className="h-full bg-inaccuracy/30" style={{ width: `${solidStart - fragileEnd}%` }} />
          <div className="h-full flex-1 bg-best/30" />
        </div>
        <span
          className={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface ${TIER_TONE[tier].dot}`}
          style={{ left: `${Math.min(Math.max(position, 2), 98)}%` }}
          aria-hidden
        />
      </div>
      <div className="relative mt-1.5 h-4 text-[11px] text-foreground-muted" aria-hidden>
        <span className="absolute left-0">Coup 1</span>
        <span className="absolute -translate-x-1/2" style={{ left: `${fragileEnd}%` }}>
          {FRAGILE_BEFORE_MOVE}
        </span>
        <span className="absolute -translate-x-1/2" style={{ left: `${solidStart}%` }}>
          {SOLID_AFTER_MOVE}
        </span>
        <span className="absolute right-0">{GAUGE_FULL_AT_MOVE}+</span>
      </div>
    </div>
  );
}

function CallToAction({ href, label, className }: { href: string; label: string; className: string }) {
  return (
    <Link href={href} className={`self-start rounded-md border px-4 py-2 text-sm font-semibold transition-colors ${className}`}>
      {label} →
    </Link>
  );
}

const NEUTRAL_BUTTON = "border-border bg-surface-muted text-foreground hover:border-accent/60";

/** Rouge / orange / vert, sur les couleurs de qualité de coup du thème. */
const TIER_TONE: Record<EnduranceTier, { card: string; badge: string; dot: string; text: string; button: string }> = {
  fragile: {
    card: "border-blunder/40 bg-blunder/10",
    badge: "border-blunder/50 bg-blunder/15 text-blunder",
    dot: "bg-blunder",
    text: "text-blunder",
    button: "border-blunder/60 bg-blunder/15 text-blunder hover:bg-blunder/25",
  },
  moyen: {
    card: "border-inaccuracy/40 bg-inaccuracy/10",
    badge: "border-inaccuracy/50 bg-inaccuracy/15 text-inaccuracy",
    dot: "bg-inaccuracy",
    text: "text-inaccuracy",
    button: "border-inaccuracy/60 bg-inaccuracy/15 text-inaccuracy hover:bg-inaccuracy/25",
  },
  solide: {
    card: "border-best/40 bg-best/10",
    badge: "border-best/50 bg-best/15 text-best",
    dot: "bg-best",
    text: "text-best",
    button: "border-best/60 bg-best/15 text-best hover:bg-best/25",
  },
  intact: {
    card: "border-best/40 bg-best/10",
    badge: "border-best/50 bg-best/15 text-best",
    dot: "bg-best",
    text: "text-best",
    button: "border-best/60 bg-best/15 text-best hover:bg-best/25",
  },
};

const TIER_CAPTION: Record<EnduranceTier, string> = {
  fragile: `Première gaffe avant le coup ${FRAGILE_BEFORE_MOVE} : la ligne n'est pas encore mémorisée.`,
  moyen: `Première gaffe entre les coups ${FRAGILE_BEFORE_MOVE} et ${SOLID_AFTER_MOVE} : la théorie tient, la suite flanche.`,
  solide: `Première gaffe après le coup ${SOLID_AFTER_MOVE} : tu sors de l'ouverture en bon état.`,
  intact: "Aucune gaffe sur toutes tes sessions Sans Guide.",
};
