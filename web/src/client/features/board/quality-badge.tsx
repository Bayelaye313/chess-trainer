import type { MoveQuality } from "@/core/chess/types";
import {
  QUALITY_BADGE_INK_CLASS,
  QUALITY_BG_CLASS,
  QUALITY_DESCRIPTION,
  QUALITY_LABEL,
  QUALITY_SYMBOL,
} from "@/lib/labels";

/**
 * Pouce levé, en trait plein `currentColor` — un glyphe emoji (👍) ignorerait
 * la couleur d'encre calculée pour le contraste et s'afficherait toujours en
 * couleur pleine, quel que soit le fond du badge.
 */
function ThumbIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
      <path d="M2 10h3v11H2a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1Zm5.5 11h11a2 2 0 0 0 1.94-1.51l1.75-7A2 2 0 0 0 20.25 10H15V5a3 3 0 0 0-3-3 1 1 0 0 0-.92.61L7.5 10.5V21Z" />
    </svg>
  );
}

/**
 * Pastille couleur + glyphe pour un coup analysé — le repère visuel du journal
 * des coups (`MoveList`) et de l'échiquier de revue. Fond plein (pas une simple
 * teinte) pour rester lisible à 20px : une pastille à 15% d'opacité se noyait
 * dans le fond de la carte.
 */
export function QualityBadge({ quality }: { quality: MoveQuality }) {
  return (
    <span
      title={`${QUALITY_LABEL[quality]} — ${QUALITY_DESCRIPTION[quality]}`}
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold leading-none shadow-sm ${QUALITY_BG_CLASS[quality]} ${QUALITY_BADGE_INK_CLASS[quality]}`}
    >
      {quality === "okay" ? <ThumbIcon /> : QUALITY_SYMBOL[quality]}
    </span>
  );
}
