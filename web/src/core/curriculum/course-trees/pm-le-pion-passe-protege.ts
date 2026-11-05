import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « Le pion passé protégé » (positional_mastery, module 26) —
 * format « un commentaire par coup ».
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, entièrement
 * réécrite ici) : scores PGN des archives de joueurs de pgnmentor.com,
 * rejoués avec chess.js. Les parties ont été choisies par un script qui
 * repère, dans ces archives, les parties gagnées où un pion passé protégé
 * reste longtemps sur l'échiquier avec des pièces : Kramnik – Polgar
 * (Vienne 1996), le pion e6 né de 15.Ne6 puis protégé par d5 ; Topalov –
 * Kramnik (Linares 1998), le pion c4 protégé par d5 dans le Gambit dame,
 * libéré par un sacrifice de qualité ; Spassky – Petrosian (championnat du
 * monde, Moscou 1969, 11e partie), le pion b5 offert par 21.a5, puis deux
 * pions liés b5-c4 ; Carlsen – Aronian (GRENKE Chess Classic 2019), le pion
 * d5 créé par 15.Bd5 et protégé par c4.
 *
 * Plan : naissance d'un pion passé (1), le protéger avant tout (2), le
 * pion qui coupe le camp adverse (3), la case f7 offerte par le pion (4),
 * le pion protégé né de l'ouverture (5), rendre la qualité pour libérer les
 * pions (6), ne pas offrir de pion passé protégé (7), la qualité offerte
 * en c4 (8), deux pions liés (9), la marche des pions (10), créer le pion
 * d5 (11), la faute qui libère le pion (12), le pion qui pèse jusqu'au
 * bout (13).
 *
 * Toutes les lignes ont été rejouées avec chess.js et chaque coup sondé avec
 * Stockfish 19 (binaire Linux local, profondeur 18, 3 candidats par coup),
 * suites du moteur comprises. Règle appliquée : quand un coup perd environ
 * 0,5 pion ou plus par rapport au choix du moteur, la LIGNE PRINCIPALE suit
 * le moteur et le coup de la partie passe en variante, signalée comme
 * fautive. Exception : dans une position déjà décisive (plus de 3 pions
 * environ), un écart est seulement signalé dans le commentaire. Les coups
 * proches du seuil ont été resondés trois fois avec un moteur neuf et
 * tranchés sur la moyenne : 16...Ne8 (0,57), 26.Be4 (0,50), 26...Rg5
 * (0,85) et 27...Bf6 (1,0) en 1996, 21.a5 (0,64), 39.Ra2 (0,76) et
 * 39...Rec8 (0,69) en 1969, 26...f5 (1,1), 27...e4 (0,81) et 32...Qc7
 * (0,89) en 2019 sont des fautes ; 25...Qg8 (0,48), 22...f4 (0,45),
 * 26...Qe8 (0,33) et 18.exf5 (0,24) en 1996, 18...Qd6, 22.Nd2 et 22...Ba8
 * (environ 0,2) en 1998 ne sont que des imprécisions. Les évaluations citées sont du
 * point de vue des Blancs. Aucun résultat de partie dans les variantes : le
 * parseur s'y arrêterait.
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

