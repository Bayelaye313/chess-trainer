import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours d'ouverture « Gambit Dame Refusé (avec les Noirs) » — onglet
 * Ouvertures, format « un commentaire par coup » de l'Académie, lu par
 * `CourseTreeViewer` (route `/ouvertures/queens-gambit-declined/cours`).
 * Public visé : 1500-1800 Elo, répertoire contre 1.d4 d5 2.c4 e6 3.Nc3 Nf6
 * (atteint aussi par l'ordre de l'utilisateur 1.d4 Nf6 2.c4 e6 3.Nc3 d5).
 *
 * ## Contenu (v2 du 2026-10-19, format Ruy Lopez v2, côté Noirs)
 *
 * 1. Fiche d'identité, tronc commun et l'Orthodoxe Lasker (4.Bg5 ... 7...Ne4).
 * 2. Aléatoire surprise 1 : après la Lasker, le pion d4 qui reste.
 * 3. Branche B : 4.Nf3 Be7 5.Bg5 h6 6.Bxf6 (Carlsbad avec la paire de fous).
 * 4. Branche C : la Variante d'Échange 4.cxd5.
 * 5. Branche D : le système tranquille 3.e3 / Nf3 / Bd3.
 * 6. Aléatoire surprise 2 : après le système tranquille, le fou enterré.
 * 7. Branche E : 4.Nf3 Be7 5.Bf4.
 * 8. Anti-panique : la Catalane (3.Nf3 Nf6 4.g3) et les ordres de coups.
 *
 * Choix des chapitres d'après les parties de l'utilisateur (22 parties en
 * structure ...d5/...e6 contre 1.d4) : défaites dans le système tranquille
 * 3.e3-Bd3 (3 parties), dans 6.Bxf6 et contre la Catalane ; victoires dans
 * les lignes ...h6 Bh4. Complété par la théorie principale (Orthodoxe,
 * Échange, 5.Bf4). Les branches théoriques s'arrêtent au plus tard au
 * demi-coup 27 ; les chapitres « Aléatoire surprise » prolongent de 8 coups
 * environ avec les Blancs comme camp « mou » (`_tmp-autoplay.mts` soft=w :
 * `_tmp-drift.mts` ne fait jouer « mou » que les Noirs).
 *
 * Convention côté Noirs (comme `op-caro-kann.ts`) : l'élève joue les Noirs ;
 * les fautes sont des coups BLANCS qui portent les 3 indices `[%hint]` +
 * `[%hintcsl]`, le coup noir suivant est la punition. Les « variantes
 * piégées » sont des coups noirs tentants mais perdants. Les évaluations
 * restent au point de vue des Blancs (négatif = avantage noir).
 *
 * Sources : théorie établie du GDR, TOUTES les lignes arbitrées par
 * Stockfish 18 natif (profondeur 16). Écart assumé : 8...O-O dans la ligne
 * 6.Bxf6, alors que 8...c6 est un peu plus précis (moins de 0.3). Toute la
 * prose est originale.
 *
 ## Architecture technique des nœuds
 *
 * Chaque nœud (`ChessMoveNode`, `core/chess/move-tree.ts`) porte :
 * - `evaluationScore` / `evaluationMate` : évaluation Stockfish 18 de la
 *   position après le coup (profondeur 16, point de vue Blancs), écrite
 *   `[%eval x]` ; `showEvalBar` est vrai dès qu'elle est posée ;
 * - `freeze` : posé par la balise `[%txt "…"]` qui enveloppe CHAQUE
 *   commentaire ; en mode « Jouer les coups », l'ordinateur attend
 *   « Suivant » ou Espace avant de répondre ;
 * - `hints` / `hintHighlights` : `[%hint "…"]` (3 indices progressifs) et
 *   `[%hintcsl …]` sur les fautes blanches qu'il faut punir.
 *
 * Fichier GÉNÉRÉ : ne pas l'éditer à la main. Source commentée :
 * `scripts/opening-course-src/queens-gambit-declined.pgn` (et l'en-tête
 * `queens-gambit-declined.header.txt`) ; regénérer avec
 * `node --import tsx scripts/_tmp-build-opening-course.mts <source> <en-tête> <sortie> 16`
 * (Stockfish natif, voir `scripts/_tmp-sf-native.mts`). Les `[%eval]` viennent
 * du moteur, pas de la main. Étape standard :
 * `scripts/_tmp-check-cited-evals.mts op-queens-gambit-declined` doit sortir 0 écart
 * (un chiffre n'est cité dans un commentaire que s'il est l'éval d'un nœud).
 * Règles de l'utilisateur : SAN en texte brut uniquement (jamais de figurine
 * Unicode), pas de guillemet droit dans un `[%txt]`.
 */

