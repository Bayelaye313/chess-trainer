import "server-only";

/**
 * Convertit la base officielle des puzzles Lichess (`lichess_db_puzzle.csv`,
 * CC0 — https://database.lichess.org/#puzzles, potentiellement fournie en
 * `.csv.zst`) en fichiers JSON prêts pour `data/import/academy/` (voir
 * `data/import/README.md` et `academy-parser.ts` — même format
 * `AcademyJsonEntry` que les fichiers écrits à la main).
 *
 *   npm run db:convert-puzzles -- --input=data/import/academy/lichess_db_puzzle.csv.zst
 *
 * ## Streaming mémoire
 *
 * Le CSV officiel fait plusieurs Go décompressé (~6,1M lignes) — jamais
 * chargé en mémoire d'un bloc. Lu ligne à ligne, et pour le `.csv.zst`,
 * décompressé au fil de l'eau (`node:zlib`, zstd natif depuis Node 22.15+/
 * 23.8+, aucune dépendance externe).
 *
 * Piège découvert en testant le fichier réel : celui-ci contient des frames
 * zstd "skippable" (magic `0x184D2A5x`) intercalées régulièrement (probable
 * artefact de l'outil qui a servi à le télécharger/réassembler) — le
 * décompresseur de `node:zlib` s'arrête dessus (`Unknown frame descriptor`).
 * `decompressZstdTolerant` ci-dessous relance un nouveau flux juste après
 * chaque frame skippable détectée (double vérification par lecture directe
 * du fichier : magic de frame skippable PUIS magic de frame zstd réelle
 * juste après la taille annoncée, pour exclure toute collision fortuite
 * dans des données compressées) — validé de bout en bout sur le fichier
 * officiel complet (304 Mo compressés → 6 100 960 lignes).
 *
 * ## Résolution de thème
 *
 * Chaque puzzle Lichess porte plusieurs tags dans sa colonne `Themes`
 * (espace-séparés, ex. "fork endgame mateIn2"). La table tag→thème est
 * construite depuis `CURRICULUM_THEMES` (champ `lichessThemes`,
 * `core/curriculum/catalog.ts`) — source de vérité unique, jamais dupliquée
 * ici. `PRIORITY_LICHESS_TAGS` fixe l'ordre de résolution quand plusieurs
 * tags d'une ligne ont un thème associé : motifs de mat nommés d'abord (les
 * plus spécifiques), puis motifs tactiques précis, puis types de finale
 * précis, puis le repli générique `endgame`, puis (en toute dernière
 * priorité) les tags génériques qui alimentent les 3 catégories sans
 * équivalent Lichess dédié — « Positional Mastery », le cursus Jesper Hall,
 * « Sparring Positions » — un seul thème cible par puzzle, jamais
 * d'ambiguïté. Aucun tag reconnu → ligne ignorée.
 *
 * ## Position critique, jamais la gaffe qui l'a amenée
 *
 * `FEN` (colonne CSV) est la position JUSTE AVANT le coup qui a généré le
 * puzzle, et `Moves[0]` EST ce coup — convention officielle de la base
 * Lichess, documentée sur https://database.lichess.org/#puzzles. Un import
 * naïf qui garderait `FEN` tel quel et `Moves` en entier ferait démarrer le
 * puzzle côté camp qui vient de se tromper, échiquier orienté pour LUI, et
 * proposerait cette gaffe comme « le coup à trouver » — exactement le bug
 * signalé (« l'utilisateur ne doit plus jamais jouer le coup de
 * l'adversaire »). `toAcademyEntry` avance donc systématiquement d'un demi-
 * coup : la FEN écrite est celle obtenue APRÈS `Moves[0]`, et la solution
 * conservée est `Moves[1:]` — la position de départ de chaque exercice de
 * l'Académie est TOUJOURS la position critique où le solveur a le trait.
 *
 * ## Échantillonnage
 *
 * Reservoir sampling (Algorithm R, PRNG seedé pour reproductibilité) réparti
 * sur des tranches Elo de 200 points (600–2800) pour chaque thème retenu —
 * un échantillon dense et représentatif de toute la plage de difficulté,
 * pas juste les puzzles les plus faciles. Pendant le passage streaming,
 * seuls `fen`/`moves` (UCI)/`rating`/`puzzleId`/`gameUrl` sont retenus (pas
 * de chess.js par ligne, 6,1M lignes doivent rester bon marché) — la
 * conversion UCI→SAN (`uciSequenceToSan`, `core/chess/replay.ts`) et la
 * vérification de légalité n'ont lieu qu'à la fin, sur les quelques
 * milliers de lignes effectivement conservées.
 *
 * ## Filtre qualité — thèmes tactiques et motifs de mat
 *
 * Pour tout thème listé dans `QUALITY_FILTERED_THEME_IDS` (`catalog.ts` —
 * checkmate_patterns, tactical_motifs, lichess_motifs, lichess_advanced,
 * lichess_mate_themes, lichess_mate_in, à l'exception stricte de "Mat en 1")
 * une ligne dont la solution ne fait qu'un seul pli (`movesUci` = [gaffe, UN
 * SEUL coup]) est écartée AVANT même d'entrer dans le réservoir — un mat du
 * couloir jouable directement en un coup n'a aucun intérêt pédagogique. Ces
 * thèmes n'utilisent d'ailleurs pas `ThemeReservoir` (échantillon Elo
 * représentatif) mais `TopPriorityCollector` : un top-K strictement plafonné à
 * `QUALITY_FILTER_MAX_PUZZLES` (50, quel que soit `--per-theme`), qui retient
 * en priorité absolue les puzzles tagués `sacrifice`, puis à Elo décroissant —
 * mieux vaut 50 séquences exigeantes (2 à 5 coups, souvent un sacrifice) que
 * des centaines de triviales.
 *
 * ## Sortie
 *
 * Un fichier JSON par catégorie touchée, suffixé `-lichess.json`
 * (`tactical-motifs-lichess.json`, `checkmate-patterns-lichess.json`,
 * `endgame-mastery-lichess.json`...) pour ne jamais entrer en collision avec
 * les fichiers de démo écrits à la main (`positional-mastery.json`) — chacun
 * purgé/réimporté indépendamment par `scripts/seed-academy.ts` (idempotence
 * par nom de fichier déjà en place, aucun changement nécessaire là-bas).
 * Entrées triées par thème puis par Elo croissant : c'est cet ordre qui
 * pilote `orderIndex` dans `seed-academy.ts`, donc la progression
 * facile→difficile à l'intérieur d'un thème.
 */
