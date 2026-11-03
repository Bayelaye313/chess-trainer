import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours d'ouverture « Défense des Deux Cavaliers (avec les Noirs) » — onglet
 * Ouvertures, format « un commentaire par coup » de l'Académie, lu par
 * `CourseTreeViewer` (route `/ouvertures/italian-game-black/cours`). Public
 * visé : 1500-1800 Elo, répertoire 1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 (fiche
 * curatée `italian-game-black`, C55).
 *
 * ## Contenu (v2 du 2026-10-19, format Ruy Lopez v2, côté Noirs)
 *
 * 1. Fiche d'identité, tronc commun et 4.Ng5 d5 5.exd5 Na5 6.Bb5+.
 * 2. Aléatoire surprise 1 : après 4.Ng5, la batterie contre h2.
 * 3. Branche B : 6.d3, la Variante Morphy.
 * 4. Branche C : le Pianissimo 4.d3 Bc5 5.c3.
 * 5. Aléatoire surprise 2 : après le Pianissimo, le roi blanc au centre.
 * 6. Branche D : le Pianissimo avec roque, 4.d3 Bc5 5.O-O.
 * 7. Branche E : 4.d4 (5.O-O Nxe4 6.Re1 d5, et 5.e5 d5).
 * 8. Anti-panique : 4.Nc3 (4...Nxe4 5.Nxe4 d5) et 4.O-O.
 *
 * Choix des chapitres d'après les parties de l'utilisateur (28 Italiennes
 * avec les Noirs, 22 points) : 4.Ng5 joué souvent et bien maîtrisé (8.Qf3,
 * jouée contre lui, est gardée en variante « imprécision ») ; les défaites
 * viennent du Pianissimo 4.d3, d'où deux chapitres et une surprise. Le cours
 * suit le moteur : levier ...d5 contre 5.c3, ...a6/...Ba7/...Ng4 contre
 * 5.O-O. Les branches théoriques s'arrêtent au plus tard au demi-coup 27 ;
 * les chapitres « Aléatoire surprise » prolongent de 8 coups environ avec les
 * Blancs comme camp « mou » (`_tmp-drift-w.mts` : `_tmp-drift.mts` ne fait
 * jouer « mou » que les Noirs).
 *
 * Convention côté Noirs (comme `op-caro-kann.ts`) : l'élève joue les Noirs ;
 * les fautes sont des coups BLANCS qui portent les 3 indices `[%hint]` +
 * `[%hintcsl]`, le coup noir suivant est la punition. Les « variantes
 * piégées » sont des coups noirs tentants mais perdants (dont le Fegatello
 * 5...Nxd5?). Les évaluations restent au point de vue des Blancs.
 *
 * Sources : théorie établie des Deux Cavaliers, TOUTES les lignes arbitrées
 * par Stockfish 19 natif (profondeur 16) ; quelques coups blancs de la ligne
 * principale sont des choix du moteur peu usuels en club (12.Kh1 au
 * chapitre 1, 8.Nd4 dans la Morphy). Toute la prose est originale.
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
 * `scripts/opening-course-src/italian-game-black.pgn` (et l'en-tête
 * `italian-game-black.header.txt`) ; regénérer avec
 * `node --import tsx scripts/_tmp-build-opening-course.mts <source> <en-tête> <sortie> 16`
 * (Stockfish natif, voir `scripts/_tmp-sf-native.mts`). Les `[%eval]` viennent
 * du moteur, pas de la main. Étape standard :
 * `scripts/_tmp-check-cited-evals.mts op-italian-game-black` doit sortir 0 écart
 * (un chiffre n'est cité dans un commentaire que s'il est l'éval d'un nœud).
 * Règles de l'utilisateur : SAN en texte brut uniquement (jamais de figurine
 * Unicode), pas de guillemet droit dans un `[%txt]`.
 */

