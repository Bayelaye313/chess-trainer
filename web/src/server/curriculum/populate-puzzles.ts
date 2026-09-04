import "server-only";

/**
 * Alimentation de l'onglet « Apprendre » : purge la table `curriculum_puzzles`,
 * puis y réinjecte, thème par thème, l'unique exercice réel et vérifié de
 * `core/curriculum/master-puzzles-dataset.ts` — 100% statique, 100% hors-ligne.
 *
 * ## Pourquoi ce script a de nouveau changé
 *
 * Les deux versions précédentes de ce fichier faisaient tourner un pipeline
 * DYNAMIQUE : router un thème vers un corpus (`select-theme-puzzles.ts`), puis
 * compléter sous la cible en MUTANT cosmétiquement une poignée de structures
 * maîtresses (`generate-theme-puzzles.ts` + `core/chess/mutate-position.ts`) —
 * un générateur de clones par rotation géométrique, qu'on nous a demandé
 * d'éliminer DÉFINITIVEMENT. Ce pipeline dépendait aussi d'un script invoqué
 * via `tsx`/`npx` (`populate:puzzles`) : sur ce poste, l'antivirus (WithSecure)
 * bloque l'exécution de fichiers depuis le dossier temporaire que `npx`
 * utilise (« Erreur 5 : Accès refusé »), rendant CE point d'entrée précis
 * intermittent — une raison de plus de ne plus rien y faire dépendre d'un
 * pipeline élaboré au moment de l'exécution.
 *
 * Ici, il n'y a plus de pipeline du tout : `MASTER_PUZZLES_DATASET` porte déjà
 * la position ET la solution de chaque thème, écrites et vérifiées une fois
 * pour toutes (voir son propre docstring, et son test — FEN légale, solution
 * intégralement rejouable, aucune FEN dupliquée). Ce script ne fait plus que
 * projeter ce tableau dans `curriculum_puzzles`, une ligne par thème.
 *
 * ## Ce que ça garantit, et ce que ça ne garantit plus
 *
 * Garanti : chaque thème reçoit EXACTEMENT un exercice, réel et vérifié —
 * jamais une position hors-sujet, jamais deux thèmes qui partagent la même
 * FEN. Ce que ça ne garantit plus (changement de doctrine assumé, écrit noir
 * sur blanc dans `master-puzzles-dataset.ts`) : `totalPuzzles` n'affiche plus
 * 15 à 30 comme la rotation le permettait autrefois — un seul exercice bien
 * choisi vaut mieux que trente variations de la même position. Étendre un
 * thème à plusieurs exercices est une extension future du DATASET, jamais un
 * retour à la mutation géométrique.
 *
 * Usage :
 *   npm run populate:puzzles
 *   npm run populate:puzzles -- --themes=cm-mat-du-couloir,tm-la-fourchette
 *   npm run populate:puzzles -- --dry-run
 */
import { pathToFileURL } from "node:url";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/server/db";
import {
  curriculumPuzzles,
  curriculumThemes,
  userThemeProgress,
  type NewCurriculumPuzzle,
} from "@/server/db/schema";
import { CURRICULUM_THEMES } from "@/core/curriculum/catalog";
import { ensureCurriculumSeeded } from "@/server/queries/curriculum";
import { MASTER_PUZZLES_DATASET, type MasterPuzzle } from "@/core/curriculum/master-puzzles-dataset";

export interface PopulateThemeResult {
  themeId: string;
  target: number;
  inserted: number;
  totalPuzzles: number;
  error?: string;
}

export interface PopulateOptions {
  themeIds?: string[];
  dryRun?: boolean;
}

const DATASET_BY_THEME = new Map<string, MasterPuzzle>(MASTER_PUZZLES_DATASET.map((p) => [p.themeId, p]));

/**
 * Les 6 catégories `lichess_*` (`catalog.ts`, « Saturation Lichess ») sont des
 * réservoirs purs — bijection stricte titre ↔ tag Lichess exact, jamais de
 * position composée à la main dans `MASTER_PUZZLES_DATASET` (voir son
 * docstring). Une absence de ce dataset y est donc attendue, pas une erreur :
 * ces thèmes affichent honnêtement 0/N tant que `db:convert-puzzles`/
 * `db:seed-academy` (ou `refine-tactics-pgn`) n'a pas tourné.
 */
const LICHESS_TAG_CATEGORIES = new Set([
  "lichess_motifs",
  "lichess_advanced",
  "lichess_mate_in",
  "lichess_mate_themes",
  "lichess_special_moves",
  "lichess_goals_origin",
]);

function buildRow(theme: (typeof CURRICULUM_THEMES)[number], puzzle: MasterPuzzle): NewCurriculumPuzzle {
  return {
    id: `${theme.id}::master:0`,
    themeId: theme.id,
    orderIndex: 0,
    fen: puzzle.fen,
    solution: [...puzzle.solution],
    solutionSan: [...puzzle.solutionSan],
    sourceRef: `${puzzle.sourceRef} (${puzzle.rating} Elo estimé)`,
  };
}

