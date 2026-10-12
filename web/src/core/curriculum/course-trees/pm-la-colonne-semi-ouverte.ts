import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « La colonne semi-ouverte » (positional_mastery, module 10) — refonte
 * « un commentaire par coup » du 2026-10-12.
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, entièrement
 * réécrite ici) : Boleslavsky – Lisitsine (1956) et Schlage – Réti (1928),
 * tels que présentés dans « Logical Chess: Move by Move » de Chernev ;
 * Spassky – Fischer (Reykjavik 1972, 3e partie), score recoupé avec les quatre
 * positions de l'ancienne leçon plate ; Petrosian – Pachman (Bled 1961, PGN
 * PILOT du thème) ; Hracek – Cebalo (Medulin 2002), d'après le chapitre 22 de
 * « Chess Structures » (Flores Rios) ; Tarrasch – Alekhine (Bad Pistyan 1922)
 * et Kramnik – Leko (Brissago 2004, 14e partie), d'après deux études Lichess
 * sur les ruptures de pions. Le chapitre 1 est une ligne théorique de la
 * Sicilienne Scheveningen, sans source.
 *
 * Plan : définition et structure asymétrique (chapitre 1), la colonne contre
 * le pion arriéré (2), naissance et exploitation d'une colonne dans le Benoni
 * (3 et 4), la colonne e contre le roi (5), la pression à long terme en finale
 * (6), le sacrifice de qualité …Txc3 (7), la colonne f vers le roi (8),
 * la colonne g ouverte par une rupture (9).
 *
 * Toutes les parties ont été rejouées avec chess.js et chaque coup sondé avec
 * Stockfish 18 (profondeur 18, 3 candidats par coup). Règle appliquée : quand
 * un coup perd environ 0,5 pion ou plus par rapport au choix du moteur, la
 * LIGNE PRINCIPALE suit le moteur et la suite de la partie passe en
 * variante, signalée comme fautive (dans une variante qui suit la partie, la
 * correction du moteur est donnée en sous-variante). Exception : dans une
 * position déjà décisive (plus de +3 environ), un écart qui ne change pas le
 * résultat est seulement signalé dans le commentaire. Les évaluations citées
 * sont du point de vue des Blancs. Aucun résultat de partie (1-0, 0-1…) dans
 * les variantes : le parseur s'y arrêterait.
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

