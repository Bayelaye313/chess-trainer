import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours d'ouverture « Sicilienne Najdorf (avec les Noirs) » — onglet
 * Ouvertures, format « un commentaire par coup » de l'Académie, lu par
 * `CourseTreeViewer` (route `/ouvertures/sicilian-najdorf/cours`). Public
 * visé : 1500-1800 Elo, répertoire contre 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4
 * Nf6 5.Nc3 a6.
 *
 * ## Contenu (v2 du 2026-10-18, format Ruy Lopez v2, côté Noirs)
 *
 * 1. Fiche d'identité, tronc commun et l'Attaque Anglaise 6.Be3.
 * 2. Aléatoire surprise 1 : après l'Attaque Anglaise, la case f4.
 * 3. Branche B : 6.Bg5 et le Pion empoisonné (7...Qb6).
 * 4. Aléatoire surprise 2 : après le Pion empoisonné, le clouage en c3.
 * 5. Branche C : 6.Be2, la Classique.
 * 6. Branche D : 6.Bc4, l'Attaque Sozin-Fischer.
 * 7. Branche E : 6.f4, la Variante Amsterdam.
 * 8. Anti-panique : 6.h3 (système Adams), 6.f3, 6.g3, 6.a4 et 6.Nd5?.
 *
 * Le Dragon (5...g6) a son propre cours (`op-sicilian-dragon.ts`) : ce cours
 * reste dans la structure 5...a6. Les branches théoriques s'arrêtent au plus
 * tard au demi-coup 27 ; seuls les chapitres « Aléatoire surprise » vont
 * au-delà (séquences où les Blancs jouent « mou », prolongées au moteur avec
 * le camp blanc comme camp mou, et la méthode pour les punir en PRO TIP).
 *
 * Convention côté Noirs (comme `op-caro-kann.ts` et `op-sicilian-dragon.ts`) :
 * l'élève joue les Noirs ; les fautes sont des coups BLANCS (variantes ou
 * coups de la ligne des chapitres surprise) qui portent les 3 indices
 * `[%hint]` + `[%hintcsl]`, et le coup noir suivant est la punition. Les
 * « variantes piégées » sont des coups noirs tentants mais perdants. Les
 * évaluations restent au point de vue des Blancs (négatif = avantage noir).
 *
 * Sources : théorie établie de la Najdorf, TOUTES les lignes arbitrées par
 * Stockfish 18 natif (profondeur 16). Écarts assumés avec la théorie usuelle :
 * 12...Nh5 plutôt que 12...b4 dans l'Attaque Anglaise (choix du moteur) ;
 * 12...Qc7 gardé dans la Classique bien que 12...Ng4 soit un peu plus précis.
 * Toute la prose est originale.
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
 *   `[%hintcsl …]` sur les fautes blanches qu'il faut punir.
 *
 * Fichier GÉNÉRÉ : ne pas l'éditer à la main. Source commentée :
 * `scripts/opening-course-src/sicilian-najdorf.pgn` (et l'en-tête
 * `sicilian-najdorf.header.txt`) ; regénérer avec
 * `node --import tsx scripts/_tmp-build-opening-course.mts <source> <en-tête> <sortie> 16`
 * (Stockfish natif, voir `scripts/_tmp-sf-native.mts`). Les `[%eval]` viennent
 * du moteur, pas de la main. Étape standard :
 * `scripts/_tmp-check-cited-evals.mts op-sicilian-najdorf` doit sortir 0 écart
 * (un chiffre n'est cité dans un commentaire que s'il est l'éval d'un nœud).
 * Règles de l'utilisateur : SAN en texte brut uniquement (jamais de figurine
 * Unicode), pas de guillemet droit dans un `[%txt]`.
 */

