import "server-only";

/**
 * Le catalogue d'ouvertures DYNAMIQUE — lit l'intégralité des lignes
 * `imported_opening_lines` importées hors-ligne depuis lichess-org/chess-openings
 * (`data/import/openings/lichess-{a..e}.pgn`, voir `scripts/seed-from-pgn.ts` et
 * `server/db/schema/traps.ts`), ~3810 lignes réelles de théorie, jusqu'à 36
 * demi-coups de profondeur — remplace le plafond du catalogue statique
 * `core/curriculum/openings.ts` (~20 entrées, 4-6 variantes chacune) qui
 * n'exploitait jamais cette table (voir son docstring historique : « table
 * prête... PAS ENCORE branchée sur /ouvertures »).
 *
 * Deux usages distincts de ces lignes, ORTHOGONAUX :
 *
 *  1. `listOpeningFamilies` : regroupe les ~3810 lignes par FAMILLE — le
 *     texte avant le premier « : » de leur `name` (convention lichess-org :
 *     `"Famille: Variante, Sous-variante"`, ex. "Sicilian Defense: Najdorf
 *     Variation, English Attack" → famille "Sicilian Defense") — pour peupler
 *     de NOUVELLES cartes du catalogue au-delà des chapitres déjà curatés à la
 *     main. `CURATED_FAMILY_HUB` exclut les familles déjà représentées par un
 *     chapitre curaté (`core/curriculum/openings.ts`), pour ne jamais afficher
 *     deux cartes "Ruy Lopez" côte à côte.
 *
 *  2. `getEnrichedTreeForCuratedOpening` : pour un chapitre curaté donné (ex.
 *     "sicilian-najdorf"), retrouve TOUTES les lignes de la base dont les
 *     coups PROLONGENT EXACTEMENT sa ligne de référence (`opening.moves` en
 *     préfixe) et les fusionne (`mergeTrees`) dans son arbre authored — chaque
 *     chapitre curaté hérite ainsi de la profondeur RÉELLE de la base Lichess,
 *     sans jamais perdre son contenu écrit à la main (noms français, arbres
 *     `pgn` existants) : la fusion ne fait qu'AJOUTER des branches, jamais
 *     recouvrir un `comment` déjà présent (voir `mergeTrees`).
 *     `CURATED_FAMILY_HUB` permet à UN chapitre curaté d'absorber TOUTE sa
 *     famille (pas seulement les lignes qui prolongent son propre préfixe) —
 *     nécessaire quand plusieurs chapitres curatés partagent la même famille
 *     (Najdorf/Alapine/Smith-Morra sont tous les trois de la Sicilienne) :
 *     sans un hub désigné, les lignes qui ne prolongent AUCUN des trois
 *     préfixes précis (ex. "Sicilian Defense: Wing Gambit", qui dévie dès le
 *     2ᵉ coup) resteraient orphelines — ni carte à elles seules (leur famille
 *     est exclue de `listOpeningFamilies`), ni atteignables depuis un
 *     chapitre curaté. Un seul hub par famille, choisi à la main (voir la
 *     constante) : la sélection automatique (ex. "la ligne la plus courte")
 *     désignerait souvent un chapitre trop spécifique (Smith-Morra n'est pas
 *     un bon point d'entrée pour toute la Sicilienne).
 *
 * Tout ce module est synchrone (comme `server/queries/openings.ts` et
 * `server/curriculum/opening-tree-index.ts`) : le driver `better-sqlite3` de
 * Drizzle exécute chaque requête de façon synchrone (`.all()`), aucune raison
 * d'introduire de l'asynchrone ici alors que rien en amont n'en a besoin.
 * Mémoïsé à plusieurs niveaux (lignes brutes, groupes par famille, arbres
 * construits) — mêmes conventions que `variationsCache`/`treeCache` dans
 * `server/queries/openings.ts`/`server/curriculum/opening-tree-index.ts` :
 * les données importées ne changent jamais en cours de process (seul un
 * redémarrage après un nouveau `db:seed-pgn` les fait évoluer).
 */
