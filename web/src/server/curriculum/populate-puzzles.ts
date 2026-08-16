import "server-only";

/**
 * Script d'alimentation ponctuel de l'onglet « Apprendre » : convertit une
 * banque de puzzles LOCALE (`LOCAL_PUZZLE_BANK` ci-dessous) en lignes
 * `curriculum_puzzles`, raccordées au bon thème du catalogue
 * (`core/curriculum/catalog.ts`).
 *
 * Générateur d'Académie 100% hors-ligne — aucun `fetch` réseau.
 *
 * Historique : ce script appelait jusqu'ici l'API publique Lichess
 * (`server/puzzle-bank/lichess-puzzle-api.ts`) à chaque puzzle demandé. Sur le
 * réseau local de développement, ce `fetch` échoue systématiquement
 * (`fetch failed` — proxy/pare-feu bloquant les requêtes sortantes), rendant
 * le script inutilisable et l'onglet « Apprendre » vide en permanence. Il ne
 * dépend donc plus JAMAIS du réseau : `LOCAL_PUZZLE_BANK`
 * (`local-puzzle-bank.ts`) contient, pour chaque tag couvert par
 * `THEME_TAG_MAP`, une ou plusieurs positions réelles et valides (FEN + suite
 * de coups), composées et vérifiées coup par coup avec `chess.js` (position
 * légale, chaque coup légal dans l'enchaînement, mat effectif quand le thème
 * l'exige). Quand un thème demande plus de puzzles que la banque n'en fournit
 * nativement pour son tag, le générateur de volume RECYCLE ces positions en
 * déclinaisons numérotées (id, orderIndex et Elo affiché varient) jusqu'à
 * atteindre la limite demandée — mais ne rejoue plus jamais littéralement la
 * même FEN : `resolveLocalPuzzle` fait défiler les positions distinctes de la
 * banque puis, une fois toutes vues, leurs 4 variantes géométriques
 * (`core/chess/geometric-variants.ts` — miroir gauche/droite, inversion des
 * couleurs, les deux) avant de répéter une combinaison déjà servie. Les 105
 * thèmes en repli (voir plus bas) puisent en plus dans `FALLBACK_PUZZLE_BANK`,
 * 6 positions radicalement différentes dédiées au repli — avant son ajout,
 * ils tiraient tous sur la même unique position "pin"/"sacrifice" de
 * `LOCAL_PUZZLE_BANK`, clonée 30 fois par thème : la cause principale du
 * "même puzzle partout" observé en pratique.
 *
 * Couverture : les thèmes des catégories `checkmate_patterns` et
 * `tactical_motifs` ont un équivalent direct dans `THEME_TAG_MAP` (voir ce
 * fichier pour le détail thème -> tag) — leur `sourceRef` reste "Banque
 * locale hors-ligne — ...".
 *
 * Pour les 105 thèmes restants (modules du cours Jesper Hall, thèmes
 * « Positional Mastery » de Lavinia Valcu, positions de sparring 2026), la
 * banque locale n'a par construction aucune position qui illustre vraiment
 * la notion stratégique visée (pas de tag "avant-poste du cavalier" ou
 * "structure Carlsbad" dans `LOCAL_PUZZLE_BANK`, qui ne couvre que mats et
 * motifs tactiques). Plutôt que laisser ces thèmes à 0/N à l'écran,
 * `FALLBACK_TAG_BY_CATEGORY` leur assigne un tag existant de la banque en
 * repli (clouage pour la stratégie, sacrifice pour le sparring) — un exercice
 * générique plutôt qu'un thème vide, avec un `sourceRef` qui l'annonce
 * clairement ("Étude - ..." / "Scénario - ...") plutôt que de prétendre à une
 * correspondance exacte avec la notion du thème. Voir `populateTheme` pour
 * le détail.
 *
 * Idempotent, avec purge : l'identifiant de chaque ligne insérée est
 * `${themeId}-local-${index}` (`index` 0-based, déterminé uniquement par la
 * limite demandée, jamais par ce qui existe déjà en base). Avant d'insérer,
 * `populateTheme` supprime (`DELETE ... WHERE id LIKE '${themeId}-local-%'`)
 * toutes les lignes locales déjà en base pour ce thème — nécessaire depuis
 * l'introduction de `resolveLocalPuzzle` : un id inchangé peut désormais
 * pointer vers une FEN différente d'une exécution à l'autre (nouvelle
 * variante géométrique, nouvelle position de repli), et `onConflictDoNothing`
 * aurait sinon gardé l'ancien contenu cloné au lieu de le remplacer par la
 * collection diversifiée. Cette purge ne touche que les lignes `-local-` de
 * ce thème (jamais les lignes `demo-*` de `server/db/seed/curriculum-puzzles.ts`
 * ni celles d'un autre thème). `total_puzzles` est recalculé après coup sur
 * un vrai `count()`, jamais incrémenté à la main.
 *
 * Usage — `npm run populate:puzzles -- --help` liste les thèmes couverts :
 *   npm run populate:puzzles
 *   npm run populate:puzzles -- --themes=cm-mat-du-couloir,tm-la-fourchette
 *   npm run populate:puzzles -- --all --limit=30
 *   npm run populate:puzzles -- --limit=10 --dry-run
 *
 * `--conditions=react-server` (déjà dans le script npm) fait résoudre les
 * `import "server-only"` de ce fichier et de ses dépendances (`server/db`)
 * vers leur variante no-op au lieu de lever une erreur — c'est le mécanisme
 * prévu par le paquet lui-même (`exports["."]["react-server"]` dans son
 * `package.json`), pas un contournement maison ; appeler `npx tsx`
 * directement sans ce flag échoue.
 */
