"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { LogOut, Settings, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { deleteAccountAction, signOutAction } from "@/server/actions/account";
import { clearAppStorage } from "@/client/storage/user-storage";

export interface AccountSummary {
  name: string | null;
  email: string | null;
  initials: string;
  isAdmin: boolean;
}

const CONFIRM_WORD = "SUPPRIMER";

const ITEM =
  "flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm text-foreground hover:bg-surface-muted";

/**
 * Menu du compte : initiales (jamais l'avatar Google, bloqué par COEP),
 * Réglages, Administration (admins seulement), déconnexion, suppression.
 */
export function AccountMenu({ account }: { account: AccountSummary }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const signOut = () =>
    startTransition(async () => {
      clearAppStorage();
      await signOutAction();
    });

  const deleteAccount = () =>
    startTransition(async () => {
      setError(null);
      const result = await deleteAccountAction(typed);
      if (result?.error) {
        setError(result.error);
        return;
      }
      clearAppStorage();
    });

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setConfirming(false);
          setTyped("");
          setError(null);
        }
      }}
      title={account.name ?? "Mon compte"}
      description={account.email ?? undefined}
      trigger={
        <button
          type="button"
          aria-label={`Compte : ${account.name ?? account.email ?? ""}`}
          className="inline-flex size-11 items-center justify-center rounded-md hover:bg-surface-muted"
        >
          <span aria-hidden="true" className="inline-flex size-8 items-center justify-center rounded-full bg-surface-raised font-mono text-xs font-medium text-foreground">
            {account.initials}
          </span>
        </button>
      }
    >
      <nav aria-label="Compte" className="space-y-1">
        <Link href="/plus" className={ITEM} onClick={() => setOpen(false)}>
          <Settings aria-hidden="true" className="size-4 text-foreground-muted" />
          Réglages
        </Link>
        {account.isAdmin && (
          <Link href="/admin" className={ITEM} onClick={() => setOpen(false)}>
            <ShieldCheck aria-hidden="true" className="size-4 text-foreground-muted" />
            Administration
          </Link>
        )}
        <button type="button" className={ITEM} onClick={signOut} disabled={pending}>
          <LogOut aria-hidden="true" className="size-4 text-foreground-muted" />
          Se déconnecter
        </button>
      </nav>

      <div className="mt-6 border-t border-border pt-4">
        {!confirming ? (
          <button type="button" className={`${ITEM} text-danger`} onClick={() => setConfirming(true)}>
            <Trash2 aria-hidden="true" className="size-4" />
            Supprimer mon compte
          </button>
        ) : (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              deleteAccount();
            }}
          >
            <p className="text-sm text-foreground-muted">
              Ton compte, tes parties, tes révisions et ta progression seront effacés définitivement. Saisis <strong className="font-mono text-foreground">{CONFIRM_WORD}</strong> pour confirmer.
            </p>
            <input
              aria-label={`Saisis ${CONFIRM_WORD} pour confirmer`}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              autoComplete="off"
              className="block min-h-11 w-full rounded-md border border-border-strong bg-surface-muted px-3 font-mono text-foreground"
            />
            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="danger" disabled={pending || typed.trim() !== CONFIRM_WORD}>
                Supprimer définitivement
              </Button>
              <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>
                Annuler
              </Button>
            </div>
          </form>
        )}
      </div>
    </Sheet>
  );
}
