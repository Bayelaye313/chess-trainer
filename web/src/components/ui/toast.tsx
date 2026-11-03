"use client";

import { CircleCheck, X } from "lucide-react";

export interface ToastProps {
  message: string;
  onDismiss: () => void;
}

/** Notification transitoire, au-dessus de la barre de navigation mobile. */
export function Toast({ message, onDismiss }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-slide-up-in fixed right-4 bottom-[calc(var(--tabbar-h)+16px)] left-4 z-50 flex items-start gap-3 rounded-lg border border-border-strong bg-surface-raised px-4 py-3 shadow-[var(--shadow-overlay)] sm:left-auto sm:max-w-sm md:bottom-6"
    >
      <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
      <p className="flex-1 text-sm text-foreground">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fermer la notification"
        className="-m-2 inline-flex size-9 items-center justify-center rounded-md text-foreground-muted hover:text-foreground"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
