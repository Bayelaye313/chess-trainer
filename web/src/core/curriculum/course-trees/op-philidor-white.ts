import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours d'ouverture « Philidor (avec les Blancs) » — onglet Ouvertures,
 * format « un commentaire par coup » de l'Académie, lu par
 * `CourseTreeViewer` (route `/ouvertures/philidor-white/cours`). Public
 * visé : 1500-1800 Elo, répertoire 1.e4 e5 2.Nf3 contre 2...d6 (fiche
 * curatée `philidor-white`, C41).
 *
 * ## Contenu (v2 du 2026-11-03, format Ruy Lopez v2, côté Blancs)
 *
 * 1. Fiche d'identité, tronc commun : 3.d4 exd4 4.Nxd4 Nf6 5.Nc3 Be7 6.Bf4.
 * 2. Aléatoire surprise 1 : après 3...exd4, la marée de pions.
 * 3. Branche B : la Lion, 3...Nf6 4.Nc3 Nbd7 5.Bc4.
 * 4. Branche C : la Hanham, 3...Nd7 4.Bc4.
 * 5. Branche D : 3...Bg4 4.dxe5, la paire de fous et b7.
 * 6. Aléatoire surprise 2 : après la Lion, le fou h6.
 * 7. Branche E : le contre-gambit Philidor, 3...f5.
 * 8. Anti-panique : 3...Nc6, 3...Qe7 et 3...Bd7.
 *
 * Choix des chapitres (2026-11-03) : la théorie principale après 3.d4
 * (3...exd4, la Lion, la Hanham, 3...Bg4, 3...f5) et les coups rares
 * 3...Nc6, 3...Qe7, 3...Bd7. Parties de l'utilisateur (copie de la base) :
 * 3...exd4 deux fois, 3...Bg4 une fois. Le répertoire blanc de
 * l'utilisateur est l'Écossaise (2...Nc6 3.d4) : aucun autre cours ne
 * traite 2...d6. Les branches théoriques s'arrêtent au plus tard au
 * demi-coup 27 ; les chapitres « Aléatoire surprise » prolongent avec les
 * Noirs comme camp « mou » (dérive en MultiPV 30, comme `_tmp-drift-w.mts`
 * mais camps inversés). La surprise 2 part du chapitre 3 (la Lion), plus
 * riche en plans que le chapitre 5.
 *
 * Convention côté Blancs (comme `op-ruy-lopez.ts`) : l'élève joue les
 * Blancs ; les fautes sont des coups NOIRS qui portent les 3 indices
 * `[%hint]` + `[%hintcsl]`, le coup blanc suivant est la punition. Les
 * « variantes piégées » sont des coups blancs tentants mais mauvais
 * (5.Bc4 contre ...Nf6, 12.g3, 10.Bg3, 7.Qxf6 et 9.Qxa7 contre 3...Bg4,
 * 4.Nc3 contre 3...f5, 4.dxe5 contre 3...Nc6). Les coups qui définissent un
 * chapitre (3...f5) ne portent pas d'indices, même quand le moteur les juge
 * mauvais.
 *
 * Sources : théorie établie de la Philidor, TOUTES les lignes arbitrées par
 * Stockfish 19 natif (profondeur 16, MultiPV 1) ; 6.Bf4 au chapitre 1 et
 * 7.a4 dans la Lion sont des choix du moteur. Toute la prose est originale.
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
 * `scripts/opening-course-src/philidor-white.pgn` (et l'en-tête
 * `philidor-white.header.txt`) ; regénérer avec
 * `node --import tsx scripts/_tmp-build-opening-course.mts <source> <en-tête> <sortie> 16`
 * (Stockfish natif, voir `scripts/_tmp-sf-native.mts` ; sous Linux,
 * `SF_BIN=<chemin du binaire>`). Les `[%eval]` viennent du moteur, pas de la
 * main. Étape standard : `scripts/_tmp-check-cited-evals.mts op-philidor-white`
 * doit sortir 0 écart (un chiffre n'est cité dans un commentaire que s'il est
 * l'éval d'un nœud). Règles de l'utilisateur : SAN en texte brut uniquement
 * (jamais de figurine Unicode), pas de guillemet droit dans un `[%txt]`.
 */

