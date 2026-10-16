/**
 * « Post-Game Report » de fin de Revue de partie (§11c) — encadré stylisé,
 * ton commentateur e-sport, en bas de `game-review-screen.tsx`. Ne recalcule
 * rien : s'appuie entièrement sur `overview` (`GameOverviewData`, déjà
 * assemblé par `getGameDetail`, `server/queries/games.ts` — précision et
 * répartition des qualités des DEUX camps) et `keyMoments` (déjà calculés par
 * `findKeyMoments`, `core/analysis/timeline.ts`).
 *
 * Le texte est un gabarit déterministe (même esprit que
 * `core/analysis/coach-narrative.ts`) — PAS un appel à un modèle de langage :
 * quelques seuils simples sur l'accuracy et les compteurs de qualité
 * choisissent 2-3 phrases parmi un jeu fixe, jamais de génération libre.
 */
import type { KeyMoment } from "@/core/analysis/timeline";
import type { GameOverview as GameOverviewData } from "@/server/queries/games";

function openingLine(accuracy: number | null): string {
  if (accuracy === null) return "Analyse partielle — pas assez de coups évalués pour un verdict de précision.";
  if (accuracy >= 90) return `Performance quasi parfaite : ${accuracy}% de précision, l'adversaire n'a jamais eu la moindre ouverture.`;
  if (accuracy >= 75) return `Une partie solide, ${accuracy}% de précision — largement de quoi rivaliser à ce niveau.`;
  if (accuracy >= 55) return `Partie à deux vitesses : ${accuracy}% de précision, de bons moments mais aussi quelques trous d'air.`;
  return `Une partie mouvementée, ${accuracy}% de précision seulement — le combat a été rude d'un bout à l'autre.`;
}

function highlightLine(brilliants: number, criticals: number, blunders: number): string {
  if (brilliants > 0) {
    return `${brilliants} coup${brilliants > 1 ? "s" : ""} Brillant${brilliants > 1 ? "s" : ""} au compteur — du grand art.`;
  }
  if (criticals > 0) {
    return `${criticals} fois LE seul coup qui tenait la position, trouvé sous pression.`;
  }
  if (blunders === 0) {
    return "Aucune gaffe recensée : un sang-froid exemplaire du premier au dernier coup.";
  }
  return `${blunders} gaffe${blunders > 1 ? "s" : ""} ont pesé lourd dans la balance.`;
}

function closingLine(keyMoments: readonly KeyMoment[]): string {
  const missedMates = keyMoments.filter((moment) => moment.kind === "missed_mate").length;
  if (missedMates > 0) {
    return `Mais ${missedMates} mat${missedMates > 1 ? "s" : ""} forcé${missedMates > 1 ? "s" : ""} laissé${missedMates > 1 ? "s" : ""} filer — de quoi nourrir la prochaine séance d'entraînement.`;
  }
  return "Rendez-vous à la prochaine partie pour confirmer cette dynamique.";
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-surface-muted/30 px-3 py-2 text-center">
      <p className="text-lg font-semibold text-foreground">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-foreground-muted">{label}</p>
    </div>
  );
}

export function PostGameReport({
  overview,
  keyMoments,
}: {
  overview: GameOverviewData;
  keyMoments: readonly KeyMoment[];
}) {
  const { player, opponent } = overview;
  const { brilliant, critical, blunder } = player.tally;

  return (
    <div className="rounded-lg border border-accent/30 bg-gradient-to-br from-surface to-surface-muted/40 p-4">
      <h2 className="text-sm font-medium uppercase tracking-wide text-accent">📣 Bilan du commentateur</h2>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile label="Ta précision" value={player.accuracy !== null ? `${player.accuracy}%` : "—"} />
        <StatTile label={`Précision ${opponent.name}`} value={opponent.accuracy !== null ? `${opponent.accuracy}%` : "—"} />
        <StatTile label="Brillants" value={String(brilliant)} />
        <StatTile label="Gaffes" value={String(blunder)} />
      </div>

      <p className="mt-4 text-sm leading-relaxed text-foreground">
        {openingLine(player.accuracy)} {highlightLine(brilliant, critical, blunder)} {closingLine(keyMoments)}
      </p>
    </div>
  );
}
