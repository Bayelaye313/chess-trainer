"use client";

/**
 * Mode Entraînement / Drill : révision active d'une ouverture — méthode
 * STRICTE façon Listudy, calquée à l'identique sur `opening-mistakes-hub.tsx`
 * (même hook, `use-opening-drill.ts`, voir son docstring pour la mécanique de
 * jugement des coups) :
 *  - un coup correct se joue, le commentaire pédagogique du coup s'affiche
 *    sous l'échiquier, et l'IA répond aussitôt ;
 *  - un coup qui dévie de la variante choisie est refusé — la pièce revient
 *    IMMÉDIATEMENT à sa case de départ (react-chessboard, `onPieceDrop`
 *    renvoie `false`) avec un tremblement + bip d'erreur (`errorPulse`),
 *    JAMAIS de message texte ;
 *  - EN PLUS du bouton d'indice sous l'échiquier (qui révèle le commentaire
 *    pédagogique du coup ATTENDU, `core/curriculum/opening-commentary.ts`,
 *    sans jamais nommer le coup lui-même), une flèche d'indice AUTOMATIQUE
 *    (`drill.hintArrow`) trace la case de départ et d'arrivée du coup
 *    théorique tant qu'il n'a pas été réussi 2 fois par le joueur (méthode
 *    Listudy exacte, voir le docstring de `use-opening-drill.ts`) — une
 *    éventuelle flèche de commentaire tactique (`annotationArrows`, PAS le
 *    coup à jouer) s'affiche à côté, semi-transparente. Les DEUX restent
 *    STRICTEMENT masquées en Manche 2 (`drill.hintsAllowed`), voir plus bas.
 *
 * Interface épurée façon Listudy : l'échiquier au centre, le bouton d'indice
 * et le commentaire juste en dessous, le sélecteur de chapitres (variantes)
 * discrètement sur la colonne de droite — aucune jauge ni barre de
 * progression complexe.
 *
 * Seule interface de `/ouvertures/[slug]` (audit UX du 2026-08-30 —
 * `opening-explorer.tsx` : plus de bac à sable passif à côté, cliquer une
 * ouverture tombe DIRECTEMENT ici, ligne principale auto-démarrée).
 *
 * Protocole en paliers :
 * 1. les chapitres disponibles se choisissent directement dans la colonne de
 *    droite (`ChapterSelector`) ;
 * 2. un "Test Final" enchaîne des positions clés tirées au sort parmi les
 *    variantes déjà pratiquées, pour contrôler la mémorisation globale (voir
 *    `build-final-test.ts`).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Chessboard } from "react-chessboard";
import { buildFinalTestRounds, MIN_ROUND_PLIES, resolvePracticedEntries } from "./build-final-test";
import { findNextUnmasteredVariation, type MasteryCandidate } from "@/core/curriculum/opening-mastery";
import { GENERIC_BOOK_COMMENT, getMoveCommentary } from "@/core/curriculum/opening-commentary";
import {
  findVariationByKey,
  MAIN_LINE_VARIATION_KEY,
  variationKeyFor,
} from "@/core/curriculum/opening-variation-key";
import type { OpeningLine } from "@/core/curriculum/openings";
import type { VariationAccuracy } from "@/server/queries/opening-progress";
import type { AnnotatedPly, OpeningVariation } from "@/server/queries/openings";
import { ChapterSelector } from "./chapter-selector";
import { useErrorShake } from "./error-feedback";
import { MoveCommentary } from "./move-commentary";
import { peekReviewQueueLength, popNextReview } from "./review-queue";
import { type DrillSelection, type HintArrowBehavior, useOpeningDrill } from "./use-opening-drill";

/** Flèche d'indice automatique : coup théorique attendu, pleine et bien visible — voir `drill.hintArrow`. */
const HINT_ARROW_COLOR = "var(--quality-best)";
/** Flèche de commentaire tactique : idée annexe, jamais le coup à jouer — semi-transparente, façon Listudy (voir `CommentaryArrow`). Même teinte que `--quality-okay` (#97af8b), diluée : les tokens CSS du thème n'exposent pas de variante transparente toute faite. */
const COMMENTARY_ARROW_COLOR = "rgba(151, 175, 139, 0.55)";

