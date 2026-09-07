"use client";

import { useState } from "react";
import { BOT_PROFILES, type BotProfile, type BotProfileId } from "@/core/chess/bot-profiles";

/**
 * Avatar + descriptif humain par profil — présentation pure, volontairement
 * tenue hors de `core/chess/bot-profiles.ts` (données framework-agnostiques,
 * voir son docstring) : même schéma que `MASTERPIECE_BLURB`
 * (`hall-of-fame.tsx`) ou les icônes par onglet de `nav.tsx`.
 */
const PROFILE_AVATAR: Record<BotProfileId, string> = {
  poussin: "🐥",
  club: "🛡️",
  champion: "⚔️",
  stockfish: "🦾",
};

const PROFILE_BLURB: Record<BotProfileId, string> = {
  poussin: "Commence ici ton apprentissage.",
  club: "Un joueur tactique et solide de club.",
  champion: "Calculateur redoutable de tournoi.",
  stockfish: "Puissance brute, sans aucune bride.",
};

/** Repères de la jauge de force — du plancher Poussin au repère Stockfish (voir `BotProfile.nominalElo`). */
const GAUGE_MIN_ELO = 1000;
const GAUGE_MAX_ELO = 3200;

function gaugePercent(profile: BotProfile): number {
  const clamped = Math.min(GAUGE_MAX_ELO, Math.max(GAUGE_MIN_ELO, profile.nominalElo));
  return Math.round(((clamped - GAUGE_MIN_ELO) / (GAUGE_MAX_ELO - GAUGE_MIN_ELO)) * 100);
}

function BotCard({
  profile,
  active,
  onSelect,
}: {
  profile: BotProfile;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
        active
          ? "border-accent bg-accent/10 shadow-sm ring-1 ring-accent/40"
          : "border-border bg-surface hover:bg-surface-muted/50"
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-xl ${
          active ? "border-accent/50 bg-surface" : "border-border bg-surface-muted/60"
        }`}
        aria-hidden="true"
      >
        {PROFILE_AVATAR[profile.id]}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-semibold text-foreground">{profile.label}</span>
          <span className="shrink-0 font-mono text-xs font-bold text-foreground-muted">
            {profile.elo !== null ? profile.elo : "Max"}
          </span>
        </span>
        <span className="mt-0.5 block truncate text-xs text-foreground-muted">{PROFILE_BLURB[profile.id]}</span>
        {/* Jauge de force — repère visuel rapide entre les 4 profils, voir `gaugePercent`. */}
        <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
          <span
            className={`block h-full rounded-full ${active ? "bg-accent" : "bg-foreground-muted/40"}`}
            style={{ width: `${gaugePercent(profile)}%` }}
          />
        </span>
      </span>
    </button>
  );
}

export function SetupPanel({
  engineReady,
  loading,
  onStart,
}: {
  engineReady: boolean;
  loading: boolean;
  onStart: (color: "w" | "b", profileId: BotProfileId) => void;
}) {
  const [color, setColor] = useState<"w" | "b">("w");
  const [profileId, setProfileId] = useState<BotProfileId>("club");

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h1 className="text-lg font-semibold">🎮 Nouvelle partie</h1>
      <p className="mt-1 text-xs text-foreground-muted">
        Affronte le moteur Stockfish, réglé sur le profil de ton choix.
      </p>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {BOT_PROFILES.map((profile) => (
          <BotCard
            key={profile.id}
            profile={profile}
            active={profileId === profile.id}
            onSelect={() => setProfileId(profile.id)}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-8">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-foreground-muted">Couleur</span>
          <select
            value={color}
            onChange={(event) => setColor(event.target.value as "w" | "b")}
            className="rounded-md border border-border bg-surface px-3 py-1.5"
          >
            <option value="w">Blancs</option>
            <option value="b">Noirs</option>
          </select>
        </label>

        <button
          type="button"
          disabled={!engineReady || loading}
          onClick={() => onStart(color, profileId)}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {loading ? "Préparation…" : "Commencer"}
        </button>
      </div>

      {!engineReady && (
        <p className="mt-3 text-sm text-foreground-muted">Chargement du moteur…</p>
      )}
    </section>
  );
}
