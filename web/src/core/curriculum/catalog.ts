import type { CurriculumCategory, CurriculumLevel } from "@/server/db/schema/curriculum";

/**
 * Catalogue statique des 217 thèmes de l'académie « Apprendre ».
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
 * ## Saturation Lichess — les 161 thèmes curatés + les 56 thèmes officiels
 *
 * Les 161 thèmes ci-dessus (9 catégories : Positional Mastery, cursus Jesper
 * Hall, Structures de pions (Li-Pokamp), Faiblesses de pions (Yushan),
 * Milieu de partie (NoseKnowsAll), Checkmate Patterns, Tactical Motifs,
 * Sparring Positions, Endgame Mastery) sont des MODULES PÉDAGOGIQUES composés
 * à la main — un titre français, une
 * description, parfois un tag Lichess de repli pour amorcer le contenu (voir
 * `TACTICAL_MOTIF_LICHESS_TAGS` etc. plus bas).
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
 * Différence assumée avec les 161 thèmes curatés : ces 56 thèmes n'ont PAS
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
    description:
      "3 cours à plusieurs chapitres, chacun tiré d'une étude Lichess distincte : les mats de base à connaître, les mats impossibles à contourner, et les finales de rois et pions qui décident la partie.",
  },
  {
    id: "pawn_structures",
    label: "Structures de pions",
    author: "Li-Pokamp",
    description:
      "Le squelette de pions typique d'une ouverture — Grünfeld, Stonewall, Bénoni, Est-indienne, Française, Caro-Kann — et le plan qu'il impose à chaque camp, tiré de l'étude Lichess « Structures de pions ».",
  },
  {
    id: "pawn_weaknesses",
    label: "Faiblesses de pions",
    author: "Yushan",
    description:
      "Un vrai cours pas à pas, chapitre après chapitre, sur ce qui rend un pion durablement faible ou fort — tiré de l'étude Lichess « Pawn Structure ».",
  },
  {
    id: "middlegame",
    label: "Milieu de partie",
    author: "NoseKnowsAll",
    description:
      "7 cours à plusieurs chapitres, chacun tiré d'une étude Lichess complète et distincte de NoseKnowsAll (staff pick Lichess) : dominer une pièce mineure, infiltrer avec les tours, juger un sacrifice de qualité, lire les complexes de cases, et bâtir un plan en parlant à ses pièces.",
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

/**
 * Une description RÉELLE par module — cahier des charges du 2026-09-06 : le
 * gabarit générique précédent (`${title} — un module du cursus structuré du
 * MI Jesper Hall.`) s'affichait identique à un mot près sur les 25 cartes du
 * module (`theme-path.tsx`), l'exact symptôme du « copier-coller vide »
 * signalé. Une phrase par module, qui dit CE QUE le module enseigne plutôt
 * que de nommer une deuxième fois son titre.
 */