import { pathToFileURL } from "node:url";
import { count, eq, like } from "drizzle-orm";
import { db } from "@/server/db";
import { curriculumPuzzles, curriculumThemes, type NewCurriculumPuzzle } from "@/server/db/schema";
import type { CurriculumLevel } from "@/server/db/schema/curriculum";
import { CURRICULUM_THEMES, type CurriculumThemeSeed } from "@/core/curriculum/catalog";
import { uciSequenceToSan } from "@/core/chess/replay";
import { ensureCurriculumSeeded } from "@/server/queries/curriculum";
import {
  cycleLength,
  FALLBACK_PUZZLE_BANK,
  LOCAL_PUZZLE_BANK,
  resolveLocalPuzzle,
} from "@/server/curriculum/local-puzzle-bank";

/**
 * Thème du catalogue (`CurriculumThemeSeed.id`) -> tag de motif (clé de
 * `LOCAL_PUZZLE_BANK` ci-dessous, nommée comme les tags Lichess par habitude
 * — https://lichess.org/api#tag/Puzzles — mais qui ne sert plus qu'à indexer
 * la banque locale, plus aucun appel réseau ne les utilise). Un tag peut
 * couvrir plusieurs thèmes du catalogue (ex: "clouage absolu" et "clouage
 * relatif" pointent tous deux vers `pin`) — sans conséquence, chaque thème
 * garde ses propres lignes `curriculum_puzzles`, seule la source de tirage
 * est partagée.
 */
