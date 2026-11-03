import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours d'ouverture « Française, Avance et 2.Nf3 (avec les Blancs) » —
 * onglet Ouvertures, format « un commentaire par coup » de l'Académie, lu par
 * `CourseTreeViewer` (route `/ouvertures/french-white/cours`). Public visé :
 * 1500-1800 Elo, répertoire 1.e4 contre 1...e6 (fiche curatée
 * `french-white`, C00). Ne remplace pas `french-defense` (fiche côté Noirs,
 * sans cours).
 *
 * ## Contenu (v2 du 2026-11-03, format Ruy Lopez v2, côté Blancs)
 *
 * 1. Fiche d'identité, tronc commun et l'Avance 5...Qb6 6.a3 Nh6 7.b4.
 * 2. Aléatoire surprise 1 : après 6...Nh6, la case c5.
 * 3. Branche B : 6...c4, la chaîne bloquée (levier b4/b3).
 * 4. Branche C : 5...Bd7 et la manœuvre Na3-c2.
 * 5. Branche D : 2.Nf3 d5 3.Nc3, les Deux Cavaliers (3...Nf6, 3...d4, 3...dxe4).
 * 6. Aléatoire surprise 2 : après les Deux Cavaliers, le cavalier en c7.
 * 7. Branche E : 4...Qb6 et l'échange du mauvais fou (...Bd7-b5).
 * 8. Anti-panique : 2...c5 (3.d5), 2...b6.
 *
 * Choix des chapitres (2026-11-03, sans base de parties) : la théorie
 * principale de l'Avance (5...Qb6 avec 6...Nh6 ou 6...c4, 5...Bd7, 4...Qb6)
 * et l'ordre 2.Nf3 demandé par l'utilisateur ; aucun autre cours côté Blancs
 * ne traite 1...e6. Les branches théoriques s'arrêtent au plus tard au
 * demi-coup 27 ; les chapitres « Aléatoire surprise » prolongent avec les
 * Noirs comme camp « mou » (`_tmp-drift.mts`).
 *
 * Convention côté Blancs (comme `op-ruy-lopez.ts`) : l'élève joue les
 * Blancs ; les fautes sont des coups NOIRS qui portent les 3 indices
 * `[%hint]` + `[%hintcsl]`, le coup blanc suivant est la punition. Les
 * « variantes piégées » sont des coups blancs tentants mais mauvais (6.Nbd2,
 * 7.b4 contre ...c4, 8.Nxd4, 6.b4, 3.dxc5…). Une faute qui perd moins de
 * 0.5 devient une « imprécision » sans indices.
 *
 * Sources : théorie établie de l'Avance et des Deux Cavaliers, TOUTES les
 * lignes arbitrées par Stockfish 19 natif (profondeur 16, MultiPV 1) ;
 * quelques coups sont des choix du moteur peu usuels en club (12.Kh1 au
 * chapitre 1, 9.Qd1 au chapitre 7). Toute la prose est originale.
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
 * `scripts/opening-course-src/french-white.pgn` (et l'en-tête
 * `french-white.header.txt`) ; regénérer avec
 * `node --import tsx scripts/_tmp-build-opening-course.mts <source> <en-tête> <sortie> 16`
 * (Stockfish natif, voir `scripts/_tmp-sf-native.mts` ; sous Linux,
 * `SF_BIN=<chemin du binaire>`). Les `[%eval]` viennent du moteur, pas de la
 * main. Étape standard : `scripts/_tmp-check-cited-evals.mts op-french-white`
 * doit sortir 0 écart (un chiffre n'est cité dans un commentaire que s'il est
 * l'éval d'un nœud). Règles de l'utilisateur : SAN en texte brut uniquement
 * (jamais de figurine Unicode), pas de guillemet droit dans un `[%txt]`.
 */

