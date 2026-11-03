import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours d'ouverture « Écossaise et Quatre Cavaliers (avec les Noirs) » —
 * onglet Ouvertures, format « un commentaire par coup » de l'Académie, lu par
 * `CourseTreeViewer` (route `/ouvertures/scotch-four-knights-black/cours`).
 * Public visé : 1500-1800 Elo, répertoire 1.e4 e5 2.Nf3 Nc6 contre 3.d4 et
 * 3.Nc3 (fiche curatée `scotch-four-knights-black`, C47).
 *
 * ## Contenu (v2 du 2026-11-03, format Ruy Lopez v2, côté Noirs)
 *
 * 1. Fiche d'identité, tronc commun et l'Attaque Mieses (5.Nxc6 bxc6 6.e5).
 * 2. Aléatoire surprise 1 : après la Mieses, la tour en septième rangée.
 * 3. Branche B : 5.Nc3 Bb4, l'Écossaise des Quatre Cavaliers.
 * 4. Branche C : les gambits 4.c3 (Göring) et 4.Bc4.
 * 5. Branche D : 3.Nc3 Nf6 4.d4 et le Gambit de Belgrade (5.Nd5 Nb4).
 * 6. Aléatoire surprise 2 : après le Belgrade, le roi blanc perdu au centre.
 * 7. Branche E : la Glek 4.g3 (4...d5) et 4.h3.
 * 8. Anti-panique : le Gambit Halloween (4.Nxe5).
 *
 * Choix des chapitres (2026-11-03, sans base de parties) : la théorie
 * principale de l'Écossaise (4...Nf6 : 5.Nxc6 ou 5.Nc3 ; 4.c3) et des
 * Quatre Cavaliers (4.d4, 4.g3), moins ce que les autres cours couvrent
 * déjà. Le Gambit Écossais 4.Bc4 Nf6 rejoint la branche 4.d4 de
 * `op-italian-game-black` ; 3.Nc3 Nf6 4.Bb5 Nd4 rejoint la branche 4.Nc3 de
 * `op-berlin-black` ; 4.Bc4 Nxe4 rejoint l'anti-panique 4.Nc3 de
 * `op-italian-game-black` : ces trois cas ne sont que des renvois (feuilles
 * « À RETENIR »). Les branches théoriques s'arrêtent au plus tard au
 * demi-coup 27 ; les chapitres « Aléatoire surprise » prolongent avec les
 * Blancs comme camp « mou » (`_tmp-drift-w.mts`), un coup blanc sur deux
 * perdant 0.55 à 1.1 pion au moteur.
 *
 * Convention côté Noirs (comme `op-caro-kann.ts`) : l'élève joue les Noirs ;
 * les fautes sont des coups BLANCS qui portent les 3 indices `[%hint]` +
 * `[%hintcsl]`, le coup noir suivant est la punition. Les « variantes
 * piégées » sont des coups noirs tentants mais perdants (dont 9...Bxd6??
 * 10.Qxf7# dans le Halloween). Une faute qui perd moins de 0.5 devient une
 * « imprécision » sans indices. Les évaluations restent au point de vue des
 * Blancs.
 *
 * Sources : théorie établie de l'Écossaise et des Quatre Cavaliers, TOUTES
 * les lignes arbitrées par Stockfish 19 natif (profondeur 16, MultiPV 1) ;
 * 11...Bd6 (au lieu du classique 11...Be7) dans l'Écossaise des Quatre
 * Cavaliers est le choix du moteur. Toute la prose est originale.
 *
 ## Architecture technique des nœuds
 *
 * Chaque nœud (`ChessMoveNode`, `core/chess/move-tree.ts`) porte :
 * - `evaluationScore` / `evaluationMate` : évaluation Stockfish 19 de la
 *   position après le coup (profondeur 16, point de vue Blancs), écrite
 *   `[%eval x]` ; `showEvalBar` est vrai dès qu'elle est posée ;
 * - `freeze` : posé par la balise `[%txt "…"]` qui enveloppe CHAQUE
 *   commentaire ; en mode « Jouer les coups », l'ordinateur attend
 *   « Suivant » ou Espace avant de répondre ;
 * - `hints` / `hintHighlights` : `[%hint "…"]` (3 indices progressifs) et
 *   `[%hintcsl …]` sur les fautes blanches qu'il faut punir.
 *
 * Fichier GÉNÉRÉ : ne pas l'éditer à la main. Source commentée :
 * `scripts/opening-course-src/scotch-four-knights-black.pgn` (et l'en-tête
 * `scotch-four-knights-black.header.txt`) ; regénérer avec
 * `node --import tsx scripts/_tmp-build-opening-course.mts <source> <en-tête> <sortie> 16`
 * (Stockfish natif, voir `scripts/_tmp-sf-native.mts` ; sous Linux,
 * `SF_BIN=<chemin du binaire>`). Les `[%eval]` viennent du moteur, pas de la
 * main. Étape standard :
 * `scripts/_tmp-check-cited-evals.mts op-scotch-four-knights-black` doit
 * sortir 0 écart (un chiffre n'est cité dans un commentaire que s'il est
 * l'éval d'un nœud). Règles de l'utilisateur : SAN en texte brut uniquement
 * (jamais de figurine Unicode), pas de guillemet droit dans un `[%txt]`.
 */

function chapter(title: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, START) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const OP_SCOTCH_FOUR_KNIGHTS_BLACK: CourseTree = {
  chapters: [
    chapter(
      "Fiche d'identité, tronc commun et l'Attaque Mieses (4...Nf6 5.Nxc6 bxc6 6.e5)",
      `{ [%txt "L'ÉCOSSAISE ET LES QUATRE CAVALIERS, AVEC LES NOIRS.

Le vrai enjeu : après 1.e4 e5 2.Nf3 Nc6, les Blancs ont deux façons d'éviter nos Deux Cavaliers et notre Berlinoise. 3.d4 ouvre le centre tout de suite (l'Écossaise, chapitres 1 à 4) ; 3.Nc3 développe d'abord (les Quatre Cavaliers, chapitres 5 à 8). Notre réponse est toujours la même idée : développer le cavalier f6 contre e4, puis frapper le centre avec ...d5.

Le déséquilibre recherché : dans l'Écossaise, les Blancs échangent souvent en c6 et nous laissent des pions c doublés. En échange, la colonne b s'ouvre, nos fous sortent vite et le pion d5 arrive au centre.

Pourquoi ces chapitres : pas de base de parties ici, donc le choix suit la théorie principale et ce que tes autres cours ne couvrent pas encore. Le Gambit Écossais 4.Bc4 rejoint la branche 4.d4 du cours Deux Cavaliers ; 3.Nc3 Nf6 4.Bb5 rejoint la branche 4.Nc3 du cours Berlinoise ; 4.Bc4 Nxe4 rejoint l'anti-panique du cours Deux Cavaliers. Ce cours traite donc la Mieses, l'Écossaise des Quatre Cavaliers, le Göring 4.c3, le Gambit de Belgrade, la Glek 4.g3 et le Gambit Halloween.

Les structures types :
- Mieses (ce chapitre) : pions noirs a7-c6-c7-d7, f7-g6-h7 ; pion blanc e5 avancé, chaîne b3-c4.
- Écossaise des Quatre Cavaliers : duo noir c6-d5 contre une majorité blanche à l'aile roi.
- Belgrade et Glek : centre ouvert, nos pièces actives, finales confortables.

Règle d'or : chaque coup noir a un rôle précis, dessiné par une flèche ou une case."] [%eval 0.39] }
1. e4 { [%txt "Les Blancs occupent le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie : on conteste le centre."] [%eval 0.36] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.32] }
2... Nc6 { [%txt "Le cavalier défend e5."] [%eval 0.31] [%cal Gc6e5] }
3. d4 { [%txt "L'ÉCOSSAISE : les Blancs attaquent e5 une deuxième fois et ouvrent le centre. (3.Nc3 : chapitres 5 à 8.)"] [%eval 0.04] }
3... exd4 { [%txt "On prend : défendre e5 par ...d6 serait passif."] [%eval 0.08] [%cal Ge5d4] }
4. Nxd4 { [%txt "Le cavalier reprend et se centralise. (4.c3 et 4.Bc4 : chapitre 4.)"] [%eval 0.07] }
4... Nf6 { [%txt "On se développe en attaquant e4 : c'est notre réponse dans tout le cours."] [%eval 0.06] [%cal Gf6e4] }
5. Nxc6 { [%txt "Les Blancs échangent pour nous doubler les pions c. (5.Nc3 : chapitre 3.)"] [%eval 0.08] }
5... bxc6 { [%txt "On reprend vers le centre : la colonne b s'ouvre pour notre tour, et ...d5 viendra."] [%eval 0.03] [%cal Ga8b8] }
(5... dxc6 { [%txt "UNE IMPRÉCISION : cette reprise ouvre la colonne d, et les dames s'échangent avec échec. L'évaluation passe de +0.08 à +0.50."] [%eval 0.50] [%csl Rd8] }
  6. Qxd8+ { [%txt "Notre roi doit reprendre et perd le roque. À RETENIR.

PRO TIP : +0.46. Reprends toujours vers le centre avec le pion b : il fait plus de travail en c6 que le pion d."] [%eval 0.46] })
6. e5 { [%txt "L'ATTAQUE MIESES : le pion chasse le cavalier f6 avec gain de temps."] [%eval 0.09] }
(6. Bd3 { [%txt "Le développement calme : le fou défend e4."] [%eval 0.01] }
  6... d5 { [%txt "Le levier central, tout de suite."] [%eval 0.06] [%cal Gd5e4] }
  7. Nc3 { [%txt "Les Blancs défendent e4."] [%eval 0.06] }
  7... Bb4 { [%txt "À RETENIR.

PRO TIP : +0.12. Le fou cloue le cavalier c3, défenseur de e4. C'est la structure du chapitre 3 : ...bxc6 est déjà joué, ...O-O et ...dxe4 suivront."] [%eval 0.12] [%cal Gb4c3] })
6... Qe7 { [%txt "LE COUP CLÉ : la dame cloue le pion e5 sur le roi e1. Si le pion prenait en f6, notre dame donnerait échec : exf6 est illégal."] [%eval 0.00] [%cal Ge7e1] }
7. Qe2 { [%txt "La dame se met en face de la nôtre et décloue le pion e5."] [%eval 0.02] }
(7. Bf4 { [%txt "Le fou défend e5, mais le pion b2 perd son défenseur : l'évaluation passe de 0.00 à -0.87."] [%hint "les Blancs défendent e5 avec le fou c1 au lieu de la dame : l'aile dame blanche reste sans gardien."] [%hint "le fou f4 et le pion b2. Notre cavalier peut chasser le fou depuis d5, puis notre dame frappe b2 avec échec."] [%hint "7...Nd5 : le cavalier attaque le fou f4, puis ...Qb4+ vise b2."] [%hintcsl Rf4,Rb2,Gd5] [%eval -0.87] }
  7... Nd5 { [%txt "Le cavalier attaque le fou f4."] [%eval -0.70] [%cal Gd5f4] }
  8. Bg3 { [%txt "Le fou recule."] [%eval -0.76] }
  8... Qb4+ { [%txt "Échec, et la dame attaque b2."] [%eval -0.76] [%cal Gb4b2,Gb4e1] }
  9. Nd2 { [%txt "Le cavalier s'interpose."] [%eval -0.86] }
  9... Qxb2 { [%txt "À RETENIR.

PRO TIP : -0.78. Un pion de plus et la dame active. Quand le fou c1 quitte l'aile dame, b2 est sans défense : ...Qb4+ est la fourchette type de l'Écossaise."] [%eval -0.78] [%csl Gb2] })
7... Nd5 { [%txt "Le cavalier saute au centre : il attaque c3 et f4, et la dame e7 garde l'œil sur e5."] [%eval -0.02] [%csl Gd5] }
8. c4 { [%txt "Le pion chasse le cavalier."] [%eval 0.00] }
8... Ba6 { [%txt "Le fou cloue le pion c4 sur la dame e2 : si cxd5, notre fou prend la dame. Le cavalier d5 reste donc en place."] [%eval 0.00] [%cal Ga6e2] }
(8... g6 { [%txt "LA VARIANTE PIÉGÉE : on prépare le fianchetto, en oubliant le cavalier d5…"] [%eval 3.99] [%csl Rd5] }
  9. cxd5 { [%txt "…le pion le prend : sans le clouage ...Ba6, rien ne le retient. À RETENIR.

PRO TIP : +4.18, une pièce de moins. Dans la Mieses, ...Ba6 vient avant tout autre coup : c'est lui qui tient le cavalier d5."] [%eval 4.18] })
9. b3 { [%txt "Le pion défend c4 : le clouage ne gagne plus rien, mais le fou a6 reste actif."] [%eval -0.08] }
9... g6 { [%txt "Le fianchetto : le fou ira en g7 attaquer e5."] [%eval -0.01] [%csl Gg7] }
10. Bb2 { [%txt "Le fou défend e5."] [%eval -0.01] }
10... Bg7 { [%txt "Le fou attaque e5 une deuxième fois."] [%eval 0.07] [%cal Gg7e5] }
11. g3 { [%txt "Les Blancs préparent Bg2 contre le cavalier d5 et le pion c6."] [%eval -0.04] }
(11. Nc3 { [%txt "Le développement naturel, mais la case f4 n'est plus surveillée : l'évaluation passe de +0.07 à -0.59."] [%hint "le cavalier sort sans regarder la case f4, que plus aucun pion ni fou blanc ne défend."] [%hint "la case f4. Notre cavalier y attaque la dame e2, puis le pion e5 tombe."] [%hint "11...Nf4 : le cavalier chasse la dame, puis ...Qxe5."] [%hintcsl Gf4,Re5] [%eval -0.59] }
  11... Nf4 { [%txt "Le cavalier attaque la dame."] [%eval -0.58] [%cal Gf4e2] }
  12. Qe3 { [%txt "La dame recule."] [%eval -0.67] }
  12... Qxe5 { [%txt "On prend e5 : trois pièces le visaient."] [%eval -0.67] [%cal Ge7e5] }
  13. Qxe5+ { [%txt "Les Blancs échangent avec échec."] [%eval -0.59] }
  13... Bxe5 { [%txt "À RETENIR.

PRO TIP : -0.62. Un pion de plus et le fou e5 vise b2 et c3. Contre Nc3, pense au saut ...Nf4 : la case n'a plus de gardien."] [%eval -0.62] [%cal Ge5b2] })
11... O-O-O { [%txt "Le grand roque : la tour d8 rejoint le jeu et le roi quitte la colonne e."] [%eval 0.05] [%csl Gc8] }
12. Bg2 { [%txt "Le fou vise le cavalier d5 et le pion c6."] [%eval -0.19] }
12... Rhe8 { [%txt "La tour prend la colonne e : e5 est attaqué trois fois."] [%eval -0.11] [%cal Ge8e5] }
13. O-O { [%txt "Les Blancs roquent."] [%eval -0.30] }
(13. f4 { [%txt "Le pion soutient e5, mais le roi blanc est encore en e1 : l'évaluation passe de -0.11 à -1.33."] [%hint "les Blancs poussent un pion devant leur roi encore au centre au lieu de roquer."] [%hint "le pion e5 et la colonne e. Notre pion f peut frapper e5, et la colonne e mène au roi e1."] [%hint "13...f6 : le levier contre e5, avec le roi blanc sur la colonne e."] [%hintcsl Re5,Re1] [%eval -1.33] }
  13... f6 { [%txt "À RETENIR.

PRO TIP : -1.11. Le levier ...f6 ouvre la colonne de notre tour e8 vers le roi e1. Contre f4 sans roque, frappe le pion e5 avec un pion."] [%eval -1.11] [%cal Gf6e5,Ge8e1] })
13... Bxe5 { [%txt "LA POINTE : le fou prend e5. Si les Blancs prennent tout (14.Qxe5 Qxe5 15.Bxe5 Rxe5 16.cxd5), notre fou a6 prend la tour f1 : le matériel s'équilibre.

À RETENIR.

PRO TIP : la feuille de route après la théorie (-0.26).
1. La suite forcée simplifie : nos tours deviennent les pièces les plus actives.
2. ...cxd5 puis ...Re3 ou ...Re2 : la tour entre dans le camp blanc.
3. Le roi noir se rapproche du centre par b7 et c6 dès que les dames ont quitté l'échiquier."] [%eval -0.26] [%cal Gg7e5] } *`,
    ),
    chapter(
      "Aléatoire surprise 1 : après la Mieses, la tour en septième rangée",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le chapitre 1 jusqu'à 13...Bxe5. Après les échanges forcés, il reste une finale de tours et de pièces mineures. Les Blancs ne font pas de gaffe : ils placent leurs pièces au bord pendant que notre tour entre en septième rangée. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case ou la rangée faible (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quelle rangée n'est plus défendue ? 3. Comment notre tour peut-elle y entrer ?"] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.32] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.31] [%cal Gc6e5] }
3. d4 { [%txt "L'Écossaise."] [%eval 0.04] }
3... exd4 { [%txt "On prend."] [%eval 0.08] [%cal Ge5d4] }
4. Nxd4 { [%txt "Reprise."] [%eval 0.07] }
4... Nf6 { [%txt "Contre e4."] [%eval 0.06] [%cal Gf6e4] }
5. Nxc6 { [%txt "Échange."] [%eval 0.08] }
5... bxc6 { [%txt "Vers le centre."] [%eval 0.03] [%cal Ga8b8] }
6. e5 { [%txt "La Mieses."] [%eval 0.09] }
6... Qe7 { [%txt "Le clouage."] [%eval 0.00] [%cal Ge7e1] }
7. Qe2 { [%txt "Décloue."] [%eval 0.02] }
7... Nd5 { [%txt "Centralisation."] [%eval -0.02] [%csl Gd5] }
8. c4 { [%txt "Le pion chasse."] [%eval 0.00] }
8... Ba6 { [%txt "Le clouage de c4."] [%eval 0.00] [%cal Ga6e2] }
9. b3 { [%txt "Défense de c4."] [%eval -0.08] }
9... g6 { [%txt "Fianchetto."] [%eval -0.01] [%csl Gg7] }
10. Bb2 { [%txt "Défense de e5."] [%eval -0.01] }
10... Bg7 { [%txt "Contre e5."] [%eval 0.07] [%cal Gg7e5] }
11. g3 { [%txt "Préparation de Bg2."] [%eval -0.04] }
11... O-O-O { [%txt "Grand roque."] [%eval 0.05] [%csl Gc8] }
12. Bg2 { [%txt "Contre d5."] [%eval -0.19] }
12... Rhe8 { [%txt "La colonne e."] [%eval -0.11] [%cal Ge8e5] }
13. O-O { [%txt "Roque."] [%eval -0.30] }
13... Bxe5 { [%txt "Fin de la théorie : la pointe."] [%eval -0.26] [%cal Gg7e5] }
14. Qxe5 { [%txt "La dame prend le fou."] [%eval -0.29] }
14... Qxe5 { [%txt "On reprend."] [%eval -0.37] [%cal Ge7e5] }
15. Bxe5 { [%txt "Le fou reprend."] [%eval -0.39] }
15... Rxe5 { [%txt "La tour reprend."] [%eval -0.36] [%cal Ge8e5] }
16. cxd5 { [%txt "Le pion prend le cavalier."] [%eval -0.36] }
16... Bxf1 { [%txt "Le fou prend la tour."] [%eval -0.34] [%cal Ga6f1] }
17. Kxf1 { [%txt "Le roi reprend : le matériel est égal."] [%eval -0.21] }
17... cxd5 { [%txt "On reprend : le pion d5 contrôle c4 et e4."] [%eval 0.12] [%csl Gd5] }
18. f4 { [%txt "Le pion chasse notre tour, mais il affaiblit la troisième rangée : l'évaluation passe de +0.12 à -0.88."] [%hint "les Blancs chassent la tour avec un pion au lieu de développer le cavalier b1."] [%hint "la case e3. De là, notre tour attaque les pions b3 et g3 et prépare l'entrée en d2."] [%hint "18...Re3 : la tour s'installe sur la troisième rangée."] [%hintcsl Ge3,Rb3,Rg3] [%eval -0.88] }
18... Re3 { [%txt "La tour reste active sur la troisième rangée."] [%eval -0.93] [%cal Ge3g3] }
(18... Re4 { [%txt "LA VARIANTE PIÉGÉE : la tour se place au centre…"] [%eval 3.06] [%csl Re4] }
  19. Bxe4 { [%txt "…mais le fou g2 la prend : la case e4 était sur sa diagonale. À RETENIR.

PRO TIP : +2.98, la qualité perdue. Avant de poser une tour au centre, regarde les diagonales des fous adverses."] [%eval 2.98] })
19. Na3 { [%txt "Le cavalier sort par le bord, d'où il ne surveille pas la case d2."] [%eval -1.11] }
19... Rd3 { [%txt "La tour prépare l'entrée en d2."] [%eval -0.89] [%cal Gd3d2] }
20. Rc1 { [%txt "La tour blanche s'active sur la colonne c."] [%eval -0.85] }
20... Rd2 { [%txt "La tour entre en septième rangée : a2 et h2 sont attaqués."] [%eval -0.84] [%cal Gd2a2,Gd2h2] }
21. Nb1 { [%txt "Le cavalier attaque la tour, mais il abandonne a2 : l'évaluation passe de -0.84 à -1.45."] [%hint "le cavalier chasse la tour au lieu de défendre la deuxième rangée."] [%hint "le pion a2. Il n'est plus défendu par rien, et notre tour est attaquée."] [%hint "21...Rxa2 : la tour s'échappe en prenant un pion."] [%hintcsl Ra2,Gd2] [%eval -1.45] }
21... Rxa2 { [%txt "La tour prend a2 en s'échappant."] [%eval -1.09] [%cal Gd2a2] }
22. Nc3 { [%txt "Le cavalier attaque la tour."] [%eval -1.23] }
22... Rb2 { [%txt "À RETENIR.

PRO TIP : -1.30, un pion de plus, et la tour attaque b3. La leçon : dans les finales de la Mieses, la tour qui entre en septième rangée ramasse les pions que les pièces blanches ont laissés seuls."] [%eval -1.30] [%cal Gb2b3] } *`,
    ),
    chapter(
      "Branche B : 5.Nc3 Bb4, l'Écossaise des Quatre Cavaliers",
      `{ [%txt "L'ÉCOSSAISE DES QUATRE CAVALIERS.

Après 4...Nf6, les Blancs défendent e4 par 5.Nc3. On arrive aussi ici par 3.Nc3 Nf6 4.d4 exd4 5.Nxd4. Notre plan : ...Bb4 cloue le cavalier c3, défenseur de e4 ; après 6.Nxc6 bxc6 7.Bd3, le levier ...d5 libère tout notre jeu. C'est la position que tu connais avec les Blancs dans ton cours Écossaise : ici, on la voit de l'autre côté."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.32] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.31] [%cal Gc6e5] }
3. d4 { [%txt "L'Écossaise."] [%eval 0.04] }
3... exd4 { [%txt "On prend."] [%eval 0.08] [%cal Ge5d4] }
4. Nxd4 { [%txt "Reprise."] [%eval 0.07] }
4... Nf6 { [%txt "Contre e4."] [%eval 0.06] [%cal Gf6e4] }
5. Nc3 { [%txt "Le cavalier défend e4."] [%eval 0.13] }
5... Bb4 { [%txt "Le fou cloue le cavalier c3 : e4 est de nouveau menacé."] [%eval 0.14] [%cal Gb4c3,Gf6e4] }
6. Nxc6 { [%txt "Les Blancs échangent avant de défendre e4."] [%eval 0.14] }
(6. Be2 { [%txt "Un développement naturel qui oublie e4 : l'évaluation passe de +0.14 à -1.00."] [%hint "les Blancs se développent sans voir que le cavalier c3 est cloué."] [%hint "le pion e4. Son seul défenseur, le cavalier c3, ne peut pas bouger."] [%hint "6...Nxe4 : on prend le pion."] [%hintcsl Re4,Rc3] [%eval -1.00] }
  6... Nxe4 { [%txt "On prend le pion."] [%eval -0.81] [%cal Gf6e4] }
  7. Qd3 { [%txt "La dame attaque le cavalier e4."] [%eval -0.95] }
  7... Nxc3 { [%txt "On échange."] [%eval -0.98] [%cal Ge4c3] }
  8. bxc3 { [%txt "Le pion reprend."] [%eval -0.92] }
  8... Be7 { [%txt "À RETENIR.

PRO TIP : -0.95. Un pion de plus, et les pions blancs de l'aile dame sont brisés. Tant que le cavalier c3 est cloué, e4 n'a pas de vrai défenseur."] [%eval -0.95] [%csl Ge7] })
(6. a3 { [%txt "Les Blancs chassent le fou, mais cela échange le défenseur de e4 : l'évaluation passe de +0.14 à -0.48."] [%hint "les Blancs questionnent le fou au lieu de régler la menace sur e4."] [%hint "le cavalier c3. Après l'échange en c3, plus rien ne défend e4."] [%hint "6...Bxc3+ 7.bxc3 Nxe4 : on prend le pion."] [%hintcsl Rc3,Re4] [%eval -0.48] }
  6... Bxc3+ { [%txt "On échange avec échec."] [%eval -0.52] [%cal Gb4c3] }
  7. bxc3 { [%txt "Le pion reprend."] [%eval -0.40] }
  7... Nxe4 { [%txt "On prend e4."] [%eval -0.44] [%cal Gf6e4] }
  8. Nxc6 { [%txt "Les Blancs échangent."] [%eval -0.67] }
  8... dxc6 { [%txt "On reprend : les dames vont s'échanger."] [%eval -0.73] [%cal Gd8d1] }
  9. Qxd8+ { [%txt "Échange des dames."] [%eval -0.72] }
  9... Kxd8 { [%txt "À RETENIR.

PRO TIP : -0.66. Un pion de plus dans la finale, et les pions blancs c sont doublés. Contre a3, l'échange en c3 enlève le défenseur de e4."] [%eval -0.66] [%csl Gd8] })
6... bxc6 { [%txt "On reprend vers le centre : ...d5 suivra."] [%eval 0.12] [%cal Ga8b8] }
(6... Nxe4 { [%txt "LA VARIANTE PIÉGÉE : on prend e4 tout de suite…"] [%eval 8.62] [%csl Rd8] }
  7. Nxd8 { [%txt "…mais le cavalier c6 prend notre dame. À RETENIR.

PRO TIP : +8.81. Reprends d'abord en c6 : un cavalier ennemi en c6 attaque toujours la dame d8."] [%eval 8.81] })
7. Bd3 { [%txt "Le fou défend e4."] [%eval 0.07] }
7... d5 { [%txt "LE LEVIER : on ouvre le centre."] [%eval 0.10] [%cal Gd5e4] }
8. exd5 { [%txt "Les Blancs prennent."] [%eval 0.08] }
(8. Qf3 { [%txt "La dame défend e4, mais elle s'expose au fou c8 : l'évaluation passe de +0.10 à -1.12."] [%hint "la dame sort trop tôt sur une case qu'un de nos fous peut attaquer."] [%hint "la dame f3. Notre fou c8 l'attaque en g4 avec gain de temps."] [%hint "8...Bg4 : le fou chasse la dame."] [%hintcsl Rf3,Gg4] [%eval -1.12] }
  8... Bg4 { [%txt "Le fou attaque la dame."] [%eval -1.13] [%cal Gg4f3] }
  9. Qf4 { [%txt "La dame s'échappe."] [%eval -1.15] }
  9... dxe4 { [%txt "À RETENIR.

PRO TIP : -1.09. Le fou d3 est attaqué et e4 est tombé. Contre une dame sortie tôt, développe tes fous avec gain de temps."] [%eval -1.09] [%cal Ge4d3] })
8... cxd5 { [%txt "On reprend : le duo c6-d5 devient c7-d5, avec la colonne b ouverte."] [%eval 0.09] [%csl Gd5] }
9. O-O { [%txt "Les Blancs roquent."] [%eval 0.11] }
9... O-O { [%txt "Nous aussi."] [%eval 0.12] [%csl Gg8] }
10. Bg5 { [%txt "Le fou cloue le cavalier f6, défenseur de d5."] [%eval -0.01] }
10... c6 { [%txt "On consolide d5 avant que Bxf6 ne supprime son défenseur."] [%eval 0.08] [%cal Gc6d5] }
11. Qf3 { [%txt "La dame vise f6 et d5."] [%eval 0.08] }
11... Bd6 { [%txt "Le fou revient protéger le roque et vise h2."] [%eval 0.06] [%cal Gd6h2] }
12. h3 { [%txt "Les Blancs empêchent ...Bg4."] [%eval 0.05] }
12... Rb8 { [%txt "La tour prend la colonne b ouverte, contre b2."] [%eval 0.18] [%cal Gb8b2] }
13. b3 { [%txt "Le pion défend b2 par l'avance."] [%eval 0.16] }
13... h6 { [%txt "On chasse le fou g5.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.14).
1. ...Re8 et ...Be6 : nos pièces prennent la colonne e et protègent d5.
2. ...c5 puis ...c4 ou ...d4 : le duo central devient mobile.
3. Ne crains pas Bxf6 : après ...Qxf6, la finale avec la paire de fous est confortable."] [%eval 0.14] [%cal Gh6g5] } *`,
    ),
    chapter(
      "Branche C : les gambits 4.c3 (Göring) et 4.Bc4",
      `{ [%txt "LES GAMBITS : 4.c3 ET 4.Bc4.

Au lieu de reprendre en d4, les Blancs offrent un pion. Contre 4.c3, on rend le pion tout de suite avec 4...d5 : la dame reprend en d5 au centre, et ...Bg4 puis ...Bb4+ gênent le développement blanc. Contre 4.Bc4, 4...Nf6 rejoint la branche 4.d4 de ton cours Deux Cavaliers."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.32] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.31] [%cal Gc6e5] }
3. d4 { [%txt "L'Écossaise."] [%eval 0.04] }
3... exd4 { [%txt "On prend."] [%eval 0.08] [%cal Ge5d4] }
4. c3 { [%txt "LE GAMBIT GÖRING : les Blancs offrent le pion d4."] [%eval -0.20] }
(4. Bc4 { [%txt "Le Gambit Écossais : le fou vise f7."] [%eval -0.04] }
  4... Nf6 { [%txt "À RETENIR.

PRO TIP : +0.03. On contre-attaque e4 : c'est exactement la position des Deux Cavaliers après 4.d4 exd4. Même plan : contre 5.O-O, ...Nxe4 puis ...d5 ; contre 5.e5, ...d5."] [%eval 0.03] [%cal Gf6e4] })
4... d5 { [%txt "On rend le pion au bon moment : le centre s'ouvre pendant que les Blancs ne sont pas développés."] [%eval -0.09] [%cal Gd5e4] }
5. exd5 { [%txt "Les Blancs prennent."] [%eval -0.06] }
5... Qxd5 { [%txt "La dame reprend au centre : aucun cavalier blanc ne peut la chasser tout de suite."] [%eval -0.09] [%csl Gd5] }
6. cxd4 { [%txt "Les Blancs reprennent le pion d4."] [%eval 0.00] }
(6. Nxd4 { [%txt "Le cavalier reprend, mais le pion c3 ne sert plus à rien : l'évaluation passe de -0.09 à -1.04."] [%hint "les Blancs reprennent avec le cavalier, et le gambit c3 devient un coup perdu."] [%hint "le développement. Notre cavalier f6 et notre fou c5 sortent avec menace contre d4."] [%hint "6...Nf6 : on se développe, puis ...Bc5 contre d4."] [%hintcsl Gf6,Gc5] [%eval -1.04] }
  6... Nf6 { [%txt "On se développe."] [%eval -0.93] [%cal Gf6e4] }
  7. Be3 { [%txt "Le fou défend d4."] [%eval -0.93] }
  7... Bc5 { [%txt "Le fou attaque d4 une deuxième fois."] [%eval -0.71] [%cal Gc5d4] }
  8. Nxc6 { [%txt "Les Blancs échangent."] [%eval -0.72] }
  8... Qxc6 { [%txt "La dame reprend."] [%eval -0.65] [%cal Gd5c6] }
  9. Bxc5 { [%txt "Les Blancs échangent les fous."] [%eval -0.48] }
  9... Qxc5 { [%txt "À RETENIR.

PRO TIP : -0.46. Deux pièces développées de plus et le roque prêt. Contre le Göring, si les Blancs reprennent avec le cavalier, ils ont perdu un temps avec c3."] [%eval -0.46] [%cal Gc5f2] })
6... Bg4 { [%txt "Le fou cloue le cavalier f3, défenseur de d4."] [%eval 0.01] [%cal Gg4f3,Gf3d4] }
7. Be2 { [%txt "Le fou rompt le clouage."] [%eval 0.00] }
(7. Bd3 { [%txt "Le fou se développe, mais le clouage reste : l'évaluation passe de +0.01 à -2.35."] [%hint "le fou se développe sans rompre le clouage du cavalier f3."] [%hint "le pion d4. Son défenseur, le cavalier f3, peut être échangé, puis notre cavalier prend d4."] [%hint "7...Bxf3 8.Qxf3 Qxf3 9.gxf3 Nxd4 : on gagne le pion d4."] [%hintcsl Rd4,Rf3] [%eval -2.35] }
  7... Bxf3 { [%txt "On échange le défenseur de d4."] [%eval -2.54] [%cal Gg4f3] }
  8. Qxf3 { [%txt "La dame reprend."] [%eval -2.63] }
  8... Qxf3 { [%txt "On échange les dames."] [%eval -2.39] [%cal Gd5f3] }
  9. gxf3 { [%txt "Le pion reprend : la structure blanche est brisée."] [%eval -2.51] }
  9... Nxd4 { [%txt "À RETENIR.

PRO TIP : -2.48. Un pion de plus et des pions f blancs doublés. Quand le défenseur d'un pion est cloué, échange-le puis prends le pion."] [%eval -2.48] [%cal Gc6d4] })
7... Bb4+ { [%txt "Échec : le cavalier b1 doit venir en c3, sous la dame."] [%eval 0.00] [%cal Gb4e1] }
8. Nc3 { [%txt "Le cavalier s'interpose."] [%eval 0.02] }
8... Bxf3 { [%txt "On échange le cavalier f3 : le fou e2 doit reprendre."] [%eval 0.02] [%cal Gg4f3] }
9. Bxf3 { [%txt "Le fou reprend et attaque notre dame."] [%eval 0.01] }
9... Qc4 { [%txt "La dame s'échappe et attaque d4 : les Blancs ne peuvent pas roquer."] [%eval 0.00] [%cal Gc4d4] }
(9... Bxc3+ { [%txt "LA VARIANTE PIÉGÉE : on échange d'abord en c3…"] [%eval 2.43] [%csl Rd5] }
  10. bxc3 { [%txt "…mais la dame d5 est toujours attaquée par le fou f3, et le cavalier c6 est cloué. À RETENIR.

PRO TIP : +2.33. Avant d'échanger, regarde ce qui attaque ta dame : ici, le fou f3."] [%eval 2.33] })
10. Bxc6+ { [%txt "Les Blancs échangent avec échec."] [%eval -0.14] }
(10. Bf4 { [%txt "Le fou se développe, mais d4 n'a plus de défenseur : l'évaluation passe de 0.00 à -0.67."] [%hint "les Blancs développent le fou c1 sans défendre le pion d4."] [%hint "le pion d4. Notre cavalier c6 le prend : il est attaqué deux fois et défendu une seule."] [%hint "10...Nxd4 : on prend le pion."] [%hintcsl Rd4] [%eval -0.67] }
  10... Nxd4 { [%txt "On prend d4."] [%eval -0.66] [%cal Gc6d4] }
  11. Bxb7 { [%txt "Le fou prend b7."] [%eval -0.65] }
  11... Rd8 { [%txt "À RETENIR.

PRO TIP : -0.63. Le roi blanc reste au centre face à notre tour d8. Contre le Göring, d4 est la cible : compte ses défenseurs à chaque coup."] [%eval -0.63] [%cal Gd8d1] })
10... bxc6 { [%txt "On reprend."] [%eval 0.00] [%cal Ga8b8] }
11. Qe2+ { [%txt "Les Blancs proposent l'échange des dames."] [%eval -0.01] }
11... Qxe2+ { [%txt "On échange."] [%eval -0.02] [%cal Gc4e2] }
12. Kxe2 { [%txt "Le roi reprend."] [%eval -0.06] }
12... O-O-O { [%txt "Le grand roque : la tour d8 attaque d4.

À RETENIR.

PRO TIP : la feuille de route après la théorie (-0.04).
1. ...Ne7-d5 : le cavalier bloque le pion isolé d4 et vise c3.
2. ...Rhe8+ : la colonne e contre le roi blanc.
3. Une finale égale : le pion d4 isolé compense nos pions c doublés."] [%eval -0.04] [%cal Gd8d4] } *`,
    ),
    chapter(
      "Branche D : les Quatre Cavaliers 3.Nc3 Nf6 4.d4 et le Gambit de Belgrade",
      `{ [%txt "LES QUATRE CAVALIERS : 4.d4 ET LE GAMBIT DE BELGRADE.

Après 3.Nc3 Nf6, la poussée 4.d4 exd4 rejoint l'Écossaise des Quatre Cavaliers si les Blancs reprennent (chapitre 3). Le piège pratique est 5.Nd5, le Gambit de Belgrade : les Blancs gardent le cavalier en d5 et laissent le pion d4. Notre réponse : 5...Nb4, qui attaque d5 et c2, puis ...Nbxd5 et ...Bb4+. On rend la dame contre la dame et on garde le pion d4."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.32] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.31] [%cal Gc6e5] }
3. Nc3 { [%txt "LES QUATRE CAVALIERS : les Blancs développent d'abord."] [%eval 0.17] }
3... Nf6 { [%txt "Le quatrième cavalier : on attaque e4."] [%eval 0.18] [%cal Gf6e4] }
4. d4 { [%txt "Les Blancs ouvrent le centre."] [%eval 0.13] }
(4. Bb5 { [%txt "Le Quatre Cavaliers espagnol."] [%eval 0.20] }
  4... Nd4 { [%txt "À RETENIR.

PRO TIP : +0.05. C'est la branche 4.Nc3 du cours Berlinoise : même position, même plan ...Nd4 contre le cavalier f3."] [%eval 0.05] [%cal Gd4f3] })
(4. Bc4 { [%txt "Le fou vise f7."] [%eval -0.06] }
  4... Nxe4 { [%txt "À RETENIR.

PRO TIP : -0.18. La fourchette ...d5 récupère la pièce : c'est l'anti-panique 4.Nc3 du cours Deux Cavaliers."] [%eval -0.18] [%cal Gf6e4] })
4... exd4 { [%txt "On prend."] [%eval 0.00] [%cal Ge5d4] }
5. Nd5 { [%txt "LE GAMBIT DE BELGRADE : le cavalier saute en d5 au lieu de reprendre."] [%eval -0.21] }
(5. Nxd4 { [%txt "Le cavalier reprend."] [%eval 0.13] }
  5... Bb4 { [%txt "À RETENIR.

PRO TIP : +0.07. C'est exactement la position du chapitre 3 : même plan, ...bxc6 puis ...d5."] [%eval 0.07] [%cal Gb4c3] })
5... Nb4 { [%txt "Le cavalier attaque d5 et vise c2."] [%eval -0.27] [%cal Gb4d5,Gb4c2] }
6. Bc4 { [%txt "Le fou soutient le cavalier d5."] [%eval -0.41] }
6... Nbxd5 { [%txt "On prend le cavalier d5."] [%eval -0.15] [%cal Gb4d5] }
(6... Be7 { [%txt "LA VARIANTE PIÉGÉE : un développement naturel…"] [%eval 1.13] [%csl Rb4] }
  7. Nxe7 { [%txt "…mais le cavalier d5 échange notre fou, puis Nxd4 récupère le pion, et notre cavalier b4 reste hors jeu."] [%eval 1.02] }
  7... Qxe7 { [%txt "On reprend."] [%eval 0.94] [%cal Gd8e7] }
  8. O-O { [%txt "À RETENIR.

PRO TIP : +0.96. Dans le Belgrade, le cavalier d5 doit disparaître tout de suite : ...Nbxd5 avant tout autre coup."] [%eval 0.96] })
7. exd5 { [%txt "Les Blancs reprennent."] [%eval -0.25] }
(7. Bxd5 { [%txt "Le fou reprend, mais le roi blanc reste sur la diagonale e1-a5 : l'évaluation passe de -0.15 à -1.02."] [%hint "les Blancs reprennent avec le fou, et leur roi reste au centre sur la diagonale a5-e1."] [%hint "le roi e1. Notre fou f8 lui donne échec en b4, et le pion d4 reste à nous."] [%hint "7...Bb4+ : l'échec, puis l'échange des fous."] [%hintcsl Re1,Gb4] [%eval -1.02] }
  7... Bb4+ { [%txt "Échec."] [%eval -0.92] [%cal Gb4e1] }
  8. Bd2 { [%txt "Le fou s'interpose."] [%eval -0.95] }
  8... Bxd2+ { [%txt "On échange."] [%eval -0.99] [%cal Gb4d2] }
  9. Qxd2 { [%txt "La dame reprend."] [%eval -1.03] }
  9... c5 { [%txt "À RETENIR.

PRO TIP : -0.92. Un pion de plus, soutenu par ...c5. Dans le Belgrade, le pion d4 se garde : il gêne tout le camp blanc."] [%eval -0.92] [%cal Gc5d4] })
7... Bb4+ { [%txt "Échec : le roi blanc est sur la colonne e."] [%eval -0.23] [%cal Gb4e1] }
8. Bd2 { [%txt "Le fou s'interpose."] [%eval -0.42] }
(8. c3 { [%txt "Le pion chasse le fou, mais la colonne e reste ouverte : l'évaluation passe de -0.23 à -1.18."] [%hint "les Blancs ouvrent la diagonale du roi au lieu de développer une pièce."] [%hint "la colonne e. Notre dame y donne échec, et le roi blanc ne pourra pas roquer tout de suite."] [%hint "8...Qe7+ : l'échec sur la colonne e."] [%hintcsl Ge7,Re1] [%eval -1.18] }
  8... Qe7+ { [%txt "Échec sur la colonne e."] [%eval -1.23] [%cal Ge7e1] }
  9. Be2 { [%txt "Le fou s'interpose."] [%eval -1.38] }
  9... dxc3 { [%txt "On prend c3."] [%eval -1.31] [%cal Gd4c3] }
  10. O-O { [%txt "Les Blancs roquent."] [%eval -1.36] }
  10... O-O { [%txt "À RETENIR.

PRO TIP : -1.28. Un pion de plus et des pions blancs isolés. Contre c3, l'échec ...Qe7+ gagne le temps qui permet de prendre."] [%eval -1.28] [%csl Gc3] })
8... Qe7+ { [%txt "Échec sur la colonne e : on propose l'échange des dames."] [%eval -0.26] [%cal Ge7e1] }
9. Qe2 { [%txt "La dame s'interpose."] [%eval -0.19] }
9... Bxd2+ { [%txt "On échange les fous."] [%eval -0.16] [%cal Gb4d2] }
10. Kxd2 { [%txt "Le roi reprend : il garde la case e2 pour la dame."] [%eval -0.24] }
(10. Nxd2 { [%txt "Le cavalier reprend, mais il quitte la défense de d4 et de d5 : l'évaluation passe de -0.16 à -0.93."] [%hint "le cavalier reprend en d2 et ne surveille plus d4 ni la case b5."] [%hint "le pion d5. Après l'échange des dames, notre pion b peut chasser le fou c4, défenseur de d5."] [%hint "10...Qxe2+ 11.Kxe2 b5 : le fou c4 est chassé."] [%hintcsl Rd5,Gb5] [%eval -0.93] }
  10... Qxe2+ { [%txt "On échange les dames."] [%eval -0.78] [%cal Ge7e2] }
  11. Kxe2 { [%txt "Le roi reprend."] [%eval -0.71] }
  11... b5 { [%txt "Le pion chasse le fou, défenseur de d5."] [%eval -0.68] [%cal Gb5c4] }
  12. Bxb5 { [%txt "Le fou prend."] [%eval -0.73] }
  12... Nxd5 { [%txt "À RETENIR.

PRO TIP : -0.70. Le pion d5 tombe : nous avons un pion de plus. Quand un pion est défendu par un seul fou, chasse le fou."] [%eval -0.70] [%cal Gf6d5] })
10... Qxe2+ { [%txt "On échange les dames."] [%eval -0.24] [%cal Ge7e2] }
11. Kxe2 { [%txt "Le roi reprend."] [%eval -0.25] }
11... O-O { [%txt "On roque : le roi est en sécurité, le pion d4 reste à nous.

À RETENIR.

PRO TIP : la feuille de route après la théorie (-0.22).
1. ...Re8+ : la tour donne échec sur la colonne e.
2. ...c5 ou ...b5 : on attaque le pion d5 et son défenseur c4.
3. Le pion d4 se garde : il coupe le camp blanc en deux."] [%eval -0.22] [%cal Gf8e8] } *`,
    ),
    chapter(
      "Aléatoire surprise 2 : après le Belgrade, le roi blanc perdu au centre",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le Belgrade du chapitre 5 jusqu'à 11...O-O. Les dames sont parties, mais le roi blanc est resté en e2. Les Blancs ne font pas de gaffe : leurs tours et leur roi bougent sans plan pendant que nos pions et notre cavalier ouvrent le jeu. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case ou le pion faible (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quel pion blanc est devenu faible ? 3. Quel levier ou quel saut de cavalier l'attaque ?"] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.32] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.31] [%cal Gc6e5] }
3. Nc3 { [%txt "Les Quatre Cavaliers."] [%eval 0.17] }
3... Nf6 { [%txt "Contre e4."] [%eval 0.18] [%cal Gf6e4] }
4. d4 { [%txt "Le centre s'ouvre."] [%eval 0.13] }
4... exd4 { [%txt "On prend."] [%eval 0.00] [%cal Ge5d4] }
5. Nd5 { [%txt "Le Belgrade."] [%eval -0.21] }
5... Nb4 { [%txt "Contre d5."] [%eval -0.27] [%cal Gb4d5] }
6. Bc4 { [%txt "Soutien."] [%eval -0.41] }
6... Nbxd5 { [%txt "On prend."] [%eval -0.15] [%cal Gb4d5] }
7. exd5 { [%txt "Reprise."] [%eval -0.25] }
7... Bb4+ { [%txt "Échec."] [%eval -0.23] [%cal Gb4e1] }
8. Bd2 { [%txt "Interposition."] [%eval -0.42] }
8... Qe7+ { [%txt "Échec."] [%eval -0.26] [%cal Ge7e1] }
9. Qe2 { [%txt "Interposition."] [%eval -0.19] }
9... Bxd2+ { [%txt "Échange."] [%eval -0.16] [%cal Gb4d2] }
10. Kxd2 { [%txt "Le roi reprend."] [%eval -0.24] }
10... Qxe2+ { [%txt "Échange des dames."] [%eval -0.24] [%cal Ge7e2] }
11. Kxe2 { [%txt "Le roi reprend."] [%eval -0.25] }
11... O-O { [%txt "Fin de la théorie : roque."] [%eval -0.22] [%csl Gg8] }
12. Rhc1 { [%txt "La tour va en c1, sans rôle précis : l'évaluation passe de -0.22 à -0.92."] [%hint "les Blancs placent une tour derrière leur pion c2 au lieu de reprendre d4 avec le cavalier."] [%hint "le pion d5. Notre pion c peut le frapper, et le fou c4 est son seul défenseur."] [%hint "12...c5 : le levier contre d5."] [%hintcsl Rd5,Gc5] [%eval -0.92] }
12... c5 { [%txt "Le levier contre d5."] [%eval -0.84] [%cal Gc5d4,Gc7c5] }
13. dxc6 { [%txt "Les Blancs prennent en passant."] [%eval -0.91] }
13... bxc6 { [%txt "On reprend : notre centre se reconstruit."] [%eval -0.95] [%cal Gc6d5] }
14. Rab1 { [%txt "L'autre tour bouge aussi sans plan : l'évaluation passe de -0.95 à -1.62."] [%hint "les Blancs déplacent une tour au lieu de reprendre d4 ou de mettre leur roi à l'abri en f1."] [%hint "la case d5. Notre pion y gagne de l'espace et chasse le fou c4."] [%hint "14...d5 : le pion chasse le fou."] [%hintcsl Gd5,Rc4] [%eval -1.62] }
14... d5 { [%txt "Le pion chasse le fou."] [%eval -2.06] [%cal Gd5c4] }
15. Bd3 { [%txt "Le fou recule."] [%eval -2.16] }
15... c5 { [%txt "Le duo c5-d5 soutient le pion d4."] [%eval -2.06] [%cal Gc5d4] }
16. Kd1 { [%txt "Le roi recule encore, loin de nos pions : l'évaluation passe de -2.06 à -2.87."] [%hint "le roi s'éloigne du centre au lieu de jouer c4 pour attaquer notre duo."] [%hint "la case e4. Notre cavalier y saute, attaque f2 et c3, et ne peut être chassé que par le fou."] [%hint "16...Ne4 : le cavalier s'installe au centre."] [%hintcsl Ge4,Rf2] [%eval -2.87] }
16... Ne4 { [%txt "Le cavalier s'installe en e4."] [%eval -2.80] [%cal Gf6e4,Ge4f2] }
(16... Ng4 { [%txt "LA VARIANTE PIÉGÉE : le cavalier attaque f2…"] [%eval -1.86] [%csl Rg4] }
  17. Ke1 { [%txt "…mais le roi revient défendre f2, et notre cavalier g4 est loin du centre. À RETENIR.

PRO TIP : -1.67, une bonne partie de l'avantage s'est envolée. Une menace qu'un seul coup de roi pare n'est pas une menace : vise une case que l'adversaire ne peut pas couvrir."] [%eval -1.67] })
17. Bxe4 { [%txt "Les Blancs échangent."] [%eval -2.80] }
17... dxe4 { [%txt "On reprend : le cavalier f3 est attaqué."] [%eval -3.26] [%cal Gd5e4,Ge4f3] }
18. Ng1 { [%txt "Le cavalier recule à la maison : l'évaluation passe de -3.26 à -3.92."] [%hint "le cavalier retourne en g1 au lieu de se placer en d2 face au pion e4."] [%hint "l'aile dame. Notre pion a peut avancer vers a4 et a3 pendant que les pièces blanches sont enfermées."] [%hint "18...a5 : le pion a avance."] [%hintcsl Ga5,Rg1] [%eval -3.92] }
18... a5 { [%txt "À RETENIR.

PRO TIP : -4.10, avantage noir décisif. Deux pions passés centraux et un cavalier blanc revenu en g1. La leçon : dans les finales du Belgrade, chaque coup de roi ou de tour sans plan nous laisse avancer un pion."] [%eval -4.10] [%cal Ga5a4] } *`,
    ),
    chapter(
      "Branche E : la Glek 4.g3 et les Quatre Cavaliers lents",
      `{ [%txt "LES QUATRE CAVALIERS LENTS : 4.g3, 4.h3.

Les Blancs évitent la théorie : fianchetto du fou f1 (la Variante Glek) ou petits coups de pion. Notre réponse : 4...d5, le levier central tout de suite. Après 5.exd5 Nxd5, on échange en c3, on se développe par ...Bd6 et ...O-O, et la paire de pions blancs c doublés nous laisse une position confortable."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.32] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.31] [%cal Gc6e5] }
3. Nc3 { [%txt "Les Quatre Cavaliers."] [%eval 0.17] }
3... Nf6 { [%txt "Contre e4."] [%eval 0.18] [%cal Gf6e4] }
4. g3 { [%txt "LA GLEK : le fou ira en g2."] [%eval -0.12] }
(4. h3 { [%txt "Un coup d'attente."] [%eval 0.08] }
  4... d5 { [%txt "À RETENIR.

PRO TIP : +0.22. Contre un coup lent, le levier central tout de suite : après 5.exd5 Nxd5, c'est le plan de ce chapitre."] [%eval 0.22] [%cal Gd5e4] })
4... d5 { [%txt "Le levier central, avant que le fou n'arrive en g2."] [%eval 0.11] [%cal Gd5e4] }
5. exd5 { [%txt "Les Blancs prennent."] [%eval 0.13] }
(5. d3 { [%txt "Les Blancs défendent e4 au lieu de prendre : l'évaluation passe de +0.11 à -1.09."] [%hint "les Blancs soutiennent e4 et laissent le centre s'ouvrir avec nos pièces mieux placées."] [%hint "le pion e4. Notre pion le prend, puis les échanges mènent à l'échange des dames avec le roi blanc au centre."] [%hint "5...dxe4 6.Nxe4 Nxe4 7.dxe4 Qxd1+ : on échange tout."] [%hintcsl Re4,Gd1] [%eval -1.09] }
  5... dxe4 { [%txt "On prend."] [%eval -1.25] [%cal Gd5e4] }
  6. Nxe4 { [%txt "Le cavalier reprend."] [%eval -1.15] }
  6... Nxe4 { [%txt "On échange."] [%eval -1.19] [%cal Gf6e4] }
  7. dxe4 { [%txt "Le pion reprend."] [%eval -0.88] }
  7... Qxd1+ { [%txt "On échange les dames avec échec."] [%eval -1.03] [%cal Gd8d1] }
  8. Kxd1 { [%txt "Le roi reprend et perd le roque."] [%eval -1.03] }
  8... Bg4 { [%txt "À RETENIR.

PRO TIP : -0.90. Le fou cloue le cavalier f3, et le roi d1 gêne les tours blanches. Contre d3, prends en e4 et échange les dames."] [%eval -0.90] [%cal Gg4f3] })
5... Nxd5 { [%txt "Le cavalier reprend au centre."] [%eval 0.08] [%csl Gd5] }
(5... Nb4 { [%txt "LA VARIANTE PIÉGÉE : le cavalier vise d5 et c2…"] [%eval 1.48] [%csl Re5] }
  6. Nxe5 { [%txt "…mais il a laissé e5 sans défense. À RETENIR.

PRO TIP : +1.48. Le cavalier c6 défend e5 : ne le déplace pas tant que e5 n'a pas d'autre défenseur."] [%eval 1.48] })
6. Bg2 { [%txt "Le fou se place sur la grande diagonale."] [%eval 0.13] }
(6. Bc4 { [%txt "Le fou change de plan, et g3 a affaibli les cases blanches : l'évaluation passe de +0.08 à -0.72."] [%hint "les Blancs abandonnent l'idée du fianchetto : la case h3 et la diagonale f1-h3 sont devenues faibles."] [%hint "la case h3. Après l'échange en c3, notre fou c8 y empêche le roque."] [%hint "6...Nxc3 7.bxc3 Bh3 : le roi blanc ne peut plus roquer."] [%hintcsl Gh3,Rf1] [%eval -0.72] }
  6... Nxc3 { [%txt "On échange."] [%eval -0.79] [%cal Gd5c3] }
  7. bxc3 { [%txt "Le pion reprend."] [%eval -0.69] }
  7... Bh3 { [%txt "À RETENIR.

PRO TIP : -0.66. Le roi blanc ne peut plus roquer. Quand les Blancs jouent g3 sans Bg2, la case h3 est à nous."] [%eval -0.66] [%cal Gh3f1] })
6... Nxc3 { [%txt "On échange : les pions blancs se doublent."] [%eval 0.03] [%cal Gd5c3] }
7. bxc3 { [%txt "Le pion reprend vers le centre."] [%eval 0.05] }
(7. dxc3 { [%txt "Cette reprise ouvre la colonne d : l'évaluation passe de +0.03 à -0.68."] [%hint "les Blancs reprennent vers l'extérieur et ouvrent la colonne d devant leur dame."] [%hint "la dame d1. Notre dame la prend avec échec, et le roi blanc perd le roque."] [%hint "7...Qxd1+ 8.Kxd1 : on échange les dames."] [%hintcsl Rd1,Re1] [%eval -0.68] }
  7... Qxd1+ { [%txt "On échange avec échec."] [%eval -0.60] [%cal Gd8d1] }
  8. Kxd1 { [%txt "Le roi reprend."] [%eval -0.62] }
  8... Bg4 { [%txt "À RETENIR.

PRO TIP : -0.72. Le roi blanc est coincé en d1 et le cavalier f3 est cloué. Dans la Glek, après dxc3, échange les dames tout de suite."] [%eval -0.72] [%cal Gg4f3] })
7... Bd6 { [%txt "Le fou défend e5."] [%eval 0.07] [%cal Gd6e5] }
8. O-O { [%txt "Les Blancs roquent."] [%eval 0.11] }
8... O-O { [%txt "Nous aussi."] [%eval 0.08] [%csl Gg8] }
9. d3 { [%txt "Les Blancs soutiennent c4 et e4."] [%eval -0.08] }
9... h6 { [%txt "On empêche Bg5 et Ng5."] [%eval -0.16] [%csl Gg5] }
10. Re1 { [%txt "La tour vise e5."] [%eval -0.17] }
10... Re8 { [%txt "La tour défend e5.

À RETENIR.

PRO TIP : la feuille de route après la théorie (-0.17).
1. ...Bf5 ou ...Be6 : le dernier fou sort.
2. ...Qd7 et ...Rad8 : les tours sur les colonnes centrales.
3. ...a5-a4 : on fixe les pions doublés blancs de l'aile dame."] [%eval -0.17] [%cal Ge8e5] } *`,
    ),
    chapter(
      "Anti-panique : le Gambit Halloween (4.Nxe5)",
      `{ [%txt "ANTI-PANIQUE : LE GAMBIT HALLOWEEN.

Après 3.Nc3 Nf6, certains joueurs sacrifient un cavalier : 4.Nxe5 Nxe5 5.d4. Les pions blancs chassent nos cavaliers (d4, e5), mais une pièce reste une pièce. Notre plan : ...Ng6, ...Ng8, puis ...c6 et ...d5 pour rendre un peu de matériel au bon moment. Attention au piège de mat en f7."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.32] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.31] [%cal Gc6e5] }
3. Nc3 { [%txt "Les Quatre Cavaliers."] [%eval 0.17] }
3... Nf6 { [%txt "Contre e4."] [%eval 0.18] [%cal Gf6e4] }
4. Nxe5 { [%txt "LE GAMBIT HALLOWEEN : le cavalier se sacrifie en e5."] [%eval -1.62] }
4... Nxe5 { [%txt "On prend la pièce."] [%eval -1.82] [%cal Gc6e5] }
5. d4 { [%txt "Le pion chasse le cavalier."] [%eval -1.81] }
5... Ng6 { [%txt "Le cavalier recule en g6, sa meilleure case."] [%eval -1.96] [%csl Gg6] }
6. e5 { [%txt "Le pion chasse l'autre cavalier."] [%eval -1.95] }
6... Ng8 { [%txt "Le cavalier recule à la maison : il ressortira par e7 ou h6."] [%eval -1.83] [%csl Gg8] }
7. Bc4 { [%txt "Le fou vise f7."] [%eval -1.88] }
(7. h4 { [%txt "Le pion de bord avance, mais le centre blanc n'est pas soutenu : l'évaluation passe de -1.83 à -2.48."] [%hint "les Blancs poussent un pion de bord au lieu de développer une pièce."] [%hint "le pion e5. Notre pion d peut le frapper, et le centre blanc s'effondre."] [%hint "7...d5 : on frappe le centre."] [%hintcsl Re5,Gd5] [%eval -2.48] }
  7... d5 { [%txt "On frappe le centre."] [%eval -2.75] [%cal Gd5e4] }
  8. h5 { [%txt "Le pion chasse le cavalier g6."] [%eval -2.64] }
  8... N6e7 { [%txt "À RETENIR.

PRO TIP : -2.88. Une pièce de plus et le centre bloqué. Contre les poussées de pion du Halloween, développe et frappe avec ...d5."] [%eval -2.88] [%csl Ge7] })
7... c6 { [%txt "On prépare ...d5, et le fou c4 n'aura plus la case d5."] [%eval -1.79] [%cal Gc6d5] }
8. Qf3 { [%txt "La dame vise f7 avec le fou c4."] [%eval -1.96] }
(8. h4 { [%txt "Le pion avance encore, sans développement : l'évaluation passe de -1.79 à -3.29."] [%hint "les Blancs jouent un coup de pion au lieu de sortir une pièce."] [%hint "le centre. Notre pion d5 frappe le fou c4 et le pion e5 en même temps."] [%hint "8...d5 9.exd6 Bxd6 : on se développe avec gain de temps."] [%hintcsl Gd5,Rc4] [%eval -3.29] }
  8... d5 { [%txt "Le levier."] [%eval -3.16] [%cal Gd5c4] }
  9. exd6 { [%txt "Les Blancs prennent en passant."] [%eval -3.76] }
  9... Bxd6 { [%txt "Le fou reprend : sans dame en f3, f7 ne risque rien."] [%eval -3.60] [%cal Gd6g3] }
  10. h5 { [%txt "Le pion chasse le cavalier."] [%eval -3.98] }
  10... N6e7 { [%txt "À RETENIR.

PRO TIP : -3.85. Une pièce de plus et tous nos fous actifs. Ici ...Bxd6 est sûr parce que la dame blanche n'est pas en f3."] [%eval -3.85] [%csl Ge7] })
8... d5 { [%txt "Le levier : le fou c4 est attaqué."] [%eval -2.14] [%cal Gd5c4] }
9. exd6 { [%txt "Les Blancs prennent en passant."] [%eval -2.20] }
(9. Nxd5 { [%txt "Le cavalier se sacrifie encore : l'évaluation passe de -2.14 à -4.99."] [%hint "les Blancs donnent une deuxième pièce pour ouvrir f7, sans soutien suffisant."] [%hint "la dame f3. Notre cavalier g6 l'attaque en h4, avec gain de temps."] [%hint "9...Nh4 : le cavalier chasse la dame."] [%hintcsl Rf3,Gh4] [%eval -4.99] }
  9... Nh4 { [%txt "Le cavalier attaque la dame et g2."] [%eval -5.64] [%cal Gh4f3] }
  10. Qb3 { [%txt "La dame s'échappe."] [%eval -5.64] }
  10... cxd5 { [%txt "On prend le cavalier."] [%eval -5.76] [%cal Gc6d5] }
  11. Bxd5 { [%txt "Le fou reprend."] [%eval -5.58] }
  11... Be6 { [%txt "À RETENIR.

PRO TIP : -5.41, deux pièces de plus pour deux pions. Contre les sacrifices du Halloween, compte les pièces : la nôtre est en plus."] [%eval -5.41] [%cal Ge6d5] })
9... Be6 { [%txt "Le fou couvre f7 et attaque le fou c4."] [%eval -2.20] [%cal Ge6c4,Ge6f7] }
(9... Bxd6 { [%txt "LA VARIANTE PIÉGÉE : la reprise naturelle…"] [%eval #1] [%csl Rf7] }
  10. Qxf7# { [%txt "…et la dame prend f7 avec le soutien du fou c4 : mat. À RETENIR.

PRO TIP : mat en un coup. Tant que la dame f3 et le fou c4 visent f7, couvre f7 avant de reprendre."] [%eval #0] })
10. d5 { [%txt "Le pion attaque notre fou e6."] [%eval -2.54] }
10... Ne5 { [%txt "Le cavalier attaque la dame et le fou c4."] [%eval -2.58] [%cal Ge5f3,Ge5c4] }
11. Qe2 { [%txt "La dame recule et défend le fou c4."] [%eval -2.81] }
11... Nxc4 { [%txt "On prend le fou."] [%eval -2.62] [%cal Ge5c4] }
12. dxe6 { [%txt "Les Blancs prennent notre fou."] [%eval -2.71] }
12... Nxd6 { [%txt "Le cavalier prend d6.

À RETENIR.

PRO TIP : la feuille de route après la théorie (-2.79).
1. ...fxe6 et ...Be7 : on reprend le pion e6 et on termine le développement.
2. ...O-O : le roi se met à l'abri, la colonne f s'ouvre pour notre tour.
3. Une pièce de plus : échange les pièces actives blanches et la finale est gagnée."] [%eval -2.79] [%cal Gf7e6] } *`,
    ),
  ],
};
