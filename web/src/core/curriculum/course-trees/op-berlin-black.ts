import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours d'ouverture « Défense Berlinoise (avec les Noirs) » — onglet
 * Ouvertures, format « un commentaire par coup » de l'Académie, lu par
 * `CourseTreeViewer` (route `/ouvertures/berlin-black/cours`). Public visé :
 * 1500-1800 Elo, répertoire 1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6 (fiche curatée
 * `berlin-black`, C65).
 *
 * ## Contenu (v2 du 2026-10-19, format Ruy Lopez v2, côté Noirs)
 *
 * 1. Fiche d'identité, tronc commun et la finale berlinoise (4.O-O Nxe4 5.d4).
 * 2. Branche B : 4.O-O Nxe4 5.Re1.
 * 3. Aléatoire surprise 1 : après 5.Re1, le pion de plus qui grandit.
 * 4. Branche C : l'anti-Berlinoise 4.d3.
 * 5. Aléatoire surprise 2 : après 4.d3, la dame qui s'invite.
 * 6. Branche D : 4.Nc3, les Quatre Cavaliers espagnols (4...Nd4).
 * 7. Branche E : l'échange 4.Bxc6.
 * 8. Anti-panique : 4.Qe2 et 4.d4.
 *
 * Choix des chapitres d'après les parties de l'utilisateur (26 Espagnoles avec
 * les Noirs, dont 17 Berlinoises) : 4.d3 (6 parties) et 4.O-O (6) d'abord,
 * puis 4.Nc3 (3) et 4.Bxc6. Défaites relevées : 4.O-O d6 ou 4...Bd6 au lieu
 * de 4...Nxe4 (traité en variante « imprécision » au chapitre 1), et des
 * structures où le fou blanc prend en c6 sans contre-jeu noir. Les branches
 * théoriques s'arrêtent au plus tard au demi-coup 27 ; les chapitres
 * « Aléatoire surprise » prolongent de 8 coups environ avec les Blancs comme
 * camp « mou » (`_tmp-drift-w.mts` : `_tmp-drift.mts` ne fait jouer « mou »
 * que les Noirs). La surprise 1 part de 5.Re1 et non de la finale : en finale,
 * la dérive ne trouvait qu'une seule faute calme de plus de 0.55.
 *
 * Convention côté Noirs (comme `op-caro-kann.ts`) : l'élève joue les Noirs ;
 * les fautes sont des coups BLANCS qui portent les 3 indices `[%hint]` +
 * `[%hintcsl]`, le coup noir suivant est la punition. Les « variantes
 * piégées » sont des coups noirs tentants mais perdants. Les évaluations
 * restent au point de vue des Blancs (négatif = avantage noir).
 *
 * Sources : théorie établie de la Berlinoise, TOUTES les lignes arbitrées par
 * Stockfish 18 natif (profondeur 16). Contre 4.d3, le cours suit le levier
 * ...d5 que préfère le moteur (et non ...d6). Toute la prose est originale.
 *
 ## Architecture technique des nœuds
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
 * `scripts/opening-course-src/berlin-black.pgn` (et l'en-tête
 * `berlin-black.header.txt`) ; regénérer avec
 * `node --import tsx scripts/_tmp-build-opening-course.mts <source> <en-tête> <sortie> 16`
 * (Stockfish natif, voir `scripts/_tmp-sf-native.mts`). Les `[%eval]` viennent
 * du moteur, pas de la main. Étape standard :
 * `scripts/_tmp-check-cited-evals.mts op-berlin-black` doit sortir 0 écart
 * (un chiffre n'est cité dans un commentaire que s'il est l'éval d'un nœud).
 * Règles de l'utilisateur : SAN en texte brut uniquement (jamais de figurine
 * Unicode), pas de guillemet droit dans un `[%txt]`.
 */

