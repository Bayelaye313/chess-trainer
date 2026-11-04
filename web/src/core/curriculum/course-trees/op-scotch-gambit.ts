import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours d'ouverture « Gambit Écossais (avec les Blancs) » : 1.e4 e5 2.Nf3
 * Nc6 3.d4 exd4 4.Bc4 — onglet Ouvertures, format « un commentaire par
 * coup » de l'Académie, lu par `CourseTreeViewer` (route
 * `/ouvertures/scotch-gambit/cours`). Public visé : 1500-1800 Elo.
 *
 * ## Contenu (2026-10-11, v2 2026-11-04)
 *
 * 1. Fiche d'identité et 4...Nf6 (Deux Cavaliers) 5.e5 d5 6.Bb5, avec
 *    5...Ng4, 5...Ne4 6.Qe2 et les pièges 6...f5? / 6...d5? (exf6 / exd6 en
 *    passant, cavalier e4 cloué).
 * 2. 4...Bc5 : 5.c3 (5...dxc3? 6.Bxf7+!) et l'Attaque Max Lange après
 *    5.O-O Nf6 6.e5 (6...Ne4? 7.Re1) jusqu'à 9.Ng5. 5.O-O seul est réfuté
 *    par 5...d6.
 * 3. 4...Bb4+ 5.c3 : 5...Bc5? 6.cxd4 et 6...Bc5? 7.Bxf7+! Qd5+.
 * 4. 4...d6, la réponse passive.
 * 5. 4...f6?, la faute qui affaiblit le roi (et 6...c6 7.Nc3 b5 8.Bb3 h5?
 *    9.Nxb5!).
 * 6. 4...Qf6 et 4...Qe7, la dame sortie trop tôt.
 * 7. Aléatoire surprise 1 : après 4...Bc5 5.c3, trois coups noirs mous
 *    (12...Qb8, 14...Kh8, 18...Qc8) : la case e5 et la paire de fous.
 * 8. Aléatoire surprise 2 : après 4...d6, deux coups noirs mous (15...Rc8,
 *    17...Ne6) punis par e5 et g4.
 *
 * Indices progressifs : chaque faute noire qui perd au moins 0.5 porte
 * trois balises `[%hint]` (1. principe violé, 2. faiblesse, 3. action de
 * punition) et une balise `[%hintcsl]` (cases allumées à partir du 2e
 * indice) — voir `ChessMoveNode.hints` et le bouton « Indice » de
 * `CourseTreeViewer` ; en dessous de 0.5, c'est une imprécision, sans
 * indices. Chaque chapitre théorique finit par « À RETENIR. PRO TIP : la
 * feuille de route après la théorie », chaque variante par un « À RETENIR.
 * PRO TIP ».
 *
 * Sources : aucun livre de `docs/` ne traite 4.Bc4 (Emms, « Starting Out:
 * The Scotch Game », et Lane, « The Scotch Game Explained », couvrent
 * 4.Nxd4 ; « Winning with the Scotch » est un scan sans couche texte ; pas
 * de Pavlovic sur le disque). Les lignes suivent la théorie établie du
 * Gambit Écossais et sont TOUTES arbitrées par Stockfish 19 natif
 * (profondeur 16) ; tout chiffre cité est l'évaluation d'un nœud. Toute la
 * prose est originale.
 *
 * ## Architecture technique des nœuds
 *
 * Voir `op-scotch-game.ts` : `evaluationScore` / `evaluationMate` (balise
 * `[%eval]`), `showEvalBar`, `freeze` (balise `[%txt "…"]` sur CHAQUE
 * commentaire), plus `hints` / `hintHighlights`.
 *
 * Fichier GÉNÉRÉ : ne pas l'éditer à la main. Source commentée :
 * `scripts/opening-course-src/scotch-gambit.pgn` (et l'en-tête
 * `scotch-gambit.header.txt`) ; regénérer avec
 * `node --import tsx scripts/_tmp-build-opening-course.mts <source> <en-tête> <sortie> 16 [pgn compilé]`.
 * Règles de l'utilisateur : SAN en texte brut uniquement (jamais de figurine
 * Unicode), pas de guillemet droit dans un `[%txt]` ni un `[%hint]`.
 */

