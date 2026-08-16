/**
 * Mutations géométriques pures d'une position FEN + de sa suite de coups UCI.
 *
 * Sert `populate-puzzles.ts` (via `local-puzzle-bank.ts`) : quand la banque
 * locale n'a qu'une poignée de positions pour un tag donné et que le
 * générateur de volume doit en tirer 30 déclinaisons, ces fonctions
 * produisent jusqu'à 4 variantes visuellement distinctes de la même position
 * plutôt que de recopier littéralement la même FEN à chaque tour de boucle.
 *
 * Deux symétries du jeu d'échecs, combinables (groupe à 4 éléments) :
 *  - miroir gauche/droite (`mirror-h`) : fichiers inversés (a<->h, b<->g...).
 *    Toujours légal ici car aucune position de la banque n'a de droits de
 *    roque (`- -`) — un roque dépend de la colonne du roi/de la tour, un
 *    miroir de fichiers le rendrait incohérent sans réécrire ces droits (géré
 *    ci-dessous par prudence, mais jamais exercé par les données actuelles).
 *  - inversion des couleurs (`flip-colors`) : miroir haut/bas (rang 1<->8) +
 *    permutation de la casse de chaque pièce + inversion du trait. Légal par
 *    construction : un pion qui avançait vers le haut avance toujours "vers
 *    l'avant" une fois sa couleur elle-même inversée (les pions blancs
 *    avancent vers rang8, les noirs vers rang1 — les deux se correspondent
 *    exactement après ce double miroir).
 *
 * Les deux combinées (`mirror-h-flip-colors`) donnent la 4e variante. Aucune
 * ne change la structure de la position (nombre de coups, échec et mat) —
 * juste son orientation à l'écran — donc un puzzle "mat en 1" mutée reste un
 * mat en 1 mutée. Vérifié par `geometric-variants.test.ts`.
 */

export type GeometricVariant = "identity" | "mirror-h" | "flip-colors" | "mirror-h-flip-colors";

/** Les 4 variantes, dans l'ordre où `resolveLocalPuzzle` (local-puzzle-bank.ts) les fait défiler. */
export const GEOMETRIC_VARIANTS: readonly GeometricVariant[] = [
  "identity",
  "mirror-h",
  "flip-colors",
  "mirror-h-flip-colors",
];

export interface FenAndMoves {
  fen: string;
  moves: readonly string[];
}

const FILES = "abcdefgh";

function mirrorFileIndex(file: number): number {
  return 7 - file;
}

function mirrorRankIndex(rank: number): number {
  return 7 - rank;
}

function swapCase(char: string): string {
  return char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase();
}

/** Transforme un carré UCI ("e4") selon les deux miroirs demandés. */
function transformSquare(square: string, mirrorH: boolean, flipRanks: boolean): string {
  const file = FILES.indexOf(square[0]);
  const rank = Number(square[1]) - 1;
  const newFile = mirrorH ? mirrorFileIndex(file) : file;
  const newRank = flipRanks ? mirrorRankIndex(rank) : rank;
  return `${FILES[newFile]}${newRank + 1}`;
}

/** Partie "plateau" de la FEN (avant le premier espace) : 8 rangs séparés par "/". */
function transformBoard(board: string, mirrorH: boolean, flipColors: boolean): string {
  const ranks = board.split("/").map((rankStr) => {
    const cells: (string | null)[] = [];
    for (const char of rankStr) {
      if (/\d/.test(char)) {
        for (let i = 0; i < Number(char); i += 1) cells.push(null);
      } else {
        cells.push(flipColors ? swapCase(char) : char);
      }
    }
    return mirrorH ? cells.slice().reverse() : cells;
  });

  // La FEN liste les rangs de 8 à 1 : inverser cette liste revient à échanger
  // le rang 8 et le rang 1 (donc 7 et 2, etc.) — le miroir haut/bas.
  const orderedRanks = flipColors ? ranks.slice().reverse() : ranks;

  return orderedRanks
    .map((cells) => {
      let out = "";
      let emptyRun = 0;
      for (const cell of cells) {
        if (cell === null) {
          emptyRun += 1;
        } else {
          if (emptyRun > 0) {
            out += String(emptyRun);
            emptyRun = 0;
          }
          out += cell;
        }
      }
      if (emptyRun > 0) out += String(emptyRun);
      return out;
    })
    .join("/");
}

/** K<->Q (et k<->q) quand le fichier est inversé : la tour "petit roque" devient la tour "grand roque". Non exercé par la banque actuelle (aucun droit de roque), géré par prudence. */
function transformCastlingChar(char: string, mirrorH: boolean, flipColors: boolean): string {
  let result = char;
  if (mirrorH) {
    const isWhite = result === result.toUpperCase();
    const swapped = result.toLowerCase() === "k" ? "q" : "k";
    result = isWhite ? swapped.toUpperCase() : swapped;
  }
  if (flipColors) result = swapCase(result);
  return result;
}

function transformCastling(castling: string, mirrorH: boolean, flipColors: boolean): string {
  if (castling === "-") return castling;
  return castling
    .split("")
    .map((char) => transformCastlingChar(char, mirrorH, flipColors))
    .join("");
}

/**
 * Applique une variante géométrique à une position + sa suite de coups UCI.
 * Pure : ne touche ni `chess.js` ni aucun état, se contente de réécrire des
 * chaînes selon les règles ci-dessus. `identity` renvoie une copie
 * superficielle (jamais l'objet d'entrée, pour rester sans effet de bord).
 */
export function applyGeometricVariant(seed: FenAndMoves, variant: GeometricVariant): FenAndMoves {
  if (variant === "identity") {
    return { fen: seed.fen, moves: [...seed.moves] };
  }

  const mirrorH = variant === "mirror-h" || variant === "mirror-h-flip-colors";
  const flipColors = variant === "flip-colors" || variant === "mirror-h-flip-colors";

  const [board, turn, castling, ep, halfmove, fullmove] = seed.fen.split(" ");
  const newBoard = transformBoard(board, mirrorH, flipColors);
  const newTurn = flipColors ? (turn === "w" ? "b" : "w") : turn;
  const newCastling = transformCastling(castling, mirrorH, flipColors);
  const newEp = ep === "-" ? "-" : transformSquare(ep, mirrorH, flipColors);
  const newFen = `${newBoard} ${newTurn} ${newCastling} ${newEp} ${halfmove} ${fullmove}`;

  const newMoves = seed.moves.map((move) => {
    const from = transformSquare(move.slice(0, 2), mirrorH, flipColors);
    const to = transformSquare(move.slice(2, 4), mirrorH, flipColors);
    const promotion = move.slice(4); // "" ou une lettre de pièce (casse déjà correcte, ne code pas de couleur en UCI).
    return `${from}${to}${promotion}`;
  });

  return { fen: newFen, moves: newMoves };
}
