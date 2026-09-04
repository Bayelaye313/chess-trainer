import type { CurriculumCategory, CurriculumLevel } from "@/server/db/schema/curriculum";

/**
 * Catalogue statique des 211 thèmes de l'académie « Apprendre ».
 *
 * Pure donnée, comme `core/chess/decks.ts` pour les decks FSRS — mais ici elle
 * n'est pas consommée directement par l'UI : `server/queries/curriculum.ts` la
 * sème en base (`curriculum_themes`) au premier accès, idempotent, pour que
 * `user_theme_progress` puisse référencer un `themeId` stable par clé
 * étrangère. Modifier ce fichier ne met donc pas à jour les lignes déjà
 * semées — voir le docstring de `ensureCurriculumSeeded`.
 *
 * Chaque thème n'a, pour l'instant, aucun `curriculum_puzzles` associé sauf
 * les quelques-uns du fichier `server/db/seed/curriculum-puzzles.ts` (voir son
 * en-tête) : `totalPuzzles` est la cible annoncée au catalogue, pas un
 * décompte de contenu déjà importé.
 *
 * ## Saturation Lichess — les 155 thèmes curatés + les 56 thèmes officiels
 *
 * Les 155 thèmes ci-dessus (6 catégories : Positional Mastery, cursus Jesper
 * Hall, Checkmate Patterns, Tactical Motifs, Sparring Positions, Endgame
 * Mastery) sont des MODULES PÉDAGOGIQUES composés à la main — un titre
 * français, une description, parfois un tag Lichess de repli pour amorcer le
 * contenu (voir `TACTICAL_MOTIF_LICHESS_TAGS` etc. plus bas).
 *
 * Les 6 catégories `lichess_*` ajoutées à la suite sont d'une autre nature :
 * chacune reprend, TEL QUEL, un groupe officiel du sélecteur de thèmes
 * Lichess (Motifs / Avancé / Mats par coups / Thèmes de mat / Coups spéciaux
 * / Objectifs & Origines — https://database.lichess.org/#puzzles) — un thème
 * du catalogue PAR TAG EXACT, en bijection stricte (`lichessThemes` porte
 * toujours un unique tag), à DEUX exceptions volontaires près (nettoyage de
 * doublons, voir plus bas où chaque table est définie) : "Mat de la queue
 * d'aronde" fusionne `dovetailMate`/`swallowsTailMate` (même figure de mat,
 * deux noms français concurrents) et "Capture du défenseur" a été retirée de
 * `LICHESS_MOTIF_TAGS` au profit de "L'élimination du défenseur" (motif
 * tactique curaté qui portait déjà `capturedDefender`, voir
 * `TACTICAL_MOTIF_LICHESS_TAGS`) — sans ce retrait les deux thèmes se
 * partageaient le même tag en round-robin et restaient chacun à moitié vides.
 * Objectif sinon inchangé : que `scripts/convert-lichess-puzzles-csv.ts`
 * (colonne `Themes` du CSV officiel) ET `scripts/refine-tactics-pgn.ts`
 * (motifs de mat et longueurs recalculés depuis `tactics.pgn`, qui ne porte
 * aucun tag) aient TOUJOURS une case d'accueil exacte pour n'importe quel tag
 * rencontré, sans jamais avoir à improviser un rapprochement approximatif.
 *
 * Différence assumée avec les 155 thèmes curatés : ces 56 thèmes n'ont PAS
 * d'entrée dans `MASTER_PUZZLES_DATASET` (voir son docstring) — ce sont des
 * réservoirs purs, alimentés exclusivement par le pipeline d'import
 * (`data/import/academy/*.json` généré par les deux scripts ci-dessus), pas
 * des positions composées à la main. `master-puzzles-dataset.test.ts` et
 * `populate-puzzles.ts` le savent et ne les exigent pas dans le dataset
 * statique — un thème `lichess_*` affiche honnêtement 0/N tant qu'aucun
 * import n'a tourné, jamais une position hors-sujet pour combler la case.
 */

export interface CurriculumCategoryMeta {
  id: CurriculumCategory;
  label: string;
  author: string | null;
  description: string;
}

