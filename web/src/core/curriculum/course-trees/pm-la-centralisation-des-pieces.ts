import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « La centralisation des pièces » (positional_mastery, module 24) —
 * format « un commentaire par coup ».
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, entièrement
 * réécrite ici) : scores PGN de chessgames.com, rejoués avec chess.js —
 * Capablanca – Tartakower (Moscou 1925, gid 1100080), le cavalier e5 du
 * Stonewall puis le cavalier d4 devant le pion isolé ; Nimzowitsch –
 * Capablanca (Saint-Pétersbourg 1914, gid 1102386), le cavalier qui pivote
 * par e5, la dame c4 et le fou d4 ; Nimzowitsch – Capablanca (New York 1927,
 * 20 février, gid 1007807), la dame centralisée en e5 puis d5 qui bascule
 * vers l'aile dame ; Nimzowitsch – Capablanca (New York 1927, 13 mars,
 * gid 1007846), les tours noires en c4 et e4 et la dame qui pénètre ;
 * Capablanca – Tartakower (New York 1924, gid 1102104), la marche du roi
 * blanc en finale de tours, jusqu'au centre derrière le pion d.
 *
 * Plan : le rayonnement d'une pièce centrale (1), le cavalier central qui
 * domine (2), le cavalier qui pivote par e5 (3), la dame qui se centralise
 * (4), le fou d4 quand la dame adverse s'égare (5), la dame d5 qui bascule
 * d'une aile à l'autre (6), la dame décentralisée (7), la tour c4 et
 * l'échange du cavalier central adverse (8), la tour e4 sur une case que
 * nul pion ne peut attaquer (9), les pièces lourdes qui pénètrent jusqu'au
 * zugzwang (10), la marche du roi en finale (11), le roi central qui escorte
 * son pion passé (12).
 *
 * Toutes les lignes ont été rejouées avec chess.js et chaque coup sondé avec
 * Stockfish 19 (binaire Linux local, profondeur 18, 3 candidats par coup),
 * suites du moteur comprises. Règle appliquée : quand un coup perd environ
 * 0,5 pion ou plus par rapport au choix du moteur, la LIGNE PRINCIPALE suit
 * le moteur et le coup de la partie passe en variante, signalée comme
 * fautive. Exception : dans une position déjà décisive (plus de 3 pions
 * environ), un écart est seulement signalé dans le commentaire. Les coups
 * proches du seuil ont été resondés trois fois avec un moteur neuf et
 * tranchés sur la moyenne : 25...Qd5 (0,58) de Tartakower en 1925,
 * 22.Rfd1 (0,60) et 23.Qe3 (0,51) de Nimzowitsch en 1914, et 33.Red2 (0,74)
 * en 1927, sont des fautes ; 17.Bd2 (0,40) en 1914, 20...Qe5 (0,24),
 * 28.Qh3 (0,27) en 1927 et 31.g4 (0,49) de Capablanca en 1924 ne sont que
 * des imprécisions. 29...a5 de Capablanca (New York 1927) oscillait autour
 * du seuil : six sondes, moyenne 0,48, il reste une imprécision. Les
 * évaluations citées sont du point de vue des Blancs. Aucun résultat de
 * partie dans les variantes : le parseur s'y arrêterait.
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