import { closeSync, createReadStream, fstatSync, openSync, readSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import * as zlib from "node:zlib";
import type { Transform } from "node:stream";
import { Chess } from "chess.js";
import { uciSequenceToSan } from "@/core/chess/replay";
import {
  CURRICULUM_CATEGORIES,
  CURRICULUM_THEMES,
  QUALITY_FILTERED_THEME_IDS,
  QUALITY_FILTER_MAX_PUZZLES,
} from "@/core/curriculum/catalog";
import type { AcademyJsonEntry } from "@/core/curriculum/academy-parser";
import type { CurriculumCategory } from "@/server/db/schema/curriculum";

// ─────────────────────────────────────────────────────────────────────────
// Lecture ligne à ligne, tolérante aux frames zstd "skippable" mid-stream
// ─────────────────────────────────────────────────────────────────────────

const ZSTD_SKIPPABLE_MAGIC_MASK = 0xfffffff0;
const ZSTD_SKIPPABLE_MAGIC_BASE = 0x184d2a50; // 0x184D2A50..0x184D2A5F
const ZSTD_REAL_FRAME_MAGIC = [0x28, 0xb5, 0x2f, 0xfd] as const;
const READ_CHUNK = 65536;
/** Marge de recherche autour du point d'échec pour localiser la frame skippable — voir le docstring de fichier. */
const SEARCH_MARGIN = 4 * READ_CHUNK;

/**
 * `zlib.createZstdDecompress` est disponible au runtime depuis Node
 * 22.15/23.8 (voir le docstring de fichier) mais absente des typings
 * `@types/node` (`^20`, pas encore mis à jour) — accès casté, seul endroit
 * du fichier concerné.
 */
const createZstdDecompress = (zlib as unknown as { createZstdDecompress: () => Transform }).createZstdDecompress;

interface SkipFrameMatch {
  frameStart: number;
  afterSkip: number;
}

/** Scanne `[start, end)` du fichier `fd` pour une frame skippable valide — double vérification (magic skip + magic réel juste après) pour exclure toute collision fortuite. */
function findSkipFrame(fd: number, fileSize: number, start: number, end: number): SkipFrameMatch | null {
  const clampedEnd = Math.min(end, fileSize);
  const len = clampedEnd - start;
  if (len <= 0) return null;
  const buf = Buffer.alloc(len);
  readSync(fd, buf, 0, len, start);
  for (let i = 0; i + 8 <= len; i++) {
    const magic = buf.readUInt32LE(i);
    if ((magic & ZSTD_SKIPPABLE_MAGIC_MASK) !== ZSTD_SKIPPABLE_MAGIC_BASE) continue;
    const skipSize = buf.readUInt32LE(i + 4);
    const frameStart = start + i;
    const afterSkip = frameStart + 8 + skipSize;
    if (afterSkip === fileSize) return { frameStart, afterSkip };
    if (afterSkip + 4 > fileSize) continue;
    const check = Buffer.alloc(4);
    readSync(fd, check, 0, 4, afterSkip);
    if (
      check[0] === ZSTD_REAL_FRAME_MAGIC[0] &&
      check[1] === ZSTD_REAL_FRAME_MAGIC[1] &&
      check[2] === ZSTD_REAL_FRAME_MAGIC[2] &&
      check[3] === ZSTD_REAL_FRAME_MAGIC[3]
    ) {
      return { frameStart, afterSkip };
    }
  }
  return null;
}

/** Décompresse un `.csv.zst` réel de bout en bout malgré ses frames skippable mid-stream — voir le docstring de fichier. */
async function decompressZstdTolerant(path: string, onLine: (line: string) => void): Promise<void> {
  const fd = openSync(path, "r");
  const size = fstatSync(fd).size;
  let absOffset = 0;
  let leftover = "";

  try {
    while (absOffset < size) {
      const segmentStart = absOffset;
      const nextOffset: number = await new Promise((resolve, reject) => {
        const decomp = createZstdDecompress();
        let fedBytes = 0;
        let settled = false;

        decomp.on("data", (chunk: Buffer) => {
          leftover += chunk.toString("utf8");
          let idx: number;
          while ((idx = leftover.indexOf("\n")) !== -1) {
            onLine(leftover.slice(0, idx));
            leftover = leftover.slice(idx + 1);
          }
        });

        decomp.on("error", (err) => {
          if (settled) return;
          const searchStart = segmentStart;
          const searchEnd = segmentStart + fedBytes + SEARCH_MARGIN;
          const found = findSkipFrame(fd, size, searchStart, searchEnd);
          if (!found) {
            settled = true;
            reject(new Error(`Frame zstd invalide à l'offset ~${segmentStart + fedBytes} et aucune frame skippable trouvée à proximité (${err.message}).`));
            return;
          }
          settled = true;
          leftover = "";
          resolve(found.afterSkip);
        });

        decomp.on("close", () => {
          if (!settled) {
            settled = true;
            resolve(size); // fin de fichier propre
          }
        });

        function feedNext() {
          if (settled) return;
          if (segmentStart + fedBytes >= size) {
            decomp.end();
            return;
          }
          const toRead = Math.min(READ_CHUNK, size - (segmentStart + fedBytes));
          const buf = Buffer.alloc(toRead); // frais à chaque lecture : write() ne garantit pas une consommation synchrone
          const n = readSync(fd, buf, 0, toRead, segmentStart + fedBytes);
          fedBytes += n;
          const ok = decomp.write(buf.subarray(0, n));
          if (settled) return;
          if (ok) setImmediate(feedNext);
          else decomp.once("drain", feedNext);
        }
        feedNext();
      });
      absOffset = nextOffset;
    }
  } finally {
    closeSync(fd);
  }
  if (leftover.length > 0) onLine(leftover);
}

async function forEachCsvLine(path: string, onLine: (line: string) => void): Promise<void> {
  if (!path.endsWith(".zst")) {
    const readline = await import("node:readline");
    const rl = readline.createInterface({ input: createReadStream(path, { encoding: "utf8" }) });
    for await (const line of rl) onLine(line);
    return;
  }
  await decompressZstdTolerant(path, onLine);
}

// ─────────────────────────────────────────────────────────────────────────
// Colonnes (résolues par en-tête, jamais par index fixe — même parti pris
// que `convert-lichess-openings-tsv.ts`)
// ─────────────────────────────────────────────────────────────────────────

interface ColumnMap {
  puzzleId: number;
  fen: number;
  moves: number;
  rating: number;
  themes: number;
  gameUrl: number;
}

function resolveColumns(header: readonly string[]): ColumnMap | null {
  const idx = (name: string) => header.findIndex((h) => h.trim().toLowerCase() === name);
  const map: ColumnMap = {
    puzzleId: idx("puzzleid"),
    fen: idx("fen"),
    moves: idx("moves"),
    rating: idx("rating"),
    themes: idx("themes"),
    gameUrl: idx("gameurl"),
  };
  if (map.fen === -1 || map.moves === -1 || map.rating === -1 || map.themes === -1) return null;
  return map;
}

// ─────────────────────────────────────────────────────────────────────────
// Résolution de thème — priorité fixe, voir le docstring de fichier.
// ─────────────────────────────────────────────────────────────────────────

const PRIORITY_LICHESS_TAGS: readonly string[] = [
  // Motifs de mat nommés — les plus spécifiques, toujours prioritaires. Chacun
  // alimente maintenant DEUX thèmes candidats (le module curaté `cm-*` ET le
  // thème `lmt-*` en bijection stricte de `catalog.ts`) — round-robin déjà géré
  // par `ThemeResolver`, voir le docstring de fichier.
  "backRankMate",
  "bodenMate",
  "doubleBishopMate",
  "dovetailMate",
  "swallowsTailMate",
  "hookMate",
  "smotheredMate",
  "vukovicMate",
  "anastasiaMate",
  "arabianMate",
  "epauletteMate",
  "morphysMate",
  "pillsburysMate",
  "operaMate",
  "triangleMate",
  "blindSwineMate",
  "killBoxMate",
  "balestraMate",
  "cornerMate",
  // Longueurs de mat forcé (`lichess_mate_in`, catalog.ts) — juste après les
  // motifs de mat nommés (plus spécifiques), avant les motifs tactiques
  // génériques : un puzzle "mateIn2" sans motif nommé reconnu doit atterrir ici,
  // pas se perdre dans un motif tactique générique qu'il porte aussi souvent.
  "mateIn1",
  "mateIn2",
  "mateIn3",
  "mateIn4",
  "mateIn5",
  // "Roi exposé" (exposedKing) remonté ici, juste après les longueurs de mat
  // forcé et avant les motifs tactiques précis — sans ça, ce tag (très
  // fréquent en co-occurrence avec fork/pin/etc.) se faisait quasi toujours
  // intercepter par un motif tactique mieux classé avant même d'être
  // consulté, laissant "Roi exposé" quasi vide. Reste volontairement APRÈS
  // tous les motifs de mat nommés/mateInN : un puzzle qu'un mat direct peut
  // déjà revendiquer ne doit jamais lui être arraché. Voir aussi le retrait
  // d'`exposedKing` du pool générique de Positional Mastery (catalog.ts).
  "exposedKing",
  // Motifs tactiques précis.
  "fork",
  "pin",
  "skewer",
  "discoveredAttack",
  "discoveredCheck",
  "doubleCheck",
  "deflection",
  "attraction",
  "interference",
  "intermezzo",
  "collinearMove",
  "capturedDefender",
  "xRayAttack",
  "trappedPiece",
  "zugzwang",
  "quietMove",
  "underPromotion",
  "promotion",
  "enPassant",
  "clearance",
  "attackingF2F7",
  // Types de finale précis.
  "pawnEndgame",
  "rookEndgame",
  "bishopEndgame",
  "knightEndgame",
  "queenEndgame",
  "queenRookEndgame",
  // Repli générique de finale — seulement si rien de plus précis n'a matché.
  "endgame",
  // Replis génériques pour les catégories sans tag Lichess dédié
  // (« Positional Mastery », cursus Jesper Hall, « Sparring Positions ») —
  // TOUJOURS en toute dernière priorité : ces tags sont très fréquents dans
  // le CSV, ils ne doivent jamais intercepter une ligne qu'un tag plus haut
  // (mat nommé, motif tactique, finale précise) aurait pu revendiquer. Voir
  // le docstring de `catalog.ts` pour la table tag→thème de ces 3
  // catégories, et `SPARRING_MIN_RATING` ci-dessous pour le filtre Elo
  // supplémentaire qui garde « Sparring Positions » réservé au haut niveau.
  // "superGM" avant "master"/"masterVsMaster" : une partie de super-GM porte
  // quasiment toujours aussi les tags "master"/"masterVsMaster" (elle EST une
  // partie de maître) — sans cette priorité, "master" l'interceptait en
  // premier et "Partie de super-GM" restait sous-alimenté.
  "superGM",
  "master",
  "masterVsMaster",
  "crushing",
  "veryLong",
  "long",
  "sacrifice",
  "advancedPawn",
  "hangingPiece",
  "defensiveMove",
  "kingsideAttack",
  "queensideAttack",
  "castling",
  "equality",
  "middlegame",
  "advantage",
];

/** Sous ce seuil, une ligne qui ne matche « Sparring Positions » que par un tag générique (`master`, `advantage`…) est ignorée — le module vise explicitement le niveau tournoi (voir le docstring de fichier). Les tags nommés (`master`/`masterVsMaster`/`superGM`) passent déjà rarement sous ce seuil ; ce filtre couvre surtout `crushing`/`advantage`/`middlegame`, bien plus fréquents et sinon trop permissifs. */
const SPARRING_MIN_RATING = 2000;

/** Plusieurs thèmes du catalogue peuvent partager un même tag Lichess trop générique pour les distinguer (ex. les thèmes "Sparring Positions" qui se partagent "master" en round-robin, voir `SPARRING_POSITION_LICHESS_TAGS`) — toutes les cibles sont gardées, jamais une seule au hasard de l'ordre du catalogue. */
function buildTagToThemes(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const theme of CURRICULUM_THEMES) {
    for (const tag of theme.lichessThemes ?? []) {
      const list = map.get(tag) ?? [];
      list.push(theme.id);
      map.set(tag, list);
    }
  }
  return map;
}

