import type { Metadata } from "next";
import localFont from "next/font/local";
import { Nav } from "@/components/ui/nav";
import { SyncToast } from "@/components/sync-toast";
import { EngineProvider } from "@/client/engine/engine-context";
import "./globals.css";

/**
 * Geist en AUTO-HÉBERGÉ (`next/font/local`), plus par `next/font/google`.
 *
 * `next/font/google` télécharge la police depuis `fonts.googleapis.com` À CHAQUE
 * build. Derrière le proxy du poste de développement, ce téléchargement échoue
 * (« Failed to download Geist Mono from Google Fonts. Using a fallback font
 * instead. ») : Next continue avec une police de repli, mais l'application ne
 * s'affiche alors plus dans sa propre typographie — et le build attend le
 * timeout réseau avant de le constater.
 *
 * Les deux fichiers `.woff2` (sous-ensemble latin, axe de graisse variable
 * 100-900) vivent donc dans le dépôt, à côté de ce layout. C'est la cohérence
 * du reste du projet : Stockfish est déjà servi depuis `public/engine/`, et la
 * banque de puzzles est un fichier TypeScript statique intégré au dépôt
 * (`core/curriculum/master-puzzles-dataset.ts`) — aucune partie de
 * l'application ne dépend du réseau pour démarrer.
 *
 * `fallback` liste les polices système utilisées le temps du chargement ;
 * `display: "swap"` évite le texte invisible pendant ce court instant.
 */
const geistSans = localFont({
  src: "./fonts/geist-latin.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"],
});

const geistMono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  fallback: ["ui-monospace", "Cascadia Mono", "Consolas", "monospace"],
});

export const metadata: Metadata = {
  title: "Chess Trainer",
  description: "Entraîneur d'échecs local : analyse tes parties, révise tes erreurs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        {/*
          Le moteur est monté une fois pour toute l'application : le charger par
          écran coûterait 7 Mo de WASM à chaque navigation.
        */}
        <EngineProvider>
          <Nav />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
          {/* Sondage de fond des comptes liés (Chess.com/Lichess) + toast de notification. */}
          <SyncToast />
        </EngineProvider>
      </body>
    </html>
  );
}
