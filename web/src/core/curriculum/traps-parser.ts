/**
 * Parseur PGN pour l'ingestion de masse (`scripts/seed-from-pgn.ts`) — lit un
 * fichier texte contenant PLUSIEURS parties PGN standard et en extrait soit
 * des pièges (`buildTrapFromGame`), soit de simples lignes d'ouverture
 * (`buildOpeningLineFromGame`). Module pur, aucune dépendance serveur : testé
 * indépendamment du script et de la DB (voir `traps-parser.test.ts`). Seule
 * exception, par injection plutôt que par import direct : le repli « ligne
 * linéaire » de `buildBulkTrapFromGame` (voir plus bas) peut interroger un
 * moteur via `LinearFallbackRefutationResolver`, une fonction fournie par
 * l'appelant — ce module lui-même n'importe jamais Stockfish/le serveur.
 *
 * ## Convention « piège » retenue
 *
 * Un fichier PGN générique (partie de tournoi, base d'ouvertures) n'a aucune
 * notion de « coup piège » — juste une suite de coups. Les VRAIES bases de
 * pièges d'ouverture publiées (compilations 365Chess/ChessTempo/dépôts GitHub
 * dédiés) utilisent en revanche très couramment la notation PGN standard des
 * variantes entre parenthèses pour noter « le coup naturel qui perd » comme
 * une ALTERNATIVE au coup réellement joué — exactement l'usage prévu ici :
 *
 *   9. O-O (9... dxc3 {ce coup naturel perd un temps décisif}) 9... Bb6 *
 *
 * La ligne principale (hors parenthèses) EST `setupMoves` + `refutationMoves`
 * (le chemin correct) ; le PREMIER coup de la variation entre parenthèses est
 * `trapMove` (le coup naturel mais perdant) ; son commentaire `{...}`, s'il
 * existe, devient `trapExplanation` par défaut. Une partie SANS variation ne
 * peut pas produire de piège (impossible de savoir où se situe la tentation)
 * — `buildTrapFromGame` renvoie alors `null`, jamais un piège inventé.
 *
 * Le point de bascule exact dépend du numéro de coup ÉCRIT DANS la variation
 * (voir `splitFirstVariation`) : `6. cxd4 (6... Bb4+)` (points de suspension
 * = alternative NOIRE) bascule après cxd4 — Bb4+ remplace le coup noir qui
 * suit dans le texte — tandis que `3. Nf3 (3. Qxd4)` (même numéro, même
 * camp) bascule AVANT Nf3 — Qxd4 remplace Nf3 lui-même. Sans numéro dans la
 * variation, le repli par défaut est « même camp que le coup précédent »
 * (la lecture stricte de la spécification PGN du RAV).
 *
 * ## Limites assumées (documentées plutôt que masquées)
 *
 * - Une seule variation par partie est EXPLOITÉE (la première rencontrée) —
 *   pas un arbre RAV complet. Des variations top-level supplémentaires AU-DELÀ
 *   de la première (ex. deux `( ... )` distincts dans la même partie) sont
 *   toutes RETIRÉES de la ligne principale par `splitFirstVariation` — jamais
 *   laissées en résidu : un fragment `(8. Rh1)` oublié dans `mainline`
 *   produirait des tokens `"(8."`/`"Rh1)"` que chess.js rejette, ce qui a
 *   longtemps fait passer des parties parfaitement valides pour illégales.
 * - Les glyphes d'annotation (`!`, `?`, `!!`, `??`, `!?`, `?!`) collés à un
 *   coup sont retirés avant validation (pas un suffixe SAN reconnu par
 *   chess.js) ; les échecs/mats (`+`, `#`) sont conservés tels quels.
 * - Chaque coup — ligne principale ET variation — est validé légal via
 *   chess.js ; la moindre illégalité fait `null` la partie entière pour
 *   `buildTrapFromGame` (contenu écrit à la main : jamais un piège
 *   partiellement fiable, voir le docstring de `traps.ts`). `buildBulkTrapFromGame`
 *   tolère un DERNIER coup illisible en tronquant la ligne plutôt qu'en
 *   jetant tout le puzzle — voir `truncateToLegalPrefix` et
 *   `validateLinearFallbackTrap`.
 * - `buildBulkTrapFromGame` SEUL replie sur la ligne linéaire quand aucune
 *   variation RAV n'est exploitable (la grande majorité des dumps « parties
 *   réelles » type Bill Wall/Lichess) : l'avant-dernier coup joué devient
 *   `trapMove`, et un moteur (`LinearFallbackRefutationResolver`, injecté par
 *   `scripts/import-bulk-traps.ts`) détermine `refutationMoves[0]` depuis la
 *   position critique — le DERNIER coup du PGN (la punition réelle de
 *   l'adversaire, jouée depuis une AUTRE position) ne convient PAS comme
 *   réfutation, voir le docstring de `validateLinearFallbackTrap`.
 */
