/** Pictogramme du NIVEAU 1 (grille de dossiers) et de l'en-tête de `OpeningTrapDrill` — purement décoratif, aucune logique métier ne s'appuie dessus. */
const FAMILY_ICON: Record<string, string> = {
  "Partie Italienne": "🇮🇹",
  "Défense Sicilienne": "🐍",
  "Défense Caro-Kann": "🛡️",
  "Ruy Lopez": "🇪🇸",
  "Gambit Dame": "♛",
  "Gambit Contre Albin": "♞",
  "Débuts Ouverts": "⚔️",
  "Défense Scandinave": "❄️",
  "Partie Viennoise": "🇦🇹",
  "Défense Philidor": "♙",
  "Center Opening": "🎯",
  "Défense Hollandaise": "🇳🇱",
  "Gambit Blackmar-Diemer": "💣",
};

const DEFAULT_FAMILY_ICON = "♟️";

/** Retombe sur un pion générique pour toute famille absente de la table ci-dessus (contenu importé, voir `imported_traps`). */
export function familyIcon(family: string): string {
  return FAMILY_ICON[family] ?? DEFAULT_FAMILY_ICON;
}
