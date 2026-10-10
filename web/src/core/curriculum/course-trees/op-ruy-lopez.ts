import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours d'ouverture « Partie Espagnole / Ruy Lopez (avec les Blancs) » —
 * refonte de l'onglet Ouvertures du 2026-10-10, au format « un commentaire
 * par coup » de l'Académie (même découpage que `op-scotch-game.ts`) : fiche
 * d'identité (chapitre 1), arbre théorique (chapitres 2-5 : Chigorine,
 * Anti-Marshall, Ouverte, Berlinoise 4.d3), anti-panique (chapitre 6),
 * feuille de route en PRO TIP de fin de branche.
 *
 * Chaque coup, variantes et pièges compris, contrôlé avec Stockfish 18
 * (profondeur 14, `scripts/_tmp-probe.mts`) ; les évaluations citées en
 * viennent. Prose entièrement originale.
 */

function chapter(title: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, START) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const OP_RUY_LOPEZ: CourseTree = {
  chapters: [
    chapter(
      "Fiche d'identité et tronc commun",
      `{ LA PARTIE ESPAGNOLE (RUY LOPEZ), AVEC LES BLANCS.

Le vrai enjeu : mettre e5 sous pression en attaquant son défenseur, le cavalier c6, puis construire le centre idéal c3 + d4, que les Noirs devront soit céder, soit subir.

Le déséquilibre recherché : un avantage d'espace au centre et à l'aile roi, sans échanger. Notre fou espagnol (a4, puis b3, puis c2) vise le roque noir et reste notre meilleure pièce.

Les structures types (relevées sur la position finale de chaque branche) :
- A, Fermée Chigorine : Blancs a3-b2, d4-e4, f2-g2-h3 ; Noirs a6-b5, d6-e5, f7-g7-h7. Colonne c ouverte, tension d4/e5.
- B, Anti-Marshall : Blancs a3-b2-c2-d3-e4, f2-g2-h3 ; Noirs a6-b5-c7-d6-e5, f7-g7-h7. Fermée et symétrique : une partie de manœuvres.
- C, Ouverte : Blancs a2-b2-c3, e5, f2-g2-h2 ; Noirs a6-b5-c7, d4, f7-g7-h7. Pion e5 avancé et majorité à l'aile roi pour les Blancs, pion d4 avancé pour les Noirs.
- D, Berlinoise avec 4.d3 : Blancs a2-b2-c3-d3-e4, f2-g2-h3 ; Noirs a6-b7-c6-d6-e5, f7-g7-h7. Une « Italienne lente », fermée et équilibrée. }
1. e4 { On occupe le centre et on libère le fou f1 et la dame. }
1... e5 { Symétrie. }
2. Nf3 { Le cavalier se développe en attaquant e5. [%cal Gf3e5] }
2... Nc6 { Le cavalier défend e5. }
3. Bb5 { On attaque le défenseur de e5. Contrairement à 3.Bc4, le fou ne vise pas f7 : il exerce une pression de long terme sur le cavalier c6. [%cal Gb5c6,Gc6e5] }
3... a6 { Les Noirs questionnent le fou tout de suite. (3...Nf6 : chapitre « Berlinoise ».) }
4. Ba4 { On garde le fou et la pression. 4.Bxc6, l'Espagnole d'échange, est jouable mais moins ambitieux (+0.21 contre +0.46). [%cal Ga4c6] }
4... Nf6 { Les Noirs contre-attaquent e4. [%cal Rf6e4] }
5. O-O { On ne défend pas e4, et c'est voulu. Si 5...Nxe4, alors 6.d4 récupère le pion avec un jeu actif (chapitre « Ouverte »). Le roque met d'abord le roi à l'abri et prépare Re1.

PRO TIP : en Espagnole, la menace Bxc6 suivie de Nxe5 n'est pas encore réelle tant que e4 n'est pas défendu : après Bxc6 dxc6 Nxe5, la dame noire viendrait en d4 et récupérerait le pion e4. Elle ne devient réelle qu'une fois e4 défendu, d'où l'importance de Re1. [%csl Ge4] } *`,
    ),
    chapter(
      "Branche A : la Fermée, système Chigorine",
      `{ La ligne principale de l'Espagnole. Les Noirs jouent solidement (...Be7, ...b5, ...d6), les Blancs construisent c3 + d4 et gardent leur fou espagnol sur la diagonale b1-h7. }
1. e4 { On occupe le centre. }
1... e5 { Symétrie. }
2. Nf3 { On attaque e5. }
2... Nc6 { Défense de e5. }
3. Bb5 { On attaque le défenseur de e5. }
3... a6 { Le fou est questionné. }
4. Ba4 { On garde le fou. }
4... Nf6 { Contre-attaque sur e4. }
5. O-O { Le roi d'abord : e4 est « empoisonné ». }
5... Be7 { Un développement solide : les Noirs préparent le roque. }
6. Re1 { La tour défend e4 pour de bon, ce qui crée la menace Bxc6 puis Nxe5. [%cal Ge1e4,Ga4c6] }
6... b5 { Les Noirs chassent le fou pour supprimer cette menace. [%cal Rb5a4] }
7. Bb3 { Le seul bon coup : le fou recule en visant f7. [%cal Gb3f7] }
(7. d4 { Une grosse erreur : le fou a4 est toujours attaqué… } 7... bxa4 { …et les Noirs le prennent : -2.1. [%csl Ra4] })
7... d6 { Le pion soutient e5 et libère le fou c8. (7...O-O : chapitre « Anti-Marshall ».) }
8. c3 { On prépare d4 et on offre au fou une case de repli en c2. [%cal Gc3d4] }
8... O-O { Les Noirs roquent. }
9. h3 { Un coup prophylactique : on empêche ...Bg4, qui clouerait le cavalier f3, défenseur de d4. Sans h3, d4 se heurte à ...Bg4. [%csl Rg4] }
9... Na5 { Le cavalier chasse le fou b3. (9...Be6 et 9...Bb7 sont aussi bons.) [%cal Ra5b3] }
10. Bc2 { On garde le fou sur la diagonale b1-h7, tournée vers le roque noir. [%cal Gc2h7] }
(10. d4 { Prématuré… } 10... Nxb3 { …le cavalier échange notre meilleure pièce… } 11. axb3 { …et l'avantage blanc disparaît (0.00 contre +0.60). })
10... c5 { Les Noirs gagnent de l'espace et préparent ...Nc6. }
11. d4 { Le centre idéal est en place : c3, d4 et e4. [%csl Gd4,Ge4] }
11... Qc7 { La dame renforce e5 et se place face à notre fou c2 sur la colonne c. }
12. Nbd2 { Le cavalier entame le voyage d2-f1-g3, vers l'aile roi. 12.d5, qui ferme le centre, vaut autant (+0.56). [%cal Gd2f1] }
12... cxd4 { Les Noirs ouvrent la colonne c. }
13. cxd4 { La reprise est obligatoire. [%cal Gc3d4] }
(13. Nb3 { Une faute : le pion c3 tombe… } 13... dxc3 { …et la colonne c s'ouvre sur nous : -1.63. })
13... Nc6 { Le cavalier revient au centre : il attaque d4 et vise b4. [%cal Rc6d4,Rc6b4] }
14. a3 { Le choix du moteur (+0.53) : on interdit b4, d'où ...Nb4 frapperait le fou c2.

PRO TIP, la feuille de route après la théorie :
1. La manœuvre Nd2-f1-g3 (ou e3) amène le cavalier à l'aile roi. Avec le fou c2 et la dame, elle prépare Nf5 ou une attaque sur h7.
2. Choisir le bon moment pour d5 : on ferme le centre, puis on joue à l'aile roi (Nh2, f4 ou g4), pendant que les Noirs cherchent ...c4 et ...Nc5.
3. Tenir la colonne c ouverte : Bd3 ou Bb1, puis Rc1, sans jamais laisser ...Nb4 frapper c2. [%csl Gb4][%cal Ga3b4] }
(14. Nb3 { Le coup classique, toujours bon (+0.41) : le cavalier défend d4 et surveille a5 et c5. })
*`,
    ),
    chapter(
      "Branche B : l'Anti-Marshall (7...O-O 8.h3)",
      `{ Avec 7...O-O, les Noirs préparent 8.c3 d5, l'attaque Marshall : un sacrifice de pion très théorique. Le moteur préfère un peu 8.c3 (+0.54 contre +0.32), mais il faudrait alors connaître toute la Marshall. Pour un répertoire 1500-1800, 8.h3 est le meilleur rapport entre théorie et résultat. }
1. e4 { On occupe le centre. }
1... e5 { Symétrie. }
2. Nf3 { On attaque e5. }
2... Nc6 { Défense de e5. }
3. Bb5 { On attaque le défenseur de e5. }
3... a6 { Le fou est questionné. }
4. Ba4 { On garde le fou. }
4... Nf6 { Contre-attaque sur e4. }
5. O-O { Le roi d'abord. }
5... Be7 { Développement solide. }
6. Re1 { La tour défend e4. }
6... b5 { On chasse le fou. }
7. Bb3 { Le fou recule en visant f7. }
7... O-O { Un ordre de coups qui prépare la Marshall (8.c3 d5!). }
8. h3 { On évite la Marshall : sans c3, ...d5 n'a plus le même mordant. h3 empêche aussi ...Bg4. [%csl Rg4] }
8... Bb7 { Le fou noir vise e4 sur la grande diagonale. [%cal Rb7e4] }
9. d3 { On défend e4 solidement : on choisit une structure fermée. [%cal Gd3e4] }
9... d6 { Les Noirs soutiennent e5. (9...d5 est le coup le plus actif, et reste équilibré.) }
10. a3 { On garde la case b4 et on prépare Nc3 ou Ba2. 10.c3 est équivalent (+0.35).

PRO TIP, la feuille de route après la théorie : Nbd2 (ou Nc3), puis Ba2 et Nh2-g4 pour viser l'aile roi ; on prépare le levier d4 au bon moment. Si les Noirs jouent ...d5, on échange en exd5 et on prend la colonne e. [%csl Gb4] } *`,
    ),
    chapter(
      "Branche C : l'Ouverte (5...Nxe4)",
      `{ Les Noirs acceptent le « cadeau » de 5.O-O. On ouvre tout de suite le centre pendant que leur roi est encore en e8, puis on récupère le pion avec un jeu plus actif. }
1. e4 { On occupe le centre. }
1... e5 { Symétrie. }
2. Nf3 { On attaque e5. }
2... Nc6 { Défense de e5. }
3. Bb5 { On attaque le défenseur de e5. }
3... a6 { Le fou est questionné. }
4. Ba4 { On garde le fou. }
4... Nf6 { Contre-attaque sur e4. }
5. O-O { e4 est laissé en prise, exprès. }
5... Nxe4 { Les Noirs prennent le pion. }
6. d4 { On ouvre le centre pendant que le roi noir est en e8. Meilleur que 6.Re1 (+0.50 contre +0.10). [%cal Gd4e5] }
6... b5 { Obligatoire : il faut chasser le fou avant que dxe5 ne vienne avec gain de temps. [%cal Rb5a4] }
7. Bb3 { Le fou recule en visant d5 et f7. }
(7. Re1 { Plausible mais mauvais… } 7... Nxf2 { …le cavalier prend f2 et vise la dame d1 : -0.31. [%csl Rf2] })
7... d5 { Les Noirs soutiennent le cavalier e4. }
8. dxe5 { On récupère le pion et on gagne de l'espace. [%csl Ge5] }
8... Be6 { Le fou protège d5. }
9. Nbd2 { On attaque le cavalier e4 tout de suite. (9.c3 est équivalent.) [%cal Gd2e4] }
9... Nc5 { Le cavalier recule en attaquant le fou b3. }
10. c3 { On donne la case c2 au fou et on prépare la lutte contre ...d4. }
10... Be7 { Développement. }
11. Bc2 { Le fou s'abrite et vise h7. [%cal Gc2h7] }
11... d4 { Les Noirs avancent leur pion central. }
12. Nb3 { Le cavalier attaque c5 et d4 en même temps (+0.35).

PRO TIP, la feuille de route après la théorie : bloquer d4 et c5 avec nos pièces (Nfxd4, Be3), attaquer le pion d4 qui sera isolé, et pousser f4-f5 avec la majorité de l'aile roi. [%cal Gb3c5,Gb3d4] } *`,
    ),
    chapter(
      "Branche D : la Berlinoise, système 4.d3",
      `{ La Berlinoise (3...Nf6) est une défense très solide. On évite sa finale théorique (4.O-O Nxe4 5.d4) avec le système simple 4.d3, presque aussi bon (+0.33 contre +0.35) : on vise une partie de manœuvres « à l'italienne ». }
1. e4 { On occupe le centre. }
1... e5 { Symétrie. }
2. Nf3 { On attaque e5. }
2... Nc6 { Défense de e5. }
3. Bb5 { On attaque le défenseur de e5. }
3... Nf6 { La Berlinoise : les Noirs contre-attaquent e4 tout de suite. [%cal Rf6e4] }
4. d3 { On défend e4 sans entrer dans la finale berlinoise, trop théorique pour ce niveau. [%cal Gd3e4] }
4... Bc5 { Le fou se développe sur sa meilleure diagonale. }
5. c3 { On prépare d4 et on donne de la place au fou. }
5... O-O { Les Noirs roquent. }
6. O-O { Nous aussi. }
6... d6 { Les Noirs soutiennent e5. }
7. h3 { On empêche ...Bg4. [%csl Rg4] }
7... a6 { Le fou est questionné. }
8. Ba4 { On garde le fou : un échange sur c6 relâcherait la tension. }
8... Ba7 { Le fou recule pour éviter que d4 ne vienne avec gain de temps. }
9. Re1 { La tour soutient e4 et prépare d4. }
9... Ne7 { Le cavalier part vers g6. }
10. Nbd2 { La manœuvre espagnole classique commence : d2, puis f1, puis g3. [%cal Gd2f1,Gf1g3] }
10... Ng6 { Le cavalier noir est arrivé. }
11. Nf1 { On continue la manœuvre. }
11... c6 { Les Noirs préparent ...d5. }
12. Bb3 { Le fou revient sur la diagonale a2-g8, contre f7 (+0.20).

PRO TIP, la feuille de route après la théorie : Ng3 et Be3, puis d4 au bon moment ; le levier a4 si les Noirs jouent ...b5. [%cal Gb3f7] } *`,
    ),
    chapter(
      "Anti-panique : punir les déviations",
      `{ Les déviations fréquentes à 1500 Elo, et comment les punir. La ligne principale traite 3...Nd4 ; les variantes traitent 3...Bc5, 3...d6 et le piège de « l'arche de Noé ». }
1. e4 { On occupe le centre. }
1... e5 { Symétrie. }
2. Nf3 { On attaque e5. }
2... Nc6 { Défense de e5. }
3. Bb5 { On attaque le défenseur de e5. }
3... Nd4 { La défense Bird : le même cavalier joue deux fois et propose l'échange d'une pièce développée. [%csl Rd4] }
(3... Bc5 { La défense classique : le fou se développe avant que e5 soit solide. } 4. c3 { On prépare d4 avec gain de temps sur le fou (+0.52). [%cal Gc3d4,Gd4c5] })
(3... d6 { La défense Steinitz : passive, le fou f8 est enfermé. } 4. d4 { Le clouage sur c6 empêche les Noirs de bien tenir e5 (+0.51). [%cal Gd4e5,Gb5c6] })
(3... a6 { La suite normale… } 4. Ba4 { …on garde le fou. } 4... d6 { Les Noirs préparent le piège de l'arche de Noé. } 5. c3 { Le bon coup (+0.53) : on prépare d4 et on garde la case c2 pour le fou. } (5. d4 { Plausible, mais c'est ici que le piège commence. } 5... b5 { On chasse le fou. } 6. Bb3 { Le fou recule. } 6... Nxd4 { Le cavalier échange… } 7. Nxd4 { …on reprend… } 7... exd4 { …et le pion reprend. } 8. Qxd4 { La faute : -2.35. Il fallait jouer 8.c3!, qui sacrifie un pion pour l'activité (+0.20). } 8... c5 { Le pion attaque la dame… } 9. Qd5 { …qui menace a8… } 9... Be6 { …mais le fou intercepte. } 10. Qc6+ { La dame donne un échec… } 10... Bd7 { …le fou s'interpose encore… } 11. Qd5 { …la dame revient… } 11... c4 { …et le fou b3 est pris au piège : il n'a plus aucune case. [%csl Rb3][%cal Rc4b3] }) 5... b5 { Les Noirs chassent le fou. } 6. Bc2 { Le repli sûr (+0.64) : le fou échappe à l'encerclement ...c5-c4. } (6. d4 { Une grosse erreur… } 6... bxa4 { …le fou a4 était encore attaqué : -3.2. }))
4. Nxd4 { On accepte l'échange. Surtout pas 4.Nxe5, qui serait une erreur (-2.37) : 4...Qg5 attaquerait à la fois le cavalier e5 et le pion g2. [%csl Rg2,Re5] }
4... exd4 { Le pion reprend et arrive en d4, trop avancé. }
5. O-O { Le roi d'abord (+0.52), puis d3, Re1, Bc4 et f4 pour attaquer l'aile roi pendant que les Noirs sont en retard.

PRO TIP : contre ...d6 puis ...b5, retiens le repli Bc2 et ne prends jamais en d4 avec la dame. [%csl Rd4] } *`,
    ),
  ],
};
