import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours d'ouverture « Partie du Fou et Partie du Centre (avec les Noirs) » —
 * onglet Ouvertures, format « un commentaire par coup » de l'Académie, lu par
 * `CourseTreeViewer` (route `/ouvertures/bishops-center-black/cours`). Public
 * visé : 1500-1800 Elo, répertoire 1...e5 contre 1.e4 2.Bc4 et 2.d4 (fiche
 * curatée `bishops-center-black`, C23-C24 et C21-C22). Ligne caractéristique
 * 1.e4 e5 2.Bc4 : les chapitres de la Partie du Centre et l'anti-panique
 * portent un renvoi 2.Bc4 en variante, pour que chaque chapitre contienne
 * cette ligne.
 *
 * ## Contenu (v2 du 2026-11-03, format Ruy Lopez v2, côté Noirs)
 *
 * 1. Fiche d'identité, tronc commun : 2.Bc4 Nf6 3.d3 c6 4.Nf3 d5.
 * 2. Aléatoire surprise 1 : après la Partie du Fou, le roque blanc abîmé.
 * 3. Branche B : le gambit Urusov, 3.d4 exd4 4.Nf3 Nxe4.
 * 4. Branche C : 3.Nf3 Nxe4 4.Nc3, le gambit Boden-Kieseritzky.
 * 5. Branche D : la Partie du Centre, 2.d4 exd4 3.Qxd4.
 * 6. Aléatoire surprise 2 : après la Partie du Centre, le cavalier qui entre en b4.
 * 7. Branche E : le gambit danois, 3.c3 d5.
 * 8. Anti-panique : 2.Qh5, 2.Qf3 et le mat du berger.
 *
 * Choix des chapitres (2026-11-03) : la théorie principale contre 2.Bc4
 * (3.d3, 3.d4, 3.Nf3) et contre 2.d4 (3.Qxd4, 3.c3), plus les sorties de
 * dame 2.Qh5 et 2.Qf3. Parties de l'utilisateur (copie de la base) : 2.Bc4
 * cinq fois (2...Nf6 trois fois, 2...Nc6 deux fois), 2.Qf3 deux fois, 2.d4
 * une fois. Aucun autre cours côté Noirs ne traite ces débuts ; 2.Bc4 Nf6
 * 3.Nc3 renvoie à la Viennoise (`kings-gambit-vienna-black`), 2.d4 exd4
 * 3.Nf3 à l'Écossaise (`scotch-four-knights-black`), 2.Bc4 Nf6 3.Nf3 Nc6
 * aux Deux Cavaliers (`italian-game-black`). Décision moteur : contre
 * l'Urusov, 4...Nxe4 plutôt que 4...d5, qui cède 0.5 à profondeur 16. Les
 * branches théoriques s'arrêtent au plus tard au demi-coup 27 ; les
 * chapitres « Aléatoire surprise » prolongent avec les Blancs comme camp
 * « mou » (`_tmp-drift-w.mts`).
 *
 * Convention côté Noirs (comme `op-berlin-black.ts`) : l'élève joue les
 * Noirs ; les fautes sont des coups BLANCS qui portent les 3 indices
 * `[%hint]` + `[%hintcsl]`, le coup noir suivant est la punition. Les
 * « variantes piégées » sont des coups noirs tentants mais mauvais (4...Bc5,
 * 9...O-O contre le fou g5, 5...d5 dans le Boden, 7...Qe7, 6...Qe6+, et
 * 3...Nf6 qui perd sur le mat du berger). Une faute qui perd moins de 0.5
 * devient une « imprécision » sans indices (6.Be3 au chapitre 4, 16.a4 à la
 * surprise 2, 6.c3 au chapitre 8).
 *
 * Sources : théorie établie de la Partie du Fou, de la Partie du Centre et du
 * gambit danois, TOUTES les lignes arbitrées par Stockfish 19 natif
 * (profondeur 16, MultiPV 1) ; 7.b4 dans le Boden-Kieseritzky et 10.Bd3 dans
 * la Partie du Centre sont des choix du moteur. Toute la prose est originale.
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
 * `scripts/opening-course-src/bishops-center-black.pgn` (et l'en-tête
 * `bishops-center-black.header.txt`) ; regénérer avec
 * `node --import tsx scripts/_tmp-build-opening-course.mts <source> <en-tête> <sortie> 16`
 * (Stockfish natif, voir `scripts/_tmp-sf-native.mts` ; sous Linux,
 * `SF_BIN=<chemin du binaire>`). Les `[%eval]` viennent du moteur, pas de la
 * main. Étape standard : `scripts/_tmp-check-cited-evals.mts op-bishops-center-black`
 * doit sortir 0 écart (un chiffre n'est cité dans un commentaire que s'il est
 * l'éval d'un nœud). Règles de l'utilisateur : SAN en texte brut uniquement
 * (jamais de figurine Unicode), pas de guillemet droit dans un `[%txt]`.
 */

