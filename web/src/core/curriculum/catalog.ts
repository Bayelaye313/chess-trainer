import type { CurriculumCategory, CurriculumLevel } from "@/server/db/schema/curriculum";

/**
 * Catalogue statique des 141 thèmes de l'académie « Apprendre ».
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

export const CURRICULUM_THEMES: readonly CurriculumThemeSeed[] = [
  ...buildCategory(
    "positional_mastery",
    "pm",
    "Lavinia Valcu",
    POSITIONAL_MASTERY_TITLES,
    (title) => `Reconnaître et exploiter : ${title.toLowerCase()}.`,
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
  ),
  ...buildCategory(
    "checkmate_patterns",
    "cm",
    null,
    CHECKMATE_PATTERN_TITLES,
    (title) => `Le motif de mat "${title}" — entraîne-toi à le repérer avant qu'il ne soit trop tard.`,
  ),
  ...buildCategory(
    "tactical_motifs",
    "tm",
    null,
    TACTICAL_MOTIF_TITLES,
    (title) => `Le motif tactique "${title}" décortiqué en une série d'exercices ciblés.`,
  ),
  ...buildCategory(
    "sparring_positions",
    "sp",
    "Tournois 2026",
    SPARRING_POSITION_TITLES,
    () => "Position d'entraînement dans l'esprit du tournoi — pas une reproduction littérale de la partie.",
    // Positions de sparring : niveau tournoi du début à la fin.
    () => "advanced",
  ),
];

if (process.env.NODE_ENV !== "production" && CURRICULUM_THEMES.length !== 141) {
  // Filet de sécurité pour toute future édition de ce fichier : le compte de
  // 141 thèmes est une exigence du produit ("académie... 141 thèmes"), pas un
  // hasard — une régression silencieuse ici serait invisible en revue de code.
  throw new Error(`CURRICULUM_THEMES doit contenir 141 thèmes, en contient ${CURRICULUM_THEMES.length}.`);
}
