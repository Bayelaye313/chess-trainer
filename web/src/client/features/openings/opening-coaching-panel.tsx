"use client";

/**
 * HUD de coaching temps réel du Mode Entraînement (`/ouvertures/[slug]`,
 * `OpeningDrill`) — cahier des charges du 2026-09-12 (« hydratation de
 * l'arbre d'ouverture »), UNIFIÉ le 2026-09-13 (« Scotch Traps Pipeline ») :
 * jusqu'ici DEUX flux de commentaire coexistaient sous l'échiquier — ce
 * panneau (`philosophy`/`strategicObjective`/`engineSuggestion`, voir
 * `core/chess/pgn-tree.ts`) ET un second bloc séparé (`MoveCommentary`, le
 * commentaire plat par coup de `core/curriculum/opening-commentary.ts` ou son
 * repli heuristique) — redondants, parfois contradictoires sur la même
 * position. Il n'y a plus désormais QU'UN SEUL flux d'explication ici :
 *  1. un "Briefing Théorique" — nom de variante, et SOIT la philosophie/
 *     l'objectif tactique rédigés pour ce nœud précis (contenu le plus riche,
 *     prioritaire), SOIT à défaut le commentaire plat du coup qui y mène
 *     (`moveComment`, fourni par le parent — voir son docstring) ;
 *  2. la suggestion moteur du nœud courant + le bouton "Vision Moteur" qui en
 *     pilote l'affichage sur l'échiquier (la flèche elle-même est dessinée
 *     par `OpeningDrill`, seul propriétaire du `<Chessboard>` — ce panneau ne
 *     fait qu'exposer la donnée et le bouton, voir `onToggleEngineArrow`) ;
 *  3. un "Mini-Tree Previewer" (fil d'ariane de la manche + bifurcations
 *     connues depuis la position affichée) et l'alerte de "Trap Exploration"
 *     réactive (`trapPunishment`, voir `use-opening-drill.ts`) pendant la
 *     démonstration de la ligne punitive d'un piège DOCUMENTÉ
 *     (`core/curriculum/traps.ts`).
 *
 * `use-opening-coaching-briefing.ts` (même patron que `use-book-continuations.ts`,
 * aucun `setState` synchrone dans un effet) est appelé UNE SEULE FOIS, par le
 * PARENT (`OpeningDrill`) — jamais ici : `OpeningDrill` a de toute façon déjà
 * besoin de `engineSuggestion` pour fusionner la flèche moteur dans
 * `boardArrows` (seul propriétaire du `<Chessboard>`), un second appel dans ce
 * panneau dupliquerait purement et simplement la même requête réseau à
 * chaque coup. Ce composant reste donc un pur `props -> JSX`, mémoïsé
 * (`React.memo`) pour ne jamais re-rendre à un changement d'`OpeningDrill`
 * qui ne concerne pas le coaching (ex. tremblement d'erreur du plateau).
 *
 * Fondu croisé du Briefing Théorique : `motion/react` (`AnimatePresence
 * mode="wait"`), même patron déjà en place dans `academy-puzzle-arena.tsx` —
 * entièrement déclaratif via `key`, aucun état ni effet à gérer ici.
 */
import { AnimatePresence, motion } from "motion/react";
import { memo } from "react";
import type { OpeningSide } from "@/core/curriculum/openings";
import type { OpeningTrap } from "@/core/curriculum/traps";
import type { OpeningCoachingBriefingState } from "./use-opening-coaching-briefing";

