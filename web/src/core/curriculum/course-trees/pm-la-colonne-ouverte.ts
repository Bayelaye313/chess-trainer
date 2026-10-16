import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « La colonne ouverte » (positional_mastery, module 9) — refonte « un
 * commentaire par coup » du 2026-10-11.
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, entièrement
 * réécrite ici) : Evans – Opsahl (1950), Capablanca – Tartakower (New York
 * 1924), Tarrasch – Thorold (Manchester 1890), Rubinstein – Schlechter
 * (1912), Alekhine – Yates (Londres 1922), Marshall – Capablanca (match
 * 1909) et Pillsbury – Showalter (1897), tels que présentés dans « Logical
 * Chess: Move by Move » de Chernev ; Alekhine – Nimzowitsch (San Remo 1930).
 *
 * Plan : fondations (comment un échange ou une rupture de pion crée une
 * colonne : chapitres 1 à 5), puis exploitation (occuper la colonne le
 * premier, avant-poste sur la colonne, Canon d'Alekhine, colonne contestée,
 * pénétration en 7e rangée : chapitres 6 à 10).
 *
 * Toutes les parties ont été rejouées avec chess.js et chaque coup sondé avec
 * Stockfish 18 (profondeur 18, 3 candidats par coup). Règle appliquée (comme
 * pour les modules 3, 6 et 7) : quand un coup est nettement moins bon que le
 * choix du moteur (environ 0,6 pion ou plus), la LIGNE PRINCIPALE suit le
 * moteur et la suite de la partie passe en variante, signalée comme fautive ;
 * les écarts plus petits sont seulement mentionnés dans le commentaire. Les
 * évaluations citées sont du point de vue des Blancs. Aucun résultat de
 * partie (1-0, 0-1…) dans les variantes : le parseur s'y arrêterait.
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

