"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Tiroir latéral (desktop) / panneau du bas (mobile), sur Radix Dialog :
 * focus piégé, Échap pour fermer, retour du focus au déclencheur.
 */
export function Sheet({
  trigger,
  title,
  description,
  children,
  open,
  onOpenChange,
}: {
  trigger?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55" />
        <Dialog.Content
          className="animate-slide-up-in fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] overflow-y-auto rounded-t-xl border border-border bg-surface p-5 shadow-[var(--shadow-overlay)] focus:outline-none sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[420px] sm:rounded-none sm:rounded-l-xl"
          {...(description ? {} : { "aria-describedby": undefined })}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="font-display text-xl font-semibold">{title}</Dialog.Title>
              {description && <Dialog.Description className="mt-1 text-sm text-foreground-muted">{description}</Dialog.Description>}
            </div>
            <Dialog.Close className="-mt-1 -mr-2 inline-flex size-11 items-center justify-center rounded-md text-foreground-muted hover:bg-surface-muted hover:text-foreground" aria-label="Fermer">
              <X aria-hidden="true" className="size-5" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
