import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « Cavalier contre fou : qui domine ? » (positional_mastery, module 4)
 * — refonte « un commentaire par coup » du 2026-10-10.
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, entièrement
 * réécrite ici) : Foltys – Gomonbek (étude Lichess « 62 The Most Instructive
 * Games of Chess ever Played », https://lichess.org/study/w2JcfP5K),
 * Fischer – Petrosian, Buenos Aires 1971 (7e partie, étude Lichess « The
 * octopus knight »), Fischer – Taimanov, Vancouver 1971 (2e partie, étude
 * Lichess « Fischer - Taimanov Candidates Quarterfinal »). Les principes du
 * chapitre 1 s'inspirent de Jeremy Silman, « How to Reassess Your Chess »
 * (partie « Minor Pieces »), reformulés.
 *
 * Chaque affirmation a été contrôlée avec Stockfish 18 (profondeur 20). Règle
 * appliquée : quand un coup est nettement moins bon que le choix du moteur,
 * la LIGNE PRINCIPALE suit le moteur et la suite de la partie passe en
 * variante, signalée comme fautive ; les écarts minimes sont mentionnés.
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

export const CAVALIER_CONTRE_FOU: CourseTree = {
  chapters: [
    chapter(
      "Fou ou cavalier : comment juger ?",
      "1r3r1k/pp1b2q1/4p2p/1PPpNp2/5P2/7P/P2Q2P1/3RR1K1 w - - 2 29",
      `{ Un fou et un cavalier valent environ trois pions chacun, mais leur valeur réelle dépend entièrement de la position. Avant d'échanger l'un contre l'autre, pose-toi ces questions :

1. La position est-elle ouverte ou fermée ? Le fou aime les diagonales libres ; le cavalier, lui, saute par-dessus les pions et se plaît dans les positions bloquées.
2. Le cavalier a-t-il une case forte, un avant-poste d'où personne ne peut le chasser ? Si oui, peut-il l'atteindre, et y sera-t-il utile, près de l'action ?
3. Où sont les pions ? Un fou bloqué derrière ses propres pions, placés sur des cases de sa couleur, est un « mauvais fou ». Des pions sur les deux ailes favorisent le fou, qui frappe à longue distance.

Ici, tout favorise le cavalier blanc. Il est en e5, protégé par f4, et aucun pion noir ne pourra jamais le chasser (le pion d est déjà en d5, le pion f en f5). Le fou noir d7, lui, est enfermé derrière d5, e6 et f5, tous sur cases blanches : c'est un mauvais fou. Stockfish donne environ +2,4 aux Blancs.

PRO TIP : la méthode de Steinitz contre les cavaliers, c'est de leur ôter toutes leurs cases d'appui avancées. Sans avant-poste, un cavalier perd presque toujours contre un fou dans une position ouverte. [%csl Ge5,Rd7][%cal Ge5d7,Ge5c6] } *`,
    ),
    chapter(
      "Foltys – Gomonbek : le cavalier en e5 contre le mauvais fou",
      "1r3r1k/pp1b1n2/3Npq1p/1PPp1p2/5P2/5N1P/P2Q2P1/3RR1K1 w - - 0 27",
      `{ Les Blancs ont un cavalier puissant en d6 et un autre en f3. Les Noirs n'ont plus que leur fou de cases blanches, enfermé derrière ses pions, et un cavalier en f7, la seule pièce capable de contester les cases centrales. Le plan blanc : échanger ce cavalier pour obtenir un bon cavalier contre un mauvais fou. }
27. Nxf7+ { Le cavalier d6 élimine le cavalier f7, le seul qui pouvait défendre e5. Stockfish place 27.Rc1 un peu devant, mais le plan est limpide. }
27... Qxf7 { La dame reprend. 27...Rxf7 était plus solide (Stockfish). }
28. Ne5 { L'autre cavalier s'installe sur l'avant-poste e5 : il attaque le fou d7 et la dame f7. Stockfish préférait 28.c6, encore plus fort. [%csl Ge5] }
28... Qg7 { La dame s'écarte et attaque le cavalier e5 et le pion g2. }
29. Qd4 { La dame protège e5 et vise le pion d5. }
29... Kh7 { Le roi s'écarte de la diagonale. 29...Be8 était plus tenace. }
30. c6! { La rupture : le pion attaque b7 et le fou d7, et va ouvrir l'aile dame. [%cal Gc5c6] }
30... Rg8 { La tour vient sur la colonne g. }
31. Rd2 { La tour protège g2 le long de la 2e rangée. }
31... bxc6 { Les Noirs prennent. }
32. Qxa7 { La dame prend a7 et attaque la tour b8 et le fou d7. }
32... Rbd8 { La tour se met à l'abri. }
33. bxc6 { Le pion reprend et attaque le fou d7 : les Blancs ont un pion passé en c6. }
33... Bc8 { Le fou recule, toujours aussi passif. }
34. Qxg7+ { Les Blancs échangent les dames. Stockfish préférait 34.Qf2, mais la finale est gagnante. }
34... Kxg7 { Le roi reprend. }
35. Rb1 { La tour prend la colonne b ouverte. }
35... Ba6 { Le fou sort enfin. }
36. Rb6 { La tour attaque le fou a6. }
36... Ra8 { La tour protège le fou. }
37. Rdb2 { Les tours se doublent sur la colonne b. }
37... h5 { La meilleure défense selon Stockfish (environ +3,8) : les Noirs gagnent un peu d'espace et gardent leur roi près du centre. }
(37... Kf6? { Le coup de la partie attaque le cavalier, mais permet une combinaison (environ +5,7). } 38. Rxa6! { La tour prend le fou… } 38... Rxa6 { …et la tour noire reprend. } 39. Rb7 { L'autre tour entre en 7e rangée : le pion c6 va avancer. } 39... Rg7 { La tour noire défend la 7e rangée. } 40. c7 { Le pion arrive en 7e. } 40... Ra8 { La tour surveille c8. } 41. Rb8 { La tour attaque la tour a8. } 41... Rg8 { Les Noirs abandonnent après 42.Rxa8 : sur 42...Rxa8, 43.Nd7+ suivi de Nb8 coupe la tour noire de c8, et le pion fait dame. Il fallait 41...Rxc7 (Stockfish). } 42. Rxa8 { Les Noirs abandonnent.

PRO TIP : quand ton cavalier domine un mauvais fou, ouvre une deuxième ligne de front (ici la rupture c5-c6) : le fou, coincé derrière ses pions, ne peut pas défendre partout. } 1-0)
38. a4 { Le pion avance. }
38... Bc8 { Le fou revient. Les Blancs restent largement gagnants : le cavalier e5 et les tours actives dominent un fou qui n'a aucune case.

PRO TIP : quand ton cavalier domine un mauvais fou, ouvre une deuxième ligne de front (ici la rupture c5-c6) : le fou, coincé derrière ses pions, ne peut pas défendre partout. } *`,
    ),
    chapter(
      "Fischer – Petrosian, Buenos Aires 1971 : le fou contre le cavalier",
      "r4k2/r2b1ppp/p4n2/2NpR3/1P6/3B1P2/P5PP/R5K1 w - - 0 22",
      `{ La 7e partie de la finale des Candidats. Fischer va faire un choix célèbre : échanger son cavalier actif contre le fou d7, pour garder un fou contre un cavalier. Dans une position ouverte, avec des pions sur les deux ailes, c'est le fou qui sera la meilleure pièce. }
22. Nxd7+ { Le coup de Fischer : il élimine le fou noir et ouvre la colonne c. Stockfish préfère 22.a4 (+1,4 contre +0,9), mais le fou contre cavalier reste nettement favorable aux Blancs. }
22... Rxd7 { La tour reprend. }
23. Rc1 { La tour prend la colonne c ouverte. }
23... Rd6 { La tour se place en 6e rangée. 23...Ne8 était un peu plus précis (Stockfish). }
24. Rc7 { La tour entre en 7e rangée et attaque f7. }
24... Nd7 { Le cavalier attaque la tour e5 et protège f6 et b6. }
25. Re2 { La tour recule. }
25... g6 { Le pion protège f5 et h5. }
26. Kf2 { Le roi blanc se rapproche du centre : en finale, c'est une pièce active. }
26... h5 { Les Noirs gagnent de l'espace sur l'aile roi. }
27. f4 { Le pion prive le cavalier de e5 et g5. Stockfish préférait 27.a4, mais l'idée de restreindre le cavalier est juste. }
27... h4 { Le pion avance encore. }
28. Kf3 { Le roi continue sa route. }
28... f5 { Les Noirs placent leurs pions sur cases blanches (d5, f5, g6) : ils deviendront des cibles pour le fou de cases blanches. 28...Nb6 était plus précis. }
29. Ke3 { Le roi vise d4. }
29... d4+ { Le pion avance avec échec. }
30. Kd2 { Le roi s'écarte. }
30... Nb6 { Une imprécision (environ +1,4 → +2,5) : 30...Kf7 gardait le roi en défense. }
31. Ree7 { Les deux tours sont en 7e rangée. }
31... Nd5 { Le cavalier attaque les deux tours ainsi que b4 et f4. }
32. Rf7+ { La tour s'échappe avec échec. }
32... Ke8 { Le roi recule. }
33. Rb7 { L'autre tour s'écarte, et les deux tours restent en 7e rangée. }
33... Rb8 { La meilleure défense selon Stockfish (environ +3,2) : la tour vient défier la tour b7. }
(33... Nxf4? { Le coup de la partie prend un pion, mais éloigne le cavalier (environ +6,2). } 34. Bc4! { Le fou entre en jeu : avec les deux tours en 7e rangée, il crée des menaces de mat que les Noirs ne peuvent plus parer. Petrosian abandonne.

PRO TIP : dans une position ouverte avec des pions sur les deux ailes, le fou domine le cavalier. Fixe les pions adverses sur les cases de la couleur de ton fou : ils deviennent ses cibles. } 1-0)
34. Ra7 { La tour attaque a6. }
34... Nf6 { Le cavalier revient défendre. Les Blancs restent nettement mieux : leurs tours en 7e rangée et leur fou dominent.

PRO TIP : dans une position ouverte avec des pions sur les deux ailes, le fou domine le cavalier. Fixe les pions adverses sur les cases de la couleur de ton fou : ils deviennent ses cibles. } *`,
    ),
    chapter(
      "Fischer – Taimanov, Vancouver 1971 : fou et pion h contre cavalier",
      "8/5r2/R7/3knK2/6B1/7P/8/8 w - - 18 80",
      `{ Une finale célèbre. Les Blancs ont un fou et un pion h ; les Noirs un cavalier. Attention : le fou blanc est de cases blanches, et la case de promotion h8 est noire. Si le roi noir atteint le coin, ou si le cavalier peut se sacrifier contre le pion, c'est nulle. Tout se joue sur la distance du roi noir. [%csl Rh8] }
80. Rf6 { Les Blancs proposent l'échange des tours. }
80... Rxf6+ { Les Noirs acceptent. 80...Rg7 était un peu plus prudent (Stockfish), mais la finale reste nulle. }
81. Kxf6 { Le roi reprend. Fou et pion h contre cavalier : la position est encore nulle. }
81... Kd6 { La bonne défense selon Stockfish (environ +0,5, nulle) : le roi reste près de l'aile roi et du coin h8, et le cavalier peut toujours se sacrifier contre le pion. }
(81... Ke4?? { Le coup de la partie éloigne le roi du coin : la position devient perdue (environ +4,4). } 82. Bc8! { Le fou protège le pion h3 depuis c8 : le roi noir ne peut plus le prendre. } 82... Kf4 { Le roi noir tente quand même de l'approcher. } 83. h4 { Le pion avance, à l'abri du roi noir. } 83... Nf3 { Le cavalier attaque h4. } 84. h5 { Le pion avance encore. } 84... Ng5 { Le cavalier vient contrôler h7. } 85. Bf5 { Le fou contrôle h7 lui aussi et prive le cavalier de cases. } 85... Nf3 { Le cavalier cherche une autre route. } 86. h6 { Le pion avance. } 86... Ng5 { Le cavalier revient. } 87. Kg6 { Le roi attaque le cavalier et protège la case h7. } 87... Nf3 { Le cavalier s'écarte. } 88. h7 { Le pion arrive en 7e. } 88... Ne5+ { Le cavalier donne un dernier échec… } 89. Kf6 { …et le roi s'écarte en attaquant le cavalier. Même si le cavalier revient en g6 pour surveiller h8, Stockfish voit un gain forcé. Taimanov abandonne.

PRO TIP : fou et pion de bord avec un fou qui ne contrôle pas la case de promotion, c'est nulle si le roi défenseur atteint le coin. En défense, ne laisse jamais ton roi s'éloigner de la case de promotion. } 1-0)
82. Bf5 { Le fou contrôle h7 et les cases blanches. }
82... Nf3 { Le cavalier contrôle h4 et h2 : le pion h3 ne peut plus avancer sans être pris. }
83. Be4 { Le fou chasse le cavalier. }
83... Ne5 { Le cavalier se recentre : il surveille g6 et f7, et le roi noir reste à portée du coin. La position est nulle.

PRO TIP : fou et pion de bord avec un fou qui ne contrôle pas la case de promotion, c'est nulle si le roi défenseur atteint le coin. En défense, ne laisse jamais ton roi s'éloigner de la case de promotion. } *`,
    ),
  ],
};
