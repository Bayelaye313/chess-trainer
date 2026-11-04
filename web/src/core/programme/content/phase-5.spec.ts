import { retentionDay as RET } from "./retention-day";
import type { ConstructedPosition, DaySpec } from "./spec-types";

/**
 * Phase 5 — 2250 → 2400 : perfectionnement, décisions de compétition (semaines 30 à 36).
 *
 * Parcours du palais : le Théâtre (moment critique, contrôle de bévue, coups
 * pièges) → l'Arsenal et le Port (finales de maître) → la Citadelle (attaque)
 * → la Bibliothèque (structures et plans) → le Labyrinthe (calcul) → le
 * Bastion (défense) → le Tour final de la Cité (synthèse et bilan du programme).
 *
 * Plus aucun quartier n'est créé après la semaine 30 : la phase 5 consolide
 * le palais entier par visites espacées, chaque lieu relié aux décisions
 * pratiques du Théâtre (quand calculer, comment vérifier, quel piège éviter).
 *
 * Texte seulement : les puzzles sont tirés par le générateur à partir de
 * `sourcing`, filtrés sur l'échiquier (`geometry`) et vérifiés par Stockfish.
 */

export const PHASE_5_DAYS: readonly DaySpec[] = [
  // ═══ Semaine 30 — Le Théâtre ══════════════════════════════════════════════
  {
    semaine: 30, jour: 1, metaphore_id: "coulisses", theme_metaphore: "Le Théâtre — les Coulisses",
    concept: "reconnaître le moment critique",
    cours:
      "Le dernier quartier de la Cité est un théâtre. On y apprend ce qui sépare un joueur fort d'un joueur très fort : savoir QUAND réfléchir. Dans les coulisses, on entend le changement de décor avant de le voir. Sur l'échiquier, certains signaux annoncent un moment critique : un échange qui change la structure, une rupture de pions, un roi qui quitte son abri, une pièce adverse qui arrive près de ton roi, une simplification possible vers une finale. Règle des coulisses : quand l'un de ces signaux apparaît, arrête-toi et prends le temps du Fil d'Ariane. Le reste du temps, joue vite les coups qui suivent ton plan. Beaucoup de parties se perdent en un seul coup, souvent dans un moment critique joué trop vite.",
    ancrage_sensoriel:
      "Derrière le rideau, entends les machinistes déplacer un décor lourd sur le plancher : un grondement sourd, puis le silence avant la scène.",
    rappels: ["fil-ariane", "bascule", "lunette"],
    focus_partie: "note chaque moment critique de ta partie (signal entendu en coulisses) et le temps passé dessus.",
    reconsolidation: { type: "recitation", consigne: "Récite les cinq signaux du moment critique, puis dis lequel était présent dans chaque puzzle de la séance." },
    checklist: ["Squelette désigné avant chaque solution", "Signal du moment critique nommé", "Temps de réflexion concentré sur les moments critiques"],
    sourcing: { anyThemes: ["crushing", "advantage"], allThemes: ["middlegame"], noThemes: ["mateIn1", "mateIn2", "opening"], fallbackThemes: ["crushing"] },
  },
  {
    semaine: 30, jour: 2, metaphore_id: "sablier", theme_metaphore: "Le Théâtre — le Sablier",
    concept: "le contrôle de bévue",
    cours:
      "Dans la loge de l'acteur, un sablier. Avant chaque réplique, il le retourne et se pose trois questions. Sur l'échiquier, c'est le contrôle de bévue, la dernière vérification avant de lâcher la pièce. Un : que menace le dernier coup de l'adversaire ? Deux : qu'est-ce que mon coup laisse sans défense ou affaiblit ? Trois : quel est son meilleur échec, sa meilleure prise ou sa meilleure menace après mon coup ? Ces trois questions prennent dix secondes, et elles attrapent la plupart des gaffes simples, à tous les niveaux. Règle du sablier : chaque coup, même évident, passe par le sablier. Lien avec l'Enclume : la troisième question est l'Enclume appliquée à l'adversaire.",
    ancrage_sensoriel:
      "Sens le verre lisse et froid du sablier sous ta main quand tu le retournes, et entends le fin ruissellement du sable.",
    rappels: ["enclume", "poterne", "pierre-descellee"],
    focus_partie: "dans ta partie, retourne le sablier avant CHAQUE coup, et note les fois où tu l'as oublié.",
    reconsolidation: { type: "recitation", consigne: "Récite les trois questions du sablier, puis applique-les à voix haute à la position du 3e puzzle reconstruite de mémoire." },
    checklist: ["Squelette désigné avant chaque solution", "Trois questions du sablier posées à chaque coup", "Aucune gaffe dans ma partie"],
    sourcing: { anyThemes: ["defensiveMove", "hangingPiece"], noThemes: ["mateIn1"], fallbackThemes: ["defensiveMove"] },
  },
  {
    semaine: 30, jour: 3, metaphore_id: "masque", theme_metaphore: "Le Théâtre — le Masque",
    concept: "le coup naturel qui perd",
    cours:
      "Dans la réserve des costumes, des masques. Sur scène, le coup le plus naturel en porte parfois un. Derrière une prise évidente, une reprise « automatique » ou un échec « gratuit », il y a un piège. Les adversaires forts tendent ces pièges en laissant un coup naturel qui perd. Les signes du masque : un cadeau trop beau (pièce en prise sans raison), une position où l'adversaire vient de jouer un coup étrange, une reprise qui ouvre une ligne vers ton roi. Règle du masque : quand un coup paraît trop facile, cherche ce que l'adversaire espère que tu joues. Puis demande-toi si ton coup naturel tombe dans ce qu'il espère. Lien avec l'Impasse : le masque est l'impasse que l'adversaire a préparée pour toi.",
    ancrage_sensoriel:
      "Prends un masque doré dans la réserve et retourne-le : à l'intérieur, l'expression est inverse, un sourire devient grimace.",
    rappels: ["impasse", "soufflet", "pont-levis"],
    focus_partie: "chaque fois qu'un coup t'a semblé trop facile : as-tu soulevé le masque ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de la séance, pars de la solution et remonte : quel était le coup naturel, et pourquoi perdait-il ?" },
    checklist: ["Squelette désigné avant chaque solution", "Coup naturel identifié et vérifié", "Piège adverse cherché derrière les cadeaux"],
    sourcing: { anyThemes: ["quietMove", "intermezzo", "defensiveMove"], noThemes: ["mateIn1"], fallbackThemes: ["quietMove", "intermezzo"] },
  },
  {
    semaine: 30, jour: 4, metaphore_id: "fil-ariane", theme_metaphore: "Le Théâtre — le Fil d'Ariane sur scène",
    concept: "calculer sous la pendule",
    cours:
      "Le Fil d'Ariane monte sur la scène du Théâtre. En partie, le calcul se fait sous la pendule : on n'a pas le temps de dessiner l'arbre entier. On le taille donc : deux ou trois candidats, pas plus, choisis avec l'Enclume et les Coulisses. On approfondit le plus prometteur et l'on vérifie les autres rapidement. Si deux lignes semblent égales, on choisit la plus sûre ou la plus simple, pas la plus belle. Règle du fil sur scène : limite les candidats, approfondis un seul, vérifie avec le Sablier, joue. La recherche de la perfection à la pendule coûte plus de points qu'elle n'en rapporte.",
    ancrage_sensoriel:
      "Sur la scène, sous les projecteurs, déroule le fil d'Ariane et entends le tic-tac de la pendule posée au bord des planches.",
    rappels: ["fil-ariane", "coulisses", "sablier"],
    focus_partie: "dans les moments critiques : combien de candidats as-tu examinés, et combien de temps ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Pour le puzzle le plus long, dessine l'arbre taillé : trois candidats maximum, une seule branche approfondie." },
    checklist: ["Squelette désigné avant chaque solution", "Trois candidats maximum", "Ligne la plus sûre préférée à égalité"],
    sourcing: { anyThemes: ["long", "veryLong"], noThemes: ["opening", "mateIn1", "mateIn2"], fallbackThemes: ["long"] },
  },
  {
    semaine: 30, jour: 5, metaphore_id: "impasse", theme_metaphore: "Le Théâtre — l'Impasse en coulisses",
    concept: "les coups d'attente piégeux",
    cours:
      "L'Impasse reçoit un étage au Théâtre : tendre ses propres pièges. Un coup d'attente qui laisse à l'adversaire un coup naturel perdant, une pièce apparemment en prise qu'il ne faut pas prendre, une position où toutes ses tentatives actives échouent : ce sont des masques que TU portes. Ils marchent dans les positions équilibrées où l'adversaire veut gagner. Règle de l'étage : dans une position calme, cherche le coup qui garde ta position solide ET laisse à l'adversaire un coup tentant qui perd. Ce n'est pas du bluff : le coup doit être bon même si l'adversaire ne tombe pas dans le piège.",
    ancrage_sensoriel:
      "En coulisses, mets toi-même un masque devant le miroir et vois ton reflet sourire, alors que derrière, tu restes concentré.",
    rappels: ["impasse", "masque", "trempe"],
    focus_partie: "dans les positions calmes : as-tu cherché un coup solide qui tend aussi un piège ?",
    reconsolidation: { type: "recitation", consigne: "Pour un puzzle de la séance, nomme le coup tentant de l'adversaire et explique pourquoi il perdait." },
    checklist: ["Squelette désigné avant chaque solution", "Coup solide ET piégeux cherché", "Coup tentant de l'adversaire identifié"],
    sourcing: { anyThemes: ["quietMove", "zugzwang"], noThemes: ["mateIn1"], fallbackThemes: ["quietMove"] },
  },
  {
    semaine: 30, jour: 6, metaphore_id: "echafaudage", theme_metaphore: "Le Théâtre — l'Échafaudage de la scène",
    concept: "prophylaxie dans les positions critiques",
    cours:
      "L'Échafaudage du Chantier soutient aussi le décor du Théâtre. Dans les moments critiques, la prophylaxie change de rôle : il ne s'agit plus d'empêcher un plan lent, mais une ressource tactique précise que l'adversaire garde en réserve, comme un échec intermédiaire, une interposition ou une contre-attaque. On la supprime AVANT de lancer sa combinaison. C'est le coup prophylactique au milieu d'une attaque, l'un des plus difficiles à trouver. Règle de l'étage : avant une combinaison, cherche sa meilleure ressource (l'Impasse). Si tu en trouves une, cherche d'abord le coup qui la supprime, puis lance la combinaison.",
    ancrage_sensoriel:
      "Sur scène, un machiniste fixe une dernière poutre derrière le décor juste avant le lever de rideau, et le décor ne bouge plus.",
    rappels: ["echafaudage", "impasse", "coulisses"],
    focus_partie: "avant chaque combinaison de ta partie : as-tu supprimé sa meilleure ressource d'abord ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de la séance, remonte à l'envers et identifie le coup prophylactique qui précédait la combinaison." },
    checklist: ["Squelette désigné avant chaque solution", "Ressource adverse identifiée avant la combinaison", "Coup prophylactique joué d'abord"],
    sourcing: { anyThemes: ["quietMove", "defensiveMove"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["quietMove"] },
  },
  RET(30, ["coulisses", "sablier", "masque", "fil-ariane", "impasse", "echafaudage"], "Le Théâtre", "chaque moment critique de la partie : signal entendu, sablier retourné, masque soulevé ?", ["Les 3 lieux du Théâtre récités sans erreur, avec un exemple de partie pour chacun"]),

  // ═══ Semaine 31 — Finales de maître (l'Arsenal et le Port) ════════════════
  {
    semaine: 31, jour: 1, metaphore_id: "poudriere", theme_metaphore: "Finales de maître — la Poudrière",
    concept: "finales de dames : pions multiples",
    cours:
      "Semaine des finales de maître : on revisite l'Arsenal et le Port avec les décisions du Théâtre. En finale de dames avec plusieurs pions, le pion passé le plus avancé et la sécurité du roi décident encore. Mais il faut aussi savoir quand échanger les dames : vers une finale de pions gagnante (la Bascule), ou jamais si la finale de pions est nulle. Le Sablier est vital : en finale de dames, une seule gaffe donne un échec perpétuel ou une dame perdue en enfilade. Règle de l'étage : à chaque coup, compte les échecs adverses (Poudrière), retourne le Sablier, et évalue l'échange des dames.",
    ancrage_sensoriel:
      "Dans la poudrière, la flamme de ta lanterne vacille : chaque pas est compté, et le sablier coule dans ta poche.",
    rappels: ["poudriere", "sablier", "bascule"],
    focus_partie: "en finale de dames : échecs comptés, sablier retourné, échange des dames évalué ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire une finale de dames de la séance et marque les cases d'abri, les échecs adverses et la finale de pions possible." },
    checklist: ["Squelette désigné avant chaque solution", "Échecs adverses comptés", "Échange des dames évalué à chaque coup"],
    sourcing: { anyThemes: ["queenEndgame"], noThemes: ["mateIn1"], fallbackThemes: ["queenEndgame"] },
  },
  {
    semaine: 31, jour: 2, metaphore_id: "mortier", theme_metaphore: "Finales de maître — le Mortier",
    concept: "dame et tour : attaques en finale",
    cours:
      "Le Mortier revient en finale de maître. Avec dame et tour, le moment critique arrive souvent quand un roi s'expose pour soutenir un pion. Les Coulisses annoncent le signal (un roi qui quitte son abri), puis le Fil d'Ariane calcule l'attaque. Les motifs reviennent : tour sur la dernière rangée, dame sur la diagonale, échec double, enfilade qui gagne la dame. Règle de l'étage : en finale de dame et tour, le roi exposé est un moment critique. Calcule toujours l'attaque possible sur lui avant de prendre un pion.",
    ancrage_sensoriel:
      "Le mortier est pointé, la mèche est prête : tu entends le roi adverse sortir de son abri, un pas sur le gravier.",
    rappels: ["mortier", "coulisses", "fil-ariane"],
    focus_partie: "en finale de pièces lourdes : chaque sortie de roi traitée comme un moment critique ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de la séance, remonte à l'envers jusqu'au moment où le roi s'est exposé." },
    checklist: ["Squelette désigné avant chaque solution", "Roi exposé traité comme un moment critique", "Attaque calculée avant de prendre un pion"],
    sourcing: { anyThemes: ["queenRookEndgame"], noThemes: ["mateIn1"], fallbackThemes: ["queenRookEndgame", "queenEndgame"] },
  },
  {
    semaine: 31, jour: 3, metaphore_id: "deux-fanaux", theme_metaphore: "Finales de maître — les Deux Fanaux",
    concept: "fous de couleurs opposées : décisions",
    cours:
      "Les Deux Fanaux reviennent en finale de maître. Les décisions pratiques sont nettes. En attaque, garde les pièces lourdes (les fous opposés aident l'attaquant en milieu de jeu). Avec un pion de plus en finale, n'échange pas vers des fous opposés purs, sauf avec deux pions passés éloignés de trois colonnes. Avec un pion de moins, cherche justement cet échange. Le Masque guette : un échange qui semble simplifier peut tout annuler. Règle de l'étage : avant tout échange de pièces avec des fous opposés sur l'échiquier, nomme la finale d'arrivée et son résultat probable.",
    ancrage_sensoriel:
      "Les deux fanaux brillent dans la brume du port, et tu entends le ressac qui efface tout ce qui n'est pas éclairé.",
    rappels: ["deux-fanaux", "bascule", "masque"],
    focus_partie: "avec fous opposés : chaque échange décidé en connaissant la finale d'arrivée ?",
    reconsolidation: { type: "recitation", consigne: "Récite les décisions pratiques des fous opposés (attaque, pion de plus, pion de moins), puis classe deux puzzles de la séance." },
    checklist: ["Squelette désigné avant chaque solution", "Finale d'arrivée nommée avant l'échange", "Distance entre pions passés mesurée"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "oppositeBishops", fallbackThemes: ["bishopEndgame"] },
  },
  {
    semaine: 31, jour: 4, metaphore_id: "jetee", theme_metaphore: "Finales de maître — la Jetée et le Fanal",
    concept: "pièces mineures : finales techniques",
    cours:
      "La Jetée et le Fanal reviennent ensemble. Finales de cavaliers, de fous, cavalier contre fou : on les reconnaît désormais d'un coup d'œil, et l'on sait ce qu'il faut calculer. Le cavalier compte ses sauts, le fou pense à la couleur de ses pions et à la case de promotion des pions de bande. Le roi actif décide presque toujours. Le Sablier évite la gaffe classique : la fourchette de cavalier oubliée, ou le pion qui avance sur la couleur du fou adverse. Règle de l'étage : en finale de pièces mineures, nomme le type de finale, puis les deux questions qui la décident.",
    ancrage_sensoriel:
      "Marche sur la jetée en zigzag jusqu'au fanal, et compte les pas d'un côté, les éclats de lumière de l'autre.",
    rappels: ["jetee", "fanal", "sablier"],
    focus_partie: "en finale de pièces mineures : type de finale nommé, et ses deux questions posées ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire une finale de pièces mineures de la séance et écris sous le dessin son type et ses deux questions." },
    checklist: ["Squelette désigné avant chaque solution", "Type de finale nommé", "Fourchettes et couleurs vérifiées au sablier"],
    sourcing: { anyThemes: ["knightEndgame", "bishopEndgame"], noThemes: ["mateIn1"], fallbackThemes: ["knightEndgame", "bishopEndgame"] },
  },
  {
    semaine: 31, jour: 5, metaphore_id: "fanal", theme_metaphore: "Finales de maître — le Fanal contre la Tour",
    concept: "tour contre pièce mineure : convertir ou tenir",
    cours:
      "Le Fanal affronte la Tour. Tour contre fou ou contre cavalier, avec des pions : la Balance donne la direction. La tour gagne en créant un pion passé et en attaquant les pions isolés ; la pièce mineure tient avec des pions groupés, un roi actif et, pour le fou, la bonne couleur. À ce niveau, il faut aussi connaître les finales sans pions : tour contre fou est nulle si le roi défenseur va dans le coin de la couleur opposée à son fou, et tour contre cavalier est nulle si le cavalier reste près de son roi. Règle de l'étage : avec la pièce mineure, cherche la forteresse ; avec la tour, cherche le second pion passé.",
    ancrage_sensoriel:
      "Le faisceau du fanal balaie le quai pendant qu'une tour de pierre se dresse en face, immobile et lourde.",
    rappels: ["fanal", "balance", "ronde"],
    focus_partie: "en finale tour contre pièce : forteresse cherchée, ou second pion passé ?",
    reconsolidation: { type: "recitation", consigne: "Récite les règles de nulle tour contre fou et tour contre cavalier, puis dis lequel des deux camps jouait juste dans un puzzle de la séance." },
    checklist: ["Squelette désigné avant chaque solution", "Forteresse ou second pion passé visé", "Coin de la bonne couleur pour le défenseur"],
    sourcing: { anyThemes: ["endgame", "rookEndgame"], noThemes: ["mateIn1"], geometry: "exchangeImbalance", fallbackThemes: ["endgame"] },
  },
  {
    semaine: 31, jour: 6, metaphore_id: "tour-sentinelle", theme_metaphore: "Finales de maître — la Tour sentinelle",
    concept: "finales de tours : décisions pratiques",
    cours:
      "La Tour sentinelle revient pour les finales de tours de maître. On ne se demande plus seulement « quelle est la bonne technique ? », mais aussi « quelle décision pratique ? ». Sacrifier un pion pour activer la tour, échanger les tours vers une finale de pions, laisser le roi adverse entrer pour gagner un temps. Chacune est un moment critique (les Coulisses) qui mérite le Fil d'Ariane. Le reste se joue vite, avec les principes : activité, roi, pions passés. Règle de l'étage : en finale de tours, repère les trois ou quatre décisions de la partie et calcule-les vraiment ; joue les autres coups avec les principes.",
    ancrage_sensoriel:
      "La sentinelle s'arrête au sommet de la tour, écoute le vent changer, puis repart à grands pas sur le chemin de ronde.",
    rappels: ["tour-sentinelle", "coulisses", "fosse"],
    focus_partie: "en finale de tours : quelles étaient les trois ou quatre décisions, et les as-tu calculées ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de la séance, remonte à l'envers et marque la décision pratique qui a changé le résultat." },
    checklist: ["Squelette désigné avant chaque solution", "Décisions de la finale repérées et calculées", "Principes appliqués au reste"],
    sourcing: { anyThemes: ["rookEndgame"], noThemes: ["mateIn1"], fallbackThemes: ["rookEndgame"] },
  },
  RET(31, ["poudriere", "mortier", "deux-fanaux", "jetee", "fanal", "tour-sentinelle"], "Finales de maître", "si ta partie entre en finale : quelles décisions pratiques, et lesquelles as-tu calculées ?", ["Une finale de la semaine annotée avec ses décisions pratiques"]),

  // ═══ Semaine 32 — La Citadelle ════════════════════════════════════════════
  {
    semaine: 32, jour: 1, metaphore_id: "herse", theme_metaphore: "La Citadelle — la Herse et les Coulisses",
    concept: "attaques sur roques opposés : la décision",
    cours:
      "Retour à la Citadelle, avec les décisions du Théâtre. Avec des roques opposés, le moment critique est souvent le premier coup de pion de l'attaque. Le jouer, c'est s'engager dans la course. Le retarder, c'est laisser l'adversaire commencer. Les Coulisses disent quand : dès que les pièces sont prêtes et que le centre est stable. Le Fil d'Ariane calcule la course, l'Impasse cherche sa ressource. Règle de l'étage : avec roques opposés, décide tôt. Une attaque à moitié lancée est la pire des options, parce qu'elle affaiblit ton roi sans ouvrir le sien.",
    ancrage_sensoriel:
      "Les chaînes des deux herses sont tendues, prêtes à tomber : tu n'as qu'à lâcher la tienne, et le bruit résonne déjà en coulisses.",
    rappels: ["herse", "coulisses", "fil-ariane"],
    focus_partie: "avec roques opposés : as-tu décidé tôt, ou lancé une attaque à moitié ?",
    reconsolidation: { type: "recitation", consigne: "Pour un puzzle de la séance, dis à quel coup la décision d'attaquer se prenait, et ce qu'elle exigeait." },
    checklist: ["Squelette désigné avant chaque solution", "Décision d'attaque prise tôt", "Course calculée"],
    sourcing: { anyThemes: ["kingsideAttack", "queensideAttack"], noThemes: ["mateIn1"], geometry: "pawnStorm", fallbackThemes: ["kingsideAttack"] },
  },
  {
    semaine: 32, jour: 2, metaphore_id: "trebuchet", theme_metaphore: "La Citadelle — le Trébuchet et le Masque",
    concept: "sacrifices : distinguer le correct du spéculatif",
    cours:
      "Le Trébuchet rencontre le Masque. À ce niveau, l'adversaire sacrifie aussi, et beaucoup de sacrifices sont spéculatifs : ils marchent si l'on se défend mal. Il faut savoir les juger des deux côtés. Pour ton sacrifice : est-il calculé jusqu'au bout, ou intuitif avec au moins trois pièces qui attaquent ? Pour le sien : y a-t-il une impasse, comme rendre le matériel, refuser ou contre-attaquer ? Règle de l'étage : un sacrifice adverse n'est pas une fatalité. Avant de défendre, cherche les trois galeries de l'Impasse et le coup naturel à ne pas jouer (le Masque).",
    ancrage_sensoriel:
      "La pierre du trébuchet s'écrase devant le mur, la poussière retombe, et derrière, le mur tient encore : ce n'était qu'un masque.",
    rappels: ["trebuchet", "masque", "impasse"],
    focus_partie: "chaque sacrifice de la partie, le tien ou le sien : correct ou spéculatif ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de sacrifice, remonte à l'envers et dis s'il était calculé ou intuitif, et quelle défense l'aurait mis en échec." },
    checklist: ["Squelette désigné avant chaque solution", "Sacrifice jugé correct ou spéculatif", "Trois galeries de l'Impasse calculées"],
    sourcing: { anyThemes: ["sacrifice"], noThemes: ["mateIn1"], fallbackThemes: ["sacrifice"] },
  },
  {
    semaine: 32, jour: 3, metaphore_id: "donjon-eventre", theme_metaphore: "La Citadelle — le Donjon éventré",
    concept: "convertir une attaque en gain",
    cours:
      "Le Donjon éventré revient pour une question de maître : quand arrêter l'attaque ? Une attaque n'a pas besoin de finir par un mat. Souvent, la meilleure décision est d'échanger vers une finale gagnée (la Bascule) ou de gagner du matériel décisif dès que l'occasion se présente. Le joueur qui veut absolument mater laisse passer le moment, et l'adversaire se réorganise. Règle de l'étage : à chaque coup de l'attaque, demande s'il existe une simplification qui gagne. Si oui, compare avec le mat que tu cherches : la ligne la plus sûre l'emporte.",
    ancrage_sensoriel:
      "Dans la brèche du donjon, tu vois deux portes : l'une mène à la salle du trône, l'autre au trésor. Le trésor suffit.",
    rappels: ["donjon-eventre", "bascule", "sablier"],
    focus_partie: "dans tes attaques : as-tu vu la simplification gagnante quand elle est apparue ?",
    reconsolidation: { type: "recitation", consigne: "Pour deux puzzles de la séance, dis si la solution matait ou simplifiait, et pourquoi c'était la ligne la plus sûre." },
    checklist: ["Squelette désigné avant chaque solution", "Simplification gagnante cherchée pendant l'attaque", "Ligne la plus sûre choisie"],
    sourcing: { anyThemes: ["exposedKing", "kingsideAttack"], allThemes: ["crushing"], noThemes: ["mateIn1"], fallbackThemes: ["exposedKing"] },
  },
  {
    semaine: 32, jour: 4, metaphore_id: "chambre-close", theme_metaphore: "La Citadelle — la Chambre close",
    concept: "mats longs sous la pendule",
    cours:
      "La Chambre close revient sous la pendule. Les mats longs se trouvent en partie grâce au chunking : on reconnaît la figure finale (étouffé, arabe, Anastasie, crochet, Boden, deux fous) avant de calculer. C'est ce qui permet de voir un mat en cinq coups en une minute au lieu de dix. Règle de l'étage : dans une attaque, cherche d'abord quelle figure de mat est à portée (deux ou trois pièces déjà en place), puis calcule le chemin à rebours. Si aucune figure n'apparaît, l'attaque est peut-être positionnelle : reviens aux principes de la Citadelle.",
    ancrage_sensoriel:
      "Une à une, les figures de mat s'allument comme des tableaux dans un couloir sombre, et l'une d'elles ressemble exactement à ta position.",
    rappels: ["chambre-close", "fil-ariane", "coulisses"],
    focus_partie: "dans tes attaques : quelle figure de mat était à portée ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la figure de mat finale de trois puzzles de la séance, et nomme chacune." },
    checklist: ["Squelette désigné avant chaque solution", "Figure de mat reconnue avant le calcul", "Chemin calculé à rebours"],
    sourcing: { anyThemes: ["mateIn3", "mateIn4", "mateIn5"], noThemes: ["mateIn1", "mateIn2"], fallbackThemes: ["mateIn3"] },
  },
  {
    semaine: 32, jour: 5, metaphore_id: "belier", theme_metaphore: "La Citadelle — le Bélier",
    concept: "attaques de pions : timing",
    cours:
      "Le Bélier revient avec la question du timing. Une attaque de pions trop tôt ouvre le centre à l'adversaire. Trop tard, elle trouve un roi bien défendu. Les Coulisses donnent les signaux : le centre se ferme (moment d'attaquer à l'aile), une pièce adverse quitte la défense du roi, un crochet apparaît (h6, g6). Règle de l'étage : lance le bélier quand au moins deux signaux sont réunis, et vérifie avec le Sablier que ton propre roi n'en souffre pas. Sinon, améliore d'abord ta pièce la plus mal placée (la Girouette).",
    ancrage_sensoriel:
      "Les soldats tiennent le bélier immobile, les muscles tendus, et attendent le signal du tambour avant de charger.",
    rappels: ["belier", "coulisses", "girouette"],
    focus_partie: "avant chaque poussée de pion vers le roi adverse : combien de signaux étaient réunis ?",
    reconsolidation: { type: "recitation", consigne: "Pour un puzzle de la séance, nomme les signaux réunis avant l'attaque de pions." },
    checklist: ["Squelette désigné avant chaque solution", "Deux signaux réunis avant l'attaque", "Propre roi vérifié au sablier"],
    sourcing: { anyThemes: ["kingsideAttack"], noThemes: ["mateIn1"], geometry: "pawnStorm", fallbackThemes: ["kingsideAttack"] },
  },
  {
    semaine: 32, jour: 6, metaphore_id: "pont-levis", theme_metaphore: "La Citadelle — le Pont-levis",
    concept: "attractions et chasses au roi longues",
    cours:
      "Le Pont-levis revient pour les chasses au roi longues. On sait tracer le chemin de la chasse jusqu'au mat. Sous la pendule, on combine avec le Fil d'Ariane taillé : les échecs forcés réduisent l'arbre à quelques branches, ce qui rend la chasse calculable même longue. Le danger est l'Impasse, c'est-à-dire la case où le roi s'abrite. Règle de l'étage : dans une chasse au roi, à chaque échec, liste les cases du roi ; s'il n'en a qu'une ou deux, continue ; s'il en a trois ou plus, la chasse risque de se perdre, et il faut un coup calme pour fermer une case.",
    ancrage_sensoriel:
      "Le roi traverse le pont-levis en courant, et à chaque planche, une torche s'allume devant lui et lui barre le chemin.",
    rappels: ["pont-levis", "fil-ariane", "trempe"],
    focus_partie: "dans les chasses au roi : as-tu compté les cases du roi à chaque échec ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire le parcours du roi chassé dans un puzzle de la séance, avec à chaque case le nombre de fuites." },
    checklist: ["Squelette désigné avant chaque solution", "Cases du roi comptées à chaque échec", "Coup calme cherché si trois fuites"],
    sourcing: { anyThemes: ["attraction", "exposedKing"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["attraction"] },
  },
  RET(32, ["herse", "trebuchet", "donjon-eventre", "chambre-close", "belier", "pont-levis"], "La Citadelle", "chaque attaque de la partie : décision prise au bon moment, et simplification vue ?", ["Une attaque de la semaine annotée avec ses décisions"]),

  // ═══ Semaine 33 — La Bibliothèque ═════════════════════════════════════════
  {
    semaine: 33, jour: 1, metaphore_id: "sape", theme_metaphore: "La Bibliothèque — la Sape",
    concept: "structures : choisir le plan sous la pendule",
    cours:
      "Retour à la Bibliothèque, avec les décisions du Théâtre. Une structure connue (Carlsbad, pion isolé, pions pendants, chaînes) propose toujours deux plans. Le moment critique est le choix entre les deux, souvent au sortir de l'ouverture. Ensuite, on joue vite. Le joueur fort ne change pas de plan à chaque coup : il choisit, puis il exécute. Règle de l'étage : au sortir de l'ouverture, ouvre le bon volume, choisis l'un des deux plans en fonction des pièces (Lunette), et note ce choix. Tu ne le remettras en cause que si un signal de Coulisses apparaît.",
    ancrage_sensoriel:
      "Tu prends le volume de la structure sur l'étagère, tu l'ouvres sur un chapitre, et tu refermes le livre : la décision est prise.",
    rappels: ["sape", "lunette", "coulisses"],
    focus_partie: "au sortir de l'ouverture : quel plan as-tu choisi, et l'as-tu tenu ?",
    reconsolidation: { type: "recitation", consigne: "Pour deux puzzles de la séance, nomme la structure, ses deux plans, et celui qui était juste ici." },
    checklist: ["Squelette désigné avant chaque solution", "Plan choisi entre deux", "Plan tenu sauf signal critique"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "minorityStructure", fallbackThemes: ["middlegame"] },
  },
  {
    semaine: 33, jour: 2, metaphore_id: "phare", theme_metaphore: "La Bibliothèque — le Phare",
    concept: "pion isolé : décider de la poussée",
    cours:
      "Le Phare revient avec sa décision la plus importante : la poussée d5 (ou ...d4). Elle se joue au bon moment, ou jamais. Trop tôt, elle échange tout et laisse une finale égale ; trop tard, l'adversaire a bloqué. Les Coulisses donnent le signal : les pièces sont toutes actives, la case de poussée est contrôlée au moins autant que défendue, et une tactique (la Forge) suit l'ouverture du centre. Règle de l'étage : avec le pion isolé, la poussée est le moment critique de la partie. Calcule-la vraiment, avec le Fil d'Ariane, chaque fois qu'elle devient possible.",
    ancrage_sensoriel:
      "Le phare s'allume d'un coup, plein feu, et la lumière balaie tout le port : c'est maintenant ou jamais.",
    rappels: ["phare", "coulisses", "fil-ariane"],
    focus_partie: "avec ou contre le pion isolé : la poussée a-t-elle été calculée à chaque fois qu'elle devenait possible ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de pion isolé, remonte à l'envers jusqu'à la poussée et compte les contrôles de la case à ce moment." },
    checklist: ["Squelette désigné avant chaque solution", "Poussée calculée quand elle devient possible", "Contrôles de la case comptés"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "isolatedPawn", fallbackThemes: ["middlegame"] },
  },
  {
    semaine: 33, jour: 3, metaphore_id: "pont-suspendu", theme_metaphore: "La Bibliothèque — le Pont suspendu",
    concept: "pions pendants : tenir ou pousser",
    cours:
      "Le Pont suspendu revient avec la même question de décision : tenir les pions pendants côte à côte, ou pousser l'un d'eux ? Pousser crée un pion passé ou une tactique, mais laisse un pion arriéré et une case faible derrière lui. Tenir garde le centre, mais les pièces se fatiguent à défendre. Les Coulisses : si l'adversaire vient de placer une tour face aux pions, c'est souvent le moment de pousser ; si ses pièces sont loin, tiens. Règle de l'étage : avec les pions pendants, chaque coup adverse sur la colonne c ou d est un signal pour recalculer la poussée.",
    ancrage_sensoriel:
      "Sur le pont suspendu, le vent se lève : tu dois choisir entre t'accrocher aux câbles ou courir vers l'autre rive.",
    rappels: ["pont-suspendu", "coulisses", "masque"],
    focus_partie: "avec les pions pendants : à chaque coup adverse sur leurs colonnes, la poussée a-t-elle été recalculée ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire la position d'un puzzle de pions pendants et marque le signal qui déclenchait la poussée." },
    checklist: ["Squelette désigné avant chaque solution", "Poussée recalculée à chaque signal", "Case faible après la poussée évaluée"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "hangingPawns", fallbackThemes: ["middlegame"] },
  },
  {
    semaine: 33, jour: 4, metaphore_id: "registre", theme_metaphore: "La Bibliothèque — le Registre",
    concept: "espace : quand ouvrir",
    cours:
      "Le Registre revient pour la décision d'ouvrir. L'avantage d'espace se convertit par une ouverture au bon moment : après avoir créé une seconde faiblesse, et quand l'adversaire n'a plus de place pour regrouper. Ouvrir trop tôt libère ses pièces, ouvrir trop tard lui laisse le temps de préparer sa rupture. Règle de l'étage : avec l'espace, l'ouverture est le moment critique. Prépare-la (deuxième faiblesse, pièces en place), puis calcule-la avec le Fil d'Ariane. Contre l'espace, guette le moment où l'adversaire ouvre, puis cherche le Masque : son ouverture est peut-être prématurée.",
    ancrage_sensoriel:
      "Le registre est presque plein : tu tiens la plume au-dessus de la dernière case libre, et tu attends le bon moment pour la rayer.",
    rappels: ["registre", "coulisses", "fil-ariane"],
    focus_partie: "avec ou contre l'espace : quand l'ouverture a-t-elle eu lieu, et était-elle préparée ?",
    reconsolidation: { type: "recitation", consigne: "Pour un puzzle de la séance, récite les deux conditions de l'ouverture et dis si elles étaient réunies." },
    checklist: ["Squelette désigné avant chaque solution", "Deuxième faiblesse créée avant d'ouvrir", "Ouverture calculée"],
    sourcing: { anyThemes: ["advancedPawn", "quietMove"], noThemes: ["mateIn1", "opening"], geometry: "pawnChain", fallbackThemes: ["advancedPawn"] },
  },
  {
    semaine: 33, jour: 5, metaphore_id: "ecluse", theme_metaphore: "La Bibliothèque — l'Écluse",
    concept: "blocus : la patience",
    cours:
      "L'Écluse revient avec une leçon de patience. Le joueur qui bloque un pion passé a souvent une position solide mais passive, et la tentation est de « faire quelque chose ». C'est le Masque : la sortie active ouvre l'écluse. Le bon plan est de garder le bloqueur, d'améliorer les autres pièces (la Girouette) et d'attendre que l'adversaire se découvre en cherchant à briser le blocus. Règle de l'étage : en position de blocus solide, ne change pas la structure sans raison. Améliore, attends, et retourne le Sablier pour chaque coup adverse qui menace le bloqueur.",
    ancrage_sensoriel:
      "Assis sur la poutre de l'écluse, tu sens l'eau pousser en continu, mais la porte ne bouge pas tant que tu restes assis.",
    rappels: ["ecluse", "masque", "girouette"],
    focus_partie: "en position de blocus : as-tu résisté à la tentation de « faire quelque chose » ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de blocus, remonte à l'envers et identifie le coup qui aurait ouvert l'écluse par impatience." },
    checklist: ["Squelette désigné avant chaque solution", "Bloqueur gardé", "Autres pièces améliorées pendant le blocus"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "blockade", fallbackThemes: ["advancedPawn"] },
  },
  {
    semaine: 33, jour: 6, metaphore_id: "balance", theme_metaphore: "La Bibliothèque — la Balance",
    concept: "déséquilibres : jouer selon ses pièces",
    cours:
      "La Balance revient avec une règle pratique de maître : joue la partie qui convient à tes pièces. Avec la qualité de plus, ouvre la position et échange les pièces mineures. Avec la pièce contre la qualité, ferme et crée des avant-postes. Avec dame contre deux tours, cherche les rois exposés et les pions faibles. Avec deux tours contre dame, coordonne et vise un point fixe. Dans ces positions, l'erreur typique n'est pas un mauvais calcul, mais un plan qui ne correspond pas aux pièces. Règle de l'étage : à chaque déséquilibre, nomme la position idéale pour tes pièces, et dirige la partie vers elle.",
    ancrage_sensoriel:
      "La balance oscille, puis penche lentement de ton côté au fur et à mesure que la position change de forme.",
    rappels: ["balance", "trebuchet", "lunette"],
    focus_partie: "si un déséquilibre est apparu : as-tu dirigé la partie vers la position idéale de tes pièces ?",
    reconsolidation: { type: "recitation", consigne: "Récite la position idéale de chaque déséquilibre (qualité, pièce, dame, deux tours), puis classe deux puzzles de la séance." },
    checklist: ["Squelette désigné avant chaque solution", "Position idéale de mes pièces nommée", "Plan dirigé vers elle"],
    sourcing: { anyThemes: [], noThemes: ["opening", "mateIn1"], geometry: "exchangeImbalance", fallbackThemes: ["advantage"] },
  },
  RET(33, ["sape", "phare", "pont-suspendu", "registre", "ecluse", "balance"], "La Bibliothèque", "la structure de la partie : plan choisi, tenu, et moment critique repéré ?", ["Chaque partie de la semaine résumée en une phrase : structure, plan, moment critique"]),

  // ═══ Semaine 34 — Le Labyrinthe et la Forge ═══════════════════════════════
  {
    semaine: 34, jour: 1, metaphore_id: "fil-ariane", theme_metaphore: "Le Labyrinthe — le Fil d'Ariane",
    concept: "calcul long : profondeur et exactitude",
    cours:
      "Retour au Labyrinthe pour la dernière série de calcul. Les puzzles du jour sont les plus profonds du programme. On applique le protocole entier, sans raccourci : candidats, galeries une à une, Soufflet à chaque reprise, Trempe au fond, Lunette pour évaluer, Impasse pour réfuter, Sablier avant de jouer. L'objectif de cette semaine n'est pas la vitesse, c'est l'exactitude : un calcul juste à 2400 est un calcul où l'on n'a rien oublié. Règle de l'étage : à la fin de chaque puzzle, liste ce que tu as vérifié. Si un élément du protocole manque, rejoue le puzzle de mémoire en le faisant.",
    ancrage_sensoriel:
      "Au cœur du labyrinthe, déroule tout le fil jusqu'au bout, puis rembobine-le lentement, en touchant chaque mur au passage.",
    rappels: ["fil-ariane", "impasse", "sablier"],
    focus_partie: "dans ta position la plus critique : quels éléments du protocole as-tu appliqués ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Pour le puzzle le plus profond, dessine l'arbre complet avec chaque élément du protocole vérifié." },
    checklist: ["Squelette désigné avant chaque solution", "Protocole entier appliqué", "Éléments vérifiés listés après chaque puzzle"],
    sourcing: { anyThemes: ["veryLong", "long"], noThemes: ["opening", "mateIn1", "mateIn2"], fallbackThemes: ["long"] },
  },
  {
    semaine: 34, jour: 2, metaphore_id: "enclume", theme_metaphore: "La Forge — l'Enclume",
    concept: "coups forcés : les deux camps à chaque pli",
    cours:
      "L'Enclume revient, à la racine de tout calcul. À ce niveau, la règle est simple et absolue : à chaque pli de chaque variante, échecs, prises et menaces pour les DEUX camps. Une erreur de calcul fréquente, même à haut niveau : un coup forcé de l'adversaire oublié au fond d'une variante. Le Sablier est l'Enclume du dernier coup ; l'Enclume est le Sablier de chaque pli. Règle de l'étage : pas de nouveau principe, mais un entraînement à la rigueur. Pour chaque puzzle, dis à voix haute les coups forcés des deux camps au premier et au dernier pli.",
    ancrage_sensoriel:
      "Le marteau frappe l'enclume six fois à chaque pli, trois pour toi, trois pour l'adversaire, d'un rythme régulier et sûr.",
    rappels: ["enclume", "sablier", "fil-ariane"],
    focus_partie: "dans tes calculs : coups forcés des deux camps vérifiés au premier et au dernier pli ?",
    reconsolidation: { type: "recitation", consigne: "Pour deux puzzles de la séance, récite les coups forcés des deux camps au premier et au dernier pli." },
    checklist: ["Squelette désigné avant chaque solution", "Coups forcés des deux camps à chaque pli", "Premier et dernier pli vérifiés à voix haute"],
    sourcing: { anyThemes: ["long", "crushing"], noThemes: ["opening", "mateIn1", "mateIn2"], fallbackThemes: ["long"] },
  },
  {
    semaine: 34, jour: 3, metaphore_id: "soufflet", theme_metaphore: "La Forge — le Soufflet",
    concept: "coups intermédiaires : les deux camps",
    cours:
      "Le Soufflet revient : à ce niveau, les coups intermédiaires décident d'innombrables parties. On les cherche pour soi ; on les craint pour l'adversaire. Dans chaque séquence d'échanges, chaque reprise est un carrefour, et le joueur fort le sent avant même de calculer. Le Masque y est souvent caché : la reprise naturelle perd parce que l'adversaire a un coup intermédiaire. Règle de l'étage : avant toute reprise, la question du Soufflet. Avant toute combinaison, la question du Soufflet adverse.",
    ancrage_sensoriel:
      "Entre chaque coup de marteau, le soufflet ronfle, et derrière toi, un autre soufflet répond, celui de l'adversaire.",
    rappels: ["soufflet", "masque", "enclume"],
    focus_partie: "chaque reprise de la partie : as-tu posé la question du Soufflet, pour les deux camps ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de la séance, remonte à l'envers et marque chaque reprise où un coup intermédiaire existait." },
    checklist: ["Squelette désigné avant chaque solution", "Question du Soufflet posée à chaque reprise", "Soufflet adverse vérifié avant la combinaison"],
    sourcing: { anyThemes: ["intermezzo"], noThemes: ["mateIn1"], fallbackThemes: ["intermezzo"] },
  },
  {
    semaine: 34, jour: 4, metaphore_id: "trempe", theme_metaphore: "La Forge — la Trempe",
    concept: "coups tranquilles décisifs",
    cours:
      "La Trempe revient. Les coups tranquilles sont la signature des joueurs forts : ils trouvent le coup calme qui rend tout imparable, là où d'autres cherchent encore un échec. On le cherche à trois endroits : au premier coup quand rien n'est forcé, au milieu d'une combinaison quand les échecs s'épuisent, au fond d'une variante avant d'évaluer. Règle de l'étage : à ces trois endroits, une question systématique : « quel coup ne menace rien de visible, mais laisse l'adversaire sans bon coup ? »",
    ancrage_sensoriel:
      "Le silence de la trempe, trois fois dans la séance : au début, au milieu, à la fin, chaque fois que le métal change de nature.",
    rappels: ["trempe", "porte-tournante", "cage"],
    focus_partie: "aux trois endroits (début, milieu, fond de variante) : as-tu cherché le coup calme ?",
    reconsolidation: { type: "recitation", consigne: "Pour deux puzzles de la séance, dis à quel des trois endroits apparaissait le coup tranquille." },
    checklist: ["Squelette désigné avant chaque solution", "Coup calme cherché aux trois endroits", "Zugzwang envisagé"],
    sourcing: { anyThemes: ["quietMove"], noThemes: ["mateIn1"], fallbackThemes: ["quietMove"] },
  },
  {
    semaine: 34, jour: 5, metaphore_id: "ramonage", theme_metaphore: "La Forge — le Ramonage",
    concept: "dégagements et lignes",
    cours:
      "Le Ramonage revient avec la Vanne. Lignes dégagées, lignes coupées, lignes rouvertes : dans les combinaisons de maître, on suit les lignes plutôt que les pièces. Les sacrifices de dégagement sont parmi les plus difficiles à voir, parce qu'ils donnent une pièce qui semble utile. La question qui les révèle : « si cette pièce n'était pas là, que pourrait faire la pièce de derrière ? » Règle de l'étage : dans chaque position tactique, imagine tes pièces une à une retirées de l'échiquier. Si l'une d'elles gêne, cherche comment la faire partir avec tempo.",
    ancrage_sensoriel:
      "Tu retires une à une les pierres qui bouchent la cheminée, et à la dernière, le feu rugit d'un coup.",
    rappels: ["ramonage", "vanne", "canon"],
    focus_partie: "dans tes positions tactiques : as-tu imaginé tes pièces retirées une à une ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Dessine de mémoire un puzzle de dégagement, avec la pièce qui gênait et la ligne libérée." },
    checklist: ["Squelette désigné avant chaque solution", "Pièces imaginées retirées une à une", "Dégagement avec tempo cherché"],
    sourcing: { anyThemes: ["clearance", "interference"], noThemes: ["mateIn1"], fallbackThemes: ["clearance"] },
  },
  {
    semaine: 34, jour: 6, metaphore_id: "vanne", theme_metaphore: "La Forge — la Vanne",
    concept: "interceptions et combinaisons de maître",
    cours:
      "Dernier jour de la Forge. La Vanne clôt la série : interceptions offensives et défensives, souvent sous forme de sacrifice. Les combinaisons du jour mélangent tous les motifs de la Forge et de l'Atelier. Le but est de nommer chaque motif en un mot, de retenir la combinaison comme trois blocs, et de la retrouver plus tard dans une autre partie. C'est le chunking, le principe de tout le programme : reconnaître vite ce qu'on a déjà rangé dans le palais, pour garder le calcul pour ce qui est neuf.",
    ancrage_sensoriel:
      "Toutes les vannes du canal se lèvent et s'abaissent à la suite, et l'eau trace dans la Forge un chemin que tu connais déjà.",
    rappels: ["vanne", "pilier-surcharge", "carrefour"],
    focus_partie: "après chaque combinaison de ta partie : pouvais-tu la nommer en trois blocs ?",
    reconsolidation: { type: "recitation", consigne: "Pour trois puzzles de la séance, récite la combinaison en trois blocs et le lieu du palais de chacun." },
    checklist: ["Squelette désigné avant chaque solution", "Combinaison nommée en trois blocs", "Lieu du palais associé à chaque bloc"],
    sourcing: { anyThemes: ["interference", "deflection", "sacrifice"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["interference", "long"] },
  },
  RET(34, ["fil-ariane", "enclume", "soufflet", "trempe", "ramonage", "vanne"], "Le Labyrinthe et la Forge", "dans le moment le plus critique de la partie : protocole entier appliqué ?", ["Une variante de la semaine écrite avec le protocole complet"]),

  // ═══ Semaine 35 — Le Bastion ══════════════════════════════════════════════
  {
    semaine: 35, jour: 1, metaphore_id: "poterne", theme_metaphore: "Le Bastion — la Poterne",
    concept: "défense exacte sous pression",
    cours:
      "Retour au Bastion pour la dernière semaine de défense. Beaucoup de parties se décident sur une erreur défensive, et se sauvent par une défense exacte. Le protocole : arbre des menaces adverses, défenses listées (fuir, interposer, prendre, contre-menacer), classement par menaces neutralisées, Sablier. Le défenseur fort ne panique pas : il sait que sa position a une poterne, et il la cherche avec méthode. Règle de l'étage : en défense, la question n'est jamais « suis-je perdu ? », mais « quelle est la meilleure défense, et où mène-t-elle ? ».",
    ancrage_sensoriel:
      "Le bastion tremble sous les coups, mais tu marches calmement vers la poterne, une lanterne à la main.",
    rappels: ["poterne", "sablier", "fil-ariane"],
    focus_partie: "dans les moments de défense : as-tu cherché la meilleure défense avec méthode ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour le puzzle défensif le plus difficile, remonte à l'envers et nomme à chaque coup la défense choisie et celle qui échouait." },
    checklist: ["Squelette désigné avant chaque solution", "Arbre des menaces dessiné", "Meilleure défense choisie avec méthode"],
    sourcing: { anyThemes: ["defensiveMove"], noThemes: ["mateIn1"], fallbackThemes: ["defensiveMove"] },
  },
  {
    semaine: 35, jour: 2, metaphore_id: "ronde", theme_metaphore: "Le Bastion — la Ronde",
    concept: "sauver les positions difficiles",
    cours:
      "La Ronde revient. Sauver une position difficile vaut un demi-point, exactement autant qu'en gagner un dans une position égale. Les ressources : échec perpétuel, pat, forteresse, course de pions nulle, finale de fous opposés. Le Masque aide aussi : dans une position perdue, un piège tendu peut renverser la partie, à condition que le coup reste bon même si l'adversaire voit le piège. Règle de l'étage : dans une position perdue, vise une position de nulle précise, et cherche en chemin le coup qui tend un piège sans rien perdre de plus.",
    ancrage_sensoriel:
      "Sur le chemin de ronde, les pas du guetteur continuent sans fin, et l'ennemi au pied du mur commence à douter.",
    rappels: ["ronde", "masque", "deux-fanaux"],
    focus_partie: "dans une position difficile : quelle position de nulle visais-tu, et quel piège as-tu tendu ?",
    reconsolidation: { type: "recitation", consigne: "Pour deux puzzles de nulle, nomme la ressource et le chemin vers la nulle." },
    checklist: ["Squelette désigné avant chaque solution", "Position de nulle visée", "Piège tendu sans perte supplémentaire"],
    sourcing: { anyThemes: ["equality"], noThemes: ["mateIn1"], fallbackThemes: ["equality", "defensiveMove"] },
  },
  {
    semaine: 35, jour: 3, metaphore_id: "contre-mine", theme_metaphore: "Le Bastion — la Contre-mine",
    concept: "contre-attaque et initiative",
    cours:
      "La Contre-mine revient. La meilleure défense est souvent une contre-attaque, à condition qu'elle arrive à temps. Le calcul en course (Fil d'Ariane pour les deux attaques) et le Sablier (son meilleur échec après mon coup) décident. Les signaux de Coulisses aident : si l'adversaire a lancé ses pions sur ton roi, son centre et son propre roi sont souvent affaiblis. Règle de l'étage : face à une attaque, cherche toujours la contre-mine avant la défense passive. Si elle perd la course d'un temps, défends d'un coup, puis contre-attaque.",
    ancrage_sensoriel:
      "Dans la galerie de contre-mine, tu entends les pioches de l'ennemi tout près, de l'autre côté de la paroi, et tu creuses plus vite.",
    rappels: ["contre-mine", "herse", "sablier"],
    focus_partie: "face aux attaques : as-tu cherché la contre-mine avant la défense passive ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de contre-attaque, remonte à l'envers les deux attaques en comptant les temps." },
    checklist: ["Squelette désigné avant chaque solution", "Contre-mine cherchée avant la défense passive", "Course des deux attaques calculée"],
    sourcing: { anyThemes: ["intermezzo", "defensiveMove"], noThemes: ["mateIn1", "mateIn2"], fallbackThemes: ["defensiveMove"] },
  },
  {
    semaine: 35, jour: 4, metaphore_id: "impasse", theme_metaphore: "Le Bastion — l'Impasse",
    concept: "réfuter les combinaisons adverses",
    cours:
      "L'Impasse revient au Bastion. Face à un sacrifice ou une combinaison adverse, trois galeries : prendre et défendre, prendre et rendre, refuser et contre-attaquer. À ce niveau, il faut aussi chercher l'impasse dans la combinaison de l'adversaire elle-même : un coup intermédiaire défensif, une interposition, une contre-menace au bon moment. Règle de l'étage : face à une combinaison, calcule-la comme si c'était la tienne, avec le protocole entier, puis cherche à chaque coup la réponse qui casse la chaîne.",
    ancrage_sensoriel:
      "L'ennemi avance dans la galerie avec confiance, et toi tu sais où le mur l'attend, quelques pas plus loin.",
    rappels: ["impasse", "soufflet", "vanne"],
    focus_partie: "face aux combinaisons adverses : as-tu cherché la réponse qui casse la chaîne ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Pour un puzzle de la séance, dessine la combinaison adverse et marque le coup qui la cassait." },
    checklist: ["Squelette désigné avant chaque solution", "Trois galeries calculées face au sacrifice", "Réponse qui casse la chaîne trouvée"],
    sourcing: { anyThemes: ["defensiveMove", "equality", "intermezzo"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["defensiveMove"] },
  },
  {
    semaine: 35, jour: 5, metaphore_id: "masque", theme_metaphore: "Le Bastion — le Masque",
    concept: "éviter les pièges dans les positions gagnantes",
    cours:
      "Le Masque revient au Bastion, mais à l'envers : c'est quand tu gagnes qu'il est le plus dangereux. Dans une position gagnante, l'adversaire n'a plus rien à perdre : il tend des pièges, laisse des pièces en prise, cherche le pat ou le perpétuel. Le joueur qui gagne se relâche et prend le cadeau. Règle de l'étage : dans une position gagnante, chaque coup adverse étrange est un masque. Retourne le Sablier deux fois, et préfère toujours la ligne la plus simple, même si elle gagne plus lentement.",
    ancrage_sensoriel:
      "La pièce est presque finie, le public applaudit déjà, et un acteur s'avance vers toi avec un masque souriant.",
    rappels: ["masque", "sablier", "ronde"],
    focus_partie: "en position gagnante : chaque coup étrange adverse traité comme un masque ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour un puzzle de la séance, remonte à l'envers et identifie le piège que tendait l'adversaire." },
    checklist: ["Squelette désigné avant chaque solution", "Coups étranges adverses traités comme des masques", "Ligne la plus simple préférée"],
    sourcing: { anyThemes: ["defensiveMove", "quietMove"], noThemes: ["mateIn1"], fallbackThemes: ["defensiveMove"] },
  },
  {
    semaine: 35, jour: 6, metaphore_id: "sablier", theme_metaphore: "Le Bastion — le Sablier",
    concept: "la vérification, réflexe de maître",
    cours:
      "Le Sablier clôt la semaine de défense. Les trois questions (sa menace ? ce que mon coup laisse ? son meilleur coup forcé après ?) doivent devenir un réflexe, comme regarder des deux côtés avant de traverser. Les puzzles du jour cachent tous un piège dans la réponse naturelle : seuls ceux qui retournent le sablier les trouvent. Règle de l'étage : aucune exception. Même dans une position évidente, même avec peu de temps, les trois questions passent. Dix secondes par coup : c'est le prix d'une partie sans gaffe.",
    ancrage_sensoriel:
      "Le sablier se retourne tout seul dans ta main avant chaque coup, et le sable coule sans un bruit.",
    rappels: ["sablier", "enclume", "pierre-descellee"],
    focus_partie: "ta partie entière : combien de coups sans sablier ?",
    reconsolidation: { type: "recitation", consigne: "Récite les trois questions du sablier et applique-les à chaque puzzle de la séance reconstruit de mémoire." },
    checklist: ["Squelette désigné avant chaque solution", "Trois questions posées à chaque coup", "Zéro coup sans sablier dans ma partie"],
    sourcing: { anyThemes: ["hangingPiece", "defensiveMove", "intermezzo"], noThemes: ["mateIn1"], fallbackThemes: ["defensiveMove"] },
  },
  RET(35, ["poterne", "ronde", "contre-mine", "impasse", "masque", "sablier"], "Le Bastion", "chaque moment de défense et chaque position gagnante : masque soulevé, sablier retourné ?", ["Une défense de la semaine écrite avec son but et ses pièges évités"]),

  // ═══ Semaine 36 — Le Tour final de la Cité (bilan du programme) ═══════════
  {
    semaine: 36, jour: 1, metaphore_id: "coulisses", theme_metaphore: "Le Tour final — les Coulisses",
    concept: "synthèse : moments critiques",
    cours:
      "Dernière semaine du programme : le Tour final de la Cité. Aucun lieu neuf, aucun étage neuf. Chaque jour, une question de compétition et les lieux qui y répondent. Aujourd'hui : quand faut-il réfléchir ? Les puzzles du jour sont tous des moments critiques. Pour chacun, nomme le signal (échange, rupture, roi qui bouge, pièce qui approche, simplification), puis applique le protocole du Labyrinthe. Le but de ce dernier tour : que chaque lieu du palais soit relié à une décision de partie réelle.",
    ancrage_sensoriel:
      "En coulisses, une dernière fois, tous les décors de la Cité défilent derrière le rideau : la Cathédrale, les Remparts, la Citadelle, le Port.",
    rappels: ["coulisses", "fil-ariane", "lunette"],
    focus_partie: "chaque moment critique de la partie, nommé avec son signal et son lieu du palais.",
    reconsolidation: { type: "recitation", consigne: "Récite les cinq signaux du moment critique et, pour chacun, un lieu du palais qui y répond." },
    checklist: ["Squelette désigné avant chaque solution", "Signal nommé à chaque puzzle", "Protocole du Labyrinthe appliqué"],
    sourcing: { anyThemes: ["crushing", "advantage"], allThemes: ["long"], noThemes: ["mateIn1", "mateIn2", "opening"], fallbackThemes: ["long"] },
  },
  {
    semaine: 36, jour: 2, metaphore_id: "sablier", theme_metaphore: "Le Tour final — le Sablier",
    concept: "synthèse : vérification et pièges",
    cours:
      "Deuxième jour du Tour final : la vérification. Les puzzles du jour mélangent pièges à éviter (le Masque), coups adverses forcés oubliés (l'Enclume) et pièces laissées sans défense (la Pierre descellée, le tout premier lieu du programme). Le Sablier relie tout : trois questions, dix secondes. Le programme se termine là où il a commencé, à la Cathédrale, avec la pierre descellée. À tous les niveaux, des parties se perdent par une pièce oubliée ; ce qui protège, c'est le réflexe de vérifier.",
    ancrage_sensoriel:
      "Retourne à la Cathédrale, lève les yeux vers la voûte : la pierre descellée est toujours là, et le sablier coule dans ta main.",
    rappels: ["sablier", "masque", "pierre-descellee"],
    focus_partie: "ta partie entière : sablier retourné à chaque coup ?",
    reconsolidation: { type: "reconstruction_inverse", consigne: "Pour deux puzzles de la séance, remonte à l'envers et nomme le piège ou la pièce non défendue au cœur de la solution." },
    checklist: ["Squelette désigné avant chaque solution", "Trois questions du sablier à chaque coup", "Pièces non défendues scannées"],
    sourcing: { anyThemes: ["hangingPiece", "defensiveMove", "quietMove"], noThemes: ["mateIn1"], fallbackThemes: ["defensiveMove"] },
  },
  {
    semaine: 36, jour: 3, metaphore_id: "masque", theme_metaphore: "Le Tour final — le Masque",
    concept: "synthèse : coups naturels et coups justes",
    cours:
      "Troisième jour : le coup naturel et le coup juste. Les puzzles du jour ont tous une réponse naturelle qui perd ou rate le gain : la reprise automatique (le Soufflet), l'échec qui chasse le roi vers l'abri (le Pont-levis), la prise qui ouvre une ligne vers ton roi (la Crypte). Pour chacun, cherche d'abord ce que l'adversaire espère que tu joues, puis le coup qui le déçoit. C'est la dernière leçon du Théâtre : à haut niveau, l'adversaire aussi pense, et ses coups étranges ont une raison.",
    ancrage_sensoriel:
      "Sur la scène vide, tous les masques de la réserve sont alignés, et chacun cache une expression que tu connais.",
    rappels: ["masque", "soufflet", "impasse"],
    focus_partie: "chaque coup étrange de l'adversaire : quelle raison avait-il ?",
    reconsolidation: { type: "recitation", consigne: "Pour deux puzzles de la séance, nomme le coup naturel, ce qu'il perdait, et le coup juste." },
    checklist: ["Squelette désigné avant chaque solution", "Coup naturel vérifié", "Raison des coups adverses étranges cherchée"],
    sourcing: { anyThemes: ["quietMove", "intermezzo", "defensiveMove"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["quietMove"] },
  },
  {
    semaine: 36, jour: 4, metaphore_id: "bascule", theme_metaphore: "Le Tour final — la Bascule",
    concept: "synthèse : transitions et finales",
    cours:
      "Quatrième jour : la Bascule et toutes les finales. Les puzzles du jour commencent par une décision de simplification et finissent dans une finale du Port, de l'Arsenal ou du Jardin. C'est la synthèse des quartiers des finales : évaluer la finale d'arrivée, nommer sa technique, calculer les lignes critiques (promotions, échecs), appliquer les principes au reste. Le joueur qui sait convertir ses avantages en finale gagne des points que d'autres laissent filer en nulles.",
    ancrage_sensoriel:
      "La bascule s'incline une dernière fois, et tu traverses sans t'arrêter le Port, l'Arsenal et le Jardin, en reconnaissant chaque salle.",
    rappels: ["bascule", "tour-sentinelle", "jetee", "poudriere", "roi-jardinier"],
    focus_partie: "chaque simplification de la partie : finale d'arrivée évaluée, technique nommée ?",
    reconsolidation: { type: "dessin_memoire", consigne: "Pour deux puzzles de la séance, dessine de mémoire la finale d'arrivée et note sa technique." },
    checklist: ["Squelette désigné avant chaque solution", "Finale d'arrivée évaluée", "Technique de la finale nommée"],
    sourcing: { anyThemes: ["endgame"], allThemes: ["long"], noThemes: ["mateIn1"], fallbackThemes: ["endgame"] },
  },
  {
    semaine: 36, jour: 5, metaphore_id: "lunette", theme_metaphore: "Le Tour final — la Lunette",
    concept: "synthèse : évaluer et planifier",
    cours:
      "Cinquième jour : l'Observatoire et la Bibliothèque. Les puzzles du jour commencent dans des positions calmes, où le bon coup sort d'un plan. Le protocole : la Lunette (six cercles), le bon volume de la Bibliothèque (structure et deux plans), la Girouette (pièce mal placée), l'Échafaudage (plan adverse), puis le calcul. C'est la synthèse de la stratégie : on choisit un plan, on le tient, et l'on ne calcule que là où les Coulisses l'exigent.",
    ancrage_sensoriel:
      "Une dernière fois, colle ton œil à la lunette : toute la Cité est là, chaque quartier à sa place, éclairé.",
    rappels: ["lunette", "girouette", "echafaudage", "registre", "sape"],
    focus_partie: "après l'ouverture : protocole de l'Observatoire suivi, plan choisi et tenu ?",
    reconsolidation: { type: "recitation", consigne: "Récite le protocole stratégique complet, puis applique-le à deux puzzles de la séance reconstruits de mémoire." },
    checklist: ["Squelette désigné avant chaque solution", "Protocole stratégique suivi", "Plan tenu sauf signal critique"],
    sourcing: { anyThemes: ["quietMove", "advantage"], allThemes: ["middlegame"], noThemes: ["mateIn1", "mateIn2", "opening"], fallbackThemes: ["quietMove"] },
  },
  {
    semaine: 36, jour: 6, metaphore_id: "girouette", theme_metaphore: "Le Tour final — la Cité entière",
    concept: "synthèse : la Cité entière",
    cours:
      "Dernier jour de concept du programme. Les puzzles du jour viennent de tous les quartiers, sans étiquette. Pour chacun : quel quartier, quel lieu, quel squelette, quelle solution. C'est le test du palais : si tu reconnais le lieu avant de calculer, le chunking a fonctionné. Demain, le bilan final : test de rétention et réussite de la semaine. Le programme se termine, mais le palais reste. Chaque partie que tu joueras désormais est une visite de la Cité.",
    ancrage_sensoriel:
      "Fais le tour de la Cité à pied, de la Cathédrale au Théâtre, et sens sous tes pas les pavés de chaque quartier, tous différents.",
    rappels: ["girouette", "enclume", "trebuchet", "ecluse", "coulisses"],
    focus_partie: "chaque position importante de la partie : quel lieu du palais as-tu reconnu avant de calculer ?",
    reconsolidation: { type: "recitation", consigne: "Pour chaque puzzle de la séance, nomme le quartier et le lieu du palais, puis le squelette, de mémoire." },
    checklist: ["Squelette désigné avant chaque solution", "Lieu reconnu avant le calcul", "Quartier nommé à chaque puzzle"],
    sourcing: { anyThemes: ["long", "crushing"], noThemes: ["opening", "mateIn1", "mateIn2"], fallbackThemes: ["long"] },
  },
  RET(36, ["coulisses", "sablier", "masque", "bascule", "lunette", "girouette"], "Le Tour final de la Cité", "chaque lieu du palais rencontré dans la partie : c'est le bilan du programme.", ["Bilan écrit du programme : les dix lieux les plus utiles en partie, et les cinq à revisiter"], { phase: 5, suivante: null }),
];

/** Aucune position construite en phase 5 : tout vient du dump Lichess, vérifié par Stockfish. */
export const PHASE_5_CONSTRUCTED: readonly ConstructedPosition[] = [];