function chapter(title: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, START) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const OP_QUEENS_GAMBIT_DECLINED: CourseTree = {
  chapters: [
    chapter(
      "Fiche d'identité, tronc commun et l'Orthodoxe Lasker (4.Bg5)",
      `{ [%txt "LE GAMBIT DAME REFUSÉ, AVEC LES NOIRS.

Le vrai enjeu : garder un pion en d5, soutenu par e6, face à la pression c4 + Nc3. Le GDR ne cède jamais le centre ; son seul défaut est le fou c8, enfermé derrière e6. Toute la défense consiste à le libérer, par des échanges (...Ne4), puis par un levier de pion (...e5 ou ...c5).

Ton ordre de coups : 1.d4 Nf6 2.c4 e6 3.Nc3 d5 mène exactement à la même position que 1.d4 d5 2.c4 e6 3.Nc3 Nf6. Le cours la reconnaît dans tes parties.

Ce que disent tes parties : tu gagnes dans les lignes ...h6 et Bh4 ; tes défaites viennent du système tranquille e3-Bd3 (chapitres 5 et 6), de 6.Bxf6 (chapitre 3) et de la Catalane (chapitre 8).

Les structures types (relevées sur la position finale de chaque chapitre) :
- Lasker (ce chapitre) : Blancs a2-b2-d4-e3, Noirs a7-b7-c6-e5 ; le centre se liquide, le fou c8 respire.
- 6.Bxf6 et Échange : la structure de Carlsbad, Blancs d4-e3 contre Noirs c6-d5 ; minorité blanche b4-b5, jeu noir à l'aile roi.
- Système tranquille : pion dame isolé blanc en d4 ; nous bloquons d5 et attaquons d4.
- Bf4 : centre ouvert, pions c3 et d5 isolés des deux côtés.

Règle d'or : chaque coup noir a un rôle précis, dessiné par une flèche ou une case."] [%eval 0.37] }
1. d4 { [%txt "Les Blancs occupent le centre et libèrent le fou c1."] [%eval 0.29] }
1... d5 { [%txt "On occupe le centre à égalité : le pion d5 bloque d4. (Avec 1...Nf6 puis ...e6 et ...d5, tu arrives au même endroit.)"] [%eval 0.30] [%csl Gd5] }
2. c4 { [%txt "LE GAMBIT DAME : le pion c4 attaque d5 pour détourner notre pion central."] [%eval 0.34] }
2... e6 { [%txt "On refuse le pion : e6 soutient d5 pour toujours. Le prix : le fou c8 est enfermé derrière e6."] [%eval 0.30] [%csl Rc8] [%cal Ge6d5] }
3. Nc3 { [%txt "Le cavalier ajoute une deuxième pression sur d5."] [%eval 0.27] }
3... Nf6 { [%txt "Le cavalier défend d5 et prépare ...Be7 puis le roque."] [%eval 0.27] [%cal Gf6d5] }
4. Bg5 { [%txt "L'ORTHODOXE : le fou cloue le cavalier f6, l'un des défenseurs de d5. (4.cxd5 : chapitre 4 ; 4.Nf3 Be7 5.Bf4 : chapitre 7.)"] [%eval 0.24] [%cal Gg5f6] }
4... Be7 { [%txt "On rompt le clouage : le cavalier f6 n'est plus collé à la dame."] [%eval 0.21] [%cal Ge7f6] }
5. e3 { [%txt "Les Blancs ouvrent la diagonale du fou f1."] [%eval 0.23] }
(5. e4 { [%txt "Une poussée trop ambitieuse : l'évaluation passe de +0.21 à -1.31."] [%hint "les Blancs ouvrent le centre alors que leur roi est en e1 et que le pion e4 n'a qu'un seul défenseur."] [%hint "le pion e4. Notre cavalier f6 et notre pion d5 l'attaquent ; seul le cavalier c3 le défend, et il est lui-même exposé."] [%hint "5...Nxe4 : on prend le pion ; les échanges qui suivent laissent les Blancs un pion de moins."] [%hintcsl Re4,Rc3] [%eval -1.31] }
  5... Nxe4 { [%txt "On prend le pion : le fou e7 couvre le cavalier contre Bxd8."] [%eval -1.28] [%cal Gf6e4,Ge7g5] }
  6. Bxe7 { [%txt "Les Blancs échangent les fous."] [%eval -1.29] }
  6... Qxe7 { [%txt "La dame reprend et vise b4."] [%eval -1.26] [%cal Ge7b4] }
  7. Bd3 { [%txt "Le fou attaque le cavalier e4."] [%eval -1.24] }
  7... Nxc3 { [%txt "On échange avant que le cavalier ne soit pris."] [%eval -1.14] [%cal Ge4c3] }
  8. bxc3 { [%txt "À RETENIR.

PRO TIP : -1.17, un pion net de plus. En GDR, le pion e4 n'est un coup fort que s'il est préparé (Nf3, Bd3, Qc2) ; poussé trop tôt, il tombe sous les coups du cavalier f6."] [%eval -1.17] })
5... O-O { [%txt "Le roi est à l'abri avant toute ouverture du centre."] [%eval 0.30] [%csl Gg8] }
6. Nf3 { [%txt "Développement."] [%eval 0.26] }
6... h6 { [%txt "On pose la question au fou : Bh4 garde le clouage, Bxf6 donne la paire de fous."] [%eval 0.22] [%cal Gh6g5] }
7. Bh4 { [%txt "Le fou garde le clouage. (L'échange Bxf6 a son propre chapitre, le 3.)"] [%eval 0.16] }
7... Ne4 { [%txt "LA DÉFENSE LASKER : on échange deux pièces mineures. Moins de pièces, c'est plus de place pour notre jeu serré."] [%eval 0.29] [%cal Ge4c3,Ge7h4] }
8. Bxe7 { [%txt "Les Blancs échangent les fous."] [%eval 0.30] }
8... Qxe7 { [%txt "La dame reprend : elle surveille b4 et g5."] [%eval 0.33] [%cal Ge7b4] }
(8... Nxc3 { [%txt "LA VARIANTE PIÉGÉE : le coup intermédiaire semble gagner du temps…"] [%eval 1.99] [%csl Rd8] }
  9. Bxd8 { [%txt "…mais le fou prend d'abord notre dame."] [%eval 1.93] }
  9... Nxd1 { [%txt "On prend la dame blanche…"] [%eval 1.92] [%cal Gc3d1] }
  10. Be7 { [%txt "…le fou attaque la tour f8…"] [%eval 1.97] }
  10... Nxb2 { [%txt "…on prend un pion…"] [%eval 1.95] [%cal Gd1b2] }
  11. Bxf8 { [%txt "…le fou prend la tour…"] [%eval 1.90] }
  11... Kxf8 { [%txt "À RETENIR.

PRO TIP : +1.95. Les Blancs ont une qualité de plus et notre cavalier b2 est loin de tout. Avant un coup intermédiaire, vérifie que l'adversaire n'a pas, lui aussi, une prise plus forte."] [%eval 1.95] [%csl Rb2] })
9. Rc1 { [%txt "La tour prend la colonne c, en face de notre pion c7."] [%eval 0.30] }
(9. c5 { [%txt "Les Blancs gagnent de l'espace, mais lâchent la pression sur d5 : l'évaluation passe de +0.33 à -0.62."] [%hint "le pion c4 avance et ne frappe plus d5 : notre centre n'est plus attaqué."] [%hint "la case c3. Après ...Nxc3 bxc3, le pion c5 n'est plus tenu que par d4, et ...b6 l'attaque."] [%hint "9...Nxc3 puis ...b6 : on casse la chaîne de pions par sa tête."] [%hintcsl Gc3,Rc5] [%eval -0.62] }
  9... Nxc3 { [%txt "On échange le cavalier : les pions blancs se doublent."] [%eval -0.56] [%cal Ge4c3] }
  10. bxc3 { [%txt "Le pion reprend."] [%eval -0.66] }
  10... b6 { [%txt "Le levier : b6 attaque la tête de la chaîne, c5."] [%eval -0.55] [%cal Gb6c5] }
  11. cxb6 { [%txt "Les Blancs échangent."] [%eval -0.61] }
  11... axb6 { [%txt "À RETENIR.

PRO TIP : -0.68, les Noirs sont mieux. La colonne a s'ouvre pour notre tour et c3 reste faible. Quand les Blancs ferment le centre par c5, attaque la chaîne avec ...b6."] [%eval -0.68] [%cal Ga8a2] })
9... c6 { [%txt "On consolide d5 et on prépare ...dxc4 puis ...e5."] [%eval 0.36] [%cal Gc6d5] }
10. Bd3 { [%txt "Le fou se développe."] [%eval 0.36] }
10... Nxc3 { [%txt "Deuxième échange : il ne reste plus que deux pièces mineures de chaque côté."] [%eval 0.32] [%cal Ge4c3] }
11. Rxc3 { [%txt "La tour reprend."] [%eval 0.33] }
11... dxc4 { [%txt "On cède le centre au bon moment : le fou d3 doit rejouer pour reprendre."] [%eval 0.24] [%cal Gd5c4] }
12. Bxc4 { [%txt "Le fou reprend."] [%eval 0.23] }
12... Nd7 { [%txt "Le cavalier soutient le levier ...e5."] [%eval 0.26] [%cal Gd7e5] }
13. O-O { [%txt "Les Blancs roquent."] [%eval 0.23] }
(13. Ne5 { [%txt "Un saut au centre qui ne mène à rien : l'évaluation passe de +0.26 à -0.74."] [%hint "les Blancs proposent un échange qui affaiblit leur propre structure."] [%hint "la case e5. Après ...Nxe5 dxe5, le pion e5 est isolé, et notre dame peut l'attaquer en même temps que g2."] [%hint "13...Nxe5 14.dxe5 Qg5 : double attaque sur g2 et e5."] [%hintcsl Re5,Rg2] [%eval -0.74] }
  13... Nxe5 { [%txt "On échange."] [%eval -0.67] [%cal Gd7e5] }
  14. dxe5 { [%txt "Le pion reprend."] [%eval -0.67] }
  14... Qg5 { [%txt "La dame attaque g2 et e5 en même temps."] [%eval -0.73] [%cal Gg5g2,Gg5e5] }
  15. O-O { [%txt "Les Blancs sauvent g2…"] [%eval -0.65] }
  15... Qxe5 { [%txt "À RETENIR.

PRO TIP : -0.58, un pion de plus. Un échange qui laisse un pion isolé en e5 se paie : cherche la double attaque de la dame sur ce pion et sur le roque."] [%eval -0.58] [%csl Ge5] })
13... e5 { [%txt "LA LIBÉRATION : ...e5 attaque d4 et ouvre la diagonale c8-h3. Le fou c8 n'est plus enfermé."] [%eval 0.29] [%cal Ge5d4,Gc8h3] }
14. Re1 { [%txt "La tour se place derrière le pion e3.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.35).
1. ...exd4 au bon moment, puis ...Nf6 et ...Bg4 ou ...Bf5 : le fou c8 sort enfin.
2. Les tours en d8 et e8 sur les colonnes ouvertes ; la dame e7 surveille b4 et e4.
3. La structure noire est saine : sans faiblesse, la finale ne fait pas peur."] [%eval 0.35] [%cal Gc8g4] }
(14. h4 { [%txt "Un coup de pion qui affaiblit le roque : l'évaluation passe de +0.29 à -0.96."] [%hint "les Blancs avancent un pion de leur roque au lieu de terminer leur développement."] [%hint "le pion h4. Il n'est défendu que par le cavalier f3, et ...e4 chasse ce cavalier."] [%hint "14...e4 : le cavalier doit partir, puis la dame prend h4."] [%hintcsl Rh4,Rf3] [%eval -0.96] }
  14... e4 { [%txt "Le pion chasse le cavalier f3, seul défenseur de h4."] [%eval -0.95] [%cal Ge4f3] }
  15. Nd2 { [%txt "Le cavalier recule."] [%eval -0.84] }
  15... Qxh4 { [%txt "À RETENIR.

PRO TIP : -0.93, un pion de plus. Quand une pièce défend seule un pion, chasse-la avec un pion : ici ...e4 a déshabillé h4."] [%eval -0.93] [%csl Gh4] }) *`,
    ),
    chapter(
      "Aléatoire surprise 1 : après la Lasker, le pion d4 qui reste",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend la Lasker du chapitre précédent jusqu'à 13...e5. La théorie s'arrête là : nous prenons en d4, et les Blancs jouent des coups de club qui ont l'air naturels et ne le sont pas. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case faible (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quel pion ou quelle pièce n'est plus défendu ? 3. Quel coup noir l'attaque avec gain de temps ?"] [%eval 0.37] }
1. d4 { [%txt "Le centre."] [%eval 0.29] }
1... d5 { [%txt "On bloque d4."] [%eval 0.30] [%csl Gd5] }
2. c4 { [%txt "Le Gambit Dame."] [%eval 0.34] }
2... e6 { [%txt "On refuse."] [%eval 0.30] [%cal Ge6d5] }
3. Nc3 { [%txt "Pression sur d5."] [%eval 0.27] }
3... Nf6 { [%txt "Défense de d5."] [%eval 0.27] [%cal Gf6d5] }
4. Bg5 { [%txt "Le clouage."] [%eval 0.24] }
4... Be7 { [%txt "On le rompt."] [%eval 0.21] [%cal Ge7f6] }
5. e3 { [%txt "Développement."] [%eval 0.23] }
5... O-O { [%txt "Roque."] [%eval 0.30] [%csl Gg8] }
6. Nf3 { [%txt "Développement."] [%eval 0.26] }
6... h6 { [%txt "La question au fou."] [%eval 0.22] [%cal Gh6g5] }
7. Bh4 { [%txt "Le clouage reste."] [%eval 0.16] }
7... Ne4 { [%txt "La Lasker."] [%eval 0.29] [%cal Ge4c3] }
8. Bxe7 { [%txt "Échange."] [%eval 0.30] }
8... Qxe7 { [%txt "Reprise."] [%eval 0.33] [%cal Ge7b4] }
9. Rc1 { [%txt "La colonne c."] [%eval 0.30] }
9... c6 { [%txt "On consolide d5."] [%eval 0.36] [%cal Gc6d5] }
10. Bd3 { [%txt "Développement."] [%eval 0.36] }
10... Nxc3 { [%txt "Deuxième échange."] [%eval 0.32] [%cal Ge4c3] }
11. Rxc3 { [%txt "Reprise."] [%eval 0.33] }
11... dxc4 { [%txt "On cède le centre."] [%eval 0.24] [%cal Gd5c4] }
12. Bxc4 { [%txt "Reprise."] [%eval 0.23] }
12... Nd7 { [%txt "On prépare ...e5."] [%eval 0.26] [%cal Gd7e5] }
13. O-O { [%txt "Roque."] [%eval 0.23] }
13... e5 { [%txt "Fin de la théorie : la libération."] [%eval 0.29] [%cal Ge5d4] }
14. h3 { [%txt "Un coup d'attente qui empêche ...Bg4. Pas une faute, mais il ne règle pas la tension au centre."] [%eval 0.26] }
14... exd4 { [%txt "On prend : le pion d4 attaque la tour c3."] [%eval 0.18] [%cal Gd4c3] }
15. Ra3 { [%txt "La tour fuit au lieu de reprendre en d4 : l'évaluation passe de +0.18 à -0.40."] [%hint "les Blancs déplacent leur tour au lieu de reprendre le pion qui l'attaquait."] [%hint "le pion d4 reste en vie, et le fou c4 n'est défendu par aucune pièce."] [%hint "15...Nb6 : le cavalier attaque le fou c4."] [%hintcsl Gd4,Rc4] [%eval -0.40] }
15... Nb6 { [%txt "Le cavalier attaque le fou c4 avec gain de temps."] [%eval -0.48] [%cal Gb6c4] }
16. Qc2 { [%txt "La dame défend le fou, mais d4 est toujours là : l'évaluation passe de -0.48 à -1.11."] [%hint "les Blancs défendent leur fou au lieu de reprendre enfin en d4 avec la dame."] [%hint "la tour a3 et le fou c4. Notre dame peut les attaquer tous les deux depuis b4."] [%hint "16...Qb4 : double attaque sur la tour a3 et le fou c4."] [%hintcsl Ra3,Rc4] [%eval -1.11] }
16... Qb4 { [%txt "La dame attaque la tour a3 et le fou c4."] [%eval -0.94] [%cal Gb4a3,Gb4c4] }
(16... Bxh3 { [%txt "LA VARIANTE PIÉGÉE : le sacrifice en h3 a l'air d'une attaque…"] [%eval 2.49] [%csl Rh3] }
  17. gxh3 { [%txt "…mais aucune pièce noire ne peut suivre. À RETENIR.

PRO TIP : +2.55, une pièce de moins pour un pion. On ne sacrifie devant le roi que si deux pièces au moins peuvent venir l'attaquer."] [%eval 2.55] })
17. Ne5 { [%txt "Le cavalier saute au centre, mais le fou c4 reste en l'air : l'évaluation passe de -0.94 à -1.74."] [%hint "les Blancs lancent un cavalier en avant pendant que leur fou c4 est attaqué deux fois."] [%hint "le fou c4. Notre cavalier b6 le prend, et le cavalier e5 doit reprendre en quittant le centre."] [%hint "17...Nxc4 18.Nxc4 Be6 : on échange et on chasse le cavalier."] [%hintcsl Rc4] [%eval -1.74] }
17... Nxc4 { [%txt "On élimine le fou."] [%eval -1.56] [%cal Gb6c4] }
18. Nxc4 { [%txt "Le cavalier reprend."] [%eval -1.79] }
18... Be6 { [%txt "Le fou sort enfin et attaque le cavalier c4."] [%eval -1.65] [%cal Ge6c4] }
19. Na5 { [%txt "Le cavalier part au bord : l'évaluation passe de -1.65 à -2.46."] [%hint "le cavalier va sur le bord, loin de son roi, au lieu de revenir au centre."] [%hint "le pion e3. Notre pion d4 le prend, et le pion f2 est menacé à son tour."] [%hint "19...dxe3 : le pion prend et vise f2."] [%hintcsl Re3,Rf2] [%eval -2.46] }
19... dxe3 { [%txt "Le pion prend e3 et menace f2."] [%eval -2.54] [%cal Ge3f2] }
20. Qc3 { [%txt "La dame propose l'échange, mais oublie f2 : l'évaluation passe de -2.54 à -3.32."] [%hint "les Blancs proposent l'échange des dames au lieu de reprendre en e3."] [%hint "le pion f2 et la diagonale b6-g1 : une pièce en f2 serait clouée contre le roi."] [%hint "20...exf2+ 21.Rxf2 Qb6 : la tour f2 est clouée et le cavalier a5 attaqué."] [%hintcsl Rf2,Rg1] [%eval -3.32] }
20... exf2+ { [%txt "On prend f2 avec échec."] [%eval -3.44] [%cal Ge3f2] }
21. Rxf2 { [%txt "La tour reprend."] [%eval -3.51] }
21... Qb6 { [%txt "À RETENIR.

PRO TIP : -3.30, avantage noir décisif. La dame cloue la tour f2 contre le roi et attaque le cavalier a5. La leçon : un pion noir qui reste en d4 est une épine ; tant qu'il vit, chaque coup blanc qui ne le prend pas nous donne un temps."] [%eval -3.30] [%cal Gb6f2,Gb6a5] } *`,
    ),
    chapter(
      "Branche B : 4.Nf3 Be7 5.Bg5 h6 6.Bxf6, la paire de fous",
      `{ [%txt "LA LIGNE 6.Bxf6, CELLE D'UNE DE TES DÉFAITES.

Les Blancs donnent leur fou contre notre cavalier : nous avons la paire de fous, eux un temps de développement. Après cxd5 exd5, on retrouve la structure de Carlsbad (Blancs d4-e3, Noirs c6-d5).

Notre plan : roque, ...c6, ...Re8 et ...Nd7-f8, puis le fou c8 sur la diagonale c8-h3. Notre fou f6 surveille d4 : chaque fois que d4 perd un défenseur, il tombe."] [%eval 0.37] }
1. d4 { [%txt "Le centre."] [%eval 0.29] }
1... d5 { [%txt "On bloque d4."] [%eval 0.30] [%csl Gd5] }
2. c4 { [%txt "Le Gambit Dame."] [%eval 0.34] }
2... e6 { [%txt "On refuse."] [%eval 0.30] [%cal Ge6d5] }
3. Nc3 { [%txt "Pression sur d5."] [%eval 0.27] }
3... Nf6 { [%txt "Défense de d5."] [%eval 0.27] [%cal Gf6d5] }
4. Nf3 { [%txt "Le cavalier sort avant le fou."] [%eval 0.30] }
4... Be7 { [%txt "Développement classique : on prépare le roque."] [%eval 0.38] [%cal Ge8g8] }
5. Bg5 { [%txt "Le fou cloue... mais le cavalier n'est plus collé à la dame."] [%eval 0.22] }
5... h6 { [%txt "On pose la question au fou."] [%eval 0.16] [%cal Gh6g5] }
6. Bxf6 { [%txt "Les Blancs donnent le fou."] [%eval 0.15] }
6... Bxf6 { [%txt "Nous avons la paire de fous : le fou f6 vise d4."] [%eval 0.14] [%cal Gf6d4] }
7. cxd5 { [%txt "Les Blancs échangent au centre."] [%eval -0.02] }
7... exd5 { [%txt "On reprend avec le pion e : la diagonale c8-h3 s'ouvre pour le fou c8."] [%eval 0.02] [%cal Gc8h3] }
8. Rc1 { [%txt "La tour prend la colonne c."] [%eval 0.00] }
(8. Nd2 { [%txt "Le cavalier part vers b3, mais il ferme la colonne de sa dame : l'évaluation passe de +0.02 à -1.56."] [%hint "le cavalier se place devant sa propre dame."] [%hint "le pion d4. Il n'est plus défendu par la dame d1, et notre fou f6 le vise."] [%hint "8...Bxd4 : le fou prend le pion."] [%hintcsl Rd4,Gf6] [%eval -1.56] }
  8... Bxd4 { [%txt "Le fou prend le pion."] [%eval -1.65] [%cal Gf6d4] }
  9. Qa4+ { [%txt "Un échec pour gagner du temps."] [%eval -1.70] }
  9... Nc6 { [%txt "On interpose le cavalier."] [%eval -1.68] [%cal Gb8c6] }
  10. e3 { [%txt "Le pion attaque le fou."] [%eval -1.70] }
  10... Bb6 { [%txt "À RETENIR.

PRO TIP : -1.78, un pion net de plus. Le fou f6 était braqué sur d4 : chaque fois qu'un défenseur de d4 s'efface, regarde si le fou peut prendre."] [%eval -1.78] [%cal Gb6e3] })
8... O-O { [%txt "On roque. (8...c6, tout de suite, est un peu plus précis selon le moteur.)"] [%eval 0.00] [%csl Gg8] }
9. e3 { [%txt "Les Blancs soutiennent d4."] [%eval 0.08] }
(9. e4 { [%txt "Une rupture prématurée : l'évaluation passe de 0.00 à -2.22."] [%hint "les Blancs ouvrent la colonne e alors que leur roi est encore en e1."] [%hint "la colonne e. Après ...dxe4 Nxe4, le cavalier e4 est cloué si notre tour arrive en e8."] [%hint "9...dxe4 10.Nxe4 Re8 : le cavalier est cloué contre le roi."] [%hintcsl Re4,Re1] [%eval -2.22] }
  9... dxe4 { [%txt "On prend."] [%eval -2.39] [%cal Gd5e4] }
  10. Nxe4 { [%txt "Le cavalier reprend."] [%eval -2.71] }
  10... Re8 { [%txt "La tour cloue le cavalier e4 contre le roi e1."] [%eval -2.56] [%cal Ge8e1] }
  11. Bd3 { [%txt "Le fou soutient le cavalier."] [%eval -2.54] }
  11... Bf5 { [%txt "À RETENIR.

PRO TIP : -2.70. Le cavalier cloué est attaqué deux fois et le roi blanc est toujours au centre. La leçon : un roi en e1 et une colonne e qui s'ouvre, c'est un clouage tout prêt pour notre tour."] [%eval -2.70] [%cal Gf5e4,Ge8e4] })
9... c6 { [%txt "On consolide d5 : c'est la structure de Carlsbad."] [%eval 0.13] [%cal Gc6d5] }
10. Bd3 { [%txt "Le fou vise h7."] [%eval 0.13] }
(10. Ne5 { [%txt "Le cavalier saute au centre, mais il s'échange contre notre fou : l'évaluation passe de +0.13 à -0.94."] [%hint "les Blancs jouent un cavalier sur une case où notre fou f6 peut le prendre."] [%hint "la case e5. Après ...Bxe5 dxe5, le pion e5 est isolé et attaquable par notre tour."] [%hint "10...Bxe5 11.dxe5 Re8 : on attaque le pion e5."] [%hintcsl Re5] [%eval -0.94] }
  10... Bxe5 { [%txt "On échange : notre fou contre le bon cavalier blanc."] [%eval -0.98] [%cal Gf6e5] }
  11. dxe5 { [%txt "Le pion reprend."] [%eval -0.98] }
  11... Re8 { [%txt "La tour attaque e5."] [%eval -0.94] [%cal Ge8e5] }
  12. f4 { [%txt "Le pion défend e5."] [%eval -1.03] }
  12... f6 { [%txt "À RETENIR.

PRO TIP : -0.97. Le pion e5 tombe ou s'échange, et la position blanche reste trouée. Un pion isolé en e5 se casse avec ...f6 : attaque toujours une chaîne par sa tête."] [%eval -0.97] [%cal Gf6e5] })
10... Re8 { [%txt "La tour prend la colonne e."] [%eval 0.14] [%cal Ge8e3] }
11. O-O { [%txt "Les Blancs roquent."] [%eval 0.16] }
(11. Qe2 { [%txt "La dame se place derrière le cavalier f3 : l'évaluation passe de +0.14 à -1.55."] [%hint "la dame se met sur la même diagonale que le cavalier f3."] [%hint "le cavalier f3. Un fou noir en g4 le clouerait contre la dame e2, et f3 est le seul défenseur de d4 avec le pion e3, lui-même cloué sur la colonne e."] [%hint "11...Bg4 : le clouage, puis ...Bxf3 et ...Bxd4."] [%hintcsl Rf3,Re2,Rd4] [%eval -1.55] }
  11... Bg4 { [%txt "Le clouage contre la dame."] [%eval -1.61] [%cal Gg4e2] }
  12. h3 { [%txt "Le pion attaque le fou."] [%eval -1.50] }
  12... Bxf3 { [%txt "On élimine le défenseur de d4."] [%eval -1.31] [%cal Gg4f3] }
  13. Qxf3 { [%txt "La dame reprend."] [%eval -1.38] }
  13... Bxd4 { [%txt "À RETENIR.

PRO TIP : -1.49, un pion de plus. Le pion e3 ne peut pas reprendre : il est cloué par notre tour e8 contre le roi e1. Un roi au centre rend chaque pion de la colonne e inutilisable."] [%eval -1.49] [%cal Ge8e1] })
11... Nd7 { [%txt "Le cavalier part vers f8, puis e6 ou g6."] [%eval 0.21] [%cal Gd7f8] }
(11... Bf5 { [%txt "LA VARIANTE PIÉGÉE : on propose l'échange des fous…"] [%eval 5.32] [%csl Rf5] }
  12. Bxf5 { [%txt "…mais aucune pièce noire ne défend f5 : le fou est simplement perdu. À RETENIR.

PRO TIP : +5.11. Sans pion en e6 ni en g6, la case f5 n'est pas protégée : avant de proposer un échange, compte qui reprend."] [%eval 5.11] })
12. b4 { [%txt "L'ATTAQUE DE MINORITÉ : b4-b5 contre notre pion c6.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.22).
1. ...a6 freine b5 ; si b5 vient quand même, ...axb5 et la colonne a s'ouvre.
2. ...Nf8 puis ...Ne6 ou ...Ng6 : le cavalier rejoint l'aile roi.
3. ...Bg5 ou ...Be7 puis ...Bd6 : la paire de fous vise le roque blanc, là où se joue notre partie."] [%eval 0.22] [%cal Gb4b5] } *`,
    ),
    chapter(
      "Branche C : la Variante d'Échange 4.cxd5",
      `{ [%txt "LA VARIANTE D'ÉCHANGE.

Les Blancs fixent la structure tout de suite : Carlsbad, avec Blancs d4-e3 contre Noirs c6-d5. Leur plan est l'attaque de minorité (Rb1, b4-b5) ou, avec Nge2 et f3, la poussée e4.

Notre plan : ...c6, ...Be7, ...Nbd7-f8, ...Re8 ; puis le cavalier en e6 ou g6, et ...a5 pour freiner b4. La case e4 est notre avant-poste."] [%eval 0.37] }
1. d4 { [%txt "Le centre."] [%eval 0.29] }
1... d5 { [%txt "On bloque d4."] [%eval 0.30] [%csl Gd5] }
2. c4 { [%txt "Le Gambit Dame."] [%eval 0.34] }
2... e6 { [%txt "On refuse."] [%eval 0.30] [%cal Ge6d5] }
3. Nc3 { [%txt "Pression sur d5."] [%eval 0.27] }
3... Nf6 { [%txt "Défense de d5."] [%eval 0.27] [%cal Gf6d5] }
4. cxd5 { [%txt "L'ÉCHANGE : les Blancs fixent la structure."] [%eval 0.19] }
4... exd5 { [%txt "On reprend avec le pion e : la diagonale c8-h3 s'ouvre."] [%eval 0.24] [%cal Gc8h3] }
5. Bg5 { [%txt "Le fou cloue le cavalier f6."] [%eval 0.21] }
5... c6 { [%txt "On soutient d5 et on ouvre la case c7 pour la dame."] [%eval 0.28] [%cal Gc6d5] }
6. e3 { [%txt "Développement."] [%eval 0.29] }
6... Be7 { [%txt "On rompt le clouage."] [%eval 0.32] [%cal Ge7f6] }
7. Bd3 { [%txt "Le fou vise h7."] [%eval 0.36] }
(7. f4 { [%txt "Une poussée trop tôt : l'évaluation passe de +0.32 à -1.41."] [%hint "les Blancs poussent un pion de l'aile roi avant d'avoir développé leurs pièces."] [%hint "la case g4. Notre cavalier y saute, attaque e3 et laisse le fou e7 prendre g5."] [%hint "7...Ng4 : le cavalier attaque e3, puis ...Bxg5."] [%hintcsl Gg4,Re3] [%eval -1.41] }
  7... Ng4 { [%txt "Le cavalier saute en g4 et attaque e3."] [%eval -1.37] [%cal Gg4e3] }
  8. Qd2 { [%txt "La dame défend e3."] [%eval -1.43] }
  8... Bxg5 { [%txt "On prend le fou."] [%eval -1.40] [%cal Ge7g5] }
  9. fxg5 { [%txt "Le pion reprend."] [%eval -1.39] }
  9... Qxg5 { [%txt "À RETENIR.

PRO TIP : -1.48, un pion de plus. Le pion f4 a quitté sa case et laissé g4 au cavalier : chaque poussée de pion abandonne une case, cherche laquelle."] [%eval -1.48] [%csl Gg5] })
7... Nbd7 { [%txt "Le cavalier part vers f8."] [%eval 0.37] [%cal Gd7f8] }
8. Qc2 { [%txt "La dame vise h7 avec le fou d3."] [%eval 0.26] }
8... O-O { [%txt "Roque."] [%eval 0.26] [%csl Gg8] }
9. Nge2 { [%txt "Le cavalier va en e2 : il soutient f3 et e4."] [%eval 0.25] }
9... Re8 { [%txt "La tour prend la colonne e et libère f8 pour le cavalier."] [%eval 0.30] [%cal Ge8e3] }
10. O-O { [%txt "Les Blancs roquent."] [%eval 0.27] }
(10. f4 { [%txt "L'attaque à l'aile roi, mais e3 devient faible : l'évaluation passe de +0.30 à -1.79."] [%hint "le pion f2 avance et laisse le pion e3 sans défenseur de pion."] [%hint "le pion e3 et la case g4. Notre cavalier f6 y saute et attaque e3, notre tour e8 soutient l'attaque."] [%hint "10...Ng4 : le cavalier frappe e3."] [%hintcsl Re3,Gg4] [%eval -1.79] }
  10... Ng4 { [%txt "Le cavalier attaque e3."] [%eval -1.75] [%cal Gg4e3] }
  11. Bxe7 { [%txt "Les Blancs échangent."] [%eval -1.94] }
  11... Qxe7 { [%txt "La dame reprend et attaque e3 elle aussi."] [%eval -2.20] [%cal Ge7e3] }
  12. Nd1 { [%txt "Le cavalier défend e3."] [%eval -1.98] }
  12... Nxe3 { [%txt "À RETENIR.

PRO TIP : -1.66, le pion e3 tombe. Avec f4, le pion e3 devient arriéré sur une colonne ouverte : mets la tour derrière, puis attaque-le."] [%eval -1.66] [%csl Ge3] })
10... Nf8 { [%txt "Le cavalier rejoint l'aile roi : il défend h7 et ira en e6 ou g6."] [%eval 0.35] [%cal Gf8g6,Gf8h7] }
11. Rab1 { [%txt "La tour prépare b4-b5 : l'attaque de minorité."] [%eval 0.15] }
11... a5 { [%txt "On freine b4 : si b4, ...axb4 et le pion b4 tombe."] [%eval 0.19] [%cal Ga5b4] }
(11... Ne6 { [%txt "LA VARIANTE PIÉGÉE : le cavalier quitte f8, où il gardait h7…"] [%eval 0.94] [%csl Rh7] }
  12. Bxf6 { [%txt "…le fou élimine le cavalier f6…"] [%eval 0.98] }
  12... Bxf6 { [%txt "…on reprend…"] [%eval 0.98] [%cal Ge7f6] }
  13. Bxh7+ { [%txt "…et le fou prend h7 avec échec."] [%eval 1.01] }
  13... Kh8 { [%txt "Le roi s'écarte."] [%eval 0.95] [%csl Rh7] }
  14. Bd3 { [%txt "À RETENIR.

PRO TIP : +1.03, un pion de moins. Contre la batterie dame c2 et fou d3, h7 a besoin d'un gardien : ne retire pas le cavalier f8 tant qu'elle est en place."] [%eval 1.03] })
12. a3 { [%txt "Les Blancs préparent b4 avec un pion de soutien.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.09).
1. ...Ng6 ou ...Ne6 : le cavalier vise f4 et g5, l'aile roi est notre secteur.
2. ...Bd6 et ...Ne4 : la case e4 est notre avant-poste, la paire de pièces vise le roque.
3. Si b4 vient, ...axb4 axb4 : la colonne a s'ouvre pour notre tour a8."] [%eval 0.09] [%cal Gf6e4] }
(12. b4 { [%txt "L'attaque de minorité sans préparation : l'évaluation passe de +0.19 à -1.16."] [%hint "les Blancs poussent b4 alors que notre pion a5 l'attaque déjà."] [%hint "le pion b4. Il est attaqué par le pion a5 et par le fou e7, défendu seulement par la tour b1."] [%hint "12...axb4 : on gagne le pion, car Rxb4 perd la qualité sur ...Bxb4."] [%hintcsl Rb4,Ga5,Ge7] [%eval -1.16] }
  12... axb4 { [%txt "À RETENIR.

PRO TIP : -1.04, un pion de plus. Avant d'accepter le levier b4, compte : deux attaquants (pion a5, fou e7) contre un seul défenseur. ...a5 n'est pas là pour décorer."] [%eval -1.04] [%cal Ge7b4] }) *`,
    ),
    chapter(
      "Branche D : le système tranquille 3.e3 (tes parties)",
      `{ [%txt "LE SYSTÈME TRANQUILLE : 3.e3, Nf3, Bd3, O-O.

C'est la ligne de tes défaites : les Blancs ne jouent pas Bg5, ils se développent sobrement et préparent e4. Si on les laisse faire, ils obtiennent le centre et l'attaque.

Notre réponse : ...c5 tout de suite, puis ...dxc4 au moment où le fou d3 a déjà joué : il doit rejouer pour reprendre. Ensuite ...a6, ...b5 et ...Bb7 : le fou c8 sort sur la grande diagonale, celle que les Blancs veulent ouvrir avec e4."] [%eval 0.37] }
1. d4 { [%txt "Le centre."] [%eval 0.29] }
1... d5 { [%txt "On bloque d4."] [%eval 0.30] [%csl Gd5] }
2. c4 { [%txt "Le Gambit Dame."] [%eval 0.34] }
2... e6 { [%txt "On refuse."] [%eval 0.30] [%cal Ge6d5] }
3. e3 { [%txt "LE SYSTÈME TRANQUILLE : pas de Nc3 ni de Bg5, juste un développement sobre."] [%eval 0.04] }
(3. Nc3 { [%txt "Le coup principal, traité aux chapitres 1 à 4 et 7."] [%eval 0.27] }
  3... Nf6 { [%txt "La position de référence du Gambit Dame Refusé."] [%eval 0.27] [%cal Gf6d5] })
3... Nf6 { [%txt "Développement."] [%eval 0.09] [%cal Gf6d5] }
4. Nf3 { [%txt "Développement."] [%eval 0.15] }
4... c5 { [%txt "Le contre-coup au centre : on attaque d4 avant que les Blancs ne préparent e4."] [%eval 0.29] [%cal Gc5d4] }
5. Bd3 { [%txt "Le fou se développe."] [%eval -0.07] }
5... Nc6 { [%txt "Deuxième pression sur d4."] [%eval 0.15] [%cal Gc6d4] }
6. O-O { [%txt "Les Blancs roquent."] [%eval 0.15] }
(6. Qc2 { [%txt "Un coup naturel, mais la dame se place mal : l'évaluation passe de +0.15 à -0.86."] [%hint "la dame se met sur une case qu'un cavalier noir peut attaquer en même temps que le fou d3."] [%hint "la case b4. De là, notre cavalier attaque la dame c2 et le fou d3."] [%hint "6...Nb4 : double attaque, et on gagne la paire de fous."] [%hintcsl Gb4,Rc2,Rd3] [%eval -0.86] }
  6... Nb4 { [%txt "Le cavalier attaque la dame et le fou."] [%eval -0.78] [%cal Gb4c2,Gb4d3] }
  7. Qe2 { [%txt "La dame s'écarte."] [%eval -0.84] }
  7... Nxd3+ { [%txt "On prend le fou avec échec."] [%eval -0.73] [%cal Gb4d3] }
  8. Qxd3 { [%txt "La dame reprend."] [%eval -0.75] }
  8... cxd4 { [%txt "À RETENIR.

PRO TIP : -0.64. La paire de fous est à nous et la position blanche reste sans plan. Contre le système tranquille, la case b4 est un trou : surveille chaque coup qui met la dame en c2 avec le fou en d3."] [%eval -0.64] [%csl Gb4] })
6... dxc4 { [%txt "On prend maintenant : le fou d3 a déjà joué une fois, il doit rejouer pour reprendre."] [%eval 0.14] [%cal Gd5c4] }
7. Bxc4 { [%txt "Le fou reprend."] [%eval 0.10] }
(7. Bc2 { [%txt "Le fou garde la diagonale b1-h7, mais ne reprend pas : l'évaluation passe de +0.14 à -1.21."] [%hint "les Blancs laissent le pion c4 en vie pour garder leur fou sur sa diagonale."] [%hint "le pion c4. Notre pion b5 peut venir le soutenir, et les Blancs auront un pion de moins."] [%hint "7...b5 : on garde le pion de plus."] [%hintcsl Gc4,Gb5] [%eval -1.21] }
  7... b5 { [%txt "Le pion soutient c4."] [%eval -1.25] [%cal Gb5c4] }
  8. Qe2 { [%txt "La dame vise b5."] [%eval -1.14] }
  8... a6 { [%txt "À RETENIR.

PRO TIP : -1.19, un pion de plus solidement tenu. Un pion pris en c4 se garde avec ...b5 et ...a6 tant que le fou blanc ne peut pas le reprendre."] [%eval -1.19] [%csl Gc4] })
7... a6 { [%txt "On prépare ...b5 avec gain de temps sur le fou c4."] [%eval 0.15] [%cal Ga6b5] }
(7... Nxd4 { [%txt "LA VARIANTE PIÉGÉE : le pion d4 semble pris deux fois…"] [%eval 4.03] [%csl Rd4] }
  8. exd4 { [%txt "…mais le pion e3 reprend…"] [%eval 4.06] }
  8... cxd4 { [%txt "…on reprend…"] [%eval 4.05] [%cal Gc5d4] }
  9. Qxd4 { [%txt "…la dame aussi…"] [%eval 3.99] }
  9... Qxd4 { [%txt "…on échange les dames…"] [%eval 3.98] [%cal Gd8d4] }
  10. Nxd4 { [%txt "À RETENIR.

PRO TIP : +4.11, une pièce contre deux pions. d4 était attaqué deux fois (c5, c6) et défendu deux fois (e3, f3) : à égalité de forces, la première prise perd. Compte avant de prendre."] [%eval 4.11] })
8. Nc3 { [%txt "Développement."] [%eval -0.27] }
8... b5 { [%txt "Le pion chasse le fou et prépare ...Bb7."] [%eval -0.16] [%cal Gb5c4,Gc8b7] }
9. Bd3 { [%txt "Le fou recule."] [%eval 0.00] }
9... Bb7 { [%txt "Le fou sort sur la grande diagonale : il surveille e4 et vise g2."] [%eval 0.00] [%cal Gb7e4,Gb7g2] }
10. a4 { [%txt "Les Blancs attaquent b5."] [%eval 0.14] }
(10. e4 { [%txt "La rupture que les Blancs préparaient, mais trop tôt : l'évaluation passe de 0.00 à -1.55."] [%hint "le pion e3 avance et ne défend plus d4."] [%hint "le pion d4. Il est attaqué par notre pion c5 et notre cavalier c6, et ne garde plus que le cavalier f3 pour défenseur."] [%hint "10...Nxd4 : le cavalier prend le pion."] [%hintcsl Rd4,Gc6] [%eval -1.55] }
  10... Nxd4 { [%txt "Le cavalier prend le pion."] [%eval -1.62] [%cal Gc6d4] }
  11. Re1 { [%txt "La tour soutient e4."] [%eval -1.61] }
  11... Be7 { [%txt "On termine le développement."] [%eval -1.77] [%cal Ge8g8] }
  12. Nxd4 { [%txt "Les Blancs échangent."] [%eval -1.70] }
  12... Qxd4 { [%txt "À RETENIR.

PRO TIP : -1.72, un pion de plus. Dans le système tranquille, e4 laisse d4 avec un défenseur de moins : quand tu attaques d4 deux fois, chaque départ d'un défenseur te donne le pion."] [%eval -1.72] [%csl Gd4] })
10... b4 { [%txt "Le pion avance avec gain de temps sur le cavalier c3."] [%eval 0.09] [%cal Gb4c3] }
11. Ne4 { [%txt "Le cavalier se centralise."] [%eval 0.14] }
11... cxd4 { [%txt "On isole le pion d blanc."] [%eval 0.11] [%cal Gc5d4] }
12. exd4 { [%txt "Le pion reprend : les Blancs ont un pion dame isolé."] [%eval 0.19] [%csl Rd4] }
12... Be7 { [%txt "Développement : on prépare le roque."] [%eval 0.20] [%cal Ge8g8] }
13. Re1 { [%txt "La tour prend la colonne e."] [%eval 0.17] }
13... O-O { [%txt "Roque.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.21).
1. Bloquer d5 avec une pièce (cavalier ou fou) : devant un pion isolé, la case de blocage vaut de l'or.
2. ...Rc8 et ...Na5-c4 : la colonne c et la case c4 sont à nous.
3. Échanger les pièces mineures : en finale, le pion d4 isolé est une cible."] [%eval 0.21] [%csl Gd5] } *`,
    ),
    chapter(
      "Aléatoire surprise 2 : après le système tranquille, le fou enterré",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le système tranquille du chapitre précédent jusqu'à 13...O-O. La théorie s'arrête là. Les Blancs ne font pas de gaffe : ils jouent des coups lents qui laissent la case d5 et la colonne c aux Noirs, puis enterrent leur propre fou. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case faible ou le pion à pousser (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quelle case de blocage ou quelle colonne est libre ? 3. Quelle pièce noire peut s'y installer, ou quel pion avancer avec gain de temps ?"] [%eval 0.37] }
1. d4 { [%txt "Le centre."] [%eval 0.29] }
1... d5 { [%txt "On bloque d4."] [%eval 0.30] [%csl Gd5] }
2. c4 { [%txt "Le Gambit Dame."] [%eval 0.34] }
2... e6 { [%txt "On refuse."] [%eval 0.30] [%cal Ge6d5] }
3. e3 { [%txt "Le système tranquille."] [%eval 0.04] }
(3. Nc3 { [%txt "Le coup principal, chapitres 1 à 4 et 7."] [%eval 0.27] }
  3... Nf6 { [%txt "La position de référence."] [%eval 0.27] [%cal Gf6d5] })
3... Nf6 { [%txt "Développement."] [%eval 0.09] [%cal Gf6d5] }
4. Nf3 { [%txt "Développement."] [%eval 0.15] }
4... c5 { [%txt "Contre-coup au centre."] [%eval 0.29] [%cal Gc5d4] }
5. Bd3 { [%txt "Développement."] [%eval -0.07] }
5... Nc6 { [%txt "Pression sur d4."] [%eval 0.15] [%cal Gc6d4] }
6. O-O { [%txt "Roque."] [%eval 0.15] }
6... dxc4 { [%txt "Le fou doit rejouer."] [%eval 0.14] [%cal Gd5c4] }
7. Bxc4 { [%txt "Reprise."] [%eval 0.10] }
7... a6 { [%txt "On prépare ...b5."] [%eval 0.15] [%cal Ga6b5] }
8. Nc3 { [%txt "Développement."] [%eval -0.27] }
8... b5 { [%txt "Gain de temps."] [%eval -0.16] [%cal Gb5c4] }
9. Bd3 { [%txt "Recul."] [%eval 0.00] }
9... Bb7 { [%txt "La grande diagonale."] [%eval 0.00] [%cal Gb7g2] }
10. a4 { [%txt "Attaque de b5."] [%eval 0.14] }
10... b4 { [%txt "Gain de temps."] [%eval 0.09] [%cal Gb4c3] }
11. Ne4 { [%txt "Centralisation."] [%eval 0.14] }
11... cxd4 { [%txt "Le pion isolé."] [%eval 0.11] [%cal Gc5d4] }
12. exd4 { [%txt "Reprise."] [%eval 0.19] }
12... Be7 { [%txt "Développement."] [%eval 0.20] [%cal Ge8g8] }
13. Re1 { [%txt "La colonne e."] [%eval 0.17] }
13... O-O { [%txt "Fin de la théorie."] [%eval 0.21] [%csl Gg8] }
14. Ng3 { [%txt "Le cavalier quitte le centre sans raison : l'évaluation passe de +0.21 à -0.39."] [%hint "les Blancs reculent leur meilleure pièce au lieu de développer le fou c1."] [%hint "la colonne c. Elle est ouverte, et aucune pièce blanche ne la conteste."] [%hint "14...Rc8 : la tour prend la colonne ouverte."] [%hintcsl Gc8,Gc1] [%eval -0.39] }
14... Rc8 { [%txt "La tour prend la colonne c."] [%eval -0.34] [%cal Gc8c1] }
15. Be3 { [%txt "Le fou se développe enfin."] [%eval -0.32] }
15... Qd6 { [%txt "La dame se place face au pion isolé et vise g3."] [%eval -0.29] [%cal Gd6g3] }
16. Ne4 { [%txt "Le cavalier revient et attaque la dame."] [%eval -0.24] }
16... Nxe4 { [%txt "On échange le cavalier qui attaquait la dame."] [%eval -0.26] [%cal Gf6e4] }
(16... Nxd4 { [%txt "LA VARIANTE PIÉGÉE : le pion d4 a l'air gratuit…"] [%eval 4.90] [%csl Rd6] }
  17. Nxd6 { [%txt "…mais notre dame d6 était attaquée par le cavalier e4."] [%eval 4.83] }
  17... Nxf3+ { [%txt "On récupère une pièce…"] [%eval 5.07] [%cal Gd4f3] }
  18. Qxf3 { [%txt "À RETENIR.

PRO TIP : +5.06, une dame contre une pièce mineure. Avant de prendre un pion, regarde si ta pièce la plus chère n'est pas attaquée."] [%eval 5.06] })
17. Bxe4 { [%txt "Le fou reprend."] [%eval -0.24] }
17... f5 { [%txt "Le pion chasse le fou de la grande diagonale."] [%eval -0.23] [%cal Gf5e4] }
18. Bb1 { [%txt "Le fou recule."] [%eval -0.21] }
18... Na5 { [%txt "Le cavalier part vers c4 ou b3."] [%eval -0.22] [%cal Ga5c4] }
19. Bc2 { [%txt "Le fou se met sur une case qu'un pion noir peut attaquer : l'évaluation passe de -0.22 à -0.97."] [%hint "le fou c2 est sur la route de notre pion b4."] [%hint "la case d5, juste devant le pion isolé. Notre fou b7 peut s'y installer, puis le pion b avancera en b3 contre c2."] [%hint "19...Bd5 : le fou bloque le pion isolé et prépare ...b3."] [%hintcsl Gd5,Rc2] [%eval -0.97] }
19... Bd5 { [%txt "Le fou s'installe sur la case de blocage d5."] [%eval -0.66] [%csl Gd5] [%cal Gd5f3] }
(19... Rxc2 { [%txt "LA VARIANTE PIÉGÉE : le sacrifice de qualité semble éliminer le fou…"] [%eval 0.53] [%csl Rc2] }
  20. Qxc2 { [%txt "…mais il ne rapporte rien. À RETENIR.

PRO TIP : +0.46, une qualité de moins sans compensation. Un sacrifice de qualité se justifie par une structure blanche détruite ou un roi ouvert ; ici ni l'un ni l'autre."] [%eval 0.46] })
20. Re2 { [%txt "La tour quitte la colonne e : l'évaluation passe de -0.66 à -1.57."] [%hint "les Blancs jouent un coup de tour sans plan pendant que leur fou c2 est mal placé."] [%hint "le fou c2. Notre pion b4 peut avancer en b3 et l'attaquer."] [%hint "20...b3 : le pion chasse le fou."] [%hintcsl Rc2,Gb3] [%eval -1.57] }
20... b3 { [%txt "Le pion attaque le fou c2."] [%eval -1.44] [%cal Gb3c2] }
21. Bb1 { [%txt "Le fou s'enterre en b1, derrière ses propres pions : l'évaluation passe de -1.44 à -2.07."] [%hint "le fou recule sur une case où il ne voit plus rien."] [%hint "le pion d4. Plus aucune pièce mineure blanche ne le défend, et notre cavalier peut revenir l'attaquer depuis c6."] [%hint "21...Nc6 : le cavalier attaque d4."] [%hintcsl Rd4,Rb1] [%eval -2.07] }
21... Nc6 { [%txt "À RETENIR.

PRO TIP : -2.27, avantage noir net. Le fou b1 est enterré, le fou d5 bloque le pion isolé et d4 est attaqué. La leçon : contre le pion isolé, bloque d'abord la case devant lui, puis attaque-le avec tes pièces."] [%eval -2.27] [%csl Rb1] [%cal Gc6d4] } *`,
    ),
    chapter(
      "Branche E : 4.Nf3 Be7 5.Bf4, le fou en f4",
      `{ [%txt "LE SYSTÈME 5.Bf4.

Les Blancs placent le fou en f4, hors de portée de ...h6 et ...Ne4. Ils veulent un jeu de manœuvre, sans rien concéder.

Notre réponse : ...c5 dès que possible. Après dxc5 Bxc5, notre fou est actif, la dame va en a5 et nos pièces se développent avec gain de temps. ...Ne4 vient ensuite pour échanger le cavalier c3."] [%eval 0.37] }
1. d4 { [%txt "Le centre."] [%eval 0.29] }
1... d5 { [%txt "On bloque d4."] [%eval 0.30] [%csl Gd5] }
2. c4 { [%txt "Le Gambit Dame."] [%eval 0.34] }
2... e6 { [%txt "On refuse."] [%eval 0.30] [%cal Ge6d5] }
3. Nc3 { [%txt "Pression sur d5."] [%eval 0.27] }
3... Nf6 { [%txt "Défense de d5."] [%eval 0.27] [%cal Gf6d5] }
4. Nf3 { [%txt "Développement."] [%eval 0.30] }
4... Be7 { [%txt "On prépare le roque."] [%eval 0.38] [%cal Ge8g8] }
5. Bf4 { [%txt "Le fou se place en f4, hors de portée de ...h6."] [%eval 0.35] }
5... O-O { [%txt "Roque."] [%eval 0.33] [%csl Gg8] }
6. e3 { [%txt "Les Blancs soutiennent d4."] [%eval 0.33] }
6... c5 { [%txt "Le levier : on attaque d4 et on ouvre le jeu pour nos pièces."] [%eval 0.32] [%cal Gc5d4] }
7. dxc5 { [%txt "Les Blancs prennent."] [%eval 0.33] }
7... Bxc5 { [%txt "Le fou reprend et vise e3 et f2."] [%eval 0.31] [%cal Gc5f2] }
8. Qc2 { [%txt "La dame surveille la diagonale b1-h7 et la colonne c."] [%eval 0.27] }
8... Nc6 { [%txt "Développement : le cavalier vise b4 et d4."] [%eval 0.34] [%cal Gc6b4] }
9. a3 { [%txt "Les Blancs empêchent ...Nb4 et ...Bb4."] [%eval 0.35] }
(9. Nd4 { [%txt "Le cavalier se centralise, mais il s'échange mal : l'évaluation passe de +0.34 à -1.95."] [%hint "les Blancs jouent leur cavalier sur une case attaquée par notre cavalier et notre fou."] [%hint "la case d4. Après ...Nxd4 exd4, le pion d4 n'est défendu par aucune pièce et notre fou c5 le prend."] [%hint "9...Nxd4 10.exd4 Bxd4 : on gagne un pion."] [%hintcsl Rd4,Gc5] [%eval -1.95] }
  9... Nxd4 { [%txt "On échange."] [%eval -1.94] [%cal Gc6d4] }
  10. exd4 { [%txt "Le pion reprend."] [%eval -1.98] }
  10... Bxd4 { [%txt "À RETENIR.

PRO TIP : -1.86, un pion de plus. Un cavalier qui s'installe en d4 doit être soutenu par un pion qui reprend sans laisser un nouveau pion en prise."] [%eval -1.86] [%csl Gd4] })
(9. Qd2 { [%txt "La dame se place sur une case exposée : l'évaluation passe de +0.34 à -0.82."] [%hint "la dame quitte c2 pour d2, où un cavalier noir peut l'attaquer."] [%hint "la case e4. Notre cavalier y saute, attaque la dame d2 et le cavalier c3."] [%hint "9...Ne4 : le cavalier attaque la dame et échange le cavalier c3."] [%hintcsl Ge4,Rd2] [%eval -0.82] }
  9... Ne4 { [%txt "Le cavalier attaque la dame."] [%eval -1.00] [%cal Ge4d2] }
  10. Qc1 { [%txt "La dame recule."] [%eval -0.90] }
  10... Nxc3 { [%txt "On échange."] [%eval -0.86] [%cal Ge4c3] }
  11. bxc3 { [%txt "À RETENIR.

PRO TIP : -0.90. Les pions blancs sont doublés en c3 et c4 et la dame c1 est passive. La case e4 est le tremplin de nos cavaliers dans toutes les lignes du GDR : regarde-la après chaque coup de dame."] [%eval -0.90] [%csl Ge4] })
9... Qa5 { [%txt "La dame cloue le cavalier c3 et prépare ...Ne4."] [%eval 0.33] [%cal Ga5c3] }
10. Rd1 { [%txt "La tour vise d5."] [%eval 0.23] }
10... Be7 { [%txt "Le fou recule pour ne pas être pris en c5 après b4."] [%eval 0.33] [%cal Ge7c5] }
11. Be2 { [%txt "Développement."] [%eval 0.30] }
11... Ne4 { [%txt "Le cavalier attaque c3 deux fois."] [%eval 0.30] [%cal Ge4c3] }
12. cxd5 { [%txt "Les Blancs échangent au centre."] [%eval 0.24] }
12... Nxc3 { [%txt "On prend le cavalier c3 d'abord."] [%eval 0.18] [%cal Ge4c3] }
(12... exd5 { [%txt "LA VARIANTE PIÉGÉE : on reprend vers le centre…"] [%eval 2.79] [%csl Ra5] }
  13. Rxd5 { [%txt "…et la tour prend d5 en attaquant notre dame a5, pendant que le cavalier e4 reste attaqué. À RETENIR.

PRO TIP : +2.74, une pièce de moins. Quand deux de tes pièces sont attaquées, l'ordre des prises compte : le cavalier e4 devait prendre en c3 d'abord."] [%eval 2.74] })
13. bxc3 { [%txt "Le pion reprend."] [%eval 0.24] }
13... exd5 { [%txt "On reprend d5 : les pions sont isolés des deux côtés."] [%eval 0.26] [%cal Ge6d5] }
14. O-O { [%txt "Les Blancs roquent.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.31).
1. ...Rd8 et ...Be6 : on soutient d5 et on développe le dernier fou.
2. ...Rac8 : la colonne c contre le pion c3 faible.
3. ...Na5-c4 : le cavalier s'installe devant le pion c3, notre meilleure case."] [%eval 0.31] [%cal Gc6a5,Ga5c4] } *`,
    ),
    chapter(
      "Anti-panique : la Catalane et les ordres de coups",
      `{ [%txt "ANTI-PANIQUE : 3.Nf3 ET LA CATALANE (g3).

Tu as perdu contre g3. Pas de panique : avec ...dxc4, on prend le pion c4, puis on le rend contre un développement rapide (...a6, ...b5, ...Bb7). La ligne principale traite la Catalane ; les variantes rappellent 3.Nc3 et l'échange 3.cxd5."] [%eval 0.37] }
1. d4 { [%txt "Le centre."] [%eval 0.29] }
1... d5 { [%txt "On bloque d4."] [%eval 0.30] [%csl Gd5] }
2. c4 { [%txt "Le Gambit Dame."] [%eval 0.34] }
2... e6 { [%txt "On refuse."] [%eval 0.30] [%cal Ge6d5] }
3. Nf3 { [%txt "Le cavalier sort avant Nc3 : les Blancs gardent l'option g3."] [%eval 0.20] }
(3. Nc3 { [%txt "Le coup principal, traité aux chapitres 1 à 4 et 7."] [%eval 0.27] }
  3... Nf6 { [%txt "La position de référence du Gambit Dame Refusé."] [%eval 0.27] [%cal Gf6d5] })
(3. cxd5 { [%txt "L'échange tout de suite."] [%eval 0.15] }
  3... exd5 { [%txt "On reprend avec le pion e ; après 4.Nc3 Nf6, on retrouve le chapitre 4."] [%eval 0.16] [%cal Gc8h3] })
3... Nf6 { [%txt "Développement."] [%eval 0.27] [%cal Gf6d5] }
4. g3 { [%txt "LA CATALANE : le fou ira en g2, contre notre aile dame."] [%eval 0.37] [%cal Gg3g2] }
4... Be7 { [%txt "Développement simple."] [%eval 0.39] [%cal Ge8g8] }
5. Bg2 { [%txt "Le fou vise a8 à travers d5."] [%eval 0.35] }
5... O-O { [%txt "Roque."] [%eval 0.37] [%csl Gg8] }
6. O-O { [%txt "Les Blancs roquent."] [%eval 0.31] }
6... dxc4 { [%txt "On prend le pion c4 : le fou g2 tire désormais dans le vide jusqu'à b7."] [%eval 0.28] [%cal Gd5c4] }
7. Qc2 { [%txt "La dame va récupérer le pion."] [%eval 0.23] }
(7. Nfd2 { [%txt "Le cavalier part reprendre c4, mais d4 perd son défenseur : l'évaluation passe de +0.28 à -1.07."] [%hint "le cavalier f3 quitte sa case : il était le seul défenseur de d4 avec la dame."] [%hint "le pion d4. Notre dame d8 le prend par la colonne d."] [%hint "7...Qxd4 : la dame prend le pion."] [%hintcsl Rd4] [%eval -1.07] }
  7... Qxd4 { [%txt "La dame prend le pion."] [%eval -1.05] [%cal Gd8d4] }
  8. Qc2 { [%txt "La dame blanche vise c4."] [%eval -1.19] }
  8... Nc6 { [%txt "Développement."] [%eval -1.12] [%cal Gc6e5] }
  9. Nxc4 { [%txt "À RETENIR.

PRO TIP : -1.09, un pion net de plus. Le cavalier f3 défend d4 : quand il part, compte les défenseurs de d4 avant toute autre chose."] [%eval -1.09] [%csl Gd4] })
(7. e4 { [%txt "Une poussée qui laisse le pion e4 seul : l'évaluation passe de +0.28 à -1.26."] [%hint "les Blancs poussent e4 alors que leur cavalier f3 bouche la diagonale du fou g2."] [%hint "le pion e4. Notre cavalier f6 l'attaque, et aucune pièce blanche ne le défend."] [%hint "7...Nxe4 : le cavalier prend le pion."] [%hintcsl Re4,Gf6] [%eval -1.26] }
  7... Nxe4 { [%txt "Le cavalier prend le pion."] [%eval -1.16] [%cal Gf6e4] }
  8. Qe2 { [%txt "La dame attaque le cavalier e4 et le pion c4."] [%eval -1.32] }
  8... Nd6 { [%txt "À RETENIR.

PRO TIP : -1.22, un pion de plus. Le cavalier recule en défendant c4. Avant d'avancer un pion central, vérifie qu'une pièce le défend."] [%eval -1.22] [%cal Gd6c4] })
7... a6 { [%txt "On prépare ...b5 pour garder du temps."] [%eval 0.31] [%cal Ga6b5] }
8. Qxc4 { [%txt "La dame récupère le pion."] [%eval 0.23] }
8... b5 { [%txt "Le pion chasse la dame avec gain de temps."] [%eval 0.25] [%cal Gb5c4] }
9. Qc2 { [%txt "La dame recule."] [%eval 0.28] }
9... Bb7 { [%txt "Le fou sort sur la grande diagonale et neutralise le fou g2."] [%eval 0.24] [%cal Gb7g2] }
(9... Nc6 { [%txt "LA VARIANTE PIÉGÉE : un coup de développement naturel…"] [%eval 4.22] [%csl Rc6] }
  10. Qxc6 { [%txt "…mais la dame c2 prend le cavalier par la colonne c. À RETENIR.

PRO TIP : +4.35, une pièce de moins. Avec une dame blanche en c2, la case c6 est attaquée par la colonne c : regarde les lignes ouvertes avant de développer."] [%eval 4.35] })
10. Bd2 { [%txt "Le fou se développe."] [%eval 0.24] }
(10. Ne5 { [%txt "Le cavalier saute au centre, mais ouvre notre diagonale : l'évaluation passe de +0.24 à -1.53."] [%hint "le cavalier quitte f3 : il ne défend plus d4, et il ne bouche plus la diagonale b7-g2."] [%hint "le fou g2 et le pion d4. Après ...Bxg2 Kxg2, notre dame prend d4."] [%hint "10...Bxg2 11.Kxg2 Qxd4 : on échange les fous et on gagne d4."] [%hintcsl Rg2,Rd4] [%eval -1.53] }
  10... Bxg2 { [%txt "On échange les fous."] [%eval -1.75] [%cal Gb7g2] }
  11. Kxg2 { [%txt "Le roi reprend."] [%eval -1.73] }
  11... Qxd4 { [%txt "La dame prend d4 et attaque le cavalier e5."] [%eval -1.56] [%cal Gd4e5] }
  12. Qxc7 { [%txt "Les Blancs récupèrent un pion."] [%eval -1.62] }
  12... Bd6 { [%txt "À RETENIR.

PRO TIP : -1.74. Le fou attaque la dame c7 et nos pièces sont plus actives. La leçon : en Catalane, le cavalier f3 défend d4 ET bouche la grande diagonale ; quand il part, les deux à la fois s'ouvrent."] [%eval -1.74] [%cal Gd6c7] })
10... Be4 { [%txt "Le fou chasse la dame de la diagonale b1-h7."] [%eval 0.21] [%cal Ge4c2] }
11. Qc1 { [%txt "La dame recule."] [%eval 0.25] }
11... c6 { [%txt "On soutient b5 et on prépare ...Nbd7."] [%eval 0.32] [%cal Gc6b5] }
12. a4 { [%txt "Les Blancs attaquent b5."] [%eval -0.01] }
12... Nbd7 { [%txt "Développement : le cavalier soutient c5 et b6."] [%eval 0.05] [%cal Gd7b6] }
13. Nc3 { [%txt "Le cavalier attaque le fou e4."] [%eval 0.20] }
13... Bg6 { [%txt "Le fou recule en gardant la diagonale b1-h7.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.25).
1. ...Qb6 ou ...Qb8 : la dame relie les tours et soutient b5.
2. ...Rfc8 puis ...c5 : la poussée libératrice, qui ouvre la colonne c.
3. Ne jamais rendre la grande diagonale : le fou b7 ou g6 doit rester actif."] [%eval 0.25] [%cal Gc6c5] } *`,
    ),
  ],
};