import { Chess } from "chess.js";
import type { OpeningTrap, TrapDifficulty, TrapSide } from "./traps";

export interface RawPgnGame {
  tags: Record<string, string>;
  /** Coups SAN de la ligne principale, glyphes `!?` retirés, résultat/numéros de coups déjà nettoyés. */
  mainline: string[];
  /** Index dans `mainline` où la variation démarre (= longueur de `setupMoves` si un piège en est extrait), ou `null` si aucune variation trouvée. */
  variationAtPly: number | null;
  /** Premier (et seul) coup de la variation — le `trapMove` candidat. */
  variationMove: string | null;
  /** Commentaire `{...}` attaché au coup de la variation, s'il existe. */
  variationComment: string | null;
}

const RESULT_TOKENS = new Set(["*", "1-0", "0-1", "1/2-1/2"]);

/** Retire les glyphes d'annotation (`!`, `?`, combinaisons) en fin de coup — jamais un suffixe SAN valide pour chess.js. Les `+`/`#` sont conservés. */
function stripAnnotationGlyphs(token: string): string {
  return token.replace(/[!?]+$/, "");
}

/** Retire un préfixe de numéro de coup (`13.`, `13...`, glyphés ou non) — tolère aussi bien `13. Nf3` que `13.Nf3`/`13...Nf3`. */
function stripMoveNumber(token: string): string {
  return token.replace(/^\d+\.(\.\.)?/, "");
}

/**
 * Repère TOUTES les variations top-level (parenthèses) d'un movetext, en
 * ignorant tout ce qui se trouve à l'intérieur d'un commentaire `{...}` (qui
 * peut légitimement contenir des parenthèses sans qu'elles comptent comme une
 * variation). Renvoie les bornes `[start, end]` (indices du `(` et du `)`) de
 * chacune, dans l'ordre d'apparition — une variation imbriquée dans une autre
 * n'ouvre pas une entrée séparée (seule la borne top-level compte).
 */
function findTopLevelVariations(movetext: string): Array<[number, number]> {
  const spans: Array<[number, number]> = [];
  let depth = 0;
  let inComment = false;
  let start = -1;
  for (let i = 0; i < movetext.length; i++) {
    const ch = movetext[i];
    if (ch === "{") {
      inComment = true;
      continue;
    }
    if (ch === "}") {
      inComment = false;
      continue;
    }
    if (inComment) continue;
    if (ch === "(") {
      if (depth === 0) start = i;
      depth++;
      continue;
    }
    if (ch === ")") {
      depth--;
      if (depth === 0 && start !== -1) {
        spans.push([start, i]);
        start = -1;
      }
    }
  }
  return spans;
}

/**
 * Sépare la ligne principale de la PREMIÈRE variation top-level rencontrée
 * (parenthèses) — c'est celle-là seule qui alimente `variationMove`/
 * `variationComment` (voir le docstring du fichier : une seule variation
 * exploitée par partie). Toute variation top-level SUPPLÉMENTAIRE au-delà de
 * la première est également retirée de `mainline` (jamais laissée en résidu :
 * un fragment `(8. Rh1)` oublié produirait des tokens `"(8."`/`"Rh1)"` que
 * chess.js rejette comme coups illégaux — voir le docstring du fichier).
 */
function splitFirstVariation(movetext: string): { mainline: string; variation: string | null } {
  const spans = findTopLevelVariations(movetext);
  if (spans.length === 0) return { mainline: movetext, variation: null };

  let mainline = "";
  let cursor = 0;
  for (const [start, end] of spans) {
    mainline += movetext.slice(cursor, start) + " ";
    cursor = end + 1;
  }
  mainline += movetext.slice(cursor);

  const [firstStart, firstEnd] = spans[0];
  return { mainline, variation: movetext.slice(firstStart + 1, firstEnd) };
}

