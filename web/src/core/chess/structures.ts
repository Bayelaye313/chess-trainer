/**
 * Reconnaissance de STRUCTURES à partir d'une FEN — le squelette de pions et
 * les configurations de pièces durables, par opposition aux motifs tactiques de
 * `core/chess/motifs/` qui, eux, qualifient un COUP.
 *
 * Pourquoi ce module existe : l'académie « Apprendre » compte 55 thèmes
 * stratégiques (« La structure Carlsbad », « Le hérisson », « Le mauvais fou »,
 * « Les pions pendants »…) auxquels aucune base de puzzles tactiques ne sait
 * répondre — Lichess taggue `fork` ou `mateIn2`, jamais « Maroczy ». Sans ces
 * prédicats, ces thèmes n'avaient d'autre choix qu'une FEN écrite à la main puis
 * démultipliée par rotations, c'est-à-dire trente fois le même exercice.
 *
 * Avec eux, « Module 3 : la structure Carlsbad » devient une REQUÊTE — « toutes
 * les positions du corpus dont le squelette est c3-d4 contre c6-d5 » — et sert
 * vingt-cinq positions issues de vingt-cinq parties différentes.
 *
 * Assumé, comme pour les motifs : c'est de la reconnaissance de forme, pas une
 * preuve. Un faux positif coûte un exercice un peu moins typé, jamais une
 * solution fausse — la solution, elle, vient toujours du moteur.
 *
 * Convention de coordonnées identique à `squares.ts` : file 0 = colonne a,
 * rank 0 = rangée 1. La FEN est lue ici à la main plutôt que via `chess.js` :
 * l'ingestion passe ces prédicats sur des centaines de milliers de positions
 * candidates, et instancier un `Chess` par position y coûte deux ordres de
 * grandeur de plus qu'un parcours de chaîne.
 */

/** Les structures reconnues. Clés machine stables : elles finissent dans le dataset et dans les requêtes de thème. */
export const STRUCTURE_TAGS = [
  // — Squelettes de pions nommés —
  "carlsbad",
  "maroczy",
  "hedgehog",
  "french_chain",
  "kings_indian_chain",
  "isolani",
  "hanging_pawns",
  "minority_attack",
  // — Traits de structure génériques —
  "doubled_pawns",
  "backward_pawn",
  "passed_pawn",
  "protected_passed_pawn",
  "blockaded_passer",
  "queenside_majority",
  "symmetric_pawns",
  "closed_center",
  "open_center",
  "space_advantage",
  // — Configurations de pièces durables —
  "open_file",
  "semi_open_file",
  "rook_seventh",
  "heavy_battery",
  "alekhine_gun",
  "bishop_queen_battery",
  "knight_outpost",
  "bad_bishop",
  "bishop_pair",
  "opposite_bishops",
  "fianchetto",
  "weak_color_complex",
  // — Types de finale —
  "pawn_endgame",
  "rook_endgame",
  "bishop_endgame",
  "knight_vs_bishop",
] as const;

export type StructureTag = (typeof STRUCTURE_TAGS)[number];

export type StructureColor = "w" | "b";

/**
 * Une position décortiquée une seule fois, puis interrogée par tous les
 * prédicats. Les reconstruire à chaque prédicat serait le coût dominant de
 * l'ingestion.
 */
export interface ParsedPosition {
  /** `board[rank][file]`, lettre FEN (`"P"`, `"n"`…) ou `null`. */
  board: (string | null)[][];
  /** `pawns.w[file]` = rangées occupées par un pion blanc de cette colonne, croissantes. */
  pawns: Record<StructureColor, number[][]>;
  /** Nombre de pièces par lettre FEN — `counts.N` = cavaliers blancs. */
  counts: Record<string, number>;
  /** Total de pièces sur l'échiquier, rois compris. */
  pieceCount: number;
}

const EMPTY_RANKS: readonly number[] = [];

