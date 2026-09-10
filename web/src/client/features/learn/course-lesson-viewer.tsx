"use client";

/**
 * Lecteur d'un `CourseLesson` (`core/curriculum/course-lesson.ts`) — la
 * version « étude Lichess complète » de `ThemeDemoBoard` : on TOURNE LES
 * PAGES d'un vrai cours à plusieurs chapitres, chacun sa position réelle et
 * son commentaire affiché en texte à côté du diagramme.
 *
 * Cahier des charges du 2026-09-09 : « les cours ont des échiquiers figés
 * sans flèches, ni possibilité pour l'utilisateur de tenter de trouver le bon
 * coup, de retenter, etc. » — chaque chapitre qui porte un `moveSan` (le
 * PRÉFIXE RÉEL de la partie/ligne source, voir le docstring de
 * `course-lesson.ts`) devient donc un mini défi « devine le coup », un pli à
 * la fois : le joueur doit déplacer lui-même la bonne pièce (l'échiquier
 * refuse tout autre coup, comme `usePuzzleSolver` — la pièce revient à sa
 * case), avec un bouton Indice (flèche verte) et un bouton Voir (dévoile la
 * suite sans la rejouer) pour ne jamais bloquer la lecture. `moveSan` reste
 * du texte pur dans les données (`course-lesson.ts` n'importe toujours pas
 * chess.js) — c'est CE composant qui rejoue chaque coup avec chess.js au
 * rendu pour en tirer les cases de départ/arrivée réelles.
 *
 * Correctif du 2026-09-09 (retour direct après la première version) : deux
 * défauts signalés — (1) rien n'indiquait quelle couleur doit jouer, (2)
 * `moveSan` alterne les DEUX camps (c'est le PGN réel de la partie, coups
 * noirs compris — voir le docstring de `course-lesson.ts`), et l'ancienne
 * version demandait de trouver aussi les réponses adverses. Désormais : la
 * couleur du joueur = la couleur qui a le trait sur `step.fen` (celle qui
 * ouvre le chapitre) ; seuls SES plis sont un défi à trouver, les plis de
 * l'autre camp se rejouent tout seuls après une pause courte
 * (`OPPONENT_REPLY_DELAY_MS`, même ressort que `usePuzzleSolver`). Un
 * bandeau annonce systématiquement la couleur en jeu (« À toi de jouer,
 * Blancs » / « Réponse des Noirs… » / « Trait aux Blancs » pour les
 * chapitres sans défi).
 *
 * Les chapitres SANS `moveSan` (purement explicatifs, ex. « Plan noir 2 :
 * ... ») restent en lecture seule — rien à y trouver, `canDragPiece` renvoie
 * toujours `false` pour eux.
 *
 * `onComplete` prévient le parent (`ThemeLesson`) une seule fois, dès que le
 * dernier chapitre est atteint — même contrat que `ThemeDemoBoard`, pour
 * débloquer le bouton « Passer aux exercices ». Atteindre le dernier
 * chapitre ne demande jamais d'avoir résolu son défi : Précédent/Suivant
 * navigue librement, comme avant.
 *
 * Retour utilisateur du 2026-09-09 : « l'échiquier reste figé noir en haut,
 * blanc en bas, alors que parfois le trait est aux blancs » + « au lieu de
 * figer les pièces sur un mauvais coup, laisse l'utilisateur bouger, fais le
 * bip d'erreur, et dis-lui de reprendre » — deux correctifs :
 *  (1) `boardOrientation` suit désormais le camp qui a le trait sur
 *      `step.fen` (`turnOf`) — jamais fixé sur Blancs, cohérent avec
 *      `PuzzleBoard` qui oriente déjà sur `solver.playerColor` ;
 *  (2) un coup faux n'est plus rejeté en silence (`onPieceDrop` renvoyant
 *      `false`, la pièce revenant instantanément sans avoir vraiment
 *      « bougé ») : on ACCEPTE le drop pour que `react-chessboard` anime la
 *      pièce jusqu'à la case jouée (voir son mécanisme de « manual drop »
 *      optimiste), moyennant un aperçu de position calculé nous-mêmes
 *      (`previewWrongMove`, chess.js `remove`/`put` — jamais un coup légal
 *      exigé, un simple aperçu visuel), puis on la fait revenir à sa case
 *      après `WRONG_MOVE_REVERT_MS`, tremblement + bip d'erreur à l'appui
 *      (`useErrorShake`, déjà utilisé par le Mode Entraînement des
 *      ouvertures — un seul mécanisme de « coup refusé » dans toute l'appli,
 *      jamais réinventé ici).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Chess, type Square } from "chess.js";
import { Chessboard, type PieceDropHandlerArgs, type PieceHandlerArgs } from "react-chessboard";
import { useErrorShake } from "@/client/features/openings/error-feedback";
import type { CourseArrow, CourseHighlight, CourseLesson, CourseStep } from "@/core/curriculum/course-lesson";

const GREEN = "var(--quality-best)";
const RED = "var(--quality-blunder)";

/** Même ordre de grandeur que `usePuzzleSolver` (`OPPONENT_REPLY_DELAY_MS`) — assez court pour ne pas faire attendre, assez long pour être vu. */
const OPPONENT_REPLY_DELAY_MS = 550;
/** Temps pendant lequel un coup faux reste visible sur l'échiquier avant de revenir à sa case — assez long pour que l'œil enregistre le coup joué, jamais assez pour ressembler à un coup accepté. */
const WRONG_MOVE_REVERT_MS = 500;

