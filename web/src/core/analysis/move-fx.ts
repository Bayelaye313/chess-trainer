/**
 * Classification « son + micro-animation » d'un demi-coup de la Revue de
 * partie (cahier des charges §11b) — pur, sans dépendance React : ne lit que
 * des champs déjà présents sur `TimelinePly`/`AnalysedPly` (`core/analysis/timeline.ts`),
 * aucun nouveau calcul moteur.
 *
 * Deux familles de déclencheurs, jamais combinées :
 *  - la qualité du coup (brillant/critique/meilleur coup/gaffe), quand une
 *    analyse est disponible — c'est elle qui prime, un coup remarquable
 *    l'est indépendamment de sa forme ;
 *  - à défaut, la FORME du coup (roque > capture > développement > neutre),
 *    lisible depuis le SAN/UCI seuls — fonctionne même sans analyse (coup
 *    adverse non encore évalué en partie live, par exemple).
 */
import type { TimelinePly } from "@/core/analysis/timeline";

export type MoveFxKind =
  | "brilliant"
  | "critical"
  | "excellent"
  | "blunder"
  | "castle"
  | "capture"
  | "development"
  | "neutral";

const BACK_RANK: Record<"w" | "b", string> = { w: "1", b: "8" };

/** Rangée de départ du coup (2e caractère de l'UCI, ex. `"1"` pour `g1f3`). */
function fromRank(uci: string): string {
  return uci[1];
}

export function classifyMoveFx(entry: TimelinePly): MoveFxKind {
  const quality = entry.analysis?.quality;
  if (quality === "brilliant") return "brilliant";
  if (quality === "critical") return "critical";
  if (quality === "best") return "excellent";
  if (quality === "blunder") return "blunder";

  if (entry.san.startsWith("O-O")) return "castle";
  if (entry.san.includes("x")) return "capture";

  // Développement : une pièce mineure (Cavalier/Fou) qui quitte sa rangée de
  // départ — un pion ou une pièce lourde/le roi ne « développe » rien au sens
  // classique de l'ouverture.
  const isMinorPiece = entry.san[0] === "N" || entry.san[0] === "B";
  if (isMinorPiece && fromRank(entry.uci) === BACK_RANK[entry.side]) return "development";

  return "neutral";
}
