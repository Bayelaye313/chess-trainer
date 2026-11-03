import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours d'ouverture « Pirc et Moderne (avec les Blancs) » — onglet
 * Ouvertures, format « un commentaire par coup » de l'Académie, lu par
 * `CourseTreeViewer` (route `/ouvertures/pirc-modern-white/cours`). Public
 * visé : 1500-1800 Elo, répertoire 1.e4 contre 1...d6 et 1...g6 (fiche
 * curatée `pirc-modern-white`, B07-B09 et B06). Ligne caractéristique
 * 1.e4 d6 : les chapitres de la Moderne portent un renvoi 1...d6 en
 * variante, pour que chaque chapitre contienne cette ligne. Ne remplace pas
 * `pirc-defense` (fiche côté Noirs, sans cours).
 *
 * ## Contenu (v2 du 2026-11-03, format Ruy Lopez v2, côté Blancs)
 *
 * 1. Fiche d'identité, tronc commun : la Pirc 3...g6 4.Be3, l'attaque 150.
 * 2. Aléatoire surprise 1 : après l'attaque 150, le roi noir au centre.
 * 3. Branche B : la Pirc tchèque, 3...c6 4.f4.
 * 4. Branche C : la Pirc avec le petit roque rapide, 5...O-O 6.O-O-O.
 * 5. Branche D : la Moderne, 3...d6 4.Be3 a6.
 * 6. Aléatoire surprise 2 : après la Moderne, le levier f5.
 * 7. Branche E : la Moderne avec 3...c5.
 * 8. Anti-panique : 2...e5, 2...c5 et les ordres de coups.
 *
 * Choix des chapitres (2026-11-03) : un seul schéma blanc pour la Pirc et la
 * Moderne (Be3, Qd2, f3, Bh6, grand roque), et la théorie principale des
 * réponses noires : ...c6 et ...b5, la tchèque 3...c6 (contre laquelle on
 * joue 4.f4), le petit roque rapide, la Moderne avec ...a6 et ...b5, puis
 * 3...c5 ; plus 2...e5, 2...c5, 2...Nc6 et 3...d5 dans la Moderne. Parties
 * de l'utilisateur (copie de la base) : huit parties seulement contre 1...d6
 * ou 1...g6, souvent avec 2.Nf3 ; le cours suit l'ordre 2.d4 et 3.Nc3.
 * Aucun autre cours ne traite 1...d6 ou 1...g6. Les branches théoriques
 * s'arrêtent au plus tard au demi-coup 27 ; les chapitres « Aléatoire
 * surprise » prolongent avec les Noirs comme camp « mou » (dérive en
 * MultiPV 30, comme `_tmp-drift-w.mts` mais camps inversés).
 *
 * Convention côté Blancs (comme `op-ruy-lopez.ts`) : l'élève joue les
 * Blancs ; les fautes sont des coups NOIRS qui portent les 3 indices
 * `[%hint]` + `[%hintcsl]`, le coup blanc suivant est la punition. Les
 * « variantes piégées » sont des coups blancs tentants mais mauvais (3.Bc4,
 * 5.Nf3 contre ...Qa5, 9.cxd6, 7.Be2, 4.Bc4). Une faute qui perd moins de
 * 0.5 devient une « imprécision » sans indices (18...Nc4 à la surprise 2).
 *
 * Sources : théorie établie de la Pirc et de la Moderne, TOUTES les lignes
 * arbitrées par Stockfish 19 natif (profondeur 16, MultiPV 1) ; 10.Nd1 et
 * 12.Nh3 au chapitre 1, 9.Nh3 au chapitre 4 et 9.Nh3 au chapitre 5 sont des
 * choix du moteur. Toute la prose est originale.
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
 *   `[%hintcsl …]` sur les fautes noires qu'il faut punir.
 *
 * Fichier GÉNÉRÉ : ne pas l'éditer à la main. Source commentée :
 * `scripts/opening-course-src/pirc-modern-white.pgn` (et l'en-tête
 * `pirc-modern-white.header.txt`) ; regénérer avec
 * `node --import tsx scripts/_tmp-build-opening-course.mts <source> <en-tête> <sortie> 16`
 * (Stockfish natif, voir `scripts/_tmp-sf-native.mts` ; sous Linux,
 * `SF_BIN=<chemin du binaire>`). Les `[%eval]` viennent du moteur, pas de la
 * main. Étape standard : `scripts/_tmp-check-cited-evals.mts op-pirc-modern-white`
 * doit sortir 0 écart (un chiffre n'est cité dans un commentaire que s'il est
 * l'éval d'un nœud). Règles de l'utilisateur : SAN en texte brut uniquement
 * (jamais de figurine Unicode), pas de guillemet droit dans un `[%txt]`.
 */