function chapter(title: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, START) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const OP_ITALIAN_GAME_BLACK: CourseTree = {
  chapters: [
    chapter(
      "Fiche d'identité, tronc commun et 4.Ng5 d5 5.exd5 Na5",
      `{ [%txt "LA DÉFENSE DES DEUX CAVALIERS, AVEC LES NOIRS.

Le vrai enjeu : contre l'Italienne, 3...Nf6 contre-attaque e4 au lieu de protéger f7. Si les Blancs foncent sur f7 avec 4.Ng5, on donne un pion (4...d5 5.exd5 Na5) contre un développement rapide et l'initiative.

Le déséquilibre recherché : un pion de moins contre deux temps d'avance et des pièces actives. Le cavalier blanc de g5 et le fou blanc doivent reculer plusieurs fois : c'est ce temps perdu qui paie notre pion.

Ce que disent tes parties : 28 Italiennes avec les Noirs, 22 points. Contre 4.Ng5, tu joues déjà bien ...d5 et ...Na5 (presque toutes gagnées). Tes défaites viennent du Pianissimo 4.d3 (chapitres 4 à 6) : des positions lentes où il faut un plan, le levier ...d5.

Les structures types (relevées sur la position finale de chaque chapitre) :
- 4.Ng5 (ce chapitre) : pions noirs a7-c6-f7-g7-h6, pion e4 avancé ; les Blancs ont un pion de plus mais moins d'espace.
- Pianissimo : centre ouvert après ...d5, ou chaîne d3-e4 contre d6-e5 avec le fou a7.
- 4.d4 : centre ouvert, pièces très actives, finale équilibrée.

Règle d'or : chaque coup noir a un rôle précis, dessiné par une flèche ou une case."] [%eval 0.33] }
1. e4 { [%txt "Les Blancs occupent le centre."] [%eval 0.36] }
1... e5 { [%txt "Symétrie : on conteste le centre."] [%eval 0.36] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.29] }
2... Nc6 { [%txt "Le cavalier défend e5."] [%eval 0.18] [%cal Gc6e5] }
3. Bc4 { [%txt "L'Italienne : le fou vise f7."] [%eval 0.10] [%cal Gc4f7] }
3... Nf6 { [%txt "LES DEUX CAVALIERS : on contre-attaque e4 au lieu de protéger f7."] [%eval 0.11] [%cal Gf6e4] }
4. Ng5 { [%txt "Les Blancs attaquent f7 deux fois : Nxf7 fourcherait la dame et la tour. (4.d3 : chapitres 4 et 6 ; 4.d4 : chapitre 7 ; 4.Nc3 et 4.O-O : chapitre 8.)"] [%eval 0.24] [%cal Rg5f7,Rc4f7] }
4... d5 { [%txt "On bouche la diagonale du fou c4."] [%eval 0.12] [%cal Gd5c4] }
(4... Nxe4 { [%txt "LA VARIANTE PIÉGÉE : on prend e4 en oubliant f7…"] [%eval 1.54] [%csl Rf7] }
  5. Bxf7+ { [%txt "…le fou prend f7 avec échec, et le roi noir est exposé. À RETENIR.

PRO TIP : +1.92. Contre 4.Ng5, f7 est attaqué deux fois : ...d5 est obligatoire."] [%eval 2.57] })
5. exd5 { [%txt "Les Blancs prennent : le pion d5 bloque toujours la diagonale."] [%eval 0.10] }
5... Na5 { [%txt "On attaque le fou c4 : c'est le coup moderne, qui donne le pion pour l'initiative."] [%eval 0.30] [%cal Ga5c4] }
(5... Nxd5 { [%txt "LA VARIANTE PIÉGÉE : la reprise naturelle…"] [%eval 0.98] [%csl Rf7] }
  6. Nxf7 { [%txt "…mais le cavalier se sacrifie en f7 : c'est le Fegatello."] [%eval 0.96] }
  6... Kxf7 { [%txt "On prend…"] [%eval 0.85] }
  7. Qf3+ { [%txt "…la dame attaque le roi et le cavalier d5 en même temps."] [%eval 0.77] }
  7... Ke6 { [%txt "Le roi doit défendre le cavalier."] [%eval 0.94] [%cal Ge6d5] }
  8. Nc3 { [%txt "Les Blancs ajoutent un attaquant sur d5."] [%eval 1.13] }
  8... Nb4 { [%txt "Le cavalier défend d5."] [%eval 0.85] [%cal Gb4d5] }
  9. Bb3 { [%txt "À RETENIR.

PRO TIP : +0.85. Notre roi est au centre sous le feu : contre 4.Ng5, ne reprends jamais en d5 avec le cavalier, joue 5...Na5."] [%eval 0.73] })
6. Bb5+ { [%txt "Le fou recule avec échec."] [%eval 0.13] }
(6. Qe2 { [%txt "La dame protège le fou indirectement, mais il reste attaqué : l'évaluation passe de +0.30 à -1.02."] [%hint "les Blancs ne règlent pas le problème du fou c4, toujours attaqué par le cavalier a5."] [%hint "le fou c4. Notre cavalier le prend ; après la reprise de la dame, notre dame reprend le pion d5."] [%hint "6...Nxc4 7.Qxc4 Qxd5 : on récupère le pion avec la paire de fous."] [%hintcsl Rc4,Rd5] [%eval -1.02] }
  6... Nxc4 { [%txt "On prend le fou."] [%eval -1.06] [%cal Ga5c4] }
  7. Qxc4 { [%txt "La dame reprend."] [%eval -1.22] }
  7... Qxd5 { [%txt "La dame reprend le pion d5."] [%eval -1.15] [%cal Gd8d5] }
  8. Qxd5 { [%txt "Échange des dames."] [%eval -1.15] }
  8... Nxd5 { [%txt "À RETENIR.

PRO TIP : -1.08. Pion récupéré et paire de fous. Quand le fou c4 est attaqué par le cavalier a5, il doit bouger tout de suite : sinon il disparaît et d5 tombe."] [%eval -1.08] [%csl Gd5] })
6... c6 { [%txt "On chasse le fou avec un pion : le pion d5 blanc va disparaître."] [%eval 0.11] [%cal Gc6b5] }
7. dxc6 { [%txt "Les Blancs prennent."] [%eval 0.11] }
7... bxc6 { [%txt "On reprend vers le centre : la colonne b s'ouvre pour notre tour."] [%eval 0.09] [%cal Ga8b8] }
8. Be2 { [%txt "Le fou recule à l'abri."] [%eval -0.06] }
(8. Ba4 { [%txt "Le fou garde l'attaque sur c6, mais il s'éloigne du jeu : l'évaluation passe de +0.09 à -1.76."] [%hint "le fou part sur le bord au lieu de rentrer en e2 ou d3."] [%hint "le cavalier g5. Après ...h6, il doit reculer, et en f3 il serait chassé par ...e4."] [%hint "8...h6 : le cavalier recule en h3, loin du centre."] [%hintcsl Rg5,Ra4] [%eval -1.76] }
  8... h6 { [%txt "On chasse le cavalier."] [%eval -1.75] [%cal Gh6g5] }
  9. Nh3 { [%txt "Le cavalier recule au bord."] [%eval -1.93] }
  9... Bg4 { [%txt "Le fou attaque la dame et prépare ...Bxh3."] [%eval -1.80] [%cal Gg4d1] }
  10. f3 { [%txt "Le pion chasse le fou."] [%eval -2.02] }
  10... Bxh3 { [%txt "À RETENIR.

PRO TIP : -1.59. Le roque blanc est abîmé et nos pièces sont déjà actives. Dans les Deux Cavaliers, chaque pièce blanche qui part au bord nous rend le pion avec intérêts."] [%eval -1.93] [%cal Gh3g2] })
(8. Qf3 { [%txt "Ta partie : la dame attaque c6 et a8. Ce n'est pas une faute, mais c'est moins précis que 8.Be2 ou 8.Bd3."] [%eval -0.16] }
  8... cxb5 { [%txt "On prend le fou : la tour a8 tombera, mais nous gagnons une pièce."] [%eval -0.17] [%cal Gc6b5] }
  9. Qxa8 { [%txt "La dame prend la tour."] [%eval 0.00] }
  9... Qc7 { [%txt "La dame menace ...Bb7, qui enfermerait la dame a8."] [%eval 0.10] [%cal Gc8b7] }
  10. Qf3 { [%txt "La dame s'échappe."] [%eval 0.14] }
  10... Nc6 { [%txt "À RETENIR.

PRO TIP : -0.22, l'équilibre : une pièce contre une tour et des pions, avec une grosse avance de développement. Si la dame va en a8, coupe-lui la retraite."] [%eval -0.22] [%cal Gc6d4] })
8... h6 { [%txt "On chasse le cavalier g5."] [%eval -0.04] [%cal Gh6g5] }
9. Nf3 { [%txt "Le cavalier recule."] [%eval -0.14] }
9... e4 { [%txt "Le pion chasse encore le cavalier : deuxième temps gagné."] [%eval -0.09] [%cal Ge4f3] }
10. Ne5 { [%txt "Le cavalier se centralise."] [%eval -0.08] }
(10. Ng1 { [%txt "Le cavalier retourne à la maison : l'évaluation passe de -0.09 à -1.15."] [%hint "le cavalier revient sur sa case de départ : les Blancs ont joué quatre coups de cavalier pour rien."] [%hint "le développement. Notre fou f8 sort avec gain de temps en c5, contre f2."] [%hint "10...Bc5 : développement et pression sur f2."] [%hintcsl Gc5,Rf2] [%eval -1.15] }
  10... Bc5 { [%txt "Le fou vise f2."] [%eval -1.08] [%cal Gc5f2] }
  11. d4 { [%txt "Le pion attaque le fou."] [%eval -1.18] }
  11... exd3 { [%txt "On prend en passant."] [%eval -1.18] [%cal Ge4d3] }
  12. Qxd3 { [%txt "La dame reprend."] [%eval -1.33] }
  12... Qb6 { [%txt "À RETENIR.

PRO TIP : -1.15. La dame et le fou visent f2 et b2, le roi blanc n'a pas roqué. L'initiative vaut plus qu'un pion quand l'adversaire est en retard de trois coups."] [%eval -1.40] [%cal Gb6f2] })
10... Bc5 { [%txt "Le fou vise f2 et prépare le roque."] [%eval -0.04] [%cal Gc5f2] }
11. O-O { [%txt "Les Blancs roquent."] [%eval -0.03] }
11... O-O { [%txt "Nous aussi."] [%eval -0.08] [%csl Gg8] }
12. Kh1 { [%txt "Le roi s'écarte de la diagonale du fou c5."] [%eval -0.10] }
12... Bd6 { [%txt "Le fou revient attaquer le cavalier e5."] [%eval 0.05] [%cal Gd6e5] }
13. d4 { [%txt "Les Blancs soutiennent le cavalier."] [%eval 0.09] }
13... exd3 { [%txt "On prend en passant : le cavalier e5 perd son appui.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.05).
1. ...Re8 et ...Bf5 : nos pièces visent e5 et c2.
2. ...Qc7 avec le fou d6 : la batterie contre h2.
3. ...Nb7-c5 : le cavalier a5 revient au centre."] [%eval 0.05] [%cal Gd6h2] } *`,
    ),
    chapter(
      "Aléatoire surprise 1 : après 4.Ng5, la batterie contre h2",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le chapitre 1 jusqu'à 13...exd3. La théorie s'arrête là : nos pièces visent le roi blanc, et les Blancs jouent des coups de roi qui ont l'air prudents et ne le sont pas. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case faible (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quelle case du roque n'est plus défendue ? 3. Quelle pièce noire peut s'ajouter à l'attaque ?"] [%eval 0.33] }
1. e4 { [%txt "Le centre."] [%eval 0.36] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.29] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.18] [%cal Gc6e5] }
3. Bc4 { [%txt "L'Italienne."] [%eval 0.10] }
3... Nf6 { [%txt "Les Deux Cavaliers."] [%eval 0.11] [%cal Gf6e4] }
4. Ng5 { [%txt "L'attaque sur f7."] [%eval 0.24] }
4... d5 { [%txt "On bouche la diagonale."] [%eval 0.12] [%cal Gd5c4] }
5. exd5 { [%txt "Échange."] [%eval 0.10] }
5... Na5 { [%txt "Le cavalier attaque le fou."] [%eval 0.30] [%cal Ga5c4] }
6. Bb5+ { [%txt "Échec."] [%eval 0.13] }
6... c6 { [%txt "On chasse le fou."] [%eval 0.11] [%cal Gc6b5] }
7. dxc6 { [%txt "Prise."] [%eval 0.11] }
7... bxc6 { [%txt "Reprise."] [%eval 0.09] [%cal Ga8b8] }
8. Be2 { [%txt "Repli."] [%eval -0.06] }
8... h6 { [%txt "On chasse le cavalier."] [%eval -0.04] [%cal Gh6g5] }
9. Nf3 { [%txt "Repli."] [%eval -0.14] }
9... e4 { [%txt "Deuxième temps."] [%eval -0.09] [%cal Ge4f3] }
10. Ne5 { [%txt "Centralisation."] [%eval -0.08] }
10... Bc5 { [%txt "Le fou vise f2."] [%eval -0.04] [%cal Gc5f2] }
11. O-O { [%txt "Roque."] [%eval -0.03] }
11... O-O { [%txt "Roque."] [%eval -0.08] [%csl Gg8] }
12. Kh1 { [%txt "Le roi s'écarte."] [%eval -0.10] }
12... Bd6 { [%txt "Attaque du cavalier."] [%eval 0.05] [%cal Gd6e5] }
13. d4 { [%txt "Soutien."] [%eval 0.09] }
13... exd3 { [%txt "Fin de la théorie : prise en passant."] [%eval 0.05] [%cal Ge4d3] }
14. Nxd3 { [%txt "Le cavalier reprend."] [%eval 0.03] }
14... Bf5 { [%txt "Le fou vise d3 et c2."] [%eval 0.12] [%cal Gf5d3] }
15. Nc3 { [%txt "Développement."] [%eval 0.18] }
15... Re8 { [%txt "La tour prend la colonne e."] [%eval 0.21] [%cal Ge8e2] }
16. Kg1 { [%txt "UNE IMPRÉCISION : le roi revient en g1, deux temps perdus depuis 12.Kh1. L'évaluation passe de +0.21 à -0.24 : pas encore une faute, mais un temps offert. On en profite pour monter la batterie contre h2."] [%eval -0.24] }
16... Qc7 { [%txt "La batterie contre h2."] [%eval -0.23] [%cal Gc7h2,Gd6h2] }
(16... Nd7 { [%txt "LA VARIANTE PIÉGÉE : le cavalier rejoint le centre…"] [%eval 0.50] [%csl Rh2] }
  17. Re1 { [%txt "…mais la batterie contre h2 n'a pas été montée, et les Blancs ont le temps de tout défendre. À RETENIR.

PRO TIP : +0.30, tout l'avantage noir a disparu. Quand l'adversaire perd un temps, crée une menace tout de suite."] [%eval 0.30] })
17. h3 { [%txt "Le pion couvre g4, mais affaiblit g3."] [%eval -0.29] }
17... Rad8 { [%txt "La seconde tour entre en jeu."] [%eval -0.34] [%cal Gd8d3] }
18. Kh1 { [%txt "Le roi rejoue encore : l'évaluation passe de -0.34 à -1.79."] [%hint "le roi bouge une troisième fois au lieu d'activer les pièces."] [%hint "le pion h3. Notre fou f5 et une dame en c8 le visent, et il protège le roi."] [%hint "18...Qc8 : la dame vise h3."] [%hintcsl Rh3,Gc8] [%eval -1.79] }
18... Qc8 { [%txt "La dame vise h3 avec le fou f5."] [%eval -1.73] [%cal Gc8h3,Gf5h3] }
19. Bf3 { [%txt "Le fou défend la case g2."] [%eval -2.08] }
19... Bxh3 { [%txt "Le sacrifice : le roque blanc s'ouvre."] [%eval -1.89] [%cal Gf5h3] }
20. Rb1 { [%txt "Un coup de tour sans rapport avec le roi : l'évaluation passe de -1.89 à -2.70."] [%hint "les Blancs déplacent une tour loin de leur roi attaqué."] [%hint "la case e5. Notre cavalier a5 peut revenir au centre par c4 et viser e5 et d2."] [%hint "20...Nc4 : le cavalier rejoint l'attaque."] [%hintcsl Ge5,Gc4] [%eval -2.70] }
20... Nc4 { [%txt "Le cavalier revient au centre."] [%eval -3.04] [%cal Gc4e5] }
21. Re1 { [%txt "La tour cherche du contre-jeu."] [%eval -3.69] }
21... Qf5 { [%txt "À RETENIR.

PRO TIP : -3.94, avantage noir décisif. Dame, fous et cavalier visent le roi blanc ouvert. La leçon : dans les Deux Cavaliers, chaque coup de roi blanc inutile est un temps pour l'attaque contre h2 et h3."] [%eval -3.94] [%cal Gf5f2,Gd6h2] } *`,
    ),
    chapter(
      "Branche B : 4.Ng5 d5 5.exd5 Na5 6.d3, la Variante Morphy",
      `{ [%txt "LA VARIANTE MORPHY : 6.d3.

Au lieu de 6.Bb5+, les Blancs ouvrent la diagonale du fou c1 et gardent le pion d5. Notre plan : ...h6 chasse le cavalier, ...e4 le chasse encore, puis ...Bc5 et ...exd3 ouvrent le jeu. Le pion d5 tombe ensuite, et le cavalier a5 échange le fou c4."] [%eval 0.33] }
1. e4 { [%txt "Le centre."] [%eval 0.36] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.29] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.18] [%cal Gc6e5] }
3. Bc4 { [%txt "L'Italienne."] [%eval 0.10] }
3... Nf6 { [%txt "Les Deux Cavaliers."] [%eval 0.11] [%cal Gf6e4] }
4. Ng5 { [%txt "L'attaque sur f7."] [%eval 0.24] }
4... d5 { [%txt "On bouche la diagonale."] [%eval 0.12] [%cal Gd5c4] }
5. exd5 { [%txt "Échange."] [%eval 0.10] }
5... Na5 { [%txt "Le cavalier attaque le fou."] [%eval 0.30] [%cal Ga5c4] }
6. d3 { [%txt "LA MORPHY : le pion soutient le fou c4 indirectement, par la dame."] [%eval -0.34] }
6... h6 { [%txt "On chasse le cavalier g5."] [%eval -0.46] [%cal Gh6g5] }
7. Nf3 { [%txt "Le cavalier recule."] [%eval -0.40] }
7... e4 { [%txt "Le pion chasse encore le cavalier."] [%eval -0.31] [%cal Ge4f3] }
8. Nd4 { [%txt "Le cavalier se centralise."] [%eval -0.27] }
(8. O-O { [%txt "Le roque, mais le fou c4 reste attaqué : l'évaluation passe de -0.31 à -2.27."] [%hint "les Blancs roquent sans régler l'attaque du cavalier a5 sur le fou c4."] [%hint "le fou c4. Notre cavalier le prend, et le cavalier f3 reste attaqué par le pion e4."] [%hint "8...Nxc4 : on prend le fou."] [%hintcsl Rc4,Rf3] [%eval -2.27] }
  8... Nxc4 { [%txt "On prend le fou."] [%eval -2.15] [%cal Ga5c4] }
  9. dxe4 { [%txt "Les Blancs prennent e4."] [%eval -2.04] }
  9... Bg4 { [%txt "Le fou cloue le cavalier contre la dame."] [%eval -2.17] [%cal Gg4d1] }
  10. h3 { [%txt "Le pion attaque le fou."] [%eval -2.02] }
  10... Bh5 { [%txt "À RETENIR.

PRO TIP : -1.54. Paire de fous et clouage durable. Dans la Morphy, le fou c4 doit reculer en b5 ou e2 avant tout autre coup."] [%eval -1.84] [%cal Gh5d1] })
8... Bc5 { [%txt "Le fou attaque le cavalier d4."] [%eval -0.27] [%cal Gc5d4] }
9. Be3 { [%txt "Le fou défend le cavalier."] [%eval -0.33] }
9... exd3 { [%txt "On ouvre la position."] [%eval -0.44] [%cal Ge4d3] }
10. cxd3 { [%txt "Le pion reprend."] [%eval -0.37] }
(10. Qxd3 { [%txt "La dame reprend, mais le fou c4 reste en prise : l'évaluation passe de -0.44 à -1.08."] [%hint "la dame reprend en d3, alors que le fou c4 est toujours attaqué."] [%hint "le fou c4. Notre cavalier le prend ; après Qxc4, notre dame reprend d5."] [%hint "10...Nxc4 11.Qxc4 Qxd5 : on récupère le pion."] [%hintcsl Rc4,Rd5] [%eval -1.08] }
  10... Nxc4 { [%txt "On prend le fou."] [%eval -0.97] [%cal Ga5c4] }
  11. Qxc4 { [%txt "La dame reprend."] [%eval -0.95] }
  11... Qxd5 { [%txt "La dame reprend le pion."] [%eval -0.98] [%cal Gd8d5] }
  12. Nd2 { [%txt "Développement."] [%eval -0.99] }
  12... O-O { [%txt "À RETENIR.

PRO TIP : -0.99. Pion récupéré et paire de fous. Retiens le motif : cavalier a5 contre fou c4, puis la dame reprend en d5."] [%eval -0.87] [%csl Gd5] })
10... Nxd5 { [%txt "Le cavalier prend le pion d5."] [%eval -0.29] [%cal Gf6d5] }
11. Bxd5 { [%txt "Les Blancs échangent."] [%eval -0.32] }
11... Qxd5 { [%txt "La dame reprend et se centralise."] [%eval -0.28] [%cal Gd5g2] }
(11... O-O { [%txt "LA VARIANTE PIÉGÉE : le roque, sans reprendre…"] [%eval 4.05] [%csl Rd5] }
  12. Qh5 { [%txt "…et la dame blanche vient à l'attaque, avec le fou d5 toujours vivant. À RETENIR.

PRO TIP : +4.36, une pièce de moins. Reprends d'abord : un roque ne compense pas une pièce."] [%eval 4.36] })
12. Qa4+ { [%txt "Un échec pour gagner du temps."] [%eval -0.26] }
(12. Nc3 { [%txt "Développement, mais g2 est sans défense : l'évaluation passe de -0.28 à -1.49."] [%hint "le cavalier attaque notre dame, mais le pion g2 n'est défendu par rien."] [%hint "le pion g2. Notre dame d5 le prend, et la tour h1 est menacée."] [%hint "12...Qxg2 : la dame prend g2."] [%hintcsl Rg2,Rh1] [%eval -1.49] }
  12... Qxg2 { [%txt "La dame prend g2 et attaque la tour h1."] [%eval -1.58] [%cal Gd5g2,Gg2h1] }
  13. Qf3 { [%txt "Les Blancs proposent l'échange."] [%eval -1.71] }
  13... Qxf3 { [%txt "On échange."] [%eval -1.35] [%cal Gg2f3] }
  14. Nxf3 { [%txt "Le cavalier reprend. À RETENIR.

PRO TIP : -1.53. Un pion de plus, et ...Bxe3 abîmera la structure blanche. Avant de chasser la dame, vérifie ce qu'elle peut prendre."] [%eval -1.53] [%cal Gc5e3] })
12... Qd7 { [%txt "On interpose la dame : l'échange des dames nous convient."] [%eval -0.30] [%cal Gd7a4] }
13. Nb5 { [%txt "Le cavalier vise c7.

À RETENIR.

PRO TIP : la feuille de route après la théorie (-0.36).
1. ...Bxe3 puis ...Qxa4 : on simplifie, la structure blanche est abîmée.
2. ...O-O et ...Rd8 : la colonne d contre le pion d3 isolé.
3. ...Nc6-e5 : le cavalier a5 revient au centre."] [%eval -0.36] [%cal Gc5e3,Gd8d3] } *`,
    ),
    chapter(
      "Branche C : le Pianissimo 4.d3 Bc5 5.c3 (tes parties)",
      `{ [%txt "LE PIANISSIMO 4.d3 AVEC c3.

C'est le système qui t'a coûté des parties. Les Blancs jouent lentement : d3, c3, Nbd2, a4 et Ba2, en préparant d4 ou une attaque à l'aile roi. Notre plan : ...Bc5, ...O-O et surtout le levier ...d5, qui ouvre le centre avant que les Blancs soient prêts. Après ...Nxd5 et ...Nb6, nos pièces sont actives et le fou c4 doit reculer."] [%eval 0.33] }
1. e4 { [%txt "Le centre."] [%eval 0.36] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.29] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.18] [%cal Gc6e5] }
3. Bc4 { [%txt "L'Italienne."] [%eval 0.10] }
3... Nf6 { [%txt "Les Deux Cavaliers."] [%eval 0.11] [%cal Gf6e4] }
4. d3 { [%txt "LE PIANISSIMO : les Blancs défendent e4 et jouent lentement."] [%eval 0.22] }
4... Bc5 { [%txt "Le fou prend sa meilleure diagonale, contre f2."] [%eval 0.21] [%cal Gc5f2] }
5. c3 { [%txt "Les Blancs préparent d4."] [%eval 0.24] }
5... O-O { [%txt "Roque : le roi est à l'abri avant d'ouvrir le centre."] [%eval 0.22] [%csl Gg8] }
6. Nbd2 { [%txt "Développement."] [%eval 0.25] }
(6. Ng5 { [%txt "Le cavalier attaque f7, mais il est seul : l'évaluation passe de +0.22 à -0.62."] [%hint "le cavalier part à l'attaque alors que le roi noir est déjà roqué."] [%hint "le cavalier g5. Notre pion h6 le chasse, puis ...d5 prend le centre avec gain de temps."] [%hint "6...h6 7.Nf3 d5 : on chasse le cavalier, puis le levier."] [%hintcsl Rg5,Gd5] [%eval -0.62] }
  6... h6 { [%txt "On chasse le cavalier."] [%eval -0.49] [%cal Gh6g5] }
  7. Nf3 { [%txt "Le cavalier recule."] [%eval -0.54] }
  7... d5 { [%txt "Le levier central."] [%eval -0.56] [%cal Gd5e4] }
  8. exd5 { [%txt "Les Blancs prennent."] [%eval -0.54] }
  8... Nxd5 { [%txt "À RETENIR.

PRO TIP : -0.60. Deux temps gagnés et le centre ouvert. Contre un cavalier qui saute en g5 sans soutien, ...h6 puis ...d5."] [%eval -0.51] [%csl Gd5] })
6... d5 { [%txt "LE LEVIER : on ouvre le centre avant d4."] [%eval 0.26] [%cal Gd5e4] }
7. exd5 { [%txt "Les Blancs prennent."] [%eval 0.26] }
7... Nxd5 { [%txt "Le cavalier reprend et se centralise."] [%eval 0.26] [%csl Gd5] }
8. a4 { [%txt "Les Blancs gagnent de l'espace et préparent Ba2."] [%eval 0.10] }
8... Nb6 { [%txt "Le cavalier attaque le fou c4."] [%eval 0.14] [%cal Gb6c4] }
9. Ba2 { [%txt "Le fou recule sur la diagonale a2-g8."] [%eval 0.10] }
(9. h3 { [%txt "Un coup de pion lent, et le fou c4 reste attaqué : l'évaluation passe de +0.14 à -0.59."] [%hint "les Blancs jouent un coup d'attente sans régler l'attaque sur le fou c4."] [%hint "le fou c4. Notre cavalier b6 le prend, et la paire de fous est à nous."] [%hint "9...Nxc4 : on prend le fou."] [%hintcsl Rc4] [%eval -0.59] }
  9... Nxc4 { [%txt "On prend le fou."] [%eval -0.70] [%cal Gb6c4] }
  10. Nxc4 { [%txt "Le cavalier reprend."] [%eval -0.66] }
  10... Bf5 { [%txt "À RETENIR.

PRO TIP : -0.55. La paire de fous et le pion d3 en point de mire. Dans le Pianissimo, le fou c4 est la meilleure pièce blanche : échange-la dès qu'elle reste attaquée."] [%eval -0.63] [%cal Gf5d3] })
9... Bf5 { [%txt "Le fou se développe et vise d3."] [%eval 0.18] [%cal Gf5d3] }
10. Ne4 { [%txt "Le cavalier attaque le fou c5."] [%eval 0.19] }
(10. d4 { [%txt "La poussée au centre, roi au centre : l'évaluation passe de +0.18 à -2.62."] [%hint "les Blancs ouvrent le centre alors que leur roi est en e1."] [%hint "le pion d4. Notre pion e5 le prend, et le pion c3 tombera aussi."] [%hint "10...exd4 : on prend."] [%hintcsl Rd4,Rc3] [%eval -2.62] }
  10... exd4 { [%txt "On prend."] [%eval -2.63] [%cal Ge5d4] }
  11. O-O { [%txt "Les Blancs roquent."] [%eval -2.81] }
  11... dxc3 { [%txt "On prend encore."] [%eval -2.68] [%cal Gd4c3] }
  12. bxc3 { [%txt "Le pion reprend."] [%eval -2.87] }
  12... Qf6 { [%txt "À RETENIR.

PRO TIP : -3.03, un pion de plus. Dans le Pianissimo, d4 ne se joue qu'après le roque et avec un soutien solide."] [%eval -3.03] [%cal Gf6c3] })
10... Bxe4 { [%txt "On échange le cavalier."] [%eval 0.13] [%cal Gf5e4] }
(10... Nxa4 { [%txt "LA VARIANTE PIÉGÉE : le pion a4 a l'air seul…"] [%eval 5.72] [%csl Ra4] }
  11. Qxa4 { [%txt "…mais la dame d1 le défendait. À RETENIR.

PRO TIP : +5.52, une pièce contre un pion. Les diagonales de la dame comptent aussi : d1-a4 en est une."] [%eval 5.52] })
11. dxe4 { [%txt "Le pion reprend."] [%eval 0.13] }
11... Qxd1+ { [%txt "On échange les dames : le roi blanc perd le roque."] [%eval 0.15] [%cal Gd8d1] }
12. Kxd1 { [%txt "Le roi reprend."] [%eval 0.35] }
12... a5 { [%txt "On bloque l'aile dame."] [%eval 0.27] [%cal Ga5a4] }
13. b3 { [%txt "Les Blancs soutiennent a4.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.22).
1. ...Nc8-d6 : le cavalier attaque e4.
2. ...Bxf2 si f2 reste sans défense : le roi d1 ne la protège pas.
3. ...Rfd8 : la colonne d contre le roi blanc."] [%eval 0.22] [%cal Gb6c8,Gc5f2] } *`,
    ),
    chapter(
      "Aléatoire surprise 2 : après le Pianissimo, le roi blanc au centre",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le Pianissimo du chapitre 4 jusqu'à 13.b3. La théorie s'arrête là. Les Blancs ne font pas de gaffe : leur roi reste au centre sans dames, et leurs pièces reculent pendant que nos cavaliers trouvent les cases d6, e6 et c5. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case ou le pion sans défense (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quel pion blanc n'est plus défendu ? 3. Quel cavalier noir peut l'attaquer ?"] [%eval 0.33] }
1. e4 { [%txt "Le centre."] [%eval 0.36] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.29] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.18] [%cal Gc6e5] }
3. Bc4 { [%txt "L'Italienne."] [%eval 0.10] }
3... Nf6 { [%txt "Les Deux Cavaliers."] [%eval 0.11] [%cal Gf6e4] }
4. d3 { [%txt "Le Pianissimo."] [%eval 0.22] }
4... Bc5 { [%txt "Contre f2."] [%eval 0.21] [%cal Gc5f2] }
5. c3 { [%txt "Préparation de d4."] [%eval 0.24] }
5... O-O { [%txt "Roque."] [%eval 0.22] [%csl Gg8] }
6. Nbd2 { [%txt "Développement."] [%eval 0.25] }
6... d5 { [%txt "Le levier."] [%eval 0.26] [%cal Gd5e4] }
7. exd5 { [%txt "Prise."] [%eval 0.26] }
7... Nxd5 { [%txt "Reprise."] [%eval 0.26] [%csl Gd5] }
8. a4 { [%txt "Espace."] [%eval 0.10] }
8... Nb6 { [%txt "Attaque du fou."] [%eval 0.14] [%cal Gb6c4] }
9. Ba2 { [%txt "Repli."] [%eval 0.10] }
9... Bf5 { [%txt "Contre d3."] [%eval 0.18] [%cal Gf5d3] }
10. Ne4 { [%txt "Attaque du fou."] [%eval 0.19] }
10... Bxe4 { [%txt "Échange."] [%eval 0.13] [%cal Gf5e4] }
11. dxe4 { [%txt "Reprise."] [%eval 0.13] }
11... Qxd1+ { [%txt "Échange des dames."] [%eval 0.15] [%cal Gd8d1] }
12. Kxd1 { [%txt "Le roi reprend."] [%eval 0.35] }
12... a5 { [%txt "Blocage."] [%eval 0.27] [%cal Ga5a4] }
13. b3 { [%txt "Fin de la théorie."] [%eval 0.22] }
13... Nc8 { [%txt "Le cavalier part vers d6, contre e4."] [%eval 0.34] [%cal Gc8d6] }
14. g4 { [%txt "Un coup de pion à l'aile roi, pendant que f2 reste seul : l'évaluation passe de +0.34 à -0.24."] [%hint "les Blancs avancent un pion au lieu de mettre leur roi en e2, où il défendrait f2."] [%hint "le pion f2 et le pion e4. Notre fou c5 vise f2, et un cavalier en d6 attaquerait e4."] [%hint "14...Nd6 : le cavalier attaque e4, puis ...Bxf2."] [%hintcsl Rf2,Re4] [%eval -0.24] }
14... Nd6 { [%txt "Le cavalier attaque e4."] [%eval -0.30] [%cal Gd6e4] }
15. Bb1 { [%txt "Le fou défend e4."] [%eval -0.30] }
15... Bxf2 { [%txt "Le fou prend f2."] [%eval -0.32] [%cal Gc5f2] }
16. Ne1 { [%txt "Le cavalier recule : l'évaluation passe de -0.32 à -1.03."] [%hint "le cavalier recule au lieu d'activer le fou c1."] [%hint "la case e6, puis c5 et f4. Notre cavalier c6 peut y aller par d8."] [%hint "16...Nd8 : le cavalier part vers e6."] [%hintcsl Ge6,Gf4] [%eval -1.03] }
16... Nd8 { [%txt "Le cavalier part vers e6."] [%eval -1.06] [%cal Gd8e6] }
(16... Nb4 { [%txt "LA VARIANTE PIÉGÉE : le cavalier saute en b4…"] [%eval 4.11] [%csl Rb4] }
  17. cxb4 { [%txt "…mais le pion c3 le prend. À RETENIR.

PRO TIP : +4.19, une pièce de moins. Avant un saut de cavalier, regarde les pions adverses qui contrôlent la case."] [%eval 4.19] })
17. Nf3 { [%txt "Le cavalier revient."] [%eval -1.11] }
17... Ne6 { [%txt "Le cavalier vise c5, f4 et g5."] [%eval -1.13] [%cal Ge6c5,Ge6f4] }
18. Kd2 { [%txt "Le roi monte en d2, en face de nos cavaliers : l'évaluation passe de -1.13 à -2.07."] [%hint "le roi se rapproche de nos cavaliers au lieu de jouer Ra2 pour défendre la deuxième rangée."] [%hint "la colonne e et la case c5. Notre tour peut venir en e8, puis un cavalier en c5 attaquera e4 et b3."] [%hint "18...Rfe8 : la tour prend la colonne e."] [%hintcsl Ge8,Gc5] [%eval -2.07] }
18... Rfe8 { [%txt "La tour prend la colonne e."] [%eval -1.91] [%cal Ge8e4] }
19. Bc2 { [%txt "Le fou se replace."] [%eval -1.86] }
19... Bb6 { [%txt "Le fou recule et vise la diagonale a7-g1."] [%eval -1.75] [%cal Gb6g1] }
20. Bd3 { [%txt "Le fou se met devant le roi, sur une case que nos cavaliers visent : l'évaluation passe de -1.75 à -4.07."] [%hint "le fou se place sur une case qu'un cavalier noir peut attaquer en même temps que e4."] [%hint "la case c5. De là, notre cavalier attaque le fou d3, le pion e4 et le pion b3."] [%hint "20...Nc5 : le cavalier attaque d3 et e4."] [%hintcsl Gc5,Rd3,Re4] [%eval -4.07] }
20... Nc5 { [%txt "À RETENIR.

PRO TIP : -4.23, avantage noir décisif. Le cavalier attaque d3 et e4, et le roi blanc est au milieu de nos pièces. La leçon : dans les finales du Pianissimo, nos cavaliers trouvent les cases d6, e6 et c5 dès que le roi blanc s'égare."] [%eval -4.23] [%cal Gc5d3,Gc5e4] } *`,
    ),
    chapter(
      "Branche D : le Pianissimo avec roque, 4.d3 Bc5 5.O-O",
      `{ [%txt "LE PIANISSIMO AVEC ROQUE RAPIDE.

Les Blancs roquent, puis c3, Re1, a4 et h3. C'est la version la plus jouée en club. Notre plan : ...d6, ...a6 et ...Ba7 pour garder le fou, puis ...Ng4 contre f2 dès que la tour quitte f1, et ...h6 pour empêcher Bg5. Les Blancs veulent d4 : nous gardons e5 solide."] [%eval 0.33] }
1. e4 { [%txt "Le centre."] [%eval 0.36] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.29] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.18] [%cal Gc6e5] }
3. Bc4 { [%txt "L'Italienne."] [%eval 0.10] }
3... Nf6 { [%txt "Les Deux Cavaliers."] [%eval 0.11] [%cal Gf6e4] }
4. d3 { [%txt "Le Pianissimo."] [%eval 0.22] }
4... Bc5 { [%txt "Contre f2."] [%eval 0.21] [%cal Gc5f2] }
5. O-O { [%txt "Les Blancs roquent."] [%eval 0.21] }
5... d6 { [%txt "On soutient e5."] [%eval 0.17] [%cal Gd6e5] }
6. c3 { [%txt "Les Blancs préparent d4."] [%eval 0.22] }
6... a6 { [%txt "On donne une case de repli au fou : a7."] [%eval 0.19] [%csl Ga7] }
7. Re1 { [%txt "La tour soutient e4, mais quitte f1."] [%eval 0.23] }
7... Ba7 { [%txt "Le fou recule à l'abri de d4 et b4."] [%eval 0.25] [%cal Ga7f2] }
8. a4 { [%txt "Les Blancs gagnent de l'espace."] [%eval 0.25] }
(8. Kh1 { [%txt "Le roi s'écarte de la diagonale, mais f2 reste faible : l'évaluation passe de +0.25 à -0.58."] [%hint "les Blancs jouent un coup de roi au lieu de régler la faiblesse de f2."] [%hint "la case f2. Notre cavalier f6 peut sauter en g4 et l'attaquer avec le fou a7."] [%hint "8...Ng4 : le cavalier attaque f2."] [%hintcsl Rf2,Gg4] [%eval -0.58] }
  8... Ng4 { [%txt "Le cavalier attaque f2."] [%eval -0.54] [%cal Gg4f2,Ga7f2] }
  9. Rf1 { [%txt "La tour revient défendre f2."] [%eval -0.55] }
  9... Na5 { [%txt "À RETENIR.

PRO TIP : -0.79. Deux temps perdus par la tour, et le fou c4 est attaqué. Quand la tour quitte f1, f2 devient la cible de ...Ng4."] [%eval -0.59] [%cal Ga5c4] })
8... Ng4 { [%txt "Le cavalier attaque f2 avec le fou a7."] [%eval 0.36] [%cal Gg4f2,Ga7f2] }
9. Rf1 { [%txt "La tour revient défendre f2."] [%eval 0.30] }
(9. Be3 { [%txt "Le fou couvre f2, mais il s'offre au cavalier : l'évaluation passe de +0.36 à -0.89."] [%hint "le fou se met sur une case que notre cavalier g4 attaque."] [%hint "le fou e3. Après ...Nxe3 fxe3, la paire de fous est à nous et les pions blancs sont doublés."] [%hint "9...Nxe3 : on prend le fou."] [%hintcsl Re3] [%eval -0.89] }
  9... Nxe3 { [%txt "On prend le fou."] [%eval -0.81] [%cal Gg4e3] }
  10. fxe3 { [%txt "Le pion reprend."] [%eval -0.78] }
  10... g5 { [%txt "À RETENIR.

PRO TIP : -0.95. La paire de fous et le pion e3 faible ; ...g5-g4 gagne de l'espace. Contre le fou qui vient en e3, prends-le avec le cavalier."] [%eval -0.84] [%cal Gg5g4] })
9... O-O { [%txt "Roque."] [%eval 0.26] [%csl Gg8] }
(9... Bxf2+ { [%txt "LA VARIANTE PIÉGÉE : le sacrifice en f2…"] [%eval 2.14] [%csl Rf2] }
  10. Rxf2 { [%txt "…la tour reprend…"] [%eval 2.37] }
  10... Nxf2 { [%txt "…le cavalier reprend…"] [%eval 2.29] }
  11. Kxf2 { [%txt "…et le roi reprend. À RETENIR.

PRO TIP : +1.97. Deux pièces mineures contre une tour et un pion : mauvais marché. Ne sacrifie en f2 que si le roi blanc reste exposé ensuite."] [%eval 2.27] })
10. h3 { [%txt "Le pion chasse le cavalier."] [%eval 0.26] }
10... Nf6 { [%txt "Le cavalier revient."] [%eval 0.26] [%cal Gf6e4] }
11. Re1 { [%txt "La tour revient en e1."] [%eval 0.29] }
11... h6 { [%txt "On empêche Bg5."] [%eval 0.28] [%csl Gg5] }
12. b4 { [%txt "Les Blancs gagnent de l'espace.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.21).
1. ...Nh7 puis ...f5 : le levier de l'aile roi contre e4.
2. ...Be6 : on échange le fou c4.
3. ...Ne7-g6 : le cavalier rejoint l'aile roi."] [%eval 0.21] [%cal Gf7f5] }
(12. Qb3 { [%txt "La dame attaque f7, mais elle s'expose : l'évaluation passe de +0.28 à -1.37."] [%hint "la dame part en b3 pour viser f7, sur une case que notre cavalier peut attaquer."] [%hint "la case a5. Notre cavalier y attaque la dame b3 et le fou c4."] [%hint "12...Na5 : le cavalier attaque la dame et le fou."] [%hintcsl Ga5,Rb3] [%eval -1.37] }
  12... Na5 { [%txt "Le cavalier attaque la dame et le fou."] [%eval -1.34] [%cal Ga5b3,Ga5c4] }
  13. Qd1 { [%txt "La dame recule."] [%eval -1.33] }
  13... Nxc4 { [%txt "On prend le fou."] [%eval -1.29] [%cal Ga5c4] }
  14. dxc4 { [%txt "Le pion reprend. À RETENIR.

PRO TIP : -1.31. La paire de fous, et ...Nh5 prépare ...f5. Contre Qb3, la case a5 est notre réponse."] [%eval -1.31] [%cal Gf6h5,Gf7f5] }) *`,
    ),
    chapter(
      "Branche E : 4.d4, l'ouverture du centre",
      `{ [%txt "4.d4 : LE CENTRE S'OUVRE.

Après 4...exd4, les Blancs ont deux idées : 5.O-O, qui sacrifie e4 (5...Nxe4 6.Re1 d5), ou 5.e5, qui attaque le cavalier f6 (5...d5). Dans les deux cas, on rend le pion au bon moment et on se développe vite. La ligne principale traite 5.O-O ; une variante traite 5.e5."] [%eval 0.33] }
1. e4 { [%txt "Le centre."] [%eval 0.36] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.29] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.18] [%cal Gc6e5] }
3. Bc4 { [%txt "L'Italienne."] [%eval 0.10] }
3... Nf6 { [%txt "Les Deux Cavaliers."] [%eval 0.11] [%cal Gf6e4] }
4. d4 { [%txt "Les Blancs ouvrent le centre."] [%eval 0.04] }
4... exd4 { [%txt "On prend."] [%eval -0.03] [%cal Ge5d4] }
5. O-O { [%txt "Les Blancs roquent et laissent e4."] [%eval 0.00] }
(5. e5 { [%txt "Le pion attaque le cavalier f6."] [%eval -0.07] }
  5... d5 { [%txt "La riposte : on attaque le fou c4."] [%eval 0.00] [%cal Gd5c4] }
  6. Bb5 { [%txt "Le fou cloue le cavalier c6."] [%eval -0.05] }
  6... Ne4 { [%txt "Le cavalier se centralise."] [%eval 0.03] [%cal Ge4c3] }
  7. Nxd4 { [%txt "Le cavalier reprend le pion."] [%eval 0.02] }
  7... Bd7 { [%txt "On rompt le clouage."] [%eval 0.09] [%cal Gd7b5] }
  8. Bxc6 { [%txt "Les Blancs échangent."] [%eval 0.14] }
  8... bxc6 { [%txt "On reprend."] [%eval 0.26] [%cal Gc6d5] }
  9. O-O { [%txt "Roque."] [%eval 0.25] }
  9... Bc5 { [%txt "À RETENIR.

PRO TIP : +0.26. Position équilibrée : nos pièces sont actives. Contre 5.e5, ...d5 puis ...Ne4 : le cavalier au centre."] [%eval 0.18] [%cal Gc5d4] })
(5. Nxd4 { [%txt "UNE IMPRÉCISION : le cavalier reprend, mais laisse e4 sans défense. L'évaluation passe de -0.03 à -0.52 : on prend le pion tout de suite."] [%eval -0.52] }
  5... Nxe4 { [%txt "On prend le pion."] [%eval -0.64] [%cal Gf6e4] }
  6. Bxf7+ { [%txt "Les Blancs cherchent un échec."] [%eval -0.64] }
  6... Kxf7 { [%txt "On prend."] [%eval -0.52] [%csl Gf7] }
  7. Qh5+ { [%txt "La dame donne échec."] [%eval -0.49] }
  7... g6 { [%txt "À RETENIR.

PRO TIP : -0.63. Un pion de plus, et le roi noir est en sécurité derrière g6. Ne crains pas les échecs : compte ce qui reste après."] [%eval -0.52] [%csl Gg6] })
5... Nxe4 { [%txt "On prend le pion."] [%eval -0.02] [%cal Gf6e4] }
6. Re1 { [%txt "La tour attaque le cavalier."] [%eval 0.00] }
(6. Nc3 { [%txt "Les Blancs sacrifient encore, mais sans suite : l'évaluation passe de -0.02 à -0.84."] [%hint "le cavalier se donne en c3 alors que notre pion d4 le prend."] [%hint "le cavalier c3. Notre pion d4 le prend ; les échecs blancs qui suivent ne suffisent pas."] [%hint "6...dxc3 : on prend le cavalier."] [%hintcsl Rc3] [%eval -0.84] }
  6... dxc3 { [%txt "On prend le cavalier."] [%eval -1.16] [%cal Gd4c3] }
  7. Bxf7+ { [%txt "Échec."] [%eval -1.88] }
  7... Kxf7 { [%txt "On prend."] [%eval -1.69] [%csl Gf7] }
  8. Qd5+ { [%txt "Échec."] [%eval -2.29] }
  8... Kf6 { [%txt "À RETENIR.

PRO TIP : -2.10, une pièce de plus. Le roi est actif mais sûr. Accepte les sacrifices quand tu as compté les échecs."] [%eval -2.10] [%csl Gf6] })
6... d5 { [%txt "On soutient le cavalier e4."] [%eval -0.02] [%cal Gd5e4] }
(6... Be7 { [%txt "LA VARIANTE PIÉGÉE : un développement naturel…"] [%eval 2.34] [%csl Re4] }
  7. Rxe4 { [%txt "…mais la tour prend le cavalier e4, qui n'était pas défendu. À RETENIR.

PRO TIP : +2.28, une pièce de moins. Contre 6.Re1, seul ...d5 tient le cavalier e4."] [%eval 2.28] })
7. Bxd5 { [%txt "Le fou prend d5."] [%eval -0.02] }
7... Qxd5 { [%txt "La dame reprend."] [%eval -0.01] [%cal Gd8d5] }
8. Nc3 { [%txt "Le cavalier attaque la dame."] [%eval -0.02] }
8... Qh5 { [%txt "La dame recule en gardant e4 et h2 sous contrôle."] [%eval 0.03] [%cal Gh5h2] }
9. Nxe4 { [%txt "Le cavalier prend le cavalier e4."] [%eval -0.01] }
9... Be6 { [%txt "Le fou se développe et protège d5."] [%eval -0.06] [%cal Ge6d5] }
10. Bg5 { [%txt "Le fou attaque."] [%eval -0.06] }
(10. Ng3 { [%txt "Le cavalier attaque la dame, mais e4 était plus utile : l'évaluation passe de -0.06 à -1.25."] [%hint "le cavalier quitte e4, où il était bien placé."] [%hint "la case d5. Notre dame s'y centralise, puis le grand roque."] [%hint "10...Qd5 : la dame se centralise."] [%hintcsl Gd5] [%eval -1.25] }
  10... Qd5 { [%txt "La dame se centralise."] [%eval -1.21] [%cal Gd5a2] }
  11. Ng5 { [%txt "Le cavalier attaque le fou e6."] [%eval -1.10] }
  11... O-O-O { [%txt "On roque."] [%eval -1.15] [%csl Gc8] }
  12. Nxe6 { [%txt "Les Blancs échangent."] [%eval -1.05] }
  12... fxe6 { [%txt "À RETENIR.

PRO TIP : -1.16. Le pion d4 est solide et nos tours occupent le centre."] [%eval -1.20] [%csl Gd4] })
10... Bd6 { [%txt "Le fou se développe."] [%eval -0.04] [%cal Gd6h2] }
11. h3 { [%txt "Le pion protège g4."] [%eval -0.10] }
11... O-O { [%txt "Roque."] [%eval -0.10] [%csl Gg8] }
12. Nxd4 { [%txt "Le cavalier reprend le pion d4."] [%eval -0.09] }
12... Qxd1 { [%txt "On échange les dames."] [%eval -0.12] [%cal Gh5d1] }
13. Raxd1 { [%txt "La tour reprend.

À RETENIR.

PRO TIP : la feuille de route après la théorie (-0.10).
1. ...Nxd4 puis ...Bd5 : on simplifie.
2. ...Rfe8 : la colonne e.
3. Une finale équilibrée : nos fous valent les pièces blanches."] [%eval -0.10] [%cal Gc6d4] } *`,
    ),
    chapter(
      "Anti-panique : 4.Nc3 et 4.O-O",
      `{ [%txt "ANTI-PANIQUE : 4.Nc3 ET 4.O-O.

Contre 4.Nc3, on prend e4 tout de suite : 4...Nxe4 5.Nxe4 d5, la fourchette de pion récupère la pièce. Contre 4.O-O, même idée : 4...Nxe4. Une variante montre 4.O-O Nxe4 5.Re1?, une faute fréquente."] [%eval 0.33] }
1. e4 { [%txt "Le centre."] [%eval 0.36] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.29] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.18] [%cal Gc6e5] }
3. Bc4 { [%txt "L'Italienne."] [%eval 0.10] }
3... Nf6 { [%txt "Les Deux Cavaliers."] [%eval 0.11] [%cal Gf6e4] }
4. Nc3 { [%txt "Le cavalier défend e4."] [%eval -0.13] }
(4. O-O { [%txt "Les Blancs roquent."] [%eval -0.30] }
  4... Nxe4 { [%txt "On prend le pion."] [%eval -0.26] [%cal Gf6e4] }
  5. Re1 { [%txt "La tour attaque le cavalier, mais c'est une faute : l'évaluation passe de -0.26 à -1.32."] [%hint "la tour attaque le cavalier, alors que notre pion d peut le soutenir avec gain de temps."] [%hint "la case d5. Notre pion y défend le cavalier e4 et attaque le fou c4."] [%hint "5...d5 : on soutient le cavalier et on chasse le fou."] [%hintcsl Gd5,Rc4] [%eval -1.32] }
  5... d5 { [%txt "À RETENIR.

PRO TIP : -1.48, un pion de plus et le centre. Contre 5.Re1, ...d5 tient tout."] [%eval -1.48] [%cal Gd5c4] })
4... Nxe4 { [%txt "On prend le pion : la fourchette ...d5 récupère la pièce."] [%eval -0.11] [%cal Gf6e4] }
5. Nxe4 { [%txt "Le cavalier reprend."] [%eval -0.18] }
(5. d4 { [%txt "Les Blancs ouvrent le centre au lieu de reprendre : l'évaluation passe de -0.11 à -1.11."] [%hint "les Blancs ne reprennent pas le cavalier e4."] [%hint "le cavalier c3. Notre cavalier e4 le prend, et les pions blancs se doublent."] [%hint "5...Nxc3 : on prend le cavalier."] [%hintcsl Rc3] [%eval -1.11] }
  5... Nxc3 { [%txt "On prend."] [%eval -1.33] [%cal Ge4c3] }
  6. bxc3 { [%txt "Le pion reprend."] [%eval -1.36] }
  6... d5 { [%txt "On attaque le fou."] [%eval -1.25] [%cal Gd5c4] }
  7. Bb5 { [%txt "Le fou recule."] [%eval -1.30] }
  7... e4 { [%txt "À RETENIR.

PRO TIP : -1.23, un pion de plus et de l'espace."] [%eval -1.23] [%cal Ge4f3] })
5... d5 { [%txt "LA FOURCHETTE : le pion attaque le fou c4 et le cavalier e4."] [%eval -0.11] [%cal Gd5c4,Gd5e4] }
(5... Be7 { [%txt "LA VARIANTE PIÉGÉE : on oublie la fourchette…"] [%eval 4.92] [%csl Re4] }
  6. Bd5 { [%txt "…et les Blancs gardent la pièce. À RETENIR.

PRO TIP : +5.20, une pièce de moins. Après 4...Nxe4 5.Nxe4, ...d5 est obligatoire."] [%eval 5.20] })
6. Bd3 { [%txt "Le fou recule en défendant le cavalier."] [%eval -0.16] }
(6. Bxd5 { [%txt "Le fou prend d5, mais la dame reprend avec gain de temps : l'évaluation passe de -0.11 à -1.48."] [%hint "le fou prend d5 et laisse notre dame se centraliser."] [%hint "la case d5. Notre dame y reprend et attaque le cavalier e4."] [%hint "6...Qxd5 : la dame reprend."] [%hintcsl Gd5,Re4] [%eval -1.48] }
  6... Qxd5 { [%txt "La dame reprend."] [%eval -1.54] [%cal Gd8d5] }
  7. Nc3 { [%txt "Le cavalier attaque la dame."] [%eval -1.42] }
  7... Qc5 { [%txt "La dame recule."] [%eval -1.21] [%cal Gc5f2] }
  8. h3 { [%txt "Les Blancs empêchent ...Bg4."] [%eval -1.28] }
  8... Bd7 { [%txt "À RETENIR.

PRO TIP : -1.26. La paire de fous et le centre : les Noirs sont mieux."] [%eval -1.31] [%cal Ge8c8] })
6... dxe4 { [%txt "On reprend la pièce."] [%eval -0.15] [%cal Gd5e4] }
7. Bxe4 { [%txt "Le fou reprend le pion."] [%eval -0.11] }
7... Bd6 { [%txt "Le fou défend e5."] [%eval -0.08] [%cal Gd6e5] }
8. d4 { [%txt "Les Blancs attaquent e5."] [%eval -0.10] }
8... exd4 { [%txt "On prend."] [%eval -0.10] [%cal Ge5d4] }
9. Bxc6+ { [%txt "Les Blancs échangent avec échec."] [%eval -0.18] }
9... bxc6 { [%txt "On reprend."] [%eval -0.08] [%cal Gc6d5] }
10. Qxd4 { [%txt "La dame reprend."] [%eval -0.18] }
(10. Nxd4 { [%txt "Le cavalier reprend, mais la dame reste chez elle : l'évaluation passe de -0.08 à -0.89."] [%hint "le cavalier reprend en d4 au lieu de la dame."] [%hint "notre roi. Nous roquons, puis la dame va en f6 contre d4 et b2."] [%hint "10...O-O : on roque, puis ...Qf6."] [%hintcsl Gg8] [%eval -0.89] }
  10... O-O { [%txt "Roque."] [%eval -0.82] [%csl Gg8] }
  11. O-O { [%txt "Les Blancs roquent."] [%eval -0.91] }
  11... Qf6 { [%txt "La dame vise d4 et b2."] [%eval -0.80] [%cal Gf6d4] }
  12. Re1 { [%txt "La tour prend la colonne e."] [%eval -0.78] }
  12... Rb8 { [%txt "À RETENIR.

PRO TIP : -0.86. Paire de fous et colonne b ouverte."] [%eval -0.71] [%cal Gb8b2] })
10... O-O { [%txt "Roque.

À RETENIR.

PRO TIP : la feuille de route après la théorie (-0.13).
1. ...Re8+ et ...c5 : on chasse la dame d4.
2. ...Bb7 : la paire de fous vise le roque blanc.
3. Une position équilibrée, plus facile pour nous grâce aux fous."] [%eval -0.13] [%cal Gf8e8] } *`,
    ),
  ],
};
