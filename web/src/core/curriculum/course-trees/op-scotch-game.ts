import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours d'ouverture « Partie Écossaise (avec les Blancs) » — refonte de
 * l'onglet Ouvertures du 2026-10-10, au format « un commentaire par coup » de
 * l'Académie. Structure en 5 parties demandée par l'utilisateur : fiche
 * d'identité (chapitre 1), arbre théorique profond (chapitres 2-3), module
 * anti-panique (chapitre 4), feuille de route du milieu de jeu (PRO TIP de
 * fin des chapitres 2-3). La partie « architecture technique » (nœuds clés,
 * modes avec/sans guide) relève du code, pas du cours.
 *
 * Lignes choisies pour un public 1500-1800 (5.Nc3 plutôt que la Mieses
 * 5.Nxc6 contre 4...Nf6) puis contrôlées coup par coup avec Stockfish 18
 * (profondeur 14-16, `scripts/_tmp-probe.mts`) : chaque évaluation citée
 * vient de ce contrôle. Prose entièrement originale.
 */

function chapter(title: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, START) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const OP_SCOTCH_GAME: CourseTree = {
  chapters: [
    chapter(
      "Fiche d'identité et tronc commun",
      `{ LA PARTIE ÉCOSSAISE, AVEC LES BLANCS.

Le vrai enjeu : ouvrir le centre tout de suite, avant que les Noirs aient fini leur développement, et garder un pion e4 contre un pion d6 ou d7, donc plus d'espace.

Le déséquilibre recherché : l'échange Nxc6 laisse souvent aux Noirs des pions c doublés ou un pion a isolé, des cibles fixes pour toute la partie. En échange, les Noirs reçoivent un jeu de pièces actif (colonne b semi-ouverte, centre mobile).

Les structures types (relevées sur la position finale de chaque branche) :
- Branche A (4...Nf6) : Blancs a2-b2-c2 et f2-g2-h2, sans faiblesse ; Noirs a7 isolé, duo c6-d5, f7-g7-h7. La case c5 n'est plus contrôlée par aucun pion noir.
- Branche B (4...Bc5) : finale sans dames. Blancs a4-b2-c2, e4, f2-f3-h2 (colonne g ouverte) ; Noirs a5, c6-c7 doublés, d6, f7-g7-h7. }
1. e4 { Le pion occupe le centre et ouvre les diagonales du fou f1 et de la dame. [%csl Ge4] }
1... e5 { Les Noirs prennent leur part du centre. }
2. Nf3 { Le cavalier se développe en attaquant e5 : les Noirs doivent répondre tout de suite. [%cal Gf3e5] }
2... Nc6 { Le cavalier défend e5 en se développant. }
3. d4 { Le coup de l'Écossaise : on attaque e5 une deuxième fois, immédiatement. L'Espagnole (3.Bb5) met plus de temps à faire pression sur e5. Ici, le fou c1 respire aussi. [%cal Gd4e5,Gf3e5] }
3... exd4 { Pratiquement forcé : 3...d6 est passif (voir le chapitre anti-panique). }
4. Nxd4 { On reprend avec une pièce : le centre est à nous, pion e4 contre pion d7.

PRO TIP : 4.c3 et 4.Bc4 sont des gambits plus théoriques. 4.Nxd4 garde un jeu simple et sain. Les Noirs choisissent maintenant entre 4...Nf6 (branche A) et 4...Bc5 (branche B). [%csl Ge4,Gd4] } *`,
    ),
    chapter(
      "Branche A : 4...Nf6 5.Nc3, la structure c6-d5",
      `{ La réponse la plus jouée. Les Noirs attaquent e4 tout de suite. On choisit 5.Nc3, plus simple à apprendre que la variante Mieses (5.Nxc6), et on vise une position où le duo noir c6-d5 devient une cible. }
1. e4 { On occupe le centre. }
1... e5 { Symétrie. }
2. Nf3 { Le cavalier attaque e5. }
2... Nc6 { Défense de e5. }
3. d4 { On ouvre le centre. }
3... exd4 { Les Noirs prennent. }
4. Nxd4 { Reprise par une pièce. }
4... Nf6 { Développement avec gain de temps : e4 est attaqué. [%cal Rf6e4] }
5. Nc3 { On défend e4 en développant une pièce. [%cal Gc3e4] }
(5. Nxc6 { La Mieses, que Stockfish préfère légèrement (+0.38 contre +0.17). } 5... bxc6 { Reprise vers le centre. } 6. e5 { Le pion chasse le cavalier f6 : c'est ambitieux, mais la théorie qui suit est très longue. Pour un répertoire 1500-1800, 5.Nc3 suffit. })
5... Bb4 { Le fou cloue le cavalier c3 : son défenseur peut disparaître après ...Bxc3, puis ...Nxe4. [%cal Rb4c3,Rf6e4] }
6. Nxc6 { On échange avant que le cavalier d4 devienne une cible, et on prépare Bd3, qui défendra e4 solidement. 6.f3 et 6.Bc4 sont moins bons (environ -0.2). }
6... bxc6 { Reprise vers le centre. }
(6... dxc6 { Cette reprise ouvre la colonne d… } 7. Qxd8+ { …et l'échange des dames se fait avec échec. } 7... Kxd8 { Le roi noir perd le droit de roquer : environ +0.6 pour les Blancs. [%csl Rd8] })
7. Bd3 { Le fou défend e4 et prépare le petit roque. [%cal Gd3e4] }
7... d5 { Les Noirs frappent le centre. [%cal Rd5e4] }
8. exd5 { On ouvre la colonne e pendant que le roi noir est encore en e8. [%cal Ge1e8] }
(8. e5 { Le pion avance… } 8... Ng4 { …mais le cavalier trouve une belle case et vise e5, f2 et h2 : environ -0.24 pour les Blancs. [%csl Re5] })
8... cxd5 { Les Noirs reprennent vers le centre. (8...Qe7+ 9.Qe2 mène à une finale égale.) }
9. O-O { On met le roi à l'abri et on prépare Re1. On ne craint pas ...Bxc3 : après bxc3, on aurait la paire de fous. }
9... O-O { Les Noirs roquent aussi. }
10. Bg5 { Le fou cloue le cavalier f6, qui défend d5. 10.h3 et 10.Qf3 se valent (environ +0.18). [%cal Gg5f6,Gf6d5] }
10... c6 { Les Noirs consolident d5 avant que Bxf6 ne supprime son défenseur. [%csl Rd5] }
11. Qf3 { La dame ajoute sa pression sur f6 et d5 et regarde l'aile roi. [%cal Gf3f6,Gf3d5] }
11... Be7 { Le fou décloue le cavalier. 11...Rb8 et 11...Bd6 sont un peu plus précis. }
12. Rae1 { La tour a1 prend la colonne e. On garde la tour f1 pour soutenir une éventuelle poussée f4. 12.h3 et 12.Rfe1 se valent. [%cal Ge1e7] }
12... Rb8 { La tour noire utilise la colonne b semi-ouverte contre b2. [%cal Rb8b2] }
13. Na4 { Le cavalier va vers c5 : c'est l'avant-poste que plus aucun pion noir ne peut chasser. Il évite aussi ...Rb4 et ...d4 avec gain de temps (+0.25).

PRO TIP, la feuille de route après la théorie :
1. Installer un cavalier en c5 (Na4-c5), puis jouer b3 et Bd4 ou Bf4. Le cavalier bloque ...c5 et frappe d7, e6 et b7.
2. Viser d5 : Bxf6 supprime son défenseur, puis on double sur la colonne d et on prépare le levier c4.
3. Tenir la colonne e (Re1, Re3 vers g3 ou h3) pour attaquer le roi si les Noirs restent passifs.
À empêcher : ...c5-c4 et ...d4, qui rendraient le duo noir mobile. On bloque sur les cases devant ces pions (c5 et d4). [%csl Gc5,Rd5,Rc6][%cal Ga4c5] } *`,
    ),
    chapter(
      "Branche B : 4...Bc5 5.Nxc6 Qf6 6.Qf3, la finale sans dames",
      `{ La défense classique : le fou c5 attaque le cavalier d4 et vise f2. On simplifie par 5.Nxc6, puis on pare la menace de mat par 6.Qf3. On arrive à une finale où les pions c doublés des Noirs seront notre cible. }
1. e4 { On occupe le centre. }
1... e5 { Symétrie. }
2. Nf3 { On attaque e5. }
2... Nc6 { Défense de e5. }
3. d4 { On ouvre le centre. }
3... exd4 { Les Noirs prennent. }
4. Nxd4 { Reprise par une pièce. }
4... Bc5 { Le fou attaque le cavalier d4 une deuxième fois : le cavalier c6 et le fou c5 contre la seule dame d1. [%cal Rc5d4,Rc6d4] }
5. Nxc6 { On règle la tension tout de suite. 5.Nb3 (le meilleur coup du moteur, +0.34) et 5.Be3 sont aussi bons, mais 5.Be3 demande plus de théorie. }
5... Qf6 { Un coup intermédiaire avec une menace de mat : ...Qxf2 serait mat. La dame couvre d2 et le fou c5 protège f2. [%csl Rf2][%cal Rf6f2,Rc5f2] }
6. Qf3 { On pare le mat et on propose l'échange des dames. Le moteur préfère ce coup à 6.Qd2 (-0.28) et à 6.Qe2. [%cal Gf3f2] }
6... bxc6 { Les Noirs reprennent vers le centre. (6...Qxf3 7.gxf3 bxc6 donne le même type de structure.) }
7. Nd2 { Le cavalier se dirige vers b3 pour chasser le fou c5 avec gain de temps. En c3, il pourrait subir ...Bd4. 7.Nc3 vaut autant. [%cal Gd2b3] }
7... d6 { Le pion libère le fou c8. }
8. Nb3 { Gain de temps sur le fou. [%cal Gb3c5] }
8... Bb6 { Le fou garde la diagonale a7-g1, toujours tournée vers f2. [%cal Rb6f2] }
9. Bd2 { On prépare Bc3 contre g7 et f6, et le grand roque. }
9... Qxf3 { Les Noirs échangent les dames. }
(9... Ne7 { Une erreur fréquente : ce coup laisse la dame f6 défendue une seule fois… } 10. Qxf6 { …et on échange tout de suite. Après la reprise forcée, le pion f6 sera faible (+0.73). } (10. O-O-O { Mauvaise idée : le roque laisse f2 sans défenseur… } 10... Qxf3 { …les Noirs échangent les dames… } 11. gxf3 { …la reprise est forcée… } 11... Bxf2 { …et le fou prend le pion f2 : environ -0.7 pour les Blancs. [%csl Rf2] }) 10... gxf6 { La reprise est forcée : la structure noire est abîmée. } 11. Bc3 { Le fou attaque f6 tout de suite. [%cal Gc3f6] } 11... Rg8 { La tour cherche du contre-jeu sur la colonne g. } 12. Bxf6 { Les Blancs gagnent un pion net (+0.93). [%csl Gf6] })
10. gxf3 { La reprise est forcée. La colonne g s'ouvre pour notre tour. [%cal Gh1g1] }
10... a5 { Les Noirs préparent ...a4, qui chasserait le cavalier b3. [%cal Ra5a4] }
11. a4 { On bloque le pion et on le fixe en a5. }
11... Ne7 { Le cavalier se développe. }
12. Be3 { On propose l'échange du fou b6, la meilleure pièce noire.

PRO TIP, la feuille de route après la théorie :
1. Colonne g ouverte : Rg1 contre g7, puis Rg5 ou Rg3.
2. Les pions c doublés : un cavalier en d4 contre c6, le roi au centre ou le grand roque, puis Rd1 contre d6.
3. Les leviers f4-f5 et c4-c5 ouvrent des lignes et fixent les faiblesses noires. [%csl Rc6,Rc7][%cal Ge3b6] } *`,
    ),
    chapter(
      "Anti-panique : punir les déviations",
      `{ À 1500 Elo, les adversaires sortent souvent de la théorie avant le 4e coup. Chaque déviation viole un principe : il faut savoir lequel, et comment le punir. La ligne principale traite 3...d6 ; les variantes traitent 3...Nxd4, 4...Qh4, 4...Nxd4 et 4...Bb4+. }
1. e4 { On occupe le centre. }
1... e5 { Symétrie. }
2. Nf3 { On attaque e5. }
2... Nc6 { Défense de e5. }
3. d4 { On ouvre le centre. }
3... d6 { Ce coup défend e5 au lieu de prendre. Le principe violé : la passivité. Le fou f8 reste enfermé derrière d6. [%csl Rf8] }
(3... Nxd4 { Les Noirs échangent leur seule pièce développée, et cela développe notre dame. } 4. Nxd4 { On reprend. } 4... exd4 { La seule bonne reprise. } (4... Nf6 { Si les Noirs ne reprennent pas… } 5. Nb5 { …ce cavalier menace Nxc7+ et e5 est en prise : environ +2.5. [%cal Gb5c7] }) 5. Qxd4 { La dame est centralisée et plus aucun cavalier c6 ne peut la chasser (+0.6). On enchaîne Nc3, Be3 et le grand roque. [%csl Gd4] })
(3... exd4 { La prise normale… } 4. Nxd4 { …et la reprise normale. } 4... Qh4 { Une sortie de dame précoce : elle sort avant les pièces légères et deviendra une cible. } (4... Nxd4 { Échanger donne la même chose qu'après 3...Nxd4… } 5. Qxd4 { …une dame centralisée (+0.71). Surtout pas 5.Bc4, qui laisserait une pièce en moins. }) (4... Bb4+ { L'échec ne sert à rien… } 5. c3 { …le fou doit reculer, et Nf5 frappera ensuite g7 (+0.53). [%cal Gc3b4] }) 5. Nc3 { Le meilleur coup du moteur (+0.61) : on développe et on garde l'idée d'un saut en b5 contre c7. } 5... Bb4 { Le fou cloue le cavalier c3 et vise e4. } 6. Be2 { On développe en laissant e4 en prise, exprès. } 6... Qxe4 { La dame prend… } 7. Nb5 { …et le cavalier d4 (le c3 est cloué) menace Nxc7+ avec double attaque sur le roi et la tour a8. Les Blancs ont un jeu dangereux pour le pion (+0.53). [%cal Gb5c7,Gc7a8] })
4. d5 { La punition (+0.74) : on gagne de l'espace avec gain de temps, le cavalier doit retourner en b8 ou partir au bord. [%cal Gd5c6] }
4... Nb8 { Le cavalier recule ; les Noirs ont perdu deux temps. }
5. Bd3 { On développe tranquillement et on prépare c4 pour renforcer la chaîne d5-e4.

PRO TIP : contre les coups passifs, prends l'espace. Contre les sorties de dame précoces, développe-toi en créant des menaces. Contre les échanges prématurés, centralise la pièce qui reprend. [%cal Gc2c4] } *`,
    ),
  ],
};