export const CURRICULUM_CATEGORIES: readonly CurriculumCategoryMeta[] = [
  {
    id: "positional_mastery",
    label: "Positional Mastery",
    author: "Lavinia Valcu",
    description:
      "Les plans stratégiques durables : structures de pions, avant-postes, bon et mauvais fou, colonnes ouvertes.",
  },
  {
    id: "jesper_hall_course",
    label: "Cours du MI Jesper Hall",
    author: "MI Jesper Hall",
    description: "Un cursus progressif par modules, de la structure de pions à la technique de conversion.",
  },
  {
    id: "checkmate_patterns",
    label: "Checkmate Patterns",
    author: null,
    description: "Les mats classiques à reconnaître d'un coup d'œil — la bibliothèque des motifs de mat.",
  },
  {
    id: "tactical_motifs",
    label: "Tactical Motifs",
    author: null,
    description: "Le vocabulaire tactique d'un joueur confirmé, du clouage au coup collinéen.",
  },
  {
    id: "sparring_positions",
    label: "Sparring Positions",
    author: "Tournois 2026",
    description: "Positions d'entraînement dans l'esprit des grands tournois de l'année : Candidats FIDE, Norway Chess…",
  },
  {
    id: "endgame_mastery",
    label: "Endgame Mastery",
    author: null,
    description: "Les finales qui décident la partie : pions, tours, pièces mineures — la technique qui convertit un avantage en victoire.",
  },
  // --- Les 6 catégories officielles de la taxonomie Lichess — voir le docstring de fichier ---
  {
    id: "lichess_motifs",
    label: "Motifs",
    author: null,
    description: "Les motifs tactiques fondamentaux du sélecteur Lichess — fourchette, clouage, pièce en prise, sacrifice…",
  },
  {
    id: "lichess_advanced",
    label: "Avancé",
    author: null,
    description: "Les motifs tactiques avancés du sélecteur Lichess — attraction, déviation, zugzwang, coup tranquille…",
  },
  {
    id: "lichess_mate_in",
    label: "Mats par coups",
    author: null,
    description: "Le mat forcé, classé par nombre de coups à calculer — de l'évidence en un coup au mat en cinq et plus.",
  },
  {
    id: "lichess_mate_themes",
    label: "Thèmes de mat",
    author: null,
    description: "Les figures de mat nommées du sélecteur Lichess, au-delà des 30 déjà couvertes par Checkmate Patterns.",
  },
  {
    id: "lichess_special_moves",
    label: "Coups spéciaux",
    author: null,
    description: "Roque, prise en passant, promotion et sous-promotion — les coups à ne jamais oublier de considérer.",
  },
  {
    id: "lichess_goals_origin",
    label: "Objectifs & Origines",
    author: null,
    description: "Le puzzle classé par ce qu'il vise (égaliser, gagner, écraser) ou par sa provenance (partie de maître, de super-GM).",
  },
] as const;

export interface CurriculumThemeSeed {
  id: string;
  category: CurriculumCategory;
  author: string | null;
  title: string;
  description: string;
  level: CurriculumLevel;
  totalPuzzles: number;
  orderIndex: number;
  /**
   * Tags de thème Lichess (`fork`, `backRankMate`, `pawnEndgame`…) qui
   * alimentent ce thème — source de vérité unique pour
   * `scripts/convert-lichess-puzzles-csv.ts`, qui construit sa table
   * tag→themeId directement depuis ce champ (jamais de mapping dupliqué
   * ailleurs). `undefined` pour un thème sans équivalent Lichess fiable
   * (reste curated-only, alimenté seulement par `data/import/academy/*.pgn`
   * écrits à la main).
   */
  lichessThemes?: readonly string[];
}

/** ASCII, minuscules, tirets — pas de dépendance à une lib de slug pour 141 titres. */
function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** 15/20/25/30 en rotation — assez de variété pour que la barre de progression ne soit jamais identique deux thèmes de suite. */
function targetCount(index: number): number {
  return 15 + (index % 4) * 5;
}

function levelForIndex(index: number, total: number): CurriculumLevel {
  const third = total / 3;
  if (index < third) return "beginner";
  if (index < third * 2) return "intermediate";
  return "advanced";
}

function buildCategory(
  category: CurriculumCategory,
  prefix: string,
  author: string | null,
  titles: readonly string[],
  describe: (title: string) => string,
  levelOverride?: (index: number) => CurriculumLevel,
  lichessThemesOf?: (title: string) => readonly string[] | undefined,
): CurriculumThemeSeed[] {
  return titles.map((title, index) => ({
    id: `${prefix}-${slugify(title)}`,
    category,
    author,
    title,
    description: describe(title),
    level: levelOverride ? levelOverride(index) : levelForIndex(index, titles.length),
    totalPuzzles: targetCount(index),
    orderIndex: index,
    lichessThemes: lichessThemesOf?.(title),
  }));
}

const POSITIONAL_MASTERY_TITLES = [
  "L'avant-poste du cavalier",
  "La case faible dans le camp adverse",
  "Le mauvais fou",
  "Cavalier contre fou : qui domine ?",
  "Le pion isolé de la dame",
  "Les pions pendants",
  "Doubler les pions adverses",
  "Le pion passé protégé",
  "La colonne ouverte",
  "La colonne semi-ouverte",
  "La tour à la 7e rangée",
  "Prophylaxie : anticiper le plan adverse",
  "L'avantage d'espace",
  "Le complexe de cases faibles",
  "La sécurité du roi en milieu de partie",
  "Activité des pièces contre matériel",
  "La paire de fous",
  "Évaluer un échange de pièces",
  "La chaîne de pions",
  "Les coups de rupture",
  "La restriction des pièces adverses",
  "La surprotection (Nimzowitsch)",
  "Le blocus du pion passé",
  "La centralisation des pièces",
  "Transformer un avantage",
  "La technique de simplification",
  "Le complexe de cases de couleur",
  "La forteresse défensive",
  "Le fou contre trois pions",
  "La supériorité de l'aile dame",
] as const;