export const LA_COLONNE_SEMI_OUVERTE: CourseTree = {
  chapters: [
    chapter(
      "Définition : une colonne pour chaque camp",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      `{ Une colonne SEMI-OUVERTE est une colonne où il ne reste qu'un pion, et ce pion appartient à l'adversaire. Pour le camp qui n'a plus de pion sur cette colonne, elle est « à moitié ouverte » : sa tour peut y glisser jusqu'au pion adverse et l'attaquer. Pour l'autre camp, elle reste bouchée par son propre pion.

Différence avec la colonne ouverte (module précédent) : sur une colonne ouverte, les deux camps se battent pour le contrôle. Sur une colonne semi-ouverte, un seul camp attaque, et il a une CIBLE toute trouvée : le pion adverse qui s'y trouve, ou la case juste devant lui.

La Sicilienne ouverte est l'exemple parfait. Après l'échange ...cxd4, chaque camp reçoit sa propre colonne : c'est une structure ASYMÉTRIQUE.

PRO TIP : à chaque échange de pions, regarde quelles colonnes viennent de devenir semi-ouvertes, et pour qui. C'est souvent là que se joueront les vingt coups suivants. }
1. e4 { Le pion roi prend le centre. Stockfish place 1.e4, 1.Nf3 et 1.d4 au même niveau (+0,35). }
1... c5 { La Défense sicilienne. Les Noirs ne copient pas les Blancs : ils contrôlent d4 avec un pion de côté. Stockfish préfère de peu 1...e5 (+0,36 contre +0,50), mais c5 reste une des meilleures défenses. }
2. Nf3 { Le cavalier se développe et prépare d2-d4. Le coup préféré du moteur. }
2... d6 { Le pion contrôle e5 et ouvre la diagonale du fou c8. C'est ce pion d6 qui deviendra plus tard la cible des Blancs. [%csl Yd6] }
3. d4 { Les Blancs ouvrent le centre : ils proposent l'échange de leur pion d contre le pion c noir. Le meilleur coup. }
3... cxd4 { L'ÉCHANGE QUI CRÉE LA STRUCTURE. Le pion c noir disparaît : la colonne c devient semi-ouverte pour les Noirs, qui viseront le pion c2. [%csl Gc8,Rc2] [%cal Gc8c2] }
4. Nxd4 { Le cavalier reprend. À son tour le pion d blanc a disparu : la colonne d devient semi-ouverte pour les Blancs, qui viseront le pion d6. Chaque camp a maintenant SA colonne. [%csl Gd1,Rd6] [%cal Gd1d6] }
4... Nf6 { Le cavalier attaque le pion e4 et oblige les Blancs à le défendre. Le meilleur coup. }
5. Nc3 { Le cavalier protège e4. Attention : en c3, il se place sur la colonne c, donc dans la ligne de mire d'une future tour noire en c8. [%cal Gc8c3] }
5... a6 { La Najdorf : le pion contrôle b5 et prépare ...b5. Le meilleur coup selon Stockfish. }
6. Be2 { Un développement calme. Stockfish préfère 6.f3 ou 6.Be3 (+0,4 contre +0,2), mais ce coup reste parfaitement jouable. }
6... e6 { La structure Scheveningen : les pions d6 et e6 forment un petit centre compact. Le pion d6 est désormais un pion ARRIÉRÉ : ses voisins (c et e) ne peuvent plus le soutenir en avançant, et il reste sur la colonne d semi-ouverte. [%csl Rd6] }
7. O-O { Le roi blanc se met à l'abri. Stockfish préfère de peu 7.Be3 ou 7.f4. }
7... Be7 { Le fou se développe, prêt pour le roque. Le meilleur coup. }
8. f4 { Le pion f prend de l'espace et prépare e4-e5. Si ce pion e avance, le pion d6 sera attaqué une seconde fois. }
8... O-O { Le roi noir se met à l'abri. Le meilleur coup. }
9. Kh1 { Le roi quitte la diagonale g1-a7 : plus de mauvaise surprise sur un échec du fou ou de la dame noire. Le meilleur coup selon Stockfish. }
9... Qc7 { La dame s'installe sur la colonne c semi-ouverte, face au pion c2 et au cavalier c3 : les Noirs utilisent déjà « leur » colonne. Stockfish préférait de peu 9...Bd7. [%cal Gc7c3] }
10. a4 { Le pion empêche ...b5, le coup qui donnerait de l'espace aux Noirs à l'aile dame. 10.Bf3 était équivalent. }
10... Nc6 { Le cavalier se développe et vise le cavalier d4. 10...b6 était un peu plus précis selon Stockfish (+0,2 contre +0,35), mais l'écart est minime. }
11. Be3 { Le fou se développe et protège le cavalier d4. Le meilleur coup. La position est équilibrée (+0,3).

Le bilan de cette structure : les Blancs ont la colonne d (cible : d6) et de l'espace au centre ; les Noirs ont la colonne c (cible : c2 et le cavalier c3) et le pion de réserve e6. Les Blancs vont placer une tour en d1, les Noirs une tour en c8.

PRO TIP : dans une structure asymétrique, chaque camp doit jouer SUR SA colonne. Celui qui passe son temps à défendre au lieu d'attaquer sur la sienne finit par subir. [%csl Rd6,Rc2] [%cal Gd1d6,Gc8c2] }`,
    ),
    chapter(
      "Boleslavsky – Lisitsine : la colonne d contre le pion arriéré d6",
      "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 3 9",
      `{ URSS 1956, Sicilienne Dragon. Les Blancs ont la colonne d semi-ouverte, les Noirs la colonne c. La cible des Blancs est le pion d6. Pour l'instant il est solide, mais s'il devient ARRIÉRÉ (impossible à soutenir par un autre pion), il sera attaqué par une tour en d1, par la dame, puis par un cavalier.

Ce chapitre montre comment les Blancs transforment une simple colonne en menace concrète contre d6.

PRO TIP : une colonne semi-ouverte ne fait rien toute seule. Il faut ajouter des attaquants sur la cible jusqu'à ce que l'adversaire ne puisse plus la défendre. [%cal Gd2d6] }
9. O-O-O { Le grand roque place directement la tour en d1, sur la colonne semi-ouverte, derrière le cavalier d4. Le meilleur coup selon Stockfish (+0,7). [%cal Gd1d6] }
9... Nxd4 { Les Noirs échangent le cavalier central. Stockfish préférait la rupture 9...d5! (+0,7 contre +1,1) : avancer le pion d6 est le meilleur moyen de ne plus jamais avoir à le défendre. }
10. Bxd4 { Le fou reprend et se place au centre. Le meilleur coup (10.Qxd4? serait une faute). }
10... Qa5 { La dame part à l'attaque à l'aile dame, où se trouve le roi blanc. }
11. Kb1 { Le roi s'écarte de la colonne c et de la diagonale de la dame. Le meilleur coup. }
11... e5 { Les Noirs chassent le fou. Mais ce coup a un prix : le pion d6 ne peut plus être soutenu par un pion e, il devient ARRIÉRÉ sur la colonne d semi-ouverte, et la case d5 devant lui devient un trou. [%csl Rd6,Rd5] }
12. Be3 { Le fou recule et garde l'œil sur l'aile dame. Le meilleur coup. }
12... Be6 { Le fou contrôle d5 et c4 : il essaie de boucher la case faible devant d6. Le meilleur coup. }
13. a3 { Le pion contrôle la case b4 : la dame noire ne pourra plus s'y installer. Le meilleur coup selon Stockfish. }
13... Rfd8 { La tour vient défendre d6. Voilà la conséquence de la colonne semi-ouverte : une pièce noire est déjà occupée à DÉFENDRE. 13...Rfc8 était aussi bon. }
14. Nb5 { Le cavalier attaque d6 une deuxième fois, et vise aussi c7 et a7. Le pion d6 est maintenant attaqué par le cavalier et, à travers la colonne, par la dame d2. [%cal Gb5d6,Gd2d6,Gb5c7] }
14... Qxd2 { Le meilleur coup selon Stockfish : les Noirs échangent les dames pour enlever un attaquant de d6. }
(14... Qa4? { Le coup de la partie. La dame quitte la défense, et le cavalier va frapper (Stockfish : +2,6 au lieu de +1,1). } 15. Nc7! { La fourchette : le cavalier attaque la tour a8 et le fou e6. Lisitsine a joué 15.c4!?, plus spectaculaire mais nettement moins fort (+1,1 seulement). [%cal Gc7a8,Gc7e6] } 15... a6 { Les Noirs ne peuvent pas tout sauver : ils abandonnent la tour a8. } 16. Nxa8 { Le cavalier prend la tour. } 16... Rxa8 { La tour d8 reprend en a8. Mais en quittant la colonne d, elle a abandonné la défense de d6. } 17. Qxd6 { La dame prend d6 en descendant la colonne d. La pression accumulée sur la colonne finit toujours par rapporter quelque chose. [%cal Gd2d6] })
15. Rxd2 { La tour reprend et reste sur la colonne d. }
15... d5 { La rupture libératrice : le pion arriéré quitte sa case avant d'être perdu. Mais les Noirs vont devoir rendre du matériel. [%csl Gd5] }
16. Nc7 { La fourchette sur a8 et e6 rapporte la qualité (une tour contre un cavalier). Le meilleur coup. [%cal Gc7a8,Gc7e6] }
16... dxe4 { Les Noirs prennent un pion pour compenser un peu. }
17. Nxa8 { Le cavalier prend la tour. }
17... Rxa8 { Les Noirs reprennent. Les Blancs ont la qualité pour un pion : Stockfish donne environ +1,2.

PRO TIP : un pion arriéré sur une colonne semi-ouverte oblige l'adversaire à choisir entre une défense passive et une rupture qui coûte du matériel. Dans les deux cas, celui qui attaque y gagne. }`,
    ),
    chapter(
      "Spassky – Fischer (1) : le Benoni et la colonne e",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      `{ Reykjavik 1972, 3e partie du match pour le titre mondial : la première victoire de Fischer contre Spassky. Le Benoni moderne crée une structure asymétrique : les Blancs perdent leur pion c, les Noirs leur pion e. La colonne e devient donc semi-ouverte pour les Noirs, avec une cible fixe : le pion e4 blanc.

Ce chapitre montre comment la structure naît dans l'ouverture, et comment les Noirs placent leurs pièces sur « leur » colonne dès les premiers coups.

PRO TIP : un pion qui reste sur une colonne semi-ouverte adverse doit être défendu en permanence. C'est une épine dans le pied pour tout le milieu de partie. }
1. d4 { Le pion dame au centre. Stockfish place 1.e4, 1.d4 et 1.Nf3 dans un mouchoir de poche. }
1... Nf6 { Le cavalier contrôle e4. Le meilleur coup. }
2. c4 { Le pion c prend de l'espace. C'est lui qui va disparaître et laisser la colonne c aux Blancs. }
2... e6 { Les Noirs préparent ...c5 et ...exd5. Le meilleur coup. }
3. Nf3 { Le cavalier se développe. 3.g3 était équivalent. }
3... c5 { Les Noirs défient le pion d4. Stockfish préfère 3...d5 (+0,3 contre +0,7) : le Benoni est une ouverture risquée, qui donne de l'espace aux Blancs en échange d'un jeu actif. }
4. d5 { Le pion avance et gagne de l'espace. Le meilleur coup. }
4... exd5 { LE PREMIER ÉCHANGE. Le pion e noir va disparaître. [%csl Ge8] }
5. cxd5 { Les Blancs reprennent du pion c. Bilan : les Blancs n'ont plus de pion c, les Noirs n'ont plus de pion e. Les Noirs ont la colonne e (cible : le pion e blanc), les Blancs ont la colonne c (cible : le pion c5). [%cal Ge8e2,Gc1c5] }
5... d6 { Le pion bloque d5 et ouvre la diagonale du fou c8. Le meilleur coup. }
6. Nc3 { Le cavalier se développe et soutient la future poussée e4. }
6... g6 { Le fou va en g7, sur la grande diagonale : il visera le cavalier c3, qui défendra e4. Retiens cette idée, elle décidera de la partie. [%cal Gg7c3] }
7. Nd2 { Le cavalier part vers c4, où il attaquera d6. 7.e4 était équivalent selon Stockfish. }
7... Nbd7 { Le cavalier se développe vers e5, sur la colonne e. Stockfish préférait de peu 7...Bg7. }
8. e4 { Le pion e arrive en e4. C'est désormais LA cible des Noirs sur la colonne e semi-ouverte. [%csl Re4] }
8... Bg7 { Le fou se fianchette et vise la diagonale a1-h8. Le meilleur coup. }
9. Be2 { Le fou se développe et prépare le roque. Le meilleur coup. }
9... O-O { Le roi est à l'abri. Le meilleur coup. }
10. O-O { Les Blancs roquent. 10.h3 était un peu plus précis. }
10... Re8 { LA TOUR SUR LA COLONNE SEMI-OUVERTE. Elle attaque déjà le pion e4, qui n'est défendu que par le cavalier c3. Le meilleur coup. [%cal Ge8e4] }
11. Qc2 { La dame défend e4 une seconde fois. Les Blancs doivent déjà consacrer deux pièces à ce pion. Stockfish préférait 11.h3, de peu. [%cal Gc2e4] }
11... Nh5 { Un coup surprenant de Fischer : le cavalier part au bord, et accepte que ses pions soient doublés après Bxh5. Stockfish le juge correct (+0,85). Les Noirs obtiendront en échange la paire de fous et une colonne g ouverte. Suite au chapitre suivant. }`,
    ),
    chapter(
      "Spassky – Fischer (2) : enlever le défenseur, gagner le pion e4",
      "r3r1k1/3b1pbp/p2p2q1/1ppP4/P3PBp1/2N3P1/1PQ1RP1P/4R1K1 w - - 2 23",
      `{ Suite de la partie, après 12.Bxh5 gxh5 et une série d'échanges. Les Blancs ont doublé leurs tours sur la colonne e (e2 et e1) pour défendre le pion e4. Le cavalier c3 le défend aussi. Les Noirs ont déjà pris l'avantage : Stockfish donne environ -1.

Le pion e4 est attaqué par la tour e8, la dame g6 (par la diagonale f5-e4) et bientôt par une seconde tour. La clé de la partie : le cavalier c3 est attaqué par le fou g7 sur la grande diagonale. Si ce cavalier disparaît, e4 perd un défenseur.

PRO TIP : quand une cible est défendue autant de fois qu'elle est attaquée, cherche à ÉLIMINER un défenseur plutôt qu'à ajouter un attaquant. [%cal Gg7c3,Ge8e4,Gg6e4] }
23. b3 { Les Blancs veulent jouer b4 pour ouvrir l'aile dame. Le meilleur coup selon Stockfish (-1,0). }
23... Re7 { La tour se prépare à doubler sur la colonne e. 23...h6 était un peu plus précis selon Stockfish. }
24. Qd3 { La dame protège b3 et e4 à la fois. }
24... Rb8 { La seconde tour vient soutenir l'aile dame avant de revenir sur la colonne e. Le meilleur coup. }
25. axb5 { Les Blancs échangent à l'aile dame. 25.Nb1 était un peu plus précis. }
25... axb5 { Les Noirs reprennent. }
26. b4 { Le pion attaque c5. Le meilleur coup. }
26... c4 { Le pion avance et devient un pion PASSÉ, protégé par b5. Plus aucun pion blanc ne peut l'arrêter. Le meilleur coup. [%csl Gc4] }
27. Qd2 { La dame se replace. Stockfish préférait 27.Qc2, mais l'écart est minime. }
27... Rbe8 { LES DEUX TOURS SUR LA COLONNE E. Avec la dame g6, cela fait trois pièces contre e4. Le meilleur coup. [%cal Ge7e4,Gg6e4] }
28. Re3 { La tour protège la 3e rangée et e4. }
28... h5 { Le pion soutient g4 et donne de l'air au roi. Stockfish préférait 28...h6. }
29. R3e2 { Spassky revient en e2. Stockfish préférait 29.Kf1 (environ -1,0 contre -1,5). }
29... Kh7 { Fischer « passe » pour voir ce que fait l'adversaire. Le coup immédiat 29...Bxc3 était un peu meilleur (-1,5 contre -1,0). }
30. Re3 { Les Blancs reviennent : ils n'ont pas de plan actif. }
30... Kg8 { Les Noirs répètent une fois, puis passeront à l'action. }
31. R3e2 { Encore une fois la tour en e2. }
31... Bxc3 { LE COUP DÉCISIF. Le fou se sacrifie contre le cavalier, le seul défenseur de e4 qui n'est pas sur la colonne. Le meilleur coup. [%csl Rc3] }
32. Qxc3 { La dame reprend. Le pion e4 a maintenant deux défenseurs (les tours) contre trois attaquants (deux tours et la dame). [%csl Re4] }
32... Rxe4 { La tour prend e4. Le meilleur coup. }
33. Rxe4 { Les Blancs reprennent. }
33... Rxe4 { La seconde tour reprend. }
34. Rxe4 { Les Blancs échangent la dernière tour. }
34... Qxe4 { La dame reprend. BILAN : le pion e4, cible de la colonne e depuis le 10e coup, est tombé. Les Noirs ont un pion de plus et un pion passé en c4. Stockfish : environ -1,9. }
35. Bh6 { Le fou vise le roi noir. Stockfish préférait 35.Bc1. }
35... Qg6 { La dame défend g7 et l'aile roi. }
36. Bc1 { Le fou revient défendre. }
36... Qb1 { La dame s'infiltre derrière les lignes blanches et attaque le fou c1. Fischer a gagné la partie au 41e coup.

PRO TIP : le schéma à retenir sur une colonne semi-ouverte : 1) fixer la cible, 2) doubler les tours, 3) éliminer le défenseur qui n'est pas sur la colonne, 4) prendre. }`,
    ),
    chapter(
      "Petrosian – Pachman : la colonne e mène au roi",
      "r1bq1rk1/pp1pnpbp/2n1p1p1/2p5/4P3/3P1NP1/PPP2PBP/RNBQR1K1 w - - 3 8",
      `{ Bled 1961. Les Blancs jouent l'Attaque est-indienne, avec une tour déjà en e1. Ils vont échanger leur pion e contre le pion d noir. Résultat : la colonne e devient semi-ouverte pour les Blancs, face au pion e6 et au cavalier e7. La colonne d devient semi-ouverte pour les Noirs, face au pion d3.

Une colonne semi-ouverte n'attaque pas seulement un pion. Elle sert aussi de ROUTE : une tour qui y entre peut ensuite se déplacer latéralement vers le roi adverse.

PRO TIP : pense à la « tour qui monte » : elle utilise la colonne semi-ouverte pour avancer, puis une rangée libre pour rejoindre l'attaque. [%cal Ge1e4,Ge4h4] }
8. e5 { Le pion avance et prend de l'espace. Les trois meilleurs coups de Stockfish se valent (+0,1). }
8... d6 { Les Noirs attaquent tout de suite le pion e5. Le meilleur coup. }
9. exd6 { LES BLANCS ÉCHANGENT. Leur pion e disparaît : la tour e1 voit maintenant le pion e6 et le cavalier e7. Le meilleur coup. [%cal Ge1e6] }
9... Qxd6 { La dame reprend et vise le pion d3 sur la colonne d, désormais semi-ouverte pour les Noirs. [%cal Gd6d3] }
10. Nbd2 { Le cavalier se développe vers b3 ou c4. Le meilleur coup. }
10... Qc7 { La dame quitte la ligne du futur fou f4. Le meilleur coup. }
11. Nb3 { Le cavalier vise c5 et d4. Stockfish préférait de peu 11.c3. }
11... b6 { Le meilleur coup selon Stockfish : le pion protège c5 calmement. La position est équilibrée. }
(11... Nd4?! { Le coup de la partie. Le cavalier saute au centre, mais il va être échangé et les Blancs gagneront du temps (Stockfish : +0,7 au lieu de 0,0). } 12. Bf4 { Le fou attaque la dame en gagnant un temps. Le meilleur coup. [%cal Gf4c7] } 12... Qb6?! { La dame reste active, mais 12...Nxf3+ était plus solide (Stockfish : +1,3 contre +0,7). } (12... Nxf3+ { Le meilleur coup : échanger le cavalier f3 avant qu'il ne saute en e5. } 13. Qxf3 { La dame reprend. } 13... e5 { Le pion chasse le fou et ferme la colonne e. La position noire reste solide. }) 13. Ne5! { Le cavalier saute en e5, sur la colonne e, et ouvre la diagonale du fou g2. [%cal Gg2a8] } 13... Nxb3 { Les Noirs éliminent le cavalier b3. 13...Bxe5 était un peu meilleur. } 14. Nc4! { Le cavalier attaque la dame au lieu de reprendre en b3. Il vise aussi d6. } 14... Qb5 { La dame reste près de l'action. } 15. axb3 { Les Blancs reprennent la pièce. Leur tour a1 arrive sur la colonne a. } 15... a5 { Le pion bloque l'aile dame. } 16. Bd6 { Le fou s'installe en d6 et attaque la tour f8 et le cavalier e7. } 16... Bf6? { La faute : le fou quitte la protection du roi. 16...Re8 limitait la casse (+1,6 contre +3,4). } (16... Re8 { Le meilleur coup : la tour reste près du roi et défend e7. }) 17. Qf3 { La dame attaque le fou f6. Les cases autour du roi noir sont affaiblies. [%cal Gf3f6] } 17... Kg7? { Le roi défend f6, mais il se met sur la route des pièces blanches. Stockfish donne désormais plus de +8. } 18. Re4! { LA TOUR MONTE PAR LA COLONNE E. Elle vise g4 et h4 pour rejoindre l'attaque. 18.Qxf6+! gagnait encore plus vite, mais la position est déjà décisive. [%cal Ge1e4,Ge4h4] } 18... Rd8 { Les Noirs n'ont pas de défense. } 19. Qxf6+! { Le sacrifice de dame. Le roi noir est attiré en avant. } 19... Kxf6 { Le roi prend. Refuser par 19...Kg8 ou 19...Kf8 ne sauvait rien non plus. } 20. Be5+ { Le fou donne échec. } 20... Kg5 { Le roi s'avance encore. } 21. Bg7! { Le fou ferme la route de fuite h6. Stockfish annonce un mat en quatre coups. Pachman a abandonné. [%csl Rg5] })`,
    ),
    chapter(
      "Schlage – Réti : la pression lente sur le pion c2",
      "r3kb1r/pp3ppp/2n1p3/2pq4/3P4/5N2/PPP2PPP/R1BQ1RK1 w kq - 2 10",
      `{ Berlin 1928. Une colonne semi-ouverte n'est pas réservée à l'attaque contre le roi : en finale, elle crée une pression LENTE et durable. Le pion adverse resté sur la colonne doit être gardé en permanence, et chaque pièce qui le garde est une pièce qui ne fait rien d'autre.

Dans cette partie, Réti (avec les Noirs) va obtenir la colonne c contre le pion c2 blanc, puis attendre patiemment que les Blancs s'affaiblissent.

PRO TIP : en finale, la cible d'une colonne semi-ouverte est souvent un pion sur sa case de départ (c2 ici). Il ne peut pas avancer sans créer de nouvelles faiblesses, et il immobilise ses défenseurs. }
10. dxc5 { Les Blancs prennent en c5. Résultat : il ne reste qu'un pion sur la colonne c, le pion c2 blanc. La colonne c devient semi-ouverte pour les Noirs. Stockfish préférait de peu 10.Be3. [%csl Rc2] [%cal Gc8c2] }
10... Qxd1 { Les Noirs échangent les dames. 10...O-O-O était aussi bon selon Stockfish. }
11. Rxd1 { La tour reprend sur la colonne d, maintenant totalement ouverte. }
11... Bxc5 { Le fou reprend le pion. Matériel égal, position équilibrée. }
12. Bf4 { Le fou se développe. 12.Kf1 ou 12.c3 étaient un peu plus précis. }
12... Ke7 { Sans les dames, le roi n'a plus peur : il vient au centre, où il défend la case d7 et la 7e rangée. }
13. Ne5 { Le cavalier se centralise et propose un échange. }
13... Nxe5 { Les Noirs acceptent l'échange. Le meilleur coup. }
14. Bxe5 { Le fou reprend. }
14... f6 { Le pion chasse le fou. Le meilleur coup. }
15. Bc3 { Le fou se replie sur la grande diagonale. }
15... Rhd8 { La tour conteste la colonne d ouverte. 15...e5 était un peu plus précis. }
16. Ba5 { Le fou attaque la tour d8. Stockfish préférait 16.Kf1. [%cal Ga5d8] }
16... Rxd1+ { Les Noirs échangent les tours sur la colonne d. }
17. Rxd1 { La tour reprend. La colonne d appartient pour l'instant aux Blancs. }
17... Rc8 { LA TOUR PREND LA COLONNE SEMI-OUVERTE. Elle fait face au pion c2, qui n'a plus de pion b ou d voisin capable de le soutenir en avançant. [%cal Gc8c2] }
18. a4 { Le pion prend de l'espace. 18.Be1 était un peu meilleur. }
18... Bd6 { Le fou protège la 7e rangée et vise h2. }
19. Rd2 { PREMIÈRE CONCESSION : la tour quitte la colonne d ouverte pour défendre c2. Stockfish préférait 19.Bc3 (-0,6 contre -0,9). [%cal Gd2c2] }
19... Rc6 { La tour monte en c6. Elle pourra glisser en c4 ou sur la 6e rangée. 19...b6 était un peu plus précis. }
20. Bc3 { Le fou revient sur la diagonale centrale. Le meilleur coup. }
20... e5 { Le pion ferme la diagonale du fou c3 et prend le centre. Le roi noir va s'installer en e6. }
21. Rd3 { La tour attaque le fou d6. 21.a5 était un peu meilleur. }
21... Ke6 { Le roi protège le fou d6. Il est actif au centre, alors que le roi blanc est encore en g1. }
22. Rh3 { La tour cherche du jeu contre le pion h7. }
22... h6 { Le pion se met à l'abri. }
23. Kf1 { Le meilleur coup selon Stockfish : le roi se rapproche du centre et de la défense de c2. Les Noirs gardent un léger avantage (environ -0,4), grâce à leur roi actif et à la colonne c. }
(23. Rg3?! { Le coup de la partie : la tour s'éloigne encore de l'aile dame (Stockfish : -0,9 au lieu de -0,4). } 23... g5 { Le pion protège g7 et prend de l'espace. Le meilleur coup. } 24. Rh3 { La tour revient, sans plan. } 24... Bf8 { Le fou se replace pour protéger h6. 24...Rc4 était plus direct. } 25. Rd3 { La tour revient sur la colonne d. } 25... Rc4! { La tour entre en c4 et attaque le pion a4. Le meilleur coup. [%cal Gc4a4] } 26. b3 { Le pion protège a4, mais il ne protège plus le fou c3. La colonne c devient encore plus sensible. [%csl Rc3,Rc2] } 26... Rc7 { La tour revient en c7 : elle garde la colonne et attend. Le meilleur coup. } 27. f3 { Les Blancs donnent une case à leur roi. } 27... f5 { Réti ouvre un SECOND FRONT à l'aile roi avec ...f4 et ...e4. Les Blancs ne peuvent pas tout défendre, car leurs pièces gardent c2. Réti a fini par prendre ce pion (31...Rxc2) et a gagné la partie.

PRO TIP : une colonne semi-ouverte fixe les défenseurs d'un côté. Le moment venu, frappe de l'AUTRE côté : c'est le principe des deux faiblesses. })`,
    ),
    chapter(
      "Hracek – Cebalo : le sacrifice de qualité ...Rxc3",
      "r1r3k1/pp1bppbp/3p1np1/q3n2P/3NP3/1BN1BP2/PPPQ2P1/2KR3R b - - 0 13",
      `{ Medulin 2002, Sicilienne Dragon, attaque yougoslave. Les Blancs ont roqué du grand côté et lancent leur pion h contre le roi noir. Les Noirs ont la colonne c semi-ouverte, et leurs deux pièces lourdes (tour c8, dame a5) visent le cavalier c3.

Ce cavalier est la pièce clé de la défense blanche : il protège a2, b1, d5 et e4. L'idée thématique est de le prendre avec la tour : ...Rxc3. Les Noirs donnent une tour contre un cavalier (la « qualité »), mais ils brisent les pions qui protègent le roi blanc.

Avant ce chapitre : 13.h5 n'était pas le plus précis (Stockfish préférait 13.Kb1, +0,9 contre +0,35).

PRO TIP : sur une colonne semi-ouverte face à un roi roqué, la pièce qui bouche la colonne (souvent un cavalier en c3) mérite parfois un sacrifice. On paie avec du matériel, on reçoit des pions doublés et un roi affaibli. [%cal Gc8c3,Ga5c3] }
13... Rxc3 { LE SACRIFICE THÉMATIQUE. La tour prend le cavalier c3. Stockfish le juge correct (+0,6), à peine moins précis que 13...Nxh5. [%csl Rc3] }
14. Qxc3 { Le meilleur coup selon Stockfish : la dame reprend et propose l'échange des dames, ce qui calme l'attaque noire. }
(14. bxc3?! { Le coup de la partie : le pion reprend et la structure du roi blanc est brisée. Stockfish ramène l'évaluation à 0,0. [%csl Rc3,Rc2] } 14... Nxh5 { Le cavalier prend h5 et ferme la colonne h. Les Noirs ont un pion pour la qualité. } 15. Bh6 { Les Blancs échangent le fou qui défend le roi noir. } 15... Bxh6 { Les Noirs échangent. } 16. Qxh6 { La dame s'installe près du roi noir. } 16... Nf6! { Le cavalier revient défendre h7 et empêche un sacrifice sur h5. } 17. Kb2?! { Le roi protège c3, mais Stockfish préférait 17.Kb1 (0,0 contre -0,6). } (17. Kb1 { Le meilleur coup : le roi s'éloigne de la diagonale de la dame noire. }) 17... Rc8 { La seconde tour arrive sur la colonne c, contre le pion c3. LA COLONNE SEMI-OUVERTE travaille : c3 et c2 doivent être défendus. [%cal Gc8c3] } 18. Qe3 { La dame revient défendre c3. Les Blancs sont déjà sur la défensive. } 18... Qc5 { La dame vise c3 une seconde fois et propose l'échange. } 19. Rh4? { La tour veut aller en h7, mais ce n'est pas le moment (Stockfish : -1,7 au lieu de -0,6). } (19. Ra1 { Le meilleur coup : la tour reste près du roi. }) 19... a5 { Le pion a part à l'assaut du roi blanc. Le meilleur coup. } 20. Rdh1 { Les tours sont doublées sur la colonne h, mais le roi blanc est seul. } 20... a4! { Le meilleur coup : le pion attaque le fou b3, qui protège le roi (Stockfish : -2,7). Cebalo a joué 20...e6 (-1,0), puis a gagné après 21.a4 b5!.

PRO TIP : après ...Rxc3, l'attaque des Noirs vient de la colonne c ET des pions a et b. Le roi blanc, privé de ses pions, ne peut pas résister longtemps. [%cal Ga4b3] })
14... Qxc3 { Les Noirs échangent. Sans dames, l'attaque est finie. }
15. bxc3 { Les Blancs reprennent : ils ont maintenant des pions doublés en c2 et c3. }
15... Nxh5 { Le cavalier prend le pion h5. Les Noirs ont un pion pour la qualité et une structure blanche abîmée. }
16. g4 { Le pion chasse le cavalier. Les Blancs gardent un petit avantage (environ +0,6), mais les Noirs ont une position solide.

PRO TIP : même quand l'adversaire échange les dames, le sacrifice ...Rxc3 laisse des traces : les pions c doublés resteront faibles jusqu'à la fin. }`,
    ),
    chapter(
      "Tarrasch – Alekhine : la colonne f vers le roi",
      "3r1rk1/pb1nq1pp/3bpn2/1Ppp4/8/1PN1PN2/PB2BPPP/R2Q1RK1 w - - 5 13",
      `{ Bad Pistyan 1922. Alekhine a les Noirs. Les Noirs n'ont plus de pion f : la colonne f est semi-ouverte pour eux, face au pion f2, juste devant le roi blanc. Leur tour f8 y est déjà installée.

Les autres pièces noires visent aussi l'aile roi : le fou d6 regarde h2, le fou b7 regarde la grande diagonale, et les pions c5 et d5 sont prêts à avancer pour chasser les défenseurs blancs.

PRO TIP : une colonne semi-ouverte qui mène au roi adverse n'est pas seulement une ligne pour la tour. C'est un AXE d'attaque : chaque pièce qui chasse un défenseur de f2 (ou de f3) rend la tour plus dangereuse. [%csl Rf2] [%cal Gf8f2,Gd6h2,Gb7g2] }
13. Qc2 { La dame se développe et surveille e4 et h7. Le meilleur coup selon Stockfish (environ -0,6). [%cal Gc2h7] }
13... e5 { Le pion avance et prépare ...e4, qui chassera le cavalier f3, le meilleur défenseur du roi blanc. Le meilleur coup. [%cal Ge5e4,Ge4f3] }
14. Nh4 { Le meilleur coup selon Stockfish : le cavalier quitte f3 AVANT d'être chassé et vise la case f5. Les Noirs gardent un léger avantage (-0,6). [%cal Gh4f5] }
(14. Rfe1? { Le coup de la partie. La tour quitte la colonne f, et le roi perd un défenseur. Stockfish : -2,2 au lieu de -0,6. } 14... e4 { Le pion chasse le cavalier f3. Le meilleur coup. [%cal Ge4f3] } 15. Nd2 { Le meilleur coup. Le cavalier recule, mais f3 n'est plus protégé. } 15... Ne5 { Le cavalier se rapproche du roi blanc. Le meilleur coup. [%cal Ge5f3,Ge5g4] } 16. Nd1 { Le cavalier vient défendre f2. 16.h3 était un peu plus précis. } 16... Nfg4 { Le meilleur coup. Le cavalier attaque f2 et h2, et la tour f8 attaque f2 à travers la colonne. [%cal Gg4f2,Gf8f2,Gg4h2] } 17. Bxg4 { Les Blancs échangent un attaquant. 17.g3 était un peu meilleur. } 17... Nxg4 { L'autre cavalier reprend : la pression sur f2 et h2 ne change pas. } 18. Nf1 { Le cavalier défend h2. Stockfish préférait 18.g3, mais la position blanche est déjà très difficile (environ -3,5). } 18... Qg5 { La dame rejoint l'attaque. 18...Qh4 était plus précis, sans changer l'évaluation. } 19. h3 { Le pion chasse le cavalier, mais affaiblit g3. } 19... Nh6 { Le cavalier recule pour revenir en f5. } 20. Kh1 { Le roi quitte la colonne g. } 20... Nf5 { Le cavalier revient, avec les cases g3 et h4 en vue. [%cal Gf5g3,Gf5h4] } 21. Nh2 { Le meilleur coup. Le cavalier défend g4. } 21... d4 { Le pion d avance et ouvre la diagonale du fou b7. } 22. Bc1 { Une erreur (Stockfish : -5,3). Le fou recule et abandonne la grande diagonale. } 22... d3 { Le pion passé s'enfonce en d3 et coupe les pièces blanches en deux. 22...Ng3+ était encore plus fort. [%csl Gd3] } 23. Qc4+ { La dame donne échec. } 23... Kh8 { Le roi s'écarte. Le meilleur coup. } 24. Bb2 { Le fou revient sur la grande diagonale. } 24... Ng3+ { LA COLONNE F TRAVAILLE. Le cavalier entre en g3 avec échec. Si les Blancs le prennent avec fxg3, la colonne f s'ouvre complètement vers leur roi (Stockfish : -10,7). [%cal Gf8f1] } 25. Kg1 { Le seul coup raisonnable. } 25... Bd5 { Le fou chasse la dame. } 26. Qa4 { La dame s'éloigne de l'aile roi. } 26... Ne2+ { Le cavalier redonne échec. } 27. Kh1 { Le roi revient en h1. } 27... Rf7 { La tour reste sur la colonne f et protège la 7e rangée. 27...Ng3+ était plus précis, mais la position reste gagnante. } 28. Qa6 { La dame cherche du contre-jeu à l'aile dame. } 28... h5 { Le pion h avance pour soutenir l'attaque. } 29. b6 { Les Blancs tentent de créer un pion passé. } 29... Ng3+ { Nouvel échec. } 30. Kg1 { Le roi revient. } 30... axb6 { Les Noirs éliminent le pion b6. } 31. Qxb6 { La dame reprend. } 31... Ne2+ { Le cavalier gagne du temps avec des échecs. } 32. Kh1 { Le roi revient en h1. } 32... Ng3+ { Encore un échec. } 33. Kg1 { Le roi revient en g1. } 33... d2 { Le pion attaque la tour e1. 33...Be6 était plus fort, mais tout gagne. [%cal Gd2e1] } 34. Rf1 { La tour fuit en f1, une case contrôlée par le cavalier g3. } 34... Nxf1 { Le cavalier prend la tour. } 35. Nxf1 { Le cavalier reprend. } 35... Be6 { Le fou vise le pion h3, le dernier abri du roi. [%cal Ge6h3] } 36. Kh1 { Une erreur dans une position déjà perdue (Stockfish : -7,4). } 36... Bxh3 { LE SACRIFICE. Le fou se donne pour ouvrir le roi blanc. Le meilleur coup. } 37. gxh3 { Les Blancs acceptent. } 37... Rf3 { LA TOUR ENTRE PAR LA COLONNE F. Elle attaque h3 et vise le roi. Le meilleur coup. [%cal Gf3h3] } 38. Ng3 { Le cavalier vient se défendre. Le meilleur coup. } 38... h4 { Le pion chasse le cavalier. 38...Bxg3 était encore plus fort. } 39. Bf6 { Une tentative désespérée. } 39... Qxf6 { La dame prend le fou. } 40. Nxe4 { Le cavalier attaque la dame. } 40... Rxh3+ { La tour prend h3 avec échec. } 41. Kg2 { Le roi avance, mais il va se faire mater. } 41... Qf3+ { La dame entre en f3, sur la colonne f. } 42. Kg1 { Le roi recule. } 42... Rh1# { Mat.

PRO TIP : toute l'attaque a tourné autour de la colonne f. Les pièces noires ont chassé un à un les défenseurs de f2 et de f3, puis la tour et la dame sont entrées par cette colonne. })
14... g6 { Le pion empêche le cavalier d'entrer en f5. Le meilleur coup. }
15. g3 { Le pion contrôle f4 et h4. Le meilleur coup. }
15... e4 { Le pion prend de l'espace et contrôle f3 et d3. Le meilleur coup. [%csl Ge4] }
16. Rae1 { La tour se prépare à défendre le centre. Le meilleur coup. }
16... Ne5 { Le cavalier vise f3 et d3. Les Noirs gardent un léger avantage (environ -0,6).

PRO TIP : la meilleure défense contre une colonne semi-ouverte dirigée vers ton roi, c'est de déplacer tes pièces AVANT qu'on ne les chasse, comme le cavalier ici (14.Nh4). }`,
    ),
    chapter(
      "Kramnik – Leko : la rupture qui ouvre la colonne g",
      "r3k2r/pp1b1pp1/4p1np/3pP3/3P2PP/3B1N2/PP1K1P2/R6R b kq - 0 17",
      `{ Brissago 2004, 14e partie du match pour le titre mondial. Kramnik devait gagner pour garder son titre. Les dames ont été échangées. Les Blancs ont avancé leurs pions g et h. Le roi noir est resté au centre.

Une colonne semi-ouverte peut naître d'une RUPTURE de pions en milieu de partie. Ici, l'échange gxh5 va ouvrir la colonne g pour les Blancs, face au pion g7, et la colonne h pour les Noirs, face au pion h4.

PRO TIP : place ta tour sur une colonne AVANT qu'elle ne s'ouvre. Quand l'échange de pions arrive, la tour est déjà en place. [%cal Gh1g1] }
17... Nf4 { Le cavalier vient en f4 et attaque le fou d3. 17...Ne7 était un peu plus précis selon Stockfish. [%cal Gf4d3] }
18. Rac1 { La tour prend la colonne c, totalement ouverte. Le meilleur coup. }
18... h5 { Les Noirs veulent échanger les pions de l'aile roi. Le meilleur coup. }
19. Rhg1 { LA TOUR AVANT LA COLONNE. La tour se place en g1, derrière le pion g4. Après gxh5, elle attaquera directement le pion g7. Le meilleur coup. [%cal Gg1g7] }
19... Bc6 { Le fou se développe. 19...Nh3 était un peu meilleur. }
20. gxh5 { L'ÉCHANGE QUI OUVRE LA COLONNE. Les Blancs n'ont plus de pion g : la colonne g est semi-ouverte pour eux, face au pion g7. [%csl Rg7] [%cal Gg1g7] }
20... Nxh5 { Le cavalier reprend. La colonne h est semi-ouverte pour les Noirs, face au pion h4. Chaque camp a sa colonne, mais le roi noir, resté en e8, est plus exposé. }
21. b4 { Le pion prend de l'espace à l'aile dame. 21.Ke3 était équivalent. }
21... a6 { Le pion freine b5. Le meilleur coup. }
22. a4 { Le pion soutient b5. 22.Ke3 était un peu plus précis. }
22... Bxa4 { Le meilleur coup selon Stockfish : les Noirs prennent le pion a4 et la position reste à peine favorable aux Blancs (+0,8). }
(22... Kd8? { Le coup de la partie. Le roi reste au centre et laisse les Blancs prendre l'initiative (Stockfish : +1,5 au lieu de +0,8). } 23. Ng5 { Le cavalier attaque f7 et e6. Le meilleur coup. [%cal Gg5f7] } 23... Be8 { Le fou défend f7. Le meilleur coup. } 24. b5 { La rupture à l'aile dame : les Blancs ouvrent une seconde colonne. } 24... Nf4?! { Le cavalier attaque d3. 24...axb5 était plus solide (Stockfish : +1,4 contre +2,5). } (24... axb5 { Le meilleur coup : les Noirs échangent les pions avant que b6 ne fixe leur aile dame. }) 25. b6! { Le pion se fixe en b6. Il contrôle c7 et fixe le pion b7. Le meilleur coup. [%csl Gb6,Rb7] } 25... Nxd3 { Le cavalier prend le fou. } 26. Kxd3 { Le roi reprend et se rapproche du centre. Stockfish donne plus de +3. } 26... Rc8 { Les Noirs contestent la colonne c. } 27. Rxc8+ { Les Blancs échangent. } 27... Kxc8 { Le roi reprend. } 28. Rc1+ { La seconde tour prend la colonne c avec échec. } 28... Bc6 { Le fou s'interpose. } 29. Nxf7 { Le cavalier prend le pion f7 et attaque la tour h8. } 29... Rxh4 { La tour s'échappe en prenant le pion h4. } 30. Nd6+ { Le cavalier revient avec échec. } 30... Kd8 { Le roi recule. } 31. Rg1 { LA TOUR REVIENT SUR LA COLONNE G. Le pion g7 est sa cible depuis le 20e coup. [%cal Gg1g7] } 31... Rh3+ { La tour donne échec. } 32. Ke2 { Le roi s'avance. } 32... Ra3 { La tour cherche du contre-jeu contre le pion a4. 32...Rh7 défendait mieux, mais la position est perdue. } 33. Rxg7 { La tour prend g7 et entre en 7e rangée. La colonne g a rempli sa mission. [%csl Gg7] } 33... Rxa4 { Les Noirs prennent un pion. } 34. f4 { Le pion soutient e5 et prépare f5. Le roi noir est pris dans un filet (tour g7, cavalier d6, pion b6). Kramnik a donné mat au 43e coup.

PRO TIP : une colonne semi-ouverte contre un pion de l'aile roi donne un objectif à long terme. Même après des échanges, la tour revient toujours sur cette colonne. })
23. Rc7 { La tour entre en 7e rangée, contre les pions b7 et f7. [%cal Gc7b7,Gc7f7] }
23... O-O { Le roi noir quitte enfin le centre. }
24. Ng5 { Le cavalier vise h7 et f7, avec l'aide du fou d3 et de la tour sur la colonne g. [%cal Gg5h7,Gd3h7] }`,
    ),
  ],
};