function EngineArrowToggle({
  enabled,
  onToggle,
  disabled,
}: {
  enabled: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      disabled={disabled}
      title={disabled ? "Aucune suggestion moteur pour cette position" : "Afficher/masquer la flèche du moteur"}
      className="flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-foreground-muted transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span
        aria-hidden="true"
        className="relative h-4 w-7 shrink-0 rounded-full transition-colors"
        style={{ backgroundColor: enabled ? "var(--engine-arrow-best)" : "var(--surface-muted)" }}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-3.5" : "translate-x-0.5"
          }`}
        />
      </span>
      👁️ Vision Moteur
    </button>
  );
}

export interface OpeningCoachingPanelProps {
  openingName: string;
  side: OpeningSide;
  /** FEN affichée à l'instant — repli du briefing tant que `briefingState` n'a pas encore résolu pour CETTE position (voir `briefingFen` plus bas). */
  fen: string;
  /** Calculé par le PARENT (`useOpeningCoachingBriefing`, voir le docstring du fichier) — jamais par ce composant. */
  briefingState: OpeningCoachingBriefingState;
  /** Coups SAN déjà joués dans la partie interactive courante (`drill.history`, autoplay exclu) — sert le fil d'ariane. */
  sanHistory: readonly string[];
  /** Libellé de repli tant qu'aucun `VariationNode.comment` dédié ne nomme CE nœud précis (le titre de sélection déjà affiché par `OpeningDrill`, ex. « Ligne principale »). */
  fallbackVariationLabel: string | null;
  /**
   * Commentaire plat du dernier coup joué (`core/curriculum/opening-commentary.ts`
   * ou son repli heuristique, calculé par le PARENT — voir le docstring du
   * fichier) — UNIQUE repli du Briefing Théorique quand ce nœud n'a pas de
   * `philosophy`/`strategicObjective` rédigés : plus jamais un second bloc
   * séparé sous l'échiquier (`MoveCommentary`, désormais retiré d'`OpeningDrill`).
   * `null` avant le premier coup, ou si le parent n'a rien à proposer.
   */
  moveComment: string | null;
  /** Démonstration de piège documenté EN COURS (`use-opening-drill.ts#trapPunishment`) — `null` la plupart du temps. Pilote l'alerte + `.animate-trap-alert` ci-dessous ; `nonce` sert de `key` pour rejouer le flash à coup sûr. */
  trapPunishment: { trap: OpeningTrap; nonce: number } | null;
  /** La flèche de suggestion moteur est-elle affichée sur l'échiquier ? Piloté par le parent, qui seul dessine les flèches (`boardArrows` d'`OpeningDrill`). */
  engineArrowEnabled: boolean;
  onToggleEngineArrow: () => void;
}

