import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « Le blocus du pion passé » (positional_mastery, module 23) —
 * format « un commentaire par coup ».
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, entièrement
 * réécrite ici) : scores PGN de chessgames.com, rejoués avec chess.js —
 * Nimzowitsch – Behting (partie libre, Riga 1919, gid 1359943), le 6.Ne3!!
 * que « Mon système » donne en exemple du cavalier bloqueur ;
 * Nimzowitsch – Salwe (Karlsbad 1911, gid 1000795), le blocus des pions
 * centraux noirs par le fou puis le cavalier en e5 ; Reshevsky – Capablanca
 * (Margate 1935, gid 1224079), le cavalier c3 devant le pion passé protégé
 * c4 ; Sämisch – Nimzowitsch (Copenhague 1923, gid 1102400), la dame forcée
 * de bloquer le pion passé e4.
 *
 * Plan : Behting — la case de blocus e3 (1), bloquer ou détruire, 14.f3 contre
 * 14.f4 (2), le bloqueur qui attaque le soutien d5 (3) ; Salwe — céder le
 * centre pour gagner les cases de blocus (4), le fou bloqueur (5), renforcer
 * le blocus (6), le cavalier e5 et l'armée noire paralysée (7) ;
 * Reshevsky — accepter un pion passé protégé déjà bloqué (8), la rupture du
 * défenseur contre le blocus (9), détruire le soutien d5 puis le pion c4
 * (10) ; Sämisch — la dame, mauvaise bloqueuse (11).
 *
 * Toutes les lignes ont été rejouées avec chess.js et chaque coup sondé avec
 * Stockfish 19 (binaire Linux local, profondeur 18, 3 candidats par coup),
 * suites du moteur comprises. Règle appliquée : quand un coup perd environ
 * 0,5 pion ou plus par rapport au choix du moteur, la LIGNE PRINCIPALE suit
 * le moteur et le coup de la partie passe en variante, signalée comme
 * fautive. Exception : dans une position déjà décisive (plus de 3 pions
 * environ), un écart est seulement signalé dans le commentaire. Les coups
 * proches du seuil ont été resondés trois fois avec un moteur neuf et
 * tranchés sur la moyenne : 6.Ne3 de Nimzowitsch contre Behting (0,47) et
 * 14.Bxf6 de Reshevsky (0,46) restent dans la ligne principale ; 14.Nf3
 * (0,60) et 14...Bd6 (0,59) de la partie Salwe, 18...Qd7 de Behting (0,95)
 * passent en variante ; 9.c4 de Behting (0,36) n'est qu'une imprécision, et
 * 18.Rfe1 (0,10) a été préféré à 18.a4 (0,49) dans la partie Salwe. Plusieurs chapitres commencent donc juste après une
 * faute signalée dans l'introduction. Les évaluations citées sont du point
 * de vue des Blancs. Aucun résultat de partie (1-0, 0-1…) dans les
 * variantes : le parseur s'y arrêterait.
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const LE_BLOCUS_DU_PION_PASSE: CourseTree = {
  chapters: [
    chapter(
      "Nimzowitsch – Behting (Riga 1919) : 6.Ne3, le cavalier sur la case de blocus",
      "rnb1kbnr/ppp3pp/3p1q2/8/2NPp3/8/PPP2PPP/RNBQKB1R w KQkq - 0 6",
      `{ Un pion qui avance est une menace : chaque pas le rapproche de la promotion et repousse les pièces adverses. Nimzowitsch donne une règle simple : un pion dangereux se BLOQUE, c'est-à-dire qu'on pose une pièce sur la case juste devant lui. Cette case s'appelle la case de blocus.

Pourquoi bloquer, et pas seulement surveiller la case ? Parce qu'une case seulement surveillée peut être conquise : l'adversaire ajoute un défenseur, et le pion passe. Une case OCCUPÉE ne se conquiert pas : le pion est arrêté net.

Aron Nimzowitsch – Karl Behting, partie libre, Riga 1919. Les Noirs ont joué le gambit letton 2...f5, que Stockfish juge mauvais (environ 1,3 pion). Après 1.e4 e5 2.Nf3 f5 3.Nxe5 Qf6 4.d4 d6 5.Nc4 fxe4, le pion e4 veut avancer et gêner tout le camp blanc. Sa case de blocus est e3.

PRO TIP : face à un pion adverse avancé, cherche d'abord la case juste devant lui. Si tu peux y installer une pièce que rien ne chassera, le pion n'est plus une force, c'est un obstacle pour son propre camp. }
6. Ne3 { LE COUP DU CHAPITRE, deux points d'exclamation dans « Mon système ». Le cavalier se pose sur la case de blocus e3. Depuis cette case il rayonne sur c4, d5, f5 et g4 : le pion bloqué ne le gêne en rien. Stockfish préfère de peu 6.Nc3 ; trois sondes avec un moteur neuf donnent un écart moyen de 0,47 pion, sous le seuil. [%csl Ge3,Re4][%cal Ge3d5,Ge3f5,Ge3g4,Ge3c4] }
(6. Nc3 { Le meilleur coup selon Stockfish, environ +1,5. Le cavalier attaque le pion e4 au lieu de le bloquer. [%cal Gc3e4] }
6... Qg6 { La dame défend le pion e4 et vise g2. Le meilleur coup. Les Blancs pourront ensuite attaquer le pion par f3 ou le bloquer par Ne3 : le chapitre suivant montre quand l'un vaut mieux que l'autre. [%cal Gg6e4,Gg6g2] })
6... c6 { Les Noirs préparent ...d5 pour soutenir le pion e4. 6...Nc6 était un peu plus précis, environ 0,4 pion. [%cal Gc6d5] }
7. Bc4 { Le fou vise d5, la case d'où un pion noir soutiendrait e4. 7.Be2 était un peu plus précis, environ 0,3 pion. [%cal Gc4d5] }
7... d5 { Le pion d5 soutient e4. Le pion e4 est maintenant PROTÉGÉ par un pion. Le meilleur coup. [%cal Gd5e4] }
8. Bb3 { Le fou recule et garde la diagonale qui mène à d5. Le meilleur coup. [%cal Gb3d5] }
8... Be6 { Le fou protège d5 une deuxième fois. 8...Qf7 était un peu plus précis, entre 0,1 et 0,3 pion selon les sondes. [%cal Ge6d5] }
9. O-O { Le meilleur coup, environ +1,5. Le roi se met à l'abri. Le cavalier e3 tient la case de blocus seul, il n'a besoin d'aucune aide. }
(9. c4 { LE COUP DE LA PARTIE, environ 0,35 pion de moins que 9.O-O (moyenne de trois sondes) : une imprécision, pas une faute. Le pion attaque d5, le soutien du pion e4 : l'idée est juste, mais elle vient un coup trop tôt. [%cal Gc4d5] }
9... Qf7 { La dame se replie et garde l'aile roi. Le meilleur coup. }
10. Qe2 { La dame se développe et soutient le pion c4 par la diagonale e2-d3-c4. Un des meilleurs coups, avec 10.Nd2. [%cal Ge2c4] }
10... Nf6 { Le cavalier défend d5 et e4. Le meilleur coup. Suite au chapitre suivant. [%cal Gf6d5,Gf6e4] })
9... Nd7 { Le cavalier se développe vers b6 ou f6. 9...Na6 était un peu plus précis, environ 0,3 pion. }
10. c4 { Maintenant la poussée est prête : le pion attaque d5, le soutien de e4. Le meilleur coup. [%cal Gc4d5] }
10... dxc4 { Les Noirs échangent plutôt que de laisser d5 sous pression. Le meilleur coup. }
11. Nxc4 { Le cavalier quitte la case de blocus pour reprendre en c4, environ +1,7. Il peut partir : sans le pion d5, le pion e4 est isolé et faible, il n'avance plus. Le meilleur coup.

Bilan : le blocus n'est pas une fin en soi. Le cavalier e3 a tenu le pion e4 le temps de préparer c4, puis il est passé à l'attaque. [%cal Gc4d6] }`,
    ),
    chapter(
      "Behting : bloquer ou détruire ? 14.f3 contre 14.f4",
      "rn3rk1/pp3qpp/2p1bn2/3p4/2PPp3/1B2N3/PP1NQPPP/R4RK1 w - - 1 14",
      `{ Suite de la partie après 9.c4 Qf7 10.Qe2 Nf6 11.O-O Bb4 12.Bd2 Bxd2 13.Nxd2 O-O. Trois écarts avec le moteur : 11.O-O (11.Nc3 était meilleur d'environ 0,5 pion), 11...Bb4 (11...Bd6, environ 0,5) et surtout 12...Bxd2 (12...Na6, environ 1,3). Les Blancs sont nettement mieux, environ +2.

Le pion e4 est soutenu par d5 et bloqué par le cavalier e3. Deux plans s'offrent aux Blancs :
- DÉTRUIRE le pion par f3 : il disparaît, la colonne f s'ouvre ;
- le FIGER par f4 : e4 devient un pion passé protégé, mais bloqué pour toujours par le cavalier.

La devise de Nimzowitsch donne l'ordre : d'abord restreindre, puis bloquer, enfin détruire. Le blocus n'est qu'une étape.

PRO TIP : avant de bloquer un pion adverse, demande-toi si tu peux le prendre. Un pion bloqué reste sur l'échiquier et soutient encore ses pièces. Un pion détruit ne sert plus à rien. }
14. f3 { Le meilleur coup, environ +1,8. Le pion attaque e4. Le soutien d5 est lui-même attaqué par c4 : la chaîne noire va céder. [%cal Gf3e4,Gc4d5] }
(14. f4 { LE COUP DE LA PARTIE, environ 1,9 pion de moins que 14.f3. Le pion e4 devient un pion PASSÉ PROTÉGÉ : aucun pion blanc ne peut plus l'arrêter, et le pion d5 le soutient. Mais il est bloqué par le cavalier e3, qui attaque déjà d5. Nimzowitsch jugeait le pion inoffensif ; le moteur regrette la chance de le détruire. [%csl Ge3,Re4][%cal Ge3d5] }
14... g6 { Le meilleur coup. Le pion prend la case f5 au pion blanc. [%cal Rg6f5] }
(14... dxc4 { LE COUP DE LA PARTIE, environ 0,7 pion de moins que 14...g6. Le pion d5 quitte son poste : e4 perd son soutien. }
15. Ndxc4 { Le cavalier d2 reprend et vise e5 et d6. Presque aussi bon que 15.Nexc4. }
15... Qe7 { La dame se développe. Un des meilleurs coups. }
16. f5 { Le pion chasse le fou e6. Presque aussi bon que 16.Ne5. [%cal Gf5e6] }
16... Bxc4 { Le meilleur coup. Les Noirs échangent un cavalier. Behting a joué 16...Bd5, environ 2 pions de moins : voir le chapitre suivant. }
17. Nxc4 { Le cavalier e3 quitte la case de blocus pour reprendre. Sans soutien, le pion e4 deviendra une cible. Le meilleur coup, environ +0,7. })
15. Nb1 { Le cavalier d2 prend la route de c3, d'où il attaquera d5. Le meilleur coup. [%cal Gb1c3] }
15... Na6 { Le cavalier se développe vers b4 ou c7. Le meilleur coup. }
16. Nc3 { Le cavalier attaque d5. Le meilleur coup. Les Blancs ne gardent qu'un léger avantage, environ +0,1.

Bilan : le blocus tient, mais l'avantage a fondu. Figer le pion au lieu de le prendre a laissé aux Noirs le temps de s'organiser. [%cal Gc3d5,Ge3d5] })
14... Qh5 { La dame s'active à l'aile roi et cherche du jeu contre le roque. Un des meilleurs coups, avec 14...exf3. }
15. cxd5 { Les Blancs prennent le soutien d5. Le meilleur coup. }
15... Nxd5 { Le cavalier reprend au centre. Le meilleur coup. }
16. g4 { Le pion chasse la dame et prend f5. Le meilleur coup. [%cal Gg4h5] }
16... Qe8 { La dame recule. Un des meilleurs coups. }
17. fxe4 { Le pion e4 disparaît, environ +2,7. Les Blancs ont un pion de plus et un centre mobile d4-e4. Le meilleur coup.

Bilan : quand on peut détruire le pion, la destruction vaut mieux que le blocus. [%csl Ge4] }`,
    ),
    chapter(
      "Behting : le bloqueur attaque le soutien d5",
      "rn3rk1/pp2q1pp/5n2/3p1P2/2NPp3/1B6/PP2Q1PP/R4RK1 w - - 0 18",
      `{ Suite de la partie après 14.f4 dxc4 15.Ndxc4 Qe7 16.f5 Bd5 17.Nxd5 cxd5. Deux fautes se suivent : 16...Bd5 (16...Bxc4, environ 2 pions de mieux) et 17.Nxd5 (17.g4, environ 1,3 pion de mieux). Les Blancs restent mieux, environ +1,3.

Le pion e4 est un pion passé protégé par d5. Le pion d5 est cloué : le fou b3 vise, derrière lui, le roi g8.

Nimzowitsch dit que le bloqueur a un deuxième rôle : depuis la case de blocus, il attaque les pièces et les pions qui SOUTIENNENT le pion passé. Ici, le cavalier revient en e3 et attaque d5.

PRO TIP : un pion passé protégé ne tombe pas de face. Attaque le pion qui le soutient. Quand le soutien tombe, le pion passé devient un pion isolé, et ton bloqueur le gagne souvent. }
18. Ne3 { LE COUP DU CHAPITRE. Le cavalier revient sur la case de blocus et attaque le pion d5, cloué par le fou b3. Le meilleur coup, et de loin : 18.Ne5 ou 18.Na3 rendaient tout l'avantage. [%csl Ge3,Rd5][%cal Ge3d5,Gb3d5] }
18... Kh8 { Un des meilleurs coups, avec 18...Qd8. Le roi quitte la diagonale du fou b3 : le pion d5 n'est plus cloué. }
(18... Qd7 { LE COUP DE LA PARTIE, environ 0,95 pion de moins que 18...Kh8 (moyenne de trois sondes). La dame défend d5, mais le pion reste cloué. [%cal Gd7d5] }
19. Nxd5 { Le cavalier prend le soutien d5. Le meilleur coup. }
19... Kh8 { Le meilleur coup. Le roi sort du clouage, environ +2,4. }
(19... Nxd5 { LE COUP DE LA PARTIE, environ 3 pions de moins que 19...Kh8. Le cavalier reprend, mais le pion e4 n'a plus de soutien. }
20. Qxe4 { La dame prend le pion passé, qui n'a plus de soutien. Le cavalier d5, cloué par le fou b3 devant le roi g8, est attaqué deux fois. Le meilleur coup, environ +6. [%cal Ge4d5,Gb3d5] }
20... Rd8 { Une position déjà perdue, environ +6. 20...Kh8 était un peu plus tenace, l'écart est seulement signalé. }
21. f6 { Le pion ouvre le roque noir. Le meilleur coup.

Bilan de la partie : Nimzowitsch a gagné quelques coups plus tard. Le pion passé e4, privé de son soutien, est tombé le premier. })
20. Nf4 { Le cavalier se replie et garde e2 et g6. Le meilleur coup. }
20... Qxd4+ { Les Noirs regagnent un pion avec échec. Le meilleur coup. }
21. Kh1 { Le roi s'écarte, environ +2,5. Le meilleur coup. })
19. Nxd5 { Le cavalier prend le soutien d5. Le pion e4 est maintenant un pion passé ISOLÉ. Le meilleur coup. [%csl Re4] }
19... Qd6 { La dame attaque le cavalier d5. Le meilleur coup. [%cal Rd6d5] }
20. Nf4 { Le cavalier se replie en f4. Il protège e2 et garde un œil sur e6 et g6. Le meilleur coup. }
20... Qxd4+ { Les Noirs regagnent le pion d4 avec échec. Le meilleur coup. }
21. Kh1 { Le roi s'écarte, environ +3,3. Le meilleur coup. Le pion e4 est isolé et la dame e2 le vise.

Bilan : le cavalier bloqueur a quitté e3 au bon moment. Il a pris le soutien d5, et le pion passé e4 n'est plus qu'une faiblesse. [%cal Ge2e4] }`,
    ),
    chapter(
      "Nimzowitsch – Salwe (Karlsbad 1911) : céder le centre pour gagner les cases de blocus",
      START,
      `{ Le blocus ne concerne pas seulement les pions déjà passés. Nimzowitsch l'applique à tout pion qui VEUT avancer : un pion arriéré, un centre mobile, un futur pion passé. Il faut l'arrêter avant qu'il ne bouge.

Aron Nimzowitsch – Georg Salwe, Karlsbad 1911. Une Française d'avance. Au coup 7, Nimzowitsch abandonne sa base d4 : il échange le pion d4 contre le pion c5. Il ne garde plus que e5, mais il gagne deux cases de blocus pour ses pièces, d4 et e5, devant les pions noirs d5 et e6.

Le plan noir est clair : ...f6 pour échanger le pion e5, puis ...e5 pour libérer tout le centre. Le plan blanc aussi : tenir e5, avec un pion, puis avec une pièce.

PRO TIP : compte les pions mobiles de l'adversaire et regarde la case devant chacun d'eux. Si tu peux y poser des pièces solides, tu peux céder des pions : un centre bloqué ne vaut presque rien. }
1. e4 { Le pion roi prend le centre. Un des meilleurs coups. }
1... e6 { La Défense française. Un des meilleurs coups. }
2. d4 { Deux pions au centre. Le meilleur coup. }
2... d5 { Les Noirs attaquent e4. Le meilleur coup. }
3. e5 { La variante d'avance. Presque aussi bon que 3.Nc3. [%csl Ge5] }
3... c5 { Les Noirs attaquent la base de la chaîne, d4. Un des meilleurs coups. [%cal Rc5d4] }
4. c3 { Le pion soutient d4. Le meilleur coup. [%cal Gc3d4] }
4... Nc6 { Deuxième attaquant de d4. Un des meilleurs coups, avec 4...Bd7. [%cal Rc6d4] }
5. Nf3 { Le cavalier défend d4 et e5. Le meilleur coup. }
5... Qb6 { Troisième attaquant de d4, et la dame vise b2. Un des meilleurs coups. [%cal Rb6d4] }
6. Bd3 { Le fou se développe. Nimzowitsch lui-même préférait 6.Be2, qui ne bloque pas la dame ; Stockfish aussi, environ 0,15 pion. }
6... Bd7 { Les Noirs préparent ...Rc8. 6...cxd4 était un peu plus précis, environ 0,4 pion. }
7. dxc5 { LE COUP DU CHAPITRE. Nimzowitsch rend sa base d4. Il ne cherche plus à garder une chaîne de pions : il veut des CASES, d4 et e5, pour ses pièces. Le meilleur coup. [%csl Gd4,Ge5] }
7... Bxc5 { Le fou reprend et vise f2. Le meilleur coup. }
8. O-O { Le roi se met à l'abri. Un des meilleurs coups, avec 8.Qe2. }
8... f6 { Les Noirs attaquent e5 : ils veulent de la place pour le pion e6. 8...a5 était un peu plus précis, environ 0,15 pion. [%cal Rf6e5] }
9. b4 { Le pion chasse le fou c5 avec gain de temps, pour pouvoir ensuite défendre e5 avec Bf4. Le meilleur coup. [%cal Gb4c5] }
(9. Qe2 { Environ 0,8 pion de moins que 9.b4. La dame défend e5, mais seulement pour un temps. Nimzowitsch donne cette suite pour montrer le défaut d'une dame bloqueuse. [%cal Ge2e5] }
9... fxe5 { Les Noirs échangent le pion e5. Le meilleur coup. }
10. Nxe5 { Le cavalier reprend en e5. Presque aussi bon que 10.b4. }
10... Nxe5 { Les Noirs échangent le cavalier. Le meilleur coup. }
11. Qxe5 { La dame reprend et bloque le pion e6. Le meilleur coup. [%csl Ge5] }
11... Nf6 { Le meilleur coup. Les Noirs menacent ...Bd6, qui chasse la dame. Une dame bloqueuse se fait toujours chasser par une pièce mineure. [%cal Rf6g4] })
9... Be7 { Le fou recule. Le meilleur coup. [%cal Re7f6] }
(9... fxe5 { Environ 5 pions de moins que 9...Be7. Le fou c5 est attaqué. }
10. bxc5 { Le pion prend le fou. Le meilleur coup. }
10... Qxc5 { La dame reprend, mais les Noirs ont perdu une pièce contre un pion, environ +5,5. })`,
    ),
    chapter(
      "Salwe : le fou bloqueur en e5",
      "r3k1nr/pp1bb1pp/1qn1pp2/3pP3/1P6/2PB1N2/P4PPP/RNBQ1RK1 w kq - 1 10",
      `{ Suite de la partie après 9.b4 Be7. Les Blancs sont un peu mieux, environ +0,8.

Les Noirs vont échanger le pion e5. Ce qui compte n'est pas le pion, c'est la CASE e5 : si une pièce blanche s'y installe, le pion e6 ne pourra plus avancer.

Le fou est souvent un bloqueur moins bon que le cavalier : le pion bloqué lui coupe une diagonale. Mais un fou bien soutenu, qui ne peut pas être chassé par un pion, peut tenir le poste. Nimzowitsch l'appelle « un gaillard solide ».

PRO TIP : quand tu bloques avec un fou, vérifie deux choses : aucun pion adverse ne peut le chasser, et il garde au moins une diagonale libre. Sinon, prévois un cavalier pour le remplacer. }
10. Bf4 { Le fou défend e5. Presque aussi bon que 10.Re1. [%cal Gf4e5] }
10... fxe5 { Les Noirs échangent le pion e5. Nimzowitsch juge cette opération peu justifiée : le nouveau bloqueur sera plus solide que le pion. 10...Nh6 était un peu plus précis, environ 0,3 pion. }
11. Nxe5 { Le cavalier reprend. Le meilleur coup. }
11... Nxe5 { Les Noirs échangent le cavalier. Le meilleur coup. }
12. Bxe5 { LE COUP DU CHAPITRE. Le fou devient le BLOQUEUR du pion e6. Aucun pion noir ne peut le chasser : le pion f est parti, le pion d est fixé en d5. Le meilleur coup. [%csl Ge5,Re6] }
12... Nf6 { Le cavalier se développe et garde e4. Le meilleur coup. }
(12... Bf6 { Environ 1 pion de moins que 12...Nf6. Le fou propose l'échange du bloqueur, mais il abandonne la défense de la case h4 et de l'aile roi. }
13. Nd2 { Le cavalier se développe vers f3. Un des meilleurs coups, avec 13.Qh5+. }
13... Nh6 { Le cavalier se développe. Un des meilleurs coups. }
14. Bxf6 { Les Blancs échangent. Le meilleur coup. }
14... gxf6 { La reprise forcée. Le roque noir est abîmé. Le meilleur coup. }
15. Qh5+ { La dame entre avec échec. Le meilleur coup. }
15... Nf7 { Le cavalier s'interpose. Le meilleur coup, environ +1,8 : la structure noire est ruinée. })
13. Nd2 { Le cavalier part vers f3, d'où il renforcera la case e5. Le meilleur coup. [%cal Gd2f3,Gf3e5] }
13... O-O { Le roi se met à l'abri. 13...a5 était un peu plus précis, environ 0,3 pion. Les Blancs sont mieux, environ +1,3.

Bilan : le pion e5 a disparu, mais la case e5 est restée blanche. Le fou y bloque le pion e6, et le centre noir est immobile. [%csl Ge5] }`,
    ),
    chapter(
      "Salwe : renforcer le blocus, les deux cases d4 et e5",
      "r4rk1/pp1bb1pp/1q2pn2/3pB3/1P6/2PB4/P2N1PPP/R2Q1RK1 w - - 3 14",
      `{ Suite de la partie après 13.Nd2 O-O. Les Blancs sont mieux, environ +1.

Les Noirs ont deux pions centraux, d5 et e6. Chacun a sa case de blocus : d4 devant d5, e5 devant e6. Le plan blanc idéal : un fou en d4, un cavalier en e5. Le fou bloque d5, le cavalier bloque e6.

Nimzowitsch a joué 14.Nf3 pour amener le cavalier. Stockfish montre que l'ordre compte : il faut d'abord placer le fou en d4, sinon ...a5 frappe le pion b4 et les Noirs gagnent du temps.

PRO TIP : pour bloquer deux pions, il faut deux pièces sur deux cases. Commence par la pièce qui doit changer de case, et place l'autre ensuite. }
14. Bd4 { Le meilleur coup, environ +1,2. Le fou passe de e5 à d4, la case de blocus du pion d5. La case e5 est libérée pour un cavalier. [%csl Gd4,Ge5][%cal Gd4b6] }
(14. Nf3 { LE COUP DE LA PARTIE, environ 0,6 pion de moins que 14.Bd4 (moyenne de trois sondes). Nimzowitsch : « les forces de blocus sont renforcées par le cavalier ». Le plan est bon, l'ordre des coups ne l'est pas. [%cal Gf3e5] }
14... a5 { Un des meilleurs coups, avec 14...Ng4. Le pion attaque b4 et prépare l'ouverture de la colonne a. [%cal Ra5b4] }
(14... Bd6 { LE COUP DE LA PARTIE, environ 0,6 pion de moins que 14...a5 (moyenne de trois sondes). Le fou propose l'échange du bloqueur e5. [%cal Rd6e5] }
15. Bd4 { Le fou évite l'échange et se place sur l'autre case de blocus, d4. La case e5 reste au cavalier. Le meilleur coup. [%csl Gd4] }
15... Qd8 { La dame se replie. Le meilleur coup. }
16. Re1 { La tour soutient la case e5. Un des meilleurs coups. }
16... Ng4 { Le cavalier vise e5 et h2. Le meilleur coup, environ +1,1. Nimzowitsch a joué 15.Qe2 dans la partie : voir le chapitre suivant. })
15. b5 { Le pion avance pour garder la colonne b fermée. Le meilleur coup. }
15... Be8 { Le fou se replace vers h5 ou g6. Un des meilleurs coups, avec 15...Bc5. }
16. Bd4 { Le fou se place en d4, la case de blocus de d5. Le meilleur coup. [%csl Gd4] }
16... Bc5 { Le meilleur coup, environ +0,6. Les Noirs proposent l'échange du bloqueur d4 : c'est la défense type contre un blocus. [%cal Rc5d4] })
14... Qc7 { La dame quitte la diagonale du fou d4. Le meilleur coup. }
15. Re1 { La tour se place sur la colonne e et soutient la future case e5. Le meilleur coup. [%cal Ge1e5] }
15... a5 { Les Noirs attaquent le pion b4 pour gagner du jeu à l'aile dame. Le meilleur coup. [%cal Ra5b4] }
16. b5 { Le pion avance et garde la colonne b fermée. Le meilleur coup. }
16... Rac8 { La tour vient sur la colonne c, contre le pion c3. Un des meilleurs coups. [%cal Rc8c3] }
17. a4 { Le pion fixe le pion a5. Un des meilleurs coups, avec 17.Nf3. Le cavalier ira en f3 puis en e5 au coup suivant, environ +1,1.

Bilan : fou en d4, cavalier bientôt en e5 : les deux pions centraux noirs sont bloqués. [%csl Gd4,Ge5] }`,
    ),
    chapter(
      "Salwe : le cavalier e5, bloqueur idéal, et l'armée noire paralysée",
      "2r1brk1/ppq3pp/3bpn2/3pN3/1P1B4/2PB4/P3QPPP/R4RK1 w - - 11 18",
      `{ Suite de la partie après 14.Nf3 Bd6 15.Qe2 Rac8 16.Bd4 Qc7 17.Ne5 Be8. Deux fautes s'annulent : 15.Qe2 (15.Bd4, environ 0,7 pion de mieux) et 15...Rac8 (15...Bxe5, environ 0,9). Les Blancs sont mieux, environ +1,3.

Le cavalier e5 est le bloqueur idéal :
- le pion e6 ne peut pas le chasser, aucun pion noir ne peut l'attaquer ;
- il ne perd rien à être devant un pion : un cavalier saute, il n'a pas de diagonale à garder ;
- depuis e5, il rayonne sur c6, d7, f7 et g6.

Regarde le camp noir : le fou e8 n'a pas de case active, le fou d6 bute sur le cavalier, le pion e6 ne bouge plus. Le blocus a PARALYSÉ l'armée noire, et le pion e6 est devenu une faiblesse fixe.

PRO TIP : un blocus réussi transforme le pion adverse en faiblesse. Le pion ne peut plus bouger : tu as tout ton temps pour l'attaquer, ou pour attaquer ailleurs pendant que l'adversaire reste passif. }
18. Rfe1 { Le meilleur coup, environ +1,3. La tour f1 vient sur la colonne e, derrière le cavalier e5. Trois sondes donnent cet ordre : 18.Rfe1 devant 18.a4 (environ 0,5 pion de moins). Le cavalier e5 n'a besoin d'aucune aide. [%csl Ge5][%cal Ge1e5] }
(18. Rae1 { LE COUP DE LA PARTIE, environ 0,8 pion de moins que 18.Rfe1. La tour a1 vient sur la colonne e, mais la tour f1 ne sert plus à rien en f1 : Stockfish préférait garder la tour a1 pour l'aile dame. [%cal Ge1e5] }
18... Ne4 { Le meilleur coup. Le cavalier saute en e4 et menace de rester : les Noirs gagnent eux aussi une case avancée. [%csl Re4] }
(18... Bxe5 { LE COUP DE LA PARTIE, environ 2 pions de moins que 18...Ne4. Salwe échange le cavalier bloqueur. }
19. Bxe5 { Le meilleur coup. Le fou reprend et redevient le bloqueur de e6, environ +2,5. Une pièce bloqueuse en remplace une autre : le blocus tient toujours.

Bilan de la partie : Nimzowitsch a regroupé ses pièces (21.Qc2, 22.Re3, 23.Rg3), puis il a sacrifié en h7 et gagné. Le blocus avait paralysé la défense noire. [%csl Ge5] })
19. Bxe4 { Les Blancs échangent le cavalier e4. Le meilleur coup. }
19... dxe4 { Le pion reprend. Le pion d5 disparaît, mais le pion e4 est maintenant isolé. Le meilleur coup. }
20. f4 { Le pion soutient le cavalier e5, environ +0,5. Le meilleur coup. [%cal Gf4e5] })
18... Bh5 { Le fou cherche une diagonale active vers e2. Le meilleur coup. [%cal Rh5e2] }
19. f3 { Le pion ferme la diagonale du fou h5 et prend les cases e4 et g4 aux pièces noires. Le meilleur coup. [%cal Gf3e4,Gf3g4] }
19... Rfe8 { La tour défend le pion e6, cible fixe. Le meilleur coup. [%cal Re8e6] }
20. a3 { Un coup d'attente utile : le pion b4 est protégé et la case b4 reste blanche. Les Noirs n'ont aucun plan actif. Le meilleur coup. }
20... Bg6 { Le fou propose l'échange de son mauvais fou contre le fou d3. Le meilleur coup. [%cal Rg6d3] }
21. Bxg6 { Les Blancs échangent. Le meilleur coup. }
21... hxg6 { La reprise forcée, environ +1,3. Le meilleur coup.

Bilan : le cavalier e5 et le fou d4 sont toujours en place. Le pion e6 ne bouge pas, et les Noirs n'ont plus qu'à attendre. Voilà la paralysie dont parle Nimzowitsch. [%csl Ge5,Gd4,Re6] }`,
    ),
    chapter(
      "Reshevsky – Capablanca (Margate 1935) : le pion passé protégé c4 et le cavalier c3",
      "2rqrnk1/pp3p1p/5bp1/3p4/2pP4/2N1PN2/PPQ2PPP/R4RK1 w - - 0 15",
      `{ Samuel Reshevsky – José Raúl Capablanca, Margate 1935. Un Gambit dame refusé : 1.d4 Nf6 2.c4 e6 3.Nc3 d5 4.Bg5 Nbd7 5.cxd5 exd5 6.e3 Be7 7.Bd3 O-O 8.Qc2 c5 9.Nf3 c4 10.Bf5 Re8 11.O-O g6 12.Bh3 Nf8 13.Bxc8 Rxc8 14.Bxf6 Bxf6. Le coup 14.Bxf6 est proche du seuil : trois sondes donnent 0,46 pion en moyenne.

Par 9...c4, Capablanca a pris de l'espace à l'aile dame. Le pion c4 est soutenu par d5. Si le pion b blanc avance en b4, c4 devient un pion PASSÉ PROTÉGÉ.

Un pion passé protégé est d'habitude un gros atout. Pourtant Reshevsky va le laisser naître. Sa raison : le cavalier c3 est DÉJÀ sur la case de blocus, et aucun pion noir ne pourra jamais l'en chasser.

PRO TIP : un pion passé ne vaut que par sa capacité à avancer. Si sa case de blocus est tenue par un cavalier inexpugnable, le pion passé protégé ne fait plus peur. Il fige même les pièces adverses qui le soutiennent. }
15. b3 { Le pion attaque c4. Un des meilleurs coups. [%cal Gb3c4] }
15... Qa5 { La dame attaque le cavalier c3. 15...Re6 était un peu plus précis, environ 0,25 pion. [%cal Ra5c3] }
16. b4 { LE COUP DU CHAPITRE. Le pion chasse la dame et laisse aux Noirs un pion passé protégé en c4. Le cavalier c3 le bloque, et ni le pion b ni le pion d noirs ne peuvent attaquer la case c3. Un des meilleurs coups, avec 16.Rfc1. [%csl Gc3,Rc4] }
16... Qd8 { La dame recule. Le meilleur coup. }
(16... Qxb4 { Environ 1 pion de moins que 16...Qd8. La dame prend le pion, mais la colonne b s'ouvre contre le pion b7. }
17. Rab1 { La tour attaque la dame et vise b7. Un des meilleurs coups. [%cal Gb1b7] }
17... Qa5 { La dame se replie. Le meilleur coup. }
18. Rxb7 { La tour prend le pion b7 et entre en septième rangée. Le meilleur coup. }
18... Rb8 { Les Noirs contestent la colonne b, environ +1,3. Le meilleur coup. })
17. Qa4 { La dame vise a7 et le pion a. Le meilleur coup. [%cal Ga4a7] }
17... a6 { Le pion protège b5. 17...Re7 était un peu plus précis, environ 0,15 pion. }
18. b5 { Le pion ouvre la colonne b. Presque aussi bon que 18.Qa5. [%cal Gb5a6] }
18... Re6 { La tour défend la sixième rangée. 18...Ne6 était un peu plus précis, environ 0,3 pion. }
19. Rab1 { La tour vient sur la colonne b. Un des meilleurs coups. }
19... Rb8 { La tour défend b7. Le meilleur coup. }
20. Rb2 { La tour prépare le doublement sur la colonne b. Un des meilleurs coups. }
20... Be7 { Le fou vise b4 et a3. Presque aussi bon que 20...Rd6. }
21. bxa6 { Les Blancs ouvrent la colonne b. Le meilleur coup. }
21... Rxa6 { La tour reprend. Le meilleur coup. }
22. Qc2 { La dame revient défendre le cavalier c3, environ +0,5. Le meilleur coup.

Bilan : le pion c4 est passé et protégé, mais il ne bouge pas. Le cavalier c3 le bloque, et le pion b7 est devenu une cible sur la colonne ouverte. [%csl Gc3,Rb7] }`,
    ),
    chapter(
      "Reshevsky – Capablanca : la défense contre le blocus, la rupture ...b5",
      "1r1q1nk1/1p2bp1p/r5p1/3p4/2pP4/2N1PN2/PRQ2PPP/5RK1 b - - 1 22",
      `{ Suite de la partie après 22.Qc2. Les Blancs sont un peu mieux, environ +0,5.

Le camp qui subit le blocus ne doit pas attendre. Ses pièces risquent de rester figées pour défendre le pion passé et le pion b7. Il doit chercher une RUPTURE : un coup de pion qui chasse le bloqueur ou qui change la structure.

Ici, la rupture est ...b5. Le pion b7, faible, disparaît en échange du cavalier qui le prend, ou il entraîne le bloqueur loin de c3.

Capablanca a choisi 22...Ne6, un coup de manœuvre. Le moteur lui reproche environ 0,7 pion : les Blancs ont alors le temps de resserrer l'étau.

PRO TIP : quand ton pion passé est bloqué, ne le défends pas passivement. Cherche le coup qui chasse le bloqueur ou qui ouvre une autre ligne. Un pion passé bloqué sans contre-jeu finit presque toujours par tomber. }
22... b5 { LE COUP DU CHAPITRE, le meilleur coup. Les Noirs rendent le pion faible b7 pour attirer le cavalier hors de c3 et activer leurs pièces. [%cal Rb5c3] }
(22... Ne6 { LE COUP DE LA PARTIE, environ 0,7 pion de moins que 22...b5. Le cavalier se replace vers c7, mais les Noirs restent passifs. }
23. Rfb1 { Les tours se doublent sur la colonne b, contre le pion b7. Le meilleur coup. [%cal Gb1b7] }
23... Ra7 { La tour défend b7 par la septième rangée. 23...b6 ou 23...Ra3 étaient un peu plus précis, environ 0,4 pion. }
24. a4 { Le pion prend la case b5 au pion b7. Presque aussi bon que 24.h3. [%cal Ga4b5] }
24... Nc7 { Le cavalier garde b5. Un des meilleurs coups. }
25. Ne5 { Le cavalier f3 s'installe en e5. Le meilleur coup. [%csl Ge5] }
25... Qe8 { La dame protège b5 et a4. Le meilleur coup. }
26. Rb6 { Un des meilleurs coups, avec 26.h3, environ +2. La tour entre en b6 et attaque la sixième rangée. Le pion b7 est fixé, toutes les pièces noires sont liées à sa défense. [%cal Gb6b7] }
(26. f4 { LE COUP DE LA PARTIE, environ 1,7 pion de moins que 26.Rb6. Le pion soutient le cavalier e5, mais il affaiblit e3 et e4. }
26... f6 { Le pion chasse le cavalier e5. Le meilleur coup. [%cal Rf6e5] }
27. Ng4 { Le cavalier se replie en g4. Le meilleur coup. }
27... Qd7 { La dame se recentre, environ +0,3. Le meilleur coup. Le jeu s'équilibre de nouveau. })
26... Na8 { Le cavalier chasse la tour b6. Le meilleur coup. }
27. R6b5 { La tour reste active en b5. Le meilleur coup, environ +1,9. })
23. Nxb5 { Le cavalier prend le pion. Il quitte la case de blocus, mais la dame c2 surveille c3. Le meilleur coup. [%cal Gc2c3] }
23... Ba3 { Le fou attaque la tour b2. Un des meilleurs coups. [%cal Ra3b2] }
24. Nxa3 { Le cavalier échange le fou. Un des meilleurs coups. }
24... Rxa3 { La tour reprend et devient active en a3. Le meilleur coup. }
25. Ne5 { Le cavalier s'installe en e5, environ +0,6. Le meilleur coup. }
25... Ra6 { La tour recule pour garder la sixième rangée. Le meilleur coup.

Bilan : les Blancs ont gagné le pion b7, mais toutes les pièces noires sont redevenues actives. Le blocus a été cassé par un coup de pion. }`,
    ),
    chapter(
      "Reshevsky – Capablanca : détruire le soutien d5, puis le pion c4",
      "8/1R2brkp/6p1/r2p4/P1pP1P2/q1N1PQ2/3K4/1R6 b - - 4 48",
      `{ Suite de la partie après une longue manœuvre, jusqu'à 48.Rb7. Plusieurs écarts avec le moteur dans ce passage : 44.g5 (environ 0,6 pion), 45...Bxg5 (0,7) et 48.Rb7 (0,6). Les Blancs sont un peu mieux, environ +0,9.

Le pion c4 est toujours passé, protégé par d5 et bloqué par le cavalier c3. Le roi d2 le surveille lui aussi. Il est temps de passer à la troisième étape : DÉTRUIRE.

On ne prend pas un pion passé protégé de face : on prend d'abord son soutien. Ici, le soutien est le pion d5. Il peut être attaqué par le pion e3 (e3-e4) et par la dame f3, sur la diagonale f3-e4-d5.

PRO TIP : pour détruire une chaîne de pions, frappe la base. Quand le pion d5 tombe, le pion c4 n'est plus protégé, et il ne reste plus qu'à le ramasser avec la dame ou le roi. }
48... Rf5 { Le meilleur coup, environ +0,9. La tour défend d5 par la cinquième rangée. [%cal Gf5d5] }
(48... Rxa4 { LE COUP DE LA PARTIE, environ 2 pions de moins que 48...Rf5. La tour prend le pion a4, mais elle quitte la défense de d5. }
49. Qxd5 { La dame prend le soutien d5. Le pion c4 est maintenant isolé et sans défense. Le meilleur coup, environ +3. [%csl Rc4] }
49... Ra7 { Le meilleur coup. La tour propose l'échange des tours de la septième rangée. }
(49... Ra5 { LE COUP DE LA PARTIE, environ 1 pion de moins que 49...Ra7. La tour attaque la dame. }
50. Qxc4 { La dame prend le pion passé c4, environ +4,2. La position est décisive, Reshevsky a gagné peu après. Le meilleur coup. })
50. Qxc4 { La dame prend le pion c4. Le meilleur coup. }
50... Rxb7 { Les tours s'échangent. Le meilleur coup. }
51. Rxb7 { La tour reprend. Les Blancs ont deux pions de plus. Le meilleur coup. })
49. e4 { LE COUP DU CHAPITRE. Le pion attaque d5, le soutien du pion c4. Un des meilleurs coups, avec 49.Rh1. [%cal Ge4d5] }
49... dxe4 { Les Noirs prennent. Un des meilleurs coups, avec 49...Rh5. }
50. Qxe4 { La dame reprend et attaque le pion c4, qui n'a plus de soutien. Le meilleur coup. [%cal Ge4c4] }
50... Rf7 { La tour défend la septième rangée. Le meilleur coup. }
51. d5 { Le pion d blanc devient passé à son tour. Le meilleur coup. }
51... Ra8 { La tour se replie. Le meilleur coup. }
52. Qxc4 { La dame prend le pion c4, environ +1,4. Le meilleur coup.

Bilan : restreindre, bloquer, détruire. Le cavalier c3 a tenu le pion pendant plus de trente coups, puis la poussée e4 a fait tomber son soutien. [%csl Gc4] }`,
    ),
    chapter(
      "Sämisch – Nimzowitsch (Copenhague 1923) : la dame, mauvaise bloqueuse",
      "r4rk1/3q2pp/p2bp3/1b1p1p1n/1p1PP3/6PP/PP1B1PBK/1NRQ2R1 b - - 0 20",
      `{ Friedrich Sämisch – Aron Nimzowitsch, Copenhague 1923, la célèbre « partie de l'immortel zugzwang ». Après 1.d4 Nf6 2.c4 e6 3.Nf3 b6 4.g3 Bb7 5.Bg2 Be7 6.Nc3 O-O 7.O-O d5 8.Ne5 c6 9.cxd5 cxd5 10.Bf4 a6 11.Rc1 b5 12.Qb3 Nc6 13.Nxc6 Bxc6 14.h3 Qd7 15.Kh2 Nh5 16.Bd2 f5 17.Qd1 b4 18.Nb1 Bb5 19.Rg1 Bd6, Sämisch a joué 20.e4, une grosse faute : environ 1,8 pion de moins que 20.Bf3.

Le blocus a aussi une hiérarchie : toutes les pièces ne bloquent pas aussi bien.
- Le cavalier est le meilleur bloqueur : il ne perd rien à être devant un pion.
- Le fou peut convenir s'il garde une diagonale libre.
- La DAME est la plus mauvaise : elle est trop précieuse. Une pièce mineure adverse suffit à la chasser, et tant qu'elle bloque, la pièce la plus forte de l'échiquier joue le rôle d'un simple pion.

PRO TIP : si tu dois bloquer un pion passé avec ta dame, c'est souvent le signe que ta position va mal. Cherche vite une pièce mineure pour la relayer. }
20... fxe4 { Le pion prend en e4 et offre le cavalier h5. Le meilleur coup. [%cal Rf8f2] }
21. Qxh5 { La dame prend le cavalier. Le meilleur coup. }
21... Rxf2 { LE COUP DU CHAPITRE. La tour détruit le pion f2, le seul pion blanc qui pouvait encore arrêter e4. Le pion e4 devient un pion PASSÉ, et les Noirs ont deux pions et la septième rangée pour la pièce. Le meilleur coup, environ -3. [%csl Re4][%cal Re4e3] }
22. Qg5 { La dame revient défendre. La position est déjà perdue : 22.a3 ou 22.Kh1 étaient plus tenaces, environ 3 pions de mieux pour 22.a3, l'écart est seulement signalé. }
22... Raf8 { La deuxième tour rejoint la colonne f. Presque aussi bon que 22...h6. }
23. Kh1 { Le roi quitte la septième rangée. Un des meilleurs coups dans une position perdue. }
23... R8f5 { La tour chasse la dame vers la case de blocus. Presque aussi bon que 23...Be7. [%cal Rf5g5] }
24. Qe3 { La dame se pose devant le pion passé e4 : la pièce la plus forte des Blancs devient un simple bloqueur. Un des meilleurs coups dans une position perdue. [%csl Re3] }
24... Bd3 { Le fou s'installe en d3, soutenu par le pion e4. Il coupe la tour c1 de la dame et paralyse les pièces blanches. 24...Re2 était encore plus fort, environ 0,8 pion, l'écart est seulement signalé dans une position décisive. [%cal Rd3b1] }
25. Rce1 { La tour vient défendre e2. Le meilleur coup dans une position perdue. }
25... h6 { Le coup du zugzwang, deux points d'exclamation pour Nimzowitsch. Les Blancs n'ont plus de coup utile : chaque coup de pièce ou de pion perd du matériel. Stockfish trouve 25...h5 un peu plus fort, l'écart est seulement signalé : la position est décisive.

Bilan : la dame bloqueuse e3 ne peut ni bouger ni être relayée. Les Blancs ont abandonné peu après. [%csl Re3] }`,
    ),
  ],
};
