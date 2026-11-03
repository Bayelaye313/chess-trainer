import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours d'ouverture « Sicilienne ouverte, 2.Nf3 et 3.d4 (avec les Blancs) » —
 * onglet Ouvertures, format « un commentaire par coup » de l'Académie, lu par
 * `CourseTreeViewer` (route `/ouvertures/open-sicilian-white/cours`). Public
 * visé : 1500-1800 Elo, répertoire 1.e4 contre 1...c5 (fiche curatée
 * `open-sicilian-white`, B30-B33, B40-B43, B90). Ne remplace ni
 * `sicilian-najdorf` ni `sicilian-dragon` (cours côté Noirs), ni
 * `sicilian-alapin` (2.c3).
 *
 * ## Contenu (v2 du 2026-11-03, format Ruy Lopez v2, côté Blancs)
 *
 * 1. Fiche d'identité, tronc commun : 2...Nc6 3.d4, la Sveshnikov et 7.Nd5.
 * 2. Aléatoire surprise 1 : après la Sveshnikov, la tour a7 enfermée.
 * 3. Branche B : la Löwenthal, 4...e5 5.Nb5 a6 6.Nd6+.
 * 4. Branche C : le dragon accéléré 4...g6 5.c4, l'étau de Maroczy.
 * 5. Branche D : 2...e6 3.d4, la Kan 4...a6 5.Bd3.
 * 6. Aléatoire surprise 2 : après la Kan, le roi noir au centre.
 * 7. Branche E : 2...d6 3.d4, la Najdorf et l'attaque anglaise.
 * 8. Anti-panique : 2...Nf6, 2...g6 et les ordres de coups.
 *
 * Choix des chapitres (2026-11-03) : la demande de l'utilisateur (2.Nf3
 * puis 3.d4 contre l'Ancienne Sicilienne, la Löwenthal, 2...e6 et 2...d6)
 * et la théorie principale de chacune : 4...Nf6 5.Nc3 e5 avec la ligne
 * simple 7.Nd5, 4...e5 5.Nb5, 4...g6 5.c4, la Kan 5.Bd3, l'attaque anglaise
 * contre la Najdorf ; plus 2...Nf6 et 2...g6. Parties de l'utilisateur
 * (copie de la base) : 2...Nc6 3.d4 dix fois, 2...e6 trois fois, 2...d6
 * quatre fois. Aucun cours côté Blancs ne traitait la Sicilienne ouverte.
 * Les branches théoriques s'arrêtent au plus tard au demi-coup 27 ; les
 * chapitres « Aléatoire surprise » prolongent avec les Noirs comme camp
 * « mou » (`_tmp-drift.mts` pour la surprise 1 ; pour la surprise 2, la
 * même dérive en MultiPV 30, les Noirs mous, car MultiPV 5 ne trouvait
 * aucun coup calme assez faible).
 *
 * Convention côté Blancs (comme `op-ruy-lopez.ts`) : l'élève joue les
 * Blancs ; les fautes sont des coups NOIRS qui portent les 3 indices
 * `[%hint]` + `[%hintcsl]`, le coup blanc suivant est la punition. Les
 * « variantes piégées » sont des coups blancs tentants mais mauvais
 * (8.Qxd5, 8.Qd5, 6.Be2 dans le Maroczy, 12.e5 dans la Kan, 7.Nf5 dans la
 * Najdorf). Une faute qui perd moins de 0.5 devient une « imprécision »
 * sans indices (11...Nxa7 au chapitre 5).
 *
 * Sources : théorie établie de la Sicilienne ouverte, TOUTES les lignes
 * arbitrées par Stockfish 19 natif (profondeur 16, MultiPV 1) ; 9.a4 et
 * 10.Bd2 contre la Sveshnikov, et 7.Nc3 dans la Kan, sont des choix du
 * moteur. Toute la prose est originale.
 *
 ## Architecture technique des nœuds
 *
 * Chaque nœud (`ChessMoveNode`, `core/chess/move-tree.ts`) porte :
 * - `evaluationScore` / `evaluationMate` : évaluation Stockfish 19 de la
 *   position après le coup (profondeur 16, point de vue Blancs), écrite
 *   `[%eval x]` ; `showEvalBar` est vrai dès qu'elle est posée ;
 * - `freeze` : posé par la balise `[%txt "…"]` qui enveloppe CHAQUE
 *   commentaire ; en mode « Jouer les coups », l'ordinateur attend
 *   « Suivant » ou Espace avant de répondre ;
 * - `hints` / `hintHighlights` : `[%hint "…"]` (3 indices progressifs) et
 *   `[%hintcsl …]` sur les fautes noires qu'il faut punir.
 *
 * Fichier GÉNÉRÉ : ne pas l'éditer à la main. Source commentée :
 * `scripts/opening-course-src/open-sicilian-white.pgn` (et l'en-tête
 * `open-sicilian-white.header.txt`) ; regénérer avec
 * `node --import tsx scripts/_tmp-build-opening-course.mts <source> <en-tête> <sortie> 16`
 * (Stockfish natif, voir `scripts/_tmp-sf-native.mts` ; sous Linux,
 * `SF_BIN=<chemin du binaire>`). Les `[%eval]` viennent du moteur, pas de la
 * main. Étape standard : `scripts/_tmp-check-cited-evals.mts op-open-sicilian-white`
 * doit sortir 0 écart (un chiffre n'est cité dans un commentaire que s'il est
 * l'éval d'un nœud). Règles de l'utilisateur : SAN en texte brut uniquement
 * (jamais de figurine Unicode), pas de guillemet droit dans un `[%txt]`.
 */

