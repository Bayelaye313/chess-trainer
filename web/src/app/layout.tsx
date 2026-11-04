import type { Metadata } from "next";
import localFont from "next/font/local";
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
  description: "Entraîneur d'échecs : analyse tes parties, révise tes erreurs.",
};

/**
 * Racine : polices et document seulement. L'habillage de l'application (moteur,
 * synchro, navigation) vit dans `(app)/layout.tsx`, derrière `requireUser()`.
 * `(public)` regroupe /connexion et /confidentialite.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
