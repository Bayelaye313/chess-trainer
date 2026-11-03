import type { Metadata } from "next";
import localFont from "next/font/local";
import { Nav } from "@/components/ui/nav";
import { SyncToast } from "@/components/sync-toast";
import { EngineProvider } from "@/client/engine/engine-context";
import { SyncProvider } from "@/client/features/sync/sync-context";
import { SeanceBar } from "@/client/features/home/seance-bar";
import "./globals.css";

/**
 * Polices AUTO-HÉBERGÉES (`next/font/local`) : COOP/COEP interdit toute
 * ressource externe, et l'app démarre sans réseau. Couple choisi dans
 * docs/redesign/direction.md : Fraunces (titres, axe optique), IBM Plex Sans
 * (texte), IBM Plex Mono (notation, évaluations, Elo — chiffres tabulaires).
 * Licences OFL à côté des fichiers.
 */
const fraunces = localFont({
  src: "./fonts/fraunces-latin-opsz.woff2",
  variable: "--font-fraunces",
  weight: "100 900",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const plexSans = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-latin-wght.woff2", weight: "100 700", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-wght-italic.woff2", weight: "100 700", style: "italic" },
  ],
  variable: "--font-plex-sans",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

const plexMono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
  fallback: ["ui-monospace", "Consolas", "monospace"],
});

export const metadata: Metadata = {
  title: { default: "Chess Trainer", template: "%s · Chess Trainer" },
  description: "Entraîneur d'échecs local : analyse tes parties, révise tes erreurs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
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
            <Nav />
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
      </body>
    </html>
  );
}