/** Tokenise un fragment de movetext (ligne principale OU intérieur d'une variation) en une liste de coups SAN propres. */
function tokenizeMoves(fragment: string): string[] {
  return fragment
    .replace(/\{[^}]*\}/g, " ") // commentaires restants (hors ceux déjà consommés par splitFirstVariation)
    .split(/\s+/)
    .map((tok) => tok.trim())
    .filter((tok) => tok.length > 0)
    .filter((tok) => !RESULT_TOKENS.has(tok))
    .filter((tok) => !/^\$\d+$/.test(tok)) // NAG (ex. $1, $4)
    .map(stripMoveNumber)
    .filter((tok) => tok.length > 0)
    .map(stripAnnotationGlyphs);
}

/** Extrait le SEUL coup d'une variation à un coup (`9... dxc3 {texte}`) — ignore un éventuel commentaire déjà retiré en amont. */
function extractVariationMove(variationText: string): { move: string | null; comment: string | null } {
  const commentMatch = variationText.match(/\{([^}]*)\}/);
  const comment = commentMatch ? commentMatch[1].trim() : null;
  const moves = tokenizeMoves(variationText);
  return { move: moves[0] ?? null, comment };
}

function parseTagPairs(gameText: string): Record<string, string> {
  const tags: Record<string, string> = {};
  const re = /\[(\w+)\s+"((?:[^"\\]|\\.)*)"\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(gameText))) {
    tags[m[1]] = m[2].replace(/\\"/g, '"');
  }
  return tags;
}

/** Découpe un fichier PGN multi-parties sur la frontière de chaque nouvelle section de tags (`[Event `). */
function splitGames(pgnText: string): string[] {
  return pgnText
    .split(/(?=\[Event )/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);
}

function parseOneGame(gameText: string): RawPgnGame {
  const tags = parseTagPairs(gameText);
  const movetext = gameText.replace(/\[(\w+)\s+"((?:[^"\\]|\\.)*)"\]/g, "").trim();
  const { mainline: mainlineText, variation } = splitFirstVariation(movetext);
  const mainline = tokenizeMoves(mainlineText);

  if (variation === null) {
    return { tags, mainline, variationAtPly: null, variationMove: null, variationComment: null };
  }

  // Une variation est une alternative au coup de la ligne principale qui la
  // précède IMMÉDIATEMENT (ex. `3. Nf3 (3. Qxd4 ...)` : Qxd4 remplace Nf3) —
  // SAUF quand son propre numéro de coup indique explicitement l'autre
  // camp (ex. `6. cxd4 (6... Bb4+ ...) 6... Bb6` : le "6..." avec points de
  // suspension marque une alternative noire, donc à Bb6, le coup SUIVANT
  // dans le texte, pas à cxd4). C'est ainsi que les bases de parties
  // annotées « réelles » écrivent très couramment l'alternative du camp qui
  // n'a pas encore joué à cet instant du texte.
  const tokensBeforeParen = tokenizeMoves(movetext.slice(0, movetext.indexOf(variation) - 1)).length;
  // Ply pair (0, 2, 4…) = le dernier coup joué avant la parenthèse était blanc ; impair = noir.
  const precedingMoveWasWhite = tokensBeforeParen % 2 === 1;
  const variationLabelMatch = variation.match(/^\s*\d+\s*(\.\.\.|\.)/);
  const variationIsForBlack = variationLabelMatch ? variationLabelMatch[1] === "..." : !precedingMoveWasWhite;
  const sameSideAsPreceding = variationIsForBlack !== precedingMoveWasWhite;
  const variationAtPly = Math.max(0, sameSideAsPreceding ? tokensBeforeParen - 1 : tokensBeforeParen);
  const { move, comment } = extractVariationMove(variation);

  return { tags, mainline, variationAtPly, variationMove: move, variationComment: comment };
}

/** Parse un texte PGN contenant une ou plusieurs parties — jamais d'exception, une partie illisible produit juste des tags vides et un mainline vide (filtré en aval par la validation chess.js). */
export function parsePgnGames(pgnText: string): RawPgnGame[] {
  return splitGames(pgnText).map(parseOneGame);
}

function replayLegal(chess: Chess, moves: readonly string[]): boolean {
  for (const san of moves) {
    try {
      chess.move(san);
    } catch {
      return false;
    }
  }
  return true;
}

const DIFFICULTY_PLY_THRESHOLDS: readonly [number, TrapDifficulty][] = [
  [6, "beginner"],
  [12, "intermediate"],
];