function chapter(title: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, START) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const OP_BERLIN_BLACK: CourseTree = {
  chapters: [
    chapter(
      "Fiche d'identité, tronc commun et la finale berlinoise (4.O-O Nxe4 5.d4)",
      `{ [%txt "LA DÉFENSE BERLINOISE, AVEC LES NOIRS.

Le vrai enjeu : au lieu de chasser le fou b5 par ...a6, on contre-attaque e4 tout de suite. Contre 4.O-O, on prend le pion : les Blancs le récupèrent, mais au prix d'un échange des dames qui mène à la célèbre finale berlinoise.

Le déséquilibre recherché : dans la finale, nous avons la paire de fous et une structure sans faiblesse réelle ; les Blancs ont une majorité à l'aile roi (le pion e5) et un roi mieux placé. Notre roi reste au centre sans danger, puisque les dames ont disparu.

Ce que disent tes parties : 26 Espagnoles avec les Noirs, dont 17 Berlinoises. Les Blancs ont surtout joué 4.d3 (6 parties) et 4.O-O (6). Contre 4.O-O, tes défaites viennent de 4...d6 ou 4...Bd6 au lieu de 4...Nxe4 ; contre 4.d3 et 4.Nc3, de structures où le fou blanc a pris en c6 sans contre-jeu de notre part.

Les structures types (relevées sur la position finale de chaque chapitre) :
- Finale berlinoise (ce chapitre) : Blancs a2-b2-c2-e5-f2-g2-h3, Noirs a7-b7-c7-c6-f7-g7-h5 ; pions doublés en c contre la paire de fous.
- 5.Re1 : centre ouvert, nos fous actifs, un pion d4 à prendre.
- 4.d3 : le levier ...d5 libère tout notre jeu.
- 4.Bxc6 : pions doublés c7-c6, paire de fous, et le levier ...f6 pour tenir e5.

Règle d'or : chaque coup noir a un rôle précis, dessiné par une flèche ou une case."] [%eval 0.37] }
1. e4 { [%txt "Les Blancs occupent le centre."] [%eval 0.37] }
1... e5 { [%txt "Symétrie : on conteste le centre."] [%eval 0.39] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.38] }
2... Nc6 { [%txt "Le cavalier défend e5."] [%eval 0.40] [%cal Gc6e5] }
3. Bb5 { [%txt "L'Espagnole : le fou attaque le défenseur de e5."] [%eval 0.28] }
3... Nf6 { [%txt "LA BERLINOISE : on contre-attaque e4 au lieu de chasser le fou."] [%eval 0.26] [%cal Gf6e4] }
4. O-O { [%txt "Les Blancs roquent et laissent e4 en prise. (4.d3 : chapitre 4 ; 4.Nc3 : chapitre 6 ; 4.Bxc6 : chapitre 7 ; 4.Qe2 et 4.d4 : chapitre 8.)"] [%eval 0.32] }
4... Nxe4 { [%txt "On prend le pion : c'est le coup le plus précis contre 4.O-O."] [%eval 0.34] [%cal Gf6e4] }
(4... d6 { [%txt "Une imprécision, jouée dans deux de tes défaites : l'évaluation passe de +0.32 (après 4.O-O) à +0.56, alors que 4...Nxe4 la garde. Le pion d6 enferme le fou f8 et laisse les Blancs jouer d4 avec gain de temps."] [%eval 0.56] [%csl Rf8] }
  5. d4 { [%txt "Les Blancs prennent le centre : e5 est attaqué deux fois, et le cavalier c6 est cloué par le fou b5. À RETENIR.

PRO TIP : contre 4.O-O, ne te contente pas d'un coup solide : prends le pion e4, c'est la raison d'être de 3...Nf6."] [%eval 0.63] })
5. d4 { [%txt "Les Blancs ouvrent le centre pour récupérer le pion. (5.Re1 : chapitre 2.)"] [%eval 0.08] }
5... Nd6 { [%txt "Le cavalier recule en attaquant le fou b5."] [%eval 0.09] [%cal Gd6b5] }
6. Bxc6 { [%txt "Les Blancs échangent le fou."] [%eval 0.13] }
(6. Be2 { [%txt "Le fou recule au lieu d'échanger : l'évaluation passe de +0.09 à -0.72."] [%hint "le fou recule et laisse notre pion e5 libre d'avancer."] [%hint "la case e4. Notre pion e5 y avance et chasse le cavalier f3, puis le pion d4 manque de défenseurs."] [%hint "6...e4 : on chasse le cavalier, puis ...Nf5 contre d4."] [%hintcsl Ge4,Rd4] [%eval -0.72] }
  6... e4 { [%txt "Le pion chasse le cavalier f3."] [%eval -0.75] [%cal Ge4f3] }
  7. Ne5 { [%txt "Le cavalier saute en e5."] [%eval -0.56] }
  7... Nf5 { [%txt "Le cavalier attaque d4."] [%eval -0.48] [%cal Gf5d4] }
  8. Nc3 { [%txt "Développement."] [%eval -0.54] }
  8... Nfxd4 { [%txt "À RETENIR.

PRO TIP : -0.56, un pion de plus. Quand le fou recule au lieu d'échanger en c6, notre pion e5 devient une arme : il chasse le cavalier et d4 tombe."] [%eval -0.56] [%csl Gd4] })
6... dxc6 { [%txt "On reprend vers le centre : la diagonale du fou c8 s'ouvre."] [%eval 0.26] [%cal Gc8g4] }
7. dxe5 { [%txt "Le pion reprend e5 et chasse notre cavalier."] [%eval 0.19] }
(7. Re1 { [%txt "La tour cloue e5, mais le pion avance quand même : l'évaluation passe de +0.26 à -0.89."] [%hint "les Blancs attaquent e5 une fois de plus au lieu de le prendre."] [%hint "la case e4. Notre pion e5 y avance en chassant le cavalier f3."] [%hint "7...e4 : le pion avance avec gain de temps."] [%hintcsl Ge4,Rf3] [%eval -0.89] }
  7... e4 { [%txt "Le pion chasse le cavalier."] [%eval -0.72] [%cal Ge4f3] }
  8. Nbd2 { [%txt "Le cavalier soutient l'attaque sur e4."] [%eval -0.58] }
  8... f5 { [%txt "Le pion soutient e4."] [%eval -0.53] [%cal Gf5e4] }
  9. Ne5 { [%txt "Le cavalier se centralise."] [%eval -0.50] }
  9... Be6 { [%txt "À RETENIR.

PRO TIP : -0.58. Notre chaîne e4-f5 tient, la paire de fous est intacte. Dans la Berlinoise, le pion e5 qui avance en e4 avec gain de temps vaut souvent mieux que le centre blanc."] [%eval -0.58] [%csl Ge4,Gf5] })
7... Nf5 { [%txt "Le cavalier se place en f5, d'où il surveille d4 et e7."] [%eval 0.24] [%cal Gf5d4] }
(7... Nc4 { [%txt "LA VARIANTE PIÉGÉE : le cavalier saute en avant…"] [%eval 1.19] [%csl Rc4] }
  8. Qe2 { [%txt "…mais la dame l'attaque, et il n'a qu'une retraite."] [%eval 1.23] }
  8... Nb6 { [%txt "Le cavalier recule…"] [%eval 1.20] [%cal Gc4b6] }
  9. a4 { [%txt "…et le pion a va le chasser encore. À RETENIR.

PRO TIP : +1.32. Les dames sont toujours là et nos pièces reculent. Dans la Berlinoise, le cavalier va en f5 : il propose l'échange des dames et contrôle d4."] [%eval 1.32] })
8. Qxd8+ { [%txt "Les Blancs échangent les dames."] [%eval 0.25] }
8... Kxd8 { [%txt "Le roi reprend : sans dames, il est en sécurité au centre."] [%eval 0.23] [%csl Gd8] }
9. Nc3 { [%txt "Développement."] [%eval 0.22] }
9... Ke8 { [%txt "Le roi revient en e8 et libère la colonne d."] [%eval 0.20] [%csl Ge8] }
10. h3 { [%txt "Les Blancs empêchent ...Bg4 et ...Ng4."] [%eval 0.26] }
(10. Be3 { [%txt "Le fou se développe, mais il s'offre au cavalier f5 : l'évaluation passe de +0.20 à -0.75."] [%hint "le fou se met sur une case que notre cavalier f5 attaque."] [%hint "le fou e3. Après ...Nxe3 fxe3, les Blancs ont des pions doublés en e3 et e5, et nous avons la paire de fous."] [%hint "10...Nxe3 : on prend le fou, la paire de fous est à nous."] [%hintcsl Re3,Re5] [%eval -0.75] }
  10... Nxe3 { [%txt "On prend le fou."] [%eval -0.68] [%cal Gf5e3] }
  11. fxe3 { [%txt "Le pion reprend : les pions e sont doublés."] [%eval -0.71] }
  11... Bf5 { [%txt "À RETENIR.

PRO TIP : -0.66. Paire de fous contre structure abîmée. Dans la finale berlinoise, le cavalier f5 attend le fou blanc en e3 ou g3 : ne le lui offre pas."] [%eval -0.66] [%csl Re3] })
10... h5 { [%txt "On empêche g4, qui chasserait le cavalier f5."] [%eval 0.23] [%cal Gh5g4] }
11. Bf4 { [%txt "Le fou se développe."] [%eval 0.09] }
11... Be7 { [%txt "Développement : le fou couvre g5 et h4."] [%eval 0.24] [%cal Ge7g5] }
12. Rad1 { [%txt "La tour prend la colonne d."] [%eval 0.29] }
12... Be6 { [%txt "Le fou se développe et surveille c4 et a2."] [%eval 0.31] [%cal Ge6a2] }
13. Ng5 { [%txt "Le cavalier attaque le fou e6."] [%eval 0.28] }
13... Rh6 { [%txt "La tour défend e6 par la sixième rangée.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.24).
1. ...Rd8 et ...Kf8 : on conteste la colonne d et on met le roi à l'abri des échecs.
2. ...c5 et ...b6 : on règle la structure à l'aile dame, où nous avons la majorité utile.
3. ...h4 et ...Nd4 : le cavalier cherche la case d4, au centre."] [%eval 0.24] [%cal Gh6e6] } *`,
    ),
    chapter(
      "Branche B : 4.O-O Nxe4 5.Re1",
      `{ [%txt "LA VARIANTE 5.Re1.

Les Blancs refusent la finale : la tour attaque tout de suite notre cavalier e4. On recule en d6, on rend le pion e5 et on se développe vite. Après les échanges, nos fous sont très actifs et le pion d4 est souvent une cible."] [%eval 0.37] }
1. e4 { [%txt "Le centre."] [%eval 0.37] }
1... e5 { [%txt "Symétrie."] [%eval 0.39] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.38] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.40] [%cal Gc6e5] }
3. Bb5 { [%txt "L'Espagnole."] [%eval 0.28] }
3... Nf6 { [%txt "La Berlinoise."] [%eval 0.26] [%cal Gf6e4] }
4. O-O { [%txt "Roque."] [%eval 0.32] }
4... Nxe4 { [%txt "On prend le pion."] [%eval 0.34] [%cal Gf6e4] }
5. Re1 { [%txt "La tour attaque le cavalier e4."] [%eval 0.37] }
5... Nd6 { [%txt "Le cavalier recule et attaque le fou b5."] [%eval 0.37] [%cal Gd6b5] }
6. Nxe5 { [%txt "Le cavalier récupère le pion."] [%eval 0.35] }
6... Be7 { [%txt "On couvre la colonne e : le roi n'est plus exposé."] [%eval 0.38] [%cal Ge7e1] }
7. Bf1 { [%txt "Le fou recule hors de portée."] [%eval 0.39] }
(7. Qe2 { [%txt "La dame se place sur une case qu'un cavalier noir attaque : l'évaluation passe de +0.38 à -1.55."] [%hint "la dame vient en e2, où notre cavalier c6 peut l'attaquer depuis d4."] [%hint "la case d4. De là, notre cavalier attaque la dame e2 et le pion c2, et l'autre cavalier prend le fou b5."] [%hint "7...Nd4 : la dame doit partir, puis ...Nxb5."] [%hintcsl Gd4,Re2] [%eval -1.55] }
  7... Nd4 { [%txt "Le cavalier attaque la dame."] [%eval -1.28] [%cal Gd4e2] }
  8. Qd3 { [%txt "La dame recule."] [%eval -1.40] }
  8... N6xb5 { [%txt "On prend le fou."] [%eval -1.25] [%cal Gd6b5] }
  9. c3 { [%txt "Le pion attaque le cavalier d4."] [%eval -1.15] }
  9... Nxc3 { [%txt "À RETENIR.

PRO TIP : -1.08. Une pièce mineure de plus pour les Noirs. Quand la dame blanche se pose en e2 dans la Berlinoise, la case d4 est un tremplin pour notre cavalier."] [%eval -1.08] [%cal Gd4e2] })
7... Nxe5 { [%txt "On échange le cavalier central."] [%eval 0.36] [%cal Gc6e5] }
8. Rxe5 { [%txt "La tour reprend."] [%eval 0.34] }
8... O-O { [%txt "Le roi est à l'abri."] [%eval 0.34] [%csl Gg8] }
(8... Nf5 { [%txt "LA VARIANTE PIÉGÉE : le cavalier semble bien placé…"] [%eval 4.29] [%csl Rf5] }
  9. Rxf5 { [%txt "…mais la tour e5 le prend sur la cinquième rangée. À RETENIR.

PRO TIP : +4.22, une pièce de moins. Une tour en e5 contrôle toute la cinquième rangée : vérifie-la avant d'y poser une pièce."] [%eval 4.22] })
9. Nc3 { [%txt "Développement."] [%eval 0.31] }
9... Bf6 { [%txt "Le fou attaque la tour e5."] [%eval 0.36] [%cal Gf6e5] }
10. Re1 { [%txt "La tour recule."] [%eval 0.37] }
(10. d4 { [%txt "Le pion défend la tour, mais elle reste attaquée : l'évaluation passe de +0.36 à -0.87."] [%hint "les Blancs défendent leur tour avec un pion au lieu de la retirer."] [%hint "la tour e5. Notre fou f6 la prend ; même défendue, une tour vaut plus qu'un fou."] [%hint "10...Bxe5 : on gagne la qualité."] [%hintcsl Re5,Gf6] [%eval -0.87] }
  10... Bxe5 { [%txt "On prend la tour."] [%eval -0.91] [%cal Gf6e5] }
  11. dxe5 { [%txt "Le pion reprend."] [%eval -0.81] }
  11... Nf5 { [%txt "À RETENIR.

PRO TIP : -0.79, une qualité de plus. Défendre une pièce attaquée par une pièce de moindre valeur ne suffit pas : il faut la déplacer."] [%eval -0.79] [%csl Ge5] })
10... Re8 { [%txt "On conteste la colonne e."] [%eval 0.27] [%cal Ge8e1] }
11. d4 { [%txt "Les Blancs avancent au centre."] [%eval 0.21] }
11... Rxe1 { [%txt "On échange les tours."] [%eval 0.12] [%cal Ge8e1] }
12. Qxe1 { [%txt "La dame reprend."] [%eval 0.04] }
12... Bxd4 { [%txt "Le fou prend le pion d4."] [%eval 0.00] [%cal Gf6d4] }
13. Bf4 { [%txt "Les Blancs développent leur dernier fou pour récupérer du temps.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.04).
1. ...Bxc3 puis ...Ne8 ou ...Nf5 : on simplifie avec un pion de plus.
2. ...c6 et ...d5 : on ferme les diagonales des fous blancs.
3. ...Be6 et ...Qd7 : développement complet avant d'avancer les pions de l'aile dame."] [%eval 0.04] [%cal Gd4c3] }
(13. h3 { [%txt "Une imprécision plutôt qu'une faute : l'évaluation passe de 0.00 à -0.47. Un coup de pion lent alors que les Blancs ont un pion de moins ; nous en profitons pour terminer notre développement."] [%eval -0.47] }
  13... b6 { [%txt "On prépare ...Bb7."] [%eval -0.57] [%cal Gc8b7] }
  14. Bf4 { [%txt "Le fou sort."] [%eval -0.57] }
  14... Bb7 { [%txt "À RETENIR.

PRO TIP : -0.53, un pion de plus et le développement terminé. Contre un coup lent, termine ton développement avant toute autre chose."] [%eval -0.53] [%cal Gb7g2] }) *`,
    ),
    chapter(
      "Aléatoire surprise 1 : après 5.Re1, le pion de plus qui grandit",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend la variante 5.Re1 du chapitre 2 jusqu'à 13.Bf4. La théorie s'arrête là : nous avons un pion de plus, et les Blancs jouent des coups de club qui ont l'air actifs et ne le sont pas. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la pièce ou la case faible (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quelle pièce blanche est mal défendue ou mal placée ? 3. Quel coup noir l'attaque avec gain de temps ?"] [%eval 0.37] }
1. e4 { [%txt "Le centre."] [%eval 0.37] }
1... e5 { [%txt "Symétrie."] [%eval 0.39] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.38] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.40] [%cal Gc6e5] }
3. Bb5 { [%txt "L'Espagnole."] [%eval 0.28] }
3... Nf6 { [%txt "La Berlinoise."] [%eval 0.26] [%cal Gf6e4] }
4. O-O { [%txt "Roque."] [%eval 0.32] }
4... Nxe4 { [%txt "On prend le pion."] [%eval 0.34] [%cal Gf6e4] }
5. Re1 { [%txt "La tour attaque le cavalier."] [%eval 0.37] }
5... Nd6 { [%txt "Recul avec attaque du fou."] [%eval 0.37] [%cal Gd6b5] }
6. Nxe5 { [%txt "Le cavalier récupère le pion."] [%eval 0.35] }
6... Be7 { [%txt "On couvre la colonne e."] [%eval 0.38] [%cal Ge7e1] }
7. Bf1 { [%txt "Le fou recule."] [%eval 0.39] }
7... Nxe5 { [%txt "Échange."] [%eval 0.36] [%cal Gc6e5] }
8. Rxe5 { [%txt "La tour reprend."] [%eval 0.34] }
8... O-O { [%txt "Roque."] [%eval 0.34] [%csl Gg8] }
9. Nc3 { [%txt "Développement."] [%eval 0.31] }
9... Bf6 { [%txt "Le fou attaque la tour."] [%eval 0.36] [%cal Gf6e5] }
10. Re1 { [%txt "La tour recule."] [%eval 0.37] }
10... Re8 { [%txt "La colonne e."] [%eval 0.27] [%cal Ge8e1] }
11. d4 { [%txt "Le centre."] [%eval 0.21] }
11... Rxe1 { [%txt "Échange des tours."] [%eval 0.12] [%cal Ge8e1] }
12. Qxe1 { [%txt "La dame reprend."] [%eval 0.04] }
12... Bxd4 { [%txt "Le pion d4 tombe."] [%eval 0.00] [%cal Gf6d4] }
13. Bf4 { [%txt "Fin de la théorie : le fou attaque le cavalier d6."] [%eval 0.04] [%csl Rd6] }
13... Ne8 { [%txt "Le cavalier recule : il défend c7 et g7."] [%eval 0.05] [%cal Ge8c7] }
14. Nd5 { [%txt "Le cavalier se centralise et vise c7 et e7."] [%eval 0.06] }
14... d6 { [%txt "Le pion coupe la diagonale du fou f4 vers c7."] [%eval 0.02] [%csl Gd6] [%cal Rf4c7] }
15. h3 { [%txt "Un coup de pion lent, alors que le cavalier d5 n'est soutenu par rien : l'évaluation passe de +0.02 à -0.56."] [%hint "les Blancs jouent un coup d'attente au lieu d'activer leurs pièces."] [%hint "le cavalier d5. Aucune pièce blanche ne le soutient, et notre fou c8 peut l'attaquer depuis e6."] [%hint "15...Be6 : le fou attaque le cavalier d5."] [%hintcsl Rd5,Ge6] [%eval -0.56] }
15... Be6 { [%txt "Le fou attaque le cavalier d5."] [%eval -0.44] [%cal Ge6d5] }
16. Rd1 { [%txt "La tour attaque notre fou d4."] [%eval -0.44] }
16... Bb6 { [%txt "Le fou recule hors de portée."] [%eval -0.48] [%cal Gd4b6] }
(16... h6 { [%txt "LA VARIANTE PIÉGÉE : un petit coup de pion…"] [%eval 4.13] [%csl Rd4] }
  17. Rxd4 { [%txt "…mais la tour prend le fou d4, qui était attaqué. À RETENIR.

PRO TIP : +4.14, une pièce de moins. Après chaque coup adverse, demande-toi d'abord ce qu'il attaque."] [%eval 4.14] })
17. Qb4 { [%txt "La dame part à l'attaque sur une case exposée : l'évaluation passe de -0.48 à -1.00."] [%hint "la dame se place sur une case qu'un fou noir peut attaquer avec gain de temps."] [%hint "la case c5. Notre fou b6 y revient et attaque la dame b4."] [%hint "17...Bc5 : le fou chasse la dame."] [%hintcsl Gc5,Rb4] [%eval -1.00] }
17... Bc5 { [%txt "Le fou attaque la dame."] [%eval -1.18] [%cal Gc5b4] }
18. Qxb7 { [%txt "La dame prend le pion b7."] [%eval -1.11] }
18... Rb8 { [%txt "La tour chasse la dame."] [%eval -1.11] [%cal Gb8b7] }
19. Qc6 { [%txt "La dame recule."] [%eval -1.08] }
19... Bd7 { [%txt "Le fou attaque encore la dame."] [%eval -1.06] [%cal Gd7c6] }
20. Qa6 { [%txt "La dame se réfugie au bord."] [%eval -1.00] }
20... Rxb2 { [%txt "La tour récupère le pion et entre dans le camp blanc."] [%eval -0.94] [%cal Gb2c2] }
21. Ne3 { [%txt "Le cavalier quitte d5 et la dame a6 reste hors jeu : l'évaluation passe de -0.94 à -1.88."] [%hint "les Blancs reculent leur cavalier alors que leur dame est isolée en a6."] [%hint "la colonne b. Notre dame peut rejoindre la tour b2 et frapper la première rangée."] [%hint "21...Qb8 : la dame double sur la colonne b."] [%hintcsl Gb8,Ra6] [%eval -1.88] }
21... Qb8 { [%txt "À RETENIR.

PRO TIP : -1.85, avantage noir net. Dame et tour sur la colonne b, la dame blanche est hors jeu en a6. La leçon : quand la dame adverse part chercher des pions, développe-toi avec gain de temps en l'attaquant."] [%eval -1.85] [%cal Gb8b2] } *`,
    ),
    chapter(
      "Branche C : l'anti-Berlinoise 4.d3 (tes parties)",
      `{ [%txt "L'ANTI-BERLINOISE 4.d3.

C'est le coup le plus joué contre toi. Les Blancs défendent e4 et visent une partie lente, à l'italienne. Notre plan : ...Bc5, ...O-O, puis le levier ...d5 dès que possible. Avec ...d5, la dame et les pièces noires entrent en jeu et le fou b5 ne vise plus rien.

Dans tes défaites, tu as joué ...d6 et ...a6, et le fou blanc a pris en c6 au bon moment : avec ...d5, ce danger disparaît."] [%eval 0.37] }
1. e4 { [%txt "Le centre."] [%eval 0.37] }
1... e5 { [%txt "Symétrie."] [%eval 0.39] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.38] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.40] [%cal Gc6e5] }
3. Bb5 { [%txt "L'Espagnole."] [%eval 0.28] }
3... Nf6 { [%txt "La Berlinoise."] [%eval 0.26] [%cal Gf6e4] }
4. d3 { [%txt "Les Blancs défendent e4."] [%eval 0.19] }
4... Bc5 { [%txt "Le fou prend sa meilleure diagonale, contre f2."] [%eval 0.25] [%cal Gc5f2] }
5. c3 { [%txt "Les Blancs préparent d4."] [%eval 0.23] }
5... O-O { [%txt "Roque."] [%eval 0.23] [%csl Gg8] }
6. O-O { [%txt "Les Blancs roquent."] [%eval 0.24] }
6... d5 { [%txt "LE LEVIER : on libère notre jeu au centre."] [%eval 0.25] [%cal Gd5e4] }
7. exd5 { [%txt "Les Blancs prennent."] [%eval 0.21] }
(7. Re1 { [%txt "La tour soutient e4, mais f2 perd un défenseur : l'évaluation passe de +0.25 à -1.61."] [%hint "la tour quitte f1, où elle défendait f2, la case visée par notre fou c5."] [%hint "le pion e4 et la case f2. Après ...dxe4, notre cavalier f6 peut sauter en g4 contre f2."] [%hint "7...dxe4 puis ...Ng4 : le fou c5 et le cavalier visent f2."] [%hintcsl Rf2,Gg4] [%eval -1.61] }
  7... dxe4 { [%txt "On prend."] [%eval -1.67] [%cal Gd5e4] }
  8. Bxc6 { [%txt "Les Blancs échangent."] [%eval -1.44] }
  8... Ng4 { [%txt "Le cavalier vise f2 avec le fou c5."] [%eval -1.34] [%cal Gg4f2,Gc5f2] }
  9. d4 { [%txt "Le pion ferme la diagonale du fou."] [%eval -1.44] }
  9... exf3 { [%txt "À RETENIR.

PRO TIP : -1.37, une pièce de plus. Quand la tour quitte f1, f2 n'a plus que le roi pour défenseur : fou c5 plus cavalier g4, c'est la combinaison classique."] [%eval -1.37] [%csl Gf3] })
7... Qxd5 { [%txt "La dame reprend et se centralise."] [%eval 0.20] [%cal Gd5d3] }
8. Bc4 { [%txt "Le fou attaque la dame."] [%eval 0.19] }
(8. Bg5 { [%txt "Le fou cloue le cavalier, mais e4 est libre : l'évaluation passe de +0.20 à -0.78."] [%hint "les Blancs développent leur fou au lieu de chasser notre dame."] [%hint "la case e4. Notre pion e5 y avance et attaque le cavalier f3 et le pion d3."] [%hint "8...e4 : le pion avance avec gain de temps."] [%hintcsl Ge4,Rf3] [%eval -0.78] }
  8... e4 { [%txt "Le pion avance et attaque le cavalier f3."] [%eval -0.72] [%cal Ge4f3] }
  9. Bc4 { [%txt "Le fou attaque la dame."] [%eval -0.95] }
  9... Qd6 { [%txt "La dame recule en surveillant d3."] [%eval -0.88] [%cal Gd6d3] }
  10. dxe4 { [%txt "Les Blancs prennent."] [%eval -0.81] }
  10... Bxf2+ { [%txt "À RETENIR.

PRO TIP : -0.81. Le fou prend f2 avec échec et la position blanche s'ouvre. Le levier ...e4 frappe le cavalier f3 au moment où le fou blanc a quitté la défense."] [%eval -0.81] [%cal Gc5f2] })
8... Qd8 { [%txt "La dame recule à la maison, en sécurité."] [%eval 0.20] [%csl Gd8] }
(8... Bxf2+ { [%txt "LA VARIANTE PIÉGÉE : le sacrifice en f2 a l'air fort…"] [%eval 2.96] [%csl Rd5] }
  9. Rxf2 { [%txt "…mais la tour reprend, et notre dame d5 reste attaquée par le fou c4. À RETENIR.

PRO TIP : +3.13, une pièce de moins. Règle d'abord le problème de ta pièce attaquée : un échec ne compense pas une pièce perdue."] [%eval 3.13] })
9. b4 { [%txt "Les Blancs chassent le fou."] [%eval 0.18] }
9... Bd6 { [%txt "Le fou recule et soutient e5."] [%eval 0.22] [%cal Gd6e5] }
10. Re1 { [%txt "La tour vise e5."] [%eval 0.17] }
10... h6 { [%txt "On empêche Bg5."] [%eval 0.15] [%csl Gg5] }
11. Nbd2 { [%txt "Développement."] [%eval 0.14] }
11... Bf5 { [%txt "Le fou vise d3."] [%eval 0.19] [%cal Gf5d3] }
12. Ne4 { [%txt "Le cavalier se centralise."] [%eval 0.22] }
(12. d4 { [%txt "La poussée ouvre la position au mauvais moment : l'évaluation passe de +0.19 à -1.36."] [%hint "les Blancs ouvrent le centre alors que nos pièces sont mieux placées."] [%hint "le pion d4. Notre pion e5 le prend, et le pion c3 devient faible."] [%hint "12...exd4 : on prend, puis on attaque c3."] [%hintcsl Rd4,Rc3] [%eval -1.36] }
  12... exd4 { [%txt "On prend."] [%eval -1.36] [%cal Ge5d4] }
  13. b5 { [%txt "Les Blancs attaquent le cavalier."] [%eval -1.42] }
  13... dxc3 { [%txt "On prend encore."] [%eval -1.53] [%cal Gd4c3] }
  14. bxc6 { [%txt "Les Blancs prennent le cavalier."] [%eval -1.60] }
  14... cxd2 { [%txt "À RETENIR.

PRO TIP : -1.50. Les Noirs gagnent du matériel. Dans les structures de l'anti-Berlinoise, d4 ne se joue que préparé : sinon nos pièces profitent du centre ouvert."] [%eval -1.50] [%cal Gc3d2] })
12... Re8 { [%txt "La tour prend la colonne e."] [%eval 0.26] [%cal Ge8e1] }
13. h3 { [%txt "Les Blancs empêchent ...Bg4.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.21).
1. ...Be6 : on échange le fou c4, la meilleure pièce blanche.
2. ...Nxe4 puis ...Bf8 : on simplifie et le fou se replace derrière e5.
3. ...Qd7 et ...Rad8 : les tours sur les colonnes centrales, contre le pion d3."] [%eval 0.21] [%cal Gf5e6] } *`,
    ),
    chapter(
      "Aléatoire surprise 2 : après 4.d3, la dame qui s'invite",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend l'anti-Berlinoise 4.d3 du chapitre 4 jusqu'à 13.h3. La théorie s'arrête là. Les Blancs ne font pas de gaffe : ils affaiblissent leur roque et laissent notre dame entrer dans leur camp. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case d'invasion ou la ligne qui s'ouvre (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quelle case ou quelle colonne n'est plus surveillée ? 3. Quelle pièce noire peut y entrer avec échec ou avec gain de temps ?"] [%eval 0.37] }
1. e4 { [%txt "Le centre."] [%eval 0.37] }
1... e5 { [%txt "Symétrie."] [%eval 0.39] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.38] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.40] [%cal Gc6e5] }
3. Bb5 { [%txt "L'Espagnole."] [%eval 0.28] }
3... Nf6 { [%txt "La Berlinoise."] [%eval 0.26] [%cal Gf6e4] }
4. d3 { [%txt "L'anti-Berlinoise."] [%eval 0.19] }
4... Bc5 { [%txt "La diagonale contre f2."] [%eval 0.25] [%cal Gc5f2] }
5. c3 { [%txt "Préparation de d4."] [%eval 0.23] }
5... O-O { [%txt "Roque."] [%eval 0.23] [%csl Gg8] }
6. O-O { [%txt "Roque."] [%eval 0.24] }
6... d5 { [%txt "Le levier."] [%eval 0.25] [%cal Gd5e4] }
7. exd5 { [%txt "Échange."] [%eval 0.21] }
7... Qxd5 { [%txt "La dame se centralise."] [%eval 0.20] [%cal Gd5d3] }
8. Bc4 { [%txt "Le fou chasse la dame."] [%eval 0.19] }
8... Qd8 { [%txt "Retour à la maison."] [%eval 0.20] [%csl Gd8] }
9. b4 { [%txt "Le fou est chassé."] [%eval 0.18] }
9... Bd6 { [%txt "Soutien de e5."] [%eval 0.22] [%cal Gd6e5] }
10. Re1 { [%txt "La tour vise e5."] [%eval 0.17] }
10... h6 { [%txt "Pas de Bg5."] [%eval 0.15] [%csl Gg5] }
11. Nbd2 { [%txt "Développement."] [%eval 0.14] }
11... Bf5 { [%txt "Le fou vise d3."] [%eval 0.19] [%cal Gf5d3] }
12. Ne4 { [%txt "Centralisation."] [%eval 0.22] }
12... Re8 { [%txt "La colonne e."] [%eval 0.26] [%cal Ge8e1] }
13. h3 { [%txt "Fin de la théorie : pas de ...Bg4."] [%eval 0.21] }
13... Be6 { [%txt "On propose l'échange du fou c4, la meilleure pièce blanche."] [%eval 0.33] [%cal Ge6c4] }
14. g4 { [%txt "Les Blancs avancent devant leur roi : l'évaluation passe de +0.33 à -0.43."] [%hint "les Blancs poussent un pion de leur roque sans raison."] [%hint "le cavalier e4 et le fou c4. Après ...Nxe4 Rxe4 Bxc4, les deux meilleures pièces blanches disparaissent, et le roque reste troué."] [%hint "14...Nxe4 15.Rxe4 Bxc4 : on échange, puis on vise le roque affaibli."] [%hintcsl Re4,Rc4] [%eval -0.43] }
14... Nxe4 { [%txt "On échange le cavalier central."] [%eval -0.37] [%cal Gf6e4] }
15. Rxe4 { [%txt "La tour reprend."] [%eval -0.41] }
15... Bxc4 { [%txt "On échange le fou c4."] [%eval -0.44] [%cal Ge6c4] }
16. dxc4 { [%txt "Le pion reprend : les pions c sont doublés."] [%eval -0.44] }
16... Bf8 { [%txt "Le fou se replace derrière e5."] [%eval -0.46] [%cal Gf8b4] }
17. Qe2 { [%txt "La dame soutient la tour."] [%eval -0.52] }
17... f6 { [%txt "On soutient e5 : notre structure est solide."] [%eval -0.52] [%cal Gf6e5] }
18. Qe3 { [%txt "La dame quitte e2 et ne surveille plus d1 : l'évaluation passe de -0.52 à -1.42."] [%hint "la dame quitte e2, d'où elle surveillait la case d1."] [%hint "la case d1. Notre dame y entre avec échec par la colonne d ouverte."] [%hint "18...Qd1+ : la dame envahit la première rangée."] [%hintcsl Gd1] [%eval -1.42] }
18... Qd1+ { [%txt "La dame entre avec échec."] [%eval -1.35] [%cal Gd8d1] }
(18... Bxb4 { [%txt "LA VARIANTE PIÉGÉE : le pion b4 a l'air seul…"] [%eval 2.45] [%csl Rb4] }
  19. cxb4 { [%txt "…mais le pion c3 le défendait. À RETENIR.

PRO TIP : +2.53, une pièce contre un pion. Compte les défenseurs avant de prendre un pion."] [%eval 2.53] })
19. Qe1 { [%txt "La dame interpose."] [%eval -1.35] }
19... Qc2 { [%txt "La dame s'installe dans le camp blanc."] [%eval -1.19] [%cal Gc2c3] }
20. Bf4 { [%txt "Le fou se donne : l'évaluation passe de -1.19 à -1.81."] [%hint "le fou se place sur une case que notre pion e5 attaque."] [%hint "la colonne e. Après ...exf4, la tour e4 et notre tour e8 se font face, et la tour blanche n'a plus de soutien."] [%hint "20...exf4 : on prend le fou."] [%hintcsl Rf4,Re4] [%eval -1.81] }
20... exf4 { [%txt "On prend le fou."] [%eval -3.22] [%cal Ge5f4] }
21. Rxe8 { [%txt "La tour échange."] [%eval -3.31] }
21... Rxe8 { [%txt "À RETENIR.

PRO TIP : -2.94, une pièce de plus. Notre dame c2 et notre tour e8 dominent. La leçon : contre l'anti-Berlinoise, échange les meilleures pièces blanches, puis entre par la colonne d dès qu'elle se libère."] [%eval -2.94] [%cal Ge8e1] } *`,
    ),
    chapter(
      "Branche D : 4.Nc3, les Quatre Cavaliers espagnols",
      `{ [%txt "LES QUATRE CAVALIERS ESPAGNOLS : 4.Nc3.

Notre réponse : 4...Nd4, la défense Rubinstein. Le cavalier attaque le fou b5 et propose l'échange. Après 5.Nxd4 exd4 6.e5 dxc3 7.exf6 Qxf6 8.dxc3, la position est symétrique et nos pièces sortent vite. Un piège important : ne jamais prendre e4 avant d'avoir repris en d4."] [%eval 0.37] }
1. e4 { [%txt "Le centre."] [%eval 0.37] }
1... e5 { [%txt "Symétrie."] [%eval 0.39] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.38] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.40] [%cal Gc6e5] }
3. Bb5 { [%txt "L'Espagnole."] [%eval 0.28] }
3... Nf6 { [%txt "La Berlinoise."] [%eval 0.26] [%cal Gf6e4] }
4. Nc3 { [%txt "Les Blancs défendent e4 avec le cavalier."] [%eval 0.15] }
4... Nd4 { [%txt "LA RUBINSTEIN : le cavalier attaque le fou b5."] [%eval 0.20] [%cal Gd4b5] }
5. Nxd4 { [%txt "Les Blancs échangent."] [%eval 0.08] }
5... exd4 { [%txt "On reprend : le pion attaque le cavalier c3."] [%eval -0.11] [%cal Gd4c3] }
(5... Nxe4 { [%txt "LA VARIANTE PIÉGÉE : on prend e4 au lieu de reprendre…"] [%eval 3.86] [%csl Rd4] }
  6. Nxe4 { [%txt "…et le cavalier c3 reprend. À RETENIR.

PRO TIP : +3.62, une pièce de moins. Après un échange, reprends d'abord : le pion e4 était défendu par le cavalier c3."] [%eval 3.62] })
6. e5 { [%txt "Le pion attaque notre cavalier f6."] [%eval -0.14] }
(6. Ne2 { [%txt "Le cavalier recule, mais il ne défend plus e4 : l'évaluation passe de -0.11 à -0.84."] [%hint "le cavalier c3 recule en e2, sans défendre e4 ni contester le centre."] [%hint "le fou b5 et la case d5. Après ...c6, le fou doit partir, puis ...d5 prend le centre."] [%hint "6...c6 7.Bd3 d5 : on prend le centre avec gain de temps."] [%hintcsl Rb5,Gd5] [%eval -0.84] }
  6... c6 { [%txt "Le pion chasse le fou."] [%eval -0.77] [%cal Gc6b5] }
  7. Bd3 { [%txt "Le fou recule."] [%eval -0.81] }
  7... d5 { [%txt "On prend le centre."] [%eval -0.70] [%cal Gd5e4] }
  8. exd5 { [%txt "Les Blancs prennent."] [%eval -0.88] }
  8... Qxd5 { [%txt "À RETENIR.

PRO TIP : -0.78. Le centre est à nous et le fou d3 bouche le pion d. Quand le cavalier c3 recule, chasse le fou b5 et prends le centre."] [%eval -0.78] [%csl Gd5] })
6... dxc3 { [%txt "On prend le cavalier."] [%eval 0.01] [%cal Gd4c3] }
7. exf6 { [%txt "Les Blancs prennent le cavalier."] [%eval -0.06] }
7... Qxf6 { [%txt "La dame reprend et vise f2 et b2."] [%eval 0.06] [%cal Gf6f2] }
8. dxc3 { [%txt "Le pion reprend."] [%eval -0.06] }
8... Bc5 { [%txt "Le fou vise f2."] [%eval 0.08] [%cal Gc5f2] }
9. Qe2+ { [%txt "Échec."] [%eval 0.02] }
(9. Qh5 { [%txt "La dame attaque c5, mais f2 cède : l'évaluation passe de +0.08 à -1.48."] [%hint "la dame part à l'attaque et laisse f2 sans défenseur."] [%hint "le pion f2. Notre fou c5 et notre dame f6 le visent tous les deux."] [%hint "9...Bxf2+ : le fou prend avec échec."] [%hintcsl Rf2,Gc5] [%eval -1.48] }
  9... Bxf2+ { [%txt "Le fou prend f2 avec échec."] [%eval -1.40] [%cal Gc5f2] }
  10. Kd1 { [%txt "Le roi s'écarte."] [%eval -1.50] }
  10... O-O { [%txt "À RETENIR.

PRO TIP : -1.43, un pion de plus et le roi blanc au centre. Quand la dame blanche part à l'attaque, regarde ce qu'elle défendait."] [%eval -1.43] [%csl Gf2] })
9... Qe7 { [%txt "On interpose la dame."] [%eval 0.13] [%cal Ge7e2] }
10. h4 { [%txt "Les Blancs préparent la tour en h3."] [%eval -0.03] }
10... Qxe2+ { [%txt "On échange les dames."] [%eval -0.02] [%cal Ge7e2] }
11. Bxe2 { [%txt "Le fou reprend."] [%eval -0.01] }
11... d6 { [%txt "On libère le fou c8."] [%eval 0.00] [%cal Gc8f5] }
12. Bd3 { [%txt "Le fou se place."] [%eval -0.07] }
12... O-O { [%txt "Roque."] [%eval 0.04] [%csl Gg8] }
13. O-O { [%txt "Les Blancs roquent."] [%eval 0.12] }
13... Re8 { [%txt "La tour prend la colonne e.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.12).
1. ...Bd7 et ...Re5 : la tour se place sur la cinquième rangée.
2. ...a5-a4 : on gagne de l'espace à l'aile dame.
3. Une finale symétrique où le fou c5 reste notre meilleure pièce : ne l'échange pas sans raison."] [%eval 0.12] [%cal Ge8e1] } *`,
    ),
    chapter(
      "Branche E : l'échange 4.Bxc6",
      `{ [%txt "L'ÉCHANGE 4.Bxc6.

Les Blancs donnent leur fou pour abîmer nos pions. Nous avons la paire de fous et des colonnes ouvertes. Le pion e5 a besoin d'un soutien : ...Be6, ...Nd7, ...Bd6 et ...f6 le tiennent solidement. Un piège à connaître : 5.Nxe5? Qd4!, double attaque sur e5 et e4."] [%eval 0.37] }
1. e4 { [%txt "Le centre."] [%eval 0.37] }
1... e5 { [%txt "Symétrie."] [%eval 0.39] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.38] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.40] [%cal Gc6e5] }
3. Bb5 { [%txt "L'Espagnole."] [%eval 0.28] }
3... Nf6 { [%txt "La Berlinoise."] [%eval 0.26] [%cal Gf6e4] }
4. Bxc6 { [%txt "Les Blancs échangent le fou."] [%eval -0.08] }
4... dxc6 { [%txt "On reprend vers le centre : les diagonales des deux fous s'ouvrent."] [%eval -0.19] [%cal Gc8g4] }
5. Nc3 { [%txt "Développement."] [%eval -0.18] }
(5. Nxe5 { [%txt "Le cavalier prend le pion, mais la dame noire frappe deux fois : l'évaluation passe de -0.19 à -0.79."] [%hint "les Blancs prennent e5 alors que notre dame peut attaquer le cavalier et le pion e4 en même temps."] [%hint "la case d4. De là, notre dame attaque le cavalier e5 et le pion e4."] [%hint "5...Qd4 : double attaque."] [%hintcsl Gd4,Re5,Re4] [%eval -0.79] }
  5... Qd4 { [%txt "Double attaque sur e5 et e4."] [%eval -0.70] [%cal Gd4e5,Gd4e4] }
  6. Nf3 { [%txt "Le cavalier recule."] [%eval -0.64] }
  6... Qxe4+ { [%txt "La dame reprend le pion avec échec."] [%eval -0.70] [%cal Gd4e4] }
  7. Qe2 { [%txt "Les Blancs interposent la dame."] [%eval -0.74] }
  7... Qxe2+ { [%txt "À RETENIR.

PRO TIP : -0.71. Le pion est récupéré et nous gardons la paire de fous. Retiens la double attaque ...Qd4 : c'est la réponse à toute prise en e5 après l'échange en c6."] [%eval -0.71] [%cal Gd4e5] })
5... Be6 { [%txt "Le fou se développe et prépare ...Nd7."] [%eval -0.21] [%cal Ge6a2] }
6. Qe2 { [%txt "La dame soutient e4."] [%eval -0.13] }
6... Nd7 { [%txt "Le cavalier soutient e5."] [%eval -0.10] [%cal Gd7e5] }
7. d4 { [%txt "Les Blancs attaquent e5."] [%eval -0.08] }
7... Bd6 { [%txt "Le fou soutient e5."] [%eval -0.10] [%cal Gd6e5] }
8. Be3 { [%txt "Développement."] [%eval 0.00] }
8... f6 { [%txt "Le pion soutient e5 pour de bon."] [%eval 0.04] [%cal Gf6e5] }
9. d5 { [%txt "Le pion attaque le fou e6."] [%eval -0.10] }
9... cxd5 { [%txt "On prend : le pion c6 disparaît, nos pions sont réparés."] [%eval -0.28] [%cal Gc6d5] }
(9... Qe7 { [%txt "LA VARIANTE PIÉGÉE : on ignore la menace…"] [%eval 3.92] [%csl Re6] }
  10. dxe6 { [%txt "…et le pion prend le fou e6. À RETENIR.

PRO TIP : +3.91, une pièce de moins. Quand un pion attaque une pièce, réponds d'abord à la menace."] [%eval 3.91] })
10. exd5 { [%txt "Le pion reprend."] [%eval -0.28] }
(10. Nxd5 { [%txt "Une imprécision plutôt qu'une faute : l'évaluation passe de -0.28 à -0.72. Le cavalier reprend, mais il pourra être échangé contre notre fou, et nous roquons tout de suite."] [%eval -0.72] }
  10... O-O { [%txt "Roque."] [%eval -0.72] [%csl Gg8] }
  11. Nc3 { [%txt "Le cavalier recule."] [%eval -0.77] }
  11... Nb6 { [%txt "À RETENIR.

PRO TIP : -0.86. La paire de fous et des pions sains : nous sommes mieux. Quand ta structure est réparée, mets le roi à l'abri et place tes cavaliers."] [%eval -0.86] [%cal Gb6c4] })
10... Bf7 { [%txt "Le fou recule et surveille d5."] [%eval 0.08] [%cal Gf7d5] }
11. O-O-O { [%txt "Les Blancs roquent du grand côté."] [%eval 0.09] }
(11. O-O { [%txt "Le petit roque laisse le cavalier f3 cloué : l'évaluation passe de +0.08 à -0.91."] [%hint "le roi blanc roque du côté où notre fou f7 peut clouer le cavalier f3."] [%hint "le cavalier f3. De h5, notre fou le clouerait contre la dame e2."] [%hint "11...Bh5 : le clouage."] [%hintcsl Rf3,Gh5] [%eval -0.91] }
  11... Bh5 { [%txt "Le fou cloue le cavalier contre la dame."] [%eval -0.80] [%cal Gh5e2] }
  12. h3 { [%txt "Le pion attaque le fou."] [%eval -1.00] }
  12... f5 { [%txt "À RETENIR.

PRO TIP : -1.15. Le clouage dure et ...e4 menace. La diagonale h5-e2 est souvent mortelle quand la dame blanche est en e2."] [%eval -1.15] [%cal Gh5f3] })
11... O-O { [%txt "Roque."] [%eval 0.03] [%csl Gg8] }
12. Nh4 { [%txt "Le cavalier vise f5.

À RETENIR.

PRO TIP : la feuille de route après la théorie (-0.04).
1. ...Nb6 : le cavalier attaque d5.
2. ...Qe8 puis ...Qa4 : la dame vise le roi c1.
3. ...a5-a4 et ...b5 : l'attaque de pions contre le grand roque."] [%eval -0.04] [%cal Gd7b6] } *`,
    ),
    chapter(
      "Anti-panique : 4.Qe2 et 4.d4",
      `{ [%txt "ANTI-PANIQUE : 4.Qe2 ET 4.d4.

Deux coups moins fréquents. Contre 4.Qe2, on développe ...Bc5 et ...O-O : la dame e2 est une cible pour ...Nd4. Contre 4.d4, on prend en d4, puis ...a6 et ...Be7 : une position simple et équilibrée. La ligne principale traite 4.Qe2 ; une variante traite 4.d4."] [%eval 0.37] }
1. e4 { [%txt "Le centre."] [%eval 0.37] }
1... e5 { [%txt "Symétrie."] [%eval 0.39] [%csl Ge5] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.38] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.40] [%cal Gc6e5] }
3. Bb5 { [%txt "L'Espagnole."] [%eval 0.28] }
3... Nf6 { [%txt "La Berlinoise."] [%eval 0.26] [%cal Gf6e4] }
4. Qe2 { [%txt "La dame défend e4."] [%eval -0.18] }
(4. d4 { [%txt "Les Blancs ouvrent le centre."] [%eval -0.13] }
  4... exd4 { [%txt "On prend."] [%eval -0.15] [%cal Ge5d4] }
  5. O-O { [%txt "Les Blancs roquent."] [%eval -0.15] }
  5... a6 { [%txt "On chasse le fou."] [%eval -0.17] [%cal Ga6b5] }
  6. Ba4 { [%txt "Le fou recule."] [%eval -0.16] }
  6... Be7 { [%txt "À RETENIR.

PRO TIP : -0.11, l'équilibre. Puis ...O-O et ...d5 si e5 vient : une position simple."] [%eval -0.11] [%cal Ge8g8] })
4... Bc5 { [%txt "Le fou prend sa meilleure diagonale."] [%eval -0.05] [%cal Gc5f2] }
5. O-O { [%txt "Les Blancs roquent."] [%eval -0.11] }
5... O-O { [%txt "Roque."] [%eval -0.15] [%csl Gg8] }
6. Bxc6 { [%txt "Les Blancs échangent."] [%eval -0.13] }
(6. Nc3 { [%txt "Développement, mais la dame e2 reste exposée : l'évaluation passe de -0.15 à -0.75."] [%hint "les Blancs développent un cavalier sans régler la position de leur dame."] [%hint "la case d4. Notre cavalier y attaque la dame e2 et le pion c2."] [%hint "6...Nd4 : le cavalier attaque la dame."] [%hintcsl Gd4,Re2] [%eval -0.75] }
  6... Nd4 { [%txt "Le cavalier attaque la dame."] [%eval -0.78] [%cal Gd4e2] }
  7. Nxd4 { [%txt "Les Blancs échangent."] [%eval -0.71] }
  7... exd4 { [%txt "On reprend : le pion attaque le cavalier c3."] [%eval -0.86] [%cal Gd4c3] }
  8. Nd5 { [%txt "Le cavalier se centralise."] [%eval -0.80] }
  8... Re8 { [%txt "À RETENIR.

PRO TIP : -0.67. La tour attaque e4 et notre pion d4 gêne les Blancs. Contre 4.Qe2, la case d4 est notre tremplin."] [%eval -0.67] [%cal Ge8e4] })
6... dxc6 { [%txt "On reprend vers le centre."] [%eval -0.11] [%cal Gc8g4] }
7. a4 { [%txt "Les Blancs gagnent de l'espace."] [%eval -0.10] }
(7. b4 { [%txt "Le pion b s'offre : l'évaluation passe de -0.11 à -1.20."] [%hint "les Blancs avancent un pion que notre fou peut prendre."] [%hint "le pion b4. Notre fou c5 le prend, et aucun pion blanc ne le défend."] [%hint "7...Bxb4 : on prend le pion."] [%hintcsl Rb4,Gc5] [%eval -1.20] }
  7... Bxb4 { [%txt "On prend le pion."] [%eval -0.91] [%cal Gc5b4] }
  8. Bb2 { [%txt "Le fou se développe."] [%eval -1.21] }
  8... Bg4 { [%txt "À RETENIR.

PRO TIP : -1.25, un pion de plus. Le fou cloue le cavalier f3. Ne laisse jamais passer un pion offert sans compter : ici, aucune compensation."] [%eval -1.25] [%cal Gg4f3] })
7... a5 { [%txt "On bloque l'aile dame."] [%eval -0.12] [%cal Ga5a4] }
(7... Nxe4 { [%txt "LA VARIANTE PIÉGÉE : le pion e4 a l'air seul…"] [%eval 3.48] [%csl Re4] }
  8. Qxe4 { [%txt "…mais la dame e2 le défendait. À RETENIR.

PRO TIP : +3.45, une pièce de moins. Contre 4.Qe2, le pion e4 est défendu par la dame : compte les défenseurs avant de prendre."] [%eval 3.45] })
8. Na3 { [%txt "Le cavalier vise c4."] [%eval -0.08] }
8... Nd7 { [%txt "Le cavalier soutient e5 et vise c5."] [%eval -0.05] [%cal Gd7c5] }
9. d3 { [%txt "Les Blancs soutiennent e4."] [%eval 0.02] }
9... b6 { [%txt "On soutient c5 et a5."] [%eval 0.14] [%cal Gb6c5] }
10. Nc4 { [%txt "Le cavalier se place.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.15).
1. ...Re8 et ...Nf8-g6 : le cavalier rejoint l'aile roi.
2. ...f6 : on tient e5 solidement.
3. ...Ba6 : la paire de fous vise le roi blanc."] [%eval 0.15] [%cal Gd7f8] } *`,
    ),
  ],
};