export const LE_PION_PASSE_PROTEGE: CourseTree = {
  chapters: [
    chapter(
      "Kramnik – Polgar (Vienne 1996) : la naissance d'un pion passé",
      "1rbq1r1k/1pp1n1bp/3p1np1/pP1PppN1/2P1P3/2N2B2/PB3PPP/R2QR1K1 w - - 1 15",
      `{ Un pion passé n'a plus aucun pion adverse devant lui, ni sur sa colonne ni sur les colonnes voisines. Quand un de ses propres pions le soutient en diagonale, on dit qu'il est PROTÉGÉ : aucune pièce adverse ne peut le prendre sans perdre du matériel, et le roi adverse ne peut pas s'en approcher pour le dévorer.

Vladimir Kramnik – Judit Polgar, Vienne 1996, 6e ronde. Après 1.Nf3 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.d4 O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7 9.b4 Nh5 10.Re1 f5 11.Ng5 Nf6 12.Bf3 Kh8 13.Bb2 a5 14.b5 Rb8, une Est-indienne. Les Blancs ont environ +0,9.

PRO TIP : un pion passé qui vient de naître est encore fragile. Avant de rêver de promotion, compte combien de pièces adverses peuvent l'attaquer, et combien des tiennes peuvent le défendre. }
15. Ne6 { Un des meilleurs coups, presque au niveau de 15.Qd2. Le cavalier saute en e6 : les Noirs ne peuvent pas le laisser là, il attaque la dame d8 et la tour f8. [%csl Ge6][%cal Ge6d8,Ge6f8] }
15... Bxe6 { Le seul coup : 15...Qe8 perdait la qualité, environ +4,7. }
16. dxe6 { Le meilleur coup. Le pion d5 reprend et devient un pion passé en e6 : plus aucun pion noir ne peut l'arrêter sur les colonnes d, e et f. Mais il n'est pas protégé. [%csl Ge6] }
16... fxe4 { LE COUP QUE STOCKFISH PROPOSE. Les Noirs ouvrent la colonne f et visent tout de suite le pion e6, qui n'a plus de pion pour le soutenir. [%cal Gf8f6,Gf6e6] }
(16... Ne8 { La partie. Une faute, environ 0,6 pion selon trois sondes : le cavalier se replie au lieu d'attaquer. Les Blancs vont avoir le temps de protéger leur pion e6, ce qui fait l'objet du chapitre suivant. })
17. Nxe4 { Le meilleur coup. Le cavalier reprend au centre. }
17... Nxe4 { Le meilleur coup. Les Noirs échangent le défenseur. }
18. Bxe4 { Le meilleur coup. Le fou reprend et surveille la diagonale vers h7. }
18... Qc8 { Le meilleur coup. La dame vise directement le pion e6. [%cal Gc8e6] }
19. b6 { Le meilleur coup. Les Blancs cherchent du jeu à l'aile dame, car e6 ne peut plus être sauvé. }
19... Rf6 { Un des meilleurs coups, au niveau de 19...Qxe6. La tour attaque e6 une seconde fois. [%cal Gf6e6] }
20. h4 { Un des meilleurs coups. Les Blancs cherchent du jeu à l'aile roi. }
20... Rxe6 { Un des meilleurs coups, au niveau de 20...Qxe6. Le pion e6 est tombé. Les Blancs ont encore environ +0,8, mais ils n'ont plus de pion passé.

Bilan : un pion passé non protégé est une cible. Avec 16...fxe4, les Noirs attaquaient e6 avant qu'il ne trouve un soutien. }`,
    ),
    chapter(
      "Kramnik – Polgar (Vienne 1996) : protéger le pion avant tout",
      "1r1qnr1k/1pp1n1bp/3pP1p1/pP2pp2/2P1P3/2N2B2/PB3PPP/R2QR1K1 w - - 1 17",
      `{ Après 16...Ne8?, les Blancs ont environ +1,4. Le pion e6 est passé, mais seul. Kramnik va consacrer les coups suivants à une seule idée : lui donner un pion de soutien.

Le plan est simple. Le cavalier c3 ira en d5 ; si les Noirs le prennent, le pion c4 reprendra en d5. Ce pion d5 protégera e6 pour toujours.

PRO TIP : pour protéger un pion passé avec un pion, regarde quelle case se trouve en diagonale derrière lui (ici d5 ou f5), puis cherche comment amener un pion sur cette case, souvent par une prise. }
17. Qb3 { Un des meilleurs coups, au niveau de 17.c5. La dame se place sur la diagonale a2-g8 et soutient la future avance du pion. [%cal Gb3g8] }
17... c5 { Le meilleur coup. Les Noirs empêchent c4-c5, qui aurait ouvert l'aile dame. Mais le pion c4 reste ainsi en c4, prêt à reprendre en d5. }
18. exf5 { Les Blancs ouvrent la position. Une imprécision : 18.Nd5 était un peu meilleur, environ 0,25 pion. }
18... gxf5 { Un des meilleurs coups, au niveau de 18...Nxf5. }
19. Bh5 { Un des meilleurs coups. Le fou vise la case f7. [%cal Gh5f7] }
19... Nc7 { Un des meilleurs coups. Le cavalier attaque e6, toujours non protégé. [%cal Gc7e6] }
20. Bf7 { Le seul bon coup : 20.Ne2 perdait le pion e6 et environ 2,5 pions d'évaluation. Le fou s'installe devant le pion, sur une case que les Noirs ne peuvent pas attaquer avec un pion. [%csl Gf7] }
20... Qc8 { Le meilleur coup. La dame attaque e6 une seconde fois. }
21. Nd5 { Le meilleur coup, et le cœur du plan. Le cavalier va en d5 en sachant qu'il sera pris. [%csl Gd5] }
21... Ncxd5 { Le meilleur coup. Les Noirs prennent, sinon le cavalier d5 bloque tout. }
22. cxd5 { Le seul coup. Le pion c4 reprend en d5 : e6 est maintenant un pion passé PROTÉGÉ. Le roi noir ne pourra jamais le prendre, et toute pièce qui le prendra sera reprise. [%csl Ge6,Gd5][%cal Gd5e6] }
22... f4 { Le pion gagne de l'espace vers le roi blanc. Une imprécision : 22...Rxf7 était meilleur d'environ 0,45 pion selon trois sondes : les Noirs rendaient la qualité pour prendre le fou f7, puis le pion qui reprend en f7. Quand un pion passé protégé devient trop fort, donner une qualité pour s'en débarrasser est souvent le meilleur choix.

Bilan : les Blancs ont environ +1,4. Trois coups ont suffi pour transformer un pion isolé et fragile en un pion protégé qui va paralyser les Noirs. }`,
    ),
    chapter(
      "Kramnik – Polgar (Vienne 1996) : le pion protégé coupe le camp adverse en deux",
      "1rq2r1k/1p2nBbp/3pP3/pPpPp3/5p2/1Q6/PB3PPP/R3R1K1 w - - 0 23",
      `{ Le pion e6 est installé, soutenu par d5. Les Blancs ont environ +1,4. Regarde ce qu'il fait sans même bouger : il retire les cases d7 et f7 aux pièces noires, et les Noirs doivent garder un œil sur la case e7 en permanence.

La conséquence : les pièces noires de l'aile dame ont du mal à venir défendre l'aile roi. Le pion coupe le camp noir en deux.

PRO TIP : face à un pion passé protégé, ne bloque pas avec n'importe quelle pièce. Le meilleur bloqueur est celui qui reste actif devant le pion. Sinon, chaque pièce occupée à surveiller le pion manque ailleurs. }
23. Bh5 { Le meilleur coup. Le fou quitte f7, où il risquait d'être échangé contre une tour, et reste près du roi noir. [%cal Gh5e8] }
23... b6 { Le meilleur coup. Les Noirs bloquent l'aile dame pour pouvoir ensuite s'occuper du roi. }
24. Rad1 { Un des meilleurs coups. La tour se prépare à passer par la 3e rangée vers l'aile roi. }
24... Rf5 { Le meilleur coup. La tour noire s'active sur la 5e rangée. }
25. Bf3 { Un des meilleurs coups. 25.Qh3 était à peine plus précis, environ 0,2 pion. }
25... Qg8 { La dame vient protéger son roi. Une imprécision : 25...Bf6 était meilleur d'environ 0,5 pion selon trois sondes (moyenne 0,48), juste sous le seuil. }
26. Rd3 { LE COUP QUE STOCKFISH PROPOSE. La tour passe par la 3e rangée vers h3 : derrière le pion e6, les Noirs manquent de défenseurs. [%cal Gd3h3] }
(26. Be4 { La partie. Une faute à la limite, environ 0,5 pion selon trois sondes : le fou se centralise, mais la tour d1 reste inactive un coup de plus. }
26... Rg5 { Une faute à son tour, environ 0,85 pion selon trois sondes. 26...Rh5 était meilleur. }
27. Rd3 { Un des meilleurs coups. La tour arrive par la 3e rangée. }
27... Bf6 { Encore une faute, environ 1 pion selon trois sondes : 27...Bh6 défendait mieux. }
28. Rh3 { Un des meilleurs coups. La tour blanche vise h7. Les Blancs ont environ +3,1. [%cal Gh3h7] }
28... Ng6 { Les Noirs couvrent h8. Les Blancs ont environ +3,7 : la position est décidée. La suite fait l'objet du chapitre suivant. })
26... Qe8 { La dame se rapproche de e6 et de l'aile roi. 26...Rbf8 était peut-être un peu plus précis, environ 0,3 pion selon trois sondes. }
27. Be4 { Un des meilleurs coups. Le fou se centralise et attaque la tour f5. [%cal Ge4f5] }
27... Rh5 { Le meilleur coup. La tour quitte f5 et protège h7. }
28. Rh3 { Un des meilleurs coups : 28.g3 était au même niveau selon trois sondes. La tour échange ou chasse la tour h5. }
28... Ng8 { Le meilleur coup. Le cavalier vient défendre f6 et h6. Les Blancs ont environ +2,1.

Bilan : un pion passé protégé ne gagne pas seul. Il paralyse les pièces adverses, et le jeu se décide ensuite sur une autre partie de l'échiquier, ici l'aile roi. }`,
    ),
    chapter(
      "Kramnik – Polgar (Vienne 1996) : la case f7, cadeau du pion e6",
      "6nk/4q1rp/1p1pPb2/pPpPp2Q/4B2P/6p1/PB3PR1/7K w - - 0 39",
      `{ La partie a continué 26.Be4 Rg5 27.Rd3 Bf6 28.Rh3 Ng6 29.Qf3 Rb7 30.Rh5 Rxh5 31.Qxh5 Rg7 32.g3 Ne7 33.Kh1 Qf8 34.Rg1 Ng8 35.Qf3 Bg5 36.h4 Bf6 37.Rg2 Qe7 38.Qh5 fxg3. Ce dernier coup est une faute (environ 0,6 pion) : 38...Qf8 tenait mieux. Les Blancs ont environ +3,4.

Le pion e6 n'a pas bougé depuis le 16e coup. Mais il contrôle la case f7 : une tour blanche qui s'y posera ne pourra pas être chassée par un pion.

PRO TIP : un pion passé protégé travaille même immobile. Regarde les deux cases qu'il attaque en diagonale : ce sont des points d'entrée sûrs pour tes pièces. }
39. fxg3 { Le meilleur coup. Le pion reprend et ouvre la colonne f à la tour g2. [%cal Gg2f2,Gf2f7] }
39... Qf8 { Les Noirs veulent contrôler la colonne f. La position est décidée : 39...Qd8 tenait plus longtemps, environ 1,6 pion d'écart. }
40. Rf2 { Le meilleur coup. La tour prend la colonne f. [%cal Gf2f7] }
40... Qd8 { La dame revient défendre. 40...c4 était plus tenace, mais les Blancs gagnent de toute façon. }
41. g4 { Le meilleur coup. Le pion g arrive pour chasser le fou f6. [%cal Gg4g5] }
41... Be7 { La position est perdue ; 41...Bxh4 tenait un peu plus longtemps. Le fou se replie pour garder la diagonale d8-h4. }
42. g5 { Le meilleur coup. Le pion avance encore : le fou noir n'a plus de bonne case pour défendre f7 et h7. }
42... c4 { Les Noirs cherchent un contre-jeu sur la diagonale. Mais il est trop tard : les Blancs ont maintenant un mat forcé. }
43. Rf7 { Le meilleur coup, et le cadeau du pion e6 : la tour entre sur f7, case protégée par le pion. [%csl Gf7][%cal Ge6f7] }
43... Qe8 { Les Noirs sont sans défense. }
44. Qxh7+ { Le meilleur coup. La dame prend en h7 avec échec, et le mat suit. Polgar abandonne.

Bilan : pendant 28 coups, le pion e6 n'a pas avancé d'une seule case. Il a pourtant gagné la partie : il a retiré les cases d7 et f7 aux pièces noires, puis il a offert f7 à la tour blanche. }`,
    ),
    chapter(
      "Topalov – Kramnik (Linares 1998) : ...c4, un pion passé protégé dès l'ouverture",
      "r2qrnk1/1b3pp1/1p3b1p/pPpp4/N2P4/4PNP1/P3BP1P/2RQR1K1 b - - 2 17",
      `{ Un pion passé protégé peut naître dès l'ouverture, sans aucune prise : il suffit d'une avance de pion au bon moment.

Veselin Topalov – Vladimir Kramnik, Linares 1998, 2e ronde. Après 1.d4 Nf6 2.c4 e6 3.Nf3 d5 4.Nc3 Be7 5.Bg5 h6 6.Bh4 O-O 7.e3 b6 8.Be2 Bb7 9.Bxf6 Bxf6 10.cxd5 exd5 11.b4 c6 12.O-O a5 13.b5 c5 14.Re1 Re8 15.Rc1 Nd7 16.g3 Nf8 17.Na4, un Gambit dame refusé. Les Noirs sont mieux, environ -0,5.

Le cavalier blanc attaque b6 et presse le pion c5. Kramnik répond en avançant ce pion.

PRO TIP : avant de pousser un pion pour le rendre passé, vérifie deux choses. Peut-il être soutenu par un autre pion ? Et l'adversaire peut-il attaquer ce pion de soutien ? Ici, c4 est soutenu par d5, et d5 n'a en face que le pion e3, encore loin. }
17... c4 { Le meilleur coup. Le pion c4 est passé, car les Blancs n'ont plus de pion sur les colonnes b, c et d devant lui, et il est protégé par d5. [%csl Gc4,Gd5][%cal Gd5c4] }
18. Bf1 { Le meilleur coup. Le fou vise g2, d'où il pèsera sur d5, le pion qui soutient c4. [%cal Gf1g2] }
18... Qd6 { La dame se centralise. 18...Be7 était un peu plus précis, environ 0,2 pion. }
19. Bg2 { Un des meilleurs coups. Le fou se place sur la grande diagonale : dès que le cavalier f3 bougera, il frappera d5, la base du pion passé. [%cal Gg2d5] }
19... Rad8 { Un des meilleurs coups. La tour se place derrière la dame, sur la colonne d : la base de la chaîne doit tenir. [%cal Gd8d5] }
20. h4 { Un des meilleurs coups. Les Blancs, qui n'ont rien à l'aile dame, cherchent du jeu à l'aile roi. }
20... Ne6 { Le cavalier vise d4 et g5. 20...Qc7 était un peu plus précis, environ 0,2 pion. }
21. Nc3 { Un des meilleurs coups. Le cavalier revient bloquer : la case c3, devant le pion c4, est la case de blocage naturelle. [%csl Gc3] }
21... g6 { Un des meilleurs coups. Les Noirs prennent la case f5 au cavalier blanc. }
22. Nd2 { Le cavalier se dirige vers l'aile roi. 22.h5 était un peu plus précis, environ 0,2 pion. }
22... Ba8 { Le fou se place derrière d5, qu'il soutient. 22...Qc7 était un peu plus précis, environ 0,2 pion. }
23. h5 { Le meilleur coup. Le pion h fixe g6. }
23... g5 { Le meilleur coup. Les Noirs ferment l'aile roi.

Bilan : l'évaluation est proche de l'égalité, environ -0,1. Un pion passé protégé n'est pas un avantage immédiat : c'est un atout pour la fin de partie, qui grandit à chaque échange de pièces. }`,
    ),
    chapter(
      "Topalov – Kramnik (Linares 1998) : rendre la qualité pour libérer les pions",
      "2br2k1/4rp2/1p3q1p/pP1p1PpP/PbpPP1B1/2N2P2/2Q1R1K1/3R4 b - - 0 40",
      `{ La partie a continué 24.Nf1 Be7 25.g4 Qd7 26.Ng3 Ng7 27.a4 Bb4 28.Bh3 Bb7 29.Qc2 Bd6 30.Nf5 Nxf5 31.gxf5 Bb4 32.Kg2 Qd6 33.f3 Re7 34.Re2 Rde8 35.Rce1 Qf6 36.Bg4 Bd6 37.Qd1 Bb4 38.Qc2 Rd8 39.Rd1 Bc8 40.e4. Topalov a commis plusieurs fautes (25.g4, 29.Qc2, 39.Rd1) et ce dernier coup, 40.e4, en est une grosse : environ 1,3 pion. Les Noirs sont mieux, environ -3,5.

Les Blancs attaquent d5, la base du pion c4. Kramnik ne défend pas d5 : il rend une qualité pour que ses pions deviennent libres.

PRO TIP : un pion passé protégé vaut souvent plus qu'une qualité dans la finale. Si un sacrifice de tour contre une pièce mineure supprime le seul blocus, compte les coups jusqu'à la promotion avant de refuser par habitude. }
40... Bxc3 { Le meilleur coup. Le fou supprime le cavalier c3, le bloqueur de c4. [%cal Gb4c3] }
41. e5 { Le pion attaque la dame f6. 41.Qxc3 résistait peut-être un peu mieux, mais la position est déjà perdue. }
41... Rxe5 { Le seul bon coup, et le sacrifice de qualité. Les Noirs donnent la tour contre le pion e5 : 41...Rde8 donnait l'avantage aux Blancs, environ +2. [%cal Ge7e5] }
42. dxe5 { Le meilleur coup. Les Blancs prennent la tour. }
42... Bxe5 { Le seul coup. Le fou reprend. Les Noirs ont deux pions passés liés, c4 et d5, et plus aucune pièce blanche ne les bloque. [%csl Gc4,Gd5] }
43. Rde1 { Le meilleur coup. La tour attaque le fou e5. }
43... Bc7 { Le fou se met à l'abri. 43...Re8 gagnait plus simplement, mais les Noirs restent nettement mieux, environ -2,9. }
44. Re8+ { Le meilleur coup. Les Blancs échangent les tours. }
44... Kg7 { Le meilleur coup. 44...Kh7 aurait gâché presque tout l'avantage. }
45. Rxd8 { Le meilleur coup. Chaque échange de tours rapproche les pions noirs de la promotion. }
45... Bxd8 { Le meilleur coup. Le fou reprend ; 45...Qxd8 rendait presque tout l'avantage. }
46. Rd1 { Les Blancs attaquent d5. D'autres coups, comme 46.Qd2 ou 46.f4, résistaient mieux, mais la position est déjà perdue. [%cal Gd1d5] }
46... Bb7 { Le meilleur coup. Le fou défend d5. }
47. f4 { Les Blancs ouvrent la diagonale de leur fou. Un écart de plus, environ 1,7 pion : 47.Qe2 résistait mieux. }
47... d4+ { Le meilleur coup. Le pion avance avec un échec à la découverte du fou b7. Les deux pions liés sont en route. [%cal Gd4d3] }
48. Bf3 { Le fou bloque l'échec. 48.Kf1 était à peine meilleur. }
48... d3 { Le meilleur coup. Le pion attaque la dame et prépare ...d2. Topalov abandonne.

Bilan : 41...Rxe5 rendait une tour contre un pion et un cavalier, mais faisait de c4 et d5 deux pions liés que rien ne pouvait plus arrêter. [%csl Gc4,Gd3] }`,
    ),
    chapter(
      "Spassky – Petrosian (Moscou 1969) : ne pas offrir un pion passé protégé",
      "r1r3k1/3q1ppp/ppbb4/3p4/P2Pn3/1Q2PN2/1B2BPPP/R4RK1 b - - 3 20",
      `{ Boris Spassky – Tigran Petrosian, championnat du monde, Moscou 1969, 11e partie. Après 1.d4 Nf6 2.c4 e6 3.Nf3 b6 4.a3 Bb7 5.Nc3 d5 6.e3 Nbd7 7.cxd5 exd5 8.Be2 Bd6 9.b4 O-O 10.O-O a6 11.Qb3 Qe7 12.Rb1 Ne4 13.a4 Ndf6 14.b5 Nxc3 15.Qxc3 Ne4 16.Qc2 Rfc8 17.Bb2 c6 18.bxc6 Bxc6 19.Qb3 Qd7 20.Ra1, les Noirs sont un peu mieux, environ -1.

Les Blancs ont un pion a, les Noirs deux pions a et b. Il ne manque presque rien pour que le pion b devienne passé.

PRO TIP : avant de pousser un pion pour fixer une faiblesse adverse, demande-toi si tu ne crées pas un pion passé protégé chez l'adversaire. Un pion que tu dépasses ne peut plus jamais être attaqué par tes propres pions. }
20... b5 { Le meilleur coup. Les Noirs attaquent a4. [%cal Gb5a4] }
21. Ne5 { LE COUP QUE STOCKFISH PROPOSE. Le cavalier s'installe au centre et laisse les Noirs prendre en a4 : les pions a et b noirs restent alors faibles et isolés. [%csl Ge5] }
(21. a5 { La partie. Une faute, environ 0,65 pion selon trois sondes. Le pion a passe à côté de b5 : b5 devient un pion passé, protégé par a6, et aucun pion blanc ne pourra plus jamais l'attaquer. [%csl Rb5][%cal Ga6b5] }
21... b4 { Le meilleur coup. Le pion passé avance tout de suite, avant que les Blancs ne le bloquent. Petrosian a joué 21...Bb7, une faute selon la sonde (environ 1 pion). [%cal Gb4b3] }
22. Ne5 { Le meilleur coup. Le cavalier vient au centre pour freiner le pion. }
22... Bxe5 { Le meilleur coup. Les Noirs suppriment le cavalier. }
23. dxe5 { Le meilleur coup. Le pion reprend, mais d4 disparaît du centre. }
23... Bb5 { Le meilleur coup. Les Noirs échangent le bon fou blanc et gardent leur pion passé b4. Ils sont mieux, environ -1,6. })
21... Bxe5 { Le meilleur coup. Les Noirs échangent le cavalier. }
22. dxe5 { Le meilleur coup. Le pion reprend et gagne de l'espace. }
22... bxa4 { Le meilleur coup. Les Noirs prennent le pion a4, mais leur pion a ne sera pas protégé : aucun pion noir ne le soutient. }
23. Qd1 { Le meilleur coup. La dame attaque le pion a4. [%cal Gd1a4] }
23... Qb7 { Le meilleur coup. La dame prend la colonne b et vise le fou b2. }
24. Rb1 { Un des meilleurs coups. La tour vise la dame et la colonne b. }
24... Bb5 { Le meilleur coup. Les Noirs sont mieux, environ -1, mais aucun pion passé protégé.

Bilan : avec 21.a5, les Blancs fixaient a6 mais offraient aux Noirs un pion passé protégé. Avec 21.Ne5, ils gardaient des pions noirs isolés à attaquer. }`,
    ),
    chapter(
      "Spassky – Petrosian (Moscou 1969) : la qualité offerte en c4",
      "4r1k1/1b2q1pp/p2n4/Pp1p1p2/2rP1P1P/3QPBP1/3N1K2/R3R3 b - - 1 36",
      `{ La partie a continué 21.a5 Bb7 22.Ne5 Qd8 23.Rfd1 Qh4 24.g3 Qe7 25.f3 Ng5 26.h4 Ne6 27.f4 f6 28.Nf3 Nd8 29.Kf2 Nf7 30.Nd2 Rc4 31.Qd3 Re8 32.Bf3 Bb4 33.Ba3 Bxa3 34.Rxa3 Nd6 35.Re1 f5. Les Noirs sont mieux, environ -1,5.

La tour noire c4 est installée sur une case protégée par b5 et d5. Si les Blancs la prennent avec le cavalier, Petrosian reprendra avec le pion d5 : il aura alors deux pions passés liés, b5 et c4.

PRO TIP : une tour installée devant ton pion passé, sur une case protégée par un pion, est parfois un sacrifice de qualité préparé. Si l'adversaire la prend, ta reprise par un pion crée le pion passé protégé. }
36... Ne4+ { Le meilleur coup. Le cavalier saute en e4 avec échec. [%cal Gd6e4] }
37. Bxe4 { Le seul bon coup. Les Blancs doivent échanger ce cavalier. }
37... fxe4 { Le meilleur coup : 37...dxe4 aurait rendu la case d5 aux Blancs. Le pion e4 soutient maintenant d5. [%cal Ge4d5] }
38. Qb1 { Un des meilleurs coups. La dame quitte d3, attaquée par le pion e4. }
38... Rec8 { LE COUP QUE STOCKFISH PROPOSE. La seconde tour soutient la tour c4 : si le cavalier la prend, la colonne c reste aux Noirs. [%cal Gc8c4] }
(38... Qd7 { La partie. Une faute, environ 1,1 pion : la dame se déplace sans renforcer c4. }
39. Ra2 { Une faute en retour, environ 0,75 pion selon trois sondes : 39.Nxc4! dxc4 et les Noirs n'avaient pas le temps de soutenir leurs pions. }
39... Rec8 { Encore une faute, environ 0,7 pion selon trois sondes : 39...Ra4 était plus fort. }
40. Nxc4 { Le meilleur coup. Le cavalier prend la tour. }
40... dxc4 { Le meilleur coup. Les Noirs ont rendu la qualité, mais ils ont deux pions passés liés : c4, protégé par b5, et b5. Le chapitre suivant reprend ici. [%csl Gb5,Gc4] })
39. Nxc4 { Un des meilleurs coups. Les Blancs prennent la qualité. }
39... dxc4 { Le meilleur coup. Le pion d5 reprend : c4 est un pion passé protégé par b5. [%csl Gc4,Gb5] }
40. d5 { Un des meilleurs coups selon trois sondes. Les Blancs donnent leur pion d pour libérer leur jeu. }
40... Bxd5 { Le meilleur coup. Le fou prend le pion. }
41. Rd1 { Le meilleur coup. La tour attaque le fou. }
41... Bf7 { Le meilleur coup. Le fou s'abrite. }
42. Rd4 { Un des meilleurs coups selon trois sondes. La tour attaque c4 et e4. Les Noirs restent mieux, environ -1,7.

Bilan : la tour c4 n'était pas en prise par hasard. En reprenant avec un pion, les Noirs changent une qualité contre un pion passé protégé. }`,
    ),
    chapter(
      "Spassky – Petrosian (Moscou 1969) : deux pions liés, et la faute qui les libère",
      "2r3k1/1b1q2pp/p7/Pp6/2pPpP1P/4P1P1/R4K2/1Q2R3 w - - 0 41",
      `{ Après 38...Qd7 39.Ra2 Rec8 40.Nxc4 dxc4, les Noirs ont rendu la qualité. Ils ont deux pions passés liés, b5 et c4. Les Noirs sont mieux, environ -0,8.

Les Blancs ont une tour de plus. Ils doivent bloquer les pions avant qu'ils n'avancent. Le bon blocage se fait avec les pièces, sur les cases devant les pions, et non avec des contre-attaques.

PRO TIP : contre deux pions passés liés, bloque celui de devant. Une pièce qui bloque fixe aussi l'autre pion : il ne peut avancer seul sans être pris. }
41. Rc2 { LE COUP QUE STOCKFISH PROPOSE. La tour se place devant le pion c4 et le bloque. [%csl Gc3][%cal Gc2c4] }
(41. d5 { La partie, et la faute décisive : environ 2,5 pions. Les Blancs donnent leur pion d pour ouvrir le jeu, mais le fou noir s'installe en d5. }
41... Bxd5 { Le meilleur coup. Le fou prend et soutient c4. [%csl Gd5] }
42. Rd1 { Les Blancs attaquent le fou. 42.Rc2 bloquait mieux, mais la position est déjà perdue. }
42... c3 { Le meilleur coup. Le pion avance, soutenu par la tour c8. Le chapitre suivant reprend un peu plus loin. [%cal Gc3c2] })
41... Qd6 { Un des meilleurs coups, au niveau de 41...Bd5. La dame noire se centralise et surveille b4 et la diagonale du roi blanc. }
42. Qb2 { Le meilleur coup. La dame prend la diagonale et la colonne b : elle garde b4 et vise le roi noir. }
42... b4 { Un des meilleurs coups. Le pion b avance, soutenu par la dame d6. [%cal Gb5b4] }
43. Rb1 { Un des meilleurs coups. La seconde tour vient se placer devant le pion b. [%cal Gb1b4] }
43... b3 { Le meilleur coup. Le pion avance encore : il est maintenant protégé par c4. [%csl Gb3][%cal Gc4b3] }
44. Qc1 { Le meilleur coup. La dame recule pour garder les cases de promotion. }
44... Qe6 { Le meilleur coup. La dame noire se replace pour soutenir ses pions par la diagonale. }
45. Rc3 { Un des meilleurs coups. La tour se pose en c3, devant le pion c4, et attaque b3. Les Noirs restent mieux, environ -0,6 : leurs pions sont bloqués, mais ils restent dangereux. [%csl Gc3][%cal Gc3b3]

Bilan : avec 41.Rc2, la tour blanche bloquait les pions. Avec 41.d5, Spassky donnait le pion et la case d5 aux Noirs. }`,
    ),
    chapter(
      "Spassky – Petrosian (Moscou 1969) : la marche des pions",
      "2r3k1/6pp/p7/Pp1b4/4pP1P/2p1q1P1/2R4K/1Q4R1 w - - 0 47",
      `{ La partie a continué 41.d5 Bxd5 42.Rd1 c3 43.Rc2 Qh3 44.Rg1 Qg4 45.Kg2 Qf3+ 46.Kh2 Qxe3. Les Noirs sont mieux, environ -6.

Les pions noirs b5, c3 et e4 sont soutenus par le fou d5, la tour c8 et la dame. Les Blancs vont tenter une attaque contre le roi noir. Il est trop tard.

PRO TIP : dans une position gagnée avec des pions passés, ne te laisse pas distraire par les échecs de l'adversaire. Chaque coup de pion compte : il rapproche la promotion et oblige l'adversaire à donner du matériel. }
47. f5 { Les Blancs lancent leur pion f vers le roi noir. 47.Rd1 résistait un peu mieux, mais la position est perdue. }
47... Qc5 { Le meilleur coup. La dame soutient c3 et surveille la diagonale. [%cal Gc5c3] }
48. Rf1 { La tour soutient le pion f. 48.Qc1 tenait mieux, mais la position est perdue. }
48... b4 { Le meilleur coup. Le second pion avance. [%cal Gb4b3] }
49. f6 { Les Blancs menacent fxg7. 49.Qd1 tenait un peu mieux. }
49... b3 { Le meilleur coup. Les Noirs ignorent la menace et poussent. [%cal Gb3b2] }
50. Rcf2 { La tour vient soutenir le pion f. 50.f7+ était un peu plus tenace. }
50... c2 { Un des meilleurs coups. Le pion attaque la dame b1. [%cal Gc2b1] }
51. Qc1 { Le meilleur coup. La dame bloque le pion c. }
51... e3 { Le meilleur coup. Un troisième pion passé avance. }
52. f7+ { Le meilleur coup. Échec. }
52... Kf8 { Le meilleur coup. Le roi se place devant le pion f7, qui lui sert d'abri. }
53. Rf5 { Un des meilleurs coups. La tour attaque la dame. }
53... b2 { Le meilleur coup. Les Noirs ignorent la menace sur la dame : les deux pions sont sur la 2e rangée. [%csl Gb2,Gc2] }
54. Qxb2 { Le meilleur coup. La dame prend un pion. }
54... c1=Q { L'autre pion devient dame. Les Noirs gagnent.

Bilan : les pions liés b et c ont avancé ensemble, chacun protégeant l'autre, jusqu'à la 2e rangée. Petrosian n'a pas pris le temps de défendre son roi : les pions étaient plus rapides que l'attaque blanche. }`,
    ),
    chapter(
      "Carlsen – Aronian (GRENKE 2019) : 15.Bd5, créer le pion d5",
      "rnr3k1/ppq2ppp/5n2/4p3/2B1P1b1/1NP2P2/P2BQ1PP/R4RK1 w - - 1 15",
      `{ Magnus Carlsen – Levon Aronian, GRENKE Chess Classic 2019, 7e ronde. Après 1.d4 Nf6 2.c4 e6 3.Nf3 d5 4.Nc3 dxc4 5.e4 Bb4 6.Bg5 c5 7.Bxc4 cxd4 8.Nxd4 Bxc3+ 9.bxc3 Qa5 10.Bd2 O-O 11.Qe2 e5 12.Nb3 Qc7 13.O-O Bg4 14.f3 Rc8, les Blancs ont environ +0,3.

La position est ouverte et presque symétrique. Carlsen va créer un pion passé protégé en échangeant son fou.

PRO TIP : un échange de pièces peut changer la structure de pions. Quand ton pion reprend sur une case avancée, demande-toi s'il devient passé, et si un autre pion peut venir le soutenir. }
15. Bd5 { Le meilleur coup. Le fou s'offre à l'échange en d5. [%csl Gd5] }
15... Nxd5 { Le meilleur coup. Les Noirs prennent : 15...Bd7 laissait le fou dominer. }
16. exd5 { Le seul bon coup. Le pion e4 reprend en d5 : il est passé, car les Noirs n'ont plus de pion c ni d, et le pion e5 est sur la même rangée. [%csl Gd5] }
16... Bh5 { Le meilleur coup. Le fou noir se replie vers g6, sur la diagonale b1-h7. }
17. c4 { Le meilleur coup. Le pion c3 avance en c4 : d5 est maintenant protégé. [%csl Gd5,Gc4][%cal Gc4d5] }
17... Nd7 { Le meilleur coup. Le cavalier vise c5, juste à côté de d6, la case de blocage devant le pion. [%cal Gd7c5] }
18. Rfc1 { Un des meilleurs coups. La tour se place sur la colonne c. }
18... b6 { Un des meilleurs coups. Les Noirs donnent la case c5 à leur cavalier. }
19. a4 { Le meilleur coup. Le pion a gagne de l'espace et vise a5. }
19... a5 { Les Noirs bloquent l'aile dame. 19...Qd6 était un peu plus précis, environ 0,2 pion. }
20. Qf2 { Un des meilleurs coups. La dame vise b6 et c5. }
20... Qd6 { Le meilleur coup. La dame se met devant le pion d5 : c'est le bloqueur. [%csl Gd6] }
21. Be3 { Le meilleur coup. Le fou contrôle c5 et d4. Les Blancs ont environ +0,3.

Bilan : 15.Bd5 et 17.c4 ont donné aux Blancs un pion passé protégé. Pour l'instant, l'avantage est petit : les Noirs bloquent bien le pion. }`,
    ),
    chapter(
      "Carlsen – Aronian (GRENKE 2019) : la faute qui libère le pion",
      "3r2k1/2r3pp/1p1q1pb1/p1nPp3/P1P5/Q1R1BP2/3N2PP/R5K1 b - - 7 26",
      `{ La partie a continué 21...Bg6 22.Qd2 f6 23.Qb2 Rc7 24.Nd2 Nc5 25.Qa3 Rd8 26.Rc3. Les Blancs ont environ +0,5.

Les pièces noires bloquent le pion d5 : la dame d6, le cavalier c5. Tant qu'elles restent là, le pion ne bouge pas. Mais les Noirs vont chercher à jouer sur l'aile roi.

PRO TIP : quand tu bloques un pion passé protégé, ne crée pas d'autres faiblesses. Chaque pion que tu avances ailleurs peut ouvrir une ligne pour les pièces adverses, et ton blocus s'effondre. }
26... Rb7 { LE COUP QUE STOCKFISH PROPOSE. La tour garde b6 et reste prête à défendre. Les Noirs gardent leur blocus. }
(26... f5 { La partie. Une faute, environ 1,1 pion selon trois sondes : les Noirs ouvrent l'aile roi, et le fou e3 trouve de nouvelles cibles. }
27. Re1 { Un des meilleurs coups. La tour vise e5. 27.Bxc5 était un peu plus précis. }
27... e4 { Une seconde faute, environ 0,8 pion selon trois sondes : le pion e5 avance et sera échangé, ce qui ouvre la colonne e aux tours blanches. 27...Be8 tenait. }
28. fxe4 { Le meilleur coup. Les Blancs ouvrent la colonne f. }
28... fxe4 { Le meilleur coup. Le pion reprend, mais il est isolé en e4. }
29. Bxc5 { Le meilleur coup. Le fou supprime le cavalier c5, un des défenseurs du blocus. }
29... Rxc5 { Le meilleur coup. La tour reprend. }
30. Nxe4 { Le meilleur coup. Les Blancs ont environ +2,4 : le pion e4 est tombé, et le pion d5 n'a plus qu'une dame devant lui. Le chapitre suivant reprend un peu plus loin. })
27. Nb3 { Le meilleur coup. Le cavalier attaque c5. }
27... Na6 { Le meilleur coup. Le cavalier se replie. }
28. Qxd6 { Le meilleur coup. Les dames s'échangent. }
28... Rxd6 { Le meilleur coup. La tour reprend en d6 et bloque le pion. [%csl Gd6] }
29. Nd2 { Le meilleur coup. Le cavalier se dirige vers e4 ou b3. }
29... Rd8 { Le meilleur coup. La tour reste sur la colonne d, face au pion. }
30. Kf2 { Le meilleur coup. Le roi se rapproche du centre. Les Blancs ont environ +0,5.

Bilan : avec 26...Rb7, les Noirs gardaient leur blocus. Avec 26...f5 et 27...e4, ils échangeaient leurs propres pions et perdaient leur meilleur bloqueur. }`,
    ),
    chapter(
      "Carlsen – Aronian (GRENKE 2019) : le pion passé pèse jusqu'au bout",
      "2rr2k1/2q3pp/1p4b1/p2P4/P1P1N3/Q3R2P/6P1/4R1K1 w - - 1 33",
      `{ La partie a continué 30...Qe5 31.Rce3 Rcc8 32.h3 Qc7. Ce dernier coup est une faute (environ 0,9 pion selon trois sondes) : 32...Qd4 tenait la diagonale. Les Blancs ont environ +3,1.

Le pion d5 n'a plus de bloqueur fixe. Les tours blanches tiennent la colonne e, et chaque échange de tours rapproche le pion de la promotion.

PRO TIP : avec un pion passé protégé, chaque échange de pièces t'aide. Moins il reste de pièces adverses, moins il y en a pour bloquer ton pion. }
33. Nd2 { Le meilleur coup. Le cavalier évite l'échange et se prépare à revenir. }
33... Re8 { Le meilleur coup. Les Noirs disputent la colonne e. }
34. Re7 { Le meilleur coup. La tour entre en e7. [%csl Ge7] }
34... Rxe7 { Les Noirs échangent. 34...Qf4 était plus tenace, mais la position est déjà perdue. }
35. Rxe7 { Le meilleur coup. La tour reprend sur la 7e rangée. }
35... Qd8 { La dame attaque la tour e7. Un écart de plus : 35...Qf4 tenait mieux. }
36. Qe3 { Les Blancs gagnent facilement. 36.d6! était encore plus fort : le pion avance immédiatement avec l'aide de la tour e7. [%cal Gd5d6] }
36... Rc7 { Les Noirs offrent l'échange des tours. 36...Qd6 était un peu plus tenace. }
37. Re6 { Le meilleur coup. La tour reste active et soutient d6. [%cal Ge6d6] }
37... Rc5 { La tour attaque d5. 37...Rb7 était un peu meilleur. }
38. Qb3 { La dame protège c4, le soutien du pion d5. 38.Qe5 était à peine meilleur. Aronian abandonne.

Bilan : les Blancs ne sont pas encore à une case de la promotion, mais le pion d5, protégé par c4, ne peut pas être pris, et les pièces noires n'ont plus rien à faire. [%csl Gd5,Gc4] }`,
    ),
  ],
};