/** Difficulté par défaut faute de `[Difficulty]` — selon la profondeur (en demi-coups) à laquelle le piège se referme : plus tôt dans la partie, plus le motif est connu/accessible. */
export function defaultDifficultyFromSetupPlies(setupPlies: number): TrapDifficulty {
  for (const [maxPlies, level] of DIFFICULTY_PLY_THRESHOLDS) {
    if (setupPlies < maxPlies) return level;
  }
  return "expert";
}

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // diacritiques (accents) une fois décomposés par NFD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Hash court et stable (djb2) — sert à désambiguïser deux parties qui produiraient le même slug d'`[Event]`, sans dépendance externe. */
function shortHash(text: string): string {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash + text.charCodeAt(i)) >>> 0;
  return hash.toString(36).slice(0, 6);
}

export interface BuildTrapOptions {
  /** Utilisé pour préfixer un id stable et lisible — typiquement le nom du fichier source. */
  idPrefix: string;
}

interface TrapCore {
  setupMoves: readonly string[];
  /** Le coup piège lui-même — extrait ici une seule fois pour que TypeScript le sache non-null dans les deux appelants (`game.variationMove` reste `string | null` à leurs yeux). */
  trapMove: string;
  refutationMoves: readonly string[];
  victimSide: TrapSide;
}

/**
 * Cœur de validation « variation RAV » — partagé par `buildTrapFromGame`
 * (contenu déjà taggé à la main, voir `data/import/traps/*.pgn`) et
 * `buildBulkTrapFromGame` (dumps PGN bruts trouvés en ligne, voir
 * `scripts/import-bulk-traps.ts`) quand la partie EN A une (`variationAtPly`
 * non `null`) — les deux n'diffèrent QUE dans la manière dont ils remplissent
 * les champs descriptifs/tags manquants, jamais dans les règles de légalité
 * elles-mêmes. `null` si un seul coup (ligne principale ou variation) s'avère
 * illégal depuis la position atteinte (voir le docstring du fichier : jamais
 * de piège partiellement fiable).
 */
function validateVariationTrap(game: RawPgnGame): TrapCore | null {
  if (game.variationAtPly === null || game.variationMove === null) return null;
  const trapMove = game.variationMove;

  const chess = new Chess();
  const setupMoves = game.mainline.slice(0, game.variationAtPly);
  const refutationMoves = game.mainline.slice(game.variationAtPly);
  if (refutationMoves.length === 0) return null; // rien à trouver : pas de réfutation à jouer

  if (!replayLegal(chess, setupMoves)) return null;
  const victimSide: TrapSide = chess.turn() === "w" ? "white" : "black";

  // `trapMove` doit être légal depuis la MÊME position critique (avant d'être défait) — chess.js clone via FEN pour ne pas consommer `chess`.
  const trapCheck = new Chess(chess.fen());
  try {
    trapCheck.move(trapMove);
  } catch {
    return null;
  }

  if (!replayLegal(chess, refutationMoves)) return null;
  if (refutationMoves[0] === trapMove) return null; // la réfutation ne peut pas être le coup piège lui-même

  return { setupMoves, trapMove, refutationMoves, victimSide };
}

/**
 * Rejoue `moves` depuis `chess` et s'arrête proprement au premier coup
 * illisible par chess.js (résidu de variation mal nettoyé, glyphe non
 * reconnu…) plutôt que de faire échouer tout l'appelant. Réservé au repli
 * linéaire de l'import en masse (voir `validateLinearFallbackTrap`) : un dump
 * PGN brut dont la toute fin est cassée ne doit perdre que cette queue, jamais
 * le puzzle entier.
 */
function truncateToLegalPrefix(chess: Chess, moves: readonly string[]): string[] {
  const legal: string[] = [];
  for (const san of moves) {
    try {
      chess.move(san);
    } catch {
      break;
    }
    legal.push(san);
  }
  return legal;
}

/** Il faut au moins la gaffe (`trapMove`) ET sa punition (`refutationMoves[0]`) pour qu'un repli linéaire produise un piège. */
const MIN_LINEAR_FALLBACK_PLIES = 2;

/**
 * Jusqu'où `validateLinearFallbackTrap` remonte, demi-coup par demi-coup
 * depuis la fin de la ligne, pour chercher le VRAI point de bascule (voir son
 * docstring) avant d'abandonner. Borné : au-delà, le coup candidat s'éloigne
 * trop de la conclusion réelle de la partie et risque de pointer vers un coup
 * de théorie ordinaire plutôt qu'une vraie faute — jamais un piège inventé.
 */
const MAX_LINEAR_FALLBACK_LOOKBACK_PLIES = 6;

