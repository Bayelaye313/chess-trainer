"use client";

/**
 * Onglet « Ouvertures » : bibliothèque statique (voir `core/curriculum/openings.ts`)
 * qu'on filtre et cherche entièrement côté client — une vingtaine d'entrées,
 * pas besoin d'aller-retour serveur pour ça (contrairement à `LearnScreen`,
 * qui dépend de la progression de l'utilisateur).
 */
import { useMemo, useState } from "react";
import type { OpeningSide } from "@/core/curriculum/openings";
import type { OpeningSummary } from "@/server/queries/openings";
import { OpeningCard } from "./opening-card";

type ColorFilter = OpeningSide | "both";

const COLOR_FILTERS: { id: ColorFilter; label: string }[] = [
  { id: "both", label: "Les deux camps" },
  { id: "white", label: "Blancs" },
  { id: "black", label: "Noirs" },
];

export function OpeningsScreen({ openings }: { openings: OpeningSummary[] }) {
  const [query, setQuery] = useState("");
  const [colorFilter, setColorFilter] = useState<ColorFilter>("both");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return openings.filter((opening) => {
      if (colorFilter !== "both" && opening.side !== colorFilter) return false;
      if (!needle) return true;
      return (
        opening.name.toLowerCase().includes(needle) ||
        opening.eco.toLowerCase().includes(needle) ||
        opening.description.toLowerCase().includes(needle)
      );
    });
  }, [openings, query, colorFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ouvertures</h1>
        <p className="mt-2 max-w-prose text-sm text-foreground-muted">
          Explore {openings.length} ouvertures classiques : rejoue leur ligne de référence coup par coup, ou dévie
          librement pour voir jusqu&apos;où la théorie te suit.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Chercher une ouverture…"
          aria-label="Chercher une ouverture"
          className="w-full max-w-xs rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent/60 focus:outline-none"
        />
        <div className="flex gap-1.5" role="group" aria-label="Filtrer par camp">
          {COLOR_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setColorFilter(filter.id)}
              aria-pressed={colorFilter === filter.id}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                colorFilter === filter.id
                  ? "border-accent/40 bg-accent/10 text-foreground"
                  : "border-border text-foreground-muted hover:border-accent/30 hover:text-foreground"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-foreground-muted">Aucune ouverture ne correspond à cette recherche.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((opening) => (
            <OpeningCard key={opening.id} opening={opening} />
          ))}
        </div>
      )}
    </div>
  );
}
