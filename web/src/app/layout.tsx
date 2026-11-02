import type { Metadata } from "next";
import localFont from "next/font/local";
import { Nav } from "@/components/ui/nav";
import { SyncToast } from "@/components/sync-toast";
import { EngineProvider } from "@/client/engine/engine-context";
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
  title: "Chess Trainer",
  description: "Entraîneur d'échecs local : analyse tes parties, révise tes erreurs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        {/*
          Le moteur est monté une fois pour toute l'application : le charger par
          écran coûterait 7 Mo de WASM à chaque navigation.
        */}
        <EngineProvider>
          <Nav />
<main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-8">{children}</main>
          {/* Sondage de fond des comptes liés (Chess.com/Lichess) + toast de notification. */}
          <SyncToast />
        </EngineProvider>
      </body>
    </html>
  );
}