/** Résolution de thème avec répartition round-robin quand un tag a plusieurs thèmes candidats — sans ça, le premier thème du catalogue à revendiquer un tag partagé (ex. "pawnEndgame") accapare tout le contenu et les autres restent vides. Stateful : un `Resolver` par run de conversion. */
class ThemeResolver {
  private readonly counters = new Map<string, number>();
  constructor(private readonly tagToThemes: ReadonlyMap<string, readonly string[]>) {}

  /** `tags` déjà parsé par l'appelant (réutilisé aussi pour détecter `sacrifice`, voir `main`) — jamais reparsé ici. */
  resolve(tags: ReadonlySet<string>): string | null {
    for (const tag of PRIORITY_LICHESS_TAGS) {
      if (!tags.has(tag)) continue;
      const candidates = this.tagToThemes.get(tag);
      if (!candidates || candidates.length === 0) continue;
      const next = this.counters.get(tag) ?? 0;
      this.counters.set(tag, next + 1);
      return candidates[next % candidates.length];
    }
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Reservoir sampling par tranche Elo — mémoire bornée sur 6,1M lignes.
// ─────────────────────────────────────────────────────────────────────────

/** PRNG seedé (mulberry32) — reproductible d'un run à l'autre, aucune dépendance externe. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RATING_BUCKET_MIN = 600;
const RATING_BUCKET_MAX = 2800;
const RATING_BUCKET_WIDTH = 200;
const RATING_BUCKET_COUNT = Math.ceil((RATING_BUCKET_MAX - RATING_BUCKET_MIN) / RATING_BUCKET_WIDTH);

function bucketIndexForRating(rating: number): number {
  const clamped = Math.min(Math.max(rating, RATING_BUCKET_MIN), RATING_BUCKET_MAX - 1);
  return Math.floor((clamped - RATING_BUCKET_MIN) / RATING_BUCKET_WIDTH);
}

interface Candidate {
  puzzleId: string;
  fen: string;
  movesUci: string[];
  rating: number;
  gameUrl: string;
  /** Ligne CSV taguée `sacrifice` — voir `TopPriorityCollector`, seul consommateur (filtre qualité, thèmes tactiques/motifs de mat). */
  hasSacrifice: boolean;
}

interface Bucket {
  seen: number;
  items: Candidate[];
}

/** Point commun à `ThemeReservoir` (échantillonnage représentatif par tranche Elo) et `TopPriorityCollector` (top-K qualité) — même interface, deux stratégies de rétention selon le thème (voir `main`). */
interface CandidateCollector {
  offer(candidate: Candidate): void;
  readonly seenCount: number;
  flatten(): Candidate[];
}

class ThemeReservoir implements CandidateCollector {
  private readonly buckets: Bucket[];
  constructor(
    private readonly capacityPerBucket: number,
    private readonly random: () => number,
  ) {
    this.buckets = Array.from({ length: RATING_BUCKET_COUNT }, () => ({ seen: 0, items: [] }));
  }

