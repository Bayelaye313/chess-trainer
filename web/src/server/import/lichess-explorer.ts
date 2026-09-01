import "server-only";

/**
 * Fréquence humaine des coups d'ouverture — interroge l'API publique Lichess
 * Opening Explorer (base "lichess", toutes parties humaines confondues,
 * aucune clé requise) pour prioriser, dans le Mode Entraînement, les coups
 * que de VRAIS joueurs essaient le plus souvent à une position donnée
 * (approche Chessreps), plutôt qu'un tirage uniforme parmi les coups
 * théoriques (voir `use-opening-drill.ts`).
 *
 * Même patron que `server/import/sync-platforms.ts` (`getJson` : User-Agent,
 * timeout, jamais de throw qui remonterait jusqu'au drill) — un réseau lent
 * ou une position que Lichess ne connaît pas doit dégrader silencieusement
 * vers le tirage uniforme existant, jamais bloquer ou planter l'entraînement.
 *
 * Contrairement à `server/import/openings.ts` (base ECO embarquée, 100%
 * offline), cette source EST un appel réseau — volontairement isolée dans son
 * propre module pour que ce soit visible et remplaçable sans toucher à la
 * détection théorique elle-même.
 *
 * DÉSACTIVÉ PAR DÉFAUT (`LICHESS_EXPLORER_ENABLED` non défini) : derrière un
 * réseau d'entreprise qui bloque explorer.lichess.org, la dégradation
 * silencieuse existante (timeout + catch → `[]`) ne plantait déjà rien, mais
 * chaque position déclenchait quand même une tentative sortante — latence de
 * plusieurs secondes à chaque coup, et bruit potentiel dans les journaux d'un
 * pare-feu/DLP d'entreprise. Le court-circuit ci-dessous évite la tentative
 * elle-même ; mettre `LICHESS_EXPLORER_ENABLED=true` dans l'environnement
 * réactive la fonctionnalité (fréquence humaine des coups en Mode
 * Entraînement) sur un réseau qui l'autorise. À ne pas confondre avec
 * `server/import/openings.ts` : la détection théorique ELLE-MÊME (« coup
 * connu / hors théorie ») reste inconditionnellement 100% offline, qu'importe
 * cette variable.
 */
const EXPLORER_ENABLED = process.env.LICHESS_EXPLORER_ENABLED === "true";

const HEADERS = {
  "User-Agent": "ChessTrainerLocal/1.0 (projet local personnel, sans finalité commerciale)",
};
const REQUEST_TIMEOUT_MS = 8_000;

/** Un coup connu de Lichess depuis la position interrogée, avec son volume de parties humaines. */
export interface PopularMove {
  uci: string;
  san: string;
  /** Somme des parties blanches/nulles/noires recensées pour ce coup — sert de poids de tirage. */
  games: number;
}

interface LichessExplorerMove {
  uci?: string;
  san?: string;
  white?: number;
  draws?: number;
  black?: number;
}

interface LichessExplorerResponse {
  moves?: LichessExplorerMove[];
}

/**
 * `chess-openings` (voir `server/import/openings.ts`) ne porte aucune donnée
 * de popularité — seule la liste des coups théoriques, sans poids. Ce cache
 * mémoire (même esprit que `variationsCache` dans `server/queries/openings.ts`)
 * évite de re-sonder Lichess à chaque position déjà vue pendant une session ;
 * plafonné pour ne jamais grossir sans fin sur une longue session
 * d'exploration libre.
 */
const MAX_CACHE_ENTRIES = 500;
const popularityCache = new Map<string, PopularMove[]>();
/** Cache dédié à `fetchLichessMasters` — même plafond, jamais partagé avec `popularityCache` (deux bases Lichess distinctes, voir son docstring). */
const mastersCache = new Map<string, PopularMove[]>();

function cachePut(cache: Map<string, PopularMove[]>, fen: string, moves: PopularMove[]): void {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    // La plus ancienne entrée insérée (ordre d'insertion des `Map`) — pas une
    // vraie LRU, mais un garde-fou suffisant pour un usage mono-utilisateur.
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) cache.delete(oldestKey);
  }
  cache.set(fen, moves);
}

function parseExplorerMoves(data: LichessExplorerResponse): PopularMove[] {
  return (data.moves ?? [])
    .filter((m): m is Required<Pick<LichessExplorerMove, "uci" | "san">> & LichessExplorerMove =>
      Boolean(m.uci && m.san),
    )
    .map((m) => ({
      uci: m.uci!,
      san: m.san!,
      games: (m.white ?? 0) + (m.draws ?? 0) + (m.black ?? 0),
    }))
    .filter((m) => m.games > 0)
    .sort((a, b) => b.games - a.games);
}

/**
 * Interroge un endpoint de l'Opening Explorer Lichess (`lichess` ou `master`)
 * avec le même garde-fou réseau partout : timeout, dégradation silencieuse
 * vers `[]` en cas d'erreur/JSON inattendu, jamais d'exception qui remonterait
 * à l'appelant — voir le docstring du fichier.
 */
async function fetchExplorerMoves(endpoint: "lichess" | "master", fen: string): Promise<PopularMove[]> {
  if (!EXPLORER_ENABLED) return [];
  try {
    const url = `https://explorer.lichess.org/${endpoint}?fen=${encodeURIComponent(fen)}&moves=20&topGames=0&recentGames=0`;
    const response = await fetch(url, {
      headers: HEADERS,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) return [];
    return parseExplorerMoves((await response.json()) as LichessExplorerResponse);
  } catch {
    // Timeout, panne réseau, JSON inattendu… tout dégrade vers "pas de donnée
    // de popularité", jamais vers une exception (voir le docstring du fichier).
    return [];
  }
}

/**
 * Coups joués par de vrais humains depuis `fen`, triés par volume de parties
 * décroissant — `[]` si Lichess ne connaît pas la position, répond en erreur,
 * ou met trop de temps à répondre (jamais une exception : voir le docstring
 * du fichier).
 */
export async function fetchLichessPopularity(fen: string): Promise<PopularMove[]> {
  const cached = popularityCache.get(fen);
  if (cached) return cached;
  const moves = await fetchExplorerMoves("lichess", fen);
  cachePut(popularityCache, fen, moves);
  return moves;
}

/**
 * Coups RÉELLEMENT joués par des maîtres (base "masters" de Lichess — parties
 * de joueurs titrés/tournois classiques, jamais la masse des parties
 * amateures de `fetchLichessPopularity`), triés par volume décroissant — sert
 * `server/queries/opening-mistakes.ts` à reconnaître une transposition vers
 * une ligne de maîtres légitime plutôt qu'une vraie erreur de répertoire (voir
 * son docstring). Même garde-fou de dégradation silencieuse que
 * `fetchLichessPopularity` — un coup qui n'y figure pas ne prouve rien de mal,
 * `[]` signale juste "aucune donnée", jamais une exception.
 */
export async function fetchLichessMasters(fen: string): Promise<PopularMove[]> {
  const cached = mastersCache.get(fen);
  if (cached) return cached;
  const moves = await fetchExplorerMoves("master", fen);
  cachePut(mastersCache, fen, moves);
  return moves;
}
