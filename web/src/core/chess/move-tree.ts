import { Chess, type Move } from "chess.js";
import type { CourseArrow, CourseHighlight } from "@/core/curriculum/course-lesson";

/**
 * Parseur PGN récursif — ARBRE COMPLET de coups façon Lichess Study : jamais
 * de variante secondaire (RAV, `(...)`) filtrée ou aplatie, contrairement à
 * `core/curriculum/course-lesson.ts#CourseStep` (une seule ligne SAN plate par
 * chapitre). Sœur délibérément DISTINCTE de `core/chess/pgn-tree.ts` plutôt
 * qu'une extension de `VariationNode` : `pgn-tree.ts` sert le Répertoire
 * d'ouvertures (`server/curriculum/opening-tree-index.ts` y lit `comment`
 * comme le NOM d'une variante, jamais comme un commentaire pédagogique par
 * nœud) — changer son contrat casserait ce consommateur. Ici `comment` est un
 * vrai commentaire de coup (traduction/analyse), et chaque nœud peut aussi
 * porter des flèches/surbrillances néon (`[%cal]`/`[%csl]`, convention
 * Lichess) et une suggestion moteur — aucun de ces besoins n'existe côté
 * Répertoire.
 *
 * Cahier des charges du 2026-09-12 (« rendu asynchrone d'arbre complet
 * identique à 100% au format Lichess Study ») : chaque `ChessMoveNode` porte
 * TOUTE l'information d'un nœud d'étude Lichess — SAN/UCI, FEN résultante
 * (chess.js, jamais recalculée deux fois), variantes imbriquées à l'infini
 * (`children[0]` = ligne principale, `children[1..]` = variantes sœurs,
 * MÊME convention que `pgn-tree.ts#VariationNode.children` — un tableau de
 * tableaux `variations: ChessMoveNode[][]` serait strictement équivalent
 * mais dupliquerait chaque variante dans une structure parallèle pour un
 * gain nul ; `children[]` reste la représentation la plus simple à parcourir
 * ET la plus proche de ce que Lichess lui-même expose), commentaires riches,
 * annotations graphiques, suggestion moteur.
 */

export interface EngineSuggestion {
  /** SAN du coup suggéré par le moteur DEPUIS la position de ce nœud (avant de jouer un enfant) — jamais un coup halluciné : toujours un `[%eval]`/une ligne d'analyse réellement publiée par la source (voir `core/curriculum/course-tree.ts`). */
  san: string;
  uci: string;
  /** Évaluation en centipawns après le coup suggéré, point de vue Blancs — `null` si seul un mat est connu ou si la source ne chiffre pas l'analyse. */
  cp: number | null;
  /** Mat en N après le coup suggéré (positif = Blancs matent) — `null` sinon. */
  mate: number | null;
}

export interface ChessMoveNode {
  /** Chemin stable depuis la racine (segments = index dans `children` du parent à chaque profondeur, joints par « . », ex. "0.2.1") — clé React ET identifiant de navigation, ne change jamais tant que l'arbre n'est pas reconstruit. */
  id: string;
  /** Numéro de demi-coup absolu (1 = premier coup de la partie), 0 pour la racine. */
  ply: number;
  san: string | null;
  uci: string | null;
  fen: string;
  comment: string | null;
  /**
   * « PRO TIP » de Grand Maître extrait du commentaire source (voir
   * `splitCoachTip`) — `null` quand le nœud n'en porte pas. Le lecteur
   * (`course-tree-viewer.tsx`) l'affiche comme un bloc distinct, jamais noyé
   * dans la prose du commentaire : c'est le seul endroit où le conseil d'auteur
   * doit apparaître, séparé de l'annotation factuelle du coup.
   */
  tip: string | null;
  arrows: readonly CourseArrow[];
  highlights: readonly CourseHighlight[];
  /** Suggestion moteur affichée en permanence SUR ce nœud (le coup qu'on s'apprête à jouer depuis ici) — voir le docstring de `EngineSuggestion`. */
  engineSuggestion: EngineSuggestion | null;
  /** `children[0]` = ligne principale, `children[1..]` = variantes (RAV) — voir le docstring du fichier. */
  children: ChessMoveNode[];
}