export const OpeningCoachingPanel = memo(function OpeningCoachingPanel({
  openingName,
  side,
  fen,
  briefingState,
  sanHistory,
  fallbackVariationLabel,
  moveComment,
  trapPunishment,
  engineArrowEnabled,
  onToggleEngineArrow,
}: OpeningCoachingPanelProps) {
  // La liste précédente reste affichée pendant qu'une nouvelle arrive (voir le
  // docstring de `use-opening-coaching-briefing.ts`) — `briefingFen` reflète
  // la position à laquelle `briefing` correspond VRAIMENT, jamais `fen` telle
  // quelle : sert de clé de fondu croisé pour ne transitionner qu'à l'arrivée
  // réelle des nouvelles données, jamais un instant plus tôt sur un contenu
  // encore périmé.
  const briefing = briefingState.status === "ready" ? briefingState.briefing : null;
  const briefingFen = briefingState.status === "ready" ? briefingState.fen : fen;

  const variationLabel = briefing?.variationName ?? fallbackVariationLabel ?? openingName;
  const hasWrittenContent = Boolean(briefing?.philosophy || briefing?.strategicObjective);
  const alternatives = briefing?.alternatives ?? [];
  const namedAlternatives = alternatives.filter((a) => a.variationName);

  return (
    <aside className="flex w-full flex-col gap-4 rounded-lg border border-border bg-surface p-4 lg:w-[280px]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">🧑‍🏫 Coach</p>
        <EngineArrowToggle
          enabled={engineArrowEnabled}
          onToggle={onToggleEngineArrow}
          disabled={!briefing?.engineSuggestion}
        />
      </div>

      {/* Briefing Théorique — fondu croisé sans layout shift : `min-h` amortit
          le déplacement du contenu sous la carte (des textes de longueurs
          différentes ne peuvent pas partager exactement la même hauteur),
          `AnimatePresence mode="wait"` évite que deux versions se superposent. */}
      <div className="min-h-[136px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${briefingFen}:${variationLabel}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="rounded-md border border-accent/30 bg-accent/5 p-3"
          >
            <p className="text-sm font-semibold text-foreground">{variationLabel}</p>
            <p className="mt-0.5 text-[11px] text-foreground-muted">
              Tu joues {side === "white" ? "les Blancs" : "les Noirs"}.
            </p>
            {hasWrittenContent ? (
              <div className="mt-2 space-y-2 text-xs leading-relaxed text-foreground-muted">
                {briefing?.philosophy && (
                  <p>
                    <span className="font-semibold text-foreground">Philosophie — </span>
                    {briefing.philosophy}
                  </p>
                )}
                {briefing?.strategicObjective && (
                  <p>
                    <span className="font-semibold text-foreground">Objectif du coup — </span>
                    {briefing.strategicObjective}
                  </p>
                )}
              </div>
            ) : moveComment ? (
              // Repli UNIQUE (voir le docstring du fichier) : le commentaire
              // plat du coup qui mène à ce nœud, quand il n'a pas de
              // philosophy/strategicObjective rédigés dédiés.
              <p className="mt-2 text-xs leading-relaxed text-foreground-muted">{moveComment}</p>
            ) : (
              <p className="mt-2 text-xs italic text-foreground-muted">
                Cette position sort du contenu théorique rédigé — continue d&apos;explorer, ou fie-toi à la
                suggestion moteur ci-dessous si elle est disponible.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {briefing?.engineSuggestion && (
        <p className="text-xs text-foreground-muted">
          <span className="font-semibold" style={{ color: "var(--engine-arrow-best)" }}>
            ⚙ Suggestion moteur —
          </span>{" "}
          <span className="font-mono">{briefing.engineSuggestion.san}</span>
          {!engineArrowEnabled && " (flèche masquée, voir « Vision Moteur »)"}
        </p>
      )}

      {alternatives.length > 1 && (
        <div className="rounded-md border border-border bg-surface-muted/40 p-2.5 text-xs text-foreground-muted">
          <p className="font-semibold text-foreground">🌱 Bifurcation critique ici</p>
          <p className="mt-1">
            {alternatives.length} suites théoriques connues
            {namedAlternatives.length > 0 && ` — dont ${namedAlternatives.map((a) => a.variationName).join(", ")}`}.
          </p>
        </div>
      )}

      {/* Mini-Tree Previewer : fil d'ariane de la manche en cours (même
          convention que l'"Historique" de la colonne Chapitres). */}
      {sanHistory.length > 0 && (
        <div className="border-t border-border pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">Ligne jouée</p>
          <ol className="mt-2 flex flex-wrap gap-x-1.5 gap-y-1 font-mono text-xs text-foreground-muted">
            {sanHistory.map((san, index) => (
              <li key={index}>
                {index % 2 === 0 && <span className="mr-1">{index / 2 + 1}.</span>}
                {san}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* HUD de "Trap Exploration" réactive — `key={trapPunishment.nonce}` force
          le flash à rejouer même si le même piège est retenté juste après le
          reset automatique (un nouveau nœud DOM à chaque déclenchement), voir
          `globals.css#.animate-trap-alert` et `use-opening-drill.ts#trapPunishment`.
          Le plateau ACCEPTE le coup fautif pendant que ceci s'affiche — plus
          de croix rouge instantanée pour une gaffe documentée, voir le
          docstring du fichier. */}
      {trapPunishment && (
        <div
          key={trapPunishment.nonce}
          className="animate-trap-alert rounded-md border border-blunder bg-blunder/10 p-3 text-xs text-foreground"
        >
          <p className="font-semibold text-blunder">⚠️ ALERTE PIÈGE : {trapPunishment.trap.name}</p>
          <p className="mt-1">{trapPunishment.trap.trapExplanation}</p>
        </div>
      )}
    </aside>
  );
});
