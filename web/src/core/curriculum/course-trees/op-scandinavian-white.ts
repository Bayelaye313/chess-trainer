import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours d'ouverture « Scandinave (avec les Blancs) » — onglet Ouvertures,
 * format « un commentaire par coup » de l'Académie, lu par
 * `CourseTreeViewer` (route `/ouvertures/scandinavian-white/cours`). Public
 * visé : 1500-1800 Elo, répertoire 1.e4 contre 1...d5 (fiche curatée
 * `scandinavian-white`, B01). Ne remplace pas `scandinavian` (fiche côté
 * Noirs, sans cours).
 *
 * ## Contenu (v2 du 2026-11-03, format Ruy Lopez v2, côté Blancs)
 *
 * 1. Fiche d'identité, tronc commun et 3...Qa5 (Bd2, Qe2, grand roque).
 * 2. Aléatoire surprise 1 : après 3...Qa5, le roi noir sans abri.
 * 3. Branche B : 3...Qd6 (g3, Bg2, h3-g4).
 * 4. Aléatoire surprise 2 : après 3...Qd6, la marée de pions.
 * 5. Branche C : 3...Qd8 (Ne5, g4-h4).
 * 6. Branche D : 2...Nf6 3.d4 Nxd5, la Scandinave moderne.
 * 7. Branche E : le gambit portugais 3...Bg4 (f3, g4, c4).
 * 8. Anti-panique : 3...Qe5+, 3...Qe6+ et 3...Qa5 4.d4 e5.
 *
 * Choix des chapitres (2026-11-03, sans base de parties) : les réponses
 * noires principales après 2.exd5 (trois retraites de dame, deux systèmes
 * avec 2...Nf6) et les échecs précoces de la dame ; aucun autre cours ne
 * traite 1...d5. Les branches théoriques s'arrêtent au plus tard au
 * demi-coup 27 ; les chapitres « Aléatoire surprise » prolongent avec les
 * Noirs comme camp « mou » (`_tmp-drift.mts`).
 *
 * Convention côté Blancs (comme `op-ruy-lopez.ts`) : l'élève joue les
 * Blancs ; les fautes sont des coups NOIRS qui portent les 3 indices
 * `[%hint]` + `[%hintcsl]`, le coup blanc suivant est la punition. Les
 * « variantes piégées » sont des coups blancs tentants mais mauvais
 * (11.bxc3, 15.Bxc5, 6.Bf4 et 11.Bf4 contre la dame d6, 8.O-O, 10.Bf4,
 * 9.cxd5, 4.Ne4, 6.dxe5). Une faute qui perd moins de 0.5 devient une
 * « imprécision » sans indices.
 *
 * Sources : théorie établie de la Scandinave, TOUTES les lignes arbitrées
 * par Stockfish 19 natif (profondeur 16, MultiPV 1) ; 8.g4 et 9.h4 contre
 * 3...Qd8, et 5.g4 dans le gambit portugais, sont des choix du moteur. Toute
 * la prose est originale.
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
 * `scripts/opening-course-src/scandinavian-white.pgn` (et l'en-tête
 * `scandinavian-white.header.txt`) ; regénérer avec
 * `node --import tsx scripts/_tmp-build-opening-course.mts <source> <en-tête> <sortie> 16`
 * (Stockfish natif, voir `scripts/_tmp-sf-native.mts` ; sous Linux,
 * `SF_BIN=<chemin du binaire>`). Les `[%eval]` viennent du moteur, pas de la
 * main. Étape standard : `scripts/_tmp-check-cited-evals.mts op-scandinavian-white`
 * doit sortir 0 écart (un chiffre n'est cité dans un commentaire que s'il est
 * l'éval d'un nœud). Règles de l'utilisateur : SAN en texte brut uniquement
 * (jamais de figurine Unicode), pas de guillemet droit dans un `[%txt]`.
 */