function chapter(title: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, START) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const OP_PHILIDOR_WHITE: CourseTree = {
  chapters: [
    chapter(
      "Fiche d'identité, tronc commun : 3.d4 exd4 4.Nxd4 Nf6 5.Nc3 Be7 6.Bf4",
      `{ [%txt "LA PHILIDOR, AVEC LES BLANCS.

Le vrai enjeu : avec 2...d6, les Noirs défendent e5 par un pion et enferment leur fou f8. On frappe tout de suite par 3.d4 : les Noirs doivent choisir entre céder le centre (3...exd4), le tenir par les pièces (3...Nf6 et ...Nbd7, la Lion, ou 3...Nd7, la Hanham), ou des coups plus risqués (3...Bg4, 3...f5).

Le déséquilibre recherché : plus d'espace et un développement plus facile. Contre 3...exd4, nos pièces sont plus actives et le pion d6 est une cible ; contre la Lion et la Hanham, le pion e5 noir est solide mais la position noire est à l'étroit.

Pourquoi ces chapitres : le choix suit la théorie principale après 3.d4 : 3...exd4 (ce chapitre), 3...Nf6 4.Nc3 Nbd7 (chapitre 3), 3...Nd7 (chapitre 4), 3...Bg4 (chapitre 5) et le contre-gambit 3...f5 (chapitre 7), plus 3...Nc6, 3...Qe7 et 3...Bd7 (chapitre 8). Dans tes parties, les Noirs ont joué 3...exd4 deux fois et 3...Bg4 une fois. Notre Écossaise commence par 2...Nc6 : aucun autre cours ne traite 2...d6.

Les structures types :
- 3...exd4 : notre pion e4 contre le pion d6, colonne d ouverte, grands roques opposés possibles.
- Lion et Hanham : pions e4-d4 contre d6-e5, la tension au centre, notre fou c4 vise f7.
- 3...Bg4 : les Noirs donnent la paire de fous, nos pièces visent b7 et f7.

Règle d'or : contre la Philidor, garde la tension au centre et développe vers f7 et d6."] [%eval 0.39] }
1. e4 { [%txt "On occupe le centre."] [%eval 0.26] [%csl Ge4] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.32] [%cal Gf3e5] }
2... d6 { [%txt "LA PHILIDOR : le pion défend e5, mais il enferme le fou f8."] [%eval 0.53] }
3. d4 { [%txt "On frappe le centre."] [%eval 0.44] [%cal Gd4e5] }
3... exd4 { [%txt "Les Noirs cèdent le centre. (3...Nf6 : chapitre 3 ; 3...Nd7 : chapitre 4 ; 3...Bg4 : chapitre 5 ; 3...f5 : chapitre 7 ; 3...Nc6, 3...Qe7, 3...Bd7 : chapitre 8.)"] [%eval 0.69] }
4. Nxd4 { [%txt "Le cavalier reprend au centre."] [%eval 0.68] }
4... Nf6 { [%txt "Le cavalier attaque e4."] [%eval 0.72] }
5. Nc3 { [%txt "Le cavalier défend e4."] [%eval 0.63] }
(5. Bc4 { [%txt "LA VARIANTE PIÉGÉE : le fou vise f7…"] [%eval 0.26] [%csl Re4] }
  5... Nxe4 { [%txt "…mais le pion e4 n'est plus défendu, et le cavalier le prend. À RETENIR.

PRO TIP : +0.33. Contre ...Nf6, Nc3 d'abord : le pion e4 a besoin d'un défenseur avant tout coup de fou."] [%eval 0.33] [%csl Re4] })
5... Be7 { [%txt "Le fou se développe."] [%eval 0.66] }
6. Bf4 { [%txt "Le fou vise d6 et prépare le grand roque."] [%eval 0.61] [%cal Gf4d6] }
6... Nc6 { [%txt "Le cavalier attaque d4."] [%eval 0.68] }
(6... Be6 { [%txt "Le fou se développe, mais le cavalier d4 le prend : l'évaluation passe de +0.61 à +1.56."] [%hint "les Noirs placent le fou sur une case que notre cavalier d4 attaque."] [%hint "le fou e6. Notre cavalier le prend, et les pions e noirs seront doublés."] [%hint "7.Nxe6 fxe6 : la structure noire est abîmée."] [%hintcsl Re6,Gd4] [%eval 1.56] }
  7. Nxe6 { [%txt "On prend le fou."] [%eval 1.56] }
  7... fxe6 { [%txt "À RETENIR.

PRO TIP : +1.58. Pions e doublés et le pion d6 isolé. Contre ...Be6, cherche Nxe6 quand la reprise abîme la structure."] [%eval 1.58] [%csl Re6,Rd6] })
7. Qd2 { [%txt "La dame prépare le grand roque."] [%eval 0.56] }
7... O-O { [%txt "Les Noirs roquent."] [%eval 0.54] }
(7... Ng4 { [%txt "Le cavalier attaque le fou f4, mais le clouage arrive : l'évaluation passe de +0.56 à +1.18."] [%hint "les Noirs lancent un cavalier en avant alors que le cavalier c6 est cloué en puissance."] [%hint "la case b5. Notre fou f1 y cloue le cavalier c6."] [%hint "8.Bb5 : le clouage contre c6 et e8."] [%hintcsl Gb5,Rc6] [%eval 1.18] }
  8. Bb5 { [%txt "À RETENIR.

PRO TIP : +1.21. Le cavalier c6 est cloué, le cavalier g4 est loin de son roi. Contre un cavalier qui part en g4, développe avec un clouage."] [%eval 1.21] [%cal Gb5e8] })
8. O-O-O { [%txt "Le grand roque."] [%eval 0.57] }
8... Nxd4 { [%txt "Les Noirs échangent."] [%eval 0.48] }
9. Qxd4 { [%txt "La dame reprend au centre."] [%eval 0.53] }
9... a6 { [%txt "Les Noirs préparent ...b5."] [%eval 0.50] }
(9... Rb8 { [%txt "La tour prépare ...b5, mais le centre blanc avance : l'évaluation passe de +0.53 à +1.31."] [%hint "les Noirs jouent un coup de tour lent pendant que notre pion e4 peut frapper d6."] [%hint "la case e5. Notre pion y avance et attaque d6 et le cavalier f6."] [%hint "10.e5 : le centre éclate."] [%hintcsl Ge5,Rd6] [%eval 1.31] }
  10. e5 { [%txt "À RETENIR.

PRO TIP : +1.51. Le pion d6 et le cavalier f6 sont attaqués. Contre la Philidor, e5 au bon moment casse la défense noire."] [%eval 1.51] [%cal Ge5d6] })
10. f3 { [%txt "Le pion soutient e4 et prépare g4."] [%eval 0.42] }
10... b5 { [%txt "L'espace à l'aile dame."] [%eval 0.55] }
11. Kb1 { [%txt "Le roi se met à l'abri."] [%eval 0.41] }
11... Be6 { [%txt "Le fou se développe."] [%eval 0.40] }
12. h4 { [%txt "Le pion h avance."] [%eval 0.41] [%cal Gh4h5] }
12... c5 { [%txt "Le pion attaque la dame.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.49).
1. Qd2 : la dame recule et garde h6 et d6 sous l'œil.
2. g4 et g5 : les pions chassent le cavalier f6.
3. Nd5 : le cavalier échange les défenseurs."] [%eval 0.49] [%cal Gd4d2] } *`,
    ),
    chapter(
      "Aléatoire surprise 1 : après 3...exd4, la marée de pions",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le chapitre 1 jusqu'à 12...c5. La théorie s'arrête là. Les Noirs ne font pas de gaffe : ils jouent des coups de tour pendant que nos pions avancent à l'aile roi. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case clé (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quel pion blanc peut avancer vers le roi noir ? 3. Quelle pièce blanche peut viser d6 ?"] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] }
2. Nf3 { [%txt "Contre e5."] [%eval 0.32] }
2... d6 { [%txt "La Philidor."] [%eval 0.53] }
3. d4 { [%txt "Le centre."] [%eval 0.44] }
3... exd4 { [%txt "Échange."] [%eval 0.69] }
4. Nxd4 { [%txt "Reprise."] [%eval 0.68] }
4... Nf6 { [%txt "Contre e4."] [%eval 0.72] }
5. Nc3 { [%txt "Défense."] [%eval 0.63] }
5... Be7 { [%txt "Développement."] [%eval 0.66] }
6. Bf4 { [%txt "Vers d6."] [%eval 0.61] }
6... Nc6 { [%txt "Contre d4."] [%eval 0.68] }
7. Qd2 { [%txt "Vers le grand roque."] [%eval 0.56] }
7... O-O { [%txt "Roque."] [%eval 0.54] }
8. O-O-O { [%txt "Grand roque."] [%eval 0.57] }
8... Nxd4 { [%txt "Échange."] [%eval 0.48] }
9. Qxd4 { [%txt "Reprise."] [%eval 0.53] }
9... a6 { [%txt "Vers ...b5."] [%eval 0.50] }
10. f3 { [%txt "Soutien."] [%eval 0.42] }
10... b5 { [%txt "L'espace."] [%eval 0.55] }
11. Kb1 { [%txt "À l'abri."] [%eval 0.41] }
11... Be6 { [%txt "Développement."] [%eval 0.40] }
12. h4 { [%txt "Le pion h."] [%eval 0.41] }
12... c5 { [%txt "Fin de la théorie."] [%eval 0.49] }
13. Qd2 { [%txt "La dame recule et garde d6 sous l'œil."] [%eval 0.57] }
13... Rc8 { [%txt "La tour prend la colonne c, mais l'aile roi noire reste sans défense : l'évaluation passe de +0.57 à +1.30."] [%hint "les Noirs jouent à l'aile dame pendant que nos pions sont prêts à l'aile roi."] [%hint "la case g4. Notre pion g y avance, puis g5 chasse le cavalier f6."] [%hint "14.g4 : la marée de pions commence."] [%hintcsl Gg4,Gg5] [%eval 1.30] }
14. g4 { [%txt "Le pion g avance."] [%eval 1.30] [%cal Gg4g5] }
14... b4 { [%txt "Le pion chasse le cavalier c3."] [%eval 1.13] }
15. Nd5 { [%txt "Le cavalier s'installe en d5."] [%eval 1.07] }
15... Re8 { [%txt "La tour défend e7, mais le cavalier d5 reste : l'évaluation passe de +1.07 à +2.01."] [%hint "les Noirs ne prennent pas le cavalier d5 et jouent un coup de tour."] [%hint "la case f5. Notre cavalier y viendra par e3, contre d6 et g7."] [%hint "16.Ne3 : le cavalier vise f5."] [%hintcsl Gf5,Rd6] [%eval 2.01] }
16. Ne3 { [%txt "Le cavalier vise f5."] [%eval 2.06] [%cal Ge3f5] }
16... Nd7 { [%txt "Le cavalier défend f6 et e5."] [%eval 2.40] }
17. Bxd6 { [%txt "On prend le pion d6."] [%eval 2.46] }
17... Rc6 { [%txt "La tour attaque le fou, mais e7 reste en prise : l'évaluation passe de +2.46 à +3.39."] [%hint "les Noirs attaquent notre fou au lieu de reprendre en d6."] [%hint "le fou e7. Notre fou d6 le prend."] [%hint "18.Bxe7 Qxe7 19.Nd5 : le cavalier attaque la dame."] [%hintcsl Re7,Gd6] [%eval 3.39] }
18. Bxe7 { [%txt "On échange."] [%eval 3.00] }
18... Qxe7 { [%txt "La dame reprend."] [%eval 2.98] }
19. Nd5 { [%txt "À RETENIR.

PRO TIP : +3.47. Le cavalier attaque la dame et le pion b4 : un pion de plus et la case d5. Contre la Philidor, le pion d6 est la cible : prends-le dès qu'il est seul."] [%eval 3.47] [%cal Gd5e7] } *`,
    ),
    chapter(
      "Branche B : la Lion, 3...Nf6 4.Nc3 Nbd7 5.Bc4",
      `{ [%txt "LA LION (3...Nf6 et 4...Nbd7).

Les Noirs tiennent e5 avec ...Nbd7 et ...Be7. On développe le fou en c4, vers f7, on roque et on prend l'espace à l'aile dame avec a4. Les Noirs n'ont pas de bon coup libérateur : ...exd4 rend le centre, ...c6 et ...b5 sont lents.

Points clés : f7 est la cible de Bc4 et Ng5 ; a4 empêche ...b5 ; Re1 soutient e4."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] }
2. Nf3 { [%txt "Contre e5."] [%eval 0.32] }
2... d6 { [%txt "La Philidor."] [%eval 0.53] }
3. d4 { [%txt "Le centre."] [%eval 0.44] }
3... Nf6 { [%txt "Le cavalier attaque e4."] [%eval 0.49] }
4. Nc3 { [%txt "Le cavalier défend e4."] [%eval 0.46] }
4... Nbd7 { [%txt "LA LION : le cavalier défend e5."] [%eval 0.47] }
5. Bc4 { [%txt "Le fou vise f7."] [%eval 0.53] [%cal Gc4f7] }
5... Be7 { [%txt "Le fou se développe."] [%eval 0.52] }
(5... d5 { [%txt "Les Noirs frappent le centre, mais e5 tombe : l'évaluation passe de +0.53 à +1.94."] [%hint "les Noirs poussent ...d5 et le pion e5 n'a plus de pion pour le défendre."] [%hint "le pion e5. Notre pion d4 le prend."] [%hint "6.dxe5 : le cavalier f6 est attaqué."] [%hintcsl Re5,Gd4] [%eval 1.94] }
  6. dxe5 { [%txt "À RETENIR.

PRO TIP : +2.38. Le cavalier f6 est attaqué, le centre noir s'effondre. Dans la Lion, ...d5 trop tôt laisse e5 sans défense."] [%eval 2.38] [%cal Ge5f6] })
6. O-O { [%txt "On roque."] [%eval 0.52] }
6... O-O { [%txt "Les Noirs roquent."] [%eval 0.49] }
(6... b6 { [%txt "Les Noirs préparent ...Bb7, mais f7 est sans défense : l'évaluation passe de +0.52 à +1.77."] [%hint "les Noirs jouent un coup lent alors que leur roi est encore en e8 et que f7 est visé."] [%hint "le pion f7. Notre fou c4 le prend avec échec."] [%hint "7.Bxf7+ : le roi doit reprendre, puis Ng5+."] [%hintcsl Rf7,Gc4] [%eval 1.77] }
  7. Bxf7+ { [%txt "Le fou prend f7 avec échec."] [%eval 1.70] }
  7... Kxf7 { [%txt "Le roi reprend."] [%eval 1.61] }
  8. Ng5+ { [%txt "Le cavalier donne échec et vise e6."] [%eval 1.68] }
  8... Kg8 { [%txt "Le roi recule."] [%eval 1.60] }
  9. Ne6 { [%txt "À RETENIR.

PRO TIP : +1.57. Le cavalier e6 attaque la dame d8. Dans la Lion, tant que le roi noir est en e8, compte les défenseurs de f7 à chaque coup."] [%eval 1.57] [%cal Ge6d8] })
7. a4 { [%txt "On empêche ...b5."] [%eval 0.42] }
7... a5 { [%txt "Les Noirs empêchent a5."] [%eval 0.55] }
8. Re1 { [%txt "La tour soutient e4."] [%eval 0.50] }
8... h6 { [%txt "Les Noirs empêchent Ng5 et Bg5."] [%eval 0.48] }
(8... Ng4 { [%txt "Le cavalier vise f2, mais d5 se libère pour notre cavalier : l'évaluation passe de +0.50 à +1.34."] [%hint "les Noirs lancent le cavalier g4 et laissent le contrôle de d5."] [%hint "la case d5. Notre cavalier c3 y saute et attaque e7 et c7."] [%hint "9.Nd5 : le cavalier au centre."] [%hintcsl Gd5,Re7] [%eval 1.34] }
  9. Nd5 { [%txt "À RETENIR.

PRO TIP : +1.52. Le cavalier d5 domine, le cavalier g4 est hors jeu. Contre ...Ng4, la case d5 est la réponse."] [%eval 1.52] [%csl Gd5] })
9. h3 { [%txt "On empêche ...Ng4."] [%eval 0.46] }
9... Re8 { [%txt "La tour soutient e5."] [%eval 0.46] }
10. Be3 { [%txt "Le fou se développe."] [%eval 0.53] }
10... exd4 { [%txt "Les Noirs échangent enfin."] [%eval 0.49] }
11. Qxd4 { [%txt "La dame reprend au centre."] [%eval 0.46] }
11... Nc5 { [%txt "Le cavalier vise e4 et b3."] [%eval 0.60] }
12. Rad1 { [%txt "La tour vise d6."] [%eval 0.57] [%cal Gd1d6] }
(12. g3 { [%txt "LA VARIANTE PIÉGÉE : on protège f4 et h4…"] [%eval -0.86] [%csl Rh3] }
  12... Bxh3 { [%txt "…mais le pion h3 n'a plus de défenseur, et le fou le prend. À RETENIR.

PRO TIP : -0.88. Après ...Nc5, la diagonale c8-h3 est ouverte : g3 affaiblit h3."] [%eval -0.88] [%csl Rh3] })
12... Be6 { [%txt "Le fou se développe."] [%eval 0.55] }
(12... b6 { [%txt "Les Noirs préparent ...Bb7, mais e5 arrive : l'évaluation passe de +0.57 à +2.20."] [%hint "les Noirs jouent ...b6 pendant que notre pion e4 et la tour d1 visent d6."] [%hint "la case e5. Notre pion y avance et attaque d6 et le cavalier f6."] [%hint "13.e5 : le centre éclate."] [%hintcsl Ge5,Rd6] [%eval 2.20] }
  13. e5 { [%txt "À RETENIR.

PRO TIP : +2.10. La colonne d s'ouvre vers d6, le cavalier f6 est attaqué. Contre un coup lent dans la Lion, e5."] [%eval 2.10] [%cal Ge5d6] })
13. Be2 { [%txt "Le fou recule et protège e4 indirectement."] [%eval 0.54] }
13... Qc8 { [%txt "La dame vise h3 et la diagonale c8-h3.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.46).
1. Bf4 : le fou vise d6.
2. e5 au bon moment : le pion d6 est la cible.
3. Nd4 et Nb5 : le cavalier vise c7 et d6."] [%eval 0.46] [%cal Gd1d6] } *`,
    ),
    chapter(
      "Branche C : la Hanham, 3...Nd7 4.Bc4",
      `{ [%txt "LA HANHAM (3...Nd7).

Les Noirs défendent e5 avec le cavalier d7, sans ...Nf6 encore. On sort le fou en c4 tout de suite : f7 est faible, et ...Ngf6 doit se préparer. Après ...c6 et ...exd4, notre cavalier reprend en d4 et la position est plus libre pour nous.

Points clés : 4.Bc4 vise f7 ; Re1, Bf1 puis Bf4 mettent la pression sur e5 et d6. (5.Ng5, attaquant f7, est une autre arme connue contre la Hanham.)"] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] }
2. Nf3 { [%txt "Contre e5."] [%eval 0.32] }
2... d6 { [%txt "La Philidor."] [%eval 0.53] }
3. d4 { [%txt "Le centre."] [%eval 0.44] }
3... Nd7 { [%txt "LA HANHAM : le cavalier défend e5."] [%eval 0.67] }
4. Bc4 { [%txt "Le fou vise f7."] [%eval 0.62] [%cal Gc4f7] }
4... c6 { [%txt "Les Noirs préparent ...b5 ou ...Qc7."] [%eval 0.79] }
(4... g6 { [%txt "Les Noirs préparent le fianchetto, mais e5 tombe : l'évaluation passe de +0.62 à +1.66."] [%hint "les Noirs jouent un coup de pion lent alors que e5 n'a qu'un défenseur."] [%hint "le pion e5. Notre pion d4 le prend."] [%hint "5.dxe5 : le pion e5 tombe, ou la reprise ouvre la diagonale vers f7."] [%hintcsl Re5,Rf7] [%eval 1.66] }
  5. dxe5 { [%txt "À RETENIR.

PRO TIP : +2.78. Le pion e5 tombe, ou la reprise ...dxe5 ouvre la diagonale de notre fou vers f7. Dans la Hanham, chaque coup lent laisse e5 ou f7 sans défense."] [%eval 2.78] [%csl Re5] })
5. O-O { [%txt "On roque."] [%eval 0.81] }
5... exd4 { [%txt "Les Noirs cèdent le centre."] [%eval 0.80] }
6. Nxd4 { [%txt "Le cavalier reprend."] [%eval 0.77] }
6... Ngf6 { [%txt "Le cavalier se développe."] [%eval 0.79] }
7. Re1 { [%txt "La tour vise e7 et soutient e4."] [%eval 0.69] }
7... g6 { [%txt "Le fianchetto."] [%eval 0.76] }
(7... Qb6 { [%txt "La dame attaque d4 et b2, mais le fou la chasse : l'évaluation passe de +0.69 à +1.55."] [%hint "les Noirs sortent la dame sur une diagonale que notre fou c4 peut boucher."] [%hint "la case b3. Notre fou y recule, défend b2 et la dame noire n'a plus de cible."] [%hint "8.Bb3 : on défend et on garde f7 sous le feu."] [%hintcsl Gb3,Rb6] [%eval 1.55] }
  8. Bb3 { [%txt "À RETENIR.

PRO TIP : +1.43. Le fou b3 vise toujours f7, la dame noire est mal placée. Contre ...Qb6, Bb3."] [%eval 1.43] [%cal Gb3f7] })
8. Bf1 { [%txt "Le fou recule et protège g2."] [%eval 0.70] }
8... Bg7 { [%txt "Le fou se développe."] [%eval 0.67] }
9. Bf4 { [%txt "Le fou vise d6."] [%eval 0.67] [%cal Gf4d6] }
9... Ne5 { [%txt "Le cavalier défend d6 et vise c4."] [%eval 0.64] }
(9... Nh5 { [%txt "Le cavalier attaque le fou f4, mais d6 tombe : l'évaluation passe de +0.67 à +3.11."] [%hint "les Noirs attaquent notre fou et oublient le pion d6."] [%hint "le pion d6. Notre fou f4 le prend."] [%hint "10.Bxd6 : un pion de plus."] [%hintcsl Rd6,Gf4] [%eval 3.11] }
  10. Bxd6 { [%txt "À RETENIR.

PRO TIP : +3.01, un pion de plus. Contre la Philidor, le pion d6 est toujours la cible : avant tout recul, regarde s'il est défendu."] [%eval 3.01] [%csl Gd6] })
10. h3 { [%txt "On empêche ...Ng4."] [%eval 0.70] }
(10. Bg3 { [%txt "LA VARIANTE PIÉGÉE : le fou recule par précaution…"] [%eval -0.34] [%csl Rg3] }
  10... Nh5 { [%txt "…mais le cavalier l'attaque et la paire de fous est perdue. À RETENIR.

PRO TIP : -0.30. Le fou f4 n'était pas menacé : h3 garde g4 sans perdre de temps."] [%eval -0.30] [%csl Rg3] })
10... O-O { [%txt "Les Noirs roquent."] [%eval 0.67] }
11. a4 { [%txt "On empêche ...b5."] [%eval 0.75] }
11... Re8 { [%txt "La tour vise e4.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.66).
1. Qd2 et Rad1 : la colonne d vise d6.
2. Nb3 et Be2 : on garde e4 et c4.
3. f4 si le cavalier e5 reste : il doit reculer."] [%eval 0.66] [%cal Gf4d6] } *`,
    ),
    chapter(
      "Branche D : 3...Bg4 4.dxe5, la paire de fous et b7",
      `{ [%txt "3...Bg4.

Les Noirs clouent le cavalier f3 et échangent leur fou. On prend en e5, et après 4...Bxf3 5.Qxf3 dxe5 6.Bc4, la dame et le fou visent b7 et f7 : les Noirs doivent défendre avec précision. Nous avons la paire de fous et l'avance de développement.

Points clés : Qb3 attaque b7 et f7 en même temps ; les Noirs défendent par ...Qf6 et ...Nd7."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] }
2. Nf3 { [%txt "Contre e5."] [%eval 0.32] }
2... d6 { [%txt "La Philidor."] [%eval 0.53] }
3. d4 { [%txt "Le centre."] [%eval 0.44] }
3... Bg4 { [%txt "Le fou cloue le cavalier f3."] [%eval 0.90] }
4. dxe5 { [%txt "On prend."] [%eval 0.87] }
4... Bxf3 { [%txt "Les Noirs donnent la paire de fous : l'évaluation passe de +0.87 à +1.87."] [%hint "les Noirs échangent leur fou contre un cavalier et ouvrent la route à notre dame."] [%hint "la case f3. Notre dame y reprend et vise b7 et f7."] [%hint "5.Qxf3 : la dame reprend avec menace."] [%hintcsl Gf3,Rb7] [%eval 1.87] }
5. Qxf3 { [%txt "La dame reprend."] [%eval 1.65] }
5... dxe5 { [%txt "Les Noirs reprennent."] [%eval 1.73] }
(5... Nc6 { [%txt "Le cavalier se développe, mais b7 et f7 sont visés : l'évaluation passe de +1.65 à +2.47."] [%hint "les Noirs développent le cavalier sans s'occuper de b7, que notre dame peut attaquer."] [%hint "la case b3. Notre dame y attaque b7 et f7."] [%hint "6.Qb3 : double attaque."] [%hintcsl Gb3,Rb7] [%eval 2.47] }
  6. Qb3 { [%txt "À RETENIR.

PRO TIP : +2.56. La dame attaque b7, et f7 suivra avec Bc4. Après ...Bxf3, Qb3 est l'arme contre la Philidor."] [%eval 2.56] [%cal Gb3b7] })
6. Bc4 { [%txt "Le fou vise f7."] [%eval 1.27] [%cal Gc4f7] }
6... Qf6 { [%txt "La dame défend f7."] [%eval 1.29] }
(6... Nf6 { [%txt "Le cavalier se développe, mais b7 tombe : l'évaluation passe de +1.27 à +2.54."] [%hint "les Noirs développent le cavalier, et ni b7 ni f7 n'ont de défense suffisante."] [%hint "la case b3. Notre dame y attaque b7 et f7."] [%hint "7.Qb3 : double attaque sur b7 et f7."] [%hintcsl Gb3,Rf7] [%eval 2.54] }
  7. Qb3 { [%txt "À RETENIR.

PRO TIP : +2.71. Double attaque sur b7 et f7. Contre la Philidor avec ...Bxf3, la dame en b3 et le fou en c4 sont la paire qui gagne."] [%eval 2.71] [%cal Gb3b7,Gc4f7] })
7. Qb3 { [%txt "La dame attaque b7."] [%eval 1.30] }
(7. Qxf6 { [%txt "LA VARIANTE PIÉGÉE : on échange les dames pour simplifier…"] [%eval 0.47] [%csl Rf6] }
  7... Nxf6 { [%txt "…et notre avance de développement ne compte presque plus. À RETENIR.

PRO TIP : +0.43. Sans les dames, b7 et f7 ne sont plus des cibles. Garde les dames : Qb3."] [%eval 0.43] })
7... Nd7 { [%txt "Le cavalier se développe et défend f6."] [%eval 1.43] }
(7... b6 { [%txt "Les Noirs défendent b7 par ...b6, mais la position noire reste en retard : l'évaluation passe de +1.30 à +3.15."] [%hint "les Noirs affaiblissent les cases c6 et a6 pour défendre b7."] [%hint "la case c3. Notre cavalier y sort, vers d5 et b5."] [%hint "8.Nc3 : le développement, puis Nd5 ou Nb5."] [%hintcsl Gc3,Rc6] [%eval 3.15] }
  8. Nc3 { [%txt "À RETENIR.

PRO TIP : +3.51. Le cavalier vise d5 et b5, et c6 est faible. Contre ...b6, développe vers les cases affaiblies."] [%eval 3.51] [%cal Gc3d5] })
8. Qxb7 { [%txt "On prend b7."] [%eval 1.35] }
8... Rb8 { [%txt "La tour attaque la dame."] [%eval 1.33] }
9. Qa6 { [%txt "La dame recule et propose l'échange."] [%eval 1.46] }
(9. Qxa7 { [%txt "LA VARIANTE PIÉGÉE : un deuxième pion…"] [%eval -2.64] [%csl Ra7] }
  9... Bc5 { [%txt "…mais le fou attaque la dame et f2…"] [%eval -2.57] }
  10. Qa6 { [%txt "…la dame recule…"] [%eval -2.70] }
  10... Qxf2+ { [%txt "…et la dame noire entre en f2 avec échec. À RETENIR.

PRO TIP : -2.63. Après ...Rb8, la dame doit revenir : en a7, elle quitte la défense de f2."] [%eval -2.63] [%csl Rf2] })
9... Qxa6 { [%txt "Les Noirs échangent."] [%eval 1.40] }
10. Bxa6 { [%txt "On reprend : un pion de plus.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+1.29).
1. Nc3 et Be3 : on finit le développement.
2. O-O-O : la colonne d est à nous.
3. Bb5 : le fou cloue le cavalier d7."] [%eval 1.29] [%csl Ga6] } *`,
    ),
    chapter(
      "Aléatoire surprise 2 : après la Lion, le fou h6",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le chapitre 3 jusqu'à 13...Qc8. La théorie s'arrête là. Les Noirs ne font pas de gaffe : ils jouent des coups lents pendant que notre fou vise h6 et notre pion e4 frappe d6. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case clé (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quel pion noir est faible ? 3. Quelle pièce blanche peut le prendre ou le chasser ?"] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] }
2. Nf3 { [%txt "Contre e5."] [%eval 0.32] }
2... d6 { [%txt "La Philidor."] [%eval 0.53] }
3. d4 { [%txt "Le centre."] [%eval 0.44] }
3... Nf6 { [%txt "Contre e4."] [%eval 0.49] }
4. Nc3 { [%txt "Défense."] [%eval 0.46] }
4... Nbd7 { [%txt "La Lion."] [%eval 0.47] }
5. Bc4 { [%txt "Vers f7."] [%eval 0.53] }
5... Be7 { [%txt "Développement."] [%eval 0.52] }
6. O-O { [%txt "Roque."] [%eval 0.52] }
6... O-O { [%txt "Roque."] [%eval 0.49] }
7. a4 { [%txt "Contre ...b5."] [%eval 0.42] }
7... a5 { [%txt "Contre a5."] [%eval 0.55] }
8. Re1 { [%txt "Soutien de e4."] [%eval 0.50] }
8... h6 { [%txt "Contre Ng5."] [%eval 0.48] }
9. h3 { [%txt "Contre ...Ng4."] [%eval 0.46] }
9... Re8 { [%txt "Soutien de e5."] [%eval 0.46] }
10. Be3 { [%txt "Développement."] [%eval 0.53] }
10... exd4 { [%txt "Échange."] [%eval 0.49] }
11. Qxd4 { [%txt "Reprise."] [%eval 0.46] }
11... Nc5 { [%txt "Vers e4."] [%eval 0.60] }
12. Rad1 { [%txt "Vers d6."] [%eval 0.57] }
12... Be6 { [%txt "Développement."] [%eval 0.55] }
13. Be2 { [%txt "Recul."] [%eval 0.54] }
13... Qc8 { [%txt "Fin de la théorie."] [%eval 0.46] }
14. Bf4 { [%txt "Le fou vise d6."] [%eval 0.48] [%cal Gf4d6] }
14... b6 { [%txt "Les Noirs jouent un coup lent, et d6 n'a qu'un défenseur : l'évaluation passe de +0.48 à +1.03."] [%hint "les Noirs ne défendent pas d6, attaqué par notre fou et notre tour."] [%hint "la case e5. Notre pion y avance et attaque d6."] [%hint "15.e5 : le pion frappe d6."] [%hintcsl Ge5,Rd6] [%eval 1.03] }
15. e5 { [%txt "Le pion frappe d6."] [%eval 1.24] }
15... dxe5 { [%txt "Les Noirs prennent."] [%eval 1.12] }
16. Nxe5 { [%txt "Le cavalier reprend et vise f7 et c6."] [%eval 1.16] }
16... Na6 { [%txt "Le cavalier recule, loin du roi : l'évaluation passe de +1.16 à +1.79."] [%hint "les Noirs éloignent un cavalier de leur roi."] [%hint "la case h6. Notre dame et notre fou f4 la visent ensemble."] [%hint "17.Qd2 : la dame vient en d2, puis Bxh6."] [%hintcsl Rh6,Gd2] [%eval 1.79] }
17. Qd2 { [%txt "La dame vise h6."] [%eval 2.14] [%cal Gd2h6] }
17... Nb4 { [%txt "Le cavalier vise c2 et d5."] [%eval 2.16] }
18. Bxh6 { [%txt "Le fou prend h6."] [%eval 2.16] }
18... Kh7 { [%txt "Le roi attaque le fou, mais le fou recule avec une double attaque : l'évaluation passe de +2.16 à +3.63."] [%hint "les Noirs attaquent le fou h6 avec le roi au lieu de défendre f6 et e7."] [%hint "la case g5. Notre fou y recule et attaque le cavalier f6, défendu une seule fois."] [%hint "19.Bg5 : le fou cloue et attaque f6."] [%hintcsl Gg5,Rf6] [%eval 3.63] }
19. Bg5 { [%txt "À RETENIR.

PRO TIP : +3.45. Un pion de plus, le cavalier f6 cloué et le roque noir ouvert. Contre ...h6 dans la Lion, la dame et le fou f4 visent h6 ensemble : Bxh6 au bon moment, puis Bg5."] [%eval 3.45] [%cal Gg5f6] } *`,
    ),
    chapter(
      "Branche E : le contre-gambit Philidor, 3...f5",
      `{ [%txt "LE CONTRE-GAMBIT PHILIDOR (3...f5).

Les Noirs attaquent e4 avec le pion f, comme dans un gambit du roi inversé. C'est risqué : leur roi s'ouvre. On répond par 4.Bc4, qui vise g8 et f7, puis Ng5 : le moteur juge la position nettement meilleure pour nous.

Points clés : la diagonale c4-g8 et la case e6 ; le pion d5 avance pour chasser le cavalier c6."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] }
2. Nf3 { [%txt "Contre e5."] [%eval 0.32] }
2... d6 { [%txt "La Philidor."] [%eval 0.53] }
3. d4 { [%txt "Le centre."] [%eval 0.44] }
3... f5 { [%txt "LE CONTRE-GAMBIT PHILIDOR : le pion f attaque e4."] [%eval 2.04] }
4. Bc4 { [%txt "Le fou vise g8 et f7."] [%eval 2.15] [%cal Gc4g8] }
(4. Nc3 { [%txt "LA VARIANTE PIÉGÉE : on défend e4…"] [%eval 1.23] [%csl Re4] }
  4... fxe4 { [%txt "…mais les Noirs prennent quand même…"] [%eval 1.31] }
  5. Nxe4 { [%txt "…et le jeu noir se libère par ...d5. À RETENIR.

PRO TIP : +1.30. Contre 3...f5, la diagonale c4-g8 vaut plus que le pion e4 : Bc4 d'abord."] [%eval 1.30] [%cal Gc4g8] })
4... Nc6 { [%txt "Le cavalier attaque d4."] [%eval 2.14] }
(4... fxe4 { [%txt "Les Noirs prennent e4, mais e5 tombe et f7 avec lui : l'évaluation passe de +2.15 à +3.34."] [%hint "les Noirs prennent un pion alors que leur roi et f7 sont visés par notre fou."] [%hint "le pion e5. Notre cavalier f3 le prend et vise f7."] [%hint "5.Nxe5 : le cavalier attaque f7."] [%hintcsl Re5,Rf7] [%eval 3.34] }
  5. Nxe5 { [%txt "À RETENIR.

PRO TIP : +3.45. Le cavalier et le fou visent f7 ensemble. Contre 3...f5, la prise ...fxe4 ouvre la diagonale vers le roi noir."] [%eval 3.45] [%cal Ge5f7] })
5. Ng5 { [%txt "Le cavalier vise f7 et e6."] [%eval 2.46] [%cal Gg5f7] }
5... Nh6 { [%txt "Le cavalier défend f7."] [%eval 2.51] }
6. d5 { [%txt "Le pion chasse le cavalier c6."] [%eval 2.87] }
6... Ne7 { [%txt "Le cavalier recule."] [%eval 2.54] }
(6... fxe4 { [%txt "Les Noirs prennent e4, mais le cavalier c6 tombe : l'évaluation passe de +2.87 à +5.19."] [%hint "les Noirs prennent un pion alors que leur cavalier c6 est attaqué."] [%hint "le cavalier c6. Notre pion d5 le prend."] [%hint "7.dxc6 : une pièce de plus."] [%hintcsl Rc6,Gd5] [%eval 5.19] }
  7. dxc6 { [%txt "À RETENIR.

PRO TIP : +5.10, une pièce de plus. Avant de prendre un pion, regarde ce que tes pièces laissent en prise."] [%eval 5.10] [%csl Gc6] })
7. Nc3 { [%txt "Développement."] [%eval 2.80] }
7... g6 { [%txt "Le pion soutient f5."] [%eval 2.51] }
8. exf5 { [%txt "On prend."] [%eval 2.73] }
8... Nhxf5 { [%txt "Le cavalier reprend."] [%eval 2.65] }
(8... Bxf5 { [%txt "Le fou reprend, mais le pion g chasse le fou : l'évaluation passe de +2.73 à +3.61."] [%hint "les Noirs reprennent avec le fou, sur une case que nos pions peuvent attaquer."] [%hint "la case g4. Notre pion y avancera après h3, et le fou f5 devra partir."] [%hint "9.h3 : on prépare g4."] [%hintcsl Gg4,Rf5] [%eval 3.61] }
  9. h3 { [%txt "À RETENIR.

PRO TIP : +3.92. Le pion g4 suivra et le fou f5 sera chassé. Contre une pièce noire en f5, h3 et g4."] [%eval 3.92] [%cal Gh3g4] })
9. g4 { [%txt "Le pion g chasse le cavalier f5."] [%eval 2.37] }
9... h6 { [%txt "Les Noirs chassent le cavalier, mais g6 et e6 s'affaiblissent : l'évaluation passe de +2.37 à +2.99."] [%hint "les Noirs affaiblissent encore leur aile roi pour chasser un cavalier qui a une bonne retraite."] [%hint "la case f3. Notre cavalier y recule et vise h4 et e5."] [%hint "10.Nf3 : le cavalier recule, g6 reste faible."] [%hintcsl Gf3,Rg6] [%eval 2.99] }
10. Nf3 { [%txt "Le cavalier recule."] [%eval 2.93] }
10... Ng7 { [%txt "Le cavalier recule.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+3.16).
1. Bd3 et Qe2 : on vise g6 et e6.
2. h4-h5 : le pion casse g6.
3. Ne4 : le cavalier vise d6 et f6."] [%eval 3.16] [%cal Gh2h5] } *`,
    ),
    chapter(
      "Anti-panique : 3...Nc6, 3...Qe7 et 3...Bd7",
      `{ [%txt "ANTI-PANIQUE.

Contre 3.d4, les Noirs ont d'autres coups. Pas de panique : contre 3...Nc6, le pion d5 chasse le cavalier ; contre les coups qui ne règlent pas e5, on prend en e5 ou on se développe.

PRO TIP : contre un coup rare, demande-toi d'abord si le pion e5 est encore défendu."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] }
2. Nf3 { [%txt "Contre e5."] [%eval 0.32] }
2... d6 { [%txt "La Philidor."] [%eval 0.53] }
3. d4 { [%txt "Le centre."] [%eval 0.44] }
3... Nc6 { [%txt "Le cavalier défend e5."] [%eval 0.87] }
(3... Qe7 { [%txt "La dame défend e5, mais elle bloque le fou f8 : l'évaluation passe de +0.44 à +1.08."] [%hint "les Noirs défendent avec la dame, qui bloque leur développement."] [%hint "la case c3. Notre cavalier y sort, vers d5 où il attaquera la dame."] [%hint "4.Nc3 : le développement, puis Nd5."] [%hintcsl Gc3,Gd5] [%eval 1.08] }
  4. Nc3 { [%txt "Développement."] [%eval 1.14] }
  4... Nf6 { [%txt "Développement."] [%eval 1.15] }
  5. Bc4 { [%txt "Le fou vise f7."] [%eval 1.09] }
  5... c6 { [%txt "À RETENIR.

PRO TIP : +1.13. La dame e7 bloque le fou f8, et Nd5 reste une menace. Contre ...Qe7, développe vers d5."] [%eval 1.13] [%csl Gd5] })
(3... Bd7 { [%txt "Le fou se développe passivement et ne défend pas e5 : l'évaluation passe de +0.44 à +1.59."] [%hint "les Noirs développent le fou sans défendre e5."] [%hint "le pion e5. Notre pion d4 le prend."] [%hint "4.dxe5 : un pion, ou une dame noire promenée."] [%hintcsl Re5,Gd4] [%eval 1.59] }
  4. dxe5 { [%txt "On prend."] [%eval 1.60] }
  4... Nc6 { [%txt "Les Noirs développent."] [%eval 1.57] }
  5. Bg5 { [%txt "Le fou attaque la dame."] [%eval 1.62] }
  5... Be7 { [%txt "À RETENIR.

PRO TIP : +1.61. Le pion e5 tient, notre fou est actif. Contre un coup qui ne défend pas e5, prends en e5."] [%eval 1.61] [%cal Gd4e5] })
4. d5 { [%txt "Le pion chasse le cavalier."] [%eval 0.94] [%cal Gd5c6] }
(4. dxe5 { [%txt "LA VARIANTE PIÉGÉE : on prend en e5…"] [%eval 0.59] [%csl Re5] }
  4... dxe5 { [%txt "…les Noirs reprennent…"] [%eval 0.60] }
  5. Qxd8+ { [%txt "…on échange les dames…"] [%eval 0.55] }
  5... Kxd8 { [%txt "…et la position est simplifiée : notre avance d'espace a disparu. À RETENIR.

PRO TIP : +0.53. Contre 3...Nc6, d5 gagne un temps sur le cavalier et garde l'espace."] [%eval 0.53] [%csl Gd5] })
4... Nce7 { [%txt "Le cavalier recule."] [%eval 0.97] }
5. c4 { [%txt "On prend l'espace."] [%eval 0.90] }
5... g6 { [%txt "Le fianchetto."] [%eval 0.97] }
6. Nc3 { [%txt "Développement."] [%eval 0.86] }
6... Bg7 { [%txt "Le fou."] [%eval 0.78] }
7. Be3 { [%txt "Développement."] [%eval 0.77] }
7... Nh6 { [%txt "Le cavalier vise f5.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.89).
1. Be2 et O-O : on finit le développement.
2. c5 : le levier contre d6.
3. h3 et g4 si le cavalier vient en f5."] [%eval 0.89] [%cal Gc4c5] } *`,
    ),
  ],
};
