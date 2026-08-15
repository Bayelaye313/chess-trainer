/**
 * Traduction des clés du domaine vers l'interface.
 *
 * Le domaine (src/core) ne connaît que des clés anglaises stables, qui
 * finissent en base et dans les URL. Tout le français est ici : changer un
 * libellé ne touche jamais aux données.
 */
import type { KeyMomentKind } from "@/core/analysis/timeline";
import type { Termination } from "@/core/chess/termination";
import type { GamePhase, GameResult, Motif, MoveQuality } from "@/core/chess/types";
import type { GameSource, ImportJobStatus } from "@/server/db/schema";

export const QUALITY_LABEL: Record<MoveQuality, string> = {
  brilliant: "Brillant",
  critical: "Critique",
  best: "Meilleur coup",
  okay: "Correct",
  inaccuracy: "Imprécision",
  blunder: "Gaffe",
  book: "Théorique",
};

/** Explication complète, pour l'info-bulle des badges — le statut seul ne dit pas tout. */
export const QUALITY_DESCRIPTION: Record<MoveQuality, string> = {
  brilliant: "Ingénieux — un sacrifice qui reste objectivement gagnant ou tenable.",
  critical: "Le seul coup valable dans cette position.",
  best: "Le meilleur coup selon le moteur.",
  okay: "Correct, sans être le meilleur choix.",
  inaccuracy: "Une imprécision, sans gravité immédiate.",
  blunder: "Une gaffe qui change l'issue de la partie.",
  book: "Position hors évaluation (théorie ou fin de partie).",
};

/** Classe Tailwind de couleur de texte, adossée aux jetons de globals.css. */
export const QUALITY_TEXT_CLASS: Record<MoveQuality, string> = {
  brilliant: "text-brilliant",
  critical: "text-critical",
  best: "text-best",
  okay: "text-okay",
  inaccuracy: "text-inaccuracy",
  blunder: "text-blunder",
  book: "text-book",
};

/**
 * Fond plein assorti (Tailwind génère ces classes depuis `--color-*` de
 * globals.css) — pour les badges d'icône, volontairement saturés plutôt que
 * teintés à faible opacité : un badge illisible ne sert à rien.
 */
export const QUALITY_BG_CLASS: Record<MoveQuality, string> = {
  brilliant: "bg-brilliant",
  critical: "bg-critical",
  best: "bg-best",
  okay: "bg-okay",
  inaccuracy: "bg-inaccuracy",
  blunder: "bg-blunder",
  book: "bg-book",
};

/**
 * Encre du glyphe sur fond plein — calculée une fois pour un contraste correct
 * (ratio WCAG) sur chacune des 7 couleurs : le blunder rouge est le seul assez
 * sombre pour appeler du texte clair, tous les autres appellent du texte foncé.
 * Fixe, comme les couleurs de qualité elles-mêmes (pas de variante par thème).
 */
export const QUALITY_BADGE_INK_CLASS: Record<MoveQuality, string> = {
  brilliant: "text-[#12211f]",
  critical: "text-[#12211f]",
  best: "text-[#12211f]",
  okay: "text-[#12211f]",
  inaccuracy: "text-[#12211f]",
  blunder: "text-white",
  book: "text-[#12211f]",
};

/** Classe de bordure assortie — liseré de repérage sur les lignes du journal des coups. */
export const QUALITY_BORDER_CLASS: Record<MoveQuality, string> = {
  brilliant: "border-brilliant",
  critical: "border-critical",
  best: "border-best",
  okay: "border-okay",
  inaccuracy: "border-inaccuracy",
  blunder: "border-blunder",
  book: "border-book",
};

/**
 * Glyphe façon annotation d'échiquier — reconnaissable d'un coup d'œil,
 * indépendant de la langue de l'interface. `okay` n'a pas d'équivalent texte
 * lisible à cette taille : `QualityBadge` y substitue une icône (pouce levé).
 */