/**
 * Interroge un moteur pour trouver le coup que la victime AURAIT DÛ jouer à la
 * place de `trapMoveSan`, depuis `fen` (la position juste avant la gaffe) —
 * seule source fiable pour le repli linéaire (voir `validateLinearFallbackTrap`) :
 * rien dans un PGN brut sans variation RAV ne dit ce que la victime aurait dû
 * jouer, seulement ce qu'elle a joué et comment elle a été punie ENSUITE (une
 * position différente, par l'autre camp — jamais un coup licite pour
 * `refutationMoves[0]` depuis `fen`, voir `buildTrapRound` dans
 * `trap-round.ts`). Renvoie le SAN du coup trouvé, ou `null` si le moteur n'a
 * rien trouvé de crédible — dans ce cas le repli échoue proprement (voir
 * `validateLinearFallbackTrap`), jamais un piège inventé. Fournie par
 * l'appelant (voir `resolveLinearFallbackRefutation` dans
 * `scripts/import-bulk-traps.ts`) pour que ce module reste pur/synchrone par
 * défaut — voir le docstring de fichier.
 */
export type LinearFallbackRefutationResolver = (fen: string, trapMoveSan: string) => Promise<string | null>;

/**
 * Repli « ligne linéaire » — import en masse UNIQUEMENT (voir
 * `buildBulkTrapFromGame`), jamais pour `buildTrapFromGame`. Les dumps PGN
 * bruts trouvés en ligne (ex. « 700 Opening Traps » de Bill Wall, via Lichess)
 * encodent très majoritairement le piège comme une VRAIE partie qui s'arrête
 * net dès le coup gagnant (mat ou abandon), sans jamais noter la tentation en
 * variation RAV :
 *
 *   5. Ng3 g6?? 6. Bb5 { 1-0 Black resigns. } 1-0
 *
 * Appelée seulement quand `validateVariationTrap` a déjà renvoyé `null` faute
 * de parenthèse exploitable. L'AVANT-DERNIER coup joué est le premier
 * candidat `trapMove` testé — mais si le moteur confirme qu'aucun meilleur
 * coup n'existait à cette position précise (le coup joué EST déjà le
 * meilleur : la partie était sans doute déjà perdue plus tôt, pas à cause de
 * ce demi-coup-là), on remonte d'un demi-coup et on réessaie, jusqu'à
 * `MAX_LINEAR_FALLBACK_LOOKBACK_PLIES` en arrière — c'est le premier point où
 * le moteur DIVERGE du coup réellement joué qui devient `trapMove`. Le
 * DERNIER coup du PGN (`Bb5` ci-dessus) n'est JAMAIS utilisé tel quel comme
 * réfutation, à aucune étape de cette recherche : c'est la punition de
 * l'adversaire depuis une AUTRE position (après la gaffe), pas un coup licite
 * pour la victime depuis la position critique — voir le docstring de
 * `resolveRefutation`. `refutationMoves[0]` est toujours déterminé par
 * `resolveRefutation` (moteur — voir `LinearFallbackRefutationResolver`).
 * `null` si la ligne, une fois tronquée au dernier coup légal (voir
 * `truncateToLegalPrefix`), ne compte pas au moins la gaffe + sa punition, ou
 * si aucune divergence n'a été trouvée dans toute la fenêtre de recherche
 * (pas de vraie gaffe identifiable dans les derniers coups de la partie).
 */
async function validateLinearFallbackTrap(game: RawPgnGame, resolveRefutation: LinearFallbackRefutationResolver): Promise<TrapCore | null> {
  const chess = new Chess();
  const legalMoves = truncateToLegalPrefix(chess, game.mainline);
  if (legalMoves.length < MIN_LINEAR_FALLBACK_PLIES) return null;

  const earliestCandidateIndex = Math.max(0, legalMoves.length - 1 - MAX_LINEAR_FALLBACK_LOOKBACK_PLIES);
  for (let candidateIndex = legalMoves.length - 2; candidateIndex >= earliestCandidateIndex; candidateIndex--) {
    const trapMove = legalMoves[candidateIndex]!;
    const setupMoves = legalMoves.slice(0, candidateIndex);

    // `setupMoves` est un préfixe déjà validé légal ci-dessus — le rejouer isolément ne peut pas lancer, seul le trait/FEN qui en résulte nous intéresse ici.
    const replay = new Chess();
    for (const san of setupMoves) replay.move(san);
    const fen = replay.fen();

    const refutationSan = await resolveRefutation(fen, trapMove);
    if (!refutationSan || refutationSan === trapMove) continue; // pas de divergence ici : on remonte d'un demi-coup

    // Jamais fait confiance aveuglément à une source externe : le SAN renvoyé doit lui-même être légal depuis `fen`.
    const legalityCheck = new Chess(fen);
    try {
      legalityCheck.move(refutationSan);
    } catch {
      continue;
    }

    const victimSide: TrapSide = replay.turn() === "w" ? "white" : "black";
    return { setupMoves, trapMove, refutationMoves: [refutationSan], victimSide };
  }

  return null; // aucune divergence trouvée dans toute la fenêtre de recherche
}