const JESPER_HALL_TITLES = [
  "Module 1 : Structures de pions symétriques",
  "Module 2 : Jouer contre l'isolani",
  "Module 3 : La structure Carlsbad",
  "Module 4 : La structure Maroczy",
  "Module 5 : Le hérisson (Hedgehog)",
  "Module 6 : La chaîne de pions en français",
  "Module 7 : Structures à pions doublés",
  "Module 8 : Le roque opposé et l'attaque de pions",
  "Module 9 : La minorité d'attaque",
  "Module 10 : Le sacrifice positionnel de qualité",
  "Module 11 : Les finales de tours pratiques",
  "Module 12 : Les finales de fous de couleurs opposées",
  "Module 13 : Transition milieu de partie vers finale",
  "Module 14 : L'art de la conversion",
  "Module 15 : Fou contre cavalier, mode d'emploi",
  "Module 16 : Construire un plan à long terme",
  "Module 17 : Calcul et intuition positionnelle",
  "Module 18 : Évaluation dynamique contre statique",
  "Module 19 : Les cases de couleur au milieu de partie",
  "Module 20 : Le roi actif en finale",
  "Module 21 : Jouer les structures fermées",
  "Module 22 : Affronter le fianchetto",
  "Module 23 : Le contrôle du centre",
  "Module 24 : Le zugzwang positionnel",
  "Module 25 : Synthèse — parties commentées",
] as const;

const CHECKMATE_PATTERN_TITLES = [
  "Mat du couloir",
  "Mat de l'escalier",
  "Mat d'Anastasia",
  "Mat arabe",
  "Mat de Boden",
  "Mat de Damiano",
  "Mat de Blackburne",
  "Mat de l'épaulette",
  "Mat de Greco",
  "Mat du crochet",
  "Mat de Legall",
  "Mat de Lolli",
  "Mat de Morphy",
  "Mat de l'Opéra",
  "Mat de Pillsbury",
  "Mat de Réti",
  "Mat étouffé",
  "Mat de la queue d'aronde",
  "Mat de Vukovic",
  "Mat des deux fous",
  "Mat de la boîte",
  "Mat du triangle",
  "Mat du moulin",
  "Mat dame et tour",
  "Mat des deux tours",
  "Mat roi et dame contre roi",
  "Mat de Cozio",
  "Mat du fou de Damiano",
  "Mat de Max Lange",
  "Mat du filet",
] as const;

const TACTICAL_MOTIF_TITLES = [
  "La fourchette",
  "Le clouage absolu",
  "Le clouage relatif",
  "L'enfilade",
  "L'attaque à la découverte",
  "L'échec à la découverte",
  "L'échec double",
  "La déviation",
  "L'attraction",
  "L'interférence",
  "La surcharge",
  "L'intermezzo (Zwischenzug)",
  "Le coup collinéen",
  "L'élimination du défenseur",
  "L'attaque à rayons X",
  "Le sacrifice de dégagement",
  "Le moulin tactique",
  "La pièce piégée",
  "Le zugzwang tactique",
  "Le coup intercalaire",
  "Le désespoir (Desperado)",
  "L'attraction sur case fatale",
  "Le blocage tactique",
  "La sous-promotion",
  "L'échec perpétuel",
  "Le pat comme ressource",
  "La prise en passant tactique",
  "La batterie de pièces",
  "Le canon d'Alekhine",
  "Le sacrifice grec",
  "Le sacrifice de qualité",
  "Le sacrifice positionnel",
  "Le sacrifice de dame",
  "La libération de case",
  "L'ouverture de colonne",
  "L'ouverture de diagonale",
] as const;

const SPARRING_POSITION_TITLES = [
  "Candidats FIDE 2026 — Ronde 1 : sortie de théorie",
  "Candidats FIDE 2026 — Ronde 3 : milieu de partie tendu",
  "Candidats FIDE 2026 — Ronde 5 : finale technique",
  "Candidats FIDE 2026 — Ronde 7 : sacrifice thématique",
  "Candidats FIDE 2026 — Ronde 9 : conversion d'avantage",
  "Candidats FIDE 2026 — Ronde 11 : défense résiliente",
  "Candidats FIDE 2026 — Ronde 13 : coup décisif",
  "Candidats FIDE 2026 — Dernière ronde",
  "Norway Chess 2026 — Armageddon",
  "Norway Chess 2026 — Duel de style",
  "Norway Chess 2026 — Pression positionnelle",
  "Norway Chess 2026 — Contre-attaque",
  "Norway Chess 2026 — Finale de pions",
  "Norway Chess 2026 — Classique contre Armageddon",
  "Tata Steel 2026 — Groupe Masters",
  "Candidates féminines 2026",
  "Grand Chess Tour 2026 — Étape blitz",
  "Championnat du monde 2026 — Préparation",
  "Sinquefield Cup 2026",
  "Superbet Chess Classic 2026",
] as const;