function SidebarButton({
  title,
  subtitle,
  onClick,
  disabled,
}: {
  title: string;
  subtitle: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full flex-col gap-0.5 rounded-md border border-border px-2.5 py-2 text-left text-sm transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-30"
    >
      <span className="font-medium text-foreground">{title}</span>
      <span className="text-xs text-foreground-muted">{subtitle}</span>
    </button>
  );
}

export function OpeningDrill({
  opening,
  plies,
  variations,
  practicedVariationKeys,
  variationAccuracies,
  autoStart,
  inReviewQueue = false,
  hintBehavior,
  onExit,
}: {
  opening: OpeningLine;
  plies: readonly AnnotatedPly[];
  variations: readonly OpeningVariation[];
  /** Clés des variantes déjà pratiquées au moins une fois (`listPracticedVariationKeys`) — sert le Test Final. */
  practicedVariationKeys: readonly string[];
  /** Dernière précision par variante (`listOpeningVariationAccuracies`) — étoiles du sélecteur et transition automatique vers la prochaine variante non maîtrisée. */
  variationAccuracies: readonly VariationAccuracy[];
  /** Sélection à démarrer immédiatement, sélecteur sauté — voir `OpeningExplorer`/`review-queue.ts`. `null` : lien de file périmé, retombe sur le sélecteur manuel. */
  autoStart?: DrillSelection | null;
  /** `true` si ce drill vient de "⚡ Lancer les révisions du jour" — affiche "Suivant" plutôt que "Changer de variante" une fois fini. */
  inReviewQueue?: boolean;
  /** Pilotage de la flèche d'indice automatique — voir `use-opening-drill.ts`. Omis : méthode Listudy par défaut (`"until_played_twice"`). */
  hintBehavior?: HintArrowBehavior;
  onExit: () => void;
}) {
  const drill = useOpeningDrill({ opening, plies, hintBehavior });
  const router = useRouter();

  // Bouton « Show hints for this move! » — révèle le texte d'aide de
  // `core/curriculum/opening-commentary.ts` (approche Silman : orienter sans
  // jamais donner le coup) AVANT que le joueur ne glisse sa pièce.
  // `revealedHint` retient POUR QUEL coup précis (sélection + ply absolu)
  // l'indice a été demandé — comparé ci-dessous au coup COURANT plutôt que
  // remis à `false` dans un effet (qui déclencherait un rendu en cascade,
  // react-hooks/set-state-in-effect) : un nouveau coup à trouver change
  // naturellement cette comparaison, sans jamais garder l'indice révélé d'un
  // coup à l'autre.
  const [revealedHint, setRevealedHint] = useState<{ selection: DrillSelection; ply: number } | null>(null);

  // Tremblement + bip du plateau sur un coup refusé — jamais de message
  // texte, méthode Listudy stricte (voir le docstring du fichier et
  // `error-feedback.ts`).
  const shaking = useErrorShake(drill.errorPulse);

  const practicedEntries = useMemo(
    () => resolvePracticedEntries(opening, plies, variations, practicedVariationKeys),
    [opening, plies, variations, practicedVariationKeys],
  );

  const accuracyByKey = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of variationAccuracies) map.set(entry.variationKey, entry.lastAccuracy);
    return map;
  }, [variationAccuracies]);

  // Tout le catalogue de cette ouverture (pas seulement les variantes déjà
  // pratiquées, contrairement à `practicedEntries`) — sert de vivier à la
  // transition automatique : une variante jamais essayée doit pouvoir être
  // proposée au même titre qu'une déjà tentée mais pas encore maîtrisée.
  const masteryCandidates = useMemo<MasteryCandidate[]>(
    () => [
      { key: MAIN_LINE_VARIATION_KEY, label: opening.name },
      ...variations.map((variation) => ({
        key: variationKeyFor({ kind: "variation", eco: variation.eco, name: variation.name }),
        label: variation.name,
      })),
    ],
    [opening.name, variations],
  );

  // Démarre automatiquement `autoStart` (une seule fois par valeur — un
  // nouvel `autoStart` signifie qu'on vient de passer à la variante SUIVANTE
  // de la file, voir `goToNextInQueue`, ou une NOUVELLE erreur ciblée choisie
  // dans "Mes erreurs fréquentes", pas de rejouer la même) plutôt que dans
  // `useState(() => ...)` : `variations` (donc `autoStart`) n'est connu qu'après
  // le premier rendu ici, comme tout prop. "random"/"final-test" ne passent
  // jamais par ce mécanisme (déclenchés depuis un bouton du sélecteur déjà
  // monté, pas besoin de survivre à un remontage) — seuls les kinds à clé
  // stable ("main-line"/"variation"/"mistake") sont gérés ici.
  const autoStartedKeyRef = useRef<string | null>(null);
  useEffect(() => {
    // "trap"/"trap-poison" (voir `use-opening-drill.ts`) n'atteignent jamais
    // cet écran en pratique — seul `OpeningTrapDrill` les construit, sur sa
    // propre instance du hook — mais doivent être exclus explicitement ici
    // pour que TypeScript puisse encore réduire `autoStart` aux 3 kinds
    // effectivement gérés par la clé ci-dessous.
    if (
      !autoStart ||
      autoStart.kind === "random" ||
      autoStart.kind === "final-test" ||
      autoStart.kind === "trap" ||
      autoStart.kind === "trap-poison"
    )
      return;
    const key =
      autoStart.kind === "main-line"
        ? variationKeyFor({ kind: "main-line" })
        : autoStart.kind === "variation"
          ? variationKeyFor({ kind: "variation", eco: autoStart.variation.eco, name: autoStart.variation.name })
          : `mistake:${autoStart.round.startFen}:${autoStart.round.script.join(",")}`;
    if (autoStartedKeyRef.current === key) return;
    autoStartedKeyRef.current = key;
    drill.start(autoStart);
  }, [autoStart, drill]);

  // Nombre d'éléments restants dans la file (sessionStorage, voir
  // `review-queue.ts`) — lu directement au rendu, jamais dans un effet : le
  // tout premier rendu serveur a toujours `drill.status === "select"` (voir
  // `useOpeningDrill`), donc cette branche ne s'évalue jamais avant
  // l'hydratation, pas de risque de désaccord serveur/client à retarder.
  const queueRemaining = drill.status === "finished" && inReviewQueue ? peekReviewQueueLength() : 0;

  function goToNextInQueue() {
    const next = popNextReview();
    if (!next) return;
    router.push(`/ouvertures/${next.openingId}?drill=${encodeURIComponent(next.variationKey)}`);
  }

  const selection = drill.selection;

  // Clé de suivi de la sélection COURANTE — `null` en mode Aléatoire/Test
  // Final/Erreur ciblée, jamais suivis en répétition espacée (voir
  // `core/curriculum/opening-variation-key.ts`) : aucune transition
  // automatique à leur sortie, et rien à surligner dans le sélecteur de
  // chapitres.
  const currentTrackedKey: string | null =
    selection?.kind === "main-line"
      ? MAIN_LINE_VARIATION_KEY
      : selection?.kind === "variation"
        ? variationKeyFor({ kind: "variation", eco: selection.variation.eco, name: selection.variation.name })
        : null;

  const isPerfectFinish =
    drill.status === "finished" && drill.score.attempted > 0 && drill.score.correct === drill.score.attempted;

  // Transition automatique (100% de réussite) : propose directement la
  // prochaine variante NON maîtrisée du catalogue, sélecteur sauté — voir
  // `findNextUnmasteredVariation`. `null` si le drill n'est pas trackable, pas
  // parfait, ou si tout le catalogue de cette ouverture est déjà à 3⭐.
  const nextUnmastered =
    isPerfectFinish && currentTrackedKey
      ? findNextUnmasteredVariation(masteryCandidates, accuracyByKey, currentTrackedKey)
      : null;

  function startNextUnmastered() {
    if (!nextUnmastered) return;
    const nextSelection: DrillSelection | null =
      nextUnmastered.key === MAIN_LINE_VARIATION_KEY
        ? { kind: "main-line" }
        : (() => {
            const variation = findVariationByKey(variations, nextUnmastered.key);
            return variation ? { kind: "variation", variation } : null;
          })();
    if (nextSelection) drill.start(nextSelection);
  }

  const canRunFinalTest = practicedEntries.some((entry) => entry.uciMoves.length >= MIN_ROUND_PLIES);
  function startFinalTest() {
    const rounds = buildFinalTestRounds(practicedEntries);
    if (rounds.length > 0) drill.start({ kind: "final-test", rounds });
  }

  const selectionTitle =
    selection === null
      ? null
      : selection.kind === "main-line"
        ? "Ligne principale"
        : selection.kind === "random"
          ? "Aléatoire / Surprise"
          : selection.kind === "final-test"
            ? "Test Final"
            : selection.kind === "mistake"
              ? "Correction ciblée"
              : // "trap"/"trap-poison" n'atteignent jamais cet écran en pratique
                // (voir le commentaire de l'effet ci-dessus) — repli exhaustif
                // pour TypeScript uniquement, jamais affiché.
                selection.kind === "trap" || selection.kind === "trap-poison"
                ? "Piège"
                : selection.variation.name;

  // Indice textuel du prochain coup à trouver — `null` hors sélection
  // scriptée (Aléatoire), le seul cas où AUCUN coup fixe n'existe à
  // indiquer. Repli sur `GENERIC_BOOK_COMMENT` dès que cette position
  // précise n'a pas de contenu dédié (voir `core/curriculum/opening-commentary.ts`)
  // — même convention que le commentaire post-coup (`MoveCommentary`).
  // BUG CORRIGÉ (retour utilisateur direct, « pas de hints ni de guide » sur
  // Zukertort et la plupart des variantes/familles dynamiques) : l'ancienne
  // version masquait carrément le bouton sans contenu dédié — hors des ~20
  // lignes principales curatées à la main, c'est-à-dire la quasi-totalité du
  // catalogue (toute variante nommée, chaque famille `lichess-*`), le bouton
  // « 💡 Show hints for this move! » ne s'affichait alors JAMAIS, laissant
  // la flèche automatique seule porter tout le poids du guidage — et elle
  // seule, en plus, s'éteint après 2 réussites (`HINT_ARROW_SUCCESS_THRESHOLD`).
  const hintCommentary =
    drill.status === "playing" && drill.scriptLength !== null
      ? (getMoveCommentary(opening.id, drill.nextPly) ?? GENERIC_BOOK_COMMENT)
      : null;
  const hintRevealed =
    revealedHint !== null && selection !== null && revealedHint.selection === selection && revealedHint.ply === drill.nextPly;

  // Flèches sur l'échiquier, méthode Listudy exacte : la flèche d'indice
  // automatique (`drill.hintArrow`, case départ/arrivée du coup théorique
  // attendu, pleine) PUIS d'éventuelles flèches de commentaire tactique
  // (`hintCommentary.annotationArrows` — une idée annexe, JAMAIS le coup à
  // jouer, semi-transparentes). Les DEUX disparaissent ENSEMBLE en Manche 2
  // (`drill.hintsAllowed`) : le test à l'aveugle n'autorise aucune aide
  // visuelle, qu'un coup ait déjà été maîtrisé ou non (voir
  // `use-opening-drill.ts`).
  const boardArrows = useMemo(() => {
    if (!drill.hintsAllowed) return [];
    const arrows: { startSquare: string; endSquare: string; color: string }[] = [];
    if (drill.hintArrow) {
      arrows.push({ startSquare: drill.hintArrow.from, endSquare: drill.hintArrow.to, color: HINT_ARROW_COLOR });
    }
    for (const arrow of hintCommentary?.annotationArrows ?? []) {
      arrows.push({ startSquare: arrow.from, endSquare: arrow.to, color: COMMENTARY_ARROW_COLOR });
    }
    return arrows;
  }, [drill.hintsAllowed, drill.hintArrow, hintCommentary]);

  // Alerte "Dans ta partie, tu as joué X" — uniquement pour une correction
  // ciblée, et seulement tant que le joueur n'a pas encore trouvé le bon coup
  // théorique (`plyIndex === 0` : aucun coup interactif joué). Jamais un
  // message d'erreur — juste le rappel du contexte, affiché une fois pour
  // toutes avant la première tentative.
  const mistakeAlert =
    selection?.kind === "mistake" && drill.status === "playing" && drill.plyIndex === 0 ? selection.actualSan : null;

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            🎯 {selectionTitle ? `Entraînement — ${selectionTitle}` : "Mode Entraînement"}
          </h2>
          <p className="mt-1 text-xs text-foreground-muted">
            {selection
              ? `Tu joues ${opening.side === "white" ? "les Blancs" : "les Noirs"}.${
                  selection.kind === "final-test" ? ` Manche ${drill.roundIndex + 1} / ${drill.totalRounds}.` : ""
                }${
                  selection.kind === "main-line" || selection.kind === "variation"
                    ? drill.learningRound === 1
                      ? " Manche 1/2 : apprentissage guidé, indices autorisés."
                      : " Manche 2/2 : test de mémoire."
                    : ""
                }`
              : `L'IA joue ${opening.side === "white" ? "les Noirs" : "les Blancs"} en piochant dans la théorie — à toi de retrouver la suite.`}
          </p>
        </div>
        <button type="button" onClick={onExit} className="shrink-0 text-sm text-accent hover:underline">
          ← Retour
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
        {/* Colonne centrale, épurée : échiquier, bouton d'indice, commentaire — rien d'autre (méthode Listudy, voir le docstring du fichier). */}
        <div className="flex flex-col items-center">
          {selection === null ? (
            <div className="flex aspect-square w-full max-w-[420px] flex-col items-center justify-center rounded-md border border-dashed border-border p-6 text-center text-sm text-foreground-muted">
              👉 Choisis un chapitre à droite pour commencer.
            </div>
          ) : (
            <>
              {drill.scriptLength !== null && drill.status !== "finished" && (
                <p className="mb-2 font-mono text-xs text-foreground-muted">
                  Coup {Math.min(Math.max(drill.plyIndex, 0), drill.scriptLength)} / {drill.scriptLength}
                </p>
              )}

              {/* Notification transitoire Manche 1 → Manche 2 — voir le
                  docstring de `drill.roundTransitionNotice` dans
                  `use-opening-drill.ts` : le garde-fou de fin de théorie
                  (script épuisé OU plus aucune continuation connue dans
                  l'arbre fusionné, ex. Zukertort/Défense Benima) DOIT se voir
                  à l'écran, jamais un simple reset silencieux du plateau. */}
              {drill.roundTransitionNotice && (
                <div className="mb-2 w-full max-w-[420px] rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-center text-sm font-medium text-foreground">
                  {drill.roundTransitionNotice}
                </div>
              )}

              <div className={`w-full max-w-[420px] ${shaking ? "animate-shake-error" : ""}`}>
                <Chessboard
                  options={{
                    id: "opening-drill-board",
                    position: drill.fen,
                    boardOrientation: drill.userColor === "w" ? "white" : "black",
                    onPieceDrop: drill.onPieceDrop,
                    canDragPiece: drill.canDragPiece,
                    arrows: boardArrows,
                  }}
                />
              </div>

              <div className="mt-3 min-h-6 w-full max-w-[420px] text-center text-sm">
                {drill.status === "autoplaying" ? (
                  <p className="text-foreground-muted">🔁 Relecture de ta partie…</p>
                ) : drill.status === "finished" ? (
                  <p className="font-medium text-foreground">
                    {isPerfectFinish
                      ? "⭐⭐⭐ Variante maîtrisée, sans faute !"
                      : selection.kind === "final-test"
                        ? "Test Final terminé !"
                        : drill.finishReason === "line-complete"
                          ? "Ligne terminée !"
                          : "Fin de la théorie cataloguée — bravo d'être allé aussi loin."}
                  </p>
                ) : null}
              </div>

              {mistakeAlert && (
                <div className="mt-3 w-full max-w-[420px] rounded-md border border-border bg-surface-muted/40 p-3 text-center text-sm text-foreground">
                  Dans ta partie, tu as joué <span className="font-mono font-semibold">{mistakeAlert}</span>. Trouve le
                  bon coup théorique.
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

              {/* Bouton « Show hints for this move! » — EN PLUS de la flèche
                  d'indice automatique (`boardArrows`/`drill.hintArrow`) déjà
                  posée sur l'échiquier tant que ce coup n'a pas été maîtrisé,
                  ce bouton révèle un texte qui oriente vers l'IDÉE du coup,
                  jamais le coup lui-même (méthode Listudy, voir le docstring
                  du fichier). DÉSACTIVÉ en Manche 2 (`drill.hintsAllowed`),
                  comme la flèche : le protocole en 2 manches exige alors de
                  retrouver toute la ligne de mémoire, voir `use-opening-drill.ts`. */}
              {hintCommentary && drill.hintsAllowed && !hintRevealed && (
                <div className="mt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setRevealedHint({ selection, ply: drill.nextPly })}
                    className="rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent/20"
                  >
                    💡 Afficher l&apos;indice de ce coup !
                  </button>
                </div>
              )}
              {hintCommentary && drill.hintsAllowed && hintRevealed && (
                <p className="mt-3 text-center text-xs text-foreground-muted">💡 {hintCommentary.hint}</p>
              )}
              {/* Protocole "Retenter sans guide" (Manche 2) — TOUJOURS affiché
                  dès que les indices sont coupés, indépendamment de
                  `hintCommentary` (qui peut manquer pour tel ou tel coup) :
                  la demande explicite de rejouer sans aucune aide ne doit
                  jamais dépendre du contenu pédagogique disponible. */}
              {!drill.hintsAllowed && (
                <p className="mt-3 text-center text-xs font-medium text-foreground-muted">
                  🔒 Manche 2 — Retenter sans guide : aucune flèche, aucun indice, retrouve toute la ligne de mémoire.
                </p>
              )}

              {/* `null` en mode Aléatoire/Test Final/Erreur ciblée (jamais suivis, voir `use-opening-drill.ts`) et tant que la Server Action n'a pas répondu. */}
              {drill.status === "finished" && drill.progressResult && (
                <p className="mt-3 text-center text-xs text-foreground-muted">
                  {drill.score.correct} / {drill.score.attempted} coups théoriques trouvés — série{" "}
                  {drill.progressResult.streak} 🔥, prochaine révision{" "}
                  {drill.progressResult.nextReviewInDays === 0 ? "aujourd'hui" : `dans ${drill.progressResult.nextReviewInDays} j`}
                </p>
              )}
              {drill.status === "finished" && !drill.progressResult && selection.kind !== "random" && (
                <p className="mt-3 text-center text-xs text-foreground-muted">
                  {drill.score.correct} / {drill.score.attempted} coups théoriques trouvés
                </p>
              )}

              {drill.status === "finished" && (
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  {inReviewQueue && queueRemaining > 0 ? (
                    <button
                      type="button"
                      onClick={goToNextInQueue}
                      className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
                    >
                      Suivant de la file ({queueRemaining} restant{queueRemaining > 1 ? "s" : ""}) →
                    </button>
                  ) : inReviewQueue ? (
                    <p className="rounded-md border border-best/40 bg-best/10 px-4 py-2 text-sm font-medium text-best">
                      🎉 Révisions du jour terminées !
                    </p>
                  ) : nextUnmastered ? (
                    // Transition automatique : une variante à 100% enchaîne
                    // directement sur la prochaine non maîtrisée du catalogue,
                    // sélecteur sauté — voir `findNextUnmasteredVariation`.
                    <button
                      type="button"
                      onClick={startNextUnmastered}
                      className="rounded-md bg-best px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
                    >
                      ✨ Continuer avec « {nextUnmastered.label} » →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => drill.start(selection)}
                      className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
                    >
                      Recommencer
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Colonne de droite, discrète : chapitres, Aléatoire, Test Final — façon Listudy. */}
        <aside className="space-y-4 lg:border-l lg:border-border lg:pl-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">Chapitres</p>
            <div className="mt-2">
              <ChapterSelector
                mainLineLabel={opening.name}
                mainLineEco={opening.eco}
                variations={variations}
                accuracyByKey={accuracyByKey}
                activeKey={currentTrackedKey}
                onSelect={(next) =>
                  drill.start(next.kind === "main-line" ? { kind: "main-line" } : { kind: "variation", variation: next.variation })
                }
              />
            </div>
          </div>

          <SidebarButton
            title="🎲 Aléatoire / Surprise"
            subtitle="Toute suite théorique connue"
            onClick={() => drill.start({ kind: "random" })}
          />

          <div className="border-t border-border pt-3">
            <SidebarButton
              title="🏁 Test Final"
              subtitle={
                canRunFinalTest
                  ? "Positions clés tirées au sort parmi tes chapitres déjà pratiqués"
                  : "Pratique d'abord au moins un chapitre pour le débloquer"
              }
              onClick={startFinalTest}
              disabled={!canRunFinalTest}
            />
          </div>

          {selection && drill.history.length > 0 && (
            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">Historique</p>
              <ol className="mt-2 flex flex-wrap gap-x-1.5 gap-y-1 font-mono text-xs text-foreground-muted">
                {drill.history.map((entry) => (
                  <li key={entry.ply}>
                    {entry.ply % 2 === 1 && <span className="mr-1">{Math.ceil(entry.ply / 2)}.</span>}
                    {entry.san}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
