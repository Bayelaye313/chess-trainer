import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours d'ouverture « Défense Est-Indienne (avec les Noirs) » : 1.d4 Nf6
 * 2.c4 g6 3.Nc3 Bg7 4.e4 d6 — onglet Ouvertures, format « un commentaire par
 * coup » de l'Académie, lu par `CourseTreeViewer` (route
 * `/ouvertures/kings-indian/cours`). Public visé : 1500-1800 Elo, joueur
 * tactique qui a besoin de plans stricts.
 *
 * ## Contenu (2026-10-12, v2 2026-11-04)
 *
 * 1. Fiche d'identité et Variante Classique 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6
 *    8.d5 Ne7 9.Ne1 Nd7 10.Nd3 f5 11.Bd2 f4 12.f3 g5 13.b4 Nf6, avec
 *    11.f3 et le piège 13.c5? Nxc5 ; feuille de route ...Ng6, ...h5, ...g4.
 * 2. Attaque Bayonnette 9.b4 Nh5 10.Re1 f5 11.Ng5 Nf6 12.Bf3 c6 13.Be3
 *    cxd5 14.cxd5, avec 12.f3 Kh8 ; feuille de route ...h6, ...Bxe6,
 *    ...fxe4 et ...d5 (Xu Jun-Ponomariov 2000).
 * 3. Variante d'Échange 7.dxe5 dxe5 8.Qxd8 Rxd8 : 9.Bg5 Re8, 9.Be3 Nc6
 *    10.O-O Nd4 (la case d4) et l'imprécision de club 9.Nxe5 Nxe4.
 * 4. Anti-panique : Sämisch 5.f3 O-O 6.Be3 c5! (et 6...e5) puis Quatre
 *    Pions 5.f4 O-O 6.Nf3 c5 7.d5 e6 8.Be2 exd5 9.cxd5 Re8.
 * 5. Aléatoire surprise 1 : 13.h3 et 14.a3 (deux coups de pion mous) punis
 *    par ...Nf6, ...h5 et le levier ...g4.
 * 6. Aléatoire surprise 2 : la finale d'Échange jouée sans plan (14.Nh4,
 *    18.Rc1, 20.b3) : le pion e4 tombe, puis la colonne d s'ouvre vers e1.
 *
 * Indices progressifs : chaque faute blanche qui perd au moins 0.5 porte
 * trois balises `[%hint]` (1. principe violé, 2. zone faible, 3. action
 * concrète) et une balise `[%hintcsl]` (cases allumées à partir du 2e
 * indice) ; en dessous de 0.5, c'est une imprécision, sans indices. Chaque
 * chapitre théorique finit par « À RETENIR. PRO TIP : la feuille de route
 * après la théorie », chaque variante par un « À RETENIR. PRO TIP ».
 *
 * Sources : Andrew Martin, « Classical King's Indian E90-E99 » (ChessPub
 * 2002, `docs/`, couche texte) pour les lignes 9.Ne1 et 9.b4 ; Anatoli
 * Vaisser, « Beating the King's Indian and Benoni » (Batsford 1997, `docs/`)
 * pour la ligne principale des Quatre Pions 9...Re8. Toutes les lignes sont
 * arbitrées par Stockfish 19 natif (profondeur 16) ; tout chiffre cité est
 * l'évaluation d'un nœud. Le moteur a nuancé le cahier des charges : 6...c5
 * est meilleur que 6...e5 contre la Sämisch, et le levier ...g4 n'est bon
 * qu'APRÈS ...h5 et ...Nf6 (poussé trop tôt, il ne donne rien). Toute la
 * prose est originale.
 *
 * ## Architecture technique des nœuds
 *
 * Voir `op-scotch-game.ts` : `evaluationScore` / `evaluationMate` (balise
 * `[%eval]`), `showEvalBar`, `freeze` (balise `[%txt "…"]` sur CHAQUE
 * commentaire), plus `hints` / `hintHighlights`.
 *
 * Fichier GÉNÉRÉ : ne pas l'éditer à la main. Source commentée :
 * `scripts/opening-course-src/kings-indian.pgn` (et l'en-tête
 * `kings-indian.header.txt`) ; regénérer avec
 * `node --import tsx scripts/_tmp-build-opening-course.mts <source> <en-tête> <sortie> 16 [pgn compilé]`.
 * Règles de l'utilisateur : SAN en texte brut uniquement (jamais de figurine
 * Unicode), pas de guillemet droit dans un `[%txt]` ni un `[%hint]`.
 */

