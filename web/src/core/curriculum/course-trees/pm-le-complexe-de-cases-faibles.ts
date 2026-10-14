import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « Le complexe de cases faibles » (positional_mastery, module 14) —
 * format « un commentaire par coup » du 2026-10-12.
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, entièrement
 * réécrite ici) : Andric – Daja (1949), Fischer – Berliner (1960), Petrosian –
 * Pachman (1961) et Zagoryansky – Romanovsky (1943), telles que présentées
 * dans « The Most Instructive Games of Chess Ever Played » de Chernev. Le
 * chapitre 1 est une ligne théorique sans source (Dragon, attaque yougoslave),
 * choisie d'après les structures types de « Chess Structures » (Flores Rios).
 * Écartées après sondage : Botvinnik – Boleslavsky 1941 (10.Be3 n'y apporte
 * selon Stockfish que l'égalité) et Eliskases – Grünfeld 1933 (trois fautes
 * de 0,5 pion ou plus en quatre coups, la démonstration ne tient pas).
 *
 * Plan : définition, le fou du fianchetto qu'on échange (1) ; éliminer le
 * seul défenseur des cases noires, Andric – Daja (2), puis l'invasion (3) ;
 * échanger le fou g7 avec un cavalier, Fischer – Berliner (4), puis le fou
 * qui s'installe en h6 (5) ; la paralysie par un fou en d6, Petrosian –
 * Pachman (6), puis le sacrifice de dame sur f6 (7) ; le complexe de CASES
 * BLANCHES, Zagoryansky – Romanovsky : sa naissance (8), la marche du roi
 * noir (9), la percée finale (10).
 *
 * Toutes les lignes ont été rejouées avec chess.js et chaque coup sondé avec
 * Stockfish 18 (profondeur 18, 3 candidats par coup). Règle appliquée : quand
 * un coup perd environ 0,5 pion ou plus par rapport au choix du moteur, la
 * LIGNE PRINCIPALE suit le moteur et la suite de la partie passe en
 * variante, signalée comme fautive. Exception : dans une position déjà
 * décisive (plus de +3 environ), un écart est seulement signalé dans le
 * commentaire. C'est pourquoi les chapitres 3 et 7 commencent au moment où
 * la position est devenue décisive, et pourquoi plusieurs chapitres
 * commencent après une imprécision signalée dans l'introduction. Les
 * évaluations citées sont du point de vue des Blancs. Aucun résultat de
 * partie (1-0, 0-1…) dans les variantes : le parseur s'y arrêterait.
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