export const LA_CENTRALISATION_DES_PIECES: CourseTree = {
  chapters: [
    chapter(
      "Capablanca – Tartakower (Moscou 1925) : le rayonnement du cavalier e5",
      "r1b1k2r/pp3pp1/2pb1n1p/q2p4/3P4/3BPN1P/PP1N1PP1/R2Q1RK1 w kq - 2 13",
      `{ Pourquoi mettre ses pièces au centre ? Parce qu'une pièce centrale touche plus de cases. Compte les cases d'un cavalier : 2 en a1, 4 en a4, 8 en e5. Une dame en d4 couvre 27 cases sur un échiquier vide, une dame en a1 seulement 21. Plus une pièce touche de cases, plus elle a de choix, et plus vite elle rejoint l'aile où l'action se passe.

José Raúl Capablanca – Savielly Tartakower, Moscou 1925. Après 1.d4 d5 2.c4 e6 3.Nf3 Nf6 4.Bg5 Nbd7 5.e3 c6 6.Nbd2 Qa5 7.cxd5 exd5 8.Bd3 Ne4 9.O-O Nxg5 10.Nxg5 Nf6 11.h3 h6 12.Ngf3 Bd6, la position est égale. Le cavalier f3 ne touche encore que l'aile roi et le centre de loin.

PRO TIP : avant de déplacer une pièce, compte les cases qu'elle contrôlerait sur sa nouvelle case. Si le chiffre double et qu'aucun pion adverse ne peut la chasser, tu tiens probablement un bon coup. }
13. Ne5 { LE COUP DU CHAPITRE, le meilleur selon Stockfish. De f3, le cavalier regardait surtout son propre camp ; de e5, il touche 8 cases, c4, c6, d3, d7, f3, f7, g4 et g6, dont quatre dans le camp noir. Le pion noir d5 ne peut plus jamais le chasser, puisqu'il ne recule pas : seul ...f6 le pourrait, au prix d'un trou en e6. [%csl Ge5][%cal Ge5f7,Ge5d7,Ge5c6,Ge5g6] }
13... O-O { Le roi noir se met à l'abri. Un des meilleurs coups. }
14. f4 { Le pion f soutient le cavalier : si on l'échange, un pion reprendra en e5 et gagnera de l'espace. Un des meilleurs coups, au même niveau que 14.Rc1. [%cal Gf4e5] }
14... c5 { Les Noirs contestent le centre par l'autre côté. 14...Qb6 était un peu plus précis, environ 0,15 pion. [%cal Gc5d4] }
15. Nb3 { Le cavalier d2 chasse la dame et vise c5. Le meilleur coup. [%cal Gb3a5,Gb3c5] }
15... Qb6 { La dame s'écarte en gardant un œil sur b2. Un des meilleurs coups, au niveau de 15...Qb4. }
16. dxc5 { Les Blancs ouvrent la colonne d. Presque aussi bon que 16.Nxc5. }
16... Bxc5 { Le fou reprend et vise e3. Le meilleur coup. }
17. Nxc5 { Les Blancs échangent le fou actif. Le meilleur coup. }
17... Qxc5 { La dame reprend. Le meilleur coup, la position reste à peu près égale.

Bilan : le cavalier e5, soutenu par f4, reste la meilleure pièce de l'échiquier. Aucun pion noir ne peut l'en déloger sans s'affaiblir. [%csl Ge5] }`,
    ),
    chapter(
      "Capablanca – Tartakower (Moscou 1925) : le cavalier d4 devant le pion isolé",
      "r1b2rk1/pp4p1/3q3p/2np1p2/5P2/4PN1P/PP1Q2P1/1BR2RK1 w - - 0 22",
      `{ Suite de la même partie : 18.Qd2 Nd7 19.Rac1 Qd6 20.Nf3 Nc5 21.Bb1 f5. Les Noirs ont commis deux fautes de suite : 20...Nc5 (environ 0,7 pion de moins que 20...Nf6) puis 21...f5 (environ 1,2 pion de moins que 21...Nd7). Le pion f5 a affaibli la case e5 et le fou des cases blanches. Les Blancs ont environ +2,2.

Le pion noir d5 est ISOLÉ : aucun pion noir ne peut le soutenir, ni contrôler la case d4 devant lui. Cette case est donc un poste central parfait pour une pièce blanche.

PRO TIP : la case juste devant un pion isolé adverse est la meilleure case centrale de l'échiquier. Un cavalier qui s'y installe ne peut être chassé par aucun pion. }
22. Rfd1 { La tour rejoint la colonne d, derrière la dame : la pression sur le pion isolé va croître. Le meilleur coup. }
22... Be6 { Le fou défend d5 et f5 en même temps. Le meilleur coup. [%cal Ge6d5] }
23. Nd4 { LE COUP DU CHAPITRE, le meilleur coup, environ +2,7. Le cavalier s'installe devant le pion isolé. De d4 il frappe e6, f5, b5 et c6, et aucun pion noir ne pourra jamais le chasser. [%csl Gd4,Rd5][%cal Gd4e6,Gd4f5,Gd4b5,Gd4c6] }
23... Ne4 { Le cavalier noir se centralise à son tour et vise d2. Le meilleur coup. [%cal Ge4d2] }
24. Bxe4 { Le fou b1 échange le cavalier actif. Le meilleur coup selon Stockfish. }
24... dxe4 { Le pion reprend vers le centre. Le meilleur coup : 24...fxe4 était bien pire, environ 2 pions. }
25. Qa5 { La dame quitte d2 et frappe a7. Elle prépare Rc5, qui chassera la dame noire de d5. Le meilleur coup. [%cal Ga5a7] }
25... b6 { Le meilleur coup selon Stockfish, environ +2,7. Le pion chasse la dame blanche et protège a7 par avance. [%cal Gb6a5] }
(25... Qd5 { LE COUP DE LA PARTIE, une faute : environ 0,6 pion de moins que 25...b6 (moyenne de trois sondes). La dame noire se centralise et attaque le cavalier d4, défendu par la tour d1. Mais elle n'est pas en sécurité : la tour blanche va la chasser en gagnant du temps. [%cal Rd5d4] }
26. Rc5 { La tour attaque la dame noire. Le meilleur coup, environ +3. [%cal Gc5d5] }
26... Qxa2 { La dame quitte le centre pour un pion de l'aile. 26...Qd8 tenait mieux, environ 1 pion : la position est déjà décisive, l'écart est seulement signalé. [%cal Rd5a2] }
27. Qxa2 { Les Blancs échangent les dames. Le meilleur coup. }
27... Bxa2 { Le fou reprend, mais il se retrouve au bord de l'échiquier. Le meilleur coup. }
28. b3 { Le pion enferme le fou a2 : b3 est gardé par le cavalier d4, b1 par la tour d1. Le meilleur coup, environ +5. [%csl Ra2] })
26. Qe1 { La dame recule en e1, d'où elle surveille l'aile roi et la première rangée. Un des meilleurs coups. }
26... Qe7 { La dame noire défend e6 et la septième rangée. Le meilleur coup. }
27. Nc6 { Le cavalier pivote de d4 vers c6 : il attaque la dame e7 et le pion a7. Le meilleur coup. [%cal Gd4c6,Gc6e7,Gc6a7] }
27... Qe8 { La dame s'écarte. Le meilleur coup, environ +2,9.

Bilan : du centre, le cavalier d4 frappait toutes les cases du camp noir ; en un saut, il passe à l'attaque sur l'aile dame. Le fou e6, lui, n'a aucun poste comparable. [%csl Gd4] }`,
    ),
    chapter(
      "Nimzowitsch – Capablanca (Saint-Pétersbourg 1914) : le cavalier qui pivote par e5",
      "2r1r1k1/2p2pbp/2ppqnp1/8/4P3/2NQ1P2/PPP3PP/R1B2RK1 b - - 0 16",
      `{ Aron Nimzowitsch – José Raúl Capablanca, Saint-Pétersbourg 1914. Après 1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.Bb5 d6 5.d4 Bd7 6.Bxc6 Bxc6 7.Qd3 exd4 8.Nxd4 g6 9.Nxc6 bxc6 10.Qa6 Qd7 11.Qb7 Rc8 12.Qxa7 Bg7 13.O-O O-O 14.Qa6 Rfe8 15.Qd3 Qe6 16.f3, Capablanca a rendu un pion à l'ouverture, mais la position est égale.

Le pion f3 vient de couper les cases e4 et g4 au cavalier f6. Celui-ci n'a plus d'avenir en f6. Capablanca le fait passer par le centre : la case e5 est un TREMPLIN, d'où le cavalier peut sauter vers c4, d3, f3 ou g4.

PRO TIP : un cavalier qui n'a plus rien à faire sur son aile ne se déplace pas sur le bord. Il passe par une case centrale, d'où il pourra choisir sa destination finale. }
16... Nd7 { Le cavalier recule pour mieux repartir : il vise e5. Le meilleur coup. [%cal Gd7e5] }
17. Bd2 { Le fou se développe. Une imprécision : 17.a4, 17.b3 ou 17.Kh1 gardaient l'égalité, environ 0,4 pion de mieux (moyenne de trois sondes). }
17... Ne5 { LE COUP DU CHAPITRE, le meilleur. Le cavalier se centralise et attaque la dame d3. De e5 il vise c4, d3, f3 et g4. [%csl Ge5][%cal Ge5d3,Ge5c4,Ge5f3,Ge5g4] }
18. Qe2 { La seule bonne retraite : 18.Qa6 perdait environ 0,6 pion de plus, 18.Qe3 près de 2. }
18... Nc4 { Le cavalier pivote de e5 vers c4. Il attaque le fou d2 et le pion b2. Le meilleur coup. [%cal Gc4d2,Gc4b2] }
19. Rab1 { La tour défend b2. Le meilleur coup. }
19... Ra8 { La tour vise le pion a2. 19...d5 était un peu plus précis, environ 0,25 pion. [%cal Ga8a2] }
20. a4 { Le pion fuit l'attaque. 20.b3 était un peu plus précis, environ 0,15 pion. }
20... Nxd2 { Le cavalier s'échange contre le fou des cases noires. Un des meilleurs coups, au niveau de 20...d5. Le fou g7 n'a plus de rival : les cases noires du centre, d4 et e5, sont à lui. [%csl Gd4,Ge5] }
21. Qxd2 { La dame reprend. Le seul coup : tout autre perd une pièce.

Bilan : en deux coups par e5, le cavalier inutile de f6 a éliminé le meilleur défenseur des cases noires. [%csl Gg7] }`,
    ),
    chapter(
      "Nimzowitsch – Capablanca (Saint-Pétersbourg 1914) : la dame c4 se centralise",
      "r3r1k1/2p2pbp/2ppq1p1/8/P3P3/2N2P2/1PPQ2PP/1R3RK1 b - - 0 21",
      `{ Suite de la même partie, après 21.Qxd2. Le fou g7 règne sur les cases noires. La dame noire e6 va le seconder.

Une dame au centre est très forte, mais elle doit être en SÉCURITÉ : aucune pièce mineure ni aucun pion adverse ne doit pouvoir la chasser en gagnant du temps. Ici, seuls le cavalier c3 et le pion b2 pourraient la gêner.

PRO TIP : avant de centraliser ta dame, cherche quels pions et quelles pièces mineures adverses pourraient l'attaquer. Si la réponse est « aucun », la dame peut s'installer et paralyser le jeu adverse. }
21... Qc4 { LE COUP DU CHAPITRE, le meilleur. La dame attaque le pion a4 et, par la diagonale c4-f1, la tour f1. Seul b3 pourrait la chasser, au prix d'un trou en c3. [%csl Gc4][%cal Gc4a4,Gc4f1] }
22. g3 { Le meilleur coup selon Stockfish, environ -0,2. Le roi obtient la case g2 et la diagonale a7-g1, où un fou en d4 donnerait échec, perd son venin. [%cal Gg1g2] }
(22. Rfd1 { LE COUP DE LA PARTIE, une faute : environ 0,6 pion de moins que 22.g3 (moyenne de trois sondes). La tour quitte f1, mais le roi reste exposé sur la diagonale a7-g1. [%cal Rd4g1] }
22... Reb8 { La tour rejoint la colonne b et vise b2. Le meilleur coup. [%cal Gb8b2] }
23. Qe3 { Une deuxième faute, environ 0,5 pion de moins que 23.h4 (moyenne de trois sondes). La dame se place sur la diagonale a7-g1, où un fou en d4 la clouerait à son roi. [%cal Rd4g1] }
23... Rb4 { La tour attaque a4 et b2. Le meilleur coup, environ -1,5. Le chapitre suivant reprend ici. [%cal Gb4a4,Gb4b2] })
22... h5 { Le pion gagne de l'espace à l'aile roi. Le meilleur coup. }
23. Nd1 { Le cavalier se replie vers f2 ou e3, d'où il défendra les cases centrales. Le meilleur coup, la position reste à peu près égale.

Bilan : la dame c4 est forte parce qu'aucune pièce blanche ne peut la chasser. Les Blancs doivent jouer avec précision pour tenir. [%csl Gc4] }`,
    ),
    chapter(
      "Nimzowitsch – Capablanca (Saint-Pétersbourg 1914) : le fou d4 quand la dame s'égare",
      "r5k1/2p2pbp/2pp2p1/8/Prq1P3/2N1QP2/1PP3PP/1R1R2K1 w - - 5 24",
      `{ Suite de la variante du chapitre précédent : 22.Rfd1 Reb8 23.Qe3 Rb4. Les deux fautes blanches donnent aux Noirs environ 1,5 pion d'avantage. La tour b4 attaque a4 et b2, la dame c4 domine.

La dame blanche e3 garde une case capitale : d4, la case centrale sur la diagonale du fou g7. Tant qu'elle la surveille, le fou noir ne peut pas s'y poser avec échec.

PRO TIP : quand ta dame protège une case centrale vitale, ne la déplace pas vers l'aile pour une attaque. Demande-toi d'abord quelle pièce adverse prendrait la case aussitôt. }
24. Qd3 { Le meilleur coup selon Stockfish, environ -1,5. La dame reste au centre, propose l'échange et garde d4. [%cal Gd3c4] }
(24. Qg5 { LE COUP DE LA PARTIE, une grosse faute : environ 4,5 pions de moins que 24.Qd3. La dame part vers l'aile roi et abandonne la case d4. [%cal Re3g5] }
24... Bd4+ { LE COUP DU CHAPITRE. Le fou se pose sur la case centrale d4 avec échec : la dame blanche ne la garde plus. Stockfish préférait 24...Rab8, mais la position est déjà décisive : l'écart est seulement signalé. [%csl Gd4][%cal Gd4g1] }
25. Kh1 { Le roi fuit dans le coin. Le meilleur coup. }
25... Rab8 { La deuxième tour vise b2. Le meilleur coup, environ -4,5. [%cal Gb8b2] }
26. Rxd4 { Les Blancs rendent la qualité pour éliminer le fou d4. 26.Rbc1 était un peu plus tenace, environ 0,5 pion : l'écart est seulement signalé. }
26... Qxd4 { La dame reprend et s'installe à son tour sur d4 : elle attaque le cavalier c3. Le meilleur coup. [%csl Gd4][%cal Gd4c3] }
27. Rd1 { La tour attaque la dame. 27.Nd1 était plus tenace, environ 0,7 pion : l'écart est seulement signalé, la position est perdue. }
27... Qc4 { La dame revient en c4. Stockfish préférait 27...Qf2, environ 0,4 pion : l'écart est seulement signalé. }
28. h4 { Le roi reçoit une case en h2. 28.Qd2 était plus tenace, environ 0,7 pion : l'écart est seulement signalé. }
28... Rxb2 { La tour prend le pion b2 et entre en deuxième rangée. Le meilleur coup, environ -6. })
24... Qc5+ { La dame donne échec et reste centrale. Le meilleur coup. [%cal Gc5g1] }
25. Kf1 { Le roi s'écarte de la diagonale. Le meilleur coup : 25.Kh1 perdait environ 1,5 pion de plus. }
25... Rab8 { La deuxième tour rejoint la colonne b. Le meilleur coup, environ -1,5.

Bilan : avec 24.Qd3, la dame blanche reste au centre et la case d4 reste gardée. Les Noirs sont mieux, mais la partie continue. [%csl Gd4] }`,
    ),
    chapter(
      "Nimzowitsch – Capablanca (New York 1927) : la dame d5 bascule d'une aile à l'autre",
      "2rr2k1/p4ppp/1p2pq2/2b5/8/P3P3/1P2QPPP/R1B1R1K1 w - - 1 20",
      `{ Aron Nimzowitsch – José Raúl Capablanca, New York 1927 (deuxième ronde). Après 1.c4 Nf6 2.Nf3 e6 3.d4 d5 4.e3 Be7 5.Nbd2 O-O 6.Bd3 c5 7.dxc5 Na6 8.O-O Nxc5 9.Be2 b6 10.cxd5 Nxd5 11.Nb3 Bb7 12.Nxc5 Bxc5 13.Qa4 Qf6 14.Ba6 Bxa6 15.Qxa6 Nb4 16.Qe2 Rfd8 17.a3 Nd3 18.Ne1 Nxe1 19.Rxe1 Rac8, il n'y a plus de cavaliers. Les Noirs ont un léger avantage, environ 0,3 pion : leurs tours tiennent les colonnes c et d.

Le grand atout d'une dame centrale, c'est sa vitesse : en un coup, elle peut passer d'une aile à l'autre. Sans cavalier adverse, il devient aussi plus facile de lui trouver une case sûre.

PRO TIP : centralise ta dame quand tu ne sais pas encore sur quelle aile tu vas attaquer. Du centre, elle frappera là où l'adversaire s'est affaibli. }
20. Rb1 { La tour protège b2 à l'avance. Le meilleur coup selon Stockfish. }
20... Qe5 { La dame se centralise : elle vise b2 et h2, les deux ailes à la fois. 20...Qg6 était un peu plus précis, environ 0,25 pion (moyenne de trois sondes). [%csl Ge5][%cal Ge5b2,Ge5h2] }
21. g3 { Le pion ferme la diagonale b8-h2. Un des meilleurs coups, au niveau de 21.Bd2. }
21... Qd5 { LE COUP DU CHAPITRE. La dame s'installe en d5 : elle tient la colonne d, la cinquième rangée et la diagonale qui mène à a2. Le seul fou blanc roule sur les cases noires : il ne pourra jamais l'attaquer. Presque aussi bon que 21...h5. [%csl Gd5][%cal Gd5a2,Gd5d1,Gd5h5] }
22. b4 { Le pion chasse le fou c5. Le meilleur coup. [%cal Gb4c5] }
22... Bf8 { Le fou se replie et défend le roi. Le meilleur coup. }
23. Bb2 { Le fou se développe sur la grande diagonale. Le meilleur coup. }
23... Qa2 { La dame bascule de d5 vers l'aile dame en un seul coup : elle attaque b2 et b1. Un des meilleurs coups, au niveau de 23...Qe4. [%cal Gd5a2,Ga2b2] }
24. Ra1 { La tour chasse la dame. Un des meilleurs coups, au niveau de 24.Rbc1. [%cal Ga1a2] }
24... Qb3 { La dame reste active sur l'aile dame. Le meilleur coup. }
25. Bd4 { Le fou blanc se centralise lui aussi : de d4 il vise b6 et g7. Un des meilleurs coups, au niveau de 25.Rec1. [%csl Gd4][%cal Gd4b6,Gd4g7] }
25... Rc2 { La tour entre en deuxième rangée. Un des meilleurs coups, la position est égale. [%cal Gc2e2] }`,
    ),
    chapter(
      "Nimzowitsch – Capablanca (New York 1927) : la dame décentralisée en a6",
      "3r1bk1/p4ppp/1p2p3/8/1P1B4/Pq2P1P1/2r1QP1P/R3R1K1 w - - 7 26",
      `{ Suite de la même partie, après 25...Rc2. La position est égale. La dame blanche e2 est attaquée par la tour c2 et défend toute la deuxième rangée.

La centralisation vaut pour la défense aussi. Une dame qui part au bord de l'échiquier ne défend plus rien : elle ne peut plus revenir à temps quand l'adversaire frappe au centre ou près du roi.

PRO TIP : quand ta position est sous pression, cherche la case CENTRALE d'où ta dame contre-attaque et défend à la fois, plutôt qu'une case au bord qui ne fait qu'attaquer. }
26. Qd1 { Le meilleur coup selon Stockfish, la position reste égale. La dame recule sur la colonne d et attaque la tour c2. [%cal Gd1c2] }
(26. Qa6 { LE COUP DE LA PARTIE, une faute : plus de 1 pion de moins que 26.Qd1. La dame part au bord pour attaquer a7, et la deuxième rangée reste sans défense. [%cal Re2a6] }
26... e5 { Le pion chasse le fou central d4. Le meilleur coup. [%cal Ge6e5,Re5d4] }
27. Bxe5 { Le fou prend le pion. Le meilleur coup : les autres perdent plus. }
27... Rdd2 { Les deux tours noires sont en deuxième rangée et visent f2. Le meilleur coup, environ -1,5. [%cal Gd2f2] }
28. Qb7 { Une deuxième faute, environ 3,6 pions de moins que 28.Qf1. Il fallait ramener la dame défendre f2 ; elle reste au bord. }
28... Rxf2 { La tour prend f2, la position blanche s'effondre. Le meilleur coup, environ -5. }
29. g4 { Les Blancs tentent de créer du jeu à l'aile roi. 29.Bd4 était plus tenace, environ 0,9 pion : l'écart est seulement signalé. }
29... Qe6 { La dame revient au centre et vise g4. Le meilleur coup. [%cal Ge6g4] })
26... Qc4 { La dame noire se recentralise en c4 et garde la tour c2. Un des meilleurs coups. }
27. Rc1 { La tour conteste la colonne c. Le meilleur coup. }
27... Rxc1 { Les Noirs échangent les tours. Le meilleur coup. }
28. Qxc1 { La dame reprend. Le meilleur coup. }
28... Rc8 { La dernière tour noire prend la colonne c. Le meilleur coup, la position est égale.

Bilan : avec la dame en d1, les Blancs tiennent. Avec la dame en a6, ils ont perdu en quelques coups. [%csl Gd1,Ra6] }`,
    ),
    chapter(
      "Nimzowitsch – Capablanca (New York 1927) : la tour c4 et le cavalier central échangé",
      "2r3k1/ppr2p2/1qn1p1p1/3pP1Pp/3N1P2/P1PRQ3/1P2R1KP/8 b - - 10 26",
      `{ Aron Nimzowitsch – José Raúl Capablanca, New York 1927 (onzième ronde). Après 1.e4 c6 2.d4 d5 3.e5 Bf5 4.Bd3 Bxd3 5.Qxd3 e6 6.Nc3 Qb6 7.Nge2 c5 8.dxc5 Bxc5 9.O-O Ne7 10.Na4 Qc6 11.Nxc5 Qxc5 12.Be3 Qc7 13.f4 Nf5 14.c3 Nc6 15.Rad1 g6 16.g4 Nxe3 17.Qxe3 h5 18.g5 O-O 19.Nd4 Qb6 20.Rf2 Rfc8 21.a3 Rc7 22.Rd3 Na5 23.Re2 Re8 24.Kg2 Nc6 25.Red2 Rec8 26.Re2, les Noirs ont environ 2,5 pions d'avantage. Les poussées 16.g4 et 18.g5 ont affaibli le roi blanc et laissé la case f5 aux pièces noires. Stockfish juge sévèrement plusieurs manœuvres lentes des Noirs (22...Na5, 25...Rec8 perdaient environ 1 pion chacun), mais l'avantage est resté.

La meilleure pièce blanche est le cavalier d4, posé au centre et soutenu par c3. Le plan des Noirs : l'ÉCHANGER, puis occuper eux-mêmes les cases centrales qu'il gardait.

PRO TIP : quand l'adversaire a une pièce centrale très forte, échange-la contre une pièce moins active. Les cases qu'elle surveillait deviennent alors libres pour tes propres pièces. }
26... Ne7 { Le cavalier se dirige vers f5, d'où il pourra s'échanger contre le cavalier d4. 26...Kg7 était un peu plus précis, environ 0,2 pion (moyenne de trois sondes). [%cal Ge7f5] }
27. Red2 { La tour revient défendre la colonne d. Un des meilleurs coups. }
27... Rc4 { LE COUP DU CHAPITRE, le meilleur. La tour s'installe en c4, soutenue par le pion d5. Elle attaque d4 et tient la quatrième rangée. Seul le pion b pourrait la chasser par b3, au prix d'affaiblir c3. [%csl Gc4][%cal Gc4d4,Gd5c4] }
28. Qh3 { La dame part vers l'aile roi. 28.b3, qui chassait la tour, était un peu plus précis, environ 0,3 pion (moyenne de trois sondes). }
28... Kg7 { Le roi défend h6 et f6. Un des meilleurs coups. }
29. Rf2 { La tour défend f4. Une petite imprécision, environ 0,2 pion : 29.Qe3 ramenait la dame au centre. }
29... a5 { Le pion gagne de l'espace et empêche b4. 29...a6 était un peu plus précis. Le coup est à la limite : environ 0,48 pion en moyenne sur six sondes, une imprécision et pas tout à fait une faute. }
30. Qe3 { Le meilleur coup selon Stockfish, environ -1,8. La dame revient au centre et garde d4. [%cal Gh3e3] }
(30. Re2 { LE COUP DE LA PARTIE, une faute : environ 1,3 pion de moins que 30.Qe3. La dame reste loin du centre, en h3. }
30... Nf5 { Le cavalier vient s'échanger contre le cavalier central blanc. Stockfish préférait 30...Nc6, environ 0,9 pion, mais la position est déjà décisive : l'écart est seulement signalé. [%cal Gf5d4] }
31. Nxf5+ { Les Blancs échangent. Le meilleur coup : la menace sur d4 était trop forte. }
31... gxf5 { Le pion reprend. La case e4 devient un poste parfait : aucun pion blanc ne pourra jamais l'attaquer. Le meilleur coup. [%csl Ge4] }
32. Qf3 { La dame se rapproche du centre. Un des meilleurs coups. }
32... Kg6 { Le roi se met à l'abri derrière ses pions. Le meilleur coup. Le chapitre suivant reprend ici. })
30... Qa6 { La dame se replace en a6 et vise l'aile dame. Un des meilleurs coups. }
31. b3 { Le pion chasse enfin la tour c4. Le meilleur coup. [%cal Gb3c4] }
31... R4c7 { La tour recule : la case c4 n'était forte que tant qu'aucun pion ne pouvait l'attaquer. Le meilleur coup, environ -2,5.

Bilan : une case centrale n'est un vrai poste que si aucun pion adverse ne peut la contester. [%csl Gc4] }`,
    ),
    chapter(
      "Nimzowitsch – Capablanca (New York 1927) : la tour e4, un poste imprenable",
      "2r5/1p3p2/1q2p1k1/p2pPpPp/2r2P2/P1PR1Q2/1P1R2KP/8 b - - 3 33",
      `{ Suite de la variante 30.Re2 du chapitre précédent : 30...Nf5 31.Nxf5+ gxf5 32.Qf3 Kg6 33.Red2. Ce dernier coup est une faute, environ 0,7 pion de moins que 33.h3 (moyenne de trois sondes). Les Noirs ont maintenant environ 3,3 pions d'avantage.

Regarde la case e4. Aucun pion blanc ne peut l'attaquer : il n'y a pas de pion blanc sur la colonne d, et le pion f4 a déjà dépassé la case. Une pièce noire posée en e4 y restera aussi longtemps qu'elle le voudra.

PRO TIP : la meilleure case centrale n'est pas forcément d4 ou e4 en général : c'est celle que AUCUN pion adverse ne peut plus attaquer. Repère ces cases et réserve-les à tes tours et à ta dame. }
33... Re4 { LE COUP DU CHAPITRE, le meilleur. La tour s'installe sur la case imprenable e4. Elle attaque le pion f4 et coupe la quatrième rangée. [%csl Ge4][%cal Ge4f4] }
34. Rd4 { Les Blancs proposent l'échange des tours. Le meilleur coup. [%cal Gd4e4] }
34... Rxd4 { Le meilleur coup selon Stockfish, environ -2,6. Les Noirs échangent en d4 et préparent l'entrée de la tour c8. }
(34... Rc4 { LE COUP DE LA PARTIE, une faute : environ 1 pion de moins que 34...Rxd4. Les deux tours noires sont centralisées, mais les Blancs peuvent les échanger et souffler. }
35. Qf2 { Une faute en retour : 35.Rxc4 tenait mieux, environ 1,2 pion. La dame ne fait que défendre. }
35... Qb5 { La dame se rapproche des tours. Un des meilleurs coups, au niveau de 35...Qa6. [%cal Gb5c4] }
36. Kg3 { Une grosse faute, environ 2,6 pions de moins que 36.Rxe4. Les Noirs ont désormais plus de 5 pions d'avantage. Le chapitre suivant reprend ici. })
35. cxd4 { Le pion reprend. Le meilleur coup. }
35... Rc1 { La tour pénètre en première rangée. Le meilleur coup, environ -3.

Bilan : la tour e4 a forcé les Blancs à échanger, et la colonne c s'est ouverte pour l'autre tour. [%csl Ge4][%cal Gc8c1] }`,
    ),
    chapter(
      "Nimzowitsch – Capablanca (New York 1927) : les pièces lourdes pénètrent",
      "8/1p3p2/4p1k1/pq1pPpPp/2rRrP2/P1P3K1/1P1R1Q1P/8 b - - 9 36",
      `{ Suite de la variante 34...Rc4 du chapitre précédent : 35.Qf2 Qb5 36.Kg3. Après la faute 36.Kg3, les Noirs ont plus de 5 pions d'avantage. Dans une position aussi décisive, les écarts avec le moteur sont seulement signalés.

Les deux tours noires tiennent c4 et e4. La dame noire les suit. Les pièces lourdes centralisées vont maintenant pénétrer dans le camp blanc.

PRO TIP : une pièce centrale n'est pas une fin en soi. Le centre est un carrefour : de là, tes pièces lourdes choisissent la porte d'entrée la plus faible du camp adverse. }
36... Rcxd4 { La tour c4 prend en d4. Le meilleur coup. [%cal Gc4d4] }
37. cxd4 { Le pion reprend. Le meilleur coup selon Stockfish. }
37... Qc4 { La dame prend la place de la tour sur c4. Un des meilleurs coups, au niveau de 37...Qb3+. [%csl Gc4][%cal Gc4d4,Gc4f1] }
38. Kg2 { Le roi recule. Un des meilleurs coups dans une position perdue. }
38... b5 { Le pion b se met en marche. 38...a4 était plus fort, environ 0,8 pion : l'écart est seulement signalé. }
39. Kg1 { Le roi attend. Un des meilleurs coups dans une position perdue. }
39... b4 { Le pion attaque a3. Un des meilleurs coups. [%cal Gb4a3] }
40. axb4 { Le pion prend. 40.Kg2 ou 40.a4 étaient un peu plus tenaces, environ 0,7 pion : l'écart est seulement signalé. }
40... axb4 { Le pion b4 devient un pion passé. Un des meilleurs coups, environ -7. }
41. Kg2 { Le roi revient. Un des meilleurs coups, au niveau de 41.Kh1. }
41... Qc1 { La dame pénètre en première rangée. Le meilleur coup. [%cal Gc4c1] }
42. Kg3 { Le roi avance. Un des meilleurs coups, au niveau de 42.Kh3. }
42... Qh1 { La dame s'installe en h1, derrière le roi blanc. Un des meilleurs coups. [%cal Gc1h1] }
43. Rd3 { La tour défend la troisième rangée. 43.Kh4 était plus tenace, environ 0,6 pion : l'écart est seulement signalé. }
43... Re1 { La tour e4 entre à son tour. Le meilleur coup. [%cal Ge4e1] }
44. Rf3 { La tour se place en f3, à côté du roi. Le meilleur coup. }
44... Rd1 { La tour attaque d4 par l'arrière. 44...Rc1 ou 44...Rb1 étaient un peu plus forts, environ 0,6 pion : l'écart est seulement signalé. }
45. b3 { Le pion avance. 45.Kh4 ou 45.Qe2 étaient plus tenaces, environ 1 pion : l'écart est seulement signalé. }
45... Rc1 { La tour change de colonne. Un des meilleurs coups, au niveau de 45...Rb1. }
46. Re3 { La tour quitte f3. 46.Qe2 était bien plus tenace : après 46.Re3, Stockfish voit un mat forcé. L'écart est seulement signalé. }
46... Rf1 { La tour attaque la dame f2, qui ne peut la prendre sans tomber sous la dame h1. Le meilleur coup. Les Blancs perdent du matériel et Nimzowitsch a abandonné.

Bilan : parties de c4 et e4, la dame et la tour noires ont rejoint la première rangée sans que les Blancs puissent les arrêter. [%csl Gh1,Gf1] }`,
    ),
    chapter(
      "Capablanca – Tartakower (New York 1924) : la marche du roi en finale",
      "5k2/p1p4R/1pr3p1/3p1nP1/P2P1P2/2PB1K2/8/8 w - - 3 34",
      `{ José Raúl Capablanca – Savielly Tartakower, New York 1924. Après 1.d4 e6 2.Nf3 f5 3.c4 Nf6 4.Bg5 Be7 5.Nc3 O-O 6.e3 b6 7.Bd3 Bb7 8.O-O Qe8 9.Qe2 Ne4 10.Bxe7 Nxc3 11.bxc3 Qxe7 12.a4 Bxf3 13.Qxf3 Nc6 14.Rfb1 Rae8 15.Qh3 Rf6 16.f4 Na5 17.Qf3 d6 18.Re1 Qd7 19.e4 fxe4 20.Qxe4 g6 21.g3 Kf8 22.Kg2 Rf7 23.h4 d5 24.cxd5 exd5 25.Qxe8+ Qxe8 26.Rxe8+ Kxe8 27.h5 Rf6 28.hxg6 hxg6 29.Rh1 Kf8 30.Rh7 Rc6 31.g4 Nc4 32.g5 Ne3+ 33.Kf3 Nf5, la finale semble tenable. 31.g4 était une imprécision, environ 0,5 pion (moyenne de trois sondes). Mais 33...Nf5 est une grosse faute : environ 2,8 pions de moins que 33...Nd1. Les Blancs ont près de +3.

En milieu de partie, le roi se cache. En finale, c'est l'inverse : avec peu de pièces, il n'y a plus de mat à craindre, et le roi devient une pièce de combat. Il doit marcher vers l'endroit où se décide la partie.

PRO TIP : dès que les dames sont échangées, demande-toi à chaque coup « mon roi peut-il se rapprocher de l'action ? ». Un roi actif vaut souvent un pion, parfois une pièce. }
34. Bxf5 { Le fou échange le cavalier. Le meilleur coup : il ne reste qu'une finale de tours. }
34... gxf5 { Le pion reprend, forcé. Le pion f5 est faible et bloqué. }
35. Kg3 { LE COUP DU CHAPITRE, le meilleur. Le roi part vers h4, g5 et f6, quitte à laisser le pion c3. Il ira soutenir le pion g. [%cal Gf3g3,Gg3h4,Gh4g5,Gg5f6] }
35... Rxc3+ { La tour prend le pion avec échec. Un des meilleurs coups : tous se valent dans une position perdue. }
36. Kh4 { Le roi continue sa route. Le meilleur coup. [%cal Gh4g5] }
36... Rf3 { La tour attaque f4. 36...a6 était plus tenace, environ 0,8 pion : l'écart est seulement signalé, la position est décisive. [%cal Gf3f4] }
37. g6 { Le pion avance vers la promotion. Le meilleur coup. [%cal Gg6g7] }
37... Rxf4+ { La tour prend un deuxième pion avec échec. Le meilleur coup. }
38. Kg5 { Le roi avance encore. Le meilleur coup, environ +6. [%cal Gg5f6] }
38... Re4 { La tour se place derrière le roi blanc. Le meilleur coup. }
39. Kf6 { Le roi arrive en f6 : il soutient le pion g et enferme le roi noir. Le meilleur coup. [%csl Gf6][%cal Gf6g7,Gf6f7] }
39... Kg8 { Le roi noir s'écarte de la colonne f. Le meilleur coup. }
40. Rg7+ { La tour donne échec. Un des meilleurs coups, au niveau de 40.Rh5. }
40... Kh8 { Le roi va dans le coin. Un des meilleurs coups, au niveau de 40...Kf8.

Bilan : deux pions de moins, mais le roi blanc, actif, et le pion g, avancé, valent bien plus. [%csl Gf6] }`,
    ),
    chapter(
      "Capablanca – Tartakower (New York 1924) : le roi central escorte le pion passé",
      "7k/p1p3R1/1p3KP1/3p1p2/P2Pr3/8/8/8 w - - 6 41",
      `{ Suite de la même partie, après 40...Kh8. Les Blancs ont environ +7 : dans une position aussi décisive, les écarts avec le moteur sont seulement signalés.

Le roi blanc a fini son travail à l'aile roi. Il va maintenant revenir vers le CENTRE, ramasser les pions noirs f5 et d5, puis escorter le pion d jusqu'à la promotion.

PRO TIP : en finale, le centre reste la meilleure base pour le roi : de là, il peut aider ses pions sur une aile comme sur l'autre. }
41. Rxc7 { La tour prend le pion c7. Un des meilleurs coups. }
41... Re8 { La tour se replie. Le meilleur coup. }
42. Kxf5 { Le roi prend f5 et se rapproche du centre. Un des meilleurs coups. [%cal Gf6f5] }
42... Re4 { La tour revient en e4. 42...a5 était un peu plus tenace, environ 0,4 pion : l'écart est seulement signalé. }
43. Kf6 { Le roi revient soutenir le pion g. Le meilleur coup. }
43... Rf4+ { La tour donne échec. Un des meilleurs coups, au niveau de 43...Re8. }
44. Ke5 { Le roi se centralise : il attaque déjà le pion d5. Le meilleur coup. [%csl Ge5][%cal Ge5d5] }
44... Rg4 { La tour attaque le pion g6. Le meilleur coup. }
45. g7+ { Le pion avance avec échec. Le meilleur coup. }
45... Kg8 { Le roi bloque le pion. Un des meilleurs coups, au niveau de 45...Kh7. }
46. Rxa7 { La tour prend le pion a7. Le meilleur coup. }
46... Rg1 { La tour se place loin derrière. Un des meilleurs coups dans une position perdue. }
47. Kxd5 { LE COUP DU CHAPITRE. Le roi prend d5 et s'installe au centre, devant son pion d. Le meilleur coup. [%csl Gd5][%cal Gd5d6] }
47... Rc1 { La tour coupe le roi par la colonne c. 47...Ra1 était plus tenace, entre 0,8 et 2,7 pions selon les sondes : l'écart est seulement signalé. [%cal Gc1c8] }
48. Kd6 { Le roi avance devant son pion. Un des meilleurs coups, au niveau de 48.Ke5. }
48... Rc2 { La tour attend. Après ce coup, Stockfish trouve un mat forcé : 48...Ra1 tenait plus longtemps. }
49. d5 { Le pion avance, escorté par le roi. Un des coups gagnants, au niveau de 49.Re7. [%cal Gd5d6] }
49... Rc1 { La tour garde la colonne c. Un mat forcé suit encore. }
50. Rc7 { La tour chasse la tour noire de la colonne c. Un des coups gagnants. [%cal Gc7c1] }
50... Ra1 { La tour s'éloigne. Un des meilleurs coups dans une position perdue. }
51. Kc6 { Le roi libère la case d6 pour son pion. Un des coups gagnants. [%cal Gd5d6] }
51... Rxa4 { La tour prend le dernier pion blanc de l'aile dame. Tous les coups perdent. }
52. d6 { Le pion avance, protégé par le roi. Un des coups gagnants. Tartakower a abandonné.

Bilan : le roi blanc a fait le tour de l'échiquier, de f3 à c6. En finale, c'est souvent la pièce qui décide. [%csl Gc6,Gd6] }`,
    ),
  ],
};
