import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « Les coups de rupture » (positional_mastery, module 20) — format
 * « un commentaire par coup ».
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, entièrement
 * réécrite ici) : parties de « The Most Instructive Games of Chess Ever
 * Played » de Chernev (`chernev1.pgn`) — Petrosian – Kozali (1954, n°8),
 * Smyslov – Rudakovsky (1945, n°16), Evans – Opsahl (1950, n°62) et
 * Pillsbury – Gunsberg (Hastings 1895, n°50, aussi
 * `PILOT_pm-les-coups-de-rupture.pgn`). Les chapitres de théorie (Gambit
 * dame refusé orthodoxe, Sicilienne Sveshnikov, Benoni moderne attaque
 * Taimanov) suivent des lignes d'ouverture standard. La tactique finale est
 * une position anonyme de `data/import/academy/tactics.pgn` (exercice
 * « 1505 00267 »), trouvée en cherchant un levier de pion calme contre le
 * bouclier du roi qui mène au mat.
 *
 * Plan : définition — la rupture libératrice ...e5 du Gambit dame refusé (1) ;
 * Petrosian – Kozali : la rupture ...c5 oubliée (2), la rupture centrale e4
 * puis les ruptures en série f4-f5, e6, f6 (3) ; la Sveshnikov : le levier
 * ...f5 contre e4 (4) ; Smyslov – Rudakovsky : préparer f4-f5 (5), la rupture
 * f6 contre le roque (6) ; Evans – Opsahl : le levier b4-b5 de l'attaque de
 * minorité (7) ; la Benoni : rupture e5 et sacrifice de pion f5 (8) ;
 * Pillsbury – Gunsberg : cinq percées en finale, de f5 à d5 (9) ;
 * Tarrasch – Pillsbury : f4-f5 contre la colonne f (10) ; Marshall – Burn :
 * ...c5-c4 et la rupture e4 trop pressée (11) ; Rubinstein – Spielmann : le
 * levier ...f5-f4 (12) ; Bernstein – Capablanca : ...c5 et le pion passé (13) ;
 * tactique finale : la rupture ...fxg3 contre le roque (14).
 *
 * Les chapitres 10 à 13 (ajoutés le 2026-10-18) viennent de chessgames.com :
 * Tarrasch – Pillsbury, Vienne 1898, départage du 29 juillet (gid 1109164) ;
 * Marshall – Burn, Ostende 1907 (gid 1036028) ; Rubinstein – Spielmann,
 * Saint-Sébastien 1912 (gid 1119753) ; Bernstein – Capablanca, Moscou 1914
 * (gid 1261680 — l'utilisateur avait demandé « Capablanca – Bernstein » : c'est
 * la partie célèbre, Capablanca a les Noirs). Dans chacun, le coup fautif de la
 * partie est en variante (16...Rh8, 16.e4, 18.Nd3, 27.Nxc3) ; dans ces
 * variantes déjà perdues, les écarts suivants sont seulement signalés.
 *
 * Toutes les lignes ont été rejouées avec chess.js et chaque coup sondé avec
 * Stockfish 18 (profondeur 18, 3 candidats par coup), suites du moteur
 * comprises. Règle appliquée : quand un coup perd environ 0,5 pion ou plus
 * par rapport au choix du moteur, la LIGNE PRINCIPALE suit le moteur et le
 * coup de la partie passe en variante, signalée comme fautive. Exception :
 * dans une position déjà décisive (plus de 3 pions environ), un écart est
 * seulement signalé dans le commentaire. Plusieurs chapitres commencent donc
 * juste après une faute signalée dans l'introduction. Les évaluations citées
 * sont du point de vue des Blancs. Aucun résultat de partie (1-0, 0-1…) dans
 * les variantes : le parseur s'y arrêterait.
 *
 * Partie écartée après sondage : Botvinnik – Kann (1943, n°57), dont la
 * rupture 11.f5 coûte environ 1 pion selon Stockfish.
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const LES_COUPS_DE_RUPTURE: CourseTree = {
  chapters: [
    chapter(
      "Définition : la rupture libératrice ...e5 du Gambit dame refusé",
      START,
      `{ Un COUP DE RUPTURE est une poussée de pion qui vient AU CONTACT d'un pion adverse. Les deux pions se touchent en diagonale : l'un des deux va devoir prendre, ou être pris. Cette friction change la structure.

Pourquoi c'est si important ? Une position fermée n'offre pas de lignes aux pièces. La rupture est le seul moyen d'ouvrir une colonne ou une diagonale. Elle peut aussi détruire le centre adverse, ou libérer un camp à l'étroit.

Trois questions avant de rompre :
- QUELLES lignes vont s'ouvrir ? Il faut qu'elles servent TES pièces.
- Mes pièces sont-elles PRÊTES à les utiliser ?
- Que gagne l'adversaire si la structure s'ouvre ?

Dans le Gambit dame refusé orthodoxe, les Noirs sont à l'étroit : leur fou c8 est enfermé derrière le pion e6. La solution classique, celle de Capablanca, est de simplifier puis de jouer la rupture libératrice ...e5.

PRO TIP : quand ton camp manque d'espace, cherche quel pion peut aller au contact du centre adverse. Prépare-le en échangeant une ou deux pièces : moins il y a de pièces, plus la rupture libère les autres. }
1. d4 { Le pion dame prend le centre. Presque aussi bon que 1.e4. }
1... d5 { Les Noirs répondent au centre. Le meilleur coup. }
2. c4 { Le Gambit dame : le pion c attaque d5. C'est déjà un petit levier, car c4 touche d5. Le meilleur coup. [%cal Gc4d5] }
2... e6 { Le Gambit dame refusé : les Noirs soutiennent d5. Le prix est connu : le fou c8 est enfermé. Le meilleur coup. [%csl Rc8] }
3. Nc3 { Le cavalier ajoute une attaque sur d5. Le meilleur coup. [%cal Gc3d5] }
3... Nf6 { Le cavalier défend d5. Le meilleur coup. }
4. Bg5 { Le fou cloue le cavalier f6 sur la dame. Le défenseur de d5 est gêné. Presque aussi bon que 4.cxd5. [%cal Gg5f6,Gf6d8] }
4... Be7 { Le fou rompt le clouage. Le meilleur coup. }
5. e3 { Le pion e ouvre la diagonale du fou f1. Le meilleur coup. }
5... O-O { Le roi noir se met à l'abri. Le meilleur coup. }
6. Nf3 { Le dernier cavalier se développe. Le meilleur coup. }
6... Nbd7 { Le cavalier vient soutenir les futures ruptures ...c5 et ...e5. 6...h6 était un peu plus précis, l'écart est minime. [%cal Gd7e5,Gd7c5] }
7. Rc1 { La tour vient sur la colonne c, qui pourra s'ouvrir. 7.Qc2 était un peu plus précis, l'écart est faible (environ 0,1 pion). }
7... c6 { Les Noirs renforcent d5 et préparent la manœuvre libératrice. Presque aussi bon que 7...h6. }
8. Bd3 { Le fou se développe. Le meilleur coup. }
8... dxc4 { Les Noirs cèdent le centre pour gagner un temps : le fou d3 doit reprendre, donc rejouer. Presque aussi bon que 8...h6. }
9. Bxc4 { Le fou reprend le pion et se place sur la diagonale a2-g8. Le meilleur coup. }
9... Nd5 { LA MANŒUVRE DE CAPABLANCA. Le cavalier propose des échanges : moins il y a de pièces, moins les Noirs sont à l'étroit. 9...a6 était légèrement plus précis (environ 0,1 pion). [%cal Gd5c3,Gd5e7] }
10. Bxe7 { Le fou échange le fou e7. Le meilleur coup. }
10... Qxe7 { La dame reprend et se développe du même coup. Le meilleur coup. }
11. O-O { Le roque : les Blancs ont fini leur développement. Le meilleur coup. }
11... Nxc3 { Deuxième échange. Il ne reste plus que deux pièces mineures de chaque côté. Le meilleur coup. }
12. Rxc3 { La tour reprend et reste active. Le meilleur coup. }
12... e5 { LA RUPTURE LIBÉRATRICE. Le pion e5 vient au contact du pion d4. Les Noirs menacent de prendre en d4, et surtout la case e6 se libère : le fou c8 pourra sortir dès que le cavalier d7 aura bougé. La rupture ...c5, l'autre levier contre d4, est aussi bonne selon Stockfish. [%cal Re5d4][%csl Ge6] }
13. Qc2 { La dame se développe. 13.Bb3, qui met le fou à l'abri tout de suite, était un peu plus précis (environ 0,3 pion). }
13... exd4 { Les Noirs prennent : la colonne e s'ouvre pour leurs tours. Le meilleur coup. [%cal Ge7e3] }
14. exd4 { Le pion reprend. Les Blancs gardent un pion isolé en d4, les Noirs n'ont plus aucune pièce enfermée. Le meilleur coup. }
14... Nb6 { Le cavalier attaque le fou c4 et vise la case d5, juste devant le pion isolé. Le meilleur coup. [%cal Gb6c4,Gb6d5] }
(14... Nf6 { Plus naturel, mais moins précis : le cavalier ne gêne pas le fou c4 et laisse les Blancs s'installer. Environ 0,5 pion de moins que 14...Nb6. }
15. Re1 { La tour occupe la colonne e ouverte. Le meilleur coup. }
15... Qd8 { La dame quitte la colonne e, où elle faisait face à la tour. Le meilleur coup. }
16. h3 { Les Blancs prennent la case g4 au fou c8. Ils sont un peu mieux. Le meilleur coup. [%csl Gg4] })
15. Bb3 { Le fou recule mais garde la diagonale a2-g8. La position est à peu près égale.

Bilan : la rupture ...e5, préparée par deux échanges, a libéré le fou c8 et ouvert la colonne e. Les Noirs n'ont plus de problème d'espace. [%cal Gb3f7] }`,
    ),
    chapter(
      "Petrosian – Kozali (1954) : la rupture ...c5 oubliée",
      "r1bqr1k1/pp2bppp/2p2n2/3p4/3PnB2/2NBP2P/PPQ1NPP1/R3K2R w KQ - 3 12",
      `{ Tigran Petrosian – Kozali, 1954. Un Gambit dame, variante d'échange : les Noirs ont un pion d5, les Blancs un pion d4. Les Blancs ont joué h3 et Nge2 : leur plan est f2-f3, puis la rupture e3-e4.

Les Noirs ont, eux aussi, une rupture à leur disposition : ...c6-c5, contre le pion d4. C'est le levier naturel de cette structure.

Ce chapitre montre ce qui se passe quand un camp OUBLIE sa rupture : l'adversaire joue la sienne, et c'est lui qui ouvre le jeu.

PRO TIP : dans une structure symétrique au centre, la première rupture jouée donne souvent l'initiative. Si l'adversaire prépare la sienne, demande-toi si tu peux jouer la tienne avant. }
12. f3 { Le pion chasse le cavalier e4 et prépare e3-e4. Selon Stockfish, il vaut 12.g4 : les deux coups se valent d'une passe à l'autre. [%cal Gf3e4] }
12... Nxc3 { Le cavalier s'échange avant d'être chassé. Le meilleur coup. }
13. bxc3 { Le pion reprend vers le centre : il soutiendra d4. 13.Qxc3 était un peu plus précis (environ 0,4 pion), car la structure blanche reste intacte. [%cal Gc3d4] }
13... c5 { LA RUPTURE QU'IL FALLAIT JOUER. Le pion c vient au contact de d4. Si les Blancs laissent faire, ...cxd4 ouvrira la colonne c contre le pion c3. Les Noirs prennent l'initiative avant que e3-e4 soit possible. Le meilleur coup : environ -0,3, les Noirs sont un peu mieux. [%cal Rc5d4][%csl Rc3] }
(13... Bd6 { LA FAUTE DE LA PARTIE. Le fou propose l'échange du fou f4, mais la rupture ...c5 est oubliée. Près de 2 pions de moins que 13...c5 : les Blancs vont jouer e4 tranquillement. [%cal Gd6f4] }
14. Bxd6 { Le fou échange le fou d6. Le meilleur coup. }
14... Qxd6 { La dame reprend en d6, où elle sera bientôt chassée. Le meilleur coup. }
15. e4 { La rupture blanche arrive. Le chapitre suivant reprend ici. [%cal Re4d5] })
14. Qd2 { La dame protège le pion c3 et la case e3. Le meilleur coup. [%cal Gd2c3] }
14... Nh5 { Le cavalier attaque le fou f4. Le meilleur coup. [%cal Gh5f4] }
15. Be5 { Le fou évite l'échange et se place au centre. Le meilleur coup. }
15... Bh4+ { Le fou donne échec : le roi blanc, resté au centre, va perdre le roque. Le meilleur coup. [%cal Gh4e1] }
16. Kf1 { Le roi doit bouger. Le meilleur coup. }
16... g6 { Le pion protège le cavalier h5. 16...f6, qui chasse d'abord le fou e5, était un peu plus précis (environ 0,25 pion). Les Noirs sont un peu mieux.

Bilan : la rupture ...c5, jouée à temps, empêche le plan blanc e3-e4 et laisse le roi blanc au centre. [%csl Gh5] }`,
    ),
    chapter(
      "Petrosian – Kozali (1954) : la rupture centrale e4, puis les ruptures en série",
      "r1b1r1k1/pp3ppp/2pq1n2/3p4/3P4/2PBPP1P/P1Q1N1P1/R3K2R w KQ - 0 15",
      `{ Même partie, deux coups plus tard. Les Noirs ont joué 13...Bd6?, et après 14.Bxd6 Qxd6 la rupture ...c5 n'est plus d'actualité. Les Blancs sont environ +1,7.

La rupture e3-e4 est maintenant possible. Le pion e4 va au contact du pion d5. Les Blancs ont tout préparé : f3 soutient e4, et le cavalier e2 contrôle les cases f4 et d4.

Note ce qui se passe ensuite : après la rupture, Petrosian ne prend pas en d5. Il AVANCE en e5 et gagne de l'espace à l'aile roi. Une rupture ne sert pas qu'à ouvrir ; elle peut aussi changer la structure en ta faveur.

PRO TIP : une rupture est réussie quand elle est soutenue par plus de pièces que l'adversaire ne peut en opposer. Compte les soutiens du pion qui avance avant de le pousser. }
15. e4 { LA RUPTURE CENTRALE. Le pion e4 touche d5. Les Noirs ont le choix : prendre en e4 ouvre la colonne e et le fou d3 ; laisser faire, c'est subir e4-e5. Le meilleur coup. [%cal Re4d5][%cal Gf3e4] }
15... Nh5 { Le cavalier part vers f4. Stockfish préfère 15...Nd7, qui garde e5 sous contrôle, l'écart est faible (environ 0,3 pion). [%cal Gh5f4] }
16. e5 { Le pion avance et chasse la dame. Les Blancs ont maintenant la chaîne d4-e5 et beaucoup d'espace à l'aile roi. Le meilleur coup. [%cal Ge5d6][%csl Gd4,Ge5] }
16... Qh6 { La dame se met à l'écart et vise la case e3. Le meilleur coup. [%cal Gh6e3] }
17. Qd2 { La dame propose l'échange. Sans les dames, le roi blanc sera bien au centre. Le meilleur coup. }
17... Qxd2+ { Les Noirs acceptent l'échange. Le meilleur coup. }
18. Kxd2 { Le roi reprend. Il est en sécurité, car il n'y a plus de dames. Le meilleur coup. }
18... g6 { Le pion donne la case g7 au cavalier : le pion g4 aurait sinon chassé le cavalier de h5. Le meilleur coup. }
19. g4 { Le pion chasse le cavalier, qui n'a qu'une case de retraite. Le meilleur coup. [%cal Gg4h5] }
19... Ng7 { Le cavalier se replie en g7, où il est passif. Le meilleur coup. }
20. h4 { Les Blancs gagnent encore de l'espace. Leurs pions f3, g4 et h4 préparent la suite : la poussée f3-f4-f5. Le meilleur coup.

Bilan : la rupture e4 a donné aux Blancs un centre mobile et l'espace pour attaquer. Les Noirs sont environ à -2,3. [%cal Gf3f4,Gf4f5]

Et ce n'est qu'un début : Petrosian va jouer TROIS coups de rupture de suite : f4-f5 contre le pion g6, puis e5-e6 contre f7, puis f5-f6 contre le cavalier g7. Chaque poussée ouvre une ligne de plus. Les tours blanches, déjà sur les colonnes f et g, attendent.

C'est la définition d'une rupture bien préparée : les pièces sont en place AVANT que les lignes s'ouvrent.

PRO TIP : place tes tours derrière la rupture avant de la jouer. Une colonne qui s'ouvre sans tour pour la prendre ne sert à rien. }
20... h6 { Le pion empêche une future poussée g4-g5. Un peu moins précis que 20...Rf8, l'écart est minime (environ 0,2 pion). [%csl Gg5] }
21. Raf1 { La tour a1 vient derrière le pion f. Elle soutiendra f3-f4-f5. Presque aussi bon que 21.Rhg1. [%cal Gf1f5] }
21... Bd7 { Le fou se développe enfin. 21...Kf8 était un peu plus précis (environ 0,5 pion), mais les Noirs sont déjà en difficulté. }
22. Rhg1 { La deuxième tour vient sur la colonne g, derrière le pion g4. Le meilleur coup. [%cal Gg1g4] }
22... b5 { Les Noirs cherchent un jeu à l'aile dame, avec ...b4. 22...Kh8 était légèrement plus précis (environ 0,5 pion). [%cal Gb5b4] }
23. f4 { Le pion avance vers f5, la case du contact avec g6. Le meilleur coup. [%cal Gf4f5] }
23... a5 { Les Noirs poursuivent à l'aile dame. Presque aussi bon que 23...Rab8. }
24. f5 { PREMIÈRE RUPTURE. Le pion f5 touche g6. Si les Noirs prennent, la colonne g s'ouvre pour la tour g1. S'ils ne prennent pas, fxg6 ouvrira la colonne f. Le meilleur coup. [%cal Rf5g6][%cal Gg1g7] }
24... gxf5 { Les Noirs prennent : c'est une faute, car 24...b4 tenait mieux (environ +3,1 au lieu de +5,1). La position était déjà très difficile. }
25. gxf5 { Le pion reprend : la colonne g est ouverte, et la tour g1 regarde le roi noir. Le meilleur coup. [%cal Gg1g8] }
25... Kh8 { Le roi s'écarte de la colonne g. 25...Bxf5, rendre le pion, était à peine meilleur. }
26. e6 { DEUXIÈME RUPTURE. Le pion e6 attaque le fou d7 et le pion f7. Le meilleur coup. [%cal Re6d7,Re6f7] }
26... fxe6 { Les Noirs prennent. Une faute dans une position perdue (26...Nh5 résistait un peu plus). }
27. f6 { TROISIÈME RUPTURE. Le pion f6 attaque le cavalier g7. Le pion e6 noir ne peut rien faire. Le meilleur coup. [%cal Rf6g7] }
27... Nf5 { Le cavalier attaqué fuit en f5. Le meilleur coup. }
28. Bxf5 { Le fou prend le cavalier, le dernier défenseur de l'aile roi. Le meilleur coup. }
28... exf5 { Le pion e6 reprend en f5. Le meilleur coup. }
29. Rg7 { La tour entre en 7e rangée, soutenue par le pion f6. Elle attaque le fou d7, et le mat est proche. Les Noirs ont abandonné. 29.Rg6, qui menaçait Rxh6+, était encore plus fort, mais tout gagne ici (environ +5).

Bilan : trois coups de pion ont ouvert les colonnes f et g et chassé le dernier défenseur du roi noir. [%cal Gg7d7,Gg7h7] }`,
    ),
    chapter(
      "La Sveshnikov : le levier ...f5 contre e4",
      START,
      `{ Dans la Sicilienne Sveshnikov, les Noirs acceptent un pion d6 en retard et un trou en d5. En échange, ils obtiennent une rupture très puissante : ...f7-f5.

Le pion f5 vient au contact du pion e4. Il détruit le soutien du cavalier d5 blanc, ouvre la colonne f et libère le fou de cases noires.

Ici, les Noirs ont même un pion f doublé après Bxf6 gxf6. Ce pion « abîmé » devient leur meilleure arme : il peut aller en f5 tout de suite.

PRO TIP : un pion doublé n'est pas toujours une faiblesse. S'il peut avancer au contact d'un pion adverse, c'est un levier de plus. }
1. e4 { Le pion roi prend le centre. Le meilleur coup. }
1... c5 { La Défense sicilienne. Presque aussi bon que 1...e5 ou 1...c6. }
2. Nf3 { Le cavalier se développe et prépare d4. Le meilleur coup. }
2... Nc6 { Le cavalier se développe et vise d4. Presque aussi bon que 2...d6. }
3. d4 { Les Blancs ouvrent le centre. Le meilleur coup. }
3... cxd4 { Le pion c prend : les Noirs gagnent un pion central contre un pion d'aile. Le meilleur coup. }
4. Nxd4 { Le cavalier reprend. Le meilleur coup. }
4... Nf6 { Le cavalier attaque le pion e4. Le meilleur coup. [%cal Gf6e4] }
5. Nc3 { Le cavalier protège e4. Le meilleur coup. }
5... e5 { La Sveshnikov : le pion e5 chasse le cavalier d4. Les Noirs acceptent le trou en d5. Le meilleur coup. [%cal Ge5d4][%csl Rd5] }
6. Ndb5 { Le cavalier vise la case d6. Le meilleur coup. [%cal Gb5d6] }
6... d6 { Le pion ferme la case d6. Le meilleur coup. }
7. Bg5 { Le fou attaque le cavalier f6, un défenseur de d5. Presque aussi bon que 7.Nd5. [%cal Gg5f6] }
7... a6 { Le pion chasse le cavalier b5. Le meilleur coup. [%cal Ga6b5] }
8. Na3 { Le cavalier recule, il reviendra par c2 ou c4. Le meilleur coup. }
8... b5 { Le pion b prend la case c4 au cavalier a3. Le meilleur coup. [%csl Gc4] }
9. Bxf6 { Le fou prend le cavalier f6 pour contrôler d5. Presque aussi bon que 9.Nd5. }
9... gxf6 { Le pion g reprend. Le pion f est doublé, mais le pion f6 pourra avancer en f5. Le meilleur coup. }
10. Nd5 { Le cavalier s'installe sur la case faible d5. Le meilleur coup. [%csl Gd5] }
10... f5 { LE LEVIER. Le pion f5 touche le pion e4. Il menace ...fxe4, qui détruirait l'appui du cavalier d5. Il ouvre aussi la grande diagonale au fou f8 via g7. Le meilleur coup. [%cal Rf5e4][%cal Gf8g7] }
11. Bd3 { Le fou protège e4. Presque aussi bon que 11.c3. [%cal Gd3e4] }
11... Be6 { Le fou attaque le cavalier d5. Le meilleur coup. [%cal Ge6d5] }
12. O-O { Le roi se met à l'abri. 12.c3 était un peu plus précis, l'écart est faible. }
12... Bxd5 { Le fou prend le cavalier d5. Le meilleur coup. }
13. exd5 { Le pion reprend. La structure change : le pion e4 a disparu, et les pions noirs e5 et f5 sont mobiles au centre. Le meilleur coup. [%csl Ge5,Gf5] }
13... Ne7 { Le cavalier attaque le pion d5. Le meilleur coup. [%cal Ge7d5] }
14. c3 { Le pion ferme la diagonale et prépare Nc2. Presque aussi bon que 14.Nxb5. }
14... Bg7 { Le fou occupe la grande diagonale. La position est égale.

Bilan : grâce au levier ...f5, les Noirs ont échangé le cavalier d5 et obtenu un centre mobile e5-f5. [%cal Gg7b2] }`,
    ),
    chapter(
      "Smyslov – Rudakovsky (1945) : préparer f4-f5",
      "r1bq1rk1/pp2bppp/2nppn2/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 6 9",
      `{ Vasily Smyslov – Iosif Rudakovsky, championnat d'URSS 1945. Une Sicilienne Scheveningen.

Les Blancs ont un pion e4 contre d6 et e6. Leur levier naturel, c'est f2-f4-f5 : ce pion viendra au contact de e6 (ou de e5), puis pourra aller jusqu'en f6, contre le roque.

Dans ce chapitre, on regarde la préparation. Les Noirs répondent par leur propre rupture centrale ...e5. Smyslov réagit en poussant f5 : il gagne de l'espace et garde le levier f6 en réserve.

PRO TIP : un levier peut être gardé en réserve. Un pion qui MENACE d'aller au contact gêne l'adversaire autant qu'un pion qui le fait. }
9. f4 { Le pion f avance : il prépare f5 et contrôle la case e5. Le meilleur coup. [%cal Gf4f5][%csl Ge5] }
9... Qc7 { La dame se développe. 9...e5, la contre-rupture immédiate, était aussi bon, l'écart est minime. }
10. Qe1 { La dame part vers g3 ou h4, vers l'aile roi. Le meilleur coup. [%cal Ge1g3] }
10... Nxd4 { Le cavalier échange le cavalier d4. Le meilleur coup. }
11. Bxd4 { Le fou reprend et s'installe au centre. Le meilleur coup. }
11... e5 { La CONTRE-RUPTURE NOIRE. Le pion e5 attaque le fou d4 et touche le pion f4. Les Noirs veulent fermer le centre avant que f5 ou e5 n'arrive. Le meilleur coup. [%cal Re5d4,Re5f4] }
12. Be3 { Le fou recule. 12.fxe5 était aussi bon. Le meilleur coup. }
12... Be6 { Le fou se développe, mais il va être chassé par f5. 12...b6 était un peu plus précis (environ 0,3 pion). [%cal Rf4f5] }
13. f5 { Le pion avance avec gain de temps : il chasse le fou e6. Les Blancs gagnent de l'espace. Le levier f5-f6 est prêt pour plus tard. Le meilleur coup. [%cal Gf5e6][%cal Gf5f6] }
13... Bc4 { Le fou propose l'échange du fou e2. Presque aussi bon que 13...Bd7. [%cal Gc4e2] }
14. Bxc4 { Le fou échange. Le meilleur coup. }
14... Qxc4 { La dame reprend et vise les pions e4 et a2. Le meilleur coup. [%cal Gc4e4,Gc4a2] }
15. Bg5 { Le fou attaque le cavalier f6, le défenseur de la case d5. Les Blancs veulent installer un cavalier en d5. Le meilleur coup.

Bilan : les Blancs ont la case d5 et un levier f5-f6 prêt contre le roque. La suite au chapitre suivant. [%cal Gg5f6][%csl Gd5] }`,
    ),
    chapter(
      "Smyslov – Rudakovsky (1945) : la rupture f6 contre le roque",
      "2rbr1k1/p4ppp/3p4/1pqNpP2/4P3/1PP5/P5PP/R3QR1K w - - 3 21",
      `{ Même partie, au 21e coup. Après 15...Rfe8 16.Bxf6 Bxf6 17.Nd5 Bd8 18.c3 b5 19.b3 Qc5+ 20.Kh1 Rc8, les Blancs sont environ +3,5. Les Noirs ont commis deux imprécisions (17...Bd8 et 20...Rc8).

Le cavalier d5 est superbe, et le pion f5 est prêt pour la rupture f5-f6. Ce pion va toucher g7, juste devant le roi noir.

Smyslov a d'abord joué 21.Rf3 pour préparer f6. Stockfish montre que la rupture immédiate était plus forte : le moment est déjà venu.

PRO TIP : quand toutes tes pièces sont prêtes, ne prépare pas davantage. Chaque coup de préparation donne un temps à l'adversaire pour se défendre. }
21. f6 { LA RUPTURE, TOUT DE SUITE. Le pion f6 attaque g7. Si 21...gxf6, la dame vient en h4 contre le roi ouvert. Le meilleur coup. [%cal Rf6g7][%cal Ge1h4] }
(21. Rf3 { Le coup de la partie : la tour prépare Rh3 ou Rg3. Il gagne encore, mais il perd environ 1 pion d'avantage : les Noirs avaient le temps de jouer 21...f6 et de fermer l'aile roi. [%cal Gf3g3] }
21... Kh8 { Une faute : le roi ne fuit pas, il se met dans le coin. 21...f6 tenait la position. }
22. f6 { La rupture arrive quand même, un coup plus tard. [%cal Rf6g7] }
22... gxf6 { Les Noirs prennent : la colonne g s'ouvre devant leur roi. }
23. Qh4 { La dame attaque le pion f6 et la case h7. Le meilleur coup. [%cal Gh4f6,Gh4h7] }
23... Rg8 { La tour protège la colonne g. }
24. Nxf6 { Le cavalier prend le pion f6 et menace le pion h7 avec mat. Le meilleur coup. }
24... Rg7 { La tour protège la 7e rangée. }
25. Rg3 { La tour attaque la tour g7, qui protège le pion h7. Le meilleur coup. [%cal Gg3g7] }
25... Bxf6 { Le fou prend le cavalier. }
26. Qxf6 { La dame reprend : la tour g7 est clouée sur le roi par la dame, et attaquée deux fois. }
26... Rg8 { La tour recule. }
27. Rd1 { La dernière tour entre en jeu, contre le pion d6. }
27... d5 { Les Noirs n'ont plus rien à jouer. }
28. Rxg7 { La tour prend la tour g7. Les Noirs ont abandonné. [%cal Gg3g7] })
21... h6 { Les Noirs donnent de l'air à leur roi. 21...Kh8 était un peu plus tenace (environ 0,4 pion), mais la position est déjà perdue : environ +4,5. }
22. Rf3 { La tour monte vers g3 : elle vise la colonne g. Le meilleur coup. [%cal Gf3g3] }
22... Bxf6 { Le fou prend le pion f6. 22...Re6 résistait un peu mieux, l'écart est faible. }
23. Nxf6+ { Le cavalier reprend avec échec. Le meilleur coup. }
23... gxf6 { Le pion reprend : la colonne g est ouverte devant le roi noir. 23...Kh8 était légèrement plus tenace. }
24. Qh4 { La dame vise les pions f6 et h6. Le meilleur coup. [%cal Gh4f6,Gh4h6] }
24... f5 { Le pion attaqué s'avance, hors de portée de la dame. Presque aussi bon que 24...Re6. }
25. Qxh6 { La dame prend le pion h6, devant le roi noir. Le meilleur coup. }
25... Re6 { La tour défend la 6e rangée. Le meilleur coup. [%cal Ge6g6] }
26. Rg3+ { La tour donne échec sur la colonne g. Le meilleur coup. [%cal Gg3g8] }
26... Rg6 { La tour s'interpose. Le meilleur coup. }
27. Rxg6+ { La tour échange la tour g6. Le meilleur coup. }
27... fxg6 { Le pion reprend. Le meilleur coup. }
28. Qxg6+ { La dame prend un deuxième pion avec échec. Les Blancs ont un pion de plus et le roi noir est très exposé.

Bilan : la rupture f6 a ouvert la colonne g devant le roi noir. Toutes les pièces blanches ont pu entrer. }
28... Kh8 { Le roi va dans le coin. Le meilleur coup. Les Blancs ont un avantage décisif. }`,
    ),
    chapter(
      "Evans – Opsahl (1950) : le levier b4-b5 de l'attaque de minorité",
      "r1bqrnk1/pp2bppp/2p2n2/3p2B1/3P4/2NBPN2/PPQ2PPP/R4RK1 w - - 4 11",
      `{ Larry Evans – Opsahl, Dubrovnik 1950. Un Gambit dame, variante d'échange : les Blancs ont deux pions à l'aile dame (a2 et b2), les Noirs trois (a7, b7 et c6).

C'est l'ATTAQUE DE MINORITÉ : le camp qui a MOINS de pions sur une aile les avance pour créer une faiblesse. Le levier est b4-b5 contre le pion c6.

Après b5xc6, les Noirs gardent un pion isolé en c6 (ou en d5 s'ils reprennent avec le pion b). C'est une cible fixe pour les tours blanches.

PRO TIP : un levier sur une aile se prépare avec un pion de soutien (a4 pour b5). Ainsi, si l'adversaire prend, tu reprends avec un pion et la colonne s'ouvre pour toi. }
11. Rab1 { La tour se met derrière le pion b. Elle sera prête quand la colonne b s'ouvrira. 11.h3 était un peu plus précis, l'écart est faible (environ 0,2 pion). [%cal Gb1b5] }
11... Ne4 { Le cavalier propose l'échange du fou g5. Presque aussi bon que 11...a5. }
12. Bxe7 { Le fou échange le fou e7. Presque aussi bon que 12.Bf4. }
12... Qxe7 { La dame reprend : elle surveille la colonne e. Le meilleur coup. }
13. b4 { Le pion b avance vers b5. Presque aussi bon que 13.Rfc1. [%cal Gb4b5] }
13... a6 { Le pion a contrôle la case b5 : les Noirs veulent freiner le levier. Presque aussi bon que 13...Nxc3. [%csl Gb5] }
14. a4 { Le pion a vient soutenir b5. Maintenant, b4-b5 est imparable. Presque aussi bon que 14.Rfc1. [%cal Ga4b5] }
14... Nxc3 { Le cavalier échange le cavalier c3. Le meilleur coup. }
15. Qxc3 { La dame reprend et vise c6. Le meilleur coup. [%cal Gc3c6] }
15... Bg4 { Le fou se développe et attaque le cavalier f3. Le meilleur coup. [%cal Gg4f3] }
16. Nd2 { Le cavalier évite l'échange. 16.Ne5 était un peu plus précis, l'écart est faible (environ 0,2 pion). }
16... Qg5 { La dame part à l'aile roi : les Noirs cherchent un contre-jeu là-bas. Le meilleur coup. [%cal Gg5g2] }
17. Rfc1 { La deuxième tour vient sur la colonne c, contre le pion c6. Le meilleur coup. [%cal Gc1c6] }
17... Re6 { La tour veut monter en g6 ou en h6, vers le roi blanc. 17...h5 était un peu plus précis, l'écart est faible. [%cal Ge6g6,Ge6h6] }
18. b5 { LE LEVIER. Le pion b5 touche les pions a6 et c6. Les colonnes de l'aile dame vont s'ouvrir. Presque aussi bon que 18.Nf1. [%cal Rb5c6,Rb5a6] }
18... axb5 { Le pion a6 prend en b5. Le meilleur coup. }
19. axb5 { Le pion reprend : la colonne a est ouverte, et le pion b5 touche toujours c6. Le meilleur coup. [%cal Rb5c6] }
19... Bh3 { Le fou attaque le pion g2 avec la dame : les Noirs menacent ...Qxg2 mat. Le meilleur coup. [%cal Rh3g2,Rg5g2] }
20. g3 { Le pion ferme la colonne g et pare le mat. Le seul coup : tout le reste perdait. [%csl Gg3] }
20... Rae8 { La tour rejoint l'autre tour sur la colonne e. 20...h5 était un peu plus précis (environ 0,3 pion). }
21. bxc6 { Le levier est exécuté : le pion b prend en c6. Presque aussi bon que 21.Bf1. }
21... bxc6 { Le pion reprend. Le pion c6 est maintenant isolé sur une colonne semi-ouverte. Le meilleur coup. [%csl Rc6] }
22. Bf1 { Le fou propose l'échange du fou h3, la pièce la plus dangereuse des Noirs. Le meilleur coup. [%cal Gf1h3] }
22... Bxf1 { Les Noirs échangent. Presque aussi bon que 22...Qg4. }
23. Nxf1 { Le cavalier reprend et défend le roi depuis f1. Les Blancs sont un peu mieux.

Bilan : le levier b4-b5 a laissé aux Noirs un pion c6 faible. Les tours blanches vont l'attaquer par les colonnes b et c, et Evans a gagné la longue finale. [%csl Rc6][%cal Gb1b6,Gc1c6] }`,
    ),
    chapter(
      "La Benoni : la rupture e5 et le sacrifice de pion f5",
      START,
      `{ Dans la Benoni moderne, les Blancs ont une majorité de pions au centre (d5, e4 et f4). Les Noirs ont une majorité à l'aile dame.

Le levier blanc, c'est e4-e5 : ce pion touche le pion d6 et ouvre la diagonale du fou d3 vers le roi noir.

Parfois, il faut aller plus loin et SACRIFIER un pion pour ouvrir une ligne. Ici, f4-f5 est offert : si les Noirs le prennent, la colonne f s'ouvre et le cavalier blanc arrive en f5.

PRO TIP : un sacrifice de pion de rupture se juge sur une seule question. Les lignes qui s'ouvrent sont-elles plus utiles à mes pièces qu'aux siennes ? Si oui, le pion est bien investi. }
1. d4 { Le pion dame prend le centre. Le meilleur coup. }
1... Nf6 { Le cavalier se développe. Presque aussi bon que 1...d5. }
2. c4 { Le pion c prend de l'espace. Le meilleur coup. }
2... c5 { La Benoni : le pion c attaque d4 tout de suite. C'est un coup risqué : environ 0,5 pion de moins que 2...e6 selon Stockfish. [%cal Gc5d4] }
3. d5 { Le pion avance et gagne de l'espace. Le meilleur coup. }
3... e6 { Le pion e attaque d5. Presque aussi bon que 3...g6. [%cal Ge6d5] }
4. Nc3 { Le cavalier protège d5. Le meilleur coup. }
4... exd5 { Le pion prend. Presque aussi bon que 4...g6. }
5. cxd5 { Le pion c reprend : la structure de la Benoni est née. Les Blancs ont la majorité au centre. Le meilleur coup. }
5... d6 { Le pion d ferme la case d6 et empêche d5-d6. Le meilleur coup. }
6. e4 { Le pion e rejoint le centre. Le meilleur coup. }
6... g6 { Le fou f8 va sortir en g7. Le meilleur coup. }
7. f4 { L'attaque Taimanov : le pion f soutient la future rupture e5. Le meilleur coup. [%cal Gf4e5] }
7... Bg7 { Le fou occupe la grande diagonale. Le meilleur coup. }
8. Bb5+ { Le fou donne échec pour gêner le développement noir. Le meilleur coup. }
8... Nfd7 { Le cavalier s'interpose. Il ne surveille plus les cases e4 et d5. Le meilleur coup. [%csl Re4] }
9. a4 { Le pion a empêche ...b5 et le jeu noir à l'aile dame. Le meilleur coup. [%csl Gb5] }
9... O-O { Le roi noir se met à l'abri. 9...Na6 était légèrement plus précis, l'écart est minime. }
10. Nf3 { Le cavalier soutient la case e5. Le meilleur coup. [%cal Gf3e5] }
10... Na6 { Le cavalier part vers b4 ou c7. Le meilleur coup. }
11. O-O { Le roi blanc se met à l'abri. Le meilleur coup. }
11... Nc7 { Le cavalier attaque le fou b5. Presque aussi bon que 11...Nb4. [%cal Gc7b5] }
12. Bd3 { Le fou recule sur la diagonale b1-h7, vers le roque noir. Le meilleur coup. [%cal Gd3h7] }
12... Rb8 { La tour prépare ...b5. Le meilleur coup. [%cal Gb8b5] }
13. Qe1 { La dame part vers l'aile roi, par h4 ou g3. Le meilleur coup. [%cal Ge1h4] }
13... a6 { Les Noirs préparent ...b5. Le meilleur coup. }
14. e5 { LA RUPTURE. Le pion e5 touche le pion d6. La diagonale du fou d3 et la case e4 s'ouvrent pour les pièces blanches. Le meilleur coup : environ +1,4. [%cal Re5d6][%cal Gd3h7] }
14... Nb6 { Les Noirs ne prennent pas. Le cavalier attaque le pion d5. Le meilleur coup. [%cal Gb6d5] }
(14... dxe5 { Prendre est naturel, mais ouvre encore plus le jeu pour les Blancs : environ 0,8 pion de moins que 14...Nb6. }
15. fxe5 { Le pion f reprend. La colonne f s'ouvre, et le pion e5 protège la case d6. Le meilleur coup : environ +2,5. [%cal Gf1f7] }
15... b5 { Les Noirs cherchent du jeu à l'aile dame. Le meilleur coup. }
16. Bg5 { Le fou attaque la dame. Le meilleur coup. [%cal Gg5d8] }
16... Qe8 { La dame se met à l'abri. Le meilleur coup. }
17. d6 { Le pion d6 attaque le cavalier c7 et coupe le camp noir en deux. Le meilleur coup. [%cal Rd6c7] }
17... Ne6 { Le cavalier s'échappe. Le meilleur coup. }
18. Be7 { Le fou attaque la tour f8. Les Blancs gagnent de la matière. [%cal Ge7f8] })
15. f5 { LE SACRIFICE DE PION. Le pion f5 touche le pion g6. Si les Noirs le prennent, la colonne f s'ouvre devant le roque. Le meilleur coup. [%cal Rf5g6][%cal Gf1f7] }
15... Bxf5 { Les Noirs prennent le pion. Le meilleur coup. }
16. Bxf5 { Le fou échange le fou f5. Le meilleur coup. }
16... gxf5 { Le pion reprend. Le roque noir est ouvert. Le meilleur coup. }
17. Nh4 { Le cavalier attaque le pion f5. Le meilleur coup. [%cal Gh4f5] }
17... Bxe5 { Le fou prend un deuxième pion. Le meilleur coup. }
18. Nxf5 { Le cavalier reprend le pion f5. Il vise les cases h6 et e7, tout près du roi noir. Les Blancs ont un pion de moins, mais une forte attaque.

Bilan : les ruptures e5 puis f5 ont ouvert la colonne f et la diagonale vers le roi noir. [%cal Gf5h6,Gf1f7] }`,
    ),
    chapter(
      "Pillsbury – Gunsberg (1895) : cinq percées en finale",
      "1n6/4k2p/p3ppp1/1pPp4/3P1PP1/3NP3/P3K2P/8 w - - 1 27",
      `{ Harry Pillsbury – Isidor Gunsberg, Hastings 1895. Une finale cavalier contre cavalier. Elle semble calme, mais les Noirs viennent de commettre une faute : 26...Nb8? (26...a5 gardait l'égalité). Les Blancs sont maintenant environ +2.

Pillsbury va jouer une série de coups de rupture. Chaque poussée, au contact d'un pion noir ou sacrifiée, ouvre une route vers la promotion.

En finale, le but d'une rupture n'est plus d'ouvrir des lignes pour les pièces. Il est de CRÉER UN PION PASSÉ.

PRO TIP : en finale, compte les pions de chaque côté. Là où tu as la majorité, une rupture bien placée crée un pion passé. }
27. f5 { PREMIÈRE RUPTURE. Le pion f5 touche e6 et g6. Il menace 28.fxe6 Kxe6 29.Nf4+, qui gagne le pion d5. Le meilleur coup. [%cal Rf5e6,Rf5g6] }
27... g5 { Les Noirs ferment l'aile roi. Presque aussi bon que 27...Nc6 ; toutes les défenses perdent déjà. }
28. Nb4 { Le cavalier attaque a6 et d5, et prépare c5-c6. Le meilleur coup. [%cal Gb4a6,Gb4d5] }
28... a5 { Le pion attaque le cavalier. Une faute, mais la position était déjà perdue (28...Kd7 résistait un peu mieux). [%cal Ra5b4] }
29. c6 { DEUXIÈME PERCÉE. Le pion c avance vers la promotion, quitte à se sacrifier. Il menace c7, qui attaquera le cavalier b8. Si 29...axb4, alors 30.c7 et le pion va à dame. Le meilleur coup. [%cal Gc6c7,Gc7c8] }
29... Kd6 { Le roi attaque le pion c6, mais ne peut pas le prendre : le cavalier b4 protège cette case. [%cal Gb4c6] }
30. fxe6 { TROISIÈME RUPTURE. Le pion f prend en e6 : les Blancs ont maintenant un pion passé en e6. Le meilleur coup. [%csl Ge6] }
30... Nxc6 { Le cavalier prend le pion c6. Le meilleur coup. }
31. Nxc6 { Le cavalier échange le cavalier. Le meilleur coup. }
31... Kxc6 { Le roi reprend. Il est loin du pion e6. 31...Kxe6 était un peu plus tenace, mais tout perd.

Bilan : deux ruptures ont créé un pion passé en e6. [%csl Ge6]

Fais le point au 32e coup. Les Blancs ont un pion passé en e6. Les Noirs ont deux pions contre un à l'aile dame (a5 et b5 contre a2), et le pion b est passé. Mais le roi blanc est tout proche.

Pillsbury joue une QUATRIÈME rupture : e3-e4, contre le pion d5. Le but : créer un deuxième pion passé, en d5, à côté de e6. Deux pions passés liés sont presque imparables.

PRO TIP : deux pions passés liés sur la 6e rangée valent souvent une tour. Une rupture qui en crée un deuxième, à côté du premier, est presque toujours gagnante. }
32. e4 { QUATRIÈME RUPTURE. Le pion e4 touche d5. Si les Noirs prennent, le pion d4 avance avec échec. Le meilleur coup. [%cal Re4d5] }
32... dxe4 { Les Noirs prennent. Le meilleur coup. }
33. d5+ { CINQUIÈME RUPTURE. Le pion d5 donne échec et rejoint le pion e6. Les deux pions sont liés. Le meilleur coup. [%csl Gd5,Ge6] }
33... Kd6 { Le roi bloque les pions. Si 33...Kxd5, alors 34.e7 et le pion va à dame. }
34. Ke3 { Le roi va prendre le pion e4. Le meilleur coup. [%cal Ge3e4] }
34... b4 { Les Noirs poussent leurs pions de l'aile dame. 34...Ke7 tenait un peu plus longtemps. }
35. Kxe4 { Le roi prend le pion e4. Il est au centre, prêt à freiner les pions noirs. Le meilleur coup. }
35... a4 { Le pion a avance. Le meilleur coup. }
36. Kd4 { Le roi vient vers les pions noirs. Le meilleur coup. [%cal Gd4c4] }
36... h5 { Les Noirs cherchent du jeu à l'aile roi. Une faute dans une position perdue. }
37. gxh5 { Le pion prend : les Blancs ont un nouveau pion passé, en h5. Le meilleur coup. [%csl Gh5] }
37... a3 { Le pion a avance. }
38. Kc4 { Le roi vient arrêter les pions noirs. Le meilleur coup. [%cal Gc4b3] }
38... f5 { Les Noirs poussent leur pion f. }
39. h6 { Le pion h avance. Le roi noir ne peut pas surveiller à la fois les pions d5, e6 et h6. Le meilleur coup. }
39... f4 { Le pion f avance. }
40. h7 { Le pion h va à dame au coup suivant. Les Noirs ont abandonné.

Bilan : cinq coups de rupture, de f5 à d5, ont transformé une finale calme en une victoire. [%cal Gh7h8] }`,
    ),
    chapter(
      "Tarrasch – Pillsbury (1898) : la rupture f4-f5 ouvre la colonne f",
      "r2q1rk1/ppp5/3pppp1/4p3/4P3/2PP4/P1P2PPP/R2Q1RK1 w - - 0 14",
      `{ Siegbert Tarrasch – Harry Pillsbury, Vienne 1898, partie de départage du 29 juillet. Il ne reste que les dames et les tours.

Regarde les pions. Les Noirs ont deux pions doublés en e6 et e5, et leur roi s'abrite derrière f6 et g6. La colonne h est déjà ouverte de leur côté. Les Blancs ont un pion f2 qui n'a rien devant lui.

Le plan blanc est un levier en deux temps : f2-f4 au contact de e5, puis f4-f5 au contact de e6 et g6. Le but est d'ouvrir la colonne f, où la tour f1 attend déjà, face au pion f6.

PRO TIP : avant de pousser un pion de rupture, regarde quelle tour est déjà derrière lui. Une rupture qui ouvre une colonne pour une tour déjà placée gagne un temps précieux. }
14. f4 { PREMIER CONTACT. Le pion f4 touche le pion e5. Si les Noirs prennent en f4, la tour f1 récupère le pion et la colonne s'ouvre. Stockfish préfère 14.Qg4, qui vise d'abord le pion e6, l'écart est faible (environ 0,3 pion). [%cal Rf4e5][%cal Gf1f6] }
14... Kg7 { Le roi vient protéger les pions f6 et g6. 14...exf4 ou 14...f5 étaient un peu plus précis (environ 0,3 pion). [%csl Gf6,Gg6] }
15. f5 { LA RUPTURE. Le pion f5 touche e6 et g6 à la fois. Les Blancs menacent fxe6 ou fxg6, et dans les deux cas la colonne f s'ouvre. Le meilleur coup. [%cal Rf5e6,Rf5g6] }
15... exf5 { Les Noirs prennent : laisser faire coûtait le pion e6. Le meilleur coup. }
16. exf5 { Le pion reprend. Le nouveau pion f5 touche toujours g6. Le meilleur coup. [%cal Rf5g6] }
16... g5 { LA BONNE DÉFENSE. Le pion g ne prend pas en f5 : il passe à côté. Le pion f5 ne touche plus aucun pion noir, et la colonne f reste bouchée par f5 et f6. Le meilleur coup. [%csl Gf5,Gf6] }
(16... Rh8 { LA FAUTE DE LA PARTIE. La tour quitte f8 pour la colonne h ouverte. Mais elle laisse le pion f5 prendre en g6, et la colonne f va s'ouvrir. Environ 0,8 pion de moins que 16...g5. [%cal Gf8h8] }
17. fxg6 { Le pion prend en g6. La colonne f est ouverte : la tour f1 attaque le pion f6, que seuls le roi et la dame défendent. Le meilleur coup. [%cal Gf1f6] }
17... Rh6 { La tour attaque le pion g6, qui n'est pas protégé. Presque aussi bon que 17...Qe7. [%cal Gh6g6] }
18. Rb1 { La tour a1 entre en jeu par la colonne b, ouverte depuis la prise bxc3. Elle attaque le pion b7. Presque aussi bon que 18.Rf5. [%cal Gb1b7] }
18... b6 { Le pion b avance pour ne plus être attaqué. Le meilleur coup. }
19. Rb4 { La tour monte en 4e rangée : de là, elle peut glisser vers l'aile roi. 19.Qf3 était un peu plus précis, l'écart est faible. [%cal Gb4g4] }
19... Qd7 { LA DEUXIÈME FAUTE. La dame quitte d8. Elle ne protège plus le pion f6, ni la tour a8. Environ 1,2 pion de moins que 19...Qe7. [%csl Rf6,Ra8] }
20. Rxf6 { LE SACRIFICE. La tour prend le pion f6. Si le roi la prend, la dame donne échec en f3 et prend la tour a8. C'est la colonne f, ouverte par la rupture, qui rend ce coup possible. Le meilleur coup. [%cal Gf1f6] }
20... Kxf6 { Le roi prend la tour. Refuser ne valait pas mieux : 20...Kg8 perdait encore plus. }
21. Qf3+ { LA FOURCHETTE. La dame donne échec au roi f6 et, sur la grande diagonale vidée par les échanges, elle attaque la tour a8. Le meilleur coup. [%cal Rf3f6,Rf3a8] }
21... Kg7 { Le roi revient en g7. Le meilleur coup. }
22. Qxa8 { La dame prend la tour. Les Blancs ont maintenant deux pions de plus (environ +2,3), et Tarrasch a gagné la partie.

Bilan : deux poussées de pion ont ouvert la colonne f. Une seule faute de défense a suffi pour que la tour blanche y entre. [%csl Gg6] })
17. Rb1 { La tour entre par la colonne b, contre le pion b7. Le meilleur coup. [%cal Gb1b7] }
17... b6 { Le pion b avance, hors de portée de la tour. Le meilleur coup. }
18. h4 { UN NOUVEAU LEVIER. La colonne f est fermée, alors les Blancs cherchent une autre ligne : le pion h4 touche le pion g5. Presque aussi bon que 18.Rb4. [%cal Rh4g5] }
18... gxh4 { Le pion g prend en h4 : les Noirs ont un pion de plus pour l'instant. Le meilleur coup. }
19. Kf2 { Le roi libère la première rangée : la tour pourra venir en h1 pour reprendre le pion h4. Presque aussi bon que 19.Rb4. La position est à peu près égale (environ +0,1).

Bilan : la rupture f4-f5 était juste. Elle ne gagne que si l'adversaire laisse la colonne f s'ouvrir. Contre la bonne défense ...g5, il faut trouver un deuxième levier, ici h2-h4. [%cal Gf1h1] }`,
    ),
    chapter(
      "Marshall – Burn (1907) : la rupture ...c5, puis la rupture e4 trop pressée",
      "r2q1rk1/pbpnbppp/1p3n2/3p2B1/3P4/2NBPN2/PP3PPP/R2Q1RK1 w - - 0 10",
      `{ Frank Marshall – Amos Burn, Ostende 1907. Un Gambit dame refusé : après l'échange en d5, les Noirs ont un pion d5, les Blancs un pion d4.

Les Noirs ont un levier tout prêt : ...c7-c5, au contact de d4. Burn va le jouer, puis pousser ...c4. Ce coup ferme le centre, mais il donne aux Noirs trois pions contre deux à l'aile dame. Cette majorité pourra avancer.

Marshall répond par la rupture centrale e3-e4, contre d5. L'idée est bonne, mais le moment est mauvais : ce chapitre montre ce qui arrive quand on rompt avant que ses pièces soient prêtes.

PRO TIP : une rupture ouvre des lignes pour LES DEUX camps. Avant de la jouer, compte qui profitera le plus des colonnes et des diagonales qui vont s'ouvrir. }
10. Rc1 { La tour se place sur la colonne c, où un futur pion c5 viendra. Presque aussi bon que 10.Qc2. [%cal Gc1c7] }
10... c5 { LA RUPTURE. Le pion c5 touche le pion d4. Les Noirs prennent leur part du centre et ouvrent la colonne c. Presque aussi bon que 10...Ne4. [%cal Rc5d4] }
11. Qe2 { La dame se développe. 11.Bf5 ou 11.Qc2 étaient un peu plus précis, l'écart est faible (environ 0,25 pion). }
11... Ne4 { Le cavalier s'installe en e4. Il attaque le cavalier c3, le fou g5 et le pion f2. Le meilleur coup. [%cal Ge4c3,Ge4g5] }
12. Bf4 { Le fou évite l'échange. 12.Bxe7 était un peu plus précis, l'écart est faible (environ 0,2 pion). }
12... Nxc3 { Le cavalier e4 s'échange contre le cavalier c3. Le meilleur coup. }
13. Rxc3 { La tour reprend et fait face au pion c5. 13.bxc3 était plus solide (environ 0,45 pion) : un pion en c3 aurait renforcé le pion d4. [%cal Gc3c5] }
13... c4 { LA POUSSÉE. Le pion avance et chasse le fou d3. Le centre se ferme, mais les Noirs ont maintenant trois pions contre deux à l'aile dame (a7, b6 et c4 contre a2 et b2). Le plan : ...b5-b4. Le meilleur coup. [%cal Gc4d3][%cal Gb6b5,Gb5b4] }
14. Bf5 { Le fou se place en f5, face au roque noir. Presque aussi bon que 14.Bb1. [%cal Gf5h7] }
14... Nf6 { Le cavalier revient en f6 pour défendre le roi. 14...b5 était un peu plus précis, l'écart est faible. }
15. Ne5 { Le cavalier s'installe en e5, au centre. Il vise les pions c4 et f7. Le meilleur coup. [%cal Ge5c4,Ge5f7] }
15... b5 { La majorité noire avance : b5 prépare ...b4. Le meilleur coup. [%cal Gb5b4] }
16. Rcc1 { La tour recule. Elle garde la colonne c et la première rangée. Le meilleur coup. }
(16. e4 { LA FAUTE DE LA PARTIE. Le pion e4 touche d5 : c'est la rupture centrale. Mais elle arrive trop tôt. Le fou b7 et les pièces noires vont profiter du centre ouvert. Environ 0,8 pion de moins que 16.Rcc1. [%cal Re4d5] }
16... g6 { Le pion chasse le fou f5. Le meilleur coup. [%cal Gg6f5] }
17. Bh6 { Le fou attaque la tour f8. 17.Rg3 était plus précis (environ 0,5 pion). [%cal Gh6f8] }
17... Re8 { La tour s'écarte. Presque aussi bon que 17...dxe4. }
18. exd5 { Les Blancs prennent : le centre est ouvert. 18.Rg3 était meilleur (environ 0,8 pion). }
18... Qxd5 { La dame reprend. Avec le fou b7, elle forme une batterie contre g2, et elle attaque aussi le pion d4 et le cavalier e5. Le meilleur coup. [%cal Gd5g2,Gd5d4,Gd5e5] }
19. Rg3 { La tour défend le pion g2 et attaque le pion g6. Le meilleur coup. [%cal Gg3g6] }
19... Bd6 { Le fou attaque le cavalier e5. Presque aussi bon que 19...Bc5. [%cal Gd6e5] }
20. Qc2 { Une nouvelle faute : la dame protège le fou f5, mais 20.Rd1 tenait mieux (environ 1,2 pion de plus). }
20... Bxe5 { Le fou prend le cavalier e5. Presque aussi bon que 20...Nh5. }
21. dxe5 { Le pion reprend et attaque le cavalier f6. Le meilleur coup. [%cal Ge5f6] }
21... Nh5 { Le cavalier s'échappe en attaquant la tour g3. Le meilleur coup. [%cal Gh5g3] }
22. Rg4 { La tour reste sur la colonne g. 22.Rd1 tenait beaucoup mieux (environ 1,8 pion). }
22... Rxe5 { La tour prend le pion e5 et attaque le fou f5. Les Noirs ont un pion de plus et gagnent (environ -3,9). Burn a remporté la partie.

Bilan : la rupture e4, jouée avant que les pièces blanches soient prêtes, a surtout ouvert des lignes pour les pièces noires. [%cal Ge5f5] })
16... a5 { Le pion a vient soutenir la future poussée ...b4. Le meilleur coup. [%cal Ga5b4] }
17. b3 { LE LEVIER BLANC. Le pion b3 touche le pion c4. Les Blancs veulent ouvrir une ligne contre la chaîne noire. Presque aussi bon que 17.h4. [%cal Rb3c4] }
17... a4 { LE CONTRE-LEVIER. Le pion a4 touche b3. Si les Blancs prennent en c4, ...bxc4 garde le pion c ; s'ils laissent faire, ...axb3 ouvre la colonne a. Le meilleur coup. [%cal Ra4b3] }
18. h3 { Le pion donne de l'air au roi blanc. Presque aussi bon que 18.Rfd1. Les Noirs sont un peu mieux (environ -0,4).

Bilan : la rupture ...c5 puis la poussée ...c4 ont donné aux Noirs une majorité qui avance. Chaque camp a ses leviers à l'aile dame, et ils se jouent pion contre pion. [%csl Ga4,Gb5,Gc4] }`,
    ),
    chapter(
      "Rubinstein – Spielmann (1912) : le levier ...f5-f4 contre le roque",
      "5rk1/pprb2pp/3ppq2/5p2/2P1n3/PQ3NP1/1P2PPBP/R2R2K1 w - - 2 16",
      `{ Akiba Rubinstein – Rudolf Spielmann, Saint-Sébastien 1912. Une Défense hollandaise : les Noirs ont un pion en f5 dès l'ouverture.

Ce pion est un levier tout prêt. Poussé en f4, il vient au contact du pion g3. S'il prend en g3, la colonne f s'ouvre droit sur le pion f2, que seul le roi blanc protège. Derrière lui attendent déjà la dame f6 et la tour f8.

Pour l'instant, le cavalier f3 bouche la colonne f. Tout le chapitre tourne autour de cette question : la colonne f va-t-elle s'ouvrir ?

PRO TIP : un levier contre le roque est le plus fort quand tes pièces lourdes sont DÉJÀ derrière le pion. Place la dame et la tour sur la colonne avant de pousser. }
16. Ne1 { Le cavalier recule pour aller en d3. Mais il quitte la case f3, d'où il bouchait la colonne f. 16.Nd4 était plus précis (environ 0,4 pion). [%cal Ge1d3] }
16... Nc5 { Le cavalier attaque la dame b3. Le meilleur coup. [%cal Gc5b3] }
17. Qb4 { La dame se déplace et attaque le cavalier c5, protégé par le pion d6. Presque aussi bon que 17.Qe3. }
17... f4 { LA RUPTURE. Le pion f4 touche g3. Si les Noirs prennent en g3, la colonne f s'ouvre et f2 devient la cible de la dame et de la tour. Le meilleur coup. [%cal Rf4g3][%cal Gf6f2] }
18. Nf3 { LA BONNE DÉFENSE. Le cavalier revient en f3 et bouche à nouveau la colonne f. Le meilleur coup. Les Noirs sont un peu mieux (environ -0,4). [%csl Gf3] }
(18. Nd3 { LA FAUTE DE LA PARTIE. Le cavalier attaque le cavalier c5 et le pion f4, mais la colonne f reste ouverte. Environ 0,8 pion de moins que 18.Nf3. [%cal Gd3c5,Gd3f4] }
18... fxg3 { Le pion prend en g3. Il attaque f2 et h2. Le meilleur coup. [%cal Rg3f2,Rg3h2] }
19. fxg3 { Le pion f reprend : la colonne f est ouverte jusqu'à la première rangée. C'est la seule défense correcte : les autres coups perdaient bien plus. [%cal Gf6f1] }
19... Nxd3 { Le cavalier échange le cavalier d3. 19...Bc6, qui vise d'abord le fou g2, était plus fort (environ 0,7 pion). }
20. Rxd3 { La tour reprend. 20.Qxd6 était un peu plus précis, l'écart est faible. }
20... Qf2+ { La dame entre en f2 par la colonne ouverte, avec échec. Le meilleur coup. [%cal Gf2g1] }
21. Kh1 { Le roi n'a qu'une case : h1. }
21... Bc6 { Le fou vise le fou g2 sur la grande diagonale. 21...Qxe2, qui prenait un pion, était plus fort (environ 0,6 pion). [%cal Gc6g2] }
22. e4 { Le pion ferme la grande diagonale. Le meilleur coup : 22.Bxc6 perdait (environ -3,8). }
22... Rcf7 { La deuxième tour rejoint la colonne f : dame et tours sont alignées contre la première rangée. Le meilleur coup. [%cal Gf7f1] }
23. Re1 { La tour protège la première rangée et le pion e4. Le meilleur coup. }
23... a5 { Le pion attaque la dame b4. Presque aussi bon que 23...h5. [%cal Ga5b4] }
24. Qc3 { La dame recule. Elle attaque le pion a5 et vise g7 sur la grande diagonale. Le meilleur coup. [%cal Gc3a5,Gc3g7] }
24... Qc5 { La dame recule et vise le pion c4. Presque aussi bon que 24...a4. [%cal Gc5c4] }
25. b4 { Le pion attaque la dame. Le meilleur coup. [%cal Rb4c5] }
25... Bxe4 { LE COUP DE SPIELMANN. Le fou prend e4 et laisse la dame en prise. Si 26.bxc5, alors 26...Rf1+ 27.Rxf1 Rxf1 mat : le fou g2 est cloué par le fou e4 et ne peut pas reprendre en f1. Selon Stockfish, la position reste égale. [%cal Ge4g2,Gf7f1] }
26. Rxe4 { LA FAUTE DÉCISIVE. La tour prend le fou, mais elle quitte la première rangée. 26.Bxe4 gardait l'égalité. [%cal Re1e4] }
26... Rf1+ { La tour entre en f1 avec échec. Le meilleur coup. }
27. Bxf1 { Forcé : le fou prend la tour. }
27... Rxf1+ { La deuxième tour reprend avec échec. Le meilleur coup. }
28. Kg2 { Le seul coup légal. Le roi attaque la tour f1. }
28... Qf2+ { La dame protège la tour et chasse le roi. Le meilleur coup. }
29. Kh3 { Le seul coup légal : le roi monte en h3, encore plus exposé. }
29... Rh1 { La tour attaque le pion h2, devant le roi blanc. Les Noirs ont une attaque gagnante (plus de 5 pions selon Stockfish), et Spielmann a gagné la partie.

Bilan : la rupture ...f4 a ouvert la colonne f. Une seule faute blanche, et les pièces lourdes noires sont entrées sur la première rangée. [%cal Gh1h2] })
18... e5 { Le pion soutient f4. Si les Blancs prennent en f4, les Noirs reprennent avec le pion e et gardent le contact. Le meilleur coup. [%cal Ge5f4] }
19. Qc3 { La dame attaque le pion e5. Le meilleur coup. [%cal Gc3e5] }
19... Ba4 { Le fou attaque la tour d1. Le meilleur coup. [%cal Ga4d1] }
20. Rf1 { La tour quitte d1 et vient défendre f2. Le meilleur coup. Les Noirs gardent une légère initiative (environ -0,25).

Bilan : contre un levier qui menace d'ouvrir une colonne, la meilleure défense est souvent de garder une pièce DANS la colonne. Ici, c'est le cavalier f3. [%cal Gf1f2] }`,
    ),
    chapter(
      "Bernstein – Capablanca (1914) : la rupture ...c5 et le pion passé",
      "r2q1rk1/p1pnbppp/Qp3n2/3p2B1/3P4/2N1PN2/PP3PPP/2R1K2R b K - 0 11",
      `{ Ossip Bernstein – José Raúl Capablanca, Moscou 1914. Un Gambit dame refusé : après 8.cxd5 exd5 9.Qa4 Bb7 10.Ba6 Bxa6 11.Qxa6, les fous de cases blanches ont disparu.

Le levier noir, c'est ...c7-c5 contre le pion d4. Il va créer une structure célèbre : les PIONS PENDANTS c5 et d5, deux pions côte à côte sans voisin.

Suis le pion c dans ce chapitre. Il rompt en c5, avance en c4, puis les Blancs l'attaquent avec leur propre levier b3. Après les échanges, il devient un pion passé en c3.

PRO TIP : quand l'adversaire attaque ta chaîne avec un levier, regarde ce qui reste après les échanges. Un pion qui n'a plus aucun pion adverse devant lui, ni sur sa colonne ni sur les colonnes voisines, est PASSÉ : c'est souvent lui qui décide. }
11... c5 { LA RUPTURE. Le pion c5 touche le pion d4. Les Noirs libèrent leur jeu et prennent la colonne c. Presque aussi bon que 11...c6. [%cal Rc5d4] }
12. Bxf6 { Le fou échange le cavalier f6, un défenseur du pion d5. 12.O-O était un peu plus précis (environ 0,35 pion). }
12... Nxf6 { Le cavalier d7 reprend. Le meilleur coup. }
13. dxc5 { Le pion prend en c5. Les Noirs vont avoir deux pions côte à côte en c5 et d5 : les pions pendants. Presque aussi bon que 13.b3. }
13... bxc5 { Le pion b reprend. Les pions c5 et d5 tiennent le centre. Ils sont mobiles, mais aucun pion noir ne peut plus les protéger par derrière. Le meilleur coup. [%csl Gc5,Gd5] }
14. O-O { Les Blancs roquent enfin : leur roi était resté en e1. Le meilleur coup. }
14... Qb6 { La dame propose l'échange des dames et vise le pion b2. 14...Rb8 était un peu plus précis (environ 0,35 pion). [%cal Gb6a6,Gb6b2] }
15. Qe2 { La dame évite l'échange et revient près du roi. 15.Qxb6 était un peu plus précis (environ 0,35 pion). }
15... c4 { Le pion c avance. Il gagne de l'espace et vise b3 et d3. En échange, la case d4 n'est plus contrôlée par aucun pion noir. Presque aussi bon que 15...Rfd8. [%csl Gc4][%csl Rd4] }
16. Rfd1 { La tour vient en face du pion d5. Le meilleur coup. [%cal Gd1d5] }
16... Rfd8 { La tour défend le pion d5. Le meilleur coup. }
17. Nd4 { Le cavalier s'installe en d4, juste devant le pion d5. Aucun pion noir ne peut l'en chasser. Presque aussi bon que 17.e4. [%csl Gd4] }
17... Bb4 { Le fou attaque le cavalier c3. Le meilleur coup. [%cal Gb4c3] }
18. b3 { LE LEVIER BLANC. Le pion b3 touche le pion c4. Les Blancs veulent dissoudre la pointe de la structure noire. Presque aussi bon que 18.Qc2. [%cal Rb3c4] }
18... Rac8 { La tour a8 vient soutenir le pion c4 par la colonne c. Le meilleur coup. [%cal Gc8c4] }
19. bxc4 { Les Blancs prennent. Mais après ...dxc4, il n'y aura plus aucun pion blanc sur les colonnes b, c et d : le pion c4 sera passé. 19.h3, qui gardait la tension, était un peu plus précis (environ 0,2 pion). }
19... dxc4 { Le pion d reprend. Le pion c4 est maintenant PASSÉ. Le meilleur coup. [%csl Gc4][%cal Gc4c1] }
20. Rc2 { La tour se place devant le pion passé. Le meilleur coup. }
20... Bxc3 { Le fou prend le cavalier c3, la pièce qui pouvait bloquer le pion c. Le meilleur coup. }
21. Rxc3 { La tour reprend. C'est la seule bonne reprise : 21.Nf3 ou 21.Nf5 perdaient (environ -4,8). }
21... Nd5 { Le cavalier attaque la tour c3 et le pion e3. Le meilleur coup. [%cal Gd5c3,Gd5e3] }
22. Rc2 { La tour recule. Le meilleur coup. }
22... c3 { Le pion passé avance en c3, dans le camp blanc. Le cavalier d5 le protège. Presque aussi bon que 22...Qa6. [%cal Gd5c3] }
23. Rdc1 { La deuxième tour double sur la colonne c, derrière la première : deux tours contre un pion. Le meilleur coup. [%cal Gc1c2] }
23... Rc5 { La tour se place en c5 : elle pourra doubler sur la colonne c. Presque aussi bon que 23...Qf6. }
24. Nb3 { Le cavalier attaque la tour c5. Presque aussi bon que 24.g3. [%cal Gb3c5] }
24... Rc6 { La tour recule. Presque aussi bon que 24...Rc7. }
25. Nd4 { Le cavalier revient en d4 et attaque la tour c6. Le meilleur coup. [%cal Gd4c6] }
25... Rc7 { La tour recule encore. Presque aussi bon que 25...Rc5. }
26. Nb5 { Le cavalier attaque la tour c7, le pion a7 et le pion c3. Une imprécision : 26.g3 était meilleur (environ 0,45 pion). [%cal Gb5c7,Gb5a7,Gb5c3] }
26... Rc5 { La tour attaque le cavalier b5. Le meilleur coup. [%cal Gc5b5] }
27. Nd4 { Le cavalier revient en d4, d'où il surveille les cases devant le pion. Le meilleur coup. [%csl Gd4] }
(27. Nxc3 { LA FAUTE DE LA PARTIE. Le cavalier prend le pion c3, qui semblait tomber. Mais la première rangée blanche est faible : le roi n'a pas de case de fuite. Environ 4 pions de moins que 27.Nd4. [%csl Rg1] }
27... Nxc3 { Le cavalier d5 reprend en c3. Le pion passé a disparu, mais le piège est tendu. Le meilleur coup. }
28. Rxc3 { La tour reprend. 28.Qe1 était plus tenace, mais tout perd déjà (environ -4,2). }
28... Rxc3 { La tour échange. Le meilleur coup. }
29. Rxc3 { La dernière tour reprend. Les Blancs croient avoir gagné un pion. }
29... Qb2 { LA DÉVIATION. La dame attaque à la fois la tour c3 et la dame e2. Si 30.Qxb2, alors 30...Rd1 mat : la dame e2 doit garder la case d1. Les Blancs ont abandonné (environ -6).

Bilan : le pion passé, né de la rupture ...c5, a attiré les pièces blanches. Il n'en restait plus pour garder la première rangée. [%cal Rb2c3,Rb2e2][%cal Gd8d1] })
27... Qc7 { La dame se place derrière la tour, sur la colonne c. Presque aussi bon que 27...g6. [%cal Gc7c3] }
28. a3 { Le pion prend la case b4 aux pièces noires. Le meilleur coup. Les Noirs sont un peu mieux (environ -0,3).

Bilan : la rupture ...c5, puis le levier blanc b3, ont fait du pion c un pion passé. Bien soutenu en c3, il fixe deux tours blanches. [%csl Gc3] }`,
    ),
    chapter(
      "Tactique finale : la rupture ...fxg3 fait sauter le bouclier",
      "2r2rk1/7p/Q5p1/2p3q1/2NbPp2/P4PPb/1P2PR1P/R1B3K1 b - - 1 1",
      `{ Une position d'exercice, sans noms de joueurs. Les Blancs viennent de jouer Rf1-f2 pour couvrir la case f2. C'était déjà une erreur : 1.Kh1 limitait les dégâts. Mais les Noirs sont mieux de toute façon.

Regarde le roi blanc. Son abri, ce sont les pions g3 et h2. Les pièces noires sont déjà tout près : le fou h3 tient les cases g2 et f1, le fou d4 cloue la tour f2 contre le roi g1, et la dame g5 regarde la colonne g.

Une seule chose manque : une ligne ouverte. Le pion noir f4 est AU CONTACT du pion g3. C'est un levier, comme dans tous les chapitres de ce module. Mais ici, il est joué pour une raison purement géométrique : faire tomber le bouclier du roi.

PRO TIP : quand toutes tes pièces visent le roque adverse, cherche le levier de pion contre son bouclier. Un seul pion qui casse la structure protectrice peut valoir plus qu'une dame. }
1... fxg3 { LA RUPTURE. Le pion f prend le pion g3, le bouclier du roi. Il attaque maintenant f2 et h2. Et il libère la diagonale c1-g5 : la dame noire est en prise au fou c1. C'est voulu. Le meilleur coup, et de loin (entre -7,5 et -9,5 selon les sondes ; 1...Rf6 ne donnait qu'environ -2,3). [%cal Rg3f2,Rg3h2,Gc1g5][%csl Rg1] }
2. Bxg5 { Les Blancs prennent la dame. C'est le coup de l'exercice, mais il perd tout de suite : mat en deux. La défense la plus tenace était 2.Qe6+, voir la variante. La position est déjà décisive, on garde donc la suite de l'exercice. [%cal Gc1g5] }
(2. Qe6+ { La meilleure défense selon Stockfish : un échec pour gagner un temps. La dame blanche se sacrifie pour détourner le fou h3. [%cal Ge6g8] }
2... Kh8 { Le roi se met dans le coin, et la dame noire reste en vie. Le meilleur coup. Prendre la dame par 2...Bxe6 était plus faible (entre 1 et 3 pions de moins selon les sondes) : le fou h3 aurait quitté la diagonale du roi blanc. [%cal Gg8h8] }
3. Qe5+ { La dame blanche offre l'échange avec échec. Elle doit disparaître : sinon, les menaces sur f2 et h2 deviennent mortelles. [%cal Re5h8] }
3... Qxe5 { La dame noire prend. Les Noirs gardent une dame de plus, le pion g3 et les deux fous près du roi blanc : environ -10, et Stockfish trouve même un mat en 17. La rupture gagne même contre la meilleure défense. [%csl Rg3] })
(2. hxg3 { Les Blancs reprennent le pion. Mais la colonne g s'ouvre devant leur roi : mat en quatre. [%cal Gg5g3] }
2... Qxg3+ { La dame entre en g3 avec échec. La tour f2 est clouée par le fou d4 : elle ne peut pas venir en g2. [%cal Rg3g1][%cal Gd4f2] }
3. Kh1 { Le seul coup légal : les cases f1 et g2 sont tenues par le fou h3. [%csl Rf1,Rg2] }
3... Bg2+ { Le fou h3 vient en g2 avec échec. Il se sacrifie pour attirer la tour. [%cal Rg2h1] }
4. Rxg2 { La tour prend : avec le roi en h1, elle n'est plus clouée. Mais elle quitte la case f2. }
4... Qh3+ { La dame donne échec sur la colonne h. La case g1 est interdite au roi : le fou d4 la voit, maintenant que f2 est vide. [%cal Rh3h1,Gd4g1] }
5. Rh2 { La tour s'interpose : c'est la seule parade. }
5... Qf1# { La dame passe en f1 : échec sur la première rangée, et mat. Le fou c1 bloque la tour a1, la tour h2 bloque la case de fuite. [%cal Rf1h1] })
2... Bxf2+ { Le fou d4 prend la tour clouée avec échec. Le fou f2 est protégé par le pion g3 : le roi ne peut pas le prendre. [%cal Rf2g1][%cal Gg3f2] }
3. Kh1 { Le seul coup légal. Les cases f1 et g2 sont tenues par le fou h3, et le fou f2 est protégé. [%csl Rf1,Rg2] }
3... g2# { Le pion de la rupture donne mat. Il attaque h1, il est protégé par le fou h3, et la case g1 est tenue par le fou f2. Le pion qui a cassé le bouclier finit le travail.

Bilan : une seule rupture de pion contre le bouclier du roi, et la position s'effondre. Peu importe la dame : les lignes ouvertes comptent plus que le matériel. [%csl Rh1] }`,
    ),
  ],
};
