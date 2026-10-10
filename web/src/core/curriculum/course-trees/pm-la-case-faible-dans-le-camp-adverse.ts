import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « La case faible dans le camp adverse » (positional_mastery, module 2)
 * — refonte du 2026-10-10 : chaque coup joué porte son explication.
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, réécrite ici) :
 *  - chapitres 1 à 6 : étude Lichess « Weak Squares: Reassess your chess »
 *    (notes de lecture d'un utilisateur sur le livre de Jeremy Silman) ;
 *  - chapitre 7 : Silman – McCambridge, même étude ;
 *  - chapitres 8 et 9 : Mattison – Nimzowitsch 1929 et Domenech – Flohr 1935,
 *    coups relevés dans l'étude « 62 The Most Instructive Games of Chess ever
 *    Played » (https://lichess.org/study/w2JcfP5K) via
 *    `PILOT_pm-la-case-faible-dans-le-camp-adverse.pgn`.
 *
 * Chaque affirmation (meilleur coup, erreur, évaluation) a été contrôlée avec
 * Stockfish 18 (profondeur 18). Les lignes de l'étude source que Stockfish
 * désapprouve sont signalées comme telles, jamais présentées comme modèles.
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

export const CASE_FAIBLE_DANS_LE_CAMP_ADVERSE: CourseTree = {
  chapters: [
    chapter(
      "Repérer les cases faibles — et choisir la bonne",
      "3rr1k1/1p3qb1/3p3p/p1pNp1p1/P1P1QpP1/1P2PP2/5PKP/2RR4 w - - 0 1",
      `{ Une case faible (ou « trou »), c'est une case qu'AUCUN pion de son camp ne pourra plus jamais protéger. Ici, les pions noirs ont tous avancé : a5, c5, e5, g5. Résultat, trois trous dans le camp noir : b5 (plus de pion a ni c en 6e rangée pour la garder), d5 (où trône déjà le cavalier) et f5. Et le pion d6, coincé derrière ses voisins, est une cible fixe.

Mais tous les trous ne se valent pas : le meilleur est celui d'où ta pièce frappe une faiblesse. Depuis b5, un cavalier attaquerait d6. [%csl Gb5,Gd5,Gf5,Rd6] }
1. Nc3 { Le cavalier cède d5 et prend la route de b5 (c3-b5), pour viser d6. Stockfish préfère toutefois 1.h4 (+2,1 contre +1,7), qui ouvre l'aile roi : les trous ne sont pas la seule chose à regarder ! [%cal Gd5c3,Gc3b5] }
(1. h4 { L'idée de Stockfish : ouvrir une colonne contre le roi noir pendant que ses pions sont figés. } 1... gxh4 { Les Noirs prennent… } 2. Rh1 { …et la tour blanche s'installe sur la colonne h, avec une forte attaque. })
1... Re6 { La tour protège d6 et e5 depuis la 6e rangée — le meilleur coup selon Stockfish. }
(1... Bf8 { Si le fou vient protéger d6… } 2. Nb5 { …le cavalier saute en b5 et attaque d6 une fois de plus. Aucun pion noir ne pourra le chasser de là. })
2. Rd5 { La tour occupe à son tour le trou d5 : elle vise c5, d6 et e5. Plus précis était 2.Re1 (Stockfish), mais l'idée est claire. }
2... Rf8 { Une imprécision : la tour se replie sans rien attaquer. 2...Bf6 tenait mieux (Stockfish). }
3. Rcd1 { Les deux tours blanches pèsent sur la colonne d et sur d6. }
3... Qe7 { La dame vient protéger d6. }
4. Qd3 { La dame rejoint la pression sur d6. }
4... fxe3 { Les Noirs échangent le pion f pour ouvrir la colonne f, leur seule source de contre-jeu. }
5. fxe3 { Les Blancs reprennent et gardent une structure solide. }
5... Qf7 { La dame attaque f3 sur la colonne ouverte. }
6. Rf1 { La tour protège f3. Stockfish préférait 6.Qe2, mais la position reste nettement favorable. }
6... Rf6 { La deuxième tour noire attaque f3. }
7. Qd1 { La dame protège f3 une fois de plus. Les Blancs ont neutralisé le contre-jeu : ils pourront ensuite jouer Ne4, qui frappe d6 et f6 depuis une case centrale. Stockfish : environ +2,3.

PRO TIP : un trou n'a de valeur que si ta pièce y attaque quelque chose. Avant de foncer dans une case faible, demande-toi : « qu'est-ce que j'attaque de là ? » — et neutralise d'abord le contre-jeu adverse. [%cal Gc3e4,Ge4d6] } *`,
    ),
    chapter(
      "Contre-exemple : une case qui n'est PAS faible",
      "3rr1k1/ppp2qbp/3p2p1/3Npp2/P1P5/1P2PPP1/2Q2PKP/2RR4 b - - 0 1",
      `{ Même structure en apparence, avec un cavalier blanc en d5… mais une différence capitale : le pion noir est encore en c7. Il peut avancer en c6 et chasser le cavalier. d5 n'est donc PAS un trou. [%csl Rd5,Yc7] }
1... e4 { Les Noirs gagnent de l'espace et bloquent le fou blanc. Stockfish préférait 1...c6 tout de suite (+0,2), qui chasse le cavalier sans attendre. }
2. f4 { Les Blancs bloquent l'aile roi. }
2... c6 { Voilà la différence : le pion c attaque le cavalier, qui doit quitter d5. [%cal Gc7c6] }
3. Nc3 { Le cavalier recule ; il n'a plus de case forte. }
3... Rd7 { Les Noirs consolident d6. La position est équilibrée (+0,5 selon Stockfish) : sans trou, pas de domination.

PRO TIP : avant de déclarer une case faible, vérifie les pions des colonnes VOISINES : tant qu'un pion adverse peut encore avancer pour la contrôler, ce n'est pas un trou. } *`,
    ),
    chapter(
      "Penser en termes de cases faibles : la prise en passant qui change tout",
      "r1bqrnk1/1p2pnbp/p2p2p1/P1pP1p2/2P2P2/2NBP1BP/1PQN2P1/R4RK1 b - - 0 1",
      `{ Les Noirs veulent jouer ...e5 pour gagner de l'espace. Mais ce coup crée un trou en d5 : une fois le pion e passé en e5, plus aucun pion noir ne pourra contrôler d5. Aux Blancs de savoir l'exploiter. [%csl Yd5] }
1... e5 { Les Noirs poussent. Stockfish préférait 1...b6, mais e5 est le coup naturel. }
2. dxe6! { La prise en passant ! Elle libère la case d5 de son propre pion blanc : le trou créé par ...e5 devient utilisable par les pièces blanches. C'est le meilleur coup selon Stockfish (+1,2). [%csl Gd5] }
(2. e4?! { Coup naturel, mais il gaspille l'occasion : } 2... exf4 { les Noirs échangent… } 3. Bxf4 { …le fou reprend (3.Rxf4 était plus précis), } 3... g5 { …et les pions noirs chassent le fou. } 4. Be3 { Le fou recule… } 4... f4 { …et le pion l'attaque encore, en gagnant de l'espace. } 5. Bf2 { Le fou recule. } 5... Ne5 { Cette fois, c'est le cavalier NOIR qui s'installe sur une case forte, e5, au cœur de la position. Les Noirs sont mieux (−1,7 selon Stockfish) : les Blancs ont laissé passer leur trou et offert le leur. [%csl Re5] })
2... Bxe6 { Les Noirs reprennent avec le fou, qui surveille d5. }
3. e4 { Les Blancs attaquent f5 et préparent l'ouverture de la position. }
3... fxe4 { Les Noirs échangent. 3...Nh6 était un peu plus solide (Stockfish). }
4. Bxe4 { Le fou reprend et contrôle d5. Les Blancs ne se précipitent pas dans le trou : ils renforcent d'abord leur contrôle de la case (fou e4, cavalier c3), et le cavalier s'y installera au bon moment. +1,3 pour les Blancs.

PRO TIP : quand l'adversaire avance un pion à côté d'un de tes pions, demande-toi si la prise en passant peut libérer une case forte pour tes pièces. [%csl Gd5][%cal Gc3d5,Ge4d5] } *`,
    ),
    chapter(
      "Se créer une case forte : la poussée 1...b4!",
      "r4r2/4qp1k/2np2p1/1pp1p2p/4P2P/1PPP1PP1/2Q3B1/1R3RK1 b - - 0 1",
      `{ Le fou blanc g2 est mauvais (bloqué par ses pions), mais le cavalier noir c6 n'a pas non plus de case forte : le pion blanc c3 contrôle à la fois b4 et d4. Comment créer une case pour le cavalier ? [%csl Yd4,Yb4] }
1... b4! { Le coup thématique, et le meilleur selon Stockfish (−1,6). Le pion attaque c3 : si cxb4, le cavalier reprend en b4 et vise d3, a2 et c2 ; si c4, la case d4 devient un trou définitif pour le cavalier. [%cal Gb5b4,Gc6d4] }
(1... f5? { Une erreur de plan : } 2. f4 { les Blancs bloquent à leur tour, et c'est le fou g2 qui en profite pour revivre (+0,6 pour les Blancs selon Stockfish). Une rupture doit améliorer TES pièces plus que celles de l'adversaire. })
2. f4 { Les Blancs cherchent du contre-jeu à l'aile roi. C'est le meilleur coup. }
(2. cxb4 { Si les Blancs prennent… } 2... Nxb4 { …le cavalier reprend et attaque la dame c2. Il pèse sur d3 et a2, et la tour a8 pourra entrer en a2 (−2,3). [%csl Gb4] })
2... bxc3 { Les Noirs prennent : le pion c3 blanc disparaît, et avec lui le contrôle de d4. }
3. Qxc3 { La dame reprend. }
3... Ra2 { La tour entre en 2e rangée et attaque le fou g2. Les Noirs ne se pressent pas de jouer ...Nd4 : la case est acquise, elle ne s'enfuira pas. }
4. fxe5 { Les Blancs ouvrent la colonne f. Stockfish préférait 4.Qc4. }
4... Qxe5 { La dame se centralise et propose l'échange des dames sur c3. Plus fort était 4...Nd4 (Stockfish). }
5. Qc4 { Les Blancs refusent l'échange — à tort : 5.Qxe5 limitait les dégâts (−1,0 au lieu de −2,4 selon Stockfish). }
5... Kg7 { Le roi se met à l'abri et protège f7 et h6. }
6. b4 { Les Blancs attaquent c5. }
6... Re2 { La tour attaque le pion e4. }
7. Rf4 { La tour protège e4. }
7... Nd4 { Le cavalier s'installe enfin sur le trou d4 : aucun pion blanc ne peut l'en chasser. Il touche f3, e2, c2 et b3. [%csl Gd4] }
8. Rbf1 { Les tours blanches se doublent sur la colonne f, vers f7. }
8... Ne6 { Le cavalier attaque la tour f4 et protège f8 et g7. }
9. R4f3 { La tour recule. }
9... Qb2 { La dame passe par d4 et c3, deux cases que les Blancs ne contrôlent plus, pour attaquer b4. }
10. R3f2 { La tour attaque la tour e2. }
10... Rxf2 { Les Noirs échangent. }
11. Rxf2 { La tour reprend et attaque la dame b2. }
11... Qxb4 { La dame s'échappe en prenant le pion b4. Les Noirs ont gagné un pion, et leur contrôle des cases noires (d4, b4, e5) reste total (−2,0 selon Stockfish).

PRO TIP : pour créer une case forte pour ton cavalier, avance le pion de la colonne voisine contre le pion qui la contrôle : il devra prendre, avancer ou se laisser prendre, et dans les trois cas la case se libère. } *`,
    ),
    chapter(
      "Fixer la faiblesse : 2...b4!!",
      "r3r1k1/5pp1/1pq1n2p/1pp1p3/4P3/1P3PP1/P1PQ3P/R3RBK1 b - - 0 1",
      `{ La case d4 serait idéale pour le cavalier e6 : protégée par c5 et e5. Mais ce n'est pas encore un trou, car le pion blanc c2 peut avancer en c3 et l'en chasser. Il faut l'en empêcher. [%csl Yd4,Rc2] }
1... Nd4 { Le cavalier s'installe tout de suite. C'est le meilleur coup selon Stockfish. Il attaque c2 et f3. [%csl Gd4] }
2. Qf2 { La dame protège f3. }
2... b4!! { Le coup clé : le pion b contrôle désormais c3. Si les Blancs jouent un jour c2-c3, b4xc3 leur laissera un pion isolé et le cavalier restera en d4. Le cavalier est installé pour toujours. Bonus : le pion a2 blanc devient une cible fixe, car a2-a3 serait pris par b4xa3. Stockfish place 2...Qf6 et 2...b4 à égalité. [%csl Gc3,Ra2][%cal Gb5b4,Gb4c3] }
3. Bc4 { Le fou blanc s'active sur la diagonale a2-g8. }
3... Ra3 { La tour s'installe sur une autre case faible, a3 (le pion b blanc est déjà en b3), et attaque b3 tout en fixant a2. [%csl Ga3] }
4. Bd5 { Le fou attaque la dame c6. }
4... Qc7 { La dame se retire. 4...Qf6 était un peu plus actif (Stockfish). }
5. Rec1 { Les Blancs préparent c2-c3 pour libérer leur jeu. }
5... Qa7 { La dame rejoint la pression sur a2. }
6. c3 { Les Blancs tentent enfin c3… }
6... bxc3 { …le pion b prend… }
7. Rxc3 { …et la tour reprend. Mais le cavalier d4 reste à sa place, et le pion a2 est toujours faible. }
7... Qa5 { La dame attaque la tour c3, qui doit reculer. }
8. Rcc1 { La tour recule. }
8... Re7 { La deuxième tour se prépare à passer en a7 pour tripler sur a2. }
9. f4 { Les Blancs cherchent un contre-jeu à l'aile roi. }
9... exf4 { Les Noirs prennent. }
10. gxf4 { Les Blancs reprennent. }
10... Ra7 { Les Noirs triplent sur la colonne a (tour a3, tour a7, dame a5) : le pion a2 va tomber, et les Blancs n'ont aucun contre-jeu. −1,1 selon Stockfish.

PRO TIP : une pièce sur une case forte n'est stable que si l'adversaire ne peut plus y pousser de pion. Pense au pion de la colonne voisine : bloque-le ou rends sa poussée perdante. } *`,
    ),
    chapter(
      "En finale : le roi sur la case faible",
      "r3k2r/5pp1/p1pp4/P6p/1p1pPb2/1B1P1P1P/1PP2P2/R2R2K1 b kq - 0 1",
      `{ En finale, le roi devient une pièce d'attaque. Le pion f3 blanc est faible (doublé avec f2), et la case f4 est un trou dans le camp blanc : aucun pion blanc ne pourra plus jamais la contrôler (pas de pion g, et le pion e est déjà en e4). Plan : amener le roi noir en f4. [%csl Gf4,Rf3] }
1... Ke7 { Le roi part vers l'aile roi. C'est le meilleur coup selon Stockfish. }
2. Ra4 { La tour attaque le pion b4. }
2... Rhb8 { La tour protège b4. }
3. Bc4 { Le fou attaque a6. }
3... Kf6 { Le roi continue sa route. }
4. Kf1 { Le roi blanc s'approche pour défendre f2 et f3. }
4... Ra7 { La tour protège a6 et f7 le long de la 7e rangée : le roi noir peut quitter les abords de f7. }
5. Re1 { La tour se place sur la colonne e. }
5... Bh6 { Le fou libère la case f4 pour son roi. }
6. Ke2 { Le roi blanc vient protéger f3. }
6... Ke5 { Le roi noir avance… }
7. Kf1 { Les Blancs attendent. }
7... Kf4 { Le roi est sur le trou f4 : il attaque f3 et e4, et aucun pion ne peut l'en déloger. [%csl Gf4] }
8. Ke2 { Le roi blanc doit protéger f3 : il est attaché à sa défense. }
8... Re7 { La tour attaque e4 : les Blancs sont réduits à la passivité. }
9. Kf1? { Une erreur : le pion f3 n'est plus protégé. 9.h4 tenait mieux (Stockfish). }
9... Kxf3 { Le roi noir prend f3 et s'installe au cœur du camp blanc. }
10. Bxa6? { La faute décisive : les Blancs prennent un pion, mais ouvrent la porte au roi noir (−1,6 → −2,4 selon Stockfish). Il fallait 10.Bb3. }
10... d5! { Le pion attaque e4 et ouvre la colonne e pour la tour e7. }
11. exd5 { Les Blancs prennent… }
11... Rxe1+ { …et la tour noire échange avec échec. }
12. Kxe1 { Le roi reprend. }
12... Re8+ { L'autre tour entre en jeu avec échec. }
13. Kf1 { Le roi se cache en f1 (13.Kd1 perdait encore plus vite). }
13... Re2 { La tour entre en 2e rangée et attaque f2 et c2. }
14. Ra1 { Les Blancs n'ont rien de mieux. }
14... Rxf2+ { La tour prend f2 avec échec. }
15. Kg1 { Le roi recule. }
15... Rg2+ { Nouvel échec. }
16. Kh1 { Le roi est acculé dans le coin. }
16... Be3 { Le fou coupe le roi blanc de la case f2 : le mat est imparable (mat en 6 selon Stockfish). Le roi noir, entré par le trou f4, a décidé la partie.

PRO TIP : en finale, une case faible proche des pions adverses est une porte d'entrée pour ton ROI. Fais d'abord de la place (ici le fou a quitté f4), puis avance. } *`,
    ),
    chapter(
      "Silman – McCambridge : tout donner pour une case",
      "2kr1b1r/3nq1n1/p2p1pp1/1ppP3p/4P1P1/2N1B1QP/PP3PB1/R4RK1 w - - 0 18",
      `{ Les Blancs ont déjà un net avantage (+2,2 selon Stockfish) : paire de fous, espace central, roi plus sûr. L'expansion noire à l'aile dame (b5, c5) a créé des faiblesses : si le pion c5 disparaît, la case d4 (puis c6) s'offrira aux pièces blanches. [%csl Yd4,Yc6] }
18. b4! { Le meilleur coup selon Stockfish. Le pion attaque c5 pour le déloger : sans lui, plus rien ne protège d4 ni b4, et la colonne c s'ouvre vers le roi noir. [%cal Gb2b4,Gb4c5] }
18... h4 { Les Noirs contre-attaquent la dame. 18...hxg4 était plus solide (Stockfish). }
(18... cxb4 { Si les Noirs prennent tout de suite… } 19. Ne2 { …le cavalier file vers d4, puis c6, au cœur du camp noir. })
19. Qf3 { La dame se met à l'abri en attaquant f6. }
19... cxb4 { Les Noirs prennent le pion et attaquent le cavalier c3. }
20. Nb1 { Le cavalier recule… pour mieux revenir par d2 et b3 vers d4 ou c5. Stockfish préférait 20.a4, encore plus fort. }
(20. Ne2? { Le retrait naturel vers d4 piège la dame : } 20... Ne5 21. Qf4 g5 22. Qh2 { la dame blanche est enfermée sur h2. })
20... Ne5 { Le cavalier attaque la dame et le pion g4. }
21. Qe2 { La dame recule et attaque b5. }
21... Ne8 { Le cavalier se replie pour défendre c7 et d6. }
22. Bb6 { Le fou s'installe en b6, dans le camp noir, et attaque la tour d8. Plus fort était 22.a4 (Stockfish), mais le fou b6 gêne beaucoup les Noirs. }
22... Rd7 { La tour s'écarte. }
23. Nd2 { Le cavalier reprend sa route vers b3, puis d4 ou c5. }
23... f5 { Les Noirs attaquent e4 et g4. }
24. f4 { Le pion chasse le cavalier e5. }
24... Nf7 { Le cavalier recule. }
25. Nb3 { Le cavalier est à un saut de c5 et de d4. }
25... Bg7 { Le fou se développe sur la grande diagonale et attaque la tour a1. }
26. e5! { Un sacrifice de dégagement : le pion se donne pour ouvrir la diagonale du fou g2 vers c6 et a8, et libérer e4 et c5 pour les pièces blanches. Stockfish préférait d'abord 26.Rac1+, mais l'idée reste la clé de la partie. [%cal Gg2a8] }
26... dxe5 { Les Noirs prennent. }
27. Rac1+ { La tour échappe au fou g7 avec échec, sur la colonne c ouverte. }
27... Nc7 { Le cavalier s'interpose. }
28. Nc5 { Le cavalier atteint c5, la case visée depuis le début : il attaque la tour d7 et le pion a6. [%csl Gc5] }
28... exf4 { Les Noirs prennent un pion de plus. }
29. Qf2 { La dame attaque f4 et h4. }
29... Rxd5 { La tour prend d5 et attaque le cavalier c5. }
30. Nxa6 { Le cavalier prend a6 et attaque le cavalier c7 et le pion b4. }
30... Bc3 { Le fou noir se place en c3. }
31. Nxc7 { Le cavalier prend c7 et attaque la tour d5 et le pion b5. }
31... Rd2 { La tour attaque la dame f2. }
32. Qxd2 { Les Blancs donnent leur dame contre la tour… }
32... Bxd2 { …le fou la prend… }
33. Nd5+ { …mais le cavalier découvre un échec de la tour c1 tout en attaquant la dame e7 : c'est une fourchette. [%cal Gc1c8,Gd5e7] }
33... Bxc1 { Les Noirs prennent la tour. }
34. Nxe7+ { Le cavalier prend la dame avec échec. Les Noirs abandonnent : les Blancs ont une pièce de plus et les deux fous (+4 selon Stockfish).

PRO TIP : un sacrifice positionnel est rentable s'il te donne une case ou une diagonale décisive pour longtemps. Compte ce que la pièce activée vaudra, pas seulement le pion donné. } 1-0`,
    ),
    chapter(
      "Mattison – Nimzowitsch, Carlsbad 1929 : la case c4",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      `{ Une partie modèle de Nimzowitsch. Regarde comment une faiblesse de pions (des pions doublés en c3 et c4) se transforme en une faiblesse de CASE (c4) qui dominera toute la partie. }
1. d4 { Ouverture du pion dame. }
1... Nf6 { Développement. }
2. c4 { Les Blancs prennent de l'espace. }
2... e6 { Les Noirs préparent ...Bb4. }
3. Nc3 { Le cavalier se développe. }
3... Bb4 { La défense Nimzo-Indienne : le fou cloue le cavalier c3. }
4. Nf3 { Développement. }
4... Bxc3+ { Nimzowitsch échange son fou… }
5. bxc3 { …et inflige aux Blancs des pions doublés en c3 et c4, lents et difficiles à protéger. }
5... d6 { Le pion contrôle c5 et e5 et prépare ...e5 : un centre souple, sans cible pour les fous blancs. }
6. Qc2 { La dame se développe. }
6... Qe7 { La dame se développe et protège d'avance le pion d6, que le fou blanc s'apprête à viser depuis a3. }
7. Ba3 { Le fou vise d6. }
7... c5 { Le pion bloque la diagonale du fou a3 et fixe le pion c4 : il ne pourra plus avancer. [%csl Rc4] }
8. g3 { Les Blancs préparent un fianchetto. Stockfish préférait 8.e4, au centre. }
8... b6 { Les Noirs préparent ...Bb7 et ...Ba6 pour attaquer c4. }
9. Bg2 { Le fou se développe. Plus précis était 9.Nd2 (Stockfish). }
9... Bb7 { Le fou défie le fou g2. }
10. O-O { Le roi blanc se met à l'abri. }
10... O-O { Les Noirs aussi. }
11. Nh4 { Le cavalier quitte f3 pour reprendre en g2 si les fous s'échangent. 11.Rfe1 était plus solide (Stockfish). }
11... Bxg2 { Les Noirs échangent les fous de cases blanches : le pion c4 perd un défenseur. }
12. Kxg2 { Le roi reprend. 12.Nxg2 était préférable (Stockfish). }
12... Qb7+ { La dame donne échec sur la grande diagonale. }
13. Kg1 { Le roi recule. 13.Nf3 était meilleur (Stockfish). }
13... Qa6 { La dame attaque à la fois le fou a3 et le pion c4. }
14. Qb3 { La dame protège les deux. }
14... Nc6 { Le cavalier vise a5, puis c4. }
15. Rfd1 { La tour protège d4. }
15... Na5 { Le cavalier attaque la dame b3 et le pion c4. }
16. Qb5 { Les Blancs proposent l'échange des dames pour se soulager. }
16... Qxb5 { Les Noirs acceptent… }
17. cxb5 { …et le pion c4 a disparu. Mais la case c4, elle, reste faible : plus aucun pion blanc ne pourra la contrôler (le pion b est en b5, le pion d en d4). [%csl Gc4] }
17... Nc4 { Le cavalier s'installe en c4 et attaque le fou a3. Il domine l'aile dame blanche. [%csl Gc4][%cal Ga5c4] }
18. Bc1 { Le fou recule, passif. }
18... a6! { Le pion attaque b5 pour ouvrir la colonne a. }
19. bxa6 { Les Blancs prennent… }
19... Rxa6 { …et la tour noire attaque aussitôt le pion a2. }
20. dxc5 { Les Blancs échangent au centre. 20.a3 était plus solide (Stockfish). }
20... bxc5 { Les Noirs reprennent. }
21. Ng2 { Le cavalier revient enfin au jeu, mais trop tard. }
21... Nd5 { L'autre cavalier se centralise et attaque c3. }
22. Rd3 { La tour protège c3 et attaque le cavalier d5. }
22... Rfa8 { Les tours noires se doublent contre a2. }
23. e4? { L'erreur décisive (−2,7 → −4,4 selon Stockfish) : le pion attaque le cavalier d5… Il fallait 23.a3. }
23... Ne5! { …mais le cavalier c4 bondit en e5 et attaque la tour d3. Si les Blancs prennent le cavalier d5, ils perdent leur tour. }
24. Rxd5 { Les Blancs donnent la qualité. }
24... exd5 { Les Noirs reprennent. }
25. a3 { Les Blancs protègent leur pion a. }
25... dxe4 { Les Noirs ont une qualité et un pion de plus. Mattison abandonne.

PRO TIP : un pion faible que l'on échange laisse souvent derrière lui une CASE faible, encore plus durable. Nimzowitsch a obtenu c4 dès le 17e coup, et tout le reste en a découlé. } 0-1`,
    ),
    chapter(
      "Domenech – Flohr, 1935 : deux trous, d4 puis b3",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      `{ Flohr exploite deux trous créés par des coups de pion blancs : d4 (après c4 et e4) et b3 (après a3). Le second ne servira que vingt coups plus tard — une case faible ne disparaît jamais. }
1. e4 { Ouverture du pion roi. }
1... c5 { La Sicilienne. }
2. Nf3 { Développement. }
2... e6 { Les Noirs préparent ...d5 ou ...Nc6. }
3. c4 { Les Blancs prennent d5 sous contrôle, mais ce pion c ne pourra plus jamais revenir contrôler d4 ni d3. Stockfish préférait 3.d4. [%csl Yd4,Yd3] }
3... Nc6 { Développement. }
4. d4 { Les Blancs ouvrent le centre. }
4... cxd4 { Les Noirs échangent. }
5. Nxd4 { Le cavalier reprend. }
5... Nf6 { Le cavalier attaque e4. }
6. Nxc6 { Les Blancs échangent les cavaliers. }
6... dxc6 { Flohr reprend vers le centre et ouvre la colonne d, qui mène droit aux cases faibles d4 et d3. }
7. Qxd8+ { Les dames s'échangent. }
7... Kxd8 { En finale, le roi noir est déjà bien placé au centre. }
8. f3 { Le pion protège e4. Stockfish préférait 8.e5. }
8... e5! { Le pion protège d4 : le trou blanc devient une case forte pour les pièces noires. [%csl Gd4] }
9. Be3 { Le fou surveille d4 et c5. }
9... Kc7 { Le roi libère la 8e rangée pour les tours. }
10. a3 { Un coup de pion anodin… qui crée un deuxième trou, en b3 : plus aucun pion blanc ne pourra le contrôler (a3 et c4 l'ont dépassé). [%csl Rb3] }
10... Nd7 { Le cavalier vise c5, puis b3 ou d3. }
11. Nd2 { Le cavalier se développe. 11.Nc3 était plus actif (Stockfish). }
11... a5 { Le pion avance… }
12. Be2 { Développement. }
12... a4 { …et se fixe en a4 : il protège désormais le trou b3, prêt à accueillir un cavalier noir. [%csl Gb3] }
13. Kf2 { Le roi blanc se rapproche du centre. }
13... Bc5 { Le fou propose l'échange des fous de cases noires, les défenseurs de d4. }
14. Bxc5 { Les Blancs acceptent. 14.b3 était plus solide (Stockfish). }
14... Nxc5 { Le cavalier reprend et vise b3, d3 et e4. }
15. Rac1 { La tour se développe. 15.Rad1 contestait mieux la colonne d (Stockfish). }
15... Be6 { Le fou attaque c4. }
16. Rhd1 { La tour vient sur la colonne d. }
16... Rhd8 { Les Noirs aussi : la tour attaque le cavalier d2. }
17. Ke3 { Le roi protège d2. }
17... Rd7 { Les Noirs préparent le doublement des tours. }
18. g3 { Les Blancs préparent f4. 18.Nf1 était plus solide (Stockfish). }
18... Rad8 { Les deux tours noires dominent la colonne d. }
19. f4? { L'erreur décisive (−1,6 → −3,5 selon Stockfish) : les Blancs ouvrent le jeu alors que leur roi est exposé. }
19... exf4+ { Les Noirs prennent avec échec. }
20. gxf4 { Le pion reprend. }
20... Rd3+! { Un sacrifice de qualité : la tour s'installe sur le trou d3 avec échec. }
21. Bxd3 { Les Blancs prennent la tour. }
21... Rxd3+ { L'autre tour reprend sur d3, avec échec : elle domine la 3e rangée. }
22. Kf2 { Le roi recule. }
22... Bg4 { Le fou attaque la tour d1. }
23. e5 { Les Blancs cherchent du contre-jeu. }
23... Bxd1 { Le fou prend la tour… }
24. Rxd1 { …et la tour blanche reprend. Les Noirs ont rendu la qualité : le matériel est égal, mais leurs pièces sont bien plus actives. }
24... Ne6 { Le cavalier attaque f4. }
25. f5 { Le pion avance. }
25... Nd4 { Le cavalier s'installe sur le trou d4 et attaque f5. [%csl Gd4] }
26. f6 { Les Blancs poussent pour ouvrir l'aile roi. }
26... gxf6 { Les Noirs prennent. }
27. exf6 { Les Blancs reprennent. }
27... Nb3! { Le cavalier saute enfin dans le trou b3, créé au 10e coup : il attaque le cavalier d2, que la tour d3 attaque aussi. [%csl Gb3] }
28. Ke2 { Le roi attaque la tour d3. 28.Re1 résistait mieux (Stockfish). }
28... Rxd2+ { La tour prend le cavalier avec échec. }
29. Rxd2 { La tour reprend… }
29... Nxd2 { …et le cavalier reprend. }
30. Kxd2 { Le roi reprend. Il reste une finale de pions… } 30... Kd6 { …où le roi noir file vers e6 pour ramasser f6 : elle est gagnante pour les Noirs (−6 selon Stockfish). Domenech abandonne.

PRO TIP : note toutes les cases faibles de l'adversaire, même celles que tu ne peux pas exploiter tout de suite. La case b3, créée par 10.a3, a décidé la partie au 27e coup. } 0-1`,
    ),
  ],
};