function chapter(title: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, START) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const OP_SCOTCH_GAMBIT: CourseTree = {
  chapters: [
    chapter(
      "Fiche d'identité et 4...Nf6",
      `{ [%txt "LE GAMBIT ÉCOSSAIS : 1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4.

Le vrai enjeu : au lieu de reprendre d4 tout de suite, on développe le fou vers f7, le point faible du camp noir, et on garde la reprise du pion pour plus tard. Le pion d4 noir gêne peu : il bloque même les pièces noires.

Le déséquilibre recherché : une avance de développement et l'initiative contre un roi noir encore au centre, en échange d'un pion, souvent récupéré.

Les réponses noires de club (un chapitre chacune) : 4...Nf6 (Deux Cavaliers, ce chapitre ; ce n'est pas une Berlinoise, qui naît de 3.Bb5), 4...Bc5 (classique, avec la Max Lange), 4...Bb4+, 4...d6, 4...f6? et les sorties de dame 4...Qf6 et 4...Qe7. Puis deux chapitres « Aléatoire surprise » : la théorie finie, les Noirs jouent des coups mous et l'on cherche la punition.

Les indices : sur chaque faute noire qui perd au moins 0.5, le bouton Indice dévoile le principe violé, puis la faiblesse (cases allumées), puis l'action de punition."] [%eval 0.30] }
1. e4 { [%txt "Le pion occupe le centre."] [%eval 0.34] [%csl Ge4] }
1... e5 { [%txt "Symétrie."] [%eval 0.37] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.26] [%cal Gf3e5] }
2... Nc6 { [%txt "Défense."] [%eval 0.15] }
3. d4 { [%txt "On ouvre le centre."] [%eval -0.02] [%cal Gd4e5] }
3... exd4 { [%txt "Les Noirs prennent."] [%eval 0.04] }
4. Bc4 { [%txt "Le Gambit Écossais : le fou vise f7 avant de reprendre d4."] [%eval -0.10] [%csl Rf7] [%cal Gc4f7] }
4... Nf6 { [%txt "Le meilleur : les Noirs attaquent e4 en se développant."] [%eval -0.04] }
5. e5 { [%txt "On chasse le cavalier avec gain de temps : la pointe de l'attaque moderne."] [%eval -0.04] [%cal Ge5f6] }
5... d5 { [%txt "Le contre central : les Noirs attaquent le fou c4."] [%eval -0.05] }
(5... Ng4 { [%txt "Le cavalier part vers g4."] [%eval 0.14] }
  6. O-O { [%txt "On roque d'abord : la tour f1 ira en e1."] [%eval 0.17] [%cal Gf1e1] }
  6... Be7 { [%txt "Développement."] [%eval 0.18] }
  7. Re1 { [%txt "La tour soutient e5 et vise le roi e8."] [%eval 0.19] [%cal Ge1e8] }
  7... d6 { [%txt "Les Noirs attaquent e5."] [%eval 0.19] }
  8. exd6 { [%txt "On ouvre la colonne e."] [%eval 0.15] [%cal Ge1e7] }
  8... cxd6 { [%txt "Reprise."] [%eval 0.21] }
  9. Nxd4 { [%txt "On récupère le pion : développement fluide, aucun risque."] [%eval 0.08] [%csl Gd4] }
  9... O-O { [%txt "Roque."] [%eval 0.18] }
  10. h3 { [%txt "On chasse le cavalier g4."] [%eval 0.22] [%cal Gh3g4] }
  10... d5 { [%txt "Le pion attaque le fou."] [%eval 0.14] }
  11. Bf1 { [%txt "À RETENIR.

PRO TIP : -0.07. Le fou recule en sécurité : position équilibrée, sans risque. Contre 5...Ng4, roque, Re1 et Nxd4 : le développement d'abord."] [%eval -0.07] [%cal Gf1b5] })
(5... Ne4 { [%txt "Le cavalier saute au centre."] [%eval 0.05] }
  6. Qe2 { [%txt "La dame attaque le cavalier sur la colonne e et prépare le clouage."] [%eval 0.05] [%cal Ge2e4] }
  6... Nc5 { [%txt "Le bon repli."] [%eval 0.12] }
  (6... f5 { [%txt "Les Noirs défendent le cavalier avec un pion."] [%hint "Les Noirs avancent un pion de l'aile roi au lieu de se développer, avec le roi encore au centre."] [%hint "La colonne e : cavalier e4 et roi e8, et notre dame e2 derrière le pion e5."] [%hint "exf6 en passant : la colonne e s'ouvre et le cavalier e4 se retrouve cloué."] [%hintcsl Re4,Re8] [%eval 1.59] [%csl Re4,Re8] }
    7. exf6 { [%txt "Prise en passant : la colonne e s'ouvre, le cavalier e4 est cloué devant le roi e8."] [%eval 1.64] [%csl Re4] [%cal Ge2e8] }
    7... d5 { [%txt "Les Noirs soutiennent le cavalier."] [%eval 1.66] }
    8. O-O { [%txt "On roque ; la tour arrive en e1."] [%eval 1.59] [%cal Gf1e1] }
    8... Bf5 { [%txt "Le fou protège e4."] [%eval 1.67] }
    9. Nbd2 { [%txt "Troisième attaquant sur e4."] [%eval 1.64] [%cal Gd2e4] }
    9... gxf6 { [%txt "Les Noirs reprennent."] [%eval 1.79] }
    10. Bb5 { [%txt "On attaque le défenseur c6 du pion d4."] [%eval 1.97] [%cal Gb5c6] }
    10... Qd7 { [%txt "La dame défend."] [%eval 1.74] }
    11. Nxd4 { [%txt "À RETENIR.

PRO TIP : +1.81. On récupère le pion avec une position nettement supérieure : roi noir bloqué au centre, structure brisée. Contre ...f5, la prise en passant ouvre la colonne e vers le roi."] [%eval 1.81] [%csl Gd4] })
  (6... d5 { [%txt "Les Noirs défendent le cavalier avec le pion d."] [%hint "Les Noirs soutiennent un cavalier mal placé au lieu de le replier, roi toujours en e8."] [%hint "Le pion d5 arrive à côté de notre pion e5 : il peut être pris en passant, et la colonne e s'ouvrira."] [%hint "exd6 en passant : le cavalier e4 est cloué par la dame e2 devant le roi."] [%hintcsl Rd6,Re8] [%eval 2.51] [%csl Re4] }
    7. exd6 { [%txt "Prise en passant : le cavalier e4 se retrouve cloué."] [%eval 2.58] [%csl Re4] [%cal Ge2e8] }
    7... f5 { [%txt "Le seul soutien."] [%eval 2.54] }
    8. dxc7 { [%txt "On prend un deuxième pion."] [%eval 2.75] }
    8... Qxc7 { [%txt "Reprise."] [%eval 2.79] }
    9. Nbd2 { [%txt "On attaque encore e4."] [%eval 2.72] [%cal Gd2e4] }
    9... Bd7 { [%txt "Les Noirs veulent roquer."] [%eval 2.70] }
    10. Nxe4 { [%txt "On élimine le cavalier."] [%eval 2.86] }
    10... fxe4 { [%txt "Reprise."] [%eval 2.64] }
    11. Qxe4+ { [%txt "À RETENIR.

PRO TIP : +2.75. La dame reprend avec échec : un pion de plus et un roi noir exposé. Un cavalier noir en e4 soutenu par un pion se punit par la prise en passant et le clouage."] [%eval 2.75] [%cal Ge4e8] })
  7. c3 { [%txt "On rouvre le jeu au lieu de reprendre d4 : la colonne c et la diagonale c4-f7 restent à nous."] [%eval 0.13] [%cal Gc3d4] }
  7... d3 { [%txt "Les Noirs rendent le pion."] [%eval 0.08] }
  8. Qe3 { [%txt "La dame évite le pion et reste centrale."] [%eval 0.08] }
  8... Be7 { [%txt "Développement."] [%eval 0.09] }
  9. b4 { [%txt "On chasse le cavalier c5 avec gain de temps."] [%eval 0.10] [%cal Gb4c5] }
  9... Ne6 { [%txt "Le cavalier recule."] [%eval 0.11] }
  10. O-O { [%txt "À RETENIR.

PRO TIP : +0.08. Roque : on regagnera d3 tranquillement. Contre 6...Nc5, c3 rouvre le jeu au lieu de courir après le pion d4."] [%eval 0.08] [%csl Gd3] })
6. Bb5 { [%txt "Le fou cloue le cavalier c6, défenseur du pion d4."] [%eval 0.00] [%cal Gb5c6] }
6... Ne4 { [%txt "Le cavalier saute au centre."] [%eval 0.17] }
7. Nxd4 { [%txt "On récupère le pion."] [%eval 0.02] [%csl Gd4] }
7... Bd7 { [%txt "Les Noirs défont le clouage."] [%eval 0.10] }
8. Bxc6 { [%txt "On échange pour abîmer la structure noire."] [%eval 0.10] [%cal Gb5c6] }
8... bxc6 { [%txt "Reprise : pions c doublés."] [%eval 0.15] }
9. O-O { [%txt "Roque."] [%eval 0.08] }
9... Bc5 { [%txt "Le fou attaque le cavalier d4."] [%eval 0.16] }
10. f3 { [%txt "On chasse le cavalier e4 : le pion f soutiendra ensuite f4-f5."] [%eval 0.11] [%cal Gf3e4] }
10... Ng5 { [%txt "Le cavalier recule."] [%eval 0.02] }
11. Be3 { [%txt "Développement avec protection de d4."] [%eval 0.08] [%csl Gd4] }
11... Ne6 { [%txt "Le cavalier attaque d4."] [%eval 0.11] }
12. f4 { [%txt "L'aile roi avance : f4-f5 menace de chasser le cavalier e6."] [%eval 0.07] [%cal Gf4f5] }
12... Qe7 { [%txt "Les Noirs relient leurs pièces."] [%eval 0.10] }
13. Nc3 { [%txt "Développement : position équilibrée où les Blancs jouent pour f4-f5. Dans le 4...Nf6, ne te précipite pas sur d4 : développe, cloue, et reprends le pion quand il ne peut plus fuir.

À RETENIR.

PRO TIP : la feuille de route après la théorie (0.00).
1. Qd2 puis Rae1 : la dame et les tours se placent derrière le pion e5.
2. f5 : le pion chasse le cavalier e6 ; si les Noirs jouent ...f5 d'abord, exf6 en passant ouvre la colonne e.
3. Na4 : le cavalier échange le fou b6, le meilleur défenseur noir."] [%eval 0.00] [%cal Gf4f5] } *`,
    ),
    chapter(
      "4...Bc5, la ligne classique (5.c3) et la Max Lange",
      `{ [%txt "4...Bc5 : LE FOU DÉFEND d4.

Notre choix : 5.c3. Le coup le plus populaire en club, 5.O-O, permet 5...d6! qui égalise facilement (voir la branche) ; 5.c3 attaque d4 une deuxième fois et garde l'initiative. Si les Noirs jouent 5.O-O Nf6, on arrive dans la célèbre Attaque Max Lange (6.e5 d5 7.exf6), traitée en variante."] [%eval 0.30] }
1. e4 { [%txt "Le centre."] [%eval 0.34] }
1... e5 { [%txt "Symétrie."] [%eval 0.37] }
2. Nf3 { [%txt "Attaque de e5."] [%eval 0.26] [%cal Gf3e5] }
2... Nc6 { [%txt "Défense."] [%eval 0.15] }
3. d4 { [%txt "On ouvre le centre."] [%eval -0.02] [%cal Gd4e5] }
3... exd4 { [%txt "Prise."] [%eval 0.04] }
4. Bc4 { [%txt "Le fou vise f7."] [%eval -0.10] [%cal Gc4f7] }
4... Bc5 { [%txt "Le fou défend d4."] [%eval 0.05] }
5. c3 { [%txt "On attaque d4 une deuxième fois : si les Noirs gardent le pion, notre centre se reconstruit."] [%eval 0.11] [%cal Gc3d4] }
(5. O-O { [%txt "Le coup le plus joué en club."] [%eval -0.35] }
  5... Nf6 { [%txt "La Max Lange. Mieux pour les Noirs était 5...d6 ! qui protège tout et égalise : c'est pourquoi on préfère 5.c3. Après 5...Nf6, l'évaluation passe de -0.35 à +0.16."] [%hint "Les Noirs se développent naturellement, mais laissent la poussée e5 avec gain de temps : 5...d6 tenait le centre."] [%hint "La case e5 : notre pion y avance et chasse le cavalier f6, avec la tour f1 prête pour la colonne e."] [%hint "6.e5 : l'Attaque Max Lange, on chasse le cavalier."] [%hintcsl Ge5,Rf6] [%eval 0.16] }
  (5... d6 { [%txt "Le coup solide."] [%eval -0.37] }
    6. c3 { [%txt "On attaque d4."] [%eval -0.42] }
    6... Bg4 { [%txt "À RETENIR.

PRO TIP : -0.29. Le fou cloue le cavalier f3 : les Noirs sont très bien. Contre 4...Bc5, 5.c3 d'abord."] [%eval -0.29] [%cal Gg4f3] })
  6. e5 { [%txt "L'Attaque Max Lange : on chasse le cavalier."] [%eval 0.20] [%cal Ge5f6] }
  6... d5 { [%txt "Le contre central."] [%eval 0.24] }
  (6... Ne4 { [%txt "Le cavalier saute au centre, sans soutien de pion."] [%hint "Le cavalier noir saute en e4 sans aucun soutien de pion, et le roi noir est encore au centre en e8."] [%hint "La colonne e : le cavalier e4 et le roi e8 sont alignés, rien ne les sépare."] [%hint "Re1 : la tour attaque et cloue le cavalier sur la colonne e."] [%hintcsl Re4,Re8] [%eval 4.64] [%csl Re4] }
    7. Re1 { [%txt "La tour attaque le cavalier cloué."] [%eval 4.32] [%cal Ge1e8] }
    7... Nxf2 { [%txt "Le seul essai : le cavalier se jette sur f2."] [%eval 4.46] }
    8. Kxf2 { [%txt "On prend : une pièce de plus."] [%eval 4.48] [%csl Gf2] }
    8... h6 { [%txt "Les Noirs veulent roquer."] [%eval 4.56] }
    9. Nbd2 { [%txt "Développement."] [%eval 4.60] }
    9... O-O { [%txt "Roque."] [%eval 4.39] }
    10. Ne4 { [%txt "Le cavalier attaque le fou c5."] [%eval 4.26] [%cal Ge4c5] }
    10... d5 { [%txt "Les Noirs cherchent du jeu."] [%eval 3.88] }
    11. exd6 { [%txt "Prise en passant."] [%eval 4.06] }
    11... Bb6 { [%txt "Le fou recule."] [%eval 4.06] }
    12. Kg1 { [%txt "À RETENIR.

PRO TIP : +4.02. Le roi se met à l'abri : une pièce de plus. Un cavalier noir en e4 sans soutien de pion se punit par Re1 et le clouage sur la colonne e."] [%eval 4.02] })
  7. exf6 { [%txt "On prend le cavalier."] [%eval 0.46] [%cal Ge5f6] }
  7... dxc4 { [%txt "Les Noirs prennent le fou."] [%eval 0.47] }
  8. Re1+ { [%txt "L'échec sur la colonne e ouverte."] [%eval 0.20] [%cal Ge1e8] }
  8... Be6 { [%txt "Interposition."] [%eval 0.35] }
  9. Ng5 { [%txt "Le cavalier attaque e6. À RETENIR.

PRO TIP : 0.00. Position dynamique : si 9...Qd5, 10.Nc3 chasse la dame avec gain de temps, puis Nce4, Nxe6 et g4 ; le pion f6 devient une arme contre g7."] [%eval 0.00] [%cal Gg5e6] })
5... Nf6 { [%txt "Le développement naturel : on contre-attaque e4."] [%eval 0.02] }
(5... dxc3 { [%txt "Les Noirs prennent un deuxième pion au lieu de se développer."] [%hint "Les Noirs mangent un deuxième pion au lieu de développer une pièce : leur roi est toujours en e8."] [%hint "Le pion f7 n'est protégé que par le roi, et le fou c5 n'est protégé par rien."] [%hint "Bxf7+ ! puis échecs de dame en d5 et h5 : la dame finira par ramasser le fou c5."] [%hintcsl Rf7,Rc5] [%eval 0.85] [%csl Rf7] }
  6. Bxf7+ { [%txt "Le sacrifice : le roi doit prendre et se montrer."] [%eval 0.96] [%cal Gc4f7] }
  6... Kxf7 { [%txt "Forcé."] [%eval 0.99] }
  7. Qd5+ { [%txt "Échec, et la dame vise le fou c5."] [%eval 0.95] [%cal Gd5c5] }
  7... Ke8 { [%txt "Le roi revient."] [%eval 1.08] }
  8. Qh5+ { [%txt "Encore échec : le roi ne peut plus roquer."] [%eval 0.98] [%cal Gh5e8] }
  8... Kf8 { [%txt "Le roi s'enfuit."] [%eval 0.92] }
  9. Qxc5+ { [%txt "On ramasse le fou avec échec."] [%eval 0.93] [%csl Gc5] }
  9... d6 { [%txt "Interposition."] [%eval 1.22] }
  10. Qc4 { [%txt "À RETENIR.

PRO TIP : +0.99. La dame recule et vise c3 : les Noirs ont perdu le droit de roquer. Contre ...dxc3, Bxf7+ et les échecs de dame ramassent le fou c5."] [%eval 0.99] [%cal Gc4c3] })
6. e5 { [%txt "On chasse le cavalier."] [%eval 0.04] [%cal Ge5f6] }
6... d5 { [%txt "Le contre central."] [%eval 0.14] }
7. Be2 { [%txt "Le fou recule : le moteur préfère e2 à b5, pour garder la paire de fous."] [%eval 0.08] }
7... Ne4 { [%txt "Le cavalier se centralise."] [%eval 0.00] }
8. cxd4 { [%txt "On récupère le pion : le centre d4-e5 est reconstruit."] [%eval 0.00] [%csl Gd4,Ge5] }
8... Bb6 { [%txt "Le fou recule."] [%eval 0.07] }
9. Nc3 { [%txt "On attaque le cavalier e4."] [%eval 0.07] [%cal Gc3e4] }
9... O-O { [%txt "Roque."] [%eval 0.10] }
10. O-O { [%txt "Roque."] [%eval 0.15] }
10... Be6 { [%txt "Développement."] [%eval 0.15] }
11. Be3 { [%txt "On protège d4."] [%eval 0.14] [%csl Gd4] }
11... f6 { [%txt "Les Noirs attaquent la tête e5."] [%eval 0.13] }
12. Na4 { [%txt "Le cavalier vise le fou b6, le meilleur défenseur noir. Position équilibrée avec plus d'espace pour les Blancs. Contre 4...Bc5, c3 d'abord, Max Lange seulement si les Noirs l'autorisent.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.08).
1. Nxb6 : on prend la paire de fous.
2. Qc1 : la dame quitte la colonne d, la tour f1 pourra y venir.
3. Bb5 puis Bd3 : le fou chasse le cavalier c6, puis vise le roi noir."] [%eval 0.08] [%cal Ga4b6] } *`,
    ),
    chapter(
      "4...Bb4+, l'échec réflexe",
      `{ [%txt "4...Bb4+ : L'ÉCHEC RÉFLEXE.

Le coup de club pour échanger des pièces. Il est en réalité jouable : après 5.c3 dxc3 6.bxc3, les Blancs ont un pion de moins mais un développement superbe (-0.14 après 6.bxc3). Le danger pour les Noirs, ce sont les replis imprécis du fou : 5...Bc5? et 6...Bc5? sont punis immédiatement."] [%eval 0.30] }
1. e4 { [%txt "Le centre."] [%eval 0.34] }
1... e5 { [%txt "Symétrie."] [%eval 0.37] }
2. Nf3 { [%txt "Attaque de e5."] [%eval 0.26] [%cal Gf3e5] }
2... Nc6 { [%txt "Défense."] [%eval 0.15] }
3. d4 { [%txt "On ouvre le centre."] [%eval -0.02] [%cal Gd4e5] }
3... exd4 { [%txt "Prise."] [%eval 0.04] }
4. Bc4 { [%txt "Le fou vise f7."] [%eval -0.10] [%cal Gc4f7] }
4... Bb4+ { [%txt "L'échec réflexe."] [%eval 0.01] }
5. c3 { [%txt "On chasse le fou avec gain de temps."] [%eval 0.04] [%cal Gc3b4] }
5... dxc3 { [%txt "Les Noirs prennent."] [%eval -0.03] }
(5... Bc5 { [%txt "Le fou revient en c5 : deux temps perdus."] [%hint "Le fou est allé en b4 puis revient en c5 : les Noirs ont perdu un temps, et le pion d4 n'a plus de soutien solide."] [%hint "Le pion d4, attaqué par notre pion c3."] [%hint "cxd4 : on reconstruit le grand centre d4-e4 en chassant le fou avec gain de temps."] [%hintcsl Rd4] [%eval 2.19] [%csl Rd4] }
  6. cxd4 { [%txt "Le grand centre d4-e4 avec gain de temps."] [%eval 2.23] [%csl Gd4,Ge4] }
  6... Bb6 { [%txt "Le fou recule."] [%eval 2.12] }
  7. d5 { [%txt "On chasse le cavalier."] [%eval 1.94] [%cal Gd5c6] }
  7... Nce7 { [%txt "Le cavalier recule."] [%eval 2.15] }
  8. d6 { [%txt "Le pion s'enfonce et désorganise tout le camp noir."] [%eval 2.19] [%cal Gd6c7] }
  8... cxd6 { [%txt "Les Noirs prennent."] [%eval 2.26] }
  9. Nc3 { [%txt "À RETENIR.

PRO TIP : +2.06. Les Blancs ont une énorme avance de développement, la case d5 et la colonne e sont à eux. Contre 5...Bc5, cxd4 puis d5-d6."] [%eval 2.06] [%csl Gd5] })
6. bxc3 { [%txt "On reprend : les colonnes b et d s'ouvrent."] [%eval -0.14] }
6... Ba5 { [%txt "Le bon repli : le fou garde la diagonale."] [%eval 0.00] }
(6... Bc5 { [%txt "Le fou recule sur une case non protégée."] [%hint "Le fou recule sur une case où rien ne le défend, alors que le roi noir reste au centre."] [%hint "Le pion f7 n'est défendu que par le roi, et le fou c5 est sans protection."] [%hint "Bxf7+ ! puis Qd5+ : la fourchette de dame ramasse le fou c5."] [%hintcsl Rf7,Rc5] [%eval 0.66] [%csl Rc5,Rf7] }
  7. Bxf7+ { [%txt "Le sacrifice qui déloge le roi."] [%eval 0.67] [%cal Gc4f7] }
  7... Kxf7 { [%txt "Forcé."] [%eval 0.72] }
  8. Qd5+ { [%txt "Fourchette : échec au roi et attaque du fou c5."] [%eval 0.70] [%cal Gd5c5,Gd5f7] }
  8... Ke8 { [%txt "Le roi recule."] [%eval 0.65] }
  9. Qxc5 { [%txt "On récupère la pièce."] [%eval 0.89] [%csl Gc5] }
  9... d6 { [%txt "La dame est attaquée."] [%eval 0.71] }
  10. Qh5+ { [%txt "Échec."] [%eval 0.96] [%cal Gh5e8] }
  10... Ke7 { [%txt "Le roi ne peut plus roquer."] [%eval 0.88] }
  11. Qg5+ { [%txt "Encore échec."] [%eval 0.81] }
  11... Kf8 { [%txt "Le roi fuit."] [%eval 0.99] }
  12. Qb5 { [%txt "À RETENIR.

PRO TIP : +0.90. La dame attaque b7 : roi noir privé de roque. Un fou noir non protégé en c5 se punit par Bxf7+ et Qd5+."] [%eval 0.90] [%cal Gb5b7] })
7. O-O { [%txt "Roque : on joue pour le développement, pas pour le pion."] [%eval 0.02] }
7... Bb6 { [%txt "Le fou se replie."] [%eval 0.04] }
8. a4 { [%txt "On gagne de l'espace et on menace a5."] [%eval -0.09] [%cal Ga4a5] }
8... d6 { [%txt "Les Noirs ouvrent le fou c8."] [%eval 0.05] }
9. Nbd2 { [%txt "Le cavalier vise c4."] [%eval 0.07] [%cal Gd2c4] }
9... a6 { [%txt "Les Noirs empêchent a5-a6 et Bb5."] [%eval 0.06] }
10. Ba2 { [%txt "Le fou garde la diagonale a2-g8."] [%eval 0.06] [%cal Ga2f7] }
10... Nf6 { [%txt "Développement."] [%eval 0.00] }
11. Nc4 { [%txt "Le cavalier attaque le fou b6."] [%eval -0.04] [%cal Gc4b6] }
11... O-O { [%txt "Roque."] [%eval 0.00] }
12. Nxb6 { [%txt "On prend la paire de fous : compensation complète pour le pion. Contre 4...Bb4+, c3 puis bxc3 ; guette les replis en c5, toujours punis par Bxf7+.

À RETENIR.

PRO TIP : la feuille de route après la théorie (-0.01).
1. Re1 : la tour sur la colonne e, face au roi noir.
2. Qd3 puis Qg3 : la dame vise g7 et la diagonale du roque.
3. Nxe5 si le cavalier noir s'y installe : on échange et on garde la paire de fous."] [%eval -0.01] [%cal Gc4b6] } *`,
    ),
    chapter(
      "4...d6, la réponse passive",
      `{ [%txt "4...d6 : LA RÉPONSE PASSIVE.

Les Noirs défendent d4 indirectement et enferment leur fou f8. On reprend simplement le pion : on obtient un centre e4 contre d6, plus d'espace et un développement plus libre. Méthode : Nxd4, Nc3, O-O, puis Be3 et les tours au centre."] [%eval 0.30] }
1. e4 { [%txt "Le centre."] [%eval 0.34] }
1... e5 { [%txt "Symétrie."] [%eval 0.37] }
2. Nf3 { [%txt "Attaque de e5."] [%eval 0.26] [%cal Gf3e5] }
2... Nc6 { [%txt "Défense."] [%eval 0.15] }
3. d4 { [%txt "On ouvre le centre."] [%eval -0.02] [%cal Gd4e5] }
3... exd4 { [%txt "Prise."] [%eval 0.04] }
4. Bc4 { [%txt "Le fou vise f7."] [%eval -0.10] [%cal Gc4f7] }
4... d6 { [%txt "Les Noirs s'enferment."] [%hint "Les Noirs jouent un coup de pion qui ne développe rien et enferme leur fou f8 derrière d6."] [%hint "Le pion d4 n'est plus défendu que par le cavalier c6."] [%hint "Nxd4 : on récupère le pion, et le pion e4 contre d6 nous donne l'espace."] [%hintcsl Rd4] [%eval 0.46] [%csl Rf8] }
5. Nxd4 { [%txt "On récupère le pion : centre e4 contre d6."] [%eval 0.46] [%csl Gd4,Ge4] }
5... Nf6 { [%txt "Les Noirs attaquent e4."] [%eval 0.44] }
6. Nc3 { [%txt "On défend e4 en se développant."] [%eval 0.45] [%cal Gc3e4] }
6... Be7 { [%txt "Le fou se développe passivement."] [%eval 0.40] }
7. O-O { [%txt "Roque."] [%eval 0.41] }
7... O-O { [%txt "Roque."] [%eval 0.34] }
8. h3 { [%txt "On retire la case g4 au cavalier et au fou noirs."] [%eval 0.42] [%csl Gg4] }
8... Nxd4 { [%txt "Les Noirs échangent."] [%eval 0.42] }
9. Qxd4 { [%txt "La dame reprend au centre."] [%eval 0.42] [%csl Gd4] }
9... Nd7 { [%txt "Le cavalier cherche c5 ou e5."] [%eval 0.42] }
10. Be3 { [%txt "Développement."] [%eval 0.40] }
10... Bf6 { [%txt "Le fou attaque la dame."] [%eval 0.49] }
11. Qd2 { [%txt "La dame recule."] [%eval 0.50] }
11... Nc5 { [%txt "Le cavalier se place."] [%eval 0.41] }
12. Bd4 { [%txt "On échange le meilleur fou noir."] [%eval 0.38] [%cal Gd4f6] }
12... a5 { [%txt "Les Noirs gagnent de l'espace."] [%eval 0.54] }
13. Rad1 { [%txt "La tour sur la colonne d, face au pion d6 arriéré : avantage durable. Contre un adversaire passif, prends l'espace, échange ses rares pièces actives et vise le pion faible.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.51).
1. Contre ...Be6, Be2 : on garde le fou, qui couvre g4.
2. Qxd4 après l'échange des fous : la dame reste au centre, face à d6.
3. Kh2 et g3 contre une sortie de dame en h4 : le roi d'abord, l'attaque ensuite."] [%eval 0.51] [%csl Rd6] [%cal Gd1d6] } *`,
    ),
    chapter(
      "4...f6?, la faute qui affaiblit le roi",
      `{ [%txt "4...f6? : LA FAUTE DE PANIQUE.

Les Noirs voient le fou c4 et poussent un pion pour se protéger. Résultat : la diagonale a2-g8 et la case e6 sont affaiblies pour toujours, le cavalier g8 perd sa case f6, et le roi noir ne pourra pas roquer de sitôt. La punition est méthodique, pas violente : on reprend d4, on centralise la dame, et on attaque le roi bloqué au centre."] [%eval 0.30] }
1. e4 { [%txt "Le centre."] [%eval 0.34] }
1... e5 { [%txt "Symétrie."] [%eval 0.37] }
2. Nf3 { [%txt "Attaque de e5."] [%eval 0.26] [%cal Gf3e5] }
2... Nc6 { [%txt "Défense."] [%eval 0.15] }
3. d4 { [%txt "On ouvre le centre."] [%eval -0.02] [%cal Gd4e5] }
3... exd4 { [%txt "Prise."] [%eval 0.04] }
4. Bc4 { [%txt "Le fou vise f7."] [%eval -0.10] [%cal Gc4f7] }
4... f6 { [%txt "La faute."] [%hint "Les Noirs jouent un coup de pion de l'aile roi au lieu de se développer : la case f6 du cavalier disparaît et le roi s'affaiblit."] [%hint "La diagonale a2-g8 : notre fou c4 contrôle g8, le roi noir ne pourra plus roquer court."] [%hint "Nxd4 : on récupère le pion, puis la dame vient au centre en d4 et e3 face au roi bloqué."] [%hintcsl Rg8,Re6] [%eval 1.99] [%csl Rf6,Rg8] }
5. Nxd4 { [%txt "On récupère le pion."] [%eval 1.95] [%csl Gd4] }
5... Nxd4 { [%txt "Les Noirs échangent."] [%eval 1.97] }
6. Qxd4 { [%txt "La dame se centralise : elle vise a7 et g7."] [%eval 1.82] [%cal Gd4a7,Gd4g7] }
6... Ne7 { [%txt "Le cavalier ne peut pas aller en f6 : il passe par e7."] [%eval 1.84] }
(6... c6 { [%txt "Les Noirs préparent ...b5 contre le fou."] [%eval 2.20] }
  7. Nc3 { [%txt "Développement."] [%eval 1.97] }
  7... b5 { [%txt "Le fou est attaqué."] [%eval 1.87] }
  8. Bb3 { [%txt "Il recule sur la même diagonale."] [%eval 2.20] [%cal Gb3g8] }
  8... h5 { [%txt "Encore un coup de pion : l'évaluation passe de +2.20 à +3.81."] [%hint "Encore un coup de pion de l'aile roi, avec le roi en e8 et presque aucune pièce développée."] [%hint "Le pion b5 : défendu par le seul pion c6. Si ce pion le reprend, la case d5 s'ouvre à notre dame, contre a8 et g8."] [%hint "9.Nxb5 ! si 9...cxb5, Qd5 attaque a8 et g8."] [%hintcsl Rb5,Gd5] [%eval 3.81] }
  9. Nxb5 { [%txt "Le sacrifice : si 9...cxb5, Qd5 attaque a8 et g8."] [%eval 3.43] [%cal Gd4d5] }
  9... Nh6 { [%txt "Les Noirs refusent le cavalier, mais leur propre cavalier va sur le bord : l'évaluation passe de +3.43 à +4.10."] [%hint "Les Noirs développent enfin le cavalier g8, mais sur le bord, où il ne protège que f7."] [%hint "Le cavalier h6 : notre fou c1 le prend tout de suite, et la reprise ...gxh6 laisserait le roi sans abri."] [%hint "10.Bxh6 : on élimine le défenseur."] [%hintcsl Rh6] [%eval 4.10] }
  10. Bxh6 { [%txt "On élimine le défenseur."] [%eval 4.29] }
  10... Qa5+ { [%txt "Échec."] [%eval 4.25] }
  11. c3 { [%txt "À RETENIR.

PRO TIP : +4.92. On pare : deux pions de plus. Contre les coups de pion en série, prends ce qui est offert et développe."] [%eval 4.92] })
7. Nc3 { [%txt "Développement."] [%eval 2.05] }
7... Nc6 { [%txt "Le cavalier attaque la dame."] [%eval 1.96] }
8. Qe3 { [%txt "La dame recule sur la colonne e, face au roi e8."] [%eval 2.01] [%cal Ge3e8] }
8... b6 { [%txt "Les Noirs préparent ...Ba6."] [%eval 1.75] }
9. Bd2 { [%txt "Développement : on prépare le grand roque."] [%eval 1.72] }
9... Ne5 { [%txt "Le cavalier attaque le fou."] [%eval 1.67] }
10. Bb3 { [%txt "Le fou reste sur la diagonale a2-g8."] [%eval 1.56] [%cal Gb3g8] }
10... Ba6 { [%txt "Le fou noir empêche le petit roque."] [%eval 1.57] }
11. Qg3 { [%txt "La dame vise g7 et la colonne g."] [%eval 1.79] [%cal Gg3g7] }
11... c6 { [%txt "Les Noirs préparent ...d5."] [%eval 1.74] }
12. O-O-O { [%txt "Grand roque : toutes nos pièces sont actives."] [%eval 1.79] [%cal Gd1d7] }
12... Qc7 { [%txt "La dame se développe."] [%eval 1.98] }
13. h4 { [%txt "On lance les pions de l'aile roi : le roi noir n'a plus d'abri. Un coup de pion qui affaiblit le roi se punit par la centralisation, puis par l'ouverture des lignes vers ce roi.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+1.58).
1. Bf4 : le fou attaque le cavalier e5.
2. Kb1 : le roi se met à l'abri avant l'attaque.
3. Rd2 puis f3 : les tours se doublent sur la colonne d, le pion f3 enlève les cases centrales au cavalier."] [%eval 1.58] [%cal Gh4h5] } *`,
    ),
    chapter(
      "4...Qf6 et 4...Qe7, la dame sortie trop tôt",
      `{ [%txt "4...Qf6 ET 4...Qe7 : LA DAME SORT POUR DÉFENDRE d4.

Principe violé : la dame sort avant les pièces mineures. Chacun de nos coups de développement va la chasser avec gain de temps (Nd5, Bg5, e5). Méthode : roquer, rouvrir le centre avec c3, reprendre en d4 avec le pion, puis attaquer la dame."] [%eval 0.30] }
1. e4 { [%txt "Le centre."] [%eval 0.34] }
1... e5 { [%txt "Symétrie."] [%eval 0.37] }
2. Nf3 { [%txt "Attaque de e5."] [%eval 0.26] [%cal Gf3e5] }
2... Nc6 { [%txt "Défense."] [%eval 0.15] }
3. d4 { [%txt "On ouvre le centre."] [%eval -0.02] [%cal Gd4e5] }
3... exd4 { [%txt "Prise."] [%eval 0.04] }
4. Bc4 { [%txt "Le fou vise f7."] [%eval -0.10] [%cal Gc4f7] }
4... Qf6 { [%txt "La dame défend d4."] [%hint "La dame sort avant les pièces mineures : chacun de nos développements va la chasser avec gain de temps."] [%hint "La case f6 : la dame y prend la place du cavalier g8, et elle est exposée à Bg5, Nd5 et e5."] [%hint "O-O puis c3 : on ouvre le centre, et nos pièces arriveront sur la dame avec gain de temps."] [%hintcsl Rf6,Rg8] [%eval 1.02] [%csl Rf6] }
(4... Qe7 { [%txt "La dame défend en e7."] [%hint "La dame sort avant les pièces mineures et bloque son propre fou f8."] [%hint "La case e7 : le fou f8 est enfermé, le roi noir ne peut pas roquer vite."] [%hint "O-O puis Nxd4 et Nc3 : développement maximal, puis on attaque la dame."] [%hintcsl Re7,Rf8] [%eval 1.22] [%csl Re7,Rf8] }
  5. O-O { [%txt "On roque d'abord : le roi noir, lui, restera au centre."] [%eval 1.32] }
  5... d6 { [%txt "Les Noirs libèrent le fou c8."] [%eval 1.45] }
  6. Nxd4 { [%txt "On reprend le pion."] [%eval 1.49] [%csl Gd4] }
  6... Nf6 { [%txt "Développement."] [%eval 1.49] }
  7. Nc3 { [%txt "Développement."] [%eval 1.33] }
  7... Nxd4 { [%txt "Échange."] [%eval 1.36] }
  8. Qxd4 { [%txt "La dame reprend au centre."] [%eval 1.46] }
  8... Qe5 { [%txt "La dame noire propose l'échange."] [%eval 1.56] }
  9. Qd3 { [%txt "On refuse : on garde les dames contre un roi noir non roqué."] [%eval 1.67] }
  9... Be6 { [%txt "Développement."] [%eval 1.50] }
  10. Bd5 { [%txt "On échange le défenseur de cases blanches."] [%eval 1.47] [%cal Gd5e6] }
  10... c6 { [%txt "Le pion chasse le fou."] [%eval 1.58] }
  11. f4 { [%txt "On chasse la dame avec gain de temps."] [%eval 1.65] [%cal Gf4e5] }
  11... Qh5 { [%txt "La dame s'en va."] [%eval 1.63] }
  12. f5 { [%txt "Encore un temps sur le fou e6."] [%eval 1.65] [%cal Gf5e6] }
  12... Bd7 { [%txt "Recul."] [%eval 1.62] }
  13. Bb3 { [%txt "Le fou garde la diagonale vers f7."] [%eval 1.66] [%cal Gb3f7] }
  13... Be7 { [%txt "Développement tardif."] [%eval 1.68] }
  14. Bd2 { [%txt "À RETENIR.

PRO TIP : +1.42. Développement : les Blancs ont l'espace et le jeu, le roi noir n'a pas encore roqué. Ensuite h3, pour contrôler g4. Contre 4...Qe7, roque et développement maximal avant d'attaquer la dame."] [%eval 1.42] [%csl Gg4] })
5. O-O { [%txt "On roque d'abord."] [%eval 1.16] }
5... Nge7 { [%txt "Le cavalier sort par e7, puisque f6 est occupé."] [%eval 1.22] }
(5... Be7 { [%txt "Un coup mou : le fou bloque encore la dame."] [%eval 1.35] }
  6. c3 { [%txt "On ouvre le centre."] [%eval 1.43] [%cal Gc3d4] }
  6... d6 { [%txt "Les Noirs soutiennent d4 avec un pion au lieu de prendre en c3 : l'évaluation passe de +1.43 à +2.73."] [%hint "Les Noirs défendent d4 par un pion au lieu de régler la tension : notre centre va se reconstruire avec gain de temps."] [%hint "Le pion d4 : notre pion c3 le prend, et le pion e4 rejoint d4 au centre."] [%hint "7.cxd4 : le grand centre d4-e4."] [%hintcsl Rd4,Ge4] [%eval 2.73] }
  7. cxd4 { [%txt "Le centre d4-e4."] [%eval 2.82] [%csl Gd4,Ge4] }
  7... Kf8 { [%txt "Une imprécision de plus : le roi s'en va à pied et ne pourra plus roquer."] [%eval 3.31] }
  8. Be3 { [%txt "Développement."] [%eval 3.66] }
  8... Bd7 { [%txt "Développement, mais la dame f6 reste exposée : l'évaluation passe de +3.66 à +4.20."] [%hint "Les Noirs développent le fou dame alors que leur roi a déjà perdu le roque et que leur dame reste en f6."] [%hint "La case d5 : un cavalier blanc y attaquera la dame f6 et le pion c7."] [%hint "9.Nc3 : le cavalier vise d5."] [%hintcsl Gd5,Rf6] [%eval 4.20] }
  9. Nc3 { [%txt "Le cavalier vise d5."] [%eval 4.30] [%cal Gc3d5] }
  9... h6 { [%txt "Un coup d'attente, et la dame f6 n'a toujours pas de case sûre : l'évaluation passe de +4.30 à +5.22."] [%hint "Un coup d'attente : la dame f6 n'a toujours pas de retraite sûre."] [%hint "La case d5 : notre cavalier y saute avec gain de temps sur la dame."] [%hint "10.Nd5 : la dame est chassée."] [%hintcsl Gd5,Rf6] [%eval 5.22] }
  10. Nd5 { [%txt "Le cavalier attaque la dame avec gain de temps."] [%eval 5.18] [%cal Gd5f6] }
  10... Qg6 { [%txt "La dame fuit."] [%eval 4.82] }
  11. Bd3 { [%txt "À RETENIR.

PRO TIP : +5.16. Le fou attaque la dame encore une fois. Une dame sortie trop tôt se chasse coup après coup, chaque attaque développant une pièce."] [%eval 5.16] [%cal Gd3g6] })
6. c3 { [%txt "On ouvre le centre."] [%eval 1.23] [%cal Gc3d4] }
6... d6 { [%txt "Les Noirs soutiennent d4."] [%eval 1.03] }
7. cxd4 { [%txt "Le centre d4-e4."] [%eval 1.23] [%csl Gd4,Ge4] }
7... Bg4 { [%txt "Le fou cloue le cavalier f3."] [%eval 1.20] }
8. Be3 { [%txt "Développement."] [%eval 1.17] }
8... Bxf3 { [%txt "Les Noirs échangent."] [%eval 1.20] }
9. gxf3 { [%txt "On reprend vers le centre : la colonne g s'ouvre vers le roi noir."] [%eval 1.20] [%cal Gg1g8] }
9... g6 { [%txt "Les Noirs préparent ...Bg7."] [%eval 1.02] }
10. d5 { [%txt "On chasse le cavalier avec gain de temps."] [%eval 0.93] [%cal Gd5c6] }
10... Ne5 { [%txt "Le cavalier attaque c4 et f3."] [%eval 0.92] }
11. Bb5+ { [%txt "Échec."] [%eval 1.07] [%cal Gb5e8] }
11... c6 { [%txt "Interposition."] [%eval 1.06] }
12. f4 { [%txt "Le pion attaque le cavalier e5."] [%eval 1.12] [%cal Gf4e5] }
12... cxb5 { [%txt "Les Noirs prennent le fou."] [%eval 1.23] }
13. fxe5 { [%txt "On prend le cavalier : la dame noire est attaquée et les Blancs gardent un net avantage. Contre une dame sortie trop tôt, développe avec gain de temps et ouvre le centre ; chaque tempo gagné est un coup de plus pour ton attaque.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.87).
1. Nc3 : le cavalier se développe et attaque le pion b5.
2. f4 : le pion attaque e5 et ouvre la colonne f.
3. Kh1 puis d6 : le roi se met à l'abri, puis le pion passé avance."] [%eval 0.87] [%cal Ge5f6] } *`,
    ),
    chapter(
      "Aléatoire surprise 1 : après 4...Bc5 5.c3, la case e5 et la paire de fous",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le chapitre 2 jusqu'à 12.Na4. La théorie s'arrête là. Les Noirs ne font pas de gaffe : ils jouent des coups de dame et de roi sans plan. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case clé (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup noir ? 2. Quelle case centrale ne peut plus être chassée par un pion noir ? 3. Quelle pièce blanche peut viser le roi noir ?"] [%eval 0.30] }
1. e4 { [%txt "Le centre."] [%eval 0.34] }
1... e5 { [%txt "Symétrie."] [%eval 0.37] }
2. Nf3 { [%txt "Attaque de e5."] [%eval 0.26] }
2... Nc6 { [%txt "Défense."] [%eval 0.15] }
3. d4 { [%txt "On ouvre le centre."] [%eval -0.02] }
3... exd4 { [%txt "Prise."] [%eval 0.04] }
4. Bc4 { [%txt "Le fou vise f7."] [%eval -0.10] }
4... Bc5 { [%txt "Le fou défend d4."] [%eval 0.05] }
5. c3 { [%txt "Deuxième attaque sur d4."] [%eval 0.11] }
5... Nf6 { [%txt "Contre-attaque sur e4."] [%eval 0.02] }
6. e5 { [%txt "On chasse le cavalier."] [%eval 0.04] }
6... d5 { [%txt "Le contre central."] [%eval 0.14] }
7. Be2 { [%txt "Le fou recule."] [%eval 0.08] }
7... Ne4 { [%txt "Le cavalier au centre."] [%eval 0.00] }
8. cxd4 { [%txt "On récupère le pion."] [%eval 0.00] }
8... Bb6 { [%txt "Le fou recule."] [%eval 0.07] }
9. Nc3 { [%txt "Contre e4."] [%eval 0.07] }
9... O-O { [%txt "Roque."] [%eval 0.10] }
10. O-O { [%txt "Roque."] [%eval 0.15] }
10... Be6 { [%txt "Développement."] [%eval 0.15] }
11. Be3 { [%txt "On protège d4."] [%eval 0.14] }
11... f6 { [%txt "Contre e5."] [%eval 0.13] }
12. Na4 { [%txt "Fin de la théorie : le cavalier vise le fou b6."] [%eval 0.08] }
12... Qb8 { [%txt "PREMIER COUP MOU : la dame part sur le bord au lieu de régler la tension en e5 (12...f5 tenait) : l'évaluation passe de +0.08 à +0.73."] [%hint "La dame noire part en b8, loin du centre, au lieu de bloquer le jeu par ...f5."] [%hint "La case e5 : après exf6, notre cavalier f3 s'y installe, et aucun pion noir ne pourra plus l'en chasser."] [%hint "13.exf6 Rxf6 14.Ne5 : le cavalier s'installe en e5."] [%hintcsl Ge5] [%eval 0.73] }
13. exf6 { [%txt "On ouvre la colonne f et on libère la case e5."] [%eval 0.84] }
13... Rxf6 { [%txt "La tour reprend."] [%eval 0.81] }
14. Ne5 { [%txt "Le cavalier s'installe en e5 et attaque le cavalier c6."] [%eval 0.67] [%csl Ge5] [%cal Ge5c6] }
14... Kh8 { [%txt "DEUXIÈME COUP MOU : le roi se cache au lieu d'échanger notre cavalier e5 par ...Nxe5 : l'évaluation passe de +0.67 à +1.64."] [%hint "Le roi se met à l'abri au lieu d'échanger notre cavalier e5, la meilleure pièce blanche."] [%hint "Le fou b6 et le cavalier c6 : notre cavalier a4 prend le fou, notre cavalier e5 prendra le cavalier, et les pions noirs de l'aile dame seront abîmés."] [%hint "15.Nxb6 axb6 16.f3 : la paire de fous, puis on chasse le cavalier e4."] [%hintcsl Gb6,Rc6] [%eval 1.64] }
15. Nxb6 { [%txt "On prend la paire de fous."] [%eval 1.71] [%cal Ga4b6] }
15... axb6 { [%txt "Reprise."] [%eval 1.74] }
16. f3 { [%txt "Le pion chasse le cavalier e4."] [%eval 1.60] [%cal Gf3e4] }
16... Nd6 { [%txt "Le cavalier recule."] [%eval 1.68] }
17. Nxc6 { [%txt "On échange : les pions noirs de l'aile dame sont doublés."] [%eval 1.56] }
17... bxc6 { [%txt "Reprise vers le centre."] [%eval 1.55] }
18. Qc2 { [%txt "La dame vise h7 sur la diagonale b1-h7."] [%eval 1.48] [%cal Gc2h7] }
18... Qc8 { [%txt "TROISIÈME COUP MOU : la dame recule pendant que notre dame vise h7 : l'évaluation passe de +1.48 à +2.16."] [%hint "La dame noire recule au lieu de jouer ...Nc4 contre notre fou e3."] [%hint "La case h7 : notre dame c2 la vise déjà, et le fou e2 peut venir en d3 renforcer l'attaque."] [%hint "19.Rfe1 : la tour se place derrière le fou e2 ; quand il ira en d3, la colonne e et la case h7 seront visées en même temps."] [%hintcsl Rh7,Gd3] [%eval 2.16] }
19. Rfe1 { [%txt "La tour derrière le fou e2, face au fou e6."] [%eval 2.11] [%cal Ge1e6] }
19... Bg8 { [%txt "Le fou se replie pour défendre h7."] [%eval 2.06] }
20. Bd3 { [%txt "À RETENIR.

PRO TIP : +1.93. Les deux fous visent l'aile roi, la colonne e est ouverte et les pions noirs de l'aile dame sont doublés : l'avantage blanc est durable. Contre des coups mous après la théorie, installe un cavalier sur la case que les pions noirs ne peuvent plus chasser, puis prends la paire de fous."] [%eval 1.93] [%cal Gd3h7,Gc2h7] } *`,
    ),
    chapter(
      "Aléatoire surprise 2 : après 4...d6, le pion e5 coupe le camp noir",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le chapitre 4 jusqu'à 13.Rad1. La théorie s'arrête là. Les Noirs, passifs depuis le coup 4, jouent des coups de pièce qui laissent le pion d6 et le fou f5 sans défense. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case clé (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup noir ? 2. Quel pion noir est faible ? 3. Quelle poussée de pion blanc l'attaque ?"] [%eval 0.30] }
1. e4 { [%txt "Le centre."] [%eval 0.34] }
1... e5 { [%txt "Symétrie."] [%eval 0.37] }
2. Nf3 { [%txt "Attaque de e5."] [%eval 0.26] }
2... Nc6 { [%txt "Défense."] [%eval 0.15] }
3. d4 { [%txt "On ouvre le centre."] [%eval -0.02] }
3... exd4 { [%txt "Prise."] [%eval 0.04] }
4. Bc4 { [%txt "Le fou vise f7."] [%eval -0.10] }
4... d6 { [%txt "La réponse passive : l'évaluation passe de -0.10 à +0.46."] [%hint "Les Noirs jouent un coup de pion qui ne développe rien et enferme leur fou f8 derrière d6."] [%hint "Le pion d4 n'est plus défendu que par le cavalier c6."] [%hint "Nxd4 : on récupère le pion, et le pion e4 contre d6 nous donne l'espace."] [%hintcsl Rd4] [%eval 0.46] }
5. Nxd4 { [%txt "On récupère le pion."] [%eval 0.46] }
5... Nf6 { [%txt "Contre e4."] [%eval 0.44] }
6. Nc3 { [%txt "Défense de e4."] [%eval 0.45] }
6... Be7 { [%txt "Le fou se développe."] [%eval 0.40] }
7. O-O { [%txt "Roque."] [%eval 0.41] }
7... O-O { [%txt "Roque."] [%eval 0.34] }
8. h3 { [%txt "La case g4."] [%eval 0.42] }
8... Nxd4 { [%txt "Échange."] [%eval 0.42] }
9. Qxd4 { [%txt "La dame au centre."] [%eval 0.42] }
9... Nd7 { [%txt "Vers c5 ou e5."] [%eval 0.42] }
10. Be3 { [%txt "Développement."] [%eval 0.40] }
10... Bf6 { [%txt "Contre la dame."] [%eval 0.49] }
11. Qd2 { [%txt "La dame recule."] [%eval 0.50] }
11... Nc5 { [%txt "Le cavalier se place."] [%eval 0.41] }
12. Bd4 { [%txt "Contre le fou f6."] [%eval 0.38] }
12... a5 { [%txt "L'espace."] [%eval 0.54] }
13. Rad1 { [%txt "Fin de la théorie : la tour face au pion d6."] [%eval 0.51] }
13... Be6 { [%txt "Le fou propose l'échange du fou c4."] [%eval 0.39] }
14. Be2 { [%txt "On garde le fou : il couvre g4."] [%eval 0.52] }
14... Bxd4 { [%txt "Les Noirs échangent."] [%eval 0.47] }
15. Qxd4 { [%txt "La dame reprend, face au pion d6."] [%eval 0.55] [%cal Gd4d6] }
15... Rc8 { [%txt "PREMIER COUP MOU : un coup de tour lent au lieu d'activer la dame par 15...Qh4 : l'évaluation passe de +0.55 à +1.18."] [%hint "Les Noirs jouent un coup de tour lent pendant que leur pion d6 est fixé face à notre dame et à notre tour."] [%hint "Le pion d6 : notre dame d4 et la tour d1 le visent, et la poussée e5 l'attaquera une troisième fois."] [%hint "16.e5 : le pion attaque d6, la tour d1 vise la colonne d derrière la dame."] [%hintcsl Rd6,Ge5] [%eval 1.18] }
16. e5 { [%txt "Le pion attaque d6 et coupe le camp noir."] [%eval 1.14] [%cal Ge5d6] }
16... Bf5 { [%txt "Le fou se développe vers c2."] [%eval 1.22] }
17. Rd2 { [%txt "La tour libère d1 et se prépare à doubler sur la colonne d."] [%eval 1.24] }
17... Ne6 { [%txt "DEUXIÈME COUP MOU : le cavalier chasse la dame, mais il prend la case e6 au fou f5 : l'évaluation passe de +1.24 à +1.81."] [%hint "Le cavalier attaque notre dame, mais il enlève la case e6 au fou f5, qui n'a plus beaucoup de retraites."] [%hint "Le fou f5 : sur la diagonale c8-h3, notre pion g peut le chasser, et la case e6 est occupée."] [%hint "18.Qe3 : la dame garde e5 et prépare g4 contre le fou f5."] [%hintcsl Rf5,Gg4] [%eval 1.81] }
18. Qe3 { [%txt "La dame recule en gardant e5."] [%eval 1.94] [%cal Ge3e5] }
18... Qh4 { [%txt "La dame noire cherche du jeu."] [%eval 1.74] }
19. g4 { [%txt "Le pion chasse le fou."] [%eval 1.88] [%cal Gg4f5] }
19... Ng5 { [%txt "Le cavalier attaque h3."] [%eval 1.94] }
20. Kh2 { [%txt "Le roi défend h3."] [%eval 1.82] }
20... Bd7 { [%txt "Le fou recule."] [%eval 2.04] }
21. Qg3 { [%txt "À RETENIR.

PRO TIP : +2.03. La dame propose l'échange : les Blancs ont l'espace, le pion e5 coupe le camp noir et le pion d6 reste faible. Contre un adversaire passif, une poussée de pion centrale qui attaque le pion faible vaut plus qu'une attaque de pièces."] [%eval 2.03] [%cal Gg3h4] } *`,
    ),
  ],
};
