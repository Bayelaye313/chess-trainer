import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « Le mauvais fou » (positional_mastery, module 3) — refonte « un
 * commentaire par coup » du 2026-10-10.
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, entièrement
 * réécrite ici) : Mauricio Flores Rios, « Chess Structures — A Grandmaster
 * Guide » (Quality Chess, 2015), chapitres 4 (formation Slave), 6
 * (Stonewall), 19 et 20 (Française types I et II) :
 *  - Zhigalko – Rakhmanov, Moscou 2011 ; Karjakin – Carlsen, Wijk aan Zee
 *    2010 ; Maze – Ni Hua, Bienne 2011 (Française type II) ;
 *  - Areshchenko – Vovk, Kiev 2011 (Française type I) ;
 *  - Aronian – Tomashevsky, Tromsø 2013 ; Cvitan – Doric, Rijeka 2006
 *    (Stonewall) ;
 *  - Aronian – Zhao Zong Yuan, Khanty-Mansiysk 2010 (formation Slave).
 * Les chapitres d'ouverture (1, 4, 6) suivent la théorie courante.
 *
 * Les parties ont été relevées dans le PDF du livre (texte extrait, figurines
 * reconstituées à la main) puis rejouées coup par coup avec chess.js. Chaque
 * affirmation (meilleur coup, erreur, évaluation) a été contrôlée avec
 * Stockfish 18 (profondeur 16-18). Règle appliquée : quand le coup de la
 * partie (ou une suggestion du livre) est nettement moins bon que le choix du
 * moteur, la LIGNE PRINCIPALE suit le moteur et le coup de la partie passe en
 * variante, signalée comme fautive ; les écarts minimes (quelques dixièmes)
 * sont seulement mentionnés dans le commentaire.
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const LE_MAUVAIS_FOU: CourseTree = {
  chapters: [
    chapter(
      "Qu'est-ce qu'un mauvais fou ?",
      START,
      `{ Un fou ne se déplace que sur une seule couleur de cases. S'il se retrouve derrière ses PROPRES pions bloqués sur cette même couleur, il bute contre eux à chaque diagonale : on l'appelle alors un « mauvais fou ». Le fou de l'autre couleur, qui circule librement devant les pions, est le « bon fou ».

La structure de la Défense française en est l'exemple le plus célèbre. Regarde ce qui arrive au fou c8 des Noirs pendant ces quelques coups d'ouverture. }
1. e4 { Les Blancs occupent le centre et ouvrent la diagonale de leur fou f1. }
1... e6 { La Française. Le pion e6 prépare ...d5, mais il ferme aussitôt la diagonale c8-h3 : le fou c8 vient de perdre sa sortie naturelle. [%csl Rc8][%cal Rc8h3] }
2. d4 { Les Blancs bâtissent le centre classique e4-d4. }
2... d5 { Les Noirs contestent e4. Les deux pions centraux noirs, e6 et d5, sont sur des cases BLANCHES — la couleur du fou c8. }
3. e5 { La variante d'avance : les Blancs fixent la chaîne de pions. Les pions noirs e6 et d5 ne pourront plus avancer avant longtemps, donc le fou c8 restera enfermé derrière eux. Côté blanc, la chaîne d4-e5 est sur cases NOIRES : le fou c1 aura le même problème, mais c'est le fou c8 qui souffre le plus, car il n'a aucune case active devant lui. [%csl Rc8,Gf1][%cal Gd4e5,Re6d5] }
(3. exd5 { Avec la variante d'échange, au contraire… } 3... exd5 { …le pion e6 disparaît et la diagonale c8-h3 se rouvre : le fou c8 respire, la structure est symétrique et il n'y a plus de mauvais fou. C'est la preuve que tout dépend des pions FIXES, pas de l'ouverture choisie. [%cal Gc8g4] })
3... c5 { Les Noirs attaquent tout de suite la base de la chaîne (d4) : c'est leur plan principal pour gagner de l'espace et, plus tard, libérer leur jeu. }
4. c3 { Les Blancs soutiennent d4 avec un pion. }
4... Nc6 { Le cavalier ajoute sa pression sur d4. }
5. Nf3 { Troisième défenseur de d4 : les Blancs tiennent bon au centre. }
5... Bd7 { Le fou c8 sort… d'une seule case. En d7, il ne voit que c6, b5, a4 et e8 : il défend, il n'attaque rien. Voilà le portrait-robot du mauvais fou.

PRO TIP : pour juger un fou, ne regarde pas l'ouverture, regarde ses pions FIXES. S'ils sont sur la couleur du fou et ne peuvent plus avancer, le fou est mauvais — et l'adversaire voudra jouer sur les cases de l'AUTRE couleur, que ce fou ne pourra jamais défendre. [%csl Rd7,Re6,Rd5] } *`,
    ),
    chapter(
      "Les cases de l'autre couleur : Zhigalko – Rakhmanov (Moscou 2011)",
      "r4rk1/1b2bp1p/pq2p1p1/1p1pP3/1P1N1PP1/P1PBQ3/7P/R4RK1 w - - 1 21",
      `{ Française, variante d'avance avec f4. Les pions noirs b5, d5 et e6 sont sur cases blanches : le fou b7 est un mauvais fou, il ne voit que c8, c6 et a8. Les cases noires, elles, appartiennent aux Blancs : le cavalier d4 est intouchable, le pion e5 interdit f6 et d6, et rien ne défend la case f6 ni le roi noir.

Le dernier coup noir, 20...Qb6?, est la faute décisive. Il fallait détourner l'attention avec 20...Qxc3!, qui égalisait selon Stockfish (0.00) — et avant cela, 20.cxd4 aurait gardé aux Blancs un net avantage. Maintenant, les Blancs passent à l'attaque sur l'aile roi, là où le fou b7 ne peut rien défendre. [%csl Rb7,Gd4,Gf6][%cal Gf4f5] }
21. f5! { La rupture thématique. Le pion f attaque e6, la base de la chaîne noire, et ouvre la colonne f pour la tour f1. Stockfish : environ +2,3, déjà décisif. [%cal Gf4f5,Gf5e6] }
21... exf5 { Les Noirs prennent : laisser fxe6 ouvrirait encore plus le roi. }
22. gxf5 { Le pion g reprend et continue la poussée : la colonne g s'ouvre devant le roi noir. }
22... Qc7 { Le meilleur choix de Stockfish : la dame revient défendre les cases noires autour du roi (e5, f4…). La position reste perdue (environ +3,2), mais les Noirs résistent. [%cal Gb6c7] }
(22... gxf5? { Le coup de la partie ouvre lui-même la colonne g et aggrave tout (environ +4,9). } 23. Kh1 { Le roi s'écarte de la colonne g, qui devient une autoroute pour les tours blanches. Stockfish préférait de peu 23.Rxf5, mais le coup est très fort aussi. } 23... Kh8 { Le roi noir fuit lui aussi la colonne g (23...Bc8, pour ramener enfin le fou, résistait mieux). } 24. Bxf5 { Le fou reprend le pion et vise h7 : les cases blanches autour du roi noir tombent aussi, parce que le fou b7 est trop loin pour les défendre. [%cal Gf5h7] } 24... f6? { Les Noirs essaient de casser le pion e5, mais ouvrent la diagonale de leur roi : c'est une faute supplémentaire (24...Rg8 tenait plus longtemps). } 25. e6 { Le pion passe et coupe les pièces noires en deux ; Stockfish trouvait 25.Qh3 encore plus rapide. } 25... Rg8 { Selon Stockfish, les Blancs ont maintenant un mat forcé. Les Noirs abandonneront peu après : leur fou b7 n'a pas joué le moindre rôle dans la défense. })
23. f6 { Le pion s'enfonce comme un coin : il attaque le fou e7 et étouffe le roi noir. Stockfish place 23.Rae1 un peu devant, mais les deux coups gagnent. [%csl Gf6] }
23... Rfe8 { La tour prépare la défense de e7 et e8. }
24. e6 { Une deuxième percée sur les cases blanches : le pion e5 s'avance alors que le fou b7, enfermé derrière d5, ne peut ni le bloquer ni le contester.

PRO TIP : quand l'adversaire a un mauvais fou, attaque là où ce fou ne peut pas aller. Ici, le fou b7 surveille les cases blanches de l'aile dame — l'attaque blanche se joue sur les cases noires de l'aile roi, comme s'il y avait une pièce noire de moins. } *`,
    ),
    chapter(
      "Le fou emmuré derrière e6 : Areshchenko – Vovk (Kiev 2011)",
      "2r1r1k1/pb1q2bp/1p2p1p1/3p4/3P1B2/6PP/PP3PB1/R2QR1K1 w - - 0 20",
      `{ Structure « Française type I » : les Noirs ont joué ...f6 et échangé sur f6, il leur reste un pion e6 arriéré et un pion d5 bloqué. La case e5 est un trou que les Blancs vont occuper. Le fou b7 est enfermé : devant lui, d5 sur cases blanches, et derrière, plus aucune perspective. Stockfish donne aux Blancs environ +1,4, sans aucun gain matériel. [%csl Ge5,Rb7,Re6] }
20. Be5 { Le fou s'installe sur la case-clé. Il n'y a aucun pion noir pour le chasser. Stockfish préférait de peu 20.h4, mais l'idée est la même : e5 est la case des Blancs. [%csl Ge5] }
20... Bh6 { Les Noirs gardent leur fou de cases noires, le seul qui puisse contester e5. Mais leur fou b7 reste inutile. }
21. h4 { Le plan d'aile roi : h4-h5 pour attaquer le pion g6 et créer une nouvelle faiblesse. [%cal Gh4h5] }
21... Qf7 { La dame se place sur la colonne f, sans réelle menace. }
22. Bh3 { Le fou blanc de cases blanches vise e6, l'autre point faible. C'est un BON fou : les pions blancs sont sur cases noires (d4), il circule librement. [%cal Gh3e6] }
22... Bc6 { Le fou noir change de case, mais toujours derrière d5 : il ne trouve aucune diagonale utile. }
23. Qd3 { La dame se rapproche de l'aile roi et des cases blanches g6 et a6. }
23... Bd7 { Retour en d7 pour défendre e6 : le mauvais fou est réduit au rôle de pion défensif. }
24. Re2 { Les Blancs doublent les tours sur la colonne e, contre e6. }
24... Rc6 { La tour défend e6 latéralement. }
25. Rae1 { Le doublement est fait : e6 est attaqué trois fois. }
25... a5 { Les Noirs n'ont rien de constructif : ils attendent. }
26. Kg2 { Le roi libère la colonne h pour une tour (Rh1 puis h5). }
26... Rc4 { La tour attaque d4, mais c'est une menace sans lendemain. }
27. Bg4 { Le fou se replace pour soutenir h5 et surveiller e6 depuis l'arrière. }
27... Rf8 { Le meilleur coup selon Stockfish (environ +1,1) : la tour active la colonne f pour gêner les Blancs. La position reste nettement favorable aux Blancs. }
(27... Rc6?! { Le coup de la partie, une pure attente (environ +1,6). } 28. Rh1 { La tour rejoint la colonne h : la poussée h5 arrive. [%cal Gh1h5] } 28... Rec8 { Les Noirs cherchent un contre-jeu sur la colonne c. } 29. h5 { Le coup préparé depuis le 21e coup : il menace hxg6 et attaque la structure g6-h7. } 29... Bg7 { Le fou h6 aurait été pris après hxg6 : il revient défendre. } 30. Bxg7 { Les Blancs échangent le dernier défenseur des cases noires (Stockfish préférait 30.Qd2, mais c'est encore très favorable). } 30... Kxg7 { Il ne reste aux Noirs que leur mauvais fou d7 : il défendra e6 jusqu'au bout pendant que les Blancs ouvrent la colonne h. Les Blancs gagneront la partie.

PRO TIP : face à un mauvais fou, échange les AUTRES pièces adverses, surtout le fou de l'autre couleur. Plus il y a d'échanges, plus le mauvais fou reste seul avec ses faiblesses. })
*`,
    ),
    chapter(
      "La Caro-Kann : sortir le fou AVANT ...e6",
      START,
      `{ La Caro-Kann et la Slave ont trouvé une solution simple au problème du fou c8 : le sortir de la chaîne de pions AVANT de jouer ...e6. Une fois dehors, il ne sera plus jamais enfermé. Compare avec la Française du chapitre 1. }
1. e4 { Les Blancs ouvrent le jeu. }
1... c6 { La Caro-Kann. Le pion c6 prépare ...d5 SANS toucher au pion e7 : la diagonale c8-h3 reste ouverte. [%cal Gc8h3] }
2. d4 { Les Blancs prennent le centre. }
2... d5 { Les Noirs contestent e4, comme dans la Française. }
3. e5 { La variante d'avance fixe la chaîne… }
3... Bf5 { …mais le fou c8 sort aussitôt, devant les pions. En f5, il contrôle la diagonale b1-h7 et ne sera pas enfermé quand ...e6 viendra. [%csl Gf5][%cal Gf5b1] }
4. Nf3 { Développement normal. }
4... e6 { Maintenant seulement, les Noirs jouent ...e6. La chaîne d5-e6 est la même qu'en Française, mais le fou est DEVANT elle. [%csl Gf5] }
5. Be2 { Les Blancs préparent le roque. }
5... c5 { Les Noirs attaquent la base de la chaîne, avec un fou actif en plus. C'est l'ordre de coups de Maze – Ni Hua, qu'on retrouve au chapitre suivant.

PRO TIP : dans les ouvertures avec ...d5, demande-toi toujours : « où ira mon fou c8 quand j'aurai joué ...e6 ? ». S'il n'a pas de réponse, sors-le avant (…Bf5, …Bg4), ou prépare ...b6 et ...Ba6/...Bb7. } *`,
    ),
    chapter(
      "Le fou hors de la chaîne : Maze – Ni Hua (Bienne 2011)",
      "r3k2r/pp3ppp/2q1p2n/3pPb2/3B4/2N5/PPP2PPP/R2Q1RK1 b kq - 1 13",
      `{ La structure ressemble à une Française : pions noirs d5-e6 sur cases blanches, pion blanc e5. Mais le fou noir de cases blanches est en f5, HORS de la chaîne. Selon les manuels, c'est le « mauvais » fou des Noirs, parce qu'il est de la couleur de ses pions — en pratique, c'est leur meilleure pièce. Côté blanc, le dernier coup 13.O-O était un peu passif : Stockfish préférait 13.h4 (environ +0,6 contre +0,1). [%csl Gf5,Rd5,Re6] }
13... Bg6 { Le meilleur coup selon Stockfish. Le fou se met à l'abri d'un futur g4 et garde la diagonale h7-b1, où il vise c2. [%cal Gg6c2] }
14. Rc1 { La tour protège c2 pour libérer le cavalier c3. Stockfish préférait 14.Qd2, mais l'écart est faible. }
14... Nf5 { Le cavalier, mal placé en h6, rejoint f5 où il attaque le fou d4. Fou g6 et cavalier f5 coopèrent : ils tiennent les cases blanches de l'aile roi. [%cal Gf5d4] }
15. Ne2 { Le cavalier blanc se replie pour soutenir d4. }
15... a5 { Les Noirs commencent le contre-jeu à l'aile dame (Stockfish proposait aussi 15...Qb5, à égalité). [%cal Ga5a4] }
16. c3 { Les Blancs consolident d4. }
16... O-O { Le roi est à l'abri : le fou g6 le protège aussi contre une attaque sur les cases blanches. }
17. Re1 { La tour se place sur la colonne e pour soutenir e5. }
17... Rfc8 { Les tours noires visent la colonne c, la seule où les Noirs peuvent percer. }
18. f3 { Les Blancs préparent g4 pour chasser le cavalier f5. }
18... b5 { L'avance de minorité : ...b4 ouvrira des lignes à l'aile dame. [%cal Gb5b4] }
19. Bf2 { Le fou blanc laisse d4 au cavalier et prépare g4. }
19... Qb7 { La dame soutient ...b4 et reste sur la grande diagonale. }
20. g4 { Les Blancs chassent le cavalier. }
20... Ne7 { Le seul bon recul (Stockfish) : le cavalier revient vers d5 ou c6. La position est équilibrée (environ +0,4), alors que dans une Française classique avec le fou en c8, les Noirs seraient nettement moins bien.

PRO TIP : un fou de la couleur de ses pions n'est « mauvais » que s'il est DERRIÈRE eux. Placé devant la chaîne, il devient une pièce active qui défend les cases faibles et attaque celles de l'adversaire. } *`,
    ),
    chapter(
      "La structure Slave : le fou c8 avant ...e6",
      START,
      `{ La même idée qu'en Caro-Kann, côté Gambit Dame. Dans le Gambit Dame Refusé classique, le fou c8 reste souvent enfermé derrière e6 et d5 pendant des dizaines de coups. La Slave lui prépare une sortie dès l'ouverture. }
1. d4 { Les Blancs occupent le centre. }
1... d5 { Les Noirs aussi. }
2. c4 { Le Gambit Dame : les Blancs attaquent d5. }
2... c6 { La Slave : le pion c6 défend d5 sans fermer la diagonale du fou c8. [%cal Gc8f5] }
(2... e6 { Le Gambit Dame Refusé : solide, mais le pion e6 ferme la diagonale c8-h3. } 3. Nc3 { Développement classique. } 3... Nf6 { Les Noirs se développent. } 4. Bg5 { Les Blancs clouent le cavalier f6. } 4... Be7 { Le fou de cases noires sort sans problème… } 5. e3 { Les Blancs soutiennent d4. } 5... O-O { …mais le fou c8, lui, n'a aucune case : les Noirs devront plus tard jouer ...b6 et ...Bb7, ou rompre avec ...c5 ou ...e5, pour le faire vivre. [%csl Rc8] })
3. Nf3 { Développement naturel. }
3... Nf6 { Les Noirs défendent d5 une deuxième fois. }
4. Nc3 { Le cavalier met la pression sur d5. }
4... dxc4 { Les Noirs prennent le pion c4 : cela libère la case d5 et, surtout, la diagonale du fou c8. }
5. a4 { Les Blancs empêchent ...b5, qui aurait protégé le pion c4. }
5... Bf5 { Le fou sort devant la future chaîne : en f5, il contrôle e4 et la diagonale b1-h7. [%csl Gf5][%cal Gf5b1] }
6. e3 { Les Blancs préparent Bxc4 pour récupérer leur pion. }
6... e6 { Seulement maintenant, les Noirs jouent ...e6 : le fou est déjà dehors, la structure est solide et aucun fou noir n'est enfermé.

PRO TIP : dans la structure Slave, le plan des Noirs est de rompre plus tard avec ...c5 ou ...e5. Un fou déjà actif rend ces ruptures bien plus efficaces, parce qu'il participe tout de suite à la lutte. } *`,
    ),
    chapter(
      "Échanger le mauvais fou : Aronian – Zhao (Khanty-Mansiysk 2010)",
      "rnbq1rk1/ppp1bppp/4pn2/8/2pP4/5NP1/PPQ1PPBP/RNB2RK1 b - - 1 7",
      `{ Une Catalane qui mène à la formation Slave : les Noirs ont pris en c4, le pion e6 ferme la diagonale du fou c8, et le fou blanc g2 domine la grande diagonale. Quand on ne peut pas libérer son mauvais fou, on peut l'ÉCHANGER — de préférence contre le meilleur fou adverse. [%csl Rc8,Gg2][%cal Gg2b7] }
7... a6 { Le meilleur coup selon Stockfish : les Noirs menacent ...b5 pour garder le pion c4. [%cal Gb7b5] }
8. a4 { Les Blancs empêchent ...b5. }
8... Bd7 { Le fou c8 part vers c6 : de là, il s'opposera au fou g2. Stockfish trouvait 8...Nc6 très légèrement plus précis, mais le plan est parfaitement sain. [%cal Gd7c6] }
9. Qxc4 { Les Blancs récupèrent leur pion. }
9... Bc6 { Le fou atteint la grande diagonale, en face du fou g2. Il n'est plus enfermé : il conteste la meilleure pièce blanche. [%csl Gc6][%cal Gc6g2] }
10. Bf4 { Les Blancs se développent (Stockfish préférait de peu 10.Bg5). }
10... a5 { Les Noirs fixent l'aile dame et réservent b4 à leur cavalier (Stockfish préférait de peu 10...Nbd7). }
11. Nc3 { Le cavalier blanc se développe. }
11... Na6 { Le cavalier vise b4, la case obtenue grâce à ...a5. }
12. Ne5 { Le cavalier attaque le fou c6 et s'installe au centre. }
12... Bxg2 { L'échange voulu depuis 8...Bd7 : le fou « mauvais » des Noirs disparaît contre le fou blanc le plus actif. }
13. Kxg2 { Le roi reprend. Bilan : les Noirs n'ont plus de mauvais fou, et l'avantage blanc est minime (environ +0,2 selon Stockfish).

PRO TIP : ton mauvais fou est de la même couleur que le BON fou adverse. Le troquer contre lui règle deux problèmes d'un coup : tu perds ta pièce la plus passive, l'adversaire perd sa plus active. } *`,
    ),
    chapter(
      "Recycler le fou par d7-e8-h5 : Aronian – Tomashevsky (Tromsø 2013)",
      "rnb2rk1/pp2q1pp/2pbpn2/3pNp2/2PP4/1P1BP3/P4PPP/RNBQ1RK1 w - - 3 9",
      `{ La Défense hollandaise Stonewall : pions noirs c6, d5, e6 et f5, presque tous sur cases blanches. Le fou c8 est le mauvais fou par excellence : aucune diagonale ne s'ouvre devant lui. La solution classique est un long détour : d7, puis e8, puis h5 (ou g6), DEVANT le pion f5. [%csl Rc8][%cal Gc8d7,Gd7e8,Ge8h5] }
9. Bb2 { Les Blancs se développent et visent la grande diagonale. }
9... Bd7 { Première étape du détour. Stockfish place 9...Nbd7 et 9...a5 à égalité ; le plan du fou est tout à fait jouable. }
10. Nc3 { Développement du dernier cavalier blanc. }
10... Be8 { Deuxième étape : en e8, le fou est prêt à sortir en h5 ou g6 au bon moment. [%cal Ge8h5] }
11. cxd5 { Les Blancs ouvrent la colonne c. }
11... cxd5 { Les Noirs reprennent du pion c : la structure reste symétrique au centre, la colonne c s'ouvre pour les deux camps. }
12. Rc1 { La tour occupe la colonne ouverte. }
12... Nc6 { Le cavalier se développe et conteste e5. }
13. Nb5 { Le cavalier vise le fou d6 (Nxd6). }
13... Bb4 { Le fou évite l'échange en restant actif. }
14. a3 { Les Blancs chassent le fou. }
14... Ba5 { Le fou garde la diagonale a5-e1. }
15. Be2 { Stockfish préférait 15.a4 (+0,3 contre 0,0) : les Blancs ont laissé filer leur petit avantage. }
15... a6 { Les Noirs chassent le cavalier b5. }
16. Nc3 { Le cavalier revient. }
16... Ne4 { Le cavalier noir s'installe en e4, soutenu par f5 et d5. }
17. b4 { Les Blancs chassent le fou a5. }
17... Bc7 { Le fou se replie et vise e5. }
18. Nxe4 { Les Blancs échangent sur e4 ; il était plus simple de jouer d'abord f4. }
18... fxe4 { Le pion f reprend : la colonne f s'ouvre pour les Noirs, et le pion e4 gêne toute la position blanche. }
19. Qb3 { Les Blancs visent le pion d5, mais 19.f4 ou 19.Bg4 étaient plus solides (Stockfish). }
(19. f4 { Le livre recommande ce coup pour égaliser… } 19... exf3 { …les Noirs prennent en passant… } 20. Nxf3 { …et les Blancs reprennent. } 20... Bh5 { Même dans cette ligne, le fou noir sort en h5 : la troisième étape du détour est atteinte. [%csl Gh5] })
19... Bxe5 { Les Noirs éliminent le cavalier e5. }
20. dxe5 { Le pion qui reprend devient une cible permanente. }
20... Qg5 { La dame vise g2 et e5 et prépare ...Bh5. }
21. Kh1 { Une imprécision : Stockfish préférait 21.Bd4 (environ −0,35 contre −0,7), et le livre recommandait 21.Qd1 pour empêcher le coup suivant. }
21... Bh5 { Fin du voyage : le fou « mauvais » est devenu une pièce d'attaque en h5, où il vise e2 et d1. Les Noirs ont désormais l'initiative et gagneront la finale.

PRO TIP : un mauvais fou n'est pas condamné. Si tu ne peux ni l'échanger ni ouvrir la position, cherche un chemin qui le fait passer DEVANT tes pions — même si cela prend trois coups. [%csl Gh5][%cal Gh5e2] } *`,
    ),
    chapter(
      "Verrouiller le mauvais fou adverse avec c4-c5 : Cvitan – Doric (Rijeka 2006, 1re partie)",
      "r1b2rk1/ppb1q1pp/2p1p3/3pPp2/2P1n3/1P1BP3/PB2NPPP/R2Q1RK1 w - - 1 13",
      `{ Encore un Stonewall, vu cette fois du côté de celui qui l'affronte. Les Noirs ont deux façons de faire vivre leur fou c8 : le détour d7-e8-h5, ou ...b6 et ...c5 pour ouvrir la grande diagonale. Les Blancs, eux, rêvent de jouer c4-c5 : ce pion empêcherait ...c5 pour toujours et laisserait le fou c8 enfermé. [%csl Rc8][%cal Gc4c5] }
13. Rc1 { La tour soutient la poussée c5. Stockfish place 13.Qc2 au même niveau. }
13... Bd7 { Le fou fait un pas, mais il ne trouve rien de mieux que d7. }
14. f3 { Les Blancs chassent le cavalier e4 : sans lui, les Noirs n'ont plus de pièce active. }
14... Bb6 { Selon le livre, une perte de temps : le fou va revenir en c7. Stockfish préférait 14...Nc5 (environ +0,7), qui préparait ...dxc4 puis ...c5. }
(14... Nc5 { La bonne idée : le cavalier se replie en surveillant d3… } 15. cxd5 { …et les Blancs ouvrent la colonne c avant que ...c5 soit possible… } 15... cxd5 { …les Noirs reprennent… } 16. Ba3 { …et le clouage sur la diagonale a3-f8 donne un petit avantage aux Blancs, sans plus. })
15. Nd4 { Le cavalier vise e6 et f5, et soutient c5. }
15... Ng5 { Le cavalier, chassé de e4, cherche une case active. }
16. Qc2 { La dame soutient c5 et vise f5. }
16... a5 { Les Noirs préparent du jeu à l'aile dame. Il fallait plutôt 16...c5 ou 16...dxc4, qui empêchaient le coup suivant (Stockfish). }
17. c5! { Le verrou. Le pion c5 interdit ...c5 pour toujours : les pions noirs c6, d5, e6 et f5 sont figés sur cases blanches, et le fou d7 n'a plus aucun avenir. [%csl Gc5,Rd7][%cal Gc4c5] }
17... Bc7 { Le fou revient en c7, où il défend surtout. }
18. Ne2 { Le cavalier se replace pour soutenir f4 plus tard. }
18... b5 { Les Noirs cherchent ...b4 pour ouvrir des lignes. }
19. a3 { Les Blancs empêchent ...b4. }
19... Nf7 { Le livre en fait la faute décisive ; Stockfish est plus nuancé (19...g6 était meilleur de 0,2). Le vrai problème : le cavalier n'a plus de chemin vers e4. }
20. f4 { Les Blancs referment le centre en leur faveur : e5 est solide, e4 n'a plus d'importance, et le fou d7 restera enterré jusqu'à la fin de la partie (environ +1,1).

PRO TIP : quand l'adversaire a un mauvais fou, cherche le coup de pion qui l'enferme DÉFINITIVEMENT. Un mauvais fou qui peut se libérer est un défaut passager ; un mauvais fou verrouillé est un handicap pour toute la partie. } *`,
    ),
    chapter(
      "Échanger son mauvais fou contre le bon fou adverse : Cvitan – Doric (2e partie)",
      "rrk1b3/2b1q2p/2p1p1pn/1pPpPp2/pP3PP1/P2BPN1P/1B4R1/2R1Q1K1 w - - 0 33",
      `{ Vingt coups plus tard. Les Blancs ont un énorme avantage d'espace, mais ils ont aussi un mauvais fou : le fou b2, enfermé derrière ses propres pions b4, c5, e5 et f4, tous sur cases noires. Leur plan est remarquable : envoyer ce fou en h4 pour l'échanger contre le BON fou noir, le fou c7. Après cet échange, les cases noires du camp noir n'auront plus de défenseur. [%csl Rb2,Gc7][%cal Gb2c3,Gc3e1,Ge1h4] }
33. Bc3 { Première étape : c3-e1-h4. Stockfish jugeait 33.gxf5 un peu plus fort, mais le plan d'échange est très clair. [%cal Gc3e1] }
33... Kb7 { Le roi noir part se mettre à l'abri à l'aile dame. }
34. Qe2 { La dame libère la case e1 pour le fou. }
34... Bd8 { Le fou noir vient en d8 pour surveiller h4 et g5. }
35. Be1 { Deuxième étape. }
35... Ka6 { Le roi poursuit son voyage (Stockfish préférait 35...Qf7). }
36. Bh4 { Le fou atteint h4 et propose l'échange. [%cal Gh4d8] }
36... Qc7 { Les Noirs ne peuvent pas éviter l'échange sans abandonner la diagonale. }
37. Bxd8 { L'échange voulu : le mauvais fou blanc disparaît contre le bon fou noir. Stockfish trouvait 37.Qf2 encore plus fort (+2,1 contre +1,7), mais le coup de la partie garde un grand avantage et simplifie le plan. }
(37. Qf2 { L'option du moteur : garder les pièces et renforcer d'abord la pression. } 37... Bd7 { Les Noirs attendent… } 38. Nd4 { …et les Blancs améliorent leur cavalier avant tout échange. })
37... Qxd8 { La dame reprend. Regarde les cases noires du camp noir : d6, f6, g7, h6… plus aucun fou ne peut les défendre. [%csl Rd6,Rf6,Rg7] }
38. Nd4 { Le cavalier s'installe sur la case idéale, au centre, où aucun pion noir ne peut le chasser. }
38... Qe7 { La dame revient défendre. }
39. gxf5 { Les Blancs ouvrent la colonne g. }
39... Nxf5 { Le cavalier noir reprend. }
40. Bxf5 { Les Blancs échangent aussi le cavalier noir. }
40... gxf5 { Il reste un duel parfait : le cavalier blanc d4, intouchable, contre le fou noir e8, enfermé derrière ses pions c6, d5, e6 et f5. Les Blancs ouvriront la colonne g et gagneront lentement mais sûrement.

PRO TIP : ton mauvais fou peut avoir un rôle précieux — aller s'échanger contre le bon fou adverse. Après l'échange, c'est l'ADVERSAIRE qui se retrouve avec le mauvais fou et des cases faibles. [%csl Gd4,Re8] } *`,
    ),
    chapter(
      "Quand le mauvais fou se réveille : Karjakin – Carlsen (Wijk aan Zee 2010)",
      "2r2rk1/1bqn1ppp/p3p3/1pbpP3/3B1P1Q/P1N5/1PP1B1PP/3R1R1K b - - 2 17",
      `{ Française, structure type II. Le fou b7 des Noirs est « mauvais » : les pions d5 et e6 sont sur cases blanches. Mais un mauvais fou n'est pas mort pour autant : si le centre s'ouvre, il peut redevenir redoutable. Les Blancs viennent de jouer 17.Qh4?, trop optimiste (Stockfish préférait 17.h3 ou 17.Qg3) : ils négligent leur centre. [%csl Rb7][%cal Gd5d4] }
17... Bxd4 { Les Noirs échangent le fou d4, le meilleur défenseur du centre blanc. }
18. Rxd4 { La tour reprend. }
18... f6! { La rupture qui casse la chaîne blanche : le pion e5 est attaqué, et la colonne f va s'ouvrir. C'est le meilleur coup selon Stockfish. [%cal Gf7f6] }
19. Bd3 { Le fou vise h7 : c'est le meilleur coup blanc ici. }
19... h6 { Les Noirs couvrent h7 et g5. }
20. exf6 { Les Blancs ouvrent eux-mêmes la position (20.Qh3 ou 20.Qg4 étaient un peu meilleurs). }
20... Rxf6 { La tour reprend et attaque f4 : le pion f4 est devenu une faiblesse, et la poussée ...e5 menace. }
21. f5 { Les Blancs tentent de compliquer. Stockfish préférait 21.Nd1 (environ −0,8 contre −1,2). }
(21. Nd1 { Le coup du moteur : le cavalier vient défendre e3 et f2. } 21... Nc5 { Les Noirs gardent un net avantage grâce à leur activité. })
21... Rcf8 { Les tours noires se doublent contre f5. }
22. Rg1 { La tour défend g2. }
22... Nc5! { Le cavalier menace ...Nxd3 et ...Rxf5. }
23. fxe6 { Les Blancs prennent. }
23... Nxe6 { Le cavalier reprend et attaque la tour d4. }
24. Rg4 { La tour s'écarte, mais elle est mal placée en g4 (24.Rb4 était meilleur selon Stockfish). }
24... Nf4 { Le cavalier s'installe en f4. La menace ...d4 approche : ce pion libérerait la diagonale du fou b7, braqué sur g2. [%cal Gb7g2] }
25. Ne2 { La meilleure défense selon Stockfish (environ −1,6) : le cavalier vient protéger d4 et f4 avant que ...d4 ne l'ait chassé. }
(25. Qg3? { Le coup de la partie défend g2 mais laisse le cavalier c3 sans case (environ −2,5). } 25... Qe7! { Le coup de Carlsen : il prive le cavalier c3 de la case e2 avant de jouer ...d4. } 26. Rxf4 { Les Blancs rendent la qualité (Stockfish préférait 26.h3, mais la position est perdue de toute façon). } 26... Rxf4 { Les Noirs ont une qualité de plus ; dans la finale, ...d4 fera entrer le fou b7 et décidera la partie. })
25... Nxd3 { Les Noirs éliminent le fou blanc, seul défenseur des cases blanches. }
26. cxd3 { Les Blancs reprennent. }
26... Qe7 { La dame vise e3 ; ensuite ...d4 libérera le fou b7 sur la grande diagonale, braqué sur g2. Stockfish place 26...Bc8 à peine devant ; dans les deux cas, les Noirs gardent un net avantage.

PRO TIP : la rupture centrale est la meilleure amie du mauvais fou. Quand ses propres pions bloqués disparaissent (...f6 puis ...d4), le fou « mauvais » devient d'un coup une pièce d'attaque. } *`,
    ),
  ],
};