function chapter(title: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, START) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const OP_OPEN_SICILIAN_WHITE: CourseTree = {
  chapters: [
    chapter(
      "Fiche d'identité, tronc commun : 2...Nc6 3.d4, la Sveshnikov et 7.Nd5",
      `{ [%txt "LA SICILIENNE OUVERTE, AVEC LES BLANCS : 2.Nf3 PUIS 3.d4.

Le vrai enjeu : contre 1...c5, on joue 2.Nf3 et 3.d4 pour ouvrir le centre. Après 3...cxd4 4.Nxd4, nous avons un pion central de plus (e4 contre d6 ou e6) et une avance de développement ; les Noirs ont la colonne c semi-ouverte et la majorité centrale à long terme.

Le déséquilibre recherché : espace et pièces actives contre une structure noire solide mais passive. Notre plan selon les cas : la case d5 (contre ...e5), le grand roque et l'attaque à l'aile roi (contre ...d6 et ...a6), ou l'étau de Maroczy c4-e4 (contre ...g6).

Pourquoi ces chapitres : le choix suit les réponses noires principales après 2.Nf3 : l'Ancienne Sicilienne 2...Nc6 avec 4...Nf6 et 5...e5 (ce chapitre), la Löwenthal 4...e5 (chapitre 3) et le dragon accéléré 4...g6 (chapitre 4), puis 2...e6 (chapitre 5), 2...d6 (chapitre 7) et 2...Nf6 (chapitre 8). Dans tes parties, 2...Nc6 domine (10 fois), devant 2...e6 et 2...d6. Les cours sicilian-najdorf et sicilian-dragon sont écrits pour les Noirs, sicilian-alapin pour 2.c3 : aucun ne traite la Sicilienne ouverte avec les Blancs.

Les structures types :
- Contre ...e5 : la case d5 est un trou ; notre cavalier ou notre pion s'y installe.
- Contre ...g6 : pions c4 et e4, l'étau de Maroczy.
- Contre ...e6 et ...d6 : grand roque blanc, pions f3-g4-g5 contre l'aile roi noire.

Règle d'or : dans la Sicilienne ouverte, chaque temps compte ; développe d'abord, attaque ensuite, et surveille la case d5."] [%eval 0.39] }
1. e4 { [%txt "On occupe le centre."] [%eval 0.26] [%csl Ge4] }
1... c5 { [%txt "La Sicilienne : les Noirs contrôlent d4 avec un pion de l'aile."] [%eval 0.27] }
2. Nf3 { [%txt "Le cavalier prépare d4."] [%eval 0.30] }
2... Nc6 { [%txt "L'Ancienne Sicilienne : le cavalier contrôle d4. (2...e6 : chapitre 5 ; 2...d6 : chapitre 7 ; 2...Nf6 et 2...g6 : chapitre 8.)"] [%eval 0.36] }
3. d4 { [%txt "On ouvre le centre."] [%eval 0.31] [%cal Gd4c5] }
3... cxd4 { [%txt "Les Noirs échangent."] [%eval 0.26] }
4. Nxd4 { [%txt "Le cavalier reprend au centre."] [%eval 0.19] }
4... Nf6 { [%txt "Le cavalier attaque e4. (4...e5 : chapitre 3 ; 4...g6 : chapitre 4.)"] [%eval 0.21] [%cal Gf6e4] }
5. Nc3 { [%txt "Le cavalier défend e4."] [%eval 0.31] }
5... e5 { [%txt "LA SVESHNIKOV : le pion chasse le cavalier d4, mais d5 devient un trou."] [%eval 0.28] [%csl Rd5] }
6. Ndb5 { [%txt "Le cavalier vise d6."] [%eval 0.33] [%cal Gb5d6] }
6... d6 { [%txt "Le pion couvre d6."] [%eval 0.33] }
(6... a6 { [%txt "Les Noirs chassent le cavalier, mais d6 n'est plus couvert : l'évaluation passe de +0.33 à +1.14."] [%hint "les Noirs jouent un coup de pion alors que la case d6 n'est défendue par personne."] [%hint "la case d6. Notre cavalier y saute avec échec."] [%hint "7.Nd6+ : le cavalier s'installe, le fou f8 doit l'échanger."] [%hintcsl Gd6,Re8] [%eval 1.14] }
  7. Nd6+ { [%txt "Échec : le cavalier entre en d6."] [%eval 1.10] [%cal Gd6e8] }
  7... Bxd6 { [%txt "Le fou prend."] [%eval 1.03] }
  8. Qxd6 { [%txt "La dame reprend : les cases noires sont à nous."] [%eval 1.16] }
  8... Qe7 { [%txt "À RETENIR.

PRO TIP : +1.24. Le fou de cases noires des Noirs a disparu, d6 et d5 sont nos cases. Contre ...e5 sans ...d6, cherche toujours Nd6+."] [%eval 1.24] [%csl Gd6,Gd5] })
7. Nd5 { [%txt "LA LIGNE SIMPLE : le cavalier s'installe en d5."] [%eval 0.27] [%csl Gd5] }
7... Nxd5 { [%txt "Les Noirs échangent."] [%eval 0.27] }
8. exd5 { [%txt "On reprend avec le pion : le cavalier c6 est attaqué."] [%eval 0.28] [%cal Gd5c6] }
(8. Qxd5 { [%txt "LA VARIANTE PIÉGÉE : la dame reprend et se centralise…"] [%eval -0.96] [%csl Rd5] }
  8... a6 { [%txt "…mais les Noirs chassent le cavalier b5…"] [%eval -0.92] }
  9. Na3 { [%txt "…qui recule…"] [%eval -0.90] }
  9... Be6 { [%txt "…et le fou attaque la dame avec gain de temps."] [%eval -0.96] }
  10. Qd3 { [%txt "À RETENIR.

PRO TIP : -0.97. Trois temps perdus avec la dame. Dans la Sveshnikov, reprends en d5 avec le pion : il chasse le cavalier c6 et gagne l'espace."] [%eval -0.97] [%csl Re6] })
8... Nb8 { [%txt "Le cavalier recule et vise d7."] [%eval 0.28] }
(8... Be7 { [%txt "Le fou se développe et oublie le cavalier c6 : l'évaluation passe de +0.28 à +2.74."] [%hint "les Noirs développent le fou alors que leur cavalier c6 est attaqué par le pion d5."] [%hint "le cavalier c6. Notre pion d5 le prend."] [%hint "9.dxc6 : une pièce de plus."] [%hintcsl Rc6,Gd5] [%eval 2.74] }
  9. dxc6 { [%txt "On prend le cavalier."] [%eval 3.06] }
  9... bxc6 { [%txt "Les Noirs reprennent."] [%eval 2.81] }
  10. Nc3 { [%txt "Le cavalier se replie."] [%eval 2.96] }
  10... d5 { [%txt "À RETENIR.

PRO TIP : +2.96, une pièce de plus. Après exd5 dans la Sveshnikov, le cavalier c6 doit bouger tout de suite : vérifie toujours ce que ton pion attaque."] [%eval 2.96] [%csl Gc6] })
9. a4 { [%txt "On empêche ...b5 et on prend l'espace à l'aile dame."] [%eval 0.24] [%cal Ga4b5] }
9... Be7 { [%txt "Le fou se développe."] [%eval 0.28] }
10. Bd2 { [%txt "Le fou vise b4 et a5."] [%eval 0.32] }
10... Nd7 { [%txt "Le cavalier vise c5."] [%eval 0.25] }
11. a5 { [%txt "Le pion fixe l'aile dame noire."] [%eval 0.26] }
11... a6 { [%txt "Les Noirs chassent le cavalier b5."] [%eval 0.26] }
12. Na3 { [%txt "Le cavalier recule vers c4."] [%eval 0.28] [%cal Ga3c4] }
12... Nf6 { [%txt "Le cavalier attaque d5."] [%eval 0.24] }
(12... Nc5 { [%txt "Le cavalier s'installe en c5, mais il ne conteste plus d5 : l'évaluation passe de +0.28 à +0.84."] [%hint "les Noirs placent le cavalier en c5, loin du pion d5 qu'ils devaient attaquer."] [%hint "la case c4. Notre cavalier a3 y viendra après le développement du fou f1, et visera b6 et d6."] [%hint "13.Be2 : développement, puis Nc4."] [%hintcsl Gc4,Gd5] [%eval 0.84] }
  13. Be2 { [%txt "Développement."] [%eval 0.89] }
  13... Rb8 { [%txt "La tour soutient ...b5."] [%eval 1.00] }
  14. Nc4 { [%txt "À RETENIR.

PRO TIP : +0.91. Notre cavalier vise b6 et d6. Le cavalier c5 noir est beau, mais seul."] [%eval 0.91] [%cal Gc4b6] })
13. Bb4 { [%txt "Le fou vise d6."] [%eval 0.23] [%cal Gb4d6] }
13... Bf5 { [%txt "Le fou se développe."] [%eval 0.32] }
14. Nc4 { [%txt "Le cavalier vise b6 et d6.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.16).
1. Nb6 : le cavalier bloque l'aile dame et gêne la tour a8.
2. Be2 et O-O : on finit le développement.
3. c4 puis c5 : le levier contre d6."] [%eval 0.16] [%cal Gc4b6,Gc4d6] } *`,
    ),
    chapter(
      "Aléatoire surprise 1 : après la Sveshnikov, la tour a7 enfermée",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le chapitre 1 jusqu'à 14.Nc4. La théorie s'arrête là. Les Noirs ne font pas de gaffe : ils jouent des coups d'attente pendant que notre cavalier s'installe en b6. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case clé (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quelle pièce noire est enfermée ? 3. Quelle pièce blanche peut l'attaquer ?"] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... c5 { [%txt "La Sicilienne."] [%eval 0.27] }
2. Nf3 { [%txt "Vers d4."] [%eval 0.30] }
2... Nc6 { [%txt "Contre d4."] [%eval 0.36] }
3. d4 { [%txt "Ouverture."] [%eval 0.31] }
3... cxd4 { [%txt "Échange."] [%eval 0.26] }
4. Nxd4 { [%txt "Reprise."] [%eval 0.19] }
4... Nf6 { [%txt "Contre e4."] [%eval 0.21] }
5. Nc3 { [%txt "Défense."] [%eval 0.31] }
5... e5 { [%txt "La Sveshnikov."] [%eval 0.28] }
6. Ndb5 { [%txt "Vers d6."] [%eval 0.33] }
6... d6 { [%txt "Couverture."] [%eval 0.33] }
7. Nd5 { [%txt "La case d5."] [%eval 0.27] }
7... Nxd5 { [%txt "Échange."] [%eval 0.27] }
8. exd5 { [%txt "Reprise."] [%eval 0.28] }
8... Nb8 { [%txt "Recul."] [%eval 0.28] }
9. a4 { [%txt "L'espace."] [%eval 0.24] }
9... Be7 { [%txt "Développement."] [%eval 0.28] }
10. Bd2 { [%txt "Vers b4."] [%eval 0.32] }
10... Nd7 { [%txt "Vers c5."] [%eval 0.25] }
11. a5 { [%txt "Fixation."] [%eval 0.26] }
11... a6 { [%txt "Chasse."] [%eval 0.26] }
12. Na3 { [%txt "Vers c4."] [%eval 0.28] }
12... Nf6 { [%txt "Contre d5."] [%eval 0.24] }
13. Bb4 { [%txt "Vers d6."] [%eval 0.23] }
13... Bf5 { [%txt "Développement."] [%eval 0.32] }
14. Nc4 { [%txt "Fin de la théorie."] [%eval 0.16] }
14... O-O { [%txt "Les Noirs roquent."] [%eval 0.27] }
15. Nb6 { [%txt "Le cavalier s'installe en b6 et attaque la tour a8."] [%eval 0.28] [%cal Gb6a8] }
15... Ra7 { [%txt "La tour se cache en a7, mais elle n'en sortira plus : l'évaluation passe de +0.28 à +1.51."] [%hint "les Noirs mettent la tour sur une case d'où elle ne peut plus sortir : b7 est occupé, a8 et b8 sont tenus par notre cavalier."] [%hint "la diagonale e3-a7. Notre fou b4 doit passer par d2 pour viser la tour depuis e3."] [%hint "16.Bd2 : le fou revient vers e3."] [%hintcsl Ra7,Ge3] [%eval 1.51] }
16. Bd2 { [%txt "Le fou vise e3, puis a7."] [%eval 1.39] [%cal Gd2e3] }
16... Qb8 { [%txt "La dame défend la tour, mais elle devient aussi passive : l'évaluation passe de +1.39 à +1.96."] [%hint "les Noirs attachent leur dame à la défense de la tour a7."] [%hint "la case c4. Notre pion c y avance et prépare c5 contre d6."] [%hint "17.c4 : l'espace, puis c5."] [%hintcsl Gc4,Rb8] [%eval 1.96] }
17. c4 { [%txt "Le pion prend l'espace et prépare c5."] [%eval 2.03] [%cal Gc4c5] }
17... Bg6 { [%txt "Le fou se replie sans plan : l'évaluation passe de +2.03 à +2.67."] [%hint "les Noirs reculent un fou au lieu de libérer leur aile dame."] [%hint "la case e2. Notre fou f1 y sort, et le roque suit."] [%hint "18.Be2 : on finit le développement avant d'ouvrir."] [%hintcsl Ge2,Gg1] [%eval 2.67] }
18. Be2 { [%txt "À RETENIR.

PRO TIP : +2.87. La tour a7 et la dame b8 sont hors jeu, nous finissons le développement par le roque. Un cavalier en b6 contre la tour a8 vaut souvent une tour enfermée."] [%eval 2.87] [%cal Gb6a8] } *`,
    ),
    chapter(
      "Branche B : la Löwenthal, 4...e5 5.Nb5 a6 6.Nd6+",
      `{ [%txt "LA LÖWENTHAL (4...e5).

Les Noirs chassent le cavalier d4 sans ...Nf6. Le pion d6 manque : notre cavalier saute en b5 puis en d6 avec échec, et nous gagnons la paire de fous. Les Noirs ont du développement en échange.

Points clés : après 7.Qxd6 Qf6, on peut échanger les dames ou reculer en d1 ; ici on recule, on finit le développement (Nc3, Be3, Qd2, O-O-O) et la paire de fous parle."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... c5 { [%txt "La Sicilienne."] [%eval 0.27] }
2. Nf3 { [%txt "Vers d4."] [%eval 0.30] }
2... Nc6 { [%txt "Contre d4."] [%eval 0.36] }
3. d4 { [%txt "Ouverture."] [%eval 0.31] }
3... cxd4 { [%txt "Échange."] [%eval 0.26] }
4. Nxd4 { [%txt "Reprise."] [%eval 0.19] }
4... e5 { [%txt "LA LÖWENTHAL : le pion chasse le cavalier tout de suite."] [%eval 0.53] }
5. Nb5 { [%txt "Le cavalier vise d6."] [%eval 0.48] [%cal Gb5d6] }
5... a6 { [%txt "Les Noirs chassent le cavalier, qui entre en d6."] [%eval 0.59] }
(5... Bc5 { [%txt "Le fou se développe, mais il devient le seul gardien de d6 : l'évaluation passe de +0.48 à +1.15."] [%hint "les Noirs développent le fou qui protège d6, et notre fou c1 peut l'échanger."] [%hint "la case e3. Notre fou y propose l'échange du fou c5, et d6 perdra son gardien."] [%hint "6.Be3 : on attaque le défenseur de d6."] [%hintcsl Ge3,Rd6] [%eval 1.15] }
  6. Be3 { [%txt "Le fou propose l'échange."] [%eval 1.60] [%cal Ge3c5] }
  6... d6 { [%txt "Les Noirs couvrent d6."] [%eval 1.41] }
  7. N1c3 { [%txt "Développement."] [%eval 1.00] }
  7... Nf6 { [%txt "À RETENIR.

PRO TIP : +1.10. Les Noirs ont dû jouer ...d6, et notre cavalier b5 reste fort. Contre ...Bc5 dans la Löwenthal, Be3 attaque le gardien des cases noires."] [%eval 1.10] [%cal Ge3c5] })
6. Nd6+ { [%txt "Échec : le cavalier entre en d6."] [%eval 0.72] }
6... Bxd6 { [%txt "Le fou prend : la paire de fous est à nous."] [%eval 0.71] }
7. Qxd6 { [%txt "La dame reprend."] [%eval 0.61] }
7... Qf6 { [%txt "Les Noirs proposent l'échange des dames."] [%eval 0.84] }
8. Qd1 { [%txt "La dame recule : on garde les dames et la paire de fous."] [%eval 1.01] }
(8. Qd5 { [%txt "LA VARIANTE PIÉGÉE : la dame se centralise…"] [%eval -0.37] [%csl Rd5] }
  8... Nd4 { [%txt "…mais le cavalier noir saute en d4 et menace c2…"] [%eval -0.35] }
  9. Bd3 { [%txt "…on défend…"] [%eval -0.35] }
  9... Ne7 { [%txt "…et le cavalier chasse la dame avec gain de temps. À RETENIR.

PRO TIP : -0.29. La dame en d5 est une cible pour ...Ne7 et ...Nd4. Recule en d1 : la paire de fous suffit."] [%eval -0.29] [%csl Rd5] })
8... Nge7 { [%txt "Le cavalier se développe."] [%eval 1.03] }
9. Nc3 { [%txt "Développement."] [%eval 1.09] }
9... d6 { [%txt "Le pion soutient e5."] [%eval 1.14] }
(9... d5 { [%txt "Les Noirs ouvrent le centre, mais d5 est faible : l'évaluation passe de +1.09 à +1.97."] [%hint "les Noirs poussent un pion central qui n'est défendu que par un cavalier."] [%hint "le pion d5. Notre cavalier c3 le prend."] [%hint "10.Nxd5 : un pion de plus."] [%hintcsl Rd5,Gc3] [%eval 1.97] }
  10. Nxd5 { [%txt "On prend d5."] [%eval 2.09] }
  10... Nxd5 { [%txt "Les Noirs reprennent."] [%eval 2.05] }
  11. exd5 { [%txt "Le pion reprend."] [%eval 2.13] }
  11... Ne7 { [%txt "À RETENIR.

PRO TIP : +1.91, un pion de plus. Contre ...d5 sans soutien, compte les attaquants : cavalier c3, pion e4 et dame d1 contre deux défenseurs."] [%eval 1.91] [%csl Gd5] })
10. Be3 { [%txt "Le fou se développe."] [%eval 1.05] }
10... O-O { [%txt "Les Noirs roquent."] [%eval 1.01] }
11. Qd2 { [%txt "La dame relie les tours."] [%eval 1.17] }
11... Be6 { [%txt "Le fou se développe."] [%eval 1.21] }
(11... Qh4 { [%txt "La dame sort à l'aile roi, sans soutien : l'évaluation passe de +1.17 à +2.14."] [%hint "les Noirs attaquent avec la dame seule pendant que nous pouvons roquer."] [%hint "la case c1. Notre roi y roque et la tour d1 vise d6."] [%hint "12.O-O-O : roque et pression sur d6."] [%hintcsl Gc1,Rd6] [%eval 2.14] }
  12. O-O-O { [%txt "On roque du grand côté."] [%eval 2.32] }
  12... Re8 { [%txt "La tour défend e5."] [%eval 2.51] }
  13. g3 { [%txt "Le pion chasse la dame."] [%eval 2.51] }
  13... Qh5 { [%txt "À RETENIR.

PRO TIP : +2.56. La dame noire recule, le pion d6 est faible. Contre une sortie de dame sans soutien, roque et vise le point faible."] [%eval 2.56] [%cal Gd1d6] })
12. O-O-O { [%txt "Le grand roque : la tour vise d6."] [%eval 1.09] [%cal Gd1d6] }
12... Rad8 { [%txt "La tour défend d6.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+1.09).
1. h4 et h5 : l'aile roi noire est la cible.
2. Bb6 : le fou attaque la tour d8.
3. Kb1 : le roi à l'abri avant toute ouverture."] [%eval 1.09] [%cal Gh2h4] } *`,
    ),
    chapter(
      "Branche C : le dragon accéléré 4...g6 5.c4, l'étau de Maroczy",
      `{ [%txt "LE DRAGON ACCÉLÉRÉ (4...g6).

Les Noirs veulent ...d5 en un coup. On l'interdit par 5.c4 : l'ÉTAU DE MAROCZY. Nos pions c4 et e4 tiennent d5, et les Noirs n'ont plus de levier central simple.

Points clés : on développe vite (Nc3, Be2, Be3, O-O), on échange en d4 avec la dame si les Noirs le proposent, et on joue b3 pour soutenir c4. Le plan noir est ...a6 et ...b5, ou ...Qa5 et ...Rfc8 contre c4."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... c5 { [%txt "La Sicilienne."] [%eval 0.27] }
2. Nf3 { [%txt "Vers d4."] [%eval 0.30] }
2... Nc6 { [%txt "Contre d4."] [%eval 0.36] }
3. d4 { [%txt "Ouverture."] [%eval 0.31] }
3... cxd4 { [%txt "Échange."] [%eval 0.26] }
4. Nxd4 { [%txt "Reprise."] [%eval 0.19] }
4... g6 { [%txt "LE DRAGON ACCÉLÉRÉ : le fou vise la grande diagonale."] [%eval 0.57] }
5. c4 { [%txt "L'ÉTAU DE MAROCZY : c4 et e4 tiennent d5."] [%eval 0.54] [%csl Gc4,Ge4] }
5... Nf6 { [%txt "Le cavalier attaque e4."] [%eval 0.52] }
6. Nc3 { [%txt "Le cavalier défend e4."] [%eval 0.48] }
(6. Be2 { [%txt "LA VARIANTE PIÉGÉE : le développement naturel…"] [%eval -0.76] [%csl Re4] }
  6... Nxe4 { [%txt "…mais le pion e4 n'est plus défendu, et le cavalier le prend."] [%eval -0.78] }
  7. O-O { [%txt "On roque…"] [%eval -0.89] }
  7... Bg7 { [%txt "…un pion de moins. À RETENIR.

PRO TIP : -0.92. Dans le Maroczy, e4 a besoin de Nc3 avant toute autre chose."] [%eval -0.92] [%csl Re4] })
6... d6 { [%txt "Le pion contrôle e5 et c5."] [%eval 0.47] }
(6... e5 { [%txt "Les Noirs chassent le cavalier, mais d6 devient un trou : l'évaluation passe de +0.48 à +1.29."] [%hint "les Noirs poussent ...e5 sans ...d6, et la case d6 n'a plus de gardien."] [%hint "la case b5. Notre cavalier d4 y saute et vise d6."] [%hint "7.Ndb5 : le cavalier entre, puis Nd6+."] [%hintcsl Gb5,Rd6] [%eval 1.29] }
  7. Ndb5 { [%txt "Le cavalier vise d6."] [%eval 1.22] }
  7... Bc5 { [%txt "Le fou couvre d6, en vain."] [%eval 1.33] }
  8. Nd6+ { [%txt "Échec."] [%eval 1.43] }
  8... Kf8 { [%txt "À RETENIR.

PRO TIP : +1.34. Le roi noir ne roquera plus et le cavalier d6 domine. Contre ...e5 sans ...d6, cherche toujours Nb5 et Nd6."] [%eval 1.34] [%csl Gd6] })
7. Be2 { [%txt "Le fou se développe et prépare le roque."] [%eval 0.47] }
7... Nxd4 { [%txt "Les Noirs échangent en d4."] [%eval 0.52] }
8. Qxd4 { [%txt "La dame reprend au centre."] [%eval 0.48] }
8... Bg7 { [%txt "Le fou attaque la dame."] [%eval 0.45] }
(8... Qb6 { [%txt "Les Noirs proposent l'échange des dames, mais leur structure s'abîme : l'évaluation passe de +0.48 à +1.39."] [%hint "les Noirs proposent un échange qui doublera leurs pions."] [%hint "la case b6. Notre dame y prend la dame noire, et les pions b noirs sont doublés."] [%hint "9.Qxb6 axb6 10.Nb5 : le cavalier vise c7."] [%hintcsl Gb6,Rc7] [%eval 1.39] }
  9. Qxb6 { [%txt "On échange les dames."] [%eval 1.37] }
  9... axb6 { [%txt "Les Noirs reprennent : pions doublés."] [%eval 1.32] }
  10. Nb5 { [%txt "Le cavalier vise c7 et d6."] [%eval 1.37] }
  10... Kd8 { [%txt "À RETENIR.

PRO TIP : +1.57. Pions doublés et roi noir en d8. Une finale du Maroczy sans les dames est bonne pour nous quand la structure noire s'abîme."] [%eval 1.57] [%cal Gb5c7] })
9. Be3 { [%txt "Le fou défend la dame."] [%eval 0.42] }
9... O-O { [%txt "Les Noirs roquent."] [%eval 0.45] }
10. Qd2 { [%txt "La dame quitte la grande diagonale."] [%eval 0.46] }
10... Be6 { [%txt "Le fou attaque c4."] [%eval 0.42] [%cal Ge6c4] }
11. O-O { [%txt "On roque."] [%eval 0.50] }
11... Qa5 { [%txt "La dame vise a2 et la colonne c."] [%eval 0.46] }
(11... b5 { [%txt "Les Noirs tentent le levier ...b5, mais c4 le prend : l'évaluation passe de +0.50 à +2.79."] [%hint "les Noirs poussent un pion que notre pion c4 peut prendre."] [%hint "le pion b5. Notre pion c4 le prend."] [%hint "12.cxb5 : un pion de plus."] [%hintcsl Rb5,Gc4] [%eval 2.79] }
  12. cxb5 { [%txt "On prend."] [%eval 2.57] }
  12... Qa5 { [%txt "Les Noirs cherchent de l'activité."] [%eval 2.87] }
  13. b3 { [%txt "À RETENIR.

PRO TIP : +2.62, un pion de plus. Dans le Maroczy, le levier ...b5 n'est possible que préparé par ...a6 et ...Rb8."] [%eval 2.62] [%csl Gb5] })
12. Rac1 { [%txt "La tour défend c4 par la colonne c."] [%eval 0.40] }
12... Rfc8 { [%txt "La tour vise c4."] [%eval 0.35] }
13. b3 { [%txt "Le pion soutient c4."] [%eval 0.33] [%cal Gb3c4] }
13... a6 { [%txt "Les Noirs préparent ...b5.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.38).
1. f3 : e4 est solide, nos pièces jouent derrière.
2. Nd5 : le cavalier échange les pièces actives noires.
3. a4 si les Noirs préparent ...b5 : l'étau reste fermé."] [%eval 0.38] [%csl Gc4,Ge4] } *`,
    ),
    chapter(
      "Branche D : 2...e6 3.d4, la Kan 4...a6 5.Bd3",
      `{ [%txt "LA KAN (2...e6 et 4...a6).

Les Noirs gardent leurs options : ...a6 contrôle b5, ...Qc7 et ...b5 viendront. On répond par 5.Bd3, qui soutient e4 et prépare c4 ou O-O. Contre ...Bc5, le cavalier recule en b3.

Points clés : le fou d3 et le cavalier b3 gardent e4 ; on joue f4 et Qe3 pour viser le pion d6, faible. (4...Nc6, la Taimanov, se traite avec les mêmes idées : Nc3, Be2 ou Bd3, puis f4.)"] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... c5 { [%txt "La Sicilienne."] [%eval 0.27] }
2. Nf3 { [%txt "Vers d4."] [%eval 0.30] }
2... e6 { [%txt "Les Noirs préparent ...d5 et ouvrent le fou f8."] [%eval 0.43] }
3. d4 { [%txt "Ouverture."] [%eval 0.48] }
3... cxd4 { [%txt "Échange."] [%eval 0.47] }
4. Nxd4 { [%txt "Reprise."] [%eval 0.45] }
4... a6 { [%txt "LA KAN : le pion contrôle b5."] [%eval 0.49] }
5. Bd3 { [%txt "Le fou soutient e4."] [%eval 0.45] [%cal Gd3e4] }
5... Bc5 { [%txt "Le fou attaque le cavalier d4."] [%eval 0.52] }
6. Nb3 { [%txt "Le cavalier recule et attaque le fou."] [%eval 0.55] }
6... Ba7 { [%txt "Le fou recule sur la diagonale a7-g1."] [%eval 0.57] }
(6... Bd6 { [%txt "Le fou recule, mais il abandonne la case g7 : l'évaluation passe de +0.55 à +1.17."] [%hint "les Noirs reculent le fou en d6, où il ne défend plus g7."] [%hint "la case g4. Notre dame y vise g7."] [%hint "7.Qg4 : la dame attaque g7."] [%hintcsl Gg4,Rg7] [%eval 1.17] }
  7. Qg4 { [%txt "La dame vise g7."] [%eval 1.26] [%cal Gg4g7] }
  7... g6 { [%txt "Les Noirs défendent g7, mais les cases noires sont faibles."] [%eval 1.21] }
  8. Nc3 { [%txt "À RETENIR.

PRO TIP : +1.18. Le pion g6 affaiblit f6 et h6, notre fou c1 viendra en h6. Dans la Kan, un fou noir qui quitte la diagonale de g7 laisse cette case sans défense."] [%eval 1.18] [%csl Rf6,Rh6] })
7. Nc3 { [%txt "Développement."] [%eval 0.39] }
7... d6 { [%txt "Le pion contrôle e5."] [%eval 0.34] }
8. Qe2 { [%txt "La dame soutient e4 et prépare Be3."] [%eval 0.41] }
8... Nc6 { [%txt "Développement."] [%eval 0.39] }
9. Be3 { [%txt "On propose l'échange du fou a7."] [%eval 0.32] }
9... b5 { [%txt "Les Noirs prennent l'espace à l'aile dame."] [%eval 0.24] }
10. f4 { [%txt "Le pion f prend l'espace et vise e5."] [%eval 0.29] [%cal Gf4e5] }
10... Nge7 { [%txt "Développement."] [%eval 0.32] }
(10... Qd7 { [%txt "La dame sort avant les pièces mineures, sur la colonne d : l'évaluation passe de +0.29 à +0.84."] [%hint "les Noirs développent la dame alors que le cavalier g8 et le roi sont encore à la maison."] [%hint "la case c1. Notre roi y roque et la tour d1 vise d6 et la dame d7."] [%hint "11.O-O-O : roque et pression sur la colonne d."] [%hintcsl Gc1,Rd7] [%eval 0.84] }
  11. O-O-O { [%txt "À RETENIR.

PRO TIP : +0.79. La tour d1 vise d6 et la dame d7 derrière lui. Contre une dame noire sur la colonne d, le grand roque est un coup d'attaque."] [%eval 0.79] [%cal Gd1d7] })
11. Bxa7 { [%txt "On échange le fou a7."] [%eval 0.37] }
11... Rxa7 { [%txt "La tour reprend."] [%eval 0.35] }
(11... Nxa7 { [%txt "Une imprécision : le cavalier reprend, mais il quitte la défense de e5. L'évaluation passe de +0.37 à +0.73."] [%eval 0.73] }
  12. e5 { [%txt "Le pion attaque d6."] [%eval 0.83] }
  12... d5 { [%txt "Les Noirs ferment."] [%eval 0.91] }
  13. h4 { [%txt "À RETENIR.

PRO TIP : +0.85. Notre pion e5 prend l'espace, l'aile roi noire est la cible. Contre une reprise du cavalier en a7, e5 tout de suite."] [%eval 0.85] [%csl Ge5] })
12. Qe3 { [%txt "La dame vise la tour a7 et la case b6.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.27).
1. O-O-O : le roi à l'abri, la tour vise d6.
2. Nd4 : le cavalier revient au centre.
3. e5 au bon moment : le pion d6 est la cible."] [%eval 0.27] [%cal Ge3a7] }
(12. e5 { [%txt "LA VARIANTE PIÉGÉE : on frappe d6 tout de suite…"] [%eval -0.76] [%csl Re5] }
  12... dxe5 { [%txt "…mais les Noirs prennent…"] [%eval -0.90] }
  13. O-O-O { [%txt "…et nous n'avons rien gagné : le pion e5 a disparu. À RETENIR.

PRO TIP : -0.97. La poussée e5 se prépare par Qe3 et O-O-O ; trop tôt, elle ne fait qu'ouvrir la position aux Noirs."] [%eval -0.97] [%csl Re5] }) *`,
    ),
    chapter(
      "Aléatoire surprise 2 : après la Kan, le roi noir au centre",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le chapitre 5 jusqu'à 12.Qe3. La théorie s'arrête là. Les Noirs ne font pas de gaffe : ils jouent des coups qui semblent actifs, mais leur roi reste en e8. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case clé (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Le roi noir a-t-il roqué ? 3. Quel coup ouvre une colonne vers lui ?"] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... c5 { [%txt "La Sicilienne."] [%eval 0.27] }
2. Nf3 { [%txt "Vers d4."] [%eval 0.30] }
2... e6 { [%txt "Vers ...d5."] [%eval 0.43] }
3. d4 { [%txt "Ouverture."] [%eval 0.48] }
3... cxd4 { [%txt "Échange."] [%eval 0.47] }
4. Nxd4 { [%txt "Reprise."] [%eval 0.45] }
4... a6 { [%txt "La Kan."] [%eval 0.49] }
5. Bd3 { [%txt "Soutien."] [%eval 0.45] }
5... Bc5 { [%txt "Contre d4."] [%eval 0.52] }
6. Nb3 { [%txt "Recul."] [%eval 0.55] }
6... Ba7 { [%txt "Recul."] [%eval 0.57] }
7. Nc3 { [%txt "Développement."] [%eval 0.39] }
7... d6 { [%txt "Contre e5."] [%eval 0.34] }
8. Qe2 { [%txt "Soutien."] [%eval 0.41] }
8... Nc6 { [%txt "Développement."] [%eval 0.39] }
9. Be3 { [%txt "Échange proposé."] [%eval 0.32] }
9... b5 { [%txt "L'espace."] [%eval 0.24] }
10. f4 { [%txt "Vers e5."] [%eval 0.29] }
10... Nge7 { [%txt "Développement."] [%eval 0.32] }
11. Bxa7 { [%txt "Échange."] [%eval 0.37] }
11... Rxa7 { [%txt "Reprise."] [%eval 0.35] }
12. Qe3 { [%txt "Fin de la théorie."] [%eval 0.27] }
12... Qd7 { [%txt "La dame quitte la défense de d6 et de l'aile roi : l'évaluation passe de +0.27 à +0.89."] [%hint "les Noirs développent la dame sans roquer, et la colonne d s'ouvre bientôt."] [%hint "la case c1. Notre roi y roque et la tour vient en d1, face à d6 et à la dame."] [%hint "13.O-O-O : le roque et la colonne d."] [%hintcsl Gc1,Rd6] [%eval 0.89] }
13. O-O-O { [%txt "On roque du grand côté."] [%eval 0.96] [%cal Gd1d6] }
13... b4 { [%txt "Le pion chasse le cavalier."] [%eval 0.97] }
14. Na4 { [%txt "Le cavalier vise b6 et c5."] [%eval 0.91] }
14... h5 { [%txt "Les Noirs poussent un pion de l'aile roi au lieu de roquer : l'évaluation passe de +0.91 à +1.71."] [%hint "les Noirs affaiblissent leur aile roi avec le roi toujours en e8."] [%hint "la case b1. Notre roi y est à l'abri, puis le pion g4 ouvrira l'aile roi."] [%hint "15.Kb1 : le roi d'abord, l'attaque ensuite."] [%hintcsl Gb1,Rh5] [%eval 1.71] }
15. Kb1 { [%txt "Le roi se met à l'abri."] [%eval 1.82] }
15... Qc7 { [%txt "La dame vise c4 et le pion e4."] [%eval 1.68] }
16. g4 { [%txt "Le pion attaque h5."] [%eval 1.73] [%cal Gg4h5] }
16... d5 { [%txt "Les Noirs ouvrent le centre avec le roi en e8 : l'évaluation passe de +1.73 à +2.92."] [%hint "les Noirs ouvrent le centre alors que leur roi n'a pas roqué."] [%hint "la case h3. Notre pion y soutient g4 avant d'ouvrir le jeu."] [%hint "17.h3 : la chaîne g4-h3 tient."] [%hintcsl Gh3,Rh5] [%eval 2.92] }
17. h3 { [%txt "Le pion soutient g4."] [%eval 2.93] }
17... e5 { [%txt "Les Noirs poussent encore."] [%eval 2.82] }
18. f5 { [%txt "Le pion avance et bloque."] [%eval 2.73] [%cal Gf5f6] }
18... f6 { [%txt "Les Noirs ferment l'aile roi, mais la colonne g va s'ouvrir : l'évaluation passe de +2.73 à +3.91."] [%hint "les Noirs bloquent l'aile roi avec le roi au centre."] [%hint "la case g1. Notre tour h1 y vient, sur la colonne g."] [%hint "19.Rhg1 : la tour sur la colonne qui va s'ouvrir."] [%hintcsl Gg1,Rg7] [%eval 3.91] }
19. Rhg1 { [%txt "La tour prend la colonne g."] [%eval 3.76] }
19... d4 { [%txt "Le pion attaque la dame."] [%eval 4.05] }
20. Qd2 { [%txt "À RETENIR.

PRO TIP : +3.92. Notre tour g1 et le pion g4 vont ouvrir la colonne g vers le roi e8. Quand le roi adverse reste au centre, roque d'abord, puis ouvre une colonne."] [%eval 3.92] [%cal Gg1g7] } *`,
    ),
    chapter(
      "Branche E : 2...d6 3.d4, la Najdorf et l'attaque anglaise",
      `{ [%txt "2...d6 ET LA NAJDORF (5...a6).

Contre 2...d6, on ouvre par 3.d4 et on joue l'ATTAQUE ANGLAISE contre la Najdorf : Be3, f3, Qd2, O-O-O, puis g4-g5. Les Noirs attaquent de leur côté par ...b5 et ...Qc7 : c'est une course, et notre plan est simple à retenir.

Points clés : f3 soutient e4 et prépare g4 ; le cavalier b3 vise d5 et a5 ; notre roi va en b1. (5...g6, le Dragon, se joue avec le même schéma : Be3, f3, Qd2, O-O-O.)"] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... c5 { [%txt "La Sicilienne."] [%eval 0.27] }
2. Nf3 { [%txt "Vers d4."] [%eval 0.30] }
2... d6 { [%txt "Le pion contrôle e5 et prépare ...Nf6."] [%eval 0.38] }
3. d4 { [%txt "Ouverture."] [%eval 0.25] }
3... cxd4 { [%txt "Échange."] [%eval 0.34] }
4. Nxd4 { [%txt "Reprise."] [%eval 0.36] }
4... Nf6 { [%txt "Le cavalier attaque e4."] [%eval 0.27] }
5. Nc3 { [%txt "Défense."] [%eval 0.29] }
5... a6 { [%txt "LA NAJDORF : le pion contrôle b5."] [%eval 0.25] }
6. Be3 { [%txt "L'ATTAQUE ANGLAISE commence."] [%eval 0.22] }
6... e5 { [%txt "Le pion chasse le cavalier."] [%eval 0.28] }
(6... b5 { [%txt "Les Noirs prennent l'espace trop tôt, et d5 est libre : l'évaluation passe de +0.22 à +1.08."] [%hint "les Noirs avancent un pion à l'aile dame avant de couvrir d5."] [%hint "la case d5. Notre cavalier c3 y saute et attaque le cavalier f6."] [%hint "7.Nd5 : le cavalier au centre."] [%hintcsl Gd5,Rf6] [%eval 1.08] }
  7. Nd5 { [%txt "Le cavalier s'installe en d5."] [%eval 1.01] }
  7... e6 { [%txt "Les Noirs chassent le cavalier."] [%eval 0.95] }
  8. Nxf6+ { [%txt "On échange en f6."] [%eval 0.94] }
  8... Qxf6 { [%txt "À RETENIR.

PRO TIP : +1.03. La dame noire est sortie trop tôt et d6 est faible. Contre ...b5 sans ...e6 ni ...Nbd7, la case d5 est à nous."] [%eval 1.03] [%csl Rd6] })
7. Nb3 { [%txt "Le cavalier recule et vise d5 et a5."] [%eval 0.34] }
(7. Nf5 { [%txt "LA VARIANTE PIÉGÉE : le cavalier saute en f5…"] [%eval -0.59] [%csl Rf5] }
  7... d5 { [%txt "…mais les Noirs frappent le centre…"] [%eval -0.60] }
  8. Bg5 { [%txt "…on cloue…"] [%eval -0.49] }
  8... d4 { [%txt "…et le pion chasse le cavalier c3. À RETENIR.

PRO TIP : -0.53. En f5, le cavalier ne menace rien : le recul en b3 garde le contrôle de d5."] [%eval -0.53] [%csl Rf5] })
7... Be6 { [%txt "Le fou contrôle d5."] [%eval 0.32] [%cal Ge6d5] }
(7... Nc6 { [%txt "Le cavalier se développe, mais il ne contrôle pas d5 : l'évaluation passe de +0.34 à +0.90."] [%hint "les Noirs développent le cavalier sans s'occuper de la case d5."] [%hint "la case c1. Notre roi y roquera après Qd2, puis Nd5 viendra."] [%hint "8.Qd2 : la dame relie les tours et prépare O-O-O."] [%hintcsl Gd5,Gc1] [%eval 0.90] }
  8. Qd2 { [%txt "La dame se développe."] [%eval 0.97] }
  8... Be7 { [%txt "Développement."] [%eval 0.79] }
  9. O-O-O { [%txt "À RETENIR.

PRO TIP : +0.79. Le grand roque est fait, Nd5 viendra."] [%eval 0.79] [%csl Gd5] })
8. f3 { [%txt "Le pion soutient e4 et prépare g4."] [%eval 0.31] [%cal Gf3g4] }
8... Be7 { [%txt "Développement."] [%eval 0.31] }
9. Qd2 { [%txt "La dame relie les tours."] [%eval 0.36] }
9... O-O { [%txt "Les Noirs roquent."] [%eval 0.31] }
10. O-O-O { [%txt "Le grand roque : la course commence."] [%eval 0.37] }
10... Qc7 { [%txt "La dame vise c3 et c2."] [%eval 0.55] }
11. g4 { [%txt "Le pion g avance contre le cavalier f6."] [%eval 0.67] [%cal Gg4g5] }
11... Nbd7 { [%txt "Le cavalier défend f6."] [%eval 0.63] }
12. g5 { [%txt "Le pion chasse le cavalier."] [%eval 0.46] }
12... Nh5 { [%txt "Le cavalier va en h5."] [%eval 0.63] }
(12... Ne8 { [%txt "Le cavalier recule en e8 et laisse f4 à notre pion : l'évaluation passe de +0.46 à +2.41."] [%hint "les Noirs reculent le cavalier en e8, d'où il ne contrôle plus f4."] [%hint "la case f4. Notre pion y avance et ouvre la colonne f."] [%hint "13.f4 : le levier contre e5."] [%hintcsl Gf4,Re5] [%eval 2.41] }
  13. f4 { [%txt "Le pion attaque e5."] [%eval 2.54] }
  13... exf4 { [%txt "Les Noirs prennent."] [%eval 2.55] }
  14. Bxf4 { [%txt "Le fou reprend. À RETENIR.

PRO TIP : +2.56. La colonne f et la case d5 sont à nous. Contre un cavalier qui recule en e8, f4 ouvre le jeu."] [%eval 2.56] [%cal Gf1f7] })
13. Kb1 { [%txt "Le roi se met à l'abri.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.57).
1. Nd5 : le cavalier échange le fou e6 ou s'installe.
2. Rg1 et h4 : l'attaque continue à l'aile roi.
3. Na5 : le cavalier vise b7 et c6."] [%eval 0.57] [%cal Gc3d5] } *`,
    ),
    chapter(
      "Anti-panique : 2...Nf6, 2...g6 et les ordres de coups",
      `{ [%txt "ANTI-PANIQUE.

Après 2.Nf3, les Noirs ont d'autres coups. Pas de panique : contre 2...Nf6, on chasse le cavalier par 3.e5 ; contre 2...g6, 3.d4 et on transpose au Maroczy du chapitre 4.

PRO TIP : contre un coup rare, cherche d'abord le gain de temps sur une pièce noire avancée."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... c5 { [%txt "La Sicilienne."] [%eval 0.27] }
2. Nf3 { [%txt "Vers d4."] [%eval 0.30] }
2... Nf6 { [%txt "LA NIMZOWITSCH : le cavalier attaque e4."] [%eval 0.68] }
(2... g6 { [%txt "Le fianchetto immédiat."] [%eval 0.49] }
  3. d4 { [%txt "Ouverture."] [%eval 0.32] }
  3... cxd4 { [%txt "Échange."] [%eval 0.28] }
  4. Nxd4 { [%txt "Reprise."] [%eval 0.47] }
  4... Nc6 { [%txt "Le cavalier vise d4 : c'est le dragon accéléré par un autre ordre."] [%eval 0.40] }
  5. c4 { [%txt "À RETENIR.

PRO TIP : +0.54. Même position qu'au chapitre 4 : l'étau de Maroczy. Un ordre de coups différent ne change pas le plan."] [%eval 0.54] [%csl Gc4,Ge4] })
3. e5 { [%txt "Le pion chasse le cavalier."] [%eval 0.72] [%cal Ge5f6] }
3... Nd5 { [%txt "Le cavalier se centralise."] [%eval 0.67] }
4. Nc3 { [%txt "On propose l'échange du cavalier d5."] [%eval 0.65] }
4... e6 { [%txt "Les Noirs soutiennent d5."] [%eval 0.79] }
(4... Nc7 { [%txt "Le cavalier recule en c7, où il bloque tout : l'évaluation passe de +0.65 à +1.45."] [%hint "les Noirs reculent le cavalier sur une case passive."] [%hint "la case d4. Notre pion d y avance et ouvre le jeu pour nos pièces."] [%hint "5.d4 : le centre."] [%hintcsl Gd4,Rc7] [%eval 1.45] }
  5. d4 { [%txt "Le pion attaque c5."] [%eval 1.45] }
  5... cxd4 { [%txt "Les Noirs échangent."] [%eval 1.26] }
  6. Qxd4 { [%txt "La dame reprend au centre."] [%eval 1.13] }
  6... Nc6 { [%txt "À RETENIR.

PRO TIP : +1.06. Notre pion e5 prend l'espace et la dame domine. Contre ...Nc7, le pion d4 ouvre le jeu."] [%eval 1.06] [%csl Ge5] })
5. Nxd5 { [%txt "On échange le cavalier."] [%eval 0.71] }
5... exd5 { [%txt "Les Noirs reprennent : pion d5 isolé à venir."] [%eval 0.65] }
6. d4 { [%txt "Le pion attaque c5."] [%eval 0.63] }
6... Nc6 { [%txt "Développement."] [%eval 0.75] }
7. dxc5 { [%txt "On prend c5."] [%eval 0.70] }
7... Bxc5 { [%txt "Le fou reprend et vise f2."] [%eval 0.67] }
(7... Qa5+ { [%txt "Un échec qui ne règle pas d5 : l'évaluation passe de +0.70 à +2.03."] [%hint "les Noirs donnent un échec sans défendre le pion d5."] [%hint "la case c3. Notre pion y pare l'échec et la dame noire n'a rien gagné."] [%hint "8.c3 : on pare, puis Be3 garde c5."] [%hintcsl Gc3,Rd5] [%eval 2.03] }
  8. c3 { [%txt "On pare l'échec."] [%eval 1.93] }
  8... Qxc5 { [%txt "La dame reprend c5."] [%eval 1.97] }
  9. Be3 { [%txt "À RETENIR.

PRO TIP : +2.03. Le fou chasse la dame avec gain de temps, et d5 tombera. Contre un échec sans suite, pare par un pion et développe avec menace."] [%eval 2.03] [%cal Ge3c5] })
8. Qxd5 { [%txt "On prend d5."] [%eval 0.53] }
8... Qb6 { [%txt "La dame attaque f2 avec le fou."] [%eval 0.47] }
(8... Qe7 { [%txt "La dame vise e5, mais elle bloque le fou f8 et laisse g5 libre : l'évaluation passe de +0.53 à +2.57."] [%hint "les Noirs mettent la dame devant leur roi, sur la diagonale de notre fou c1."] [%hint "la case g5. Notre fou y attaque la dame."] [%hint "9.Bg5 : gain de temps sur la dame."] [%hintcsl Gg5,Re7] [%eval 2.57] }
  9. Bg5 { [%txt "Le fou attaque la dame."] [%eval 2.44] }
  9... f6 { [%txt "Les Noirs bloquent."] [%eval 2.84] }
  10. Bh4 { [%txt "À RETENIR.

PRO TIP : +3.16. Un pion de plus et le pion f6 affaiblit e6. Contre une dame noire en e7 avec le roi en e8, Bg5 est le coup qui gagne du temps."] [%eval 3.16] [%cal Gh4f6] })
9. Bc4 { [%txt "Le fou se développe et vise f7."] [%eval 0.46] }
(9. Bd3 { [%txt "LA VARIANTE PIÉGÉE : le fou se développe vers le roque noir…"] [%eval -0.20] [%csl Rd3] }
  9... Nb4 { [%txt "…mais le cavalier attaque le fou et menace ...Nxd3+…"] [%eval -0.32] }
  10. Qe4 { [%txt "…la dame défend…"] [%eval -0.26] }
  10... Bxf2+ { [%txt "…et le fou prend f2 avec échec : notre roi est pris dans le filet. À RETENIR.

PRO TIP : -0.27. Après 8...Qb6, f2 est attaqué deux fois : 9.Bc4 garde la case e2 pour le roi et vise f7 ; en d3, le fou devient une cible pour ...Nb4."] [%eval -0.27] [%csl Rf2] })
9... Bxf2+ { [%txt "Les Noirs prennent f2 avec échec."] [%eval 0.47] }
10. Ke2 { [%txt "Le roi monte : il défend f2 et f3."] [%eval 0.52] }
10... O-O { [%txt "Les Noirs roquent."] [%eval 0.48] }
11. Rf1 { [%txt "La tour attaque le fou f2.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.55).
1. Rxf2 si les Noirs ne sauvent pas le fou : une pièce de plus.
2. Kd1 puis Kc1 : le roi revient à l'abri.
3. Qd3 et Bd2 : on finit le développement."] [%eval 0.55] [%cal Gf1f2] } *`,
    ),
  ],
};
