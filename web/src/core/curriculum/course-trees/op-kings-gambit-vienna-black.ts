import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours d'ouverture « Gambit du Roi et Viennoise (avec les Noirs) » — onglet
 * Ouvertures, format « un commentaire par coup » de l'Académie, lu par
 * `CourseTreeViewer` (route `/ouvertures/kings-gambit-vienna-black/cours`).
 * Public visé : 1500-1800 Elo, répertoire 1...e5 contre 1.e4 2.f4 et 2.Nc3
 * (fiche curatée `kings-gambit-vienna-black`, C30-C39 et C25-C29). Ligne
 * caractéristique 1.e4 e5 2.f4 : les chapitres viennois portent un renvoi
 * 2.f4 en variante, pour que chaque chapitre contienne cette ligne.
 *
 * ## Contenu (v2 du 2026-11-03, format Ruy Lopez v2, côté Noirs)
 *
 * 1. Fiche d'identité, tronc commun et la défense Fischer 3.Nf3 d6.
 * 2. Aléatoire surprise 1 : après la défense Fischer, le pion f qui casse tout.
 * 3. Branche B : le Gambit du Fou, 3.Bc4 Nf6 4.Nc3 c6.
 * 4. Branche C : le gambit refusé, le contre-gambit Falkbeer 2...d5.
 * 5. Branche D : le gambit Viennois, 2.Nc3 Nf6 3.f4 d5.
 * 6. Aléatoire surprise 2 : après le gambit Viennois, le pion b2 qui tombe.
 * 7. Branche E : la Viennoise calme, 3.Bc4 Nc6 4.d3 Na5.
 * 8. Anti-panique : 3.d4, 3.Nc3, 3.Qf3 et 3.Be2.
 *
 * Choix des chapitres (2026-11-03) : la théorie
 * principale contre 2.f4 (accepté avec 3.Nf3 et 3.Bc4, refusé) et contre
 * 2.Nc3 (gambit Viennois, 3.Bc4), plus les coups rares après 2...exf4.
 * Aucun autre cours côté Noirs ne traite 2.f4 ni 2.Nc3 (berlin-black,
 * italian-game-black et scotch-four-knights-black partent de 2.Nf3 Nc6).
 * Parties de l'utilisateur (copie de la base du 2026-11-03) : 10 parties
 * attribuées à ce cours, 6 Falkbeer 2...d5 et 4 Viennoises 2...Nc6 3.Bc4 Nf6
 * (transposition vers le chapitre 7).
 * Décisions moteur : 3...d6 (Fischer) plutôt que 3...d5, qui cède 0.5 à
 * profondeur 16 ; le refus par 2...d5 plutôt que 2...Bc5, qui cède davantage
 * que 2...exf4 ; 6...Qf6 au chapitre 1. Les
 * branches théoriques s'arrêtent au plus tard au demi-coup 27 ; les
 * chapitres « Aléatoire surprise » prolongent avec les Blancs comme camp
 * « mou » (`_tmp-drift-w.mts`).
 *
 * Convention côté Noirs (comme `op-berlin-black.ts`) : l'élève joue les
 * Noirs ; les fautes sont des coups BLANCS qui portent les 3 indices
 * `[%hint]` + `[%hintcsl]`, le coup noir suivant est la punition. Les
 * « variantes piégées » sont des coups noirs tentants mais mauvais (7...Nc6
 * contre la dame f6, 11...Bd6, 6...Bf5, 8...Nxc3, 9...Bd7). Une faute qui
 * perd moins de 0.5 devient une « imprécision » sans indices (7.Bd3, 3.d4,
 * 3.Qf3, 3.Be2).
 *
 * Sources : théorie établie du Gambit du Roi et de la Viennoise, TOUTES les
 * lignes arbitrées par Stockfish 19 natif (profondeur 16, MultiPV 1) ; la
 * suite 6...Qf6 7.Nc3 Ne7 de la défense Fischer est un choix du moteur.
 * Toute la prose est originale.
 *
 ## Architecture technique des nœuds
 *
 * Chaque nœud (`ChessMoveNode`, `core/chess/move-tree.ts`) porte :
 * - `evaluationScore` / `evaluationMate` : évaluation Stockfish 19 de la
 *   position après le coup (profondeur 16, point de vue Blancs, comme partout), écrite
 *   `[%eval x]` ; `showEvalBar` est vrai dès qu'elle est posée ;
 * - `freeze` : posé par la balise `[%txt "…"]` qui enveloppe CHAQUE
 *   commentaire ; en mode « Jouer les coups », l'ordinateur attend
 *   « Suivant » ou Espace avant de répondre ;
 * - `hints` / `hintHighlights` : `[%hint "…"]` (3 indices progressifs) et
 *   `[%hintcsl …]` sur les fautes blanches qu'il faut punir.
 *
 * Fichier GÉNÉRÉ : ne pas l'éditer à la main. Source commentée :
 * `scripts/opening-course-src/kings-gambit-vienna-black.pgn` (et l'en-tête
 * `kings-gambit-vienna-black.header.txt`) ; regénérer avec
 * `node --import tsx scripts/_tmp-build-opening-course.mts <source> <en-tête> <sortie> 16`
 * (Stockfish natif, voir `scripts/_tmp-sf-native.mts` ; sous Linux,
 * `SF_BIN=<chemin du binaire>`). Les `[%eval]` viennent du moteur, pas de la
 * main. Étape standard : `scripts/_tmp-check-cited-evals.mts op-kings-gambit-vienna-black`
 * doit sortir 0 écart (un chiffre n'est cité dans un commentaire que s'il est
 * l'éval d'un nœud). Règles de l'utilisateur : SAN en texte brut uniquement
 * (jamais de figurine Unicode), pas de guillemet droit dans un `[%txt]`.
 */

