import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours d'ouverture « Partie Écossaise (avec les Blancs) » — onglet
 * Ouvertures, format « un commentaire par coup » de l'Académie, lu par
 * `CourseTreeViewer` (route `/ouvertures/scotch-game/cours`).
 *
 * ## Contenu (refonte du 2026-10-10)
 *
 * 1. Fiche d'identité et réponses noires au 3e coup.
 * 2. Le 4e coup noir : toutes les réponses de club après 4.Nxd4.
 * 3. Branche A, 4...Nf6 5.Nc3 (Écossaise des Quatre Cavaliers) : à chaque
 *    coup noir, les réponses réelles entre 1500 et 1800 et la réplique blanche.
 * 4. Branche B, 4...Bc5 5.Nxc6 Qf6 6.Qf3 (choix de répertoire confirmé par
 *    l'utilisateur : la finale sans dames plutôt que 6.Qd2 de Kasparov).
 * 5. Anti-panique : les pièges des coups rares (4...Qh4, 4...Nxd4, 4...Bb4+,
 *    4...Nge7).
 * 6-11. Aléatoire surprise : séquences longues (5 à 10 coups après la
 *    théorie) où l'adversaire dérive, joue « mou » ou se crée une faiblesse,
 *    avec la méthode pour accentuer la pression et le punir.
 *
 * Sources : John Emms, « Starting Out: The Scotch Game » (Everyman 2005,
 * chapitres 1, 4 et 7, OCR du PDF de `docs/`) et Gary Lane, « The Scotch Game
 * Explained » (Batsford, chapitre « Other Black Defences »). Les livres de
 * Watson et de Flores Rios présents dans `docs/` ne traitent pas l'Écossaise.
 * Les sources fournissent les coups et les idées ; toute la prose est
 * originale. Chaque coup a été contrôlé par Stockfish 18 natif (profondeur
 * 16) : quand le moteur contredit nettement le livre, la ligne suit le
 * moteur (ex. 4...g6 ... 8...Ng8 9.f4 plutôt que 9.Bd4).
 *
 * ## Architecture technique des nœuds
 *
 * Chaque nœud (`ChessMoveNode`, `core/chess/move-tree.ts`) — nœud clé de la
 * ligne principale comme nœud surprise d'une variante — porte :
 * - `evaluationScore: number | null` : évaluation Stockfish de la position
 *   après le coup, en pions et point de vue Blancs (ex. `0.4`, `-2.5`), écrite
 *   `[%eval 0.40]` dans le PGN ; un mat s'écrit `[%eval #3]` et remplit
 *   `evaluationMate` ;
 * - `showEvalBar: boolean` : `true` dès qu'une évaluation est posée (tous les
 *   nœuds de ce cours), `[%evalbar off]` le coupe. Le lecteur affiche alors ce
 *   score dans la barre d'évaluation immédiatement, sans attendre le moteur :
 *   l'utilisateur voit tout de suite l'impact de son coup ou de la gaffe
 *   adverse ;
 * - `freeze: boolean` : posé par la balise `[%txt "…"]`, qui enveloppe CHAQUE
 *   commentaire de pièce ou de transition de ce cours.
 *
 * ## Consigne de code pour l'interface (balise [%txt])
 *
 * La présence de la balise [%txt] doit impérativement FREEZER (geler) le flux
 * du jeu. L'ordinateur a interdiction de jouer son coup tant que
 * l'utilisateur n'a pas cliqué sur un bouton « Suivant » ou appuyé sur Espace
 * pour valider la lecture du commentaire. (Implémenté dans
 * `client/features/learn/course-tree-viewer.tsx`, mode « Jouer les coups ».)
 *
 * Fichier GÉNÉRÉ : ne pas l'éditer à la main. Source commentée :
 * `scripts/opening-course-src/scotch-game.pgn` (et l'en-tête
 * `scotch-game.header.txt`) ; regénérer avec
 * `node --import tsx scripts/_tmp-build-opening-course.mts <source> <en-tête> <sortie> 16`
 * (Stockfish natif, voir `scripts/_tmp-sf-native.mts`). Les `[%eval]` viennent
 * du moteur, pas de la main ; `scripts/_tmp-check-evals.mts` signale les coups
 * blancs recommandés qui feraient chuter l'évaluation.
 * Règles de l'utilisateur : SAN en texte brut uniquement (jamais de figurine
 * Unicode), pas de guillemet droit dans un `[%txt]`.
 */

