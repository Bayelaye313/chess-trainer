import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours d'ouverture « Sicilienne Dragon (avec les Noirs) » : 1.e4 c5 2.Nf3
 * d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6 — onglet Ouvertures, format « un
 * commentaire par coup » de l'Académie, lu par `CourseTreeViewer` (route
 * `/ouvertures/sicilian-dragon/cours`). Public visé : 1500-1800 Elo, qui
 * cherche une alternative ultra-agressive à la Caro-Kann.
 *
 * ## Contenu (2026-10-14)
 *
 * 1. Fiche d'identité et Attaque Yougoslave 6.Be3 Bg7 7.f3 O-O 8.Qd2 Nc6
 *    9.Bc4 Bd7 10.O-O-O Rc8 11.Bb3 Ne5 12.h4 h5 (Soltis) 13.Bg5 Rc5 14.Kb1
 *    Re8 15.g4 hxg4 16.f4 Nc4 17.Qe2 (environ 0.00), avec 12.Kb1 et la
 *    ligne moderne 9.O-O-O d5.
 * 2. Classique 6.Be2 Bg7 7.O-O Nc6 8.Be3 O-O 9.Qd2 d5! jusqu'au coup 14
 *    (pion d5 sacrifiable contre l'activité), avec 9.Nb3 Be6 10.f4 Qc8
 *    (le levier ...d5 retardé) et 9.f4 Qb6.
 * 3. Fausse variante d'échange 9.Nxc6?! bxc6 (environ -0.3) : 10...Be6!
 *    et non 10...d5? 11.Bh6 (environ +0.6), 10.e5? Nd5! et 10.Bc4 Qa5.
 * 4. Anti-panique : 8.g4?! Nc6 9.h4? d5! (environ -1.7 après 10.exd5),
 *    7.h4?! Nc6 8.h5 Nxh5 9.Rxh5? gxh5 et 7.Qd2?! Ng4.
 * 5. Aléatoire surprise : après la Soltis, 17.f4?!, 18.Qc1? et le faux
 *    sacrifice 20.Nf5? exf5 (environ -4).
 *
 * Indices progressifs : chaque faute blanche porte trois balises `[%hint]`
 * (1. principe violé, 2. case faible, 3. action de punition) et une balise
 * `[%hintcsl]` (cases allumées à partir du 2e indice).
 *
 * Sources : les PDF Sicilienne de `docs/` ne couvrent pas le Dragon côté
 * noir avec une couche texte exploitable ; les lignes suivent la théorie
 * établie du Dragon (Soltis, Ne5 de la ligne 9.Bc4, 9.O-O-O d5) et sont
 * TOUTES arbitrées par Stockfish 18 natif (profondeur 16). Le moteur a
 * nuancé le cahier des charges : 11...Ne5 reste jouable mais 11...Nxd4 est
 * un peu plus précis (+0.6 contre +0.8) ; après 9.Nxc6 bxc6 10.O-O-O, la
 * poussée immédiate 10...d5? est une erreur (11.Bh6, +0.6) : le levier
 * ...d5 se prépare par 10...Be6 et ...Qa5 ; le « piège » 7.Qd2 Ng4 8.Bg5 h6
 * 9.Bh4 g5 10.Bg3 Bxd4? perd (+1.6). Toute la prose est originale.
 *
 * ## Architecture technique des nœuds
 *
 * Voir `op-scotch-game.ts` : `evaluationScore` / `evaluationMate` (balise
 * `[%eval]`), `showEvalBar`, `freeze` (balise `[%txt "…"]` sur CHAQUE
 * commentaire), plus `hints` / `hintHighlights`.
 *
 * Fichier GÉNÉRÉ : ne pas l'éditer à la main. Source commentée :
 * `scripts/opening-course-src/sicilian-dragon.source.pgn` (et l'en-tête
 * `sicilian-dragon.header.txt`) ; regénérer avec
 * `node --import tsx scripts/_tmp-build-opening-course.mts <source> <en-tête> <sortie> 16 [pgn compilé]`
 * (PGN compilé : `scripts/opening-course-src/sicilian-dragon.pgn`).
 * Règles de l'utilisateur : SAN en texte brut uniquement (jamais de figurine
 * Unicode), pas de guillemet droit dans un `[%txt]` ni un `[%hint]`.
 */

