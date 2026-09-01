import { Chess, type Move } from "chess.js";

/**
 * Parseur PGN récursif — transforme un texte PGN avec sous-variantes entre
 * parenthèses (`1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 (3...Nf6 4.O-O) 4.Ba4`) en un
 * ARBRE de coups, chaque position pouvant avoir plusieurs enfants (les
 * embranchements théoriques). Remplace l'hypothèse d'une ligne plate unique
 * (`OpeningLine.moves`) par une structure capable de représenter un vrai
 * répertoire façon Listudy — voir `core/curriculum/openings.ts` (champ
 * optionnel `pgn`) et `server/curriculum/opening-tree-index.ts` (l'index
 * global qui exploite cet arbre).
 *
 * Convention de nommage d'une sous-variante : le commentaire `{...}` qui suit
 * IMMÉDIATEMENT le premier coup d'une branche alternative sert de nom affiché
 * (ex. `4...Nf6 {Défense Berlinoise} 5.O-O Nxe4`) — voir
 * `server/curriculum/opening-tree-index.ts`, qui lit `VariationNode.comment`
 * à cette fin.
 *
 * Module pur (chess.js seulement, aucune donnée) : ne valide QUE la légalité
 * des coups, ne connaît rien du catalogue d'ouvertures lui-même.
 */

export const PGN_TREE_START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/**
 * Un nœud de l'arbre — la position APRÈS `san`/`uci` (position de départ pour
 * la racine, dont `san`/`uci` valent `null`). `children` porte tous les coups
 * théoriques connus depuis cette position : plusieurs enfants = un
 * embranchement réel, pas une erreur de données.
 */
export interface VariationNode {
  /** Numéro de demi-coup absolu (1 = premier coup de la partie), 0 pour la racine. */
  ply: number;
  san: string | null;
  uci: string | null;
  fen: string;
  /** Nom de la sous-variante démarrant à ce nœud, voir le docstring du fichier. `null` si absent. */
  comment: string | null;
  children: VariationNode[];
}

/** Notation UCI d'un coup chess.js — copie locale volontaire de `evaluate-move.ts#uciOf` pour ne pas faire dépendre `core/chess/` de `core/analysis/` (mauvais sens de dépendance). */
function uciOfMove(move: Move): string {
  return move.from + move.to + (move.promotion ?? "");
}

const MOVE_NUMBER_RE = /^\d+\.+$/;
const NAG_RE = /^\$\d+$/;
const RESULT_RE = /^(1-0|0-1|1\/2-1\/2|\*)$/;

/**
 * Découpe le texte en tokens : commentaires `{...}` entiers (contenu
 * préservé tel quel), parenthèses isolées, et tout le reste (coups, numéros,
 * NAG, résultat) séparé par les espaces. Un PGN compact colle le numéro de
 * coup au coup lui-même (`1.e4`, `3...Nf6`, sans espace) — on insère l'espace
 * manquant EN DEHORS des commentaires (pour ne jamais altérer leur texte)
 * avant de découper, pour que `MOVE_NUMBER_RE` reconnaisse "1." comme un
 * token séparé de "e4".
 */
function tokenize(pgn: string): string[] {
  const tokens: string[] = [];
  for (const segment of pgn.split(/(\{[^}]*\})/)) {
    if (segment.startsWith("{")) {
      if (segment.length > 0) tokens.push(segment);
      continue;
    }
    const spaced = segment.replace(/(\d+\.+)/g, "$1 ");
    const matches = spaced.match(/\(|\)|[^\s(){}]+/g);
    if (matches) tokens.push(...matches);
  }
  return tokens;
}

function makeRoot(startFen: string): VariationNode {
  return { ply: 0, san: null, uci: null, fen: startFen, comment: null, children: [] };
}

interface Cursor {
  i: number;
}