function chapter(title: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, START) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const OP_KINGS_INDIAN: CourseTree = {
  chapters: [
    chapter(
      "Fiche d'identité, tronc commun et Variante Classique : la tempête de pions",
      `{ [%txt "LA DÉFENSE EST-INDIENNE, AVEC LES NOIRS.

Le vrai enjeu : on laisse les Blancs prendre le centre avec c4, d4 et e4, on met le roi à l'abri derrière le fou g7, puis on frappe le centre avec ...e5. Quand les Blancs ferment par d5, le centre est BLOQUÉ et la partie devient une course : les Blancs attaquent à l'aile dame, nous attaquons le roi.

Les deux plans à connaître par coeur :
- Plan blanc : la poussée c4-c5 (préparée par b4 ou Nd3), pour ouvrir la colonne c et frapper notre pion d6.
- Plan noir : ...Ne7, ...Nd7 (ou ...Ne8), puis ...f5, ...f4, ...g5 et ...g4. Le pion f4 enferme le fou blanc des cases noires, le pion g4 ouvre la route du roi blanc.

La règle d'or du joueur de club : à l'aile dame, on ne défend pas, on CONTRE-ATTAQUE plus vite. Chaque coup noir à l'aile dame est un coup de moins pour l'attaque.

Honnêteté moteur : l'Est-Indienne ne réfute rien. Stockfish 19 donne aux Blancs +0.68 après 12...g5 dans la ligne principale, un peu plus que dans les défenses classiques. C'est le prix d'une position déséquilibrée où celui qui connaît son plan gagne souvent avant le moteur.

Les structures types (relevées sur la position finale de chaque chapitre) :
- Classique fermée (chapitres 1, 2 et 5) : Blancs b4-c5-d5-e4-f3 contre Noirs c7-d6-e5-f4-g5 ; deux chaînes en sens opposé, chacun attaque à la base de la chaîne adverse.
- Échange (chapitres 3 et 6) : colonne d ouverte, pions e4 contre e5 ; la case d4 est un trou pour nos pièces.
- Anti-panique (chapitre 4) : on frappe le centre blanc avec ...c5 avant qu'il soit soutenu."] [%eval 0.33] }
1. d4 { [%txt "Les Blancs occupent le centre avec le pion dame."] [%eval 0.19] }
1... Nf6 { [%txt "Le cavalier contrôle e4 et ne s'engage encore sur aucune structure."] [%eval 0.18] [%cal Gf6e4,Gf6d5] }
2. c4 { [%txt "Les Blancs prennent de l'espace et visent d5."] [%eval 0.32] }
2... g6 { [%txt "On prépare le fianchetto : le fou ira en g7, sur la grande diagonale."] [%eval 0.33] [%cal Gf8g7] }
3. Nc3 { [%txt "Le cavalier prépare e4."] [%eval 0.29] }
3... Bg7 { [%txt "Le fou g7 est la pièce la plus importante de l'Est-Indienne : il vise d4 et toute la diagonale a1-h8."] [%eval 0.53] [%csl Gg7] [%cal Gg7a1] }
4. e4 { [%txt "Les Blancs construisent le grand centre c4-d4-e4."] [%eval 0.55] }
4... d6 { [%txt "On contrôle e5 et on prépare ...e5. On ne se bat pas pour e4 : on va frapper la base d4."] [%eval 0.47] [%csl Gd6,Ge5] [%cal Gd6e5] }
5. Nf3 { [%txt "La Variante Classique : développement naturel, le cavalier contrôle e5 et d4."] [%eval 0.53] }
5... O-O { [%txt "Le roi à l'abri avant de toucher au centre."] [%eval 0.50] [%csl Gg8] }
6. Be2 { [%txt "Développement sobre, les Blancs préparent leur propre roque."] [%eval 0.55] }
6... e5 { [%txt "LE COUP DE L'EST-INDIENNE : on frappe d4. Les Blancs doivent choisir : fermer (d5), échanger (dxe5, chapitre 3) ou maintenir."] [%eval 0.47] [%csl Ge5,Rd4] [%cal Ge5d4] }
7. O-O { [%txt "Les Blancs roquent et maintiennent la tension."] [%eval 0.61] }
7... Nc6 { [%txt "On ajoute une troisième pression sur d4 : les Blancs sont obligés de se décider. Le moteur préfère de peu 7...exd4 ou 7...Na6, mais 7...Nc6 donne les plans les plus clairs."] [%eval 0.67] [%cal Gc6d4,Ge5d4] }
8. d5 { [%txt "Les Blancs ferment le centre avec gain de temps sur le cavalier. À partir d'ici, plus aucun pion central ne s'échangera vite : c'est une course d'ailes."] [%eval 0.68] [%csl Gd5] }
8... Ne7 { [%txt "Le cavalier recule vers l'aile roi : il soutiendra ...f5 et pourra aller en g6."] [%eval 0.64] [%cal Ge7g6,Gf7f5] }
9. Ne1 { [%txt "L'ancienne ligne principale (Mar del Plata) : le cavalier va en d3 pour soutenir c5, et il libère le pion f pour f3. La Bayonnette 9.b4 est au chapitre 2."] [%eval 0.66] [%cal Ge1d3] }
9... Nd7 { [%txt "Le cavalier f6 libère le pion f. Tout notre plan commence par ...f5."] [%eval 0.71] [%cal Gf7f5] }
10. Nd3 { [%txt "Le cavalier vise c5 et protège e5... et f4."] [%eval 0.61] [%cal Gd3c5] }
10... f5 { [%txt "LA PREMIÈRE VAGUE : on attaque e4, base de la chaîne blanche."] [%eval 0.61] [%csl Gf5,Re4] [%cal Gf5e4] }
11. Bd2 { [%txt "Un coup de développement : le fou soutiendra b4 et ira en e1 défendre l'aile roi. C'est une imprécision : le moteur passe de +0.61 à +0.20."] [%eval 0.20] }
(11. f3 { [%txt "Le coup le plus fréquent, et le meilleur des deux selon le moteur (+0.51 contre +0.20 pour 11.Bd2) : les Blancs soutiennent e4 tout de suite."] [%eval 0.51] }
  11... f4 { [%txt "On ferme : le fou c1 n'a plus la diagonale c1-h6."] [%eval 0.65] [%csl Gf4] }
  12. Bd2 { [%txt "Le fou se développe."] [%eval 0.65] }
  12... g5 { [%txt "À RETENIR.

PRO TIP : +0.68. Même position que la ligne principale par une autre route : contre 11.f3, on ferme par ...f4 et on enchaîne ...g5."] [%eval 0.68] [%csl Gg5] [%cal Gg5g4] })
11... f4 { [%txt "LA DEUXIÈME VAGUE : on ferme l'aile roi. Le pion f4 coupe le fou d2 de l'aile roi et prépare ...g5-g4. Le moteur préfère nettement 11...fxe4 ; 11...f4 lui rend du terrain (+0.68), mais c'est le plan de la tempête, le plus simple à jouer."] [%eval 0.68] [%csl Gf4] [%cal Gg7g5,Gg5g4] }
12. f3 { [%txt "Les Blancs bloquent : le pion f3 empêchera ...f3 et soutient e4. Il deviendra aussi la cible de ...g4."] [%eval 0.68] [%csl Rf3] }
12... g5 { [%txt "LA TROISIÈME VAGUE : g5 prépare ...g4 pour ouvrir la colonne g contre le roi blanc."] [%eval 0.68] [%csl Gg5] [%cal Gg5g4,Rg4f3] }
13. b4 { [%txt "Le plan blanc : b4 prépare c5 pour ouvrir la colonne c."] [%eval 0.70] [%cal Gb4c5] }
(13. c5 { [%txt "Trop pressé : les Blancs oublient que le pion c5 n'est soutenu que par le cavalier d3. L'évaluation passe de +0.68 à -0.05."] [%hint "Les Blancs poussent c5 avant de l'avoir préparé par b4."] [%hint "Le pion c5 : attaqué par le cavalier d7 et le pion d6, défendu par le seul cavalier d3."] [%hint "Nxc5 ! On prend le pion : la poussée blanche n'a rien ouvert."] [%hintcsl Rc5] [%eval -0.05] }
  13... Nxc5 { [%txt "À RETENIR.

PRO TIP : -0.05. On prend gratuitement : si 14.Nxc5 dxc5, le pion de plus reste à nous et la poussée blanche n'a rien ouvert. La poussée c5 n'est dangereuse que préparée par b4."] [%eval -0.05] [%csl Gc5] [%cal Gd7c5] })
13... Nf6 { [%txt "Le cavalier revient : il attaque e4 et prépare ...h5 et ...g4.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.54).
1. ...Ng6 ou ...Kh8 : le deuxième cavalier et le roi se placent pour la tempête.
2. ...h5 puis ...g4 : le levier, préparé par le cavalier f6 et le pion h5.
3. Après c5 et cxd6 cxd6, une tour en f7 défend c7 contre Nb5-c7 : on ne répond pas à l'aile dame, on compte les coups et on attaque."] [%eval 0.54] [%cal Gf6e4,Gh7h5,Gg5g4] } *`,
    ),
    chapter(
      "L'Attaque Bayonnette 9.b4 : la ligne moderne de club",
      `{ [%txt "L'ATTAQUE BAYONNETTE.

Au lieu de 9.Ne1, les Blancs poussent tout de suite b4 : ils gagnent un temps pour c5 et menacent d'ouvrir l'aile dame avant que notre attaque arrive.

Notre réponse : 9...Nh5 ! Le cavalier libère le pion f, regarde la case f4 et accélère ...f5. Les Blancs répondent par 10.Re1 (la découverte de Kramnik), qui libère f1 pour le fou e2 et défend e4.

Honnêteté moteur : Stockfish 19 préfère de très peu 9...a5, mais 9...Nh5 (+0.73) est dans l'esprit de l'Est-Indienne, et la ligne se rapproche ensuite de l'égalité."] [%eval 0.33] }
1. d4 { [%txt "Le pion dame."] [%eval 0.19] }
1... Nf6 { [%txt "Le cavalier."] [%eval 0.18] [%cal Gf6e4] }
2. c4 { [%txt "L'espace."] [%eval 0.32] }
2... g6 { [%txt "Fianchetto."] [%eval 0.33] [%cal Gf8g7] }
3. Nc3 { [%txt "Le cavalier dame."] [%eval 0.29] }
3... Bg7 { [%txt "Le fou sur la grande diagonale."] [%eval 0.53] [%csl Gg7] }
4. e4 { [%txt "Le grand centre."] [%eval 0.55] }
4... d6 { [%txt "Le contrôle de e5."] [%eval 0.47] [%csl Ge5] }
5. Nf3 { [%txt "La Classique."] [%eval 0.53] }
5... O-O { [%txt "Le roque."] [%eval 0.50] [%csl Gg8] }
6. Be2 { [%txt "Développement."] [%eval 0.55] }
6... e5 { [%txt "La frappe sur d4."] [%eval 0.47] [%cal Ge5d4] }
7. O-O { [%txt "Le roque blanc."] [%eval 0.61] }
7... Nc6 { [%txt "Pression sur d4."] [%eval 0.67] [%cal Gc6d4] }
8. d5 { [%txt "La fermeture."] [%eval 0.68] [%csl Gd5] }
8... Ne7 { [%txt "Le cavalier vers l'aile roi."] [%eval 0.64] [%cal Ge7g6] }
9. b4 { [%txt "LA BAYONNETTE : les Blancs prennent l'espace à l'aile dame tout de suite, pour c5 au coup suivant."] [%eval 0.68] [%cal Gb4c5,Gc4c5] }
9... Nh5 { [%txt "Le cavalier libère le pion f et vise f4 : la poussée ...f5 arrive un coup plus tôt qu'avec ...Nd7."] [%eval 0.73] [%cal Gh5f4,Gf7f5] }
10. Re1 { [%txt "L'idée de Kramnik : la tour défend e4 et libère f1, d'où le fou e2 protégera g2 contre ...Nf4."] [%eval 0.76] [%cal Ge1e4] }
10... f5 { [%txt "On attaque e4 tout de suite."] [%eval 0.89] [%csl Gf5,Re4] [%cal Gf5e4] }
11. Ng5 { [%txt "Le cavalier bondit vers e6, la case faible créée par ...f5."] [%eval 0.65] [%csl Re6] [%cal Rg5e6] }
11... Nf6 { [%txt "Le cavalier revient défendre : il défend h7 et attaque e4. La case e6 reste le point à surveiller."] [%eval 0.57] [%cal Gf6e4,Gf6h7] }
12. Bf3 { [%txt "Le fou renforce e4 et la diagonale vers h5."] [%eval 0.29] }
(12. f3 { [%txt "Le coup le plus sûr pour les Blancs (+0.44) : e4 est consolidé."] [%eval 0.44] }
  12... Kh8 { [%txt "À RETENIR.

PRO TIP : +0.34. Le roi quitte la diagonale g1-a7 et la case g8 sera libre pour un cavalier ou une tour. Plan : ...Nh5 et ...f4 plus tard."] [%eval 0.34] [%csl Gh8] [%cal Gf5f4] })
12... c6 { [%txt "On ouvre une deuxième front : la colonne c, pour que les Blancs ne soient pas seuls à l'aile dame."] [%eval 0.26] [%csl Gc6] [%cal Gc6d5] }
13. Be3 { [%txt "Le fou se développe et vise a7 et c5."] [%eval 0.22] }
13... cxd5 { [%txt "On ouvre la colonne c."] [%eval 0.30] [%cal Gc8c1] }
14. cxd5 { [%txt "Les Blancs reprennent avec le pion c : le pion d5 reste solide.

À RETENIR.

PRO TIP : la feuille de route après la théorie (0.00).
1. ...h6 : on chasse le cavalier g5, il doit choisir tout de suite.
2. Contre Ne6, ...Bxe6 et dxe6 : le cavalier gênant disparaît, le pion e6 est coupé de sa chaîne.
3. ...fxe4 puis ...d5 : on reprend le centre avec gain de temps (Xu Jun-Ponomariov 2000). Contre la Bayonnette, la règle : ...Nh5, ...f5, puis ouvrir la colonne c par ...c6 pour ne pas subir."] [%eval 0.00] [%cal Gh7h6,Gc8e6] } *`,
    ),
    chapter(
      "La Variante d'Échange : 7.dxe5, une finale égale mais vivante",
      `{ [%txt "LA VARIANTE D'ÉCHANGE.

Très fréquente à 1500 Elo : les Blancs ont peur de l'attaque noire et échangent les dames dès le coup 8. Beaucoup de joueurs noirs croient alors la partie nulle et morte. C'est faux : la finale est égale (-0.08 après 8...Rxd8), mais elle reste dynamique.

Nos atouts dans cette finale :
- La case d4 : aucun pion blanc ne peut plus la chasser (plus de pion d, le pion c4 et le pion e4 ne la couvrent pas). Un cavalier noir en d4 y sera intouchable.
- Le fou g7 : rien ne l'obstrue après ...c6 et un futur ...Bf8 ou ...Bh6, et il pèse sur la grande diagonale.
- Le roi : sans les dames, il n'y a plus de danger, il se centralise en f8 ou e7.

Le piège à éviter : se précipiter sur le pion e5 de façon naïve (voir 9.Nxe5 Nxe4)."] [%eval 0.33] }
1. d4 { [%txt "Le pion dame."] [%eval 0.19] }
1... Nf6 { [%txt "Le cavalier."] [%eval 0.18] [%cal Gf6e4] }
2. c4 { [%txt "L'espace."] [%eval 0.32] }
2... g6 { [%txt "Fianchetto."] [%eval 0.33] [%cal Gf8g7] }
3. Nc3 { [%txt "Le cavalier dame."] [%eval 0.29] }
3... Bg7 { [%txt "La grande diagonale."] [%eval 0.53] [%csl Gg7] }
4. e4 { [%txt "Le grand centre."] [%eval 0.55] }
4... d6 { [%txt "Le contrôle de e5."] [%eval 0.47] [%csl Ge5] }
5. Nf3 { [%txt "La Classique."] [%eval 0.53] }
5... O-O { [%txt "Le roque."] [%eval 0.50] [%csl Gg8] }
6. Be2 { [%txt "Développement."] [%eval 0.55] }
6... e5 { [%txt "La frappe sur d4."] [%eval 0.47] [%cal Ge5d4] }
7. dxe5 { [%txt "L'ÉCHANGE : les Blancs liquident la tension. Le moteur le juge nettement moins ambitieux que 7.O-O : +0.15 seulement."] [%eval 0.15] [%cal Gd4e5] }
7... dxe5 { [%txt "Reprise obligatoire : la colonne d s'ouvre."] [%eval 0.29] [%csl Ge5,Gd4] }
8. Qxd8 { [%txt "Les Blancs échangent les dames."] [%eval -0.01] }
8... Rxd8 { [%txt "La tour reprend et occupe la colonne d. Égalité : -0.08."] [%eval -0.08] [%cal Gd8d1] }
9. Bg5 { [%txt "Le coup le plus piquant : le fou cloue le cavalier f6 contre la tour d8 et menace Nd5."] [%eval -0.07] [%cal Rg5f6,Rf6d8] }
(9. Nxe5 { [%txt "Le coup de club naïf : les Blancs prennent le pion e5. Une simple imprécision (-0.04) : le gain de pion est une illusion, car le pion e4 n'est défendu qu'une fois."] [%eval -0.04] [%csl Re4] }
  9... Nxe4 { [%txt "On récupère le pion."] [%eval -0.05] [%cal Gf6e4] }
  10. Nxe4 { [%txt "Les Blancs échangent."] [%eval -0.08] }
  10... Bxe5 { [%txt "À RETENIR.

PRO TIP : -0.09. Le fou g7 reprend et vise b2 : égalité, et c'est plutôt aux Blancs de faire attention à leur pion b2. Contre Nxe5, on rend coup pour coup avec ...Nxe4."] [%eval -0.09] [%csl Rb2] [%cal Ge5b2] })
(9. Be3 { [%txt "Un coup que le moteur juge aussi bon (-0.04) : le fou surveille d4 et c5."] [%eval -0.04] }
  9... Nc6 { [%txt "Le cavalier vise directement la case d4."] [%eval -0.01] [%csl Gd4] [%cal Gc6d4] }
  10. O-O { [%txt "Les Blancs roquent sans se soucier de d4."] [%eval -0.16] }
  10... Nd4 { [%txt "Le cavalier s'installe en d4, menace Nxe2+ et l'échange du fou e2."] [%eval -0.18] [%csl Gd4] [%cal Gd4e2,Gd4f3] }
  11. Nxd4 { [%txt "Les Blancs échangent pour chasser le cavalier."] [%eval -0.09] }
  11... exd4 { [%txt "À RETENIR.

PRO TIP : -0.11. La reprise ouvre la grande diagonale du fou g7 et le pion d4 gêne le cavalier c3 et le fou e3 : les Noirs sont déjà un peu mieux."] [%eval -0.11] [%csl Gd4] [%cal Gg7b2,Gd4c3] })
9... Re8 { [%txt "La tour reste sur la grande colonne et défend e5, et le clouage disparaît."] [%eval 0.00] [%cal Ge8e5] }
10. Nd5 { [%txt "Le cavalier s'installe au centre et attaque c7 et f6."] [%eval -0.04] [%cal Rd5c7] }
10... Nxd5 { [%txt "On échange ce cavalier gênant."] [%eval -0.06] [%cal Gf6d5] }
11. cxd5 { [%txt "Les Blancs reprennent : le pion d5 est avancé."] [%eval -0.01] }
11... c6 { [%txt "On attaque d5 tout de suite : sans pion c, le pion d5 sera isolé."] [%eval -0.03] [%cal Gc6d5] }
12. Bc4 { [%txt "Le fou défend d5."] [%eval 0.04] }
12... cxd5 { [%txt "On échange."] [%eval 0.08] [%cal Gc6d5] }
13. Bxd5 { [%txt "Le fou reprend et occupe le centre."] [%eval 0.07] }
13... Nd7 { [%txt "Le cavalier va en c5 (cible e4) ou en f6 ; le fou g7 n'a plus d'obstacle sur sa diagonale.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.07).
1. ...Nc5 : le cavalier attaque e4, le pion fixé.
2. ...Bf8 : le fou change de diagonale et vise c5 et b4.
3. ...Be6 : on échange le fou d5, le seul défenseur des cases blanches. Dans la finale d'Échange, on joue pour la case d4 et pour le fou g7, jamais pour la nulle."] [%eval 0.07] [%csl Gg7] [%cal Gd7c5,Gc5e4] } *`,
    ),
    chapter(
      "Anti-panique : la Sämisch 5.f3 et l'Attaque des Quatre Pions 5.f4",
      `{ [%txt "ANTI-PANIQUE : QUAND LES BLANCS PRENNENT TOUT LE CENTRE.

Deux systèmes font peur au joueur de l'Est-Indienne :
- La Sämisch 5.f3 : les Blancs soutiennent e4 par f3, puis jouent Be3, Qd2 et souvent O-O-O avec g4 et h4 contre notre roi. Le prix : le cavalier g1 n'a plus la case f3 et se développe lentement (Nge2).
- Les Quatre Pions 5.f4 : quatre pions au centre (c4, d4, e4, f4). Impressionnant, mais personne ne les soutient encore.

La règle unique pour les deux : frapper le centre avec ...c5 AVANT que les Blancs aient fini leur développement. Un centre non soutenu explose."] [%eval 0.33] }
1. d4 { [%txt "Le pion dame."] [%eval 0.19] }
1... Nf6 { [%txt "Le cavalier."] [%eval 0.18] [%cal Gf6e4] }
2. c4 { [%txt "L'espace."] [%eval 0.32] }
2... g6 { [%txt "Fianchetto."] [%eval 0.33] [%cal Gf8g7] }
3. Nc3 { [%txt "Le cavalier dame."] [%eval 0.29] }
3... Bg7 { [%txt "La grande diagonale."] [%eval 0.53] [%csl Gg7] }
4. e4 { [%txt "Le grand centre."] [%eval 0.55] }
4... d6 { [%txt "Le contrôle de e5."] [%eval 0.47] [%csl Ge5] }
5. f3 { [%txt "LA SÄMISCH : f3 soutient e4 et prépare Be3, Qd2 et g4. Le défaut : le cavalier g1 n'a plus f3."] [%eval 0.32] [%csl Rg1,Gf3] }
(5. f4 { [%txt "LES QUATRE PIONS : les Blancs prennent tout le centre. Aucune pièce ne soutient ces pions : on va les attaquer."] [%eval 0.31] [%csl Rc4,Rd4,Re4,Rf4] }
  5... O-O { [%txt "Le roque d'abord : on ne frappe pas le centre avec le roi au milieu."] [%eval 0.23] [%csl Gg8] }
  6. Nf3 { [%txt "Le cavalier soutient d4."] [%eval 0.32] }
  6... c5 { [%txt "LE LEVIER : on attaque d4, la base du centre. Si les Blancs avancent d5, la case e5 et la diagonale du fou g7 nous appartiennent."] [%eval 0.32] [%csl Gc5,Rd4] [%cal Gc5d4] }
  7. d5 { [%txt "Les Blancs avancent."] [%eval 0.22] }
  (7. dxc5 { [%txt "Les Blancs prennent, mais leur centre perd sa base."] [%eval -0.14] }
    7... Na6 { [%txt "Le meilleur coup : le cavalier récupérera c5. Le moteur préfère légèrement les Noirs (-0.08)."] [%eval -0.08] [%cal Ga6c5] }
    8. cxd6 { [%txt "Les Blancs gardent le pion un moment."] [%eval -0.03] }
    8... exd6 { [%txt "À RETENIR.

PRO TIP : 0.00. Notre pion d6 contrôle e5, la diagonale du fou g7 est ouverte, et le pion c5 tombera."] [%eval 0.00] [%cal Gg7c3] })
  7... e6 { [%txt "On ouvre le centre tout de suite : la colonne e s'ouvrira face au roi blanc encore au centre."] [%eval 0.14] [%cal Ge6d5] }
  8. Be2 { [%txt "Les Blancs se développent."] [%eval 0.18] }
  8... exd5 { [%txt "On échange."] [%eval 0.15] [%cal Ge6d5] }
  9. cxd5 { [%txt "Les Blancs reprennent avec le pion c."] [%eval 0.22] }
  9... Re8 { [%txt "La ligne principale de Vaisser : la tour vise le pion e4 et la colonne e."] [%eval 0.11] [%cal Ge8e4] }
  10. e5 { [%txt "Les Blancs tentent la percée."] [%eval 0.01] }
  (10. Nd2 { [%txt "Le coup prudent : le cavalier soutient e4 et vise c4."] [%eval -0.04] }
    10... Na6 { [%txt "À RETENIR.

PRO TIP : +0.17. Le cavalier vers c7 ou b4 : on soutient ...b5. Contre Nd2, l'aile dame est à nous."] [%eval 0.17] [%cal Ga6c7,Ga6b4] })
  10... dxe5 { [%txt "On prend."] [%eval 0.25] [%csl Ge5] }
  11. fxe5 { [%txt "Les Blancs reprennent."] [%eval 0.19] }
  11... Ng4 { [%txt "Le cavalier attaque e5 trois fois avec la tour et le fou."] [%eval 0.19] [%cal Gg4e5,Ge8e5,Gg7e5] }
  12. Bg5 { [%txt "Le fou attaque la dame."] [%eval -0.06] }
  12... Qb6 { [%txt "À RETENIR.

PRO TIP : 0.00. La dame attaque b2 et prépare ...Nxe5 : le grand centre blanc a explosé. Contre les Quatre Pions, ...c5 et ...e6 au plus vite."] [%eval 0.00] [%csl Re5] [%cal Gb6b2] })
5... O-O { [%txt "Le roque. Contre la Sämisch, le roi noir est en sécurité tant que la colonne h reste fermée."] [%eval 0.23] [%csl Gg8] }
6. Be3 { [%txt "Le fou soutient d4 et prépare Qd2 et Bh6 pour échanger notre fou g7."] [%eval 0.20] [%cal Re3h6] }
6... c5 { [%txt "LE LEVIER ANTI-SÄMISCH : on frappe d4 avant que le cavalier g1 soit sorti. C'est le meilleur coup du moteur (+0.14)."] [%eval 0.14] [%csl Gc5,Rd4] [%cal Gc5d4] }
(6... e5 { [%txt "Le coup classique de l'Est-Indienne, jouable mais moins précis (+0.76 contre +0.14 après 6...c5) : on garde les plans connus du chapitre 1."] [%eval 0.76] [%cal Ge5d4] }
  7. d5 { [%txt "Les Blancs ferment."] [%eval 0.72] }
  7... Nh5 { [%txt "Le cavalier libère le pion f."] [%eval 0.74] [%cal Gf7f5] }
  8. Qd2 { [%txt "La dame prépare O-O-O."] [%eval 0.70] }
  8... f5 { [%txt "La poussée f5."] [%eval 0.65] [%cal Gf5e4] }
  9. O-O-O { [%txt "Les rois sont de côtés opposés."] [%eval 0.64] }
  9... Nd7 { [%txt "À RETENIR.

PRO TIP : +0.62. Le cavalier soutient ...Ndf6 et ...f4. Position tranchante : les Blancs attaquent par g4, nous par ...a6 et ...b5."] [%eval 0.62] [%cal Gd7f6,Ga7a6] })
7. dxc5 { [%txt "Les Blancs acceptent. Le cavalier g1 n'est toujours pas sorti."] [%eval 0.10] }
(7. d5 { [%txt "Les Blancs ferment : on obtient une Benoni où leur cavalier g1 est mal placé."] [%eval 0.19] }
  7... e6 { [%txt "On frappe d5 tout de suite."] [%eval 0.16] [%cal Ge6d5] }
  8. Qd2 { [%txt "La dame se développe."] [%eval 0.23] }
  8... exd5 { [%txt "On ouvre la colonne e."] [%eval 0.18] [%cal Ge8e4] }
  9. cxd5 { [%txt "Reprise."] [%eval 0.13] }
  9... a6 { [%txt "À RETENIR.

PRO TIP : +0.17. On prépare ...b5 : contre 7.d5, l'aile dame est à nous."] [%eval 0.17] [%cal Gb7b5] })
(7. Nge2 { [%txt "Le cavalier sort enfin."] [%eval 0.12] }
  7... Nc6 { [%txt "Le cavalier attaque d4 une deuxième fois."] [%eval 0.24] [%cal Gc6d4] }
  8. d5 { [%txt "Les Blancs avancent avec gain de temps."] [%eval 0.28] }
  8... Ne5 { [%txt "Le cavalier s'installe en e5, une case forte devant le pion d6."] [%eval 0.28] [%csl Ge5] }
  9. Ng3 { [%txt "Les Blancs défendent c4 et f5."] [%eval 0.26] }
  9... e6 { [%txt "À RETENIR.

PRO TIP : +0.34. On frappe d5, le fou g7 respire."] [%eval 0.34] [%cal Ge6d5] })
7... dxc5 { [%txt "On reprend : les dames vont s'échanger."] [%eval 0.06] [%cal Gd6c5] }
8. Qxd8 { [%txt "Les Blancs échangent les dames."] [%eval 0.10] }
8... Rxd8 { [%txt "La tour prend la colonne d."] [%eval 0.22] [%cal Gd8d1] }
9. Bxc5 { [%txt "Les Blancs gagnent un pion..."] [%eval 0.21] }
9... Nc6 { [%txt "...mais nous sommes en avance de développement : le cavalier g1 et le fou f1 dorment encore."] [%eval 0.14] [%csl Rg1,Rf1] [%cal Gc6d4,Gc6b4] }
10. Nge2 { [%txt "Le cavalier sort enfin."] [%eval 0.00] }
10... b6 { [%txt "On chasse le fou c5."] [%eval 0.05] [%cal Gb6c5] }
11. Ba3 { [%txt "Le fou recule au bord."] [%eval 0.11] }
11... Ba6 { [%txt "Le fou a6 cloue le pion c4 et vise le roi blanc resté au centre. Un pion de moins, mais quasi-égalité : développement, colonnes ouvertes, fou g7 libre.

À RETENIR.

PRO TIP : la feuille de route après la théorie (+0.12).
1. Contre Nb5, ...Rd7 : la tour défend c7.
2. ...Bb7 : le fou revient sur la grande diagonale quand c4 n'est plus une cible.
3. ...a6 : on chasse le cavalier b5. Contre la Sämisch, un pion vaut moins que trois temps."] [%eval 0.12] [%csl Rc4,Re1] [%cal Ga6c4,Gg7b2] } *`,
    ),
    chapter(
      "Aléatoire surprise 1 : les coups de pion mous punis par le levier ...g4",
      `{ [%txt "ALÉATOIRE SURPRISE.

Une partie de club typique : les Blancs suivent la ligne du chapitre 1 jusqu'au coup 12, puis jouent deux coups de pion prudents : 13.h3 et 14.a3. Ils ne préparent ni c5 ni la défense de l'aile roi. Pire : le pion h3 devient un CROCHET pour notre levier ...g4.

À toi de trouver la punition. Utilise les indices dans l'ordre : 1. le principe violé, 2. la zone faible, 3. le levier de pion.

La méthode à retenir (

PRO TIP : on ne pousse pas ...g4 tout de suite. On prépare d'abord : ...Nf6 (contrôle de g4), ...h5 (deuxième soutien), puis ...g4 ouvre les colonnes g et h contre le roi blanc. Poussé trop tôt, le levier ne donne rien."] [%eval 0.33] }
1. d4 { [%txt "Le pion dame."] [%eval 0.19] }
1... Nf6 { [%txt "Le cavalier."] [%eval 0.18] [%cal Gf6e4] }
2. c4 { [%txt "L'espace."] [%eval 0.32] }
2... g6 { [%txt "Fianchetto."] [%eval 0.33] [%cal Gf8g7] }
3. Nc3 { [%txt "Le cavalier dame."] [%eval 0.29] }
3... Bg7 { [%txt "La grande diagonale."] [%eval 0.53] [%csl Gg7] }
4. e4 { [%txt "Le grand centre."] [%eval 0.55] }
4... d6 { [%txt "Le contrôle de e5."] [%eval 0.47] [%csl Ge5] }
5. Nf3 { [%txt "La Classique."] [%eval 0.53] }
5... O-O { [%txt "Le roque."] [%eval 0.50] [%csl Gg8] }
6. Be2 { [%txt "Développement."] [%eval 0.55] }
6... e5 { [%txt "La frappe sur d4."] [%eval 0.47] [%cal Ge5d4] }
7. O-O { [%txt "Le roque blanc."] [%eval 0.61] }
7... Nc6 { [%txt "Pression sur d4."] [%eval 0.67] [%cal Gc6d4] }
8. d5 { [%txt "La fermeture."] [%eval 0.68] [%csl Gd5] }
8... Ne7 { [%txt "Vers l'aile roi."] [%eval 0.64] [%cal Ge7g6] }
9. Ne1 { [%txt "Le cavalier vers d3."] [%eval 0.66] }
9... Nd7 { [%txt "Le pion f est libre."] [%eval 0.71] [%cal Gf7f5] }
10. Nd3 { [%txt "Le cavalier soutient c5."] [%eval 0.61] }
10... f5 { [%txt "La première vague."] [%eval 0.61] [%cal Gf5e4] }
11. Bd2 { [%txt "Développement."] [%eval 0.20] }
11... f4 { [%txt "La deuxième vague."] [%eval 0.68] [%csl Gf4] }
12. f3 { [%txt "Le blocage : fin du terrain connu (+0.68)."] [%eval 0.68] }
12... g5 { [%txt "La troisième vague."] [%eval 0.68] [%cal Gg5g4] }
13. h3 { [%txt "PREMIER COUP MOU : les Blancs veulent empêcher ...g4. En réalité, ils donnent une cible : le pion h3 est un crochet pour ...h5 et ...g4. Le plan c5 (b4 était le bon coup) n'avance pas : l'évaluation passe de +0.68 à +0.15."] [%hint "Les Blancs jouent un coup de pion sur l'aile où ils sont attaqués, au lieu de poursuivre leur plan c5 à l'aile dame."] [%hint "Le pion h3 : il sert de crochet. Un pion noir en g4 l'attaquera et ouvrira une colonne vers le roi."] [%hint "On prépare le levier ...g4 : d'abord les cavaliers en g6 et f6, puis ...h5."] [%hintcsl Rh3,Rg4] [%eval 0.15] [%csl Rh3] }
13... Ng6 { [%txt "Le cavalier rejoint l'aile roi et soutient ...h5-h4."] [%eval 0.10] [%cal Ge7g6,Gg6h4] }
14. a3 { [%txt "DEUXIÈME COUP MOU : a3 ne prépare rien que b4 n'aurait fait en un coup. Les Blancs ont perdu deux temps : l'évaluation passe de +0.10 à -0.48, les Noirs sont mieux."] [%hint "Deuxième coup de pion inutile : a3 ne fait rien que b4 n'aurait fait directement. Deux temps perdus dans une course d'ailes."] [%hint "L'aile roi blanche : g4 et h3 ne sont défendus que par des pions, aucune pièce blanche ne la protège."] [%hint "Nf6 ! Le cavalier contrôle g4 et h5 ; ensuite ...h5 et le levier ...g4."] [%hintcsl Rg4,Rh3] [%eval -0.48] [%csl Ra3] }
14... Nf6 { [%txt "Le cavalier contrôle g4 : c'est la première pièce du levier."] [%eval -0.37] [%cal Gf6g4,Gf6h5] }
15. Be1 { [%txt "Le fou rentre pour défendre l'aile roi (il pourra aller en f2)."] [%eval -0.46] }
15... h5 { [%txt "Le deuxième soutien : le pion h5 pousse ...g4 et ouvrira la colonne h."] [%eval -0.32] [%csl Gh5] [%cal Gh5g4,Gg5g4] }
16. a4 { [%txt "Les Blancs continuent lentement à l'aile dame."] [%eval -0.53] }
16... g4 { [%txt "LE LEVIER, préparé : g4 est soutenu par le pion h5 et le cavalier f6. Les colonnes g et h vont s'ouvrir."] [%eval -0.52] [%csl Gg4,Rh3] [%cal Gg4h3,Gg4f3] }
17. fxg4 { [%txt "Les Blancs prennent."] [%eval -0.46] }
17... hxg4 { [%txt "On reprend avec le pion h : la colonne h s'entrouvre."] [%eval -0.28] [%cal Gh5g4] }
18. hxg4 { [%txt "Les Blancs prennent encore."] [%eval -0.19] }
18... Bh6 { [%txt "Le fou sort par h6 vers g5 et e3 : il récupérera le pion g4 avec le cavalier."] [%eval -0.11] [%cal Gh6g5,Gh6e3] }
19. Bf3 { [%txt "Le fou défend g4."] [%eval -0.28] }
19... Kg7 { [%txt "Le roi libère la colonne h pour une tour : Rh8 arrive."] [%eval -0.47] [%cal Gf8h8] }
20. Bd2 { [%txt "Le fou revient en d2 pour attaquer notre pion f4 : trop lent."] [%eval -0.60] }
20... Bd7 { [%txt "Le dernier développement : la tour a8 pourra rejoindre l'aile roi."] [%eval -0.73] [%cal Ga8h8] }
21. a5 { [%txt "Les Blancs n'ont toujours pas ouvert de colonne à l'aile dame."] [%eval -0.70] }
21... a6 { [%txt "On fige l'aile dame : la poussée a6 est stoppée, b5 aussi."] [%eval -0.59] [%csl Ga6] }
22. Kf2 { [%txt "Le roi blanc tente de fuir."] [%eval -0.49] }
22... Nxg4+ { [%txt "À RETENIR.

PRO TIP : -0.40. On récupère le pion avec échec, la colonne h est ouverte et le roi blanc est exposé : c'est la position la plus facile à jouer, nos pièces attaquent, les leurs défendent. Deux coups de pion mous à l'aile roi se punissent par un levier PRÉPARÉ (...Nf6, ...h5, puis ...g4), jamais improvisé."] [%eval -0.40] [%csl Rf2] [%cal Gg4f2,Gf8h8] } *`,
    ),
    chapter(
      "Aléatoire surprise 2 : la finale d'Échange jouée sans plan",
      `{ [%txt "ALÉATOIRE SURPRISE.

On reprend le chapitre 3 jusqu'à 13...Nd7. La théorie s'arrête là. Les Blancs croient la finale nulle et jouent des coups sans plan. À chaque faute, l'échelle des 3 indices guide vers la bonne réponse :
- indice 1 : le principe violé ;
- indice 2 : la case clé (cases allumées) ;
- indice 3 : l'action concrète.

PRO TIP : la méthode. 1. Qu'a abandonné le dernier coup blanc ? 2. Quel pion blanc est devenu une cible ? 3. Quelle colonne mène au roi blanc ?"] [%eval 0.33] }
1. d4 { [%txt "Le pion dame."] [%eval 0.19] }
1... Nf6 { [%txt "Le cavalier."] [%eval 0.18] [%cal Gf6e4] }
2. c4 { [%txt "L'espace."] [%eval 0.32] }
2... g6 { [%txt "Fianchetto."] [%eval 0.33] [%cal Gf8g7] }
3. Nc3 { [%txt "Le cavalier dame."] [%eval 0.29] }
3... Bg7 { [%txt "La grande diagonale."] [%eval 0.53] [%csl Gg7] }
4. e4 { [%txt "Le grand centre."] [%eval 0.55] }
4... d6 { [%txt "Le contrôle de e5."] [%eval 0.47] [%csl Ge5] }
5. Nf3 { [%txt "La Classique."] [%eval 0.53] }
5... O-O { [%txt "Le roque."] [%eval 0.50] [%csl Gg8] }
6. Be2 { [%txt "Développement."] [%eval 0.55] }
6... e5 { [%txt "La frappe sur d4."] [%eval 0.47] [%cal Ge5d4] }
7. dxe5 { [%txt "L'échange."] [%eval 0.15] }
7... dxe5 { [%txt "Reprise."] [%eval 0.29] }
8. Qxd8 { [%txt "Les dames partent."] [%eval -0.01] }
8... Rxd8 { [%txt "La tour reprend."] [%eval -0.08] }
9. Bg5 { [%txt "Le clouage."] [%eval -0.07] }
9... Re8 { [%txt "Le clouage disparaît."] [%eval 0.00] }
10. Nd5 { [%txt "Le cavalier au centre."] [%eval -0.04] }
10... Nxd5 { [%txt "Échange."] [%eval -0.06] }
11. cxd5 { [%txt "Reprise."] [%eval -0.01] }
11... c6 { [%txt "On attaque d5."] [%eval -0.03] }
12. Bc4 { [%txt "Le fou défend."] [%eval 0.04] }
12... cxd5 { [%txt "Échange."] [%eval 0.08] }
13. Bxd5 { [%txt "Le fou reprend."] [%eval 0.07] }
13... Nd7 { [%txt "Fin de la théorie : le cavalier vise c5 et f6."] [%eval 0.07] }
14. Nh4 { [%txt "PREMIER COUP MOU : le cavalier part au bord pour viser f5, mais il abandonne la défense de e4 (14.Nd2 était le bon coup) : l'évaluation passe de +0.07 à -0.61."] [%hint "Le cavalier part sur le bord au lieu de défendre le pion e4 depuis d2."] [%hint "Le pion e4 : seul le fou d5 le défend encore. Un cavalier noir en f6 attaquera les deux à la fois."] [%hint "14...a5 : on fige l'aile dame (plus de b4), puis ...h6 et ...Nf6 iront chercher e4."] [%hintcsl Re4,Rd5] [%eval -0.61] }
14... a5 { [%txt "On fige l'aile dame : b4 n'est plus possible, la case c5 reste à nos cavaliers."] [%eval -0.72] [%csl Gc5] }
15. a4 { [%txt "Les Blancs bloquent le pion a5."] [%eval -0.66] }
15... h6 { [%txt "On chasse le fou g5."] [%eval -0.64] [%cal Gh6g5] }
16. Be3 { [%txt "Le fou recule."] [%eval -0.79] }
16... Nf6 { [%txt "Le cavalier attaque les deux à la fois : le fou d5 et le pion e4."] [%eval -0.72] [%cal Gf6d5,Gf6e4] }
17. Bb3 { [%txt "Le fou recule, et e4 n'a plus de défenseur."] [%eval -0.70] }
17... Nxe4 { [%txt "On prend le pion e4. Attention : le fou b3 cloue notre pion f7 contre le roi g8."] [%eval -0.59] [%cal Rb3g8] }
18. Rc1 { [%txt "DEUXIÈME COUP MOU : la tour prend la colonne c, mais les Blancs oublient Nxg6, qui récupérait le pion grâce au clouage de f7 : l'évaluation passe de -0.59 à -1.16."] [%hint "Les Blancs jouent un coup de tour au lieu de récupérer le pion qu'ils viennent de perdre."] [%hint "Le fou b3 : c'est lui qui cloue f7 contre le roi g8 ; tant qu'il est là, notre pion g6 est en danger."] [%hint "18...Be6 : on propose l'échange du fou b3 ; après Bxe6 Rxe6, plus de clouage, et le pion e4 gagné reste à nous."] [%hintcsl Rb3,Rg6] [%eval -1.16] }
18... Be6 { [%txt "Le fou contre le fou : le clouage va disparaître."] [%eval -1.34] [%cal Ge6b3] }
19. Bxe6 { [%txt "Les Blancs échangent."] [%eval -1.27] }
19... Rxe6 { [%txt "On reprend avec la tour, pas avec le pion : le pion f7 garde g6."] [%eval -1.42] [%csl Gf7] }
20. b3 { [%txt "TROISIÈME COUP MOU : un coup de pion avec le roi encore en e1, alors que le roque était urgent : l'évaluation passe de -1.42 à -2.55."] [%hint "Les Blancs jouent un coup de pion lent alors que leur roi est encore au centre, en e1."] [%hint "La colonne d : elle mène tout droit au roi e1, et aucune tour blanche ne la défend."] [%hint "20...Rd8 : la tour prend la colonne d, la deuxième la suivra en d6."] [%hintcsl Rd1,Re1] [%eval -2.55] }
20... Rd8 { [%txt "La tour prend la colonne d."] [%eval -2.59] [%cal Gd8d1] }
21. Rc7 { [%txt "La tour blanche entre en c7, mais trop tard."] [%eval -2.60] }
21... Red6 { [%txt "À RETENIR.

PRO TIP : -2.84. Un pion de plus, et deux tours sur la colonne d face au roi blanc resté en e1. Dans la finale d'Échange, chaque coup mou blanc se punit par une cible concrète : le pion e4 d'abord, puis la colonne d."] [%eval -2.84] [%cal Gd6d1] } *`,
    ),
  ],
};