function chapter(title: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, START) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const OP_SICILIAN_DRAGON: CourseTree = {
  chapters: [
    chapter(
      "Fiche d'identité, tronc commun et l'Attaque Yougoslave",
      `{ [%txt "LA SICILIENNE DRAGON, AVEC LES NOIRS.

Le vrai enjeu : le fou f8 part en g7, sur la grande diagonale a1-h8. Il vise d4, c3 et, au bout, le roi blanc s'il roque en c1 ou b1. La colonne c, ouverte dès 3...cxd4, devient l'autoroute de nos tours.

Contre l'Attaque Yougoslave (Be3, f3, Qd2, O-O-O), c'est une COURSE AU MAT :
- Plan blanc : h4-h5 pour ouvrir la colonne h, Bh6 pour échanger notre fou g7, puis Qh6 et le mat en h7.
- Plan noir : la colonne c (Rc8, Ne5-c4, souvent le sacrifice de qualité ...Rxc3), les pions a et b, et le fou g7 qui pilonne b2.

La règle d'or du joueur de club : chaque coup compte. Un coup de défense inutile, c'est un temps offert à l'adversaire dans la course. On ne recule pas, on contre-attaque.

Honnêteté moteur : Stockfish 18 donne aux Blancs environ +0.6 après 5...g6, contre +0.4 pour la Najdorf. Le Dragon n'est pas la Sicilienne la plus solide ; il est la plus directe, avec des plans qui se répètent partie après partie.

Les structures types (relevées sur la position finale de chaque chapitre) :
- Chapitres 1 et 5 : roques opposés, colonnes c (pour nous) et g-h (pour eux) ouvertes, cavalier noir en c4.
- Chapitre 2 : pion d5 isolé ou sacrifié, nos pièces actives sur les colonnes b et d.
- Chapitre 3 : pions c6-d6 au centre, colonne b semi-ouverte contre b2.
- Chapitre 4 : centre ouvert par ...d5 avec le roi blanc encore en e1."] [%eval 0.42] }
1. e4 { [%txt "Le pion roi au centre."] [%eval 0.37] }
1... c5 { [%txt "La Sicilienne : on contrôle d4 de côté et on prépare la colonne c."] [%eval 0.46] [%cal Gc5d4] }
2. Nf3 { [%txt "Le cavalier prépare d4."] [%eval 0.42] }
2... d6 { [%txt "Le pion d6 contrôle e5 et ouvre la diagonale du fou c8."] [%eval 0.35] [%csl Ge5] [%cal Gc8h3] }
3. d4 { [%txt "La Sicilienne ouverte : les Blancs ouvrent le centre."] [%eval 0.38] }
3... cxd4 { [%txt "On prend : notre pion c disparaît, la colonne c s'ouvre pour nos tours."] [%eval 0.38] [%cal Gc8c1] }
4. Nxd4 { [%txt "Le cavalier reprend au centre."] [%eval 0.48] }
4... Nf6 { [%txt "Développement avec gain de temps : on attaque le pion e4."] [%eval 0.40] [%cal Gf6e4] }
5. Nc3 { [%txt "Le cavalier défend e4."] [%eval 0.39] }
5... g6 { [%txt "LE DRAGON : le fou f8 va en g7, sur la grande diagonale. La chaîne de pions d6-e7-f7-g6-h7 dessine la queue du dragon."] [%eval 0.76] [%csl Gg6] [%cal Gf8g7,Gg7a1] }
6. Be3 { [%txt "L'Attaque Yougoslave commence : le fou e3 vise h6 pour échanger notre fou g7."] [%eval 0.60] [%cal Ge3h6] }
6... Bg7 { [%txt "Le fou prend sa place : il frappe d4 et, plus loin, b2."] [%eval 0.60] [%csl Gg7] [%cal Gg7d4,Gg7b2] }
7. f3 { [%txt "Le pion f3 empêche ...Ng4 contre le fou e3 et soutient e4 et la future poussée g4."] [%eval 0.66] [%cal Gf3g4] }
7... O-O { [%txt "On roque tout de suite : notre roi est à l'abri du dragon."] [%eval 0.63] [%csl Gg8] }
8. Qd2 { [%txt "La dame se prépare pour Bh6 et le grand roque."] [%eval 0.66] [%cal Ge3h6,Gd2h6] }
8... Nc6 { [%txt "Le cavalier frappe d4 et prépare ...Ne5-c4."] [%eval 0.70] [%cal Gc6d4,Gc6e5] }
9. Bc4 { [%txt "Le fou vise f7 et contrôle d5 : il empêche le levier libérateur ...d5."] [%eval 0.51] [%csl Gd5] [%cal Gc4f7] }
(9. O-O-O { [%txt "La ligne moderne : on roque avant de développer le fou f1."] [%eval 0.63] }
  9... d5 { [%txt "La réponse thématique ! Le fou f1 n'est pas encore en c4 : on frappe le centre tout de suite."] [%eval 0.67] [%csl Gd5] [%cal Gd5e4] }
  10. exd5 { [%txt "Les Blancs prennent."] [%eval 0.63] }
  10... Nxd5 { [%txt "Le cavalier reprend et ouvre la grande diagonale du fou g7."] [%eval 0.62] [%cal Gg7b2] }
  11. Nxc6 { [%txt "Les Blancs simplifient avant que ...Nxc3 ne vienne."] [%eval 0.59] }
  11... bxc6 { [%txt "On reprend vers le centre : la colonne b s'ouvre contre b2."] [%eval 0.59] [%cal Gb8b2] }
  12. Bd4 { [%txt "Les Blancs proposent l'échange de notre fou g7."] [%eval 0.59] [%cal Gd4g7] }
  12... Bxd4 { [%txt "On échange avant que le fou d4 ne reste en place."] [%eval 0.63] [%cal Gg7d4] }
  13. Qxd4 { [%txt "La dame reprend au centre."] [%eval 0.63] }
  13... Qb6 { [%txt "La dame propose l'échange et vise b2."] [%eval 0.68] [%cal Gb6b2] }
  14. Na4 { [%txt "Les Blancs évitent l'échange avec gain de temps."] [%eval 0.70] }
  14... Qa5 { [%txt "La dame reste active et vise a2."] [%eval 0.61] [%cal Ga5a2] }
  15. b3 { [%txt "Les Blancs ferment la diagonale."] [%eval 0.58] }
  15... Be6 { [%txt "À RETENIR.

PRO TIP : environ +0.7 pour les Blancs, mais nos pièces sont actives et la colonne b reste ouverte. Contre 9.O-O-O, la poussée ...d5 doit venir TOUT DE SUITE, avant que le fou f1 contrôle d5."] [%eval 0.62] [%csl Gd5] [%cal Ga8b8] })
9... Bd7 { [%txt "On développe et on libère c8 pour la tour. Le fou d7 soutient ...Rc8 et ...b5."] [%eval 0.69] [%cal Ga8c8] }
10. O-O-O { [%txt "Les Blancs roquent du côté opposé : la course au mat est lancée."] [%eval 0.59] [%csl Rc1] }
10... Rc8 { [%txt "La tour s'installe sur la colonne c ouverte et vise c3 et le roi c1."] [%eval 0.64] [%cal Gc8c3] }
11. Bb3 { [%txt "Le fou se met à l'abri de ...Ne5-c4 et ...Rxc4."] [%eval 0.53] }
11... Ne5 { [%txt "Le cavalier vise c4 : il veut échanger le fou b3 ou bloquer la colonne. Honnêteté moteur : 11...Nxd4 12.Bxd4 b5 est un peu plus précis (+0.6 contre +0.8), mais 11...Ne5 est la ligne classique."] [%eval 0.90] [%csl Gc4] [%cal Ge5c4] }
12. h4 { [%txt "Les Blancs lancent leur pion h : h5 doit ouvrir la colonne h."] [%eval 0.76] [%cal Gh4h5] }
(12. Kb1 { [%txt "Le coup le plus exigeant (+1.0) : le roi s'écarte de la colonne c avant l'attaque."] [%eval 1.07] }
  12... Re8 { [%txt "On protège e7 et on libère f8 pour le fou si Bh6 arrive : notre fou g7 pourra reculer au lieu d'être échangé."] [%eval 1.12] [%cal Gg7f8] })
12... h5 { [%txt "LA SOLTIS : on bloque le pion h en h5. Les Blancs devront sacrifier un pion (g4) pour ouvrir la colonne h."] [%eval 0.77] [%csl Gh5] [%cal Gh5h4] }
13. Bg5 { [%txt "Le fou vise f6 : il veut éliminer le défenseur du roi."] [%eval 0.43] [%cal Gg5f6] }
13... Rc5 { [%txt "La tour monte en c5 : elle défend la 5e rangée (g5, h5) et prépare ...Rxc3 ou ...b5."] [%eval 0.54] [%cal Gc5c3,Gc5g5] }
14. Kb1 { [%txt "Le roi s'écarte de la colonne c."] [%eval 0.41] }
14... Re8 { [%txt "On protège e7 et on prépare ...Bf8 si les Blancs jouent Bh6."] [%eval 0.48] [%cal Ge8e7] }
15. g4 { [%txt "Le sacrifice de pion classique : les Blancs veulent ouvrir la colonne h."] [%eval 0.25] [%cal Gg4h5] }
15... hxg4 { [%txt "On prend : un pion de plus, et la colonne h reste fermée pour l'instant."] [%eval 0.00] [%cal Gh5g4] }
16. f4 { [%txt "Les Blancs chassent notre cavalier e5."] [%eval 0.00] [%cal Gf4e5] }
16... Nc4 { [%txt "Le cavalier saute en c4 avec gain de temps : il attaque la dame d2."] [%eval -0.07] [%csl Gc4] [%cal Gc4d2,Gc4b2] }
17. Qe2 { [%txt "À RETENIR.

PRO TIP : la dame recule et défend g4 ; environ 0.00. Course au mat équilibrée : nos pièces (Nc4, Rc5, Bg7) visent b2, les leurs visent h7. Dans la Soltis on garde le pion h5 jusqu'au bout et on répond à chaque coup d'attaque par un coup d'attaque."] [%eval -0.18] [%csl Gc4,Rb2] [%cal Gc4b2,Gg7b2] } *`,
    ),
    chapter(
      "La Variante Classique : 6.Be2 et le levier ...d5",
      `{ [%txt "LA VARIANTE CLASSIQUE 6.Be2.

Les Blancs développent tranquillement et roquent du MÊME côté que nous. Plus de course au mat : la lutte se joue au centre.

Pourquoi cette ligne est moins dangereuse : le fou e2 ne contrôle pas d5, la dame ne va pas en h6 et le pion f n'est pas en f3. Rien n'empêche notre levier libérateur ...d5.

Le moment juste : ...d5 se joue dès que d5 n'est plus contrôlé par deux pièces blanches. Contre 9.Qd2, il vient tout de suite. Contre 9.Nb3 et 10.f4, on le prépare par ...Be6, ...Qc8 et ...Rd8, puis il arrive au coup 13.

Honnêteté moteur : après 9.Qd2 d5!, Stockfish 18 donne environ 0.00 : les Noirs ont égalisé, quitte à donner le pion d5 pour l'activité."] [%eval 0.42] }
1. e4 { [%txt "Le pion roi."] [%eval 0.37] }
1... c5 { [%txt "La Sicilienne."] [%eval 0.46] [%cal Gc5d4] }
2. Nf3 { [%txt "Le cavalier prépare d4."] [%eval 0.42] }
2... d6 { [%txt "Le pion d6 contrôle e5."] [%eval 0.35] [%csl Ge5] }
3. d4 { [%txt "La Sicilienne ouverte."] [%eval 0.38] }
3... cxd4 { [%txt "La colonne c s'ouvre."] [%eval 0.38] [%cal Gc8c1] }
4. Nxd4 { [%txt "Le cavalier reprend."] [%eval 0.48] }
4... Nf6 { [%txt "On attaque e4."] [%eval 0.40] [%cal Gf6e4] }
5. Nc3 { [%txt "Le cavalier défend e4."] [%eval 0.39] }
5... g6 { [%txt "Le Dragon."] [%eval 0.76] [%cal Gf8g7] }
6. Be2 { [%txt "LA CLASSIQUE : le fou se développe sobrement, les Blancs vont roquer à l'aile roi."] [%eval 0.31] }
6... Bg7 { [%txt "Le fou sur la grande diagonale."] [%eval 0.40] [%cal Gg7d4,Gg7b2] }
7. O-O { [%txt "Le roi blanc rejoint l'aile roi : pas de roques opposés."] [%eval 0.29] [%csl Gg1] }
7... Nc6 { [%txt "Le cavalier frappe d4."] [%eval 0.25] [%cal Gc6d4] }
8. Be3 { [%txt "Le fou défend d4."] [%eval 0.26] }
8... O-O { [%txt "On roque."] [%eval 0.27] [%csl Gg8] }
9. Qd2 { [%txt "La dame relie les tours, mais elle ne contrôle pas d5 : le levier est libre."] [%eval 0.08] }
(9. Nb3 { [%txt "Le cavalier quitte d4 : il évite les échanges et soutient la poussée f4."] [%eval -0.11] }
  9... Be6 { [%txt "Le fou vise c4 et la diagonale a2-g8 : il prépare aussi ...d5."] [%eval 0.04] [%cal Ge6c4,Gd6d5] }
  10. f4 { [%txt "Les Blancs prennent de l'espace et menacent f5 contre le fou e6."] [%eval 0.13] [%cal Gf4f5] }
  10... Qc8 { [%txt "La dame protège e6 et vise c4 et h3."] [%eval 0.17] [%cal Gc8c4] }
  11. h3 { [%txt "Les Blancs empêchent ...Bg4 et ...Ng4."] [%eval 0.17] }
  11... Rd8 { [%txt "La tour se place derrière le pion d6 : ...d5 se prépare."] [%eval 0.33] [%cal Gd8d5] }
  12. Bf3 { [%txt "Le fou soutient e4 et vise d5."] [%eval -0.30] }
  12... Bc4 { [%txt "Le fou s'installe en c4 et coupe la tour f1."] [%eval -0.29] [%csl Gc4] [%cal Gc4f1] }
  13. Rf2 { [%txt "La tour s'écarte du fou."] [%eval -0.22] }
  13... d5 { [%txt "À RETENIR.

PRO TIP : LE LEVIER AU BON MOMENT. Environ -0.3 : ...d5 arrive avec la tour d8 derrière le pion. Quand les Blancs contrôlent d5, on prépare ...d5 avec ...Be6, ...Qc8, ...Rd8 ; on ne le pousse jamais à l'aveugle."] [%eval -0.13] [%csl Gd5] [%cal Gd8d5,Gd5e4] })
(9. f4 { [%txt "Un coup agressif, mais la diagonale g1-a7 se vide."] [%eval 0.00] }
  9... Qb6 { [%txt "La dame cloue le cavalier d4 au fou e3 et vise b2."] [%eval 0.00] [%cal Gb6b2,Gb6g1] }
  10. Qd3 { [%txt "La dame défend d4."] [%eval -0.07] }
  10... Ng4 { [%txt "On frappe le fou e3, le seul défenseur de d4."] [%eval 0.00] [%cal Gg4e3] }
  11. Bxg4 { [%txt "Les Blancs prennent le cavalier."] [%eval -0.04] }
  11... Bxd4 { [%txt "On reprend au centre : le fou g7 gagne d4."] [%eval -0.05] [%cal Gg7d4] }
  12. Bxd4 { [%txt "Les Blancs échangent."] [%eval -0.09] }
  12... Qxd4+ { [%txt "Échec."] [%eval -0.05] }
  13. Qxd4 { [%txt "Les dames s'échangent."] [%eval -0.05] }
  13... Nxd4 { [%txt "À RETENIR.

PRO TIP : finale égale (environ 0.00). Contre f4, la dame b6 exploite la diagonale g1-a7 : il faut toujours vérifier si le cavalier d4 et le fou e3 sont surchargés."] [%eval -0.10] [%csl Gd4] })
9... d5 { [%txt "LE LEVIER THÉMATIQUE : d5 n'est contrôlé que par le cavalier c3. On ouvre le centre pour libérer notre jeu."] [%eval -0.03] [%csl Gd5] [%cal Gd5e4,Gg7b2] }
10. exd5 { [%txt "Les Blancs prennent."] [%eval -0.06] }
(10. Nxc6 { [%txt "Les Blancs échangent d'abord."] [%eval -0.02] }
  10... bxc6 { [%txt "On reprend vers le centre : le pion c6 soutient d5."] [%eval -0.06] [%cal Gc6d5] }
  11. e5 { [%txt "Les Blancs chassent le cavalier f6."] [%eval -0.08] }
  11... Ng4 { [%txt "Le cavalier vise e3 et e5."] [%eval -0.10] [%cal Gg4e3,Gg4e5] }
  12. Bxg4 { [%txt "Les Blancs échangent."] [%eval -0.11] }
  12... Bxg4 { [%txt "À RETENIR.

PRO TIP : égalité (environ 0.00). Le pion e5 est attaqué par le fou g7 ; on suivra avec ...f6 pour ouvrir la colonne f."] [%eval -0.06] [%csl Re5] [%cal Gg7e5] })
10... Nxd5 { [%txt "Le cavalier reprend et ouvre la grande diagonale."] [%eval 0.00] [%cal Gg7b2] }
11. Nxc6 { [%txt "Les Blancs échangent un cavalier."] [%eval -0.08] }
(11. Nxd5 { [%txt "L'autre prise."] [%eval 0.00] }
  11... Nxd4 { [%txt "Le coup précis (environ 0.00) : on prend au centre, la dame d8 n'est pas en prise. 11...Qxd5 laisse +0.7."] [%eval 0.00] [%csl Gd4] [%cal Gc6d4] }
  12. c4 { [%txt "Les Blancs soutiennent le cavalier d5."] [%eval 0.00] }
  12... Nf5 { [%txt "Le cavalier attaque le fou e3."] [%eval 0.00] [%cal Gf5e3] }
  13. Rad1 { [%txt "La tour sur la colonne d."] [%eval -0.05] }
  13... Be6 { [%txt "À RETENIR.

PRO TIP : égalité (environ 0.00). On défie le cavalier d5 et nos pièces sont bien placées."] [%eval 0.00] [%cal Ge6d5] })
11... bxc6 { [%txt "On reprend vers le centre : la colonne b s'ouvre contre b2."] [%eval -0.04] [%cal Gb8b2] }
12. Rfd1 { [%txt "La tour vise le cavalier d5."] [%eval 0.30] [%cal Gd1d5] }
12... Qc7 { [%txt "La dame se met à l'abri de la colonne d et vise h2."] [%eval 0.19] [%cal Gc7h2] }
13. Nxd5 { [%txt "Les Blancs échangent le cavalier central."] [%eval 0.21] }
13... cxd5 { [%txt "On reprend : pion d5 isolé, mais colonnes b et c ouvertes pour nos tours."] [%eval 0.18] [%csl Gd5] [%cal Ga8b8] }
14. c3 { [%txt "Le coup prudent : il ferme la diagonale du fou g7."] [%eval 0.19] }
(14. Qxd5 { [%txt "Les Blancs gagnent le pion."] [%eval -0.21] }
  14... Be6 { [%txt "Pour le pion : le fou e6 chasse la dame avec gain de temps et la paire de fous vise b2. Environ 0.00 : compensation complète."] [%eval -0.19] [%cal Ge6d5,Gg7b2] })
14... Rd8 { [%txt "À RETENIR.

PRO TIP : environ +0.2, position saine. La tour défend d5 ; nos fous et la colonne b compensent largement le pion isolé. Dans la Classique, le levier ...d5 libère tout le jeu noir."] [%eval 0.12] [%csl Gd5] [%cal Gd8d5,Ga8b8] } *`,
    ),
    chapter(
      "Le piège de la fausse variante d'échange : 9.Nxc6?!",
      `{ [%txt "LA FAUSSE VARIANTE D'ÉCHANGE.

Beaucoup de joueurs de club échangent le cavalier d4 contre notre cavalier c6 sans raison. Ils pensent simplifier ; en réalité ils nous font un cadeau : le pion b reprend vers le centre, notre pion c6 soutient d5, la colonne b s'ouvre contre b2.

Stockfish 18 : après 8...Nc6, la position vaut environ +0.9 pour les Blancs ; après 9.Nxc6?! bxc6, environ -0.3. Plus d'un pion d'avantage s'envole en un coup.

LE PIÈGE à éviter pour nous : pousser ...d5 trop tôt. Après 10.O-O-O, 10...d5? 11.Bh6! rend l'avantage aux Blancs. Le levier attendra : on développe par ...Be6 et on frappe b2 par la colonne b."] [%eval 0.42] }
1. e4 { [%txt "Le pion roi."] [%eval 0.37] }
1... c5 { [%txt "La Sicilienne."] [%eval 0.46] [%cal Gc5d4] }
2. Nf3 { [%txt "Le cavalier prépare d4."] [%eval 0.42] }
2... d6 { [%txt "Le pion d6 contrôle e5."] [%eval 0.35] [%csl Ge5] }
3. d4 { [%txt "La Sicilienne ouverte."] [%eval 0.38] }
3... cxd4 { [%txt "La colonne c s'ouvre."] [%eval 0.38] [%cal Gc8c1] }
4. Nxd4 { [%txt "Le cavalier reprend."] [%eval 0.48] }
4... Nf6 { [%txt "On attaque e4."] [%eval 0.40] [%cal Gf6e4] }
5. Nc3 { [%txt "Le cavalier défend e4."] [%eval 0.39] }
5... g6 { [%txt "Le Dragon."] [%eval 0.76] [%cal Gf8g7] }
6. Be3 { [%txt "L'Attaque Yougoslave."] [%eval 0.60] }
6... Bg7 { [%txt "Le fou sur la grande diagonale."] [%eval 0.60] [%cal Gg7d4] }
7. f3 { [%txt "Le pion soutient e4."] [%eval 0.66] }
7... O-O { [%txt "On roque."] [%eval 0.63] [%csl Gg8] }
8. Qd2 { [%txt "La dame se prépare pour Bh6."] [%eval 0.66] }
8... Nc6 { [%txt "Le cavalier frappe d4."] [%eval 0.70] [%cal Gc6d4] }
9. Nxc6 { [%txt "LA FAUSSE VARIANTE D'ÉCHANGE : les Blancs échangent sans raison. Ils renforcent notre centre."] [%hint "On n'échange pas un cavalier central actif sans gain : l'échange développe le camp adverse."] [%hint "Le pion b7 va reprendre en c6 : il soutiendra d5, et la colonne b s'ouvrira contre b2."] [%hint "bxc6 ! On reprend vers le centre."] [%hintcsl Gc6,Gd5,Rb2] [%eval -0.24] }
9... bxc6 { [%txt "On reprend VERS LE CENTRE : le pion c6 soutient d5 et la colonne b s'ouvre contre b2."] [%eval -0.29] [%csl Gc6,Gd5] [%cal Gb8b2,Gc6d5] }
10. O-O-O { [%txt "Les Blancs roquent quand même du côté de notre colonne b."] [%eval -0.85] [%csl Rb2] }
(10. e5 { [%txt "Les Blancs chassent le cavalier f6, mais le pion e5 est mal soutenu."] [%hint "Le pion e5 avance sans soutien : seul le pion f n'est pas là pour le défendre."] [%hint "La case d5 : le cavalier f6 y est à l'abri, et notre pion c6 le soutient."] [%hint "Nd5 ! Le cavalier saute au centre et le pion e5 tombera."] [%hintcsl Gd5,Re5] [%eval -1.12] }
  10... Nd5 { [%txt "Le cavalier s'installe au centre (environ -1.1)."] [%eval -1.14] [%csl Gd5] [%cal Gd5c3,Gd5e3] }
  11. Nxd5 { [%txt "Les Blancs échangent."] [%eval -0.99] }
  11... cxd5 { [%txt "On reprend : pion d5 et colonne c ouverte."] [%eval -1.03] [%cal Gg7e5] }
  12. Qxd5 { [%txt "Les Blancs prennent un pion."] [%eval -0.99] }
  12... Rb8 { [%txt "À RETENIR.

PRO TIP : environ -1.1. La tour vise b2 et le pion e5 tombera : Bxe5 et Rxb2 sont dans l'air. Quand l'adversaire pousse e5 trop tôt, le fou g7 et la colonne b font le travail."] [%eval -1.06] [%csl Re5,Rb2] [%cal Gb8b2,Gg7e5] })
(10. Bc4 { [%txt "Le fou contrôle d5."] [%eval -0.28] }
  10... Qa5 { [%txt "La dame vise c3 et a2 et prépare ...Nd7."] [%eval -0.22] [%cal Ga5c3] }
  11. O-O { [%txt "Le roi à l'aile roi."] [%eval -0.22] }
  11... Nd7 { [%txt "À RETENIR.

PRO TIP : environ -0.2. Le cavalier va en c5 ou e5, et ...Rb8 viendra contre b2."] [%eval -0.27] [%cal Gd7c5,Ga8b8] })
10... Be6 { [%txt "LE BON COUP : on contrôle d5 et c4 avant de pousser. Notre fou e6 prépare ...d5 et ...Qa5."] [%eval -0.93] [%csl Gd5] [%cal Ge6d5,Ge6a2] }
(10... d5 { [%txt "L'erreur à éviter : la poussée prématurée."] [%hint "On pousse au centre avant d'avoir terminé le développement."] [%hint "La case h6 : le fou e3 et la dame d2 vont échanger notre fou g7, le gardien du roi."] [%hint "Be6 ! On développe d'abord ; ...d5 attendra."] [%hintcsl Rh6,Rg7] [%eval 0.50] }
  11. Bh6 { [%txt "Les Blancs échangent notre fou g7. Environ +0.4."] [%eval 0.50] [%cal Gh6g7] }
  11... Qb6 { [%txt "La dame vise b2."] [%eval 0.75] }
  12. Bxg7 { [%txt "Les Blancs éliminent le dragon."] [%eval 0.46] }
  12... Kxg7 { [%txt "À RETENIR.

PRO TIP : environ +0.6 pour les Blancs. Sans le fou g7, notre roi est nu et le pion d5 attaqué : la poussée trop précoce a rendu l'avantage."] [%eval 0.44] [%csl Rg7] })
11. Bh6 { [%txt "Les Blancs proposent l'échange des fous pour attaquer notre roi."] [%eval -0.82] [%cal Gh6g7] }
11... Bxh6 { [%txt "On prend le premier : la dame blanche va en h6, mais elle y sera seule."] [%eval -0.81] [%cal Gg7h6] }
12. Qxh6 { [%txt "La dame blanche s'installe en h6, loin de son roi."] [%eval -0.77] }
12... Qb6 { [%txt "LA CONTRE-ATTAQUE : la dame vise b2, appuyée par la colonne b ouverte."] [%eval -0.77] [%csl Rb2] [%cal Gb6b2] }
13. h4 { [%txt "Les Blancs veulent h5 et Ng5 contre h7."] [%eval -0.81] }
13... Rfb8 { [%txt "Deux pièces lourdes sur b2 : c'est nous qui menaçons le mat en premier."] [%eval -0.87] [%cal Gb8b2,Gb6b2] }
14. b3 { [%txt "Les Blancs bouchent la colonne b."] [%eval -0.80] }
14... Qb4 { [%txt "À RETENIR.

PRO TIP : environ -0.9. La dame vise c3 et a3, et ...a5-a4 ouvrira l'aile dame. Contre la fausse variante d'échange, on développe d'abord (...Be6), on laisse la dame blanche partir en h6 et on frappe b2 par la colonne b."] [%eval -0.81] [%csl Rb2,Rc3] [%cal Gb4c3,Ga7a4] } *`,
    ),
    chapter(
      "Anti-panique : les attaques prématurées g4 et h4",
      `{ [%txt "LE CHAPITRE ANTI-PANIQUE.

Les joueurs de club adorent pousser g4 et h4 contre le Dragon, mais SANS avoir roqué. Leur roi reste en e1, au milieu de l'échiquier.

La règle géométrique : quand l'adversaire attaque à l'aile, on contre-attaque au CENTRE. Le levier ...d5 ouvre les colonnes devant le roi e1 et nos pièces (fou g7, dame) arrivent plus vite que leur attaque.

Les trois cas :
- 8.g4 et 9.h4 avec le roi en e1 : 9...d5! (environ -1.7 après 10.exd5).
- 7.h4 et 8.h5 : on prend le pion, et 9.Rxh5? gxh5 donne une tour pour rien.
- 7.Qd2 (sans f3) : 7...Ng4! chasse le fou e3. Attention au faux piège 9...g5 10.Bg3 Bxd4? 11.Qxd4 qui PERD pour les Noirs (environ +1.6)."] [%eval 0.42] }
1. e4 { [%txt "Le pion roi."] [%eval 0.37] }
1... c5 { [%txt "La Sicilienne."] [%eval 0.46] [%cal Gc5d4] }
2. Nf3 { [%txt "Le cavalier prépare d4."] [%eval 0.42] }
2... d6 { [%txt "Le pion d6 contrôle e5."] [%eval 0.35] [%csl Ge5] }
3. d4 { [%txt "La Sicilienne ouverte."] [%eval 0.38] }
3... cxd4 { [%txt "La colonne c s'ouvre."] [%eval 0.38] [%cal Gc8c1] }
4. Nxd4 { [%txt "Le cavalier reprend."] [%eval 0.48] }
4... Nf6 { [%txt "On attaque e4."] [%eval 0.40] [%cal Gf6e4] }
5. Nc3 { [%txt "Le cavalier défend e4."] [%eval 0.39] }
5... g6 { [%txt "Le Dragon."] [%eval 0.76] [%cal Gf8g7] }
6. Be3 { [%txt "Le fou vise h6."] [%eval 0.60] }
6... Bg7 { [%txt "Le fou sur la grande diagonale."] [%eval 0.60] [%cal Gg7d4] }
7. f3 { [%txt "Le pion soutient e4."] [%eval 0.66] }
(7. Qd2 { [%txt "Sans f3, le fou e3 n'est plus protégé contre ...Ng4."] [%hint "On développe la dame avant d'avoir protégé le fou e3 : la case g4 n'est contrôlée par personne."] [%hint "La case g4 : notre cavalier f6 y saute et attaque le fou e3."] [%hint "Ng4 ! On chasse le fou."] [%hintcsl Gg4,Re3] [%eval 0.36] }
  7... Ng4 { [%txt "On chasse le fou e3."] [%eval 0.33] [%csl Gg4] [%cal Gg4e3] }
  8. Bg5 { [%txt "Le fou s'écarte."] [%eval 0.38] }
  8... h6 { [%txt "On chasse le fou encore une fois."] [%eval 0.40] [%cal Gh6g5] }
  9. Bh4 { [%txt "Le fou garde la diagonale d8-h4."] [%eval 0.33] }
  9... Nc6 { [%txt "Le bon coup : on frappe d4. Le faux piège 9...g5 10.Bg3 Bxd4? 11.Qxd4 perd pour les Noirs (environ +1.6)."] [%eval 0.30] [%cal Gc6d4,Gg7d4] }
  10. Nb3 { [%txt "Le cavalier recule."] [%eval 0.34] }
  10... Be6 { [%txt "À RETENIR.

PRO TIP : environ +0.4, jeu équilibré et facile. Contre 7.Qd2, ...Ng4 oblige le fou à tourner en rond ; mais on ne poursuit pas avec ...g5 et ...Bxd4 sans calcul."] [%eval 0.30] [%cal Ge6c4] })
(7. h4 { [%txt "Les Blancs attaquent avant d'avoir roqué."] [%eval 0.18] }
  7... Nc6 { [%txt "On développe et on frappe d4."] [%eval 0.10] [%cal Gc6d4] }
  8. h5 { [%txt "Les Blancs poussent encore."] [%hint "On attaque à l'aile avec le roi au centre et sans avoir développé."] [%hint "Le pion h5 n'est défendu que par la tour h1."] [%hint "Nxh5 ! On prend le pion."] [%hintcsl Rh5] [%eval -0.34] }
  8... Nxh5 { [%txt "On prend le pion : il n'est défendu que par la tour."] [%eval -0.33] [%cal Gf6h5] }
  9. Rxh5 { [%txt "Le faux sacrifice : les Blancs donnent la qualité pour ouvrir la colonne h."] [%hint "Un sacrifice sans pièce pour suivre : ni dame, ni fou, ni cavalier n'arrive sur la colonne h."] [%hint "La tour h5 est offerte : le pion g6 la prend."] [%hint "gxh5 ! On prend la tour."] [%hintcsl Rh5] [%eval -1.42] }
  9... gxh5 { [%txt "On prend la tour (environ -1.4)."] [%eval -1.35] [%cal Gg6h5] }
  10. Nxc6 { [%txt "Les Blancs échangent."] [%eval -1.34] }
  10... bxc6 { [%txt "On reprend."] [%eval -1.47] }
  11. Qxh5 { [%txt "À RETENIR.

PRO TIP : environ -1.4. Les Blancs ont un pion pour la qualité et aucune attaque. Pas de panique devant h4-h5 : tant que le roi blanc est au centre, on prend ce qu'on nous donne."] [%eval -1.53] [%csl Rh5] })
7... O-O { [%txt "On roque."] [%eval 0.63] [%csl Gg8] }
8. g4 { [%txt "Les Blancs poussent g4 sans avoir roqué ni joué Qd2."] [%eval 0.60] [%cal Gg4g5] }
8... Nc6 { [%txt "On développe et on frappe d4."] [%eval 0.45] [%cal Gc6d4] }
9. h4 { [%txt "L'erreur : une deuxième poussée de pion avec le roi en e1."] [%hint "On attaque à l'aile avec le roi encore au centre et sans avoir développé."] [%hint "La case d5 : notre pion d6 peut y pousser et ouvrir le centre, devant le roi e1."] [%hint "d5 ! On ouvre le centre."] [%hintcsl Gd5,Re1] [%eval -0.70] }
9... d5 { [%txt "LA PUNITION GÉOMÉTRIQUE : on ouvre le centre. Le roi blanc en e1 va se retrouver sur des colonnes ouvertes."] [%eval -0.54] [%csl Gd5,Re1] [%cal Gd5e4,Gd8d4] }
10. exd5 { [%txt "Les Blancs prennent."] [%eval -1.72] }
(10. g5 { [%txt "Les Blancs chassent le cavalier f6."] [%eval -0.49] }
  10... Nh5 { [%txt "Le cavalier se place au bord, mais il frappe g3 et f4."] [%eval -0.45] [%cal Gh5g3] }
  11. exd5 { [%txt "Les Blancs prennent."] [%eval -0.38] }
  11... Nxd4 { [%txt "À RETENIR.

PRO TIP : environ -0.4. On récupère le pion d5 au prochain coup avec la dame, et le roi e1 reste sur une colonne ouverte. Même quand les Blancs refusent d'ouvrir (10.g5), le centre ouvert profite au camp le mieux développé."] [%eval -0.03] [%cal Gd8d5,Gc6d4] })
10... Nxd5 { [%txt "Le cavalier reprend. Le fou g7 vise d4, la dame vise d5 et d4."] [%eval -1.77] [%cal Gg7d4,Gd8d4] }
11. Nxd5 { [%txt "Les Blancs échangent."] [%eval -1.83] }
11... Qxd5 { [%txt "La dame reprend avec une triple menace sur d4, b2 et la diagonale vers le roi."] [%eval -2.04] [%csl Gd5] [%cal Gd5d4,Gg7d4] }
(11... Nxd4 { [%txt "La reprise imprécise."] [%hint "On échange le cavalier qui gêne les Blancs au lieu d'amener la dame au centre."] [%hint "La case d5 : notre dame y reprend avec tempo sur le cavalier d4."] [%hint "Qxd5 ! La dame reprend au centre."] [%hintcsl Gd5] [%eval 0.23] }
  12. Bxd4 { [%txt "Les Blancs reprennent ; environ +0.3, l'avantage a disparu."] [%eval 0.23] [%cal Gd4g7] })
12. Nxc6 { [%txt "Les Blancs échangent pour éviter la pression sur d4."] [%eval -2.41] }
12... Qxc6 { [%txt "À RETENIR.

PRO TIP : environ -2.3. Le roi e1 n'a plus d'abri, nos pièces visent b2 et c3, et les pions g4 et h4 sont des faiblesses. Contre g4-h4 avec le roi au centre, la réponse est toujours ...d5."] [%eval -2.46] [%csl Re1,Gc6] [%cal Gc6c2,Gg7b2] } *`,
    ),
    chapter(
      "Aléatoire surprise : la course au mat mal calculée",
      `{ [%txt "L'ALÉATOIRE SURPRISE.

On reprend la Soltis du chapitre 1 juste après 14...Re8. Les Blancs, un joueur de club, vont jouer trois imprécisions typiques : une poussée qui donne la case c4, une dame qui recule dans la passivité, puis un sacrifice mal calculé.

Méthode à chaque faute : 1. quel principe est violé ? 2. quelle case est faible ? 3. quel coup noir l'exploite ? Les indices s'allument dans cet ordre."] [%eval 0.42] }
1. e4 { [%txt "Le pion roi."] [%eval 0.37] }
1... c5 { [%txt "La Sicilienne."] [%eval 0.46] [%cal Gc5d4] }
2. Nf3 { [%txt "Le cavalier prépare d4."] [%eval 0.42] }
2... d6 { [%txt "Le pion d6 contrôle e5."] [%eval 0.35] [%csl Ge5] }
3. d4 { [%txt "La Sicilienne ouverte."] [%eval 0.38] }
3... cxd4 { [%txt "La colonne c s'ouvre."] [%eval 0.38] [%cal Gc8c1] }
4. Nxd4 { [%txt "Le cavalier reprend."] [%eval 0.48] }
4... Nf6 { [%txt "On attaque e4."] [%eval 0.40] [%cal Gf6e4] }
5. Nc3 { [%txt "Le cavalier défend e4."] [%eval 0.39] }
5... g6 { [%txt "Le Dragon."] [%eval 0.76] [%cal Gf8g7] }
6. Be3 { [%txt "L'Attaque Yougoslave."] [%eval 0.60] }
6... Bg7 { [%txt "Le fou sur la grande diagonale."] [%eval 0.60] [%cal Gg7d4] }
7. f3 { [%txt "Le pion soutient e4."] [%eval 0.66] }
7... O-O { [%txt "On roque."] [%eval 0.63] [%csl Gg8] }
8. Qd2 { [%txt "La dame vise h6."] [%eval 0.66] }
8... Nc6 { [%txt "Le cavalier frappe d4."] [%eval 0.70] [%cal Gc6d4] }
9. Bc4 { [%txt "Le fou vise f7."] [%eval 0.51] }
9... Bd7 { [%txt "On libère c8."] [%eval 0.69] [%cal Ga8c8] }
10. O-O-O { [%txt "Roques opposés."] [%eval 0.59] }
10... Rc8 { [%txt "La colonne c."] [%eval 0.64] [%cal Gc8c3] }
11. Bb3 { [%txt "Le fou s'abrite."] [%eval 0.53] }
11... Ne5 { [%txt "Le cavalier vise c4."] [%eval 0.90] [%cal Ge5c4] }
12. h4 { [%txt "Le pion h avance."] [%eval 0.76] }
12... h5 { [%txt "La Soltis."] [%eval 0.77] [%csl Gh5] }
13. Bg5 { [%txt "Le fou vise f6."] [%eval 0.43] }
13... Rc5 { [%txt "La tour sur la 5e rangée."] [%eval 0.54] [%cal Gc5c3] }
14. Kb1 { [%txt "Le roi s'écarte."] [%eval 0.41] }
14... Re8 { [%txt "Fin de la théorie : à partir d'ici, chaque coup se calcule."] [%eval 0.48] [%cal Ge8e7] }
15. g4 { [%txt "Le sacrifice de pion thématique (14.Bh6 était un peu plus précis)."] [%eval 0.25] }
15... hxg4 { [%txt "On prend."] [%eval 0.00] [%cal Gh5g4] }
16. h5 { [%txt "Les Blancs ouvrent la colonne h en sacrifiant un second pion."] [%eval -0.08] }
16... Nxh5 { [%txt "On prend : le cavalier h5 bouche la colonne h."] [%eval 0.00] [%csl Gh5] [%cal Gf6h5] }
17. f4 { [%txt "Les Blancs chassent le cavalier e5, mais la case c4 se libère pour lui."] [%hint "On pousse un pion de l'aile roi au lieu de remettre une pièce dans l'attaque (17.Rxh5 gardait l'équilibre)."] [%hint "La case c4 : notre cavalier y saute et attaque la dame d2 et le pion b2."] [%hint "Nc4 ! Le cavalier attaque la dame avec gain de temps."] [%hintcsl Gc4,Rd2,Rb2] [%eval -1.00] }
17... Nc4 { [%txt "Le cavalier attaque la dame d2 avec gain de temps."] [%eval -1.02] [%csl Gc4] [%cal Gc4d2,Gc4b2] }
18. Qc1 { [%txt "La dame recule dans un coin passif : elle ne participe plus à l'attaque et c3 n'est plus défendu."] [%hint "Une dame passive dans une course au mat : chaque recul est un temps perdu."] [%hint "Le cavalier c3 : il n'est plus défendu que par le pion b2, et notre fou g7 et notre tour c5 le visent déjà."] [%hint "Qa5 ! La dame rejoint l'attaque sur c3 et a2."] [%hintcsl Rc3,Rb2] [%eval -1.55] }
18... Qa5 { [%txt "La dame rejoint l'attaque : quatre pièces visent c3 et b2."] [%eval -1.86] [%cal Ga5c3,Gc5c3,Gg7c3] }
19. Nd5 { [%txt "Les Blancs bloquent la colonne c avec le cavalier."] [%eval -2.03] [%cal Gd5e7] }
19... e6 { [%txt "On chasse le cavalier d5."] [%eval -1.85] [%cal Ge6d5] }
20. Nf5 { [%txt "LE SACRIFICE MAL CALCULÉ : les Blancs offrent un cavalier pour ouvrir notre roi."] [%hint "Un sacrifice sans renfort : aucune pièce blanche ne peut suivre sur la colonne h, bouchée par notre cavalier h5."] [%hint "Le cavalier f5 n'est défendu que par le pion e4 ; le pion e6 peut le prendre."] [%hint "exf5 ! On prend la pièce."] [%hintcsl Rf5,Gh5] [%eval -4.02] }
20... exf5 { [%txt "On prend le cavalier : il n'y a rien derrière (environ -3.5)."] [%eval -4.12] [%cal Ge6f5] }
21. Ne3 { [%txt "Le dernier cavalier blanc recule."] [%eval -4.52] }
21... Be6 { [%txt "À RETENIR.

PRO TIP : environ -4.8. Une pièce de plus, la colonne c ouverte, le fou e6 vise b3. Méthode contre un sacrifice : compter les pièces qui peuvent SUIVRE ; si la colonne est bouchée (ici par le cavalier h5), on prend sans crainte."] [%eval -4.67] [%csl Gh5,Rb3] [%cal Ge6b3,Ga5a2] } *`,
    ),
  ],
};
