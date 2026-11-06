import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « Le fou contre trois pions » (positional_mastery, module 27) —
 * format « un commentaire par coup ».
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, entièrement
 * réécrite ici) : scores PGN des archives de joueurs de pgnmentor.com,
 * rejoués avec chess.js. Les parties ont été choisies par un script qui
 * repère, dans ces archives, les parties classiques gagnées où un camp garde
 * longtemps un fou de plus contre trois ou quatre pions, les autres pièces
 * étant égales : Capablanca – Czerniak (olympiade de Buenos Aires 1939,
 * finale A, 3e ronde), le fou gagné contre trois pions après la combinaison
 * ratée 13...Bxb4 ; Tarrasch – Tchigorine (Ostende 1907, 4e ronde), le fou
 * contre quatre pions puis trois, gagné en finale de tours ; Petrosian –
 * Benko (Piatigorsky Cup, Los Angeles 1963, 3e ronde), le cavalier puis le
 * fou contre trois pions ; Karpov – Timman (mémorial Euwe, Amsterdam 1988),
 * tour et trois pions liés contre tour et fou. L'ancienne leçon du thème
 * (« Fischer – Spassky, Reykjavik 1972, partie 1 », couleurs inversées : les
 * Blancs étaient Spassky) traitait un fou contre DEUX pions ; elle n'a pas
 * été reprise.
 *
 * Plan : l'initiative avant tout (1), le camp des pions met son roi à l'abri
 * (2), la pièce de plus décide (3) ; le fou contre quatre pions (4), échanger
 * les dames (5), bloquer les pions puis échanger les tours (6), le filet de
 * mat (7) ; le cavalier contre trois pions (8), rendre la qualité pour des
 * pions liés (9), la pièce de plus attaque (10) ; trois pions liés contre le
 * fou (11), les pions avancent ensemble (12), la faute qui libère les pions
 * (13).
 *
 * Toutes les lignes ont été rejouées avec chess.js et chaque coup sondé avec
 * Stockfish 19 (binaire Linux local, profondeur 18, 3 candidats par coup),
 * suites du moteur comprises. Règle appliquée : quand un coup perd environ
 * 0,5 pion ou plus par rapport au choix du moteur, la LIGNE PRINCIPALE suit
 * le moteur et le coup de la partie passe en variante, signalée comme
 * fautive. Exception : dans une position déjà décisive (plus de 3 pions
 * environ), un écart est seulement signalé dans le commentaire. Les coups
 * proches du seuil ont été resondés trois fois avec un moteur neuf et
 * tranchés sur la moyenne : 19...Nxd4 (0,76), 20.Nxd4 (1,5) et 21...Nd5
 * (0,7) en 1939, 25.Qd2 (1,05), 28...Qg5+ (0,53) et 30...gxh5 (0,47 puis
 * 0,64) en 1963, 60...Rc7 (0,8 puis 0,62) en 1988 sont des fautes ;
 * 23.Kh2 (0,25) en 1939, 27...Nxf4 (0,4), 32.Rac1 (0,4), 33...Qc3 (0,2) et
 * 50...Rc6 (0,4) en 1907, 18...c5 (0,47) et 25...Bd5 (0,34) en 1963 ne sont
 * que des imprécisions. Les évaluations citées sont du point de vue des
 * Blancs. Aucun résultat de partie dans les variantes :
 * le parseur s'y arrêterait.
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

