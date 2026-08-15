/**
 * Conversion centipions → probabilité de gain (%).
 *
 * Formule publique de Lichess (celle de leur propre graduation Imprécision /
 * Erreur / Gaffe) — reprise ici comme point de repère demandé explicitement
 * (« voir comment Lichess/Chess.com évaluent les coups ») plutôt qu'un seuil
 * de centipions choisi à l'intuition.
 *
 * L'intérêt : un même écart de centipions ne pèse pas pareil selon le point
 * de la partie. 50 centipions perdus près de l'égalité (0 → -50) font basculer
 * la probabilité de gain de façon significative ; les mêmes 50 centipions
 * perdus dans une position déjà gagnée (+900 → +850) ne changent presque rien
 * à l'issue probable. La sigmoïde comprime naturellement les deux bouts de
 * l'échelle — pas besoin de re-caler les seuils par phase de partie.
 */
export function winPercent(cp: number | null, mate: number | null): number {
  if (mate !== null) return mate > 0 ? 100 : 0;
  if (cp === null) return 50;
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
}

/**
 * Même formule, à partir d'un couple (cp, mate) exprimé POV Blancs — la
 * convention utilisée partout ailleurs dans `PositionEvaluation` — ramené au
 * point de vue demandé.
 */
export function winPercentFromWhitePov(
  cp: number | null,
  mate: number | null,
  wantWhitePov: boolean,
): number {
  const povCp = cp === null ? null : wantWhitePov ? cp : -cp;
  const povMate = mate === null ? null : wantWhitePov ? mate : -mate;
  return winPercent(povCp, povMate);
}
