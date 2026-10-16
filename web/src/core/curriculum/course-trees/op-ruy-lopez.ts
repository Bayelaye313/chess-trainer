import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours d'ouverture « Partie Espagnole / Ruy Lopez (avec les Blancs) » —
 * onglet Ouvertures, format « un commentaire par coup » de l'Académie, lu par
 * `CourseTreeViewer` (route `/ouvertures/ruy-lopez/cours`).
 *
 * ## Contenu (v2 du 2026-10-16, format Écossaise v2)
 *
 * 1. Fiche d'identité et tronc commun.
 * 2. Branche A : la Fermée, système Chigorine.
 * 3. Aléatoire surprise 1 : après la Chigorine, l'adversaire dérive.
 * 4. Branche B : l'Anti-Marshall (7...O-O 8.h3).
 * 5. Branche C : l'Ouverte (5...Nxe4).
 * 6. Branche D : la Berlinoise, système 4.d3.
 * 7. Aléatoire surprise 2 : après la Berlinoise 4.d3, l'adversaire dérive.
 * 8. Anti-panique : punir les déviations.
 *
 * Les branches théoriques s'arrêtent au plus tard au demi-coup 27 ; seuls les
 * chapitres « Aléatoire surprise » vont au-delà (séquences où l'adversaire
 * joue « mou », avec la méthode pour le punir en PRO TIP).
 *
 * ## Architecture technique des nœuds
 *
 * Chaque nœud (`ChessMoveNode`, `core/chess/move-tree.ts`) porte :
 * - `evaluationScore` / `evaluationMate` : évaluation Stockfish 18 de la
 *   position après le coup (profondeur 16, point de vue Blancs), écrite
 *   `[%eval x]` ; `showEvalBar` est vrai dès qu'elle est posée ;
 * - `freeze` : posé par la balise `[%txt "…"]` qui enveloppe CHAQUE
 *   commentaire ; en mode « Jouer les coups », l'ordinateur attend
 *   « Suivant » ou Espace avant de répondre ;
 * - `hints` / `hintHighlights` : `[%hint "…"]` (3 indices progressifs) et
 *   `[%hintcsl …]` sur les nœuds où il faut trouver la punition.
 *
 * Fichier GÉNÉRÉ : ne pas l'éditer à la main. Source commentée :
 * `scripts/opening-course-src/ruy-lopez.pgn` (et l'en-tête
 * `ruy-lopez.header.txt`) ; regénérer avec
 * `node --import tsx scripts/_tmp-build-opening-course.mts <source> <en-tête> <sortie> 16`
 * (Stockfish natif, voir `scripts/_tmp-sf-native.mts`). Les `[%eval]` viennent
 * du moteur, pas de la main ; `scripts/_tmp-check-evals.mts` signale les coups
 * blancs recommandés qui feraient chuter l'évaluation. Étape standard :
 * `scripts/_tmp-check-cited-evals.mts op-ruy-lopez` doit sortir 0 écart (un
 * chiffre n'est cité dans un commentaire que s'il est l'éval d'un nœud de l'arbre).
 * Règles de l'utilisateur : SAN en texte brut uniquement (jamais de figurine
 * Unicode), pas de guillemet droit dans un `[%txt]`.
 */