/**
 * Tags Lichess par titre — construite en échantillonnant réellement la
 * colonne `Themes` de `lichess_db_puzzle.csv` (voir
 * `scripts/convert-lichess-puzzles-csv.ts`), pas depuis une liste supposée :
 * seuls les tags effectivement rencontrés dans le CSV apparaissent ici.
 * Un titre absent de cette table n'a pas d'équivalent Lichess assez fiable
 * pour être mappé sans ambiguïté (ex. "La surcharge" : aucun tag Lichess
 * dédié à l'overloading) — il reste curated-only.
 */
const TACTICAL_MOTIF_LICHESS_TAGS: Record<string, readonly string[]> = {
  "La fourchette": ["fork"],
  "Le clouage absolu": ["pin"],
  "L'enfilade": ["skewer"],
  "L'attaque à la découverte": ["discoveredAttack"],
  "L'échec à la découverte": ["discoveredCheck"],
  "L'échec double": ["doubleCheck"],
  "La déviation": ["deflection"],
  "L'attraction": ["attraction"],
  "L'interférence": ["interference"],
  "L'intermezzo (Zwischenzug)": ["intermezzo"],
  "Le coup collinéen": ["collinearMove"],
  // Tag officiel exact : "capturedDefender" (corrigé — "capturingDefender" était une coquille sans équivalent réel dans le CSV).
  // Titre unifié : ce thème absorbe seul le tag `capturedDefender` — l'ancien
  // doublon "Capture du défenseur" de `LICHESS_MOTIF_TAGS` (lichess_motifs) a
  // été supprimé pour ne plus fragmenter le même tag en round-robin entre
  // deux thèmes concurrents (voir le docstring de fichier, « Saturation Lichess »).
  "L'élimination du défenseur": ["capturedDefender"],
  "L'attaque à rayons X": ["xRayAttack"],
  "La pièce piégée": ["trappedPiece"],
  "Le zugzwang tactique": ["zugzwang"],
  "Le coup intercalaire": ["quietMove"],
  "La sous-promotion": ["underPromotion"],
  "La prise en passant tactique": ["enPassant"],
  "La libération de case": ["clearance"],
};

/** Mat de la boîte ← `killBoxMate` ("boxed-in" mate) : rapprochement assumé, pas une traduction littérale. */
const CHECKMATE_PATTERN_LICHESS_TAGS: Record<string, readonly string[]> = {
  "Mat du couloir": ["backRankMate"],
  "Mat de Boden": ["bodenMate"],
  "Mat des deux fous": ["doubleBishopMate"],
  // Tag officiel exact : "swallowsTailMate" (corrigé — "swallowstailMate" était une coquille de casse).
  "Mat de la queue d'aronde": ["dovetailMate", "swallowsTailMate"],
  "Mat du crochet": ["hookMate"],
  "Mat étouffé": ["smotheredMate"],
  "Mat de Vukovic": ["vukovicMate"],
  "Mat d'Anastasia": ["anastasiaMate"],
  "Mat arabe": ["arabianMate"],
  "Mat de l'épaulette": ["epauletteMate"],
  "Mat de Morphy": ["morphysMate"],
  "Mat de Pillsbury": ["pillsburysMate"],
  "Mat de l'Opéra": ["operaMate"],
  "Mat du triangle": ["triangleMate"],
  // Les "cochons aveugles" (deux tours connectées à la 7e/2e rangée) sont le chemin classique vers ce mat.
  "Mat des deux tours": ["blindSwineMate"],
  "Mat de la boîte": ["killBoxMate"],
};

/**
 * Replis génériques pour les 3 catégories SANS tag Lichess dédié — Lichess
 * ne subdivise pas ses puzzles par plan stratégique nommé (« avant-poste du
 * cavalier », « structure Carlsbad »…) ni par tournoi 2026 : aucun tag ne
 * correspond à un titre précis ici, contrairement à `TACTICAL_MOTIF_LICHESS_TAGS`/
 * `CHECKMATE_PATTERN_LICHESS_TAGS`/`ENDGAME_MASTERY_LICHESS_TAGS` ci-dessus.
 * Ces 3 tables associent donc chaque titre à un petit pool de tags Lichess
 * génériques mais réels (phase de partie, niveau, sacrifice…) — en dernière
 * priorité dans `PRIORITY_LICHESS_TAGS`
 * (`scripts/convert-lichess-puzzles-csv.ts`), pour ne jamais intercepter une
 * ligne qu'un tag plus spécifique des 3 autres catégories aurait pu
 * revendiquer. Un même tag peut nourrir plusieurs titres d'une même table
 * (round-robin déjà géré par `ThemeResolver`) — la coïncidence de contenu
 * entre deux thèmes d'un même module compte moins ici que garantir qu'aucun
 * n'affiche 0 puzzle (voir le docstring de fichier).
 */