function chapter(title: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, START) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const OP_PIRC_MODERN_WHITE: CourseTree = {
  chapters: [
    chapter(
      "Fiche d'identité, tronc commun : la Pirc 3...g6 4.Be3, l'attaque 150",
      `{ [%txt "LA PIRC ET LA MODERNE, AVEC LES BLANCS.

Le vrai enjeu : contre 1...d6 (la Pirc) ou 1...g6 (la Moderne), les Noirs nous laissent le centre e4-d4 et le contestent plus tard par ...c5, ...e5 ou ...b5. On prend tout l'espace offert, et on joue un seul schéma simple à retenir : Be3, Qd2, f3, puis Bh6 pour échanger le fou g7 et le grand roque avec h4-h5 contre le roque noir. C'est l'ATTAQUE 150.

Le déséquilibre recherché : un centre fort et une attaque à l'aile roi contre une position noire élastique, qui attend la faute. Le fou g7 est la meilleure pièce noire : Bh6 l'échange.

Pourquoi ces chapitres : le choix suit la théorie principale et un seul schéma pour tout : la Pirc avec ...c6 et ...b5 (ce chapitre), la Pirc tchèque 3...c6 (chapitre 3), la Pirc avec le petit roque rapide (chapitre 4), la Moderne avec ...a6 et ...b5 (chapitre 5), la Moderne avec ...c5 (chapitre 7), plus 2...e5, 2...c5 et les coups rares (chapitre 8). Aucun autre cours ne traite 1...d6 ou 1...g6 ; la fiche pirc-defense est écrite pour les Noirs, sans cours.

Les structures types :
- Attaque 150 : pions e4-d4-f3, fou en h6, grand roque blanc, pion h qui avance.
- Pirc tchèque : pions e4-d4-f4 contre c6-d6-e5.
- Moderne avec ...c5 : le pion c5 se prend, le pion d6 devient faible.

Règle d'or : contre la Pirc et la Moderne, garde le centre, échange le fou g7, puis attaque."] [%eval 0.39] }
1. e4 { [%txt "On occupe le centre."] [%eval 0.26] [%csl Ge4] }
1... d6 { [%txt "LA PIRC : les Noirs préparent ...Nf6 et ...g6. (1...g6, la Moderne : chapitres 5 à 7.)"] [%eval 0.55] }
2. d4 { [%txt "Le centre idéal."] [%eval 0.45] [%csl Gd4,Ge4] }
2... Nf6 { [%txt "Le cavalier attaque e4. (2...e5 et 2...c5 : chapitre 8.)"] [%eval 0.54] }
3. Nc3 { [%txt "Le cavalier défend e4."] [%eval 0.61] }
(3. Bc4 { [%txt "LA VARIANTE PIÉGÉE : le fou vise f7…"] [%eval -0.14] [%csl Re4] }
  3... Nxe4 { [%txt "…mais le pion e4 n'est plus défendu, et le cavalier le prend."] [%eval -0.12] }
  4. Bxf7+ { [%txt "On récupère un pion…"] [%eval -0.11] }
  4... Kxf7 { [%txt "…le roi reprend…"] [%eval -0.10] }
  5. Qh5+ { [%txt "…et l'échec ne mène à rien de plus. À RETENIR.

PRO TIP : -0.13. Contre 2...Nf6, défends e4 d'abord : Nc3 avant tout coup de fou."] [%eval -0.13] [%csl Re4] })
3... g6 { [%txt "Le fianchetto : le fou ira en g7. (3...c6 : chapitre 3.)"] [%eval 0.59] }
4. Be3 { [%txt "L'ATTAQUE 150 : le fou prépare Qd2 et Bh6."] [%eval 0.60] [%cal Ge3h6] }
4... Bg7 { [%txt "Le fou se place sur la grande diagonale."] [%eval 0.66] }
5. Qd2 { [%txt "La dame soutient Bh6 et prépare le grand roque."] [%eval 0.79] }
5... c6 { [%txt "Les Noirs préparent ...b5. (5...O-O : chapitre 4.)"] [%eval 0.72] }
(5... d5 { [%txt "Les Noirs frappent le centre, mais le cavalier f6 sera chassé : l'évaluation passe de +0.79 à +1.60."] [%hint "les Noirs poussent ...d5 alors que notre pion e4 peut avancer et chasser le cavalier f6."] [%hint "la case e5. Notre pion y avance avec gain de temps sur le cavalier."] [%hint "6.e5 : le pion chasse le cavalier et prend l'espace."] [%hintcsl Ge5,Rf6] [%eval 1.60] }
  6. e5 { [%txt "Le pion chasse le cavalier."] [%eval 1.66] }
  6... Ne4 { [%txt "Le cavalier s'installe en e4."] [%eval 1.58] }
  7. Nxe4 { [%txt "On échange."] [%eval 1.53] }
  7... dxe4 { [%txt "À RETENIR.

PRO TIP : +1.52. Le pion e4 noir est isolé et faible, notre centre d4-e5 est intact. Dans la Pirc, ...d5 sans préparation rend un temps : e5 chasse le cavalier."] [%eval 1.52] [%csl Re4] })
6. f3 { [%txt "Le pion soutient e4 et prépare g4."] [%eval 0.32] [%cal Gf3g4] }
6... b5 { [%txt "Les Noirs prennent l'espace à l'aile dame."] [%eval 0.34] }
7. Bh6 { [%txt "On échange le fou g7, la meilleure pièce noire."] [%eval 0.29] [%cal Gh6g7] }
7... Bxh6 { [%txt "Les Noirs échangent."] [%eval 0.27] }
8. Qxh6 { [%txt "La dame reprend et vise h7."] [%eval 0.25] }
8... Nbd7 { [%txt "Le cavalier se développe."] [%eval 0.25] }
(8... Bb7 { [%txt "Le fou se développe, mais le centre blanc avance : l'évaluation passe de +0.25 à +0.99."] [%hint "les Noirs développent le fou alors que le cavalier f6 est le seul défenseur de leur roi."] [%hint "la case e5. Notre pion y avance et chasse le cavalier f6."] [%hint "9.e5 : le pion attaque le cavalier."] [%hintcsl Ge5,Rf6] [%eval 0.99] }
  9. e5 { [%txt "Le pion chasse le cavalier."] [%eval 0.92] }
  9... dxe5 { [%txt "Les Noirs prennent."] [%eval 1.01] }
  10. dxe5 { [%txt "On reprend."] [%eval 1.19] }
  10... b4 { [%txt "À RETENIR.

PRO TIP : +1.24. Le cavalier f6 doit partir et le roi noir n'a plus de défenseur. Contre la Pirc, la poussée e5 arrive dès que le cavalier f6 est seul."] [%eval 1.24] [%cal Ge5f6] })
9. Bd3 { [%txt "Le fou se développe et protège e4."] [%eval 0.21] }
9... b4 { [%txt "Le pion chasse le cavalier c3."] [%eval 0.19] }
10. Nd1 { [%txt "Le cavalier recule vers e3 ou f2."] [%eval 0.21] }
10... c5 { [%txt "Les Noirs frappent d4."] [%eval 0.15] }
11. d5 { [%txt "Le pion avance et ferme le centre."] [%eval 0.23] }
11... Qb6 { [%txt "La dame vise b2 et g1."] [%eval 0.27] }
12. Nh3 { [%txt "Le cavalier vise f2 et g5."] [%eval 0.34] }
12... a5 { [%txt "Les Noirs préparent ...a4."] [%eval 0.27] }
13. Ne3 { [%txt "Le cavalier se place en e3.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.28).
1. O-O ou Ke2 : le roi se met à l'abri, la dame h6 bloque le roque noir.
2. Nf4 et h4-h5 : l'attaque contre g6.
3. Nc4 : le cavalier vise d6 et la dame b6."] [%eval 0.28] [%cal Gh3f4] } *`,
    ),
    chapter(
      "Aléatoire surprise 1 : après l'attaque 150, le roi noir au centre",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le chapitre 1 jusqu'à 13.Ne3. La théorie s'arrête là. Les Noirs ne font pas de gaffe : ils jouent des coups de dame et de tour pendant que leur roi reste en e8. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case clé (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Le roi noir est-il à l'abri ? 3. Quel coup ouvre une ligne vers lui ?"] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... d6 { [%txt "La Pirc."] [%eval 0.55] }
2. d4 { [%txt "Le centre."] [%eval 0.45] }
2... Nf6 { [%txt "Contre e4."] [%eval 0.54] }
3. Nc3 { [%txt "Défense."] [%eval 0.61] }
3... g6 { [%txt "Le fianchetto."] [%eval 0.59] }
4. Be3 { [%txt "L'attaque 150."] [%eval 0.60] }
4... Bg7 { [%txt "La grande diagonale."] [%eval 0.66] }
5. Qd2 { [%txt "Vers Bh6."] [%eval 0.79] }
5... c6 { [%txt "Vers ...b5."] [%eval 0.72] }
6. f3 { [%txt "Soutien de e4."] [%eval 0.32] }
6... b5 { [%txt "L'espace."] [%eval 0.34] }
7. Bh6 { [%txt "Échange du fou g7."] [%eval 0.29] }
7... Bxh6 { [%txt "Échange."] [%eval 0.27] }
8. Qxh6 { [%txt "La dame en h6."] [%eval 0.25] }
8... Nbd7 { [%txt "Développement."] [%eval 0.25] }
9. Bd3 { [%txt "Développement."] [%eval 0.21] }
9... b4 { [%txt "Chasse."] [%eval 0.19] }
10. Nd1 { [%txt "Recul."] [%eval 0.21] }
10... c5 { [%txt "Contre d4."] [%eval 0.15] }
11. d5 { [%txt "Fermeture."] [%eval 0.23] }
11... Qb6 { [%txt "Vers b2 et g1."] [%eval 0.27] }
12. Nh3 { [%txt "Vers f2 et g5."] [%eval 0.34] }
12... a5 { [%txt "Vers ...a4."] [%eval 0.27] }
13. Ne3 { [%txt "Fin de la théorie."] [%eval 0.28] }
13... Qa7 { [%txt "La dame quitte la diagonale de g1 pour viser e3, mais notre roi n'est plus menacé : l'évaluation passe de +0.28 à +1.26."] [%hint "les Noirs déplacent la dame sans menace réelle, et leur roi reste au centre."] [%hint "la case g1. Notre roi peut roquer, la dame noire ne contrôle plus cette diagonale."] [%hint "14.O-O : le roi à l'abri, la tour f1 entre en jeu."] [%hintcsl Gg1,Ra7] [%eval 1.26] }
14. O-O { [%txt "On roque."] [%eval 1.31] }
14... c4 { [%txt "Les Noirs sacrifient un pion pour ouvrir la diagonale a7-g1."] [%eval 1.26] }
15. Bxc4 { [%txt "On prend."] [%eval 1.32] }
15... Rg8 { [%txt "La tour défend g6, mais le roi reste au centre : l'évaluation passe de +1.32 à +1.99."] [%hint "les Noirs défendent un pion avec la tour au lieu de mettre leur roi à l'abri."] [%hint "la case e1. Notre tour f1 y vient, derrière le pion e4 qui prépare e5."] [%hint "16.Rfe1 : la tour soutient la poussée e5."] [%hintcsl Ge1,Re8] [%eval 1.99] }
16. Rfe1 { [%txt "La tour vient sur la colonne e."] [%eval 2.15] }
16... Ne5 { [%txt "Le cavalier attaque le fou c4."] [%eval 2.13] }
17. Bb5+ { [%txt "Échec."] [%eval 1.99] }
17... Kd8 { [%txt "Le roi s'écarte."] [%eval 1.99] }
18. Ng5 { [%txt "Le cavalier vise f7 et h7."] [%eval 2.05] }
18... Qc5 { [%txt "La dame vise e3 et b5."] [%eval 1.90] }
19. Bf1 { [%txt "Le fou recule."] [%eval 1.97] }
19... Re8 { [%txt "La tour défend e7, mais l'aile dame noire se découvre : l'évaluation passe de +1.97 à +3.69."] [%hint "les Noirs jouent un coup de défense pendant que leur pion b4 est faible."] [%hint "la case c3. Notre pion c y avance et attaque b4."] [%hint "20.c3 : le levier contre b4, la colonne c s'ouvrira vers le roi d8."] [%hintcsl Gc3,Rb4] [%eval 3.69] }
20. c3 { [%txt "À RETENIR.

PRO TIP : +3.63. La colonne c s'ouvre vers le roi noir en d8. Quand le roi adverse reste au centre, ouvre une colonne de plus."] [%eval 3.63] [%cal Gc3b4] } *`,
    ),
    chapter(
      "Branche B : la Pirc tchèque, 3...c6 4.f4",
      `{ [%txt "LA PIRC TCHÈQUE (3...c6).

Les Noirs préparent ...Qa5 et ...e5 sans fianchetto. On répond par 4.f4 : trois pions au centre, et la dame noire en a5 cloue le cavalier c3 mais ne fait pas grand-chose. Notre plan : Bd3, Nf3, O-O, puis e5 ou f5.

Points clés : le pion e4 est attaqué par le cavalier f6 et la dame a5 via le clouage ; Bd3 le défend. Après ...e5 et ...exd4, notre cavalier reprend en d4 et domine."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... d6 { [%txt "La Pirc."] [%eval 0.55] }
2. d4 { [%txt "Le centre."] [%eval 0.45] }
2... Nf6 { [%txt "Contre e4."] [%eval 0.54] }
3. Nc3 { [%txt "Défense."] [%eval 0.61] }
3... c6 { [%txt "LA PIRC TCHÈQUE : les Noirs préparent ...Qa5."] [%eval 0.76] }
4. f4 { [%txt "Trois pions au centre."] [%eval 0.85] [%csl Ge4,Gd4,Gf4] }
4... Qa5 { [%txt "La dame cloue le cavalier c3."] [%eval 0.90] [%cal Ga5e1] }
5. Bd3 { [%txt "Le fou défend e4."] [%eval 0.95] }
(5. Nf3 { [%txt "LA VARIANTE PIÉGÉE : le développement naturel…"] [%eval -0.36] [%csl Re4] }
  5... Nxe4 { [%txt "…mais le cavalier c3 est cloué, et e4 tombe."] [%eval -0.31] }
  6. Bd3 { [%txt "On attaque le cavalier…"] [%eval -0.26] }
  6... Bf5 { [%txt "…qui est défendu. À RETENIR.

PRO TIP : -0.33. Contre ...Qa5, le cavalier c3 ne défend plus e4 : Bd3 d'abord."] [%eval -0.33] [%csl Re4] })
5... e5 { [%txt "Les Noirs frappent le centre."] [%eval 0.97] }
6. Nf3 { [%txt "Le cavalier défend d4 et e5."] [%eval 1.11] }
6... exd4 { [%txt "Les Noirs échangent."] [%eval 1.02] }
(6... exf4 { [%txt "Les Noirs prennent f4 et ouvrent la diagonale du fou c1 : l'évaluation passe de +1.11 à +1.99."] [%hint "les Noirs prennent en f4 et laissent notre centre d4-e4 intact."] [%hint "la case f4. Notre fou c1 y reprend avec gain de temps."] [%hint "7.Bxf4 : le fou se développe en reprenant."] [%hintcsl Gf4,Gc1] [%eval 1.99] }
  7. Bxf4 { [%txt "Le fou reprend."] [%eval 2.12] }
  7... Be7 { [%txt "Développement."] [%eval 2.03] }
  8. O-O { [%txt "On roque."] [%eval 2.36] }
  8... O-O { [%txt "À RETENIR.

PRO TIP : +2.28. Notre centre et nos pièces sont tous actifs. Contre ...exf4, reprends avec le fou : il vise d6."] [%eval 2.28] [%cal Gf4d6] })
7. Nxd4 { [%txt "Le cavalier reprend au centre."] [%eval 0.91] }
7... Be7 { [%txt "Le fou se développe."] [%eval 0.96] }
(7... Qb4 { [%txt "La dame attaque b2, mais elle s'expose : l'évaluation passe de +0.91 à +1.93."] [%hint "les Noirs promènent leur dame au lieu de se développer."] [%hint "la case b3. Notre cavalier d4 y défend b2 et la dame noire n'a plus de cible."] [%hint "8.Nb3 : on défend et on gagne un temps."] [%hintcsl Gb3,Rb4] [%eval 1.93] }
  8. Nb3 { [%txt "Le cavalier défend."] [%eval 1.86] }
  8... Qb6 { [%txt "La dame recule."] [%eval 1.98] }
  9. Qf3 { [%txt "À RETENIR.

PRO TIP : +1.98. Deux temps perdus par la dame noire. Contre une dame qui attaque b2, défends par un développement."] [%eval 1.98] [%csl Rb6] })
8. O-O { [%txt "On roque."] [%eval 1.03] }
8... O-O { [%txt "Les Noirs roquent."] [%eval 1.11] }
9. h3 { [%txt "On empêche ...Ng4 et ...Bg4."] [%eval 0.86] }
9... Na6 { [%txt "Le cavalier vise c5 et b4."] [%eval 0.83] }
10. Be3 { [%txt "Le fou se développe."] [%eval 0.84] }
10... Qc7 { [%txt "La dame recule."] [%eval 0.87] }
(10... c5 { [%txt "Les Noirs chassent le cavalier, mais d5 et d6 deviennent faibles : l'évaluation passe de +0.84 à +1.48."] [%hint "les Noirs poussent un pion qui affaiblit d5 et laisse d6 en retard."] [%hint "la case f3. Notre cavalier d4 y recule, et la case d5 est à nous."] [%hint "11.Nf3 : le cavalier recule et vise d5."] [%hintcsl Gd5,Rd6] [%eval 1.48] }
  11. Nf3 { [%txt "Le cavalier recule."] [%eval 1.77] }
  11... Nb4 { [%txt "Le cavalier attaque le fou d3."] [%eval 1.59] }
  12. Be2 { [%txt "À RETENIR.

PRO TIP : +1.77. Le pion d6 est faible et la case d5 est à nous. Un pion ...c5 qui chasse un cavalier laisse toujours un trou."] [%eval 1.77] [%csl Gd5] })
11. Qf3 { [%txt "La dame se développe et vise f7."] [%eval 0.93] }
11... Nc5 { [%txt "Le cavalier vise d3 et e4.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.87).
1. b4 : le pion chasse le cavalier c5.
2. Rae1 : toutes les pièces au centre.
3. e5 ou f5 au bon moment : le centre blanc avance."] [%eval 0.87] [%cal Gb2b4] }
(11... d5 { [%txt "Les Noirs frappent le centre, mais e5 chasse le cavalier : l'évaluation passe de +0.93 à +4.67."] [%hint "les Noirs ouvrent le centre alors que notre pion e4 peut avancer."] [%hint "la case e5. Notre pion y avance et chasse le cavalier f6."] [%hint "12.e5 : le pion attaque le cavalier."] [%hintcsl Ge5,Rf6] [%eval 4.67] }
  12. e5 { [%txt "Le pion chasse le cavalier."] [%eval 4.98] }
  12... Ne4 { [%txt "Le cavalier s'installe en e4."] [%eval 4.99] }
  13. Nxe4 { [%txt "On échange."] [%eval 5.28] }
  13... dxe4 { [%txt "À RETENIR.

PRO TIP : +5.21. Le pion e4 noir tombera : notre fou d3 et la dame f3 l'attaquent. Contre ...d5, e5 avec gain de temps est la réponse."] [%eval 5.21] [%csl Re4] }) *`,
    ),
    chapter(
      "Branche C : la Pirc avec le petit roque rapide, 5...O-O 6.O-O-O",
      `{ [%txt "LA PIRC AVEC 5...O-O.

Les Noirs roquent tout de suite. On roque du grand côté et on attaque : le fou g5 et le pion h viendront. Les Noirs contre-attaquent par ...Ng4 et ...c5 : il faut connaître les coups précis.

Points clés : contre ...Ng4, le fou e3 va en g5, jamais il ne se laisse échanger ; contre ...c5, on prend en c5 et on garde le pion le plus longtemps possible."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... d6 { [%txt "La Pirc."] [%eval 0.55] }
2. d4 { [%txt "Le centre."] [%eval 0.45] }
2... Nf6 { [%txt "Contre e4."] [%eval 0.54] }
3. Nc3 { [%txt "Défense."] [%eval 0.61] }
3... g6 { [%txt "Le fianchetto."] [%eval 0.59] }
4. Be3 { [%txt "L'attaque 150."] [%eval 0.60] }
4... Bg7 { [%txt "La grande diagonale."] [%eval 0.66] }
5. Qd2 { [%txt "Vers Bh6."] [%eval 0.79] }
5... O-O { [%txt "LE PETIT ROQUE RAPIDE."] [%eval 1.02] }
6. O-O-O { [%txt "Le grand roque : on attaque de l'autre côté."] [%eval 1.04] }
6... Ng4 { [%txt "Le cavalier attaque le fou e3."] [%eval 0.95] [%cal Gg4e3] }
(6... b5 { [%txt "Les Noirs sacrifient un pion pour l'attaque, mais le fou le prend sans risque : l'évaluation passe de +1.04 à +1.87."] [%hint "les Noirs avancent un pion que rien ne défend."] [%hint "le pion b5. Notre fou f1 le prend."] [%hint "7.Bxb5 : un pion de plus."] [%hintcsl Rb5,Gf1] [%eval 1.87] }
  7. Bxb5 { [%txt "On prend le pion."] [%eval 1.93] }
  7... c6 { [%txt "Les Noirs chassent le fou."] [%eval 2.07] }
  8. Ba4 { [%txt "À RETENIR.

PRO TIP : +1.91, un pion de plus. Un gambit ...b5 sans ...c6 préalable donne un pion pour rien."] [%eval 1.91] [%csl Gb5] })
7. Bg5 { [%txt "Le fou s'écarte et reste actif."] [%eval 1.03] }
7... c5 { [%txt "Les Noirs frappent d4."] [%eval 0.98] }
8. dxc5 { [%txt "On prend."] [%eval 1.05] }
8... Qa5 { [%txt "La dame vise a2 et c5."] [%eval 1.02] }
(8... h6 { [%txt "Les Noirs chassent le fou, mais il reste sur la diagonale : l'évaluation passe de +1.05 à +2.47."] [%hint "les Noirs affaiblissent leur roque en chassant un fou qui a une bonne retraite."] [%hint "la case h4. Notre fou y reste sur la diagonale d8-h4 et vise e7."] [%hint "9.Bh4 : le fou garde sa diagonale."] [%hintcsl Gh4,Rh6] [%eval 2.47] }
  9. Bh4 { [%txt "Le fou recule."] [%eval 2.66] }
  9... Qa5 { [%txt "La dame sort."] [%eval 2.63] }
  10. h3 { [%txt "À RETENIR.

PRO TIP : +2.59. Le cavalier g4 est chassé, le pion h6 est une cible. Contre ...h6, garde le fou sur la diagonale."] [%eval 2.59] [%cal Gh3g4] })
9. Nh3 { [%txt "Le cavalier vise f4 et défend f2."] [%eval 0.92] }
(9. cxd6 { [%txt "LA VARIANTE PIÉGÉE : on prend un deuxième pion…"] [%eval -0.57] [%csl Rc3] }
  9... Bxc3 { [%txt "…mais le fou prend le cavalier c3…"] [%eval -0.55] }
  10. bxc3 { [%txt "…on reprend…"] [%eval -0.47] }
  10... Qxa2 { [%txt "…et la dame noire entre en a2, contre notre roi. À RETENIR.

PRO TIP : -0.31. Le pion d6 était empoisonné : sans le cavalier c3, notre roque est ouvert. Nh3 d'abord."] [%eval -0.31] [%csl Ra2] })
9... Nc6 { [%txt "Le cavalier se développe."] [%eval 1.11] }
10. cxd6 { [%txt "On prend d6."] [%eval 0.63] }
10... Be6 { [%txt "Le fou se développe et vise a2."] [%eval 0.50] }
(10... Nb4 { [%txt "Le cavalier vise a2, mais le roi s'écarte : l'évaluation passe de +0.63 à +1.69."] [%hint "les Noirs lancent un cavalier seul vers notre roi."] [%hint "la case b1. Notre roi y quitte la diagonale et défend a2."] [%hint "11.Kb1 : le roi se met à l'abri."] [%hintcsl Gb1,Ra2] [%eval 1.69] }
  11. Kb1 { [%txt "Le roi s'abrite."] [%eval 1.87] }
  11... Bxc3 { [%txt "Les Noirs prennent."] [%eval 2.20] }
  12. Qxc3 { [%txt "À RETENIR.

PRO TIP : +1.86. Deux pions de plus, et notre roi est à l'abri. Contre un cavalier en b4, Kb1 suffit."] [%eval 1.86] [%csl Gb1] })
11. a3 { [%txt "On empêche ...Nb4."] [%eval 0.49] }
11... exd6 { [%txt "Les Noirs reprennent."] [%eval 0.67] }
12. f3 { [%txt "On chasse le cavalier g4."] [%eval 0.87] }
12... Rfc8 { [%txt "La tour vise c3.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.78).
1. fxg4 si le cavalier reste : une pièce de plus.
2. Nf4 : le cavalier attaque d6 et e6.
3. Kb1 : le roi à l'abri avant tout."] [%eval 0.78] [%cal Gf3g4] } *`,
    ),
    chapter(
      "Branche D : la Moderne, 1...g6 2.d4 Bg7 3.Nc3 d6 4.Be3 a6",
      `{ [%txt "LA MODERNE (1...g6).

Les Noirs gardent le cavalier g8 à la maison et jouent ...a6 et ...b5 à l'aile dame. On garde le même schéma : Be3, Qd2, f3, le grand roque, puis h4-h5. Contre la Moderne, le pion h avance encore plus vite, car le cavalier n'est pas en f6.

Points clés : le fou c8 noir vise souvent g4 ou b7 ; f3 lui retire g4."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... g6 { [%txt "LA MODERNE : le fou ira en g7 tout de suite."] [%eval 0.65] }
(1... d6 { [%txt "La Pirc : chapitres 1 à 4."] [%eval 0.55] })
2. d4 { [%txt "Le centre."] [%eval 0.66] }
2... Bg7 { [%txt "Le fou vise d4."] [%eval 0.68] }
3. Nc3 { [%txt "Le cavalier défend e4."] [%eval 0.67] }
3... d6 { [%txt "Les Noirs contrôlent e5. (3...c5 : chapitre 7.)"] [%eval 0.74] }
4. Be3 { [%txt "Le même schéma : Be3 et Qd2."] [%eval 0.74] }
4... a6 { [%txt "Les Noirs préparent ...b5."] [%eval 0.80] }
5. Qd2 { [%txt "La dame prépare le grand roque."] [%eval 0.59] }
5... b5 { [%txt "L'espace à l'aile dame."] [%eval 0.67] }
6. O-O-O { [%txt "Le grand roque."] [%eval 0.59] }
6... Nf6 { [%txt "Le cavalier se développe."] [%eval 0.60] }
(6... Bg4 { [%txt "Le fou sort, mais f3 le chasse avec gain de temps : l'évaluation passe de +0.59 à +1.68."] [%hint "les Noirs développent le fou sur une case que notre pion f peut attaquer."] [%hint "la case f3. Notre pion y chasse le fou g4."] [%hint "7.f3 : le fou doit reculer."] [%hintcsl Gf3,Rg4] [%eval 1.68] }
  7. f3 { [%txt "Le pion chasse le fou."] [%eval 1.66] }
  7... Bc8 { [%txt "Le fou recule."] [%eval 1.69] }
  8. g4 { [%txt "À RETENIR.

PRO TIP : +1.70. Deux temps perdus par le fou, nos pions avancent. Contre ...Bg4 dans la Moderne, f3 est toujours la réponse."] [%eval 1.70] [%cal Gg4g5] })
7. f3 { [%txt "Le pion soutient e4 et retire g4 au fou c8."] [%eval 0.58] }
(7. Be2 { [%txt "LA VARIANTE PIÉGÉE : un développement naturel…"] [%eval -0.44] [%csl Re4] }
  7... b4 { [%txt "…mais le pion chasse le cavalier c3…"] [%eval -0.46] }
  8. Na4 { [%txt "…qui recule…"] [%eval -0.37] }
  8... Nxe4 { [%txt "…et e4 tombe. À RETENIR.

PRO TIP : -0.40. Contre ...b5 et ...Nf6, le cavalier c3 est le seul défenseur de e4 : f3 d'abord."] [%eval -0.40] [%csl Re4] })
7... Nbd7 { [%txt "Le cavalier se développe."] [%eval 0.70] }
8. h4 { [%txt "Le pion h avance contre le roque noir."] [%eval 0.54] [%cal Gh4h5] }
8... Nb6 { [%txt "Le cavalier vise c4 et a4."] [%eval 0.57] }
(8... O-O { [%txt "Les Noirs roquent face à nos pions : l'évaluation passe de +0.54 à +1.68."] [%hint "les Noirs roquent du côté où nos pions avancent déjà."] [%hint "la case g4. Notre pion g y avance, puis h5 ouvre le jeu."] [%hint "9.g4 : la marée de pions."] [%hintcsl Gg4,Gh5] [%eval 1.68] }
  9. g4 { [%txt "Le pion g avance."] [%eval 1.47] }
  9... e5 { [%txt "Les Noirs frappent le centre."] [%eval 1.46] }
  10. h5 { [%txt "À RETENIR.

PRO TIP : +1.63. La colonne h va s'ouvrir vers le roi noir. Contre un roque face à nos pions, pousse g4 et h5 sans attendre."] [%eval 1.63] [%cal Gh5g6] })
9. Nh3 { [%txt "Le cavalier vise f2 et g5."] [%eval 0.57] }
9... c6 { [%txt "Le pion soutient b5."] [%eval 0.60] }
10. g4 { [%txt "Le pion g avance."] [%eval 0.58] }
10... h5 { [%txt "Les Noirs bloquent l'aile roi."] [%eval 0.36] }
11. g5 { [%txt "Le pion chasse le cavalier f6."] [%eval 0.43] }
11... Nfd7 { [%txt "Le cavalier recule.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.38).
1. f4 et f5 : le pion f ouvre l'aile roi.
2. Ng1-e2-f4 : le cavalier vise g6 et h5.
3. Kb1 : le roi à l'abri avant d'ouvrir."] [%eval 0.38] [%cal Gf3f5] }
(11... b4 { [%txt "Les Noirs chassent le cavalier c3, mais le cavalier f6 est attaqué : l'évaluation passe de +0.43 à +1.33."] [%hint "les Noirs poussent ...b4 alors que leur cavalier f6 est attaqué par notre pion g5."] [%hint "le cavalier f6. Notre pion g5 le prend."] [%hint "12.gxf6 : une pièce contre un pion."] [%hintcsl Rf6,Gg5] [%eval 1.33] }
  12. gxf6 { [%txt "On prend le cavalier."] [%eval 1.30] }
  12... bxc3 { [%txt "Les Noirs prennent."] [%eval 1.27] }
  13. Qxc3 { [%txt "À RETENIR.

PRO TIP : +1.29. Une pièce contre deux pions. Contre ...b4, regarde d'abord ce que ton pion g5 attaque."] [%eval 1.29] [%csl Rf6] }) *`,
    ),
    chapter(
      "Aléatoire surprise 2 : après la Moderne, le levier f5",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le chapitre 5 jusqu'à 11...Nfd7. La théorie s'arrête là. Les Noirs ne font pas de gaffe : ils jouent des coups de pièces pendant que notre pion f prépare le levier f5. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case clé (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Le roi noir est-il à l'abri ? 3. Quel coup ouvre une ligne vers lui ?"] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... g6 { [%txt "La Moderne."] [%eval 0.65] }
(1... d6 { [%txt "La Pirc : chapitres 1 à 4."] [%eval 0.55] })
2. d4 { [%txt "Le centre."] [%eval 0.66] }
2... Bg7 { [%txt "Le fou."] [%eval 0.68] }
3. Nc3 { [%txt "Défense."] [%eval 0.67] }
3... d6 { [%txt "Contre e5."] [%eval 0.74] }
4. Be3 { [%txt "Le schéma."] [%eval 0.74] }
4... a6 { [%txt "Vers ...b5."] [%eval 0.80] }
5. Qd2 { [%txt "Vers le grand roque."] [%eval 0.59] }
5... b5 { [%txt "L'espace."] [%eval 0.67] }
6. O-O-O { [%txt "Grand roque."] [%eval 0.59] }
6... Nf6 { [%txt "Développement."] [%eval 0.60] }
7. f3 { [%txt "Soutien de e4."] [%eval 0.58] }
7... Nbd7 { [%txt "Développement."] [%eval 0.70] }
8. h4 { [%txt "Le pion h."] [%eval 0.54] }
8... Nb6 { [%txt "Vers c4."] [%eval 0.57] }
9. Nh3 { [%txt "Vers f2 et g5."] [%eval 0.57] }
9... c6 { [%txt "Soutien."] [%eval 0.60] }
10. g4 { [%txt "Le pion g."] [%eval 0.58] }
10... h5 { [%txt "Blocage."] [%eval 0.36] }
11. g5 { [%txt "Chasse."] [%eval 0.43] }
11... Nfd7 { [%txt "Fin de la théorie."] [%eval 0.38] }
12. f4 { [%txt "Le pion f avance vers f5."] [%eval 0.36] [%cal Gf4f5] }
12... Qc7 { [%txt "La dame se développe, mais elle ne surveille plus f5 : l'évaluation passe de +0.36 à +1.24."] [%hint "les Noirs jouent un coup de dame pendant que notre pion f prépare le levier f5."] [%hint "la case f5. Notre pion y avance et attaque g6."] [%hint "13.f5 : le levier ouvre la colonne f."] [%hintcsl Gf5,Rg6] [%eval 1.24] }
13. f5 { [%txt "Le levier."] [%eval 1.23] [%cal Gf5g6] }
13... O-O { [%txt "Les Noirs roquent."] [%eval 1.39] }
14. fxg6 { [%txt "On prend."] [%eval 0.97] }
14... fxg6 { [%txt "Les Noirs reprennent."] [%eval 1.06] }
15. Nf4 { [%txt "Le cavalier vise g6 et e6."] [%eval 1.03] }
15... Rxf4 { [%txt "Les Noirs rendent la qualité pour casser l'attaque."] [%eval 1.48] }
16. Bxf4 { [%txt "On reprend."] [%eval 1.45] }
16... Nf8 { [%txt "Le cavalier défend h7, mais il bloque le roi : l'évaluation passe de +1.45 à +2.36."] [%hint "les Noirs ramènent un cavalier en défense au lieu de contester le centre."] [%hint "la case e5. Notre pion y avance et attaque d6."] [%hint "17.e5 : le pion casse le centre noir."] [%hintcsl Ge5,Rd6] [%eval 2.36] }
17. e5 { [%txt "Le pion avance."] [%eval 2.26] }
17... d5 { [%txt "Les Noirs ferment."] [%eval 2.46] }
18. Bh3 { [%txt "Le fou vise c8 et e6."] [%eval 2.46] }
18... Nc4 { [%txt "Une imprécision : le cavalier attaque la dame, mais e6 et g6 restent faibles. L'évaluation passe de +2.46 à +2.93."] [%eval 2.93] }
19. Qd3 { [%txt "À RETENIR.

PRO TIP : +2.88. La qualité de plus et une attaque sur g6. Contre la Moderne, le levier f5 ouvre la colonne f et casse g6."] [%eval 2.88] [%cal Gd3g6] } *`,
    ),
    chapter(
      "Branche E : la Moderne avec 3...c5",
      `{ [%txt "LA MODERNE AVEC 3...c5.

Les Noirs frappent d4 tout de suite, comme dans une Sicilienne. Le plus simple : 4.dxc5 et le pion c5 se défend par Bd2 et le développement. Les Noirs récupèrent le pion, mais notre développement et la case d5 donnent l'avantage.

Points clés : le fou g7 vise c3 ; Bd2 le neutralise. (3...c6, la Gurgenidze, se joue avec f4 et e5 ; 3...d6 : chapitre 5.)"] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... g6 { [%txt "La Moderne."] [%eval 0.65] }
(1... d6 { [%txt "La Pirc : chapitres 1 à 4."] [%eval 0.55] })
2. d4 { [%txt "Le centre."] [%eval 0.66] }
2... Bg7 { [%txt "Le fou vise d4."] [%eval 0.68] }
3. Nc3 { [%txt "Défense."] [%eval 0.67] }
3... c5 { [%txt "Les Noirs frappent d4."] [%eval 0.81] }
4. dxc5 { [%txt "On prend."] [%eval 0.72] }
(4. Bc4 { [%txt "LA VARIANTE PIÉGÉE : on développe en laissant d4…"] [%eval -0.87] [%csl Rd4] }
  4... cxd4 { [%txt "…les Noirs prennent…"] [%eval -0.90] }
  5. Nb5 { [%txt "…on attaque d4 et d6…"] [%eval -0.83] }
  5... a6 { [%txt "…mais le cavalier est chassé…"] [%eval -0.91] }
  6. Nxd4 { [%txt "…et nous avons perdu notre centre. À RETENIR.

PRO TIP : -0.90. Contre ...c5, prends en c5 tout de suite : le centre ne se défend pas tout seul."] [%eval -0.90] [%csl Rd4] })
4... Nc6 { [%txt "Le cavalier se développe."] [%eval 0.99] }
(4... Qc7 { [%txt "La dame vise c5, mais elle s'expose au cavalier : l'évaluation passe de +0.72 à +1.86."] [%hint "les Noirs placent la dame sur une case que notre cavalier c3 peut attaquer."] [%hint "la case d5. Notre cavalier y saute et attaque la dame."] [%hint "5.Nd5 : gain de temps."] [%hintcsl Gd5,Rc7] [%eval 1.86] }
  5. Nd5 { [%txt "Le cavalier attaque la dame."] [%eval 1.94] }
  5... Qxc5 { [%txt "La dame reprend."] [%eval 1.82] }
  6. Bf4 { [%txt "À RETENIR.

PRO TIP : +1.75. Le fou vise c7, la dame noire est mal placée. Contre une dame en c7, le cavalier d5 gagne toujours un temps."] [%eval 1.75] [%cal Gf4c7] })
5. Bd2 { [%txt "Le fou neutralise le fou g7."] [%eval 0.85] }
5... Nf6 { [%txt "Développement."] [%eval 0.77] }
6. Bc4 { [%txt "Le fou vise f7."] [%eval 0.87] }
6... O-O { [%txt "Les Noirs roquent."] [%eval 0.84] }
7. Nf3 { [%txt "Développement."] [%eval 0.94] }
7... d6 { [%txt "Les Noirs frappent c5."] [%eval 1.04] }
8. cxd6 { [%txt "On prend."] [%eval 1.05] }
8... Qxd6 { [%txt "La dame reprend."] [%eval 1.03] }
(8... Re8 { [%txt "Les Noirs préparent ...e6 au lieu de reprendre : l'évaluation passe de +1.05 à +2.01."] [%hint "les Noirs ne reprennent pas le pion d6."] [%hint "la case g5. Notre cavalier y saute et vise f7."] [%hint "9.Ng5 : f7 est attaqué deux fois."] [%hintcsl Gg5,Rf7] [%eval 2.01] }
  9. Ng5 { [%txt "Le cavalier vise f7."] [%eval 2.13] }
  9... Rf8 { [%txt "La tour revient défendre f7."] [%eval 2.10] }
  10. Bf4 { [%txt "À RETENIR.

PRO TIP : +2.21. Un pion de plus et les Noirs reculent. Contre un coup lent, cherche l'attaque sur f7."] [%eval 2.21] [%cal Gg5f7] })
9. h3 { [%txt "On empêche ...Bg4."] [%eval 1.03] }
9... Be6 { [%txt "Les Noirs proposent l'échange des fous."] [%eval 1.10] }
10. Bb3 { [%txt "Le fou recule."] [%eval 1.07] }
10... Bxb3 { [%txt "Les Noirs échangent."] [%eval 1.25] }
(10... Qc5 { [%txt "La dame vise b4 et f2, mais le fou la chasse : l'évaluation passe de +1.07 à +1.64."] [%hint "les Noirs placent la dame sur une case que notre fou peut attaquer."] [%hint "la case e3. Notre fou d2 y attaque la dame."] [%hint "11.Be3 : gain de temps."] [%hintcsl Ge3,Rc5] [%eval 1.64] }
  11. Be3 { [%txt "Le fou attaque la dame."] [%eval 1.61] }
  11... Qb4 { [%txt "La dame recule."] [%eval 1.59] }
  12. a3 { [%txt "À RETENIR.

PRO TIP : +1.82. La dame noire est chassée encore. Dans la Moderne avec ...c5, nos fous se développent avec gain de temps sur la dame."] [%eval 1.82] [%cal Ga3b4] })
11. axb3 { [%txt "On reprend : la colonne a s'ouvre.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+1.24).
1. O-O et Qe2 : on finit le développement.
2. Nb5 : le cavalier vise c7 et d6.
3. Ra4 : la tour active par la colonne a."] [%eval 1.24] [%cal Ga1a8] } *`,
    ),
    chapter(
      "Anti-panique : 2...e5, 2...c5 et les ordres de coups",
      `{ [%txt "ANTI-PANIQUE.

Contre 1...d6 ou 1...g6, les Noirs ont d'autres coups. Pas de panique : contre un coup qui frappe d4, prends ou avance le pion d, et développe.

PRO TIP : contre un coup rare, demande-toi d'abord si ton pion d peut avancer avec gain de temps."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... d6 { [%txt "La Pirc."] [%eval 0.55] }
(1... g6 { [%txt "La Moderne."] [%eval 0.65] }
  2. d4 { [%txt "Le centre."] [%eval 0.66] }
  2... Bg7 { [%txt "Le fou."] [%eval 0.68] }
  (2... Nc6 { [%txt "Le cavalier frappe d4, mais le pion avance avec gain de temps : l'évaluation passe de +0.66 à +1.66."] [%hint "les Noirs placent le cavalier devant le pion c, où notre pion d peut le chasser."] [%hint "la case d5. Notre pion y avance et chasse le cavalier."] [%hint "3.d5 : gain de temps et espace."] [%hintcsl Gd5,Rc6] [%eval 1.66] }
    3. d5 { [%txt "Le pion chasse le cavalier."] [%eval 1.74] }
    3... Nb8 { [%txt "Le cavalier recule."] [%eval 1.67] }
    4. Qd4 { [%txt "À RETENIR.

PRO TIP : +1.62. Le cavalier est revenu en b8, la dame attaque h8. Contre ...Nc6 dans la Moderne, d5."] [%eval 1.62] [%cal Gd4h8] })
  3. Nc3 { [%txt "Défense."] [%eval 0.67] }
  3... d5 { [%txt "Les Noirs frappent e4."] [%eval 0.58] }
  (3... e5 { [%txt "Les Noirs frappent d4, mais e5 se prend : l'évaluation passe de +0.67 à +1.57."] [%hint "les Noirs poussent ...e5 sans ...d6, et le pion n'est défendu que par le fou."] [%hint "le pion e5. Notre pion d4 le prend."] [%hint "4.dxe5 : un pion de plus."] [%hintcsl Re5,Gd4] [%eval 1.57] }
    4. dxe5 { [%txt "On prend."] [%eval 1.61] }
    (4. d5 { [%txt "LA VARIANTE PIÉGÉE : le pion avance et prend l'espace… mais le pion e5 noir devient solide et le fou g7 reste actif. À RETENIR.

PRO TIP : +0.62. Contre ...e5 sans ...d6, prends en e5 : le pion n'a pas de défenseur."] [%eval 0.62] [%csl Re5] })
    4... Nc6 { [%txt "Les Noirs attaquent e5."] [%eval 1.59] }
    5. f4 { [%txt "À RETENIR.

PRO TIP : +1.63, un pion de plus. Contre ...e5 sans ...d6, prends et soutiens par f4."] [%eval 1.63] [%csl Ge5] })
  4. exd5 { [%txt "On prend."] [%eval 0.52] }
  4... Nf6 { [%txt "Le cavalier vise d5."] [%eval 0.53] }
  5. Bb5+ { [%txt "L'échec gêne la reprise."] [%eval 0.61] }
  5... Nbd7 { [%txt "Les Noirs s'interposent."] [%eval 0.54] }
  6. Nf3 { [%txt "Développement."] [%eval 0.56] }
  6... O-O { [%txt "Les Noirs roquent."] [%eval 0.46] }
  7. O-O { [%txt "On roque."] [%eval 0.55] }
  7... Nb6 { [%txt "À RETENIR.

PRO TIP : +0.43. Le pion d5 tient, notre développement est meilleur. Contre ...d5 dans la Moderne, prends et défends par Bb5+."] [%eval 0.43] [%csl Gd5] })
2. d4 { [%txt "Le centre."] [%eval 0.45] }
2... e5 { [%txt "Les Noirs frappent d4 tout de suite."] [%eval 0.49] }
(2... c5 { [%txt "Les Noirs frappent d4, mais c5 se prend : l'évaluation passe de +0.45 à +1.23."] [%hint "les Noirs poussent ...c5 sans le défendre."] [%hint "le pion c5. Notre pion d4 le prend."] [%hint "3.dxc5 : un pion de plus, ou la dame noire se promène."] [%hintcsl Rc5,Gd4] [%eval 1.23] }
  3. dxc5 { [%txt "On prend."] [%eval 1.25] }
  3... Qa5+ { [%txt "La dame donne échec."] [%eval 1.23] }
  4. Nc3 { [%txt "On pare."] [%eval 1.22] }
  4... Qxc5 { [%txt "À RETENIR.

PRO TIP : +1.08. La dame noire est sortie tôt, notre développement prend de l'avance. Contre ...c5 sans préparation, dxc5."] [%eval 1.08] [%csl Rc5] })
3. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.65] }
3... Nd7 { [%txt "Le cavalier défend e5."] [%eval 0.56] }
4. c4 { [%txt "On prend l'espace."] [%eval 0.62] }
4... Ngf6 { [%txt "Développement."] [%eval 0.73] }
5. Nc3 { [%txt "Développement."] [%eval 0.75] }
5... g6 { [%txt "Le fianchetto."] [%eval 0.76] }
6. Be2 { [%txt "Développement."] [%eval 0.75] }
6... Bg7 { [%txt "Le fou."] [%eval 0.72] }
7. Be3 { [%txt "Développement."] [%eval 0.71] }
7... O-O { [%txt "Les Noirs roquent.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.73).
1. O-O et Qc2 : on finit le développement.
2. d5 au bon moment : l'espace à l'aile dame.
3. b4 et c5 : le levier contre d6."] [%eval 0.73] [%cal Gc4c5] } *`,
    ),
  ],
};