const HINT_BUTTON_CLASS =
  "rounded border border-border px-2 py-0.5 text-[11px] font-medium text-foreground-muted hover:bg-surface-muted hover:text-foreground";

function neverDraggable(_args: PieceHandlerArgs): boolean {
  return false;
}

function turnOf(fen: string): "w" | "b" {
  return fen.split(" ")[1] === "b" ? "b" : "w";
}

function sideLabel(color: "w" | "b"): string {
  return color === "w" ? "Blancs" : "Noirs";
}

interface MovePly {
  san: string;
  from: string;
  to: string;
  /** Camp qui joue CE pli — sert à distinguer « à toi de jouer » de « réponse adverse, auto-jouée ». */
  color: "w" | "b";
  /** Position AVANT ce pli — c'est elle qu'affiche le diagramme tant que ce pli n'est pas trouvé/auto-joué. */
  fenBefore: string;
  /** Position APRÈS ce pli — sert de `fenBefore` au pli suivant, ou de position finale affichée une fois le défi résolu. */
  fenAfter: string;
}

/**
 * Rejoue `moveSan` depuis `fen` avec chess.js pour en tirer les cases
 * départ/arrivée de chaque pli. `moveSan` est déjà vérifié légal depuis `fen`
 * par `course-lesson.test.ts` — jamais de coup inventé ici.
 */
function buildMovePlan(fen: string, moveSan: readonly string[] | undefined): MovePly[] {
  if (!moveSan || moveSan.length === 0) return [];
  const chess = new Chess(fen);
  const plies: MovePly[] = [];
  for (const san of moveSan) {
    const fenBefore = chess.fen();
    const color = turnOf(fenBefore);
    const move = chess.move(san);
    plies.push({ san, from: move.from, to: move.to, color, fenBefore, fenAfter: chess.fen() });
  }
  return plies;
}

/**
 * Aperçu visuel d'un coup FAUX : déplace la pièce de `from` vers `to` sans
 * passer par `chess.move` (qui rejetterait tout coup non légal, exactement
 * ce qu'on affiche ici) — un simple `remove`/`put` chess.js, jamais un coup
 * réellement joué dans une partie. `null` si la case de départ ne porte
 * aucune pièce (ne devrait pas arriver, `canDragPiece` restreint déjà le
 * glisser-déposer à la pièce attendue) ou si `put` échoue (ex. case hors
 * échiquier) — l'appelant retombe alors sur l'ancien comportement (coup
 * refusé sans anecdote visuelle) plutôt que de planter.
 */
