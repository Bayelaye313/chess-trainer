import { Nav } from "@/components/ui/nav";
import { SyncToast } from "@/components/sync-toast";
import { EngineProvider } from "@/client/engine/engine-context";
import { SyncProvider } from "@/client/features/sync/sync-context";
import { SeanceBar } from "@/client/features/home/seance-bar";
import { initialsOf, normalizeEmail } from "@/core/auth/policy";
import { StorageScope } from "@/client/storage/storage-scope";
import { PresenceBeacon } from "@/client/features/presence/presence-beacon";
import type { ReactNode } from "react";
import type { CurrentUser } from "@/server/auth/session";

/**
 * Habillage commun des pages connectées (`(app)` et `(admin)`). Le contrôle
 * d'accès est fait AVANT par le layout appelant (`requireUser` ou rôle admin).
 */
export function AppShell({ user, children }: { user: CurrentUser; children: ReactNode }) {
  const legacyEmail = process.env.LEGACY_CLAIM_EMAIL;
  const adoptLegacy = Boolean(legacyEmail && user.email && normalizeEmail(legacyEmail) === normalizeEmail(user.email));
  const account = { name: user.name, email: user.email, initials: initialsOf(user.name, user.email), isAdmin: user.role === "admin" };

  return (
    <>
      <StorageScope userId={user.id} adoptLegacy={adoptLegacy} />
      <PresenceBeacon />
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-foreground"
      >
        Aller au contenu
      </a>
      {/*
        Le moteur est monté une fois pour toute l'application : le charger par
        écran coûterait 7 Mo de WASM à chaque navigation. La synchro des
        comptes liés (sondage + état visible) l'est aussi.
      */}
      <EngineProvider>
        <SyncProvider>
          <Nav account={account} />
          <main
            id="contenu"
            className="px-[var(--space-page)] pt-5 pb-[calc(var(--tabbar-h)+32px)] md:pt-8 md:pb-12 md:pl-[calc(var(--rail-w)+var(--space-page))]"
          >
            <SeanceBar />
            {children}
          </main>
          <SyncToast />
        </SyncProvider>
      </EngineProvider>
    </>
  );
}