/** Lit le champ de placement d'une FEN. Renvoie `null` si le placement est illisible. */
export function parsePosition(fen: string): ParsedPosition | null {
  const placement = fen.split(" ")[0];
  if (!placement) return null;

  const rows = placement.split("/");
  if (rows.length !== 8) return null;

  const board: (string | null)[][] = Array.from({ length: 8 }, () => Array<string | null>(8).fill(null));
  const pawns: Record<StructureColor, number[][]> = {
    w: Array.from({ length: 8 }, () => [] as number[]),
    b: Array.from({ length: 8 }, () => [] as number[]),
  };
  const counts: Record<string, number> = {};
  let pieceCount = 0;

  for (const [row, text] of rows.entries()) {
    // Les rangs FEN descendent (rangée 8 en premier), nos index montent.
    const rank = 7 - row;
    let file = 0;
    for (const char of text) {
      if (char >= "1" && char <= "8") {
        file += char.charCodeAt(0) - "0".charCodeAt(0);
        continue;
      }
      if (file > 7) return null;
      board[rank][file] = char;
      counts[char] = (counts[char] ?? 0) + 1;
      pieceCount += 1;
      if (char === "P") pawns.w[file].push(rank);
      else if (char === "p") pawns.b[file].push(rank);
      file += 1;
    }
    if (file !== 8) return null;
  }

  for (const color of ["w", "b"] as const) {
    for (const ranks of pawns[color]) ranks.sort((a, b) => a - b);
  }

  return { board, pawns, counts, pieceCount };
}

function pieceAt(position: ParsedPosition, file: number, rank: number): string | null {
  if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
  return position.board[rank][file];
}

/** Vrai si un pion de `color` occupe cette case. */
function hasPawn(position: ParsedPosition, color: StructureColor, file: number, rank: number): boolean {
  return pieceAt(position, file, rank) === (color === "w" ? "P" : "p");
}

function pawnRanks(position: ParsedPosition, color: StructureColor, file: number): readonly number[] {
  if (file < 0 || file > 7) return EMPTY_RANKS;
  return position.pawns[color][file];
}

function count(position: ParsedPosition, letter: string): number {
  return position.counts[letter] ?? 0;
}

function pawnTotal(position: ParsedPosition, color: StructureColor): number {
  return count(position, color === "w" ? "P" : "p");
}

/** Case claire ou sombre — a1 (file 0, rank 0) est sombre. */
function isLightSquare(file: number, rank: number): boolean {
  return (file + rank) % 2 === 1;
}

const FILE_C = 2;
const FILE_D = 3;
const FILE_E = 4;

// ---------------------------------------------------------------------------
// Squelettes nommés
// ---------------------------------------------------------------------------

/**
 * Structure Carlsbad : pions blancs c3+d4, noirs c6+d5, colonnes e non
 * engagées — le squelette du Gambit Dame refusé, échange de la variante, celui
 * qui appelle l'attaque de minorité.
 *
 * Reconnu par ses quatre pions caractéristiques et par l'ABSENCE de pion blanc
 * en e4 : avec e4, ce n'est plus un Carlsbad mais un centre de pions classique.
 */
export function isCarlsbad(position: ParsedPosition): boolean {
  return (
    hasPawn(position, "w", FILE_D, 3) &&
    hasPawn(position, "b", FILE_D, 4) &&
    hasPawn(position, "w", FILE_C, 2) &&
    hasPawn(position, "b", FILE_C, 5) &&
    !hasPawn(position, "w", FILE_E, 3) &&
    !hasPawn(position, "b", FILE_E, 4)
  );
}

/**
 * Attaque de minorité : le Carlsbad avec le pion b blanc déjà en marche
 * (b4/b5), c'est-à-dire le plan lui-même engagé et non plus seulement la
 * structure qui l'autorise.
 */
export function isMinorityAttack(position: ParsedPosition): boolean {
  if (!isCarlsbad(position)) return false;
  return hasPawn(position, "w", 1, 3) || hasPawn(position, "w", 1, 4);
}

/**
 * Bind Maroczy : pions blancs c4 ET e4, aucune colonne d blanche, pion noir en
 * d6 — le carcan qui interdit d7-d5 à la Sicilienne.
 */
export function isMaroczy(position: ParsedPosition): boolean {
  return (
    hasPawn(position, "w", FILE_C, 3) &&
    hasPawn(position, "w", FILE_E, 3) &&
    pawnRanks(position, "w", FILE_D).length === 0 &&
    hasPawn(position, "b", FILE_D, 5)
  );
}

