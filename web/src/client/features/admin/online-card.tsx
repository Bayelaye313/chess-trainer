"use client";

import { useEffect, useState } from "react";
import { CircleDot, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SECTION_LABELS, type PresenceSection } from "@/core/presence/metrics";

interface OnlineSnapshot {
  onlineNow: number;
  onlineBySection: { section: PresenceSection; count: number }[];
  generatedAt: string;
}

const REFRESH_MS = 30_000;
const TIME = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC" });

/** « En ligne maintenant » et répartition par section, rafraîchis toutes les 30 s (route réservée aux admins). */
export function OnlineCard({ initial }: { initial: OnlineSnapshot }) {
  const [snapshot, setSnapshot] = useState(initial);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    const refresh = () => {
      fetch("/api/admin/online", { cache: "no-store" })
        .then((response) => {
          if (!response.ok) throw new Error(String(response.status));
          return response.json() as Promise<OnlineSnapshot>;
        })
        .then((next) => {
          if (!alive) return;
          setSnapshot(next);
          setFailed(false);
        })
        .catch(() => alive && setFailed(true));
    };
    const interval = setInterval(refresh, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  const max = Math.max(1, ...snapshot.onlineBySection.map((row) => row.count));

  return (
    <Card aria-labelledby="en-ligne" className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="en-ligne" className="text-sm text-foreground-muted">
            En ligne maintenant
          </h2>
          <p className="mt-1 flex items-center gap-2 font-mono text-3xl font-medium text-foreground" aria-live="polite">
            <CircleDot aria-hidden="true" className={snapshot.onlineNow > 0 ? "size-5 text-success" : "size-5 text-foreground-subtle"} />
            {snapshot.onlineNow}
          </p>
        </div>
        <p className="flex items-center gap-1 text-xs text-foreground-subtle">
          <RefreshCw aria-hidden="true" className="size-3.5" />
          {failed ? "Actualisation impossible" : `Mis à jour à ${TIME.format(new Date(snapshot.generatedAt))} UTC`}
        </p>
      </div>
      {snapshot.onlineBySection.length === 0 ? (
        <p className="text-sm text-foreground-muted">Personne en ligne pour l&apos;instant (dernier battement il y a moins de 2 minutes).</p>
      ) : (
        <ul className="space-y-2" aria-label="Répartition par section">
          {snapshot.onlineBySection.map((row) => (
            <li key={row.section} className="grid grid-cols-[8rem_minmax(0,1fr)_2rem] items-center gap-3 text-sm">
              <span className="text-foreground-muted">{SECTION_LABELS[row.section]}</span>
              <span className="h-2 rounded-full bg-surface-muted">
                <span className="block h-2 rounded-full bg-chart-1" style={{ width: `${(row.count / max) * 100}%` }} />
              </span>
              <span className="text-right font-mono text-foreground">{row.count}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
