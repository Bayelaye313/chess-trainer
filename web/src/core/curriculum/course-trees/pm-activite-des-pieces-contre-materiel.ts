import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « Activité des pièces contre matériel » (positional_mastery,
 * module 16) — format « un commentaire par coup » du 2026-10-12.
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, entièrement
 * réécrite ici) : Marshall – Capablanca (1918, aussi dans
 * `PILOT_pm-activite-des-pieces-contre-materiel.pgn`), Olafsson – Fischer
 * (1958), Marshall – Lasker (1907), Tarrasch – Thorold (1890) et
 * Tartakower – Domenech (1934), telles que présentées dans « The Most
 * Instructive Games of Chess Ever Played » de Chernev (`chernev1.pgn`).
 * Les chapitres 1 et 2 sont des lignes théoriques sans source (attaque
 * Marshall de l'Espagnole, gambit Benko). Écartée après sondage : Tal –
 * Lisitsin 1956 (la marche du roi blanc est jugée inférieure par le moteur,
 * les Blancs restant moins bien de 0,6 à 1,5 pion pendant tout le fragment).
 *
 * Plan : définition — un pion contre une initiative durable, l'attaque
 * Marshall (1) et le gambit Benko (2) ; Marshall – Capablanca : rendre un
 * pion pour activer ses tours (3), puis deux tours actives contre un pion de
 * plus (4) ; Olafsson – Fischer : la qualité gagnée ne compense pas les
 * pièces actives (5, 6) ; Marshall – Lasker : le sacrifice d'une pièce (7),
 * puis le roi et la tour actifs (8) ; Tarrasch – Thorold : la tour agressive
 * (9) ; Tartakower – Domenech : une pièce contre deux pions passés (10).
 *
 * Toutes les lignes ont été rejouées avec chess.js et chaque coup sondé avec
 * Stockfish 18 (profondeur 18, 3 candidats par coup), suites du moteur
 * comprises. Règle appliquée : quand un coup perd environ 0,5 pion ou plus
 * par rapport au choix du moteur, la LIGNE PRINCIPALE suit le moteur et la
 * suite de la partie passe en variante, signalée comme fautive. Exception :
 * dans une position déjà décisive (plus de +3 environ), un écart est
 * seulement signalé dans le commentaire. Plusieurs chapitres commencent donc
 * après une imprécision signalée dans l'introduction. Les évaluations citées
 * sont du point de vue des Blancs. Aucun résultat de partie (1-0, 0-1…) dans
 * les variantes : le parseur s'y arrêterait.
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

export const ACTIVITE_CONTRE_MATERIEL: CourseTree = {
  chapters: [
    chapter(
      "Définition : un pion contre une initiative durable (l'attaque Marshall)",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      `{ Le MATÉRIEL se compte : un pion vaut 1, un fou ou un cavalier 3, une tour 5, une dame 9. L'ACTIVITÉ ne se compte pas aussi facilement : c'est ce que tes pièces peuvent faire au prochain coup. Elles attaquent des cibles, contrôlent des colonnes et des cases importantes, ou approchent le roi adverse.

Une pièce active vaut souvent plus que sa valeur nominale, et une pièce passive beaucoup moins. C'est pourquoi on peut donner un pion, parfois une qualité ou une pièce, pour rendre ses pièces actives et rendre passives celles de l'adversaire.

Le meilleur exemple théorique est l'attaque Marshall de la partie Espagnole. Les Noirs donnent le pion e5 au 8e coup. En échange, ils développent toutes leurs pièces avec gain de temps et dirigent leur dame vers le roi blanc. Plus d'un siècle de pratique l'a montré : ce pion de moins est entièrement compensé.

PRO TIP : pour savoir si ta compensation est suffisante, compare le nombre de pièces actives de chaque côté APRÈS le sacrifice, et non avant. }
1. e4 { Le pion roi prend le centre. Le meilleur coup. }
1... e5 { Les Noirs répondent symétriquement. Presque aussi bon que 1...c6. }
2. Nf3 { Le cavalier attaque e5. Le meilleur coup. }
2... Nc6 { Le cavalier défend e5. Le meilleur coup. }
3. Bb5 { La partie Espagnole : le fou attaque le défenseur de e5. Le meilleur coup. }
3... a6 { Les Noirs questionnent le fou. Un des trois meilleurs coups. }
4. Ba4 { Le fou garde la tension. Le meilleur coup. }
4... Nf6 { Le cavalier se développe et attaque e4. Presque aussi bon que 4...Be7. }
5. O-O { Le roi blanc se met à l'abri. Le meilleur coup. }
5... Be7 { Le fou se développe et prépare le roque. Presque aussi bon que 5...Nxe4. }
6. Re1 { La tour protège le pion e4. Le meilleur coup. }
6... b5 { Le pion chasse le fou a4. Le meilleur coup. }
7. Bb3 { Le fou recule sur la diagonale a2-g8. Le meilleur coup. }
7... O-O { Les Noirs roquent : c'est l'ordre de coups qui prépare l'attaque Marshall. Le meilleur coup. }
8. c3 { Le pion c prépare d4. Presque aussi bon que 8.a4, qui évite l'attaque Marshall. }
8... d5 { L'ATTAQUE MARSHALL. Les Noirs offrent le pion e5 pour ouvrir le jeu. Le meilleur coup selon Stockfish. [%cal Gd5e4] }
9. exd5 { Les Blancs prennent. Le meilleur coup. }
9... Nxd5 { Le cavalier reprend et se centralise. Le meilleur coup. }
10. Nxe5 { Les Blancs prennent le pion e5 : ils ont un pion de plus. Le meilleur coup. }
10... Nxe5 { Le cavalier c6 reprend. Le meilleur coup. }
11. Rxe5 { La tour reprend : les Blancs gardent un pion de plus. Le meilleur coup. }
11... c6 { Le pion soutient le cavalier d5. Un coup très joué ; l'écart avec 11...Bb7 est minime. }
12. d4 { Le pion prend le centre et libère le fou c1. Le meilleur coup. }
12... Bd6 { LE FOU ATTAQUE LA TOUR e5 avec gain de temps, et vise h2. Presque aussi bon que 12...a5. [%cal Gd6e5,Gd6h2] }
13. Re1 { La tour recule. Le meilleur coup. }
13... Qh4 { LA DAME VIENT À L'AILE ROI. Avec le fou d6, elle menace Qxh2+. Le meilleur coup. [%cal Gh4h2,Gd6h2] }
14. g3 { Le seul coup : 14.h3 ou 14.Re5 perdaient environ deux pions d'évaluation. Mais le pion g3 affaiblit les cases blanches autour du roi (f3, h3). [%csl Rf3,Rh3] }
14... Qh3 { La dame s'installe en h3, au contact du roi blanc. Le meilleur coup. [%csl Rh3] }
15. Be3 { Le fou se développe et protège la troisième rangée. Le meilleur coup. }
15... Bg4 { Le fou attaque la dame d1 avec gain de temps. Le meilleur coup. [%cal Gg4d1] }
16. Qd3 { La dame s'écarte et vise la colonne d. Le seul bon coup. }
16... Rae8 { La dernière tour entre en jeu. Un des trois meilleurs coups. }
17. Nd2 { Le cavalier se développe enfin. Le meilleur coup. }
17... Re6 { La tour se prépare à passer en f6 ou h6 pour attaquer le roi. Un des trois meilleurs coups.

Bilan : les Blancs ont un pion de plus, mais Stockfish ne leur donne que +0,2. Toutes les pièces noires sont actives (dame h3, deux fous, tour e6), alors que le cavalier d2 et le fou b3 blancs ne participent pas encore. Le pion est compensé. [%cal Ge6h6,Ge6f6] }`,
    ),
    chapter(
      "Le gambit Benko : un pion contre deux colonnes ouvertes",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      `{ Deuxième exemple théorique : le gambit Benko. Les Noirs donnent un pion à l'aile dame dès le 3e coup. En échange, ils obtiennent :
- les colonnes a et b ouvertes pour leurs tours ;
- un fou en g7 qui vise b2 sur la grande diagonale ;
- un roi blanc qui ne peut plus roquer.

Cette compensation ne disparaît pas après quelques coups : elle dure jusqu'en finale. C'est ce qui distingue un vrai sacrifice positionnel d'un simple coup de bluff.

Stockfish, lui, reste prudent : il donne environ +0,8 aux Blancs pendant toute la ligne. Retiens donc que la compensation est réelle mais incomplète : face à une défense précise, le pion compte. En partie pratique, la pression noire est très difficile à supporter.

PRO TIP : une compensation durable vient de faiblesses FIXES (une colonne ouverte, un roi privé de roque). Une compensation qui repose seulement sur une avance de développement s'évapore en quelques coups. }
1. d4 { Le pion dame prend le centre. Presque aussi bon que 1.e4. }
1... Nf6 { Le cavalier se développe et contrôle e4. Un des meilleurs coups. }
2. c4 { Le pion c prend de l'espace. Le meilleur coup. }
2... c5 { Les Noirs attaquent d4 de côté. 2...e6 était un peu plus solide (+0,3 contre +0,7). }
3. d5 { Le pion avance et gagne de l'espace. Le meilleur coup. }
3... b5 { LE GAMBIT. Les Noirs offrent le pion b pour ouvrir l'aile dame. L'écart avec 3...e6 est minime. [%cal Gb5c4] }
4. cxb5 { Les Blancs acceptent le pion. Le meilleur coup. }
4... a6 { Les Noirs offrent aussi le pion a : ils veulent ouvrir la colonne a. Le meilleur coup. [%cal Ga6b5] }
5. bxa6 { Les Blancs prennent encore. Presque aussi bon que 5.e3, qui refusait le deuxième pion. }
5... Bxa6 { Le fou reprend et se place sur la diagonale a6-f1. Les colonnes a et b sont ouvertes. Presque aussi bon que 5...e6. [%cal Ga6f1] }
6. Nc3 { Le cavalier se développe et soutient la poussée e4. Le meilleur coup. }
6... d6 { Le pion soutient c5 et contrôle la case e5. Presque aussi bon que 6...g6. }
7. e4 { Les Blancs prennent le centre. Mais le fou f1 va devoir s'échanger. Le meilleur coup. }
7... Bxf1 { LE FOU S'ÉCHANGE EN f1 : le roi blanc va devoir le reprendre et perdra le droit de roquer. Le meilleur coup. }
8. Kxf1 { Le roi reprend, seul bon coup (8.Nge2 ou 8.e5 perdaient plus de trois pions d'évaluation). Il est maintenant privé de roque. }
8... g6 { Les Noirs préparent le fianchetto. Presque aussi bon que 8...Qc8. }
9. g3 { Les Blancs préparent une case pour leur roi en g2 : c'est un « roque artificiel », qui coûte plusieurs coups. Presque aussi bon que 9.Qe2. }
9... Bg7 { Le fou s'installe sur la grande diagonale : il vise b2 à travers c3. Presque aussi bon que 9...Qc8. [%cal Gg7b2] }
10. Kg2 { Le roi arrive en g2. Presque aussi bon que 10.a4. }
10... O-O { Les Noirs roquent, eux, en un seul coup. Le meilleur coup. }
11. Nf3 { Le cavalier se développe vers d2 ou e5. Le meilleur coup. }
11... Nbd7 { Le cavalier se développe vers b6 ou e5. L'écart avec le meilleur coup (11...Na6) est minime. }
12. Re1 { La tour soutient la poussée e5. Un rien moins précis que 12.a4. }
12... Qa5 { La dame se place sur la colonne a, derrière laquelle viendront les tours (...Rfb8). Elle vise le cavalier c3 et le pion a2. 12...Ng4 était un peu plus précis.

Bilan : les Blancs ont un pion de plus (+1,2 pour Stockfish), mais leurs pions a2 et b2 sont des cibles permanentes sur les colonnes ouvertes, et le fou g7 les vise de loin. La compensation noire ne dépend pas d'une attaque rapide : c'est une PRESSION qui durera toute la partie. [%cal Ga5a2,Gg7b2] }`,
    ),
    chapter(
      "Marshall – Capablanca : rendre un pion pour activer ses pièces",
      "r1b2rk1/p2nqppp/1pp1p3/8/2BP4/2Q1PN2/PP3PPP/2R2RK1 w - - 0 13",
      `{ Marshall – Capablanca, New York 1918. Une Défense orthodoxe du Gambit Dame : la position est équilibrée. Marshall, grand attaquant, va ouvrir le centre et tendre un piège. La réponse de Capablanca est le cœur de ce module : plutôt que de défendre un pion passivement, il le DONNE pour que ses tours deviennent actives.

Comment savoir si une compensation est réelle ? Pose-toi trois questions :
1. Mes pièces ont-elles des CIBLES concrètes (pions faibles, rangée ouverte, roi) ?
2. Les pièces adverses deviennent-elles passives pour garder le pion gagné ?
3. Mon activité dure-t-elle, ou disparaîtra-t-elle après deux ou trois coups ?

PRO TIP : un pion de moins avec une tour sur la deuxième rangée adverse vaut souvent autant qu'un pion de plus avec des tours enfermées. }
13. e4 { Le pion prend le centre. L'écart avec le meilleur coup (13.Rfd1) est faible. }
13... Bb7 { Le fou se développe sur la grande diagonale. Le meilleur coup. }
14. Rfe1 { La tour soutient le pion e4. Le meilleur coup. }
14... Rfd8 { La tour prend la colonne d. L'écart avec le meilleur coup (14...c5) est faible. }
15. d5 { Le pion attaque c6 et e6 : Marshall ouvre le jeu. Le meilleur coup. [%cal Gd5c6,Gd5e6] }
15... Nc5 { Le cavalier attaque le pion e4. Un des trois meilleurs coups, l'écart est minime. [%cal Gc5e4] }
16. dxe6 { Le pion prend en e6. Le meilleur coup. }
16... Nxe6 { Le cavalier reprend. C'est le seul bon coup : 16...fxe6 affaiblissait le roi et donnait +2,3 aux Blancs. }
17. Bxe6 { Le fou s'échange contre le cavalier. L'écart avec le meilleur coup est faible. }
17... Qxe6 { La dame reprend et attaque les pions a2 et e4. Le meilleur coup. }
18. Nd4 { LE PIÈGE DE MARSHALL. Le cavalier attaque la dame e6 et le pion c6. Presque aussi bon que 18.b4. [%cal Gd4e6,Gd4c6] }
18... Qe5 { LA DÉCISION DE CAPABLANCA. La dame laisse le pion c6 et vise d4, e4 et h2. Après 19.Nxc6, les Noirs échangeront les dames et leur tour entrera en d2. Stockfish place ce coup à égalité avec 18...Qf6 ; la retraite passive 18...Qd6 donnait +0,9. [%cal Ge5c3] }
19. Nxc6 { Le cavalier prend le pion c6 et attaque la dame e5, la tour d8 et le pion a7. Les Blancs ont un pion de plus. Le meilleur coup. }
19... Qxc3 { Les Noirs échangent les dames. C'est le seul coup : laisser la dame en prise ou la retirer perdait la tour d8 (+4,7). }
20. Rxc3 { La tour reprend. Le meilleur coup. }
20... Rd2 { LA TOUR ENTRE EN DEUXIÈME RANGÉE. Elle attaque b2 et f2. Voilà la compensation : une tour active contre un pion. Le meilleur coup. [%cal Gd2b2,Gd2f2] }
21. Rb1 { La tour défend b2 passivement. 21.a3 était un peu meilleur (+0,1 contre -0,2). }
21... Re8 { La deuxième tour attaque le pion e4. Les Noirs laissent même le pion a7 en prise : si 22.Nxa7, la tour prend en e4 et les deux tours noires restent très actives. Le meilleur coup. Bilan : les Noirs ont un pion de moins, et pourtant Stockfish juge la position égale. [%cal Ge8e4] }`,
    ),
    chapter(
      "Marshall – Capablanca : deux tours actives contre un pion de plus",
      "4r1k1/pb3ppp/1pN5/8/4P3/2R5/PP1r1PPP/1R4K1 w - - 3 22",
      `{ Suite de Marshall – Capablanca (chapitre 3). Les Blancs ont un pion de plus. Mais regarde les pièces :
- la tour noire d2 est sur la deuxième rangée blanche, elle attaque b2 et f2 ;
- la tour noire e8 attaque le pion e4 ;
- la tour blanche b1 ne fait que défendre b2, la tour c3 et le cavalier c6 cherchent un rôle.

Le plan de Capablanca : attaquer de nouveaux pions blancs, à l'aile roi cette fois, pour que les tours blanches restent occupées à défendre.

PRO TIP : quand tu as l'initiative en échange d'un pion, crée sans cesse de nouvelles cibles. Si l'adversaire a le temps de libérer ses pièces, son pion de plus reprendra le dessus. }
22. e5 { Le pion avance en e5, où le cavalier c6 le protège. L'écart avec le meilleur coup (22.Rbc1) est faible. }
22... g5 { LE PION G AVANCE. Capablanca veut ouvrir l'aile roi blanche et récupérer un pion. Presque aussi bon que 22...g6. [%cal Gg5g4] }
23. h4 { Les Blancs attaquent le pion g5. L'écart avec le meilleur coup (23.a3) est faible. }
23... gxh4 { Le pion prend en h4 : le matériel est égal. Le meilleur coup. }
24. b4 { LE BON COUP selon Stockfish. Les Blancs activent leurs pions de l'aile dame au lieu de défendre : la position reste presque égale (-0,4). } (24. Re1 { LE COUP DE LA PARTIE, une faute (-0,3 → -1,5). La tour vient défendre le pion e5, mais elle devient passive. } 24... Re6 { La tour attaque le cavalier c6 et le pion e5. Le meilleur coup. [%cal Ge6c6] } 25. Rec1 { La tour revient défendre le cavalier par la colonne c. Le meilleur coup : les autres coups perdaient plus d'un pion et demi d'évaluation. } 25... Kg7 { Le roi se rapproche de l'aile roi. Presque aussi bon que 25...a5. } 26. b4 { Les Blancs avancent leurs pions de l'aile dame. Le meilleur coup. } 26... b5 { Le pion bloque l'aile dame blanche. Le meilleur coup. } 27. a3 { Le pion protège b4. Presque aussi bon que 27.Kf1. } 27... Rg6 { LA TOUR PASSE SUR LA COLONNE g et attaque g2. Le meilleur coup. [%cal Gg6g2] } 28. Kf1 { Le roi vient défendre g2. Le meilleur coup. } 28... a6 { LE BON COUP selon Stockfish : un coup calme qui enlève toute cible à l'aile dame. Les Noirs restent nettement mieux (-1,5). } (28... Ra2 { LE COUP DE LA PARTIE, une imprécision (-1,5 → -1,0). La tour attaque a3, mais les Blancs ont maintenant une ressource. } 29. e6 { LE BON COUP selon Stockfish. Le pion se donne pour que la tour blanche puisse venir en c2 et échanger la tour a2 active. } (29. Kg1 { LE COUP DE LA PARTIE, une faute (-1,0 → -2,9). } 29... h3 { Le pion attaque g2. Le meilleur coup. } 30. g3 { Le pion avance, seul bon coup. La position blanche devient perdue (-4). }) 29... fxe6 { Les Noirs prennent. Presque aussi bon que 29...Rxe6. } 30. R1c2 { La tour propose l'échange de la tour a2. Le meilleur coup : les Blancs limitent les dégâts (-0,6). })) 24... Bxc6 { Le fou prend le cavalier. Le meilleur coup. }
25. Rxc6 { La tour reprend. Le seul coup : les autres perdaient une pièce. }
25... Rxe5 { La tour prend le pion e5 : les Noirs ont un pion de plus. Le meilleur coup. }
26. a4 { Les Blancs créent un pion passé à l'aile dame. Le meilleur coup.

Bilan : avec 24.b4, les Blancs activent leur aile dame et tiennent la position (-0,4). Dans la partie, 24.Re1 a rendu les tours blanches passives, et les tours noires ont dominé les deux ailes. }`,
    ),
    chapter(
      "Olafsson – Fischer : la qualité ne suffit pas",
      "r2q1rk1/pp3p2/4bn1p/3p2p1/1npP4/bPN1P1B1/P1RNBPPP/3Q1RK1 w - - 4 16",
      `{ Olafsson – Fischer, Portorož 1958. Fischer (Noirs) a joué pour gagner la QUALITÉ (une tour contre une pièce mineure). Pour y arriver, il a avancé son pion g (13...g5), ce qui affaiblit les cases autour de son roi, et son cavalier vient d'aller en b4 pour prendre la tour c2.

Stockfish juge plusieurs coups imprécis avant cette position : 13...g5 (13...cxb3 était un peu meilleur), 15.Rc2 (15.bxc4 gardait environ +1) et 15...Nb4 (15...cxb3 égalisait). Ici, les Blancs sont légèrement mieux (+0,6).

Regarde ce que les Blancs reçoivent en échange de la qualité :
- la paire de fous ;
- un centre de pions solide (d4, e3) ;
- des cases blanches affaiblies autour du roi noir.

PRO TIP : la valeur des pièces (tour = 5, fou = 3) n'est qu'un point de départ. Une tour sans colonne ouverte peut valoir moins qu'un fou qui vise le roi. }
16. bxc4 { Le pion prend en c4 et attaque d5. Le meilleur coup. [%cal Gc4d5] }
16... Nxc2 { Le cavalier prend la tour : Fischer gagne la qualité. Le meilleur coup. }
17. Qxc2 { La dame reprend le cavalier en c2. Le meilleur coup. }
17... dxc4 { Le pion prend en c4. 17...Bd6, qui échangeait le fou g3, était un rien plus précis. }
18. Nb5 { LE CAVALIER ATTAQUE au lieu de reprendre le pion c4. Il vise le fou a3 et le pion a7, et menace d'aller en c7. Le meilleur coup. [%cal Gb5a3,Gb5c7] }
18... Bb4 { Le fou s'écarte et attaque le cavalier d2. Un des trois meilleurs coups. [%cal Gb4d2] }
19. Nc7 { LA FOURCHETTE. Le cavalier attaque la tour a8 et le fou e6. Le meilleur coup. [%cal Gc7a8,Gc7e6] }
19... Bxd2 { Le fou prend le cavalier d2. 19...Qd7 était un peu meilleur (+1,2 contre +1,5). }
20. Nxe6 { LE BON CHOIX : le cavalier prend le fou e6 plutôt que la tour a8. Les Blancs ne cherchent pas le matériel, ils détruisent la protection des cases blanches autour du roi noir. Le meilleur coup. [%csl Re6] }
20... fxe6 { Le pion reprend, forcé : 20...Qa5 ou 20...Qe7 perdaient beaucoup plus. Le pion e6 est maintenant isolé et la diagonale a2-g8 est ouverte. }
21. Bxc4 { Le fou reprend le pion c4 et vise e6. 21.Qg6+, avec échec, était encore un peu plus fort (+1,5 contre +1,2). [%cal Gc4e6] }
21... Qe8 { La dame défend le pion e6. Presque aussi bon que 21...Qe7. }
22. Qxd2 { La dame reprend le fou d2. Le meilleur coup. Les Blancs ont maintenant fou et pion contre tour. }
22... Ne4 { Le cavalier attaque la dame et le fou g3 : Fischer veut éliminer un des deux fous. Le meilleur coup. [%cal Ge4g3] }
23. Qd3 { La dame s'écarte et attaque le cavalier. Le meilleur coup. }
23... Nxg3 { Le cavalier prend le fou. C'est le seul bon coup : 23...Nf6 ou 23...Rc8 perdaient environ deux pions d'évaluation de plus. }
24. hxg3 { Le pion h reprend vers le centre. Le meilleur coup. }
24... Rf6 { La tour protège le pion e6 par la sixième rangée. Presque aussi bon que 24...Rc8. }
25. Qe4 { LA DAME SE CENTRALISE. Elle attaque b7 et e6, et domine l'échiquier. Presque aussi bon que 25.Bb3. [%csl Ge4][%cal Ge4b7,Ge4e6] }
25... Rc8 { La tour attaque le fou c4. Le meilleur coup.

Bilan : les Noirs ont une tour contre un fou et un pion, donc un léger avantage matériel. Pourtant Stockfish donne +1,2 aux BLANCS : la dame centrale, le fou qui vise e6 et le centre de pions valent plus que la qualité. }`,
    ),
    chapter(
      "Olafsson – Fischer : la dame centrale et le pion cloué",
      "2r1q1k1/pp6/4pr1p/6p1/2BPQ3/4P1P1/P4PP1/5RK1 w - - 3 26",
      `{ Suite de Olafsson – Fischer (chapitre 5). Les Noirs ont une tour contre un fou et un pion. Les Blancs sont pourtant mieux (+1,2).

Regarde le pion e6 : il est isolé et, sur la diagonale c4-g8, il est CLOUÉ devant le roi par le fou blanc. Les deux tours noires sont obligées de le surveiller. C'est le principe de ce chapitre : une seule faiblesse fixe peut rendre passives des pièces de plus grande valeur.

PRO TIP : quand l'adversaire a plus de matériel, attaque la faiblesse qui OBLIGE ses grosses pièces à défendre. Une tour qui garde un pion ne vaut guère plus qu'un pion. }
26. Bb3 { Le fou recule, garde le clouage du pion e6 et sort de l'attaque de la tour c8. Le meilleur coup. [%cal Gb3g8] }
26... Qd7 { La dame défend la septième rangée. Presque aussi bon que 26...Qf7. }
27. Rd1 { La tour soutient le pion d4 et prépare d5. Le meilleur coup. }
27... Re8 { La tour vient défendre e6. Le meilleur coup. }
28. f4 { Le pion attaque g5 et prépare f5 pour frapper e6 une deuxième fois. Stockfish préférait 28.Qe5, l'écart est faible. [%cal Gf4f5] }
28... Qh7 { Les Noirs proposent l'échange des dames. 28...Kh8 était un peu plus précis. }
29. Qe5 { La dame refuse l'échange et reste au centre. Le meilleur coup. [%csl Ge5] }
29... Qf7 { LE BON COUP selon Stockfish : la dame défend f6 et e6. Les Blancs restent mieux (+1,5), sans plus. } (29... Qf5 { LE COUP DE LA PARTIE, une faute (+1,4 → +2,7). Fischer propose l'échange des dames pour soulager sa position. } 30. Qxf5 { LE BON COUP selon Stockfish : accepter l'échange. Sans dames, le pion e6 est encore plus faible. } (30. g4 { LE COUP DE LA PARTIE, imprécis (+2,7 → +1,0) : le pion chasse la dame, mais les Noirs échangent quand même. } 30... Qxe5 { La dame prend la dame. Le meilleur coup. } 31. dxe5 { Le pion reprend. Le meilleur coup. Les Blancs restent mieux (+0,9), mais l'avantage décisif a disparu. }) 30... Rxf5 { La tour reprend. Le seul coup. } 31. e4 { LE PION ATTAQUE LA TOUR f5 avec gain de temps. Les pions centraux blancs avancent et la position devient décisive (+3,0). Le meilleur coup. [%cal Ge4f5] })`,
    ),
    chapter(
      "Marshall – Lasker : donner une pièce pour ouvrir les lignes",
      "r1bq1rk1/ppppbppp/2n5/1B2P3/3Nn3/8/PPP2PPP/RNBQ1RK1 w - - 1 8",
      `{ Marshall – Lasker, 1907, une partie Espagnole : 1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6 4.d4 exd4 5.O-O Be7 6.e5 Ne4 7.Nxd4 O-O. La position est équilibrée.

Dans ce chapitre, Lasker laisse un cavalier en prise. En échange, il obtient une colonne f ouverte contre le roi blanc et un pion central qui attaque. Le sacrifice n'est que temporaire : l'activité noire permet de récupérer la pièce.

C'est une forme fréquente du thème : on « prête » du matériel à l'adversaire, et on le récupère grâce à l'activité gagnée.

PRO TIP : un sacrifice est justifié si, juste après, tes pièces créent des menaces concrètes à chaque coup. Si l'adversaire a le temps de se regrouper, le matériel finira par l'emporter. }
8. Nf5 { Le cavalier vise e7 et g7. Le meilleur coup, à égalité avec 8.Bf4. [%cal Gf5e7,Gf5g7] }
8... d5 { Le pion d avance : il soutient le cavalier e4 et libère le fou c8. Le meilleur coup : 8...d6 laissait +0,6 aux Blancs. }
9. Bxc6 { Le fou s'échange contre le cavalier c6. Un des trois meilleurs coups, l'écart est minime. }
9... bxc6 { Le pion b reprend : les Noirs ont des pions c doublés, mais la colonne b s'ouvre. Le meilleur coup. }
10. Nxe7+ { Le cavalier prend le fou e7 avec échec. Le meilleur coup. }
10... Qxe7 { La dame reprend. Le seul coup : 10...Kh8 laissait une pièce. Les Noirs ont déjà plus de pièces en jeu que les Blancs. }
11. Re1 { La tour attaque le cavalier e4. Elle protège aussi le pion e5 de façon indirecte : si 11...Qxe5, 12.f3 attaque le cavalier cloué devant la dame, et les Noirs n'obtiennent que deux pions pour la pièce (+2,7). Le meilleur coup. [%cal Ge1e4] }
11... Qh4 { La dame vient attaquer les pions f2 et h2. 11...Re8 était un peu plus précis, l'écart reste faible. [%cal Gh4f2] }
12. Be3 { Le fou se développe et protège f2. Le meilleur coup. }
12... f6 { Le pion f attaque e5 pour ouvrir la colonne f. Un rien moins précis que 12...a5. [%cal Gf6e5] }
13. f3 { Le pion attaque le cavalier e4. Le meilleur coup. [%cal Gf3e4] }
13... fxe5 { LE SACRIFICE. Lasker laisse son cavalier e4 en prise : en échange, la colonne f s'ouvre devant le roi blanc et les pions centraux noirs vont avancer. Le meilleur coup. [%cal Gf8f1] }
14. fxe4 { Les Blancs prennent le cavalier : ils ont une pièce de plus. Le meilleur coup. }
14... d4 { LE PION ATTAQUE LE FOU e3. La pièce va revenir. Le meilleur coup. [%cal Gd4e3] }
15. Qd2 { LA BONNE DÉFENSE selon Stockfish. La dame se place derrière le fou : après ...dxe3, elle reprendra. Les Blancs rendent la pièce mais gardent un léger avantage (+0,6). } (15. g3 { LE COUP DE LA PARTIE, une faute (+0,6 → -0,6). Le pion chasse la dame, mais le fou e3 reste attaqué. } 15... Qf6 { La dame se replie et vise la colonne f. Presque aussi bon que 15...Qh3. } 16. Bxd4 { Le fou se sacrifie en d4 : Marshall rend la pièce. Le meilleur coup dans cette position. } 16... exd4 { Le pion reprend. Les Noirs ont un pion passé en d4. Presque aussi bon que 16...Rd8. } 17. Rf1 { La tour attaque la dame f6. Le meilleur coup. } 17... Qxf1+ { La dame se donne contre la tour pour échanger les dernières pièces lourdes. Presque aussi bon que 17...Qh6. } 18. Qxf1 { La dame reprend. Le seul coup. } 18... Rxf1+ { La tour reprend avec échec. Le meilleur coup. } 19. Kxf1 { Le roi reprend. Le seul bon coup. } 19... Rb8 { La tour attaque le pion b2. Le matériel est égal (-0,1), mais les Noirs ont la tour active, le pion passé d4, et le cavalier blanc n'est toujours pas développé. La suite est au chapitre 8. [%cal Gb8b2] }) 15... dxe3 { Le pion prend le fou. Le meilleur coup : la pièce est récupérée, le matériel est égal. }
16. Qxe3 { La dame reprend en e3 et se centralise. Le meilleur coup. }
16... Be6 { Le fou se développe. Presque aussi bon que 16...Rf4. }
17. Nd2 { Le cavalier blanc sort enfin de sa case de départ, mais bien tard. Le meilleur coup.

Bilan : le sacrifice 13...fxe5 n'a rien coûté. Il a permis aux Noirs d'ouvrir la colonne f et d'activer toutes leurs pièces. Les Blancs gardent un très léger avantage (+0,6), dû à la structure de pions noire (pions c doublés). }`,
    ),
    chapter(
      "Marshall – Lasker : le roi et la tour actifs",
      "2b5/p1p1k1pp/8/2p4r/2PpP3/1P4P1/P2N3P/5RK1 w - - 4 25",
      `{ Suite de Marshall – Lasker, 1907 (voir le chapitre 7). Le matériel est maintenant ÉGAL : tour, pièce mineure et six pions de chaque côté. Pourtant les Noirs sont nettement mieux (-1,4), et leur avantage deviendra décisif.

Compare l'activité des pièces :
- la tour noire h5 circule librement sur la cinquième et la sixième rangée, la tour blanche f1 n'a aucune cible ;
- le fou c8 n'a pas d'adversaire de sa couleur et vise g4 ;
- le pion d4 est passé et protégé par c5 : il bloque le cavalier blanc ;
- le roi noir va marcher vers le centre, le roi blanc restera en arrière.

Plusieurs imprécisions ont été jouées des deux côtés avant cette position (21.c4, 22...c5, 23.Nd2, 23...Kf7, puis 24.Rf1+, un échec qui a surtout aidé le roi noir à se centraliser).

PRO TIP : en finale, compte les pièces ACTIVES plutôt que les pièces présentes. Une tour qui ne fait que défendre est à moitié perdue. }
25. a3 { Les Blancs protègent la case b4. Stockfish préférait 25.h4 ; l'écart reste raisonnable. }
25... Rh6 { La tour se prépare à passer à l'aile dame par la sixième rangée. Le meilleur coup. [%cal Gh6a6] }
26. h4 { Le pion avance pour libérer le roi blanc. Un rien moins précis que 26.Rb1. }
26... Ra6 { La tour attaque le pion a3. Le meilleur coup. [%cal Ga6a3] }
27. Ra1 { La tour blanche doit défendre a3 : elle devient totalement passive. Le meilleur coup dans cette position. }
27... Bg4 { Le fou se place en g4 et contrôle les cases blanches de l'aile roi blanche. Le meilleur coup. }
28. Kf2 { Le roi blanc avance. Un des trois meilleurs coups. }
28... Ke6 { Le roi noir monte au centre. Presque aussi bon que 28...Kf6. }
29. a4 { Le pion avance pour libérer la tour a1. Un rien moins bon que 29.e5. }
29... Ke5 { LE ROI S'INSTALLE EN E5 et attaque le pion e4. Le meilleur coup : la position devient décisive (-4). [%cal Ge5e4] }
30. Kg2 { Le roi recule. Stockfish préférait 30.a5 ; la position est perdue de toute façon. }
30... Rf6 { La tour noire prend la colonne f. Le meilleur coup. }
31. Re1 { La tour défend le pion e4. Un des trois meilleurs coups. }
31... d3 { LE PION PASSÉ AVANCE : il libère la case d4 pour le roi noir. Presque aussi bon que 31...a5. [%cal Ge5d4] }
32. Rf1 { La tour propose l'échange. Le meilleur coup. }
32... Kd4 { Le roi entre en d4 et attaque c4 et e4. Presque aussi bon que 32...a5. [%cal Gd4c4,Gd4e4] }
33. Rxf6 { Les tours s'échangent. Le meilleur coup. }
33... gxf6 { Le pion reprend. Le meilleur coup.

Bilan : à matériel égal, le roi noir en d4 et le pion d3 paralysent le cavalier et le roi blancs. Lasker gagnera la finale en épuisant les coups de pions blancs. }`,
    ),
    chapter(
      "Tarrasch – Thorold : la tour agressive contre le pion de plus",
      "2kr2nr/pp4pp/8/4p3/3p4/3P4/PP1N2PP/R3R1K1 w - - 0 18",
      `{ Tarrasch – Thorold, 1890. Les dames ont été échangées très tôt. Les Noirs ont un pion de plus (e5), mais leur roi c8 est sur la colonne c ouverte et leur cavalier g8 n'est pas développé. Les tours blanches, elles, vont se placer sur les colonnes ouvertes.

La règle des finales de tours que Tarrasch appliquait : une tour doit être ACTIVE. Elle doit attaquer des pions adverses ou soutenir l'avance d'un pion ami. Une tour qui ne fait que défendre perd presque toujours face à une tour active.

PRO TIP : en finale, rends un pion sans hésiter si cela permet à ta tour d'atteindre la septième rangée. }
18. Rac1+ { La tour prend la colonne c avec échec. Presque aussi bon que 18.Rxe5. [%cal Gc1c8] }
18... Kb8 { Le roi s'écarte. C'est le seul bon coup : 18...Kd7 donnait +1,6 aux Blancs. }
19. Rxe5 { La tour prend le pion e5 : le matériel est égal. Le meilleur coup. }
19... Nf6 { Le cavalier g8 quitte enfin sa case de départ et vise d5. Le meilleur coup. }
20. Rce1 { Les deux tours blanches se doublent sur la colonne e. Un rien moins précis que 20.Nb3. [%cal Ge1e8] }
20... Nd5 { LE BON COUP selon Stockfish. Le cavalier se centralise en d5 et se prépare à aller en b4 pour attaquer d3. La position reste égale. [%cal Gd5b4] } (20... Rhe8 { LE COUP DE LA PARTIE, une faute (+0,1 → +1,5). La tour propose l'échange sur la colonne e, mais l'autre tour blanche pourra alors entrer en e7. } 21. Rxe8 { La tour échange. Le meilleur coup. } 21... Nxe8 { Le cavalier reprend : il retourne en e8, où il est passif. Le meilleur coup. } 22. Re7 { LA TOUR ENTRE EN SEPTIÈME RANGÉE. Elle attaque b7, g7 et le cavalier e8, qui doit rester en e8 pour garder g7. Le meilleur coup. [%cal Ge7b7,Ge7g7] } 22... a6 { Les Noirs donnent une case au roi. 22...Rc8 était plus actif (+1,3 contre +1,8). } 23. Nb3 { Le cavalier attaque le pion d4. Un des trois meilleurs coups. [%cal Gb3d4] } 23... Kc8 { LA MEILLEURE DÉFENSE selon Stockfish : le roi vient défendre la septième rangée. } (23... b6 { LE COUP DE LA PARTIE, une nouvelle imprécision (+1,8 → +2,3). } 24. Nxd4 { Le cavalier prend le pion d4. Le meilleur coup. } 24... Rxd4 { La tour reprend et attaque le pion d3. Le meilleur coup. } 25. Rxe8+ { La tour prend le cavalier avec échec : au bout des échanges, les Blancs ont gagné un pion. Le meilleur coup. } 25... Kc7 { Le roi s'avance. Presque aussi bon que 25...Kb7. Ici, Stockfish recommande 26.Re7+, qui garde la tour active sur la septième rangée (+2,6) ; dans la partie, Tarrasch a joué 26.Re3, plus passif (+1,2). })) 21. Nf3 { Le cavalier blanc se développe et vise d4 et g5. Le meilleur coup. }
21... Nb4 { Le cavalier attaque le pion d3. Presque aussi bon que 21...Nf4. [%cal Gb4d3] }
22. Re7 { La tour entre en septième rangée. Un des trois meilleurs coups, presque à égalité.

Bilan : avec 20...Nd5, le cavalier noir devient actif et menace le pion d3 : les Noirs ont autant d'activité que les Blancs, et la position reste égale. Dans la partie, le cavalier est retourné en e8, et la tour blanche a dominé la septième rangée. }`,
    ),
    chapter(
      "Tartakower – Domenech : une pièce contre deux pions passés",
      "3n2k1/1p3p1p/p5p1/P3b3/1P2B2P/2P5/3B1PP1/6K1 w - - 1 31",
      `{ Tartakower – Domenech, 1934. Les Blancs ont la paire de fous et un pion de plus à l'aile dame (a5, b4, c3 contre a6, b7). La position est déjà décisive (+3,6) : les coups de la partie restent en ligne principale.

L'idée de Tartakower : donner un FOU pour créer deux pions passés liés à l'aile dame. Deux pions passés liés sur la sixième rangée sont plus forts qu'une pièce, parce qu'ils se protègent l'un l'autre et qu'une seule pièce adverse ne peut pas arrêter les deux.

PRO TIP : avant de sacrifier une pièce contre des pions, compte les coups jusqu'à la promotion et vérifie que les pièces adverses ne peuvent pas les bloquer à temps. }
31. c4 { Le pion c avance et prépare b5. Stockfish préférait 31.Kf1, l'écart est faible. }
31... Kf8 { Le roi noir se rapproche du centre. Le meilleur coup. }
32. b5 { LE PION B ATTAQUE a6. Stockfish préférait 32.g4, mais le coup de la partie prépare le sacrifice et garde un avantage décisif. [%cal Gb5a6] }
32... Ke8 { Le roi continue vers l'aile dame. 32...Bb8 tenait mieux (+3,6 contre +5,5). }
33. Bxb7 { LE SACRIFICE. Le fou prend le pion b7 ; si le cavalier le prend, les pions a et b avancent. Le meilleur coup. [%cal Gb5b6,Ga5a6] }
33... axb5 { Le pion prend en b5. Presque aussi bon que 33...Kd7. }
34. a6 { LE PION A AVANCE, protégé par le fou b7. Il menace d'aller en a7. Le meilleur coup. [%cal Ga6a7] }
34... Bb8 { Le fou vient garder la case a7. 34...Bd4 résistait mieux (+5,6 contre +6,8). [%cal Gb8a7] }
35. cxb5 { Le pion c reprend en b5 : les Blancs ont maintenant deux pions passés liés, a6 et b5. Le meilleur coup. [%csl Ga6,Gb5] }
35... Nxb7 { Le cavalier prend le fou : les Blancs ont une pièce de moins. Presque aussi bon que 35...Kd7. }
36. b6 { Le pion b avance encore. Les deux pions avancent ensemble : le pion a6 attaque le cavalier b7, le pion b6 couvre la case a7. Le meilleur coup. [%cal Gb6b7] }
36... Kd7 { Le roi arrive trop tard. 36...Nc5 durait un peu plus. }
37. a7 { Le pion a attaque le fou b8 et menace a8, promotion. Le meilleur coup (+8,3) ; les Noirs abandonnent ici.

Bilan : les Blancs ont rendu une pièce entière, mais leurs deux pions passés, liés et très avancés, valent bien plus. Les pièces noires (fou b8, cavalier b7) sont réduites à des bloqueurs passifs. }`,
    ),
  ],
};
