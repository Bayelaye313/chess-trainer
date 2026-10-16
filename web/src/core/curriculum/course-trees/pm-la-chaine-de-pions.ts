import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « La chaîne de pions » (positional_mastery, module 19) — format « un
 * commentaire par coup ».
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, entièrement
 * réécrite ici) : Paulsen – Tarrasch (Nuremberg 1888), Nimzowitsch – Tarrasch
 * (Saint-Sébastien 1912) et Nimzowitsch – Salwe (Karlsbad 1911), parties
 * illustratives du chapitre « La chaîne de pions » de « Mon système » de
 * Nimzowitsch (texte OCR local `books-ocr/nimzowitsch.txt`, scores
 * reconstitués et rejoués avec chess.js) ; Bogoljubow – Réti (1923), partie
 * n°55 de Chernev (`chernev1.pgn`, aussi `PILOT_pm-la-chaine-de-pions.pgn`).
 * Les chapitres de théorie (Française d'avance, Est-Indienne Mar del Plata)
 * suivent des lignes d'ouverture standard.
 *
 * Plan : anatomie d'une chaîne — la Française d'avance (1) ; Paulsen –
 * Tarrasch : le siège de la base d4 (2) ; Nimzowitsch – Tarrasch : défendre la
 * base avec les pièces (3), puis la contre-attaque ...f6 contre la pointe (4) ;
 * Nimzowitsch – Salwe : attaquer la pointe et céder volontairement la base (5),
 * le blocus de e5 (6) ; Bogoljubow – Réti : la base attaquée tout de suite (7),
 * le centre noir qui avance (8), la nouvelle chaîne qui décide (9) ;
 * Est-Indienne : chaque camp joue sur l'aile où pointe sa chaîne (10), la
 * course des ruptures c5 contre g5-g4 (11).
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
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const LA_CHAINE_DE_PIONS: CourseTree = {
  chapters: [
    chapter(
      "Anatomie d'une chaîne : la Française d'avance",
      START,
      `{ Une CHAÎNE DE PIONS est une diagonale de pions qui se protègent l'un l'autre : chaque pion défend celui qui est devant lui.

Deux pions comptent plus que les autres :
- la BASE : le pion le plus en arrière. Personne ne le protège avec un pion. C'est donc la cible naturelle de l'adversaire ;
- la POINTE (ou tête) : le pion le plus avancé. Elle donne de l'espace et serre le camp adverse.

Règle de Nimzowitsch : on attaque une chaîne d'abord à sa BASE. Si la base tombe, le pion qu'elle protégeait n'a plus de soutien, et toute la chaîne devient fragile.

Une chaîne bloquée indique aussi le côté où chaque camp doit jouer : on attaque du côté vers lequel « pointent » ses propres pions.

Dans la Française d'avance, les Blancs forment la chaîne d4-e5 (base d4, pointe e5). Les Noirs ont la chaîne f7-e6-d5. Regarde comment chaque coup noir vise d4.

PRO TIP : avant de choisir un plan dans une position bloquée, trace la diagonale de chaque chaîne et repère sa base. Ton plan est presque toujours : attaquer cette base. }
1. e4 { Le pion roi occupe le centre et libère le fou f1 et la dame. Le meilleur coup. }
1... e6 { La Défense française : les Noirs préparent ...d5 en protégeant d'avance ce pion. Un peu moins bon que 1...e5 selon Stockfish, l'écart est faible. }
2. d4 { Les Blancs prennent tout le centre avec deux pions. Le meilleur coup. }
2... d5 { Les Noirs attaquent tout de suite le pion e4. Le meilleur coup. [%cal Gd5e4] }
3. e5 { LA CHAÎNE NAÎT. Le pion e avance et forme la diagonale d4-e5 : d4 est la BASE, e5 la POINTE. Le pion e5 prend la case f6 au cavalier noir. Presque aussi bon que 3.Nc3. [%csl Gd4,Ge5] }
3... c5 { L'attaque de la BASE, tout de suite. Le pion c attaque d4, le seul pion qui protège e5. Le meilleur coup. [%cal Rc5d4][%csl Rd4] }
4. c3 { Les Blancs soutiennent la base par un autre pion. Si les Noirs prennent en d4, le pion c3 reprendra et la chaîne restera entière. Le meilleur coup. [%cal Gc3d4] }
4... Nc6 { Deuxième attaquant sur d4. Les Noirs ajoutent des pièces contre la base, une par une. Presque aussi bon que 4...Bd7. [%cal Rc6d4] }
5. Nf3 { Deuxième défenseur de d4. Le meilleur coup. [%cal Gf3d4] }
5... Qb6 { Troisième attaquant : la dame vise d4, et aussi le pion b2. On compte : trois attaquants (c5, Nc6, Qb6) contre trois défenseurs (c3, Nf3, Qd1). L'écart avec 5...Bd7 est d'environ 0,2 pion. [%cal Rb6d4,Rb6b2] }
6. a3 { Les Blancs préparent b2-b4. Ce pion chassera le pion c5 et fera de la place à l'aile dame. Le meilleur coup. [%cal Ga3b4] }
6... c4 { Un autre plan. Les Noirs cessent de viser d4 et ferment l'aile dame : le pion c4 prend les cases b3 et d3 aux pièces blanches. Le prix est connu : la base d4 n'est plus attaquée par un pion. Stockfish met ce coup juste derrière 6...Nh6, l'écart est minime. [%csl Gb3,Gd3] }
7. Nbd2 { Le cavalier attaque le pion c4. Les Blancs vont tester ce pion avancé. Presque aussi bon que 7.Be2. [%cal Gd2c4] }
7... Na5 { Le cavalier protège c4 et surveille b3. Le meilleur coup. [%cal Ga5c4,Ga5b3] }
8. Be2 { Le fou se développe et prépare le roque. Le meilleur coup. }
8... Bd7 { Le fou rejoint l'aile dame, où les Noirs ont choisi de jouer. Presque aussi bon que 8...h6. }
9. O-O { Le roi blanc se met à l'abri. 9.Rb1, pour préparer b2-b4, était un peu plus précis (écart d'environ 0,1 pion). }
9... Ne7 { Le dernier cavalier se développe. Il peut aller en c6 ou en f5, deux cases d'où il visera de nouveau d4. Le meilleur coup.

Bilan : la chaîne d4-e5 blanche pointe vers l'aile roi, où les Blancs ont de l'espace. Les Noirs jouent de l'autre côté, à l'aile dame. C'est ce partage des ailes qu'on retrouvera dans tout le cours. [%cal Ge7c6,Ge7f5] }`,
    ),
    chapter(
      "Paulsen – Tarrasch (1888) : le siège de la base d4",
      "r1b1kbnr/pp3ppp/1qn1p3/2ppP3/3P4/2P2N2/PP3PPP/RNBQKB1R w KQkq - 3 6",
      `{ Louis Paulsen – Siegbert Tarrasch, Nuremberg 1888. Nimzowitsch a fait de cette partie l'exemple type de l'attaque contre la base d'une chaîne.

On reprend après 1.e4 e6 2.d4 d5 3.e5 c5 4.c3 Nc6 5.Nf3 Qb6. Les Noirs vont échanger en d4 pour enlever le soutien du pion c3. La base d4 n'aura alors plus AUCUN pion pour la défendre : seules des pièces pourront la protéger.

Une base défendue par des pièces est un fardeau. Les pièces qui la gardent ne peuvent plus rien faire d'autre.

PRO TIP : quand tu assièges une base, compte attaquants et défenseurs à chaque coup. Si l'adversaire doit sans cesse ajouter un défenseur, ses pièces deviennent passives. }
6. Bd3 { Le fou se développe et vise l'aile roi. Presque aussi bon que 6.a3 selon Stockfish. }
6... cxd4 { L'échange qui change tout : la base d4 perdra le soutien du pion c3. Le meilleur coup. [%cal Rc5d4] }
7. cxd4 { Le pion reprend. Désormais aucun pion blanc ne peut plus protéger d4 : il n'y a plus de pion en c3 ni en e3. 7.O-O, qui sacrifie le pion d4, était un peu plus actif (+0,3 contre 0,0). [%csl Rd4] }
7... Bd7 { Les Noirs préparent ...Nb4 pour échanger le fou d3 et ouvrir la diagonale de la dame. Le meilleur coup. }
(7... Nxd4 { Le piège classique de cette ligne : le cavalier prend le pion d4, croyant le gagner. C'est une faute grave. [%cal Rc6d4] }
8. Nxd4 { Le cavalier blanc reprend. La dame noire va reprendre à son tour… Le meilleur coup. }
8... Qxd4 { La dame prend en d4. C'est exactement ce que les Blancs attendaient. [%cal Rb6d4] }
9. Bb5+ { Le fou donne échec et dégage la colonne d : la dame d1 attaque maintenant la dame d4. Les Noirs perdent leur dame. Évaluation : +6,6. [%cal Gb5e8,Gd1d4] })
8. Be2 { Le fou recule pour éviter ...Nb4, qui l'échangerait. Le meilleur coup. }
8... Nge7 { Le cavalier part vers f5, d'où il attaquera d4. Aussi bon que 8...Nh6. [%cal Ge7f5] }
9. Nc3 { Le cavalier se développe et attaque d5. Surtout, il pourra aller en a4 pour chasser la dame. Le meilleur coup. }
(9. b3 { Le coup de Paulsen : il prépare Bb2 pour ajouter un défenseur à d4. Mais le développement des pièces blanches se bloque, et le coup perd environ 0,8 pion. [%cal Gb3b2] }
9... Nf5 { Le cavalier ajoute une attaque sur d4. Le meilleur coup. [%cal Rf5d4] }
10. Bb2 { Le fou défend d4 depuis b2. Le meilleur coup dans cette position. [%cal Gb2d4] }
10... Bb4+ { Le fou donne échec : les Blancs ne peuvent ni bien s'interposer ni garder le roque. Le meilleur coup. [%cal Gb4e1] }
11. Kf1 { Le roi doit bouger : 11.Nc3 ou 11.Nbd2 perdaient plus de 1 pion. Les Blancs ont perdu le droit de roquer. Le meilleur coup. }
11... Be7 { Le fou revient, sa mission accomplie. Le roque, 11...O-O, était un peu plus précis (écart d'environ 0,3 pion). Le chapitre suivant reprend cette position quelques coups plus tard. })
9... Nf5 { Troisième attaque sur d4 : Nc6, Nf5 et Qb6 contre seulement Nf3 et Qd1. Le meilleur coup. [%cal Rc6d4,Rf5d4,Rb6d4] }
10. Na4 { La seule défense : le cavalier attaque la dame. Sans ce tour, le pion d4 tombait (10.Be3 perdait environ 1 pion). Le meilleur coup. [%cal Ga4b6] }
10... Qa5+ { La dame s'écarte en donnant échec. Le meilleur coup. }
11. Nc3 { Le cavalier revient et ferme la diagonale de la dame. Les deux camps peuvent répéter les coups (11...Qb6 12.Na4). Le meilleur coup.

Bilan : la base d4 ne tient que grâce à un tour tactique, la chasse de la dame. Les Blancs n'ont rien de mieux qu'une répétition : c'est le signe qu'une base défendue par des pièces est un fardeau. [%cal Gc3a4] }`,
    ),
    chapter(
      "Nimzowitsch – Tarrasch (1912) : défendre la base avec les pièces",
      "2r1k2r/1p1bbppp/1q2p3/pB1pPn2/Pn1P4/1P3NP1/1B3P1P/RN1Q1K1R w k - 3 15",
      `{ Aron Nimzowitsch – Siegbert Tarrasch, Saint-Sébastien 1912. Vingt-quatre ans après Paulsen – Tarrasch, Nimzowitsch rejoue exactement la même ouverture contre le même adversaire. Les deux parties sont identiques jusqu'au 14e coup : 9.b3 Nf5 10.Bb2 Bb4+ 11.Kf1 Be7 12.g3 a5 13.a4 Rc8 14.Bb5 Nb4.

Stockfish n'aime pas tout ce parcours (12.g3 et 14.Bb5 sont des imprécisions, 14...Nb4 aussi). La position est maintenant à peu près égale.

Le plan blanc : protéger la base d4 avec les pièces, puis sortir les dernières pièces et mettre le roi à l'abri. Si la base tient, les Blancs gardent leur espace à l'aile roi.

PRO TIP : une base qui ne peut plus être protégée par un pion doit l'être par des pièces bien placées. Développe-les vite : chaque pièce restée chez elle est un défenseur de moins. }
15. Nc3 { LE BON COUP DE NIMZOWITSCH. La dernière pièce sort : le cavalier protège le fou b5 et contrôle d5 et e2. Le meilleur coup. [%cal Gc3b5,Gc3e2] }
(15. Bxd7+ { Le coup de Paulsen en 1888. Il échange le fou qui tenait la case b5 et laisse les Noirs entrer : environ 0,7 pion de moins que 15.Nc3. }
15... Kxd7 { Le roi reprend. Sans les dames, il sera bien placé au centre. Le meilleur coup. }
16. Nc3 { Le cavalier sort enfin, mais un coup trop tard. Paulsen a perdu la finale, où le pion d4 restait une cible. Le meilleur coup dans cette position. })
15... Na6 { Le cavalier recule pour aller en c7, d'où il attaquera le fou b5. Stockfish préfère légèrement 15...Bc6 (écart d'environ 0,4 pion). [%cal Ga6c7] }
(15... Bc6 { Le choix du moteur : le fou propose l'échange du fou b5. Le meilleur coup. [%cal Gc6b5] }
16. Rc1 { La tour s'oppose à la tour c8. Presque aussi bon que 16.Kg2. }
16... g5 { Une idée de siège : le pion g menace ...g4, qui chasserait le cavalier f3, un défenseur de d4. Le meilleur coup. [%cal Gg5g4,Rg4f3] }
17. h3 { Le pion empêche ...g4. La position reste égale. Le meilleur coup. [%csl Gg4] })
16. Kg2 { Le roi quitte f1 et relie les tours. Il sera à l'abri derrière ses pions g3, h2 et f2. Le meilleur coup. }
16... Nc7 { Le cavalier attaque le fou b5. Un peu moins précis que 16...Bxb5 (écart d'environ 0,3 pion). [%cal Gc7b5] }
17. Be2 { Le fou recule et reste près du roi. Le meilleur coup. }
17... Na6 { Stockfish ramène le cavalier vers b4. Le meilleur coup. [%cal Ga6b4] }
(17... Bb4 { Le coup de Tarrasch : le fou s'active, mais il va se faire chasser. Il perd environ 0,5 pion. [%cal Gb4c3] }
18. Na2 { Le cavalier attaque le fou b4. Il se prépare à l'échanger. Un peu moins précis que 18.Rc1. [%cal Ga2b4] }
18... Na6 { Le cavalier défend le fou b4. Le meilleur coup. [%cal Ga6b4] }
19. Bd3 { Le fou attaque le cavalier f5, un des assiégeants de d4. Presque aussi bon que 19.Rc1. Le chapitre suivant reprend cette partie au 26e coup. [%cal Gd3f5] })
18. Rc1 { La tour occupe la colonne c et conteste la tour c8. Presque aussi bon que 18.h4. }
18... Nb4 { Le cavalier revient en b4. Le meilleur coup. }
19. Ba3 { Le fou attaque le cavalier b4 et vise le fou e7 derrière lui. Environ +0,5.

Bilan : toutes les pièces blanches sont sorties, le roi est à l'abri, et la base d4 tient. Les Blancs peuvent maintenant penser à l'aile roi, du côté où pointe leur chaîne. [%cal Ga3b4,Ga3e7] }`,
    ),
    chapter(
      "Nimzowitsch – Tarrasch (1912) : la contre-attaque ...f6 contre la pointe",
      "2b1kr2/1p2npp1/1q2p2p/p2pP3/Pn1P2P1/1P6/1B3PKP/1B1QN2R w - - 2 26",
      `{ Suite de Nimzowitsch – Tarrasch, après 17...Bb4 18.Na2 Na6 19.Bd3 Ne7 20.Rc1 Nc6 21.Nxb4 Naxb4 22.Bb1 h6 23.g4 Ne7 24.Rxc8+ Bxc8 25.Ne1 Rf8. Stockfish relève des imprécisions des deux côtés (19...Ne7, 23.g4, 25.Ne1). Les Blancs sont mieux, environ +1,2.

La base d4 est solide et les Blancs ont avancé leur pion g à l'aile roi. Que peuvent faire les Noirs ? Attaquer l'autre maillon : la POINTE e5, avec ...f6.

Cette contre-rupture ouvre la colonne f pour la tour noire. Mais elle a un prix : le pion e6 devient arriéré.

PRO TIP : avant de frapper la pointe avec ...f6, vérifie qui profitera des lignes ouvertes. Si l'adversaire peut viser le pion e6 resté en arrière, la rupture peut se retourner contre toi. }
26. Nd3 { Le cavalier attaque le cavalier b4 et soutient la case e5. 26.Bc1 était un peu plus précis (écart d'environ 0,35 pion). [%cal Gd3b4,Gd3e5] }
26... f6 { L'ATTAQUE DE LA POINTE. Le pion f attaque e5, et la tour f8 est déjà derrière lui. Presque aussi bon que 26...f5. [%cal Rf6e5][%csl Re5] }
27. Nxb4 { Les Blancs échangent les cavaliers. Stockfish préfère de très peu 27.Re1. }
(27. Re1 { Le choix du moteur : la tour protège e5 avant toute chose. Le meilleur coup. [%cal Ge1e5] }
27... Nxd3 { Le cavalier prend le cavalier d3. Presque aussi bon que 27...Nbc6. }
28. Bxd3 { Le fou reprend. Le meilleur coup. }
28... fxe5 { Le pion prend la pointe. Le meilleur coup. }
29. Rxe5 { La tour reprend et s'installe en e5, devant le pion e6 bloqué. Environ +0,9. Le meilleur coup. [%csl Ge5,Re6] })
27... Qxb4 { La dame reprend. 27...axb4 était moins bon. Le meilleur coup. }
28. exf6 { Les Blancs prennent : la pointe disparaît, mais le pion e6 reste en arrière sur une colonne semi-ouverte. Le meilleur coup. [%csl Re6] }
28... Rxf6 { La tour reprend et devient active sur la colonne f. Le meilleur coup. }
29. Re1 { La tour attaque tout de suite le pion e6, la faiblesse née de la rupture. Le meilleur coup. [%cal Ge1e6] }
(29. Bc1 { Le coup de la partie : le fou quitte la diagonale b2-d4 et ne protège plus d4. Une faute d'environ 1,3 pion. }
29... e5 { La bonne réponse : le pion e se libère et attaque d4, qui vient de perdre un défenseur. Le meilleur coup. [%cal Re5d4] }
(29... Nc6 { Le coup de Tarrasch, qui laisse passer l'occasion. Une faute d'environ 1,7 pion. }
30. g5 { Les Blancs relancent l'attaque à l'aile roi et Nimzowitsch a fini par gagner. Le meilleur coup dans cette position. [%cal Gg5h6] })
30. Bd3 { Le fou se replace. Le meilleur coup. }
30... e4 { Le pion avance encore : les Noirs ont un centre mobile, environ -0,4. Le meilleur coup. [%csl Ge4,Gd5] })
29... Bd7 { Le fou protège le pion e6. Presque aussi bon que 29...Nc6. [%cal Gd7e6] }
30. Bc1 { Le fou vise maintenant l'aile roi (cases g5 et h6). Le meilleur coup. [%cal Gc1h6] }
30... g5 { Le pion prend les cases f4 et h4 au fou blanc. Le meilleur coup. }
31. Bh7 { Le fou se place sur la diagonale b1-h7, près du roi noir. Presque aussi bon que 31.Bd3. Environ +0,8.

Bilan : la rupture ...f6 a ouvert la colonne f aux Noirs, mais elle a laissé un pion e6 arriéré. Quand les Blancs visent ce pion tout de suite, ils gardent l'avantage. [%csl Re6] }`,
    ),
    chapter(
      "Nimzowitsch – Salwe (1911) : attaquer la pointe, céder la base",
      "r1b1kbnr/pp3ppp/1qn1p3/2ppP3/3P4/2P2N2/PP3PPP/RNBQKB1R w KQkq - 3 6",
      `{ Aron Nimzowitsch – Georg Salwe, Karlsbad 1911. Nimzowitsch y voyait la première partie jouée selon sa nouvelle idée du centre.

On reprend après 1.e4 e6 2.d4 d5 3.e5 c5 4.c3 Nc6 5.Nf3 Qb6. Au 7e coup, Nimzowitsch fait l'inverse de ce qu'on attend : il ABANDONNE la base d4 en prenant en c5.

Son idée : ce qui gêne les Noirs, ce n'est pas le pion e5, c'est la case e5 occupée. Si les Noirs détruisent la pointe avec ...f6, une pièce blanche viendra prendre sa place en e5. Et la case d4 servira de relais aux pièces blanches.

PRO TIP : un pion bloqué reste bloqué tant que la case devant lui est occupée, par un pion ou par une pièce. Avant de sauver un pion de ta chaîne, demande-toi si une pièce ne ferait pas mieux le travail. }
6. Bd3 { Le fou se développe vers l'aile roi. Presque aussi bon que 6.a3 ou 6.Be2 selon Stockfish. }
6... Bd7 { Les Noirs préparent ...Rc8 sans échanger en d4. 6...cxd4 était un peu plus précis (écart d'environ 0,2 pion). }
7. dxc5 { L'ABANDON VOLONTAIRE DE LA BASE. Le pion d prend en c5 : la chaîne n'a plus de base, mais la case d4 devient libre pour les pièces blanches. Le meilleur coup. [%csl Gd4] }
7... Bxc5 { Le fou reprend et vise f2. Le meilleur coup. [%cal Gc5f2] }
8. O-O { Le roi blanc se met à l'abri. Presque aussi bon que 8.Qe2. }
8... f6 { L'ATTAQUE DE LA POINTE. Le pion f attaque e5, le dernier pion de la chaîne blanche : les Noirs veulent libérer leur pion e6. Presque aussi bon que 8...a5. [%cal Rf6e5][%csl Re5] }
9. b4 { Le pion chasse le fou de la diagonale a7-g1. Il pourra ensuite avancer en b5 contre le cavalier c6, qui défend e5. Le meilleur coup. [%cal Gb4c5,Gb4b5] }
9... Be7 { Le fou recule. Le meilleur coup. }
(9... fxe5 { La faute à éviter : le fou c5 est attaqué et les Noirs ne le sauvent pas. }
10. bxc5 { Le pion prend le fou. Les Blancs gagnent une pièce : environ +3,2. Le meilleur coup. })
10. Bf4 { Le fou défend e5. Presque aussi bon que 10.a4. [%cal Gf4e5] }
10... fxe5 { Les Noirs prennent la pointe : il ne reste plus aucun pion blanc au centre. Presque aussi bon que 10...Nh6. }
11. Nxe5 { Une pièce prend la place du pion : le cavalier s'installe en e5. Le meilleur coup. [%csl Ge5] }
11... Nxe5 { Les Noirs échangent le cavalier. Le meilleur coup. }
12. Bxe5 { Le fou reprend : un nouveau bloqueur occupe e5. Le pion e6 reste bloqué. Le meilleur coup. [%csl Ge5,Re6] }
12... Nf6 { Le dernier cavalier noir se développe. Le meilleur coup. }
13. Nd2 { Le cavalier part vers f3 pour renforcer la case e5. Le meilleur coup. [%cal Gd2f3] }
13... O-O { Les Noirs roquent. 13...a5, qui attaque le pion b4, était un peu plus précis. }
14. Nf3 { Le cavalier arrive : il protège e5 et d4. 14.Bd4 ou 14.Re1 étaient un peu plus précis (écart d'environ 0,45 pion). [%cal Gf3e5,Gf3d4] }
14... Bd6 { Le fou s'oppose au fou e5 : les Noirs veulent échanger le bloqueur. Presque aussi bon que 14...a5. [%cal Gd6e5] }
15. Bd4 { Le choix du moteur : le fou évite l'échange et attaque la dame. La case e5 reste disponible pour le cavalier. Le meilleur coup. [%cal Gd4b6] }
(15. Qe2 { Le coup de Nimzowitsch. Il laisse aux Noirs l'occasion d'échanger le bloqueur. Une imprécision d'environ 0,55 pion. }
15... Bxe5 { Le bon moment : le fou noir élimine le fou e5. Le meilleur coup. }
16. Nxe5 { Le cavalier reprend et devient le nouveau bloqueur. Le meilleur coup. [%csl Ge5] }
16... Be8 { Le fou se dirige vers h5 ou g6. Les Noirs ont réduit l'avantage blanc à +0,6. Presque aussi bon que 16...a6. Dans la partie, Salwe a joué 15...Rac8, et le chapitre suivant reprend après ce coup. })
15... Qd8 { La dame recule. Le meilleur coup. }
16. Qe2 { La dame se place sur la colonne e et soutient le futur Ne5. Environ +1,1. Le meilleur coup.

Bilan : les Blancs n'ont plus de chaîne, mais ils contrôlent les cases d4 et e5. Le pion e6 est bloqué et arriéré : les Noirs ont détruit la pointe sans libérer leur jeu. [%csl Gd4,Ge5,Re6] }`,
    ),
    chapter(
      "Nimzowitsch – Salwe (1911) : le blocus de e5",
      "2r2rk1/pp1b2pp/1q1bpn2/3pB3/1P6/2PB1N2/P3QPPP/R4RK1 w - - 7 16",
      `{ Suite de Nimzowitsch – Salwe. Les deux camps viennent de commettre une imprécision : 15.Qe2 (15.Bd4 était plus précis) puis 15...Rac8 (15...Bxe5 éliminait tout de suite le bloqueur). Les Blancs sont mieux, environ +1,2.

La situation : il ne reste rien de la chaîne blanche, mais la case e5 est toujours tenue par une pièce blanche. Le pion e6 noir est bloqué. Il est même arriéré : aucun pion noir voisin ne peut plus le protéger.

C'est la grande idée de Nimzowitsch : peu importe qu'un pion soit bloqué par un pion ou par une pièce. Ce qui compte, c'est que la case devant lui reste occupée.

PRO TIP : le meilleur bloqueur est un cavalier. Il reste actif même posté devant un pion, alors qu'un fou ou une tour y perdent de leur force. }
16. Bd4 { Le fou chasse la dame et libère la case e5 pour le cavalier. Le meilleur coup. [%cal Gd4b6] }
16... Qc7 { La dame se met sur la colonne c, derrière la tour : elle vise le pion c3. Le meilleur coup. [%cal Gc7c3] }
17. Ne5 { LE BLOQUEUR IDÉAL. Le cavalier s'installe en e5, devant le pion e6. Le meilleur coup. [%csl Ge5,Re6] }
17... Be8 { Le fou se dirige vers h5 ou g6 pour s'échanger contre le fou d3 ou gêner la dame. Le meilleur coup. [%cal Ge8h5] }
18. Rfe1 { La tour vient renforcer la colonne e. Stockfish garde la tour a1 à l'aile dame. Le meilleur coup. [%cal Ge1e5] }
(18. Rae1 { Le coup de Nimzowitsch. Il retire la tour de l'aile dame, et le moteur trouve une réponse précise. Il perd environ 0,8 pion. }
18... Ne4 { Le cavalier s'installe en e4 et propose l'échange du fou d3. Le meilleur coup. [%cal Gf6e4] }
(18... Bxe5 { Le coup de Salwe : il élimine le cavalier bloqueur, mais un autre bloqueur va prendre sa place. Une faute d'environ 1,4 pion. }
19. Bxe5 { Le fou reprend et devient le nouveau bloqueur en e5. Le pion e6 reste figé et les cases noires sont faibles : +1,9. La partie s'est poursuivie par une attaque contre le roi (24.Bxh7), et Nimzowitsch a gagné. [%csl Ge5,Re6] })
19. Bxe4 { Le fou prend le cavalier, la suite la plus simple. Le meilleur coup. }
19... dxe4 { Le pion reprend en e4. Ce pion gêne les pièces blanches (il prend d3 et f3), et l'avantage blanc retombe à +0,5. Le meilleur coup. })
18... Bh5 { Le fou attaque la dame e2. Le meilleur coup. [%cal Gh5e2] }
19. f3 { Le pion ferme la diagonale du fou et prend la case e4 au cavalier noir. Le blocus tient : environ +1,2. Le meilleur coup.

Bilan : céder la base de sa chaîne n'est pas une catastrophe si l'on garde la case devant le pion adverse. Ici, la case e5 vaut plus que le pion d4 abandonné au 7e coup. [%csl Ge4,Ge5] }`,
    ),
    chapter(
      "Bogoljubow – Réti (1923) : la base attaquée tout de suite",
      START,
      `{ Efim Bogoljubow – Richard Réti, 1923, une des parties préférées de Chernev.

Dans cette Française classique, la chaîne blanche d4-e5 apparaît au 4e coup. Les Noirs l'attaquent à sa base dès le coup suivant. Bogoljubow répond par une attaque de dame à l'aile roi, trop précipitée.

La ligne principale suit Stockfish : 5.f4, qui soutient la pointe e5 avec un pion. La partie réelle est donnée en variante. On y voit comment, la base d4 disparue, la pointe e5 tombe à son tour.

PRO TIP : quand ta base est attaquée, ne pars pas à l'aventure sur l'autre aile. Défends d'abord la chaîne, ou renforce sa pointe (ici avec f2-f4). }
1. e4 { Le pion roi au centre. Le meilleur coup. }
1... e6 { La Défense française. Un peu moins précis que 1...c6 ou 1...e5, l'écart est faible. }
2. d4 { Deux pions au centre. Le meilleur coup. }
2... d5 { Les Noirs attaquent e4. Le meilleur coup. }
3. Nc3 { Le cavalier défend e4. Le meilleur coup. [%cal Gc3e4] }
3... Nf6 { Deuxième attaque sur e4. Le meilleur coup. [%cal Gf6e4] }
4. e5 { La chaîne d4-e5 est formée et le cavalier f6 est chassé. Le meilleur coup. [%csl Gd4,Ge5] }
4... Nfd7 { Le cavalier recule en d7. De là, il pourra attaquer e5 ou aller en b6. Le meilleur coup. }
5. f4 { STOCKFISH SOUTIENT LA POINTE. Le pion f protège e5 : même si la base d4 tombe, la pointe garde un soutien. Le meilleur coup. [%cal Gf4e5] }
(5. Qg4 { Le coup de Bogoljubow : la dame attaque g7. Mais la chaîne reste sans soutien, et le coup perd environ 0,9 pion. [%cal Gg4g7] }
5... c5 { L'attaque de la base, sans perdre de temps. Le meilleur coup. [%cal Rc5d4] }
6. Nb5 { Le cavalier vise les cases c7 et d6, près du roi noir. Un coup ambitieux, un peu moins bon que 6.Nf3 (écart d'environ 0,4 pion). [%cal Gb5c7,Gb5d6] }
6... cxd4 { LA BASE TOMBE. Le pion e5 n'a plus aucun pion pour le soutenir. Le meilleur coup. [%csl Re5] }
7. Nf3 { Le cavalier protège e5 et attaque d4. Presque aussi bon que 7.Qf4. [%cal Gf3e5,Gf3d4] }
7... Nc6 { Le cavalier attaque la pointe e5, désormais sans soutien de pion. Le meilleur coup. [%cal Rc6e5] }
8. Qf4 { Stockfish ramène la dame pour défendre e5. Presque aussi bon que 8.Qg3. [%cal Gf4e5] }
(8. Nd6+ { Le coup de la partie : le cavalier donne échec, mais il va être pris. Il perd environ 0,7 pion. }
8... Bxd6 { Le fou prend le cavalier. Le meilleur coup. }
9. Qxg7 { La dame prend g7 et attaque la tour h8. Presque aussi bon que 9.exd6. [%cal Gg7h8] }
9... Bb4+ { Stockfish donne échec et ouvre le jeu contre le roi blanc. Le meilleur coup. [%cal Gb4e1] }
(9... Bxe5 { Le coup de Réti : il rend la qualité pour garder un centre solide. Le moteur le trouve 1,4 pion moins fort que 9...Bb4+, mais la position noire reste bonne. [%cal Gd6e5] }
10. Nxe5 { Le cavalier reprend le fou. Le meilleur coup. }
10... Qf6 { La dame propose l'échange. Elle protège f7 et vise f2. Le meilleur coup. [%cal Gf6f2] }
11. Qxf6 { Les Blancs échangent. Le meilleur coup. }
11... Nxf6 { Le cavalier reprend. Le meilleur coup. }
12. Bb5 { Le fou cloue le cavalier c6. Presque aussi bon que 12.Bf4. [%cal Gb5c6] }
12... Bd7 { Le fou défend c6. Le meilleur coup. }
13. Nf3 { Le cavalier recule et attaque d4. 13.Bxc6 était un peu plus précis. [%cal Gf3d4] }
13... Ne4 { Le cavalier s'installe en e4. Presque aussi bon que 13...a5. }
14. O-O { Le roi blanc se met à l'abri. Presque aussi bon que 14.Bxc6. }
14... f6 { Le pion f protège e5 et g5 contre les pièces blanches. Presque aussi bon que 14...Rg8. }
15. Bxc6 { Le fou b5 échange le cavalier c6. Le meilleur coup. }
15... bxc6 { Le pion reprend vers le centre. Le meilleur coup. }
16. Nxd4 { Le cavalier récupère le pion d4. Le meilleur coup. }
16... c5 { Le pion chasse le cavalier. Les Noirs ont maintenant un centre de quatre pions (c5, d5, e6, f6). Le meilleur coup. Le chapitre suivant reprend ici. [%csl Gc5,Gd5,Ge6,Gf6] })
10. c3 { Le pion bloque l'échec. Le meilleur coup. }
10... dxc3 { Le pion noir prend en c3 et menace ...cxb2. Le meilleur coup. }
11. Qxh8+ { La dame prend la tour. Le meilleur coup. }
11... Nf8 { Le cavalier bloque l'échec. Les Noirs vont regagner la tour : après 12.bxc3 Bxc3+ 13.Bd2 Bxa1, environ -2,0. Le meilleur coup. })
8... Bb4+ { Le fou donne échec. Le meilleur coup. }
9. c3 { Le pion s'interpose. Le meilleur coup. }
9... dxc3 { Le pion d noir prend en c3 et ouvre la diagonale vers a1. Le meilleur coup. }
10. bxc3 { Le pion b reprend en c3. Le meilleur coup. }
10... Be7 { Le fou recule. Les Noirs ont une position saine, environ -0,9. Le meilleur coup. })
5... c5 { Les Noirs attaquent quand même la base d4. Le meilleur coup. [%cal Rc5d4] }
6. Nf3 { Le cavalier défend d4. Le meilleur coup. [%cal Gf3d4] }
6... Nc6 { Deuxième attaque sur d4. 6...cxd4 était un rien plus précis. [%cal Rc6d4] }
7. Be3 { Le fou ajoute un défenseur à d4. Avec f4, la chaîne est solide de la base à la pointe : environ +0,5. Le meilleur coup.

Bilan : contre une attaque de la base, il faut soit défendre la base, soit renforcer la pointe. Bogoljubow n'a fait ni l'un ni l'autre. [%cal Ge3d4] }`,
    ),
    chapter(
      "Bogoljubow – Réti (1923) : le centre noir avance",
      "r3k2r/p2b3p/4pp2/2pp4/3Nn3/8/PPP2PPP/R1B2RK1 w kq - 0 17",
      `{ Suite de Bogoljubow – Réti, après 16.Nxd4 c5. Les Noirs sont un peu mieux, environ -0,8.

Les dames sont échangées. Il reste aux Noirs un centre de quatre pions : c5, d5, e6, f6. Ces pions vont avancer l'un après l'autre et prendre des cases aux pièces blanches. Ils vont aussi former une NOUVELLE chaîne, qui pointe vers le camp blanc.

PRO TIP : un centre de pions mobile se pousse quand chaque avance prend une case importante à l'adversaire. Ne pousse pas un pion qui laisserait une case libre derrière lui. }
17. Ne2 { Le cavalier, attaqué par le pion c5, recule. Le meilleur coup. }
17... Kf7 { Le roi noir se centralise : sans les dames, il ne craint plus rien. Presque aussi bon que 17...Rc8. }
18. f3 { Le pion chasse le cavalier e4. Presque aussi bon que 18.Rd1. [%cal Gf3e4] }
18... Nd6 { Le cavalier recule. Il vise c4, f5 et b5. Le meilleur coup. [%cal Gd6c4,Gd6f5] }
19. b3 { Le pion prend la case c4 au cavalier. Presque aussi bon que 19.Rd1. }
19... e5 { LE CENTRE AVANCE. Le pion e prend les cases d4 et f4 aux pièces blanches. Presque aussi bon que 19...Rac8. [%cal Ge5d4,Ge5f4] }
20. Ba3 { Le fou attaque le pion c5. Presque aussi bon que 20.c3. [%cal Ga3c5] }
20... Rac8 { La tour défend c5. Le meilleur coup. [%cal Gc8c5] }
21. Rad1 { La tour attaque le pion d5. 21.c3 était un peu plus précis. [%cal Gd1d5] }
21... d4 { UNE NOUVELLE CHAÎNE. Le pion d avance : c5 et e5 le protègent. Il prend les cases c3 et e3 aux pièces blanches. Le meilleur coup. [%csl Gc5,Gd4,Ge5][%cal Gd4e3,Gd4c3] }
22. Rd2 { Stockfish garde la tour active sur la 2e rangée. Presque aussi bon que 22.Rfe1. }
(22. Nc1 { Le coup de Bogoljubow : le cavalier recule sur la première rangée, où il ne fait plus rien. Il perd plus de 1 pion. }
22... Nf5 { Le cavalier vise e3. Presque aussi bon que 22...Nb5. [%cal Gf5e3] }
23. Rf2 { La tour défend la 2e rangée. 23.Rfe1 était un peu plus précis. }
23... Ne3 { Le cavalier s'installe en e3, protégé par le pion d4. Cette case, c'est la chaîne qui l'a créée. Le meilleur coup ; le dernier chapitre reprend ici. [%csl Ge3,Gd4] })
22... Nb5 { Le cavalier attaque le fou a3. Presque aussi bon que 22...Rhd8. [%cal Gb5a3] }
23. Bb2 { Le fou recule sur la grande diagonale, face au pion d4. Les Noirs restent mieux, environ -1,2. Le meilleur coup.

Bilan : chaque avance du centre noir a pris une case aux Blancs (f4, d4, puis c3 et e3). [%csl Gc3,Ge3] }`,
    ),
    chapter(
      "Bogoljubow – Réti (1923) : la nouvelle chaîne décide",
      "2r4r/p2b1k1p/5p2/4p3/1Ppp4/B3nP2/P1P2RPP/2N1R1K1 b - - 0 25",
      `{ Suite de Bogoljubow – Réti. Depuis le chapitre précédent, les Blancs ont joué 22.Nc1 (une faute, 22.Rd2 tenait mieux) 22...Nf5 23.Rf2 Ne3 24.Re1 c4 25.b4. Ce dernier coup est une nouvelle faute (25.f4 limitait la casse) : la position noire est maintenant gagnante, environ -4,3.

Regarde la nouvelle chaîne noire : c4-d4-e5, avec f6 derrière. Elle pointe en plein camp blanc. Le cavalier e3, protégé par d4, est planté au cœur de la position.

Dans une position aussi décisive, les écarts avec le moteur sont seulement signalés : la partie garde son fil.

PRO TIP : une chaîne qui avance sert de rampe aux pièces. Chaque pion poussé donne une nouvelle case protégée à un cavalier. }
25... Ba4 { Le fou rejoint l'aile dame et attaque le pion c2, déjà visé par le cavalier e3. Presque aussi bon que 25...Bf5. [%cal Ga4c2,Ge3c2] }
26. Ree2 { La tour défend c2 et le pion g2. Le meilleur coup. }
26... Nd1 { Le cavalier commence sa promenade : de d1, il attaque la tour f2. Le meilleur coup. [%cal Gd1f2] }
27. Rf1 { La tour recule. Le meilleur coup. }
27... Nc3 { Le cavalier attaque maintenant la tour e2 et le pion a2. 27...Ne3 était un peu plus fort, l'écart est faible. [%cal Gc3e2,Gc3a2] }
28. Ref2 { La tour quitte e2. Le meilleur coup. }
28... Nb1 { Le cavalier va attaquer le fou a3. Stockfish préférait 28...Nd5 (-4,7 contre -3,0) ; la position reste gagnante. [%cal Gb1a3] }
29. Bb2 { Le fou recule sur la grande diagonale. Le meilleur coup. }
29... c3 { LA CHAÎNE AVANCE ENCORE. Le pion c chasse le fou b2. La chaîne noire c3-d4-e5 coupe maintenant le camp blanc en deux. Le meilleur coup. [%csl Gc3,Gd4,Ge5][%cal Gc3b2] }
30. Nb3 { Le cavalier attaque le pion d4. Le meilleur coup. [%cal Gb3d4] }
30... Bxb3 { Le fou prend le cavalier qui menaçait la chaîne. Le meilleur coup. }
31. axb3 { Le pion a reprend en b3 : les pions blancs de l'aile dame sont doublés. Le meilleur coup. }
31... Nd2 { Le cavalier attaque la tour f1 et les pions b3 et f3. Le meilleur coup. [%cal Gd2f1,Gd2b3,Gd2f3] }
32. Re1 { La tour s'écarte. Le meilleur coup. }
32... Rhd8 { La deuxième tour vient derrière le pion d : elle prépare ...d3. Le meilleur coup. [%cal Gd8d3] }
33. Bc1 { Le fou attaque le cavalier d2. Presque aussi bon que 33.Ba1. [%cal Gc1d2] }
33... d3 { LA PERCÉE. Le pion d avance et ouvre la colonne d. Le meilleur coup. [%cal Gd4d3] }
34. cxd3 { Le pion c blanc prend le pion d3. Le meilleur coup. }
34... Rxd3 { La tour reprend et protège le cavalier d2. 34...Nxb3 était encore plus fort (-4,0 contre -3,3). }
35. Bxd2 { Les Blancs donnent leur fou contre le cavalier. Le meilleur coup. }
35... Rxd2 { La tour reprend : elle est sur la 2e rangée. Stockfish préférait 35...cxd2 (-3,8 contre -3,0). }
36. Ra1 { La tour vise le pion a7. 36.Rc1 tenait plus longtemps (-3,5 contre -4,7). [%cal Ga1a7] }
36... Ke6 { Le roi s'avance vers le pion c. Le meilleur coup. }
37. Kf1 { Le roi blanc s'approche. 37.h4 résistait un peu mieux. }
37... Rxf2+ { Les Noirs échangent les tours. Le meilleur coup. }
38. Kxf2 { Le roi reprend. Le meilleur coup. }
38... c2 { Le pion c arrive à une case de la promotion. Le meilleur coup. [%cal Gc2c1] }
39. Rc1 { La tour bloque la case c1. Le meilleur coup. }
39... Kd5 { Le roi noir vient soutenir le pion. Le meilleur coup. [%cal Gd5c4] }
40. Ke3 { Le roi blanc approche du pion c2. Le meilleur coup. }
40... Rc3+ { La tour donne échec et protège le pion c2 par derrière… mais surtout repousse le roi. Le meilleur coup. }
41. Kd2 { Le roi attaque la tour c3. Presque aussi bon que 41.Ke2. }
41... Kd4 { Le roi protège la tour. Le meilleur coup. }
42. h4 { Coup d'attente désespéré. 42.Ke2 tenait plus longtemps. }
42... Rd3+ { La tour donne échec : après Ke2, le roi noir file en c3 puis en b2, et le pion c va à dame. Bogoljubow abandonne.

Bilan : la base d4 attaquée dès le 5e coup est tombée. Les Noirs ont ensuite formé leur PROPRE chaîne, l'ont poussée case par case, et elle a fini par donner le pion passé décisif. [%cal Gd4c3,Gc3b2] }`,
    ),
    chapter(
      "Est-Indienne : chaque camp joue du côté où pointe sa chaîne",
      START,
      `{ Les chaînes de pions ne se trouvent pas que dans la Française. Dans l'Est-Indienne classique, le centre se bloque et DEUX chaînes se font face :
- la chaîne blanche e4-d5 (base e4, pointe d5) ;
- la chaîne noire d6-e5 (base d6, pointe e5).

La pointe de chaque chaîne montre une direction. La chaîne blanche monte vers l'aile dame : les Blancs y jouent, avec la poussée c4-c5 contre la base d6. La chaîne noire monte vers l'aile roi : les Noirs y jouent, avec ...f5 contre la base e4, puis la marche ...g5-g4.

C'est le « transfert d'aile » : quand le centre est fermé, chacun attaque là où ses pions lui donnent de l'espace.

PRO TIP : si le centre est bloqué, ne joue jamais du côté où ta chaîne recule. Tu y manquerais d'espace, et tes pièces s'y gêneraient. }
1. d4 { Le pion dame prend le centre. Le meilleur coup. }
1... Nf6 { Le cavalier surveille e4 et attend. Presque aussi bon que 1...d5. }
2. c4 { Le pion c prend de l'espace et vise d5. Le meilleur coup. }
2... g6 { Les Noirs préparent le fianchetto du fou f8. Le meilleur coup. }
3. Nc3 { Le cavalier soutient la poussée e2-e4. Le meilleur coup. [%cal Gc3e4] }
3... Bg7 { Le fou s'installe sur la grande diagonale. Les Noirs laissent les Blancs bâtir un grand centre pour l'attaquer plus tard. 3...d5 (la Grünfeld) était un peu plus précis selon Stockfish. }
4. e4 { Les Blancs occupent le centre avec trois pions (c4, d4, e4). Le meilleur coup. }
4... d6 { Le pion d contrôle e5 et prépare ...e5. Le meilleur coup. [%cal Gd6e5] }
5. Nf3 { Le cavalier se développe et protège d4. Presque aussi bon que 5.Be2. }
5... O-O { Le roi noir se met à l'abri derrière le fianchetto. Presque aussi bon que 5...Bg4. }
6. Be2 { Le fou se développe modestement en e2 et libère la case de roque. Le meilleur coup. }
6... e5 { Les Noirs frappent le centre : le pion e attaque d4. Aussi bon que 6...Na6 selon Stockfish. [%cal Re5d4] }
7. O-O { Les Blancs roquent sans encore choisir leur structure. Le meilleur coup. }
7... Nc6 { Le cavalier ajoute une attaque sur d4. 7...h6 ou 7...Na6 étaient un peu plus souples (écart de 0,15 pion). [%cal Rc6d4] }
8. d5 { LE CENTRE SE FERME. Le pion d avance et chasse le cavalier. Deux chaînes se forment : e4-d5 pour les Blancs, d6-e5 pour les Noirs. Le meilleur coup. [%csl Ge4,Gd5,Rd6,Re5] }
8... Ne7 { Le cavalier quitte la colonne bloquée et se tourne vers l'aile roi (cases g6 et f5). Le meilleur coup. [%cal Ge7g6] }
9. Ne1 { Le cavalier part vers d3, d'où il soutiendra c4-c5. Il libère aussi le pion f2 pour f2-f3. Le meilleur coup. [%cal Ge1d3] }
9... Nd7 { Le cavalier dégage le pion f7 pour ...f5 et surveille c5. 9...Ne8 était un rien plus précis. [%cal Gf7f5] }
10. Be3 { Le fou vise l'aile dame (la case c5) et la diagonale a7. Presque aussi bon que 10.f3. }
10... f5 { L'ATTAQUE DE LA BASE, version noire. Le pion f attaque e4, la base de la chaîne blanche. Le meilleur coup. [%cal Rf5e4][%csl Re4] }
11. f3 { Les Blancs soutiennent la base par un pion. Le meilleur coup. [%cal Gf3e4] }
11... f4 { Les Noirs gagnent de l'espace et chassent le fou e3. Leur chaîne s'allonge (d6-e5-f4) et pointe encore plus vers le roi blanc. Le meilleur coup. [%csl Gd6,Ge5,Gf4][%cal Gf4e3] }
12. Bf2 { Le fou recule mais garde la diagonale vers c5 et a7. Le meilleur coup. }
12... g5 { La marche des pions commence : ...g4 suivra pour ouvrir des lignes contre le roi blanc. Le meilleur coup.

Bilan : le centre est fermé. Les Blancs joueront à l'aile dame (c4-c5), les Noirs à l'aile roi (...g5-g4). Les deux plans suivent la direction des chaînes. [%cal Gg5g4,Gc4c5] }`,
    ),
    chapter(
      "Est-Indienne : la course des ruptures (c5 contre la base d6)",
      "r1bq1rk1/pppnn1bp/3p4/3Pp1p1/2P1Pp2/2N2P2/PP2BBPP/R2QNRK1 w - - 0 13",
      `{ Suite de la ligne Mar del Plata, après 12...g5. Environ +0,6 pour les Blancs.

Chaque camp attaque la chaîne adverse à sa base :
- les Blancs poussent c4-c5 contre d6, la base de la chaîne noire ;
- les Noirs ont déjà joué ...f5-f4 et préparent ...g4 contre le roque blanc.

Dans ces positions, le TEMPS compte plus qu'un pion. Les Blancs vont même sacrifier des pions pour ouvrir l'aile dame au plus vite.

PRO TIP : dans une course d'attaques sur deux ailes opposées, compte tes coups jusqu'à l'ouverture d'une colonne. Un pion donné pour gagner deux temps est souvent un bon marché. }
13. Rc1 { La tour vient sur la colonne c, où elle soutiendra la poussée c4-c5. Le meilleur coup. [%cal Gc1c5] }
13... Ng6 { Le cavalier rejoint l'aile roi et soutient le pion f4 et la future poussée ...g4. Le meilleur coup. [%cal Gg6f4] }
14. c5 { L'ATTAQUE DE LA BASE. Le pion c attaque d6, la base de la chaîne noire. Les Blancs l'offrent : ils veulent ouvrir la colonne c. Le meilleur coup. [%cal Rc5d6][%csl Rd6] }
14... Nxc5 { Les Noirs acceptent le pion. Le meilleur coup. }
15. b4 { Un deuxième pion pour gagner du temps : le pion b chasse le cavalier c5. Le meilleur coup. [%cal Gb4c5] }
15... Na6 { Le seul bon retour : 15...Nd7 ou 15...b6 coûtaient environ 1,4 pion. [%cal Gc5a6] }
16. Nb5 { Le cavalier attaque a7 et c7, les cases faibles de l'aile dame noire. Aussi bon que 16.Nd3. [%cal Gb5a7,Gb5c7] }
16... Rf7 { La tour protège c7 le long de la 7e rangée. 16...h5, qui continuait l'attaque à l'aile roi, était un peu plus précis (écart d'environ 0,15 pion). [%cal Gf7c7] }
17. Nxa7 { Le cavalier récupère un pion et menace le fou c8. Le meilleur coup. [%cal Ga7c8] }
17... Nxb4 { Le cavalier noir prend le pion b4. Presque aussi bon que 17...Bd7. }
18. Nxc8 { Le cavalier prend le fou c8, la pièce qui devait soutenir l'attaque ...g4. Le meilleur coup. }
18... Qxc8 { La dame reprend. Les Noirs ont un pion de plus, mais les Blancs ont ouvert les colonnes de l'aile dame et pris le fou de cases blanches noir : environ +0,7. Le meilleur coup.

Bilan : les Blancs ont attaqué la base d6 à coups de pions sacrifiés. Ils ont gagné du temps et des lignes ouvertes du côté où pointe leur chaîne. }`,
    ),
  ],
};