const JESPER_HALL_DESCRIPTIONS: Record<string, string> = {
  "Module 1 : Structures de pions symétriques": "Quand les pions sont en miroir, c'est l'activité des pièces — jamais la structure — qui doit décider ton plan.",
  "Module 2 : Jouer contre l'isolani": "Bloque le pion isolé sur une case fixe, échange les pièces mineures qui l'attaquent, et laisse la faiblesse peser en finale.",
  "Module 3 : La structure Carlsbad": "c3-d4 contre c6-d5 : l'attaque de minorité (b4-b5) fissure l'aile dame adverse sans jamais avancer le pion c lui-même.",
  "Module 4 : La structure Maroczy": "Les pions blancs c4+e4 interdisent à jamais ...d5 et ...b5 — Noir doit manœuvrer un cavalier vers d4 ou fissurer avec ...f5 pour respirer.",
  "Module 5 : Le hérisson (Hedgehog)": "Une position volontairement comprimée (pions sur la 6e rangée) qui explose par une rupture ...b5 ou ...d5 au moment choisi, jamais subi.",
  "Module 6 : La chaîne de pions en français": "La chaîne e5-d4 se défend à sa base (d4) — chaque camp joue sur l'aile que sa propre chaîne désigne, jamais l'inverse.",
  "Module 7 : Structures à pions doublés": "Des pions doublés valent une colonne ouverte ou un contrôle central accru — juge l'échange qui les crée, jamais le doublon seul.",
  "Module 8 : Le roque opposé et l'attaque de pions": "Rois sur des ailes opposées : c'est une course, pas une partie d'échecs — chaque tempo perdu à défendre est un tempo offert à l'assaut adverse.",
  "Module 9 : La minorité d'attaque": "Deux pions contre trois : pousse-les vers la majorité adverse pour lui infliger une faiblesse permanente, sans jamais chercher à les faire passer eux-mêmes.",
  "Module 10 : Le sacrifice positionnel de qualité": "Rendre la qualité (tour contre pièce mineure) pour une structure de pions saine et durable — un marché souvent sous-évalué par le calcul brut.",
  "Module 11 : Les finales de tours pratiques": "L'activité de la tour prime sur le matériel : une tour passive à un pion de plus perd souvent contre une tour active à un pion de moins.",
  "Module 12 : Les finales de fous de couleurs opposées": "Terriblement nulles au milieu de partie malgré un pion de plus, terriblement gagnantes en attaque — le même déséquilibre, deux visages opposés.",
  "Module 13 : Transition milieu de partie vers finale": "Compte les pions ET les cases avant chaque échange de dames — une finale entrée par erreur ne se rejoue jamais.",
  "Module 14 : L'art de la conversion": "Gagner une position gagnante est une compétence à part entière : simplifie méthodiquement, sans jamais relâcher la précision par excès de confiance.",
  "Module 15 : Fou contre cavalier, mode d'emploi": "Fous ouverts, cavaliers fermés — mais fixe d'abord les pions sur LA couleur qui neutralise le fou adverse avant de choisir ton camp.",
  "Module 16 : Construire un plan à long terme": "Identifie la faiblesse permanente de l'adversaire AVANT de bouger une pièce — un plan sans cible durable n'est qu'une suite de coups isolés.",
  "Module 17 : Calcul et intuition positionnelle": "Calcule les séquences forcées, évalue par intuition les positions calmes — confondre les deux registres coûte du temps ET de la précision.",
  "Module 18 : Évaluation dynamique contre statique": "Une pièce active vaut souvent plus que sa valeur nominale : pèse toujours ce qui bouge contre ce qui reste figé sur l'échiquier.",
  "Module 19 : Les cases de couleur au milieu de partie": "Chaque camp domine naturellement une couleur de cases — attaque sur la tienne, défends-toi sur celle de l'adversaire.",
  "Module 20 : Le roi actif en finale": "Dès que le danger de mat s'éloigne, le roi devient une pièce offensive majeure — le marcher au centre vaut souvent un pion entier.",
  "Module 21 : Jouer les structures fermées": "Dans une position fermée, la manœuvre patiente d'une pièce vaut mieux qu'une rupture prématurée qui n'ouvre rien en ta faveur.",
  "Module 22 : Affronter le fianchetto": "Le fou fianchetto contrôle une diagonale entière depuis le coin — l'échanger ou fermer sa diagonale sont les deux seuls vrais antidotes.",
  "Module 23 : Le contrôle du centre": "Contrôler le centre par des pièces vaut souvent plus que l'occuper par des pions, que l'adversaire peut attaquer et faire reculer.",
  "Module 24 : Le zugzwang positionnel": "Immobilise toutes les pièces adverses sauf une : l'adversaire finit par devoir bouger CETTE pièce et dégrader sa propre position tout seul.",
  "Module 25 : Synthèse — parties commentées": "Des parties complètes, annotées coup par coup, où se combinent enfin structure, plan et calcul — le test final du cursus.",
};

