import { scopedGet, scopedSet } from "@/client/storage/user-storage";
import { ChessBishop, ChessPawn, ChessQueen, ChessRook, type LucideIcon } from "lucide-react";
import type { BotProfileId } from "@/core/chess/bot-profiles";

/**
 * Table d'affichage des bots (couche UI) : `core/chess/bot-profiles.ts`
 * garde ses libellés d'origine (avec emojis), l'interface montre un nom, un
 * niveau et une icône d'une seule bibliothèque.
 */
export const BOT_DISPLAY: Record<BotProfileId, { name: string; level: string; blurb: string; icon: LucideIcon }> = {
  poussin: { name: "Poussin", level: "Débutant", blurb: "Commence ici ton apprentissage.", icon: ChessPawn },
  club: { name: "Club", level: "Intermédiaire", blurb: "Un joueur tactique et solide de club.", icon: ChessBishop },
  champion: { name: "Champion", level: "Avancé", blurb: "Calculateur redoutable de tournoi.", icon: ChessRook },
  stockfish: { name: "Stockfish", level: "Maître", blurb: "Puissance brute, sans aucune bride.", icon: ChessQueen },
};

/** Dernier réglage choisi, rejoué par « Commencer » et par le raccourci de l'accueil. */
export const LAST_SETUP_KEY = "chess-trainer:last-bot-setup";

export interface BotSetup {
  profileId: BotProfileId;
  color: "w" | "b";
}

export function readLastSetup(): BotSetup | null {
  try {
    const raw = scopedGet("local", LAST_SETUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BotSetup>;
    if (!parsed.profileId || !(parsed.profileId in BOT_DISPLAY) || (parsed.color !== "w" && parsed.color !== "b")) return null;
    return { profileId: parsed.profileId, color: parsed.color };
  } catch {
    return null;
  }
}

export function writeLastSetup(setup: BotSetup): void {
  try {
    scopedSet("local", LAST_SETUP_KEY, JSON.stringify(setup));
  } catch {
    // Stockage indisponible (navigation privée) : le choix n'est simplement pas mémorisé.
  }
}

/**
 * Nom d'adversaire tel qu'affiché : les parties contre le bot enregistrent le
 * libellé du profil (« 🟢 Poussin (Débutant) ») ; l'interface retire l'emoji
 * de tête. Les pseudos importés passent inchangés.
 */
export function displayOpponentName(name: string | null): string {
  if (!name) return "Adversaire inconnu";
  return name.replace(/^[^\p{L}\p{N}]+/u, "").trim() || name;
}
