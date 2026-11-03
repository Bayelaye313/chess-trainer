import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours d'ouverture « Caro-Kann : Avance, Classique, Échange et Panov (avec les
 * Blancs) » — onglet Ouvertures, format « un commentaire par coup » de l'Académie, lu par
 * `CourseTreeViewer` (route `/ouvertures/caro-kann-white/cours`). Public visé :
 * 1500-1800 Elo, répertoire 1.e4 contre 1...c6 (fiche curatée
 * `caro-kann-white`, B12). Ne touche pas au cours `caro-kann` (écrit pour les
 * Noirs) : celui-ci le complète de l'autre côté.
 *
 * ## Contenu (v2 du 2026-11-03, format Ruy Lopez v2, côté Blancs)
 *
 * 1. Fiche d'identité, tronc commun et l'Avance 3...Bf5 (système Short).
 * 2. Aléatoire surprise 1 : après l'Avance, le roi noir au centre.
 * 3. Branche B : l'Avance 3...c5 (4.dxc5).
 * 4. Branche C : la Classique 4...Bf5 (h4-h5, Bd3, grand roque).
 * 5. Branche D : la Classique 4...Nd7 (5.Ng5) et 4...Nf6 (5.Nxf6+).
 * 6. Aléatoire surprise 2 : après la Classique, l'attaque g4-g5.
 * 7. Branche E : l'Échange 3.exd5 cxd5 4.Bd3.
 * 8. Branche F : la Panov 4.c4.
 *
 * Choix des chapitres (2026-11-03, sans base de parties) : les quatre
 * systèmes demandés par l'utilisateur (Avance, Classique, Échange, Panov)
 * avec la réponse noire principale de chacun ; pas de chapitre
 * anti-panique séparé, les coups rares sont traités en variantes. Les
 * branches théoriques s'arrêtent au plus tard au demi-coup 27 ; les
 * chapitres « Aléatoire surprise » prolongent avec les Noirs comme camp
 * « mou » (`_tmp-drift.mts`).
 *
 * Convention côté Blancs (comme `op-ruy-lopez.ts`) : l'élève joue les
 * Blancs ; les fautes sont des coups NOIRS qui portent les 3 indices
 * `[%hint]` + `[%hintcsl]`, le coup blanc suivant est la punition. Les
 * « variantes piégées » sont des coups blancs tentants mais mauvais
 * (10.dxc5, 10.cxd3, 9.Nxe6, 10.gxf3, 9.Bc4…). Une faute qui perd moins de
 * 0.5 devient une « imprécision » sans indices.
 *
 * Sources : théorie établie de la Caro-Kann, TOUTES les lignes arbitrées par
 * Stockfish 19 natif (profondeur 16, MultiPV 1). Toute la prose est
 * originale.
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
 * `scripts/opening-course-src/caro-kann-white.pgn` (et l'en-tête
 * `caro-kann-white.header.txt`) ; regénérer avec
 * `node --import tsx scripts/_tmp-build-opening-course.mts <source> <en-tête> <sortie> 16`
 * (Stockfish natif, voir `scripts/_tmp-sf-native.mts` ; sous Linux,
 * `SF_BIN=<chemin du binaire>`). Les `[%eval]` viennent du moteur, pas de la
 * main. Étape standard : `scripts/_tmp-check-cited-evals.mts op-caro-kann-white`
 * doit sortir 0 écart (un chiffre n'est cité dans un commentaire que s'il est
 * l'éval d'un nœud). Règles de l'utilisateur : SAN en texte brut uniquement
 * (jamais de figurine Unicode), pas de guillemet droit dans un `[%txt]`.
 */

