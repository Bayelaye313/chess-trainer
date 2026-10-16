import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « La sécurité du roi en milieu de partie » (positional_mastery,
 * module 15) — format « un commentaire par coup » du 2026-10-12.
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, entièrement
 * réécrite ici) : Petrosian – Smyslov (1961), Morphy – Duc de Brunswick et
 * Comte Isouard (Paris 1858), Tartakower – Frentz (1933), Tarrasch – von
 * Scheve (1894), Porges – Lasker (1896), Chekhover – Rudakovsky (1945) et
 * Botvinnik – Kan (1943), telles que présentées dans « The Most Instructive
 * Games of Chess Ever Played » de Chernev (`chernev1.pgn`) ; la partie de
 * l'Opéra vient de `PILOT_pm-la-securite-du-roi-en-milieu-de-partie.pgn`.
 * Écartée après sondage : Keres – Tarnowski 1952 (manœuvres lentes, une
 * imprécision de 0,3 à 1 pion presque à chaque coup, aucun moment clair de
 * sécurité du roi avant le 30e coup).
 *
 * Plan : définition — chaque coup de pion devant le roi a un prix (1), puis
 * la brèche qu'ils ouvrent (2) ; le roi resté au centre, Morphy (3) et
 * Tartakower – Frentz (4) ; Tarrasch – von Scheve : ouvrir la colonne g (5),
 * la défense par une barrière de pièces (6), le sacrifice sur g7 (7) ; le
 * sacrifice sur g2 de Lasker (8) ; le crochet et les cases noires,
 * Chekhover – Rudakovsky (9) ; la prévention, Botvinnik – Kan (10).
 *
 * Toutes les lignes ont été rejouées avec chess.js et chaque coup sondé avec
 * Stockfish 18 (profondeur 18, 3 candidats par coup), suites du moteur
 * comprises. Règle appliquée : quand un coup perd environ 0,5 pion ou plus
 * par rapport au choix du moteur, la LIGNE PRINCIPALE suit le moteur et la
 * suite de la partie passe en variante, signalée comme fautive. Exception :
 * dans une position déjà décisive (plus de +3 environ), un écart est
 * seulement signalé dans le commentaire. Plusieurs chapitres commencent donc
 * après une imprécision signalée dans l'introduction. Les évaluations citées
 * sont du point de vue des Blancs. Aucun résultat de partie (1-0, 0-1…) dans
 * les variantes : le parseur s'y arrêterait.
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