function previewWrongMove(fen: string, from: string, to: string): string | null {
  try {
    const chess = new Chess(fen);
    const piece = chess.remove(from as Square);
    if (!piece) return null;
    chess.remove(to as Square);
    if (!chess.put({ type: piece.type, color: piece.color }, to as Square)) return null;
    return chess.fen();
  } catch {
    return null;
  }
}

/**
 * Échiquier + défi « devine le coup » d'UN chapitre.
 *
 * `step` change à chaque Précédent/Suivant, mais ce composant N'EST JAMAIS
 * remonté pour autant (pas de `key={stepIndex}` côté appelant, exprès) : le
 * défi est réinitialisé par un simple `useEffect`, exactement comme
 * `ThemeDemoBoard`/`MotifIntroBoard` gardent UN SEUL `<Chessboard>` monté en
 * continu pour tout le parcours. Démonter/remonter `<Chessboard>` à chaque
 * chapitre (essayé, puis retiré) fait dupliquer ses pièces en interne — la
 * lib anime ses propres transitions de position et n'aime pas être détruite
 * puis recréée à répétition (avertissement React « two children with the
 * same key » observé en pratique, échiquiers superposés à l'écran).
 */
function CourseStepBoard({ step }: { step: CourseStep }) {
  const movePlan = useMemo(() => buildMovePlan(step.fen, step.moveSan), [step]);
  const hasChallenge = movePlan.length > 0;
  // Le joueur trouve les coups du camp qui a le trait sur `step.fen` — l'autre
  // camp, ce sont ses réponses réelles, auto-jouées. Toujours égal à
  // `turnOf(step.fen)` (le premier pli du plan s'ouvre forcément sur cette
  // même position) : une seule source de vérité, réutilisée aussi pour
  // orienter l'échiquier ci-dessous — jamais figé sur Blancs.
  const playerColor: "w" | "b" = turnOf(step.fen);

  const [plyIndex, setPlyIndex] = useState(0);
  const [wrongAttempt, setWrongAttempt] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  // Aperçu du dernier coup FAUX joué (voir `previewWrongMove`) — tant qu'il
  // est non-`null`, remplace `displayFen` pour que la pièce reste visible sur
  // la case jouée avant de revenir à sa place. `errorPulse` (incrémenté à
  // CHAQUE mauvais essai, même vers la même case deux fois de suite) pilote à
  // la fois le minuteur de retour et le tremblement/bip (`useErrorShake`).
  const [wrongPreviewFen, setWrongPreviewFen] = useState<string | null>(null);
  const [errorPulse, setErrorPulse] = useState(0);
  const shaking = useErrorShake(errorPulse);

  // Réinitialise le défi au changement de chapitre — « ajuster l'état pendant
  // le rendu » (le pattern recommandé par React pour repartir à zéro quand un
  // prop change, sans le coût d'un rendu supplémentaire ni le
  // `setState`-synchrone-dans-un-effet que ça donnerait avec `useEffect`).
  const [prevStep, setPrevStep] = useState(step);
  if (prevStep !== step) {
    setPrevStep(step);
    setPlyIndex(0);
    setWrongAttempt(false);
    setHintShown(false);
    setWrongPreviewFen(null);
  }

  const solved = !hasChallenge || plyIndex >= movePlan.length;
  const currentPly = hasChallenge && !solved ? movePlan[plyIndex] : undefined;
  const isPlayerTurn = currentPly?.color === playerColor;
  const displayFen =
    wrongPreviewFen ?? (hasChallenge ? (plyIndex < movePlan.length ? movePlan[plyIndex].fenBefore : movePlan[movePlan.length - 1].fenAfter) : step.fen);

  // Réponses adverses : jamais à trouver, elles se rejouent toutes seules après une pause courte — comme `usePuzzleSolver`.
  useEffect(() => {
    if (!currentPly || isPlayerTurn) return;
    const timer = setTimeout(() => {
      setPlyIndex((index) => index + 1);
      setWrongAttempt(false);
      setHintShown(false);
    }, OPPONENT_REPLY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [currentPly, isPlayerTurn]);

  // Fait revenir la pièce d'un coup faux à sa case après `WRONG_MOVE_REVERT_MS`
  // — dépend de `errorPulse` (pas seulement de `wrongPreviewFen`) pour se
  // redéclencher même si le joueur retente EXACTEMENT le même mauvais coup.
  useEffect(() => {
    if (wrongPreviewFen === null) return;
    const timer = setTimeout(() => setWrongPreviewFen(null), WRONG_MOVE_REVERT_MS);
    return () => clearTimeout(timer);
  }, [wrongPreviewFen, errorPulse]);

  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean {
    if (!currentPly || !isPlayerTurn || !targetSquare) return false;
    const matches = sourceSquare === currentPly.from && targetSquare === currentPly.to;
    if (matches) {
      setPlyIndex((index) => index + 1);
      setWrongAttempt(false);
      setHintShown(false);
      setWrongPreviewFen(null);
      return true;
    }
    // Retour utilisateur : « laisse l'utilisateur bouger » — on accepte le
    // drop pour que la pièce ANIME jusqu'à la case jouée plutôt que de se
    // figer instantanément, `displayFen` bascule sur l'aperçu du coup faux le
    // temps de `WRONG_MOVE_REVERT_MS`. Si l'aperçu échoue (cas limite, voir
    // `previewWrongMove`), on retombe sur l'ancien comportement — coup
    // refusé, la pièce ne quitte jamais sa case.
    const preview = previewWrongMove(currentPly.fenBefore, sourceSquare, targetSquare);
    setWrongAttempt(true);
    setErrorPulse((pulse) => pulse + 1);
    if (preview) setWrongPreviewFen(preview);
    return preview !== null;
  }

  function canDragPiece({ square }: PieceHandlerArgs): boolean {
    return isPlayerTurn && currentPly?.from === square;
  }

  function revealAll() {
    setPlyIndex(movePlan.length);
    setWrongAttempt(false);
    setHintShown(false);
    setWrongPreviewFen(null);
  }

  function retry() {
    setPlyIndex(0);
    setWrongAttempt(false);
    setHintShown(false);
    setWrongPreviewFen(null);
  }

  // Tant que le défi n'est ni résolu ni indicé, on cache les flèches/surbrillances
  // de la donnée : les montrer donnerait la réponse avant même l'essai.
  const showAnnotations = !hasChallenge || solved || hintShown;
  const dataArrows: readonly CourseArrow[] = showAnnotations ? (step.arrows ?? []) : [];
  const dataHighlights: readonly CourseHighlight[] = showAnnotations ? (step.highlights ?? []) : [];
  // Un indice ne porte que sur LE coup du joueur, jamais sur une réponse adverse déjà auto-jouée sans qu'on ait rien à y trouver.
  const hintArrow: CourseArrow[] =
    isPlayerTurn && hintShown && currentPly ? [{ from: currentPly.from, to: currentPly.to, color: "green" }] : [];

  const arrows = [...dataArrows, ...hintArrow].map((arrow) => ({
    startSquare: arrow.from,
    endSquare: arrow.to,
    color: arrow.color === "red" ? RED : GREEN,
  }));

  const squareStyles: Record<string, { backgroundColor: string }> = {};
  for (const highlight of dataHighlights) {
    squareStyles[highlight.square] = { backgroundColor: highlight.color === "red" ? "rgba(239, 68, 68, 0.35)" : "rgba(34, 197, 94, 0.35)" };
  }

  return (
    <div className={`w-full shrink-0 sm:w-[360px] ${shaking ? "animate-shake-error" : ""}`}>
      <Chessboard
        options={{
          id: "course-lesson-board",
          position: displayFen,
          // Oriente toujours vers le camp qui a le trait sur ce chapitre —
          // jamais figé sur Blancs (retour utilisateur du 2026-09-09).
          boardOrientation: playerColor === "w" ? "white" : "black",
          canDragPiece: hasChallenge ? canDragPiece : neverDraggable,
          onPieceDrop: hasChallenge ? onPieceDrop : undefined,
          arrows,
          squareStyles,
        }}
      />
      {!hasChallenge && (
        <p className="mt-1.5 text-[11px] text-foreground-muted">
          <span aria-hidden="true">♟ </span>Trait aux {sideLabel(turnOf(step.fen))}
        </p>
      )}
      {hasChallenge && !solved && currentPly && (
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="text-[11px] text-foreground-muted">
            {isPlayerTurn ? (
              <>
                <span aria-hidden="true">🎯 </span>À toi de jouer, {sideLabel(playerColor)} — coup {plyIndex + 1}/{movePlan.length}
              </>
            ) : (
              <>
                <span aria-hidden="true">⏳ </span>Réponse des {sideLabel(currentPly.color)}…
              </>
            )}
          </span>
          <div className="flex shrink-0 gap-1.5">
            {isPlayerTurn && (
              <button type="button" onClick={() => setHintShown(true)} disabled={hintShown} className={`${HINT_BUTTON_CLASS} disabled:opacity-40`}>
                💡 Indice
              </button>
            )}
            <button type="button" onClick={revealAll} className={HINT_BUTTON_CLASS}>
              ⏭ Voir
            </button>
          </div>
        </div>
      )}
      {wrongAttempt && (
        <p className="mt-1 text-[11px] font-medium text-inaccuracy">Pas ce coup — la pièce revient à sa place, reprends.</p>
      )}
      {hasChallenge && solved && (
        <p className="mt-1.5 text-[11px] text-foreground-muted">
          <span aria-hidden="true">✓ </span>
          Tu jouais les {sideLabel(playerColor)} — coup{movePlan.length > 1 ? "s" : ""} trouvé{movePlan.length > 1 ? "s" : ""} :{" "}
          {movePlan.map((ply) => ply.san).join(" ")}
          {" — "}
          <button type="button" onClick={retry} className="underline hover:text-foreground">
            ↺ retenter
          </button>
        </p>
      )}
    </div>
  );
}

export function CourseLessonViewer({ lesson, onComplete }: { lesson: CourseLesson; onComplete?: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = lesson.steps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === lesson.steps.length - 1;

  // Un seul appel à `onComplete`, même si le joueur revient en arrière ensuite
  // — même garde que `ThemeDemoBoard` (`notifiedRef`).
  const notifiedRef = useRef(false);
  useEffect(() => {
    if (isLastStep && !notifiedRef.current) {
      notifiedRef.current = true;
      onComplete?.();
    }
  }, [isLastStep, onComplete]);

  return (
    <div className="mx-auto w-full max-w-[760px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <CourseStepBoard step={step} />
        <div key={stepIndex} className="min-w-0 flex-1 animate-fade-up-in">
          <p className="text-sm font-semibold text-foreground">
            Chapitre {stepIndex + 1}/{lesson.steps.length} — {step.title}
          </p>
          <p className="mt-2 max-h-[26rem] overflow-y-auto rounded-md border border-border bg-surface-muted/40 p-3 text-sm leading-relaxed text-foreground">
            {step.text}
          </p>
        </div>
      </div>
      <div className="mt-2 flex justify-center gap-1.5" aria-hidden="true">
        {lesson.steps.map((_, index) => (
          <span
            key={index}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${index === stepIndex ? "bg-accent" : "bg-border"}`}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setStepIndex((index) => Math.max(index - 1, 0))}
          disabled={isFirstStep}
          className="rounded-md border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Précédent
        </button>
        <button
          type="button"
          onClick={() => setStepIndex((index) => Math.min(index + 1, lesson.steps.length - 1))}
          disabled={isLastStep}
          className="rounded-md border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
