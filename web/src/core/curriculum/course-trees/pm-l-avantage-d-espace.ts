import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « L'avantage d'espace » (positional_mastery, module 13) — format
 * « un commentaire par coup » du 2026-10-12.
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, entièrement
 * réécrite ici) : Botvinnik – Vidmar (Groningue 1946), Smyslov – Rudakovsky
 * (Moscou 1945), Rubinstein – Schlechter (San Sebastián 1912), Schlechter –
 * John (Barmen 1905) et Bondarevsky – Smyslov (1946), tels que présentés dans
 * « Logical Chess: Move by Move » de Chernev. Les chapitres d'ouverture
 * (Est-Indienne, française d'avance, bind Maróczy, Benoni moderne) sont des
 * lignes théoriques sans source, choisies d'après les structures types de
 * « Chess Structures » (Flores Rios) et l'étude Lichess « Maroczy bind »
 * (XMg7ibgu), puis vérifiées coup par coup.
 *
 * Plan : définition, deux chaînes de pions qui partagent l'échiquier (1) ;
 * le syndrome du manque d'espace et sa conversion, Botvinnik – Vidmar (2, 3) ;
 * l'espace qui devient attaque, Smyslov – Rudakovsky (4, 5) ; le principe des
 * deux faiblesses, Schlechter – John (6) ; l'espace en finale, Rubinstein –
 * Schlechter (7) ; la défense : échanger (8), rompre la chaîne (9), échanger
 * la bonne pièce puis rompre (10) ; ne pas offrir d'espace (11).
 *
 * Toutes les lignes ont été rejouées avec chess.js et chaque coup sondé avec
 * Stockfish 18 (profondeur 18, 3 candidats par coup). Règle appliquée : quand
 * un coup perd environ 0,5 pion ou plus par rapport au choix du moteur, la
 * LIGNE PRINCIPALE suit le moteur et la suite de la partie passe en
 * variante, signalée comme fautive. Exception : dans une position déjà
 * décisive (plus de +3 environ), un écart est seulement signalé dans le
 * commentaire. C'est pourquoi les chapitres 3, 5 et 6 commencent à un moment
 * où la position est déjà gagnante, et le chapitre 7 au 18e coup (après
 * 17...Nf6, une imprécision noire signalée dans l'introduction). Les
 * évaluations citées sont du point de vue des Blancs. Aucun résultat de
 * partie (1-0, 0-1…) dans les variantes : le parseur s'y arrêterait.
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

export const L_AVANTAGE_D_ESPACE: CourseTree = {
  chapters: [
    chapter(
      "Définition : des pions avancés qui partagent l'échiquier",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      `{ L'ESPACE, c'est le nombre de cases dont tes pièces disposent derrière tes pions. Un pion avancé (en d5 ou en e5 pour les Blancs) contrôle des cases dans le camp adverse et repousse les pièces ennemies vers leurs trois dernières rangées. Derrière lui, tes pièces peuvent manœuvrer librement.

Comment repérer qui a plus d'espace ? Compte les rangées franchies par les pions, et regarde surtout les pions BLOQUÉS au centre : ils fixent la structure pour longtemps.

Ce chapitre montre le cas le plus célèbre : la Défense Est-Indienne, variante classique. Après d4-d5, le centre se ferme et l'échiquier se coupe en deux. Les Blancs ont plus d'espace à l'aile dame, les Noirs à l'aile roi. Chacun attaque là où il a de la place.

PRO TIP : une chaîne de pions bloquée « pointe » vers une aile. Tu as plus d'espace du côté où pointe ta chaîne, et c'est là que tu dois jouer. }
1. d4 { Le pion dame prend le centre. Un des meilleurs coups selon Stockfish, à égalité avec 1.e4. }
1... Nf6 { Le cavalier se développe et contrôle e4. Le meilleur coup. }
2. c4 { Le pion c prend de l'espace et contrôle d5. Un des meilleurs coups. [%cal Gc4d5] }
2... g6 { Les Noirs préparent le fianchetto du fou en g7. Un des trois meilleurs coups. }
3. Nc3 { Le cavalier se développe et prépare e4. Le meilleur coup. }
3... Bg7 { Le fou se place sur la grande diagonale. Les Noirs laissent les Blancs occuper le centre pour l'attaquer plus tard. 3...d5 (la Grünfeld) était un rien plus précis. }
4. e4 { Les Blancs prennent tout le centre avec trois pions (c4, d4, e4). Le meilleur coup (+0,6). [%csl Gc4,Gd4,Ge4] }
4... d6 { Le pion contrôle e5 et prépare ...e5. Le meilleur coup. }
5. Nf3 { Le cavalier se développe. Aussi bon que 5.h3. }
5... O-O { Le roi se met à l'abri. Le meilleur coup. }
6. Be2 { Le fou se développe. Le meilleur coup. }
6... e5 { Les Noirs attaquent d4. Ils prennent leur part du centre. Le meilleur coup. [%cal Ge5d4] }
7. O-O { Le roi blanc se met à l'abri. Le meilleur coup. }
7... Nc6 { La variante de Mar del Plata : le cavalier attaque d4 une deuxième fois. Stockfish préférait de peu 7...exd4, mais l'écart est faible (0,1). [%cal Gc6d4] }
8. d5 { LE MOMENT-CLÉ. Le pion d avance en d5 et attaque le cavalier c6. Le centre est maintenant FERMÉ : pions blancs en d5 et e4, pions noirs en d6 et e5. Le pion d5 contrôle c6 et e6 : les pièces noires n'y viendront plus. Le meilleur coup (+0,75). [%csl Gd5,Ge4,Rd6,Re5][%cal Gd5c6,Gd5e6] }
8... Ne7 { Le cavalier recule. Le meilleur coup. Regarde les deux chaînes de pions. La chaîne blanche (e4-d5) pointe vers l'aile dame : c'est là que les Blancs ont de l'espace. La chaîne noire (d6-e5) pointe vers l'aile roi : c'est là que les Noirs ont de l'espace. [%cal Ge4d5,Re5f4] }
9. Ne1 { Le cavalier recule pour libérer la route du pion f (f3) et rejoindre d3, d'où il soutiendra c5. 9.b4 était un rien plus précis, mais l'idée est la même. [%cal Ge1d3] }
9... Nd7 { Le cavalier libère la case f6 pour préparer ...f5. 9...Ne8 était un peu plus précis selon Stockfish. [%cal Gf7f5] }
10. Nd3 { Le cavalier arrive en d3. Il contrôle c5 et f4. Un des trois meilleurs coups. [%cal Gd3c5] }
10... f5 { La poussée noire à l'aile roi : les Noirs prennent de l'espace du côté où pointe leur chaîne. Le meilleur coup. [%cal Gf5f4] }
11. Bd2 { Le fou se développe. 11.f3 était un peu plus précis (+0,7 contre +0,35), sans changer la nature de la position. }
11... Nf6 { Le cavalier revient en f6, pour contrôler e4 et soutenir la poussée ...g5. 11...fxe4 était aussi possible. }
12. f3 { Le pion soutient e4 et ferme la porte de l'aile roi. Le meilleur coup (+0,65). [%csl Ge4] }
12... f4 { Le pion f avance encore. Il gagne de l'espace à l'aile roi et prépare ...g5-g4. Le centre est complètement bloqué. Un des meilleurs coups. [%cal Gg7g5,Gg5g4] }
13. c5 { La réponse blanche à l'aile dame : le pion c attaque d6, la base de la chaîne noire. 13.a4 était un rien plus précis. [%cal Gc5d6] }
13... g5 { Les Noirs poursuivent leur avancée à l'aile roi. Un des meilleurs coups. [%cal Gg5g4] }
14. Rc1 { La tour se place sur la colonne c, qui va s'ouvrir. Un des meilleurs coups. }
14... Ng6 { Le cavalier se rapproche de l'aile roi (h4, f4). Le meilleur coup. }
15. Nb5 { Le cavalier vise c7 et a7. Les Blancs gardent la tension à l'aile dame. Le meilleur coup (+0,7). [%cal Gb5c7] }
(15. cxd6 { Ouvrir la colonne c tout de suite est moins précis : les Blancs relâchent la pression sur d6 (Stockfish : +0,2 au lieu de +0,7). } 15... cxd6 { Le pion c reprend : la colonne c est ouverte. Le meilleur coup. } 16. Nb5 { Le cavalier vise c7 et d6. Un des meilleurs coups. } 16... Rf7 { La tour défend c7 par la 7e rangée. La position est presque égale (+0,2). })
15... Rf7 { La tour protège c7 le long de la 7e rangée. Le meilleur coup. [%cal Gf7c7] }
16. Ba5 { Le fou attaque le pion c7, défendu par la tour. Il gêne les pièces noires. Le meilleur coup (+0,6). [%cal Ga5c7] }
16... b6 { Le pion chasse le fou. Le seul bon coup : les autres étaient nettement moins bons selon Stockfish (+1,6 ou plus). }
17. cxd6 { Maintenant, la colonne c s'ouvre au bon moment. Le meilleur coup. }
17... cxd6 { Le pion reprend. Le meilleur coup. }
18. Be1 { Le fou recule vers f2, où il défendra le roque. Le meilleur coup (+0,6). }
18... g4 { Les Noirs lancent leur attaque à l'aile roi. 18...Bh6 était équivalent. La course est lancée : les Blancs à l'aile dame (colonne c, case c7), les Noirs à l'aile roi (...g4, ...gxf3). Stockfish donne un léger avantage blanc (+0,6).

PRO TIP : dans un centre fermé, chacun a de l'espace sur une aile. Joue sur la tienne, vite, et ne perds pas de temps sur l'aile de l'adversaire. }
`,
    ),
    chapter(
      "Botvinnik – Vidmar (1) : le syndrome du manque d'espace",
      "2kr3r/ppp2ppp/1nb1p3/8/3PP3/PP2KPP1/3N3P/R1R2B2 w - - 0 23",
      `{ Groningue 1946. Les dames ont été échangées dès le 7e coup, et pourtant les Blancs ont un avantage net (+1,8). Pourquoi ?
• Les pions blancs d4, e4 et f3 tiennent le centre. Aucun pion noir n'a dépassé la 6e rangée.
• Le roi blanc, en e3, est une pièce active. Le roi noir, en c8, n'a que la 8e rangée.
• Les pièces noires n'ont pas de bonnes cases au centre : d5, e5, c5 et f5 sont toutes surveillées par les pions blancs.

Botvinnik va maintenant pousser ses pions de l'aile dame (a4-a5-a6) pour chasser le cavalier b6 et prendre encore plus d'espace. Regarde bien ce qui arrive aux pièces noires : elles reculent l'une après l'autre jusqu'à la 8e rangée, où elles se gênent mutuellement. C'est le SYNDROME DU MANQUE D'ESPACE.

PRO TIP : le camp à l'étroit souffre surtout quand il a beaucoup de pièces. Elles se disputent les rares bonnes cases, et chaque manœuvre en bloque une autre. [%csl Gd4,Ge4,Gf3,Ge3][%cal Ga3a4,Ga4a5] }
23. a4 { Le pion a avance. Il menace a5, qui chassera le cavalier b6 de sa seule bonne case. Le meilleur coup (+1,8). [%cal Ga4a5,Ga5b6] }
23... Be8 { Le fou recule sur la 8e rangée. Stockfish préférait de peu 23...f5, qui cherche du jeu au centre (0,05 d'écart). }
24. a5 { Le pion attaque le cavalier b6. Le meilleur coup (+1,9). [%cal Ga5b6] }
24... Na8 { Le cavalier recule dans le coin. C'est le seul bon coup : 24...Nd5+? 25.exd5 perd une pièce, et 24...Nd7 était un peu pire. Le cavalier a8 n'a presque plus de cases. [%csl Ra8] }
25. a6 { Le pion avance encore et attaque b7. Il s'installe en a6 comme une épine dans le camp noir : il contrôle b7, et le roi noir ne peut plus s'y réfugier. Un des meilleurs coups. [%csl Ga6][%cal Ga6b7] }
25... b6 { Le pion b évite la prise. Le meilleur coup, mais la case c6 devient faible. 25...b5 était pire (+2,5). }
26. b4 { Le pion b avance à son tour et prépare b5, pour prendre encore plus d'espace à l'aile dame. Le meilleur coup (+1,9). [%cal Gb4b5] }
26... c6 { Le pion contrôle b5 et d5. Les Noirs essaient de freiner l'avance blanche. Le meilleur coup selon Stockfish. [%cal Gc6b5] }
(26... Kb8 { Le coup de la partie. Le roi se place à côté de son cavalier a8 : les deux pièces se gênent dans le coin. Un peu moins précis que 26...c6 (Stockfish : +2,2 au lieu de +1,7). } 27. Rc3 { Le coup de la partie, une imprécision : la tour se prépare à doubler sur la colonne c, mais les Blancs laissent échapper une bonne partie de leur avantage (+1). } (27. b5 { Le meilleur coup : le pion contrôle c6, et l'étau se resserre (+2,3). } 27... Rc8 { La tour défend c7. Les Noirs n'ont toujours aucun plan actif. }) 27... c6 { Le pion ferme la colonne c. Le meilleur coup. } 28. Rac1 { La deuxième tour vient sur la colonne c. 28.Bd3 était un rien plus précis. } 28... f6 { Le pion contrôle e5 et prépare ...e5 pour libérer le jeu noir. Le meilleur coup. L'avantage blanc reste net (+0,85), et Botvinnik a fini par l'emporter : la suite est dans le chapitre suivant. })
27. b5 { Les Blancs gardent l'initiative : le pion b5 attaque c6. Le meilleur coup (+1,8). [%cal Gb5c6] }
27... Nc7 { Le cavalier sort enfin du coin. C'est sa première bonne case depuis plusieurs coups. Le meilleur coup. }
28. Rc2 { La tour se place sur la colonne c, face au pion c6. Un des meilleurs coups. }
28... e5 { LA RÉPONSE DU CAMP À L'ÉTROIT : une rupture centrale. Le pion e attaque d4 pour ouvrir des lignes. Le meilleur coup. [%cal Ge5d4] }
29. dxe5 { Les Blancs prennent. Le meilleur coup. }
29... c5 { Le pion c avance pour libérer la case c6 et ouvrir la diagonale du fou e8 vers b5. Les Blancs gardent un avantage net (+1,8) : le pion a6, l'espace et le roi actif comptent toujours.

Bilan du chapitre : en quatre coups de pion (a4, a5, a6, b4), les Blancs ont repoussé TOUTES les pièces noires sur la 8e rangée. Le cavalier en a8, le fou en e8, le roi en c8 : aucune ne peut s'activer sans en déranger une autre.

PRO TIP : pour étouffer l'adversaire, avance tes pions là où ses pièces cherchent des cases. Chaque pion qui avance retire deux cases à l'ennemi. }
`,
    ),
    chapter(
      "Botvinnik – Vidmar (2) : encaisser les dividendes de l'espace",
      "1kr4r/p1Rb2pp/Pp2pp2/1p6/3PP3/N3KPP1/7P/2R5 w - - 2 34",
      `{ Groningue 1946, suite. Entre le 27e et le 33e coup, les deux camps ont commis des imprécisions (voir la fin du chapitre précédent), mais le résultat est là : une tour blanche s'est installée en c7, sur la 7e rangée, et le pion a6 enferme le roi noir dans le coin.

Regarde le prix que les Noirs paient pour vingt coups d'étouffement : leur roi est coincé en b8, leur fou d7 est collé à la défense, leurs tours n'ont aucune colonne. Les Blancs, eux, ont une tour active, un pion a6 en pointe et un cavalier qui va bondir en b5. Stockfish évalue la position à environ +3 : elle est déjà décisive.

Dans ce chapitre, les écarts avec le moteur sont seulement signalés : la position est gagnante d'un bout à l'autre.

PRO TIP : un avantage d'espace ne gagne jamais tout seul. Il se TRANSFORME : en tour sur la 7e rangée, en pion passé, en attaque de mat. Ce chapitre montre les trois. [%csl Ga6,Gc7][%cal Gc7b7] }
34. Rb7+ { La tour donne échec en b7. Le roi n'a qu'une case : a8. Le meilleur coup (+3,1). [%cal Gb7b8] }
34... Ka8 { Le seul coup légal. Le roi est maintenant enfermé dans le coin par le pion a6 et la tour b7. }
35. Rxd7 { Botvinnik prend le fou et accepte de rendre sa tour c1. Il donne une tour contre un fou (une « qualité »), mais il garde sa tour sur la 7e rangée et va récupérer le pion b5 avec le cavalier. Le meilleur coup (+3,1). [%cal Gb7d7] }
35... Rxc1 { Les Noirs prennent la tour c1. Ils ont maintenant deux tours contre une tour et un cavalier. Le seul coup sensé. }
36. Nxb5 { Le cavalier prend b5 et arrive tout près du roi noir. Il contrôle a7 et c7, deux cases d'entrée vers le roi noir. Le meilleur coup (+3,4). [%cal Gb5c7] }
36... Rhc8 { La deuxième tour noire se met enfin en jeu, sur la colonne c. Le meilleur coup. }
37. Rxg7 { La tour ramasse le pion g7. Elle peut se promener librement sur la 7e rangée, car aucune pièce noire ne la conteste. Le meilleur coup (+3,5). [%cal Gd7g7] }
37... h6 { Le pion s'écarte de l'attaque de la tour. 37...h5 était un peu plus tenace (+3,5 contre +3,6). }
38. Rxa7+ { La tour prend le pion a7 avec échec. Le meilleur coup (+3,9). }
38... Kb8 { Le seul coup. }
39. Rb7+ { La tour revient en b7 pour redonner échec. Le meilleur coup (+4,1). }
39... Ka8 { Le seul coup. }
40. Ra7+ { Botvinnik répète les échecs pour gagner du temps à la pendule. Stockfish préférait 40.Re7 (+4,3 contre +4,2), mais l'écart ne change rien. }
40... Kb8 { Le seul coup. }
41. Rb7+ { Encore un échec. Le meilleur coup (+4,4). }
41... Ka8 { Le seul coup. }
42. g4 { Les Blancs prennent de l'espace à l'aile roi pour fixer les pions noirs. Stockfish préférait continuer avec 42.Ra7+ ou 42.Re7 (+4,5 contre +3,9) : la position reste gagnante, l'écart est seulement signalé. }
42... e5 { Les Noirs bloquent le centre. Une erreur : 42...Re1+ résistait mieux (Stockfish : +3,9 au lieu de +5,1). }
43. d5 { Le pion passe en d5 et devient un pion passé protégé par e4. Le meilleur coup (+5,1). [%csl Gd5] }
43... R1c5 { La tour attaque b5 et d5. Le meilleur coup. [%cal Gc5b5,Gc5d5] }
44. Ra7+ { Échec. Le meilleur coup (+5,5). }
44... Kb8 { Le seul coup. }
45. Rb7+ { Échec. Le seul bon coup : 45.d6 ou 45.Kf2 laisseraient tout filer. }
45... Ka8 { Le seul coup. }
46. Rxb6 { La tour prend le pion b6. Le pion a6 n'a plus aucun pion noir devant lui. 46.Ra7+ était aussi bon. }
46... Rb8 { La tour noire s'oppose à la tour blanche. Le meilleur coup. }
47. Rxb8+ { Botvinnik échange les tours : il a calculé que le pion a va coûter une pièce aux Noirs. Le meilleur coup (+5,5). }
47... Kxb8 { Le seul coup. }
48. a7+ { Le pion avance avec échec. Le meilleur coup. }
48... Kb7 { Le roi vient attaquer le pion a7. 48...Ka8 était encore pire. }
49. Nd6+ { Le cavalier donne échec et gagne un temps. Le meilleur coup (+5,4). [%cal Gd6b7] }
49... Kxa7 { Le roi prend le pion a7. }
50. Ne8 { Le cavalier attaque le pion f6. Le meilleur coup (+5,2). [%cal Ge8f6] }
50... Kb6 { Le roi tente de revenir. 50...h5 était plus tenace, mais rien ne sauve les Noirs. }
51. Nxf6 { Le cavalier prend f6. Les Blancs ont un pion passé protégé en d5 et trois pions contre un à l'aile roi (f3, g4, h2 contre h6). Le meilleur coup (+5,6). }
51... Rc3+ { Échec de la tour. }
52. Kf2 { Le roi s'abrite. Le meilleur coup. }
52... Rc7 { La tour revient défendre. 52...Rc8 était équivalent. }
53. h4 { Le pion h se prépare à soutenir g5. Le meilleur coup (+5,7). }
53... Rf7 { La tour attaque le cavalier f6. }
54. Nh5 { Le cavalier se replace en h5 en gardant g7 et f6. 54.Ng8 était un peu meilleur, mais tout gagne. }
54... Kc7 { Le roi noir est trop loin pour participer. }
55. g5 { La poussée de rupture : le pion g veut devenir passé. 55.Kg3 était un peu plus précis selon Stockfish. }
55... hxg5 { Les Noirs prennent. 55...Kd8 ne changeait pas le résultat. }
56. hxg5 { Le pion h reprend : le pion g5 est maintenant passé. Le meilleur coup (+6,8). [%csl Gg5] }
56... Rh7 { La tour prend la colonne h, derrière le roi blanc. }
57. Nf6 { Le cavalier attaque la tour h7 et contrôle la case g8, la case de promotion du pion g. Le meilleur coup (+7,3). [%cal Gf6g8,Gf6h7] }
57... Rh2+ { Échec. }
58. Kg3 { Le roi attaque la tour h2. Le meilleur coup. }
58... Rh1 { La tour recule. Le meilleur coup. }
59. Kg2 { Le roi attaque la tour une nouvelle fois. Le meilleur coup (+8,7). }
59... Rh8 { La tour revient en h8, devant le pion g. Stockfish préférait 59...Rh4, mais rien ne sauve plus les Noirs. }
60. g6 { Le pion file vers g7. Le cavalier f6 contrôle g8, et le roi noir est trop loin. Vidmar a abandonné ici.

Résume le chemin parcouru : des pions qui avancent à l'aile dame (a4-a5-a6), des pièces noires repoussées sur la 8e rangée, une tour blanche qui entre sur la 7e rangée, puis un pion passé. L'avantage d'espace a changé de forme trois fois avant de gagner.

PRO TIP : quand tu as plus d'espace, ne cherche pas à gagner tout de suite. Cherche la transformation suivante : une case d'entrée, une colonne, un pion passé. }
`,
    ),
    chapter(
      "Smyslov – Rudakovsky (1) : f5 ! gagner l'espace, et la réponse ...d5",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      `{ Moscou 1945, championnat d'URSS. Une partie célèbre, où un seul coup de pion (13.f5 !) donne aux Blancs l'avantage d'espace à l'aile roi.

La structure est typique de la Sicilienne : après ...e5, les Noirs ont un pion d6 en retard et un TROU en d5, une case qu'aucun pion noir ne peut plus contrôler. Smyslov va ajouter un pion en f5, qui retire e6 et g6 aux pièces noires.

Ce chapitre montre aussi la bonne défense, celle que Rudakovsky n'a pas trouvée : la rupture libératrice ...d5, qui supprime le trou d'un seul coup.

PRO TIP : un pion avancé sur le flanc (comme f5) vaut surtout par les cases qu'il retire à l'adversaire. Compte-les. [%csl Rd5][%cal Gf4f5] }
1. e4 { Le pion roi prend le centre. Le meilleur coup. }
1... c5 { La Défense sicilienne. Un des trois meilleurs coups. }
2. Nf3 { Le cavalier se développe et prépare d4. Le meilleur coup. }
2... e6 { Les Noirs préparent ...d5 ou ...d6. Le meilleur coup. }
3. d4 { Les Blancs ouvrent le centre. Aussi bon que 3.Nc3. }
3... cxd4 { Échange. Le meilleur coup. }
4. Nxd4 { Le cavalier reprend. Le meilleur coup. }
4... Nf6 { Le cavalier attaque e4. Presque aussi bon que 4...Nc6. [%cal Gf6e4] }
5. Nc3 { Le cavalier défend e4. Le meilleur coup. }
5... d6 { La structure Scheveningen : pions noirs en d6 et e6. Un des meilleurs coups. }
6. Be2 { Le fou se développe calmement. 6.g4 (l'attaque Keres) était plus ambitieux (+0,7 contre +0,45). }
6... Be7 { Le fou se développe. Le meilleur coup. }
7. O-O { Le roi se met à l'abri. 7.Be3 était un rien plus précis. }
7... O-O { Le roi noir aussi. Le meilleur coup. }
8. Be3 { Le fou se développe. Le meilleur coup. }
8... Nc6 { Le cavalier se développe. Le meilleur coup. }
9. f4 { Le pion f prend de l'espace à l'aile roi. Le meilleur coup. [%cal Gf4f5] }
9... Qc7 { La dame se développe. 9...e5 était un rien plus précis. }
10. Qe1 { La dame se prépare à passer à l'aile roi (g3). 10.Kh1 était un peu plus précis (+0,3 contre +0,1). [%cal Ge1g3] }
10... Nxd4 { Les Noirs échangent les cavaliers. Le meilleur coup. }
11. Bxd4 { Le fou reprend. Le seul bon coup. }
11... e5 { Le pion attaque le fou d4 et f4. Les Noirs prennent de l'espace au centre, mais ils créent un trou en d5 : plus aucun pion noir ne pourra contrôler cette case. Le meilleur coup. [%csl Rd5][%cal Ge5d4,Ge5f4] }
12. Be3 { Le fou recule. Aussi bon que 12.Bf2. }
12... Be6 { Le fou vient contrôler d5. Mais il va être chassé. 12...Bd7 était plus précis (0,05 contre +0,5). [%cal Ge6d5] }
13. f5 { LE COUP-CLÉ. Le pion chasse le fou e6 et gagne de l'espace à l'aile roi. Il retire les cases e6 et g6 aux pièces noires. Et sans le fou e6, la case d5 n'a plus de défenseur. Le meilleur coup (+0,5). [%csl Re6,Rg6,Rd5][%cal Gf5e6,Gf5g6] }
13... Bc4 { Le fou propose l'échange. 13...Bd7 était un peu plus précis (+0,5 contre +0,85). }
14. Bxc4 { Les Blancs échangent. Le meilleur coup. }
14... Qxc4 { La dame reprend. Le seul bon coup. }
15. Bg5 { Le fou vise le cavalier f6, le dernier défenseur de d5. S'il disparaît, le cavalier blanc s'installera en d5. Le meilleur coup (+0,75). [%cal Gg5f6,Gc3d5] }
15... Rac8 { La tour se place sur la colonne c, derrière sa dame, face au pion c2. Le meilleur coup. Les Noirs préparent la rupture ...d5. }
(15... Rfe8 { Le coup de la partie, une erreur (Stockfish : +1,45 au lieu de +0,75). La tour ne fait rien d'utile. } 16. Bxf6 { Le fou élimine le défenseur de d5. Le meilleur coup. } 16... Bxf6 { Le fou reprend. Le meilleur coup. } 17. Nd5 { Le cavalier s'installe en d5, d'où plus rien ne peut le chasser. Les Noirs n'ont plus aucun moyen de jouer ...d5. Avec le pion f5 et ce cavalier, les Blancs ont un avantage durable (+1,5). La suite est dans le chapitre suivant. [%csl Gd5,Gf5] })
16. Bxf6 { Le fou prend le cavalier. Le meilleur coup. }
16... Bxf6 { Le fou reprend. Le meilleur coup. }
17. Kh1 { Le roi s'écarte de la diagonale a7-g1, pour éviter les échecs de la dame noire en c5 ou d4. Le meilleur coup selon Stockfish. }
17... d5 { LA RUPTURE LIBÉRATRICE. Le pion d6 avance en d5 : le trou disparaît, et les Noirs donnent un pion, qu'ils vont regagner aussitôt en c2. Le meilleur coup. [%cal Gd6d5] }
18. Nxd5 { Le cavalier prend le pion d5. Le meilleur coup. }
18... Qxc2 { La dame prend le pion c2. Le matériel est égal, et les pièces noires respirent : colonne c ouverte, dame active. Le meilleur coup. }
19. Rf2 { La tour défend la 2e rangée. Le meilleur coup. }
19... Qa4 { La dame s'écarte de l'échange. Le meilleur coup. }
20. b3 { Le pion chasse la dame. Le meilleur coup. }
20... Qa3 { La dame reste active. Les Blancs gardent un petit avantage (+0,7) grâce au cavalier d5, mais les Noirs ont beaucoup plus de jeu que dans la partie.

PRO TIP : face à un trou dans ta structure, la meilleure défense est souvent une rupture de pion qui le fait disparaître, même au prix d'un pion. }
`,
    ),
    chapter(
      "Smyslov – Rudakovsky (2) : l'espace se transforme en attaque",
      "2rbr2k/p4ppp/3p4/1pqNpP2/4P3/1PP2R2/P5PP/R3Q2K w - - 5 22",
      `{ Moscou 1945, suite. Dans la partie, Rudakovsky n'a pas trouvé la rupture ...d5 du chapitre précédent : il a joué 15...Rfe8, et après 16.Bxf6 Bxf6 17.Nd5 Bd8 18.c3 b5 19.b3 Qc5+ 20.Kh1 Rc8 21.Rf3 Kh8, on arrive à la position du diagramme. (Au 19e coup, Stockfish préférait déjà 19.f6.)

Fais l'inventaire. Le cavalier d5 est intouchable : aucun pion ni aucune pièce mineure noire ne peut le chasser. Le pion f5 retire e6 et g6 aux pièces noires. Le fou d8 est coincé derrière ses pions. Les Noirs n'ont rien à faire, les Blancs ont toutes les cases pour amener leurs pièces vers le roi noir.

Stockfish évalue déjà la position à environ +3,6 : elle est décisive. Les écarts avec le moteur sont seulement signalés.

PRO TIP : quand le camp adverse est à l'étroit, ses pièces ne peuvent pas revenir défendre le roi à temps. C'est pour cela qu'un avantage d'espace se transforme si souvent en attaque. [%csl Gd5,Gf5,Rd8][%cal Gf5f6] }
22. f6 { Le pion f5 attaque g7 et ouvre des lignes vers le roi noir. Il menace fxg7+. Le meilleur coup (+3,6 à +4). [%cal Gf6g7] }
22... gxf6 { Une erreur qui ouvre la colonne g. 22...Bxf6 limitait les dégâts (Stockfish : +4 au lieu de +6,2). }
23. Qh4 { La dame arrive sur l'aile roi. Elle attaque le pion f6 et vise h7 par la colonne h. Le meilleur coup (+6,2). [%cal Gh4f6,Gh4h7] }
23... Rg8 { La tour vient sur la colonne g, pour défendre g7 et h7 de loin. Le meilleur coup. }
24. Nxf6 { Le cavalier prend f6 avec un double rôle : il attaque la tour g8 et il protège h7 pour la dame. La menace est Qxh7 mat. Le meilleur coup (+6,8). [%cal Gf6g8,Gh4h7] }
24... Rg7 { La tour défend h7 le long de la 7e rangée. 24...Bxf6 était équivalent. }
25. Rg3 { La tour blanche vient en face de la tour g7. Le meilleur coup (+6,8). [%cal Gg3g7] }
25... Bxf6 { Les Noirs éliminent le cavalier f6. Le meilleur coup. }
26. Qxf6 { La dame reprend en f6. Elle attaque la tour g7, déjà attaquée par la tour g3. Le meilleur coup (+7). [%cal Gf6g7,Gg3g7] }
26... Rg8 { La seconde tour vient protéger g7. Le meilleur coup. }
27. Rd1 { La dernière pièce blanche entre dans le jeu : la tour vise d6 et la 8e rangée. Le meilleur coup (+6,9). [%cal Gd1d6] }
27... d5 { Les Noirs n'ont plus de coup utile. 27...b4 ne sauvait rien non plus. }
28. Rxg7 { La tour prend g7. Si 28...Rxg7, la tour d1 prend d5 et s'apprête à descendre sur la 8e rangée. Rudakovsky a abandonné. Le meilleur coup (+7,4).

Compare les deux camps sur le diagramme final : toutes les pièces blanches sont à l'attaque, alors que les pièces noires n'ont jamais trouvé de case utile.

PRO TIP : avec plus d'espace, tu peux amener tes pièces vers le roi adverse plus vite que l'adversaire ne peut ramener les siennes pour le défendre. C'est là que l'avantage d'espace devient décisif. }
`,
    ),
    chapter(
      "Schlechter – John : jouer sur les deux ailes",
      "2b2rk1/1pn1r2p/p1p1pqp1/2PpN3/PP1P1PP1/2N2R2/2Q4P/5RK1 w - - 0 29",
      `{ Barmen 1905. Les Noirs ont choisi une défense « Stonewall » (pions d5, e6, f5), mais leur pion f a disparu et les Blancs ont pris de l'espace PARTOUT :
• à l'aile dame, les pions a4, b4 et c5 bloquent les pions noirs a6, b7 et c6 ;
• au centre, le cavalier e5 s'appuie sur d4 et f4 et ne peut pas être chassé ;
• à l'aile roi, les pions f4 et g4 sont prêts à avancer.

Stockfish évalue la position à environ +3,5 : elle est décisive. Dans ce chapitre, les écarts avec le moteur sont seulement signalés.

Le plan de Schlechter illustre le PRINCIPE DES DEUX FAIBLESSES. Le camp qui a plus d'espace déplace ses pièces plus vite d'une aile à l'autre. Il attaque d'abord à l'aile roi pour attirer les défenseurs, puis il ouvre un second front à l'aile dame, là où les Noirs ne peuvent plus revenir à temps.

PRO TIP : contre une bonne défense, une seule faiblesse ne suffit pas. Il en faut une seconde, loin de la première. [%csl Ge5,Gc5,Gb4][%cal Gg4g5,Gb4b5] }
29. Nd1 { Le cavalier c3 ne sert à rien à l'aile dame, qui est bloquée. Il part pour l'aile roi par e3, puis g4. Le meilleur coup (+3,5). [%cal Gd1e3,Ge3g4] }
29... Rg7 { La tour protège la 7e rangée et le pion g6. Presque aussi bon que 29...Ne8. }
30. Ne3 { Le cavalier arrive en e3, d'où il peut sauter en g4. 30.Qb1 était équivalent. }
30... Qe7 { La dame recule. 30...a5 était un peu plus actif, mais les Noirs n'ont plus de bon plan. }
31. g5 { Le pion g gagne encore une rangée. Il retire les cases f6 et h6 aux pièces noires. Le meilleur coup (+3,8). [%csl Rf6,Rh6][%cal Gg5f6,Gg5h6] }
31... Bd7 { Le fou se développe enfin. Le meilleur coup. }
32. N3g4 { Le deuxième cavalier approche du roi noir. Il vise h6 et f6. Le meilleur coup (+3,7). [%cal Gg4h6,Gg4f6] }
32... Be8 { Le fou vient défendre g6 et f7. Aussi bon que 32...Kh8. }
33. Nh6+ { Le cavalier s'installe en h6 avec échec. Le pion g5 le protège. Le meilleur coup (+3,7). }
33... Kh8 { Le seul coup légal. }
34. Qe2 { La dame se replace. 34.Rh3 était un peu plus précis, mais l'écart est minime. }
34... Qd8 { La dame noire reste en défense. }
35. Neg4 { Le cavalier e5 vient rejoindre l'autre en g4. Les deux cavaliers visent f6. 35.Rh3 était équivalent. [%cal Gg4f6] }
35... Bd7 { Le fou revient en d7. Le meilleur coup. }
36. Qe5 { La dame prend la case e5, laissée libre par le cavalier, et vise la grande diagonale vers h8. 36.Ne5 était un peu plus fort (+3,8 contre +3,4). [%cal Ge5h8] }
36... Ne8 { Le cavalier vient protéger g7 et f6. Le meilleur coup. }
37. Rh3 { La tour passe en h3, derrière le cavalier h6, pour renforcer l'aile roi. 37.Kh1 était aussi bon. }
37... Qc7 { Les Noirs proposent l'échange des dames. 37...Qc8 était un peu plus tenace. }
38. Nf6 { Le cavalier entre en f6. Il attaque le cavalier e8 et le fou d7. 38.Qe1 était un peu plus précis selon Stockfish. [%cal Gf6e8,Gf6d7] }
38... Qxe5 { Les Noirs échangent les dames, mais cela ouvre la colonne f aux Blancs. 38...Bc8 était plus tenace (+3,5 au lieu de +5). }
39. fxe5 { Le pion f reprend et ouvre la colonne f. Le meilleur coup (+5). [%cal Gf1f8] }
39... Re7 { La tour quitte la colonne g. Le meilleur coup. }
40. Rhf3 { La tour revient sur la colonne f. 40.Rff3 était un rien meilleur. }
40... Nxf6 { Les Noirs échangent le cavalier. 40...Ng7 tenait plus longtemps. }
41. Rxf6 { La tour reprend. Le meilleur coup (+6,3). }
41... Rxf6 { Échange des tours. Le meilleur coup. }
42. exf6 { Le pion reprend en f6. C'est un pion passé protégé, installé au cœur du camp noir. Le meilleur coup (+7,3). [%csl Gf6] }
42... Re8 { La tour se place devant le pion e6. Le meilleur coup. }
43. Nf7+ { Le cavalier donne échec. Le meilleur coup. }
43... Kg8 { Le seul coup. }
44. Ne5 { Le cavalier revient sur sa case centrale. Il attaque le fou d7. Le meilleur coup (+7). [%cal Ge5d7] }
44... Rd8 { La tour protège le fou. Le meilleur coup. }
45. Kg2 { Le roi blanc se met en route. 45.h4 était un peu meilleur. }
45... Kf8 { Le roi noir vient bloquer le pion f6. }
46. h4 { Le pion h avance pour soutenir g5. Le meilleur coup (+7,2). }
46... Be8 { Le fou protège f7. }
47. Kf3 { Le roi continue sa route. Ici, 47.f7! gagnait plus vite (+7,8 contre +4,9) : le pion menace de promouvoir. L'écart ne change pas le résultat. }
47... Bf7 { Le fou bloque le pion f. Le meilleur coup. }
48. Kf4 { Le roi s'approche encore. Le meilleur coup. }
48... Ke8 { Le roi noir se décentre. 48...Kg8 était un peu plus tenace. }
49. Rb1 { LE SECOND FRONT. Toutes les pièces noires sont attachées à l'aile roi : le roi et le fou bloquent le pion f6, la tour garde la 8e rangée. Schlechter amène sa tour à l'aile dame pour préparer b4-b5. Un des meilleurs coups (+6,4). [%cal Gb1b5] }
49... Kf8 { Le roi revient. Le meilleur coup. }
50. b5 { La rupture ouvre l'aile dame. Si 50...axb5 51.axb5, la colonne a s'ouvre, puis le pion b5 attaque c6. Les Noirs ne peuvent pas défendre les deux ailes à la fois. Le meilleur coup (+6,8). Schlechter a gagné peu après.

PRO TIP : quand une aile est bloquée et que les pièces adverses y sont attachées, ouvre une deuxième aile. Ton avantage d'espace te permet d'y amener tes pièces plus vite que l'adversaire. }
`,
    ),
    chapter(
      "Rubinstein – Schlechter : l'avantage d'espace en finale",
      "r1br2k1/2R2ppp/p3pn2/1p6/3PP3/3BKN2/P4PPP/1R6 w - - 4 18",
      `{ San Sebastián 1912. Les dames ont disparu dès le 11e coup, et pourtant Rubinstein a un net avantage. Le matériel est égal (six pions partout), mais regarde la place dont chaque camp dispose :
• les pions blancs d4 et e4 tiennent le centre ; les pions noirs e6 et f7 restent sur leurs 6e et 7e rangées ;
• la tour c7 est déjà installée sur la 7e rangée ;
• le roi blanc, en e3, est une pièce active. Le roi noir, en g8, ne sert à rien.

(Au 17e coup, Schlechter a joué 17...Nf6 ; Stockfish préférait 17...Nb6, qui gardait l'écart autour de +1,2. Ici, il est d'environ +2.)

Le plan de Rubinstein : gagner encore de l'espace à l'aile roi avec ses pions g, f et h, pour chasser le seul défenseur actif des Noirs, le cavalier f6.

PRO TIP : l'avantage d'espace ne disparaît pas avec les dames. En finale, il permet au roi et aux pièces d'entrer dans le camp adverse. [%csl Gc7,Ge3,Rf6][%cal Gg2g4,Gf2f4] }
18. Ne5 { Le cavalier se centralise. Avec la tour c7, il vise le pion f7. Le meilleur coup (+2,1). [%cal Ge5f7,Gc7f7] }
18... Bd7 { Le fou se place en d7 : il coupe la 7e rangée entre la tour c7 et le pion f7. Le meilleur coup. }
19. g4 { L'avancée commence. Le pion menace g5 pour chasser le cavalier f6. Le meilleur coup (+2). [%cal Gg4g5] }
19... h6 { Le pion contrôle la case g5 pour retarder la poussée. 19...g5 était un peu plus solide (+2,0 contre +2,3). [%csl Rg5] }
20. f4 { Le pion f soutient la poussée g5. Les pions blancs avancent en bloc, en se protégeant les uns les autres. Le meilleur coup (+2,3). [%cal Gf4g5] }
20... Be8 { Le fou protège f7. Presque aussi bon que 20...Rac8. }
21. g5 { La poussée arrive. Le cavalier f6 est attaqué. Le meilleur coup (+2,5). [%cal Gg5f6] }
21... hxg5 { Les Noirs prennent. Le meilleur coup. }
22. fxg5 { Le pion f reprend, et le cavalier est toujours attaqué. Le meilleur coup. Attention : 22.Rf1? aurait laissé échapper tout l'avantage (Stockfish : −1,1). }
22... Nh7 { Le cavalier recule au bord de l'échiquier. 22...Nh5 était aussi bon (+2,4 contre +2,5). }
23. h4 { Le pion h protège g5. Le cavalier h7 n'a plus qu'une case : f8. En f6, il serait pris par le pion g5. Le meilleur coup (+2,7). [%csl Rh7][%cal Gh4g5] }
23... Rdc8 { Les Noirs contestent la colonne c pour chasser la tour c7. 23...f6 était un rien plus actif. }
24. Rbc1 { L'autre tour soutient la tour c7. Le meilleur coup (+2,8). }
24... Rxc7 { Les Noirs échangent. Le meilleur coup. }
25. Rxc7 { La tour reprend et reste sur la 7e rangée. Le seul bon coup. }
25... Rd8 { La tour attaque d4. 25...Nf8 était un peu plus tenace. [%cal Gd8d4] }
26. Ra7 { La tour attaque le pion a6. 26.Re7 était un peu plus précis (+3,1 contre +2,6), mais l'idée reste la même. [%cal Ga7a6] }
26... f6 { Les Noirs tentent une rupture pour libérer leur jeu : c'est la bonne réaction du camp à l'étroit. Le meilleur coup. [%cal Gf6g5] }
27. gxf6 { Les Blancs prennent. Le meilleur coup (+2,8). }
27... gxf6 { Le pion g reprend. Le cavalier h7 respire un peu mieux, mais le roi noir est maintenant exposé. Le meilleur coup. }
28. Ng4 { Le cavalier attaque le pion f6 et la case h6. Le meilleur coup (+2,8). [%cal Gg4f6,Gg4h6] }
28... Bh5 { Le fou attaque le cavalier g4. Le meilleur coup. [%cal Gh5g4] }
29. Nh6+ { Le cavalier s'écarte avec échec. Le meilleur coup (+3,1). }
29... Kh8 { Le roi recule dans le coin. 29...Kf8 était pire (+5,2). }
30. Be2 { Le fou se prépare à contester la diagonale du fou h5. Aussi bon que 30.e5. }
30... Be8 { Le fou évite l'échange. Le meilleur coup. }
31. Rxa6 { La tour prend le pion a6. Stockfish préférait 31.Bg4, mais la position est décisive (+3) : l'écart est seulement signalé. }
31... Kg7 { Le roi attaque le cavalier h6. }
32. Ng4 { Le cavalier revient en g4, où il attaque f6. Le meilleur coup (+3). }
32... f5 { Le pion s'éloigne de l'attaque. Le meilleur coup. }
33. Ra7+ { La tour donne échec sur la 7e rangée. Le meilleur coup (+3,2). }
33... Kh8 { Le roi retourne dans le coin. Le meilleur coup. }
34. Ne5 { Le cavalier revient au centre, sur sa case idéale. Le meilleur coup (+3,3). }
34... fxe4 { Les Noirs prennent un pion. 34...Kg8 était un peu plus tenace. }
35. Bxb5 { Le fou prend le pion b5. Les Blancs ont maintenant un pion a passé. Le meilleur coup (+3,7). }
35... Nf6 { Le cavalier revient enfin au jeu. Le meilleur coup. }
36. Bxe8 { Rubinstein échange les fous. Stockfish préférait 36.Bc4 (+3,7 contre +3,1), mais tout gagne. }
36... Rxe8 { Le seul coup. }
37. Kf4 { Le roi blanc entre dans le jeu. 37.Ng6+ était un peu plus précis selon Stockfish. }
37... Kg8 { Une erreur dans une position déjà perdue : 37...Rg8 résistait plus longtemps (+3,4 au lieu de +5,2). }
38. Kg5 { Le roi s'avance vers les cases que les pions blancs ont conquises. Le meilleur coup (+5,2). [%cal Gf4g5,Gg5g6] }
38... Rf8 { La tour protège le cavalier f6. Le meilleur coup. }
39. Kg6 { Le roi blanc s'installe en g6, à côté du roi noir. Il prépare Rg7+ et Nf7+, contre lesquels les Noirs n'ont plus de défense. Schlechter a abandonné. Le meilleur coup (+6).

Le chemin de la victoire : les pions g, f et h ont avancé, le cavalier noir a été chassé au bord, puis le roi blanc a utilisé les cases conquises pour entrer chez l'adversaire.

PRO TIP : en finale, l'avantage d'espace sert surtout au ROI. Plus tes pions ont avancé, plus ton roi trouve de cases pour s'approcher du camp adverse. }
`,
    ),
    chapter(
      "La défense (1) : échanger pour respirer, le bind Maróczy",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      `{ Que faire quand c'est TOI qui manques d'espace ? Première réponse : échanger des pièces.

Le raisonnement est simple. Dix pièces dans un petit espace se gênent : elles se bloquent les cases, se marchent dessus, n'arrivent pas à se regrouper. Six pièces dans le même espace se sentent beaucoup mieux. Chaque échange donne plus de cases à celles qui restent.

Le camp qui a l'espace fait donc l'inverse : il ÉVITE les échanges, pour laisser l'adversaire étouffer avec toutes ses pièces.

Ce chapitre montre une structure typique : le « bind Maróczy » (pions blancs en c4 et e4) contre le Dragon accéléré. Les pions c4 et e4 contrôlent d5 et empêchent la rupture libératrice ...d5. Les Noirs vont chercher à échanger des pièces le plus vite possible.

PRO TIP : moins il reste de pièces, moins le manque d'espace se fait sentir. Pour le camp à l'étroit, un échange vaut souvent un coup de développement. [%csl Gc4,Ge4,Rd5] }
1. e4 { Le pion roi prend le centre. Le meilleur coup. }
1... c5 { La Défense sicilienne. Un des trois meilleurs coups. }
2. Nf3 { Le cavalier se développe et prépare d4. Le meilleur coup. }
2... Nc6 { Le cavalier se développe et contrôle d4. Un des meilleurs coups. }
3. d4 { Les Blancs ouvrent le centre. Un des trois meilleurs coups. }
3... cxd4 { Le pion c s'échange contre le pion d. Le meilleur coup. }
4. Nxd4 { Le cavalier reprend en d4. Le meilleur coup. }
4... g6 { Le Dragon accéléré : le fou va en g7, sur la grande diagonale. 4...Nf6 était un peu plus précis (+0,35 contre +0,65). }
5. c4 { LE BIND MARÓCZY. Le pion c4 rejoint e4 : ensemble, ils contrôlent d5. La poussée libératrice ...d5 devient presque impossible, et les Blancs ont plus d'espace au centre. Le meilleur coup (+0,6). [%csl Gc4,Ge4,Rd5][%cal Gc4d5,Ge4d5] }
5... Bg7 { Le fou se place sur la grande diagonale, où il vise d4 et b2. Un des trois meilleurs coups. [%cal Gg7b2] }
6. Be3 { Le fou protège le cavalier d4. Le meilleur coup. }
6... Nf6 { Le cavalier se développe et attaque e4. Un des meilleurs coups. [%cal Gf6e4] }
7. Nc3 { Le cavalier protège e4. Le meilleur coup. }
7... Ng4 { L'idée noire : le cavalier attaque le fou e3 pour forcer des échanges. Stockfish juge ce coup aussi bon que le roque (+0,65). [%cal Gg4e3] }
8. Qxg4 { La dame prend le cavalier. C'est forcé : après 8.Nc2? ou 8.Nxc6?, les Blancs perdaient leur avantage. Le meilleur coup. }
8... Nxd4 { Le cavalier c6 prend le cavalier d4. Les Noirs ont récupéré leur pièce : UNE PAIRE DE CAVALIERS a disparu. Le cavalier d4 menace ...Nc2+, une fourchette contre le roi et la tour a1. Le meilleur coup. [%cal Gd4c2] }
9. Qd1 { La dame revient défendre c2. Le meilleur coup (+0,6). [%cal Gd1c2] }
9... Ne6 { Le cavalier se replie en e6. Il contrôle d4, c5 et f4, et la grande diagonale du fou g7 est dégagée jusqu'au cavalier c3. Le meilleur coup. [%cal Gg7c3] }
10. Rc1 { La tour protège le cavalier c3, visé par le fou g7, et se place sur la colonne c. Le meilleur coup. [%cal Gc1c3] }
10... d6 { Le pion ouvre la diagonale du fou c8. Presque aussi bon que 10...b6. }
11. Be2 { Le fou se développe. Le meilleur coup (+0,8). }
11... Bd7 { Le fou se développe. 11...O-O était un peu plus précis. }
12. O-O { Le roi se met à l'abri. Le meilleur coup. }
12... O-O { Le roi noir aussi. Le meilleur coup. }
13. Qd2 { La dame se développe. Stockfish préférait de peu 13.b4, qui prend encore de l'espace à l'aile dame (+0,9 contre +0,75). }
13... a5 { Le pion prépare ...a4 et donne la case c5 au cavalier. Le meilleur coup.

Bilan : les Blancs gardent leur bind (pions c4 et e4) et un petit avantage (+0,7). Mais grâce à l'échange des cavaliers, les pièces noires ne se gênent plus : chacune a une case. Le plan noir est simple : ...Nc5, ...a4, ...Qa5, une pression sur les cases noires de l'aile dame.

PRO TIP : le camp qui a l'espace doit refuser les échanges inutiles. Le camp qui en manque doit les chercher. Quand tu hésites entre deux coups, demande-toi lequel facilite (ou empêche) les échanges. }
`,
    ),
    chapter(
      "La défense (2) : les ruptures ...c5 et ...f6 contre la chaîne blanche",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      `{ Deuxième réponse au manque d'espace : la RUPTURE DE PION. On attaque la chaîne de pions adverse pour la casser et récupérer des cases.

Contre une chaîne de pions, il y a deux cibles :
• la BASE (le pion le plus en arrière, qui soutient les autres) ;
• la TÊTE (le pion le plus avancé, qui prend l'espace).

Dans la Défense française, variante d'avance, les Blancs ont la chaîne d4-e5. Le pion e5 retire la case f6 au cavalier g8 et coupe le camp noir. Les Noirs attaquent la base avec ...c5, puis la tête avec ...f6.

PRO TIP : un pion avancé est fort tant qu'il est soutenu. Attaque ce qui le soutient (la base de la chaîne), puis attaque-le directement. [%csl Gd4,Ge5][%cal Rc7c5,Rf7f6] }
1. e4 { Le pion roi prend le centre. Le meilleur coup. }
1... e6 { La Défense française : les Noirs préparent ...d5. Stockfish préférait de peu 1...c6 ou 1...e5 (0,1 d'écart). }
2. d4 { Les Blancs prennent tout le centre. Le meilleur coup. }
2... d5 { Les Noirs attaquent e4. Le meilleur coup. [%cal Gd5e4] }
3. e5 { La variante d'avance : le pion e5 prend de l'espace et retire la case f6 au cavalier g8. 3.Nc3 était un peu plus précis (+0,5 contre +0,3), mais l'avance donne une structure très claire. [%csl Rf6][%cal Ge5f6] }
3... c5 { PREMIÈRE RUPTURE : le pion c attaque d4, la BASE de la chaîne blanche. Si d4 tombe, e5 n'est plus soutenu. Un des meilleurs coups. [%cal Gc5d4] }
4. c3 { Le pion c soutient d4. Le meilleur coup. Après 4.Nf3?!, les Noirs égalisaient (0,0). [%cal Gc3d4] }
4... Nc6 { Le cavalier attaque d4 une deuxième fois. Le meilleur coup. [%cal Gc6d4] }
5. Nf3 { Le cavalier défend d4 et e5. Le meilleur coup. [%cal Gf3d4,Gf3e5] }
5... Bd7 { Le fou se développe et libère c8 pour une tour. Un des meilleurs coups. }
6. Be2 { Le fou se développe. Le meilleur coup. }
6... Nge7 { Le cavalier g8 ne peut pas aller en f6 (le pion e5 contrôle cette case). Il passe par e7 pour aller en g6 ou f5. Le meilleur coup. [%cal Ge7g6] }
7. O-O { Le roi se met à l'abri. Le meilleur coup. }
7... Ng6 { Le cavalier attaque le pion e5, la TÊTE de la chaîne. Le meilleur coup. [%cal Gg6e5] }
8. g3 { Le pion retire la case f4 au cavalier g6. 8.Be3 était un rien plus précis. [%csl Rf4] }
8... f6 { DEUXIÈME RUPTURE : le pion f attaque e5, la tête de la chaîne. Les Noirs veulent ouvrir la colonne f et récupérer la case f6. Un des meilleurs coups. [%cal Gf6e5] }
9. exf6 { Les Blancs échangent. S'ils laissaient prendre en e5, leur centre s'écroulerait. Le meilleur coup. }
9... Qxf6 { La dame reprend et vise f3 et d4. Le pion e5 a disparu : la case f6 est libre, et la colonne f est semi-ouverte pour la tour noire. Le meilleur coup. [%cal Gf6f3,Gf6d4] }
10. Be3 { Le fou protège d4. 10.Bg5 était un peu plus précis. }
10... cxd4 { Les Noirs échangent aussi le pion d4. Le meilleur coup. }
11. Nxd4 { Le cavalier reprend. Le meilleur coup. }
11... Be7 { Le fou se développe. 11...Bd6 était un rien plus précis. }
12. Nd2 { Le cavalier se développe. Le meilleur coup. }
12... O-O { Le roi noir se met à l'abri, et la tour f8 arrive sur la colonne f.

Bilan : la chaîne blanche d4-e5 a disparu. Les pièces noires ont toutes une case, et la position est presque équilibrée (+0,4). Le prix à payer : le pion e6 est un peu faible. Mais les Noirs ont échangé un problème grave (le manque d'espace) contre un problème léger.

PRO TIP : prépare ta rupture avec soin. Ici, ...c5, ...Nc6 et ...Ng6 ont d'abord mis la pression sur la chaîne blanche. Le coup ...f6 n'est venu qu'ensuite, quand il était prêt. }
`,
    ),
    chapter(
      "La défense (3) : la Benoni, échanger la pièce qui gêne le plus",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      `{ Dans la Benoni moderne, les Noirs acceptent volontairement un manque d'espace : le pion blanc d5 coupe leur camp en deux et retire les cases c6 et e6 à leurs pièces. En échange, ils obtiennent une majorité de pions à l'aile dame et une grande diagonale pour le fou g7.

Leur défense combine les deux recettes du camp à l'étroit :
• ÉCHANGER, de préférence la pièce blanche la plus gênante ;
• préparer une RUPTURE, ici ...b5, pour ouvrir des lignes à l'aile dame.

Les Blancs, eux, veulent garder leur espace, empêcher ...b5 et préparer leur propre rupture au centre, e4-e5.

PRO TIP : quand tu manques d'espace, n'échange pas n'importe quelle pièce. Échange celle de l'adversaire qui te gêne le plus, ou ta pièce qui a le moins de cases. [%csl Gd5,Rc6,Re6] }
1. d4 { Le pion dame prend le centre. Un des meilleurs coups. }
1... Nf6 { Le cavalier se développe. Le meilleur coup. }
2. c4 { Le pion c prend de l'espace. Un des meilleurs coups. }
2... c5 { Les Noirs provoquent d4-d5. Un peu moins précis que 2...e6 (+0,75 contre +0,35), mais c'est un choix stratégique : les Noirs acceptent d'avoir moins d'espace. }
3. d5 { Le pion avance et prend de l'espace. Il contrôle c6 et e6. Le meilleur coup. [%cal Gd5c6,Gd5e6] }
3... e6 { Les Noirs attaquent le pion d5 pour ouvrir la colonne e. 3...b5 (le gambit Benko) était un rien plus précis. }
4. Nc3 { Le cavalier défend d5. Le meilleur coup. }
4... exd5 { Les Noirs échangent. Un des trois meilleurs coups. }
5. cxd5 { Le pion c reprend. La structure Benoni est en place : pion blanc en d5, pions noirs en c5 et d6 (après ...d6). Le meilleur coup (+1). [%csl Gd5] }
5... d6 { Le pion bloque le pion d5 et ouvre la diagonale du fou c8. Le meilleur coup. }
6. e4 { Le pion e rejoint d5. Les Blancs ont maintenant une majorité de pions au centre, et une rupture en réserve : e4-e5. Le meilleur coup. [%cal Ge4e5] }
6... g6 { Le fou va se placer en g7, sur la diagonale qui vise e5 et b2. Le meilleur coup. }
7. Nf3 { Le cavalier se développe et surveille e5. 7.f4, plus agressif, était un peu meilleur (+1 contre +0,7). }
7... Bg7 { Le fou se place sur la grande diagonale. Un des meilleurs coups. [%cal Gg7b2] }
8. Be2 { Le fou se développe. 8.h3 était un peu plus précis. }
8... O-O { Le roi se met à l'abri. Le meilleur coup. }
9. O-O { Le roi blanc aussi. Un des meilleurs coups. }
9... Re8 { La tour se place sur la colonne e, face au pion e4. Un des trois meilleurs coups. [%cal Ge8e4] }
10. Nd2 { Le cavalier libère la case f3 pour le pion f, et se dirige vers c4, d'où il attaquera le pion d6. Le meilleur coup. [%cal Gd2c4,Gc4d6] }
10... Na6 { Le cavalier se dirige vers c7, d'où il soutiendra ...b5. Le meilleur coup. [%cal Ga6c7] }
11. f3 { Le pion protège e4. Les Blancs gardent leur centre solide. Le meilleur coup. }
11... Nc7 { Le cavalier arrive en c7 : il contrôle b5. Le meilleur coup. [%cal Gc7b5] }
12. a4 { LA PROPHYLAXIE BLANCHE. Le pion a4 contrôle b5 et freine la rupture noire ...b5. Le meilleur coup (+0,75). [%cal Ga4b5] }
12... b6 { Les Noirs prennent leur temps : ils préparent ...a6 puis ...b5. Le pion b6 protège aussi c5. Le meilleur coup. }
13. Nc4 { Le cavalier arrive en c4. Il attaque le pion d6 et soutient la poussée e5. 13.Kh1 était un rien plus précis. [%cal Gc4d6] }
13... Ba6 { Le fou vient attaquer le cavalier c4. Les Noirs veulent échanger leur fou c8, qui manque de cases, contre le meilleur cavalier blanc. Le meilleur coup. Les autres coups étaient nettement moins bons (+1,4 ou plus). [%cal Ga6c4] }
14. Bg5 { Le fou cloue le cavalier f6 contre la dame. Le meilleur coup. [%cal Gg5d8] }
14... h6 { Le pion chasse le fou. 14...Bxc4 tout de suite était équivalent. }
15. Be3 { Le fou recule. Il contrôle d4 et vise c5. 15.Bh4 était un rien meilleur. }
15... Bxc4 { L'ÉCHANGE LIBÉRATEUR. Le fou noir prend le cavalier c4, la pièce blanche qui gênait le plus. Le meilleur coup. }
16. Bxc4 { Le fou reprend. Le meilleur coup. Une seule recapture est sensée : sur 16.Qd2?, les Noirs gardaient leur pièce de plus. }
16... a6 { Le pion prépare ...b5, la rupture qui va ouvrir l'aile dame. Le meilleur coup.

Bilan : les Blancs ont toujours plus d'espace au centre et un léger avantage (+0,55). Mais les Noirs ont échangé une paire de pièces mineures, et leur rupture ...b5 est prête. Le manque d'espace est devenu supportable.

PRO TIP : une rupture de pion est la seule façon de VRAIMENT reprendre de l'espace. Les échanges soulagent, mais seule la rupture change la structure. [%cal Gb6b5] }
`,
    ),
    chapter(
      "Bondarevsky – Smyslov : ne pas offrir d'espace à l'adversaire",
      "r1bb1rk1/1pp2ppp/p1p5/2n5/4PB2/5N2/PPP2PPP/RN2R1K1 w - - 0 12",
      `{ Championnat d'URSS 1946. Les dames ont disparu. Smyslov (Noirs) a la paire de fous mais des pions c doublés. Bondarevsky a un pion e4 au centre.

La position est équilibrée, et c'est là qu'un détail va tout décider. Smyslov va attaquer le pion e4 avec ...f5. Les Blancs ont alors deux choix : échanger (exf5), ou avancer (e5).

Avancer a l'air actif : le pion gagne une rangée. En réalité, c'est un cadeau. Le pion e5 se retrouve bloqué, il ne contrôle plus f5 ni d5, et les Noirs peuvent pousser leurs pions de l'aile roi en gagnant des temps. L'espace change de camp.

PRO TIP : un pion qui avance ne gagne de l'espace que si les cases qu'il abandonne derrière lui ne profitent pas à l'adversaire. Avant de pousser, regarde aussi ce que tu ne contrôleras plus. }
12. Nc3 { Le cavalier se développe et protège e4. Le meilleur coup. [%cal Gc3e4] }
12... f5 { Smyslov attaque e4 avec son pion f. Presque aussi bon que 12...Re8 (0,1 d'écart). [%cal Gf5e4] }
13. exf5 { La bonne réponse : les Blancs échangent et gardent l'équilibre. La position s'ouvre pour les fous noirs, mais les pièces blanches restent actives. Un des meilleurs coups (0,0). }
(13. e5 { Le coup de la partie, une erreur stratégique (Stockfish : −0,85 au lieu de 0,0). Le pion e5 a l'air fort, mais il est bloqué, et les cases f5 et d5 ne sont plus contrôlées par un pion blanc. [%csl Rf5,Rd5] } 13... Ne6 { Le cavalier vient en e6, d'où il contrôle f4, g5 et d4. Le meilleur coup. [%cal Ge6f4,Ge6d4] } 14. Bd2 { Le fou recule pour échapper à ...g5. Aussi bon que 14.Ne2. } 14... g5 { LES NOIRS PRENNENT L'ESPACE. Le pion g5 retire les cases f4 et h4 aux pièces blanches et prépare ...f4 et ...g4. Le meilleur coup. [%cal Gg5g4,Gf5f4] } 15. Ne2 { Le cavalier cherche une case en d4 ou g3. Le meilleur coup. } 15... c5 { Le pion c5 retire la case d4 aux cavaliers blancs. Ils n'ont plus de bonne case au centre. Le meilleur coup. [%csl Rd4] } 16. h4 { Les Blancs tentent de casser la chaîne noire par h4. Le meilleur coup. Dans la partie, Bondarevsky a joué 16.Bc3, moins précis (−1,6). } 16... h6 { Le pion soutient g5. Le meilleur coup. Les Noirs ont l'avantage (−0,7). Dans la partie, Smyslov a poussé ...b5, ...g4 et ...f4, ses fous ont dominé, et il a gagné. })
13... Bxf5 { Le fou reprend en f5, sur une belle diagonale. Le meilleur coup. }
14. Rac1 { La tour se prépare à jouer sur la colonne c ou à protéger c2. Le meilleur coup. }
14... h6 { Le pion donne une case de fuite au roi et contrôle g5. Aussi bon que 14...a5. }
15. Bg3 { Le fou se met à l'abri sur g3. Le meilleur coup. }
15... a5 { Le pion prend de l'espace à l'aile dame. La position reste parfaitement équilibrée (0,0).

Compare les deux branches : après exf5, personne n'a d'avantage d'espace. Après e5, les pions noirs f5 et g5 ont pris le contrôle de l'aile roi en quelques coups, et les cavaliers blancs n'avaient plus de cases.

PRO TIP : ne pousse jamais un pion « parce qu'il est attaqué ». Avant chaque poussée, demande-toi quelles cases tu laisses à l'adversaire, et ce que ses pions vont pouvoir faire ensuite. }
`,
    ),
  ],
};