/**
 * Alimente les thèmes demandés — par défaut les 141 du catalogue. Suppose que
 * `ensureCurriculumSeeded()` a déjà tourné (voir `main()`) : `curriculum_themes`
 * doit exister avant l'insertion, sans quoi la clé étrangère de
 * `curriculum_puzzles` échoue.
 *
 * Sur une exécution COMPLÈTE (pas de `--themes=`), purge d'abord toute la
 * table et remet `user_theme_progress` à zéro : la collection étant
 * entièrement renouvelée, un `completedCount` hérité désignerait un exercice
 * que l'utilisateur n'a jamais vu (`completedCount` EST l'index du prochain
 * puzzle à servir — voir le docstring de `userThemeProgress`). Une exécution
 * scopée (`--themes=`) ne purge et ne remet à zéro que les thèmes visés.
 */
export async function populateThemes(options: PopulateOptions = {}): Promise<PopulateThemeResult[]> {
  const dryRun = options.dryRun ?? false;
  const fullRun = !options.themeIds;
  const targetIds = new Set(options.themeIds ?? CURRICULUM_THEMES.map((theme) => theme.id));

  if (!dryRun) {
    if (fullRun) {
      await db.delete(curriculumPuzzles);
      await db.update(userThemeProgress).set({ completedCount: 0, completedAt: null, updatedAt: new Date() });
    } else {
      const ids = [...targetIds];
      await db.delete(curriculumPuzzles).where(inArray(curriculumPuzzles.themeId, ids));
      await db
        .update(userThemeProgress)
        .set({ completedCount: 0, completedAt: null, updatedAt: new Date() })
        .where(inArray(userThemeProgress.themeId, ids));
    }
  }

  const targetThemes = CURRICULUM_THEMES.filter((theme) => targetIds.has(theme.id));
  const allRows: NewCurriculumPuzzle[] = [];
  const results: PopulateThemeResult[] = [];

  for (const theme of targetThemes) {
    const puzzle = DATASET_BY_THEME.get(theme.id);
    if (!puzzle) {
      if (LICHESS_TAG_CATEGORIES.has(theme.category)) {
        // Attendu — voir le docstring de `LICHESS_TAG_CATEGORIES` : ce n'est
        // jamais une erreur, juste un réservoir pas encore importé.
        results.push({ themeId: theme.id, target: theme.totalPuzzles, inserted: 0, totalPuzzles: 0 });
        continue;
      }
      // Filet de sécurité : le test de `master-puzzles-dataset.ts` garantit déjà
      // une entrée par thème CURATÉ du catalogue — ce cas ne devrait jamais
      // survenir en pratique, on préfère le rapporter plutôt que planter toute la boucle.
      results.push({ themeId: theme.id, target: theme.totalPuzzles, inserted: 0, totalPuzzles: 0, error: "aucune entrée dans MASTER_PUZZLES_DATASET" });
      continue;
    }
    const row = buildRow(theme, puzzle);
    allRows.push(row);
    results.push({ themeId: theme.id, target: theme.totalPuzzles, inserted: 1, totalPuzzles: 1 });
  }

  if (!dryRun) {
    if (allRows.length > 0) await db.insert(curriculumPuzzles).values(allRows);
    for (const result of results) {
      if (result.error) continue;
      await db.update(curriculumThemes).set({ totalPuzzles: result.totalPuzzles }).where(eq(curriculumThemes.id, result.themeId));
    }
  }

  return results;
}

function parseArgs(argv: string[]): PopulateOptions & { help?: boolean } {
  const options: PopulateOptions & { help?: boolean } = {};
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--all") continue; // déjà le comportement par défaut
    else if (arg.startsWith("--themes=")) options.themeIds = arg.slice("--themes=".length).split(",").filter(Boolean);
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(
      [
        "Usage: npm run populate:puzzles -- [options]",
        "",
        "  --all              Alimente les 141 thèmes du catalogue (comportement par défaut).",
        "  --themes=id1,id2   Limite la (re)génération à ces thèmes.",
        "  --dry-run          Calcule et affiche la répartition sans rien écrire en base.",
        "",
        "100% statique et hors-ligne : lit src/core/curriculum/master-puzzles-dataset.ts,",
        "aucun fichier à déposer, aucun appel réseau, aucune mutation géométrique.",
      ].join("\n"),
    );
    return;
  }

  await ensureCurriculumSeeded();

  const started = Date.now();
  const results = await populateThemes(options);

  let totalInserted = 0;
  let failures = 0;

  for (const result of results) {
    if (result.error) {
      failures += 1;
      console.error(`✗ ${result.themeId} — ${result.error}`);
      continue;
    }
    totalInserted += result.inserted;
    console.log(`✓ ${result.themeId} — ${result.inserted} exercice(s)`);
  }

  const elapsedMs = Date.now() - started;
  console.log(`\n${totalInserted} puzzle(s) générés sur ${results.length} thème(s). (${elapsedMs} ms)`);

  if (failures > 0) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
    .then(() => process.exit(0))
    .catch((cause) => {
      console.error(cause);
      process.exit(1);
    });
}