import { like } from "drizzle-orm";
import {
  buildTreeFromLines,
  collectNodes,
  mergeTrees,
  type NamedLine,
  type VariationNode,
} from "@/core/chess/pgn-tree";
import { getOpeningTree } from "@/server/curriculum/opening-tree-index";
import { type OpeningLine, type OpeningSide } from "@/core/curriculum/openings";
import { db } from "@/server/db";
import { importedOpeningLines } from "@/server/db/schema";

/**
 * Un chapitre curaté (`core/curriculum/openings.ts`) qui sert de HUB pour
 * toute sa famille lichess-org — voir le point 2 du docstring de fichier.
 * Nom de famille EXACT (sensible à la casse), tel qu'il apparaît avant le
 * premier « : » des lignes importées — vérifié contre la base au moment de
 * l'écriture (`imported_opening_lines`, colonne `name`). Les chapitres
 * curatés absents d'ici (`sicilian-alapin`, `smith-morra-gambit`) restent
 * enrichis par simple préfixe exact (voir `getEnrichedTreeForCuratedOpening`),
 * sans absorber toute la famille "Sicilian Defense" — seul `sicilian-najdorf`
 * en est le hub désigné.
 */
const CURATED_FAMILY_HUB: Readonly<Record<string, string>> = {
  "ruy-lopez": "Ruy Lopez",
  "italian-game": "Italian Game",
  "scotch-game": "Scotch Game",
  "vienna-gambit": "Vienna Game",
  "kings-gambit": "King's Gambit",
  "sicilian-najdorf": "Sicilian Defense",
  "caro-kann": "Caro-Kann Defense",
  "french-defense": "French Defense",
  "pirc-defense": "Pirc Defense",
  "scandinavian": "Scandinavian Defense",
  "queens-gambit": "Queen's Gambit",
  "queens-gambit-declined": "Queen's Gambit Declined",
  "slav-defense": "Slav Defense",
  "kings-indian": "King's Indian Defense",
  "nimzo-indian": "Nimzo-Indian Defense",
  "london-system": "London System",
  "english-opening": "English Opening",
  "grunfeld": "Grünfeld Defense",
  "dutch-defense": "Dutch Defense",
};

interface RawLine {
  name: string;
  eco: string;
  moves: string[];
}

let rawLinesCache: RawLine[] | null = null;

/** Toutes les lignes lichess-org importées (`sourceFile` préfixé `lichess-`) — exclut `starter-openings.pgn` (25 lignes écrites à la main, déjà couvertes par le catalogue curaté). */
function loadRawLines(): RawLine[] {
  if (rawLinesCache) return rawLinesCache;
  const rows = db
    .select({ name: importedOpeningLines.name, eco: importedOpeningLines.eco, moves: importedOpeningLines.moves })
    .from(importedOpeningLines)
    .where(like(importedOpeningLines.sourceFile, "lichess-%"))
    .all();
  rawLinesCache = rows;
  return rawLinesCache;
}

/** "Sicilian Defense: Najdorf Variation, English Attack" → "Sicilian Defense". Sans « : », la ligne EST la famille (ex. "Amar Opening"). */
function familyNameOf(rowName: string): string {
  const idx = rowName.indexOf(":");
  return idx === -1 ? rowName.trim() : rowName.slice(0, idx).trim();
}

/**
 * Étiquette à poser sur le nœud terminal d'une ligne importée — le nom
 * complet MOINS le préfixe « Famille: » (pure mise en forme d'affichage, voir
 * `ChapterSelector` côté client, qui reconstruit la hiérarchie en re-scindant
 * ce libellé sur les virgules). `null` quand la ligne EST la famille
 * elle-même (rien à nommer en plus du titre déjà affiché en en-tête).
 */
function chapterLabelOf(rowName: string): string | null {
  const family = familyNameOf(rowName);
  return rowName === family ? null : rowName.slice(family.length + 1).trim();
}

