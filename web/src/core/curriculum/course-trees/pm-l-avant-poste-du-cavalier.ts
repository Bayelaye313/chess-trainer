import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours « L'avant-poste du cavalier » (positional_mastery, module 1) — refonte
 * du 2026-10-09 : chaque coup joué porte son explication.
 *
 * Sources des POSITIONS et des COUPS (jamais de leur prose, réécrite ici) :
 *  - chapitres 1 à 7 : étude Lichess d'Antoine01, « L'avant-poste du Cavalier
 *    - cours Antoine01 » (https://lichess.org/study/AXtMrSMm), variantes
 *    comprises ;
 *  - chapitres 8 à 10 : parties de maîtres (Smyslov – Rudakovsky 1945,
 *    Chekhover – Rudakovsky 1945, Karpov – Kasparov 1985), coups relevés dans
 *    l'étude « 62 The Most Instructive Games of Chess ever Played »
 *    (https://lichess.org/study/w2JcfP5K) et le fichier
 *    `PILOT_pm-l-avant-poste-du-cavalier.pgn`.
 *
 * Chaque affirmation sur une position (meilleur coup, erreur, gain) a été
 * contrôlée avec Stockfish 18 (profondeur 18-20) ; les lignes signalées
 * « (Stockfish) » sont des suites moteur, pas des coups de la partie.
 */

function chapter(title: string, fen: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, fen) };
}

