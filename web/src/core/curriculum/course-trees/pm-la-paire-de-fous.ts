import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « La paire de fous » (positional_mastery, module 17) — format « un
 * commentaire par coup » du 2026-10-12.
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, entièrement
 * réécrite ici) : Bondarevsky – Smyslov (1946), Rosenthal – Steinitz (1873),
 * Janowsky – Capablanca (1916, aussi dans `PILOT_pm-la-paire-de-fous.pgn`),
 * Aganalian – Petrosian (1945) et Blackburne – Weiss (1889), telles que
 * présentées dans « The Most Instructive Games of Chess Ever Played » de
 * Chernev (`chernev1.pgn`), plus Hannah – Paulsen (Londres 1862, `ch_63.pgn`),
 * la partie que Chernev cite comme la première démonstration de la paire de
 * fous. Aucune partie de Kasparov ou de Kramnik sur ce thème n'est disponible
 * dans les bases locales ; aucun coup n'a été inventé pour les remplacer.
 *
 * Plan : définition — l'échange différé de l'Espagnole (1) ; Hannah – Paulsen :
 * deux fous contre deux cavaliers sans cases (2) ; Rosenthal – Steinitz :
 * obtenir la paire (3), la méthode de restriction (4), la percée (5) ;
 * Janowsky – Capablanca : la manœuvre ...Na5-c4 (6), ouvrir la diagonale puis
 * rendre le fou (7) ; Bondarevsky – Smyslov : les pions chassent les cavaliers
 * (8), rendre un fou pour gagner un pion (9) ; Aganalian – Petrosian : rendre
 * les fous au bon moment (10) ; Blackburne – Weiss : deux fous en finale (11),
 * puis fous de même couleur et finale de pions (12).
 *
 * Toutes les lignes ont été rejouées avec chess.js et chaque coup sondé avec
 * Stockfish 18 (profondeur 18, 3 candidats par coup), suites du moteur
 * comprises. Règle appliquée : quand un coup perd environ 0,5 pion ou plus
 * par rapport au choix du moteur, la LIGNE PRINCIPALE suit le moteur et la
 * suite de la partie passe en variante, signalée comme fautive. Exception :
 * dans une position déjà décisive (plus de 3 pions environ), un écart est
 * seulement signalé dans le commentaire. Plusieurs chapitres commencent donc
 * après une imprécision signalée dans l'introduction. Les évaluations citées
 * sont du point de vue des Blancs. Aucun résultat de partie (1-0, 0-1…) dans
 * les variantes : le parseur s'y arrêterait.
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