function chapter(title: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, START) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const OP_SICILIAN_NAJDORF: CourseTree = {
  chapters: [
    chapter(
      "Fiche d'identité, tronc commun et l'Attaque Anglaise (6.Be3)",
      `{ [%txt "LA SICILIENNE NAJDORF, AVEC LES NOIRS.

Le vrai enjeu : 5...a6 ressemble à un coup d'attente, mais il prépare tout. Il interdit Nb5 et Bb5, prépare ...b5 (l'expansion à l'aile dame, le fou en b7) et garde le choix entre ...e5 (on chasse le cavalier d4) et ...e6 (le petit centre e6-d6). Les Blancs doivent dévoiler leur plan avant nous.

Le déséquilibre recherché : nous échangeons le pion c contre le pion d blanc. Les Blancs ont l'espace et l'avance de développement ; nous avons la colonne c semi-ouverte et deux pions centraux (d et e) contre un seul. Plus la partie dure, plus ce pion central de plus compte.

Les structures types (relevées sur la position finale de chaque chapitre) :
- Attaque Anglaise (ce chapitre) : roques opposés, pion blanc fixé en d5, chaîne noire d6-e5 ; nos leviers sont ...f6 et ...b4.
- Pion empoisonné (6.Bg5) : le centre est rasé, nous avons deux pions de plus, les Blancs une grosse avance de développement.
- Classique (6.Be2) : pions noirs d6-e5 contre e4, case d5 au centre de la lutte, roques du même côté.
- Sozin (6.Bc4) : petit centre d6-e6, pions a6-b5 contre le fou b3.
- Amsterdam (6.f4) : le pion f4 échangé contre notre pion e5, cases e5 et c5 pour nos cavaliers.

Règle d'or : chaque coup noir a un rôle précis, dessiné par une flèche ou une case."] [%eval 0.37] }
1. e4 { [%txt "Les Blancs occupent le centre."] [%eval 0.37] }
1... c5 { [%txt "La Sicilienne : on conteste d4 de côté, sans symétrie."] [%eval 0.46] [%cal Gc5d4] }
2. Nf3 { [%txt "Le cavalier prépare d4."] [%eval 0.42] }
2... d6 { [%txt "Le pion contrôle e5 et ouvre la diagonale du fou c8."] [%eval 0.35] [%csl Ge5] [%cal Gc8g4] }
3. d4 { [%txt "La Sicilienne ouverte : les Blancs ouvrent le centre."] [%eval 0.38] }
3... cxd4 { [%txt "On échange un pion d'aile contre un pion central : c'est le marché de la Sicilienne. La colonne c s'ouvre pour nos tours."] [%eval 0.38] [%cal Gc8c1] }
4. Nxd4 { [%txt "Le cavalier reprend au centre."] [%eval 0.48] }
4... Nf6 { [%txt "On attaque e4 avec gain de temps."] [%eval 0.40] [%cal Gf6e4] }
5. Nc3 { [%txt "Le cavalier défend e4."] [%eval 0.39] }
5... a6 { [%txt "LA NAJDORF. Le pion a6 interdit Nb5 et Bb5, prépare ...b5 et laisse les Blancs choisir leur système avant nous."] [%eval 0.33] [%csl Gb5] [%cal Ga6b5] }
6. Be3 { [%txt "L'ATTAQUE ANGLAISE : f3, Qd2, grand roque, puis g4-g5 pour chasser notre cavalier f6."] [%eval 0.35] [%cal Gg2g4] }
6... e5 { [%txt "On chasse le cavalier d4. Le pion d6 devient arriéré et la case d5 se creuse, mais en échange nous prenons notre part du centre. Toute la suite tourne autour de d5."] [%eval 0.39] [%csl Rd5] [%cal Ge5d4] }
7. Nb3 { [%txt "Le cavalier recule en b3, d'où il surveille a5, c5 et d4."] [%eval 0.43] }
(7. Nf5 { [%txt "Un saut actif, mais sans soutien : l'évaluation passe de +0.39 à -0.63."] [%hint "les Blancs avancent un cavalier seul au lieu de garder le contrôle du centre ; le fou c8 l'attaque déjà."] [%hint "la case d5. Avec un pion en e5, la poussée ...d5 frappe e4 et ouvre le jeu pendant que le cavalier f5 reste en l'air."] [%hint "7...d5 : le levier central, et le cavalier f5 reste attaqué par le fou c8."] [%hintcsl Gd5,Re4] [%eval -0.63] }
  7... d5 { [%txt "LE LEVIER : on frappe e4, et le cavalier f5 est toujours attaqué par le fou c8. 7...Bxf5 était jouable, mais moins précis."] [%eval -0.61] [%csl Gd5] [%cal Gd5e4,Gc8f5] }
  8. Bg5 { [%txt "Les Blancs clouent le cavalier f6 pour garder e4."] [%eval -0.57] }
  8... d4 { [%txt "Le pion avance avec gain de temps : le cavalier c3 doit partir."] [%eval -0.55] [%cal Gd4c3] }
  9. Bxf6 { [%txt "Les Blancs éliminent le cavalier."] [%eval -0.62] }
  9... gxf6 { [%txt "On reprend avec le pion g : la structure s'abîme un peu, mais le centre d4-e5 et la paire de fous dominent."] [%eval -0.72] [%csl Gd4,Ge5] }
  10. Nb1 { [%txt "Le cavalier retourne à la maison : les Blancs ont perdu toute leur avance."] [%eval -0.71] }
  10... Be6 { [%txt "À RETENIR.

PRO TIP : -0.79, avantage noir. Le fou attaque le cavalier f5 et notre centre est intact. La leçon : un cavalier blanc qui saute en f5 sans soutien se punit par le levier ...d5, qui ouvre le jeu au moment où les Blancs ne sont pas prêts."] [%eval -0.79] [%cal Ge6f5] })
7... Be6 { [%txt "Le fou se développe et prend d5 sous contrôle. C'est le gardien de la case faible."] [%eval 0.46] [%csl Gd5] [%cal Ge6d5] }
(7... d5 { [%txt "LA VARIANTE PIÉGÉE : la poussée libératrice, mais trop tôt. Le pion d5 est attaqué trois fois (Nc3, e4, Qd1) et défendu deux fois seulement."] [%eval 1.69] [%csl Rd5] [%cal Rc3d5,Re4d5,Rd1d5] }
  8. Nxd5 { [%txt "Le cavalier prend…"] [%eval 1.67] }
  8... Nxd5 { [%txt "…on reprend…"] [%eval 1.77] [%cal Gf6d5] }
  9. Qxd5 { [%txt "…et la dame reprend : si 9...Qxd5, 10.exd5. À RETENIR.

PRO TIP : +1.75, un pion de moins pour rien. En Najdorf, ...d5 ne se joue que si d5 est défendu au moins autant de fois qu'il est attaqué : compte les attaquants avant de pousser."] [%eval 1.75] })
8. f3 { [%txt "Le pion soutient e4, prépare g4 et empêche ...Ng4 contre le fou e3."] [%eval 0.40] [%cal Gf3g4] }
(8. g4 { [%txt "Les Blancs lancent le pion g avant f3 : bonne idée, mauvais ordre. L'évaluation passe de +0.46 à -1.10."] [%hint "les Blancs attaquent avant d'avoir soutenu leur pion g : sans pion en f3, rien ne défend g4."] [%hint "le pion g4. Notre cavalier f6 l'attaque, et notre fou e6 couvre g4 si la dame reprend."] [%hint "8...Nxg4 : on prend le pion ; si 9.Qxg4, 9...Bxg4."] [%hintcsl Rg4,Ge6] [%eval -1.10] }
  8... Nxg4 { [%txt "On croque le pion. Le fou e6 protège le cavalier contre la dame d1."] [%eval -1.19] [%csl Gg4] [%cal Ge6g4] }
  9. Bd2 { [%txt "Le fou évite l'échange ...Nxe3."] [%eval -1.14] }
  9... Be7 { [%txt "À RETENIR.

PRO TIP : -1.16, un pion net de plus et un développement normal. Dans l'Attaque Anglaise, g4 sans f3 est un cadeau : avant de laisser passer une poussée de pion, regarde qui la défend."] [%eval -1.16] [%cal Ge8g8] })
8... Be7 { [%txt "Développement simple : le fou prépare le roque et surveille g5."] [%eval 0.43] [%cal Ge7g5] }
9. Qd2 { [%txt "La dame relie les tours et prépare le grand roque."] [%eval 0.45] }
9... O-O { [%txt "On roque : notre roi part à l'aile roi, celui des Blancs ira à l'aile dame. C'est une course au mat."] [%eval 0.52] [%csl Gg8] }
10. O-O-O { [%txt "Grand roque : les roques sont opposés."] [%eval 0.54] }
10... Nbd7 { [%txt "Le cavalier surveille c5 et e5 et libère la route du pion b."] [%eval 0.61] [%cal Gd7c5,Gb7b5] }
11. g4 { [%txt "L'attaque blanche démarre : g5 chassera le cavalier f6."] [%eval 0.63] [%cal Gg4g5] }
(11. f4 { [%txt "Une poussée centrale prématurée : l'évaluation passe de +0.61 à -0.73."] [%hint "le pion f3 quitte sa case : il ne contrôle plus g4, et le fou e3 perd un soutien naturel."] [%hint "la case g4. Notre cavalier f6 y saute et attaque le fou e3 ; ensuite, le pion f4 tombera."] [%hint "11...Ng4 : le cavalier attaque le fou e3, puis ...exf4."] [%hintcsl Gg4,Re3,Rf4] [%eval -0.73] }
  11... Ng4 { [%txt "Le cavalier saute sur la case abandonnée et attaque le fou e3."] [%eval -0.79] [%csl Gg4] [%cal Gg4e3] }
  12. Kb1 { [%txt "Le roi s'écarte."] [%eval -0.76] }
  12... Nxe3 { [%txt "On prend la paire de fous."] [%eval -0.78] [%cal Gg4e3] }
  13. Qxe3 { [%txt "La dame reprend."] [%eval -0.80] }
  13... exf4 { [%txt "À RETENIR.

PRO TIP : -0.87. Les Noirs ont la paire de fous et la case e5 pour un cavalier. La leçon : chaque poussée de pion abandonne une case ; quand f3 part en f4, la case g4 appartient à notre cavalier."] [%eval -0.87] [%csl Ge5] [%cal Ge3f4] })
11... b5 { [%txt "Notre contre-attaque : ...b4 chassera le cavalier c3, défenseur de e4 et de d5."] [%eval 0.45] [%cal Gb5b4,Gb4c3] }
12. g5 { [%txt "Le cavalier f6 est chassé."] [%eval 0.47] }
12... Nh5 { [%txt "Le cavalier va au bord, mais il vise f4 et laisse la diagonale du fou e7 ouverte vers g5. Le moteur le préfère au classique 12...b4."] [%eval 0.39] [%cal Gh5f4,Ge7g5] }
13. Nd5 { [%txt "Les Blancs occupent la case faible d5."] [%eval 0.38] }
13... Bxd5 { [%txt "On élimine tout de suite ce cavalier : le fou e6 n'avait plus d'autre rôle."] [%eval 0.42] [%cal Ge6d5] }
14. exd5 { [%txt "À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.38).
1. ...f6 : on attaque la tête de chaîne g5 et on ouvre la colonne f pour la tour f8.
2. ...Nf4 : le cavalier h5 trouve sa case idéale, d'où il frappe d5, d3 et h3.
3. ...Nb6 et ...Rc8 : on attaque d5 et on pousse ...b4 contre le roi c1."] [%eval 0.38] [%csl Gf4] [%cal Gf7f6,Gh5f4] } *`,
    ),
    chapter(
      "Aléatoire surprise 1 : après l'Attaque Anglaise, la case f4",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend l'Attaque Anglaise du chapitre précédent jusqu'à 14.exd5. La théorie s'arrête là : nous ouvrons la colonne f, et les Blancs jouent des coups de club qui ont l'air naturels et ne le sont pas. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case faible (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quelle pièce blanche n'est plus défendue ou plus utile ? 3. Quelle pièce noire peut en profiter avec gain de temps ?"] [%eval 0.37] }
1. e4 { [%txt "Le centre."] [%eval 0.37] }
1... c5 { [%txt "La Sicilienne."] [%eval 0.46] [%cal Gc5d4] }
2. Nf3 { [%txt "Le cavalier prépare d4."] [%eval 0.42] }
2... d6 { [%txt "Contrôle de e5."] [%eval 0.35] [%csl Ge5] }
3. d4 { [%txt "La Sicilienne ouverte."] [%eval 0.38] }
3... cxd4 { [%txt "La colonne c s'ouvre."] [%eval 0.38] [%cal Gc8c1] }
4. Nxd4 { [%txt "Reprise."] [%eval 0.48] }
4... Nf6 { [%txt "On attaque e4."] [%eval 0.40] [%cal Gf6e4] }
5. Nc3 { [%txt "Défense de e4."] [%eval 0.39] }
5... a6 { [%txt "La Najdorf."] [%eval 0.33] [%csl Gb5] }
6. Be3 { [%txt "L'Attaque Anglaise."] [%eval 0.35] }
6... e5 { [%txt "On chasse le cavalier."] [%eval 0.39] [%cal Ge5d4] }
7. Nb3 { [%txt "Recul."] [%eval 0.43] }
7... Be6 { [%txt "Le gardien de d5."] [%eval 0.46] [%csl Gd5] }
8. f3 { [%txt "Soutien de e4."] [%eval 0.40] }
8... Be7 { [%txt "Développement."] [%eval 0.43] [%cal Ge7g5] }
9. Qd2 { [%txt "La dame relie les tours."] [%eval 0.45] }
9... O-O { [%txt "Roque."] [%eval 0.52] [%csl Gg8] }
10. O-O-O { [%txt "Roques opposés."] [%eval 0.54] }
10... Nbd7 { [%txt "Le cavalier surveille c5."] [%eval 0.61] [%cal Gd7c5] }
11. g4 { [%txt "L'attaque blanche."] [%eval 0.63] }
11... b5 { [%txt "Notre contre-attaque."] [%eval 0.45] [%cal Gb5b4] }
12. g5 { [%txt "Le cavalier est chassé."] [%eval 0.47] }
12... Nh5 { [%txt "Vers f4."] [%eval 0.39] [%cal Gh5f4] }
13. Nd5 { [%txt "La case faible."] [%eval 0.38] }
13... Bxd5 { [%txt "On élimine le cavalier."] [%eval 0.42] [%cal Ge6d5] }
14. exd5 { [%txt "Fin de la théorie : le pion d5 est fixé."] [%eval 0.38] }
14... f6 { [%txt "On attaque la tête de chaîne g5 : la colonne f va s'ouvrir pour la tour f8."] [%eval 0.34] [%cal Gf6g5,Gf8f1] }
15. Kb1 { [%txt "Un coup de précaution qui laisse faire : 15.gxf6 s'imposait. L'évaluation passe de +0.34 à -0.34."] [%hint "les Blancs jouent un coup de roi tranquille au lieu de répondre au levier ...f6."] [%hint "le pion g5. Notre pion f6 le prend, et la colonne f s'ouvre contre le pion f3."] [%hint "15...fxg5 : on prend, et la tour f8 regarde f3."] [%hintcsl Rg5,Rf3] [%eval -0.34] }
15... fxg5 { [%txt "On prend : la colonne f est ouverte et la case f4 attend notre cavalier."] [%eval -0.24] [%csl Gf4] [%cal Gf8f3] }
16. Re1 { [%txt "La tour quitte la colonne d pour viser e5 : l'évaluation passe de -0.24 à -1.11."] [%hint "les Blancs placent une tour sur une colonne fermée pendant que la partie se joue à l'aile roi et sur la diagonale de leur roi."] [%hint "la diagonale h7-b1, qui mène au pion c2 et au roi b1. Notre dame peut la rejoindre par e8 puis g6."] [%hint "16...Qe8 : la dame part vers g6, contre c2 et le roi b1."] [%hintcsl Rb1,Rc2,Gg6] [%eval -1.11] }
16... Qe8 { [%txt "La dame rejoint l'aile roi : de g6, elle frappera c2 et le roi b1 par la diagonale."] [%eval -1.12] [%cal Ge8g6,Gg6b1] }
17. Bxg5 { [%txt "Les Blancs récupèrent le pion."] [%eval -1.11] }
17... Bxg5 { [%txt "On échange les fous : le fou e7 était notre mauvais fou, derrière e5 et d6."] [%eval -1.11] [%cal Ge7g5] }
18. Qxg5 { [%txt "La dame reprend."] [%eval -1.15] }
18... Nf4 { [%txt "Le cavalier s'installe sur f4, sa case de rêve : il attaque d5 et d3 et ne peut pas être chassé par un pion."] [%eval -1.19] [%csl Gf4] [%cal Gf4d5,Gf4d3] }
19. Rg1 { [%txt "La tour vise g7."] [%eval -1.13] }
19... Rf7 { [%txt "La tour défend g7 et double sur la colonne f."] [%eval -1.07] [%cal Gf7g7] }
20. Nd4 { [%txt "Le cavalier revient au centre et vise e6 et c6."] [%eval -1.11] }
20... Kh8 { [%txt "On retire le roi de la colonne g, face à la tour g1 et à la dame g5."] [%eval -1.18] [%csl Gh8] [%cal Rg1g8] }
(20... exd4 { [%txt "LA VARIANTE PIÉGÉE : le cavalier d4 a l'air gratuit…"] [%eval 0.19] [%csl Rd4] }
  21. Rxe8+ { [%txt "…mais la tour e1 prend notre dame avec échec : la colonne e s'est ouverte d'un coup."] [%eval 0.31] }
  21... Rxe8 { [%txt "À RETENIR.

PRO TIP : +0.29, une dame contre tour et cavalier. Avant de prendre une pièce, regarde ce que la prise ouvre derrière elle : ici, la colonne e entre la tour e1 et notre dame e8."] [%eval 0.29] [%csl Re8] })
21. Rg4 { [%txt "La tour attaque le cavalier f4 une deuxième fois, mais la dame reste à portée de notre pion h : une imprécision (-1.18 puis -1.65)."] [%eval -1.65] }
21... h6 { [%txt "Le pion chasse la dame avec gain de temps."] [%eval -1.81] [%cal Gh6g5] }
22. Qh4 { [%txt "À RETENIR.

PRO TIP : -1.71, avantage noir. Le cavalier f4 tient tout, la colonne f est à nous et le roi blanc reste exposé sur la diagonale h7-b1. La leçon : contre l'Attaque Anglaise, le levier ...f6 puis le cavalier en f4 transforment la défense en attaque."] [%eval -1.71] [%csl Gf4] [%cal Gf7f3] } *`,
    ),
    chapter(
      "Branche B : 6.Bg5 et le Pion empoisonné",
      `{ [%txt "LA VARIANTE PRINCIPALE 6.Bg5.

Les Blancs clouent le cavalier f6 et préparent f4, Qd2 et le grand roque : l'attaque la plus directe contre la Najdorf.

Notre réponse : 6...e6 puis 7...Qb6!, le PION EMPOISONNÉ. La dame attaque b2 et le cavalier d4. Si les Blancs donnent le pion, nous le prenons et nous défendons avec précision ; c'est la ligne la plus ambitieuse des Noirs, jouée par Fischer et Kasparov. Stockfish confirme qu'elle tient l'équilibre."] [%eval 0.37] }
1. e4 { [%txt "Le centre."] [%eval 0.37] }
1... c5 { [%txt "La Sicilienne."] [%eval 0.46] [%cal Gc5d4] }
2. Nf3 { [%txt "Le cavalier prépare d4."] [%eval 0.42] }
2... d6 { [%txt "Contrôle de e5."] [%eval 0.35] [%csl Ge5] }
3. d4 { [%txt "La Sicilienne ouverte."] [%eval 0.38] }
3... cxd4 { [%txt "La colonne c s'ouvre."] [%eval 0.38] [%cal Gc8c1] }
4. Nxd4 { [%txt "Reprise."] [%eval 0.48] }
4... Nf6 { [%txt "On attaque e4."] [%eval 0.40] [%cal Gf6e4] }
5. Nc3 { [%txt "Défense de e4."] [%eval 0.39] }
5... a6 { [%txt "La Najdorf."] [%eval 0.33] [%csl Gb5] }
6. Bg5 { [%txt "Le fou cloue le cavalier f6 contre la dame : Bxf6 menace de détruire nos pions."] [%eval 0.17] [%cal Gg5f6] }
6... e6 { [%txt "On soutient d5 et on libère le fou f8. Contre Bg5, ...e5 laisserait d5 sans défenseur après Bxf6."] [%eval 0.16] [%csl Gd5] [%cal Gf8e7] }
7. f4 { [%txt "Les Blancs menacent e5, qui chasserait le cavalier cloué."] [%eval 0.29] [%cal Gf4e5] }
7... Qb6 { [%txt "LE PION EMPOISONNÉ : la dame attaque b2 et met la pression sur le cavalier d4."] [%eval 0.32] [%cal Gb6b2,Gb6d4] }
8. Qd2 { [%txt "Les Blancs offrent le pion b2 pour gagner du temps."] [%eval 0.40] }
(8. Bd3 { [%txt "Les Blancs défendent e4, mais oublient b2 : l'évaluation passe de +0.32 à -0.93."] [%hint "les Blancs développent un fou au lieu de régler la menace sur b2."] [%hint "le pion b2 n'est défendu par rien, et derrière lui se trouvent le cavalier c3 et la tour a1."] [%hint "8...Qxb2 : la dame prend et menace à la fois le cavalier c3 et la tour a1."] [%hintcsl Rb2,Rc3,Ra1] [%eval -0.93] }
  8... Qxb2 { [%txt "On prend : la dame menace Qxc3+ et Qxa1."] [%eval -0.90] [%cal Gb2c3,Gb2a1] }
  9. Nce2 { [%txt "Le cavalier se met à l'abri."] [%eval -0.92] }
  9... Qb6 { [%txt "À RETENIR.

PRO TIP : -0.89, un pion de plus et la dame revenue en sécurité. La leçon : dans le Pion empoisonné, b2 n'est un vrai gambit que si les Blancs gagnent du temps (Qd2 puis Rb1) ; sinon, c'est un simple pion perdu."] [%eval -0.89] [%cal Gb6d4] })
8... Qxb2 { [%txt "On prend le pion : c'est la variante la plus critique de la Najdorf. La dame est loin de chez elle, mais elle garde une case de repli en a3."] [%eval 0.34] [%cal Gb2a3] }
(8... Nxe4 { [%txt "LA VARIANTE PIÉGÉE : on prend le pion e4 au lieu du pion b2…"] [%eval 2.50] [%csl Re4] }
  9. Nxe4 { [%txt "…et le cavalier blanc reprend : la dame d2 défend toujours le cavalier d4, donc ...Qxd4 ne marche pas. À RETENIR.

PRO TIP : +2.46, une pièce de moins. Le bon pion à prendre est b2, attaqué par la dame ; e4 est défendu par le cavalier c3. Avant de prendre, compte les défenseurs."] [%eval 2.46] })
9. Rb1 { [%txt "La tour chasse la dame."] [%eval 0.46] }
9... Qa3 { [%txt "La dame recule sur la seule bonne case : elle reste dans le camp blanc et vise c3."] [%eval 0.42] [%cal Ga3c3] }
10. f5 { [%txt "Les Blancs attaquent e6 pour ouvrir des lignes vers notre roi."] [%eval 0.45] [%cal Gf5e6] }
10... Nc6 { [%txt "On attaque d4 : ...Nxd4 éliminerait la pièce centrale de l'attaque."] [%eval 0.58] [%cal Gc6d4] }
11. fxe6 { [%txt "Les Blancs ouvrent la colonne f."] [%eval 0.61] }
(11. Be2 { [%txt "Un développement trop lent : l'évaluation passe de +0.58 à -0.55."] [%hint "les Blancs ne poursuivent pas leur attaque ; dans le Pion empoisonné, chaque temps perdu par les Blancs rend notre pion de plus solide."] [%hint "le cavalier d4 : c'est la pièce clé de l'attaque blanche, et notre cavalier c6 peut l'échanger."] [%hint "11...Nxd4 : on élimine le cavalier d4, puis ...Be7 et le roque."] [%hintcsl Rd4,Gc6] [%eval -0.55] }
  11... Nxd4 { [%txt "On échange la pièce clé de l'attaque."] [%eval -0.55] [%cal Gc6d4] }
  12. Qxd4 { [%txt "La dame reprend."] [%eval -0.60] }
  12... Be7 { [%txt "À RETENIR.

PRO TIP : -0.53. Un pion de plus, et le roque arrive. La leçon : contre une attaque qui ralentit, échange la pièce centrale de l'adversaire et termine ton développement."] [%eval -0.53] [%cal Ge8g8] })
11... fxe6 { [%txt "On reprend avec le pion f : le centre e6-d6 reste solide."] [%eval 0.53] [%csl Ge6] }
12. Nxc6 { [%txt "Les Blancs échangent pour ouvrir le jeu avant notre développement."] [%eval 0.55] }
12... bxc6 { [%txt "On reprend vers le centre : le pion c6 contrôle d5."] [%eval 0.45] [%csl Gd5] [%cal Gc6d5] }
13. e5 { [%txt "Le coup critique : les Blancs sacrifient encore pour ouvrir les lignes vers e8."] [%eval 0.12] [%cal Ge5f6] }
(13. Be3 { [%txt "Un repli timide : l'évaluation passe de +0.45 à -0.56."] [%hint "les Blancs retirent leur fou au lieu d'ouvrir le jeu, alors que notre roi est encore au centre."] [%hint "la case d5. Notre pion c6 la soutient déjà, et le cavalier f6 n'est plus cloué."] [%hint "13...d5 : on prend le centre et on referme les lignes vers notre roi."] [%hintcsl Gd5,Gc6] [%eval -0.56] }
  13... d5 { [%txt "À RETENIR.

PRO TIP : -0.75. Le centre d5-e6 ferme toutes les lignes : nos deux pions de plus commencent à compter. La leçon : quand l'attaquant hésite, le défenseur referme le centre."] [%eval -0.75] [%csl Gd5,Ge6] })
13... dxe5 { [%txt "On prend : nous avons deux pions de plus, les Blancs une grosse avance de développement.

À RETENIR.

PRO TIP : la feuille de route après la théorie (0.00).
1. Contre 14.Bxf6 gxf6 15.Ne4, on développe ...Be7 tout de suite : le fou couvre f6 et h4.
2. La dame a3 revient défendre (par a5, c5 ou e7) dès qu'un échec la menace.
3. Le but est la finale : avec deux pions de plus, chaque échange de pièces nous rapproche de la victoire."] [%eval 0.00] [%csl Ge5] [%cal Gf8e7] } *`,
    ),
    chapter(
      "Aléatoire surprise 2 : après le Pion empoisonné, le clouage en c3",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le Pion empoisonné du chapitre précédent jusqu'à 13...dxe5. La théorie s'arrête là : les Blancs, au lieu de 14.Bxf6, jouent des coups de développement qui ont l'air logiques. Leur cavalier c3, cloué, va devenir la cible de toutes nos pièces. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case faible (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Quelle pièce blanche est clouée ? 2. Combien de fois est-elle attaquée et défendue ? 3. Quel coup ajoute un attaquant de plus, avec gain de temps ?"] [%eval 0.37] }
1. e4 { [%txt "Le centre."] [%eval 0.37] }
1... c5 { [%txt "La Sicilienne."] [%eval 0.46] [%cal Gc5d4] }
2. Nf3 { [%txt "Le cavalier prépare d4."] [%eval 0.42] }
2... d6 { [%txt "Contrôle de e5."] [%eval 0.35] [%csl Ge5] }
3. d4 { [%txt "La Sicilienne ouverte."] [%eval 0.38] }
3... cxd4 { [%txt "La colonne c s'ouvre."] [%eval 0.38] [%cal Gc8c1] }
4. Nxd4 { [%txt "Reprise."] [%eval 0.48] }
4... Nf6 { [%txt "On attaque e4."] [%eval 0.40] [%cal Gf6e4] }
5. Nc3 { [%txt "Défense de e4."] [%eval 0.39] }
5... a6 { [%txt "La Najdorf."] [%eval 0.33] [%csl Gb5] }
6. Bg5 { [%txt "Le clouage."] [%eval 0.17] }
6... e6 { [%txt "Le petit centre."] [%eval 0.16] [%csl Gd5] }
7. f4 { [%txt "Menace e5."] [%eval 0.29] }
7... Qb6 { [%txt "Le Pion empoisonné."] [%eval 0.32] [%cal Gb6b2] }
8. Qd2 { [%txt "Le gambit."] [%eval 0.40] }
8... Qxb2 { [%txt "On prend."] [%eval 0.34] [%cal Gb2a3] }
9. Rb1 { [%txt "La dame est chassée."] [%eval 0.46] }
9... Qa3 { [%txt "La case de repli."] [%eval 0.42] [%cal Ga3c3] }
10. f5 { [%txt "Attaque sur e6."] [%eval 0.45] }
10... Nc6 { [%txt "Pression sur d4."] [%eval 0.58] [%cal Gc6d4] }
11. fxe6 { [%txt "La colonne f s'ouvre."] [%eval 0.61] }
11... fxe6 { [%txt "Reprise."] [%eval 0.53] [%csl Ge6] }
12. Nxc6 { [%txt "Échange."] [%eval 0.55] }
12... bxc6 { [%txt "Vers le centre."] [%eval 0.45] [%cal Gc6d5] }
13. e5 { [%txt "Le sacrifice."] [%eval 0.12] }
13... dxe5 { [%txt "Fin de la théorie : deux pions de plus."] [%eval 0.00] [%csl Ge5] }
14. Bc4 { [%txt "Le fou vise e6, mais le cavalier c3 reste exposé : l'évaluation passe de 0.00 à -1.01."] [%hint "les Blancs développent une pièce de plus au lieu de 14.Bxf6, et laissent le cavalier c3 sous le feu de notre dame a3."] [%hint "le cavalier c3. Un fou noir en b4 le clouerait contre la dame d2 et le roi e1."] [%hint "14...Bb4 : le clouage, et deux attaquants sur c3."] [%hintcsl Rc3,Gb4] [%eval -1.01] }
14... Bb4 { [%txt "LE CLOUAGE : le cavalier c3 ne peut plus bouger, et il est attaqué deux fois."] [%eval -1.16] [%cal Gb4c3,Ga3c3] }
15. Rb3 { [%txt "La tour attaque la dame et défend c3."] [%eval -1.12] }
15... Qa5 { [%txt "La dame recule en gardant le clouage : elle soutient b4 et vise toujours c3."] [%eval -1.07] [%cal Ga5c3,Gb4c3] }
(15... Bxc3 { [%txt "LA VARIANTE PIÉGÉE : on prend tout de suite le cavalier cloué…"] [%eval 0.32] [%csl Rc3] }
  16. Qxc3 { [%txt "…la dame reprend et le clouage a disparu. À RETENIR.

PRO TIP : +0.24, presque tout l'avantage s'est envolé. Ne prends jamais trop vite une pièce clouée : tant que le clouage dure, elle ne sert à rien à l'adversaire."] [%eval 0.24] })
16. Qd3 { [%txt "La dame quitte d2 et se place devant notre pion e5 : l'évaluation passe de -1.07 à -1.69."] [%hint "la dame se place sur une case où un pion noir peut l'attaquer avec gain de temps."] [%hint "la case e4. Notre pion e5 y avance en attaquant la dame d3."] [%hint "16...e4 : le pion chasse la dame avec gain de temps."] [%hintcsl Ge4,Rd3] [%eval -1.69] }
16... e4 { [%txt "Le pion attaque la dame avec gain de temps."] [%eval -1.76] [%cal Ge4d3] }
17. Qd2 { [%txt "La dame revient défendre c3, mais le fou c4 reste en l'air : l'évaluation passe de -1.76 à -2.46."] [%hint "la dame revient, mais le fou c4 n'est toujours défendu par aucune pièce."] [%hint "le fou c4. Notre dame peut l'attaquer depuis c5, en gardant un œil sur c3."] [%hint "17...Qc5 : la dame attaque le fou c4."] [%hintcsl Rc4,Gc5] [%eval -2.46] }
17... Qc5 { [%txt "La dame attaque le fou c4 et garde le contact avec le cavalier c3."] [%eval -2.76] [%cal Gc5c4] }
18. Be2 { [%txt "Le fou recule, mais le cavalier c3 reste cloué : une imprécision de plus (-2.76 puis -3.25)."] [%eval -3.25] }
18... Nd5 { [%txt "Le cavalier saute en d5 et attaque c3 une troisième fois."] [%eval -3.53] [%cal Gd5c3,Gb4c3] }
19. Rxb4 { [%txt "Les Blancs rendent la qualité pour casser le clouage."] [%eval -3.49] }
19... Qxb4 { [%txt "On reprend : le cavalier c3 est toujours attaqué."] [%eval -3.35] [%cal Gb4c3] }
20. Na4 { [%txt "Le cavalier fuit vers le bord sans protection : l'évaluation passe de -3.35 à -3.95."] [%hint "le cavalier s'enfuit vers une case qu'aucune pièce blanche ne défend."] [%hint "la case a4. Notre dame b4 la contrôle déjà."] [%hint "20...Qxa4 : la dame prend le cavalier."] [%hintcsl Ra4,Gb4] [%eval -3.95] }
20... Qxa4 { [%txt "À RETENIR.

PRO TIP : -4.39, une tour et deux pions de plus. Tout est venu du clouage 14...Bb4 : un clouage se renforce en ajoutant des attaquants (dame, cavalier), jamais en échangeant la pièce qui cloue."] [%eval -4.39] [%csl Ga4] } *`,
    ),
    chapter(
      "Branche C : 6.Be2, la Classique",
      `{ [%txt "LA VARIANTE CLASSIQUE 6.Be2.

Les Blancs jouent posément : petit roque, Be3, Qd2, a4. Pas de course au mat : la partie se joue autour de la case d5 et sur la colonne c.

Notre plan : ...e5, ...Be7, ...Be6 et ...Nbd7, puis la tour en c8 et la dame en c7. Le levier ...d5 libère tout notre jeu quand il est préparé. Le sacrifice de qualité ...Rxc3 existe, mais seulement quand il rapporte quelque chose."] [%eval 0.37] }
1. e4 { [%txt "Le centre."] [%eval 0.37] }
1... c5 { [%txt "La Sicilienne."] [%eval 0.46] [%cal Gc5d4] }
2. Nf3 { [%txt "Le cavalier prépare d4."] [%eval 0.42] }
2... d6 { [%txt "Contrôle de e5."] [%eval 0.35] [%csl Ge5] }
3. d4 { [%txt "La Sicilienne ouverte."] [%eval 0.38] }
3... cxd4 { [%txt "La colonne c s'ouvre."] [%eval 0.38] [%cal Gc8c1] }
4. Nxd4 { [%txt "Reprise."] [%eval 0.48] }
4... Nf6 { [%txt "On attaque e4."] [%eval 0.40] [%cal Gf6e4] }
5. Nc3 { [%txt "Défense de e4."] [%eval 0.39] }
5... a6 { [%txt "La Najdorf."] [%eval 0.33] [%csl Gb5] }
6. Be2 { [%txt "LA CLASSIQUE : le fou se développe sobrement, les Blancs vont roquer à l'aile roi."] [%eval 0.31] }
6... e5 { [%txt "On chasse le cavalier d4 et on prend notre part du centre."] [%eval 0.22] [%cal Ge5d4] }
7. Nb3 { [%txt "Le cavalier recule en b3."] [%eval 0.21] }
7... Be7 { [%txt "Développement : le fou prépare le roque."] [%eval 0.23] [%cal Ge8g8] }
8. O-O { [%txt "Les Blancs roquent."] [%eval 0.23] }
8... O-O { [%txt "Nous aussi : pas de roques opposés dans cette ligne."] [%eval 0.26] [%csl Gg8] }
9. Be3 { [%txt "Le fou vise b6 et soutient Nd5."] [%eval 0.26] }
9... Be6 { [%txt "Le fou prend d5 sous contrôle."] [%eval 0.26] [%csl Gd5] [%cal Ge6d5] }
10. Qd2 { [%txt "La dame relie les tours."] [%eval 0.07] }
10... Nbd7 { [%txt "Le cavalier surveille c5 et peut aller en b6 contre d5."] [%eval 0.02] [%cal Gd7b6,Gd7c5] }
11. a4 { [%txt "On empêche ...b5 : les Blancs gèlent notre aile dame."] [%eval 0.00] [%csl Rb5] }
(11. g4 { [%txt "Un coup d'attaque sans préparation : l'évaluation passe de +0.02 à -2.10."] [%hint "les Blancs lancent un pion de leur propre roque alors que rien ne le soutient."] [%hint "le pion g4. Notre cavalier f6 l'attaque, et notre fou e6 surveille g4 si le fou e2 reprend."] [%hint "11...Nxg4 : le pion tombe, et si 12.Bxg4, 12...Bxg4."] [%hintcsl Rg4,Ge6] [%eval -2.10] }
  11... Nxg4 { [%txt "On prend le pion."] [%eval -2.18] [%cal Gf6g4] }
  12. Bxg4 { [%txt "Le fou reprend."] [%eval -2.19] }
  12... Bxg4 { [%txt "À RETENIR.

PRO TIP : -2.24, un pion de plus et le roque blanc affaibli. Une poussée g4 devant son propre roque n'est jamais gratuite : il faut au moins un pion en f3 pour la soutenir."] [%eval -2.24] [%csl Gg4] })
11... Rc8 { [%txt "La tour s'installe sur la colonne c, face au pion c2."] [%eval 0.00] [%cal Gc8c2] }
12. a5 { [%txt "Les Blancs gagnent de l'espace et fixent notre pion b7."] [%eval 0.10] }
(12. Nd5 { [%txt "Les Blancs occupent d5, mais oublient le pion e4 : l'évaluation passe de 0.00 à -1.37."] [%hint "le cavalier c3 quitte sa case : il était le seul défenseur du pion e4."] [%hint "le pion e4. Notre cavalier f6 le prend, et il attaque en même temps la dame d2."] [%hint "12...Nxe4 : le cavalier prend le pion et attaque la dame."] [%hintcsl Re4,Rd2] [%eval -1.37] }
  12... Nxe4 { [%txt "Le cavalier prend le pion et attaque la dame d2."] [%eval -1.50] [%cal Ge4d2] }
  13. Nxe7+ { [%txt "Les Blancs éliminent notre fou avec échec."] [%eval -1.41] }
  13... Qxe7 { [%txt "À RETENIR.

PRO TIP : -1.57, un pion de plus et la dame d2 toujours attaquée. Quand un cavalier blanc saute en d5, demande-toi toujours ce qu'il défendait avant de partir."] [%eval -1.57] [%cal Ge4d2] })
12... Qc7 { [%txt "La dame rejoint la colonne c et surveille c5 et c2. 12...Ng4, qui chasse le fou e3, est un peu plus précis selon le moteur."] [%eval 0.44] [%cal Gc7c2] }
(12... Rxc3 { [%txt "LA VARIANTE PIÉGÉE : le sacrifice de qualité typique de la Sicilienne…"] [%eval 0.92] [%csl Rc3] }
  13. Qxc3 { [%txt "…mais ici il ne rapporte presque rien."] [%eval 1.01] }
  13... Nxe4 { [%txt "On récupère un pion…"] [%eval 1.02] [%cal Ge4c3] }
  14. Qb4 { [%txt "…et la dame blanche s'active. À RETENIR.

PRO TIP : +1.04, une qualité de moins pour un pion. ...Rxc3 n'est bon que s'il détruit la structure blanche ou ouvre le roi ; ici le pion b2 reste intact et les Blancs n'ont aucune faiblesse."] [%eval 1.04] })
13. Rfd1 { [%txt "La tour soutient la pression sur d6."] [%eval 0.34] }
(13. Qe1 { [%txt "La dame quitte la colonne d : l'évaluation passe de +0.44 à -0.72."] [%hint "la dame abandonne la colonne d, où elle surveillait d5 et d6."] [%hint "la case d5. Elle n'est plus contrôlée que par le cavalier c3 et le pion e4, contre notre fou e6, notre cavalier f6 et le pion d6 prêt à avancer."] [%hint "13...d5 : le levier libérateur, enfin possible."] [%hintcsl Gd5] [%eval -0.72] }
  13... d5 { [%txt "À RETENIR.

PRO TIP : -0.62. Le levier ...d5 arrive avec toutes nos pièces prêtes : le pion d6 arriéré a disparu. Dans la Classique, ...d5 se joue dès que d5 n'est plus tenu par une pièce blanche de plus."] [%eval -0.62] [%csl Gd5] [%cal Gd5e4] })
13... Rfd8 { [%txt "À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.35).
1. La tour d8 soutient le levier ...d5 : on le joue dès que d5 est contrôlé autant de fois qu'il est attaqué.
2. ...h6 et ...Nf8 ou ...Nc5 : on réorganise les cavaliers sans affaiblir d5.
3. Le sacrifice ...Rxc3 seulement si les Blancs reprennent bxc3 avec un pion e4 faible."] [%eval 0.35] [%csl Gd5] [%cal Gd8d5] } *`,
    ),
    chapter(
      "Branche D : 6.Bc4, l'Attaque Sozin-Fischer",
      `{ [%txt "L'ATTAQUE SOZIN 6.Bc4 (L'ARME DE FISCHER).

Le fou vise e6 et f7. Les Blancs préparent les sacrifices typiques en e6 ou en d5, et la dame en g3 contre g7.

Notre réponse : ...e6 ferme la diagonale, ...b5 chasse le fou et menace ...b4 contre le cavalier c3, défenseur de e4. Avant de roquer, on contrôle e5 avec ...Qc7 : sans cela, la poussée e5 ouvre la diagonale de la dame f3 vers a8."] [%eval 0.37] }
1. e4 { [%txt "Le centre."] [%eval 0.37] }
1... c5 { [%txt "La Sicilienne."] [%eval 0.46] [%cal Gc5d4] }
2. Nf3 { [%txt "Le cavalier prépare d4."] [%eval 0.42] }
2... d6 { [%txt "Contrôle de e5."] [%eval 0.35] [%csl Ge5] }
3. d4 { [%txt "La Sicilienne ouverte."] [%eval 0.38] }
3... cxd4 { [%txt "La colonne c s'ouvre."] [%eval 0.38] [%cal Gc8c1] }
4. Nxd4 { [%txt "Reprise."] [%eval 0.48] }
4... Nf6 { [%txt "On attaque e4."] [%eval 0.40] [%cal Gf6e4] }
5. Nc3 { [%txt "Défense de e4."] [%eval 0.39] }
5... a6 { [%txt "La Najdorf."] [%eval 0.33] [%csl Gb5] }
6. Bc4 { [%txt "L'ATTAQUE SOZIN : le fou vise e6 et f7."] [%eval 0.17] [%cal Gc4f7] }
6... e6 { [%txt "On ferme la diagonale : le fou c4 se heurte au pion e6."] [%eval 0.10] [%csl Ge6] [%cal Rc4e6] }
7. Bb3 { [%txt "Le fou se met à l'abri de ...b5 et ...d5."] [%eval 0.01] }
7... b5 { [%txt "L'expansion : ...b4 chassera le cavalier c3, défenseur de e4."] [%eval 0.04] [%cal Gb5b4,Gb4c3] }
8. O-O { [%txt "Les Blancs roquent."] [%eval -0.08] }
8... Be7 { [%txt "Développement : le fou prépare le roque."] [%eval 0.00] [%cal Ge8g8] }
9. Qf3 { [%txt "La dame vise a8 à travers e4, et g7 depuis g3."] [%eval -0.02] [%cal Gf3a8] }
(9. g4 { [%txt "Un coup d'attaque qui oublie le centre : l'évaluation passe de 0.00 à -1.00."] [%hint "les Blancs attaquent à l'aile roi alors que le cavalier c3, seul défenseur de e4, peut être chassé."] [%hint "le pion e4. Après ...b4, il n'est plus défendu par aucune pièce."] [%hint "9...b4 : le cavalier c3 doit partir, et e4 tombe."] [%hintcsl Re4,Rc3] [%eval -1.00] }
  9... b4 { [%txt "Le pion chasse le défenseur de e4."] [%eval -0.92] [%cal Gb4c3] }
  10. Na4 { [%txt "Le cavalier part au bord."] [%eval -1.02] }
  10... Nxe4 { [%txt "À RETENIR.

PRO TIP : -0.91, un pion central de plus. En Najdorf, ...b4 est l'arme contre le cavalier c3 : chaque fois qu'il est le seul défenseur de e4, la poussée gagne le pion."] [%eval -0.91] [%csl Ge4] })
9... Qc7 { [%txt "La dame contrôle e5 : la poussée e5 ne viendra plus avec gain de temps. Maintenant seulement, le roque est sûr."] [%eval 0.10] [%csl Ge5] [%cal Gc7e5] }
(9... O-O { [%txt "LA VARIANTE PIÉGÉE : on roque trop tôt, sans contrôler e5…"] [%eval 1.93] [%csl Re5] }
  10. e5 { [%txt "…et la poussée ouvre la diagonale de la dame f3 vers a8."] [%eval 2.02] [%cal Gf3a8] }
  10... dxe5 { [%txt "On prend…"] [%eval 2.23] [%csl Ra8] }
  11. Nxe6 { [%txt "…et le cavalier se sacrifie en e6 pour dégager la diagonale."] [%eval 2.23] }
  11... fxe6 { [%txt "On reprend…"] [%eval 2.22] [%cal Rf3a8] }
  12. Qxa8 { [%txt "…et la dame prend la tour a8. À RETENIR.

PRO TIP : +2.20. Dans la Sozin, contrôle e5 (...Qc7) avant de roquer : la batterie dame f3 contre a8 n'attend que l'ouverture de la diagonale."] [%eval 2.20] })
10. Qg3 { [%txt "La dame vise g7."] [%eval 0.18] [%cal Gg3g7] }
10... O-O { [%txt "Maintenant on roque : e5 est tenu par la dame et le pion d6."] [%eval 0.19] [%csl Gg8] }
11. Bh6 { [%txt "Les Blancs menacent Bxg7."] [%eval 0.25] [%cal Gh6g7] }
11... Ne8 { [%txt "Le cavalier recule pour défendre g7."] [%eval 0.25] [%cal Ge8g7] }
12. Rad1 { [%txt "La tour vise d6."] [%eval 0.24] }
(12. f4 { [%txt "Les Blancs veulent f5, mais ouvrent la diagonale de leur roi : l'évaluation passe de +0.25 à -1.59."] [%hint "le pion f2 avance et ouvre la diagonale a7-g1, celle du roi blanc."] [%hint "le cavalier d4 se trouve sur cette diagonale, juste devant le roi g1."] [%hint "12...Qb6 : la dame cloue le cavalier d4 contre le roi."] [%hintcsl Rd4,Rg1] [%eval -1.59] }
  12... Qb6 { [%txt "Le clouage : le cavalier d4 ne peut plus bouger, et il est attaqué."] [%eval -1.96] [%cal Gb6d4,Gd4g1] }
  13. Rad1 { [%txt "La tour défend d4."] [%eval -2.13] }
  13... Nc6 { [%txt "À RETENIR.

PRO TIP : -2.46. Le cavalier d4 est attaqué trois fois et il est cloué. Contre f2-f4, regarde toujours la diagonale a7-g1 : une dame en b6 y gagne souvent du matériel."] [%eval -2.46] [%cal Gc6d4,Gb6d4] })
12... Bd7 { [%txt "Le fou libère c8 et prépare ...Nc6."] [%eval 0.11] [%cal Gd7c6] }
13. a3 { [%txt "Les Blancs empêchent ...b4."] [%eval 0.10] [%csl Rb4] }
(13. e5 { [%txt "Une poussée prématurée : l'évaluation passe de +0.11 à -0.98."] [%hint "les Blancs ouvrent le centre alors que la dame c7 contrôle déjà e5."] [%hint "le pion e5 n'est soutenu par aucune pièce : notre pion d6 le prend, et la dame c7 contrôle la case."] [%hint "13...dxe5 : on gagne le pion."] [%hintcsl Re5] [%eval -0.98] }
  13... dxe5 { [%txt "À RETENIR.

PRO TIP : -0.91, un pion de plus et le centre est à nous. Une poussée e5 n'est une arme que si elle vient avec gain de temps ; contre la dame c7, c'est un pion offert."] [%eval -0.91] [%csl Ge5] })
13... Nc6 { [%txt "À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.02).
1. ...Nxd4 puis ...Bc6 : le fou attaque e4 et la grande diagonale est à nous.
2. ...Nf6 dès que g7 n'est plus menacé : le cavalier e8 revient au jeu.
3. ...a5-a4 contre le fou b3 : on le chasse de sa diagonale."] [%eval 0.02] [%cal Gc6d4,Ga6a5] } *`,
    ),
    chapter(
      "Branche E : 6.f4, la Variante Amsterdam",
      `{ [%txt "LA VARIANTE AMSTERDAM 6.f4.

Les Blancs menacent e5 et préparent Nf3, Bd3, O-O et une attaque à l'aile roi avec f5.

Notre réponse : 6...e5 tout de suite. Le pion f4 doit choisir : s'il prend en e5, la case e5 et la colonne f se libèrent ; s'il reste, ...exf4 donne la case e5 à nos cavaliers. Nos pièces vont en d7, c5 et e5 ; les cases g3 et e4 sont nos cibles."] [%eval 0.37] }
1. e4 { [%txt "Le centre."] [%eval 0.37] }
1... c5 { [%txt "La Sicilienne."] [%eval 0.46] [%cal Gc5d4] }
2. Nf3 { [%txt "Le cavalier prépare d4."] [%eval 0.42] }
2... d6 { [%txt "Contrôle de e5."] [%eval 0.35] [%csl Ge5] }
3. d4 { [%txt "La Sicilienne ouverte."] [%eval 0.38] }
3... cxd4 { [%txt "La colonne c s'ouvre."] [%eval 0.38] [%cal Gc8c1] }
4. Nxd4 { [%txt "Reprise."] [%eval 0.48] }
4... Nf6 { [%txt "On attaque e4."] [%eval 0.40] [%cal Gf6e4] }
5. Nc3 { [%txt "Défense de e4."] [%eval 0.39] }
5... a6 { [%txt "La Najdorf."] [%eval 0.33] [%csl Gb5] }
6. f4 { [%txt "LA VARIANTE AMSTERDAM : les Blancs menacent e5."] [%eval 0.22] [%cal Gf4e5] }
6... e5 { [%txt "On frappe tout de suite : le cavalier d4 et le pion f4 sont attaqués."] [%eval 0.17] [%cal Ge5d4,Ge5f4] }
7. Nf3 { [%txt "Le cavalier recule et attaque e5."] [%eval 0.16] }
7... Nbd7 { [%txt "Le cavalier défend e5 et se prépare à sauter en c5."] [%eval 0.21] [%cal Gd7e5,Gd7c5] }
8. a4 { [%txt "Les Blancs empêchent ...b5."] [%eval 0.12] [%csl Rb5] }
8... Be7 { [%txt "Développement : le fou prépare le roque."] [%eval 0.13] [%cal Ge8g8] }
9. Bd3 { [%txt "Le fou défend e4."] [%eval 0.13] }
(9. h3 { [%txt "Un coup de pion qui ne développe rien : l'évaluation passe de +0.13 à -0.79."] [%hint "les Blancs jouent un coup d'attente à l'aile roi au lieu de développer."] [%hint "la case g3. Le pion h2 la contrôlait ; en h3, il ne la surveille plus. Un cavalier en h5 attaque f4 et peut sauter en g3."] [%hint "9...Nh5 : le cavalier attaque f4 et vise g3."] [%hintcsl Rg3,Rf4] [%eval -0.79] }
  9... Nh5 { [%txt "Le cavalier attaque f4 et vise g3."] [%eval -0.72] [%cal Gh5f4,Gh5g3] }
  10. Be3 { [%txt "Le fou défend f4…"] [%eval -0.98] }
  10... exf4 { [%txt "…et on prend quand même."] [%eval -1.03] [%cal Ge5f4] }
  11. Bf2 { [%txt "Le fou recule."] [%eval -0.79] }
  11... Ng3 { [%txt "À RETENIR.

PRO TIP : -0.82. Le cavalier s'installe en g3, attaque la tour h1 et coupe le roque. Un coup de pion d'aile crée toujours une case faible : h2-h3 a offert g3."] [%eval -0.82] [%csl Gg3] [%cal Gg3h1] })
9... O-O { [%txt "On roque."] [%eval 0.08] [%csl Gg8] }
10. O-O { [%txt "Les Blancs roquent."] [%eval 0.04] }
10... exf4 { [%txt "On prend : la case e5 appartient désormais à nos cavaliers."] [%eval 0.15] [%csl Ge5] [%cal Ge5f4] }
(10... d5 { [%txt "LA VARIANTE PIÉGÉE : le levier central, au mauvais moment…"] [%eval 1.36] [%csl Rd5] }
  11. fxe5 { [%txt "…le pion f4 prend en e5 et chasse notre cavalier."] [%eval 1.34] }
  11... Ng4 { [%txt "Le cavalier part en g4."] [%eval 1.36] [%cal Rf6g4] }
  12. Bf4 { [%txt "Le fou défend e5."] [%eval 1.57] }
  12... dxe4 { [%txt "On récupère un pion…"] [%eval 1.65] [%csl Re4] }
  13. Nxe4 { [%txt "…mais le cavalier reprend : les Blancs ont un pion de plus et un centre actif. À RETENIR.

PRO TIP : +1.72. Contre f4, ...d5 ouvre le jeu au profit des pièces blanches mieux développées ; le bon coup était 10...exf4, qui gagne la case e5."] [%eval 1.72] })
11. Bxf4 { [%txt "Le fou reprend."] [%eval 0.20] }
(11. Re1 { [%txt "La tour défend e4, mais le roi g1 reste sur une diagonale ouverte : l'évaluation passe de +0.15 à -0.52."] [%hint "le pion f a quitté f2 : la diagonale a7-g1 mène tout droit au roi blanc."] [%hint "la case b6. De là, notre dame donne échec au roi g1."] [%hint "11...Qb6+ : l'échec, et le roi doit bouger."] [%hintcsl Gb6,Rg1] [%eval -0.52] }
  11... Qb6+ { [%txt "L'échec sur la diagonale ouverte."] [%eval -0.42] [%cal Gb6g1] }
  12. Kf1 { [%txt "Le roi s'écarte : il ne pourra plus jamais se mettre à l'abri derrière ses pions."] [%eval -0.52] }
  12... Ne5 { [%txt "À RETENIR.

PRO TIP : -0.47. Le cavalier occupe e5 et le roi blanc est exposé. Quand le pion f des Blancs a disparu, la diagonale a7-g1 est une autoroute vers g1 : la dame en b6 l'emprunte."] [%eval -0.47] [%csl Ge5] [%cal Gb6g1] })
11... Nc5 { [%txt "Le cavalier vise e4 et d3."] [%eval 0.18] [%cal Gc5e4,Gc5d3] }
12. Kh1 { [%txt "Les Blancs mettent leur roi hors de la diagonale a7-g1."] [%eval 0.22] }
(12. Be2 { [%txt "Le fou quitte d3 et laisse e4 sans défenseur : l'évaluation passe de +0.18 à -0.97."] [%hint "le fou d3 défendait e4 ; en e2, il ne le défend plus."] [%hint "le pion e4. Notre cavalier c5 le prend, soutenu par le cavalier f6."] [%hint "12...Ncxe4 : le cavalier prend le pion."] [%hintcsl Re4,Gc5] [%eval -0.97] }
  12... Ncxe4 { [%txt "Le cavalier prend le pion."] [%eval -0.83] [%cal Gc5e4] }
  13. Nd5 { [%txt "Les Blancs cherchent du jeu."] [%eval -0.99] }
  13... Re8 { [%txt "À RETENIR.

PRO TIP : -0.94, un pion de plus et la colonne e. Avant chaque repli de fou blanc, demande-toi quel pion il défendait."] [%eval -0.94] [%cal Ge8e2] })
12... Bg4 { [%txt "À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.17).
1. Le fou g4 cloue le cavalier f3 : il retarde Nd4 et vise d1.
2. ...Re8 et ...Bf8 : la colonne e contre le pion e4.
3. ...Ne6 ou ...Nh5 : on chasse le fou f4 et on prend la case e5."] [%eval 0.17] [%cal Gg4f3,Gc5e4] } *`,
    ),
    chapter(
      "Anti-panique : 6.h3, 6.f3, 6.g3, 6.a4 et 6.Nd5?",
      `{ [%txt "ANTI-PANIQUE : LES SIXIÈMES COUPS MOINS FRÉQUENTS.

Contre la Najdorf, les Blancs ont une dizaine de sixièmes coups. Pas de panique : la règle générale est la même partout. 6...e5 dès que le cavalier d4 peut être chassé sans perte de temps, ...Be6 et ...Be7, puis ...b5. La ligne principale traite 6.h3 (le système Adams) ; les variantes traitent 6.f3, 6.g3, 6.a4 et le saut 6.Nd5?."] [%eval 0.37] }
1. e4 { [%txt "Le centre."] [%eval 0.37] }
1... c5 { [%txt "La Sicilienne."] [%eval 0.46] [%cal Gc5d4] }
2. Nf3 { [%txt "Le cavalier prépare d4."] [%eval 0.42] }
2... d6 { [%txt "Contrôle de e5."] [%eval 0.35] [%csl Ge5] }
3. d4 { [%txt "La Sicilienne ouverte."] [%eval 0.38] }
3... cxd4 { [%txt "La colonne c s'ouvre."] [%eval 0.38] [%cal Gc8c1] }
4. Nxd4 { [%txt "Reprise."] [%eval 0.48] }
4... Nf6 { [%txt "On attaque e4."] [%eval 0.40] [%cal Gf6e4] }
5. Nc3 { [%txt "Défense de e4."] [%eval 0.39] }
5... a6 { [%txt "La Najdorf."] [%eval 0.33] [%csl Gb5] }
6. h3 { [%txt "LE SYSTÈME ADAMS : les Blancs préparent g4 pour chasser notre cavalier f6."] [%eval 0.31] [%cal Gh3g4] }
(6. f3 { [%txt "Les Blancs préparent g4 et Be3."] [%eval 0.40] }
  6... e5 { [%txt "On chasse le cavalier, comme d'habitude."] [%eval 0.36] [%cal Ge5d4] }
  7. Nb3 { [%txt "Recul."] [%eval 0.39] }
  7... Be6 { [%txt "Le gardien de d5."] [%eval 0.44] [%csl Gd5] }
  8. Be3 { [%txt "À RETENIR.

PRO TIP : on est revenu dans l'Attaque Anglaise du chapitre 1 (+0.44). Suite : 8...Be7, 9...O-O, 10...Nbd7 et ...b5."] [%eval 0.44] })
(6. g3 { [%txt "Le fianchetto : le fou ira en g2 contre d5."] [%eval 0.21] }
  6... e5 { [%txt "On chasse le cavalier."] [%eval 0.20] [%cal Ge5d4] }
  7. Nde2 { [%txt "Le cavalier recule vers e2, d'où il soutient le jeu sur d5."] [%eval 0.23] }
  7... Be7 { [%txt "Développement."] [%eval 0.23] [%cal Ge8g8] }
  8. Bg2 { [%txt "Le fou vise d5."] [%eval 0.18] }
  8... b5 { [%txt "À RETENIR.

PRO TIP : +0.18. Contre le fianchetto, l'expansion ...b5, puis ...Bb7 et ...Nbd7, met un deuxième gardien sur d5."] [%eval 0.18] [%cal Gc8b7] })
(6. a4 { [%txt "Les Blancs empêchent ...b5."] [%eval 0.12] }
  6... e5 { [%txt "On chasse le cavalier."] [%eval 0.15] [%cal Ge5d4] }
  7. Nf3 { [%txt "Le cavalier recule en f3."] [%eval 0.13] }
  7... h6 { [%txt "À RETENIR.

PRO TIP : +0.20. Le choix du moteur : le petit coup h6 empêche Bg5 et Ng5. Ensuite ...Be7, ...O-O, ...Be6 et ...Nbd7 : le pion a4 ne gêne pas ce plan."] [%eval 0.20] [%csl Gg5] })
(6. Nd5 { [%txt "Un saut prématuré : le cavalier n'attaque rien et se laisse échanger. L'évaluation passe de +0.33 à -0.87."] [%hint "les Blancs jouent deux fois le même cavalier au lieu de développer une nouvelle pièce."] [%hint "la case d5. Après l'échange, le pion e4 arrive en d5 et notre dame peut le prendre par a5."] [%hint "6...Nxd5 7.exd5 Qa5+ : l'échec, puis la dame prend d5."] [%hintcsl Gd5,Ga5] [%eval -0.87] }
  6... Nxd5 { [%txt "On échange le cavalier."] [%eval -0.80] [%cal Gf6d5] }
  7. exd5 { [%txt "Le pion reprend."] [%eval -0.87] }
  7... Qa5+ { [%txt "Un échec utile : la dame vise aussi le pion d5."] [%eval -0.88] [%cal Ga5e1,Ga5d5] }
  8. c3 { [%txt "Les Blancs parent."] [%eval -0.93] }
  8... Qxd5 { [%txt "À RETENIR.

PRO TIP : -0.89, un pion de plus. Quand un cavalier blanc saute en d5 sans soutien, échange-le : le pion qui reprend en d5 devient souvent une cible."] [%eval -0.89] [%csl Gd5] })
6... e5 { [%txt "On chasse le cavalier : contre h3, il n'y a aucune raison d'attendre."] [%eval 0.29] [%cal Ge5d4] }
7. Nde2 { [%txt "Le cavalier recule vers g3, d'où il soutiendra g4 et f5."] [%eval 0.28] [%cal Ge2g3] }
7... h5 { [%txt "On empêche g4 une fois pour toutes : la case g4 nous appartient."] [%eval 0.20] [%csl Gg4] [%cal Gh5g4] }
8. g3 { [%txt "Les Blancs changent de plan : le fou ira en g2."] [%eval 0.11] }
(8. g4 { [%txt "Les Blancs poussent quand même : l'évaluation passe de +0.20 à -1.24."] [%hint "les Blancs poussent un pion attaqué par notre pion h5, et sans soutien suffisant."] [%hint "le pion g4. Notre pion h5 le prend, et la colonne h s'ouvre pour notre tour h8."] [%hint "8...hxg4 : on prend, puis ...Be6."] [%hintcsl Rg4,Gh8] [%eval -1.24] }
  8... hxg4 { [%txt "On prend : un pion de plus et la colonne h ouverte."] [%eval -1.40] [%cal Gh8h1] }
  9. Bg5 { [%txt "Le fou cloue le cavalier f6."] [%eval -1.15] }
  9... Be6 { [%txt "À RETENIR.

PRO TIP : -1.25, un pion de plus. Le pion h5 sert à cela : si g4 vient, il prend. Une fois ...h5 joué, toute poussée g4 coûte un pion."] [%eval -1.25] [%csl Gg4] })
8... Be6 { [%txt "Le fou prend d5 sous contrôle."] [%eval 0.33] [%csl Gd5] [%cal Ge6d5] }
(8... Nxe4 { [%txt "LA VARIANTE PIÉGÉE : le pion e4 a l'air seul…"] [%eval 2.27] [%csl Re4] }
  9. Nxe4 { [%txt "…mais le cavalier c3 le défendait."] [%eval 2.23] }
  9... d5 { [%txt "On croit gagner la pièce par la fourchette de pion…"] [%eval 2.10] [%cal Rd5e4] }
  10. Ng5 { [%txt "…mais le cavalier e4 s'échappe en g5. À RETENIR.

PRO TIP : +2.02, une pièce de moins. La fourchette ...d5 ne marche que si le cavalier n'a aucune case de fuite : vérifie ses cases avant de sacrifier."] [%eval 2.02] })
9. Bg2 { [%txt "Le fou vise d5."] [%eval 0.33] }
(9. Bd2 { [%txt "Un développement passif : l'évaluation passe de +0.33 à -0.42."] [%hint "le fou va en d2, où il ne contrôle ni d5 ni e3 : la case d5 reste sans gardien supplémentaire."] [%hint "la case d5. Notre fou e6 et notre cavalier f6 la contrôlent, contre le seul cavalier c3 et le pion e4."] [%hint "9...d5 : le levier libérateur."] [%hintcsl Gd5] [%eval -0.42] }
  9... d5 { [%txt "Le levier : d5 est contrôlé par plus de pièces noires que blanches."] [%eval -0.47] [%csl Gd5] [%cal Gd5e4] }
  10. exd5 { [%txt "Les Blancs prennent."] [%eval -0.52] }
  10... Bxd5 { [%txt "À RETENIR.

PRO TIP : -0.49. Le pion d6 arriéré a disparu, le fou d5 vise h1. En Najdorf, quand ...d5 est possible sans perte, tous les problèmes noirs sont résolus."] [%eval -0.49] [%csl Gd5] [%cal Gd5h1] })
9... b5 { [%txt "L'expansion à l'aile dame."] [%eval 0.29] [%cal Gb5b4] }
10. Nd5 { [%txt "Le cavalier occupe d5."] [%eval 0.09] }
10... Nxd5 { [%txt "On l'échange tout de suite."] [%eval 0.01] [%cal Gf6d5] }
11. exd5 { [%txt "Le pion reprend : la diagonale du fou g2 est bouchée."] [%eval 0.05] }
11... Bf5 { [%txt "Le fou se replace sur une belle diagonale et vise c2."] [%eval 0.08] [%cal Gf5c2] }
12. Be3 { [%txt "Développement."] [%eval -0.01] }
(12. f3 { [%txt "Un coup de pion qui affaiblit e3 et la diagonale g1-a7 : l'évaluation passe de +0.08 à -0.55."] [%hint "le pion f3 ne développe rien et affaiblit la diagonale a7-g1 et la case e3."] [%hint "la case b6. Notre dame y vise f2 et g1, et empêche le roque."] [%hint "12...Qb6 : la dame s'installe sur la diagonale."] [%hintcsl Gb6,Rg1] [%eval -0.55] }
  12... Qb6 { [%txt "La dame prend la diagonale a7-g1 : le roque blanc devient difficile."] [%eval -0.61] [%cal Gb6g1] }
  13. a4 { [%txt "Les Blancs attaquent b5."] [%eval -0.72] }
  13... b4 { [%txt "À RETENIR.

PRO TIP : -0.68. Le pion b4 reste solide, et la dame b6 bloque le roque. Chaque coup de pion devant le roi blanc ouvre une diagonale : la dame en b6 la prend."] [%eval -0.68] [%cal Gb6g1] })
12... Be7 { [%txt "À RETENIR.

PRO TIP : la feuille de route après la théorie (-0.06).
1. ...Nd7, ...O-O et ...Rc8 : développement complet, la colonne c pour nos tours.
2. ...Bg6 puis ...f5 : on gagne de l'espace à l'aile roi, où le pion h5 aide déjà.
3. Le pion d5 blanc est fixé : on le bloque avec un cavalier en f6 ou b6, jamais on ne l'attaque à l'aveugle."] [%eval -0.06] [%cal Gb8d7] } *`,
    ),
  ],
};