export const THEME_TAG_MAP: Record<string, string> = {
  // --- Checkmate Patterns ---
  "cm-mat-du-couloir": "backRankMate",
  "cm-mat-d-anastasia": "anastasiaMate",
  "cm-mat-arabe": "arabianMate",
  "cm-mat-de-boden": "bodenMate",
  "cm-mat-etouffe": "smotheredMate",
  "cm-mat-du-crochet": "hookMate",
  "cm-mat-de-vukovic": "vukovicMate",
  "cm-mat-de-la-queue-d-aronde": "dovetailMate",
  "cm-mat-des-deux-fous": "doubleBishopMate",

  // --- Tactical Motifs ---
  "tm-la-fourchette": "fork",
  "tm-le-clouage-absolu": "pin",
  "tm-le-clouage-relatif": "pin",
  "tm-l-enfilade": "skewer",
  "tm-l-attaque-a-la-decouverte": "discoveredAttack",
  "tm-l-echec-a-la-decouverte": "discoveredAttack",
  "tm-l-echec-double": "doubleCheck",
  "tm-la-deviation": "deflection",
  "tm-l-attraction": "attraction",
  "tm-l-attraction-sur-case-fatale": "attraction",
  "tm-l-interference": "interference",
  "tm-la-surcharge": "overloading",
  "tm-l-intermezzo-zwischenzug": "intermezzo",
  "tm-le-coup-intercalaire": "intermezzo",
  "tm-le-coup-collineen": "xRayAttack",
  "tm-l-attaque-a-rayons-x": "xRayAttack",
  "tm-l-elimination-du-defenseur": "capturingDefender",
  "tm-le-sacrifice-de-degagement": "clearance",
  "tm-la-liberation-de-case": "clearance",
  "tm-la-piece-piegee": "trappedPiece",
  "tm-le-zugzwang-tactique": "zugzwang",
  "tm-la-sous-promotion": "underPromotion",
  "tm-la-prise-en-passant-tactique": "enPassant",
  "tm-le-sacrifice-grec": "sacrifice",
  "tm-le-sacrifice-de-qualite": "sacrifice",
  "tm-le-sacrifice-positionnel": "sacrifice",
  "tm-le-sacrifice-de-dame": "sacrifice",
};

/**
 * Repli pour les thèmes absents de `THEME_TAG_MAP` (les 105 thèmes des
 * catégories `positional_mastery`, `jesper_hall_course` et
 * `sparring_positions` — voir docstring de fichier). Un tag de
 * `LOCAL_PUZZLE_BANK` par catégorie, choisi pour son esprit plutôt que pour
 * une correspondance exacte avec la notion enseignée (aucune position de la
 * banque n'illustre vraiment "l'avant-poste du cavalier" ou "la structure
 * Carlsbad") : `pin` (un motif de contrainte/blocage, le plus proche en
 * esprit d'une idée positionnelle) pour la stratégie, `sacrifice` (motif le
 * plus "partie jouée" de la banque) pour les scénarios de sparring 2026.
 * `DEFAULT_FALLBACK_TAG` couvre toute catégorie future non listée ici.
 */
export const FALLBACK_TAG_BY_CATEGORY: Record<string, string> = {
  positional_mastery: "pin",
  jesper_hall_course: "pin",
  sparring_positions: "sacrifice",
};
const DEFAULT_FALLBACK_TAG = "pin";

// `LocalPuzzleSeed`, `LOCAL_PUZZLE_BANK` et `FALLBACK_PUZZLE_BANK` vivent
// désormais dans `local-puzzle-bank.ts` (import ci-dessus) — extraites pour
// rester testables sans `@/server/db` (voir `local-puzzle-bank.test.ts` pour
// la vérification chess.js de chaque position, native comme géométriquement
// mutée).

/** Nombre de puzzles visés par thème à chaque exécution — la fourchette demandée (5 à 10), un choix raisonnable au milieu. */
const DEFAULT_LIMIT = 8;

/** Décalage d'Elo affiché selon le niveau du thème — la banque locale n'a qu'une poignée de positions par tag, ce décalage évite d'afficher le même Elo "intermédiaire" pour un thème beginner et un thème advanced. */
const LEVEL_RATING_OFFSET: Record<CurriculumLevel, number> = {
  beginner: -300,
  intermediate: 0,
  advanced: 300,
};

export interface PopulateThemeResult {
  themeId: string;
  tag: string;
  inserted: number;
  totalPuzzles: number;
  skippedDuplicates: number;
  usedFallback: boolean;
  error?: string;
}

