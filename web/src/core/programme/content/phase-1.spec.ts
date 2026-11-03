import type { ConstructedPosition, DaySpec } from "./spec-types";

/**
 * Phase 1 — 1500 → 1700 : fondamentaux structurels (semaines 1 à 7).
 *
 * Parcours du palais : la Cathédrale (lignes) → les Remparts (pions) → le
 * Jardin (finales de pions) → l'Atelier (tactique) → le Sanctuaire (cases et
 * pièces mineures) → le Donjon (attaque du roi) → les Remparts de la Tour
 * (finales de tours). Chaque jour 7 est un jour de rétention : aucun contenu
 * nouveau, test sur J-7 et révision entrelacée.
 *
 * Texte seulement : les puzzles sont tirés par le générateur à partir de
 * `sourcing`, filtrés sur l'échiquier (`geometry`) et vérifiés par Stockfish.
 */

const RET = (semaine: number, metaphores: string[], titre: string, focus: string, extra: string[]): DaySpec => ({
  semaine,
  jour: 7,
  metaphore_id: metaphores[0],
  theme_metaphore: `${titre} — jour de rétention`,
  concept: "révision entrelacée et test de rétention J+7",
  cours:
    "Aucun lieu nouveau aujourd'hui. Tu refais la visite complète du quartier, de mémoire, dans l'ordre où tu l'as construit, puis à l'envers. Pour chaque lieu : l'image (ce que tu vois), la règle (ce qu'elle dit de l'échiquier), et une position de la semaine qui l'illustre. Le test de rétention rejoue des puzzles d'il y a sept jours : il décide si la semaine est validée. Un échec n'est pas une sanction : la semaine est rejouée avec des puzzles neufs sur les mêmes concepts, parce qu'un lieu mal bâti ne supporte pas les étages suivants.",
  ancrage_sensoriel:
    "Ferme les yeux et marche physiquement : un pas par lieu du quartier, à voix haute. Le mouvement du corps associé à chaque lieu sert d'ancre supplémentaire au rappel.",
  rappels: metaphores,
  focus_partie: focus,
  reconsolidation: {
    type: "test_retention_j7",
    consigne:
      "Rejoue sans aucune aide les puzzles tirés de la semaine précédente : squelette d'abord, solution ensuite. Seuil de validation : 70 % de réussites complètes. En dessous, la semaine est rejouée avec de nouveaux puzzles.",
  },
  checklist: [
    "Test de rétention terminé sans indice",
    "Quartier récité dans l'ordre puis à l'envers",
    "Puzzles entrelacés résolus (thèmes mélangés)",
    "Partie longue jouée et annotée avec les lieux du palais",
    ...extra,
  ],
});