export const AVANT_POSTE_DU_CAVALIER: CourseTree = {
  chapters: [
    chapter(
      "Qu'est-ce qu'un avant-poste ?",
      "3bk3/p2p4/1p1p2p1/2p1p1Pp/3nP2P/2N1N3/PPP1P3/3K4 w - - 0 1",
      `{ Un avant-poste, c'est une case dans le camp adverse qui remplit deux conditions : elle est protégée par un de tes pions, et AUCUN pion adverse ne pourra jamais l'attaquer. Une pièce posée là ne peut être chassée par personne : l'adversaire n'a plus que la solution de l'échanger.

Fais le test ici, case par case. d5 : protégée par e4, et les pions noirs qui pourraient la viser (un pion en c6 ou en e6) n'existent plus — c5 et e5 ont déjà dépassé cette rangée. f6 et h6 : protégées par g5, et le pion g noir est déjà en g6, il ne reviendra jamais en g7. Les Blancs ont donc trois avant-postes (en vert).

Côté noir, d4 a l'air d'un avant-poste… mais non : c2-c3 ou e2-e3 la chasseront dès qu'ils avanceront d'un pas (flèches rouges). Le seul vrai avant-poste noir est g4 : protégée par h5, et les Blancs n'ont plus de pion f ni de pion h capable de revenir la contrôler.

PRO TIP : avant de baptiser une case « avant-poste », regarde TOUS les pions adverses qui peuvent encore l'atteindre en avançant, y compris ceux des colonnes voisines — pas seulement ceux qui lui font face. [%csl Gd5,Gf6,Gh6,Gg4,Rd4][%cal Rc2c3,Re2e3] } *`,
    ),
    chapter(
      "À quoi sert un avant-poste ?",
      "2r3k1/p2qb1pp/1p1pNr2/2pP4/2P5/1P1Q4/P5PP/4RRK1 w - - 0 1",
      `{ Le cavalier est une pièce à courte portée : il n'est fort que s'il trouve, près de l'ennemi, une case d'où on ne peut pas le chasser. C'est exactement ce qu'offre un avant-poste.

Regarde le cavalier blanc en e6. Il est protégé par le pion d5, et aucun pion noir ne pourra jamais l'attaquer : le pion d noir est bloqué en d6 et le pion f a disparu. De là, il touche c7, d8, f8 et g7 — quatre cases au cœur du camp noir — et coupe les pièces noires en deux : la dame d7 et la tour c8 ne communiquent plus avec la défense du roi. Stockfish donne d'ailleurs aux Blancs un net avantage (environ +1,5) alors que le matériel est égal.

PRO TIP : plus l'avant-poste est profond, plus il vaut cher. Un cavalier installé en 6e rangée (3e pour les Noirs) vaut souvent plus qu'une tour, parce qu'il paralyse tout ce qui l'entoure. [%csl Ge6][%cal Ge6c7,Ge6d8,Ge6f8,Ge6g7] } *`,
    ),
    chapter(
      "La force tactique d'un cavalier sur avant-poste",
      "3q1rk1/p4p1p/1p1pn1p1/3Np3/1P2P2P/P3P1P1/4QP2/2R3K1 w - - 0 1",
      `{ Deux cavaliers, deux destins : le cavalier blanc trône en d5, protégé par e4 et intouchable par les pions noirs ; le cavalier noir e6 n'a aucune case équivalente, car les pions blancs b4 et e3 lui interdisent c5, d4 et f4. Le cavalier d5 n'est pas seulement fort positionnellement : il crée des coups tactiques. Les Blancs jouent et gagnent. [%csl Gd5] }
1. Rc8! { Le coup qui exploite le cavalier. La tour se sacrifie sur c8 pour attirer la dame noire sur une case où le cavalier d5 pourra la fourchetter. La tour est attaquée par la dame d8, mais les Noirs n'ont aucun bon moyen de refuser. [%cal Gc1c8] }
1... Qxc8 { Les Noirs prennent : c'est encore le moindre mal (Stockfish). }
(1... Qd7 { Si la dame s'écarte en restant sur la diagonale… } 2. Nf6+ { …le cavalier saute en f6 avec échec et attaque en même temps la dame d7 : fourchette, la dame tombe. [%cal Gf6g8,Gf6d7] })
2. Ne7+ { Le cavalier quitte son avant-poste avec échec et vise la dame en c8 : c'est la fourchette, le motif préféré du cavalier. [%cal Ge7g8,Ge7c8] }
2... Kg7 { Le roi doit bouger, et la dame c8 est perdue. }
3. Nxc8 { Le cavalier prend la dame. }
3... Rxc8 { Bilan : les Blancs ont donné une tour et un cavalier, mais gagné la dame — environ +3 selon Stockfish, une avance décisive. Tout est parti du cavalier d5 : sans lui, le sacrifice Rc8 n'existait pas.

PRO TIP : quand ton cavalier est sur un avant-poste, cherche systématiquement les fourchettes qu'il peut donner en UN saut — elles sont souvent cachées derrière un sacrifice qui attire une pièce adverse sur la bonne case. } *`,
    ),
    chapter(
      "Créer un avant-poste : chasser le pion qui le surveille",
      "r6r/pppnk3/3p4/3Pp1pp/PPP1Pp2/5P2/1KB3PP/R4R2 b - - 0 1",
      `{ Un avant-poste n'existe pas toujours : souvent, il faut le fabriquer. Regarde la case c5. Les pions blancs d5 et b4 l'encadrent : d5 est déjà passé devant, il ne la contrôlera plus jamais, mais le pion b4 la surveille. Si ce pion b4 disparaît, c5 devient un avant-poste parfait pour le cavalier d7. Comment s'en débarrasser ? [%csl Gc5,Rb4] }
1... a5! { Le bon plan : le pion a vient défier le pion b4. Quelle que soit la réponse blanche, le pion b4 quitte son poste ou disparaît. [%cal Ga7a5,Ga5b4] }
(1... c5 { Le coup joué dans la partie est plus timide : le pion occupe lui-même la case c5, qui ne pourra donc jamais accueillir le cavalier. Stockfish préfère nettement 1...a5 (−1,3 contre −0,5). } 2. b5 { Les Blancs ferment l'aile dame : le pion b ne contrôlera plus c5, mais c5 est déjà prise par un pion noir. } (2. dxc6 { Autre option : les Blancs ouvrent la position en prenant en passant… } 2... bxc6 { …et les Noirs reprennent ; leur structure reste saine, sans avant-poste pour personne. }) 2... b6 { Le centre et l'aile dame sont bloqués : les cavaliers et les fous n'ont plus de case forte, la partie tend vers l'égalité. })
2. bxa5 { Les Blancs prennent : c'est la réponse principale de Stockfish. Mais leur pion b, gardien de c5, vient de quitter sa colonne. }
(2. b5 { Si les Blancs avancent le pion pour garder la colonne fermée… } 2... Nc5 { …le cavalier s'installe tout de suite en c5 : le pion b5 est passé devant, plus aucun pion blanc ne peut le chasser. De c5, il attaque a4 et vise b3, d3 et e4. [%csl Gc5][%cal Gc5a4] })
(2. Kb3 { Si le roi blanc vient protéger b4… } 2... axb4 { …les Noirs prennent quand même, } 3. Kxb4 { …le roi reprend, mais il ne contrôle pas c5 comme le faisait un pion : } 3... Nc5 { le cavalier y saute et ne pourra plus jamais en être délogé par un pion. })
2... Rxa5 { La tour reprend le pion et attaque déjà a4. Le pion b4 a disparu : c5 est désormais un avant-poste définitif pour le cavalier (Nd7-c5), d'où il frappera a4 en tandem avec les tours doublées sur la colonne a.

PRO TIP : pour créer un avant-poste, repère le SEUL pion adverse qui peut encore contrôler la case visée, puis attaque-le avec un pion à toi : un échange suffit souvent à le faire disparaître. [%csl Gc5,Ra4][%cal Gd7c5,Gh8a8] } *`,
    ),
    chapter(
      "Créer un avant-poste : appuyer la case avec un pion",
      "2r2b2/1p6/1pp1kp1p/3p2p1/3P4/1P2N2P/P1P1KPP1/R7 w - - 0 1",
      `{ Deuxième façon de créer un avant-poste : la case est déjà hors de portée des pions adverses, il lui manque seulement l'appui d'un de TES pions. Ici, la case f5 est un trou dans le camp noir : le pion g noir est déjà en g5 et les Noirs n'ont plus de pion e, donc aucun pion noir ne pourra jamais la contrôler. Mais aujourd'hui, aucun pion blanc ne la protège non plus. [%csl Yf5] }
1. g4! { Le pion vient protéger f5. La case devient un avant-poste permanent pour le cavalier e3, qui pourra s'y installer au moment de son choix. Bonus : le pion g4 décourage aussi ...f5, par lequel les Noirs auraient voulu boucher la case avec un pion (gxf5 suivrait). Stockfish classe ce coup parmi les meilleurs ; la position reste équilibrée, mais le plan blanc est désormais clair. [%csl Gf5][%cal Ge3f5] } *`,
    ),
    chapter(
      "Exercice : la case f6 qui décide de tout",
      "8/1p1r1nk1/1R1p2p1/P1pP4/4NPP1/2P2K2/8/8 w - - 0 43",
      `{ Trouve comment les Blancs se créent un avant-poste décisif près du roi noir. Indice : regarde la case f6 et les pions qui peuvent la contrôler. [%csl Yf6] }
43. g5! { Le pion g s'installe en g5 et protège f6. Aucun pion noir ne peut plus jamais la contrôler : le pion g noir est en g6 et les Noirs n'ont pas de pion e. f6 devient un avant-poste en 6e rangée, collé au roi noir. Stockfish : environ +5, déjà gagnant. [%csl Gf6][%cal Ge4f6] }
43... Kf8 { Le roi se rapproche du centre pour défendre e7 et e8. Plus résistant était 43...c4 (Stockfish), mais la position est perdue de toute façon. }
44. Nf6 { Le cavalier occupe l'avant-poste. Il contrôle d7, e8, g8 et h7 : le roi noir est pris dans un filet, il ne lui reste presque plus de cases. }
44... Rc7 { La tour cherche à défendre sur la 7e rangée. }
45. a6! { Une percée qui vise b7. Le pion b7 est le seul obstacle entre la tour b6 et la 8e rangée : il faut l'éliminer ou le détourner. [%cal Ga5a6,Gb6b8] }
45... bxa6 { Si les Noirs ne prennent pas, axb7 donne un pion passé décisif. Mais en prenant, ils ouvrent la colonne b. }
46. Rb8+ { La tour entre en 8e rangée avec échec. Avec le cavalier f6 qui verrouille e8 et g8, le mat n'est pas loin. }
46... Ke7 { Le roi tente de fuir par le centre. }
(46... Kg7 { Vers l'autre côté… } 47. Rg8# { …et c'est mat : la tour g8 est protégée par le cavalier f6, qui contrôle aussi h7, tandis que le pion g5 garde h6. })
47. Re8# { Mat. Compte les cases de fuite : d8 et f8 sont prises par la tour, d7 par le cavalier, e6 par le pion d5, et le cavalier f6 est protégé par g5. L'avant-poste f6 a fourni à lui seul la moitié du filet de mat.

PRO TIP : un avant-poste à côté du roi adverse n'est pas qu'un atout positionnel — il contrôle des cases de fuite et prépare des mats. } *`,
    ),
    chapter(
      "Exercice : se créer l'avant-poste d4",
      "1q1rr1k1/1p2pp1p/p2p2p1/2n5/2PQP3/5P2/PP2B1PP/2RR2K1 b - - 0 22",
      `{ Les Noirs ont un cavalier en c5 qui cherche un meilleur poste. Quelle case centrale peuvent-ils transformer en avant-poste, et avec quel coup de pion ? [%csl Yd4] }
22... e5! { Le coup clé. Le pion e5 chasse la dame d4 et, surtout, protège d4. Or aucun pion blanc ne peut plus jamais contrôler d4 : le pion c est déjà en c4 et le pion e en e4, ils ont dépassé la case. d4 devient un avant-poste de rêve. Le prix est réel — le pion d6 devient arriéré et la case d5 s'affaiblit — mais Stockfish juge la position équilibrée et le plan noir très simple. [%csl Gd4][%cal Ge5d4] }
23. Qe3 { La dame recule tout en gardant un œil sur la case d4 et sur l'aile dame. }
23... Ne6 { Le cavalier prend la route de d4 : c5-e6-d4. [%cal Ge6d4] }
24. b3 { Un coup d'attente qui protège c4 mais ne fait rien contre le plan noir. Plus précis était 24.Bf1, qui retire le fou d'une case où il sera exposé (Stockfish). }
24... Nd4 { Le cavalier atteint son avant-poste : protégé par e5, intouchable par les pions, il attaque e2, f3, c2 et b3. }
25. Qc3?? { Une grosse erreur : la dame se place sur une case que le cavalier peut atteindre avec échec. Il fallait 25.Kh1 ou 25.Bf1, avec une position tenable (Stockfish). }
25... Nxe2+ { Le cavalier prend le fou e2 AVEC échec au roi g1, tout en attaquant la dame c3 : fourchette, et les Blancs perdent une pièce entière (−5 selon Stockfish). [%cal Ge2g1,Ge2c3]

PRO TIP : un cavalier sur avant-poste est une menace tactique permanente. Avant chaque coup, vérifie toutes les cases qu'il peut atteindre en un saut — c'est là que tombent les fourchettes. } *`,
    ),
    chapter(
      "Conduire son cavalier vers l'avant-poste (1) : reculer pour mieux sauter",
      "r4rk1/3bppbp/1q4p1/np1pP3/3P4/1P2BN2/4BPPP/R2Q1RK1 w - - 0 18",
      `{ Repérer un avant-poste ne suffit pas : il faut y amener sa pièce, et le chemin le plus court n'est pas toujours tout droit. La case c5 est un avant-poste blanc : elle est protégée par d4, et les pions noirs qui pourraient la viser sont déjà passés (b5, d5). Le cavalier f3 en est loin. Quel itinéraire ? [%csl Gc5] }
18. Ne1! { Le cavalier recule… pour mieux sauter : e1-d3-c5. En deux coups il atteint l'avant-poste. Stockfish le classe parmi les deux meilleurs coups (+0,6). [%cal Gf3e1,Ge1d3,Gd3c5] }
(18. Bf4 { Le développement « naturel » ne fait rien pour la case c5, et Stockfish juge que les Blancs perdent ainsi leur avantage (environ 0,0). })
(18. b4? { Erreur typique : en chassant le cavalier a5, ce pion lui offre… } 18... Nc4 { …la case c4, que plus aucun pion blanc ne pourra contrôler puisque b3 vient de partir en b4 et que d3 n'existe plus. C'est maintenant le cavalier NOIR qui a un avant-poste. } 19. Bxc4 { Les Blancs doivent donner leur fou pour s'en débarrasser… } 19... bxc4 { …et le pion qui reprend devient un pion passé, protégé par d5 (léger avantage noir selon Stockfish). [%csl Rc4] })
18... b4 { Les Noirs gagnent de l'espace sur l'aile dame. }
19. Nd3 { Deuxième étape : le cavalier est à un saut de c5. }
19... Bb5 { Le fou noir vient contester d3 et menace d'échanger le cavalier avant qu'il arrive. }
20. Nc5 { Le cavalier est installé sur l'avant-poste, d'où il surveille b7, d7 et e6 au cœur du camp noir. Les pions noirs ne peuvent rien contre lui. [%csl Gc5] }
20... Bxe2 { Les Noirs échangent les fous. Mieux était 20...Nb7 pour contester tout de suite le cavalier (Stockfish). }
21. Qxe2 { Seul bon coup : la dame reprend le fou. Sur 21.Qd2 ou 21.Qe1, le fou noir prendrait la tour f1. }
21... Nb7? { Le cavalier vient défier c5… mais il oublie une case : d7. }
22. Nd7! { Fourchette : le cavalier attaque à la fois la dame b6 et la tour f8. Les Blancs gagnent la qualité (environ +3,8 selon Stockfish). Dans l'étude d'origine, les Blancs jouent 22.Na4, nettement moins fort. [%cal Gd7b6,Gd7f8] }
22... Qc6 { La dame s'échappe en gardant un œil sur d7. }
23. Nxf8 { Le cavalier prend la tour : la manœuvre e1-d3-c5 a rapporté une qualité.

PRO TIP : un cavalier qui recule n'est pas un cavalier passif. S'il prépare un saut vers un avant-poste, le retrait est souvent le coup le plus actif de la position. } *`,
    ),
    chapter(
      "Conduire son cavalier vers l'avant-poste (2) : le chemin le plus court",
      "r3kb1r/pp2qppp/3p4/2p1p3/2P1P3/3P4/PP3PPP/R2QK1NR w KQkq - 0 1",
      `{ La case d5 est un avant-poste parfait pour les Blancs : protégée par c4 et e4, et hors de portée des pions noirs (c5 et e5 ont dépassé la 6e rangée). Le cavalier g1 doit y aller. Par où ? [%csl Gd5] }
1. Ne2! { Le chemin le plus court : e2, c3, puis d5. Trois coups au total. C'est le meilleur coup selon Stockfish. [%cal Gg1e2,Ge2c3,Gc3d5] }
(1. Nf3?! { Ce coup naturel éloigne le cavalier de sa maison de rêve : de f3, il ne peut pas rejoindre d5 rapidement. } 1... g6 { Les Noirs préparent tranquillement le fianchetto. } 2. Nd2 { Il faut déjà corriger la trajectoire… } 2... Bh6 { …et le fou noir attaque le cavalier d2, ce qui complique encore le voyage. } 3. Nb1 { Le cavalier repart en arrière pour passer par c3. } (3. Nf1 { Autre détour, vers e3… } 3... O-O { Les Noirs roquent sans se presser. } 4. Ne3 { Le cavalier approche de d5… } 4... Bxe3 { …mais les Noirs échangent le cavalier dès qu'il approche, } 5. fxe3 { et les Blancs héritent de pions doublés en e3 et e4. }) 3... O-O { Les Noirs mettent leur roi à l'abri pendant que le cavalier fait le tour. } 4. Nc3 { Enfin sur la bonne route. } 4... Bg7 { Le fou revient sur la grande diagonale. } 5. Nd5 { Le cavalier arrive en d5, mais en cinq coups au lieu de trois. })
1... g6 { Les Noirs préparent le fianchetto de leur fou. Plus précis était 1...Qd7 (Stockfish). }
2. Nc3 { Deuxième étape. }
2... Bg7 { Le fou se développe sur la grande diagonale. }
3. Nd5 { Arrivé : le cavalier est sur l'avant-poste. Il attaque la dame e7, qui doit bouger, et menace de sauter en c7 avec échec. [%csl Gd5][%cal Gd5e7,Gd5c7] }
3... Qd8 { La dame recule en surveillant c7. }
(3... Qe6? { Si la dame va en e6… } 4. Nc7+ { …le cavalier saute en c7 avec échec et attaque à la fois le roi e8, la dame e6 et la tour a8 : la dame est perdue (environ +5 selon Stockfish). [%cal Gc7e8,Gc7e6,Gc7a8] })
(3... Qd7 { C'était la retraite la plus solide, d'après Stockfish : la dame protège c7 sans se mettre sur une case de fourchette. })
*`,
    ),
    chapter(
      "Conduire son cavalier vers l'avant-poste (3) : f5, une case pour le cavalier",
      "2r2rk1/1p3pbp/p2p1q2/P1pPn1p1/4Pn2/R1N4P/1P1N1PPB/1Q3RK1 w - - 0 21",
      `{ Les Noirs ont un cavalier menaçant en f4. Mais la case f5 est un avant-poste pour les Blancs : protégée par e4, et aucun pion noir ne peut plus la contrôler (le pion g noir est en g5 et il n'y a pas de pion e). Quel cavalier blanc peut l'atteindre, et par où ? [%csl Gf5] }
21. Nd1! { Le cavalier c3 recule pour prendre la route d1-e3-f5. De e3, il surveillera aussi g4 et d5. C'est l'un des deux meilleurs coups selon Stockfish (+0,5). [%cal Gc3d1,Gd1e3,Ge3f5] }
(21. Ne2? { Le cavalier se rapproche aussi de f5… mais sur une case attaquée : } 21... Nxe2+ { …le cavalier f4 le prend avec échec, et les Blancs perdent une pièce (−3,5). })
(21. Bxf4 { Échanger le fou contre le cavalier f4 est possible : } 21... gxf4 { mais les Blancs ont abandonné leur fou et leur avantage disparaît (0,0 selon Stockfish). })
(21. Na4 { Le cavalier vise b6, une case sans grand avenir : Stockfish juge ce coup moins bon (+0,2). })
21... g4 { Les Noirs cherchent à ouvrir l'aile roi, première réponse de Stockfish. }
22. Ne3 { Le cavalier atteint e3 : il ne lui manque plus qu'un saut pour gagner f5, d'où il contrôlera d6, e7, g7 et h6. [%cal Ge3f5]

PRO TIP : quand tu repères un avant-poste, compte les sauts nécessaires pour que CHACUN de tes cavaliers l'atteigne — le meilleur candidat est parfois le cavalier qui doit d'abord reculer. } *`,
    ),
    chapter(
      "Smyslov – Rudakovsky, URSS 1945 : chasser les défenseurs de d5",
      "r1b2rk1/ppq1bppp/2nppn2/8/3NPP2/2N1B3/PPP1B1PP/R2Q1RK1 w - - 1 10",
      `{ Une Sicilienne Scheveningen. Smyslov va appliquer une méthode en trois temps : 1) attendre que la case d5 ne puisse plus être protégée par un pion noir ; 2) éliminer une à une les PIÈCES noires qui la surveillent ; 3) y installer son cavalier, puis attaquer le roi. Garde un œil sur d5 pendant toute la partie. [%csl Yd5] }
10. Qe1 { La dame libère d1 pour la tour et prépare Qg3 ou Qh4, vers l'aile roi. Stockfish préférait 10.a4, mais le plan blanc reste cohérent. }
10... Nxd4 { Les Noirs échangent les cavaliers. Ce n'est pas une faute en soi (c'est même le choix de Stockfish), mais ce cavalier c6 aurait pu, plus tard, surveiller d4 et b4. }
11. Bxd4 { Le fou reprend et se retrouve centralisé, il vise f6 et a7. }
11... e5 { Le coup décisif sur le plan stratégique : le pion e attaque le fou d4 et gagne de l'espace, mais il quitte la colonne e. Désormais, AUCUN pion noir ne pourra jamais contrôler d5 : le pion c a disparu et le pion e vient de dépasser la 6e rangée. d5 est devenu un avant-poste pour les Blancs. [%csl Gd5] }
12. Be3 { Le fou recule sur une case solide. }
(12. fxe5 { Prendre tout de suite n'est pas meilleur : } 12... dxe5 { le pion reprend et attaque à nouveau le fou d4. } 13. Qg3 { Un piège : si 13...exd4, la diagonale g3-c7 s'ouvre et 14.Qxc7 gagne la dame. Mais les Noirs ont mieux : } 13... Bc5! { un contre-clouage. Le fou d4 est maintenant cloué sur le roi g1. } 14. Qxe5?? { Si la dame prend le pion… } 14... Qxe5 { …la dame noire la prend, et le fou d4, cloué, ne peut pas reprendre. })
12... Be6 { Le fou se développe et surveille d5. Stockfish préférait 12...Bd7 suivi de ...Bc6, qui garde le fou de cases blanches. }
13. f5! { Gain de temps : le pion attaque le fou e6, et prépare la poussée vers le roi noir (f5-f6). }
13... Bc4 { Les Noirs proposent l'échange des fous. Erreur subtile : ce fou était un des défenseurs de d5. Mieux valait 13...Bd7, qui le garde (Stockfish). }
14. Bxc4 { Smyslov accepte avec plaisir : un défenseur de d5 de moins. }
14... Qxc4 { La dame reprend et devient active (elle vise a2, c3 et e4), mais elle ne protège pas d5. }
15. Bg5! { Prochaine cible : le cavalier f6, l'autre défenseur de d5. Le fou va l'échanger et les Noirs ne peuvent rien faire contre. [%cal Gg5f6] }
15... Rfe8 { La tour libère f8 pour le fou… mais ne change rien au problème de d5. Stockfish préférait 15...Rfc8. }
16. Bxf6 { Le fou prend le cavalier. }
16... Bxf6 { Le fou e7 reprend. Les deux pièces mineures noires qui pouvaient surveiller d5 (le fou de cases blanches et le cavalier f6) ont disparu. }
17. Nd5! { Le cavalier s'installe sur l'avant-poste. Protégé par e4, intouchable par les pions, il attaque le fou f6 et contrôle c7, e7, b6 et f4. Il ne pourra jamais être chassé, seulement échangé — et les Noirs n'ont plus de cavalier ni de fou de cases blanches pour le faire. [%csl Gd5] }
17... Bd8 { Le fou recule pour rester en vie. Stockfish préférait ramasser le pion c2 avec 17...Qxc2, une meilleure chance pratique. }
(17... Qxc2 { Si la dame prend le pion… } 18. Rf2 { …la tour la chasse en gagnant un temps, } 18... Qc6 { la dame recule, } 19. Rc1 { et les tours blanches s'activent sur la colonne c. Les Blancs gardent un net avantage (+1,1), mais les Noirs ont un pion de plus pour se défendre. })
18. c3 { Le pion quitte c2, où la dame l'attaquait, contrôle b4 et d4, et prépare b3 pour chasser la dame. }
18... b5 { Les Noirs tentent un contre-jeu à l'aile dame. Stockfish préférait 18...f6, pour bloquer tout de suite le pion f5. }
19. b3 { Le pion chasse la dame de c4. Plus fort encore était 19.f6! immédiatement (Stockfish). }
19... Qc5+ { La dame s'échappe avec échec sur la diagonale c5-g1. }
20. Kh1 { Le roi s'écarte, seul bon coup. }
20... Rc8 { La tour occupe la colonne c… mais c'est hors sujet : le danger est à l'aile roi. Il fallait 20...f6 pour bloquer le pion f5. }
21. Rf3 { La tour se prépare à passer en g3 ou h3 pour l'attaque. 21.f6 tout de suite était encore plus fort. }
21... Kh8? { La faute décisive. Il fallait absolument 21...f6, qui bloque le pion et ferme les lignes. Maintenant, la percée blanche arrive. }
(21... f6 { Le meilleur coup : le pion f noir bloque le pion f5. Les Blancs gardent l'avantage avec } 22. Rh3 { suivi de Qh4 et g4-g5, mais la défense tient encore. })
22. f6! { Le sacrifice de pion qui ouvre le roi noir. Le pion attaque g7 : si les Noirs prennent, les colonnes g et la diagonale vers h7 s'ouvrent. [%cal Gf5f6] }
22... gxf6 { Les Noirs prennent, et leur roi se retrouve à découvert. 22...Bxf6 était plus tenace (Stockfish +3,7 contre +6 après la partie), mais les Blancs gagnaient aussi. }
(22... Bxf6 { Si le fou prend… } 23. Nxf6 { …le cavalier reprend en f6, } 23... gxf6 { le pion g doit reprendre, } 24. Qh4 { et l'attaque sur f6 et h7 reste écrasante. })
23. Qh4 { La dame attaque f6 et h7. Menace : Rh3, avec une attaque irrésistible sur h7. }
23... Rg8 { La tour vient sur la colonne g ouverte pour défendre g7 et h7 indirectement. }
24. Nxf6 { Le cavalier quitte l'avant-poste pour frapper : il prend le pion f6, attaque la tour g8 et menace Qxh7 mat. [%cal Gf6g8,Gh4h7] }
24... Rg7 { La tour recule et protège h7 le long de la 7e rangée. }
25. Rg3! { La tour attaque la tour g7. La pression est telle que les Noirs n'ont plus qu'une ressource : éliminer le cavalier f6. }
25... Bxf6 { Les Noirs éliminent enfin le cavalier… mais la dame reprend avec une force terrible. }
26. Qxf6 { La dame est en f6 : elle attaque la tour g7, clouée sur le roi h8, ainsi que d6 et e5. }
26... Rg8 { La tour vient doubler la défense de g7. }
27. Rd1 { La dernière pièce blanche entre en jeu. Menace : Rxd6, puis Rxg7 et Rd8+, avec mat. [%cal Gd1d6,Gd6d8] }
27... d5 { Les Noirs bloquent la colonne d, mais un dernier coup suffit. }
28. Rxg7! { Les Noirs abandonnent. Sur 28...Rxg7, 29.Rxd5 attaque la dame c5 et menace Rd8+ : 29...Qf8 30.Rd8 gagne la dame. Tout a commencé avec l'élimination des défenseurs de d5.

PRO TIP : pour occuper un avant-poste que l'adversaire défend avec des pièces, échange d'abord ces pièces une à une (fou contre fou, fou contre cavalier). Quand plus rien ne peut contester la case, ton cavalier y sera roi. } 1-0`,
    ),
    chapter(
      "Chekhover – Rudakovsky, URSS 1945 : la même méthode sur c5",
      "r1b2rk1/pp1nqppp/2p1p3/3n4/2BP4/2N1PN2/PPQ2PPP/R3K2R w KQ - 0 11",
      `{ Un Gambit Dame refusé tranquille. Cette fois, la case convoitée est c5 — mais elle n'est pas encore un avant-poste : le pion b7 noir peut toujours venir en b6 pour la contrôler. Regarde ce qui va se passer. [%csl Yc5] }
11. O-O { Les Blancs mettent leur roi à l'abri. }
11... b5? { L'erreur stratégique de la partie. Le pion b attaque le fou c4 et prépare ...Bb7, mais il quitte la 6e rangée : plus aucun pion noir ne pourra jamais contrôler c5 (le pion d a disparu, le pion b est passé en b5). c5 devient un avant-poste blanc pour toujours. Stockfish : de +0,3 à +1,9. [%csl Gc5] }
12. Be2 { Le fou recule. Plus fort était 12.Nxd5! cxd5 13.Bxb5 avec un pion de plus (Stockfish), mais Chekhover joue pour la case c5. }
12... a6 { Le pion protège b5 et prépare ...c5 pour libérer le jeu noir. Les Blancs ne lui en laisseront jamais le temps. }
13. Ne4 { Le cavalier prend la route de c5, et la dame c2 attaque maintenant le pion c6 sur la colonne c. [%cal Ge4c5,Gc2c6] }
13... Bb7 { Le fou protège c6. }
14. Ne5! { Avant d'occuper c5, les Blancs suppriment ses défenseurs. Le cavalier attaque le cavalier d7, qui protège c5, et frappe aussi c6 et f7. [%cal Ge5d7] }
14... Rac8 { La tour défend c6, attaqué deux fois. }
(14... Nxe5 { Si les Noirs échangent… } 15. dxe5 { …le pion reprend en e5 et l'autre cavalier blanc obtient un nouvel avant-poste en d6. [%csl Gd6] })
15. Nxd7 { Le cavalier e5 prend le défenseur de c5. }
15... Qxd7 { La dame reprend. Le principal défenseur de c5 a disparu. }
16. Nc5! { Le cavalier s'installe sur l'avant-poste. Protégé par d4, il attaque la dame d7, le fou b7, et les pions a6 et e6. Il paralyse toute l'aile dame noire. [%csl Gc5] }
16... Qc7 { La dame s'écarte de l'attaque du cavalier. }
17. Rfd1 { La tour soutient d4, le pion qui protège l'avant-poste. }
17... Rcd8 { La tour occupe la colonne d, derrière le cavalier d5, pour soutenir une future libération par ...e5. }
18. Rac1 { La deuxième tour vient sur la colonne c, derrière la dame : la pression sur c6 augmente. }
18... Bc8 { Le fou recule pour préparer ...e5, qui libérerait sa diagonale. }
19. Qe4! { La dame contrôle e5 et empêche la libération ...e5. Elle vise aussi h7 et le cavalier d5. [%cal Ge4e5,Ge4h7] }
19... Nf6 { Le cavalier attaque la dame. }
20. Qh4 { La dame passe à l'aile roi, d'où elle surveille le cavalier f6 et h7. }
20... Qa5 { Les Noirs cherchent un contre-jeu en attaquant le pion a2. }
21. a3 { Le pion avance sur une case protégée par b2 et contrôle b4. }
21... b4 { Les Noirs poussent quand même. }
22. a4 { Le pion évite l'échange et garde l'aile dame fermée ; le pion b4 noir devient une cible. }
22... Nd7 { Le cavalier revient pour défier enfin le cavalier c5. }
23. b3 { Le pion protège a4 et stabilise l'aile dame. }
23... Nxc5 { Les Noirs échangent le cavalier dominant. }
24. Rxc5 { La tour reprend et prend la place du cavalier sur c5 : elle attaque la dame a5 et le pion c6. L'avant-poste reste aux Blancs, même après l'échange. [%csl Gc5] }
24... Qb6 { La dame s'écarte en attaquant la tour c5. }
25. Rdc1 { Les tours se doublent sur la colonne c : c6 est sous pression constante. }
25... Bb7 { Le fou revient protéger c6. }
26. a5 { Le pion chasse la dame de b6 et la repousse loin du jeu. }
26... Qa7 { La dame est désormais hors jeu en a7. }
27. Bd3 { Le fou rejoint l'attaque : il vise h7 avec la dame h4. Stockfish préférait doubler encore sur c4 (27.R1c4). }
27... g6 { Le pion ferme la diagonale vers h7, mais affaiblit les cases noires f6 et h6. }
28. Qf6 { La dame s'installe sur la case affaiblie f6 et attaque la tour d8. }
28... Rd6 { La tour se déplace pour protéger e6 sur la 6e rangée. Stockfish préférait 28...Rd5. }
29. Qe7 { La dame entre en 7e rangée et attaque à la fois le fou b7 et la tour d6. }
29... Rfd8 { L'autre tour protège la tour d6. }
30. h4 { Le pion h avance pour ouvrir le roi noir (h5-h6). }
30... R8d7 { La tour chasse la dame de e7. }
31. Qf6 { La dame revient sur sa case forte. }
31... Qa8 { La dame tente de revenir vers le centre, mais elle est loin. }
32. Be4 { Le fou attaque c6 une troisième fois : avec les deux tours, c'est trop. }
32... Qe8 { La dame revient vers l'aile roi pour la défendre. }
33. h5 { Le pion attaque g6 : l'aile roi noire s'ouvre. }
33... Rd8 { La tour revient, mais il est trop tard. }
34. Bxc6 { Le fou prend c6 : le pion qui retenait tout tombe enfin. }
34... Bxc6 { Le fou reprend, mais l'aile roi noire est ouverte. }
35. h6 { Le pion s'installe en h6 et menace Qg7 mat : la dame en g7 serait protégée par h6. }
35... Kf8 { Le roi s'écarte pour parer le mat. 35...Qf8 résistait un peu plus longtemps (Stockfish). }
36. Rxc6 { La tour reprend le fou. }
36... Rxc6 { La tour reprend… }
37. Rxc6 { …et l'autre tour blanche reprend à son tour : les Blancs ont gagné une pièce. }
37... Rd7 { Les Noirs protègent la 7e rangée. Reprendre avec la dame (37...Qxc6) limitait les dégâts, mais tout est perdu. }
38. Rc8! { Une jolie déviation : la tour attaque la dame e8 et l'attire en c8. 38.Qg7+ était encore plus rapide (Stockfish). }
38... Qxc8 { La dame prend la tour… }
39. Qh8+ { …l'échec chasse le roi en e7, et la dame prendra c8 au coup suivant. Les Noirs abandonnent : après 39...Ke7 40.Qxc8, les Blancs ont une dame de plus.

PRO TIP : la méthode est toujours la même. Repère la case qu'un pion adverse ne peut plus contrôler, échange les pièces qui la défendent, installe ton cavalier — puis double tes tours derrière lui. } 1-0`,
    ),
    chapter(
      "Karpov – Kasparov, Moscou 1985 (16e partie) : la pieuvre en d3",
      "r1bqkb1r/1p3ppp/p1nppn2/8/2P1P3/N1N5/PP3PPP/R1BQKB1R b KQkq - 1 8",
      `{ Championnat du monde 1985. Cette fois, ce sont les NOIRS qui vont installer un cavalier au cœur du camp blanc, en d3. On l'a surnommé « la pieuvre » : de d3, ses tentacules touchent b2, c1, e1 et f2, et il va paralyser les pièces blanches pendant près de vingt coups. [%csl Yd3] }
8... d5 { Le gambit de Kasparov : un pion est sacrifié pour ouvrir le centre et activer les pièces noires. }
9. cxd5 { Les Blancs prennent. }
9... exd5 { Les Noirs reprennent : les pions c et e blancs vont bientôt disparaître, ce qui laissera d3 sans aucun pion pour la défendre. }
10. exd5 { Les Blancs gagnent le pion : ils ont maintenant un pion d isolé, mais un pion de plus. }
10... Nb4 { Le cavalier attaque d5 et a2, et regarde déjà la case d3. }
11. Be2 { Le fou se développe et couvre d3. Stockfish préférait 11.Bc4. }
11... Bc5 { Le fou se place sur la diagonale qui mène à f2. }
12. O-O { Le roi blanc se met à l'abri. }
12... O-O { Les Noirs aussi. }
13. Bf3 { Le fou protège le pion d5. }
13... Bf5 { Le fou contrôle d3 : la case est prête pour le cavalier. Aucun pion blanc ne pourra jamais la contrôler, puisque les pions c et e ont disparu — d3 est un avant-poste noir. [%csl Gd3][%cal Gf5d3] }
14. Bg5 { Le fou cloue le cavalier f6 sur la dame d8. }
14... Re8 { La tour occupe la colonne e ouverte. }
15. Qd2 { La dame se développe et surveille d3… mais elle ne peut pas y aller elle-même sans être échangée. }
15... b5 { Les Noirs gagnent de l'espace et empêchent le cavalier a3 de revenir par c4. }
16. Rad1 { La tour renforce la colonne d, derrière la dame. }
16... Nd3! { La pieuvre est en place. Protégé par le fou f5, intouchable par les pions, le cavalier attaque b2 et f2 et contrôle c1, e1 et b4 : les pièces blanches ne peuvent plus circuler sur la 1re rangée. [%csl Gd3][%cal Gd3b2,Gd3f2,Gd3e1,Gd3c1] }
17. Nab1? { Le tournant de la partie. Karpov veut ramener le cavalier vers d2 pour contester d3, mais ce cavalier devient passif en b1. Stockfish préférait 17.b4, quitte à rendre un pion pour se libérer (de −0,4 à −1,6 selon lui). }
17... h6 { Le pion chasse le fou g5. }
18. Bh4 { Le fou garde le clouage du cavalier f6. }
18... b4 { Le pion b chasse le cavalier c3, l'un des rares défenseurs blancs du centre. }
19. Na4 { Le cavalier s'exile au bord de l'échiquier, en attaquant le fou c5. }
19... Bd6 { Le fou recule sur une bonne diagonale, vers h2. }
20. Bg3 { Les Blancs proposent l'échange des fous. }
20... Rc8 { La tour occupe la colonne c ouverte. La case c1 est déjà contrôlée par le cavalier d3. }
21. b3 { Le pion protège le cavalier a4. }
21... g5! { Le pion contrôle f4 et h4, et prépare ...g4 pour chasser le fou f3, le défenseur du pion d5. }
22. Bxd6 { Les Blancs échangent les fous. }
22... Qxd6 { La dame reprend et vise d5 et h2. }
23. g3 { Le pion ferme la diagonale vers h2 et contrôle f4. }
23... Nd7 { L'autre cavalier se dirige vers e5, d'où il renforcera la pieuvre. }
24. Bg2 { Le fou se replie. }
24... Qf6 { La dame se place sur la grande diagonale et vise l'aile dame blanche. }
25. a3 { Les Blancs tentent de se libérer à l'aile dame. }
25... a5 { Les Noirs soutiennent le pion b4. }
26. axb4 { Les Blancs échangent… }
26... axb4 { …et la colonne a s'ouvre. Le pion b4 reste solide, et la pieuvre est toujours là. }
27. Qa2 { La dame prend la colonne a ouverte. }
27... Bg6 { Le fou recule en gardant la diagonale qui protège d3. Stockfish préférait 27...h5. }
28. d6 { Les Blancs rendent le pion pour activer leur jeu. }
28... g4 { Le pion s'empare de f3 et h3 et bride le fou g2. }
29. Qd2 { La dame revient : elle attaque d3, b4 et h6. }
29... Kg7 { Le roi protège le pion h6. }
30. f3 { Les Blancs tentent d'ouvrir la colonne f. Stockfish préférait 30.h3. }
30... Qxd6 { La dame reprend le pion d6 : les Noirs ont récupéré leur gambit. }
31. fxg4 { Les Blancs prennent le pion g4. }
31... Qd4+ { La dame se centralise avec échec. }
32. Kh1 { Le roi s'écarte de l'échec. }
32... Nf6 { Le cavalier vient attaquer g4 et vise e4. }
33. Rf4 { La tour attaque la dame d4 et le cavalier f6. }
33... Ne4 { Le cavalier s'interpose sur e4, coupe l'attaque de la tour sur la dame et attaque la dame d2. }
34. Qxd3 { Les Blancs éliminent enfin la pieuvre… }
34... Nf2+ { …mais l'autre cavalier donne échec en f2 et attaque à la fois la dame d3 et la tour d1. }
35. Rxf2 { La tour prend le cavalier. }
35... Bxd3 { Le fou prend la dame. Bilan : les Noirs ont donné deux cavaliers pour la dame, et leur position est écrasante. }
36. Rfd2 { La tour attaque le fou d3. }
36... Qe3 { La dame attaque la tour d2 et le pion g3, et protège le fou. }
37. Rxd3 { Les Blancs prennent le fou. }
37... Rc1! { La tour entre en 1re rangée : elle attaque le cavalier b1 et la tour d1. }
38. Nb2 { Le cavalier s'écarte en protégeant d1. }
38... Qf2 { La dame entre dans le camp blanc et vise g2 et g1 : les menaces de mat se multiplient. }
39. Nd2 { Le cavalier vient protéger f1. }
39... Rxd1+ { La tour prend la tour d1 avec échec. }
40. Nxd1 { Le cavalier reprend. }
40... Re1+ { Les Blancs abandonnent : 41.Nf1 Rxf1+ 42.Bxf1 Qxf1# est mat.

PRO TIP : un avant-poste dans le camp adverse, protégé par une pièce, peut valoir plus qu'un pion. Kasparov a sacrifié un pion pour installer sa pieuvre en d3, et elle a dominé la partie entière. } 0-1`,
    ),
  ],
};