/**
 * Hérisson : la carapace noire a6-b6-d6-e6 sous un espace blanc c4/e4. Les
 * quatre pions sont exigés ensemble — trois d'entre eux se rencontrent dans
 * quantité de Sicilienne sans que ce soit un hérisson.
 */
export function isHedgehog(position: ParsedPosition): boolean {
  const shell =
    hasPawn(position, "b", 0, 5) &&
    hasPawn(position, "b", 1, 5) &&
    hasPawn(position, "b", FILE_D, 5) &&
    hasPawn(position, "b", FILE_E, 5);
  if (!shell) return false;
  return hasPawn(position, "w", FILE_C, 3) && hasPawn(position, "w", FILE_E, 3);
}

/**
 * Chaîne française : blancs d4+e5 contre noirs d5+e6 — la chaîne qui définit la
 * Française d'avance, avec sa base attaquable en d4 et son plan f7-f6.
 */
export function isFrenchChain(position: ParsedPosition): boolean {
  return (
    hasPawn(position, "w", FILE_D, 3) &&
    hasPawn(position, "w", FILE_E, 4) &&
    hasPawn(position, "b", FILE_D, 4) &&
    hasPawn(position, "b", FILE_E, 5)
  );
}

/**
 * Chaîne est-indienne : centre bloqué blancs c4+d5+e4 contre noirs d6+e5 — la
 * chaîne inverse de la française, qui envoie chacun attaquer sur son aile.
 */
export function isKingsIndianChain(position: ParsedPosition): boolean {
  return (
    hasPawn(position, "w", FILE_D, 4) &&
    hasPawn(position, "w", FILE_E, 3) &&
    hasPawn(position, "b", FILE_D, 5) &&
    hasPawn(position, "b", FILE_E, 4)
  );
}

/** Un pion isolé : aucun pion ami sur les deux colonnes voisines. */
function isIsolatedPawnFile(position: ParsedPosition, color: StructureColor, file: number): boolean {
  if (pawnRanks(position, color, file).length === 0) return false;
  return pawnRanks(position, color, file - 1).length === 0 && pawnRanks(position, color, file + 1).length === 0;
}

/**
 * Pion dame isolé (isolani) : un pion d sans voisin sur les colonnes c et e, et
 * poussé en d4/d5 — un pion d isolé resté en d2 n'est pas le sujet du thème,
 * qui porte sur l'avantage d'espace payé par une faiblesse fixe.
 */
export function hasIsolani(position: ParsedPosition): boolean {
  if (isIsolatedPawnFile(position, "w", FILE_D) && hasPawn(position, "w", FILE_D, 3)) return true;
  return isIsolatedPawnFile(position, "b", FILE_D) && hasPawn(position, "b", FILE_D, 4);
}

/**
 * Pions pendants : le duo c+d sur la même rangée, sans voisin sur les colonnes
 * b et e — mobiles et forts tant qu'ils avancent ensemble, faibles dès qu'ils
 * sont bloqués.
 */