/**
 * Construit un `OpeningTrap` depuis une partie PGN déjà parsée — `null` si la
 * partie n'a pas de variation exploitable OU si un seul coup (ligne
 * principale ou variation) s'avère illégal depuis la position atteinte (voir
 * le docstring du fichier : jamais de piège partiellement fiable).
 */
export function buildTrapFromGame(game: RawPgnGame, options: BuildTrapOptions): OpeningTrap | null {
  const core = validateVariationTrap(game);
  if (!core) return null;
  const { setupMoves, trapMove, refutationMoves, victimSide } = core;

  const tags = game.tags;
  const name = tags.Event ?? "Piège importé";
  const family = tags.Site ?? tags.Opening ?? "Ouverture importée";
  const gambit = tags.Gambit ?? tags.Variation ?? tags.Opening ?? name;
  const eco = tags.ECO ?? "A00";
  const difficulty = (tags.Difficulty as TrapDifficulty | undefined) ?? defaultDifficultyFromSetupPlies(setupMoves.length);
  const victimLabel = victimSide === "white" ? "Blancs" : "Noirs";

  const id = `${slugify(options.idPrefix)}-${slugify(name) || "piege"}-${shortHash(JSON.stringify(game))}`;

  return {
    id,
    name,
    family,
    gambit,
    eco,
    victimSide,
    difficulty,
    summary: tags.Summary ?? `Importé de ${options.idPrefix} — un coup naturel piège les ${victimLabel.toLowerCase()}.`,
    setupMoves,
    trapMove,
    trapExplanation:
      tags.TrapExplanation ?? game.variationComment ?? `${trapMove} semble naturel mais pose un problème concret pour les ${victimLabel.toLowerCase()}.`,
    hint: tags.Hint ?? `Avant de jouer ${trapMove}, vérifiez ce que cette case ouvre ou laisse en prise.`,
    refutationMoves,
    outcome: tags.Outcome ?? `${refutationMoves[0]} évite le piège. ${trapMove}?? au contraire pose problème aux ${victimLabel.toLowerCase()}.`,
    comments: tags.Commentary ?? tags.Commentaire ?? "Importé automatiquement — voir le fichier PGN source pour le contexte complet.",
  };
}

/**
 * Nettoie un tag `[Site]`/`[Opening]` BRUT de base PGN grand public — souvent
 * `"Famille, Sous-variante"`, parfois préfixé d'un code ECO (`"B21: Sicilian,
 * Smith-Morra Gambit"`) — en `{ family, gambit }` directement exploitables par
 * les 2 premiers niveaux du filtre `/pieges` (voir `PiegesScreen`). Le contenu
 * qu'on écrit à la main (`data/import/traps/*.pgn`) n'en a jamais besoin : ses
 * tags `[Site]`/`[Gambit]` sont DÉJÀ scindés proprement à la source. Utilisée
 * uniquement par `buildBulkTrapFromGame`/`scripts/import-bulk-traps.ts`.
 */
export function splitOpeningFamilyAndGambit(raw: string): { family: string; gambit: string } {
  const withoutEcoPrefix = raw.replace(/^[A-E]\d{2}[:\s-]+/, "").trim();
  const separatorMatch = withoutEcoPrefix.match(/^(.*?)\s*[,:]\s*(.+)$/);
  if (!separatorMatch) return { family: withoutEcoPrefix, gambit: withoutEcoPrefix };
  const [, family, rest] = separatorMatch;
  return { family: family.trim() || withoutEcoPrefix, gambit: rest.trim() || family.trim() };
}

const BULK_DIFFICULTY_THRESHOLDS: readonly [number, TrapDifficulty][] = [
  [4, "beginner"],
  [8, "intermediate"],
];

