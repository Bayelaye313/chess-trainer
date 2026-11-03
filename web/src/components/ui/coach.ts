/**
 * Jetons visuels COMMUNS aux trois bulles de coach (`games/`, `learn/`,
 * `play/` + `learn/course-coach-bubble.tsx`) : même surface, même liseré
 * gauche coloré par ton, même icône. Seul l'habillage est partagé ; chaque
 * bulle garde sa logique.
 */
export const COACH_BUBBLE_CLASS = "flex items-start gap-3 rounded-lg border border-border border-l-4 bg-surface-muted px-3 py-3 text-sm leading-relaxed";

export type CoachTone = "neutral" | "success" | "warning" | "danger" | "brilliant" | "info" | "surprise";

export const COACH_TONE_CLASS: Record<CoachTone, string> = {
  neutral: "border-l-border-strong",
  success: "border-l-best",
  warning: "border-l-inaccuracy",
  danger: "border-l-blunder",
  brilliant: "border-l-brilliant",
  info: "border-l-critical",
  surprise: "border-l-coach-surprise",
};

export const COACH_ICON_CLASS = "mt-0.5 size-4 shrink-0 text-foreground-muted";