export const PHASE_1_DAYS: readonly DaySpec[] = [
  // ═══ Semaine 1 — La Cathédrale Linéaire ═══════════════════════════════════
  {
    semaine: 1, jour: 1, metaphore_id: "nef", theme_metaphore: "La Cathédrale Linéaire — la Nef",
    concept: "colonnes ouvertes",
    cours:
      "Tu entres dans la Cathédrale par le grand portail. Devant toi s'ouvre la nef : une allée droite, sans aucun banc, qui file jusqu'au chœur. Sur l'échiquier, c'est une colonne sans pion. Trois règles gravées sur les piliers. Un : la première tour qui entre dans la nef la possède ; la seconde arrive trop tard. Deux : on ne prend pas la nef pour la promenade, on la prend pour atteindre le chœur, c'est-à-dire les 7e et 8e rangées adverses. Trois : si l'adversaire te dispute la nef, double tes tours, puisque deux gardiens valent mieux qu'un. Avant chaque coup en milieu de partie, demande-toi : quelle nef vient de s'ouvrir, et qui y entrera le premier ?",
    ancrage_sensoriel:
      "Entends l'écho de tes pas qui résonne sur les dalles de la nef vide, et sens le courant d'air froid qui la traverse d'un bout à l'autre : rien ne l'arrête, comme la tour.",
    rappels: [],
    focus_partie: "chaque fois qu'une colonne s'ouvre (échange de pions) : qui y a placé une tour en premier ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Sur papier, dessine de mémoire la position du 3e puzzle, puis colorie la nef (la colonne ouverte) et marque la case du chœur visée. Compare ensuite avec l'écran et note les pièces oubliées." },
    checklist: ["Squelette désigné avant chaque solution", "Image de la nef formulée à voix haute", "Une colonne ouverte repérée dans ma partie"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "openFile", fallbackThemes: ["rookEndgame", "queenRookEndgame"] },
  },
  {
    semaine: 1, jour: 2, metaphore_id: "tribune", theme_metaphore: "La Cathédrale Linéaire — la Tribune",
    concept: "la 7e rangée",
    cours:
      "Au bout de la nef, un escalier en colimaçon monte à la tribune, la galerie haute qui court tout le long de la cathédrale, juste sous la voûte. Sur l'échiquier, c'est la 7e rangée, la 2e pour les Noirs. De là-haut, la tour voit tous les pions adverses encore sur leur case de départ, alignés comme des fidèles sur un banc : elle les attaque de flanc, là où aucun pion ne se protège. Elle enferme aussi le roi sur sa dernière rangée. La règle de la tribune : une tour à la 7e vaut souvent un pion, deux tours à la 7e (les « cochons ») gagnent souvent la partie. Le lien avec hier : on monte à la tribune PAR la nef. Pas de colonne ouverte, pas de tribune.",
    ancrage_sensoriel:
      "Sens sous ta main la rampe de pierre froide de la tribune, et regarde en contrebas les têtes alignées des pions : tu les domines toutes d'un seul regard.",
    rappels: ["nef"],
    focus_partie: "les moments où une tour pouvait monter à la 7e : par quelle nef ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pars de la position FINALE du puzzle le plus difficile de la séance et remonte la combinaison coup par coup jusqu'à la position de départ, à voix haute, sans écran." },
    checklist: ["Squelette désigné avant chaque solution", "Lien nef → tribune expliqué", "Une entrée en 7e rangée cherchée dans ma partie"],
    sourcing: { anyThemes: [], noThemes: ["opening"], geometry: "seventhRank", fallbackThemes: ["rookEndgame"] },
  },
  {
    semaine: 1, jour: 3, metaphore_id: "canon", theme_metaphore: "La Cathédrale Linéaire — le Canon",
    concept: "batterie Dame + Tour, tours doublées",
    cours:
      "Dans la nef, on a hissé un canon. Deux pièces lourdes sur la même ligne : celle de derrière est la poudre, celle de devant le boulet. Seule, une tour qui frappe une case défendue rebondit. Adossée à une deuxième pièce lourde, elle traverse. Règle du canon : compte les attaquants et les défenseurs de la case visée ; le canon gagne quand la poudre fait la différence. Le boulet part en premier (la pièce de devant), la poudre suit et occupe la case. Deux variantes : le canon vertical (tours doublées dans la nef) et le canon diagonal (dame derrière un fou, sur le roi roqué). Lien avec la tribune : un canon tiré dans la nef finit à la 7e rangée.",
    ancrage_sensoriel:
      "Sens l'odeur de poudre et la vibration du sol quand le canon tire : le recul pousse la pièce de derrière vers l'avant, dans la trace du boulet.",
    rappels: ["nef", "tribune"],
    focus_partie: "toutes les occasions de doubler tes tours ou d'aligner dame et tour sur une ligne ouverte.",
    reconsolidation: { type: "recitation", consigne: "Sans support, récite les trois lieux de la Cathédrale (Nef, Tribune, Canon) : l'image, la règle, et un puzzle de la semaine pour chacun. Enregistre-toi et réécoute pour repérer les hésitations." },
    checklist: ["Squelette désigné avant chaque solution", "Compte attaquants/défenseurs fait avant chaque capture", "Un canon construit dans ma partie"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "battery", fallbackThemes: ["xRayAttack"] },
  },
  {
    semaine: 1, jour: 4, metaphore_id: "crypte", theme_metaphore: "La Cathédrale Linéaire — la Crypte scellée",
    concept: "mat du couloir",
    cours:
      "Sous le chœur, un escalier descend à la crypte. Le roi roqué y dort, derrière ses trois pions intacts : ils le protègent, mais ils sont aussi les murs de sa tombe. Sa seule issue est la dalle, c'est-à-dire sa dernière rangée. Une tour ou une dame qui y arrive avec échec scelle la crypte : mat. Trois questions avant chaque coup en milieu de partie : la dernière rangée adverse est-elle gardée par une seule pièce ? Cette pièce a-t-elle un autre travail ? Puis-je la détourner ou la prendre ? Et pour toi : un « luft » (h3, g3, h6) creuse une sortie de secours. Lien avec la nef : c'est par la nef que le canon descend jusqu'à la dalle.",
    ancrage_sensoriel:
      "Entends le grincement sourd de la dalle de pierre qui glisse et se referme, puis le silence total de la crypte : plus aucune issue.",
    rappels: ["nef", "canon"],
    focus_partie: "la solidité de TA dernière rangée à chaque échange de pièces lourdes : as-tu une issue de secours ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la crypte du 2e puzzle : le roi, ses trois pions, la pièce qui scelle. Indique en rouge la seule pièce qui gardait la dalle et pourquoi elle a cédé." },
    checklist: ["Squelette désigné avant chaque solution", "Gardien de la dernière rangée identifié à chaque puzzle", "Luft créé au bon moment dans ma partie"],
    sourcing: { anyThemes: ["backRankMate"], noThemes: ["mateIn1"], fallbackThemes: ["backRankMate"] },
  },
  {
    semaine: 1, jour: 5, metaphore_id: "bas-cote", theme_metaphore: "La Cathédrale Linéaire — le Bas-côté",
    concept: "colonnes semi-ouvertes",
    cours:
      "Le long de la nef courent les bas-côtés : des allées plus étroites, bordées de piliers. Sur l'échiquier, c'est une colonne où il ne reste qu'un pion, celui de l'adversaire. Ta tour y avance à couvert, le long du mur, jusqu'au pilier, le pion adverse, qu'elle vient frapper de face. Règle du bas-côté : on attaque le pilier avec plus de pièces qu'il n'a de défenseurs, et s'il recule ou s'échange, le bas-côté devient une nef. C'est la colonne c dans le Gambit Dame, la colonne f quand le pion f est parti. Lien avec le canon : on double les tours dans le bas-côté pour charger le canon contre le pilier.",
    ancrage_sensoriel:
      "Touche les piliers rugueux du bas-côté en avançant à tâtons, la main gauche contre le mur, jusqu'à sentir la colonne froide du pion adverse.",
    rappels: ["nef", "canon"],
    focus_partie: "les colonnes où ne reste qu'un pion adverse : l'as-tu mis sous pression ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Reprends le puzzle le plus long : depuis la position finale, nomme chaque coup à l'envers et, pour chacun, le pilier visé." },
    checklist: ["Squelette désigné avant chaque solution", "Pilier (pion) du bas-côté nommé à chaque puzzle", "Pression sur une colonne semi-ouverte dans ma partie"],
    sourcing: { anyThemes: [], noThemes: ["opening"], geometry: "semiOpenFile", fallbackThemes: ["rookEndgame"] },
  },
  {
    semaine: 1, jour: 6, metaphore_id: "pierre-descellee", theme_metaphore: "La Cathédrale Linéaire — la Pierre descellée",
    concept: "pièces non défendues",
    cours:
      "En levant les yeux vers la voûte, tu remarques une pierre descellée : rien ne la tient. Sur l'échiquier, c'est une pièce que rien ne défend. Elle ne tombe pas forcément tout de suite, mais le moindre choc (une fourchette, un échec à la découverte, une enfilade) la fait chuter. Rituel avant chaque coup, le « scan des pierres » : pour chaque pièce des deux camps, qui la défend ? Les pièces sans défenseur sont tes cibles et tes risques. C'est la cause numéro un des parties perdues entre 1500 et 1700. Lien avec toute la semaine : la nef, la tribune et le canon servent surtout à frapper des pierres descellées.",
    ancrage_sensoriel:
      "Entends le petit crissement de la pierre qui bouge dans la voûte, et sens une fine poussière tomber sur ton visage : un avertissement avant la chute.",
    rappels: ["nef", "tribune", "canon"],
    focus_partie: "faire le scan des pierres descellées à CHAQUE coup, pendant toute la partie.",
    reconsolidation: { type: "recitation", consigne: "Récite sans support le rituel du scan des pierres, puis applique-le à voix haute, les yeux fermés, à la position du 4e puzzle reconstruite de mémoire." },
    checklist: ["Squelette désigné avant chaque solution", "Scan des pierres fait avant chaque coup de la partie", "Zéro pièce laissée en prise dans ma partie"],
    sourcing: { anyThemes: ["hangingPiece"], noThemes: ["mateIn1"], fallbackThemes: ["hangingPiece"] },
  },
  RET(1, ["nef", "tribune", "canon", "crypte", "bas-cote", "pierre-descellee"], "La Cathédrale Linéaire", "chaque lieu de la Cathédrale rencontré dans la partie, noté dans les marges.", ["Les 6 lieux de la Cathédrale récités sans erreur"]),

  // ═══ Semaine 2 — Les Remparts ═════════════════════════════════════════════
  {
    semaine: 2, jour: 1, metaphore_id: "muraille", theme_metaphore: "Les Remparts — la Muraille fortifiée",
    concept: "chaînes de pions",
    cours:
      "En sortant de la Cathédrale, tu longes les Remparts. La première section est une muraille en escalier : des pierres posées en diagonale, chacune tenue par celle d'en dessous. C'est la chaîne de pions (e5-d4-c3, ou d5-e4 contre e5-d6). Règle de Nimzowitsch, gravée sur la pierre d'angle : on attaque une chaîne à sa BASE, la seule pierre que rien ne tient. La tête de la chaîne indique de quel côté jouer : la chaîne pointe vers l'aile où l'on attaque. Deux erreurs classiques : attaquer la tête (on se heurte à toute la muraille), et oublier que la muraille bloque aussi tes propres fous (souviens-toi des piliers du bas-côté).",
    ancrage_sensoriel:
      "Pose la main sur la pierre d'angle, tout en bas de la muraille : elle est fissurée et branlante, alors que celles du haut sont solides et chaudes de soleil.",
    rappels: ["bas-cote", "pierre-descellee"],
    focus_partie: "repère les chaînes de pions : où est leur base, et qui l'attaque ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la structure de pions du 1er puzzle (pions seulement), entoure la base de chaque chaîne, puis vérifie à l'écran." },
    checklist: ["Squelette désigné avant chaque solution", "Base de la chaîne nommée à chaque puzzle", "Plan « attaquer la base » formulé dans ma partie"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1", "mateIn2"], geometry: "pawnChain", fallbackThemes: ["advancedPawn"] },
  },
  {
    semaine: 2, jour: 2, metaphore_id: "phare", theme_metaphore: "Les Remparts — le Phare",
    concept: "le pion isolé",
    cours:
      "Plus loin, la muraille s'interrompt. Sur un rocher isolé se dresse un phare : c'est le pion isolé, sans pion voisin sur les colonnes adjacentes. Il éclaire loin : il contrôle des cases d'avant-poste (e5 et c5 pour un pion d4) et les colonnes ouvertes autour de lui donnent de l'activité aux pièces. Mais aucun voisin ne viendra le défendre, et la case devant lui, le seuil, est un sanctuaire pour l'adversaire : rien ne peut en chasser le bloqueur. Règles. Avec le phare : jouer vite, attaquer, préparer la poussée d4-d5 qui libère tout. Contre le phare : bloquer le seuil avec un cavalier, échanger les pièces, attaquer le pion en finale.",
    ancrage_sensoriel:
      "Vois le faisceau du phare balayer la mer dans l'obscurité, et entends les vagues frapper le rocher nu autour de lui : il est seul.",
    rappels: ["muraille", "bas-cote"],
    focus_partie: "si un pion isolé apparaît : es-tu du côté du phare (activité) ou du bloqueur (simplification) ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour le puzzle le plus difficile, pars de la position finale et remonte la ligne. À chaque coup, dis si le phare a été attaqué, poussé ou bloqué." },
    checklist: ["Squelette désigné avant chaque solution", "Seuil du phare identifié à chaque puzzle", "Plan avec ou contre le pion isolé nommé"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "isolatedPawn", fallbackThemes: ["advancedPawn"] },
  },
  {
    semaine: 2, jour: 3, metaphore_id: "colonnes-jumelles", theme_metaphore: "Les Remparts — les Colonnes jumelles",
    concept: "pions doublés",
    cours:
      "Au détour du chemin de ronde, deux colonnes de pierre se dressent l'une derrière l'autre : de face, on n'en voit qu'une. Ce sont les pions doublés. Leur problème : ils ne se protègent pas l'un l'autre, celui de derrière ne contrôle aucune case utile devant lui, et la colonne voisine est désormais vide, donc le bas-côté de l'adversaire. Leur avantage, parfois : une colonne semi-ouverte en plus pour toi, et plus de contrôle central (le pion doublé c peut contrôler d4). Règle : on double les pions de l'adversaire quand la colonne ouverte ne lui sert pas. On accepte les siens quand on reçoit de l'activité en échange. En finale, les colonnes jumelles sont presque toujours une faiblesse.",
    ancrage_sensoriel:
      "Fais le tour des deux colonnes : de face, elles se cachent l'une l'autre ; de côté, tu vois l'ombre de la première tomber sur la seconde.",
    rappels: ["phare", "bas-cote"],
    focus_partie: "chaque reprise de pion qui double une structure : qui en profite, et pourquoi ?",
    reconsolidation: { type: "recitation", consigne: "Récite sans support les trois lieux des Remparts vus jusqu'ici (Muraille, Phare, Colonnes jumelles) avec, pour chacun, la règle et la contre-règle." },
    checklist: ["Squelette désigné avant chaque solution", "Avantages / inconvénients des pions doublés listés", "Une décision de doubler / ne pas doubler justifiée en partie"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "doubledPawns", fallbackThemes: ["endgame"] },
  },
  {
    semaine: 2, jour: 4, metaphore_id: "escalier", theme_metaphore: "Les Remparts — l'Escalier du Belvédère",
    concept: "le pion passé",
    cours:
      "Une tourelle s'élève sur les Remparts. À l'intérieur, un escalier monte au belvédère sans qu'aucune porte ne ferme la cage : c'est le pion passé, qu'aucun pion adverse ne peut plus arrêter, ni de face ni par capture. Chaque marche le rapproche de la case de promotion. L'adversaire n'a qu'un recours, se placer DEVANT lui pour le bloquer, d'où la maxime de Nimzowitsch : « un pion passé doit être poussé », et son pendant : « on bloque un pion passé avec un cavalier ». Plus il monte, plus il coûte cher à l'adversaire : sur la 6e ou la 7e marche, une pièce entière doit souvent se sacrifier pour lui. Lien avec la tribune : un pion passé sur la 7e, soutenu par une tour, est une menace permanente.",
    ancrage_sensoriel:
      "Compte les marches à voix haute en montant l'escalier en colimaçon, et sens l'air devenir plus vif à chaque palier, jusqu'au vent du belvédère.",
    rappels: ["tribune", "phare"],
    focus_partie: "quand un pion passé apparaît : est-il poussé, bloqué, ou oublié ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la position du 5e puzzle, numérote les marches restantes du pion passé et marque la case du bloqueur idéal." },
    checklist: ["Squelette désigné avant chaque solution", "Marches restantes comptées pour chaque pion passé", "Pion passé poussé ou bloqué à temps dans ma partie"],
    sourcing: { anyThemes: ["advancedPawn", "promotion"], noThemes: ["mateIn1"], geometry: "passedPawnPush", fallbackThemes: ["advancedPawn", "promotion"] },
  },
  {
    semaine: 2, jour: 5, metaphore_id: "cour-carree", theme_metaphore: "Les Remparts — la Cour carrée",
    concept: "la règle du carré",
    cours:
      "Au pied de l'escalier s'étend une cour carrée, dallée de pierre. Un côté de la cour est le chemin du pion passé jusqu'au belvédère ; la cour est le carré construit sur ce chemin. Règle du carré : si le roi adverse peut entrer dans la cour au prochain pas (avec le trait), il rattrape le pion ; sinon, la course est perdue, sans calcul. Deux pièges : le pion sur sa case de départ peut avancer de deux cases (on trace la cour depuis la case d'après), et un obstacle sur le chemin du roi (ses propres pions) peut l'empêcher d'entrer. C'est le premier outil de calcul des finales de pions, et il évite de compter coup par coup.",
    ancrage_sensoriel:
      "Vois les dalles de la cour s'illuminer une à une, formant un carré parfait au sol ; le roi adverse court vers le bord de la lumière.",
    rappels: ["escalier"],
    focus_partie: "dans toute finale de pions de ta partie, trace la cour carrée avant de calculer.",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Reconstruis de mémoire la position du 2e puzzle, trace la cour carrée, puis rejoue la ligne à l'envers en vérifiant à chaque coup si le roi est dans la cour." },
    checklist: ["Squelette désigné avant chaque solution", "Cour carrée tracée avant le calcul de chaque course", "Exceptions (pion en case de départ, obstacle) vérifiées"],
    sourcing: { anyThemes: ["pawnEndgame"], geometry: "squareRule", fallbackThemes: ["pawnEndgame"] },
  },
  {
    semaine: 2, jour: 6, metaphore_id: "escalier", theme_metaphore: "Les Remparts — bâtir l'Escalier",
    concept: "créer un pion passé (majorité de pions)",
    cours:
      "Retour à l'Escalier du Belvédère, mais aujourd'hui tu le BÂTIS. Une majorité de pions sur une aile (3 contre 2, 2 contre 1) contient un escalier en germe. Règle de construction : on pousse en premier le pion qui n'a pas d'adversaire en face, celui de la colonne libre. Les autres suivent pour l'appuyer, et l'échange final libère le pion passé. Un pion candidat est celui qui deviendra passé. Lien avec la muraille : une chaîne qui avance est souvent une majorité qui se transforme. Lien avec la cour carrée : un escalier bâti loin du roi adverse (sur l'aile opposée) l'oblige à sortir de sa cour pour le rattraper.",
    ancrage_sensoriel:
      "Entends le bruit des pierres qu'on empile une à une pour bâtir l'escalier, et sens le poids de chaque pierre dans tes bras.",
    rappels: ["escalier", "muraille", "cour-carree"],
    focus_partie: "identifie tes majorités de pions et le pion candidat de chacune.",
    reconsolidation: { type: "recitation", consigne: "Récite sans support la règle de construction de l'escalier et applique-la à voix haute à une structure 3 contre 2 imaginée (pions a, b, c contre a, b)." },
    checklist: ["Squelette désigné avant chaque solution", "Pion candidat nommé à chaque puzzle", "Majorité identifiée dans ma partie"],
    sourcing: { anyThemes: ["advancedPawn", "promotion", "endgame"], noThemes: ["mateIn1", "mateIn2"], geometry: "createPassedPawn", fallbackThemes: ["advancedPawn"] },
  },
  RET(2, ["muraille", "phare", "colonnes-jumelles", "escalier", "cour-carree", "nef"], "Les Remparts", "les structures de pions de la partie dessinées après coup, avec les lieux des Remparts.", ["Les 5 lieux des Remparts récités avec leur règle et leur contre-règle"]),

  // ═══ Semaine 3 — Le Jardin du Triangle d'Or ═══════════════════════════════
  {
    semaine: 3, jour: 1, metaphore_id: "roi-jardinier", theme_metaphore: "Le Jardin du Triangle d'Or — le Roi jardinier",
    concept: "le roi actif en finale",
    cours:
      "Derrière les Remparts s'étend un jardin à la française. Ici, le roi n'est plus le dormeur de la crypte : il devient jardinier. En finale, quand les dames ont disparu, le roi est une pièce d'attaque qui vaut environ quatre pions. Sa place est au centre du jardin, d'où il atteint chaque parterre en un minimum de pas. Règles du jardinier : en finale de pions, le roi le plus actif gagne presque toujours ; marche vers le centre AVANT de pousser les pions ; et un roi devant ses pions vaut mieux qu'un roi derrière. Lien avec la crypte : le même roi qu'on protégeait en milieu de partie doit maintenant sortir. L'erreur la plus fréquente est de le laisser dormir.",
    ancrage_sensoriel:
      "Sens le gravier crisser sous les pas du roi qui sort de la crypte et marche vers la fontaine au centre du jardin, l'arrosoir à la main.",
    rappels: ["crypte", "escalier"],
    focus_partie: "à quel coup ton roi aurait-il dû quitter le roque pour marcher vers le centre ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la position du 3e puzzle avec seulement les rois et les pions, puis trace le chemin le plus court du roi actif vers son parterre cible." },
    checklist: ["Squelette désigné avant chaque solution", "Distance des rois aux pions comptée à chaque puzzle", "Roi centralisé dès l'entrée en finale de ma partie"],
    sourcing: { anyThemes: ["pawnEndgame"], geometry: "activeKing", fallbackThemes: ["pawnEndgame"] },
  },
  {
    semaine: 3, jour: 2, metaphore_id: "vis-a-vis", theme_metaphore: "Le Jardin du Triangle d'Or — le Vis-à-vis",
    concept: "l'opposition",
    cours:
      "Au milieu du jardin, deux statues se font face avec une seule dalle entre elles : c'est l'opposition. Les rois ne peuvent jamais se toucher, donc celui qui a le trait doit céder un passage, à gauche ou à droite. Règle : avoir l'opposition, c'est faire en sorte que ce soit À L'ADVERSAIRE de jouer quand les rois se font face. Le roi qui l'a passe, l'autre recule. Trois formes : l'opposition directe (même colonne ou même rangée, une case entre), l'opposition éloignée (nombre impair de cases entre), l'opposition diagonale. Pour la finale roi + pion contre roi : le roi devant son pion, avec l'opposition, gagne ; sans elle, c'est nul. Lien avec la cour carrée : ici, le roi n'est plus en course, il manœuvre.",
    ancrage_sensoriel:
      "Regarde les deux statues de pierre se fixer du regard ; entends le silence tendu entre elles : celle qui bouge la première perd.",
    rappels: ["roi-jardinier", "cour-carree"],
    focus_partie: "toute position de rois face à face : qui avait le trait, donc qui avait l'opposition ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour le puzzle le plus difficile, rejoue la ligne à l'envers et indique à chaque coup qui possède l'opposition." },
    checklist: ["Squelette désigné avant chaque solution", "Opposition directe / éloignée / diagonale distinguée", "Règle roi + pion contre roi récitée"],
    sourcing: { anyThemes: ["pawnEndgame"], geometry: "opposition", fallbackThemes: ["pawnEndgame"] },
  },
  {
    semaine: 3, jour: 3, metaphore_id: "triangle-or", theme_metaphore: "Le Jardin du Triangle d'Or — le Triangle d'or",
    concept: "triangulation et manœuvres de roi",
    cours:
      "Au fond du jardin, trois allées forment un triangle autour d'un massif : le Triangle d'or. Le roi qui en fait le tour (trois pas) revient au même banc… mais le trait est passé à l'adversaire. C'est la triangulation : perdre un temps exprès quand le roi adverse, coincé, ne peut pas en faire autant (il n'a que deux cases à alterner). On l'utilise pour reprendre l'opposition qu'on n'avait pas. Règle : si la position serait gagnante avec l'adversaire au trait, cherche le triangle. Lien avec le vis-à-vis : le triangle d'or est la clé qui transforme une opposition perdue en opposition gagnée. Il annonce aussi la porte tournante (le zugzwang) que tu verras samedi.",
    ancrage_sensoriel:
      "Marche réellement en triangle dans ta pièce, trois pas, en revenant à ton point de départ : sens que rien n'a changé, sauf le trait.",
    rappels: ["vis-a-vis", "roi-jardinier"],
    focus_partie: "dans tes finales : y avait-il un temps à perdre pour mettre l'adversaire au trait ?",
    reconsolidation: { type: "recitation", consigne: "Récite sans support le principe de la triangulation et explique-le à voix haute sur la position du 2e puzzle reconstruite de mémoire." },
    checklist: ["Squelette désigné avant chaque solution", "Question « qui voudrait passer son tour ? » posée à chaque puzzle", "Triangle d'or mimé physiquement"],
    sourcing: { anyThemes: ["pawnEndgame"], geometry: "kingManoeuvre", fallbackThemes: ["pawnEndgame"] },
  },
  {
    semaine: 3, jour: 4, metaphore_id: "allee-eloignee", theme_metaphore: "Le Jardin du Triangle d'Or — l'Allée éloignée",
    concept: "le pion passé éloigné",
    cours:
      "Au bout de l'allée la plus lointaine du jardin, on a planté un leurre : un pion passé sur une aile, loin du reste des pions. C'est le pion passé éloigné. Le roi adverse doit aller le chercher (souviens-toi de la cour carrée). Pendant ce temps, le jardin principal reste sans gardien, et ton roi jardinier y récolte tous les pions. Règle : en finale de pions, le pion passé éloigné vaut souvent la partie, même à matériel égal. On le sacrifie au bon moment pour dévier le roi. Lien avec l'escalier : bâtis ton escalier sur l'aile la plus éloignée du roi adverse. Lien avec le jardinier : le leurre ne sert que si ton roi est prêt à entrer.",
    ancrage_sensoriel:
      "Vois le roi adverse courir dans l'allée lointaine, de plus en plus petit, pendant que tu entends ton propre roi cueillir les pions du jardin central.",
    rappels: ["escalier", "cour-carree", "roi-jardinier"],
    focus_partie: "dans tes transitions vers la finale : lequel des deux camps aurait un pion passé éloigné ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire le 4e puzzle, rois et pions seulement : flèche du roi adverse vers le leurre, flèche de ton roi vers le jardin. Compte les pas de chacun." },
    checklist: ["Squelette désigné avant chaque solution", "Pas comptés pour le leurre et pour le jardin", "Finale anticipée dans ma partie : qui aurait le pion éloigné ?"],
    sourcing: { anyThemes: ["pawnEndgame"], geometry: "outsidePasser", fallbackThemes: ["pawnEndgame"] },
  },
  {
    semaine: 3, jour: 5, metaphore_id: "breche", theme_metaphore: "Le Jardin du Triangle d'Or — la Brèche",
    concept: "la percée de pions",
    cours:
      "Une haie de buis ferme le jardin : trois pions contre trois, face à face. On ne la traverse pas en poussant un pion seul : on sacrifie une pierre pour ouvrir une brèche. Le motif classique (pions a5-b5-c5 contre a7-b7-c7) : b6 ! puis, quoi que l'adversaire prenne, un pion passe par le trou et ne peut plus être rattrapé. Conditions de la brèche : les pions qui percent sont plus avancés que le roi adverse ne peut en rattraper (cour carrée !), et ton propre roi n'est pas dans la course. Lien avec l'escalier : la brèche crée un pion passé en un seul coup, par la force. Lien avec la cour carrée : on vérifie TOUJOURS que le roi adverse est hors de la cour après la brèche.",
    ancrage_sensoriel:
      "Entends le craquement des branches de buis qui cèdent, et vois un seul pion se faufiler par le trou pendant que les deux autres restent pris dans la haie.",
    rappels: ["escalier", "cour-carree", "allee-eloignee"],
    focus_partie: "les structures pions contre pions bloqués : une brèche était-elle possible ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Reconstruis la brèche du puzzle le plus spectaculaire depuis la promotion jusqu'à la position initiale, en nommant chaque sacrifice." },
    checklist: ["Squelette désigné avant chaque solution", "Cour carrée vérifiée après chaque brèche", "Motif a5-b5-c5 récité de mémoire"],
    sourcing: { anyThemes: ["pawnEndgame"], geometry: "breakthrough", fallbackThemes: ["pawnEndgame", "advancedPawn"] },
  },
  {
    semaine: 3, jour: 6, metaphore_id: "porte-tournante", theme_metaphore: "Le Jardin du Triangle d'Or — la Porte tournante",
    concept: "le zugzwang",
    cours:
      "À la sortie du jardin, une lourde porte tournante. Celui qui doit la pousser se retrouve dehors, alors que rester immobile l'aurait sauvé. C'est le zugzwang : toute la position tient, sauf que l'adversaire DOIT jouer, et chaque coup aggrave sa situation. Aux échecs on ne peut pas passer son tour, et c'est ce qui rend la porte tournante si puissante en finale, où il reste peu de coups « gratuits ». Comment la construire : supprime les coups d'attente de l'adversaire (fixe ses pions), garde les tiens en réserve (un pion qui peut encore avancer d'une ou deux cases). Lien avec le vis-à-vis et le triangle d'or : l'opposition est le zugzwang des rois, et la triangulation sert à remettre la porte face à l'adversaire.",
    ancrage_sensoriel:
      "Sens la poignée froide de la porte tournante dans ta main, et le déclic quand elle t'entraîne dehors malgré toi.",
    rappels: ["vis-a-vis", "triangle-or"],
    focus_partie: "dans tes finales : as-tu gardé des coups d'attente en réserve ? L'adversaire en avait-il ?",
    reconsolidation: { type: "recitation", consigne: "Récite sans support tout le Jardin : jardinier, vis-à-vis, triangle d'or, allée éloignée, brèche, porte tournante. Pour chacun : l'image, la règle, et un puzzle de la semaine." },
    checklist: ["Squelette désigné avant chaque solution", "Coups d'attente des deux camps comptés à chaque puzzle", "Les 6 lieux du Jardin récités"],
    sourcing: { anyThemes: ["zugzwang"], fallbackThemes: ["zugzwang", "quietMove"] },
  },
  RET(3, ["roi-jardinier", "vis-a-vis", "triangle-or", "allee-eloignee", "breche", "porte-tournante"], "Le Jardin du Triangle d'Or", "si ta partie entre en finale : quels lieux du Jardin as-tu utilisés ?", ["Une finale de pions jouée contre le bot depuis une position de puzzle"]),

  // ═══ Semaine 4 — L'Atelier du Charpentier ═════════════════════════════════
  {
    semaine: 4, jour: 1, metaphore_id: "epingle", theme_metaphore: "L'Atelier du Charpentier — l'Épingle",
    concept: "le clouage",
    cours:
      "Tu entres dans l'atelier du charpentier, qui sent la sciure. Sur l'établi, une poutre est fixée au mur porteur par une longue cheville qui la traverse : c'est le clouage. La pièce clouée (la poutre) ne peut pas bouger sans exposer ce qu'il y a derrière (le mur). Clouage absolu : le mur est le roi, la poutre ne peut LÉGALEMENT pas bouger. Clouage relatif : le mur est une pièce plus précieuse, la poutre peut bouger, mais au prix de cette pièce. Règle de l'atelier : on ne prend pas tout de suite la pièce clouée, on enfonce la cheville. On l'attaque une deuxième fois, souvent avec un pion, car elle ne peut pas fuir. Lien avec la cathédrale : seules les pièces de ligne (fou, tour, dame) plantent des chevilles, et elles le font dans la nef ou sur les diagonales.",
    ancrage_sensoriel:
      "Entends les coups de maillet qui enfoncent la cheville de bois, et sens la poutre vibrer sans pouvoir bouger d'un millimètre.",
    rappels: ["nef", "pierre-descellee"],
    focus_partie: "chaque clouage de la partie : absolu ou relatif ? quelqu'un a-t-il enfoncé la cheville ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire le 2e puzzle et trace la cheville : pièce qui cloue → poutre → mur. Note si le clouage était absolu ou relatif." },
    checklist: ["Squelette désigné avant chaque solution", "Mur (pièce derrière) nommé pour chaque clouage", "Une cheville enfoncée (attaque de la pièce clouée) dans ma partie"],
    sourcing: { anyThemes: ["pin"], noThemes: ["mateIn1"], fallbackThemes: ["pin"] },
  },
  {
    semaine: 4, jour: 2, metaphore_id: "broche", theme_metaphore: "L'Atelier du Charpentier — la Broche",
    concept: "l'enfilade et l'attaque en rayons X",
    cours:
      "Au plafond de l'atelier pend une broche à rôtir : une tige qui traverse deux pièces de viande alignées. C'est l'enfilade, le clouage à l'envers : la pièce la plus PRÉCIEUSE est devant. Attaquée, elle doit s'écarter, et la broche ressort pour embrocher celle qui était cachée derrière. Exemple type : un échec de tour sur la rangée, le roi s'écarte, la tour prend la dame derrière lui. Variante, les rayons X : une pièce agit À TRAVERS une autre (la tour derrière la tour adverse défend tout de même la case derrière). Règle : chaque fois que deux pièces adverses sont alignées avec une case vide d'où tu peux viser, cherche la broche, la plus précieuse en premier.",
    ancrage_sensoriel:
      "Sens la chaleur du feu et entends le grésillement quand la broche traverse la première pièce et ressort de l'autre côté.",
    rappels: ["epingle", "canon"],
    focus_partie: "toutes les paires de pièces adverses alignées (roi-dame, dame-tour) : la broche était-elle là ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Rejoue à l'envers le puzzle le plus long, en précisant à chaque coup quelle pièce était devant, quelle pièce derrière." },
    checklist: ["Squelette désigné avant chaque solution", "Différence clouage / enfilade expliquée à voix haute", "Alignements adverses repérés dans ma partie"],
    sourcing: { anyThemes: ["skewer", "xRayAttack"], noThemes: ["mateIn1"], fallbackThemes: ["skewer"] },
  },
  {
    semaine: 4, jour: 3, metaphore_id: "carrefour", theme_metaphore: "L'Atelier du Charpentier — le Carrefour",
    concept: "la fourchette et la double attaque",
    cours:
      "En sortant de l'atelier, tu arrives à un carrefour d'où partent deux rues, une maison au bout de chacune. La pièce posée au carrefour menace les deux maisons à la fois, et l'adversaire ne peut en barricader qu'une. C'est la fourchette, ou double attaque. Toutes les pièces en font : le cavalier (le plus traître, il saute les obstacles), le pion (fourchette de pion sur deux pièces), la dame (échec + pièce non défendue). Règle de repérage : cherche les maisons d'abord (pierres descellées, roi, dame), puis le carrefour, la case qui les touche toutes les deux. Pour le cavalier, deux cibles sur des cases de même couleur, à distance de « deux sauts », trahissent un carrefour.",
    ancrage_sensoriel:
      "Debout au milieu du carrefour, tourne la tête à gauche puis à droite : tu vois les deux portes au bout des rues en même temps.",
    rappels: ["pierre-descellee", "broche"],
    focus_partie: "repère avant chaque coup les cases-carrefours des cavaliers adverses.",
    reconsolidation: { type: "recitation", consigne: "Récite sans support la méthode « maisons d'abord, carrefour ensuite », puis applique-la les yeux fermés à la position du 3e puzzle reconstruite de mémoire." },
    checklist: ["Squelette désigné avant chaque solution", "Maisons repérées avant de chercher le carrefour", "Aucune fourchette de cavalier subie dans ma partie"],
    sourcing: { anyThemes: ["fork"], noThemes: ["mateIn1"], fallbackThemes: ["fork"] },
  },
  {
    semaine: 4, jour: 4, metaphore_id: "porte-derobee", theme_metaphore: "L'Atelier du Charpentier — la Porte dérobée",
    concept: "l'attaque à la découverte et l'échec double",
    cours:
      "Dans le mur de l'atelier, une bibliothèque pivote : c'est une porte dérobée. La pièce qui s'écarte (la bibliothèque) ouvre un passage secret à la pièce de derrière (le canon caché), et les deux frappent en même temps : la pièce qui bouge attaque une cible, celle qu'elle démasque en attaque une autre. Si la pièce démasquée donne échec, la pièce qui bouge peut aller N'IMPORTE OÙ, même se faire prendre : l'adversaire doit d'abord parer l'échec. Si les deux donnent échec, c'est l'échec double : seul le roi peut bouger. Règle : cherche tes propres pièces alignées devant une tour, un fou ou une dame qui vise le roi ou la dame adverse. Lien avec le canon : la porte dérobée est un canon dont le boulet s'écarte au lieu d'avancer.",
    ancrage_sensoriel:
      "Entends le grincement de la bibliothèque qui pivote, et sens le courant d'air froid qui sort du passage secret.",
    rappels: ["canon", "carrefour"],
    focus_partie: "tes pièces placées devant une pièce de ligne qui vise le camp adverse : une porte dérobée ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire le 1er puzzle : la bibliothèque (pièce qui s'écarte), le passage (ligne démasquée), et les deux cibles frappées." },
    checklist: ["Squelette désigné avant chaque solution", "Pièce masquante et pièce démasquée nommées à chaque puzzle", "Une découverte préparée dans ma partie"],
    sourcing: { anyThemes: ["discoveredAttack", "doubleCheck"], noThemes: ["mateIn1"], fallbackThemes: ["discoveredAttack"] },
  },
  {
    semaine: 4, jour: 5, metaphore_id: "pilier-surcharge", theme_metaphore: "L'Atelier du Charpentier — le Pilier surchargé",
    concept: "surcharge, déviation, élimination du défenseur",
    cours:
      "Au fond de l'atelier, un pilier soutient deux arches à la fois. Il tient, mais tout repose sur lui : c'est le défenseur surchargé. Trois manières de faire tomber la voûte. La déviation : on force le pilier à céder d'un côté (on lui offre quelque chose à prendre, ou on l'oblige à parer un échec), et l'autre arche s'écroule. L'élimination : on abat le pilier en le prenant, même au prix d'une pièce, et ce qu'il défendait tombe. La surcharge : on attaque les deux arches en même temps, il ne peut en tenir qu'une. Règle de repérage : pour chaque pièce adverse, demande « que défend-elle ? ». Si la réponse contient deux choses, tu as trouvé le pilier. Lien avec la crypte : le gardien de la dernière rangée est le pilier surchargé le plus fréquent.",
    ancrage_sensoriel:
      "Entends les craquements du pilier sous le poids des deux arches, et vois la poussière de mortier tomber de ses fissures.",
    rappels: ["crypte", "pierre-descellee", "epingle"],
    focus_partie: "pour chaque pièce adverse : que défend-elle ? Une pièce qui défend deux choses ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pars de la position finale du puzzle le plus difficile et remonte la ligne : à quel coup le pilier a-t-il cédé, et quelle arche est tombée ?" },
    checklist: ["Squelette désigné avant chaque solution", "Question « que défend-elle ? » posée pour chaque pièce adverse", "Déviation / élimination / surcharge distinguées"],
    sourcing: { anyThemes: ["deflection", "capturingDefender"], noThemes: ["mateIn1"], fallbackThemes: ["deflection", "capturingDefender"] },
  },
  {
    semaine: 4, jour: 6, metaphore_id: "cage", theme_metaphore: "L'Atelier du Charpentier — la Cage",
    concept: "la pièce piégée",
    cours:
      "Dans un coin de l'atelier, le charpentier a fabriqué une cage à oiseaux. Une pièce dont toutes les cases de fuite sont contrôlées est un oiseau en cage. Il n'est pas nécessaire de l'attaquer tout de suite : on ferme d'abord la porte, puis on vient la chercher avec une pièce de moindre valeur (souvent un pion). Victimes typiques : le fou qui prend un pion en a7/h7 et se fait enfermer par b6/g6, la dame qui va manger un pion b2 empoisonné, le cavalier au bord de l'échiquier (« cavalier au bord, cavalier mort »). Règle : avant d'attaquer une pièce, compte ses cases de fuite ; si elles sont toutes contrôlées, c'est une cage. Lien avec la pierre descellée : une pièce peut être défendue et tout de même perdue si elle est en cage.",
    ancrage_sensoriel:
      "Entends le petit clic métallique de la porte de la cage qui se referme, et l'oiseau qui bat des ailes contre les barreaux.",
    rappels: ["pierre-descellee", "carrefour"],
    focus_partie: "tes pièces aux bords de l'échiquier : combien de cases de fuite avaient-elles ?",
    reconsolidation: { type: "recitation", consigne: "Récite sans support tout l'Atelier (épingle, broche, carrefour, porte dérobée, pilier, cage), avec pour chacun la question de repérage associée." },
    checklist: ["Squelette désigné avant chaque solution", "Cases de fuite comptées pour la pièce cible", "Les 6 questions de repérage de l'Atelier récitées"],
    sourcing: { anyThemes: ["trappedPiece"], noThemes: ["mateIn1"], fallbackThemes: ["trappedPiece"] },
  },
  RET(4, ["epingle", "broche", "carrefour", "porte-derobee", "pilier-surcharge", "cage"], "L'Atelier du Charpentier", "chaque motif de l'Atelier apparu dans la partie, même non exploité.", ["Une liste des motifs ratés dans ma partie, avec le lieu de l'Atelier correspondant"]),

  // ═══ Semaine 5 — Le Sanctuaire ════════════════════════════════════════════
  {
    semaine: 5, jour: 1, metaphore_id: "sanctuaire", theme_metaphore: "Le Sanctuaire — la Case faible",
    concept: "cases faibles et avant-postes",
    cours:
      "Au cœur de la Cité, un sanctuaire : une case du camp adverse qu'aucun pion ennemi ne pourra JAMAIS attaquer, parce que les pions des colonnes voisines ont avancé ou disparu. C'est une case faible, et pour toi un avant-poste. Le cavalier qui s'y installe, soutenu par un de tes pions, y est intouchable : il ne peut être chassé que par un échange contre une pièce. Règles du sanctuaire : on repère les cases faibles en regardant les pions qui ne peuvent PLUS les couvrir ; on y amène un cavalier plutôt qu'un fou (le cavalier a besoin de proximité, le fou travaille de loin) ; et l'on évite de pousser ses propres pions sans réfléchir, car chaque poussée crée un sanctuaire derrière elle. Lien avec le phare : la case devant le pion isolé est le sanctuaire le plus célèbre.",
    ancrage_sensoriel:
      "Entre dans le sanctuaire : la lumière y est dorée, le bruit de la ville s'éteint, et tu sens que personne ne viendra te déloger.",
    rappels: ["phare", "muraille"],
    focus_partie: "les cases faibles créées par les poussées de pions des deux camps.",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la structure de pions du 2e puzzle, colorie en or chaque sanctuaire (case qu'aucun pion adverse ne peut plus attaquer) et place le cavalier idéal." },
    checklist: ["Squelette désigné avant chaque solution", "Sanctuaires repérés par l'absence de pion couvrant", "Un cavalier installé sur un avant-poste dans ma partie"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "outpost", fallbackThemes: ["fork"] },
  },
  {
    semaine: 5, jour: 2, metaphore_id: "tour-de-guet", theme_metaphore: "Le Sanctuaire — la Tour de guet",
    concept: "fianchetto et grande diagonale",
    cours:
      "Sur la colline qui domine le sanctuaire se dresse une tour de guet. Le fou en fianchetto (b2, g2, b7, g7) est posté sur sa plate-forme : il voit toute la grande diagonale jusqu'à l'autre bout de la ville. Le guetteur protège aussi le roi roqué qui dort à ses pieds. Deux règles. Pour toi : ne te sépare pas de ton fou de fianchetto sans raison, car sans lui les cases de sa couleur autour du roi deviennent des sanctuaires pour l'adversaire. Contre l'adversaire : échanger son guetteur (souvent avec Fh6 et Dd2) ouvre le donjon, et si sa diagonale est ouverte, la tour de guet vise ta tour en a1/h8 ou ton roi. Lien avec la porte dérobée : un cavalier qui s'écarte de la grande diagonale démasque souvent le guetteur.",
    ancrage_sensoriel:
      "Monte l'échelle de la tour de guet et sens le vent sur ton visage : d'en haut, tu vois la diagonale filer jusqu'à l'horizon.",
    rappels: ["sanctuaire", "porte-derobee"],
    focus_partie: "les grandes diagonales : qui les contrôlait, et à quel moment se sont-elles ouvertes ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Rejoue à l'envers le puzzle le plus long en suivant ce que voyait le guetteur (la grande diagonale) à chaque coup." },
    checklist: ["Squelette désigné avant chaque solution", "Diagonale du guetteur tracée à chaque puzzle", "Fou de fianchetto gardé (ou échangé à bon escient) dans ma partie"],
    sourcing: { anyThemes: [], noThemes: ["opening"], geometry: "fianchetto", fallbackThemes: ["discoveredAttack"] },
  },
  {
    semaine: 5, jour: 3, metaphore_id: "vitrail", theme_metaphore: "Le Sanctuaire — le Vitrail",
    concept: "bon fou et mauvais fou",
    cours:
      "Les fenêtres du sanctuaire sont des vitraux à deux couleurs de verre. Chaque fou ne voit qu'une couleur. Si ses propres pions sont posés sur ses vitres, il est emmuré derrière un vitrail opaque : c'est le mauvais fou. Le bon fou, lui, a ses pions sur l'autre couleur et voit dehors. Règles du vitrail : place tes pions sur la couleur OPPOSÉE à celle de ton fou restant ; quand l'adversaire a un mauvais fou, échange tes pièces mais garde celle qui joue sur l'autre couleur, celle que son fou ne défendra jamais ; et si tu as le mauvais fou, sors-le DEVANT ses pions avant de les fixer. Lien avec la muraille : la chaîne de pions fixe la couleur du vitrail pour toute la partie.",
    ancrage_sensoriel:
      "Vois le soleil traverser le vitrail : les éclats bleus passent, les éclats rouges sont murés et sombres. Ton fou est-il du côté de la lumière ?",
    rappels: ["muraille", "sanctuaire"],
    focus_partie: "après chaque fixation de la structure : ton fou restant est-il bon ou mauvais ?",
    reconsolidation: { type: "recitation", consigne: "Récite sans support les trois règles du vitrail, puis classe de mémoire chaque fou du 1er puzzle en bon ou mauvais, avec la raison." },
    checklist: ["Squelette désigné avant chaque solution", "Chaque fou classé bon/mauvais à chaque puzzle", "Pions placés selon la couleur de mon fou dans ma partie"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "badBishop", fallbackThemes: ["bishopEndgame"] },
  },
  {
    semaine: 5, jour: 4, metaphore_id: "deux-vitraux", theme_metaphore: "Le Sanctuaire — les Deux Vitraux",
    concept: "la paire de fous",
    cours:
      "Dans la nef du sanctuaire, deux vitraux se font face, l'un bleu, l'autre rouge : ensemble ils éclairent tout. La paire de fous contrôle les deux couleurs de cases, aucune case ne reste dans l'ombre. Elle vaut environ un demi-pion de plus que fou + cavalier, et sa force grandit à mesure que la position s'ouvre (plus de nefs, plus de lumière). Règles : avec la paire, ouvre la position et échange plutôt les tours que les fous ; contre la paire, ferme la position, et cherche à échanger un fou contre un cavalier. En finale, la paire de fous contre fou + cavalier gagne souvent seule. Lien avec la tour de guet : un des deux vitraux est souvent un guetteur en fianchetto.",
    ancrage_sensoriel:
      "Debout entre les deux vitraux, sens la lumière bleue sur ta joue gauche et la lumière rouge sur ta joue droite : aucun coin du sol ne reste sombre.",
    rappels: ["vitrail", "tour-de-guet", "nef"],
    focus_partie: "quand un camp avait la paire de fous : a-t-il ouvert la position ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire le 3e puzzle et colorie les cases contrôlées par chacun des deux fous, une couleur par fou. Quelles cases restent dans l'ombre ?" },
    checklist: ["Squelette désigné avant chaque solution", "Position ouverte / fermée jugée à chaque puzzle", "Décision d'échange pour garder ou casser la paire justifiée"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "bishopPair", fallbackThemes: ["bishopEndgame"] },
  },
  {
    semaine: 5, jour: 5, metaphore_id: "sanctuaire", theme_metaphore: "Le Sanctuaire — le Cavalier contre le Vitrail muré",
    concept: "cavalier contre mauvais fou",
    cours:
      "Retour au sanctuaire, avec un visiteur : le cavalier s'y installe, face à un fou adverse emmuré derrière son vitrail opaque. C'est le duel le plus déséquilibré des pièces mineures : le cavalier saute sur les deux couleurs, le mauvais fou ne voit que ses propres pions. Règles du duel : bloque les pions adverses sur la couleur du fou (ils deviennent des cibles fixes), installe ton cavalier sur un sanctuaire de L'AUTRE couleur, celle que le fou ne pourra jamais atteindre, puis amène ton roi. Lien avec le vitrail : ce duel est la conséquence directe d'un mauvais fou. Lien avec le jardin : en finale, le roi jardinier vient cueillir les pions fixés pendant que le cavalier tient le sanctuaire.",
    ancrage_sensoriel:
      "Vois le cavalier entrer d'un bond dans le sanctuaire doré, pendant que le fou adverse tâtonne derrière sa vitre noire sans pouvoir le voir.",
    rappels: ["sanctuaire", "vitrail", "roi-jardinier"],
    focus_partie: "si un duel cavalier contre fou apparaît : le fou est-il mauvais ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Rejoue à l'envers le puzzle le plus difficile et nomme à chaque coup la case (et sa couleur) que le cavalier visait." },
    checklist: ["Squelette désigné avant chaque solution", "Couleur du fou adverse vérifiée avant chaque coup de cavalier", "Pions adverses fixés sur la couleur du fou"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "knightVsBishop", fallbackThemes: ["knightEndgame"] },
  },
  {
    semaine: 5, jour: 6, metaphore_id: "donjon-eventre", theme_metaphore: "Le Sanctuaire — le Donjon éventré",
    concept: "le roi exposé",
    cours:
      "À la lisière du sanctuaire se dresse le donjon, où vit le roi. Ses murs, ce sont ses pions-boucliers (f, g, h pour un petit roque). Chaque pion qui avance ou disparaît ouvre une brèche, et chaque brèche est une ligne d'attaque directe vers la chambre du roi. Un donjon éventré, c'est un roi aux colonnes ouvertes, aux diagonales nues, aux cases voisines contrôlées par l'adversaire. Règles : compte les défenseurs et les attaquants autour du roi ; quand les attaquants sont plus nombreux, les sacrifices deviennent possibles ; et un roi exposé est perdu plus souvent par les échecs EN SÉRIE que par une seule attaque. Lien avec la tour de guet : sans son guetteur, le donjon perd toutes les cases d'une couleur. Lien avec la crypte : le donjon éventré est l'inverse de la crypte, trop ouvert plutôt que trop fermé.",
    ancrage_sensoriel:
      "Vois les murs du donjon percés de brèches par lesquelles le vent s'engouffre jusqu'à la chambre du roi : il n'a plus nulle part où se cacher.",
    rappels: ["tour-de-guet", "crypte", "sanctuaire"],
    focus_partie: "compte attaquants et défenseurs autour des deux rois à chaque phase de la partie.",
    reconsolidation: { type: "recitation", consigne: "Récite sans support tout le Sanctuaire (case faible, tour de guet, vitrail, deux vitraux, duel cavalier-fou, donjon éventré), avec une position illustrative pour chacun." },
    checklist: ["Squelette désigné avant chaque solution", "Attaquants / défenseurs du roi comptés à chaque puzzle", "Pions-boucliers de mon roi gardés intacts sans raison de les pousser"],
    sourcing: { anyThemes: ["exposedKing"], noThemes: ["mateIn1"], fallbackThemes: ["exposedKing", "kingsideAttack"] },
  },
  RET(5, ["sanctuaire", "tour-de-guet", "vitrail", "deux-vitraux", "donjon-eventre"], "Le Sanctuaire", "les cases faibles et la qualité des pièces mineures de chaque camp, notées à la fin de l'ouverture.", ["Un tableau bon/mauvais fou rempli pour ma partie"]),

  // ═══ Semaine 6 — Le Donjon ════════════════════════════════════════════════
  {
    semaine: 6, jour: 1, metaphore_id: "belier", theme_metaphore: "Le Donjon — le Bélier",
    concept: "l'attaque de pions sur le roi",
    cours:
      "Tu assiéges maintenant le donjon. Le bélier, ce sont tes pions qui marchent sur le roque adverse : g4-g5, h4-h5. On ne cherche pas à les garder, on cherche à enfoncer la porte pour ouvrir des colonnes (des nefs !) vers le roi. Règles du bélier : on ne l'utilise que si son propre roi n'est PAS derrière (roques opposés, ou roi au centre bien protégé) ; le pion qui frappe un pion du roque (un « crochet » : g6, h6) accélère l'ouverture ; et la vitesse compte plus que le matériel, car dans les roques opposés c'est le premier bélier arrivé qui gagne. Lien avec la nef : le bélier sert à ouvrir une colonne pour les tours. Lien avec le donjon éventré : le bélier fabrique les brèches.",
    ancrage_sensoriel:
      "Entends le choc sourd et rythmé du bélier contre la porte du donjon, et le bois qui commence à se fendre à chaque coup.",
    rappels: ["donjon-eventre", "nef", "muraille"],
    focus_partie: "roques opposés ou non : qui avait le droit de lancer le bélier, et qui l'a lancé en premier ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire le 2e puzzle : le bélier (pions qui avancent), la porte (pion du roque visé) et la nef qui va s'ouvrir derrière." },
    checklist: ["Squelette désigné avant chaque solution", "Position de mon propre roi vérifiée avant de lancer un bélier", "Course des béliers comptée en coups"],
    sourcing: { anyThemes: ["kingsideAttack", "queensideAttack"], noThemes: ["mateIn1"], geometry: "pawnStorm", fallbackThemes: ["kingsideAttack"] },
  },
  {
    semaine: 6, jour: 2, metaphore_id: "pont-levis", theme_metaphore: "Le Donjon — le Pont-levis",
    concept: "l'attraction",
    cours:
      "Le pont-levis du donjon s'abaisse : tu offres une pièce pour forcer le roi (ou une autre pièce) à sortir sur le pont, là où toutes tes pièces l'attendent. C'est l'attraction : un sacrifice qui ATTIRE une pièce adverse sur une case précise, où elle subit un mat, une fourchette ou une enfilade. Exemple type : Txh8+ ! Rxh8, puis Dh5+ et mat. Différence avec la déviation (le pilier surchargé) : la déviation ÉLOIGNE un défenseur de sa case ; l'attraction ATTIRE une pièce SUR une case. Règle de repérage : cherche d'abord le motif final (la fourchette, le mat) ; s'il manque juste qu'une pièce adverse soit sur telle case, abaisse le pont-levis pour l'y amener.",
    ancrage_sensoriel:
      "Entends les chaînes du pont-levis cliqueter en descendant, puis le bruit des pas du roi sur les planches, juste avant que la herse ne retombe derrière lui.",
    rappels: ["pilier-surcharge", "carrefour", "broche"],
    focus_partie: "un motif « presque là » qui manquait d'une seule pièce bien placée : un pont-levis possible ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour le puzzle le plus spectaculaire, pars du mat (ou du gain) final et remonte : sur quelle case la pièce a-t-elle été attirée, et par quel sacrifice ?" },
    checklist: ["Squelette désigné avant chaque solution", "Motif final identifié AVANT de chercher le sacrifice", "Déviation et attraction distinguées à voix haute"],
    sourcing: { anyThemes: ["attraction"], noThemes: ["mateIn1"], fallbackThemes: ["attraction", "sacrifice"] },
  },
  {
    semaine: 6, jour: 3, metaphore_id: "chambre-close", theme_metaphore: "Le Donjon — la Chambre close",
    concept: "figures de mat : étouffé, arabe, Anastasie, crochet",
    cours:
      "Au sommet du donjon, la chambre du roi. Ses propres meubles (ses pièces et ses pions) bloquent toutes les sorties : c'est la chambre close. Un seul attaquant suffit alors. Quatre tableaux accrochés au mur, quatre figures de mat à reconnaître d'un regard. Le mat à l'étouffée : le cavalier entre par la fenêtre, le roi est enterré par ses propres pièces. Le mat arabe : tour et cavalier, le roi dans le coin. Le mat d'Anastasie : cavalier et tour sur la colonne h, le roi coincé par son pion g. Le mat du crochet : tour, cavalier et pion qui se protègent en chaîne. Règle : on apprend ces figures comme des visages, en mémorisant la FORME (positions relatives des pièces), jamais une suite de coups.",
    ancrage_sensoriel:
      "Vois la chambre encombrée de meubles lourds devant chaque porte, et entends le cavalier frapper au carreau de la seule fenêtre.",
    rappels: ["crypte", "donjon-eventre", "carrefour"],
    focus_partie: "les rois coincés par leurs propres pièces : une figure de mat était-elle à portée ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire, sans échiquier, les quatre figures de mat (étouffée, arabe, Anastasie, crochet) : seulement les pièces qui comptent, en position relative." },
    checklist: ["Squelette désigné avant chaque solution", "Figure de mat nommée avant de jouer", "Les 4 figures dessinées de mémoire"],
    sourcing: { anyThemes: ["smotheredMate", "arabianMate", "anastasiaMate", "hookMate", "bodenMate", "doubleBishopMate", "dovetailMate"], noThemes: ["mateIn1"], fallbackThemes: ["smotheredMate", "arabianMate", "anastasiaMate", "hookMate"] },
  },
  {
    semaine: 6, jour: 4, metaphore_id: "donjon-eventre", theme_metaphore: "Le Donjon — éventrer le Donjon",
    concept: "le sacrifice sur le roque (Fxh7+ et Fxh2+)",
    cours:
      "Retour au donjon éventré, mais cette fois c'est toi qui l'éventres. Le sacrifice du fou en h7 (ou h2), le « cadeau grec », arrache le pion-bouclier h et attire le roi dehors : Fxh7+ Rxh7, Cg5+ et la dame arrive par h5. Conditions de Vukovic pour que le cadeau soit sain : un fou qui vise h7, un cavalier qui peut aller en g5, une dame qui peut rejoindre la colonne h, et aucun cavalier adverse en f6 pour défendre h7. Règle : vérifie la liste AVANT le sacrifice, jamais après. Lien avec le pont-levis : Fxh7+ est une attraction (le roi est attiré en h7). Lien avec le bélier : le cadeau grec ouvre le donjon sans avoir à pousser de pions.",
    ancrage_sensoriel:
      "Vois le fou franchir la brèche en h7 dans un éclat de pierre, et sens le roi adverse trébucher dehors, dans la cour, à découvert.",
    rappels: ["pont-levis", "belier", "donjon-eventre"],
    focus_partie: "y avait-il un fou visant h7 / h2 ? La liste de Vukovic était-elle complète ?",
    reconsolidation: { type: "recitation", consigne: "Récite sans support la liste des conditions du cadeau grec, puis vérifie-la à voix haute sur la position du 1er puzzle reconstruite de mémoire." },
    checklist: ["Squelette désigné avant chaque solution", "Conditions du sacrifice vérifiées avant de le jouer", "Pièces défensives du roque comptées"],
    sourcing: { anyThemes: ["sacrifice", "kingsideAttack", "exposedKing"], geometry: "greekGift", fallbackThemes: ["sacrifice", "kingsideAttack"] },
  },
  {
    semaine: 6, jour: 5, metaphore_id: "pilier-surcharge", theme_metaphore: "Le Donjon — abattre le Pilier du donjon",
    concept: "éliminer le défenseur du roi",
    cours:
      "Le donjon a son pilier : la pièce qui défend seule le roi, souvent un cavalier en f6 (f3) ou un fou en g7 (g2). Abats ce pilier, et toute la voûte du roque s'écroule. Les outils viennent de l'Atelier : on échange le pilier (même contre une pièce de plus grande valeur, la qualité si nécessaire), on le dévie (sacrifice qui l'oblige à quitter sa case), ou on le cloue (l'épingle le rend inutile sans le prendre). Règle : avant d'attaquer le roi, nomme son pilier. Si tu ne peux pas nommer le pilier, tu ne sais pas encore comment attaquer. Lien avec la tour de guet : le guetteur en fianchetto est souvent le pilier. Lien avec le pilier surchargé : le défenseur du roi a souvent un deuxième travail.",
    ancrage_sensoriel:
      "Entends le fracas du pilier qui s'écroule, et sens le sol du donjon trembler quand la voûte du roque s'effondre derrière lui.",
    rappels: ["pilier-surcharge", "tour-de-guet", "epingle"],
    focus_partie: "nomme le pilier défensif de chaque roi à l'entrée du milieu de partie.",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire le 4e puzzle et entoure le pilier défensif du roi, avec une flèche vers ce qu'il défendait." },
    checklist: ["Squelette désigné avant chaque solution", "Pilier du roi adverse nommé avant chaque attaque", "Échange du défenseur envisagé dans ma partie"],
    sourcing: { anyThemes: ["capturingDefender"], allThemes: ["kingsideAttack"], noThemes: ["mateIn1"], fallbackThemes: ["capturingDefender", "deflection"] },
  },
  {
    semaine: 6, jour: 6, metaphore_id: "canon", theme_metaphore: "Le Donjon — le Canon contre le Donjon",
    concept: "attaques combinées : mat en 2 et en 3",
    cours:
      "Le siège s'achève : tu ramènes le canon de la Cathédrale contre le donjon. Les mats en deux ou trois coups combinent presque toujours deux lieux du palais : un canon (batterie dame-tour, dame-fou) pour la puissance de feu, et un pont-levis ou un pilier abattu pour ouvrir la porte. Méthode de calcul, dans l'ordre : 1. les échecs (tous, même les plus absurdes), 2. les captures, 3. les menaces. C'est l'ordre « CCM ». Ne cherche pas le coup juste au hasard : regarde d'abord la chambre close (où le roi peut-il aller ?), puis le canon (qui peut frapper ?), puis le pilier (qui défend ?). Lien avec tout le palais : c'est ici que la Cathédrale, l'Atelier et le Donjon se rejoignent.",
    ancrage_sensoriel:
      "Entends le canon tonner deux fois contre les murs du donjon, puis le silence quand le drapeau adverse tombe.",
    rappels: ["canon", "pont-levis", "chambre-close", "pilier-surcharge"],
    focus_partie: "applique l'ordre échecs → captures → menaces à chaque coup critique de ta partie.",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pars de la position de mat du puzzle le plus long et remonte la ligne. À chaque coup, nomme le lieu du palais utilisé (canon, pont-levis, pilier…)." },
    checklist: ["Squelette désigné avant chaque solution", "Ordre échecs → captures → menaces appliqué", "Tout le Donjon récité (bélier, pont-levis, chambre close, cadeau grec, pilier, canon)"],
    sourcing: { anyThemes: ["mateIn2", "mateIn3"], noThemes: ["mateIn1", "backRankMate"], fallbackThemes: ["mateIn2", "mateIn3"] },
  },
  RET(6, ["belier", "pont-levis", "chambre-close", "donjon-eventre", "pilier-surcharge", "canon"], "Le Donjon", "chaque attaque sur le roi de la partie : quel lieu du Donjon a été utilisé ou oublié ?", ["Ordre échecs → captures → menaces appliqué à chaque puzzle du test"]),

  // ═══ Semaine 7 — Les Remparts de la Tour ══════════════════════════════════
  {
    semaine: 7, jour: 1, metaphore_id: "tour-sentinelle", theme_metaphore: "Les Remparts de la Tour — la Tour sentinelle",
    concept: "tour active, tour derrière le pion passé",
    cours:
      "Dernier quartier de la phase : les Remparts de la Tour, où se jouent les finales de tours, les plus fréquentes de toutes. Ici, la tour est une sentinelle qui patrouille sur le chemin de ronde. Règle de Tarrasch : la tour se place DERRIÈRE le pion passé, le sien comme celui de l'adversaire. Derrière son propre pion, son chemin de ronde s'allonge à chaque poussée ; devant, il rétrécit jusqu'à la paralysie. Deuxième règle : une tour active (qui attaque des pions, coupe le roi, donne des échecs) vaut souvent un pion de plus qu'une tour passive qui défend. Lien avec l'escalier : la sentinelle escorte le pion jusqu'au belvédère. Lien avec la tribune : une tour active finit souvent à la 7e.",
    ancrage_sensoriel:
      "Marche avec la sentinelle sur le chemin de ronde, derrière le pion qui grimpe : à chaque marche qu'il monte, ton chemin s'allonge devant toi.",
    rappels: ["escalier", "tribune", "nef"],
    focus_partie: "en finale de tours : ta tour était-elle active ou passive ? derrière ou devant le pion passé ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire le 3e puzzle : le pion passé, les deux tours, et le chemin de ronde (cases contrôlées) de chaque tour." },
    checklist: ["Squelette désigné avant chaque solution", "Règle de Tarrasch vérifiée à chaque puzzle", "Tour activée en priorité dans ma finale"],
    sourcing: { anyThemes: ["rookEndgame"], geometry: "rookBehindPasser", fallbackThemes: ["rookEndgame"] },
  },
  {
    semaine: 7, jour: 2, metaphore_id: "fosse", theme_metaphore: "Les Remparts de la Tour — la Fosse",
    concept: "la coupure du roi",
    cours:
      "Au pied des Remparts, la tour creuse une fosse le long d'une colonne (ou d'une rangée) : le roi adverse ne peut plus la franchir. C'est la coupure. Chaque colonne de distance entre le roi coupé et le pion passé est une colonne de retard dans la course. Règle : dans les finales de tours avec un pion passé, couper le roi adverse est souvent plus fort que pousser le pion. Une coupure de deux colonnes ou plus gagne souvent seule ; une coupure d'une colonne demande la technique de Lucena (demain). En défense, l'inverse : garde ton roi DEVANT le pion, du côté le plus court. Lien avec la cour carrée : la fosse empêche le roi d'entrer dans la cour.",
    ancrage_sensoriel:
      "Vois la fosse se creuser d'un coup le long de la colonne, et le roi adverse s'arrêter au bord, incapable de sauter.",
    rappels: ["tour-sentinelle", "cour-carree", "roi-jardinier"],
    focus_partie: "en finale de tours : à quel moment une coupure était-elle possible ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Rejoue à l'envers le puzzle le plus long en comptant, à chaque coup, de combien de colonnes le roi adverse était coupé." },
    checklist: ["Squelette désigné avant chaque solution", "Distance de coupure comptée à chaque puzzle", "Coupure / défense frontale choisie dans ma finale"],
    sourcing: { anyThemes: ["rookEndgame"], geometry: "cutOff", fallbackThemes: ["rookEndgame"] },
  },
  {
    semaine: 7, jour: 3, metaphore_id: "pont-lucena", theme_metaphore: "Les Remparts de la Tour — le Pont de Lucena",
    concept: "la position de Lucena (construire un pont)",
    cours:
      "Le roi est sur la case de promotion, devant son pion à la 7e, le roi adverse est coupé d'une colonne (la fosse d'hier), et la tour adverse donne des échecs latéraux. Le roi ne peut pas sortir sans être harcelé. Solution de Lucena : construire un pont. 1. La tour donne un échec pour repousser le roi adverse d'une colonne de plus. 2. La tour se pose sur la 4e rangée (l'arche du pont). 3. Le roi sort et descend vers la tour. Quand les échecs latéraux reprennent, la tour s'interpose : le pont est fermé, le pion promeut. Règle : le pont se construit sur la 4e rangée (la 5e pour les Noirs). Les positions de ce jour sont en partie des positions théoriques construites, vérifiées par la tablebase Syzygy.",
    ancrage_sensoriel:
      "Vois l'arche de pierre se poser au-dessus du chemin, et entends les échecs latéraux ricocher sur elle pendant que le roi passe à l'abri dessous.",
    rappels: ["fosse", "tour-sentinelle", "escalier"],
    focus_partie: "si une finale tour + pion contre tour arrive : reconnais-tu le moment de construire le pont ?",
    reconsolidation: { type: "recitation", consigne: "Récite sans support les trois étapes du pont de Lucena, puis rejoue-les de mémoire, les yeux fermés, depuis la position du 1er puzzle." },
    checklist: ["Squelette désigné avant chaque solution", "Rangée du pont nommée avant de jouer", "Les 3 étapes de Lucena récitées"],
    sourcing: { anyThemes: ["rookEndgame"], geometry: "lucenaLike", fallbackThemes: ["rookEndgame"], construites: ["lucena-a", "lucena-b"] },
  },
  {
    semaine: 7, jour: 4, metaphore_id: "rempart-philidor", theme_metaphore: "Les Remparts de la Tour — le Rempart de Philidor",
    concept: "la position de Philidor (défense en 3e rangée)",
    cours:
      "Tu passes de l'autre côté du mur : maintenant, tu défends. Ton roi est devant le pion adverse, la tour adverse et le pion arrivent. Le rempart de Philidor : ta tour se pose sur ta 3e rangée (la 6e pour les Noirs), et barre le passage au roi adverse, qui ne peut plus avancer sans être harcelé. Dès que le pion avance sur cette rangée, il n'abrite plus son roi : ta tour redescend à l'autre bout de l'échiquier et donne des échecs PAR L'ARRIÈRE, à l'infini. Règle : le rempart d'abord, la descente seulement quand le pion a avancé. C'est la nulle la plus importante de toute la théorie des finales. Les positions de ce jour sont en partie des positions théoriques construites, vérifiées par la tablebase Syzygy.",
    ancrage_sensoriel:
      "Sens la pierre froide du rempart sous tes mains, puis le saut de la sentinelle qui redescend à l'autre bout du mur quand le pion avance.",
    rappels: ["pont-lucena", "fosse", "tour-sentinelle"],
    focus_partie: "en défense de finale de tours : ta tour était-elle sur la bonne rangée ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la position de Philidor (rois, pion, tours) avant ET après la poussée du pion, avec la rangée de la tour défenseuse." },
    checklist: ["Squelette désigné avant chaque solution", "Rangée défensive vérifiée à chaque puzzle", "Lucena et Philidor distingués : qui gagne, qui annule"],
    sourcing: { anyThemes: ["rookEndgame"], geometry: "philidorLike", fallbackThemes: ["rookEndgame", "defensiveMove"], construites: ["philidor-a", "philidor-b"] },
  },
  {
    semaine: 7, jour: 5, metaphore_id: "roi-jardinier", theme_metaphore: "Les Remparts de la Tour — Retour au Jardin",
    concept: "transposer en finale de pions",
    cours:
      "Une porte des Remparts donne sur le Jardin du Triangle d'or. Parfois, la meilleure manière de gagner une finale de tours est d'échanger les tours et d'entrer au jardin, en finale de pions. Mais la porte ne se repasse pas : une finale de pions se calcule jusqu'au bout, puisqu'aucune pièce ne pourra plus corriger une erreur. Règle d'entrée : avant d'échanger la dernière pièce, vérifie avec les outils du Jardin : qui a le roi le plus actif ? Qui a l'opposition ? Y a-t-il un pion passé éloigné ou une brèche ? Si tu ne peux pas répondre, n'échange pas. Lien avec tout le Jardin : c'est ici que le roi jardinier, le vis-à-vis et l'allée éloignée deviennent décisifs.",
    ancrage_sensoriel:
      "Pousse la lourde porte des Remparts et sens l'odeur de l'herbe coupée du jardin : une fois entré, la porte se referme et ne s'ouvrira plus.",
    rappels: ["roi-jardinier", "vis-a-vis", "allee-eloignee", "tour-sentinelle"],
    focus_partie: "chaque échange de la dernière pièce : avais-tu calculé la finale de pions qui suit ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour le puzzle où les tours s'échangent, pars de la finale de pions finale et remonte jusqu'à l'échange en justifiant pourquoi la porte valait d'être franchie." },
    checklist: ["Squelette désigné avant chaque solution", "Les 3 questions du Jardin posées avant chaque échange", "Une finale de pions calculée jusqu'au bout"],
    sourcing: { anyThemes: ["rookEndgame", "pawnEndgame"], geometry: "rookTradeToPawnEnding", fallbackThemes: ["pawnEndgame"] },
  },
  {
    semaine: 7, jour: 6, metaphore_id: "escalier", theme_metaphore: "Les Remparts de la Tour — l'Escalier escorté",
    concept: "pion passé en finale de tours",
    cours:
      "Dernière journée de construction de la phase. Tu rassembles l'escalier (le pion passé), la sentinelle (la tour derrière lui) et la fosse (la coupure) en une seule technique. Le pion passé en finale de tours avance quand trois conditions sont réunies : la tour est derrière lui ou sur le côté, le roi adverse est coupé, et ton propre roi est assez près pour l'escorter dans les dernières marches. Le défenseur, lui, cherche le rempart de Philidor ou des échecs par l'arrière. Règle de bilan : dans une finale de tours, nomme en une phrase où se trouvent l'escalier, la sentinelle et la fosse avant de jouer. Lien avec toute la phase : la Cathédrale, les Remparts, le Jardin et la Tour se rejoignent ici.",
    ancrage_sensoriel:
      "Vois l'escalier, la sentinelle et la fosse s'illuminer en même temps sur la maquette de la Cité : le chemin du pion jusqu'au belvédère est tracé.",
    rappels: ["escalier", "tour-sentinelle", "fosse", "rempart-philidor", "pont-lucena"],
    focus_partie: "dans ta finale : où étaient l'escalier, la sentinelle et la fosse ?",
    reconsolidation: { type: "recitation", consigne: "Récite sans support tous les quartiers de la phase dans l'ordre de visite (Cathédrale, Remparts, Jardin, Atelier, Sanctuaire, Donjon, Tour), avec un lieu et une règle par quartier." },
    checklist: ["Squelette désigné avant chaque solution", "Escalier / sentinelle / fosse nommés à chaque puzzle", "Visite complète du palais récitée"],
    sourcing: { anyThemes: ["rookEndgame"], allThemes: ["advancedPawn"], geometry: "rookEndingPasser", fallbackThemes: ["rookEndgame"] },
  },
  RET(7, ["tour-sentinelle", "fosse", "pont-lucena", "rempart-philidor", "roi-jardinier", "escalier"], "Les Remparts de la Tour", "chaque lieu du palais rencontré, tous quartiers confondus : c'est le bilan de la phase.", ["Bilan de phase : taux de réussite des 7 semaines comparé à la semaine 1", "Test de passage en Phase 2 réussi"]),
];

