import { retentionDay as RET } from "./retention-day";
import type { ConstructedPosition, DaySpec } from "./spec-types";

/**
 * Phase 4 — 2100 → 2250 : calcul long, finales complexes (semaines 23 à 29).
 *
 * Parcours du palais : le Labyrinthe (calcul long) → le Port (finales de
 * pièces mineures) → l'Arsenal (finales de pièces lourdes) → la Citadelle
 * (attaque calculée) → l'Observatoire (transitions) → le Bastion (défense des
 * positions difficiles) → le Tour de la Cité (synthèse et bilan de phase).
 *
 * Calcul long ne veut pas dire mémoriser des lignes : on découpe la variante
 * en blocs connus (chunking) et l'on s'oriente avec le fil d'Ariane, un lieu
 * par décision.
 *
 * Texte seulement : les puzzles sont tirés par le générateur à partir de
 * `sourcing`, filtrés sur l'échiquier (`geometry`) et vérifiés par Stockfish.
 */

export const PHASE_4_DAYS: readonly DaySpec[] = [
  // ═══ Semaine 23 — Le Labyrinthe ═══════════════════════════════════════════
  {
    semaine: 23, jour: 1, metaphore_id: "fil-ariane", theme_metaphore: "Le Labyrinthe — le Fil d'Ariane",
    concept: "l'arbre de variantes",
    cours:
      "Sous la Cité s'ouvre le Labyrinthe, le quartier du calcul long. À l'entrée, on te tend une pelote : le fil d'Ariane. La méthode tient en quatre gestes. Un, à l'entrée, nomme tous les candidats, c'est-à-dire les galeries possibles, avec l'Enclume : échecs, prises, menaces, plus un coup calme. Deux, entre dans UNE galerie et suis-la jusqu'à une position calme, sans échec ni prise en suspens. Trois, évalue-la en une phrase avec la Lunette. Quatre, rembobine jusqu'au carrefour et prends la galerie suivante, sans jamais revenir dans une galerie déjà évaluée. L'erreur typique est de sauter d'une galerie à l'autre sans les finir, ce qui fait tourner en rond. Lien avec l'Enclume : les coups forcés sont les galeries les plus courtes, on les explore d'abord.",
    ancrage_sensoriel:
      "Sens la laine rêche du fil qui se déroule entre tes doigts, et le froid de la pierre humide des galeries dans l'obscurité.",
    rappels: ["enclume", "lunette", "chambre-close"],
    focus_partie: "dans ta position la plus critique : as-tu nommé tous les candidats avant de calculer le premier ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Pour le puzzle le plus long, dessine l'arbre de variantes sur papier : candidats au premier coup, réponses principales, et l'évaluation au bout de chaque branche." },
    checklist: ["Squelette désigné avant chaque solution", "Candidats nommés avant de calculer", "Chaque galerie suivie jusqu'à une position calme"],
    sourcing: { anyThemes: ["veryLong", "long"], noThemes: ["opening", "mateIn1", "mateIn2"], fallbackThemes: ["long"] },
  },
  {
    semaine: 23, jour: 2, metaphore_id: "impasse", theme_metaphore: "Le Labyrinthe — l'Impasse",
    concept: "chercher la réfutation",
    cours:
      "Dans le Labyrinthe, chaque galerie peut finir en impasse, et l'on ne le sait qu'au bout. Avant de jouer une combinaison, il faut chercher la meilleure défense de l'adversaire, pas la défense la plus naturelle. Les impasses classiques sont toujours les mêmes. Un coup intermédiaire adverse (le Soufflet retourné). Une interposition avec échec (la Vanne retournée). Un coup calme qui pare tout (la Trempe retournée). Une contre-attaque sur ton roi (la Contre-mine). Règle de l'impasse : à la fin de ta variante, joue le rôle du défenseur et cherche ces quatre réponses à chaque coup. Si tu en trouves une, l'impasse est réelle : cherche une autre galerie, ou un premier coup différent.",
    ancrage_sensoriel:
      "Avance dans la galerie, la main tendue, jusqu'à toucher un mur de pierre froid en pleine obscurité : impasse.",
    rappels: ["fil-ariane", "soufflet", "contre-mine"],
    focus_partie: "avant chaque combinaison de ta partie : as-tu cherché la meilleure défense, ou la plus naturelle ?",
    reconsolidation: { type: "recitation", consigne: "Récite les quatre impasses classiques, puis, pour un puzzle de la séance, dis laquelle l'adversaire aurait pu tenter et pourquoi elle échouait." },
    checklist: ["Squelette désigné avant chaque solution", "Meilleure défense cherchée avant de jouer", "Quatre impasses vérifiées à chaque coup"],
    sourcing: { anyThemes: ["defensiveMove", "quietMove", "intermezzo"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["long"] },
  },
  {
    semaine: 23, jour: 3, metaphore_id: "trempe", theme_metaphore: "Le Labyrinthe — la Trempe, nouvel étage",
    concept: "le coup tranquille au fond de la variante",
    cours:
      "La Trempe reçoit un nouvel étage, au fond du Labyrinthe. Au bout d'une longue galerie forcée, la position semble calme et l'on s'arrête pour évaluer. Mais un coup tranquille, à ce moment précis, transforme une évaluation « légèrement mieux » en gain. C'est souvent ce qui sépare un calcul de 2000 d'un calcul de 2200 : ne pas s'arrêter à la position calme, chercher le coup calme qui la rend décisive. Règle de l'étage : à chaque position calme de ton arbre, avant d'évaluer, cherche un coup qui ne menace rien de direct mais laisse l'adversaire sans bon coup. Une case de fuite fermée, un défenseur coupé, un roi mis en zugzwang.",
    ancrage_sensoriel:
      "Au fond de la dernière galerie, entends le sifflement de la lame qu'on trempe dans une vasque d'eau souterraine.",
    rappels: ["trempe", "fil-ariane", "porte-tournante"],
    focus_partie: "à la fin de tes calculs : as-tu cherché le coup calme avant d'évaluer ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour le puzzle au coup tranquille le plus profond, remonte à l'envers et indique à quel pli le coup calme apparaît, et ce qu'il fermait." },
    checklist: ["Squelette désigné avant chaque solution", "Coup calme cherché avant l'évaluation", "Zugzwang envisagé au fond des variantes"],
    sourcing: { anyThemes: ["quietMove"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["quietMove"] },
  },
  {
    semaine: 23, jour: 4, metaphore_id: "soufflet", theme_metaphore: "Le Labyrinthe — le Soufflet, nouvel étage",
    concept: "coups intermédiaires dans les longues variantes",
    cours:
      "Le Soufflet reçoit un nouvel étage dans le Labyrinthe. Dans une variante de six plis ou plus, chaque reprise est un carrefour où un coup intermédiaire peut surgir, pour toi ou pour l'adversaire. Le fil d'Ariane les note comme des galeries latérales : on ne les suit pas toutes, mais on vérifie que chacune est une impasse avant de poursuivre la galerie principale. Règle de l'étage : marque mentalement chaque reprise de ta variante d'un « S » (soufflet possible ?). Si la réponse est oui, ce n'est plus une reprise mais un carrefour, et l'arbre s'élargit à cet endroit.",
    ancrage_sensoriel:
      "Sens les petits courants d'air chaud qui sortent de galeries latérales à chaque carrefour du labyrinthe.",
    rappels: ["soufflet", "fil-ariane", "impasse"],
    focus_partie: "dans tes variantes de la partie : chaque reprise a-t-elle été vérifiée pour un coup intermédiaire ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine l'arbre de variantes d'un puzzle de la séance et marque d'un « S » chaque reprise où un coup intermédiaire existait." },
    checklist: ["Squelette désigné avant chaque solution", "Chaque reprise marquée « S » et vérifiée", "Galeries latérales fermées avant de poursuivre"],
    sourcing: { anyThemes: ["intermezzo"], noThemes: ["mateIn1"], fallbackThemes: ["intermezzo", "long"] },
  },
  {
    semaine: 23, jour: 5, metaphore_id: "vanne", theme_metaphore: "Le Labyrinthe — la Vanne et le Ramonage",
    concept: "lignes : dégager, couper, rouvrir",
    cours:
      "La Vanne et le Ramonage se retrouvent dans le Labyrinthe. Dans les combinaisons longues, les lignes changent sans cesse : une pièce dégage une diagonale, une autre la coupe, une troisième la rouvre. Pour ne pas se perdre, on suit les lignes, pas les pièces. À chaque pli, demande quelles lignes viennent de s'ouvrir et de se fermer, pour les deux camps. Règle de l'étage : dans une variante longue, après chaque coup, repère la ligne la plus importante de la position (celle qui mène au roi ou à la case de promotion) et demande qui la contrôle. Si elle change de mains, c'est un pli clé du squelette.",
    ancrage_sensoriel:
      "Entends l'eau qui change de chemin dans les canaux souterrains à chaque vanne levée ou baissée, en échos lointains.",
    rappels: ["vanne", "ramonage", "fil-ariane"],
    focus_partie: "dans tes calculs : as-tu suivi les lignes plutôt que les pièces ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de la séance, remonte à l'envers et nomme, à chaque pli, la ligne qui s'ouvre ou se ferme." },
    checklist: ["Squelette désigné avant chaque solution", "Ligne principale suivie à chaque pli", "Changement de contrôle repéré comme pli clé"],
    sourcing: { anyThemes: ["clearance", "interference", "xRayAttack"], noThemes: ["mateIn1"], fallbackThemes: ["clearance", "interference"] },
  },
  {
    semaine: 23, jour: 6, metaphore_id: "pilier-surcharge", theme_metaphore: "Le Labyrinthe — le Pilier surchargé, nouvel étage",
    concept: "combinaisons à trois motifs",
    cours:
      "Le Pilier surchargé reçoit un nouvel étage. Les combinaisons de ce niveau enchaînent souvent trois motifs : une attraction, puis une déviation, puis une fourchette ; ou un dégagement, puis un clouage, puis un mat. La mémoire de travail ne retient pas douze plis, mais elle retient trois blocs nommés. Règle de l'étage : découpe chaque combinaison en motifs de l'Atelier et de la Forge, et nomme-les à voix haute dans l'ordre. Le squelette d'une combinaison à trois motifs, ce sont trois cases. Si tu peux nommer ces trois cases sans regarder l'échiquier, tu as compris la combinaison, et tu la reconnaîtras dans une autre partie.",
    ancrage_sensoriel:
      "Sens le pilier trembler, puis un deuxième, puis un troisième : trois craquements, et la voûte entière s'effondre.",
    rappels: ["pilier-surcharge", "pont-levis", "carrefour"],
    focus_partie: "après chaque combinaison de ta partie (jouée ou ratée) : quels étaient ses motifs, dans l'ordre ?",
    reconsolidation: { type: "recitation", consigne: "Pour trois puzzles de la séance, récite sans écran les trois motifs et les trois cases du squelette." },
    checklist: ["Squelette désigné avant chaque solution", "Motifs nommés dans l'ordre", "Trois cases du squelette récitées de mémoire"],
    sourcing: { anyThemes: ["sacrifice", "deflection", "attraction"], allThemes: ["veryLong"], noThemes: ["mateIn1"], fallbackThemes: ["sacrifice", "long"] },
  },
  RET(23, ["fil-ariane", "impasse", "trempe", "soufflet", "vanne", "pilier-surcharge"], "Le Labyrinthe", "dans la position la plus critique de la partie : as-tu dessiné l'arbre mentalement ?", ["L'arbre de variantes d'un moment critique de la semaine dessiné sur papier"]),

  // ═══ Semaine 24 — Le Port ═════════════════════════════════════════════════
  {
    semaine: 24, jour: 1, metaphore_id: "jetee", theme_metaphore: "Le Port — la Jetée, nouvel étage",
    concept: "cavalier contre fou en finale",
    cours:
      "La Jetée reçoit un nouvel étage : le duel cavalier contre fou en finale. Le fou est meilleur avec des pions sur les deux ailes et une position ouverte. Le cavalier est meilleur avec des pions sur une seule aile, bloqués, et des cases fortes. Mais à ce niveau, le calcul tranche souvent : le roi actif et le pion passé priment. Règle de l'étage : dans ces finales, regarde d'abord les pions (une aile ou deux ? bloqués ou mobiles ?), puis la case d'entrée du roi, puis seulement les pièces. Le camp au cavalier cherche à bloquer et à fixer, le camp au fou cherche à ouvrir et à créer un second front.",
    ancrage_sensoriel:
      "Vois la jetée en zigzag d'un côté du port et le fanal de l'autre : deux chemins, deux rythmes, vers les mêmes bateaux.",
    rappels: ["jetee", "fanal", "sanctuaire"],
    focus_partie: "en finale cavalier contre fou : les pions étaient-ils sur une aile ou sur deux ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire une finale cavalier contre fou de la séance et indique la case d'entrée du roi et l'aile des pions." },
    checklist: ["Squelette désigné avant chaque solution", "Pions (une aile ou deux) jugés d'abord", "Case d'entrée du roi trouvée"],
    sourcing: { anyThemes: ["knightEndgame", "bishopEndgame"], noThemes: ["mateIn1"], geometry: "knightVsBishop", fallbackThemes: ["knightEndgame", "bishopEndgame"] },
  },
  {
    semaine: 24, jour: 2, metaphore_id: "fanal", theme_metaphore: "Le Port — le Fanal, nouvel étage",
    concept: "le fou et les pions de bande",
    cours:
      "Le Fanal reçoit un nouvel étage : les pions de bande. Un pion a ou h avec un fou qui ne contrôle pas la case de promotion ne gagne pas contre un roi installé dans le coin : c'est le « mauvais fou du coin ». À l'inverse, le fou est excellent contre un pion de bande adverse, qu'il arrête à distance. Ces positions reviennent dans toutes les finales de fous : il faut les reconnaître d'un coup d'œil pour savoir s'il faut échanger, simplifier ou au contraire éviter les échanges. Règle de l'étage : avec un pion de bande, regarde la couleur de la case de promotion. Si ton fou ne la contrôle pas, le roi adverse dans le coin suffit à annuler.",
    ancrage_sensoriel:
      "Vois le faisceau du fanal balayer la mer, mais laisser le coin du port dans l'ombre, juste là où accoste le bateau.",
    rappels: ["fanal", "cabestan", "deux-fanaux"],
    focus_partie: "en finale de fou : y avait-il un pion de bande, et ton fou contrôlait-il la case de promotion ?",
    reconsolidation: { type: "recitation", consigne: "Récite la règle du mauvais fou du coin, puis dis pour deux puzzles de la séance si elle s'appliquait." },
    checklist: ["Squelette désigné avant chaque solution", "Couleur de la case de promotion vérifiée", "Échanges choisis selon le pion de bande"],
    sourcing: { anyThemes: ["bishopEndgame"], noThemes: ["mateIn1"], fallbackThemes: ["bishopEndgame", "endgame"] },
  },
  {
    semaine: 24, jour: 3, metaphore_id: "deux-fanaux", theme_metaphore: "Le Port — les Deux Fanaux, nouvel étage",
    concept: "fous de couleurs opposées avec tours",
    cours:
      "Les Deux Fanaux reçoivent un nouvel étage : les fous de couleurs opposées avec des tours. La règle « les fous opposés annulent » ne vaut plus. Avec des tours, l'attaquant joue sur la couleur que le fou adverse ne voit pas, et la tour s'infiltre par là. Le défenseur doit garder sa tour active et éviter l'échange qui le laisserait passif. Si l'attaquant échange les tours, en revanche, la finale devient souvent nulle. Règle de l'étage : avec fous opposés et tours, l'attaquant garde les tours et vise les cases de la couleur de son fou ; le défenseur cherche l'échange des tours.",
    ancrage_sensoriel:
      "Vois les deux fanaux éclairer chacun leur bande de mer, et une barque à rames qui se glisse par la bande obscure.",
    rappels: ["deux-fanaux", "tour-sentinelle", "balance"],
    focus_partie: "avec fous opposés et tours : as-tu gardé ou échangé les tours, selon ton rôle ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de la séance, remonte à l'envers et indique à chaque coup sur quelle couleur de cases jouait l'attaquant." },
    checklist: ["Squelette désigné avant chaque solution", "Échange des tours évalué selon le rôle", "Couleur d'attaque identifiée"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "oppositeBishops", fallbackThemes: ["bishopEndgame", "rookEndgame"] },
  },
  {
    semaine: 24, jour: 4, metaphore_id: "ecluse", theme_metaphore: "Le Port — l'Écluse, nouvel étage",
    concept: "briser le blocus",
    cours:
      "L'Écluse reçoit un nouvel étage : comment briser un blocus. Le bloqueur ne cède pas tout seul. On l'attaque avec plus de pièces qu'il n'a de défenseurs, on l'échange contre une pièce moins utile, on le surcharge (le Pilier) en lui donnant une deuxième tâche, ou l'on sacrifie pour l'éliminer (le Trébuchet). Une fois l'écluse ouverte, le pion passé avance avec une force décuplée. Règle de l'étage : contre un bloqueur, compte ses défenseurs, cherche sa deuxième tâche, et pèse sur la Balance un sacrifice pour l'éliminer. Pour le défenseur, garde le bloqueur protégé et sans autre travail.",
    ancrage_sensoriel:
      "Entends la porte de l'écluse craquer sous la pression, puis l'eau qui s'engouffre d'un coup et soulève le bateau.",
    rappels: ["ecluse", "trebuchet", "pilier-surcharge"],
    focus_partie: "si un pion passé était bloqué : comment as-tu attaqué ou protégé le bloqueur ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire un puzzle de la séance : le bloqueur, ses défenseurs, ses attaquants, et le coup qui a ouvert l'écluse." },
    checklist: ["Squelette désigné avant chaque solution", "Défenseurs du bloqueur comptés", "Deuxième tâche du bloqueur cherchée"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "blockade", fallbackThemes: ["advancedPawn", "promotion"] },
  },
  {
    semaine: 24, jour: 5, metaphore_id: "cabestan", theme_metaphore: "Le Port — le Cabestan, nouvel étage",
    concept: "courses de pions et promotions simultanées",
    cours:
      "Le Cabestan reçoit un nouvel étage : les courses. Deux pions passés, un de chaque côté, qui courent vers la promotion. Compter les coups ne suffit pas, car celui qui promeut le premier peut donner échec, prendre la nouvelle dame adverse par une enfilade (la Broche), ou empêcher la promotion par un échec au bon moment. Règle de l'étage : dans une course, compte les coups jusqu'à la promotion pour les deux camps, puis regarde la position APRÈS les deux promotions. Qui donne le premier échec ? Y a-t-il une enfilade sur la diagonale ou la colonne ? Une dame qui arrive un coup plus tard mais avec échec gagne souvent la course.",
    ancrage_sensoriel:
      "Entends deux cabestans tourner en même temps sur deux quais, et les cliquets qui accélèrent jusqu'au dernier clac.",
    rappels: ["cabestan", "broche", "cour-carree"],
    focus_partie: "dans une course de pions : as-tu regardé la position après les deux promotions ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour une course de la séance, pars de la position après promotion et remonte : qui avait le premier échec, et pourquoi ?" },
    checklist: ["Squelette désigné avant chaque solution", "Coups jusqu'à la promotion comptés pour les deux camps", "Position après promotions évaluée"],
    sourcing: { anyThemes: ["promotion", "underPromotion", "advancedPawn"], allThemes: ["endgame"], noThemes: ["mateIn1"], fallbackThemes: ["promotion"] },
  },
  {
    semaine: 24, jour: 6, metaphore_id: "porte-tournante", theme_metaphore: "Le Port — la Porte tournante, nouvel étage",
    concept: "zugzwang réciproque et coups d'attente",
    cours:
      "La Porte tournante reçoit un nouvel étage : le zugzwang réciproque. Dans certaines positions, celui qui a le trait perd, quel qu'il soit. Il faut alors calculer pour arriver dans cette position avec l'adversaire au trait. C'est l'art du coup d'attente et de la triangulation, déjà vu au Jardin, mais ici avec des pièces : un fou qui perd un temps sur sa diagonale, une tour qui change de case sur sa rangée, un roi qui fait un triangle. Règle de l'étage : quand une position semble bloquée, demande ce qui se passerait si c'était à l'adversaire de jouer. Si tout coup adverse perd, cherche comment lui passer le trait.",
    ancrage_sensoriel:
      "Sens la porte tournante s'arrêter, chacun d'un côté, les mains sur la vitre : le premier qui pousse se retrouve dehors.",
    rappels: ["porte-tournante", "triangle-or", "vis-a-vis"],
    focus_partie: "en finale bloquée : as-tu posé la question « et si c'était à lui de jouer ? »",
    reconsolidation: { type: "recitation", consigne: "Pour un puzzle de zugzwang de la séance, récite le coup d'attente et explique ce que l'adversaire perdait avec chacun de ses coups." },
    checklist: ["Squelette désigné avant chaque solution", "Question « et si c'était à lui ? » posée", "Coup d'attente ou triangulation trouvé"],
    sourcing: { anyThemes: ["zugzwang"], noThemes: ["mateIn1"], fallbackThemes: ["zugzwang", "quietMove"] },
  },
  RET(24, ["jetee", "fanal", "deux-fanaux", "ecluse", "cabestan", "porte-tournante"], "Le Port", "si ta partie entre en finale : as-tu calculé la position après les promotions ?", ["Une finale de la semaine analysée avec l'arbre de variantes"]),

  // ═══ Semaine 25 — L'Arsenal ═══════════════════════════════════════════════
  {
    semaine: 25, jour: 1, metaphore_id: "poudriere", theme_metaphore: "L'Arsenal — la Poudrière, nouvel étage",
    concept: "finales de dames : calcul des échecs",
    cours:
      "La Poudrière reçoit un nouvel étage : le calcul des échecs en finale de dames. Ici, on calcule vraiment : chaque échec adverse doit être suivi jusqu'à ce que le roi trouve un abri, ou que l'échec s'arrête. Avec le Fil d'Ariane, on dessine l'arbre des échecs : les cases d'où la dame adverse peut donner échec, et les cases d'abri de ton roi. Une seule case manquée, et c'est la nulle. Règle de l'étage : avant de pousser ton pion, compte les échecs adverses jusqu'au bout, puis vérifie qu'aucun ne permet un échange de dames favorable à l'adversaire. Le défenseur vit de ces échecs ; l'attaquant vit de son abri.",
    ancrage_sensoriel:
      "Dans la poudrière, chaque étincelle trace une ligne lumineuse sur le sol : suis-les toutes jusqu'à ce qu'elles s'éteignent.",
    rappels: ["poudriere", "fil-ariane", "ronde"],
    focus_partie: "en finale de dames : as-tu suivi chaque échec adverse jusqu'au bout ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire une finale de dames de la séance et marque les cases d'échec de la dame adverse et les cases d'abri de ton roi." },
    checklist: ["Squelette désigné avant chaque solution", "Échecs adverses suivis jusqu'au bout", "Échange de dames vérifié"],
    sourcing: { anyThemes: ["queenEndgame"], noThemes: ["mateIn1"], fallbackThemes: ["queenEndgame"] },
  },
  {
    semaine: 25, jour: 2, metaphore_id: "mortier", theme_metaphore: "L'Arsenal — le Mortier, nouvel étage",
    concept: "pièces lourdes : attaques et contre-attaques",
    cours:
      "Le Mortier reçoit un nouvel étage. Avec dames et tours, les deux rois sont souvent exposés, et chaque camp a son mortier pointé sur l'autre. Le calcul se fait en course, comme la Herse : qui donne le premier échec qui compte ? La règle de l'Enclume prend ici tout son sens : on calcule d'abord les échecs adverses, ensuite les siens. Un coup qui menace mat mais laisse un échec perpétuel adverse ne vaut rien. Règle de l'étage : dans ces positions, ton premier candidat est toujours un échec ou une défense de ton propre roi. Les menaces viennent après.",
    ancrage_sensoriel:
      "Entends deux mortiers se répondre d'un rempart à l'autre, et vois les obus se croiser au-dessus de la cour.",
    rappels: ["mortier", "herse", "enclume"],
    focus_partie: "avec pièces lourdes et rois exposés : as-tu calculé ses échecs avant tes menaces ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de la séance, remonte à l'envers et nomme à chaque coup l'échec ou la menace qui imposait la réponse." },
    checklist: ["Squelette désigné avant chaque solution", "Échecs adverses calculés en premier", "Défense de mon roi envisagée comme candidat"],
    sourcing: { anyThemes: ["queenRookEndgame", "exposedKing"], noThemes: ["mateIn1"], fallbackThemes: ["queenRookEndgame"] },
  },
  {
    semaine: 25, jour: 3, metaphore_id: "tour-sentinelle", theme_metaphore: "L'Arsenal — la Tour sentinelle, nouvel étage",
    concept: "finales de tours : calcul concret",
    cours:
      "La Tour sentinelle reçoit un nouvel étage. Les principes (activité, roi, pions passés) ne suffisent plus : à ce niveau, les finales de tours se décident par un calcul précis. Il faut savoir quand la course est gagnée, quand un échec latéral sauve, quand l'échange des tours mène à une finale de pions gagnante. Le Fil d'Ariane s'applique : candidats (avancer le pion, activer le roi, donner un échec, attaquer un pion), une galerie à la fois, évaluation calme au bout. Règle de l'étage : en finale de tours, calcule jusqu'au bout les lignes où un pion va à dame. Les autres se jugent par les principes.",
    ancrage_sensoriel:
      "Compte à voix basse les pas de la sentinelle sur le chemin de ronde, et ceux de l'ennemi qui monte l'escalier : qui arrive le premier ?",
    rappels: ["tour-sentinelle", "fil-ariane", "fosse"],
    focus_partie: "en finale de tours : as-tu calculé jusqu'au bout les lignes de promotion ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine l'arbre de variantes d'une finale de tours de la séance, jusqu'aux promotions." },
    checklist: ["Squelette désigné avant chaque solution", "Lignes de promotion calculées jusqu'au bout", "Principes utilisés pour les autres lignes"],
    sourcing: { anyThemes: ["rookEndgame"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["rookEndgame"] },
  },
  {
    semaine: 25, jour: 4, metaphore_id: "fosse", theme_metaphore: "L'Arsenal — la Fosse, nouvel étage",
    concept: "tour et pions contre tour : technique de conversion",
    cours:
      "La Fosse reçoit un nouvel étage : convertir un pion de plus en finale de tours. La technique a trois étapes. Couper le roi adverse (la Fosse). Avancer le pion avec le roi, jamais seul. Puis construire le pont (Lucena) ou forcer l'échange des tours vers une finale de pions gagnante (retour au Jardin). Le défenseur fait l'inverse : il ramène son roi devant le pion, garde sa tour active, et cherche Philidor ou les échecs latéraux. Règle de l'étage : à chaque coup de la conversion, nomme l'étape où tu en es. Si tu ne peux pas la nommer, tu improvises, et en finale de tours l'improvisation coûte souvent le demi-point.",
    ancrage_sensoriel:
      "Vois trois panneaux plantés le long de la fosse : « couper », « avancer », « bâtir le pont ». Tu passes devant chacun, dans l'ordre.",
    rappels: ["fosse", "pont-lucena", "roi-jardinier"],
    focus_partie: "en finale de tours avec un pion de plus : à quelle étape de la conversion étais-tu à chaque coup ?",
    reconsolidation: { type: "recitation", consigne: "Récite les trois étapes de la conversion et, pour un puzzle de la séance, dis à quelle étape chaque coup appartenait." },
    checklist: ["Squelette désigné avant chaque solution", "Étape de la conversion nommée", "Pion avancé avec le roi, jamais seul"],
    sourcing: { anyThemes: ["rookEndgame"], noThemes: ["mateIn1"], geometry: "cutOff", fallbackThemes: ["rookEndgame"] },
  },
  {
    semaine: 25, jour: 5, metaphore_id: "rempart-philidor", theme_metaphore: "L'Arsenal — le Rempart de Philidor, nouvel étage",
    concept: "défendre un pion de moins en finale de tours",
    cours:
      "Le Rempart de Philidor reçoit un nouvel étage : défendre avec un pion de moins quand il reste plusieurs pions. Les ressources du défenseur sont nombreuses. Activer la tour pour attaquer les pions adverses. Garder le roi près du pion passé. Échanger des pions pour réduire le matériel, puisque moins il reste de pions, plus la nulle est probable. Chercher une position connue de nulle (Philidor, défense par l'arrière). Règle de l'étage : en défense de tours, chaque échange de pions te rapproche de la nulle. Cherche les ruptures qui échangent, même si elles te semblent passives.",
    ancrage_sensoriel:
      "Sens le rempart vibrer sous les coups de l'ennemi, et vois les pierres que tu jettes une à une par-dessus le parapet pour l'alléger.",
    rappels: ["rempart-philidor", "ronde", "poterne"],
    focus_partie: "en défense de tours : as-tu cherché à échanger des pions ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de défense de la séance, remonte à l'envers et marque chaque échange de pions qui rapprochait de la nulle." },
    checklist: ["Squelette désigné avant chaque solution", "Échanges de pions cherchés en défense", "Position connue de nulle visée"],
    sourcing: { anyThemes: ["rookEndgame", "equality", "defensiveMove"], noThemes: ["mateIn1"], fallbackThemes: ["rookEndgame"] },
  },
  {
    semaine: 25, jour: 6, metaphore_id: "triangle-or", theme_metaphore: "L'Arsenal — le Triangle d'or, nouvel étage",
    concept: "finales de pions complexes : calcul et cases correspondantes",
    cours:
      "Le Triangle d'or du Jardin reçoit un nouvel étage : les cases correspondantes. Dans une finale de pions complexe, chaque case du roi attaquant « correspond » à une case du roi défenseur. Si le défenseur peut toujours occuper la case correspondante, il tient ; sinon, il perd. La triangulation est le moyen le plus simple de perdre un temps pour mettre l'adversaire hors de sa case correspondante. Règle de l'étage : dans une finale de pions bloquée, trouve d'abord les cases clés que l'attaquant veut atteindre, puis les cases que le défenseur doit tenir pour l'en empêcher. Le calcul vient ensuite, sur des cases nommées plutôt que sur des coups.",
    ancrage_sensoriel:
      "Vois deux pavages de couleur dans le jardin : chaque dalle d'un côté est reliée à une dalle de l'autre par un fil d'or.",
    rappels: ["triangle-or", "vis-a-vis", "porte-tournante"],
    focus_partie: "en finale de pions bloquée : as-tu nommé les cases clés avant de calculer ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire une finale de pions de la séance et relie par des traits trois paires de cases correspondantes." },
    checklist: ["Squelette désigné avant chaque solution", "Cases clés nommées", "Cases correspondantes identifiées"],
    sourcing: { anyThemes: ["pawnEndgame"], noThemes: ["mateIn1"], geometry: "kingManoeuvre", fallbackThemes: ["pawnEndgame"] },
  },
  RET(25, ["poudriere", "mortier", "tour-sentinelle", "fosse", "rempart-philidor", "triangle-or"], "L'Arsenal", "si ta partie entre en finale : as-tu nommé l'étape de conversion ou de défense à chaque coup ?", ["Une finale de la semaine écrite étape par étape"]),

  // ═══ Semaine 26 — La Citadelle ════════════════════════════════════════════
  {
    semaine: 26, jour: 1, metaphore_id: "herse", theme_metaphore: "La Citadelle — la Herse, nouvel étage",
    concept: "attaques sur roques opposés : calcul de la course",
    cours:
      "La Herse reçoit un nouvel étage. On comptait les temps ; on calcule désormais la course avec le Fil d'Ariane. Les candidats sont toujours les mêmes : pousser un pion pour ouvrir, sacrifier pour ouvrir plus vite, défendre en un coup qui ralentit l'adversaire de deux, contre-attaquer au centre. À ce niveau, la décision se joue souvent sur une ressource de l'adversaire oubliée : un échec intermédiaire sur ton roi, une prise qui ferme la colonne. Règle de l'étage : dans une course d'attaques, calcule SA meilleure attaque jusqu'au bout avant de lancer la tienne. Si elle arrive avant, la tienne ne sert à rien.",
    ancrage_sensoriel:
      "Entends les deux herses descendre et compte les maillons de chaque chaîne : la tienne en a un de moins.",
    rappels: ["herse", "fil-ariane", "impasse"],
    focus_partie: "avec roques opposés : as-tu calculé son attaque jusqu'au bout avant la tienne ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine l'arbre de la course pour un puzzle de la séance : ta ligne principale et sa meilleure attaque, avec le nombre de coups de chacune." },
    checklist: ["Squelette désigné avant chaque solution", "Attaque adverse calculée jusqu'au bout", "Ressource adverse cherchée (échec intermédiaire)"],
    sourcing: { anyThemes: ["kingsideAttack", "queensideAttack"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["kingsideAttack"] },
  },
  {
    semaine: 26, jour: 2, metaphore_id: "trebuchet", theme_metaphore: "La Citadelle — le Trébuchet, nouvel étage",
    concept: "sacrifices de pièce pour l'attaque",
    cours:
      "Le Trébuchet reçoit un nouvel étage : le sacrifice d'une pièce entière. On ne donne plus une qualité mais un cavalier ou un fou, contre deux pions et une attaque durable, ou pour un mat forcé. Il y a deux familles de sacrifices. Les sacrifices calculés mènent à un mat ou à un gain forcé : le Fil d'Ariane doit aller jusqu'au bout. Les sacrifices intuitifs donnent une attaque sans fin claire : il faut alors la Lunette (combien de pièces attaquent, combien défendent ?) et la Balance (qu'obtiens-je de durable ?). Règle de l'étage : nomme la famille de ton sacrifice avant de le jouer. Si c'est un sacrifice calculé, calcule. Si c'est un sacrifice intuitif, vérifie qu'au moins trois pièces participent.",
    ancrage_sensoriel:
      "Vois la pierre du trébuchet monter très haut, s'arrêter un instant dans le ciel, et tu ne sais pas encore où elle tombera.",
    rappels: ["trebuchet", "balance", "donjon-eventre"],
    focus_partie: "si tu as envisagé un sacrifice : était-il calculé ou intuitif, et l'as-tu traité comme tel ?",
    reconsolidation: { type: "recitation", consigne: "Pour deux puzzles de sacrifice, dis à quelle famille ils appartenaient et récite la ligne ou les critères qui les justifiaient." },
    checklist: ["Squelette désigné avant chaque solution", "Famille du sacrifice nommée", "Trois attaquants vérifiés pour un sacrifice intuitif"],
    sourcing: { anyThemes: ["sacrifice"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["sacrifice"] },
  },
  {
    semaine: 26, jour: 3, metaphore_id: "donjon-eventre", theme_metaphore: "La Citadelle — le Donjon éventré, nouvel étage",
    concept: "le roi au centre",
    cours:
      "Le Donjon éventré reçoit un nouvel étage : le roi resté au centre. Quand le roi n'a pas roqué et que le centre s'ouvre, les colonnes d et e deviennent des Nefs qui mènent droit à lui. Le plan : ouvrir le centre, même au prix d'un pion ou d'une pièce, placer les tours sur les colonnes centrales, et empêcher le roque (un fou sur la diagonale du roque, une pièce qui attaque la case de transit). Règle de l'étage : si le roi adverse est au centre, chaque coup doit ouvrir une ligne ou empêcher le roque. Un coup lent lui laisse le temps de s'abriter, et l'avantage s'évapore.",
    ancrage_sensoriel:
      "Vois le roi debout au milieu de la grande cour, sans mur autour, pendant que toutes les portes de la citadelle s'ouvrent en même temps.",
    rappels: ["donjon-eventre", "nef", "crypte"],
    focus_partie: "si un roi est resté au centre : chaque coup ouvrait-il une ligne ou empêchait-il le roque ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire un puzzle de roi au centre : colonnes ouvertes en bleu, cases de roque contrôlées en rouge." },
    checklist: ["Squelette désigné avant chaque solution", "Lignes centrales ouvertes", "Roque adverse empêché"],
    sourcing: { anyThemes: ["exposedKing", "sacrifice"], noThemes: ["mateIn1", "castling"], fallbackThemes: ["exposedKing"] },
  },
  {
    semaine: 26, jour: 4, metaphore_id: "chambre-close", theme_metaphore: "La Citadelle — la Chambre close, nouvel étage",
    concept: "mats longs : quatre coups et plus",
    cours:
      "La Chambre close reçoit un nouvel étage. Les mats de quatre coups et plus se résolvent avec deux outils à la fois. Le chunking : la figure finale, puis la position d'approche, puis le premier coup. Le Fil d'Ariane : à chaque coup, les réponses possibles du roi et de ses défenseurs. Il faut aussi chercher l'Impasse : la défense qui casse la figure, comme une interposition, une prise du sacrifice ou un échec du défenseur. Règle de l'étage : dans un mat long, vérifie à chaque coup qu'il n'y a qu'un nombre réduit de réponses adverses ; si une réponse sort de la figure, la combinaison ne tient pas.",
    ancrage_sensoriel:
      "Traverse le couloir du donjon où chaque porte se referme derrière toi, jusqu'à la chambre close où une seule bougie brûle.",
    rappels: ["chambre-close", "fil-ariane", "impasse"],
    focus_partie: "dans tes attaques : as-tu vérifié à chaque coup les réponses du roi ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour le mat le plus long de la séance, pars de la figure finale et remonte, en nommant à chaque coup les réponses possibles du roi." },
    checklist: ["Squelette désigné avant chaque solution", "Réponses du roi vérifiées à chaque coup", "Impasse cherchée avant de jouer"],
    sourcing: { anyThemes: ["mateIn4", "mateIn5"], noThemes: ["mateIn1", "mateIn2"], fallbackThemes: ["mateIn3", "mateIn4"] },
  },
  {
    semaine: 26, jour: 5, metaphore_id: "pont-levis", theme_metaphore: "La Citadelle — le Pont-levis, nouvel étage",
    concept: "attirer le roi hors de son abri",
    cours:
      "Le Pont-levis reçoit un nouvel étage : la chasse au roi. Un sacrifice attire le roi hors de son roque, puis une série d'échecs le pousse vers le centre ou vers ton camp, où tes pièces l'attendent. La chasse au roi est spectaculaire mais risquée : chaque échec doit garder le roi en mouvement, et l'on doit savoir où la chasse finit. Règle de l'étage : avant d'attirer le roi, trace le chemin de la chasse jusqu'à la case du mat ou du gain décisif. Si le roi peut s'arrêter en route sur une case sûre, le pont-levis se relève et tu as perdu ta pièce pour rien.",
    ancrage_sensoriel:
      "Sens le pont-levis s'abaisser et vois le roi qui sort, puis traverse la cour au pas de course, poursuivi par les torches.",
    rappels: ["pont-levis", "donjon-eventre", "mortier"],
    focus_partie: "si une chasse au roi était possible : as-tu tracé le chemin jusqu'au bout ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire le chemin du roi chassé dans un puzzle de la séance, case par case, jusqu'au mat." },
    checklist: ["Squelette désigné avant chaque solution", "Chemin de la chasse tracé jusqu'au bout", "Cases d'arrêt sûres du roi vérifiées"],
    sourcing: { anyThemes: ["attraction", "exposedKing"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["attraction"] },
  },
  {
    semaine: 26, jour: 6, metaphore_id: "crypte", theme_metaphore: "La Citadelle — la Crypte, nouvel étage",
    concept: "dernière rangée et combinaisons de déviation profondes",
    cours:
      "La Crypte reçoit un nouvel étage. Les combinaisons sur la dernière rangée deviennent profondes : on dévie un gardien, puis un deuxième, puis on scelle. Ou bien la menace de mat du couloir sert seulement à gagner du matériel ailleurs, parce que le défenseur ne peut pas à la fois garder sa dalle et sa dame. C'est la crypte comme levier, et non plus comme but. Règle de l'étage : quand la dernière rangée adverse est faible, ne cherche pas seulement le mat. Cherche ce que la menace de mat empêche l'adversaire de faire, et frappe là. Le squelette : la dalle et la pièce qui ne peut plus la quitter.",
    ancrage_sensoriel:
      "Sens la dalle de la crypte trembler sous tes pieds pendant que, plus haut, le gardien hésite entre deux portes.",
    rappels: ["crypte", "pilier-surcharge", "vanne"],
    focus_partie: "si une dernière rangée était faible : as-tu cherché ce que la menace empêchait ?",
    reconsolidation: { type: "recitation", consigne: "Pour deux puzzles de la séance, dis à voix haute quelle pièce ne pouvait plus quitter la dalle, et ce que cela permettait." },
    checklist: ["Squelette désigné avant chaque solution", "Gardiens de la dalle et leurs tâches nommés", "Menace de mat utilisée comme levier"],
    sourcing: { anyThemes: ["backRankMate", "deflection"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["backRankMate", "deflection"] },
  },
  RET(26, ["herse", "trebuchet", "donjon-eventre", "chambre-close", "pont-levis", "crypte"], "La Citadelle", "chaque attaque de la partie : as-tu calculé la meilleure défense avant de lancer l'assaut ?", ["Une attaque de la semaine écrite avec son arbre et sa meilleure défense"]),

  // ═══ Semaine 27 — L'Observatoire ══════════════════════════════════════════
  {
    semaine: 27, jour: 1, metaphore_id: "bascule", theme_metaphore: "L'Observatoire — la Bascule",
    concept: "la transition vers la finale",
    cours:
      "Au fond du Labyrinthe, une bascule relie l'Observatoire aux quartiers des finales. Elle fait passer d'une salle à l'autre, mais ne revient pas en arrière : un échange de dames, une simplification en finale de tours, une finale de pions, rien de cela ne se défait. Les maîtres passent beaucoup de temps sur ces décisions, parce qu'elles sont définitives. Règle de la bascule : avant d'échanger vers une finale, évalue la finale qui en sort avec les lieux du Port, de l'Arsenal ou du Jardin. Si elle est gagnée, simplifie, même avec un avantage moindre en apparence. Si elle est nulle, garde les pièces et cherche ailleurs. Lien avec la Lunette : la bascule est un choix d'évaluation, pas de calcul.",
    ancrage_sensoriel:
      "Sens la planche de la bascule s'incliner sous ton poids, et entends le déclic sec du loquet qui se referme derrière toi.",
    rappels: ["lunette", "roi-jardinier", "tour-sentinelle"],
    focus_partie: "à chaque échange de dames ou simplification de ta partie : avais-tu évalué la finale qui en sortait ?",
    reconsolidation: { type: "recitation", consigne: "Pour deux puzzles de la séance, nomme la finale d'arrivée et le lieu du palais qui permettait de l'évaluer." },
    checklist: ["Squelette désigné avant chaque solution", "Finale d'arrivée évaluée avant l'échange", "Simplification choisie (ou refusée) en connaissance de cause"],
    sourcing: { anyThemes: ["endgame", "advantage"], noThemes: ["mateIn1", "opening"], geometry: "rookTradeToPawnEnding", fallbackThemes: ["endgame"] },
  },
  {
    semaine: 27, jour: 2, metaphore_id: "balance", theme_metaphore: "L'Observatoire — la Balance, nouvel étage",
    concept: "déséquilibres matériels complexes",
    cours:
      "La Balance reçoit un nouvel étage : les déséquilibres complexes. Dame contre deux tours, trois pièces mineures contre dame, deux pièces contre tour et pion. Les valeurs habituelles (3, 3, 5, 9) ne sont qu'un point de départ. La dame aime les rois exposés et les pions faibles qu'elle peut attaquer en fourchette. Les deux tours aiment les colonnes ouvertes et la coordination. Les pièces mineures aiment les avant-postes et les positions fermées. Règle de l'étage : dans un déséquilibre, demande ce que chaque camp aime, et lequel voit la position aller dans sa direction. Le camp dont les pièces sont mieux adaptées a l'avantage, souvent malgré un léger déficit en points.",
    ancrage_sensoriel:
      "Vois la balance chargée de poids de formes différentes, et l'aiguille qui se stabilise lentement, contre toute attente.",
    rappels: ["balance", "mortier", "sanctuaire"],
    focus_partie: "si un déséquilibre matériel est apparu : quel camp avait les pièces adaptées à la position ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire un puzzle de déséquilibre de la séance et liste sous le dessin ce que chaque camp aimait dans la position." },
    checklist: ["Squelette désigné avant chaque solution", "Préférences de chaque camp nommées", "Direction de la position jugée"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "exchangeImbalance", fallbackThemes: ["advantage"] },
  },
  {
    semaine: 27, jour: 3, metaphore_id: "lunette", theme_metaphore: "L'Observatoire — la Lunette, nouvel étage",
    concept: "l'évaluation au bout des variantes",
    cours:
      "La Lunette reçoit un nouvel étage : évaluer au bout du Fil d'Ariane. Une variante longue n'a de valeur que si l'on évalue juste la position finale. Les erreurs courantes : compter le matériel en oubliant un pion passé dangereux, juger « égal » une position où un roi est exposé, oublier qu'une pièce est piégée. On règle donc la lunette à la fin de chaque galerie, mais en version rapide : matériel, rois, pions passés, pièce la plus faible. Règle de l'étage : au bout d'une variante, quatre cercles minimum. Si l'un d'eux contredit le matériel, c'est lui qui décide.",
    ancrage_sensoriel:
      "Au bout de la galerie du labyrinthe, une petite lunette est fixée dans la paroi : colle ton œil et vois toute la position d'un coup.",
    rappels: ["lunette", "fil-ariane", "cage"],
    focus_partie: "au bout de tes calculs : as-tu évalué avec quatre cercles, ou seulement le matériel ?",
    reconsolidation: { type: "recitation", consigne: "Pour deux puzzles de la séance, évalue à voix haute la position finale avec les quatre cercles rapides." },
    checklist: ["Squelette désigné avant chaque solution", "Quatre cercles rapides au bout de chaque variante", "Matériel contredit par un cercle repéré"],
    sourcing: { anyThemes: ["advantage", "crushing"], allThemes: ["long"], noThemes: ["mateIn1", "mateIn2", "mateIn3"], fallbackThemes: ["long"] },
  },
  {
    semaine: 27, jour: 4, metaphore_id: "girouette", theme_metaphore: "L'Observatoire — la Girouette, nouvel étage",
    concept: "manœuvres de pièces en position fermée",
    cours:
      "La Girouette reçoit un nouvel étage : la manœuvre. Dans les positions fermées, une pièce peut mettre quatre ou cinq coups pour rejoindre sa bonne case, un cavalier par exemple qui passe de f3 à d2, b3 puis c5. Ces manœuvres sont des plans à part entière, et l'adversaire n'a souvent pas de moyen de les empêcher. Règle de l'étage : en position fermée, trouve la meilleure case de chaque pièce dans dix coups, puis le chemin pour y aller. Vérifie seulement que l'adversaire ne peut pas ouvrir la position pendant ta manœuvre. Si oui, l'Échafaudage passe d'abord.",
    ancrage_sensoriel:
      "Vois toutes les girouettes du toit tourner lentement l'une après l'autre, chacune vers sa direction, sans se presser.",
    rappels: ["girouette", "echafaudage", "registre"],
    focus_partie: "en position fermée : as-tu trouvé la meilleure case de tes pièces dans dix coups ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire un puzzle de la séance et trace le chemin de la manœuvre de la pièce la plus mal placée." },
    checklist: ["Squelette désigné avant chaque solution", "Meilleure case de chaque pièce trouvée", "Ouverture adverse vérifiée pendant la manœuvre"],
    sourcing: { anyThemes: ["quietMove"], noThemes: ["mateIn1", "opening"], fallbackThemes: ["quietMove", "advantage"] },
  },
  {
    semaine: 27, jour: 5, metaphore_id: "echafaudage", theme_metaphore: "L'Observatoire — l'Échafaudage, nouvel étage",
    concept: "prophylaxie profonde",
    cours:
      "L'Échafaudage reçoit un nouvel étage : la prophylaxie profonde. Au premier étage, on empêchait la menace immédiate. Ici, on empêche le plan de l'adversaire trois ou quatre coups à l'avance : une rupture qu'il prépare, une manœuvre de cavalier vers une case forte, un roque qui mettrait son roi à l'abri. Cette prophylaxie demande de se mettre à sa place et de faire, pour lui, le travail de la Lunette et de la Girouette. Règle de l'étage : dans les positions calmes, demande quel est le meilleur plan de l'adversaire, et trouve le coup qui le rend impossible ou inoffensif. Souvent, ce coup améliore aussi ta position.",
    ancrage_sensoriel:
      "Grimpe sur l'échafaudage et regarde par-dessus le mur : tu vois le chantier de l'adversaire, et le mur qu'il veut monter.",
    rappels: ["echafaudage", "lunette", "girouette"],
    focus_partie: "dans les moments calmes : quel était son meilleur plan, et l'as-tu empêché ?",
    reconsolidation: { type: "recitation", consigne: "Pour deux puzzles de la séance, formule le plan de l'adversaire en une phrase, puis le coup prophylactique." },
    checklist: ["Squelette désigné avant chaque solution", "Plan adverse formulé", "Coup prophylactique qui améliore aussi ma position"],
    sourcing: { anyThemes: ["defensiveMove", "quietMove"], noThemes: ["mateIn1", "mateIn2"], fallbackThemes: ["defensiveMove"] },
  },
  {
    semaine: 27, jour: 6, metaphore_id: "registre", theme_metaphore: "L'Observatoire — le Registre, nouvel étage",
    concept: "convertir un avantage d'espace",
    cours:
      "Le Registre reçoit un nouvel étage : convertir l'espace. L'avantage d'espace ne gagne pas tout seul. Il faut l'utiliser pour créer une seconde faiblesse, puis ouvrir la position au moment où l'adversaire n'a plus de place pour regrouper ses pièces. C'est le principe des deux faiblesses : on attaque une aile, l'adversaire se défend, on attaque l'autre, et il ne peut pas défendre les deux à la fois. Règle de l'étage : avec l'espace, cherche une deuxième cible sur l'autre aile avant d'ouvrir. Contre l'espace, échange les pièces et cherche une rupture qui libère tes pièces avant que la seconde faiblesse n'apparaisse.",
    ancrage_sensoriel:
      "Feuillette le registre jusqu'à la dernière page : il ne reste que deux cases libres, une à chaque bout de la ligne.",
    rappels: ["registre", "sape", "allee-eloignee"],
    focus_partie: "avec l'espace : as-tu créé une deuxième faiblesse avant d'ouvrir ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire un puzzle de la séance et marque les deux faiblesses adverses, une sur chaque aile." },
    checklist: ["Squelette désigné avant chaque solution", "Deux faiblesses identifiées", "Ouverture jouée après la seconde faiblesse"],
    sourcing: { anyThemes: ["advancedPawn", "quietMove"], noThemes: ["mateIn1", "opening"], geometry: "pawnChain", fallbackThemes: ["advancedPawn"] },
  },
  RET(27, ["bascule", "balance", "lunette", "girouette", "echafaudage", "registre"], "L'Observatoire", "chaque échange ou simplification de la partie : as-tu évalué la finale d'arrivée ?", ["Trois décisions d'échange de la semaine justifiées par écrit"]),

  // ═══ Semaine 28 — Le Bastion ══════════════════════════════════════════════
  {
    semaine: 28, jour: 1, metaphore_id: "poterne", theme_metaphore: "Le Bastion — la Poterne, nouvel étage",
    concept: "défense précise dans les positions critiques",
    cours:
      "La Poterne reçoit un nouvel étage. Dans les positions critiques, l'adversaire a une initiative réelle et chaque coup défensif doit être exact. Le Fil d'Ariane sert aussi en défense : on dessine l'arbre de SES attaques, et l'on cherche le coup qui ferme le plus de galeries à la fois. Un bon coup défensif à ce niveau fait souvent deux choses : il pare la menace principale et prépare une contre-menace (la Contre-mine). Règle de l'étage : en défense, classe tes candidats selon le nombre de menaces adverses qu'ils neutralisent, puis choisis celui qui ajoute une menace à toi.",
    ancrage_sensoriel:
      "Dans le couloir de la poterne, plusieurs portes s'ouvrent devant toi : une seule mène dehors, et elle est à moitié cachée.",
    rappels: ["poterne", "fil-ariane", "contre-mine"],
    focus_partie: "dans tes défenses : as-tu choisi le coup qui neutralisait le plus de menaces ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine l'arbre des menaces adverses pour un puzzle défensif de la séance, et marque le coup qui en fermait le plus." },
    checklist: ["Squelette désigné avant chaque solution", "Candidats classés par menaces neutralisées", "Contre-menace ajoutée à la défense"],
    sourcing: { anyThemes: ["defensiveMove"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["defensiveMove"] },
  },
  {
    semaine: 28, jour: 2, metaphore_id: "ronde", theme_metaphore: "Le Bastion — la Ronde, nouvel étage",
    concept: "sauver les positions perdues",
    cours:
      "La Ronde reçoit un nouvel étage : sauver les positions perdues. Un joueur de 2200 ne gagne pas seulement des parties, il en sauve. Les ressources se combinent : une forteresse, un échec perpétuel, un pat, une course de pions qui force la nulle, ou un piège tendu dans une position où l'adversaire croit tout gagner (le Masque, que tu rencontreras plus tard). Règle de l'étage : dans une position perdue, cherche la position de nulle la plus proche (forteresse, perpétuel, pat) et calcule le chemin pour y aller. Ne te défends pas « en général », défends-toi vers un but précis.",
    ancrage_sensoriel:
      "Sur le chemin de ronde, la nuit tombe et l'ennemi est aux portes, mais tu vois au loin une tour de garde encore debout : c'est là que tu vas.",
    rappels: ["ronde", "deux-fanaux", "porte-tournante"],
    focus_partie: "dans une position difficile : quelle position de nulle visais-tu ?",
    reconsolidation: { type: "recitation", consigne: "Pour deux puzzles de nulle de la séance, nomme la ressource (forteresse, perpétuel, pat) et récite le chemin pour y arriver." },
    checklist: ["Squelette désigné avant chaque solution", "Position de nulle visée nommée", "Chemin calculé vers la nulle"],
    sourcing: { anyThemes: ["equality"], noThemes: ["mateIn1"], fallbackThemes: ["equality", "defensiveMove"] },
  },
  {
    semaine: 28, jour: 3, metaphore_id: "contre-mine", theme_metaphore: "Le Bastion — la Contre-mine, nouvel étage",
    concept: "contre-attaques calculées",
    cours:
      "La Contre-mine reçoit un nouvel étage. On sait qu'une menace plus forte peut remplacer la défense. Ici, on la calcule. La contre-attaque n'est correcte que si elle arrive plus vite ET si l'adversaire ne peut pas parer en améliorant son attaque. On utilise le Fil d'Ariane pour les deux attaques en parallèle, en alternant un coup de chaque. Règle de l'étage : avant une contre-attaque, compte les coups jusqu'au mat ou au gain décisif pour chaque camp, en prenant les meilleures défenses. Si ta contre-mine perd la course d'un seul temps, défends d'abord, puis contre-attaque.",
    ancrage_sensoriel:
      "Sens la terre trembler de deux côtés à la fois, et entends les coups de pioche qui s'accélèrent dans les deux galeries.",
    rappels: ["contre-mine", "herse", "fil-ariane"],
    focus_partie: "si tu as contre-attaqué : avais-tu calculé la course jusqu'au bout ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de contre-attaque, remonte à l'envers les deux attaques et compte les temps de chacune." },
    checklist: ["Squelette désigné avant chaque solution", "Course des deux attaques calculée", "Défense choisie si la contre-attaque perd un temps"],
    sourcing: { anyThemes: ["intermezzo", "defensiveMove", "exposedKing"], noThemes: ["mateIn1", "mateIn2"], fallbackThemes: ["intermezzo", "defensiveMove"] },
  },
  {
    semaine: 28, jour: 4, metaphore_id: "impasse", theme_metaphore: "Le Bastion — l'Impasse, deuxième étage",
    concept: "réfuter les sacrifices adverses",
    cours:
      "L'Impasse du Labyrinthe reçoit son étage, au Bastion. On cherchait la réfutation de sa propre combinaison ; on cherche ici celle de l'adversaire. Face à un sacrifice, la question n'est pas « puis-je prendre ? » mais « que se passe-t-il si je prends, et si je ne prends pas ? ». Souvent, la meilleure défense est de refuser le sacrifice, ou de prendre et rendre le matériel au bon moment pour casser l'attaque. Règle de l'étage : contre un sacrifice, calcule trois galeries. Prendre et défendre. Prendre et rendre. Refuser et contre-attaquer. L'impasse de l'adversaire est souvent dans la troisième.",
    ancrage_sensoriel:
      "Vois l'ennemi entrer dans la galerie avec sa torche, et toi qui l'attends au fond, devant le mur de l'impasse.",
    rappels: ["impasse", "poterne", "trebuchet"],
    focus_partie: "face à un sacrifice : as-tu calculé les trois galeries (prendre, rendre, refuser) ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Pour un puzzle de la séance, dessine les trois galeries face au sacrifice et marque celle qui le réfutait." },
    checklist: ["Squelette désigné avant chaque solution", "Trois galeries calculées face au sacrifice", "Refus du sacrifice envisagé"],
    sourcing: { anyThemes: ["defensiveMove", "equality"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["defensiveMove"] },
  },
  {
    semaine: 28, jour: 5, metaphore_id: "cage", theme_metaphore: "Le Bastion — la Cage, nouvel étage",
    concept: "pièces piégées dans les longues variantes",
    cours:
      "La Cage reçoit un nouvel étage. Dans les variantes longues, une pièce se retrouve souvent piégée trois ou quatre coups plus tard, sur une case qui semblait active, comme une dame partie gagner un pion ou un fou en avant-poste lointain. Le calculateur qui ne regarde que les échecs et les prises rate ce gain lent. Règle de l'étage : au bout de chaque galerie du Fil d'Ariane, compte les cases de fuite des pièces les plus avancées des deux camps. Une pièce avec une seule case à la fin d'une variante est une pièce que l'on peut gagner, ou perdre.",
    ancrage_sensoriel:
      "Au fond de la galerie, vois un oiseau posé sur une branche, et la porte de la cage qui se referme doucement derrière lui.",
    rappels: ["cage", "fil-ariane", "trempe"],
    focus_partie: "au bout de tes calculs : as-tu compté les cases de fuite des pièces avancées ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de pièce piégée, remonte à l'envers jusqu'au coup où la pièce est entrée dans la cage." },
    checklist: ["Squelette désigné avant chaque solution", "Cases de fuite comptées au bout de chaque variante", "Pièce piégée repérée dans les deux camps"],
    sourcing: { anyThemes: ["trappedPiece"], noThemes: ["mateIn1"], fallbackThemes: ["trappedPiece"] },
  },
  {
    semaine: 28, jour: 6, metaphore_id: "pilier-surcharge", theme_metaphore: "Le Bastion — le Pilier surchargé, défense",
    concept: "décharger ses propres piliers",
    cours:
      "Le Pilier surchargé se voit cette fois du côté du défenseur. Avant que l'adversaire ne fasse céder ton pilier, décharge-le. Donne une deuxième pièce à la défense d'une case, échange l'attaquant qui le surcharge, ou change de structure pour qu'il n'ait plus deux tâches. C'est une forme de prophylaxie très concrète. Règle de l'étage : à chaque coup calme, repère tes pièces qui défendent deux choses à la fois. Si l'adversaire peut attaquer l'une des deux, renforce-la ou supprime la deuxième tâche maintenant, pas au moment où il frappe.",
    ancrage_sensoriel:
      "Glisse une poutre neuve à côté du pilier qui ploie, et entends le craquement s'arrêter net.",
    rappels: ["pilier-surcharge", "echafaudage", "crypte"],
    focus_partie: "dans ta partie, quelles pièces défendaient deux choses à la fois ?",
    reconsolidation: { type: "recitation", consigne: "Pour deux puzzles de la séance, nomme le pilier surchargé et récite le coup qui l'aurait déchargé à temps." },
    checklist: ["Squelette désigné avant chaque solution", "Mes pièces à double tâche repérées", "Pilier déchargé avant l'attaque"],
    sourcing: { anyThemes: ["deflection", "capturingDefender", "defensiveMove"], noThemes: ["mateIn1"], fallbackThemes: ["deflection", "capturingDefender"] },
  },
  RET(28, ["poterne", "ronde", "contre-mine", "impasse", "cage", "pilier-surcharge"], "Le Bastion", "chaque moment de défense : vers quel but précis te défendais-tu ?", ["Une défense de la semaine écrite avec son but (nulle, contre-attaque, forteresse)"]),

  // ═══ Semaine 29 — Le Tour de la Cité (synthèse et bilan de phase) ═════════
  {
    semaine: 29, jour: 1, metaphore_id: "fil-ariane", theme_metaphore: "Le Tour de la Cité — retour au Labyrinthe",
    concept: "synthèse : calcul long méthodique",
    cours:
      "Dernière semaine de la phase 4 : le Tour de la Cité. Aucun lieu neuf. Aujourd'hui, le Labyrinthe en entier. Les puzzles du jour sont les plus longs de la phase. Protocole complet : candidats (Enclume plus un coup calme), une galerie à la fois jusqu'à une position calme, à chaque reprise un coup de Soufflet possible, au fond de la galerie un coup de Trempe possible, évaluation rapide avec la Lunette, puis recherche de l'Impasse. Ce protocole paraît lourd, mais il devient fluide avec la répétition. C'est le but de cette phase : que la méthode devienne une habitude, pas un effort.",
    ancrage_sensoriel:
      "Rentre une dernière fois dans le labyrinthe, le fil d'Ariane à la main, et retrouve les sons de chaque lieu à chaque carrefour.",
    rappels: ["fil-ariane", "impasse", "soufflet", "trempe", "lunette"],
    focus_partie: "dans la position la plus critique : as-tu suivi le protocole complet du Labyrinthe ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Pour le puzzle le plus long de la séance, dessine l'arbre complet avec les « S » (soufflets), les « T » (coups tranquilles) et l'impasse réfutée." },
    checklist: ["Squelette désigné avant chaque solution", "Protocole complet suivi", "Impasse cherchée avant de jouer"],
    sourcing: { anyThemes: ["veryLong", "long"], noThemes: ["opening", "mateIn1", "mateIn2"], fallbackThemes: ["long"] },
  },
  {
    semaine: 29, jour: 2, metaphore_id: "impasse", theme_metaphore: "Le Tour de la Cité — l'Impasse et le Bastion",
    concept: "synthèse : défense et réfutation",
    cours:
      "Deuxième jour : la défense. Les puzzles du jour sont des positions où l'adversaire attaque. Il faut trouver la Poterne (le coup unique), la Ronde (la nulle), la Contre-mine (la menace plus forte), ou la réfutation de son sacrifice (l'Impasse). Le protocole : arbre de ses menaces, candidats classés par menaces neutralisées, puis trois galeries face à un sacrifice. Le défenseur qui connaît ces portes ne se défend pas au hasard, il se dirige vers un but. Ce jour compte pour le bilan de phase.",
    ancrage_sensoriel:
      "Retrouve l'impasse du labyrinthe, puis remonte l'escalier jusqu'au Bastion : la poterne, la ronde, la contre-mine.",
    rappels: ["impasse", "poterne", "ronde", "contre-mine", "pilier-surcharge"],
    focus_partie: "dans tes défenses de la partie : quel lieu du Bastion t'a sauvé, ou aurait pu te sauver ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour le puzzle défensif le plus difficile, remonte à l'envers et nomme, à chaque coup, la porte utilisée." },
    checklist: ["Squelette désigné avant chaque solution", "Arbre des menaces adverses dessiné", "But de la défense nommé"],
    sourcing: { anyThemes: ["defensiveMove", "equality"], noThemes: ["mateIn1"], fallbackThemes: ["defensiveMove"] },
  },
  {
    semaine: 29, jour: 3, metaphore_id: "bascule", theme_metaphore: "Le Tour de la Cité — la Bascule et les finales",
    concept: "synthèse : transition et technique",
    cours:
      "Troisième jour : de la Bascule aux finales. Les puzzles du jour commencent souvent par une simplification, puis demandent la technique de la finale qui en sort : finale de pions (Triangle d'or, Brèche), de tours (Fosse, Pont de Lucena, Rempart de Philidor), de pièces mineures (Jetée, Fanal) ou de dames (Poudrière). Le protocole : à la Bascule, évaluer la finale d'arrivée ; dans la finale, nommer l'étape de la technique à chaque coup. Le squelette : la case critique de la finale d'arrivée.",
    ancrage_sensoriel:
      "Sens la bascule qui s'incline et te dépose dans le Port, puis dans l'Arsenal, puis dans le Jardin : trois salles, trois techniques.",
    rappels: ["bascule", "fosse", "triangle-or", "jetee", "poudriere"],
    focus_partie: "à chaque simplification de ta partie : la finale d'arrivée était-elle évaluée, et la technique nommée ?",
    reconsolidation: { type: "recitation", consigne: "Pour deux puzzles de la séance, nomme la finale d'arrivée, sa technique et la case critique." },
    checklist: ["Squelette désigné avant chaque solution", "Finale d'arrivée évaluée", "Étape de la technique nommée"],
    sourcing: { anyThemes: ["endgame"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["endgame"] },
  },
  {
    semaine: 29, jour: 4, metaphore_id: "enclume", theme_metaphore: "Le Tour de la Cité — retour à la Forge",
    concept: "synthèse : combinaisons à motifs multiples",
    cours:
      "Quatrième jour : la Forge et l'Atelier ensemble. Les combinaisons du jour enchaînent plusieurs motifs : dégagement et interception, attraction et fourchette, déviation et mat. Le protocole : l'Enclume pour les candidats, puis le découpage en motifs nommés. Trois motifs, trois cases de squelette. Une combinaison qu'on peut nommer en trois mots est une combinaison qu'on retrouvera dans une autre partie : c'est le but du chunking. Le reste de la variante se reconstruit à partir de ces trois blocs.",
    ancrage_sensoriel:
      "Repasse dans la Forge et entends tous ses sons à la suite, puis l'Atelier : la cheville, la broche, le carrefour.",
    rappels: ["enclume", "ramonage", "vanne", "carrefour", "pilier-surcharge"],
    focus_partie: "après chaque combinaison de ta partie : pouvais-tu la nommer en trois mots ?",
    reconsolidation: { type: "recitation", consigne: "Pour trois puzzles de la séance, récite la combinaison en trois mots (trois motifs) et les trois cases du squelette." },
    checklist: ["Squelette désigné avant chaque solution", "Combinaison nommée en trois motifs", "Trois cases du squelette récitées"],
    sourcing: { anyThemes: ["sacrifice", "clearance", "interference", "deflection", "attraction"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["long"] },
  },
  {
    semaine: 29, jour: 5, metaphore_id: "poudriere", theme_metaphore: "Le Tour de la Cité — retour à l'Arsenal",
    concept: "synthèse : finales de pièces lourdes calculées",
    cours:
      "Cinquième jour : l'Arsenal. Finales de dames, de dame et tour, de tours. À ce niveau, les principes (activité, roi, pions passés) donnent la direction, et le calcul (Fil d'Ariane) donne le résultat. En finale de dames, l'arbre des échecs ; en finale de tours, les lignes de promotion calculées jusqu'au bout ; avec dame et tour, les échecs adverses avant les menaces. Le squelette : la case de promotion, la case d'abri, la ligne de coupure. Ce jour compte pour le bilan de phase.",
    ancrage_sensoriel:
      "Retrouve l'odeur de poudre, le coup sourd du mortier, et le vent en haut de la Tour sentinelle.",
    rappels: ["poudriere", "mortier", "tour-sentinelle", "fosse", "rempart-philidor"],
    focus_partie: "en finale de pièces lourdes : principes pour la direction, calcul pour le résultat ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire une finale de la séance et marque la case de promotion, la case d'abri et la ligne de coupure." },
    checklist: ["Squelette désigné avant chaque solution", "Lignes de promotion calculées", "Échecs adverses comptés"],
    sourcing: { anyThemes: ["rookEndgame", "queenEndgame", "queenRookEndgame"], noThemes: ["mateIn1"], fallbackThemes: ["endgame"] },
  },
  {
    semaine: 29, jour: 6, metaphore_id: "trebuchet", theme_metaphore: "Le Tour de la Cité — retour à la Citadelle",
    concept: "synthèse : attaques calculées",
    cours:
      "Dernier jour de concept de la phase 4 : la Citadelle. Les attaques du jour mélangent sacrifices calculés et intuitifs, roi au centre, chasse au roi, mats longs. Le protocole complet : compter attaquants et défenseurs (Lunette), nommer la famille du sacrifice (Trébuchet), tracer la figure finale (Chambre close), calculer la course (Herse) et chercher la réfutation (Impasse). Demain, le bilan : la rétention et la réussite de cette semaine décident du passage à la phase 5.",
    ancrage_sensoriel:
      "Monte une dernière fois sur la colline de la Citadelle et entends à la suite le trébuchet, les herses, le pont-levis.",
    rappels: ["trebuchet", "herse", "donjon-eventre", "chambre-close", "pont-levis"],
    focus_partie: "chaque attaque de la partie : famille du sacrifice nommée, figure tracée, réfutation cherchée ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour l'attaque la plus longue de la séance, pars du mat et remonte, en nommant à chaque coup le lieu de la Citadelle." },
    checklist: ["Squelette désigné avant chaque solution", "Famille du sacrifice nommée", "Réfutation cherchée avant de jouer"],
    sourcing: { anyThemes: ["sacrifice", "kingsideAttack", "exposedKing"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["sacrifice"] },
  },
  RET(29, ["fil-ariane", "impasse", "bascule", "enclume", "poudriere", "trebuchet"], "Le Tour de la Cité", "chaque lieu du palais rencontré, tous quartiers confondus : c'est le bilan de la phase 4.", ["Bilan écrit de la phase 4 : trois lieux maîtrisés, trois lieux à renforcer"], { phase: 4, suivante: "la phase 5 (2250 → 2400)" }),
];

/** Aucune position construite en phase 4 : tout vient du dump Lichess, vérifié par Stockfish. */
export const PHASE_4_CONSTRUCTED: readonly ConstructedPosition[] = [];