// `exposedKing` n'est plus dans ce pool générique (retiré) : ce tag alimente
// désormais EXCLUSIVEMENT "Roi exposé" (`lm-roi-expose`, LICHESS_MOTIF_TAGS)
// — il était auparavant partagé en round-robin avec 8 de ces titres génériques
// (index % 4 === 1), ce qui le diluait au point de laisser "Roi exposé"
// quasiment vide. Voir aussi la remontée de priorité de `exposedKing` dans
// `PRIORITY_LICHESS_TAGS` (scripts/convert-lichess-puzzles-csv.ts).
const POSITIONAL_MASTERY_LICHESS_TAGS: Record<string, readonly string[]> = Object.fromEntries(
  POSITIONAL_MASTERY_TITLES.map((title, index) => [
    title,
    [["middlegame", "advantage"], ["defensiveMove"], ["hangingPiece", "advancedPawn"], ["castling", "equality"]][index % 4],
  ]),
);

/** Cursus plus exigeant (voir `levelForIndex` appliqué plus bas) — mêmes tags de phase/niveau que « Positional Mastery », plus `sacrifice`/`long`/`veryLong` pour refléter la profondeur de calcul attendue en fin de cursus. */
const JESPER_HALL_LICHESS_TAGS: Record<string, readonly string[]> = Object.fromEntries(
  JESPER_HALL_TITLES.map((title, index) => [
    title,
    [["middlegame", "advantage"], ["sacrifice", "long"], ["defensiveMove", "veryLong"], ["kingsideAttack", "queensideAttack"]][
      index % 4
    ],
  ]),
);

/** Niveau tournoi explicitement : `master`/`masterVsMaster`/`superGM`/`crushing` — filtrés en plus sous `SPARRING_MIN_RATING` (Elo 2000) côté convertisseur, pour qu'un tag générique partagé avec les 2 tables ci-dessus ne fasse jamais glisser du contenu débutant dans ce module. */
const SPARRING_POSITION_LICHESS_TAGS: Record<string, readonly string[]> = Object.fromEntries(
  SPARRING_POSITION_TITLES.map((title, index) => [
    title,
    [["master", "masterVsMaster"], ["superGM", "crushing"], ["masterVsMaster", "advantage"]][index % 3],
  ]),
);

/**
 * Catégorie « Fins de partie » — seul vrai trou du catalogue face à Lichess
 * (voir le docstring de fichier) : pions, tours, pièces mineures, plus un
 * repli générique (`endgame`) pour la conversion pratique d'avantage.
 */
const ENDGAME_MASTERY_TITLES = [
  "L'opposition en finale de pions",
  "La règle du carré",
  "Le pion passé décisif en finale",
  "La percée de pions",
  "Le roi actif en finale de pions",
  "La position de Lucena",
  "La position de Philidor",
  "La tour derrière le pion passé",
  "Couper le roi en finale de tours",
  "Fous de couleurs opposées : forteresse",
  "Le mauvais fou en finale",
  "Cavalier contre pions passés",
  "Fou contre cavalier en finale",
  "Finale pratique : convertir l'avantage",
] as const;

const ENDGAME_MASTERY_LICHESS_TAGS: Record<string, readonly string[]> = {
  "L'opposition en finale de pions": ["pawnEndgame"],
  "La règle du carré": ["pawnEndgame"],
  "Le pion passé décisif en finale": ["pawnEndgame"],
  "La percée de pions": ["pawnEndgame"],
  "Le roi actif en finale de pions": ["pawnEndgame"],
  "La position de Lucena": ["rookEndgame"],
  "La position de Philidor": ["rookEndgame"],
  "La tour derrière le pion passé": ["rookEndgame"],
  "Couper le roi en finale de tours": ["rookEndgame"],
  "Fous de couleurs opposées : forteresse": ["bishopEndgame"],
  "Le mauvais fou en finale": ["bishopEndgame"],
  "Cavalier contre pions passés": ["knightEndgame"],
  "Fou contre cavalier en finale": ["bishopEndgame", "knightEndgame"],
  // Repli générique : seul le tag de phase `endgame` (pas de sous-type précis) le nourrit.
  "Finale pratique : convertir l'avantage": ["endgame"],
};

/** Finales de base (opposition, carré, pion passé) d'abord ; Lucena/Philidor et forteresses ensuite, plus exigeantes. */
function endgameLevel(index: number): CurriculumLevel {
  if (index < 5) return "beginner";
  if (index < 9) return "intermediate";
  return "advanced";
}

