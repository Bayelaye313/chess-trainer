"use client";

import { useState, useTransition } from "react";
import { Button, type ButtonVariant } from "@/components/ui/button";
import type { AdminActionResult } from "@/server/actions/admin";

/**
 * Bouton d'action admin en deux temps : un premier clic demande confirmation
 * (phrase explicite), le second exécute la server action. Le résultat s'affiche
 * sous le bouton.
 */
export function ConfirmAction({
  label,
  confirmText,
  variant = "secondary",
  action,
  disabled,
}: {
  label: string;
  confirmText: string;
  variant?: ButtonVariant;
  action: () => Promise<AdminActionResult>;
  disabled?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<AdminActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      {!confirming ? (
        <Button variant={variant} disabled={disabled || pending} onClick={() => setConfirming(true)}>
          {label}
        </Button>
      ) : (
        <div role="group" aria-label={`Confirmer : ${label}`} className="space-y-2 rounded-md border border-border-strong bg-surface-muted p-3">
          <p className="text-sm text-foreground">{confirmText}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={variant === "danger" ? "danger" : "primary"}
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  setResult(await action());
                  setConfirming(false);
                })
              }
            >
              Confirmer
            </Button>
            <Button variant="ghost" disabled={pending} onClick={() => setConfirming(false)}>
              Annuler
            </Button>
          </div>
        </div>
      )}
      {result && (
        <p role="status" className={result.ok ? "text-sm text-success" : "text-sm text-danger"}>
          {result.ok ? result.message : result.error}
        </p>
      )}
    </div>
  );
}
