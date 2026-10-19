import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « La restriction des pièces adverses » (positional_mastery, module 21)
 * — format « un commentaire par coup ».
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, entièrement
 * réécrite ici) : parties de « The Most Instructive Games of Chess Ever
 * Played » de Chernev (`chernev1.pgn`) — Bernstein – Mieses (1904, n°38),
 * Mattison – Nimzowitsch (1929, n°6), Panov – Taimanov (1952, n°34),
 * Barden – Rossolimo (1950, n°23) et Menchik – Capablanca (1931, n°17) ; le
 * fragment Botvinnik – Sorokin (championnat d'URSS 1931) vient de l'étude
 * Lichess « IM Jeremy Silman's Lessons in Strategy » (e2P29Eva), déjà rejouée
 * pour `COURSE_LESSONS` ; ses coups sont numérotés depuis le début de
 * l'extrait, pas depuis le début de la partie. Le chapitre de théorie suit la
 * variante Hübner de la Nimzo-indienne, ligne d'ouverture standard.
 *
 * Plan : définition — la variante Hübner, des pions qui enferment deux fous
 * (1) ; Botvinnik – Sorokin : chasser le cavalier vers le bord (2), la cage
 * b3! (3), exploiter la cage avec le roi (4) ; Bernstein – Mieses : la
 * grille des cases noires (5), le fou c5 qui domine et la marche du roi (6) ;
 * Mattison – Nimzowitsch : le cavalier c4 qui paralyse tout un camp (7) ;
 * Panov – Taimanov : échanger la pièce qu'on ne peut pas enfermer (8) ;
 * Barden – Rossolimo : bon cavalier contre mauvais fou (9) ; Menchik –
 * Capablanca : enfermer un fou dans le coin avec des pions (10).
 *
 * Toutes les lignes ont été rejouées avec chess.js et chaque coup sondé avec
 * Stockfish 18 (profondeur 18, 3 candidats par coup), suites du moteur
 * comprises. Règle appliquée : quand un coup perd environ 0,5 pion ou plus
 * par rapport au choix du moteur, la LIGNE PRINCIPALE suit le moteur et le
 * coup de la partie passe en variante, signalée comme fautive. Exception :
 * dans une position déjà décisive (plus de 3 pions environ), un écart est
 * seulement signalé dans le commentaire. Les coups proches du seuil ont été
 * resondés trois fois avec un moteur neuf et tranchés sur la moyenne :
 * 1.Qe3 de Botvinnik (0,51), 13.Kg1 de Mattison (0,67), 17.f4 de Bernstein
 * (0,75) et 19...Rd8 de Taimanov (0,57) sont au-dessus du seuil ; 4.Rc1 de
 * Botvinnik (0,45 à 0,49) reste dans la ligne principale. Plusieurs chapitres
 * commencent donc juste après une faute signalée dans l'introduction. Les
 * évaluations citées sont du point de vue des Blancs. Aucun résultat de
 * partie (1-0, 0-1…) dans les variantes : le parseur s'y arrêterait.
 *
 * Écartés après sondage : les morceaux de Bernstein – Mieses entre les coups
 * 21 et 24 (21.a4, 23.Bb6 et 24.Ke3 perdent de 0,8 à 1,5 pion) et le début
 * de Barden – Rossolimo (15.Qd2, 21.Nd5 coûtent 0,7 à 1 pion).
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const LA_RESTRICTION_DES_PIECES: CourseTree = {
  chapters: [
    chapter(
      "Définition : la variante Hübner, des pions qui enferment deux fous",
      START,
      `{ RESTREINDRE une pièce, c'est lui retirer ses cases utiles sans forcément l'attaquer. Elle reste sur l'échiquier, mais elle ne sert presque plus à rien.

Trois outils pour restreindre :
- les PIONS : un pion contrôle deux cases pour toujours, et il ne se laisse pas chasser facilement ;
- les PIÈCES MINEURES : un cavalier ou un fou bien placé interdit à lui seul plusieurs cases ;
- l'ÉCHANGE : quand une pièce adverse ne peut pas être enfermée, on l'échange contre une de ses pièces moins utiles.

Nimzowitsch appelait cela le « blocage » : immobiliser d'abord, attaquer ensuite. La variante Hübner de la Nimzo-indienne en est l'exemple type. Les Noirs donnent leur fou contre le cavalier c3. Puis ils placent leurs pions de façon à enfermer les DEUX fous blancs : le fou de cases noires bute sur les pions c5, d6, e5 ; le fou de cases blanches bute sur les propres pions blancs c4, d5, e4.

PRO TIP : avant de chercher une attaque, regarde quelle pièce adverse pourrait devenir forte. Pose un pion sur la case qu'elle vise : un seul pion bien placé vaut souvent toute une manœuvre. }
1. d4 { Le pion dame prend le centre. Presque aussi bon que 1.e4. }
1... Nf6 { Le cavalier contrôle e4 et attend de voir le plan blanc. Presque aussi bon que 1...d5. }
2. c4 { Le pion c gagne de l'espace et vise d5. Le meilleur coup. }
2... e6 { Le pion ouvre la diagonale du fou f8 vers b4. Presque aussi bon que 2...c6. }
3. Nc3 { Le cavalier soutient la poussée e2-e4. Presque aussi bon que 3.Nf3. [%cal Gc3e4] }
3... Bb4 { La Nimzo-indienne : le fou cloue le cavalier c3, qui ne défend plus e4. Le meilleur coup. [%cal Gb4c3,Gc3e1] }
4. e3 { La variante Rubinstein : les Blancs ouvrent la diagonale du fou f1 et visent le roque. Presque aussi bon que 4.Qc2. }
4... c5 { Le pion c attaque d4 tout de suite. Presque aussi bon que 4...O-O. [%cal Gc5d4] }
5. Bd3 { Le fou se développe et vise e4. Le meilleur coup. }
5... Nc6 { Le cavalier ajoute une deuxième attaque sur d4. Presque aussi bon que 5...O-O. [%cal Gc6d4] }
6. Nf3 { Le cavalier défend d4. Presque aussi bon que 6.dxc5. }
6... Bxc3+ { LE DÉBUT DU PLAN HÜBNER. Les Noirs donnent la paire de fous pour doubler les pions c blancs. Ils vont maintenant tout faire pour que ces deux fous n'aient aucune ligne. Le meilleur coup. }
7. bxc3 { Le pion reprend vers le centre. Les Blancs ont deux fous et un pion doublé c3-c4. Le meilleur coup. }
7... d6 { Le pion d6 prépare ...e5. Les pions noirs vont se placer sur des cases NOIRES : celles du fou c1. Le meilleur coup. [%csl Rc1] }
8. e4 { Les Blancs prennent le centre. Presque aussi bon que 8.h3. }
8... e5 { Le pion e5 complète la chaîne c5-d6-e5, toute sur cases noires. Le fou c1 voit déjà ses diagonales fermées. Le meilleur coup. [%csl Gc5,Gd6,Ge5] }
9. d5 { Les Blancs ferment le centre. Mais leurs pions c4, d5, e4 sont sur cases BLANCHES : ils bouchent aussi leur propre fou d3. Presque aussi bon que 9.h3. [%csl Rd3,Rc4,Rd5,Re4] }
9... Ne7 { Le cavalier recule pour viser g6 et f5. Le meilleur coup. [%cal Ge7g6] }
10. Nh4 { Le cavalier vise f5 et prépare la poussée f2-f4, la seule façon d'ouvrir le jeu pour les fous. Le meilleur coup. [%cal Gh4f5,Gf2f4] }
10... h6 { Le pion interdit g5 au fou c1 avant même qu'il sorte. Le meilleur coup. [%csl Rg5] }
11. f4 { Le levier attendu : les Blancs veulent ouvrir la colonne f et la diagonale du fou c1. Le meilleur coup. [%cal Rf4e5] }
11... Ng6 { Le cavalier propose l'échange du cavalier h4, la seule pièce blanche qui visait f5. Le meilleur coup. [%cal Gg6h4] }
12. Nxg6 { Le cavalier prend. Le meilleur coup : laisser le cavalier g6 attaquer f4 était pire. }
12... fxg6 { Le pion reprend vers le centre. Le pion g6 tient la case f5 pour toujours, et la colonne f s'entrouvre pour la tour noire. Le meilleur coup. [%csl Gf5] }
13. fxe5 { Les Blancs ouvrent la colonne f. 13.O-O était un peu plus précis, environ 0,3 pion. }
13... dxe5 { Le pion reprend. Maintenant le pion e5 est fixé et protégé, le pion c5 aussi : le fou c1 n'a toujours aucune diagonale vers le camp noir. Le meilleur coup. [%csl Gc5,Ge5] }
14. Be3 { Le fou vise c5, la seule cible de cases noires. Presque aussi bon que 14.O-O. [%cal Ge3c5] }
14... b6 { Le pion protège c5 une fois de plus. Le fou e3 frappe contre un mur. Le meilleur coup. [%cal Gb6c5] }
15. O-O { Le roque. 15.h3 était un peu plus précis, environ 0,25 pion. }
15... O-O { Le roque. La tour f8 regarde la colonne f, que le pion g6 empêche les Blancs d'utiliser pour entrer. Le meilleur coup. }
16. a4 { Les Blancs veulent jouer a5 pour ouvrir une ligne à l'aile dame. Presque aussi bon que 16.Be2. [%cal Ga4a5] }
16... a5 { Le pion bloque a4 : plus aucun levier blanc à l'aile dame. C'est aussi de la restriction, contre les PIONS cette fois. Le meilleur coup. [%csl Ra4] }
17. Rb1 { La tour vient sur la colonne b, où elle ne trouve que le pion b6, bien protégé. Presque aussi bon que 17.Be2. }
17... Bd7 { Le fou se développe et vise le pion a4. Presque aussi bon que 17...g5. }
18. Rb2 { Les Blancs préparent un doublement sur la colonne f. 18.Bf2 était un peu plus précis, environ 0,2 pion. }
18... Rb8 { La tour protège b6. Les Noirs sont un peu mieux : environ -0,5. Les deux fous blancs n'ont aucune diagonale active, alors que le cavalier noir trouvera les cases h5, f4 et g4.

Bilan : la restriction ne demande ni sacrifice ni attaque. Des pions posés sur les bonnes cases ont transformé la paire de fous blanche en deux pièces passives. [%csl Rd3,Re3] }`,
    ),
    chapter(
      "Botvinnik – Sorokin (URSS 1931) : chasser le cavalier vers le bord",
      "r1b2rk1/1p3pp1/pn3n1p/4p3/P3P3/2N1PN2/BP1R2PP/3R2K1 b - - 0 2",
      `{ Mikhaïl Botvinnik – Nikolaï Sorokin, championnat d'URSS 1931. Les coups sont numérotés depuis le début de l'extrait. Les dames viennent d'être échangées : 1.Qe3 Qxe3 2.fxe3. Stockfish préférait 1.Rc2, qui garde les dames, d'environ 0,5 pion, mais les Blancs restent mieux, environ +0,9.

Le fil rouge des trois chapitres sur cette partie : un cavalier noir est poussé case après case vers le bord, puis enfermé.

Pourquoi le bord ? Un cavalier au centre contrôle huit cases, un cavalier sur la colonne a n'en contrôle que quatre au plus. Et il lui faut plusieurs coups pour revenir. Chaque poussée de pion qui le chasse est donc un petit gain durable.

PRO TIP : quand un cavalier adverse n'a qu'une ou deux cases de repli, compte-les avant chaque coup. Un seul pion de plus, au bon endroit, peut lui retirer la dernière. }
2... Bg4 { Le fou cloue le cavalier f3 sur la tour d1, par la diagonale g4-f3-e2-d1. Presque aussi bon que 2...Re8. [%cal Gg4d1] }
3. a5 { LE PREMIER PAS. Le pion attaque le cavalier b6 et gagne de l'espace. Le meilleur coup. [%cal Ra5b6] }
3... Nc8 { Le cavalier recule sur la dernière rangée, une case sans avenir. 3...Nbd7 se valait selon Stockfish, mais aucun repli ne donne une bonne case. [%csl Rc8] }
4. Rc1 { La tour prend la colonne c ouverte et sort du clouage. 4.h3 était un peu plus précis : trois passes du moteur donnent 0,45 à 0,49 pion d'écart, juste sous le seuil. [%cal Gc1c8] }
4... Bxf3 { Le fou prend le cavalier. Le meilleur coup. }
5. gxf3 { Le pion reprend. Les pions f sont doublés, mais ils tiennent e4 et les cases g4 et e5 ne serviront plus aux pièces noires. Le meilleur coup. }
5... Ne7 { Le cavalier c8 repart vers le centre par e7. Le meilleur coup. [%cal Gc8e7] }
6. Nd5 { Le cavalier blanc saute sur la case forte d5. Presque aussi bon que 6.b4. [%cal Gc3d5] }
6... Nfxd5 { Le meilleur coup : les Noirs échangent tout de suite le cavalier d5 et gardent leur structure intacte. [%cal Gf6d5] }
(6... Nc6 { L'ERREUR DE LA PARTIE, environ 1,5 pion de moins que 6...Nfxd5. Le cavalier vise a5, mais il laisse le cavalier f6 se faire échanger avec dommage pour la structure noire. }
7. Nxf6+ { Le cavalier prend avec échec et casse les pions noirs. Le meilleur coup. [%cal Rd5f6] }
7... gxf6 { La reprise forcée : 7...Kh8 serait encore pire. Le pion f7 est maintenant faible et isolé. Le meilleur coup. [%csl Rf7] }
8. Rd7 { La tour entre en 7e rangée et attaque b7 et f7. Le meilleur coup. [%cal Rd7b7,Rd7f7] }
8... Rab8 { La tour protège b7. Presque aussi bon que 8...Kg7. }
9. Kf2 { Le roi se rapproche du centre et vise g3, puis h4. 9.Bd5 était un peu plus précis, environ 0,2 pion. [%cal Gf2g3] }
9... Rbd8 { Presque aussi bon que 9...Rfd8 : la tour conteste la colonne d et ne touche pas au pion a5. Les Blancs restent nettement mieux. [%cal Gd8d7] }
(9... Nxa5 { LE COUP DE LA PARTIE, environ 0,8 pion de moins que 9...Rbd8. Le cavalier prend le pion a5, mais il atterrit sur le bord, d'où il ne ressortira plus. Le chapitre suivant reprend ici. [%csl Ra5] }
10. Rcc7 { Les deux tours blanches s'installent en 7e rangée. Le meilleur coup. Suite au chapitre suivant. [%cal Gc7f7] })
10. Rcd1 { La seconde tour vient soutenir la tour d7. Presque aussi bon que 10.Rg1+. [%cal Gc1d1] }
10... Kg7 { Le roi protège f6 et se rapproche du centre. Le meilleur coup. }
11. Kg3 { Le roi blanc avance encore : il visera h4 et h5. Environ +3 pour les Blancs. [%cal Gg3h4] })
7. Bxd5 { Le fou reprend et s'installe en d5. Presque aussi bon que 7.exd5. }
7... Rab8 { La tour protège b7. Le meilleur coup. }
8. Ba2 { Le fou se replie hors de portée, sur sa diagonale a2-g8. Le meilleur coup. }
8... Rfd8 { La tour conteste la colonne d. Le meilleur coup. }
9. Rxd8+ { Les tours s'échangent. Le meilleur coup. }
9... Rxd8 { La tour noire reprend la colonne d. Le meilleur coup. }
10. Rc7 { La tour blanche entre en 7e rangée. Les Blancs sont un peu mieux, environ +0,5, mais rien de décisif.

Bilan : avec la bonne réponse 6...Nfxd5, les Noirs restaient solides. Toute la suite de la partie, avec le cavalier enfermé, vient de 6...Nc6 et de 9...Nxa5. [%cal Gc7b7] }`,
    ),
    chapter(
      "Botvinnik – Sorokin : la cage b3!",
      "1r3rk1/1p1R1p2/p4p1p/n3p3/4P3/4PP2/BP3K1P/2R5 w - - 0 10",
      `{ Suite de la partie après 9...Nxa5. Le cavalier noir a pris un pion, mais il se trouve sur a5, au bord de l'échiquier. Les Blancs sont environ +3,3.

Le plan blanc en deux temps :
- d'abord doubler les tours en 7e rangée pour gagner du matériel ;
- ensuite poser un pion qui retire au cavalier a5 sa dernière case, c4.

Une fois la cage fermée, les Blancs joueront pratiquement avec une pièce de plus. Comme la position est déjà décisive, les petits écarts avec le moteur sont seulement signalés.

PRO TIP : pour enfermer un cavalier sur le bord, liste ses cases : ici b7, c6, c4 et b3. Il suffit qu'une pièce ou un pion contrôle chacune d'elles. Le pion est le meilleur gardien, car il ne se laisse pas chasser. }
10. Rcc7 { Les deux tours en 7e rangée attaquent f7. Le meilleur coup. [%cal Rc7f7,Rd7f7] }
10... Rbc8 { La tour veut échanger la tour c7. 10...Rfc8 était plus tenace selon Stockfish, mais la position est déjà décisive. }
11. Rxf7 { La tour prend f7 et attaque la tour f8. 11.Bxf7+ était encore plus fort selon Stockfish ; l'écart ne change pas le résultat. [%cal Rf7f8] }
11... Rxc7 { La tour noire échange sa collègue : sinon, la tour f8 tombe. Le meilleur coup. }
12. Rxc7+ { La tour reprend avec échec. Le meilleur coup. }
12... Kh8 { Le roi va dans le coin, le seul abri. Le meilleur coup. }
13. Bd5 { Le fou s'installe au centre. Il contrôle c6 et b7, deux cases de sortie du cavalier, et il protège e4. Le meilleur coup. [%cal Gd5c6,Gd5b7] }
13... b5 { Le pion b protège c4 pour préparer ...Nc4, la seule sortie qui reste au cavalier. Le meilleur coup. [%cal Gb5c4] }
14. b3 { LE COUP DU CHAPITRE. Le pion b3 contrôle c4 : le cavalier a5 n'a plus une seule case sûre. Nc4 est pris par le pion, Nb7 par la tour, Nc6 par le fou, et Nxb3 donne une pièce pour un pion. Le meilleur coup. [%csl Ra5,Rc4,Rb7,Rc6][%cal Gb3c4] }
14... Rd8 { La tour attaque le fou d5, protégé par le pion e4. Le cavalier a5, lui, regarde le jeu sans pouvoir y participer.

Bilan : le pion b3 vaut plus qu'un pion. Il neutralise un cavalier entier, et les Blancs joueront désormais avec une pièce de plus partout ailleurs. [%cal Gd8d5] }`,
    ),
    chapter(
      "Botvinnik – Sorokin : exploiter la cage avec le roi",
      "3r3k/2R5/p4p1p/np1Bp3/4P3/1P2PP2/5K1P/8 w - - 1 15",
      `{ Suite de la partie. Le cavalier a5 est enfermé : il ne peut pas sortir sans être pris. Les Blancs sont environ +5.

Que faire d'un avantage de ce genre ? Ne pas se presser. La pièce enfermée ne s'échappera pas : on a tout le temps d'améliorer ses autres pièces, à commencer par le roi.

Dans ce chapitre, le roi blanc marche vers h5, la tour cherche des cibles, et les Noirs n'ont que des coups de tour à jouer. Les écarts avec le moteur sont signalés, car tout gagne.

PRO TIP : une pièce enfermée crée une supériorité locale partout ailleurs. Fais entrer ton roi : en finale, c'est souvent la pièce qui finit le travail. }
15. Kg3 { Le roi se met en route vers h4 et h5. Le meilleur coup. [%cal Gf2g3,Gg3h4] }
15... f5 { Le pion f attaque e4 pour ouvrir un peu le jeu. Le meilleur coup. [%cal Rf5e4] }
16. Kh4 { Le roi continue sa marche sans se soucier de f5. Le meilleur coup. [%cal Gh4h5] }
16... fxe4 { Le pion prend en e4. Le meilleur coup. }
17. fxe4 { Le pion reprend et protège de nouveau le fou d5. Le meilleur coup. }
17... Rd6 { La tour vient en 6e rangée pour défendre le pion h6. Le désespéré 17...Nxb3 était à peu près équivalent : le cavalier ne peut sortir qu'en se sacrifiant. [%cal Gd6h6] }
18. Kh5 { Le roi blanc attaque le pion h6. Le meilleur coup. [%cal Rh5h6] }
18... Rf6 { La tour coupe le roi sur la colonne f et défend h6 par la rangée. Le meilleur coup. }
19. h3 { Un coup d'attente : le pion avance doucement. 19.h4 était à peine plus précis. }
19... Rd6 { La tour revient : les Noirs n'ont rien d'autre à jouer. 19...Rf3 était un peu plus actif. }
20. h4 { Le pion avance d'une case de plus. Les Blancs ne risquent rien, ils améliorent. Le meilleur coup. }
20... Rb6 { La tour change encore de case. Le cavalier a5 ne bouge toujours pas. Le meilleur coup. }
21. Kg4 { Le roi revient vers f5, d'où il visera le pion e5. Le meilleur coup. [%cal Gg4f5] }
21... Rf6 { La tour coupe de nouveau le roi sur la colonne f. Le meilleur coup. }
22. Ra7 { La tour attaque le pion a6 et attache la tour noire. Presque aussi bon que 22.h5. [%cal Ra7a6] }
22... Rb6 { La tour protège a6. Le meilleur coup. }
23. Re7 { La tour attaque e5, que rien ne peut défendre. Si le cavalier sort par c6, le fou d5 le prend et le pion e5 tombe quand même. Presque aussi bon que 23.Rd7. Les Noirs ont abandonné ici.

Bilan : pendant neuf coups, le cavalier a5 n'a pas bougé. Les Blancs ont joué à plusieurs pièces contre une tour seule. [%cal Re7e5][%csl Ra5] }`,
    ),
    chapter(
      "Bernstein – Mieses (Coburg 1904) : la grille des cases noires",
      "r1bqkb1r/p2p1ppp/2p1pn2/8/4P3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 7",
      `{ Ossip Bernstein – Jacques Mieses, 1904. Une Sicilienne : les Noirs ont repris en c6 avec le pion b, leurs pions c6 et e6 sont sur cases BLANCHES.

Le thème : les Blancs vont prendre le contrôle des cases NOIRES du centre, d6, e5, c5 et d4. Les pions noirs ne pourront plus avancer sans perte, et les pièces noires derrière eux n'auront plus de place.

Retiens ce mécanisme : quand les pions d'un camp sont sur une couleur, les cases de l'autre couleur deviennent des trous. L'adversaire peut y installer ses pièces sans jamais être chassé.

PRO TIP : pour restreindre toute une armée, vise les cases de la couleur que ses pions ne contrôlent plus. Échange le fou adverse de cette couleur, et ces cases deviennent les tiennes. }
7. e5 { Le pion chasse le cavalier f6 et prend la case d6 sous contrôle. Le meilleur coup. [%cal Re5f6][%csl Gd6] }
7... Nd5 { Le cavalier se centralise. Le meilleur coup. }
8. Ne4 { Le cavalier vise d6, la case clé. Le meilleur coup. [%cal Ge4d6] }
8... f5 { Le pion chasse le cavalier, mais il affaiblit encore e6 et les cases noires. 8...Bb7 était un peu plus précis, environ 0,3 pion. [%cal Rf5e4] }
9. exf6 { La prise en passant. Le meilleur coup. }
9... Nxf6 { Le cavalier reprend. Le meilleur coup. }
10. Nd6+ { Le cavalier entre en d6 avec échec. Le meilleur coup. [%cal Rd6e8] }
10... Bxd6 { Le fou f8 doit s'échanger : c'était le seul fou noir de cases noires. Le meilleur coup. [%csl Rd6] }
11. Qxd6 { La dame occupe d6. Elle interdit le petit roque, car elle voit f8, et elle bloque le pion d7. Le meilleur coup. [%cal Rd6f8][%csl Rd7] }
11... Ne4 { Le cavalier attaque la dame pour la chasser de d6. 11...Qb6 était plus précis, environ 0,4 pion. [%cal Re4d6] }
12. Qd4 { La dame recule en attaquant le cavalier e4. 12.Qe5 était un peu plus précis, environ 0,4 pion. [%cal Gd4e4] }
12... Nf6 { Le cavalier recule. Le meilleur coup. }
13. Qd6 { La dame revient en d6. Presque aussi bon que 13.Be2. }
13... Ne4 { Le cavalier attaque de nouveau la dame. 13...Qb6 restait plus précis. }
14. Qb4 { La dame quitte d6 mais reste sur la diagonale b4-f8 : le petit roque est toujours interdit, et le cavalier e4 est attaqué. 14.Qe5 était un peu plus précis. [%cal Gb4f8,Gb4e4] }
14... d5 { Le pion protège le cavalier. Mais c'est un pion de plus sur case blanche : le fou c8 a de moins en moins d'air. Presque aussi bon que 14...Nf6. [%csl Rc8,Rc6,Rd5,Re6] }
15. Bd3 { Le fou se développe en attaquant le cavalier une deuxième fois. Le meilleur coup. [%cal Gd3e4] }
15... Qd6 { La dame propose l'échange pour enfin pouvoir roquer. Le meilleur coup. }
16. Qxd6 { Les dames s'échangent. Le meilleur coup. }
16... Nxd6 { Le cavalier reprend. Les pions c6, d5, e6 sont tous sur cases blanches : le fou c8 est un mauvais fou, et les cases noires e5, c5, d4 sont des trous. Le meilleur coup. [%csl Gc5,Gd4,Ge5,Rc8] }
17. Bf4 { Le meilleur coup selon Stockfish : le fou de cases noires prend la diagonale qui mène à e5 et vise le pion g7. [%cal Gf4e5,Ge5g7] }
(17. f4 { LE COUP DE LA PARTIE. Le pion empêche pour toujours ...e5, la seule poussée qui aurait libéré le jeu noir. C'est de la restriction pure, mais Stockfish le juge environ 0,75 pion moins fort que 17.Bf4 : il prend la case f4 au fou c1. [%csl Re5] }
17... a5 { Les Noirs veulent sortir le fou par a6. Le meilleur coup. [%cal Gc8a6] }
18. Be3 { Le fou vise c5 et d4, deux trous noirs. 18.Be2 était un peu plus précis. [%cal Ge3c5] }
18... Ba6 { Le fou propose l'échange du fou d3, la seule façon de se débarrasser de son mauvais fou. Le meilleur coup. [%cal Ga6d3] }
19. Kd2 { Le roi se rapproche du centre. 19.O-O-O était à peine plus précis. }
19... Kd7 { Presque aussi bon que 19...Bxd3 : le roi noir se centralise et la position reste à peu près égale. }
(19... Nc4+ { LE COUP DE LA PARTIE, environ 1,7 pion de moins que 19...Kd7. Le cavalier s'échange contre le fou d3 : il reste aux Noirs le mauvais fou, face à un bon fou blanc qui régnera sur les cases noires. }
20. Bxc4 { Le fou d3 élimine le cavalier : le mauvais fou noir va rester seul face au fou de cases noires. Le meilleur coup. }
20... Bxc4 { Le fou reprend. 20...dxc4 se valait. Le fou noir est actif pour un instant, mais il ne contrôle aucune case noire. }
21. Bc5 { Le fou blanc s'installe en c5, en plein trou noir, d'où personne ne peut le chasser. Environ +1,9. [%csl Gc5] })
20. Bd4 { Le fou s'installe en d4, un autre trou noir. Presque aussi bon que 20.b3. La position est à peu près égale. [%csl Gd4] })
17... Kd7 { Le roi protège e6 et se rapproche du centre. Le meilleur coup. }
18. Be5 { Le fou s'installe en e5, sur le trou, et attaque g7 et le cavalier d6. Presque aussi bon que 18.c4. [%cal Ge5g7,Ge5d6] }
18... a5 { Le pion a fait de la place au fou c8, qui sortira par a6. Le meilleur coup. }
19. Bxg7 { Le fou prend le pion g7. Presque aussi bon que 19.O-O. }
19... Rg8 { La tour attaque le fou g7. Le meilleur coup. }
20. Be5 { Le fou revient sur le trou e5. Les Blancs ont un pion de plus, environ +0,8. 20.Bd4 se valait.

Bilan : 7.e5! et l'échange du fou f8 ont donné aux Blancs toutes les cases noires du centre. Les pions noirs, figés sur les cases blanches, ne servent plus qu'à boucher le fou c8. [%csl Ge5,Gd4,Gc5] }`,
    ),
    chapter(
      "Bernstein – Mieses : le fou c5 qui domine et la marche du roi",
      "2b4r/3k2pp/rBp1p3/p2p4/P4P2/1P2K3/2P3PP/R6R w - - 5 25",
      `{ Suite de la partie, quelques coups plus tard. Les Blancs ont un fou de cases noires, les Noirs un fou de cases blanches enfermé derrière ses propres pions. Les Blancs sont environ +2.

Entre les coups 21 et 24, les Blancs ont été imprécis : 21.a4, 23.Bb6 et 24.Ke3 coûtaient 0,8 à 1,5 pion selon Stockfish, qui proposait chaque fois Bc5. Les Blancs jouent enfin ce coup ici.

Observe ce qui se passe ensuite : le roi blanc entre par les cases noires d4, e5 puis f6, comme sur une autoroute. Les pions noirs c6, d5, e6 ne peuvent pas l'arrêter, car ils ne contrôlent que des cases blanches. Dans la position décisive de la fin, les écarts avec le moteur sont seulement signalés.

PRO TIP : quand l'adversaire est bloqué, ne te précipite pas. Améliore chaque pièce l'une après l'autre, puis le roi. Le coup qui gagne viendra tout seul. }
25. Bc5 { LE FOU QUI DOMINE. Depuis c5, il contrôle d6, e7, f8, b6 et d4. Le roi noir ne peut pas aller en d6, les tours ne peuvent pas entrer par f8 ou e7. Le meilleur coup. [%csl Gc5][%cal Gc5f8,Gc5d6] }
25... Kc7 { Le roi noir cherche à jouer ...Kb7. Presque aussi bon que 25...Ra8. }
26. Kd4 { Le roi blanc s'installe en d4, un trou noir. Le pion d5 est attaqué et les pions noirs sont figés. Le meilleur coup. [%csl Gd4][%cal Gd4e5] }
26... Bd7 { Le fou cherche une autre diagonale, vers e8 et h5. Presque aussi bon que 26...h6. }
27. Rhe1 { La tour vient sur la colonne e, vers e5. 27.Rae1 était un peu plus précis, environ 0,3 pion. [%cal Ge1e5] }
27... h5 { Le pion avance pour donner de l'air à la tour h8. 27...Raa8 était un peu plus solide. }
28. Re5 { La tour s'installe sur la case noire e5 et attaque h5. Le meilleur coup. [%cal Re5h5] }
28... g6 { Le pion protège h5. Mais il crée une nouvelle cible en g6. Presque aussi bon que 28...Rh7. }
29. Rg5 { La tour attaque g6. Le meilleur coup. [%cal Rg5g6] }
29... Rg8 { La tour défend g6, mais elle devient passive. 29...Rh6 était un peu plus précis. }
30. Ke5 { Le roi entre en e5, une autre case noire, et vise f6. Le meilleur coup. [%cal Ge5f6] }
30... Be8 { Le fou protège g6 une deuxième fois. Il est complètement enfermé derrière ses pions. Presque aussi bon que 30...h4. [%csl Re8] }
31. Re1 { La seconde tour vient en e1, derrière le roi, contre le pion e6. Presque aussi bon que 31.Kf6. [%cal Ge1e6] }
31... Ra8 { La tour revient à la maison : elle n'avait aucune case utile en a6. Le meilleur coup. }
32. Kf6 { LE ROI EN F6. Il attaque e6 et g6. Il est entré au cœur du camp noir uniquement par des cases noires. Presque aussi bon que 32.Kxe6. [%cal Rf6e6,Rf6g6] }
32... Bd7 { Le fou protège e6. Les Noirs sont presque en zugzwang. 32...h4 tenait un peu mieux. }
33. g3 { Un coup d'attente qui protège h4 et f4 de loin. Le meilleur coup. }
33... Rae8 { La tour défend e6 une fois de plus. 33...d4 était un peu plus tenace. }
34. Ree5 { La seconde tour bloque le pion e6. 34.Rxg6 était plus direct d'environ 0,8 pion, mais la position est déjà gagnée. [%csl Re6] }
34... Rh8 { La tour quitte g8 : le pion g6 n'est plus défendable. Presque aussi bon que 34...h4. }
35. Rxg6 { La tour prend g6. Le meilleur coup. }
35... Rh7 { La tour veut défendre la 7e rangée. 35...Kb7 était un peu plus tenace. }
36. Rg7 { La tour s'installe en 7e rangée et attaque la tour h7 et le fou d7. Le meilleur coup. [%cal Rg7h7] }
36... Reh8 { La tour protège h7. 36...Rh6+ était plus tenace. }
37. Rxh7 { Les tours s'échangent : avec un pion de plus et un roi aussi actif, chaque échange rapproche du gain. Le meilleur coup. }
37... Rxh7 { La tour noire reprend en h7, seule contre la tour et le roi blancs. Le meilleur coup. }
38. Kg6 { Le roi attaque la tour h7 et le pion h5. Le meilleur coup. [%cal Rg6h7,Rg6h5] }
38... Rh8 { La tour recule. Le meilleur coup. }
39. Kg7 { Le roi chasse encore la tour : elle doit quitter la colonne h, et le pion h5 va tomber. Le meilleur coup. Environ +6.

Bilan : un fou maître des cases noires, puis un roi qui entre par ces mêmes cases. Les pièces noires n'ont jamais pu participer. [%cal Rg7h8] }`,
    ),
    chapter(
      "Mattison – Nimzowitsch (Karlsbad 1929) : le cavalier c4 qui paralyse tout un camp",
      "rn3rk1/pq3ppp/1p1ppn2/2p5/2PP3N/B1P3P1/P1Q1PP1P/R4RK1 b - - 2 13",
      `{ Hermanis Mattison – Aron Nimzowitsch, 1929. Une Nimzo-indienne, comme au premier chapitre : les Blancs ont un pion doublé c3-c4. Nimzowitsch, avec les Noirs, l'a fixé par ...c5.

Les Blancs ont déjà fait deux concessions : 8.g3 perdait environ 0,6 pion, et 13.Kg1 environ 0,7 pion de plus. Stockfish préférait 13.Nf3, qui ramène le cavalier h4 au centre. Les Noirs sont environ -2.

Le plan noir : échanger les dames, puis planter un cavalier en c4, la case laissée vide par le pion doublé. De là, il paralyse le fou c1 et le pion a2. Une seconde pièce viendra en d5 : les pièces blanches n'auront plus aucune case active.

PRO TIP : une case qu'aucun pion adverse ne peut plus attaquer est un poste parfait. Installe-y une pièce, et toute l'aile adverse doit se réorganiser autour d'elle. }
13... Qa6 { La dame attaque le pion c4 et le fou a3. Le meilleur coup. [%cal Ra6c4,Ra6a3] }
14. Qb3 { La dame protège les deux. Presque aussi bon que 14.Bb2. }
14... Nc6 { Le cavalier se développe et attaque d4. Le meilleur coup. [%cal Gc6d4] }
15. Rfd1 { La tour protège d4. 15.Bc1 était un peu plus précis. }
15... Na5 { Le cavalier attaque la dame et le pion c4. Il vise la case c4. Le meilleur coup. [%cal Ra5b3,Ga5c4] }
16. Qb5 { La dame propose l'échange : c'est le moindre mal. Presque aussi bon que 16.Qa4. }
16... Qxb5 { Les Noirs acceptent : en finale, le cavalier c4 sera encore plus fort. Le meilleur coup. }
17. cxb5 { Le pion reprend. Le pion doublé a disparu, mais le trou en c4 est resté. Le meilleur coup. [%csl Gc4] }
17... Nc4 { LE CAVALIER EN C4. Il attaque le fou a3 et ne peut pas être chassé : aucun pion blanc ne peut attaquer c4. 17...a6 tout de suite était à peine plus précis. [%csl Gc4][%cal Rc4a3] }
18. Bc1 { Le fou recule sur sa case de départ, loin du jeu : la case a3 lui est interdite tant que le cavalier c4 est là. Le meilleur coup. [%csl Rc1] }
18... a6 { Le pion attaque b5 pour ouvrir la colonne a. Le meilleur coup. [%cal Ra6b5] }
19. bxa6 { Le pion prend : sinon il tombe. Le meilleur coup. }
19... Rxa6 { La tour reprend et attaque déjà le pion a2. Le meilleur coup. [%cal Ra6a2] }
20. dxc5 { Les Blancs échangent un pion central. 20.Ng2 était un peu plus précis. }
20... bxc5 { Le pion b reprend en c5 et soutient la case d4. Le meilleur coup. }
21. Ng2 { Le cavalier revient enfin vers le centre, mais trop tard. 21.a3 était un peu plus précis. }
21... Nd5 { Le second cavalier noir se centralise et attaque c3. Les deux cavaliers noirs tiennent c4 et d5, au cœur du jeu. Le meilleur coup. [%cal Rd5c3][%csl Gc4,Gd5] }
22. Rd3 { La tour protège c3 et attaque le cavalier d5, défendu par le pion e6. Presque aussi bon que 22.Kf1. }
22... Rfa8 { La seconde tour vient sur la colonne a : le pion a2 est attaqué deux fois. Le meilleur coup. [%cal Ra8a2] }
23. e4 { Le pion chasse le cavalier d5. Mais c'est une faute : environ 1,3 pion de moins que 23.a3. La position était déjà décisive. [%cal Re4d5] }
23... Ne5 { Le cavalier c4 attaque la tour d3. Les Blancs ne peuvent pas sauver à la fois la tour et l'attaque sur d5. Le meilleur coup. [%cal Re5d3] }
24. Rxd5 { La tour se donne contre le cavalier d5. Le meilleur coup dans une position perdue. }
24... exd5 { Le pion reprend et attaque e4. Le meilleur coup. }
25. a3 { Le pion a2, attaqué deux fois, avance en a3 où le fou c1 le protège. Le meilleur coup. }
25... dxe4 { Le pion prend e4. Les Noirs ont une qualité et un pion de plus. Les Blancs ont abandonné ici.

Bilan : Nimzowitsch n'a lancé aucune attaque. Un cavalier en c4, un autre en d5 et deux tours sur la colonne a ont suffi à priver les pièces blanches de toute activité. [%csl Gc4] }`,
    ),
    chapter(
      "Panov – Taimanov (1952) : échanger la pièce qu'on ne peut pas enfermer",
      "1rbqk1nr/p3ppbp/2np2p1/2p5/1p2PP2/2NP2P1/PPP1N1BP/R1BQ1RK1 w k - 0 9",
      `{ Vasily Panov – Mark Taimanov, 1952. Une Sicilienne fermée. Le fou g7 noir domine la grande diagonale, et le pion b4 empêche les Blancs de jouer c3 pour le contrer.

Que faire d'une pièce adverse trop forte qu'on ne peut pas enfermer avec des pions ? L'ÉCHANGER. Les Blancs vont manœuvrer pour proposer l'échange de leur fou de cases noires contre ce fou g7.

Une fois le fou parti, les cases noires autour du roi noir, f6 et h6, deviennent des trous. La pièce qui les gardait a disparu.

PRO TIP : la restriction a deux faces. Si une pièce adverse ne peut pas être enfermée, échange-la contre une de tes pièces moins utiles. Ensuite, ce sont les cases qu'elle gardait qui deviennent faibles. }
9. Nd5 { Le cavalier saute en d5, case libre devant le pion b4. Le meilleur coup. [%csl Gd5] }
9... Nd4 { Le cavalier propose l'échange du cavalier e2, qui empêchait le fou de venir en d4. Presque aussi bon que 9...a5. [%cal Gd4e2] }
10. Nxd4 { Le cavalier prend. 10.f5 était un peu plus précis. }
10... Bxd4+ { Le fou reprend avec échec et s'installe en d4, au centre. Il attaque b2 et vise g1 : c'est la pièce la plus forte de l'échiquier. Le meilleur coup. [%cal Rd4g1,Rd4b2] }
11. Kh1 { Le roi s'écarte de la diagonale. Presque aussi bon que 11.Ne3. }
11... e6 { Le pion chasse le cavalier d5. Presque aussi bon que 11...Nf6. [%cal Re6d5] }
12. Ne3 { Le cavalier recule en e3, d'où il pourra aller en c4. Le meilleur coup. }
12... Ne7 { Le cavalier se développe. Le meilleur coup. }
13. a3 { Le pion attaque b4 pour ouvrir la colonne a et préparer, plus tard, la poussée c3. Le meilleur coup. [%cal Ra3b4] }
13... O-O { Le roque. Le meilleur coup. }
14. axb4 { Le pion a prend en b4 : la colonne a s'ouvre pour la tour a1. Le meilleur coup. }
14... cxb4 { Le pion c reprend en b4 : la colonne c s'ouvre. Le meilleur coup. }
15. Qe1 { La dame prépare c3, qui chasserait enfin le fou d4. Le meilleur coup. [%cal Gc2c3] }
15... Qc7 { La dame attaque le pion c2 par la colonne c, qui vient de s'ouvrir. Le meilleur coup. [%cal Rc7c2] }
16. Nc4 { Le cavalier coupe la dame noire de c2 et prépare Be3. 16.g4 était un peu plus précis, environ 0,35 pion. }
16... d5 { Le pion attaque le cavalier c4. Le meilleur coup. [%cal Rd5c4] }
17. Be3 { LE COUP CLÉ. Le fou propose l'échange du fou d4. Si les Noirs prennent, leur meilleure pièce disparaît. Presque aussi bon que 17.c3. [%cal Ge3d4] }
17... Bxe3 { Le fou prend : les autres coups, comme 17...Nc6, coûtaient environ 0,6 pion. Le meilleur coup. }
18. Nxe3 { Le cavalier reprend. Le fou g7 a disparu : les cases f6 et h6 n'ont plus de gardien. Le meilleur coup. [%csl Rf6,Rh6] }
18... dxe4 { Le pion échange au centre. Le meilleur coup. }
19. dxe4 { Le pion reprend. Les deux camps ont un fou de cases blanches, mais le roi noir a perdu son protecteur des cases noires. Le meilleur coup. }
19... a5 { Le meilleur coup : le pion soutient b4 et garde l'équilibre, environ -0,2. }
(19... Rd8 { LE COUP DE LA PARTIE, environ 0,6 pion de moins que 19...a5 selon trois sondes. La tour prend la colonne d, mais elle laisse les Blancs lancer leurs pions contre les cases noires affaiblies. }
20. g4 { Le pion menace g5 puis Ng4-f6+, droit vers le trou f6. Le meilleur coup. [%cal Gg4g5][%csl Rf6] }
20... f5 { Le pion empêche le plan blanc, mais il ouvre la position. Le meilleur coup. }
21. gxf5 { Le pion g prend en f5 et ouvre la colonne g. Le meilleur coup. }
21... exf5 { Le pion e reprend : le cavalier e3 peut maintenant sauter en d5. Le meilleur coup. }
22. Nd5 { Le cavalier saute en d5 et propose l'échange du cavalier e7. Le meilleur coup. }
22... Nxd5 { Le cavalier prend. Le meilleur coup. }
23. exd5 { Le pion reprend. Les Blancs ont un pion passé d5 et un léger avantage, environ +0,3. La partie se jouera autour de ce pion. })
20. c3 { Le pion attaque b4. Le meilleur coup. [%cal Rc3b4] }
20... Ba6 { Le fou sort sur la diagonale a6-f1. Le meilleur coup. }
21. Rf2 { La tour s'écarte du fou a6. La position est à peu près égale.

Bilan : le fou g7 ne pouvait pas être enfermé : les Blancs l'ont échangé. Avec lui, la force des Noirs sur les cases noires a disparu. [%cal Gf2f1] }`,
    ),
    chapter(
      "Barden – Rossolimo (1950) : bon cavalier contre mauvais fou",
      "2r1k2r/1q2bpp1/p2p3p/1p1PpP2/1Pn3P1/P2Q1B2/2P4P/2BR1RK1 b k - 0 22",
      `{ Leonard Barden – Nicolas Rossolimo, 1950. Une Sicilienne. Les Blancs viennent de jouer 21.Nd5 Bxd5 22.exd5. Stockfish jugeait 21.Nd5 fautif, environ 1 pion de moins que 21.Be2 : les Noirs sont environ -1,9.

Pourquoi ? Regarde les pions blancs : d5, f5, g4, tous sur cases BLANCHES. Le fou f3 bute contre eux : c'est un mauvais fou. Le cavalier noir c4, lui, ne peut être chassé par aucun pion.

Le plan noir : échanger le fou c1, le BON fou blanc, avec ...Bg5. Il restera un cavalier dominant contre un fou qui ne sert qu'à défendre.

PRO TIP : pour restreindre un fou, il n'est pas toujours nécessaire de bouger un pion. Si les pions de l'adversaire sont déjà sur la couleur de son fou, il suffit d'échanger son autre fou. }
22... Bg5 { LE PLAN. Le fou propose l'échange du fou c1, le seul fou blanc qui a encore de l'avenir. Le meilleur coup. [%cal Gg5c1][%csl Rf3] }
23. Rfe1 { La tour vient sur la colonne e. 23.c3 était un peu plus précis. }
23... Qe7 { La dame vient soutenir le fou g5 et surveille la colonne e. Presque aussi bon que 23...Nb6. }
24. a4 { Le meilleur coup : les Blancs cherchent du contre-jeu contre le pion b5 avant que l'échange du fou c1 ne les laisse sans activité. [%cal Ra4b5] }
(24. Be4 { LE COUP DE LA PARTIE, environ 0,9 pion de moins que 24.a4. Le fou se place en e4, mais il reste un mauvais fou, et l'aile dame blanche n'a aucun contre-jeu. }
24... Bxc1 { Le fou noir échange le bon fou blanc. Presque aussi bon que 24...h5. }
25. Rxc1 { La tour reprend. Il reste un cavalier noir contre un fou blanc de cases blanches. Le meilleur coup. }
25... h5 { Le pion attaque g4 pour ouvrir la colonne h. Presque aussi bon que 25...Qg5. [%cal Rh5g4] }
26. g5 { Le meilleur coup : le pion avance et ne laisse pas la colonne h s'ouvrir. Les Noirs reprennent toutefois un pion. }
(26. Qg3 { LE COUP DE LA PARTIE, environ 0,7 pion de moins que 26.g5. La dame défend g4, mais la colonne h s'ouvre. }
26... hxg4 { Le pion h prend en g4 : la colonne h s'ouvre pour la tour h8. Le meilleur coup. }
27. Qxg4 { La dame reprend. Les Noirs sont environ -3,2 ; ils ont gagné cette partie. })
26... Qxg5+ { La dame prend g5 avec échec. Les Noirs ont un pion de plus et le meilleur cavalier, environ -2,5. })
24... bxa4 { Le pion b prend le pion a4 : les Noirs ont un pion de plus pour l'instant. Le meilleur coup. }
25. Be2 { Le fou attaque le cavalier c4. 25.Re4 était un peu plus précis. [%cal Re2c4] }
25... a3 { Le pion avance plutôt que de défendre : il deviendra une gêne pour les Blancs. Presque aussi bon que 25...e4. }
26. Qb3 { La dame attaque le cavalier c4 et le pion a3. Presque aussi bon que 26.Kh1. [%cal Rb3c4] }
26... Bxc1 { Le fou échange le bon fou blanc. Le meilleur coup. }
27. Rxc1 { La tour blanche reprend en c1. Les fous de cases noires ont disparu. Le meilleur coup. }
27... Qg5 { La dame attaque la tour c1 par la diagonale g5-c1 et le pion g4. Les Noirs restent nettement mieux, environ -2.

Bilan : après l'échange des fous de cases noires, le cavalier c4 n'a plus d'adversaire à sa taille. Le fou e2 ne sert qu'à défendre. [%csl Gc4,Re2] }`,
    ),
    chapter(
      "Menchik – Capablanca (Hastings 1931) : enfermer un fou dans le coin",
      "6k1/p3bpp1/4p2p/1pp1P3/8/2P3B1/P2K1PPP/8 b - - 0 30",
      `{ Vera Menchik – José Raúl Capablanca, 1931. Une finale de fous de même couleur : Capablanca a un pion de plus, environ -3.

La technique de Capablanca : placer ses pions sur des cases BLANCHES, la couleur opposée à celle du fou blanc. Ainsi, le fou blanc ne trouve aucune cible et chaque case noire qu'il visite peut lui être retirée.

Le fou blanc finira enfermé en a7, dans le coin, où il ne sert plus à rien. La position étant décisive, les petits écarts avec le moteur sont seulement signalés.

PRO TIP : en finale de fous, place tes pions sur la couleur opposée à celle de ton fou. Tu protèges tes pions du fou adverse et tu laisses ton fou libre. Les cases de sa couleur restent ouvertes pour lui, fermées pour son adversaire. }
30... c4 { Le pion s'installe sur une case blanche, hors de portée du fou de cases noires. Il fixe aussi le pion c3. Le meilleur coup. [%csl Gc4,Rc3] }
31. Bf4 { Le fou vise h6. Presque aussi bon que 31.Ke3. [%cal Gf4h6] }
31... a6 { Le pion protège b5 et quitte a7, une case noire où le fou blanc aurait pu l'attaquer. Presque aussi bon que 31...h5. }
32. Be3 { Le fou cherche une diagonale. 32.Ke3 était un peu plus précis. }
32... Kf8 { Le roi noir monte vers le centre. Le meilleur coup. }
33. Bb6 { Le fou s'aventure en b6, derrière les pions noirs. Le meilleur coup. }
33... Ke8 { Le roi continue sa route vers c6. Le meilleur coup. }
34. Ke3 { Le roi blanc se rapproche du centre. Presque aussi bon que 34.g3. }
34... Kd7 { Le roi noir vient vers c6 pour chasser le fou b6. Le meilleur coup. [%cal Gd7c6] }
35. Kd4 { Le roi blanc se place en d4. 35.Ba5 était à peine plus précis. }
35... Kc6 { Le roi attaque le fou b6. Le meilleur coup. [%cal Rc6b6] }
36. Ba7 { Le fou recule dans le coin. 36.Ba5 se valait à peu près, mais aucune case ne donne d'avenir au fou. Le meilleur coup. [%csl Ra7] }
36... f5 { LE PIÈGE SE REFERME. Le pion f se place lui aussi sur une case blanche. Le fou a7 n'a plus que b8 comme case sûre, une case aussi morte que a7. Les Blancs vont devoir jouer des coups de pions et se dégrader eux-mêmes. Le meilleur coup. [%csl Ra7,Rb8] }
37. a4 { Les Blancs cherchent à ouvrir l'aile dame. 37.f3 tenait un peu mieux, mais la position est perdue. [%cal Ra4b5] }
37... g6 { Un coup d'attente. Presque aussi bon que 37...h5. }
38. f4 { Le pion f se fixe sur une case noire. 38.axb5+ était plus tenace, environ 0,6 pion. }
38... h5 { Un autre coup d'attente. Les pions noirs g6, h5, f5 sont tous sur cases blanches. Presque aussi bon que 38...Bh4. }
39. axb5+ { Le pion prend avec échec. 39.g3 était un peu plus tenace. }
39... Kxb5 { Le roi reprend. Le meilleur coup. }
40. g3 { Un coup de pion forcé : le roi et le fou blancs n'ont pas de bon coup. Le meilleur coup. }
40... a5 { Le pion a avance : il deviendra un pion passé. Le meilleur coup. }
41. Ke3 { Le roi quitte d4. Dans une position perdue, 41.h3 tenait un peu plus longtemps. }
41... Bc5+ { Le fou propose l'échange avec échec. Le meilleur coup. [%cal Rc5e3] }
42. Bxc5 { Le fou blanc prend. Les autres coups perdaient aussi. Le meilleur coup. }
42... Kxc5 { Le roi reprend. La finale de pions est gagnée : le pion a et le roi noir vont décider. Les Blancs ont abandonné ici.

Bilan : des pions sur la bonne couleur ont enfermé le fou blanc en a7. Capablanca n'a eu besoin d'aucune combinaison. [%csl Ga5] }`,
    ),
  ],
};
