"use client";

export interface ToastProps {
  message: string;
  onDismiss: () => void;
}

/**
 * Notification transitoire en coin d'écran — un seul message affiché à la
 * fois pour l'instant. Entrée animée en CSS pur (`animate-slide-up-in`, voir
 * `globals.css`) : pas de Framer Motion ici, son installation est bloquée par
 * le réseau de cet environnement — voir la note dans `components/ui/nav.tsx`.
 */
export function Toast({ message, onDismiss }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-slide-up-in fixed right-6 bottom-6 z-50 flex max-w-sm items-start gap-3 rounded-lg border border-accent/30 bg-surface px-4 py-3 shadow-lg"
    >
      <p className="text-sm text-foreground">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fermer la notification"
        className="text-foreground-muted hover:text-foreground"
      >
        ✕
      </button>
    </div>
  );
}