/**
 * Difficulté par défaut pour un piège en masse SANS `[Difficulty]` — d'après
 * la longueur de `refutationMoves` (nombre de demi-coups de la solution à
 * trouver), sur demande explicite : <4 → débutant, <8 → intermédiaire, sinon
 * expert. Volontairement DIFFÉRENT de `defaultDifficultyFromSetupPlies`
 * (qui mesure la mise en place, pas la solution) — les fichiers PGN bruts
 * trouvés en ligne n'ont pas la même distribution de longueur de mise en
 * place que notre contenu écrit à la main, la solution est un signal plus
 * stable pour eux.
 */
export function estimateDifficultyFromRefutationLength(refutationMoves: readonly string[]): TrapDifficulty {
  for (const [maxLength, level] of BULK_DIFFICULTY_THRESHOLDS) {
    if (refutationMoves.length < maxLength) return level;
  }
  return "expert";
}

/** Nom de pièce (français) déduit du premier caractère d'un coup SAN — sert uniquement à choisir un indice générique, jamais la légalité. */
function pieceLabelFromSan(san: string): string {
  const clean = san.replace(/[+#!?]+$/g, "");
  if (clean === "O-O" || clean === "O-O-O") return "roi";
  switch (clean[0]) {
    case "N":
      return "cavalier";
    case "B":
      return "fou";
    case "R":
      return "tour";
    case "Q":
      return "dame";
    case "K":
      return "roi";
    default:
      return "pion"; // un coup SAN commençant par une lettre de colonne minuscule (a-h) est un coup de pion
  }
}

const GENERIC_HINTS: readonly string[] = [
  "Calcule les conséquences du dernier coup de l'adversaire avant de répondre.",
  "Cherche une opportunité tactique avec tes pièces mineures.",
];

const HINTS_BY_PIECE: Record<string, readonly string[]> = {
  cavalier: ["Le Cavalier vient de sauter sur une nouvelle case — vérifie ce qu'il attaque, et ce qu'il laisse derrière lui.", ...GENERIC_HINTS],
  fou: ["Le Fou vient de changer de diagonale — regarde ce qu'elle ouvre, ou ce qu'elle abandonne.", ...GENERIC_HINTS],
  tour: ["La Tour vient de s'engager sur une colonne ou une rangée — vérifie ce qu'elle y croise.", ...GENERIC_HINTS],
  dame: ["La Dame vient de se déplacer — une pièce mineure adverse peut-elle l'attaquer avec gain de temps ?", ...GENERIC_HINTS],
  roi: ["La sécurité du Roi vient de changer — vérifie les colonnes et diagonales qui s'ouvrent autour de lui.", ...GENERIC_HINTS],
  pion: ["Un pion vient d'avancer ou de capturer — vérifie la case qu'il laisse derrière lui, et celle où il atterrit.", ...GENERIC_HINTS],
};

/**
 * Indice générique faute de `[Hint]` — basé sur la NATURE de la dernière
 * pièce jouée (`trapMove`), jamais sur le coup lui-même (voir le docstring du
 * fichier : le coup piège n'est jamais révélé avant coup). Le choix parmi
 * plusieurs formulations possibles pour une même pièce est déterministe (haché
 * depuis `trapMove`) : rejouer le seed sur un fichier inchangé ne fait jamais
 * flotter le texte affiché.
 */
export function defaultHintForTrapMove(trapMove: string): string {
  const pool = HINTS_BY_PIECE[pieceLabelFromSan(trapMove)] ?? GENERIC_HINTS;
  let sum = 0;
  for (let i = 0; i < trapMove.length; i++) sum += trapMove.charCodeAt(i);
  return pool[sum % pool.length];
}

/** Commentaire par défaut faute de `[Commentary]`/`[Commentaire]` pour un piège en masse — le contenu écrit à la main a toujours le sien. */
export const DEFAULT_BULK_TRAP_COMMENTARY = "Réfutation théorique de la ligne. Utilisez le mode Explorer avec Stockfish pour approfondir les variantes.";

export interface BuildBulkTrapOptions extends BuildTrapOptions {
  /**
   * Voir `LinearFallbackRefutationResolver` — active le repli « ligne
   * linéaire » (`validateLinearFallbackTrap`) pour les parties sans variation
   * RAV exploitable, en interrogeant un moteur pour `refutationMoves[0]`.
   * Omis : le repli reste désactivé, ces parties renvoient `null` — comme
   * avant l'ajout de cette fonctionnalité. Fournie par l'appelant (voir
   * `scripts/import-bulk-traps.ts`) plutôt qu'importée ici, pour que ce
   * module reste pur/synchrone par défaut — voir le docstring de fichier.
   */
  resolveLinearFallbackRefutation?: LinearFallbackRefutationResolver;
}

/**
 * Variante « import de masse » de `buildTrapFromGame` — mêmes règles de
 * légalité chess.js (chaque coup retenu doit être un coup légal depuis la
 * position atteinte), mais avec DEUX tolérances propres aux dumps PGN bruts
 * trouvés en ligne : repli sur la ligne linéaire quand aucune variation RAV
 * n'est exploitable (`validateLinearFallbackTrap`, voir
 * `resolveLinearFallbackRefutation`), et troncature au dernier coup légal
 * plutôt que rejet total quand la toute fin de partie est illisible
 * (`truncateToLegalPrefix`). Pensée pour des fichiers qui n'ont jamais nos
 * tags propriétaires et dont `[Site]`/`[Opening]` est une chaîne brute pas
 * encore scindée pour nos 2 niveaux de filtre — voir
 * `splitOpeningFamilyAndGambit`. Un tag propriétaire déjà présent dans le
 * fichier (rare mais possible) reste toujours prioritaire sur la valeur
 * calculée. Utilisée uniquement par `scripts/import-bulk-traps.ts` — jamais
 * par `db:seed-pgn`. Async (contrairement à `buildTrapFromGame`) : seul le
 * repli linéaire interroge un moteur, voir `resolveLinearFallbackRefutation`.
 */
export async function buildBulkTrapFromGame(game: RawPgnGame, options: BuildBulkTrapOptions): Promise<OpeningTrap | null> {
  const core =
    validateVariationTrap(game) ??
    (options.resolveLinearFallbackRefutation && game.variationAtPly === null
      ? await validateLinearFallbackTrap(game, options.resolveLinearFallbackRefutation)
      : null);
  if (!core) return null;
  const { setupMoves, trapMove, refutationMoves, victimSide } = core;

  const tags = game.tags;
  const name = tags.Event ?? "Piège importé";
  const { family, gambit: cleanedGambit } = splitOpeningFamilyAndGambit(tags.Site ?? tags.Opening ?? name);
  const gambit = tags.Gambit ?? tags.Variation ?? cleanedGambit;
  const eco = tags.ECO ?? "A00";
  const difficulty = (tags.Difficulty as TrapDifficulty | undefined) ?? estimateDifficultyFromRefutationLength(refutationMoves);
  const victimLabel = victimSide === "white" ? "Blancs" : "Noirs";

  const id = `${slugify(options.idPrefix)}-${slugify(name) || "piege"}-${shortHash(JSON.stringify(game))}`;

  return {
    id,
    name,
    family,
    gambit,
    eco,
    victimSide,
    difficulty,
    summary: tags.Summary ?? `Importé de ${options.idPrefix} — un coup naturel piège les ${victimLabel.toLowerCase()}.`,
    setupMoves,
    trapMove,
    trapExplanation:
      tags.TrapExplanation ?? game.variationComment ?? `${trapMove} semble naturel mais pose un problème concret pour les ${victimLabel.toLowerCase()}.`,
    hint: tags.Hint ?? defaultHintForTrapMove(trapMove),
    refutationMoves,
    outcome: tags.Outcome ?? `${refutationMoves[0]} évite le piège. ${trapMove}?? au contraire pose problème aux ${victimLabel.toLowerCase()}.`,
    comments: tags.Commentary ?? tags.Commentaire ?? DEFAULT_BULK_TRAP_COMMENTARY,
  };
}

export interface ImportedOpeningLineDraft {
  id: string;
  name: string;
  family: string;
  eco: string;
  moves: string[];
}

/** Construit une ligne d'ouverture simple depuis une partie PGN — `null` si le moindre coup de la ligne principale est illégal. */
export function buildOpeningLineFromGame(game: RawPgnGame, options: BuildTrapOptions): ImportedOpeningLineDraft | null {
  if (game.mainline.length === 0) return null;
  const chess = new Chess();
  if (!replayLegal(chess, game.mainline)) return null;

  const tags = game.tags;
  const name = tags.Event ?? "Ligne importée";
  const family = tags.Site ?? tags.Opening ?? "Ouverture importée";
  const eco = tags.ECO ?? "A00";
  const id = `${slugify(options.idPrefix)}-${slugify(name) || "ligne"}-${shortHash(JSON.stringify(game))}`;

  return { id, name, family, eco, moves: game.mainline };
}
