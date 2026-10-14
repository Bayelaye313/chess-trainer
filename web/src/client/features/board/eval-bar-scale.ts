/**
 * Échelle et libellé de la barre d'évaluation verticale (`evaluation-bar.tsx`)
 * — logique pure, isolée du composant pour être testée sous Vitest (env node).
 *
 * Échelle d'AFFICHAGE uniquement : `winPercent` (core/analysis/win-percent.ts)
 * reste la sigmoïde Lichess qui sert au classement des coups — on n'y touche
 * pas. La barre suit plutôt des points d'ancrage choisis pour la lecture :
 * près de l'égalité elle bouge peu (un +0.3 ne doit pas sembler décisif), puis
 * elle se remplit franchement jusqu'à +5, où la partie est jouée. Une
 * interpolation linéaire par morceaux entre ces ancres, plutôt qu'une courbe
 * ajustée : aucune sigmoïde ne passe par ces quatre points (elle est toujours
 * plus raide en 0 qu'à +3).
 */

/** [centipions, % de la barre côté Blancs] — symétrique pour les Noirs. */
const ANCHORS: ReadonlyArray<readonly [number, number]> = [
  [0, 50],
  [100, 55],
  [300, 75],
  [500, 95],
  [800, 100],
];

/** Part de la barre (0-100) occupée par les Blancs, POV Blancs. */
export function evalBarFill(cp: number | null, mate: number | null): number {
  // Mat annoncé : barre pleine pour le camp qui mate. `#0` (sans signe) reste
  // côté Noirs comme `winPercent` — l'appelant tranche via `checkmatedBy`.
  if (mate !== null) return mate > 0 ? 100 : 0;
  if (cp === null || !Number.isFinite(cp)) return 50;
  const abs = Math.abs(cp);
  let whiteShare = 100;
  for (let i = 1; i < ANCHORS.length; i++) {
    const [x1, y1] = ANCHORS[i];
    if (abs <= x1) {
      const [x0, y0] = ANCHORS[i - 1];
      whiteShare = y0 + ((abs - x0) / (x1 - x0)) * (y1 - y0);
      break;
    }
  }
  return cp >= 0 ? whiteShare : 100 - whiteShare;
}

/**
 * Libellé court de la barre : « +1.2 », « -0.4 », « 0.0 », ou « M3 » / « -M3 »
 * (mat en 3 pour les Blancs / les Noirs). Une seule décimale — la barre est
 * étroite, et la deuxième décimale n'apporte rien à la lecture d'un coup d'œil.
 */
export function formatEvalBarLabel(cp: number | null, mate: number | null): string {
  if (mate !== null) return `${mate < 0 ? "-" : ""}M${Math.abs(mate)}`;
  if (cp === null || !Number.isFinite(cp)) return "—";
  const pawns = Math.round(cp / 10) / 10;
  // Évite « -0.0 » / « +0.0 » pour un score arrondi à l'égalité.
  if (pawns === 0) return "0.0";
  return `${pawns > 0 ? "+" : ""}${pawns.toFixed(1)}`;
}
