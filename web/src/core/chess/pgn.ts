/**
 * Sépare un flux PGN multi-parties en parties individuelles.
 *
 * L'export Lichess (comme la plupart des exports PGN) concatène les parties
 * sans séparateur dédié : chaque nouvelle partie commence par `[Event`, c'est
 * la seule frontière fiable.
 */
export function splitPgnGames(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  return trimmed
    .split(/\n(?=\[Event )/)
    .map((game) => game.trim())
    .filter(Boolean);
}

const SITE_ID_PATTERN = /\[Site\s+"https:\/\/lichess\.org\/(\w+)"/;

/** Identifiant de partie Lichess extrait de l'en-tête PGN `Site`. */
export function extractLichessId(pgn: string): string | null {
  return SITE_ID_PATTERN.exec(pgn)?.[1] ?? null;
}