function chapter(title: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, START) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const OP_BISHOPS_CENTER_BLACK: CourseTree = {
  chapters: [
    chapter(
      "Fiche d'identité, tronc commun : la Partie du Fou 2.Bc4 Nf6 3.d3 c6",
      `{ [%txt "LA PARTIE DU FOU ET LA PARTIE DU CENTRE, AVEC LES NOIRS.

Le vrai enjeu : avec 2.Bc4, les Blancs visent f7 et gardent le choix entre d3, d4, Nc3 ou f4. Avec 2.d4, ils ouvrent le centre tout de suite et sortent la dame. Notre réponse tient en deux idées : contre le fou, ...Nf6 puis ...c6 et ...d5, qui chassent le fou c4 ; contre la dame sortie trop tôt, le développement avec gain de temps (...Nc6, ...Nf6, ...Bb4).

Le déséquilibre recherché : un centre e5-d5 contre un fou blanc qui recule, ou une avance de développement contre une dame blanche promenée.

Pourquoi ces chapitres : le choix suit la théorie principale contre 2.Bc4 (3.d3 ici, 3.d4 au chapitre 3, 3.Nf3 au chapitre 4) et contre 2.d4 (3.Qxd4 au chapitre 5, le gambit danois 3.c3 au chapitre 7), plus 2.Qh5 et 2.Qf3 au chapitre 8. Dans tes parties, les Blancs ont joué 2.Bc4 cinq fois (tu as répondu 2...Nf6 trois fois, 2...Nc6 deux fois) et 2.Qf3 deux fois. Aucun autre cours de Noirs ne traite ces débuts ; 2.Bc4 Nf6 3.Nc3 mène à la Viennoise (cours kings-gambit-vienna-black, chapitre 7).

Les structures types :
- Partie du Fou : pions noirs c6-d5-e5 contre d3-e4, le fou blanc en b3.
- Partie du Centre : colonne d ouverte, dame blanche en e3, grands roques opposés.
- Gambit danois : on rend le pion par ...d5 et on échange les dames.

Règle d'or : contre un fou en c4, la poussée ...d5 est ton meilleur coup dès qu'elle est préparée."] [%eval 0.39] }
1. e4 { [%txt "Les Blancs occupent le centre."] [%eval 0.26] }
1... e5 { [%txt "On répond symétriquement."] [%eval 0.36] [%csl Ge5] }
2. Bc4 { [%txt "LA PARTIE DU FOU : le fou vise f7 et garde toutes les options. (2.d4 : chapitres 5 à 7 ; 2.Qh5 et 2.Qf3 : chapitre 8.)"] [%eval 0.03] [%cal Gc4f7] }
2... Nf6 { [%txt "Le cavalier attaque e4 et couvre d5."] [%eval -0.05] [%cal Gf6e4] }
3. d3 { [%txt "Les Blancs soutiennent e4. (3.d4 : chapitre 3 ; 3.Nf3 : chapitre 4 ; 3.Nc3 : la Viennoise.)"] [%eval 0.02] }
3... c6 { [%txt "On prépare ...d5, qui chassera le fou c4."] [%eval 0.03] [%cal Gc6d5] }
4. Nf3 { [%txt "Développement : le cavalier attaque e5."] [%eval -0.04] }
4... d5 { [%txt "Le centre : le fou c4 est attaqué."] [%eval 0.00] [%cal Gd5c4] }
(4... Bc5 { [%txt "LA VARIANTE PIÉGÉE : le fou sort sur sa belle diagonale…"] [%eval 1.03] [%csl Re5] }
  5. Nxe5 { [%txt "…mais le pion e5 n'est plus défendu, et le cavalier le prend en visant f7. À RETENIR.

PRO TIP : +1.19. Avec ...c6 au lieu de ...Nc6, le pion e5 n'a pas de défenseur : prépare ...d5 tout de suite, ou défends e5 avant de sortir le fou f8."] [%eval 1.19] [%csl Re5,Rf7] })
5. Bb3 { [%txt "Le fou recule et garde la diagonale de f7."] [%eval 0.03] }
5... Bd6 { [%txt "Le fou défend e5 et prépare le roque."] [%eval 0.12] [%cal Gd6e5] }
6. Nc3 { [%txt "Le cavalier attaque d5."] [%eval 0.10] }
6... O-O { [%txt "On roque."] [%eval 0.20] [%csl Gg8] }
7. O-O { [%txt "Les Blancs roquent."] [%eval 0.22] }
(7. Qe2 { [%txt "La dame se développe, mais elle laisse ...d4 gagner de l'espace avec gain de temps : l'évaluation passe de +0.20 à -0.77."] [%hint "les Blancs développent la dame alors que le cavalier c3 peut être chassé."] [%hint "la case d4. Notre pion d5 y avance et chasse le cavalier c3."] [%hint "7...d4 : le pion chasse le cavalier."] [%hintcsl Gd4,Rc3] [%eval -0.77] }
  7... d4 { [%txt "Le pion chasse le cavalier."] [%eval -0.63] [%cal Gd4c3] }
  8. Nb1 { [%txt "Le cavalier recule."] [%eval -0.66] }
  8... a5 { [%txt "Le pion a menace ...a4, qui chassera le fou b3."] [%eval -0.85] [%cal Ga5a4] }
  9. a4 { [%txt "Les Blancs bloquent."] [%eval -0.73] }
  9... Na6 { [%txt "À RETENIR.

PRO TIP : -0.87. Le cavalier vise b4 et c5, les Blancs n'ont plus de bon plan. Contre un cavalier c3 non soutenu, ...d4 gagne l'espace avec gain de temps."] [%eval -0.87] [%cal Ga6c5] })
(7. Ng5 { [%txt "Le cavalier attaque f7, mais il est seul : l'évaluation passe de +0.20 à -1.01."] [%hint "les Blancs attaquent f7 avec une seule pièce et sans roque."] [%hint "la case h6. Notre pion h y chasse le cavalier g5."] [%hint "7...h6 : le cavalier doit reculer."] [%hintcsl Gh6,Rg5] [%eval -1.01] }
  7... h6 { [%txt "Le pion chasse le cavalier."] [%eval -1.09] [%cal Gh6g5] }
  8. Nf3 { [%txt "Le cavalier revient : deux temps perdus."] [%eval -1.02] }
  8... a5 { [%txt "À RETENIR.

PRO TIP : -0.99. Deux temps gagnés, et ...a4 va chasser le fou b3. Contre un cavalier seul en g5, ...h6 suffit : f7 est défendu par la tour f8."] [%eval -0.99] [%cal Ga5a4] })
7... dxe4 { [%txt "On échange au centre."] [%eval 0.11] }
8. Nxe4 { [%txt "Le cavalier reprend."] [%eval 0.02] }
8... Nxe4 { [%txt "On échange les cavaliers."] [%eval 0.00] }
9. dxe4 { [%txt "Le pion reprend : la colonne d est ouverte."] [%eval 0.02] }
9... Na6 { [%txt "Le cavalier vise c5 et le fou b3."] [%eval 0.02] [%cal Ga6c5] }
10. Be3 { [%txt "Le fou se développe et contrôle c5."] [%eval 0.00] }
(10. c4 { [%txt "Le pion prend l'espace, mais il laisse la case d4 et le fou b3 enfermé : l'évaluation passe de +0.02 à -0.78."] [%hint "les Blancs poussent un pion qui affaiblit d4 et ferme leur propre fou b3."] [%hint "la case c5. Notre cavalier a6 y saute et vise d3 et e4."] [%hint "10...Nc5 : le cavalier s'installe."] [%hintcsl Gc5,Rd4] [%eval -0.78] }
  10... Nc5 { [%txt "Le cavalier s'installe en c5."] [%eval -0.75] [%cal Gc5d3] }
  11. h3 { [%txt "Les Blancs empêchent ...Bg4."] [%eval -0.85] }
  11... Qe7 { [%txt "La dame se développe."] [%eval -0.81] }
  12. Be3 { [%txt "Le fou attaque le cavalier c5."] [%eval -0.92] }
  12... Ne6 { [%txt "À RETENIR.

PRO TIP : -0.85. Le cavalier se replie en e6, d'où il vise d4 et f4 : les cases affaiblies par c4. Un pion qui avance doit garder ses cases ; ici d4 est à nous."] [%eval -0.85] [%cal Ge6d4] })
10... Qe7 { [%txt "La dame se développe et relie les tours."] [%eval 0.04] }
11. Qd2 { [%txt "La dame se développe."] [%eval 0.02] }
11... Bg4 { [%txt "Le fou se développe et cloue le cavalier f3.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.01).
1. ...Rad8 : la colonne d ouverte.
2. ...Nc5 : on échange le fou b3 ou on prend la case d3.
3. ...Bc7 et ...Bb6 : le fou d6 change de diagonale vers f2."] [%eval 0.01] [%cal Gg4f3] } *`,
    ),
    chapter(
      "Aléatoire surprise 1 : après la Partie du Fou, le roque blanc abîmé",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le chapitre 1 jusqu'à 11...Bg4. La théorie s'arrête là. Les Blancs ne font pas de gaffe : ils jouent des coups qui semblent naturels mais laissent leur roque s'abîmer. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case clé (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quel pion blanc n'est plus défendu ? 3. Quelle pièce noire peut l'attaquer ?"] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] }
2. Bc4 { [%txt "La Partie du Fou."] [%eval 0.03] }
2... Nf6 { [%txt "Contre e4."] [%eval -0.05] }
3. d3 { [%txt "Soutien."] [%eval 0.02] }
3... c6 { [%txt "Prépare ...d5."] [%eval 0.03] }
4. Nf3 { [%txt "Contre e5."] [%eval -0.04] }
4... d5 { [%txt "Le centre."] [%eval 0.00] }
5. Bb3 { [%txt "Recul."] [%eval 0.03] }
5... Bd6 { [%txt "Soutien de e5."] [%eval 0.12] }
6. Nc3 { [%txt "Contre d5."] [%eval 0.10] }
6... O-O { [%txt "Roque."] [%eval 0.20] }
7. O-O { [%txt "Roque."] [%eval 0.22] }
7... dxe4 { [%txt "Échange."] [%eval 0.11] }
8. Nxe4 { [%txt "Reprise."] [%eval 0.02] }
8... Nxe4 { [%txt "Échange."] [%eval 0.00] }
9. dxe4 { [%txt "Reprise."] [%eval 0.02] }
9... Na6 { [%txt "Vers c5."] [%eval 0.02] }
10. Be3 { [%txt "Contre c5."] [%eval 0.00] }
10... Qe7 { [%txt "Développement."] [%eval 0.04] }
11. Qd2 { [%txt "Développement."] [%eval 0.02] }
11... Bg4 { [%txt "Fin de la théorie."] [%eval 0.01] }
12. h4 { [%txt "Le pion h avance et affaiblit le roque, avec le cavalier f3 toujours cloué : l'évaluation passe de +0.01 à -0.59."] [%hint "les Blancs poussent un pion devant leur roi au lieu de régler le clouage du cavalier f3."] [%hint "le cavalier f3. Notre fou g4 le prend, et le roque blanc est abîmé."] [%hint "12...Bxf3 : on double les pions f."] [%hintcsl Rf3,Gg4] [%eval -0.59] }
12... Bxf3 { [%txt "On prend le cavalier."] [%eval -0.60] }
13. gxf3 { [%txt "Le pion reprend : pions f doublés."] [%eval -0.79] }
13... Qf6 { [%txt "La dame vise f3 et h4."] [%eval -0.84] [%cal Gf6f3,Gf6h4] }
14. Rfe1 { [%txt "La tour quitte f1 et laisse le pion h4 sans défense : l'évaluation passe de -0.84 à -1.75."] [%hint "les Blancs jouent un coup de tour qui ne défend ni f3 ni h4."] [%hint "la case b4. Notre fou d6 y vient, attaque la tour e1 et libère la diagonale vers h4."] [%hint "14...Bb4 : gain de temps sur la tour."] [%hintcsl Gb4,Re1] [%eval -1.75] }
14... Bb4 { [%txt "Le fou attaque la tour."] [%eval -1.58] [%cal Gb4e1] }
15. c3 { [%txt "Le pion chasse le fou."] [%eval -1.53] }
15... Bc5 { [%txt "Le fou propose l'échange du fou e3, défenseur du roi."] [%eval -1.49] }
16. Bc4 { [%txt "Le fou se développe, mais il laisse e3 et h4 sans défense : l'évaluation passe de -1.49 à -2.31."] [%hint "les Blancs développent le fou au lieu de défendre le pion h4."] [%hint "la case d8. Notre tour y prend la colonne d avec gain de temps sur la dame d2."] [%hint "16...Rad8 : la tour attaque la dame, puis ...Qxh4."] [%hintcsl Gd8,Rh4] [%eval -2.31] }
16... Rad8 { [%txt "La tour attaque la dame."] [%eval -2.31] [%cal Gd8d2] }
17. Qe2 { [%txt "La dame recule."] [%eval -2.22] }
17... Qxh4 { [%txt "On prend le pion h4 : le roi blanc est nu."] [%eval -2.22] }
18. Rad1 { [%txt "La tour conteste la colonne d."] [%eval -2.34] }
18... b5 { [%txt "Le pion chasse le fou c4."] [%eval -2.41] }
19. Bb3 { [%txt "Le fou recule."] [%eval -2.40] }
19... Bxe3 { [%txt "À RETENIR.

PRO TIP : -2.54. Le fou e3, dernier défenseur du roi, disparaît, et la dame h4 domine. Quand le cavalier f3 est cloué, chaque coup blanc qui ne le décloue pas permet ...Bxf3 et des pions f doublés."] [%eval -2.54] [%cal Gh4f2] } *`,
    ),
    chapter(
      "Branche B : le gambit Urusov, 3.d4 exd4 4.Nf3 Nxe4",
      `{ [%txt "LE GAMBIT URUSOV (3.d4).

Les Blancs ouvrent le centre et offrent un pion. On prend en d4, puis on prend aussi e4 : après 5.Qxd4 Nf6, nous avons rendu un pion mais nos pièces sont saines, et la dame blanche sortie tôt sera une cible. Le moteur préfère nettement 4...Nxe4 à 4...d5.

Points clés : le roi noir reste au centre un moment ; on finit le développement par ...Be7, ...c6, ...d5 et ...Be6. Contre le grand roque blanc, ne roque pas trop tôt du petit côté : la colonne h et le fou g5 sont dangereux."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] }
2. Bc4 { [%txt "La Partie du Fou."] [%eval 0.03] }
2... Nf6 { [%txt "Contre e4."] [%eval -0.05] }
3. d4 { [%txt "LE GAMBIT URUSOV : les Blancs ouvrent le centre."] [%eval -0.19] }
3... exd4 { [%txt "On prend."] [%eval -0.10] }
4. Nf3 { [%txt "Les Blancs ne reprennent pas : ils se développent."] [%eval -0.23] }
4... Nxe4 { [%txt "On prend aussi e4 : le cavalier est central."] [%eval -0.07] [%cal Gf6e4] }
5. Qxd4 { [%txt "La dame reprend d4 et attaque le cavalier e4."] [%eval -0.03] }
5... Nf6 { [%txt "Le cavalier revient en f6, d'où il couvre h7 et d5."] [%eval -0.19] }
6. Nc3 { [%txt "Développement."] [%eval -0.13] }
(6. O-O { [%txt "Les Blancs roquent, mais ...d5 arrive avec gain de temps sur le fou : l'évaluation passe de -0.19 à -1.09."] [%hint "les Blancs roquent pendant que leur fou c4 et leur dame d4 sont exposés."] [%hint "la case d5. Notre pion y avance et attaque le fou c4, en ouvrant le fou c8."] [%hint "6...d5 : le centre avec gain de temps."] [%hintcsl Gd5,Rc4] [%eval -1.09] }
  6... d5 { [%txt "Le pion attaque le fou c4."] [%eval -1.16] [%cal Gd5c4] }
  7. Re1+ { [%txt "Échec."] [%eval -0.88] }
  7... Be7 { [%txt "Le fou s'interpose."] [%eval -0.82] }
  8. Bd3 { [%txt "Le fou recule."] [%eval -0.90] }
  8... O-O { [%txt "À RETENIR.

PRO TIP : -0.48. Le centre d5 est à nous et notre roque est fait. Contre un roque blanc précoce dans l'Urusov, ...d5 règle tout."] [%eval -0.48] [%csl Gd5] })
6... Be7 { [%txt "Le fou se développe."] [%eval -0.16] }
7. Bg5 { [%txt "Le fou cloue le cavalier f6."] [%eval -0.14] }
7... h6 { [%txt "On demande au fou ce qu'il veut faire."] [%eval 0.00] [%cal Gh6g5] }
8. Qh4 { [%txt "La dame soutient le fou g5."] [%eval -0.15] }
8... c6 { [%txt "On prépare ...d5."] [%eval -0.13] [%cal Gc6d5] }
9. O-O-O { [%txt "Le grand roque : la colonne d vise d7."] [%eval -0.24] }
(9. O-O { [%txt "Les Blancs roquent du petit côté, sans pression sur d5 : l'évaluation passe de -0.13 à -1.29."] [%hint "les Blancs roquent du côté où la colonne d ne joue pas, et ...d5 devient facile."] [%hint "la case d5. Notre pion y avance et chasse le fou c4."] [%hint "9...d5 : le centre, puis ...Nbd7."] [%hintcsl Gd5,Rc4] [%eval -1.29] }
  9... d5 { [%txt "Le pion attaque le fou."] [%eval -1.26] }
  10. Bd3 { [%txt "Le fou recule."] [%eval -1.14] }
  10... Nbd7 { [%txt "À RETENIR.

PRO TIP : -1.14. Toutes nos pièces sortent, le pion de plus du gambit est à nous. Sans la colonne d, l'attaque blanche n'a pas de cible."] [%eval -1.14] [%cal Gd7f8] })
9... d5 { [%txt "Le pion attaque le fou c4."] [%eval -0.22] [%cal Gd5c4] }
(9... O-O { [%txt "LA VARIANTE PIÉGÉE : on roque, la routine…"] [%eval 1.38] [%csl Rh6] }
  10. Rhe1 { [%txt "…les Blancs menacent la tour et le fou e7…"] [%eval 1.70] }
  10... hxg5 { [%txt "…on prend le fou…"] [%eval 1.47] }
  11. Nxg5 { [%txt "…et le cavalier ouvre la colonne h vers notre roi : la dame h4 attaque déjà h7. À RETENIR.

PRO TIP : +1.44. Contre le fou g5 et la dame h4, le pion h6 est une cible : ne roque pas tant que la colonne h peut s'ouvrir."] [%eval 1.44] [%csl Rh7] })
10. Rhe1 { [%txt "La tour prend la colonne e."] [%eval -0.22] }
10... Be6 { [%txt "Le fou se développe et défend e7 par la colonne e.

À RETENIR.

PRO TIP : la feuille de route après la théorie (-0.21).
1. ...Nbd7 et ...Kf8 : le roi se met à l'abri à la main, sans ouvrir la colonne h.
2. ...dxc4 si le fou c4 reste en place : une pièce contre deux pions.
3. ...Qa5 : la dame vise a2 et le roi c1."] [%eval -0.21] [%cal Ge6c4] } *`,
    ),
    chapter(
      "Branche C : 3.Nf3 Nxe4 4.Nc3, le gambit Boden-Kieseritzky",
      `{ [%txt "LE GAMBIT BODEN-KIESERITZKY (3.Nf3 Nxe4 4.Nc3).

Les Blancs offrent le pion e4 contre le développement. On prend, on échange en c3, et on tient e5 par ...f6. Les Blancs ont l'avance de développement, nous avons un pion de plus et une structure solide.

Points clés : après 5.dxc3 f6, le roi noir reste un peu au centre, mais f7 est bien défendu ; ne joue jamais ...d5 trop tôt quand le fou c4 vise la diagonale."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] }
2. Bc4 { [%txt "La Partie du Fou."] [%eval 0.03] }
2... Nf6 { [%txt "Contre e4."] [%eval -0.05] }
3. Nf3 { [%txt "Les Blancs défendent e5 indirectement et laissent e4. (3...Nc6 mène aux Deux Cavaliers, cours italian-game-black.)"] [%eval -0.49] }
3... Nxe4 { [%txt "On prend le pion."] [%eval -0.45] [%cal Gf6e4] }
4. Nc3 { [%txt "LE GAMBIT : le cavalier attaque e4."] [%eval -0.68] }
4... Nxc3 { [%txt "On échange le cavalier."] [%eval -0.65] }
5. dxc3 { [%txt "Le pion reprend : la colonne d s'ouvre."] [%eval -0.58] }
(5. bxc3 { [%txt "Le pion reprend vers le centre, mais la colonne d reste fermée et nos pions avancent : l'évaluation passe de -0.65 à -2.09."] [%hint "les Blancs reprennent vers le centre et perdent leur meilleure idée, la colonne d ouverte."] [%hint "la case d5. Notre pion y avance et attaque le fou c4."] [%hint "5...d5 : le centre avec gain de temps."] [%hintcsl Gd5,Rc4] [%eval -2.09] }
  5... d5 { [%txt "Le pion attaque le fou c4."] [%eval -2.21] [%cal Gd5c4] }
  6. Bb3 { [%txt "Le fou recule."] [%eval -2.12] }
  6... e4 { [%txt "Le pion chasse le cavalier f3."] [%eval -2.38] [%cal Ge4f3] }
  7. Ng1 { [%txt "Le cavalier recule."] [%eval -2.38] }
  7... c5 { [%txt "À RETENIR.

PRO TIP : -2.32. Deux pions centraux de plus en avant et un cavalier blanc revenu en g1. Contre bxc3, les pions noirs du centre avancent tout de suite."] [%eval -2.32] [%csl Gd5,Ge4] })
5... f6 { [%txt "Le pion soutient e5 et ferme la diagonale du fou vers f7."] [%eval -0.73] [%cal Gf6e5] }
(5... d5 { [%txt "LA VARIANTE PIÉGÉE : le centre, la routine…"] [%eval 1.87] [%csl Rd5] }
  6. Bxd5 { [%txt "…mais le fou prend en d5 : le pion n'était défendu que par la dame, et f7 est visé. À RETENIR.

PRO TIP : +2.02. Après 5.dxc3, la colonne d est ouverte : ...d5 se fait prendre par le fou, soutenu par la dame d1."] [%eval 2.02] [%cal Gd1d5] })
6. O-O { [%txt "Les Blancs roquent."] [%eval -0.73] }
(6. Be3 { [%txt "Une imprécision : le fou se développe sans menace, et nous avons le temps de consolider. L'évaluation passe de -0.73 à -1.17."] [%eval -1.17] }
  6... Qe7 { [%txt "La dame consolide."] [%eval -1.07] }
  7. O-O { [%txt "Les Blancs roquent."] [%eval -1.06] }
  7... d6 { [%txt "À RETENIR.

PRO TIP : -1.22. Un pion de plus et une position solide : e5 est tenu par f6 et d6. Après le gambit Boden, consolide d'abord, développe ensuite."] [%eval -1.22] [%csl Ge5] })
6... Nc6 { [%txt "Le cavalier se développe."] [%eval -0.68] }
7. b4 { [%txt "Les Blancs prennent l'espace à l'aile dame."] [%eval -0.68] }
(7. Qd5 { [%txt "La dame vise f7, mais elle est seule : l'évaluation passe de -0.68 à -1.44."] [%hint "la dame blanche vise f7 sans soutien d'une autre pièce que le fou."] [%hint "la case e7. Notre dame y couvre f7 et prépare ...Nd8."] [%hint "7...Qe7 : on défend f7."] [%hintcsl Ge7,Rf7] [%eval -1.44] }
  7... Qe7 { [%txt "La dame couvre f7."] [%eval -1.31] }
  8. Re1 { [%txt "La tour vise e5."] [%eval -1.32] }
  8... Nd8 { [%txt "À RETENIR.

PRO TIP : -1.37. Le cavalier défend f7 et e6, la dame blanche n'a plus de cible. Contre une attaque de dame sur f7, compte les attaquants : dame et fou contre dame et cavalier, f7 tient."] [%eval -1.37] [%csl Gf7] })
7... Ne7 { [%txt "Le cavalier se replie vers g6 ou f5, et couvre d5."] [%eval -0.55] [%cal Ge7g6] }
8. Re1 { [%txt "La tour vise la colonne e."] [%eval -0.54] }
8... d6 { [%txt "Le pion soutient e5."] [%eval -0.51] }
9. Bb3 { [%txt "Le fou se met à l'abri."] [%eval -0.62] }
9... c6 { [%txt "Le pion contrôle d5."] [%eval -0.54] }
10. a4 { [%txt "Les Blancs prennent l'espace."] [%eval -0.48] }
10... Qc7 { [%txt "La dame se développe.

À RETENIR.

PRO TIP : la feuille de route après la théorie (-0.46).
1. ...Be6 : on échange le fou b3, le meilleur attaquant blanc.
2. ...Kf7 ou ...O-O-O selon la position : le roi se met à l'abri.
3. ...d5 seulement quand le fou c4 ou b3 ne peut plus le prendre."] [%eval -0.46] [%csl Ge5] } *`,
    ),
    chapter(
      "Branche D : la Partie du Centre, 2.d4 exd4 3.Qxd4",
      `{ [%txt "LA PARTIE DU CENTRE (2.d4 exd4 3.Qxd4).

La dame blanche sort au deuxième coup : on la chasse avec gain de temps par ...Nc6. Après 4.Qe3, notre plan : ...Nf6, ...Bb4 et le roque, puis ...Re8 contre e4. Les Blancs roquent souvent du grand côté et attaquent à l'aile roi.

Points clés : le pion e4 blanc est la cible ; ...Bb4 cloue le cavalier c3 qui le défend."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] }
2. d4 { [%txt "LA PARTIE DU CENTRE : les Blancs ouvrent tout de suite."] [%eval -0.15] }
(2. Bc4 { [%txt "La Partie du Fou : chapitres 1 à 4."] [%eval 0.03] })
2... exd4 { [%txt "On prend."] [%eval -0.05] }
3. Qxd4 { [%txt "La dame reprend. (3.c3 : chapitre 7 ; 3.Nf3 : l'Écossaise, cours scotch-four-knights-black.)"] [%eval -0.18] }
3... Nc6 { [%txt "Le cavalier attaque la dame avec gain de temps."] [%eval -0.20] [%cal Gc6d4] }
4. Qe3 { [%txt "La dame se place en e3."] [%eval -0.09] }
4... Nf6 { [%txt "Le cavalier attaque e4."] [%eval -0.10] [%cal Gf6e4] }
5. Nc3 { [%txt "Le cavalier défend e4."] [%eval -0.26] }
(5. e5 { [%txt "Le pion attaque le cavalier, mais il s'avance seul : l'évaluation passe de -0.10 à -0.81."] [%hint "les Blancs avancent un pion sans soutien et chassent notre cavalier vers une belle case."] [%hint "la case g4. Notre cavalier y attaque la dame e3 et le pion e5."] [%hint "5...Ng4 : le cavalier attaque la dame."] [%hintcsl Gg4,Re5] [%eval -0.81] }
  5... Ng4 { [%txt "Le cavalier attaque la dame et e5."] [%eval -1.17] [%cal Gg4e3,Gg4e5] }
  6. Qe2 { [%txt "La dame recule."] [%eval -1.15] }
  6... d6 { [%txt "On attaque le pion e5 une fois de plus."] [%eval -1.13] }
  7. exd6+ { [%txt "Les Blancs prennent avec échec."] [%eval -1.05] }
  7... Be6 { [%txt "À RETENIR.

PRO TIP : -1.04. Le fou couvre l'échec et se développe ; nos pièces sont toutes actives. Contre un pion e5 qui avance seul, ...Ng4 et ...d6 le détruisent."] [%eval -1.04] [%cal Ge6a2] })
5... Bb4 { [%txt "Le fou cloue le cavalier c3, défenseur de e4."] [%eval -0.25] [%cal Gb4c3] }
6. Bd2 { [%txt "Le fou décloue."] [%eval -0.47] }
6... O-O { [%txt "On roque."] [%eval -0.44] [%csl Gg8] }
7. O-O-O { [%txt "Le grand roque : les Blancs préparent l'attaque à l'aile roi."] [%eval -0.33] }
7... Re8 { [%txt "La tour attaque e4."] [%eval -0.32] [%cal Ge8e4] }
(7... Qe7 { [%txt "LA VARIANTE PIÉGÉE : la dame vise e4…"] [%eval 0.78] [%csl Re7] }
  8. Nd5 { [%txt "…mais le cavalier attaque la dame et le fou b4 avec gain de temps. À RETENIR.

PRO TIP : +0.36. Dans la Partie du Centre, la case e8 est pour la tour : ...Re8 attaque e4 sans s'exposer au cavalier d5."] [%eval 0.36] [%csl Rd5] })
8. Bc4 { [%txt "Le fou défend e4 indirectement et vise f7."] [%eval -0.32] }
8... d6 { [%txt "Le pion ouvre le fou c8 et contrôle e5."] [%eval -0.34] }
9. Nf3 { [%txt "Développement."] [%eval -0.30] }
(9. Kb1 { [%txt "Le roi se met à l'abri, mais e4 reste faible : l'évaluation passe de -0.34 à -1.14."] [%hint "les Blancs jouent un coup de roi pendant que e4 n'a qu'un défenseur, le cavalier c3, cloué."] [%hint "le cavalier c3. Notre fou b4 le prend, puis le cavalier f6 prend e4."] [%hint "9...Bxc3 10.Bxc3 Nxe4 : un pion de plus."] [%hintcsl Rc3,Re4] [%eval -1.14] }
  9... Bxc3 { [%txt "On prend le cavalier."] [%eval -1.04] }
  10. Bxc3 { [%txt "Le fou reprend."] [%eval -1.02] }
  10... Nxe4 { [%txt "Le cavalier prend e4."] [%eval -1.14] }
  11. Nf3 { [%txt "Développement."] [%eval -1.14] }
  11... h6 { [%txt "À RETENIR.

PRO TIP : -0.98, un pion de plus. Le pion e4 n'était défendu que par un cavalier cloué : compte les défenseurs avant chaque coup de roi."] [%eval -0.98] [%csl Re4] })
9... Be6 { [%txt "On propose l'échange du fou c4."] [%eval -0.34] }
10. Bd3 { [%txt "Le fou recule et défend e4."] [%eval -0.34] }
(10. Bb3 { [%txt "Le fou recule en b3 et laisse e4 sans défense supplémentaire : l'évaluation passe de -0.34 à -1.79."] [%hint "les Blancs retirent le fou de la défense de e4 et offrent l'échange en b3."] [%hint "le fou b3. Notre fou e6 le prend, puis la poussée ...d5 frappe e4."] [%hint "10...Bxb3 11.axb3 d5 : le centre éclate."] [%hintcsl Gb3,Ge4] [%eval -1.79] }
  10... Bxb3 { [%txt "On échange le fou."] [%eval -1.73] }
  11. axb3 { [%txt "Le pion reprend."] [%eval -2.00] }
  11... d5 { [%txt "Le pion frappe e4."] [%eval -2.02] [%cal Gd5e4] }
  12. e5 { [%txt "Le pion avance."] [%eval -2.14] }
  12... Bd6 { [%txt "À RETENIR.

PRO TIP : -1.90. Le pion e5 tombera, notre fou d6 l'attaque déjà. Après l'échange du fou blanc, ...d5 ouvre le centre contre le roi blanc."] [%eval -1.90] [%cal Gd6e5] })
10... a6 { [%txt "On prépare ...b5 contre le roi blanc."] [%eval -0.32] [%cal Ga6b5] }
11. h3 { [%txt "Les Blancs empêchent ...Ng4."] [%eval -0.38] }
11... b5 { [%txt "Le pion avance vers le roi c1.

À RETENIR.

PRO TIP : la feuille de route après la théorie (-0.40).
1. ...b4 : on chasse le cavalier c3, défenseur de e4.
2. ...Bxc3 et ...Nxe4 quand le cavalier est seul.
3. ...Nb4 : le cavalier vise d3 et a2."] [%eval -0.40] [%cal Gb5b4] } *`,
    ),
    chapter(
      "Aléatoire surprise 2 : après la Partie du Centre, le cavalier qui entre en b4",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le chapitre 5 jusqu'à 11...b5. La théorie s'arrête là. Les Blancs ne font pas de gaffe : ils jouent des coups d'attente pendant que nos pièces visent leur roi c1. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case clé (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a changé le dernier coup adverse ? 2. Quel défenseur du roi blanc a bougé ? 3. Quel pion noir peut avancer vers lui ?"] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] }
2. d4 { [%txt "La Partie du Centre."] [%eval -0.15] }
(2. Bc4 { [%txt "La Partie du Fou : chapitres 1 à 4."] [%eval 0.03] })
2... exd4 { [%txt "Prise."] [%eval -0.05] }
3. Qxd4 { [%txt "La dame."] [%eval -0.18] }
3... Nc6 { [%txt "Gain de temps."] [%eval -0.20] }
4. Qe3 { [%txt "Recul."] [%eval -0.09] }
4... Nf6 { [%txt "Contre e4."] [%eval -0.10] }
5. Nc3 { [%txt "Défense."] [%eval -0.26] }
5... Bb4 { [%txt "Clouage."] [%eval -0.25] }
6. Bd2 { [%txt "Déclouage."] [%eval -0.47] }
6... O-O { [%txt "Roque."] [%eval -0.44] }
7. O-O-O { [%txt "Grand roque."] [%eval -0.33] }
7... Re8 { [%txt "Contre e4."] [%eval -0.32] }
8. Bc4 { [%txt "Le fou."] [%eval -0.32] }
8... d6 { [%txt "Ouverture."] [%eval -0.34] }
9. Nf3 { [%txt "Développement."] [%eval -0.30] }
9... Be6 { [%txt "Échange proposé."] [%eval -0.34] }
10. Bd3 { [%txt "Recul."] [%eval -0.34] }
10... a6 { [%txt "Prépare ...b5."] [%eval -0.32] }
11. h3 { [%txt "Contre ...Ng4."] [%eval -0.38] }
11... b5 { [%txt "Fin de la théorie."] [%eval -0.40] }
12. Be1 { [%txt "Le fou recule sans but et laisse la dame e3 sur la diagonale de notre fou : l'évaluation passe de -0.40 à -1.20."] [%hint "les Blancs reculent un fou alors que leur dame e3 est sur la diagonale a7-g1."] [%hint "la case c5. Notre fou b4 y revient et attaque la dame e3."] [%hint "12...Bc5 : gain de temps sur la dame."] [%hintcsl Gc5,Re3] [%eval -1.20] }
12... Bc5 { [%txt "Le fou attaque la dame."] [%eval -1.27] [%cal Gc5e3] }
13. Qf4 { [%txt "La dame s'écarte."] [%eval -1.27] }
13... Nb4 { [%txt "Le cavalier vise d3 et a2."] [%eval -1.32] [%cal Gb4d3] }
14. a3 { [%txt "Le pion chasse le cavalier, mais le fou d3 tombe avec échec : l'évaluation passe de -1.32 à -2.39."] [%hint "les Blancs chassent le cavalier sans voir qu'il a une prise avec échec."] [%hint "le fou d3. Notre cavalier le prend avec échec au roi c1."] [%hint "14...Nxd3+ : la paire de fous est à nous."] [%hintcsl Rd3,Gb4] [%eval -2.39] }
14... Nxd3+ { [%txt "On prend le fou avec échec."] [%eval -2.34] }
15. Rxd3 { [%txt "La tour reprend."] [%eval -2.45] }
15... a5 { [%txt "Le pion prépare ...b4."] [%eval -2.61] [%cal Ga5b4] }
16. a4 { [%txt "Une imprécision : le pion bloque a5, mais il laisse b4 à notre pion. L'évaluation passe de -2.61 à -3.09."] [%eval -3.09] }
16... b4 { [%txt "Le pion chasse le cavalier."] [%eval -2.92] [%cal Gb4c3] }
17. Nd5 { [%txt "Le cavalier saute en d5."] [%eval -2.76] }
17... Bxd5 { [%txt "On prend le cavalier."] [%eval -2.82] }
18. exd5 { [%txt "Le pion reprend."] [%eval -3.03] }
18... Re4 { [%txt "La tour attaque la dame."] [%eval -2.91] [%cal Ge4f4] }
19. Qd2 { [%txt "La dame recule."] [%eval -3.27] }
19... Qd7 { [%txt "À RETENIR.

PRO TIP : -3.00. La dame vise a4, les pions blancs de l'aile dame sont faibles. Quand les Blancs ont roqué du grand côté, chaque coup de pion a ou b de leur part ouvre des cases pour nos pièces."] [%eval -3.00] [%cal Gd7a4] } *`,
    ),
    chapter(
      "Branche E : le gambit danois, 2.d4 exd4 3.c3 d5",
      `{ [%txt "LE GAMBIT DANOIS (3.c3).

Les Blancs offrent un, deux ou trois pions pour l'attaque. Le plus simple : 3...d5, on rend le pion tout de suite et la dame noire entre en d5. Après 4.exd5 Qxd5 5.cxd4, on se développe avec gain de temps (...Nc6, ...Bg4, ...Bb4+) contre le pion isolé d4.

Points clés : le pion d4 est isolé et attaqué par nos pièces ; l'échange des dames est souvent bon pour nous."] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] }
2. d4 { [%txt "La Partie du Centre."] [%eval -0.15] }
(2. Bc4 { [%txt "La Partie du Fou : chapitres 1 à 4."] [%eval 0.03] })
2... exd4 { [%txt "On prend."] [%eval -0.05] }
3. c3 { [%txt "LE GAMBIT DANOIS : les Blancs offrent un deuxième pion."] [%eval -0.35] }
3... d5 { [%txt "On rend le pion et on ouvre le centre : la réponse la plus sûre."] [%eval -0.07] [%cal Gd5e4] }
4. exd5 { [%txt "Les Blancs prennent."] [%eval -0.17] }
(4. cxd4 { [%txt "Les Blancs reprennent d4, mais le pion e4 tombe : l'évaluation passe de -0.07 à -0.87."] [%hint "les Blancs reprennent un pion et en laissent un autre en prise."] [%hint "le pion e4. Notre pion d5 le prend."] [%hint "4...dxe4 : un pion de plus et le centre ouvert."] [%hintcsl Re4,Gd5] [%eval -0.87] }
  4... dxe4 { [%txt "On prend e4."] [%eval -0.78] }
  5. Nc3 { [%txt "Développement."] [%eval -0.83] }
  5... Nf6 { [%txt "Développement."] [%eval -0.87] }
  6. Bc4 { [%txt "Le fou vise f7."] [%eval -0.80] }
  6... Be7 { [%txt "À RETENIR.

PRO TIP : -0.83, un pion de plus. Contre un gambit, prends le pion que l'adversaire oublie de défendre ; ici e4 après cxd4."] [%eval -0.83] [%csl Ge4] })
4... Qxd5 { [%txt "La dame reprend et se centralise."] [%eval -0.11] }
5. cxd4 { [%txt "Les Blancs reprennent d4 : il est isolé."] [%eval -0.02] }
5... Nc6 { [%txt "Le cavalier attaque d4."] [%eval -0.07] [%cal Gc6d4] }
6. Nf3 { [%txt "Le cavalier défend d4."] [%eval -0.06] }
(6. Nc3 { [%txt "Le cavalier attaque la dame, mais il laisse d4 sans défense : l'évaluation passe de -0.07 à -1.07."] [%hint "les Blancs attaquent la dame sans défendre le pion d4."] [%hint "le pion d4. Notre dame le prend, et elle propose l'échange des dames."] [%hint "6...Qxd4 : un pion de plus."] [%hintcsl Rd4,Gd5] [%eval -1.07] }
  6... Qxd4 { [%txt "On prend d4."] [%eval -1.23] }
  7. Be3 { [%txt "Le fou attaque la dame."] [%eval -1.28] }
  7... Qxd1+ { [%txt "On échange les dames."] [%eval -1.18] }
  8. Rxd1 { [%txt "La tour reprend."] [%eval -1.20] }
  8... Nf6 { [%txt "À RETENIR.

PRO TIP : -1.06, un pion de plus en finale. Contre un pion isolé non défendu, prends-le et échange les dames."] [%eval -1.06] [%csl Gd4] })
6... Bg4 { [%txt "Le fou cloue le cavalier f3, défenseur de d4."] [%eval -0.08] [%cal Gg4f3] }
(6... Qe6+ { [%txt "LA VARIANTE PIÉGÉE : l'échec semble actif…"] [%eval 0.77] [%csl Re6] }
  7. Be2 { [%txt "…mais le fou couvre l'échec en se développant, et notre dame bloque le fou c8. À RETENIR.

PRO TIP : +0.72. Un échec qui aide l'adversaire à se développer n'est pas un bon coup : ...Bg4 met la pression sur d4."] [%eval 0.72] [%csl Rc8] })
7. Be2 { [%txt "Le fou décloue."] [%eval -0.08] }
(7. Bd3 { [%txt "Le fou se développe, mais il laisse le cavalier f3 cloué sur la dame : l'évaluation passe de -0.08 à -2.33."] [%hint "les Blancs développent le fou en d3 et oublient que le cavalier f3 défend d4."] [%hint "le cavalier f3. Notre fou g4 le prend, puis d4 tombe."] [%hint "7...Bxf3 8.Qxf3 Qxf3 9.gxf3 Nxd4 : un pion de plus."] [%hintcsl Rf3,Rd4] [%eval -2.33] }
  7... Bxf3 { [%txt "On prend le cavalier."] [%eval -2.54] }
  8. Qxf3 { [%txt "La dame reprend."] [%eval -2.63] }
  8... Qxf3 { [%txt "On échange les dames."] [%eval -2.39] }
  9. gxf3 { [%txt "Le pion reprend."] [%eval -2.51] }
  9... Nxd4 { [%txt "À RETENIR.

PRO TIP : -2.48. Le pion d4 est tombé, les pions f blancs sont doublés. Le cavalier f3 était le seul vrai défenseur de d4 : quand il est cloué, d4 est faible."] [%eval -2.48] [%csl Gd4] })
7... Bb4+ { [%txt "L'échec gêne le roque."] [%eval -0.06] [%cal Gb4e1] }
8. Nc3 { [%txt "Le cavalier s'interpose."] [%eval -0.02] }
8... Bxf3 { [%txt "On prend le cavalier f3."] [%eval 0.02] }
9. Bxf3 { [%txt "Le fou reprend."] [%eval 0.01] }
(9. gxf3 { [%txt "Le pion reprend et abîme la structure blanche : l'évaluation passe de +0.02 à -2.26."] [%hint "les Blancs reprennent avec un pion et laissent d4 sans le soutien du fou."] [%hint "le pion d4. Notre dame le prend, le cavalier c3 est cloué."] [%hint "9...Qxd4 : un pion de plus."] [%hintcsl Rd4,Gd5] [%eval -2.26] }
  9... Qxd4 { [%txt "On prend d4."] [%eval -2.20] }
  10. O-O { [%txt "Les Blancs roquent."] [%eval -2.37] }
  10... O-O-O { [%txt "À RETENIR.

PRO TIP : -2.39. Un pion de plus et la colonne d. Après ...Bxf3, reprendre avec un pion laisse d4 sans défenseur."] [%eval -2.39] [%cal Gd8d1] })
9... Qc4 { [%txt "La dame attaque d4 et empêche le roque."] [%eval 0.00] [%cal Gc4d4] }
10. Qb3 { [%txt "Les Blancs proposent l'échange des dames."] [%eval 0.02] }
10... Qxb3 { [%txt "On échange."] [%eval 0.03] }
11. axb3 { [%txt "Le pion reprend."] [%eval 0.03] }
11... Nxd4 { [%txt "Le cavalier prend d4."] [%eval 0.04] }
12. Bxb7 { [%txt "Le fou prend b7."] [%eval 0.03] }
12... Rb8 { [%txt "La tour attaque le fou.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.01).
1. ...Nc2+ : le cavalier vise a1 et e3.
2. ...Ne7 et ...O-O : la finale est sûre.
3. ...Bxc3 seulement si la structure blanche s'abîme."] [%eval 0.01] [%cal Gb8b7] } *`,
    ),
    chapter(
      "Anti-panique : 2.Qh5, 2.Qf3 et le mat du berger",
      `{ [%txt "ANTI-PANIQUE.

Contre 1...e5, les Blancs sortent parfois la dame au deuxième coup pour viser f7 avec le fou c4. Pas de panique : on défend e5, puis f7, et on développe avec gain de temps sur la dame.

PRO TIP : contre une dame en h5 ou f3, demande-toi à chaque coup : f7 est-il attaqué deux fois ?"] [%eval 0.39] }
1. e4 { [%txt "Le centre."] [%eval 0.26] }
1... e5 { [%txt "Symétrie."] [%eval 0.36] }
2. Qh5 { [%txt "La dame attaque e5 et vise f7."] [%eval -0.26] }
(2. Bc4 { [%txt "La Partie du Fou : chapitres 1 à 4."] [%eval 0.03] })
(2. Qf3 { [%txt "La dame vise f7 depuis f3."] [%eval -0.28] }
  2... Nc6 { [%txt "Le cavalier se développe et vise d4. C'est ton coup dans tes deux parties contre 2.Qf3."] [%eval -0.09] [%cal Gc6d4] }
  3. Bc4 { [%txt "Le fou vise f7 : deux attaquants."] [%eval -0.17] }
  3... Nf6 { [%txt "Le cavalier se place devant la dame : la colonne f3-f7 est fermée. À RETENIR.

PRO TIP : -0.10. Contre 2.Qf3 et 3.Bc4, ...Nf6 ferme la diagonale de la dame."] [%eval -0.10] [%cal Gf6f7] })
2... Nc6 { [%txt "Le cavalier défend e5."] [%eval -0.25] [%cal Gc6e5] }
3. Bc4 { [%txt "Le fou vise f7 : deux attaquants."] [%eval -0.22] }
(3. Nf3 { [%txt "Le cavalier se développe, mais la dame h5 reste exposée : l'évaluation passe de -0.25 à -1.55."] [%hint "les Blancs développent un cavalier alors que leur dame est attaquable."] [%hint "la case f6. Notre cavalier g8 y vient et attaque la dame h5."] [%hint "3...Nf6 : gain de temps sur la dame."] [%hintcsl Gf6,Rh5] [%eval -1.55] }
  3... Nf6 { [%txt "Le cavalier attaque la dame."] [%eval -1.45] }
  4. Qh4 { [%txt "La dame recule."] [%eval -1.66] }
  4... Be7 { [%txt "À RETENIR.

PRO TIP : -1.27. Deux pièces sorties avec gain de temps. Quand f7 n'est attaqué qu'une fois, développe avec menace sur la dame."] [%eval -1.27] [%cal Gf6h5] })
3... g6 { [%txt "Le pion chasse la dame et ferme la diagonale h5-f7."] [%eval -0.23] [%cal Gg6h5] }
(3... Nf6 { [%txt "LA VARIANTE PIÉGÉE : le développement naturel…"] [%eval #1] [%csl Rf7] }
  4. Qxf7# { [%txt "…et c'est mat : la dame prend f7, soutenue par le fou c4. À RETENIR.

PRO TIP : mat. Le MAT DU BERGER. Quand la dame et le fou visent f7 ensemble, défends f7 ou chasse la dame avant tout développement."] [%eval #0] [%csl Rf7] })
4. Qf3 { [%txt "La dame revient viser f7."] [%eval -0.20] }
4... Nf6 { [%txt "Le cavalier ferme la colonne f3-f7."] [%eval -0.22] [%cal Gf6f7] }
5. Ne2 { [%txt "Le cavalier se développe sans bloquer la dame."] [%eval -0.24] }
(5. Nc3 { [%txt "Le cavalier se développe, mais il laisse la case d4 à notre cavalier : l'évaluation passe de -0.22 à -0.96."] [%hint "les Blancs développent le cavalier c3 alors que leur dame f3 et le pion c2 sont exposés."] [%hint "la case d4. Notre cavalier c6 y attaque la dame f3 et le pion c2."] [%hint "5...Nd4 : double attaque sur la dame et c2."] [%hintcsl Gd4,Rc2] [%eval -0.96] }
  5... Nd4 { [%txt "Le cavalier attaque la dame et c2."] [%eval -0.90] [%cal Gd4f3,Gd4c2] }
  6. Qd1 { [%txt "La dame recule."] [%eval -0.96] }
  6... c6 { [%txt "À RETENIR.

PRO TIP : -1.03. Le cavalier d4 est installé et ...d5 suivra. Contre une dame en f3 et le pion c2 sans défense, cherche ...Nd4."] [%eval -1.03] [%csl Gd4] })
5... d6 { [%txt "Le pion ouvre le fou c8."] [%eval -0.31] }
6. Nbc3 { [%txt "Développement."] [%eval -0.30] }
(6. c3 { [%txt "Une imprécision : le pion prépare d4, mais la dame f3 reste en l'air. L'évaluation passe de -0.31 à -0.70."] [%eval -0.70] }
  6... Bg4 { [%txt "Le fou attaque la dame."] [%eval -0.79] }
  7. Qd3 { [%txt "La dame recule."] [%eval -0.81] }
  7... Bg7 { [%txt "À RETENIR.

PRO TIP : -0.78. Nos pièces sortent toutes avec gain de temps. Contre la dame f3, ...Bg4 est le coup qui la chasse."] [%eval -0.78] [%cal Gg4e2] })
6... Bg4 { [%txt "Le fou attaque la dame."] [%eval -0.24] }
7. Qe3 { [%txt "La dame recule."] [%eval -0.21] }
7... Bg7 { [%txt "Le fou se développe.

À RETENIR.

PRO TIP : la feuille de route après la théorie (-0.12).
1. ...O-O : le roi à l'abri, f7 est défendu par la tour.
2. ...Nd4 : le cavalier attaque c2.
3. ...Bxe2 puis ...Nb4 ou ...d5 : on ouvre le centre contre la dame."] [%eval -0.12] [%cal Gg7b2] } *`,
    ),
  ],
};
