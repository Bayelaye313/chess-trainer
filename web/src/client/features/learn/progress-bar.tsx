/**
 * Barre de progression horizontale, réutilisée pour chaque thème
 * (`ThemeCard`) et pour l'en-tête de session (`ThemeSession`) — un seul
 * composant pour ne jamais désynchroniser l'arrondi/le seuil "terminé" entre
 * les deux affichages.
 */
export function ProgressBar({
  completed,
  total,
  className = "",
}: {
  completed: number;
  total: number;
  className?: string;
}) {
  const ratio = total > 0 ? Math.min(completed / total, 1) : 0;
  const done = total > 0 && completed >= total;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${done ? "bg-best" : "bg-accent"}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span className={`shrink-0 font-mono text-xs ${done ? "text-best" : "text-foreground-muted"}`}>
        {completed}/{total}
      </span>
    </div>
  );
}