export const LA_COLONNE_OUVERTE: CourseTree = {
  chapters: [
    chapter(
      "Fondations : l'échange qui dessine les colonnes",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      `{ Une COLONNE OUVERTE est une colonne sans aucun pion, ni blanc ni noir. Une colonne SEMI-OUVERTE n'a de pion que d'un seul camp : elle est « ouverte » pour l'autre camp, qui y presse le pion adverse. Les tours, qui ne peuvent pas sauter par-dessus les pions, ont besoin de ces colonnes pour agir.

Les colonnes ne s'ouvrent pas toutes seules : elles naissent d'un ÉCHANGE DE PIONS. Ce premier chapitre montre comment une ouverture très classique, la variante d'échange du Gambit dame (Evans – Opsahl, 1950), fixe dès le 7e coup quelles colonnes appartiendront à qui.

PRO TIP : avant de placer une tour, demande-toi quelle colonne va s'ouvrir, et par quel échange de pions. On met souvent la tour sur la colonne AVANT qu'elle ne s'ouvre. }
1. d4 { Le pion dame prend le centre. Stockfish place 1.Nf3, 1.e4 et 1.d4 dans un mouchoir de poche (+0,3). }
1... Nf6 { Le cavalier contrôle e4 et se développe : le coup préféré du moteur. }
2. c4 { Le pion c attaque d5 à l'avance. C'est ce pion qui, échangé plus tard, va libérer la colonne c pour les Blancs. }
2... e6 { Les Noirs préparent ...d5 et ouvrent la diagonale du fou f8. }
3. Nc3 { Le cavalier soutient e4 et met la pression sur d5. 3.Nf3 était à peine plus précis (+0,3 contre +0,2). }
3... d5 { Le Gambit dame refusé : le pion d5 tient le centre face au pion c4. }
4. Bg5 { Le fou cloue le cavalier f6 contre la dame d8. }
4... Nbd7 { Un coup piège : si 5.cxd5 exd5 6.Nxd5?, alors 6...Nxd5! 7.Bxd8 Bb4+ et les Noirs récupèrent la dame avec une pièce de plus. Stockfish préférait de peu 4...Be7. }
5. e3 { Les Blancs ouvrent la diagonale du fou f1 et consolident d4. }
5... Be7 { Le fou se développe et déloue le cavalier f6. }
6. Qc2 { La dame se développe sur la colonne c, encore fermée par le pion c4. Elle vise aussi h7. }
6... O-O { Le roi noir se met à l'abri. 6...c5, qui conteste le centre tout de suite, était un peu plus précis selon Stockfish. }
7. cxd5 { L'ÉCHANGE QUI DÉCIDE DE LA STRUCTURE. Le pion c blanc disparaît : la colonne c devient semi-ouverte pour les Blancs, qui y presseront le pion c noir. [%csl Gc2,Rc7] }
7... exd5 { Les Noirs reprennent du pion e : la colonne e devient semi-ouverte pour EUX, face au pion e3. Chaque camp a désormais « sa » colonne. [%csl Gc7,Ge3] }
8. Nf3 { Le cavalier se développe vers e5. 8.Bd3 était équivalent. }
8... c6 { Le pion soutient d5. Mais il devient la cible des Blancs sur la colonne c semi-ouverte. }
9. Bd3 { Le meilleur coup : le fou vise h7 et se prépare au roque. }
9... Re8 { La tour s'installe sur la colonne e semi-ouverte, face au pion e3 : les Noirs utilisent leur colonne. La suite au chapitre suivant, où les Blancs vont créer une colonne TOTALEMENT ouverte.

PRO TIP : la structure née de cxd5 exd5 donne aux Blancs la colonne c et aux Noirs la colonne e. Celui qui utilise le mieux sa colonne prend l'initiative. [%csl Ge8,Gc2] } *`,
    ),
    chapter(
      "Evans – Opsahl : la rupture b4-b5 ouvre la colonne b",
      "r1bqr1k1/pp1nbppp/2p2n2/3p2B1/3P4/2NBPN2/PPQ2PPP/R3K2R w KQ - 2 10",
      `{ Suite de la partie précédente. Les Blancs ont une colonne c semi-ouverte, mais le pion c6 est solidement défendu. Leur plan : l'ATTAQUE DE MINORITÉ. Deux pions blancs (a et b) avancent contre trois pions noirs (a7, b7, c6). Quand le pion b arrive en b5 et s'échange, une colonne s'ouvre là où il n'y en avait pas.

C'est le moyen le plus courant de créer une colonne ouverte : une RUPTURE DE PION, c'est-à-dire avancer un pion au contact d'un pion adverse pour forcer un échange. [%cal Gb2b5,Ga2a4] }
10. O-O { Le roi se met à l'abri avant de lancer les pions de l'aile dame. Le meilleur coup selon Stockfish. }
10... Nf8 { Le cavalier se replie pour défendre h7 et se diriger vers g6 ou e6. Stockfish préférait de peu 10...g6. }
11. Rab1 { La tour se place derrière le pion b, qui va avancer : quand la colonne b s'ouvrira, la tour y sera déjà. C'est le principe « la tour avant la colonne ». }
11... Ne4 { Le cavalier saute au centre et attaque le cavalier c3 et le fou g5. }
12. Bxe7 { Les Blancs échangent le fou attaqué. }
12... Qxe7 { La dame reprend. }
13. b4 { L'attaque de minorité commence : le pion b marche vers b5. Le meilleur coup selon Stockfish. [%cal Gb4b5] }
13... a6 { Les Noirs freinent le pion : si b5, ils pourront prendre de a6. }
14. a4 { Le pion a soutient la poussée b5. }
14... Nxc3 { Les Noirs échangent le cavalier qui contrôlait b5 et e4. }
15. Qxc3 { La dame reprend sur la colonne c, face au pion c6. }
15... Bg4 { Le fou attaque le cavalier f3 et prépare une attaque à l'aile roi. }
16. Nd2 { Le cavalier s'écarte. Stockfish préférait de peu 16.Ne5. }
16... Qg5 { La dame se porte à l'aile roi et attaque le pion e3. }
17. Rfc1 { La seconde tour se place sur la colonne c : les deux tours sont prêtes pour l'ouverture de l'aile dame. }
17... Re6 { La tour se lève par la 6e rangée pour attaquer le roi (vers g6 ou h6). Stockfish préférait 17...h5. }
18. b5 { LA RUPTURE. Le pion b5 attaque a6 et c6 : un échange de pions est inévitable, et une colonne va s'ouvrir. Le meilleur coup selon Stockfish. [%cal Gb5c6,Gb5a6] }
18... axb5 { Les Noirs prennent. }
19. axb5 { Les Blancs reprennent : la colonne a est maintenant ouverte, et le pion b5 attaque toujours c6. }
19... Bh3 { Les Noirs menacent ...Qxg2 mat, la dame étant soutenue par le fou h3. [%cal Rg5g2] }
20. g3 { Seule défense : 20.Bf1 ou 20.Kf1 perdaient tout de suite. }
20... Rae8 { Les Noirs doublent leurs tours sur la colonne e et abandonnent la colonne a. Stockfish préférait 20...h5, mais l'écart est faible. }
21. bxc6 { L'échange final : le pion b blanc disparaît. }
21... bxc6 { Les Noirs reprennent : il n'y a plus AUCUN pion sur la colonne b. Elle est totalement ouverte, et la tour b1 y est déjà. Le pion c6, lui, reste isolé de ses voisins et devient une cible. [%csl Gb1,Rc6] }
22. Bf1 { Les Blancs proposent l'échange du fou h3, la pièce la plus dangereuse de l'attaque noire. }
22... Bxf1 { Les Noirs échangent. }
23. Nxf1 { Le cavalier reprend et protège h2 et e3. Le roi blanc est en sécurité. }
23... Ng6 { Le cavalier vise h4 et f4. Stockfish préférait 23...Qg4 (+0,2 au lieu de +0,35). }
24. Rb6 { La tour utilise la colonne ouverte : elle avance jusqu'en b6 et attaque le pion c6. [%cal Gb1b6,Gb6c6] }
24... Ne7 { Le cavalier revient défendre c6 (et d5). }
25. Qb4 { La dame rejoint la colonne b et attaque le cavalier e7. Stockfish préférait de peu 25.Qb3. }
25... h5 { Les Noirs donnent de l'air à leur roi. }
26. Rb8 { La tour atteint la 8e rangée et propose l'échange contre la tour e8. }
26... Rxb8 { Les Noirs échangent. }
27. Qxb8+ { La dame reprend avec échec : grâce à la colonne b, elle a pénétré au cœur du camp noir. Les Blancs ont un petit avantage durable (Stockfish : environ +0,4) ; Evans gagnera la partie beaucoup plus tard.

PRO TIP : le but d'une colonne ouverte n'est pas d'y poser une tour, mais de PÉNÉTRER par elle dans le camp adverse : 7e ou 8e rangée, ou une case d'où l'on attaque une faiblesse. [%cal Gb4b8] } *`,
    ),
    chapter(
      "Capablanca – Tartakower : la rupture e3-e4, puis la colonne h",
      "rn3rk1/pbppq1pp/1p2p3/5p2/2PP4/2PBPN2/P3QPPP/R4RK1 w - - 0 12",
      `{ New York 1924. Une position sans colonne ouverte : les pions bloquent tout. Capablanca va en créer DEUX, par deux ruptures de pion successives : d'abord e3-e4, qui ouvre la colonne e ; puis, en finale, h4-h5, qui ouvre la colonne h.

Retiens la méthode : on prépare la rupture en plaçant d'abord une tour derrière le pion qui va avancer (Re1 avant e4). [%cal Ge3e4,Gh2h5] }
12. a4 { Les Blancs gagnent de l'espace à l'aile dame et menacent a5. Stockfish préférait 12.Rfe1, qui prépare déjà e4, mais l'écart est minime. }
12... Bxf3 { Les Noirs échangent leur fou contre le cavalier. Stockfish préférait 12...d6. }
13. Qxf3 { La dame reprend et attaque la tour a8 par la grande diagonale. [%cal Gf3a8] }
13... Nc6 { Le cavalier se développe et coupe la diagonale. }
14. Rfb1 { La tour vise le pion b6. Stockfish préférait la rupture immédiate 14.e4 (+0,3 au lieu de −0,1) : les Blancs perdent un peu de temps. }
14... Rae8 { La tour noire se place sur la colonne e, en prévision de la rupture e3-e4. }
15. Qh3 { La dame attaque f5 et h7. Stockfish préférait 15.g3. }
15... Rf6 { La tour protège la 6e rangée et vise l'aile roi. }
16. f4 { Le pion fixe le pion f5 et empêche ...e5. Stockfish préférait 16.Re1. }
16... Na5 { Le cavalier attaque le pion c4. }
17. Qf3 { La dame revient en f3, sur la grande diagonale. 17.c5 était un peu meilleur. }
17... d6 { Les Noirs contrôlent e5. Stockfish préférait 17...c5 (environ 0,0 au lieu de +0,4). }
18. Re1 { La tour se place DERRIÈRE le pion e3 : quand ce pion avancera, la colonne e s'ouvrira devant elle. }
18... Qd7 { La dame attaque le pion a4. }
19. e4 { LA RUPTURE. Le pion attaque f5 : un échange va ouvrir la colonne e. Le meilleur coup selon Stockfish. [%cal Ge4f5] }
19... fxe4 { Les Noirs prennent. Stockfish préférait 19...g6, sans changer l'évaluation. }
20. Qxe4 { La dame reprend. La colonne e n'a plus de pion blanc : elle est semi-ouverte pour les Blancs, face au pion e6, qu'aucun pion ne peut plus protéger. La dame vise aussi h7. 20.Rxe4 était un peu plus précis. [%csl Re6] }
20... g6 { Les Noirs protègent h7. }
21. g3 { Les Blancs consolident f4. 21.h4, qui prépare l'ouverture de la colonne h, était un peu plus fort. }
21... Kf8 { Le roi se rapproche du centre et de e7. }
22. Kg2 { Le roi protège f3 et h3. Stockfish préférait 22.Qe3 (+0,4 au lieu de +0,1). }
22... Rf7 { La tour protège la 7e rangée. 22...e5 égalisait presque (Stockfish). }
23. h4 { Le pion h part à l'assaut : sa rupture h4-h5 ouvrira la colonne h. Le meilleur coup selon Stockfish. }
23... d5 { Une imprécision : les Noirs veulent se débarrasser de leur pion e6 faible, mais l'échange ouvre la colonne e en grand et laisse le cavalier a5 hors jeu. 23...Nxc4 était plus précis (Stockfish : +0,5 au lieu de +0,9). }
24. cxd5 { Les Blancs prennent. }
24... exd5 { Les Noirs reprennent en attaquant la dame. La colonne e est maintenant TOTALEMENT ouverte. }
25. Qxe8+ { Les Blancs échangent les dames sur la colonne e. }
25... Qxe8 { Les Noirs reprennent. }
26. Rxe8+ { La tour prend à son tour : tous les occupants de la colonne e disparaissent. }
26... Kxe8 { Le roi reprend. Les Blancs ont déjà préparé la colonne suivante. }
27. h5 { Seconde rupture : le pion attaque g6. Le meilleur coup selon Stockfish. [%cal Gh5g6] }
27... Rf6 { La tour garde la 6e rangée. }
28. hxg6 { Les Blancs prennent. }
28... hxg6 { Les Noirs reprennent : la colonne h est ouverte. }
29. Rh1 { La tour s'en empare la première : elle menace Rh8+ et Rh7. Le cavalier a5 est loin, la tour noire est passive. Capablanca gagnera la finale en activant sa tour et son roi.

PRO TIP : quand une colonne disparaît dans un échange de tours, cherche la suivante. Une rupture de pion (ici h4-h5) peut en créer une nouvelle là où ton adversaire ne l'attend pas. [%cal Gh1h8] } *`,
    ),
    chapter(
      "Pillsbury – Showalter (1) : la tour avant la colonne, et les avant-postes",
      "r1bq1rk1/pppnbppp/4pn2/3p2B1/2PP4/2N1PN2/PP3PPP/R2QKB1R w KQ - 3 7",
      `{ 1897. Un Gambit dame refusé classique. Aucune colonne n'est encore ouverte, mais Pillsbury place déjà sa tour sur la colonne c : il sait que le pion c4 s'échangera tôt ou tard contre le pion d5.

Ce chapitre montre aussi un autre usage des colonnes semi-ouvertes : les AVANT-POSTES. Une case centrale sur une colonne semi-ouverte (e4 pour les Noirs, e5 pour les Blancs), soutenue par un pion et hors d'atteinte des pions adverses, est la case idéale d'un cavalier. [%cal Ga1c1] }
7. Rc1 { La tour se place sur la colonne c AVANT qu'elle ne s'ouvre. Stockfish jugeait 7.Qc2 et 7.Bd3 à peu près équivalents. }
7... a6 { Les Noirs préparent ...dxc4 suivi de ...b5. Stockfish préférait 7...h6 ou 7...c6. }
8. cxd5 { Les Blancs échangent tout de suite : la colonne c devient semi-ouverte pour leur tour, face au pion c7. Le meilleur coup selon Stockfish. }
8... exd5 { Les Noirs reprennent du pion e : la colonne e devient semi-ouverte pour eux. }
9. Bd3 { Le fou se développe vers h7. Le meilleur coup selon Stockfish. }
9... c6 { Le pion soutient d5. La tour c1 n'a plus de cible immédiate, mais elle reste prête. }
10. O-O { Le roi se met à l'abri. Le meilleur coup selon Stockfish. }
10... Re8 { La tour prend la colonne e semi-ouverte. }
11. Bb1 { Le fou recule en b1 pour garder la diagonale b1-h7. Stockfish préférait 11.h3 ou 11.Qc2 (+0,5 au lieu de +0,2). }
11... Ne4 { AVANT-POSTE NOIR : le cavalier s'installe en e4, sur la colonne e semi-ouverte, soutenu par le pion d5. Le meilleur coup selon Stockfish. [%csl Ge4] }
12. Bf4 { Le fou évite l'échange. 12.Bxe7 était équivalent. }
12... Ndf6 { Le second cavalier soutient celui de e4. }
13. Ne5 { AVANT-POSTE BLANC : le cavalier s'installe en e5, soutenu par le pion d4. Aucun pion noir ne peut l'en chasser : le pion f7 ne peut pas l'attaquer sans passer par f6, occupée par le cavalier. Le meilleur coup selon Stockfish. [%csl Ge5] }
13... Bf5 { Le fou se développe sur la diagonale de b1, masquée pour l'instant par son propre cavalier e4. Stockfish préférait 13...Nxc3, qui simplifie (+0,2 au lieu de +0,4). }
14. Na4 { Le meilleur coup selon Stockfish (+0,4) : le cavalier évite l'échange en c3, qui aurait abîmé les pions blancs, et vise la case c5. [%cal Ga4c5] }
(14. f3? { Le coup de la partie chasse le cavalier e4, mais il laisse les Noirs échanger en c3 et en b1 (Stockfish : −0,4 au lieu de +0,4). }
14... Nxc3 { Le cavalier prend avant d'être chassé. }
15. bxc3 { Les Blancs reprennent du pion b : la colonne b devient semi-ouverte, mais le pion a2 se retrouve isolé. }
15... Bxb1 { Les Noirs éliminent le bon fou blanc. }
16. Rxb1 { La tour reprend et se retrouve sur la colonne b semi-ouverte, face au pion b7. Les Blancs ont gagné une colonne, mais perdu leur avantage. Pillsbury gagnera pourtant cette partie, grâce à la colonne h (chapitre suivant).

PRO TIP : ouvrir une colonne n'est pas toujours bon. Demande-toi ce que l'échange de pions coûte en structure : ici, un pion a2 isolé et le bon fou échangé, pour une colonne b sans grande cible. })
14... Bg6 { Le fou se retire. Stockfish jugeait 14...h5 tout aussi bon. }
15. g3 { Les Blancs contrôlent f4 et h4 et préparent Nxg6. Le meilleur coup selon Stockfish. }
15... Nd6 { Le cavalier quitte e4 et vise c4. Le meilleur coup selon Stockfish. }
16. Nxg6 { Les Blancs prennent le fou : ils obtiennent la paire de fous. }
16... hxg6 { Les Noirs reprennent vers le centre. Les Blancs gardent un léger avantage (Stockfish : environ +0,4), avec la colonne c et la case c5 pour leur cavalier.

PRO TIP : place tes tours sur les colonnes qui VONT s'ouvrir, et tes cavaliers sur les avant-postes que ces colonnes créent. [%csl Gc5,Gc1] } *`,
    ),
    chapter(
      "Pillsbury – Showalter (2) : ouvrir la colonne h, puis la 7e rangée",
      "4r3/r4p1k/p1p5/1p1p1Npn/3P4/2P1PPP1/P5P1/1R3RK1 w - - 0 26",
      `{ Plus tard dans la même partie. En reprenant 25.hxg3, les Blancs ont ouvert la colonne h : il n'y a plus aucun pion dessus, seulement le cavalier noir h5 et le roi h7. La tour f1 va s'en emparer, puis une rupture de pion (f3-f4) ouvrira encore d'autres lignes.

Observe aussi le rôle du roi : en finale, c'est lui qui libère les tours. [%csl Gh1,Rh5] [%cal Gf1h1] }
26. Kf2 { Un coup fin : le roi protège g3 et e3, et libère la case g1 pour que la tour f1 puisse passer en h1. Le meilleur coup selon Stockfish. [%cal Gf1h1] }
26... Kg6 { Le roi noir attaque le cavalier f5, qui n'est pas protégé. }
27. Rh1 { La tour prend la colonne h et attaque le cavalier h5 : les Blancs rendent la monnaie. Le meilleur coup selon Stockfish. [%cal Gh1h5] }
27... Kxf5 { Le roi prend le cavalier. }
28. Rxh5 { La tour reprend : le matériel est égal, mais la tour blanche est maîtresse de la colonne h et attaque le pion g5. 28.g4+ d'abord était équivalent. }
28... Rae7 { Les Noirs doublent leurs tours sur la colonne e, sans cible réelle. 28...f6 était un peu plus précis. }
29. Rh6 { La tour passe en 6e rangée et attaque le pion c6. }
29... f6 { Le pion ferme la 6e rangée et protège g5. }
30. Re1 { La seconde tour se place derrière le pion e3, pour préparer la poussée e3-e4. 30.g4+ était un peu plus précis. }
30... a5 { Les Noirs gagnent de l'espace à l'aile dame. }
31. g4+ { Le pion chasse le roi avec échec. Le meilleur coup selon Stockfish. }
31... Ke6 { Le seul coup. }
32. f4 { LA RUPTURE : le pion attaque g5 pour ouvrir encore plus de lignes vers le roi noir. Le meilleur coup selon Stockfish. [%cal Gf4g5] }
32... Rg8 { Le meilleur coup selon Stockfish : les Noirs gardent le pion g5 et ne prennent pas en f4. }
(32... gxf4? { Le coup de la partie ouvre la colonne e pour les Blancs (Stockfish : +3,0 au lieu de +2,1). }
33. exf4+ { Le pion reprend, et la tour e1 donne échec à la découverte sur la colonne e. }
33... Kd7 { Le roi s'écarte. }
34. Rxe7+ { La tour échange sur la colonne e. }
34... Kxe7 { Le roi reprend. }
35. Rh7+ { La tour arrive en 7e rangée par la colonne h, avec échec. Pillsbury a gagné cette finale (Stockfish : environ +3,8). [%cal Gh7a7] })
33. f5+ { Le pion avance avec échec, protégé par le pion g4. Le roi noir est repoussé. }
33... Kf7 { Le roi recule. }
34. Reh1 { Les Blancs DOUBLENT leurs tours sur la colonne h ouverte. Le meilleur coup selon Stockfish. [%csl Gh1,Gh6] }
34... Ree8 { La tour se replie. 34...Rg7 était un peu plus précis. }
35. Rh7+ { La tour pénètre en 7e rangée avec échec. }
35... Rg7 { La tour s'interpose. }
36. Kf3 { Le roi s'active à son tour. Les Blancs ont la colonne h, la 7e rangée et un roi actif : leur avantage est net (Stockfish : environ +2,2).

PRO TIP : une colonne ouverte au bord de l'échiquier (a ou h) vaut autant qu'une colonne centrale si elle mène à la 7e rangée. En finale, double les tours dessus, puis pénètre. [%cal Gh7c7] } *`,
    ),
    chapter(
      "Rubinstein – Schlechter : arriver le premier sur la colonne c",
      "rnb1k2r/pp3ppp/4p3/q7/1b1PP3/5N2/P2B1PPP/R2QKB1R w KQkq - 3 10",
      `{ 1912. Dans cette défense Semi-Tarrasch, les deux pions c ont déjà été échangés : la colonne c est totalement ouverte dès le 10e coup. La question n'est plus de l'ouvrir, mais de savoir QUI l'occupera.

Regarde l'aile dame noire : le cavalier b8 et le fou c8 ne sont pas développés, et ils enferment la tour a8. Les Noirs ne pourront pas disputer la colonne c avant plusieurs coups. Rubinstein, lui, va s'y installer et pénétrer jusqu'en c7. [%csl Gc1,Gc7,Rb8,Rc8] }
10. Rb1 { La tour utilise d'abord la colonne b semi-ouverte (il n'y a plus de pion b blanc) : elle attaque le fou b4. Le meilleur coup selon Stockfish. [%cal Gb1b4] }
10... Bxd2+ { Les Noirs échangent le fou attaqué. }
11. Qxd2 { La dame reprend et propose l'échange des dames. }
11... Qxd2+ { Les Noirs échangent. Stockfish préférait de peu 11...Qd8, qui garde les dames. }
12. Kxd2 { Le roi reprend. En finale, il est bien placé en d2 : il contrôle c1, c2 et c3, les cases par lesquelles une tour noire pourrait entrer sur la colonne c. [%csl Gc1,Gc2,Gc3] }
12... O-O { Le roi noir se met à l'abri. 12...f6 était équivalent. }
13. Bb5 { Le fou contrôle c6 et d7, les cases de développement du cavalier b8. Stockfish jugeait 13.Ke3 et 13.Bd3 un peu plus précis. }
13... a6 { Les Noirs chassent le fou. }
14. Bd3 { Le fou recule sur une bonne case, d'où il protège e4. Le meilleur coup selon Stockfish. }
14... Rd8 { La tour presse le pion d4. 14...b5 était un peu plus précis. }
15. Rhc1 { La seconde tour s'empare de la colonne c ouverte. Les Noirs ne peuvent pas s'y opposer : ...Rc8 est impossible tant que le fou c8 n'a pas bougé. 15.Rb6 était aussi fort. }
15... b5 { Les Noirs préparent ...Bb7 pour libérer leur aile dame. }
16. Rc7 { La tour PÉNÈTRE en 7e rangée par la colonne ouverte. Elle attaque le pion f7 et paralyse les Noirs, qui doivent encore développer deux pièces. Le meilleur coup selon Stockfish (+1,2). Rubinstein a gagné cette finale.

PRO TIP : une colonne ouverte appartient à celui qui l'occupe le premier avec une tour, surtout si l'adversaire a des pièces non développées qui l'empêchent de la disputer. [%cal Gc7f7] } *`,
    ),
    chapter(
      "Alekhine – Yates : l'avant-poste c5 et la tour en c7",
      "r1b1r1k1/p2nq1pp/2p1p3/1p1n1p2/2BP4/4PN2/PPQN1PPP/2R1K2R w K - 0 14",
      `{ Londres 1922. Le pion c blanc a déjà disparu (échangé en c4), et la tour c1 attend sur la colonne c. Il ne reste qu'un obstacle : le pion c6. Alekhine va l'éliminer, puis utiliser la colonne ouverte de deux façons : en y installant un CAVALIER sur un avant-poste (c5), et en y faisant pénétrer ses TOURS jusqu'en c7.

Un avant-poste sur une colonne ouverte est une case que les pions adverses ne peuvent plus attaquer. Une pièce qui s'y installe bloque la colonne pour l'adversaire et appuie l'action des tours. [%csl Gc5,Gc7,Rc6] }
14. Bxd5 { Les Blancs échangent leur fou contre le cavalier d5 pour forcer la reprise du pion c6. Le meilleur coup selon Stockfish. }
14... cxd5 { Les Noirs reprennent : il n'y a plus aucun pion sur la colonne c. Elle est totalement ouverte, et les Blancs l'occupent déjà avec la tour c1 et la dame c2. [%csl Gc1,Gc2] }
15. Qc6 { Le meilleur coup selon Stockfish (+2,0) : la dame pénètre tout de suite par la colonne ouverte. De c6, elle attaque la tour a8, le cavalier d7 et le pion e6. [%cal Gc2c6,Gc6a8,Gc6d7] }
(15. O-O?! { Le coup de la partie, naturel mais moins précis : il laisse aux Noirs le temps de souffler (Stockfish : +1,2 au lieu de +2,0). La suite de la partie reste pourtant une leçon sur les colonnes ouvertes. }
15... a5 { Les Noirs menacent ...a4, puis ...b4, pour gagner de l'espace à l'aile dame. }
16. Nb3 { Le cavalier se dirige vers c5. Stockfish préférait 16.Qc7, mais l'idée est la même. }
16... a4 { Le pion chasse le cavalier... mais vers la case qu'il voulait justement atteindre. 16...Ba6 était plus solide (Stockfish : +1,3 au lieu de +1,9). }
17. Nc5 { L'AVANT-POSTE : le cavalier, soutenu par le pion d4, s'installe en c5. Aucun pion noir ne pourra jamais l'en chasser : il faudrait un pion en b6 ou en d6, et les pions b5 et d5 ne peuvent pas reculer. Le meilleur coup selon Stockfish. [%csl Gc5] }
17... Nxc5 { Les Noirs échangent le cavalier gênant. }
18. Qxc5 { La dame reprend et propose l'échange. 18.dxc5 était équivalent. }
18... Qxc5 { Les Noirs échangent les dames. }
19. Rxc5 { La tour reprend et prend la place du cavalier sur l'avant-poste c5. Elle attaque le pion b5. }
19... b4 { Le pion s'écarte et gagne de l'espace. }
20. Rfc1 { Les Blancs DOUBLENT leurs tours sur la colonne ouverte : la tour c5 est soutenue, et la case c7 est visée deux fois. }
20... Ba6 { Le fou se développe enfin. }
21. Ne5 { Le cavalier se centralise : il contrôle c6 et c4, deux cases de la colonne. }
21... Reb8 { Les Noirs placent leurs tours derrière les pions de l'aile dame. 21...g5 était un peu plus tenace. }
22. f3 { Les Blancs donnent de l'air à leur roi et contrôlent e4 et g4. Le meilleur coup selon Stockfish. }
22... b3 { Le pion avance pour créer du contre-jeu. 22...Rc8, qui conteste la colonne, était meilleur. }
23. a3 { Le pion b3 attaquait a2 : le pion s'avance en a3, et l'aile dame se ferme. }
23... h6 { Les Noirs donnent de l'air à leur roi. }
24. Kf2 { Le roi se rapproche du centre : en finale, c'est une pièce active. }
24... Kh7 { Le roi noir reste passif. }
25. h4 { Les Blancs gagnent de l'espace à l'aile roi. }
25... Rf8 { La tour cherche du jeu à l'aile roi. }
26. Kg3 { Le roi continue sa route. }
26... Rfb8 { La tour revient : les Noirs n'ont aucun plan. }
27. Rc7 { LA PÉNÉTRATION : la tour atteint la 7e rangée par la colonne ouverte. Elle attaque le pion g7, et la seconde tour pourra la suivre. Alekhine gagnera cette partie (Stockfish : environ +3,4).

PRO TIP : une colonne ouverte se gagne en trois temps : l'occuper, la doubler, puis pénétrer en 7e rangée. Un avant-poste sur la colonne (ici c5) sert de point d'appui à toute l'opération. [%cal Gc7g7] })
15... Rb8 { La tour s'écarte et protège le pion b5. Le meilleur coup selon Stockfish. }
16. O-O { Le roi se met à l'abri ; la tour f1 pourra rejoindre la colonne c. }
16... b4 { Le pion avance pour ne pas rester une cible. 16...h6 était équivalent. }
17. Qa4 { La dame attaque le pion b4, le pion a7 et le cavalier d7. [%cal Ga4b4,Ga4a7,Ga4d7] }
17... Qd8 { La dame revient défendre le cavalier d7. 17...Bb7 était à peine plus précis. }
18. Rc2 { La tour prépare le doublement sur la colonne c (Rfc1). Le meilleur coup selon Stockfish. }
18... Rb6 { La tour défend la 6e rangée. Les Blancs ont la colonne c, une dame active et des cibles en a7 et b4 : leur avantage est net (Stockfish : environ +2,0).

PRO TIP : quand une colonne vient de s'ouvrir, regarde d'abord si une pièce peut l'utiliser TOUT DE SUITE pour pénétrer (ici 15.Qc6!), avant de la doubler tranquillement. [%cal Gf1c1] } *`,
    ),
    chapter(
      "Alekhine – Nimzowitsch : le Canon d'Alekhine",
      "r4rk1/p3nqpp/Ppn1p3/1B1pPp2/1P1P1P2/5N2/3Q2PP/R3K2R w KQ - 3 19",
      `{ San Remo 1930. La colonne c est totalement ouverte, et le cavalier c6 noir s'y trouve, attaqué par le fou b5. Le pion a6 blanc fige le pion a7 et contrôle b7 : les tours noires ne peuvent pas utiliser la 7e rangée pour se défendre.

Alekhine va TRIPLER ses pièces lourdes sur la colonne c : deux tours devant, la dame derrière. Cette formation porte son nom : le CANON D'ALEKHINE. Les Noirs pourront tripler eux aussi, mais seulement pour défendre ; c'est l'attaquant qui choisit le moment de frapper. [%csl Rc6,Ga6] [%cal Gb5c6] }
19. O-O { Le roi se met à l'abri, et la tour h1 devient une tour de colonne. Stockfish jugeait 19.Rc1 et 19.Kf2 aussi bons : tous gagnent (environ +3). }
19... h6 { Les Noirs donnent de l'air à leur roi. }
20. Rfc1 { Première pièce sur la colonne c. }
20... Rfc8 { Les Noirs contestent la colonne. 20...Rac8 était un peu plus précis. }
21. Rc2 { La tour monte d'une case pour laisser c1 à la seconde tour : le doublement commence. Le meilleur coup selon Stockfish. }
21... Qe8 { La dame vient protéger le cavalier c6 par la diagonale e8-c6. }
22. Rac1 { Les tours sont doublées. }
22... Rab8 { La tour se replace, sans grand but. Stockfish préférait 22...Qd7. }
23. Qe3 { La dame cherche son chemin vers la colonne c. Stockfish préférait 23.Rc3 tout de suite. }
23... Rc7 { Les Noirs renforcent la défense de c6 et de la colonne. }
24. Rc3 { La première tour avance en c3 : elle libère c2 pour la seconde, et c1 pour la dame. Le meilleur coup selon Stockfish. }
24... Qd7 { La dame protège c6 une fois de plus. }
25. R1c2 { La seconde tour se place en c2. }
25... Kf8 { Les Noirs n'ont rien à faire : le roi se rapproche du centre. }
26. Qc1 { LE CANON EST EN PLACE : tour c3, tour c2, dame c1. Les trois pièces lourdes blanches visent le cavalier c6. Le meilleur coup selon Stockfish. [%csl Gc3,Gc2,Gc1] [%cal Gc1c6] }
26... Rbc8 { Les Noirs triplent aussi : tour c7, tour c8, dame d7. Le cavalier c6 ne peut plus bouger sans livrer la tour c7 aux pièces blanches. Mais ils n'ont plus aucun coup actif. }
27. Ba4 { Le fou recule pour préparer la poussée b4-b5, qui attaquerait le cavalier cloué avec un simple pion. Le meilleur coup selon Stockfish. [%cal Gb4b5] }
27... b5 { Les Noirs bloquent la poussée en sacrifiant un pion. 27...Qe8 tenait plus longtemps, sans sauver la partie. }
28. Bxb5 { Le fou prend le pion et attaque à nouveau c6. }
28... Ke8 { Le roi vient vers d8 pour protéger c7. }
29. Ba4 { Le fou recule encore : la poussée b4-b5 redevient possible. Stockfish jugeait 29.Rc5 un peu plus fort. }
29... Kd8 { Le roi protège la tour c7. Les Noirs sont paralysés. }
30. h4 { Rien ne presse : les Noirs ne peuvent rien entreprendre, alors Alekhine gagne de l'espace à l'aile roi. }
30... h5 { Une faute dans une position déjà perdue : la case g5 n'est plus contrôlée par un pion, et le cavalier f3 pourra s'y installer (Stockfish : +6,1). }
31. Kh2 { Le roi se met à l'abri des échecs. Stockfish préférait 31.Ng5 tout de suite. }
31... g6 { Un coup d'attente : les Noirs n'ont plus aucun coup utile. }
32. Ng5 { Le meilleur coup selon Stockfish (+8) : le cavalier saute en g5, d'où il attaque e6. Les Blancs vont maintenant faire feu sur la colonne c. [%cal Gg5e6] }
(32. g3 { Le coup de la partie : un simple coup d'attente. Les Noirs, qui n'ont plus de coup utile, sont en ZUGZWANG, et Nimzowitsch abandonne. Stockfish trouve 32.Ng5 encore plus rapide, mais la leçon est la même : sous le Canon, les Noirs sont paralysés. })
32... Ng8 { Les Noirs n'ont pas de défense : tout coup perd du matériel. }
33. Rxc6 { Le canon tire : la tour prend le cavalier. [%cal Gc3c6] }
33... Rxc6 { La tour reprend. }
34. Bxc6 { Le fou reprend la tour et attaque la dame d7. Les Blancs ont gagné une pièce, et la colonne c leur appartient toujours (tour c2, dame c1). }
34... Qe7 { La dame s'écarte. Les Blancs ont une pièce de plus et vont gagner.

PRO TIP : le Canon d'Alekhine, c'est deux tours DEVANT la dame sur une colonne ouverte. Monte-le quand l'adversaire ne peut pas contester la colonne activement, puis ajoute une pièce (ici un pion, b4-b5) contre le point défendu : il cède. [%cal Gc2c8] } *`,
    ),
    chapter(
      "Marshall – Capablanca : la lutte pour une colonne contestée",
      "r4rk1/pp2qppp/4b3/2p5/8/4PQP1/PP3PBP/R4RK1 w - - 1 16",
      `{ Match de 1909. La colonne d est totalement ouverte : les deux camps ont échangé leurs pions d. Aucun des deux ne l'occupe encore. C'est une colonne CONTESTÉE : elle appartiendra à celui qui y placera le premier une tour qu'il pourra garder.

La règle à retenir : quand les deux camps s'affrontent sur une colonne et échangent leurs tours, celui qui reprend avec une AUTRE TOUR garde la colonne ; celui qui doit reprendre avec une autre pièce la perd. Capablanca (avec les Noirs) va appliquer cette règle à la perfection. [%csl Gd1,Gd8] }
16. Rfc1 { La tour presse le pion c5 sur la colonne c, semi-ouverte pour les Blancs. Stockfish préférait de peu 16.Qe4. }
16... Rab8 { La tour se place derrière le pion b : les Noirs vont avancer leur majorité de l'aile dame (trois pions contre deux). }
17. Qe4 { La dame se centralise et attaque les pions b7 et h7. }
17... Qc7 { La dame protège c5 et la 7e rangée. Le meilleur coup selon Stockfish. }
18. Rc3 { La tour se lève sur la 3e rangée. Stockfish préférait 18.b3, pour freiner les pions noirs. }
18... b5 { La majorité noire avance. }
19. a3 { Une imprécision : Stockfish préférait 19.b3, qui conteste la chaîne de pions noirs (−0,2 au lieu de −0,7). Après a3, les Noirs vont bloquer l'aile dame avec ...c4. }
19... c4 { Le pion avance et gagne de l'espace. Le meilleur coup selon Stockfish. }
20. Bf3 { Le fou protège e2 et d1. Stockfish préférait 20.Rd1, qui occupe la colonne d tout de suite. }
20... Rfd8 { Capablanca occupe la colonne d le premier. Le meilleur coup selon Stockfish. [%csl Gd8] }
21. Rd1 { Les Blancs contestent la colonne avec leur tour a1. Mais leur seconde tour, en c3, ne peut pas soutenir la case d1. }
21... Rxd1+ { Les Noirs échangent, c'est le meilleur coup. }
22. Bxd1 { Les Blancs doivent reprendre avec le FOU : il n'y a plus de tour blanche sur la colonne d. }
22... Rd8 { La seconde tour noire reprend la colonne d, et cette fois personne ne peut plus la lui disputer : la tour c3 est trop loin. [%csl Gd8] [%cal Gd8d1] }
23. Bf3 { Le fou revient en f3. Stockfish préférait 23.Rc1, qui protège la 1re rangée (−1,3 au lieu de −1,7). }
23... g6 { Les Noirs donnent de l'air à leur roi : plus aucun risque de mat du couloir. Le meilleur coup selon Stockfish. }
24. b3 { Le meilleur coup selon Stockfish : les Blancs attaquent le pion c4 pour casser la chaîne noire. [%cal Gb3c4] }
(24. Qc6? { Le coup de la partie propose l'échange des dames, mais il laisse la colonne d aux Noirs pour la finale (Stockfish : −2,6 au lieu de −1,9). }
24... Qe5 { Les Noirs refusent l'échange qui activerait la tour c3 et centralisent leur dame. }
25. Qe4 { Les Blancs proposent à nouveau l'échange. Le meilleur coup dans cette position. }
25... Qxe4 { Cette fois, les Noirs échangent : sans les dames, leur tour régnera sur la colonne d. }
26. Bxe4 { Le fou reprend. }
26... Rd1+ { La tour pénètre en 1re rangée par la colonne d. Elle va attaquer les pions blancs de l'aile dame, pendant que la majorité noire avance. Capablanca a gagné cette finale (Stockfish : environ −3,7).

PRO TIP : en finale, la tour qui contrôle la seule colonne ouverte vaut souvent plus qu'un pion. Ne l'abandonne jamais pour un échange de dames qui ne règle rien. [%cal Gd1b1] })
24... Qa5 { La dame attaque la tour c3 et le pion a3. Le meilleur coup selon Stockfish. [%cal Ga5c3,Ga5a3] }
25. b4 { Le pion ferme la diagonale et chasse la dame. Le meilleur coup selon Stockfish. }
25... Qc7 { La dame revient. Le bilan est net : les Noirs ont la colonne d et un pion c4 passé et protégé par le pion b5 (Stockfish : environ −2,2).

PRO TIP : dans la lutte pour une colonne, compte les tours qui peuvent y venir. Ici, après l'échange en d1, les Noirs avaient une seconde tour prête à reprendre la colonne (b8), les Blancs non : leur tour c3 ne surveillait pas la 1re rangée. [%csl Gc4,Gd8] } *`,
    ),
    chapter(
      "Tarrasch – Thorold : deux colonnes ouvertes et la 7e rangée",
      "2kr2nr/pp4pp/5p2/4P3/3p4/3P4/PP1N2PP/R3R1K1 b - - 0 17",
      `{ Manchester 1890. Les Blancs viennent de reprendre 17.cxd3 (après 16.Bd3 Bxd3 ; Stockfish préférait 16.Bb3, environ +1,0 au lieu de +0,4). Cette reprise a une conséquence importante : il n'y a plus aucun pion sur la colonne c, qui mène droit au roi noir en c8. Et dès que le pion e5 aura disparu, la colonne e sera ouverte elle aussi.

Deux colonnes ouvertes, deux tours blanches : le plan est clair. Il faudra aussi savoir QUAND doubler les tours sur une colonne, et quand préférer un coup plus utile. [%csl Rc8] [%cal Ga1c1,Ge1e8] }
17... fxe5 { Les Noirs prennent le pion. 17...Rd5, qui protège e5 depuis le centre, était équivalent selon Stockfish. }
18. Rac1+ { La tour s'empare de la colonne c avec échec. 18.Rxe5 tout de suite était aussi bon. [%cal Ga1c1,Gc1c8] }
18... Kb8 { Le seul bon coup : 18...Kd7 laissait le roi au milieu des tours (+1,6). }
19. Rxe5 { La seconde tour reprend le pion : la colonne e est maintenant ouverte, et les Blancs tiennent les DEUX colonnes ouvertes. Le meilleur coup selon Stockfish. [%csl Gc1,Ge5] }
19... Nf6 { Le cavalier se développe enfin et contrôle e8 et d5. }
20. Nf3 { Le meilleur coup selon Stockfish (+0,4) : le cavalier attaque le pion d4, que plus aucun pion ne protège. Les Blancs n'ont pas besoin de doubler leurs tours tout de suite : ils utilisent d'abord les colonnes pour gagner du matériel. [%cal Gf3d4] }
(20. Rce1?! { Le coup de la partie double les tours sur la colonne e. C'est logique, mais les Noirs pouvaient maintenant répondre 20...Nd5!, qui centralise le cavalier en direction de f4 et e3 et égalise (Stockfish : environ 0,0 au lieu de +0,4). }
20... Rhe8? { La faute : les Noirs contestent la colonne e avec UNE tour contre DEUX. Celui qui a le plus de pièces sur une colonne contestée la gagne (Stockfish : +1,2). }
21. Rxe8 { Les Blancs échangent. }
21... Nxe8 { Les Noirs reprennent du cavalier, qui est maintenant passif en e8. }
22. Re7 { La seconde tour pénètre en 7e rangée par la colonne e, qui lui appartient désormais. Elle attaque g7, et le roi noir ne peut plus monter par c7. Tarrasch a gagné cette partie (Stockfish : environ +1,7).

PRO TIP : avant de contester une colonne, compte les pièces de chaque camp qui la contrôlent. Avec une tour contre deux, l'échange te laissera sans rien, et l'adversaire entrera chez toi. [%cal Ge7g7] })
20... Rhe8 { Les Noirs contestent la colonne e : ici, c'est possible, car les Blancs n'y ont qu'une tour. Stockfish préférait de peu 20...Rc8, qui conteste plutôt la colonne c. }
21. Rxe8 { Les Blancs échangent. Le meilleur coup selon Stockfish. }
21... Rxe8 { La tour reprend : les Noirs gardent un pied sur la colonne e. }
22. Nxd4 { Le cavalier prend le pion d4. Les Blancs ont un pion de plus. Le meilleur coup selon Stockfish. }
22... Rd8 { La tour attaque le cavalier d4, qu'aucun pion ne protège. }
23. Rc4 { La tour défend le cavalier le long de la 4e rangée, tout en gardant la colonne c. Les Blancs ont un pion de plus et une position saine (Stockfish : environ +0,4).

PRO TIP : une colonne ouverte n'est pas un but en soi. Elle sert à créer des menaces : ici, la tour c1 tenait le roi noir à distance pendant que le cavalier allait gagner le pion d4. [%csl Gc4,Gd4] } *`,
    ),
  ],
};
