import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « Les pions pendants » (positional_mastery, module 6) — refonte « un
 * commentaire par coup » du 2026-10-10.
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, entièrement
 * réécrite ici) : Mauricio Flores Rios, « Chess Structures — A Grandmaster
 * Guide » (Quality Chess, 2015), chapitre 2 « Hanging Pawns » : Mecking –
 * Mareco (Campinas 2011), Aronian – Stević (Porto Carras 2011), Korobov –
 * Madeja (Varsovie 2010), Mareco – Toth (Osasco 2012), Bachmann – Cornejo
 * (Asuncion 2009), Madeja – Hernandez (Mexico 2012).
 *
 * Les parties ont été relevées dans le texte extrait du PDF (figurines
 * reconstituées à la main) puis rejouées avec chess.js. Le 15e coup noir de
 * Mareco – Toth, absent du texte, a été retrouvé par recherche exhaustive
 * (15...Qa5, seul coup compatible avec la suite de la partie et avec la note
 * du livre sur 16...Qxa2?). Bachmann – Cornejo s'arrête au 27e coup : la
 * suite manque dans le texte. Aronian – Stević s'arrête au 26e coup, comme
 * dans le livre.
 *
 * Chaque affirmation a été contrôlée avec Stockfish 18 (profondeur 18). Règle
 * appliquée (comme pour le module 3) : quand un coup est nettement moins bon
 * que le choix du moteur, la LIGNE PRINCIPALE suit le moteur et la suite de
 * la partie passe en variante, signalée comme fautive ; les écarts minimes
 * sont seulement mentionnés.
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

