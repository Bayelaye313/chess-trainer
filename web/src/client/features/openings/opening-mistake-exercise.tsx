"use client";

/**
 * Exercice de correction du journal « Erreurs d'ouverture » (voir
 * `client/features/reviews/opening-mistakes-hub.tsx`) : rejoue en AUTOPLAY la
 * vraie partie importée du joueur depuis le tout premier coup jusqu'à la
 * position fautive, plateau retourné dès le premier rendu s'il jouait les
 * Noirs dans cette partie précise (`deviation.playerColor`, jamais
 * `opening.side` — voir `boardOrientation` ci-dessous), affiche « Dans ta
 * partie avec les Noirs/Blancs contre [Adversaire], tu as joué X. Trouve le
 * bon coup théorique. », puis soumet la correction à la même méthode Listudy
 * stricte que le Mode Entraînement du catalogue (`use-opening-drill.ts`,
 * `OpeningDrill`) — un coup faux fait revenir la pièce (tremblement + bip,
 * jamais de message) ; en plus du bouton d'indice, une flèche d'indice
 * automatique (`drill.hintArrow`, même moteur que `OpeningDrill`) trace le
 * coup théorique attendu tant qu'il n'a pas été réussi 2 fois par le joueur.
 *
 * `openingId` (le chapitre correspondant du catalogue restreint, voir
 * `server/queries/opening-mistakes.ts`) est `null` pour la majorité des
 * parties réellement importées — la base ECO globale couvre des milliers de
 * lignes, le catalogue local seulement une vingtaine de chapitres. Sans
 * correspondance, un opening SYNTHÉTIQUE minimal est construit depuis les
 * données propres à CETTE partie (`deviation.openingName`/`eco`/`playerColor`)
 * plutôt que de refuser l'exercice : seuls les commentaires pédagogiques
 * ciblés (`core/curriculum/opening-commentary.ts`, qui n'existent que pour
 * les chapitres du catalogue) restent alors indisponibles — l'échiquier,
 * l'autoplay, la flèche d'indice et la méthode Listudy stricte fonctionnent
 * à l'identique.
 *
 * Volontairement plus dépouillé qu'`OpeningDrill` : un exercice ciblé n'a ni
 * chapitres à choisir, ni Test Final — juste l'échiquier, l'indice, le
 * commentaire, et un retour au journal une fois corrigé.
 */
import { useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { getMoveCommentary } from "@/core/curriculum/opening-commentary";
import { findOpening, type OpeningLine } from "@/core/curriculum/openings";
import { markOpeningMistakeReviewed } from "@/server/actions/opening-mistake-review";
import { useErrorShake } from "./error-feedback";
import { MoveCommentary } from "./move-commentary";
import { buildMistakeRound, type MistakeExerciseSource } from "./opening-mistake-round";
import { useOpeningDrill } from "./use-opening-drill";

/** Repli minimal quand `openingId` ne correspond à aucun chapitre du catalogue — voir le docstring du fichier. */
function syntheticOpening(deviation: MistakeExerciseSource): OpeningLine {
  return {
    id: "hors-catalogue",
    name: deviation.openingName,
    eco: "",
    side: deviation.playerColor === "w" ? "white" : "black",
    description: "",
    moves: [],
  };
}

export function OpeningMistakeExercise({
  openingId,
  deviation,
  onExit,
}: {
  openingId: string | null;
  deviation: MistakeExerciseSource;
  onExit: () => void;
}) {
  // `plies` n'est utilisé par `useOpeningDrill` que pour `kind: "main-line"`,
  // jamais démarré ici (voir `start()` ci-dessous) — un tableau vide suffit.
  const opening = (openingId ? findOpening(openingId) : null) ?? syntheticOpening(deviation);
  const drill = useOpeningDrill({ opening, plies: [] });
  const shaking = useErrorShake(drill.errorPulse);

  // Bouton « Show hints for this move! » — même invariant que `OpeningDrill` :
  // le SEUL moyen d'obtenir de l'aide, jamais révélé de lui-même.
  const [hintRevealed, setHintRevealed] = useState<number | null>(null);

  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const { round, leadInUci } = buildMistakeRound(deviation);
    drill.start({ kind: "mistake", round, leadInUci, actualSan: deviation.actualSan });
    // Volontairement `[]` : on ne veut démarrer qu'une seule fois au montage
    // (`startedRef`), jamais si `drill`/`deviation` changent d'identité entre
    // deux rendus (même schéma que `autoStartedKeyRef` dans `opening-drill.tsx`).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Marque la déviation comme "✅ Vue / Révisée" (badge persistant du Hub, voir
  // `opening-mistakes-hub.tsx`) dès que la manche se termine — méthode Listudy
  // stricte (voir le docstring du fichier) : `status === "finished"` ne peut
  // ici signifier qu'un succès, le seul coup accepté est la correction
  // attendue. `reviewedSentRef` évite un double envoi tant que l'écran reste
  // "finished" (l'effet se redéclenche à chaque rendu) — jamais remis à `false`
  // par `retry()` ("Rejouer") : un second envoi serait de toute façon sans
  // effet, `markOpeningMistakeReviewed` étant idempotent côté serveur.
  const reviewedSentRef = useRef(false);
  useEffect(() => {
    if (drill.status !== "finished" || reviewedSentRef.current) return;
    reviewedSentRef.current = true;
    markOpeningMistakeReviewed(deviation.fenBefore, deviation.actualUci).catch(() => {
      // Best-effort : une panne réseau/DB transitoire ne doit jamais bloquer
      // l'écran de fin déjà affiché — au pire le badge du Hub restera en
      // retard d'une correction, sans conséquence sur l'exercice lui-même.
    });
  }, [drill.status, deviation.fenBefore, deviation.actualUci]);

  const hintCommentary = drill.status === "playing" ? getMoveCommentary(opening.id, drill.nextPly) : null;
  const mistakeAlert = drill.status === "playing" && drill.plyIndex === 0 ? deviation.actualSan : null;

  function retry() {
    const { round, leadInUci } = buildMistakeRound(deviation);
    setHintRevealed(null);
    drill.start({ kind: "mistake", round, leadInUci, actualSan: deviation.actualSan });
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">🎯 Correction ciblée — {opening.name}</h2>
          <p className="mt-1 text-xs text-foreground-muted">
            Ta partie, rejouée depuis le premier coup jusqu&apos;à ta déviation.
          </p>
        </div>
        <button type="button" onClick={onExit} className="shrink-0 text-sm text-accent hover:underline">
          ← Retour au journal
        </button>
      </div>

      <div className="mt-5 flex flex-col items-center">
        <div className={`w-full max-w-[420px] ${shaking ? "animate-shake-error" : ""}`}>
          <Chessboard
            options={{
              id: "opening-mistake-board",
              position: drill.fen,
              // Sens du plateau dérivé du camp RÉELLEMENT joué par
              // l'utilisateur dans CETTE partie précise (`deviation.playerColor`,
              // voir `listRepertoireDeviationGames`) — jamais de `opening.side`,
              // qui décrirait le camp générique de l'ouverture, pas forcément
              // celui de cette partie (transposition, ouverture au repli). Le
              // plateau est donc déjà retourné dès le tout premier rendu, avant
              // même que l'autoplay ne commence.
              boardOrientation: deviation.playerColor === "w" ? "white" : "black",
              onPieceDrop: drill.onPieceDrop,
              canDragPiece: drill.canDragPiece,
              // Flèche d'indice automatique (méthode Listudy, voir
              // `use-opening-drill.ts`) — même moteur que `OpeningDrill`,
              // désactivée de la même façon en Manche 2 (`drill.hintsAllowed`,
              // sans objet ici : les corrections ciblées restent à manche
              // unique, mais `drill.hintArrow` le respecte déjà nativement).
              arrows: drill.hintArrow
                ? [{ startSquare: drill.hintArrow.from, endSquare: drill.hintArrow.to, color: "var(--quality-best)" }]
                : [],
            }}
          />
        </div>

        <div className="mt-3 min-h-6 w-full max-w-[420px] text-center text-sm">
          {drill.status === "autoplaying" ? (
            <p className="text-foreground-muted">🔁 Relecture de ta partie…</p>
          ) : drill.status === "finished" ? (
            <p className="font-medium text-foreground">✅ Corrigé !</p>
          ) : null}
        </div>

        {mistakeAlert && (
          <div className="mt-3 w-full max-w-[420px] rounded-md border border-border bg-surface-muted/40 p-3 text-center text-sm text-foreground">
            Dans ta partie avec {deviation.playerColor === "w" ? "les Blancs" : "les Noirs"} contre{" "}
            <span className="font-medium">{deviation.opponentName ?? "ton adversaire"}</span>, tu as joué{" "}
            <span className="font-mono font-semibold">{mistakeAlert}</span>. Trouve le bon coup théorique.
          </div>
        )}

        {!mistakeAlert && drill.status === "playing" && drill.lastPly > 0 && (
          <div className="w-full max-w-[420px]">
            <MoveCommentary openingId={opening.id} ply={drill.lastPly} />
          </div>
        )}
        {drill.status === "autoplaying" && drill.history.length > 0 && (
          <div className="w-full max-w-[420px]">
            <MoveCommentary openingId={opening.id} ply={drill.history.length} />
          </div>
        )}

        {hintCommentary && drill.status === "playing" && hintRevealed !== drill.nextPly && (
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => setHintRevealed(drill.nextPly)}
              className="rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent/20"
            >
              💡 Show hints for this move!
            </button>
          </div>
        )}
        {hintCommentary && drill.status === "playing" && hintRevealed === drill.nextPly && (
          <p className="mt-3 text-center text-xs text-foreground-muted">💡 {hintCommentary.hint}</p>
        )}

        {drill.status === "finished" && (
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={retry}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-surface-muted"
            >
              Rejouer
            </button>
            <button
              type="button"
              onClick={onExit}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              ← Retour au journal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