/**
 * Les 9 chapitres « squelette » (texte + FEN sans les pièces, comme sur
 * Lichess) retenus parmi les 10 importés dans
 * `data/import/academy/lichess_study_structures-de-pions_*.pgn` (étude
 * Lichess https://lichess.org/study/srjMsNnC de Li-Pokamp) — un titre par
 * structure nommée, chacune avec ses plans réels pour les deux camps.
 *
 * Règle de dédoublonnage (cahier des charges du 2026-09-07) : un chapitre dont
 * le TITRE ET LE CONCEPT sont déjà couverts ailleurs dans le catalogue est
 * retiré plutôt que dupliqué. Un seul cas s'applique ici : « La structure
 * Carlsbad » recoupait EXACTEMENT `jh-module-3-la-structure-carlsbad` (même
 * squelette c3-d4/c6-d5, même attaque de minorité b2-b4-b5) — retiré, sa
 * seconde partie réelle (Wojtaszek–Khairullin, l'exécution effective de b4-b5)
 * a été versée à la place dans les idées clés de `jh-module-3` (voir
 * `lesson-content.ts`). « Structure française type I » (contrôle de e5, pion
 * arriéré e6) reste en revanche distincte de `jh-module-6` (chaîne e5-d4 fixe,
 * jeu à la base d4) : titres et squelettes différents malgré le nom commun
 * « française » — pas un doublon.
 */
const PAWN_STRUCTURE_TITLES = [
  "Formation Caro-Kann",
  "La structure Grünfeld",
  "La structure Stonewall",
  "Formation Bénoni asymétrique",
  "Formation Bénoni symétrique",
  "Structure Est-indienne type I",
  "Structure Est-indienne type III",
  "Structure Est-indienne ouverte",
  "Structure française type I",
] as const;

/** Une phrase par structure — reformulée depuis le texte réel du chapitre Lichess correspondant, jamais une simple redite du titre. */
const PAWN_STRUCTURE_DESCRIPTIONS: Record<string, string> = {
  "Formation Caro-Kann": "Pions c3-d4 contre c6-e6 : Blanc lutte pour installer une pièce en e5 pendant que Noir cherche la rupture libératrice ...c5.",
  "La structure Grünfeld": "Le centre de pions blanc (c3-d4-e4) contre la majorité noire à l'aile dame : chaque camp vise son propre pion passé avant l'autre.",
  "La structure Stonewall": "Pions blancs figés en c3-d4-e3-f2 : le contrôle de la case e5 et l'échange du fou de cases noires décident du milieu de partie.",
  "Formation Bénoni asymétrique": "Majorité centrale blanche contre majorité à l'aile dame noire : la rupture e4-e5 blanche contre l'avance b7-b5-b4 noire, chacun visant son pion passé.",
  "Formation Bénoni symétrique": "Blanc garde un léger avantage d'espace ; Noir doit contrôler e4 et échanger les pièces mineures pour ne pas s'asphyxier.",
  "Structure Est-indienne type I": "La colonne c ouverte est l'enjeu central : qui la contrôle prépare une pénétration à la 2e ou 7e rangée.",
  "Structure Est-indienne type III": "Actions sur des ailes opposées : rupture c4-c5-c6 pour Blanc contre l'assaut f7-f5-f4-g5-g4 pour Noir.",
  "Structure Est-indienne ouverte": "Née après ...exd5 : Blanc gagne de l'espace et attaque à l'aile roi, Noir cherche l'échange de pièces et la rupture ...d6-d5 ou ...f7-f5.",
  "Structure française type I": "Contrôler e5 est la clé : Blanc y installe une pièce et double les tours sur e6, Noir cherche ...c5xd4 puis la rupture ...e6-e5.",
};

/**
 * Catégorie `pawn_weaknesses` — un seul thème pour l'instant, mais d'une
 * nature différente des deux catégories ci-dessus : pas un texte de synthèse
 * + une position d'exemple, mais un vrai COURS À PLUSIEURS CHAPITRES
 * (`COURSE_LESSONS`, voir `course-lesson.ts`) reproduisant la structure
 * réelle de l'étude Lichess « Pawn Structure » de Yushan
 * (https://lichess.org/study/a8arx17S) — un sujet comme « Backward Pawn » y
 * est raconté en 17 chapitres réels successifs, chacun sa propre position de
 * maître et son propre commentaire, plutôt qu'un unique résumé. Seul « Le
 * pion arriéré » est repris ici : c'est le seul sujet de cette étude dont le
 * cours est assez étoffé (17 chapitres réels, contre 1 à 5 pour les autres)
 * pour justifier, à lui seul, un thème dédié — cahier des charges du
 * 2026-09-07 : « pas de thème sans base solide de cours ». Les autres sujets
 * (Isolated Pawn, Doubled Pawns, Pawn Duo/Island, Open File…) restent hors
 * catalogue tant qu'ils n'ont pas reçu le même traitement.
 */