export const LA_PAIRE_DE_FOUS: CourseTree = {
  chapters: [
    chapter(
      "Définition : deux fous contre fou et cavalier (l'Espagnole d'échange)",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      `{ Avoir la PAIRE DE FOUS, c'est garder ses deux fous quand l'adversaire a perdu au moins un des siens (il lui reste fou + cavalier, ou deux cavaliers).

Pourquoi est-ce un avantage ? Un fou seul ne voit que les cases d'une couleur. Deux fous ensemble couvrent les cases blanches ET les cases noires : aucune case n'échappe à leur contrôle. De plus, un fou agit de loin, d'un bout à l'autre de l'échiquier, alors qu'un cavalier a besoin d'une case d'appui proche de l'action.

Trois règles à retenir :
- la paire de fous est plus forte quand la position est OUVERTE (peu de pions au centre, diagonales libres) ;
- elle gagne en valeur dans la FINALE, quand le roi adverse ne peut plus se cacher derrière ses pièces ;
- celui qui joue CONTRE la paire cherche à fermer la position et à installer ses cavaliers sur des cases protégées par des pions.

Cette partie, Bondarevsky – Smyslov (championnat d'URSS 1946), montre comment la paire naît dès l'ouverture : en prenant le cavalier c6, les Blancs donnent un fou et doublent les pions noirs. Les Noirs reçoivent la paire de fous en échange.

PRO TIP : avant d'échanger un fou contre un cavalier, demande-toi si la position va s'ouvrir. Si oui, tu offres à ton adversaire l'arme la plus durable des finales. }
1. e4 { Le pion roi prend le centre et libère le fou f1 et la dame. Le meilleur coup. }
1... e5 { Les Noirs prennent leur part du centre. Presque aussi bon que 1...c6. }
2. Nf3 { Le cavalier se développe et attaque le pion e5. Le meilleur coup. }
2... Nc6 { Le cavalier défend e5. Le meilleur coup. }
3. Bb5 { La partie Espagnole : le fou attaque le cavalier qui défend e5. Le meilleur coup. }
3... a6 { Les Noirs demandent tout de suite au fou de choisir : reculer ou prendre. Presque aussi bon que 3...Nf6. }
4. Ba4 { Le fou garde le contact avec le cavalier c6. Le meilleur coup. }
4... Nf6 { Le cavalier se développe et attaque le pion e4. Le meilleur coup. }
5. O-O { Le roi blanc se met à l'abri ; le pion e4 est défendu indirectement. Le meilleur coup. }
5... Be7 { Le fou se développe et prépare le roque. 5...Nxe4 était un peu plus actif, l'écart est minime. }
6. Bxc6 { L'ÉCHANGE DIFFÉRÉ. Les Blancs donnent leur fou contre le cavalier : désormais les Noirs auront deux fous contre un fou et deux cavaliers. Stockfish préfère 6.Re1 (+0,4 contre +0,15), l'écart reste faible. [%cal Ga4c6] }
6... dxc6 { Le pion d reprend VERS le centre. Il ouvre la colonne d et la diagonale du fou c8. Les pions c sont doublés, c'est le prix de la paire de fous. Le meilleur coup. [%csl Gc8,Ge7] }
7. Re1 { La tour protège le pion e4. Presque aussi bon que 7.d3. }
7... Nd7 { Le cavalier recule pour aller en c5, d'où il visera e4. Le meilleur coup. }
8. d4 { Les Blancs ouvrent le centre tout de suite. Presque aussi bon que 8.c3. }
8... exd4 { Les Noirs prennent : le centre s'ouvre, ce qui convient aux deux fous. Le meilleur coup. }
9. Qxd4 { La dame reprend et se centralise. Le meilleur coup. }
9... O-O { Les Noirs roquent. Le meilleur coup. }
10. Bf4 { Le fou se développe et vise le pion c7. Aussi bon que 10.Nc3 selon Stockfish. [%cal Gf4c7] }
10... Nc5 { Le cavalier arrive en c5 et attaque le pion e4. Presque aussi bon que 10...g5. [%cal Gc5e4] }
11. Qxd8 { Les Blancs échangent les dames. Sans dames, la finale arrive plus vite : c'est la phase où la paire de fous est la plus dangereuse. Presque aussi bon que 11.Qe3. }
11... Bxd8 { Le fou reprend. 11...Rxd8 aurait laissé le pion c7 à 12.Bxc7. Le meilleur coup. }
12. Nc3 { Le cavalier protège le pion e4. Le meilleur coup. }
12... f5 { Smyslov attaque le pion e4 pour ouvrir des lignes à ses fous. Presque aussi bon que 12...Re8. [%cal Gf5e4] }
13. exf5 { LE MEILLEUR COUP selon Stockfish (0,0). En prenant, les Blancs gardent une structure saine : pas de pion fixé sur une case noire, pas de case faible à céder au cavalier noir. } 13... Bxf5 { Le fou c8 reprend et se place sur la diagonale b1-h7, d'où il vise le pion c2. Le meilleur coup. [%cal Gf5c2] } 14. Rac1 { La tour a1 vient protéger le pion c2. Un des meilleurs coups. } 14... a5 { Le pion a avance pour gagner de l'espace à l'aile dame. Un des meilleurs coups.

Bilan : position équilibrée. Les Noirs ont la paire de fous, les Blancs une meilleure structure de pions. } (13. e5 { LE COUP DE LA PARTIE, imprécis (0,0 → -0,85). Le pion e5 gagne de l'espace, mais il devient une cible fixée sur une case noire. Il laisse aussi aux Noirs la case e6 pour le cavalier et la poussée ...f4 plus tard. } 13... Ne6 { LE CAVALIER S'INSTALLE en e6 avec gain de temps : il attaque le fou f4. Les pions noirs f5 et g5 (après ...g5) vont maintenant chasser les pièces blanches. Le meilleur coup.

Bilan : les Noirs ont la paire de fous ET des cases sûres pour leurs pièces (-0,85). La suite de la partie est étudiée aux chapitres 8 et 9. [%cal Ge6f4] })`,
    ),
    chapter(
      "Hannah – Paulsen 1862 : deux fous contre deux cavaliers sans cases",
      "8/8/1ppk1b2/p2p1bpp/3P1p2/2PN1P2/PP2K1PP/5N2 b - - 3 28",
      `{ Hannah – Paulsen, Londres 1862. Chernev présente cette partie comme la première démonstration claire de la force des deux fous. Elle a été jouée onze ans avant la célèbre partie de Steinitz (chapitres 3 à 5).

Regarde les pièces mineures :
- les fous noirs f5 et f6 contrôlent de longues diagonales sur les deux couleurs ;
- les cavaliers blancs d3 et f1 cherchent une case d'appui, mais chaque case centrale est contrôlée par un pion ou un fou noir (c4, e4, e5, g4...).

Avant cette position, les deux camps ont commis des imprécisions selon Stockfish : 16.Ne4 (16.Nc4 était meilleur), 19.Ngf1, puis 21...d5 et 23...Rxe1 côté noir, enfin 28.Nd3 (28.h3 était meilleur). Malgré tout, les Noirs gardent un avantage net (-1,5).

PRO TIP : contre des cavaliers, avance tes pions pour leur PRENDRE les cases d'appui. Un cavalier sans case solide ne vaut plus grand-chose. }
28... c5 { Le pion c attaque le pion d4 une deuxième fois, avec le fou f6. Les Noirs ouvrent des lignes pour leurs fous. Le meilleur coup. [%cal Gc5d4,Gf6d4] }
29. dxc5+ { Les Blancs prennent avec échec. Presque aussi bon que 29.Nd2. }
29... bxc5 { Le pion reprend vers le centre. Les pions c5 et d5 contrôlent les cases b4, c4, d4 et e4 : les cavaliers ne peuvent plus s'y poser. Le meilleur coup. [%csl Gb4,Gc4,Gd4,Ge4] }
30. Kd2 { Le roi se rapproche de l'aile dame. L'écart avec le meilleur coup (30.Nc1) est faible. }
30... c4 { Le pion attaque le cavalier d3 et le chasse. Aussi bon que 30...a4 selon Stockfish. [%cal Gc4d3] }
31. Nf2 { LE MEILLEUR COUP (-2,0). Le cavalier recule en f2, d'où il garde au moins les cases e4 et g4. } 31... Kc6 { Le roi noir se rapproche de l'aile dame. Un des meilleurs coups. } 32. Ke1 { Le roi blanc protège le cavalier f2 et la case d2. Un des meilleurs coups. } 32... Bb1 { Le fou blanc des Noirs attaque le pion a2 : la paire de fous trouve des cibles sur les deux ailes. Un des meilleurs coups.

Bilan : même avec le meilleur coup, les Blancs restent nettement moins bien (-2,0). [%cal Gb1a2] } (31. Nc1 { LE COUP DE LA PARTIE, une faute (-2,1 → -3,0). Le cavalier recule sur la première rangée : les deux cavaliers blancs, en c1 et f1, n'ont plus aucune case active. [%csl Rc1,Rf1] } 31... g4 { Le pion g attaque f3 pour ouvrir l'aile roi aux fous. Stockfish préférait 31...a4 (-3,0 contre -2,2), qui fixait d'abord l'aile dame. [%cal Gg4f3] } 32. Ke1 { LE MEILLEUR COUP (-2,3). Le roi protège la case f2 et reste près de ses cavaliers. } 32... gxf3 { Le pion prend en f3 et ouvre la colonne g. Un des meilleurs coups. } 33. gxf3 { Le pion reprend. Le meilleur coup.

Bilan : les Blancs résistent encore, mais leurs cavaliers restent sans case (-2,3). } (32. Ke2 { LE COUP DE LA PARTIE, une nouvelle faute (-2,3 → -3,3). Le roi s'éloigne de la case f2. } 32... a4 { Le pion a avance : il prend la case b3 aux cavaliers blancs et fixe le pion b2. Le meilleur coup. [%csl Gb3] } 33. a3 { Le pion a bloque l'avance ...a3. Stockfish préférait 33.Nd2, l'écart est faible. } 33... Kc5 { Le roi noir vient soutenir la poussée ...d4. Stockfish préférait 33...d4 tout de suite (-4,1 contre -2,2), mais la position reste gagnante.

Bilan : les fous noirs contrôlent tout l'échiquier, les cavaliers blancs ne trouvent aucune case. Dans la partie, Paulsen a gagné une pièce quelques coups plus tard (37...Bh4+), puis la partie. [%csl Gd4] }))`,
    ),
    chapter(
      "Rosenthal – Steinitz 1873 : obtenir la paire de fous",
      "r1bq1rk1/ppp1npbp/3p2p1/n7/3NPP2/2NBB3/PPP3PP/R2Q1RK1 b - - 2 10",
      `{ Rosenthal – Steinitz, Vienne 1873. C'est l'exemple le plus célèbre du XIXe siècle : Steinitz y montre comment deux fous dominent un fou et un cavalier.

Avant cette position, plusieurs coups étaient imprécis selon Stockfish : 3...g6 (3...Nf6 était meilleur), 7.Bc4 et 8.O-O (7.Qd2 puis le grand roque étaient plus forts), 7...d6 et 9...Na5 (9...d5 tout de suite). Le dernier, 10.Bd3, est une vraie faute : 10.Be2 gardait +0,9. Maintenant les Noirs sont légèrement mieux.

Regarde le centre blanc : les pions e4 et f4 ont l'air forts, mais ils laissent le fou e3 sans protection et le cavalier d4 sur la grande diagonale du fou g7.

PRO TIP : pour obtenir la paire de fous, place un cavalier sur une case où l'adversaire voudra le prendre avec un fou. C'est exactement ce que fait Steinitz au coup 14. }
10... d5 { LA POUSSÉE LIBÉRATRICE. Le pion attaque e4 et ouvre la colonne d. Le meilleur coup. [%cal Gd5e4] }
11. exd5 { Les Blancs prennent. Aussi bon que 11.f5 selon Stockfish. }
11... Nxd5 { Le cavalier reprend et attaque le cavalier c3 et le fou e3, qui n'est pas protégé. Le meilleur coup. [%cal Gd5c3,Gd5e3] }
12. Nxd5 { Les Blancs échangent le cavalier attaquant. Le meilleur coup. }
12... Qxd5 { La dame reprend et se centralise : elle vise a2, g2 et le cavalier d4. Le meilleur coup. [%cal Gd5d4,Gd5g2] }
13. c3 { Le pion consolide le cavalier d4. Presque aussi bon que 13.Nb5. }
13... Rd8 { La tour prend la colonne d et met la pression sur d4 et sur le fou d3. Presque aussi bon que 13...b6. [%cal Gd8d4] }
14. Qc2 { La dame protège le fou d3. Le meilleur coup. }
14... Nc4 { L'APPÂT. Le cavalier attaque le fou e3 et le pion b2. Si le fou d3 le prend, les Noirs auront la paire de fous. L'écart avec le meilleur coup (14...Re8) est faible. [%cal Gc4e3,Gc4b2] }
15. Bxc4 { Rosenthal prend le cavalier et donne la paire de fous aux Noirs. 15.Bf2 était plus précis (0,0 contre -0,4), sans être une faute nette. }
15... Qxc4 { La dame reprend. Les Noirs ont maintenant deux fous (c8 et g7) contre un fou et un cavalier. Le fou g7 vise d4 sur la grande diagonale, la dame attaque a2, c3 et f1. Le meilleur coup.

Bilan : la position est presque égale (-0,4), mais les Noirs ont un avantage DURABLE. Les chapitres suivants montrent comment Steinitz l'exploite. [%cal Gg7d4,Gc4a2] }`,
    ),
    chapter(
      "Janowsky – Capablanca 1916 : la manœuvre qui gagne la paire",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      `{ Janowsky – Capablanca, New York 1916. Une finale sans dames qui paraît très égale. Capablanca va pourtant créer la paire de fous par une manœuvre préparée dix coups à l'avance.

Le plan noir, à suivre coup après coup :
1. reculer le fou c8 en d7 pour soutenir la poussée ...b5 ;
2. installer un cavalier en c4, protégé par le pion b5 ;
3. si les Blancs prennent ce cavalier avec un fou, les Noirs reprennent et obtiennent la paire de fous.

PRO TIP : un cavalier sur une case avancée et protégée oblige souvent l'adversaire à le prendre avec un fou. C'est une façon classique de gagner la paire de fous. }
1. d4 { Le pion dame prend le centre. Presque aussi bon que 1.e4. }
1... Nf6 { Le cavalier contrôle e4. Le meilleur coup. }
2. Nf3 { Le cavalier se développe. Le meilleur coup. }
2... d5 { Le pion d prend sa part du centre. Le meilleur coup. }
3. c4 { Le Gambit Dame : le pion c attaque d5. Le meilleur coup. }
3... c6 { La Défense slave : le pion c soutient d5. Presque aussi bon que 3...e6. }
4. Nc3 { Le cavalier ajoute une pression sur d5. Presque aussi bon que 4.e3. }
4... Bf5 { Le fou sort avant ...e6. Stockfish préférait 4...e6 ou 4...dxc4 (+0,35 contre +0,7) : le fou parti, le pion b7 devient une cible. }
5. Qb3 { La dame attaque le pion b7, que le fou c8 ne protège plus. Presque aussi bon que 5.cxd5. [%cal Gb3b7] }
5... Qb6 { La dame défend b7 et propose l'échange des dames. Le meilleur coup. }
6. c5 { LE MEILLEUR COUP selon Stockfish (+0,7). Le pion attaque la dame et gagne de l'espace à l'aile dame. [%cal Gc5b6] } 6... Qxb3 { Les dames s'échangent. Un des meilleurs coups. } 7. axb3 { Le pion a reprend vers le centre et ouvre la colonne a à la tour a1. Un des meilleurs coups. } 7... a6 { Le pion a empêche le cavalier c3 de venir en b5. Un des meilleurs coups.

Bilan : les Blancs gardent un net avantage d'espace (+0,7). } (6. Qxb6 { LE COUP DE LA PARTIE, imprécis (+0,7 → 0,0). En échangeant tout de suite, Janowsky offre la colonne a ouverte aux Noirs. } 6... axb6 { Le pion reprend vers le centre et ouvre la colonne a à la tour a8. Les pions b sont doublés, mais ils contrôlent les cases a5 et c5. Le meilleur coup. } 7. cxd5 { Les Blancs prennent en d5. Le meilleur coup. } 7... Nxd5 { Le cavalier reprend et attaque le cavalier c3. Le meilleur coup. } 8. Nxd5 { Les cavaliers s'échangent. Presque aussi bon que 8.e4. } 8... cxd5 { Le pion reprend : la colonne c s'ouvre aussi. Les tours noires auront deux colonnes ouvertes, a et c. Le meilleur coup. } 9. e3 { Le pion libère le fou f1. Presque aussi bon que 9.Bf4. }
9... Nc6 { Le cavalier se développe et vise d4. Le meilleur coup. }
10. Bd2 { Le fou se développe. Le meilleur coup. }
10... Bd7 { LE COUP-CLÉ. Le fou recule pour soutenir la future poussée ...b5, qui préparera ...Nc4. Stockfish préférait 10...h5 (+0,1 contre +0,4), l'écart reste modéré. [%cal Gd7b5] }
11. Be2 { Le fou se développe. 11.Ne5, qui attaquait tout de suite le fou d7, était plus actif (+0,4 contre 0,0). }
11... e6 { Le pion libère le fou f8. Le fou d7 garde la diagonale vers b5. Presque aussi bon que 11...f6. }
12. O-O { Le roi blanc se met à l'abri. 12.Ne5 restait un peu plus actif. }
12... Bd6 { Le fou se développe sur une belle diagonale et vise h2. Aussi bon que 12...f6. [%cal Gd6h2] }
13. Rfc1 { La tour prend la colonne c et attaque le cavalier c6. L'écart avec le meilleur coup (13.Bc3) est minime. }
13... Ke7 { Sans dames, le roi est une pièce active : il se centralise et protège le fou d7. Aussi bon que 13...f6. }
14. Bc3 { Le fou se place sur la grande diagonale. Presque aussi bon que 14.g3. }
14... Rhc8 { La tour h8 vient aussi sur la colonne c. Presque aussi bon que 14...f6. }
15. a3 { Le pion empêche ...Nb4. Mais la case b3 n'est plus protégée par un pion : le cavalier noir pourra un jour viser b3 et c4. Presque aussi bon que 15.h4. [%csl Rb3] }
15... Na5 { Le cavalier part vers c4 et b3. Aussi bon que 15...Na7 selon Stockfish. [%cal Ga5c4,Ga5b3] }
16. Nd2 { Le cavalier couvre les cases b3 et c4. Le meilleur coup. }
16... f5 { Le pion empêche la poussée e4, qui aurait ouvert le jeu pour les Blancs. Un peu moins précis que 16...Rc7, l'écart est faible. }
17. g3 { Le pion protège f4. 17.f4 était un peu plus précis. }
17... b5 { Le pion b avance, protégé par le fou d7, et soutient la case c4. Le meilleur coup. [%cal Gb5c4] }
18. f3 { Les Blancs préparent e4. Imprécis selon Stockfish (18.Kf1 gardait l'égalité), car le pion e3 n'est plus protégé par le pion f2. }
18... Nc4 { LE CAVALIER S'INSTALLE en c4. Il attaque a3, b2, le cavalier d2 et le pion e3. Le meilleur coup. [%cal Gc4e3,Gc4b2] }
19. Bxc4 { Janowsky prend le cavalier avec son fou. Presque aussi bon que 19.Kf2. }
19... bxc4 { Le pion reprend. Les Noirs ont maintenant DEUX FOUS (d6 et d7) contre un fou et un cavalier, et les pions b6 et c4 ne sont plus doublés sur la même colonne. Le meilleur coup.

Bilan : Stockfish ne donne qu'un petit avantage aux Noirs (-0,4), mais il est durable. Le fou d7 semble passif derrière ses pions : le chapitre 7 montre comment Capablanca lui ouvre la route. [%csl Gd6,Gd7] })`,
    ),
    chapter(
      "Janowsky – Capablanca : ouvrir la diagonale, puis rendre le fou",
      "r7/3bbk2/4p2p/1p1pPp2/2pP1Pr1/P1B2K2/1P4NP/1R4R1 b - - 4 31",
      `{ Suite de Janowsky – Capablanca (chapitre 6). Les Noirs ont toujours la paire de fous (d7 et e7) contre le fou c3 et le cavalier g2.

Le problème du fou d7 : il est enfermé derrière ses propres pions d5, e6 et f5. Le plan de Capablanca : sacrifier le pion b pour ouvrir la diagonale a4-e8, puis amener le fou en c2 et en e4, une case blanche qu'aucun pion blanc ne peut attaquer.

Avant cette position, Stockfish juge imprécis 28...gxf4 (28...Kg7 était meilleur), puis 30.Ng2 et 31.Rg1 côté blanc. Les Noirs sont mieux (-1,2).

PRO TIP : un fou enfermé derrière ses pions n'est pas perdu. Cherche une rupture de pions qui lui ouvre une diagonale, même au prix d'un pion. }
31... Rag8 { La tour a8 rejoint l'autre tour sur la colonne g, face au cavalier g2. Le meilleur coup. [%cal Gg8g2] }
32. Be1 { Le fou se dirige vers g3 ou h4. Presque aussi bon que 32.Kf2. }
32... b4 { LA RUPTURE. Le pion b attaque a3 pour ouvrir la diagonale du fou d7. Un peu moins précis que 32...Be8 selon Stockfish, mais l'idée est la bonne. [%cal Gb4a3,Gd7a4] }
33. axb4 { Les Blancs prennent. Le meilleur coup. }
33... Ba4 { LE FOU SORT enfin par a4. Il vise la case c2, puis e4. Le meilleur coup. [%cal Ga4c2] }
34. Ra1 { La tour attaque le fou a4. Le meilleur coup. }
34... Bc2 { Le fou s'échappe en c2, d'où il vise e4. Le meilleur coup. [%cal Gc2e4] }
35. Ra7 { LE MEILLEUR COUP selon Stockfish (-0,5). La tour entre en 7e rangée et attaque le fou e7 tout de suite. [%cal Ga7e7] } 35... Be4+ { Le fou s'installe en e4 avec échec. Un des meilleurs coups. } 36. Ke3 { Le roi se centralise. Un des meilleurs coups. } 36... Ke8 { Le roi noir protège le fou e7 et la 7e rangée. Un des meilleurs coups.

Bilan : avec la tour active, les Blancs limitent l'avantage noir (-0,5). } (35. Bg3 { LE COUP DE LA PARTIE, une faute (-0,5 → -1,6). Le fou défend f4, mais il est passif, et le pion b4 reste sans protection. } 35... Be4+ { Le fou s'installe en e4 avec échec, sur une case blanche qu'aucun pion blanc ne peut attaquer. Le meilleur coup. [%csl Ge4] } 36. Kf2 { Le roi recule. Presque aussi bon que 36.Ke2. }
36... h5 { Le pion h avance vers h4 pour chasser le fou g3. Le meilleur coup. [%cal Gh5h4] }
37. Ra7 { La tour entre en 7e rangée et attaque le fou e7. Le meilleur coup. [%cal Ga7e7] }
37... Bxg2 { LA TRANSFORMATION. Capablanca rend son fou e4 contre le cavalier g2, le dernier défenseur de la colonne g. Le meilleur coup. }
38. Rxg2 { La tour reprend. Presque aussi bon que 38.Ke3. }
38... h4 { Le pion attaque le fou g3. Le fou ne peut pas bouger sans laisser la tour g2 à la tour g4. Le meilleur coup. [%cal Gh4g3,Gg4g2] }
39. Bxh4 { Le fou prend en h4 et abandonne la tour g2. 39.Kf3 résistait mieux (-3,3 contre -4,1), mais la position est déjà perdue. }
39... Rxg2+ { La tour prend la tour g2 avec échec. Le meilleur coup. }
40. Kf3 { Le roi attaque la tour g2. Le meilleur coup. }
40... Rxh2 { La tour s'échappe en prenant h2, et elle attaque le fou h4 et le pion b2. Le meilleur coup. }
41. Bxe7 { Le fou h4 prend le fou e7. Le meilleur coup. }
41... Rh3+ { Échec : la tour chasse le roi blanc. Le meilleur coup. }
42. Kf2 { Le roi recule. Presque aussi bon que 42.Ke2. }
42... Rb3 { La tour attaque les pions b2 et b4. Stockfish préférait 42...Rh2+ (-6,8 contre -6,1), la position reste gagnante.

Bilan : la paire de fous a d'abord fixé les pions blancs, puis le fou d7 libéré a été rendu au bon moment pour obtenir une finale de tours gagnante. Garder la paire n'est pas un but : c'est un moyen. [%cal Gb3b2,Gb3b4] })`,
    ),
    chapter(
      "Bondarevsky – Smyslov : les pions chassent les cavaliers",
      "r1bb1rk1/1pp4p/p3n3/2p1Ppp1/8/2B2N2/PPP1NPPP/R3R1K1 b - - 1 16",
      `{ Suite de Bondarevsky – Smyslov (chapitre 1). Les Noirs ont la paire de fous (c8 et d8) contre le fou c3 et deux cavaliers.

Le pion blanc e5 bloque la grande diagonale du fou c3. Smyslov va appliquer la méthode de Steinitz : avancer ses pions de l'aile roi (f5, g5, puis g4 et f4) pour PRENDRE les cases aux cavaliers blancs.

Avant cette position, 16.Bc3 était imprécis (16.h4, qui attaquait le pion g5, gardait -1,1). Les Noirs sont mieux (-1,3).

PRO TIP : chaque coup de pion qui enlève une case à un cavalier rend la paire de fous plus forte. Mais vérifie que tes pions avancés restent protégés. }
16... b5 { Le pion b gagne de l'espace et prépare ...Bb7. Un peu moins précis que 16...Be7, l'écart est faible. }
17. b3 { Le pion empêche ...c4. Imprécis selon Stockfish (17.a3 gardait -1,3 contre -1,8). }
17... Bb7 { Le fou se place sur la grande diagonale et vise le cavalier f3 et le pion g2. Le meilleur coup. [%cal Gb7f3,Gb7g2] }
18. Ng3 { Le cavalier e2 attaque le pion f5. Le meilleur coup. [%cal Gg3f5] }
18... g4 { Le pion g chasse le cavalier f3. Le meilleur coup. [%cal Gg4f3] }
19. Nd2 { Le seul bon coup : 19.Rad1 ou 19.Nh5 perdaient environ 4,5 pions d'évaluation. }
19... Be7 { Le fou d8 se replace sur une meilleure diagonale. Presque aussi bon que 19...Bg5. }
20. Nh5 { Le cavalier cherche une case active. Presque aussi bon que 20.Rad1. }
20... Kf7 { Le roi se dirige vers g6 pour chasser le cavalier h5. Le meilleur coup. }
21. Nf1 { Le cavalier d2 recule. L'écart avec le meilleur coup (21.Rad1) est faible. }
21... Kg6 { Le roi attaque le cavalier h5. Le meilleur coup. [%cal Gg6h5] }
22. Nf6 { Le cavalier saute en f6, où le pion e5 le protège. Il attaque g4 et h7. Le meilleur coup. [%cal Gf6g4,Gf6h7] }
22... Rad8 { La tour prend la colonne d. Presque aussi bon que 22...h5. }
23. Rad1 { La tour blanche s'oppose sur la colonne d. Le meilleur coup. }
23... Rxd1 { Les tours s'échangent. Un peu moins précis que 23...h5, l'écart est faible. }
24. Rxd1 { La tour reprend. Le meilleur coup. }
24... Rd8 { La dernière tour noire s'oppose à son tour. Un peu moins précis que 24...Nf4. }
25. Rxd8 { Les dernières tours s'échangent : il ne reste que des pièces mineures. Le meilleur coup. }
25... Bxd8 { Le fou reprend et attaque le cavalier f6, protégé par le pion e5. Le meilleur coup. [%cal Gd8f6] }
26. Bb2 { LE MEILLEUR COUP selon Stockfish (-1,8). Le fou reste sur la grande diagonale, derrière le pion e5. } 26... Nd4 { Le cavalier noir s'installe en d4 et attaque le pion c2. Un des meilleurs coups. [%cal Gd4c2] } 27. Ng3 { Le cavalier f1 revient en jeu. Un des meilleurs coups. } 27... Bxf6 { Le fou d8 prend le cavalier f6. Un des meilleurs coups. } 28. exf6 { Le pion reprend. Un des meilleurs coups. } 28... Kxf6 { Le roi prend le pion f6 : les Noirs ont un pion de plus.

Bilan : même avec le meilleur coup, les Blancs perdent un pion (-1,8). } (26. Ne3 { LE COUP DE LA PARTIE, une faute (-1,8 → -2,9). Le cavalier attaque f5 et g4, mais il va être chassé tout de suite. } 26... f4 { Le pion attaque le cavalier e3 et lui prend les cases e3 et g3. Les deux cavaliers blancs n'ont plus de case stable. Le meilleur coup.

Bilan : les pions noirs de l'aile roi ont chassé les cavaliers blancs. La suite est au chapitre 9. [%cal Gf4e3] })`,
    ),
    chapter(
      "Bondarevsky – Smyslov : rendre un fou pour gagner un pion",
      "3b4/1bp4p/p3nNk1/1pp1P3/5pp1/1PB1N3/P1P2PPP/6K1 w - - 0 27",
      `{ Suite du chapitre 8. Les Noirs ont toujours la paire de fous (b7 et d8). Le cavalier blanc f6 est protégé par le pion e5.

La TRANSFORMATION de l'avantage : Smyslov va rendre son fou d8 contre le cavalier f6. Après exf6, le pion f6 est isolé loin de ses pièces : le roi noir le prendra plus tard. Le fou b7 restant et le cavalier e6 seront alors bien plus actifs que les pièces blanches.

Le cavalier e3 est attaqué par le pion f4 : les Blancs doivent le déplacer.

PRO TIP : garder la paire de fous n'est pas une fin en soi. Échange un de tes fous dès que l'échange te rapporte quelque chose de concret : un pion, une case, ou une finale gagnante. }
27. Nf1 { LE MEILLEUR COUP (-2,7). Le cavalier recule en f1, d'où il peut revenir en d2 ou en g3. } 27... Nd4 { Le cavalier noir s'installe en d4 et attaque le pion c2. Un des meilleurs coups. [%cal Gd4c2] } 28. Bb2 { Le fou attaque le cavalier d4. Un des meilleurs coups. [%cal Gb2d4] } 28... Nxc2 { Le cavalier prend le pion c2 : les Noirs gagnent un pion.

Bilan : les Blancs perdent un pion dans tous les cas (-2,7). } (27. Nd1 { LE COUP DE LA PARTIE, une faute (-2,7 → -3,5). En d1, le cavalier ne contrôle aucune case importante. [%csl Rd1] } 27... Bxf6 { LA TRANSFORMATION. Smyslov rend son fou d8 contre le cavalier f6. Le meilleur coup. }
28. exf6 { Le pion reprend. Le seul coup : tout autre perdait une pièce. }
28... Be4 { Le fou blanc des Noirs se centralise et attaque les pions c2 et g2. Le meilleur coup. [%cal Ge4c2,Ge4g2] }
29. Bb2 { Le fou blanc se replace. Le meilleur coup. }
29... b4 { Le pion fixe le pion b3 et enlève les cases a3 et c3 au fou blanc. Le meilleur coup. [%csl Ga3,Gc3] }
30. f3 { Le pion attaque le fou e4 et le pion g4. Le meilleur coup. }
30... Bxc2 { Le fou prend le pion c2 : il attaque maintenant b3 et le cavalier d1. Le meilleur coup. [%cal Gc2b3,Gc2d1] }
31. Nf2 { Le cavalier sauve sa peau et attaque le pion g4. Le meilleur coup. }
31... gxf3 { Le pion prend en f3. Presque aussi bon que 31...Bb1. }
32. gxf3 { Le pion reprend. Le meilleur coup. }
32... Bb1 { Le fou attaque le pion a2. Le meilleur coup. [%cal Gb1a2] }
33. Ne4 { Le cavalier attaque le pion c5. Stockfish préférait 33.a3 (-4,2 contre -4,9), la position reste perdue. }
33... Bxa2 { Le fou prend a2 et attaque b3. Les Noirs ont deux pions de plus. Le meilleur coup. }
34. Nd2 { Le cavalier défend b3. Le meilleur coup. }
34... a5 { Le pion a prépare ...a4 pour créer un pion passé. 34...Nd4 était plus précis (-5,3 contre -4,7), sans changer le résultat. }
35. Kf2 { Le roi se rapproche du centre. 35.Be5 était un peu meilleur. }
35... Nd4 { Le cavalier s'installe en d4, attaque b3 et f3. Aussi bon que 35...a4. [%cal Gd4b3,Gd4f3] }
36. Bxd4 { Les Blancs donnent leur fou contre le cavalier. 36.Ne4 résistait mieux (-5,3 contre -5,9). }
36... cxd4 { Le pion reprend : finale fou contre cavalier, avec deux pions de plus pour les Noirs. Le meilleur coup. }
37. Ke2 { Le roi se rapproche. Aussi bon que 37.Ne4. }
37... Kxf6 { Le roi prend enfin le pion f6, comme prévu au coup 27. Le meilleur coup. }
38. Kd3 { Le roi blanc attaque le pion d4. Le meilleur coup. [%cal Gd3d4] }
38... Ke5 { Le roi noir protège le pion d4. Presque aussi bon que 38...c5. }
39. Kc2 { Le roi se dirige vers b2 pour attaquer le fou a2. 39.Nc4+ résistait mieux (-4,8), la position reste perdue. }
39... a4 { LA PERCÉE. Le pion a attaque b3 pour créer un pion passé. Le meilleur coup. [%cal Ga4b3] }
40. bxa4 { Le pion prend. Le meilleur coup. }
40... c5 { Le pion c avance : les pions b4, c5 et d4 vont rouler ensemble. Presque aussi bon que 40...Bd5. }
41. a5 { Le pion a blanc avance à son tour. Le meilleur coup. }
41... c4 { Le pion c avance encore et menace ...c3 ou ...d3+. Le meilleur coup. }
42. a6 { Le pion a avance. 42.Nb1 résistait plus longtemps, la position est perdue. }
42... d3+ { Le pion donne échec : les pions passés noirs b4, c4 et d3 sont trop forts pour le roi et le cavalier blancs. Le meilleur coup.

Bilan : en rendant un fou contre le cavalier f6 au coup 27, Smyslov a obtenu une finale fou contre cavalier avec des pions de plus, puis trois pions passés liés. La paire de fous a servi à préparer cette transformation. [%cal Gd3d2] })`,
    ),
    chapter(
      "Aganalian – Petrosian 1945 : rendre les fous au bon moment",
      "r1b2b1r/1pk5/2p2p2/p3p1pP/2P5/P3P1nP/1PN2P2/2KR1B1R w - - 0 21",
      `{ Aganalian – Petrosian, Tbilissi 1945. Le jeune Petrosian vient de prendre le fou g3 avec son cavalier (20...Nxg3). Il a maintenant deux fous (c8 et f8) contre le fou f1 et le cavalier c2.

Stockfish préférait 20...Rxh5 (-1,9 contre -1,1) : obtenir la paire de fous n'était pas le coup le plus précis. C'est une leçon importante : la paire de fous est un avantage, mais pas toujours le plus grand avantage disponible.

Les Blancs vont avoir des pions g doublés. Leurs pions a3, c4 et e3 sont des cibles pour les fous noirs.

PRO TIP : avec la paire de fous, n'hésite pas à rendre du matériel (une qualité, un fou) si cela ouvre le roi ou les pions adverses. Les fous préparent ; les échanges concluent. }
21. fxg3 { Le pion f reprend. Le seul coup : tout autre perdait une pièce. }
21... Rxh5 { La tour prend le pion h5 et vise le pion h3. Le meilleur coup. [%cal Gh5h3] }
22. Be2 { LE MEILLEUR COUP (-1,0). Le fou se développe et attaque la tour h5. [%cal Ge2h5] } 22... Rh8 { La tour recule. Un des meilleurs coups. } 23. h4 { Le pion h avance pour échanger un pion faible. Un des meilleurs coups. } 23... g4 { Le pion g reste en place et empêche les pions blancs d'avancer. Un des meilleurs coups.

Bilan : avec un fou actif, les Blancs limitent l'avantage noir (-0,9). } (22. Bg2 { LE COUP DE LA PARTIE, imprécis (-1,0 → -1,9). Le fou vise c6, mais sur g2 il ne fait que protéger h3 : il est passif. } 22... Be6 { Le fou c8 se développe et attaque les pions c4 et h3. Presque aussi bon que 22...a4. [%cal Ge6c4,Ge6h3] } 23. Bf1 { Le fou revient défendre c4 et h3. Imprécis selon Stockfish (23.b3 gardait -1,9 contre -2,3). }
23... a4 { Le pion a avance et enlève la case b3 aux pions blancs. Presque aussi bon que 23...g4. [%csl Gb3] }
24. Rd2 { La tour protège la 2e rangée. Imprécis (24.Be2 était meilleur). }
24... Bc5 { Le fou f8 se place sur la diagonale a7-g1 et attaque le pion e3. Presque aussi bon que 24...f5. [%cal Gc5e3] }
25. Rf2 { La tour attaque le pion f6. L'écart avec le meilleur coup (25.Rdh2) est faible. [%cal Gf2f6] }
25... f5 { Le pion avance et se met à l'abri. Il prépare ...f4 pour ouvrir encore plus les lignes. Le meilleur coup. }
26. Rg1 { La tour protège g3. Le meilleur coup. }
26... Rah8 { Les deux tours noires se doublent sur la colonne h contre le pion h3. Un peu moins précis que 26...Rhh8. }
27. Kd2 { Le roi se rapproche du centre. Presque aussi bon que 27.g4. }
27... f4 { LA RUPTURE. Le pion attaque e3 et g3 pour ouvrir les diagonales des deux fous. Presque aussi bon que 27...Rd8+. [%cal Gf4e3,Gf4g3] }
28. g4 { Le pion attaque la tour h5. Stockfish préférait 28.gxf4 (-3,3 contre -4,7) : la position devient décisive. }
28... Rxh3 { Petrosian rend la qualité : la tour prend h3. Un peu moins précis que 28...R5h6, la position reste gagnante. }
29. Bxh3 { Le fou prend la tour. Le meilleur coup. }
29... Rxh3 { L'autre tour reprend et attaque le pion e3. Le meilleur coup. [%cal Gh3e3] }
30. Kd3 { Le roi défend e3. 30.Kc1 résistait mieux (-5,0 contre -5,6). }
30... Bxe3 { Le fou c5 prend e3 et attaque la tour f2 : Petrosian rend aussi un fou. Le meilleur coup. [%cal Ge3f2] }
31. Nxe3 { Le cavalier prend le fou. Le meilleur coup. }
31... Rxe3+ { La tour reprend avec échec. Le meilleur coup. }
32. Kd2 { Le roi attaque la tour e3. Le meilleur coup. }
32... Bxc4 { Le dernier fou prend le pion c4. Aussi bon que 32...e4. }
33. Re1 { Les Blancs proposent l'échange des tours. 33.Rh1 résistait mieux (-6,1 contre -8,3). }
33... Rxe1 { Petrosian accepte : la tour prend la tour. Le meilleur coup. }
34. Kxe1 { Le roi reprend. Le meilleur coup. }
34... e4 { Le pion e avance. Les Noirs ont un fou et six pions contre une tour et trois pions : les pions passés noirs vont décider.

Bilan : Petrosian a utilisé ses deux fous pour attaquer les pions blancs, puis les a rendus (une qualité au coup 28, un fou au coup 30) pour obtenir des pions passés gagnants (-9). })`,
    ),
    chapter(
      "Blackburne – Weiss 1889 : deux fous contre fou et cavalier en finale",
      "4r1k1/pp3ppp/2p5/5b2/Nb3B2/2P2P2/PP4PP/3R2K1 b - - 0 21",
      `{ Blackburne – Weiss, New York 1889. Les dames ont été échangées au coup 17. Les Noirs ont la paire de fous (b4 et f5) contre le fou f4 et le cavalier a4.

Le cavalier a4 est au bord de l'échiquier, loin du centre. Les Noirs vont le repousser encore plus et fixer les pions blancs.

Avant cette position, 21.c3 était imprécis (21.Rd4 gardait -0,6 contre -1,5).

PRO TIP : dans une finale avec la paire de fous, rapproche ton roi du centre et avance tes pions là où ils enlèvent des cases au cavalier adverse. }
21... Be7 { Le fou recule avant d'être chassé par le pion c3, et garde la diagonale a3-f8. Le meilleur coup. }
22. b3 { Le pion protège le cavalier a4. Presque aussi bon que 22.c4. }
22... b5 { Le pion b attaque le cavalier a4 et le chasse. Le meilleur coup. [%cal Gb5a4] }
23. Nb2 { Le cavalier recule sur une case passive, au bord de l'échiquier. Le meilleur coup. [%csl Rb2] }
23... Bf6 { Le fou se replace sur la grande diagonale et attaque le pion c3. Le meilleur coup. [%cal Gf6c3] }
24. Bd2 { Le fou défend c3. Presque aussi bon que 24.g4. }
24... Rd8 { La tour prend la colonne d face à la tour blanche. Presque aussi bon que 24...b4. }
25. b4 { Le pion b avance et fixe la structure blanche sur les cases noires (b4, c3). Aussi bon que 25.Be3 selon Stockfish. }
25... h5 { Le pion h gagne de l'espace à l'aile roi. Un peu moins précis que 25...Be6. }
26. Be1 { Le fou recule hors de la colonne d. Le meilleur coup. }
26... Re8 { LE MEILLEUR COUP selon Stockfish (-1,5). La tour évite l'échange et prend la colonne e : avec plus de pièces sur l'échiquier, les fous trouvent plus de cibles. } 27. Kf2 { Le roi blanc protège la case e2 et le pion f3. Un des meilleurs coups. } 27... Be6 { Le fou se replace et vise l'aile dame. Un des meilleurs coups. } 28. a3 { Le pion a protège le pion b4. Un des meilleurs coups.

Bilan : les Noirs gardent leur pression (-1,5). } (26... Rxd1 { LE COUP DE LA PARTIE, imprécis (-1,5 → -0,6). L'échange des tours permet au cavalier blanc de revenir au jeu par d1 et e3. } 27. Nxd1 { Le cavalier reprend. Le seul coup. }
27... Bc2 { Le fou attaque le cavalier d1. Presque aussi bon que 27...Kf8. [%cal Gc2d1] }
28. Ne3 { Le cavalier se centralise et attaque le fou c2. Le meilleur coup. [%cal Ge3c2] }
28... Bb1 { Le fou s'échappe et attaque le pion a2. Le meilleur coup. [%cal Gb1a2] }
29. a3 { Le pion avance et se met à l'abri. Le meilleur coup. }
29... Kf8 { Le roi noir se dirige vers le centre. Le meilleur coup. }
30. Kf2 { Le roi blanc se centralise aussi. Presque aussi bon que 30.g3. }
30... Bd3 { Le fou se fixe en d3, au cœur du camp blanc, d'où il surveille c4 et e2. L'écart avec le meilleur coup (30...Ke7) est faible. [%csl Gd3] }
31. g3 { Le pion protège la case f4. Presque aussi bon que 31.Nd1. }
31... Ke7 { Le roi continue vers le centre. Presque aussi bon que 31...g6. }
32. f4 { Le pion avance sur une case noire. Imprécis selon Stockfish (32.Ng2 était meilleur) : les pions blancs b4, c3 et f4 sont maintenant tous sur des cases noires, et la case e4 devient faible. [%csl Re4] }
32... Ke6 { Le roi se centralise et vise les cases d5 et e4. Le meilleur coup. [%cal Ge6d5] }
33. Kf3 { Le roi blanc protège e4. Presque aussi bon que 33.Bd2. }
33... Bd8 { Le fou f6 se replace pour aller en b6, d'où il visera la diagonale a7-g1. Presque aussi bon que 33...g6.

Bilan : les Noirs gardent l'initiative (-1,2). Le chapitre 12 montre comment Weiss a converti cet avantage. [%cal Gd8b6] })`,
    ),
    chapter(
      "Blackburne – Weiss : fous de même couleur, puis finale de pions",
      "3b4/8/2p3p1/1p1k1p1p/pPbB1P2/P1P1N1P1/3K3P/8 b - - 1 42",
      `{ Suite du chapitre 11. Entre-temps, les deux camps ont manœuvré, avec quelques imprécisions selon Stockfish (37...f5+, 39.Ng2, 39...Bc4+, 42.Ne3+). Les Noirs ont toujours la paire de fous (c4 et d8) contre le fou d4 et le cavalier e3 (-2,5).

Regarde les pions blancs a3, b4 et c3 : ils sont tous sur des cases NOIRES. Le fou noir d8 voit les mêmes cases noires : ces pions sont des cibles permanentes.

Dans ce chapitre, la paire de fous se transforme deux fois :
1. les Blancs échangent leur cavalier contre le fou c4 : il reste une finale de fous de MÊME couleur, où le roi noir est bien plus actif ;
2. les Noirs rendent ensuite leur fou contre le fou blanc pour entrer dans une finale de pions gagnante.

PRO TIP : avant d'échanger les dernières pièces, compte les coups de la finale de pions qui en résulte. Si ton roi arrive le premier sur les pions adverses, l'échange gagne. }
42... Ke4 { LE ROI ENVAHIT. Il attaque le cavalier e3 et vise la case d3. Le seul coup qui garde l'avantage : 42...Kd6 ou 42...Ke6 donnaient l'égalité. [%cal Ge4d3] }
43. Nxc4 { Blackburne échange son cavalier contre le fou c4. Il reste une finale de fous de même couleur (cases noires). Stockfish préférait 43.Nc2 (-3,9 contre -4,8), la position est déjà décisive. }
43... bxc4 { Le pion reprend. Les pions blancs a3, b4, c3 sont sur des cases noires, comme le fou noir. Le meilleur coup. [%csl Ra3,Rb4,Rc3] }
44. Ke2 { Le roi blanc empêche le roi noir d'entrer en d3. Le meilleur coup. }
44... g5 { Le pion g attaque f4 pour ouvrir l'aile roi. Presque aussi bon que 44...h4. [%cal Gg5f4] }
45. Be3 { Le fou protège f4. Stockfish préférait 45.fxg5 (-5,5 contre -6,4). }
45... gxf4 { Le pion prend en f4 et attaque le fou e3 et le pion g3. Le meilleur coup. }
46. Bxf4 { Le fou reprend. Le meilleur coup. }
46... Bf6 { Le fou attaque le pion c3. Stockfish préférait 46...h4 (-7,0 contre -5,8), la position reste gagnante. [%cal Gf6c3] }
47. Bd2 { Le fou défend c3. Le meilleur coup. }
47... h4 { Le pion h attaque g3 pour créer un pion passé. Presque aussi bon que 47...Be5. [%cal Gh4g3] }
48. gxh4 { Le pion prend. Le meilleur coup. }
48... Bxh4 { Le fou reprend. Le pion f5 est maintenant passé. Le meilleur coup. }
49. Be3 { Le fou se place devant le pion f. Presque aussi bon que 49.Kf1. }
49... Bf6 { Le fou revient attaquer c3. 49...f4 était un peu plus précis. }
50. Bd2 { Le fou défend c3. Stockfish préférait 50.Kf2 (-6,7 contre -7,9). }
50... f4 { Le pion passé avance. Le meilleur coup. [%cal Gf4f3] }
51. Be1 { Le fou se place derrière le pion c3. Le meilleur coup. }
51... f3+ { Le pion avance avec échec et chasse le roi blanc. Presque aussi bon que 51...Bg5. [%cal Gf3e2] }
52. Kf2 { Le roi bloque le pion f3. Stockfish préférait 52.Kf1 (-7,2 contre -8,0), la position est perdue de toute façon. }
52... Bh4+ { Le fou donne échec et propose l'échange des fous. 52...Bg5 était un peu plus précis, la position reste gagnante. [%cal Gh4e1] }
53. Kf1 { Le seul coup : 53.Kg1 perdait encore plus vite (-12,5). }
53... Bxe1 { LA DEUXIÈME TRANSFORMATION. Le fou noir prend le fou blanc : il ne reste qu'une finale de pions. Presque aussi bon que 53...Bg5. }
54. Kxe1 { Le roi reprend. Le seul coup. }
54... Kd3 { Le roi noir entre et attaque le pion c3. Le roi blanc doit perdre du temps à aller chercher le pion f3 et ne peut pas défendre l'aile dame : les Noirs gagnent les pions blancs et vont à la dame. Le meilleur coup.

Bilan : la paire de fous a fixé les pions blancs sur les cases noires. Ensuite, chaque échange (cavalier contre fou, puis fou contre fou) a rapproché les Noirs d'une finale de pions gagnante. [%cal Gd3c3] }`,
    ),
  ],
};
