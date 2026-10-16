import type { NextConfig } from "next";

/**
 * Cross-origin isolation (COOP/COEP) débloque SharedArrayBuffer, requis par la
 * build multi-thread de Stockfish WASM. Sans ces en-têtes le moteur retombe
 * automatiquement sur la build single-thread (voir src/engine/loader.ts).
 *
 * Contrainte : toute ressource cross-origin doit être servie en CORP/CORS.
 * On n'en charge aucune côté client (les pièces de react-chessboard sont des
 * SVG inline, les appels Chess.com/Lichess partent du serveur).
 */
const crossOriginIsolation = [
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
];

const nextConfig: NextConfig = {
  // Sans cette borne, Turbopack remonte jusqu'à un package-lock.json parent
  // hors du dépôt (le projet vit sous OneDrive) et s'en plaint à chaque build.
  turbopack: { root: import.meta.dirname },

  // `stockfish` (usage Node, import en masse) résout son .wasm par un
  // `require()` dynamique que le bundler ne peut pas analyser statiquement.
  // Comme `better-sqlite3`, il doit rester un vrai module Node, non empaqueté.
  // `chess-openings` : ~3 Mo de données statiques (base ECO) — à charger tel
  // quel côté serveur, jamais à tenter d'empaqueter ou de tree-shaker.
  serverExternalPackages: ["stockfish", "chess-openings"],

  headers() {
    return Promise.resolve([
      { source: "/:path*", headers: crossOriginIsolation },
    ]);
  },
};

export default nextConfig;