export function hasHangingPawns(position: ParsedPosition): boolean {
  for (const color of ["w", "b"] as const) {
    const rank = color === "w" ? 3 : 4;
    const duo = hasPawn(position, color, FILE_C, rank) && hasPawn(position, color, FILE_D, rank);
    if (!duo) continue;
    if (pawnRanks(position, color, 1).length === 0 && pawnRanks(position, color, FILE_E).length === 0) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Traits génériques
// ---------------------------------------------------------------------------

export function hasDoubledPawns(position: ParsedPosition, color?: StructureColor): boolean {
  const colors: StructureColor[] = color ? [color] : ["w", "b"];
  return colors.some((side) => position.pawns[side].some((ranks) => ranks.length >= 2));
}

/** Colonnes sur lesquelles `color` a un pion passé, et la rangée de ce pion. */
function passedPawns(position: ParsedPosition, color: StructureColor): { file: number; rank: number }[] {
  const enemy: StructureColor = color === "w" ? "b" : "w";
  const forward = color === "w" ? 1 : -1;
  const passers: { file: number; rank: number }[] = [];

  for (let file = 0; file < 8; file += 1) {
    const ranks = position.pawns[color][file];
    if (ranks.length === 0) continue;
    // Le plus avancé de la colonne : lui seul peut être passé.
    const rank = color === "w" ? ranks[ranks.length - 1] : ranks[0];
    const blocked = [file - 1, file, file + 1].some((adjacent) =>
      pawnRanks(position, enemy, adjacent).some((enemyRank) =>
        forward === 1 ? enemyRank > rank : enemyRank < rank,
      ),
    );
    if (!blocked) passers.push({ file, rank });
  }
  return passers;
}

export function hasPassedPawn(position: ParsedPosition): boolean {
  return passedPawns(position, "w").length > 0 || passedPawns(position, "b").length > 0;
}

/** Pion passé protégé : un pion ami le défend en diagonale arrière. */
export function hasProtectedPassedPawn(position: ParsedPosition): boolean {
  for (const color of ["w", "b"] as const) {
    const back = color === "w" ? -1 : 1;
    for (const { file, rank } of passedPawns(position, color)) {
      if (hasPawn(position, color, file - 1, rank + back) || hasPawn(position, color, file + 1, rank + back)) {
        return true;
      }
    }
  }
  return false;
}

/** Pion passé bloqué : une pièce adverse est posée juste devant lui — le blocus de Nimzowitsch. */
export function hasBlockadedPasser(position: ParsedPosition): boolean {
  for (const color of ["w", "b"] as const) {
    const forward = color === "w" ? 1 : -1;
    for (const { file, rank } of passedPawns(position, color)) {
      const front = pieceAt(position, file, rank + forward);
      if (!front) continue;
      const isEnemy = color === "w" ? front === front.toLowerCase() : front === front.toUpperCase();
      if (isEnemy) return true;
    }
  }
  return false;
}

/**
 * Pion arriéré : dernier de sa colonne, aucun pion ami en retrait sur les
 * colonnes voisines pour l'épauler, et sa case d'avance est contrôlée par un
 * pion adverse — la faiblesse fixe qui appelle la colonne semi-ouverte.
 */
export function hasBackwardPawn(position: ParsedPosition): boolean {
  for (const color of ["w", "b"] as const) {
    const enemy: StructureColor = color === "w" ? "b" : "w";
    const forward = color === "w" ? 1 : -1;
    for (let file = 0; file < 8; file += 1) {
      const ranks = position.pawns[color][file];
      if (ranks.length === 0) continue;
      const rank = color === "w" ? ranks[0] : ranks[ranks.length - 1];
      const supported = [file - 1, file + 1].some((adjacent) =>
        pawnRanks(position, color, adjacent).some((neighbour) =>
          forward === 1 ? neighbour <= rank : neighbour >= rank,
        ),
      );
      if (supported) continue;
      const advance = rank + forward;
      if (hasPawn(position, enemy, file - 1, advance + forward) || hasPawn(position, enemy, file + 1, advance + forward)) {
        return true;
      }
    }
  }
  return false;
}

/** Majorité à l'aile dame : plus de pions sur les colonnes a-c que l'adversaire, à égalité de pions au total. */
export function hasQueensideMajority(position: ParsedPosition): boolean {
  const flank = (color: StructureColor) =>
    [0, 1, 2].reduce((sum, file) => sum + position.pawns[color][file].length, 0);
  const white = flank("w");
  const black = flank("b");
  if (white === black) return false;
  return Math.abs(pawnTotal(position, "w") - pawnTotal(position, "b")) <= 1;
}

/** Structures strictement symétriques : chaque pion blanc a son reflet noir. */
export function hasSymmetricPawns(position: ParsedPosition): boolean {
  if (pawnTotal(position, "w") !== pawnTotal(position, "b")) return false;
  if (pawnTotal(position, "w") < 6) return false;
  for (let file = 0; file < 8; file += 1) {
    const white = position.pawns.w[file];
    const black = position.pawns.b[file];
    if (white.length !== black.length) return false;
    for (const [index, rank] of white.entries()) {
      // Reflet horizontal : la rangée 2 blanche répond à la rangée 7 noire.
      if (7 - rank !== black[black.length - 1 - index]) return false;
    }
  }
  return true;
}

/** Nombre de couples de pions qui se bloquent frontalement. */
function lockedPairs(position: ParsedPosition): number {
  let locked = 0;
  for (let file = 0; file < 8; file += 1) {
    for (const rank of position.pawns.w[file]) {
      if (hasPawn(position, "b", file, rank + 1)) locked += 1;
    }
  }
  return locked;
}

/** Centre fermé : au moins deux couples de pions bloqués, dont un dans les colonnes c-f. */
export function hasClosedCenter(position: ParsedPosition): boolean {
  if (lockedPairs(position) < 2) return false;
  for (let file = FILE_C; file <= 5; file += 1) {
    for (const rank of position.pawns.w[file]) {
      if (hasPawn(position, "b", file, rank + 1)) return true;
    }
  }
  return false;
}

/** Centre ouvert : plus aucun pion sur les colonnes d et e. */
export function hasOpenCenter(position: ParsedPosition): boolean {
  return (
    pawnRanks(position, "w", FILE_D).length === 0 &&
    pawnRanks(position, "b", FILE_D).length === 0 &&
    pawnRanks(position, "w", FILE_E).length === 0 &&
    pawnRanks(position, "b", FILE_E).length === 0
  );
}

/**
 * Avantage d'espace : un camp a nettement plus de pions au-delà de la moitié de
 * l'échiquier — la mesure la plus simple qui corresponde à ce que le joueur
 * ressent (« je suis à l'étroit »).
 */
export function hasSpaceAdvantage(position: ParsedPosition): boolean {
  const beyond = (color: StructureColor) =>
    position.pawns[color].reduce(
      (sum, ranks) => sum + ranks.filter((rank) => (color === "w" ? rank >= 4 : rank <= 3)).length,
      0,
    );
  return Math.abs(beyond("w") - beyond("b")) >= 2;
}

// ---------------------------------------------------------------------------
// Configurations de pièces
// ---------------------------------------------------------------------------

function isFileOpen(position: ParsedPosition, file: number): boolean {
  return pawnRanks(position, "w", file).length === 0 && pawnRanks(position, "b", file).length === 0;
}

/** Colonne ouverte tenue par une tour ou une dame. */
export function hasOpenFile(position: ParsedPosition): boolean {
  for (let file = 0; file < 8; file += 1) {
    if (!isFileOpen(position, file)) continue;
    for (let rank = 0; rank < 8; rank += 1) {
      const piece = position.board[rank][file];
      if (piece === "R" || piece === "r" || piece === "Q" || piece === "q") return true;
    }
  }
  return false;
}

/** Colonne semi-ouverte : sans pion ami, avec pion adverse, tenue par une tour amie. */
export function hasSemiOpenFile(position: ParsedPosition): boolean {
  for (const color of ["w", "b"] as const) {
    const enemy: StructureColor = color === "w" ? "b" : "w";
    const rook = color === "w" ? "R" : "r";
    for (let file = 0; file < 8; file += 1) {
      if (pawnRanks(position, color, file).length > 0) continue;
      if (pawnRanks(position, enemy, file).length === 0) continue;
      for (let rank = 0; rank < 8; rank += 1) {
        if (position.board[rank][file] === rook) return true;
      }
    }
  }
  return false;
}

/** Tour à la 7e rangée (2e pour les noirs) — la rangée des pions adverses. */
export function hasRookOnSeventh(position: ParsedPosition): boolean {
  for (let file = 0; file < 8; file += 1) {
    if (position.board[6][file] === "R") return true;
    if (position.board[1][file] === "r") return true;
  }
  return false;
}

/** Les cases entre deux cases alignées sont-elles toutes vides ? */
function pathIsClear(position: ParsedPosition, from: [number, number], to: [number, number]): boolean {
  const [df, dr] = [Math.sign(to[0] - from[0]), Math.sign(to[1] - from[1])];
  let file = from[0] + df;
  let rank = from[1] + dr;
  while (file !== to[0] || rank !== to[1]) {
    if (position.board[rank][file]) return false;
    file += df;
    rank += dr;
  }
  return true;
}

/** Toutes les cases occupées par une des lettres données. */
function squaresOf(position: ParsedPosition, letters: readonly string[]): [number, number][] {
  const found: [number, number][] = [];
  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const piece = position.board[rank][file];
      if (piece && letters.includes(piece)) found.push([file, rank]);
    }
  }
  return found;
}

