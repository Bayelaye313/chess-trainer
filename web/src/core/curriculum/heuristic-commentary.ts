/**
 * Repli « pourquoi ce coup ? » GÉNÉRIQUE, calculé à partir de la position et
 * du coup lui-même (chess.js) plutôt que rédigé à la main — voir
 * `opening-commentary.ts` pour le contenu curaté (~20 chapitres, ligne
 * principale uniquement) dont celui-ci prend le relais.
 *
 * BUG CORRIGÉ (retour utilisateur direct, « les hints ne sont jamais adaptés,
 * ex. Zukertort ») : `GENERIC_BOOK_COMMENT` (texte fixe, unique, jamais
 * mis à jour selon le coup réel) était le SEUL repli disponible dès qu'un
 * chapitre/variante n'a pas de contenu rédigé — c'est-à-dire la quasi-
 * totalité du catalogue une fois sorti des ~20 lignes principales curatées :
 * toute variante nommée, chaque famille importée de Lichess (`imported-
 * openings-index.ts`, des milliers de familles). Le joueur cliquait sur
 * « Afficher l'indice » et lisait systématiquement la même phrase creuse
 * ("Cherche le coup qui développe une pièce..."), quel que soit le coup
 * réellement attendu — aucune indication sur la MENACE de l'adversaire ni
 * sur l'IDÉE concrète du coup, exactement le reproche formulé (« comprendre
 * la philosophie derrière chaque coup, les menaces de l'adversaire, l'idée
 * derrière » plutôt que retenir des coups par cœur).
 *
 * Ce module analyse le coup avec chess.js (pièce déplacée, capture, échec,
 * roque, fianchetto, poussée centrale, développement, pièce propre
 * menacée/pièce adverse mise en cause — via `Chess#attackers`, le primitif
 * natif chess.js « qui attaque cette case », voir `core/chess/attacks.ts`
 * pour son complément « que menace cette pièce ») pour produire un
 * commentaire ET un indice SPÉCIFIQUES à CE coup précis, sur N'IMPORTE
 * QUELLE position — fonctionne donc identiquement sur les ~20 chapitres
 * curatés (hors de leur contenu rédigé, ex. au-delà de la ligne principale)
 * ET sur l'intégralité du corpus importé, Zukertort et Défense Benima
 * compris, sans la moindre rédaction manuelle supplémentaire.
 *
 * Appelé avec le MÊME coup dans les deux sens d'utilisation :
 *  - en amont (indice du prochain coup à trouver) : `uci` = le coup scripté
 *    attendu (`expectedUci`) ou, une fois la manche `diverged`, le coup le
 *    plus populaire (`mostPopularContinuation`) — voir `drill.hintUci` dans
 *    `use-opening-drill.ts`, EXACTEMENT le coup pointé par la flèche
 *    d'indice automatique ;
 *  - en aval (commentaire sous l'échiquier une fois le coup joué) : `uci` =
 *    le coup RÉELLEMENT joué (`DrillHistoryEntry.uci`).
 * Le champ `hint` ne nomme jamais la case d'arrivée ni le coup lui-même —
 * même invariant que le contenu curaté (voir son docstring).
 */
import { Chess, type Square } from "chess.js";
import { moveInputFromUci } from "@/core/analysis/evaluate-move";
import { GENERIC_BOOK_COMMENT, type MoveCommentary } from "./opening-commentary";

type PieceSymbol = "p" | "n" | "b" | "r" | "q" | "k";
type Color = "w" | "b";

const PIECE_NAME: Record<PieceSymbol, { name: string; feminine: boolean }> = {
  p: { name: "pion", feminine: false },
  n: { name: "cavalier", feminine: false },
  b: { name: "fou", feminine: false },
  r: { name: "tour", feminine: true },
  q: { name: "dame", feminine: true },
  k: { name: "roi", feminine: false },
};

/** "un cavalier" / "une dame" — pièce non possédée (typiquement adverse, mentionnée pour la première fois). */
function indefinite(piece: PieceSymbol): string {
  const info = PIECE_NAME[piece];
  return `${info.feminine ? "une" : "un"} ${info.name}`;
}

/** "ton cavalier"/"ta dame" (`owner: "you"`) — seul cas utilisé ici, une pièce propre menacée. */
function possessive(piece: PieceSymbol): string {
  const info = PIECE_NAME[piece];
  return `${info.feminine ? "ta" : "ton"} ${info.name}`;
}

/** Pronom objet ("le"/"la") accordé au genre de la pièce, pour "ce coup LE met à l'abri". */
function pronoun(piece: PieceSymbol): string {
  return PIECE_NAME[piece].feminine ? "la" : "le";
}

