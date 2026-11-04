import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « Transformer un avantage » (positional_mastery, module 25) —
 * format « un commentaire par coup ».
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, entièrement
 * réécrite ici) : scores PGN des archives de joueurs de pgnmentor.com
 * (chessgames.com refusait les requêtes ce jour-là), rejoués avec chess.js —
 * Fischer – Petrosian (finale des Candidats, Buenos Aires 1971, 7e partie),
 * le cavalier c5 contre le fou enfermé, l'échange 22.Nxd7+ et les tours sur
 * la 7e rangée ; Rubinstein – Lasker (Saint-Pétersbourg 1909), l'initiative
 * convertie en matériel puis en finale de tours ; Lasker – Capablanca
 * (championnat du monde, La Havane 1921, 10e partie), la pression sur le pion
 * isolé convertie en finale, puis le pion de plus changé en pion passé
 * central ; Karpov – Unzicker (olympiade de Nice 1974), l'espace converti en
 * étau à l'aile roi.
 *
 * Plan : préparer la transformation (1), le bon moment pour échanger la
 * pièce dominante (2), le pion faible fixé avant la percée (3), les tours
 * sur la 7e rangée (4), l'initiative convertie en matériel (5), l'échange
 * des dames qui encaisse (6), la finale de tours technique (7), le pion
 * isolé transformé en cible de finale (8), le pion de plus transformé en
 * pion passé (9), l'espace transformé en étau (10), l'étau qui se referme
 * sans se presser (11).
 *
 * Toutes les lignes ont été rejouées avec chess.js et chaque coup sondé avec
 * Stockfish 19 (binaire Linux local, profondeur 18, 3 candidats par coup),
 * suites du moteur comprises. Règle appliquée : quand un coup perd environ
 * 0,5 pion ou plus par rapport au choix du moteur, la LIGNE PRINCIPALE suit
 * le moteur et le coup de la partie passe en variante, signalée comme
 * fautive. Exception : dans une position déjà décisive (plus de 3 pions
 * environ), un écart est seulement signalé dans le commentaire. Les coups
 * proches du seuil ont été resondés trois fois avec un moteur neuf et
 * tranchés sur la moyenne : 21...Bd7 (0,65), 22.Nxd7+ (0,75), 27...h4
 * (0,58) et 28.Kf3 (0,53) en 1971, 14...O-O-O (1,00) de Lasker en 1909 et
 * 37...hxg3 (0,66) de Capablanca en 1921 sont des fautes ; 20.f3 (0,49) de
 * Fischer, 32.Qb2 (0,31) et 42...Nc6 (0,40) en 1921, 30...f6 (0,41)
 * d'Unzicker et 29...Bg7 (0,37) ne sont que des imprécisions. Les évaluations citées sont du
 * point de vue des Blancs. Aucun résultat de partie dans les variantes : le
 * parseur s'y arrêterait.
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