function chapter(title: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, START) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const OP_CARO_KANN_WHITE: CourseTree = {
  chapters: [
    chapter(
      "Fiche d'identité, tronc commun et l'Avance 3...Bf5 (système Short)",
      `{ [%txt "LA CARO-KANN, AVEC LES BLANCS.

Le vrai enjeu : 1...c6 et 2...d5 attaquent e4 sans enfermer le fou c8, contrairement à la Française. Les Noirs veulent une structure saine et une finale solide. Notre réponse : prendre l'espace (l'Avance 3.e5), ou jouer sur le développement (la Classique 3.Nc3), ou ouvrir le jeu (l'Échange 3.exd5 et la Panov 4.c4).

Le déséquilibre recherché : dans l'Avance, le pion e5 prend l'espace et le fou f5 noir devient une cible pour nos pièces ; dans la Classique, h4-h5 gagne de l'espace à l'aile roi pendant que le roi noir hésite.

Pourquoi ces chapitres : pas de base de parties ici, donc le choix suit les quatre systèmes demandés (Avance, Classique, Échange, Panov) et leurs réponses noires principales. Le cours Caro-Kann existant est écrit pour les Noirs : celui-ci le complète de l'autre côté de l'échiquier.

Les structures types :
- Avance : chaîne blanche d4-e5, pions noirs c5-d5-e6 ou c6-d5-e6.
- Classique : pion d4 contre aucun pion noir central, pion h5 avancé.
- Échange : pions symétriques d4 et d5, colonne c ouverte pour les Noirs, colonne e pour nous.
- Panov : pion isolé d4 ou pions pendants, jeu de pièces actif.

Règle d'or : contre la Caro-Kann, chaque temps compte : les Noirs sont solides, il faut les gêner avant qu'ils aient fini leur développement."] [%eval 0.40] }
1. e4 { [%txt "On occupe le centre."] [%eval 0.31] [%csl Ge4] }
1... c6 { [%txt "La Caro-Kann : les Noirs préparent ...d5."] [%eval 0.29] }
2. d4 { [%txt "Le centre idéal."] [%eval 0.38] [%csl Gd4,Ge4] }
2... d5 { [%txt "Les Noirs attaquent e4."] [%eval 0.34] }
3. e5 { [%txt "L'AVANCE : on gagne de l'espace. (3.Nc3 : chapitres 4 à 6 ; 3.exd5 : chapitres 7 et 8.)"] [%eval 0.41] [%cal Ge5f6] }
3... Bf5 { [%txt "Le fou sort avant ...e6 : c'est l'idée de la Caro-Kann. (3...c5 : chapitre 3.)"] [%eval 0.33] }
4. Nf3 { [%txt "Le développement calme du système Short."] [%eval 0.26] [%cal Gf3d4] }
4... e6 { [%txt "Les Noirs ferment la diagonale du fou f8."] [%eval 0.26] }
5. Be2 { [%txt "Le fou se développe et prépare le roque."] [%eval 0.52] }
5... c5 { [%txt "Les Noirs attaquent d4."] [%eval 0.51] }
6. Be3 { [%txt "Le fou défend d4 et vise c5."] [%eval 0.46] [%cal Ge3c5] }
6... Nd7 { [%txt "Le cavalier défend c5."] [%eval 0.59] }
(6... Nh6 { [%txt "Le cavalier part vers f5, mais c5 perd un défenseur : l'évaluation passe de +0.46 à +1.06."] [%hint "les Noirs développent le cavalier au bord sans protéger c5."] [%hint "le pion c5. On le prend : il n'a plus qu'un défenseur, la dame."] [%hint "7.dxc5 Nc6 8.Nd4 : le pion c5 reste à nous."] [%hintcsl Rc5] [%eval 1.06] }
  7. dxc5 { [%txt "On prend c5."] [%eval 1.06] [%cal Gd4c5] }
  7... Nc6 { [%txt "Le cavalier vise e5."] [%eval 1.01] }
  8. Nd4 { [%txt "À RETENIR.

PRO TIP : +1.08. Un pion de plus et le cavalier d4 attaque le fou f5. Dans l'Avance, Be3 prépare toujours dxc5."] [%eval 1.08] [%cal Gd4f5] })
7. O-O { [%txt "On roque."] [%eval 0.54] }
7... Ne7 { [%txt "Le cavalier vise f5 ou c6."] [%eval 0.43] }
(7... c4 { [%txt "UNE IMPRÉCISION : les Noirs ferment l'aile dame et relâchent la pression sur d4. L'évaluation passe de +0.54 à +0.98 : le levier b3 devient fort."] [%eval 0.98] }
  8. b3 { [%txt "Le levier."] [%eval 1.45] [%cal Gb3c4] }
  8... Rc8 { [%txt "La tour soutient c4."] [%eval 1.53] }
  9. bxc4 { [%txt "On prend."] [%eval 1.42] }
  9... dxc4 { [%txt "Les Noirs reprennent."] [%eval 1.40] }
  10. d5 { [%txt "À RETENIR.

PRO TIP : +0.99. Le centre s'ouvre pendant que le roi noir est en e8. Contre ...c4, b3 puis d5."] [%eval 0.99] [%cal Gd5e6] })
8. c4 { [%txt "On frappe le centre noir."] [%eval 0.35] [%cal Gc4d5] }
8... dxc4 { [%txt "Les Noirs prennent."] [%eval 0.39] }
9. Na3 { [%txt "Le cavalier reprendra en c4."] [%eval 0.46] [%cal Ga3c4] }
9... Nd5 { [%txt "Le cavalier s'installe en d5 et attaque e3."] [%eval 0.78] }
(9... Nc6 { [%txt "Le cavalier revient en c6, mais d4 tient : l'évaluation passe de +0.46 à +2.03."] [%hint "les Noirs jouent un coup de cavalier sans régler la menace sur c4."] [%hint "le pion c4. Notre cavalier a3 le reprend, et le fou f5 sera chassé."] [%hint "10.Nxc4 Be4 11.dxc5 : on reprend et on gagne c5."] [%hintcsl Rc4,Ga3] [%eval 2.03] }
  10. Nxc4 { [%txt "On reprend."] [%eval 1.72] [%cal Ga3c4] }
  10... Be4 { [%txt "Le fou se centralise."] [%eval 2.29] }
  11. dxc5 { [%txt "À RETENIR.

PRO TIP : +2.31. Un pion de plus, et nos cavaliers visent d6. Quand les Noirs perdent un temps, prends c5."] [%eval 2.31] [%csl Gc5] })
10. Nxc4 { [%txt "Le cavalier reprend : il vise d6.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.74).
1. dxc5 au bon moment : le cavalier c4 et le fou e3 visent la case d6.
2. Nfd2 puis Bf3 : on chasse le cavalier d5.
3. Rc1 : la colonne c, quand les Noirs ont joué ...Be7 et ...O-O."] [%eval 0.74] [%cal Gc4d6] }
(10. dxc5 { [%txt "LA VARIANTE PIÉGÉE : on prend c5 tout de suite…"] [%eval -0.78] [%csl Re3] }
  10... Nxe3 { [%txt "…mais le cavalier d5 prend le fou e3, et nos pions sont doublés. À RETENIR.

PRO TIP : -0.79. Avant dxc5, regarde ce qui attaque e3 : le cavalier d5 l'échange."] [%eval -0.79] }) *`,
    ),
    chapter(
      "Aléatoire surprise 1 : après l'Avance, le roi noir au centre",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le chapitre 1 jusqu'à 10.Nxc4. La théorie s'arrête là. Les Noirs ne font pas de gaffe nette : ils jouent des coups de pion d'attente pendant que nos pièces visent le roi noir resté au centre. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case clé (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quelle case autour du roi noir n'est plus défendue ? 3. Quel coup ouvre une ligne vers elle ?"] [%eval 0.40] }
1. e4 { [%txt "Le centre."] [%eval 0.31] [%csl Ge4] }
1... c6 { [%txt "La Caro-Kann."] [%eval 0.29] }
2. d4 { [%txt "Le centre idéal."] [%eval 0.38] }
2... d5 { [%txt "Contre e4."] [%eval 0.34] }
3. e5 { [%txt "L'Avance."] [%eval 0.41] [%cal Ge5f6] }
3... Bf5 { [%txt "Le fou sort."] [%eval 0.33] }
4. Nf3 { [%txt "Le système Short."] [%eval 0.26] }
4... e6 { [%txt "Fermeture."] [%eval 0.26] }
5. Be2 { [%txt "Développement."] [%eval 0.52] }
5... c5 { [%txt "Contre d4."] [%eval 0.51] }
6. Be3 { [%txt "Défense de d4."] [%eval 0.46] }
6... Nd7 { [%txt "Défense de c5."] [%eval 0.59] }
7. O-O { [%txt "Roque."] [%eval 0.54] }
7... Ne7 { [%txt "Vers f5."] [%eval 0.43] }
8. c4 { [%txt "Contre d5."] [%eval 0.35] }
8... dxc4 { [%txt "Prise."] [%eval 0.39] }
9. Na3 { [%txt "Vers c4."] [%eval 0.46] }
9... Nd5 { [%txt "Contre e3."] [%eval 0.78] }
10. Nxc4 { [%txt "Fin de la théorie : le cavalier vise d6."] [%eval 0.74] }
10... a6 { [%txt "Un coup de pion d'attente, roi au centre : l'évaluation passe de +0.74 à +1.26."] [%hint "les Noirs poussent un pion au lieu de développer le fou f8 et de roquer."] [%hint "le pion c5. On le prend, et le cavalier d5 échangera notre fou e3 sans conséquence."] [%hint "11.dxc5 : on prend c5."] [%hintcsl Rc5,Rf8] [%eval 1.26] }
11. dxc5 { [%txt "On prend c5."] [%eval 1.30] [%cal Gd4c5] }
11... Nxe3 { [%txt "Le cavalier prend le fou."] [%eval 1.39] }
12. Nxe3 { [%txt "On reprend."] [%eval 1.45] }
12... Nxc5 { [%txt "Les Noirs reprennent le pion."] [%eval 1.30] }
13. Nxf5 { [%txt "On échange le fou f5."] [%eval 1.44] [%cal Ge3f5] }
13... exf5 { [%txt "Les Noirs reprennent : le pion f5 est doublé."] [%eval 1.37] }
14. Qc2 { [%txt "La dame attaque f5."] [%eval 1.47] [%cal Gc2f5] }
(14. Nd4 { [%txt "LA VARIANTE PIÉGÉE : le cavalier attaque f5 lui aussi…  À RETENIR.

PRO TIP : +0.48. Au centre, le cavalier se fait chasser et f5 se défend : la dame en c2 attaque f5 sans rien perdre. Choisis l'attaque que l'adversaire ne peut pas repousser avec gain de temps."] [%eval 0.48] [%csl Rd4] })
14... g6 { [%txt "Le pion défend f5, mais il affaiblit les cases noires : l'évaluation passe de +1.47 à +2.06."] [%hint "les Noirs défendent f5 avec un pion au lieu de développer le fou f8."] [%hint "la colonne d. Notre tour f1 y vient, face à la dame d8 et au roi e8."] [%hint "15.Rfd1 : la tour prend la colonne d."] [%hintcsl Gd1,Rd8] [%eval 2.06] }
15. Rfd1 { [%txt "La tour prend la colonne d, face à la dame d8 et au roi e8. À RETENIR.

PRO TIP : +1.73. La leçon : contre la Caro-Kann d'Avance, un roi noir resté au centre est la cible ; chaque coup de pion d'attente des Noirs nous donne le temps d'ouvrir une colonne de plus."] [%eval 1.73] [%cal Gd1d8] } *`,
    ),
    chapter(
      "Branche B : l'Avance 3...c5",
      `{ [%txt "L'AVANCE AVEC 3...c5.

Les Noirs frappent tout de suite la base de la chaîne, comme dans une Française, mais avec un temps de moins (le pion c a fait deux pas). Notre réponse : 4.dxc5, puis Bb5 et Be3 pour garder le pion c5 le plus longtemps possible, et le pion e5 qui gêne tout le camp noir."] [%eval 0.40] }
1. e4 { [%txt "Le centre."] [%eval 0.31] [%csl Ge4] }
1... c6 { [%txt "La Caro-Kann."] [%eval 0.29] }
2. d4 { [%txt "Le centre idéal."] [%eval 0.38] }
2... d5 { [%txt "Contre e4."] [%eval 0.34] }
3. e5 { [%txt "L'Avance."] [%eval 0.41] [%cal Ge5f6] }
3... c5 { [%txt "Les Noirs attaquent d4 tout de suite."] [%eval 0.41] }
4. dxc5 { [%txt "On prend : le pion c5 et l'espace."] [%eval 0.30] [%cal Gd4c5] }
4... Nc6 { [%txt "Le cavalier vise e5."] [%eval 0.47] }
(4... e6 { [%txt "Les Noirs veulent reprendre avec le fou."] [%eval 0.36] }
  5. Nf3 { [%txt "À RETENIR.

PRO TIP : +0.31. On défend e5 et on laisse ...Bxc5 : notre développement est plus rapide."] [%eval 0.31] [%cal Gf3e5] })
(4... Nh6 { [%txt "Le cavalier part au bord : l'évaluation passe de +0.30 à +1.16."] [%hint "les Noirs développent le cavalier sur une case où notre fou peut le prendre."] [%hint "le cavalier h6. Notre fou c1 le prend, et les pions noirs se doublent."] [%hint "5.Bxh6 gxh6 6.Bb5+ : structure brisée."] [%hintcsl Rh6,Gc1] [%eval 1.16] }
  5. Bxh6 { [%txt "On prend le cavalier."] [%eval 1.34] [%cal Gc1h6] }
  5... gxh6 { [%txt "Reprise."] [%eval 1.14] }
  6. Bb5+ { [%txt "À RETENIR.

PRO TIP : +1.29. Pions h doublés, roi noir sans abri. Contre ...Nh6, Bxh6 dès qu'il n'y a plus de reprise par une pièce."] [%eval 1.29] [%cal Gb5e8] })
5. Bb5 { [%txt "Le fou cloue le cavalier c6."] [%eval 0.49] [%cal Gb5c6] }
5... e6 { [%txt "Les Noirs préparent ...Bxc5."] [%eval 0.41] }
(5... Qa5+ { [%txt "Un échec pour récupérer c5 : l'évaluation passe de +0.49 à +1.37."] [%hint "la dame sort tôt pour donner un échec qui n'attaque rien de durable."] [%hint "la case c3. Notre cavalier s'y interpose en se développant."] [%hint "6.Nc3 e6 7.Be3 : on se développe, et c5 reste défendu."] [%hintcsl Gc3] [%eval 1.37] }
  6. Nc3 { [%txt "On s'interpose en développant."] [%eval 1.41] [%cal Gc3d5] }
  6... e6 { [%txt "Les Noirs préparent ...Bxc5."] [%eval 1.39] }
  7. Be3 { [%txt "À RETENIR.

PRO TIP : +1.33. Le pion c5 est défendu par le fou, et la dame a5 sera chassée. Contre un échec précoce, interpose en te développant."] [%eval 1.33] [%cal Ge3c5] })
6. Be3 { [%txt "Le fou défend c5."] [%eval 0.32] [%cal Ge3c5] }
6... Ne7 { [%txt "Le cavalier se développe : le cavalier c6 est cloué."] [%eval 0.37] }
(6... Qc7 { [%txt "UNE IMPRÉCISION : la dame attaque e5, mais elle se met sur la colonne c. L'évaluation passe de +0.32 à +0.77 : le levier c4 frappe d5."] [%eval 0.77] }
  7. c4 { [%txt "À RETENIR.

PRO TIP : +0.75. Le centre noir craque, et le cavalier c6 reste cloué. Le levier c4 vient dès que le centre noir n'a plus de soutien."] [%eval 0.75] [%cal Gc4d5] })
7. c3 { [%txt "On soutient la diagonale et b4."] [%eval 0.36] }
7... Bd7 { [%txt "Le fou rompt le clouage."] [%eval 0.36] }
8. Nf3 { [%txt "Le cavalier défend e5.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.24).
1. Bxc6 au bon moment : les Noirs reprennent avec une pièce, et c5 reste à nous.
2. b4 : on soutient le pion c5 par un pion.
3. O-O et Nbd2-b3 : le cavalier rejoint la défense de c5."] [%eval 0.24] [%cal Gb2b4] }
(8. f4 { [%txt "LA VARIANTE PIÉGÉE : on soutient e5 par un pion…  À RETENIR.

PRO TIP : -0.35. Le cavalier g1 n'a plus f3, et la diagonale du roi s'ouvre. Développe d'abord le cavalier."] [%eval -0.35] [%csl Rg1] }) *`,
    ),
    chapter(
      "Branche C : la Classique 3.Nc3 dxe4 4.Nxe4 Bf5",
      `{ [%txt "LA CLASSIQUE AVEC 4...Bf5.

Les Noirs sortent le fou avant ...e6. On le chasse avec gain de temps (5.Ng3), puis on pousse h4-h5 pour gagner l'espace à l'aile roi. Après Bd3 et l'échange des fous, la dame d3 et le grand roque donnent une position plus active."] [%eval 0.40] }
1. e4 { [%txt "Le centre."] [%eval 0.31] [%csl Ge4] }
1... c6 { [%txt "La Caro-Kann."] [%eval 0.29] }
2. d4 { [%txt "Le centre idéal."] [%eval 0.38] }
2... d5 { [%txt "Contre e4."] [%eval 0.34] }
3. Nc3 { [%txt "LA CLASSIQUE : le cavalier défend e4."] [%eval 0.18] }
3... dxe4 { [%txt "Les Noirs prennent."] [%eval 0.16] }
4. Nxe4 { [%txt "On reprend au centre."] [%eval 0.19] }
4... Bf5 { [%txt "Le fou attaque le cavalier e4. (4...Nd7 et 4...Nf6 : chapitre 5.)"] [%eval 0.29] }
(4... Nd7 { [%txt "Le système Karpov."] [%eval 0.30] }
  5. Ng5 { [%txt "À RETENIR.

PRO TIP : +0.37. Le cavalier vise f7 et e6 : c'est le chapitre 5."] [%eval 0.37] [%cal Gg5f7] })
5. Ng3 { [%txt "Le cavalier chasse le fou."] [%eval 0.38] [%cal Gg3f5] }
5... Bg6 { [%txt "Le fou recule."] [%eval 0.30] }
(5... Nf6 { [%txt "Le cavalier se développe, mais le fou f5 reste attaqué : l'évaluation passe de +0.38 à +1.02."] [%hint "les Noirs développent le cavalier sans s'occuper du fou f5."] [%hint "le fou f5. Notre cavalier g3 le prend."] [%hint "6.Nxf5 Qa5+ 7.Bd2 Qxf5 : on garde la paire de fous."] [%hintcsl Rf5] [%eval 1.02] }
  6. Nxf5 { [%txt "On prend le fou."] [%eval 1.05] [%cal Gg3f5] }
  6... Qa5+ { [%txt "La dame donne échec."] [%eval 0.94] }
  7. Bd2 { [%txt "On s'interpose."] [%eval 1.15] }
  7... Qxf5 { [%txt "À RETENIR.

PRO TIP : +1.04. La paire de fous et une avance de développement. Contre 5.Ng3, le fou doit reculer tout de suite."] [%eval 1.04] [%csl Gd2] })
6. h4 { [%txt "Le pion menace h5, qui enfermerait le fou."] [%eval 0.26] [%cal Gh4h5] }
6... h6 { [%txt "Les Noirs donnent une case au fou en h7."] [%eval 0.30] }
7. Nf3 { [%txt "Développement."] [%eval 0.26] }
7... Nd7 { [%txt "Le cavalier empêche Ne5."] [%eval 0.28] }
8. h5 { [%txt "Le pion gagne de l'espace."] [%eval 0.26] [%csl Gh5] }
8... Bh7 { [%txt "Le fou recule en h7."] [%eval 0.29] }
(8... Bf5 { [%txt "Le fou sort en f5, face au cavalier g3 : l'évaluation passe de +0.26 à +2.35."] [%hint "le fou noir se remet sur une case attaquée par notre cavalier."] [%hint "le fou f5. Notre cavalier g3 le prend."] [%hint "9.Nxf5 Qa5+ 10.Bd2 Qxf5 : la paire de fous."] [%hintcsl Rf5] [%eval 2.35] }
  9. Nxf5 { [%txt "On prend."] [%eval 2.60] }
  9... Qa5+ { [%txt "Échec."] [%eval 3.18] }
  10. Bd2 { [%txt "On s'interpose."] [%eval 3.20] }
  10... Qxf5 { [%txt "À RETENIR.

PRO TIP : +3.10. La paire de fous, et le pion h5 garde l'espace. Un fou qui revient sur une case attaquée est perdu ou échangé."] [%eval 3.10] [%cal Gd2a5] })
9. Bd3 { [%txt "On propose l'échange des fous."] [%eval 0.29] [%cal Gd3h7] }
9... Bxd3 { [%txt "Les Noirs échangent."] [%eval 0.26] }
(9... e6 { [%txt "Les Noirs refusent l'échange : l'évaluation passe de +0.29 à +1.28."] [%hint "les Noirs laissent le fou h7 face au nôtre sans l'échanger."] [%hint "le fou h7. On le prend : la tour h8 doit reprendre et se déplace."] [%hint "10.Bxh7 Rxh7 11.Bf4 : la tour h7 est mal placée."] [%hintcsl Rh7] [%eval 1.28] }
  10. Bxh7 { [%txt "On prend."] [%eval 1.32] }
  10... Rxh7 { [%txt "La tour reprend."] [%eval 1.45] }
  11. Bf4 { [%txt "À RETENIR.

PRO TIP : +1.38. La tour h7 est hors jeu et le fou f4 contrôle d6. Quand l'adversaire hésite à échanger, échange au moment qui le gêne."] [%eval 1.38] [%cal Gf4d6] })
10. Qxd3 { [%txt "On reprend avec la dame."] [%eval 0.27] }
(10. cxd3 { [%txt "LA VARIANTE PIÉGÉE : on reprend avec un pion…  À RETENIR.

PRO TIP : -0.58. Le pion d3 isolé et la dame passive : reprends toujours avec la dame."] [%eval -0.58] [%csl Rd3] })
10... e6 { [%txt "Les Noirs ferment la diagonale."] [%eval 0.30] }
11. Bd2 { [%txt "Le fou prépare le grand roque."] [%eval 0.32] }
11... Ngf6 { [%txt "Développement."] [%eval 0.31] }
12. O-O-O { [%txt "Le grand roque : la tour vise la colonne d."] [%eval 0.31] }
12... Be7 { [%txt "Développement."] [%eval 0.32] }
13. Kb1 { [%txt "Le roi quitte la colonne c.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.27).
1. Ne4 : échange du cavalier f6, le meilleur défenseur noir.
2. Qe2 et Rhe1 : la colonne e contre e6.
3. c4 et d5 : le levier central quand les Noirs ont roqué."] [%eval 0.27] [%cal Gg3e4] } *`,
    ),
    chapter(
      "Branche D : la Classique 4...Nd7 et 4...Nf6",
      `{ [%txt "LA CLASSIQUE AVEC 4...Nd7 (KARPOV).

Les Noirs préparent ...Ngf6 sans permettre Nxf6 avec pions doublés. Notre plan : 5.Ng5, qui vise f7 et e6, puis Bd3, N1f3 et Qe2. Attention au sacrifice en e6 : il ne marche que si les Noirs ont joué ...h6 trop tôt. Contre 4...Nf6, 5.Nxf6+ et la structure noire est abîmée."] [%eval 0.40] }
1. e4 { [%txt "Le centre."] [%eval 0.31] [%csl Ge4] }
1... c6 { [%txt "La Caro-Kann."] [%eval 0.29] }
2. d4 { [%txt "Le centre idéal."] [%eval 0.38] }
2... d5 { [%txt "Contre e4."] [%eval 0.34] }
3. Nc3 { [%txt "La Classique."] [%eval 0.18] }
3... dxe4 { [%txt "Prise."] [%eval 0.16] }
4. Nxe4 { [%txt "Reprise."] [%eval 0.19] }
4... Nd7 { [%txt "Le système Karpov."] [%eval 0.30] }
(4... Nf6 { [%txt "Les Noirs proposent l'échange."] [%eval 0.24] }
  5. Nxf6+ { [%txt "On échange avec échec."] [%eval 0.19] }
  5... exf6 { [%txt "À RETENIR.

PRO TIP : +0.22. Majorité blanche saine à l'aile dame, et le roi noir moins à l'abri. Plan : Bd3, Ne2, O-O, puis c4."] [%eval 0.22] [%csl Rf6] })
5. Ng5 { [%txt "Le cavalier vise f7 et e6."] [%eval 0.37] [%cal Gg5f7] }
5... Ngf6 { [%txt "Développement."] [%eval 0.48] }
6. Bd3 { [%txt "Le fou vise h7."] [%eval 0.45] [%cal Gd3h7] }
6... e6 { [%txt "Le pion défend f7 et d5."] [%eval 0.44] }
7. N1f3 { [%txt "Développement."] [%eval 0.49] }
7... Bd6 { [%txt "Le fou vise h2."] [%eval 0.44] }
(7... h6 { [%txt "Les Noirs chassent le cavalier trop tôt : l'évaluation passe de +0.49 à +1.11."] [%hint "les Noirs chassent le cavalier g5 alors que e6 n'est défendu que par le pion f7."] [%hint "la case e6. Notre cavalier s'y sacrifie : après ...fxe6, le fou d3 donne échec en g6."] [%hint "8.Nxe6 fxe6 9.Bg6+ : le roi noir doit marcher."] [%hintcsl Ge6,Gg6] [%eval 1.11] }
  8. Nxe6 { [%txt "Le sacrifice."] [%eval 1.26] [%cal Gg5e6] }
  8... fxe6 { [%txt "Les Noirs prennent."] [%eval 1.18] }
  9. Bg6+ { [%txt "Échec."] [%eval 1.29] }
  9... Ke7 { [%txt "À RETENIR.

PRO TIP : +1.28. Le roi noir est au centre, sans roque possible. Le sacrifice Nxe6 ne marche que si le roi ne peut pas aller en f8 ou g8 : ici, ...h6 avant le roque l'a permis."] [%eval 1.28] [%csl Re7] })
8. Qe2 { [%txt "La dame se place sur la colonne e."] [%eval 0.41] }
8... h6 { [%txt "Maintenant ...h6 est jouable : après Nxe6 fxe6 Bg6+, le roi noir trouve la case f8."] [%eval 0.43] }
(8... Qb6 { [%txt "La dame sort, mais f7 n'a plus de défenseur sûr : l'évaluation passe de +0.41 à +0.95."] [%hint "la dame noire part en b6 et laisse f7 et e6 sans soutien."] [%hint "la case f7. Notre cavalier g5 la prend : le roi doit reprendre et marcher."] [%hint "9.Nxf7 Kxf7 10.Ng5+ : le roi noir est exposé."] [%hintcsl Rf7,Ge6] [%eval 0.95] }
  9. Nxf7 { [%txt "Le sacrifice."] [%eval 0.53] }
  9... Kxf7 { [%txt "Les Noirs prennent."] [%eval 0.38] }
  10. Ng5+ { [%txt "Échec."] [%eval 0.47] }
  10... Kf8 { [%txt "Le roi recule."] [%eval 0.32] }
  11. Nxe6+ { [%txt "À RETENIR.

PRO TIP : +0.35. Deux pions et l'initiative contre une pièce : le roi noir est exposé. Quand la dame noire quitte d8, f7 et e6 deviennent des cibles."] [%eval 0.35] [%csl Re6] })
9. Ne4 { [%txt "Le cavalier recule et propose l'échange."] [%eval 0.38] }
(9. Nxe6 { [%txt "LA VARIANTE PIÉGÉE : le sacrifice qui marchait au coup 8…"] [%eval -1.16] [%csl Re6] }
  9... fxe6 { [%txt "…ne marche plus : le roi noir a g8 ou f8 après Bg6+, et la dame e2 ne suffit pas. À RETENIR.

PRO TIP : -1.19, une pièce de moins. Ne sacrifie en e6 que si le roi noir ne peut pas fuir."] [%eval -1.19] })
9... Nxe4 { [%txt "Les Noirs échangent."] [%eval 0.37] }
(9... Bb4+ { [%txt "Un échec qui ne sert à rien : l'évaluation passe de +0.38 à +1.19."] [%hint "le fou donne un échec et quitte la défense de d6 et de h2."] [%hint "la case c3. Notre pion s'y interpose et chasse le fou."] [%hint "10.c3 Nxe4 11.cxb4 : on gagne une pièce contre un cavalier, l'espace en plus."] [%hintcsl Gc3,Rb4] [%eval 1.19] }
  10. c3 { [%txt "Le pion chasse le fou."] [%eval 1.11] }
  10... Nxe4 { [%txt "Les Noirs échangent."] [%eval 1.20] }
  11. cxb4 { [%txt "À RETENIR.

PRO TIP : +1.23. La paire de fous et l'espace à l'aile dame. Un échec sans suite rend le temps à l'adversaire."] [%eval 1.23] [%cal Gb4b5] })
10. Qxe4 { [%txt "La dame reprend et vise h7."] [%eval 0.37] [%cal Ge4h7] }
10... Qc7 { [%txt "La dame couvre h2 et e5."] [%eval 0.35] }
11. O-O { [%txt "On roque."] [%eval 0.35] }
11... b6 { [%txt "Les Noirs préparent ...Bb7.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.35).
1. Qg4 : la dame vise g7 et e6.
2. Bd2 et Rae1 : les pièces sur la colonne e.
3. c4 et d5 : le levier central contre le roi noir resté en e8."] [%eval 0.35] [%cal Ge4g4] } *`,
    ),
    chapter(
      "Aléatoire surprise 2 : après la Classique, l'attaque g4-g5",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le chapitre 4 jusqu'à 13.Kb1. La théorie s'arrête là. Les Noirs roquent au petit côté, face à notre pion h5. Ils ne font pas de gaffe nette : ils jouent à l'aile dame pendant que nos pions g et h ouvrent leur roque. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case clé (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quelle pièce noire ne défend plus son roi ? 3. Quel échange ouvre une ligne vers lui ?"] [%eval 0.40] }
1. e4 { [%txt "Le centre."] [%eval 0.31] [%csl Ge4] }
1... c6 { [%txt "La Caro-Kann."] [%eval 0.29] }
2. d4 { [%txt "Le centre idéal."] [%eval 0.38] }
2... d5 { [%txt "Contre e4."] [%eval 0.34] }
3. Nc3 { [%txt "La Classique."] [%eval 0.18] }
3... dxe4 { [%txt "Prise."] [%eval 0.16] }
4. Nxe4 { [%txt "Reprise."] [%eval 0.19] }
4... Bf5 { [%txt "Contre e4."] [%eval 0.29] }
5. Ng3 { [%txt "Le fou est chassé."] [%eval 0.38] }
5... Bg6 { [%txt "Recul."] [%eval 0.30] }
6. h4 { [%txt "Menace h5."] [%eval 0.26] }
6... h6 { [%txt "Case h7."] [%eval 0.30] }
7. Nf3 { [%txt "Développement."] [%eval 0.26] }
7... Nd7 { [%txt "Contre e5."] [%eval 0.28] }
8. h5 { [%txt "Espace."] [%eval 0.26] }
8... Bh7 { [%txt "Recul."] [%eval 0.29] }
9. Bd3 { [%txt "Échange proposé."] [%eval 0.29] }
9... Bxd3 { [%txt "Échange."] [%eval 0.26] }
10. Qxd3 { [%txt "Reprise."] [%eval 0.27] }
10... e6 { [%txt "Fermeture."] [%eval 0.30] }
11. Bd2 { [%txt "Préparation du grand roque."] [%eval 0.32] }
11... Ngf6 { [%txt "Développement."] [%eval 0.31] }
12. O-O-O { [%txt "Grand roque."] [%eval 0.31] }
12... Be7 { [%txt "Développement."] [%eval 0.32] }
13. Kb1 { [%txt "Fin de la théorie."] [%eval 0.27] }
13... O-O { [%txt "Les Noirs roquent au petit côté, face à notre pion h5."] [%eval 0.21] }
14. Ne4 { [%txt "Le cavalier propose l'échange du cavalier f6."] [%eval 0.24] [%cal Ge4f6] }
14... c5 { [%txt "Les Noirs attaquent d4."] [%eval 0.24] }
15. g4 { [%txt "Le pion g rejoint h5 : g5 menace."] [%eval 0.27] [%cal Gg4g5] }
15... Rc8 { [%txt "Un coup de tour à l'aile dame, alors que g5 arrive : l'évaluation passe de +0.27 à +2.18."] [%hint "les Noirs jouent à l'aile dame pendant que nos pions avancent vers leur roi."] [%hint "le cavalier f6 et le pion h6. Notre pion g les attaque en g5."] [%hint "16.g5 : le pion chasse le cavalier et frappe h6."] [%hintcsl Rf6,Rh6,Gg5] [%eval 2.18] }
16. g5 { [%txt "Le pion frappe f6 et h6."] [%eval 2.38] [%cal Gg5f6,Gg5h6] }
16... c4 { [%txt "La dame d3 est attaquée."] [%eval 2.00] }
17. Qe2 { [%txt "La dame recule en gardant e4."] [%eval 2.22] }
(17. Nxf6+ { [%txt "LA VARIANTE PIÉGÉE : on échange avec échec…  À RETENIR.

PRO TIP : +0.02. L'échange ramène une pièce noire en défense et notre attaque s'éteint. Garde les pièces quand ton pion g5 travaille déjà."] [%eval 0.02] [%csl Rf6] })
17... Nxe4 { [%txt "Les Noirs échangent."] [%eval 2.09] }
18. Qxe4 { [%txt "La dame reprend et vise b7 et h7."] [%eval 2.12] [%cal Ge4h7] }
18... Qb6 { [%txt "La dame attaque b2 au lieu de prendre en g5 : l'évaluation passe de +2.12 à +4.06."] [%hint "les Noirs cherchent b2 au lieu de régler la tension en g5."] [%hint "la case b2 et le pion g5. Un pion en c3 couvre b2 et d4, et g5 reste en place."] [%hint "19.c3 : on ferme la diagonale, puis gxh6."] [%hintcsl Gc3,Rh6] [%eval 4.06] }
19. c3 { [%txt "Le pion couvre b2 et d4."] [%eval 3.73] [%cal Gc3d4] }
19... f5 { [%txt "Le pion f avance et affaiblit e6 et g6 : l'évaluation passe de +3.73 à +4.59."] [%hint "les Noirs poussent le pion f devant leur roi."] [%hint "la case e6 et le pion c4. Notre dame recule en e2, d'où elle vise les deux."] [%hint "20.Qe2 : la dame vise e6 et c4."] [%hintcsl Re6,Rc4,Ge2] [%eval 4.59] }
20. Qe2 { [%txt "La dame vise e6 et c4."] [%eval 5.14] [%cal Ge2e6,Ge2c4] }
20... Kh7 { [%txt "Le roi se met à l'abri du pion g."] [%eval 5.07] }
21. Rde1 { [%txt "La tour rejoint la colonne e."] [%eval 4.95] [%cal Ge1e6] }
21... Rc6 { [%txt "La tour défend e6."] [%eval 5.12] }
22. gxh6 { [%txt "À RETENIR.

PRO TIP : +5.98, avantage décisif. Le roque noir est ouvert. La leçon : contre la Classique, le pion h5 avancé prépare g4-g5 ; chaque coup noir à l'aile dame laisse avancer le pion g."] [%eval 5.98] [%cal Gh6g7] } *`,
    ),
    chapter(
      "Branche E : l'Échange 3.exd5 cxd5 4.Bd3",
      `{ [%txt "L'ÉCHANGE AVEC 4.Bd3.

La structure est symétrique, mais nos pièces sont mieux placées : Bd3 contrôle f5, c3 soutient d4, et Bf4 prend la diagonale avant ...e6. Notre plan : Qb3 contre b7, Nd2 et Ngf3, puis le roque. Les Noirs ont la colonne c ; nous, la colonne e et la case e5."] [%eval 0.40] }
1. e4 { [%txt "Le centre."] [%eval 0.31] [%csl Ge4] }
1... c6 { [%txt "La Caro-Kann."] [%eval 0.29] }
2. d4 { [%txt "Le centre idéal."] [%eval 0.38] }
2... d5 { [%txt "Contre e4."] [%eval 0.34] }
3. exd5 { [%txt "L'ÉCHANGE : on ouvre le jeu."] [%eval 0.19] }
3... cxd5 { [%txt "Les Noirs reprennent."] [%eval 0.20] }
4. Bd3 { [%txt "Le fou contrôle f5. (4.c4 : chapitre 8.)"] [%eval 0.18] [%cal Gd3f5] }
4... Nc6 { [%txt "Développement."] [%eval 0.18] }
5. c3 { [%txt "On soutient d4."] [%eval 0.16] [%cal Gc3d4] }
5... Nf6 { [%txt "Développement."] [%eval 0.20] }
6. Bf4 { [%txt "Le fou se développe avant ...e6."] [%eval 0.17] [%cal Gf4b8] }
6... Bg4 { [%txt "Le fou sort aussi."] [%eval 0.21] }
7. Qb3 { [%txt "La dame vise b7 et d5."] [%eval 0.03] [%cal Gb3b7] }
7... Qd7 { [%txt "La dame défend b7 par la deuxième rangée."] [%eval 0.23] }
(7... Rc8 { [%txt "La tour prend la colonne c, mais b7 n'est plus défendu : l'évaluation passe de +0.03 à +0.78."] [%hint "la tour noire quitte a8 et laisse le pion b7 seul."] [%hint "le pion b7. Notre dame le prend."] [%hint "8.Qxb7 : on prend le pion."] [%hintcsl Rb7] [%eval 0.78] }
  8. Qxb7 { [%txt "À RETENIR.

PRO TIP : +0.78. Un pion de plus. Avec la dame en b3, compte toujours les défenseurs de b7."] [%eval 0.78] [%csl Gb7] })
8. Nd2 { [%txt "Le cavalier défend f3 et e4."] [%eval 0.26] }
8... e6 { [%txt "Les Noirs ferment le centre."] [%eval 0.27] }
9. Ngf3 { [%txt "Développement."] [%eval 0.23] }
9... Bxf3 { [%txt "Les Noirs échangent."] [%eval 0.41] }
10. Nxf3 { [%txt "On reprend avec le cavalier."] [%eval 0.21] }
(10. gxf3 { [%txt "LA VARIANTE PIÉGÉE : on reprend avec un pion pour ouvrir la colonne g…  À RETENIR.

PRO TIP : -0.92. La structure blanche est brisée et le roi n'a plus d'abri. Reprends avec le cavalier."] [%eval -0.92] [%csl Rf3] })
10... Bd6 { [%txt "Le fou propose l'échange."] [%eval 0.27] }
(10... O-O-O { [%txt "Le grand roque face à notre dame : l'évaluation passe de +0.21 à +0.95."] [%hint "le roi noir se met à l'aile dame, où notre dame b3 attaque déjà."] [%hint "le pion a. Avancé en a4 puis a5, il ouvre une ligne vers le roi c8."] [%hint "11.a4 : la marée de pions commence."] [%hintcsl Ga4,Rc8] [%eval 0.95] }
  11. a4 { [%txt "À RETENIR.

PRO TIP : +0.59. Le pion a ouvre la colonne vers le roi noir. Contre un grand roque face à ta dame, avance les pions."] [%eval 0.59] [%cal Ga4a5] })
11. Bxd6 { [%txt "On échange."] [%eval 0.18] }
11... Qxd6 { [%txt "La dame reprend."] [%eval 0.26] }
(11... Nxd4 { [%txt "Les Noirs prennent d4 au lieu de reprendre : l'évaluation passe de +0.18 à +6.58."] [%hint "les Noirs prennent un pion et oublient que le fou d6 doit être repris."] [%hint "le cavalier d4. Notre pion c3 le prend, et nous gardons le fou d6."] [%hint "12.cxd4 : on prend le cavalier."] [%hintcsl Rd4] [%eval 6.58] }
  12. cxd4 { [%txt "À RETENIR.

PRO TIP : +6.36, une pièce de plus. Reprends d'abord ce qui a été pris : un pion gagné ne vaut pas une pièce."] [%eval 6.36] [%csl Gd4] })
12. O-O { [%txt "On roque."] [%eval 0.29] }
12... O-O { [%txt "Les Noirs roquent.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.32).
1. Rae1 et Ne5 : le cavalier s'installe en e5, appuyé par d4.
2. Qc2 : la diagonale b1-h7 contre h7.
3. Contre ...Rab8 et ...b5, a3 : on empêche la marée noire."] [%eval 0.32] [%cal Gf3e5] } *`,
    ),
    chapter(
      "Branche F : la Panov 3.exd5 cxd5 4.c4",
      `{ [%txt "L'ATTAQUE PANOV.

On frappe d5 tout de suite : après 4...Nf6 5.Nc3 Nc6 6.Nf3 Bg4 7.cxd5 Nxd5 8.Qb3, la ligne la plus forcée de la Caro-Kann. Les Noirs sacrifient b7 pour le développement ; on prend, et on rend une partie du matériel pour garder l'initiative."] [%eval 0.40] }
1. e4 { [%txt "Le centre."] [%eval 0.31] [%csl Ge4] }
1... c6 { [%txt "La Caro-Kann."] [%eval 0.29] }
2. d4 { [%txt "Le centre idéal."] [%eval 0.38] }
2... d5 { [%txt "Contre e4."] [%eval 0.34] }
3. exd5 { [%txt "L'Échange."] [%eval 0.19] }
3... cxd5 { [%txt "Reprise."] [%eval 0.20] }
4. c4 { [%txt "LA PANOV : on attaque d5 tout de suite."] [%eval 0.20] [%cal Gc4d5] }
4... Nf6 { [%txt "Le cavalier défend d5."] [%eval 0.22] }
5. Nc3 { [%txt "Le cavalier attaque d5."] [%eval 0.20] }
5... Nc6 { [%txt "Développement."] [%eval 0.21] }
6. Nf3 { [%txt "Développement."] [%eval 0.15] }
6... Bg4 { [%txt "Le fou cloue le cavalier f3."] [%eval 0.27] }
7. cxd5 { [%txt "On prend d5."] [%eval 0.11] }
7... Nxd5 { [%txt "Le cavalier reprend."] [%eval 0.13] }
(7... Bxf3 { [%txt "Les Noirs échangent d'abord, mais d5 tombe : l'évaluation passe de +0.11 à +0.69."] [%hint "les Noirs donnent leur fou avant de reprendre le pion d5."] [%hint "la dame. Elle reprend en f3 et attaque d5 et b7."] [%hint "8.Qxf3 Nxd4 9.Qd1 : le pion d5 reste à nous."] [%hintcsl Gf3,Rd5] [%eval 0.69] }
  8. Qxf3 { [%txt "La dame reprend."] [%eval 0.66] }
  8... Nxd4 { [%txt "Le cavalier prend d4 et attaque la dame."] [%eval 0.55] }
  9. Qd1 { [%txt "À RETENIR.

PRO TIP : +0.66. Le pion d5 passé et la paire de fous. Contre ...Bg4, reprends d'abord en d5."] [%eval 0.66] [%csl Gd5] })
8. Qb3 { [%txt "La dame attaque d5 et b7."] [%eval 0.12] [%cal Gb3b7,Gb3d5] }
8... Bxf3 { [%txt "Les Noirs échangent le cavalier f3."] [%eval 0.07] }
(8... Nxc3 { [%txt "Les Noirs échangent en c3 : l'évaluation passe de +0.12 à +1.13."] [%hint "le cavalier noir échange en c3 et laisse le fou g4 et b7 sans soutien."] [%hint "le pion b. Il reprend en c3, et la colonne b s'ouvre vers b7."] [%hint "9.bxc3 : on reprend, puis Qxb7."] [%hintcsl Gc3,Rb7] [%eval 1.13] }
  9. bxc3 { [%txt "À RETENIR.

PRO TIP : +1.09. Le pion b7 et le fou g4 sont attaqués. Garde la tension : l'échange en c3 renforce notre centre."] [%eval 1.09] [%cal Gb3b7] })
9. gxf3 { [%txt "On reprend avec le pion : la dame garde b7 en vue."] [%eval 0.18] }
(9. Bc4 { [%txt "LA VARIANTE PIÉGÉE : le fou attaque d5 au lieu de reprendre…  À RETENIR.

PRO TIP : -2.70. Le fou f3 noir reste en vie et notre roque est brisé : reprends d'abord en f3."] [%eval -2.70] [%csl Rf3] })
9... e6 { [%txt "Les Noirs sacrifient b7."] [%eval 0.23] }
10. Qxb7 { [%txt "On prend le pion."] [%eval 0.24] }
10... Nxd4 { [%txt "Les Noirs prennent d4."] [%eval 0.25] }
(10... Ndb4 { [%txt "Le cavalier menace c2, mais d4 reste debout : l'évaluation passe de +0.24 à +0.90."] [%hint "les Noirs attaquent c2 au lieu de prendre d4."] [%hint "le fou f1. Il se développe en b5 avec clouage du cavalier c6."] [%hint "11.Bb5 Qc8 12.Qxc8+ Rxc8 : l'échange des dames garde notre pion."] [%hintcsl Gb5,Rc6] [%eval 0.90] }
  11. Bb5 { [%txt "Le clouage."] [%eval 0.87] [%cal Gb5c6] }
  11... Qc8 { [%txt "Les Noirs proposent l'échange."] [%eval 1.44] }
  12. Qxc8+ { [%txt "On échange."] [%eval 1.09] }
  12... Rxc8 { [%txt "À RETENIR.

PRO TIP : +1.20. Un pion de plus dans la finale. Développe avec un clouage quand l'adversaire menace une case."] [%eval 1.20] [%csl Gd4] })
11. Bb5+ { [%txt "Échec : le fou contrôle d7 et e8."] [%eval 0.14] }
11... Nxb5 { [%txt "Les Noirs prennent."] [%eval 0.15] }
12. Qc6+ { [%txt "Échec : la dame attaque le cavalier b5 et la tour a8.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.09).
1. Qxb5+ ou Nxb5 : on récupère la pièce.
2. Le roi blanc va en e2 ou f1 : sans dames, il est en sécurité.
3. La finale est égale ; notre pion f3 doublé est compensé par l'activité."] [%eval 0.09] [%cal Gc6a8] } *`,
    ),
  ],
};
