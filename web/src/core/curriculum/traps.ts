/**
 * Catalogue statique de l'onglet « ⚔️ Pièges » — même parti pris que
 * `openings.ts` : pure donnée, aucune dépendance à chess.js ici (la
 * validation légale n'a lieu qu'en aval, voir `traps.test.ts` et
 * `client/features/traps/opening-trap-drill.tsx`).
 *
 * Un piège d'ouverture, contrairement à un chapitre de `openings.ts`, n'est
 * PAS un répertoire à mémoriser coup après coup : c'est UNE position précise
 * où un camp (`victimSide`, celui qu'incarne l'utilisateur) est tenté par un
 * coup naturel — souvent le plus évident du plateau — qui perd net ou compromet
 * gravement sa position. Le scénario est TOUJOURS le même :
 *  1. `setupMoves` se joue en autoplay (les deux camps, façon
 *     `leadInUci`/`kind: "mistake"` de `use-opening-drill.ts`) jusqu'à la
 *     position critique — l'IA « joue la ligne du piège de manière
 *     agressive », comme demandé, en amenant activement la position ;
 *  2. c'est alors au tour de l'utilisateur (`victimSide`) : `trapMove` est le
 *     coup naturel mais perdant qu'il est tenté de jouer — affiché comme
 *     repère (jamais imposé, l'utilisateur reste libre d'essayer n'importe
 *     quel coup, y compris celui-ci, qui sera alors refusé comme tout autre
 *     coup hors script, méthode Listudy stricte) ;
 *  3. `refutationMoves` EST le script attendu (voir `DrillRound.script`) :
 *     le premier coup est LA réfutation précise à trouver, les suivants
 *     (optionnels) rejouent la suite forcée qui démontre le point une fois
 *     trouvée — jamais un répertoire complet, juste de quoi conclure la
 *     démonstration.
 *
 * `trapMove` et le déroulé qu'il entraînerait s'il était joué (mat, perte de
 * pièce…) ne sont JAMAIS rejoués par le moteur — uniquement narrés dans
 * `trapExplanation`/`hint`/`outcome`/`comments`. Seul `trapMove` lui-même doit
 * rester un coup légal depuis la position atteinte par `setupMoves` (voir
 * `traps.test.ts`) : le reste de la punition est un texte, pas un script.
 *
 * ARCHITECTURE « GAMBITS & VARIANTES » (bascule industrielle depuis la V1 à
 * un piège par ouverture) : une même famille d'ouverture (`family`, niveau 1
 * du filtre `/pieges`) se décline désormais en plusieurs séries de gambits
 * (`gambit`, niveau 2 — « Série Fried Liver Attack », « Gambit Évans — Ligne
 * Acceptée »…), elles-mêmes découpées en PLUSIEURS puzzles indépendants
 * (`id` incrémental) qui creusent la même ligne à des profondeurs de jeu
 * croissantes plutôt qu'un unique point de bascule. Chaque puzzle reste un
 * point de décision UNIQUE (voir 1-3 ci-dessus) : « creuser une variante de
 * 16 coups » signifie donc plusieurs puzzles successifs dont le `setupMoves`
 * de l'un reprend le chemin CORRECT (jamais la ligne du piège, qui n'est
 * jamais rejouée) de son prédécesseur, prolongé par de la théorie réelle
 * jusqu'au prochain point de bascule.
 *
 * Portée de cette passe : priorité absolue donnée à la Partie Italienne
 * (Gambit Évans accepté/décliné/Fischer, Fried Liver, Traxler, Attaque
 * Møller, Gambit Deutz, 4 variantes du Gambit Shilling de Blackburne), avec
 * un premier étage pour Sicilienne / Caro-Kann / Ruy Lopez. Toutes les lignes
 * ci-dessous sont de la théorie réelle et documentée ; quelques noms demandés
 * (« Piège de Mortimer », « Piège de Tarrasch », « Alien Gambit », « Attaque
 * Fantôme ») n'ont pas de source unique et univoque en mémoire — le contenu
 * qui leur est associé reste 100% légal et thématiquement fidèle, mais le
 * libellé exact doit être pris comme une étiquette de catalogue plutôt qu'une
 * citation historique garantie mot pour mot.
 */

export type TrapSide = "white" | "black";

/** Niveau affiché sur la carte et servant de tri au sein d'une série (`gambit`) — voir `PiegesScreen`. */
export type TrapDifficulty = "beginner" | "intermediate" | "expert";

export interface OpeningTrap {
  /** Slug ASCII stable, utilisé dans l'URL `/pieges/[slug]`. */
  id: string;
  name: string;
  /** Famille d'ouverture affichée en tête de carte (ex. « Partie Italienne ») — NIVEAU 1 du filtre `/pieges`, indépendant du catalogue `openings.ts`. */
  family: string;
  /** Série de gambit/variante au sein de la famille (ex. « Attaque Fried Liver ») — NIVEAU 2 du filtre `/pieges`, regroupe les puzzles d'une même ligne pour former une « série complète » à enchaîner. */
  gambit: string;
  eco: string;
  /** Le camp qui TOMBE dans le piège — celui qu'incarne l'utilisateur, qui doit apprendre à s'en sortir (voir le docstring du fichier). */
  victimSide: TrapSide;
  difficulty: TrapDifficulty;
  /** Résumé affiché sur la carte de la liste `/pieges`. */
  summary: string;
  /** Coups SAN depuis le tout début de la partie, menant à la position CRITIQUE (juste avant la tentation) — rejoués en autoplay par les deux camps. */
  setupMoves: readonly string[];
  /** Le coup naturel mais perdant, tentant, depuis la position atteinte par `setupMoves` — jamais imposé au joueur, voir le docstring du fichier. */
  trapMove: string;
  /** Pourquoi ce coup naturel perd — affiché comme repère avant la première tentative (équivalent du "mistakeAlert" de `OpeningMistakeExercise`). */
  trapExplanation: string;
  /** Texte du bouton « 💡 Show hints for this move! » — oriente vers le danger tactique caché, jamais le coup lui-même. */
  hint: string;
  /** Script du drill (voir `DrillRound.script`) : le premier coup EST la réfutation à trouver, les suivants rejouent la suite forcée qui démontre le point. */
  refutationMoves: readonly string[];
  /** Conclusion pédagogique courte affichée une fois la réfutation trouvée. */
  outcome: string;
  /** Explication conceptuelle plus profonde (motif tactique récurrent, plan stratégique, lien avec d'autres pièges) — affichée sous `outcome` dans `OpeningTrapDrill`. */
  comments: string;
}

