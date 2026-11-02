"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Route, TriangleAlert } from "lucide-react";
import { BOT_PROFILES, type BotProfileId } from "@/core/chess/bot-profiles";
import type { BotStartLine } from "@/core/training/daily-plan";
import { ENGINE_FAILURE_TEXT, useEngineDisplayStatus } from "@/client/features/engine-check/use-engine-timeout";
import { Button } from "@/components/ui/button";
import { cx } from "@/components/ui/cx";
import { BOT_DISPLAY, readLastSetup, writeLastSetup } from "./bot-display";

const COLORS: readonly { value: "w" | "b"; label: string }[] = [
  { value: "w", label: "Blancs" },
  { value: "b", label: "Noirs" },
];

/**
 * Réglage minimal d'une partie : niveau du bot (4 profils), couleur,
 * « Commencer ». Le dernier choix est mémorisé (localStorage) ; avec
 * `autoStart`, la partie démarre seule dès que le moteur est prêt
 * (raccourci « Rejouer » de l'accueil : 1 clic).
 */
export function SetupPanel({
  engineReady,
  loading,
  startLines = [],
  autoStart = false,
  onStart,
}: {
  engineReady: boolean;
  loading: boolean;
  startLines?: readonly BotStartLine[];
  autoStart?: boolean;
  onStart: (color: "w" | "b", profileId: BotProfileId) => void;
}) {
  const [color, setColor] = useState<"w" | "b">("w");
  const [profileId, setProfileId] = useState<BotProfileId>("club");
  const [restored, setRestored] = useState(false);
  const autoStarted = useRef(false);
  const { status: engineStatus } = useEngineDisplayStatus();
  const side = color === "w" ? "white" : "black";
  const linesForColor = startLines.filter((line) => line.side === side);

  // Lecture après montage : localStorage n'existe pas au rendu serveur.
  useEffect(() => {
    const last = readLastSetup();
    /* eslint-disable react-hooks/set-state-in-effect -- restauration unique d'une préférence locale */
    if (last) {
      setProfileId(last.profileId);
      setColor(last.color);
    }
    setRestored(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function start() {
    writeLastSetup({ profileId, color });
    onStart(color, profileId);
  }

  useEffect(() => {
    if (!autoStart || autoStarted.current || !restored || !engineReady || loading) return;
    autoStarted.current = true;
    writeLastSetup({ profileId, color });
    onStart(color, profileId);
  }, [autoStart, restored, engineReady, loading, color, profileId, onStart]);

  const selected = BOT_DISPLAY[profileId];

  return (
    <section aria-labelledby="nouvelle-partie" className="space-y-5">
      <h2 id="nouvelle-partie" className="font-display text-lg font-semibold">
        Nouvelle partie
      </h2>

      <fieldset>
        <legend className="mb-2 text-sm text-foreground-muted">Niveau du bot</legend>
        <div role="radiogroup" aria-label="Niveau du bot" className="grid grid-cols-2 gap-2">
          {BOT_PROFILES.map((profile) => {
            const display = BOT_DISPLAY[profile.id];
            const Icon = display.icon;
            const active = profileId === profile.id;
            return (
              <button
                key={profile.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setProfileId(profile.id)}
                className={cx(
                  "flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                  active ? "border-accent bg-surface-raised" : "border-border bg-surface hover:bg-surface-muted",
                )}
              >
                <Icon aria-hidden="true" className={cx("size-5 shrink-0", active ? "text-accent" : "text-foreground-subtle")} />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">{display.name}</span>
                  <span className="block text-xs text-foreground-muted">
                    {display.level} · <span className="font-mono">{profile.elo ?? "Max"}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-foreground-muted">{selected.blurb}</p>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm text-foreground-muted">Tu joues</legend>
        <div role="radiogroup" aria-label="Couleur" className="inline-flex rounded-lg border border-border bg-surface p-1">
          {COLORS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={color === option.value}
              onClick={() => setColor(option.value)}
              className={cx(
                "inline-flex min-h-10 min-w-24 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium",
                color === option.value ? "bg-surface-raised text-foreground" : "text-foreground-muted hover:text-foreground",
              )}
            >
              <span aria-hidden="true" className={cx("size-3 rounded-full border border-border-strong", option.value === "w" ? "bg-[#f4f1ea]" : "bg-[#1b1b1b]")} />
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      {startLines.length > 0 && (
        <div className="flex gap-2 rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-sm">
          <Route aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-book" />
          <div>
            <p className="font-medium">Plan du jour actif : le bot testera ton répertoire</p>
            <p className="mt-0.5 text-foreground-muted">
              {linesForColor.length > 0
                ? `Avec les ${color === "w" ? "Blancs" : "Noirs"}, départ tiré parmi : ${[...new Set(linesForColor.map((line) => line.label))].join(", ")}.`
                : `Aucune ligne de ton répertoire avec les ${color === "w" ? "Blancs" : "Noirs"} : départ classique.`}
            </p>
          </div>
        </div>
      )}

      <Button variant="primary" data-primary-action className="w-full sm:w-auto sm:min-w-48" disabled={!engineReady || loading} onClick={start}>
        {loading || (!engineReady && engineStatus === "loading") ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
        {loading ? "Préparation…" : engineReady ? "Commencer" : "Chargement du moteur…"}
      </Button>

      {(engineStatus === "timeout" || engineStatus === "error") && (
        <p role="alert" className="flex items-start gap-1.5 text-sm text-danger">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {engineStatus === "timeout" ? ENGINE_FAILURE_TEXT.timeout : ENGINE_FAILURE_TEXT.error}
        </p>
      )}
    </section>
  );
}
