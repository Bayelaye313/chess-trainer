import { MOVE_QUALITY_ORDER } from "@/core/chess/types";
import { QUALITY_LABEL } from "@/lib/labels";
import type { GameOverview as GameOverviewData } from "@/server/queries/games";
import { QualityBadge } from "../board/quality-badge";

/**
 * Répartition des coups par qualité, joueur contre adversaire — l'équivalent
 * du panneau "Aperçu de la partie" de Chess.com, ramené à nos 7 catégories.
 * Ni avatar ni classement estimé de la partie : on n'a ni images de profil ni
 * modèle de performance-rating, mieux vaut les omettre que les inventer.
 */
export function GameOverview({ overview }: { overview: GameOverviewData }) {
  const { player, opponent } = overview;

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h2 className="text-sm font-medium uppercase tracking-wide text-foreground-muted">
        Aperçu de la partie
      </h2>

      <div className="mt-3 grid grid-cols-[1fr_auto_auto] items-center gap-x-3 gap-y-1 text-sm">
        <span />
        <span className="justify-self-center font-medium">{player.name}</span>
        <span className="justify-self-center truncate font-medium" title={opponent.name}>
          {opponent.name}
        </span>

        <span className="text-foreground-muted">Précision</span>
        <span className="justify-self-center font-mono">
          {player.accuracy !== null ? `${player.accuracy}%` : "—"}
        </span>
        <span className="justify-self-center font-mono">
          {opponent.accuracy !== null ? `${opponent.accuracy}%` : "—"}
        </span>
      </div>

      <hr className="my-3 border-border" />

      <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-3 gap-y-1.5 text-sm">
        {MOVE_QUALITY_ORDER.map((quality) => (
          <div key={quality} className="contents">
            <QualityBadge quality={quality} />
            <span className="text-foreground-muted">{QUALITY_LABEL[quality]}</span>
            <span className="justify-self-center font-mono">{player.tally[quality]}</span>
            <span className="justify-self-center font-mono">{opponent.tally[quality]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
