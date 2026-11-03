"use client";

/**
 * Cécité partielle : la position s'affiche UNE fois, pendant
 * `duree_affichage_s`, puis disparaît. La ligne se calcule et s'écrit de tête.
 * La position ne réapparaît qu'après la réponse, pour la correction.
 */
import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { uciSequenceToSan } from "@/core/chess/replay";
import type { BlindfoldExercise as Blindfold } from "@/core/programme/types";
import { BASE_BOARD_OPTIONS } from "./hack-board";

const normalize = (s: string) =>
  s
    .replace(/\d+\.(\.\.)?/g, " ")
    .replace(/[+#!?]/g, "")
    .replace(/0-0-0/g, "O-O-O")
    .replace(/0-0/g, "O-O")
    .split(/\s+/)
    .filter(Boolean);

const FRENCH_TO_ENGLISH: Record<string, string> = { T: "R", C: "N", F: "B", D: "Q", R: "K" };
/** « Txe8 » → « Rxe8 », « e8=D » → « e8=Q » : notation française vers la notation SAN de chess.js. */
const fromFrench = (token: string) =>
  token.replace(/^[TCFDR]/, (c) => FRENCH_TO_ENGLISH[c]).replace(/=([TCFD])/, (_, c: string) => `=${FRENCH_TO_ENGLISH[c]}`);

/**
 * La ligne écrite correspond-elle à la solution (coups adverses compris,
 * symboles d'échec facultatifs) ? Notation anglaise OU française, pas un mélange.
 */
export function blindfoldAnswerMatches(answer: string, solutionSan: readonly string[]): boolean {
  const given = normalize(answer);
  const expected = solutionSan.map((m) => m.replace(/[+#]/g, ""));
  const same = (tokens: string[]) => tokens.length === expected.length && tokens.every((m, i) => m === expected[i]);
  return same(given) || same(given.map(fromFrench));
}

export function BlindfoldExercise({ exercise, onDone }: { exercise: Blindfold; onDone: (solved: boolean) => void }) {
  const [stage, setStage] = useState<"pret" | "affiche" | "masque" | "corrige">("pret");
  const [left, setLeft] = useState(exercise.duree_affichage_s);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const solutionSan = uciSequenceToSan(exercise.fen_affichee_une_fois, exercise.solution_uci);
  const turn = exercise.fen_affichee_une_fois.split(" ")[1] === "w" ? "white" : "black";

  useEffect(() => {
    if (stage !== "affiche") return;
    const t = window.setTimeout(() => {
      if (left <= 1) setStage("masque");
      setLeft((l) => l - 1);
    }, 1000);
    return () => window.clearTimeout(t);
  }, [stage, left]);

  return (
    <div className="space-y-4 text-sm">
      <p>{exercise.consigne_calcul}</p>
      {stage === "pret" && (
        <button type="button" onClick={() => setStage("affiche")} className="rounded-md bg-accent px-4 py-2 font-medium text-accent-foreground">
          Afficher la position ({exercise.duree_affichage_s} s, une seule fois)
        </button>
      )}
      {(stage === "affiche" || stage === "corrige") && (
        <div className="max-w-[420px]">
          <Chessboard options={{ ...BASE_BOARD_OPTIONS, id: "blindfold", position: exercise.fen_affichee_une_fois, boardOrientation: turn, allowDragging: false }} />
          {stage === "affiche" && <p className="mt-2 text-center font-mono text-lg">{left} s</p>}
        </div>
      )}
      {stage === "masque" && (
        <div className="flex aspect-square max-w-[420px] items-center justify-center rounded-md border border-dashed border-border bg-surface-muted text-foreground-muted">
          Position masquée — calcul mental
        </div>
      )}
      {(stage === "masque" || stage === "corrige") && (
        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-wide text-foreground-muted" htmlFor="blindfold-answer">
            Ta ligne complète, coups adverses compris (« Txe8+ Rh7 Dh5# » ou « Rxe8+ Kh7 Qh5# »)
          </label>
          <input
            id="blindfold-answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={stage === "corrige"}
            className="w-full max-w-[420px] rounded-md border border-border bg-surface px-3 py-2 font-mono"
            placeholder="Notation française ou anglaise"
          />
          {stage === "masque" && (
            <button
              type="button"
              disabled={!answer.trim()}
              onClick={() => {
                setResult(blindfoldAnswerMatches(answer, solutionSan));
                setStage("corrige");
              }}
              className="block rounded-md bg-accent px-4 py-2 font-medium text-accent-foreground disabled:opacity-40"
            >
              Corriger
            </button>
          )}
        </div>
      )}
      {stage === "corrige" && result !== null && (
        <div className="space-y-2">
          <p className={result ? "text-best" : "text-blunder"}>{result ? "Ligne exacte." : "Ce n'est pas la ligne attendue."}</p>
          <p className="rounded-md bg-surface-muted p-3 font-mono text-xs">{exercise.solution}</p>
          <div className="flex flex-wrap gap-2">
            {!result && (
              <button type="button" onClick={() => setResult(true)} className="rounded-md border border-border px-4 py-2">
                Ma ligne était la bonne (notation différente)
              </button>
            )}
            <button type="button" onClick={() => onDone(result)} className="rounded-md bg-accent px-4 py-2 font-medium text-accent-foreground">
              Continuer
            </button>
          </div>
          <p className="text-xs text-foreground-muted">
            Source : {exercise.url ? <a className="underline" href={exercise.url} target="_blank" rel="noreferrer">Lichess #{exercise.puzzle_id}</a> : exercise.puzzle_id} · vérifié {exercise.verification.moteur}
          </p>
        </div>
      )}
    </div>
  );
}
