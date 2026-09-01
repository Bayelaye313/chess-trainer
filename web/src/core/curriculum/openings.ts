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
  /**
   * Arbre PGN complet du chapitre — coups + sous-variantes entre parenthèses
   * + commentaires de nommage (voir `core/chess/pgn-tree.ts` pour la
   * convention exacte et `server/curriculum/opening-tree-index.ts` pour son
   * exploitation). Chaîne pure, aucune dépendance à chess.js ici — le parsing
   * n'a lieu qu'en aval, à la demande.
   *
   * `undefined` : ce chapitre garde l'ancien comportement (ligne unique
   * `moves` + découverte de variantes par BFS sur la base ECO embarquée) —
   * une migration progressive, pas une réécriture de tout le catalogue d'un
   * coup. Quand présent, les `moves.length` premiers coups de la ligne
   * principale de cet arbre DOIVENT être identiques à `moves` (voir le test).
   */
  pgn?: string;
}

export const OPENINGS: readonly OpeningLine[] = [
  {
    id: "ruy-lopez",
    name: "Ruy Lopez (Espagnole)",
    eco: "C60",
    side: "white",
    description: "L'ouverture la plus jouée à haut niveau depuis un siècle : pression durable sur le cavalier c6.",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"],
    pgn: `1.e4 e5 2.Nf3 Nc6 3.Bb5 a6
      (3...Nf6 {Défense Berlinoise} 4.O-O Nxe4 5.d4 Nd6 6.Bxc6 dxc6 7.dxe5 Nf5 8.Qxd8+ Kxd8 9.Nc3 Ke8 10.h3 h6 11.Bf4 Be6 12.Rad1 Be7)
      (3...d6 {Défense Steinitz} 4.d4 Bd7 5.Nc3 Nf6 6.O-O Be7 7.Re1 exd4 8.Nxd4 O-O 9.Bxc6 Bxc6 10.Qd3 Re8 11.Nxc6 bxc6 12.b3 d5)
      4.Ba4
      (4.Bxc6 {Variante d'Échange} dxc6 5.O-O f6 6.d4 exd4 7.Nxd4 c5 8.Nb3 Qxd1 9.Rxd1 Bg4 10.f3 Be6 11.Nc3 Bxb3 12.axb3 Rd8)
      d6 {Steinitz Différée}
      (4...Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 d6 8.c3 O-O 9.h3 Na5 10.Bc2 c5 11.d4 Qc7 12.Nbd2 Bd7 13.Nf1 Rfe8 14.Ng3 g6)
      5.c3 f5 {Variante de la Sieste}
      (5...Bd7 6.d4 Nf6 7.Nbd2 Be7 8.O-O O-O 9.Re1 exd4 10.cxd4 Nb4 11.Bc2 Bb5 12.a3 Nc6 13.Nb3 Re8)
      6.exf5 Bxf5 7.d4 e4 8.Ng5 d5 9.f3 h6 10.Ne6 Qd7 11.Nxf8 Kxf8 12.O-O g6`,
  },
  {
    id: "italian-game",
    name: "Partie Italienne",
    eco: "C50",
    side: "white",
    description: "Développement naturel et rapide, vise directement la case f7.",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"],
    pgn: `1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 {Giuoco Piano}
      (3...Nf6 {Défense des Deux Cavaliers} 4.Ng5 d5 5.exd5 Na5 6.Bb5+ c6 7.dxc6 bxc6 8.Be2 h6 9.Nf3 e4)
      4.c3 (4.b4 {Gambit Evans} Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O)
      Nf6 5.d3 d6 6.O-O O-O`,
  },
  {
    id: "scotch-game",
    name: "Partie Écossaise",
    eco: "C45",
    side: "white",
    description: "Ouvre le centre tout de suite pour des positions concrètes, plus tactiques que la Ruy Lopez.",
    moves: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4"],
    pgn: `1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Bc5 {Variante Classique}
      (4...Nf6 {Variante Schmidt}
        5.Nxc6 (5.Nc3 {Quatre Cavaliers Écossaise} Bb4 6.Nxc6 bxc6 7.Bd3 d5 8.exd5 cxd5 9.O-O O-O 10.Bg5 c6 11.Qf3 Be7 12.Rad1 h6)
        bxc6 6.e5 Qe7 7.Qe2 Nd5 8.c4 Ba6 9.b3 g6 10.g3 Bg7 11.Bb2 O-O 12.Nc3 Rae8 13.O-O-O c5)
      5.Be3 Qf6 6.c3 Nge7 7.Bc4
      (7.Nc2 {Variante Malaniuk} Bb6 8.Nd2 O-O 9.Be2 d6 10.O-O Bd7 11.Nb3 a5 12.a4 Rae8)
      Ne5 8.Be2 Qg6 9.O-O d6 10.Kh1 O-O 11.f4 Nd7 12.Nd2 f5`,
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
    name: "Sicilienne Ouverte (Najdorf & Cie)",
    eco: "B20",
    side: "black",
    description:
      "3.d4 : la Sicilienne Ouverte, la plus riche en théorie de tout l'échiquier. Najdorf en ligne principale, avec Dragon, Sveshnikov et Scheveningen en chapitres nommés une fois dedans.",
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"],
    pgn: `1.e4 c5 2.Nf3 d6
      (2...Nc6 {Sicilienne : Sveshnikov} 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 e5 6.Ndb5 d6 7.Bg5 a6 8.Na3 b5 9.Nd5 Be7
        (9...Nxd5 {Ligne des Échanges} 10.exd5 Ne7 11.c3 Ng6 12.Nc2 Be7 13.Be2 O-O 14.O-O a5 15.a4 bxa4 16.Rxa4 f5)
        10.Bxf6 Bxf6 11.c3 Bg5 12.Nc2 O-O)
      3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6
      (5...g6 {Sicilienne : Dragon, Attaque Yougoslave} 6.Be3 Bg7 7.f3 O-O 8.Qd2 Nc6 9.Bc4 Bd7 10.O-O-O Rc8 11.Bb3 Ne5 12.h4 h5
        (12...Nc4 {Variante Chinoise} 13.Bxc4 Rxc4 14.h5 Nxh5 15.g4 Nf6 16.Nde2 Qa5 17.Bh6 Bxh6 18.Qxh6 Rfc8))
      (5...e6 {Sicilienne : Scheveningen}
        6.Be2
        (6.g4 {Attaque Keres} h6 7.h4 Nc6 8.Rg1 h5 9.gxh5 Nxh5 10.Nxc6 bxc6 11.e5 dxe5 12.Qxd8+ Kxd8)
        Be7 7.O-O O-O 8.f4 Nc6 9.Be3 a6 10.Qe1 Qc7 11.Qg3 Kh8 12.Rae1 Re8)
      6.Be3
      (6.Bg5 {Variante principale} e6 7.f4 Be7 8.Qf3 Qc7 9.O-O-O Nbd7 10.g4 b5)
      (6.Be2 e5 7.Nb3 Be7 8.O-O O-O 9.Be3 Be6 10.Qd2 Nbd7)
      {Sicilienne : Najdorf, Attaque Anglaise} e5 7.Nb3 Be6 8.f3 Be7 9.Qd2 O-O 10.O-O-O b5 11.g4 b4 12.Nd5 Bxd5 13.exd5 a5`,
  },
  {
    id: "sicilian-alapin",
    name: "Anti-Sicilienne : Alapine",
    eco: "B22",
    side: "white",
    description: "Évite la théorie lourde de la Sicilienne ouverte en préparant d4 sans céder le centre.",
    moves: ["e4", "c5", "c3", "Nf6", "e5", "Nd5", "d4"],
    pgn: `1.e4 c5 2.c3 Nf6 3.e5 Nd5 4.d4 cxd4
      (4...d6 {Variante de Barmen} 5.Nf3 Nc6 6.exd6 Qxd6 7.Na3 e5 8.Nc4 Qc7 9.dxe5 Nxe5 10.Ncxe5 Qxe5)
      5.Nf3 Nc6 6.cxd4 d6 7.Bc4 Nb6 8.Bb3 dxe5 9.Nxe5 e6 10.O-O Be7 11.Nc3 O-O 12.Be3 Nd5`,
  },
  {
    id: "smith-morra-gambit",
    name: "Gambit Smith-Morra",
    eco: "B21",
    side: "white",
    description: "Sacrifice le pion c pour un développement fulgurant et des colonnes ouvertes contre le roi noir.",
    moves: ["e4", "c5", "d4", "cxd4", "c3"],
    pgn: `1.e4 c5 2.d4 cxd4 3.c3 dxc3 4.Nxc3 Nc6 5.Nf3 d6 6.Bc4 e6 7.O-O a6 8.Qe2 Nf6
      (8...Nge7 {Variante des Cavaliers} 9.Rd1 Ng6 10.Bg5 Be7 11.Rac1 O-O 12.Bb3 h6)
      9.Rd1 Be7 10.Bf4 O-O 11.Rac1 Qa5 12.Bb3 Bd7`,
  },
  {
    id: "caro-kann",
    name: "Défense Caro-Kann",
    eco: "B10",
    side: "black",
    description: "Solide et sans concession : ...d5 soutenu par ...c6, une structure de pions saine pour la fin de partie.",
    moves: ["e4", "c6", "d4", "d5"],
    pgn: `1.e4 c6 2.d4 d5
      3.Nc3
      (3.e5 {Variante d'Avance} Bf5 4.Nf3 e6 5.Be2 c5 6.Be3 Nc6 7.c3 Nge7 8.Na3 cxd4 9.cxd4 Qb6 10.Qb3 Rc8)
      (3.exd5 {Variante d'Échange} cxd5
        4.Bd3
        (4.c4 {Attaque Panov-Botvinnik} Nf6 5.Nc3 Nc6 6.Nf3 e6 7.cxd5 Nxd5 8.Bc4 Nb6 9.Bb3 Be7 10.O-O O-O 11.Re1 Bf6 12.Be3 a6)
        Nc6 5.c3 Nf6 6.Bf4 Bg4 7.Qb3 Qd7 8.Nd2 e6 9.Ngf3 Rc8 10.O-O Bd6)
      (3.f3 {Variante Fantaisie} e6 4.Nc3 Bb4 5.Bd2 dxe4 6.fxe4 e5 7.Nf3 Bg4 8.Be2 Nd7)
      dxe4 4.Nxe4 Bf5 5.Ng3 Bg6 6.h4 h6 7.Nf3 Nd7 {Variante Classique}
      8.h5 Bh7 9.Bd3 Bxd3 10.Qxd3 e6 11.Bd2 Ngf6 12.O-O-O Be7`,
  },
  {
    id: "french-defense",
    name: "Défense Française",
    eco: "C00",
    side: "black",
    description: "Structure fermée typique, contre-jeu sur les colonnes c et f une fois le centre fixé.",
    moves: ["e4", "e6", "d4", "d5"],
    pgn: `1.e4 e6 2.d4 d5
      3.Nc3
      (3.e5 {Variante d'Avance} c5 4.c3 Nc6 5.Nf3 Qb6 6.a3 Nh6 7.b4 cxd4 8.cxd4 Nf5 9.Bb2 Be7 10.Bd3 Bd7)
      (3.exd5 {Variante d'Échange} exd5 4.Nf3 Nf6 5.Bd3 Bd6 6.O-O O-O 7.Bg5 c6 8.Qd2 Nbd7 9.Re1 Re8)
      (3.Nd2 {Variante Tarrasch} c5 4.exd5 exd5 5.Ngf3 Nc6 6.Bb5 Bd6 7.dxc5 Bxc5 8.O-O Nge7 9.Nb3 Bd6 10.Nbd4 O-O 11.Re1 Bg4)
      Nf6 (3...Bb4 {Variante Winawer} 4.e5 c5 5.a3 Bxc3+ 6.bxc3 Ne7 7.Qg4 Qc7 8.Qxg7 Rg8 9.Qxh7 cxd4 10.Ne2 Nbc6 11.f4 Bd7 12.Qd3 O-O-O)
      4.Bg5 Be7 (4...Bb4 {Variante MacCutcheon} 5.e5 h6 6.Bd2 Bxc3 7.bxc3 Ne4 8.Qg4 Kf8 9.Bd3 Nxd2 10.Kxd2 c5 11.Nf3 Nc6)
      5.e5 Nfd7 6.Bxe7 Qxe7 7.f4 O-O 8.Nf3 c5 9.Qd2 Nc6 10.dxc5 Qxc5 11.O-O-O a6 12.Kb1 b5`,
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
    pgn: `1.d4 d5 2.c4 e6 {Refusé}
      (2...c6 {Défense Slave} 3.Nf3 Nf6 4.Nc3 dxc4 5.a4 Bf5 6.e3 e6 7.Bxc4 Bb4 8.O-O O-O 9.Qe2 Nbd7 10.e4 Bg6 11.Bd3 Rc8 12.Rd1 Nb6)
      (2...dxc4 {Gambit Dame Accepté} 3.Nf3 Nf6 4.e3 e6 5.Bxc4 c5 6.O-O a6 7.Qe2 b5 8.Bb3 Bb7 9.Nc3 Nbd7 10.Rd1 Qc7)
      3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 Nbd7 7.Rc1 c6 8.Bd3 dxc4 9.Bxc4 Nd5 10.Bxe7 Qxe7 11.O-O Nxc3 12.Rxc3 e5`,
  },
  {
    id: "queens-gambit-declined",
    name: "Gambit Dame Refusé",
    eco: "D35",
    side: "black",
    description: "...e6 refuse le pion offert et vise une position solide, quitte à concéder un peu d'espace.",
    moves: ["d4", "d5", "c4", "e6", "Nc3", "Nf6"],
    pgn: `1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5
      (4.cxd5 {Variante d'Échange} exd5 5.Bg5 c6 6.e3 Be7 7.Bd3 Nbd7 8.Qc2 O-O 9.Nge2 Re8 10.O-O Nf8 11.Rab1 Ne6 12.Bxf6 Bxf6)
      Be7
      (4...Nbd7 {Défense Cambridge Springs} 5.e3 c6 6.Nf3 Qa5 7.Nd2 Bb4 8.Qc2 O-O 9.Bh4 dxc4 10.Bxc4 Nb6)
      5.e3 O-O 6.Nf3 Nbd7
      (6...h6 {Défense Lasker} 7.Bh4 Ne4 8.Bxe7 Qxe7 9.Rc1 Nxc3 10.Rxc3 dxc4 11.Bxc4 c5 12.O-O Nc6 13.Qe2 cxd4)
      7.Rc1 c6 8.Bd3 dxc4 9.Bxc4 Nd5 10.Bxe7 Qxe7 11.O-O Nxc3 12.Rxc3 e5`,
  },
  {
    id: "slav-defense",
    name: "Défense Slave",
    eco: "D10",
    side: "black",
    description: "Défend d5 sans fermer la diagonale du fou c8, plus flexible que le Gambit Dame Refusé classique.",
    moves: ["d4", "d5", "c4", "c6"],
    pgn: `1.d4 d5 2.c4 c6 3.Nf3
      (3.Nc3 {Semi-Slave Tchèque} Nf6 4.Nf3 e6 5.e3 Nbd7 6.Bd3 dxc4 7.Bxc4 b5 8.Bd3 Bd6 9.O-O O-O 10.Qc2 Qc7)
      Nf6 4.Nc3 dxc4 5.a4 Bf5 6.e3 e6 7.Bxc4 Bb4 8.O-O O-O 9.Qe2 Nbd7 10.e4 Bg6 11.Bd3 Rc8 12.Rd1 Nb6`,
  },
  {
    id: "kings-indian",
    name: "Défense Est-Indienne",
    eco: "E60",
    side: "black",
    description: "Fianchetto du roi et contre-attaque tranchante à l'aile roi — un classique des joueurs offensifs.",
    moves: ["d4", "Nf6", "c4", "g6"],
    pgn: `1.d4 Nf6 2.c4 g6 3.Nc3
      (3.g3 {Variante Fianchetto} Bg7 4.Bg2 O-O 5.Nc3 d6 6.Nf3 Nbd7 7.O-O e5 8.e4 c6)
      Bg7 4.e4 d6 5.Nf3
      (5.f3 {Variante Sämisch} O-O 6.Be3 e5 7.Nge2 c6 8.Qd2 a6 9.O-O-O b5)
      O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7 9.Ne1 Nd7 10.Be3 f5`,
  },
  {
    id: "nimzo-indian",
    name: "Défense Nimzo-Indienne",
    eco: "E20",
    side: "black",
    description: "Clouage immédiat sur c3 pour déséquilibrer la structure de pions blanche dès le 4e coup.",
    moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"],
    pgn: `1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3
      (4.Qc2 {Variante Classique} O-O 5.a3 Bxc3 6.Qxc3 b6 7.Bg5 Bb7 8.f3 d5)
      (4.Bg5 {Variante Leningrad} h6 5.Bh4 c5 6.d5 d6 7.e3 e5 8.Bd3 g5)
      O-O 5.Bd3 d5 6.Nf3 c5 7.O-O Nc6 8.a3 Bxc3 9.bxc3 dxc4 10.Bxc4 Qc7`,
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