/**
 * Construit le `sourceRef` d'une ligne : les thèmes couverts nativement par
 * `THEME_TAG_MAP` gardent le libellé "Banque locale hors-ligne" historique ;
 * les thèmes en repli (`isFallback`) reçoivent un libellé qui nomme la
 * catégorie/l'auteur plutôt qu'un tag générique — "Étude - ..." pour les
 * cours (Lavinia Valcu / Jesper Hall), "Scénario - ..." pour le sparring
 * 2026 — afin que l'écran ne prétende jamais à une correspondance exacte
 * avec le tag tactique réellement tiré (voir docstring de fichier).
 */
function buildSourceRef(
  catalogEntry: CurriculumThemeSeed,
  isFallback: boolean,
  index: number,
  rating: number,
): string {
  const suffix = `(déclinaison ${index + 1}, ≈${rating} Elo)`;
  if (!isFallback) {
    return `Banque locale hors-ligne — ${catalogEntry.title} ${suffix}`;
  }
  switch (catalogEntry.category) {
    case "positional_mastery":
      return `Étude - Positional Mastery — ${catalogEntry.title} ${suffix}`;
    case "jesper_hall_course":
      return `Étude - Cours du MI Jesper Hall — ${catalogEntry.title} ${suffix}`;
    case "sparring_positions":
      return `Scénario - ${catalogEntry.title} ${suffix}`;
    default:
      return `Banque locale hors-ligne — ${catalogEntry.title} ${suffix}`;
  }
}

/**
 * Alimente un seul thème depuis la banque locale (`local-puzzle-bank.ts`) :
 * aucune requête réseau, aucun tirage aléatoire. Les thèmes natifs
 * (`THEME_TAG_MAP`) tirent sur `LOCAL_PUZZLE_BANK[tag]` ; les thèmes en repli
 * (voir `FALLBACK_TAG_BY_CATEGORY`) tirent sur `FALLBACK_PUZZLE_BANK` — une
 * banque dédiée de 6 positions radicalement différentes, plutôt que la seule
 * position "pin"/"sacrifice" partagée par les 105 thèmes en repli. Dans les
 * deux cas, `resolveLocalPuzzle` fait défiler les positions distinctes de la
 * banque puis leurs 4 variantes géométriques avant de répéter une
 * combinaison déjà servie (voir le docstring de fichier) — jusqu'à atteindre
 * `limit`, chaque déclinaison recevant un id déterministe
 * `${themeId}-local-${index}` et un Elo affiché légèrement différent.
 * Purge d'abord les lignes locales déjà en base pour ce thème (voir le
 * docstring de fichier — "Idempotent, avec purge") puis republie
 * `total_puzzles` sur le vrai `count()` en base, jamais incrémenté à la main.
 */
