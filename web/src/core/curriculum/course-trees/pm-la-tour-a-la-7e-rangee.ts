import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « La tour à la 7e rangée » (positional_mastery) — exploitation de la
 * 7e et de la 8e rangée, refonte « un commentaire par coup » du 2026-10-12.
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, entièrement
 * réécrite ici) : Capablanca – Tartakower (New York 1924), Botvinnik – Kan
 * (1931), Tartakower – Frentz (1933), Kupferstich – Andreasen (1953), Keres –
 * Tarnowski (1952), Alekhine – Yates (Londres 1922), Marshall – Capablanca
 * (New York 1918), Rubinstein – Duras (1908) et Smyslov – Reshevsky (1948),
 * tels que présentés dans « Logical Chess: Move by Move » de Chernev ; deux
 * positions d'entraînement anonymes de la base `data/import/academy/tactics.pgn`
 * (mat des deux tours en 7e rangée, et le mat du couloir qui le punit).
 *
 * Plan : l'infiltration (chapitres 1 à 4), la paralysie du roi sur la
 * dernière rangée (5 et 6), les deux tours en 7e rangée (7 à 10), la tour en
 * 7e rangée en finale (11 et 12).
 *
 * Toutes les parties ont été rejouées avec chess.js et chaque coup sondé avec
 * Stockfish 18 (profondeur 18, 3 candidats par coup). Règle appliquée : quand
 * un coup perd environ 0,5 pion ou plus par rapport au choix du moteur, la
 * LIGNE PRINCIPALE suit le moteur et la suite de la partie passe en
 * variante, signalée comme fautive. Exception : dans une position déjà
 * décisive (plus de +3 environ), un écart qui ne change pas le résultat est
 * seulement signalé dans le commentaire, pour garder la partie lisible. Les
 * évaluations citées sont du point de vue des Blancs. Aucun résultat de
 * partie (1-0, 0-1…) dans les variantes : le parseur s'y arrêterait.
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

