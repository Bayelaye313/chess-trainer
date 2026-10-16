"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { searchGames } from "@/server/actions/games";
import type { GameSummary } from "@/server/queries/games";
import { RecentGamesList } from "./recent-games-list";

const SEARCH_DEBOUNCE_MS = 300;

/** État de la recherche — `query` porté par `"ready"`/`"error"` pour savoir si le résultat affiché correspond bien à la frappe la plus récente (voir le docstring de `GamesSearchList`). */
type SearchState =
  | { status: "idle" }
  | { status: "ready"; query: string; results: GameSummary[] }
  | { status: "error"; query: string };

/**
 * Enveloppe `RecentGamesList` d'une barre de recherche instantanée (débounce
 * 300 ms) filtrant par pseudo de joueur ou nom de bot (`opponentName`, voir
 * `searchGamesSummary`) — cahier des charges §10.
 *
 * Deux modes, jamais mélangés :
 *  - recherche vide → la liste paginée reçue en props (comportement
 *    d'origine, inchangé) ;
 *  - recherche non vide → jusqu'à `GAMES_SEARCH_LIMIT` résultats à plat
 *    (`searchGames`, Server Action), pagination masquée.
 *
 * Les résultats de la recherche précédente restent affichés (légèrement
 * atténués) pendant qu'une nouvelle requête est en vol plutôt que de
 * basculer sur un état "Recherche…" à chaque frappe — évite tout
 * clignonement ET le rendu en cascade qu'un `setState` synchrone en tête
 * d'effet déclencherait (`react-hooks/set-state-in-effect`, même choix que
 * `use-book-continuations.ts`) : `setSearchState` n'est jamais appelé
 * ailleurs que dans les callbacks `.then()`/`.catch()` ci-dessous.
 *
 * `AnimatePresence mode="wait"` fait un simple fondu entre liste paginée et
 * liste de recherche — jamais de layout shift : le conteneur ne change pas
 * de position dans la page, seul son contenu s'anime.
 *
 * `gameHref`/`paginationHref` sont construits ICI (fonctions locales), pas
 * reçus en props : ce composant est `"use client"`, or une fonction passée
 * depuis un Server Component (`app/page.tsx`) ne peut pas franchir la
 * frontière serveur/client — React RSC refuse de la sérialiser. Ce
 * composant n'est de toute façon utilisé QUE sur l'accueil (`/`, pagination
 * par `?page=`, fiche partie sous `/analyse/`) : pas besoin de généricité ici.
 */
const gameHref = (id: string) => `/analyse/${id}`;
const paginationHref = (page: number) => `/?page=${page}`;

export function GamesSearchList({
  games,
  page,
  hasMore,
  pageSize,
}: {
  games: GameSummary[];
  page: number;
  hasMore: boolean;
  pageSize: number;
}) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const isSearching = debouncedQuery.length > 0;

  const [searchState, setSearchState] = useState<SearchState>({ status: "idle" });
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!isSearching) return;
    const requestId = ++requestIdRef.current;
    searchGames(debouncedQuery)
      .then((found) => {
        if (requestIdRef.current !== requestId) return;
        setSearchState({ status: "ready", query: debouncedQuery, results: found });
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return;
        setSearchState({ status: "error", query: debouncedQuery });
      });
  }, [debouncedQuery, isSearching]);

  // La requête en vol ne correspond pas (encore) à la frappe la plus
  // récente : on continue d'afficher l'ancien résultat, juste atténué.
  const isStale = searchState.status === "idle" || searchState.query !== debouncedQuery;

  return (
    <div className="space-y-3">
      <div className="relative">
        <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher une partie par pseudo ou nom de bot…"
          className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none"
        />
      </div>

      <AnimatePresence mode="wait">
        {isSearching ? (
          <motion.div
            key="search-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: isStale ? 0.5 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {searchState.status === "idle" ? (
              <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-foreground-muted">
                Recherche…
              </p>
            ) : searchState.status === "error" ? (
              <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-foreground-muted">
                Recherche impossible pour l&apos;instant — réessaie dans un instant.
              </p>
            ) : searchState.results.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-foreground-muted">
                Aucune partie ne correspond à « {debouncedQuery} ».
              </p>
            ) : (
              <RecentGamesList
                games={searchState.results}
                page={1}
                hasMore={false}
                pageSize={searchState.results.length}
                paginationHref={() => "#"}
                gameHref={gameHref}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="paginated-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <RecentGamesList
              games={games}
              page={page}
              hasMore={hasMore}
              pageSize={pageSize}
              paginationHref={paginationHref}
              gameHref={gameHref}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
