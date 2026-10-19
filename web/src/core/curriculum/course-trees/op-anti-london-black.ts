import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours d'ouverture « Anti-Londres, setup Est-Indien (avec les Noirs) » —
 * onglet Ouvertures, format « un commentaire par coup » de l'Académie, lu par
 * `CourseTreeViewer` (route `/ouvertures/anti-london-black/cours`). Public
 * visé : 1500-1800 Elo, répertoire 1...Nf6 + ...g6/...Bg7/...O-O/...d6 contre
 * les systèmes lents à base de 1.d4 (fiche curatée `anti-london-black`, A48).
 *
 * ## Contenu (v2 du 2026-10-19, format Ruy Lopez v2, côté Noirs)
 *
 * 1. Fiche d'identité, tronc commun et le Londres accéléré (2.Bf4).
 * 2. Aléatoire surprise 1 : après le Londres accéléré, la chaîne d5-e4.
 * 3. Branche B : le Londres avec 2.Nf3 et le plan ...Nh5.
 * 4. Branche C : le système Colle (2.e3).
 * 5. Aléatoire surprise 2 : après la Colle, la colonne e ouverte.
 * 6. Branche D : la Trompowsky (2.Bg5), 2...g6.
 * 7. Branche E : l'Attaque Torre (2.Nf3 g6 3.Bg5).
 * 8. Anti-panique : 2.Nc3 (Jobava et Veresov), 2...d5.
 *
 * Choix des chapitres d'après les parties de l'utilisateur (26 parties contre
 * ces systèmes, 12,5 points) : Londres accéléré 2.Bf4 (8), Colle 2.e3 (6),
 * Londres 2.Nf3, Jobava/Veresov 2.Nc3 (4), Trompowsky (1 défaite), Torre.
 * Complété par la théorie que Stockfish soutient : contre le Londres sans h3,
 * ...Nh5 est le meilleur coup du moteur ; contre 2.Nc3, le setup ...g6
 * autorise 3.e4 (+0.69 environ), d'où 2...d5. Les branches théoriques
 * s'arrêtent au plus tard au demi-coup 27 ; les chapitres « Aléatoire
 * surprise » prolongent de 8 coups environ avec les Blancs comme camp « mou »
 * (`_tmp-drift-w.mts` : `_tmp-drift.mts` ne fait jouer « mou » que les Noirs).
 *
 * Convention côté Noirs (comme `op-caro-kann.ts`) : l'élève joue les Noirs ;
 * les fautes sont des coups BLANCS qui portent les 3 indices `[%hint]` +
 * `[%hintcsl]`, le coup noir suivant est la punition. Les « variantes
 * piégées » sont des coups noirs tentants mais perdants. Les évaluations
 * restent au point de vue des Blancs (négatif = avantage noir).
 *
 * Sources : théorie établie des systèmes 1.d4 sans c4, TOUTES les lignes
 * arbitrées par Stockfish 18 natif (profondeur 16). Contre le Londres
 * accéléré, le moteur préfère le double fianchetto (...b6, ...Bb7) avant
 * ...e5 : le cours le suit. Toute la prose est originale.
 *
 ## Architecture technique des nœuds
 *
 * Chaque nœud (`ChessMoveNode`, `core/chess/move-tree.ts`) porte :
 * - `evaluationScore` / `evaluationMate` : évaluation Stockfish 18 de la
 *   position après le coup (profondeur 16, point de vue Blancs), écrite
 *   `[%eval x]` ; `showEvalBar` est vrai dès qu'elle est posée ;
 * - `freeze` : posé par la balise `[%txt "…"]` qui enveloppe CHAQUE
 *   commentaire ; en mode « Jouer les coups », l'ordinateur attend
 *   « Suivant » ou Espace avant de répondre ;
 * - `hints` / `hintHighlights` : `[%hint "…"]` (3 indices progressifs) et
 *   `[%hintcsl …]` sur les fautes blanches qu'il faut punir.
 *
 * Fichier GÉNÉRÉ : ne pas l'éditer à la main. Source commentée :
 * `scripts/opening-course-src/anti-london-black.pgn` (et l'en-tête
 * `anti-london-black.header.txt`) ; regénérer avec
 * `node --import tsx scripts/_tmp-build-opening-course.mts <source> <en-tête> <sortie> 16`
 * (Stockfish natif, voir `scripts/_tmp-sf-native.mts`). Les `[%eval]` viennent
 * du moteur, pas de la main. Étape standard :
 * `scripts/_tmp-check-cited-evals.mts op-anti-london-black` doit sortir 0 écart
 * (un chiffre n'est cité dans un commentaire que s'il est l'éval d'un nœud).
 * Règles de l'utilisateur : SAN en texte brut uniquement (jamais de figurine
 * Unicode), pas de guillemet droit dans un `[%txt]`.
 */