function chapter(title: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, START) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const OP_SCOTCH_GAME: CourseTree = {
  chapters: [
    chapter(
      "Fiche d'identité et réponses au 3e coup",
      `{ [%txt "LA PARTIE ÉCOSSAISE, AVEC LES BLANCS.

Le vrai enjeu : ouvrir le centre tout de suite, avant que les Noirs aient fini leur développement, et garder un pion e4 contre un pion d6 ou d7, donc plus d'espace. Emms appelle cette structure le centre pur de l'Écossaise : elle est bonne par nature pour les Blancs.

Le déséquilibre recherché : l'échange Nxc6 laisse souvent aux Noirs des pions c doublés ou un pion a isolé, des cibles fixes pour toute la partie. En échange, les Noirs reçoivent un jeu de pièces actif (colonne b semi-ouverte, centre mobile).

Les structures types (relevées sur la position finale de chaque branche) :
- Branche A (4...Nf6) : Blancs a2-b2-c2 et f2-g2-h2, sans faiblesse ; Noirs a7 isolé, duo c6-d5, f7-g7-h7. La case c5 n'est plus contrôlée par aucun pion noir.
- Branche B (4...Bc5) : finale sans dames. Blancs a4-b2-c2, e3-e4, f3-h2 (colonne g ouverte) ; Noirs a5, c6-c7 doublés, d6, f7-g7-h7.

Ce chapitre traite les réponses noires au 3e coup ; le suivant, celles au 4e coup."] [%eval 0.43] }
1. e4 { [%txt "Le pion occupe le centre et ouvre les diagonales du fou f1 et de la dame."] [%eval 0.41] [%csl Ge4] }
1... e5 { [%txt "Les Noirs prennent leur part du centre."] [%eval 0.39] }
2. Nf3 { [%txt "Le cavalier se développe en attaquant e5 : les Noirs doivent répondre tout de suite."] [%eval 0.38] [%cal Gf3e5] }
2... Nc6 { [%txt "Le cavalier défend e5 en se développant."] [%eval 0.40] }
3. d4 { [%txt "Le coup de l'Écossaise : on attaque e5 une deuxième fois, immédiatement. Le fou c1 respire aussi. Voici toutes les réponses noires qu'on rencontre en club."] [%eval 0.12] [%cal Gd4e5,Gf3e5] }
3... exd4 { [%txt "Le seul bon coup : les Noirs cèdent le centre, mais se développent vite."] [%eval 0.09] }
(3... d6 { [%txt "Les Noirs défendent e5 au lieu de prendre. Principe violé : la passivité, le fou f8 reste enfermé derrière d6."] [%eval 0.84] [%csl Rf8] }
  4. d5 { [%txt "Le coup du moteur : on gagne de l'espace avec gain de temps, le cavalier doit reculer."] [%eval 0.92] [%cal Gd5c6] }
  4... Nb8 { [%txt "Le meilleur repli : le cavalier passera par d7."] [%eval 0.97] }
  (4... Nce7 { [%txt "Le cavalier part vers g6."] [%eval 0.96] }
    5. c4 { [%txt "On renforce la chaîne d5 et on gagne encore de l'espace à l'aile dame."] [%eval 1.03] }
    5... Ng6 { [%txt "Le cavalier se replace."] [%eval 1.14] }
    6. Nc3 { [%txt "Développement : les Blancs ont un gros avantage d'espace, environ un pion selon le moteur."] [%eval 1.12] })
  5. c4 { [%txt "La chaîne c4-d5-e4 verrouille le centre : les Blancs joueront Nc3, Be2, O-O puis c5. Voir le chapitre surprise 5 pour la suite."] [%eval 0.78] [%csl Gc4,Gd5,Ge4] })
(3... Nxd4 { [%txt "Les Noirs échangent leur seule pièce développée."] [%eval 0.66] }
  4. Nxd4 { [%txt "On reprend."] [%eval 0.66] }
  4... exd4 { [%txt "La seule bonne reprise."] [%eval 0.61] }
  5. Qxd4 { [%txt "La dame se centralise : aucun cavalier c6 ne peut plus la chasser. C'est la même position que 3...exd4 4.Nxd4 Nxd4 5.Qxd4, traitée dans l'anti-panique."] [%eval 0.57] [%csl Gd4] }
  5... Nf6 { [%txt "Le cavalier attaque e4."] [%eval 1.70] }
  6. e5 { [%txt "Le moteur préfère pousser : le cavalier f6 est chassé avec gain de temps, et e5 gêne tout le camp noir (+1.7)."] [%eval 1.75] [%cal Ge5f6] })
(3... Bb4+ { [%txt "Un échec sans but : e5 reste en prise."] [%eval 1.63] }
  4. c3 { [%txt "On chasse le fou avec gain de temps."] [%eval 1.69] }
  4... Ba5 { [%txt "Le fou reste sur la diagonale."] [%eval 2.72] }
  5. d5 { [%txt "Le pion chasse le cavalier c6, défenseur de e5."] [%eval 2.57] [%cal Gd5c6] }
  5... Nce7 { [%txt "Le cavalier recule."] [%eval 2.58] }
  6. Nxe5 { [%txt "Un pion de plus, et le centre blanc reste intact (+2.6)."] [%eval 2.63] [%csl Ge5] })
(3... Nf6 { [%txt "Les Noirs contre-attaquent e4 sans défendre e5."] [%eval 1.12] }
  4. d5 { [%txt "Le moteur chasse d'abord le cavalier c6, défenseur de e5."] [%eval 1.19] [%cal Gd5c6] }
  4... Nb8 { [%txt "Le cavalier recule."] [%eval 1.12] }
  (4... Ne7 { [%txt "Le cavalier recule vers g6."] [%eval 1.30] }
    5. Nxe5 { [%txt "On prend le pion."] [%eval 1.25] }
    5... Nxe4 { [%txt "Les Noirs reprennent un pion."] [%eval 1.38] }
    6. Qe2 { [%txt "La dame attaque le cavalier e4 sur la colonne e, et le roi noir est encore en e8 : les Blancs gardent l'avantage."] [%eval 1.45] [%cal Ge2e4] })
  5. Nxe5 { [%txt "On prend e5. Les Noirs peuvent récupérer un pion par 5...Qe7 6.Nd3 Qxe4+, mais leur dame part seule à l'aventure pendant que les Blancs se développent avec gain de temps : environ +1 selon le moteur."] [%eval 1.05] [%csl Ge5] })
(3... Qf6 { [%txt "Une sortie de dame prématurée pour défendre e5."] [%eval 1.33] }
  4. d5 { [%txt "On chasse le cavalier avec gain de temps."] [%eval 1.37] }
  4... Nce7 { [%txt "Le cavalier recule."] [%eval 1.72] }
  5. Nc3 { [%txt "On se développe en menaçant Nb5 contre c7 : la dame f6 sera vite une cible pour Bg5."] [%eval 1.78] })
(3... f6 { [%txt "Ce coup défend e5 mais affaiblit la diagonale a2-g8, celle du roi."] [%eval 1.47] [%csl Rf7,Rg8] }
  4. Bc4 { [%txt "Le fou prend tout de suite cette diagonale."] [%eval 1.54] [%cal Gc4g8] }
  4... Nxd4 { [%txt "Les Noirs échangent."] [%eval 1.51] }
  5. Nxd4 { [%txt "On reprend."] [%eval 1.57] }
  5... exd4 { [%txt "Reprise."] [%eval 1.57] }
  6. O-O { [%txt "Le moteur ne se presse pas de reprendre d4 : le roi d'abord, le pion d4 ne s'enfuira pas (+1.6)."] [%eval 1.54] })
(3... Qe7 { [%txt "La dame défend e5 mais bloque le fou f8."] [%eval 1.34] }
  4. Nc3 { [%txt "Développement."] [%eval 1.37] }
  4... exd4 { [%txt "Les Noirs prennent finalement."] [%eval 1.41] }
  5. Nxd4 { [%txt "On reprend : par rapport à la ligne normale, la dame e7 bloque le fou f8."] [%eval 1.30] })
4. Nxd4 { [%txt "On reprend avec une pièce : le centre est à nous, pion e4 contre pion d7.

PRO TIP : 4.c3 et 4.Bc4 sont des gambits plus théoriques. 4.Nxd4 garde un jeu simple et sain. Les réponses noires au 4e coup sont au chapitre suivant."] [%eval 0.15] [%csl Ge4,Gd4] } *`,
    ),
    chapter(
      "Le 4e coup noir : tour d'horizon des réponses de club",
      `{ [%txt "Après 4.Nxd4, Emms estime qu'un joueur de club rencontre 4...Nf6 ou 4...Bc5 neuf fois sur dix. Ce chapitre traite la dixième fois : les coups rares mais réels, et la réponse blanche qui garde l'avantage. La règle générale : contre un coup qui ne conteste pas le centre, on se développe normalement et le centre pur de l'Écossaise (pion e4 contre aucun pion noir central) suffit. Les pièges (4...Qh4, 4...Nxd4, 4...Bb4+) sont détaillés dans le chapitre anti-panique."] [%eval 0.43] }
1. e4 { [%txt "On occupe le centre."] [%eval 0.41] [%csl Ge4] }
1... e5 { [%txt "Symétrie."] [%eval 0.39] }
2. Nf3 { [%txt "On attaque e5."] [%eval 0.38] [%cal Gf3e5] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.40] }
3. d4 { [%txt "On ouvre le centre."] [%eval 0.12] [%cal Gd4e5] }
3... exd4 { [%txt "Les Noirs prennent."] [%eval 0.09] }
4. Nxd4 { [%txt "Le cavalier est au centre : c'est la position de référence de l'Écossaise. Voici les réponses noires classées par fréquence en club."] [%eval 0.15] [%csl Gd4,Ge4] }
4... Nf6 { [%txt "La plus jouée : attaque immédiate sur e4."] [%eval 0.24] [%cal Rf6e4] }
(4... Bc5 { [%txt "La deuxième plus jouée : le fou attaque d4."] [%eval 0.38] }
  5. Nxc6 { [%txt "Notre réponse : voir la branche B."] [%eval 0.19] })
(4... Qf6 { [%txt "La dame vise d4 et f2. Emms : ce coup rejoint souvent 4...Bc5."] [%eval 0.37] }
  5. Nxc6 { [%txt "On échange, comme contre 4...Bc5."] [%eval 0.21] }
  5... Bc5 { [%txt "Le meilleur coup noir : le fou menace le mat en f2 avec la dame."] [%eval 0.21] }
  6. Qf3 { [%txt "Exactement la position de la branche B (4...Bc5 5.Nxc6 Qf6 6.Qf3) : on connaît déjà la suite."] [%eval 0.16] [%cal Gf3f2] })
(4... d6 { [%txt "Solide mais passif : un joueur qui veut juste sortir de l'ouverture."] [%eval 0.76] }
  5. Nc3 { [%txt "Développement."] [%eval 0.76] }
  5... Nf6 { [%txt "Développement."] [%eval 0.67] }
  6. Bc4 { [%txt "Le fou se place sur la diagonale de f7."] [%eval 0.50] [%cal Gc4f7] }
  6... Be7 { [%txt "Développement."] [%eval 0.51] }
  7. O-O { [%txt "Roque."] [%eval 0.45] }
  7... O-O { [%txt "Roque."] [%eval 0.41] }
  8. h3 { [%txt "On interdit ...Bg4 et ...Ng4 : les Blancs ont plus d'espace et un jeu facile, avec Be3, Re1 puis f4."] [%eval 0.46] })
(4... g6 { [%txt "Le fou ira en g7 viser le cavalier d4, comme dans un Dragon."] [%eval 0.95] }
  5. Nc3 { [%txt "Développement."] [%eval 1.02] }
  5... Bg7 { [%txt "Le fou vise d4."] [%eval 1.02] [%cal Rg7d4] }
  6. Be3 { [%txt "On protège d4 en développant."] [%eval 1.00] }
  6... Nf6 { [%txt "Le cavalier attaque e4."] [%eval 1.10] }
  7. Nxc6 { [%txt "On échange d'abord…"] [%eval 1.09] }
  7... bxc6 { [%txt "…puis…"] [%eval 1.22] }
  8. e5 { [%txt "…le pion chasse le cavalier."] [%eval 1.07] [%cal Ge5f6] }
  8... Ng8 { [%txt "Le seul repli : un mauvais signe en partie ouverte."] [%eval 1.26] }
  9. f4 { [%txt "Le moteur préfère soutenir e5 tout de suite plutôt que 9.Bd4 : le cavalier g8 n'a plus de bonne case et les Blancs ont beaucoup d'espace."] [%eval 1.24] [%csl Ge5] })
(4... d5 { [%txt "Ce contre-coup central est prématuré."] [%eval 0.64] }
  5. Nxc6 { [%txt "On échange d'abord."] [%eval 0.55] }
  5... bxc6 { [%txt "Reprise."] [%eval 0.64] }
  6. exd5 { [%txt "On prend."] [%eval 0.62] }
  6... Qxd5 { [%txt "La seule reprise correcte : voir l'autre variante pour 6...cxd5."] [%eval 0.61] }
  (6... cxd5 { [%txt "Cette reprise perd un pion…"] [%eval 1.61] }
    7. Bb5+ { [%txt "…à cause de l'échec…"] [%eval 1.70] }
    7... Bd7 { [%txt "…l'interposition…"] [%eval 1.70] }
    8. Qxd5 { [%txt "…et d5 tombe."] [%eval 1.73] [%csl Gd5] })
  7. Qe2+ { [%txt "L'échec du moteur : la dame noire doit se mettre en e6 ou échanger."] [%eval 0.68] }
  7... Qe6 { [%txt "La dame s'interpose."] [%eval 0.66] }
  8. Nc3 { [%txt "Développement : les pions c noirs sont faibles et les Blancs se développent avec gain de temps (Bd2, grand roque)."] [%eval 0.69] })
(4... Be7 { [%txt "Le fou se développe, mais ne fait rien au centre."] [%eval 0.71] }
  5. Nc3 { [%txt "Développement."] [%eval 0.71] }
  5... d6 { [%txt "Les Noirs soutiennent leur jeu."] [%eval 0.69] }
  6. Bb5 { [%txt "On cloue le cavalier c6."] [%eval 0.81] [%cal Gb5c6] }
  6... Bd7 { [%txt "Interposition."] [%eval 0.73] }
  7. Nxc6 { [%txt "On échange au bon moment."] [%eval 0.79] }
  7... bxc6 { [%txt "Reprise."] [%eval 0.81] }
  8. Bd3 { [%txt "Le fou revient défendre e4 : les pions c noirs sont doublés et les Blancs ont le centre."] [%eval 0.75] })
(4... Nge7 { [%txt "Le plan : ...Nxd4 puis ...Nc6."] [%eval 1.23] }
  5. Nc3 { [%txt "Développement."] [%eval 1.13] }
  5... Nxd4 { [%txt "Les Noirs échangent."] [%eval 1.25] }
  6. Qxd4 { [%txt "La dame se centralise."] [%eval 1.25] }
  6... Nc6 { [%txt "Le cavalier chasse la dame."] [%eval 1.16] }
  7. Qe3 { [%txt "Emms : la dame ira en g3, contre g7. On joue ensuite Bd2 et le grand roque."] [%eval 1.15] [%cal Ge3g3] })
(4... Qh4 { [%txt "La sortie de dame agressive : voir le chapitre anti-panique."] [%eval 0.74] }
  5. Nc3 { [%txt "La réponse d'Emms : développer en limitant les ruses noires."] [%eval 0.70] })
(4... Nxd4 { [%txt "L'échange que les joueurs de club adorent : voir le chapitre anti-panique."] [%eval 0.57] }
  5. Qxd4 { [%txt "La dame se centralise."] [%eval 0.57] })
(4... Bb4+ { [%txt "L'échec du spécialiste Tony Miles : voir le chapitre anti-panique."] [%eval 0.33] }
  5. c3 { [%txt "On chasse le fou avec gain de temps."] [%eval 0.44] })
5. Nc3 { [%txt "Notre réponse : voir la branche A."] [%eval 0.09] [%cal Gc3e4] } *`,
    ),
    chapter(
      "Branche A : 4...Nf6 5.Nc3, toutes les réponses noires",
      `{ [%txt "La réponse la plus jouée : les Noirs attaquent e4 tout de suite. On répond 5.Nc3, l'Écossaise des Quatre Cavaliers, qu'Emms conseille aux joueurs en progression : peu de théorie, un jeu de pièces simple. À chaque coup noir, l'arbre montre les réponses qu'on rencontre vraiment entre 1500 et 1800, et la réplique blanche qui les punit. La ligne principale vise une position où le duo noir c6-d5 devient une cible et où la case c5 appartient à nos pièces."] [%eval 0.43] }
1. e4 { [%txt "On occupe le centre."] [%eval 0.41] [%csl Ge4] }
1... e5 { [%txt "Symétrie."] [%eval 0.39] }
2. Nf3 { [%txt "Le cavalier attaque e5."] [%eval 0.38] [%cal Gf3e5] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.40] }
3. d4 { [%txt "On ouvre le centre."] [%eval 0.12] [%cal Gd4e5] }
3... exd4 { [%txt "Les Noirs prennent."] [%eval 0.09] }
4. Nxd4 { [%txt "Reprise par une pièce."] [%eval 0.15] }
4... Nf6 { [%txt "Développement avec gain de temps : e4 est attaqué."] [%eval 0.24] [%cal Rf6e4] }
5. Nc3 { [%txt "On défend e4 en développant une pièce. Les Noirs ont maintenant six réponses courantes ; la plus forte est 5...Bb4."] [%eval 0.09] [%cal Gc3e4] }
5... Bb4 { [%txt "Le meilleur coup : le fou cloue le cavalier c3 et renouvelle la menace sur e4, puisque son défenseur est paralysé."] [%eval 0.14] [%cal Rb4c3,Rf6e4] }
(5... Bc5 { [%txt "Le fou attaque le cavalier d4 au lieu de e4. Coup sous-estimé selon Emms, mais il demande de la précision."] [%eval 0.36] }
  6. Be3 { [%txt "Le coup logique : d4 est protégé, et on menace Nxc6 suivi de Bxc5, qui gagnerait une pièce."] [%eval 0.36] [%cal Gd4c6,Ge3c5] }
  6... Bb6 { [%txt "La bonne parade : le fou s'écarte de la menace."] [%eval 0.38] }
  (6... O-O { [%txt "La gaffe la plus fréquente de toute la variante : Emms l'a trouvée 35 fois dans sa base. Le roque laisse le fou c5 sans défense réelle."] [%eval 4.47] }
    7. Nxc6 { [%txt "On élimine le cavalier c6 en gardant le fou e3 face au fou c5…"] [%eval 4.41] [%cal Gd4c6] }
    7... bxc6 { [%txt "…la reprise…"] [%eval 4.44] }
    8. Bxc5 { [%txt "…et le fou c5 tombe : une pièce de plus."] [%eval 4.44] [%csl Gc5] })
  (6... Nxd4 { [%txt "Les Noirs échangent pour se libérer."] [%eval 0.63] }
    7. Bxd4 { [%txt "On reprend avec le fou, qui fait face au fou c5."] [%eval 0.72] }
    7... Bxd4 { [%txt "Échange des fous."] [%eval 1.39] }
    8. Qxd4 { [%txt "La dame se centralise sans craindre de cavalier en c6."] [%eval 1.50] }
    8... d6 { [%txt "Les Noirs restent passifs."] [%eval 1.44] }
    9. O-O-O { [%txt "Grand roque : les Blancs ont le centre pur de l'Écossaise et une initiative durable."] [%eval 1.60] [%csl Ge4] })
  (6... d6 { [%txt "Ce coup calme ignore la menace."] [%eval 2.15] }
    7. Nxc6 { [%txt "On prend en c6…"] [%eval 2.23] }
    7... bxc6 { [%txt "…la reprise…"] [%eval 2.15] }
    8. Bxc5 { [%txt "…et on échange le fou…"] [%eval 2.26] }
    8... dxc5 { [%txt "…ce qui laisse aux Noirs trois pions c triplés et isolés, le centre irlandais d'Emms : une faiblesse pour toute la partie."] [%eval 2.22] [%csl Rc7,Rc6,Rc5] })
  7. Qd2 { [%txt "Le coup du moteur, qu'Emms juge très sérieux : la dame prépare le grand roque, puis f3 et g4-g5 contre le cavalier f6, comme l'attaque anglaise de la Sicilienne."] [%eval 0.41] [%cal Gg2g4] }
  7... O-O { [%txt "Les Noirs roquent du côté où vont avancer nos pions."] [%eval 0.44] }
  8. O-O-O { [%txt "Les rois sont sur des ailes opposées : la course à l'attaque commence."] [%eval 0.42] }
  8... Re8 { [%txt "La tour presse e4."] [%eval 0.52] [%cal Re8e4] }
  9. f3 { [%txt "On protège e4 solidement et on prépare g4."] [%eval 0.48] }
  9... d6 { [%txt "Trop lent selon Emms : les Noirs n'ont plus de contre-jeu central. (9...d5 était l'essai le plus actif.)"] [%eval 1.37] }
  10. g4 { [%txt "La marée de pions commence : g5 chassera le cavalier f6. Dans Reefat-Hebden (1995), les Noirs ont vite été en grande difficulté."] [%eval 1.41] [%cal Gg4g5] })
(5... Nxd4 { [%txt "Une erreur fréquente : les Noirs croient gagner du temps contre la dame centralisée."] [%eval 1.20] }
  6. Qxd4 { [%txt "La dame est bien placée en d4 : aucun cavalier c6 ne peut plus la chasser."] [%eval 1.12] [%csl Gd4] }
  6... d6 { [%txt "Les Noirs se développent calmement : c'est le moindre mal."] [%eval 1.25] }
  (6... c5 { [%txt "Ce coup chasse la dame, mais il affaiblit d5 et d6 pour toujours et laisse un pion d arriéré."] [%eval 1.94] }
    7. Qe3 { [%txt "La dame recule vers g3, d'où elle visera g7. Le moteur juge 7.Qd3, qui surveille d6, encore un peu plus précis."] [%eval 1.44] }
    7... d6 { [%txt "Les Noirs couvrent la case d6."] [%eval 1.48] }
    8. Bb5+ { [%txt "On échange le bon fou noir."] [%eval 1.38] }
    8... Bd7 { [%txt "Interposition."] [%eval 1.31] }
    9. Bxd7+ { [%txt "Échange."] [%eval 1.32] }
    9... Qxd7 { [%txt "Reprise forcée."] [%eval 1.33] }
    10. O-O { [%txt "On met le roi à l'abri."] [%eval 1.12] }
    10... Be7 { [%txt "Les Noirs développent."] [%eval 1.13] }
    11. Qg3 { [%txt "La dame vise g7 et d6."] [%eval 0.76] [%cal Gg3g7] }
    11... O-O { [%txt "Roque."] [%eval 0.69] }
    12. Bh6 { [%txt "Le fou attaque g7 : les Noirs doivent réagir. Plus tard, Rad1 mettra le pion d6 arriéré sous pression."] [%eval 0.69] [%csl Rd6] [%cal Gh6g7] })
  7. Bf4 { [%txt "Le coup du moteur : le fou se développe sur une bonne diagonale et prépare le grand roque."] [%eval 1.33] [%cal Gf4d6] }
  7... Be7 { [%txt "Développement."] [%eval 1.20] }
  8. O-O-O { [%txt "Le grand roque : la tour d1 vise d6, les Blancs ont plus d'espace et une initiative claire (+1.2)."] [%eval 1.19] [%cal Gd1d6] })
(5... d6 { [%txt "Solide mais passif : les Noirs empêchent e5 mais ne font aucune pression."] [%eval 0.70] }
  6. Bc4 { [%txt "Le fou prend la diagonale de f7."] [%eval 0.48] [%cal Gc4f7] }
  6... Be7 { [%txt "Développement."] [%eval 0.50] }
  7. O-O { [%txt "Roque."] [%eval 0.45] }
  7... O-O { [%txt "Roque."] [%eval 0.45] }
  8. h3 { [%txt "On interdit ...Bg4 et ...Ng4. Les Blancs gardent le centre pur et peuvent augmenter la pression avec Re1, Be3 puis f4."] [%eval 0.46] })
(5... Nxe4 { [%txt "Le coup incroyable étudié par Emms : le cavalier prend e4 en comptant sur la fourchette ...d5."] [%eval 0.45] }
  6. Nxe4 { [%txt "On prend le cavalier."] [%eval 0.28] }
  6... Qe7 { [%txt "La dame cloue le cavalier e4 sur la colonne e."] [%eval 0.25] [%cal Re7e1] }
  7. f3 { [%txt "On soutient le cavalier cloué."] [%eval 0.25] }
  7... d5 { [%txt "La fourchette du pion : le cavalier e4 est attaqué deux fois."] [%eval 0.30] }
  8. Bb5 { [%txt "Le fou cloue le cavalier c6, qui protège… d4 ! Les Blancs gardent la pièce de plus."] [%eval 0.28] [%cal Gb5c6] })
(5... Be7 { [%txt "Ce coup développe, mais ne conteste rien au centre."] [%eval 0.72] }
  6. Nxc6 { [%txt "On échange d'abord…"] [%eval 0.74] }
  6... bxc6 { [%txt "…la reprise…"] [%eval 1.41] }
  7. e5 { [%txt "…puis le pion chasse le cavalier."] [%eval 1.44] }
  7... Nd5 { [%txt "Le cavalier va au centre."] [%eval 1.50] }
  8. Nxd5 { [%txt "On prend."] [%eval 1.52] }
  8... cxd5 { [%txt "Reprise."] [%eval 1.50] }
  9. Qxd5 { [%txt "Un pion de plus pour les Blancs, sans compensation."] [%eval 1.45] [%csl Gd5] })
(5... d5 { [%txt "Trop tôt : le contre-coup au centre est réfuté."] [%eval 1.28] }
  6. Bb5 { [%txt "On cloue le cavalier c6."] [%eval 1.24] [%cal Gb5c6] }
  6... Bd7 { [%txt "Interposition."] [%eval 1.25] }
  7. exd5 { [%txt "On prend le pion."] [%eval 1.44] }
  7... Nxd4 { [%txt "Les Noirs échangent…"] [%eval 1.33] }
  8. Bxd7+ { [%txt "…on prend avec échec…"] [%eval 1.30] }
  8... Qxd7 { [%txt "…la reprise…"] [%eval 1.36] }
  9. Qxd4 { [%txt "…et les Blancs ont un pion de plus net."] [%eval 1.34] })
6. Nxc6 { [%txt "On échange avant que le cavalier d4 devienne une cible et on prépare Bd3, qui défendra e4 solidement."] [%eval 0.23] }
6... bxc6 { [%txt "Reprise vers le centre : les Noirs préparent ...d5."] [%eval 0.20] }
(6... dxc6 { [%txt "Cette reprise ouvre la colonne d…"] [%eval 0.72] }
  7. Qxd8+ { [%txt "…et l'échange des dames se fait avec échec."] [%eval 0.68] }
  7... Kxd8 { [%txt "Le roi noir a perdu le droit de roquer."] [%eval 0.64] }
  8. Bd2 { [%txt "Emms : le roi noir est mal placé et les Noirs n'ont rien pour compenser la meilleure structure blanche. Le chapitre surprise 2 montre comment gagner cette finale."] [%eval 0.61] [%csl Rd8] })
7. Bd3 { [%txt "Le fou défend e4 et prépare le petit roque."] [%eval 0.17] [%cal Gd3e4] }
7... d5 { [%txt "Le coup le plus joué, de loin."] [%eval 0.20] [%cal Rd5e4] }
(7... d6 { [%txt "Moins forcé, plus original."] [%eval 0.46] }
  8. O-O { [%txt "Roque."] [%eval 0.50] }
  8... O-O { [%txt "Roque."] [%eval 0.47] }
  9. Bg5 { [%txt "Maintenant que le roi noir est en g8, le clouage gêne beaucoup : ...h6 et ...g5 affaibliraient son propre roi."] [%eval 0.54] [%cal Gg5f6] }
  9... h6 { [%txt "Les Noirs questionnent le fou."] [%eval 0.45] }
  10. Bh4 { [%txt "On maintient le clouage. Avancer ...g5 maintenant ouvrirait le roi noir."] [%eval 0.49] })
(7... O-O { [%txt "Les Noirs gardent le choix entre ...d5 et ...d6."] [%eval 0.17] }
  8. O-O { [%txt "Roque."] [%eval 0.14] }
  8... d5 { [%txt "Retour aux lignes principales."] [%eval 0.16] }
  9. exd5 { [%txt "On prend."] [%eval 0.22] }
  9... cxd5 { [%txt "Reprise."] [%eval 0.21] }
  10. Bg5 { [%txt "Même position que la ligne principale : le clouage du cavalier f6."] [%eval 0.13] })
8. exd5 { [%txt "On ouvre la colonne e pendant que le roi noir est encore en e8."] [%eval 0.20] [%cal Ge1e8] }
8... cxd5 { [%txt "La reprise habituelle : les Noirs défont leurs pions doublés et forment le duo c-d."] [%eval 0.19] }
(8... Qe7+ { [%txt "L'échec qui gâche la fête : les Blancs doivent proposer l'échange des dames."] [%eval 0.22] }
  9. Qe2 { [%txt "On propose l'échange."] [%eval 0.24] }
  9... cxd5 { [%txt "Reprise au centre."] [%eval 0.41] }
  10. Qxe7+ { [%txt "On échange."] [%eval 0.35] }
  10... Kxe7 { [%txt "Le roi reprend."] [%eval 0.39] }
  11. Bd2 { [%txt "On développe et on prépare le grand roque."] [%eval 0.28] }
  11... c6 { [%txt "Les Noirs consolident d5."] [%eval 0.30] }
  12. O-O-O { [%txt "Le roi rejoint l'aile dame."] [%eval 0.30] }
  12... Rd8 { [%txt "La tour prend la colonne d."] [%eval 0.37] }
  13. Rhe1+ { [%txt "Le moteur commence par l'échec : la tour prend la colonne e avec gain de temps. Le plan d'Emms suit : Na4, échange des fous de cases noires, puis cavalier en c5."] [%eval 0.44] [%cal Ge1e7] })
(8... Nxd5 { [%txt "Le cavalier reprend en visant c3."] [%eval 0.82] }
  9. O-O { [%txt "Le sacrifice de pion recommandé par Emms."] [%eval 0.79] }
  9... Nxc3 { [%txt "Les Noirs prennent…"] [%eval 0.99] }
  10. bxc3 { [%txt "…on reprend…"] [%eval 1.15] }
  10... Bxc3 { [%txt "…et ils gagnent un pion."] [%eval 2.42] }
  11. Ba3 { [%txt "Le fou empêche le roque : le roi noir reste au centre face à Re1 et Qf3."] [%eval 2.67] [%cal Ga3f8] })
9. O-O { [%txt "On met le roi à l'abri et on prépare Re1."] [%eval 0.18] }
9... O-O { [%txt "Les Noirs roquent aussi."] [%eval 0.12] }
10. Bg5 { [%txt "Le seul vrai essai pour un avantage selon Emms : le fou cloue le cavalier f6, qui défend d5."] [%eval 0.06] [%cal Gg5f6,Gf6d5] }
10... c6 { [%txt "Les Noirs consolident d5 avant que Bxf6 ne supprime son défenseur."] [%eval 0.06] [%csl Rd5] }
(10... h6 { [%txt "Ce coup oublie la menace créée par Bg5."] [%eval 1.19] }
  11. Bxf6 { [%txt "On supprime le défenseur de d5…"] [%eval 1.24] }
  11... Qxf6 { [%txt "…la reprise…"] [%eval 1.31] }
  12. Nxd5 { [%txt "…et le pion d5 tombe avec attaque sur la dame."] [%eval 1.32] }
  12... Qd6 { [%txt "La dame s'écarte et attaque le cavalier d5."] [%eval 1.71] }
  13. Nxb4 { [%txt "On prend le fou."] [%eval 1.67] }
  13... Qxb4 { [%txt "La reprise : les Blancs ont un pion de plus."] [%eval 1.58] })
(10... Be7 { [%txt "Le fou décloue, mais il devient passif."] [%eval 0.23] }
  11. Re1 { [%txt "Le coup du moteur : la tour prend la colonne e, face au fou e7. Attention, 11.Bxf6 Bxf6 12.Nxd5 ne gagne rien, car 12...Bxb2 reprend le pion."] [%eval 0.18] [%cal Ge1e7] }
  11... Be6 { [%txt "Les Noirs protègent d5 une deuxième fois."] [%eval 0.17] }
  12. Ne2 { [%txt "Le cavalier se replace vers d4 ou f4, d'où il visera e6 et d5."] [%eval 0.21] [%cal Ge2d4] })
(10... Be6 { [%txt "L'autre façon de protéger d5."] [%eval 0.11] }
  11. h3 { [%txt "Le coup du moteur : on interdit ...Ng4 et ...Bg4 avant de placer la dame."] [%eval 0.05] }
  11... c5 { [%txt "Les Noirs gagnent de l'espace au centre."] [%eval 0.09] }
  12. Qf3 { [%txt "La dame augmente la pression sur f6 et d5."] [%eval 0.11] [%cal Gf3f6,Gf3d5] })
11. Qf3 { [%txt "La ligne principale traditionnelle : la dame ajoute sa pression sur f6 et d5 et regarde l'aile roi."] [%eval 0.07] [%cal Gf3f6,Gf3d5] }
11... Be7 { [%txt "Le fou décloue le cavalier : c'est le coup le plus ambitieux selon Emms, car il refuse la finale égale après Bxf6."] [%eval 0.23] }
(11... Bd6 { [%txt "Les Noirs laissent la prise en f6."] [%eval 0.08] }
  12. h3 { [%txt "On empêche ...Bg4 une fois pour toutes."] [%eval 0.09] }
  12... Rb8 { [%txt "La tour vise b2."] [%eval 0.18] }
  13. b3 { [%txt "On protège b2 par un pion, ce qui laisse la tour a1 libre."] [%eval 0.15] }
  13... h6 { [%txt "Les Noirs questionnent le fou."] [%eval 0.15] }
  14. Bf4 { [%txt "On propose l'échange du fou d6, le meilleur défenseur des cases noires. Après 14.Bxf6 Qxf6 15.Qxf6 gxf6, la finale est égale."] [%eval 0.18] [%cal Gf4d6] })
(11... Bg4 { [%txt "Une gaffe classique."] [%eval 3.85] }
  12. Bxf6 { [%txt "Le fou prend f6 avec attaque sur la dame…"] [%eval 3.76] }
  12... Bxf3 { [%txt "…les Noirs prennent la dame…"] [%eval 3.80] }
  13. Bxd8 { [%txt "…on prend la leur…"] [%eval 3.87] }
  13... Raxd8 { [%txt "…ils reprennent…"] [%eval 4.12] }
  14. gxf3 { [%txt "…et les Blancs ont gagné une pièce."] [%eval 4.20] })
(11... Rb8 { [%txt "La tour vise b2."] [%eval 0.20] }
  12. h3 { [%txt "Le moteur préfère d'abord ce coup utile : ...Bg4 est interdit, et le roi a une case de fuite. Na4-c5 viendra ensuite."] [%eval 0.20] })
12. Rae1 { [%txt "La tour a1 prend la colonne e et attaque le fou e7. On garde la tour f1 pour soutenir f4 plus tard."] [%eval 0.14] [%cal Ge1e7] }
12... Rb8 { [%txt "La tour noire utilise la colonne b semi-ouverte contre b2."] [%eval 0.19] [%cal Rb8b2] }
(12... Re8 { [%txt "Le coup prophylactique : le fou e7 est défendu."] [%eval 0.32] }
  13. h3 { [%txt "Un coup utile : ...Bg4 est interdit et le roi a une case de fuite."] [%eval 0.32] })
(12... h6 { [%txt "Objectivement jouable, mais un piège pratique : les Blancs peuvent sacrifier."] [%eval 1.22] }
  13. Bxh6 { [%txt "Le sacrifice : on ouvre le roi noir. Le chapitre surprise 1 montre la suite complète."] [%eval 1.44] }
  13... gxh6 { [%txt "Reprise."] [%eval 1.63] }
  14. Qe3 { [%txt "Double attaque sur e7 et h6."] [%eval 1.65] [%cal Ge3e7,Ge3h6] }
  14... d4 { [%txt "La meilleure défense : le pion attaque à la fois la dame e3 et le cavalier c3."] [%eval 1.72] }
  15. Qxh6 { [%txt "On prend le pion."] [%eval 1.71] }
  15... Qd6 { [%txt "La dame empêche Re5. Emms pensait que les Blancs devaient se contenter de l'échec perpétuel ; Stockfish 18 trouve 16.Qg5+ Kh8 17.Na4 et donne environ +1.8 aux Blancs."] [%eval 1.81] })
13. Na4 { [%txt "Le cavalier va vers c5, l'avant-poste que plus aucun pion noir ne peut chasser. Il évite aussi ...Rb4 et ...d4 avec gain de temps.

PRO TIP : la feuille de route après la théorie.
1. Installer un cavalier en c5 (Na4-c5), puis jouer b3 et Bd4 ou Bf4. Le cavalier bloque ...c5 et frappe d7, e6 et b7.
2. Viser d5 : Bxf6 supprime son défenseur, puis on double sur la colonne d et on prépare le levier c4.
3. Tenir la colonne e (Re1, Re3 vers g3 ou h3) pour attaquer le roi si les Noirs restent passifs.
À empêcher : ...c5-c4 et ...d4, qui rendraient le duo noir mobile. On bloque sur les cases devant ces pions (c5 et d4)."] [%eval 0.21] [%csl Gc5,Rd5,Rc6] [%cal Ga4c5] } *`,
    ),
    chapter(
      "Branche B : 4...Bc5 5.Nxc6 Qf6 6.Qf3, toutes les réponses noires",
      `{ [%txt "La défense classique : le fou c5 attaque le cavalier d4 et vise f2. On simplifie par 5.Nxc6, puis on pare la menace de mat par 6.Qf3, qui propose l'échange des dames. Emms rappelle que l'échange des dames favorise en général les Blancs dans cette variante : le développement rapide des Noirs perd de sa force, et la meilleure structure blanche compte davantage. À chaque coup noir, l'arbre donne les réponses de club et notre réplique."] [%eval 0.43] }
1. e4 { [%txt "On occupe le centre."] [%eval 0.41] [%csl Ge4] }
1... e5 { [%txt "Symétrie."] [%eval 0.39] }
2. Nf3 { [%txt "On attaque e5."] [%eval 0.38] [%cal Gf3e5] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.40] }
3. d4 { [%txt "On ouvre le centre."] [%eval 0.12] [%cal Gd4e5] }
3... exd4 { [%txt "Les Noirs prennent."] [%eval 0.09] }
4. Nxd4 { [%txt "Reprise par une pièce."] [%eval 0.15] }
4... Bc5 { [%txt "Le fou attaque le cavalier d4 une deuxième fois : le cavalier c6 et le fou c5 contre la seule dame d1."] [%eval 0.38] [%cal Rc5d4,Rc6d4] }
5. Nxc6 { [%txt "On règle la tension tout de suite, sans théorie à apprendre : c'est la réponse la plus simple selon Emms."] [%eval 0.19] }
5... Qf6 { [%txt "Le coup intermédiaire : ...Qxf2 serait mat, car le fou c5 protège f2."] [%eval 0.21] [%csl Rf2] [%cal Rf6f2,Rc5f2] }
(5... bxc6 { [%txt "Reprise simple, peu jouée mais saine."] [%eval 0.47] }
  6. Bd3 { [%txt "On défend e4 et on prépare le roque."] [%eval 0.43] }
  6... d6 { [%txt "Le pion libère le fou c8."] [%eval 0.44] }
  7. O-O { [%txt "Roque."] [%eval 0.43] }
  7... Nf6 { [%txt "Développement."] [%eval 0.51] }
  8. Nc3 { [%txt "Développement : les Blancs gardent le centre pur e4 contre d6 et plus d'espace."] [%eval 0.43] }
  8... O-O { [%txt "Roque."] [%eval 0.61] })
(5... dxc6 { [%txt "Cette reprise permet l'échange des dames avec échec."] [%eval 0.66] }
  6. Qxd8+ { [%txt "On échange…"] [%eval 0.65] }
  6... Kxd8 { [%txt "…et le roi noir est coincé au centre."] [%eval 0.65] }
  7. Nc3 { [%txt "Emms : une version nettement inférieure pour les Noirs de la finale de majorité. Les Blancs ont l'aile roi majoritaire et un roi en sécurité."] [%eval 0.69] [%csl Rd8] })
(5... Bxf2+ { [%txt "Un faux sacrifice : les Noirs donnent le fou pour un pion et un échec."] [%eval 4.17] }
  6. Kxf2 { [%txt "On prend."] [%eval 4.20] }
  6... Qf6+ { [%txt "L'échec avec la dame."] [%eval 4.37] }
  7. Qf3 { [%txt "On interpose la dame, qui propose l'échange."] [%eval 4.30] }
  7... Qxc6 { [%txt "Les Noirs récupèrent le cavalier, mais restent avec une pièce de moins pour un seul pion."] [%eval 4.44] })
(5... Qh4 { [%txt "La dame attaque e4 et f2, mais oublie de reprendre la pièce."] [%eval 3.74] }
  6. Nd4 { [%txt "Le cavalier rentre au centre avec une pièce de plus : en d4, il coupe aussi la diagonale c5-f2 du fou noir. Plus de mat possible en f2 (+3.8)."] [%eval 3.72] [%csl Gd4] [%cal Rc5f2] })
6. Qf3 { [%txt "On pare le mat et on propose l'échange des dames. Le moteur préfère ce coup à 6.Qd2 (le choix de Kasparov, plus théorique)."] [%eval 0.16] [%cal Gf3f2] }
6... bxc6 { [%txt "Les Noirs reprennent vers le centre et gardent la dame."] [%eval 0.24] }
(6... Qxf3 { [%txt "L'échange tout de suite abîme notre aile roi…"] [%eval 0.23] }
  7. gxf3 { [%txt "…la reprise est forcée, mais la colonne g s'ouvre pour notre tour."] [%eval 0.23] }
  7... bxc6 { [%txt "Les Noirs reprennent."] [%eval 0.23] }
  8. Rg1 { [%txt "La tour attaque g7 tout de suite. Attention, 9.Rxg7 serait une erreur après ...Ng6, qui enferme la tour."] [%eval 0.22] [%cal Gg1g7] }
  8... Ne7 { [%txt "Le cavalier défend g6 et g8."] [%eval 0.43] }
  9. Be3 { [%txt "On propose l'échange du fou c5. C'est la partie Tseshkovsky-Morozevich (2004), reprise en entier dans le chapitre surprise 4."] [%eval 0.45] [%cal Ge3c5] })
(6... dxc6 { [%txt "Cette reprise ouvre la diagonale du fou c8 et donne la structure de majorité."] [%eval 0.45] }
  7. Nc3 { [%txt "Le moteur garde les dames : échanger en f6 développerait le cavalier noir avec un jeu actif."] [%eval 0.33] [%cal Gc3e4] }
  7... Be6 { [%txt "Le fou se développe."] [%eval 0.36] }
  8. Be3 { [%txt "On propose l'échange du fou c5."] [%eval 0.48] [%cal Ge3c5] }
  8... Bb6 { [%txt "Le fou garde la diagonale."] [%eval 0.54] }
  9. Bd3 { [%txt "Développement : la majorité blanche à l'aile roi (e4, f2, g2, h2 contre f7, g7, h7) comptera dans toute finale."] [%eval 0.35] })
(6... Qxc6 { [%txt "Les Noirs gardent les dames, mais la dame est mal placée en c6."] [%eval 0.87] }
  7. Nc3 { [%txt "Développement : Bb5 et Nd5 menacent de gagner du temps sur la dame."] [%eval 0.96] }
  7... Nf6 { [%txt "Développement."] [%eval 0.86] }
  8. e5 { [%txt "Le coup du moteur : le pion chasse le cavalier, la case d5 s'ouvre pour notre cavalier."] [%eval 1.03] [%cal Ge5f6,Gc3d5] }
  8... Qxf3 { [%txt "Les Noirs échangent."] [%eval 0.88] }
  9. gxf3 { [%txt "Reprise."] [%eval 0.86] }
  9... Nh5 { [%txt "Le cavalier part au bord."] [%eval 0.94] }
  10. Nd5 { [%txt "Le cavalier menace Nxc7+, avec fourchette sur le roi et la tour."] [%eval 0.89] [%cal Gd5c7] }
  10... Kd8 { [%txt "Le roi défend c7 et perd le roque : les Blancs ont un net avantage de développement."] [%eval 0.87] })
7. Nd2 { [%txt "Le cavalier se dirige vers b3 pour chasser le fou c5 avec gain de temps. En c3, il pourrait subir ...Bd4."] [%eval 0.27] [%cal Gd2b3] }
7... d6 { [%txt "Le pion libère le fou c8."] [%eval 0.24] }
(7... Ne7 { [%txt "Développement, mais le cavalier ne défend plus la dame f6."] [%eval 0.44] }
  8. Qxf6 { [%txt "Le moteur échange tout de suite : le cavalier e7 ne peut pas reprendre en f6. (8.Nb3 Bb6 9.Bd2 laisserait les Noirs égaliser.)"] [%eval 0.39] }
  8... gxf6 { [%txt "Reprise forcée : les pions f noirs sont doublés et isolés."] [%eval 0.47] [%csl Rf6,Rf7] }
  9. Nc4 { [%txt "Le cavalier vise d6 et e3 ; Be3 suivra pour échanger le fou c5. Les Blancs ont la meilleure structure (+0.5)."] [%eval 0.54] [%cal Gc4d6] })
(7... Qxf3 { [%txt "Les Noirs échangent tout de suite."] [%eval 0.30] }
  8. Nxf3 { [%txt "Le cavalier reprend et garde notre structure intacte."] [%eval 0.12] }
  8... d6 { [%txt "Le pion libère le fou c8."] [%eval 0.14] }
  9. Bd3 { [%txt "Développement : les pions c doublés seront la cible de la finale."] [%eval 0.08] })
8. Nb3 { [%txt "Gain de temps sur le fou."] [%eval 0.23] [%cal Gb3c5] }
8... Bb6 { [%txt "Le fou garde la diagonale a7-g1, toujours tournée vers f2."] [%eval 0.27] [%cal Rb6f2] }
(8... Bb4+ { [%txt "L'échec ne sert à rien…"] [%eval 2.47] }
  9. c3 { [%txt "…le fou doit reculer encore."] [%eval 2.53] }
  9... Qxf3 { [%txt "Les Noirs échangent."] [%eval 2.94] }
  10. gxf3 { [%txt "Reprise : le fou b4 est attaqué et la colonne g est à nous."] [%eval 3.13] })
9. Bd2 { [%txt "On prépare Bc3 contre g7 et f6, et le grand roque."] [%eval 0.22] }
9... Qxf3 { [%txt "Les Noirs échangent les dames."] [%eval 0.24] }
(9... Ne7 { [%txt "Une erreur fréquente : ce coup laisse la dame f6 défendue une seule fois…"] [%eval 0.92] }
  10. Qxf6 { [%txt "…et on échange tout de suite."] [%eval 0.98] }
  10... gxf6 { [%txt "La reprise est forcée : la structure noire est abîmée."] [%eval 0.86] }
  11. Bc3 { [%txt "Le fou attaque f6."] [%eval 1.01] [%cal Gc3f6] }
  11... Rg8 { [%txt "La tour cherche du contre-jeu sur la colonne g."] [%eval 0.92] }
  12. Bxf6 { [%txt "Les Blancs gagnent un pion net."] [%eval 0.99] [%csl Gf6] })
(9... Qg6 { [%txt "Les Noirs évitent l'échange."] [%eval 0.72] }
  10. Bd3 { [%txt "On développe en défendant e4 : le grand roque suit, et la dame noire n'a rien à attaquer."] [%eval 0.60] })
10. gxf3 { [%txt "La reprise est forcée. La colonne g s'ouvre pour notre tour."] [%eval 0.24] [%cal Gh1g1] }
10... a5 { [%txt "Les Noirs préparent ...a4, qui chasserait le cavalier b3."] [%eval 0.25] [%cal Ra5a4] }
11. a4 { [%txt "On bloque le pion et on le fixe en a5."] [%eval 0.21] }
11... Ne7 { [%txt "Le cavalier se développe."] [%eval 0.30] }
12. Be3 { [%txt "On propose l'échange du fou b6, la meilleure pièce noire."] [%eval 0.16] [%cal Ge3b6] }
12... Bxe3 { [%txt "Les Noirs échangent."] [%eval 0.16] }
13. fxe3 { [%txt "On reprend vers le centre : le pion e3 contrôle d4, la future case du cavalier.

PRO TIP : la feuille de route après la théorie.
1. Colonne g ouverte : Rg1 contre g7, puis Rg5 ou Rg3.
2. Les pions c doublés : un cavalier en d4 contre c6, le roi en d2 ou le grand roque, puis Rd1 contre d6.
3. Les leviers f4-f5 et c4-c5 ouvrent des lignes et fixent les faiblesses noires."] [%eval 0.18] [%csl Gd4,Rc6,Rc7] [%cal Gb3d4] } *`,
    ),
    chapter(
      "Anti-panique : les pièges des coups rares",
      `{ [%txt "À 1500 Elo, les adversaires sortent souvent de la théorie au 4e coup. Chaque déviation viole un principe : il faut savoir lequel, et la réponse précise qui le punit. La ligne principale traite 4...Qh4, la sortie de dame la plus dangereuse ; les variantes traitent 4...Nxd4, 4...Bb4+ et le piège de mat de 4...Nge7."] [%eval 0.43] }
1. e4 { [%txt "On occupe le centre."] [%eval 0.41] [%csl Ge4] }
1... e5 { [%txt "Symétrie."] [%eval 0.39] }
2. Nf3 { [%txt "On attaque e5."] [%eval 0.38] [%cal Gf3e5] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.40] }
3. d4 { [%txt "On ouvre le centre."] [%eval 0.12] [%cal Gd4e5] }
3... exd4 { [%txt "Les Noirs prennent."] [%eval 0.09] }
4. Nxd4 { [%txt "Reprise par une pièce."] [%eval 0.15] }
4... Qh4 { [%txt "La sortie de dame la plus agressive : e4 est attaqué. Emms ne la recommande pas aux Noirs, mais elle est piégeuse si on ne la connaît pas. Principe violé : la dame sort avant les pièces légères."] [%eval 0.74] [%cal Rh4e4] }
(4... Nxd4 { [%txt "L'échange que les joueurs de club adorent : ils pensent gagner du temps contre la dame."] [%eval 0.57] }
  5. Qxd4 { [%txt "La dame centralisée ne craint rien : aucun cavalier c6 ne peut plus la chasser."] [%eval 0.57] [%csl Gd4] }
  5... Qf6 { [%txt "Les Noirs proposent l'échange des dames."] [%eval 0.65] }
  (5... d6 { [%txt "Les Noirs empêchent e5, mais s'enferment : voir le chapitre surprise 3, où l'on étouffe ce camp."] [%eval 1.17] }
    6. Nc3 { [%txt "Développement : les Blancs préparent Be2, Bd2 et le grand roque."] [%eval 1.17] })
  6. e5 { [%txt "Lane : on ne prend pas en f6, ce qui développerait le cavalier noir. Le pion chasse la dame avec gain de temps."] [%eval 0.54] [%cal Ge5f6] }
  6... Qb6 { [%txt "La dame propose encore l'échange."] [%eval 0.58] }
  7. Qxb6 { [%txt "Cette fois on échange : la finale est facile pour les Blancs."] [%eval 0.50] }
  7... axb6 { [%txt "Reprise : les pions b noirs sont doublés."] [%eval 0.53] }
  8. Nc3 { [%txt "Développement, avec l'idée Nb5 contre c7."] [%eval 0.57] [%cal Gc3b5] }
  8... Bb4 { [%txt "Les Noirs clouent le cavalier."] [%eval 0.73] }
  9. Bd2 { [%txt "On décloue : les Blancs se développent plus facilement et gardent l'idée Nb5 (Lane)."] [%eval 0.71] })
(4... Bb4+ { [%txt "L'échec de Tony Miles : il pousse les Blancs à jouer c3, qui enlève la case c3 au cavalier b1."] [%eval 0.33] }
  5. c3 { [%txt "La seule façon d'essayer de punir l'échec, selon Emms."] [%eval 0.44] }
  5... Bc5 { [%txt "Le fou revient sur la diagonale de f2."] [%eval 0.52] }
  (5... Be7 { [%txt "Le repli passif."] [%eval 0.70] }
    6. Nxc6 { [%txt "On échange."] [%eval 0.63] }
    6... bxc6 { [%txt "Reprise."] [%eval 0.65] }
    7. Bc4 { [%txt "Le fou vise f7."] [%eval 0.54] [%cal Gc4f7] }
    7... d6 { [%txt "Les Noirs libèrent le fou c8, mais oublient f7."] [%eval 1.09] }
    8. Qb3 { [%txt "La dame et le fou attaquent f7 ensemble."] [%eval 1.14] [%cal Gb3f7,Gc4f7] }
    8... Nf6 { [%txt "Les Noirs développent."] [%eval 0.97] }
    9. Bxf7+ { [%txt "On prend le pion avec échec."] [%eval 0.88] }
    9... Kf8 { [%txt "Le roi ne peut plus roquer."] [%eval 0.87] }
    10. Be6 { [%txt "Emms : on échange le fou c8 avant que le fou f7 ne soit pris au piège. Le roi noir restera mal placé."] [%eval 0.90] })
  6. Be3 { [%txt "On protège d4 : maintenant c3 aide les Blancs, comme dans les lignes 4...Bc5 5.Be3."] [%eval 0.68] }
  6... Bb6 { [%txt "Le fou s'écarte de la menace Nxc6."] [%eval 0.66] }
  7. Nf5 { [%txt "Le coup du moteur : le cavalier attaque g7 et propose de prendre le fou b6. La nouveauté de Kasparov, 7.Qg4, ne donne rien selon Stockfish 18 : après 7...Nf6! 8.Qxg7 Rg8 9.Qh6 d5, les Noirs ont un jeu actif pour le pion."] [%eval 0.52] [%cal Gf5g7] }
  7... g6 { [%txt "Les Noirs chassent le cavalier."] [%eval 0.63] }
  8. Bxb6 { [%txt "On échange le fou b6, la meilleure pièce noire."] [%eval 0.64] }
  8... axb6 { [%txt "Reprise : pions b doublés."] [%eval 0.64] }
  9. Ne3 { [%txt "Le cavalier revient au centre et contrôle d5 et g4. Les Blancs gardent le centre pur et une petite avance (+0.7)."] [%eval 0.69] [%csl Gd5] })
(4... Nge7 { [%txt "Le plan : ...Nxd4 puis ...Nc6."] [%eval 1.23] }
  5. Nc3 { [%txt "Développement."] [%eval 1.13] }
  5... g6 { [%txt "La gaffe qu'Emms signale : le fou veut aller en g7, mais il y a un mat."] [%eval 3.43] }
  6. Bg5 { [%txt "Le fou cloue le cavalier e7 sur la dame d8."] [%eval 3.38] [%cal Gg5e7] }
  6... Bg7 { [%txt "Les Noirs continuent leur idée."] [%eval 3.38] }
  7. Nd5 { [%txt "Le cavalier menace Nf6+ et attaque le cavalier e7 cloué."] [%eval 3.45] [%cal Gd5f6] }
  7... Bxd4 { [%txt "Les Noirs prennent le cavalier d4…"] [%eval 6.30] }
  8. Qxd4 { [%txt "…et on sacrifie la dame !"] [%eval 6.31] }
  8... Nxd4 { [%txt "Les Noirs prennent la dame."] [%eval #2] }
  9. Nf6+ { [%txt "L'échec du cavalier."] [%eval #1] }
  9... Kf8 { [%txt "Le seul coup."] [%eval #1] }
  10. Bh6# { [%txt "Mat : le roi n'a plus de case. Le cavalier f6 couvre g8 et h7, le fou h6 couvre g7 et f8."] [%eval #0] [%csl Rf8] })
5. Nc3 { [%txt "La réponse d'Emms : on développe en limitant les ruses noires. 5.Nb5 contre c7 est aussi possible."] [%eval 0.70] }
5... Bb4 { [%txt "Le seul coup cohérent : le fou cloue le cavalier et renouvelle l'attaque sur e4."] [%eval 0.70] }
6. Be2 { [%txt "On laisse e4 en prise, exprès : le développement compte plus que le pion."] [%eval 0.68] }
6... Qxe4 { [%txt "Les Noirs prennent le pion. (6...Nf6 7.O-O mène au chapitre surprise 5, une attaque de mat.)"] [%eval 0.71] }
7. Nb5 { [%txt "Le cavalier d4 attaque c7 : fourchette menacée sur le roi et la tour a8. Le cavalier c3 est cloué, c'est donc bien celui de d4 qui saute."] [%eval 0.76] [%cal Gb5c7,Gc7a8] }
7... Bxc3+ { [%txt "Les Noirs échangent d'abord. Défendre c7 par 7...Ba5 ne marche pas : 8.Nxc7+ et le fou surchargé ne peut pas tout tenir."] [%eval 0.76] }
8. bxc3 { [%txt "On reprend vers le centre."] [%eval 0.71] }
8... Kd8 { [%txt "La seule défense de c7 : le roi. Les Noirs ont un pion de plus, mais leur roi est coincé au centre pour longtemps."] [%eval 0.71] [%csl Rd8] }
9. O-O { [%txt "On met le roi à l'abri et on prépare Re1 et Bf3."] [%eval 0.74] }
9... a6 { [%txt "Les Noirs chassent le cavalier."] [%eval 1.26] }
10. Bf3 { [%txt "Le coup du moteur, joué par Oral contre Kantorik (2000) : le fou chasse la dame avec gain de temps et vise la grande diagonale."] [%eval 1.20] [%cal Gf3c6] }
10... Qf5 { [%txt "La meilleure retraite : la dame surveille c2 et f7."] [%eval 1.50] }
(10... Qc4 { [%txt "Le recul naturel… qui perd."] [%eval 1.48] }
  11. Nd6 { [%txt "Le coup brillant cité par Emms : le cavalier se sacrifie pour ouvrir la colonne d vers le roi d8."] [%eval 1.30] [%cal Gd1d8] }
  11... cxd6 { [%txt "Les Noirs prennent : ils ont une pièce de plus."] [%eval 0.93] }
  12. Qxd6 { [%txt "Mais la dame s'installe en d6 : Qf8+, Be3-b6+ et Bf4 suivi de Qc7+ menacent, et les Noirs n'ont aucune pièce développée sur l'aile dame. Ils ont perdu quelques coups plus tard."] [%eval 1.14] [%csl Rd8] [%cal Gd6f8] })
11. Nd4 { [%txt "Le cavalier se centralise. Emms : les Blancs ne sont pas pressés, les problèmes du roi noir ne disparaîtront pas tout seuls. Re1, Bf4 et Rb1 suivront.

PRO TIP : contre les coups passifs, prends l'espace. Contre les sorties de dame précoces, développe-toi en créant des menaces. Contre les échanges prématurés, centralise la pièce qui reprend."] [%eval 1.44] [%csl Gd4] } *`,
    ),
    chapter(
      "Surprise 1 : 12...h6?! 13.Bxh6, la marche du roi noir vers le mat",
      `{ [%txt "ALÉATOIRE SURPRISE. Dans la ligne principale de la branche A, l'adversaire chasse le fou par 12...h6, un coup naturel. Mais avec la dame en f3 et une tour en e1, les Blancs peuvent sacrifier le fou en h6 pour ouvrir le roi noir. Emms cite Ardeleanu-Vajda (Iasi 1999). Regarde comment les Blancs ne se contentent pas d'un échec perpétuel : ils amènent une pièce de plus (la tour e1 vers e3 puis g3) avant de porter le coup."] [%eval 0.43] }
1. e4 { [%txt "On occupe le centre."] [%eval 0.41] [%csl Ge4] }
1... e5 { [%txt "Symétrie."] [%eval 0.39] }
2. Nf3 { [%txt "On attaque e5."] [%eval 0.38] [%cal Gf3e5] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.40] }
3. d4 { [%txt "On ouvre le centre."] [%eval 0.12] [%cal Gd4e5] }
3... exd4 { [%txt "Les Noirs prennent."] [%eval 0.09] }
4. Nxd4 { [%txt "Reprise par une pièce."] [%eval 0.15] }
4... Nf6 { [%txt "Attaque sur e4."] [%eval 0.24] [%cal Rf6e4] }
5. Nc3 { [%txt "On défend e4."] [%eval 0.09] }
5... Bb4 { [%txt "Clouage."] [%eval 0.14] [%cal Rb4c3] }
6. Nxc6 { [%txt "On échange."] [%eval 0.23] }
6... bxc6 { [%txt "Reprise vers le centre."] [%eval 0.20] }
7. Bd3 { [%txt "Le fou défend e4."] [%eval 0.17] }
7... d5 { [%txt "Contre-coup central."] [%eval 0.20] }
8. exd5 { [%txt "On ouvre la colonne e."] [%eval 0.20] }
8... cxd5 { [%txt "Reprise."] [%eval 0.19] }
9. O-O { [%txt "Roque."] [%eval 0.18] }
9... O-O { [%txt "Roque."] [%eval 0.12] }
10. Bg5 { [%txt "Clouage du cavalier f6."] [%eval 0.06] [%cal Gg5f6] }
10... c6 { [%txt "Consolidation de d5."] [%eval 0.06] }
11. Qf3 { [%txt "La dame vise f6 et l'aile roi."] [%eval 0.07] [%cal Gf3f6] }
11... Be7 { [%txt "Le fou décloue."] [%eval 0.23] }
12. Rae1 { [%txt "La tour sur la colonne e : fin de la théorie. Retiens bien pourquoi c'est la tour a1 qui vient en e1 : la tour f1 reste libre de soutenir f4 ou d'aller en e1 plus tard."] [%eval 0.14] [%cal Ge1e7] }
12... h6 { [%txt "LA FAUTE PRATIQUE. Le coup chasse le fou, mais affaiblit le roi noir : le pion h6 n'est défendu que par le pion g7."] [%eval 1.22] [%csl Rh6] }
13. Bxh6 { [%txt "Le sacrifice. On donne le fou pour deux pions et un roi ouvert. Le moteur donne déjà environ +1.4."] [%eval 1.44] [%cal Gg5h6] }
13... gxh6 { [%txt "Les Noirs acceptent. Refuser laisserait simplement un pion de moins et un roi affaibli."] [%eval 1.63] }
14. Qe3 { [%txt "L'idée clé : une double attaque sur le fou e7 et le pion h6. Les Noirs ne peuvent pas tout défendre."] [%eval 1.65] [%cal Ge3e7,Ge3h6] }
14... Re8 { [%txt "Le coup naturel : la tour défend le fou e7. Selon Emms, les Noirs sont probablement déjà perdus."] [%eval 2.43] }
(14... d4 { [%txt "La meilleure défense : le pion attaque à la fois la dame et le cavalier c3."] [%eval 1.72] }
  15. Qxh6 { [%txt "La dame prend h6 et s'installe devant le roi."] [%eval 1.71] }
  15... Qd6 { [%txt "La dame empêche Re5, qui menaçait Rg5+."] [%eval 1.81] }
  16. Qg5+ { [%txt "Échec : on chasse le roi dans le coin."] [%eval 1.76] }
  16... Kh8 { [%txt "Le seul coup."] [%eval 1.72] }
  17. Na4 { [%txt "Le cavalier se met à l'abri de ...dxc3 et vise c5. Les Blancs ont deux pions pour la pièce et une attaque durable : environ +1.6 selon Stockfish 18, alors qu'Emms ne voyait qu'une nulle par échec perpétuel."] [%eval 1.61] [%cal Ga4c5] })
15. Qxh6 { [%txt "La dame prend h6 : maintenant Re5 suivi de Rg5+ menace un mat rapide."] [%eval 2.52] [%cal Ge1e5] }
15... Qd6 { [%txt "La dame noire empêche Re5. Bouger le fou e7 ne marche pas : 15...Bb4 16.Rxe8+ Nxe8 17.Bh7+ et le mat arrive en f7."] [%eval 3.48] }
16. Re3 { [%txt "Le renfort : la tour quitte e1 et rejoint l'attaque par la 3e rangée. Emms : ce coup immédiat est plus fort que les répétitions jouées dans la partie. Menace : Rg3+."] [%eval 3.53] [%cal Ge3g3] }
16... Bg4 { [%txt "Le fou se place en g4 pour boucher la colonne g."] [%eval 3.58] }
17. Rg3 { [%txt "La tour attaque le fou g4, qui est cloué sur le roi g8. Menace : Rxg4+ Nxg4 puis Qh7+ et Qh8 mat."] [%eval 3.01] [%cal Gg3g4,Gh6h7] }
17... Qe6 { [%txt "La meilleure défense : la dame protège le fou g4 et la case g6."] [%eval 3.01] }
18. Qg5+ { [%txt "Échec : le roi doit aller dans le coin."] [%eval 3.34] }
18... Kh8 { [%txt "Le seul coup."] [%eval 3.38] }
19. Qh6+ { [%txt "On revient : le roi n'a que g8. Répéter une fois ne coûte rien et garde toutes les menaces."] [%eval 3.43] }
19... Kg8 { [%txt "Retour forcé."] [%eval 3.46] }
20. h3 { [%txt "Un pion attaque le fou g4, cloué sur la colonne g : il ne peut pas s'enfuir."] [%eval 3.39] [%cal Gh3g4,Gg3g8] }
20... Bd6 { [%txt "Les Noirs contre-attaquent la tour g3."] [%eval 3.71] [%cal Rd6g3] }
21. Bh7+ { [%txt "La déviation : le fou attire le cavalier f6 en h7, et le fou g4 perd son défenseur."] [%eval 3.65] [%cal Gd3h7] }
21... Nxh7 { [%txt "Forcé."] [%eval 3.74] }
22. Rxg4+ { [%txt "La tour prend le fou avec échec."] [%eval 3.67] }
22... Qxg4 { [%txt "Les Noirs donnent leur dame pour la tour."] [%eval 3.70] }
23. hxg4 { [%txt "Bilan : dame et deux pions de plus contre tour et fou, et un roi noir sans abri (+3.7).

PRO TIP : la méthode du sacrifice en h6.
1. Le sacrifice Bxh6 ne marche que si une deuxième pièce arrive tout de suite (Qe3 avec double attaque).
2. Ne te contente pas de l'échec perpétuel : cherche le renfort (Re3-g3).
3. Une pièce clouée devant le roi est une cible : attaque-la avec un pion (h3), puis dévie son défenseur (Bh7+)."] [%eval 3.76] [%csl Gg4] } *`,
    ),
    chapter(
      "Surprise 2 : la finale où le roi noir reste au centre",
      `{ [%txt "ALÉATOIRE SURPRISE. Dans la branche A, l'adversaire reprend 6...dxc6 et accepte l'échange des dames. La théorie s'arrête à 8.Bd2 : les Blancs sont un peu mieux, sans plus. La suite est une dérive typique de club : au lieu de se développer, les Noirs poussent un pion de l'aile roi pour faire quelque chose. Regarde comment les Blancs n'attaquent pas au hasard : chaque coup gagne un temps, fixe une faiblesse ou rapproche une pièce, jusqu'à deux pions de plus. Suis la barre d'évaluation : elle monte d'environ +0.6 à +3."] [%eval 0.43] }
1. e4 { [%txt "On occupe le centre."] [%eval 0.41] [%csl Ge4] }
1... e5 { [%txt "Symétrie."] [%eval 0.39] }
2. Nf3 { [%txt "On attaque e5."] [%eval 0.38] [%cal Gf3e5] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.40] }
3. d4 { [%txt "On ouvre le centre."] [%eval 0.12] [%cal Gd4e5] }
3... exd4 { [%txt "Les Noirs prennent."] [%eval 0.09] }
4. Nxd4 { [%txt "Reprise par une pièce."] [%eval 0.15] }
4... Nf6 { [%txt "Attaque sur e4."] [%eval 0.24] [%cal Rf6e4] }
5. Nc3 { [%txt "On défend e4 en développant."] [%eval 0.09] }
5... Bb4 { [%txt "Clouage du cavalier c3."] [%eval 0.14] [%cal Rb4c3] }
6. Nxc6 { [%txt "On échange."] [%eval 0.23] }
6... dxc6 { [%txt "La reprise qui permet l'échange des dames : premier écart des Noirs."] [%eval 0.72] }
7. Qxd8+ { [%txt "On échange avec échec : le roi noir perd le roque."] [%eval 0.68] }
7... Kxd8 { [%txt "Reprise forcée."] [%eval 0.64] [%csl Rd8] }
8. Bd2 { [%txt "Fin de la théorie. Le fou défend c3, et le grand roque mettra une tour sur la colonne d, face au roi noir. Le moteur donne environ +0.6."] [%eval 0.61] [%cal Gd2c3] }
8... h5 { [%txt "LA DÉRIVE. Les Noirs poussent un pion de bord au lieu de développer le fou c8 (8...Be6 était le bon coup). Le roi d8 reste sur la colonne d."] [%eval 0.75] [%csl Rd8,Rc8] }
9. O-O-O { [%txt "On met le roi à l'abri et la tour d1 arrive derrière le fou d2, en face du roi noir : une batterie à la découverte est prête."] [%eval 0.85] [%cal Gd1d8] }
9... h4 { [%txt "Les Noirs continuent leur idée : le pion veut gêner g3. Ce coup ne développe toujours rien."] [%eval 1.01] }
10. Bg5+ { [%txt "L'échec à la découverte : le fou quitte d2, la tour d1 donne échec au roi d8. En même temps, le fou cloue le cavalier f6 sur la diagonale."] [%eval 0.80] [%cal Gd1d8,Gg5f6] }
10... Ke8 { [%txt "Le roi quitte la colonne d."] [%eval 0.74] }
11. e5 { [%txt "On chasse le cavalier f6 avec gain de temps. Le pion e5 prend aussi les cases d6 et f6 aux pièces noires."] [%eval 0.62] [%cal Ge5f6] }
11... Nd5 { [%txt "Le cavalier va au centre, mais il n'y est défendu que par le pion c6 (11...Nd7 était plus solide)."] [%eval 1.23] }
12. Nxd5 { [%txt "On échange le seul défenseur de c7 et de la colonne d."] [%eval 1.31] }
12... cxd5 { [%txt "Reprise forcée : le pion d5 est maintenant isolé sur la colonne ouverte."] [%eval 1.31] [%csl Rd5] }
13. Rxd5 { [%txt "Premier pion gagné : la tour prend d5 et domine la colonne. Barre d'évaluation : environ +1.3."] [%eval 1.30] [%csl Gd5] }
13... Bd7 { [%txt "Les Noirs développent enfin le fou c8."] [%eval 1.43] }
14. Be2 { [%txt "On développe la dernière pièce mineure et on prépare Rhd1. Pas de précipitation : le pion h4 ne s'enfuira pas."] [%eval 1.35] }
14... Bc6 { [%txt "Le fou attaque la tour d5."] [%eval 1.64] [%cal Rc6d5] }
15. Rd4 { [%txt "La tour recule en attaquant deux cibles : le fou b4 et le pion h4."] [%eval 1.60] [%cal Gd4b4,Gd4h4] }
15... Bc5 { [%txt "Le fou s'échappe avec gain de temps sur la tour, mais oublie le pion h4 (15...Be7 était plus tenace)."] [%eval 2.10] }
16. Rxh4 { [%txt "Deuxième pion gagné : la conséquence directe de 8...h5 et 9...h4. Un pion qui avance seul, loin de ses pièces, devient une cible."] [%eval 2.41] [%csl Gh4] }
16... Rg8 { [%txt "Les Noirs évitent l'échange des tours, mais leur tour devient passive en g8."] [%eval 2.96] }
17. f3 { [%txt "Un coup calme : le pion protège e4 et g4 et coupe la diagonale du fou c6. On consolide avant de convertir."] [%eval 3.08] [%cal Gf3e4] }
17... a5 { [%txt "Les Noirs n'ont plus de plan et poussent un pion."] [%eval 3.19] }
18. Bd3 { [%txt "Le fou se place sur la diagonale b1-h7 et vise h7. Les Blancs ont deux pions de plus et toutes leurs pièces actives (+3).

PRO TIP : la méthode contre un adversaire qui dérive.
1. Développe-toi avec gain de temps (O-O-O, Bg5+ à la découverte, e5).
2. Échange le défenseur d'une faiblesse (Nxd5), puis prends la faiblesse (Rxd5).
3. Une pièce qui attaque deux cibles (Rd4) gagne presque toujours l'une d'elles.
4. Un pion avancé seul (h4) loin de ses pièces est une cible, pas une attaque.
5. Une fois le matériel gagné, consolide (f3, Bd3) avant de chercher davantage."] [%eval 3.07] [%cal Gd3h7] } *`,
    ),
    chapter(
      "Surprise 3 : étouffer un adversaire passif (4...Nxd4 5.Qxd4 d6)",
      `{ [%txt "ALÉATOIRE SURPRISE. Après l'échange 4...Nxd4, beaucoup de joueurs de club se replient : ...d6, ...Nf6, ...Be7, ...O-O, puis ils attendent. Lane montre le traitement modèle (Lalic-Gjergji, Olympiade d'Istanbul 2000) : grand roque, puis une marée de pions à l'aile roi (f4, g4, g5, f5) pendant que les Noirs n'ont pas assez d'espace pour se défendre. Regarde comment chaque poussée de pion chasse une pièce noire de sa meilleure case."] [%eval 0.43] }
1. e4 { [%txt "On occupe le centre."] [%eval 0.41] [%csl Ge4] }
1... e5 { [%txt "Symétrie."] [%eval 0.39] }
2. Nf3 { [%txt "On attaque e5."] [%eval 0.38] [%cal Gf3e5] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.40] }
3. d4 { [%txt "On ouvre le centre."] [%eval 0.12] [%cal Gd4e5] }
3... exd4 { [%txt "Les Noirs prennent."] [%eval 0.09] }
4. Nxd4 { [%txt "Reprise par une pièce."] [%eval 0.15] }
4... Nxd4 { [%txt "L'échange prématuré : il développe notre dame."] [%eval 0.57] }
5. Qxd4 { [%txt "La dame centralisée."] [%eval 0.57] [%csl Gd4] }
5... d6 { [%txt "Les Noirs empêchent e5, mais leur fou f8 est enfermé et leur camp manque d'espace."] [%eval 1.17] }
6. Nc3 { [%txt "Développement."] [%eval 1.17] }
6... Nf6 { [%txt "Développement."] [%eval 1.20] }
7. Be2 { [%txt "On développe le fou en gardant la diagonale ouverte pour f4 et g4 plus tard."] [%eval 1.19] }
7... Be7 { [%txt "Les Noirs se développent sans ambition."] [%eval 1.05] }
8. Bd2 { [%txt "Le coup de la partie : il prépare le grand roque. Stockfish préfère 8.Bf4 (environ +1.2 contre +0.6), qui fait la même chose en mettant le fou sur une meilleure diagonale ; le plan qui suit reste valable."] [%eval 0.51] }
8... O-O { [%txt "Le roi noir va à l'aile roi : c'est exactement là que nos pions vont avancer."] [%eval 0.54] }
9. O-O-O { [%txt "Fin de la théorie. Les rois sont sur des ailes opposées : celui qui attaque le premier gagne souvent. Nos pions f, g et h peuvent avancer sans exposer notre roi."] [%eval 0.55] [%csl Gc1,Rg8] }
9... b6 { [%txt "LA DÉRIVE : un fianchetto calme pour viser e4, au lieu d'une vraie contre-attaque à l'aile dame."] [%eval 1.11] }
10. f4 { [%txt "Premier pion de la marée : f4 protège e5 et prépare g4."] [%eval 1.07] [%cal Gf4f5] }
10... Bb7 { [%txt "Le fou vise e4."] [%eval 1.35] [%cal Rb7e4] }
11. Bf3 { [%txt "On protège e4 et on coupe la diagonale du fou b7."] [%eval 1.38] }
11... c5 { [%txt "Les Noirs chassent la dame."] [%eval 1.69] }
12. Qf2 { [%txt "La dame recule en gardant un œil sur l'aile roi. Menace : 13.e5, et après 13...Bxf3 14.exf6, les Blancs gagnent une pièce."] [%eval 1.76] [%cal Ge4e5] }
12... Qc7 { [%txt "Les Noirs relient leurs tours."] [%eval 2.03] }
13. g4 { [%txt "Deuxième pion : g5 chassera le cavalier f6, le seul défenseur du roi noir."] [%eval 1.97] [%cal Gg4g5] }
13... Rfd8 { [%txt "Les Noirs n'ont pas de contre-jeu : ils attendent."] [%eval 2.36] }
14. g5 { [%txt "Le cavalier f6 est chassé."] [%eval 2.32] [%cal Gg5f6] }
14... Ne8 { [%txt "Le seul repli : le cavalier ne défend plus rien depuis e8."] [%eval 2.56] }
15. Rhg1 { [%txt "La tour se place derrière le pion g : elle soutiendra la percée."] [%eval 2.17] [%cal Gg1g8] }
15... Bf8 { [%txt "Les Noirs défendent avec une pièce de plus, ce qui montre à quel point ils sont à l'étroit."] [%eval 2.52] }
16. f5 { [%txt "Troisième pion : f6 et g6 sont menacés."] [%eval 2.68] [%cal Gf5f6] }
16... f6 { [%txt "Les Noirs bloquent, mais ouvrent la diagonale g8-a2 et la case e6."] [%eval 3.52] }
17. Qh4 { [%txt "La dame rejoint l'attaque contre h7."] [%eval 3.70] [%cal Gh4h7] }
17... fxg5 { [%txt "Les Noirs prennent."] [%eval 4.07] }
18. Bxg5 { [%txt "Le fou reprend en attaquant la tour d8."] [%eval 4.26] [%cal Gg5d8] }
18... Rd7 { [%txt "La tour s'écarte."] [%eval 4.39] }
19. Be2 { [%txt "Le fou part vers c4, sur la diagonale du roi noir."] [%eval 3.91] [%cal Ge2c4] }
19... Kh8 { [%txt "Le roi quitte la diagonale."] [%eval 4.01] }
20. Bc4 { [%txt "Le fou vise e6 et g8."] [%eval 4.03] }
20... Be7 { [%txt "Les Noirs proposent l'échange du fou g5."] [%eval 4.02] }
21. Be6 { [%txt "Le fou s'installe en e6, au cœur du camp noir, et attaque la tour d7."] [%eval 4.55] [%cal Ge6d7] }
21... Bxg5+ { [%txt "Les Noirs échangent avec échec."] [%eval 5.11] }
22. Rxg5 { [%txt "La tour reprend et rejoint l'attaque."] [%eval 5.06] }
22... Re7 { [%txt "La tour noire s'écarte du fou."] [%eval #2] }
23. Qxh7+ { [%txt "Le sacrifice final : la dame prend h7 avec échec. Après 23...Kxh7, 24.Rh5 est mat (le fou e6 couvre g8). Les Noirs ont abandonné.

PRO TIP : la méthode contre un adversaire qui s'enferme.
1. Roque du côté opposé, puis avance les pions devant le roi adverse : chaque poussée chasse une pièce de défense (g5 contre le cavalier f6).
2. Place les tours derrière les pions (Rhg1) avant la percée.
3. Quand le camp adverse s'ouvre, amène les pièces sur les diagonales du roi (Bc4-e6, Qh4)."] [%eval #1] [%csl Rh7] } *`,
    ),
    chapter(
      "Surprise 4 : la finale de la branche B quand les Noirs jouent mou",
      `{ [%txt "ALÉATOIRE SURPRISE. La branche B mène à une finale sans dames où les Blancs n'ont qu'un petit avantage. Contre un adversaire qui joue des coups de développement sans plan, cet avantage grandit tout seul si l'on suit trois idées : gagner de l'espace à l'aile roi avec les pions, enlever les bonnes cases au cavalier noir, puis ouvrir la colonne g pour la tour. La ligne principale montre la dérive ; la variante au 6e coup donne la partie modèle Tseshkovsky-Morozevich (2004), citée par Emms."] [%eval 0.43] }
1. e4 { [%txt "On occupe le centre."] [%eval 0.41] [%csl Ge4] }
1... e5 { [%txt "Symétrie."] [%eval 0.39] }
2. Nf3 { [%txt "On attaque e5."] [%eval 0.38] [%cal Gf3e5] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.40] }
3. d4 { [%txt "On ouvre le centre."] [%eval 0.12] [%cal Gd4e5] }
3... exd4 { [%txt "Les Noirs prennent."] [%eval 0.09] }
4. Nxd4 { [%txt "Reprise par une pièce."] [%eval 0.15] }
4... Bc5 { [%txt "Le fou attaque d4."] [%eval 0.38] [%cal Rc5d4] }
5. Nxc6 { [%txt "On échange."] [%eval 0.19] }
5... Qf6 { [%txt "Menace de mat en f2."] [%eval 0.21] [%cal Rf6f2] }
6. Qf3 { [%txt "On pare et on propose l'échange des dames."] [%eval 0.16] }
6... bxc6 { [%txt "Reprise vers le centre."] [%eval 0.24] }
(6... Qxf3 { [%txt "Les Noirs échangent tout de suite."] [%eval 0.23] }
  7. gxf3 { [%txt "Reprise forcée : la colonne g est ouverte pour nous."] [%eval 0.23] }
  7... bxc6 { [%txt "Reprise."] [%eval 0.23] }
  8. Rg1 { [%txt "La tour attaque g7 tout de suite. Ne pas prendre g7 trop vite : après ...Ng6, la tour serait enfermée."] [%eval 0.22] [%cal Gg1g7] }
  8... Ne7 { [%txt "Le cavalier couvre g6 et g8."] [%eval 0.43] }
  9. Be3 { [%txt "On propose l'échange du fou c5, la meilleure pièce noire."] [%eval 0.45] [%cal Ge3c5] }
  9... Bb6 { [%txt "Selon Emms, une imprécision : 9...Bxe3 tout de suite était plus fort."] [%eval 0.47] }
  10. c4 { [%txt "On gagne de l'espace et on enlève la case d5 aux pièces noires."] [%eval 0.31] [%csl Gd5] }
  10... Bxe3 { [%txt "Les Noirs échangent quand même."] [%eval 0.29] }
  11. fxe3 { [%txt "Reprise vers le centre : e3 contrôle d4 et f4."] [%eval 0.26] }
  11... O-O { [%txt "Les Noirs roquent face à la colonne g ouverte."] [%eval 0.26] }
  12. f4 { [%txt "Le pion prend la case e5 et prépare f5."] [%eval 0.25] [%cal Gf4f5] }
  12... Rb8 { [%txt "La tour vise b2."] [%eval 0.38] }
  13. b3 { [%txt "On protège b2 simplement."] [%eval 0.38] }
  13... d6 { [%txt "Les Noirs libèrent le fou c8."] [%eval 0.29] }
  14. Nc3 { [%txt "Le dernier développement."] [%eval 0.35] }
  14... f6 { [%txt "Les Noirs ferment la diagonale et la case e5, mais affaiblissent e6."] [%eval 0.66] }
  15. c5 { [%txt "Le levier qui fixe les pions doublés : si les Noirs prennent, leurs pions c restent isolés."] [%eval 0.54] [%cal Gc4c5] }
  15... Be6 { [%txt "Le fou se développe."] [%eval 0.71] }
  16. O-O-O { [%txt "Le roi rejoint la colonne d. Emms : la structure noire est sous pression, et si 16...dxc5, 17.Na4 puis Nc5 installe le cavalier sur l'avant-poste."] [%eval 0.74] [%csl Gc5] [%cal Gc3a4,Ga4c5] })
7. Nd2 { [%txt "Le cavalier va vers b3 pour chasser le fou."] [%eval 0.27] [%cal Gd2b3] }
7... d6 { [%txt "Libère le fou c8."] [%eval 0.24] }
8. Nb3 { [%txt "Gain de temps sur le fou."] [%eval 0.23] }
8... Bb6 { [%txt "Le fou garde la diagonale de f2."] [%eval 0.27] }
9. Bd2 { [%txt "On prépare Bc3 et le grand roque."] [%eval 0.22] }
9... Qxf3 { [%txt "Échange des dames."] [%eval 0.24] }
10. gxf3 { [%txt "Reprise : la colonne g est ouverte."] [%eval 0.24] }
10... a5 { [%txt "Les Noirs préparent ...a4."] [%eval 0.25] }
11. a4 { [%txt "On bloque le pion."] [%eval 0.21] }
11... Ne7 { [%txt "Développement."] [%eval 0.30] }
12. Be3 { [%txt "On propose l'échange du fou b6."] [%eval 0.16] }
12... Bxe3 { [%txt "Échange."] [%eval 0.16] }
13. fxe3 { [%txt "Fin de la théorie : environ +0.2 pour les Blancs. Le pion e3 contrôle d4 et f4."] [%eval 0.18] [%csl Gd4,Gf4] }
13... Bd7 { [%txt "LA DÉRIVE commence : un coup de développement sans plan. Le fou n'a rien à faire en d7."] [%eval 0.37] }
14. h4 { [%txt "Premier temps du plan : les pions de l'aile roi gagnent de l'espace. Le pion h ira en h5 pour fixer h7 et g7."] [%eval 0.37] [%cal Gh4h5] }
14... c5 { [%txt "Les Noirs défont un peu leurs pions doublés."] [%eval 0.36] }
15. h5 { [%txt "Le pion h5 enlève la case g6 au cavalier noir."] [%eval 0.36] [%csl Gg6] }
15... Nc6 { [%txt "Le cavalier cherche une autre route, vers e5."] [%eval 0.26] }
16. Bb5 { [%txt "Le fou se développe avec gain de temps sur le cavalier c6."] [%eval 0.28] [%cal Gb5c6] }
16... Ne5 { [%txt "Le cavalier s'installe en e5 : c'est sa meilleure case (16...Ke7 était plus solide)."] [%eval 0.35] }
17. Nd2 { [%txt "Le cavalier se replace vers le centre et protège f3 contre ...Nxf3+."] [%eval 0.34] }
17... Ke7 { [%txt "Le roi se centralise, comme il se doit en finale."] [%eval 0.38] }
18. f4 { [%txt "Deuxième temps du plan : on chasse le cavalier de sa meilleure case. Il n'aura plus ni e5, ni g6."] [%eval 0.29] [%cal Gf4e5] }
18... c6 { [%txt "Les Noirs chassent le fou, mais ce coup laisse le pion d6 plus faible."] [%eval 0.59] }
19. Be2 { [%txt "Le fou recule et surveille g4."] [%eval 0.92] }
19... Ng4 { [%txt "Le cavalier va en g4, mais il n'y a pas d'avenir."] [%eval 1.16] }
20. Rg1 { [%txt "Troisième temps du plan : la tour attaque le cavalier g4, et derrière lui le pion g7."] [%eval 1.02] [%cal Gg1g4] }
20... Nf6 { [%txt "Le cavalier recule et oublie g7 (20...Nxe3 limitait les dégâts)."] [%eval 1.14] }
21. Rxg7 { [%txt "Le pion g7 tombe : la colonne g ouverte au 10e coup paie enfin."] [%eval 1.13] [%csl Gg7] }
21... Rag8 { [%txt "Les Noirs proposent l'échange des tours."] [%eval 1.24] }
22. Rxg8 { [%txt "On échange : avec un pion de plus, les échanges rapprochent la victoire."] [%eval 1.22] }
22... Rxg8 { [%txt "Reprise."] [%eval 1.12] }
23. Kf2 { [%txt "Le roi se rapproche du centre et protège e3 et f3 : un pion de plus et une meilleure structure (+1.2).

PRO TIP : la méthode dans les finales de la branche B.
1. Avance les pions de l'aile roi (h4-h5, f4) pour enlever les bonnes cases au cavalier noir.
2. Garde la colonne g ouverte pour la tour, et attaque g7 au moment où le cavalier ne peut plus le défendre.
3. Après le gain d'un pion, échange les tours et centralise le roi."] [%eval 1.16] [%csl Gg7] } *`,
    ),
    chapter(
      "Surprise 5 : 3...d6, étouffer puis viser le pion d6",
      `{ [%txt "ALÉATOIRE SURPRISE. Contre 3...d6, on pousse 4.d5 et le cavalier recule en b8 : les Noirs ont déjà perdu deux temps. La suite simule un adversaire de club qui se développe sans plan. Les Blancs gagnent de l'espace (c4), développent tout, puis ouvrent la colonne d au bon moment pour attaquer le pion d6, devenu faible. La barre d'évaluation monte d'environ +0.9 à +2."] [%eval 0.43] }
1. e4 { [%txt "On occupe le centre."] [%eval 0.41] [%csl Ge4] }
1... e5 { [%txt "Symétrie."] [%eval 0.39] }
2. Nf3 { [%txt "On attaque e5."] [%eval 0.38] [%cal Gf3e5] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.40] }
3. d4 { [%txt "On ouvre le centre."] [%eval 0.12] [%cal Gd4e5] }
3... d6 { [%txt "Les Noirs refusent de prendre : position passive."] [%eval 0.84] }
(3... exd4 { [%txt "La prise normale mène aux branches A et B."] [%eval 0.09] }
  4. Nxd4 { [%txt "Reprise par une pièce : voir les chapitres de théorie."] [%eval 0.15] })
4. d5 { [%txt "On gagne de l'espace avec gain de temps."] [%eval 0.92] [%cal Gd5c6] }
4... Nb8 { [%txt "Le cavalier retourne à la maison : deux temps perdus."] [%eval 0.97] }
5. h3 { [%txt "Un coup prophylactique : le fou c8 n'ira jamais en g4 clouer le cavalier f3."] [%eval 0.99] [%csl Gg4] }
5... Nf6 { [%txt "Développement."] [%eval 0.95] }
6. Bd3 { [%txt "On défend e4 et on garde la case c4 libre pour le pion."] [%eval 0.94] }
6... g6 { [%txt "Les Noirs choisissent un fianchetto."] [%eval 0.96] }
7. c4 { [%txt "La chaîne c4-d5-e4 : les Blancs ont beaucoup plus d'espace."] [%eval 1.00] [%csl Gc4,Gd5,Ge4] }
7... c6 { [%txt "Les Noirs contestent d5 (7...Bg7 était plus utile)."] [%eval 1.18] [%cal Rc6d5] }
8. Be3 { [%txt "Développement. Le fou e3 surveille aussi a7 et c5."] [%eval 1.11] }
8... Na6 { [%txt "Le cavalier cherche c5, mais il est mal placé au bord."] [%eval 1.12] }
9. O-O { [%txt "Le roi est à l'abri : place maintenant à l'ouverture du centre."] [%eval 1.16] }
9... Bd7 { [%txt "Un coup sans plan : le fou n'a pas d'avenir en d7 (9...Bg7 était nécessaire)."] [%eval 1.37] }
10. dxc6 { [%txt "Le bon moment pour ouvrir la colonne d : le pion d6 devient une cible sur une colonne ouverte."] [%eval 1.38] [%cal Gd1d6] }
10... bxc6 { [%txt "Reprise."] [%eval 1.31] }
11. a3 { [%txt "Un petit coup très utile : le cavalier a6 n'a plus la case b4."] [%eval 1.28] [%csl Gb4] }
11... c5 { [%txt "Les Noirs laissent leur pion d6 arriéré, derrière un trou en d5."] [%eval 1.39] [%csl Rd6,Rd5] }
12. Nc3 { [%txt "Le cavalier vise d5 et b5, les deux cases faibles du camp noir."] [%eval 1.54] [%cal Gc3d5,Gc3b5] }
12... Bg7 { [%txt "Le fou se développe enfin."] [%eval 1.68] }
13. Bc2 { [%txt "Le fou libère la case d3 pour la dame, qui visera d6."] [%eval 1.62] }
13... Qb8 { [%txt "La dame s'éloigne de la défense de d6."] [%eval 1.92] }
14. Qd3 { [%txt "La dame attaque d6 ; Rad1 et Nb5 suivront. Les Blancs ont environ +2.

PRO TIP : la méthode contre 3...d6.
1. Prends l'espace (d5, c4) et interdis les bonnes cases (h3 contre ...Bg4, a3 contre ...Nb4).
2. Ouvre la colonne d (dxc6) seulement quand tes pièces sont prêtes.
3. Attaque la faiblesse avec toutes les pièces : dame, tour sur la colonne d, cavalier vers b5 ou d5."] [%eval 2.04] [%csl Rd6] [%cal Gd3d6] } *`,
    ),
    chapter(
      "Surprise 6 : 4...Qh4, la dame gourmande et la chasse au roi",
      `{ [%txt "ALÉATOIRE SURPRISE. Contre 4...Qh4, le chapitre anti-panique montre la ligne 6...Qxe4. Ici l'adversaire choisit 6...Nf6 puis prend tout ce qu'on lui offre : un cavalier, un pion. Karjakin-Malinin (Sudak 2002), cité par Emms, montre la punition : les Blancs sacrifient pour ouvrir le roi noir et le traquent jusqu'au mat. La leçon : quand l'adversaire a sorti sa dame trop tôt et que son roi est seul, chaque temps gagné vaut plus qu'une pièce."] [%eval 0.43] }
1. e4 { [%txt "On occupe le centre."] [%eval 0.41] [%csl Ge4] }
1... e5 { [%txt "Symétrie."] [%eval 0.39] }
2. Nf3 { [%txt "On attaque e5."] [%eval 0.38] [%cal Gf3e5] }
2... Nc6 { [%txt "Défense de e5."] [%eval 0.40] }
3. d4 { [%txt "On ouvre le centre."] [%eval 0.12] [%cal Gd4e5] }
3... exd4 { [%txt "Les Noirs prennent."] [%eval 0.09] }
4. Nxd4 { [%txt "Reprise par une pièce."] [%eval 0.15] }
4... Qh4 { [%txt "La sortie de dame provocatrice : e4 est attaqué."] [%eval 0.74] [%cal Rh4e4] }
5. Nc3 { [%txt "La réponse d'Emms : développer en limitant les ruses noires."] [%eval 0.70] }
5... Bb4 { [%txt "Le fou cloue le cavalier et renouvelle l'attaque sur e4."] [%eval 0.70] }
6. Be2 { [%txt "On laisse e4 en prise : le développement d'abord."] [%eval 0.68] }
6... Nf6 { [%txt "Les Noirs développent au lieu de prendre tout de suite."] [%eval 1.73] }
7. O-O { [%txt "Un bon coup selon Emms : le roi est à l'abri et la tour f1 entrera dans l'attaque. Attention au piège : 7...O-O?? 8.Nf5 enferme la dame h4."] [%eval 1.36] }
7... Bxc3 { [%txt "Les Noirs veulent gagner du matériel."] [%eval 1.51] }
8. Nf5 { [%txt "Le coup intermédiaire : le cavalier attaque la dame et g7 au lieu de reprendre en c3."] [%eval 1.65] [%cal Gf5h4,Gf5g7] }
8... Qxe4 { [%txt "La dame s'échappe en prenant un pion."] [%eval 1.59] }
9. Bd3 { [%txt "Le fou chasse la dame avec gain de temps et vise h7."] [%eval 1.77] [%cal Gd3e4] }
9... Qg4 { [%txt "La dame se replie en restant près de l'aile roi."] [%eval 1.74] }
10. f3 { [%txt "Encore un gain de temps sur la dame."] [%eval 1.85] [%cal Gf3g4] }
10... Qa4 { [%txt "La dame part loin, à l'aile dame. Le roi noir va se retrouver seul."] [%eval 1.94] }
11. bxc3 { [%txt "Maintenant on reprend la pièce : les Blancs ont un pion de moins, mais toutes leurs pièces visent le roi noir."] [%eval 1.85] }
11... O-O { [%txt "Le roque naturel… qui permet un coup écrasant."] [%eval 2.95] }
12. Nxg7 { [%txt "Le sacrifice du cavalier ouvre le roi."] [%eval 3.15] [%csl Rg7] }
12... Kxg7 { [%txt "Les Noirs ne peuvent guère refuser."] [%eval 3.48] }
13. Bh6+ { [%txt "Deuxième sacrifice : le fou attaque le roi et la tour f8."] [%eval 3.79] [%cal Gh6g7] }
13... Kxh6 { [%txt "Le roi prend, et se retrouve devant ses pions."] [%eval 5.98] }
14. Qd2+ { [%txt "La dame entre avec échec par la diagonale c1-h6."] [%eval 6.40] [%cal Gd2h6] }
14... Kh5 { [%txt "Le roi monte encore. Après 14...Kg7 15.Qg5+ Kh8 16.Qxf6+, les Blancs matent vite."] [%eval 6.77] }
15. g4+ { [%txt "Le pion attaque le roi : il faut ouvrir encore des lignes."] [%eval 5.92] }
15... Nxg4 { [%txt "Le cavalier prend. Après 15...Kh4, 16.Qh6+ Nh5 et le mat suit."] [%eval 6.84] }
16. fxg4+ { [%txt "On reprend avec échec : la colonne f s'ouvre pour la tour f1."] [%eval 6.49] [%cal Gf1f7] }
16... Qxg4+ { [%txt "La dame noire revient avec échec…"] [%eval 7.04] }
17. Kh1 { [%txt "…le roi se met à l'abri en h1 : plus d'échec possible."] [%eval 6.64] }
17... d6 { [%txt "Les Noirs libèrent le fou c8 pour défendre."] [%eval #11] }
18. Rf6 { [%txt "Le coup le plus précis selon Emms : la tour enferme le roi noir sur la 5e rangée. Stockfish 18 annonce un mat forcé en 9 coups au plus."] [%eval #9] [%cal Gf6h6] }
18... Qg5 { [%txt "La dame couvre h6 et g6."] [%eval #7] }
19. Be2+ { [%txt "Le fou donne échec par la diagonale d1-h5."] [%eval #6] [%cal Ge2h5] }
19... Bg4 { [%txt "Les Noirs interposent le fou."] [%eval #6] }
20. Bxg4+ { [%txt "On prend avec échec : le mat suit en quelques coups (par exemple 20...Kxg4 21.Rg1+). Les Noirs ont abandonné.

PRO TIP : la méthode contre une dame sortie trop tôt.
1. Développe avec gain de temps sur la dame (Bd3, f3) : chaque coup de dame noire est un coup de développement de moins.
2. Quand la dame s'éloigne de son roi, sacrifie pour ouvrir le roi (Nxg7, Bh6+).
3. Amène les pièces avec échec (Qd2+, g4+, fxg4+) et mets ton propre roi à l'abri avant le coup final (Kh1)."] [%eval #5] [%cal Gf1g1] } *`,
    ),
  ],
};
