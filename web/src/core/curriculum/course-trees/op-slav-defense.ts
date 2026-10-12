import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours d'ouverture « Défense Slave (avec les Noirs) » : 1.d4 d5 2.c4 c6 —
 * onglet Ouvertures, format « un commentaire par coup » de l'Académie, lu
 * par `CourseTreeViewer` (route `/ouvertures/slav-defense/cours`). Public
 * visé : 1500-1800 Elo.
 *
 * ## Contenu (2026-10-12)
 *
 * 1. Fiche d'identité et tronc commun 3.Nf3 Nf6 4.Nc3 dxc4 (Slave Tchèque)
 *    5.a4 Bf5 ; 4...e6 (Semi-Slave, fou c8 enfermé), 4...Bf5? 5.cxd5 cxd5
 *    6.Qb3, 5.e3 b5, et le sacrifice 6.Ne5 e6 7.f3 Bb4 8.e4 Bxe4.
 * 2. Ligne principale 6.e3 e6 7.Bxc4 Bb4 8.O-O O-O 9.Qe2 Nbd7 10.e4 Bg6
 *    11.Bd3 Bh5 12.e5 Nd5 jusqu'au coup 14, puis un milieu de jeu de club
 *    (15.h4? Bxh4, 21.g4? f5) ; 9.e4? Nxe4 et 9.Nh4 Bg6.
 * 3. Variante d'Échange 3.cxd5 cxd5 jusqu'à la finale symétrique (0.00),
 *    avec 7.Qb3 Na5.
 * 4. Anti-panique : 3.e3 Bf5 (coup correct, environ +0.3, avec 4.cxd5 cxd5
 *    5.Qb3 Qd7 et 4.Qb3 Qc7), 3.e4 dxe4, 3.Nf3 Nf6 4.e4? et le gambit
 *    4.Nc3 dxc4 5.e4 b5.
 * 5. Aléatoire surprise : 8.Nd2? (le cavalier rejoue) puni par 8...c5 puis
 *    le pion isolé d4 (7 coups après la faute).
 *
 * Indices progressifs : chaque faute blanche porte trois balises `[%hint]`
 * (1. principe violé, 2. faiblesse, 3. action de punition) et une balise
 * `[%hintcsl]` (cases allumées à partir du 2e indice).
 *
 * Sources : Glenn Flear, « The Slav for the Tournament Player » (Batsford
 * 1988, `docs/`, couche texte) pour la ligne hollandaise 8.O-O O-O 9.Qe2 ;
 * « The Slav Move by Move » (Lakdawala) et « The Complete Semi-Slav » sont
 * des scans sans couche texte. Toutes les lignes sont arbitrées par
 * Stockfish 18 natif (profondeur 16) ; le moteur a corrigé deux idées
 * reçues : 3.e3 n'est pas une faute (+0.26), et 4...dxc4 (+0.5) est un peu
 * moins précis que 4...e6 (+0.35), ce que le cours dit honnêtement. Toute la
 * prose est originale.
 *
 * ## Architecture technique des nœuds
 *
 * Voir `op-scotch-game.ts` : `evaluationScore` / `evaluationMate` (balise
 * `[%eval]`), `showEvalBar`, `freeze` (balise `[%txt "…"]` sur CHAQUE
 * commentaire), plus `hints` / `hintHighlights`.
 *
 * Fichier GÉNÉRÉ : ne pas l'éditer à la main. Source commentée :
 * `scripts/opening-course-src/slav-defense.pgn` (et l'en-tête
 * `slav-defense.header.txt`) ; regénérer avec
 * `node --import tsx scripts/_tmp-build-opening-course.mts <source> <en-tête> <sortie> 16 [pgn compilé]`.
 * Règles de l'utilisateur : SAN en texte brut uniquement (jamais de figurine
 * Unicode), pas de guillemet droit dans un `[%txt]` ni un `[%hint]`.
 */