export async function populateTheme(
  themeId: string,
  options: { limit?: number; dryRun?: boolean } = {},
): Promise<PopulateThemeResult> {
  const limit = options.limit ?? DEFAULT_LIMIT;
  const dryRun = options.dryRun ?? false;

  const catalogEntry = CURRICULUM_THEMES.find((theme) => theme.id === themeId);
  if (!catalogEntry) {
    return { themeId, tag: "", inserted: 0, totalPuzzles: 0, skippedDuplicates: 0, usedFallback: false, error: "Thème absent du catalogue (core/curriculum/catalog.ts)." };
  }

  const nativeTag = THEME_TAG_MAP[themeId];
  const usedFallback = !nativeTag;
  const tag = nativeTag ?? FALLBACK_TAG_BY_CATEGORY[catalogEntry.category] ?? DEFAULT_FALLBACK_TAG;

  // Les thèmes en repli puisent dans une banque dédiée (6 positions
  // radicalement différentes) plutôt que dans la position unique du tag
  // "pin"/"sacrifice" de `LOCAL_PUZZLE_BANK` — voir le docstring de fichier.
  const bank = usedFallback ? FALLBACK_PUZZLE_BANK : LOCAL_PUZZLE_BANK[tag];
  if (!bank || bank.length === 0) {
    return { themeId, tag, inserted: 0, totalPuzzles: 0, skippedDuplicates: 0, usedFallback, error: `Aucune position locale pour le tag "${tag}" (LOCAL_PUZZLE_BANK) — banque à compléter.` };
  }

  const [existingTheme] = await db.select().from(curriculumThemes).where(eq(curriculumThemes.id, themeId)).limit(1);
  if (!existingTheme) {
    return { themeId, tag, inserted: 0, totalPuzzles: 0, skippedDuplicates: 0, usedFallback, error: "Thème absent de curriculum_themes — lance ensureCurriculumSeeded() avant ce script." };
  }

  const levelOffset = LEVEL_RATING_OFFSET[existingTheme.level];
  const cycle = cycleLength(bank);
  const rows: NewCurriculumPuzzle[] = [];
  for (let index = 0; index < limit; index += 1) {
    const resolved = resolveLocalPuzzle(bank, index);
    const cloneNumber = Math.floor(index / cycle); // 0 tant qu'aucune combinaison (position, variante) n'a encore été répétée.
    const rating = Math.max(400, resolved.baseRating + levelOffset + cloneNumber * 10);
    rows.push({
      id: `${themeId}-local-${index}`,
      themeId,
      orderIndex: index,
      fen: resolved.fen,
      solution: resolved.moves,
      solutionSan: uciSequenceToSan(resolved.fen, resolved.moves),
      sourceRef: buildSourceRef(catalogEntry, usedFallback, index, rating),
    });
  }

  if (dryRun) {
    return { themeId, tag, inserted: rows.length, totalPuzzles: rows.length, skippedDuplicates: 0, usedFallback };
  }

  // Purge d'abord les lignes locales déjà en base pour ce thème : un id
  // `${themeId}-local-${index}` inchangé peut désormais correspondre à une
  // FEN différente d'une exécution à l'autre (nouvelle variante géométrique,
  // nouvelle banque de repli) — `onConflictDoNothing` aurait sinon gardé
  // l'ancienne position clonée. Motif `LIKE` plutôt qu'un `eq(themeId)` : ne
  // touche que les lignes que ce script a lui-même créées pour ce thème,
  // jamais les lignes `demo-*` du seed de démo ni celles d'un autre thème.
  await db.delete(curriculumPuzzles).where(like(curriculumPuzzles.id, `${themeId}-local-%`));

  await db.insert(curriculumPuzzles).values(rows).onConflictDoNothing();

  const [{ value: totalPuzzles }] = await db
    .select({ value: count() })
    .from(curriculumPuzzles)
    .where(eq(curriculumPuzzles.themeId, themeId));

  // C'est le vrai décompte importé qui fait foi pour l'affichage ("0/8" plutôt
  // que la cible statique du catalogue, potentiellement plus haute que ce
  // qu'on a réellement pu importer) — voir le docstring de `curriculumThemes`
  // dans `server/db/schema/curriculum.ts`.
  await db.update(curriculumThemes).set({ totalPuzzles }).where(eq(curriculumThemes.id, themeId));

  return { themeId, tag, inserted: rows.length, totalPuzzles, skippedDuplicates: 0, usedFallback };
}

export interface PopulateOptions {
  themeIds?: string[];
  limit?: number;
  dryRun?: boolean;
}

/**
 * Alimente plusieurs thèmes à la suite. Par défaut : les 141 thèmes du
 * catalogue (`CURRICULUM_THEMES`) — natifs (`THEME_TAG_MAP`) comme en repli
 * (`FALLBACK_TAG_BY_CATEGORY`), aucun ne reste hors périmètre.
 */
export async function populateThemes(options: PopulateOptions = {}): Promise<PopulateThemeResult[]> {
  const themeIds = options.themeIds ?? CURRICULUM_THEMES.map((theme) => theme.id);
  const results: PopulateThemeResult[] = [];
  for (const themeId of themeIds) {
    results.push(await populateTheme(themeId, options));
  }
  return results;
}