/**
 * Positions théoriques construites (Lucena, Philidor) : chaque coup du
 * solveur est vérifié contre la tablebase Syzygy par le générateur, et la
 * source est marquée `position_pedagogique` dans le JSON.
 */
export const PHASE_1_CONSTRUCTED: readonly ConstructedPosition[] = [
  {
    id: "lucena-a",
    fen: "1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1",
    ligne: ["c1d1", "d8e7", "d1d4", "a2a1", "b8c7", "a1c1", "c7b6"],
    description: "Lucena : échec pour repousser le roi d'une colonne, puis le pont sur la 4e rangée.",
  },
  {
    id: "lucena-b",
    fen: "1K6/1P2k3/8/8/8/8/r7/3R4 w - - 0 1",
    ligne: ["d1d4", "a2a1", "b8c7", "a1c1", "c7b6", "c1b1", "b6c6"],
    description: "Lucena : le roi adverse est déjà repoussé, il reste à poser le pont et sortir le roi.",
  },
  {
    id: "philidor-a",
    fen: "4k3/1R6/r3P3/3K4/8/8/8/8 b - - 0 1",
    ligne: ["a6a1", "d5d6", "a1d1", "d6e5", "d1e1"],
    description: "Philidor : le pion est en 6e, la tour descend et donne des échecs par l'arrière.",
  },
  {
    id: "philidor-b",
    fen: "4k3/1R6/8/r3PK2/8/8/8/8 b - - 0 1",
    ligne: ["a5a6", "e5e6", "a6a1"],
    description: "Philidor : la tour monte sur sa 3e rangée (le rempart), puis redescend dès que le pion avance.",
  },
];