// ─────────────────────────────────────────────────────────────────────────
// Les 6 catégories officielles Lichess — bijection stricte titre ↔ tag exact
// (voir « Saturation Lichess » dans le docstring de fichier). Chaque table
// est une liste de paires `[titre affiché, tag Lichess exact]`, jamais un
// `Record` comme les replis génériques ci-dessus : ici CHAQUE thème a son
// tag dédié, il n'y a pas de rapprochement à faire.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `tag` porte normalement un unique tag Lichess (bijection stricte, voir le
 * docstring de fichier) — un tableau de tags n'est toléré qu'aux deux
 * exceptions volontaires documentées là-bas (fusion de doublons), ex.
 * `LICHESS_MATE_THEME_TAGS` ci-dessous pour "Mat de la queue d'aronde".
 */
type LichessTagDef = readonly [title: string, tag: string | readonly string[]];

const LICHESS_MOTIF_TAGS: readonly LichessTagDef[] = [
  ["Pion avancé", "advancedPawn"],
  ["Attaque sur f2/f7", "attackingF2F7"],
  // "Capture du défenseur" (capturedDefender) retirée d'ici — fusionnée dans
  // "L'élimination du défenseur" (tactical_motifs, voir TACTICAL_MOTIF_LICHESS_TAGS
  // et le docstring de fichier, « Saturation Lichess ») pour ne plus fragmenter
  // le même tag Lichess entre deux thèmes concurrents.
  ["Attaque à la découverte", "discoveredAttack"],
  ["Échec double", "doubleCheck"],
  ["Roi exposé", "exposedKing"],
  ["Fourchette", "fork"],
  ["Pièce en prise", "hangingPiece"],
  ["Attaque à l'aile roi", "kingsideAttack"],
  ["Clouage", "pin"],
  ["Attaque à l'aile dame", "queensideAttack"],
  ["Sacrifice", "sacrifice"],
  ["Enfilade", "skewer"],
  ["Pièce piégée", "trappedPiece"],
];

const LICHESS_ADVANCED_TAGS: readonly LichessTagDef[] = [
  ["Attraction", "attraction"],
  ["Dégagement", "clearance"],
  ["Coup collinéaire", "collinearMove"],
  ["Échec à la découverte", "discoveredCheck"],
  ["Coup défensif", "defensiveMove"],
  ["Déviation", "deflection"],
  ["Interférence", "interference"],
  ["Intermezzo", "intermezzo"],
  ["Coup tranquille", "quietMove"],
  ["Attaque à rayons X", "xRayAttack"],
  ["Zugzwang", "zugzwang"],
];

/** Longueurs de mat forcé — niveau croissant strict, `mateIn5` couvre aussi "5+" côté Lichess. */
const LICHESS_MATE_IN_TAGS: readonly LichessTagDef[] = [
  ["Mat en 1", "mateIn1"],
  ["Mat en 2", "mateIn2"],
  ["Mat en 3", "mateIn3"],
  ["Mat en 4", "mateIn4"],
  ["Mat en 5 coups et plus", "mateIn5"],
];

/**
 * Thèmes de mat nommés du sélecteur Lichess — distincts des 30 de
 * `CHECKMATE_PATTERN_TITLES` (préfixe `cm-`, positions composées à la main) :
 * ceux-ci sont préfixés `lmt-` et alimentés par le tag Lichess exact, via le
 * CSV (`Themes`) ET via `scripts/refine-tactics-pgn.ts` qui RECALCULE ce même
 * motif sur `tactics.pgn` avec `core/chess/mate-patterns.ts` (voir son
 * docstring) quand le fichier source ne porte aucun tag.
 */
const LICHESS_MATE_THEME_TAGS: readonly LichessTagDef[] = [
  ["Mat d'Anastasia", "anastasiaMate"],
  ["Mat arabe", "arabianMate"],
  ["Mat du couloir", "backRankMate"],
  ["Mat de la Balestra", "balestraMate"],
  ["Mat des cochons aveugles", "blindSwineMate"],
  ["Mat de Boden", "bodenMate"],
  ["Mat du coin", "cornerMate"],
  ["Mat des deux fous", "doubleBishopMate"],
  // "Mat de la queue d'aronde" et "Mat de la queue d'hirondelle" sont la MÊME
  // figure de mat (deux noms français concurrents pour "dovetail" / "swallow's
  // tail") — fusionnés en une seule entrée plutôt que deux doublons qui se
  // partageaient artificiellement `dovetailMate`/`swallowsTailMate` en
  // round-robin (voir le docstring de fichier, « Saturation Lichess »).
  ["Mat de la queue d'aronde (Dovetail / Swallow's tail)", ["dovetailMate", "swallowsTailMate"]],
  ["Mat de l'épaulette", "epauletteMate"],
  ["Mat du crochet", "hookMate"],
  ["Mat de la boîte (Kill box)", "killBoxMate"],
  ["Mat de Pillsbury", "pillsburysMate"],
  ["Mat de Morphy", "morphysMate"],
  ["Mat de l'Opéra", "operaMate"],
  ["Mat du triangle", "triangleMate"],
  ["Mat de Vuković", "vukovicMate"],
  ["Mat étouffé", "smotheredMate"],
];