function chapter(title: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, START) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const OP_SLAV_DEFENSE: CourseTree = {
  chapters: [
    chapter(
      "Fiche d'identité et tronc commun : 4...dxc4, la Slave Tchèque",
      `{ [%txt "LA DÉFENSE SLAVE, AVEC LES NOIRS.

Le vrai enjeu : défendre d5 avec le pion c6 au lieu du pion e6. La diagonale c8-h3 reste ouverte, donc notre fou c8 peut sortir en f5 ou en g4 AVANT que l'on joue ...e6. C'est le gros défaut du Gambit Dame Refusé que la Slave corrige.

Le prix à payer : le pion c6 enlève la case naturelle du cavalier b8, et pendant que le fou sort, l'aile dame (b7) reste un peu fragile. Toute l'ouverture tourne autour de ces deux idées : sortir le fou c8 d'abord, surveiller b7 ensuite.

Honnêteté moteur : la Slave ne réfute rien. Stockfish 18 donne aux Blancs leur petit avantage normal du trait (environ +0.3 à +0.5) dans toutes les lignes principales. L'objectif est une position saine, sans faiblesse, que l'on comprend mieux que l'adversaire.

Les structures types (relevées sur la position finale de chaque chapitre) :
- Tchèque (chapitres 1 et 2) : Blancs a4-b2-d4-e5 contre Noirs a7-b7-d5-e6 ; le pion d5 bloque, nos pièces visent la colonne c.
- Échange (chapitre 3) : structure symétrique a-b-d5-e6 contre a-b-d4-e3, colonne c ouverte des deux côtés.
- Anti-panique (chapitre 4) : on garde le fou f5 hors de la chaîne et on punit les pions qui avancent trop tôt."] [%eval 0.37] }
1. d4 { [%txt "Les Blancs occupent le centre avec le pion dame."] [%eval 0.29] }
1... d5 { [%txt "On répond symétriquement et on bloque l'avance d4-d5."] [%eval 0.30] [%csl Gd5] [%cal Gd5d4] }
2. c4 { [%txt "Le Gambit Dame : les Blancs attaquent d5 sur le côté."] [%eval 0.34] }
2... c6 { [%txt "Le coup de la Slave : d5 est défendu par un pion, et la diagonale du fou c8 reste libre."] [%eval 0.39] [%csl Gc6,Gd5] [%cal Gc8h3] }
3. Nf3 { [%txt "L'ordre de coups le plus fréquent : le cavalier contrôle e5 et empêche le contre ...e5."] [%eval 0.40] }
3... Nf6 { [%txt "Développement : le cavalier défend d5 une deuxième fois et contrôle e4."] [%eval 0.43] [%cal Gf6d5,Gf6e4] }
4. Nc3 { [%txt "Les Blancs ajoutent un troisième attaquant sur d5 et préparent e4."] [%eval 0.36] }
4... dxc4 { [%txt "LA SLAVE TCHÈQUE : on prend le pion c4. Les Blancs devront perdre un temps pour le récupérer, et notre fou c8 ira en f5 avant ...e6. Évaluation honnête : environ +0.5 pour les Blancs, leur avantage normal."] [%eval 0.50] [%csl Gc4] [%cal Gc8f5] }
(4... e6 { [%txt "La Semi-Slave : objectivement très bonne (environ +0.3), mais à notre niveau c'est une structure d'étouffement : le pion e6 ferme la diagonale c8-h3 et le fou c8 n'a plus de sortie."] [%eval 0.37] [%csl Rc8,Ge6] [%cal Rc8h3] }
  5. e3 { [%txt "Les Blancs jouent simple."] [%eval 0.27] }
  5... Nbd7 { [%txt "Le cavalier sort, mais il bouche encore plus le fou c8."] [%eval 0.28] [%csl Rc8] }
  6. Qc2 { [%txt "La dame prépare e4."] [%eval 0.19] }
  6... Bd6 { [%txt "Le fou f8 sort, lui."] [%eval 0.30] [%cal Gd6h2] }
  7. Bd3 { [%txt "Le fou blanc vise h7."] [%eval 0.31] }
  7... O-O { [%txt "Roque."] [%eval 0.28] [%csl Gg8] }
  8. O-O { [%txt "Les Blancs roquent : position à peine favorable aux Blancs (environ +0.2), mais notre fou c8 attend encore un ...dxc4 et ...e5 pour respirer. Retenir : la Semi-Slave exige un plan précis pour libérer ce fou, la Tchèque le règle dès le coup 5."] [%eval 0.26] [%csl Rc8] })
(4... Bf5 { [%txt "Le fou sort trop tôt, avant ...dxc4 : b7 est abandonné."] [%eval 0.76] [%csl Rb7] }
  5. cxd5 { [%txt "Les Blancs ouvrent la diagonale de la dame vers b7."] [%eval 0.62] }
  5... cxd5 { [%txt "Reprise naturelle."] [%eval 0.86] [%csl Gd5] }
  6. Qb3 { [%txt "La dame attaque b7 ET d5 en même temps."] [%eval 0.82] [%cal Rb3b7,Rb3d5] }
  6... Bc8 { [%txt "Le fou doit rentrer pour défendre b7 : deux temps perdus, environ +0.8. Retenir : dans la Slave, on prend c4 d'abord, le fou sort ensuite."] [%eval 0.87] [%csl Rc8] })
5. a4 { [%txt "Le coup principal : les Blancs empêchent ...b5, qui garderait le pion c4. Le prix : la case b4 devient un trou pour nos pièces."] [%eval 0.43] [%csl Gb4] }
(5. e3 { [%txt "Le coup naturel de club, mais il laisse le pion c4 protégé par ...b5."] [%hint "Les Blancs se développent sans empêcher ...b5 : le pion c4 que nous avons pris peut être gardé."] [%hint "La case b5 : le pion b7 y soutient c4, et ensuite ...b4 chassera le cavalier c3."] [%hint "b5 ! puis ...b4 avec gain de temps sur le cavalier c3."] [%hintcsl Gb5,Gc4] [%eval -0.19] }
  5... b5 { [%txt "On garde le pion."] [%eval -0.18] [%csl Gc4] [%cal Gb5c4] }
  6. a4 { [%txt "Les Blancs attaquent la chaîne."] [%eval -0.02] }
  6... b4 { [%txt "On avance avec gain de temps sur le cavalier c3."] [%eval -0.14] [%cal Gb4c3] }
  7. Na2 { [%txt "Le cavalier recule au bord."] [%eval -0.25] }
  7... e6 { [%txt "On ouvre la diagonale du fou f8."] [%eval -0.28] [%cal Gf8c5] }
  8. Bxc4 { [%txt "Les Blancs récupèrent le pion, mais le cavalier a2 est hors jeu : les Noirs sont légèrement mieux (environ -0.3)."] [%eval -0.25] [%csl Ra2] })
5... Bf5 { [%txt "L'idée de la Slave Tchèque : le fou c8 sort AVANT ...e6. Il contrôle e4 et pèsera sur la diagonale b1-h7."] [%eval 0.52] [%csl Gf5] [%cal Gf5b1,Gf5e4] }
6. e3 { [%txt "Le plan le plus solide : les Blancs ouvrent la diagonale de leur fou f1 pour reprendre c4. Suite au chapitre 2."] [%eval 0.45] }
(6. Ne5 { [%txt "Le plan agressif : le cavalier vise c4 et prépare f3 et e4."] [%eval 0.52] [%cal Ge5c4] }
  6... e6 { [%txt "On ouvre la diagonale du fou f8 vers b4."] [%eval 0.54] [%cal Gf8b4] }
  7. f3 { [%txt "Les Blancs préparent e4 pour chasser le fou f5."] [%eval 0.55] }
  7... Bb4 { [%txt "Le fou cloue le cavalier c3 : si e4, la case e4 est moins bien défendue."] [%eval 0.48] [%cal Gb4c3,Gb4e1] }
  8. e4 { [%txt "Les Blancs poussent quand même."] [%eval 0.49] }
  8... Bxe4 { [%txt "Le sacrifice thématique de la Tchèque : le fou contre deux pions."] [%eval 0.46] [%cal Gf5e4] }
  9. fxe4 { [%txt "Les Blancs acceptent."] [%eval 0.44] }
  9... Nxe4 { [%txt "Deux pions pour la pièce, le roi blanc est exposé."] [%eval 0.49] [%cal Ge4c3,Ge4g3] }
  10. Bd2 { [%txt "Les Blancs défendent c3."] [%eval 0.50] }
  10... Qxd4 { [%txt "La dame prend le troisième pion."] [%eval 0.50] [%csl Gd4] [%cal Gd4f2] }
  11. Nxe4 { [%txt "Les Blancs éliminent le cavalier."] [%eval 0.48] }
  11... Qxe4+ { [%txt "Reprise avec échec."] [%eval 0.59] [%cal Ge4e1] }
  12. Qe2 { [%txt "Interposition."] [%eval 0.42] }
  12... Bxd2+ { [%txt "On échange le fou défenseur."] [%eval 0.44] [%cal Gb4d2] }
  13. Kxd2 { [%txt "Le roi reprend."] [%eval 0.39] }
  13... Qd5+ { [%txt "Échec, la dame se replie au centre : trois pions pour la pièce et un roi blanc à découvert, position dynamique (environ +0.5). Ligne de théorie pure, à jouer seulement si on la connaît par coeur."] [%eval 0.48] [%cal Gd5d2] })
6... e6 { [%txt "On ferme la chaîne DERRIÈRE le fou f5 : c'est l'esprit de la Slave."] [%eval 0.40] [%csl Gf5,Ge6] [%cal Gf8b4] }
7. Bxc4 { [%txt "Les Blancs récupèrent le pion : position classique, environ +0.5."] [%eval 0.47] }
7... Bb4 { [%txt "Le fou occupe le trou b4 créé par 5.a4 et cloue le cavalier c3, gardien de e4. Les Blancs ont un petit avantage d'espace, nos pièces sont toutes actives. Suite au chapitre 2."] [%eval 0.37] [%csl Gb4] [%cal Gb4c3] } *`,
    ),
    chapter(
      "La Ligne Principale : 5.a4 Bf5 6.e3 e6 7.Bxc4 Bb4 8.O-O O-O",
      `{ [%txt "LA LIGNE PRINCIPALE, ET CE QUI SE PASSE APRÈS LA THÉORIE.

Notre schéma : le fou f5 hors de la chaîne, le fou b4 dans le trou de 5.a4, le roque, puis ...Nbd7. Le plan blanc est toujours le même : préparer e4 pour chasser le fou f5 et gagner de l'espace.

La théorie officielle s'arrête vers le coup 14. Ensuite, nous simulons un milieu de partie de club : les Blancs, mécontents d'une position calme, lancent une attaque à l'aile roi avec h4 et g4. On verra que notre structure d5-e6 et nos deux fous encaissent sans difficulté.

Variante : la poussée e4 prématurée 9.e4?, qui coûte un pion et plus."] [%eval 0.37] }
1. d4 { [%txt "Le pion dame."] [%eval 0.29] }
1... d5 { [%txt "Symétrie."] [%eval 0.30] [%csl Gd5] }
2. c4 { [%txt "Le Gambit Dame."] [%eval 0.34] }
2... c6 { [%txt "La Slave."] [%eval 0.39] [%csl Gc6] [%cal Gc8h3] }
3. Nf3 { [%txt "Le cavalier roi."] [%eval 0.40] }
3... Nf6 { [%txt "Développement."] [%eval 0.43] [%cal Gf6e4] }
4. Nc3 { [%txt "Le cavalier dame."] [%eval 0.36] }
4... dxc4 { [%txt "La Tchèque."] [%eval 0.50] [%csl Gc4] }
5. a4 { [%txt "Contre ...b5."] [%eval 0.43] }
5... Bf5 { [%txt "Le fou d'abord."] [%eval 0.52] [%cal Gf5b1] }
6. e3 { [%txt "Les Blancs ouvrent la diagonale f1-c4."] [%eval 0.45] }
6... e6 { [%txt "La chaîne derrière le fou."] [%eval 0.40] [%csl Ge6] }
7. Bxc4 { [%txt "Les Blancs récupèrent le pion."] [%eval 0.47] }
7... Bb4 { [%txt "Le fou dans le trou b4, il cloue le cavalier c3."] [%eval 0.37] [%csl Gb4] [%cal Gb4c3] }
8. O-O { [%txt "Les Blancs roquent."] [%eval 0.35] }
8... O-O { [%txt "On roque aussi : il faut mettre le roi à l'abri avant que le centre s'ouvre."] [%eval 0.26] [%csl Gg8] }
9. Qe2 { [%txt "Le coup théorique : la dame soutient e4 et libère d1 pour une tour."] [%eval 0.24] [%cal Ge2e4] }
(9. e4 { [%txt "La poussée prématurée : le cavalier c3, seul défenseur de e4, est cloué par notre fou b4."] [%hint "Les Blancs poussent au centre alors que le cavalier c3, qui devait défendre e4, est cloué par notre fou b4."] [%hint "Le pion e4 : attaqué par le cavalier f6 et le fou f5, défendu seulement par un cavalier cloué."] [%hint "Nxe4 ! Le cavalier prend, et après Nxe4 Bxe4 nous gardons un pion de plus et nos deux fous."] [%hintcsl Re4,Rc3] [%eval -1.06] [%csl Re4,Rc3] }
  9... Nxe4 { [%txt "On prend avec le cavalier : il attaque c3 une deuxième fois."] [%eval -1.10] [%cal Gf6e4,Ge4c3] }
  10. Nxe4 { [%txt "Les Blancs échangent."] [%eval -1.58] }
  10... Bxe4 { [%txt "Un pion de plus, et le fou e4 attaque le cavalier f3."] [%eval -1.56] [%csl Ge4] [%cal Ge4f3] }
  11. Qe2 { [%txt "La dame attaque notre fou."] [%eval -1.52] }
  11... Bxf3 { [%txt "On élimine le défenseur de d4."] [%eval -1.54] [%cal Ge4f3] }
  12. Qxf3 { [%txt "Reprise forcée."] [%eval -1.45] }
  12... Qxd4 { [%txt "Le pion d4 tombe aussi : deux pions de plus pour nous."] [%eval -1.58] [%csl Gd4] }
  13. Qe2 { [%txt "La dame recule."] [%eval -1.74] }
  13... Qf6 { [%txt "La dame se replie et garde b2 dans le viseur."] [%eval -1.72] [%cal Gf6b2] }
  14. Bd3 { [%txt "Les Blancs regroupent."] [%eval -1.82] }
  14... a5 { [%txt "On fixe le pion a4 et on garde le fou b4 solide : environ -1.7, les Noirs gagnent. Retenir : avant de pousser e4, vérifie qui défend la case."] [%eval -1.68] [%csl Gb4] })
(9. Nh4 { [%txt "Les Blancs chassent le fou f5 pour gagner la paire de fous."] [%eval 0.23] [%cal Gh4f5] }
  9... Bg6 { [%txt "Le fou recule sur g6 : s'il est pris, on reprend vers le centre avec le pion h."] [%eval 0.36] [%cal Gg6b1] }
  10. Nxg6 { [%txt "Les Blancs prennent."] [%eval 0.37] }
  10... hxg6 { [%txt "La colonne h s'ouvre et le roi garde un abri solide (f7-g6-g7). Honnêtement : les Blancs ont la paire de fous, environ +0.3, mais aucune cible dans notre camp."] [%eval 0.33] [%csl Gg6,Gg7] })
9... Nbd7 { [%txt "Le dernier cavalier sort et prépare ...e5 ou ...Nb6."] [%eval 0.43] [%cal Gd7e5,Gd7b6] }
10. e4 { [%txt "Ici e4 est possible : la dame e2 le soutient. Les Blancs gagnent de l'espace."] [%eval 0.47] }
10... Bg6 { [%txt "Le fou recule sur la diagonale b1-h7 : il restera actif et vise e4."] [%eval 0.48] [%cal Gg6e4] }
11. Bd3 { [%txt "Le fou soutient e4."] [%eval 0.44] }
11... Bh5 { [%txt "Le fou passe en h5 et cloue le cavalier f3 contre la dame e2."] [%eval 0.42] [%cal Gh5f3,Gh5e2] }
12. e5 { [%txt "Les Blancs chassent le cavalier f6 et gagnent de l'espace."] [%eval 0.41] }
12... Nd5 { [%txt "Le cavalier trouve la case centrale d5."] [%eval 0.45] [%csl Gd5] }
13. Nxd5 { [%txt "Les Blancs l'échangent."] [%eval 0.47] }
13... cxd5 { [%txt "On reprend avec le pion c : la colonne c s'ouvre pour nos tours."] [%eval 0.41] [%csl Gd5] [%cal Ga8c8] }
14. Qe3 { [%txt "La dame libère e2 et vise l'aile roi. Fin de la théorie : environ +0.4, l'avantage d'espace blanc."] [%eval 0.44] }
14... Be7 { [%txt "Le fou revient défendre l'aile roi : il couvre g5, h4 et d6."] [%eval 0.38] [%cal Ge7h4,Ge7g5] }
15. h4 { [%txt "MILIEU DE JEU DE CLUB : les Blancs veulent attaquer le roi avec h4-h5 ou Ng5. Mais le pion h4 n'est défendu que par le cavalier f3, lui-même cloué."] [%hint "Les Blancs attaquent à l'aile roi alors que leur cavalier f3, seul défenseur de h4, est cloué par notre fou h5."] [%hint "Le pion h4 : il n'est défendu que par le cavalier f3."] [%hint "Bxh4 ! Le fou e7 prend le pion : le cavalier f3 ne peut pas reprendre sans danger."] [%hintcsl Rh4,Rf3] [%eval 0.02] }
15... Bxh4 { [%txt "On prend le pion. Si 16.Nxh4 Qxh4, la position s'égalise (0.00) : l'attaque blanche est terminée."] [%eval -0.09] [%csl Gh4] [%cal Ge7h4] }
16. Bd2 { [%txt "Les Blancs continuent leur développement sans reprendre."] [%eval -0.10] }
16... Be7 { [%txt "Le fou rentre défendre le roi : un pion de plus, environ -0.2."] [%eval -0.16] [%cal Ge7g5] }
17. Rfc1 { [%txt "Les Blancs prennent la colonne c."] [%eval -0.37] }
17... Nb8 { [%txt "Le cavalier se dirige vers c6, sa meilleure case."] [%eval -0.34] [%cal Gb8c6] }
18. b4 { [%txt "Les Blancs gagnent de l'espace à l'aile dame."] [%eval -0.50] }
18... Nc6 { [%txt "Le cavalier attaque b4 et contrôle la colonne c."] [%eval -0.61] [%cal Gc6b4] }
19. Rab1 { [%txt "La tour défend b4."] [%eval -0.67] }
19... a6 { [%txt "On empêche b4-b5 qui chasserait le cavalier."] [%eval -0.59] [%csl Gb5] }
20. a5 { [%txt "Les Blancs bloquent l'aile dame."] [%eval -0.44] }
20... Bg6 { [%txt "Le fou propose l'échange du fou d3, le défenseur des cases blanches."] [%eval -0.51] [%cal Gg6d3] }
21. g4 { [%txt "Les Blancs jettent un pion de plus vers notre roi : ils affaiblissent surtout le leur."] [%hint "Les Blancs avancent encore un pion devant leur propre roi, sans pièce pour suivre."] [%hint "La case f4 et la diagonale b1-h7 : notre fou g6 et notre pion f vont s'ouvrir des lignes."] [%hint "f5 ! Le levier attaque g4 et ouvre la colonne f vers le roi blanc."] [%hintcsl Rf4,Rg4] [%eval -0.96] }
21... f5 { [%txt "Le levier : la colonne f s'ouvre vers le roi blanc. Environ -0.9 : l'attaque blanche s'est retournée contre elle. Retenir : la chaîne d5-e6 et un fou défenseur en e7 suffisent à encaisser une attaque sans préparation."] [%eval -0.92] [%cal Gf5g4,Gf8f1] } *`,
    ),
    chapter(
      "La Variante d'Échange : 3.cxd5 cxd5",
      `{ [%txt "LA VARIANTE D'ÉCHANGE.

Très fréquente en club : les Blancs veulent éviter la théorie. La structure devient symétrique, la colonne c est ouverte, et personne n'a de faiblesse.

Le mode d'emploi noir : développer les deux cavaliers (Nf6, Nc6), sortir le fou c8 en f5 AVANT ...e6 (encore lui !), puis contester la colonne c avec ...Rc8. Stockfish donne environ +0.3 au départ, puis 0.00 quand notre tour s'installe sur la colonne c.

Attention au piège de la symétrie : si les Blancs prennent l'initiative (Qb3 sur b7), il faut savoir réagir, pas copier."] [%eval 0.37] }
1. d4 { [%txt "Le pion dame."] [%eval 0.29] }
1... d5 { [%txt "Symétrie."] [%eval 0.30] [%csl Gd5] }
2. c4 { [%txt "Le Gambit Dame."] [%eval 0.34] }
2... c6 { [%txt "La Slave."] [%eval 0.39] [%csl Gc6] }
3. cxd5 { [%txt "L'Échange : les Blancs détendent tout de suite."] [%eval 0.33] }
3... cxd5 { [%txt "On reprend avec le pion c : la colonne c s'ouvre."] [%eval 0.33] [%csl Gd5] [%cal Gc8c1] }
4. Nc3 { [%txt "Le cavalier attaque d5."] [%eval 0.34] }
4... Nf6 { [%txt "On défend d5."] [%eval 0.27] [%cal Gf6d5] }
5. Nf3 { [%txt "Développement."] [%eval 0.28] }
5... Nc6 { [%txt "Le cavalier symétrique : il attaque d4 et contrôle e5."] [%eval 0.26] [%cal Gc6d4,Gc6e5] }
6. Bf4 { [%txt "Le fou sort avant e3."] [%eval 0.23] }
6... Bf5 { [%txt "On fait pareil : le fou c8 sort avant ...e6."] [%eval 0.29] [%csl Gf5] [%cal Gf5b1] }
7. e3 { [%txt "Les Blancs ferment leur chaîne."] [%eval 0.18] }
(7. Qb3 { [%txt "Le coup le plus dangereux : la dame attaque b7 et d5."] [%eval 0.23] [%cal Rb3b7,Rb3d5] }
  7... Na5 { [%txt "Le cavalier chasse la dame."] [%eval 0.26] [%cal Ga5b3] }
  8. Qa4+ { [%txt "Échec."] [%eval 0.25] }
  8... Bd7 { [%txt "Le fou s'interpose et attaque la dame."] [%eval 0.22] [%cal Gd7a4] }
  9. Qc2 { [%txt "La dame recule."] [%eval 0.26] }
  9... e6 { [%txt "On ferme la chaîne : le cavalier a5 ira en c4. Position équilibrée (environ +0.2)."] [%eval 0.21] [%csl Ge6] [%cal Ga5c4] })
7... e6 { [%txt "On ferme la chaîne derrière le fou."] [%eval 0.17] [%csl Ge6] }
8. Bb5 { [%txt "Le fou cloue le cavalier c6."] [%eval 0.06] [%cal Gb5c6] }
8... Nd7 { [%txt "Le cavalier recule pour pouvoir jouer ...Rc8 et ...a6 sans crainte de Ne5."] [%eval 0.04] [%cal Gd7b6] }
9. Qa4 { [%txt "Les Blancs renforcent le clouage. Un peu trop ambitieux : la dame quitte le roi et la colonne c."] [%hint "La dame blanche part seule à l'aile dame avant le roque, au lieu de prendre la colonne c ouverte."] [%hint "La colonne c et le pion c6 : il est cloué, mais une tour en c8 le défendra et prendra la colonne."] [%hint "Rc8 ! puis ...a6 : le fou b5 devra s'échanger et la colonne c sera à nous."] [%hintcsl Gc8,Gc6] [%eval -0.33] }
9... Rc8 { [%txt "On défend c6 une deuxième fois et on prend la colonne c."] [%eval -0.33] [%cal Gc8c6] }
10. O-O { [%txt "Les Blancs roquent."] [%eval -0.22] }
10... a6 { [%txt "On questionne le fou b5 : il doit prendre ou reculer."] [%eval 0.07] [%cal Ga6b5] }
11. Bxc6 { [%txt "Les Blancs échangent."] [%eval 0.00] }
11... Rxc6 { [%txt "La tour reprend : la colonne c est à nous. Égalité parfaite, 0.00."] [%eval 0.00] [%csl Gc6] [%cal Gc6c1] }
12. Rfc1 { [%txt "Les Blancs contestent la colonne c."] [%eval 0.01] }
12... Be7 { [%txt "Le fou f8 sort, le roque suit."] [%eval 0.02] [%cal Ge8g8] }
13. Ne2 { [%txt "Le cavalier libère la colonne c."] [%eval 0.00] }
13... Qb6 { [%txt "La dame vise b2 et défend la colonne."] [%eval 0.00] [%cal Gb6b2] }
14. Rxc6 { [%txt "Les Blancs échangent les tours."] [%eval 0.00] }
14... Qxc6 { [%txt "La dame reprend et propose l'échange des dames."] [%eval 0.22] [%cal Gc6a4] }
15. Qxc6 { [%txt "Les Blancs acceptent."] [%eval 0.17] }
15... bxc6 { [%txt "Finale symétrique pratiquement nulle (environ +0.25, l'avantage minime du trait) : nos pions c6-d5-e6 contrôlent le centre. Retenir : contre l'Échange, développement symétrique, fou f5 avant ...e6, et la colonne c."] [%eval 0.25] [%csl Gc6,Gd5,Ge6] } *`,
    ),
    chapter(
      "Anti-panique : 3.e3, 3.e4 et les gambits précoces",
      `{ [%txt "LE CHAPITRE ANTI-PANIQUE.

Trois déviations blanches fréquentes en club, et la réaction à connaître.

1. 3.e3 : les Blancs enferment leur fou c1 derrière la chaîne. Ce n'est PAS une faute (Stockfish : environ +0.3, presque autant que 3.Nf3), mais cela nous laisse sortir le fou c8 tout de suite : 3...Bf5 !, puis ...e6. Seul danger : la dame blanche en b3 contre b7.
2. 3.e4 : un gambit au centre. On prend (3...dxe4) et les Blancs n'ont pas assez pour le pion (environ -0.6).
3. 3.Nf3 Nf6 4.e4 ? : même idée, encore moins bonne (environ -1.0). Et après 4.Nc3 dxc4, la poussée 5.e4 se règle par ...b5 et ...Nd5."] [%eval 0.37] }
1. d4 { [%txt "Le pion dame."] [%eval 0.29] }
1... d5 { [%txt "Symétrie."] [%eval 0.30] [%csl Gd5] }
2. c4 { [%txt "Le Gambit Dame."] [%eval 0.34] }
2... c6 { [%txt "La Slave."] [%eval 0.39] [%csl Gc6] }
3. e3 { [%txt "Les Blancs jouent prudemment : le fou c1 est enfermé derrière e3. Honnêtement, le coup est correct (environ +0.3)."] [%eval 0.31] [%csl Rc1] }
(3. e4 { [%txt "Le gambit central : les Blancs sacrifient le pion e pour le développement."] [%hint "Les Blancs poussent un deuxième pion central sans l'avoir préparé : rien ne défend e4."] [%hint "Le pion e4 : il n'est défendu par aucune pièce."] [%hint "dxe4 ! On prend le pion : les Blancs n'ont pas assez de compensation."] [%hintcsl Re4] [%eval -0.51] }
  3... dxe4 { [%txt "On accepte : un pion de plus."] [%eval -0.68] [%csl Ge4] }
  4. Nc3 { [%txt "Le cavalier attaque e4."] [%eval -0.71] }
  4... Nf6 { [%txt "On défend e4 avec le cavalier."] [%eval -0.75] [%cal Gf6e4] }
  5. f3 { [%txt "Les Blancs ouvrent la colonne f pour récupérer le pion, façon gambit Blackmar."] [%eval -0.69] }
  5... Qc7 { [%txt "La dame prépare ...e5, le contre central."] [%eval -0.78] [%cal Gc7e5] }
  6. Qe2 { [%txt "La dame attaque e4."] [%eval -0.80] }
  6... Na6 { [%txt "Le cavalier sort vers b4 ou c7."] [%eval -0.95] [%cal Ga6b4] }
  7. a3 { [%txt "Les Blancs contrôlent b4."] [%eval -0.98] }
  7... e5 { [%txt "Le contre central : le pion d4 est attaqué."] [%eval -1.07] [%cal Ge5d4] }
  8. dxe5 { [%txt "Les Blancs prennent."] [%eval -0.93] }
  8... Qxe5 { [%txt "La dame reprend au centre : nous gardons le pion de plus (environ -1.0). Retenir : un gambit refusé de pion central se punit en prenant, puis en contre-attaquant le centre avec ...e5."] [%eval -1.00] [%csl Ge5] })
(3. Nf3 { [%txt "L'ordre normal."] [%eval 0.40] }
  3... Nf6 { [%txt "Développement."] [%eval 0.43] [%cal Gf6e4] }
  4. e4 { [%txt "La poussée sans préparation."] [%hint "Les Blancs avancent e4 alors que ni le cavalier c3 ni la dame ne le défendent."] [%hint "Le pion e4 : attaqué par d5 et le cavalier f6, défendu par personne."] [%hint "dxe4 ! Le pion tombe, et le cavalier f3 doit perdre un temps."] [%hintcsl Re4] [%eval -0.92] }
  (4. Nc3 { [%txt "Le tronc commun."] [%eval 0.36] }
    4... dxc4 { [%txt "La Tchèque."] [%eval 0.50] [%csl Gc4] }
    5. e4 { [%txt "Le gambit de club : les Blancs prennent le centre au lieu de récupérer c4."] [%hint "Les Blancs poussent e4 au lieu de jouer a4 : rien n'empêche plus ...b5, qui garde le pion c4."] [%hint "La case b5 : notre pion b7 peut y aller pour soutenir c4."] [%hint "b5 ! On garde le pion, puis ...Nd5 bloque le centre si e5."] [%hintcsl Gb5,Gc4] [%eval -0.24] }
    5... b5 { [%txt "On garde le pion c4."] [%eval -0.22] [%cal Gb5c4] }
    6. e5 { [%txt "Les Blancs chassent le cavalier."] [%eval -0.49] }
    6... Nd5 { [%txt "Le cavalier se plante en d5, case idéale bloquée par le pion e5."] [%eval -0.60] [%csl Gd5] }
    7. a4 { [%txt "Les Blancs attaquent la chaîne b5-c4."] [%eval -0.61] }
    7... e6 { [%txt "On consolide d5 et on ouvre le fou f8 : un pion de plus, environ -0.5."] [%eval -0.61] [%csl Gd5,Ge6] })
  4... dxe4 { [%txt "On prend : un pion net."] [%eval -0.94] [%csl Ge4] [%cal Gd5e4] }
  5. Ne5 { [%txt "Le cavalier saute au centre."] [%eval -1.01] }
  5... Nbd7 { [%txt "On défie le cavalier."] [%eval -1.01] [%cal Gd7e5] }
  6. Nxd7 { [%txt "Les Blancs échangent."] [%eval -1.02] }
  6... Bxd7 { [%txt "Reprise : le fou c8 est sorti au passage."] [%eval -1.00] [%csl Gd7] }
  7. Nc3 { [%txt "Le cavalier attaque e4."] [%eval -1.19] }
  7... Qc7 { [%txt "La dame prépare ...e5."] [%eval -1.11] [%cal Gc7e5] }
  8. Be2 { [%txt "Développement."] [%eval -1.16] }
  8... e5 { [%txt "Le contre central : un pion de plus et un jeu fluide (environ -1.2)."] [%eval -1.16] [%cal Ge5d4] })
3... Bf5 { [%txt "Le fou sort IMMÉDIATEMENT : la diagonale c8-h3 est libre et les Blancs ne peuvent plus l'enfermer."] [%eval 0.21] [%csl Gf5] [%cal Gf5b1] }
4. Nc3 { [%txt "Développement naturel."] [%eval 0.25] }
(4. cxd5 { [%txt "Les Blancs échangent pour ouvrir la diagonale de la dame vers b7."] [%eval 0.09] }
  4... cxd5 { [%txt "On reprend."] [%eval 0.21] [%csl Gd5] }
  5. Qb3 { [%txt "La dame attaque b7 et d5 : c'est LE piège de la ligne."] [%eval 0.14] [%cal Rb3b7,Rb3d5] }
  5... Qd7 { [%txt "La dame défend b7 par la septième rangée, et garde d5 et f5."] [%eval 0.10] [%csl Gb7] [%cal Gd7b7] }
  6. Nc3 { [%txt "Développement."] [%eval 0.09] }
  6... e6 { [%txt "On ferme la chaîne."] [%eval 0.05] [%csl Ge6] }
  7. Nf3 { [%txt "Développement."] [%eval 0.01] }
  7... Nc6 { [%txt "Position égale (environ +0.1) : le fou f5 est dehors, b7 est tenu. Retenir : contre Qb3, la dame en d7 ou c7 défend b7."] [%eval 0.03] [%cal Gc6b4] })
(4. Qb3 { [%txt "La dame attaque b7 tout de suite."] [%eval 0.14] [%cal Rb3b7] }
  4... Qc7 { [%txt "La dame défend b7 et contrôle la diagonale b8-h2."] [%eval 0.14] [%csl Gb7] [%cal Gc7h2] }
  5. Nc3 { [%txt "Développement."] [%eval 0.13] }
  5... e6 { [%txt "On ferme la chaîne : position équilibrée (environ +0.1)."] [%eval 0.12] [%csl Ge6] })
4... e6 { [%txt "On ferme la chaîne derrière le fou."] [%eval 0.25] [%csl Ge6] }
5. Nf3 { [%txt "Développement."] [%eval 0.21] }
5... Nf6 { [%txt "Développement : le cavalier contrôle e4."] [%eval 0.32] [%cal Gf6e4] }
6. Nh4 { [%txt "Les Blancs chassent le fou f5 pour avoir la paire de fous."] [%eval 0.33] [%cal Gh4f5] }
6... Bg6 { [%txt "Le fou recule : s'il est pris, le pion h reprend vers le centre."] [%eval 0.28] [%cal Gg6b1] }
7. Nxg6 { [%txt "Les Blancs prennent."] [%eval 0.27] }
7... hxg6 { [%txt "La colonne h est ouverte pour notre tour : petit avantage blanc normal (environ +0.3), sans aucune faiblesse chez nous. Retenir : contre 3.e3, le fou va en f5 tout de suite, et on ne craint pas son échange."] [%eval 0.33] [%csl Gg6] [%cal Gh8h2] } *`,
    ),
    chapter(
      "Aléatoire Surprise : le cavalier qui rejoue, puni par ...c5",
      `{ [%txt "MODULE ALÉATOIRE SURPRISE.

Une partie de club typique : les Blancs suivent la ligne principale jusqu'au coup 7, puis jouent un coup « prudent » au coup 8 : Nd2, pour préparer e4. Problème : ce cavalier a déjà joué, il quitte le contrôle de d4 et e5, et les Blancs n'ont toujours pas roqué.

À toi de trouver la punition. Utilise les indices dans l'ordre : 1. le principe violé, 2. la zone faible, 3. l'action.

La méthode à retenir (

PRO TIP : quand l'adversaire perd un temps dans une position ouverte, frappe le centre avec un pion (ici le levier ...c5) avant qu'il ait fini son développement."] [%eval 0.37] }
1. d4 { [%txt "Le pion dame."] [%eval 0.29] }
1... d5 { [%txt "Symétrie."] [%eval 0.30] [%csl Gd5] }
2. c4 { [%txt "Le Gambit Dame."] [%eval 0.34] }
2... c6 { [%txt "La Slave."] [%eval 0.39] [%csl Gc6] }
3. Nf3 { [%txt "Le cavalier roi."] [%eval 0.40] }
3... Nf6 { [%txt "Développement."] [%eval 0.43] [%cal Gf6e4] }
4. Nc3 { [%txt "Le cavalier dame."] [%eval 0.36] }
4... dxc4 { [%txt "La Tchèque."] [%eval 0.50] [%csl Gc4] }
5. a4 { [%txt "Contre ...b5."] [%eval 0.43] }
5... Bf5 { [%txt "Le fou d'abord."] [%eval 0.52] [%cal Gf5b1] }
6. e3 { [%txt "Le plan solide."] [%eval 0.45] }
6... e6 { [%txt "La chaîne derrière le fou."] [%eval 0.40] [%csl Ge6] }
7. Bxc4 { [%txt "Les Blancs récupèrent le pion : fin du terrain connu, environ +0.4."] [%eval 0.47] }
7... Bb4 { [%txt "Le fou dans le trou b4."] [%eval 0.37] [%csl Gb4] [%cal Gb4c3] }
8. Nd2 { [%txt "LA FAUTE : le cavalier f3 joue une deuxième fois pour préparer e4, et laisse d4 et e5 sans surveillance. Le roi blanc est encore au centre."] [%hint "Le cavalier f3 joue une deuxième fois alors que le roi blanc n'a pas roqué : un temps perdu dans une position ouverte."] [%hint "Le pion d4 : le cavalier f3 ne le défend plus, et la colonne c peut s'ouvrir face au fou c4 et au roi e1."] [%hint "c5 ! Le levier frappe d4 tout de suite, avant que les Blancs aient roqué."] [%hintcsl Rd4,Rc4] [%eval -0.35] [%csl Rd4,Re1] }
8... c5 { [%txt "Le levier : d4 est attaqué, la colonne c va s'ouvrir face au fou c4. Environ -0.3, les Noirs ont déjà pris l'initiative."] [%eval -0.36] [%csl Rd4] [%cal Gc5d4] }
9. Nf3 { [%txt "Les Blancs avouent leur erreur : le cavalier revient en f3. Trois coups pour une seule case ! Mieux était 9.Nb3."] [%eval -0.54] }
9... Qe7 { [%txt "La dame se met à l'abri des échanges sur la colonne d et prépare ...Rd8."] [%eval -0.38] [%cal Ge7c5,Gf8d8] }
10. Bb5+ { [%txt "Un échec qui ne mène nulle part."] [%eval -0.49] }
10... Nc6 { [%txt "Le cavalier s'interpose et attaque d4 une deuxième fois."] [%eval -0.53] [%cal Gc6d4] }
11. O-O { [%txt "Les Blancs roquent enfin."] [%eval -0.54] }
11... O-O { [%txt "Nous aussi : notre développement est complet, le leur non (fou c1, tour a1)."] [%eval -0.56] [%csl Gg8] }
12. Bd2 { [%txt "Développement trop passif : le fou c1 se cache."] [%hint "Les Blancs se développent passivement alors que la tension c5-d4 dure et qu'ils peuvent hériter d'un pion isolé."] [%hint "Le pion d4 : si nous prenons, il devient isolé, sans pion voisin pour le défendre."] [%hint "cxd4 ! puis ...Na5 et ...Rfd8 : on bloque le pion isolé et on le prend pour cible."] [%hintcsl Rd4] [%eval -0.81] }
12... cxd4 { [%txt "On isole le pion d4."] [%eval -0.83] [%csl Rd4] [%cal Gc5d4] }
13. exd4 { [%txt "Reprise forcée : le pion d4 est isolé."] [%eval -0.84] }
13... Na5 { [%txt "Le cavalier vise c4 et la case de blocage d5 ; il évite aussi l'échange en c6."] [%eval -0.87] [%csl Gd5] [%cal Ga5c4] }
14. Re1 { [%txt "La tour sur la colonne e."] [%eval -0.95] }
14... Rfd8 { [%txt "La tour attaque le pion isolé sur la colonne d."] [%eval -0.98] [%cal Gd8d4] }
15. Be2 { [%txt "Le fou recule. Environ -1.2 : un pion isolé, une position passive, et nos pièces qui tournent autour de d4. Retenir (

PRO TIP : un temps perdu dans une position ouverte se punit par un levier de pion central immédiat."] [%eval -1.20] [%csl Rd4] } *`,
    ),
  ],
};
