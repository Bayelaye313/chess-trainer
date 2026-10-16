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
 *
 * `philosophy`/`strategicObjective`/`engineSuggestion` (cahier des charges du
 * 2026-09-12, « hydratation de l'arbre d'ouverture ») portent l'enrichissement
 * pédagogique d'UN nœud — jamais posés par `parsePgnTree`/`buildTreeFromLines`
 * eux-mêmes (toujours `null` à la sortie du parseur, comme `comment`), mais
 * par `annotateTree` en aval (voir plus bas), appelée par l'appelant qui
 * possède la source (ex. `core/curriculum/openings.ts`). Délibérément
 * PAS injectés via la syntaxe `{...}` du PGN lui-même : `comment` porte déjà
 * un contrat figé et consommé (le NOM de la sous-variante, voir
 * `server/curriculum/opening-tree-index.ts`) — un seul `{...}` par nœud
 * d'ailleurs (voir `parseSequence`), qui ne pourrait pas porter trois champs
 * distincts sans un mini-langage ad-hoc fragile. `annotateTree` (repérage par
 * chemin SAN depuis la racine, jamais par index fragile) est le même principe
 * que `core/curriculum/course-tree.ts#withEngineSuggestions`/`nodeAtSanPath`
 * pour `ChessMoveNode` — dupliqué ici en toute connaissance de cause plutôt
 * qu'importé (voir la note sur `EngineSuggestion` ci-dessous), ce fichier
 * restant un module `core/chess` autonome.
 */

export const PGN_TREE_START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/**
 * Copie locale volontaire de `move-tree.ts#EngineSuggestion` (MÊME forme) —
 * dupliquée plutôt qu'importée pour ne pas créer de dépendance croisée entre
 * les deux parseurs d'arbre de `core/chess` (voir le docstring du fichier),
 * exactement comme `tokenize`/`uciOfMove` le sont déjà dans l'autre sens.
 */
export interface OpeningEngineSuggestion {
  /** SAN du coup suggéré par le moteur DEPUIS la position de ce nœud — jamais un coup halluciné : toujours une ligne réellement publiée par la source (annotation `[%cal]`/analyse écrite d'une étude Lichess, jamais inventée). */
  san: string;
  uci: string;
  /** Évaluation en centipawns après le coup suggéré, point de vue Blancs — `null` si la source ne chiffre pas l'analyse (le cas le plus fréquent pour des études annotées à la main, sans moteur en nuage). */
  cp: number | null;
  /** Mat en N après le coup suggéré (positif = Blancs matent) — `null` sinon. */
  mate: number | null;
}

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
  /**
   * Code ECO propre à CE nœud, quand il en porte un — n'est renseigné QUE par
   * `buildTreeFromLines` (voir plus bas), jamais par `parsePgnTree` (un PGN
   * authored à la main n'a qu'un seul `eco` global, celui de l'`OpeningLine`
   * qui le porte). `null` par défaut : l'appelant retombe alors sur l'eco de
   * l'ouverture englobante — voir `server/curriculum/imported-openings-index.ts`.
   */
  eco: string | null;
  /** Vision stratégique long terme du camp qui choisit CETTE ligne (français) — voir `annotateTree`. `null` par défaut (aucun `pgn` authored n'en pose à l'analyse). */
  philosophy: string | null;
  /** Objectif immédiat du coup qui MÈNE à ce nœud (français) — voir `annotateTree`. `null` par défaut. */
  strategicObjective: string | null;
  /** Suggestion moteur affichée en permanence sur ce nœud — voir `OpeningEngineSuggestion`. `null` par défaut. */
  engineSuggestion: OpeningEngineSuggestion | null;
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
  return {
    ply: 0,
    san: null,
    uci: null,
    fen: startFen,
    comment: null,
    eco: null,
    philosophy: null,
    strategicObjective: null,
    engineSuggestion: null,
    children: [],
  };
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
      eco: null,
      philosophy: null,
      strategicObjective: null,
      engineSuggestion: null,
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

/**
 * Une ligne PLATE (suite de coups SAN depuis la position de départ, jamais de
 * sous-variante imbriquée) à fusionner dans un arbre — voir `buildTreeFromLines`.
 * Convention volontairement différente de celle de `parsePgnTree` (le
 * commentaire nomme la sous-variante qui COMMENCE au nœud) : ici `label` nomme
 * le nœud TERMINAL de la ligne elle-même (la position que `name` désigne dans
 * une base comme lichess-org/chess-openings, où le nom qualifie la position
 * D'ARRIVÉE, pas le coup qui y mène) — voir le docstring de
 * `server/curriculum/imported-openings-index.ts`.
 */
export interface NamedLine {
  /** Étiquette à poser sur le nœud terminal de cette ligne — `null` pour prolonger l'arbre sans rien nommer de plus. */
  label: string | null;
  /** Code ECO à poser sur ce même nœud terminal, avec `label` — voir `VariationNode.eco`. */
  eco?: string | null;
  sanMoves: readonly string[];
}

