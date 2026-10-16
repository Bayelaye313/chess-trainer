/**
 * Étoiles de maîtrise (0-3 ⭐, voir `core/curriculum/opening-mastery.ts`) —
 * même usage sur la carte du catalogue (`OpeningCard`, agrégée par ouverture)
 * et le sélecteur de Mode Entraînement (`OpeningDrill`, par variante
 * précise). Purement présentationnel : `count` est déjà la valeur dérivée,
 * jamais recalculée ici.
 */
import type { MasteryStars } from "@/core/curriculum/opening-mastery";

export function Stars({ count, className }: { count: MasteryStars; className?: string }) {
  return (
    <span className={`inline-flex shrink-0 tracking-tight ${className ?? ""}`} aria-label={`${count} sur 3 étoiles`}>
      {[1, 2, 3].map((slot) => (
        <span key={slot} className={slot <= count ? "text-accent" : "text-border"} aria-hidden>
          ★
        </span>
      ))}
    </span>
  );
}
