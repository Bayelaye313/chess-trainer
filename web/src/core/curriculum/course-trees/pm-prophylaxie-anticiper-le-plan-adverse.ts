import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « Prophylaxie : anticiper le plan adverse » (positional_mastery,
 * module 12) — format « un commentaire par coup » du 2026-10-12.
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, entièrement
 * réécrite ici) : Tarrasch – Showalter (Vienne 1898), Petrosian – Kozali
 * (1954) et Petrosian – Kortchnoï (1946), tels que présentés dans « Logical
 * Chess: Move by Move » de Chernev ; Reshevsky – Petrosian (Zurich 1953,
 * tournoi des candidats), score complet de chessgames.com ; Bartholomew –
 * Gareev (États-Unis 2009), d'après le chapitre 10 de « Chess Structures »
 * (Flores Rios) — score jusqu'au 33e coup, le 20e coup blanc (20.Nc3) retrouvé
 * par force brute contre la suite du score. Le chapitre 1 est une ligne
 * théorique de la partie espagnole fermée, sans source.
 *
 * Plan : la question prophylactique (chapitre 1) ; Tarrasch – Showalter,
 * étouffer la rupture ...f5 de l'ouverture à la finale, avec le roi qui
 * s'écarte avant l'ouverture des colonnes (2 à 5) ; Petrosian – Kozali,
 * interdire une case puis enfermer un cavalier (6 et 7) ; Petrosian –
 * Kortchnoï, désamorcer une attaque à l'aile roi (8) ; Reshevsky – Petrosian,
 * le sacrifice de qualité prophylactique (9) ; Bartholomew – Gareev, la
 * prophylaxie en défense et Kh1 dans le hérisson (10).
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