  offer(candidate: Candidate): void {
    const bucket = this.buckets[bucketIndexForRating(candidate.rating)];
    bucket.seen += 1;
    if (bucket.items.length < this.capacityPerBucket) {
      bucket.items.push(candidate);
      return;
    }
    const r = Math.floor(this.random() * bucket.seen);
    if (r < this.capacityPerBucket) bucket.items[r] = candidate;
  }

  get seenCount(): number {
    return this.buckets.reduce((sum, b) => sum + b.seen, 0);
  }

  flatten(): Candidate[] {
    return this.buckets.flatMap((b) => b.items).sort((a, b) => a.rating - b.rating);
  }
}

/**
 * Collecteur top-K pour les thèmes soumis au filtre qualité
 * (`QUALITY_FILTERED_THEME_IDS`, `catalog.ts`) : contrairement à
 * `ThemeReservoir` (échantillon représentatif de toute la plage Elo), ici on
 * ne veut PAS de diversité — on veut les `capacity` (50) meilleurs candidats,
 * priorité absolue aux puzzles tagués `sacrifice`, puis à l'Elo le plus élevé.
 * Les puzzles à 1 pli sont déjà écartés en amont (voir `main`) avant même
 * d'atteindre ce collecteur.
 *
 * `items` reste trié croissant par priorité (le pire candidat retenu en tête)
 * — un nouvel arrivant qui bat ce pire candidat le remplace, O(capacity log
 * capacity) par remplacement (capacity = 50, négligeable même sur des
 * millions de lignes).
 */
class TopPriorityCollector implements CandidateCollector {
  private readonly items: Candidate[] = [];
  private seen = 0;
  constructor(private readonly capacity: number) {}