/**
 * Batterie de pièces lourdes : deux tours, ou tour et dame, alignées sur une
 * colonne ou une rangée dégagée — la pression doublée qui précède l'invasion.
 */
export function hasHeavyBattery(position: ParsedPosition): boolean {
  for (const letters of [["R", "Q"], ["r", "q"]] as const) {
    const heavy = squaresOf(position, letters);
    for (let i = 0; i < heavy.length; i += 1) {
      for (let j = i + 1; j < heavy.length; j += 1) {
        const [a, b] = [heavy[i], heavy[j]];
        const aligned = a[0] === b[0] || a[1] === b[1];
        if (aligned && pathIsClear(position, a, b)) return true;
      }
    }
  }
  return false;
}

/**
 * Canon d'Alekhine : les deux tours DEVANT la dame sur une même colonne
 * dégagée. L'ordre compte — c'est ce qui distingue le canon d'une batterie
 * lourde ordinaire, et c'est tout le sujet du thème.
 */
export function hasAlekhineGun(position: ParsedPosition): boolean {
  for (const [rook, queen, forward] of [["R", "Q", 1], ["r", "q", -1]] as const) {
    for (const [file, rank] of squaresOf(position, [queen])) {
      const rooks = squaresOf(position, [rook]).filter(([f]) => f === file);
      // Deux tours sur la même colonne, toutes deux en AVANT de la dame.
      const ahead = rooks.filter(([, r]) => (forward === 1 ? r > rank : r < rank));
      if (ahead.length < 2) continue;
      ahead.sort((x, y) => (forward === 1 ? x[1] - y[1] : y[1] - x[1]));
      if (pathIsClear(position, [file, rank], ahead[0]) && pathIsClear(position, ahead[0], ahead[1])) return true;
    }
  }
  return false;
}