function toNamedLine(row: RawLine): NamedLine {
  return { label: chapterLabelOf(row.name), eco: row.eco, sanMoves: row.moves };
}

/** Plus long préfixe commun (en coups) à toutes les lignes d'un groupe. `[]` si elles ne partagent RIEN — voir `familyRootMoves`, qui seul retombe alors sur un repli. */
function longestCommonPrefix(lines: readonly RawLine[]): string[] {
  if (lines.length === 0) return [];
  let prefix = lines[0].moves;
  for (const line of lines.slice(1)) {
    let i = 0;
    while (i < prefix.length && i < line.moves.length && prefix[i] === line.moves[i]) i += 1;
    prefix = prefix.slice(0, i);
    if (prefix.length === 0) break;
  }
  return prefix;
}

/**
 * Préfixe partagé par TOUTES les lignes d'une famille — la mise en place
 * INCIDENTE commune à ses variantes, pas forcément une position à part
 * entière (voir `familyReferenceMoves`, qui seul sert désormais de
 * `OpeningFamilySummary.rootMoves` réel : ce préfixe court n'en est qu'un
 * ingrédient interne). Un nom lichess-org qualifie une STRUCTURE/IDÉE, pas
 * forcément un ordre de coups unique (transpositions, ex. Grand Prix Attack
 * atteignable par 1.f4 c5 OU 1.e4 c5 2.f4) — le préfixe commun à TOUTES les
 * lignes d'une famille est donc parfois vide (~15% des familles en pratique,
 * ex. "Queen's Gambit Declined", "Réti Opening") : dans ce cas, la ligne la
 * plus courte du groupe sert de repli, la plus représentative de « juste la
 * famille » avant que ses variantes ne divergent.
 */
function familyRootMoves(lines: readonly RawLine[]): readonly string[] {
  const prefix = longestCommonPrefix(lines);
  if (prefix.length > 0) return prefix;
  return lines.reduce((shortest, line) => (line.moves.length < shortest.moves.length ? line : shortest)).moves;
}