export const OPENING_TRAPS: readonly OpeningTrap[] = [
  // ────────────────────────────────────────────────────────────────────────
  // PARTIE ITALIENNE — priorité absolue, couverture la plus large.
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "legal-mate",
    name: "Le Mat de Légal",
    family: "Partie Italienne",
    gambit: "Le Mat de Légal",
    eco: "C50",
    victimSide: "black",
    difficulty: "intermediate",
    summary: "Le sacrifice de cavalier le plus célèbre de l'histoire des échecs : la Dame blanche semble s'offrir gratuitement sur d1.",
    setupMoves: ["e4", "e5", "Nf3", "d6", "Bc4", "Bg4", "Nc3", "g6", "Nxe5"],
    trapMove: "Bxd1",
    trapExplanation: "La Dame blanche paraît abandonnée sur d1 après Nxe5 — mais elle est protégée par un mat en 2 coups sur votre Roi.",
    hint: "Comptez les défenseurs de e7 et d5 après Bxf7+ Ke7 : le clouage du fou sur d1 ne sert plus à rien une fois le Roi noir livré au Cavalier.",
    refutationMoves: ["dxe5", "Qxg4"],
    outcome: "dxe5 refuse la Dame empoisonnée et reste simplement dans la partie. Bxd1?? au contraire tombe dans le Mat de Légal : Bxf7+! Ke7 Nd5#.",
    comments: "Le motif de fond, c'est le faux clouage : un clouage n'est réel que si la pièce clouée protège effectivement quelque chose d'irremplaçable. Ici le cavalier f3 est « cloué » sur la Dame d1, mais le Roi noir compte plus que la Dame — Légal l'a compris et a sacrifié la Dame pour matérialiser l'idée. Ce réflexe (« qui protège quoi, et lequel des deux compte vraiment ? ») revient dans la quasi-totalité des pièges de ce catalogue.",
  },
  {
    id: "blackburne-shilling",
    name: "Le Gambit Shilling de Blackburne",
    family: "Partie Italienne",
    gambit: "Gambit Shilling de Blackburne",
    eco: "C50",
    victimSide: "white",
    difficulty: "beginner",
    summary: "Un cavalier qui saute en d4, complètement hors-jeu — le pion e5 qu'il abandonne semble une prise entièrement gratuite.",
    setupMoves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nd4"],
    trapMove: "Nxe5",
    trapExplanation: "Le pion e5 semble tomber gratuitement et le cavalier d4 a l'air complètement hors-jeu — mais Qg5! arrive avec une double attaque foudroyante.",
    hint: "Après Nxe5, la Dame noire peut se poser sur g5 et viser À LA FOIS votre cavalier ET votre pion g2 (donc votre Tour h1) en un seul coup.",
    refutationMoves: ["Nxd4"],
    outcome: "Nxd4! profite simplement du cavalier mal placé, sans risque. Nxe5?? au contraire tombe dans le Gambit Shilling de Blackburne : Qg5! menace à la fois le cavalier et g2 — impossible de tout défendre en un coup.",
    comments: "Nd4 n'est PAS un mauvais coup en soi (l'échange de cavaliers après Nxd4 est même légèrement agréable pour les Noirs) — c'est un piège psychologique pur, qui ne fonctionne que parce que Nxe5 « a l'air » de punir un coup imprécis. Les 4 puzzles suivants creusent ce qui se passe si les Blancs mordent à l'hameçon ET s'enfoncent encore après 4...Qg5!.",
  },
  {
    id: "blackburne-nxf7",
    name: "Blackburne-Shilling : le mat en 3 coups",
    family: "Partie Italienne",
    gambit: "Gambit Shilling de Blackburne",
    eco: "C50",
    victimSide: "white",
    difficulty: "expert",
    summary: "Après le pion offert et la double attaque de Dame, un second cavalier gourmand sur f7 mène tout droit au mat.",
    setupMoves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nd4", "Nxe5", "Qg5"],
    trapMove: "Nxf7",
    trapExplanation: "Un deuxième pion semble tomber gratuitement avec fourchette Dame/Tour à la clé — mais le cavalier f7 ne fait que gagner du temps pour les Noirs, qui matent en 3 coups.",
    hint: "Après Nxf7 Qxg2, la Tour h1 est visée — comptez jusqu'au bout : Rf1 Qxe4+ force un coup de Fou, et le Cavalier d4 n'a plus attendu que ça.",
    refutationMoves: ["Ng4"],
    outcome: "Ng4 ramène le cavalier menacé tout en bloquant provisoirement la colonne g — les Blancs restent en délicatesse après un début aussi imprudent, mais évitent le pire. Nxf7?? au contraire tombe dans la ligne la plus célèbre du Gambit Shilling : Qxg2! Rf1 Qxe4+! Be2 Nf3# — mat.",
    comments: "Le point commun avec le Mat de Légal : les Blancs accumulent les prises de pions « gratuits » (e5, puis f7) sans jamais remarquer que le second cavalier noir, resté sagement sur d4 depuis le 3e coup, attend patiemment sa case c2 ou f3. Un pion offert deux fois de suite dans la même ligne doit alerter, pas rassurer.",
  },
  {
    id: "blackburne-bxf7",
    name: "Blackburne-Shilling : la fausse meilleure chance",
    family: "Partie Italienne",
    gambit: "Gambit Shilling de Blackburne",
    eco: "C50",
    victimSide: "white",
    difficulty: "expert",
    summary: "Le Fou italien s'engouffre sur f7 avec échec — mais le Roi noir s'échappe sans souci, laissant les Blancs sans rien de concret pour la pièce sacrifiée.",
    setupMoves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nd4", "Nxe5", "Qg5"],
    trapMove: "Bxf7+",
    trapExplanation: "Prendre avec échec semble la meilleure version du sacrifice — mais après Ke7!, le Roi noir est parfaitement en sécurité et le cavalier e5 reste attaqué comme avant.",
    hint: "Un échec n'est une vraie ressource que s'il gagne un tempo utile ensuite — ici, que fait le Roi noir en e7, et quel problème des Blancs a-t-il réglé ?",
    refutationMoves: ["Ng4"],
    outcome: "Ng4 limite la casse sans donner de matériel supplémentaire. Bxf7+?? au contraire dépense le Fou pour rien de concret : Ke7! et les Blancs restent nettement pire, sans compensation suffisante.",
    comments: "Un sacrifice « avec échec » n'est pas automatiquement fort — le réflexe à corriger est de se demander ce que l'échec accomplit CONCRÈTEMENT (case gagnée, pièce déviée, tempo pour développer) plutôt que de le jouer parce qu'il « semble actif ». Ici il ne fait qu'échanger le Fou contre un pion, sans réduire la pression sur le cavalier e5.",
  },
  {
    id: "blackburne-d4",
    name: "Blackburne-Shilling : ignorer les deux menaces",
    family: "Partie Italienne",
    gambit: "Gambit Shilling de Blackburne",
    eco: "C50",
    victimSide: "white",
    difficulty: "intermediate",
    summary: "Un coup de développement qui a l'air inoffensif — mais qui ne répond à aucune des deux menaces de la Dame noire.",
    setupMoves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nd4", "Nxe5", "Qg5"],
    trapMove: "Nc3",
    trapExplanation: "Nc3 développe sagement une pièce — mais ni le cavalier e5 ni le pion g2 ne sont défendus pour autant.",
    hint: "La Dame noire attaque deux choses à la fois. Nc3 en défend-il ne serait-ce qu'une seule ?",
    refutationMoves: ["Ng4"],
    outcome: "Ng4 répond directement à la double attaque en sauvant le cavalier menacé. Nc3?? au contraire l'ignore complètement : Qxg2! vise ensuite la Tour h1 sans que rien ne s'y oppose.",
    comments: "Face à une double attaque, un coup de développement « normal » qui ne traite ni l'une ni l'autre menace est presque toujours une erreur, même s'il semble constructif. Toujours identifier CE QUE menace l'adversaire avant de jouer un coup qui a l'air bon dans l'absolu.",
  },
  {
    id: "blackburne-qf3",
    name: "Blackburne-Shilling : la Dame ignore la fourchette",
    family: "Partie Italienne",
    gambit: "Gambit Shilling de Blackburne",
    eco: "C50",
    victimSide: "white",
    difficulty: "expert",
    summary: "La Dame vient défendre g2 comme il se doit — mais elle oublie complètement l'autre cavalier noir, resté discrètement sur d4 depuis le début.",
    setupMoves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nd4", "Nxe5", "Qg5"],
    trapMove: "Qf3",
    trapExplanation: "Qf3 défend bien le pion g2 — mais le second cavalier noir, oublié sur d4 depuis le 3e coup, fourche le Roi et la Tour sur c2.",
    hint: "Un cavalier noir est resté sur d4 depuis le tout début de la partie. Quelles cases blanches surveille-t-il, maintenant que le Roi n'a pas encore roqué ?",
    refutationMoves: ["Ng4"],
    outcome: "Ng4 sauve le cavalier attaqué sans exposer davantage le Roi. Qf3?? au contraire oublie le second cavalier : Nxc2+! fourchette le Roi e1 et la Tour a1 — une pièce supplémentaire s'envole.",
    comments: "La leçon centrale des 4 variantes Blackburne-Shilling : quand DEUX pièces adverses menacent des choses différentes, corriger l'une des deux menaces sans vérifier l'autre est le piège le plus commun de tous les échecs, à tous les niveaux. Toujours faire l'inventaire complet des menaces avant de choisir son coup.",
  },
  {
    id: "evans-gambit-accepted-c3",
    name: "Gambit Évans accepté : le second pion de trop",
    family: "Partie Italienne",
    gambit: "Gambit Évans — Ligne Acceptée",
    eco: "C51",
    victimSide: "black",
    difficulty: "intermediate",
    summary: "Après avoir croqué le pion b4 puis le pion d4, un second pion sur c3 semble une prise supplémentaire gratuite — mais la diagonale b3-f7 vient de s'ouvrir.",
    setupMoves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4", "Bxb4", "c3", "Ba5", "d4", "exd4", "O-O"],
    trapMove: "dxc3",
    trapExplanation: "Un troisième pion blanc semble tomber gratuitement — mais le Fou a5 n'a plus la moindre pièce noire développée pour couvrir b7 et f7, et la Dame blanche vient s'y engouffrer.",
    hint: "Après dxc3, la Dame blanche a une case idéale d'où elle attaque DEUX cases faibles à la fois. Laquelle ?",
    refutationMoves: ["Bb6"],
    outcome: "Bb6 replie le Fou en sécurité et garde une structure saine, un pion d'avance. dxc3?? au contraire ouvre grand la diagonale b3-f7 : Qb3! attaque simultanément b7 et f7, sans qu'une seule pièce noire supplémentaire ne soit développée pour aider à la défense.",
    comments: "Le Gambit Évans repose entièrement sur le tempo : les Blancs sacrifient un pion (b4) pour gagner un temps de développement massif. Chaque pion supplémentaire que les Noirs grappillent (Bxb4, puis exd4, puis dxc3) coûte lui aussi un tempo — à un moment, le compte devient insoutenable et la Dame blanche punit le retard de développement plutôt que le matériel en lui-même.",
  },
  {
    id: "evans-gambit-fischer-defense",
    name: "Gambit Évans, Défense Fischer : même piège, autre diagonale",
    family: "Partie Italienne",
    gambit: "Gambit Évans — Défense Fischer",
    eco: "C52",
    victimSide: "black",
    difficulty: "intermediate",
    summary: "En gardant le Fou actif sur c5 plutôt que de le replier en a5 (l'idée de Fischer), le même troisième pion reste tout aussi empoisonné.",
    setupMoves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4", "Bxb4", "c3", "Bc5", "d4", "exd4", "O-O"],
    trapMove: "dxc3",
    trapExplanation: "Garder le Fou actif sur c5 (l'idée de Fischer) ne change rien au problème de fond : un troisième pion grappillé laisse toujours la diagonale b3-f7 grande ouverte à la Dame blanche.",
    hint: "Le Fou est resté actif cette fois — mais protège-t-il pour autant b7 ou f7 contre une Dame arrivant en b3 ?",
    refutationMoves: ["d6"],
    outcome: "d6 consolide calmement le centre et garde le pion d4 en sécurité, sans se précipiter sur c3. dxc3?? au contraire retombe dans le même panneau que la ligne principale : Qb3! double attaque b7 et f7 pendant que le développement noir reste en retard.",
    comments: "La Défense Fischer (5...Bc5 au lieu de 5...Ba5) est une vraie amélioration théorique — elle garde le Fou sur sa meilleure diagonale — mais elle ne dispense JAMAIS de compter les tempos avant de croquer un pion de plus. Comparer ce puzzle au précédent (Ligne Acceptée) est un excellent exercice : le motif tactique final est rigoureusement identique malgré l'ordre des coups différent.",
  },
  {
    id: "evans-gambit-declined",
    name: "Gambit Évans décliné : la poussée a4-a5 prématurée",
    family: "Partie Italienne",
    gambit: "Gambit Évans — Ligne Déclinée",
    eco: "C51",
    victimSide: "white",
    difficulty: "beginner",
    summary: "En déclinant le pion avec 4...Bb6, les Noirs jouent ...a6 pour stopper la poussée a4-a5 — la pousser quand même tombe dans une fourchette de cavalier.",
    setupMoves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4", "Bb6", "a4", "a6"],
    trapMove: "a5",
    trapExplanation: "a5 chasse le Fou b6 comme prévu — mais ce pion avancé n'est défendu par rien, et le cavalier c6 peut le croquer en fourchant au passage le Fou c4.",
    hint: "Le cavalier c6 peut-il atteindre la case a5 en un seul saut ? Et que découvre-t-il en y arrivant ?",
    refutationMoves: ["Nc3"],
    outcome: "Nc3 développe sobrement sans se presser. a5?? au contraire perd le pion net : Nxa5! et le cavalier noir attaque en prime le Fou c4 — les Blancs doivent encore perdre un temps pour le sauver.",
    comments: "Une poussée de pion qui « chasse » une pièce adverse doit toujours être vérifiée à l'aune d'une question simple : ce pion avancé est-il lui-même défendu une fois arrivé sur sa case ? Ici, ...a6 avait justement pour but de retarder cette poussée le temps que les Blancs préparent sa défense (par exemple avec Nc3 d'abord).",
  },
  {
    id: "fried-liver-na5-escape",
    name: "Attaque Fried Liver : éviter le sacrifice en f7",
    family: "Partie Italienne",
    gambit: "Attaque Fried Liver",
    eco: "C57",
    victimSide: "black",
    difficulty: "intermediate",
    summary: "Reprendre naturellement le pion d5 avec le cavalier ouvre la porte au sacrifice le plus célèbre des Deux Cavaliers — une autre case existe.",
    setupMoves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5"],
    trapMove: "Nxd5",
    trapExplanation: "Reprendre avec le cavalier semble la suite la plus naturelle — mais elle ouvre la voie au sacrifice Nxf7!, l'Attaque Fried Liver, qui livre le Roi noir à une attaque décisive au centre.",
    hint: "Il existe une autre case pour le cavalier attaqué qui, en plus d'éviter le sacrifice, attaque directement le Fou c4.",
    refutationMoves: ["Na5"],
    outcome: "Na5! esquive complètement le sacrifice tout en attaquant le Fou c4 — la ligne moderne de référence contre les Deux Cavaliers. Nxd5?? au contraire ouvre la voie à 6.Nxf7! Kxf7 7.Qf3+, avec une attaque très dangereuse pour un seul pion.",
    comments: "Le point théorique central des Deux Cavaliers : 5...Nxd5 n'est pas illégal ni immédiatement perdant au sens strict, mais il invite une attaque que la théorie moderne juge trop dangereuse à affronter en pratique — d'où la préférence pour 5...Na5 (ou 5...Nb4), qui règle le problème du pion d5 SANS jamais laisser le Roi noir au centre. Comparer avec le puzzle suivant, qui explore ce qui se passe pour les joueurs qui acceptent quand même d'entrer dans le sacrifice.",
  },
  {
    id: "fried-liver-king-walk",
    name: "Fried Liver : la seule case sûre pour le Roi",
    family: "Partie Italienne",
    gambit: "Attaque Fried Liver",
    eco: "C57",
    victimSide: "black",
    difficulty: "expert",
    summary: "Une fois le sacrifice accepté et le Roi forcé de reprendre en f7, un seul déplacement de Roi évite le pire face à l'échec de la Dame blanche.",
    setupMoves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Nxd5", "Nxf7", "Kxf7", "Qf3+"],
    trapMove: "Kg8",
    trapExplanation: "Reculer le Roi vers le roque semble le réflexe le plus sûr — mais le Roi reste enfermé derrière ses propres pièces non développées, sans aucune case d'air, pendant que les Blancs développent avec tempo.",
    hint: "Un Roi qui recule n'est pas toujours plus en sécurité qu'un Roi qui avance : quelles cases g8 laisse-t-il libres pour ses propres pièces, comparé à e6 ?",
    refutationMoves: ["Ke6"],
    outcome: "Ke6! est le seul coup qui centralise le Roi tout en gardant un accès à ses pièces pour se défendre — le point le plus contre-intuitif de toute l'Attaque Fried Liver. Kg8?? au contraire enferme le Roi derrière un Fou et une Tour non développés, offrant aux Blancs largement le temps de construire une attaque décisive.",
    comments: "Ce coup illustre une idée qui revient souvent en finale d'attaque : un Roi exposé n'est pas nécessairement mieux protégé en reculant vers son camp si ce recul l'enferme derrière ses propres pièces. Ke6, bien que visuellement audacieux, donne au Roi de l'air et implique directement les autres pièces noires dans sa défense — c'est l'un des faits les plus cités de toute la théorie des ouvertures ouvertes.",
  },
  {
    id: "traxler-counter-attack",
    name: "Contre-attaque Traxler : la reprise qui ouvre le Roi blanc",
    family: "Partie Italienne",
    gambit: "Contre-attaque Traxler",
    eco: "C57",
    victimSide: "white",
    difficulty: "expert",
    summary: "Au lieu de fuir avec le Fou, les Noirs contre-attaquent en f2 — reprendre avec le Roi est la suite la plus naturelle, mais elle expose le Roi blanc à une attaque décisive.",
    setupMoves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "Bc5", "Nxf7", "Bxf2+"],
    trapMove: "Kxf2",
    trapExplanation: "Croquer le Fou avec le Roi semble le plus simple — mais Nxe4+! arrive ensuite avec échec, et la contre-attaque noire vaut largement la pièce sacrifiée, avec un Roi blanc bien plus exposé que son homologue noir.",
    hint: "Le Roi peut aussi simplement esquiver l'échec sans croquer le Fou — que perd-il à laisser le Fou f2 où il est ?",
    refutationMoves: ["Ke2"],
    outcome: "Ke2! décline la capture et garde le Roi relativement à l'abri, tout en laissant le cavalier f7 engrangé pour plus tard. Kxf2?? au contraire ouvre le jeu en plein centre : Nxe4+! Kg1 (ou une autre case) Qh4! avec une attaque noire extrêmement dangereuse pour la seule pièce sacrifiée.",
    comments: "La Contre-Attaque Traxler (ou Wilkes-Barre) est l'une des lignes les plus tranchantes de toute la théorie des ouvertures : les Noirs répondent à un sacrifice par un CONTRE-sacrifice immédiat plutôt que par la prudence. La leçon pratique à retenir n'est pas de mémoriser 15 coups par cœur, mais ce réflexe précis : face à un sacrifice surprise, la prise la plus évidente n'est pas toujours la mieux, et décliner (Ke2) garde souvent plus de contrôle qu'accepter.",
  },
  {
    id: "moller-attack-capture-order",
    name: "Attaque Møller : l'ordre des prises en c3",
    family: "Partie Italienne",
    gambit: "Attaque Møller (Center Attack)",
    eco: "C54",
    victimSide: "black",
    difficulty: "expert",
    summary: "Deux pièces noires peuvent reprendre sur c3 — mais l'une des deux laisse le Fou b4 attaqué et exposé juste après, l'autre non.",
    setupMoves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d4", "exd4", "cxd4", "Bb4+", "Nc3", "Nxe4", "O-O"],
    trapMove: "Nxc3",
    trapExplanation: "Reprendre avec le cavalier semble logique (c'est lui qui est le plus avancé) — mais après bxc3, c'est le Fou b4 qui se retrouve brusquement attaqué et doit reculer en perdant un temps précieux, voire tomber dans Qb3! s'il grappille le pion c3 à son tour.",
    hint: "Deux pièces noires attaquent la même case c3. Laquelle, une fois la reprise blanche jouée (bxc3), ne laisse rien d'attaqué derrière elle ?",
    refutationMoves: ["Bxc3"],
    outcome: "Bxc3! capture avec le Fou en premier — après bxc3, c'est le cavalier e4 qui reste actif au centre, sans rien à défendre en urgence. Nxc3?? au contraire inverse l'ordre : après bxc3, le Fou b4 est soudain attaqué par ce même pion et doit reculer piteusement, perdant le temps que tout le Gambit Évans/l'Attaque Møller cherchait justement à gagner.",
    comments: "Ce puzzle illustre un principe encore plus général que la position elle-même : quand deux pièces PEUVENT toutes les deux jouer la même capture, l'ordre des prises n'est jamais neutre — il faut toujours regarder qui se retrouve exposé APRÈS la recapture adverse, pas seulement ce qui est gagné dans l'instant. On retrouve exactement ce réflexe dans le Gambit Évasion (« dxc3 » ci-dessus) : ici il ne s'agit plus de savoir SI on prend, mais AVEC QUOI.",
  },
  {
    id: "deutz-gambit-recapture",
    name: "Center Attack (Gambit Deutz) : la mauvaise reprise",
    family: "Partie Italienne",
    gambit: "Gambit Deutz",
    eco: "C54",
    victimSide: "black",
    difficulty: "beginner",
    summary: "Après 5.d4!, deux pions semblent en prise pour les Noirs — mais un seul des deux se reprend vraiment sans dommage.",
    setupMoves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "O-O", "Nf6", "d4"],
    trapMove: "Nxe4",
    trapExplanation: "Grappiller le pion e4 semble aussi bon que reprendre sur d4 — mais ce même pion d4 attaque également le Fou c5, qui tombe pendant que le cavalier e4 ne fait rien d'utile.",
    hint: "Le pion d4 attaque deux cibles noires à la fois. Laquelle des deux reprises règle réellement le double problème ?",
    refutationMoves: ["exd4"],
    outcome: "exd4 règle la tension centrale proprement et garde le Fou c5 hors de danger. Nxe4?? au contraire ignore que d4 attaque aussi le Fou c5 : dxc5! gagne une pièce nette, le cavalier e4 ne compensant rien.",
    comments: "Une variante de l'idée « laquelle des deux prises règle vraiment le problème » : ici ce n'est même pas une question d'ordre (comme dans l'Attaque Møller) mais de choix pur — une des deux cibles attaquées par d4 doit être sécurisée en priorité (le Fou, qui ne peut pas se recapturer), l'autre (le pion e4) peut attendre.",
  },
  {
    id: "deutz-gambit-f2-fork-illusion",
    name: "Center Attack (Gambit Deutz) : la fausse fourchette en f2",
    family: "Partie Italienne",
    gambit: "Gambit Deutz",
    eco: "C54",
    victimSide: "black",
    difficulty: "intermediate",
    summary: "Le cavalier avancé en e4, attaqué par le Fou d5, semble sauver la mise en grappillant f2 au passage — mais cette case est archi-défendue.",
    setupMoves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "O-O", "Nf6", "d4", "exd4", "e5", "Ne4", "Bd5"],
    trapMove: "Nxf2",
    trapExplanation: "Nxf2 a l'air de sauver le cavalier attaqué tout en fourchant la Dame et la Tour — mais le Roi et la Tour blancs défendent tous les deux f2, donc le cavalier y est simplement perdu pour un pion.",
    hint: "Comptez les défenseurs de la case f2 AVANT de sauter dedans avec le cavalier : combien de pièces blanches la couvrent déjà ?",
    refutationMoves: ["Nf6"],
    outcome: "Nf6! ramène simplement le cavalier en sécurité, sans perdre de matériel. Nxf2?? au contraire ne fait illusion qu'un instant : Rxf2 (ou Kxf2) et les Blancs restent avec un cavalier de plus pour un seul pion.",
    comments: "Une case qui semble offrir une fourchette (ici sur la Dame d1 et la Tour f1) ne vaut la peine d'y sauter que si elle est elle-même sûre — sinon la « fourchette » ne sert à rien puisque la pièce qui fourche disparaît aussitôt. Toujours vérifier les défenseurs d'une case cible avant de se laisser séduire par ce qu'elle attaque en retour.",
  },

  // ────────────────────────────────────────────────────────────────────────
  // DÉFENSE SICILIENNE
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "siberian-trap",
    name: "Le Piège de Sibérie",
    family: "Défense Sicilienne",
    gambit: "Gambit Smith-Morra — Piège de Sibérie",
    eco: "B21",
    victimSide: "white",
    difficulty: "intermediate",
    summary: "Deux cavaliers noirs harcèlent la position blanche à la fois — croquer l'un des deux laisse l'autre gagner le fou.",
    setupMoves: ["e4", "c5", "d4", "cxd4", "c3", "dxc3", "Nxc3", "Nc6", "Nf3", "e6", "Bc4", "Qc7", "O-O", "Nf6", "Qe2", "Ng4", "h3", "Na5"],
    trapMove: "hxg4",
    trapExplanation: "Le cavalier g4 semble une prise gratuite — mais l'autre cavalier, en a5, attaquait déjà votre fou pendant ce temps : vous ne pouvez pas gagner les deux pièces à la fois.",
    hint: "Regardez la case c4 AVANT de croquer le cavalier g4 : qui l'attaque, et qui la défend encore une fois que vous aurez joué hxg4 ?",
    refutationMoves: ["Bd3"],
    outcome: "Bd3 met le fou à l'abri sans rien perdre. hxg4?? au contraire abandonne le fou après Nxc4! — un classique du Gambit Smith-Morra.",
    comments: "Le Gambit Smith-Morra sacrifie un pion pour du développement et de l'initiative — le Piège de Sibérie punit les Blancs qui, en pleine possession de cette initiative, oublient qu'une menace adverse en attente (ici Na5 sur le Fou c4) reste valable même pendant qu'ils en exécutent une autre. Toujours vérifier ses propres pièces menacées avant de croquer une offrande.",
  },
  {
    id: "magnus-smith-trap",
    name: "La Variante de Magnus Smith",
    family: "Défense Sicilienne",
    gambit: "Attaque Keres — Variante de Magnus Smith",
    eco: "B81",
    victimSide: "black",
    difficulty: "expert",
    summary: "Contre l'Attaque Keres (poussées g4-h4), défier immédiatement avec ...h5 semble logique — mais ouvre un sacrifice de cavalier en e6 qui regagne la pièce avec échec.",
    setupMoves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "e6", "g4", "h6", "h4", "Nc6", "Rg1"],
    trapMove: "h5",
    trapExplanation: "Défier tout de suite la chaîne de pions blancs semble le réflexe naturel — mais après gxh5 Nxh5, le sacrifice Nxe6! fxe6 ouvre la diagonale d1-h5 : la Dame blanche reprend le cavalier avec échec.",
    hint: "Après gxh5 Nxh5, quelle diagonale s'ouvre pour la Dame blanche une fois que le pion f7 aura dû reprendre en e6 ?",
    refutationMoves: ["Bd7"],
    outcome: "Bd7 termine tranquillement le développement sans se précipiter contre la poussée de pions blancs. h5?? au contraire tombe dans la Variante de Magnus Smith : gxh5! Nxh5 Nxe6! fxe6 Qxh5+! regagne le cavalier avec un échec supplémentaire — les Blancs ressortent une pièce devant.",
    comments: "L'Attaque Keres (6.g4) est une poussée agressive typique des lignes Scheveningen/Najdorf : elle gagne de l'espace au prix de la sécurité de son propre Roi. Le piège rappelle que RÉPONDRE à une attaque de pions par une contre-poussée immédiate n'est pas automatiquement juste — il faut d'abord vérifier que les cases et diagonales qui s'ouvriront ensuite ne profitent pas davantage à l'attaquant.",
  },

  // ────────────────────────────────────────────────────────────────────────
  // DÉFENSE CARO-KANN
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "caro-kann-fantasy-ghost",
    name: "L'Attaque Fantôme (Variante Fantaisie)",
    family: "Défense Caro-Kann",
    gambit: "Variante Fantaisie — L'Attaque Fantôme",
    eco: "B12",
    victimSide: "black",
    difficulty: "intermediate",
    summary: "Face à la Variante Fantaisie (3.f3), grappiller tout de suite le pion central d4 est tentant — mais un coup de développement bien plus fort existait.",
    setupMoves: ["e4", "c6", "d4", "d5", "f3", "dxe4", "fxe4", "e5", "Nf3"],
    trapMove: "exd4",
    trapExplanation: "Prendre le pion central semble la suite logique après la poussée ...e5 — mais elle laisse le Roi noir au centre une case de plus, alors qu'un clouage immédiat du cavalier f3 réglait tout en gardant l'initiative.",
    hint: "Une pièce noire peut clouer le cavalier f3 sur la Dame AVANT de songer à reprendre quoi que ce soit au centre — laquelle ?",
    refutationMoves: ["Bg4"],
    outcome: "Bg4! cloue immédiatement le cavalier f3 et garde l'initiative, sans se presser sur d4. exd4?? au contraire cède le centre et le temps aux Blancs, qui recapturent tranquillement sans que les Noirs n'aient rien engrangé en retour.",
    comments: "La Variante Fantaisie (« Attaque Fantôme ») transforme la Caro-Kann en position beaucoup plus ouverte que d'habitude — les repères habituels de la Caro-Kann (structure solide, développement lent) ne s'appliquent plus tels quels. Le réflexe à corriger : dans une position ouverte, le développement AVEC tempo (ici Bg4, clouage) prime presque toujours sur un gain de pion qui ne fait que déplacer la tension sans la résoudre.",
  },
  {
    id: "caro-kann-two-knights-alien",
    name: "L'Alien Gambit : le mat du cavalier en d6",
    family: "Défense Caro-Kann",
    gambit: "Défense à Deux Cavaliers — L'Alien Gambit",
    eco: "B10",
    victimSide: "black",
    difficulty: "expert",
    summary: "L'un des mats les plus célèbres de toute la théorie des ouvertures : développer le second cavalier par la mauvaise case ferme toutes les issues du Roi noir.",
    setupMoves: ["e4", "c6", "Nc3", "d5", "Nf3", "dxe4", "Nxe4", "Nd7", "Qe2"],
    trapMove: "Ngf6",
    trapExplanation: "Développer le second cavalier semble le coup le plus naturel du monde — mais il bloque la seule case de fuite du Roi noir (d7), pendant que Qe2 menace justement Nd6, échec et mat.",
    hint: "Le cavalier b8 est déjà allé en d7. Le second cavalier peut atteindre f6 par DEUX chemins différents — l'un d'eux vide une case cruciale pour le Roi, l'autre non.",
    refutationMoves: ["Ndf6"],
    outcome: "Ndf6! développe le MÊME cavalier qui occupait d7, libérant cette case pour le Roi. Ngf6?? au contraire tombe dans l'un des mats d'ouverture les plus célèbres : Nd6# — le Roi noir est totalement encagé par ses propres pièces (d7, d8, e7, f7, f8 tous occupés), sans aucune case de fuite ni pièce capable de capturer ou d'intercepter.",
    comments: "Ce piège est un cas d'école de « mat étouffé déguisé » : ce n'est pas un cavalier qui prive le Roi de cases (comme dans un mat étouffé classique), mais les propres pièces non développées du Roi qui jouent ce rôle. La leçon : avant de choisir laquelle de deux pièces développer vers la même case, vérifier systématiquement quelles cases CHACUNE des deux options laisse libres pour le Roi.",
  },

  // ────────────────────────────────────────────────────────────────────────
  // RUY LOPEZ
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "fishing-pole-trap",
    name: "La Canne à Pêche (Fishing Pole)",
    family: "Ruy Lopez",
    gambit: "La Canne à Pêche (Fishing Pole)",
    eco: "C70",
    victimSide: "white",
    difficulty: "expert",
    summary: "Un cavalier noir avancé en g4, en apparence hors-jeu et non défendu, sert d'appât — le croquer ouvre la colonne h à une attaque dangereuse.",
    setupMoves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6", "d3", "Bc5", "O-O", "O-O", "Re1", "d6", "c3", "Ng4", "h3", "h5"],
    trapMove: "hxg4",
    trapExplanation: "Le cavalier g4 semble une prise gratuite après h3 — c'est la « canne à pêche » : il n'est offert que pour ouvrir la colonne h une fois capturé, avec une attaque dangereuse à la clé pour un seul cavalier.",
    hint: "Si vous croquez le cavalier avec le pion h3, et que les Noirs reprennent hxg4 à leur tour, quelle colonne reste grande ouverte juste devant votre propre Roi ?",
    refutationMoves: ["d4"],
    outcome: "d4 développe au centre sans mordre à l'hameçon, laissant le cavalier g4 sans réelle utilité pour l'instant. hxg4?? au contraire ouvre la colonne h : hxg4! et la Dame noire peut s'y engouffrer avec une attaque très dangereuse contre un seul cavalier de matériel.",
    comments: "Le « Fishing Pole » est l'un des sacrifices les plus enseignés du jeu d'échecs moderne car il se reproduit, presque à l'identique, dans de nombreuses ouvertures différentes dès qu'un cavalier peut atteindre g4 (ou g5 pour les Noirs) avec le pion h prêt à le suivre. Le réflexe à automatiser : une pièce avancée et « offerte » sans raison apparente doit toujours faire poser la question « qu'est-ce que sa capture ouvre chez MOI ? », pas seulement « qu'est-ce que je gagne ? ».",
  },
  {
    id: "mortimer-trap",
    name: "Le Piège de Mortimer",
    family: "Ruy Lopez",
    gambit: "Le Piège de Mortimer",
    eco: "C70",
    victimSide: "white",
    difficulty: "expert",
    summary: "Le cavalier a5 attaque le Fou b3 — grappiller le pion e5 avant de répondre à cette attaque laisse la Dame noire forker le cavalier ET le pion g2 d'un seul coup.",
    setupMoves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "d6", "c3", "b5", "Bb3", "Na5"],
    trapMove: "Nxe5",
    trapExplanation: "Nxe5 semble gagner un pion gratuit (le cavalier a5 ne garde plus e5) — mais il laisse le Fou b3 sans réponse ET ouvre la case g5 à la Dame noire, qui double-attaque le cavalier fraîchement avancé et le pion g2.",
    hint: "Après Nxe5, comptez les cases g2 et le Fou b3 : la Dame noire peut-elle viser les deux à la fois depuis une seule case ?",
    refutationMoves: ["Bc2"],
    outcome: "Bc2 résout calmement l'attaque sur le Fou avant de songer à autre chose. Nxe5?? au contraire tombe dans le Piège de Mortimer : Qg5! double-attaque le cavalier e5 et le pion g2, et les Blancs ne peuvent pas tout défendre en un seul coup.",
    comments: "Même motif que le Gambit Shilling de Blackburne (Qg5, double attaque cavalier+g2) mais dans un contexte de Ruy Lopez fermée : ce n'est pas un hasard, c'est l'un des motifs de double-attaque les plus recyclés de toute la théorie des débuts ouverts. Reconnaître un motif déjà vu ailleurs est une des compétences les plus utiles en pratique — ne pas résoudre une pièce attaquée avant de grappiller ailleurs en est la cause récurrente.",
  },
  {
    id: "tarrasch-trap",
    name: "Le Piège de Tarrasch",
    family: "Ruy Lopez",
    gambit: "Le Piège de Tarrasch",
    eco: "C68",
    victimSide: "white",
    difficulty: "intermediate",
    summary: "Dans la Variante d'Échange, le pion e5 noir semble tomber gratuitement dès que le cavalier c6 a disparu — mais la Dame noire centralise avec une double attaque immédiate.",
    setupMoves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Bxc6", "dxc6"],
    trapMove: "Nxe5",
    trapExplanation: "Le cavalier c6 qui gardait e5 vient de disparaître, rendant la prise tentante — mais elle ouvre la colonne d à la Dame noire, qui centralise en fourchant le cavalier ET le pion e4 d'un seul coup.",
    hint: "La colonne d est maintenant complètement dégagée jusqu'à votre camp — quelle pièce noire peut s'y engager immédiatement avec un double effet ?",
    refutationMoves: ["O-O"],
    outcome: "O-O termine le développement sans se précipiter sur un pion piégé. Nxe5?? au contraire tombe dans le Piège de Tarrasch : Qd4! centralise en fourchant le cavalier e5 et le pion e4 — les Blancs perdent le fruit de leur prise, et plus encore.",
    comments: "La Variante d'Échange (4.Bxc6) simplifie la position mais déséquilibre aussi la structure de pions noirs (doublés en c) — beaucoup de joueurs blancs, pressés d'exploiter cet avantage, oublient que la colonne d, elle, s'est ouverte pour les DEUX camps une fois les dames encore sur l'échiquier. Un déséquilibre structurel favorable ne dispense jamais de vérifier les lignes ouvertes qui l'accompagnent.",
  },

  // ────────────────────────────────────────────────────────────────────────
  // AUTRES FAMILLES (inchangées depuis la V1)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "elephant-trap",
    name: "Le Piège de l'Éléphant",
    family: "Gambit Dame",
    gambit: "Le Piège de l'Éléphant",
    eco: "D51",
    victimSide: "white",
    difficulty: "beginner",
    summary: "Un pion d5 en apparence imprenable gratuitement — le cavalier qui le prend tombe dans une fourchette de dames à double détente.",
    setupMoves: ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "Bg5", "Nbd7", "cxd5", "exd5"],
    trapMove: "Nxd5",
    trapExplanation: "Le pion d5 semble se prendre gratuitement — mais le cavalier qui le capture est lui-même repris, et la Dame noire n'est pas si offerte qu'elle en a l'air ensuite.",
    hint: "Après Nxd5 Nxd5, la Dame d8 tombe si vous jouez Bxd8 — mais comptez large : Bb4+ regagne tout, avec les intérêts.",
    refutationMoves: ["e3"],
    outcome: "e3 développe sagement sans se jeter sur le pion. Nxd5?? au contraire perd une pièce nette après Nxd5! Bxd8 Bb4+! Qd2 Bxd2+ Kxd2 Kxd8 — les Noirs ressortent une pièce devant.",
    comments: "Une capture qui semble gagner une pièce mérite toujours d'être poursuivie jusqu'au bout de la séquence forcée, pas seulement jusqu'au premier échange favorable — ici, s'arrêter après Bxd8 fait perdre de vue l'échec intermédiaire Bb4+ qui renverse tout le calcul.",
  },
  {
    id: "lasker-trap",
    name: "Le Piège de Lasker",
    family: "Gambit Contre Albin",
    gambit: "Le Piège de Lasker",
    eco: "D08",
    victimSide: "white",
    difficulty: "intermediate",
    summary: "Un fou noir semble tomber tout cuit sur b4 — mais un pion noir bien avancé cache une promotion imminente, échec à la clé.",
    setupMoves: ["d4", "d5", "c4", "e5", "dxe5", "d4", "e3", "Bb4+", "Bd2", "dxe3"],
    trapMove: "Bxb4",
    trapExplanation: "Le fou noir paraît une prise gratuite après dxe3 — mais ce pion d'apparence anodine sur e3 cache une promotion à un coup, avec échec.",
    hint: "Ne reprenez pas tout de suite le fou : que se passe-t-il si le pion e3 continue sa route jusqu'en f2, puis plus loin encore ?",
    refutationMoves: ["fxe3"],
    outcome: "fxe3 régularise sobrement le matériel. Bxb4?? au contraire tombe dans le Piège de Lasker : exf2+! Ke2 fxg1=Q, et les Noirs ressortent une pièce devant en promouvant.",
    comments: "Un pion très avancé près de la 2e/7e rangée doit toujours être traité comme une menace de promotion active, même s'il semble isolé et sans soutien apparent — le compter pour « juste un pion » est l'erreur de fond de ce piège.",
  },
  {
    id: "scholars-mate",
    name: "Le Mat du Berger",
    family: "Débuts Ouverts",
    gambit: "Le Mat du Berger",
    eco: "C20",
    victimSide: "black",
    difficulty: "beginner",
    summary: "Le tout premier piège que chaque joueur rencontre : la Dame et le Fou blancs visent tous les deux la même case fragile, f7.",
    setupMoves: ["e4", "e5", "Qh5", "Nc6", "Bc4"],
    trapMove: "Nf6",
    trapExplanation: "Développer un cavalier semble le réflexe le plus sain qui soit — mais personne ne défend f7 face à la double attaque Dame + Fou.",
    hint: "Deux pièces blanches visent f7 en même temps. Qui, chez vous, défend cette case — ou peut chasser l'attaquante la plus dangereuse ?",
    refutationMoves: ["g6", "Qf3"],
    outcome: "g6! chasse la Dame et coupe net la diagonale vers f7. Nf6?? au contraire perd immédiatement sur Qxf7#, le Mat du Berger.",
    comments: "Le point faible structurel de f7 (et f2 pour les Blancs) — la seule case du plateau uniquement défendue par le Roi en tout début de partie — revient dans une quantité impressionnante de pièges de ce catalogue (Légal, Blackburne-Shilling, Fried Liver, Traxler…). Repérer cette case en priorité dès les premiers coups est l'un des réflexes les plus rentables de toute la phase d'ouverture.",
  },
] as const;