export const LA_SECURITE_DU_ROI: CourseTree = {
  chapters: [
    chapter(
      "Définition : chaque coup de pion devant le roi a un prix",
      "r3k2r/pb2bppp/1pn1p3/2q5/8/P2BPN2/1P1B1PPP/R2QK2R w KQkq - 2 13",
      `{ Qu'est-ce qu'un roi EN SÉCURITÉ au milieu de partie ? Un roi derrière ses pions intacts (par exemple f7, g7, h7 après le petit roque), avec au moins une pièce mineure à côté de lui, et qu'aucune colonne ni diagonale ouverte ne vise directement.

Trois facteurs le mettent en danger :
1. les coups de pions devant lui. Un pion ne recule jamais : chaque poussée laisse derrière elle des cases que plus aucun pion ne protège. Pire, le pion avancé devient un CROCHET, une cible sur laquelle l'adversaire accroche ses propres pions pour ouvrir des lignes ;
2. le manque de défenseurs : compte les pièces adverses qui visent ton roi et les tiennes qui le protègent ;
3. le retard de roque : un roi resté au centre subit toutes les colonnes qui s'ouvrent.

Petrosian – Smyslov, 1961. Les Noirs n'ont pas encore roqué. Les Blancs ont deux fous pointés vers l'aile roi : le fou d3 vise h7, le fou d2 pourra venir en c3 pour viser g7. Regarde comment chaque coup de pion noir devant le roi va coûter quelque chose.

PRO TIP : avant de pousser un pion devant ton roi, demande-toi quelle case tu abandonnes et quel pion adverse pourra venir le frapper. }
13. Rc1 { La tour prend la colonne c et chasse la dame c5. Le meilleur coup selon Stockfish. [%cal Gc1c5] }
13... Qd6 { La dame recule en d6. De là, elle attaque le fou d3, qui n'est plus protégé, et regarde h2. 13...Qd5 était un rien plus précis, l'écart est minime. [%cal Gd6d3,Gd6h2] }
14. Qc2 { La dame protège le fou d3 et forme avec lui une BATTERIE dirigée vers h7. Elle vise aussi le cavalier c6 par la colonne c. Le meilleur coup. [%cal Gc2h7] }
14... Rc8 { La tour défend le cavalier c6 et s'oppose sur la colonne c. Le meilleur coup. Note que roquer tout de suite (14...O-O) aurait été une faute (+1,2) : le roi serait allé se placer juste en face de la batterie dame-fou qui vise h7. }
15. O-O { Les Blancs mettent d'abord LEUR roi à l'abri avant d'attaquer. Le meilleur coup. }
15... Bf6 { LE BON COUP selon Stockfish. Le fou se place sur la grande diagonale noire et protège d'avance la case g7, que le fou d2 voulait viser depuis c3. La position reste presque égale (+0,4). [%csl Gg7][%cal Gf6b2] } (15... h6 { LA FAUTE DE LA PARTIE. Ce coup de pion ne fait rien contre le plan blanc Fc3 et coûte un temps alors que le roi est encore en e8. Le pion h6 deviendra en plus une cible. Stockfish passe de +0,4 à +1,4. [%csl Rh6] } 16. Rfd1 { La tour se place face à la dame d6 sur la colonne d. Un des deux meilleurs coups, presque équivalent à 16.Bc3. [%cal Gd1d6] } 16... O-O { Le roi noir roque enfin, mais le pion h6 est déjà avancé. Un des meilleurs coups. } 17. Bc3 { Le fou s'installe sur la grande diagonale et vise g7. Le meilleur coup. [%cal Gc3g7] } 17... Qb8 { La dame quitte la colonne d, où elle faisait face à la tour d1, et vise h2. Le meilleur coup. } 18. Qa4 { Le premier d'une série de coups de dame. Elle attaque a7 et le cavalier c6, et prépare surtout un passage vers e4. Le meilleur coup. [%cal Ga4e4] } 18... Rfd8 { La tour noire conteste la colonne d. Le meilleur coup. } 19. Qe4 { LA MENACE. La dame et le fou d3 visent h7 ensemble : 20.Qh7+ Kf8 21.Qh8 serait mat. Le meilleur coup. [%cal Ge4h7,Gd3h7] } 19... g6 { La seule bonne défense, qui bouche la diagonale vers h7. Mais c'est un DEUXIÈME pion qui avance : les cases noires f6 et g7 ne sont plus protégées par aucun pion, et elles sont juste sur la diagonale du fou c3. [%csl Rf6,Rg7] } 20. Qg4 { La dame change de cible : elle attaque le pion e6 et le pion g6. Le meilleur coup. [%cal Gg4e6,Gg4g6] } 20... h5 { Le meilleur coup : le pion chasse la dame. C'est le TROISIÈME coup de pion devant le roi. Le pion h5 sera bientôt un crochet. } 21. Qh3 { La dame se replie en h3, d'où elle vise e6 et le pion h5. Le meilleur coup. [%cal Gh3e6] } 21... e5 { LA MEILLEURE DÉFENSE selon Stockfish. Le pion libère la case e6 de la pression et coupe la diagonale du fou c3 en e5. Les Blancs restent nettement mieux (+1,1), mais rien n'est décidé. [%cal Re5c3] } (21... f5 { LA FAUTE DE LA PARTIE : un QUATRIÈME coup de pion. Le pion e6 n'a plus de pion pour le défendre et la diagonale a2-g8 s'ouvre vers le roi. Stockfish passe de +1,1 à +2,5. La suite est le sujet du chapitre 2. [%csl Re6] } 22. Bc4 { Le fou vise aussitôt le pion e6 et la diagonale du roi. Le meilleur coup. [%cal Gc4e6,Gc4g8] }) 22. g4 { LE CROCHET. Le pion g attaque le pion h5 pour ouvrir une colonne vers le roi noir. Le meilleur coup. [%cal Gg4h5] } 22... hxg4 { Les Noirs prennent. Le meilleur coup. } 23. Qxg4 { La dame reprend et se place sur la colonne g, face au pion g6. Le meilleur coup. } 23... Qc7 { La dame noire se rapproche du centre. Le meilleur coup. } 24. h4 { Le pion h avance à son tour pour venir frapper g6 depuis h5. Presque aussi bon que 24.Be4. Bilan : avec trois pions avancés, le roi noir a perdu son abri naturel, et les Blancs gardent l'initiative (+1). }) 16. Be4 { Le fou propose l'échange du fou b7, le fou qui défend les cases blanches autour du roi noir. Presque équivalent à 16.Rfd1. [%cal Ge4b7] }
16... h6 { Maintenant ce coup est acceptable : le fou f6 tient déjà la grande diagonale, et le pion h6 offre simplement une case de fuite au roi. Presque aussi bon que 16...Qd7. }
17. Qa4 { La dame cloue le cavalier c6 contre le roi e8. Presque aussi bon que 17.Rfd1. [%cal Ga4e8] }
17... O-O { Le roque casse le clouage. C'est le seul bon coup : 17...Qc7 donnait +1,7 aux Blancs. }
18. Rfd1 { La tour vient sur la colonne d, face à la dame. Le meilleur coup. }
18... Rfd8 { Les Noirs opposent leur tour. Le meilleur coup. }
19. Bc3 { Le fou propose l'échange des fous de cases noires. Le meilleur coup.

Bilan : les Noirs ont roqué à temps, avec UN SEUL pion avancé et un fou qui garde la grande diagonale. La position est presque égale (+0,3). Comparé à la variante de la partie, tout tient dans l'ordre des coups : d'abord le défenseur (Bf6), ensuite le roque. }`,
    ),
    chapter(
      "La brèche : quand les pions ne protègent plus le roi",
      "1qrr2k1/pb2b3/1pn1p1p1/5p1p/8/P1BBPN1Q/1P3PPP/2RR2K1 w - - 0 22",
      `{ Suite de Petrosian – Smyslov (variante 21...f5 du chapitre 1). Regarde les pions noirs de l'aile roi : f5, g6 et h5. Les trois pions qui abritaient le roi ont tous avancé.

Conséquences :
- le pion e6 n'a plus aucun pion pour le défendre ;
- la diagonale a2-g8, qui mène au roi, n'est plus bouchée ;
- les cases f6, g7 et h6 sont noires et vides, sur la diagonale du fou c3.

Les Blancs sont nettement mieux (+2,5). Leur plan : frapper le pion e6, puis ouvrir les lignes par la poussée e4.

À partir du 23e coup, la position devient décisive (+3) : les coups de la partie restent alors en ligne principale, même quand Stockfish en préfère d'autres. }
22. Bc4 { Le fou quitte d3, où la tour d8 l'attaquait, et vise immédiatement le pion e6. Le meilleur coup. [%cal Gc4e6] }
22... Rxd1+ { Les Noirs échangent une paire de tours. 22...Kh7 était un rien plus tenace (+2,8 contre +3,0). }
23. Rxd1 { La tour reprend et prend la colonne d. Le meilleur coup. Le pion e6 n'est plus protégé que par le roi. [%csl Re6] }
23... Kf7 { LE ROI DEVIENT DÉFENSEUR. Il vient protéger lui-même le pion e6. C'est le meilleur coup, mais un roi qui doit défendre ses pions n'est plus à l'abri. [%cal Gf7e6] }
24. e4 { LA RUPTURE. Le pion e attaque f5 pour ouvrir la colonne e et la diagonale vers le roi. Presque aussi bon que 24.Re1. [%cal Ge4f5] }
24... Qf4 { La dame contre-attaque le pion e4 et le cavalier f3. Le meilleur coup. [%cal Gf4e4,Gf4f3] }
25. Re1 { La tour protège le pion e4 et vient sur la future colonne ouverte. Le meilleur coup. }
25... Qg4 { Les Noirs proposent l'échange des dames pour calmer l'attaque. Stockfish préférait 25...Bf6 (+3,0 au lieu de +4,1) ; la position était de toute façon décisive. [%cal Gg4h3] }
26. exf5 { Les Blancs ignorent l'offre et ouvrent la position. Si 26...Qxh3, alors 27.Bxe6+ gagne le pion avec échec. Le meilleur coup. }
26... Qxc4 { La dame prend le fou. 26...Qxh3 limitait les dégâts (+4,2 contre +5,0). }
27. fxg6+ { Le pion arrive en g6 avec échec : il n'y a plus un seul pion noir devant le roi. Le meilleur coup. [%csl Rf7] }
27... Ke8 { Le roi fuit vers le centre. Le meilleur coup, 27...Kxg6 étant à peu près équivalent. }
28. g7 { Le pion menace d'aller à dame en g8. Le meilleur coup. [%cal Gg7g8] }
28... e5 { Une nouvelle imprécision : 28...Kd7 tenait plus longtemps (+5,5 contre +8,1). }
29. Qxh5+ { La dame entre par la brèche avec échec. Le meilleur coup. }
29... Kd7 { Le roi continue sa fuite vers l'aile dame. Le meilleur coup. }
30. Rd1+ { La tour donne échec sur la colonne d. Le meilleur coup. }
30... Bd6 { Le fou s'interpose. Le meilleur coup. }
31. Bxe5 { Le fou prend le pion e5 et vise le fou d6, cloué devant le roi. Le meilleur coup. }
31... Nd4 { Le cavalier se sacrifie pour gêner les pièces blanches. Le meilleur coup dans une position perdue. }
32. Nxd4 { Le cavalier prend. Les Blancs ont une pièce de plus et une attaque qui continue (+8,5) ; les Noirs abandonnent ici.

Bilan : quatre coups de pions devant le roi (h6, g6, h5, f5) ont suffi. Le roi noir a fini au milieu de l'échiquier, sans abri. }`,
    ),
    chapter(
      "Morphy à l'Opéra : punir le roi resté au centre",
      "rn1qkbnr/ppp2ppp/8/4p3/4P3/5Q2/PPP2PPP/RNB1KB1R w KQkq - 0 6",
      `{ Morphy – Duc de Brunswick et Comte Isouard, Paris 1858 : la partie la plus célèbre de l'histoire sur le thème du roi resté au centre.

Après 1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5 Bxf3 5.Qxf3 dxe5, les Noirs ont donné leur fou des cases blanches contre un cavalier. Stockfish signale déjà 3...Bg4 comme imprécis (3...Nf6 maintenait environ +0,5 ; la position passe à +1,1). Résultat : les Blancs ont la paire de fous, une dame active en f3, et le roi noir est toujours en e8.

La règle à retenir : un roi au centre n'est en danger que si les lignes autour de lui S'OUVRENT. Le camp le mieux développé cherche donc à ouvrir des colonnes et des diagonales, quitte à donner du matériel.

PRO TIP : si ton roi est encore au centre et que l'adversaire est en avance de développement, ne perds pas de temps. Roque, ou échange les dames. }
6. Bc4 { Le fou se développe et forme avec la dame f3 une batterie contre f7, que seul le roi protège : la menace est 7.Qxf7 mat. 6.Qb3 était un rien plus précis. [%cal Gc4f7,Gf3f7] }
6... Qf6 { LA BONNE DÉFENSE selon Stockfish. La dame protège f7 et propose l'échange des dames : sans elles, le roi au centre ne risque plus grand-chose. [%cal Gf6f3] } (6... Nf6 { LE COUP DE LA PARTIE, une faute (+1,2 → +2,2). Le cavalier défend f7 contre la dame, mais la dame noire reste en d8 et les Blancs gagnent un temps précieux. } 7. Qb3 { La dame attaque à la fois f7 et b7. Le meilleur coup. [%cal Gb3f7,Gb3b7] } 7... Qe7 { La dame protège f7. Le meilleur coup, mais elle bouche la case de son fou f8 : le roque s'éloigne. } 8. Nc3 { Morphy préfère développer une pièce plutôt que prendre le pion b7. 8.Qxb7 était presque équivalent. } 8... c6 { Le pion ferme la diagonale a4-e8 et couvre les cases b5 et d5. Le meilleur coup. } 9. Bg5 { Le fou cloue le cavalier f6 contre la dame e7. Le meilleur coup : chaque pièce blanche entre dans le jeu avec gain de temps. [%cal Gg5f6,Gf6e7] } 9... Kd8 { LA MEILLEURE DÉFENSE selon Stockfish : le roi quitte de lui-même la colonne e avant que les lignes s'ouvrent, et va chercher un abri à l'aile dame. } (9... b5 { LE COUP DE LA PARTIE, la faute décisive (+2,2 → +3,4). Les Noirs chassent la dame, mais chaque coup de pion près du roi ouvre une ligne de plus vers lui. } 10. Nxb5 { LE SACRIFICE. Le cavalier se donne pour ouvrir la diagonale a4-e8. Le meilleur coup. } 10... cxb5 { Les Noirs prennent. 10...Qb4+, qui proposait l'échange des dames, limitait les dégâts. } 11. Bxb5+ { Le fou reprend avec échec : la diagonale vers e8 est ouverte. Le meilleur coup. [%cal Gb5e8] } 11... Nbd7 { Le cavalier s'interpose. Le meilleur coup, mais il est cloué contre le roi. } 12. O-O-O { Le grand roque amène la tour sur la colonne d, face au cavalier d7 cloué. Le meilleur coup. [%cal Gd1d7] } 12... Rd8 { La tour vient défendre le cavalier d7. Presque aussi bon que 12...Rb8. } 13. Rxd7 { La tour prend le cavalier pour ouvrir encore la position. Le meilleur coup. } 13... Rxd7 { La tour reprend. 13...Nxd7 était un rien meilleur. } 14. Rd1 { La deuxième tour vient attaquer la tour d7, clouée. Le meilleur coup. [%cal Gd1d7] } 14... Qe6 { La dame vient défendre la tour d7. 14...g6 tenait plus longtemps. } 15. Bxd7+ { Le fou prend la tour avec échec. Le meilleur coup. } 15... Nxd7 { Le cavalier reprend, ce qui permet un mat en deux coups. 15...Qxd7 durait plus longtemps. } 16. Qb8+ { LE SACRIFICE DE DAME. La dame se donne pour attirer le cavalier en b8 et libérer la colonne d. Le meilleur coup. } 16... Nxb8 { Forcé : c'est le seul coup légal. } 17. Rd8# { MAT. La tour donne mat sur la colonne d, protégée par le fou g5. Le roi noir n'a jamais quitté e8. }) 10. O-O-O+ { Le grand roque avec échec. Presque équivalent à 10.a4. } 10... Kc7 { Le roi trouve un abri en c7, derrière les pions b7 et c6. Le meilleur coup. } 11. Bxf7 { Le fou prend le pion f7. Le meilleur coup. } 11... Nbd7 { Le cavalier se développe. Le meilleur coup : les Noirs ont un pion de moins, mais leur roi est à l'abri (+2,2), loin de la catastrophe de la partie. }) 7. Qb3 { La dame évite l'échange et attaque b7. Le meilleur coup. [%cal Gb3b7] }
7... Nd7 { Le cavalier se développe et laisse le pion b7. C'est le meilleur coup : défendre b7 par 7...b6 coûtait environ un pion d'évaluation de plus. }
8. Qxb7 { La dame prend le pion. Le meilleur coup. }
8... Rb8 { La tour chasse la dame avec gain de temps. Le meilleur coup. }
9. Qa6 { La dame se replie en a6. Presque aussi bon que 9.Qd5.

Bilan : les Blancs ont un pion de plus (+1,2), mais le roi noir n'est pas en danger : la dame f6 garde f7 et la colonne b sert maintenant la tour noire. Comparé à la partie, la différence tient en un coup, 6...Qf6, qui a refusé d'ouvrir le jeu devant un roi encore au centre. }`,
    ),
    chapter(
      "Tartakower – Frentz : le roi resté au centre",
      "r2qk2r/ppp2pbp/2n5/8/6b1/5N2/PPQB1PPP/2KR1B1R b kq - 5 11",
      `{ Tartakower – Frentz, 1933. Une ouverture très agitée : les pions se sont pris les uns les autres, et il ne reste aux Noirs que les pions f7 et h7 à l'aile roi. Le roi noir est encore en e8.

Les deux camps ont déjà fait une imprécision : 9.Qc2 (Stockfish préférait 9.Bc4) et 10...Bg4 (10...Qe7+ était meilleur). Les Blancs viennent de jouer 11.O-O-O : leur roi est en sécurité et leur tour d1 occupe déjà la colonne d ouverte, face à la dame d8.

Le thème : quand le roi reste au centre et que les colonnes centrales sont ouvertes, chaque pièce adverse peut lui donner échec. Même l'échange des dames ne le sauve pas toujours : les tours et les fous suffisent.

PRO TIP : avec un roi au centre, évite d'échanger tes pièces mineures actives. Ce sont souvent elles qui bouchent les lignes devant ton roi. }
11... Qf6 { LE BON COUP selon Stockfish. La dame quitte la colonne d, où la tour d1 la regardait, et attaque le cavalier f3 avec le fou g4. Les Blancs ne sont que légèrement mieux (+0,5). [%cal Gf6f3,Gg4f3] } (11... Bxf3 { LA FAUTE DE LA PARTIE. Le fou se donne contre le cavalier, sans y être obligé. Stockfish passe de +0,5 à +1,5 : les Noirs perdent du temps et un défenseur, et les Blancs vont gagner des temps en donnant des échecs. } 12. gxf3 { Le pion g reprend le fou, ce qui ouvre la colonne g. Le meilleur coup. } 12... Nd4 { Le cavalier attaque la dame c2 et le pion f3. Le meilleur coup. [%cal Gd4c2,Gd4f3] } 13. Qe4+ { La dame se dégage avec échec sur la colonne e. 13.Rhe1+ était un peu plus précis (+1,8 contre +1,4), l'écart reste raisonnable. } 13... Qe7 { La seule bonne parade : 13...Ne6 ou 13...Kf8 perdaient beaucoup plus (+4,7 et +5,7). } 14. Qxe7+ { Les Blancs échangent les dames : même sans elles, le roi noir restera exposé. Presque aussi bon que 14.Qxb7. } 14... Kxe7 { Le roi reprend, forcé. Il est maintenant au milieu de l'échiquier. } 15. Bb4+ { Le fou donne échec sur la diagonale a3-f8. Le meilleur coup. [%cal Gb4e7] } 15... Ke8 { Le roi retourne en e8. Presque équivalent à 15...Ke6. } 16. Bb5+ { Le second fou donne échec à son tour. Le meilleur coup. [%cal Gb5e8] } 16... c6 { Le pion s'interpose. C'est le seul bon coup : 16...Nxb5 permettait un mat en deux coups, et 16...Kd8 perdait gros (+4,4). } 17. Rhe1+ { La dernière pièce blanche arrive avec échec. Les deux tours, les deux fous : toutes les pièces blanches jouent, alors que les tours noires a8 et h8 ne sont toujours pas reliées. Le meilleur coup. [%cal Ge1e8] } 17... Kd8 { LA MEILLEURE DÉFENSE selon Stockfish. Mais regarde : le roi en d8 cloue lui-même son cavalier d4 sur la colonne d. [%cal Gd1d8] } (17... Ne6 { LE COUP DE LA PARTIE, une nouvelle imprécision (+2,0 au lieu de +1,3). Le cavalier abandonne la case d4 pour boucher la colonne e, mais les Blancs gagneront bientôt du matériel. }) 18. Bxc6 { Le fou attaqué prend le pion c6. Le meilleur coup. } 18... bxc6 { Les Noirs reprennent la pièce. Le meilleur coup. } 19. Bc5 { Le fou attaque une deuxième fois le cavalier d4 cloué. Les Blancs vont récupérer leur pièce et rester avec un pion de plus. Le meilleur coup. [%cal Gc5d4,Gd1d4] } 19... Re8 { La tour conteste la colonne e. Le meilleur coup. Les Blancs restent nettement mieux (+1,3). }) 12. Bg5 { Le fou attaque la dame avec gain de temps. Le meilleur coup. [%cal Gg5f6] }
12... Qf5 { La dame se place face à la dame c2 et propose son échange : sans dames, un roi au centre souffre moins. Le meilleur coup. [%cal Gf5c2] }
13. Bd3 { Le fou s'interpose et attaque la dame. Le meilleur coup. }
13... Qa5 { Le seul bon coup : 13...Qd5 ou 13...Qd7 perdaient plus de trois pions d'évaluation. La dame attaque le fou g5 et le pion a2. [%cal Ga5g5,Ga5a2] }
14. Rhe1+ { La tour donne échec sur la colonne e. Le meilleur coup. }
14... Kf8 { Le seul bon coup. Le roi perd le droit de roquer, mais il quitte la colonne e et se met à l'écart.

Bilan : les Noirs tiennent (+0,5) parce qu'ils ont gardé leur fou g4 et rendu leur dame active. Dans la partie, l'échange 11...Bxf3 a coûté des temps et laissé le roi seul face à quatre pièces blanches. }`,
    ),
    chapter(
      "Tarrasch – von Scheve : ouvrir la colonne g",
      "r1bqk2r/pp1n1ppp/2p1p3/8/1bPPpB2/4P2P/PP1N1PP1/R2QKB1R w KQkq - 2 10",
      `{ Tarrasch – von Scheve, 1894. Tarrasch affirmait avoir conçu son attaque dès le 8e coup. Le moteur nuance : la vraie faute noire est le coup qui vient d'être joué, 9...Bb4 (+0,6 → +1,5). Les Noirs vont échanger leur fou des cases noires, le seul qui pouvait protéger le pion g7, contre un cavalier.

Le pion g7 est la CLÉ du petit roque : il protège f6 et h6 et ferme la colonne g. Le plan blanc est donc :
1. garder la paire de fous ;
2. roquer de l'autre côté (grand roque), pour pouvoir pousser les pions de l'aile roi sans exposer son propre roi ;
3. ouvrir la colonne g, puis y placer les tours.

PRO TIP : quand les rois ont roqué de côtés opposés, la poussée des pions contre le roi adverse est gratuite : ces pions n'abritent pas ton propre roi. }
10. a3 { Le pion chasse le fou b4. Le meilleur coup. [%cal Ga3b4] }
10... Bxd2+ { Les Noirs donnent leur fou des cases noires contre le cavalier. C'est le meilleur coup dans cette position, mais la conséquence est durable : plus aucune pièce noire ne pourra couvrir les cases noires autour du roi. [%csl Rg7] }
11. Qxd2 { La dame reprend. Le meilleur coup : les Blancs ont maintenant la paire de fous. }
11... O-O { Le roi noir roque. Le meilleur coup, à égalité avec 11...Qe7. }
12. Qc2 { La dame attaque le pion e4. L'écart avec le meilleur coup (12.Rd1) est faible. [%cal Gc2e4] }
12... f5 { Le pion f protège e4. C'est un coup de pion devant le roi : la diagonale a2-g8 et la case e5 sont affaiblies. L'écart avec le meilleur coup (12...e5) est faible. [%csl Re5] }
13. Bd6 { Le fou s'installe en d6, une case noire au cœur du camp noir. Il attaque la tour f8 et empêche ...Qe7. Le meilleur coup. [%cal Gd6f8] }
13... Re8 { La tour s'écarte. 13...Rf7, qui gardait la deuxième rangée, était un rien plus précis. }
14. O-O-O { Le grand roque : le roi blanc s'éloigne de l'aile où vont avancer les pions. Le meilleur coup. }
14... Nf6 { Le cavalier vient protéger l'aile roi. Le meilleur coup. }
15. Be5 { Le fou attaque le cavalier f6 et se place sur la grande diagonale, face à g7. Presque aussi bon que 15.Bf4. [%cal Ge5f6,Ge5g7] }
15... Nd7 { LE BON COUP selon Stockfish. Le cavalier attaque le fou e5 pour l'échanger : sans ce fou, la grande diagonale ne menace plus g7. [%cal Gd7e5] } (15... Bd7 { LE COUP DE LA PARTIE, une faute (+1,6 → +2,5). Le fou se développe, mais il laisse le fou e5 en place, face à g7. } 16. g4 { LE BON COUP selon Stockfish. Le pion g attaque directement le pion f5 pour ouvrir la colonne g. [%cal Gg4f5] } (16. f3 { LE COUP DE LA PARTIE : Tarrasch attaque le pion e4 pour ouvrir la colonne g par l'échange. C'est plus lent que 16.g4 (+2,5 → +2,0). } 16... exf3 { Les Noirs prennent. Un rien moins précis que 16...b5. } 17. gxf3 { Le pion reprend : la colonne g est ouverte. Le meilleur coup. La suite est le sujet du chapitre 6. }) 16... Rc8 { Les Noirs préparent ...c5 pour ouvrir le jeu au centre. Le meilleur coup. } 17. Be2 { Le fou se développe enfin. Le meilleur coup : les Blancs gardent une forte attaque (+2,7). }) 16. c5 { Le pion gagne de l'espace à l'aile dame. Presque aussi bon que 16.Bd6. }
16... b5 { Les Noirs cherchent du contre-jeu contre le roi blanc. Le meilleur coup. }
17. g4 { Le pion g attaque f5 : les Blancs ouvrent quand même des lignes à l'aile roi. Le meilleur coup.

Bilan : en échangeant le fou e5, les Noirs limitent l'avantage blanc (+1,7). Dans la partie, ils l'ont laissé sur la grande diagonale, et la colonne g s'est ouverte devant un roi sans défenseur des cases noires. }`,
    ),
    chapter(
      "Tarrasch – von Scheve : la défense par une barrière de pièces",
      "r2qr1k1/pp1b2pp/2p1pn2/4Bp2/2PP4/P3Pp1P/1PQ3P1/2KR1B1R w - - 0 17",
      `{ Suite de Tarrasch – von Scheve (fin du chapitre 5). Le pion noir vient de prendre en f3. Les Blancs vont reprendre avec leur pion g : la colonne g s'ouvrira alors devant le roi noir.

La cible : le pion g7, la clé du roque noir. Les Blancs vont l'attaquer avec leurs deux tours, leur dame et le fou e5.

Ce chapitre montre surtout la DÉFENSE. Les Noirs n'ont plus de fou des cases noires et ne peuvent plus rien changer à leurs pions. Il leur reste une seule méthode : construire une BARRIÈRE DE PIÈCES devant le roi. Regarde la tour qui vient en f7 pour défendre g7 par le côté, et le cavalier qui revient en e8.

Les Blancs sont nettement mieux (+2,3). La position devient décisive vers le 22e coup.

PRO TIP : quand tes pions ne protègent plus ton roi, compte les attaquants et les défenseurs de la case clé (ici g7). Tant que tu as autant de défenseurs que l'adversaire a d'attaquants, la case tient. }
17. gxf3 { Le pion reprend vers le centre : la colonne g est ouverte. Le meilleur coup. [%csl Rg7] }
17... b5 { Les Noirs cherchent un contre-jeu contre le roi blanc à l'aile dame. 17...Rf8 était à peu près équivalent. [%cal Gb5c4] }
18. Rg1 { La première tour arrive sur la colonne g et vise g7. Un des meilleurs coups. [%cal Gg1g7] }
18... Rf8 { La tour revient en f8 pour aller en f7. Le meilleur coup. }
19. Rd2 { La deuxième tour prépare Rdg2 par la deuxième rangée. L'écart avec le meilleur coup est minime. [%cal Gd2g2] }
19... Rf7 { LA BARRIÈRE COMMENCE. La tour défend g7 par la septième rangée. Presque aussi bon que 19...Be8. [%cal Gf7g7] }
20. Rdg2 { Les tours se doublent : deux attaquants contre g7. Un des meilleurs coups. [%csl Rg7] }
20... a5 { Les Noirs poussent leur pion a vers le roi blanc. Le meilleur coup. }
21. Qf2 { La dame prépare Qh4, puis Qh6, pour ajouter un troisième attaquant. Le meilleur coup. [%cal Gf2h4] }
21... Ne8 { LE MEILLEUR COUP DE DÉFENSE. Le cavalier revient en e8, d'où il protège g7. En plus, la diagonale d8-h4 s'ouvre pour la dame noire : si 22.Qh4, la dame d8 prendrait en h4. [%cal Ge8g7,Gd8h4] }
22. Rg5 { La tour se place en g5 et bouche la diagonale d8-h4 : la dame blanche pourra aller en h4. La tour attaque aussi le pion f5. Le meilleur coup. [%cal Gf2h4] }
22... Qe7 { La dame noire se rapproche et attaque la tour g5. Presque aussi bon que 22...Bc8. La position est maintenant décisive (+3). }
23. Qh4 { La dame passe derrière la tour et vise h7. Le meilleur coup. [%cal Gh4h7] }
23... Nf6 { Le cavalier revient en f6 pour protéger h7. Stockfish préférait 23...bxc4 (+3,3 contre +4,4) : la barrière commence à céder. }
24. Qh6 { LA DAME ARRIVE EN H6. Elle attaque g7 pour la troisième fois et vise le cavalier f6. Le meilleur coup. Note que la dame est en prise au pion g7 ; mais le pion g7 est cloué par la tour g5 contre le roi g8, il ne peut pas la prendre. [%cal Gh6g7,Gg5g8] }
24... Ra7 { La deuxième tour noire vient sur la septième rangée pour aider la défense, mais le fou d7 la sépare encore de g7. 24...Be8 tenait un peu mieux. La suite (chapitre 7) montre comment les Blancs font céder ce mur par un sacrifice. }`,
    ),
    chapter(
      "Tarrasch – von Scheve : le sacrifice sur g7",
      "6k1/r2bqrpp/2p1pn1Q/pp2BpR1/2PP4/P3PP1P/1P6/2K2BR1 w - - 8 25",
      `{ Fin de Tarrasch – von Scheve (suite du chapitre 6). Les Noirs ont construit leur barrière : le pion g7 est défendu par la tour f7 et par le roi, et le cavalier f6 bouche la diagonale de la dame. Il est attaqué par la dame h6 et les deux tours g5 et g1, alignées sur la colonne. La position est décisive (+5,5).

Quand le nombre d'attaquants égale celui des défenseurs, l'attaquant cherche à ÉLIMINER ou à DÉTOURNER un défenseur. Un sacrifice de pièce le fait souvent avec gain de temps.

Regarde aussi le fou d7 : il coupe la septième rangée entre a7 et f7. La tour a7, venue pour aider, ne défend en réalité ni g7 ni la tour f7.

PRO TIP : dans une attaque contre le roque, compte à nouveau les attaquants et les défenseurs après CHAQUE échange. Un seul défenseur détourné suffit souvent à faire tomber tout le mur. }
25. Bd6 { LE FOU S'OFFRE. Il attaque la dame e7, qui protège le cavalier f6. Le meilleur coup. [%cal Gd6e7] }
25... Qxd6 { La dame accepte le cadeau. C'est une faute, même dans une position perdue : 25...Bc8 limitait les dégâts (+5,7 au lieu de +9,8). La dame quitte l'aile roi : le cavalier f6 n'est plus défendu que par la tour f7, déjà chargée de protéger g7. }
26. Rxg7+ { LA TOUR ENTRE EN G7 avec échec. Elle attaque la tour f7 et le pion h7. Le meilleur coup. Si 26...Rxg7, alors 27.Qxg7 est mat, la dame étant protégée par la tour g1. [%cal Gg7f7,Gg7h7] }
26... Kf8 { Le roi s'écarte. C'est le seul coup qui ne mate pas tout de suite : 26...Kh8 permettait un mat en deux coups. }
27. Rxh7+ { La tour prend le pion h7 avec échec. 27.c5, qui chassait d'abord la dame d6, était encore plus fort (+9,1 contre +7,0) ; la position reste totalement gagnante. }
27... Ke7 { Le roi fuit vers le centre. Équivalent à 27...Ke8. }
28. Rxf7+ { La tour prend la tour f7 avec échec. Le meilleur coup. }
28... Kxf7 { Le roi reprend. Le meilleur coup : 28...Ke8 permettait un mat rapide. }
29. Rg7+ { La deuxième tour arrive en g7 avec échec. Le meilleur coup. }
29... Ke8 { Le roi recule. Le seul bon coup : 29...Kf8 permettait 30.Qh8+ Ng8 31.Qxg8 mat. }
30. Qxf6 { La dame prend le cavalier f6, le dernier défenseur. Elle menace Rg8+ puis le mat. Le meilleur coup ; les Noirs abandonnent ici.

Bilan : le mur de pièces noires (tours f7 et a7, cavalier, dame) n'a pas résisté à un seul détournement. Retiens l'ordre de l'attaque : ouvrir une colonne (chapitre 5), y doubler les tours et y amener la dame (chapitre 6), puis sacrifier pour détourner un défenseur. }`,
    ),
    chapter(
      "Porges – Lasker : le sacrifice sur g2",
      "r4rk1/pn1b2pp/2p5/3p2q1/3Np3/1PP2P2/P2N2PP/R1Q1R1K1 b - - 2 22",
      `{ Porges – Lasker, 1896. Cette fois, c'est le ROI BLANC qui est en danger. Les Blancs ont dû rendre leur fou des cases noires et leurs pièces sont éparpillées (dame c1, cavaliers d2 et d4). Les pièces noires, elles, sont toutes tournées vers l'aile roi : dame g5, tour f8, fou d7.

Deux imprécisions blanches ont aggravé la situation : 20.c3 (20.Qb4, qui ramenait la dame vers le jeu, était meilleur d'environ 0,6 pion) et 22.Qc1 (22.Qb4 encore). Les Noirs sont nettement mieux (-2,9), et la position devient décisive au 24e coup.

Le thème : le pion g2 est le pilier du roque blanc. Quand assez de pièces noires le visent, on peut le prendre par un SACRIFICE : le roi blanc sort alors de son abri, et les autres pièces arrivent avec échec.

PRO TIP : avant un sacrifice sur le roque, compte les pièces qui pourront participer à l'attaque juste après. Ici, la dame, la tour f8, le fou d7 et le pion e4 sont tous prêts. }
22... Nc5 { Le cavalier revient en jeu. Il ira en d3 puis en f4, tout près du roi blanc. Le meilleur coup. [%cal Gc5d3,Gd3f4] }
23. Nf1 { Le cavalier blanc revient défendre l'aile roi. Le meilleur coup. }
23... Qg6 { La dame se place en g6 et vise g2. Le meilleur coup. [%cal Gg6g2] }
24. Re3 { La tour protège la troisième rangée. Stockfish préférait 24.fxe4 ; l'écart est faible, mais la position est décisive désormais (-3,4). }
24... Nd3 { Le cavalier s'installe en d3, attaque la dame c1 et prépare Nf4. Le meilleur coup. [%cal Gd3c1] }
25. Qd1 { La dame recule. Stockfish préférait rendre la qualité par 25.Rxd3 (-3,4 au lieu de -4,0). }
25... Nf4 { LE CAVALIER ARRIVE EN F4, tout près du roi : il attaque g2, que la dame vise aussi. 25...c5 était encore plus fort selon Stockfish, mais le coup de la partie prépare le sacrifice. [%cal Gf4g2,Gg6g2] }
26. Ng3 { Le cavalier vient protéger le roi en bouchant la colonne g. C'est le seul bon coup : 26.Qd2 perdait encore plus. }
26... h5 { Le pion h vient chasser le cavalier g3, le dernier défenseur. Presque aussi bon que 26...Qh6. [%cal Gh5h4] }
27. Nde2 { L'autre cavalier attaque le cavalier f4. Le meilleur coup. [%cal Ge2f4] }
27... Nxg2 { LE SACRIFICE. Le cavalier prend le pion g2 et attaque la tour e3. Le meilleur coup. Le roi blanc perd son pion le plus important. [%csl Rg2] }
28. Kxg2 { Le roi prend : laisser le cavalier perdait aussi. Le meilleur coup. }
28... exf3+ { Le pion e prend en f3 avec échec : le pion attaque directement le roi g2, et la colonne f s'ouvre pour la tour f8. Le meilleur coup. }
29. Rxf3 { La tour reprend et bloque la colonne f. Le meilleur coup. }
29... Bh3+ { DEUXIÈME SACRIFICE. Le fou s'offre en h3 avec échec pour attirer le roi. Le meilleur coup. [%cal Gh3g2] }
30. Kxh3 { Le roi accepte. Les autres cases étaient pires : 30.Kf2 ou 30.Kh1 perdaient plus vite. }
30... Qg4+ { La dame donne échec et attaque la tour f3. 30...Rxf3 était un rien plus fort, l'écart est minime. [%cal Gg4f3] }
31. Kg2 { Le roi revient en g2, seul coup légal. }
31... Qxf3+ { La dame prend la tour avec échec : les Noirs ont regagné tout le matériel sacrifié, avec une attaque. Le meilleur coup. }
32. Kg1 { Le roi recule en g1. 32.Kh3 tenait plus longtemps. }
32... h4 { Le pion chasse le cavalier g3. 32...Qf2+ était encore plus précis, mais tout gagne. }
33. Nh1 { Une erreur dans une position perdue : elle permet un mat forcé. }
33... Qe3+ { La dame donne échec et le mat ne peut plus être évité ; les Blancs abandonnent ici.

Bilan : le pion g2 est tombé parce que quatre unités noires (dame, cavalier, fou, pion e4) visaient l'aile roi, et que les deux cavaliers blancs ne suffisaient pas à la défendre. }`,
    ),
    chapter(
      "Chekhover – Rudakovsky : le crochet g6 et les cases noires",
      "3r1rk1/1b3ppp/pqp1p3/2R5/Pp1P3Q/1P2P3/4BPPP/2R3K1 w - - 3 26",
      `{ Chekhover – Rudakovsky, 1945. Les pions noirs f7, g7 et h7 sont encore intacts. Pourtant le roi noir est en danger : aucune pièce mineure noire ne se trouve près de lui (le fou b7 est loin, enfermé derrière le pion c6), et la dame blanche h4 est déjà installée à l'aile roi. Les Blancs dominent aussi la colonne c. Leur position est décisive (+3,4) : les coups de la partie restent en ligne principale.

Le plan blanc, en trois temps :
1. forcer un coup de pion devant le roi (...g6) ;
2. installer la dame dans le trou noir f6 ;
3. pousser le pion h jusqu'en h6, en l'accrochant au pion g6 : c'est le CROCHET. Avec un pion blanc en h6 et la dame en f6, la case g7 devient une case de mat.

PRO TIP : un pion adverse avancé devant le roi (g6, h6) est une cible pour tes pions. Pousse ton pion voisin contre lui : soit il ouvre une colonne, soit il s'installe à côté du roi. }
26. a5 { Le pion chasse la dame b6, loin de l'aile roi. Le meilleur coup. [%cal Ga5b6] }
26... Qa7 { La dame se réfugie en a7 et attaque la tour c5. Presque aussi bon que 26...Qc7. Elle est maintenant très loin de son roi. [%cal Ga7c5] }
27. Bd3 { Le fou vise h7 : avec la dame h4, la menace est 28.Qxh7 mat. Presque aussi bon que 27.R1c4. [%cal Gd3h7,Gh4h7] }
27... g6 { Le seul coup raisonnable pour parer le mat. Mais les cases noires f6 et h6 n'ont plus de pion pour les garder, et les Noirs n'ont plus de fou des cases noires. [%csl Rf6,Rh6] }
28. Qf6 { La dame s'installe dans le trou f6. Elle attaque la tour d8, le pion e6, le pion f7 et le pion g6. Presque aussi bon que 28.R1c4. [%csl Gf6] }
28... Rd6 { La tour chasse la dame. 28...Qb8 était un rien meilleur. [%cal Gd6f6] }
29. Qe7 { La dame se déplace en e7, d'où elle attaque la tour d6 et le fou b7. Stockfish préférait 29.R1c4 : l'avantage redescend de +4,0 à +2,8, la position reste largement gagnante. }
29... Rfd8 { La tour f8 vient protéger la tour d6. Presque aussi bon que 29...Qb8. }
30. h4 { LE PION H SE MET EN MARCHE vers g6. Le meilleur coup. [%cal Gh4h6] }
30... R8d7 { La tour chasse la dame e7. Presque aussi bon que 30...Qb8. }
31. Qf6 { La dame revient dans le trou f6. Presque aussi bon que 31.Qe8+. }
31... Qa8 { La dame cherche à revenir par la grande diagonale. 31...Qb8 était un rien meilleur. }
32. Be4 { Le fou change de diagonale : il attaque le pion c6, protecteur du fou b7, et le pion g6. Le meilleur coup. [%cal Ge4c6] }
32... Qe8 { La dame revient enfin près de son roi. L'écart avec le meilleur coup (32...Rc7) est faible. }
33. h5 { LE CROCHET. Le pion h frappe le pion g6. Presque aussi bon que 33.R1c4. [%cal Gh5g6] }
33... Rd8 { Une faute dans une position déjà perdue : 33...Rc7 tenait mieux (+4,0 contre +5,1). }
34. Bxc6 { Le fou prend le pion c6 et attaque le fou b7 et la dame e8. Le meilleur coup. }
34... Bxc6 { Les Noirs reprennent. Le meilleur coup. }
35. h6 { LE PION EST EN H6. La menace est maintenant 36.Qg7 mat : la dame en g7 serait protégée par le pion h6. Le meilleur coup. [%csl Rg7][%cal Gf6g7] }
35... Kf8 { Le roi libère la case g8. 35...Qf8, qui gardait g7, était plus tenace. Note que 35...Rxd4 aurait permis un mat immédiat. }
36. Rxc6 { La tour prend le fou. Le meilleur coup. }
36... Rxc6 { La tour reprend. Le meilleur coup. }
37. Rxc6 { La tour reprend à son tour. Le meilleur coup : les Blancs ont une pièce de plus. }
37... Rd7 { La tour protège la septième rangée. 37...Qxc6 durait plus longtemps (+6,9 contre +9,8). }
38. Rc8 { LA DÉVIATION. La tour s'offre en c8 pour attirer la dame noire sur la huitième rangée. 38.Qg7+ était encore plus fort, mais le coup de la partie gagne aussi. [%cal Gc8e8] }
38... Qxc8 { La dame prend la tour : c'est le meilleur coup, les autres coups permettaient un mat forcé. }
39. Qh8+ { L'ENFILADE. La dame donne échec en h8 : le roi doit quitter la huitième rangée, et la dame prendra la dame c8. Le meilleur coup ; les Noirs abandonnent ici.

Bilan : les Noirs n'ont fait qu'UN coup de pion devant leur roi, 27...g6. Il a suffi : sans fou des cases noires, les cases f6, g7 et h6 sont devenues la propriété de la dame blanche et du pion h. [%cal Gh8c8] }`,
    ),
    chapter(
      "Botvinnik – Kan : garder son défenseur ou fuir à temps",
      "1q2k2r/1b2bpp1/pp3n1p/2p1pP2/P3P3/2N2BB1/1PP1Q1PP/3R3K w k - 1 21",
      `{ Botvinnik – Kan, 1943, une Sicilienne. Le roi noir est resté en e8. Ce n'est pas forcément une faute : le centre est bloqué par les pions e5 et e4, aucune colonne centrale n'est ouverte, et le cavalier f6 protège l'aile roi. La position est presque équilibrée (+0,5).

Ce chapitre montre les deux MESURES DE DÉFENSE d'un roi exposé :
1. garder à tout prix la pièce qui le protège (ici le cavalier f6) ;
2. si cette pièce disparaît, mettre le roi à l'abri AVANT que les lignes s'ouvrent : roquer tard vaut mieux que jamais.

PRO TIP : un roi au centre tient tant que le centre est fermé. Dès qu'un pion adverse menace d'ouvrir une ligne, demande-toi où ton roi sera en sécurité dans trois coups. }
21. Nd5 { Le cavalier saute en d5. Il attaque le fou e7, le cavalier f6 et le pion b6 : la menace est Nxf6+, qui détruirait les pions de l'aile roi. Presque aussi bon que 21.b3. [%cal Gd5f6,Gd5e7] }
21... Bxd5 { LE BON COUP selon Stockfish. Le fou élimine le cavalier d5 : le cavalier f6, défenseur du roi, reste en place. [%csl Gf6] } (21... Nxd5 { LE COUP DE LA PARTIE, une faute (+0,5 → +1,9). Le cavalier f6 s'échange : le roi noir perd son seul défenseur à l'aile roi, et le pion f5 pourra avancer. [%csl Rf6] } 22. exd5 { Le pion e reprend le cavalier et s'installe en d5, ce qui libère la route du pion f. Le meilleur coup. } 22... Bd6 { Le fou protège le pion e5. Le meilleur coup. } 23. f6 { LE PION S'ENFONCE en f6. Il attaque g7 et coupe le camp noir en deux : le roi e8 ne peut plus compter sur l'aile roi. Le meilleur coup. [%cal Gf6g7] } 23... O-O { LA MEILLEURE DÉFENSE selon Stockfish : le roi part immédiatement vers g8, avant que les Blancs ouvrent le centre. Les Blancs restent mieux (+2,3), mais le roi a trouvé un abri. } (23... g6 { LE COUP DE LA PARTIE, une nouvelle imprécision (+2,3 → +2,8). Les Noirs bouchent l'aile roi mais laissent leur roi au centre. } 24. Bxe5 { Le fou prend le pion e5. Le meilleur coup : le centre s'ouvre devant le roi noir. } 24... Kd7 { La meilleure fuite selon Stockfish : le roi part vers l'aile dame (+3,0). } (24... Kd8 { LE COUP DE LA PARTIE, une faute (+3,0 → +4,0). } 25. Bxd6 { Le fou prend le fou d6. Le meilleur coup. } 25... Qxd6 { La dame reprend. C'est le seul coup : les autres permettaient un mat forcé. } 26. Qe7+ { La dame impose l'échange avec échec. Le meilleur coup : le pion f6 va arriver en e7. } 26... Qxe7 { Forcé : 26...Kc8 perdait tout de suite. } 27. fxe7+ { Le pion reprend avec échec. Il s'installe en e7, à côté du roi noir, et paralyse les pièces noires. Le meilleur coup (+4,6). } 27... Kd7 { Le roi attaque le pion e7. Le meilleur coup, mais les Blancs le protégeront par d6 et la finale est perdue pour les Noirs (+4,5) : leur roi n'a jamais trouvé d'abri. })) 24. Be4 { Le fou vise le roque noir par la diagonale b1-h7. Le meilleur coup. [%cal Ge4h7] } 24... g6 { Le seul bon coup : 24...Re8 ou 24...Rd8 perdaient beaucoup plus. Le roi noir est en sécurité derrière g6 et h6. }) 22. exd5 { Le pion e reprend le fou en d5 : la position reste fermée au centre. Le meilleur coup. }
22... Bd6 { Le fou protège le pion e5. C'est le seul bon coup : roquer tout de suite (22...O-O) aurait été une faute (+3,2), tout comme 22...Nd7. }
23. Bh4 { Le fou attaque le cavalier f6. Le meilleur coup. [%cal Gh4f6] }
23... Qb7 { La dame attaque le pion d5. Le meilleur coup.

Bilan : avec le cavalier f6 toujours en place, le roi noir peut rester en e8 et la position reste presque équilibrée (+0,5). Dans la partie, l'échange de ce défenseur a tout changé. }`,
    ),
  ],
};
