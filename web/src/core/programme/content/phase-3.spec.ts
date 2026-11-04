import { retentionDay as RET } from "./retention-day";
import type { ConstructedPosition, DaySpec } from "./spec-types";

/**
 * Phase 3 — 1900 → 2100 : stratégie profonde, structures et plans (semaines 15 à 22).
 *
 * Parcours du palais : l'Observatoire (évaluer avant de calculer) → la
 * Bibliothèque (structures et espace) → le Chantier (prophylaxie et défense)
 * → la Citadelle (attaque) → le Port (finales de pièces mineures) → la Forge
 * (calcul) → l'Arsenal (finales de pièces lourdes) → le Tour de la Cité
 * (synthèse et bilan de phase).
 *
 * « Préparation d'ouverture » au sens de ce programme : comprendre les
 * STRUCTURES qui sortent des ouvertures et leurs plans, jamais apprendre des
 * variantes par cœur (les cours d'ouverture de l'application s'en chargent).
 *
 * Texte seulement : les puzzles sont tirés par le générateur à partir de
 * `sourcing`, filtrés sur l'échiquier (`geometry`) et vérifiés par Stockfish.
 */

export const PHASE_3_DAYS: readonly DaySpec[] = [
  // ═══ Semaine 15 — L'Observatoire ══════════════════════════════════════════
  {
    semaine: 15, jour: 1, metaphore_id: "lunette", theme_metaphore: "L'Observatoire — la Lunette",
    concept: "lire les déséquilibres avant de calculer",
    cours:
      "Au sommet de la Cité, l'Observatoire. On n'y frappe pas : on regarde. La grande lunette porte six cercles gradués, que l'on règle un par un avant toute décision. Le matériel. La structure de pions et ses faiblesses. Les pièces, actives ou passives. La sécurité des rois. L'espace. L'initiative, c'est-à-dire qui fait les menaces. Chaque camp a ses forces sur certains cercles. Le bon plan consiste à jouer là où tu es fort, et à neutraliser l'adversaire là où il est fort. Règle de la lunette : avant de calculer dans une position calme, nomme à voix haute au moins un déséquilibre favorable pour chaque camp. Le calcul vient ensuite, dirigé par ce que tu as vu. Lien avec l'Enclume : dans une position tactique, l'Enclume passe d'abord ; dans une position calme, c'est la Lunette.",
    ancrage_sensoriel:
      "Colle ton œil à l'oculaire froid de la lunette et sens sous tes doigts les six molettes crantées qui tournent, une par une, avec un petit déclic.",
    rappels: ["enclume", "sanctuaire", "phare"],
    focus_partie: "à la sortie de l'ouverture, règle les six cercles de la lunette et note ton plan en une phrase.",
    reconsolidation: { type: "recitation", consigne: "Récite les six cercles de la lunette, puis applique-les à voix haute à la position du 2e puzzle reconstruite de mémoire : un avantage par camp au moins." },
    checklist: ["Squelette désigné avant chaque solution", "Un déséquilibre nommé pour chaque camp", "Plan en une phrase écrit après l'ouverture"],
    sourcing: { anyThemes: ["quietMove", "advantage"], allThemes: ["middlegame"], noThemes: ["mateIn1", "mateIn2", "opening"], fallbackThemes: ["quietMove"] },
  },
  {
    semaine: 15, jour: 2, metaphore_id: "balance", theme_metaphore: "L'Observatoire — la Balance",
    concept: "qualité contre pièce mineure",
    cours:
      "À côté de la lunette, une vieille balance de laiton. Dans un plateau, une tour ; dans l'autre, un cavalier ou un fou et, souvent, un pion. En points, la tour pèse plus. Sur l'échiquier, tout dépend des lignes. Une tour sans colonne ouverte pèse moins qu'un cavalier installé au Sanctuaire ; un fou qui défend toutes les cases autour du roi pèse plus qu'une tour passive. Règle de la balance : avec la tour, ouvre des lignes et échange les pièces mineures restantes. Avec la pièce mineure, garde la position fermée, crée un avant-poste et des pions passés. Lien avec le Trébuchet : c'est la balance qui dit si un sacrifice de qualité était correct.",
    ancrage_sensoriel:
      "Sens le laiton froid des plateaux et vois l'aiguille hésiter longtemps avant de pencher, d'un côté puis de l'autre.",
    rappels: ["trebuchet", "sanctuaire", "nef"],
    focus_partie: "si la qualité a changé de mains : la position était-elle ouverte (tour) ou fermée (pièce) ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire un puzzle de la séance avec déséquilibre de qualité : colonnes ouvertes en bleu, cases fortes de la pièce mineure en rouge." },
    checklist: ["Squelette désigné avant chaque solution", "Position ouverte ou fermée jugée", "Plan adapté au déséquilibre de qualité"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "exchangeImbalance", fallbackThemes: ["advantage"] },
  },
  {
    semaine: 15, jour: 3, metaphore_id: "deux-vitraux", theme_metaphore: "L'Observatoire — les Deux Vitraux, deuxième étage",
    concept: "jouer la paire de fous",
    cours:
      "Les Deux Vitraux du Sanctuaire reçoivent un étage : savoir tirer profit de la paire de fous. Elle a besoin de lumière, donc de lignes ouvertes. Le plan : ouvrir la position par des ruptures de pions, avancer les pions pour chasser les cavaliers adverses de leurs bonnes cases, et éviter d'échanger l'un des deux fous sans raison. Contre la paire de fous, on garde la position fermée, on installe un cavalier sur une case que les fous ne peuvent pas attaquer, ou l'on échange un fou pour ne garder qu'un vitrail. Règle de l'étage : la paire de fous est un avantage à long terme. On ne la convertit pas en un coup ; on ouvre la cathédrale lentement.",
    ancrage_sensoriel:
      "Vois la lumière du matin traverser les deux vitraux et inonder la nef de couleurs : à mesure que le soleil monte, aucune case ne reste dans l'ombre.",
    rappels: ["deux-vitraux", "lunette", "muraille"],
    focus_partie: "si un camp a la paire de fous : a-t-il ouvert la position, ou l'autre l'a-t-il fermée ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de la séance, remonte à l'envers et note à chaque coup si la position s'ouvrait (bon pour les fous) ou se fermait." },
    checklist: ["Squelette désigné avant chaque solution", "Ouverture des lignes évaluée", "Paire de fous gardée ou neutralisée dans ma partie"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "bishopPair", fallbackThemes: ["advantage"] },
  },
  {
    semaine: 15, jour: 4, metaphore_id: "vitrail", theme_metaphore: "L'Observatoire — le Vitrail, troisième étage",
    concept: "le mauvais fou au milieu de jeu : l'échanger ou l'activer",
    cours:
      "Le Vitrail gagne son troisième étage. Au rez-de-chaussée, tu as appris à reconnaître le mauvais fou ; au Port, à le juger en finale. Ici, au milieu de jeu, trois remèdes. L'échanger contre le bon fou adverse, souvent par une manœuvre vers une diagonale commune. L'activer devant la chaîne de pions, avant que la chaîne ne se ferme : c'est le fou « mauvais mais actif ». Ou changer la structure par une rupture qui libère ses diagonales. Pour l'adversaire, la règle inverse : garde le mauvais fou adverse emmuré, échange ton bon fou contre ses cavaliers, et conduis la partie vers une finale du Fanal. Règle de l'étage : le mauvais fou n'est pas une fatalité, mais il faut s'en occuper avant que les pions ne soient fixés.",
    ancrage_sensoriel:
      "Frotte avec la main un vitrail couvert de suie : un petit cercle de couleur réapparaît, la lumière revient par ce seul trou.",
    rappels: ["vitrail", "fanal", "muraille"],
    focus_partie: "si un camp a un mauvais fou : l'a-t-il échangé, activé, ou libéré par une rupture ?",
    reconsolidation: { type: "recitation", consigne: "Récite les trois remèdes au mauvais fou et dis lequel était à l'œuvre dans le 3e puzzle de la séance reconstruit de mémoire." },
    checklist: ["Squelette désigné avant chaque solution", "Remède au mauvais fou nommé", "Mauvais fou traité avant la fixation des pions"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "badBishop", fallbackThemes: ["advantage", "bishopEndgame"] },
  },
  {
    semaine: 15, jour: 5, metaphore_id: "sanctuaire", theme_metaphore: "L'Observatoire — le Sanctuaire, troisième étage",
    concept: "cavalier contre fou au milieu de jeu",
    cours:
      "Le Sanctuaire reçoit son troisième étage : le duel du cavalier et du fou en milieu de jeu. Le cavalier l'emporte dans les positions fermées, avec des pions bloqués et des cases fortes. Le fou l'emporte dans les positions ouvertes, avec des pions sur les deux ailes. La question pratique est : quelle structure vais-je créer ? Quand tu échanges ton fou contre un cavalier, tu paries sur une position fermée ; quand tu gardes le fou, tu paries sur l'ouverture. Règle de l'étage : à chaque échange de pièce mineure, nomme la structure que tu vises. Le cavalier veut un Sanctuaire, le fou veut une Nef ouverte.",
    ancrage_sensoriel:
      "Écoute le silence épais du sanctuaire, fermé, où le cavalier se sent chez lui, puis ouvre grand la porte : la lumière entre pour le fou.",
    rappels: ["sanctuaire", "jetee", "balance"],
    focus_partie: "à chaque échange de pièce mineure : quelle structure visais-tu ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la structure de pions d'un puzzle de la séance et indique, flèche à l'appui, si elle favorisait le cavalier ou le fou." },
    checklist: ["Squelette désigné avant chaque solution", "Structure ouverte ou fermée jugée", "Échange de pièce mineure justifié dans ma partie"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "knightVsBishop", fallbackThemes: ["knightEndgame", "advantage"] },
  },
  {
    semaine: 15, jour: 6, metaphore_id: "girouette", theme_metaphore: "L'Observatoire — la Girouette",
    concept: "améliorer la pièce la plus mal placée",
    cours:
      "Sur le toit de l'Observatoire, une girouette rouillée ne tourne plus. Toutes les autres indiquent le vent ; elle, elle pointe le mur. C'est ta pièce la plus mal placée. Quand la position ne demande rien de forcé (l'Enclume ne donne rien et la Lunette est réglée), le meilleur plan est souvent le plus simple : trouver cette pièce et lui donner un meilleur poste, même si cela prend trois coups. Un cavalier en bord d'échiquier, un fou derrière ses pions, une tour encore sur sa case de départ. Règle de la girouette : dans une position calme, demande « quelle est ma pièce la plus mauvaise, et où serait-elle utile ? », puis trace son chemin. Demande aussi quelle est la pièce la plus mauvaise de l'adversaire, et garde-la mauvaise.",
    ancrage_sensoriel:
      "Entends le grincement de la girouette rouillée qu'on dégrippe, puis vois-la pivoter d'un coup pour s'aligner sur le vent.",
    rappels: ["lunette", "jetee", "vitrail"],
    focus_partie: "dans les moments calmes de ta partie : quelle était ta pièce la plus mal placée, et l'as-tu améliorée ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de la séance, remonte à l'envers et identifie la pièce qui était la plus mal placée au départ, puis le chemin qu'elle aurait pu suivre." },
    checklist: ["Squelette désigné avant chaque solution", "Pièce la plus mal placée nommée (des deux camps)", "Une pièce améliorée en trois coups dans ma partie"],
    sourcing: { anyThemes: ["quietMove"], noThemes: ["mateIn1", "opening"], fallbackThemes: ["quietMove", "advantage"] },
  },
  RET(15, ["lunette", "balance", "deux-vitraux", "vitrail", "sanctuaire", "girouette"], "L'Observatoire", "après l'ouverture, les six cercles de la lunette réglés et notés en marge.", ["Les 3 lieux de l'Observatoire et les 3 étages revisités récités sans erreur"]),

  // ═══ Semaine 16 — La Bibliothèque ═════════════════════════════════════════
  {
    semaine: 16, jour: 1, metaphore_id: "registre", theme_metaphore: "La Bibliothèque — le Registre",
    concept: "l'espace et l'étau",
    cours:
      "Derrière l'Observatoire, la Bibliothèque des structures. Sur le pupitre d'entrée, un grand registre : la liste de toutes les cases où l'adversaire peut encore poser ses pièces. Un pion avancé qui tient l'espace raye une case à chaque coup. Quand il ne reste plus assez de cases pour toutes ses pièces, elles se gênent, et l'étau se referme. Règles du registre. Avec l'espace, évite les échanges : moins de pièces, c'est moins de gêne pour l'adversaire. Empêche aussi ses ruptures, ce qui relie le registre à l'Échafaudage. Sans l'espace, cherche les échanges et la rupture qui fera sauter l'étau. Lien avec la Muraille : l'espace se gagne avec une chaîne de pions avancée, et se perd quand sa base est rompue.",
    ancrage_sensoriel:
      "Sens le papier épais du registre sous ta plume et entends le grattement de chaque case rayée, page après page, jusqu'à la dernière ligne.",
    rappels: ["muraille", "cage", "girouette"],
    focus_partie: "qui avait l'espace dans ta partie, et a-t-il évité ou cherché les échanges ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la position d'un puzzle de la séance et colorie les cases contrôlées par les pions de chaque camp : qui a le plus d'espace ?" },
    checklist: ["Squelette désigné avant chaque solution", "Espace compté pour chaque camp", "Échanges choisis selon l'espace dans ma partie"],
    sourcing: { anyThemes: ["advancedPawn", "quietMove"], allThemes: ["middlegame"], noThemes: ["mateIn1", "opening"], fallbackThemes: ["advancedPawn"] },
  },
  {
    semaine: 16, jour: 2, metaphore_id: "sape", theme_metaphore: "La Bibliothèque — la Sape, deuxième étage",
    concept: "la structure Carlsbad : minorité ou attaque centrale",
    cours:
      "La Sape du Faubourg reçoit un étage dans la Bibliothèque : la structure Carlsbad complète. Elle naît de l'échange c×d5 e×d5 dans le Gambit Dame : pions blancs d4 et e3, pions noirs d5 et c6. Deux plans pour les Blancs. La sape, c'est-à-dire l'attaque de minorité b4-b5, crée un pion c faible. L'attaque centrale (f3 et e4) ouvre le jeu au centre. Les Noirs, eux, attaquent souvent le roi par l'autre aile ou installent un cavalier en e4. Règle de l'étage : dans une structure connue, choisis entre deux plans, pas entre vingt. La structure suffit à te le dire. C'est cela, comprendre une ouverture sans réciter de variante.",
    ancrage_sensoriel:
      "Retire un vieux volume de la Bibliothèque : sur la tranche est gravée la structure, et le livre s'ouvre tout seul sur deux chapitres, pas plus.",
    rappels: ["sape", "registre", "bas-cote"],
    focus_partie: "si une structure connue apparaît : quels étaient les deux plans, et lequel as-tu choisi ?",
    reconsolidation: { type: "recitation", consigne: "Récite les deux plans de la structure Carlsbad pour chaque camp, puis dis lequel apparaissait dans le 1er puzzle de la séance." },
    checklist: ["Squelette désigné avant chaque solution", "Structure nommée et deux plans cités", "Un seul plan suivi avec constance dans ma partie"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "minorityStructure", fallbackThemes: ["queensideAttack", "middlegame"] },
  },
  {
    semaine: 16, jour: 3, metaphore_id: "phare", theme_metaphore: "La Bibliothèque — le Phare, troisième étage",
    concept: "le pion isolé dame : la poussée d5 et la finale",
    cours:
      "Le Phare reçoit son troisième étage. Tu sais voir le pion isolé et choisir un plan selon le nombre de pièces. À l'étage, les deux moments décisifs. La poussée d4-d5 (ou ...d5-d4) : elle se joue quand les pièces sont prêtes et que la case d5 est contrôlée au moins autant qu'elle n'est défendue. Elle ouvre des lignes et transforme le pion faible en ouverture brutale. La finale : si tout s'échange, le pion isolé est une cible, et le défenseur gagne souvent en mettant son roi devant. Règle de l'étage : avec l'isolé, compte les contrôles de d5 avant chaque coup ; contre l'isolé, échange une à une les pièces actives, en commençant par les cavaliers.",
    ancrage_sensoriel:
      "Sens le phare trembler sous un coup de vent violent, puis vois sa lumière s'éteindre d'un coup : l'isolé est seul dans la nuit.",
    rappels: ["phare", "ecluse", "lunette"],
    focus_partie: "si le pion isolé apparaît : as-tu compté les contrôles de la case de poussée ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de pion isolé, remonte à l'envers jusqu'au départ et compte, à chaque coup, les pièces qui contrôlaient la case devant l'isolé." },
    checklist: ["Squelette désigné avant chaque solution", "Contrôles de la case de poussée comptés", "Échanges choisis selon le camp de l'isolé"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "isolatedPawn", fallbackThemes: ["middlegame"] },
  },
  {
    semaine: 16, jour: 4, metaphore_id: "pont-suspendu", theme_metaphore: "La Bibliothèque — le Pont suspendu, deuxième étage",
    concept: "pions pendants : la poussée au bon moment",
    cours:
      "Le Pont suspendu du Faubourg reçoit son étage. Les pions pendants sont dynamiques : leur force est la poussée d4-d5 ou c4-c5, qui ouvre des lignes au moment où les pièces sont prêtes. Leur faiblesse : une fois poussés trop tôt, ils laissent des cases faibles derrière eux ; une fois attaqués de face par les tours, ils doivent être défendus par des pièces qui deviennent passives. Règle de l'étage : avec les pions pendants, la question est « quand pousser ? » — juste avant que l'adversaire n'ait assez de pièces pour les attaquer. Contre eux, la question est « comment forcer une poussée prématurée ? » — en les attaquant, pour qu'ils avancent avant d'être prêts.",
    ancrage_sensoriel:
      "Sens le pont suspendu qui se tend sous tes pieds quand tu avances, et entends un câble qui cède si tu cours trop vite.",
    rappels: ["pont-suspendu", "phare", "bas-cote"],
    focus_partie: "si les pions pendants apparaissent : à quel moment la poussée est-elle devenue possible ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire les pions pendants d'un puzzle et les pièces qui les attaquent et les défendent : compte-les, puis note qui gagne." },
    checklist: ["Squelette désigné avant chaque solution", "Moment de la poussée jugé", "Attaquants et défenseurs des pions pendants comptés"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "hangingPawns", fallbackThemes: ["middlegame"] },
  },
  {
    semaine: 16, jour: 5, metaphore_id: "muraille", theme_metaphore: "La Bibliothèque — la Muraille, troisième étage",
    concept: "chaînes de pions : de quel côté jouer",
    cours:
      "La Muraille reçoit son troisième étage, dans la Bibliothèque. Les grandes chaînes sortent des ouvertures : e5-d4 contre e6-d5 (structure française), d5-e4 contre d6-e5 (structure est-indienne). La règle de la chaîne qui pointe : chaque camp attaque du côté où sa chaîne pointe, c'est-à-dire là où il a plus d'espace. Il attaque aussi à la base de la chaîne adverse : f6 ou c5 contre la chaîne blanche, f4 ou c5 contre la chaîne noire. Les deux attaques vont souvent en sens opposé, ce qui crée une course comme pour la Herse. Règle de l'étage : identifie la direction des chaînes, nomme les deux ruptures (la tienne et la sienne), puis compte les temps.",
    ancrage_sensoriel:
      "Longe la muraille en escalier et sens sous ta main la pente : elle monte vers un côté de la ville, c'est là que tu dois aller.",
    rappels: ["muraille", "herse", "registre"],
    focus_partie: "si une chaîne de pions apparaît : vers quelle aile pointe-t-elle, et quelle rupture as-tu jouée ?",
    reconsolidation: { type: "recitation", consigne: "Récite la règle de la chaîne qui pointe, puis nomme les deux ruptures (la tienne et la sienne) dans un puzzle de la séance reconstruit de mémoire." },
    checklist: ["Squelette désigné avant chaque solution", "Direction de la chaîne et ruptures nommées", "Temps des deux attaques comptés"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "pawnChain", fallbackThemes: ["advancedPawn", "middlegame"] },
  },
  {
    semaine: 16, jour: 6, metaphore_id: "ecluse", theme_metaphore: "La Bibliothèque — l'Écluse, deuxième étage",
    concept: "le blocus au milieu de jeu",
    cours:
      "L'Écluse du Port reçoit son étage : le blocus en milieu de jeu. Un pion passé, même central et protégé, ne vaut rien s'il est bloqué par un cavalier solidement installé. Le bloqueur fait trois choses : il arrête le pion, il est protégé de face par le pion lui-même, et il rayonne vers l'avant. Nimzowitsch appelait le pion passé un « criminel à mettre sous les verrous ». Règle de l'étage : contre un pion passé, cherche la case de blocus et amène-y un cavalier, puis attaque ailleurs, puisque le pion bloqué ne fait plus rien. Avec le pion passé, attaque ou échange le bloqueur avant de pousser, sinon tes pièces travaillent pour rien.",
    ancrage_sensoriel:
      "Sens le bateau buter contre la porte de l'écluse et entends le bois qui gémit, alors que le gardien, assis dessus, ne bouge pas.",
    rappels: ["ecluse", "escalier", "sanctuaire"],
    focus_partie: "chaque pion passé de la partie : y avait-il un bloqueur, et qui l'a chassé ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la position d'un puzzle de la séance : pion passé, bloqueur, et la pièce qui a attaqué ou soutenu le bloqueur." },
    checklist: ["Squelette désigné avant chaque solution", "Bloqueur et case de blocus identifiés", "Pion passé bloqué ou bloqueur chassé dans ma partie"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "blockade", fallbackThemes: ["advancedPawn", "middlegame"] },
  },
  RET(16, ["registre", "sape", "phare", "pont-suspendu", "muraille", "ecluse"], "La Bibliothèque", "la structure de pions de la partie : quel volume de la Bibliothèque, et quels deux plans ?", ["Chaque partie de la semaine classée par structure, avec son plan"]),

  // ═══ Semaine 17 — Le Chantier ═════════════════════════════════════════════
  {
    semaine: 17, jour: 1, metaphore_id: "echafaudage", theme_metaphore: "Le Chantier — l'Échafaudage",
    concept: "la prophylaxie",
    cours:
      "À la sortie de la Bibliothèque, un chantier. Avant de monter un mur, les maçons dressent un échafaudage. Il ne construit rien, mais il empêche ce qui est construit de s'effondrer. La prophylaxie, c'est cela. Avant chaque coup en position calme, une question : « que veut faire l'adversaire s'il jouait deux fois de suite ? » Puis on l'en empêche, si cela ne coûte pas plus cher que de poursuivre son propre plan. Un luft avant l'attaque, un pion qui interdit une case au cavalier, une tour qui prend une colonne avant qu'il n'y arrive. Règle de l'échafaudage : un coup prophylactique est bon s'il enlève à l'adversaire son meilleur plan, pas seulement une menace. Lien avec la Poterne : la prophylaxie évite d'avoir à chercher la poterne plus tard.",
    ancrage_sensoriel:
      "Sens le métal froid des tubes de l'échafaudage sous tes mains et entends le serrage des colliers : clac, chaque pièce bien fixée avant de grimper.",
    rappels: ["poterne", "lunette", "girouette"],
    focus_partie: "avant chaque coup calme : qu'aurait-il joué s'il avait eu deux coups de suite ?",
    reconsolidation: { type: "recitation", consigne: "Pour deux puzzles de la séance, formule à voix haute le plan de l'adversaire, puis le coup qui l'en empêchait." },
    checklist: ["Squelette désigné avant chaque solution", "Plan adverse formulé avant chaque coup calme", "Un coup prophylactique joué dans ma partie"],
    sourcing: { anyThemes: ["defensiveMove", "quietMove"], allThemes: ["middlegame"], noThemes: ["mateIn1", "mateIn2"], fallbackThemes: ["defensiveMove", "quietMove"] },
  },
  {
    semaine: 17, jour: 2, metaphore_id: "trempe", theme_metaphore: "Le Chantier — la Trempe, deuxième étage",
    concept: "le coup tranquille dans les combinaisons longues",
    cours:
      "La Trempe de la Forge reçoit son étage. En phase 2, le coup tranquille était souvent le premier coup. À l'étage, il apparaît au milieu d'une combinaison : après deux coups forcés, quand tout le monde attend un troisième échec, un coup calme rend la suite imparable. C'est là que le calcul humain s'arrête trop tôt : on ne regarde que les coups forcés et l'on rate le coup qui ne menace rien de visible. Règle de l'étage : à la fin de chaque ligne forcée, avant d'évaluer, demande « et maintenant, un coup calme ? » Pour la défense, attends-toi au coup calme de l'adversaire : une position où il n'a « plus d'échec » n'est pas forcément sauvée.",
    ancrage_sensoriel:
      "Entends une série de coups de marteau, puis le silence et le long sifflement de la trempe, au milieu, quand personne ne l'attendait.",
    rappels: ["trempe", "enclume", "cage"],
    focus_partie: "à la fin de tes calculs : as-tu cherché un coup calme avant d'évaluer ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour le puzzle au coup tranquille le plus profond, remonte à l'envers et dis à quel pli le coup calme est apparu, et pourquoi aucun coup forcé ne marchait." },
    checklist: ["Squelette désigné avant chaque solution", "Coup calme cherché en fin de ligne forcée", "Coup calme de l'adversaire anticipé"],
    sourcing: { anyThemes: ["quietMove"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["quietMove"] },
  },
  {
    semaine: 17, jour: 3, metaphore_id: "cage", theme_metaphore: "Le Chantier — la Cage, troisième étage",
    concept: "restreindre avant d'attaquer",
    cours:
      "La Cage reçoit son troisième étage. Après avoir appris à prendre l'oiseau, puis à construire la cage, on apprend à restreindre une armée entière. Une pièce adverse sans bonne case est déjà à moitié perdue, même si l'on ne la gagne pas tout de suite. Le plan de restriction : contrôler les cases d'entrée avec des pions (ce qui relie la cage au Registre), échanger les pièces adverses actives et laisser les mauvaises sur l'échiquier, puis ouvrir un second front quand la défense ne peut plus se déplacer. Règle de l'étage : avant d'attaquer, compte les cases utiles de chaque pièce adverse. Si plusieurs n'en ont qu'une ou deux, le temps joue pour toi.",
    ancrage_sensoriel:
      "Entends plusieurs portes de cage se refermer l'une après l'autre dans une grande volière, et le silence qui s'installe.",
    rappels: ["cage", "registre", "echafaudage"],
    focus_partie: "dans ta partie, quelle pièce adverse avait le moins de cases utiles, et l'as-tu laissée enfermée ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la position d'un puzzle de la séance et indique, pour chaque pièce adverse, le nombre de cases utiles qu'elle avait." },
    checklist: ["Squelette désigné avant chaque solution", "Cases utiles des pièces adverses comptées", "Pièce adverse maintenue passive dans ma partie"],
    sourcing: { anyThemes: ["trappedPiece", "quietMove"], noThemes: ["mateIn1"], fallbackThemes: ["trappedPiece"] },
  },
  {
    semaine: 17, jour: 4, metaphore_id: "poterne", theme_metaphore: "Le Chantier — la Poterne, deuxième étage",
    concept: "la défense dans les lignes longues",
    cours:
      "La Poterne du Bastion reçoit son étage. En phase 2, il fallait trouver le seul coup défensif. À l'étage, la poterne est au bout d'un couloir : il faut parfois deux ou trois coups précis d'affilée, chacun le seul, pour sortir de la position. La méthode ne change pas, elle se répète : à chaque coup, liste les défenses (fuir, interposer, prendre, contre-menacer), élimine, garde la seule. La difficulté est psychologique, car on se fatigue de défendre et l'on joue le coup naturel au troisième coup. Règle de l'étage : en défense, ne relâche jamais le protocole tant que l'adversaire a des coups forcés. Ce n'est qu'une fois ses échecs et ses prises épuisés que la position est sauvée.",
    ancrage_sensoriel:
      "Avance courbé dans le couloir de la poterne, une main contre la paroi froide : une porte, puis une autre, puis l'air libre.",
    rappels: ["poterne", "enclume", "echafaudage"],
    focus_partie: "dans les moments de défense : as-tu appliqué le protocole à chaque coup, ou seulement au premier ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour le puzzle défensif le plus long, remonte à l'envers et, à chaque coup de défense, nomme la défense choisie et celle qui échouait." },
    checklist: ["Squelette désigné avant chaque solution", "Protocole de défense répété à chaque coup", "Coups forcés de l'adversaire épuisés avant de relâcher"],
    sourcing: { anyThemes: ["defensiveMove"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["defensiveMove"] },
  },
  {
    semaine: 17, jour: 5, metaphore_id: "contre-mine", theme_metaphore: "Le Chantier — la Contre-mine, deuxième étage",
    concept: "l'initiative : rendre le coup pour coup",
    cours:
      "La Contre-mine du Bastion reçoit son étage : l'initiative. Celui qui fait les menaces impose son rythme, et l'autre répond. Dans les positions dynamiques, l'initiative vaut souvent un pion, parfois une pièce. On la garde en enchaînant des coups qui menacent quelque chose. On la reprend en contre-attaquant au moment où l'adversaire relâche, par exemple quand il joue un coup calme. Règle de l'étage : à chaque coup, demande « qui menace ? ». Si c'est toi, cherche le coup qui garde la menace. Si c'est lui, cherche la contre-mine, c'est-à-dire la menace qui le force à répondre, avant de te contenter de parer.",
    ancrage_sensoriel:
      "Sens le rythme des coups de pioche s'accélérer dans la galerie, et entends ceux de l'ennemi ralentir, puis s'arrêter.",
    rappels: ["contre-mine", "soufflet", "lunette"],
    focus_partie: "à chaque phase de la partie : qui avait l'initiative, et quand a-t-elle changé de camp ?",
    reconsolidation: { type: "recitation", consigne: "Pour un puzzle de la séance reconstruit de mémoire, dis coup par coup qui avait l'initiative, puis récite la règle de l'étage." },
    checklist: ["Squelette désigné avant chaque solution", "Initiative suivie coup par coup", "Contre-menace cherchée avant la défense passive"],
    sourcing: { anyThemes: ["intermezzo", "defensiveMove", "attraction"], noThemes: ["mateIn1", "mateIn2"], fallbackThemes: ["intermezzo", "defensiveMove"] },
  },
  {
    semaine: 17, jour: 6, metaphore_id: "ronde", theme_metaphore: "Le Chantier — la Ronde, deuxième étage",
    concept: "forteresses et ressources de nulle",
    cours:
      "La Ronde perpétuelle du Bastion reçoit son étage : la forteresse. Une forteresse est une position où le camp le plus fort ne peut pas progresser, même avec plus de matériel. Le roi est bloqué derrière une barrière de pions, une pièce garde toutes les cases d'entrée, et les fous de couleurs opposées ne se croisent jamais. Les ressources sœurs sont la ronde (échec perpétuel), le pat et la répétition. Règle de l'étage : quand tu es moins bien, demande-toi s'il existe une position où l'adversaire ne peut plus entrer ; si oui, vise-la, même au prix d'un pion. Le défenseur expert ne cherche pas seulement à survivre coup par coup, il cherche un endroit où s'enfermer.",
    ancrage_sensoriel:
      "Vois les murs de la forteresse se refermer sur toi et entends l'ennemi qui tourne autour, sans trouver de porte.",
    rappels: ["ronde", "deux-fanaux", "poterne"],
    focus_partie: "dans une position inférieure : as-tu cherché une forteresse ou une ronde avant de te défendre pas à pas ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la position finale d'un puzzle de nulle, et entoure les cases que l'adversaire ne pouvait plus jamais atteindre." },
    checklist: ["Squelette désigné avant chaque solution", "Forteresse ou ronde cherchée en position inférieure", "Ressource de nulle utilisée dans ma partie"],
    sourcing: { anyThemes: ["equality"], noThemes: ["mateIn1"], fallbackThemes: ["equality", "defensiveMove"] },
  },
  RET(17, ["echafaudage", "trempe", "cage", "poterne", "contre-mine", "ronde"], "Le Chantier", "chaque coup calme de ta partie : as-tu posé la question de l'échafaudage ?", ["Trois coups prophylactiques de la semaine notés et expliqués"]),

  // ═══ Semaine 18 — La Citadelle ════════════════════════════════════════════
  {
    semaine: 18, jour: 1, metaphore_id: "herse", theme_metaphore: "La Citadelle — la Herse, deuxième étage",
    concept: "roques opposés : ouvrir les colonnes à temps",
    cours:
      "La Herse de la Citadelle reçoit son étage. Avec des roques opposés, la course se gagne souvent par un sacrifice de pion qui ouvre une colonne un temps plus tôt. On ne pousse pas pour gagner du matériel, on pousse pour ouvrir. L'autre arme est la prophylaxie : un seul coup qui ralentit l'attaque adverse vaut parfois deux coups d'attaque. Règle de l'étage : compte les temps des deux attaques, puis cherche le sacrifice qui raccourcit la tienne ou le coup qui rallonge la sienne. Si ton attaque est plus lente de deux temps, change de plan : centralise, ferme son aile d'attaque, ou contre-attaque au centre.",
    ancrage_sensoriel:
      "Entends la chaîne de ta herse qui accélère pendant que celle de l'ennemi se coince dans ses rails, avec un grincement de métal.",
    rappels: ["herse", "belier", "echafaudage"],
    focus_partie: "si les roques sont opposés : as-tu sacrifié un pion pour ouvrir à temps, ou ralenti son attaque ?",
    reconsolidation: { type: "recitation", consigne: "Pour un puzzle de la séance, compte à voix haute les temps des deux attaques, puis dis ce que le sacrifice ou la prophylaxie a changé." },
    checklist: ["Squelette désigné avant chaque solution", "Temps des deux attaques comptés", "Sacrifice d'ouverture ou coup de frein envisagé"],
    sourcing: { anyThemes: ["kingsideAttack", "queensideAttack"], noThemes: ["mateIn1"], geometry: "pawnStorm", fallbackThemes: ["kingsideAttack", "queensideAttack"] },
  },
  {
    semaine: 18, jour: 2, metaphore_id: "trebuchet", theme_metaphore: "La Citadelle — le Trébuchet, deuxième étage",
    concept: "le sacrifice de qualité positionnel",
    cours:
      "Le Trébuchet reçoit son étage. En phase 2, le sacrifice de qualité ouvrait une attaque directe. Ici, il est positionnel : on donne la qualité pour obtenir un pion, un cavalier imprenable au Sanctuaire, ou la paire de fous, et l'on gagne lentement. Petrossian en était le maître. Il donnait la qualité pour neutraliser l'attaque adverse, ou pour ne laisser aucune colonne ouverte à la tour restante. Règle de l'étage : après un sacrifice de qualité, il faut une compensation concrète. Un pion de plus, une case forte durable, une structure saine contre une structure abîmée. La Balance de l'Observatoire juge chaque cas.",
    ancrage_sensoriel:
      "Vois le trébuchet tirer non pas sur la porte, mais sur une tour de guet : sans elle, l'ennemi ne voit plus rien.",
    rappels: ["trebuchet", "balance", "sanctuaire"],
    focus_partie: "si la qualité a été donnée dans ta partie : quelle était la compensation concrète ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la position après le sacrifice de qualité d'un puzzle, et marque la compensation : pion, case forte ou structure." },
    checklist: ["Squelette désigné avant chaque solution", "Compensation du sacrifice nommée", "Balance consultée avant d'échanger la qualité"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "exchangeSacrifice", fallbackThemes: ["sacrifice", "advantage"] },
  },
  {
    semaine: 18, jour: 3, metaphore_id: "belier", theme_metaphore: "La Citadelle — le Bélier, deuxième étage",
    concept: "l'attaque de pions sur le roi roqué du même côté",
    cours:
      "Le Bélier du Donjon reçoit son étage. Avec des roques du même côté, lancer ses pions affaiblit son propre roi, et l'attaque doit donc être justifiée. Les conditions : un centre fermé ou stable (sans contre-attaque centrale possible), plus de pièces que l'adversaire sur l'aile du roi, et un crochet, c'est-à-dire un pion adverse avancé (h6, g6) sur lequel le bélier peut mordre. Règle de l'étage : avant de lancer g4-g5 ou h4-h5 avec ton propre roi derrière, vérifie le centre. S'il peut s'ouvrir, l'adversaire frappera au centre pendant que ton roi est découvert. Lien avec la Muraille : une chaîne qui pointe vers le roi donne au bélier l'espace dont il a besoin.",
    ancrage_sensoriel:
      "Sens le poids du bélier sur ton épaule et vois le crochet de fer sur la porte : c'est là qu'il faut frapper, pas ailleurs.",
    rappels: ["belier", "muraille", "registre"],
    focus_partie: "avant chaque poussée de pion devant ton roi : le centre était-il fermé, et y avait-il un crochet ?",
    reconsolidation: { type: "recitation", consigne: "Récite les trois conditions de l'attaque de pions avec roques du même côté, puis vérifie-les sur un puzzle de la séance reconstruit de mémoire." },
    checklist: ["Squelette désigné avant chaque solution", "Centre vérifié avant la poussée", "Crochet adverse identifié"],
    sourcing: { anyThemes: ["kingsideAttack"], noThemes: ["mateIn1"], geometry: "pawnStorm", fallbackThemes: ["kingsideAttack"] },
  },
  {
    semaine: 18, jour: 4, metaphore_id: "donjon-eventre", theme_metaphore: "La Citadelle — le Donjon éventré, troisième étage",
    concept: "attaquer le roi exposé : coordination",
    cours:
      "Le Donjon éventré reçoit son troisième étage. La brèche est faite, le roi est exposé ; il reste à l'atteindre. La faute fréquente est d'attaquer avec une ou deux pièces seulement. Le roi exposé se défend bien contre une dame seule, mal contre dame, tour et cavalier coordonnés. Règle de l'étage, en trois temps. Ferme les fuites du roi (pions, cases contrôlées). Amène les pièces lentes, tours et cavaliers, avant les rapides. Puis donne les échecs. Sans échecs prématurés, car un échec qui chasse le roi vers un abri est une perte de temps. Le squelette : les cases de fuite du roi et la case où la dernière pièce arrive.",
    ancrage_sensoriel:
      "Vois les torches de tes troupes entourer le donjon éventré de tous les côtés, avant que personne n'entre.",
    rappels: ["donjon-eventre", "mortier", "jetee"],
    focus_partie: "contre un roi exposé : combien de tes pièces participaient avant le premier échec ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour l'attaque la plus longue de la séance, remonte à l'envers et indique à chaque coup quelle pièce entrait et quelle fuite elle fermait." },
    checklist: ["Squelette désigné avant chaque solution", "Fuites du roi fermées avant les échecs", "Pièces lentes amenées d'abord dans ma partie"],
    sourcing: { anyThemes: ["exposedKing", "kingsideAttack"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["exposedKing"] },
  },
  {
    semaine: 18, jour: 5, metaphore_id: "pont-levis", theme_metaphore: "La Citadelle — le Pont-levis, deuxième étage",
    concept: "l'attraction dans les combinaisons longues",
    cours:
      "Le Pont-levis du Donjon reçoit son étage. En phase 1, on sacrifiait pour attirer le roi sur une case ; à l'étage, l'attraction est le premier maillon d'une chaîne. Le roi attiré en h7 se fait ensuite donner un échec double ; la dame attirée en f7 se fait ensuite fourcher ; la tour attirée en e8 se fait ensuite clouer. Règle de l'étage : quand tu envisages une attraction, ne te demande pas seulement « où va le roi ? », mais « quel motif de l'Atelier devient possible avec lui sur cette case ? » Fourchette, clouage, découverte, mat. Si tu ne trouves pas le deuxième maillon, l'attraction n'est qu'un cadeau.",
    ancrage_sensoriel:
      "Entends les chaînes du pont-levis se dérouler, sens les planches vibrer quand le roi pose le pied dessus, puis le claquement du piège.",
    rappels: ["pont-levis", "carrefour", "porte-derobee"],
    focus_partie: "si une pièce adverse pouvait être attirée sur une case : quel motif de l'Atelier suivait ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la position après l'attraction dans un puzzle de la séance, et trace en couleur le motif de l'Atelier qui a suivi." },
    checklist: ["Squelette désigné avant chaque solution", "Deuxième maillon identifié avant l'attraction", "Aucune attraction « gratuite » jouée"],
    sourcing: { anyThemes: ["attraction"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["attraction"] },
  },
  {
    semaine: 18, jour: 6, metaphore_id: "chambre-close", theme_metaphore: "La Citadelle — la Chambre close, troisième étage",
    concept: "mats en quatre coups et plus",
    cours:
      "La Chambre close reçoit son troisième étage. Les mats en quatre coups et plus se calculent à rebours, comme à l'étage précédent, mais avec des étapes intermédiaires : une figure (la chambre), puis une position d'approche qui y mène, puis le premier coup. C'est le chunking à l'état pur. Un maître ne calcule pas huit plis un par un : il voit trois blocs, l'ouverture de la brèche, l'approche et la figure finale. Règle de l'étage : découpe la combinaison en blocs et nomme chacun. Si un bloc est flou, c'est là que tu dois calculer précisément. Le reste est déjà connu.",
    ancrage_sensoriel:
      "Traverse trois pièces en enfilade, chacune éclairée d'une seule bougie, jusqu'à la chambre close au fond du couloir.",
    rappels: ["chambre-close", "canon", "crypte"],
    focus_partie: "dans les attaques de la partie : as-tu découpé ton calcul en blocs ?",
    reconsolidation: { type: "recitation", consigne: "Pour deux mats de la séance, récite les trois blocs (brèche, approche, figure) sans écran, puis rejoue-les de mémoire." },
    checklist: ["Squelette désigné avant chaque solution", "Combinaison découpée en blocs nommés", "Bloc flou calculé précisément"],
    sourcing: { anyThemes: ["mateIn4", "mateIn5", "mateIn3"], noThemes: ["mateIn1", "mateIn2"], fallbackThemes: ["mateIn3"] },
  },
  RET(18, ["herse", "trebuchet", "belier", "donjon-eventre", "pont-levis", "chambre-close"], "La Citadelle", "chaque attaque de la partie : conditions vérifiées, pièces coordonnées, blocs nommés ?", ["Une attaque de la semaine découpée en blocs, par écrit"]),

  // ═══ Semaine 19 — Le Port ═════════════════════════════════════════════════
  {
    semaine: 19, jour: 1, metaphore_id: "jetee", theme_metaphore: "Le Port — la Jetée, deuxième étage",
    concept: "finales de cavaliers",
    cours:
      "La Jetée du Port reçoit son étage : les finales de cavaliers, souvent dites « finales de pions déguisées ». Comme en finale de pions, le roi actif et le pion passé éloigné décident. Le cavalier, lent, ne peut pas couvrir les deux ailes à la fois. Trois règles de l'étage. Un pion passé éloigné gagne presque toujours, parce que le cavalier défenseur doit partir le chercher. Le cavalier ne perd pas de temps (il ne peut pas « passer »), donc les zugzwangs y sont fréquents. Et compte les sauts : à quatre ou cinq coups de cavalier d'une case, c'est souvent trop tard. Lien avec l'Allée éloignée : ici, c'est le cavalier qui court chercher le leurre.",
    ancrage_sensoriel:
      "Compte tes pas sur la jetée en zigzag, un, deux, trois : la mer est juste là, mais le chemin est long.",
    rappels: ["jetee", "allee-eloignee", "porte-tournante"],
    focus_partie: "en finale de cavaliers : combien de sauts pour atteindre le pion passé adverse ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la position d'une finale de cavaliers de la séance et numérote les sauts du cavalier jusqu'à la case clé." },
    checklist: ["Squelette désigné avant chaque solution", "Sauts de cavalier comptés", "Pion passé éloigné repéré"],
    sourcing: { anyThemes: ["knightEndgame"], noThemes: ["mateIn1"], fallbackThemes: ["knightEndgame"] },
  },
  {
    semaine: 19, jour: 2, metaphore_id: "fanal", theme_metaphore: "Le Port — le Fanal, deuxième étage",
    concept: "finales de fous de même couleur",
    cours:
      "Le Fanal reçoit son étage : les finales de fous de même couleur. Les deux fanaux éclairent les mêmes cases, et le combat se joue sur la couleur des pions. Le défenseur place ses pions sur la couleur opposée à celle des fous, où ils ne peuvent pas être attaqués. L'attaquant cherche à les fixer sur la couleur des fous, puis entre avec son roi. Le fou bon ou mauvais décide souvent le résultat. Règle de l'étage : en finale de fous de même couleur, chaque poussée de pion doit répondre à une question : la case d'arrivée est-elle de la couleur des fous ? Si oui, le pion devient une cible.",
    ancrage_sensoriel:
      "Vois les deux fanaux tourner sur la même bande de vagues, et chaque pion posé sur cette bande s'allumer comme une cible.",
    rappels: ["fanal", "vitrail", "roi-jardinier"],
    focus_partie: "en finale de fous : sur quelle couleur étaient tes pions, et sur laquelle les siens ?",
    reconsolidation: { type: "recitation", consigne: "Récite la règle de l'étage, puis, pour un puzzle de la séance reconstruit de mémoire, classe chaque pion selon la couleur de sa case." },
    checklist: ["Squelette désigné avant chaque solution", "Couleur des cases des pions vérifiée", "Pions défenseurs placés hors de la couleur des fous"],
    sourcing: { anyThemes: ["bishopEndgame"], noThemes: ["mateIn1"], fallbackThemes: ["bishopEndgame"] },
  },
  {
    semaine: 19, jour: 3, metaphore_id: "deux-fanaux", theme_metaphore: "Le Port — les Deux Fanaux, deuxième étage",
    concept: "fous de couleurs opposées : gagner ou tenir",
    cours:
      "Les Deux Fanaux reçoivent leur étage. En finale de fous de couleurs opposées, le défenseur tient souvent avec deux pions de moins. Pour gagner, l'attaquant a besoin de deux pions passés éloignés l'un de l'autre, au moins de trois colonnes : le fou défenseur ne peut alors pas tout couvrir. Le défenseur, lui, bloque avec son roi devant un pion, et avec son fou sur la diagonale de l'autre. Règle de l'étage : compte la distance entre les pions passés. Deux colonnes ou moins, c'est souvent nul ; trois ou plus, c'est souvent gagné. Et rappelle-toi l'étage précédent : en milieu de jeu, les fous opposés favorisent l'attaquant.",
    ancrage_sensoriel:
      "Vois les deux faisceaux qui balaient le bassin sans se croiser, et deux bateaux qui entrent au port par des passes éloignées.",
    rappels: ["deux-fanaux", "allee-eloignee", "ecluse"],
    focus_partie: "en finale de fous opposés : à combien de colonnes l'un de l'autre étaient les pions passés ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire une finale de fous opposés de la séance et mesure la distance entre les pions passés en colonnes." },
    checklist: ["Squelette désigné avant chaque solution", "Distance entre pions passés mesurée", "Blocus roi + fou mis en place en défense"],
    sourcing: { anyThemes: ["bishopEndgame", "endgame"], noThemes: ["opening", "mateIn1"], geometry: "oppositeBishops", fallbackThemes: ["bishopEndgame"] },
  },
  {
    semaine: 19, jour: 4, metaphore_id: "balance", theme_metaphore: "Le Port — la Balance, deuxième étage",
    concept: "tour contre pièce mineure en finale",
    cours:
      "La Balance de l'Observatoire descend au Port : tour contre pièce mineure en finale. Sans pions, c'est presque toujours nul ; avec des pions, la tour gagne si elle peut attaquer les pions adverses par derrière ou sur les côtés. La pièce mineure tient si ses pions sont groupés et protégés, et si son roi est actif. Les cas critiques : tour contre fou avec des pions sur une seule aile, souvent nul si le fou est de la bonne couleur ; tour contre cavalier avec le cavalier près du roi, souvent nul. Règle de l'étage : avec la tour, crée un pion passé ou attaque les pions isolés ; avec la pièce, regroupe les pions et rapproche le roi.",
    ancrage_sensoriel:
      "Sens la balance qui oscille longtemps sur le quai, et entends le bruit des poids qu'on ajoute un par un : chaque pion fait pencher.",
    rappels: ["balance", "tour-sentinelle", "jetee"],
    focus_partie: "si une finale tour contre pièce mineure arrive : les pions du défenseur étaient-ils groupés ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle tour contre pièce de la séance, remonte à l'envers et dis à chaque coup si la tour attaquait des pions ou si la pièce les regroupait." },
    checklist: ["Squelette désigné avant chaque solution", "Pions groupés ou isolés évalués", "Roi activé du côté défenseur"],
    sourcing: { anyThemes: ["endgame", "rookEndgame"], noThemes: ["mateIn1"], geometry: "exchangeImbalance", fallbackThemes: ["endgame"] },
  },
  {
    semaine: 19, jour: 5, metaphore_id: "allee-eloignee", theme_metaphore: "Le Port — l'Allée éloignée, deuxième étage",
    concept: "le pion passé éloigné avec des pièces",
    cours:
      "L'Allée éloignée du Jardin reçoit son étage, au Port. En phase 1, le pion passé éloigné gagnait les finales de pions. Avec des pièces, il reste une arme. Il oblige une pièce adverse à le surveiller, ce qui laisse l'adversaire à une pièce de moins sur le reste de l'échiquier. Le plan classique : pousser le pion éloigné pour détourner, puis frapper de l'autre côté avec le roi ou une autre pièce. Règle de l'étage : le pion éloigné n'a pas besoin d'aller à dame ; il doit détourner. Pousse-le jusqu'à ce qu'une pièce adverse se fixe sur lui, puis change d'aile.",
    ancrage_sensoriel:
      "Vois au bout de l'allée lointaine une lanterne allumée : le gardien court vers elle, et le jardin principal reste dans le noir.",
    rappels: ["allee-eloignee", "escalier", "jetee"],
    focus_partie: "si un pion passé éloigné apparaît : quelle pièce adverse a-t-il détournée ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire un puzzle de la séance : le pion éloigné, la pièce qu'il a détournée, et l'aile où le coup décisif est tombé." },
    checklist: ["Squelette désigné avant chaque solution", "Pièce détournée par le pion éloigné identifiée", "Changement d'aile joué au bon moment"],
    sourcing: { anyThemes: ["endgame", "advancedPawn"], noThemes: ["mateIn1"], geometry: "outsidePasser", fallbackThemes: ["advancedPawn", "endgame"] },
  },
  {
    semaine: 19, jour: 6, metaphore_id: "breche", theme_metaphore: "Le Port — la Brèche, deuxième étage",
    concept: "percées et sacrifices de pions en finale",
    cours:
      "La Brèche du Jardin reçoit son étage. En phase 1, la percée de pions se jouait en finale de pions pure. Avec des pièces, les percées existent aussi : un sacrifice de pion ouvre la route à un autre pion, ou attire une pièce défensive loin de la promotion. Le principe est le même que pour la Brèche : on sacrifie une pierre pour qu'une autre passe. Mais il faut compter aussi les pièces qui peuvent revenir. Règle de l'étage : avant une percée, compte les coups jusqu'à la promotion, puis les coups de chaque pièce adverse pour revenir défendre. Si ta promotion arrive avant, la brèche est ouverte.",
    ancrage_sensoriel:
      "Entends les branches de la haie craquer quand un premier pion s'y jette, et vois le second se glisser par le trou.",
    rappels: ["breche", "cabestan", "cour-carree"],
    focus_partie: "en finale : y avait-il une percée, et as-tu compté les coups des pièces adverses ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de percée, remonte à l'envers depuis la promotion et compte, à chaque coup, les temps de retour des pièces adverses." },
    checklist: ["Squelette désigné avant chaque solution", "Coups jusqu'à la promotion comptés", "Temps de retour des pièces adverses comptés"],
    sourcing: { anyThemes: ["advancedPawn", "promotion"], allThemes: ["endgame"], noThemes: ["mateIn1"], geometry: "breakthrough", fallbackThemes: ["promotion", "advancedPawn"] },
  },
  RET(19, ["jetee", "fanal", "deux-fanaux", "balance", "allee-eloignee", "breche"], "Le Port", "si ta partie entre en finale : quels quais du Port, et quelles questions as-tu posées ?", ["Une finale de la semaine expliquée par écrit avec les lieux du Port"]),

  // ═══ Semaine 20 — La Forge ════════════════════════════════════════════════
  {
    semaine: 20, jour: 1, metaphore_id: "enclume", theme_metaphore: "La Forge — l'Enclume, deuxième étage",
    concept: "calcul forcé profond",
    cours:
      "L'Enclume reçoit son étage. Le protocole (échecs, prises, menaces) reste le même, mais on le répète à chaque pli de la variante, pour les DEUX camps. La plupart des erreurs de calcul à ce niveau ne viennent pas d'une variante mal vue : elles viennent d'un coup forcé de l'adversaire oublié au troisième ou quatrième pli. Règle de l'étage : à chaque position imaginée de ta variante, refais l'Enclume pour l'adversaire avant de continuer. C'est lent au début, puis cela devient un réflexe. On ne calcule pas plus loin ; on calcule plus juste.",
    ancrage_sensoriel:
      "Entends trois coups de marteau à chaque pli : échec, prise, menace, puis trois autres pour l'adversaire, comme un écho.",
    rappels: ["enclume", "soufflet", "contre-mine"],
    focus_partie: "dans tes calculs de la partie : as-tu refait l'Enclume pour l'adversaire à chaque pli ?",
    reconsolidation: { type: "recitation", consigne: "Pour le puzzle le plus long, récite à voix haute la variante et, à chaque pli, les coups forcés de l'adversaire que tu as vérifiés." },
    checklist: ["Squelette désigné avant chaque solution", "Enclume refaite à chaque pli pour l'adversaire", "Aucun coup forcé adverse oublié dans ma partie"],
    sourcing: { anyThemes: ["long", "veryLong"], noThemes: ["opening", "mateIn1", "mateIn2"], fallbackThemes: ["long"] },
  },
  {
    semaine: 20, jour: 2, metaphore_id: "soufflet", theme_metaphore: "La Forge — le Soufflet, deuxième étage",
    concept: "coups intermédiaires en chaîne",
    cours:
      "Le Soufflet reçoit son étage. Dans les positions tendues, les coups intermédiaires s'enchaînent. Chaque camp en intercale un, puis l'autre répond par un nouveau, et celui qui a le dernier coup de soufflet gagne. Les situations typiques : deux pièces en prise à la fois, un échange en cours avec un échec possible au milieu, une pièce qui menace et qui est menacée. Règle de l'étage : dans une séquence d'échanges, ne calcule pas « je prends, il reprend ». À chaque étape, demande « y a-t-il un coup plus fort que la reprise ? », pour toi comme pour lui. La séquence la plus simple n'est souvent pas la vraie.",
    ancrage_sensoriel:
      "Sens le soufflet pomper de plus en plus vite et la braise rougir et blanchir, sous un rythme qui s'accélère.",
    rappels: ["soufflet", "enclume", "carrefour"],
    focus_partie: "dans chaque séquence d'échanges : as-tu vérifié un coup intermédiaire à chaque reprise ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de la séance, remonte à l'envers la séquence et marque chaque coup intermédiaire, le tien et le sien." },
    checklist: ["Squelette désigné avant chaque solution", "Coup intermédiaire vérifié à chaque reprise", "Dernier coup de soufflet identifié"],
    sourcing: { anyThemes: ["intermezzo"], noThemes: ["mateIn1"], fallbackThemes: ["intermezzo"] },
  },
  {
    semaine: 20, jour: 3, metaphore_id: "ramonage", theme_metaphore: "La Forge — le Ramonage, deuxième étage",
    concept: "dégagement et interception combinés",
    cours:
      "Le Ramonage reçoit son étage, et il rencontre la Vanne. Une même pièce peut dégager une ligne pour les siens et intercepter une ligne adverse en un seul coup : elle part de sa case (dégagement) et se pose sur la ligne ennemie (interception). Ces coups doubles sont parmi les plus beaux de la tactique, et les plus difficiles à voir, parce qu'ils sont souvent des sacrifices. Règle de l'étage : quand une de tes pièces bouche une ligne et qu'une ligne adverse est essentielle à sa défense, cherche la case où la pièce fait les deux à la fois. Le squelette : la ligne libérée, la ligne coupée, la case du coup.",
    ancrage_sensoriel:
      "Entends la suie tomber de la cheminée et, au même moment, la vanne qui claque dans le canal : un seul geste, deux effets.",
    rappels: ["ramonage", "vanne", "canon"],
    focus_partie: "si une de tes pièces gênait une ligne : pouvait-elle aussi couper une ligne adverse ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la position du puzzle de dégagement, avec en vert la ligne libérée et en rouge la ligne adverse coupée." },
    checklist: ["Squelette désigné avant chaque solution", "Ligne libérée et ligne coupée tracées", "Coup double cherché dans ma partie"],
    sourcing: { anyThemes: ["clearance", "interference"], noThemes: ["mateIn1"], fallbackThemes: ["clearance", "interference"] },
  },
  {
    semaine: 20, jour: 4, metaphore_id: "carrefour", theme_metaphore: "La Forge — le Carrefour, deuxième étage",
    concept: "préparer la fourchette",
    cours:
      "Le Carrefour de l'Atelier reçoit son étage. En phase 1, la fourchette était là, à prendre. Au deuxième étage, il faut la préparer : attirer une pièce adverse sur une case de fourchette (Pont-levis), dévier le défenseur de la case du carrefour (Pilier surchargé), ou forcer le roi sur la bonne case par un échec. Règle de l'étage : quand deux pièces adverses sont à distance de fourchette l'une de l'autre, ou quand le roi et une pièce le sont, cherche la case du carrefour, puis les coups forcés qui y mènent. Les cases de fourchette du cavalier se voient mieux en couleur : un cavalier ne fourche que deux pièces sur des cases de même couleur entre elles, opposée à la sienne.",
    ancrage_sensoriel:
      "Vois les deux rues du carrefour s'éclairer en même temps, et entends deux portes claquer quand le cavalier se pose au centre.",
    rappels: ["carrefour", "pont-levis", "pilier-surcharge"],
    focus_partie: "repère dans ta partie deux pièces adverses sur des cases de même couleur : une fourchette était-elle préparable ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour deux puzzles de fourchette préparée, remonte à l'envers : quel coup a mis la pièce sur la case de fourchette ?" },
    checklist: ["Squelette désigné avant chaque solution", "Case du carrefour trouvée avant le calcul", "Couleurs des cases vérifiées pour les fourchettes de cavalier"],
    sourcing: { anyThemes: ["fork"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["fork"] },
  },
  {
    semaine: 20, jour: 5, metaphore_id: "vanne", theme_metaphore: "La Forge — la Vanne, deuxième étage",
    concept: "interceptions défensives et offensives",
    cours:
      "La Vanne reçoit son étage. On a appris à couper une ligne de défense adverse. La vanne sert aussi en défense : une pièce qui s'interpose sur la ligne d'attaque adverse avec gain de temps (un échec, une menace) peut tout arrêter. Les interceptions défensives sont parmi les coups les plus difficiles à trouver, parce qu'elles ressemblent à des sacrifices inutiles. Règle de l'étage : quand une pièce adverse menace à distance (dame sur une diagonale, tour sur une colonne), cherche les cases de sa ligne où tu peux interposer une pièce avec menace. La même question vaut pour ses défenses à distance : où couper ?",
    ancrage_sensoriel:
      "Sens la vanne qui descend dans l'eau froide et vois le courant qui dévie, de l'autre côté, vers un bassin vide.",
    rappels: ["vanne", "poterne", "crypte"],
    focus_partie: "chaque ligne d'attaque adverse à distance : y avait-il une case pour interposer avec tempo ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire un puzzle de la séance et marque toutes les cases d'interception possibles sur la ligne clé, puis celle qui marchait." },
    checklist: ["Squelette désigné avant chaque solution", "Cases d'interception listées sur la ligne clé", "Interposition avec tempo cherchée en défense"],
    sourcing: { anyThemes: ["interference"], noThemes: ["mateIn1"], fallbackThemes: ["interference", "defensiveMove"] },
  },
  {
    semaine: 20, jour: 6, metaphore_id: "porte-derobee", theme_metaphore: "La Forge — la Porte dérobée, troisième étage",
    concept: "le moulin et les découvertes répétées",
    cours:
      "La Porte dérobée reçoit son troisième étage : le moulin. Une tour ou un fou donne échec à la découverte, prend une pièce, revient se placer devant, et redonne échec à la découverte, encore et encore. La pièce de derrière (souvent un fou ou une tour) tient le roi cloué dans sa chambre, et la pièce de devant ramasse tout ce qui traîne. Règle de l'étage : quand ta pièce peut donner un échec à la découverte, regarde si elle peut ensuite revenir sur sa case de départ avec un nouvel échec à la découverte. Si oui, c'est un moulin. Compte ce qu'il ramasse, puis vérifie que l'adversaire n'a pas d'échec intercalé (le Soufflet).",
    ancrage_sensoriel:
      "Entends le grincement régulier des ailes du moulin qui tournent, et chaque tour fait tomber un sac de grain.",
    rappels: ["porte-derobee", "soufflet", "tribune"],
    focus_partie: "si une batterie cachée pointait sur le roi : y avait-il un moulin possible ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour le puzzle de découverte le plus long, remonte à l'envers et compte les allers-retours de la pièce de devant." },
    checklist: ["Squelette désigné avant chaque solution", "Retour de la pièce de devant vérifié (moulin)", "Échec intercalé adverse vérifié"],
    sourcing: { anyThemes: ["discoveredAttack", "doubleCheck"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["discoveredAttack"] },
  },
  RET(20, ["enclume", "soufflet", "ramonage", "carrefour", "vanne", "porte-derobee"], "La Forge", "chaque calcul de la partie : protocole de l'Enclume répété à chaque pli ?", ["Une variante de la semaine écrite avec les coups forcés des deux camps"]),

  // ═══ Semaine 21 — L'Arsenal ═══════════════════════════════════════════════
  {
    semaine: 21, jour: 1, metaphore_id: "poudriere", theme_metaphore: "L'Arsenal — la Poudrière, deuxième étage",
    concept: "finales de dames : le roi abrité et le pion passé",
    cours:
      "La Poudrière reçoit son étage. En finale de dames, la technique gagnante a un nom simple : l'abri. Le roi attaquant se cache derrière son propre pion passé ou près de la dame adverse, là où les échecs s'arrêtent. Puis le pion avance d'un pas, et l'on recommence. Le défenseur garde sa dame aussi loin que possible du roi adverse pour multiplier les échecs. Il cherche aussi l'échange des dames quand la finale de pions qui en résulte lui est favorable. Règle de l'étage : avant chaque poussée, cherche l'abri du roi. Sans abri, ne pousse pas : chaque échec perdu est une chance de nulle pour l'adversaire.",
    ancrage_sensoriel:
      "Vois le roi qui s'accroupit derrière un tonneau de poudre pendant que les étincelles volent tout autour.",
    rappels: ["poudriere", "ronde", "cabestan"],
    focus_partie: "en finale de dames : avant chaque poussée, ton roi avait-il un abri ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire une finale de dames de la séance et marque les cases d'abri du roi attaquant contre les échecs." },
    checklist: ["Squelette désigné avant chaque solution", "Abri du roi trouvé avant chaque poussée", "Échange des dames évalué"],
    sourcing: { anyThemes: ["queenEndgame"], noThemes: ["mateIn1"], fallbackThemes: ["queenEndgame"] },
  },
  {
    semaine: 21, jour: 2, metaphore_id: "mortier", theme_metaphore: "L'Arsenal — le Mortier, deuxième étage",
    concept: "dame et tour contre dame et tour : attaques sur le roi",
    cours:
      "Le Mortier reçoit son étage. En finale de dame et tour contre dame et tour, la sécurité du roi décide tout. Un roi sans pions devant lui succombe au tir croisé de la dame et de la tour, alors qu'un pion de plus compte peu. Les motifs : la tour prend la 7e rangée ou la dernière rangée, la dame vient sur la diagonale, et souvent un échec double ou une enfilade gagne la dame adverse. Règle de l'étage : dans ces finales, avant de prendre un pion, vérifie la dernière rangée et les diagonales vers ton roi. Un luft ici n'est pas une faiblesse, c'est une assurance.",
    ancrage_sensoriel:
      "Entends deux mortiers tirer l'un après l'autre, et vois les obus se croiser au-dessus du même point.",
    rappels: ["mortier", "crypte", "broche"],
    focus_partie: "en finale de dame et tour : ta dernière rangée et tes diagonales étaient-elles sûres avant de prendre un pion ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de la séance, remonte à l'envers et indique à chaque coup la ligne de la tour et celle de la dame." },
    checklist: ["Squelette désigné avant chaque solution", "Dernière rangée vérifiée avant de prendre", "Lignes de la tour et de la dame nommées"],
    sourcing: { anyThemes: ["queenRookEndgame"], noThemes: ["mateIn1"], fallbackThemes: ["queenRookEndgame"] },
  },
  {
    semaine: 21, jour: 3, metaphore_id: "tour-sentinelle", theme_metaphore: "L'Arsenal — la Tour sentinelle, troisième étage",
    concept: "finales de tours à plusieurs pions",
    cours:
      "La Tour sentinelle reçoit son troisième étage : les finales de tours avec plusieurs pions de chaque côté, les plus fréquentes en partie. Trois principes, du plus important au moins important. L'activité de la tour : une tour active vaut souvent un pion. L'activité du roi : il doit approcher les pions, les siens et ceux de l'adversaire. Les pions passés : on les crée et on les pousse, la tour derrière. Le célèbre dicton « toutes les finales de tours sont nulles » vient de la difficulté de convertir un pion de plus quand le défenseur est actif. Règle de l'étage : en finale de tours, compte d'abord l'activité, puis le matériel. Un pion de plus avec une tour passive est souvent nul.",
    ancrage_sensoriel:
      "Vois la sentinelle qui court sur tout le chemin de ronde, de créneau en créneau, au lieu de garder une seule meurtrière.",
    rappels: ["tour-sentinelle", "roi-jardinier", "escalier"],
    focus_partie: "en finale de tours : as-tu jugé l'activité avant le matériel ?",
    reconsolidation: { type: "recitation", consigne: "Récite les trois principes des finales de tours dans l'ordre, puis applique-les à voix haute à la position du 3e puzzle reconstruite de mémoire." },
    checklist: ["Squelette désigné avant chaque solution", "Activité jugée avant le matériel", "Tour placée derrière le pion passé"],
    sourcing: { anyThemes: ["rookEndgame"], noThemes: ["mateIn1"], fallbackThemes: ["rookEndgame"] },
  },
  {
    semaine: 21, jour: 4, metaphore_id: "fosse", theme_metaphore: "L'Arsenal — la Fosse, troisième étage",
    concept: "coupures horizontales et pont",
    cours:
      "La Fosse reçoit son troisième étage : la coupure horizontale. Une tour sur une rangée empêche le roi adverse de descendre vers les pions ou de monter vers la promotion. C'est souvent plus fort qu'une coupure verticale quand le pion est encore loin. On combine ensuite avec le Pont de Lucena : coupure, avancée du pion, puis pont pour abriter le roi. Règle de l'étage : en finale de tours, demande quelle coupure garde le plus le roi adverse éloigné, verticale ou horizontale. Puis demande si elle laisse à ta tour la possibilité de construire le pont à la fin.",
    ancrage_sensoriel:
      "Penche-toi sur une fosse qui court d'un côté à l'autre du champ, et vois le roi adverse qui ne peut plus descendre vers la vallée.",
    rappels: ["fosse", "pont-lucena", "tour-sentinelle"],
    focus_partie: "en finale de tours : as-tu envisagé une coupure horizontale ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la position d'un puzzle de la séance, trace la coupure (verticale ou horizontale) et explique pourquoi c'était la meilleure." },
    checklist: ["Squelette désigné avant chaque solution", "Coupure verticale et horizontale comparées", "Pont envisagé à la fin de la coupure"],
    sourcing: { anyThemes: ["rookEndgame"], noThemes: ["mateIn1"], geometry: "cutOff", fallbackThemes: ["rookEndgame"] },
  },
  {
    semaine: 21, jour: 5, metaphore_id: "pont-lucena", theme_metaphore: "L'Arsenal — le Pont de Lucena, deuxième étage",
    concept: "convertir tour + pion : Lucena et les positions voisines",
    cours:
      "Le Pont de Lucena reçoit son étage. On connaît la position clé : roi devant son pion en 7e, roi adverse coupé, et la tour qui monte en 4e rangée pour bâtir le pont. À l'étage, on apprend à y arriver depuis des positions plus lointaines. On garde la coupure, on avance le pion avec l'aide du roi, et l'on évite les échecs latéraux en plaçant le roi du bon côté. Les positions sans pont (pion de bande, roi défenseur devant) sont souvent nulles, et il faut les reconnaître pour ne pas perdre de temps. Règle de l'étage : avant la dernière poussée, vérifie les trois conditions du pont. Roi devant le pion, roi adverse coupé, tour capable d'atteindre la 4e rangée.",
    ancrage_sensoriel:
      "Vois l'arche de la tour se poser en travers du fossé, et le roi qui passe dessous, à l'abri de la pluie d'échecs.",
    rappels: ["pont-lucena", "fosse", "rempart-philidor"],
    focus_partie: "en finale de tour + pion : les trois conditions du pont étaient-elles réunies ?",
    reconsolidation: { type: "recitation", consigne: "Récite les trois conditions du pont de Lucena, puis rejoue de mémoire la construction du pont dans un puzzle de la séance." },
    checklist: ["Squelette désigné avant chaque solution", "Trois conditions du pont vérifiées", "Positions sans pont reconnues"],
    sourcing: { anyThemes: ["rookEndgame"], noThemes: ["mateIn1"], geometry: "lucenaLike", fallbackThemes: ["rookEndgame"] },
  },
  {
    semaine: 21, jour: 6, metaphore_id: "rempart-philidor", theme_metaphore: "L'Arsenal — le Rempart de Philidor, troisième étage",
    concept: "défenses actives en finale de tours",
    cours:
      "Le Rempart de Philidor reçoit son troisième étage : la défense active. Une tour défenseuse passive (devant le pion, sur sa dernière rangée) perd souvent ; une tour active (échecs de loin, attaque des pions par derrière) sauve des finales avec un pion, parfois deux, de moins. La règle de Tarrasch s'applique aussi au défenseur : la tour derrière le pion passé adverse, pour l'attaquer pendant qu'il avance. Règle de l'étage : en défense, chaque coup de tour doit répondre à « est-ce que j'attaque quelque chose ? ». Si la réponse est non trois fois de suite, la position glisse vers la défaite.",
    ancrage_sensoriel:
      "Sens le défenseur qui saute du rempart et court frapper l'ennemi par derrière, au lieu d'attendre derrière le parapet.",
    rappels: ["rempart-philidor", "ronde", "tour-sentinelle"],
    focus_partie: "en défense de tours : combien de coups de suite ta tour n'a-t-elle rien attaqué ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de défense de la séance, remonte à l'envers et dis, pour chaque coup de tour défenseuse, ce qu'elle attaquait." },
    checklist: ["Squelette désigné avant chaque solution", "Chaque coup de tour défenseuse attaque quelque chose", "Tour derrière le pion passé adverse"],
    sourcing: { anyThemes: ["rookEndgame", "defensiveMove"], noThemes: ["mateIn1"], geometry: "philidorLike", fallbackThemes: ["rookEndgame"] },
  },
  RET(21, ["poudriere", "mortier", "tour-sentinelle", "fosse", "pont-lucena", "rempart-philidor"], "L'Arsenal", "si ta partie entre en finale de pièces lourdes : activité jugée avant le matériel ?", ["Une finale de tours de la semaine analysée avec les trois principes"]),

  // ═══ Semaine 22 — Le Tour de la Cité (synthèse et bilan de phase) ═════════
  {
    semaine: 22, jour: 1, metaphore_id: "lunette", theme_metaphore: "Le Tour de la Cité — retour à l'Observatoire",
    concept: "synthèse : évaluer, puis choisir un plan",
    cours:
      "Dernière semaine de la phase 3 : le Tour de la Cité. Aucun lieu neuf. Aujourd'hui, l'Observatoire. Les puzzles du jour commencent dans des positions calmes. Le protocole complet : régler la Lunette (six cercles), consulter la Balance si le matériel est déséquilibré, trouver la Girouette (ta pièce la plus mal placée), puis seulement chercher le coup. Ce n'est pas plus lent : c'est le chemin le plus court vers le bon coup, parce qu'il élimine les plans qui ne correspondent pas à la position. Le squelette du jour : le déséquilibre principal et la case où il s'exprime.",
    ancrage_sensoriel:
      "Remonte l'escalier de l'Observatoire et retrouve les sensations : les molettes de la lunette, le laiton de la balance, la girouette qui grince.",
    rappels: ["lunette", "balance", "girouette", "deux-vitraux", "vitrail"],
    focus_partie: "dans les moments calmes : as-tu suivi le protocole de l'Observatoire avant de chercher le coup ?",
    reconsolidation: { type: "recitation", consigne: "Récite le protocole de l'Observatoire, puis applique-le à voix haute à deux puzzles de la séance reconstruits de mémoire." },
    checklist: ["Squelette désigné avant chaque solution", "Protocole de l'Observatoire suivi", "Plan en une phrase après chaque évaluation"],
    sourcing: { anyThemes: ["quietMove", "advantage"], allThemes: ["middlegame"], noThemes: ["mateIn1", "mateIn2", "opening"], fallbackThemes: ["quietMove"] },
  },
  {
    semaine: 22, jour: 2, metaphore_id: "registre", theme_metaphore: "Le Tour de la Cité — retour à la Bibliothèque",
    concept: "synthèse : structure, espace et plan",
    cours:
      "Deuxième jour : la Bibliothèque. Chaque puzzle commence dans une structure : Carlsbad, pion isolé, pions pendants, chaîne, blocus, espace. Avant de chercher le coup, ouvre le bon volume : nomme la structure et ses deux plans typiques. Puis cherche la tactique qui sert le plan choisi. C'est la leçon de la phase 3 : on ne retient pas les ouvertures comme des listes de coups, on retient les structures qu'elles produisent, et chaque structure renvoie à deux plans. Le squelette du jour : la faiblesse de la structure et la rupture qui l'attaque ou la défend.",
    ancrage_sensoriel:
      "Parcours les rayonnages de la Bibliothèque du doigt et sens, sur chaque tranche, le relief d'une structure de pions gravée.",
    rappels: ["registre", "sape", "phare", "pont-suspendu", "ecluse"],
    focus_partie: "après l'ouverture de ta partie : quel volume de la Bibliothèque, quels deux plans ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Pour deux puzzles, dessine de mémoire la structure de pions seule, nomme-la et écris ses deux plans typiques." },
    checklist: ["Squelette désigné avant chaque solution", "Structure et deux plans nommés", "Plan de la structure suivi dans ma partie"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "hangingPawns", fallbackThemes: ["middlegame"] },
  },
  {
    semaine: 22, jour: 3, metaphore_id: "echafaudage", theme_metaphore: "Le Tour de la Cité — retour au Chantier",
    concept: "synthèse : prophylaxie et défense",
    cours:
      "Troisième jour : le Chantier. Les puzzles du jour demandent d'empêcher plutôt que de frapper. Coup prophylactique (l'Échafaudage), coup tranquille au milieu d'une ligne (la Trempe), restriction des pièces adverses (la Cage), défense précise dans une ligne longue (la Poterne), contre-attaque (la Contre-mine), forteresse ou perpétuel (la Ronde). Le protocole commun commence par la question de l'Échafaudage : que veut l'adversaire ? Puis celle de la Poterne : quelles défenses existent ? Et celle de la Contre-mine : ai-je une menace plus forte ? Ce jour compte pour le bilan de phase.",
    ancrage_sensoriel:
      "Repasse sous l'échafaudage du chantier, entends le serrage des colliers, puis le froid de la poterne et les pas de la ronde.",
    rappels: ["echafaudage", "trempe", "cage", "poterne", "contre-mine"],
    focus_partie: "avant chaque coup calme : la question de l'Échafaudage, posée ou oubliée ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour le puzzle défensif le plus difficile, remonte à l'envers et nomme, à chaque coup, la question du Chantier qui menait au bon coup." },
    checklist: ["Squelette désigné avant chaque solution", "Plan adverse formulé à chaque position", "Défenses listées avant de jouer"],
    sourcing: { anyThemes: ["defensiveMove", "quietMove", "equality"], noThemes: ["mateIn1"], fallbackThemes: ["defensiveMove"] },
  },
  {
    semaine: 22, jour: 4, metaphore_id: "balance", theme_metaphore: "Le Tour de la Cité — retour au Port",
    concept: "synthèse : finales de pièces mineures",
    cours:
      "Quatrième jour : le Port. Finales de cavaliers, de fous, de fous opposés et de tour contre pièce mineure. Pour chacune, la question du quai correspondant. La Jetée : combien de sauts ? Le Fanal : quelle couleur pour les pions ? Les Deux Fanaux : à quelle distance sont les pions passés ? La Balance : les pions du défenseur sont-ils groupés ? L'Allée éloignée et la Brèche rappellent que les pions passés décident souvent tout. Le squelette du jour : la case de promotion et la case critique du défenseur.",
    ancrage_sensoriel:
      "Longe le port à la tombée du jour : la jetée qui tangue, les deux fanaux qui s'allument, la balance sur le quai.",
    rappels: ["balance", "jetee", "fanal", "deux-fanaux", "allee-eloignee"],
    focus_partie: "si ta partie arrive en finale : quelle question du Port as-tu posée en premier ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire une finale de la séance et marque la case de promotion et la case critique du défenseur." },
    checklist: ["Squelette désigné avant chaque solution", "Question du quai posée à chaque finale", "Pions passés comptés et mesurés"],
    sourcing: { anyThemes: ["knightEndgame", "bishopEndgame", "endgame"], noThemes: ["mateIn1"], fallbackThemes: ["endgame"] },
  },
  {
    semaine: 22, jour: 5, metaphore_id: "sape", theme_metaphore: "Le Tour de la Cité — la Sape et la Citadelle",
    concept: "synthèse : du plan à l'attaque",
    cours:
      "Cinquième jour : du Faubourg à la Citadelle. Les puzzles du jour montrent comment un plan positionnel se termine en attaque. La minorité crée une faiblesse, la faiblesse attire les pièces, et les pièces déplacées laissent le roi seul. Ou bien la chaîne pointe vers le roi, le bélier frappe, la herse tombe. Le protocole : nommer le plan (Bibliothèque), voir le moment où la position bascule (les pièces adverses sont loin du roi), puis passer au protocole d'attaque de la Citadelle (fuites fermées, pièces lentes d'abord, figure finale). Le squelette : la faiblesse de départ et la case de l'attaque finale.",
    ancrage_sensoriel:
      "Sens le sol de la galerie de sape remonter en pente douce, jusqu'à déboucher sous la cour de la Citadelle.",
    rappels: ["sape", "muraille", "belier", "herse", "trebuchet"],
    focus_partie: "dans ta partie, à quel moment le plan positionnel est-il devenu une attaque ?",
    reconsolidation: { type: "recitation", consigne: "Pour un puzzle de la séance, raconte à voix haute l'histoire de la position : la faiblesse, le moment de bascule, l'attaque." },
    checklist: ["Squelette désigné avant chaque solution", "Moment de bascule identifié", "Protocole d'attaque suivi après la bascule"],
    sourcing: { anyThemes: ["kingsideAttack", "sacrifice"], allThemes: ["middlegame"], noThemes: ["mateIn1", "opening"], fallbackThemes: ["kingsideAttack"] },
  },
  {
    semaine: 22, jour: 6, metaphore_id: "girouette", theme_metaphore: "Le Tour de la Cité — la Girouette et la Forge",
    concept: "synthèse : calcul au service du plan",
    cours:
      "Dernier jour de concept de la phase 3. Les puzzles du jour sont longs, dans des positions où le bon coup sert un plan : une pièce mal placée qui revient avec tempo, un coup calme qui améliore et menace à la fois, une combinaison qui finit sur une case du Sanctuaire. C'est la synthèse de l'Observatoire et de la Forge. On calcule (Enclume, Soufflet), mais l'on sait d'avance ce que l'on cherche, grâce à la Lunette et à la Girouette. Demain, le bilan : la rétention et la réussite de cette semaine décident du passage à la phase 4.",
    ancrage_sensoriel:
      "Vois la girouette dégrippée tourner au vent, et en bas, la forge qui s'allume : le plan donne la direction, le calcul donne la force.",
    rappels: ["girouette", "lunette", "enclume", "soufflet", "trempe"],
    focus_partie: "dans tes calculs : savais-tu, avant de calculer, quel plan le coup devait servir ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour le puzzle le plus long, remonte à l'envers et dis, à chaque coup, quel élément du plan il servait." },
    checklist: ["Squelette désigné avant chaque solution", "Plan nommé avant de calculer", "Pièce mal placée améliorée avec tempo"],
    sourcing: { anyThemes: ["long", "quietMove"], noThemes: ["mateIn1", "mateIn2", "opening"], fallbackThemes: ["long"] },
  },
  RET(22, ["lunette", "registre", "echafaudage", "balance", "sape", "girouette"], "Le Tour de la Cité", "chaque lieu du palais rencontré, tous quartiers confondus : c'est le bilan de la phase 3.", ["Bilan écrit de la phase 3 : trois lieux maîtrisés, trois lieux à renforcer"], { phase: 3, suivante: "la phase 4 (2100 → 2250)" }),
];

/** Aucune position construite en phase 3 : tout vient du dump Lichess, vérifié par Stockfish. */
export const PHASE_3_CONSTRUCTED: readonly ConstructedPosition[] = [];