export const LE_FOU_CONTRE_TROIS_PIONS: CourseTree = {
  chapters: [
    chapter(
      "Capablanca – Czerniak (Buenos Aires 1939) : l'initiative avant tout",
      "4k2r/pp3ppp/2n1pn2/1N6/1q1r2P1/5N1P/2Q1BP2/5RK1 w k - 0 19",
      `{ Un fou vaut à peu près trois pions. Mais ce n'est qu'une moyenne : trois pions liés et avancés battent souvent un fou, et trois pions dispersés qui n'ont pas bougé tombent souvent un par un. Le camp du fou doit agir AVANT que les pions ne deviennent dangereux.

José Raúl Capablanca – Moshe Czerniak, olympiade de Buenos Aires 1939, finale A, 3e ronde. Après 1.e4 c6 2.d4 d5 3.exd5 cxd5 4.c4 Nc6 5.Nf3 Bg4 6.cxd5 Qxd5 7.Be2 e6 8.O-O Nf6 9.Nc3 Qa5 10.h3 Bh5 11.a3 Rd8 12.g4 Bg6 13.b4 Bxb4 14.axb4 Qxa1 15.Qb3 Rxd4 16.Ba3 Bc2 17.Qxc2 Qxa3 18.Nb5 Qxb4, la partie a connu trois fautes : 13...Bxb4 (environ 2,8 pions), 17.Qxc2 (17.Rxa1 était meilleur d'environ 2 pions) et 18...Qxb4 (18...Rxg4+ tenait l'équilibre). Les Blancs ont environ +1,6.

Après les échanges en d4, il restera aux Blancs un fou contre trois pions. Le roi noir est encore en e8.

PRO TIP : avec une pièce contre des pions, cherche d'abord l'initiative. Un roi adverse coincé au centre vaut souvent plus qu'un pion. }
19. Nfxd4 { Le meilleur coup. Le cavalier prend la tour d4. [%csl Gd4] }
19... O-O { LE COUP QUE STOCKFISH PROPOSE. Le roi se met à l'abri tout de suite, même si cela coûte un pion. }
(19... Nxd4 { La partie. Une faute, environ 0,75 pion selon trois sondes : le cavalier reprend, mais le roi noir reste au centre. }
20. Qc8+ { LE COUP QUE STOCKFISH PROPOSE. Avant de reprendre en d4, la dame donne échec : le roi noir ne pourra plus roquer. [%cal Gc2c8] }
(20. Nxd4 { La partie. Une faute, environ 1,5 pion selon trois sondes : les Blancs reprennent tout de suite, et le roi noir a le temps de roquer. }
20... O-O { Le meilleur coup. Le roi noir est en sécurité. La suite fait l'objet du chapitre suivant. })
20... Ke7 { Le seul coup. Le roi reste au centre. }
21. Qc7+ { Le meilleur coup. Un deuxième échec, sur la 7e rangée. }
21... Nd7 { Le seul bon coup : un déplacement du roi coûtait la partie. Le cavalier f6 s'interpose. }
22. Nxd4 { Le meilleur coup. Maintenant seulement, le cavalier b5 reprend en d4. Le roi noir est bloqué en e7, et les Blancs ont environ +3,5. [%csl Ge7] })
20. Nxc6 { Le meilleur coup. Le cavalier d4 prend le cavalier c6. }
20... bxc6 { Le seul bon coup. }
21. Qxc6 { Le meilleur coup. La dame prend c6 : il ne reste aux Noirs que deux pions pour le fou. }
21... Nd5 { Un des meilleurs coups, au niveau de 21...h5. Le cavalier se centralise. }
22. Rc1 { Un des meilleurs coups, au niveau de 22.Rd1. La tour prend la colonne c. }
22... h5 { Le meilleur coup. Le pion attaque g4. }
23. Rc4 { Le meilleur coup. La tour attaque la dame b4. [%cal Gc4b4] }
23... Qe1+ { Un des meilleurs coups, au niveau de 23...Qb2. La dame s'échappe avec échec. Les Blancs ont environ +2,5.

Bilan : avec une pièce contre des pions, le roi compte plus que les pions. 19...O-O rendait un pion pour mettre le roi à l'abri ; avec 19...Nxd4, les Noirs gardaient leurs pions, mais 20.Qc8+ bloquait leur roi au centre. }`,
    ),
    chapter(
      "Capablanca – Czerniak (Buenos Aires 1939) : le camp des pions met son roi à l'abri",
      "5rk1/pp3ppp/4pn2/8/1q1N2P1/7P/2Q1BP2/5RK1 w - - 1 21",
      `{ La partie a continué 19...Nxd4 20.Nxd4 O-O : chaque camp a commis une faute, et les Blancs ont environ +1,1.

Fais le compte des pions : les Blancs n'ont que f2, g4 et h3, tous à l'aile roi. Les pions noirs a7 et b7 n'ont donc aucun pion blanc devant eux : ce sont deux pions passés liés. Ils sont encore loin de la promotion, mais chaque échange les rendra plus forts.

PRO TIP : quand ton roi est en sécurité, le temps joue pour tes pions. Ne te presse pas : prends d'abord les cases importantes, puis avance les pions ensemble. }
21. Rd1 { Un des meilleurs coups, au niveau de 21.Nf3. La tour prend la colonne d et soutient le cavalier d4. }
21... h6 { LE COUP QUE STOCKFISH PROPOSE. Un coup calme : le pion donne une case de fuite au roi, à l'abri des échecs sur la 8e rangée. [%csl Gh7] }
(21... Nd5 { La partie. Une faute, environ 0,7 pion selon trois sondes : le cavalier se centralise, mais le fou va le chasser. }
22. Bf3 { Le meilleur coup. Le fou attaque le cavalier d5. [%cal Gf3d5] }
22... Nf4 { Le meilleur coup. Le cavalier saute en f4, près du roi blanc. }
23. Kh2 { Une imprécision, environ 0,25 pion selon trois sondes : 23.h4 était plus précis. }
23... e5 { Une faute grave, environ 2,3 pions : le pion chasse le cavalier d4, qui ira en f5 près du roi noir. 23...Qe7 tenait. Les Blancs ont environ +3,6 : la position est décidée. })
22. Nf3 { Un des meilleurs coups. Le cavalier recule pour garder l'aile roi. }
22... Qe7 { Un des meilleurs coups. La dame revient près du roi. }
23. Qb2 { Un des meilleurs coups, au niveau de 23.Qa4. La dame vise le pion b7. [%cal Gb2b7] }
23... a5 { Un des meilleurs coups. Le pion a avance : les pions passés a et b se mettent en marche. [%cal Ga5a1] }
24. Rd4 { Un des meilleurs coups. La tour se place sur la 4e rangée pour freiner les pions. [%csl Ga4,Gb4] }
24... Nd5 { Un des meilleurs coups. Le cavalier se centralise. }
25. h4 { Un des meilleurs coups. Les Blancs gagnent de l'espace à l'aile roi. }
25... Ra8 { Un des meilleurs coups. La tour se place derrière le pion a. [%cal Ga8a5] }
26. Qa1 { Un des meilleurs coups. La dame se place devant le pion a, de loin. Les Blancs ont environ +0,9.

Bilan : une fois le roi à l'abri, les Noirs poussent leurs pions passés, et l'avantage du fou fond peu à peu. }`,
    ),
    chapter(
      "Capablanca – Czerniak (Buenos Aires 1939) : la pièce de plus décide",
      "5rk1/pp3p1p/4n1p1/3Np3/6P1/3R1B1P/2Q2P1K/q7 w - - 10 30",
      `{ La partie a continué 21...Nd5 22.Bf3 Nf4 23.Kh2 e5 24.Nf5 g6 25.Ne3 Ne6 26.Nd5 Qa3 27.Rd3 Qa1 28.Rd1 Qa3 29.Rd3 Qa1. Après la faute 23...e5, les Blancs ont environ +4.

Regarde les pions noirs : a7 et b7 n'ont pas bougé, e5 est bloqué. Pendant ce temps, le cavalier d5 domine le centre, et le fou f3 soutient tout.

PRO TIP : des pions qui n'avancent pas ne valent pas une pièce. Si le camp des pions ne peut pas les pousser, la pièce de plus finit par attaquer. }
30. Qd2 { Le meilleur coup. La dame se rapproche du centre. }
30... Kg7 { Le meilleur coup. Le roi se rapproche des cases f6 et h6. }
31. Qe2 { Un écart sans conséquence : 31.Qe3 était meilleur d'environ 1 pion, mais les Blancs restent largement mieux. }
31... f6 { Le meilleur coup. Le pion protège e5. }
32. Qe3 { Le meilleur coup. La dame vise le pion a7. [%cal Ge3a7] }
32... a6 { Une faute de plus, environ 1,9 pion : 32...Qa6 défendait mieux. Les Blancs ont environ +5. }
33. Rd1 { La tour chasse la dame a1. 33.Qb6 était plus fort, environ 1,6 pion d'écart, mais la position reste gagnante. [%cal Gd1a1] }
33... Qb2 { Le meilleur coup. }
34. Nc3 { Un des meilleurs coups : 34.h4 était un peu plus précis, mais rien ne change. Le cavalier recule en c3, d'où il contrôle b1, d1 et e4. }
34... Nd4 { Le cavalier attaque le fou f3. Une faute dans une position perdue, environ 2 pions : 34...Qb4 tenait plus longtemps. }
35. Rb1 { Le meilleur coup. La tour chasse la dame b2. [%cal Gb1b2] }
35... Qc2 { La dame cherche une case. 35...Nxf3+ tenait plus longtemps. Les Blancs ont environ +9. }
36. Be4 { Le meilleur coup. Le fou attaque la dame c2. Czerniak abandonne.

Bilan : les pions noirs n'ont jamais avancé, et le fou f3 a fini par décider. Un fou contre trois pions immobiles, c'est souvent une pièce de plus. [%cal Ge4c2] }`,
    ),
    chapter(
      "Tarrasch – Tchigorine (Ostende 1907) : le fou contre quatre pions",
      "3r1r1k/pp4pp/2pb4/3n1pq1/3B4/P5P1/1PB2P1P/R2QR2K w - - 7 27",
      `{ Siegbert Tarrasch – Mikhaïl Tchigorine, Ostende 1907, 4e ronde. Après 1.d4 d5 2.Nf3 c6 3.e3 Bg4 4.c4 e6 5.Nc3 Nd7 6.Bd3 Ngf6 7.O-O Bd6 8.cxd5 exd5 9.e4 dxe4 10.Nxe4 Nxe4 11.Bxe4 O-O 12.Qc2 f5 13.Qb3+ Kh8 14.Bc2 Bxf3 15.Qxf3 Qh4 16.g3 Qxd4 17.Rd1 Qc5 18.Qe2 Nf6 19.Be3 Qe5 20.Qd3 Nd5 21.Bd4 Qe7 22.Re1 Qg5 23.a3 Rad8 24.Kh1 Qh6 25.Qf3 Qd2 26.Qd1 Qg5, les Blancs ont la paire de fous, les Noirs un pion de plus. La position est à peu près égale.

Tchigorine va donner son cavalier contre des pions, et les Blancs vont se retrouver avec un fou contre QUATRE pions.

PRO TIP : avant de donner une pièce contre des pions, compte les pions, mais regarde surtout s'ils seront liés et capables d'avancer. }
27. f4 { Un des meilleurs coups. Le pion chasse la dame g5. }
27... Nxf4 { Le cavalier prend le pion f4 : Tchigorine accepte de donner une pièce contre plusieurs pions. Une imprécision, environ 0,4 pion selon trois sondes : 27...Qg6 ou 27...Qh6 étaient plus sûrs. }
28. Be3 { Le meilleur coup. Le fou cloue le cavalier f4 devant la dame g5. 28.gxf4 tout de suite coûtait environ 1,3 pion. [%cal Ge3g5] }
28... Qf6 { Un des meilleurs coups, au niveau de 28...Qh6. La dame sort du clouage. }
29. gxf4 { Le meilleur coup. Les Blancs prennent le cavalier. }
29... Bxf4 { Le meilleur coup. Le fou reprend un pion et attaque le fou e3. }
30. Qf3 { Un des meilleurs coups, au niveau de 30.Bxf4. La dame protège le fou e3 et le roi. }
30... Bxe3 { Le meilleur coup. Les Noirs échangent les fous. }
31. Qxe3 { Le seul bon coup : 31.Qxf5 perdait, environ -5. }
31... Qxb2 { Le meilleur coup. La dame prend un pion de plus. Les Blancs ont un fou contre quatre pions : les Noirs ont six pions (a7, b7, c6, f5, g7, h7), les Blancs deux (a3, h2). Évaluation : environ +0,4. }
32. Rac1 { La tour protège le fou c2. Une imprécision, environ 0,4 pion selon trois sondes : 32.Rad1, pour prendre la colonne d, était plus précis.

Bilan : quatre pions pour un fou, et pourtant la position est à peu près égale. Les pions noirs ne sont pas encore avancés, et les pièces blanches sont actives. }`,
    ),
    chapter(
      "Tarrasch – Tchigorine (Ostende 1907) : échanger les dames",
      "3r1r1k/pp4pp/2p5/5p2/8/P3Q3/1qB4P/2R1R2K b - - 1 32",
      `{ Les Blancs ont un fou contre quatre pions, et la position est à peu près égale. Mais les pions noirs sont un peu partout : b7 et a7 à l'aile dame, c6 au centre, f5, g7 et h7 à l'aile roi.

Les pièces blanches vont s'en prendre aux pions isolés. Chaque pion pris réduit l'écart.

PRO TIP : contre des pions séparés, attaque-les avec tes pièces lourdes. Un pion que seule une pièce peut défendre attache cette pièce. }
32... a6 { Un des meilleurs coups. Le pion quitte a7. }
33. Qe7 { Le meilleur coup. La dame entre sur la 7e rangée et attaque b7 et g7. [%cal Ge7b7,Ge7g7] }
33... Qc3 { La dame attaque la tour e1. 33...Rb8 était un peu plus simple, environ 0,25 pion selon trois sondes. [%cal Gc3e1] }
34. Re3 { Le meilleur coup. La tour quitte e1 et attaque la dame c3. }
34... Qc4 { Le meilleur coup. }
35. Rg1 { La tour vise g7. 35.Rce1 était un peu plus précis. [%cal Gg1g7] }
35... Qd5+ { Un des meilleurs coups, au niveau de 35...Qf7. Échec sur la grande diagonale. }
36. Rg2 { Le meilleur coup. }
36... Qf7 { Le meilleur coup. La dame propose l'échange. }
37. Bb3 { Un des meilleurs coups. Le fou attaque la dame f7. [%cal Gb3f7] }
37... Qxe7 { Le meilleur coup. Les dames s'échangent. }
38. Rxe7 { Le seul bon coup. La tour reprend et arrive sur la 7e rangée. }
38... g6 { Le meilleur coup. Le pion protège f5 et libère la case g7 pour le roi. }
39. Rxb7 { Le meilleur coup. La tour prend b7 : il ne reste que trois pions pour le fou. }
39... Rb8 { Le meilleur coup. La tour propose l'échange. }
40. Rxb8 { Le meilleur coup. }
40... Rxb8 { Le seul bon coup. Les Blancs ont tour, fou et deux pions (a3, h2) contre tour et cinq pions (a6, c6, f5, g6, h7). Environ +0,3.

Bilan : les Blancs ont repris un pion et simplifié. Un fou contre trois pions séparés, c'est un peu mieux pour le fou, mais encore loin du gain. }`,
    ),
    chapter(
      "Tarrasch – Tchigorine (Ostende 1907) : bloquer les pions, puis échanger les tours",
      "8/7p/1r3kp1/p1p2p2/7P/PB1R1K2/8/8 w - - 5 48",
      `{ La partie a continué 41.Rg3 c5 42.Rd3 a5 43.Kg2 Kg7 44.Kf3 Kf6 45.h4 Rb6 46.Bc2 Ke5 47.Bb3 Kf6. La position est à peu près égale.

Les pions noirs sont en deux groupes : a5 et c5 à l'aile dame, f5, g6 et h7 à l'aile roi. Le fou blanc va bloquer l'un, le roi blanc l'autre.

PRO TIP : un fou bloque très bien un pion qui se trouve sur une case de sa couleur. Place-le devant le pion, sur la case où il doit passer. }
48. Bc4 { Un des meilleurs coups, au niveau de 48.Rc3. Le fou se place devant le pion c5 et le bloque. [%csl Gc4] }
48... h6 { Un des meilleurs coups. Le pion protège la case g5. }
49. Ke3 { Le meilleur coup. Le roi se rapproche du centre. }
49... g5 { Un des meilleurs coups, au niveau de 49...Ke7. Le pion g attaque h4. }
50. h5 { Le meilleur coup. Le pion évite l'échange et fixe le pion h6. }
50... Rc6 { La tour passe en c6, derrière le pion c5. Une imprécision, environ 0,4 pion selon trois sondes : 50...Ke7 était plus précis. }
51. Rd7 { Un des meilleurs coups, au niveau de 51.Rd8. La tour entre sur la 7e rangée. }
51... Ke5 { LE COUP QUE STOCKFISH PROPOSE. Le roi s'active au centre. }
(51... Rb6 { La partie. Une faute, environ 2 pions : la tour quitte c6 et laisse le pion c5 sans défense. }
52. Rh7 { Un des meilleurs coups. La tour attaque le pion h6. }
52... Ke5 { Le meilleur coup. Le roi s'active. }
53. Re7+ { Le meilleur coup. Les Blancs ont environ +3,3 : la position est décidée. La suite fait l'objet du chapitre suivant. })
52. a4 { Un des meilleurs coups, au niveau de 52.Rd5+. Le pion bloque le pion a5. }
52... f4+ { Le meilleur coup. Les Noirs avancent avec échec : f4 et g5 sont deux pions passés liés. }
53. Kf3 { Un des meilleurs coups. Le roi se place devant les pions. [%csl Gf3] }
53... Rd6 { Le meilleur coup. Les Noirs proposent l'échange des tours. }
54. Rxd6 { Le meilleur coup. }
54... Kxd6 { Le seul coup. Il reste un fou contre trois pions, sans tours. Environ +0,3 : le roi blanc bloque f4 et g5, le fou bloque c5. Les Noirs tiennent.

Bilan : contre un fou bien placé, des pions bloqués ne passent pas. Mais le camp des pions doit rester précis : une seule faute, 51...Rb6, et le pion c5 tombait. }`,
    ),
    chapter(
      "Tarrasch – Tchigorine (Ostende 1907) : le filet de mat",
      "8/4R3/1r1k3p/p1p2ppP/2B5/P3K3/8/8 w - - 7 54",
      `{ Dans la partie, Tchigorine a joué 51...Rb6, puis 52.Rh7 Ke5 53.Re7+ Kd6. Les Blancs ont environ +5.

Le roi noir est loin de son aile roi, et la tour blanche est sur la 7e rangée. Avec le fou et le roi, elle va construire un filet de mat.

PRO TIP : le camp du fou a une pièce de plus pour attaquer. Quand le roi adverse s'éloigne de ses pions, regarde s'il n'y a pas un mat à construire. }
54. Re6+ { Le meilleur coup. Échec, et la tour attaque le pion h6. [%cal Ge6h6] }
54... Kc7 { Le seul bon coup. }
55. Re5 { Le meilleur coup. La tour attaque c5 et f5. [%cal Ge5c5,Ge5f5] }
55... f4+ { Un des meilleurs coups. Le pion avance avec échec. }
56. Ke4 { Le meilleur coup. Le roi se rapproche. }
56... Rc6 { La tour protège c5. 56...Rd6 tenait un peu mieux, environ 0,6 pion d'écart, mais la position est perdue. }
57. Re7+ { Un des meilleurs coups. Échec sur la 7e rangée : le roi noir est repoussé. }
57... Kd8 { Un des meilleurs coups. }
58. Rg7 { Un des meilleurs coups. La tour reste sur la 7e rangée. }
58... Rd6 { Un des meilleurs coups. La tour prend la colonne d. }
59. Ke5 { Le meilleur coup. Le roi attaque la tour d6. }
59... Rd4 { Une faute dans une position perdue, environ 1 pion : 59...Rd7 tenait plus longtemps. }
60. Bd5 { Le meilleur coup. Le fou se place devant la tour d4 : elle ne peut plus donner d'échec sur la colonne d. [%csl Gd5] }
60... f3 { Un des meilleurs coups. Le pion avance. }
61. Kd6 { Le meilleur coup. Le roi blanc se place face au roi noir. Rg8 sera mat si le roi reste sur la 8e rangée. [%cal Gg7g8] }
61... Kc8 { Une faute qui permet le mat en un coup. 61...Rxd5+ prolongeait la partie, mais les Blancs gagnaient de toute façon. }
62. Rg8# { Échec et mat. La tour tient la 8e rangée, le fou d5 contrôle b7, le roi d6 contrôle c7 et d7.

Bilan : le fou n'a pas seulement bloqué des pions. Avec la tour et le roi, il a pris part au mat. [%csl Gc8][%cal Gd5b7] }`,
    ),
    chapter(
      "Petrosian – Benko (Los Angeles 1963) : le cavalier contre trois pions",
      "r3k2r/pp1bqp1p/6p1/2p5/1n1pP3/3B1N2/3NQPPP/R3K2R w KQkq - 0 19",
      `{ Tigran Petrosian – Pal Benko, Piatigorsky Cup, Los Angeles 1963, 3e ronde. Après 1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.Qb3 dxc4 5.Qxc4 Be6 6.Qb5+ Nc6 7.Nf3 Nd5 8.e4 Nb4 9.Qa4 Bd7 10.Qd1 e5 11.a3 exd4 12.Nb1 Na6 13.b4 Naxb4 14.axb4 Bxb4+ 15.Bd2 Qe7 16.Bd3 Bxd2+ 17.Nbxd2 Nb4 18.Qe2 c5, Benko a donné un cavalier contre trois pions avec 13...Naxb4 (une faute, environ 1,4 pion : 13...Bg7 était meilleur). 18...c5 est une imprécision (environ 0,5 pion selon trois sondes). Les Blancs ont environ +1,4.

Les Noirs ont quatre pions passés à l'aile dame : a7, b7, c5 et d4. Mais aucun n'est près de la promotion, et le roi noir est encore au centre.

PRO TIP : des pions passés qui ne peuvent pas avancer tout de suite ne font pas peur. Le camp de la pièce utilise ce temps pour attaquer le roi. }
19. O-O { Un des meilleurs coups. Le roi blanc se met à l'abri. 19.e5 tout de suite était un peu plus précis. }
19... O-O { Un des meilleurs coups, au niveau de 19...a6. }
20. e5 { Le meilleur coup. Le pion gagne de l'espace et prend les cases d6 et f6 aux pièces noires. [%csl Gd6,Gf6] }
20... Kg7 { Le roi protège f6 et h6. Un coup un peu passif : 20...a6 était légèrement plus précis. }
21. Ne4 { Le meilleur coup. Le cavalier se centralise et vise d6, f6 et le pion c5. [%cal Ge4d6,Ge4f6] }
21... Bc6 { Un des meilleurs coups, au niveau de 21...Bf5. Le fou attaque le cavalier e4. }
22. h4 { Un des meilleurs coups. Le pion h part à l'assaut du roi noir. }
22... a6 { Le pion prépare ...b5. 22...Rad8 était un peu plus précis. }
23. Rfc1 { Le meilleur coup. La tour vise le pion c5. [%cal Gc1c5] }
23... b6 { Un des meilleurs coups. Le pion protège c5. }
24. h5 { Le meilleur coup. Le pion h attaque g6. }
24... Rad8 { Un des meilleurs coups. }
25. Rab1 { LE COUP QUE STOCKFISH PROPOSE. La tour se place face au cavalier b4. [%cal Gb1b4] }
(25. Qd2 { La partie. Une faute, environ 1 pion selon trois sondes : la dame quitte e2 sans menace précise. }
25... h6 { Un des meilleurs coups. }
26. Re1 { Un des meilleurs coups. }
26... b5 { Un des meilleurs coups. La suite fait l'objet du chapitre suivant. })
25... Bd5 { Le fou se centralise. 25...a5 était un peu plus précis, environ 0,35 pion selon trois sondes. }
26. Qd2 { Un des meilleurs coups. La dame vise la case h6, près du roi noir. [%cal Gd2h6] }
26... h6 { Un des meilleurs coups. Le pion occupe h6 et couvre g5. 26...a5 était un peu plus précis. Les Blancs ont environ +3.

Bilan : les quatre pions noirs n'ont presque pas bougé. Les Blancs ont utilisé ce temps pour avancer à l'aile roi, là où se trouve le roi noir. }`,
    ),
    chapter(
      "Petrosian – Benko (Los Angeles 1963) : rendre la qualité pour des pions liés",
      "3r1r2/4qpk1/p2N2pp/1pp1P2P/1n1p4/3B1P2/3Q1P2/R3R1K1 b - - 0 28",
      `{ La partie a continué 25.Qd2 h6 26.Re1 b5 27.Nd6 Bxf3 28.gxf3. 27.Nd6 est une faute, environ 1,4 pion : 27.e6 était plus fort. Les Blancs ont environ +0,8.

Les Blancs ont maintenant un FOU contre trois pions. Le cavalier d6, soutenu par e5, gêne énormément les tours noires.

PRO TIP : le camp des pions peut rendre du matériel pour éliminer la pièce adverse la plus forte. Quatre pions passés liés valent parfois mieux qu'une qualité. }
28... Rxd6 { LE COUP QUE STOCKFISH PROPOSE. Les Noirs rendent la qualité : la tour prend le cavalier d6. [%csl Gd6] }
(28... Qg5+ { La partie. Une faute à la limite, environ 0,5 pion selon trois sondes : les Noirs échangent les dames, et le cavalier d6 reste en place. }
29. Qxg5 { Le seul coup. }
29... hxg5 { Le seul bon coup. }
30. Be4 { Le meilleur coup. Le fou se centralise. }
30... gxh5 { Une faute à la limite, environ 0,55 pion sur deux séries de trois sondes : 30...Rd7 était plus précis. }
31. Rec1 { Une faute, environ 1,1 pion : 31.Nf5+ était plus fort. }
31... f6 { Une faute plus grave, environ 3 pions : 31...f5 tenait. Les Blancs ont environ +4,3 : la position est décidée. La suite fait l'objet du chapitre suivant. })
29. exd6 { Le meilleur coup. Le pion reprend. }
29... Qxd6 { Le meilleur coup. Les Noirs ont rendu la qualité, mais ils ont maintenant quatre pions passés liés à l'aile dame : a6, b5, c5 et d4. [%csl Ga6,Gb5,Gc5,Gd4] }
30. hxg6 { Le meilleur coup. }
30... fxg6 { Un des meilleurs coups, au niveau de 30...f5. }
31. Be4 { Le meilleur coup. Le fou se centralise et attaque g6. [%cal Ge4g6] }
31... Rf4 { Un des meilleurs coups. La tour attaque le fou e4. }
32. Kg2 { Le meilleur coup. Le roi protège f3. }
32... c4 { Un des meilleurs coups, au niveau de 32...g5. Les pions passés se mettent en marche. }
33. Red1 { Le meilleur coup. La tour se place sur la colonne d, devant le pion d4. Les Blancs ont environ +2.

Bilan : avec 28...Rxd6, les Noirs gardaient quatre pions passés liés. Dans la partie, ils ont laissé le cavalier d6 en place. }`,
    ),
    chapter(
      "Petrosian – Benko (Los Angeles 1963) : la pièce de plus attaque",
      "3r1r2/6k1/p2N1p2/1pp1P1pp/1n1pB3/5P2/5P2/R1R3K1 w - - 0 32",
      `{ Dans la partie, Benko a joué 28...Qg5+ 29.Qxg5 hxg5 30.Be4 gxh5 31.Rec1 f6. Les Blancs ont environ +4,5.

Les Noirs ont quatre pions de plus, mais ils sont éparpillés : a6, b5, c5, d4 à l'aile dame, f6, g5, h5 à l'aile roi. Le roi noir est seul.

PRO TIP : quand les pions sont dispersés, le camp des pièces les ramasse avec des échecs. Chaque échec gagne un temps pour prendre un pion. }
32. Nf5+ { Le meilleur coup. Le cavalier donne échec et attaque d4. }
32... Kf7 { Un des meilleurs coups. }
33. Rxc5 { Le meilleur coup. La tour prend le pion c5. }
33... fxe5 { Un des meilleurs coups. Les Noirs reprennent un pion. }
34. Rb1 { Le meilleur coup. La tour attaque le cavalier b4. }
34... Na2 { Un des meilleurs coups. Le cavalier s'échappe. }
35. Rc7+ { Un des meilleurs coups. Échec sur la 7e rangée. }
35... Kf6 { Un écart sans conséquence : 35...Ke6 tenait un peu mieux, environ 0,7 pion. }
36. Ra7 { La tour attaque a6. 36.Rc6+ était plus fort, plus d'un pion d'écart, mais les Blancs restent gagnants. }
36... Nc3 { Le cavalier attaque la tour b1 et le fou e4. 36...Ra8 tenait mieux, environ 1,5 pion d'écart. }
37. Rxa6+ { Le meilleur coup. La tour prend a6 avec échec. }
37... Kf7 { Le meilleur coup. }
38. Rba1 { Le meilleur coup. La tour b1 quitte l'attaque du cavalier et double sur la colonne a. }
38... g4 { Les Noirs avancent, mais 38...Na4 tenait plus longtemps, environ 0,6 pion d'écart. }
39. Bc2 { Le fou quitte e4. 39.Rb6 était plus précis, environ 0,5 pion d'écart, mais rien ne change. }
39... gxf3 { Les Noirs prennent un pion. 39...Na4 tenait mieux. }
40. Bb3+ { Le meilleur coup. Le fou donne échec au roi f7. Les Blancs ont environ +7 ; Benko abandonne au 43e coup.

Bilan : des pions dispersés ne se défendent pas entre eux. La tour et le cavalier les ont pris un par un. [%cal Gb3f7] }`,
    ),
    chapter(
      "Karpov – Timman (Amsterdam 1988) : trois pions liés contre le fou",
      "1b4k1/8/8/3R4/n5N1/4P1P1/5P2/1r4K1 w - - 0 47",
      `{ Anatoli Karpov – Jan Timman, mémorial Euwe, Amsterdam 1988. Après une longue partie, la séquence 40.Nxf7 Bb8 41.Rd7 Nc5 42.Rxd5 b3 43.Nxe5 b2 44.Bf5 Nxa4 45.Ng4 b1=Q+ 46.Bxb1 Rxb1+ a mené ici. Les Blancs ont tour, cavalier et trois pions ; les Noirs ont tour, cavalier et fou, sans aucun pion. Environ +0,3.

Cette fois, c'est le camp des PIONS qui cherche à gagner. Les pions e3, f2 et g3 sont liés, tout près du roi blanc.

PRO TIP : avec trois pions contre une pièce, garde-les liés et pousse-les ensemble, le roi à côté. Un pion isolé tombe vite sous le feu de la tour et du fou. }
47. Kg2 { Un des meilleurs coups. Le roi sort de l'échec et reste près de ses pions. }
47... Kf7 { Un des meilleurs coups, au niveau de 47...Rb2. }
48. f4 { Un des meilleurs coups. Le pion f avance, protégé par g3. [%cal Gg3f4] }
48... Nc3 { Un des meilleurs coups. Le cavalier revient vers le centre. }
49. Rd3 { Le meilleur coup. La tour attaque le cavalier c3. }
49... Ne4 { Un des meilleurs coups. Le cavalier s'installe en e4 et attaque g3. }
50. Kf3 { Un des meilleurs coups. Le roi attaque le cavalier e4. }
50... Rb4 { Le meilleur coup. La tour protège le cavalier e4. [%cal Gb4e4] }
51. Nf2 { Un des meilleurs coups. Les Blancs proposent l'échange des cavaliers. }
51... Nxf2 { Les Noirs échangent. 51...Nd6 était un peu plus précis. }
52. Kxf2 { Le seul bon coup. }
52... Ke6 { Un des meilleurs coups. Le roi noir vient se placer devant les pions. }
53. Kf3 { Un des meilleurs coups. Le roi vient soutenir ses pions. }
53... Bd6 { Un des meilleurs coups. Le fou se place sur la diagonale des pions. Environ +0,3.

Bilan : tour et trois pions liés contre tour et fou. Le camp du fou tient, mais il doit surveiller chaque avance. }`,
    ),
    chapter(
      "Karpov – Timman (Amsterdam 1988) : les pions avancent ensemble",
      "8/8/3bk3/8/1r3P2/3RPKP1/8/8 w - - 3 54",
      `{ Les Blancs ont tour et trois pions liés (e3, f4, g3) contre tour et fou. Environ +0,3. Le roi noir est en e6, devant les pions.

Karpov va avancer les pions un par un, sans jamais les séparer, et chercher à repousser le roi noir avec des échecs.

PRO TIP : pousse d'abord le pion qui n'est pas attaqué, et garde toujours chaque pion protégé par un autre pion ou par le roi. }
54. g4 { Un des meilleurs coups, au niveau de 54.e4. Le pion g avance et se place à côté de f4. }
54... Ra4 { Un des meilleurs coups. }
55. g5 { Un des meilleurs coups. Le pion avance encore. }
55... Ra3 { Un des meilleurs coups. La tour propose l'échange des tours. }
56. Rd4 { Un des meilleurs coups. Karpov garde les tours : 56.Rxa3 était au même niveau. }
56... Bb8 { Le fou se replie. 56...Rc3 était un peu plus précis. }
57. Rb4 { Un des meilleurs coups. La tour attaque le fou b8. [%cal Gb4b8] }
57... Bd6 { Un des meilleurs coups. Le fou revient en d6 et attaque la tour b4. }
58. Rb5 { Un des meilleurs coups, au niveau de 58.Rb6. }
58... Rc3 { Un des meilleurs coups. La tour attaque le pion e3 par derrière. [%cal Gc3e3] }
59. f5+ { Un des meilleurs coups. Le pion avance avec échec. }
59... Ke7 { Un des meilleurs coups. }
60. Rb7+ { Un des meilleurs coups. Échec sur la 7e rangée. }
60... Bc7 { LE COUP QUE STOCKFISH PROPOSE, avec 60...Kf8 : les deux se valent à peu près. Le fou s'interpose. }
(60... Rc7 { La partie. Une faute, environ 0,7 pion sur deux séries de trois sondes : la tour quitte la 3e rangée, d'où elle attaquait le pion e3 par derrière. }
61. Rb6 { Le meilleur coup. Les Blancs refusent l'échange des tours et attaquent le fou d6. }
61... Rc5 { Une faute plus grave, environ 2 pions : 61...Rc1 tenait. Les Blancs ont environ +2,7. La suite fait l'objet du chapitre suivant. })
61. Ke4 { Un des meilleurs coups. Le roi avance avec ses pions. }
61... Rc1 { Un des meilleurs coups. La tour va chercher des échecs par derrière. Environ +0,3.

Bilan : les pions ont avancé de deux rangées, mais le fou et la tour noirs restent actifs. Tant qu'ils attaquent les pions par derrière, les Noirs tiennent. }`,
    ),
    chapter(
      "Karpov – Timman (Amsterdam 1988) : la faute qui libère les pions",
      "8/4k3/1R1b4/2r2PP1/8/4PK2/8/8 w - - 5 62",
      `{ Dans la partie, Timman a joué 60...Rc7 61.Rb6 Rc5. Ces deux coups sont des fautes. Les Blancs ont environ +2,7.

La tour noire a quitté la 3e rangée et le pion e3 n'est plus attaqué. Les pions f5 et g5 sont prêts à avancer.

PRO TIP : face à des pions liés, la défense tient souvent sur un seul coup. Chaque fois que le camp des pions peut avancer avec échec, il gagne un temps décisif. }
62. Kg4 { Un des meilleurs coups, au niveau de 62.f6+ selon trois sondes. Le roi soutient les pions. }
62... Rc3 { LE COUP QUE STOCKFISH PROPOSE. La tour revient attaquer le pion e3. [%cal Gc3e3] }
(62... Rd5 { La partie. Une faute, environ 2,5 pions : la tour ne gêne plus les pions. }
63. Rb7+ { Le meilleur coup. }
63... Kf8 { Le meilleur coup. }
64. f6 { Le meilleur coup. Le pion arrive en f6, soutenu par g5. }
64... Ra5 { Un des meilleurs coups. }
65. Rd7 { Le meilleur coup. La tour attaque le fou d6. }
65... Be5 { Le meilleur coup. Les Blancs sont largement gagnants : les pions vont passer. Timman abandonne au 73e coup. })
63. f6+ { Le meilleur coup. Le pion avance avec échec. Les Blancs ont maintenant environ +3,5. }
63... Ke6 { Le seul bon coup. }
64. g6 { Le meilleur coup. Les deux pions sont sur la 6e rangée. [%csl Gf6,Gg6] }
64... Kxf6 { Le meilleur coup. Le roi prend f6. }
65. Rxd6+ { Le meilleur coup. La tour prend le fou d6 avec échec. }
65... Ke7 { Un des meilleurs coups. Le roi attaque la tour d6. }
66. g7 { Le meilleur coup. Le pion g arrive en 7e rangée : si le roi prend la tour d6, le pion fait dame. }
66... Kxd6 { Un des meilleurs coups : la position est perdue de toute façon. }
67. g8=Q { Le meilleur coup. Le pion devient dame. }
67... Rxe3 { Le meilleur coup. La tour prend le dernier pion. }
68. Kf4 { Le meilleur coup. Le roi attaque la tour e3. Dame contre tour : une finale gagnante pour les Blancs.

Bilan : même avec la meilleure défense, une seule faute a suffi. Deux pions liés sur la 6e rangée valent plus qu'un fou. }`,
    ),
  ],
};