export const LA_TOUR_A_LA_7E_RANGEE: CourseTree = {
  chapters: [
    chapter(
      "Capablanca – Tartakower (1) : l'infiltration par la colonne h",
      "4k3/p1p5/1p3rp1/n2p4/P2P1P2/2PB2P1/6K1/R7 w - - 0 29",
      `{ New York 1924. Pour le joueur qui attaque, la 7e rangée (la 2e pour les Noirs) est la plus précieuse de l'échiquier. C'est là que l'adversaire garde ses pions qui n'ont pas encore bougé, et c'est juste devant la rangée où se tient son roi. Une tour qui s'y installe fait trois choses à la fois : elle attaque des pions qui ne peuvent pas se défendre entre eux, elle enferme le roi sur la dernière rangée, et elle prépare des menaces de mat.

Pour y arriver, il faut une COLONNE OUVERTE. Ici, Capablanca vient d'en ouvrir une : la colonne h. Le matériel est égal (tour et fou contre tour et cavalier).

PRO TIP : une tour n'entre pas en 7e rangée par magie. Cherche d'abord la colonne ouverte qui y mène, puis la case d'entrée que l'adversaire ne contrôle pas. [%cal Ga1h1,Gh1h7] }
29. Rh1 { La tour prend la colonne h, la seule colonne ouverte. Elle menace déjà Rh8+, puis d'entrer en h7. Stockfish place 29.g4 et 29.Rh1 au même niveau (+0,6). [%cal Gh1h8,Gh1h7] }
29... Kf8 { Le roi noir garde la 8e rangée et la case g7. C'est le meilleur coup : il empêche Rh8+, mais il ne peut pas empêcher la tour d'entrer en h7. }
30. Rh7 { LA TOUR EST EN 7e RANGÉE. Elle attaque le pion c7, et derrière lui le pion a7. Le roi f8 ne peut plus monter par g7 ou f7 sans risque, et la tour noire va devoir se consacrer à la défense. [%csl Rc7,Ra7] [%cal Gh7c7] }
30... Rc6 { La meilleure défense : la tour protège c7 le long de la colonne c, et elle attaque le pion c3, qui n'est pas défendu. Une tour passive (en c7) aurait été pire. [%cal Gc6c3] }
31. g4 { Capablanca lance ses pions de l'aile roi : avec g5 puis f5, il veut créer un pion passé et ouvrir la route à son roi. Stockfish préférait 31.Kf2 (+0,6 contre +0,1), qui garde le pion c3 avec le temps. }
31... Nc4 { Le cavalier revient au centre et vise e3 et d2, pour harceler le roi blanc. 31...Nb3 était un peu plus précis selon Stockfish. }
32. g5 { Le pion fixe le pion g6 sur sa case : plus tard, f4-f5 ouvrira une brèche. Le meilleur coup. }
32... Ne3+ { Le cavalier donne échec. 32...a6 était équivalent. }
33. Kf3 { Le roi attaque le cavalier. Le meilleur coup : le roi doit rester près de ses pions. }
33... Nd1 { Le meilleur coup selon Stockfish. Le cavalier saute vers b2 en attaquant le pion c3, déjà visé par la tour c6. La tour blanche en 7e rangée est forte, mais elle ne suffit pas à gagner si l'adversaire crée un contre-jeu actif. [%cal Gd1c3,Gc6c3] }
(33... Nf5? { Le coup de la partie, et la faute qui décide de tout (Stockfish : +2,1 au lieu de +0,2). Le cavalier attaque d4, mais Capablanca va l'échanger, et la finale de tours qui suit est perdue pour les Noirs. } 34. Bxf5! { Le fou prend le cavalier. Les finales de tours avec une tour active en 7e rangée sont très difficiles à défendre. } 34... gxf5 { Les Noirs reprennent du pion g. Résultat : le pion g5 blanc n'a plus de pion adverse devant lui. C'est un pion passé. [%csl Gg5] } 35. Kg3! { Le roi part vers h4 et h5. Capablanca abandonne volontairement le pion c3 : son roi doit rejoindre sa tour. Suite au chapitre suivant. [%cal Gg3h4,Gh4h5] })
34. Rh6 { La tour attaque le pion g6 depuis la 6e rangée. [%cal Gh6g6] }
34... Kg7 { Le roi attaque la tour, qui reste protégée par le pion g5. }
35. f5 { Le pion attaque g6 une seconde fois, avec la tour h6. Les Blancs menacent fxg6 et cherchent à forcer le passage à l'aile roi. [%cal Gf5g6,Gh6g6] }
35... Nb2 { Les Noirs ne défendent pas g6 : ils contre-attaquent. Le cavalier attaque le fou d3 et le pion a4. [%cal Gb2d3,Gb2a4] }
36. Be2 { Le fou fuit le cavalier. Les pions c3 et a4 restent sans défense. }
36... Rxc3+ { La tour prend le pion c3 avec échec. Les Noirs ont un pion de plus, mais les pièces blanches sont plus actives : Stockfish juge la position équilibrée (+0,2).

PRO TIP : la tour en 7e rangée est un atout, pas une victoire automatique. Si l'adversaire peut créer un contre-jeu (ici le cavalier contre c3), il faut le neutraliser avant de vouloir tout gagner. }`,
    ),
    chapter(
      "Capablanca – Tartakower (2) : tour en 7e, roi en 6e",
      "5k2/p1p4R/1pr5/3p1pP1/P2P1P2/2P2K2/8/8 w - - 0 35",
      `{ Suite de la partie, après 33...Nf5? 34.Bxf5 gxf5. C'est une finale de tours pure. Les Noirs ont des pions faibles (c7, a7, d5, f5), et le roi f8 est collé à la dernière rangée par la tour h7.

L'idée de Capablanca : faire venir son ROI en 6e rangée, à côté du pion passé g5. Une tour en 7e rangée et un roi en 6e rangée forment un filet de mat autour du roi adverse. Le défenseur doit alors parer des menaces de mat à chaque coup, et n'a plus le temps de sauver ses pions.

PRO TIP : en finale de tours, le roi est une pièce d'attaque. Pour l'amener en avant, on peut accepter de perdre un ou deux pions. [%cal Gf3g3,Gg3h4,Gh4h5,Gh5g6] }
35. Kg3 { Le meilleur coup (+1,9). Le roi prend la route h4-h5-g6. Il abandonne le pion c3 : rester le défendre (35.Ke2 par exemple) ne donnerait que l'égalité. }
35... Rxc3+ { La tour prend le pion avec échec. C'est le meilleur coup. }
36. Kh4 { Le roi avance. Toute autre case (36.Kf2, 36.Kg2) laisserait filer l'avantage. }
36... a6 { Le meilleur coup selon Stockfish (+2,9). Les Noirs ne courent pas après les pions blancs : ils préparent ...b5 pour créer un pion passé à l'aile dame, et donner du travail à la tour blanche. [%cal Ga6a5,Gb6b5] }
(36... Rf3? { Le coup de la partie est une erreur (Stockfish : +4,6 au lieu de +2,9). La tour prend f4, mais elle ne surveille plus la colonne c ni la 6e rangée, et le roi blanc va atteindre f6. } 37. g6! { Le pion avance avec un plan précis : Kg5 puis Kf6, et mat en h8. } 37... Rxf4+ { La tour prend le pion avec échec. } 38. Kg5 { Le roi attaque la tour et le pion f5. } 38... Re4 { La tour s'écarte et attaque le pion d4. } 39. Kf6! { Le roi arrive en 6e rangée. Menace : Rh8 mat, car les cases e7, f7 et g7 sont toutes contrôlées par le roi et le pion g6. [%csl Re7,Rf7,Rg7] [%cal Gh7h8] } 39... Kg8 { La meilleure défense contre le mat : le roi attaque la tour h7. } 40. Rg7+ { La tour reste en 7e rangée avec échec. 40.Rh3 était à peine plus précis. } 40... Kh8 { Le roi va dans le coin. 40...Kf8 était équivalent. } 41. Rxc7 { La tour prend le premier pion, toujours sur la 7e rangée. Menace : Rc8+, et le roi h8 n'a plus aucune case de fuite. } 41... Re8 { La tour protège la dernière rangée contre le mat. } 42. Kxf5 { Le roi prend le deuxième pion. Stockfish préférait 42.Kf7, encore plus direct, mais la position est gagnée. } 42... Re4 { La tour attaque d4. 42...a5 résistait un peu mieux. } 43. Kf6 { Le roi revient en f6, et les menaces sur la 8e rangée recommencent. } 43... Rf4+ { La tour donne échec pour gagner du temps. } 44. Ke5 { Le roi s'avance vers le pion d5. } 44... Rg4 { La tour attaque le pion g6. } 45. g7+ { Le pion avance avec échec, protégé par la tour c7 le long de la 7e rangée. } 45... Kg8 { Le roi bloque le pion. } 46. Rxa7 { La tour prend le troisième pion, toujours sur la 7e rangée, qui protège aussi le pion g7. } 46... Rg1 { La tour s'éloigne pour donner des échecs. } 47. Kxd5 { Le roi prend le quatrième pion. Les Blancs ont maintenant deux pions passés. } 47... Rc1 { La tour coupe le roi blanc de la colonne c. } 48. Kd6 { Le roi soutient l'avance du pion d. } 48... Rc2 { La tour attend. 48...Ra1 tenait un peu plus longtemps. } 49. d5 { Le pion avance, protégé par le roi. } 49... Rc1 { La tour garde la colonne c. } 50. Rc7 { La tour chasse la tour noire de la colonne c. } 50... Ra1 { La tour attaque le pion a4. } 51. Kc6 { Le roi attaque b6. } 51... Rxa4 { La tour noire récupère le pion a4, mais c'est trop tard. } 52. d6 { Tartakower abandonne : le pion d va à dame, soutenu par le roi et la tour, et le pion g7 garde le roi noir prisonnier de la 8e rangée. })
37. Kh5 { Le roi poursuit sa route vers g6, en direction du pion f5. }
37... b5 { Le pion attaque a4 : les Noirs vont obtenir un pion passé. }
38. Kg6 { Le roi attaque f5. Il est maintenant en 6e rangée, à côté de la tour h7. }
38... Rc6+ { La tour donne échec le long de la 6e rangée. }
39. Kxf5 { Le roi prend le pion f5. Les Blancs ont maintenant deux pions passés liés (f4 et g5). }
39... bxa4 { Les Noirs prennent a4 : leur pion a4 devient passé, et rien ne l'arrête à l'aile dame. }
40. Rh3 { La tour quitte la 7e rangée pour revenir en défense : par la 3e rangée, elle peut aller en a3 stopper le pion a. Les Blancs restent nettement mieux (+2,9).

PRO TIP : la tour en 7e rangée doit savoir revenir en arrière. Quand l'adversaire crée un pion passé, c'est souvent elle qui doit l'arrêter. }`,
    ),
    chapter(
      "Botvinnik – Kan : la dame ouvre la porte, la tour entre",
      "4r1k1/1pp2rpp/8/nPBQp2q/5p2/6P1/P3PP1P/3R1RK1 w - - 1 24",
      `{ Leningrad 1931. En milieu de partie, la case d'entrée en 7e rangée est souvent défendue. Il faut alors la préparer avec d'autres pièces. Ici, la colonne d est ouverte et la tour d1 voudrait aller en d7, mais la tour f7 garde cette case le long de la 7e rangée. Botvinnik va d'abord appuyer la case d7 avec sa DAME, en gagnant du temps sur la tour e8, puis sa tour entrera.

Le matériel est égal, mais le cavalier a5 est hors jeu et le fou c5 domine les cases noires (Stockfish : environ +3).

PRO TIP : pour faire entrer une tour en 7e rangée, cherche quelle pièce adverse défend la case d'entrée, et chasse-la d'abord. [%csl Gd7] [%cal Gd1d7] }
24. Qe6 { La dame attaque la tour e8, qui n'est pas protégée, et la tour f7. Surtout, elle protège la case d7 : la tour d1 pourra y entrer. Stockfish place 24.Bb4, 24.Qd8 et 24.Qe6 très près les uns des autres (environ +3). [%cal Ge6e8,Ge6f7] }
24... Ra8 { La tour fuit le long de la 8e rangée. C'est le meilleur coup. }
25. Rd7 { La tour entre en 7e rangée, protégée par la dame e6. Elle attaque le pion c7 et la tour f7, déjà visée par la dame. [%cal Gd7c7,Gd7f7] }
25... Qg6 { La dame noire attaque la dame blanche et propose l'échange. 25...Qf5 était un peu plus précis. }
26. Qd5 { La dame refuse l'échange : sans les dames, l'attaque perdrait de sa force (après 26.Qxg6, Stockfish ne donne plus que +0,8). Depuis d5, elle garde l'œil sur b7, e5 et f7. }
26... h6 { Les Noirs donnent une case de fuite (h7) à leur roi : avec des pièces lourdes adverses si proches, la 8e rangée est dangereuse. 26...h5 était un peu meilleur. }
27. Rxc7 { La tour prend c7 et reste en 7e rangée, où elle vise maintenant b7 et la tour f7. }
27... Re8 { La tour revient au centre. 27...h5 résistait mieux (+4,3 au lieu de +5,0), mais la position noire est déjà très difficile. }
28. Bb4 { Le fou attaque le cavalier a5, qui n'a aucune case de repli. Stockfish préférait 28.Bb6 (+5,0), qui attaque aussi le cavalier. }
28... b6 { Le pion protège le cavalier. C'est le meilleur coup. }
29. Bxa5 { Le fou prend quand même le cavalier. }
29... bxa5 { Le pion reprend. Mais la colonne b s'ouvre devant le pion b5. }
30. b6 { Le pion b est passé. La tour c7 contrôle toute la 7e rangée, donc la case b7 par où il va passer. [%cal Gb6b7,Gc7b7] }
30... Qe6 { La dame attaque b6 et propose l'échange des dames. C'est le meilleur coup. }
31. Qxe6 { Botvinnik accepte : dans la finale, le pion b6, soutenu par la tour en 7e rangée, sera décisif. }
31... Rxe6 { La tour reprend et attaque le pion b6. }
32. Rb1 { La tour défend le pion par derrière, le meilleur emplacement pour une tour derrière un pion passé. }
32... Re8 { La tour revient garder la 8e rangée, et donc la case de promotion b8. }
33. Rxf7 { La tour échange la seule pièce noire qui défendait la 7e rangée. 33.Ra7 était à peine plus précis. }
33... Kxf7 { Le roi reprend. }
34. b7 { Le pion arrive en 7e rangée, protégé par la tour b1. }
34... Rb8 { La tour bloque la case de promotion. Elle est désormais clouée à cette tâche : si elle quitte la colonne b, le pion fait dame. }
35. gxf4 { Les Blancs ouvrent le jeu à l'aile roi, où leur roi va pouvoir entrer. }
35... exf4 { Le pion reprend. }
36. Kg2 { Le roi part au centre : en face, la tour noire est paralysée en b8. }
36... Ke6 { Le roi noir s'approche du centre. 36...g5 était un peu plus précis. }
37. Kf3 { Le roi attaque le pion f4. }
37... g5 { Le pion protège f4. }
38. Ke4 { Le roi entre au centre. Kan abandonne : le roi blanc va gagner les pions de l'aile roi, et la tour noire ne peut pas quitter b8. Stockfish préférait 38.Kg4, mais toutes les suites gagnent.

PRO TIP : un pion passé qui arrive en 7e rangée fait le même travail qu'une tour en 7e : il paralyse une pièce adverse sur la dernière rangée. }`,
    ),
    chapter(
      "Tartakower – Frentz : la tour gloutonne",
      "4k2r/pp4bp/2p1p3/8/1B6/5P2/PP3P1P/3KR3 w - - 0 21",
      `{ Paris 1933. Les pions qui n'ont pas encore bougé (a7, b7, h7 ici) sont alignés sur la 7e rangée. Une tour qui y entre peut les prendre les uns après les autres, de côté, et aucun pion ne peut protéger son voisin sur la même rangée.

La colonne e est ouverte, et le pion e6 bloque l'entrée. Matériel égal.

PRO TIP : une rangée pleine de pions est une rangée pleine de cibles. Une fois en 7e rangée, la tour « mange » d'un côté à l'autre. [%csl Ra7,Rb7,Rh7] }
21. Rxe6+ { La tour prend le pion e6 avec échec, et la colonne e est maintenant libre jusqu'à e7. C'est le meilleur coup (+2,0). }
21... Kf7 { Le meilleur coup selon Stockfish : le roi attaque la tour e6, qui n'est pas protégée, et reste près de la 7e rangée pour la défendre. }
(21... Kd8? { Le coup de la partie (Stockfish : +2,5 au lieu de +2,0). Le roi s'éloigne de l'aile roi, et la tour entre quand même. } 22. Re7! { La tour entre en 7e rangée. Le roi d8 ne peut pas la prendre : le fou b4 la protège. Elle attaque le pion b7 et le fou g7. [%cal Gb4e7,Ge7b7,Ge7g7] } 22... Bxb2 { Le fou s'échappe en prenant un pion. 22...Bd4 était un peu plus tenace. } 23. Rxb7 { La tour prend b7. Elle vise maintenant a7 et h7, sur la même rangée. [%cal Gb7a7,Gb7h7] } 23... Bd4 { Le fou attaque le pion f2. 23...Kc8 résistait un peu mieux. } 24. Bc5! { Le fou s'offre : si 24...Bxc5, 25.Rb8+ et la tour prend ensuite la tour h8. } 24... Kc8 { Le roi attaque la tour b7. } 25. Rxa7 { La tour s'écarte en prenant un deuxième pion. } 25... Kb8 { Le roi attaque à nouveau la tour. } 26. Bxd4 { Le fou prend le fou d4, et il vise la tour h8. } 26... Rd8 { La tour attaque le fou d4, cloué contre le roi d1 sur la colonne d. } 27. Rxh7 { La tour prend un troisième pion de la 7e rangée et abandonne le fou. 27.Ra4, qui protège le fou, était plus fort (+5,4), mais les Blancs gardent une finale gagnée (+4). } 27... Rxd4+ { La tour prend le fou avec échec. Bilan : les Blancs ont une tour et quatre pions (a2, f2, f3, h2) contre une tour et un pion (c6). } 28. Ke2 { Le roi s'écarte de l'échec. } 28... Ra4 { La tour attaque a2. 28...c5 était un peu plus actif. } 29. h4 { Les Blancs abandonnent le pion a2 : le pion h, qui a la tour h7 derrière lui, va courir à dame. } 29... Rxa2+ { La tour prend avec échec. } 30. Ke3 { Le roi s'avance. } 30... Kc8 { Le roi noir veut rejoindre le pion h, mais la tour h7 lui barre la 7e rangée : il doit faire le détour par la 8e. } 31. h5 { Le pion avance. } 31... Kd8 { Le roi continue sa course. } 32. h6 { Le pion approche de la promotion. } 32... Ke8 { Le roi arrive vers f8. } 33. Rb7 { La tour garde toujours la 7e rangée, et donc la case h7. 33.Rc7 était encore plus rapide. } 33... Kf8 { Le roi s'approche de la case de promotion h8, mais il arrive trop tard. } 34. h7 { Le pion arrive en 7e, protégé par la tour b7 le long de la rangée. Menace : h8=D+. } 34... Ra3+ { La tour donne des échecs. } 35. Kf4 { Frentz abandonne. Après 35...Ra4+ 36.Kg3 Rg4+ 37.fxg4, plus rien n'arrête le pion h. })
22. Re7+ { La tour entre en 7e rangée avec échec. Le roi ne peut pas la prendre : le fou b4 la protège. [%cal Gb4e7] }
22... Kg6 { Le roi s'écarte. Il ne peut pas protéger les pions de l'aile dame. }
23. Rxg7+! { Le meilleur coup selon Stockfish (+4,0) : la tour prend le fou g7, lui aussi posé sur la 7e rangée. Le roi va reprendre, mais il se retrouve sur la même diagonale que la tour h8. [%cal Ge7g7] }
(23. Rxb7 { La récolte naturelle : la tour prend b7 et attaque a7. Les Blancs gardent un gros avantage (+2,2), mais Stockfish trouve mieux. } 23... Bxb2 { Le fou récupère un pion. } 24. Rxa7 { La tour prend un deuxième pion sur la 7e rangée. } 24... Be5 { Le fou revient au centre et attaque le pion h2. } 25. h3 { Le pion se met à l'abri. Les Blancs ont deux pions de plus : la tour a nettoyé la 7e rangée. })
23... Kxg7 { Le roi reprend la tour. }
24. Bc3+ { L'ENFILADE : le fou donne échec sur la grande diagonale, et derrière le roi se trouve la tour h8. [%cal Gc3h8] }
24... Kg8 { Le roi s'écarte de la diagonale. }
25. Kd2 { Le roi blanc se rapproche du centre avant de prendre : la tour h8 ne peut pas s'échapper, car le roi g8 et le pion h7 l'enferment. }
25... h5 { Le pion libère la case h7, mais il est trop tard pour la tour. }
26. Bxh8 { Le fou prend la tour. }
26... Kxh8 { Le roi reprend. La finale de pions est gagnée pour les Blancs (+4) : ils ont un pion de plus et leur roi est bien plus près du centre.

PRO TIP : une tour en 7e rangée n'attaque pas que des pions. Elle vise TOUT ce qui se trouve sur cette rangée, pièces comprises. Ici, en prenant le fou g7, elle a ouvert une enfilade qui gagne la tour h8. }`,
    ),
    chapter(
      "Kupferstich – Andreasen : la paralysie du roi et le moulin",
      "r3k1r1/ppp2p1p/3p1Bp1/4p1N1/8/8/PP3PbP/2R1K2R w Kq - 0 21",
      `{ 1953. Les Blancs ont une pièce pour quatre pions, mais une attaque terrible : le fou f6 contrôle les cases noires autour du roi, et la colonne c est ouverte. Toute la position est déjà gagnante pour les Blancs (Stockfish : environ +6) : ce chapitre sert à montrer un mécanisme.

Ce mécanisme, c'est le MOULIN : une tour en 7e rangée et un fou qui visent le même roi. La tour donne échec en g7 ; le roi va en f8 ; la tour quitte g7 en prenant un pion de la 7e rangée, et le fou donne échec à la découverte. Le roi revient en g8, la tour revient en g7 avec échec, et ainsi de suite. Le roi est PARALYSÉ : il ne peut aller que de g8 à f8.

PRO TIP : un roi enfermé sur la dernière rangée, avec une tour adverse en 7e, est souvent à la merci d'un échec à la découverte. Repère les pièces qui visent le roi « à travers » ta tour. [%cal Gc1c7] }
21. Rxc7 { La tour entre en 7e rangée en prenant c7. C'est le meilleur coup. Elle vise b7 et f7. Le pion f7, attaqué par la tour et le cavalier g5, n'est défendu que par le roi. [%cal Gc7b7,Gc7f7,Gg5f7] }
21... Bxh1 { Les Noirs prennent la tour h1. Ce coup est une faute dans une position déjà perdue : 21...Rg7 limitait la casse (+6,1 au lieu de +12). }
22. Nxf7 { Le cavalier prend f7 et vise d6 et h8. 22.Re7+ était encore plus fort (+12), mais l'attaque reste écrasante. }
22... Bd5 { Le fou revient en défense : il attaque le cavalier f7 et le pion a2. 22...Rh8 était un peu plus tenace. }
23. Nxd6+ { Le cavalier prend d6 avec échec. Il contrôle maintenant les cases e8, f7 et b7. [%csl Ge8,Gf7] }
23... Kf8 { Seul coup : le roi va en f8, sur la dernière rangée. }
24. Bg5 { Le fou se replie pour revenir en h6 avec échec. 24.Be7+ était un peu plus précis. }
24... Rh8 { La tour quitte g8 pour laisser une case au roi. 24...Rg7 résistait mieux, mais la position est perdue. }
25. Bh6+ { Le fou donne échec sur la diagonale h6-f8. Le roi est maintenant enfermé : g7 et f8 sont contrôlées par le fou, f7 et e8 par le cavalier. [%csl Rg7,Rf8,Rf7,Re8] }
25... Kg8 { Seul coup. Le roi g8 et la tour h8 sont emmurés dans le coin. }
26. Rg7+ { Le moulin commence. La tour donne échec en g7, protégée par le fou h6 : le roi ne peut pas la prendre. [%cal Gh6g7] }
26... Kf8 { Seul coup : le roi retourne en f8. }
27. Rc7+ { La tour quitte g7, et le fou h6 donne échec à la découverte. Stockfish préférait 27.Rxb7+ tout de suite (mat en 15), mais le principe est le même. [%cal Gh6f8] }
27... Kg8 { Seul coup : le roi retourne en g8. }
28. Nc8 { Le cavalier attaque a7. Si 28...Rxc8, alors 29.Rxc8+ Kf7 30.Rxh8 et la tour blanche reprend la tour h8. Stockfish préférait continuer le moulin par 28.Rg7+. }
28... Bf3 { Le fou cherche une case utile, mais le moulin reprend. 28...Rxc8 était la seule défense sérieuse (+5,7 au lieu de +10,8). }
29. Rg7+ { La tour revient en g7 avec échec. }
29... Kf8 { Seul coup : le roi est renvoyé en f8, et la tour va pouvoir quitter g7. }
30. Rxb7+ { La tour prend b7, et le fou h6 donne échec à la découverte. Premier pion de la 7e rangée. }
30... Kg8 { Le roi retourne en g8. 30...Ke8 aurait permis un mat en deux coups. }
31. Rg7+ { La tour revient en g7. Le roi noir ne peut toujours rien faire. }
31... Kf8 { Seul coup, encore : le roi tourne en rond entre g8 et f8. }
32. Rxa7+ { La tour prend a7, encore avec échec à la découverte. Deuxième pion de la 7e rangée. }
32... Kg8 { Le roi revient encore en g8 : en e8, il serait maté en deux coups. }
33. Rxa8 { La tour prend la tour a8. 33.Rg7+ gagnait encore plus (+8,8 contre +4,7), mais la position reste gagnante. }
33... Bxa8 { Le fou reprend la tour. }
34. Nd6 { Andreasen abandonne. Le cavalier revient en d6. Le roi g8 n'a aucune case : f8 et g7 sont contrôlées par le fou, f7 par le cavalier. La tour h8 ne peut pas bouger non plus (le roi g8 et le pion h7 la bloquent). Les Blancs vont pousser un pion de l'aile dame jusqu'à dame. [%csl Rg8,Rh8]

PRO TIP : un roi et une tour emmurés dans un coin valent beaucoup moins que leur valeur sur le papier. La paralysie est un avantage matériel déguisé. }`,
    ),
    chapter(
      "Keres – Tarnowski : la tour en 7e prépare la combinaison",
      "5bk1/1q4pn/p2pr3/2p1pNPp/P1P1P3/1rPQ1P2/3B4/R2R1K2 w - - 1 32",
      `{ Helsinki 1952. Le cavalier f5 est installé près du roi noir, la dame d3 est prête à se centraliser, et la colonne b est la seule colonne ouverte. Les Blancs sont déjà nettement mieux (Stockfish : environ +3).

Keres va prendre la colonne b, faire entrer sa tour en b7, puis lancer une combinaison. Une tour en 7e rangée ne sert pas seulement à prendre des pions : elle attaque les pièces qui défendent le roi, et elle donne des échecs à la découverte quand une autre pièce se déplace devant elle.

PRO TIP : quand tu as une tour en 7e rangée, cherche les pièces adverses alignées sur cette rangée : chacune peut devenir la cible d'une attaque à la découverte. [%cal Gd1b1,Gb1b7] }
32. Rdb1 { La tour conteste la colonne b. C'est le meilleur coup (+3,0). }
32... Rxb1+ { Les Noirs échangent les tours. 32...Kh8 était un peu plus précis (+3,6 au lieu de +3,9). }
33. Rxb1 { L'autre tour reprend : les Blancs possèdent la colonne b, et ils attaquent la dame b7. [%cal Gb1b7] }
33... Qf7 { La dame se met à l'abri et attaque le cavalier f5. 33...Qc8 était un peu meilleur. }
34. Qd5 { La dame se centralise. Elle attaque la tour e6, défendue par la dame f7. C'est le meilleur coup. [%cal Gd5e6] }
34... g6 { Une faute dans une position difficile : le pion chasse le cavalier, mais il affaiblit les cases autour du roi (+6,9 au lieu de +4,5). }
(34... Kh8 { Le meilleur coup selon Stockfish (+4,5) : le roi quitte la diagonale d5-g8, où il était aligné avec la tour e6 et la dame f7. } 35. Rb7 { La tour entre quand même en 7e rangée et attaque la dame. } 35... Qe8 { La dame recule. } 36. Nh4 { Le cavalier se replace avant que ...g6 ne le chasse. } 36... g6 { Le pion ferme la route au cavalier. } 37. Ra7 { La tour attaque a6, et le long de la 7e rangée elle vise même le cavalier h7. Les Noirs n'ont plus de coups utiles. [%cal Ga7h7] })
35. Rb7 { La tour entre en 7e rangée en attaquant la dame f7. C'est le meilleur coup. [%cal Gb7f7] }
35... Qe8 { La dame fuit en gardant la tour e6. }
36. Ne7+ { Le cavalier ignore la menace et donne échec. Il va maintenant se placer DEVANT la tour b7, pour ensuite s'écarter avec un échec à la découverte. 36.Ra7 était un peu plus fort, mais la combinaison choisie gagne aussi. }
36... Kf7 { Le roi attaque le cavalier, mais il entre sur la 7e rangée, dans la ligne de la tour b7. 36...Bxe7 limitait les dégâts (+6,7 au lieu de +8,0). }
37. Nc6+ { Échec à la découverte : le cavalier s'écarte, et la tour b7 donne échec au roi f7 le long de la 7e rangée. [%cal Gb7f7] }
37... Kg8 { Le roi retourne en g8. }
38. Nd8! { Le cavalier attaque la tour e6 et la case f7. La dame noire est seule à défendre e6. }
38... Qxd8 { La dame prend le cavalier, mais elle abandonne la défense de la tour e6. }
39. Qxe6+ { La dame prend la tour avec échec. }
39... Kh8 { Seul coup : le roi se réfugie dans le coin. }
40. Qf7 { Tarnowski abandonne. La dame et la tour b7 contrôlent toute la 7e rangée, et les Blancs ont une qualité de plus. Selon Stockfish, la seule défense contre le mat, 40...Be7, coûte encore du matériel (+10).

PRO TIP : un échec à la découverte avec une tour en 7e rangée est une arme à double tranchant pour le défenseur : chaque pas de son roi sur cette rangée peut le mettre en échec. }`,
    ),
    chapter(
      "Alekhine – Yates : deux tours en 7e rangée",
      "r4r2/6pk/b3p2p/2RpNp2/p2P3P/Pp2PP2/1P3KP1/2R5 w - - 1 26",
      `{ Londres 1922. Suite d'une partie vue au module « La colonne ouverte ». Les Blancs possèdent la colonne c, leur cavalier e5 est inattaquable par un pion, et le fou a6 des Noirs est mauvais. Le matériel est égal, mais les Blancs sont déjà nettement mieux (Stockfish : environ +3).

Le plan d'Alekhine : doubler ses tours sur la 7e rangée. Une seule tour en 7e attaque des pions ; DEUX tours en 7e attaquent tout, se protègent l'une l'autre, et menacent le roi de mat. Les joueurs anglais appellent ces tours « les cochons » (pigs), parce qu'elles dévorent tout sur leur passage.

PRO TIP : avant de doubler les tours en 7e rangée, assure-toi que l'adversaire ne peut pas contester la colonne d'entrée. Ici, la colonne c appartient aux Blancs. [%cal Gc5c7,Gc1c5] }
26. Kg3 { Le roi s'approche du centre et de l'aile roi, où il soutiendra l'attaque. C'est le meilleur coup. Il n'y a pas de danger pour lui : les pièces lourdes noires n'ont aucune colonne. }
26... Rfb8 { La tour noire se place derrière le pion b3, sans effet réel. 26...Bc4 était un peu plus utile. }
27. Rc7 { La première tour entre en 7e rangée et attaque le pion g7. Stockfish place 27.Rc6, 27.Kf4 et 27.Rc7 au même niveau. [%cal Gc7g7] }
27... Bb5 { Le fou cherche une diagonale plus active. }
28. R1c5 { La seconde tour avance et attaque le fou b5 et le pion d5. C'est le meilleur coup. }
28... Ba6 { Le fou retourne en a6. 28...Rb6 était un peu plus tenace. }
29. R5c6 { La tour attaque le fou a6 et le pion e6, tout en préparant le passage vers la 7e rangée. }
29... Re8 { La tour défend e6. C'est le meilleur coup. }
30. Kf4 { Le roi monte encore, pour soutenir h5 et menacer d'entrer en e5. 30.h5 était un peu plus précis. }
30... Kg8 { Le roi s'éloigne de h7. 30...Bf1 était plus tenace (+4,0 au lieu de +4,7), mais la position est déjà perdue. }
31. h5 { Le pion contrôle g6 : le roi noir ne peut plus y aller, et le pion g7 ne peut plus avancer sans être pris. }
31... Bf1 { Le fou attaque le pion g2. }
32. g3 { Le pion se met à l'abri. 32.Ng6, plus actif, était plus fort (+4,9 contre +4,2). }
32... Ba6 { Le fou revient défendre l'aile dame. }
33. Rf7 { La tour c7 se décale en f7, et elle attaque f5 et g7. [%cal Gf7f5,Gf7g7] }
33... Kh7 { Le roi revient en h7. 33...Kh8 était un peu meilleur. }
34. Rcc7 { LES DEUX TOURS SONT EN 7e RANGÉE. Elles se protègent l'une l'autre, attaquent g7 et menacent déjà le roi. [%csl Gc7,Gf7] [%cal Gc7g7,Gf7g7] }
34... Rg8 { La tour vient défendre g7. C'est le meilleur coup : la tour g8 est désormais clouée à cette défense. }
35. Nd7! { Le cavalier part vers f6, d'où il attaquera la tour g8 et le roi. C'est le meilleur coup. [%cal Gd7f6] }
35... Kh8 { Le roi quitte h7 pour éviter un échec du cavalier en f6. }
36. Nf6 { Le cavalier attaque la tour g8. C'est le meilleur coup. [%cal Gf6g8] }
36... Rgf8 { La tour s'échappe en f8 et attaque la tour f7. Mais elle ne défend plus g7. 36...Bd3 résistait plus longtemps (+6,5). }
37. Rxg7!! { La tour prend g7 en laissant le cavalier f6 en prise. Les deux tours sont maintenant en g7 et c7 : elles menacent Rh7+ suivi d'un mat sur la 7e ou la 8e rangée. }
37... Rxf6 { La tour prend le cavalier. }
38. Ke5! { Yates abandonne. Le roi attaque la tour f6. Où qu'elle aille, les deux tours blanches de la 7e rangée finissent par mater le roi h8 (Stockfish annonce un mat en six coups). [%cal Ge5f6]

PRO TIP : deux tours en 7e rangée plus une troisième pièce (ici le cavalier, puis le roi) suffisent presque toujours à mater un roi coincé dans son coin. }`,
    ),
    chapter(
      "Le mat des deux tours en 7e rangée",
      "5rk1/1R2R3/6p1/p4p1p/3p1p2/1P1P3P/1r3P2/6K1 w - - 0 26",
      `{ Position d'entraînement. Les Noirs ont deux pions de plus, mais les Blancs ont doublé leurs tours en 7e rangée. Avec deux tours sur cette rangée, il existe un mécanisme de mat à connaître par cœur : une tour donne échec sur la colonne g, l'autre sur la colonne h, et elles avancent l'une après l'autre en se protégeant.

Ce mat fonctionne quand le roi ne peut pas s'échapper par la colonne f. Ici, c'est la propre tour noire f8 qui bouche cette case.

PRO TIP : avec deux tours en 7e rangée, cherche toujours la suite d'échecs Rg7+, Rh7+ : même sans autre pièce, elle donne souvent le mat ou gagne beaucoup de matériel. [%cal Ge7g7,Gb7h7] }
26. Rg7+ { La première tour donne échec en g7. Le roi ne peut pas la prendre : la tour b7 la protège, le long de la 7e rangée. [%cal Gb7g7] }
26... Kh8 { Seul coup : f7 est contrôlée par la tour g7, et la tour f8 occupe la case f8. }
27. Rh7+ { La tour g7 glisse en h7 avec échec. Elle reste protégée par la tour b7, tout au bout de la 7e rangée. [%cal Gg7h7,Gb7h7] }
27... Kg8 { Le roi retourne en g8 : il n'a pas d'autre case. }
28. Rbg7# { MAT. La tour b7 vient en g7, protégée par la tour h7. Le roi ne peut ni prendre, ni fuir : f8 est occupée par sa propre tour, f7 est contrôlée par la tour g7.

PRO TIP : ce mat demande une case de fuite bouchée (ici f8). Si la colonne f est libre, les deux tours ne suffisent pas toujours : il faut alors l'aide d'une autre pièce, comme le fou h6 dans le chapitre « Kupferstich – Andreasen ». [%csl Rf8,Rf7] }`,
    ),
    chapter(
      "Attention à ta propre 1re rangée",
      "3r2k1/4RR1p/8/8/8/5P2/PPr3PP/6K1 w - - 11 37",
      `{ Position d'entraînement. Les Blancs ont quatre pions de plus et deux tours en 7e rangée : la partie est gagnée (Stockfish : environ +5,5). Mais les Noirs ont, eux aussi, une tour sur la 2e rangée et une tour sur la colonne d ouverte.

C'est l'envers de ce module : pendant que tes tours dévorent la 7e rangée, ta propre 1re rangée est vide. Le roi g1 est enfermé derrière ses pions g2 et h2, et la case f2 est contrôlée par la tour c2. Un seul échec sur la 1re rangée peut être mortel.

PRO TIP : avant de prendre un pion avec une tour en 7e rangée, demande-toi : « Si l'adversaire donne échec sur ma 1re rangée, que se passe-t-il ? » Un coup de pion (h3 ou h4) qui donne de l'air au roi vaut souvent plus qu'un pion. [%csl Rg1] [%cal Gd8d1] }
37. h4 { Le coup prudent : le pion donne une case de fuite (h2) au roi. Stockfish place 37.Rg7+ et 37.h4 au même niveau (+5,5). }
(37. Rxh7?? { Le pion h7 semble gratuit. Mais les Noirs menaçaient déjà Rd1+, et ce coup ne fait rien contre cette menace : c'est la faute qui perd tout de suite. } 37... Rd1+ { La tour noire donne échec sur la 1re rangée. Le roi g1 n'a aucune case : f2 est contrôlée par la tour c2, g2 et h2 sont occupées par ses pions. } 38. Re1 { Seule parade : la tour e7 revient s'interposer. } 38... Rxe1# { MAT. La tour prend la tour e1, et le roi est mat sur sa propre 1re rangée. [%csl Rg1] })
37... Rdd2 { Les Noirs doublent leurs tours sur la 2e rangée et menacent le pion g2. }
38. Rg7+ { La tour donne échec en g7, protégée par la tour e7 le long de la 7e rangée. }
38... Kh8 { Le roi va dans le coin. }
39. Rxh7+ { La tour prend h7 avec échec : maintenant le roi blanc ne risque plus rien, et les Blancs peuvent manger. }
39... Kg8 { Le roi remonte en g8, sa seule case. }
40. Reg7+ { La seconde tour donne échec en g7. }
40... Kf8 { Le roi s'échappe en f8 : ici la case f8 est libre, donc pas de mat des deux tours. }
41. Kh2 { Le roi utilise la case h2, créée par 37.h4 : il est à l'abri et protège g2. Les Blancs restent largement gagnants (+5,5).

PRO TIP : la 7e rangée de l'un est la 2e rangée de l'autre. Les mêmes idées valent dans les deux sens, alors surveille la tienne. }`,
    ),
    chapter(
      "Marshall – Capablanca : la 2e rangée, côté noir",
      "r2r2k1/pb3ppp/1pN5/8/4P3/2R5/PP3PPP/4R1K1 b - - 0 20",
      `{ New York 1918. Pour les Noirs, l'équivalent de la 7e rangée est la 2e rangée blanche. Capablanca, avec les Noirs, va y installer une tour, puis deux. Le matériel est égal (les Blancs ont un pion de plus, mais le cavalier c6 est attaqué par le fou b7), et la position est équilibrée.

À retenir : les mêmes idées valent pour les deux camps. Une tour noire en 2e rangée attaque les pions blancs non avancés (b2, f2, g2), et deux tours noires en 2e rangée menacent le roi blanc de mat.

PRO TIP : quand l'adversaire laisse une colonne ouverte, demande-toi si elle te mène à sa 2e rangée (ou 7e si tu as les Blancs). [%cal Gd8d2] }
20... Rd2 { La tour entre sur la 2e rangée blanche, par la colonne d ouverte. C'est le meilleur coup. Elle vise le pion b2 et le pion f2. [%cal Gd2b2,Gd2f2] }
21. Rb1 { La tour défend le pion b2. 21.Ne7+ était équivalent. }
21... Re8 { La seconde tour attaque le pion e4. C'est le meilleur coup. }
22. e5 { Le pion avance pour échapper à la tour. 22.a3 était un peu plus précis selon Stockfish. }
22... g5 { Capablanca lance son pion g : il veut ouvrir des lignes vers le roi blanc et faire venir une tour sur la colonne g. 22...g6 était un peu plus précis. }
23. h4 { Les Blancs attaquent le pion g5. 23.h3 était un peu meilleur. }
23... gxh4 { Le pion prend. C'est le meilleur coup. La colonne g est maintenant semi-ouverte pour les Noirs : seul le pion g2 blanc y reste. }
24. b4 { Le meilleur coup selon Stockfish (-0,3). Le pion quitte b2, où la tour d2 l'attaquait, et les Blancs gardent l'équilibre. }
(24. Re1? { Le coup de la partie est une erreur (-1,7 au lieu de -0,3). La tour défend le pion e5, mais elle abandonne la défense du pion b2 et de la 1re rangée. } 24... Re6 { La tour attaque le cavalier c6 et pourra basculer sur la colonne g. } 25. Rec1 { La tour revient défendre le cavalier. } 25... Kg7 { Le roi libère la 8e rangée et se rapproche de la colonne g. 25...a5 était un peu plus précis. } 26. b4 { Le pion b se met à l'abri de la tour d2. } 26... b5 { Le pion bloque le pion b4 et contrôle la case c4. } 27. a3 { Le pion protège b4. } 27... Rg6 { La tour vient sur la colonne g et attaque le pion g2 : le roi blanc va devoir le défendre. [%cal Gg6g2] } 28. Kf1 { Le roi défend g2. } 28... Ra2 { La tour attaque le pion a3 et le pion f2 le long de la 2e rangée. 28...a6 était plus précis (-1,7 contre -0,8). } 29. Kg1? { Une erreur grave (-3,2). } (29. e6! { La défense active : le pion e menace exf7. S'il est pris, le cavalier reviendra en d4 en gagnant un temps sur la tour. } 29... Rxe6 { La tour prend le pion. } 30. Nd4 { Le cavalier attaque la tour e6 et revient en défense : les Noirs ne sont que légèrement mieux (-0,8). }) 29... h3 { Le pion attaque g2 : la menace est hxg2, et la colonne g s'ouvrirait sur le roi. } 30. g3 { Le pion avance pour ne pas être pris. Le meilleur coup. } 30... a6 { Le pion protège b5. 30...Rd2 était un peu plus fort. } 31. e6 { Les Blancs rendent le pion e pour tenter de libérer leur jeu. 31.Rc5 résistait mieux. } 31... Rxe6 { La tour élimine le pion e6. } 32. g4 { Le pion g s'avance. } 32... Rh6 { La tour soutient le pion h3. } 33. f3 { Le pion protège g4. } 33... Rd6 { La tour se dirige vers la 2e rangée par la colonne d. } 34. Ne7 { Le cavalier cherche des échecs. } 34... Rdd2 { LES DEUX TOURS NOIRES SONT SUR LA 2e RANGÉE. Avec le pion h3, elles enferment le roi blanc. [%csl Ga2,Gd2] } 35. Nf5+ { Le cavalier donne échec. } 35... Kf6 { Le roi s'avance. 35...Kg6 était encore plus fort. } 36. Nh4 { Le cavalier revient défendre. } 36... Kg5 { Le roi attaque le cavalier h4 et le pion g4. } 37. Nf5 { Le cavalier s'écarte. } 37... Rg2+ { La tour donne échec sur la 2e rangée. } 38. Kf1 { Le roi fuit vers f1. } 38... h2 { Le pion menace d'aller à dame. } 39. f4+ { Les Blancs donnent un dernier échec. } 39... Kxf4 { Marshall abandonne : le pion h va faire dame, et les tours noires sur la 2e rangée préparent le mat. })
24... Bxc6 { Le fou prend le cavalier. }
25. Rxc6 { La tour reprend. }
25... Rxe5 { La tour prend le pion e5. Les Noirs ont maintenant un pion de plus. }
26. a4 { Le pion a s'éloigne de la tour d2. }
26... Rf5 { La tour attaque f2, déjà visé par la tour d2. }
27. Rf1 { La tour défend f2. }
27... Ra2 { La tour revient sur le pion a4. Les Noirs ont un pion de plus et une tour active sur la 2e rangée, mais les Blancs tiennent (Stockfish : -0,3).

PRO TIP : une tour adverse sur ta 2e rangée t'oblige à défendre tes pions un par un. Même sans perte immédiate, c'est une gêne permanente. }`,
    ),
    chapter(
      "Rubinstein – Duras : la tour en 7e et les pions passés",
      "5k2/6p1/p4pp1/4p3/1P4P1/P3P3/3K1P1r/2R5 w - - 0 25",
      `{ 1908. Finale de tours. Le matériel est égal, mais les Blancs ont deux pions liés à l'aile dame (a3 et b4) contre un seul pion noir (a6). La tour noire est déjà active sur la 2e rangée, où elle attaque f2.

Rubinstein va montrer une autre utilité de la tour en 7e rangée : en finale, elle COUPE le roi adverse sur la dernière rangée, et l'empêche de venir arrêter les pions passés.

PRO TIP : en finale de tours, une tour en 7e rangée vaut souvent un pion. Elle immobilise le roi adverse loin des pions passés. [%cal Gc1c7] }
25. Ke2 { Le roi protège le pion f2, attaqué par la tour h2. C'est le meilleur coup. }
25... f5 { Le meilleur coup selon Stockfish (+2,8) : le pion attaque g4 pour échanger un pion de l'aile roi. }
(25... e4? { Le coup de la partie est une erreur (+4,1 au lieu de +2,8). Le pion avance sans but, et les Blancs ont le temps d'activer leur tour. } 26. Rc6 { La tour attaque a6 et f6 le long de la 6e rangée. C'est le meilleur coup. } 26... Rg2 { La tour attaque g4 et f2. } 27. Rxa6 { La tour prend a6 : les deux pions blancs de l'aile dame deviennent passés. 27.a4 était équivalent. } 27... Rxg4 { La tour reprend un pion. } 28. Ra7! { La tour saisit la 7e rangée. Elle attaque g7, et le roi f8 ne peut plus monter par e7 ou f7 : il est coupé des pions blancs de l'aile dame. [%cal Ga7g7] [%csl Re7,Rf7] } 28... Rg1 { La tour part attaquer les pions blancs par derrière. } 29. b5 { Le pion avance. 29.a4 était aussi fort. } 29... Rb1 { La tour se place derrière le pion b. } 30. a4 { Le pion a protège le pion b5. } 30... g5 { Les Noirs avancent leurs pions, faute de mieux. 30...f5 était un peu plus tenace. } 31. Rb7 { La tour reste en 7e rangée et se place devant le pion b, sur sa route. 31.Kd2, qui chasse la tour b1 avec le roi, était plus précis. } 31... Ra1 { La tour passe derrière le pion a4 pour l'attaquer. } 32. b6 { Rubinstein laisse le pion a4 : un seul pion passé suffit, s'il est soutenu par la tour. } 32... Rxa4 { La tour s'empare du pion a4. } 33. Ra7! { La tour revient en a7 et propose l'échange : si 33...Rxa7, 34.bxa7 et le pion fait dame, le roi f8 est trop loin. } 33... Rb4 { La tour revient se placer derrière le pion b6. } 34. b7 { Le pion arrive en 7e rangée. } 34... g4 { Les Noirs n'ont plus de défense. } 35. Ra8+ { La tour donne échec : le roi doit quitter la 8e rangée. } 35... Kf7 { Le roi quitte la 8e rangée. } 36. b8=Q { Le pion fait dame. } 36... Rxb8 { La tour prend la nouvelle dame... } 37. Rxb8 { ...et la tour a8 reprend : la tour placée sur la même rangée que la case de promotion a fait tout le travail. } 37... Ke6 { Le roi noir s'approche. } 38. Re8+ { La tour donne échec. } 38... Kf5 { Le roi avance vers les pions. } 39. Kf1 { Duras abandonne : avec une tour de plus, les Blancs gagneront facilement les pions noirs. })
26. g5 { Le pion évite l'échange. C'est le meilleur coup. }
26... Rg2 { La tour attaque le pion g5 par la colonne g, et le pion f2. }
27. Rc6 { La tour abandonne g5 pour attaquer a6 et g6 le long de la 6e rangée. }
27... Rxg5 { La tour prend g5. }
28. Rxa6 { La tour prend a6 : les pions a3 et b4 sont désormais passés. }
28... Rg1 { La tour se place sur la 1re rangée, pour attaquer les pions blancs par derrière. }
29. a4 { Le pion a avance. Les Blancs restent nettement mieux (+2,8) grâce à leurs deux pions passés liés.

PRO TIP : deux pions passés liés, soutenus par une tour active, valent souvent plus qu'une tour adverse passive. }`,
    ),
    chapter(
      "Smyslov – Reshevsky : la tour en 7e, derrière le pion passé",
      "r6k/1pB3p1/p2pp2p/2n1p3/4P3/2P3P1/PP3P1P/3R2K1 w - - 3 30",
      `{ Championnat du monde 1948. Le fou c7 et la tour d1 sont très actifs, les pions noirs d6 et e6 sont faibles, et le roi h8 est loin du centre. Les Blancs sont nettement mieux (Stockfish : environ +2).

Ce chapitre réunit deux règles de finale de tours. 1) Une tour en 7e rangée garde le roi adverse enfermé sur la dernière rangée. 2) Contre un pion passé adverse, la place de la tour est DERRIÈRE lui : depuis a7, la tour blanche suivra le pion noir jusqu'à a1, tout en restant sur la 7e rangée. En face, la tour noire, placée DEVANT son propre pion, sera passive.

PRO TIP : en finale de tours, une tour derrière un pion passé (le sien ou celui de l'adversaire) est presque toujours mieux placée qu'une tour devant lui. }
30. Rxd6 { La tour prend le pion d6 et attaque e6. Stockfish place 30.Re1 et 30.Rxd6 au même niveau (+2,1). }
30... Rc8 { La tour attaque le fou c7. C'est le meilleur coup. }
31. Bb6 { Le fou s'écarte en attaquant le cavalier c5. 31.Ba5 était à peine plus précis. }
31... Na4 { Le cavalier attaque le fou b6 et les pions b2 et c3. C'est le meilleur coup. }
32. Rxe6 { La tour prend un deuxième pion et attaque e5. }
32... Nxb2 { Le cavalier prend b2. 32...Kg8 était un peu plus précis (Stockfish, profondeur 22 : +2,2 contre +2,7). }
33. Rxe5 { La tour prend un troisième pion. }
33... Nc4 { Le cavalier attaque à la fois le fou b6 et la tour e5 : une fourchette. }
34. Re6 { La tour se dégage en attaquant h6. Le fou b6 va être échangé contre le cavalier. }
34... Nxb6 { Le cavalier prend le fou. 34...Kg8 était un peu plus précis. }
35. Rxb6 { La tour reprend le cavalier, et elle attaque maintenant b7 et a6. }
35... Rxc3 { La tour prend le pion c3. }
36. Rxb7 { LA TOUR EST EN 7e RANGÉE. Elle a pris b7, elle attaque g7, et le roi h8 est enfermé derrière ses pions g7 et h6. [%cal Gb7g7] }
36... Rc2 { La tour noire part à son tour sur la 2e rangée blanche, et attaque a2 et f2. }
37. h4 { Smyslov abandonne le pion a2 : il préfère avancer son pion h en h5 pour bloquer le roi noir. 37.a3 était un peu plus précis. }
37... Rxa2 { La tour prend a2. Les Noirs ont maintenant un pion passé en a6. }
38. Kg2 { Le roi protège f2. 38.h5 tout de suite était un peu plus précis. }
38... a5 { Le pion passé avance. 38...h5, pour libérer le roi, résistait mieux (+3,4 au lieu de +4,3). }
39. h5 { Le pion bloque l'aile roi : le pion h6 est fixé, et le roi noir n'a plus de place. [%csl Gh5] }
39... a4 { Le pion continue sa course. }
40. Ra7 { La tour se place DERRIÈRE le pion passé noir, tout en restant en 7e rangée. Elle surveille le pion a4 jusqu'à la case a1, et garde l'œil sur g7. [%cal Ga7a1,Ga7g7] }
40... Kg8 { Le roi essaie de sortir de son coin. }
41. g4 { Le pion protège h5. 41.Kf3 était un peu plus précis. }
41... a3 { Le pion avance. Mais la tour noire, en a2, est maintenant DEVANT son pion : elle ne peut plus guère bouger sans l'abandonner. }
42. Kg3 { Le roi se dirige vers le centre et vers le pion passé. }
42... Re2 { La tour quitte sa place pour attaquer e4. }
43. Kf3 { Le roi attaque la tour, et protège e4 et f2. }
43... Ra2 { La tour retourne devant le pion a3 : elle n'a rien de mieux. }
44. Ke3 { Le roi poursuit sa route. 44.e5 était un peu plus précis. }
44... Kf8 { Le roi noir s'approche du centre. }
45. f3 { Le pion protège e4 et le roi s'apprête à passer par f4. }
45... Ra1 { La tour libère la case a2 pour le pion. }
46. Kf4 { Le roi s'avance vers f5 et g6, vers le roi noir. }
46... a2 { Le pion arrive en a2, à un pas de la promotion. Mais la tour a7, derrière lui, le tient. }
47. e5 { Le pion e avance : les Blancs créent un deuxième front. }
47... Kg8 { Le roi retourne en g8, faute de mieux. }
48. Kf5 { Le roi arrive près du roi noir. }
48... Rf1 { La tour attaque le pion f3. }
49. Rxa2 { La tour prend enfin le pion a2. Elle était derrière lui depuis le début : il suffisait d'attendre qu'il avance. }
49... Rxf3+ { La tour prend f3 avec échec. }
50. Kg6 { Le roi entre en g6 et menace Ra8 mat : le roi g8 n'aurait plus aucune case, puisque f7 et h7 sont contrôlées par le roi blanc. 50.Ke6 était un peu plus précis. [%cal Ga2a8] }
50... Kf8 { Le roi s'écarte de la menace de mat. }
51. Ra8+ { La tour donne échec sur la 8e rangée. }
51... Ke7 { Le roi monte en 7e rangée. }
52. Ra7+ { Reshevsky abandonne. La tour revient en 7e rangée avec échec : le roi doit s'écarter, et la tour prendra le pion g7. Les pions blancs de l'aile roi iront ensuite à dame.

PRO TIP : derrière le pion passé adverse, ta tour n'a qu'à attendre. Plus le pion avance, plus la tour adverse devant lui devient passive. }`,
    ),
  ],
};
