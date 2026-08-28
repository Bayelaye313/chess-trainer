/**
 * Catalogue statique de l'onglet « Ouvertures » — même parti pris que
 * `catalog.ts` pour l'académie « Apprendre » : pure donnée, aucune dépendance
 * à `chess-openings` ici (les ~3 Mo de base ECO restent strictement
 * server-only, voir `server/curriculum/openings.ts` et `next.config.ts`).
 *
 * Chaque entrée est une ligne de référence (SAN, dans l'ordre) menant à une
 * position caractéristique d'une famille d'ouverture connue — le point de
 * départ d'une exploration, pas un répertoire figé : `OpeningExplorer`
 * permet de dévier librement dès le premier coup.
 *
 * `eco`/`name` désignent la FAMILLE (le nom encyclopédique usuel), pas
 * forcément le code exact de la position terminale — voir l'annotation
 * coup par coup (base ECO réelle) pour la précision ply par ply, qui peut
 * légitimement diverger une fois sorti des variantes les plus jouées.
 */

export type OpeningSide = "white" | "black";

export interface OpeningLine {
  /** Slug ASCII stable, utilisé dans l'URL `/ouvertures/[slug]`. */
  id: string;
  name: string;
  eco: string;
  /** Le camp pour qui cette ligne constitue un choix d'ouverture. */
  side: OpeningSide;
  description: string;
  /** Coups en notation SAN, depuis la position de départ. */
  moves: readonly string[];
}

export const OPENINGS: readonly OpeningLine[] = [
  {
    id: "ruy-lopez",
    name: "Ruy Lopez (Espagnole)",
    eco: "C60",
    side: "white",
    description: "L'ouverture la plus jouée à haut niveau depuis un siècle : pression durable sur le cavalier c6.",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"],
  },
  {
    id: "italian-game",
    name: "Partie Italienne",
    eco: "C50",
    side: "white",
    description: "Développement naturel et rapide, vise directement la case f7.",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"],
  },
  {
    id: "scotch-game",
    name: "Partie Écossaise",
    eco: "C45",
    side: "white",
    description: "Ouvre le centre tout de suite pour des positions concrètes, plus tactiques que la Ruy Lopez.",
    moves: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4"],
  },
  {
    id: "vienna-gambit",
    name: "Gambit Viennois",
    eco: "C29",
    side: "white",
    description: "Une Viennoise agressive : le pion f4 relance immédiatement la lutte pour le centre.",
    moves: ["e4", "e5", "Nc3", "Nf6", "f4"],
  },
  {
    id: "kings-gambit",
    name: "Gambit du Roi",
    eco: "C30",
    side: "white",
    description: "Sacrifice de pion romantique pour un développement fulgurant et une attaque directe sur le roi noir.",
    moves: ["e4", "e5", "f4"],
  },
  {
    id: "sicilian-najdorf",
    name: "Sicilienne : Najdorf",
    eco: "B90",
    side: "black",
    description: "La variante la plus respectée de la Sicilienne : ...a6 prépare ...e5 ou ...b5 selon la réponse blanche.",
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"],
  },
  {
    id: "sicilian-alapin",
    name: "Anti-Sicilienne : Alapine",
    eco: "B22",
    side: "white",
    description: "Évite la théorie lourde de la Sicilienne ouverte en préparant d4 sans céder le centre.",
    moves: ["e4", "c5", "c3", "Nf6", "e5", "Nd5", "d4"],
  },
  {
    id: "caro-kann",
    name: "Défense Caro-Kann",
    eco: "B10",
    side: "black",
    description: "Solide et sans concession : ...d5 soutenu par ...c6, une structure de pions saine pour la fin de partie.",
    moves: ["e4", "c6", "d4", "d5"],
  },
  {
    id: "french-defense",
    name: "Défense Française",
    eco: "C00",
    side: "black",
    description: "Structure fermée typique, contre-jeu sur les colonnes c et f une fois le centre fixé.",
    moves: ["e4", "e6", "d4", "d5"],
  },
  {
    id: "pirc-defense",
    name: "Défense Pirc",
    eco: "B07",
    side: "black",
    description: "Hypermoderne : laisse les Blancs occuper le centre pour mieux le contre-attaquer avec les pièces.",
    moves: ["e4", "d6", "d4", "Nf6", "Nc3", "g6"],
  },
  {
    id: "scandinavian",
    name: "Défense Scandinave",
    eco: "B01",
    side: "black",
    description: "Simplifie tôt la position en échangeant au centre — un choix pratique et facile à apprendre.",
    moves: ["e4", "d5", "exd5", "Qxd5", "Nc3", "Qa5"],
  },
  {
    id: "queens-gambit",
    name: "Gambit Dame",
    eco: "D06",
    side: "white",
    description: "c4 met en question le pion d5 dès le deuxième coup — l'ouverture de dame la plus classique.",
    moves: ["d4", "d5", "c4"],
  },
  {
    id: "queens-gambit-declined",
    name: "Gambit Dame Refusé",
    eco: "D35",
    side: "black",
    description: "...e6 refuse le pion offert et vise une position solide, quitte à concéder un peu d'espace.",
    moves: ["d4", "d5", "c4", "e6", "Nc3", "Nf6"],
  },
  {
    id: "slav-defense",
    name: "Défense Slave",
    eco: "D10",
    side: "black",
    description: "Défend d5 sans fermer la diagonale du fou c8, plus flexible que le Gambit Dame Refusé classique.",
    moves: ["d4", "d5", "c4", "c6"],
  },
  {
    id: "kings-indian",
    name: "Défense Est-Indienne",
    eco: "E60",
    side: "black",
    description: "Fianchetto du roi et contre-attaque tranchante à l'aile roi — un classique des joueurs offensifs.",
    moves: ["d4", "Nf6", "c4", "g6"],
  },
  {
    id: "nimzo-indian",
    name: "Défense Nimzo-Indienne",
    eco: "E20",
    side: "black",
    description: "Clouage immédiat sur c3 pour déséquilibrer la structure de pions blanche dès le 4e coup.",
    moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"],
  },
  {
    id: "london-system",
    name: "Système Londres",
    eco: "D02",
    side: "white",
    description: "Un plan de développement quasi universel pour les Blancs, peu théorique et facile à maîtriser.",
    moves: ["d4", "d5", "Nf3", "Nf6", "Bf4"],
  },
  {
    id: "english-opening",
    name: "Partie Anglaise",
    eco: "A10",
    side: "white",
    description: "Un premier coup flexible qui peut transposer vers presque toutes les structures fermées.",
    moves: ["c4", "e5", "Nc3", "Nf6"],
  },
  {
    id: "grunfeld",
    name: "Défense Grünfeld",
    eco: "D80",
    side: "black",
    description: "Cède le centre pour le bombarder aussitôt avec les pièces — la réponse dynamique à 1.d4.",
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "d5"],
  },
  {
    id: "dutch-defense",
    name: "Défense Hollandaise",
    eco: "A80",
    side: "black",
    description: "...f5 revendique l'aile roi dès le premier coup pour une partie déséquilibrée et combative.",
    moves: ["d4", "f5"],
  },
] as const;

export function findOpening(id: string): OpeningLine | null {
  return OPENINGS.find((opening) => opening.id === id) ?? null;
}