/** Accord d'un participe/adjectif régulier en -é ("attaqué" → "attaquée") selon le genre de la pièce concernée. */
function agree(masculine: string, piece: PieceSymbol): string {
  return PIECE_NAME[piece].feminine ? `${masculine}e` : masculine;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const CENTER_SQUARES = new Set(["d4", "d5", "e4", "e5"]);
const WHITE_MINOR_HOME = new Set(["b1", "c1", "f1", "g1"]);
const BLACK_MINOR_HOME = new Set(["b8", "c8", "f8", "g8"]);
const WHITE_FIANCHETTO = new Set(["b2", "g2"]);
const BLACK_FIANCHETTO = new Set(["b7", "g7"]);

const PIECE_VALUE: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

interface HangingPiece {
  square: Square;
  piece: PieceSymbol;
}

/**
 * Pièces de `color` (jamais le roi, jamais littéralement "capturable" au
 * sens de cette analyse) attaquées par `opponent` et sans le moindre
 * défenseur sur `board`, triées de la plus précieuse à la moins précieuse —
 * `Chess#attackers` (primitif natif chess.js) tranche la relation
 * d'attaque/défense, aucune heuristique maison nécessaire.
 *
 * `includePawns` distingue les deux usages : `false` pour repérer une pièce
 * PROPRE menacée (une simple tension de pions est bien trop fréquente/banale
 * pour être une menace instructive), `true` pour repérer ce qu'un coup vient
 * de mettre en cause CHEZ L'ADVERSAIRE — là, un pion fraîchement attaqué et
 * non défendu (ex. Nf3 sur e5 dès le 2e coup) est au contraire une idée
 * d'ouverture classique et pédagogiquement pertinente.
 */
function hangingPieces(board: Chess, color: Color, opponent: Color, includePawns: boolean): HangingPiece[] {
  const result: HangingPiece[] = [];
  for (const row of board.board()) {
    for (const cell of row) {
      if (!cell || cell.color !== color) continue;
      if (cell.type === "k") continue;
      if (cell.type === "p" && !includePawns) continue;
      if (board.attackers(cell.square, opponent).length > 0 && board.attackers(cell.square, color).length === 0) {
        result.push({ square: cell.square, piece: cell.type });
      }
    }
  }
  return result.sort((a, b) => PIECE_VALUE[b.piece] - PIECE_VALUE[a.piece]);
}

export function computeHeuristicCommentary(fenBefore: string, uci: string): MoveCommentary {
  const before = new Chess(fenBefore);
  const inCheckBefore = before.inCheck();
  const mainThreat = hangingPieces(before, before.turn(), before.turn() === "w" ? "b" : "w", false)[0];

  const after = new Chess(fenBefore);
  let move;
  try {
    move = after.move(moveInputFromUci(uci));
  } catch {
    return GENERIC_BOOK_COMMENT;
  }
  const mover = move.color as Color;
  const opponent: Color = mover === "w" ? "b" : "w";
  const piece = move.piece as PieceSymbol;
  const isCapture = move.flags.includes("c") || move.flags.includes("e");
  const isCheck = move.san.includes("+") || move.san.includes("#");

  // 1. Répond d'abord à un échec — rien d'autre ne compte tant que le roi est menacé.
  if (inCheckBefore) {
    const comment =
      piece === "k"
        ? "Le roi, en échec, s'écarte vers une case sûre — impossible de faire autre chose tant que l'échec n'est pas paré."
        : isCapture
          ? "Le roi était en échec : cette capture supprime directement la pièce qui l'attaquait."
          : "Le roi était en échec : ce coup s'interpose pour couper la ligne d'attaque adverse.";
    return {
      comment,
      hint: "Réponds d'abord à l'échec : bouge ton roi, bloque la ligne d'attaque, ou capture la pièce qui donne échec.",
    };
  }

  // 2. Une pièce (hors pion/roi) était attaquée sans aucun défenseur — priorité pédagogique : la menace adverse.
  if (mainThreat && mainThreat.square === move.from) {
    return {
      comment: `${capitalize(possessive(mainThreat.piece))} était ${agree("attaqué", mainThreat.piece)} sans aucun défenseur — ce coup ${pronoun(mainThreat.piece)} met à l'abri avant que l'adversaire ne ${pronoun(mainThreat.piece)} capture gratuitement.`,
      hint: "Une de tes pièces est attaquée sans défense — commence par la mettre à l'abri ou par la défendre.",
    };
  }
  if (mainThreat && after.attackers(mainThreat.square, mover).length > 0 && after.get(mainThreat.square)?.color === mover) {
    return {
      comment: `${capitalize(possessive(mainThreat.piece))} était ${agree("menacé", mainThreat.piece)} sans défenseur — ce coup lui en donne un, sans avoir besoin de la déplacer.`,
      hint: "Une de tes pièces est attaquée sans défense — commence par la mettre à l'abri ou par la défendre.",
    };
  }

  // 3. Capture (avec ou sans échec en prime).
  if (isCapture && move.captured) {
    const captured = move.captured as PieceSymbol;
    return {
      comment: `Capture ${indefinite(captured)} adverse ${agree("resté", captured)} à portée${isCheck ? ", avec échec en prime" : ""} — un gain de matériel qui simplifie la position.`,
      hint: "Le coup à trouver gagne du matériel en capturant une pièce adverse restée à portée.",
    };
  }

  // 4. Échec sans capture : force une réponse immédiate, gagne un temps.
  if (isCheck) {
    return {
      comment: "Ce coup donne échec, forçant le roi adverse à réagir immédiatement — un temps de développement gagné de force.",
      hint: "Cherche le coup qui met le roi adverse en échec pour lui arracher une réponse forcée.",
    };
  }

  // 5. Met en cause une pièce (ou un pion) adverse encore sans défenseur — le coup vient de créer cette menace.
  const created = hangingPieces(after, opponent, mover, true)[0];
  if (created) {
    const isPawn = created.piece === "p";
    return {
      comment: isPawn
        ? `Attaque le pion adverse en ${created.square}, qui n'est pas encore défendu — l'adversaire doit réagir tout de suite.`
        : `Met en cause ${indefinite(created.piece)} adverse en ${created.square}, pas suffisamment ${agree("défendu", created.piece)} — l'adversaire doit y répondre au coup suivant.`,
      hint: isPawn
        ? "Cherche le coup qui attaque directement un pion adverse encore sans défenseur."
        : "Cherche le coup qui attaque directement une pièce adverse mal défendue.",
    };
  }

  // 6. Roque : sécurité du roi avant l'ouverture des lignes.
  if (move.flags.includes("k") || move.flags.includes("q")) {
    const kingside = move.flags.includes("k");
    return {
      comment: kingside
        ? "Met le roi à l'abri à l'aile roi et connecte les tours — la sécurité avant l'ouverture des lignes."
        : "Roque à l'aile dame : le roi se met à l'abri pendant que la tour rejoint déjà le centre, souvent le prélude à une attaque à l'aile roi.",
      hint: "Mets ton roi à l'abri en roquant.",
    };
  }

  // 7. Fianchetto : le fou prend la grande diagonale.
  const fianchettoSquares = mover === "w" ? WHITE_FIANCHETTO : BLACK_FIANCHETTO;
  if (piece === "b" && fianchettoSquares.has(move.to)) {
    return {
      comment: "Fianchetto : le fou prend la grande diagonale, une pièce maîtresse pour tout le plan à venir.",
      hint: "Prépare le fianchetto de ton fou sur la grande diagonale.",
    };
  }

  // 8. Poussée centrale : la priorité numéro un de l'ouverture.
  if (piece === "p" && CENTER_SQUARES.has(move.to)) {
    return {
      comment: "Occupe ou dispute directement une case centrale — la priorité numéro un de toute ouverture.",
      hint: "Avance ou soutiens un pion central pour disputer le centre à l'adversaire.",
    };
  }

  // 9. Développement d'une pièce mineure encore sur sa case de départ.
  const homeSquares = mover === "w" ? WHITE_MINOR_HOME : BLACK_MINOR_HOME;
  if ((piece === "n" || piece === "b") && homeSquares.has(move.from)) {
    return {
      comment: `Développe ${possessive(piece)} vers une case active — chaque coup d'ouverture doit mobiliser une nouvelle pièce.`,
      hint: "Développe une pièce mineure qui n'est pas encore sortie, vers une case active.",
    };
  }

  // 10. Repli final — encore spécifique au type de pièce déplacée plutôt que totalement générique.
  if (piece === "p") {
    return {
      comment: "Coup de pion qui ajuste la structure en vue du plan à venir, dans l'esprit général de cette ouverture.",
      hint: "Cherche le coup de pion qui prépare ton plan sans affaiblir de case importante.",
    };
  }
  return {
    comment: `Replace ${possessive(piece)} sur une case plus active, dans l'esprit général de cette ouverture.`,
    hint: "Cherche la pièce qui peut se rendre plus active sans se mettre en danger.",
  };
}
