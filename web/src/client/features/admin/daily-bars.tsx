"use client";

import { useId, useState } from "react";
import { Card } from "@/components/ui/card";
import { formatDay } from "./format";

export interface DayPoint {
  day: string;
  value: number;
}

const W = 600;
const H = 160;
const PAD = { top: 12, right: 8, bottom: 24, left: 28 };
const GAP = 2;

/** Pas d'axe « joli » : 0, milieu, max arrondi vers le haut. */
function niceMax(max: number): number {
  if (max <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / magnitude) * magnitude;
}

/**
 * Barres quotidiennes sur 30 jours, en SVG avec les jetons du design. Une seule
 * série : le titre la nomme, pas de légende. Chaque barre a son info-bulle au
 * survol ET au focus clavier, et un tableau reprend toutes les valeurs.
 */
export function DailyBars({ title, unit, points }: { title: string; unit: string; points: readonly DayPoint[] }) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(0, ...points.map((p) => p.value)));
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const slot = plotW / Math.max(1, points.length);
  const barW = Math.max(2, slot - GAP);
  const y = (value: number) => PAD.top + plotH - (value / max) * plotH;
  const total = points.reduce((sum, p) => sum + p.value, 0);
  const active = hover === null ? null : points[hover];

  return (
    <Card aria-labelledby={`${id}-titre`} className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id={`${id}-titre`} className="font-display text-lg font-semibold">
          {title}
        </h2>
        <p className="text-sm text-foreground-muted" aria-live="polite">
          {active ? (
            <>
              <span className="font-mono text-foreground">{active.value}</span> {unit} · {formatDay(active.day)}
            </>
          ) : (
            <>
              <span className="font-mono text-foreground">{total}</span> sur 30 jours
            </>
          )}
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title} : ${total} sur 30 jours. Détail dans le tableau ci-dessous.`} className="h-auto w-full overflow-visible">
        {[0, max / 2, max].map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} stroke="var(--border)" strokeWidth={1} />
            <text x={PAD.left - 6} y={y(tick) + 4} textAnchor="end" className="fill-foreground-subtle font-mono text-[10px]">
              {Number.isInteger(tick) ? tick : tick.toFixed(1)}
            </text>
          </g>
        ))}
        {points.map((point, index) => {
          const x = PAD.left + index * slot + GAP / 2;
          const top = y(point.value);
          const height = PAD.top + plotH - top;
          const radius = Math.min(4, barW / 2, height);
          return (
            <g
              key={point.day}
              onPointerEnter={() => setHover(index)}
              onPointerLeave={() => setHover((current) => (current === index ? null : current))}
            >
              {/* Zone de survol : toute la colonne, plus large que la barre. */}
              <rect x={PAD.left + index * slot} y={PAD.top} width={slot} height={plotH} fill="transparent" />
              {point.value > 0 && (
                <path
                  d={`M${x},${PAD.top + plotH} V${top + radius} Q${x},${top} ${x + radius},${top} H${x + barW - radius} Q${x + barW},${top} ${x + barW},${top + radius} V${PAD.top + plotH} Z`}
                  className={hover === index ? "fill-accent" : "fill-chart-1"}
                />
              )}
            </g>
          );
        })}
        {[0, Math.floor(points.length / 2), points.length - 1]
          .filter((index) => points[index])
          .map((index) => (
            <text key={index} x={PAD.left + index * slot + slot / 2} y={H - 6} textAnchor="middle" className="fill-foreground-subtle text-[10px]">
              {formatDay(points[index].day)}
            </text>
          ))}
      </svg>
      <details className="text-sm">
        <summary className="inline-flex min-h-11 cursor-pointer items-center text-foreground-muted hover:text-foreground">Voir le tableau</summary>
        <div className="mt-2 max-h-64 overflow-y-auto">
          <table className="w-full text-left">
            <caption className="sr-only">{title}, par jour</caption>
            <thead className="text-foreground-subtle">
              <tr>
                <th scope="col" className="py-1 font-normal">
                  Jour (UTC)
                </th>
                <th scope="col" className="py-1 text-right font-normal">
                  {unit}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...points].reverse().map((point) => (
                <tr key={point.day}>
                  <td className="py-1 text-foreground-muted">{formatDay(point.day)}</td>
                  <td className="py-1 text-right font-mono text-foreground">{point.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Card>
  );
}