const PAWN_WEAKNESS_TITLES = ["Le pion arriéré"] as const;

const PAWN_WEAKNESS_DESCRIPTIONS: Record<string, string> = {
  "Le pion arriéré": "Un pion sans voisin pour l'appuyer, coincé derrière ses camarades : reconnaître quand il est mortel, et quand il tient bon.",
};

/**
 * Catégorie `middlegame` — 7 cours à plusieurs chapitres (`COURSE_LESSONS`,
 * voir `course-lesson.ts`), chacun repris d'une étude Lichess complète et
 * distincte de NoseKnowsAll (staff pick Lichess) — cahier des charges du
 * 2026-09-07 : « ajoutons Middlegame [...] sur l'onglet apprendre », avec la
 * liste exacte des 8 études annoncées. Un 8e thème, « Morphy Simulator », a dû
 * être omis : son étude Lichess (`LAV8k5kM`) est passée privée depuis
 * l'annonce — voir le docstring de `course-lesson.ts` pour le détail.
 */
const MIDDLEGAME_TITLES = [
  "Les cavaliers",
  "Les fous",
  "Les tours",
  "Toujours sacrifier la qualité",
  "Cases claires et cases sombres",
  "Parle à tes pièces",
  "Les pions ne sont pas des personnes",
] as const;

const MIDDLEGAME_DESCRIPTIONS: Record<string, string> = {
  "Les cavaliers": "Dominer un cavalier adverse — avec un fou, des pions, une tour, le roi et la dame — et sécuriser un avant-poste où le tien ne sera plus jamais chassé.",
  "Les fous": "Reconnaître un bon ou un mauvais fou, mais surtout juger son ACTIVITÉ réelle : un mauvais fou actif vaut souvent mieux qu'un bon fou enfermé.",
  "Les tours": "Infiltrer une tour sur la 7e ou la 8e rangée, contrôler une colonne ouverte jusqu'à sa vraie case d'infiltration, et connecter ses tours avant l'adversaire.",
  "Toujours sacrifier la qualité": "Juger quand céder une tour contre un cavalier ou un fou gagne tout de suite, quand c'est une vraie compensation positionnelle — et les deux cas où il ne faut surtout pas le faire.",
  "Cases claires et cases sombres": "Repérer un complexe de cases faible chez l'adversaire et l'exploiter pièce après pièce, avant que la structure de pions ne le referme.",
  "Parle à tes pièces": "Mettre chaque pièce à la place qu'elle réclame — la méthode pour trouver un plan quand aucun coup forcé ne s'impose.",
  "Les pions ne sont pas des personnes": "Sacrifier un pion sans hésiter dès qu'il active toutes tes pièces à la fois — et reconnaître les rares positions où, à l'inverse, un pion vaut une pièce entière.",
};

/**
 * Catégorie `endgame_mastery` — 3 cours à plusieurs chapitres
 * (`COURSE_LESSONS`, voir `course-lesson.ts`), chacun repris d'une étude
 * Lichess distincte fournie par l'utilisateur — cahier des charges du
 * 2026-09-08 : « le endgame mastery peut être regroupé sous le format
 * Lichess, avec tous les chapitres sous un cadre, on défile avec des
 * commentaires et indices ». Remplace intégralement l'ancienne version de la
 * catégorie (14 thèmes nourris par un pool de tags Lichess génériques —
 * `pawnEndgame`/`rookEndgame`/`bishopEndgame`/`knightEndgame`/`endgame` —
 * jamais un vrai cours) : voir le docstring de `course-lesson.ts` pour le
 * détail des 3 études sources et les chapitres retenus dans chacune.
 */
const ENDGAME_MASTERY_TITLES = [
  "Mats de force écrasante",
  "Face au roi seul",
  "Finales de pions : le duel des rois",
] as const;