export const QUALITY_SYMBOL: Record<MoveQuality, string> = {
  brilliant: "!!",
  critical: "!",
  best: "★",
  okay: "✓",
  book: "📖",
  inaccuracy: "?!",
  blunder: "??",
};

export const MOTIF_LABEL: Record<Motif, string> = {
  fork: "Fourchette",
  pin: "Clouage",
  skewer: "Enfilade",
  discovered_attack: "Attaque à la découverte",
  back_rank_mate: "Mat du couloir",
  hanging_piece: "Pièce en prise",
};

export const PHASE_LABEL: Record<GamePhase, string> = {
  opening: "Ouverture",
  middlegame: "Milieu de partie",
  endgame: "Finale",
};

/** Liste lisible de motifs, chaîne vide s'il n'y en a aucun. */
export function formatMotifs(motifs: readonly Motif[]): string {
  return motifs.map((motif) => MOTIF_LABEL[motif]).join(", ");
}

/** Évaluation en notation joueur : "+1.24", "-0.30", "M3". */
export function formatEvaluation(cp: number | null, mate: number | null): string {
  if (mate !== null) return `${mate > 0 ? "M" : "-M"}${Math.abs(mate)}`;
  if (cp === null) return "—";
  const pawns = cp / 100;
  return `${pawns >= 0 ? "+" : ""}${pawns.toFixed(2)}`;
}

/**
 * Couleur de surbrillance de case pour un coup du joueur, dérivée du jeton
 * `--quality-*` correspondant (voir globals.css) — une seule source pour la
 * couleur, que ce soit dans le journal des coups ou sur l'échiquier.
 */
export function qualitySquareColor(quality: MoveQuality): string {
  return `color-mix(in srgb, var(--quality-${quality}) 55%, transparent)`;
}

/** Surbrillance neutre pour un coup de l'adversaire, jamais qualifié. */
export const OPPONENT_MOVE_SQUARE_COLOR =
  "color-mix(in srgb, var(--foreground-muted) 35%, transparent)";

export function describeGameResult(result: GameResult): string {
  if (result === "1-0") return "les Blancs gagnent";
  if (result === "0-1") return "les Noirs gagnent";
  return "nulle";
}

export const TERMINATION_LABEL: Record<Termination, string> = {
  checkmate: "échec et mat",
  stalemate: "pat",
  insufficient_material: "matériel insuffisant",
  threefold_repetition: "répétition",
  fifty_move_rule: "règle des 50 coups",
};

export const IMPORT_SOURCE_LABEL: Record<Exclude<GameSource, "local">, string> = {
  chesscom: "Chess.com",
  lichess: "Lichess",
};

export const IMPORT_STATUS_LABEL: Record<ImportJobStatus, string> = {
  running: "En cours",
  done: "Terminé",
  error: "Échec",
  cancelled: "Annulé",
};

export const KEY_MOMENT_LABEL: Record<KeyMomentKind, string> = {
  brilliant: "Coup brillant",
  critical: "Coup critique",
  blunder: "Gaffe",
  inaccuracy: "Imprécision",
  missed_mate: "Mat manqué",
  missed_tactic: "Tactique manquée",
};

/** Couleur associée à un moment clé — réutilise les jetons de qualité déjà en place. */
export const KEY_MOMENT_TEXT_CLASS: Record<KeyMomentKind, string> = {
  brilliant: "text-brilliant",
  critical: "text-critical",
  blunder: "text-blunder",
  inaccuracy: "text-inaccuracy",
  missed_mate: "text-blunder",
  missed_tactic: "text-inaccuracy",
};

/** Glyphe associé à un moment clé, même convention que `QUALITY_SYMBOL`. */
export const KEY_MOMENT_SYMBOL: Record<KeyMomentKind, string> = {
  brilliant: "!!",
  critical: "!",
  blunder: "??",
  inaccuracy: "?!",
  missed_mate: "#",
  missed_tactic: "?!",
};