function chapter(title: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, START) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const OP_SCANDINAVIAN_WHITE: CourseTree = {
  chapters: [
    chapter(
      "Fiche d'identité, tronc commun et 3...Qa5",
      `{ [%txt "LA SCANDINAVE, AVEC LES BLANCS.

Le vrai enjeu : 1...d5 attaque e4 tout de suite. Après 2.exd5, les Noirs reprennent avec la dame (2...Qxd5) ou préparent la reprise avec le cavalier (2...Nf6). Dans les deux cas, on gagne des temps sur la pièce noire qui a repris en d5 : 3.Nc3 contre la dame, 4.Nf3 et c4 contre le cavalier.

Le déséquilibre recherché : une avance de développement et un pion central d4 contre aucun pion noir au centre. Les Noirs ont une position solide (...c6, ...Bf5, ...e6) mais passive : notre plan est le grand roque, Ne5 ou d5, et l'attaque.

Pourquoi ces chapitres : pas de base de parties ici, donc le choix suit les réponses principales des Noirs après 2.exd5 : 3...Qa5, 3...Qd6 et 3...Qd8 avec la dame ; 2...Nf6 avec 3...Nxd5 ou 3...Bg4 (le gambit portugais) ; plus les échecs précoces 3...Qe5+ et 3...Qe6+. Aucun autre cours ne traite la Scandinave.

Les structures types :
- 3...Qa5 et 3...Qd8 : pion d4 contre c6-e6, notre grand roque contre le petit roque noir.
- 3...Qd6 : grand roque noir, nos pions g et h avancent.
- 2...Nf6 : pion d5 avancé contre le fianchetto noir, ou gambit avec nos pions f3-g4.

Règle d'or : chaque temps gagné sur la dame ou le cavalier noir doit servir à développer une pièce."] [%eval 0.36] }
1. e4 { [%txt "On occupe le centre."] [%eval 0.40] [%csl Ge4] }
1... d5 { [%txt "La Scandinave : les Noirs attaquent e4 tout de suite."] [%eval 0.68] }
2. exd5 { [%txt "On prend."] [%eval 0.67] [%cal Ge4d5] }
2... Qxd5 { [%txt "La dame reprend. (2...Nf6 : chapitres 6 et 7.)"] [%eval 0.70] }
3. Nc3 { [%txt "Le cavalier attaque la dame avec gain de temps."] [%eval 0.72] [%cal Gc3d5] }
3... Qa5 { [%txt "La dame se met à l'abri en a5 et cloue le cavalier c3. (3...Qd6 : chapitre 3 ; 3...Qd8 : chapitre 5 ; 3...Qe5+ et 3...Qe6+ : chapitre 8.)"] [%eval 0.72] }
4. d4 { [%txt "Le centre : d4 libère le fou c1."] [%eval 0.65] [%csl Gd4] }
4... Nf6 { [%txt "Développement."] [%eval 0.74] }
5. Nf3 { [%txt "Développement."] [%eval 0.75] }
5... c6 { [%txt "Les Noirs donnent une case de repli à la dame en c7."] [%eval 0.75] }
6. Bc4 { [%txt "Le fou vise f7 et prépare le roque."] [%eval 0.67] [%cal Gc4f7] }
6... Bf5 { [%txt "Le fou sort avant ...e6."] [%eval 0.68] }
7. Bd2 { [%txt "Le fou défend le cavalier c3 et décloue."] [%eval 0.59] [%cal Gd2c3] }
7... e6 { [%txt "Les Noirs ferment le centre."] [%eval 0.78] }
(7... Bg4 { [%txt "Le fou change de diagonale et perd un temps : l'évaluation passe de +0.59 à +1.58."] [%hint "les Noirs déplacent leur fou une deuxième fois au lieu de se développer."] [%hint "la case d5. Notre cavalier c3, décloué, y saute et attaque la dame a5."] [%hint "8.Nd5 Qd8 9.Ne3 : le cavalier chasse la dame et le fou g4."] [%hintcsl Gd5,Ra5] [%eval 1.58] }
  8. Nd5 { [%txt "Le cavalier attaque la dame."] [%eval 1.17] [%cal Gd5a5] }
  8... Qd8 { [%txt "La dame recule."] [%eval 1.47] }
  9. Ne3 { [%txt "À RETENIR.

PRO TIP : +1.69. Le cavalier attaque le fou g4 : encore un temps. Contre une dame en a5, le cavalier c3 décloué vise d5."] [%eval 1.69] [%cal Ge3g4] })
8. Qe2 { [%txt "La dame prépare le grand roque et d5."] [%eval 0.49] }
8... Bb4 { [%txt "Le fou cloue le cavalier c3."] [%eval 0.43] }
(8... Nbd7 { [%txt "Le développement naturel, mais la case d5 n'est plus surveillée : l'évaluation passe de +0.49 à +1.64."] [%hint "les Noirs développent le cavalier b8 et laissent la poussée d5."] [%hint "la case d5. Notre pion y avance, attaque e6 et c6 et ouvre la colonne e vers le roi e8."] [%hint "9.d5 : la percée centrale."] [%hintcsl Gd5,Re8] [%eval 1.64] }
  9. d5 { [%txt "À RETENIR.

PRO TIP : +1.57. La percée d5 ouvre le jeu pendant que le roi noir est en e8. Avec la dame en e2, d5 est toujours dans l'air."] [%eval 1.57] [%cal Gd4d5,Ge2e8] })
9. O-O-O { [%txt "Le grand roque : la tour d1 soutient d4."] [%eval 0.40] }
9... Nbd7 { [%txt "Développement."] [%eval 0.45] }
10. a3 { [%txt "On chasse le fou b4."] [%eval 0.50] [%cal Ga3b4] }
10... Bxc3 { [%txt "Les Noirs échangent."] [%eval 0.55] }
(10... Nb6 { [%txt "Le cavalier attaque le fou c4, mais le fou b4 reste en prise : l'évaluation passe de +0.50 à +1.74."] [%hint "les Noirs attaquent notre fou au lieu de régler la menace sur le fou b4."] [%hint "la case e5. Notre cavalier y saute, et le fou b4 n'a plus de bonne retraite."] [%hint "11.Ne5 : le cavalier se centralise et le fou b4 reste attaqué."] [%hintcsl Ge5,Rb4] [%eval 1.74] }
  11. Ne5 { [%txt "À RETENIR.

PRO TIP : +1.32. Le fou b4 est toujours attaqué et notre cavalier domine. Règle d'abord la pièce en prise avant d'attaquer."] [%eval 1.32] [%cal Ga3b4] })
11. Bxc3 { [%txt "On reprend avec le fou : il vise g7 et la grande diagonale."] [%eval 0.53] }
(11. bxc3 { [%txt "LA VARIANTE PIÉGÉE : on reprend avec le pion…"] [%eval -6.02] [%csl Ra3] }
  11... Qxa3+ { [%txt "…et la dame prend a3 avec échec : le roque blanc est ouvert. À RETENIR.

PRO TIP : -6.38. Avec le grand roque, reprends en c3 avec le fou : le pion b2 garde a3."] [%eval -6.38] })
11... Qc7 { [%txt "La dame recule."] [%eval 0.49] }
12. Ne5 { [%txt "Le cavalier se centralise.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.48).
1. g4 : on chasse le fou f5 avec gain de temps.
2. Rhe1 et d5 : la percée centrale contre le roi noir.
3. Ba2 : le fou s'abrite et garde la diagonale a2-g8."] [%eval 0.48] [%cal Gg2g4] } *`,
    ),
    chapter(
      "Aléatoire surprise 1 : après 3...Qa5, le roi noir sans abri",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le chapitre 1 jusqu'à 12.Ne5. La théorie s'arrête là. Les Noirs échangent au centre puis hésitent à roquer : leur roi va chercher un abri à l'aile dame, sous le feu de nos fous et de nos tours. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case clé (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Où le roi noir peut-il encore s'abriter ? 3. Quelle pièce peut lui donner échec ou couper sa route ?"] [%eval 0.36] }
1. e4 { [%txt "Le centre."] [%eval 0.40] [%csl Ge4] }
1... d5 { [%txt "La Scandinave."] [%eval 0.68] }
2. exd5 { [%txt "Prise."] [%eval 0.67] }
2... Qxd5 { [%txt "Reprise."] [%eval 0.70] }
3. Nc3 { [%txt "Gain de temps."] [%eval 0.72] }
3... Qa5 { [%txt "Repli."] [%eval 0.72] }
4. d4 { [%txt "Le centre."] [%eval 0.65] }
4... Nf6 { [%txt "Développement."] [%eval 0.74] }
5. Nf3 { [%txt "Développement."] [%eval 0.75] }
5... c6 { [%txt "Case c7."] [%eval 0.75] }
6. Bc4 { [%txt "Contre f7."] [%eval 0.67] }
6... Bf5 { [%txt "Le fou sort."] [%eval 0.68] }
7. Bd2 { [%txt "Décloue."] [%eval 0.59] }
7... e6 { [%txt "Fermeture."] [%eval 0.78] }
8. Qe2 { [%txt "Grand roque en vue."] [%eval 0.49] }
8... Bb4 { [%txt "Clouage."] [%eval 0.43] }
9. O-O-O { [%txt "Grand roque."] [%eval 0.40] }
9... Nbd7 { [%txt "Développement."] [%eval 0.45] }
10. a3 { [%txt "Contre le fou."] [%eval 0.50] }
10... Bxc3 { [%txt "Échange."] [%eval 0.55] }
11. Bxc3 { [%txt "Reprise."] [%eval 0.53] }
11... Qc7 { [%txt "Recul."] [%eval 0.49] }
12. Ne5 { [%txt "Fin de la théorie."] [%eval 0.48] }
12... Nxe5 { [%txt "Les Noirs échangent."] [%eval 0.41] }
13. dxe5 { [%txt "On reprend : le pion e5 chasse le cavalier f6."] [%eval 0.46] }
13... Nd5 { [%txt "Le cavalier s'installe en d5."] [%eval 0.29] }
14. Bd4 { [%txt "Le fou se centralise."] [%eval 0.47] [%cal Gd4a7] }
14... c5 { [%txt "UNE IMPRÉCISION : le pion chasse le fou, mais la diagonale a4-e8 s'ouvre vers le roi resté en e8. L'évaluation passe de +0.47 à +0.96."] [%eval 0.96] }
15. Bb5+ { [%txt "Échec."] [%eval 0.78] [%cal Gb5e8] }
(15. Bxc5 { [%txt "LA VARIANTE PIÉGÉE : on prend le pion c5…"] [%eval -5.18] [%csl Rc5] }
  15... Qxc5 { [%txt "…mais rien ne défendait le fou c5 : la dame le reprend. À RETENIR.

PRO TIP : -5.24, une pièce de moins. Compte les défenseurs avant de prendre : ici, le fou c5 n'en avait aucun."] [%eval -5.24] })
15... Kd8 { [%txt "Le roi va en d8, sur la colonne de notre tour : l'évaluation passe de +0.78 à +2.21."] [%hint "le roi noir choisit d8, face à notre tour d1, au lieu de f8."] [%hint "le fou d4. Il recule en e3 et garde la case c5, et la colonne d s'ouvrira vers le roi."] [%hint "16.Be3 : le fou recule en gardant tout."] [%hintcsl Ge3,Rd8] [%eval 2.21] }
16. Be3 { [%txt "Le fou recule et contrôle c5 et g5."] [%eval 2.50] [%cal Ge3c5] }
16... Kc8 { [%txt "Le roi cherche un abri."] [%eval 2.29] }
17. Rhe1 { [%txt "La tour soutient e5."] [%eval 2.56] }
17... h5 { [%txt "Les Noirs empêchent g4."] [%eval 2.51] }
18. Bc4 { [%txt "Le fou attaque le cavalier d5."] [%eval 2.82] [%cal Gc4d5] }
18... Qc6 { [%txt "UNE IMPRÉCISION : la dame défend d5 au lieu de chasser notre fou, et se place face à notre roi. L'évaluation passe de +2.82 à +3.30."] [%eval 3.30] }
19. Rd2 { [%txt "On prépare le doublement."] [%eval 3.20] [%cal Gd2d5] }
19... Kb8 { [%txt "Le roi recule encore, sans régler d5 : l'évaluation passe de +3.20 à +4.23."] [%hint "le roi noir joue au lieu de défendre le cavalier d5 une deuxième fois."] [%hint "le cavalier d5. Notre tour e1 vient en d1 : il sera attaqué trois fois."] [%hint "20.Red1 : les tours doublées frappent d5."] [%hintcsl Rd5,Gd1] [%eval 4.23] }
20. Red1 { [%txt "À RETENIR.

PRO TIP : +4.74, avantage décisif. Le cavalier d5 est attaqué trois fois. La leçon : contre la Scandinave, un roi noir qui reste au centre devient une cible pour nos fous et nos tours sur les colonnes ouvertes."] [%eval 4.74] [%cal Gd1d5,Gc4d5] } *`,
    ),
    chapter(
      "Branche B : 3...Qd6",
      `{ [%txt "LA VARIANTE 3...Qd6.

La dame se place en d6, d'où elle surveille e5 et b4. Les Noirs jouent souvent ...a6, ...Bg4, ...Nc6 et le grand roque. Notre plan : g3 et Bg2 contre l'aile dame noire, le petit roque, puis h3 et g4 pour gagner l'espace à l'aile roi. Attention à la diagonale de la dame d6 : elle voit f4 et h2."] [%eval 0.36] }
1. e4 { [%txt "Le centre."] [%eval 0.40] [%csl Ge4] }
1... d5 { [%txt "La Scandinave."] [%eval 0.68] }
2. exd5 { [%txt "Prise."] [%eval 0.67] }
2... Qxd5 { [%txt "Reprise."] [%eval 0.70] }
3. Nc3 { [%txt "Gain de temps."] [%eval 0.72] }
3... Qd6 { [%txt "La dame recule en d6."] [%eval 0.72] }
4. d4 { [%txt "Le centre."] [%eval 0.74] }
4... Nf6 { [%txt "Développement."] [%eval 0.67] }
5. Nf3 { [%txt "Développement."] [%eval 0.71] }
5... a6 { [%txt "Les Noirs empêchent Nb5 et Bb5."] [%eval 1.14] }
6. g3 { [%txt "Le fou ira en g2, contre b7 et l'aile dame."] [%eval 1.09] [%cal Gf1g2] }
(6. Bf4 { [%txt "LA VARIANTE PIÉGÉE : le fou attaque la dame avec gain de temps…"] [%eval -6.53] [%csl Rf4] }
  6... Qxf4 { [%txt "…mais la dame d6 le prend : f4 n'était défendu par rien. À RETENIR.

PRO TIP : -6.52, une pièce de moins. Contre la dame en d6, le fou c1 ne va jamais en f4 sans soutien."] [%eval -6.52] })
6... Bg4 { [%txt "Le fou cloue le cavalier f3."] [%eval 1.16] }
7. Bg2 { [%txt "Le fou se développe."] [%eval 0.95] [%cal Gg2b7] }
7... Nc6 { [%txt "Le cavalier attaque d4."] [%eval 0.89] }
(7... h6 { [%txt "Un coup de pion lent : l'évaluation passe de +0.95 à +1.48."] [%hint "les Noirs jouent un coup de pion au lieu de se développer."] [%hint "le fou g4. Notre pion h le chasse, et il devra s'échanger ou reculer."] [%hint "8.h3 : on chasse le fou."] [%hintcsl Rg4,Gh3] [%eval 1.48] }
  8. h3 { [%txt "À RETENIR.

PRO TIP : +1.54. Le fou g4 doit s'échanger en f3 : notre fou g2 devient le meilleur de l'échiquier. Contre un coup lent, chasse la pièce avancée."] [%eval 1.54] [%cal Gh3g4] })
8. O-O { [%txt "On roque."] [%eval 1.01] }
8... O-O-O { [%txt "Le grand roque : le pion d4 est attaqué."] [%eval 1.11] }
(8... Nd7 { [%txt "Le cavalier recule et bloque le fou f8 : l'évaluation passe de +1.01 à +2.09."] [%hint "les Noirs retirent le cavalier f6, qui gardait d5 et e4."] [%hint "la case e3 et le pion d5. Notre fou c1 se développe en e3, puis d5 chasse le cavalier c6."] [%hint "9.Be3 : on se développe, d5 suivra."] [%hintcsl Ge3,Gd5] [%eval 2.09] }
  9. Be3 { [%txt "À RETENIR.

PRO TIP : +2.48. Le fou défend d4 et d5 se prépare. Quand un cavalier recule, prends l'espace qu'il libère."] [%eval 2.48] [%cal Gd4d5] })
9. h3 { [%txt "On questionne le fou."] [%eval 1.01] [%cal Gh3g4] }
9... Bh5 { [%txt "Le fou garde le clouage."] [%eval 0.98] }
(9... Bf5 { [%txt "Le fou recule en f5, où il manque de cases : l'évaluation passe de +1.01 à +2.67."] [%hint "le fou noir quitte le clouage pour une case que nos pièces attaquent."] [%hint "la case g5. Notre cavalier f3 y saute : il vise f7 et h7, et le fou f5 n'a plus de bonne case."] [%hint "10.Ng5 : le cavalier attaque f7."] [%hintcsl Gg5,Rf7] [%eval 2.67] }
  10. Ng5 { [%txt "À RETENIR.

PRO TIP : +2.72. Le cavalier attaque f7, et d5 suivra contre le cavalier c6. Quand le fou adverse quitte le clouage, le cavalier f3 redevient libre."] [%eval 2.72] [%cal Gg5f7] })
10. g4 { [%txt "Le pion chasse le fou."] [%eval 0.88] [%cal Gg4h5] }
10... Bg6 { [%txt "Le fou recule en g6.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.90).
1. Re1 et Ne2 : on renforce d4 avant d'attaquer.
2. c4 puis b4 : la marée de pions contre le grand roque noir.
3. Attention : jamais Bf4, la dame d6 le prend."] [%eval 0.90] [%cal Ga2a4] } *`,
    ),
    chapter(
      "Aléatoire surprise 2 : après 3...Qd6, la marée de pions",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le chapitre 3 jusqu'à 10...Bg6. La théorie s'arrête là. Les Noirs ont roqué au grand côté : nos pions a, b et c vont avancer vers leur roi. Ils ne font pas de gaffe nette : leurs pièces bougent sans plan pendant que la marée monte. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case clé (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quel pion blanc peut avancer avec gain de temps ? 3. Quelle pièce noire il chasse ?"] [%eval 0.36] }
1. e4 { [%txt "Le centre."] [%eval 0.40] [%csl Ge4] }
1... d5 { [%txt "La Scandinave."] [%eval 0.68] }
2. exd5 { [%txt "Prise."] [%eval 0.67] }
2... Qxd5 { [%txt "Reprise."] [%eval 0.70] }
3. Nc3 { [%txt "Gain de temps."] [%eval 0.72] }
3... Qd6 { [%txt "Repli."] [%eval 0.72] }
4. d4 { [%txt "Le centre."] [%eval 0.74] }
4... Nf6 { [%txt "Développement."] [%eval 0.67] }
5. Nf3 { [%txt "Développement."] [%eval 0.71] }
5... a6 { [%txt "Contre Nb5."] [%eval 1.14] }
6. g3 { [%txt "Fianchetto."] [%eval 1.09] }
6... Bg4 { [%txt "Clouage."] [%eval 1.16] }
7. Bg2 { [%txt "Le fou."] [%eval 0.95] }
7... Nc6 { [%txt "Contre d4."] [%eval 0.89] }
8. O-O { [%txt "Roque."] [%eval 1.01] }
8... O-O-O { [%txt "Grand roque."] [%eval 1.11] }
9. h3 { [%txt "Contre le fou."] [%eval 1.01] }
9... Bh5 { [%txt "Clouage."] [%eval 0.98] }
10. g4 { [%txt "Le pion chasse."] [%eval 0.88] }
10... Bg6 { [%txt "Fin de la théorie."] [%eval 0.90] }
11. Re1 { [%txt "La tour soutient la colonne e."] [%eval 0.78] [%cal Ge1e7] }
(11. Bf4 { [%txt "LA VARIANTE PIÉGÉE : le fou attaque la dame…"] [%eval -5.20] [%csl Rf4] }
  11... Qxf4 { [%txt "…mais la dame d6 le prend : f4 n'était défendu par rien. À RETENIR.

PRO TIP : -5.20, une pièce de moins. La dame d6 voit f4 : regarde toujours les diagonales de la dame adverse avant de poser un fou."] [%eval -5.20] })
11... e6 { [%txt "Les Noirs ferment la diagonale."] [%eval 0.88] }
12. Ne2 { [%txt "Le cavalier va vers f4 ou g3, et c3 se libère pour le pion c."] [%eval 0.80] [%cal Gc2c4] }
12... Nd5 { [%txt "Le cavalier s'installe en d5, où un pion peut le chasser : l'évaluation passe de +0.80 à +1.49."] [%hint "le cavalier se met en d5, une case que notre pion c peut attaquer."] [%hint "la case c4. Après a3, le pion c avance avec gain de temps."] [%hint "13.a3 : on prépare c4 et b4."] [%hintcsl Rd5,Gc4] [%eval 1.49] }
13. a3 { [%txt "On prépare c4 et b4."] [%eval 1.47] [%cal Ga3b4] }
13... Qd7 { [%txt "UNE IMPRÉCISION : la dame recule sans but, et le cavalier d5 reste seul face à c4. L'évaluation passe de +1.47 à +1.91."] [%eval 1.91] }
14. c4 { [%txt "Le pion chasse le cavalier."] [%eval 1.67] [%cal Gc4d5] }
14... Nde7 { [%txt "Le cavalier recule en e7, où il bloque le fou f8 : l'évaluation passe de +1.67 à +2.75."] [%hint "le cavalier recule sur une case passive."] [%hint "le pion b. Il avance en b4 puis b5 contre le roi c8."] [%hint "15.b4 : la marée de pions."] [%hintcsl Gb4,Rc8] [%eval 2.75] }
15. b4 { [%txt "À RETENIR.

PRO TIP : +3.27, avantage décisif. b5 menace le cavalier c6 et ouvre la route du roi c8. La leçon : contre le grand roque noir de la Scandinave, les pions a, b et c avancent avec gain de temps sur chaque pièce noire."] [%eval 3.27] [%cal Gb4b5] } *`,
    ),
    chapter(
      "Branche C : 3...Qd8",
      `{ [%txt "LA VARIANTE 3...Qd8.

La dame rentre à la maison : position solide, mais passive. Notre plan : d4, Nf3, Bc4, puis Ne5, qui vise f7 et prépare g4 contre le fou f5. Avec h4, nos pions de l'aile roi chassent le fou noir avec gain de temps."] [%eval 0.36] }
1. e4 { [%txt "Le centre."] [%eval 0.40] [%csl Ge4] }
1... d5 { [%txt "La Scandinave."] [%eval 0.68] }
2. exd5 { [%txt "Prise."] [%eval 0.67] }
2... Qxd5 { [%txt "Reprise."] [%eval 0.70] }
3. Nc3 { [%txt "Gain de temps."] [%eval 0.72] }
3... Qd8 { [%txt "La dame rentre à la maison."] [%eval 0.76] }
4. d4 { [%txt "Le centre."] [%eval 0.74] }
4... Nf6 { [%txt "Développement."] [%eval 0.75] }
5. Nf3 { [%txt "Développement."] [%eval 0.81] }
5... c6 { [%txt "Préparation de ...Bf5."] [%eval 0.87] }
6. Bc4 { [%txt "Le fou vise f7."] [%eval 0.84] [%cal Gc4f7] }
6... Bf5 { [%txt "Le fou sort."] [%eval 1.35] }
7. Ne5 { [%txt "Le cavalier vise f7 et prépare g4."] [%eval 1.36] [%cal Ge5f7] }
7... e6 { [%txt "Les Noirs couvrent f7 et d5."] [%eval 1.31] }
(7... Bg6 { [%txt "Le fou recule tout de suite, sur une case que nos pions attaquent : l'évaluation passe de +1.36 à +2.67."] [%hint "le fou noir se place en g6, devant notre pion h."] [%hint "le pion h. Il avance en h4 puis h5 et chasse le fou."] [%hint "8.h4 e6 9.h5 : le fou est chassé."] [%hintcsl Rg6,Gh5] [%eval 2.67] }
  8. h4 { [%txt "Le pion menace h5."] [%eval 2.44] [%cal Gh4h5] }
  8... e6 { [%txt "Les Noirs couvrent f7."] [%eval 2.62] }
  9. h5 { [%txt "À RETENIR.

PRO TIP : +2.75. Le fou g6 doit quitter la diagonale : nos pions gagnent l'espace. Un fou en g6 devant un pion h libre est une cible."] [%eval 2.75] [%cal Gh5g6] })
8. g4 { [%txt "Le pion chasse le fou."] [%eval 1.39] [%cal Gg4f5] }
(8. O-O { [%txt "LA VARIANTE PIÉGÉE : le roque naturel…  À RETENIR.

PRO TIP : +0.17. On a perdu l'occasion de chasser le fou f5 : avec le roi en g1, g4 affaiblirait notre propre roque. Avec Ne5, joue g4 tout de suite."] [%eval 0.17] [%csl Rg1] })
8... Bg6 { [%txt "Le fou recule."] [%eval 1.36] }
9. h4 { [%txt "Le pion menace h5."] [%eval 1.37] [%cal Gh4h5] }
9... Nbd7 { [%txt "Le cavalier attaque e5."] [%eval 1.24] }
(9... b5 { [%txt "Le pion chasse le fou c4, mais l'aile dame noire s'affaiblit : l'évaluation passe de +1.37 à +1.99."] [%hint "les Noirs poussent un pion de l'aile dame pendant que nos pions avancent à l'aile roi."] [%hint "la case e2. Notre fou y recule et garde h5 sous contrôle."] [%hint "10.Be2 : le fou recule, h5 suivra."] [%hintcsl Ge2,Rc6] [%eval 1.99] }
  10. Be2 { [%txt "À RETENIR.

PRO TIP : +1.81. Le pion c6 est affaibli, et h5 va chasser le fou g6. Un pion qui chasse une pièce sans plan crée une faiblesse."] [%eval 1.81] [%cal Ge2h5] })
10. Qe2 { [%txt "La dame soutient e5 et prépare le grand roque.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+1.33).
1. h5 : on chasse le fou g6 avec gain de temps.
2. Bd2 et O-O-O : le roi à l'aile dame.
3. Nxg6 au bon moment : on supprime le défenseur de f7."] [%eval 1.33] [%cal Gh4h5] } *`,
    ),
    chapter(
      "Branche D : 2...Nf6 3.d4 Nxd5, la Scandinave moderne",
      `{ [%txt "LA SCANDINAVE MODERNE : 2...Nf6.

Les Noirs reprennent avec le cavalier. On garde le pion d4, on joue Nf3, Be2 et O-O, puis c4 chasse le cavalier d5. Contre le fianchetto ...g6 et ...Bg7, le pion d5 avancé coupe le jeu noir en deux."] [%eval 0.36] }
1. e4 { [%txt "Le centre."] [%eval 0.40] [%csl Ge4] }
1... d5 { [%txt "La Scandinave."] [%eval 0.68] }
2. exd5 { [%txt "Prise."] [%eval 0.67] }
2... Nf6 { [%txt "Le cavalier reprendra en d5."] [%eval 0.61] }
3. d4 { [%txt "Le centre."] [%eval 0.73] [%csl Gd4] }
3... Nxd5 { [%txt "Le cavalier reprend. (3...Bg4 : chapitre 7.)"] [%eval 0.66] }
4. Nf3 { [%txt "Développement."] [%eval 0.59] }
4... g6 { [%txt "Le fianchetto."] [%eval 0.88] }
5. Be2 { [%txt "Le fou se développe."] [%eval 0.84] }
5... Bg7 { [%txt "Le fou vise d4."] [%eval 0.84] }
(5... Bg4 { [%txt "Le fou sort avant le fianchetto : l'évaluation passe de +0.84 à +1.41."] [%hint "les Noirs sortent le fou c8 avant de mettre leur cavalier d5 à l'abri."] [%hint "le cavalier d5. Notre pion c le chasse avec gain de temps."] [%hint "6.c4 Nb6 7.c5 : le cavalier est chassé deux fois."] [%hintcsl Rd5,Gc4] [%eval 1.41] }
  6. c4 { [%txt "Le pion chasse le cavalier."] [%eval 1.55] [%cal Gc4d5] }
  6... Nb6 { [%txt "Le cavalier recule."] [%eval 1.66] }
  7. c5 { [%txt "À RETENIR.

PRO TIP : +1.57. Le cavalier b6 est chassé encore : nos pions gagnent l'espace avec gain de temps."] [%eval 1.57] [%cal Gc5b6] })
6. O-O { [%txt "On roque."] [%eval 0.68] }
6... O-O { [%txt "Les Noirs roquent."] [%eval 0.84] }
7. c4 { [%txt "Le pion chasse le cavalier."] [%eval 0.76] [%cal Gc4d5] }
7... Nb6 { [%txt "Le cavalier recule."] [%eval 0.66] }
8. Nc3 { [%txt "Développement."] [%eval 0.71] }
8... Nc6 { [%txt "Le cavalier attaque d4."] [%eval 1.03] }
(8... Re8 { [%txt "Un coup de tour lent : l'évaluation passe de +0.71 à +1.49."] [%hint "les Noirs jouent un coup de tour sans menace."] [%hint "la case g4. Notre pion h3 l'interdit au fou c8, puis Be3 complète le développement."] [%hint "9.h3 : on prive le fou c8 de g4."] [%hintcsl Gh3,Rg4] [%eval 1.49] }
  9. h3 { [%txt "À RETENIR.

PRO TIP : +1.34. Le fou c8 n'a plus de bonne case, et notre centre reste solide. Contre un coup lent, enlève une case à la pièce adverse."] [%eval 1.34] [%csl Rg4] })
9. d5 { [%txt "Le pion avance et chasse le cavalier c6."] [%eval 1.03] [%cal Gd5c6] }
9... Ne5 { [%txt "Le cavalier va au centre."] [%eval 1.25] }
(9... Bxc3 { [%txt "Les Noirs échangent leur fou du fianchetto : l'évaluation passe de +1.03 à +4.13."] [%hint "les Noirs donnent le fou g7, le gardien de leur roque."] [%hint "le pion b2. Il reprend en c3, et les cases noires autour du roi g8 sont vides."] [%hint "10.bxc3 : on reprend, puis Bh6."] [%hintcsl Gc3,Rg7] [%eval 4.13] }
  10. bxc3 { [%txt "À RETENIR.

PRO TIP : +4.11. Le cavalier c6 est attaqué et les cases g7 et h6 sont sans gardien. Ne laisse jamais filer le fou du fianchetto adverse sans en profiter."] [%eval 4.11] [%cal Gc1h6] })
10. Nxe5 { [%txt "On échange."] [%eval 1.07] }
(10. Bf4 { [%txt "LA VARIANTE PIÉGÉE : le fou attaque le cavalier e5…"] [%eval -0.28] [%csl Rc4] }
  10... Nexc4 { [%txt "…mais le cavalier prend c4 : le pion n'était défendu que par le fou e2. À RETENIR.

PRO TIP : -0.32. Avant d'attaquer une pièce, vérifie ce qu'elle peut prendre."] [%eval -0.32] })
10... Bxe5 { [%txt "Les Noirs reprennent.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+1.10).
1. Bh6 : on échange ou on chasse la tour f8.
2. Qd2 et Rad1 : on soutient le pion d5.
3. c5 : le cavalier b6 n'a plus de case."] [%eval 1.10] [%cal Gc1h6] } *`,
    ),
    chapter(
      "Branche E : le gambit portugais 3...Bg4",
      `{ [%txt "LE GAMBIT PORTUGAIS : 2...Nf6 3.d4 Bg4.

Les Noirs donnent le pion d5 pour se développer vite. On accepte : 4.f3 chasse le fou, 5.g4 le chasse encore, puis c4 garde le pion de plus. Notre roi reste un peu exposé, mais nos pions gagnent l'espace avec gain de temps."] [%eval 0.36] }
1. e4 { [%txt "Le centre."] [%eval 0.40] [%csl Ge4] }
1... d5 { [%txt "La Scandinave."] [%eval 0.68] }
2. exd5 { [%txt "Prise."] [%eval 0.67] }
2... Nf6 { [%txt "Le cavalier."] [%eval 0.61] }
3. d4 { [%txt "Le centre."] [%eval 0.73] }
3... Bg4 { [%txt "LE GAMBIT : le fou sort, le pion d5 est laissé."] [%eval 0.87] }
4. f3 { [%txt "Le pion chasse le fou."] [%eval 0.76] [%cal Gf3g4] }
4... Bf5 { [%txt "Le fou recule."] [%eval 1.28] }
5. g4 { [%txt "Encore un temps sur le fou."] [%eval 1.23] [%cal Gg4f5] }
5... Bg6 { [%txt "Le fou recule."] [%eval 1.17] }
6. c4 { [%txt "Le pion protège d5."] [%eval 1.31] [%cal Gc4d5] }
6... e6 { [%txt "Les Noirs attaquent d5 encore."] [%eval 1.43] }
(6... h6 { [%txt "UNE IMPRÉCISION : un coup de pion lent dans un gambit, où chaque temps compte. L'évaluation passe de +1.31 à +1.74."] [%eval 1.74] }
  7. Nc3 { [%txt "À RETENIR.

PRO TIP : +1.68. Un pion de plus et le développement en marche. Dans un gambit, l'adversaire n'a pas le temps de jouer des coups de pion."] [%eval 1.68] [%cal Gc3d5] })
7. Nc3 { [%txt "Le cavalier défend d5."] [%eval 1.44] }
7... exd5 { [%txt "Les Noirs prennent."] [%eval 1.48] }
8. g5 { [%txt "Le pion chasse le cavalier f6."] [%eval 1.47] [%cal Gg5f6] }
8... Nh5 { [%txt "Le cavalier va au bord."] [%eval 1.62] }
(8... Nc6 { [%txt "Les Noirs laissent le cavalier f6 en prise : l'évaluation passe de +1.47 à +2.69."] [%hint "les Noirs développent l'autre cavalier et oublient que f6 est attaqué."] [%hint "le cavalier f6. Notre pion g5 le prend."] [%hint "9.gxf6 : on gagne une pièce."] [%hintcsl Rf6] [%eval 2.69] }
  9. gxf6 { [%txt "À RETENIR.

PRO TIP : +3.13. Une pièce pour deux pions. Quand un pion attaque une pièce, elle doit bouger avant tout."] [%eval 3.13] [%csl Gf6] })
9. f4 { [%txt "Le pion enferme le cavalier h5."] [%eval 1.62] [%cal Gf4f5] }
(9. cxd5 { [%txt "LA VARIANTE PIÉGÉE : on reprend le pion…  À RETENIR.

PRO TIP : +0.18. Le cavalier h5 retrouve des cases et notre avantage disparaît. f4 l'enfermait d'abord."] [%eval 0.18] [%csl Rh5] })
9... Nc6 { [%txt "Le cavalier attaque d4."] [%eval 1.76] }
(9... Be7 { [%txt "Le fou se développe, mais le centre noir cède : l'évaluation passe de +1.62 à +3.60."] [%hint "les Noirs développent le fou au lieu de défendre d5 ou d'attaquer d4."] [%hint "le pion d5. Notre pion c4 le prend."] [%hint "10.cxd5 : on reprend le pion."] [%hintcsl Rd5] [%eval 3.60] }
  10. cxd5 { [%txt "À RETENIR.

PRO TIP : +3.32. Deux pions centraux et le cavalier h5 enfermé."] [%eval 3.32] [%csl Gd5] })
10. cxd5 { [%txt "On prend.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+1.91).
1. dxc6 ou Be3 : on garde le pion de plus.
2. Bg2 ou Be2 : on chasse le cavalier h5.
3. Le roi blanc reste au centre : on échange les dames dès que possible."] [%eval 1.91] [%cal Gc4d5] } *`,
    ),
    chapter(
      "Anti-panique : 3...Qe5+, 3...Qe6+ et 3...Qa5 4.d4 e5",
      `{ [%txt "ANTI-PANIQUE : LES ÉCHECS DE LA DAME.

Après 3.Nc3, certains joueurs donnent échec avec la dame (3...Qe5+ ou 3...Qe6+) ou frappent d4 tout de suite (3...Qa5 4.d4 e5). Contre l'échec, on s'interpose avec le fou e2, en se développant. Contre ...e5, on ne prend pas tout de suite : Nf3 et le développement suffisent."] [%eval 0.36] }
1. e4 { [%txt "Le centre."] [%eval 0.40] [%csl Ge4] }
1... d5 { [%txt "La Scandinave."] [%eval 0.68] }
2. exd5 { [%txt "Prise."] [%eval 0.67] }
2... Qxd5 { [%txt "Reprise."] [%eval 0.70] }
3. Nc3 { [%txt "Gain de temps."] [%eval 0.72] }
3... Qe5+ { [%txt "L'échec."] [%eval 1.05] }
(3... Qe6+ { [%txt "UNE IMPRÉCISION : l'autre échec. L'évaluation passe de +0.72 à +1.10."] [%eval 1.10] }
  4. Be2 { [%txt "À RETENIR.

PRO TIP : +1.20. On s'interpose en développant, et la dame e6 bloque le pion e7 et le fou f8."] [%eval 1.20] [%csl Ge2] })
(3... Qa5 { [%txt "La dame en a5."] [%eval 0.72] }
  4. d4 { [%txt "Le centre."] [%eval 0.65] }
  4... e5 { [%txt "Les Noirs frappent d4 tout de suite : l'évaluation passe de +0.65 à +1.25."] [%hint "les Noirs ouvrent le centre alors que leur dame est déjà sortie."] [%hint "le développement. Notre cavalier f3 attaque e5 et prépare le roque."] [%hint "5.Nf3 : on se développe en attaquant e5."] [%hintcsl Gf3,Re5] [%eval 1.25] }
  5. Nf3 { [%txt "À RETENIR.

PRO TIP : +1.21. Le centre ouvert profite au camp le mieux développé : nous. Contre ...e5 prématuré, développe-toi en attaquant e5."] [%eval 1.21] [%cal Gf3e5] })
4. Be2 { [%txt "On s'interpose en développant le fou."] [%eval 1.05] }
(4. Ne4 { [%txt "LA VARIANTE PIÉGÉE : le cavalier s'interpose…"] [%eval -7.47] [%csl Re4] }
  4... Qxe4+ { [%txt "…mais la dame le prend avec échec. À RETENIR.

PRO TIP : -7.21. Contre un échec, interpose une pièce défendue : le cavalier e4 ne l'était pas."] [%eval -7.21] })
4... Bg4 { [%txt "Le fou attaque e2."] [%eval 1.09] }
5. d4 { [%txt "Le pion attaque la dame."] [%eval 1.09] [%cal Gd4e5] }
5... Bxe2 { [%txt "Les Noirs échangent d'abord."] [%eval 1.00] }
(5... Qe6 { [%txt "La dame recule en bloquant son pion e7 : l'évaluation passe de +1.09 à +2.64."] [%hint "la dame recule sur une case qui bloque le développement noir et laisse le fou g4 seul."] [%hint "le fou g4. Notre pion f3 l'attaque, et la dame e6 le défend mal."] [%hint "6.f3 : on chasse le fou."] [%hintcsl Rg4,Gf3] [%eval 2.64] }
  6. f3 { [%txt "À RETENIR.

PRO TIP : +2.46. Le fou g4 est chassé, g4 et f4 suivront. Contre une dame qui bloque son camp, gagne du temps sur les autres pièces."] [%eval 2.46] [%cal Gf3g4] })
6. Ngxe2 { [%txt "Le cavalier reprend."] [%eval 1.04] }
(6. dxe5 { [%txt "LA VARIANTE PIÉGÉE : on prend la dame…"] [%eval 0.02] [%csl Rd1] }
  6... Bxd1 { [%txt "…mais le fou prend la nôtre. À RETENIR.

PRO TIP : 0.00. Avant de prendre une pièce, regarde ce que l'adversaire prend en échange."] [%eval 0.00] })
6... Qa5 { [%txt "La dame recule."] [%eval 1.02] }
7. O-O { [%txt "On roque."] [%eval 0.93] }
7... Nf6 { [%txt "Développement.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.98).
1. Nf4 et d5 : on gagne l'espace avec gain de temps.
2. Bd2 puis Ne4 : on échange le cavalier f6.
3. Avance de développement : les Noirs ont joué trois coups de dame."] [%eval 0.98] [%cal Ge2f4] } *`,
    ),
  ],
};