  private static priority(candidate: Candidate): number {
    // Le tag `sacrifice` domine strictement l'Elo (jamais rattrapable par un Elo plus élevé sans lui) : voir le docstring de classe.
    return (candidate.hasSacrifice ? 1_000_000 : 0) + candidate.rating;
  }

  offer(candidate: Candidate): void {
    this.seen += 1;
    if (this.items.length < this.capacity) {
      this.items.push(candidate);
      this.items.sort((a, b) => TopPriorityCollector.priority(a) - TopPriorityCollector.priority(b));
      return;
    }
    if (TopPriorityCollector.priority(candidate) > TopPriorityCollector.priority(this.items[0])) {
      this.items[0] = candidate;
      this.items.sort((a, b) => TopPriorityCollector.priority(a) - TopPriorityCollector.priority(b));
    }
  }

  get seenCount(): number {
    return this.seen;
  }

  flatten(): Candidate[] {
    return [...this.items].sort((a, b) => a.rating - b.rating);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Conversion finale (UCI → SAN, légalité) — uniquement sur l'échantillon retenu.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `candidate.fen` est la position JUSTE AVANT le coup qui a généré le puzzle
 * (convention officielle du CSV Lichess) — `candidate.movesUci[0]` est CE
 * coup, celui qui vient d'être blousé par le camp au trait sur `fen`, JAMAIS
 * une part de la solution. Le vrai point de départ jouable — celui où
 * l'utilisateur doit trouver LE coup gagnant, jamais rejouer la gaffe
 * adverse — est la position obtenue APRÈS ce premier coup, d'où on rejoue
 * `movesUci.slice(1)`. Sans cette avance, le puzzle démarrerait côté
 * bourreau plutôt que côté solveur : l'échiquier s'orienterait pour le
 * mauvais camp (`boardOrientation` dérive du trait sur `fen`, voir
 * `use-puzzle-solver.ts`) et le premier coup « à trouver » serait justement
 * la gaffe qu'on est censé punir.
 */
function toAcademyEntry(candidate: Candidate, themeId: string): AcademyJsonEntry | null {
  try {
    const chess = new Chess(candidate.fen); // légalité de la position elle-même
    const setupUci = candidate.movesUci[0];
    const solutionUci = candidate.movesUci.slice(1);
    if (!setupUci || solutionUci.length === 0) return null;
    chess.move({ from: setupUci.slice(0, 2), to: setupUci.slice(2, 4), promotion: setupUci.slice(4, 5) || undefined });
    const criticalFen = chess.fen();
    const moves = uciSequenceToSan(criticalFen, solutionUci);
    return {
      themeId,
      fen: criticalFen,
      moves,
      sourceRef: `Lichess #${candidate.puzzleId} · Elo ${candidate.rating}${candidate.hasSacrifice ? " · Sacrifice" : ""}${candidate.gameUrl ? ` · ${candidate.gameUrl}` : ""}`,
      // Métadonnées de tri pour le filtre qualité de `scripts/seed-academy.ts`
      // (voir `AcademyJsonEntry.rating`/`sacrifice`) — jamais consommées par
      // le solveur, seulement par le plafond/priorité par thème.
      rating: candidate.rating,
      sacrifice: candidate.hasSacrifice,
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────────────────

interface Options {
  input: string;
  output: string;
  perTheme: number;
  seed: number;
  help?: boolean;
}

function parseArgs(argv: string[]): Options {
  const options: Options = { input: "", output: "data/import/academy", perTheme: 250, seed: 42 };
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg.startsWith("--input=")) options.input = arg.slice("--input=".length);
    else if (arg.startsWith("--output=")) options.output = arg.slice("--output=".length);
    else if (arg.startsWith("--per-theme=")) options.perTheme = Number(arg.slice("--per-theme=".length));
    else if (arg.startsWith("--seed=")) options.seed = Number(arg.slice("--seed=".length));
  }
  return options;
}

function categoryOutputFile(categoryId: CurriculumCategory): string {
  return `${categoryId.replace(/_/g, "-")}-lichess.json`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help || !options.input) {
    console.log(
      [
        "Usage: npm run db:convert-puzzles -- --input=<lichess_db_puzzle.csv[.zst]> [options]",
        "",
        "  --output=<dossier>   Dossier de sortie (défaut: data/import/academy)",
        "  --per-theme=<n>      Nombre maximum de puzzles retenus par thème (défaut: 250)",
        "  --seed=<n>           Graine du tirage aléatoire, pour un résultat reproductible (défaut: 42)",
        "",
        "Convertit la base officielle des puzzles Lichess (CC0) en JSON pour data/import/academy/.",
        "Puis lancez : npm run db:seed-academy pour les importer réellement en base.",
      ].join("\n"),
    );
    return;
  }

  const started = Date.now();
  const resolver = new ThemeResolver(buildTagToThemes());
  const themeById = new Map(CURRICULUM_THEMES.map((t) => [t.id, t]));
  const capacityPerBucket = Math.max(1, Math.ceil(options.perTheme / RATING_BUCKET_COUNT));
  const random = mulberry32(options.seed);

  const reservoirs = new Map<string, CandidateCollector>();
  let totalRows = 0;
  let unmatchedRows = 0;
  let trivialSkipped = 0;
  let columns: ColumnMap | null = null;
  let headerSeen = false;

  await forEachCsvLine(options.input, (line) => {
    if (!headerSeen) {
      headerSeen = true;
      columns = resolveColumns(line.split(","));
      if (!columns) throw new Error(`Colonnes attendues introuvables dans l'en-tête : "${line}"`);
      return;
    }
    if (!line) return;
    totalRows += 1;
    const cols = line.split(",");
    const themesField = cols[columns!.themes] ?? "";
    const tags = new Set(themesField.split(" ").filter(Boolean));
    const themeId = resolver.resolve(tags);
    if (!themeId) {
      unmatchedRows += 1;
      return;
    }
    const rating = Number(cols[columns!.rating]);
    const fen = cols[columns!.fen];
    const movesUci = (cols[columns!.moves] ?? "").split(" ").filter(Boolean);
    if (!fen || movesUci.length === 0 || !Number.isFinite(rating)) {
      unmatchedRows += 1;
      return;
    }
    // « Sparring Positions » vise le niveau tournoi (voir `SPARRING_MIN_RATING`) — une ligne qui n'a résolu à ce
    // module QUE via un tag générique reste ignorée sous ce seuil, plutôt que d'y déverser du contenu débutant.
    if (themeById.get(themeId)?.category === "sparring_positions" && rating < SPARRING_MIN_RATING) {
      unmatchedRows += 1;
      return;
    }
    // Filtre qualité (`QUALITY_FILTERED_THEME_IDS`, catalog.ts) : pour un thème
    // tactique/motif de mat (hors "Mat en 1", exclu de cet ensemble), un
    // puzzle à une seule réplique (`movesUci` = [gaffe, UN SEUL coup de
    // solution]) est trop trivial pour mériter sa place — voir le docstring
    // de fichier de `catalog.ts`.
    if (QUALITY_FILTERED_THEME_IDS.has(themeId) && movesUci.length <= 2) {
      trivialSkipped += 1;
      return;
    }
    let reservoir = reservoirs.get(themeId);
    if (!reservoir) {
      reservoir = QUALITY_FILTERED_THEME_IDS.has(themeId)
        ? new TopPriorityCollector(QUALITY_FILTER_MAX_PUZZLES)
        : new ThemeReservoir(capacityPerBucket, random);
      reservoirs.set(themeId, reservoir);
    }
    reservoir.offer({
      puzzleId: cols[columns!.puzzleId] ?? "",
      fen,
      movesUci,
      rating,
      gameUrl: columns!.gameUrl !== -1 ? (cols[columns!.gameUrl] ?? "") : "",
      hasSacrifice: tags.has("sacrifice"),
    });
  });

  // Conversion finale + regroupement par catégorie.
  const entriesByCategory = new Map<CurriculumCategory, AcademyJsonEntry[]>();
  const statsByTheme: { themeId: string; title: string; candidates: number; kept: number; illegal: number }[] = [];

  for (const [themeId, reservoir] of reservoirs) {
    const theme = themeById.get(themeId);
    if (!theme) continue;
    // Plafond strict à 50 pour les thèmes filtrés qualité, quel que soit `--per-theme` (voir le docstring de fichier de `catalog.ts`) — `TopPriorityCollector` ne dépasse de toute façon jamais sa capacité, ce `slice` est une garde explicite.
    const cap = QUALITY_FILTERED_THEME_IDS.has(themeId) ? QUALITY_FILTER_MAX_PUZZLES : options.perTheme;
    const sample = reservoir.flatten().slice(0, cap);
    let illegal = 0;
    const entries: AcademyJsonEntry[] = [];
    for (const candidate of sample) {
      const entry = toAcademyEntry(candidate, themeId);
      if (entry) entries.push(entry);
      else illegal += 1;
    }
    statsByTheme.push({ themeId, title: theme.title, candidates: reservoir.seenCount, kept: entries.length, illegal });
    const list = entriesByCategory.get(theme.category) ?? [];
    list.push(...entries);
    entriesByCategory.set(theme.category, list);
  }

  await mkdir(options.output, { recursive: true });
  const categoryLabel = new Map(CURRICULUM_CATEGORIES.map((c) => [c.id, c.label]));
  let totalWritten = 0;
  for (const [categoryId, entries] of entriesByCategory) {
    entries.sort((a, b) => (a.themeId ?? "").localeCompare(b.themeId ?? ""));
    const outPath = join(options.output, categoryOutputFile(categoryId));
    await writeFile(outPath, JSON.stringify(entries, null, 2) + "\n", "utf8");
    console.log(`  ${basename(outPath)} — ${entries.length} puzzle(s) (${categoryLabel.get(categoryId) ?? categoryId})`);
    totalWritten += entries.length;
  }

  console.log("\nPar thème :");
  for (const s of statsByTheme.sort((a, b) => b.candidates - a.candidates)) {
    console.log(`  ${s.themeId.padEnd(45)} ${s.title.padEnd(45)} candidats=${s.candidates} retenus=${s.kept}${s.illegal > 0 ? ` illégaux=${s.illegal}` : ""}`);
  }

  console.log(
    `\n${totalRows} ligne(s) lues, ${unmatchedRows} sans thème reconnu, ${trivialSkipped} trop triviales (1 pli, filtre qualité), ${totalWritten} puzzle(s) écrit(s) dans ${entriesByCategory.size} fichier(s).`,
  );
  console.log(`Terminé en ${((Date.now() - started) / 1000).toFixed(1)} s. Lancez maintenant : npm run db:seed-academy`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
    .then(() => process.exit(0))
    .catch((cause) => {
      console.error(cause);
      process.exit(1);
    });
}