/** Batterie fou + dame sur une diagonale dégagée — la pointe qui vise le roque. */
export function hasBishopQueenBattery(position: ParsedPosition): boolean {
  for (const [bishop, queen] of [["B", "Q"], ["b", "q"]] as const) {
    for (const bishopSquare of squaresOf(position, [bishop])) {
      for (const queenSquare of squaresOf(position, [queen])) {
        const df = Math.abs(bishopSquare[0] - queenSquare[0]);
        const dr = Math.abs(bishopSquare[1] - queenSquare[1]);
        if (df !== dr || df === 0) continue;
        if (pathIsClear(position, bishopSquare, queenSquare)) return true;
      }
    }
  }
  return false;
}

/**
 * Avant-poste de cavalier : un cavalier installé en territoire adverse (rangées
 * 4 à 6), protégé par un pion ami, et qu'aucun pion adverse ne peut chasser.
 * C'est la définition du thème « L'avant-poste du cavalier », pas une
 * approximation « cavalier avancé ».
 */
export function hasKnightOutpost(position: ParsedPosition): boolean {
  for (const color of ["w", "b"] as const) {
    const enemy: StructureColor = color === "w" ? "b" : "w";
    const knight = color === "w" ? "N" : "n";
    const forward = color === "w" ? 1 : -1;
    const ranks = color === "w" ? [3, 4, 5] : [4, 3, 2];

    for (const rank of ranks) {
      for (let file = 0; file < 8; file += 1) {
        if (position.board[rank][file] !== knight) continue;
        const defended =
          hasPawn(position, color, file - 1, rank - forward) || hasPawn(position, color, file + 1, rank - forward);
        if (!defended) continue;
        // Chassable si un pion adverse d'une colonne voisine est encore en
        // arrière de la case et peut donc venir l'attaquer.
        const evictable = [file - 1, file + 1].some((adjacent) =>
          pawnRanks(position, enemy, adjacent).some((enemyRank) =>
            forward === 1 ? enemyRank > rank : enemyRank < rank,
          ),
        );
        if (!evictable) return true;
      }
    }
  }
  return false;
}