const ENDGAME_MASTERY_DESCRIPTIONS: Record<string, string> = {
  "Mats de force écrasante": "Les mats de base à connaître par cœur quand le matériel est écrasant — dame, tour, deux fous, et le redoutable fou + cavalier — tirés du « Complete Endgame Course » de Jeremy Silman.",
  "Face au roi seul": "Quel matériel suffit à mater un roi seul (et lequel n'y suffit jamais), plus les deux outils qui décident toute finale de pions : la règle du carré et l'opposition.",
  "Finales de pions : le duel des rois": "Neuf types de finales de rois et pions, du pion isolé aux pions connectés en passant par la course de pions — l'opposition, la triangulation et le sacrifice de pion au service du roi.",
};

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
 * `CHECKMATE_PATTERN_LICHESS_TAGS` ci-dessus — `endgame_mastery` avait
 * auparavant sa propre table dédiée (`ENDGAME_MASTERY_LICHESS_TAGS`), retirée
 * le 2026-09-08 quand la catégorie est devenue curated-only (voir le
 * docstring de `ENDGAME_MASTERY_TITLES`).
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
/**
 * Titres « purs stratégiques » retirés du round-robin de tags génériques
 * ci-dessous — cahier des charges du 2026-09-06, DURCI le même jour : « coupe
 * IMMÉDIATEMENT tous les puzzles tactiques qui n'ont aucun rapport avec les
 * thèmes positionnels de Lavinia Valcu (...) et de Jesper Hall » — pas
 * seulement les 3 thèmes cités en exemple au premier passage, la totalité des
 * deux catégories : Lichess ne taggue ni « avant-poste », ni « case faible »,
 * ni aucun plan stratégique nommé ou structure de pions précise
 * (Carlsbad, Maroczy, hérisson…) — un round-robin de tags génériques
 * (`middlegame`/`sacrifice`/`kingsideAttack`) n'a jamais eu de rapport réel
 * avec ces 55 thèmes, seulement l'illusion d'un contenu qui remplissait la
 * jauge. Curated-only désormais, INTÉGRALEMENT : seuls
 * `data/import/academy/*.pgn`/`*.json` écrits ou vérifiés à la main (voir
 * `positional-studies-curated.json`) les alimentent — voir aussi
 * `STRATEGIC_CURATED_ONLY_THEME_IDS` (`scripts/seed-academy.ts`), qui purge en
 * plus toute pollution déjà importée par un run précédent du convertisseur
 * CSV, et `totalPuzzles` (recalculé pour TOUS les thèmes à chaque run, jamais
 * seulement les thèmes touchés — voir son docstring) : un thème qui retombe à
 * 0 exercice réel doit afficher honnêtement 0, jamais un objectif fictif.
 */
const STRATEGIC_CURATED_ONLY_TITLES = new Set<string>([
  ...POSITIONAL_MASTERY_TITLES,
  ...JESPER_HALL_TITLES,
  ...PAWN_STRUCTURE_TITLES,
  ...PAWN_WEAKNESS_TITLES,
  ...MIDDLEGAME_TITLES,
  ...ENDGAME_MASTERY_TITLES,
]);