function parseArgs(argv: string[]): PopulateOptions & { help?: boolean } {
  const options: PopulateOptions & { help?: boolean } = {};
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--all") continue; // Déjà le comportement par défaut (les 141 thèmes du catalogue, natifs + repli) — accepté pour la commande documentée `--all --limit=30`.
    else if (arg.startsWith("--limit=")) options.limit = Number(arg.slice("--limit=".length));
    else if (arg.startsWith("--themes=")) options.themeIds = arg.slice("--themes=".length).split(",").filter(Boolean);
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(
      [
        "Usage: npx tsx src/server/curriculum/populate-puzzles.ts [options]",
        "",
        "  --all              Alimente les 141 thèmes du catalogue (comportement par défaut, accepté explicitement).",
        "  --themes=id1,id2   Limite l'alimentation à ces identifiants de thème (défaut : les 141 thèmes du catalogue).",
        `  --limit=N          Puzzles visés par thème (défaut : ${DEFAULT_LIMIT}).`,
        "  --dry-run          Génère les puzzles et affiche le résultat sans écrire en base.",
        "",
        "100% hors-ligne : aucun fetch réseau, la banque de positions est intégrée au script (local-puzzle-bank.ts).",
        "Chaque exécution purge d'abord les lignes locales déjà en base pour le thème avant de les réinsérer.",
        "",
        `${Object.keys(THEME_TAG_MAP).length} thèmes avec un tag natif (THEME_TAG_MAP) : ${Object.keys(THEME_TAG_MAP).join(", ")}`,
        "",
        `Les ${CURRICULUM_THEMES.length - Object.keys(THEME_TAG_MAP).length} thèmes restants (Positional Mastery, cours Jesper Hall, sparring 2026) reçoivent`,
        `${FALLBACK_PUZZLE_BANK.length} positions de repli dédiées (FALLBACK_PUZZLE_BANK — mats en 1, mat en 2, tactiques de gain de pièce),`,
        "avec un sourceRef \"Étude - ...\" / \"Scénario - ...\" qui l'annonce plutôt que de prétendre à une",
        "correspondance exacte avec la notion enseignée — voir le docstring de fichier.",
      ].join("\n"),
    );
    return;
  }

  // Sème le catalogue des 141 thèmes si ce script tourne avant le tout
  // premier accès à l'appli (`data/chess-trainer.db` neuf) — même garde
  // idempotente que `listCurriculumOverview`/`getThemeSession`.
  await ensureCurriculumSeeded();

  const results = await populateThemes(options);

  let totalInserted = 0;
  let fallbackCount = 0;
  for (const result of results) {
    if (result.error) {
      console.error(`✗ ${result.themeId} (${result.tag || "?"}) — ${result.error}`);
      continue;
    }
    totalInserted += result.inserted;
    if (result.usedFallback) fallbackCount += 1;
    const marker = result.usedFallback ? " [repli]" : "";
    console.log(`✓ ${result.themeId} (${result.tag}${marker}) — +${result.inserted} puzzle(s), total_puzzles=${result.totalPuzzles}`);
  }
  console.log(
    `\n${totalInserted} puzzle(s) inséré(s) au total sur ${results.length} thème(s) (dont ${fallbackCount} en repli — tag générique + sourceRef "Étude - ..." / "Scénario - ...").`,
  );
}

// N'exécute `main()` que lorsque le fichier est lancé directement (`npx tsx
// .../populate-puzzles.ts`) — pas quand il est importé pour ses exports
// (`populateTheme`/`populateThemes`) depuis une Server Action ou un test.
// `pathToFileURL` plutôt qu'une concaténation "file://" à la main : seul lui
// encode correctement un chemin Windows (`C:\...` -> `file:///C:/...`).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
    .then(() => process.exit(0))
    .catch((cause) => {
      console.error(cause);
      process.exit(1);
    });
}
