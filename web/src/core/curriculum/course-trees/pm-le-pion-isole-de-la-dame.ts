import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « Le pion isolé » (positional_mastery, module 4) — refonte « un
 * commentaire par coup » du 2026-10-10.
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, entièrement
 * réécrite ici) :
 *  - Mauricio Flores Rios, « Chess Structures — A Grandmaster Guide »
 *    (Quality Chess, 2015), chapitre 1 « The Isolani » : plans des deux camps,
 *    Zvjaginsev – Vasquez (Khanty-Mansiysk 2013), Vitiugov – Bologan
 *    (Eilat 2012) ;
 *  - l'étude Lichess « Isolated Queen Pawn » (Ginger64, gvFWGIgD) pour les
 *    parties classiques : Botvinnik – Vidmar (Nottingham 1936), Polugaevsky –
 *    Lutikov (1958), Botvinnik – Batuev (Leningrad 1931), Portisch – Bilek
 *    (Budapest 1975), Zukertort – Steinitz (1886), Korchnoi – Karpov (Merano
 *    1981), Regedzinski – Rubinstein (Lodz 1917), Marshall – Chigorin (1905).
 * Les chapitres d'ouverture (1, 2) suivent la théorie courante.
 *
 * Chaque partie a été rejouée coup par coup avec chess.js, et chaque coup
 * (variantes comprises) sondé avec Stockfish 18 à profondeur 18 (MultiPV 3).
 * Règle appliquée : quand le coup de la partie est une imprécision majeure,
 * la LIGNE PRINCIPALE suit le moteur et le coup de la partie passe en
 * variante, signalée comme fautive. Exception : un coup thématique un peu
 * moins précis que celui du moteur reste en ligne principale tant qu'il
 * garde un avantage décisif (≥ +1,5) ; l'écart est alors signalé.
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const LE_PION_ISOLE_DE_LA_DAME: CourseTree = {
  chapters: [
    chapter(
      "Les fondations : naissance du pion isolé (Caro-Kann, attaque Panov)",
      START,
      `{ Un pion « isolé » est un pion qui n'a plus aucun pion de son camp sur les colonnes voisines. Le plus célèbre est le pion d4 isolé (on dit aussi « pion dame isolé ») : plus de pion blanc en c ni en e.

Ce pion a deux visages. Côté force, il contrôle c5 et e5, deux cases idéales pour un cavalier, et il donne de l'espace et des colonnes semi-ouvertes (c et e) aux pièces blanches. Côté faiblesse, aucun pion ne pourra jamais le défendre, et la case d5, juste devant lui, ne peut plus être chassée par un pion blanc : c'est un poste parfait pour une pièce adverse.

Retiens dès maintenant la règle d'or : avec beaucoup de pièces, le pion isolé est un atout d'attaque ; après les échanges, il devient une cible. Voici comment il naît dans l'attaque Panov de la Caro-Kann. }
1. e4 { Les Blancs ouvrent le jeu. }
1... c6 { La Caro-Kann : les Noirs préparent ...d5 avec l'appui du pion c. }
2. d4 { Les Blancs occupent le centre avec deux pions. }
2... d5 { Les Noirs contestent e4. }
3. exd5 { L'échange : le pion e blanc disparaît. C'est la première condition du pion isolé, il n'y a plus de pion blanc sur la colonne e. }
3... cxd5 { Les Noirs reprennent du pion c. }
4. c4 { L'attaque Panov. Les Blancs attaquent d5 avec leur pion c, qui va lui aussi s'échanger : il ne restera alors plus de pion blanc à côté de d4. Stockfish place 4.Bd3 à peine devant, mais 4.c4 est la façon la plus directe d'obtenir la structure étudiée. [%cal Gc4d5] }
4... Nf6 { Les Noirs défendent d5 avec une pièce. }
5. Nc3 { Deuxième attaquant sur d5. }
5... e6 { Les Noirs soutiennent d5 avec un pion et préparent le développement du fou f8 (5...Nc6 était aussi bon). }
6. Nf3 { Développement naturel, le cavalier surveille e5. }
6... Be7 { Le fou se développe et prépare le roque. }
7. cxd5 { Les Blancs échangent leur pion c : il n'y a plus de pion blanc en c ni en e. Le pion d4 est désormais isolé. [%csl Rd4] }
7... Nxd5 { Les Noirs reprennent du cavalier : il s'installe sur la case d5, juste devant le pion isolé. C'est le premier réflexe du camp qui joue contre le pion isolé : bloquer la case d5. [%csl Gd5,Rd4] }
(7... exd5 { Reprendre du pion est aussi jouable (environ +0,3) : chaque camp a alors un pion isolé, d4 contre d5, et la lutte est presque symétrique. })
8. Bd3 { Le fou vise h7, le point faible du roque noir. Avec le pion isolé, les Blancs placent souvent un fou sur la diagonale b1-h7 pour préparer une attaque. [%cal Gd3h7] }
8... Nc6 { Le cavalier attaque d4 : le pion isolé doit toujours être défendu par des pièces. [%cal Rc6d4] }
9. O-O { Les Blancs mettent leur roi à l'abri. }
9... O-O { Les Noirs aussi. }
10. Re1 { La tour occupe la colonne e semi-ouverte et soutient un futur cavalier en e5. Stockfish donne aux Blancs un petit avantage, environ +0,4.

Tu as sous les yeux la position type. Les Blancs ont l'espace, les cases c5 et e5 et une attaque potentielle sur le roque. Les Noirs ont la case d5 et une meilleure structure pour la finale.

PRO TIP : dans une position avec pion isolé, demande-toi d'abord « combien reste-t-il de pièces ? ». Si tu as le pion isolé, évite les échanges. Si tu joues contre lui, échange autant que possible. [%csl Ge5,Gc5,Gd5,Rd4] } *`,
    ),
    chapter(
      "Les deux camps s'organisent (Nimzo-Indienne, variante Rubinstein)",
      START,
      `{ La même structure naît dans beaucoup d'autres ouvertures : Gambit Dame accepté, défense Tarrasch, Nimzo-Indienne… Ici, la Nimzo-Indienne montre comment chaque camp place ses pièces autour du pion isolé, avant même que la bataille commence. }
1. d4 { Les Blancs occupent le centre. }
1... Nf6 { Les Noirs contrôlent e4 avec une pièce. }
2. c4 { Les Blancs prennent de l'espace à l'aile dame. }
2... e6 { Les Noirs préparent ...Bb4 ou ...d5. }
3. Nc3 { Les Blancs préparent e4. }
3... Bb4 { La Nimzo-Indienne : le fou cloue le cavalier c3 et freine e4. }
4. e3 { La variante Rubinstein : solide, les Blancs développent le fou f1 (4.Qc2 est aussi courant). }
4... O-O { Les Noirs mettent leur roi à l'abri. }
5. Bd3 { Le fou vise h7. }
5... d5 { Les Noirs prennent leur part du centre. }
6. Nf3 { Développement naturel. }
6... c5 { Les Noirs attaquent d4 : c'est ce coup qui mènera au pion isolé. }
7. O-O { Les Blancs terminent leur mise en sécurité. }
7... dxc4 { Les Noirs prennent en c4 (Stockfish préfère de peu 7...b6, l'écart est minime). }
8. Bxc4 { Le fou reprend et retrouve la diagonale a2-g8. }
8... cxd4 { Les Noirs échangent en d4… }
9. exd4 { …et les Blancs reprennent du pion e. Il n'y a plus de pion blanc en c ni en e : voilà le pion d4 isolé. [%csl Rd4] }
9... b6 { Les Noirs préparent ...Bb7 : le fou visera la grande diagonale et la case d5. [%cal Gb6b7] }
10. Bg5 { Les Blancs clouent le cavalier f6, qui défend d5 et le roque (10.Qe2 était un poil plus précis). }
10... Bb7 { Le fou contrôle d5 à distance : chaque pièce noire qui contrôle d5 empêche la rupture d4-d5. [%cal Gb7d5] }
11. Re1 { La tour sur la colonne e soutient un cavalier en e5. Stockfish préférait 11.Ne5 tout de suite, l'écart est faible. }
11... Nbd7 { Le cavalier se développe et pourra rejoindre d5 via b6 ou f6. }
12. Rc1 { La tour occupe la colonne c semi-ouverte. }
12... Rc8 { Même réponse : les Noirs contestent la colonne c. }
13. Bd3 { Le fou revient sur la diagonale b1-h7, braqué sur le roque (Stockfish trouvait 13.Qb3 un peu plus précis). [%cal Gd3h7] }
13... Re8 { La tour libère f8 : un cavalier pourra venir en f8 défendre h7. }
14. Qe2 { La dame se place sur la colonne e, derrière le futur Ne5.

Compare les deux camps. Les Blancs ont une batterie dame + fou vers le roque, une tour en e1 et la case e5 pour un cavalier. Les Noirs ont un fou en b7 et des tours sur c8 et e8, qui pressent les cases devant le pion et le pion lui-même. Stockfish juge la position presque égale (environ +0,1) : tout dépendra de qui réussit son plan.

PRO TIP : celui qui joue contre le pion isolé doit TOUJOURS garder un œil sur la case d5. Tant qu'elle est contrôlée par plusieurs pièces noires, la rupture d4-d5 est impossible et le pion reste une cible. [%csl Gd5,Rd4] } *`,
    ),
    chapter(
      "La rupture d4-d5 : Zvjaginsev – Vasquez (Khanty-Mansiysk 2013)",
      "r1bq1rk1/pp2bppp/2n1pn2/8/2BP4/2N2N2/PP3PPP/R1BQR1K1 w - - 3 11",
      `{ La position vient d'une attaque Panov par interversion. Les Noirs ont joué 10...Nf6 : leur cavalier a quitté d5, et plus aucune pièce noire ne bloque la case devant le pion isolé. Les Blancs vont préparer la rupture d4-d5, qui ouvre les lignes alors que les pièces noires ne sont pas prêtes. [%csl Rd5][%cal Gd4d5] }
11. a3 { Le meilleur coup selon Stockfish (environ +0,5). Il interdit ...Nb4, qui aurait permis au cavalier de revenir en d5, et libère a2 pour le fou. [%cal Ga3b4] }
11... a6 { Un peu lent : Stockfish préférait 11...b6 suivi de ...Bb7, pour contrôler d5 avec le fou. }
12. Ba2 { Le fou se cache en a2. Sur la diagonale a2-g8, il vise e6 et f7, et il soutiendra la poussée d4-d5. [%cal Ga2e6] }
12... b5 { Le livre de Flores Rios condamne ce coup, mais Stockfish le classe premier (environ +0,6) : la position noire tient, à condition de jouer très précisément ensuite. }
13. d5! { La rupture. Le pion isolé s'échange, la colonne e et la diagonale a2-g8 s'ouvrent d'un coup, et les pièces blanches deviennent plus actives que les noires. C'est le meilleur coup selon Stockfish. [%cal Gd4d5] }
13... exd5 { Le meilleur choix. Si 13...Nxd5, les Blancs obtiennent environ +0,9, et 13...b4? perd du terrain encore plus vite. }
14. Nxd5 { Le cavalier reprend et occupe d5. Il attaque le fou e7 et le cavalier f6. }
14... Nxd5 { Le coup naturel, mais il aide les Blancs (environ +1,0). Stockfish préférait 14...Ra7!, qui protège le fou e7 latéralement et garde l'équilibre (+0,5). }
15. Qxd5 { La dame reprend et se centralise. Elle attaque le cavalier c6. }
15... Bb7 { Le meilleur coup : le fou défend le cavalier c6 et se développe. }
16. Qh5 { La dame file vers l'aile roi, où il ne reste aucun cavalier noir pour défendre (environ +1,1). [%cal Gh5h7] }
16... Qc7 { Le meilleur coup : la dame quitte la colonne d et vise h2. }
17. Bg5 { Les Blancs veulent échanger le fou e7, le dernier défenseur des cases noires (17.Bd2 était un peu plus précis selon Stockfish). }
17... Bxg5 { Les Noirs échangent. }
18. Nxg5 { Le cavalier reprend et attaque h7 avec la dame : deux attaquants sur h7. [%cal Gg5h7,Gh5h7] }
18... h6 { Le seul bon coup. Attention : 18...Qxh2+?? perd sur un mat en quelques coups, et 18...Rfd8?? permet 19.Qxh7+ Kf8 20.Qh8#. }
19. Re3 { La tour monte par la troisième rangée pour rejoindre l'attaque : c'est la « levée de tour », un plan typique du pion isolé. Stockfish : environ +1,0. [%cal Ge3h3] }
19... Ne5! { La seule défense selon Stockfish (environ +1,1). Le cavalier revient au centre et surveille g6, la case-clé de l'attaque blanche. Les autres coups perdent. [%csl Gg6] }
(19... Na5? { Le coup de la partie, une faute décisive (environ +6). Le cavalier part attaquer le fou a2, mais laisse l'aile roi sans défense. } 20. Qg6!! { Superbe : la dame s'offre en g6, mais le pion f7 ne peut pas la prendre, car il est cloué par le fou a2 sur la diagonale du roi g8. Stockfish confirme que c'est le meilleur coup. [%csl Rf7][%cal Ga2g8] } 20... hxg5 { Les Noirs prennent le cavalier, et la colonne h s'ouvre pour l'attaque blanche. 20...Be4, qui revient défendre, résistait plus longtemps (environ +8), mais la position était perdue de toute façon. } 21. Rh3 { La tour occupe la colonne h ouverte : Qh7+ suivi d'un mat sur h8 menace. Stockfish donne environ +13. [%cal Gh3h8] } 21... Rfc8 { Les Noirs libèrent f8 pour leur roi, mais cela permet un mat forcé. 21...Qc2, qui propose l'échange des dames, résistait plus longtemps, même si la position restait perdue (environ +10). } 22. Re1 { La dernière pièce blanche entre dans le jeu. Stockfish annonce un mat en 8 coups, et les Noirs abandonneront peu après. })
20. Ne6 { Le meilleur coup : le cavalier attaque la dame c7 et la tour f8. }
20... fxe6 { Les Noirs prennent le cavalier, c'est le plus simple. }
21. Rxe5 { La tour reprend le cavalier. Le pion e6 est cloué par le fou a2 sur la diagonale du roi g8. [%cal Ga2g8] }
21... Bd5 { Le fou bloque la diagonale a2-g8. Les Blancs gardent un net avantage (environ +1,0) : roi noir exposé, pion e6 faible.

PRO TIP : dès que la case d5 n'est plus tenue par une pièce adverse, cherche d4-d5. Les lignes s'ouvrent et les pièces actives du camp au pion isolé prennent l'avantage. Pour l'empêcher, garde un cavalier en d5. } *`,
    ),
    chapter(
      "Détruire le défenseur de d5 : Portisch – Bilek (Budapest 1975)",
      "2rqr1k1/1b2bppp/p1n1pn2/1p4B1/3P4/P1NQ1N2/BP3PPP/3RR1K1 w - - 0 16",
      `{ Les Noirs n'ont pas de cavalier en d5 : la case est seulement surveillée par le cavalier f6, le pion e6 et le fou b7. Les pièces blanches sont idéalement placées : dame d3, fou a2, tours d1 et e1. Si le cavalier f6 disparaît, la rupture d4-d5 devient possible. [%csl Gf6,Rd5] }
16. Bxf6! { Le seul coup fort selon Stockfish (environ +1,3, les autres ne donnent que +0,5). Le fou se sacrifie contre le principal défenseur de d5. [%cal Gg5f6] }
16... Bxf6 { Le meilleur : 16...gxf6 briserait le roque (environ +3). }
17. d5! { La rupture, au moment exact où d5 n'a plus assez de défenseurs. C'est encore le seul bon coup : 17.Ne4 ne donnerait presque rien. [%cal Gd4d5] }
17... exd5 { Le meilleur : 17...b4 ou 17...Re7 perdent tout de suite (environ +2,6). }
18. Rxe8+ { Les Blancs échangent d'abord sur la colonne e, ouverte par la rupture. }
18... Qxe8 { Seul coup : la dame reprend. }
19. Nxd5 { Le cavalier s'installe en d5, attaque le fou f6 et menace Nxf6+. Le fou a2 soutient le cavalier. [%csl Gd5][%cal Ga2d5] }
19... Rd8! { La meilleure défense selon Stockfish (environ +1,0). La tour contre-attaque sur la colonne d : elle cloue presque le cavalier d5 devant la dame d3. [%cal Rd8d3] }
(19... Bd8? { Le coup de la partie (environ +2,5) : le fou recule et abandonne la diagonale. } 20. Re1 { La tour occupe la colonne e. } 20... Qf8 { Le meilleur coup : la dame quitte la colonne e. } 21. Qf5 { La dame vise c8 et f7 (21.h4 était un peu plus précis). } 21... Na5? { Une faute supplémentaire (environ +3,4). Il fallait 21...Rb8. } 22. Ne5 { Le meilleur coup : le cavalier menace Nd7 et f7. } 22... g6 { Le meilleur coup : le pion chasse la dame de f5. } 23. Qd7 { La dame entre en d7 et attaque la tour c8. } 23... Bxd5 { Les Noirs prennent le cavalier (23...Rc2 résistait mieux)… } 24. Qxc8 { …mais la tour c8 tombe : elle n'était plus défendue, car le fou d8 coupe la huitième rangée. Les Noirs abandonnent. })
20. Re1 { La tour prend la colonne e (20.Rd2 était un peu plus précis). }
20... Ne7 { Le meilleur coup : le cavalier défend en e7 et oppose une pièce au cavalier d5. }
21. Nxf6+ { Les Blancs échangent le fou de cases noires. }
21... gxf6 { Seul coup : 21...Kh8?? permet 22.Qxh7#. Le roque noir est abîmé et les Blancs gardent un net avantage (environ +1,0).

PRO TIP : pour réussir d4-d5, compte les défenseurs de d5. S'il en manque un, élimine-le, même au prix d'un fou contre un cavalier. Ici, Bxf6 a suffi à ouvrir le jeu. [%csl Rf6] } *`,
    ),
    chapter(
      "Cavalier en e5 et poussée f4-f5 : Botvinnik – Vidmar (Nottingham 1936)",
      "r2q1rk1/pp1bbppp/1n2pn2/6B1/3P4/1BN2N2/PP3PPP/R2Q1RK1 w - - 3 12",
      `{ Un Gambit Dame Refusé devenu position à pion isolé. Botvinnik va montrer la méthode d'attaque classique : dame en d3 puis à l'aile roi, cavalier en e5, fou en b3 braqué sur f7, et poussée du pion f pour ouvrir les lignes. [%csl Ge5][%cal Gb3f7] }
12. Qd3 { Un coup-clé du système de Botvinnik : de d3, la dame peut basculer vers g3 ou h3. Stockfish préférait de peu 12.Ne5 (environ +0,4 contre +0,3), mais l'idée est la même. [%cal Gd3h3] }
12... Nbd5 { Le blocus de d5. Stockfish préférait 12...Nfd5, qui garde le cavalier b6 et échange plutôt les fous de cases noires. }
13. Ne5 { Le cavalier s'installe en e5, soutenu par le pion d4 : aucun pion noir ne peut le chasser. [%csl Ge5] }
13... Bc6 { Le fou vient soutenir d5. }
14. Rad1 { La tour soutient d4 : toutes les pièces blanches sont en jeu. }
14... Nb4 { Le cavalier attaque la dame (Stockfish préférait 14...Nd7, pour échanger le cavalier e5). }
15. Qh3 { La dame bascule vers l'aile roi, exactement comme prévu au 12e coup. [%cal Gh3h7] }
15... Bd5 { Le meilleur coup : les Noirs cherchent à échanger le fou b3, la meilleure pièce blanche. }
16. Nxd5 { Les Blancs gardent leur fou b3 et donnent le cavalier c3 (16.Ba4 se valait). }
16... Nfxd5! { Le meilleur coup selon Stockfish (environ +0,5). En quittant f6, le cavalier démasque le fou e7 : les Noirs menacent ...Bxg5, car le fou g5 n'est plus défendu. [%cal Re7g5] }
(16... Nbxd5? { Le coup de la partie (environ +1,4) : le cavalier f6 reste une cible et la diagonale e7-g5 reste fermée. } 17. f4! { La poussée typique : f4-f5 va ouvrir la colonne f et doubler la force du fou b3 contre e6 et f7. [%cal Gf4f5] } 17... Rc8 { Les Noirs cherchent du contre-jeu sur la colonne c (17...Qd6 tenait un peu mieux). } 18. f5 { Le pion attaque e6. } 18... exf5 { Le meilleur : les Noirs prennent. } 19. Rxf5 { La tour reprend et rejoint l'attaque contre f6 et f7 (environ +2,2). } 19... Qd6? { La faute décisive (environ +5). Il fallait 19...Rc7, qui défend f7 par la deuxième rangée. } 20. Nxf7! { Le sacrifice qui détruit la position noire. Le cavalier d5 est le seul bouclier entre le fou b3 et le roi g8 : les Blancs vont le faire tomber. [%cal Gb3d5] } 20... Rxf7 { Si 20...Kxf7, 21.Bxd5+ gagne le cavalier d5 avec échec. } 21. Bxf6 { Le fou élimine le cavalier f6, qui défendait d5. } 21... Bxf6 { Si 21...Nxf6, 22.Rxf6 ouvre la diagonale h3-c8, et la dame h3 prendra la tour c8 avec échec. } 22. Rxd5 { La tour gagne le cavalier d5 : elle est protégée par le fou b3 et la tour d1. } 22... Qc6 { La dame attaque d5 et cache un piège : 23.Rc5? Bxd4+. } 23. Rd6 { La tour chasse la dame en restant protégée. } 23... Qe8 { La dame recule. } 24. Rd7 { La tour attaque la tour f7, clouée par le fou b3 sur la diagonale du roi. Les Noirs abandonnent. [%cal Gb3g8,Gd7f7] })
17. Bd2 { Le meilleur coup : le fou recule et attaque le cavalier b4. }
17... Qd6 { La dame défend le cavalier b4 (17...Nc6 était un peu plus précis). }
18. Bxb4 { Les Blancs échangent. Stockfish signalait même 18.Nxf7!?, un peu plus fort. }
18... Qxb4 { La dame reprend. }
19. f4 { Même avec moins de pièces, le plan reste le même : f4-f5 contre e6. Stockfish donne un petit avantage blanc (environ +0,5).

PRO TIP : avec le pion isolé, les pièces vont à l'attaque. Le cavalier va en e5, la dame en d3 puis h3, le fou en b3 ou c2, et le pion f s'avance pour ouvrir la colonne f. Avant chaque échange, demande-toi s'il affaiblit ton attaque. [%cal Gf4f5] } *`,
    ),
    chapter(
      "La levée de tour : Polugaevsky – Lutikov (1958)",
      "r2qbrk1/1p2bppp/pn2pn2/4N3/P2P4/1BN5/1P2QPPP/R1B2RK1 w - - 5 14",
      `{ Les Noirs ont choisi la défense de Steinitz : un fou en e8 pour protéger f7. Mais ici ce fou enferme la tour f8. Les Blancs vont transférer une tour par la troisième rangée (d1-d3-g3-h3) vers l'aile roi, un plan d'attaque très typique avec le pion isolé. [%cal Gd1d3,Gd3g3] }
14. Rd1 { Le meilleur coup selon Stockfish (environ +0,6). La tour soutient d4 et prépare Rd3. }
14... Nbd5 { Le blocus de d5. }
15. Rd3 { La tour monte en troisième rangée, d'où elle pourra aller en g3 ou h3. [%cal Gd3g3,Gd3h3] }
15... Rc8 { Stockfish préférait de peu 15...Nb4, qui chasse la tour. }
16. Rg3 { La tour vise g7 et le roi. }
16... Kh8 { Le meilleur coup : le roi quitte la colonne g. }
17. Bg5 { Le fou rejoint l'attaque et cloue le cavalier f6 (17.Rh3 était un peu plus précis). }
17... Nb4 { Le cavalier quitte d5 pour gêner les Blancs. 17...h6 était plus solide. }
18. Rd1 { Le meilleur coup : l'autre tour revient défendre d4. }
18... Rc7 { Les Noirs préparent une défense latérale. 18...Nfd5 était un peu meilleur. }
19. Rh3 { La tour se place en h3, en face de h7 (environ +1,0). [%cal Gh3h7] }
19... Bc6! { La meilleure défense selon Stockfish (environ +1,0). Le fou sort enfin de e8 : il contrôle d5 et la case f3, et empêche la dame blanche d'y aller. [%cal Gc6f3] }
(19... g6? { Le coup de la partie affaiblit les cases noires autour du roi (environ +1,9). } 20. Qf3 { La dame rejoint l'attaque (20.Bh6 était encore plus fort). } 20... Rg8? { Une faute supplémentaire (environ +3,8). Il fallait 20...h5. } 21. Ne4 { Le dernier cavalier entre dans l'attaque (21.d5 était encore plus précis). } 21... Nh5 { La meilleure défense : le cavalier ferme la colonne h. } 22. Qxf7! { La dame prend f7. Si 22...Bxf7, 23.Nxf7+ fourchette le roi et la dame, puis 24.Nxd8. } 22... Bc6 { Les Noirs gardent leur dame (22...Rg7 résistait mieux). } 23. Qxe6 { Deuxième pion, et la position noire s'effondre. } 23... Rg7 { La tour défend la septième rangée. } 24. d5! { Le pion isolé avance à son tour et ouvre la diagonale du fou b3 (environ +5). [%cal Gd4d5] } 24... Bd7 { 24...Bxd5 résistait un peu mieux. } 25. Bxe7 { Les Blancs échangent (25.Nf7+ était encore plus fort, mais tout gagne). } 25... Rxe7 { La tour reprend. } 26. Qd6 { La dame vise b4 et d7 (26.Nxg6+ était plus fort). } 26... Qe8 { 26...Qf8 résistait mieux. } 27. Nf6 { Le cavalier attaque la dame e8 et le cavalier h5. } 27... Nxf6 { Les Noirs prennent. } 28. Qxf6+ { La dame reprend avec échec. } 28... Rg7 { Seul coup. } 29. d6 { Le pion passé fourchette les deux tours, c7 et e7. Les Noirs abandonnent. })
20. Qe3 { La dame cherche un autre chemin (20.a5 était un peu plus précis). }
20... Nfd5 { Le meilleur coup : le cavalier bloque d5 et attaque la dame. }
21. Qe4 { Le meilleur coup : la dame se centralise et vise h7. }
21... g6 { Seul coup : 21...f5 ou 21...Nf6 perdaient (environ +4). }
22. Nxc6 { Les Blancs échangent le fou c6 (22.Qh4 était à peine meilleur). Ils gardent un petit avantage (environ +0,8), mais l'attaque directe est enrayée.

PRO TIP : avec le pion isolé, une tour en troisième rangée (d3, puis g3 ou h3) est une arme d'attaque redoutable. En défense, garde un œil sur la diagonale a8-h1 : un fou en c6 empêche la dame adverse de rejoindre f3. [%cal Gh3h7] } *`,
    ),
    chapter(
      "Le sacrifice sur f7 : Botvinnik – Batuev (Leningrad 1931)",
      "2rq1rk1/pb2nppp/1p2pn2/4N3/3P4/1BN2P2/PP2Q1PP/2RR2K1 w - - 0 18",
      `{ Toutes les pièces blanches sont idéalement placées : cavalier en e5, fou en b3 braqué sur e6 et f7, dame en e2, tours en c1 et d1. Quand les pièces sont aussi actives, il faut chercher une solution tactique. Les points sensibles du camp noir sont f7 et e6, toujours visés quand on joue avec le pion isolé. [%csl Rf7,Re6][%cal Gb3f7,Ge5f7] }
18. Nxf7! { Le seul coup fort : Stockfish donne +1,6, alors que tous les autres coups donnent un jeu égal. Le cavalier se sacrifie sur f7 pour ouvrir le roque. }
18... Rxf7 { Le meilleur : si 18...Kxf7, 19.Bxe6+ et le roi noir est en grand danger (environ +2,2). }
19. Qxe6 { La dame reprend un deuxième pion et attaque la tour f7, que seul le roi défend. Le fou b3 soutient la dame par derrière. [%cal Gb3e6,Ge6f7] }
19... Qf8 { Seul coup : la dame défend f7. }
20. Re1! { Le meilleur coup selon Stockfish (environ +2,6). La tour se place derrière la dame sur la colonne e : dès que la dame s'échangera en f7, elle visera le cavalier e7. }
(20. Ne4 { Le coup de la partie, moins précis (environ +1,5). } 20... Rxc1? { Il fallait 20...Rd8 ; après cette faute, l'avantage blanc devient décisif (environ +3,9). } 21. Rxc1 { La tour reprend et contrôle la colonne c. } 21... Nfd5 { Le cavalier bloque le fou b3. 21...Bc6 n'était pas meilleur. } 22. Nd6 { Le cavalier vise b7 et f7. } 22... Ba8 { Le fou se met à l'abri. } 23. Re1 { La tour cloue le cavalier e7 sur la colonne e. } 23... g6 { 23...h5 n'aurait rien changé. } 24. Nxf7 { Les Blancs récupèrent la qualité. } 24... Qxf7 { La dame reprend. } 25. Qxe7 { La dame prend le cavalier e7. Les Noirs abandonnent : après les échanges, la finale est perdue (environ +5). })
20... Re8 { Le meilleur coup : la tour c8 vient défendre e7. }
21. Qxf7+ { Les Blancs transforment leur attaque en avantage matériel. }
21... Qxf7 { Seul coup. }
22. Bxf7+ { Le fou reprend avec échec. }
22... Kxf7 { Les Blancs ont maintenant deux tours, un cavalier et six pions contre une tour, un fou, deux cavaliers et quatre pions, et leur avantage est net (environ +2,3).

PRO TIP : quand tes pièces sont au maximum de leur activité, cherche le sacrifice sur f7 ou e6. Le fou en b3 et le cavalier en e5 sont faits pour ça. En défense, ne laisse jamais f7 avec un seul défenseur. } *`,
    ),
    chapter(
      "Le blocus de d5 : Zukertort – Steinitz (championnat du monde 1886, 9e partie)",
      "r1bq1rk1/pp1nbppp/4pn2/8/3P4/1BN2N2/PP2QPPP/R1B2RK1 b - - 6 10",
      `{ Le premier champion du monde, Wilhelm Steinitz, a montré la méthode contre le pion isolé. Un : bloquer la case d5 avec une pièce. Deux : échanger les pièces, pour que les Blancs perdent leur potentiel d'attaque et que le pion devienne une simple faiblesse. [%csl Gd5,Rd4] }
10... Nb6 { Le cavalier part vers d5. Stockfish place 10...a5 à peine devant. [%cal Gb6d5] }
11. Bf4 { Le fou n'est pas idéal en f4 : Stockfish préférait 11.Rd1 (environ +0,7 contre +0,2). }
11... Nbd5 { Le blocus est installé : le cavalier d5 ne peut plus être chassé par un pion. [%csl Gd5] }
12. Bg3 { Le fou évite l'échange (12.Bg5 était meilleur). }
12... Qa5 { La dame sort et vise c3 (12...b6 était un peu plus précis). }
13. Rac1 { La tour soutient le cavalier c3 (13.Nxd5 était plus précis). }
13... Bd7 { Le fou se développe. }
14. Ne5 { Le cavalier s'installe en e5, sa case idéale. }
14... Rfd8 { La tour vise la colonne d, contre le pion isolé. }
15. Qf3 { La dame vise f7 (Stockfish préférait 15.f4). }
15... Be8! { Le dispositif de Steinitz : le fou en e8 défend f7 sans gêner la tour d8. C'est le meilleur coup. [%csl Ge8,Gf7] }
16. Rfe1 { La tour soutient e5. }
16... Rac8 { L'autre tour occupe la colonne c. }
17. Bh4 { Le fou propose l'échange des fous de cases noires. }
17... Nxc3! { Une idée importante : le cavalier d5 s'échange contre le cavalier c3. Le pion b qui reprend en c3 sera encore plus faible que le pion d4. }
18. bxc3 { Les Blancs reprennent. Le pion c3 est sur une colonne semi-ouverte, devant la tour c8. [%csl Rc3,Rd4] }
18... Qc7 { La dame se place sur la colonne c, contre c3 (18...Rc7 était un peu plus précis). }
19. Qd3 { La dame défend c3 et vise h7 (19.Bg3 était meilleur). }
19... Nd5 { Le cavalier f6 reprend le blocus en d5. }
20. Bxe7 { Les Blancs échangent les fous de cases noires. }
20... Qxe7 { La dame reprend. }
21. Bxd5 { Les Blancs donnent même leur bon fou contre le cavalier de blocus (21.c4 était plus précis). }
21... Rxd5 { La tour reprend et prend elle-même le rôle de bloqueur : en d5, elle attaque aussi le pion d4. [%csl Gd5] }
22. c4 { Les Blancs chassent la tour. Ils ont maintenant deux pions, c4 et d4, sans soutien. }
22... Rdd8 { La tour recule mais garde la colonne d. }
23. Re3 { La tour monte vers l'aile roi : les Blancs cherchent une attaque. }
23... Qd6 { La dame vise le pion d4. }
24. Rd1 { La tour défend d4. }
24... f6 { Le pion chasse le cavalier e5. }
25. Rh3 { La tour vise h7. }
25... h6 { Le meilleur coup : le pion ferme la colonne h. }
26. Ng4 { Le cavalier vise h6 et f6. }
26... Qf4 { La dame se met en face du cavalier et vise d4 (26...h5 était un peu plus précis). }
27. Ne3 { Le cavalier se replace. }
27... Ba4 { Le fou sort et attaque la tour d1. }
28. Rf3 { La tour attaque la dame f4. }
28... Qd6 { La dame retourne en d6, sur d4. }
29. Rd2 { La tour défend d4 une deuxième fois. }
29... Bc6 { Le fou vise g2 et la case e4. }
30. Rg3 { Les Blancs insistent à l'aile roi (30.d5 était plus précis). }
30... f5 { Le meilleur coup. Le pion ferme toute attaque, et le fou noir aura la case e4. Les pions c4 et d4 sont faibles et les Noirs sont mieux (environ −0,9). Steinitz gagnera la partie.

PRO TIP : contre le pion isolé, mets une pièce en d5 et échange. Si un échange crée une nouvelle faiblesse (comme le pion c3 ici), c'est encore mieux. [%csl Gd5,Rc4,Rd4] } *`,
    ),
    chapter(
      "Échanger les fous de cases noires : Korchnoi – Karpov (Merano 1981, 9e partie)",
      "r1bq1rk1/pp2bpp1/2n1pn1p/8/2BP3B/2N2N2/PP3PPP/2RQ1RK1 b - - 2 11",
      `{ Une des parties les plus célèbres jouées contre le pion isolé. Karpov va suivre deux idées : échanger les fous de cases noires, puis échanger les pièces une par une, jusqu'à ce que le pion d4 soit une faiblesse sans compensation. }
11... Nh5! { La nouveauté de Karpov. Le cavalier quitte f6 et démasque le fou e7 : l'échange des fous de cases noires devient inévitable. Stockfish place 11...b6 à peine devant, les deux sont sains. [%cal Ge7h4] }
12. Bxe7 { Les Blancs échangent. }
12... Nxe7 { Le cavalier reprend. Il pourra aller en f6 ou en d5. }
13. Bb3 { Les Blancs gardent leur bon fou de cases blanches (13.Ne5 était un peu plus précis). }
13... Nf6 { Le cavalier revient contrôler d5 : la rupture d4-d5 n'est plus possible. [%csl Gd5] }
14. Ne5 { Le cavalier s'installe en e5. }
14... Bd7 { Le fou se développe. }
15. Qe2 { La dame se rapproche. }
15... Rc8 { La tour occupe la colonne c. }
16. Ne4 { Une imprécision : les Blancs proposent eux-mêmes un échange (16.Rfe1 ou 16.h3 étaient meilleurs). Avec le pion isolé, on n'échange pas sans raison. }
16... Nxe4 { Karpov accepte : un échange de plus. }
17. Qxe4 { La dame reprend. }
17... Bc6 { Le fou propose un autre échange. }
18. Nxc6 { Les Blancs échangent. }
18... Rxc6 { La tour reprend. Il reste aux Blancs leur fou b3 et le pion d4 isolé, aux Noirs un cavalier et une structure saine. }
19. Rc3 { La tour défend la troisième rangée. }
19... Qd6 { La dame vise d4. }
20. g3 { Les Blancs donnent de l'air au roi. }
20... Rd8 { La tour attaque d4 à son tour. }
21. Rd1 { La tour défend d4. }
21... Rb6! { Un coup très fin. La tour ne s'échange pas sur la colonne c : elle passe en b6, d'où elle vise b2 et pourra revenir en d6. Plus il y a de tours, plus le pion d4 est attaqué. }
22. Qe1 { La dame défend la première rangée et surveille b4 (22.h4 était un peu plus précis). }
22... Qd7 { La dame prépare ...Rd6. }
23. Rcd3 { La tour revient défendre d4. }
23... Rd6 { Trois pièces noires sur la colonne d contre le pion isolé. }
24. Qe4 { La dame revient au centre. }
24... Qc6 { La dame propose l'échange : s'il a lieu, le pion d4 sera encore plus faible. }
25. Qf4 { Les Blancs refusent (25.Qe5 se valait). }
25... Nd5 { Le cavalier s'installe enfin en d5, le poste de blocus. [%csl Gd5] }
26. Qd2 { La dame défend d4. }
26... Qb6 { La dame attaque d4 et b2, et menace ...Nb4. }
27. Bxd5 { Les Blancs donnent leur bon fou (27.a3 était plus précis). }
27... Rxd5 { La tour reprend et bloque d5. Les Noirs ont un avantage durable (environ −0,8). Karpov gagnera la partie en attaquant d4 et b2.

PRO TIP : contre le pion isolé, l'échange des fous de cases noires est souvent la clé. Sans lui, les Blancs perdent leur fou d'attaque, et les cases devant le pion (d5, c5, e5) deviennent plus faciles à contrôler. } *`,
    ),
    chapter(
      "Vers la finale : Regedzinski – Rubinstein (Lodz 1917)",
      "r2q1rk1/1b1nbppp/p3pn2/1p4B1/3P4/2NB1N2/PP2QPPP/3R1RK1 b - - 0 13",
      `{ Rubinstein était un expert des positions contre le pion isolé. Son plan : échanger les pièces mineures, bloquer d5, puis passer en finale, où le pion d4 n'a plus aucun soutien. }
13... Nb6 { Le cavalier vise d5 (13...h6 était à peine meilleur). }
14. Ne4 { Les Blancs proposent un échange, ce qui aide les Noirs (14.Bb1 ou 14.Rfe1 étaient meilleurs). }
14... Nxe4 { Les Noirs échangent. }
15. Bxe7 { Les Blancs échangent les fous de cases noires. }
15... Qxe7 { La dame reprend. }
16. Bxe4 { Le fou reprend en e4. }
16... Rfd8 { La tour attaque d4. }
17. Rd3 { La tour défend d4 (17.Rfe1 était meilleur). }
17... Bxe4 { Les Noirs échangent le dernier fou blanc. }
18. Qxe4 { La dame reprend. Il ne reste qu'un cavalier à chaque camp, plus les tours et les dames. }
18... Rac8 { La tour occupe la colonne c ouverte. }
19. Rfd1 { L'autre tour défend d4. }
19... Nd5 { Le cavalier s'installe en d5. Le blocus est permanent et les Noirs ont la colonne c. [%csl Gd5] }
20. R3d2 { La tour se replace. }
20... Nf6 { Le cavalier attaque la dame. }
21. Qe3 { La dame recule. }
21... Qb7 { La dame vise la grande diagonale. }
22. h3 { Les Blancs donnent de l'air au roi. }
22... h6 { Les Noirs aussi. }
23. Re2 { La tour défend la deuxième rangée. }
23... Qd5 { La dame bloque d5. En finale, toutes les pièces sont fortes sur cette case. [%csl Gd5] }
24. b3 { Les Blancs protègent c4 (24.a3 était meilleur). }
24... Qd6 { La dame revient viser le pion d4. }
25. Rc1 { La tour conteste la colonne c. }
25... Nd5 { Le cavalier revient en d5. }
26. Qd2 { La dame défend d4. }
26... Qf4! { La dame propose l'échange dans les meilleures conditions. Si 27.Qxf4?, le cavalier reprend en f4 et menace e2 : Stockfish ne retient même pas ce coup parmi ses trois meilleurs. [%cal Gf4d2] }
27. Rc2 { Le meilleur coup. }
27... Qxd2 { Les dames s'échangent. }
28. Rexd2 { La tour reprend. }
28... Rxc2 { Les Noirs échangent une paire de tours. }
29. Rxc2 { La tour reprend. }
29... Nb4 { Le cavalier attaque la tour c2 et le pion a2, qui va tomber. Les Noirs ont un net avantage (environ −1,0), et Rubinstein gagnera la finale.

PRO TIP : contre le pion isolé, va vers la finale. Chaque échange retire aux Blancs des pièces d'attaque, et en finale le pion isolé ne peut être défendu que par des pièces, qui deviennent passives. } *`,
    ),
    chapter(
      "Le blocus par le roi en finale : Marshall – Chigorin (1905)",
      "8/5kpp/p4p2/1p6/2rP1P2/P3K1P1/1R5P/8 b - - 0 39",
      `{ Une finale de tours. Le pion d4 est isolé, et seule la tour b2 peut le défendre. En finale, le meilleur bloqueur de la case d5 est souvent le ROI : il ne craint pas les échecs de face et il soutient l'attaque sur le pion. [%csl Rd4,Gd5] }
39... Ke6 { Le meilleur coup (environ −2,1). Le roi part vers d5. Le gourmand 39...Rc3+ ne donnait qu'environ −1,0 : après 40.Ke4, le roi blanc devient actif. [%cal Gf7d5] }
40. Rb3 { La tour se replie (40.Re2 résistait mieux). }
40... Kd5 { Le roi bloque d5 et attaque d4. [%csl Gd5] }
41. Rd3 { La tour défend d4. }
41... f5 { Le pion prend la case e4 au roi blanc. Les Blancs n'ont plus de bons coups. }
42. h3 { Une attente (42.Kf3 était un peu plus précis). }
42... h5 { Les Noirs aussi attendent (42...g6 était un peu meilleur). }
43. Ke2 { Le roi blanc doit quitter la défense de d4. }
43... Rxd4 { Le pion isolé tombe. Les Noirs ont un pion de plus et une position gagnante (environ −3,6).

PRO TIP : en finale contre un pion isolé, mets ton roi devant lui. Il bloque le pion, attaque ses défenseurs et ne peut pas être chassé. } *`,
    ),
    chapter(
      "Un pion isolé sans son bon fou : Vitiugov – Bologan (Eilat 2012)",
      "r2r2k1/pb1nqpp1/1p3n1p/3p4/3R4/P1N1PP2/1PQ2BPP/4KB1R b K - 1 17",
      `{ Les rôles sont inversés : ce sont les Noirs qui ont le pion isolé, en d5. Mais ils ont échangé leur fou de cases noires dès l'ouverture. Or le « bon fou » du camp au pion isolé (celui qui n'est pas de la couleur du pion) crée normalement des menaces vers le roi adverse. Sans lui, il n'y a presque pas de contre-jeu.

Le dispositif blanc est idéal : pions e3 et f3, qui prennent e4 aux cavaliers noirs, fou en f2 et bientôt un cavalier en d4. [%csl Rd5,Gd4,Ge4] }
17... Nc5 { Le meilleur coup : le cavalier part vers e6. }
18. Be2 { Développement. }
18... Ne6 { Le cavalier attaque la tour d4. }
19. Rd2 { La tour recule. }
19... a6 { Une perte de temps. Stockfish préférait 19...d4!, qui se débarrasse du pion isolé (environ +0,4 contre +0,7). }
20. O-O { Les Blancs roquent. }
20... b5 { Le pion prend de l'espace. }
21. Rfd1 { L'autre tour vise d5. Le pion isolé est attaqué deux fois et ...d4 n'est plus possible. }
21... Rac8 { La tour occupe la colonne c (21...b4 était un peu plus précis). }
22. Qb1 { La dame libère la colonne c (22.Qb3 était plus précis). }
22... Nc5 { Le cavalier cherche c4. }
23. Bf1 { Le fou libère e2 pour le cavalier. }
23... Nb3 { Le cavalier attaque la tour d2. }
24. Rc2 { La tour se décale. }
24... Na5 { Le cavalier vise c4. }
25. Ne2 { Le cavalier se dirige vers d4. }
25... Rxc2 { Les Noirs échangent. }
26. Qxc2 { La dame reprend. }
26... Rc8 { La tour reprend la colonne c. }
27. Qb1 { La dame recule. }
27... Nc4 { Le cavalier s'installe en c4 et attaque e3. }
28. Nd4 { Le cavalier blanc atteint d4 : il bloque le pion d5 et contrôle c6, e6, b5 et f5. [%csl Gd4] }
28... Qe5 { La dame se centralise. }
29. Rd3 { La tour monte en troisième rangée. }
29... Nfd7 { Le cavalier se replace (29...Ne8 était un peu plus précis). }
30. Rc3 { La tour attaque sur la colonne c, et b2-b3 va chasser le cavalier c4 (environ +1,1). [%cal Gc3c8] }
30... Nf8 { La meilleure défense selon Stockfish (environ +1,0). Le cavalier vise e6 pour échanger le cavalier d4. }
(30... Re8?! { Le coup de la partie abandonne la colonne c (environ +1,9). } 31. Qc1 { La dame occupe la colonne c (31.b3 était un peu plus précis). } 31... Nf8 { Le cavalier se replace. } 32. b3 { Le pion chasse le cavalier c4. } 32... Nb6 { Le cavalier recule. } 33. Bg3 { Le fou attaque la dame e5. } 33... Qf6 { La dame recule (33...Qg5 tenait mieux). } 34. Rc7 { La tour entre en septième rangée et attaque le fou b7. } 34... Ba8 { Le fou se cache, mais cela facilite la tâche des Blancs. } 35. Ra7 { La tour attaque a6, et les pions a6 et b5 vont tomber. Les Blancs gagneront la partie. })
31. Qc1 { La dame occupe la colonne c. }
31... Ne6 { Le cavalier vient contester le cavalier d4. }
32. b3 { Le pion chasse le cavalier c4. }
32... Nb6 { Le cavalier recule. Les Blancs gardent un avantage stable (environ +0,9) : les Noirs défendent d5 sans aucun contre-jeu.

PRO TIP : avant d'accepter un pion isolé, vérifie que tu as encore ton bon fou, celui qui n'est pas de la couleur de ton pion. Sans lui, le pion isolé n'apporte presque plus de jeu d'attaque. Il ne reste que la faiblesse. } *`,
    ),
  ],
};