function chapter(title: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, START) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const OP_ANTI_LONDON_BLACK: CourseTree = {
  chapters: [
    chapter(
      "Fiche d'identité, tronc commun et le Londres accéléré (2.Bf4)",
      `{ [%txt "L'ANTI-LONDRES, AVEC LES NOIRS : 1...Nf6 ET LE SETUP EST-INDIEN.

Le vrai enjeu : les systèmes lents des Blancs (Londres, Colle, Trompowsky, Torre) ne cherchent pas à réfuter notre défense, ils veulent une position sûre et facile à jouer. Notre réponse est un seul schéma : ...g6, ...Bg7, ...O-O et ...d6. Le fou g7 frappe d4 et b2, et le pion e5 (ou c5) viendra attaquer le centre au bon moment.

Le déséquilibre recherché : les Blancs gardent un centre d4-e3 solide mais passif ; nous gardons la poussée ...e5 en réserve. Le fou f4 du Londres est leur meilleure pièce : ...Nh5 ou ...e5 avec gain de temps la questionnent.

Ce que disent tes parties (26 contre ces systèmes, 12,5 points) : le Londres accéléré 2.Bf4 est le plus fréquent (8 parties), puis la Colle 2.e3 (6), le Londres avec 2.Nf3, Jobava et Veresov 2.Nc3, et une défaite contre la Trompowsky. Tes victoires viennent du plan ...Nh5 contre le fou f4 et de la poussée ...e5 bien préparée ; tes défaites, de ...d5 joué sans plan clair.

Les structures types (relevées sur la position finale de chaque chapitre) :
- Londres accéléré (ce chapitre) : Blancs a4-c3-d4-e3, Noirs a6-b6-d6-e5 ; la tension d4/e5 dure, nos deux fous visent le centre.
- Londres avec ...Nh5 : nous prenons le fou contre un cavalier, et les pions f blancs se doublent.
- Colle : le centre s'ouvre après e4 et ...d5 ; nos pièces sont plus actives.
- Trompowsky : une structure de Benoni, avec le levier ...b5 à l'aile dame.

Règle d'or : chaque coup noir a un rôle précis, dessiné par une flèche ou une case."] [%eval 0.37] }
1. d4 { [%txt "Les Blancs occupent le centre."] [%eval 0.29] }
1... Nf6 { [%txt "On contrôle e4 sans fixer nos pions : le même coup sert contre tous les systèmes à base de d4."] [%eval 0.29] [%cal Gf6e4] }
2. Bf4 { [%txt "LE LONDRES ACCÉLÉRÉ : le fou sort avant e3 et vise c7 et e5. (2.Nf3 : chapitre 3 ; 2.e3 : chapitre 4 ; 2.Bg5 : chapitre 6 ; 2.Nf3 et 3.Bg5 : chapitre 7 ; 2.Nc3 : chapitre 8.)"] [%eval 0.21] [%cal Gf4c7] }
2... g6 { [%txt "Le fianchetto : le fou g7 visera d4 et b2, et le roi sera à l'abri."] [%eval 0.22] [%cal Gg7d4] }
3. e3 { [%txt "Les Blancs ferment leur chaîne : le fou f4 est déjà dehors."] [%eval -0.04] }
3... Bg7 { [%txt "Le fou prend la grande diagonale."] [%eval 0.04] [%cal Gg7b2] }
4. Nf3 { [%txt "Développement."] [%eval 0.09] }
(4. e4 { [%txt "Le pion rejoue tout de suite : l'évaluation passe de +0.04 à -1.53."] [%hint "le pion e joue deux fois de suite, et aucune pièce blanche ne le soutient en e4."] [%hint "le pion e4. Notre cavalier f6 l'attaque, et le cavalier b1 n'est pas encore en c3 pour le défendre."] [%hint "4...Nxe4 : le cavalier prend le pion."] [%hintcsl Re4,Gf6] [%eval -1.53] }
  4... Nxe4 { [%txt "Le cavalier prend le pion."] [%eval -1.57] [%cal Gf6e4] }
  5. f3 { [%txt "Le pion attaque le cavalier."] [%eval -1.67] }
  5... Nd6 { [%txt "Le cavalier recule en surveillant c4 et f5."] [%eval -1.68] [%cal Gd6f5] }
  6. Ne2 { [%txt "Développement."] [%eval -1.61] }
  6... Nc6 { [%txt "À RETENIR.

PRO TIP : -1.69, un pion net de plus. En système lent, un pion qui rejoue sans soutien est un cadeau : compte toujours ses défenseurs."] [%eval -1.69] [%cal Gc6d4] })
4... O-O { [%txt "Le roi est à l'abri : maintenant on décide du plan central."] [%eval 0.13] [%csl Gg8] }
5. Be2 { [%txt "Développement."] [%eval 0.24] }
5... d6 { [%txt "Le pion contrôle e5 et prépare ...e5."] [%eval 0.21] [%cal Gd6e5] }
6. h3 { [%txt "Le fou f4 obtient une case de repli en h2 : ...Nh5 ne le prendra pas."] [%eval 0.18] [%csl Gh2] }
(6. Qd2 { [%txt "La dame se place sur une case qu'un cavalier peut attaquer : l'évaluation passe de +0.21 à -0.79."] [%hint "la dame se développe en d2, sur la route de notre cavalier f6."] [%hint "la case e4. Notre cavalier y saute et attaque la dame d2 ; ensuite ...e5 frappe le fou f4."] [%hint "6...Ne4 : le cavalier attaque la dame, puis ...e5."] [%hintcsl Ge4,Rd2] [%eval -0.79] }
  6... Ne4 { [%txt "Le cavalier attaque la dame."] [%eval -0.75] [%cal Ge4d2] }
  7. Qd1 { [%txt "La dame recule : deux temps perdus."] [%eval -0.80] }
  7... e5 { [%txt "La poussée arrive avec gain de temps sur le fou f4."] [%eval -0.80] [%cal Ge5f4] }
  8. dxe5 { [%txt "Les Blancs prennent."] [%eval -0.75] }
  8... Nd7 { [%txt "À RETENIR.

PRO TIP : -0.84. Le pion e5 tombera et nos pièces sont en avance. Contre le Londres, la dame en d2 est une cible pour ...Ne4 : guette ce saut à chaque coup de dame."] [%eval -0.84] [%cal Gd7e5] })
6... Nbd7 { [%txt "Le cavalier soutient ...e5."] [%eval 0.22] [%cal Gd7e5] }
7. O-O { [%txt "Les Blancs roquent."] [%eval 0.21] }
7... b6 { [%txt "On prépare le second fianchetto : le fou b7 surveillera e4."] [%eval 0.18] [%cal Gc8b7] }
8. Nbd2 { [%txt "Développement : le cavalier surveille e4."] [%eval 0.11] }
8... Bb7 { [%txt "Le fou vise e4 et f3 sur la grande diagonale."] [%eval 0.18] [%cal Gb7e4] }
9. a4 { [%txt "Les Blancs gagnent de l'espace à l'aile dame."] [%eval 0.14] }
9... a6 { [%txt "On empêche a5 de devenir gênant et on garde b5 sous contrôle."] [%eval 0.14] [%csl Gb5] }
10. c3 { [%txt "Les Blancs consolident d4."] [%eval 0.13] }
10... Re8 { [%txt "La tour soutient la future poussée ...e5."] [%eval 0.13] [%cal Ge8e5] }
(10... e5 { [%txt "LA VARIANTE PIÉGÉE : la poussée a l'air thématique…"] [%eval 1.31] [%csl Re5] }
  11. dxe5 { [%txt "…mais e5 est attaqué trois fois (pion d4, fou f4, cavalier f3)…"] [%eval 1.24] }
  11... dxe5 { [%txt "…on reprend…"] [%eval 1.49] [%cal Gd6e5] }
  12. Nxe5 { [%txt "…et le cavalier prend le pion. À RETENIR.

PRO TIP : +1.47, un pion de moins. ...e5 se prépare : ...Re8, puis ...Qe7 si besoin. Compte les attaquants de e5 avant de pousser."] [%eval 1.47] })
11. Qc2 { [%txt "La dame relie les tours et surveille e4."] [%eval 0.15] }
11... e5 { [%txt "MAINTENANT la poussée : e5 est défendu par le cavalier d7, la tour e8 et le fou g7."] [%eval 0.12] [%cal Ge5d4,Ge5f4] }
12. Bh2 { [%txt "Le fou recule sur sa case de repli."] [%eval 0.06] }
12... Qe7 { [%txt "La dame soutient e5 et libère la huitième rangée."] [%eval 0.03] [%cal Ge7e5] }
13. Rfc1 { [%txt "La tour se place sur la colonne c.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.06).
1. ...Rac8 ou ...Rec8 puis ...c5 : on attaque d4 par les deux côtés.
2. ...e4 seulement quand le cavalier f3 n'a plus de bonne case : c'est le gain d'espace du setup Est-Indien.
3. ...Nh5 si le fou h2 revient en f4 : on échange la meilleure pièce blanche."] [%eval 0.06] [%cal Ge5e4,Gc7c5] }
(13. Nh4 { [%txt "Le cavalier va au bord sans retraite : l'évaluation passe de +0.03 à -0.99."] [%hint "le cavalier part au bord, d'où il ne pourra revenir que par f3."] [%hint "la case f3. Un pion noir en e4 la contrôle, et le cavalier h4 n'a plus aucune case."] [%hint "13...e4 : le pion prend f3 au cavalier."] [%hintcsl Rh4,Rf3] [%eval -0.99] }
  13... e4 { [%txt "Le pion enlève f3 au cavalier h4."] [%eval -0.91] [%cal Ge4f3] }
  14. g4 { [%txt "Les Blancs cherchent g2 pour le cavalier."] [%eval -0.85] }
  14... h5 { [%txt "On attaque le pion g4 qui soutient le cavalier."] [%eval -0.87] [%cal Gh5g4] }
  15. Qb3 { [%txt "La dame cherche du contre-jeu."] [%eval -0.82] }
  15... Bd5 { [%txt "À RETENIR.

PRO TIP : -0.93. Le cavalier h4 est hors jeu et le roque blanc affaibli. Un cavalier au bord se punit en lui enlevant sa case de retour avec un pion."] [%eval -0.93] [%cal Gd5b3] }) *`,
    ),
    chapter(
      "Aléatoire surprise 1 : après le Londres accéléré, la chaîne d5-e4",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le Londres accéléré du chapitre 1 jusqu'à 13.Rfc1. La théorie s'arrête là : nous gagnons de l'espace avec ...e4 puis ...d5, et les Blancs jouent des coups de club qui ont l'air naturels et ne le sont pas. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case faible ou le pion à pousser (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quel levier de pion devient possible ? 3. Quelle pièce blanche peut-on priver de cases ?"] [%eval 0.37] }
1. d4 { [%txt "Le centre."] [%eval 0.29] }
1... Nf6 { [%txt "Contrôle de e4."] [%eval 0.29] [%cal Gf6e4] }
2. Bf4 { [%txt "Le Londres accéléré."] [%eval 0.21] }
2... g6 { [%txt "Le fianchetto."] [%eval 0.22] [%cal Gg7d4] }
3. e3 { [%txt "La chaîne."] [%eval -0.04] }
3... Bg7 { [%txt "La grande diagonale."] [%eval 0.04] [%cal Gg7b2] }
4. Nf3 { [%txt "Développement."] [%eval 0.09] }
4... O-O { [%txt "Roque."] [%eval 0.13] [%csl Gg8] }
5. Be2 { [%txt "Développement."] [%eval 0.24] }
5... d6 { [%txt "Contrôle de e5."] [%eval 0.21] [%cal Gd6e5] }
6. h3 { [%txt "La case h2 pour le fou."] [%eval 0.18] }
6... Nbd7 { [%txt "Soutien de ...e5."] [%eval 0.22] [%cal Gd7e5] }
7. O-O { [%txt "Roque."] [%eval 0.21] }
7... b6 { [%txt "Second fianchetto."] [%eval 0.18] [%cal Gc8b7] }
8. Nbd2 { [%txt "Développement."] [%eval 0.11] }
8... Bb7 { [%txt "La grande diagonale."] [%eval 0.18] [%cal Gb7e4] }
9. a4 { [%txt "Espace à l'aile dame."] [%eval 0.14] }
9... a6 { [%txt "Contrôle de b5."] [%eval 0.14] [%csl Gb5] }
10. c3 { [%txt "Soutien de d4."] [%eval 0.13] }
10... Re8 { [%txt "On prépare ...e5."] [%eval 0.13] [%cal Ge8e5] }
11. Qc2 { [%txt "La dame surveille e4."] [%eval 0.15] }
11... e5 { [%txt "La poussée préparée."] [%eval 0.12] [%cal Ge5d4] }
12. Bh2 { [%txt "Repli du fou."] [%eval 0.06] }
12... Qe7 { [%txt "Soutien de e5."] [%eval 0.03] [%cal Ge7e5] }
13. Rfc1 { [%txt "Fin de la théorie : la tour sur la colonne c."] [%eval 0.06] }
13... a5 { [%txt "On bloque l'aile dame : si b4, ...axb4 ouvre la colonne a."] [%eval 0.09] [%cal Ga5b4] }
14. Bb5 { [%txt "Le fou cloue le cavalier d7 contre la tour e8. Pas une faute : le moteur le juge correct."] [%eval 0.07] }
(14. c4 { [%txt "Le pion c quitte c3 et laisse d4 avec un soutien de moins : l'évaluation passe de +0.09 à -1.12."] [%hint "les Blancs poussent c4 et retirent le pion qui soutenait d4."] [%hint "le pion d4 et la grande diagonale. Après ...exd4, notre cavalier saute en e4 et le fou b7 vise la dame c2."] [%hint "14...exd4 15.Nxd4 Ne4 : on ouvre la diagonale du fou b7."] [%hintcsl Rd4,Ge4] [%eval -1.12] }
  14... exd4 { [%txt "On prend."] [%eval -1.07] [%cal Ge5d4] }
  15. Nxd4 { [%txt "Le cavalier reprend."] [%eval -1.16] }
  15... Ne4 { [%txt "Le cavalier saute en e4 et ouvre la diagonale du fou b7."] [%eval -1.07] [%cal Gf6e4] }
  16. Nxe4 { [%txt "Les Blancs échangent."] [%eval -1.09] }
  16... Bxe4 { [%txt "À RETENIR.

PRO TIP : -1.17. Le fou attaque la dame c2 et domine la grande diagonale. Quand les Blancs retirent un pion de soutien, cherche la diagonale qui s'ouvre."] [%eval -1.17] [%cal Ge4c2] })
14... e4 { [%txt "On gagne de l'espace : le cavalier f3 doit reculer."] [%eval 0.03] [%cal Ge4f3] }
15. Ne1 { [%txt "Le cavalier recule."] [%eval 0.02] }
15... Red8 { [%txt "La tour sort du clouage et soutient la poussée ...d5."] [%eval 0.15] [%cal Gd8d5] }
(15... Nd5 { [%txt "LA VARIANTE PIÉGÉE : le cavalier se centralise…"] [%eval 1.32] [%csl Re4] }
  16. Qxe4 { [%txt "…mais il bouche la diagonale du fou b7, qui défendait e4, et la dame prend le pion. À RETENIR.

PRO TIP : +1.37, un pion de moins. Avant de placer une pièce devant ton fou, vérifie ce que ce fou défendait."] [%eval 1.37] })
16. b4 { [%txt "Les Blancs ouvrent l'aile dame."] [%eval -0.10] }
16... c6 { [%txt "Le pion chasse le fou b5."] [%eval -0.05] [%cal Gc6b5] }
17. Bc4 { [%txt "Le fou recule."] [%eval -0.27] }
17... d5 { [%txt "Le pion chasse encore le fou et forme la chaîne d5-e4."] [%eval 0.00] [%cal Gd5c4] }
18. Bf1 { [%txt "Le fou se retire sur sa case de départ."] [%eval 0.00] }
18... c5 { [%txt "Le levier : on attaque b4 et d4 à la fois."] [%eval -0.03] [%cal Gc5b4,Gc5d4] }
19. Qb2 { [%txt "La dame ne règle pas la tension : l'évaluation passe de -0.03 à -0.77."] [%hint "les Blancs laissent la tension en c5 au lieu de prendre."] [%hint "la case c4. Notre pion c5 peut y avancer et priver le fou f1 et le cavalier d2 de leur meilleure case."] [%hint "19...c4 : la chaîne c4-d5-e4 étouffe les Blancs."] [%hintcsl Gc4,Rf1] [%eval -0.77] }
19... c4 { [%txt "La chaîne c4-d5-e4 est en place : le fou f1 n'a plus d'horizon."] [%eval -0.75] [%csl Rf1] [%cal Gc4b3] }
20. Nc2 { [%txt "Le cavalier revient par c2."] [%eval -0.71] }
20... Rdc8 { [%txt "La tour soutient c4 et prépare ...axb4."] [%eval -0.61] [%cal Gc8c4] }
21. Qa3 { [%txt "La dame va en a3, mais le pion b4 reste fragile : l'évaluation passe de -0.61 à -1.20."] [%hint "la dame quitte b2 et ne protège plus le pion b4 depuis la bonne case."] [%hint "le pion b4. Notre pion a5 et notre dame e7 l'attaquent ; un fou en f8 ajouterait un troisième attaquant."] [%hint "21...Bf8 : la batterie dame et fou contre b4."] [%hintcsl Rb4,Ga5] [%eval -1.20] }
21... Bf8 { [%txt "À RETENIR.

PRO TIP : -1.20, avantage noir net. La dame e7 et le fou f8 frappent b4, et le fou f1 blanc est enterré derrière la chaîne c4-d5-e4. La leçon : contre le Londres, gagne de l'espace avec ...e4 et ...d5, puis bloque l'aile dame avec ...c4."] [%eval -1.20] [%cal Gf8b4,Ge7b4] } *`,
    ),
    chapter(
      "Branche B : le Londres avec 2.Nf3 et le plan ...Nh5",
      `{ [%txt "LE SYSTÈME LONDRES CLASSIQUE : 2.Nf3, 3.Bf4, e3, Be2, O-O.

Sans h3, le fou f4 n'a pas de case de repli en h2. Notre arme : ...Nh5, qui attaque le fou. S'il recule en g5, ...h6 puis ...g5 le traquent, et le cavalier h5 saute en f4. C'est le plan de tes victoires dans cette ouverture.

La paire de fous et les pions f doublés des Blancs valent bien la structure un peu exposée de notre roi."] [%eval 0.37] }
1. d4 { [%txt "Le centre."] [%eval 0.29] }
1... Nf6 { [%txt "Contrôle de e4."] [%eval 0.29] [%cal Gf6e4] }
2. Nf3 { [%txt "Le Londres classique : le cavalier sort d'abord."] [%eval 0.31] }
(2. Bf4 { [%txt "Le Londres accéléré, chapitre 1."] [%eval 0.21] }
  2... g6 { [%txt "Le fianchetto."] [%eval 0.22] [%cal Gg7d4] })
2... g6 { [%txt "Le fianchetto."] [%eval 0.33] [%cal Gg7d4] }
3. Bf4 { [%txt "Le fou sort avant e3."] [%eval 0.15] [%cal Gf4c7] }
3... Bg7 { [%txt "Le fou prend la grande diagonale."] [%eval 0.14] [%cal Gg7b2] }
4. e3 { [%txt "La chaîne se ferme."] [%eval 0.16] }
4... O-O { [%txt "Roque."] [%eval 0.15] [%csl Gg8] }
5. Be2 { [%txt "Développement."] [%eval 0.14] }
5... d6 { [%txt "On contrôle e5."] [%eval 0.21] [%cal Gd6e5] }
6. O-O { [%txt "Les Blancs roquent sans jouer h3 : le fou f4 n'a pas de case de repli."] [%eval -0.08] }
6... Nh5 { [%txt "LE PLAN : le cavalier attaque le fou f4, la meilleure pièce blanche."] [%eval 0.03] [%cal Gh5f4] }
7. Bg5 { [%txt "Le fou évite l'échange."] [%eval 0.07] }
(7. Nbd2 { [%txt "Développement, mais le fou f4 reste attaqué : l'évaluation passe de +0.03 à -0.49."] [%hint "les Blancs développent une pièce au lieu de sauver le fou f4."] [%hint "le fou f4. Notre cavalier h5 le prend, et après exf4 les pions f sont doublés."] [%hint "7...Nxf4 8.exf4 : la paire de fous est à nous."] [%hintcsl Rf4,Gh5] [%eval -0.49] }
  7... Nxf4 { [%txt "On prend le fou."] [%eval -0.54] [%cal Gh5f4] }
  8. exf4 { [%txt "Le pion reprend : les pions f sont doublés."] [%eval -0.50] }
  8... c5 { [%txt "À RETENIR.

PRO TIP : -0.51. Paire de fous, et le levier ...c5 attaque d4, qui n'a plus le pion e3 pour l'aider. Contre le Londres sans h3, ...Nh5 gagne la paire de fous si les Blancs l'ignorent."] [%eval -0.51] [%cal Gc5d4] })
7... h6 { [%txt "On pose la question au fou."] [%eval 0.11] [%cal Gh6g5] }
8. Bh4 { [%txt "Le fou garde la diagonale."] [%eval 0.01] }
8... g5 { [%txt "On chasse encore le fou : le pion g5 ouvre la case f4 au cavalier."] [%eval 0.00] [%cal Gg5h4] }
9. Ne1 { [%txt "Le cavalier libère f3 pour le fou ou la dame."] [%eval 0.00] }
9... Nf4 { [%txt "Le cavalier s'installe en f4 et attaque le fou e2."] [%eval 0.10] [%cal Gf4e2] }
10. exf4 { [%txt "Les Blancs prennent le cavalier."] [%eval 0.04] }
10... gxh4 { [%txt "On reprend le fou : la paire de fous est à nous."] [%eval 0.04] [%cal Gg5h4] }
(10... Nc6 { [%txt "LA VARIANTE PIÉGÉE : un développement naturel…"] [%eval 4.24] [%csl Rg5] }
  11. fxg5 { [%txt "…mais le pion f4 prend g5, et le fou h4 est sauvé. À RETENIR.

PRO TIP : +4.07, une pièce de moins. Après un échange, reprends d'abord : un coup de développement ne vaut rien si tu as une pièce en moins."] [%eval 4.07] })
11. Nc3 { [%txt "Développement."] [%eval 0.08] }
11... Nc6 { [%txt "Le cavalier attaque d4."] [%eval 0.05] [%cal Gc6d4] }
12. Nf3 { [%txt "Le cavalier revient défendre d4."] [%eval 0.07] }
(12. Bd3 { [%txt "Développement, mais d4 reste seul : l'évaluation passe de +0.05 à -1.02."] [%hint "les Blancs développent leur fou au lieu de défendre d4."] [%hint "le pion d4. Il est attaqué par le cavalier c6 et le fou g7, et défendu par la seule dame d1."] [%hint "12...Nxd4 : le cavalier prend le pion."] [%hintcsl Rd4,Gc6,Gg7] [%eval -1.02] }
  12... Nxd4 { [%txt "Le cavalier prend le pion."] [%eval -0.99] [%cal Gc6d4] }
  13. Qh5 { [%txt "La dame cherche le roi."] [%eval -0.98] }
  13... e6 { [%txt "On ferme la diagonale h5-f7 et on contrôle f5."] [%eval -0.97] [%csl Gf5] }
  14. g4 { [%txt "Les Blancs attaquent."] [%eval -1.19] }
  14... f5 { [%txt "À RETENIR.

PRO TIP : -1.04, un pion de plus. Compte les attaquants et les défenseurs de d4 après chaque coup blanc : deux contre un, le pion tombe."] [%eval -1.04] [%cal Gf5g4] })
12... e5 { [%txt "Le levier central : on ouvre le jeu pour la paire de fous."] [%eval 0.08] [%cal Ge5d4] }
13. d5 { [%txt "Les Blancs ferment le centre."] [%eval 0.15] }
13... Ne7 { [%txt "Le cavalier part vers g6 ou f5.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.02).
1. ...Ng6 puis ...exf4 : le cavalier attaque f4 et h4.
2. ...f5 : on ouvre la colonne f et la diagonale du fou g7.
3. ...Kh8 et ...Rg8 : la colonne g ouverte sert à NOUS, elle mène au roi g1."] [%eval 0.02] [%cal Ge7g6,Gf7f5] } *`,
    ),
    chapter(
      "Branche C : le système Colle (2.e3)",
      `{ [%txt "LE SYSTÈME COLLE : e3, Nf3, Bd3, O-O, c3, Nbd2, puis e4.

Les Blancs ferment leur fou c1 et préparent la poussée e4. Contre le setup Est-Indien, notre réponse est ...d6, ...Nbd7 et ...e5 : on prend notre part du centre avant e4, puis ...d5 au bon moment.

C'est la ligne de deux de tes défaites : le centre s'ouvre vite, et la pièce la plus active gagne."] [%eval 0.37] }
1. d4 { [%txt "Le centre."] [%eval 0.29] }
1... Nf6 { [%txt "Contrôle de e4."] [%eval 0.29] [%cal Gf6e4] }
2. e3 { [%txt "LE COLLE : les Blancs ferment leur fou c1."] [%eval 0.15] }
(2. Bf4 { [%txt "Le Londres accéléré, chapitre 1."] [%eval 0.21] }
  2... g6 { [%txt "Le fianchetto."] [%eval 0.22] [%cal Gg7d4] })
2... g6 { [%txt "Le fianchetto."] [%eval 0.22] [%cal Gg7d4] }
3. Nf3 { [%txt "Développement."] [%eval 0.22] }
3... Bg7 { [%txt "La grande diagonale."] [%eval 0.23] [%cal Gg7b2] }
4. Bd3 { [%txt "Le fou vise h7."] [%eval -0.12] }
4... O-O { [%txt "Roque."] [%eval 0.23] [%csl Gg8] }
5. O-O { [%txt "Les Blancs roquent."] [%eval -0.07] }
5... d6 { [%txt "On contrôle e5 et on prépare ...e5."] [%eval 0.30] [%cal Gd6e5] }
6. c3 { [%txt "Les Blancs soutiennent d4."] [%eval 0.11] }
6... Nbd7 { [%txt "Le cavalier soutient ...e5."] [%eval 0.21] [%cal Gd7e5] }
7. Nbd2 { [%txt "Le cavalier prépare e4."] [%eval 0.10] }
7... e5 { [%txt "On prend notre part du centre avant e4."] [%eval 0.22] [%cal Ge5d4] }
8. e4 { [%txt "La poussée prévue par les Blancs."] [%eval 0.05] }
(8. Ne4 { [%txt "Le cavalier saute en e4, mais il s'échange contre notre cavalier : l'évaluation passe de +0.22 à -0.85."] [%hint "les Blancs mettent leur cavalier en e4 au lieu d'y pousser leur pion."] [%hint "la case e4. Après ...Nxe4 Bxe4 Nf6, le fou est chassé et notre pion e5 avance en e4."] [%hint "8...Nxe4 9.Bxe4 Nf6 : on chasse le fou, puis ...e4."] [%hintcsl Ge4] [%eval -0.85] }
  8... Nxe4 { [%txt "On échange."] [%eval -0.84] [%cal Gf6e4] }
  9. Bxe4 { [%txt "Le fou reprend."] [%eval -0.80] }
  9... Nf6 { [%txt "Le cavalier chasse le fou."] [%eval -0.86] [%cal Gf6e4] }
  10. Bc2 { [%txt "Le fou recule."] [%eval -0.78] }
  10... e4 { [%txt "À RETENIR.

PRO TIP : -0.86. Le pion e4 chasse le cavalier f3 et gagne de l'espace : c'est l'Est-Indienne à l'envers, à notre profit. Quand e4 est libre, avance-y ton pion."] [%eval -0.86] [%cal Ge4f3] })
8... Re8 { [%txt "La tour soutient e5 et vise la colonne e."] [%eval 0.41] [%cal Ge8e5] }
(8... Nxe4 { [%txt "LA VARIANTE PIÉGÉE : le pion e4 a l'air seul…"] [%eval 2.64] [%csl Re4] }
  9. Bxe4 { [%txt "…mais il était défendu par le cavalier d2 et le fou d3. À RETENIR.

PRO TIP : +2.89, une pièce contre un pion. Avant de prendre au centre, compte les défenseurs : ici deux, pour un seul attaquant."] [%eval 2.89] })
9. Re1 { [%txt "La tour soutient e4."] [%eval 0.38] }
(9. Qe2 { [%txt "La dame se place sur la colonne e, face à notre tour : l'évaluation passe de +0.41 à -0.86."] [%hint "la dame se met sur la même colonne que notre tour e8."] [%hint "le centre. Après ...exd4 cxd4 c5, le pion d4 est attaqué et le pion e4 se retrouve face à notre tour."] [%hint "9...exd4 10.cxd4 c5 : on ouvre le jeu contre le centre blanc."] [%hintcsl Rd4,Re4] [%eval -0.86] }
  9... exd4 { [%txt "On ouvre le centre."] [%eval -0.97] [%cal Ge5d4] }
  10. cxd4 { [%txt "Le pion reprend."] [%eval -0.97] }
  10... c5 { [%txt "On attaque d4 une deuxième fois."] [%eval -1.04] [%cal Gc5d4] }
  11. Nc4 { [%txt "Le cavalier se place."] [%eval -0.95] }
  11... Bf8 { [%txt "À RETENIR.

PRO TIP : -0.75. Le centre blanc est attaqué et la dame e2 se trouve sur la colonne de notre tour. Contre la Colle, ouvre le centre dès qu'une pièce blanche se place sur la colonne e."] [%eval -0.75] [%cal Ge8e4] })
9... c6 { [%txt "On prépare ...d5."] [%eval 0.44] [%cal Gc6d5] }
10. a4 { [%txt "Les Blancs gagnent de l'espace."] [%eval 0.37] }
10... d5 { [%txt "LE LEVIER : ...d5 au moment où toutes nos pièces sont prêtes."] [%eval 0.45] [%cal Gd5e4] }
11. exd5 { [%txt "Les Blancs prennent."] [%eval 0.46] }
11... Nxd5 { [%txt "Le cavalier reprend et se centralise.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.49).
1. ...exd4 au bon moment : le pion c3 doit reprendre et la colonne e s'ouvre pour notre tour.
2. ...Nf4 ou ...N7f6 : nos cavaliers visent le roque blanc.
3. Ne jamais laisser le fou d3 et la dame en batterie contre h7 sans un défenseur en f6."] [%eval 0.49] [%cal Ge5d4,Gd5f4] } *`,
    ),
    chapter(
      "Aléatoire surprise 2 : après la Colle, la colonne e ouverte",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend la Colle du chapitre 4 jusqu'à 11...Nxd5. La théorie s'arrête là. Les Blancs ne font pas de gaffe : ils jouent des coups lents pendant que le centre s'ouvre, et nos pièces deviennent plus actives à chaque échange. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case faible ou la pièce mal défendue (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quelle colonne ou quelle diagonale vient de s'ouvrir ? 3. Quelle pièce blanche n'est plus défendue ?"] [%eval 0.37] }
1. d4 { [%txt "Le centre."] [%eval 0.29] }
1... Nf6 { [%txt "Contrôle de e4."] [%eval 0.29] [%cal Gf6e4] }
2. e3 { [%txt "Le Colle."] [%eval 0.15] }
(2. Bf4 { [%txt "Le Londres accéléré, chapitre 1."] [%eval 0.21] }
  2... g6 { [%txt "Le fianchetto."] [%eval 0.22] [%cal Gg7d4] })
2... g6 { [%txt "Le fianchetto."] [%eval 0.22] [%cal Gg7d4] }
3. Nf3 { [%txt "Développement."] [%eval 0.22] }
3... Bg7 { [%txt "La grande diagonale."] [%eval 0.23] [%cal Gg7b2] }
4. Bd3 { [%txt "Le fou vise h7."] [%eval -0.12] }
4... O-O { [%txt "Roque."] [%eval 0.23] [%csl Gg8] }
5. O-O { [%txt "Roque."] [%eval -0.07] }
5... d6 { [%txt "Contrôle de e5."] [%eval 0.30] [%cal Gd6e5] }
6. c3 { [%txt "Soutien de d4."] [%eval 0.11] }
6... Nbd7 { [%txt "Soutien de ...e5."] [%eval 0.21] [%cal Gd7e5] }
7. Nbd2 { [%txt "Préparation de e4."] [%eval 0.10] }
7... e5 { [%txt "Notre part du centre."] [%eval 0.22] [%cal Ge5d4] }
8. e4 { [%txt "La poussée."] [%eval 0.05] }
8... Re8 { [%txt "La colonne e."] [%eval 0.41] [%cal Ge8e5] }
9. Re1 { [%txt "Soutien de e4."] [%eval 0.38] }
9... c6 { [%txt "Préparation de ...d5."] [%eval 0.44] [%cal Gc6d5] }
10. a4 { [%txt "Espace."] [%eval 0.37] }
10... d5 { [%txt "Le levier."] [%eval 0.45] [%cal Gd5e4] }
11. exd5 { [%txt "Échange."] [%eval 0.46] }
11... Nxd5 { [%txt "Fin de la théorie : le cavalier se centralise."] [%eval 0.49] [%csl Gd5] }
12. Rb1 { [%txt "Un coup de tour sans plan : l'évaluation passe de +0.49 à -0.36."] [%hint "les Blancs jouent un coup de préparation lente pendant que la tension e5-d4 reste en place."] [%hint "la colonne e. Après ...exd4, notre tour e8 et la tour e1 se font face, et le centre blanc disparaît."] [%hint "12...exd4 : on ouvre la colonne e."] [%hintcsl Re1,Gd4] [%eval -0.36] }
12... exd4 { [%txt "On ouvre la colonne e."] [%eval -0.29] [%cal Ge5d4] }
13. Rxe8+ { [%txt "Les Blancs échangent les tours."] [%eval -0.27] }
13... Qxe8 { [%txt "La dame reprend et prend la colonne e."] [%eval -0.29] [%cal Ge8e1] }
14. Nxd4 { [%txt "Le cavalier reprend le pion."] [%eval -0.31] }
14... N7f6 { [%txt "Le second cavalier rejoint le jeu."] [%eval -0.33] [%cal Gf6e4] }
15. Nc4 { [%txt "Le cavalier se place."] [%eval -0.24] }
15... Bg4 { [%txt "Le fou attaque la dame d1."] [%eval -0.28] [%cal Gg4d1] }
(15... Bf5 { [%txt "LA VARIANTE PIÉGÉE : on propose l'échange des fous…"] [%eval 2.26] [%csl Rf5] }
  16. Nxf5 { [%txt "…mais le cavalier d4 prend le fou…"] [%eval 2.49] }
  16... gxf5 { [%txt "…on reprend…"] [%eval 2.49] [%cal Gg6f5] }
  17. Nd6 { [%txt "…et le cavalier fourche la dame e8 et le pion f5. À RETENIR.

PRO TIP : +2.54, une pièce de moins. Avant de poser un fou sur une case, vérifie qu'un cavalier adverse ne la contrôle pas."] [%eval 2.54] })
16. Be2 { [%txt "Le fou s'interpose, mais le cavalier d4 devient une cible : l'évaluation passe de -0.28 à -0.94."] [%hint "les Blancs bouchent la diagonale avec leur fou au lieu de déplacer leur dame."] [%hint "le cavalier d4. Notre pion c peut l'attaquer, et le fou e2 reste cloué devant la dame."] [%hint "16...c5 : le pion attaque le cavalier d4."] [%hintcsl Rd4,Re2] [%eval -0.94] }
16... c5 { [%txt "Le pion attaque le cavalier d4."] [%eval -1.02] [%cal Gc5d4] }
17. Bxg4 { [%txt "Les Blancs échangent les fous."] [%eval -0.94] }
17... cxd4 { [%txt "On prend le cavalier : notre pion d4 frappe c3."] [%eval -0.94] [%cal Gd4c3] }
18. Be2 { [%txt "Le fou recule, mais c3 tombe : l'évaluation passe de -0.94 à -2.67."] [%hint "le fou recule sans s'occuper du pion c3."] [%hint "le pion c3. Notre pion d4 le prend ; si bxc3, notre cavalier d5 prend en c3 en attaquant la dame d1 et la tour b1."] [%hint "18...dxc3 : le pion prend, et bxc3 perd sur ...Nxc3."] [%hintcsl Rc3,Rb1,Rd1] [%eval -2.67] }
18... dxc3 { [%txt "Le pion prend c3."] [%eval -2.66] [%cal Gd4c3] }
19. Bf1 { [%txt "Les Blancs ne peuvent pas reprendre : bxc3 perdrait sur ...Nxc3."] [%eval -2.93] }
19... Rd8 { [%txt "À RETENIR.

PRO TIP : -2.98, avantage noir décisif. Le pion c3 est passé et notre tour prend la colonne d. La leçon : contre la Colle, ouvre la colonne e dès que les Blancs perdent un temps, puis attaque les pièces qui défendent le centre."] [%eval -2.98] [%cal Gd8d1] } *`,
    ),
    chapter(
      "Branche D : la Trompowsky (2.Bg5)",
      `{ [%txt "LA TROMPOWSKY : 2.Bg5.

Les Blancs menacent Bxf6, qui abîmerait nos pions. Avec le setup Est-Indien, on répond 2...g6 : si Bxf6, ...exf6 donne une structure solide et la paire de fous ; sinon, ...Bg7, ...O-O et ...c5 mènent à un jeu de Benoni, avec le levier ...b5 à l'aile dame.

C'est la ligne d'une de tes défaites : il faut savoir quoi faire après e4 et d5."] [%eval 0.37] }
1. d4 { [%txt "Le centre."] [%eval 0.29] }
1... Nf6 { [%txt "Contrôle de e4."] [%eval 0.29] [%cal Gf6e4] }
2. Bg5 { [%txt "LA TROMPOWSKY : le fou menace Bxf6."] [%eval 0.03] }
(2. Bf4 { [%txt "Le Londres accéléré, chapitre 1."] [%eval 0.21] }
  2... g6 { [%txt "Le fianchetto."] [%eval 0.22] [%cal Gg7d4] })
2... g6 { [%txt "On accepte Bxf6 : ...exf6 donnerait une structure solide et la paire de fous."] [%eval 0.21] [%cal Gg7d4] }
3. Nd2 { [%txt "Le cavalier soutient e4."] [%eval 0.19] }
3... Bg7 { [%txt "La grande diagonale."] [%eval 0.18] [%cal Gg7b2] }
4. c3 { [%txt "Les Blancs préparent e4."] [%eval 0.15] }
(4. f4 { [%txt "Un pion de l'aile roi avance trop tôt : l'évaluation passe de +0.18 à -1.11."] [%hint "le pion f avance et affaiblit la case e3 et la diagonale du roi blanc."] [%hint "la case g4. Notre cavalier y saute et vise e3 et h2 ; ensuite ...c5 frappe d4."] [%hint "4...Ng4 : le cavalier s'installe, puis ...c5."] [%hintcsl Gg4,Re3] [%eval -1.11] }
  4... Ng4 { [%txt "Le cavalier vise e3."] [%eval -1.16] [%cal Gg4e3] }
  5. Nb3 { [%txt "Le cavalier défend d4."] [%eval -1.10] }
  5... c5 { [%txt "On attaque d4."] [%eval -1.08] [%cal Gc5d4] }
  6. c3 { [%txt "Les Blancs soutiennent d4."] [%eval -1.18] }
  6... cxd4 { [%txt "À RETENIR.

PRO TIP : -1.22. Le centre blanc s'effrite et e3 reste faible. Chaque poussée de pion devant le roi ouvre une case pour nos cavaliers : ici g4."] [%eval -1.22] [%csl Gg4] })
4... O-O { [%txt "Roque."] [%eval 0.10] [%csl Gg8] }
5. e4 { [%txt "Les Blancs prennent le centre."] [%eval 0.11] }
5... c5 { [%txt "On frappe tout de suite d4."] [%eval 0.20] [%cal Gc5d4] }
(5... Nxe4 { [%txt "LA VARIANTE PIÉGÉE : le pion e4 a l'air seul…"] [%eval 2.91] [%csl Re4] }
  6. Nxe4 { [%txt "…le cavalier d2 reprend…"] [%eval 2.87] }
  6... d5 { [%txt "…on croit gagner la pièce par la fourchette…"] [%eval 2.79] [%cal Gd5e4] }
  7. Ng3 { [%txt "…mais le cavalier s'échappe. À RETENIR.

PRO TIP : +2.72, une pièce contre un pion. Une fourchette de pion ne marche que si la pièce attaquée n'a aucune case : vérifie ses retraites."] [%eval 2.72] })
6. d5 { [%txt "Les Blancs ferment le centre : c'est une structure de Benoni."] [%eval 0.21] }
(6. Bf4 { [%txt "Le fou quitte g5, mais b2 reste sans défense : l'évaluation passe de +0.20 à -0.75."] [%hint "le fou recule, alors que notre pression sur d4 et b2 grandit."] [%hint "le pion b2 et le pion d4. Une dame noire en b6 les attaque tous les deux."] [%hint "6...Qb6 : la dame attaque b2 et d4."] [%hintcsl Rb2,Rd4] [%eval -0.75] }
  6... Qb6 { [%txt "La dame attaque b2 et d4."] [%eval -0.78] [%cal Gb6b2,Gb6d4] }
  7. e5 { [%txt "Les Blancs avancent."] [%eval -0.95] }
  7... Nd5 { [%txt "Le cavalier se centralise et attaque f4."] [%eval -0.86] [%cal Gd5f4] }
  8. Nc4 { [%txt "Le cavalier attaque la dame."] [%eval -0.93] }
  8... Qe6 { [%txt "À RETENIR.

PRO TIP : -0.99. Le pion e5 est attaqué et le centre blanc vacille. Dans la Trompowsky, quand le fou quitte g5, regarde tout de suite la case b6 pour ta dame."] [%eval -0.99] [%cal Ge6e5] })
6... d6 { [%txt "On bloque e5 et on prépare ...b5."] [%eval 0.19] [%cal Gd6e5] }
7. f4 { [%txt "Les Blancs gagnent de l'espace au centre."] [%eval 0.31] }
7... a6 { [%txt "On prépare ...b5."] [%eval 0.26] [%cal Ga6b5] }
8. a4 { [%txt "Les Blancs freinent ...b5."] [%eval 0.21] }
8... Nbd7 { [%txt "Développement."] [%eval 0.16] [%cal Gd7b6] }
9. Ngf3 { [%txt "Développement."] [%eval 0.20] }
9... Rb8 { [%txt "La tour soutient ...b5."] [%eval 0.24] [%cal Gb8b5] }
10. a5 { [%txt "Les Blancs bloquent l'aile dame."] [%eval 0.27] }
10... h6 { [%txt "On pose la question au fou."] [%eval 0.27] [%cal Gh6g5] }
11. Bh4 { [%txt "Le fou garde le clouage."] [%eval 0.27] }
11... b5 { [%txt "LE LEVIER : on ouvre l'aile dame malgré a5."] [%eval 0.20] [%cal Gb5b4] }
12. axb6 { [%txt "Les Blancs prennent en passant."] [%eval 0.21] }
(12. Be2 { [%txt "Développement, mais f4 devient une cible : l'évaluation passe de +0.20 à -0.66."] [%hint "les Blancs développent leur fou sans s'occuper de la case f4 et du pion f4."] [%hint "le pion f4. Notre cavalier f6 peut aller en h5, puis en f4 si le pion avance."] [%hint "12...Nh5 : le cavalier attaque f4."] [%hintcsl Rf4,Gh5] [%eval -0.66] }
  12... Nh5 { [%txt "Le cavalier attaque f4."] [%eval -0.60] [%cal Gh5f4] }
  13. f5 { [%txt "Le pion avance."] [%eval -0.59] }
  13... g5 { [%txt "On bloque l'aile roi : la case f4 nous appartient."] [%eval -0.70] [%csl Gf4] }
  14. Bf2 { [%txt "Le fou recule."] [%eval -0.71] }
  14... Nf4 { [%txt "À RETENIR.

PRO TIP : -0.54. Le cavalier f4 domine le fou e2 et la case e2. Quand le pion f blanc avance, la case f4 devient un avant-poste pour nos cavaliers."] [%eval -0.54] [%csl Gf4] })
12... Nxb6 { [%txt "Le cavalier reprend : la colonne b est ouverte pour notre tour.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.23).
1. ...Rb8 et ...Qc7 : la colonne b contre b2.
2. ...Nfd7 puis ...c4 : le cavalier rejoint c5 et la case d3.
3. ...e6 au bon moment : on casse le pion d5 et le fou g7 s'ouvre."] [%eval 0.23] [%cal Gb8b2] } *`,
    ),
    chapter(
      "Branche E : l'Attaque Torre (2.Nf3 g6 3.Bg5)",
      `{ [%txt "L'ATTAQUE TORRE : 2.Nf3, 3.Bg5, Nbd2, e3.

Le fou g5 cloue un peu le cavalier f6, et les Blancs veulent jouer e4. Notre réponse : ...d6, ...h6 pour poser la question au fou, ...Nc6 et ...Qe8, puis ...e5. La dame e8 soutient e5 et dégage d8 pour la tour."] [%eval 0.37] }
1. d4 { [%txt "Le centre."] [%eval 0.29] }
1... Nf6 { [%txt "Contrôle de e4."] [%eval 0.29] [%cal Gf6e4] }
2. Nf3 { [%txt "Développement."] [%eval 0.31] }
(2. Bf4 { [%txt "Le Londres accéléré, chapitre 1."] [%eval 0.21] }
  2... g6 { [%txt "Le fianchetto."] [%eval 0.22] [%cal Gg7d4] })
2... g6 { [%txt "Le fianchetto."] [%eval 0.33] [%cal Gg7d4] }
3. Bg5 { [%txt "LA TORRE : le fou se place en g5."] [%eval 0.07] }
3... Bg7 { [%txt "La grande diagonale."] [%eval 0.09] [%cal Gg7b2] }
4. Nbd2 { [%txt "Le cavalier soutient e4."] [%eval 0.03] }
4... O-O { [%txt "Roque."] [%eval 0.01] [%csl Gg8] }
5. e3 { [%txt "Les Blancs ferment leur chaîne."] [%eval 0.13] }
(5. Ne5 { [%txt "Le cavalier saute au centre, sans soutien : l'évaluation passe de +0.01 à -0.61."] [%hint "le cavalier joue deux fois au lieu de développer une nouvelle pièce."] [%hint "la case e5. Notre pion d6 la chasse, et le cavalier devra reculer."] [%hint "5...d6 : le cavalier est chassé avec gain de temps."] [%hintcsl Re5,Gd6] [%eval -0.61] }
  5... d6 { [%txt "On chasse le cavalier."] [%eval -0.64] [%cal Gd6e5] }
  6. Nef3 { [%txt "Le cavalier recule."] [%eval -0.65] }
  6... c5 { [%txt "On frappe d4."] [%eval -0.60] [%cal Gc5d4] }
  7. e3 { [%txt "Les Blancs soutiennent d4."] [%eval -0.71] }
  7... cxd4 { [%txt "À RETENIR.

PRO TIP : -0.67. Deux temps perdus pour les Blancs et le centre s'ouvre. Contre les systèmes lents, chaque saut de cavalier sans soutien se paie par un pion qui le chasse."] [%eval -0.67] [%cal Gc5d4] })
5... d6 { [%txt "On contrôle e5."] [%eval 0.07] [%cal Gd6e5] }
6. Be2 { [%txt "Développement."] [%eval -0.01] }
6... h6 { [%txt "On pose la question au fou."] [%eval 0.01] [%cal Gh6g5] }
7. Bh4 { [%txt "Le fou garde la diagonale."] [%eval 0.04] }
7... Nc6 { [%txt "Le cavalier vise d4 et e5."] [%eval 0.04] [%cal Gc6d4] }
8. O-O { [%txt "Les Blancs roquent."] [%eval 0.01] }
(8. e4 { [%txt "La poussée centrale, roi au centre : l'évaluation passe de +0.04 à -0.69."] [%hint "les Blancs poussent e4 alors que leur roi est encore en e1 et que le fou h4 peut être chassé."] [%hint "le fou h4 et le pion d4. Après ...g5 et ...g4, le cavalier f3 doit partir, et d4 perd un défenseur."] [%hint "8...g5 9.Bg3 g4 : on chasse le cavalier f3, puis ...Nxd4."] [%hintcsl Rh4,Rd4] [%eval -0.69] }
  8... g5 { [%txt "On chasse le fou."] [%eval -0.53] [%cal Gg5h4] }
  9. Bg3 { [%txt "Le fou recule."] [%eval -0.59] }
  9... g4 { [%txt "On chasse le cavalier f3, défenseur de d4."] [%eval -0.72] [%cal Gg4f3] }
  10. Nh4 { [%txt "Le cavalier recule."] [%eval -0.73] }
  10... Nxd4 { [%txt "À RETENIR.

PRO TIP : -0.71, un pion de plus. Le pion d4 n'avait plus que le cavalier f3 comme défenseur : chasse le défenseur, puis prends."] [%eval -0.71] [%cal Gc6d4] })
8... Qe8 { [%txt "La dame soutient ...e5 et libère d8 pour la tour."] [%eval 0.05] [%cal Ge8e5] }
(8... Nxd4 { [%txt "LA VARIANTE PIÉGÉE : le pion d4 semble pris deux fois…"] [%eval 3.15] [%csl Rd4] }
  9. exd4 { [%txt "…mais le pion e3 reprend. À RETENIR.

PRO TIP : +3.09, une pièce contre un pion. d4 était défendu par e3 et le cavalier f3 : avec deux défenseurs, la prise perd une pièce."] [%eval 3.09] })
9. h3 { [%txt "Les Blancs donnent une case au fou en h2."] [%eval -0.02] }
9... e5 { [%txt "La poussée : e5 est soutenu par la dame, le cavalier c6 et le pion d6."] [%eval 0.01] [%cal Ge5d4] }
10. c3 { [%txt "Les Blancs soutiennent d4."] [%eval 0.03] }
(10. e4 { [%txt "La poussée centrale laisse d4 sans soutien de pion : l'évaluation passe de +0.01 à -1.22."] [%hint "le pion e3 avance et ne soutient plus d4."] [%hint "le pion d4. Notre pion e5 le prend, et le cavalier c6 surveille la case."] [%hint "10...exd4 : on gagne un pion au centre."] [%hintcsl Rd4] [%eval -1.22] }
  10... exd4 { [%txt "On prend."] [%eval -1.27] [%cal Ge5d4] }
  11. Re1 { [%txt "La tour soutient e4."] [%eval -1.22] }
  11... Nh5 { [%txt "À RETENIR.

PRO TIP : -1.35, un pion de plus. Avant chaque poussée blanche, demande-toi quel pion elle laisse sans soutien : ici d4."] [%eval -1.35] [%cal Gh5f4] })
10... a5 { [%txt "On gagne de l'espace et on prépare ...Nd7."] [%eval -0.05] [%cal Ga5a4] }
11. Bb5 { [%txt "Le fou cloue le cavalier c6 contre la dame e8."] [%eval -0.08] }
11... Nd7 { [%txt "Le cavalier libère la diagonale du fou g7 et soutient e5."] [%eval -0.08] [%cal Gg7e5] }
12. dxe5 { [%txt "Les Blancs ouvrent le centre."] [%eval -0.07] }
12... dxe5 { [%txt "On reprend : le centre est équilibré."] [%eval -0.02] [%csl Ge5] }
13. e4 { [%txt "Les Blancs fixent le pion e5.

À RETENIR.

PRO TIP : la feuille de route après la théorie (-0.03).
1. ...Na7 ou ...Nb6 : on chasse le fou b5 et on débloque la dame e8.
2. ...Nc5 puis ...Ne6 : le cavalier rejoint f4 et d4.
3. ...Kh7 et ...f5 : le levier de l'Est-Indienne contre e4."] [%eval -0.03] [%cal Gf7f5] } *`,
    ),
    chapter(
      "Anti-panique : 2.Nc3 (Jobava et Veresov)",
      `{ [%txt "ANTI-PANIQUE : 2.Nc3.

Contre 2.Nc3, le setup Est-Indien autorise 3.e4 et une Pirc que tu ne joues pas. On répond donc 2...d5 : le cavalier c3 bloque le pion c, et ...c5 frappe d4 tout de suite.

La ligne principale traite la Jobava (3.Bf4) ; une variante traite la Veresov (3.Bg5)."] [%eval 0.37] }
1. d4 { [%txt "Le centre."] [%eval 0.29] }
1... Nf6 { [%txt "Contrôle de e4."] [%eval 0.29] [%cal Gf6e4] }
2. Nc3 { [%txt "Le cavalier devant le pion c : les Blancs préparent e4 ou Bf4."] [%eval -0.07] }
(2. Bf4 { [%txt "Le Londres accéléré, chapitre 1."] [%eval 0.21] }
  2... g6 { [%txt "Le fianchetto."] [%eval 0.22] [%cal Gg7d4] })
2... d5 { [%txt "On empêche e4 : contre 2.Nc3, ...d5 est le coup le plus précis."] [%eval 0.03] [%csl Ge4] [%cal Gd5e4] }
3. Bf4 { [%txt "LA JOBAVA : le fou vise c7."] [%eval 0.03] }
(3. Bg5 { [%txt "LA VERESOV : le fou cloue le cavalier f6."] [%eval -0.25] }
  3... h6 { [%txt "On pose la question au fou."] [%eval -0.21] [%cal Gh6g5] }
  4. Bh4 { [%txt "Le fou garde le clouage."] [%eval -0.19] }
  4... c5 { [%txt "Le levier : le cavalier c3 ne peut pas soutenir d4 avec un pion c."] [%eval -0.26] [%cal Gc5d4] }
  5. e3 { [%txt "Les Blancs soutiennent d4."] [%eval -0.23] }
  5... cxd4 { [%txt "On prend."] [%eval -0.45] [%cal Gc5d4] }
  6. exd4 { [%txt "Le pion reprend."] [%eval -0.41] }
  6... Nc6 { [%txt "À RETENIR.

PRO TIP : -0.35. Les Noirs sont mieux : pression sur d4 et jeu facile. Contre la Veresov, ...h6 puis ...c5 : le cavalier c3 bouche le pion c blanc."] [%eval -0.35] [%cal Gc6d4] })
3... c5 { [%txt "Le levier immédiat contre d4."] [%eval 0.02] [%cal Gc5d4] }
4. e3 { [%txt "Les Blancs soutiennent d4."] [%eval 0.04] }
(4. dxc5 { [%txt "Les Blancs prennent le pion, mais perdent le centre : l'évaluation passe de +0.02 à -0.51."] [%hint "les Blancs prennent sur c5 et laissent notre pion d5 avancer avec gain de temps."] [%hint "la case d4. Notre pion y avance et chasse le cavalier c3."] [%hint "4...d4 : le pion chasse le cavalier, puis ...e5."] [%hintcsl Gd4,Rc3] [%eval -0.51] }
  4... d4 { [%txt "Le pion chasse le cavalier."] [%eval -0.59] [%cal Gd4c3] }
  5. Nb1 { [%txt "Le cavalier retourne à la maison."] [%eval -0.78] }
  5... e5 { [%txt "On attaque le fou f4 avec gain de temps."] [%eval -0.79] [%cal Ge5f4] }
  6. Bxe5 { [%txt "Le fou prend le pion."] [%eval -0.84] }
  6... Nc6 { [%txt "À RETENIR.

PRO TIP : -0.62. Les Noirs ont trois pièces de plus en jeu et le fou e5 est attaqué. Contre la Jobava, quand les Blancs prennent en c5, la poussée ...d4 gagne le centre."] [%eval -0.62] [%cal Gc6e5] })
4... Bg4 { [%txt "Le fou sort avant ...e6 et vise la dame d1."] [%eval 0.03] [%cal Gg4d1] }
5. Be2 { [%txt "Les Blancs proposent l'échange."] [%eval 0.00] }
5... Bxe2 { [%txt "On échange."] [%eval 0.00] [%cal Gg4e2] }
(5... Qb6 { [%txt "LA VARIANTE PIÉGÉE : la dame attaque b2…"] [%eval 4.05] [%csl Rg4] }
  6. Bxg4 { [%txt "…mais le fou e2 prend notre fou g4, qui n'était plus défendu. À RETENIR.

PRO TIP : +3.82, une pièce de moins. Avant une attaque de dame, vérifie que toutes tes pièces sont protégées."] [%eval 3.82] })
6. Qxe2 { [%txt "La dame reprend."] [%eval 0.00] }
(6. Kxe2 { [%txt "Le roi reprend : il ne pourra plus roquer. L'évaluation passe de 0.00 à -0.71."] [%hint "le roi reprend au lieu de la dame."] [%hint "le roi e2 et le pion d4. Notre cavalier b8 peut attaquer d4 tout de suite, et le roi blanc reste sur la colonne e."] [%hint "6...Nc6 : le cavalier attaque d4, puis ...e6 et l'ouverture du centre."] [%hintcsl Re2,Rd4] [%eval -0.71] }
  6... Nc6 { [%txt "Le cavalier attaque d4."] [%eval -0.74] [%cal Gc6d4] }
  7. Nf3 { [%txt "Le cavalier défend d4."] [%eval -0.71] }
  7... e6 { [%txt "À RETENIR.

PRO TIP : -0.67. Le roi blanc est bloqué au centre et nos pièces sortent : ...cxd4 ouvrira la colonne c et la diagonale du fou f8. Un roi qui ne peut plus roquer est une cible durable : ouvre le centre."] [%eval -0.67] [%csl Re2] [%cal Gf8b4] })
6... Nbd7 { [%txt "Le cavalier soutient c5."] [%eval 0.00] [%cal Gd7c5] }
7. dxc5 { [%txt "Les Blancs prennent."] [%eval -0.01] }
(7. e4 { [%txt "La poussée centrale ouvre le jeu au mauvais moment : l'évaluation passe de 0.00 à -0.86."] [%hint "les Blancs ouvrent le centre alors que d4 est attaqué par notre pion c5."] [%hint "le pion d4. Notre pion c5 le prend, puis le pion d5 blanc tombera."] [%hint "7...cxd4 : on prend, et la dame vient en a5."] [%hintcsl Rd4] [%eval -0.86] }
  7... cxd4 { [%txt "On prend."] [%eval -0.93] [%cal Gc5d4] }
  8. Nxd5 { [%txt "Le cavalier prend d5."] [%eval -0.90] }
  8... Nxd5 { [%txt "On reprend."] [%eval -0.95] [%cal Gf6d5] }
  9. exd5 { [%txt "Le pion reprend."] [%eval -1.04] }
  9... Qa5+ { [%txt "À RETENIR.

PRO TIP : -0.94. L'échec attaque d5 et nous gagnons le pion. Quand le centre s'ouvre, la dame en a5 frappe souvent un pion et le roi."] [%eval -0.94] [%cal Ga5e1,Ga5d5] })
7... e6 { [%txt "On ouvre la diagonale du fou f8 : il reprendra en c5."] [%eval 0.11] [%cal Gf8c5] }
8. O-O-O { [%txt "Les Blancs roquent du grand côté."] [%eval 0.15] }
8... Qa5 { [%txt "La dame vise a2 et c5.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.12).
1. ...Bxc5 puis ...O-O : développement complet.
2. ...Rc8 et ...b5 : le roi c1 est sur notre colonne c.
3. Échanger les dames si elles sont proposées : le roi blanc aura moins de défenseurs en finale."] [%eval 0.12] [%cal Ga5a2,Gc8c1] } *`,
    ),
  ],
};