/**
 * Fusionne plusieurs lignes plates en un arbre unique (trie de coups) :
 * chaque ligne est rejouée depuis `startFen`, en réutilisant les nœuds déjà
 * créés par une ligne précédente partageant le même préfixe de coups (mêmes
 * SAN, à chaque profondeur) — un embranchement réel apparaît naturellement dès
 * que deux lignes divergent. `label`/`eco` sont posés sur le nœud terminal de
 * chaque ligne, sans jamais écraser un `comment`/`eco` déjà présent (une ligne
 * plus courte, déjà nommée, garde son nom même si une ligne plus longue la
 * prolonge ensuite) — même esprit que `parsePgnTree`, qui ne réécrit jamais un
 * commentaire déjà capturé.
 *
 * Un coup illégal depuis la position atteinte interrompt SEULEMENT cette
 * ligne (elle s'arrête au dernier coup légal, sans nommer de nœud si elle n'a
 * pas atteint sa fin) — jamais toute la fusion : `imported_opening_lines` est
 * déjà validée coup par coup à l'import (voir `buildOpeningLineFromGame`),
 * mais rester tolérant ici évite qu'une seule ligne corrompue ne fasse
 * échouer l'arbre entier d'une famille de centaines de lignes.
 */
export function buildTreeFromLines(lines: readonly NamedLine[], startFen: string = PGN_TREE_START_FEN): VariationNode {
  const root = makeRoot(startFen);
  for (const line of lines) {
    let node = root;
    const chess = new Chess(startFen);
    let reachedEnd = true;
    for (const san of line.sanMoves) {
      let move: Move;
      try {
        move = chess.move(san);
      } catch {
        reachedEnd = false;
        break;
      }
      let child = node.children.find((c) => c.san === move.san);
      if (!child) {
        child = {
          ply: node.ply + 1,
          san: move.san,
          uci: uciOfMove(move),
          fen: chess.fen(),
          comment: null,
          eco: null,
          philosophy: null,
          strategicObjective: null,
          engineSuggestion: null,
          children: [],
        };
        node.children.push(child);
      }
      node = child;
    }
    if (reachedEnd && line.label && !node.comment) {
      node.comment = line.label;
      node.eco = line.eco ?? null;
    }
  }
  return root;
}

/**
 * Fusionne `addition` DANS `base` (mutation en place, renvoyée pour
 * chaînage) : pour chaque enfant d'`addition`, réutilise l'enfant de `base` de
 * même `san` s'il existe déjà (fusion récursive), sinon le rattache tel quel
 * (avec tout son sous-arbre). `comment`/`eco` d'`addition` ne sont recopiés
 * sur `base` QUE si `base` n'en a pas déjà — un chapitre curaté à la main
 * (voir `core/curriculum/openings.ts`) garde toujours la priorité sur un nom
 * dérivé automatiquement de la base Lichess. Les deux arbres doivent partager
 * la même position de départ (même `startFen`) : la fusion ne recoupe jamais
 * deux positions différentes par transposition.
 */
export function mergeTrees(base: VariationNode, addition: VariationNode): VariationNode {
  if (base.comment === null && addition.comment !== null) {
    base.comment = addition.comment;
    base.eco = addition.eco;
  }
  for (const child of addition.children) {
    const match = base.children.find((c) => c.san === child.san);
    if (match) mergeTrees(match, child);
    else base.children.push(child);
  }
  return base;
}

/**
 * Descend `root` en suivant `sanPath` (un enfant par SAN, à chaque
 * profondeur) — repère de navigation stable pour poser une annotation SANS
 * dépendre d'un index fragile qui casserait au moindre réagencement du texte
 * PGN (même principe que `course-tree.ts#nodeAtSanPath` pour `ChessMoveNode`).
 * Lève une erreur explicite (chemin fautif + SAN disponibles à ce niveau) si
 * `sanPath` ne correspond à aucun nœud réel — jamais un échec silencieux qui
 * ferait disparaître une annotation sans que personne ne le remarque.
 */
export function nodeAtSanPath(root: VariationNode, sanPath: readonly string[]): VariationNode {
  let node = root;
  for (const san of sanPath) {
    const next = node.children.find((c) => c.san === san);
    if (!next) {
      throw new Error(`pgn-tree: chemin SAN introuvable, "${san}" absent des enfants (${node.children.map((c) => c.san).join(", ")})`);
    }
    node = next;
  }
  return node;
}

/** Enrichissement à poser sur UN nœud via `annotateTree` — voir `VariationNode.philosophy`/`strategicObjective`/`engineSuggestion`. Chaque champ omis laisse le nœud inchangé (`undefined` ≠ `null` : `null` efface explicitement un enrichissement déjà posé par un appel précédent). */
export interface OpeningAnnotation {
  philosophy?: string | null;
  strategicObjective?: string | null;
  engineSuggestion?: OpeningEngineSuggestion | null;
}

/**
 * Pose plusieurs `OpeningAnnotation` sur `root` (mutation en place, renvoyée
 * pour chaînage) — chaque entrée `[sanPath, annotation]` repère son nœud via
 * `nodeAtSanPath`. Voir `core/curriculum/openings.ts` pour l'usage : chaque
 * table d'annotations y est sourcée à la main depuis une étude Lichess
 * publique précise (jamais une position/un commentaire inventés), citée dans
 * le commentaire au-dessus de la table elle-même.
 */
export function annotateTree(root: VariationNode, entries: readonly (readonly [readonly string[], OpeningAnnotation])[]): VariationNode {
  for (const [sanPath, annotation] of entries) {
    const node = nodeAtSanPath(root, sanPath);
    if (annotation.philosophy !== undefined) node.philosophy = annotation.philosophy;
    if (annotation.strategicObjective !== undefined) node.strategicObjective = annotation.strategicObjective;
    if (annotation.engineSuggestion !== undefined) node.engineSuggestion = annotation.engineSuggestion;
  }
  return root;
}