/** Niveau tournoi explicitement : `master`/`masterVsMaster`/`superGM`/`crushing` — filtrés en plus sous `SPARRING_MIN_RATING` (Elo 2000) côté convertisseur, pour qu'un tag générique partagé avec les 2 tables ci-dessus ne fasse jamais glisser du contenu débutant dans ce module. */
const SPARRING_POSITION_LICHESS_TAGS: Record<string, readonly string[]> = Object.fromEntries(
  SPARRING_POSITION_TITLES.map((title, index) => [
    title,
    [["master", "masterVsMaster"], ["superGM", "crushing"], ["masterVsMaster", "advantage"]][index % 3],
  ]),
);

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
    // Curated-only intégral (voir `STRATEGIC_CURATED_ONLY_TITLES`) : aucun tag
    // Lichess générique n'a de rapport réel avec un plan stratégique nommé.
    () => undefined,
  ),
  ...buildCategory(
    "jesper_hall_course",
    "jh",
    "MI Jesper Hall",
    JESPER_HALL_TITLES,
    (title) => JESPER_HALL_DESCRIPTIONS[title] ?? `${title} — un module du cursus structuré du MI Jesper Hall.`,
    // Cursus qui monte en exigence sans jamais redescendre en "débutant" : dès le premier module,
    // on suppose les règles acquises — c'est la lecture stratégique qui est enseignée.
    (index) => (index < JESPER_HALL_TITLES.length * 0.6 ? "intermediate" : "advanced"),
    // Curated-only intégral — voir `STRATEGIC_CURATED_ONLY_TITLES`.
    () => undefined,
  ),
  ...buildCategory(
    "pawn_structures",
    "ps",
    "Li-Pokamp",
    PAWN_STRUCTURE_TITLES,
    (title) => PAWN_STRUCTURE_DESCRIPTIONS[title] ?? `${title} — une structure de pions nommée et son plan pour chaque camp.`,
    // Reconnaître une structure nommée exige déjà de lire une position — jamais un module "débutant".
    () => "intermediate",
    // Curated-only intégral — voir `STRATEGIC_CURATED_ONLY_TITLES`.
    () => undefined,
  ),
  ...buildCategory(
    "pawn_weaknesses",
    "pw",
    "Yushan",
    PAWN_WEAKNESS_TITLES,
    (title) => PAWN_WEAKNESS_DESCRIPTIONS[title] ?? `${title} — un cours à plusieurs chapitres sur cette faiblesse de pions.`,
    () => "intermediate",
    // Curated-only intégral — voir `STRATEGIC_CURATED_ONLY_TITLES`.
    () => undefined,
  ),
  ...buildCategory(
    "middlegame",
    "mg",
    "NoseKnowsAll",
    MIDDLEGAME_TITLES,
    (title) => MIDDLEGAME_DESCRIPTIONS[title] ?? `${title} — un cours à plusieurs chapitres tiré d'une étude Lichess de NoseKnowsAll.`,
    // Chaque cours suppose déjà les règles acquises (comme `pawn_weaknesses`) — jamais un module "débutant".
    () => "intermediate",
    // Curated-only intégral — voir `STRATEGIC_CURATED_ONLY_TITLES`.
    () => undefined,
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
    (title) => ENDGAME_MASTERY_DESCRIPTIONS[title] ?? `${title} — un cours à plusieurs chapitres tiré d'une étude Lichess de finales.`,
    // Chaque cours suppose déjà les règles acquises (comme `middlegame`) — jamais un module "débutant".
    () => "intermediate",
    // Curated-only intégral — voir `STRATEGIC_CURATED_ONLY_TITLES`.
    () => undefined,
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

if (process.env.NODE_ENV !== "production" && CURRICULUM_THEMES.length !== 217) {
  // Filet de sécurité pour toute future édition de ce fichier : le compte de
  // 217 thèmes (144 curatés (dont les 3 `endgame_mastery`, cahier des charges
  // du 2026-09-08 — remplacent les 14 thèmes à tags Lichess génériques
  // d'origine) + 9 `pawn_structures` (Li-Pokamp) + 1 `pawn_weaknesses`
  // (Yushan) + 7 `middlegame` (NoseKnowsAll, cahier des charges du
  // 2026-09-07) + 56 en bijection stricte avec les 6 catégories officielles
  // Lichess, voir « Saturation Lichess » dans le docstring de fichier — 58
  // tags officiels mais 56 thèmes, 2 doublons volontairement fusionnés) est
  // une exigence du produit, pas un hasard — une régression silencieuse ici
  // serait invisible en revue de code.
  throw new Error(`CURRICULUM_THEMES doit contenir 217 thèmes, en contient ${CURRICULUM_THEMES.length}.`);
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

/**
 * Version en `themeId` de `STRATEGIC_CURATED_ONLY_TITLES` — seul
 * consommateur : `scripts/seed-academy.ts`, qui purge/rejette tout draft ciblant
 * l'un de ces thèmes s'il provient d'un fichier `*-lichess.json` généré en
 * masse (tags génériques, voir le docstring de `STRATEGIC_CURATED_ONLY_TITLES`)
 * plutôt que d'un fichier curaté à la main.
 */
export const STRATEGIC_CURATED_ONLY_THEME_IDS: ReadonlySet<string> = new Set(
  CURRICULUM_THEMES.filter((theme) => STRATEGIC_CURATED_ONLY_TITLES.has(theme.title)).map((theme) => theme.id),
);
