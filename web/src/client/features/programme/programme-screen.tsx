"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EsportHeader } from "@/components/ui/esport-page";
import { startProgrammeSession } from "@/server/actions/programme";
import type { ProgrammeOverview, ProgrammeSessionPayload } from "@/core/programme/dto";
import { QUARTER_LABEL } from "@/core/programme/metaphors";
import { ProgrammeSession } from "./programme-session";

/** Accueil du Programme 1000 Heures : où j'en suis, la semaine, la bibliothèque du palais, et la séance du jour. */
export function ProgrammeScreen({ overview }: { overview: ProgrammeOverview }) {
  const router = useRouter();
  const [session, setSession] = useState<ProgrammeSessionPayload | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (session) {
    return (
      <ProgrammeSession
        payload={session}
        onExit={() => {
          setSession(null);
          router.refresh();
        }}
      />
    );
  }

  const pct = (v: number | null) => (v === null ? "—" : `${Math.round(v * 100)} %`);
  const start = () =>
    startTransition(async () => {
      try {
        const payload = await startProgrammeSession();
        if (payload) setSession(payload);
        else setError("Ce jour n'est pas encore généré.");
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });

  return (
    <div className="space-y-6">
      <EsportHeader eyebrow={`Phase ${overview.phaseId} · ${overview.phaseTitre}`} title="Programme 1000 Heures">
        De ton Elo actuel à 2400, 36 semaines de 7 jours × 4 h. Palais de mémoire, squelette avant solution, hack visuel quotidien, pauses SMR,
        cécité partielle et reconsolidation active.
      </EsportHeader>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Tile label="Position" value={`S${overview.semaine} · J${overview.jour}`} hint={overview.repetition > 0 ? `semaine rejouée ×${overview.repetition}` : "sur 36 semaines"} />
        <Tile label="Elo cible du jour" value={overview.today ? String(overview.today.elo_cible + overview.ratingOffset) : "—"} hint={`décalage adaptatif ${overview.ratingOffset >= 0 ? "+" : ""}${overview.ratingOffset}`} />
        <Tile label="Réussite glissante" value={pct(overview.stats.rollingSuccess)} hint="10 dernières séances" />
        <Tile label="Heures" value={`${overview.stats.hoursDone} / 1000`} hint={`${overview.stats.completedSessions} séances`} />
        <Tile label="Elo actuel" value={overview.stats.currentElo ? String(overview.stats.currentElo) : "—"} hint="dernière partie importée" />
      </div>

      <section className="rounded-lg border border-border bg-surface p-5">
        {overview.contentMissing ? (
          <div className="space-y-2 text-sm">
            <p className="font-semibold">La semaine {overview.semaine} n&apos;est pas encore générée.</p>
            <p className="text-foreground-muted">
              Le contenu se produit phase par phase avec puzzles Lichess vérifiés par Stockfish :{" "}
              <code className="font-mono">node --import tsx scripts/programme/generate-phase.mts {Math.ceil(overview.semaine / 7)}</code>
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-foreground-muted">Aujourd&apos;hui</p>
              <h2 className="text-xl font-semibold">{overview.today?.theme_metaphore}</h2>
              <p className="text-sm text-foreground-muted">{overview.today?.concept_echiquéen}</p>
            </div>
            <button type="button" onClick={start} disabled={pending} className="rounded-md bg-accent px-5 py-3 font-semibold text-accent-foreground disabled:opacity-50">
              {pending ? "Préparation…" : overview.inProgressSessionId ? "Reprendre la séance" : "Commencer la séance (4 h)"}
            </button>
          </div>
        )}
        {error && <p className="mt-2 text-sm text-blunder">{error}</p>}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground-muted">Semaine {overview.semaine}</h3>
        <ol className="grid gap-2 sm:grid-cols-7">
          {overview.week.map((d) => (
            <li
              key={d.jour}
              className={`rounded-md border p-2 text-xs ${d.jour === overview.jour ? "border-accent" : "border-border"} ${d.done ? "bg-surface-muted" : "bg-surface"}`}
            >
              <p className="font-mono text-foreground-muted">
                J{d.jour} {d.done ? "✓" : ""}
              </p>
              <p className="font-medium">{d.concept || d.theme}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground-muted">Mon palais de mémoire</h3>
        {overview.library.length === 0 ? (
          <p className="text-sm text-foreground-muted">Aucun lieu visité pour l&apos;instant : la Cathédrale t&apos;attend.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {overview.library.map((m) => (
              <li key={m.id} className="rounded-md border border-border bg-surface p-3 text-sm">
                <p className="text-xs text-foreground-muted">
                  {QUARTER_LABEL[m.quartier]} · {m.firstDayKey} · {m.visits} visite{m.visits > 1 ? "s" : ""}
                </p>
                <p className="font-semibold">{m.nom}</p>
                <p className="text-xs text-foreground-muted">{m.concept}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Tile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="text-xs uppercase tracking-wide text-foreground-muted">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-foreground-muted">{hint}</p>
    </div>
  );
}