function chapter(title: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, START) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const OP_FRENCH_WHITE: CourseTree = {
  chapters: [
    chapter(
      "Fiche d'identité, tronc commun et l'Avance 5...Qb6 6.a3 Nh6",
      `{ [%txt "LA FRANÇAISE, AVEC LES BLANCS : L'AVANCE ET 2.Nf3.

Le vrai enjeu : contre 1...e6 et 2...d5, on pousse 3.e5. Le pion e5 prend l'espace à l'aile roi et enferme le fou c8 noir derrière e6. Les Noirs attaquent la base de notre chaîne, d4, avec ...c5, ...Nc6, ...Qb6 et ...Nf5 : tout notre jeu consiste à tenir d4, puis à prendre l'espace à l'aile dame (a3, b4).

Le déséquilibre recherché : de l'espace et une chaîne d4-e5 contre une position noire solide mais à l'étroit. Le fou c8 noir est leur problème : s'ils l'échangent (...Bd7-b5, chapitre 7), ils respirent.

Pourquoi ces chapitres : pas de base de parties ici, donc le choix suit la théorie principale de l'Avance (5...Qb6 avec 6...Nh6 ou 6...c4, 5...Bd7, 4...Qb6) et de l'ordre 2.Nf3 (3.Nc3, les Deux Cavaliers), plus les coups rares 2...c5 et 2...b6. Aucun autre cours de Blancs ne traite la Française.

Les structures types :
- Avance (chapitres 1 à 4 et 7) : chaîne blanche c3-d4-e5 ou d4-e5 après ...cxd4 ; pions noirs d5-e6, colonne c ouverte.
- 2.Nf3 et 3.Nc3 : le centre s'ouvre (dxc5, exf6), jeu de pièces actif.

Règle d'or : chaque coup a un rôle précis ; contre chaque coup noir, demande-toi d'abord ce qu'il fait contre d4."] [%eval 0.34] }
1. e4 { [%txt "On occupe le centre."] [%eval 0.16] [%csl Ge4] }
1... e6 { [%txt "La Française : les Noirs préparent ...d5."] [%eval 0.27] }
2. d4 { [%txt "Le centre idéal, e4 et d4. (2.Nf3 : chapitres 5 et 6.)"] [%eval 0.31] [%csl Gd4,Ge4] }
2... d5 { [%txt "Les Noirs attaquent e4."] [%eval 0.34] }
3. e5 { [%txt "L'AVANCE : on gagne de l'espace, et le fou c8 noir est enfermé derrière e6."] [%eval 0.22] [%cal Ge5f6,Ge5d6] }
3... c5 { [%txt "Les Noirs attaquent la base de la chaîne."] [%eval 0.20] }
4. c3 { [%txt "On soutient d4 par un pion."] [%eval 0.21] [%cal Gc3d4] }
4... Nc6 { [%txt "Le cavalier attaque d4 une deuxième fois. (4...Qb6 tout de suite : chapitre 7.)"] [%eval 0.23] }
5. Nf3 { [%txt "Le cavalier défend d4 une deuxième fois."] [%eval 0.20] [%cal Gf3d4] }
5... Qb6 { [%txt "La dame attaque d4 une troisième fois et vise b2. (5...Bd7 : chapitre 4.)"] [%eval 0.30] }
6. a3 { [%txt "On prépare b4 : l'espace à l'aile dame, et la dame noire n'aura plus de case en b4."] [%eval 0.28] [%cal Gb2b4] }
(6. Nbd2 { [%txt "LA VARIANTE PIÉGÉE : un développement naturel…"] [%eval -0.41] [%csl Rc1] }
  6... cxd4 { [%txt "…les Noirs ouvrent la colonne c…"] [%eval -0.39] }
  7. cxd4 { [%txt "…on reprend…"] [%eval -0.41] }
  7... Nxd4 { [%txt "…et d4 tombe : après 8.Nxd4 Qxd4, la dame noire reprend. À RETENIR.

PRO TIP : -0.39, un pion de moins. Contre ...Qb6 et ...Nc6, d4 a besoin de la dame d1 : en d2, le cavalier lui coupe la colonne d. Sors-le par a3, ou joue d'abord a3 et b4."] [%eval -0.39] [%csl Rd4] })
6... Nh6 { [%txt "Le cavalier va vers f5, encore contre d4. (6...c4 : chapitre 3.)"] [%eval 0.21] }
7. b4 { [%txt "L'espace à l'aile dame : le pion c5 est attaqué."] [%eval 0.18] [%cal Gb4c5] }
7... cxd4 { [%txt "Les Noirs échangent au centre."] [%eval 0.19] }
(7... cxb4 { [%txt "Les Noirs prennent le pion b4 : l'évaluation passe de +0.18 à +1.64."] [%hint "les Noirs ouvrent l'aile dame alors que leur cavalier h6 est mal placé."] [%hint "le cavalier h6. Notre fou c1 le prend, et le roque noir est abîmé."] [%hint "8.Bxh6 gxh6 9.axb4 : on reprend le pion, structure noire brisée."] [%hintcsl Rh6,Gc1] [%eval 1.64] }
  8. Bxh6 { [%txt "On prend le cavalier."] [%eval 1.55] [%cal Gc1h6] }
  8... gxh6 { [%txt "Reprise forcée."] [%eval 1.56] }
  9. axb4 { [%txt "À RETENIR.

PRO TIP : +1.42. Pions h noirs doublés et isolés, plus d'abri pour le roi. Contre ...Nh6, pense toujours à Bxh6."] [%eval 1.42] [%csl Rh6] })
(7... c4 { [%txt "Les Noirs ferment l'aile dame : l'évaluation passe de +0.18 à +1.18."] [%hint "les Noirs bloquent le centre alors que b4 nous a donné l'espace à l'aile dame."] [%hint "le pion a. Avancé en a4 puis a5, il chasse la dame b6."] [%hint "8.a4 : le pion menace a5."] [%hintcsl Ga4,Rb6] [%eval 1.18] }
  8. a4 { [%txt "À RETENIR.

PRO TIP : +1.06. Le pion a menace a5, et la dame b6 n'a plus de bonne case. Une chaîne fermée à l'aile dame avec ...c4 se combat par a4-a5 et b5."] [%eval 1.06] [%cal Ga4a5] })
8. cxd4 { [%txt "On reprend : la colonne c s'ouvre, d4 reste défendu par la dame et le cavalier."] [%eval 0.19] }
8... Nf5 { [%txt "Le cavalier attaque d4 une deuxième fois."] [%eval 0.18] }
9. Bb2 { [%txt "Le fou défend d4."] [%eval 0.25] [%cal Gb2d4] }
9... Bd7 { [%txt "Les Noirs développent le fou et préparent ...Rc8."] [%eval 0.06] }
10. Be2 { [%txt "Le fou se développe et prépare le roque. Le fou en d3 laisserait d4 sans défense après ...Ncxd4."] [%eval -0.12] }
10... Rc8 { [%txt "La tour prend la colonne c ouverte."] [%eval -0.11] }
(10... Nfe7 { [%txt "Le cavalier recule sans raison : l'évaluation passe de -0.12 à +1.02."] [%hint "les Noirs retirent le cavalier qui attaquait d4 et perdent un temps."] [%hint "la case a4 et le cavalier c6. Notre cavalier c3 visera a4 et b5, et la dame b6 sera gênée."] [%hint "11.Nc3 : le cavalier se développe avec idées Na4 et Nb5."] [%hintcsl Ga4,Rb6] [%eval 1.02] }
  11. Nc3 { [%txt "On se développe."] [%eval 0.91] [%cal Gc3a4] }
  11... Na5 { [%txt "Le cavalier vise c4."] [%eval 0.91] }
  12. Nd2 { [%txt "À RETENIR.

PRO TIP : +1.05. Le cavalier d2 interdit c4, et notre avance de développement est nette. Un cavalier qui recule (f5-e7) rend le temps de l'attaque."] [%eval 1.05] [%cal Gd2c4] })
11. O-O { [%txt "On roque."] [%eval 0.05] }
11... h5 { [%txt "Les Noirs empêchent g4, qui chasserait le cavalier f5."] [%eval 0.01] }
12. Kh1 { [%txt "Le roi quitte la diagonale g1-a7, celle de la dame b6."] [%eval 0.09] [%cal Gh1g1] }
12... Na5 { [%txt "Le cavalier vise c4."] [%eval 0.08] }
13. Nbd2 { [%txt "Le cavalier contrôle c4.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.04).
1. Nb3 contre a5 et c5 : le cavalier défend d4 et va en c5.
2. Bd3 seulement quand d4 est solide : il échange le cavalier f5.
3. Rc1 : on conteste la colonne c ouverte."] [%eval 0.04] [%cal Gd2b3,Gb3c5] } *`,
    ),
    chapter(
      "Aléatoire surprise 1 : après l'Avance 6...Nh6, la case c5",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le chapitre 1 jusqu'à 13.Nbd2. La théorie s'arrête là. Les Noirs ne font pas de gaffe : ils jouent des coups d'attente pendant que notre cavalier s'installe en c5 et que la dame vient en a4. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case clé (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quelle case est devenue faible à l'aile dame ? 3. Quelle pièce blanche peut s'y installer ?"] [%eval 0.34] }
1. e4 { [%txt "Le centre."] [%eval 0.16] [%csl Ge4] }
1... e6 { [%txt "La Française."] [%eval 0.27] }
2. d4 { [%txt "Le centre idéal."] [%eval 0.31] }
2... d5 { [%txt "Contre e4."] [%eval 0.34] }
3. e5 { [%txt "L'Avance."] [%eval 0.22] [%cal Ge5f6] }
3... c5 { [%txt "Contre d4."] [%eval 0.20] }
4. c3 { [%txt "Soutien."] [%eval 0.21] }
4... Nc6 { [%txt "Contre d4."] [%eval 0.23] }
5. Nf3 { [%txt "Défense de d4."] [%eval 0.20] }
5... Qb6 { [%txt "Contre d4 et b2."] [%eval 0.30] }
6. a3 { [%txt "b4 suivra."] [%eval 0.28] }
6... Nh6 { [%txt "Vers f5."] [%eval 0.21] }
7. b4 { [%txt "L'espace."] [%eval 0.18] }
7... cxd4 { [%txt "Échange."] [%eval 0.19] }
8. cxd4 { [%txt "Reprise."] [%eval 0.19] }
8... Nf5 { [%txt "Contre d4."] [%eval 0.18] }
9. Bb2 { [%txt "Défense."] [%eval 0.25] }
9... Bd7 { [%txt "Développement."] [%eval 0.06] }
10. Be2 { [%txt "Développement."] [%eval -0.12] }
10... Rc8 { [%txt "La colonne c."] [%eval -0.11] }
11. O-O { [%txt "Roque."] [%eval 0.05] }
11... h5 { [%txt "Contre g4."] [%eval 0.01] }
12. Kh1 { [%txt "Hors de la diagonale."] [%eval 0.09] }
12... Na5 { [%txt "Vers c4."] [%eval 0.08] }
13. Nbd2 { [%txt "Fin de la théorie : c4 est contrôlé."] [%eval 0.04] }
13... Nc6 { [%txt "Le cavalier revient en c6 : il a perdu deux temps. L'évaluation passe de +0.04 à +0.67."] [%hint "les Noirs ramènent le cavalier en c6, deux coups pour rien."] [%hint "la case c5. Notre cavalier d2 peut y aller par b3, d'où il attaquera d7 et b7."] [%hint "14.Nb3 : le cavalier part vers c5."] [%hintcsl Gb3,Gc5] [%eval 0.67] }
14. Nb3 { [%txt "Le cavalier vise c5."] [%eval 0.57] [%cal Gb3c5] }
(14. Bd3 { [%txt "LA VARIANTE PIÉGÉE : le fou attaque le cavalier f5…"] [%eval -0.21] [%csl Rd4] }
  14... Ncxd4 { [%txt "…mais d4 n'a plus que deux défenseurs face à trois attaquants, et le pion tombe. À RETENIR.

PRO TIP : -0.23. Avant tout coup d'attaque, compte les attaquants de d4 : trois pièces noires (cavaliers c6 et f5, dame b6) contre deux défenseurs (cavalier f3, fou b2). 14.Nb3 ajoutait le troisième défenseur."] [%eval -0.23] })
14... a6 { [%txt "Un coup d'attente qui laisse c5 : l'évaluation passe de +0.57 à +1.36."] [%hint "les Noirs jouent un coup de pion sans contester la case c5."] [%hint "la case c5. Notre cavalier b3 y saute, et le fou d7 sera attaqué."] [%hint "15.Nc5 : le cavalier s'installe en c5."] [%hintcsl Gc5,Rd7] [%eval 1.36] }
15. Nc5 { [%txt "Le cavalier s'installe en c5."] [%eval 1.30] [%cal Gc5d7] }
15... Nd8 { [%txt "Le cavalier défend b7 et e6."] [%eval 1.58] }
16. Nxd7 { [%txt "On échange le fou d7, défenseur des cases blanches."] [%eval 1.50] }
16... Kxd7 { [%txt "Le roi reprend : il reste au centre."] [%eval 1.49] }
17. Rb1 { [%txt "La tour soutient b4 et prépare b5."] [%eval 1.41] [%cal Gb1b5] }
17... g6 { [%txt "Les Noirs protègent h5 et f5."] [%eval 1.35] }
18. Qa4+ { [%txt "Échec : la dame vise a6 et le roi d7."] [%eval 1.72] [%cal Ga4d7] }
18... Qc6 { [%txt "Les Noirs proposent l'échange, mais la dame quitte la défense de a6 : l'évaluation passe de +1.72 à +2.57."] [%hint "les Noirs interposent la dame au lieu du cavalier, et a6 reste faible."] [%hint "le pion a6. Notre pion b peut avancer en b5 et ouvrir la colonne b vers lui."] [%hint "19.b5 : le pion attaque a6 et la dame c6."] [%hintcsl Ra6,Gb5] [%eval 2.57] }
19. b5 { [%txt "Le pion attaque la dame et a6."] [%eval 2.72] [%cal Gb5c6,Gb5a6] }
19... Qc2 { [%txt "La dame s'échappe en c2."] [%eval 2.76] }
20. Qxc2 { [%txt "On échange les dames."] [%eval 2.74] }
20... Rxc2 { [%txt "La tour reprend."] [%eval 2.52] }
21. bxa6 { [%txt "On prend a6."] [%eval 2.61] }
21... bxa6 { [%txt "Les Noirs reprennent."] [%eval 2.55] }
22. Bxa6 { [%txt "À RETENIR.

PRO TIP : +2.57, un pion de plus et une colonne b ouverte pour notre tour. La leçon : dans l'Avance, la case c5 et l'aile dame sont à nous quand les Noirs ont fermé le centre."] [%eval 2.57] [%cal Gb1b7] } *`,
    ),
    chapter(
      "Branche B : 6...c4, la chaîne bloquée",
      `{ [%txt "L'AVANCE AVEC 6...c4.

Les Noirs ferment l'aile dame : plus de pression sur d4 par le pion c, mais un gain d'espace et la case b3 en vue (...Na5-b3). Notre plan : Nbd2 contrôle b3 et c4, Be2 et le roque, puis le levier b3 au bon moment et le jeu à l'aile roi (Nf1-g3, h4)."] [%eval 0.34] }
1. e4 { [%txt "Le centre."] [%eval 0.16] [%csl Ge4] }
1... e6 { [%txt "La Française."] [%eval 0.27] }
2. d4 { [%txt "Le centre idéal."] [%eval 0.31] }
2... d5 { [%txt "Contre e4."] [%eval 0.34] }
3. e5 { [%txt "L'Avance."] [%eval 0.22] [%cal Ge5f6] }
3... c5 { [%txt "Contre d4."] [%eval 0.20] }
4. c3 { [%txt "Soutien."] [%eval 0.21] }
4... Nc6 { [%txt "Contre d4."] [%eval 0.23] }
5. Nf3 { [%txt "Défense de d4."] [%eval 0.20] }
5... Qb6 { [%txt "Contre d4 et b2."] [%eval 0.30] }
6. a3 { [%txt "b4 en vue."] [%eval 0.28] }
6... c4 { [%txt "Les Noirs ferment l'aile dame."] [%eval 0.38] }
7. Nbd2 { [%txt "Le cavalier contrôle b3 et c4."] [%eval 0.37] [%cal Gd2b3,Gd2c4] }
(7. b4 { [%txt "LA VARIANTE PIÉGÉE : on veut gagner de l'espace…"] [%eval -0.84] [%csl Rb4] }
  7... cxb3 { [%txt "…mais le pion c4 prend en passant : la colonne c s'ouvre et c3 devient faible. À RETENIR.

PRO TIP : -0.79. Contre ...c4, b4 permet toujours la prise en passant : prépare plutôt Nbd2 et b3 au bon moment."] [%eval -0.79] })
7... Na5 { [%txt "Le cavalier vise b3."] [%eval 0.34] }
8. Be2 { [%txt "Le fou se développe."] [%eval 0.48] }
8... Ne7 { [%txt "Le cavalier vise f5."] [%eval 0.47] }
(8... Qd8 { [%txt "UNE IMPRÉCISION : la dame recule et lâche la pression sur b2 et d4. L'évaluation passe de +0.48 à +0.89 : pas encore une faute, mais le levier b4 devient possible."] [%eval 0.89] }
  9. b4 { [%txt "Le levier."] [%eval 0.87] [%cal Gb2b4] }
  9... cxb3 { [%txt "Prise en passant."] [%eval 0.84] }
  10. Nxb3 { [%txt "Le cavalier reprend."] [%eval 0.79] [%cal Gb3a5] }
  10... Ne7 { [%txt "Développement."] [%eval 0.99] }
  11. Nxa5 { [%txt "On échange."] [%eval 0.94] }
  11... Qxa5 { [%txt "La dame reprend."] [%eval 0.91] }
  12. Bd2 { [%txt "À RETENIR.

PRO TIP : +0.87. La chaîne noire a disparu et notre centre reste solide. Quand la dame quitte b6, b4 frappe la chaîne c4."] [%eval 0.87] [%cal Gd2a5] })
9. O-O { [%txt "On roque."] [%eval 0.04] }
9... Bd7 { [%txt "Développement."] [%eval 0.12] }
(9... h5 { [%txt "Un coup de pion qui affaiblit g5 : l'évaluation passe de +0.04 à +1.05."] [%hint "les Noirs poussent un pion de bord alors que leur roi est encore au centre."] [%hint "la case g5. Notre cavalier f3 y saute : il vise e6, f7 et h7."] [%hint "10.Ng5 : le cavalier s'installe sur la case affaiblie."] [%hintcsl Gg5] [%eval 1.05] }
  10. Ng5 { [%txt "Le cavalier s'installe en g5."] [%eval 1.01] [%cal Gf3g5] }
  10... g6 { [%txt "Les Noirs couvrent h5 et f5."] [%eval 1.09] }
  11. Rb1 { [%txt "À RETENIR.

PRO TIP : +1.03. Le cavalier g5 est intouchable, et b3 se prépare. Un pion h noir avancé donne la case g5 à nos cavaliers."] [%eval 1.03] [%cal Gb1b3] })
10. Rb1 { [%txt "La tour soutient b3 ou b4 plus tard."] [%eval 0.16] [%cal Gb1b4] }
10... Nf5 { [%txt "Le cavalier attaque d4."] [%eval 0.17] }
(10... Qd8 { [%txt "La dame recule encore : l'évaluation passe de +0.16 à +0.66."] [%hint "la dame quitte b6 alors que notre tour b1 prépare le levier."] [%hint "la case b4. Le pion b avance, la chaîne c4 tombe et la colonne b s'ouvre."] [%hint "11.b4 cxb3 12.Nxb3 : la colonne b s'ouvre."] [%hintcsl Gb4,Rc4] [%eval 0.66] }
  11. b4 { [%txt "Le levier."] [%eval 0.64] [%cal Gb2b4] }
  11... cxb3 { [%txt "Prise en passant."] [%eval 0.62] }
  12. Nxb3 { [%txt "Le cavalier reprend."] [%eval 0.66] }
  12... Nxb3 { [%txt "Les Noirs échangent."] [%eval 0.59] }
  13. Qxb3 { [%txt "À RETENIR.

PRO TIP : +0.82. La dame et la tour b1 visent b7. Le levier b4 n'attend qu'une chose : que la dame noire quitte b6."] [%eval 0.82] [%cal Gb3b7] })
11. Re1 { [%txt "La tour soutient e5 et libère f1 pour le cavalier."] [%eval 0.21] [%cal Ge1e5] }
11... h6 { [%txt "Les Noirs empêchent Ng5."] [%eval 0.23] }
12. Nf1 { [%txt "Le cavalier part vers g3 ou e3.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.18).
1. Ng3 : échange du cavalier f5, le meilleur défenseur noir.
2. Bd2 puis b3 : le levier ouvre la colonne b quand la dame noire bouge.
3. h4-h5 : l'espace à l'aile roi, où les Noirs n'ont pas de contre-jeu."] [%eval 0.18] [%cal Gf1g3] } *`,
    ),
    chapter(
      "Branche C : 5...Bd7 et la manœuvre Na3-c2",
      `{ [%txt "L'AVANCE AVEC 5...Bd7.

Les Noirs préparent ...Qb6 et ...Rc8 sans montrer leur plan. Notre réponse : Be2, puis Na3-c2, la route du cavalier b1 vers la défense de d4 quand le pion c3 a été échangé. Le cavalier c2 défend d4 et e3, et laisse la case d2 au fou."] [%eval 0.34] }
1. e4 { [%txt "Le centre."] [%eval 0.16] [%csl Ge4] }
1... e6 { [%txt "La Française."] [%eval 0.27] }
2. d4 { [%txt "Le centre idéal."] [%eval 0.31] }
2... d5 { [%txt "Contre e4."] [%eval 0.34] }
3. e5 { [%txt "L'Avance."] [%eval 0.22] [%cal Ge5f6] }
3... c5 { [%txt "Contre d4."] [%eval 0.20] }
4. c3 { [%txt "Soutien."] [%eval 0.21] }
4... Nc6 { [%txt "Contre d4."] [%eval 0.23] }
5. Nf3 { [%txt "Défense de d4."] [%eval 0.20] }
5... Bd7 { [%txt "Les Noirs gardent le choix."] [%eval 0.22] }
6. Be2 { [%txt "Le fou se développe et prépare le roque."] [%eval 0.26] }
6... Nge7 { [%txt "Le cavalier vise f5."] [%eval 0.30] }
7. Na3 { [%txt "Le cavalier part vers c2."] [%eval 0.18] [%cal Ga3c2] }
7... cxd4 { [%txt "Les Noirs échangent."] [%eval 0.19] }
(7... c4 { [%txt "Les Noirs ferment l'aile dame, mais le cavalier a3 vise c4 : l'évaluation passe de +0.18 à +0.92."] [%hint "les Noirs ferment la chaîne alors que notre cavalier a3 peut frapper c4."] [%hint "le pion c4. Le pion b avancé en b3 l'attaque, et la colonne b s'ouvrira."] [%hint "8.b3 : le levier contre c4."] [%hintcsl Rc4,Gb3] [%eval 0.92] }
  8. b3 { [%txt "Le levier contre c4."] [%eval 1.04] [%cal Gb3c4] }
  8... Qa5 { [%txt "La dame cloue le pion c3."] [%eval 1.06] }
  9. Nc2 { [%txt "À RETENIR.

PRO TIP : +0.91. Le pion c3 est défendu, et b4 suivra. Contre ...c4 avec un cavalier en a3, frappe la chaîne par b3."] [%eval 0.91] [%cal Gc2b4] })
8. cxd4 { [%txt "On reprend : le cavalier a3 ira en c2 défendre d4."] [%eval 0.22] }
(8. Nxd4 { [%txt "LA VARIANTE PIÉGÉE : le cavalier reprend au centre…"] [%eval -1.21] [%csl Re5] }
  8... Nxe5 { [%txt "…mais e5 n'est plus défendu par d4 : le pion tombe. À RETENIR.

PRO TIP : -1.25. Dans l'Avance, d4 est la base de e5 : reprends toujours avec le pion c."] [%eval -1.25] })
8... Nf5 { [%txt "Le cavalier attaque d4."] [%eval 0.18] }
9. Nc2 { [%txt "Le cavalier défend d4."] [%eval 0.13] [%cal Gc2d4] }
9... Qb6 { [%txt "La dame attaque d4 et b2."] [%eval 0.25] }
(9... Nfxd4 { [%txt "Les Noirs prennent d4, mais il était défendu deux fois : l'évaluation passe de +0.13 à +6.11."] [%hint "les Noirs prennent un pion que nos deux cavaliers défendent."] [%hint "le cavalier d4. Notre cavalier c2 le prend, et la pièce noire ne revient pas."] [%hint "10.Ncxd4 : on prend le cavalier."] [%hintcsl Rd4] [%eval 6.11] }
  10. Ncxd4 { [%txt "On prend le cavalier."] [%eval 6.03] [%cal Gc2d4] }
  10... Qa5+ { [%txt "Un échec pour récupérer quelque chose."] [%eval 6.12] }
  11. Bd2 { [%txt "À RETENIR.

PRO TIP : +6.10, une pièce de plus. Compte les défenseurs de d4 avant de croire qu'il tombe : le cavalier c2 est là pour ça."] [%eval 6.10] [%csl Gd4] })
10. O-O { [%txt "On roque."] [%eval 0.33] }
10... Rc8 { [%txt "La tour prend la colonne c.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.34).
1. Bd3 : échange du cavalier f5, le défenseur de d4 côté noir.
2. Kh1 et Rb1 : on protège b2 et on prépare b4.
3. Bd2-c3 : le fou rejoint la défense de d4."] [%eval 0.34] [%cal Gc2d4] }
(10... f6 { [%txt "Le levier ...f6, au mauvais moment : l'évaluation passe de +0.33 à +1.38."] [%hint "les Noirs ouvrent le jeu alors que leur roi est encore en e8."] [%hint "la diagonale b1-h7 et le cavalier f5. Notre fou d3 l'attaque, et la colonne e s'ouvrira vers le roi."] [%hint "11.Bd3 : le fou attaque le cavalier f5, puis exf6 ouvre la colonne e."] [%hintcsl Gd3,Rf5,Re8] [%eval 1.38] }
  11. Bd3 { [%txt "Le fou attaque le cavalier f5."] [%eval 1.40] [%cal Gd3f5] }
  11... Be7 { [%txt "Développement."] [%eval 1.33] }
  12. exf6 { [%txt "On ouvre le jeu."] [%eval 1.20] }
  12... Bxf6 { [%txt "Les Noirs reprennent."] [%eval 1.29] }
  13. Bxf5 { [%txt "On échange le cavalier."] [%eval 1.23] }
  13... exf5 { [%txt "Reprise."] [%eval 1.12] }
  14. Re1+ { [%txt "À RETENIR.

PRO TIP : +1.12. Le roi noir est au centre sur la colonne e ouverte. Contre ...f6 avant le roque, ouvre la colonne e."] [%eval 1.12] [%cal Ge1e8] }) *`,
    ),
    chapter(
      "Branche D : 2.Nf3 d5 3.Nc3, les Deux Cavaliers",
      `{ [%txt "L'ORDRE 2.Nf3 : LES DEUX CAVALIERS.

Avec 2.Nf3 puis 3.Nc3, on évite les longues lignes de l'Avance et on joue sur le développement. Contre 3...Nf6, 4.e5 Nfd7 5.d4 c5 6.dxc5 : le centre s'ouvre, et nos pièces sortent plus vite (Bf4, Bd3). Contre 3...d4, 4.Ne2 et la dame en a4."] [%eval 0.34] }
1. e4 { [%txt "Le centre."] [%eval 0.16] [%csl Ge4] }
1... e6 { [%txt "La Française."] [%eval 0.27] }
2. Nf3 { [%txt "Le cavalier d'abord : on garde le choix de d4."] [%eval 0.12] }
2... d5 { [%txt "Contre e4."] [%eval 0.14] }
3. Nc3 { [%txt "Le cavalier défend e4."] [%eval -0.02] [%cal Gc3e4] }
3... Nf6 { [%txt "Les Noirs attaquent e4 une deuxième fois."] [%eval 0.01] }
(3... d4 { [%txt "Les Noirs chassent le cavalier."] [%eval 0.01] }
  4. Ne2 { [%txt "Le cavalier recule vers g3 ou c3."] [%eval -0.05] }
  4... c5 { [%txt "Le pion soutient d4."] [%eval 0.04] }
  5. c3 { [%txt "On attaque la chaîne."] [%eval -0.04] [%cal Gc3d4] }
  5... Nc6 { [%txt "Développement."] [%eval 0.50] }
  6. cxd4 { [%txt "On prend."] [%eval 0.41] }
  6... cxd4 { [%txt "Les Noirs reprennent."] [%eval 0.40] }
  7. Qa4 { [%txt "La dame cloue le cavalier c6 et vise d4. À RETENIR.

PRO TIP : +0.41. Contre la chaîne ...d4, la dame en a4 et le cavalier e2 attaquent d4 deux fois."] [%eval 0.41] [%cal Ga4c6] }
  (7. d3 { [%txt "LA VARIANTE PIÉGÉE : on fixe le pion d4… À RETENIR.

PRO TIP : -0.83. Le centre noir reste solide et nos pièces sont passives. Joue 7.Qa4 avant d3."] [%eval -0.83] }))
(3... dxe4 { [%txt "Les Noirs rendent le centre."] [%eval 0.47] }
  4. Nxe4 { [%txt "À RETENIR.

PRO TIP : +0.44. On reprend au centre : d4 suivra, avec un pion central contre aucun."] [%eval 0.44] [%csl Ge4] })
4. e5 { [%txt "Le pion chasse le cavalier."] [%eval 0.07] [%cal Ge5f6] }
4... Nfd7 { [%txt "Le cavalier recule en d7."] [%eval 0.09] }
(4... Ng4 { [%txt "Le cavalier part au bord : l'évaluation passe de +0.07 à +1.18."] [%hint "le cavalier choisit g4, une case où il sera chassé tout de suite."] [%hint "le cavalier g4. Notre pion h le chasse avec gain de temps."] [%hint "5.h3 Nh6 6.d4 : le cavalier finit en h6."] [%hintcsl Rg4,Gh3] [%eval 1.18] }
  5. h3 { [%txt "Le pion chasse le cavalier."] [%eval 1.21] [%cal Gh3g4] }
  5... Nh6 { [%txt "Le cavalier recule au bord."] [%eval 1.13] }
  6. d4 { [%txt "À RETENIR.

PRO TIP : +1.18. Le cavalier h6 est hors jeu et notre centre est complet. Un cavalier chassé deux fois vaut un temps pour nous à chaque fois."] [%eval 1.18] [%csl Rh6] })
5. d4 { [%txt "On complète le centre."] [%eval 0.04] [%csl Gd4,Ge5] }
5... c5 { [%txt "Les Noirs attaquent d4."] [%eval 0.05] }
(5... Nb6 { [%txt "Le cavalier part en b6, loin du centre : l'évaluation passe de +0.04 à +1.26."] [%hint "le cavalier d7 s'éloigne au lieu de soutenir ...c5."] [%hint "la case e3 et le pion c5. Notre fou c1 se développe en e3 et surveille c5."] [%hint "6.Be3 : le fou se développe et contrôle c5."] [%hintcsl Ge3,Gc5] [%eval 1.26] }
  6. Be3 { [%txt "Le fou contrôle c5."] [%eval 0.99] [%cal Ge3c5] }
  6... c5 { [%txt "Les Noirs poussent quand même."] [%eval 0.95] }
  7. dxc5 { [%txt "À RETENIR.

PRO TIP : +0.95. On prend en c5 avec un fou déjà développé. Contre ...Nb6, Be3 empêche ...c5 de libérer le jeu noir."] [%eval 0.95] [%csl Gc5] })
6. dxc5 { [%txt "On ouvre le centre : nos pièces sont prêtes, celles des Noirs non."] [%eval -0.19] }
6... Nc6 { [%txt "Développement."] [%eval -0.07] }
7. Bf4 { [%txt "Le fou défend e5."] [%eval -0.08] [%cal Gf4e5] }
7... Bxc5 { [%txt "Les Noirs reprennent le pion."] [%eval -0.08] }
8. Bd3 { [%txt "Le fou vise h7."] [%eval -0.12] [%cal Gd3h7] }
8... f6 { [%txt "Les Noirs attaquent e5."] [%eval 0.09] }
9. exf6 { [%txt "On ouvre la colonne e."] [%eval 0.07] }
9... Qxf6 { [%txt "La dame reprend."] [%eval 0.25] }
(9... gxf6 { [%txt "La reprise du pion g ouvre le roque : l'évaluation passe de +0.07 à +0.90."] [%hint "les Noirs reprennent avec le pion g et affaiblissent leur roi."] [%hint "la colonne e et la case e6. Notre dame vient en e2, face au roi e8 et au pion e6."] [%hint "10.Qe2 : la dame vise e6 et le roi."] [%hintcsl Ge2,Re6] [%eval 0.90] }
  10. Qe2 { [%txt "À RETENIR.

PRO TIP : +0.69. Le pion e6 est faible et le roi noir n'a pas d'abri. Après ...gxf6, la colonne e et la diagonale b1-h7 sont nos lignes d'attaque."] [%eval 0.69] [%cal Ge2e6] })
10. Bg5 { [%txt "Le fou attaque la dame."] [%eval 0.11] [%cal Gg5f6] }
10... Qf7 { [%txt "La dame recule en f7, la seule bonne case."] [%eval 0.13] }
(10... Qf8 { [%txt "La dame recule en f8 : l'évaluation passe de +0.11 à +2.28."] [%hint "la dame noire bloque la case f8 et laisse le fou c5 et le pion d5 sans soutien."] [%hint "la colonne e et le pion d5. Notre dame vient en e2 contre e6, puis le cavalier c3 frappe d5."] [%hint "11.Qe2 Nf6 12.Bxf6 gxf6 13.Nxd5 : le pion d5 tombe."] [%hintcsl Ge2,Rd5] [%eval 2.28] }
  11. Qe2 { [%txt "La dame vise e6."] [%eval 2.25] [%cal Ge2e6] }
  11... Nf6 { [%txt "Les Noirs couvrent d5."] [%eval 2.41] }
  12. Bxf6 { [%txt "On supprime le défenseur."] [%eval 2.18] }
  12... gxf6 { [%txt "Reprise."] [%eval 2.19] }
  13. Nxd5 { [%txt "À RETENIR.

PRO TIP : +2.19. Le pion d5 tombe : nous avons un pion de plus. Supprime d'abord le défenseur, puis prends le pion."] [%eval 2.19] [%csl Gd5] })
11. O-O { [%txt "On roque.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.14).
1. Bh4 puis Bg3 : le fou garde la diagonale contre ...e5.
2. Re1 et Qe2 : la colonne e contre le pion e6.
3. Nb5-d4 : le cavalier s'installe en d4, devant le pion isolé e6."] [%eval 0.14] [%cal Gf1e1] } *`,
    ),
    chapter(
      "Aléatoire surprise 2 : après les Deux Cavaliers, le cavalier en c7",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le chapitre 5 jusqu'à 11.O-O. La théorie s'arrête là. Les Noirs ne font pas de gaffe nette : ils sortent leur dame trop loin et laissent la case c7 à notre cavalier. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case clé (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quelle case de la 7e rangée n'est plus défendue ? 3. Quel cavalier peut y sauter avec fourchette ?"] [%eval 0.34] }
1. e4 { [%txt "Le centre."] [%eval 0.16] [%csl Ge4] }
1... e6 { [%txt "La Française."] [%eval 0.27] }
2. Nf3 { [%txt "Le cavalier d'abord."] [%eval 0.12] }
2... d5 { [%txt "Contre e4."] [%eval 0.14] }
3. Nc3 { [%txt "Défense de e4."] [%eval -0.02] }
3... Nf6 { [%txt "Contre e4."] [%eval 0.01] }
4. e5 { [%txt "Le pion chasse."] [%eval 0.07] }
4... Nfd7 { [%txt "Recul."] [%eval 0.09] }
5. d4 { [%txt "Le centre."] [%eval 0.04] }
5... c5 { [%txt "Contre d4."] [%eval 0.05] }
6. dxc5 { [%txt "On ouvre."] [%eval -0.19] }
6... Nc6 { [%txt "Développement."] [%eval -0.07] }
7. Bf4 { [%txt "Défense de e5."] [%eval -0.08] }
7... Bxc5 { [%txt "Reprise."] [%eval -0.08] }
8. Bd3 { [%txt "Contre h7."] [%eval -0.12] }
8... f6 { [%txt "Contre e5."] [%eval 0.09] }
9. exf6 { [%txt "Ouverture."] [%eval 0.07] }
9... Qxf6 { [%txt "Reprise."] [%eval 0.25] }
10. Bg5 { [%txt "Contre la dame."] [%eval 0.11] }
10... Qf7 { [%txt "Recul."] [%eval 0.13] }
11. O-O { [%txt "Fin de la théorie : roque."] [%eval 0.14] }
11... O-O { [%txt "Les Noirs roquent."] [%eval 0.20] }
12. Bh4 { [%txt "Le fou garde la diagonale."] [%eval 0.20] }
12... Be7 { [%txt "Les Noirs proposent l'échange."] [%eval 0.27] }
13. Bxe7 { [%txt "On échange."] [%eval 0.29] }
13... Qxe7 { [%txt "La dame reprend."] [%eval 0.31] }
14. Re1 { [%txt "La tour vise e6."] [%eval 0.18] [%cal Ge1e6] }
14... Qc5 { [%txt "La dame part en c5, loin de son roi et de la case c7 : l'évaluation passe de +0.18 à +0.79."] [%hint "la dame noire quitte la défense de c7 et de e6 pour une case sans cible."] [%hint "la case b5. Notre cavalier c3 y saute et vise c7 et d6."] [%hint "15.Nb5 : le cavalier vise c7."] [%hintcsl Gb5,Rc7] [%eval 0.79] }
15. Nb5 { [%txt "Le cavalier vise c7 et d6."] [%eval 1.14] [%cal Gb5c7] }
15... Nf6 { [%txt "UNE IMPRÉCISION : le cavalier se développe, mais la case c7 reste sans défense. L'évaluation passe de +1.14 à +1.53 : cherche le coup qui attaque deux pièces."] [%eval 1.53] }
16. Nc7 { [%txt "La fourchette : a8 et e6."] [%eval 1.94] [%cal Gc7a8,Gc7e6] }
(16. Ng5 { [%txt "LA VARIANTE PIÉGÉE : le cavalier vise e6 et h7…  À RETENIR.

PRO TIP : -0.95. Le cavalier g5 se fait chasser par ...h6 et l'avantage disparaît. La fourchette Nc7 gagnait du matériel tout de suite : cherche d'abord les coups qui attaquent deux pièces."] [%eval -0.95] [%csl Rg5] })
16... e5 { [%txt "Les Noirs sauvent le pion e6, mais la tour a8 reste en prise : l'évaluation passe de +1.94 à +2.81."] [%hint "les Noirs défendent un pion et oublient la tour a8."] [%hint "la tour a8. Notre cavalier c7 la prend."] [%hint "17.Nxa8 : on gagne la qualité."] [%hintcsl Ra8] [%eval 2.81] }
17. Nxa8 { [%txt "On prend la tour : la qualité de plus."] [%eval 3.09] [%csl Ga8] }
17... Ng4 { [%txt "Le cavalier attaque f2 et h2."] [%eval 4.07] }
18. Qd2 { [%txt "La dame défend f2 et la deuxième rangée."] [%eval 4.88] }
18... Qe7 { [%txt "La dame recule, mais le cavalier g4 reste sans soutien : l'évaluation passe de +4.88 à +6.07."] [%hint "les Noirs jouent un coup de dame au lieu de pousser ...e4, le seul contre-jeu."] [%hint "le cavalier g4. Notre pion h le chasse, et il n'a pas de bonne case de retraite."] [%hint "19.h3 : le pion chasse le cavalier."] [%hintcsl Rg4,Gh3] [%eval 6.07] }
19. h3 { [%txt "Le pion chasse le cavalier."] [%eval 6.00] [%cal Gh3g4] }
19... Nh6 { [%txt "Le cavalier recule au bord, loin de e5 : l'évaluation passe de +6.00 à +6.92."] [%hint "le cavalier part en h6, d'où il ne défend plus rien au centre."] [%hint "le cavalier c6, dernier défenseur de e5. Notre fou peut l'attaquer depuis b5."] [%hint "20.Bb5 : le fou attaque le défenseur de e5."] [%hintcsl Rc6,Re5,Gb5] [%eval 6.92] }
20. Bb5 { [%txt "À RETENIR.

PRO TIP : +7.11, avantage décisif. Le fou menace Bxc6 puis Nxe5. La leçon : contre la Française ouverte, la case c7 est souvent la faiblesse noire ; une dame partie en c5 ne la défend plus, et chaque pièce noire qui recule au bord nous donne un temps."] [%eval 7.11] [%cal Gb5c6,Gf3e5] } *`,
    ),
    chapter(
      "Branche E : 4...Qb6 et l'échange du mauvais fou (...Bd7-b5)",
      `{ [%txt "L'AVANCE AVEC 4...Qb6 ET ...Bd7-b5.

Les Noirs veulent échanger leur fou c8, enfermé derrière e6, contre notre fou f1. Le plan : ...Qb6, ...Bd7 et ...Bb5. On accepte l'échange, mais on garde les dames si possible (9.Qd1) : sans son mauvais fou, la position noire reste un peu passive, et notre espace demeure."] [%eval 0.34] }
1. e4 { [%txt "Le centre."] [%eval 0.16] [%csl Ge4] }
1... e6 { [%txt "La Française."] [%eval 0.27] }
2. d4 { [%txt "Le centre idéal."] [%eval 0.31] }
2... d5 { [%txt "Contre e4."] [%eval 0.34] }
3. e5 { [%txt "L'Avance."] [%eval 0.22] [%cal Ge5f6] }
3... c5 { [%txt "Contre d4."] [%eval 0.20] }
4. c3 { [%txt "Soutien."] [%eval 0.21] }
4... Qb6 { [%txt "La dame attaque d4 et b2 tout de suite."] [%eval 0.31] }
5. Nf3 { [%txt "Défense de d4."] [%eval 0.20] }
5... Bd7 { [%txt "Le fou prépare ...Bb5."] [%eval 0.34] }
6. Be2 { [%txt "Le fou se développe."] [%eval 0.34] }
(6. b4 { [%txt "LA VARIANTE PIÉGÉE : on prend l'espace à l'aile dame…"] [%eval -0.70] [%csl Rb4] }
  6... cxb4 { [%txt "…mais le pion b4 tombe et c3 devient faible. À RETENIR.

PRO TIP : -0.78. Sans a3, b4 n'est pas soutenu : prépare toujours la poussée."] [%eval -0.78] })
6... Bb5 { [%txt "Les Noirs proposent l'échange des fous."] [%eval 0.45] }
7. O-O { [%txt "On roque : l'échange se fera en e2."] [%eval 0.25] }
7... Bxe2 { [%txt "Les Noirs échangent."] [%eval 0.19] }
(7... Ne7 { [%txt "Les Noirs retardent l'échange : l'évaluation passe de +0.25 à +1.09."] [%hint "les Noirs laissent leur fou b5 face au nôtre sans l'échanger."] [%hint "le fou b5. Notre fou e2 le prend avec échec, et la dame noire doit reprendre."] [%hint "8.Bxb5+ Qxb5 9.Na3 : le cavalier attaque la dame."] [%hintcsl Rb5] [%eval 1.09] }
  8. Bxb5+ { [%txt "On échange avec échec."] [%eval 1.03] [%cal Ge2b5] }
  8... Qxb5 { [%txt "La dame reprend."] [%eval 1.01] }
  9. Na3 { [%txt "À RETENIR.

PRO TIP : +1.03. Le cavalier attaque la dame avec gain de temps, et b5 lui offre une route vers d6. Quand l'adversaire hésite, échange au moment qui te donne un temps."] [%eval 1.03] [%cal Ga3b5] })
8. Qxe2 { [%txt "La dame reprend."] [%eval 0.20] }
8... Qa6 { [%txt "Les Noirs proposent l'échange des dames."] [%eval 0.45] }
(8... c4 { [%txt "Les Noirs ferment l'aile dame : l'évaluation passe de +0.20 à +1.12."] [%hint "les Noirs bloquent la chaîne alors que leur dame est en b6, devant le levier b3."] [%hint "le pion c4. Le pion b3 l'attaque et ouvre la colonne a ou b vers la dame noire."] [%hint "9.b3 : le levier contre c4."] [%hintcsl Rc4,Gb3] [%eval 1.12] }
  9. b3 { [%txt "Le levier."] [%eval 0.78] [%cal Gb3c4] }
  9... cxb3 { [%txt "Les Noirs prennent."] [%eval 0.89] }
  10. axb3 { [%txt "À RETENIR.

PRO TIP : +1.25. La colonne a s'ouvre pour notre tour, et si 10...Qxb3, alors 11.Ba3 empêche le roque. Contre ...c4, b3."] [%eval 1.25] [%cal Ga1a7] })
9. Qd1 { [%txt "On garde les dames : sans elles, les Noirs seraient soulagés."] [%eval 0.46] }
9... cxd4 { [%txt "Les Noirs échangent au centre."] [%eval 0.46] }
(9... Nc6 { [%txt "Le développement naturel, qui oublie c5 : l'évaluation passe de +0.46 à +1.51."] [%hint "les Noirs développent le cavalier sans régler la tension en c5."] [%hint "le pion c5. On le prend, et notre pion b avancera avec gain de temps."] [%hint "10.dxc5 Bxc5 11.b4 : le fou est chassé."] [%hintcsl Rc5,Gb4] [%eval 1.51] }
  10. dxc5 { [%txt "On prend en c5."] [%eval 1.54] [%cal Gd4c5] }
  10... Bxc5 { [%txt "Les Noirs reprennent."] [%eval 1.24] }
  11. b4 { [%txt "À RETENIR.

PRO TIP : +1.20. Le fou est chassé, et notre aile dame avance avec gain de temps. Quand le pion c5 n'est pas soutenu, dxc5 puis b4."] [%eval 1.20] [%cal Gb4c5] })
10. cxd4 { [%txt "On reprend : la chaîne d4-e5 est complète."] [%eval 0.40] }
10... Nc6 { [%txt "Le cavalier attaque d4."] [%eval 0.40] }
11. Nc3 { [%txt "Développement."] [%eval 0.46] }
11... Nge7 { [%txt "Le cavalier vise f5."] [%eval 0.51] }
12. Ne2 { [%txt "Le cavalier défend d4 et prépare Ng3 contre le cavalier f5.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.50).
1. Ng3 : le cavalier contrôle f5 et h5.
2. h4-h5 : l'espace à l'aile roi.
3. Bd2 et Rc1 : on conteste la colonne c."] [%eval 0.50] [%cal Ge2g3] } *`,
    ),
    chapter(
      "Anti-panique : 2...c5, 2...b6 et les coups rares",
      `{ [%txt "ANTI-PANIQUE : LES COUPS RARES.

Après 1.e4 e6 2.d4, certains joueurs évitent 2...d5. Contre 2...c5, on avance 3.d5 : l'espace au centre, et le pion d5 gêne tout le camp noir. Contre 2...b6, le développement simple (Bd3, Nf3, c3) suffit. Dans chaque cas, une erreur noire fréquente et la réponse qui la punit."] [%eval 0.34] }
1. e4 { [%txt "Le centre."] [%eval 0.16] [%csl Ge4] }
1... e6 { [%txt "La Française."] [%eval 0.27] }
2. d4 { [%txt "Le centre idéal."] [%eval 0.31] }
2... c5 { [%txt "Les Noirs attaquent d4 tout de suite."] [%eval 0.68] }
(2... b6 { [%txt "Le fianchetto de la dame."] [%eval 0.94] }
  3. Bd3 { [%txt "Le fou défend e4."] [%eval 0.97] [%cal Gd3e4] }
  3... Bb7 { [%txt "Le fou vise e4."] [%eval 1.01] }
  4. Nf3 { [%txt "Développement."] [%eval 1.03] }
  4... f5 { [%txt "Les Noirs attaquent e4 avec le pion f : l'évaluation passe de +1.03 à +3.60."] [%hint "les Noirs poussent le pion f et ouvrent la diagonale de leur roi."] [%hint "le pion f5. Notre pion e4 le prend, et la diagonale d3-h7 s'ouvre vers le roi."] [%hint "5.exf5 exf5 6.O-O : le roi noir reste exposé."] [%hintcsl Rf5,Gh7] [%eval 3.60] }
  5. exf5 { [%txt "On prend."] [%eval 3.91] }
  5... exf5 { [%txt "Les Noirs reprennent."] [%eval 3.90] }
  6. O-O { [%txt "À RETENIR.

PRO TIP : +3.74. Le roi noir est au centre, sur la colonne e ouverte. Contre ...f5 sans développement, prends et roque."] [%eval 3.74] [%cal Gf1e1] })
3. d5 { [%txt "On avance : l'espace au centre."] [%eval 0.70] [%cal Gd5e6] }
(3. dxc5 { [%txt "LA VARIANTE PIÉGÉE : on gagne un pion…"] [%eval 0.17] [%csl Rc5] }
  3... Bxc5 { [%txt "…mais le fou reprend avec gain de temps et vise f2. À RETENIR.

PRO TIP : +0.10. Prendre en c5 développe le fou noir : 3.d5 garde l'avantage d'espace."] [%eval 0.10] })
3... exd5 { [%txt "Les Noirs échangent."] [%eval 0.83] }
(3... Qb6 { [%txt "La dame sort trop tôt : l'évaluation passe de +0.70 à +1.49."] [%hint "la dame noire sort avant les pièces légères."] [%hint "le développement. Notre cavalier g1 sort avec menace sur la case d5."] [%hint "4.Nf3 : on se développe, Nc3 suivra."] [%hintcsl Gf3,Gc3] [%eval 1.49] }
  4. Nf3 { [%txt "À RETENIR.

PRO TIP : +1.73. On se développe : Nc3 suivra, et la dame b6 sera chassée. Contre une dame sortie tôt, développe avec menace."] [%eval 1.73] [%cal Gb1c3] })
4. exd5 { [%txt "On reprend : le pion d5 coupe le camp noir en deux."] [%eval 0.83] [%csl Gd5] }
4... d6 { [%txt "Les Noirs bloquent le pion."] [%eval 0.83] }
(4... Qe7+ { [%txt "Un échec sans suite : l'évaluation passe de +0.83 à +1.55."] [%hint "la dame noire donne un échec qui bloque son propre fou f8."] [%hint "la case e2. Notre fou s'y interpose en se développant."] [%hint "5.Be2 : on s'interpose en développant."] [%hintcsl Ge2,Rf8] [%eval 1.55] }
  5. Be2 { [%txt "À RETENIR.

PRO TIP : +1.49. Le fou f8 noir est enfermé derrière la dame. Contre un échec qui bloque une pièce, interpose en te développant."] [%eval 1.49] [%csl Rf8] })
5. Nc3 { [%txt "Développement."] [%eval 0.69] }
5... Nf6 { [%txt "Développement."] [%eval 0.70] }
6. Nf3 { [%txt "Développement."] [%eval 0.59] }
6... Be7 { [%txt "Développement."] [%eval 0.53] }
7. Bd3 { [%txt "Le fou vise h7."] [%eval 0.47] [%cal Gd3h7] }
7... O-O { [%txt "Les Noirs roquent."] [%eval 0.44] }
8. O-O { [%txt "On roque.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.52).
1. Re1 et Bf4 : nos pièces visent d6, le pion arriéré.
2. a4 : on empêche ...b5, le seul contre-jeu noir.
3. Nd2-c4 : le cavalier attaque d6."] [%eval 0.52] [%cal Gf1e1] } *`,
    ),
  ],
};
