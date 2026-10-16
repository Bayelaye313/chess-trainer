/**
 * Anneau de progression façon Dashboard de Campagne — pur CSS
 * (`conic-gradient`), aucune lib de charts pour un simple pourcentage. Même
 * technique que `ProgressRing` de `openings/pieges-screen.tsx` (non exportée
 * de là-bas), dupliquée ici plutôt que partagée entre deux features encore
 * jeunes — à fusionner le jour où un vrai module `components/ui` de
 * primitives visuelles apparaît.
 */
export function ProgressRing({ percent, size = 48 }: { percent: number; size?: number }) {
  const inner = size - size / 4;
  return (
    <div
      aria-hidden="true"
      className="relative flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size, background: `conic-gradient(var(--accent) ${Math.round(percent * 3.6)}deg, var(--surface-muted) 0deg)` }}
    >
      <div
        className="flex items-center justify-center rounded-full bg-surface font-semibold text-foreground"
        style={{ width: inner, height: inner, fontSize: size >= 56 ? "12px" : "10px" }}
      >
        {percent}%
      </div>
    </div>
  );
}