const LICHESS_SPECIAL_MOVE_TAGS: readonly LichessTagDef[] = [
  ["Roque", "castling"],
  ["Prise en passant", "enPassant"],
  ["Promotion", "promotion"],
  ["Sous-promotion", "underPromotion"],
];

const LICHESS_GOALS_ORIGIN_TAGS: readonly LichessTagDef[] = [
  ["Égalité", "equality"],
  ["Avantage", "advantage"],
  ["Position décisive (Crushing)", "crushing"],
  ["Partie de maître", "master"],
  ["Partie de super-GM", "superGM"],
];

/**
 * Construit une catégorie en bijection stricte titre ↔ tag Lichess — pendant
 * de `buildCategory` pour les 6 catégories `lichess_*` : pas de fonction
 * `describe`/`lichessThemesOf` à brancher, le tag EST la donnée.
 */
/** Formatte un ou plusieurs tags pour les descriptions générées — `` `tagA` `` seul, ou `` `tagA`/`tagB` `` pour les rares thèmes fusionnés (voir `LichessTagDef`). */
function formatTags(tags: readonly string[]): string {
  return tags.map((tag) => `\`${tag}\``).join("/");
}

function buildLichessTagCategory(
  category: CurriculumCategory,
  prefix: string,
  defs: readonly LichessTagDef[],
  describe: (title: string, tags: readonly string[]) => string,
  levelOverride?: (index: number) => CurriculumLevel,
): CurriculumThemeSeed[] {
  return defs.map(([title, tag], index) => {
    const tags = Array.isArray(tag) ? tag : [tag as string];
    return {
      id: `${prefix}-${slugify(title)}`,
      category,
      author: null,
      title,
      description: describe(title, tags),
      level: levelOverride ? levelOverride(index) : levelForIndex(index, defs.length),
      totalPuzzles: targetCount(index),
      orderIndex: index,
      lichessThemes: tags,
    };
  });
}

/** Mat en 1 = débutant, mat en 2 = intermédiaire, mat en 3 à 5+ = avancé (le calcul à plusieurs coups exige déjà de la lecture). */
function mateInLevel(index: number): CurriculumLevel {
  if (index === 0) return "beginner";
  if (index === 1) return "intermediate";
  return "advanced";
}

