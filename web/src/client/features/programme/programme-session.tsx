"use client";

/**
 * Déroulé d'une séance de 4 h, bloc par bloc, dans l'ordre du `planning_4h`
 * du jour. Chaque bloc a son écran : cours, échauffement sous hack visuel,
 * puzzles (squelette puis solution), pauses SMR, blindfold, partie lente,
 * reconsolidation active, checklist. Les résultats sont enregistrés au fil
 * de l'eau : recharger la page reprend la séance là où elle en était.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { finishProgrammeSession, saveProgrammeResult } from "@/server/actions/programme";
import type { ProgrammeSessionOutcome, ProgrammeSessionPayload, SessionPuzzle } from "@/core/programme/dto";
import type { PlanningBlock } from "@/core/programme/types";
import type { VisualHackRender } from "@/core/programme/visual-hacks";
import { BlindfoldExercise } from "./blindfold-exercise";
import { SkeletonPuzzle, type PuzzleResult } from "./skeleton-puzzle";
import { SmrPause } from "./smr-pause";

const resultKey = (role: string, puzzleId: string) => `${role}:${puzzleId}`;

const BLOCK_ICON: Record<PlanningBlock["type"], string> = {
  cours: "🏛",
  hack_visuel: "👁",
  puzzles: "🧩",
  pause: "🌙",
  blindfold: "🕶",
  partie: "♟",
  reconsolidation: "🔁",
  analyse: "✅",
};

export function ProgrammeSession({ payload, onExit }: { payload: ProgrammeSessionPayload; onExit: () => void }) {
  const [blockIndex, setBlockIndex] = useState(0);
  const [results, setResults] = useState(() => new Map(payload.done.map((d) => [resultKey(d.role, d.puzzleId), d.skeletonOk && d.solved])));
  const [hackEverywhere, setHackEverywhere] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [selfRating, setSelfRating] = useState<"reussi" | "partiel" | "rate" | null>(null);
  const [outcome, setOutcome] = useState<ProgrammeSessionOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));

  const isRetentionDay = payload.jour === 7;
  const byRole = (role: SessionPuzzle["role"]) => payload.puzzles.filter((p) => p.role === role);
  const puzzleBlocks = payload.planning.map((b, i) => (b.type === "puzzles" ? i : -1)).filter((i) => i >= 0);

  /** Puzzles servis par un bloc « puzzles » : la série du jour, coupée en parts égales entre les blocs. */
  const itemsForPuzzleBlock = (index: number): SessionPuzzle[] => {
    const series = isRetentionDay ? byRole("entrelace") : byRole("puzzle");
    const part = puzzleBlocks.indexOf(index);
    const size = Math.ceil(series.length / puzzleBlocks.length);
    return series.slice(part * size, part * size + size);
  };

  const stats = useMemo(() => {
    const values = [...results.values()];
    return { done: values.length, success: values.filter(Boolean).length };
  }, [results]);

  async function record(item: SessionPuzzle | { role: "blindfold"; sourceDayKey: string; puzzleId: string }, result: PuzzleResult) {
    const puzzleId = "puzzle" in item ? item.puzzle.puzzle_id : item.puzzleId;
    setResults((m) => new Map(m).set(resultKey(item.role, puzzleId), result.skeletonOk && result.solved));
    try {
      await saveProgrammeResult({ sessionId: payload.sessionId, puzzleId, sourceDayKey: item.sourceDayKey, role: item.role, ...result });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function goTo(index: number) {
    setBlockIndex(index);
    setVisited((v) => new Set(v).add(index));
  }
  const next = () => goTo(Math.min(blockIndex + 1, payload.planning.length - 1));

  async function finish() {
    try {
      setOutcome(await finishProgrammeSession({ sessionId: payload.sessionId, checklist: checked, reconsolidation: { note, selfRating } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  const block = payload.planning[blockIndex];
  const hackRender: VisualHackRender = payload.hack.render;

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-3">
        <button type="button" onClick={onExit} className="text-xs text-foreground-muted underline">
          ← Programme
        </button>
        <div>
          <p className="text-xs uppercase tracking-wide text-foreground-muted">
            Semaine {payload.semaine} · Jour {payload.jour}
            {payload.repetition > 0 ? ` · reprise n°${payload.repetition}` : ""}
          </p>
          <h2 className="text-lg font-semibold">{payload.theme_metaphore}</h2>
          <p className="text-xs text-foreground-muted">
            Fenêtre de rating : {payload.effectiveTarget} ± 100 ({payload.ratingOffset >= 0 ? "+" : ""}
            {payload.ratingOffset} adaptatif)
          </p>
        </div>
        <ol className="space-y-1">
          {payload.planning.map((b, i) => (
            <li key={b.bloc}>
              <button
                type="button"
                onClick={() => goTo(i)}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-sm ${i === blockIndex ? "bg-accent text-accent-foreground" : visited.has(i) ? "bg-surface-muted" : ""}`}
              >
                <span>
                  {BLOCK_ICON[b.type]} {b.bloc}
                </span>
                <span className="text-xs opacity-80">{b.duree_min} min</span>
              </button>
            </li>
          ))}
        </ol>
        <p className="text-xs text-foreground-muted">
          Séance : {stats.success}/{stats.done} réussites complètes (squelette + solution).
        </p>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={hackEverywhere} onChange={(e) => setHackEverywhere(e.target.checked)} />
          Hack visuel sur tous les puzzles
        </label>
        {error && <p className="text-xs text-blunder">{error}</p>}
      </aside>

      <section className="min-w-0 rounded-lg border border-border bg-surface p-5">
        <header className="mb-4 border-b border-border pb-3">
          <p className="text-xs uppercase tracking-wide text-foreground-muted">
            Bloc {block.bloc} · {block.duree_min} min
          </p>
          {block.contenu && <p className="text-sm">{block.contenu}</p>}
        </header>

        {block.type === "cours" && !isRetentionDay && <CoursePanel payload={payload} onNext={next} />}
        {block.type === "cours" && isRetentionDay && <RecitationPanel payload={payload} onNext={next} />}

        {block.type === "hack_visuel" && (
          <>
            <div className="mb-4 rounded-md bg-surface-muted p-3 text-sm">
              <p className="font-semibold">👁 {payload.hack.nom}</p>
              <p>{payload.hack.consigne}</p>
              <p className="mt-2 text-xs text-foreground-muted">Mécanisme ciblé : {payload.hack.mecanisme_neuro}</p>
            </div>
            <PuzzleSeries key={`b${blockIndex}`} items={byRole("echauffement")} hack={hackRender} results={results} onResult={record} onNext={next} />
          </>
        )}

        {block.type === "puzzles" && (
          <PuzzleSeries key={`b${blockIndex}`} items={itemsForPuzzleBlock(blockIndex)} hack={hackEverywhere ? hackRender : null} results={results} onResult={record} onNext={next} />
        )}

        {block.type === "pause" && <SmrPause key={`b${blockIndex}`} minutes={block.duree_min} consigne={block.contenu} onDone={next} />}

        {block.type === "blindfold" &&
          (payload.blindfold ? (
            results.has(resultKey("blindfold", payload.blindfold.puzzle_id)) ? (
              <Done onNext={next} />
            ) : (
              <BlindfoldExercise
                exercise={payload.blindfold}
                onDone={(solved) =>
                  record({ role: "blindfold", sourceDayKey: payload.dayKey, puzzleId: payload.blindfold!.puzzle_id }, { skeletonOk: true, solved, markedSquares: [], seconds: 0 }).then(next)
                }
              />
            )
          ) : (
            <p className="text-sm text-foreground-muted">Pas d&apos;exercice à l&apos;aveugle vérifié pour ce jour.</p>
          ))}

        {block.type === "partie" && (
          <div className="space-y-3 text-sm">
            <p>{block.contenu}</p>
            <Link href="/" target="_blank" className="inline-block rounded-md bg-accent px-4 py-2 font-medium text-accent-foreground">
              Ouvrir « Jouer contre des Bots » ↗
            </Link>
            <button type="button" onClick={next} className="ml-2 rounded-md border border-border px-4 py-2">
              Partie terminée
            </button>
          </div>
        )}

        {block.type === "reconsolidation" && !isRetentionDay && (
          <div className="space-y-3 text-sm">
            <p className="rounded-md bg-surface-muted p-3">{payload.reconsolidation.consigne}</p>
            <p className="text-xs text-foreground-muted">Jamais de relecture passive : ferme le cours et produis de mémoire, puis compare.</p>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} className="w-full rounded-md border border-border bg-surface p-2" placeholder="Ce que tu as reconstruit de mémoire, ce qui manquait…" />
            <SelfRating value={selfRating} onChange={setSelfRating} />
            <button type="button" onClick={next} className="rounded-md bg-accent px-4 py-2 font-medium text-accent-foreground">
              Bloc suivant
            </button>
          </div>
        )}
        {block.type === "reconsolidation" && isRetentionDay && (
          <>
            <p className="mb-3 rounded-md bg-surface-muted p-3 text-sm">{payload.reconsolidation.consigne}</p>
            <PuzzleSeries key={`b${blockIndex}`} items={byRole("retention")} hack={hackEverywhere ? hackRender : null} results={results} onResult={record} onNext={next} />
          </>
        )}

        {block.type === "analyse" && !outcome && (
          <div className="space-y-3 text-sm">
            <p className="font-semibold">Checklist du jour</p>
            <ul className="space-y-1">
              {payload.checklist.map((item) => (
                <li key={item}>
                  <label className="flex items-start gap-2">
                    <input type="checkbox" checked={checked.includes(item)} onChange={(e) => setChecked((c) => (e.target.checked ? [...c, item] : c.filter((x) => x !== item)))} />
                    {item}
                  </label>
                </li>
              ))}
            </ul>
            {isRetentionDay && <SelfRating value={selfRating} onChange={setSelfRating} />}
            <button type="button" onClick={finish} className="rounded-md bg-accent px-4 py-2 font-medium text-accent-foreground">
              Terminer la séance
            </button>
          </div>
        )}
        {outcome && <OutcomePanel outcome={outcome} onExit={onExit} />}
      </section>
    </div>
  );
}

function PuzzleSeries({
  items,
  hack,
  results,
  onResult,
  onNext,
}: {
  items: SessionPuzzle[];
  hack: VisualHackRender | null;
  results: Map<string, boolean>;
  onResult: (item: SessionPuzzle, result: PuzzleResult) => Promise<void>;
  onNext: () => void;
}) {
  const pending = items.filter((i) => !results.has(resultKey(i.role, i.puzzle.puzzle_id)));
  if (items.length === 0) return <p className="text-sm text-foreground-muted">Aucun puzzle pour ce bloc.</p>;
  const current = pending[0];
  if (!current) {
    const ok = items.filter((i) => results.get(resultKey(i.role, i.puzzle.puzzle_id))).length;
    return <Done onNext={onNext} summary={`${ok}/${items.length} réussites complètes sur ce bloc.`} />;
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-foreground-muted">
        Puzzle {items.length - pending.length + 1}/{items.length}
      </p>
      <SkeletonPuzzle key={current.puzzle.puzzle_id} item={current} hack={hack} onDone={(r) => void onResult(current, r)} />
    </div>
  );
}

function Done({ onNext, summary }: { onNext: () => void; summary?: string }) {
  return (
    <div className="space-y-3 text-sm">
      <p>Bloc terminé. {summary}</p>
      <button type="button" onClick={onNext} className="rounded-md bg-accent px-4 py-2 font-medium text-accent-foreground">
        Bloc suivant
      </button>
    </div>
  );
}

function CoursePanel({ payload, onNext }: { payload: ProgrammeSessionPayload; onNext: () => void }) {
  return (
    <article className="space-y-4 text-sm leading-relaxed">
      <div className="paper-surface rounded-md p-4">
        <p className="mb-2 text-xs uppercase tracking-wide opacity-70">
          {payload.metaphor.nom} — {payload.metaphor.concept}
        </p>
        <p>{payload.cours.texte}</p>
      </div>
      <p className="rounded-md bg-surface-muted p-3">
        <span className="font-semibold">Ancrage sensoriel.</span> {payload.cours.ancrage_sensoriel}
      </p>
      {payload.rappels.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-foreground-muted">Lieux déjà visités que ce cours réactive</p>
          <ul className="mt-1 space-y-1">
            {payload.rappels.map((m) => (
              <li key={m.id}>
                <span className="font-semibold">{m.nom}</span> ({m.concept}) — <span className="text-foreground-muted">rappelle-toi l&apos;image avant de la relire.</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button type="button" onClick={onNext} className="rounded-md bg-accent px-4 py-2 font-medium text-accent-foreground">
        J&apos;ai parcouru le lieu deux fois, yeux fermés
      </button>
    </article>
  );
}

/** Jour 7 : récitation sans support — les images ne s'affichent qu'après avoir récité. */
function RecitationPanel({ payload, onNext }: { payload: ProgrammeSessionPayload; onNext: () => void }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="space-y-3 text-sm">
      <p>Récite à voix haute, dans l&apos;ordre puis à l&apos;envers, chaque lieu du quartier : l&apos;image, la règle, une position de la semaine.</p>
      <ol className="list-decimal space-y-2 pl-5">
        {payload.rappels.map((m) => (
          <li key={m.id}>
            <span className="font-semibold">{m.nom}</span>
            {revealed && <p className="text-foreground-muted">{m.image}</p>}
          </li>
        ))}
      </ol>
      {!revealed ? (
        <button type="button" onClick={() => setRevealed(true)} className="rounded-md border border-border px-4 py-2">
          J&apos;ai récité — comparer avec les images
        </button>
      ) : (
        <button type="button" onClick={onNext} className="rounded-md bg-accent px-4 py-2 font-medium text-accent-foreground">
          Bloc suivant
        </button>
      )}
    </div>
  );
}

function SelfRating({ value, onChange }: { value: "reussi" | "partiel" | "rate" | null; onChange: (v: "reussi" | "partiel" | "rate") => void }) {
  const options = [
    ["reussi", "Réussi"],
    ["partiel", "Partiel"],
    ["rate", "Raté"],
  ] as const;
  return (
    <div className="flex gap-2">
      {options.map(([v, label]) => (
        <button key={v} type="button" onClick={() => onChange(v)} className={`rounded-md border px-3 py-1 text-xs ${value === v ? "border-accent bg-accent text-accent-foreground" : "border-border"}`}>
          {label}
        </button>
      ))}
    </div>
  );
}

function OutcomePanel({ outcome, onExit }: { outcome: ProgrammeSessionOutcome; onExit: () => void }) {
  const pct = (v: number | null) => (v === null ? "—" : `${Math.round(v * 100)} %`);
  const delta = outcome.newOffset - outcome.previousOffset;
  return (
    <div className="space-y-3 text-sm">
      <p className="text-base font-semibold">Séance terminée</p>
      <p>
        {outcome.succeeded}/{outcome.attempted} réussites complètes · taux glissant (10 séances) : {pct(outcome.rollingSuccess)}
      </p>
      <p>
        Fenêtre de rating :{" "}
        {delta > 0 ? `+${delta} (taux > 75 %, on monte)` : delta < 0 ? `${delta} (taux < 50 %, on redescend)` : "inchangée"} → décalage {outcome.newOffset >= 0 ? "+" : ""}
        {outcome.newOffset}
      </p>
      {outcome.retentionPassed !== null && (
        <p className={outcome.retentionPassed ? "text-best" : "text-blunder"}>
          {outcome.retentionPassed
            ? "Test de rétention réussi : semaine validée."
            : "Test de rétention échoué : la semaine est rejouée avec de nouveaux puzzles sur les mêmes concepts."}
        </p>
      )}
      <p>
        Prochaine séance : {outcome.next.finished ? "programme terminé" : `semaine ${outcome.next.semaine}, jour ${outcome.next.jour}`}
      </p>
      <button type="button" onClick={onExit} className="rounded-md bg-accent px-4 py-2 font-medium text-accent-foreground">
        Retour au programme
      </button>
    </div>
  );
}