const MOVE_NUMBER_RE = /^\d+\.+$/;
const NAG_RE = /^\$\d+$/;
const RESULT_RE = /^(1-0|0-1|1\/2-1\/2|\*)$/;
/** Convention Lichess : `R`=rouge, `G`=vert, `Y`=jaune, `B`=bleu — seuls rouge et vert ont un équivalent dans `CourseArrow`/`CourseHighlight` (`core/curriculum/course-lesson.ts`), jaune/bleu retombent sur vert plutôt que d'être perdus. */
const CSL_RE = /\[%csl\s+([^\]]+)\]/gi;
const CAL_RE = /\[%cal\s+([^\]]+)\]/gi;
const EVAL_RE = /\[%eval\s+(#-?\d+|-?\d+(?:\.\d+)?)\]/i;

function annotationColor(code: string): "green" | "red" {
  return code === "R" ? "red" : "green";
}

function uciOfMove(move: Move): string {
  return move.from + move.to + (move.promotion ?? "");
}

/**
 * Marqueur conventionnel du catalogue : un commentaire de nœud qui porte un
 * conseil de Grand Maître le préfixe par « PRO TIP ». Les notes sources
 * reprises dans `core/curriculum/course-tree.ts` l'utilisent systématiquement
 * pour le premier coup commenté d'un chapitre ; on sépare ce conseil du reste
 * de la prose pour pouvoir l'afficher comme un bloc à part, exactement comme
 * Lichess Study distingue une note d'auteur d'une glose. Insensible à la casse
 * et à l'espacement (`PRO TIP :`, `Pro Tip`, `protip`).
 */
const COACH_TIP_RE = /PRO\s*TIP\b\s*:?\s*/i;

/**
 * Sépare un commentaire nettoyé en `{ comment, tip }` : le texte qui SUIT le
 * marqueur devient le conseil, ce qui le PRÉCÈDE reste le commentaire normal
 * (souvent vide — le marqueur ouvre le commentaire dans tout le catalogue).
 * Aucun marqueur : le commentaire ressort inchangé, `tip` reste `null` — jamais
 * un conseil fabriqué à partir d'une prose qui n'en portait pas.
 */
function splitCoachTip(text: string): { comment: string | null; tip: string | null } {
  const match = text.match(COACH_TIP_RE);
  if (!match || match.index === undefined) return { comment: text.length > 0 ? text : null, tip: null };
  const before = text.slice(0, match.index).trim();
  const tip = text.slice(match.index + match[0].length).trim();
  return { comment: before.length > 0 ? before : null, tip: tip.length > 0 ? tip : null };
}

/** Extrait `[%csl]`/`[%cal]`/`[%eval]` d'un texte de commentaire brut et renvoie le texte NETTOYÉ de ces balises (jamais affiché tel quel à l'utilisateur — voir `course-tree.ts`, qui n'affiche que le reste en prose). */
function parseAnnotatedComment(raw: string): {
  text: string | null;
  tip: string | null;
  arrows: CourseArrow[];
  highlights: CourseHighlight[];
  evalCp: number | null;
  evalMate: number | null;
} {
  const highlights: CourseHighlight[] = [];
  const arrows: CourseArrow[] = [];
  let evalCp: number | null = null;
  let evalMate: number | null = null;

  for (const match of raw.matchAll(CSL_RE)) {
    for (const entry of match[1].split(",")) {
      const square = entry.trim().slice(1);
      const color = annotationColor(entry.trim().slice(0, 1));
      if (/^[a-h][1-8]$/.test(square)) highlights.push({ square, color });
    }
  }
  for (const match of raw.matchAll(CAL_RE)) {
    for (const entry of match[1].split(",")) {
      const trimmed = entry.trim();
      const color = annotationColor(trimmed.slice(0, 1));
      const from = trimmed.slice(1, 3);
      const to = trimmed.slice(3, 5);
      if (/^[a-h][1-8]$/.test(from) && /^[a-h][1-8]$/.test(to)) arrows.push({ from, to, color });
    }
  }
  const evalMatch = raw.match(EVAL_RE);
  if (evalMatch) {
    if (evalMatch[1].startsWith("#")) evalMate = Number.parseInt(evalMatch[1].slice(1), 10);
    else evalCp = Math.round(Number.parseFloat(evalMatch[1]) * 100);
  }

  const cleaned = raw.replace(CSL_RE, "").replace(CAL_RE, "").replace(EVAL_RE, "").trim();
  const { comment, tip } = splitCoachTip(cleaned);
  return { text: comment, tip, arrows, highlights, evalCp, evalMate };
}

/**
 * Découpe le texte en tokens — commentaires `{...}` entiers (contenu
 * préservé), parenthèses isolées, et le reste (coups/numéros/NAG/résultat)
 * séparé par les espaces. Identique dans l'esprit à
 * `pgn-tree.ts#tokenize` (voir son docstring pour le détail du traitement
 * "1.e4" collé) — dupliqué ici en toute connaissance de cause plutôt
 * qu'importé, `pgn-tree.ts` restant un module `core/chess` autonome sans
 * dépendance vers `core/curriculum` (mauvais sens de dépendance sinon, ce
 * fichier important déjà `CourseArrow`/`CourseHighlight`).
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

function makeRoot(startFen: string): ChessMoveNode {
  return { id: "0", ply: 0, san: null, uci: null, fen: startFen, comment: null, tip: null, arrows: [], highlights: [], engineSuggestion: null, children: [] };
}

interface Cursor {
  i: number;
}

/**
 * Consomme les tokens à partir de `cursor.i`, ajoutant des enfants à
 * `parentNode` — s'arrête sur une parenthèse fermante ou une fin de flux.
 * Même principe récursif que `pgn-tree.ts#parseSequence` (voir son docstring
 * pour le détail : `(` ouvre une branche FRÈRE du dernier coup joué à ce
 * niveau, rejouée depuis `beforeFen` sur un clone `Chess` dédié) — étendu
 * ici pour attacher `comment`/`arrows`/`highlights`/`engineSuggestion` sur
 * CHAQUE nœud (pas seulement le premier d'une branche) et donner un `id`
 * stable basé sur le chemin d'index dans `children`.
 */
function parseSequence(tokens: readonly string[], cursor: Cursor, chess: Chess, parentNode: ChessMoveNode): void {
  let currentNode = parentNode;
  let beforeFen: string | null = null;
  let beforeParent: ChessMoveNode | null = null;

  while (cursor.i < tokens.length) {
    const token = tokens[cursor.i];

    if (token === ")") {
      cursor.i += 1;
      return;
    }
    if (token === "(") {
      cursor.i += 1;
      if (beforeFen === null || beforeParent === null) {
        throw new Error(`move-tree: "(" inattendue sans coup précédent (token ${cursor.i})`);
      }
      parseSequence(tokens, cursor, new Chess(beforeFen), beforeParent);
      continue;
    }
    if (token.startsWith("{")) {
      const parsed = parseAnnotatedComment(token.slice(1, -1).trim());
      if (currentNode.comment === null && parsed.text) currentNode.comment = parsed.text;
      if (currentNode.tip === null && parsed.tip) currentNode.tip = parsed.tip;
      if (parsed.arrows.length > 0) currentNode.arrows = [...currentNode.arrows, ...parsed.arrows];
      if (parsed.highlights.length > 0) currentNode.highlights = [...currentNode.highlights, ...parsed.highlights];
      if ((parsed.evalCp !== null || parsed.evalMate !== null) && currentNode.engineSuggestion === null && currentNode.san !== null) {
        // L'éval porte sur LE COUP QUI VIENT D'ÊTRE JOUÉ (`currentNode`) — elle décrit la
        // qualité de ce choix, pas une suggestion pour le coup SUIVANT. Rien à poser ici :
        // une vraie suggestion moteur (voir `EngineSuggestion`) est un coup ALTERNATIF,
        // toujours fourni explicitement par `course-tree.ts` via `attachEngineSuggestion`,
        // jamais dérivée automatiquement d'un `[%eval]` du coup joué.
      }
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
      throw new Error(`move-tree: coup illégal "${token}" à la position "${fenBefore}"`);
    }
    const child: ChessMoveNode = {
      id: `${parentBeforeThisMove.id}.${parentBeforeThisMove.children.length}`,
      ply: parentBeforeThisMove.ply + 1,
      san: move.san,
      uci: uciOfMove(move),
      fen: chess.fen(),
      comment: null,
      tip: null,
      arrows: [],
      highlights: [],
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

/** Position de départ standard — même valeur que `pgn-tree.ts#PGN_TREE_START_FEN`, dupliquée pour ne pas créer de dépendance croisée (voir le docstring du fichier). */
export const MOVE_TREE_START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/**
 * Parse un PGN (variantes RAV, commentaires, `[%csl]`/`[%cal]` compris) en
 * arbre complet — voir le docstring du fichier. Lève une erreur explicite
 * (position + coup fautif) sur un coup illégal, jamais un arbre incohérent
 * produit en silence — même discipline que `pgn-tree.ts#parsePgnTree`.
 */
export function parseMoveTree(pgn: string, startFen: string = MOVE_TREE_START_FEN): ChessMoveNode {
  const root = makeRoot(startFen);
  parseSequence(tokenize(pgn), { i: 0 }, new Chess(startFen), root);
  return root;
}

/**
 * Pose une suggestion moteur EXPLICITE sur le nœud d'`id` donné (mutation
 * en place, renvoie l'arbre pour chaînage) — jamais dérivée automatiquement
 * d'un `[%eval]` de commentaire (voir la remarque dans `parseSequence`) :
 * l'appelant (`course-tree.ts`) fournit toujours le SAN du coup alternatif
 * et son évaluation, sourcés à la main depuis l'analyse originale. Lève une
 * erreur si `nodeId` n'existe pas — jamais un échec silencieux qui ferait
 * disparaître une suggestion sans que personne ne le remarque.
 */
export function attachEngineSuggestion(root: ChessMoveNode, nodeId: string, suggestion: EngineSuggestion): ChessMoveNode {
  const node = findNode(root, nodeId);
  if (!node) throw new Error(`move-tree: nœud "${nodeId}" introuvable pour attachEngineSuggestion`);
  node.engineSuggestion = suggestion;
  return root;
}

/** Recherche par `id` — parcours en profondeur, `null` si absent. */
export function findNode(root: ChessMoveNode, id: string): ChessMoveNode | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

/** La ligne principale (premier enfant à chaque embranchement), racine exclue — sert au mode "lecture linéaire" de repli. */
export function mainLine(root: ChessMoveNode): ChessMoveNode[] {
  const line: ChessMoveNode[] = [];
  let node = root;
  while (node.children.length > 0) {
    node = node.children[0];
    line.push(node);
  }
  return line;
}

/** Chemin racine→`id` inclus (`[root, ..., node]`) — sert à afficher le fil d'Ariane d'une variante et à la navigation clavier (le coup "précédent" est l'avant-dernier élément). `[]` si `id` introuvable. */
export function pathTo(root: ChessMoveNode, id: string): ChessMoveNode[] {
  if (root.id === id) return [root];
  for (const child of root.children) {
    const sub = pathTo(child, id);
    if (sub.length > 0) return [root, ...sub];
  }
  return [];
}

/** Tous les nœuds de l'arbre (racine comprise), ordre profondeur-d'abord — sert à construire les index de navigation (`move-tree-viewer.tsx`). */
export function collectNodes(root: ChessMoveNode): ChessMoveNode[] {
  const nodes: ChessMoveNode[] = [];
  const stack: ChessMoveNode[] = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node) continue;
    nodes.push(node);
    // Empile en ordre inverse pour visiter `children[0]` (ligne principale) en premier.
    for (let index = node.children.length - 1; index >= 0; index -= 1) stack.push(node.children[index]);
  }
  return nodes;
}