function chapter(title: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, START) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const OP_RUY_LOPEZ: CourseTree = {
  chapters: [
    chapter(
      "Fiche d'identité et tronc commun",
      `{ [%txt "LA PARTIE ESPAGNOLE (RUY LOPEZ), AVEC LES BLANCS.

Le vrai enjeu : mettre e5 sous pression en attaquant son défenseur, le cavalier c6, puis construire le centre idéal c3 + d4, que les Noirs devront soit céder, soit subir.

Le déséquilibre recherché : un avantage d'espace au centre et à l'aile roi, sans échanger. Notre fou espagnol (a4, puis b3, puis c2) vise le roque noir et reste notre meilleure pièce.

Les structures types (relevées sur la position finale de chaque branche) :
- A, Fermée Chigorine : Blancs a3-b2, d4-e4, f2-g2-h3 ; Noirs a6-b5, d6-e5, f7-g7-h7. Colonne c ouverte, tension d4/e5.
- B, Anti-Marshall : Blancs a3-b2-c2-d3-e4, f2-g2-h3 ; Noirs a6-b5-c7-d6-e5, f7-g7-h7. Fermée et symétrique : une partie de manœuvres.
- C, Ouverte : Blancs a2-b2-c3, e5, f2-g2-h2 ; Noirs a6-b5-c7, d4, f7-g7-h7. Pion e5 avancé et majorité à l'aile roi pour les Blancs, pion d4 avancé pour les Noirs.
- D, Berlinoise avec 4.d3 : Blancs a2-b2-c3-d3-e4, f2-g2-h3 ; Noirs a6-b7-c6-d6-e5, f7-g7-h7. Une « Italienne lente », fermée et équilibrée."] [%eval 0.37] }
1. e4 { [%txt "On occupe le centre et on libère le fou f1 et la dame."] [%eval 0.33] }
1... e5 { [%txt "Symétrie."] [%eval 0.31] }
2. Nf3 { [%txt "Le cavalier se développe en attaquant e5."] [%eval 0.28] [%cal Gf3e5] }
2... Nc6 { [%txt "Le cavalier défend e5."] [%eval 0.24] }
3. Bb5 { [%txt "On attaque le défenseur de e5. Contrairement à 3.Bc4, le fou ne vise pas f7 : il exerce une pression de long terme sur le cavalier c6."] [%eval 0.28] [%cal Gb5c6,Gc6e5] }
3... a6 { [%txt "Les Noirs questionnent le fou tout de suite. (3...Nf6 : chapitre « Berlinoise ».)"] [%eval 0.37] }
4. Ba4 { [%txt "On garde le fou et la pression. 4.Bxc6, l'Espagnole d'échange, est bon aussi, mais moins ambitieux."] [%eval 0.38] [%cal Ga4c6] }
4... Nf6 { [%txt "Les Noirs contre-attaquent e4."] [%eval 0.37] [%cal Rf6e4] }
5. O-O { [%txt "On ne défend pas e4, et c'est voulu. Si 5...Nxe4, alors 6.d4 récupère le pion avec un jeu actif (chapitre « Ouverte »). Le roque met d'abord le roi à l'abri et prépare Re1.

PRO TIP : en Espagnole, la menace Bxc6 suivie de Nxe5 n'est pas encore réelle tant que e4 n'est pas défendu : après Bxc6 dxc6 Nxe5, la dame noire viendrait en d4 et récupérerait le pion e4. Elle ne devient réelle qu'une fois e4 défendu, d'où l'importance de Re1."] [%eval 0.42] [%csl Ge4] } *`,
    ),
    chapter(
      "Branche A : la Fermée, système Chigorine",
      `{ [%txt "La ligne principale de l'Espagnole. Les Noirs jouent solidement (...Be7, ...b5, ...d6), les Blancs construisent c3 + d4 et gardent leur fou espagnol sur la diagonale b1-h7."] [%eval 0.37] }
1. e4 { [%txt "On occupe le centre."] [%eval 0.33] }
1... e5 { [%txt "Symétrie."] [%eval 0.31] }
2. Nf3 { [%txt "On attaque e5."] [%eval 0.28] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.24] }
3. Bb5 { [%txt "On attaque le défenseur de e5."] [%eval 0.28] }
3... a6 { [%txt "Le fou est questionné."] [%eval 0.37] }
4. Ba4 { [%txt "On garde le fou."] [%eval 0.38] }
4... Nf6 { [%txt "Contre-attaque sur e4."] [%eval 0.37] }
5. O-O { [%txt "Le roi d'abord : e4 est « empoisonné »."] [%eval 0.42] }
5... Be7 { [%txt "Un développement solide : les Noirs préparent le roque."] [%eval 0.38] }
6. Re1 { [%txt "La tour défend e4 pour de bon, ce qui crée la menace Bxc6 puis Nxe5."] [%eval 0.41] [%cal Ge1e4,Ga4c6] }
6... b5 { [%txt "Les Noirs chassent le fou pour supprimer cette menace."] [%eval 0.37] [%cal Rb5a4] }
7. Bb3 { [%txt "Le seul bon coup : le fou recule en visant f7."] [%eval 0.38] [%cal Gb3f7] }
(7. d4 { [%txt "Une grosse erreur : le fou a4 est toujours attaqué…"] [%hint "les Blancs poussent au centre sans regarder le pion b5, qui vient d'attaquer le fou a4."] [%hint "la case a4. Le fou n'y est défendu par aucune pièce blanche."] [%hint "7...bxa4 : le pion prend le fou, les Noirs gagnent une pièce."] [%hintcsl Ra4,Rb5] [%eval -2.79] }
  7... bxa4 { [%txt "…et les Noirs le prennent : -2.77."] [%eval -2.77] [%csl Ra4] })
7... d6 { [%txt "Le pion soutient e5 et libère le fou c8. (7...O-O : chapitre « Anti-Marshall ».)"] [%eval 0.43] }
8. c3 { [%txt "On prépare d4 et on offre au fou une case de repli en c2."] [%eval 0.43] [%cal Gc3d4] }
8... O-O { [%txt "Les Noirs roquent."] [%eval 0.38] }
9. h3 { [%txt "Un coup prophylactique : on empêche ...Bg4, qui clouerait le cavalier f3, défenseur de d4. Sans h3, d4 se heurte à ...Bg4."] [%eval 0.42] [%csl Rg4] }
9... Na5 { [%txt "Le cavalier chasse le fou b3. (9...Be6 et 9...Bb7 sont aussi bons.)"] [%eval 0.58] [%cal Ra5b3] }
10. Bc2 { [%txt "On garde le fou sur la diagonale b1-h7, tournée vers le roque noir."] [%eval 0.53] [%cal Gc2h7] }
(10. d4 { [%txt "Prématuré (+0.58 → -0.21)…"] [%hint "les Blancs poussent d4 en laissant le fou b3 attaqué par le cavalier a5."] [%hint "la case b3. Le cavalier a5 y prend le fou espagnol, la meilleure pièce blanche."] [%hint "10...Nxb3 : les Noirs échangent le fou, et après 11.axb3 ils sont légèrement mieux."] [%hintcsl Rb3,Ra5] [%eval -0.21] }
  10... Nxb3 { [%txt "…le cavalier échange notre meilleure pièce…"] [%eval -0.32] }
  11. axb3 { [%txt "…et les Noirs sont légèrement mieux (-0.30, contre +0.53 après 10.Bc2)."] [%eval -0.30] })
10... c5 { [%txt "Les Noirs gagnent de l'espace et préparent ...Nc6."] [%eval 0.63] }
11. d4 { [%txt "Le centre idéal est en place : c3, d4 et e4."] [%eval 0.57] [%csl Gd4,Ge4] }
11... Qc7 { [%txt "La dame renforce e5 et se place face à notre fou c2 sur la colonne c."] [%eval 0.59] }
12. Nbd2 { [%txt "Le cavalier entame le voyage d2-f1-g3, vers l'aile roi. 12.d5, qui ferme le centre tout de suite, est l'autre plan (voir la feuille de route en fin de chapitre)."] [%eval 0.49] [%cal Gd2f1] }
12... cxd4 { [%txt "Les Noirs ouvrent la colonne c."] [%eval 0.52] }
13. cxd4 { [%txt "La reprise est obligatoire."] [%eval 0.57] [%cal Gc3d4] }
(13. Nb3 { [%txt "Une faute : le pion c3 tombe…"] [%hint "le cavalier quitte d2 sans reprendre en d4 : le pion c3 reste attaqué par le pion d4."] [%hint "la case c3. Si le pion d4 y prend, les pions blancs de l'aile dame sont éclatés et la case c4 s'offre au cavalier a5."] [%hint "13...dxc3 : après 14.bxc3 Nc4, les Noirs dominent l'aile dame."] [%hintcsl Rc3,Rc4] [%eval -2.04] }
  13... dxc3 { [%txt "…et la colonne c s'ouvre sur nous : -2.04."] [%eval -2.04] })
13... Nc6 { [%txt "Le cavalier revient au centre : il attaque d4 et vise b4."] [%eval 0.44] [%cal Rc6d4,Rc6b4] }
14. a3 { [%txt "Le choix du moteur (+0.47) : on interdit b4, d'où ...Nb4 frapperait le fou c2.

À RETENIR.

PRO TIP : la feuille de route après la théorie.
1. La manœuvre Nd2-f1-g3 (ou e3) amène le cavalier à l'aile roi. Avec le fou c2 et la dame, elle prépare Nf5 ou une attaque sur h7.
2. Choisir le bon moment pour d5 : on ferme le centre, puis on joue à l'aile roi (Nh2, f4 ou g4), pendant que les Noirs cherchent ...c4 et ...Nc5.
3. Tenir la colonne c ouverte : Bd3 ou Bb1, puis Rc1, sans jamais laisser ...Nb4 frapper c2."] [%eval 0.47] [%csl Gb4] [%cal Ga3b4] }
(14. Nb3 { [%txt "Le coup classique, toujours bon (+0.35) : le cavalier défend d4 et surveille a5 et c5."] [%eval 0.35] }) *`,
    ),
    chapter(
      "Aléatoire surprise 1 : après la Chigorine, la case f5 abandonnée",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend la Chigorine du chapitre précédent jusqu'à 14.a3. La théorie s'arrête là : les Noirs liquident le centre, puis jouent des coups de club qui ont l'air naturels et ne le sont pas. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case faible (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quelle case n'est plus surveillée ? 3. Quelle pièce peut s'y installer ?"] [%eval 0.37] }
1. e4 { [%txt "On occupe le centre."] [%eval 0.33] }
1... e5 { [%txt "Symétrie."] [%eval 0.31] }
2. Nf3 { [%txt "On attaque e5."] [%eval 0.28] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.24] }
3. Bb5 { [%txt "On attaque le défenseur de e5."] [%eval 0.28] }
3... a6 { [%txt "Le fou est questionné."] [%eval 0.37] }
4. Ba4 { [%txt "On garde le fou."] [%eval 0.38] }
4... Nf6 { [%txt "Contre-attaque sur e4."] [%eval 0.37] }
5. O-O { [%txt "Le roi d'abord."] [%eval 0.42] }
5... Be7 { [%txt "Développement solide."] [%eval 0.38] }
6. Re1 { [%txt "La tour défend e4."] [%eval 0.41] }
6... b5 { [%txt "On chasse le fou."] [%eval 0.37] }
7. Bb3 { [%txt "Le fou recule en visant f7."] [%eval 0.38] }
7... d6 { [%txt "Le pion soutient e5."] [%eval 0.43] }
8. c3 { [%txt "On prépare d4."] [%eval 0.43] }
8... O-O { [%txt "Les Noirs roquent."] [%eval 0.38] }
9. h3 { [%txt "On empêche ...Bg4."] [%eval 0.42] }
9... Na5 { [%txt "Le cavalier chasse le fou."] [%eval 0.58] }
10. Bc2 { [%txt "Le fou garde la diagonale b1-h7."] [%eval 0.53] }
10... c5 { [%txt "Les Noirs gagnent de l'espace."] [%eval 0.63] }
11. d4 { [%txt "Le centre idéal."] [%eval 0.57] }
11... Qc7 { [%txt "La dame renforce e5."] [%eval 0.59] }
12. Nbd2 { [%txt "Le cavalier part vers l'aile roi."] [%eval 0.49] }
12... cxd4 { [%txt "La colonne c s'ouvre."] [%eval 0.52] }
13. cxd4 { [%txt "La reprise obligatoire."] [%eval 0.57] }
13... Nc6 { [%txt "Le cavalier revient au centre."] [%eval 0.44] }
14. a3 { [%txt "Fin de la théorie : on interdit ...Nb4."] [%eval 0.47] [%csl Gb4] }
14... exd4 { [%txt "Les Noirs liquident le centre : le pion e5 disparaît, la colonne e s'ouvre pour notre tour e1. Ce n'est pas encore une faute."] [%eval 0.52] [%cal Ge1e7] }
15. Nb3 { [%txt "Le cavalier attaque le pion d4 et va le reprendre."] [%eval 0.48] [%cal Gb3d4] }
15... Ne5 { [%txt "Le cavalier se centralise et propose l'échange du cavalier f3."] [%eval 0.45] }
16. Nbxd4 { [%txt "On récupère le pion. Le cavalier d4 regarde déjà la case f5."] [%eval 0.47] [%cal Gd4f5] }
16... Bb7 { [%txt "PREMIÈRE FAUTE : le fou quitte la diagonale c8-h3, alors qu'il était le seul gardien de la case f5. Le moteur préférait 16...Re8, qui libère f8 pour le fou e7."] [%hint "le fou c8 part sur la grande diagonale ; quelle case surveillait-il jusqu'ici ?"] [%hint "la case f5. Plus aucune pièce noire ne la contrôle, et de là un cavalier attaque d6, e7 et g7."] [%hint "17.Nf5! : le cavalier s'installe et frappe e7 et d6."] [%hintcsl Rf5,Rd6,Re7] [%eval 0.62] [%csl Rf5] }
(16... Re8 { [%txt "Le bon coup : la tour prend la colonne e et la case f8 se libère pour le fou."] [%eval 0.51] }
  17. Bf4 { [%txt "À RETENIR.

PRO TIP : on développe le dernier fou en visant d6 ; l'avantage reste modeste, car la case f5 est toujours couverte par le fou c8."] [%eval 0.46] })
17. Nf5 { [%txt "LE CAVALIER EN F5, la case rêvée de l'Espagnole : il attaque le fou e7 et le pion d6, et vise g7."] [%eval 0.61] [%cal Gf5e7,Gf5d6,Gf5g7] }
17... Rac8 { [%txt "DEUXIÈME FAUTE : la tour se met face au fou c2, mais ne fait rien contre le cavalier f5. Il fallait 17...Rfe8 pour libérer f8."] [%hint "les Noirs créent une menace sur c2, mais laissent le fou e7 attaqué et le cavalier f6 sans soutien."] [%hint "le fou e7 et le cavalier f6 sont sur la même diagonale : un fou blanc en g5 clouerait le cavalier."] [%hint "18.Bg5 : le fou cloue le cavalier f6 et attaque e7 une deuxième fois. La menace ...Qxc2 ne marche pas."] [%hintcsl Rf6,Re7] [%eval 1.10] }
18. Bg5 { [%txt "Le fou entre dans la bataille : il cloue le cavalier f6 contre le fou e7, attaqué deux fois."] [%eval 1.25] [%cal Gg5f6,Gf5e7] }
(18. Bf4 { [%txt "Bon aussi, mais moins précis (+1.05 contre +1.25) : le fou vise d6 et le cavalier e5."] [%eval 1.05] }
  18... Rfe8 { [%txt "À RETENIR.

PRO TIP : même idée que dans la ligne principale, on accumule la pression sur d6 et e7 avant de frapper."] [%eval 1.02] })
18... Nd5 { [%txt "TROISIÈME FAUTE : le cavalier quitte f6, le principal défenseur du roque, et laisse le cavalier e5 défendu par le seul pion d6. 18...h6 était nécessaire."] [%hint "le cavalier f6 était le gardien du roque ; il part au centre sans menace réelle."] [%hint "le cavalier e5 n'est plus tenu que par le pion d6, et le pion g7 n'est plus défendu que par le roi."] [%hint "19.Nxe5! : si 19...Bxg5, 20.Qg4 attaque à la fois le fou g5 et le pion g7."] [%hintcsl Re5,Rg7] [%eval 1.26] [%csl Rf6] }
(18... Qxc2 { [%txt "Le piège de la tour c8 : les Noirs prennent le fou…"] [%eval 4.44] }
  19. Nxe7+ { [%txt "…mais le cavalier prend le fou e7 avec échec."] [%eval 4.54] [%cal Gf5e7] }
  19... Kh8 { [%txt "Le roi doit bouger."] [%eval 4.54] }
  20. Nxc8 { [%txt "Le cavalier prend la tour c8, et la dame c2 est attaquée par la nôtre."] [%eval 4.63] [%cal Gd1c2] }
  20... Qxd1 { [%txt "Les Noirs échangent les dames."] [%eval 4.60] }
  21. Raxd1 { [%txt "À RETENIR.

PRO TIP : environ +4.5, une pièce de plus. Avant de prendre une pièce défendue une seule fois, vérifie les échecs adverses."] [%eval 4.52] })
19. Nxe5 { [%txt "On élimine le cavalier e5 : le fou g5 est en prise, mais c'est calculé."] [%eval 1.49] [%cal Gf3e5] }
19... Bxg5 { [%txt "Les Noirs prennent le fou."] [%eval 1.77] }
(19... dxe5 { [%txt "L'autre reprise…"] [%eval 2.09] }
  20. Qh5 { [%txt "…et la dame arrive à l'aile roi, avec Bxe7 et une attaque sur h7 et g7 : environ +2.0."] [%eval 2.04] [%cal Gh5h7,Gf5g7] })
20. Qg4 { [%txt "LA DOUBLE ATTAQUE : la dame attaque le fou g5 et menace Qxg7 mat, avec le cavalier f5 en soutien."] [%eval 1.48] [%cal Gg4g5,Gg4g7,Gf5g7] }
20... Ne7 { [%txt "Le cavalier revient défendre en attaquant le cavalier f5."] [%eval 1.63] [%cal Re7f5] }
21. Qxg5 { [%txt "On reprend la pièce, et la menace sur g7 continue."] [%eval 2.06] [%cal Gg5g7] }
21... Nxf5 { [%txt "Les Noirs éliminent l'attaquant de g7."] [%eval 1.89] }
22. exf5 { [%txt "À RETENIR.

PRO TIP : environ +1.9. Le pion f5 et la dame g5 pèsent sur le roque, et le cavalier e5 est intouchable (22...dxe5? 23.f6 et le mat sur g7 ne se pare plus). Les Noirs devront jouer ...h6 avant de récupérer le fou c2. La leçon : en Espagnole, la case f5 se gagne quand le fou c8 s'en va ; installe un cavalier dessus, puis amène le fou et la dame contre g7."] [%eval 1.92] [%csl Gf5,Ge5] [%cal Gf5f6,Gg5g7] } *`,
    ),
    chapter(
      "Branche B : l'Anti-Marshall (7...O-O 8.h3)",
      `{ [%txt "Avec 7...O-O, les Noirs préparent 8.c3 d5, l'attaque Marshall : un sacrifice de pion très théorique. 8.c3 reste le choix principal, 8.h3 est une alternative jouable : avec 8.c3, il faudrait connaître toute la Marshall. Pour un répertoire 1500-1800, 8.h3 est le meilleur rapport entre théorie et résultat."] [%eval 0.37] }
1. e4 { [%txt "On occupe le centre."] [%eval 0.33] }
1... e5 { [%txt "Symétrie."] [%eval 0.31] }
2. Nf3 { [%txt "On attaque e5."] [%eval 0.28] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.24] }
3. Bb5 { [%txt "On attaque le défenseur de e5."] [%eval 0.28] }
3... a6 { [%txt "Le fou est questionné."] [%eval 0.37] }
4. Ba4 { [%txt "On garde le fou."] [%eval 0.38] }
4... Nf6 { [%txt "Contre-attaque sur e4."] [%eval 0.37] }
5. O-O { [%txt "Le roi d'abord."] [%eval 0.42] }
5... Be7 { [%txt "Développement solide."] [%eval 0.38] }
6. Re1 { [%txt "La tour défend e4."] [%eval 0.41] }
6... b5 { [%txt "On chasse le fou."] [%eval 0.37] }
7. Bb3 { [%txt "Le fou recule en visant f7."] [%eval 0.38] }
7... O-O { [%txt "Un ordre de coups qui prépare la Marshall (8.c3 d5!)."] [%eval 0.40] }
8. h3 { [%txt "On évite la Marshall : sans c3, ...d5 n'a plus le même mordant. h3 empêche aussi ...Bg4."] [%eval 0.32] [%csl Rg4] }
8... Bb7 { [%txt "Le fou noir vise e4 sur la grande diagonale."] [%eval 0.26] [%cal Rb7e4] }
9. d3 { [%txt "On défend e4 solidement : on choisit une structure fermée."] [%eval 0.27] [%cal Gd3e4] }
9... d6 { [%txt "Les Noirs soutiennent e5. (9...d5 est le coup le plus actif, et reste équilibré.)"] [%eval 0.42] }
10. a3 { [%txt "On garde la case b4 et on prépare Nc3 ou Ba2 : c'est le coup précis. 10.c3 est jouable, mais moins précis.

À RETENIR.

PRO TIP : la feuille de route après la théorie.
1. Nbd2 (ou Nc3), puis Ba2 et Nh2-g4 vers l'aile roi.
2. Préparer le levier d4 au bon moment.
3. Si les Noirs jouent ...d5, échanger en exd5 et prendre la colonne e."] [%eval 0.36] [%csl Gb4] } *`,
    ),
    chapter(
      "Branche C : l'Ouverte (5...Nxe4)",
      `{ [%txt "Les Noirs acceptent le « cadeau » de 5.O-O. On ouvre tout de suite le centre pendant que leur roi est encore en e8, puis on récupère le pion avec un jeu plus actif."] [%eval 0.37] }
1. e4 { [%txt "On occupe le centre."] [%eval 0.33] }
1... e5 { [%txt "Symétrie."] [%eval 0.31] }
2. Nf3 { [%txt "On attaque e5."] [%eval 0.28] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.24] }
3. Bb5 { [%txt "On attaque le défenseur de e5."] [%eval 0.28] }
3... a6 { [%txt "Le fou est questionné."] [%eval 0.37] }
4. Ba4 { [%txt "On garde le fou."] [%eval 0.38] }
4... Nf6 { [%txt "Contre-attaque sur e4."] [%eval 0.37] }
5. O-O { [%txt "e4 est laissé en prise, exprès."] [%eval 0.42] }
5... Nxe4 { [%txt "Les Noirs prennent le pion."] [%eval 0.44] }
6. d4 { [%txt "On ouvre le centre pendant que le roi noir est en e8. Plus direct que 6.Re1, également jouable."] [%eval 0.36] [%cal Gd4e5] }
6... b5 { [%txt "Obligatoire : il faut chasser le fou avant que dxe5 ne vienne avec gain de temps."] [%eval 0.32] [%cal Rb5a4] }
7. Bb3 { [%txt "Le fou recule en visant d5 et f7."] [%eval 0.32] }
(7. Re1 { [%txt "Plausible mais inexact : l'évaluation bascule de +0.32 à -0.31…"] [%hint "la tour attaque le cavalier e4, mais le fou a4 est toujours attaqué et le pion f2 n'est plus défendu que par le roi."] [%hint "la case f2. Un cavalier noir y prend un pion et attaque la dame d1."] [%hint "7...Nxf2 : le cavalier prend f2 et vise la dame, et le fou a4 reste en prise."] [%hintcsl Rf2,Rd1] [%eval -0.31] }
  7... Nxf2 { [%txt "…le cavalier prend f2 et vise la dame d1 : -0.42."] [%eval -0.42] [%csl Rf2] })
7... d5 { [%txt "Les Noirs soutiennent le cavalier e4."] [%eval 0.33] }
8. dxe5 { [%txt "On récupère le pion et on gagne de l'espace."] [%eval 0.34] [%csl Ge5] }
8... Be6 { [%txt "Le fou protège d5."] [%eval 0.38] }
9. Nbd2 { [%txt "On attaque le cavalier e4 tout de suite. (9.c3 est équivalent.)"] [%eval 0.34] [%cal Gd2e4] }
9... Nc5 { [%txt "Le cavalier recule en attaquant le fou b3."] [%eval 0.39] }
10. c3 { [%txt "On donne la case c2 au fou et on prépare la lutte contre ...d4."] [%eval 0.38] }
10... Be7 { [%txt "Développement."] [%eval 0.46] }
11. Bc2 { [%txt "Le fou s'abrite et vise h7."] [%eval 0.42] [%cal Gc2h7] }
11... d4 { [%txt "Les Noirs avancent leur pion central."] [%eval 0.43] }
12. Nb3 { [%txt "Le cavalier attaque c5 et d4 en même temps (+0.46).

À RETENIR.

PRO TIP : la feuille de route après la théorie.
1. Bloquer d4 et c5 avec nos pièces (Nfxd4, Be3).
2. Attaquer le pion d4, qui sera isolé.
3. Pousser f4-f5 avec la majorité de l'aile roi."] [%eval 0.46] [%cal Gb3c5,Gb3d4] } *`,
    ),
    chapter(
      "Branche D : la Berlinoise, système 4.d3",
      `{ [%txt "La Berlinoise (3...Nf6) est une défense très solide. On évite sa finale théorique (4.O-O Nxe4 5.d4) avec le système simple 4.d3, une alternative solide : 4.O-O reste le coup principal, légèrement plus précis que 4.d3, mais on vise ici une partie de manœuvres « à l'italienne »."] [%eval 0.37] }
1. e4 { [%txt "On occupe le centre."] [%eval 0.33] }
1... e5 { [%txt "Symétrie."] [%eval 0.31] }
2. Nf3 { [%txt "On attaque e5."] [%eval 0.28] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.24] }
3. Bb5 { [%txt "On attaque le défenseur de e5."] [%eval 0.28] }
3... Nf6 { [%txt "La Berlinoise : les Noirs contre-attaquent e4 tout de suite."] [%eval 0.26] [%cal Rf6e4] }
4. d3 { [%txt "On défend e4 sans entrer dans la finale berlinoise, trop théorique pour ce niveau."] [%eval 0.19] [%cal Gd3e4] }
4... Bc5 { [%txt "Le fou se développe sur sa meilleure diagonale."] [%eval 0.25] }
5. c3 { [%txt "On prépare d4 et on donne de la place au fou."] [%eval 0.23] }
5... O-O { [%txt "Les Noirs roquent."] [%eval 0.23] }
6. O-O { [%txt "Nous aussi."] [%eval 0.24] }
6... d6 { [%txt "Les Noirs soutiennent e5."] [%eval 0.35] }
7. h3 { [%txt "On empêche ...Bg4."] [%eval 0.32] [%csl Rg4] }
7... a6 { [%txt "Le fou est questionné."] [%eval 0.31] }
8. Ba4 { [%txt "On garde le fou : un échange sur c6 relâcherait la tension."] [%eval 0.33] }
8... Ba7 { [%txt "Le fou recule pour éviter que d4 ne vienne avec gain de temps."] [%eval 0.34] }
9. Re1 { [%txt "La tour soutient e4 et prépare d4."] [%eval 0.37] }
9... Ne7 { [%txt "Le cavalier part vers g6."] [%eval 0.39] }
10. Nbd2 { [%txt "La manœuvre espagnole classique commence : d2, puis f1, puis g3."] [%eval 0.22] [%cal Gd2f1,Gf1g3] }
10... Ng6 { [%txt "Le cavalier noir est arrivé."] [%eval 0.30] }
11. Nf1 { [%txt "On continue la manœuvre."] [%eval 0.09] }
11... c6 { [%txt "Les Noirs préparent ...d5."] [%eval 0.45] }
12. Bb3 { [%txt "Le fou revient sur la diagonale a2-g8, contre f7 (+0.13).

À RETENIR.

PRO TIP : la feuille de route après la théorie.
1. Ng3 et Be3.
2. d4 au bon moment.
3. Le levier a4 si les Noirs jouent ...b5."] [%eval 0.13] [%cal Gb3f7] } *`,
    ),
    chapter(
      "Aléatoire surprise 2 : après la Berlinoise 4.d3, le fou enterré",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend la Berlinoise 4.d3 du chapitre précédent jusqu'à 12.Bb3. La théorie s'arrête là. Les Noirs ne font pas de gaffe : ils jouent des coups lents qui laissent les Blancs prendre le centre, puis l'aile dame, puis enfermer un fou. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case faible ou le levier (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quel levier de pion devient possible ? 3. Quelle pièce adverse peut-on priver de cases ?"] [%eval 0.37] }
1. e4 { [%txt "On occupe le centre."] [%eval 0.33] }
1... e5 { [%txt "Symétrie."] [%eval 0.31] }
2. Nf3 { [%txt "On attaque e5."] [%eval 0.28] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.24] }
3. Bb5 { [%txt "On attaque le défenseur de e5."] [%eval 0.28] }
3... Nf6 { [%txt "La Berlinoise."] [%eval 0.26] }
4. d3 { [%txt "On défend e4 simplement."] [%eval 0.19] }
4... Bc5 { [%txt "Le fou sur sa meilleure diagonale."] [%eval 0.25] }
5. c3 { [%txt "On prépare d4."] [%eval 0.23] }
5... O-O { [%txt "Les Noirs roquent."] [%eval 0.23] }
6. O-O { [%txt "Nous aussi."] [%eval 0.24] }
6... d6 { [%txt "Les Noirs soutiennent e5."] [%eval 0.35] }
7. h3 { [%txt "On empêche ...Bg4."] [%eval 0.32] }
7... a6 { [%txt "Le fou est questionné."] [%eval 0.31] }
8. Ba4 { [%txt "On garde le fou."] [%eval 0.33] }
8... Ba7 { [%txt "Le fou évite d4 avec gain de temps."] [%eval 0.34] }
9. Re1 { [%txt "La tour prépare d4."] [%eval 0.37] }
9... Ne7 { [%txt "Le cavalier part vers g6."] [%eval 0.39] }
10. Nbd2 { [%txt "La manœuvre d2-f1-g3 commence."] [%eval 0.22] }
10... Ng6 { [%txt "Le cavalier noir est arrivé."] [%eval 0.30] }
11. Nf1 { [%txt "On continue la manœuvre."] [%eval 0.09] }
11... c6 { [%txt "Les Noirs préparent ...d5."] [%eval 0.45] }
12. Bb3 { [%txt "Fin de la théorie : le fou revient contre f7."] [%eval 0.13] [%cal Gb3f7] }
12... Be6 { [%txt "PREMIÈRE FAUTE, légère : le fou propose l'échange en e6 au lieu d'agir au centre. Le moteur voulait 12...d5, le coup préparé par ...c6."] [%hint "les Noirs ont préparé ...d5 avec ...c6, puis ne le jouent pas."] [%hint "la case d4. Le pion c3 la soutient déjà, et plus rien ne gêne la poussée."] [%hint "13.d4 : on prend le centre avant que ...d5 ne vienne."] [%hintcsl Gd4,Gc3] [%eval 0.40] [%csl Gd4] }
(12... d5 { [%txt "Le bon coup : les Noirs frappent le centre."] [%eval 0.23] }
  13. Bg5 { [%txt "À RETENIR.

PRO TIP : l'équilibre, environ +0.2 ; le fou g5 cloue le cavalier f6 et gêne ...dxe4."] [%eval 0.16] })
13. d4 { [%txt "Le centre classique c3-d4-e4 : le fou a7 regarde maintenant un mur."] [%eval 0.29] [%csl Gd4,Ge4] [%cal Gd4e5] }
13... Qc7 { [%txt "Les Noirs gardent la tension au lieu de prendre en d4 : un peu passif, mais sans gravité."] [%eval 0.48] }
14. Bc2 { [%txt "Le fou évite l'échange contre le fou e6 et reste sur la diagonale b1-h7."] [%eval 0.52] [%cal Gc2h7] }
14... h6 { [%txt "Les Noirs empêchent Bg5."] [%eval 0.45] }
15. Be3 { [%txt "Le dernier fou se développe et surveille le fou a7."] [%eval 0.47] [%cal Ge3a7] }
15... b5 { [%txt "DEUXIÈME FAUTE : ce pion avance sans soutien et devient une cible. 15...Rad8 était plus solide."] [%hint "un pion qui avance à l'aile dame offre un levier à l'adversaire."] [%hint "le pion b5 peut être attaqué par notre pion a. Après a4, les Noirs devront échanger ou laisser ouvrir la colonne a."] [%hint "16.a4 : le levier contre b5."] [%hintcsl Rb5,Ga4] [%eval 0.64] [%csl Rb5] }
16. a4 { [%txt "LE LEVIER : on attaque b5 avec un pion, comme en Espagnole fermée."] [%eval 0.61] [%cal Ga4b5] }
16... Bb6 { [%txt "Le fou se replace en b6."] [%eval 0.65] }
17. Qd2 { [%txt "La dame relie les tours et vise h6."] [%eval 0.47] [%cal Gd2h6] }
17... c5 { [%txt "Les Noirs gagnent de l'espace, mais le fou b6 se heurte maintenant à son propre pion c5."] [%eval 0.52] }
18. d5 { [%txt "On ferme le centre avec gain de temps sur le fou e6. Désormais, un fou noir sur la diagonale a7-g1 est bloqué par c5."] [%eval 0.56] [%csl Gd5] [%cal Gd5e6] }
18... Bd7 { [%txt "Le fou recule."] [%eval 0.53] }
19. a5 { [%txt "On attaque le fou b6. Le pion a5 est offert : 19...Bxa5 était possible, car la dame c7 défend a5, et 20.Bxh6 récupère alors un pion."] [%eval 0.53] [%cal Ga5b6] }
19... Ba7 { [%txt "TROISIÈME FAUTE : le fou recule dans le coin, derrière son propre pion c5. Il ne sortira plus. Environ +1.3."] [%hint "un fou derrière ses propres pions bloqués ne compte presque plus : c'est un mauvais fou enterré."] [%hint "le fou a7 ne dispose plus que de b8 et b6, et derrière b6 son propre pion c5 ferme la diagonale. Nous jouons maintenant avec une pièce de plus là où ça compte."] [%hint "20.Ng3 : on termine la manœuvre du cavalier et on joue à l'aile roi, là où le fou a7 ne peut pas défendre."] [%hintcsl Ra7,Rc5] [%eval 1.31] [%csl Ra7,Rc5] }
(19... Bxa5 { [%txt "Le bon coup : le fou prend le pion, défendu par la dame."] [%eval 0.63] }
  20. Bxh6 { [%txt "À RETENIR.

PRO TIP : on récupère le pion h6, environ +0.8 ; le roque noir est un peu affaibli."] [%eval 0.84] })
20. Ng3 { [%txt "À RETENIR.

PRO TIP : environ +1.3. Le fou a7 est enterré, les pions a5 et d5 bloquent tout. La suite : Nf5 et Nh2-g4 vers le roque, Bxh6 au bon moment ; l'aile dame est fermée, on attaque là où le fou a7 n'arrive pas. La leçon : dans la Berlinoise 4.d3, la position reste longtemps calme ; on gagne par les leviers d4 puis a4, et en privant une pièce adverse de cases."] [%eval 1.28] [%csl Ra7,Gg3] [%cal Gg3f5] } *`,
    ),
    chapter(
      "Anti-panique : punir les déviations",
      `{ [%txt "Les déviations fréquentes à 1500 Elo, et comment les punir. La ligne principale traite 3...Nd4 ; les variantes traitent 3...Bc5, 3...d6 et le piège de « l'arche de Noé »."] [%eval 0.37] }
1. e4 { [%txt "On occupe le centre."] [%eval 0.33] }
1... e5 { [%txt "Symétrie."] [%eval 0.31] }
2. Nf3 { [%txt "On attaque e5."] [%eval 0.28] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.24] }
3. Bb5 { [%txt "On attaque le défenseur de e5."] [%eval 0.28] }
3... Nd4 { [%txt "La défense Bird : le même cavalier joue deux fois et propose l'échange d'une pièce développée."] [%hint "les Noirs jouent deux fois le même cavalier au lieu de développer une nouvelle pièce."] [%hint "le cavalier d4 n'est défendu que par le pion e5 ; après l'échange, ce pion arrive en d4, trop avancé. Attention à la case g2 si notre cavalier part en e5."] [%hint "4.Nxd4 exd4 5.O-O : on échange, puis on roque. Surtout pas 4.Nxe5, à cause de 4...Qg5."] [%hintcsl Rd4,Re5] [%eval 0.60] [%csl Rd4] }
(3... Bc5 { [%txt "La défense classique : le fou se développe avant que e5 soit solide."] [%hint "le fou sort sur une case qu'un pion blanc pourra attaquer avec gain de temps."] [%hint "la case d4. Soutenue par un pion en c3, la poussée chassera le fou c5."] [%hint "4.c3 : on prépare d4."] [%hintcsl Gd4,Rc5] [%eval 0.61] }
  4. c3 { [%txt "On prépare d4 avec gain de temps sur le fou (+0.55)."] [%eval 0.55] [%cal Gc3d4,Gd4c5] })
(3... d6 { [%txt "La défense Steinitz : passive, le fou f8 est enfermé."] [%hint "un coup passif qui enferme le fou f8 et laisse le cavalier c6 cloué contre le roi e8."] [%hint "la case e5. Le cavalier c6 cloué la défend mal, et un pion en d4 la frappe tout de suite."] [%hint "4.d4 : on attaque e5 sans attendre."] [%hintcsl Re5,Rc6] [%eval 0.60] }
  4. d4 { [%txt "Le clouage sur c6 empêche les Noirs de bien tenir e5 (+0.61)."] [%eval 0.61] [%cal Gd4e5,Gb5c6] })
(3... a6 { [%txt "La suite normale…"] [%eval 0.37] }
  4. Ba4 { [%txt "…on garde le fou."] [%eval 0.38] }
  4... d6 { [%txt "Les Noirs préparent le piège de l'arche de Noé."] [%eval 0.45] }
  5. c3 { [%txt "Le bon coup (+0.43) : on prépare d4 et on garde la case c2 pour le fou."] [%eval 0.43] }
  (5. d4 { [%txt "Plausible, mais c'est ici que le piège commence."] [%eval 0.18] }
    5... b5 { [%txt "On chasse le fou."] [%eval 0.13] }
    6. Bb3 { [%txt "Le fou recule."] [%eval 0.10] }
    6... Nxd4 { [%txt "Le cavalier échange…"] [%eval 0.08] }
    7. Nxd4 { [%txt "…on reprend…"] [%eval 0.07] }
    7... exd4 { [%txt "…et le pion reprend."] [%eval 0.04] }
    8. Qxd4 { [%txt "La faute : -2.75. Il fallait jouer 8.c3, qui sacrifie un pion pour l'activité, avec une évaluation proche de l'égalité."] [%hint "la dame reprend au centre, où un pion noir peut la chasser avec gain de temps."] [%hint "le fou b3. Après ...c5 puis ...c4, il n'aura plus aucune case de repli."] [%hint "8...c5, puis ...Be6 et ...c4 : le fou b3 est pris au piège de l'arche de Noé."] [%hintcsl Rb3,Rc4] [%eval -2.75] }
    8... c5 { [%txt "Le pion attaque la dame…"] [%eval -2.74] }
    9. Qd5 { [%txt "…qui menace a8…"] [%eval -2.77] }
    9... Be6 { [%txt "…mais le fou intercepte."] [%eval -2.91] }
    10. Qc6+ { [%txt "La dame donne un échec…"] [%eval -2.90] }
    10... Bd7 { [%txt "…le fou s'interpose encore…"] [%eval -2.96] }
    11. Qd5 { [%txt "…la dame revient…"] [%eval -3.00] }
    11... c4 { [%txt "…et le fou b3 est pris au piège : il n'a plus aucune case."] [%eval -2.97] [%csl Rb3] [%cal Rc4b3] })
  5... b5 { [%txt "Les Noirs chassent le fou."] [%eval 0.63] }
  6. Bc2 { [%txt "Le repli sûr (+0.50) : le fou échappe à l'encerclement ...c5-c4."] [%eval 0.50] }
  (6. d4 { [%txt "Une grosse erreur…"] [%hint "le pion b5 attaque le fou a4 depuis le coup précédent, et les Blancs ne s'en occupent pas."] [%hint "la case a4. Aucune pièce blanche n'y défend le fou."] [%hint "6...bxa4 : les Noirs gagnent une pièce."] [%hintcsl Ra4] [%eval -3.70] }
    6... bxa4 { [%txt "…le fou a4 était encore attaqué : -3.50."] [%eval -3.50] }))
4. Nxd4 { [%txt "On accepte l'échange. Surtout pas 4.Nxe5, qui serait une erreur : 4...Qg5 attaquerait à la fois le cavalier e5 et le pion g2."] [%eval 0.64] [%csl Rg2,Re5] }
4... exd4 { [%txt "Le pion reprend et arrive en d4, trop avancé."] [%eval 0.62] }
5. O-O { [%txt "Le roi d'abord (+0.63).

À RETENIR.

PRO TIP : la feuille de route après la théorie.
1. d3, Re1, Bc4 et f4 pour attaquer l'aile roi pendant que les Noirs sont en retard.
2. Contre ...d6 puis ...b5, retiens le repli Bc2 et ne prends jamais en d4 avec la dame."] [%eval 0.63] [%csl Rd4] } *`,
    ),
  ],
};