/**
 * Consomme les tokens à partir de `cursor.i` en ajoutant des enfants à
 * `parentNode` — s'arrête sur une parenthèse fermante ou une fin de flux.
 *
 * Le principe des variantes PGN : `(` ouvre une branche qui REMPLACE le
 * dernier coup joué à ce niveau, donc un FRÈRE de ce coup, pas un enfant.
 * `beforeFen`/`beforeParent` retiennent l'état juste AVANT ce dernier coup ;
 * une parenthèse relance `parseSequence` depuis cet état exact (nouvelle
 * instance `Chess`, jamais celle en cours de mutation) ; la fermeture rend la
 * main à ce niveau, qui reprend sa propre ligne avec son propre `chess`
 * (inchangé par la parenthèse, celle-ci n'a travaillé que sur un clone).
 * Plusieurs parenthèses consécutives après un même coup sont donc bien
 * plusieurs branches sœurs distinctes, chacune relue depuis le même
 * `beforeFen` — et une parenthèse À L'INTÉRIEUR d'une parenthèse récurse
 * exactement de la même façon, à n'importe quelle profondeur.
 */
function parseSequence(tokens: readonly string[], cursor: Cursor, chess: Chess, parentNode: VariationNode): void {
  let currentNode = parentNode;
  let beforeFen: string | null = null;
  let beforeParent: VariationNode | null = null;

  while (cursor.i < tokens.length) {
    const token = tokens[cursor.i];

    if (token === ")") {
      cursor.i += 1;
      return;
    }
    if (token === "(") {
      cursor.i += 1;
      if (beforeFen === null || beforeParent === null) {
        throw new Error(`pgn-tree: "(" inattendue sans coup précédent (token ${cursor.i})`);
      }
      parseSequence(tokens, cursor, new Chess(beforeFen), beforeParent);
      continue;
    }
    if (token.startsWith("{")) {
      const text = token.slice(1, -1).trim();
      if (currentNode.comment === null && text) currentNode.comment = text;
      cursor.i += 1;
      continue;
    }
    if (MOVE_NUMBER_RE.test(token) || NAG_RE.test(token)) {
      cursor.i += 1;
      continue;
    }
    if (RESULT_RE.test(token)) {
      cursor.i += 1;
      return;
    }

    // Ce qui reste est un coup SAN.
    const fenBefore = chess.fen();
    const parentBeforeThisMove = currentNode;
    let move: Move;
    try {
      move = chess.move(token);
    } catch {
      throw new Error(`pgn-tree: coup illégal "${token}" à la position "${fenBefore}"`);
    }
    const child: VariationNode = {
      ply: parentBeforeThisMove.ply + 1,
      san: move.san,
      uci: uciOfMove(move),
      fen: chess.fen(),
      comment: null,
      children: [],
    };
    parentBeforeThisMove.children.push(child);
    currentNode = child;
    beforeFen = fenBefore;
    beforeParent = parentBeforeThisMove;
    cursor.i += 1;
  }
}

/**
 * Parse un PGN complet en arbre — voir le docstring du fichier. Lève une
 * erreur explicite (position + coup fautif) sur un coup illégal, plutôt que
 * de produire silencieusement un arbre incohérent.
 */
export function parsePgnTree(pgn: string, startFen: string = PGN_TREE_START_FEN): VariationNode {
  const root = makeRoot(startFen);
  parseSequence(tokenize(pgn), { i: 0 }, new Chess(startFen), root);
  return root;
}

/** La ligne principale (premier enfant à chaque embranchement) — équivalent arbre de l'ancien `OpeningLine.moves`. */
export function mainLine(root: VariationNode): VariationNode[] {
  const line: VariationNode[] = [];
  let node = root;
  while (node.children.length > 0) {
    node = node.children[0];
    line.push(node);
  }
  return line;
}

/** Tous les nœuds de l'arbre (racine comprise), ordre non garanti — sert à construire un index par FEN (`server/curriculum/opening-tree-index.ts`). */
export function collectNodes(root: VariationNode): VariationNode[] {
  const nodes: VariationNode[] = [];
  const stack: VariationNode[] = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node) continue;
    nodes.push(node);
    stack.push(...node.children);
  }
  return nodes;
}
