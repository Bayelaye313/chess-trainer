import { retentionDay as RET } from "./retention-day";
import type { ConstructedPosition, DaySpec } from "./spec-types";

/**
 * Phase 2 — 1700 → 1900 : tactique avancée, finales techniques (semaines 8 à 14).
 *
 * Parcours du palais : la Forge (calcul tactique) → le Bastion (défense) → le
 * Port (finales de pièces mineures) → l'Arsenal (finales de pièces lourdes) →
 * le Faubourg (structures de pions du milieu de jeu) → la Citadelle (attaque
 * avancée) → le Tour de la Cité (semaine de synthèse et bilan de phase).
 *
 * Méthode : chaque concept est un LIEU (mémoire spatiale) relié à un lieu déjà
 * bâti (chunking) ; aucune variante à apprendre par cœur, on retient une image,
 * une règle et un squelette de cases. Les lieux de la phase 1 reçoivent un
 * nouvel étage (même image, règle approfondie) plutôt qu'un nouveau nom.
 *
 * Texte seulement : les puzzles sont tirés par le générateur à partir de
 * `sourcing`, filtrés sur l'échiquier (`geometry`) et vérifiés par Stockfish.
 */

export const PHASE_2_DAYS: readonly DaySpec[] = [
  // ═══ Semaine 8 — La Forge ═════════════════════════════════════════════════
  {
    semaine: 8, jour: 1, metaphore_id: "enclume", theme_metaphore: "La Forge — l'Enclume",
    concept: "coups forcés : échecs, prises, menaces",
    cours:
      "Tu quittes les Remparts de la Tour et tu descends vers la Forge, où l'on fabrique le calcul. Au centre, l'enclume. Sur elle, on frappe d'abord là où le métal ne peut que plier : les coups forcés. Un échec ne laisse que deux ou trois réponses, une prise exige presque toujours une reprise, une menace de mat ou de gain ne laisse qu'une défense. La règle de l'enclume : dans une position tactique, tu examines TOUJOURS dans cet ordre les échecs, puis les prises, puis les menaces, pour les deux camps. Moins l'adversaire a de réponses, plus loin tu peux calculer sans te perdre. Lien avec la Pierre descellée : la plupart des coups forcés frappent une pièce non défendue ou un roi exposé.",
    ancrage_sensoriel:
      "Entends le son clair du marteau sur l'enclume, trois coups secs : échec, prise, menace. Sens la chaleur du métal sur ton visage à chaque frappe.",
    rappels: ["pierre-descellee", "carrefour"],
    focus_partie: "à chaque coup adverse, liste à voix basse ses échecs, ses prises et ses menaces avant de penser à ton plan.",
    reconsolidation: { type: "recitation", consigne: "Pour le puzzle le plus long de la séance, récite sans écran tous les échecs, prises et menaces de la position de départ, dans l'ordre de l'enclume, puis indique lequel était la solution." },
    checklist: ["Squelette désigné avant chaque solution", "Échecs, prises, menaces listés avant chaque puzzle", "L'ordre de l'enclume appliqué dans ma partie"],
    sourcing: { anyThemes: ["long"], noThemes: ["opening", "mateIn1", "mateIn2"], fallbackThemes: ["advantage", "crushing"] },
  },
  {
    semaine: 8, jour: 2, metaphore_id: "soufflet", theme_metaphore: "La Forge — le Soufflet",
    concept: "le coup intermédiaire (zwischenzug)",
    cours:
      "À côté de l'enclume pend un grand soufflet de cuir. Entre deux coups de marteau, le forgeron donne un coup de soufflet : le feu se ravive, et la frappe suivante porte deux fois plus. Sur l'échiquier, c'est le coup intermédiaire. L'adversaire prend, tout le monde attend la reprise, et toi tu intercales d'abord un échec, une menace ou une prise plus forte, puis tu reprends. Règle du soufflet : avant toute reprise « évidente », demande-toi s'il existe un coup forcé qui améliore ta position sans que la reprise disparaisse. Le piège inverse existe aussi : l'adversaire peut souffler, lui aussi. Lien avec l'Enclume : le coup de soufflet est presque toujours un coup forcé.",
    ancrage_sensoriel:
      "Sens le cuir du soufflet se gonfler sous tes mains et le souffle d'air chaud qui fait rougir la braise juste avant la frappe.",
    rappels: ["enclume", "porte-derobee"],
    focus_partie: "chaque fois que tu t'apprêtes à reprendre une pièce : y avait-il un coup intermédiaire, pour toi ou pour lui ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pars de la position finale du 3e puzzle et remonte la combinaison à l'envers, à voix haute. Arrête-toi sur le coup intermédiaire et explique ce qui se passait si l'on reprenait tout de suite." },
    checklist: ["Squelette désigné avant chaque solution", "Reprise évidente remise en question à chaque puzzle", "Un coup intermédiaire cherché dans ma partie"],
    sourcing: { anyThemes: ["intermezzo"], noThemes: ["mateIn1"], fallbackThemes: ["intermezzo"] },
  },
  {
    semaine: 8, jour: 3, metaphore_id: "trempe", theme_metaphore: "La Forge — la Trempe",
    concept: "le coup tranquille",
    cours:
      "Au fond de la Forge, le bac de trempe. La lame rougie plonge dans l'eau : aucun choc, juste un sifflement, et pourtant le métal change de nature. Le coup tranquille, c'est cela : ni échec, ni prise, ni menace directe, mais après lui l'adversaire ne peut plus parer. Il ferme une case de fuite, retire un défenseur de la ligne de tir, ou prépare un mat imparable. Règle de la trempe : quand les coups forcés de l'enclume ne donnent rien, cherche le coup qui laisse l'adversaire au trait sans aucun bon coup. C'est le coup que l'œil humain voit le moins, parce qu'il ne fait pas de bruit. Lien avec la Cage : on ferme souvent la porte en silence avant de prendre l'oiseau.",
    ancrage_sensoriel:
      "Entends le long sifflement de la lame dans l'eau, puis le silence ; sens la vapeur tiède remonter sur tes mains.",
    rappels: ["enclume", "cage"],
    focus_partie: "dans les positions où rien n'est forcé : quel coup calme améliore une pièce ou retire une case à l'adversaire ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la position du puzzle au coup tranquille, entoure la case ou la ligne que ce coup a fermée, puis compare à l'écran." },
    checklist: ["Squelette désigné avant chaque solution", "Coups forcés examinés AVANT de chercher le coup tranquille", "Un coup calme utile trouvé dans ma partie"],
    sourcing: { anyThemes: ["quietMove"], noThemes: ["mateIn1"], fallbackThemes: ["quietMove"] },
  },
  {
    semaine: 8, jour: 4, metaphore_id: "ramonage", theme_metaphore: "La Forge — le Ramonage",
    concept: "le dégagement (clearance)",
    cours:
      "La cheminée de la Forge tire mal : sa propre suie la bouche. On la ramone, et le feu monte d'un coup. Sur l'échiquier, ta propre pièce bouche une ligne ou une case dont une autre de tes pièces a besoin. Le dégagement la retire, idéalement avec tempo (un échec, une prise, une menace), pour que l'adversaire n'ait pas le temps de reboucher. Règle du ramonage : quand une case clé ou une ligne de mat est occupée par l'une de TES pièces, demande-toi comment la faire partir avec gain de temps. Le sacrifice de dégagement est fréquent : la pièce qui part se donne pour ouvrir le conduit. Lien avec le Canon : on dégage souvent la pièce de devant pour que la poudre frappe.",
    ancrage_sensoriel:
      "Sens la suie noire qui tombe quand le hérisson du ramoneur passe, puis l'appel d'air brutal qui fait rugir le feu.",
    rappels: ["canon", "porte-derobee"],
    focus_partie: "repère dans ta partie une de tes pièces qui gênait une autre : comment aurais-tu pu la déplacer avec tempo ?",
    reconsolidation: { type: "recitation", consigne: "Récite les quatre lieux de la Forge vus jusqu'ici (Enclume, Soufflet, Trempe, Ramonage) : image, règle, et pour le Ramonage la pièce qui bouchait le conduit dans le 2e puzzle." },
    checklist: ["Squelette désigné avant chaque solution", "Pièce qui bouche la ligne nommée à chaque puzzle", "Un dégagement envisagé dans ma partie"],
    sourcing: { anyThemes: ["clearance"], noThemes: ["mateIn1"], fallbackThemes: ["clearance"] },
  },
  {
    semaine: 8, jour: 5, metaphore_id: "vanne", theme_metaphore: "La Forge — la Vanne",
    concept: "l'interception",
    cours:
      "Le moulin de la Forge est alimenté par un canal. Abaisse la vanne, et l'eau cesse d'arriver : le moulin s'arrête. Sur l'échiquier, deux pièces adverses communiquent par une ligne : une tour défend sa dernière rangée depuis l'autre bout, un fou garde une case de promotion. L'interception pose une pièce sur cette ligne, souvent en sacrifice, et coupe la liaison. Quelle que soit la prise, une des deux défenses tombe. Règle de la vanne : quand une pièce adverse défend quelque chose à distance, trace la ligne entre elle et ce qu'elle défend, et cherche la case d'intersection. Lien avec le Pilier surchargé : la vanne est une autre façon de faire céder un défenseur sans le prendre.",
    ancrage_sensoriel:
      "Entends le grincement de la vanne de fer qui descend, puis le silence soudain de la roue du moulin qui s'arrête.",
    rappels: ["pilier-surcharge", "crypte"],
    focus_partie: "les défenses à distance dans ta partie (tour, fou, dame) : y avait-il une case pour couper la ligne ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la position du puzzle le plus difficile, trace en couleur la ligne de défense adverse et marque la case de la vanne." },
    checklist: ["Squelette désigné avant chaque solution", "Ligne de défense à distance tracée à chaque puzzle", "Une interception cherchée dans ma partie"],
    sourcing: { anyThemes: ["interference"], noThemes: ["mateIn1"], fallbackThemes: ["interference", "deflection"] },
  },
  {
    semaine: 8, jour: 6, metaphore_id: "pilier-surcharge", theme_metaphore: "La Forge — le Pilier surchargé, deuxième étage",
    concept: "combinaisons à deux motifs : déviation et attraction",
    cours:
      "Tu retournes à l'Atelier du Charpentier, au Pilier surchargé, et tu montes au deuxième étage. En bas, tu avais appris un motif : dévier ou abattre le défenseur. À l'étage, les combinaisons en enchaînent deux. On attire une pièce sur une case (Pont-levis), puis on la dévie ; on dévie un défenseur, puis on frappe la case qu'il gardait par une fourchette (Carrefour). Règle de l'étage : nomme le PREMIER motif, puis demande ce qu'il crée. Une case libérée ? Une pièce attirée sur une case de fourchette ? Un roi tiré hors de sa crypte ? Le squelette d'une combinaison à deux temps tient en deux cases : celle du premier coup et celle du coup décisif. C'est ce couple qu'on retient, pas la suite de coups.",
    ancrage_sensoriel:
      "Sens le plancher de l'étage craquer sous tes pieds pendant que le pilier, en dessous, se tord sous la double charge.",
    rappels: ["pont-levis", "carrefour", "enclume"],
    focus_partie: "après chaque gain de matériel dans ta partie : quel premier coup l'avait rendu possible ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour deux puzzles de la séance, pars du coup décisif et remonte au premier motif. Nomme les deux cases du squelette : celle du premier coup, celle du coup décisif." },
    checklist: ["Squelette désigné avant chaque solution", "Les deux motifs nommés à chaque combinaison", "Une combinaison à deux temps cherchée dans ma partie"],
    sourcing: { anyThemes: ["deflection", "attraction"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["deflection", "attraction"] },
  },
  RET(8, ["enclume", "soufflet", "trempe", "ramonage", "vanne", "pilier-surcharge"], "La Forge", "chaque position critique de la partie : ai-je suivi l'ordre de l'enclume ?", ["Les 5 lieux de la Forge récités sans erreur"]),

  // ═══ Semaine 9 — Le Bastion ═══════════════════════════════════════════════
  {
    semaine: 9, jour: 1, metaphore_id: "poterne", theme_metaphore: "Le Bastion — la Poterne",
    concept: "le seul coup défensif",
    cours:
      "Le Bastion se dresse au bord de la Cité. Ici, on apprend à tenir. Dans la muraille assiégée s'ouvre une poterne, une petite porte basse et cachée, la seule par où l'on peut encore sortir. Sous une menace sérieuse, la plupart des coups perdent. Un seul, parfois deux, sauve la partie. Règle de la poterne : quand l'adversaire menace, ne cherche pas un bon coup, cherche le coup UNIQUE. Liste toutes les défenses (fuir, interposer, prendre l'attaquant, contre-menacer) et élimine-les une à une. Celle qui reste est la poterne. Les puzzles défensifs se ratent surtout par impatience : on joue la première défense vue. Lien avec l'Enclume : pour trouver la poterne, on calcule d'abord les coups forcés de l'adversaire.",
    ancrage_sensoriel:
      "Sens le froid humide du passage bas de la poterne, et baisse la tête : ta main frôle le linteau de pierre en passant.",
    rappels: ["enclume", "donjon-eventre"],
    focus_partie: "chaque menace adverse sérieuse : as-tu listé toutes les défenses avant de choisir ?",
    reconsolidation: { type: "recitation", consigne: "Pour le 4e puzzle, récite à voix haute les quatre familles de défense (fuir, interposer, prendre, contre-menacer), et explique pourquoi chacune sauf la poterne échouait." },
    checklist: ["Squelette désigné avant chaque solution", "Toutes les défenses listées avant de jouer", "Aucun coup défensif joué « au premier coup d'œil » dans ma partie"],
    sourcing: { anyThemes: ["defensiveMove"], noThemes: ["mateIn1"], fallbackThemes: ["defensiveMove"] },
  },
  {
    semaine: 9, jour: 2, metaphore_id: "ronde", theme_metaphore: "Le Bastion — la Ronde perpétuelle",
    concept: "sauver la nulle : échec perpétuel et ressources d'égalité",
    cours:
      "Sur le chemin de ronde, un guetteur tourne autour du donjon ennemi, sans fin. Il ne prend rien, mais l'ennemi ne peut jamais dormir. C'est l'échec perpétuel : une position perdue devient nulle parce que le roi adverse ne peut échapper à la ronde. Autres ressources de la même famille : le pat, la forteresse, la répétition forcée. Règle de la ronde : quand tu es perdu en matériel, cherche si le roi adverse a deux ou trois cases seulement, toutes atteignables par ta dame ou ta tour en échec. Un demi-point sauvé vaut autant qu'un demi-point gagné. Lien avec le Donjon éventré : un roi exposé est une cible pour le mat, mais aussi pour la ronde du défenseur.",
    ancrage_sensoriel:
      "Entends les pas réguliers du guetteur qui passent et repassent sur les pavés du chemin de ronde, toujours au même rythme.",
    rappels: ["poterne", "donjon-eventre"],
    focus_partie: "dans une position difficile : as-tu cherché un échec perpétuel ou un pat avant d'abandonner l'idée de nulle ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire le parcours de la ronde dans un puzzle de la séance : les cases du roi adverse et les cases d'où ta pièce le met en échec." },
    checklist: ["Squelette désigné avant chaque solution", "Cases de fuite du roi adverse comptées", "Ressource de nulle cherchée dans une position difficile"],
    sourcing: { anyThemes: ["equality"], noThemes: ["mateIn1"], fallbackThemes: ["equality", "defensiveMove"] },
  },
  {
    semaine: 9, jour: 3, metaphore_id: "contre-mine", theme_metaphore: "Le Bastion — la Contre-mine",
    concept: "la contre-attaque : répondre à une menace par une menace",
    cours:
      "Sous le Bastion, l'assiégeant creuse une mine pour faire sauter le mur. L'assiégé ne la bouche pas : il creuse une contre-mine qui arrive la première sous le camp ennemi. Sur l'échiquier, quand l'adversaire menace, la meilleure défense est parfois une menace plus grave : un échec, une attaque sur la dame, un mat. Il doit y répondre, et ta propre menace reste en jeu. Règle de la contre-mine : compare les vitesses. Si ta menace arrive plus tôt ou plus fort, ou si elle se défend en même temps qu'elle attaque, elle passe avant la défense passive. C'est le cousin défensif du Soufflet : un coup intercalé, mais pour sauver. Lien avec la Poterne : la contre-attaque est l'une des quatre défenses à toujours lister.",
    ancrage_sensoriel:
      "Sens la terre trembler sous tes pieds dans la galerie étroite, et entends, de l'autre côté de la paroi, les coups de pioche de l'ennemi.",
    rappels: ["soufflet", "poterne"],
    focus_partie: "chaque fois que tu as défendu passivement : une contre-menace aurait-elle été plus forte ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Reprends un puzzle de contre-attaque : depuis la position finale, remonte à l'envers et, pour chaque coup, dis quelle menace l'adversaire devait parer." },
    checklist: ["Squelette désigné avant chaque solution", "Vitesse des deux menaces comparée", "Une contre-menace envisagée dans ma partie"],
    sourcing: { anyThemes: ["intermezzo", "defensiveMove"], noThemes: ["mateIn1", "mateIn2"], fallbackThemes: ["defensiveMove"] },
  },
  {
    semaine: 9, jour: 4, metaphore_id: "crypte", theme_metaphore: "Le Bastion — la Crypte, deuxième étage",
    concept: "dernière rangée : combinaisons en plusieurs temps",
    cours:
      "Tu reviens à la Crypte scellée de la Cathédrale, mais par l'escalier du dessous. En phase 1, la dalle se scellait en un coup. Ici, il faut d'abord éloigner ou surcharger le gardien de la dernière rangée, puis sceller : déviation de la tour qui garde, attraction de la dame sur une case prise, interception de la ligne de défense par la Vanne. Règle de l'étage : compte les gardiens de la dalle, puis demande ce que chacun a d'autre à faire. Un gardien qui a deux tâches est un Pilier surchargé. Et retourne la question : ta propre dalle a-t-elle un luft ? Un défenseur qui oublie son luft perd des parties qu'il croyait gagnées.",
    ancrage_sensoriel:
      "Descends à tâtons l'escalier de pierre, sens l'odeur de cire froide, et entends la dalle qui frotte quand on commence à la pousser.",
    rappels: ["vanne", "pilier-surcharge", "crypte"],
    focus_partie: "à chaque échange de pièces lourdes, compte les gardiens de ta dernière rangée et de la sienne.",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine la crypte du 2e puzzle : roi, pions, gardiens de la dalle. Numérote les gardiens dans l'ordre où la combinaison les a fait céder." },
    checklist: ["Squelette désigné avant chaque solution", "Gardiens de la dernière rangée comptés", "Luft vérifié dans ma partie"],
    sourcing: { anyThemes: ["backRankMate"], noThemes: ["mateIn1"], fallbackThemes: ["backRankMate", "mateIn2"] },
  },
  {
    semaine: 9, jour: 5, metaphore_id: "cage", theme_metaphore: "Le Bastion — la Cage, deuxième étage",
    concept: "piéger une pièce en plusieurs temps",
    cours:
      "Retour à la Cage de l'Atelier. En phase 1, la pièce était déjà enfermée et il suffisait de venir la prendre. À l'étage, on construit la cage. Un coup tranquille ferme une case de fuite (la Trempe), un pion avance pour en fermer une autre, puis l'on attaque l'oiseau qui n'a plus de branche. Les cibles classiques : un fou enfermé par une chaîne de pions, une dame partie chercher un pion lointain, un cavalier sur la bande. Règle de l'étage : avant d'attaquer une pièce, compte ses cases de fuite. S'il en reste une, trouve d'abord le coup qui la ferme. La défense est la même règle à l'envers : une pièce qui n'a plus qu'une case est déjà en danger.",
    ancrage_sensoriel:
      "Entends le petit clic de la porte de la cage qui se referme, puis le battement d'ailes affolé de l'oiseau qui cherche une sortie.",
    rappels: ["trempe", "cage"],
    focus_partie: "repère dans ta partie la pièce (à toi ou à lui) qui avait le moins de cases de fuite.",
    reconsolidation: { type: "recitation", consigne: "Pour deux puzzles, récite les cases de fuite de la pièce piégée et le coup qui a fermé la dernière, sans regarder l'écran." },
    checklist: ["Squelette désigné avant chaque solution", "Cases de fuite comptées avant l'attaque", "Aucune de mes pièces sans case de fuite dans ma partie"],
    sourcing: { anyThemes: ["trappedPiece"], noThemes: ["mateIn1"], fallbackThemes: ["trappedPiece", "quietMove"] },
  },
  {
    semaine: 9, jour: 6, metaphore_id: "porte-derobee", theme_metaphore: "Le Bastion — la Porte dérobée, deuxième étage",
    concept: "découverte et échec double en séquence",
    cours:
      "La Porte dérobée de l'Atelier a un étage secret. En phase 1, une seule porte s'ouvrait. Ici, la pièce qui s'écarte devient elle-même un attaquant : elle donne un échec, prend une pièce ou menace pendant que la pièce de derrière frappe. C'est le moulin quand on répète l'opération : échec à la découverte, l'adversaire pare, la pièce revient, et l'on recommence en ramassant du matériel. Règle de l'étage : quand tu as une batterie cachée (pièce devant, pièce lourde ou fou derrière, roi adverse au bout), cherche la case où la pièce de devant fait le plus de dégâts. Pour ta défense, repère les batteries ennemies pointées sur ton roi, même masquées par tes propres pièces.",
    ancrage_sensoriel:
      "Sens le panneau de bois pivoter sous ta paume et le courant d'air froid du couloir secret, puis un second panneau qui s'ouvre plus loin.",
    rappels: ["porte-derobee", "canon", "soufflet"],
    focus_partie: "toutes les batteries cachées de la partie, les tiennes et les siennes, notées au moment où elles se forment.",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine la batterie cachée du puzzle le plus long : pièce de devant, pièce de derrière, cible. Ajoute en couleur la case où la pièce de devant a frappé." },
    checklist: ["Squelette désigné avant chaque solution", "Batteries cachées repérées dans chaque position", "Batterie ennemie sur mon roi vérifiée dans ma partie"],
    sourcing: { anyThemes: ["discoveredAttack", "doubleCheck"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["discoveredAttack", "doubleCheck"] },
  },
  RET(9, ["poterne", "ronde", "contre-mine", "crypte", "cage", "porte-derobee"], "Le Bastion", "chaque moment où tu as dû défendre : quelle porte du Bastion as-tu prise ?", ["Les 3 lieux du Bastion et les 3 étages revisités récités sans erreur"]),

  // ═══ Semaine 10 — Le Port ═════════════════════════════════════════════════
  {
    semaine: 10, jour: 1, metaphore_id: "jetee", theme_metaphore: "Le Port — la Jetée",
    concept: "le cavalier en finale",
    cours:
      "Au pied de la Cité s'étend le Port, le quartier des finales de pièces mineures. La première jetée avance en zigzag dans l'eau : on la parcourt lentement, mais elle touche des quais des deux couleurs. C'est le cavalier en finale. Il est lent à traverser l'échiquier, il a du mal contre un pion passé de bande, mais de près il fourche, bloque et attaque des cases des deux couleurs. Trois règles de la jetée. Le cavalier aime les positions où les pions sont sur une seule aile. Il arrête mal un pion de la colonne a ou h. Et la case devant un pion passé adverse est sa place idéale de bloqueur. Lien avec le Carrefour : en finale, la fourchette du cavalier tue souvent plus de pions que de pièces.",
    ancrage_sensoriel:
      "Sens les planches de la jetée qui tanguent sous tes pas, à gauche, à droite, à gauche, et l'odeur d'algue et de sel.",
    rappels: ["carrefour", "sanctuaire"],
    focus_partie: "si ta partie arrive en finale avec un cavalier : était-il près des pions, ou loin sur la mauvaise aile ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire le chemin du cavalier dans un puzzle de la séance, case par case, et marque les cases des deux couleurs qu'il a touchées." },
    checklist: ["Squelette désigné avant chaque solution", "Distance du cavalier aux pions évaluée", "Cases de bloqueur repérées dans ma partie"],
    sourcing: { anyThemes: ["knightEndgame"], noThemes: ["mateIn1"], fallbackThemes: ["knightEndgame", "endgame"] },
  },
  {
    semaine: 10, jour: 2, metaphore_id: "fanal", theme_metaphore: "Le Port — le Fanal",
    concept: "le fou en finale, bon fou contre mauvais fou",
    cours:
      "Au bout du quai, un fanal tourne et éclaire très loin, mais d'une seule couleur. En finale, le fou couvre les deux ailes à la fois : il surveille un pion passé à un bout et défend à l'autre. Tout ce qui est sur l'autre couleur lui échappe. Le Vitrail de la phase 1 reçoit ici son étage de finale. Le mauvais fou, emmuré derrière ses propres pions, devient en finale un vrai handicap : le roi adverse entre par les cases de l'autre couleur. Règles du fanal. Place tes pions sur la couleur opposée à ton fou. Fixe les pions adverses sur la couleur de ton fou pour qu'il les attaque. Et si ton fou est mauvais, active ton roi avant qu'il ne soit trop tard.",
    ancrage_sensoriel:
      "Sens la chaleur de la lampe du fanal et vois son faisceau qui balaie l'eau noire, toujours sur la même bande de vagues.",
    rappels: ["vitrail", "roi-jardinier"],
    focus_partie: "dans toute finale avec fou : de quelle couleur sont tes pions, et de quelle couleur sont les siens ?",
    reconsolidation: { type: "recitation", consigne: "Récite les trois règles du fanal, puis applique-les à voix haute à la position du 2e puzzle reconstruite de mémoire : bon ou mauvais fou, et pourquoi." },
    checklist: ["Squelette désigné avant chaque solution", "Couleur des pions comparée à celle du fou", "Pions placés sur la bonne couleur dans ma partie"],
    sourcing: { anyThemes: ["bishopEndgame"], noThemes: ["mateIn1"], geometry: "badBishop", fallbackThemes: ["bishopEndgame"] },
  },
  {
    semaine: 10, jour: 3, metaphore_id: "deux-fanaux", theme_metaphore: "Le Port — les Deux Fanaux",
    concept: "les fous de couleurs opposées",
    cours:
      "À l'entrée du Port, deux fanaux se font face : l'un éclaire les cases blanches, l'autre les noires. Leurs faisceaux ne se croisent jamais. Fous de couleurs opposées : en finale pure, ils tendent à la nulle, même avec un ou deux pions de moins, parce que le défenseur bloque sur sa couleur et que l'autre fou ne peut jamais le chasser. En milieu de jeu, c'est l'inverse. L'attaquant frappe sur la couleur que le défenseur ne voit pas, et chaque fou agit comme une pièce de plus. Règle des deux fanaux : avant d'échanger vers des fous de couleurs opposées, demande-toi si l'on est en milieu de jeu (avantage à l'attaquant) ou en finale (avantage au défenseur).",
    ancrage_sensoriel:
      "Vois les deux faisceaux qui balaient le port, l'un blanc, l'autre ambré, et ne se touchent jamais même au milieu du bassin.",
    rappels: ["fanal", "deux-vitraux"],
    focus_partie: "si les fous de couleurs opposées apparaissent : es-tu en train d'attaquer ou de défendre ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de la séance, remonte la combinaison à l'envers et indique à chaque coup sur quelle couleur de cases se jouait l'action." },
    checklist: ["Squelette désigné avant chaque solution", "Milieu de jeu ou finale : rôle des fous noté", "Échange vers des fous opposés pesé dans ma partie"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "oppositeBishops", fallbackThemes: ["bishopEndgame"] },
  },
  {
    semaine: 10, jour: 4, metaphore_id: "ecluse", theme_metaphore: "Le Port — l'Écluse",
    concept: "le blocus du pion passé",
    cours:
      "Au fond du Port, une écluse. L'eau pousse, le bateau veut passer, mais la porte fermée l'arrête net. Le pion passé de l'Escalier du Belvédère pousse vers la promotion ; une pièce posée juste devant lui le bloque. Nimzowitsch disait : un pion passé doit être bloqué, et le meilleur gardien d'écluse est le cavalier. Il bloque sans perdre son activité, alors qu'un fou ou une tour devant un pion deviennent passifs. Règle de l'écluse : face à un pion passé adverse, pose un bloqueur sur la case devant lui avant de chercher à le prendre. Et si c'est ton pion qui est bloqué, attaque le bloqueur, chasse-le ou échange-le : sans gardien, l'écluse s'ouvre.",
    ancrage_sensoriel:
      "Entends l'eau qui gronde derrière les lourdes portes de bois, et sens sous ta main la poutre de l'écluse qui vibre sans céder.",
    rappels: ["escalier", "jetee"],
    focus_partie: "chaque pion passé de la partie : qui l'a bloqué, et avec quelle pièce ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire le pion passé et son bloqueur dans un puzzle de la séance, puis la pièce qui a attaqué (ou défendu) l'écluse." },
    checklist: ["Squelette désigné avant chaque solution", "Bloqueur identifié devant chaque pion passé", "Pion passé adverse bloqué dans ma partie"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "blockade", fallbackThemes: ["advancedPawn"] },
  },
  {
    semaine: 10, jour: 5, metaphore_id: "cabestan", theme_metaphore: "Le Port — le Cabestan",
    concept: "promotion et sous-promotion",
    cours:
      "Sur le quai, le cabestan hisse la cargaison, un tour de manivelle après l'autre, jusqu'au pont du navire. C'est le pion qui monte vers la promotion : chaque marche compte, et l'on ne lâche pas la manivelle en route. À l'arrivée, on choisit ce qu'on décharge. En général une dame. Mais une dame peut donner pat, alors qu'un cavalier donne échec et fourchette. Règle du cabestan : avant de promouvoir, vérifie la pièce. Dame d'abord, sauf pat, sauf fourchette immédiate du cavalier, sauf qu'une tour suffit et évite le pat. Pour le défenseur, le Belvédère se garde au dernier moment par une pièce derrière le pion, par un échec, ou par l'Écluse.",
    ancrage_sensoriel:
      "Sens le bois lisse de la barre du cabestan sous tes paumes et entends le cliquet métallique à chaque tour : clac, clac, clac.",
    rappels: ["escalier", "ecluse"],
    focus_partie: "toute promotion de la partie : as-tu vérifié la pièce choisie et les ressources de pat ?",
    reconsolidation: { type: "recitation", consigne: "Récite les quatre questions du cabestan (dame, pat, fourchette, tour suffisante), puis applique-les à un puzzle de la séance reconstruit de mémoire." },
    checklist: ["Squelette désigné avant chaque solution", "Pièce de promotion vérifiée avant de jouer", "Ressource de pat vérifiée en finale"],
    sourcing: { anyThemes: ["promotion", "underPromotion"], noThemes: ["mateIn1"], fallbackThemes: ["promotion", "advancedPawn"] },
  },
  {
    semaine: 10, jour: 6, metaphore_id: "porte-tournante", theme_metaphore: "Le Port — la Porte tournante, deuxième étage",
    concept: "le zugzwang en finale de pièces",
    cours:
      "Retour au Jardin du Triangle d'Or, à la Porte tournante, mais elle a désormais deux battants. En phase 1, le zugzwang concernait les rois et les pions. Avec des pièces, il existe aussi : un fou qui doit lâcher une diagonale, un cavalier qui doit quitter sa case de blocus, une tour qui doit abandonner sa rangée. Règle de l'étage : quand ta position est idéale et que l'adversaire n'a que des coups qui l'affaiblissent, ne fais rien de décisif, passe le trait. Un coup d'attente de roi ou de fou, une triangulation : l'adversaire pousse la porte et se retrouve dehors. Avant de chercher un plan actif, demande-toi si l'adversaire a encore un bon coup.",
    ancrage_sensoriel:
      "Entends le grincement lent de la porte tournante et sens la poussée dans ton dos : celui qui pousse se retrouve dehors, dans le froid.",
    rappels: ["porte-tournante", "triangle-or", "fanal"],
    focus_partie: "en finale, avant ton plan : l'adversaire a-t-il encore un bon coup s'il est au trait ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pars de la position finale du puzzle de zugzwang et remonte au coup d'attente. Explique quel coup adverse aurait suffi si tu n'avais pas passé le trait." },
    checklist: ["Squelette désigné avant chaque solution", "Coups utiles de l'adversaire comptés", "Coup d'attente envisagé en finale"],
    sourcing: { anyThemes: ["zugzwang"], noThemes: ["mateIn1"], fallbackThemes: ["zugzwang", "quietMove"] },
  },
  RET(10, ["jetee", "fanal", "deux-fanaux", "ecluse", "cabestan", "porte-tournante"], "Le Port", "si ta partie entre en finale de pièces mineures : quels quais du Port as-tu utilisés ?", ["Une finale de pièces mineures expliquée avec les lieux du Port"]),

  // ═══ Semaine 11 — L'Arsenal ═══════════════════════════════════════════════
  {
    semaine: 11, jour: 1, metaphore_id: "poudriere", theme_metaphore: "L'Arsenal — la Poudrière",
    concept: "les finales de dames",
    cours:
      "L'Arsenal garde les pièces lourdes. Sa première salle est la poudrière : la moindre étincelle et tout saute. En finale de dames, chaque coup peut être un échec, et une suite d'échecs peut tout changer. Trois règles de la poudrière. Un, le pion passé le plus avancé vaut plus qu'un pion de plus : on le pousse, la dame derrière ou à côté. Deux, le roi se cache devant son pion pour fuir les échecs, et c'est souvent le pion lui-même qui sert d'abri. Trois, le défenseur vit de la Ronde perpétuelle. Avant chaque coup, compte les échecs qu'il peut donner. Lien avec le Cabestan : une finale de dames se joue presque toujours autour d'une promotion.",
    ancrage_sensoriel:
      "Sens l'odeur âcre de la poudre noire en tonneaux, et retiens ton souffle : un faux pas, une étincelle, et la salle explose.",
    rappels: ["ronde", "cabestan"],
    focus_partie: "en finale de dames : combien d'échecs l'adversaire peut-il donner après ton coup ?",
    reconsolidation: { type: "recitation", consigne: "Récite les trois règles de la poudrière et, pour le 3e puzzle reconstruit de mémoire, liste tous les échecs possibles du défenseur." },
    checklist: ["Squelette désigné avant chaque solution", "Échecs adverses comptés avant chaque coup", "Abri du roi préparé avant de pousser le pion"],
    sourcing: { anyThemes: ["queenEndgame"], noThemes: ["mateIn1"], fallbackThemes: ["queenEndgame", "queenRookEndgame"] },
  },
  {
    semaine: 11, jour: 2, metaphore_id: "mortier", theme_metaphore: "L'Arsenal — le Mortier",
    concept: "dame et tour ensemble",
    cours:
      "Dans la cour de l'Arsenal, un mortier tire en cloche, par-dessus les murs, là où un canon tendu ne passe pas. Dame et tour coordonnées, c'est le mortier. La tour prend une rangée ou une colonne, la dame frappe sur une diagonale que la tour ne voit pas, et le roi adverse se retrouve pris des deux côtés. Les figures typiques : la tour coupe le roi sur sa dernière rangée et la dame donne mat sur la diagonale ; la tour à la 7e et la dame en appui, comme les cochons de la Tribune. Règle du mortier : place d'abord la tour, la pièce lente, sur sa ligne, puis amène la dame, la pièce rapide, pour l'échec final. Lien avec le Canon : le mortier est un canon dont l'un des tubes est courbe.",
    ancrage_sensoriel:
      "Entends le coup sourd du mortier, puis le sifflement de l'obus qui monte et redescend, invisible, derrière le mur.",
    rappels: ["canon", "tribune"],
    focus_partie: "avec dame et tour : laquelle prend la ligne, laquelle donne l'échec ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la position finale du puzzle le plus beau : la ligne de la tour en bleu, la diagonale de la dame en rouge, le roi au croisement." },
    checklist: ["Squelette désigné avant chaque solution", "Rôles tour (ligne) et dame (échec) nommés", "Coordination dame + tour cherchée dans ma partie"],
    sourcing: { anyThemes: ["queenRookEndgame"], noThemes: ["mateIn1"], fallbackThemes: ["queenRookEndgame", "mateIn2"] },
  },
  {
    semaine: 11, jour: 3, metaphore_id: "tour-sentinelle", theme_metaphore: "L'Arsenal — la Tour sentinelle, deuxième étage",
    concept: "tour active contre tour passive",
    cours:
      "Retour aux Remparts de la Tour, à la Tour sentinelle, un étage plus haut. En phase 1, la règle était de placer la tour derrière le pion passé. À l'étage : une tour active, qui attaque des pions, coupe le roi ou donne des échecs, vaut souvent un pion de plus qu'une tour passive qui défend. Les maîtres sacrifient volontiers un pion pour activer leur tour. Règle de l'étage : en finale de tours, compare les deux tours. Laquelle attaque, laquelle défend ? Si la tienne défend, cherche comment la libérer, même au prix d'un pion. Le roi suit, comme le Roi jardinier.",
    ancrage_sensoriel:
      "Sens le vent fort au sommet de la tour, et vois la sentinelle qui marche sans cesse au lieu de rester accroupie derrière un créneau.",
    rappels: ["tour-sentinelle", "roi-jardinier"],
    focus_partie: "en finale de tours, à chaque coup : ta tour attaque-t-elle ou défend-elle ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Reprends le puzzle le plus long et remonte-le à l'envers ; pour chaque coup de tour, dis si elle devenait plus active ou plus passive." },
    checklist: ["Squelette désigné avant chaque solution", "Tour active ou passive jugée à chaque puzzle", "Activité de la tour privilégiée dans ma partie"],
    sourcing: { anyThemes: ["rookEndgame"], noThemes: ["mateIn1"], geometry: "rookBehindPasser", fallbackThemes: ["rookEndgame"] },
  },
  {
    semaine: 11, jour: 4, metaphore_id: "fosse", theme_metaphore: "L'Arsenal — la Fosse, deuxième étage",
    concept: "couper le roi, puis avancer",
    cours:
      "La Fosse des Remparts de la Tour s'approfondit. En phase 1, il fallait creuser la fosse, c'est-à-dire couper le roi adverse d'une ou deux colonnes. À l'étage, on apprend à s'en servir. Coupé, le roi défenseur arrive en retard ; le pion avance escorté de son roi ; la tour du défenseur seule ne suffit plus. Règle de l'étage : compte les colonnes de coupure. Une colonne suffit rarement, deux gagnent souvent, surtout avec un pion central. Pour le défenseur, tout se joue avant la coupure : ramène ton roi vers le pion le plus tôt possible, ou attaque la tour qui coupe.",
    ancrage_sensoriel:
      "Penche-toi au bord de la fosse et sens la terre fraîche qui s'effrite sous tes pieds ; de l'autre côté, le roi adverse ne peut pas sauter.",
    rappels: ["fosse", "pont-lucena"],
    focus_partie: "en finale de tours : de combien de colonnes le roi adverse est-il coupé ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire un puzzle de la séance : trace la fosse (la colonne de coupure) et compte le nombre de colonnes entre le roi et le pion." },
    checklist: ["Squelette désigné avant chaque solution", "Colonnes de coupure comptées", "Roi ramené vite vers le pion passé dans ma partie"],
    sourcing: { anyThemes: ["rookEndgame"], noThemes: ["mateIn1"], geometry: "cutOff", fallbackThemes: ["rookEndgame"] },
  },
  {
    semaine: 11, jour: 5, metaphore_id: "rempart-philidor", theme_metaphore: "L'Arsenal — le Rempart de Philidor, deuxième étage",
    concept: "défendre les finales de tours",
    cours:
      "Le Rempart de Philidor gagne un étage : toutes les défenses de tour. Philidor tient la troisième rangée vue du défenseur (la 6e quand les Noirs défendent) tant que le pion n'a pas avancé, puis redescend donner des échecs par derrière. Si le roi défenseur est coupé, la tour donne des échecs latéraux de loin : plus elle est loin du roi adverse, mieux ses échecs portent. Règle de l'étage : en défense de tour, trois questions. Mon roi est-il devant le pion ? Ma tour a-t-elle de la distance pour donner des échecs ? Puis-je attaquer un pion par derrière ? Une défense active de la tour sauve souvent un pion de moins. Lien avec la Ronde : les échecs de tour sont la ronde des finales.",
    ancrage_sensoriel:
      "Sens sous tes doigts la pierre polie du rempart, et entends les pas réguliers du défenseur qui va et vient sur sa rangée.",
    rappels: ["rempart-philidor", "ronde", "poterne"],
    focus_partie: "en défense de tours : ta tour avait-elle la distance pour donner des échecs ?",
    reconsolidation: { type: "recitation", consigne: "Récite les trois questions de la défense de tours, puis réponds-y à voix haute pour la position du 4e puzzle reconstruite de mémoire." },
    checklist: ["Squelette désigné avant chaque solution", "Trois questions de défense posées", "Défense active de la tour cherchée dans ma partie"],
    sourcing: { anyThemes: ["rookEndgame", "defensiveMove"], noThemes: ["mateIn1"], geometry: "philidorLike", fallbackThemes: ["rookEndgame"] },
  },
  {
    semaine: 11, jour: 6, metaphore_id: "roi-jardinier", theme_metaphore: "L'Arsenal — le Roi jardinier monte au front",
    concept: "le roi actif en finale de pièces lourdes",
    cours:
      "Le Roi jardinier de la phase 1 sortait au centre dès que les dames disparaissaient. Avec des tours encore sur l'échiquier, il sort aussi, mais avec prudence : il marche vers les pions, à l'abri des échecs derrière ses propres pions ou sa tour. Un roi actif en finale de tours vaut souvent une pièce de plus. Il soutient la promotion, attaque les pions adverses, et libère la tour de la défense. Règle du jardinier au front : quand les dames sont parties, demande à chaque coup si le roi peut faire un pas utile. Sinon, prépare-lui un chemin abrité. Lien avec la Tour sentinelle : la tour active et le roi actif se complètent, l'une coupe, l'autre avance.",
    ancrage_sensoriel:
      "Sens la terre sous les bottes du roi qui quitte le jardin pour le champ ouvert, et le vent qui soulève son manteau.",
    rappels: ["roi-jardinier", "tour-sentinelle", "mortier"],
    focus_partie: "quand les dames sont échangées, à quel coup ton roi a-t-il commencé à marcher ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire le chemin du roi dans un puzzle de la séance, et marque les cases où il était à l'abri des échecs." },
    checklist: ["Squelette désigné avant chaque solution", "Un pas de roi utile cherché à chaque position", "Roi activé tôt dans ma finale"],
    sourcing: { anyThemes: ["rookEndgame"], allThemes: ["advancedPawn"], noThemes: ["mateIn1"], fallbackThemes: ["rookEndgame"] },
  },
  RET(11, ["poudriere", "mortier", "tour-sentinelle", "fosse", "rempart-philidor", "roi-jardinier"], "L'Arsenal", "si ta partie entre en finale de pièces lourdes : quelles salles de l'Arsenal ont servi ?", ["Une finale de tours ou de dames expliquée avec les lieux de l'Arsenal"]),

  // ═══ Semaine 12 — Le Faubourg ═════════════════════════════════════════════
  {
    semaine: 12, jour: 1, metaphore_id: "pont-suspendu", theme_metaphore: "Le Faubourg — le Pont suspendu",
    concept: "les pions pendants",
    cours:
      "Le Faubourg s'étend derrière les Remparts : c'est le quartier des structures de pions du milieu de jeu. Au-dessus de la rivière centrale, un pont suspendu. Deux pions côte à côte sur les colonnes c et d, sans voisins sur b ni e : ce sont les pions pendants. Tant qu'ils tiennent ensemble, ils contrôlent les cases centrales et ouvrent des lignes à leurs pièces. Si l'un avance seul ou si l'autre est pris, le pont pend dans le vide, et l'on se retrouve avec un pion isolé ou un pion arriéré. Règle du pont : celui qui a les pions pendants cherche la poussée au bon moment, avec ses pièces prêtes. L'autre les bloque et les attaque de face avec ses tours. Lien avec le Phare : un pion pendant qui reste seul devient un phare.",
    ancrage_sensoriel:
      "Sens le pont qui oscille sous tes pieds et les câbles qui vibrent dans le vent, et entends la rivière qui gronde en dessous.",
    rappels: ["phare", "bas-cote"],
    focus_partie: "si une paire de pions pendants apparaît : qui l'attaque, et qui prépare la poussée ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la structure de pions du 1er puzzle, entoure les pions pendants et indique d'une flèche la poussée qui libère ou casse le pont." },
    checklist: ["Squelette désigné avant chaque solution", "Pions pendants repérés et évalués", "Plan (poussée ou blocus) formulé dans ma partie"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "hangingPawns", fallbackThemes: ["middlegame"] },
  },
  {
    semaine: 12, jour: 2, metaphore_id: "phare", theme_metaphore: "Le Faubourg — le Phare, deuxième étage",
    concept: "les plans avec et contre le pion isolé",
    cours:
      "Tu montes au deuxième étage du Phare des Remparts. En phase 1, tu as appris à voir le pion isolé, ses forces et son seuil. À l'étage, les plans. Avec le pion isolé, on attaque. Les pièces sont actives, les cases e5 et c5 servent d'avant-postes, la poussée d4-d5 ouvre le jeu au bon moment, et l'on évite les échanges. Contre le pion isolé, on bloque la case devant lui (le seuil) avec un cavalier, on échange les pièces mineures, et l'on vise une finale où le phare n'éclaire plus rien et tombe. Règle de l'étage : regarde le nombre de pièces. Beaucoup de pièces favorisent celui qui a l'isolé ; peu de pièces favorisent l'autre.",
    ancrage_sensoriel:
      "Monte l'escalier étroit du phare et sens la chaleur de la grande lampe ; de là-haut, vois les avant-postes qu'il éclaire autour de lui.",
    rappels: ["phare", "ecluse", "sanctuaire"],
    focus_partie: "si un pion isolé apparaît : as-tu échangé ou gardé les pièces, selon ton camp ?",
    reconsolidation: { type: "recitation", consigne: "Récite les deux plans (avec et contre le pion isolé), puis dis lequel s'appliquait dans le 2e puzzle reconstruit de mémoire." },
    checklist: ["Squelette désigné avant chaque solution", "Camp du pion isolé et plan correspondant nommés", "Échanges choisis selon la structure dans ma partie"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "isolatedPawn", fallbackThemes: ["middlegame"] },
  },
  {
    semaine: 12, jour: 3, metaphore_id: "sape", theme_metaphore: "Le Faubourg — la Sape",
    concept: "l'attaque de minorité",
    cours:
      "Au bord du Faubourg, des sapeurs creusent sous la muraille ennemie. Ils sont moins nombreux que les pierres d'en face, et ils ne cherchent pas à percer : ils veulent qu'une pierre tombe et laisse un trou. Deux pions sur l'aile dame (a et b) contre trois (a, b, c) : on pousse b4-b5, on échange, et l'adversaire reste avec un pion c faible, isolé ou arriéré, sur une colonne semi-ouverte. C'est le plan typique de la structure Carlsbad. Règle de la sape : la minorité avance pour créer une faiblesse, pas pour gagner un pion tout de suite. Ensuite, les tours attaquent la faiblesse par le Bas-côté. Le défenseur répond souvent par une attaque au centre ou sur l'autre aile.",
    ancrage_sensoriel:
      "Sens l'odeur de terre humide dans la galerie de sape et entends les coups de pioche sourds, réguliers, sous la muraille.",
    rappels: ["muraille", "bas-cote"],
    focus_partie: "si les structures de pions sont asymétriques sur une aile : qui a la minorité, et l'a-t-il poussée ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la structure du puzzle de minorité avant et après la poussée b5 (ou ...b4), et entoure la faiblesse créée." },
    checklist: ["Squelette désigné avant chaque solution", "Minorité et majorité comptées sur chaque aile", "Faiblesse créée (ou évitée) dans ma partie"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "minorityStructure", fallbackThemes: ["queensideAttack", "middlegame"] },
  },
  {
    semaine: 12, jour: 4, metaphore_id: "muraille", theme_metaphore: "Le Faubourg — la Muraille, deuxième étage",
    concept: "la rupture de pions",
    cours:
      "La Muraille fortifiée des Remparts reçoit son étage : la rupture. En phase 1, la règle était d'attaquer la chaîne à sa base. À l'étage, on apprend à choisir le moment. Une rupture (f4-f5 contre une chaîne noire, c5 contre une chaîne blanche) ouvre des colonnes ; elle doit arriver quand tes pièces sont prêtes à les occuper, pas avant. Règle de l'étage : avant de rompre, compte les pièces qui profiteront de la ligne ouverte, les tiennes et les siennes. Si l'adversaire en a plus, prépare d'abord (doubler les tours, centraliser), puis rompre. Une rupture jouée trop tôt ouvre la porte à l'ennemi.",
    ancrage_sensoriel:
      "Sens le choc de la masse contre la pierre d'angle de la muraille, et entends le grondement de l'escalier de pierres qui s'écroule.",
    rappels: ["muraille", "nef", "belier"],
    focus_partie: "chaque rupture de pions de la partie : combien de tes pièces étaient prêtes à profiter de la ligne ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Reprends un puzzle de rupture : depuis la position finale, remonte à l'envers et nomme la colonne ou la diagonale que la rupture a ouverte." },
    checklist: ["Squelette désigné avant chaque solution", "Pièces prêtes comptées avant la rupture", "Rupture préparée (et non précipitée) dans ma partie"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "pawnChain", fallbackThemes: ["advancedPawn", "middlegame"] },
  },
  {
    semaine: 12, jour: 5, metaphore_id: "sanctuaire", theme_metaphore: "Le Faubourg — le Sanctuaire, deuxième étage",
    concept: "l'avant-poste créé par la structure",
    cours:
      "Le Sanctuaire reçoit un étage : on ne cherche plus seulement une case faible, on la crée. Chaque poussée de pion laisse derrière elle des cases qu'elle ne pourra plus jamais défendre. L'avant-poste naît souvent d'une rupture ou d'un échange de pions, provoqué volontairement. Règle de l'étage : avant de pousser un pion, regarde les cases qu'il abandonne. Avant d'échanger un pion, regarde les cases que l'échange te livre chez l'adversaire. Puis amène le cavalier par le chemin le plus court : il faut parfois trois ou quatre coups pour l'installer, mais une fois au Sanctuaire, il y reste jusqu'à la fin de la partie.",
    ancrage_sensoriel:
      "Entends la porte du Sanctuaire qui se referme derrière le cavalier, et sens le calme absolu du lieu où personne ne peut l'atteindre.",
    rappels: ["sanctuaire", "jetee", "muraille"],
    focus_partie: "chaque poussée de pion de la partie : quelles cases a-t-elle abandonnées pour toujours ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la position d'un puzzle de la séance, marque l'avant-poste et trace le chemin du cavalier pour l'atteindre." },
    checklist: ["Squelette désigné avant chaque solution", "Cases abandonnées notées après chaque poussée", "Un avant-poste créé ou occupé dans ma partie"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "outpost", fallbackThemes: ["fork", "middlegame"] },
  },
  {
    semaine: 12, jour: 6, metaphore_id: "colonnes-jumelles", theme_metaphore: "Le Faubourg — les Colonnes jumelles, deuxième étage",
    concept: "pions doublés : cible ou force ?",
    cours:
      "Les Colonnes jumelles des Remparts reçoivent leur étage : quand les pions doublés sont-ils une faiblesse, et quand une force ? Faiblesse, quand on peut les fixer et les attaquer de face avec les pièces lourdes, ou en finale, où ils ne créent pas de pion passé. Force, quand ils contrôlent des cases centrales, ouvrent une colonne semi-ouverte à côté d'eux, ou protègent le roi. Règle de l'étage : regarde ce que les pions doublés ont donné en échange. Une colonne ? La paire de fous ? Un centre plus solide ? Si l'échange était bon, ils sont une force pour le milieu de jeu ; plus on échange de pièces, plus ils redeviennent une cible.",
    ancrage_sensoriel:
      "Fais le tour des deux colonnes jumelles et sens sous ta main que l'une est fissurée : elle tient encore, mais pas sous une charge lourde.",
    rappels: ["colonnes-jumelles", "deux-vitraux", "bas-cote"],
    focus_partie: "si des pions doublés apparaissent : qu'ont-ils rapporté en échange, et faut-il échanger les pièces ?",
    reconsolidation: { type: "recitation", consigne: "Récite les cas où les pions doublés sont une force et ceux où ils sont une cible, puis classe le 3e puzzle de la séance." },
    checklist: ["Squelette désigné avant chaque solution", "Compensation des pions doublés évaluée", "Échanges de pièces choisis selon la structure"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "doubledPawns", fallbackThemes: ["middlegame", "endgame"] },
  },
  RET(12, ["pont-suspendu", "phare", "sape", "muraille", "sanctuaire", "colonnes-jumelles"], "Le Faubourg", "la structure de pions de la partie après l'ouverture, dessinée et nommée avec les lieux du Faubourg.", ["La structure de chaque partie de la semaine classée (pendants, isolé, minorité, chaîne)"]),

  // ═══ Semaine 13 — La Citadelle ════════════════════════════════════════════
  {
    semaine: 13, jour: 1, metaphore_id: "herse", theme_metaphore: "La Citadelle — la Herse",
    concept: "roques opposés : la course des attaques",
    cours:
      "La Citadelle domine la Cité. Elle a deux portes, et ce soir, deux herses tombent à la fois. Quand les rois ont roqué de côtés opposés, chacun peut lancer ses pions sur le roi adverse sans affaiblir le sien. C'est une course : la première attaque qui arrive gagne. Trois règles de la herse. Compte les temps : combien de coups pour ouvrir une colonne sur son roi, combien pour lui sur le tien ? Ne défends pas si tu peux attaquer plus vite : un coup de défense est un temps perdu dans la course. Et ouvre des colonnes, ne les ferme pas : un pion qui pousse trop loin et bloque tout n'a servi à rien. Lien avec le Bélier : les pions de la herse sont des béliers lancés à pleine vitesse.",
    ancrage_sensoriel:
      "Entends les chaînes des deux herses qui grincent en même temps de chaque côté de la cour, et le fracas de la première qui touche le sol.",
    rappels: ["belier", "donjon-eventre"],
    focus_partie: "si les roques sont opposés : as-tu compté les temps de chaque attaque avant de défendre ?",
    reconsolidation: { type: "recitation", consigne: "Pour un puzzle de la séance reconstruit de mémoire, compte à voix haute les temps des deux attaques, puis récite les trois règles de la herse." },
    checklist: ["Squelette désigné avant chaque solution", "Temps des deux attaques comptés", "Colonne ouverte (et non fermée) par mes pions"],
    sourcing: { anyThemes: ["kingsideAttack", "queensideAttack"], noThemes: ["mateIn1"], geometry: "pawnStorm", fallbackThemes: ["kingsideAttack", "queensideAttack"] },
  },
  {
    semaine: 13, jour: 2, metaphore_id: "trebuchet", theme_metaphore: "La Citadelle — le Trébuchet",
    concept: "le sacrifice de qualité",
    cours:
      "Sur la colline, un trébuchet lance une pierre énorme pour abattre un seul pan de la muraille de la Citadelle. Ce qui compte, c'est le trou qu'il ouvre, pas le prix de la pierre. Le sacrifice de qualité donne une tour contre un cavalier ou un fou parce que la pièce prise était la clé de la position : le défenseur des cases noires autour du roi, le bloqueur d'un pion passé, le cavalier qui tenait le Sanctuaire. Règle du trébuchet : demande-toi quelle pièce adverse fait le travail le plus important. Si c'est une pièce mineure et que ta tour peut la prendre, compte ce que devient la position sans elle, pas les points. Lien avec la Balance : on pèse les cases, pas le matériel.",
    ancrage_sensoriel:
      "Entends le bras du trébuchet qui se détend dans un claquement de bois, puis la pierre qui siffle et le pan de mur qui s'effondre.",
    rappels: ["pilier-surcharge", "sanctuaire", "ecluse"],
    focus_partie: "repère dans ta partie la pièce mineure adverse la plus importante : valait-elle une tour ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la position avant le sacrifice de qualité, entoure la pièce prise et note en une phrase le travail qu'elle faisait." },
    checklist: ["Squelette désigné avant chaque solution", "Travail de la pièce prise nommé", "Sacrifice de qualité envisagé dans ma partie"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "exchangeSacrifice", fallbackThemes: ["sacrifice"] },
  },
  {
    semaine: 13, jour: 3, metaphore_id: "donjon-eventre", theme_metaphore: "La Citadelle — le Donjon éventré, deuxième étage",
    concept: "sacrifices sur le roque en plusieurs temps",
    cours:
      "Le Donjon éventré reçoit un étage. En phase 1, un sacrifice ouvrait une brèche et la suite était courte. À l'étage, le sacrifice n'est que le début : après Fxh7+ ou Cxf7, il faut amener les pièces de réserve (cavalier en g5, dame en h5, tour par la 3e rangée) avant que le défenseur ne referme. Les conditions classiques du sacrifice de Greco : fou sur la diagonale b1-h7, cavalier qui peut aller en g5, dame qui rejoint h5, et pas de défenseur sur f6. Règle de l'étage : vérifie les renforts AVANT de sacrifier. Si deux pièces ne peuvent pas arriver en deux coups, la brèche se referme.",
    ancrage_sensoriel:
      "Sens la poussière de la brèche fraîche dans le mur du donjon, et entends derrière toi les pas des renforts qui accourent.",
    rappels: ["donjon-eventre", "pont-levis", "herse"],
    focus_partie: "si un sacrifice sur le roque était possible : les renforts arrivaient-ils à temps ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Remonte à l'envers la combinaison la plus longue de la séance et, pour chaque coup, nomme la pièce de renfort qui entrait dans l'attaque." },
    checklist: ["Squelette désigné avant chaque solution", "Renforts comptés avant le sacrifice", "Conditions du sacrifice vérifiées dans ma partie"],
    sourcing: { anyThemes: ["sacrifice", "kingsideAttack", "exposedKing"], noThemes: ["mateIn1"], geometry: "greekGift", fallbackThemes: ["sacrifice", "kingsideAttack"] },
  },
  {
    semaine: 13, jour: 4, metaphore_id: "chambre-close", theme_metaphore: "La Citadelle — la Chambre close, deuxième étage",
    concept: "figures de mat en plusieurs coups",
    cours:
      "La Chambre close du Donjon reçoit un étage. Tu connais les figures (étouffé, arabe, Anastasie, crochet) ; à l'étage, il faut y conduire le roi. Les figures de mat sont des destinations : on calcule à rebours. Quelle figure est possible ici ? Quelles pièces doivent venir où ? Quels échecs y mènent ? Le mat de Philidor (dame sacrifiée en g8, cavalier en f7) est l'exemple parfait : on voit d'abord la chambre, puis le chemin. Règle de l'étage : ne calcule pas coup après coup depuis la position ; place d'abord la figure finale dans ta tête, puis remonte. C'est du chunking pur : une figure se retient comme une seule image.",
    ancrage_sensoriel:
      "Vois la chambre close éclairée par une seule bougie, chaque meuble à sa place, et le cavalier qui attend sous la fenêtre.",
    rappels: ["chambre-close", "pont-levis", "jetee"],
    focus_partie: "dans les attaques de ta partie : quelle figure de mat était à portée ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine la figure de mat finale de deux puzzles, puis, sous chaque dessin, écris le premier coup qui y menait." },
    checklist: ["Squelette désigné avant chaque solution", "Figure finale imaginée avant le calcul", "Figures de mat cherchées dans ma partie"],
    sourcing: { anyThemes: ["smotheredMate", "arabianMate", "anastasiaMate", "hookMate", "bodenMate", "doubleBishopMate", "dovetailMate"], noThemes: ["mateIn1"], fallbackThemes: ["mateIn3", "mateIn2"] },
  },
  {
    semaine: 13, jour: 5, metaphore_id: "tour-de-guet", theme_metaphore: "La Citadelle — la Tour de guet, deuxième étage",
    concept: "attaquer et défendre le roque en fianchetto",
    cours:
      "La Tour de guet du Sanctuaire reçoit un étage : on ne l'admire plus, on l'assiège. Contre un roque en fianchetto (fou en g7, pions f7, g6, h7), le plan classique a trois temps : échanger le fou de la tour de guet (Fh6 ou Fe3-h6), lancer le pion h pour ouvrir la colonne h (h4-h5), puis faire entrer dame et tour par la colonne ouverte. Sans son fou, le roque en fianchetto devient un donjon éventré sur les cases noires. Règle de l'étage : contre un fianchetto, vise d'abord le fou ; pour le défenseur, garde ton fou à tout prix, ou remplace-le par un cavalier en f6.",
    ancrage_sensoriel:
      "Sens la colline sous tes pieds pendant que tu montes vers la tour de guet, et vois le guetteur qui tombe : la tour devient aveugle.",
    rappels: ["tour-de-guet", "belier", "donjon-eventre"],
    focus_partie: "contre un fianchetto dans ta partie : as-tu cherché à échanger son fou ?",
    reconsolidation: { type: "recitation", consigne: "Récite les trois temps de l'attaque contre le fianchetto, puis dis lequel était joué dans le 4e puzzle reconstruit de mémoire." },
    checklist: ["Squelette désigné avant chaque solution", "Fou du fianchetto identifié comme cible", "Plan h4-h5 évalué dans ma partie"],
    sourcing: { anyThemes: ["kingsideAttack", "exposedKing"], noThemes: ["mateIn1"], geometry: "fianchetto", fallbackThemes: ["kingsideAttack"] },
  },
  {
    semaine: 13, jour: 6, metaphore_id: "canon", theme_metaphore: "La Citadelle — le Canon, deuxième étage",
    concept: "mats en trois coups : batteries",
    cours:
      "Le Canon de la Cathédrale monte sur les remparts de la Citadelle. Au rez-de-chaussée, il frappait une case ; à l'étage, il prépare un mat en plusieurs coups. Batterie dame-fou sur h7, dame-tour sur la colonne h, tours doublées sur la 7e. Le premier coup charge le canon (on aligne), le deuxième dégage la ligne (le Ramonage) ou détourne le défenseur, le troisième tire. Règle de l'étage : dans un mat en trois, cherche d'abord quelle batterie donne le dernier coup, puis les deux coups qui la rendent possible. Pour la défense, une batterie se désamorce en bloquant la ligne ou en échangeant la pièce de devant.",
    ancrage_sensoriel:
      "Sens l'odeur de poudre et vois les deux pièces alignées sur la ligne, la mèche qui brûle, le boulet prêt à partir.",
    rappels: ["canon", "ramonage", "mortier"],
    focus_partie: "toutes les batteries de la partie : laquelle aurait pu donner un mat ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour deux mats en trois de la séance, pars de la position de mat et remonte : quel coup a chargé le canon, lequel a dégagé, lequel a tiré ?" },
    checklist: ["Squelette désigné avant chaque solution", "Batterie finale identifiée avant le calcul", "Batterie ennemie désamorcée dans ma partie"],
    sourcing: { anyThemes: ["mateIn3"], noThemes: ["mateIn1", "backRankMate"], geometry: "battery", fallbackThemes: ["mateIn3"] },
  },
  RET(13, ["herse", "trebuchet", "donjon-eventre", "chambre-close", "tour-de-guet", "canon"], "La Citadelle", "chaque attaque sur le roi de la partie : quel lieu de la Citadelle a été utilisé ou oublié ?", ["Une attaque sur le roi expliquée avec les lieux de la Citadelle"]),

  // ═══ Semaine 14 — Le Tour de la Cité (synthèse et bilan de phase) ═════════
  {
    semaine: 14, jour: 1, metaphore_id: "enclume", theme_metaphore: "Le Tour de la Cité — retour à l'Enclume",
    concept: "synthèse : calcul forcé en plusieurs coups",
    cours:
      "Dernière semaine de la phase 2 : le Tour de la Cité. Aucun lieu neuf. Chaque jour, tu reviens dans un quartier de la phase et tu relies ses lieux entre eux. Aujourd'hui, la Forge. Les puzzles mélangent tout : coups forcés, coup intermédiaire, coup tranquille, dégagement, interception. Ta tâche n'est pas de deviner le thème, mais d'appliquer le protocole : d'abord l'Enclume (échecs, prises, menaces des deux camps), puis, si rien n'est forcé, la Trempe (le coup calme). Le squelette d'abord, la solution ensuite. Note à chaque puzzle quel lieu de la Forge s'est présenté : c'est ainsi que les lieux s'accrochent les uns aux autres.",
    ancrage_sensoriel:
      "Repasse la porte de la Forge et retrouve les sons dans l'ordre : le marteau, le soufflet, le sifflement de la trempe, l'appel d'air du ramonage.",
    rappels: ["enclume", "soufflet", "trempe", "ramonage", "vanne"],
    focus_partie: "dans chaque position critique : quel lieu de la Forge s'est présenté, et dans quel ordre l'as-tu cherché ?",
    reconsolidation: { type: "recitation", consigne: "Récite les cinq lieux de la Forge avec, pour chacun, un puzzle de cette séance qui l'illustre." },
    checklist: ["Squelette désigné avant chaque solution", "Lieu de la Forge nommé à chaque puzzle", "Protocole Enclume puis Trempe suivi dans ma partie"],
    sourcing: { anyThemes: ["intermezzo", "quietMove", "clearance", "interference"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["long"] },
  },
  {
    semaine: 14, jour: 2, metaphore_id: "poterne", theme_metaphore: "Le Tour de la Cité — retour au Bastion",
    concept: "synthèse : défense sous pression",
    cours:
      "Deuxième jour du Tour de la Cité : le Bastion. Les puzzles du jour sont défensifs, mais sans étiquette : à toi de reconnaître la Poterne (le seul coup), la Ronde (la nulle par échecs ou pat) ou la Contre-mine (la menace plus forte). Protocole : liste les menaces adverses avec l'Enclume ; liste tes quatre familles de défense (fuir, interposer, prendre, contre-menacer) ; élimine ; joue la Poterne. Un défenseur qui connaît ses portes ne panique pas, il compte. Ce jour prépare aussi le bilan : la réussite complète de cette semaine compte pour le passage à la phase 3.",
    ancrage_sensoriel:
      "Retrouve le froid de la poterne, les pas du guetteur sur le chemin de ronde, les coups de pioche sous la terre : trois sons, trois portes.",
    rappels: ["poterne", "ronde", "contre-mine"],
    focus_partie: "chaque menace adverse : as-tu listé tes défenses avant de jouer ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour le puzzle défensif le plus difficile, remonte à l'envers et nomme la porte du Bastion utilisée à chaque coup." },
    checklist: ["Squelette désigné avant chaque solution", "Porte du Bastion nommée à chaque puzzle", "Aucune défense jouée sans liste dans ma partie"],
    sourcing: { anyThemes: ["defensiveMove", "equality"], noThemes: ["mateIn1"], fallbackThemes: ["defensiveMove"] },
  },
  {
    semaine: 14, jour: 3, metaphore_id: "jetee", theme_metaphore: "Le Tour de la Cité — retour au Port",
    concept: "synthèse : finales de pièces mineures",
    cours:
      "Troisième jour : le Port. Les finales du jour mélangent cavaliers et fous. Pour chaque position, trois questions dans l'ordre du quai. La Jetée ou le Fanal : quelle pièce mineure est la meilleure ici, et pourquoi (pions sur une aile ou sur deux) ? L'Écluse : y a-t-il un pion passé à bloquer ou à libérer ? Le Cabestan : quelle promotion se prépare, et avec quelle pièce ? Les Deux Fanaux rappellent que les fous de couleurs opposées changent tout en finale. Comme toujours, le squelette d'abord : ici, ce sont souvent la case de promotion et la case de blocus.",
    ancrage_sensoriel:
      "Marche à nouveau le long du port : les planches de la jetée, la chaleur du fanal, le grondement de l'écluse, le cliquet du cabestan.",
    rappels: ["jetee", "fanal", "deux-fanaux", "ecluse", "cabestan"],
    focus_partie: "si ta partie arrive en finale : quelles questions du Port t'es-tu posées ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la position d'un puzzle de la séance et marque la case de promotion et la case de blocus." },
    checklist: ["Squelette désigné avant chaque solution", "Trois questions du Port posées à chaque finale", "Pièce mineure comparée à celle de l'adversaire"],
    sourcing: { anyThemes: ["knightEndgame", "bishopEndgame"], noThemes: ["mateIn1"], fallbackThemes: ["endgame"] },
  },
  {
    semaine: 14, jour: 4, metaphore_id: "poudriere", theme_metaphore: "Le Tour de la Cité — retour à l'Arsenal",
    concept: "synthèse : finales de tours et de dames",
    cours:
      "Quatrième jour : l'Arsenal. Finales de tours et de dames mêlées. Pour les dames, la Poudrière : compte les échecs adverses, pousse le pion le plus avancé, abrite ton roi. Pour les tours, la Tour sentinelle (activité), la Fosse (coupure), le Rempart de Philidor (défense) et le Roi jardinier (le roi au front). Le Mortier, dame et tour ensemble, relie les deux salles. Règle de synthèse : en finale de pièces lourdes, l'activité passe avant le matériel. Une tour active et un roi actif valent souvent un pion. Le squelette tient en deux ou trois cases : le pion passé, la case de coupure, la case d'abri du roi.",
    ancrage_sensoriel:
      "Retrouve l'odeur de poudre de l'Arsenal, le coup sourd du mortier, et le vent au sommet de la Tour sentinelle.",
    rappels: ["poudriere", "mortier", "tour-sentinelle", "fosse", "rempart-philidor"],
    focus_partie: "en finale de pièces lourdes : ton roi et ta tour étaient-ils actifs ?",
    reconsolidation: { type: "recitation", consigne: "Récite les salles de l'Arsenal et leur règle, puis applique-les à voix haute à la position du 2e puzzle reconstruite de mémoire." },
    checklist: ["Squelette désigné avant chaque solution", "Activité comparée au matériel", "Échecs adverses comptés en finale de dames"],
    sourcing: { anyThemes: ["rookEndgame", "queenEndgame", "queenRookEndgame"], noThemes: ["mateIn1"], fallbackThemes: ["endgame"] },
  },
  {
    semaine: 14, jour: 5, metaphore_id: "pont-suspendu", theme_metaphore: "Le Tour de la Cité — retour au Faubourg",
    concept: "synthèse : structure et plan",
    cours:
      "Cinquième jour : le Faubourg. Chaque puzzle du jour commence dans une structure typique : pions pendants, pion isolé, minorité, chaîne, pions doublés. Avant de chercher le coup, nomme la structure et le plan qui va avec : poussée ou blocus des pions pendants, attaque ou finale contre l'isolé, sape de la minorité, rupture à la base de la chaîne. Puis résous : la tactique sort presque toujours du plan. C'est la leçon de la semaine : le plan dit OÙ chercher, la Forge dit COMMENT frapper. Le squelette du jour : la faiblesse de la structure et la pièce qui l'attaque.",
    ancrage_sensoriel:
      "Traverse le Faubourg : le pont qui oscille, la lumière du phare, les coups de pioche des sapeurs, la muraille en escalier.",
    rappels: ["pont-suspendu", "phare", "sape", "muraille", "colonnes-jumelles"],
    focus_partie: "après l'ouverture : quelle structure, quel plan, et l'as-tu suivi ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Pour deux puzzles, dessine de mémoire la structure de pions seule, nomme-la, et écris en une phrase le plan qui allait avec." },
    checklist: ["Squelette désigné avant chaque solution", "Structure nommée avant chaque solution", "Plan de la structure suivi dans ma partie"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "isolatedPawn", fallbackThemes: ["middlegame"] },
  },
  {
    semaine: 14, jour: 6, metaphore_id: "trebuchet", theme_metaphore: "Le Tour de la Cité — retour à la Citadelle",
    concept: "synthèse : attaque sur le roi",
    cours:
      "Dernier jour de concept de la phase 2 : la Citadelle. Les attaques du jour mélangent la Herse (roques opposés), le Trébuchet (qualité sacrifiée), le Donjon éventré (sacrifice sur le roque), la Chambre close (figures de mat) et le Canon (batteries). Protocole d'attaque : d'abord compter les défenseurs du roi et les attaquants disponibles, puis imaginer la figure finale (Chambre close), puis chercher le premier coup qui y mène. Un sacrifice ne se joue que si les renforts arrivent à temps. Demain, le bilan : rétention et réussite de la semaine décident du passage à la phase 3.",
    ancrage_sensoriel:
      "Monte une dernière fois sur la colline de la Citadelle : les chaînes des herses, le claquement du trébuchet, la bougie de la chambre close.",
    rappels: ["herse", "trebuchet", "donjon-eventre", "chambre-close", "canon"],
    focus_partie: "chaque attaque sur le roi de la partie : défenseurs comptés, figure imaginée, renforts vérifiés ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour l'attaque la plus longue de la séance, pars du mat et remonte : à chaque coup, dis quel lieu de la Citadelle il utilisait." },
    checklist: ["Squelette désigné avant chaque solution", "Défenseurs et attaquants comptés", "Figure finale imaginée avant de calculer"],
    sourcing: { anyThemes: ["sacrifice", "kingsideAttack"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["kingsideAttack", "sacrifice"] },
  },
  RET(14, ["enclume", "poterne", "jetee", "poudriere", "pont-suspendu", "trebuchet"], "Le Tour de la Cité", "chaque lieu du palais rencontré dans la partie, tous quartiers confondus : c'est le bilan de la phase 2.", ["Bilan écrit de la phase 2 : trois lieux maîtrisés, trois lieux à renforcer"], { phase: 2, suivante: "la phase 3 (1900 → 2100)" }),
];

/** Aucune position construite en phase 2 : tout vient du dump Lichess, vérifié par Stockfish. */
export const PHASE_2_CONSTRUCTED: readonly ConstructedPosition[] = [];