/**
 * Mauvais fou : un fou dont au moins quatre pions AMIS occupent les cases de sa
 * propre couleur — il bute sur son propre camp. Le seuil de quatre écarte le
 * fou simplement gêné, que le thème n'enseigne pas.
 */
export function hasBadBishop(position: ParsedPosition): boolean {
  for (const color of ["w", "b"] as const) {
    const bishop = color === "w" ? "B" : "b";
    for (let rank = 0; rank < 8; rank += 1) {
      for (let file = 0; file < 8; file += 1) {
        if (position.board[rank][file] !== bishop) continue;
        const light = isLightSquare(file, rank);
        let blockers = 0;
        for (let pawnFile = 0; pawnFile < 8; pawnFile += 1) {
          for (const pawnRank of position.pawns[color][pawnFile]) {
            if (isLightSquare(pawnFile, pawnRank) === light) blockers += 1;
          }
        }
        if (blockers >= 4) return true;
      }
    }
  }
  return false;
}

/** Paire de fous contre fou+cavalier ou deux cavaliers — l'asymétrie qui fait le thème. */
export function hasBishopPair(position: ParsedPosition): boolean {
  const white = count(position, "B");
  const black = count(position, "b");
  return (white >= 2 && black <= 1) || (black >= 2 && white <= 1);
}

/** Fous de couleurs opposées : un fou par camp, sur des complexes contraires. */
export function hasOppositeBishops(position: ParsedPosition): boolean {
  if (count(position, "B") !== 1 || count(position, "b") !== 1) return false;
  const find = (letter: string): boolean | null => {
    for (let rank = 0; rank < 8; rank += 1) {
      for (let file = 0; file < 8; file += 1) {
        if (position.board[rank][file] === letter) return isLightSquare(file, rank);
      }
    }
    return null;
  };
  const white = find("B");
  const black = find("b");
  return white !== null && black !== null && white !== black;
}

/** Fou fianchetté : en b2/g2/b7/g7, derrière son pion de flanc. */
export function hasFianchetto(position: ParsedPosition): boolean {
  const posts = [
    { letter: "B", file: 1, rank: 1, pawnRank: 2, color: "w" as const },
    { letter: "B", file: 6, rank: 1, pawnRank: 2, color: "w" as const },
    { letter: "b", file: 1, rank: 6, pawnRank: 5, color: "b" as const },
    { letter: "b", file: 6, rank: 6, pawnRank: 5, color: "b" as const },
  ];
  return posts.some(
    ({ letter, file, rank, pawnRank, color }) =>
      pieceAt(position, file, rank) === letter && hasPawn(position, color, file, pawnRank),
  );
}

/**
 * Complexe de cases faibles : un camp a perdu le fou d'une couleur et a encore
 * quatre pions ou plus sur l'AUTRE couleur — les cases du fou disparu ne sont
 * donc plus tenues par personne.
 */
