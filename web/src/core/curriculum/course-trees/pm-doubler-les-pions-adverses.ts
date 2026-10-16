import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « Doubler les pions adverses » (positional_mastery, module 7) —
 * refonte « un commentaire par coup » du 2026-10-10.
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, entièrement
 * réécrite ici) : Lasker – Capablanca (Saint-Pétersbourg 1914), Botvinnik –
 * Capablanca (AVRO 1938, étude Lichess dédiée), Johner – Nimzowitsch (Dresde
 * 1926), Håkansson – Nimzowitsch (Kristianstad 1922) et Nimzowitsch –
 * Rosselli (Baden-Baden 1925), tels que commentés dans « Mon système » de
 * Nimzowitsch ; Fischer – Euwe (Leipzig 1960) ; trois positions courtes de
 * l'étude Lichess « Doubled Pawns » (a8arx17S).
 *
 * Toutes les parties ont été rejouées avec chess.js et chaque coup sondé avec
 * Stockfish 18 (profondeur 18, 3 candidats par coup). Règle appliquée (comme
 * pour les modules 3 et 6) : quand un coup est nettement moins bon que le
 * choix du moteur (environ 0,6 pion ou plus, ou un changement d'évaluation),
 * la LIGNE PRINCIPALE suit le moteur et la suite de la partie passe en
 * variante, signalée comme fautive ; les écarts plus petits sont seulement
 * mentionnés dans le commentaire. Les évaluations citées sont du point de vue
 * des Blancs.
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

export const DOUBLER_LES_PIONS_ADVERSES: CourseTree = {
  chapters: [
    chapter(
      "Les pions doublés isolés : une cible pour toute la partie",
      "1rb1r1k1/p1q2ppp/2p2n2/2p5/2N5/1P2PB1P/P1Q2PP1/2RR2K1 w - - 0 1",
      `{ Deux pions de la même couleur sur la même colonne sont « doublés ». Le pion de devant bloque celui de derrière, et aucun des deux ne peut protéger l'autre. Quand, en plus, il n'y a aucun pion ami sur les colonnes voisines, on parle de pions doublés ISOLÉS : c'est la pire version, car seules des pièces peuvent les défendre.

Ici, les pions noirs c6 et c5 sont doublés et isolés (les colonnes b et d sont vides de pions noirs). Les Blancs n'ont aucune faiblesse. Leur plan : attaquer ces pions avec le plus de pièces possible (cavalier, dame, fou f3 sur la grande diagonale, tour c1), puis échanger les dames pour arriver dans une finale où les Noirs ne pourront plus tout défendre.

PRO TIP : un pion faible ne se gagne presque jamais d'un coup. On l'attaque plus de fois qu'il n'est défendu, on oblige les pièces adverses à rester passives, puis on échange les pièces qui le défendent. [%csl Rc6,Rc5] }
1. Nd6 { Le cavalier saute en d6 et attaque la tour e8. Stockfish préférait de très peu 1.Qc3, qui attaque c5 tout de suite (+2,8 contre +2,7) : les deux coups suivent le même plan. [%cal Gd6e8] }
1... Re5 { La tour s'échappe en e5, d'où elle protège le pion c5 le long de la 5e rangée. C'est la meilleure défense : après 1...Rd8, 2.Qxc5 gagnait déjà un pion. }
2. Qc3 { La dame attaque deux cibles à la fois : le pion c5 sur la colonne c, et la tour e5 sur la diagonale. [%cal Gc3c5,Gc3e5] }
2... Qe7 { La dame protège la tour e5 et attaque le cavalier d6. Mais elle quitte c7 : le pion c6 n'est plus défendu, et le fou f3 le vise. }
3. Nc4 { Le cavalier recule en attaquant la tour e5. De c4, il surveille b6, d6 et e5, les cases autour des pions doublés. }
3... Rg5 { La tour quitte e5 et vise g2 : les Noirs cherchent du contre-jeu contre le roi, faute de pouvoir défendre leurs pions. }
4. h4 { Le pion chasse la tour avec gain de temps. }
4... Nd5 { Le cavalier se centralise en attaquant la dame c3 et le pion e3 : les Noirs regagnent un temps. Il est protégé par le pion c6, qui sert enfin à quelque chose. }
5. Qa1 { La dame s'écarte et prend la grande diagonale a1-h8, en direction de g7. Stockfish jugeait 5.Qd3 à peine plus précis. [%cal Ga1g7] }
5... Rg6 { La tour recule et protège g7. 5...Bg4 était un peu plus tenace (Stockfish). }
6. Qe5 { La dame s'installe au centre : elle attaque la tour b8 et le cavalier d5, et propose l'échange des dames. [%csl Ge5] }
6... Qxe5 { Les Noirs échangent, ils n'avaient pas mieux : la tour b8 était attaquée. }
7. Nxe5 { Le cavalier reprend en attaquant à la fois la tour g6, le pion f7 et le pion c6. Sans les dames, les pions doublés isolés deviennent une proie. }
7... Re6 { La tour chasse le cavalier tout en gardant c6 le long de la 6e rangée. }
8. Nd3 { Le cavalier se replace et attaque le pion c5, qu'aucun pion ne peut défendre. 8.Nxc6 gagnait aussi un pion tout de suite (après 8...Rxc6, 9.Rxd5 : le cavalier d5 n'est plus protégé). Dans les deux cas, les Blancs gagnent l'un des pions doublés (Stockfish : environ +3,6).

PRO TIP : face à des pions doublés isolés, cherche l'échange des dames. En milieu de partie, l'adversaire peut s'en servir pour bloquer des cases ; en finale, ce ne sont plus que des pions à défendre. } *`,
    ),
    chapter(
      "Lasker – Capablanca (1) : doubler pour gagner la finale",
      "r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
      `{ Saint-Pétersbourg 1914, partie décisive du tournoi. Dans la variante d'échange de l'Espagnole, les Blancs donnent leur fou contre le cavalier c6 pour doubler les pions c noirs.

Le calcul est simple : après l'échange des pions d, les Blancs ont 4 pions contre 3 à l'aile roi, les Noirs 4 contre 3 à l'aile dame. Mais la majorité noire contient des pions doublés : elle ne peut pas créer de pion passé à elle seule. La majorité blanche, elle, le peut. Les Blancs veulent donc échanger les dames et aller vers la finale.

En contrepartie, les Noirs ont la paire de fous et un développement facile. C'est le double visage des pions doublés : faiblesse à long terme, mais activité immédiate pour celui qui les reçoit. [%csl Rc7,Rc6] }
4. Bxc6 { Lasker échange son fou contre le cavalier pour doubler les pions noirs. Stockfish préfère le classique 4.Ba4 (+0,5), mais 4.Bxc6 reste tout à fait jouable (environ 0,0) : c'est un choix de structure, pas une erreur. }
4... dxc6 { Les Noirs reprennent vers le centre : la colonne d s'ouvre et le fou c8 est libéré. Les pions c7 et c6 sont maintenant doublés. }
5. d4 { Les Blancs ouvrent le centre pour échanger les dames au plus vite. Stockfish préférait le calme 5.O-O, mais l'écart est faible (−0,4 contre −0,1). }
5... exd4 { Les Noirs prennent. }
6. Qxd4 { La dame reprend et propose l'échange. }
6... Qxd4 { Capablanca accepte. Chaque camp pense avoir un atout pour la finale : la structure pour les Blancs, la paire de fous pour les Noirs. }
7. Nxd4 { Le cavalier reprend et se centralise. La structure de la variante d'échange est en place : 4 pions blancs contre 3 à l'aile roi, et une majorité noire qui ne fera jamais de pion passé. }
7... Bd6 { Le fou se développe et vise h2. Stockfish préférait de peu 7...Bd7. }
8. Nc3 { Le dernier cavalier se développe. Stockfish proposait 8.f3, qui consolide e4 avant tout, mais la différence est minime. }
8... Ne7 { Le cavalier se développe sans gêner le fou d6 ni le pion f. }
9. O-O { Le roi se met à l'abri ; il reviendra au centre quand la finale sera là. Stockfish préférait 9.h4, mais les deux coups sont proches. }
9... O-O { Les Noirs roquent à leur tour. 9...b6, pour préparer ...c5 et ...Bb7, était un peu plus précis. }
10. f4 { Les Blancs mettent en marche leur majorité de l'aile roi : f4, puis f5, gagnera de l'espace et coupera le fou c8. }
10... Re8 { La tour presse le pion e4. }
11. Nb3 { Le cavalier se retire. Stockfish préférait 11.Kf2, qui protège e2 et garde le cavalier au centre. }
11... f6 { Les Noirs empêchent e4-e5. Mais ce pion f ne contrôle plus la case e6 : elle devient un trou, que le cavalier blanc visera bientôt. 11...a5, actif à l'aile dame, était meilleur selon Stockfish. [%csl Re6] }
12. f5! { Le pion avance et prend le contrôle de e6 et g6. Le fou c8 est enfermé derrière ce pion. Le meilleur coup selon Stockfish. [%cal Gf5e6,Gf5g6] }
12... b6 { Les Noirs préparent ...Bb7 et ...c5. 12...c5 tout de suite était équivalent. }
13. Bf4 { Les Blancs proposent l'échange du fou d6 : sans paire de fous, les Noirs perdront leur principale compensation. }
13... Bb7 { Capablanca laisse faire. 13...Bxf4 était un peu plus précis (Stockfish : −0,1 au lieu de +0,2). }
14. Bxd6 { Les Blancs échangent : les Noirs n'ont plus la paire de fous. }
14... cxd6 { Les Noirs reprennent du pion c7, qui va en d6 : les pions doublés disparaissent ! Mais un nouveau problème apparaît : le pion d6 est arriéré sur une colonne ouverte, et la case e6 reste un trou.

PRO TIP : quand l'adversaire « répare » ses pions doublés, regarde quelle nouvelle faiblesse cette réparation a créée. Ici, ce sont d6 et e6. [%csl Rd6,Re6] } *`,
    ),
    chapter(
      "Lasker – Capablanca (2) : l'étau du cavalier e6",
      "r3r1k1/1b2n1pp/pppp1p2/5P2/4P3/1NN5/PPP3PP/R4RK1 w - - 0 15",
      `{ Les pions doublés de l'ouverture ont disparu, mais ils ont laissé deux traces : le pion d6 arriéré et le trou en e6. Lasker va installer un cavalier en e6, d'où aucun pion noir ne pourra le chasser, puis pousser sa majorité de l'aile roi.

Le plan des Noirs : bouger leur majorité de l'aile dame (...b5, ...a5) pour ouvrir des lignes, et attendre le bon moment pour éliminer le cavalier e6.

PRO TIP : une pièce installée sur un trou, au cœur du camp adverse, vaut souvent plus qu'une tour. N'hésite pas à la sacrifier ou à la prendre au prix d'une qualité. }
15. Nd4 { Le cavalier se dirige vers e6. [%cal Gd4e6] }
15... Rad8 { La tour vient sur la colonne d. Plus précis était 15...Ra7, qui garde la 7e rangée (Stockfish : +0,3 au lieu de +0,7). }
16. Ne6 { Le cavalier s'installe en e6 : le pion f est en f6 et le pion d en d6, aucun pion noir ne peut plus l'attaquer. Il vise la tour d8 et le pion g7. [%csl Ge6] }
16... Rd7 { La tour s'écarte et garde la 7e rangée. }
17. Rad1 { La tour vise le pion d6 arriéré. }
17... Nc8 { Le cavalier vient défendre d6 (et e7). 17...c5 était un peu meilleur selon Stockfish. }
18. Rf2 { La tour se prépare à doubler sur la colonne d. Stockfish préférait 18.b3, mais le plan est le même. }
18... b5 { Les Noirs gagnent de l'espace à l'aile dame et préparent ...a5. Stockfish proposait 18...d5, pour se débarrasser du pion faible. }
19. Rfd2 { Les tours sont doublées contre le pion d6. }
19... Rde7 { La tour attaque le cavalier e6, solidement protégé par le pion f5. Stockfish recommandait plutôt 19...Kf7. }
20. b4 { Les Blancs figent les pions noirs de l'aile dame : la poussée ...c5 devient très difficile. 20.a3 était aussi bon. }
20... Kf7 { Le roi attaque à son tour le cavalier e6, toujours protégé par f5. }
21. a3 { Le pion soutient b4 : si les Noirs jouent ...a5 et prennent en b4, les Blancs reprendront du pion a. }
21... Ba8 { Le fou libère la case b7, pour que la tour e7 puisse aller en a7 le long de la 7e rangée. }
22. Kf2 { Le roi se rapproche du centre : en finale, c'est une pièce active. }
22... Ra7 { La tour se place derrière le pion a pour préparer ...a5. Stockfish préférait 22...Bb7 (+1,0 au lieu de +1,4). }
23. g4 { Les Blancs lancent leur majorité de l'aile roi : g4-g5 menacera d'ouvrir des lignes. Le meilleur coup selon Stockfish. }
23... h6 { Les Noirs freinent g4-g5. Stockfish préférait 23...Rae7. }
24. Rd3 { La tour libère la 2e rangée et pourra passer sur la colonne g ou h. }
24... a5 { La rupture prévue : les Noirs ouvrent la colonne a. }
25. h4 { Les Blancs préparent g4-g5. Le meilleur coup. }
25... axb4 { Les Noirs prennent. }
26. axb4 { Les Blancs reprennent : la colonne a est ouverte. }
26... Rae7 { La tour revient presser le cavalier e6. }
27. Kf3 { Le roi soutient la poussée g4-g5. Stockfish préférait 27.g5 tout de suite (+1,6 au lieu de +1,4). }
27... Rg8 { La tour vient défendre l'aile roi. 27...Bb7 était plus précis (Stockfish). }
28. Kf4 { Le roi se place derrière ses pions pour soutenir g4-g5. }
28... g6 { Les Noirs attaquent le pion f5. Le meilleur coup. }
29. Rg3 { La tour protège g4 et prépare l'ouverture d'une colonne. Stockfish préférait 29.g5 (+1,9 contre +1,4). }
29... g5+ { Les Noirs ferment l'aile roi avec échec. Le meilleur coup. }
30. Kf3 { Le roi recule. Le pion h4 est attaqué ; la colonne h va s'ouvrir. }
30... Rxe6! { Stockfish trouve le sacrifice de qualité : les Noirs rendent une tour contre le cavalier e6, la pièce qui les étouffe depuis quinze coups. Les Blancs gardent l'avantage (environ +1,7), mais la partie continue. [%cal Ge7e6] }
(30... Nb6? { Le coup de la partie est une faute : le cavalier quitte c8, d'où il gardait d6 et e7, et les Noirs n'auront plus aucune défense quand la colonne h s'ouvrira (Stockfish : +3,2). La suite au chapitre suivant. })
31. fxe6+ { Les Blancs reprennent avec échec. }
31... Kxe6 { Le roi reprend le pion et s'installe en e6, sur la case même du cavalier. Les Noirs ont une qualité de moins, mais plus aucun cavalier dominant devant eux.

PRO TIP : le sacrifice de qualité est l'arme classique contre une pièce installée sur un trou. Mieux vaut une qualité de moins qu'une position sans aucun coup utile. } *`,
    ),
    chapter(
      "Lasker – Capablanca (3) : la percée e4-e5",
      "b5r1/4rk2/1nppNp1p/1p3Pp1/1P2P1PP/2N2KR1/2P5/3R4 w - - 2 31",
      `{ La position après la faute 30...Nb6?. Lasker ouvre la colonne h pour ses tours, puis sacrifie le pion e4 pour libérer la case e4 à son second cavalier.

Les pions doublés du 4e coup ont disparu depuis longtemps, mais toute la partie est née d'eux : sans la paire de fous et avec un pion d6 arriéré, les Noirs n'ont jamais trouvé de contre-jeu. }
31. hxg5 { La colonne h s'ouvre : les tours blanches vont y entrer. Le meilleur coup (Stockfish : +3,2). }
31... hxg5 { Les Noirs reprennent du pion h. }
32. Rh3 { La tour prend la colonne h. [%cal Gh3h8] }
32... Rd7 { La tour revient défendre la 7e rangée. Stockfish préférait 32...Nc4, pour activer le cavalier. }
33. Kg3 { Le roi protège le pion g4 et s'écarte de la colonne f. }
33... Ke8 { Le roi s'éloigne vers l'aile dame pour fuir la colonne h. 33...Bb7 était un peu plus tenace. }
34. Rdh1 { Les tours sont doublées sur la colonne h. Stockfish préférait 34.e5 tout de suite (+5,2 contre +4,4), mais le gain reste certain. }
34... Bb7 { Le fou revient en jeu. }
35. e5! { La percée : en sacrifiant ce pion, Lasker libère la case e4 pour son cavalier c3, et ouvre la position. Le meilleur coup. [%cal Gc3e4] }
35... dxe5 { Les Noirs prennent. }
36. Ne4 { Le cavalier occupe e4 et attaque f6 et g5. Les deux cavaliers blancs dominent l'échiquier. }
36... Nd5 { Le cavalier se centralise et attaque le pion b4. }
37. N6c5 { Le cavalier e6 attaque à la fois la tour d7 et le fou b7 : une fourchette. [%cal Gc5d7,Gc5b7] }
37... Bc8 { Le fou se met à l'abri tout en protégeant la tour d7. }
38. Nxd7 { Le cavalier prend la tour : les Blancs gagnent la qualité. }
38... Bxd7 { Le fou reprend. }
39. Rh7 { La tour pénètre en 7e rangée et attaque le fou d7. }
39... Rf8 { La tour protège le pion f6. Stockfish trouvait 39...Kd8 plus tenace, sans changer le résultat. }
40. Ra1 { L'autre tour file vers la colonne a pour entrer en a8. }
40... Kd8 { Le roi protège le fou d7. }
41. Ra8+ { La tour donne échec sur la 8e rangée. }
41... Bc8 { Le fou s'interpose. }
42. Nc5 { Le fou c8, cloué par la tour a8, ne peut plus bouger, et le cavalier menace d'entrer en b7 avec échec. Capablanca abandonne.

PRO TIP : la structure décide souvent de la partie bien avant la phase décisive. Ici, l'échange 4.Bxc6 a fixé le plan des Blancs pour quarante coups. } 1-0`,
    ),
    chapter(
      "Botvinnik – Capablanca (1) : la Nimzo-indienne et le plan f3-e4",
      "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N1P3/PP3PPP/R1BQKBNR w KQkq - 0 5",
      `{ AVRO 1938. Dans la Nimzo-indienne, les Noirs échangent volontiers leur fou b4 contre le cavalier c3 pour doubler les pions blancs : c'est l'idée même de l'ouverture.

Les Blancs reçoivent en échange la paire de fous et un centre fort. Leur grand plan est de jouer f2-f3 puis e3-e4, pour mettre ce centre en mouvement. Les Noirs, eux, visent les pions faibles de l'aile dame (a3 et c3) : ils les fixent par ...c4, puis les attaquent avec leurs pièces.

PRO TIP : face à des pions doublés, fixe-les d'abord (ici par ...c4), attaque-les ensuite. Un pion faible qui peut encore avancer n'est pas vraiment faible. }
5. a3 { Les Blancs posent la question au fou b4 : il doit prendre en c3 ou reculer. }
5... Bxc3+ { Capablanca double les pions blancs : il donne la paire de fous contre une structure abîmée. }
6. bxc3 { Les Blancs reprennent vers le centre. Les pions c3 et c4 sont doublés, mais ils contrôlent d4, b4 et d5, et la colonne b s'ouvre pour une tour. [%csl Rc3,Rc4] }
6... c5 { Les Noirs attaquent aussitôt le centre. 6...b6 était tout aussi bon. }
7. cxd5 { Les Blancs échangent leur pion c4 : les pions doublés disparaissent, mais le pion c3 restera une cible sur la colonne c. }
7... exd5 { Les Noirs reprennent du pion e et gardent un pion solide en d5. }
8. Bd3 { Le fou se développe vers l'aile roi. }
8... O-O { Les Noirs roquent. }
9. Ne2 { Le cavalier va en e2, et non en f3 : il laisse au pion f la liberté d'avancer en f3 pour soutenir e3-e4. C'est le plan blanc de cette structure, et le meilleur coup selon Stockfish. [%cal Gf2f3,Ge3e4] }
9... b6 { Les Noirs préparent ...Ba6 pour échanger le bon fou blanc. }
10. O-O { Les Blancs roquent. }
10... Ba6 { Le fou propose l'échange contre le fou d3, la meilleure pièce blanche pour l'attaque. }
11. Bxa6 { Les Blancs acceptent l'échange. }
11... Nxa6 { Le cavalier reprend. Il est décentré en a6 et cherchera une route vers les cases faibles de l'aile dame blanche (c4, b3). }
12. Qd3! { Stockfish montre le coup le plus précis : la dame se développe en attaquant le cavalier a6, et garde un œil sur e4 et f5 (+0,4). [%cal Gd3a6] }
(12. Bb2?! { Le coup de la partie place le fou sur une case passive, derrière le pion c3 (Stockfish : environ 0,0 au lieu de +0,4). } 12... Qd7! { La dame vise le pion a4 et les cases blanches de l'aile dame. } 13. a4 { Le pion avance pour échapper à la pression, mais il devient une cible. Stockfish préférait 13.Ng3. } 13... Rfe8 { La tour occupe la colonne e. 13...Rfc8 était un peu meilleur. } 14. Qd3 { La dame se développe. Stockfish préférait 14.c4, pour se débarrasser du pion c (−0,4 au lieu de +0,1). } 14... c4 { Le pion fixe c3 avec gain de temps sur la dame. } 15. Qc2 { La dame recule. } 15... Nb8?! { Le cavalier entame un long voyage vers b3 par c6 et a5, mais ce plan est trop lent : 15...h5 gardait l'avantage aux Noirs (Stockfish : −0,3 au lieu de +0,3). } 16. Rae1 { La tour soutient la poussée e3-e4. } 16... Nc6 { Le cavalier continue sa route. } 17. Ng3 { Le cavalier contrôle e4 et f5. } 17... Na5? { Le cavalier vise b3, mais il s'éloigne du roi au pire moment : les Blancs vont pousser f3 et e4. 17...Ne4 maintenait l'équilibre (Stockfish : +1,2 au lieu de +0,2). La suite au chapitre suivant. })
12... c4 { Les Noirs fixent le pion c3 avec gain de temps sur la dame. Le meilleur coup. }
13. Qc2 { La dame recule et garde la case e4. }
13... Nc7 { Le cavalier quitte a6 et se rapproche du centre. 13...Re8 était équivalent. }
14. Ng3 { Le cavalier contrôle e4 et f5. 14.f3 tout de suite était aussi bon. }
14... Re8 { La tour occupe la colonne e, face à la poussée e3-e4. }
15. f3 { Le plan est en route : e3-e4 suivra, et le centre blanc se mettra en mouvement. La position est proche de l'équilibre (Stockfish : +0,4).

PRO TIP : le camp qui a les pions doublés doit agir vite (ici au centre), avant que l'adversaire n'ait eu le temps de les attaquer. } *`,
    ),
    chapter(
      "Botvinnik – Capablanca (2) : le centre se met en marche",
      "r3r1k1/p2q1ppp/1p3n2/n2p4/P1pP4/2P1P1N1/1BQ2PPP/4RRK1 w - - 6 18",
      `{ La position après 17...Na5?. Capablanca a fixé et attaqué les faiblesses de l'aile dame : son cavalier ira en b3 et il gagnera le pion a4. Mais pendant ce temps, Botvinnik pousse f3 et e4, et son centre devient une arme.

C'est la compensation dynamique des pions doublés : les Blancs ont perdu un pion à l'aile dame, mais toutes leurs pièces visent le roi noir. }
18. f3 { Le plan blanc démarre : f3 prépare e3-e4. Le meilleur coup. }
18... Nb3 { Le cavalier s'installe en b3, une case forte, mais il est loin de son roi. }
19. e4 { La poussée centrale : les Blancs abandonnent le pion a4 pour attaquer. Le meilleur coup. }
19... Qxa4 { Capablanca prend le pion. Ses pions de l'aile dame pourront un jour créer un pion passé. }
20. e5 { Le pion chasse le cavalier f6, le principal défenseur du roi. }
20... Nd7 { Le cavalier recule. }
21. Qf2 { La dame se dirige vers l'aile roi et soutiendra f4. Stockfish préférait 21.Nf5 (+1,5 contre +1,0). }
21... g6 { Les Noirs empêchent Nf5. }
22. f4 { Les Blancs préparent f4-f5. }
22... f5 { Les Noirs bloquent le pion f. Le meilleur coup. }
23. exf6 { Les Blancs prennent en passant pour ouvrir les lignes. }
23... Nxf6 { Le cavalier reprend. }
24. f5! { Le pion avance quand même : il attaque g6 et ouvre la colonne f. Le meilleur coup. }
24... Rxe1 { Les Noirs échangent une paire de tours. }
25. Rxe1 { La tour reprend : la colonne e appartient aux Blancs. }
25... Re8 { Les Noirs contestent la colonne e. Plus tenace était 25...Qd7 (Stockfish : +1,8 au lieu de +2,4). }
26. Re6! { La tour s'installe en e6, protégée par le pion f5. Le meilleur coup. }
26... Rxe6 { Les Noirs échangent. }
27. fxe6 { Le pion reprend et arrive en e6 : c'est un pion passé, déjà très avancé. }
27... Kg7 { Le roi protège le cavalier f6. }
28. Qf4 { La dame attaque le cavalier f6 et menace d'entrer en c7 ou en e5. }
28... Qe8 { La dame se place devant le pion passé pour le bloquer. }
29. Qc7+! { Le coup le plus précis selon Stockfish (+3,4) : la dame entre en 7e rangée avec échec avant de revenir au centre. }
(29. Qe5 { Le coup de la partie, très naturel : la dame se centralise et cloue le cavalier f6. Mais il laissait aux Noirs la défense 29...h5! (Stockfish : +1,6 au lieu de +3,4). } 29... Qe7? { La faute décisive : la dame quitte e8 et sera déviée. 29...h5 tenait encore (+1,6). } 30. Ba3!! { Le célèbre coup de Botvinnik : le fou attaque la dame e7, qui défend le cavalier f6 et la case de promotion du pion e. [%cal Ga3e7] } 30... Qxa3 { Les Noirs acceptent. 30...Qe8 tenait plus longtemps, sans espoir (+5,4). } 31. Nh5+! { Le cavalier se sacrifie à son tour pour dévier le pion g6. } 31... gxh5 { Les Noirs prennent : le meilleur coup, mais la colonne g est ouverte. } 32. Qg5+ { La dame entre avec échec. } 32... Kf8 { Le roi s'écarte. } 33. Qxf6+ { La dame prend le cavalier avec échec. } 33... Kg8 { Le roi revient. } 34. e7 { Le pion e, né de l'échange des tours, n'a plus qu'une case à franchir. 34.Qg5+ était aussi fort. } 34... Qc1+ { Les Noirs n'ont plus que des échecs. } 35. Kf2 { Le roi s'avance. } 35... Qc2+ { Encore un échec. } 36. Kg3 { Le roi poursuit sa route. } 36... Qd3+ { Encore un échec. } 37. Kh4 { Le roi monte vers h5. } 37... Qe4+ { Encore un échec. } 38. Kxh5 { Le roi prend le pion h5. } 38... Qe2+ { Encore un échec. } 39. Kh4 { Le roi recule. } 39... Qe4+ { Encore un échec. } 40. g4 { Le pion g interrompt la série d'échecs. } 40... Qe1+ { Dernier échec. } 41. Kh5 { Le roi trouve l'abri. Capablanca abandonne : le pion e7 va promouvoir. })
29... Kg8 { Le roi recule. }
30. Qe5 { La dame se centralise : elle attaque le cavalier f6 et soutient le pion e6. }
30... Qe7 { La dame protège le cavalier f6 et bloque le pion e. }
31. Ba3! { Le même coup que dans la partie : le fou attaque la dame e7 et la détourne de la défense de f6 et de e7.

PRO TIP : les pions doublés de c3 ont coûté un pion aux Blancs, mais ils leur ont donné le centre, puis la colonne e et un pion passé en e6. La compensation dynamique se mesure en activité, pas en pions. } *`,
    ),
    chapter(
      "Johner – Nimzowitsch : bloquer les pions doublés",
      "r1bq1rk1/pp1p1ppp/2n1pn2/2p5/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 2 7",
      `{ Dresde 1926. Nimzowitsch double les pions c blancs, puis il construit un mur de pions sur les cases noires (c5, d6, e5) : le fou c1 n'aura plus de diagonale, et les pions c3 et c4 seront figés pour toute la partie.

Le bon plan blanc est de briser ce mur par e3-e4 avant qu'il ne soit complet, pour ouvrir le jeu aux deux fous. Dans la partie, Johner fait le contraire : il ferme lui-même le centre.

PRO TIP : contre la paire de fous, bloque le centre ; avec la paire de fous, ouvre-le. Les pions doublés ne sont une vraie faiblesse que si le centre est fermé. }
7. O-O { Les Blancs roquent. }
7... Bxc3 { Nimzowitsch prend en c3 sans attendre a2-a3 : il double les pions blancs. Stockfish préférait 7...d5, mais l'idée stratégique est claire. }
8. bxc3 { Les pions c3 et c4 sont doublés : celui de derrière ne peut pas protéger celui de devant. [%csl Rc3,Rc4] }
8... d6 { Les Noirs commencent leur mur sur cases noires (c5, d6, puis e5) : le fou c1 se heurtera à ces pions. }
9. Nd2 { Le cavalier se dirige vers b3 et libère le pion f. Stockfish préférait 9.e4, pour ouvrir le jeu aux fous (+0,5 contre +0,3). }
9... b6 { Le pion consolide c5. Stockfish proposait 9...Re8. }
10. Nb3 { Le cavalier attaque c5. Stockfish préférait 10.Bb2. }
10... e5 { Le mur est complet : c5, d6, e5. 10...Ba6 était encore meilleur selon Stockfish. }
11. e4! { Stockfish montre le bon plan : les Blancs avancent eux-mêmes le pion e et préparent l'ouverture du centre (+0,4). [%cal Ge3e4] }
(11. f4? { Le coup de la partie ferme le centre : après la réponse noire, le fou c1 et les pions doublés seront figés (Stockfish : −0,5 au lieu de +0,4). } 11... e4! { Le pion se pose en e4 et bloque tout. Il attaque le fou d3 et prend le contrôle de d3 et f3. } 12. Be2 { Le fou recule ; ses diagonales sont fermées par le pion e4. } 12... Qd7 { La dame se dirige vers f5 et l'aile roi. } 13. h3 { Les Blancs contrôlent g4 et préparent g2-g4. } 13... Ne7 { Le cavalier se dirige vers f5, pour s'opposer à g2-g4. } 14. Qe1 { La dame veut passer sur l'aile roi. Stockfish préférait 14.a4. } 14... h5 { Les Noirs empêchent g2-g4 pour de bon. } 15. Bd2 { Le fou se développe passivement. 15.a4 était plus utile. } 15... Qf5 { La dame s'installe en f5 et vise h3. } 16. Kh2 { Le roi protège le pion h3. } 16... Qh7 { Une manœuvre typique de Nimzowitsch : la dame se place derrière le pion h, pour préparer ...g5 et l'attaque. } 17. a4 { Les Blancs cherchent du jeu à l'aile dame avec a4-a5. } 17... Nf5 { Le cavalier s'installe en f5 et vise e3 et g3. } 18. g3 { Le pion protège h4 et f4, mais il affaiblit encore l'aile roi. } 18... a5! { Les Noirs bloquent aussi l'aile dame : le pion a4 est figé et le cavalier b3 n'a plus aucune case active. Les pions doublés c3 et c4 ne bougeront plus de la partie, et Nimzowitsch gagnera par une attaque à l'aile roi. })
11... exd4 { Les Noirs prennent. }
12. cxd4 { Le pion c3 reprend : les pions doublés se dénouent, et la colonne c s'ouvre. }
12... cxd4 { Les Noirs prennent encore. }
13. Bb2 { Le fou attaque d4 sur la grande diagonale : le fou c1, qui n'avait aucun avenir dans la partie, devient ici une pièce active (Stockfish : +0,4).

PRO TIP : le camp qui a les pions doublés et la paire de fous doit ouvrir le jeu tôt, avant que l'adversaire ne bloque tout. } *`,
    ),
    chapter(
      "Håkansson – Nimzowitsch : faire sauter le centre",
      "rn2k2r/pbpp1pp1/1p2pq1p/8/1bPPP3/2N2N2/PP3PPP/R2QKB1R w KQkq - 3 8",
      `{ Kristianstad 1922. Cette fois, Nimzowitsch ne bloque pas les pions doublés : il les attaque. Après ...Bxc3+, il pousse ...e5, échange en d4, puis frappe le pion e4 par ...f5.

L'idée : sans le pion c3, le centre blanc (c4, d4, e4) n'a plus de base. Si les Noirs ouvrent les lignes, ces pions deviennent des cibles.

PRO TIP : des pions doublés au centre se combattent par des ruptures de pions. Chaque échange de pions enlève un soutien au centre adverse. }
8. Qd3 { La dame protège e4 et c3. Stockfish préférait 8.e5 ou 8.Bd3, de peu. }
8... Bxc3+ { Les Noirs doublent les pions c avec échec. Stockfish jugeait 8...d6 équivalent. }
9. bxc3 { Les pions c3 et c4 sont doublés. [%csl Rc3,Rc4] }
9... d6 { Le pion prépare ...e5. }
10. Qe3 { La dame protège d4 et e4. }
10... Nd7 { Le cavalier se développe et soutiendra ...e5. }
11. Bd3 { Le fou protège e4. Stockfish préférait 11.g3. }
11... e5 { Les Noirs attaquent d4 : ils veulent ouvrir le centre. }
12. O-O { Les Blancs roquent. }
12... O-O { Les Noirs aussi. }
13. a4 { Les Blancs gagnent de l'espace à l'aile dame et pensent à a4-a5. }
13... a5 { Les Noirs bloquent le pion a. Le meilleur coup. }
14. Ne1 { Le cavalier se dirige vers c2. Stockfish préférait 14.Nd2. }
14... Rae8 { La tour vient soutenir le jeu au centre. Le meilleur coup. }
15. f3 { Le pion protège e4. Le meilleur coup. }
15... Qe6 { La dame attaque le pion c4 et prépare ...f5. Stockfish préférait 15...Qe7. }
16. Qd2! { Stockfish trouve le coup le plus précis : la dame quitte la colonne e et protège c3, avant que les Noirs n'ouvrent le centre (environ 0,0). }
(16. Nc2? { Le coup de la partie laisse la dame e3 en face de la dame e6, sur la colonne qui va s'ouvrir (Stockfish : −0,8 au lieu de 0,0). } 16... exd4! { Les Noirs ouvrent le centre. } 17. cxd4 { Le pion reprend. } 17... f5! { La rupture : le pion e4 est attaqué. } 18. d5 { Le pion avance avec gain de temps sur la dame, mais il abandonne la case e5. Stockfish préférait 18.Na3. } 18... Qe5 { La dame s'installe en e5, au centre, et vise la tour a1 sur la grande diagonale. } 19. Qd4 { La dame propose l'échange. Stockfish préférait 19.Nd4 (−1,0 au lieu de −1,7). } 19... Nc5 { Le cavalier attaque le fou d3 et le pion e4. } 20. Rad1 { La tour protège le fou d3. 20.Be2 tenait mieux (Stockfish). } 20... fxe4 { La colonne f s'ouvre, et le pion e4 tombera bientôt. Dans la partie, les Noirs ont gagné ce pion central et la partie. })
16... Qf6 { La dame revient vers l'aile roi. Le meilleur coup. }
17. Nc2 { Le cavalier se développe, maintenant sans danger. }
17... Qg5 { La dame propose l'échange. 17...h5 était un peu plus précis. }
18. Qxg5 { Les Blancs échangent. 18.Ne3 était équivalent. }
18... hxg5 { Les Noirs reprennent. }
19. Ne3 { Le cavalier vise d5 et f5. La finale est équilibrée (environ 0,0) : à temps, les Blancs ont évité l'ouverture du centre.

PRO TIP : le camp qui a les pions doublés doit éviter les clouages et les attaques doubles sur sa colonne centrale, car l'ouverture du jeu se fait à son détriment. } *`,
    ),
    chapter(
      "Nimzowitsch – Rosselli : refuser les pions doublés",
      "r2qkbnr/pp3ppp/2n5/2ppp3/8/1P2PQ1P/PBPP1PP1/RN2KB1R w KQkq - 0 7",
      `{ Baden-Baden 1925. Nimzowitsch cloue le cavalier c6 avec son fou, et le prend au bon moment pour doubler les pions noirs.

Dans son livre, Nimzowitsch estimait que les Noirs devaient reprendre du pion, en acceptant les pions doublés. Stockfish n'est pas d'accord : au 16e coup, la reprise de la dame évite les pions doublés et maintient l'équilibre.

PRO TIP : quand l'adversaire prend une pièce qui pourrait se reprendre avec un pion OU avec une pièce, demande-toi toujours si tu peux éviter les pions doublés. Ne les accepte que s'ils te donnent quelque chose en échange (une colonne, du centre, du temps). }
7. Bb5 { Le fou cloue le cavalier c6 et menace de le prendre pour doubler les pions noirs. Le meilleur coup. }
7... Qd6 { La dame protège le cavalier c6 et le pion e5. Stockfish préférait 7...e4. }
8. e4 { Les Blancs bloquent le centre. Stockfish préférait 8.Bxc6+ tout de suite (+0,9 contre +0,6). }
8... d4 { Le pion avance et ferme le centre. Le meilleur coup. }
9. Na3 { Le cavalier se dirige vers c4, d'où il attaquera d6 et e5. Le meilleur coup. }
9... f6 { Le pion consolide e5. Stockfish préférait 9...Ne7. }
10. Nc4 { Le cavalier attaque la dame d6. }
10... Qd7 { La dame recule. Mieux valait 10...Qc7 (Stockfish : +0,4 au lieu de +0,95). }
11. Qh5+ { Les Blancs provoquent ...g6. 11.O-O était un peu plus précis. }
11... g6 { Les Noirs interposent un pion. }
12. Qf3 { La dame revient en f3, d'où elle presse le pion f6. }
12... Qc7 { La dame protège à nouveau c6 et e5. 12...Be7 était un peu meilleur. }
13. Qg4 { La dame menace Qe6+. Stockfish préférait 13.c3 (+0,75 au lieu de +0,3). }
13... Kf7 { Le roi protège e6 et f6. Le meilleur coup. }
14. f4 { Les Blancs ouvrent le jeu contre le roi f7. }
14... h5 { Le pion chasse la dame. Le meilleur coup. }
15. Qf3 { La dame recule. }
15... exf4 { Les Noirs prennent le pion f4. }
16. Bxc6 { Le moment-clé : le fou prend le cavalier pour doubler les pions noirs. Stockfish préférait de peu 16.O-O. }
16... Qxc6! { La dame reprend et les Noirs n'ont pas de pions doublés. Stockfish : environ −0,1, alors que 16...bxc6 donnait près d'un pion aux Blancs. }
(16... bxc6? { Le coup de la partie accepte les pions doublés (Stockfish : +0,9). } 17. O-O { Le roi se met à l'abri, et la tour arrive sur la colonne f. } 17... g5 { Les Noirs protègent le pion f4. } 18. c3 { Les Blancs attaquent le pion d4. } 18... Rd8 { La tour protège d4. } 19. Rae1 { La tour soutient la poussée e4-e5. } 19... Ne7 { Le cavalier se développe. } 20. e5! { La rupture ouvre les lignes vers le roi noir. } 20... Nf5? { 20...Ng6 tenait mieux (Stockfish : +0,4 au lieu de +1,4). } 21. cxd4 { Les Blancs prennent d4. } 21... Nxd4 { Le cavalier reprend et se centralise. } 22. Qe4 { La dame se centralise. 22.Qd3 était plus fort. } 22... Be7 { Le fou se développe. } 23. h4 { Les Blancs attaquent le pion g5. 23.g3 était plus précis. } 23... Qd7? { La faute décisive (Stockfish : +5,5). 23...f5 résistait encore. } 24. exf6 { Le pion prend en f6 et ouvre les lignes vers le roi. } 24... Bxf6 { Le fou reprend. } 25. hxg5 { Les Blancs ouvrent la colonne h : l'aile roi noire s'effondre. })
17. Qxf4 { Les Blancs reprennent le pion f4. Le meilleur coup. }
17... Bh6! { Le fou se développe en attaquant la dame. Le meilleur coup. [%cal Gh6f4] }
(17... Re8? { Ce coup naturel est une erreur (+0,7). } 18. O-O { Les Blancs roquent : la tour arrive sur la colonne f, face au roi f7. } 18... Qxe4 { Les Noirs prennent le pion e4. 18...Kg7 était plus prudent. } 19. Qc7+ { La dame entre avec échec en 7e rangée et gagne du matériel (Stockfish : +1,9). })
18. Qf3 { La dame recule. Le meilleur coup. }
18... Re8 { La tour presse le pion e4. Le meilleur coup. }
19. O-O { Les Blancs roquent. La position est équilibrée (environ 0,0) : sans pions doublés, les Noirs n'ont aucune faiblesse.

PRO TIP : reprendre avec une pièce plutôt qu'avec un pion garde une bonne structure, mais demande de vérifier les tactiques. Ici, 17...Bh6! le permettait. } *`,
    ),
    chapter(
      "Fischer – Euwe : accepter les pions doublés pour l'activité",
      "r2qkb1r/pp2pppp/2n5/3n4/3P2b1/2N2N2/PP3PPP/R1BQKB1R w KQkq - 0 8",
      `{ Leipzig 1960, attaque Panov contre la Caro-Kann. Cette fois, c'est le camp qui RECOIT les pions doublés qui en profite : après ...Bxf3 gxf3, les Blancs ont des pions doublés en f, mais leur dame peut prendre b7, leur colonne g est ouverte et leurs pièces sont actives.

En finale, ces pions doublés f2 et f3 ne seront jamais une faiblesse : ils contrôlent e4 et g4, et aucune pièce noire ne pourra les attaquer.

PRO TIP : des pions doublés ne sont faibles que si l'adversaire peut les attaquer. S'ils contrôlent des cases utiles et que tes pièces sont actives, ils peuvent être un atout. }
8. Qb3 { La dame attaque à la fois le pion b7 et le cavalier d5. Stockfish le juge aussi bon que 8.h3. }
8... Bxf3 { Les Noirs éliminent le cavalier et doublent les pions f. Le meilleur coup. }
9. gxf3 { Les Blancs acceptent les pions doublés : la colonne g s'ouvre, et le pion f3 contrôle e4 et g4. Le meilleur coup. [%csl Rf2,Rf3] }
9... e6 { Les Noirs protègent d5 et ouvrent la diagonale du fou f8. }
10. Qxb7 { La dame prend le pion b7 : c'est la première compensation des pions doublés. }
10... Nxd4 { Contre-attaque : le cavalier prend d4 et menace ...Nc2+, une fourchette du roi et de la tour. }
11. Bb5+ { Le fou donne échec ; il sera pris, mais la dame va le récupérer. Le meilleur coup. }
11... Nxb5 { Les Noirs prennent le fou. }
12. Qc6+ { La dame donne échec et attaque le cavalier b5. }
12... Ke7 { Le roi s'écarte. Le meilleur coup. }
13. Qxb5 { La dame récupère la pièce. }
13... Nxc3 { Le cavalier prend c3 pour échanger. 13...Qd7 était un peu meilleur. }
14. bxc3 { Les Blancs reprennent : ils ont maintenant des pions doublés en f ET un pion c3 isolé. Mais leurs pièces sont plus actives. }
14... Qd7 { Les Noirs proposent l'échange des dames. }
15. Rb1 { La tour prend la colonne b ouverte. }
15... Rd8 { Les Noirs développent la tour. Plus simple était 15...Qxb5 16.Rxb5 a6 (Stockfish : +0,3 au lieu de +0,9). }
16. Be3 { Le fou se développe et vise le pion a7. }
16... Qxb5 { Les Noirs échangent les dames. }
17. Rxb5 { La tour reprend et attaque en 5e rangée. La finale commence : le pion a7 est attaqué par le fou e3. }
17... a6 { Le pion échappe au fou e3 en attaquant la tour b5. Le meilleur coup avec 17...Rc8. }
(17... Rd7? { Le coup de la partie défend a7 passivement (Stockfish : +2,0 au lieu de +0,9). } 18. Ke2 { Le roi se centralise. } 18... f6 { 18...f5 était un peu meilleur. } 19. Rd1 { Les Blancs proposent l'échange de la seule tour active des Noirs. } 19... Rxd1 { Les Noirs échangent. } 20. Kxd1 { Le roi reprend et se rapproche de l'aile dame. } 20... Kd7 { 20...Kd6 était plus précis. } 21. Rb8 { La tour entre en 8e rangée et paralyse le fou f8 et la tour h8. } 21... Kc6 { 21...g5 résistait mieux (Stockfish). } 22. Bxa7 { Le pion a7 tombe : les Blancs ont un pion a passé, et leurs pions doublés f n'ont jamais été une faiblesse. Fischer gagnera la finale. })
18. Ra5 { La tour attaque le pion a6. }
18... Rc8 { Les Noirs laissent le pion a6, mais ils vont prendre c3 en échange. }
19. Ke2 { Le roi se centralise. }
19... Rxc3 { Les Noirs prennent le pion c3. }
20. Rxa6 { Les Blancs prennent le pion a6. La finale reste un peu meilleure pour eux (Stockfish : environ +1,1), mais la tour noire est active.

PRO TIP : en finale, une tour active vaut souvent un pion. Défendre un pion avec une tour passive (17...Rd7?) est presque toujours une mauvaise affaire. } *`,
    ),
    chapter(
      "Quand les pions doublés ouvrent une colonne",
      "3r2r1/k1p2p1p/pp2bp1q/2p4n/8/1NPP1N1P/PP2QPP1/R3R2K b - - 0 1",
      `{ Les pions doublés f7 et f6 des Noirs sont nés d'une reprise ...gxf6 : en échange, la colonne g est ouverte, et les tours noires y attaquent directement le roi blanc h1. Ici, cette compensation est déjà décisive (Stockfish : environ −6).

PRO TIP : reprendre « vers le bord » avec un pion (...gxf6) crée des pions doublés, mais ouvre une colonne contre le roi adverse. Si ce roi a roqué de ce côté, l'attaque compte souvent plus que la structure. [%csl Rf7,Rf6] }
1... Nf4 { Le cavalier attaque la dame e2, ainsi que g2 et h3. Stockfish trouve 1...Rxg2 encore un peu plus fort, mais les deux coups gagnent. }
2. Ng1 { La meilleure défense selon Stockfish : le cavalier protège h3 et e2. Les Blancs devront quand même rendre leur dame. }
(2. Qf1 { La dame protège g2, mais la colonne g reste ouverte. Stockfish préfère 2.Ng1, de peu : les deux coups perdent (environ −7,5). } 2... Rxg2! { La tour prend quand même : elle est protégée par le cavalier f4. } 3. h4 { 3.Qxg2 Nxg2 rendait la dame, mais résistait plus longtemps. } 3... Rg4 { La tour attaque le pion h4. } 4. Nbd2? { Une erreur qui permet un mat rapide. 4.Re3 résistait plus longtemps. } 4... Rxh4+ { La tour se sacrifie pour ouvrir la colonne h. } 5. Nxh4 { Le cavalier prend. } 5... Qxh4+ { La dame reprend avec échec. } 6. Kg1 { Le roi s'enfuit. } 6... Rg8+ { La seconde tour arrive par la colonne g. } 7. Qg2 { La dame s'interpose. } 7... Rxg2+ { La tour prend la dame avec échec. } 8. Kf1 { Le roi s'écarte. } 8... Qxf2# { Échec et mat : la colonne g, ouverte par les pions doublés, a décidé de tout. })
2... Nxe2 { Le cavalier prend la dame. }
3. Rxe2 { La tour reprend. }
3... Rxg2 { La tour pénètre en g2, par la colonne ouverte. Elle sera prise, mais l'attaque continue. }
4. Kxg2 { Le roi prend la tour. }
4... Rg8+ { La seconde tour donne échec sur la colonne g, et la dame h6 entre dans l'attaque.

PRO TIP : une colonne ouverte devant le roi adverse s'exploite en doublant les pièces lourdes dessus. Les pions doublés qui l'ont ouverte deviennent un détail. } *`,
    ),
    chapter(
      "Dénouer ses pions doublés : la poussée c3-c4",
      "r2r2k1/1pq2ppp/2p1bn2/3pN3/3P4/1BP5/2P1QPPP/3RR1K1 w - - 0 1",
      `{ Le point de vue de celui qui a les pions doublés. Les pions blancs c2 et c3 sont doublés, et la colonne a est aux Noirs. La meilleure réponse est de « dénouer » ces pions : en poussant c3-c4, les Blancs échangent le pion de devant contre le pion d5. Il ne restera alors qu'un pion c sain, à côté du pion d4.

PRO TIP : des pions doublés qui peuvent s'échanger ne sont pas une faiblesse durable. Cherche la poussée qui échange le pion de devant, si possible avant que l'adversaire ne le bloque. [%csl Rc2,Rc3] }
1. c4 { Le meilleur coup selon Stockfish : le pion c3 attaque d5 et va s'échanger. [%cal Gc3c4] }
1... Ne4 { Le cavalier s'installe en e4. Plus simple était 1...dxc4 2.Bxc4 (Stockfish : environ 0,0 contre +0,15). }
2. Qf3 { La dame attaque le cavalier e4 et le pion f7. Le meilleur coup. }
2... dxc4 { Les Noirs prennent : le fou b3 est attaqué, et le cavalier e4 l'est toujours. }
3. Nxc4 { Le cavalier reprend. 3.Bxc4 était équivalent. Surtout pas 3.Qxe4?, qui perdait une pièce après 3...cxb3 (Stockfish : −1,9). }
3... Nf6 { Le cavalier recule. }
4. Ne5 { Le cavalier revient sur sa case forte, où il attaque c6 et f7. Le meilleur coup. }
4... Bxb3 { Les Noirs échangent les fous. }
5. Qxb3 { La dame reprend. Il ne reste aux Blancs que le pion c2 et le pion d4 : plus de pions doublés, et la position est équilibrée. À éviter : 5.cxb3?, qui laissait deux pions isolés en b3 et d4 (−0,4).

PRO TIP : au moment de reprendre, vérifie toujours la structure que tu laisses. Une prise de pion qui crée des pions isolés ou doublés coûte souvent plus que le temps qu'elle fait gagner. } *`,
    ),
  ],
};
