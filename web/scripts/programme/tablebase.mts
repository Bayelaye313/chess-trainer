/**
 * Client minimal de la tablebase Syzygy hébergée par Lichess
 * (https://tablebase.lichess.ovh, ≤ 7 pièces, résultat exact).
 *
 * Sert deux usages du générateur : valider les positions pédagogiques
 * construites (Lucena, Philidor) coup par coup, et ajouter le verdict exact
 * aux puzzles Lichess de 7 pièces ou moins.
 */
const HEADERS = { "User-Agent": "ChessTrainerLocal/1.0 (projet local personnel, sans finalité commerciale)" };

export type TbCategory = "win" | "draw" | "loss" | "cursed-win" | "blessed-loss" | "maybe-win" | "maybe-loss" | "unknown";

export interface TbMove { uci: string; san: string; category: TbCategory; dtz: number | null; dtm: number | null }
export interface TbResult { category: TbCategory; dtz: number | null; dtm: number | null; moves: TbMove[] }

let last = 0;
export async function probe(fen: string): Promise<TbResult> {
  // Politesse envers le service public : au plus ~4 requêtes par seconde.
  const wait = Math.max(0, last + 250 - Date.now());
  if (wait) await new Promise((r) => setTimeout(r, wait));
  last = Date.now();
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const res = await fetch(`https://tablebase.lichess.ovh/standard?fen=${encodeURIComponent(fen)}`, { headers: HEADERS, signal: AbortSignal.timeout(15_000) });
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 60_000));
      continue;
    }
    if (!res.ok) throw new Error(`tablebase ${res.status} pour ${fen}`);
    return (await res.json()) as TbResult;
  }
  throw new Error(`tablebase : trop de requêtes pour ${fen}`);
}

/** Catégorie du point de vue du camp qui vient de jouer `move` (la tablebase la donne pour l'adversaire). */
export function categoryForMover(move: TbMove): "win" | "draw" | "loss" | "unknown" {
  if (move.category === "loss" || move.category === "blessed-loss" || move.category === "maybe-loss") return move.category === "loss" ? "win" : "draw";
  if (move.category === "win" || move.category === "cursed-win" || move.category === "maybe-win") return move.category === "win" ? "loss" : "draw";
  if (move.category === "draw") return "draw";
  return "unknown";
}