function chapter(title: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, START) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const OP_KINGS_GAMBIT_VIENNA_BLACK: CourseTree = {
  chapters: [
    chapter(
      "Fiche d'identité, tronc commun : Gambit du Roi accepté, la défense Fischer 3...d6",
      `{ [%txt "LE GAMBIT DU ROI ET LA VIENNOISE, AVEC LES NOIRS.

Le vrai enjeu : contre 1...e5, les Blancs jouent f4 tôt (2.f4, ou 2.Nc3 puis f4) pour ouvrir la colonne f et attaquer f7. Nous prenons le pion, et nous le gardons avec la chaîne ...d6, ...g5 : les Blancs doivent sacrifier du temps pour le récupérer, pendant que nos pièces sortent derrière.

Le déséquilibre recherché : un pion de plus et un roi blanc sans pion f, contre une avance de développement blanche. Dans la Viennoise, nous contre-attaquons e4 avec le cavalier f6 et ...d5.

Pourquoi ces chapitres : le choix suit la théorie principale contre les deux débuts à f4 : le gambit accepté avec 3.Nf3 (ce chapitre) et 3.Bc4 (chapitre 3), le gambit refusé par le contre-gambit Falkbeer 2...d5 (chapitre 4), le gambit Viennois 3.f4 d5 (chapitre 5) et la Viennoise calme 3.Bc4 (chapitre 7), plus les coups rares au chapitre 8. Dans tes parties, 6 suivent le Falkbeer et 4 la Viennoise par 2...Nc6 3.Bc4 Nf6. Aucun autre cours de Noirs ne traite 2.f4 ou 2.Nc3 : berlin-black, italian-game-black et scotch-four-knights-black commencent tous par 2.Nf3 Nc6.

Les structures types :
- Gambit accepté : chaîne noire d6-f4-g5 ou f4-g4, roi blanc sans abri, colonne e ouverte.
- Falkbeer : pion d5 blanc avancé, attaqué par ...Nf6 et ...c6.
- Viennoise : cavalier e4 noir au centre, pion e5 blanc avancé ou échangé.

Règle d'or : contre f4, développe vite et vise le roi blanc ; un pion de plus ne vaut rien si tes pièces restent à la maison."] [%eval 0.39] }
1. e4 { [%txt "Les Blancs occupent le centre."] [%eval 0.26] }
1... e5 { [%txt "On répond symétriquement."] [%eval 0.36] [%csl Ge5] }
2. f4 { [%txt "LE GAMBIT DU ROI : les Blancs offrent un pion pour ouvrir la colonne f. Le moteur juge ce gambit douteux (-0.55), mais il faut le connaître. (2.Nc3 : chapitres 5 à 7.)"] [%eval -0.55] [%cal Gf4e5] }
2... exf4 { [%txt "On accepte : c'est le coup le plus fort. (2...d5 : chapitre 4.)"] [%eval -0.51] [%cal Ge5f4] }
3. Nf3 { [%txt "Le cavalier empêche ...Qh4+ et prépare d4. (3.Bc4 : chapitre 3 ; 3.d4, 3.Nc3, 3.Qf3 et 3.Be2 : chapitre 8.)"] [%eval -0.65] }
3... d6 { [%txt "LA DÉFENSE FISCHER : le pion d6 prend la case e5 au cavalier f3 et prépare ...g5 pour tenir f4."] [%eval -0.59] [%cal Gd6e5] }
4. d4 { [%txt "Les Blancs prennent le centre et libèrent le fou c1 vers f4."] [%eval -0.53] }
4... g5 { [%txt "Le pion g5 soutient f4."] [%eval -0.54] [%cal Gg5f4] }
5. h4 { [%txt "Les Blancs attaquent la chaîne par sa tête."] [%eval -0.65] }
5... g4 { [%txt "Le pion avance et chasse le cavalier f3."] [%eval -0.72] [%cal Gg4f3] }
6. Ng1 { [%txt "Le cavalier recule : il ne peut aller ni en e5, tenu par d6, ni en g5."] [%eval -0.69] }
(6. Bxf4 { [%txt "Le fou prend le pion f4, mais le cavalier f3 est attaqué : l'évaluation passe de -0.72 à -2.13."] [%hint "les Blancs reprennent un pion et oublient que leur cavalier f3 est attaqué par le pion g4."] [%hint "le cavalier f3. Notre pion g4 le prend."] [%hint "6...gxf3 : une pièce de plus."] [%hintcsl Rf3,Gg4] [%eval -2.13] }
  6... gxf3 { [%txt "On prend le cavalier."] [%eval -2.42] }
  7. Qxf3 { [%txt "La dame reprend."] [%eval -2.09] }
  7... Nc6 { [%txt "Le cavalier se développe et vise d4."] [%eval -2.28] }
  8. Bb5 { [%txt "Le fou cloue le cavalier."] [%eval -2.22] }
  8... Bd7 { [%txt "À RETENIR.

PRO TIP : -1.83, une pièce de plus. Dans la défense Fischer, ...g4 attaque toujours le cavalier f3 : avant toute prise en f4, regarde où est ce cavalier."] [%eval -1.83] [%csl Rf3] })
6... Qf6 { [%txt "La dame vise f4, d4 et b2."] [%eval -0.76] [%cal Gf6f4,Gf6d4] }
7. Nc3 { [%txt "Le cavalier se développe et vise d5."] [%eval -0.75] }
(7. Bd3 { [%txt "Une imprécision : le fou se développe, mais il coupe la dame d1 de la défense de d4. L'évaluation passe de -0.76 à -1.10."] [%eval -1.10] }
  7... Nc6 { [%txt "Le cavalier attaque d4."] [%eval -1.02] [%cal Gc6d4] }
  8. Nc3 { [%txt "Développement."] [%eval -1.21] }
  8... Nge7 { [%txt "À RETENIR.

PRO TIP : -1.13. Le pion d4 reste sous pression et le pion f4 tient toujours. Un fou en d3 devant la dame d1, c'est un défenseur de d4 en moins."] [%eval -1.13] [%cal Gf6d4] })
7... Ne7 { [%txt "Le cavalier se développe sans gêner la dame, et couvre d5 et f5."] [%eval -0.78] [%cal Ge7d5] }
(7... Nc6 { [%txt "LA VARIANTE PIÉGÉE : le cavalier attaque d4…"] [%eval 0.94] [%csl Rc7] }
  8. Nd5 { [%txt "…mais le cavalier blanc attaque la dame et vise c7."] [%eval 1.12] }
  8... Qxd4 { [%txt "On prend d4…"] [%eval 1.26] }
  9. Nxc7+ { [%txt "…mais la fourchette tombe en c7."] [%eval 1.39] }
  9... Kd8 { [%txt "À RETENIR.

PRO TIP : +1.31. La tour a8 est perdue. Avec la dame en f6, la case d5 doit être tenue : ...Ne7 d'abord, ...Nc6 ensuite."] [%eval 1.31] [%csl Rc7,Ra8] })
8. Bc4 { [%txt "Le fou vise f7."] [%eval -0.77] }
8... Bh6 { [%txt "Le fou soutient f4."] [%eval -0.72] [%cal Gh6f4] }
9. Nge2 { [%txt "Le cavalier se développe et attaque f4."] [%eval -0.76] }
9... Nbc6 { [%txt "Le cavalier se développe et vise d4."] [%eval -0.40] [%cal Gc6d4] }
10. Nb5 { [%txt "Le cavalier vise c7."] [%eval -0.51] }
(10. Qd2 { [%txt "La dame défend f4… mais laisse ...Bd7 et ...O-O-O venir : l'évaluation passe de -0.40 à -1.15."] [%hint "les Blancs jouent un coup de dame passif au lieu de menacer c7."] [%hint "la case d7. Notre fou y vient et prépare le grand roque."] [%hint "10...Bd7 : développement, puis ...O-O-O."] [%hintcsl Gd7,Gc8] [%eval -1.15] }
  10... Bd7 { [%txt "Le fou se développe."] [%eval -1.18] }
  11. g3 { [%txt "Les Blancs attaquent la chaîne."] [%eval -1.40] }
  11... O-O-O { [%txt "À RETENIR.

PRO TIP : -1.57. Notre roi est à l'abri, toutes nos pièces jouent, la chaîne f4-g4 tient. Contre un coup passif, finis ton développement par le grand roque."] [%eval -1.57] [%csl Gc8] })
10... O-O { [%txt "On roque : c7 est défendu… par le sacrifice que les Blancs n'ont pas le temps de jouer.

À RETENIR.

PRO TIP : la feuille de route après la théorie (-0.47).
1. Contre 11.Nxc7, ...Rb8 : le cavalier c7 est enfermé.
2. ...f3 : le pion f3 ouvre la diagonale du fou h6 et casse le roque blanc.
3. ...Ng6 : le cavalier vise h4 et f4."] [%eval -0.47] [%cal Gf4f3] } *`,
    ),
    chapter(
      "Aléatoire surprise 1 : après la défense Fischer, le pion f qui casse tout",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le chapitre 1 jusqu'à 10...O-O. La théorie s'arrête là. Les Blancs ne prennent pas en c7 : ils jouent des coups qui semblent solides, mais notre pion f4 et nos pièces avancent. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case clé (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quel pion noir peut avancer vers le roi blanc ? 3. Quelle pièce noire peut entrer derrière lui ?"] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] }
2. f4 { [%txt "Le gambit."] [%eval -0.55] }
2... exf4 { [%txt "Accepté."] [%eval -0.51] }
3. Nf3 { [%txt "Contre ...Qh4+."] [%eval -0.65] }
3... d6 { [%txt "La défense Fischer."] [%eval -0.59] }
4. d4 { [%txt "Le centre."] [%eval -0.53] }
4... g5 { [%txt "Soutien de f4."] [%eval -0.54] }
5. h4 { [%txt "Contre la chaîne."] [%eval -0.65] }
5... g4 { [%txt "Chasse."] [%eval -0.72] }
6. Ng1 { [%txt "Recul."] [%eval -0.69] }
6... Qf6 { [%txt "Vers f4 et d4."] [%eval -0.76] }
7. Nc3 { [%txt "Développement."] [%eval -0.75] }
7... Ne7 { [%txt "Développement."] [%eval -0.78] }
8. Bc4 { [%txt "Contre f7."] [%eval -0.77] }
8... Bh6 { [%txt "Soutien de f4."] [%eval -0.72] }
9. Nge2 { [%txt "Contre f4."] [%eval -0.76] }
9... Nbc6 { [%txt "Contre d4."] [%eval -0.40] }
10. Nb5 { [%txt "Vers c7."] [%eval -0.51] }
10... O-O { [%txt "Fin de la théorie."] [%eval -0.47] }
11. g3 { [%txt "Les Blancs attaquent f4, mais ouvrent la case f3 : l'évaluation passe de -0.47 à -1.71."] [%hint "les Blancs poussent un pion devant leur roi au lieu de prendre en c7."] [%hint "la case f3. Notre pion f4 y avance et s'installe au cœur du camp blanc."] [%hint "11...f3 : le pion avance avec gain de temps sur le cavalier e2."] [%hintcsl Gf3,Re2] [%eval -1.71] }
11... f3 { [%txt "Le pion attaque le cavalier e2."] [%eval -2.04] [%cal Gf3e2] }
12. Bxh6 { [%txt "Les Blancs échangent le fou h6."] [%eval -1.72] }
12... Qxh6 { [%txt "La dame reprend et vise e3 et d2."] [%eval -2.23] }
13. Nf4 { [%txt "Le cavalier se place en f4."] [%eval -2.09] }
13... Na5 { [%txt "Le cavalier attaque le fou c4."] [%eval -2.08] [%cal Ga5c4] }
14. Bd3 { [%txt "Le fou recule."] [%eval -2.29] }
14... f5 { [%txt "Le pion f ouvre la colonne vers le roi blanc."] [%eval -2.35] [%cal Gf5e4] }
15. Nc3 { [%txt "Le cavalier revient défendre e4, mais la colonne f s'ouvre : l'évaluation passe de -2.35 à -3.31."] [%hint "les Blancs ramènent un cavalier en arrière au lieu de bloquer le centre par e5."] [%hint "le pion e4. Notre pion f5 le prend, et la colonne f s'ouvre vers f4."] [%hint "15...fxe4 : on ouvre la colonne f."] [%hintcsl Re4,Gf5] [%eval -3.31] }
15... fxe4 { [%txt "On ouvre la colonne f."] [%eval -3.47] }
16. Nxe4 { [%txt "Le cavalier reprend."] [%eval -3.76] }
16... Bf5 { [%txt "Le fou cloue le cavalier e4 sur le fou d3."] [%eval -3.78] [%cal Gf5e4] }
17. Kf2 { [%txt "Le roi monte défendre le cavalier f4, mais il se place sur la colonne f, face à notre tour."] [%eval -3.78] }
17... Bxe4 { [%txt "On prend le cavalier."] [%eval -3.76] }
18. Bxe4 { [%txt "Le fou reprend."] [%eval -3.95] }
18... Rxf4 { [%txt "À RETENIR.

PRO TIP : -4.76. Une pièce de plus et une attaque. Dans la défense Fischer, le pion f4 avance en f3 dès que les Blancs affaiblissent leur roque, puis ...f5 ouvre la colonne."] [%eval -4.76] [%cal Gf4e4] } *`,
    ),
    chapter(
      "Branche B : le Gambit du Fou, 3.Bc4",
      `{ [%txt "LE GAMBIT DU FOU (3.Bc4).

Le fou vise f7 tout de suite, mais il laisse ...Qh4+ possible. Notre plan : développer le cavalier f6 contre e4, préparer ...d5 par ...c6, et rendre le pion f4 contre une position active.

Points clés : le fou c4 est la cible de ...d5 ; après l'échange en d5, notre pion c6 reprend et le centre est à nous."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] }
2. f4 { [%txt "Le gambit."] [%eval -0.55] }
2... exf4 { [%txt "On accepte."] [%eval -0.51] }
3. Bc4 { [%txt "LE GAMBIT DU FOU : le fou vise f7."] [%eval -0.54] [%cal Gc4f7] }
3... Nf6 { [%txt "Le cavalier attaque e4."] [%eval -0.27] [%cal Gf6e4] }
4. Nc3 { [%txt "Le cavalier défend e4."] [%eval -0.23] }
4... c6 { [%txt "On prépare ...d5, qui frappera le fou c4."] [%eval -0.26] [%cal Gc6d5] }
5. d4 { [%txt "Les Blancs prennent le centre."] [%eval -0.27] }
(5. Nf3 { [%txt "Le cavalier se développe, mais ...d5 arrive avec gain de temps : l'évaluation passe de -0.26 à -0.79."] [%hint "les Blancs développent un cavalier pendant que leur fou c4 et le pion e4 sont tous deux visés."] [%hint "la case d5. Notre pion y avance et attaque le fou c4 et le pion e4 à la fois."] [%hint "5...d5 : la fourchette de pion."] [%hintcsl Gd5,Rc4] [%eval -0.79] }
  5... d5 { [%txt "Le pion attaque le fou et e4."] [%eval -0.89] [%cal Gd5c4,Gd5e4] }
  6. exd5 { [%txt "Les Blancs prennent."] [%eval -0.94] }
  6... cxd5 { [%txt "On reprend : le fou c4 est attaqué."] [%eval -0.87] }
  7. Bb3 { [%txt "Le fou recule."] [%eval -1.09] }
  7... Nc6 { [%txt "À RETENIR.

PRO TIP : -1.04. Le centre d5 est à nous, le pion f4 tient. Contre 3.Bc4, chaque coup blanc qui ne règle pas ...d5 laisse la fourchette de pion arriver."] [%eval -1.04] [%csl Gd5] })
5... d5 { [%txt "On frappe le fou c4."] [%eval -0.27] [%cal Gd5c4] }
6. exd5 { [%txt "Les Blancs prennent."] [%eval -0.27] }
(6. Bb3 { [%txt "Le fou recule et laisse e4 sans soutien : l'évaluation passe de -0.27 à -1.11."] [%hint "le fou recule alors que le pion e4 n'est plus défendu que par le cavalier c3."] [%hint "le cavalier c3. Notre fou f8 peut le clouer en b4, et e4 tombe."] [%hint "6...Bb4 : le clouage."] [%hintcsl Gb4,Rc3] [%eval -1.11] }
  6... Bb4 { [%txt "Le fou cloue le cavalier c3."] [%eval -1.19] [%cal Gb4c3] }
  7. exd5 { [%txt "Les Blancs échangent."] [%eval -1.24] }
  7... Nxd5 { [%txt "Le cavalier reprend."] [%eval -1.12] }
  8. Bxd5 { [%txt "Les Blancs échangent le cavalier."] [%eval -1.23] }
  8... cxd5 { [%txt "À RETENIR.

PRO TIP : -1.21. Notre centre d5 tient, le pion f4 aussi, et le cavalier c3 reste cloué. Contre 3.Bc4, un fou qui recule devant ...d5 laisse e4 seul."] [%eval -1.21] [%cal Gb4c3] })
6... cxd5 { [%txt "On reprend : le fou c4 est attaqué."] [%eval -0.27] }
7. Bb5+ { [%txt "Le fou s'échappe avec échec."] [%eval -0.26] }
7... Nc6 { [%txt "Le cavalier pare l'échec et se développe."] [%eval -0.27] }
8. Bxf4 { [%txt "Les Blancs récupèrent le pion."] [%eval -0.31] }
8... Be7 { [%txt "Le fou se développe et prépare le roque."] [%eval -0.23] }
9. Nf3 { [%txt "Développement."] [%eval -0.29] }
9... O-O { [%txt "On roque."] [%eval -0.33] [%csl Gg8] }
10. O-O { [%txt "Les Blancs roquent."] [%eval -0.30] }
(10. Qe2 { [%txt "La dame se met sur la colonne e, devant notre futur tour : l'évaluation passe de -0.33 à -0.84."] [%hint "la dame blanche s'installe sur la colonne e, où notre tour va venir."] [%hint "la case e8. Notre tour y vient, derrière le fou e7 : un coup de fou découvrira l'attaque sur la dame."] [%hint "10...Re8 : la tour sur la colonne e."] [%hintcsl Ge8,Re2] [%eval -0.84] }
  10... Re8 { [%txt "La tour se place derrière le fou e7."] [%eval -1.10] [%cal Ge8e2] }
  11. O-O { [%txt "Les Blancs roquent."] [%eval -1.22] }
  11... Ba3 { [%txt "À RETENIR.

PRO TIP : -1.16. Le fou découvre l'attaque de la tour sur la dame e2 et vise b2. Une dame sur la même colonne qu'une tour adverse, c'est une cible pour les attaques à la découverte."] [%eval -1.16] [%cal Ge8e2,Ga3b2] })
10... Ne4 { [%txt "Le cavalier s'installe au centre."] [%eval -0.29] [%csl Ge4] }
11. Qe2 { [%txt "La dame attaque le cavalier e4."] [%eval -0.35] }
11... Bg4 { [%txt "Le fou cloue le cavalier f3 et se développe."] [%eval -0.29] [%cal Gg4f3] }
(11... Bd6 { [%txt "LA VARIANTE PIÉGÉE : le fou propose l'échange en f4…"] [%eval 0.68] [%csl Rd5] }
  12. Nxd5 { [%txt "…mais le pion d5 n'est plus défendu par la dame, et le cavalier le prend. À RETENIR.

PRO TIP : +0.55. Avant de déplacer une pièce, vérifie ce qu'elle défendait : ici le pion d5 n'était tenu que par la dame d8 et le cavalier c6, déjà cloué."] [%eval 0.55] [%csl Rd5] })
12. Bxc6 { [%txt "Les Blancs échangent le cavalier c6."] [%eval -0.38] }
12... Nxc3 { [%txt "On prend le cavalier c3 d'abord.

À RETENIR.

PRO TIP : la feuille de route après la théorie (-0.44).
1. Après 13.bxc3 bxc6 : notre structure c6-d5 tient, le fou g4 cloue toujours.
2. ...Rb8 : la colonne b ouverte vise b2.
3. ...Bd6 : on échange le fou f4, gardien de leur roi."] [%eval -0.44] [%cal Gc3d1] } *`,
    ),
    chapter(
      "Branche C : le gambit refusé, le contre-gambit Falkbeer 2...d5",
      `{ [%txt "LE GAMBIT REFUSÉ : LE CONTRE-GAMBIT FALKBEER (2...d5).

On ne prend pas f4 : on frappe e4 tout de suite. Après 3.exd5, on prend en f4 (3...exf4), et la position ressemble à la défense Moderne du gambit accepté, avec un ordre de coups qui évite les lignes à ...g5. Les Blancs ne peuvent pas garder le pion d5 longtemps.

Pourquoi ...d5 et non 2...Bc5 : à profondeur 16, le moteur trouve que 2...Bc5 cède davantage que 2...d5 face au meilleur coup 2...exf4. Le refus par ...d5 est le plus simple à jouer, et c'est ton coup : 6 de tes parties contre 2.f4 suivent ce chapitre.

Points clés : le pion d5 blanc avancé est une cible pour ...Nf6 et ...c6 ; notre fou f8 donne l'échec en b4 pour gêner le développement blanc."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] }
2. f4 { [%txt "Le gambit."] [%eval -0.55] }
2... d5 { [%txt "LE CONTRE-GAMBIT FALKBEER : on frappe e4 au lieu de prendre. L'évaluation passe de -0.55 à -0.33, un peu moins bien que 2...exf4, mais la position reste saine."] [%eval -0.33] [%cal Gd5e4] }
3. exd5 { [%txt "Les Blancs prennent."] [%eval -0.28] }
3... exf4 { [%txt "On prend f4 à notre tour : le pion d5 blanc sera notre cible."] [%eval -0.29] [%cal Ge5f4] }
4. Nf3 { [%txt "Le cavalier empêche ...Qh4+."] [%eval -0.23] }
4... Nf6 { [%txt "Le cavalier se développe et vise d5."] [%eval -0.24] [%cal Gf6d5] }
5. c4 { [%txt "Les Blancs soutiennent d5 par un pion."] [%eval -0.16] }
5... c6 { [%txt "On attaque d5 une deuxième fois."] [%eval -0.06] [%cal Gc6d5] }
6. d4 { [%txt "Les Blancs prennent le centre."] [%eval -0.09] }
(6. dxc6 { [%txt "Les Blancs échangent en c6, mais notre cavalier sort avec gain de temps : l'évaluation passe de -0.06 à -0.94."] [%hint "les Blancs prennent un pion qui ne faisait rien et développent nos pièces à notre place."] [%hint "la case c6. Notre cavalier b8 y reprend, se développe et vise d4 et b4."] [%hint "6...Nxc6 : on reprend avec une pièce, avance de développement."] [%hintcsl Gc6,Gd4] [%eval -0.94] }
  6... Nxc6 { [%txt "Le cavalier reprend : deux pièces déjà sorties."] [%eval -0.99] [%cal Gb8c6] }
  7. d4 { [%txt "Les Blancs prennent le centre."] [%eval -0.78] }
  7... Bg4 { [%txt "Le fou cloue le cavalier f3, défenseur de d4."] [%eval -1.21] [%cal Gg4d1] }
  8. Be2 { [%txt "Le fou décloue."] [%eval -1.02] }
  8... Qb6 { [%txt "À RETENIR.

PRO TIP : -0.73. La dame vise d4 et b2 en même temps, le pion f4 tient toujours. Quand les Blancs prennent en c6, reprends avec le cavalier, jamais avec le pion b7."] [%eval -0.73] [%cal Gb6d4,Gb6b2] })
6... Bb4+ { [%txt "L'échec gêne le développement blanc : le cavalier c3 sera cloué."] [%eval -0.11] [%cal Gb4e1] }
(6... Bf5 { [%txt "LA VARIANTE PIÉGÉE : un développement naturel…"] [%eval 0.65] [%csl Rb7] }
  7. Qb3 { [%txt "…mais la dame blanche vise b7, que le fou c8 défendait."] [%eval 0.67] }
  7... Qc7 { [%txt "La dame défend b7…"] [%eval 0.40] }
  8. Nc3 { [%txt "…et les Blancs gagnent un temps de développement. À RETENIR.

PRO TIP : +0.43. Quand le pion c4 blanc ouvre la diagonale de la dame vers b7, ne sors pas le fou c8 avant d'avoir réglé d5."] [%eval 0.43] [%csl Rb7] })
7. Nc3 { [%txt "Le cavalier pare l'échec."] [%eval -0.11] }
7... cxd5 { [%txt "On reprend : le pion d5 attaque c4."] [%eval -0.08] [%cal Gd5c4] }
8. Be2 { [%txt "Le fou se développe."] [%eval -0.14] }
(8. cxd5 { [%txt "Les Blancs reprennent et laissent un pion isolé en d5 : l'évaluation passe de -0.08 à -0.90."] [%hint "les Blancs isolent leur pion d5 au lieu de préparer le roque."] [%hint "le pion d5. Notre cavalier f6 et la dame d8 l'attaquent, et le roi blanc est encore en e1."] [%hint "8...O-O : le roi à l'abri, puis ...Nxd5."] [%hintcsl Rd5,Ge8] [%eval -0.90] }
  8... O-O { [%txt "On roque d'abord : le pion d5 ne s'enfuira pas."] [%eval -0.75] [%csl Gg8] }
  9. Bxf4 { [%txt "Les Blancs récupèrent le pion f4."] [%eval -0.88] }
  9... Nxd5 { [%txt "À RETENIR.

PRO TIP : -0.78. Le pion d5 est tombé, le cavalier c3 est cloué et le roi blanc est toujours au centre. Contre un pion isolé, roque d'abord, prends ensuite."] [%eval -0.78] [%cal Gd5c3] })
8... Nc6 { [%txt "Le cavalier se développe et vise d4."] [%eval -0.16] [%cal Gc6d4] }
9. O-O { [%txt "Les Blancs roquent."] [%eval -0.16] }
9... Be6 { [%txt "Le fou soutient d5."] [%eval -0.16] [%cal Ge6d5] }
10. Qb3 { [%txt "La dame attaque b7 et le fou b4 par la colonne b."] [%eval -0.17] }
10... dxc4 { [%txt "On ouvre la position."] [%eval -0.10] }
11. Bxc4 { [%txt "Le fou reprend."] [%eval -0.14] }
11... Bxc4 { [%txt "On échange le fou blanc le plus actif."] [%eval -0.12] }
12. Qxc4 { [%txt "La dame reprend."] [%eval -0.17] }
12... O-O { [%txt "On roque.

À RETENIR.

PRO TIP : la feuille de route après la théorie (-0.11).
1. ...Bd6 et ...Re8 : on garde le pion f4 le plus longtemps possible.
2. ...Rc8 : la colonne c est à nous.
3. Contre Bxf4, ...Bxc3 puis ...Nd5 : le pion isolé d4 devient une cible."] [%eval -0.11] [%csl Gf4] } *`,
    ),
    chapter(
      "Branche D : le gambit Viennois, 2.Nc3 Nf6 3.f4 d5",
      `{ [%txt "LE GAMBIT VIENNOIS (2.Nc3 Nf6 3.f4).

Les Blancs jouent f4 après Nc3. Notre réponse est la même idée : ...d5 au centre. Après 4.fxe5 Nxe4, notre cavalier est installé en e4, et nous visons ...f5 pour le soutenir ou l'échange en c3.

Points clés : le cavalier e4 est fort, le pion e5 blanc est avancé mais isolé de ses soutiens, et notre roque arrive vite."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] }
2. Nc3 { [%txt "LA VIENNOISE : le cavalier soutient e4 et prépare f4."] [%eval 0.14] }
(2. f4 { [%txt "Le Gambit du Roi : chapitres 1 à 4 et 8."] [%eval -0.55] })
2... Nf6 { [%txt "Le cavalier attaque e4."] [%eval 0.05] [%cal Gf6e4] }
3. f4 { [%txt "LE GAMBIT VIENNOIS. (3.Bc4 : chapitre 7.)"] [%eval -0.15] }
3... d5 { [%txt "On frappe le centre : la réponse classique."] [%eval -0.29] [%cal Gd5e4] }
4. fxe5 { [%txt "Les Blancs prennent en e5 : notre cavalier est attaqué."] [%eval -0.26] }
4... Nxe4 { [%txt "Le cavalier prend e4 et s'installe au centre."] [%eval -0.22] [%csl Ge4] }
5. Nf3 { [%txt "Développement."] [%eval -0.15] }
5... Be7 { [%txt "Le fou se développe et prépare le roque."] [%eval -0.13] }
6. d4 { [%txt "Les Blancs prennent le centre."] [%eval -0.13] }
6... O-O { [%txt "On roque."] [%eval 0.08] [%csl Gg8] }
7. Bd3 { [%txt "Le fou attaque le cavalier e4."] [%eval 0.07] }
(7. Be3 { [%txt "Le fou se développe, mais notre fou va clouer le cavalier c3 : l'évaluation passe de +0.08 à -0.84."] [%hint "les Blancs développent le mauvais fou : le cavalier c3, défenseur de e4, reste sans soutien."] [%hint "le cavalier c3. Notre fou e7 le cloue depuis b4."] [%hint "7...Bb4 : le clouage."] [%hintcsl Gb4,Rc3] [%eval -0.84] }
  7... Bb4 { [%txt "Le fou cloue le cavalier c3."] [%eval -0.84] [%cal Gb4c3] }
  8. a3 { [%txt "Les Blancs chassent le fou."] [%eval -0.99] }
  8... Bxc3+ { [%txt "On prend en c3."] [%eval -1.03] }
  9. bxc3 { [%txt "Le pion reprend : pions doublés."] [%eval -1.10] }
  9... c5 { [%txt "À RETENIR.

PRO TIP : -1.14. Les pions c doublés et le pion d4 deviennent des cibles. Contre un cavalier c3 non soutenu, le clouage ...Bb4 est le coup naturel."] [%eval -1.14] [%cal Gc5d4] })
7... f5 { [%txt "Le pion soutient le cavalier e4."] [%eval 0.07] [%cal Gf5e4] }
8. exf6 { [%txt "Les Blancs prennent en passant."] [%eval 0.11] }
8... Bxf6 { [%txt "Le fou reprend et vise d4."] [%eval 0.09] [%cal Gf6d4] }
(8... Nxc3 { [%txt "LA VARIANTE PIÉGÉE : on échange tout de suite le cavalier c3…"] [%eval 0.68] [%csl Rf6] }
  9. bxc3 { [%txt "…le pion reprend…"] [%eval 0.66] }
  9... Rxf6 { [%txt "…et on reprend f6 avec la tour…"] [%eval 0.63] }
  10. O-O { [%txt "…mais les Blancs roquent, avec la colonne f et un fou d3 qui vise h7. À RETENIR.

PRO TIP : +0.76. Le cavalier e4 est notre meilleure pièce : ne l'échange pas pour rien. Reprends d'abord en f6 avec le fou."] [%eval 0.76] [%csl Rh7] })
9. O-O { [%txt "Les Blancs roquent."] [%eval 0.14] }
9... Nc6 { [%txt "Le cavalier attaque d4."] [%eval 0.12] [%cal Gc6d4] }
10. Nxe4 { [%txt "Les Blancs échangent le cavalier e4."] [%eval 0.08] }
(10. Bxe4 { [%txt "Le fou prend le cavalier, mais le pion d4 manque ensuite de défenseurs : l'évaluation passe de +0.12 à -0.65."] [%hint "les Blancs prennent avec le fou et laissent le pion d4 sous le feu de nos pièces."] [%hint "le pion d4. Notre fou f6 et notre cavalier c6 l'attaquent après ...dxe4."] [%hint "10...dxe4 : on reprend, puis d4 tombera."] [%hintcsl Rd4,Gf6] [%eval -0.65] }
  10... dxe4 { [%txt "Le pion reprend et attaque le cavalier f3."] [%eval -0.64] }
  11. Nxe4 { [%txt "Les Blancs reprennent le pion."] [%eval -0.72] }
  11... Bxd4+ { [%txt "Le fou prend d4 avec échec."] [%eval -0.74] }
  12. Kh1 { [%txt "Le roi s'écarte."] [%eval -0.66] }
  12... Bb6 { [%txt "À RETENIR.

PRO TIP : -0.53. Le pion d4 est tombé, notre fou vise g1. Quand les Blancs échangent leur fou de cases blanches en e4, compte les défenseurs de d4."] [%eval -0.53] [%cal Gb6g1] })
10... dxe4 { [%txt "Le pion reprend."] [%eval 0.13] }
11. Bxe4 { [%txt "Le fou reprend."] [%eval 0.05] }
(11. Bc4+ { [%txt "L'échec semble actif, mais notre roi trouve h8 et d4 reste faible : l'évaluation passe de +0.13 à -0.79."] [%hint "un échec qui ne gagne rien : notre roi est en sécurité en h8."] [%hint "la case h8. Notre roi s'y abrite, puis le pion d4 tombe."] [%hint "11...Kh8 : on évite tout clouage sur la diagonale."] [%hintcsl Gh8,Rd4] [%eval -0.79] }
  11... Kh8 { [%txt "À RETENIR.

PRO TIP : -0.71. Le pion e4 attaque le cavalier f3 et d4 est attaqué deux fois. Contre un échec sans suite, cherche la case la plus sûre pour le roi."] [%eval -0.71] [%cal Ge4f3] })
11... Nxd4 { [%txt "Le cavalier prend d4."] [%eval 0.05] }
12. c3 { [%txt "Le pion chasse le cavalier."] [%eval 0.02] }
12... Nxf3+ { [%txt "On échange le cavalier f3."] [%eval 0.01] }
13. Bxf3 { [%txt "Le fou reprend."] [%eval -0.01] }
13... c6 { [%txt "Le pion contrôle d5 et b5.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.04).
1. ...Qb6+ puis ...Be6 : nos fous prennent les diagonales.
2. ...Rad8 : la colonne d ouverte.
3. Contre Bg4, ...Bxg4 : on échange le fou blanc actif."] [%eval 0.04] [%csl Gd5] } *`,
    ),
    chapter(
      "Aléatoire surprise 2 : après le gambit Viennois, le pion b2 qui tombe",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le chapitre 5 jusqu'à 13...c6. La théorie s'arrête là. Les Blancs jouent des coups qui semblent actifs mais laissent leur aile dame sans défense. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case clé (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quel pion blanc est sans défense ? 3. Quelle pièce noire l'attaque avec gain de temps ?"] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] }
2. Nc3 { [%txt "La Viennoise."] [%eval 0.14] }
(2. f4 { [%txt "Le Gambit du Roi : chapitres 1 à 4 et 8."] [%eval -0.55] })
2... Nf6 { [%txt "Contre e4."] [%eval 0.05] }
3. f4 { [%txt "Le gambit."] [%eval -0.15] }
3... d5 { [%txt "Au centre."] [%eval -0.29] }
4. fxe5 { [%txt "Prise."] [%eval -0.26] }
4... Nxe4 { [%txt "Le cavalier au centre."] [%eval -0.22] }
5. Nf3 { [%txt "Développement."] [%eval -0.15] }
5... Be7 { [%txt "Développement."] [%eval -0.13] }
6. d4 { [%txt "Le centre."] [%eval -0.13] }
6... O-O { [%txt "Roque."] [%eval 0.08] }
7. Bd3 { [%txt "Contre e4."] [%eval 0.07] }
7... f5 { [%txt "Soutien."] [%eval 0.07] }
8. exf6 { [%txt "En passant."] [%eval 0.11] }
8... Bxf6 { [%txt "Reprise."] [%eval 0.09] }
9. O-O { [%txt "Roque."] [%eval 0.14] }
9... Nc6 { [%txt "Contre d4."] [%eval 0.12] }
10. Nxe4 { [%txt "Échange."] [%eval 0.08] }
10... dxe4 { [%txt "Reprise."] [%eval 0.13] }
11. Bxe4 { [%txt "Reprise."] [%eval 0.05] }
11... Nxd4 { [%txt "Le pion d4."] [%eval 0.05] }
12. c3 { [%txt "Chasse."] [%eval 0.02] }
12... Nxf3+ { [%txt "Échange."] [%eval 0.01] }
13. Bxf3 { [%txt "Reprise."] [%eval -0.01] }
13... c6 { [%txt "Fin de la théorie."] [%eval 0.04] }
14. Bg4 { [%txt "Le fou propose l'échange, mais il quitte la défense de la diagonale a7-g1 : l'évaluation passe de +0.04 à -0.59."] [%hint "les Blancs déplacent leur fou au lieu de sortir la dame, et leur roi reste sur la diagonale de notre dame."] [%hint "la case b6. Notre dame y donne échec au roi g1 et vise b2."] [%hint "14...Qb6+ : échec et pression sur b2."] [%hintcsl Gb6,Rg1] [%eval -0.59] }
14... Qb6+ { [%txt "Échec : la dame vise aussi b2."] [%eval -0.60] [%cal Gb6g1,Gb6b2] }
15. Kh1 { [%txt "Le roi s'écarte."] [%eval -0.57] }
15... Bxg4 { [%txt "On échange le fou."] [%eval -0.56] }
16. Qxg4 { [%txt "La dame reprend."] [%eval -0.56] }
16... Qb5 { [%txt "La dame se recentre et surveille la cinquième rangée."] [%eval -0.77] }
17. Be3 { [%txt "Le fou se développe et laisse b2."] [%eval -0.71] }
17... Qxb2 { [%txt "On prend le pion b2."] [%eval -0.79] }
18. Rab1 { [%txt "La tour attaque la dame, mais c3 tombe à son tour : l'évaluation passe de -0.79 à -1.44."] [%hint "la tour chasse notre dame, mais le pion c3 n'est plus défendu par le pion b2."] [%hint "le pion c3. Notre dame le prend en quittant b2."] [%hint "18...Qxc3 : un deuxième pion."] [%hintcsl Rc3,Gb2] [%eval -1.44] }
18... Qxc3 { [%txt "Deuxième pion."] [%eval -1.79] }
19. Bg1 { [%txt "Le fou se replie."] [%eval -2.06] }
19... Rf7 { [%txt "La tour défend la septième rangée."] [%eval -1.95] }
20. Rbd1 { [%txt "La tour prend la colonne d, mais la colonne e est libre pour nous : l'évaluation passe de -1.95 à -2.50."] [%hint "les Blancs prennent une colonne et laissent la colonne e à nos tours."] [%hint "la case e8. Notre tour a8 y vient et contrôle la colonne e."] [%hint "20...Re8 : la deuxième tour entre en jeu."] [%hintcsl Ge8] [%eval -2.50] }
20... Re8 { [%txt "À RETENIR.

PRO TIP : -2.73. Deux pions de plus, deux tours actives. Quand les Blancs sacrifient l'aile dame pour l'activité, prends les pions et active tes tours avant de défendre."] [%eval -2.73] [%cal Ge8e1] } *`,
    ),
    chapter(
      "Branche E : la Viennoise calme, 3.Bc4 Nc6 4.d3 Na5",
      `{ [%txt "LA VIENNOISE CALME (3.Bc4).

Les Blancs développent le fou vers f7 avant f4. Notre plan le plus simple : ...Nc6, puis ...Na5 pour échanger ce fou dangereux, et ...Bc5 pour gêner f4 (le roi g1 serait sur la diagonale).

Points clés : la paire de fous est à nous après ...Nxc4 ; le fou c5 surveille f2 et g1."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] }
2. Nc3 { [%txt "La Viennoise."] [%eval 0.14] }
(2. f4 { [%txt "Le Gambit du Roi : chapitres 1 à 4 et 8."] [%eval -0.55] })
2... Nf6 { [%txt "Le cavalier attaque e4."] [%eval 0.05] }
3. Bc4 { [%txt "Le fou vise f7."] [%eval 0.05] }
3... Nc6 { [%txt "Le cavalier se développe. Même position par l'ordre 2...Nc6 3.Bc4 Nf6, celui de 4 de tes parties."] [%eval 0.09] }
4. d3 { [%txt "Les Blancs soutiennent e4."] [%eval 0.03] }
4... Na5 { [%txt "Le cavalier vise le fou c4 : nous aurons la paire de fous."] [%eval 0.02] [%cal Ga5c4] }
5. Nge2 { [%txt "Le cavalier se développe sans gêner f4."] [%eval 0.13] }
5... Bc5 { [%txt "Le fou vise f2 et la diagonale du roi."] [%eval 0.05] [%cal Gc5f2] }
6. O-O { [%txt "Les Blancs roquent."] [%eval 0.05] }
(6. Be3 { [%txt "Le fou propose l'échange, mais il abîme la structure blanche : l'évaluation passe de +0.05 à -1.02."] [%hint "les Blancs offrent un échange qui double leurs pions e."] [%hint "le fou e3. Notre fou c5 le prend, et après fxe3 le pion e3 est faible."] [%hint "6...Bxe3 7.fxe3 Nxc4 : la paire de fous et des pions doublés chez eux."] [%hintcsl Re3,Gc4] [%eval -1.02] }
  6... Bxe3 { [%txt "On prend le fou."] [%eval -0.84] }
  7. fxe3 { [%txt "Le pion reprend : pions e doublés."] [%eval -0.86] }
  7... Nxc4 { [%txt "On prend le fou c4."] [%eval -0.87] }
  8. dxc4 { [%txt "Le pion reprend : encore des pions doublés."] [%eval -0.91] }
  8... d6 { [%txt "À RETENIR.

PRO TIP : -0.89. Deux paires de pions doublés chez les Blancs. Un fou qui propose l'échange en e3 contre notre fou c5 abîme souvent sa propre structure."] [%eval -0.89] [%csl Rc4,Re3] })
6... O-O { [%txt "On roque."] [%eval 0.05] [%csl Gg8] }
7. Ng3 { [%txt "Le cavalier vise f5."] [%eval 0.04] }
7... Nxc4 { [%txt "On prend le fou c4 : la paire de fous est à nous."] [%eval 0.08] }
8. dxc4 { [%txt "Le pion reprend."] [%eval 0.07] }
8... d6 { [%txt "Le pion soutient e5 et ouvre le fou c8."] [%eval -0.01] }
9. Qd3 { [%txt "La dame se développe."] [%eval 0.04] }
9... Nd7 { [%txt "Le cavalier va vers c5 ou f6."] [%eval 0.10] [%cal Gd7c5] }
(9... Bd7 { [%txt "LA VARIANTE PIÉGÉE : un développement naturel…"] [%eval 1.09] [%csl Rf6] }
  10. Bg5 { [%txt "…mais le fou blanc cloue notre cavalier f6 sur la dame…"] [%eval 1.13] }
  10... h6 { [%txt "…on chasse le fou…"] [%eval 1.07] }
  11. Bxf6 { [%txt "…il prend en f6…"] [%eval 1.08] }
  11... Qxf6 { [%txt "…et Nd5 ou Nh5 viendront avec gain de temps sur la dame. À RETENIR.

PRO TIP : +1.10. Le cavalier f6 était cloué ; après 9...Nd7, le fou blanc n'a plus de cible en g5."] [%eval 1.10] [%csl Rf6] })
10. Be3 { [%txt "Les Blancs proposent l'échange du fou c5."] [%eval -0.08] }
(10. b4 { [%txt "Le pion attaque le fou c5, mais il n'est pas défendu : l'évaluation passe de +0.10 à -1.49."] [%hint "les Blancs avancent un pion que rien ne protège."] [%hint "le pion b4. Notre fou c5 le prend."] [%hint "10...Bxb4 : un pion de plus."] [%hintcsl Rb4,Gc5] [%eval -1.49] }
  10... Bxb4 { [%txt "On prend le pion."] [%eval -1.59] }
  11. Nd5 { [%txt "Le cavalier attaque le fou b4."] [%eval -1.63] }
  11... Bc5 { [%txt "À RETENIR.

PRO TIP : -1.31. Un pion de plus et la paire de fous. Avant de répondre à une attaque de pion, regarde s'il est défendu."] [%eval -1.31] [%csl Gc5] })
10... Bxe3 { [%txt "On échange."] [%eval -0.09] }
11. Qxe3 { [%txt "La dame reprend."] [%eval -0.05] }
(11. fxe3 { [%txt "Le pion reprend vers le centre, mais la structure blanche s'abîme : l'évaluation passe de -0.09 à -0.72."] [%hint "les Blancs doublent leurs pions e alors que la dame pouvait reprendre."] [%hint "la case c5. Notre cavalier d7 y saute et vise e4 et d3."] [%hint "11...Nc5 : le cavalier attaque la dame."] [%hintcsl Gc5,Re3] [%eval -0.72] }
  11... Nc5 { [%txt "Le cavalier attaque la dame."] [%eval -0.88] [%cal Gc5d3] }
  12. Qe2 { [%txt "La dame recule."] [%eval -0.77] }
  12... Be6 { [%txt "À RETENIR.

PRO TIP : -0.80. Deux paires de pions doublés chez les Blancs, nos pièces sont mieux placées. Contre une reprise de pion en e3, le cavalier en c5 est notre meilleure pièce."] [%eval -0.80] [%cal Ge6c4] })
11... Nc5 { [%txt "Le cavalier se place en c5.

À RETENIR.

PRO TIP : la feuille de route après la théorie (-0.03).
1. ...Ne6 : le cavalier vise d4 et f4.
2. ...Be6 et ...b6 : on attaque le pion c4, doublé.
3. Contre f4, ...exf4 puis ...Re8 : la colonne e ouverte."] [%eval -0.03] [%cal Gc5e6] } *`,
    ),
    chapter(
      "Anti-panique : 3.d4, 3.Nc3, 3.Qf3 et 3.Be2",
      `{ [%txt "ANTI-PANIQUE.

Après 1.e4 e5 2.f4 exf4, les Blancs ont d'autres coups que 3.Nf3 et 3.Bc4. Pas de panique : la règle reste la même. Contre un coup qui laisse h4 libre, pense à ...Qh4+ ; contre les autres, développe et frappe le centre par ...d5.

PRO TIP : contre un coup rare, demande-toi d'abord si la case h4 est encore contrôlée par un cavalier en f3."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] }
2. f4 { [%txt "Le gambit."] [%eval -0.55] }
2... exf4 { [%txt "On accepte."] [%eval -0.51] }
3. d4 { [%txt "Une imprécision : les Blancs prennent le centre mais laissent h4 libre. L'évaluation passe de -0.51 à -0.89."] [%eval -0.89] }
(3. Nc3 { [%txt "Le cavalier se développe vers d5."] [%eval -0.54] }
  3... Nc6 { [%txt "On se développe aussi : l'échec ...Qh4+ attend que d4 soit joué."] [%eval -0.26] }
  4. d4 { [%txt "Les Blancs prennent le centre."] [%eval -0.13] }
  4... Qh4+ { [%txt "Maintenant l'échec : le roi doit marcher."] [%eval -0.35] [%cal Gh4e1] }
  5. Ke2 { [%txt "Le roi monte."] [%eval -0.65] }
  5... g5 { [%txt "À RETENIR.

PRO TIP : -0.60. Le pion f4 est soutenu par g5, le roi blanc n'a pas roqué. Contre 3.Nc3, développe d'abord, puis ...Qh4+ dès que d4 a affaibli e1-h4."] [%eval -0.60] [%cal Gg5f4] })
(3. Qf3 { [%txt "Une imprécision : la dame vise f4, mais elle prend la case du cavalier g1. L'évaluation passe de -0.51 à -0.71."] [%eval -0.71] }
  3... Nc6 { [%txt "Le cavalier se développe et vise d4 et b4."] [%eval -1.27] }
  (3... Qh4+ { [%txt "LA VARIANTE PIÉGÉE : l'échec réflexe…"] [%eval -0.18] [%csl Rh4] }
    4. g3 { [%txt "…les Blancs interposent le pion g…"] [%eval -0.32] }
    4... fxg3 { [%txt "…on prend…"] [%eval -0.17] }
    5. hxg3 { [%txt "…et la tour h1 attaque notre dame par la colonne h, ouverte par notre propre prise. À RETENIR.

PRO TIP : -0.27. Le pion f4 a disparu et la dame doit encore bouger. Avec la dame blanche en f3, ...Qh4+ ne chasse pas le roi : il ouvre la colonne h aux Blancs."] [%eval -0.27] [%cal Gh1h4] })
  4. Qxf4 { [%txt "La dame reprend le pion."] [%eval -1.23] }
  4... Bd6 { [%txt "Le fou attaque la dame avec gain de temps."] [%eval -1.17] [%cal Gd6f4] }
  5. Qe3 { [%txt "La dame recule."] [%eval -1.36] }
  5... Nf6 { [%txt "À RETENIR.

PRO TIP : -1.23. Trois pièces sorties contre une dame déjà promenée. Contre une sortie précoce de la dame, développe avec gain de temps sur elle."] [%eval -1.23] [%cal Gf6e4] })
(3. Be2 { [%txt "Une imprécision : le petit gambit du fou, sans menace sur f7. L'évaluation passe de -0.51 à -0.82."] [%eval -0.82] }
  3... d5 { [%txt "On frappe le centre."] [%eval -0.60] [%cal Gd5e4] }
  4. exd5 { [%txt "Les Blancs prennent."] [%eval -0.64] }
  (4. e5 { [%txt "Le pion avance et ferme le centre, mais il laisse d4 et f4 à nos pions : l'évaluation passe de -0.60 à -2.29."] [%hint "les Blancs avancent un pion au lieu de se développer, et leur centre reste en retard."] [%hint "la case d4. Notre pion d5 y avance et prend l'espace, le pion d2 blanc est bloqué."] [%hint "4...d4 : le pion avance, puis ...Nc6."] [%hintcsl Gd4,Rd2] [%eval -2.29] }
    4... d4 { [%txt "Le pion prend l'espace."] [%eval -2.41] [%csl Gd4] }
    5. Nf3 { [%txt "Développement."] [%eval -2.28] }
    5... Nc6 { [%txt "À RETENIR.

PRO TIP : -2.64. Deux pions de plus en d4 et f4 dans la position, nos pièces sortent vite. Contre e5 qui ferme le centre, avance ton pion d."] [%eval -2.64] [%cal Gc6e5] })
  4... Nf6 { [%txt "Le cavalier vise d5."] [%eval -0.77] }
  5. Nf3 { [%txt "Développement."] [%eval -0.67] }
  5... Nxd5 { [%txt "Le cavalier reprend."] [%eval -0.72] }
  6. d4 { [%txt "Le centre."] [%eval -0.79] }
  6... Bb4+ { [%txt "À RETENIR.

PRO TIP : -0.68. L'échec gêne le développement blanc, et le pion f4 tient toujours. Contre 3.Be2, ...d5 et ...Nf6 suffisent."] [%eval -0.68] [%cal Gb4e1] })
3... Qh4+ { [%txt "L'échec : le roi blanc doit marcher."] [%eval -1.00] [%cal Gh4e1] }
4. Ke2 { [%txt "Le roi monte en e2."] [%eval -0.87] }
4... d5 { [%txt "On frappe le centre : la colonne e va s'ouvrir vers le roi blanc."] [%eval -0.87] [%cal Gd5e4] }
5. exd5 { [%txt "Les Blancs prennent."] [%eval -0.86] }
(5. e5 { [%txt "Le pion avance et ferme la colonne e, mais le roi e2 reste sous le feu : l'évaluation passe de -0.87 à -3.19."] [%hint "les Blancs ferment le centre avec leur roi en e2, sans se développer."] [%hint "la case g4. Notre fou y donne échec au roi e2."] [%hint "5...Bg4+ : échec, puis ...Nc6 contre d4."] [%hintcsl Gg4,Re2] [%eval -3.19] }
  5... Bg4+ { [%txt "Échec au roi."] [%eval -3.22] [%cal Gg4e2] }
  6. Nf3 { [%txt "Le cavalier s'interpose."] [%eval -3.61] }
  6... Nc6 { [%txt "À RETENIR.

PRO TIP : -3.71. Le cavalier f3 est cloué, d4 est attaqué et le roi blanc n'a aucun abri. Avec le roi adverse en e2, chaque développement avec gain de temps compte double."] [%eval -3.71] [%cal Gc6d4] })
5... Bg4+ { [%txt "Le fou donne échec."] [%eval -0.85] [%cal Gg4e2] }
6. Nf3 { [%txt "Le cavalier s'interpose."] [%eval -0.98] }
6... Bxf3+ { [%txt "On prend le cavalier avec échec."] [%eval -0.99] }
7. gxf3 { [%txt "Le pion reprend : le roi blanc est sans abri."] [%eval -0.98] }
7... Nd7 { [%txt "Le cavalier vise e5 et f6.

À RETENIR.

PRO TIP : la feuille de route après la théorie (-0.93).
1. ...O-O-O : notre roi à l'abri, la tour sur la colonne d.
2. ...Ngf6 et ...Nxd5 : on reprend le pion d5.
3. ...Re8+ : la colonne e vise le roi e2."] [%eval -0.93] [%cal Gd7e5] } *`,
    ),
  ],
};