export const PROPHYLAXIE: CourseTree = {
  chapters: [
    chapter(
      "La question prophylactique : que veut jouer l'adversaire ?",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      `{ La PROPHYLAXIE (du grec « se garder à l'avance ») consiste à empêcher un coup ou un plan adverse AVANT qu'il ne soit joué. Nimzowitsch en a fait un principe, Petrosian et Karpov en ont fait un style.

Il faut distinguer deux choses :
• PARER UNE MENACE DIRECTE : l'adversaire menace de prendre une pièce, tu la défends. C'est obligatoire, ce n'est pas encore de la prophylaxie.
• ÉTOUFFER UN PLAN : l'adversaire ne menace rien, mais il AIMERAIT jouer un certain coup dans deux ou trois tours. Tu l'en empêches tout de suite. Ça, c'est la prophylaxie.

La méthode tient en une question, à se poser avant chaque coup : « Si c'était à mon adversaire de jouer, que jouerait-il ? » Ce chapitre montre l'exemple le plus célèbre de la théorie : le petit coup h3 de la partie espagnole.

PRO TIP : un coup prophylactique a souvent l'air modeste. Sa force est négative : il retire à l'adversaire une ressource sur laquelle il comptait. }
1. e4 { Le pion roi prend le centre et libère le fou f1 et la dame. Le meilleur coup selon Stockfish, à égalité avec 1.d4 et 1.Nf3. }
1... e5 { Les Noirs prennent leur part du centre. Le meilleur coup. }
2. Nf3 { Le cavalier se développe et attaque le pion e5. Le meilleur coup. [%cal Gf3e5] }
2... Nc6 { Le cavalier défend e5. Le meilleur coup. }
3. Bb5 { La partie espagnole : le fou attaque le cavalier c6, qui défend e5. Le meilleur coup. [%cal Gb5c6] }
3... a6 { Les Noirs demandent au fou de se décider. Un des meilleurs coups selon Stockfish. }
4. Ba4 { Le fou garde le clouage du cavalier c6 sans l'échanger. Le meilleur coup. }
4... Nf6 { Le cavalier se développe et attaque le pion e4. Un coup aussi bon que 4...b5. [%cal Gf6e4] }
5. O-O { Le roi se met à l'abri. Si les Noirs prennent e4 (...Nxe4), les Blancs regagnent le pion, par exemple avec Re1 ou d4. Le meilleur coup. }
5... Be7 { Le fou se développe et prépare le roque. Un coup de théorie, aussi bon que les autres. }
6. Re1 { La tour protège e4 et se place sur la colonne e. Le meilleur coup. }
6... b5 { Le pion chasse le fou a4. Le meilleur coup. }
7. Bb3 { Le fou recule sur la diagonale a2-g8, face au pion f7. Le seul bon coup. [%cal Gb3f7] }
7... d6 { Le pion soutient e5 et ouvre la diagonale du fou c8. Aussi bon que 7...O-O. [%cal Gc8g4] }
8. c3 { Le pion prépare d2-d4 pour prendre le centre, et donne une case de retraite (c2) au fou b3. Le meilleur coup. }
8... O-O { Le roi noir se met à l'abri. Le meilleur coup. }
9. h3 { LE COUP PROPHYLACTIQUE. Les Blancs veulent jouer d4. Mais ils se demandent : « Que jouerait l'adversaire si c'était à lui ? » Réponse : ...Bg4, qui clouerait le cavalier f3 contre la dame et augmenterait la pression sur d4. Le pion h3 retire la case g4 au fou AVANT qu'il ne s'y installe. C'est le meilleur coup selon Stockfish (+0,45). [%csl Rg4] [%cal Gh3g4] }
(9. d4 { Le coup naturel, joué trop tôt. Stockfish le juge moins bon (+0,2 au lieu de +0,45) : il laisse la case g4 aux Noirs. } 9... Bg4 { Exactement le coup que h3 voulait empêcher. Le fou cloue le cavalier f3 et vise d4 à travers lui. Le meilleur coup. [%cal Gg4f3,Gf3d4] } 10. d5 { Les Blancs ferment le centre pour ne plus être gênés. Le pion attaque le cavalier c6. 10.Be3 était un peu plus précis. } 10... Na5 { Le cavalier s'écarte et attaque le fou b3. Le meilleur coup. [%cal Ga5b3] } 11. Bc2 { Le fou recule. Le meilleur coup. } 11... c6 { Les Noirs attaquent d5 tout de suite. La position est égale (0,0) : les Blancs n'ont rien gagné en sautant h3. })
9... Na5 { La variante Tchigorine : le cavalier chasse le fou b3 et va préparer ...c5. Stockfish préférait de peu 9...Bb7 (+0,4 contre +0,55). [%cal Ga5b3] }
10. Bc2 { Le fou recule en c2, où il soutiendra e4. Le meilleur coup. }
10... c5 { Le pion prend de l'espace et met d4 sous surveillance. Le meilleur coup. [%cal Gc5d4] }
11. d4 { Maintenant d4 arrive, et le fou noir ne peut plus aller en g4 : h3 a fait son travail. Le meilleur coup. [%csl Gh3] }
11... Qc7 { La dame soutient e5 et c5. Stockfish préférait 11...cxd4, mais l'écart est faible (+0,55 contre +0,65). }
12. Nbd2 { Le cavalier se développe vers f1 et g3. Les Blancs gardent un léger avantage (+0,5).

PRO TIP : avant de lancer ton plan (ici d4), demande-toi quelle sera la meilleure réponse adverse. Si un petit coup comme h3 la supprime à l'avance, joue-le d'abord. }`,
    ),
    chapter(
      "Tarrasch – Showalter (1) : empêcher ...f5 dès l'ouverture",
      "rnbqk1nr/ppp1bppp/3p4/3Pp3/2B1P3/5N2/PPP2PPP/RNBQK2R w KQkq - 1 6",
      `{ Vienne 1898. Tarrasch a les Blancs. Après 1.e4 e5 2.Nf3 Nc6 3.Bc4 Be7 4.d4 d6 5.d5 Nb8, le centre est FERMÉ : pions blancs en d5 et e4, pions noirs en d6 et e5.

Dans ce type de centre, chaque camp a une rupture de pion pour se libérer. Pour les Noirs, c'est ...f5 : le pion f attaque la base de la chaîne blanche (e4). Pour les Blancs, c'est c4-c5, contre la base de la chaîne noire (d6).

Tarrasch se pose la question prophylactique : « Que veut jouer Showalter ? » Réponse : ...f5. Toute sa partie va consister à rendre cette rupture impossible.

PRO TIP : dans un centre fermé, repère la rupture de pion de l'adversaire. C'est elle qu'il faut freiner en premier. [%csl Re4] [%cal Rf7f5] }
6. Bd3 { Le fou recule en d3, où il protège le pion e4. En c4, il buttait contre son propre pion d5. Avec un défenseur de plus sur e4, la rupture ...f5 perd de sa force. Le meilleur coup selon Stockfish (+0,8). [%cal Gd3e4] }
6... Nf6 { Le cavalier se développe et attaque e4. Stockfish préférait 6...Bg4, mais l'écart est minime. [%cal Gf6e4] }
7. c4 { Le pion c soutient d5. Si les Noirs jouent ...c6 puis ...cxd5, les Blancs reprendront avec le pion c et garderont un pion en d5. Il prend aussi de l'espace à l'aile dame, là où les Blancs joueront plus tard c5. Un des meilleurs coups. [%cal Gc4d5] }
7... O-O { Le roi noir se met à l'abri. }
8. h3 { DEUXIÈME COUP PROPHYLACTIQUE. Le pion h3 retire la case g4 au fou c8 (qui aurait échangé le cavalier f3, défenseur de e5 et de d4) et au cavalier f6. Il prépare aussi g4 : si les Noirs préparent ...f5 avec ...Ne8, le pion g4 viendra contrôler f5. Le meilleur coup selon Stockfish. [%csl Rg4] [%cal Gh3g4] }
8... c6 { Les Noirs attaquent d5 pour ouvrir la colonne c. Un des trois meilleurs coups. [%cal Gc6d5] }
9. Nc3 { Le cavalier défend d5 et e4. Le meilleur coup. [%cal Gc3d5,Gc3e4] }
9... Na6 { Le cavalier se développe vers c5 ou c7. 9...a5 était un peu plus précis. }
10. Be3 { TROISIÈME COUP PROPHYLACTIQUE. Le fou contrôle la case c5 : le cavalier noir ne pourra pas y venir attaquer le fou d3 et le pion e4. Si 10...Nc5?, alors 11.Bxc5 dxc5 12.Nxe5 gagne un pion. Le meilleur coup. [%csl Rc5] [%cal Ge3c5] }
10... Nc7 { Le cavalier va en c7, puisque c5 lui est interdit. Il attaque d5. 10...Qc7 était un peu plus précis (+1,0 contre +1,25). [%cal Gc7d5] }
11. O-O { Le roi blanc se met à l'abri. Le meilleur coup. }
11... Nfe8 { Voilà le plan de Showalter : le cavalier f6 recule pour libérer la route du pion f. Les Noirs préparent ...f5. Le meilleur coup.

PRO TIP : quand une pièce adverse recule sans raison apparente, demande-toi ce qu'elle libère. Ici, c'est la case f6, et donc la poussée ...f5. [%cal Rf7f5] }`,
    ),
    chapter(
      "Tarrasch – Showalter (2) : g4, et le roi s'écarte avant l'orage",
      "r1bqnrk1/ppn1bppp/2pp4/3Pp3/2P1P3/2NBBN1P/PP3PP1/R2Q1RK1 w - - 6 12",
      `{ Showalter vient de jouer 11...Nfe8 pour préparer ...f5. Tarrasch répond par une série de coups qui ont tous le même but : rendre cette rupture impossible, ou inoffensive.

Regarde aussi ce que fait le roi blanc. Tarrasch va pousser son pion g pour contrôler f5. Mais un pion g avancé ouvre son roque. Avant que la colonne g ne s'ouvre, le roi quitte g1. C'est la prophylaxie appliquée à son propre roi.

PRO TIP : avant de lancer tes pions devant ton roi, mets le roi à l'abri des lignes qui vont s'ouvrir. [%cal Rf7f5] }
12. Qc2 { La dame prépare l'avenir. Si les Noirs jouent ...f5 et que les Blancs prennent (exf5), la diagonale b1-h7 s'ouvre : la dame et le fou d3 y formeront une batterie contre f5 et h7. Stockfish place 12.Rc1 un rien devant, mais l'écart est minime (+1,25). [%cal Gc2h7] }
12... cxd5 { Les Noirs ouvrent la colonne c. Le meilleur coup. }
13. cxd5 { Le pion c reprend : e4 reste en place et continue de bloquer la diagonale noire vers f5. Le meilleur coup. [%csl Gd5,Ge4] }
(13. exd5?! { Une mauvaise reprise : le pion e4 disparaît, et ...f5 devient facile. Stockfish : +0,45 au lieu de +1,1. })
13... g6 { Le pion prépare ...f5 en le soutenant à l'avance, et ouvre la case g7 au cavalier. Le meilleur coup. }
14. Bh6 { Le fou attaque la tour f8 et oblige le cavalier à venir en g7. Une fois en g7, le cavalier ne pourra plus bouger sans laisser la tour f8 en prise. Il est attaché à sa case. Un des meilleurs coups. [%cal Gh6f8] }
14... Ng7 { Le seul bon coup : le cavalier protège la tour. Tous les autres perdaient la qualité (Stockfish : +2,2 ou plus). }
15. g4 { LE COUP-CLÉ. Le pion g4 contrôle la case f5. La rupture ...f5 est maintenant physiquement empêchée : sur ...f5, les Blancs prennent gxf5. Un des meilleurs coups (+1,15). [%csl Rf5] [%cal Gg4f5] }
15... Nce8 { Le cavalier se dirige vers f6, pour attaquer g4. 15...b5 était un peu plus actif. }
16. Kh2 { LE ROI S'ÉCARTE AVANT L'ORAGE. Le roi quitte g1 et libère cette case pour une tour (Rg1). Derrière les pions g et h, il sera à l'abri si la colonne g s'ouvre un jour. Le meilleur coup selon Stockfish (+1,35). [%cal Gg1h2] }
16... Kh8 { Showalter fait pareil : son roi quitte la colonne g, pour libérer g8 à une tour. Presque aussi bon que 16...a6.

PRO TIP : un coup de roi « tranquille » comme Kh2 est souvent le coup le plus prophylactique de la partie. Il ne fait rien de visible, mais il désamorce à l'avance toutes les contre-attaques sur une colonne qui va s'ouvrir. }`,
    ),
    chapter(
      "Tarrasch – Showalter (3) : les tours derrière le pion g",
      "r1bqnr1k/pp2bpnp/3p2pB/3Pp3/4P1P1/2NB1N1P/PPQ2P1K/R4R2 w - - 3 17",
      `{ La rupture ...f5 est bloquée par le pion g4. Mais un blocage ne tient que s'il est soutenu. Si les Noirs arrivent à jouer ...f5 quand même (après ...Nf6, ...Ng8, ...f6 et ...f5, par exemple), il faut que les Blancs soient prêts à ouvrir la colonne g à LEUR avantage.

C'est le sens des coups qui suivent : les tours blanches viennent se placer derrière le pion g4, AVANT que la colonne ne s'ouvre.

PRO TIP : la prophylaxie ne consiste pas seulement à interdire un coup. Elle consiste aussi à préparer la meilleure réponse au cas où l'adversaire le jouerait quand même. [%cal Gg1g4] }
17. Rg1 { La tour vient derrière le pion g4, sur la case que le roi vient de libérer. Si la colonne g s'ouvre, elle sera la première à en profiter. Le meilleur coup. [%cal Gg1g7] }
17... Bd7 { Le fou se développe. Un des trois meilleurs coups. }
18. Rg2 { La tour monte d'une case pour laisser g1 à l'autre tour : les Blancs préparent le doublement. Le meilleur coup. }
18... Rc8 { La tour prend la colonne c, la seule ouverte, et vise le cavalier c3. Presque aussi bon que 18...Nf6. [%cal Gc8c3] }
19. Rag1 { Les tours sont doublées sur la colonne g. Stockfish préférait de peu 19.a4, mais l'idée est la même. [%cal Gg1g7] }
19... b6 { Un coup d'attente. 19...Nf6 était un peu plus actif. }
20. Qd2 { La dame passe sur la diagonale c1-h6 pour soutenir le fou h6. Le meilleur coup. [%cal Gd2h6] }
20... Nf6 { Le cavalier attaque g4, d5 et e4. Le meilleur coup. [%cal Gf6g4,Gf6e4] }
21. Ne1 { Le cavalier quitte f3 pour se réorganiser. 21.Qe2 était un peu plus précis. }
21... Ng8 { Le cavalier attaque le fou h6. Les Noirs veulent enfin chasser ce fou gênant. 21...b5 était un peu meilleur. [%cal Gg8h6] }
22. Be3 { Le fou recule. Le meilleur coup : 22.Bxg7+ aurait échangé le meilleur défenseur noir sans rien gagner. }
22... Bf6 { Le meilleur coup selon Stockfish. Le fou se place sur la diagonale d8-h4 et attend. Les Blancs restent mieux (+1,7). }
(22... g5?! { Le coup de la partie. Showalter bloque l'aile roi avec ses pions, mais il affaiblit la case f5 et rend ...f5 encore plus difficile (Stockfish : +2,5 au lieu de +1,7). [%csl Rf5] } 23. Nf3 { Le cavalier revient et attaque g5 et e5. 23.f3 était un peu plus précis. [%cal Gf3g5,Gf3e5] } 23... f6 { Le pion défend g5 et e5. Le meilleur coup. Mais avec les pions e5 et g5 à côté de lui, le pion f6 est bloqué : la rupture ...f5 est enterrée. } 24. h4 { Le pion attaque g5 pour ouvrir la colonne h. 24.Kh1 était un peu plus précis. [%cal Gh4g5] } 24... h6 { Le pion défend g5. 24...Qe8 était plus précis. } 25. Rh1 { La tour passe sur la colonne h, qui va s'ouvrir. } 25... Kh7 { Le roi noir vient défendre h6. } 26. Kg1 { LE ROI S'ÉCARTE ENCORE. Cette fois, c'est la colonne h qui va s'ouvrir : le roi quitte h2 pour revenir en g1. Le meilleur coup. [%cal Gh2g1] } 26... Kg6 { Le roi noir monte en g6 pour défendre g5 et h5. } 27. Nh2 { Le cavalier entame son long voyage : h2, f1, g3, puis f5. La case f5, que le pion g4 contrôle, sera sa destination. [%cal Gh2f1,Gf1g3,Gg3f5] } 27... Rc7 { La tour libère c8 pour la dame. } 28. Nf1 { Le cavalier continue. Le meilleur coup. } 28... Qc8 { La dame arrive sur la colonne c. 28...Rb7 était un peu plus précis. } 29. Qe2 { La dame se met sur la diagonale d1-h5. Le meilleur coup. } 29... Kf7 { Le roi revient vers le centre. 29...b5 était un peu plus actif. } 30. Ba6 { Le fou chasse la dame noire de la colonne c. Le meilleur coup. [%cal Ga6c8] } 30... Qb8 { La dame recule. Le meilleur coup. } 31. Nb5 { Le cavalier attaque a7, c7 et d6. 31.a4 était un peu plus précis. [%cal Gb5c7,Gb5d6,Gb5a7] } 31... Bxb5 { Le fou noir échange ce cavalier. Le meilleur coup. } 32. Bxb5 { Le fou reprend. Les Blancs ont un gros avantage (+2,5) : leur cavalier f1 va rejoindre f5, et les Noirs n'ont plus aucune rupture. Suite au chapitre suivant. })
23. Ne2 { Le cavalier c3 se dirige vers g3, et de là vers f5 : la case que g4 contrôle déjà. Une des suites du moteur. [%cal Gc3e2,Ge2g3] }
23... Ne8 { Le cavalier va vers c7 ou g7. }
24. f4 { Et maintenant, ce sont les Blancs qui ouvrent la colonne f. Leurs pièces sont prêtes, leur roi est à l'abri en h2 : la rupture profite au camp qui l'a préparée.

PRO TIP : quand tu as empêché la rupture adverse, cherche la tienne. Une position bloquée se gagne en ouvrant une ligne au bon moment, et du bon côté. }`,
    ),
    chapter(
      "Tarrasch – Showalter (4) : le cavalier arrive en f5",
      "1qr3n1/p1r1bkn1/1p1p1p2/1B1Pp1p1/4P1P1/4B3/PP2QPR1/5NKR w - - 0 34",
      `{ La partie a continué 32...Rfc8 33.hxg5 hxg5. Ces deux coups n'étaient pas les plus précis (Stockfish préférait 33.Ng3, puis 33...fxg5), mais la position blanche est maintenant gagnante (+4,4).

Regarde ce qu'il reste aux Noirs : aucune rupture de pion, des pièces entassées, un roi en f7. Les Blancs ont la colonne h, une case f5 pour leur cavalier, et ils peuvent jouer sur les deux ailes.

Dans une position déjà gagnée, on ne restructure plus l'arbre : les écarts avec le moteur sont seulement signalés.

PRO TIP : la prophylaxie gagne rarement en un coup. Elle retire à l'adversaire ses plans actifs. Ensuite, il ne lui reste plus qu'à attendre, pendant que toi tu prépares ton attaque. [%csl Gf5] }
34. Bc6 { Le fou s'installe en c6, au cœur du camp noir. Stockfish préférait 34.Qf3 (+4,4 contre +3,6), mais l'avantage reste décisif. }
34... Bf8 { Le fou recule pour défendre d6 et g7. }
35. Qf3 { La dame attaque le pion f6 et se rapproche de l'aile roi. Le meilleur coup. [%cal Gf3f6] }
35... Rxc6 { Les Noirs rendent la qualité pour éliminer le fou c6. Le meilleur coup. }
36. dxc6 { Le pion reprend. Les Blancs ont gagné la qualité (une tour contre un fou), même si les Noirs ont des pions en plus. }
36... Ne6 { Le cavalier va vers f4. 36...Rxc6 était plus tenace, mais la position est perdue. }
37. Rh7+ { La tour entre en 7e rangée avec échec. 37.Rgh2 était un peu plus précis. }
37... Bg7 { Le fou s'interpose. Le meilleur coup. }
38. Ng3 { LE CAVALIER EN ROUTE. Après h2, f1 et g3, il ne lui reste qu'un saut pour atteindre f5. Le meilleur coup. [%cal Gg3f5] }
38... Rxc6 { La tour prend le pion c6. }
39. Nf5 { LA CASE F5. Le cavalier s'installe sur la case que Tarrasch contrôle depuis le 15e coup (g4). Aucun pion noir ne pourra jamais l'en chasser. Il attaque d6 et g7. [%csl Gf5] [%cal Gf5d6,Gf5g7] }
39... Qc8 { La dame se met sur la diagonale c8-h3. }
40. Rgh2 { Les deux tours sont doublées sur la colonne h. 40.Bxg5 était aussi très fort. }
40... Ne7 { Le cavalier attaque f5. 40...Qc7 tenait plus longtemps. }
41. Nxg7 { Le cavalier prend le fou g7, le dernier défenseur des cases noires. Le meilleur coup. }
41... Nxg7 { Le cavalier reprend. }
42. Bxg5 { Le fou prend g5 et attaque f6. Les Blancs ont une qualité contre un pion, et une attaque gagnante. Le meilleur coup. [%cal Gg5f6] }
42... Qe6 { Showalter a abandonné après ce coup.

PRO TIP : toute la partie tient dans le contrôle d'une seule case, f5. Tarrasch a d'abord interdit ...f5 aux Noirs (6.Bd3, 8.h3, 15.g4), puis il a installé son cavalier sur cette même case. }`,
    ),
    chapter(
      "Petrosian – Kozali (1) : f3, la case e4 interdite",
      "r1bqr1k1/pp1nbppp/2p2n2/3p2B1/3P4/2NBP3/PPQ1NPPP/R3K2R w KQ - 0 10",
      `{ 1954. Petrosian a les Blancs dans un Gambit Dame, variante d'échange. La structure est typique : pions blancs en d4 et e3, pions noirs en c6 et d5.

Dans cette structure, la meilleure case des Noirs est e4 : un cavalier y est soutenu par le pion d5, et il gêne tout le jeu blanc. Le grand plan des Blancs, lui, est de jouer f3 puis e4, pour prendre le centre.

Petrosian voit que les deux plans se jouent sur la MÊME case : e4. En la contrôlant avec son pion f, il retire sa meilleure case à l'adversaire, et il prépare sa propre poussée.

PRO TIP : le meilleur coup prophylactique est souvent celui qui empêche le plan adverse ET prépare le tien. [%csl Ge4] }
10. h3 { Le pion retire la case g4 au cavalier f6 et au fou c8 : plus de ...Ng4 contre le fou g5 ou le pion e3. Un des trois meilleurs coups, à égalité avec 10.O-O et 10.Rd1. [%csl Rg4] }
10... Ne4 { Le cavalier saute sur sa case idéale. Il attaque le fou g5, le cavalier c3 et le pion f2. 10...Nf8 était un peu plus précis. [%cal Ge4g5,Ge4c3] }
11. Bf4 { Le fou évite l'échange et reste actif. Stockfish préférait 11.Bxe4 ou 11.Bxe7 (+0,45 contre +0,15), mais Petrosian veut chasser ce cavalier avec un pion, pas avec une pièce. }
11... Ndf6 { L'autre cavalier vient soutenir e4. Le meilleur coup. [%cal Gf6e4] }
12. f3 { LE COUP PROPHYLACTIQUE. Le pion chasse le cavalier de e4, et il contrôlera cette case pour toujours : aucun cavalier noir ne pourra plus s'y installer. Il prépare aussi e3-e4. Stockfish préférait de peu 12.g4 (+0,2 contre -0,2), mais l'idée de Petrosian est la plus claire. [%csl Re4] [%cal Gf3e4] }
12... Nxc3 { Le cavalier s'échange contre le cavalier c3 avant d'être chassé. Le meilleur coup. }
13. bxc3 { Le pion reprend vers le centre : il renforce d4 et laisse e4 libre pour le pion e3. Presque aussi bon que 13.Qxc3. }
13... c5 { Le meilleur coup selon Stockfish. Les Noirs attaquent tout de suite la chaîne c3-d4, avant que les Blancs ne jouent e4. La position est équilibrée (-0,3). [%cal Gc5d4] }
(13... Bd6? { Le coup de la partie. Les Noirs échangent les fous, mais ils perdent un temps précieux : les Blancs vont jouer e4 sans être gênés (Stockfish : +1,6 au lieu de -0,3). } 14. Bxd6 { Le fou prend. Le meilleur coup. } 14... Qxd6 { La dame reprend. Le seul bon coup. } 15. e4! { LE BUT DE f3. Le pion e arrive en e4, soutenu par f3. Les Blancs prennent le centre. Le meilleur coup. [%cal Ge4d5] } 15... Nh5 { Le cavalier va au bord de l'échiquier. 15...dxe4 était plus solide. } 16. e5 { Le pion chasse la dame et prend la case f6 au cavalier : le cavalier h5 ne peut plus revenir au centre. Le meilleur coup. [%csl Rf6] [%cal Ge5d6] } 16... Qh6 { La dame s'écarte de l'attaque du pion. } 17. Qd2! { La dame propose l'échange. Sans les dames, le cavalier h5 hors jeu sera le plus gros problème des Noirs. Le meilleur coup. } 17... Qxd2+ { Les Noirs échangent. } 18. Kxd2 { Le roi reprend et se centralise. Les Blancs ont un gros avantage (+2,4). Suite au chapitre suivant. })
14. Qd2 { La dame protège c3 et le fou f4. Un coup naturel ; Stockfish préférait de peu 14.Rb1 (-0,4 contre -0,6). }
14... Nh5 { Le cavalier attaque le fou f4. Les Noirs ont un jeu actif.

PRO TIP : quand l'adversaire a joué un coup prophylactique, ne le laisse pas réaliser son plan tranquillement. Ici, ...c5 attaque le centre blanc avant qu'il ne bouge. }`,
    ),
    chapter(
      "Petrosian – Kozali (2) : le cavalier sans cases",
      "r1b1r1k1/pp3ppp/2p5/3pP2n/3P4/2PB1P1P/P2KN1P1/R6R b - - 0 18",
      `{ Les dames sont échangées. Regarde le cavalier noir en h5 : il ne peut pas aller en f6 (pion e5), ni en f4 ou en g3 (le cavalier e2 les contrôle).

Petrosian va maintenant lui retirer ses dernières cases, puis avancer ses pions à l'aile roi. C'est la RESTRICTION : une pièce sans cases ne participe plus à la partie.

PRO TIP : compte les cases de la pire pièce adverse. Si tu peux lui en retirer encore une, fais-le : tu joues alors à une pièce de plus. [%csl Rf6,Rf4,Rg3] }
18... g6 { Le pion libère la case g7 pour le cavalier. Le meilleur coup. }
19. g4 { Le pion chasse le cavalier. Depuis g4, il contrôle aussi f5 et h5 : le cavalier ne pourra plus y revenir. Le meilleur coup. [%csl Rf5,Rh5] [%cal Gg4h5] }
19... Ng7 { Le seul bon coup : le cavalier recule en g7. Depuis g7, il ne lui reste qu'une case libre, e6. }
20. h4 { Le pion prépare h5, pour ouvrir une colonne à l'aile roi. Le meilleur coup. }
20... h6 { Les Noirs attendent. 20...Kh8 était un peu plus précis. }
21. Raf1 { La tour soutient la poussée f4-f5. Un des meilleurs coups. [%cal Gf1f5] }
21... Bd7 { Le fou se développe. 21...a5 était un peu plus actif. }
22. Rhg1 { La seconde tour vient sur la colonne g. Le meilleur coup. }
22... b5 { Les Noirs cherchent du jeu à l'aile dame, trop tard. }
23. f4 { Le pion avance pour préparer f5. Le meilleur coup (+3,1). [%cal Gf4f5] }
23... a5 { Les Noirs poussent leurs pions de l'aile dame. }
24. f5 { LA RUPTURE. Le pion attaque g6 et ouvre l'aile roi, là où le cavalier noir est enfermé. Le meilleur coup. [%cal Gf5g6] }
24... gxf5 { Une faute dans une position déjà très difficile (Stockfish : +5,5). 24...b4 tenait plus longtemps. }
25. gxf5 { Le pion reprend. La colonne g s'ouvre devant les tours blanches. Le meilleur coup. [%cal Gg1g7] }
25... Kh8 { Le roi s'écarte de la colonne g. }
26. e6! { Le pion attaque le fou d7 et le pion f7. Le meilleur coup. [%cal Ge6d7,Ge6f7] }
26... fxe6 { Les Noirs prennent. }
27. f6 { Le pion attaque le cavalier g7. Le cavalier qui n'avait plus de cases doit maintenant fuir. Le meilleur coup. [%cal Gf6g7] }
27... Nf5 { Le cavalier s'échappe en f5, où le fou va le prendre. }
28. Bxf5 { Le fou élimine le cavalier. }
28... exf5 { Le pion reprend. }
29. Rg7 { La tour entre en 7e rangée et attaque le fou d7. Le pion f6 la soutient, et il menace d'avancer. 29.Rg6 était encore plus fort, mais la position est gagnante de toute façon. Kozali a abandonné.

PRO TIP : Petrosian a gagné cette partie en restreignant une seule pièce. Le cavalier h5, privé de toutes ses cases, n'a jamais joué. [%cal Gg7d7] }`,
    ),
    chapter(
      "Petrosian – Kortchnoï : désamorcer l'attaque hollandaise",
      "rnbq1rk1/pp4pp/2pbpn2/3p1p2/2PP4/1P3NP1/P3PPBP/RNBQ1RK1 w - - 1 8",
      `{ Partie jouée en 1946. Petrosian a 17 ans, Kortchnoï 15. Les Noirs ont choisi la Défense hollandaise « Stonewall » : pions en c6, d5, e6 et f5.

Le plan des Noirs est connu : attaquer le roi blanc avec ...Qe8-h5, ...Ne4 et la poussée ...g5-g4, qui chasserait le cavalier f3. Leur meilleure pièce pour cette attaque est le fou d6, qui vise h2.

Petrosian va désamorcer cette attaque coup après coup, AVANT qu'elle ne devienne dangereuse.

PRO TIP : face à une attaque prévisible, fais la liste des pièces adverses qui y participent. Échange la plus dangereuse, et retire les cibles des autres. [%cal Gd6h2,Gd8h5] }
8. Ba3 { PREMIER COUP PROPHYLACTIQUE. Le fou propose l'échange du fou d6, la meilleure pièce noire pour l'attaque. Sans lui, les cases noires du camp noir (e5 surtout) deviendront faibles. Le meilleur coup selon Stockfish (+0,55). [%cal Ga3d6] }
8... Bxa3 { Les Noirs acceptent l'échange. 8...b6 était un peu plus précis. }
9. Nxa3 { Le cavalier reprend. Il va se diriger vers c2, puis e1 et d3. Le seul coup. }
9... Qe8 { La dame prépare ...Qh5, le plan d'attaque typique de la hollandaise. 9...b6 était un peu plus précis. [%cal Ge8h5] }
10. Nc2 { Le cavalier se rapproche du centre et de l'aile roi. Un des meilleurs coups. }
10... Nbd7 { Le meilleur coup selon Stockfish : les Noirs finissent leur développement avant d'attaquer. Les Blancs gardent un petit avantage (+0,7). }
(10... Qh5?! { Le coup de la partie. Kortchnoï lance l'attaque trop tôt : la dame vise le cavalier f3 et le pion h2. Stockfish : +1,35 au lieu de +0,7. [%cal Gh5f3,Gh5h2] } 11. Qc1! { DEUXIÈME COUP PROPHYLACTIQUE. La dame se place sur la diagonale c1-h6 : elle surveille f4 et g5, les cases par lesquelles passera l'attaque ...g5-g4. Elle pourra aussi aller en a3, sur les cases noires que le fou d6 a laissées. Un des meilleurs coups (+1,35). [%cal Gc1g5] } 11... Ne4 { Le cavalier s'installe en e4, d'où il attaque f2 et g3. [%cal Ge4f2,Ge4g3] } 12. Nce1! { TROISIÈME COUP PROPHYLACTIQUE. Le cavalier recule en e1. De là, il protège g2 et f3, et il ira en d3, d'où il contrôlera e5 et f4. Un des meilleurs coups. [%cal Ge1d3] } 12... g5 { Les Noirs poussent leur pion g : ...g4 doit chasser le cavalier f3. } 13. Nd3 { Le cavalier arrive en d3. Il contrôle e5 et f4. Un des meilleurs coups. [%cal Gd3e5,Gd3f4] } 13... Nd7 { Le cavalier se développe et surveille e5. } 14. Nfe5 { LE CAVALIER QUITTE LA CIBLE. Le cavalier f3 était la cible de ...g4. Il saute en e5, où aucun pion noir ne peut l'attaquer : la poussée ...g4 n'a plus de but. Le meilleur coup. [%csl Ge5] } 14... Kh8 { Le roi quitte la colonne g. } 15. f3 { QUATRIÈME COUP PROPHYLACTIQUE. Le pion chasse le cavalier e4 et ferme la diagonale h5-e2 : le pion e2, attaqué par la dame noire, est protégé. Les Blancs préparent e4. [%cal Gf3e4] } 15... Nd6 { Le cavalier recule et attaque c4. } 16. e4 { Les Blancs ouvrent le centre, pendant que les pièces noires sont à l'aile roi. Un des trois meilleurs coups. [%cal Ge4d5,Ge4f5] } 16... Nf7?! { Le cavalier attaque e5, mais les Noirs perdent encore du temps (Stockfish : +2,6 au lieu de +1,7). } (16... Qh6 { Le meilleur coup : la dame protège e6 et garde un œil sur l'aile roi. }) 17. cxd5 { Les Blancs ouvrent la colonne c. 17.Nxf7+ était un peu plus fort. } 17... Ndxe5 { Le cavalier d7 prend le cavalier e5. } 18. dxe5 { Le pion reprend et s'installe en e5. Le pion e5 prive les Noirs des cases d6 et f6. [%csl Ge5] } 18... cxd5 { Le pion c reprend. } 19. exd5 { Le pion e reprend. } 19... exd5 { Le pion e reprend : les Noirs ont un pion d5 isolé. } 20. f4! { Le pion attaque g5. Les pions noirs avancés à l'aile roi sont devenus des cibles : l'attaquant est maintenant l'attaqué. [%cal Gf4g5] } 20... Rd8 { La tour défend d5. 20...Be6 était plus tenace. } 21. Qc7 { La dame entre en 7e rangée. Elle attaque b7, la tour d8 et le cavalier f7. [%cal Gc7b7,Gc7d8,Gc7f7] } 21... b6 { Une faute dans une position déjà très difficile (Stockfish : +4,7). } 22. fxg5 { Le pion prend g5 et ouvre la colonne f. } 22... Ba6 { Le fou attaque le cavalier d3. } 23. Nf4 { Le cavalier attaque la dame h5 et le pion d5. Kortchnoï a abandonné : les Blancs gagnent du matériel.

PRO TIP : Petrosian n'a jamais attaqué. Il a retiré à son adversaire chaque cible, et chaque pièce utile, jusqu'à ce que l'attaque noire se retourne contre elle-même. })
11. Ne5 { Le cavalier s'installe en e5, au centre. Une des suites du moteur. }
11... Qe7 { La dame se développe. }
12. Qc1 { Même dans cette ligne, la dame vient sur la diagonale c1-h6 pour surveiller les cases noires. Les Blancs gardent un petit avantage (+0,7).

PRO TIP : un coup prophylactique est bon dans plusieurs variantes, pas dans une seule. Qc1 aurait été utile ici comme dans la partie. }`,
    ),
    chapter(
      "Reshevsky – Petrosian : le sacrifice de qualité prophylactique",
      "r3r1k1/p2q1ppp/2n3b1/1p6/2pPPQ2/P1P5/1BB3PP/4RRK1 w - - 0 21",
      `{ Zurich 1953, tournoi des candidats. Les Blancs ont un centre mobile (d4 et e4), la colonne f et des pièces prêtes à attaquer le roi noir. Les Noirs ont un pion passé potentiel à l'aile dame (c4, b5) et un bon fou en g6.

Le plan blanc est clair : pousser e4-e5 puis d4-d5, et lancer les pièces contre le roi. Le plan noir est plus lent : avancer les pions de l'aile dame.

Petrosian va trouver une idée célèbre : donner une tour contre un fou, non pas pour attaquer, mais pour TUER l'attaque adverse avant qu'elle ne commence.

PRO TIP : la qualité (une tour contre une pièce mineure) n'est pas sacrée. Si elle achète une case de blocage et désarme l'attaque adverse, elle peut valoir l'échange. [%cal Ge4e5,Gd4d5] }
21. Bd1 { Le fou se redéploie vers g4, où il attaquera la dame d7. Le meilleur coup. [%cal Gd1g4] }
21... Re7 { La tour défend la 7e rangée et attaque e4. Le meilleur coup. }
22. Bg4 { Le fou attaque la dame. Un des trois meilleurs coups. [%cal Gg4d7] }
22... Qe8 { La dame recule et garde la case e6. Le meilleur coup. }
23. e5 { Le pion avance et prend des cases au camp noir (d6, f6). Il prépare d5. Le meilleur coup (+1,4). [%csl Gd6,Gf6] }
23... a5 { Les Noirs avancent leurs pions de l'aile dame. 23...Rd8 était un peu plus précis. }
24. Re3 { La tour se prépare à aller en g3 ou h3, contre le roi noir. [%cal Ge3g3] }
24... Rd8 { La tour attaque d4. Le meilleur coup. [%cal Gd8d4] }
25. Bf3 { LA CONTRE-PROPHYLAXIE. Le meilleur coup selon Stockfish (+1,4). Le fou se place sur la grande diagonale et contrôle la case d5. Les Blancs empêchent à l'avance le cavalier noir de venir s'y installer : c'est la case de blocage dont Petrosian rêvait. [%csl Rd5] [%cal Gf3d5] }
(25. Rfe1?! { Le coup de la partie. La tour soutient e5, mais laisse la case d5 aux Noirs (Stockfish : +0,8 au lieu de +1,4). } 25... Re6! { LE SACRIFICE PROPHYLACTIQUE. La tour se place devant le pion e5 et s'offre au fou g4. Après Bxe6 fxe6, le pion e6 contrôlera d5 et f5, et le cavalier noir s'installera en d5, d'où personne ne pourra le chasser. Le meilleur coup, de loin : les autres coups donnent +1,75 ou plus. [%csl Gd5] [%cal Ge6d5] } 26. a4?! { Les Blancs attaquent b5. Stockfish préférait 26.Rf1 (+1,0 contre +0,4). } (26. Rf1 { Le meilleur coup : la tour revient sur la colonne f, et les Blancs ne prennent pas encore la tour. }) 26... Ne7 { Le cavalier prend le chemin de d5. Le meilleur coup. [%cal Ge7d5] } 27. Bxe6 { Reshevsky accepte la qualité. } 27... fxe6 { Le seul coup. Le pion e6 contrôle maintenant d5 et f5. [%csl Gd5,Gf5] } 28. Qf1 { La dame se replace. 28.Rf3 était un peu plus précis. } 28... Nd5 { LA CASE DE BLOCAGE. Le cavalier s'installe en d5. Il bloque le pion d4, attaque c3 et la tour e3, et aucun pion blanc ne peut le chasser. L'attaque blanche est morte (Stockfish : 0,0). [%csl Gd5] [%cal Gd5c3,Gd5e3] } 29. Rf3 { La tour cherche une colonne. } 29... Bd3! { Le fou attaque la dame et s'offre à la tour. Le meilleur coup. [%cal Gd3f1] } 30. Rxd3 { Le seul bon coup : tous les autres donnent -1,7 ou pire. } 30... cxd3 { Le pion reprend. } 31. Qxd3 { La dame reprend le pion. Chaque camp a rendu une qualité : les Blancs n'ont plus qu'un pion de plus, et le cavalier d5 compense largement. } 31... b4 { Les Noirs créent un pion passé à l'aile dame. } 32. cxb4 { Le pion c prend. } 32... axb4 { Le pion a reprend : le pion b4 est passé. } 33. a5 { Le pion a avance à son tour. } 33... Ra8 { La tour attaque a5. La position est égale. La partie s'est terminée par la nulle quelques coups plus tard.

PRO TIP : Petrosian a rendu une qualité pour transformer une position où il subissait l'attaque en une position solide et égale. Le meilleur coup défensif est parfois un sacrifice. })
25... f6 { Les Noirs attaquent la base e5. Une des suites du moteur. }
26. Qh4 { La dame se place face au roi noir. Les Blancs gardent l'avantage (+1,4).

PRO TIP : la prophylaxie marche dans les deux sens. Quand tu prépares ton attaque, regarde aussi quelle case de défense l'adversaire voudrait utiliser, et prends-la-lui d'abord. }`,
    ),
    chapter(
      "Bartholomew – Gareev : le hérisson, ou l'art d'attendre",
      "r1bq1rk1/4bppp/ppnppn2/8/2P1P3/N1N5/PP2BPPP/R1BQ1RK1 w - - 0 11",
      `{ États-Unis 2009, Sicilienne. Après 1.e4 c5 2.Nf3 e6 3.d4 cxd4 4.Nxd4 Nc6 5.Nb5 d6 6.c4 Nf6 7.N1c3 a6 8.Na3 Be7 9.Be2 O-O 10.O-O b6, les Noirs ont formé un HÉRISSON : des pions en a6, b6, d6 et e6, sur leurs trois premières rangées.

Le hérisson paraît passif, mais il cache des ruptures : ...b5 et ...d5 pour les Noirs, c5, e5 ou b5 pour les Blancs. Chaque camp doit sans cesse vérifier ce que donnerait la rupture adverse, et s'y préparer.

Dans cette partie, les Noirs préparent plusieurs plans sans en exécuter aucun. À chaque coup, ils neutralisent la rupture blanche suivante. C'est la prophylaxie en DÉFENSE.

PRO TIP : dans une position fermée et équilibrée, celui qui perd patience et casse la position au mauvais moment perd souvent la partie. [%cal Gb6b5,Gd6d5] }
11. Be3 { Le fou se développe. Il vise le pion b6 à travers c5. Le meilleur coup. [%cal Ge3b6] }
11... Rb8 { UN COUP PROPHYLACTIQUE NOIR. La tour protège le pion b6 à l'avance : le fou e3, puis un cavalier en a4, viendront l'attaquer. Stockfish préférait de peu 11...Bb7 (+0,25 contre +0,4). [%cal Gb8b6] }
12. Qd2 { La dame vise d6 sur la colonne d. Le meilleur coup. [%cal Gd2d6] }
12... Bb7 { Le fou se place sur la grande diagonale, face au pion e4. Un des meilleurs coups. }
13. Rfd1 { La tour renforce la pression sur d6. Le meilleur coup. [%cal Gd1d6] }
13... Ne5 { Le cavalier s'installe en e5 et attaque c4. Le meilleur coup. [%cal Ge5c4] }
14. f3 { Le pion protège e4 et retire la case g4 au cavalier e5. Le meilleur coup. [%csl Rg4] }
14... Re8 { La tour quitte f8 pour laisser cette case au fou. Un coup typique du hérisson. }
15. Kh1 { LE ROI À L'ABRI PRÉVENTIF. Avec les pions f3 et e4, et le fou en e3, la diagonale g1-a7 est dangereuse pour le roi blanc : si elle s'ouvre (par ...d5 ou ...b5), un échec ou un clouage pourrait y apparaître. Le roi s'en écarte à l'avance. Stockfish place 15.Bf2 un rien devant, mais l'écart est minime. [%cal Rb6g1] }
15... Bf8 { Le fou recule en f8 : de là, il défend d6 par la diagonale f8-d6. Les Noirs ne jouent pas ...d5, qui ouvrirait le jeu trop tôt. }
16. Bf1 { Le fou protège c4, attaqué par le cavalier e5. Un des meilleurs coups. [%cal Gf1c4] }
16... Qc7 { La dame attaque c4 une deuxième fois. 16...h5 était un peu plus actif. [%cal Gc7c4] }
17. Rac1 { La tour défend c4 par derrière. Le meilleur coup. }
17... Ba8 { Le fou recule en a8. Il garde la diagonale vers e4, et libère b7 pour la dame. Un des meilleurs coups. [%cal Ga8e4] }
18. Qf2 { La dame se place derrière le fou e3 : les deux pièces visent b6 sur la diagonale g1-a7. [%cal Gf2b6] }
18... Kh8 { Le roi noir s'écarte à son tour et libère la case g8 pour une tour. Les Noirs préparent ...Rg8 et ...g5. }
19. Na4 { Le cavalier attaque b6. }
19... Qc6! { La dame attaque le cavalier a4, et les pions c4 et e4. Les Blancs doivent reculer. [%cal Gc6a4,Gc6c4,Gc6e4] }
20. Nc3 { Le cavalier recule. Un des meilleurs coups. }
20... Be7 { Le fou revient en e7. Il prépare ...g5 : le plan noir change d'aile. }
21. Nab1 { Le cavalier a3, la pire pièce blanche, prend le chemin de d2 et b3. }
21... Rg8 { La tour se place derrière le pion g : les Noirs menacent ...g5-g4. [%cal Gg8g4] }
22. Bd4 { Le fou attaque le cavalier e5 et le pion b6. Un des trois meilleurs coups. [%cal Gd4e5,Gd4b6] }
22... Qc7 { La dame revient défendre la 7e rangée. Un des meilleurs coups. }
23. b4 { LA PROPHYLAXIE BLANCHE. Les Blancs prennent de l'espace et préparent c4-c5. Si les Noirs jouent ...g5, ils répondront par la rupture c5, à l'autre bout de l'échiquier. Un des meilleurs coups. [%cal Gc4c5] }
23... Rgc8 { Les Noirs voient que ...g5 serait contré par c5, et ils renoncent. La tour revient sur la colonne c. Un des meilleurs coups. }
(23... g5 { Moins précis (Stockfish : +0,9 au lieu de +0,55). } 24. Nd2 { Le meilleur coup. Le cavalier vient en d2, prêt à jouer Na4 et c5 : l'attaque noire arrive trop tard. })
24. Na4 { Le cavalier attaque b6 une nouvelle fois. }
24... Nfd7 { Le cavalier protège b6. Le meilleur coup. [%cal Gd7b6] }
25. Be3 { Le fou recule, tout en gardant b6 en vue. }
25... Qb7 { La dame quitte la colonne c et vise e4. Les Noirs préparent maintenant ...b5. [%cal Gb7e4] }
26. a3 { Le pion soutient b4. Un des meilleurs coups. }
26... Rc6 { La tour protège b6 de côté, et se prépare au doublement sur la colonne c. Un des meilleurs coups. }
27. Nb2 { Le cavalier protège c4 et peut aller en d3. }
27... Rbc8 { Les tours sont doublées sur la colonne c, contre c4. Un des meilleurs coups. }
28. Qd2 { La dame revient sur la colonne d, contre d6. }
28... Qc7 { La dame rejoint la colonne c. }
29. a4 { Le pion prépare la rupture b4-b5. }
29... Qb8 { La dame se replace. Les Noirs attendent : ils ont vérifié que chaque rupture blanche était contrée. Un des meilleurs coups. }
30. Nc3 { Le meilleur coup selon Stockfish (+0,55) : les Blancs améliorent leur cavalier et gardent la position fermée. }
(30. b5?! { Le coup de la partie. Les Blancs perdent patience et cassent la position au mauvais moment (Stockfish : 0,0 au lieu de +0,55). [%cal Gb4b5] } 30... R6c7! { La tour garde la colonne c. Les Noirs ne prennent pas en b5 : après ...axb5 axb5, leur pion b6 deviendrait une cible. Le meilleur coup. } 31. bxa6 { Le pion prend a6. 31.Qc2 était plus solide. } 31... Nc5 { Le cavalier saute en c5. Il attaque a4, a6 et e4. Le meilleur coup. [%cal Gc5a4,Gc5e4] } 32. Qc2 { La dame protège a4 et e4. } 32... Ra7 { La tour attaque le pion a6. Le meilleur coup. } 33. Nc3 { Le cavalier revient défendre. } 33... Rxa6 { Les Noirs ont regagné leur pion. Leurs cavaliers en c5 et e5 sont superbes, et ils ont pris un léger avantage (-0,4). Gareev a fini par gagner la partie.

PRO TIP : l'attente des Noirs n'était pas passive. Chaque coup tranquille préparait la réponse à une rupture blanche. Quand les Blancs ont enfin cassé, la réponse était prête. })
30... Rd8 { La tour revient sur la colonne d, pour protéger d6. Le meilleur coup. }
31. Ne2 { Le cavalier se dirige vers d4. La position reste fermée, avec un petit avantage blanc (+0,55).

PRO TIP : dans une position où chaque camp surveille les ruptures de l'autre, le coup le plus utile est souvent d'améliorer sa pire pièce, comme ce cavalier. }`,
    ),
  ],
};
