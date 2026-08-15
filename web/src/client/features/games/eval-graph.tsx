"use client";

/**
 * Graphe d'évaluation d'une partie.
 *
 * Convention volontairement différente d'une palette diverging générique :
 * clair = avantage Blancs, sombre = avantage Noirs, comme les pièces elles-
 * mêmes — plus lisible pour un joueur d'échecs qu'une paire bleu/rouge, et
 * fixe quel que soit le thème de l'appli (voir globals.css, jetons --eval-*).
 *
 * N'a que les évaluations après les coups DU JOUEUR (l'adversaire n'est
 * jamais analysé) : la ligne traverse ses réponses par un simple segment,
 * sans point intermédiaire — approximation assumée, pas une trace continue.
 */
import { useMemo, useRef, useState } from "react";
import { evalPoints, type KeyMoment, type TimelinePly } from "@/core/analysis/timeline";
import { formatEvaluation, KEY_MOMENT_LABEL } from "@/lib/labels";

const WIDTH = 640;
const HEIGHT = 140;
/** ±10 pions : au-delà, un mat ou une position totalement décidée sature l'axe. */
const CAP = 1000;

function clampedValue(cp: number | null, mate: number | null): number {
  if (mate !== null) return mate > 0 ? CAP : -CAP;
  if (cp === null) return 0;
  return Math.max(-CAP, Math.min(CAP, cp));
}

function xOf(ply: number, totalPlies: number): number {
  return (ply / Math.max(1, totalPlies)) * WIDTH;
}

function yOf(value: number): number {
  return HEIGHT / 2 - (value / (2 * CAP)) * HEIGHT;
}

const MOMENT_QUALITY_COLOR = {
  brilliant: "brilliant",
  critical: "critical",
  blunder: "blunder",
  inaccuracy: "inaccuracy",
  missed_mate: "blunder",
  missed_tactic: "inaccuracy",
} as const;

export function EvalGraph({
  timeline,
  keyMoments,
  currentPly,
  onSelectPly,
}: {
  timeline: TimelinePly[];
  keyMoments: KeyMoment[];
  currentPly: number;
  onSelectPly: (ply: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverPly, setHoverPly] = useState<number | null>(null);

  const totalPlies = timeline.length;

  const points = useMemo(() => {
    const analysed = timeline.filter((t) => t.analysis).map((t) => t.analysis!);
    const raw = evalPoints(analysed);
    const last = raw[raw.length - 1];
    // Prolonge la dernière évaluation connue jusqu'à la fin de la partie, pour
    // que la ligne couvre tout le graphe même si le dernier coup analysé
    // n'est pas le dernier de la partie (la partie s'est finie sur un coup
    // adverse).
    if (last && last.ply < totalPlies) {
      return [...raw, { ply: totalPlies, cp: last.cp, mate: last.mate }];
    }
    return raw;
  }, [timeline, totalPlies]);

  if (points.length < 2) return null;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xOf(p.ply, totalPlies)},${yOf(clampedValue(p.cp, p.mate))}`)
    .join(" ");
  const areaPath =
    `M${xOf(points[0].ply, totalPlies)},${HEIGHT / 2} ` +
    points.map((p) => `L${xOf(p.ply, totalPlies)},${yOf(clampedValue(p.cp, p.mate))}`).join(" ") +
    ` L${xOf(points[points.length - 1].ply, totalPlies)},${HEIGHT / 2} Z`;

  function plyFromClientX(clientX: number): number {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const fraction = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(totalPlies, Math.round(fraction * totalPlies)));
  }

  const shownPly = hoverPly ?? currentPly;
  const shownEntry = shownPly > 0 ? timeline[shownPly - 1] : null;

  return (
    <div className="rounded-lg border border-border p-4" style={{ background: "var(--eval-panel)" }}>
      <div className="mb-2 flex items-center justify-between text-xs" style={{ color: "var(--eval-text)" }}>
        <span>Avantage Blancs</span>
        <span className="font-mono">
          {shownEntry
            ? formatEvaluation(shownEntry.analysis?.cpAfter ?? null, shownEntry.analysis?.mateAfter ?? null)
            : "0.00"}
        </span>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full cursor-pointer"
        role="img"
        aria-label="Graphe d'évaluation de la partie, avantage Blancs en clair, Noirs en sombre"
        onPointerMove={(e) => setHoverPly(plyFromClientX(e.clientX))}
        onPointerLeave={() => setHoverPly(null)}
        onClick={(e) => onSelectPly(plyFromClientX(e.clientX))}
      >
        <defs>
          <linearGradient id="eval-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.5" stopColor="var(--eval-white-fill)" />
            <stop offset="0.5" stopColor="var(--eval-black-fill)" />
          </linearGradient>
        </defs>

        <path d={areaPath} fill="url(#eval-fill)" />
        <line
          x1={0}
          y1={HEIGHT / 2}
          x2={WIDTH}
          y2={HEIGHT / 2}
          stroke="var(--eval-baseline)"
          strokeWidth={1}
        />
        {/* Halo puis trait : la ligne doit rester lisible aussi bien sur le fond clair que sombre. */}
        <path d={linePath} fill="none" stroke="var(--eval-line-halo)" strokeWidth={3.5} strokeLinejoin="round" />
        <path d={linePath} fill="none" stroke="var(--eval-line)" strokeWidth={1.5} strokeLinejoin="round" />

        {keyMoments.map((moment) => {
          const value = clampedValue(
            timeline[moment.ply - 1]?.analysis?.cpAfter ?? null,
            timeline[moment.ply - 1]?.analysis?.mateAfter ?? null,
          );
          return (
            <circle
              key={`${moment.ply}-${moment.kind}`}
              cx={xOf(moment.ply, totalPlies)}
              cy={yOf(value)}
              r={4}
              fill={`var(--quality-${MOMENT_QUALITY_COLOR[moment.kind]})`}
              stroke="var(--eval-line-halo)"
              strokeWidth={2}
            >
              <title>
                {`Coup ${moment.ply} — ${KEY_MOMENT_LABEL[moment.kind]}`}
              </title>
            </circle>
          );
        })}

        {/* Curseur vertical : au survol, ou fixe sur la position affichée. */}
        <line
          x1={xOf(shownPly, totalPlies)}
          y1={0}
          x2={xOf(shownPly, totalPlies)}
          y2={HEIGHT}
          stroke="var(--eval-line)"
          strokeWidth={hoverPly !== null ? 1 : 1.5}
          strokeDasharray={hoverPly !== null ? "3 3" : undefined}
          opacity={hoverPly !== null ? 0.6 : 0.9}
        />
      </svg>

      <p className="mt-2 text-xs" style={{ color: "var(--eval-text)" }}>
        {shownEntry ? `${shownPly}. ${shownEntry.san}` : "Position de départ"} — clique pour naviguer
      </p>
    </div>
  );
}