export const LA_TRANSFORMATION_DUN_AVANTAGE: CourseTree = {
  chapters: [
    chapter(
      "Fischer – Petrosian (Buenos Aires 1971) : préparer la transformation",
      "r5k1/4rppp/p3bn2/3p4/N7/3B4/PP3PPP/R3R1K1 w - - 0 18",
      `{ Un avantage n'est pas un but : c'est une monnaie. L'espace, la paire de fous, une meilleure structure ou une pièce mieux placée ne gagnent jamais seuls. Il faut, au bon moment, les ÉCHANGER contre un avantage plus concret : du matériel, un pion passé, une finale où l'adversaire n'a plus de jeu. Transformer trop tôt gaspille la monnaie ; trop tard, elle a fondu.

Robert Fischer – Tigran Petrosian, finale des Candidats, Buenos Aires 1971, 7e partie. Après 1.e4 c5 2.Nf3 e6 3.d4 cxd4 4.Nxd4 a6 5.Bd3 Nc6 6.Nxc6 bxc6 7.O-O d5 8.c4 Nf6 9.cxd5 cxd5 10.exd5 exd5 11.Nc3 Be7 12.Qa4+ Qd7 13.Re1 Qxa4 14.Nxa4 Be6 15.Be3 O-O 16.Bc5 Rfe8 17.Bxe7 Rxe7, les dames ont disparu. Les Blancs ont environ +0,7 : le pion noir d5 est isolé, le pion a6 est faible, et la case c5 attend un cavalier blanc.

PRO TIP : avant de chercher à transformer, fais l'inventaire de ce que tu possèdes vraiment. Ici, ce n'est pas du matériel : c'est la case c5, et un fou noir que son propre pion d5 gêne. }
18. b4 { Le meilleur coup. Le pion b soutient d'avance la case c5 : un cavalier qui s'y posera ne pourra être chassé par aucun pion noir. [%cal Gb4c5] }
18... Kf8 { Le roi s'approche du centre pour la finale. Un des meilleurs coups ; 18...d4 était à peine plus actif. }
19. Nc5 { Le meilleur coup. Le cavalier s'installe en c5, d'où il attaque a6 et le fou e6. [%csl Gc5][%cal Gc5a6,Gc5e6] }
19... Bc8 { Le fou se replie pour protéger a6. 19...a5 était un peu plus précis, environ 0,2 pion : les Noirs se débarrassaient du pion faible. }
20. f3 { Le pion f retire la case e4 au cavalier noir. Une imprécision : 20.Rec1 était meilleur d'environ 0,5 pion selon trois sondes (moyenne 0,49), juste sous le seuil. [%cal Gf3e4] }
20... Nd7 { LE COUP QUE STOCKFISH PROPOSE. Le cavalier va droit sur le cavalier c5 pour l'échanger ou le chasser : si la pièce dominante disparaît, l'avantage blanc retombe. [%cal Gd7c5] }
(20... Rea7 { La partie. Une faute, environ 0,9 pion : la tour se met à défendre a6 au lieu de contester le cavalier c5. Les Blancs restent maîtres du jeu. }
21. Re5 { Fischer occupe la colonne e. 21.Rac1 était un peu plus précis, environ 0,25 pion. [%cal Ge5d5] }
21... Bd7 { Encore une faute, environ 0,65 pion selon trois sondes : le fou se propose à l'échange contre le cavalier. La suite fait l'objet du chapitre suivant. })
21. Nb3 { Le meilleur coup. Le cavalier blanc évite l'échange et garde un œil sur c5 et d4. }
21... Ne5 { Le meilleur coup. Le cavalier noir gagne un poste actif au centre. [%csl Ge5] }
22. Bf1 { Le meilleur coup. Le fou s'écarte de l'attaque du cavalier e5 et garde c4. }
22... Nc4 { Le meilleur coup. Le cavalier occupe la case c4, abritée derrière le pion d5. [%csl Gc4] }
23. Kf2 { Le meilleur coup. Le roi blanc se centralise lui aussi. }
23... Be6 { Le fou retrouve sa diagonale. Un des meilleurs coups. }
24. a3 { Un des meilleurs coups. Les Blancs gardent un petit avantage, environ +0,2.

Bilan : un poste comme c5 n'est un avantage que tant qu'aucune pièce adverse ne peut le contester. Avec 20...Nd7, les Noirs effaçaient presque tout ; c'est leur passivité qui a permis à Fischer de transformer. [%csl Gc5] }`,
    ),
    chapter(
      "Fischer – Petrosian (Buenos Aires 1971) : échanger la pièce dominante, mais au bon moment",
      "r4k2/r2b1ppp/p4n2/2NpR3/1P6/3B1P2/P5PP/R5K1 w - - 3 22",
      `{ Suite de la partie : 20...Rea7? 21.Re5 Bd7?. Les Blancs ont environ +1,6. Le fou noir propose de s'échanger contre le cavalier c5, la meilleure pièce blanche.

Faut-il accepter ? En échangeant, les Blancs transforment leur avantage : au lieu d'un cavalier qui domine, ils auront un fou contre un cavalier, avec des pions sur les deux ailes, et des tours qui entrent sur la colonne c. C'est le choix célèbre de Fischer. Stockfish juge pourtant qu'il est un peu prématuré.

PRO TIP : avant d'échanger ta meilleure pièce, demande-toi si l'adversaire peut améliorer sa position pendant que tu attends. Si la réponse est non, prends d'abord tout ce qui est gratuit, ici un coup de pion qui fixe sa faiblesse, et ne transforme qu'ensuite. }
22. a4 { LE COUP DU MOTEUR. Avant toute transformation, les Blancs fixent le pion a6 et préparent a5 : le cavalier c5 garde toute sa force et le fou noir n'a toujours pas de bonne case. [%cal Ga4a5,Gc5a6] }
(22. Nxd7+ { La partie : la transformation de Fischer. Il échange sa pièce dominante contre le fou, et la tour reprendra sur d7. Une faute selon la règle du module, environ 0,75 pion selon trois sondes, mais les Blancs restent clairement mieux, environ +1,0. [%cal Gc5d7] }
22... Rxd7 { Le meilleur coup : 22...Nxd7 était nettement pire, environ +3. }
23. Rc1 { Le meilleur coup. La tour prend la colonne c, ouverte, et vise c7. [%cal Gc1c7] }
23... Rd6 { La tour garde la 6e rangée. Un des meilleurs coups ; 23...d4 était à peine plus précis. }
24. Rc7 { Le meilleur coup. La tour blanche est sur la 7e rangée : c'est le fruit de la transformation. [%csl Gc7] }
24... Nd7 { Le cavalier vient boucher la 7e rangée. 24...Ne8 était un peu plus précis, environ 0,15 pion. }
25. Re2 { Le meilleur coup. La seconde tour se prépare à doubler. }
25... g6 { Un des meilleurs coups : le roi noir reçoit une case de fuite en g7. }
26. Kf2 { Un des meilleurs coups. Le roi blanc se rapproche du centre. }
26... h5 { Les Noirs gagnent de l'espace à l'aile roi. Un des meilleurs coups, au niveau de 26...Kg7. Le chapitre 4 reprend ici. })
22... Bc6 { Le meilleur coup. Le fou évite l'échange et protège d5. }
23. Ree1 { Un des meilleurs coups. La tour revient : elle n'a plus rien à faire en e5. }
23... Bb7 { Le meilleur coup. Le fou garde d5 et a6 depuis b7. }
24. a5 { Le meilleur coup. Le pion a5 fixe a6 et prend la case b6 au cavalier noir. [%cal Ga5b6] }
24... g6 { Un des meilleurs coups : les Noirs donnent de l'air à leur roi. }
25. Na4 { Le meilleur coup. Le cavalier vise b6, d'où il bloquera tout. [%cal Ga4b6] }
25... Bc8 { Le fou se replie. Le meilleur coup, les Blancs ont environ +2,2.

Bilan : 22.Nxd7+ reste un bon coup, mais 22.a4 garde la meilleure pièce un coup de plus. On transforme quand on a pris tout ce que la position offre gratuitement. }`,
    ),
    chapter(
      "Fischer – Petrosian (Buenos Aires 1971) : fixer la faiblesse avant de percer",
      "r4k2/2Rn1p2/p2r2p1/3p3p/1P6/3B1P2/P3RKPP/8 w - - 0 27",
      `{ Après 22.Nxd7+ Rxd7 23.Rc1 Rd6 24.Rc7 Nd7 25.Re2 g6 26.Kf2 h5, Fischer a obtenu ce qu'il voulait : une tour sur la 7e rangée, un fou contre un cavalier, des pions noirs isolés en a6 et d5. Les Blancs ont environ +1,5.

Il faut maintenant transformer à nouveau : la 7e rangée doit rapporter un pion, ou la création d'un pion passé.

PRO TIP : une faiblesse qui peut encore avancer n'est pas une cible. Fixe-la d'abord, ici avec a4-b5, puis attaque-la. Un coup de pion sur l'autre aile qui affaiblit ta propre structure, comme f4, peut tout faire retomber. }
27. a4 { Un des meilleurs coups, au niveau de 27.h4 selon les sondes. Le pion a vient soutenir b5 : les Blancs vont ouvrir l'aile dame, où le fou est plus fort que le cavalier. [%cal Ga4a5,Gb4b5] }
(27. f4 { La partie. Une faute, environ 1 pion : le pion f quitte la case f3, d'où il gardait e4 et g4, et les Noirs retrouvent du jeu. }
27... Nb6 { La réfutation, le meilleur coup. Le cavalier quitte la défense pour aller vers c4 ou a4. Petrosian a joué 27...h4, une faute à son tour (environ 0,6 pion selon trois sondes). [%cal Gb6c4] }
28. f5 { Le meilleur coup : les Blancs ouvrent l'aile roi avant que le cavalier n'arrive en c4. [%cal Gf5g6] }
28... Rf6 { Le meilleur coup. La tour attaque le pion f5. }
29. Ke3 { Un des meilleurs coups. Le roi monte au centre. }
29... gxf5 { Un des meilleurs coups. Les Noirs prennent le pion. }
30. Kd4 { Le meilleur coup. L'avantage blanc est retombé à environ +0,35 : 27.f4 a gaspillé un pion d'avantage. })
27... Rb8 { Le meilleur coup. La tour vient défendre l'aile dame. }
28. b5 { Le meilleur coup. Les Blancs ouvrent l'aile dame. [%cal Gb5a6] }
28... a5 { Le meilleur coup : 28...axb5 29.axb5 donnerait aux Blancs un pion passé b5, environ +4. }
29. Ra7 { Le meilleur coup. La tour attaque a5, le pion fixé. [%cal Ga7a5] }
29... Nc5 { Le meilleur coup. Le cavalier défend a4 et contre-attaque. }
30. Bc2 { Le meilleur coup. Le fou protège a4. }
30... h4 { Un des meilleurs coups. Les Blancs ont environ +1,9 et un pion a5 à gagner.

Bilan : avec 27.a4, l'avantage de la 7e rangée se transforme en une cible fixe. Avec 27.f4, il s'évaporait. [%csl Ga5] }`,
    ),
    chapter(
      "Fischer – Petrosian (Buenos Aires 1971) : les tours sur la 7e rangée encaissent",
      "r4k2/2Rn4/p2r2p1/3p1p2/1P3P1p/3B1K2/P3R1PP/8 w - - 0 29",
      `{ La partie a continué 27.f4 h4 28.Kf3 f5. Deux fautes noires et une blanche (28.Kf3, environ 0,5 pion selon trois sondes) : les Blancs ont environ +1,7.

Le pion f5 noir a affaibli la case e6 et la 7e rangée. Les tours blanches vont pouvoir doubler sur la 7e. Il reste à transformer cette pression en gain concret.

PRO TIP : deux tours sur la 7e rangée créent des menaces de mat même sans dame. Avant de compter les pions, regarde si le roi adverse, coincé sur la 8e rangée, n'est pas déjà une cible. }
29. Ke3 { Le roi va vers d4. Un des meilleurs coups, au niveau de 29.a4. [%cal Ge3d4] }
29... d4+ { Le pion avance avec échec. Une imprécision : 29...Ke7 était plus précis, environ 0,3 pion. }
30. Kd2 { Le meilleur coup. Le roi surveille la case d3, devant le pion d. }
30... a5 { Un des meilleurs coups du moteur, au niveau de 30...Nf6. Les Noirs se débarrassent de leur faiblesse a6 avant qu'elle ne tombe. [%cal Ga5b4] }
(30... Nb6 { La partie. Une faute, environ 1,9 pion : le cavalier quitte la 7e rangée et laisse entrer la seconde tour blanche. }
31. Ree7 { Le meilleur coup. Les deux tours sont sur la 7e : le roi noir est coincé sur la 8e rangée. [%cal Ge7f7,Gc7h7] }
31... Nd5 { Le cavalier attaque f4 et e7. La position est perdue, environ +4,7 : l'écart avec le moteur est seulement signalé. }
32. Rf7+ { Le meilleur coup. Le roi noir est repoussé vers e8. }
32... Ke8 { Le meilleur coup, 32...Kg8 était pire. }
33. Rb7 { Le meilleur coup. Les deux tours resserrent le filet autour du roi e8. [%cal Gf7h7] }
33... Nxb4 { Le cavalier prend le pion, mais accélère la fin. 33...Rb8 tenait plus longtemps. }
34. Bc4 { Le fou entre en jeu et le filet de mat se referme : Petrosian a abandonné. 34.Rh7 menait au mat plus vite, l'écart est seulement signalé. [%cal Gc4f7] })
31. bxa5 { Le meilleur coup. Le pion b prend a5 : la position est devenue décisive, environ +3,6. }
31... Rxa5 { La tour reprend, mais elle quitte la défense de la 8e rangée. 31...h3 tenait un peu mieux : l'écart est seulement signalé. }
32. Rc8+ { Le meilleur coup. La tour donne échec sur la 8e rangée. }
32... Kg7 { Un des meilleurs coups, au niveau de 32...Kf7. }
33. Bc4 { Le meilleur coup. Le fou entre sur la diagonale a2-g8. [%cal Gc4e6] }
33... Kf6 { Le meilleur coup. Le roi noir sort de sa prison pour défendre e6. }
34. Rce8 { Le meilleur coup. La tour vise e6 : les Blancs ont environ +5.

Bilan : la 7e rangée s'est transformée en attaque contre le roi, puis en matériel. Fischer n'a jamais eu besoin de sa dame. }`,
    ),
    chapter(
      "Rubinstein – Lasker (Saint-Pétersbourg 1909) : l'initiative transformée en matériel",
      "2kr3r/pp3ppp/2b5/6q1/3P4/4N3/PP3PPP/R2QK2R w KQ - 2 15",
      `{ Une initiative ne dure pas : chaque coup que l'adversaire gagne pour mettre son roi à l'abri ou coordonner ses pièces la réduit. Il faut donc, tant qu'elle existe, l'échanger contre quelque chose de stable : du matériel ou une finale gagnée.

Akiba Rubinstein – Emanuel Lasker, Saint-Pétersbourg 1909. Après 1.d4 d5 2.Nf3 Nf6 3.c4 e6 4.Bg5 c5 5.cxd5 exd5 6.Nc3 cxd4 7.Nxd4 Nc6 8.e3 Be7 9.Bb5 Bd7 10.Bxf6 Bxf6 11.Nxd5 Bxd4 12.exd4 Qg5 13.Bxc6 Bxc6 14.Ne3 O-O-O?, les Blancs ont un pion de plus (d4, isolé). Le grand roque de Lasker est une faute, environ 1 pion selon trois sondes : le roi c8 se place sur la colonne c, où une tour blanche va s'installer. Les Blancs ont environ +1,0.

PRO TIP : quand ton adversaire laisse son roi sur une colonne que tu peux ouvrir, ne compte plus seulement les pions ; regarde si un clouage peut te rapporter une pièce. }
15. O-O { Le meilleur coup. Le roi blanc se met à l'abri avant de passer à l'attaque. }
15... Rhe8 { La tour vise le cavalier e3. Un des meilleurs coups, au niveau de 15...Kb8. [%cal Ge8e3] }
16. Rc1 { Le meilleur coup. La tour cloue le fou c6 sur le roi c8. [%cal Gc1c8] }
16... Rxe3 { Le meilleur coup. Lasker rend la qualité pour casser l'initiative blanche. }
17. Rxc6+ { Le meilleur coup. Les Blancs prennent le fou cloué avec échec : 17.f3 ou 17.g3 perdraient. }
17... bxc6 { Le meilleur coup. Le roi noir est maintenant découvert. }
18. Qc1 { Le meilleur coup. La dame attaque la tour e3 et vise c6 : deux cibles à la fois. [%cal Gc1e3,Gc1c6] }
18... Rxd4 { Le meilleur coup. Les Noirs prennent le pion d4 ; la tour e3 reste défendue par la dame g5. }
19. fxe3 { Le meilleur coup : la dame c1 garde e3, la dame noire ne peut pas reprendre. Les Blancs ont repris leur matériel : dame et tour contre dame et tour, 5 pions de chaque côté, mais le roi c8 est nu. Environ +1,6. }
19... Rd6 { LE COUP DU MOTEUR. La tour garde c6 et la 6e rangée. }
(19... Rd7 { La partie. Une faute, environ 1,9 pion : le pion c6 tombe avec échec. }
20. Qxc6+ { Le meilleur coup. La dame prend c6 en donnant échec. Le chapitre suivant reprend ici. })
20. Rxf7 { Le meilleur coup. La tour prend f7 et entre sur la 7e rangée. }
20... Qh5 { Un des meilleurs coups, au niveau de 20...Qg4 : la dame vise la 1re rangée. }
21. Rf3 { Un des meilleurs coups. La tour revient défendre la 1re et la 3e rangée. }
21... Kb7 { Un des meilleurs coups. Le roi noir s'éloigne de la colonne c. }
22. Qc3 { Le meilleur coup. La dame se centralise et vise c6. [%cal Gc3c6] }
22... Rd7 { Un des meilleurs coups. }
23. h3 { Le meilleur coup. Les Blancs donnent de l'air à leur roi : environ +1,9 et un pion de plus.

Bilan : l'initiative blanche a rapporté un pion et un roi noir exposé, deux avantages qui, eux, ne disparaîtront pas. }`,
    ),
    chapter(
      "Rubinstein – Lasker (Saint-Pétersbourg 1909) : l'échange des dames qui encaisse",
      "2k5/p2r1ppp/2p5/6q1/8/4P3/PP4PP/2Q2RK1 w - - 1 20",
      `{ Suite de la partie : 19...Rd7?. Les Blancs ont environ +3,5. Il faut maintenant convertir. Le roi noir est nu, mais une attaque de mat peut toujours échouer. Un pion de plus dans une finale où la tour blanche est active, en revanche, se gagne presque tout seul.

PRO TIP : quand l'attaque a déjà rapporté son matériel, propose l'échange des dames. La dame adverse est souvent la dernière pièce capable de créer un contre-jeu. }
20. Qxc6+ { Le meilleur coup. Les Blancs gagnent le pion c6 avec échec. }
20... Kd8 { Le meilleur coup : 20...Rc7 ou 20...Kb8 perdraient plus vite. }
21. Rf4 { Le meilleur coup. La tour garde la 4e rangée, notamment d4 et g4, et prépare à rejoindre l'attaque. [%cal Gf4d4] }
21... f5 { Le pion f se défend. 21...Rd1+ tenait plus longtemps, environ 0,7 pion : la position est décisive, l'écart est seulement signalé. }
22. Qc5 { La dame se place pour proposer l'échange. Un des coups gagnants ; Stockfish préfère de peu 22.Qc3. [%cal Gc5e7] }
22... Qe7 { Le meilleur coup. Lasker accepte de rentrer en finale plutôt que de laisser son roi sous le feu. }
23. Qxe7+ { LE COUP DU CHAPITRE, le meilleur. Les Blancs échangent les dames : l'avantage devient purement technique. }
23... Kxe7 { Un des meilleurs coups, au niveau de 23...Rxe7. }
24. Rxf5 { Le meilleur coup. Les Blancs ont maintenant deux pions de plus. }
24... Rd1+ { Un des meilleurs coups. La tour noire devient active : c'est le seul espoir. [%cal Gd1d2] }
25. Kf2 { Le meilleur coup. Le roi blanc se rapproche du centre. }
25... Rd2+ { Le meilleur coup. La tour gagne un tempo pour prendre b2. }
26. Kf3 { Le meilleur coup. Le roi avance plutôt que de reculer. }
26... Rxb2 { Le meilleur coup. Les Noirs récupèrent un pion : il reste une finale de tours avec un pion de plus pour les Blancs, environ +5.

Bilan : l'attaque a rapporté un pion, l'échange des dames l'a mis en sécurité. La suite est une affaire de technique. }`,
    ),
    chapter(
      "Rubinstein – Lasker (Saint-Pétersbourg 1909) : la finale de tours technique",
      "8/p3k1pp/8/5R2/8/4PK2/Pr4PP/8 w - - 0 27",
      `{ La finale de tours : quatre pions blancs contre trois. Les tours de finale réclament de l'activité, et c'est elle que Rubinstein va transformer en victoire.

Le plan : la tour blanche attaque a7 et coupe le roi noir par la 6e rangée, puis les pions de l'aile roi avancent, soutenus par le roi.

PRO TIP : dans une finale de tours avec un pion de plus, la tour active vaut souvent un pion de plus encore. Ne la mets jamais derrière tes pions à défendre si elle peut attaquer ceux de l'adversaire. }
27. Ra5 { Le meilleur coup. La tour attaque a7 : la tour noire doit le défendre. [%cal Ga5a7] }
27... Rb7 { La tour défend a7 depuis la 7e rangée. Un des meilleurs coups. }
28. Ra6 { La tour coupe le roi noir par la 6e rangée. 28.h4 était encore plus précis, environ 0,4 pion : la position est décisive, l'écart est seulement signalé. [%cal Ga6g6] }
28... Kf8 { Le roi se replie. 28...g5 tenait un peu mieux. }
29. e4 { Le meilleur coup. Le pion e avance vers e5, au centre. [%cal Ge4e5] }
29... Rc7 { La tour cherche un peu de jeu sur la colonne c. Un des coups possibles dans une position perdue. }
30. h4 { Un des meilleurs coups. Le pion h avance pour gagner de l'espace. }
30... Kf7 { Un des meilleurs coups. Le roi revient vers le centre. }
31. g4 { Un des coups gagnants. Les pions de l'aile roi avancent ensemble. }
31... Kf8 { Un des meilleurs coups : le roi attend. }
32. Kf4 { Un des coups gagnants. Le roi soutient les pions. [%cal Gf4f5] }
32... Ke7 { Un des meilleurs coups. }
33. h5 { Un des coups gagnants. Le pion h fixe g7 et h7. }
33... h6 { Le pion se met hors d'atteinte, mais affaiblit g6. 33...Ke8 tenait plus longtemps, environ 0,75 pion : l'écart est seulement signalé. }
34. Kf5 { Un des meilleurs coups. Le roi entre en f5 et vise g6. [%csl Gf5] }
34... Kf7 { Le roi garde g6. Un des meilleurs coups. }
35. e5 { Le meilleur coup. Le pion e prend la case f6 au roi noir. [%cal Ge5f6] }
35... Rb7 { La tour reste près de la défense de a7. Un des meilleurs coups. }
36. Rd6 { La tour vise d7. 36.Rc6 était un peu plus précis. }
36... Ke7 { Le roi attaque la tour d6. Un des meilleurs coups. }
37. Ra6 { Le meilleur coup. La tour retourne attaquer a7. }
37... Kf7 { Le roi revient garder g6. Un des meilleurs coups. }
38. Rd6 { La tour reprend la 6e rangée. 38.a4 était un peu plus précis. }
38... Kf8 { Le roi attend. 38...Ke8 tenait un peu mieux. }
39. Rc6 { La tour reste sur la 6e. 39.Rd8+ était plus net : l'écart est seulement signalé. }
39... Kf7 { Le roi revient en f7. Tous les coups perdent. }
40. a3 { Un des coups gagnants. Les Noirs n'ont plus de coup utile : Lasker a abandonné.

Bilan : un pion de plus, une tour active et un roi actif. Rubinstein a transformé l'avantage matériel en zugzwang. [%csl Gf5,Gc6] }`,
    ),
    chapter(
      "Lasker – Capablanca (La Havane 1921) : le pion isolé transformé en cible de finale",
      "2r3k1/p4pp1/1q2p3/3p1n2/3P3p/1P5P/P2QNPP1/3R2K1 w - - 0 28",
      `{ Emanuel Lasker – José Raúl Capablanca, championnat du monde, La Havane 1921, 10e partie. Après 1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 Nbd7 7.Qc2 c5 8.Rd1 Qa5 9.Bd3 h6 10.Bh4 cxd4 11.exd4 dxc4 12.Bxc4 Nb6 13.Bb3 Bd7 14.O-O Rac8 15.Ne5 Bb5 16.Rfe1 Nbd5 17.Bxd5 Nxd5 18.Bxe7 Nxe7 19.Qb3 Bc6 20.Nxc6 bxc6 21.Re5 Qb6 22.Qc2 Rfd8 23.Ne2 Rd5 24.Rxd5 cxd5 25.Qd2 Nf5 26.b3 h5 27.h3 h4, les Noirs ont environ -1,3 (avantage noir).

Le pion blanc d4 est isolé et bloqué par d5. Le cavalier f5 l'attaque, le pion h4 fixe g2. Mais avec les dames, les Blancs gardent des chances d'attaque. Capablanca va transformer : ouvrir l'aile dame pour créer une seconde faiblesse, puis échanger les dames.

PRO TIP : une seule faiblesse se défend souvent. Pour gagner, crée-en une seconde loin de la première, puis simplifie : en finale, le défenseur ne peut plus tout couvrir. }
28. Qd3 { La dame protège d4. 28.Nc3 ou 28.Ra1 étaient un peu plus précis, environ 0,3 pion. }
28... Rc6 { Le meilleur coup. La tour se prépare à basculer sur la colonne a ou b. }
29. Kf1 { Le roi se rapproche du centre en vue de la finale. Une imprécision : 29.Nc3 était meilleur, environ 0,35 pion. }
29... g6 { Un des meilleurs coups. Le pion abrite le roi noir et soutient h5 plus tard. }
30. Qb1 { La dame vise la 1re rangée. 30.Ng1 était un peu plus précis, environ 0,2 pion. }
30... Qb4 { La dame noire entre à l'aile dame. Un des meilleurs coups. [%cal Gb4a3] }
31. Kg1 { Le roi revient. 31.Qd3 était un peu plus précis. }
31... a5 { Le pion a part en avant pour attaquer b3. Une imprécision : 31...Qa5 était plus précis, environ 0,35 pion. [%cal Ga5a4] }
32. Qb2 { La dame défend b3 de loin. Une imprécision, environ 0,3 pion selon trois sondes : 32.Rd3 tenait mieux. }
32... a4 { Le meilleur coup. Le pion attaque b3 : la structure blanche de l'aile dame va se briser. [%cal Ga4b3] }
33. Qd2 { Le meilleur coup. Lasker propose l'échange des dames. }
33... Qxd2 { LE COUP DU CHAPITRE, le meilleur. Capablanca accepte : sans les dames, le pion d4 et le pion b3 deviennent deux cibles fixes. }
34. Rxd2 { Le seul coup. }
34... axb3 { Le meilleur coup. Les Noirs prennent b3. }
35. axb3 { Le meilleur coup. Le pion b3 est maintenant isolé, comme le pion d4. }
35... Rb6 { Le meilleur coup. La tour attaque b3. [%cal Gb6b3] }
36. Rd3 { Le meilleur coup. La tour défend b3 et d4 sur la 3e rangée. }
36... Ra6 { Le meilleur coup. La tour menace d'entrer en a1 ou a2. [%cal Ga6a1] }
37. g4 { Le pion attaque le cavalier f5. Un des meilleurs coups. }
37... Nd6 { LE COUP DU MOTEUR. Le cavalier recule en gardant c4 et e4, et le pion h4 reste fixe. }
(37... hxg3 { La partie : la prise en passant. Une faute, environ 0,65 pion selon trois sondes : le pion h4, qui fixait l'aile roi blanche, disparaît. }
38. fxg3 { Le meilleur coup. Les Blancs reprennent. }
38... Ra2 { La tour entre en 2e rangée. 38...Ra1+ était un peu plus précis. La partie continue au chapitre suivant. })
38. Kg2 { Un des meilleurs coups. Le roi blanc défend ses pions. }
38... g5 { Le meilleur coup. Le pion g soutient h4. }
39. Kf3 { Un des meilleurs coups. }
39... Ra2 { Le meilleur coup. La tour noire entre en 2e rangée. [%cal Ga2f2] }
40. Nc3 { Le meilleur coup. Le cavalier attaque la tour. }
40... Rb2 { Un des meilleurs coups : la tour attaque b3. [%cal Gb2b3] }
41. Nd1 { Un des meilleurs coups. Les Noirs ont environ -1,9 (avantage noir).

Bilan : l'aile dame ouverte et l'échange des dames ont transformé la pression sur d4 en une finale où les Blancs défendent deux pions faibles. }`,
    ),
    chapter(
      "Lasker – Capablanca (La Havane 1921) : le pion de plus transformé en pion passé",
      "8/5p2/4p1k1/3p2p1/3Pn1P1/3R3P/r7/5KN1 b - - 16 57",
      `{ La partie a continué 38.fxg3 Ra2 39.Nc3 Rc2 40.Nd1 Ne7 41.Nc3 Rc1+ 42.Kf2 Nc6 43.Nd1 Rb1 44.Ke2 Rxb3 45.Ke3 Rb4 46.Nc3 Ne7 47.Ne2 Nf5+ 48.Kf2 g5 49.g4 Nd6 50.Ng1 Ne4+ 51.Kf1 Rb1+ 52.Kg2 Rb2+ 53.Kf1 Rf2+ 54.Ke1 Ra2 55.Kf1 Kg7 56.Re3 Kg6 57.Rd3. Plusieurs fautes des deux côtés : 40.Nd1 et 40...Ne7 (environ 0,9 pion chacun), surtout 43.Nd1 et 44.Ke2 (environ 2 pions chacun). Le pion b3 est tombé.

Les Noirs ont un pion de plus, environ -5,5 (avantage noir). Mais leurs pions de l'aile roi sont bloqués. Pour gagner, Capablanca va transformer ce pion de plus en PION PASSÉ CENTRAL, poussé par le roi.

PRO TIP : un pion de plus ne gagne pas en restant immobile. Cherche la poussée qui crée un pion passé, et amène le roi devant lui avant de la jouer. }
57... f6 { Le pion f libère la case f7 pour le roi. 57...Kg7 était plus précis, environ 0,6 pion : l'écart est seulement signalé. }
58. Re3 { Un des meilleurs coups, au niveau de 58.Ne2. La tour attaque le cavalier e4. }
58... Kf7 { Le meilleur coup. Le roi part vers le centre. [%cal Gf7d6] }
59. Rd3 { La tour revient sur la 3e rangée. Un des coups de la sonde ; les Blancs n'ont rien de mieux qu'attendre. }
59... Ke7 { Un des meilleurs coups. Le roi continue sa route. }
60. Re3 { Le meilleur coup. La tour attaque à nouveau le cavalier. }
60... Kd6 { Un des meilleurs coups. Le roi est arrivé derrière ses pions centraux. [%csl Gd6] }
61. Rd3 { La tour garde la 3e rangée. 61.Nf3 résistait un peu mieux. }
61... Rf2+ { La tour donne échec. Un des meilleurs coups. }
62. Ke1 { Le seul coup. }
62... Rg2 { La tour attaque g1. 62...Ra2 était un peu plus direct. }
63. Kf1 { Le roi défend le cavalier. Un des coups possibles. }
63... Ra2 { La tour revient en a2. Un des meilleurs coups. }
64. Re3 { La tour attaque encore le cavalier. 64.Ne2 tenait un peu mieux : l'écart est seulement signalé. }
64... e5 { LE COUP DU CHAPITRE. Stockfish préfère le préparer par 64...Kc6, mais la position est décisive : l'écart est seulement signalé. La poussée qui transforme le pion de plus : après l'échange en d4, le pion d5 deviendra un pion passé, avec le roi juste derrière. [%cal Ge5d4] }
65. Rd3 { La tour défend d4. 65.Nf3 tenait plus longtemps : la position est décisive, l'écart est seulement signalé. }
65... exd4 { Un des meilleurs coups. Les Noirs prennent d4. }
66. Rxd4 { La tour reprend. 66.Nf3 résistait un peu mieux. }
66... Kc5 { Le meilleur coup. Le roi attaque la tour et soutient le pion d5. [%cal Gc5d4] }
67. Rd1 { Le meilleur coup. La tour se replie. }
67... d4 { Le meilleur coup. Le pion passé avance, le roi derrière lui. [%cal Gd4d3] }
68. Rc1+ { La tour donne échec. 68.h4 tenait plus longtemps : l'écart est seulement signalé. }
68... Kd5 { Le meilleur coup. Le roi revient protéger le pion. Lasker a abandonné.

Bilan : le pion de plus est devenu un pion passé central, escorté par le roi et le cavalier. [%csl Gd4,Gd5] }`,
    ),
    chapter(
      "Karpov – Unzicker (Nice 1974) : l'espace transformé en étau",
      "r1rnbbk1/B1n1qp1p/3p2p1/1p1Pp3/1Pp1P3/2P2N1P/R2QNPP1/RB4K1 w - - 12 29",
      `{ Un avantage d'espace donne de la liberté, mais il ne gagne rien tant que l'adversaire, à l'étroit, peut encore rompre. Il faut le transformer : soit en attaque, soit en étau total où l'adversaire ne peut plus rien jouer.

Anatoly Karpov – Wolfgang Unzicker, olympiade de Nice 1974. Après 1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 d6 8.c3 O-O 9.h3 Na5 10.Bc2 c5 11.d4 Qc7 12.Nbd2 Nc6 13.d5 Nd8 14.a4 Rb8 15.axb5 axb5 16.b4 Nb7 17.Nf1 Bd7 18.Be3 Ra8 19.Qd2 Rfc8 20.Bd3 g6 21.Ng3 Bf8 22.Ra2 c4 23.Bb1 Qd8 24.Ba7 Ne8 25.Bc2 Nc7 26.Rea1 Qe7 27.Bb1 Be8 28.Ne2 Nd8, les Blancs ont environ +0,6. Karpov a eu ses imprécisions (23.Bb1 et 27.Bb1, environ 0,6 à 0,7 pion selon la sonde), mais le fou a7 est entré au cœur du camp noir et les Blancs tiennent la colonne a.

L'aile dame est bloquée. Il reste l'aile roi : Karpov va y transformer son espace en étau par f4-f5.

PRO TIP : quand une aile est bloquée, ouvre la seconde. Mais si l'adversaire bloque lui-même cette seconde aile, tes pièces y entrent sans opposition. }
29. Nh2 { Le meilleur coup. Le cavalier dégage la route du pion f. [%cal Gf2f4] }
29... Bg7 { Le fou se replace sur la grande diagonale. 29...f6 était un peu plus précis, environ 0,4 pion selon trois sondes : une imprécision. }
30. f4 { Le meilleur coup. Les Blancs attaquent e5 et gagnent de l'espace à l'aile roi. [%cal Gf4e5] }
30... f6 { Le pion f soutient e5. Une imprécision, environ 0,4 pion selon trois sondes : 30...exf4 était meilleur. }
31. f5 { Le meilleur coup. Le pion f5 bloque l'aile roi noire et menace fxg6. [%cal Gf5g6] }
31... Nf7 { LE COUP DU MOTEUR. Le cavalier vient défendre g5 et h6 et garde la possibilité de ...g5 plus tard. }
(31... g5 { La partie. Une grosse faute, environ 2,3 pions : l'aile roi est fermée pour de bon, et les cases blanches g6 et h5 deviennent des postes pour les pièces blanches. }
32. Bc2 { Un des meilleurs coups. Le fou part vers d1 et h5. Le chapitre suivant reprend ici. [%cal Gc2d1] })
32. Ng3 { Un des meilleurs coups. Le cavalier vise h5. [%cal Gg3h5] }
32... Bh6 { Le meilleur coup. Le fou noir se place sur une diagonale active. }
33. Qf2 { Le meilleur coup. La dame vise l'aile roi. }
33... Kh8 { Un des meilleurs coups. Le roi se met à l'abri en h8. }
34. h4 { Un des meilleurs coups. Le pion h prend la case g5 aux pièces noires. }
34... Bd7 { Un des meilleurs coups. }
35. Nhf1 { Un des meilleurs coups. Les Blancs ont environ +1,9.

Bilan : f4-f5 a transformé l'espace général en espace à l'aile roi. Avec 31...Nf7, les Noirs gardaient de quoi tenir. }`,
    ),
    chapter(
      "Karpov – Unzicker (Nice 1974) : l'étau qui se referme sans se presser",
      "r1rnb1k1/B1n1q1bp/3p1p2/1p1PpPp1/1Pp1P3/2P4P/R1BQN1PN/R5K1 b - - 1 32",
      `{ Suite de la partie : 31...g5? 32.Bc2. Les Blancs ont environ +4. Toutes les pièces noires sont à l'étroit : le fou a7 enferme la tour a8, le pion d5 bloque le cavalier c7, les pions f5 et g5 ferment l'aile roi.

Dans une position sans contre-jeu, l'avantage ne s'évapore pas : on peut prendre son temps. Le plan de Karpov : échanger le fou e8, seul défenseur des cases blanches, puis entrer avec la dame en g6.

PRO TIP : quand l'adversaire n'a plus de coup utile, ne te presse pas. Améliore chaque pièce, puis échange le dernier défenseur. Stockfish trouve souvent plus rapide, mais un plan sûr suffit. }
32... Bf7 { Le fou quitte e8 pour couvrir les cases blanches. 32...h5 était plus tenace, environ 0,75 pion : la position est décisive, l'écart est seulement signalé. }
33. Ng3 { Un des meilleurs coups. Le cavalier vise h5. [%cal Gg3h5] }
33... Nb7 { Un des meilleurs coups. Le cavalier d8 part en b7. }
34. Bd1 { Un des meilleurs coups. Le fou part vers h5, pour s'échanger contre le défenseur noir. [%cal Gd1h5] }
34... h6 { Le pion h avance. 34...Nd8 tenait mieux, environ 0,75 pion : l'écart est seulement signalé. }
35. Bh5 { Un des meilleurs coups. Le fou propose l'échange contre le fou f7. [%cal Gh5f7] }
35... Qe8 { La dame soutient le fou f7. 35...Bxh5 était un peu plus tenace. }
36. Qd1 { La dame vise h5 et g4. 36.Bg6 était plus précis. }
36... Nd8 { Le cavalier revient. 36...Bxh5 tenait mieux, environ 0,55 pion : l'écart est seulement signalé. }
37. Ra3 { La tour se prépare à changer de place. 37.Bxf7+ était plus précis. }
37... Kf8 { Le roi attend. 37...Bxh5 tenait un peu mieux. }
38. R1a2 { Les tours se réorganisent sur la colonne a. 38.Bg6 était plus précis. }
38... Kg8 { Le roi retourne en g8. 38...Bxh5 tenait mieux, environ 0,8 pion : l'écart est seulement signalé. }
39. Ng4 { Le cavalier vise f6 et h6. 39.Bb6 était plus direct, l'écart est seulement signalé. [%cal Gg4h6] }
39... Kf8 { Le roi revient. 39...Bxh5 tenait encore un peu mieux. }
40. Ne3 { Un des meilleurs coups. Le cavalier revient en e3, d'où il surveille f5, g4 et d5. }
40... Kg8 { Le roi retourne encore. 40...Qd7 était un peu plus tenace. }
41. Bxf7+ { LE COUP DU CHAPITRE. Le fou s'échange contre le dernier défenseur des cases blanches. 41.Bg6 était encore plus précis, l'écart est seulement signalé. [%cal Gh5f7] }
41... Nxf7 { Le meilleur coup. }
42. Qh5 { Le meilleur coup. La dame entre sur les cases blanches. [%cal Gh5g6] }
42... Nd8 { Le cavalier libère f7. 42...Qd7 ou 42...Qe7 tenaient plus longtemps, environ 0,6 pion. }
43. Qg6 { Le meilleur coup. La dame s'installe en g6, à côté du roi noir. [%csl Gg6] }
43... Kh8 { Le roi s'écarte. 43...Nb7 tenait plus longtemps, l'écart est seulement signalé. }
44. Nh5 { Un des coups gagnants. Le cavalier attaque g7 avec la dame : Unzicker a abandonné.

Bilan : l'espace s'est transformé en étau, puis l'échange du dernier défenseur a ouvert la route du roi. [%csl Gg6,Gh5] }`,
    ),
  ],
};