export const LE_COMPLEXE_DE_CASES_FAIBLES: CourseTree = {
  chapters: [
    chapter(
      "Définition : quand le fou d'une couleur disparaît",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      `{ Un COMPLEXE DE CASES FAIBLES, c'est un groupe de cases de la même couleur qu'aucun pion et aucune pièce de ton camp ne peut plus surveiller durablement. Ce n'est pas une case isolée : c'est tout un réseau, souvent autour du roi.

D'où vient-il ? Presque toujours de la disparition d'un fou. Un fou ne voit qu'une couleur. Si ton fou des cases noires quitte l'échiquier, les cases noires qui ne sont pas couvertes par tes pions n'ont plus de gardien naturel. Et un pion ne recule jamais : le trou ne se rebouche pas.

L'exemple type est le fianchetto. Avec des pions en f7, g6 et h7, les cases f6, h6 et g7 sont noires et AUCUN de ces pions ne les protège. Tant que le fou g7 est là, tout va bien. S'il disparaît, le roi noir est entouré de trous.

Ce chapitre montre une ligne très jouée du Dragon (attaque yougoslave), où toute la lutte tourne autour de ce fou g7.

PRO TIP : avant d'échanger un fou, regarde la couleur de tes pions. Si tes pions laissent des trous de la couleur de ce fou, l'échange te coûte bien plus qu'une pièce mineure. }
1. e4 { Le pion roi prend le centre. Le meilleur coup selon Stockfish. }
1... c5 { La Sicilienne : les Noirs contestent la case d4 depuis le côté. Un des meilleurs coups. }
2. Nf3 { Le cavalier se développe et prépare d4. Le meilleur coup. }
2... d6 { Le pion protège e5 et ouvre la diagonale du fou c8. Un des trois meilleurs coups. }
3. d4 { Les Blancs ouvrent le centre. Le meilleur coup. }
3... cxd4 { Les Noirs échangent leur pion c contre le pion d : ils gagnent une majorité centrale. Un des meilleurs coups. }
4. Nxd4 { Le cavalier reprend et se centralise. Le meilleur coup. }
4... Nf6 { Le cavalier attaque e4 et se développe. Le meilleur coup. }
5. Nc3 { Le cavalier protège e4. Le meilleur coup. }
5... g6 { LE DRAGON. Les Noirs préparent ...Bg7. Les pions f7, g6 et h7 laissent maintenant les cases f6, h6 et g7 sans protection de pion : elles dépendent toutes du futur fou g7. 5...a6 (la Najdorf) était un peu plus précis, mais l'écart reste raisonnable. [%csl Rf6,Rh6,Rg7] }
6. Be3 { Le fou des cases noires blanc se poste en e3. De là, il pourra aller en h6 pour proposer l'échange du fou g7. Le meilleur coup. [%cal Ge3h6] }
6... Bg7 { Le fou arrive en g7, gardien des cases noires autour du roi. Un des meilleurs coups, à égalité avec 6...Nc6. [%csl Gg7] }
7. f3 { Le pion f empêche ...Ng4, qui aurait chassé le fou e3, et soutient la poussée g4. Le meilleur coup. }
7... O-O { Le roi noir rejoint le fianchetto. Le meilleur coup. }
8. Qd2 { LE PLAN CLASSIQUE. La dame se place derrière le fou e3 : au prochain coup, Bh6 proposera l'échange du fou g7, et la dame reprendra en h6, au cœur des cases noires. Le meilleur coup. [%cal Ge3h6,Gd2h6] }
8... Nc6 { Le cavalier se développe et attaque d4. Le meilleur coup. }
9. O-O-O { Le roi blanc va à l'aile dame. Les Blancs préparent g4 et h4, et toujours l'idée Bh6. Le meilleur coup (+0,7). }
9... d5 { La réponse énergique des Noirs : ils frappent au centre avant que l'attaque blanche ne démarre. Les autres coups (9...h5 par exemple) laissaient les Blancs plus à l'aise. Le meilleur coup. [%cal Gd5e4] }
10. exd5 { Les Blancs prennent. Le meilleur coup. }
10... Nxd5 { Le cavalier reprend et se centralise en d5. Le meilleur coup. }
11. Nxc6 { Les Blancs échangent un cavalier pour préparer Bd4. Le meilleur coup. }
11... bxc6 { Le pion reprend vers le centre. Le meilleur coup. }
12. Bd4 { L'IDÉE CENTRALE. Le fou blanc se place face au fou g7, sur la même grande diagonale. Il propose l'échange du gardien des cases noires. Le meilleur coup. [%cal Gd4g7] }
12... Bxd4 { Les Noirs acceptent l'échange. C'est la suite principale. Mais regarde le résultat : les cases f6, h6 et g7 n'ont plus de gardien. }
13. Qxd4 { La dame reprend et se place sur la grande diagonale a1-h8, celle du fou disparu. Le meilleur coup. [%cal Gd4h8] }
13... Qb6 { La dame noire propose l'échange des dames. Sans dames, le complexe de cases noires serait bien moins dangereux. Le meilleur coup. [%cal Gb6d4] }
14. Na4 { Les Blancs refusent l'échange en chassant la dame : ils veulent garder les pièces qui pourront exploiter les cases noires. Le meilleur coup. [%cal Ga4b6] }
14... Qa5 { La dame recule. Un des meilleurs coups. }
15. b3 { Le pion protège le cavalier a4. Le meilleur coup. }
15... Qc7 { La dame se replace. Un des meilleurs coups. }
16. Bc4 { Le fou se développe et vise le cavalier d5. 16.Bd3 était un rien plus précis, l'écart est minime.

Bilan : les Blancs gardent un petit avantage durable (environ +0,5). Le fou g7 a disparu et la dame blanche contrôle la grande diagonale noire. Les cases f6, h6 et g7 restent des cibles pour toute la partie, parce qu'aucun pion noir ne pourra jamais les couvrir. }`,
    ),
    chapter(
      "Andric – Daja : garder le seul défenseur",
      "r1q2rk1/1bp2ppp/1pnp1b2/p3p3/P1PPPP2/2P3P1/1BQN2BP/R4RK1 w - - 3 15",
      `{ Andric – Daja, 1949. Les Noirs ont joué une Ouest-Indienne. Leur fou b7 se heurte au centre blanc. Leur fou des cases noires vient d'arriver en f6.

Regarde ce fou f6 : c'est la SEULE pièce noire capable de protéger les cases noires autour du roi (f6, g7, h6). Les Blancs ont, eux, un fou des cases noires en b2, prêt à venir en a3.

Le coup précédent, 14...Bf6, était déjà un peu imprécis (14...Nb8 gardait la position autour de +0,5). Ici, les Blancs sont mieux (+1).

Le thème de ce chapitre : quand un camp n'a plus qu'un défenseur pour tout un complexe de cases, l'adversaire cherche à l'échanger, même au prix d'une qualité. Et le défenseur doit tout faire pour le garder.

PRO TIP : compte les défenseurs d'une couleur. Une seule pièce pour tout un réseau de cases, c'est une cible. }
15. fxe5 { Les Blancs ouvrent la colonne f. Le meilleur coup. Derrière le pion f, la tour f1 regarde maintenant le fou f6. [%cal Gf1f6] }
15... dxe5 { Le pion reprend. Le meilleur coup. Les autres reprises perdaient bien plus. }
16. d5 { Le pion avance et chasse le cavalier c6. Il ferme aussi la diagonale du fou b7 : ce fou noir, déjà gêné, devient très passif. Le meilleur coup. [%csl Rb7][%cal Gd5c6] }
16... Nb8 { Le cavalier recule. Le meilleur coup. }
17. Ba3 { Le fou blanc se place sur la diagonale a3-f8 et attaque la tour f8. Le meilleur coup. Les Blancs menacent de gagner la qualité, mais surtout de faire reculer les pièces noires. [%cal Ga3f8] }
17... Qd8 { LA BONNE DÉFENSE, d'après Stockfish. La dame protège le fou f6. Les Noirs acceptent de perdre la qualité en f8 pour GARDER leur fou des cases noires. [%cal Gd8f6] } (17... Rd8 { LA FAUTE DE LA PARTIE. La tour s'écarte de l'attaque du fou a3, mais le fou f6 n'est plus protégé que par le pion g7. Les Blancs passent de +0,9 à +1,9. } 18. Rxf6 { LE SACRIFICE DE QUALITÉ. La tour se donne pour le fou f6, le dernier gardien des cases noires. Le meilleur coup. [%cal Gf1f6] } 18... gxf6 { Le pion reprend, forcé : les autres coups laissent les Blancs avec une pièce de plus. Le roi noir a perdu son fou ET le pion g7 qui l'abritait. } 19. Qd1 { La dame se dirige vers h5, à côté du roi noir. Le meilleur coup. [%cal Gd1h5] } 19... c5 { Les Noirs ferment le centre de leur côté. Une imprécision : la position passe d'environ +1,8 à +2,4. } (19... Qd7 { La dame vient défendre l'aile roi par la septième rangée. C'était plus tenace. }) 20. Qh5 { La dame s'installe en h5 et vise f7 et h7. Le meilleur coup. } 20... Rd6 { Une nouvelle imprécision, qui rend la position décisive (+3). La suite est le sujet du chapitre suivant. } (20... Qc7 { La défense la plus tenace : la dame vient protéger la deuxième rangée. Les Blancs restaient nettement mieux (+2,4). })) 18. Bxf8 { Le fou prend la tour. Le meilleur coup. Les Blancs ont gagné la qualité. }
18... Qxf8 { La dame reprend. Le meilleur coup. Le fou f6 est toujours là, et avec lui le contrôle des cases noires. }
19. Bh3 { Le fou des cases blanches se place sur la diagonale c8-h3. Un des trois meilleurs coups, presque équivalent à 19.h4. [%cal Gh3c8] }
19... Na6 { Le cavalier se dirige vers c5, une belle case noire. Le meilleur coup. [%cal Ga6c5] }
20. Rf3 { La tour se place sur la troisième rangée pour se doubler sur la colonne f. Un des meilleurs coups, à égalité avec 20.Bg4. }
20... Nc5 { Le cavalier arrive en c5. Un des meilleurs coups. Avec le fou f6 et le cavalier c5, les Noirs tiennent leurs cases noires. [%csl Gc5,Gf6] }
21. Raf1 { Les tours se doublent sur la colonne f. Un des meilleurs coups.

Bilan : les Blancs ont une qualité de plus, mais l'évaluation n'est que d'environ +0,7. Garder le défenseur des cases noires valait bien une qualité. Dans la partie, 17...Rd8 a laissé partir ce défenseur, et tout s'est effondré. }`,
    ),
    chapter(
      "Andric – Daja : l'invasion des cases noires",
      "rnq3k1/1b3p1p/1p1r1p2/p1pPp2Q/P1P1P3/B1P3P1/3N2BP/R5K1 w - - 2 21",
      `{ Suite de la partie Andric – Daja (variante 17...Rd8 du chapitre précédent). Les Blancs ont donné une tour contre le fou f6. Ils ont une qualité de moins, mais la position est déjà décisive (+3).

Pourquoi ? Les Noirs n'ont plus aucune pièce pour les cases noires. Le fou b7 est enfermé par le pion d5. Le roi g8 est entouré de cases noires vides (g7, h6, f6 est occupée par un pion qui ne bouge plus) et de trous (f5, h6).

Le plan blanc a trois étapes :
1. amener le fou blanc en f5, dans le trou devant le roi ;
2. ramener le fou a3 vers h6 ;
3. ouvrir les lignes vers les cases noires e5, f6 et g7.

Comme la position est décisive, les coups de la partie restent en ligne principale, même quand Stockfish préfère une autre suite. }
21. Bh3 { Le fou vise f5. 21.Nf3 était à peu près aussi fort. [%cal Gh3f5] }
21... Qf8 { La dame vient défendre la case g7. 21...Nd7 tenait un peu mieux, mais la position est perdue de toute façon. [%csl Rg7] }
22. Bf5 { Le fou s'installe en f5, un trou que plus aucun pion noir ne peut attaquer. Il menace Qxh7+. 22.Nf3 était encore plus fort, mais le coup de la partie suffit largement. [%cal Gf5h7,Gh5h7] }
22... Qg7 { La dame défend h7 et g7. Le meilleur coup. }
23. Nf3 { Le cavalier entre dans le jeu. Il vise e5 et h4. Le meilleur coup. [%cal Gf3e5,Gf3h4] }
23... Nd7 { Le cavalier se développe enfin. 23...Kf8 tenait un peu mieux. }
24. Bc1 { Le fou des cases noires change de diagonale pour aller en h6. Le meilleur coup. [%cal Gc1h6] }
24... Kh8 { Le roi s'écarte de la diagonale du futur fou h6. Le meilleur coup. }
25. Bh6 { LE FOU ARRIVE EN H6 et attaque la dame g7. Il occupe une case noire au cœur du camp noir. 25.Nh4 était encore plus fort (+3,9 contre +3,6). [%csl Gh6][%cal Gh6g7] }
25... Qg8 { La dame recule. Le meilleur coup. }
26. Bxd7 { Le fou prend le cavalier, un défenseur de la case e5. Le meilleur coup. }
26... Rxd7 { La tour reprend. Une faute : 26...Qg6 limitait les dégâts. Maintenant le pion e5 n'a plus qu'un défenseur, le pion f6. [%csl Re5] }
27. Nxe5 { LE SECOND SACRIFICE. Le cavalier se donne en e5 pour ouvrir la diagonale de la dame vers f6. Le meilleur coup (+5,8). [%cal Gh5e5] }
27... fxe5 { Le pion reprend. Le meilleur coup, même s'il ne sauve rien. }
28. Qxe5+ { La dame entre en e5, sur la grande diagonale noire, avec échec. Le meilleur coup. [%cal Ge5h8] }
28... f6 { Le seul coup qui pare l'échec sans perdre la dame tout de suite. }
29. Qxf6+ { La dame prend en f6, encore une case noire, avec échec. Le meilleur coup. }
29... Rg7 { La tour s'interpose en g7. Le meilleur coup. }
30. Rf1 { La dernière pièce blanche entre dans le jeu par la colonne f ouverte. Le meilleur coup. [%cal Gf1f8] }
30... Ba6 { Le fou attaque c4 pour se libérer. Le meilleur coup. }
31. d6 { Le pion d file vers la promotion. 31.Rf5 était plus net, mais le coup joué gagne aussi. [%cal Gd6d8] }
31... Bxc4 { Le fou prend le pion c4. Le meilleur coup. }
32. d7 { Le pion arrive en d7 et menace de promouvoir. Le meilleur coup. }
32... Bxf1 { Le fou prend la tour f1. Le meilleur coup, mais rien ne sauve les Noirs. }
33. Bxg7+ { Le fou prend la tour g7 avec échec. Le meilleur coup. }
33... Qxg7 { La dame reprend, forcé. }
34. d8=Q+ { Le pion devient dame avec échec. Le meilleur coup. }
34... Rxd8 { La tour prend la nouvelle dame. Seul coup. }
35. Qxd8+ { La dame reprend avec échec. Le meilleur coup. }
35... Qg8 { La dame s'interpose. }
36. Qxg8+ { Les Blancs échangent les dames. Le meilleur coup. }
36... Kxg8 { Le roi reprend. }
37. Kxf1 { Le roi prend le fou. La finale de pions est facilement gagnée : les Blancs ont un pion de plus et les pions noirs sont dispersés.

Résumé : un sacrifice de qualité pour éliminer le seul défenseur des cases noires (18.Rxf6), puis l'occupation des trous (Bf5, Bh6), puis l'ouverture des cases noires e5, f6 et g7 par des sacrifices. Toute l'attaque s'est jouée sur une seule couleur de cases. }`,
    ),
    chapter(
      "Fischer – Berliner : échanger le fou g7 avec un cavalier",
      "r1bq1rk1/pp1nnpbp/3p2p1/3Pp3/2P5/1PNBB3/P3NPPP/R2Q1RK1 w - - 1 13",
      `{ Fischer – Berliner, 1960 (défense Alekhine). Les Noirs ont fianchetté leur fou en g7. Le centre est fermé : pion blanc en d5, pions noirs en d6 et e5.

Le fou g7 est encore enfermé derrière le pion e5, mais il protège toutes les cases noires autour du roi (f6, h6, g7). Le plan de Fischer : ouvrir le jeu avec f4, puis éliminer ce fou avec un CAVALIER.

Pourquoi un cavalier ? Le fou blanc des cases noires reste sur l'échiquier. Après l'échange, les Blancs auront un fou des cases noires et les Noirs non : c'est la recette du complexe de cases faibles.

PRO TIP : pour créer un complexe de cases faibles, échange le fou adverse contre une AUTRE pièce que ton fou de la même couleur. Ton fou restera seul maître de ces cases. }
13. Ne4 { Le cavalier se centralise et vise c5 et d6. 13.f3 était un rien plus précis, l'écart est faible. [%cal Ge4c5,Ge4d6] }
13... Nf5 { Le cavalier attaque le fou e3. Le meilleur coup. [%cal Gf5e3] }
14. Bg5 { Le fou attaque la dame en évitant l'échange. Le meilleur coup. [%cal Gg5d8] }
14... f6 { Le pion chasse le fou. Un des trois meilleurs coups. Mais il affaiblit les cases e6 et g6, et place un pion de plus sur une case noire. }
15. Bd2 { Le fou recule sur la diagonale c1-h6. Il garde un œil sur h6. Le meilleur coup. [%cal Gd2h6] }
15... Nc5 { Le cavalier attaque e4 et d3. Le meilleur coup selon Stockfish. }
16. Nxc5 { Le cavalier prend. Le meilleur coup. }
16... dxc5 { Le pion reprend. Le meilleur coup. Les autres reprises laissaient une pièce en prise. Le fou g7 est toujours bloqué par le pion e5. }
17. Bxf5 { Le fou prend le cavalier f5, qui aurait pu venir en d4 ou d6. Un des meilleurs coups. }
17... Bxf5 { Le fou reprend. Le meilleur coup : sur 17...gxf5, le roi noir aurait été bien plus exposé (+2). }
18. f4 { LA RUPTURE. Le pion f attaque e5. Si le pion e5 disparaît, la colonne f s'ouvre et le cavalier e2 peut sauter vers h5. 18.Bc3 était un rien plus précis, l'écart est faible. [%cal Gf4e5] }
18... exf4 { Les Noirs prennent. Un des trois meilleurs coups. Le fou g7 voit maintenant toute la grande diagonale, mais il va être échangé. }
19. Nxf4 { Le cavalier reprend et s'approche de h5. Le meilleur coup. [%cal Gf4h5] }
19... Qd6 { La dame se centralise. 19...Qd7 était un peu plus précis. }
20. Nh5 { LE COUP-CLÉ. Le cavalier attaque le fou g7, le gardien des cases noires. Le meilleur coup. Les Noirs ne peuvent pas prendre : sur 20...gxh5, 21.Rxf5 récupère aussitôt la pièce et le roi noir reste à découvert. [%cal Gh5g7] }
20... Rae8 { La tour prend la colonne e. Un des trois meilleurs coups. Le fou g7 ne peut pas éviter l'échange. }
21. Nxg7 { Le cavalier prend le fou. Le sacrifice de qualité 21.Rxf5 gxf5 était un peu plus fort selon Stockfish, mais le coup de la partie suit le plan. }
21... Kxg7 { Le roi reprend. Le meilleur coup.

Bilan : les Blancs ont un fou des cases noires (d2), les Noirs non. Les cases h6, g7 et e5 n'ont plus de gardien noir. La suite montre comment Fischer y installe son fou. [%csl Rh6,Rg7,Re5] }`,
    ),
    chapter(
      "Fischer – Berliner : le fou en h6 et l'erreur de l'échange",
      "4rr2/pp4kp/3q1pp1/2pP1b2/2P5/1P6/P2B2PP/R2Q1RK1 w - - 0 22",
      `{ Suite de Fischer – Berliner. Les Blancs ont un fou des cases noires, les Noirs un fou des cases blanches. Les pions noirs f6 et g6 sont figés. Autour du roi g7, les cases noires h6, e5 et f8 sont faibles.

Le plan blanc : amener le fou en h6, avec échec, pour clouer le roi derrière une case noire occupée. Les Blancs sont mieux (+1).

Ce chapitre montre aussi une faute de méthode. Quand on joue contre un complexe de cases faibles, il faut garder les pièces lourdes. Chaque échange soulage le défenseur. Dans la partie, Fischer a échangé une paire de tours trop tôt (25.Rae1?!), et l'avantage a presque disparu. }
22. Bf4 { Le fou attaque la dame et s'approche de h6. Le meilleur coup. [%cal Gf4d6] }
22... Qd7 { La dame recule et protège la septième rangée. Le meilleur coup. }
23. Qd2 { La dame se place derrière le fou, sur la diagonale c1-h6. Le meilleur coup. [%cal Gd2h6] }
23... Rf7 { La tour protège la septième rangée. 23...g5 était un rien plus précis. }
24. Bh6+ { LE FOU ARRIVE EN H6 avec échec. Il occupe une case noire collée au roi noir, et aucune pièce noire ne pourra jamais le chasser. Le meilleur coup. [%csl Gh6] }
24... Kg8 { Le roi recule. Le meilleur coup : 24...Kh8 était moins bon (+1,9). }
25. h3 { LA BONNE MÉTHODE, selon Stockfish. Le pion donne de l'air au roi blanc et enlève la case g4 au fou noir. Les Blancs ne se pressent pas : le fou h6 ne partira pas. [%cal Gh3g4] } (25. Rae1 { LE COUP DE LA PARTIE, une imprécision (+1,1 à +0,3). La tour va sur la colonne e, mais elle permet aux Noirs d'échanger une paire de tours. } 25... Rfe7 { Les Noirs proposent l'échange. Le meilleur coup. } 26. Rxe7 { Les Blancs échangent. Le meilleur coup à ce stade. } 26... Qxe7 { La dame reprend. Le meilleur coup. Les Noirs respirent mieux. } 27. h3 { Le pion enlève la case g4 au fou. Le meilleur coup. } 27... Qe4 { Une faute : la dame quitte la défense des cases noires. Les Blancs passent de +0,2 à +1,3. } (27... Qe5 { La dame se centralise sur une case noire, en plein complexe : elle le défend elle-même. L'égalité était à peu près rétablie. }) 28. Qf2 { La dame menace d'entrer en f6 ou en c5. Le meilleur coup. } 28... Qe7 { La dame revient défendre. Un des meilleurs coups. } 29. g4 { Une imprécision (+1,6 à +0,6) : ce pion affaiblit le roi blanc. } (29. Qg3 { La dame visait b8 et la diagonale noire. Les Blancs gardaient +1,6. }) 29... Bd3 { Le fou attaque la tour f1. Le meilleur coup. } 30. Rd1 { La tour attaque le fou. Le meilleur coup. } 30... Be4 { Le fou se replace sur la grande diagonale. Un des meilleurs coups. } 31. d6 { Le pion avance, mais 31.Qg3 était plus précis (+0,8 contre +0,3). } (31. Qg3 { La dame gardait la pression sur les cases noires sans lâcher de pion. }) 31... Qe5 { La dame bloque sur e5, une case noire. Un des trois meilleurs coups. } 32. Bf4 { Le fou chasse la dame. Le meilleur coup. } 32... Qc3 { LA FAUTE DÉCISIVE (de +0,7 à +4,6). La dame part à l'aile dame au lieu de surveiller le pion d, qui file vers d8. } (32... Qe6 { La dame bloquait le pion d sur la case de promotion. La position restait proche de l'égalité. }) 33. d7 { Le pion arrive en d7. Le meilleur coup. } 33... Rd8 { La tour bloque. Le meilleur coup. } 34. Qe2 { La dame menace d'entrer en e8. Le meilleur coup. } 34... Qf3 { Les Noirs proposent l'échange des dames. 34...f5 tenait un peu plus longtemps, mais la position est perdue. } 35. Qxf3 { Les Blancs échangent. Le meilleur coup. } 35... Bxf3 { Le fou reprend. Le meilleur coup. } 36. Bc7 { Le fou des cases noires chasse la tour de la case de promotion. Les Noirs ne peuvent plus arrêter le pion : ils ont abandonné ici. })
25... Qd6 { La dame se centralise sur une case noire et défend les cases faibles elle-même. Le meilleur coup. }
26. Rf2 { La tour se prépare à se doubler sur la colonne f. Le meilleur coup. }
26... Re4 { La tour noire s'active sur la quatrième rangée. Le meilleur coup. }
27. Raf1 { Les tours blanches se doublent sur la colonne f, face au pion f6. Le meilleur coup.

Bilan : les Blancs gardent leurs deux tours et leur fou h6 : environ +1. Le fou h6 fige le roi noir et la colonne f met la pression sur f6. La leçon de la partie : contre un complexe de cases faibles, on garde ses pièces, on ne les échange pas. }`,
    ),
    chapter(
      "Petrosian – Pachman : un fou en d6 qui paralyse tout",
      "r1b2rk1/pp2npbp/1q2p1p1/2p5/3n1B2/1N1P1NP1/PPP2PBP/R2QR1K1 w - - 6 13",
      `{ Petrosian – Pachman, 1961 (attaque est-indienne). Après 8.e5 et 9.exd6, les Noirs ont perdu leur pion d. Leurs pions restent en c5, e6, f7, g6 et h7.

Regarde la case d6. Aucun pion noir ne pourra plus jamais la contrôler : le pion c5 couvre b4 et d4, le pion e6 couvre d5 et f5. La case d6 est noire. Les autres cases noires f6 et h6 sont aussi des trous. Tout ce complexe ne dépend que du fou g7.

Les Noirs ont déjà joué deux coups imprécis (11...Nd4 et 12...Qb6). Les Blancs sont nettement mieux (+1,4).

Le plan blanc : installer le fou f4 en d6, au cœur du complexe, d'où il paralyse les tours et les pièces mineures noires. }
13. Ne5 { Le cavalier se centralise et ouvre la diagonale du fou g2. 13.Nfd2 était un peu plus précis (+1,4 contre +0,9). [%cal Gg2b7] }
13... Nxb3 { Le cavalier prend le cavalier b3. 13...Bxe5 était un peu plus précis, mais il donnait le fou g7, gardien des cases noires. }
14. Nc4 { Le cavalier vient en c4 et attaque la dame. Il vise aussi d6. Le meilleur coup. [%cal Gc4b6,Gc4d6] }
14... Qb5 { La dame se met à l'abri. 14...Qd8 était un peu meilleur. }
15. axb3 { Le pion reprend et ouvre la colonne a. Le meilleur coup. }
15... a5 { Le pion soutient la dame b5 et menace ...a4. Le meilleur coup. }
16. Bd6 { LE FOU S'INSTALLE EN D6. Il attaque le cavalier e7 et la tour f8 est coupée du reste de son camp. Aucun pion noir ne peut le chasser. Le meilleur coup. [%csl Gd6][%cal Gd6e7] }
16... Re8 { LA BONNE DÉFENSE. La tour protège le cavalier e7 et le fou g7 reste à son poste. Les Blancs restent nettement mieux (+1,6), mais il n'y a rien de décisif. } (16... Bf6 { LA FAUTE DE LA PARTIE (de +1,6 à +3,3). Le fou quitte g7 pour défendre e7. Mais le roi noir perd son gardien, et la case g7 devient libre pour les pièces blanches. } 17. Qf3 { La dame blanche vise f6 et la grande diagonale. Le meilleur coup. La suite est le sujet du chapitre suivant. [%cal Gf3f6] })
17. Qd2 { La dame se place sur la diagonale c1-h6 pour soutenir les cases noires. Un des meilleurs coups, presque équivalent à 17.Bc7. [%cal Gd2h6] }
17... Nf5 { Le cavalier attaque le fou d6. Le meilleur coup. }
18. Bc7 { Le fou évite l'échange et attaque le pion a5. Un des meilleurs coups, à égalité avec 18.Be5. [%cal Gc7a5] }
18... Rf8 { La tour revient. Un des meilleurs coups. }
19. Bxa5 { Le fou prend le pion a5. 19.Ra2 était un peu plus précis, mais gagner ce pion garde un net avantage (+1,5).

Bilan : les Blancs ont gagné un pion et gardent leur fou des cases noires très actif. Le fou g7 est resté à sa place : le roi noir n'est pas en danger immédiat. Garder le gardien des cases noires a évité le pire. }`,
    ),
    chapter(
      "Petrosian – Pachman : le sacrifice de dame en f6",
      "r1b2rk1/1p2np1p/3Bpbp1/pqp5/2N5/1P1P2P1/1PP2PBP/R2QR1K1 w - - 2 17",
      `{ Suite de Petrosian – Pachman, après la faute 16...Bf6. Le fou noir a quitté g7. Il est en f6, où il défend le cavalier e7.

Les Blancs ont un fou en d6, au cœur des cases noires. Le roi noir g8 n'a plus que ses pions f7, g6 et h7. Les cases noires g7 et h6 n'ont plus de gardien.

La position est déjà décisive (+3,3). Le coup de la partie est donc gardé même quand Stockfish préfère autre chose.

Regarde bien la fin : toutes les cases de l'attaque blanche (f6, e5, g7) sont noires. }
17. Qf3 { La dame vient sur la diagonale d1-h5... et surtout sur la colonne f, face au fou f6. Le meilleur coup. [%cal Gf3f6] }
17... Kg7 { UNE FAUTE GRAVE. Le roi veut protéger f6, mais il se met sur la case de la future attaque. 17...Nd5 tenait bien mieux (+3,6 contre +8,4). }
18. Re4 { La tour se prépare à aller en f4 ou h4. 18.Qxf6+ tout de suite était bien plus fort et gagnait immédiatement. La position reste gagnante (+3,3), mais l'occasion était plus grande. [%cal Ge4f4] }
18... Rd8 { LA FAUTE FINALE. La tour quitte f8 et le roi n'a plus de case de fuite par là. Les Noirs étaient perdus de toute façon, mais 18...Nd5 tenait plus longtemps. Maintenant, il y a un mat forcé. }
19. Qxf6+ { LE SACRIFICE DE DAME. La dame prend le fou f6, le dernier défenseur des cases noires. Le meilleur coup : mat en quelques coups. [%csl Rf6] }
19... Kxf6 { Le roi prend la dame. 19...Kg8 retardait le mat, mais perdait aussi. }
20. Be5+ { Le fou passe de d6 à e5 avec échec, sur une autre case noire. Le meilleur coup. [%cal Ge5f6] }
20... Kg5 { Le roi avance, seul coup qui ne mate pas plus vite. 20...Kf5 menait à un mat encore plus rapide. }
21. Bg7 { LE COUP SILENCIEUX. Le fou se place en g7 : il contrôle h6, f6 et f8. Le roi noir n'a plus de case noire libre. Les Blancs menacent h4+ suivi du mat. C'est ici que Pachman a abandonné. [%csl Gg7][%cal Gg7h6,Gg7f6] }
21... Rxd3 { Une suite possible, choisie par Stockfish : la tour prend le pion d3 pour chercher du jeu. Rien ne sauve les Noirs. }
22. cxd3 { Le pion reprend la tour. Le meilleur coup. }
22... Kh5 { Le roi essaie de fuir par h5. }
23. Bf3+ { Le fou des cases blanches donne échec en passant par g4. Le meilleur coup. [%cal Gf3h5] }
23... Kg5 { Le roi revient en g5, seul coup. }
24. h4+ { Le pion h donne échec. Le meilleur coup. }
24... Kf5 { Le roi va en f5, seul coup. }
25. Re5# { MAT. La tour donne échec en e5. Le roi n'a aucune case : le fou g7 couvre f6, le pion g3 couvre f4 et le fou f3 couvre g4 et e4, le pion h4 couvre g5.

Résumé : le fou blanc s'est installé en d6, puis le gardien g7 a quitté son poste. Les Blancs ont donné leur dame pour éliminer le dernier défenseur des cases noires, et leurs deux fous ont fait le reste. }`,
    ),
    chapter(
      "Zagoryansky – Romanovsky : naissance d'un complexe de cases blanches",
      "r3r1k1/p1pq1ppp/1p3n2/n2p4/Q2P4/B1P1PN2/P4PPP/R2R2K1 w - - 2 15",
      `{ Zagoryansky – Romanovsky, 1943 (défense Nimzo-Indienne). Un complexe de cases faibles peut aussi être BLANC. Ici, les Blancs ont échangé tôt leur fou des cases blanches (6.Bf3?! Bxf3), puis les Noirs ont donné leur fou b4 contre le cavalier c3.

Résultat : les Blancs n'ont plus qu'un fou des cases noires (a3). Leurs pions c3, d4 et e3 sont sur des cases noires. Personne ne protège les cases blanches c4 et e4. Les Noirs ont deux cavaliers qui vont s'y installer.

Plusieurs coups blancs ont déjà été imprécis (10.bxc3 et 14.Rfd1 surtout). Les Noirs sont mieux (-0,7).

PRO TIP : un fou ne voit qu'une couleur. Si tous tes pions sont sur la couleur de ton dernier fou, l'autre couleur n'a plus aucun gardien. }
15. Qxd7 { Les Blancs échangent les dames. Le meilleur coup. }
15... Nxd7 { Le cavalier reprend. Le meilleur coup. Il se dirige vers c4 ou e4. }
16. Bb4 { Le fou attaque le cavalier a5. 16.Nd2 était un peu meilleur, pour surveiller c4 et e4 avec le cavalier. }
16... Nc4 { Le cavalier s'installe en c4, une case blanche qu'aucun pion blanc ne peut attaquer. Le meilleur coup. [%csl Gc4] }
17. a4 { Le pion avance pour gagner de l'espace. Le meilleur coup. }
17... a5 { Le pion chasse le fou b4. Le meilleur coup. }
18. Ba3 { Le fou recule. Le meilleur coup. Le fou a3 ne pourra jamais toucher le cavalier c4 : ils ne sont pas sur la même couleur. }
18... Re6 { La tour se prépare à se placer sur la colonne c ou sur la troisième rangée. 18...f5 était un peu plus précis. }
19. Nd2 { Le cavalier propose l'échange du cavalier c4. Le meilleur coup. }
19... Nxd2 { Les Noirs échangent. 19...Rc6 était un peu plus précis, mais l'idée est bonne : le cavalier d7 reste pour revenir sur les cases blanches. }
20. Rxd2 { La tour reprend. Le meilleur coup. }
20... Rc6 { La tour attaque le pion c3, faible lui aussi. Le meilleur coup. [%cal Gc6c3] }
21. Bb2 { Le fou protège c3. 21.Rc2 était un rien meilleur. }
21... Re8 { La tour revient sur la colonne e. Un des trois meilleurs coups. }
22. Rc2 { LA MEILLEURE DÉFENSE, selon Stockfish. La tour protège c3 et la deuxième rangée. } (22. Kf1 { LE COUP DE LA PARTIE, une imprécision (-0,6 à -1,35). Le roi se rapproche du centre, mais il laisse les Noirs organiser leurs cavaliers. } 22... Nf6 { Le cavalier vise e4, l'autre case blanche faible. Le meilleur coup. [%cal Gf6e4] } 23. Rc2 { La tour protège c3. Un des meilleurs coups. } 23... Ne4 { Le cavalier s'installe en e4. Le meilleur coup. [%csl Ge4] } 24. Ke2 { Le roi se rapproche. Le meilleur coup. } 24... Nd6 { Le cavalier se dirige vers c4. Un des meilleurs coups. [%cal Gd6c4] } 25. Kd3 { Le roi vient défendre c4. Le meilleur coup. } 25... f5 { Le pion f contrôle e4 et prend de l'espace. Un des meilleurs coups. La suite est le sujet du chapitre suivant. })
22... f5 { Le pion f prend la case e4 sous contrôle. Le meilleur coup. [%cal Gf5e4] }
23. Bc1 { Le fou change de diagonale. Le meilleur coup. }
23... Kf7 { Le roi se rapproche du centre. Presque équivalent au choix du moteur (23...Ree6). }
24. Kf1 { Le roi blanc aussi. Un des trois meilleurs coups. }
24... g5 { Le pion g prend de l'espace à l'aile roi. Un des trois meilleurs coups.

Bilan : les Noirs sont un peu mieux (environ -0,5). Leur cavalier peut toujours revenir en c4 ou e4, et le fou blanc ne pourra jamais les en chasser. }`,
    ),
    chapter(
      "Zagoryansky – Romanovsky : la marche du roi sur les cases blanches",
      "4r1k1/2p3pp/1prn4/p2p1p2/P2P4/2PKP3/1BR2PPP/R7 w - - 0 26",
      `{ Suite de Zagoryansky – Romanovsky. Le cavalier noir est en d6, prêt à revenir en c4. Le pion f5 contrôle e4.

Les Noirs sont mieux (-1,1). Mais comment gagner ? Les cavaliers ne suffisent pas à percer. Le plan de Romanovsky : amener son ROI à l'aile dame, par les cases blanches, pour soutenir la poussée ...b5 et attaquer les pions a4 et c3.

Le roi peut voyager tranquillement : le fou blanc ne contrôle que les cases noires, il ne peut jamais lui donner échec sur une case blanche. }
26. f3 { Le pion f enlève la case e4 au cavalier. 26.g3 était un rien plus précis. Mais il met un pion de plus sur une case blanche, où il pourra devenir une cible. }
26... Nc4 { Le cavalier revient en c4. Un des meilleurs coups. [%csl Gc4] }
27. Bc1 { Le fou se replace. 27.Re2 était un peu plus précis. }
27... Rce6 { La tour attaque le pion e3. Le meilleur coup. [%cal Ge6e3] }
28. Re2 { La tour défend e3. Le meilleur coup. }
28... Kf7 { LE ROI SE MET EN ROUTE. Un des trois meilleurs coups. }
29. Re1 { La tour se replace. Un des meilleurs coups. }
29... c6 { Le pion protège d5 et prépare ...b5. Le meilleur coup. }
30. Rb1 { La tour vise le pion b6. 30.Ra2 était un rien plus précis. }
30... R8e7 { La tour se replace. Le meilleur coup. }
31. Re2 { La tour défend la deuxième rangée. Un des trois meilleurs coups. }
31... Ke8 { Le roi continue vers l'aile dame. Le meilleur coup. [%cal Ge8d7,Gd7c7,Gc7b7] }
32. h3 { Le pion se protège. 32.Bd2 était un rien plus précis. }
32... h5 { Le pion h prend de l'espace. Un des meilleurs coups. }
33. Bd2 { UNE DES MEILLEURES DÉFENSES, selon Stockfish (environ -1,85). Le fou reste près du centre. } (33. Rb3 { LE COUP DE LA PARTIE, une imprécision (-1,8 à -2,3). La tour quitte la première rangée. } 33... Kd7 { Le roi continue sa route. Un des trois meilleurs coups. } 34. Re1 { La tour revient. Un des meilleurs coups. } 34... Kc7 { Le roi arrive en c7. Un des trois meilleurs coups. } 35. g3 { Une nouvelle imprécision (-2,1 à -2,45). } (35. h4 { Le pion h fixait le pion h5 noir. C'était plus tenace. }) 35... Kb7 { Le roi poursuit. 35...h4, qui fixait d'abord les pions blancs de l'aile roi, était un peu plus précis. } (35... h4 { Le pion fixait les pions g3 et h3 sur l'aile roi. Les Noirs gardaient environ -2,6. }) 36. Bd2 { Encore une imprécision (-2,1 à -2,7). } (36. Rb1 { La tour gardait la première rangée. C'était plus tenace. }) 36... Ka6 { LE ROI EST ARRIVÉ EN A6, une case blanche. Il soutient ...b5. La suite est le sujet du chapitre suivant. [%csl Ga6] })
33... Kd7 { Même dans la meilleure défense, le roi noir part vers l'aile dame. Le meilleur coup. }
34. g3 { Le pion se place. Le meilleur coup. }
34... g6 { Le pion se place sur une case blanche, hors de portée du fou blanc, qui ne voit que les cases noires. Un des meilleurs coups. }
35. Rf2 { La tour défend f3. Un des trois meilleurs coups. }
35... Kc7 { Le roi arrive en c7. Un des meilleurs coups. }
36. Re2 { La tour défend e3. Le meilleur coup. }
36... Kb7 { Le roi continue. Un des meilleurs coups. }
37. Bc1 { Le fou se replace. 37.h4 était un rien plus précis. }
37... Ka6 { Le roi arrive en a6, sur une case blanche. Le meilleur coup.

Bilan : même avec la meilleure défense, le roi noir traverse l'échiquier sans jamais être inquiété. Les Noirs préparent ...b5 et restent nettement mieux (environ -2). }`,
    ),
    chapter(
      "Zagoryansky – Romanovsky : la percée par les cases blanches",
      "8/4r1p1/kpp1r3/p2p1p1p/P1nP4/1RPKPPPP/3B4/4R3 w - - 3 37",
      `{ Suite de Zagoryansky – Romanovsky. Le roi noir est arrivé en a6. Le cavalier c4 est inattaquable. Les tours noires visent le pion e3.

Regarde les pions blancs : c3, d4, e3, f3, g3, h3. Le pion e3 n'est défendu que par la tour e1 et le fou d2. Si la tour quitte la colonne e, un sacrifice devient possible.

Les Noirs sont nettement mieux (-2,2). }
37. h4 { LA MEILLEURE DÉFENSE, selon Stockfish. Le pion h fixe le pion h5 et la tour reste sur la colonne e pour défendre e3. } (37. Reb1 { LA FAUTE DE LA PARTIE (de -2,2 à -4). La tour quitte la colonne e. Le pion e3 n'est plus défendu que par le fou d2. } 37... Rxe3+ { LE SACRIFICE. La tour prend le pion e3 avec échec. Le cavalier c4 couvre e3 et b2, le fou blanc ne peut rien contre lui. [%cal Ge6e3] } 38. Bxe3 { Le fou prend la tour. Le meilleur coup. } 38... Rxe3+ { La seconde tour reprend avec échec. Les Noirs ont rendu la qualité, mais ils ont gagné le pion e3 et le fou des cases noires blanc, le dernier gardien de la position blanche. } 39. Kc2 { Le roi recule. Le meilleur coup. } 39... Re2+ { La tour donne échec sur la deuxième rangée. 39...Rxf3 était encore plus fort, mais la position est décisive. } 40. Kd1 { Le roi recule. Le meilleur coup. } 40... Ra2 { La tour attaque le pion a4. Un des meilleurs coups. [%cal Ga2a4] } 41. g4 { Les Blancs cherchent du contre-jeu à l'aile roi. } 41... fxg4 { Le pion prend. } 42. fxg4 { Le pion reprend. } 42... h4 { Le pion h devient passé. } 43. g5 { Le pion g avance. } 43... Rxa4 { La tour prend le pion a4. } 44. Ke2 { Le roi se rapproche. } 44... Ra2+ { La tour donne échec. } 45. Kf3 { Le roi avance. } 45... Nd2+ { Le cavalier donne échec et attaque la tour b3. } 46. Kg4 { Le roi va chercher le pion h4. } 46... Nxb3 { Le cavalier prend la tour. } 47. Rxb3 { La tour reprend. } 47... a4 { Le pion a avance et chasse la tour. } 48. Rb1 { La tour recule. } 48... Rc2 { La tour attaque le pion c3. } 49. Kxh4 { Le roi prend le pion h4. } 49... Rxc3 { La tour prend le pion c3. Les Noirs ont deux pions passés à l'aile dame et la tour pour les soutenir : ils gagneront quatorze coups plus tard. })
37... Rg6 { La tour attaque le pion g3. Le meilleur coup. [%cal Gg6g3] }
38. Rg1 { La tour défend g3. Le meilleur coup. }
38... Rge6 { La tour revient attaquer e3. Le meilleur coup. }
39. Re1 { La tour revient défendre e3. Le meilleur coup. }
39... b5 { LA PERCÉE. Le pion b, soutenu par le roi a6, attaque a4. Le meilleur coup. [%cal Gb6b5] }
40. axb5+ { Les Blancs prennent avec échec. Le meilleur coup. }
40... cxb5 { Le pion reprend. Le meilleur coup.

Bilan : les Noirs gardent un net avantage (environ -2). Leur cavalier domine les cases blanches et leurs pions de l'aile dame avancent. Retiens l'enseignement de toute la partie : un complexe de cases blanches s'exploite comme un complexe de cases noires, avec les pièces qui voient ces cases (cavaliers, roi, tours) pendant que le fou adverse reste aveugle. }`,
    ),
  ],
};
