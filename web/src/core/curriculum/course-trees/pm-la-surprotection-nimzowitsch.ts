import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « La surprotection (Nimzowitsch) » (positional_mastery, module 22) —
 * format « un commentaire par coup ».
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, entièrement
 * réécrite ici) : scores PGN de chessgames.com, rejoués avec chess.js —
 * Nimzowitsch – von Freymann (Vilna 1912, gid 1295812), Nimzowitsch –
 * Håkansson (Kristianstad 1922, gid 1102392), Alliés – Nimzowitsch
 * (consultation, Kristiania 1921, gid 1102389), Andersson / Öberg / Enström –
 * Nimzowitsch (consultation, Örebro 1921, gid 1102390) — les quatre parties
 * illustratives de « Mon système » sur la surprotection —, et Reshevsky –
 * Petrosian (Candidats, Zurich 1953, gid 1106248), l'exemple que Tal cite dans
 * sa préface de « Mon système » pour montrer que Petrosian avait étudié le
 * livre.
 *
 * Plan : von Freymann — e5 surprotégé, le piège 14.hxg4? (1), la dame libérée
 * (2), le cavalier f4 qui bloque et protège (3) ; Håkansson — le pion
 * sacrifié pour surprotéger e5 (4), le surprotecteur Re1 (5), la colonne c
 * offerte au surprotecteur (6) ; les Alliés — d5 surprotégé, les pièces
 * lourdes libres (7), la dame centralisée (8) ; les Suédois — surprotéger
 * f6 (9), la bascule vers la colonne g (10) ; Petrosian — surprotéger la case
 * de blocus d5 pour paralyser un centre (11).
 *
 * Toutes les lignes ont été rejouées avec chess.js et chaque coup sondé avec
 * Stockfish 19 (binaire Linux local, profondeur 18, 3 candidats par coup),
 * suites du moteur comprises. Règle appliquée : quand un coup perd environ
 * 0,5 pion ou plus par rapport au choix du moteur, la LIGNE PRINCIPALE suit
 * le moteur et le coup de la partie passe en variante, signalée comme
 * fautive. Exception : dans une position déjà décisive (plus de 3 pions
 * environ), un écart est seulement signalé dans le commentaire. Les coups
 * proches du seuil ont été resondés trois fois avec un moteur neuf et
 * tranchés sur la moyenne : 14...Kf8 de von Freymann (0,78), 17.Qe3 (0,53)
 * et 17...Rh6 (0,54) de la même partie, 9...Qc7 (0,59) et 12...a6 (0,50) de
 * Håkansson, 15.Qb3 des Alliés (0,60), 16.h4 (0,62) et 23.Bg1 (0,69) des
 * Suédois, 26.a4 de Reshevsky (0,58) sont au-dessus du seuil ; 15...Qe7 de
 * von Freymann (0,29), 8...Ng6 de Håkansson (0,33), 15...Rf7 de Nimzowitsch
 * contre les Suédois (0,37) et 28.Qf1 de Reshevsky (0,48) restent dans la
 * ligne principale. Plusieurs chapitres commencent donc juste après une
 * faute signalée dans l'introduction. Les évaluations citées sont du point
 * de vue des Blancs. Aucun résultat de partie (1-0, 0-1…) dans les
 * variantes : le parseur s'y arrêterait.
 *
 * Note du moteur sur la partie von Freymann : dans le piège 14.hxg4? hxg4
 * 15.Qxg4, la suite donnée par Nimzowitsch (15...Rxh2 16.Kxh2 Bxe5+) ne
 * rapporte presque rien ; 15...Bxe5! gagne simplement le pion e5, environ
 * -2. C'est cette suite que suit la variante.
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const LA_SURPROTECTION_NIMZOWITSCH: CourseTree = {
  chapters: [
    chapter(
      "Nimzowitsch – von Freymann (Vilna 1912) : e5 surprotégé, le piège 14.hxg4?",
      START,
      `{ SURPROTÉGER un point, c'est le défendre par PLUS de pièces qu'il n'est attaqué.

Pourquoi en mettre plus que nécessaire ? Parce qu'un point défendu tout juste assez enchaîne ses défenseurs : si l'un d'eux bouge, le point tombe. Avec un défenseur de plus, chacun d'eux redevient libre de jouer ailleurs, le point tient quand même.

Nimzowitsch réserve l'idée aux points STRATÉGIQUES : un pion central avancé, une case de blocus, un avant-poste. Surprotéger un point sans importance ne sert à rien.

Aron Nimzowitsch – Sergueï von Freymann, Vilna 1912. Une Française d'avance. Le point stratégique est le pion e5 : il serre tout le camp noir. Compte à chaque coup ses attaquants et ses défenseurs.

PRO TIP : avant de déplacer une pièce qui défend ton point fort, compte. Si le point reste au moins aussi défendu qu'attaqué sans elle, elle est libre. Sinon, ajoute d'abord un défenseur. }
1. e4 { Le pion roi prend le centre. Le meilleur coup. }
1... e6 { La Défense française. Presque aussi bon que 1...c5 selon Stockfish. }
2. d4 { Deux pions au centre. Le meilleur coup. }
2... d5 { Les Noirs attaquent tout de suite le pion e4. Le meilleur coup. }
3. e5 { La variante d'avance : le pion e5 prend la case f6 au cavalier noir. Il deviendra le point stratégique de toute la partie. Presque aussi bon que 3.Nc3. [%csl Ge5] }
3... c5 { Les Noirs attaquent le pion d4, qui soutient e5. Un des meilleurs coups. [%cal Rc5d4] }
4. Nf3 { Le cavalier défend d4 et e5. 4.c3, qui garde la chaîne de pions, était un peu plus précis, environ 0,3 pion. [%cal Gf3d4,Gf3e5] }
4... cxd4 { Les Noirs échangent tout de suite le pion d4. Le meilleur coup. }
5. Nxd4 { Le cavalier reprend au centre. Il n'y a plus de pion d4 : e5 devra être tenu par des PIÈCES. Un des meilleurs coups. }
5... Nc6 { Le cavalier attaque d4 et vise e5. Un des meilleurs coups. [%cal Rc6e5] }
6. Nxc6 { Les Blancs échangent le cavalier qui menaçait e5. Le meilleur coup. }
6... bxc6 { La reprise forcée vers le centre. Le pion c6 soutiendra d5. Le meilleur coup. }
7. Bd3 { Le fou se développe et vise h7. Presque aussi bon que 7.Nd2. }
7... Qc7 { La dame attaque e5 par la diagonale c7-d6-e5. Presque aussi bon que 7...Ba6. [%cal Rc7e5] }
8. Bf4 { Le fou défend e5. Un attaquant, un défenseur : l'équilibre. 8.Qe2 était un peu plus précis, environ 0,3 pion. [%cal Gf4e5] }
8... g5 { Nimzowitsch juge ce coup « pas tout à fait correct, mais intéressant ». Le pion chasse le défenseur de e5. 8...Ne7 était plus solide, environ 0,4 pion. [%cal Rg5f4] }
9. Bg3 { Le fou recule mais garde la diagonale de e5. Le meilleur coup. [%cal Gg3e5] }
9... Bg7 { Deuxième attaquant de e5 : le fou g7 et la dame c7. 9...Ne7 était un peu plus précis, environ 0,3 pion. [%cal Rg7e5,Rc7e5] }
10. Qe2 { Deuxième défenseur : la dame tient e5 par la colonne e. Deux contre deux. Un des meilleurs coups, avec 10.Qh5. [%cal Ge2e5,Gg3e5] }
10... Ne7 { Le cavalier se développe vers f5 ou g6. Le meilleur coup. }
11. O-O { Le roi se met à l'abri. 11.h4 était un peu plus précis, environ 0,2 pion. }
11... h5 { Les Noirs lancent le pion h contre le roque blanc. Un des meilleurs coups, avec 11...Nf5. }
12. h3 { Le pion h3 empêche ...h4-h3 et retient le pion g. Le meilleur coup. }
12... Nf5 { Le cavalier attaque le fou g3, défenseur de e5. Le meilleur coup. [%cal Rf5g3] }
13. Bh2 { Le fou se replie en h2 et garde la diagonale h2-e5. 13.Bxf5 exf5 14.e6 serait mauvais : 14...f4 puis 15.exf7+ Kxf7. Le meilleur coup. [%cal Gh2e5] }
13... g4 { L'idée du coup 8 : le pion g attaque h3. Si le pion h3 disparaît, la tour h8 visera le fou h2. Le meilleur coup. [%cal Rg4h3] }
14. Re1 { LE COUP DU CHAPITRE. La tour se place derrière la dame, sur la colonne e : TROISIÈME défenseur de e5 contre deux attaquants. Le pion e5 est surprotégé. Conséquence : la dame e2 est libre de quitter la colonne e quand elle voudra. Le meilleur coup, environ +0,1. [%cal Ge1e5,Ge2e5,Gh2e5][%csl Ge5] }
(14. hxg4 { LE PIÈGE, environ 1,4 pion de moins que 14.Re1. Le coup a l'air naturel : on ouvre la colonne h et on prend un pion. }
14... hxg4 { Les Noirs reprennent et la tour h8 voit maintenant le fou h2. Le meilleur coup. [%cal Rh8h2] }
15. Qxg4 { La dame prend le pion, mais elle QUITTE la colonne e. Le pion e5 n'a plus qu'un défenseur, le fou h2, contre deux attaquants. 15.Bf4 limitait les dégâts, environ -1,5. [%csl Re5] }
15... Bxe5 { Le meilleur coup : le pion e5 tombe, deux attaquants contre un défenseur. Nimzowitsch donnait 15...Rxh2 16.Kxh2 Bxe5+, mais Stockfish préfère cette prise simple. [%cal Rg7e5] }
16. Bxe5 { Les Blancs échangent le fou. Le meilleur coup dans une position déjà mauvaise. }
16... Qxe5 { La dame reprend. Le centre blanc a disparu, environ -2,6.

Bilan : sans surprotection, la dame était enchaînée à e5. Dès qu'elle est partie, le pion est tombé. })
14... Qe7 { Le meilleur coup. La dame quitte la diagonale de e5 et vise g5 : les Noirs cherchent du jeu à l'aile roi. [%cal Ge7g5] }
(14... Kf8 { LE COUP DE LA PARTIE, environ 0,8 pion de moins que 14...Qe7. Le roi se range en f8, mais il perd du temps. }
15. hxg4 { Le meilleur coup, environ +0,9. Avec la tour e1, la prise est maintenant possible : la dame peut quitter la colonne e, e5 reste défendu par la tour et le fou. [%cal Ge1e5,Gh2e5] }
(15. Nc3 { LE COUP DE LA PARTIE, environ 0,7 pion de moins que 15.hxg4. Le cavalier vise e2 puis f4. Les deux erreurs s'annulent, environ +0,1. Suite au chapitre suivant. [%cal Gc3e2] })
15... hxg4 { Les Noirs reprennent. Le meilleur coup. }
16. Qxg4 { La dame prend le pion. Cette fois e5 tient : la tour e1 a pris le relais de la dame. Le meilleur coup. [%cal Ge1e5] }
16... c5 { Les Noirs gagnent de l'espace à l'aile dame. Un des meilleurs coups, mais les Blancs ont un pion de plus, environ +0,8. })
15. c4 { Le pion attaque d5 et ouvre du jeu à l'aile dame. Un des meilleurs coups. [%cal Gc4d5] }
15... Qg5 { La dame s'installe en g5 et vise g2. Le meilleur coup. [%cal Rg5g2] }
16. Nc3 { Le cavalier se développe enfin. Un des meilleurs coups. }
16... Ba6 { Le fou vise c4 et d3. Le meilleur coup. La position est équilibrée, environ 0,0.

Bilan : 14.Re1 ne gagne rien tout de suite. Il rend la position blanche SOLIDE : e5 tient même si la dame part. [%cal Ga6c4] }`,
    ),
    chapter(
      "von Freymann : la dame libérée par la surprotection",
      "r1b2k1r/p1q2pb1/2p1p3/3pPn1p/6p1/2NB3P/PPP1QPPB/R3R1K1 b - - 3 15",
      `{ Suite de la partie après 14...Kf8 15.Nc3. Stockfish préférait 14...Qe7 pour les Noirs, puis 15.hxg4 pour les Blancs : les deux écarts s'annulent, environ +0,1.

La tour e1 et le fou h2 tiennent e5. La dame e2 est donc LIBRE : elle n'a plus besoin de garder e5 et peut viser d'autres cibles.

Le plan blanc : échanger le cavalier f5, puis amener le cavalier c3 en f4 par e2.

PRO TIP : une pièce surprotectrice n'est pas une pièce passive. Cherche à quoi elle sert d'autre : la dame, déchargée de e5, va attaquer les pions noirs. }
15... Qe7 { La dame quitte la diagonale de e5. 15...gxh3 était un peu plus précis, environ 0,3 pion. [%cal Ge7g5] }
16. Bxf5 { Le fou échange le cavalier f5, qui pouvait venir en d4 ou en h4. Le meilleur coup. }
16... exf5 { La reprise forcée. Les pions noirs f7 et f5 sont doublés et f5 est fixé. Le meilleur coup. [%csl Rf5] }
17. Qd3 { Le meilleur coup, environ +0,5. La dame libérée attaque le pion f5 par la diagonale d3-e4-f5. e5 tient sans elle : tour e1 et fou h2. [%cal Gd3f5,Ge1e5,Gh2e5] }
(17. Qe3 { LE COUP DE LA PARTIE, environ 0,5 pion de moins que 17.Qd3. La dame vise a7 et c5, mais ne touche pas f5. [%cal Ge3a7] }
17... Bh6 { Le meilleur coup : le fou propose l'échange du fou h2. }
(17... Rh6 { LE COUP DE LA PARTIE, environ 0,5 pion de moins que 17...Bh6. La tour vient en h6 pour défendre la sixième rangée. }
18. Ne2 { Le meilleur coup : le cavalier prend la route de f4. [%cal Ge2f4] }
18... c5 { Le pion avance pour soutenir d4. Presque aussi bon que 18...Kg8. Suite au chapitre suivant. })
18. Bf4 { Le fou se met en f4 pour garder la diagonale. Un des meilleurs coups. }
18... Bxf4 { Les fous s'échangent. Le meilleur coup. }
19. Qxf4 { La dame reprend et bloque le pion f5. Équilibre, environ -0,1. [%csl Gf4] })
17... f4 { Le pion s'avance pour fuir l'attaque. Un des meilleurs coups, avec 17...gxh3. [%cal Rf5f4] }
18. Ne2 { Le cavalier attaque le pion f4. Le meilleur coup. [%cal Ge2f4] }
18... gxh3 { Les Noirs ouvrent la colonne g. Le meilleur coup. }
19. Nxf4 { Le cavalier prend le pion et s'installe en f4, environ +0,5.

Bilan : la surprotection de e5 a permis à la dame de partir attaquer f5. Les Blancs gagnent un pion sur l'aile roi sans jamais exposer e5. [%csl Gf4] }`,
    ),
    chapter(
      "von Freymann : le cavalier f4, bloqueur et surprotecteur",
      "r1b2k2/p3qpb1/7r/2ppPp1p/6p1/4Q2P/PPP1NPPB/R3R1K1 w - - 0 19",
      `{ Suite de la partie après 17.Qe3 Rh6 18.Ne2 c5. Les Blancs sont un peu mieux, environ +0,7.

Le pion noir f5 est fixé. Une case devient idéale pour un cavalier blanc : f4, juste devant lui.

Le cavalier f4 aura trois rôles, selon Nimzowitsch :
- il BLOQUE le pion f5 et toute la masse de pions noirs ;
- il protège e6, la case d'avance du pion e5 ;
- il peut partir quand il veut, car le fou h2 prend alors le relais.

PRO TIP : la meilleure case pour un cavalier est souvent juste devant un pion adverse bloqué. Le pion ne peut pas le chasser, et le cavalier ne gêne pas tes propres pions. }
19. c3 { Un des meilleurs coups, environ +0,7. Le pion contrôle d4 et retient le pion d. Le cavalier ira en f4 un peu plus tard. [%cal Gc3d4] }
(19. Nf4 { LE COUP DE LA PARTIE, environ 0,75 pion de moins que 19.c3. Le cavalier bloque tout de suite f5. Stockfish lui reproche de laisser ...d4 avec gain de temps, mais le plan est instructif. [%csl Gf4][%cal Gf4e6] }
19... d4 { Le pion avance et attaque la dame e3. Le meilleur coup. [%cal Rd4e3] }
20. Qd3 { La dame se replace et vise f5 et a6. Le meilleur coup. [%cal Gd3f5] }
20... Qd7 { La dame protège f5. 20...Be6 était un peu plus précis, environ 0,4 pion. [%cal Gd7f5] }
21. Qc4 { La dame vise le pion c5. Presque aussi bon que 21.Qa3. [%cal Gc4c5] }
21... Qc6 { La dame défend c5 et e8. Le meilleur coup. }
22. hxg4 { Nimzowitsch : « le prélude nécessaire ». Le pion g4 ne gêne plus le roque, et la colonne h se ferme vite. 22.Qd3 était un peu plus précis, environ 0,3 pion. }
22... Ba6 { Le fou attaque la dame. Presque aussi bon que 22...hxg4. [%cal Ra6c4] }
23. Qd5 { Un coup de Nimzowitsch. La dame s'offre en d5, protégée par rien d'autre que le cavalier f4. Si 23...hxg4, 24.e6 attaque la dame et le pion e file vers e8. Le meilleur coup. [%cal Gf4d5,Ge5e6] }
23... Qxd5 { Les Noirs échangent les dames. Le meilleur coup. }
24. Nxd5 { Le cavalier reprend en d5 : il a quitté f4 et le fou h2 tient de nouveau e5. Le meilleur coup. [%cal Gh2e5] }
24... Bc4 { Le fou attaque le cavalier d5. Presque aussi bon que 24...hxg4. [%cal Rc4d5] }
25. Nf6 { Le cavalier saute en f6 et bloque le fou g7. Presque aussi bon que 25.Nc7. [%csl Gf6] }
25... hxg4 { Le pion reprend en g4. Le meilleur coup. }
26. Bf4 { Le fou quitte h2 pour f4 : le cavalier f6 tient la position. Un des meilleurs coups. Équilibre, environ 0,0.

Bilan de la partie : Nimzowitsch a gagné la finale. Retiens surtout le cavalier f4 : il bloquait, il protégeait, et il a pu partir parce que le fou h2 prenait le relais. [%cal Gf4e5] })
19... h4 { Le pion h fixe le pion g2 et prend g3. Le meilleur coup. }
20. Rad1 { La tour vient sur la colonne d, contre le pion d5. Le meilleur coup. [%cal Gd1d5] }
20... Be6 { Le fou défend d5. Le meilleur coup. [%cal Ge6d5] }
21. Nf4 { Le cavalier arrive en f4, la case de blocus, au meilleur moment. Il attaque le fou e6 et bloque le pion f5. Le meilleur coup, environ +0,8.

Bilan : le moteur choisit le même plan que Nimzowitsch, cavalier en f4, mais il prépare d'abord c3 pour retenir le pion d. [%csl Gf4][%cal Gf4e6] }`,
    ),
    chapter(
      "Nimzowitsch – Håkansson (Kristianstad 1922) : un pion sacrifié pour surprotéger e5",
      "rnbqkbnr/pp3ppp/4p3/2ppP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 4",
      `{ Aron Nimzowitsch – Arthur Håkansson, Kristianstad 1922, match. Une Française d'avance après 1.e4 e6 2.d4 d5 3.e5 c5.

Nimzowitsch présente ici son idée : sacrifier un pion, non pour attaquer, mais pour gagner du temps et SURPROTÉGER e5. Le pion e5 serre le camp noir. Les Blancs lui donnent plus de défenseurs que nécessaire, et le pion d4 perdu ne compte presque plus.

Le moteur moderne est sévère : 4.Qg4 coûte environ 1,3 pion. La ligne principale suit donc le coup classique 4.c3. La variante montre l'idée de Nimzowitsch.

PRO TIP : un pion central avancé vaut parfois plus qu'un pion de plus. Ce qui compte, c'est qu'il tienne. S'il tient, il prive l'adversaire de cases pendant toute la partie. }
4. c3 { Le meilleur coup, environ +0,2. Le pion soutient d4, qui soutient e5 : la chaîne de pions reste entière. [%cal Gc3d4,Gd4e5] }
(4. Qg4 { L'IDÉE DE NIMZOWITSCH, environ 1,3 pion de moins que 4.c3. La dame protège e5 de côté et vise g7. Le pion d4 est abandonné. [%cal Gg4e4,Gg4g7] }
4... cxd4 { Les Noirs prennent le pion offert. Presque aussi bon que 4...Nc6. }
5. Nf3 { Le cavalier défend e5 et attaque d4. Presque aussi bon que 5.Bd3. [%cal Gf3e5] }
5... Nc6 { Le cavalier défend d4 et attaque e5. Le meilleur coup. [%cal Rc6e5] }
6. Bd3 { Le fou se développe et vise h7. Un des meilleurs coups. }
6... h5 { Le meilleur coup, environ -0,9. Le pion chasse la dame de la colonne g. Les Noirs gardent leur pion de plus. [%cal Rh5g4] }
(6... f5 { LE COUP DE LA PARTIE, environ 1 pion de moins que 6...h5. Le pion f5 chasse la dame, mais il ferme la diagonale du fou c8. Et il ne touche plus jamais e5 : la case e5 devient pour toujours blanche. [%csl Ge5] }
7. Qg3 { La dame recule et garde g7 en vue. Le meilleur coup. }
7... Nge7 { Le cavalier se développe vers g6. Un des meilleurs coups. }
8. O-O { Le roi se met à l'abri. 8.Nbd2 était un peu plus précis, environ 0,3 pion. }
8... Ng6 { Le cavalier attaque e5 une deuxième fois. 8...h6 était un peu plus précis, environ 0,3 pion. [%cal Rg6e5,Rc6e5] }
9. h4 { Le meilleur coup. Le pion menace h5 pour chasser le cavalier g6, un des attaquants de e5. Nimzowitsch : aucune idée d'attaque ici, seulement soulager e5. Suite au chapitre suivant. [%cal Gh4h5] })
7. Qf4 { La dame se replie et garde e5. Le meilleur coup. [%cal Gf4e5] }
7... f6 { Le meilleur coup. Le pion attaque e5 tout de suite : sans pion d4, le pion e5 est fragile, environ -1,1. [%cal Rf6e5] })
4... Nc6 { Le cavalier attaque d4 une première fois. Presque aussi bon que 4...Bd7. [%cal Rc6d4] }
5. Nf3 { Le cavalier défend d4 et e5. Un des meilleurs coups, avec 5.Be2, équilibre, environ +0,2.

Bilan : avec c3, les Blancs défendent e5 par des pions. Avec Qg4, Nimzowitsch veut le défendre par des pièces et gagner du temps. Le chapitre suivant montre jusqu'où va cette idée. [%cal Gf3d4,Gf3e5] }`,
    ),
    chapter(
      "Håkansson : la tour e1, le surprotecteur",
      "r1b1kb1r/ppq3pp/2n1p1n1/3pPp2/3p3P/3B1NQ1/PPP2PP1/RNB2RK1 w kq - 1 10",
      `{ Suite de la partie après 9.h4 Qc7. Stockfish préférait 9...Rg8, environ 0,6 pion de mieux pour les Noirs. Les Blancs sont environ +0,9, malgré leur pion de moins.

On compte autour de e5. Attaquants : cavaliers c6 et g6, dame c7. Défenseurs : cavalier f3 et dame g3.

Le plan blanc : ajouter un défenseur de plus, la tour e1, puis chasser le cavalier g6 par h5. Une fois e5 surprotégé, les pièces blanches pourront jouer à l'aile dame.

PRO TIP : la tour est le surprotecteur idéal. Elle se place derrière le pion, à distance, et reste libre de changer de colonne dès qu'une autre s'ouvre. }
10. Re1 { LE SURPROTECTEUR. La tour se place derrière e5 : trois défenseurs. Le meilleur coup. [%cal Ge1e5,Gf3e5,Gg3e5][%csl Ge5] }
10... Bd7 { Le fou se développe. Nimzowitsch : 10...Bc5 était nécessaire pour libérer f8 au cavalier g6. Stockfish met les deux coups presque à égalité. }
11. a3 { Le pion prépare b4 : les Blancs vont jouer à l'aile dame. Le meilleur coup. [%cal Ga3b4] }
11... O-O-O { Le roi noir part à l'aile dame. Le meilleur coup. }
12. b4 { Le pion b avance vers le roi noir. Le meilleur coup. [%cal Gb4b5] }
12... Kb8 { Un des meilleurs coups, environ +1. Le roi s'écarte de la colonne c et prépare ...Na5. }
(12... a6 { LE COUP DE LA PARTIE, environ 0,5 pion de moins que 12...Kb8. Le pion freine b5, mais il crée une cible pour a4-b5. }
13. h5 { Le pion chasse le cavalier g6, un attaquant de e5. Le meilleur coup. [%cal Gh5g6] }
13... Nge7 { Le cavalier recule en e7 : il n'attaque plus e5. Le meilleur coup. }
14. Bd2 { Le fou se développe et relie les tours. Le meilleur coup. Suite au chapitre suivant. })
13. b5 { Le pion chasse le cavalier c6, un autre attaquant de e5. Le meilleur coup. [%cal Gb5c6] }
13... Na5 { Le cavalier part au bord. Le meilleur coup. }
14. Nbd2 { Le dernier cavalier se développe, environ +1.

Bilan : e5 tient sans effort. Les Blancs n'ont plus qu'à avancer leurs pions à l'aile dame. [%csl Ge5] }`,
    ),
    chapter(
      "Håkansson : la colonne c offerte au surprotecteur",
      "2kr1b1r/1pqbn1p1/p1n1p2p/3pPp1P/1P1p4/P2B1NQ1/2PB1PP1/RN2R1K1 w - - 0 15",
      `{ Suite de la partie après 12...a6 13.h5 Nge7 14.Bd2 h6. Stockfish préférait 14...Qb6 pour les Noirs, environ 1,5 pion de mieux. Les Blancs sont environ +2,9.

La position devient décisive, les petits écarts avec le moteur sont seulement signalés.

Regarde la tour e1. Elle surprotège e5 depuis le coup 10. Quand le pion c s'avancera, la colonne c s'ouvrira, et la tour pourra y passer SANS laisser e5 en danger.

PRO TIP : place tes surprotecteurs sur des cases d'où ils peuvent basculer vite. Une tour sur la 1re rangée peut changer de colonne en un coup. }
15. a4 { Le pion a soutient b5. Le meilleur coup. [%cal Ga4b5] }
15... g5 { Les Noirs cherchent du jeu à l'aile roi, mais la position est déjà perdue. 15...Be8 tenait un peu mieux. }
16. b5 { Le pion attaque le cavalier c6. Le meilleur coup. [%cal Rb5c6] }
16... f4 { Le pion chasse la dame g3. Presque aussi bon que 16...Kb8. [%cal Rf4g3] }
17. Qg4 { Nimzowitsch : la dame est bien placée ici. Elle vise e6 et d7. Le meilleur coup. [%cal Gg4e6] }
17... Nb8 { Le cavalier recule tout au fond. 17...Na5 tenait mieux, environ 2,5 pions de plus pour les Noirs. }
18. c3 { Le pion attaque d4 : la colonne c va s'ouvrir. Le meilleur coup. [%cal Gc3d4] }
18... Re8 { Nimzowitsch : son seul coup pour éviter des pertes. Stockfish préférait 18...Nbc6, environ 0,6 pion. }
19. cxd4 { La colonne c est ouverte. Le meilleur coup, environ +7. [%cal Ge1c1] }
19... Kd8 { Le roi fuit la colonne c. Presque aussi bon que 19...Qb6. }
20. Rc1 { LA BASCULE. La tour e1 quitte son poste de surprotecteur pour la colonne c. e5 reste défendu par le pion d4, le cavalier f3 et le fou. Presque aussi bon que 20.Na3. [%cal Gc1c7,Gd4e5] }
20... Qb6 { La dame fuit la colonne c. Le meilleur coup. }
21. a5 { Le pion chasse la dame. Le meilleur coup. [%cal Ra5b6] }
21... Qa7 { La dame recule. Le meilleur coup. }
22. b6 { Le pion chasse encore la dame. Le meilleur coup. [%cal Rb6a7] }
22... Qa8 { Nimzowitsch : la dame se retrouve sur une case de problème d'échecs. Le meilleur coup. [%csl Ra8] }
23. Rc7 { La tour entre en 7e rangée et attaque d7. Le meilleur coup.

Bilan : les Noirs ont abandonné quatre coups plus tard. Le surprotecteur e1 a fini par gagner la partie sur une autre colonne. [%cal Gc7d7] }`,
    ),
    chapter(
      "Alliés – Nimzowitsch (Kristiania 1921) : d5 surprotégé, les pièces lourdes libres",
      "r2qk2r/ppp1nppp/8/3pP3/8/8/PPP1NPPP/R2Q1RK1 b kq - 0 12",
      `{ Des joueurs alliés – Aron Nimzowitsch, consultation, Kristiania 1921. Nimzowitsch a les Noirs. Une Française d'échange : 1.e4 e6 2.d4 d5 3.Nc3 Bb4 4.exd5 exd5, puis beaucoup d'échanges jusqu'à 12.dxe5. Équilibre, environ +0,2.

Le point stratégique noir est le pion d5. Il bloque le pion e5 blanc d'avancer vers le centre et donne du terrain aux Noirs.

Nimzowitsch va le surprotéger : cavalier e7, dame d7, puis tour d8. Une fois d5 tenu par plus de pièces que nécessaire, la dame et les tours pourront partir à l'attaque.

PRO TIP : surprotège un point AVANT d'en avoir besoin. Quand l'adversaire l'attaque, il est trop tard pour réorganiser tes pièces. }
12... Qd7 { La dame défend d5 une deuxième fois, avec le cavalier e7. Presque aussi bon que 12...O-O. [%cal Gd7d5,Ge7d5] }
13. f4 { Le pion soutient e5. Presque aussi bon que 13.Qd2. [%cal Gf4e5] }
13... O-O-O { Le grand roque place la tour sur la colonne d, derrière la dame : troisième défenseur de d5. 13...O-O était un peu plus précis, environ 0,3 pion. [%cal Gd8d5] }
14. c3 { Le pion contrôle d4 et retient le pion d. Presque aussi bon que 14.Qd3. [%cal Gc3d4] }
14... Kb8 { Le roi s'écarte de la colonne c. Presque aussi bon que 14...Nf5. }
15. b4 { Le meilleur coup, environ +0,3. Le pion b vise le roi noir. [%cal Gb4b5] }
(15. Qb3 { LE COUP DE LA PARTIE, environ 0,6 pion de moins que 15.b4. La dame vise d5 et b7, mais d5 est surprotégé : il tient sans difficulté. [%cal Rb3d5] }
15... c5 { Le meilleur coup. Le pion c protège d4 et prépare ...d4. [%cal Gc5d4] }
16. Rae1 { La tour vient défendre e5. Presque aussi bon que 16.Qa3. }
16... h5 { Le meilleur coup. Le pion h avance : la tour h8, libre car d5 est assez défendu, prépare une attaque à l'aile roi. Suite au chapitre suivant. [%cal Gh5h4] })
15... c5 { Le pion c attaque b4. Le meilleur coup. [%cal Rc5b4] }
16. bxc5 { Le pion b prend en c5 et ouvre la colonne b. Un des meilleurs coups. }
16... Rc8 { La tour vient reprendre c5. Le meilleur coup, environ +0,4.

Bilan : d5 surprotégé ne demande aucune attention aux Noirs. Ils jouent à l'aile dame avec les tours. [%cal Gc8c5] }`,
    ),
    chapter(
      "Alliés – Nimzowitsch : la dame noire centralisée",
      "1k1r3r/pp1qnpp1/8/2ppP2p/5P2/1QP5/PP2N1PP/4RRK1 w - - 0 17",
      `{ Suite de la partie après 15.Qb3 c5 16.Rae1 h5. Stockfish préférait 15.b4 pour les Blancs, environ 0,6 pion. Équilibre, environ -0,1.

Les pièces noires qui surprotègent d5 ne sont pas passives. Le cavalier e7 peut aller en f5, le pion h peut avancer, et le pion d lui-même peut avancer en d4 : alors la case d5 se libère pour la dame.

PRO TIP : quand ton point fort est surprotégé, tu peux même le faire avancer. Les défenseurs restent bien placés pour soutenir la nouvelle case. }
17. Qa3 { Le meilleur coup, environ -0,1. La dame vise c5 et a7. [%cal Ga3c5] }
(17. Kh1 { LE COUP DE LA PARTIE, environ 1,1 pion de moins que 17.Qa3. Le roi se range, mais les Blancs perdent du temps. }
17... Nf5 { Le cavalier vient en f5 et vise e3 et d4. Presque aussi bon que 17...h4. [%cal Gf5e3] }
18. Ng1 { Le cavalier recule pour venir en h3 ou f3. Un des meilleurs coups. }
18... h4 { Le pion h avance et prend la case g3. Le meilleur coup. [%cal Gh4h3] }
19. Nh3 { Le cavalier vise g5 et f2. Le meilleur coup. }
19... d4 { LE POINT FORT AVANCE. Le pion d5 passe en d4. Ses défenseurs restent utiles : la dame peut maintenant venir en d5. Presque aussi bon que 19...f6. [%cal Gd5d4] }
20. cxd4 { Le pion prend. Presque aussi bon que 20.Rf2. }
20... cxd4 { Le pion c reprend : les Noirs ont un pion passé en d4. Le meilleur coup. [%csl Gd4] }
21. Rf2 { Un des meilleurs coups, environ -1,1. La tour protège la 2e rangée. }
(21. Qd3 { LE COUP DE LA PARTIE, environ 1 pion de moins que 21.Rf2. La dame bloque le pion d4, mais elle laisse e3 au cavalier. [%csl Rd3] }
21... Ne3 { Le cavalier s'installe en e3, soutenu par le pion d4. Le meilleur coup. [%csl Ge3] }
22. Rf2 { La tour défend g2. Un des meilleurs coups. }
22... Qd5 { La dame se centralise en d5, sur la case que le pion a libérée. Le meilleur coup, environ -2,9.

Bilan : la dame d5 vise g2 et a2. Les Noirs ont gagné, après une fin de partie agitée. [%cal Rd5g2] })
21... f6 { Le pion attaque e5 et ouvre la colonne f. Le meilleur coup, environ -1. [%cal Rf6e5] })
17... Rc8 { La tour défend c5. Le meilleur coup. [%cal Gc8c5] }
18. b4 { Le pion attaque c5. Le meilleur coup. [%cal Rb4c5] }
18... Nf5 { Le cavalier se place en f5. Il vise d4 et e3. Un des meilleurs coups, environ -0,2.

Bilan : avec 17.Qa3 les Blancs restaient actifs. Le chapitre montre surtout comment les défenseurs de d5 ont soutenu l'avance ...d4. [%cal Gf5d4] }`,
    ),
    chapter(
      "Suédois – Nimzowitsch (Örebro 1921) : surprotéger f6",
      "r2q1rk1/ppp3pp/2n1bp2/3pPp2/3P1P2/2P1B1N1/P1P3PP/R2Q1RK1 b - - 0 12",
      `{ Trois amateurs suédois (Andersson, Öberg, Enström) – Aron Nimzowitsch, consultation, Örebro 1921. Nimzowitsch a les Noirs. Une Française : 1.e4 e6 2.d4 d5 3.Nc3 Bb4. L'ouverture a été très imprécise des deux côtés. Équilibre, environ 0,0.

Le point de tension est le pion f6. Le pion blanc e5 l'attaque. Les Noirs veulent garder ce pion, qui menace ...fxe5 et l'ouverture de la colonne f.

Nimzowitsch va le surprotéger avec ses tours sur la colonne f. Puis, dès que l'aile roi l'exigera, une tour passera sur la colonne g.

PRO TIP : quand tu doubles des tours derrière un pion, tu le surprotèges ET tu prépares l'ouverture de la colonne. Le même placement sert la défense et l'attaque. }
12... Na5 { Le cavalier vise c4. Un des meilleurs coups. [%cal Ga5c4] }
13. Qd3 { La dame protège c4 et f5. Un des meilleurs coups, avec 13.Rf2. }
13... Qd7 { La dame se relie aux tours. Le meilleur coup. }
14. Rf3 { La tour vient en f3 pour passer en g3 ou h3. Presque aussi bon que 14.Rae1. [%cal Gf3g3] }
14... g6 { Le pion g soutient f5 et ferme la colonne g. Presque aussi bon que 14...Nc4. [%cal Gg6f5] }
15. Ne2 { Le cavalier vise f4 et g1. Presque aussi bon que 15.Bf2. }
15... Rf7 { LA SURPROTECTION. La tour f7 défend f6, la tour a8 viendra en f8 juste derrière. 15...Rae8 était un peu plus précis, environ 0,4 pion. [%cal Gf7f6] }
16. Bf2 { Le meilleur coup, environ +0,4. Le fou se replie et protège d4 et h4. [%cal Gf2d4] }
(16. h4 { LE COUP DE LA PARTIE, environ 0,6 pion de moins que 16.Bf2. Le pion h veut attaquer, mais il affaiblit g4 et g3. [%csl Rg4] }
16... h5 { Le meilleur coup. Le pion bloque h4 et prend g4 au contrôle noir. [%csl Gg4] }
17. Kh2 { Le roi se range. Presque aussi bon que 17.Rg3. Suite au chapitre suivant. })
16... fxe5 { Le pion prend en e5 : la colonne f s'ouvre. Le meilleur coup. }
17. dxe5 { Le pion d reprend. Le meilleur coup. }
17... b6 { Le pion b soutient le cavalier a5 et prépare ...c5. Le meilleur coup, environ +0,4.

Bilan : les tours noires sur la colonne f tiennent f6, puis la colonne s'ouvre avec ...fxe5. [%cal Gf7f4] }`,
    ),
    chapter(
      "Suédois – Nimzowitsch : la bascule vers la colonne g",
      "r5k1/pppq1r2/4bpp1/n2pPp1p/3P1P1P/2PQBR2/P1P1N1PK/R7 b - - 1 17",
      `{ Suite de la partie après 16.h4 h5 17.Kh2. Stockfish préférait 16.Bf2 pour les Blancs, environ 0,6 pion. Les Noirs sont un peu mieux, environ -0,3.

Les Blancs préparent Rg3 pour attaquer g6. Nimzowitsch répond en deux temps :
- il double les tours sur la colonne f, f6 est surprotégé ;
- puis la tour f7 bascule en g7, contre la tour blanche.

La tour f8 suffit à garder f6. La tour f7 est donc libre de changer de colonne.

PRO TIP : un surprotecteur, c'est une pièce en RÉSERVE. Quand l'adversaire ouvre un nouveau front, c'est elle que tu envoies. }
17... Raf8 { DEUXIÈME TOUR sur la colonne f : f6 est défendu par deux tours. Presque aussi bon que 17...Nc4. [%cal Gf8f6,Gf7f6] }
18. Rg3 { La tour vise g6. Presque aussi bon que 18.a4. [%cal Rg3g6] }
18... Kh7 { Le roi défend g6. Un des meilleurs coups, avec 18...Rg7. [%cal Gh7g6] }
19. Ng1 { Le cavalier vise f3 puis g5. Presque aussi bon que 19.a4. }
19... Rg7 { LA BASCULE. La tour f7 passe en g7. La tour f8 suffit à garder f6. 19...Nc4 était un peu plus précis, environ 0,3 pion. [%cal Gg7g6,Gf8f6] }
20. Nf3 { Le cavalier vise g5. Presque aussi bon que 20.Rb1. [%cal Gf3g5] }
20... Qa4 { La dame part à l'aile dame et attaque a2 et c2. Presque aussi bon que 20...Nc4. [%cal Ra4a2,Ra4c2] }
21. exf6 { Le pion prend en f6. Un des meilleurs coups. }
21... Rxf6 { La tour f8 reprend : f6 était surprotégé, il est repris sans dommage. Le meilleur coup. [%cal Gf8f6] }
22. Ng5+ { Le cavalier entre en g5 avec échec. Presque aussi bon que 22.Re1. }
22... Kg8 { Le roi recule. Presque aussi bon que 22...Kh6. }
23. Re1 { Le meilleur coup, environ +0,2. La tour prend la colonne e et vise e6. [%cal Ge1e6] }
(23. Bg1 { LE COUP DE LA PARTIE, environ 0,7 pion de moins que 23.Re1. Le fou se replie, trop passif. }
23... Nc4 { Le cavalier s'installe en c4. Le meilleur coup. [%csl Gc4] }
24. Re1 { La tour prend la colonne e. Le meilleur coup. }
24... Bd7 { Le fou se replie et protège la 7e rangée. Le meilleur coup, environ -0,5.

Bilan de la partie : les Blancs ont fini par craquer. 31.Rc3? Nf6 32.cxd5? Ng4+ a gagné la dame. [%cal Gd7a4] })
23... Nc4 { Le cavalier s'installe en c4. Un des meilleurs coups. [%csl Gc4] }
24. Bc1 { Le fou se replie en c1 pour garder la diagonale. Le meilleur coup. }
24... Bd7 { Le fou se replie. Le meilleur coup, équilibre, environ +0,2.

Bilan : la tour g7 et la tour f6 tiennent l'aile roi, la dame et le cavalier jouent à l'aile dame. [%cal Gg7g6] }`,
    ),
    chapter(
      "Reshevsky – Petrosian (Zurich 1953) : surprotéger la case de blocus d5",
      "3rq1k1/4rppp/2n3b1/pp2P3/2pP1QB1/P1P1R3/1B4PP/4R1K1 b - - 3 25",
      `{ Samuel Reshevsky – Tigran Petrosian, tournoi des candidats, Zurich 1953. Petrosian a les Noirs. Les Blancs viennent de jouer 25.Rfe1. Stockfish préférait 25.Bf3, environ 0,7 pion de mieux. Les Blancs sont environ +0,7.

Les Blancs ont un centre mobile : pions c3, d4 et e5, appuyés par les deux tours e3 et e1. Ils menacent d5 ou e6.

L'application moderne de Nimzowitsch : Petrosian donne une qualité pour installer un cavalier en d5, devant les pions blancs. Cette case de blocus sera surprotégée par le pion e6.

Tal raconte dans sa préface de « Mon système » que ce sacrifice lui a laissé une impression immense.

PRO TIP : un centre mobile est dangereux. Bloqué, il devient une masse sans vie. Cherche la case juste devant lui, puis donne-lui un défenseur qu'aucune pièce ne peut chasser : un pion. }
25... Re6 { LE SACRIFICE DE QUALITÉ. La tour se place en e6 et bloque le pion e5. Si 27.Bxe6 fxe6, le pion e6 contrôlera d5 et f5. Le meilleur coup, ou presque selon les passes du moteur. [%csl Ge6][%cal Ge6d5] }
26. Rg3 { Le meilleur coup, environ +1. La tour vise g6 et g7. [%cal Gg3g6] }
(26. a4 { LE COUP DE LA PARTIE, environ 0,6 pion de moins que 26.Rg3. Le pion attaque b5, mais ne gêne pas le plan noir. [%cal Ra4b5] }
26... Ne7 { Le cavalier prend la route de d5. Le meilleur coup. [%cal Ge7d5] }
27. Bxe6 { Les Blancs prennent la qualité. Un des meilleurs coups. }
27... fxe6 { Le pion reprend : il contrôle d5 et f5. Le meilleur coup. [%cal Ge6d5,Ge6f5] }
28. Qf1 { La dame se replie. Un peu moins précis que 28.Rf3, environ 0,4 pion. }
28... Nd5 { LE BLOCUS. Le cavalier s'installe en d5, surprotégé par le pion e6. Le pion d4 est bloqué, le fou b2 n'a plus d'avenir. Le meilleur coup. [%csl Gd5][%cal Ge6d5] }
29. Rf3 { La tour prend la colonne f. Le meilleur coup. }
29... Bd3 { Le fou attaque la dame et la tour. Le meilleur coup. [%cal Rd3f1] }
30. Rxd3 { Les Blancs rendent la qualité. Le meilleur coup. }
30... cxd3 { Le pion reprend. Le meilleur coup. }
31. Qxd3 { La dame reprend. Le meilleur coup. }
31... b4 { Le pion b ouvre l'aile dame. Presque aussi bon que 31...bxa4. Équilibre, environ 0,0.

Bilan de la partie : nulle au coup 41. Le cavalier d5, protégé par le pion e6, a neutralisé tout le centre blanc. [%csl Gd5] })
26... Ne7 { Le cavalier part vers d5 ou f5. Le meilleur coup. [%cal Ge7d5,Ge7f5] }
27. Bxe6 { Les Blancs prennent la qualité. Le meilleur coup. }
27... fxe6 { Le pion e6 contrôle d5 et f5 : deux cases de blocus pour le cavalier. Le meilleur coup. [%cal Ge6d5,Ge6f5] }
28. Rf1 { La tour prend la colonne f. Le meilleur coup. }
28... Nf5 { Le cavalier s'installe en f5, protégé par le pion e6. Le meilleur coup, environ +1.

Bilan : même avec la meilleure défense, les Blancs n'ont qu'un petit avantage, alors qu'ils ont une qualité de plus. Le blocus surprotégé vaut presque la qualité. [%csl Gf5] }`,
    ),
  ],
};
