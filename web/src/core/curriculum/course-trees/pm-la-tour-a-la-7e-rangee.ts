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
(36... Rf3? { Le coup de la partie est une erreur (Stockfish : +4,6 au lieu de +2,9). La tour prend f4, mais elle ne surveille plus la colonne c ni la 6e rangée, et le roi blanc va atteindre f6. } 37. g6! { Le pion avance avec un plan précis : Kg5 puis Kf6, et mat en h8. } 37... Rxf4+ { La tour prend le pion avec échec. } 38. Kg5 { Le roi attaque la tour et le pion f5. } 38... Re4 { La tour s'écarte et attaque le pion d4. } 39. Kf6! { Le roi arrive en 6e rangée. Menace : Rh8 mat, car les cases e7, f7 et g7 sont toutes contrôlées par le roi et le pion g6. [%csl Re7,Rf7,Rg7] [%cal Gh7h8] } 39... Kg8 { La meilleure défense contre le mat : le roi attaque la tour h7. } 40. Rg7+ { La tour reste en 7e rangée avec échec. 40.Rh3 était à peine plus précis. } 40... Kh8 { Le roi va dans le coin. 40...Kf8 était équivalent. } 41. Rxc7 { La tour prend le premier pion, toujours sur la 7e rangée. Menace : Rc8+, et le roi h8 n'a plus aucune case de fuite. } 41... Re8 { La tour protège la dernière rangée contre le mat. } 42. Kxf5 { Le roi prend le deuxième pion. Stockfish préférait 42.Kf7, encore plus direct, mais la position est gagnée. } 42... Re4 { La tour attaque d4. 42...a5 résistait un peu mieux. } 43. Kf6 { Le roi revient en f6, et les menaces sur la 8e rangée recommencent. } 43... Rf4+ { La tour donne échec pour gagner du temps. } 44. Ke5 { Le roi s'avance vers le pion d5. } 44... Rg4 { La tour attaque le pion g6. } 45. g7+ { Le pion avance avec échec, protégé par la tour c7 le long de la 7e rangée. } 45... Kg8 { Le roi bloque le pion. } 46. Rxa7 { La tour prend le troisième pion, toujours sur la 7e rangée, qui protège aussi le pion g7. } 46... Rg1 { La tour s'éloigne pour donner des échecs. } 47. Kxd5 { Le roi prend le quatrième pion. Les Blancs ont maintenant deux pions passés. } 47... Rc1 { La tour coupe le roi blanc de la colonne c. } 48. Kd6 { Le roi soutient l'avance du pion d. } 48... Rc2 { La tour attend. 48...Ra1 tenait un peu plus longtemps. } 49. d5 { Le pion avance, protégé par le roi. } 49... Rc1 { La tour garde la colonne c. } 50. Rc7 { La tour chasse la tour noire de la colonne c. } 50... Ra1 { La tour attaque le pion a4. } 51. Kc6 { Le roi attaque b6. } 51... Rxa4 { La tour prend le pion a4. } 52. d6 { Tartakower abandonne : le pion d va à dame, soutenu par le roi et la tour, et le pion g7 garde le roi noir prisonnier de la 8e rangée. })
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
23. Rxb7 { La tour prend b7 et attaque a7. }
23... Bxb2 { Le fou récupère un pion. }
24. Rxa7 { La tour prend un deuxième pion sur la 7e rangée. }
24... Be5 { Le fou revient au centre et attaque le pion h2. }
25. h3 { Le pion se met à l'abri. Les Blancs ont deux pions de plus (+2,0) : la tour a nettoyé la 7e rangée.

PRO TIP : quand la tour entre en 7e rangée, compte les pions qu'elle peut prendre « en enfilade ». Ici, b7 puis a7 sont tombés en deux coups. }`,
    ),
    chap