export const LES_PIONS_PENDANTS: CourseTree = {
  chapters: [
    chapter(
      "Les pions pendants : la structure et les plans",
      "3rr1k1/p1qn1ppp/1pb1pn2/8/2PP4/BQ3N2/P3BPPP/R3R1K1 w - - 3 17",
      `{ Les pions pendants, ce sont deux pions côte à côte sur les colonnes c et d (ici c4 et d4), sans aucun pion voisin pour les soutenir : les colonnes b et e sont vides. Ils naissent le plus souvent d'une position de pion isolé, quand un échange de cavaliers sur c3 permet au pion b de reprendre puis de monter en c4.

Atouts des Blancs : les deux pions contrôlent b5, c5, d5 et e5, ce qui donne de l'espace et des cases pour les pièces. Plans typiques : une attaque sur l'aile roi (cavalier en e5, fou vers d3, tour levée par la 3e rangée), et surtout la poussée d4-d5, qui ouvre les lignes ou crée un pion passé.

Atouts des Noirs : ces pions sont des cibles sur colonnes semi-ouvertes. Plans typiques : échanger les pièces (une finale rend les pions faibles), les bloquer en installant une pièce juste devant (en c5 ou d5), ou les casser par les ruptures ...b6-b5 ou ...e6-e5.

PRO TIP : face aux pions pendants, le joueur qui les possède cherche l'attaque et la poussée d4-d5 ; celui qui joue contre cherche à échanger, bloquer ou casser. Chaque coup doit servir l'un de ces plans. [%csl Yc4,Yd4][%cal Gd4d5,Rb6b5,Re6e5] } *`,
    ),
    chapter(
      "Mecking – Mareco, Campinas 2011 : la poussée d4-d5 et l'attaque",
      "rnbq1rk1/p4ppp/1p2pn2/8/2BP4/1QP2N2/P4PPP/R1B2RK1 b - - 0 11",
      `{ Une Nimzo-Indienne : après 10.Qb3 Bxc3 11.bxc3, les Blancs ont la paire de fous et vont pousser c3-c4 pour former des pions pendants. Dans une position ouverte, leurs deux fous seront redoutables. }
11... Bb7 { Le fou se développe sur la grande diagonale, face au roi blanc. 11...Nc6 était à peine plus précis (Stockfish). }
12. Ba3 { Le fou attaque la tour f8 sur la diagonale a3-f8. }
12... Re8 { La tour s'écarte. }
13. Bb5 { Le fou attaque la tour e8 : il oblige le fou noir à venir en c6, une case où il sera exposé. }
13... Bc6 { Le fou bloque l'attaque. 13...Nc6 était plus solide (Stockfish). }
14. Be2 { Le fou recule, et les Blancs peuvent maintenant pousser c3-c4. }
14... Nbd7 { Développement. 14...a6 était un peu plus actif. }
15. c4 { Voilà les pions pendants c4-d4. Ils contrôlent b5, c5, d5 et e5. [%csl Yc4,Yd4] }
15... Qc7 { La dame vise h2 et la colonne c. }
16. Rfe1 { La tour occupe la colonne e, en vue d'une attaque. }
16... Rad8 { La tour met la pression sur d4. }
17. Bb2 { Le fou revient protéger d4 sur la grande diagonale. Stockfish préférait 17.Rad1. }
17... Nf8 { Le cavalier se replie vers g6. Plus actif était 17...Ng4, qui provoquait des faiblesses (Stockfish). }
18. Ne5 { Le cavalier s'installe en e5, protégé par d4 : il attaque le fou c6 et le pion f7. [%csl Ge5] }
18... Ba8 { Le fou recule mais garde la grande diagonale, braquée sur g2. }
19. Bf1 { Le fou protège g2. }
19... Ng6 { Le cavalier défie le cavalier e5. }
20. f3 { Le pion contrôle e4 et g4 : si les Noirs échangent en e5, leurs cavaliers ne trouveront aucune case forte. }
20... Nh4 { Le cavalier attaque f3 et g2. 20...Rb8 était plus solide. }
21. Bd3 { Le fou vise h7. Mais il était plus important d'activer la tour avec 21.Rad1, pour préparer d4-d5 (Stockfish : environ +0,7 contre −0,1). }
21... Nd7 { Les Noirs rendent la politesse : 21...Nh5! leur donnait un vrai contre-jeu sur l'aile roi (Stockfish). }
22. Nxd7 { Les Blancs échangent. }
22... Rxd7 { Une imprécision : la tour quitte la défense de d5. 22...Qxd7 permettait encore de lutter contre d4-d5 (Stockfish : +0,6 au lieu de +1,3). }
23. Qc2 { La dame et le fou d3 forment une batterie contre h7. 23.d5 était encore plus fort. }
23... Kh8 { Le roi s'écarte de la batterie. }
24. Qf2 { La dame attaque le cavalier h4. 24.d5 tout de suite était encore meilleur (Stockfish). }
24... Qd8 { La dame protège h4. 24...Ng6 était plus solide. }
25. d5! { La poussée thématique, parfaitement préparée : elle ouvre les lignes vers le roi noir et libère les deux fous. Le meilleur coup selon Stockfish (+1,4). [%cal Gd4d5] }
25... b5 { Les Noirs attaquent c4. 25...exd5? perdait une pièce après 26.Qxh4! : si 26...Rxe1+ 27.Rxe1 Qxh4, alors 28.Re8 est mat. }
26. Bc2 { Le fou se met à l'abri de ...bxc4 et garde la diagonale vers h7. }
26... Rg8 { Une erreur : la tour quitte la colonne e. Plus tenace était 26...a6 (Stockfish : +1,3 au lieu de +2,3). }
27. dxe6 { Les Blancs prennent. }
27... fxe6 { Les Noirs reprennent. 27...Rd2 résistait mieux (Stockfish). }
28. Rad1! { La tour vient sur la colonne d : elle menace Rxd7 suivi de Qxh4. [%cal Gd1d7] }
28... Rxd1 { Les Noirs échangent. }
29. Rxd1 { La tour reprend : la colonne d est aux Blancs. }
29... Qg5 { La dame attaque g2. }
30. Qg3! { La dame propose l'échange tout en attaquant la dame g5 et le cavalier h4. Les Noirs n'ont que de mauvais choix. }
30... Qxg3 { La meilleure défense selon Stockfish : échanger les dames. }
(30... Qe7? { Le coup de la partie garde les dames, mais il perd tout de suite (environ +6). } 31. Rd7! { La tour attaque la dame et entre en 7e rangée. Les Noirs abandonnent : après 31...Qxd7 32.Qxh4, rien n'empêche Qxh7 mat, car la dame et le fou c2 visent tous deux h7. [%cal Gc2h7,Gh4h7] } 1-0)
31. hxg3 { Le pion reprend… }
31... Ng6 { …et le cavalier se replie. }
32. cxb5 { Les Blancs gagnent un pion. Avec la paire de fous et l'initiative, la finale est gagnante (environ +3,3 selon Stockfish).

PRO TIP : la poussée d4-d5 est l'arme principale des pions pendants. Prépare-la (tours sur la colonne d et e, fous actifs), puis joue-la au moment où les pièces adverses sont mal coordonnées. } *`,
    ),
    chapter(
      "Aronian – Stević, Porto Carras 2011 : d4-d5 et le pion passé",
      "r1bq3r/pp3pkp/2n1p1p1/8/2BP4/1QP2N2/P4PPP/R4RK1 w - - 2 14",
      `{ Deux paires de pièces mineures ont été échangées, ce qui réduit les chances d'attaque contre le roi. Mais le roi noir a perdu son fou de cases noires : les cases f6 et h6 sont faibles. Les Blancs vont former des pions pendants et viser la grande diagonale a1-h8. }
14. Bb5 { Le fou attaque le cavalier c6. }
14... Qc7 { La dame vise h2. 14...Na5 était plus solide (Stockfish). }
15. Be2 { Le fou recule pour laisser passer le pion c. 15.Qb2 était plus précis. }
15... Rd8 { La tour attaque d4. }
16. Rfd1 { La tour protège d4. }
16... b6 { Les Noirs préparent ...Bb7. }
17. c4 { Les pions pendants c4-d4 sont formés. [%csl Yc4,Yd4] }
17... Ne7 { Le cavalier se dirige vers f5 pour attaquer d4. 17...Qf4 tenait l'égalité (Stockfish). }
18. Qb2 { La dame s'installe sur la grande diagonale, derrière le pion d4 : dès que d4-d5 sera joué, elle visera le roi g7. [%cal Gb2g7] }
18... Kg8 { Le roi quitte la diagonale. Mieux valait la bloquer avec 18...f6, quitte à affaiblir l'aile roi. }
19. Ne5!! { Le cavalier menace Ng4, puis d4-d5 avec une attaque sur les cases noires. Il attaque aussi f7. }
19... h5 { Les Noirs empêchent Ng4. La meilleure défense était 19...f6 (Stockfish). }
20. Rac1 { La dernière tour entre en jeu sur la colonne c, en face de la dame c7. }
20... Bb7 { Le fou se développe. }
21. d5! { La poussée qui fait mal : elle ouvre la diagonale de la dame b2 et menace de créer un pion passé. [%cal Gd4d5,Gb2g7] }
21... Rd6 { La meilleure défense selon Stockfish (environ +0,5) : la tour bloque devant le pion d, sans lui offrir de pion passé. [%csl Gd6] }
(21... exd5? { Le coup de la partie offre aux Blancs un pion passé central (environ +1,2). } 22. cxd5 { Le pion reprend et la tour c1 attaque la dame c7 : le pion d5 est passé. [%csl Gd5] } 22... Qd6 { La dame se met devant le pion. 22...Qb8 résistait mieux (Stockfish). } 23. Nc4 { Le cavalier attaque la dame et prépare l'avance du pion. } 23... Qf4 { La dame attaque la tour c1 et le cavalier c4. } 24. d6 { Le pion avance et attaque le cavalier e7. Stockfish préférait d'abord 24.g3, mais le pion passé est déjà décisif. } 24... Nf5 { Le cavalier s'écarte et attaque d6. } 25. d7 { Le pion arrive en 7e rangée, à un pas de la promotion. } 25... Qg5 { La dame attaque la tour c1 et le pion g2. 25...Nh4 tenait plus longtemps. } 26. g3 { Le pion ferme la colonne g. Les Blancs gagnent grâce à leur pion passé en d7 (environ +2,5 selon Stockfish).

PRO TIP : face aux pions pendants, n'accepte jamais de leur laisser créer un pion passé central : bloque le pion avec une pièce (ici ...Rd6) plutôt que de l'échanger. })
22. Bf3 { Le fou soutient d5 ; les Blancs gardent l'initiative, mais les Noirs tiennent (environ +0,5). }
22... Re8 { La tour se place sur la colonne e pour soutenir le blocus. Les pions blancs ne passent pas : c'est la bonne façon de défendre.

PRO TIP : face aux pions pendants, n'accepte jamais de leur laisser créer un pion passé central : bloque le pion avec une pièce (ici ...Rd6) plutôt que de l'échanger. } *`,
    ),
    chapter(
      "Korobov – Madeja, Varsovie 2010 : quand les pions pendants se transforment",
      "2r1r1k1/pbqn1ppp/1p2pn2/6B1/2PP4/P2B1N2/5PPP/R2QR1K1 w - - 1 16",
      `{ Les Blancs ont les pions pendants c4-d4 et des pièces tournées vers le roi noir (fou d3, fou g5). Ce chapitre montre une transformation typique : après un échange en e5, le pion d prend en e5 — la structure change, et tout dépend de qui obtient l'initiative. }
16. Ne5! { Le cavalier s'installe en e5 et prépare l'attaque. Stockfish place 16.Bh4 à peine devant. }
16... Nxe5 { Les Noirs échangent. }
17. dxe5 { La transformation : le pion d prend en e5. Le pion c4 devient isolé et faible, mais le pion e5 chasse le cavalier f6 et l'attaque sur l'aile roi gagne en force. Plus précis était 17.Rxe5 (Stockfish). }
17... Qc6! { Le coup indispensable : la dame attaque g2 et c4 et prend l'initiative. Le meilleur coup selon Stockfish (0,0). [%cal Gc6g2] }
(17... Nd7? { Le coup de la partie, naturel en apparence, laisse l'initiative aux Blancs (environ +1,2). } 18. Qh5 { La dame attaque h7 et f7. } 18... Nf8 { Le cavalier protège h7. 18...g6 bloquait au moins le fou d3. } 19. Re3 { La tour se prépare à passer en g3 ou h3. } 19... Qc6 { La dame attaque c4 et g2. 19...Ng6 était la seule défense (Stockfish). } 20. Rg3 { La tour vise g7 : les Blancs menacent Bf6. } 20... Rc7? { La faute décisive (environ +6) : il fallait 20...Ng6. } 21. Bxh7+! { Le fou se sacrifie pour ouvrir le roi. } 21... Nxh7 { Le cavalier prend. } 22. Bf6 { Le fou menace Rxg7+ et Qxh7. Sur 22...g6, 23.Qxh7+! Kxh7 24.Rh3+ Kg8 25.Rh8 est mat. } 22... Qxc4 { Les Noirs prennent un pion, mais le mat arrive. } 23. Rxg7+ { La tour prend g7 avec échec. } 23... Kf8 { Le roi s'écarte vers f8. } 24. Qh6 { La dame vient en h6 : Rg8+ arrive. } 24... Rec8 { Les Noirs n'ont plus de défense. } 25. Rg8+ { Les Noirs abandonnent : après 25...Kxg8 26.Qg7 est mat. } 1-0)
18. Bf1 { Le fou protège g2. }
18... Ne4 { Le cavalier s'installe au centre et attaque le fou g5. }
19. Bh4 { Le fou recule. }
19... h6 { Le pion donne de l'air au roi. Les chances sont équilibrées (0,0) : les Noirs contrôlent le centre, les Blancs gardent un peu d'attaque.

PRO TIP : quand un pion pendant prend en e5 (ou en c5), la structure change et la partie devient une course à l'initiative. Le camp qui joue le coup actif juste après la transformation (ici 17...Qc6) prend le dessus. } *`,
    ),
    chapter(
      "Mareco – Toth, Osasco 2012 : bloquer les pions pendants, puis les attaquer",
      "r2q1rk1/pb1n1ppp/1p6/2Pp4/8/6P1/PP1NPPBP/2RQ1RK1 b - - 0 13",
      `{ Cette fois, ce sont les NOIRS qui peuvent avoir des pions pendants. Le chapitre montre ce qui arrive quand ces pions peuvent être bloqués dès leur naissance : ils deviennent de simples cibles. }
13... bxc5 { Les Noirs forment des pions pendants c5-d5… dans une très mauvaise version, comme on va le voir. Mieux valait 13...Nxc5, avec un simple pion isolé (Stockfish). [%csl Yc5,Yd5] }
14. Nb3! { Le cavalier attaque c5 : les Noirs ne pourront pas garder leurs pions sur la ligne idéale c5-d5. [%cal Gb3c5] }
14... c4 { Seul coup pour sauver le pion, mais il abandonne la case d4 : plus aucun pion noir ne pourra la contrôler. 14...Rc8? perdait un pion après 15.Bxd5. }
15. Nd4! { Le cavalier se pose sur d4, juste devant les pions noirs : le blocus est en place. [%csl Gd4] }
15... Qa5 { La dame attaque a2. 15...Nf6 était un peu plus solide (Stockfish). }
16. b3! { Le pion attaque c4 et casse la chaîne c4-d5. Le pion a2 n'est pas vraiment en danger : sur 16...Qxa2?, 17.Ra1 Qb2 18.bxc4 et les pions noirs s'effondrent. [%cal Gb3c4] }
16... Rab8 { La tour vient sur la colonne b. }
17. Nf5 { Le cavalier passe à l'attaque : il vise g7 et menace Ne7+ pour gagner d5. }
17... Nf6 { Le cavalier protège d5 et h7. }
18. Rc2 { La tour protège a2 le long de la 2e rangée et attaque c4. }
18... Rfd8 { La tour soutient d5. 18...Qc5 était plus actif (Stockfish). }
19. Qc1 { La dame se prépare à passer en g5 ou f4, vers le roi noir. }
19... h6 { Le pion empêche Qg5. }
20. Qf4 { La dame attaque la tour b8, le pion h6 et c4. Elle menace Nxh6+. }
20... cxb3 { Les Noirs échangent. }
21. axb3 { Le pion reprend. }
21... Qb6 { La dame attaque b3 et f2. }
22. Rfc1 { Les tours blanches se doublent sur la colonne c. }
22... Ne8 { La meilleure défense selon Stockfish : le cavalier protège g7 et c7. Les Blancs restent mieux (environ +0,8), mais rien n'est décidé. }
(22... d4? { Le coup de la partie libère la diagonale du fou g2… pour les Blancs (environ +2,4). } 23. Bxb7 { Le fou prend le fou b7. } 23... Rxb7 { Les Noirs reprennent avec la tour. 23...Qxb7 résistait mieux (Stockfish). } 24. Rc6 { La tour attaque la dame b6 et le cavalier f6. } 24... Qxb3 { La dame s'échappe en prenant b3… } 25. Rxf6! { …mais la tour prend le cavalier, le seul défenseur du roi. } 25... gxf6 { Les Noirs reprennent. } 26. Qxh6 { La dame menace Qg7 mat, la case g7 étant contrôlée par le cavalier f5. Les Noirs abandonnent.

PRO TIP : des pions pendants qu'on peut bloquer dès leur naissance (un cavalier en d4, devant eux) sont une faiblesse, pas une force. Avant de les accepter, vérifie qu'ils pourront avancer. } 1-0)
23. Qa4 { La dame vient sur l'aile dame. }
23... Qf6 { La dame noire s'active à son tour. Les Blancs gardent l'avantage grâce au blocus de d4 et à la faiblesse de d5.

PRO TIP : des pions pendants qu'on peut bloquer dès leur naissance (un cavalier en d4, devant eux) sont une faiblesse, pas une force. Avant de les accepter, vérifie qu'ils pourront avancer. } *`,
    ),
    chapter(
      "Bachmann – Cornejo, Asuncion 2009 : la rupture b3-b4",
      "3r1rk1/pb2bpp1/1qn2n1p/2pp4/8/PP2PNP1/1BQN1PBP/2RR2K1 b - - 0 16",
      `{ Les Noirs ont les pions pendants c5-d5. Les Blancs vont les casser avec la rupture typique b3-b4 : le pion c5 disparaît, d5 devient un pion isolé, et la case d4 s'offre aux cavaliers blancs. [%csl Yc5,Yd5][%cal Gb3b4] }
16... Nd7 { Le cavalier protège c5 et empêche Nh4-f5. Le meilleur coup selon Stockfish. }
17. Qf5 { La dame attaque d5, le cavalier d7 et f7. 17.Nb1 était un peu plus précis. }
17... Na5 { Une erreur de direction : le cavalier en a5 rend la rupture b3-b4 encore plus forte, puisqu'elle l'attaquera aussi. 17...Rfe8 maintenait l'équilibre (Stockfish). }
18. Rb1 { La tour protège b3. 18.b4! tout de suite était plus fort (Stockfish). }
18... Nf6 { Le cavalier revient défendre. 18...Nc6 était meilleur. }
19. Qc2 { La dame recule. Là encore, 19.b4! était très fort. }
19... Bc8 { Le fou change de diagonale. }
20. Nh4 { Le cavalier vise f5. 20.b4 restait le plus fort. }
20... Be6 { Le fou protège f5 et d5. }
21. b4! { La rupture enfin : le pion attaque c5 et le cavalier a5. Les pions pendants vont se transformer en un pion isolé en d5. [%cal Gb3b4] }
21... Nb7 { Le cavalier s'enferme en b7, d'où il ne reviendra pas. 21...Nc4 était meilleur (Stockfish). }
22. Nhf3 { Le cavalier revient. Plus fort était 22.Nf5 (Stockfish : environ +1,0 contre +0,2). }
22... Ne4 { Le cavalier attaque d2 et f2. Mieux valait 22...Rc8. }
23. Nxe4 { Les Blancs échangent… }
23... dxe4 { …et le pion d reprend en e4 : il attaque le cavalier f3. La structure noire est cassée. }
24. Ne5 { Le cavalier s'installe en e5 et vise f7 et c6. }
24... cxb4 { Les Noirs échangent sur b4. 24...Bf6 était plus solide. }
25. axb4 { Le pion reprend. }
25... Rxd1+ { Les Noirs échangent les tours. }
26. Rxd1 { La tour reprend la colonne d. }
26... Bxb4 { La meilleure défense selon Stockfish : les Noirs ramassent le pion b4. Les Blancs restent mieux (environ +0,8). }
(26... f5? { Le coup de la partie soutient e4, mais il affaiblit e6 et laisse une fourchette (environ +2,9). } 27. Nd7! { La fourchette, l'un des deux meilleurs coups selon Stockfish : le cavalier attaque la dame b6 et la tour f8. [%cal Gd7b6,Gd7f8] } (27. Bf1 { Le coup de la partie, que le livre juge décisif. Stockfish ne donne pourtant qu'environ +0,4 : la fourchette Nd7 gagnait bien plus vite. Bachmann a gagné la partie quelques coups plus tard. }) 27... Qxb4 { La dame s'échappe en prenant b4… } 28. Nxf8 { …et le cavalier prend la tour. } 28... Bxf8 { Les Noirs reprennent : les Blancs ont une qualité de plus (environ +2,9).

PRO TIP : contre des pions pendants, la rupture du pion b (ou du pion e) est l'arme principale. Prépare-la, puis joue-la quand les pièces adverses ne peuvent plus défendre le pion qui reste isolé. })
27. Bxe4 { Le fou reprend le pion e4. }
27... Nd6 { Le cavalier attaque le fou e4. }
28. Nc6 { Le cavalier attaque le fou b4. Les Blancs gardent l'initiative, mais la partie continue.

PRO TIP : contre des pions pendants, la rupture du pion b (ou du pion e) est l'arme principale. Prépare-la, puis joue-la quand les pièces adverses ne peuvent plus défendre le pion qui reste isolé. } *`,
    ),
    chapter(
      "Madeja – Hernandez, Mexico 2012 : le blocus, puis la rupture e3-e4",
      "r1b2rk1/5ppp/1qp2n2/p2p4/1b6/4P1P1/PPQB1PBP/RNR3K1 b - - 1 13",
      `{ Les Noirs ont des pions pendants sur c6 et d5, mais ils ne peuvent pas jouer ...c6-c5 à temps. Les Blancs vont les bloquer (un cavalier en c5), puis les casser avec la rupture e3-e4. [%csl Yc6,Yd5,Gc5] }
13... Bxd2 { Les Noirs échangent les fous, ce qui accélère le plan blanc. 13...Bd7 était plus précis (Stockfish). }
14. Nxd2 { Le cavalier reprend et prend la route b3-c5. }
14... Bd7 { Le fou se développe. }
15. Nb3 { Le cavalier attaque a5 et vise c5. }
15... Rfb8 { La tour vient sur la colonne b. 15...Rab8 était plus logique (Stockfish). }
16. Nc5 { Le cavalier se pose sur c5, devant le pion c6 : aucun pion noir ne pourra plus le chasser (le pion b noir a disparu, le pion d est déjà en d5). Il attaque le fou d7. [%csl Gc5] }
16... Be8 { Le fou recule. }
17. b3 { Le pion ferme la colonne b et soutient le blocus. }
17... Qa7 { La dame vise le cavalier c5. }
18. e4! { La rupture : le pion attaque d5. Elle va laisser aux Noirs un pion c6 isolé et ouvrir les lignes. [%cal Ge3e4] }
18... h6 { Une perte de temps. 18...Rb5 était la meilleure défense (Stockfish). }
19. Re1! { La tour quitte c1 pour la colonne e, que la rupture va ouvrir. }
19... dxe4 { Les Noirs prennent. }
20. Bxe4 { Le fou reprend et attaque c6. }
20... Rb5 { La tour attaque le cavalier c5 et le pion b3. }
21. Rac1 { L'autre tour vient soutenir le cavalier c5. }
21... Nxe4 { Les Noirs échangent le fou. }
22. Rxe4 { La tour reprend et se centralise. Les Blancs ont un gros avantage positionnel : le pion c6 est isolé, et le cavalier c5 domine. }
22... f6 { Le pion protège e5 et g5, mais affaiblit e6. }
23. Qc3 { La dame vise a5 et f6. 23.a4 était encore plus précis (Stockfish). }
23... Bf7 { Le fou attaque b3. }
24. Qe3 { La dame vise h6 et la case e6. }
24... Qb8 { La dame attaque g3. }
25. Re7 { La tour entre en 7e rangée et attaque le fou f7. }
25... Qd6 { La meilleure défense selon Stockfish (environ +0,2) : la dame se centralise et surveille d7 et e7. }
(25... Qf8? { Le coup de la partie laisse aux Blancs une combinaison gagnante (environ +2,6). } 26. a4! { Le livre et Stockfish s'accordent : le pion chasse la tour b5. } (26. Re1? { Le coup de la partie laisse filer la combinaison. } 26... Rbb8 { La tour recule. } 27. Nd7 { Le cavalier attaque la dame f8 et la tour b8. } 27... Qxe7! { La dame prend la tour e7… } 28. Qxe7 { …la dame reprend… } 28... Re8 { …et la tour attaque la dame. } 29. Qxe8+ { Les Blancs donnent leur dame contre la tour… } 29... Bxe8 { …et le fou reprend. } 30. Nc5 { Le cavalier revient. La position est maintenant égale selon Stockfish (0,0) : les Blancs n'ont gagné la finale que bien plus tard, sur des erreurs adverses. }) 26... Rb4 { La tour recule en attaquant a4. } 27. Nd7 { Le cavalier attaque la dame f8 et le pion f6. } 27... Qd8 { La dame attaque le cavalier d7 et la tour e7. } 28. Rd1! { La tour protège d7 et menace Nxf6+ suivi de Rxd8. } 28... Bd5 { Le fou ferme la colonne d. } 29. Rxd5! { La tour prend le fou… } 29... cxd5 { …le pion reprend… } 30. Nxf6+! { …et le cavalier prend f6 avec échec. } 30... Kh8 { Le roi s'écarte. } 31. Qxh6+! { Le sacrifice final : la dame prend h6 avec échec. } 31... gxh6 { Les Noirs prennent. } 32. Rh7# { Mat : la tour h7 est protégée par le cavalier f6.

PRO TIP : des pions pendants bloqués (une pièce installée juste devant eux) sont condamnés. La rupture du pion e (e3-e4) les transforme ensuite en pion isolé et ouvre les lignes pour l'attaque. })
26. h4 { Les Blancs gardent l'initiative. }
26... Qd5 { La dame se centralise : les Noirs tiennent, même si le pion c6 reste une faiblesse.

PRO TIP : des pions pendants bloqués (une pièce installée juste devant eux) sont condamnés. La rupture du pion e (e3-e4) les transforme ensuite en pion isolé et ouvre les lignes pour l'attaque. } *`,
    ),
  ],
};