/** La valeur la plus fréquente d'une liste non vide — sert à choisir UN code ECO représentatif pour une famille qui peut légitimement en couvrir plusieurs (ex. B20 à B99 pour "Sicilian Defense"). */
function mostFrequent(values: readonly string[]): string {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best = values[0];
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

/**
 * La VRAIE position de référence d'une famille, en coups — peut être PLUS
 * LONGUE que `rootMoves` (voir `familyRootMoves`) :
 *
 *  - Si une ligne du groupe porte le nom NU de la famille (sans suffixe
 *    « : … », voir `chapterLabelOf`) — ex. la ligne "Bogo-Indian Defense"
 *    elle-même, longue de 6 coups (1.d4 Nf6 2.c4 e6 3.Nf3 Bb4+), même quand
 *    le préfixe partagé entre TOUTES les variantes ne va que jusqu'à 4 coups
 *    (certaines passent par 3.g3 plutôt que 3.Nf3 avant le Bb4+ commun) —
 *    c'est lichess-org elle-même qui désigne CETTE position comme LA
 *    position de référence de la famille : elle prime toujours sur le simple
 *    préfixe commun, plus court ou non.
 *  - Sinon (aucune ligne nue, ex. "Zukertort Defense", qui n'a QUE des
 *    variantes suffixées "Kingside Variation"/"Sicilian Knight Variation") :
 *    `rootMoves` n'est qu'un préfixe partagé INCIDENT — la mise en place
 *    commune à toutes les variantes nommées, jamais elle-même cataloguée en
 *    tant que ligne à part entière (ici, le tout premier coup 1.Nf3, un coup
 *    BLANC qui n'a rien à voir avec l'idée de la famille). La VRAIE position
 *    de référence est alors `rootMoves` + UN coup de plus, celui où ses
 *    variantes se distinguent enfin les unes des autres — emprunté à la ligne
 *    la plus courte du groupe (n'importe laquelle convient : elles partagent
 *    toutes ce coup par construction du préfixe commun) — SAUF si `rootMoves`
 *    est déjà elle-même une ligne complète du groupe (repli `familyRootMoves`
 *    sans préfixe partagé, ex. familles par transposition comme "Réti
 *    Opening") : elle reste alors sa propre référence, inchangée.
 *
 * BUG CORRIGÉ, ÉTAPE 1 (retour utilisateur direct, « pas de flèches de guide
 * ni de hints » sur Zukertort et consorts) : sans cette distinction, une
 * famille « X Defense » (répertoire NOIR par construction) dont le préfixe
 * commun s'arrête par coïncidence sur un coup Blanc se voyait attribuer
 * `side: "white"` (voir `sideForFamily`, qui consommait alors `rootMoves`
 * directement) — `useOpeningDrill` demandait alors à l'utilisateur de jouer
 * les Blancs dans un chapitre pensé pour s'entraîner à DÉFENDRE en Noir.
 *
 * BUG CORRIGÉ, ÉTAPE 2 — LE VRAI BUG RESTANT (retour utilisateur direct,
 * « il y a un réel bug sur Zukertort », après l'étape 1 ci-dessus qui n'en
 * corrigeait que la moitié) : `side` utilisait déjà cette position de
 * référence ÉTENDUE pour son calcul, mais `rootMoves` — utilisé PARTOUT
 * ailleurs (`OpeningFamilySummary.rootMoves`, devenu `opening.moves`/le
 * SCRIPT INTERACTIF de la Ligne principale dans `getOpeningDetail`) — restait
 * bloqué à l'ancienne longueur COURTE, jamais étendu en conséquence. Pour
 * "Zukertort Defense" concrètement : `rootMoves = ["Nf3"]`, un seul demi-coup,
 * intégralement joué par les BLANCS ; `side` valait pourtant correctement
 * "black" — mais le script de la Ligne principale restait ce même unique
 * coup Blanc. Déroulé réel : l'IA joue Nf3 toute seule, puis la manche se
 * termine IMMÉDIATEMENT (`decideOpponentStep`, script épuisé) — le joueur,
 * censé s'entraîner à jouer les Noirs, n'a JAMAIS l'occasion de jouer le
 * moindre coup. Le protocole 2-manches masquait le symptôme en boucle
 * infinie (`playerMovesExpected` dans `learning-round.ts` empêche de
 * relancer une Manche 2 sans fin) mais le chapitre restait fonctionnellement
 * mort : Manche 1 puis Manche 2 s'enchaînaient en un clin d'œil, sans qu'un
 * seul coup n'ait jamais été proposé au joueur — exactement le « il refuse
 * mes coups sans indice » ressenti (rien à jouer, donc rien à accepter).
 *
 * `familyReferenceMoves` remplace `sideForFamily` : UNE SEULE longueur de
 * référence calculée, utilisée à la fois pour dériver `side` (parité de sa
 * longueur, même convention que `OpeningLine.side`) ET comme `rootMoves` réel
 * de la famille — impossible que les deux divergent à nouveau. Par
 * construction, le DERNIER coup de cette ligne appartient toujours à `side` :
 * l'alternance stricte des tours garantit alors que ce dernier coup retombe
 * TOUJOURS sur le tour du joueur, jamais entièrement consommé par l'IA.
 */
function familyReferenceMoves(lines: readonly RawLine[], rootMoves: readonly string[]): readonly string[] {
  const bareLine = lines.find((line) => chapterLabelOf(line.name) === null);
  if (bareLine) return bareLine.moves;

  const rootIsItsOwnLine = lines.some((line) => line.moves.length === rootMoves.length);
  if (rootIsItsOwnLine) return rootMoves;
  const shortest = lines.reduce((s, line) => (line.moves.length < s.moves.length ? line : s));
  return shortest.moves.slice(0, rootMoves.length + 1);
}

/** Le camp pour qui `referenceMoves` (voir `familyReferenceMoves`) constitue un choix d'ouverture — même convention que `OpeningLine.side` : le dernier demi-coup de la ligne désigne le camp. */
function sideForReferenceMoves(referenceMoves: readonly string[]): OpeningSide {
  return referenceMoves.length % 2 === 1 ? "white" : "black";
}

interface FamilyGroup {
  name: string;
  lines: RawLine[];
}

let familyGroupsCache: Map<string, FamilyGroup> | null = null;

function loadFamilyGroups(): Map<string, FamilyGroup> {
  if (familyGroupsCache) return familyGroupsCache;
  const groups = new Map<string, FamilyGroup>();
  for (const row of loadRawLines()) {
    const family = familyNameOf(row.name);
    let group = groups.get(family);
    if (!group) {
      group = { name: family, lines: [] };
      groups.set(family, group);
    }
    group.lines.push(row);
  }
  familyGroupsCache = groups;
  return groups;
}

/**
 * `familyName` appartient-il au périmètre du hub `hubName` ? L'égalité stricte,
 * mais AUSSI toute famille lichess-org sœur qui commence par ce même nom suivi
 * d'une frontière non-alphanumérique (espace, virgule...) — ex. "King's Gambit
 * Accepted"/"King's Gambit Declined" sous le hub "King's Gambit", "Queen's
 * Gambit Declined"/"Accepted" sous "Queen's Gambit", "London System, with Be2"
 * sous "London System".
 *
 * BUG CORRIGÉ (audit du 2026-09-04, « le Gambit du Roi ne fait que 3 demi-coups,
 * sans la moindre variante nommée ») : `familyNameOf` scinde un nom lichess-org
 * sur son PREMIER « : » — "King's Gambit Accepted: Bishop's Gambit" devient
 * ainsi la famille "King's Gambit Accepted", PAS "King's Gambit". Le hub
 * `CURATED_FAMILY_HUB["kings-gambit"] = "King's Gambit"` ne récupérait donc
 * QUE l'unique ligne nue "King's Gambit" (1.e4 e5 2.f4, 3 demi-coups) — les 137
 * lignes de "King's Gambit Accepted" (Gambit du Fou, Kieseritzky, Muzio...) et
 * les 53 de "King's Gambit Declined" restaient orphelines, jamais fusionnées.
 * Même défaut pour `queens-gambit` (256 lignes orphelines sous "Queen's Gambit
 * Declined"/"Accepted") et `london-system` (4 lignes sous "London System, with
 * Be2/Bd3"). Un simple `startsWith` capture ces trois cas SANS aucun faux
 * positif parmi les ~19 hubs déjà déclarés (vérifié empiriquement sur la base
 * entière) — la frontière non-alphanumérique reste une précaution supplémentaire
 * contre un futur hub dont le nom serait un préfixe accidentel d'une famille
 * sans rapport.
 */
function familyBelongsToHub(familyName: string, hubName: string): boolean {
  if (familyName === hubName) return true;
  if (!familyName.startsWith(hubName)) return false;
  const boundary = familyName.charAt(hubName.length);
  return boundary !== "" && !/[a-z0-9]/i.test(boundary);
}

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Une carte du catalogue dynamique — même forme que `server/queries/openings.ts#OpeningSummary`, plus les champs internes nécessaires à `getOpeningDetail` (`rootMoves`). */
export interface OpeningFamilySummary {
  id: string;
  name: string;
  eco: string;
  side: OpeningSide;
  description: string;
  rootMoves: readonly string[];
  variantCount: number;
}

let familyCatalogCache: OpeningFamilySummary[] | null = null;

/**
 * Une carte par famille lichess-org NON déjà représentée par un chapitre
 * curaté (`CURATED_FAMILY_HUB`) — voir le point 1 du docstring de fichier.
 * Trié par richesse (nombre de variantes) décroissante : les familles les
 * plus profondes (Sicilienne, Ruy Lopez…) en tête, cohérent avec l'intérêt
 * pédagogique réel.
 */
export function listOpeningFamilies(): OpeningFamilySummary[] {
  if (familyCatalogCache) return familyCatalogCache;
  // `familyBelongsToHub`, pas une simple égalité : une famille sœur absorbée
  // par un hub (ex. "King's Gambit Accepted"/"Declined" sous "King's Gambit",
  // voir son docstring) ne doit plus non plus apparaître comme sa propre carte
  // dynamique — sinon son contenu resterait dupliqué (déjà dans le chapitre
  // curaté ET dans une carte à part, sans nom français ni contenu pédagogique).
  const hubNames = Object.values(CURATED_FAMILY_HUB);
  const summaries: OpeningFamilySummary[] = [];
  for (const group of loadFamilyGroups().values()) {
    if (hubNames.some((hub) => familyBelongsToHub(group.name, hub))) continue;
    // BUG CORRIGÉ (Zukertort et consorts, voir le docstring de
    // `familyReferenceMoves`) : `rootMoves` DOIT être la position de
    // référence RÉELLE (parfois un coup plus longue que le simple préfixe
    // partagé), jamais le préfixe court utilisé seul — sans quoi `side`
    // (calculé sur la référence étendue) et `rootMoves` (resté court, promu
    // script interactif de la Ligne principale par `getOpeningDetail`)
    // peuvent décrire deux positions différentes, l'une entièrement jouée
    // par l'adversaire du camp annoncé.
    const rootMoves = familyReferenceMoves(group.lines, familyRootMoves(group.lines));
    const deepestPly = Math.max(...group.lines.map((l) => l.moves.length));
    summaries.push({
      id: `lichess-${slugify(group.name)}`,
      name: group.name,
      eco: mostFrequent(group.lines.map((l) => l.eco)),
      side: sideForReferenceMoves(rootMoves),
      description: `${group.lines.length} variante${group.lines.length > 1 ? "s" : ""} issue${group.lines.length > 1 ? "s" : ""} de la base Lichess (lichess-org/chess-openings), jusqu'à ${deepestPly} demi-coups de profondeur.`,
      rootMoves,
      variantCount: group.lines.length,
    });
  }
  familyCatalogCache = summaries.sort((a, b) => b.variantCount - a.variantCount || a.name.localeCompare(b.name));
  return familyCatalogCache;
}

const familyTreeCache = new Map<string, VariationNode>();

/**
 * L'arbre COMPLET d'une famille (toutes ses lignes fusionnées), mémoïsé par
 * NOM de famille plutôt que par id de chapitre curaté — `sicilian-najdorf`,
 * `sicilian-alapin` et `smith-morra-gambit` partagent tous les trois le même
 * hub "Sicilian Defense" (voir `CURATED_FAMILY_HUB`) : sans ce cache PARTAGÉ,
 * `getEnrichedTreeForCuratedOpening` reconstruirait le même arbre de 391
 * lignes trois fois de suite. Aucun risque à réutiliser le MÊME objet arbre
 * pour plusieurs appelants : ni `getImportedFamilyDetail` ni `mergeTrees`
 * (voir son docstring — seul `base` est jamais muté) n'écrivent dans l'arbre
 * qu'ils reçoivent en `addition`/lecture seule.
 */
function getFamilyTree(hubName: string): VariationNode | null {
  const cached = familyTreeCache.get(hubName);
  if (cached) return cached;
  // `familyBelongsToHub`, pas une simple égalité : rassemble aussi les
  // familles SŒURS du hub (ex. "King's Gambit Accepted"/"Declined" sous "King's
  // Gambit") — voir son docstring pour le bug que cela corrige. Un appel avec
  // le nom exact d'une famille dynamique (`getImportedFamilyDetail`, jamais un
  // hub curaté) ne récupère par construction qu'elle-même : aucune AUTRE
  // famille ne peut commencer par SON nom à elle suivi d'une frontière, ce nom
  // étant déjà le plus spécifique possible.
  const matchingLines = Array.from(loadFamilyGroups().values())
    .filter((group) => familyBelongsToHub(group.name, hubName))
    .flatMap((group) => group.lines);
  if (matchingLines.length === 0) return null;
  const tree = buildTreeFromLines(matchingLines.map(toNamedLine));
  familyTreeCache.set(hubName, tree);
  return tree;
}

interface ImportedFamilyDetail {
  summary: OpeningFamilySummary;
  tree: VariationNode;
}

const familyDetailCache = new Map<string, ImportedFamilyDetail>();

/** L'arbre complet d'une famille dynamique (id `lichess-*`, voir `listOpeningFamilies`) — `null` si `id` ne désigne aucune famille connue. */
export function getImportedFamilyDetail(id: string): ImportedFamilyDetail | null {
  const cached = familyDetailCache.get(id);
  if (cached) return cached;
  const summary = listOpeningFamilies().find((f) => f.id === id);
  if (!summary) return null;
  const tree = getFamilyTree(summary.name);
  if (!tree) return null;
  const detail: ImportedFamilyDetail = { summary, tree };
  familyDetailCache.set(id, detail);
  return detail;
}

/** Toutes les lignes importées dont les coups commencent EXACTEMENT par `prefix` — sert l'enrichissement précis d'un chapitre curaté sans hub désigné (voir le point 2 du docstring de fichier). */
function linesWithPrefix(prefix: readonly string[]): RawLine[] {
  return loadRawLines().filter((line) => prefix.length <= line.moves.length && prefix.every((san, i) => line.moves[i] === san));
}

const enrichedCuratedTreeCache = new Map<string, VariationNode>();

/**
 * L'arbre d'un chapitre curaté (`core/curriculum/openings.ts`), fusionné avec
 * TOUTE la profondeur que la base Lichess lui connaît — voir le point 2 du
 * docstring de fichier. Ne mute JAMAIS l'arbre partagé de `getOpeningTree`
 * (`server/curriculum/opening-tree-index.ts`, dont dépend par ailleurs la
 * détection d'écarts de répertoire, `server/queries/opening-mistakes.ts`) :
 * `structuredClone` avant de fusionner, pour que cet enrichissement reste
 * strictement local à l'onglet Ouvertures.
 */
export function getEnrichedTreeForCuratedOpening(opening: OpeningLine): VariationNode {
  const cached = enrichedCuratedTreeCache.get(opening.id);
  if (cached) return cached;

  const base = structuredClone(getOpeningTree(opening));
  const hubFamily = CURATED_FAMILY_HUB[opening.id];
  // Hub désigné : réutilise l'arbre PARTAGÉ de toute la famille (voir
  // `getFamilyTree`) — plusieurs chapitres curatés peuvent viser le même hub
  // (Najdorf/Alapine/Smith-Morra), jamais reconstruit plus d'une fois. Sans
  // hub : périmètre précis, seulement les lignes qui prolongent EXACTEMENT ce
  // chapitre (voir `linesWithPrefix`).
  const addition = hubFamily ? getFamilyTree(hubFamily) : buildTreeFromLines(linesWithPrefix(opening.moves).map(toNamedLine));
  const enriched = addition ? mergeTrees(base, addition) : base;

  enrichedCuratedTreeCache.set(opening.id, enriched);
  return enriched;
}

/** Un coup théorique connu depuis une position, tel qu'issu de la base importée globale — voir `getImportedChildren`. */
export interface ImportedContinuation {
  san: string;
  uci: string;
  eco: string;
  /** Nom de la sous-variante que ce coup ouvre, s'il en ouvre une — `null` sinon (voir `VariationNode.comment`). */
  variationName: string | null;
  /** Nombre de lignes importées qui proposent ce coup depuis cette position. */
  weight: number;
}

let globalImportedNodesByFenCache: Map<string, VariationNode[]> | null = null;

/**
 * `fen → tous les nœuds de TOUTE la base importée (les ~3810 lignes
 * lichess-org, `imported_opening_lines`) qui atteignent cette position` —
 * l'équivalent, pour les familles DYNAMIQUES, de `getGlobalCurriculumIndex`
 * pour les ~20 chapitres curatés : un arbre unique construit sur TOUTES les
 * lignes d'un coup (`buildTreeFromLines` fusionne déjà les préfixes partagés),
 * puis indexé par FEN pour capturer EN PLUS les transpositions entre lignes
 * qui ne partagent pas exactement le même préfixe de coups (deux familles
 * différentes atteignant la même position par des ordres de coups distincts).
 *
 * BUG CORRIGÉ (retour utilisateur direct, « Défense Benoni : coup annoncé
 * comme le dernier alors que la variante en a bien plus », après le correctif
 * du 2026-09-04 sur `decideOpponentStep` qui a d'abord révélé le symptôme) :
 * `listBookContinuations` (voir `server/queries/openings.ts`) n'interrogeait
 * jusqu'ici QUE `getCuratedChildren` (les ~20 chapitres curatés) puis, à
 * défaut, la base ECO générique embarquée (~3600 positions, TOUTES ouvertures
 * confondues). Dès qu'une manche divergeait (ou en mode Aléatoire) sur une
 * position qui n'existe que dans une famille DYNAMIQUE (les 125 familles
 * lichess-org sans chapitre curaté dédié, ex. "Benoni Defense") — la théorie
 * VRAIMENT connue, servant par ailleurs à construire le script de la variante
 * elle-même (`listOpeningVariations`/`deriveVariationsFromNode`) — restait
 * invisible à cette validation : `listBookContinuations` répondait "aucun
 * coup connu ici" en pleine ligne théorique bien vivante (vérifié : la
 * Défense Benoni tombe à 0 coup connu au ply 7 d'une ligne pourtant longue de
 * 19 coups). Combiné au filet de sécurité "théorie épuisée → fin de manche"
 * (désormais valide aussi au tour du joueur, voir `decideOpponentStep`), ce
 * trou de couverture faisait terminer la manche BIEN avant la vraie fin du
 * script, sur un simple angle mort de lookup — pas une vraie fin de théorie.
 */
function getGlobalImportedNodesByFen(): Map<string, VariationNode[]> {
  if (globalImportedNodesByFenCache) return globalImportedNodesByFenCache;
  const tree = buildTreeFromLines(loadRawLines().map(toNamedLine));
  const index = new Map<string, VariationNode[]>();
  for (const node of collectNodes(tree)) {
    const existing = index.get(node.fen);
    if (existing) existing.push(node);
    else index.set(node.fen, [node]);
  }
  globalImportedNodesByFenCache = index;
  return index;
}

/**
 * Union dédupliquée (par UCI) des coups enfants de TOUS les nœuds de la base
 * importée connus à `fen` — `[]` si aucune ligne importée n'atteint cette
 * position. Voir `getGlobalImportedNodesByFen` pour le bug que ceci corrige ;
 * même contrat que `getCuratedChildren`, dont c'est le pendant pour les
 * familles dynamiques plutôt que les chapitres curatés.
 */
export function getImportedChildren(fen: string): ImportedContinuation[] {
  const nodes = getGlobalImportedNodesByFen().get(fen);
  if (!nodes) return [];

  const byUci = new Map<string, ImportedContinuation>();
  for (const node of nodes) {
    for (const child of node.children) {
      if (!child.uci || !child.san) continue;
      const existing = byUci.get(child.uci);
      if (existing) {
        existing.weight += 1;
        continue;
      }
      byUci.set(child.uci, {
        san: child.san,
        uci: child.uci,
        eco: child.eco ?? "A00",
        variationName: child.comment,
        weight: 1,
      });
    }
  }
  return Array.from(byUci.values());
}