export const CURRICULUM_THEMES: readonly CurriculumThemeSeed[] = [
  ...buildCategory(
    "positional_mastery",
    "pm",
    "Lavinia Valcu",
    POSITIONAL_MASTERY_TITLES,
    (title) => `Reconnaître et exploiter : ${title.toLowerCase()}.`,
    undefined,
    (title) => POSITIONAL_MASTERY_LICHESS_TAGS[title],
  ),
  ...buildCategory(
    "jesper_hall_course",
    "jh",
    "MI Jesper Hall",
    JESPER_HALL_TITLES,
    (title) => `${title} — un module du cursus structuré du MI Jesper Hall.`,
    // Cursus qui monte en exigence sans jamais redescendre en "débutant" : dès le premier module,
    // on suppose les règles acquises — c'est la lecture stratégique qui est enseignée.
    (index) => (index < JESPER_HALL_TITLES.length * 0.6 ? "intermediate" : "advanced"),
    (title) => JESPER_HALL_LICHESS_TAGS[title],
  ),
  ...buildCategory(
    "checkmate_patterns",
    "cm",
    null,
    CHECKMATE_PATTERN_TITLES,
    (title) => `Le motif de mat "${title}" — entraîne-toi à le repérer avant qu'il ne soit trop tard.`,
    undefined,
    (title) => CHECKMATE_PATTERN_LICHESS_TAGS[title],
  ),
  ...buildCategory(
    "tactical_motifs",
    "tm",
    null,
    TACTICAL_MOTIF_TITLES,
    (title) => `Le motif tactique "${title}" décortiqué en une série d'exercices ciblés.`,
    undefined,
    (title) => TACTICAL_MOTIF_LICHESS_TAGS[title],
  ),
  ...buildCategory(
    "sparring_positions",
    "sp",
    "Tournois 2026",
    SPARRING_POSITION_TITLES,
    () => "Position d'entraînement dans l'esprit du tournoi — pas une reproduction littérale de la partie.",
    // Positions de sparring : niveau tournoi du début à la fin.
    () => "advanced",
    (title) => SPARRING_POSITION_LICHESS_TAGS[title],
  ),
  ...buildCategory(
    "endgame_mastery",
    "eg",
    null,
    ENDGAME_MASTERY_TITLES,
    (title) => `Finale : ${title.toLowerCase()}.`,
    endgameLevel,
    (title) => ENDGAME_MASTERY_LICHESS_TAGS[title],
  ),
  // --- Les 6 catégories officielles Lichess — voir « Saturation Lichess » dans le docstring de fichier ---
  ...buildLichessTagCategory(
    "lichess_motifs",
    "lm",
    LICHESS_MOTIF_TAGS,
    (title, tags) => `Motif Lichess "${title}" (tag ${formatTags(tags)}) — reconnu directement depuis les puzzles officiels.`,
  ),
  ...buildLichessTagCategory(
    "lichess_advanced",
    "la",
    LICHESS_ADVANCED_TAGS,
    (title, tags) => `Motif avancé "${title}" (tag ${formatTags(tags)}) — reconnu directement depuis les puzzles officiels.`,
    () => "advanced",
  ),
  ...buildLichessTagCategory(
    "lichess_mate_in",
    "lmi",
    LICHESS_MATE_IN_TAGS,
    (title, tags) => `${title} — mat forcé (tag ${formatTags(tags)}), toute la séquence à calculer et à jouer jusqu'au mat.`,
    mateInLevel,
  ),
  ...buildLichessTagCategory(
    "lichess_mate_themes",
    "lmt",
    LICHESS_MATE_THEME_TAGS,
    (title, tags) => `Le motif de mat "${title}" (tag ${formatTags(tags)}) — reconnu directement depuis les puzzles officiels.`,
  ),
  ...buildLichessTagCategory(
    "lichess_special_moves",
    "lsm",
    LICHESS_SPECIAL_MOVE_TAGS,
    (title, tags) => `Le coup spécial "${title}" (tag ${formatTags(tags)}) au cœur de la solution.`,
  ),
  ...buildLichessTagCategory(
    "lichess_goals_origin",
    "lgo",
    LICHESS_GOALS_ORIGIN_TAGS,
    (title, tags) => `Puzzles classés "${title}" (tag ${formatTags(tags)}) par le sélecteur Lichess.`,
    () => "advanced",
  ),
];

if (process.env.NODE_ENV !== "production" && CURRICULUM_THEMES.length !== 211) {
  // Filet de sécurité pour toute future édition de ce fichier : le compte de
  // 211 thèmes (155 curatés + 56 en bijection stricte avec les 6 catégories
  // officielles Lichess, voir « Saturation Lichess » dans le docstring de
  // fichier — 58 tags officiels mais 56 thèmes, 2 doublons volontairement
  // fusionnés) est une exigence du produit, pas un hasard — une régression
  // silencieuse ici serait invisible en revue de code.
  throw new Error(`CURRICULUM_THEMES doit contenir 211 thèmes, en contient ${CURRICULUM_THEMES.length}.`);
}

// ─────────────────────────────────────────────────────────────────────────
// Filtre qualité « pas de puzzle trivial en 1 pli, catalogue borné » — voir
// scripts/convert-lichess-puzzles-csv.ts et scripts/seed-academy.ts, seuls
// consommateurs. Un puzzle à une seule réplique (ex. un mat du couloir déjà
// jouable directement) n'a aucun intérêt pédagogique pour un thème tactique
// ou un motif de mat nommé : ces thèmes visent des séquences de 2 à 5 coups,
// avec priorité aux séquences contenant un sacrifice ou de haut niveau Elo,
// et un volume strictement borné (mieux vaut 50 exercices exigeants que 500
// triviaux). Seule exception stricte : "Mat en 1" (`lmi-mat-en-1`), où le mat
// en un coup EST le contenu attendu, jamais soumis à ce filtre.
// ─────────────────────────────────────────────────────────────────────────

const QUALITY_FILTERED_CATEGORIES: ReadonlySet<CurriculumCategory> = new Set<CurriculumCategory>([
  "checkmate_patterns",
  "tactical_motifs",
  "lichess_motifs",
  "lichess_advanced",
  "lichess_mate_themes",
  "lichess_mate_in",
]);

const MATE_IN_ONE_THEME_ID = "lmi-mat-en-1";

/** Plafond strict de puzzles conservés pour un thème soumis au filtre qualité (voir `QUALITY_FILTERED_THEME_IDS`). */
export const QUALITY_FILTER_MAX_PUZZLES = 50;

/** Précalculé une fois au chargement du module — lookup O(1) dans les scripts d'import qui tournent sur des millions de lignes. */
export const QUALITY_FILTERED_THEME_IDS: ReadonlySet<string> = new Set(
  CURRICULUM_THEMES.filter((theme) => QUALITY_FILTERED_CATEGORIES.has(theme.category) && theme.id !== MATE_IN_ONE_THEME_ID).map(
    (theme) => theme.id,
  ),
);