export function hasWeakColorComplex(position: ParsedPosition): boolean {
  for (const color of ["w", "b"] as const) {
    const bishop = color === "w" ? "B" : "b";
    if (count(position, bishop) !== 1) continue;

    let bishopLight: boolean | null = null;
    for (let rank = 0; rank < 8 && bishopLight === null; rank += 1) {
      for (let file = 0; file < 8; file += 1) {
        if (position.board[rank][file] === bishop) {
          bishopLight = isLightSquare(file, rank);
          break;
        }
      }
    }
    if (bishopLight === null) continue;

    // Pions sur la couleur du fou RESTANT : ce sont les cases de l'autre
    // couleur qui deviennent indéfendables.
    let sameColorPawns = 0;
    for (let file = 0; file < 8; file += 1) {
      for (const rank of position.pawns[color][file]) {
        if (isLightSquare(file, rank) === bishopLight) sameColorPawns += 1;
      }
    }
    if (sameColorPawns >= 4) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Types de finale
// ---------------------------------------------------------------------------

function minorAndMajorCount(position: ParsedPosition): number {
  return ["Q", "q", "R", "r", "B", "b", "N", "n"].reduce((sum, letter) => sum + count(position, letter), 0);
}

/** Finale de pions : plus que les rois et les pions. */
export function isPawnEndgame(position: ParsedPosition): boolean {
  return minorAndMajorCount(position) === 0;
}

/** Finale de tours : une tour par camp et rien d'autre. */
export function isRookEndgame(position: ParsedPosition): boolean {
  const others = ["Q", "q", "B", "b", "N", "n"].reduce((sum, letter) => sum + count(position, letter), 0);
  return others === 0 && count(position, "R") >= 1 && count(position, "r") >= 1;
}

/** Finale de fous : un fou par camp, sans autre pièce. */
export function isBishopEndgame(position: ParsedPosition): boolean {
  const others = ["Q", "q", "R", "r", "N", "n"].reduce((sum, letter) => sum + count(position, letter), 0);
  return others === 0 && count(position, "B") >= 1 && count(position, "b") >= 1;
}

/** Fou contre cavalier : le duel de mineures qui fait le thème, sans lourdes pour brouiller. */
export function isKnightVsBishop(position: ParsedPosition): boolean {
  const heavy = ["Q", "q", "R", "r"].reduce((sum, letter) => sum + count(position, letter), 0);
  if (heavy > 0) return false;
  const whiteHasBishop = count(position, "B") >= 1 && count(position, "N") === 0;
  const blackHasKnight = count(position, "n") >= 1 && count(position, "b") === 0;
  const whiteHasKnight = count(position, "N") >= 1 && count(position, "B") === 0;
  const blackHasBishop = count(position, "b") >= 1 && count(position, "n") === 0;
  return (whiteHasBishop && blackHasKnight) || (whiteHasKnight && blackHasBishop);
}

// ---------------------------------------------------------------------------
// Façade
// ---------------------------------------------------------------------------

const PREDICATES: Record<StructureTag, (position: ParsedPosition) => boolean> = {
  carlsbad: isCarlsbad,
  maroczy: isMaroczy,
  hedgehog: isHedgehog,
  french_chain: isFrenchChain,
  kings_indian_chain: isKingsIndianChain,
  isolani: hasIsolani,
  hanging_pawns: hasHangingPawns,
  minority_attack: isMinorityAttack,
  doubled_pawns: (position) => hasDoubledPawns(position),
  backward_pawn: hasBackwardPawn,
  passed_pawn: hasPassedPawn,
  protected_passed_pawn: hasProtectedPassedPawn,
  blockaded_passer: hasBlockadedPasser,
  queenside_majority: hasQueensideMajority,
  symmetric_pawns: hasSymmetricPawns,
  closed_center: hasClosedCenter,
  open_center: hasOpenCenter,
  space_advantage: hasSpaceAdvantage,
  open_file: hasOpenFile,
  semi_open_file: hasSemiOpenFile,
  rook_seventh: hasRookOnSeventh,
  heavy_battery: hasHeavyBattery,
  alekhine_gun: hasAlekhineGun,
  bishop_queen_battery: hasBishopQueenBattery,
  knight_outpost: hasKnightOutpost,
  bad_bishop: hasBadBishop,
  bishop_pair: hasBishopPair,
  opposite_bishops: hasOppositeBishops,
  fianchetto: hasFianchetto,
  weak_color_complex: hasWeakColorComplex,
  pawn_endgame: isPawnEndgame,
  rook_endgame: isRookEndgame,
  bishop_endgame: isBishopEndgame,
  knight_vs_bishop: isKnightVsBishop,
};

/**
 * Toutes les structures reconnues dans cette position, dans l'ordre de
 * `STRUCTURE_TAGS`. C'est ce tableau qui est écrit dans le dataset à
 * l'ingestion, puis interrogé par les requêtes de thème — jamais recalculé à
 * l'affichage.
 */
export function describeStructures(fen: string): StructureTag[] {
  const position = parsePosition(fen);
  if (!position) return [];
  return STRUCTURE_TAGS.filter((tag) => PREDICATES[tag](position));
}

/** Variante sans re-parsing, pour l'ingestion qui décortique déjà la position. */
export function describeParsedStructures(position: ParsedPosition): StructureTag[] {
  return STRUCTURE_TAGS.filter((tag) => PREDICATES[tag](position));
}