export function findTrap(id: string): OpeningTrap | null {
  return OPENING_TRAPS.find((trap) => trap.id === id) ?? null;
}

/** Familles distinctes, dans l'ordre de première apparition — NIVEAU 1 du filtre `/pieges` (façon `groupMistakesByFamily`). */
export function listTrapFamilies(): string[] {
  const seen = new Set<string>();
  for (const trap of OPENING_TRAPS) seen.add(trap.family);
  return Array.from(seen);
}

/** Séries de gambit distinctes d'une famille donnée, dans l'ordre de première apparition — NIVEAU 2 du filtre `/pieges` (regroupe les puzzles d'une même ligne, voir `PiegesScreen`). */
export function listTrapGambits(family: string): string[] {
  const seen = new Set<string>();
  for (const trap of OPENING_TRAPS) {
    if (trap.family === family) seen.add(trap.gambit);
  }
  return Array.from(seen);
}

/** Ordre pédagogique croissant — sert à trier une série de puzzles (`gambit`) du plus accessible au plus pointu, voir `PiegesScreen`. */
export const DIFFICULTY_ORDER: readonly TrapDifficulty[] = ["beginner", "intermediate", "expert"];

export const DIFFICULTY_LABEL: Record<TrapDifficulty, string> = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  expert: "Expert",
};
